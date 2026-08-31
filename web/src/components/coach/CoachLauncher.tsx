"use client";

import { useEffect, useRef } from "react";
import { ChatCircle } from "@phosphor-icons/react";
import { useCoach } from "./CoachProvider";

/**
 * The coach's single entry point on desktop. Only rendered while the panel
 * is closed, so `aria-expanded` is honestly always false and the label can
 * promise "Open" without lying about what the click does.
 */
export function CoachLauncher() {
  const { toggleCoach, unread, registerLauncherEl } = useCoach();
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    registerLauncherEl(ref.current);
    return () => registerLauncherEl(null);
  }, [registerLauncherEl]);

  return (
    <button
      ref={ref}
      type="button"
      onClick={toggleCoach}
      aria-label="Open problem coach"
      aria-expanded={false}
      // bottom-20, not bottom-6: the editor's status bar (~23px) and the
      // results rail (~41px) are stacked at the foot of the workspace, and
      // at 24px this sat on top of both. Floating over results *content* is
      // fine — that is what an overlay does — but covering chrome you still
      // need to read and click is not.
      className="shadow-elevation fixed right-6 bottom-20 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-pop text-on-pop transition-transform duration-[var(--dur-fast)] ease-[var(--ease)] hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent motion-reduce:transition-none motion-reduce:hover:scale-100"
    >
      <ChatCircle size={24} weight="fill" aria-hidden />
      {unread ? (
        <>
          {/*
            bg-bad, not bg-pop: the badge must stay legible against the
            launcher's own fill, and --pop is remapped per topic family, so a
            pop-on-pop badge would vanish on whichever family shares its hue.
          */}
          <span
            aria-hidden
            className="absolute top-1 right-1 h-3 w-3 rounded-full bg-bad ring-2 ring-background"
          />
          <span className="sr-only">New diagnosis</span>
        </>
      ) : null}
    </button>
  );
}
