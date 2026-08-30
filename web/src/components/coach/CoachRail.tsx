"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ChatCircle, X, Trash } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useCoach } from "./CoachProvider";
import { CoachThread } from "./CoachThread";
import { CoachComposer } from "./CoachComposer";

const PRIVACY_KEY = "dsa:coach:privacy-seen";

export function CoachRail({
  variant = "rail",
  active = true,
}: {
  variant?: "rail" | "page";
  /** False while the mobile tab is hidden so we do not steal Code focus. */
  active?: boolean;
}) {
  const { setRailOpen, clearThread, clearUnread, registerComposerEl } =
    useCoach();
  const composerRef = useRef<HTMLDivElement>(null);
  const [privacySeen, setPrivacySeen] = useState(true);

  useEffect(() => {
    try {
      setPrivacySeen(window.localStorage.getItem(PRIVACY_KEY) === "1");
    } catch {
      setPrivacySeen(true);
    }
  }, []);

  // Rail (desktop) variant: no focus call here at all. It would fire on
  // EVERY open, including reportRun's automatic first-failure one, which is
  // exactly the focus-steal this was rewritten to stop — the provider's own
  // effect (keyed on an explicit-open counter) owns that decision instead;
  // registering this element is what lets it find the textarea to focus.
  //
  // Page (mobile) variant: unaffected. Becoming active there already IS an
  // explicit tab switch, so it keeps focusing unconditionally, same as before.
  useEffect(() => {
    if (variant !== "rail") return;
    registerComposerEl(composerRef.current);
    return () => registerComposerEl(null);
  }, [variant, registerComposerEl]);

  useEffect(() => {
    if (!active) return;
    clearUnread();
    if (variant !== "page") return;
    const input = composerRef.current?.querySelector("textarea");
    input?.focus();
  }, [active, clearUnread, variant]);

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
        // Only the rail variant borders visible workspace to its left; the
        // page (mobile) variant fills its own full-screen tab with nothing
        // beside it to cast a shadow onto.
        variant === "rail" ? "border-l border-border shadow-edge-left" : "",
      )}
    >
      <header
        className={cn(
          "flex shrink-0 items-start gap-2.5 border-b border-border px-3",
          // Only the rail carries the masthead; the mobile branch is a lone
          // clear button and does not need the height that title earns.
          variant === "rail" ? "py-2.5" : "py-1.5",
        )}
      >
        {variant === "rail" ? (
          <>
            {/*
              A solid mark rather than an accent-tinted glyph: the same
              bg-pop/text-on-pop pair the wordmark uses, which is a designed
              couple. An accent-coloured icon here would sit on --elevated,
              the lightest dark surface, where accentUi does not clear 3:1.
            */}
            <span
              aria-hidden
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[length:var(--radius-md)] bg-pop text-on-pop"
            >
              <ChatCircle size={17} weight="fill" />
            </span>
            <span className="min-w-0 flex-1">
              <h2 className="font-display text-[1.3rem] font-bold leading-none tracking-tight text-foreground">
                Coach
              </h2>
              {/*
                Says what this one knows that a general chat box does not —
                the composer and empty state already carry "won't write the
                code", so repeating it here would spend the line twice.
              */}
              <p className="mt-1 text-[0.7rem] leading-snug text-muted">
                Reads your code and this problem.
              </p>
            </span>
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
          className="-mt-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[length:var(--radius-md)] text-muted hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <Trash size={16} weight="bold" />
        </button>
        {variant === "rail" ? (
          <button
            type="button"
            aria-label="Close problem coach"
            aria-expanded
            onClick={() => setRailOpen(false)}
            className="-mt-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[length:var(--radius-md)] text-muted hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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
