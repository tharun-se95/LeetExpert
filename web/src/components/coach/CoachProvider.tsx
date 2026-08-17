"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { diagnose } from "@/lib/coach/diagnose";
import type { Diagnosis } from "@/lib/coach/types";
import type { CaseResult, SandboxLang } from "@/components/sandbox/types";

export type ThreadItem =
  | { id: string; kind: "diagnosis"; diagnosis: Diagnosis }
  | { id: string; kind: "user"; content: string }
  | { id: string; kind: "assistant"; content: string };

interface CoachContextValue {
  sandboxId: string;
  hintLabels: string[];
  railOpen: boolean;
  setRailOpen: (open: boolean) => void;
  unread: boolean;
  clearUnread: () => void;
  thread: ThreadItem[];
  diagnosis: Diagnosis | null;
  reportRun: (input: {
    results: CaseResult[] | null;
    fatal: string | null;
    property: boolean;
  }) => void;
  setSource: (lang: SandboxLang, code: string) => void;
  send: (text: string) => Promise<void>;
  retry: () => Promise<void>;
  stop: () => void;
  clearThread: () => void;
  pending: boolean;
  error: string | null;
  configured: boolean | null;
  remaining: number | null;
  resetAt: string | null;
  mobileCoachTick: number;
  openCoach: () => void;
}

const CoachContext = createContext<CoachContextValue | null>(null);

const RAIL_KEY = "dsa:coach:rail-open";

function threadKey(sandboxId: string): string {
  return `dsa:coach:thread:${sandboxId}`;
}

function loadThread(sandboxId: string): ThreadItem[] {
  try {
    const raw = window.localStorage.getItem(threadKey(sandboxId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ThreadItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CoachProvider({
  sandboxId,
  hintLabels,
  children,
}: {
  sandboxId: string;
  hintLabels: string[];
  children: ReactNode;
}) {
  const [railOpen, setRailOpenState] = useState(false);
  const [unread, setUnread] = useState(false);
  const [thread, setThread] = useState<ThreadItem[]>([]);
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [resetAt, setResetAt] = useState<string | null>(null);
  const failCount = useRef(0);
  const source = useRef<{ lang: SandboxLang; code: string }>({
    lang: "python",
    code: "",
  });
  const lastUser = useRef<string | null>(null);
  const openedThisSession = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const [mobileCoachTick, setMobileCoachTick] = useState(0);

  useEffect(() => {
    try {
      setRailOpenState(window.localStorage.getItem(RAIL_KEY) === "1");
    } catch {
      /* private mode */
    }
    const restored = loadThread(sandboxId);
    setThread(restored);
    // The card survives a reload in the thread, so the state behind it must
    // too — otherwise chips fall back to the empty set and the next chat is
    // sent with "No diagnosis yet." while the card is still on screen.
    const lastDiagnosis = restored.findLast((i) => i.kind === "diagnosis");
    if (lastDiagnosis?.kind === "diagnosis") setDiagnosis(lastDiagnosis.diagnosis);
  }, [sandboxId]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/coach/chat")
      .then((r) => r.json() as Promise<{ configured?: boolean; remaining?: number; resetAt?: string }>)
      .then((data) => {
        if (cancelled) return;
        setConfigured(Boolean(data.configured));
        setRemaining(typeof data.remaining === "number" ? data.remaining : null);
        setResetAt(typeof data.resetAt === "string" ? data.resetAt : null);
      })
      .catch(() => {
        if (!cancelled) setConfigured(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const persistThread = useCallback((next: ThreadItem[]) => {
    try {
      window.localStorage.setItem(threadKey(sandboxId), JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, [sandboxId]);

  const clearUnread = useCallback(() => setUnread(false), []);

  const setRailOpen = useCallback((open: boolean) => {
    setRailOpenState(open);
    if (open) setUnread(false);
    try {
      window.localStorage.setItem(RAIL_KEY, open ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, []);

  const openCoach = useCallback(() => {
    if (typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches) {
      setRailOpen(!railOpen);
      return;
    }
    setUnread(false);
    setMobileCoachTick((n) => n + 1);
  }, [railOpen, setRailOpen]);

  const reportRun = useCallback(
    (input: {
      results: CaseResult[] | null;
      fatal: string | null;
      property: boolean;
    }) => {
      const failed =
        Boolean(input.fatal) ||
        (input.results !== null && input.results.some((r) => !r.passed));
      if (failed) failCount.current += 1;
      else if (input.results && input.results.every((r) => r.passed)) {
        failCount.current = 0;
      }
      const next = diagnose({
        results: input.results,
        fatal: input.fatal,
        hintCount: hintLabels.length,
        failCount: failCount.current,
        property: input.property,
      });
      setDiagnosis(next);
      setThread((prev) => {
        const item: ThreadItem = {
          id: `d-${Date.now()}`,
          kind: "diagnosis",
          diagnosis: next,
        };
        const merged = [...prev, item];
        persistThread(merged);
        return merged;
      });
      if (failed && !openedThisSession.current) {
        openedThisSession.current = true;
        if (
          typeof window !== "undefined" &&
          window.matchMedia("(min-width: 1024px)").matches
        ) {
          setRailOpen(true);
        }
      }
      if (failed && !railOpen) setUnread(true);
    },
    [hintLabels.length, persistThread, railOpen, setRailOpen],
  );

  const setSource = useCallback((lang: SandboxLang, code: string) => {
    source.current = { lang, code };
  }, []);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setPending(false);
  }, []);

  const postChat = useCallback(
    async (messages: { role: "user" | "assistant"; content: string }[]) => {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      setPending(true);
      setError(null);
      try {
        const res = await fetch("/api/coach/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          signal: ac.signal,
          body: JSON.stringify({
            sandboxId,
            lang: source.current.lang,
            code: source.current.code,
            diagnosis,
            messages,
          }),
        });
        const data = (await res.json()) as {
          reply?: string;
          remaining?: number;
          resetAt?: string;
          message?: string;
          code?: string;
        };
        if (typeof data.remaining === "number") setRemaining(data.remaining);
        if (typeof data.resetAt === "string") setResetAt(data.resetAt);
        if (!res.ok) {
          if (data.code === "coach_unconfigured") setConfigured(false);
          throw new Error(data.message ?? "Coach chat failed.");
        }
        setConfigured(true);
        const reply = data.reply ?? "";
        setThread((prev) => {
          const merged: ThreadItem[] = [
            ...prev,
            { id: `a-${Date.now()}`, kind: "assistant", content: reply },
          ];
          persistThread(merged);
          return merged;
        });
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          setError(null);
          return;
        }
        setError(err instanceof Error ? err.message : "Coach chat failed.");
      } finally {
        if (abortRef.current === ac) abortRef.current = null;
        setPending(false);
      }
    },
    [diagnosis, persistThread, sandboxId],
  );

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      lastUser.current = trimmed;
      const userItem: ThreadItem = {
        id: `u-${Date.now()}`,
        kind: "user",
        content: trimmed,
      };
      setThread((prev) => {
        const merged = [...prev, userItem];
        persistThread(merged);
        return merged;
      });
      const history = [...thread, userItem]
        .filter((i): i is Extract<ThreadItem, { kind: "user" | "assistant" }> =>
          i.kind === "user" || i.kind === "assistant",
        )
        .map((i) => ({ role: i.kind, content: i.content }));
      await postChat(history);
    },
    [persistThread, postChat, thread],
  );

  const retry = useCallback(async () => {
    if (!lastUser.current) return;
    const history = thread
      .filter((i): i is Extract<ThreadItem, { kind: "user" | "assistant" }> =>
        i.kind === "user" || i.kind === "assistant",
      )
      .map((i) => ({ role: i.kind, content: i.content }));
    if (history.length === 0 || history[history.length - 1]?.role !== "user") {
      history.push({ role: "user", content: lastUser.current });
    }
    await postChat(history);
  }, [postChat, thread]);

  const clearThread = useCallback(() => {
    setThread([]);
    setDiagnosis(null);
    failCount.current = 0;
    lastUser.current = null;
    persistThread([]);
  }, [persistThread]);

  const value = useMemo<CoachContextValue>(
    () => ({
      sandboxId,
      hintLabels,
      railOpen,
      setRailOpen,
      unread,
      clearUnread,
      thread,
      diagnosis,
      reportRun,
      setSource,
      send,
      retry,
      stop,
      clearThread,
      pending,
      error,
      configured,
      remaining,
      resetAt,
      mobileCoachTick,
      openCoach,
    }),
    [
      sandboxId,
      hintLabels,
      railOpen,
      setRailOpen,
      unread,
      clearUnread,
      thread,
      diagnosis,
      reportRun,
      setSource,
      send,
      retry,
      stop,
      clearThread,
      pending,
      error,
      configured,
      remaining,
      resetAt,
      mobileCoachTick,
      openCoach,
    ],
  );

  return <CoachContext.Provider value={value}>{children}</CoachContext.Provider>;
}

export function useCoach(): CoachContextValue {
  const ctx = useContext(CoachContext);
  if (!ctx) throw new Error("useCoach must be used inside CoachProvider");
  return ctx;
}

export function useCoachOptional(): CoachContextValue | null {
  return useContext(CoachContext);
}
