"use client";

import { useEffect, useRef, useState } from "react";
import sandboxIds from "@/lib/sandbox/sandboxIds.generated.json";
import { MergePromptDialog } from "@/components/auth/MergePromptDialog";
import { useSyncBridge } from "@/components/providers/SyncBridge";
import { httpTransport, TransportError } from "@/lib/progress/api";
import type { AnonymousSummary } from "@/lib/progress/localStore";
import { reloadPage } from "@/lib/progress/reloadPage";
import { beginSignIn, completeMerge, prepareDevice, type FlowDeps } from "@/lib/progress/signInFlow";
import { BACKOFF_MAX_MS, BACKOFF_START_MS, SyncQueue } from "@/lib/progress/syncQueue";
import { AUTH_CHANNEL, SYNCED_COURSE } from "@/lib/progress/types";

const KNOWN = new Set<string>(sandboxIds);
const OFFLINE_MESSAGE = "Couldn't reach the server. Check your connection and try again.";

type Choose = (choice: "add" | "discard") => Promise<void>;

/**
 * Loaded only once a session exists (next/dynamic in AccountRuntime), so
 * signed-out visitors never download the queue, the merge rules or zod.
 * AccountRuntime keys it by user id, so a user change remounts it: its
 * cleanup disposes the old queue and its state starts clean.
 */
export default function SyncProvider({ userId }: { userId: string }) {
  const { setRuntime, bumpMarks } = useSyncBridge();
  const [ask, setAsk] = useState<AnonymousSummary | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chooseRef = useRef<Choose | null>(null);

  useEffect(() => {
    const storage = window.localStorage;
    // Once per mount: on "replace" this clears the other learner's data, and a
    // second call would then find no owner and answer "merge" for a device
    // that was just replaced.
    const action = prepareDevice(storage, userId);

    let flow: FlowDeps;
    let live = false;
    let cancelled = false;
    let running = false;
    // The flow got an answer (ready or ask). Only a failed flow retries.
    let settled = false;
    // The session is gone: retrying only earns another 401. The learner's
    // data stays on disk and the next sign-in's flow picks it up.
    let expired = false;
    let registered = false;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let backoff = BACKOFF_START_MS;

    // A disposed queue is dead, so every attempt after a failure builds a new
    // one from storage, which holds anything the old one had persisted.
    const build = () => {
      const queue = new SyncQueue({ storage, userId, transport: httpTransport });
      flow = {
        storage, userId, course: SYNCED_COURSE, transport: httpTransport, queue,
        isKnownSandbox: (id) => KNOWN.has(id),
      };
      live = true;
    };
    const drop = () => {
      if (!live) return;
      flow.queue.dispose();
      live = false;
    };
    const stop = () => {
      drop();
      registered = false;
      setRuntime(null);
    };

    // beginSignIn and completeMerge end in pullMarks, which only writes
    // localStorage: without a bump the UI keeps showing the pre-pull marks.
    // Routed through here so no caller can forget it; the finally covers a
    // flow that wrote storage and then threw.
    const bumpAfter = async <T,>(op: Promise<T>): Promise<T> => {
      try {
        return await op;
      } finally {
        bumpMarks();
      }
    };

    // Registering is what makes ProgressProvider start enqueueing, so it
    // happens only once the flow says "ready" (or a merge choice completed):
    // registered during the prompt, a queued mark could reach the account
    // before "Don't add" was possible.
    const register = () => {
      registered = true;
      setRuntime({ userId, queue: flow.queue, transport: httpTransport });
      void flow.queue.flush();
    };

    // Tells an expired session from a dropped connection. Flow calls that hit
    // the API directly carry the real status; a queue flush inside the flow
    // collapses 401 and offline alike to TransportError(0), so the queue's
    // own status is the signal there. Read before the queue is disposed.
    const failed = (err: unknown): "expired" | "offline" => {
      const unauthorized = err instanceof TransportError && err.status === 401;
      const kind = unauthorized || (live && flow.queue.status() === "unauthorized") ? "expired" : "offline";
      // Any thrown flow error leaves no runtime to serve, so the queue goes.
      drop();
      if (kind === "expired") expired = true;
      return kind;
    };

    const scheduleRetry = () => {
      if (retryTimer || cancelled) return;
      retryTimer = setTimeout(() => {
        retryTimer = null;
        void start();
      }, backoff);
      backoff = Math.min(backoff * 2, BACKOFF_MAX_MS);
    };

    async function start(): Promise<void> {
      if (cancelled || expired || settled || running) return;
      running = true;
      build();
      try {
        const result = await bumpAfter(beginSignIn(flow, action));
        if (cancelled) return;
        settled = true;
        if (result.kind === "ask") setAsk(result.summary);
        else register();
      } catch (err) {
        if (cancelled) return;
        // Offline leaves sync:owner unwritten, so the flow reruns.
        if (failed(err) === "offline") scheduleRetry();
      } finally {
        running = false;
      }
    }

    const choose: Choose = async (choice) => {
      if (running || cancelled) return;
      running = true;
      setBusy(true);
      setError(null);
      if (!live) build();
      try {
        await bumpAfter(completeMerge(flow, choice));
        if (cancelled) return;
        setAsk(null);
        register();
      } catch (err) {
        if (cancelled) return;
        if (failed(err) === "expired") setAsk(null);
        else setError(OFFLINE_MESSAGE);
      } finally {
        running = false;
        if (!cancelled) setBusy(false);
      }
    };
    chooseRef.current = choose;

    void start();

    const onHide = () => {
      if (registered && document.visibilityState === "hidden") void flow.queue.flush({ keepalive: true });
    };
    const onOnline = () => {
      if (expired) return;
      if (!settled) {
        if (retryTimer) clearTimeout(retryTimer);
        retryTimer = null;
        backoff = BACKOFF_START_MS;
        void start();
      } else if (registered) {
        flow.queue.retryNow();
      }
    };

    const channel = typeof BroadcastChannel === "undefined" ? null : new BroadcastChannel(AUTH_CHANNEL);
    if (channel) {
      // Another tab signed out and cleared storage; this tab's in-memory state
      // is the last learner's, and a reload is the one reset that covers all
      // of it. Stopping first keeps the dying queue from flushing meanwhile.
      channel.onmessage = (e: MessageEvent) => {
        if (e.data !== "signed-out") return;
        stop();
        reloadPage();
      };
    }
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("online", onOnline);

    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("online", onOnline);
      channel?.close();
      chooseRef.current = null;
      stop();
    };
  }, [userId, setRuntime, bumpMarks]);

  return (
    <MergePromptDialog
      summary={ask}
      busy={busy}
      error={error}
      onChoose={(c) => void chooseRef.current?.(c)}
      // Not a choice: see MergePromptDialog. Ignored mid-request so a stray Esc
      // cannot close the dialog over a completeMerge that is still running.
      onDismiss={() => {
        if (!busy) {
          setAsk(null);
          setError(null);
        }
      }}
    />
  );
}
