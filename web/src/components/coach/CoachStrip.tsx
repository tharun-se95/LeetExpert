"use client";

import { useEffect, useRef } from "react";
import { Sparkle } from "@phosphor-icons/react";
import { useCoach } from "./CoachProvider";

/**
 * The collapsed coach column: a strip beside the editor that keeps the coach's
 * mark and its unread dot in view. Registered as the launcher, so collapsing
 * the column returns focus here, and expanding it focuses the composer.
 * Spec: docs/superpowers/specs/2026-09-17-coach-column-design.md §3
 */
export function CoachStrip() {
  const { toggleCoach, unread, registerLauncherEl } = useCoach();
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    registerLauncherEl(ref.current);
    return () => registerLauncherEl(null);
  }, [registerLauncherEl]);

  return (
    <div className="flex h-full w-12 flex-col items-center border-l border-border py-1.5 grain-paper [--grain-paper:var(--elevated)]">
      <button
        ref={ref}
        type="button"
        onClick={toggleCoach}
        aria-label="Expand problem coach"
        aria-expanded={false}
        className="relative flex h-11 w-11 items-center justify-center rounded-[length:var(--radius-md)] hover:bg-surface"
      >
        {/* The floating panel's mark: steel bg-pop/text-on-pop, a designed pair. */}
        <span
          aria-hidden
          className="flex h-9 w-9 items-center justify-center rounded-[length:var(--radius-md)] bg-pop text-on-pop"
        >
          <Sparkle size={19} weight="fill" />
        </span>
        {unread ? (
          <>
            {/* bg-bad, not bg-pop: see CoachLauncher — it must stay legible on the mark. */}
            <span
              aria-hidden
              className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-bad ring-2 ring-elevated"
            />
            <span className="sr-only">New diagnosis</span>
          </>
        ) : null}
      </button>
    </div>
  );
}
