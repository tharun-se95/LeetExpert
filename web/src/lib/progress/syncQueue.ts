import type { SendOpts, Transport } from "./api";
import { draftSlot, readSyncRecord, writeSyncRecord, type PendingDraft, type SyncRecord } from "./localStore";
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
    // Single-flight: two overlapping flushes would send the same batch twice.
    this.inFlight ??= this.run(opts).finally(() => {
      this.inFlight = null;
    });
    return this.inFlight;
  }

  async flushWithin(ms: number): Promise<boolean> {
    const timeout = new Promise<boolean>((resolve) => setTimeout(() => resolve(false), ms));
    const done = this.flush().then(() => this.pendingCount() === 0);
    return Promise.race([done, timeout]);
  }

  dispose(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.listeners.clear();
  }

  private persist(): void {
    writeSyncRecord(this.deps.storage, this.deps.userId, this.record);
    for (const fn of this.listeners) fn();
  }

  private setStatus(next: SyncStatus): void {
    if (this.current === next) return;
    this.current = next;
    for (const fn of this.listeners) fn();
  }

  private schedule(ms: number): void {
    if (this.current === "unauthorized") return;
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.timer = null;
      void this.flush();
    }, ms);
  }

  private fail(status: number): void {
    if (status === 401) {
      // Keep the queue: the same learner signing back in resumes it.
      this.setStatus("unauthorized");
      return;
    }
    this.offlineAt ??= this.now();
    this.setStatus("offline");
    this.schedule(this.backoff);
    this.backoff = Math.min(this.backoff * 2, BACKOFF_MAX_MS);
  }

  private async run(opts?: SendOpts): Promise<void> {
    if (this.current === "unauthorized" || this.pendingCount() === 0) return;
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.setStatus("syncing");

    while (this.record.marks.length > 0) {
      const course = this.record.marks[0]!.course;
      const batch = this.record.marks.filter((m) => m.course === course).slice(0, MARK_BATCH_MAX);
      const status = await this.deps.transport.postMarks(course, batch.map(({ kind, id }) => ({ kind, id })), opts);
      if (status === 204 || status === 400) {
        // A 400 can only come from a bug; retrying it forever would block
        // every later write behind it.
        if (status === 400) console.error("[sync] marks rejected", batch);
        this.record.marks = this.record.marks.filter((m) => !batch.includes(m));
        this.persist();
        continue;
      }
      return this.fail(status);
    }

    for (const slot of Object.keys(this.record.drafts)) {
      for (let attempt = 0; attempt < 2; attempt++) {
        const pending = this.record.drafts[slot];
        if (!pending) break;
        const { sandboxId, lang } = parseSlot(slot);
        const body = { lang, ...pending, baseRev: this.record.baseRevs[slot] ?? 0 };
        const out = await this.deps.transport.putDraft(sandboxId, body, opts);
        if (out.kind === "ok") {
          this.record.baseRevs[slot] = out.rev;
          // Identity check: an edit that arrived during the request is newer
          // than what was sent and must stay queued.
          if (this.record.drafts[slot] === pending) delete this.record.drafts[slot];
          this.persist();
          break;
        }
        if (out.kind === "conflict") {
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
          delete this.record.drafts[slot];
          this.persist();
          break;
        }
        return this.fail(out.status);
      }
    }

    this.backoff = BACKOFF_START_MS;
    this.offlineAt = null;
    this.setStatus(this.pendingCount() === 0 ? "synced" : "syncing");
  }
}
