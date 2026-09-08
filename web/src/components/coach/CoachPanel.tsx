"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Sparkle, X, Trash } from "@phosphor-icons/react";
import { useCoach } from "./CoachProvider";
import { CoachThread } from "./CoachThread";
import { CoachComposer } from "./CoachComposer";

const PRIVACY_KEY = "dsa:coach:privacy-seen";

export function CoachPanel({
  variant = "floating",
  active = true,
}: {
  variant?: "floating" | "page";
  /** False while the mobile tab is hidden so we do not steal Code focus. */
  active?: boolean;
}) {
  const { closeCoach, clearThread, clearUnread, registerComposerEl, thread } =
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
      // relative: both the clear-thread button and the composer below are
      // positioned against this panel, not document flow.
      className="relative flex h-full min-h-0 flex-col bg-elevated"
    >
      {variant === "floating" ? (
        <header className="flex shrink-0 items-start gap-2.5 border-b border-border px-3 py-2.5">
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
          </span>
          <button
            type="button"
            aria-label="Close problem coach"
            onClick={closeCoach}
            className="-mt-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[length:var(--radius-md)] text-muted hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <X size={16} weight="bold" />
          </button>
        </header>
      ) : null}
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
      {/*
        flex flex-col, not just a bare block: CoachThread sizes itself with
        `min-h-0 flex-1`, which are inert inside a block parent — it then
        renders at full content height and its own overflow-y-auto never
        engages, putting every message past the first screenful out of
        reach. This wrapper exists only to give the floating button below a
        containing block, so it has to hand the thread the same flex context
        the section used to.
      */}
      <div className="relative flex min-h-0 flex-1 flex-col">
        <CoachThread active={active} />
        {/*
          Floats over the thread instead of sitting in the header row it
          used to share with the title/close button, and anchored to the
          BOTTOM corner rather than the top: the thread follows the newest
          message, so the top of the visible area always has text in it and
          a button there reads as a hole punched through a reply. The foot
          of the thread is the one spot that is reliably empty, and
          CoachThread's own bottom padding keeps it that way — messages
          only pass underneath while the learner scrolls back up.
        */}
        {/* Nothing to clear on an untouched thread — an enabled control
            whose only outcome is nothing is worse than no control. */}
        {thread.length > 0 ? (
          <button
            type="button"
            onClick={clearThread}
            aria-label="Clear coach thread"
            className="shadow-elevation absolute right-3 bottom-3 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-elevated text-muted transition hover:border-accent/40 hover:bg-accent/5 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Trash size={16} weight="bold" />
          </button>
        ) : null}
      </div>
      <div ref={composerRef}>
        <CoachComposer />
      </div>
    </section>
  );
}
