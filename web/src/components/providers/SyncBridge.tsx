"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { Transport } from "@/lib/progress/api";
import type { SyncQueue } from "@/lib/progress/syncQueue";

export interface SyncRuntime {
  userId: string;
  queue: SyncQueue;
  transport: Transport;
}

export interface SyncBridgeValue {
  authEnabled: boolean;
  /**
   * Whoever registers a runtime must do so only once the first-sign-in flow
   * is "ready". ProgressProvider enqueues every new mark on the runtime's
   * queue as soon as it is set, and the queue flushes on a timer: setting it
   * while the merge "ask" dialog is open would send this device's marks to
   * the account before the learner has chosen "discard".
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
}

const SIGNED_OUT: SyncBridgeValue = {
  authEnabled: false,
  runtime: null,
  setRuntime: () => {},
  marksEpoch: 0,
  bumpMarks: () => {},
};

const Ctx = createContext<SyncBridgeValue>(SIGNED_OUT);

/**
 * The seam between today's localStorage stores and sync. It holds only type
 * imports, so signed-out visitors download none of the sync code: the
 * signed-in runtime arrives later in a dynamic chunk and registers here.
 *
 * A 401 during a marks flush surfaces from the queue as status
 * "unauthorized", while the flow's own calls throw TransportError(0) for it
 * (as for offline); code that must tell session expiry from a dropped
 * connection reads `runtime.queue.status()`, not the error.
 */
export function SyncBridgeProvider({ authEnabled, children }: { authEnabled: boolean; children: React.ReactNode }) {
  const [runtime, setRuntime] = useState<SyncRuntime | null>(null);
  const [marksEpoch, setEpoch] = useState(0);
  const bumpMarks = useCallback(() => setEpoch((n) => n + 1), []);
  const value = useMemo(
    () => ({ authEnabled, runtime, setRuntime, marksEpoch, bumpMarks }),
    [authEnabled, runtime, marksEpoch, bumpMarks],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSyncBridge(): SyncBridgeValue {
  return useContext(Ctx);
}
