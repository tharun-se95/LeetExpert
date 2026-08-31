"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Sparkle, X, Trash } from "@phosphor-icons/react";
import { LANG_LABEL } from "@/components/sandbox/types";
import { cn } from "@/lib/utils";
import { useCoach } from "./CoachProvider";
import { CoachThread } from "./CoachThread";
import { CoachComposer } from "./CoachComposer";

const PRIVACY_KEY = "dsa:coach:privacy-seen";

/**
 * What the coach can actually see right now, as live state rather than a
 * sentence claiming it. Every field is real: the language comes from the
 * editor, the tally from the last run's diagnosis, the hint count from the
 * lesson. Nothing here is rendered unless the coach genuinely has it — an
 * agent that lists context it does not hold is worse than one that lists
 * none.
 */
function CoachContext() {
  const { diagnosis, hintLabels, sourceLang } = useCoach();
  const parts: string[] = [LANG_LABEL[sourceLang]];
  if (diagnosis && diagnosis.total > 0) {
    parts.push(`${diagnosis.passed}/${diagnosis.total} tests passing`);
  }
  if (hintLabels.length > 0) {
    parts.push(`${hintLabels.length} hint${hintLabels.length === 1 ? "" : "s"}`);
  }

  return (
    <p className="flex shrink-0 flex-wrap items-center gap-x-1.5 gap-y-1 border-b border-border px-3 py-1.5 font-mono text-[0.65rem] text-muted">
      <span className="text-muted/70">Reading</span>
      {parts.map((part, i) => (
        <span key={part} className="flex items-center gap-1.5">
          {i > 0 ? (
            <span aria-hidden className="text-border">
              ·
            </span>
          ) : null}
          {part}
        </span>
      ))}
    </p>
  );
}

export function CoachPanel({
  variant = "floating",
  active = true,
}: {
  variant?: "floating" | "page";
  /** False while the mobile tab is hidden so we do not steal Code focus. */
  active?: boolean;
}) {
  const { closeCoach, clearThread, clearUnread, registerComposerEl } =
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

  // Floating (desktop) variant: no focus call here at all. It would fire on
  // EVERY open, including reportRun's automatic first-failure one, which is
  // exactly the focus-steal this was rewritten to stop — the provider's own
  // effect (keyed on an explicit-open counter) owns that decision instead;
  // registering this element is what lets it find the textarea to focus.
  //
  // Page (mobile) variant: unaffected. Becoming active there already IS an
  // explicit tab switch, so it keeps focusing unconditionally, same as before.
  useEffect(() => {
    if (variant !== "floating") return;
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
    if (e.key === "Escape" && variant === "floating") {
      e.stopPropagation();
      closeCoach();
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
      // Non-modal on purpose: no aria-modal and no focus trap, because the
      // whole point of floating over the workspace is that the editor stays
      // usable while the coach is open. The mobile variant takes no role —
      // ProblemWorkspace already supplies role="tabpanel" on its wrapper.
      role={variant === "floating" ? "dialog" : undefined}
      onKeyDown={onKeyDown}
      // No border, radius, or shadow here: CoachOverlay owns the floating
      // surface's own chrome, and the page (mobile) variant fills its tab.
      className="flex h-full min-h-0 flex-col bg-elevated"
    >
      <header
        className={cn(
          "flex shrink-0 items-start gap-2.5 border-b border-border px-3",
          // Only the floating panel carries the masthead; the mobile branch is a lone
          // clear button and does not need the height that title earns.
          variant === "floating" ? "py-2.5" : "py-1.5",
        )}
      >
        {variant === "floating" ? (
          <>
            {/*
              A solid mark rather than an accent-tinted glyph: the same
              bg-pop/text-on-pop pair the wordmark uses, which is a designed
              couple. An accent-coloured icon here would sit on --elevated,
              the lightest dark surface, where accentUi does not clear 3:1.
            */}
            <span
              aria-hidden
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[length:var(--radius-md)] bg-pop text-on-pop"
            >
              <Sparkle size={19} weight="fill" />
            </span>
            <span className="min-w-0 flex-1">
              <h2 className="font-display text-[1.3rem] font-bold leading-none tracking-tight text-foreground">
                Coach
              </h2>
              {/*
                The subtitle here used to read "Reads your code and this
                problem." — a claim the panel never evidenced. CoachContext
                below shows the same thing as live state instead, which is
                the difference between asserting grounding and having it.
              */}
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
        {variant === "floating" ? (
          <button
            type="button"
            aria-label="Close problem coach"
            onClick={closeCoach}
            className="-mt-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[length:var(--radius-md)] text-muted hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <X size={16} weight="bold" />
          </button>
        ) : null}
      </header>
      <CoachContext />
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
