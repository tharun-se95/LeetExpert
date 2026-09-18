import { anonymousSummary, clearSyncedData, hasAnyData, readOwner, type AnonymousSummary } from "@/lib/progress/localStore";
import type { SyncQueue, SyncStatus } from "@/lib/progress/syncQueue";
import { SYNCED_COURSE } from "@/lib/progress/types";

export const SIGN_OUT_FLUSH_MS = 3000;
/** Outside the `sync:` prefix on purpose: clearSyncedData must not remove it. */
export const SIGNOUT_PENDING_KEY = "signout-pending";
const WARN_AFTER_MS = 5 * 60_000;

/**
 * A sign-out this device cleared for but could not finish. It names the
 * session it was for: the flag outlives the tab, and a session the learner
 * opens afterwards (the old one expired, or another account signed in) must
 * not be ended by a request that was never about it.
 */
export interface PendingSignOut {
  /** The session that was signed out; null when the caller could not name it. */
  session: string | null;
  /** Fallback identity when no session id is known: the account, from the caller or `sync:owner`. */
  user: string | null;
  /** The retry has to revoke every session again, not just this one. */
  everywhere: boolean;
}

/** Identity of the session that is signed in right now. */
export interface SessionIdentity {
  sessionId: string;
  userId: string;
}

function isPendingSignOut(v: unknown): v is PendingSignOut {
  if (typeof v !== "object" || v === null) return false;
  const session: unknown = Reflect.get(v, "session");
  const user: unknown = Reflect.get(v, "user");
  return (session === null || typeof session === "string")
    && (user === null || typeof user === "string")
    && typeof Reflect.get(v, "everywhere") === "boolean";
}

/**
 * The plain "1" a build of this branch wrote before the flag carried an
 * identity, and anything unreadable, name no session: they are still finished
 * (a plain sign-out), as they always were, rather than left as a live session
 * on a device that was cleared.
 */
export function readPendingSignOut(storage: Storage): PendingSignOut | null {
  let raw: string | null;
  try {
    raw = storage.getItem(SIGNOUT_PENDING_KEY);
  } catch {
    return null;
  }
  if (raw === null) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (isPendingSignOut(parsed)) return parsed;
  } catch {
    /* not JSON: the legacy value */
  }
  return { session: null, user: null, everywhere: false };
}

/** Whether the pending sign-out was for the session that is signed in now. */
export function pendingSignOutApplies(pending: PendingSignOut, now: SessionIdentity): boolean {
  if (pending.session !== null) return pending.session === now.sessionId;
  if (pending.user !== null) return pending.user === now.userId;
  return true;
}

export interface SignOutDeps {
  queue: SyncQueue | null;
  endSession: () => Promise<void>;
  storage: Storage;
  broadcast: (msg: "signed-out") => void;
  flushMs?: number;
  /**
   * Stops the sign-in flow that may still be running. Called after the flush
   * (a flow cut short earlier would leave marks unsent) and before the clear
   * (a flow finishing later would write sync:owner and marks back into the
   * device that was just emptied).
   */
  abort?: () => void;
  /** Sandbox ids that sync; a draft of any other sandbox never leaves the device, so it is not "unmerged". */
  isKnownSandbox?: (id: string) => boolean;
  /** The learner has been told what is on this device and chose to lose it. */
  discardUnmerged?: boolean;
  /** The signed-in session, so an unfinished sign-out can say which one it was for. */
  session?: SessionIdentity;
  /** Sign out everywhere: kept in the pending flag so the retry revokes again. */
  everywhere?: boolean;
}

/**
 * With no queue, nothing this device holds has been added to the account or
 * thrown away by the learner: the merge prompt was dismissed, or sign-in is
 * still failing (spec §7). Signing out would delete that progress with no way
 * to get it back, so the caller has to ask first. With a queue, the writes are
 * in it and the flush below sends them.
 */
export function unmergedProgress(deps: Pick<SignOutDeps, "queue" | "storage" | "isKnownSandbox">): AnonymousSummary | null {
  if (deps.queue) return null;
  const summary = anonymousSummary(deps.storage, SYNCED_COURSE, deps.isKnownSandbox ?? (() => true));
  return hasAnyData(summary) ? summary : null;
}

/**
 * Resolves `blocked` without changing anything when unmerged progress needs
 * the learner's confirmation; call again with `discardUnmerged: true` to go on.
 */
export async function signOutDevice(deps: SignOutDeps): Promise<{ unsynced: boolean; blocked?: AnonymousSummary }> {
  if (!deps.discardUnmerged) {
    const blocked = unmergedProgress(deps);
    if (blocked) return { unsynced: false, blocked };
  }
  // Writes must go first: once the session ends the API rejects them. The
  // cap keeps sign-out working on a dead network.
  // Read before the clear below removes sync:owner.
  const owner = deps.session?.userId ?? readOwner(deps.storage);
  const flushed = deps.queue ? await deps.queue.flushWithin(deps.flushMs ?? SIGN_OUT_FLUSH_MS) : true;
  deps.abort?.();
  let ended = true;
  try {
    await deps.endSession();
  } catch {
    ended = false;
  }
  // A mark can be enqueued after the flush finished (the session call takes a
  // network round trip); the clear below drops it, so the learner must be told.
  const leftBehind = deps.queue ? deps.queue.pendingCount() > 0 : false;
  deps.queue?.dispose();
  clearSyncedData(deps.storage);
  if (!ended) {
    try {
      const pending: PendingSignOut = { session: deps.session?.sessionId ?? null, user: owner, everywhere: deps.everywhere ?? false };
      deps.storage.setItem(SIGNOUT_PENDING_KEY, JSON.stringify(pending));
    } catch {
      /* storage unavailable: nothing more this device can do */
    }
  }
  // Last, so a tab that reloads on this message finds an empty device.
  deps.broadcast("signed-out");
  return { unsynced: !flushed || leftBehind };
}

export function syncWarning(status: SyncStatus, offlineSince: number | null, pending: number, now: number): boolean {
  if (status === "unauthorized") return true;
  return status === "offline" && pending > 0 && offlineSince !== null && now - offlineSince >= WARN_AFTER_MS;
}
