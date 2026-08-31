"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCoach } from "./CoachProvider";
import { CoachLauncher } from "./CoachLauncher";
import { CoachPanel } from "./CoachPanel";

/**
 * Portals to document.body rather than positioning in place. This is load
 * bearing, not tidiness: PageEnter wraps route content in a motion.div, and
 * an ancestor `transform` makes that ancestor the containing block for any
 * `position: fixed` descendant — the panel would be fixed to the route
 * wrapper's box instead of the viewport. document.body has no such ancestor.
 *
 * Deliberately no backdrop and no click-outside-to-close: the core workflow
 * is "read the coach's note, then click into the editor to act on it", and a
 * widget that dismissed itself on precisely that click would defeat its own
 * purpose. Escape and the close button are the only dismissals.
 */
export function CoachOverlay() {
  const { open } = useCoach();
  const reduceMotion = useReducedMotion();
  // createPortal needs a real document, which the server render has not got.
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <>
      {open ? null : <CoachLauncher />}
      <AnimatePresence>
        {open ? (
          <motion.div
            key="coach-panel"
            // bottom-20 clears the editor status bar and the results rail
            // stacked at the foot of the workspace — the rail's tabs stay
            // clickable while the coach is open, which they were not when
            // this sat at bottom-6.
            //
            // max-h keeps the panel clear of the h-14 sticky header even on
            // short viewports (now 5rem of bottom offset + the header + a
            // gap), which is why z-40 (the header's own layer) is safe, and
            // it still sits below the z-50 modal layer.
            className="shadow-elevation fixed right-6 bottom-20 z-40 flex h-[40rem] max-h-[calc(100vh-10rem)] w-[26rem] origin-bottom-right flex-col overflow-hidden rounded-[length:var(--radius-lg)] border border-border bg-elevated"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 8 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 8 }}
            // --ease, in the array form motion/react needs.
            transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
          >
            <CoachPanel variant="floating" />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>,
    document.body,
  );
}
