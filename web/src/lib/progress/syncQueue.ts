import type { PutOutcome, SendOpts, Transport } from "./api";
import { draftSlot, emptySyncRecord, readSyncRecord, writeSyncRecord, type PendingDraft, type SyncRecord } from "./localStore";
import { resolveOn409 } from "./merge";
import { MARK_BATCH_MAX, type DraftLang, type Mark, type Stash } from "./types";

export const MARKS_DEBOUNCE_MS = 2000;
export const DRAFTS_DEBOUNCE_MS = 1500;
export const BACKOFF_START_MS = 2000;
export const BACKOFF_MAX_MS = 60000;

export type SyncStatus = "synced" | "syncing" | "offline" | "unauthorized";

interface QueueDeps {
  storage: Storage;
  userId: string;
  transport: Transport;
  now?: () => number;
}

function parseSlot(slot: string): { sandboxId: string; lang: DraftLang } {
  const cut = slot.lastIndexOf(":");
  return { sandboxId: slot.slice(0, cut), lang: slot.slice(cut + 1) === "python" ? "python" : "javascript" };
}

export class SyncQueue {
  private record: SyncRecord;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private backoff = BACKOFF_START_MS;
  private current: SyncStatus = "synced";
  private offlineAt: number | null = null;
  private inFlight: Promise<void> | null = null;
  private disposed = false;
  private readonly listeners = new Set<() => void>();
  private readonly now: () => number;

  constructor(private readonly deps: QueueDeps) {
    this.record = readSyncRecord(deps.storage, deps.userId);
    this.now = deps.now ?? Date.now;
  }

  enqueueMark(mark: Mark): void {
    const dup = this.record.marks.some((m) => m.course === mark.course && m.kind === mark.kind && m.id === mark.id);
    if (!dup) this.record.marks.push(mark);
    this.persist();
    this.schedule(MARKS_DEBOUNCE_MS);
  }

  enqueueDraft(sandboxId: string, lang: DraftLang, draft: PendingDraft): void {
    this.record.drafts[draftSlot(sandboxId, lang)] = draft;
    this.persist();
    this.schedule(DRAFTS_DEBOUNCE_MS);
  }

  hasPendingDraft(sandboxId: string, lang: DraftLang): boolean {
    return draftSlot(sandboxId, lang) in this.record.drafts;
  }

  /** The newest edit not yet on the server; a reset shows up here as a tombstone, though storage holds nothing. */
  pendingDraft(sandboxId: string, lang: DraftLang): PendingDraft | null {
    return this.record.drafts[draftSlot(sandboxId, lang)] ?? null;
  }

  /**
   * Drops the queued write for a slot. Used when the server's copy was put in
   * the editor over this device's older one: left queued, the older draft
   * would flush with the fresh baseRev and overwrite the copy that just won.
   */
  discardDraft(sandboxId: string, lang: DraftLang): void {
    if (!this.hasPendingDraft(sandboxId, lang)) return;
    delete this.record.drafts[draftSlot(sandboxId, lang)];
    this.persist();
  }

  baseRev(sandboxId: string, lang: DraftLang): number {
    return this.record.baseRevs[draftSlot(sandboxId, lang)] ?? 0;
  }

  setBaseRev(sandboxId: string, lang: DraftLang, rev: number): void {
    this.record.baseRevs[draftSlot(sandboxId, lang)] = rev;
    this.persist();
  }

  stash(sandboxId: string, lang: DraftLang): Stash | null {
    return this.record.stashes[draftSlot(sandboxId, lang)] ?? null;
  }

  setStash(sandboxId: string, lang: DraftLang, stash: Stash | null): void {
    const slot = draftSlot(sandboxId, lang);
    if (stash) this.record.stashes[slot] = stash;
    else delete this.record.stashes[slot];
    this.persist();
  }

  pendingCount(): number {
    return this.record.marks.length + Object.keys(this.record.drafts).length;
  }

  status(): SyncStatus {
    return this.current;
  }

  offlineSince(): number | null {
    return this.offlineAt;
  }

  subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  /** Called on the browser's `online` event: skip the rest of the backoff. */
  retryNow(): void {
    if (this.current !== "offline") return;
    this.backoff = BACKOFF_START_MS;
    void this.flush();
  }

  flush(opts?: SendOpts): Promise<void> {
    if (this.inFlight) {
      // A caller asking for keepalive (the hide/pagehide flush) while a plain
      // run is already in flight can't have its opts picked up by that run —
      // it already called the transport. Wait for it, then, if the queue
      // still isn't empty, make one more attempt carrying those opts.
      return this.inFlight.then(() => {
        if (opts?.keepalive && this.pendingCount() > 0) return this.flush(opts);
      });
    }
    // Single-flight: two overlapping flushes would send the same batch twice.
    this.inFlight = this.run(opts).finally(() => {
      this.inFlight = null;
    });
    return this.inFlight;
  }

  async flushWithin(ms: number): Promise<boolean> {
    let timer: ReturnType<typeof setTimeout>;
    const timeout = new Promise<boolean>((resolve) => {
      timer = setTimeout(() => resolve(false), ms);
    });
    const done = this.flush().then(() => this.pendingCount() === 0);
    const result = await Promise.race([done, timeout]);
    // Whichever side lost the race left a timer or a dangling handler behind;
    // only the timeout side owns an actual timer, so clear it explicitly —
    // an uncleared one would still be live under fake timers in tests, and
    // is one more real timer than a page that's already navigating needs.
    clearTimeout(timer!);
    return result;
  }

  /**
   * Forgets everything this queue holds. The learner declined to add this
   * device's progress, so the in-memory copy (read once, at construction)
   * must go too: clearing only storage would leave it to be re-persisted and
   * re-sent on the next flush. Revs and stashes go with it, since they describe
   * the same discarded local drafts and a queue built after clearSyncedData
   * would start without them; a stale rev is safe anyway, because a lower
   * baseRev only earns a 409 that the conflict path already resolves.
   */
  reset(): void {
    if (this.disposed) return;
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.record = emptySyncRecord();
    // "unauthorized" is about the session, not the queue's contents, so it stays.
    if (this.current === "offline") {
      this.backoff = BACKOFF_START_MS;
      this.offlineAt = null;
      this.setStatus("synced");
    }
    this.persist();
  }

  dispose(): void {
    this.disposed = true;
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.listeners.clear();
  }

  private persist(): void {
    if (this.disposed) return;
    writeSyncRecord(this.deps.storage, this.deps.userId, this.record);
    for (const fn of this.listeners) fn();
  }

  private setStatus(next: SyncStatus): void {
    if (this.disposed) return;
    if (this.current === next) return;
    this.current = next;
    for (const fn of this.listeners) fn();
  }

  /** Arms the retry timer unconditionally — used by `fail()`, which must be
   * able to (re)schedule its own backoff even while `status` is already
   * "offline", when `schedule()` itself would refuse to touch the timer. */
  private setTimer(ms: number): void {
    if (this.disposed) return;
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.timer = null;
      void this.flush();
    }, ms);
  }

  private schedule(ms: number): void {
    if (this.disposed) return;
    // While offline (or signed out), the backoff timer set by `fail()` is
    // the only thing allowed to control the next attempt. Letting a plain
    // enqueue reset it to a 1.5-2 s debounce would mean the retry cadence
    // never actually backs off as long as the learner keeps typing or
    // visiting lessons.
    if (this.current === "unauthorized" || this.current === "offline") return;
    this.setTimer(ms);
  }

  private fail(status: number): void {
    if (this.disposed) return;
    if (status === 401) {
      // Keep the queue: the same learner signing back in resumes it.
      this.setStatus("unauthorized");
      return;
    }
    this.offlineAt ??= this.now();
    this.setStatus("offline");
    this.setTimer(this.backoff);
    this.backoff = Math.min(this.backoff * 2, BACKOFF_MAX_MS);
  }

  /**
   * Sends one mark batch. A 400 can only mean one of the ids in it is
   * malformed in a way the client can't detect ahead of time; bisecting
   * isolates that id to its own request instead of failing every mark that
   * happened to share a batch with it. Returns "stop" when a real failure
   * (network/5xx/401) means the caller must not try the next batch either.
   */
  private async sendMarks(course: string, batch: Mark[], opts?: SendOpts): Promise<"ok" | "stop"> {
    if (this.disposed) return "stop";
    let status: number;
    try {
      status = await this.deps.transport.postMarks(course, batch.map(({ kind, id }) => ({ kind, id })), opts);
    } catch (err) {
      console.error("[sync] postMarks threw", err);
      if (this.disposed) return "stop";
      this.fail(0);
      return "stop";
    }
    if (this.disposed) return "stop";
    if (status === 204) {
      this.record.marks = this.record.marks.filter((m) => !batch.includes(m));
      this.persist();
      return "ok";
    }
    if (status === 400) {
      if (batch.length === 1) {
        console.error("[sync] mark rejected", batch[0]);
        this.record.marks = this.record.marks.filter((m) => !batch.includes(m));
        this.persist();
        return "ok";
      }
      const mid = Math.ceil(batch.length / 2);
      const first = await this.sendMarks(course, batch.slice(0, mid), opts);
      if (first === "stop") return "stop";
      return this.sendMarks(course, batch.slice(mid), opts);
    }
    this.fail(status);
    return "stop";
  }

  private async run(opts?: SendOpts): Promise<void> {
    if (this.disposed || this.current === "unauthorized" || this.pendingCount() === 0) return;
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.setStatus("syncing");

    while (this.record.marks.length > 0) {
      if (this.disposed) return;
      const course = this.record.marks[0]!.course;
      const batch = this.record.marks.filter((m) => m.course === course).slice(0, MARK_BATCH_MAX);
      const result = await this.sendMarks(course, batch, opts);
      if (result === "stop") return;
    }

    for (const slot of Object.keys(this.record.drafts)) {
      if (this.disposed) return;
      for (let attempt = 0; attempt < 2; attempt++) {
        if (this.disposed) return;
        const pending = this.record.drafts[slot];
        if (!pending) break;
        const { sandboxId, lang } = parseSlot(slot);
        const body = { lang, ...pending, baseRev: this.record.baseRevs[slot] ?? 0 };
        let out: PutOutcome;
        try {
          out = await this.deps.transport.putDraft(sandboxId, body, opts);
        } catch (err) {
          console.error("[sync] putDraft threw", slot, err);
          if (this.disposed) return;
          return this.fail(0);
        }
        if (this.disposed) return;
        if (out.kind === "ok") {
          this.record.baseRevs[slot] = out.rev;
          // Identity check: an edit that arrived during the request is newer
          // than what was sent and must stay queued.
          if (this.record.drafts[slot] === pending) delete this.record.drafts[slot];
          this.persist();
          break;
        }
        if (out.kind === "conflict") {
          // The slot changed while this request was out: the sandbox's pull
          // discarded the draft (server copy taken) or a newer edit replaced
          // it. The 409 describes a draft that is gone, so stashing its server
          // copy would overwrite the learner's own stash with what the editor
          // already shows. Re-read the slot instead (a newer edit is re-sent).
          if (this.record.drafts[slot] !== pending) continue;
          this.record.baseRevs[slot] = out.server.rev;
          if (resolveOn409(pending, out.server) === "adopt-rev") {
            if (this.record.drafts[slot] === pending) delete this.record.drafts[slot];
            this.persist();
            break;
          }
          this.record.stashes[slot] = { code: out.server.code, updatedAt: out.server.updatedAt, deleted: out.server.deleted };
          this.persist();
          continue;
        }
        if (out.status === 400) {
          console.error("[sync] draft rejected", slot);
          // Same identity check as the "ok" branch: a newer edit that
          // arrived while this request was in flight must not be dropped
          // just because the version the server saw was bad.
          if (this.record.drafts[slot] === pending) delete this.record.drafts[slot];
          this.persist();
          break;
        }
        return this.fail(out.status);
      }
    }

    if (this.disposed) return;
    this.backoff = BACKOFF_START_MS;
    this.offlineAt = null;
    this.setStatus(this.pendingCount() === 0 ? "synced" : "syncing");
    // Something arrived (a mid-flight edit, or a draft that exhausted its two
    // conflict attempts) after the loops above had already decided not to
    // touch it, and no timer is running to pick it up. Without this, the
    // queue is stuck reporting "syncing" forever with real work pending.
    if (this.pendingCount() > 0 && !this.timer) this.schedule(DRAFTS_DEBOUNCE_MS);
  }
}
