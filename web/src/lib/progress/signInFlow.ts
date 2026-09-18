import { readSet, solvedKey, visitedKey, writeSet } from "@/components/providers/progressStorage";
import { TransportError, type Transport } from "./api";
import {
  anonymousSummary, clearSyncedData, hasAnyData, listLocalDrafts, readOwner,
  removeLocalDraft, writeLocalDraft, writeOwner, type AnonymousSummary,
} from "./localStore";
import { LEGACY_UPDATED_AT, mergeDecision, ownerAction, resolveOnMount, unionIds, type OwnerAction } from "./merge";
import type { SyncQueue } from "./syncQueue";

export interface FlowDeps {
  storage: Storage;
  userId: string;
  course: string;
  transport: Transport;
  queue: SyncQueue;
  isKnownSandbox: (id: string) => boolean;
}

export type SignInResult = { kind: "ready" } | { kind: "ask"; summary: AnonymousSummary };

/**
 * Must run before the SyncQueue is built: on "replace" the device holds
 * another account's data (its session expired and someone else signed in),
 * and that account's unsent queue must be discarded, never sent.
 */
export function prepareDevice(storage: Storage, userId: string): OwnerAction {
  const action = ownerAction(readOwner(storage), userId);
  if (action === "replace") clearSyncedData(storage);
  return action;
}

export async function pullMarks(deps: FlowDeps): Promise<void> {
  const server = await deps.transport.getMarks(deps.course);
  writeSet(visitedKey(deps.course), new Set(unionIds(readSet(visitedKey(deps.course)), server.visited)));
  writeSet(solvedKey(deps.course), new Set(unionIds(readSet(solvedKey(deps.course)), server.solved)));
}

export async function beginSignIn(deps: FlowDeps, action: OwnerAction): Promise<SignInResult> {
  if (action === "resume") {
    await pullMarks(deps);
    return { kind: "ready" };
  }
  // "merge", or "replace" (whose data prepareDevice already cleared).
  const summary = anonymousSummary(deps.storage, deps.course, deps.isKnownSandbox);
  const server = await deps.transport.getMarks(deps.course);
  const decision = mergeDecision(hasAnyData(summary), server);
  if (decision === "ask") return { kind: "ask", summary };
  if (decision === "merge-silently") await uploadAnonymous(deps);
  await finish(deps);
  return { kind: "ready" };
}

export async function completeMerge(deps: FlowDeps, choice: "add" | "discard"): Promise<void> {
  if (choice === "add") await uploadAnonymous(deps);
  else {
    // The queue outlives this call and holds the anonymous writes in memory;
    // clearing storage alone would let it re-send them on its next flush.
    deps.queue.reset();
    clearSyncedData(deps.storage);
  }
  await finish(deps);
}

/** sync:owner is the commit marker, so it is written only after everything else. */
async function finish(deps: FlowDeps): Promise<void> {
  await pullMarks(deps);
  writeOwner(deps.storage, deps.userId);
}

async function uploadAnonymous(deps: FlowDeps): Promise<void> {
  const { course, queue, storage, transport } = deps;
  for (const id of readSet(visitedKey(course))) queue.enqueueMark({ course, kind: "visited", id });
  for (const id of readSet(solvedKey(course))) queue.enqueueMark({ course, kind: "solved", id });
  await queue.flush();
  if (queue.pendingCount() > 0) throw new TransportError(0);

  for (const { sandboxId, lang, draft } of listLocalDrafts(storage, deps.isKnownSandbox)) {
    const baseRev = queue.baseRev(sandboxId, lang);
    const out = await transport.putDraft(
      sandboxId,
      {
        lang,
        code: draft.code,
        // A draft saved before sync shipped loses every tie-break.
        updatedAt: draft.updatedAt ?? LEGACY_UPDATED_AT,
        deleted: false,
        baseRev,
      },
      // Explicit undefined: the test asserts on the call's arg count (matches
      // how SyncQueue.run forwards its own optional `opts` through).
      undefined,
    );
    if (out.kind === "error") throw new TransportError(out.status);
    if (out.kind === "ok") {
      queue.setBaseRev(sandboxId, lang, out.rev);
      continue;
    }
    const server = out.server;
    queue.setBaseRev(sandboxId, lang, server.rev);
    const resolution = resolveOnMount(draft, true, server, baseRev);
    if (resolution === "server-wins-stash-local") {
      queue.setStash(sandboxId, lang, draft);
      if (server.deleted) removeLocalDraft(storage, sandboxId, lang);
      else writeLocalDraft(storage, sandboxId, lang, server.code, server.updatedAt);
    } else if (resolution === "local-wins-stash-server") {
      queue.setStash(sandboxId, lang, { code: server.code, updatedAt: server.updatedAt, deleted: server.deleted });
      queue.enqueueDraft(sandboxId, lang, { code: draft.code, updatedAt: draft.updatedAt ?? LEGACY_UPDATED_AT, deleted: false });
    }
  }
}
