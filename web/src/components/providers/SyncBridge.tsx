"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import type { Transport } from "@/lib/progress/api";
import type { SyncQueue } from "@/lib/progress/syncQueue";

export interface SyncRuntime {
  userId: string;
  queue: SyncQueue;
  transport: Transport;
}

/**
 * Why a signed-in learner is not syncing while no runtime is registered
 * (with one, the queue's own status says it). "paused": the merge prompt was
 * dismissed. "offline": the sign-in flow is retrying. "expired": the session
 * is gone. "failed": an error a retry cannot fix.
 */
export type SyncIssue = "paused" | "offline" | "expired" | "failed";

export interface SyncBridgeValue {
  authEnabled: boolean;
  /**
   * Whoever registers a runtime must do so only once the first-sign-in flow
   * is "ready". ProgressProvider enqueues every new mark on the runtime's
   * queue as soon as it is set, and the queue flushes on a timer: setting it
   * while the merge "ask" dialog is open would send this device's marks to
   * the account before the learner has chosen "discard".
   *
   * Marks made before the runtime registers (VisitTracker fires on mount,
   * ahead of the dynamic chunk) are written to storage but not enqueued, and
   * a repeat visit is skipped once the runtime exists because storage already
   * holds it. They are not lost only because the "resume" flow queues every
   * local mark the server lacks (`pullMarks` with `uploadLocalOnly`). Any
   * other registration path must do the same, and a mark made after
   * `queue.dispose()` is likewise recovered only by the next sign-in flow.
   */
  runtime: SyncRuntime | null;
  /**
   * The registrant owns the queue's lifetime: pass null (and dispose() the
   * queue) on sign-out, and dispose() it when a flow call throws
   * TransportError. This context never disposes on its own, because it only
   * holds the runtime after the flow succeeded.
   */
  setRuntime(runtime: SyncRuntime | null): void;
  /**
   * Bumped after a pull writes localStorage, so readers re-read it. pullMarks
   * only writes storage; without a bump the UI keeps showing pre-pull marks.
   */
  marksEpoch: number;
  bumpMarks(): void;
  /** Read by the account menu; written only by the sync runtime. */
  issue: SyncIssue | null;
  setIssue(issue: SyncIssue | null): void;
  /**
   * Sign-out stops the sign-in flow through this. A ref, not state: the
   * runtime is not registered yet in exactly the case that matters (a flow
   * still running), and registering a handle must not re-render anything.
   */
  registerAbort(abort: (() => void) | null): void;
  abortSync(): void;
}

const SIGNED_OUT: SyncBridgeValue = {
  authEnabled: false,
  runtime: null,
  setRuntime: () => {},
  marksEpoch: 0,
  bumpMarks: () => {},
  issue: null,
  setIssue: () => {},
  registerAbort: () => {},
  abortSync: () => {},
};

const Ctx = createContext<SyncBridgeValue>(SIGNED_OUT);

/**
 * The seam between today's localStorage stores and sync. It holds only type
 * imports, so signed-out visitors download none of the sync code: the
 * signed-in runtime arrives later in a dynamic chunk and registers here.
 *
 * Telling an expired session (401) from a dropped connection depends on the
 * path, because the transport reports them differently:
 * - Flow calls that hit the API directly (getMarks, and the putDraft calls in
 *   beginSignIn/completeMerge) throw TransportError carrying the real status,
 *   so `err.status === 401` works. No runtime is registered yet at that point,
 *   so there is no queue status to read.
 * - Marks sent through a queue flush collapse to TransportError(0) in
 *   uploadAnonymous ("still pending after the flush"), for 401 and offline
 *   alike; only `queue.status() === "unauthorized"` tells them apart, and only
 *   for a queue you hold. After registration the queue is the signal.
 */
export function SyncBridgeProvider({ authEnabled, children }: { authEnabled: boolean; children: React.ReactNode }) {
  const [runtime, setRuntime] = useState<SyncRuntime | null>(null);
  const [marksEpoch, setEpoch] = useState(0);
  const bumpMarks = useCallback(() => setEpoch((n) => n + 1), []);
  const [issue, setIssue] = useState<SyncIssue | null>(null);
  const abortRef = useRef<(() => void) | null>(null);
  const registerAbort = useCallback((abort: (() => void) | null) => {
    abortRef.current = abort;
  }, []);
  const abortSync = useCallback(() => abortRef.current?.(), []);
  const value = useMemo(
    () => ({ authEnabled, runtime, setRuntime, marksEpoch, bumpMarks, issue, setIssue, registerAbort, abortSync }),
    [authEnabled, runtime, marksEpoch, bumpMarks, issue, registerAbort, abortSync],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSyncBridge(): SyncBridgeValue {
  return useContext(Ctx);
}
