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
  open: boolean;
  setOpen: (open: boolean) => void;
  /** Closes the panel AND returns focus to the launcher. */
  closeCoach: () => void;
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
  /** Whether asking again could plausibly change the outcome. */
  retryable: boolean;
  configured: boolean | null;
  remaining: number | null;
  resetAt: string | null;
  mobileCoachTick: number;
  /** Flips the rail — for controls that report their own aria-expanded. */
  toggleCoach: () => void;
  /** Open-only, for controls whose label promises to open it. */
  openCoach: () => void;
  /**
   * CoachRail (desktop variant only) calls this with its composer wrapper
   * element so this provider can focus the textarea inside it — see the
   * effect on `focusRequest` below for why the focus call lives up here
   * rather than in CoachRail itself.
   */
  registerComposerEl: (el: HTMLElement | null) => void;
  /**
   * CoachLauncher calls this with its button element so this provider can
   * return focus to it when the panel closes — a floating disclosure that
   * drops focus on the document body is a keyboard dead end.
   */
  registerLauncherEl: (el: HTMLElement | null) => void;
}

const CoachContext = createContext<CoachContextValue | null>(null);

const RAIL_KEY = "dsa:coach:rail-open";

/** Below lg the coach is a sheet, not a rail, so the open path differs. */
function isDesktopViewport(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(min-width: 1024px)").matches
  );
}

/**
 * Two diagnoses are "the same note" when they'd render identically. Compared
 * field-wise rather than by JSON so a future field added for some unrelated
 * purpose doesn't silently start splitting cards that read the same.
 */
function sameDiagnosis(a: Diagnosis, b: Diagnosis): boolean {
  return (
    a.status === b.status &&
    a.kind === b.kind &&
    a.prose === b.prose &&
    a.caseName === b.caseName &&
    a.firstFailIndex === b.firstFailIndex &&
    a.passed === b.passed &&
    a.total === b.total
  );
}

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
  const [open, setOpenState] = useState(false);
  const [unread, setUnread] = useState(false);
  const [thread, setThread] = useState<ThreadItem[]>([]);
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryable, setRetryable] = useState(true);
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
  const [focusRequest, setFocusRequest] = useState(0);
  const composerElRef = useRef<HTMLElement | null>(null);
  const registerComposerEl = useCallback((el: HTMLElement | null) => {
    composerElRef.current = el;
  }, []);
  const launcherElRef = useRef<HTMLElement | null>(null);
  const registerLauncherEl = useCallback((el: HTMLElement | null) => {
    launcherElRef.current = el;
  }, []);
  const [closeRequest, setCloseRequest] = useState(0);

  // Focus the composer only for an EXPLICIT open (focusRequest bumped by
  // toggleCoach/openCoach below), never for reportRun's automatic
  // first-failure open. This has to live here rather than in CoachRail's own
  // mount effect: CoachRail remounts every time the rail opens regardless of
  // why, so by the time it mounts the distinction is already gone. This
  // provider never unmounts across that toggle, so the dependency array on
  // focusRequest is the only place the distinction survives. `isFirstRun`
  // guards the initial mount — otherwise a rail left open from a previous
  // session (persisted in localStorage) would steal focus the instant the
  // page loads.
  const isFirstFocusEffect = useRef(true);
  useEffect(() => {
    if (isFirstFocusEffect.current) {
      isFirstFocusEffect.current = false;
      return;
    }
    const input = composerElRef.current?.querySelector("textarea");
    input?.focus();
  }, [focusRequest]);

  // Focus returns to the launcher on an explicit close. The ordering is load
  // bearing and works because effects run child-before-parent: setting `open`
  // false remounts CoachLauncher, whose own effect registers its element, and
  // only then does this (ancestor) effect run and find it. `isFirstRun` guards
  // the initial mount so a page load never yanks focus.
  const isFirstCloseEffect = useRef(true);
  useEffect(() => {
    if (isFirstCloseEffect.current) {
      isFirstCloseEffect.current = false;
      return;
    }
    launcherElRef.current?.focus();
  }, [closeRequest]);

  useEffect(() => {
    try {
      setOpenState(window.localStorage.getItem(RAIL_KEY) === "1");
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

  const setOpen = useCallback((next: boolean) => {
    setOpenState(next);
    if (next) setUnread(false);
    try {
      // The stored key keeps its original "rail" name on purpose: the string
      // is persisted in real learners' browsers, so renaming it for tidiness
      // would silently discard everyone's open/closed preference.
      window.localStorage.setItem(RAIL_KEY, next ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, []);

  const closeCoach = useCallback(() => {
    setOpen(false);
    setCloseRequest((n) => n + 1);
  }, [setOpen]);

  const toggleCoach = useCallback(() => {
    if (isDesktopViewport()) {
      const opening = !open;
      setOpen(opening);
      // Only opening is a focus-worthy event — closing has nowhere to focus.
      if (opening) setFocusRequest((n) => n + 1);
      return;
    }
    setUnread(false);
    setMobileCoachTick((n) => n + 1);
  }, [open, setOpen]);

  // Separate from toggleCoach on purpose: a control labelled "Open coach" that
  // closes an already-open coach is the label lying about what the click does.
  const openCoach = useCallback(() => {
    if (isDesktopViewport()) {
      setOpen(true);
      setFocusRequest((n) => n + 1);
      return;
    }
    setUnread(false);
    setMobileCoachTick((n) => n + 1);
  }, [setOpen]);

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
        // Sandbox's own run-signature guard is scoped to its mount, but this
        // thread is persisted — so a reload (or coming back to the problem)
        // followed by the same failing run stacked a second identical card,
        // and they accumulated visit after visit. Dedupe against the most
        // recent diagnosis actually in the thread, which is the state that
        // survives. A genuinely different failure still reads differently and
        // still gets its own card.
        const lastDiagnosis = prev.findLast((i) => i.kind === "diagnosis");
        if (
          lastDiagnosis?.kind === "diagnosis" &&
          sameDiagnosis(lastDiagnosis.diagnosis, next)
        ) {
          return prev;
        }
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
          setOpen(true);
        }
      }
      if (failed && !open) setUnread(true);
    },
    [hintLabels.length, persistThread, open, setOpen],
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
      // A fetch that never reaches the route (offline, dropped connection) is
      // worth another go, so start optimistic and narrow it once a coded
      // response actually comes back.
      setRetryable(true);
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
          // Only a transient model failure can turn out differently on a second
          // ask. Every other code is a standing condition — refused credentials,
          // spent quota, a rejected payload — so Retry would be a false promise
          // that costs the learner a quota turn to disprove.
          setRetryable(data.code === "coach_unavailable");
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
      open,
      setOpen,
      closeCoach,
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
      retryable,
      configured,
      remaining,
      resetAt,
      mobileCoachTick,
      toggleCoach,
      openCoach,
      registerComposerEl,
      registerLauncherEl,
    }),
    [
      sandboxId,
      hintLabels,
      open,
      setOpen,
      closeCoach,
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
      retryable,
      configured,
      remaining,
      resetAt,
      mobileCoachTick,
      toggleCoach,
      openCoach,
      registerComposerEl,
      registerLauncherEl,
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
