"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSyncBridge, type SyncRuntime } from "@/components/providers/SyncBridge";
import { readLocalDraft, removeLocalDraft, writeLocalDraft, type PendingDraft } from "@/lib/progress/localStore";
import { LEGACY_UPDATED_AT, resolveOnMount } from "@/lib/progress/merge";
import { DRAFT_LANGS, type DraftLang, type LocalDraft, type ServerDraft, type Stash } from "@/lib/progress/types";

type Stashes = Partial<Record<DraftLang, Stash>>;

export interface DraftSyncApi {
  stashes: Stashes;
  recordEdit(lang: DraftLang, code: string, at: string): void;
  recordReset(lang: DraftLang): void;
  takeStash(lang: DraftLang, current: string): Stash | null;
  dismiss(lang: DraftLang): void;
}

// One shared object, so a sandbox with no runtime never sees a new identity.
const NO_STASHES: Stashes = {};

function sameStashes(a: Stashes, b: Stashes): boolean {
  return DRAFT_LANGS.every((lang) => {
    const x = a[lang];
    const y = b[lang];
    if (!x || !y) return x === y;
    return x.code === y.code && x.updatedAt === y.updatedAt && x.deleted === y.deleted;
  });
}

/**
 * Storage alone cannot say what the learner last did: a reset removes the
 * draft from storage but leaves a tombstone queued, and reading storage would
 * call that "no local draft" and let an older server copy back in. So the
 * queued edit is the local copy whenever it is newer, or storage has nothing.
 */
function effectiveLocal(stored: LocalDraft | null, pending: PendingDraft | null): LocalDraft | null {
  if (!pending) return stored;
  if (!stored) return pending;
  const pendingAt = Date.parse(pending.updatedAt);
  const storedAt = Date.parse(stored.updatedAt ?? LEGACY_UPDATED_AT);
  return pendingAt > storedAt ? pending : stored;
}

export function useDraftSync({
  sandboxId,
  enabled,
  applyRemote,
}: {
  sandboxId: string;
  enabled: boolean;
  applyRemote: (lang: DraftLang, code: string | null) => void;
}): DraftSyncApi {
  const { runtime } = useSyncBridge();
  const active = enabled ? runtime : null;
  const [state, setStashes] = useState<Stashes>(NO_STASHES);

  // The callbacks below read the runtime through this ref, not a closure: a
  // runtime that was replaced or disposed (sign-out, another user, a transport
  // failure) must never receive a write from a callback the editor still holds.
  const activeRef = useRef<SyncRuntime | null>(null);
  useEffect(() => {
    activeRef.current = active;
    return () => {
      activeRef.current = null;
    };
  }, [active]);

  // The pull below must not re-run because the caller's applyRemote changed
  // identity; it applies through the latest one.
  const applyRef = useRef(applyRemote);
  useEffect(() => {
    applyRef.current = applyRemote;
  });

  useEffect(() => {
    if (!active) {
      setStashes((prev) => (prev === NO_STASHES ? prev : NO_STASHES));
      return;
    }
    const read = () => {
      const next: Stashes = {};
      for (const lang of DRAFT_LANGS) {
        const stash = active.queue.stash(sandboxId, lang);
        if (stash) next[lang] = stash;
      }
      setStashes((prev) => (sameStashes(prev, next) ? prev : next));
    };
    read();
    return active.queue.subscribe(read);
  }, [active, sandboxId]);

  useEffect(() => {
    if (!active) return;
    const { queue, transport } = active;
    const storage = window.localStorage;
    let cancelled = false;

    const takeServer = (lang: DraftLang, server: ServerDraft) => {
      if (server.deleted) removeLocalDraft(storage, sandboxId, lang);
      else writeLocalDraft(storage, sandboxId, lang, server.code, server.updatedAt);
      applyRef.current(lang, server.deleted ? null : server.code);
    };

    transport
      .getDrafts(sandboxId)
      .then((server) => {
        if (cancelled) return;
        // Everything below reads storage and the queue now, after the round
        // trip, so an edit typed while the request was in flight is judged
        // against the server copy instead of being overwritten by it.
        for (const lang of DRAFT_LANGS) {
          const remote = server[lang] ?? null;
          const pending = queue.pendingDraft(sandboxId, lang);
          const local = effectiveLocal(readLocalDraft(storage, sandboxId, lang), pending);
          const baseRev = queue.baseRev(sandboxId, lang);
          // Never synced from this device (baseRev 0) counts as a local change.
          const dirty = pending !== null || (baseRev === 0 && local !== null);
          if (!remote) {
            if (dirty && local && !pending) {
              queue.enqueueDraft(sandboxId, lang, {
                code: local.code,
                updatedAt: local.updatedAt ?? LEGACY_UPDATED_AT,
                deleted: local.deleted,
              });
            }
            continue;
          }
          const resolution = resolveOnMount(local, dirty, remote, baseRev);
          if (resolution === "keep-local") continue;
          queue.setBaseRev(sandboxId, lang, remote.rev);
          if (resolution === "take-server") {
            takeServer(lang, remote);
          } else if (resolution === "adopt-rev") {
            // The server already holds this content; a queued copy would only
            // rewrite it.
            queue.discardDraft(sandboxId, lang);
          } else if (resolution === "local-wins-stash-server") {
            queue.setStash(sandboxId, lang, { code: remote.code, updatedAt: remote.updatedAt, deleted: remote.deleted });
            if (local) {
              queue.enqueueDraft(sandboxId, lang, {
                code: local.code,
                updatedAt: local.updatedAt ?? LEGACY_UPDATED_AT,
                deleted: local.deleted,
              });
            }
          } else {
            // Stash before taking the server copy: this is the only place the
            // learner's version survives.
            if (local) queue.setStash(sandboxId, lang, local);
            takeServer(lang, remote);
            // Left queued, the older draft would flush with the fresh baseRev
            // and overwrite the copy that just won.
            queue.discardDraft(sandboxId, lang);
          }
        }
      })
      // Offline: the local draft stays; the next mount or edit tries again.
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [active, sandboxId]);

  const recordEdit = useCallback(
    (lang: DraftLang, code: string, at: string) => {
      activeRef.current?.queue.enqueueDraft(sandboxId, lang, { code, updatedAt: at, deleted: false });
    },
    [sandboxId],
  );

  const recordReset = useCallback(
    (lang: DraftLang) => {
      activeRef.current?.queue.enqueueDraft(sandboxId, lang, { code: "", updatedAt: new Date().toISOString(), deleted: true });
    },
    [sandboxId],
  );

  const takeStash = useCallback(
    (lang: DraftLang, current: string): Stash | null => {
      const runtimeNow = activeRef.current;
      const stash = runtimeNow?.queue.stash(sandboxId, lang) ?? null;
      if (!runtimeNow || !stash) return null;
      // The displaced code becomes the stash, so "Use that version" is
      // reversible until the learner dismisses it.
      runtimeNow.queue.setStash(sandboxId, lang, { code: current, updatedAt: new Date().toISOString(), deleted: false });
      return stash;
    },
    [sandboxId],
  );

  const dismiss = useCallback(
    (lang: DraftLang) => {
      activeRef.current?.queue.setStash(sandboxId, lang, null);
    },
    [sandboxId],
  );

  const stashes = active ? state : NO_STASHES;
  return useMemo(
    () => ({ stashes, recordEdit, recordReset, takeStash, dismiss }),
    [stashes, recordEdit, recordReset, takeStash, dismiss],
  );
}
