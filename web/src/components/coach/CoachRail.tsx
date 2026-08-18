"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ChatCircle, X, Trash } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useCoach } from "./CoachProvider";
import { CoachThread } from "./CoachThread";
import { CoachComposer } from "./CoachComposer";

const PRIVACY_KEY = "dsa:coach:privacy-seen";

export function CoachHandle() {
  const { setRailOpen, unread } = useCoach();
  return (
    <button
      type="button"
      aria-label="Open problem coach"
      aria-expanded={false}
      onClick={() => setRailOpen(true)}
      className="flex w-10 shrink-0 flex-col items-center justify-center gap-2 border-l border-border bg-elevated text-muted transition-colors hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent motion-reduce:transition-none"
    >
      <span className="relative">
        <ChatCircle size={18} weight="bold" aria-hidden />
        {unread ? (
          <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-pop" />
        ) : null}
      </span>
      <span
        className="text-[0.65rem] font-medium uppercase tracking-wide"
        style={{ writingMode: "vertical-rl" }}
      >
        Coach
      </span>
    </button>
  );
}

export function CoachRail({
  variant = "rail",
  active = true,
}: {
  variant?: "rail" | "page";
  /** False while the mobile tab is hidden so we do not steal Code focus. */
  active?: boolean;
}) {
  const { setRailOpen, clearThread, clearUnread } = useCoach();
  const composerRef = useRef<HTMLDivElement>(null);
  const [privacySeen, setPrivacySeen] = useState(true);

  useEffect(() => {
    try {
      setPrivacySeen(window.localStorage.getItem(PRIVACY_KEY) === "1");
    } catch {
      setPrivacySeen(true);
    }
  }, []);

  useEffect(() => {
    if (!active) return;
    clearUnread();
    const input = composerRef.current?.querySelector("textarea");
    input?.focus();
  }, [active, clearUnread]);

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "Escape" && variant === "rail") {
      e.stopPropagation();
      setRailOpen(false);
    }
  };

  const acknowledgePrivacy = () => {
    try {
      window.localStorage.setItem(PRIVACY_KEY, "1");
    } catch {
      /* ignore */
    }
    setPrivacySeen(true);
  };

  return (
    <section
      aria-label="Problem coach"
      onKeyDown={onKeyDown}
      className={cn(
        "flex h-full min-h-0 flex-col bg-elevated",
        variant === "rail" ? "border-l border-border" : "",
      )}
    >
      <header className="flex shrink-0 items-center gap-2 border-b border-border px-3 py-1.5">
        {variant === "rail" ? (
          <>
            <ChatCircle size={16} weight="bold" className="text-accent" aria-hidden />
            <h2 className="flex-1 font-display text-sm font-bold uppercase tracking-tight">
              Coach
            </h2>
          </>
        ) : (
          // The mobile tab bar already reads "Coach" — a second title here
          // would repeat it. Just the still-needed clear action stays.
          <span className="flex-1" />
        )}
        <button
          type="button"
          onClick={clearThread}
          aria-label="Clear coach thread"
          className="inline-flex h-11 w-11 items-center justify-center rounded-md text-muted hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <Trash size={16} weight="bold" />
        </button>
        {variant === "rail" ? (
          <button
            type="button"
            aria-label="Close problem coach"
            aria-expanded
            onClick={() => setRailOpen(false)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-md text-muted hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <X size={16} weight="bold" />
          </button>
        ) : null}
      </header>
      {!privacySeen ? (
        <p className="shrink-0 border-b border-border bg-info-surface px-3 py-1.5 text-xs text-info">
          Sending a message sends your code and this problem’s hints to our model
          provider. Diagnosis stays local until you ask.
          <button
            type="button"
            onClick={acknowledgePrivacy}
            className="ml-1 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Got it
          </button>
        </p>
      ) : null}
      <CoachThread />
      <div ref={composerRef}>
        <CoachComposer />
      </div>
    </section>
  );
}
