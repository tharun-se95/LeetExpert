"use client";

import { useEffect, useId, useRef } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { FileText, Gear, MapTrifold, X } from "@phosphor-icons/react";
import { CourseNavTree } from "@/components/layout/CourseNavTree";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/**
 * Full-screen Lessons navigation for viewports below `lg`.
 * Desktop keeps the persistent collapsible sidebar; this sheet is mobile-only.
 */
export function MobileLessonsSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;

    restoreFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const raf = requestAnimationFrame(() => closeRef.current?.focus());

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;

      const nodes = [
        ...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      ].filter((el) => !el.hasAttribute("disabled") && el.tabIndex !== -1);
      if (nodes.length === 0) return;

      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;

      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      restoreFocusRef.current?.focus();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <div
          id="mobile-lessons-sheet"
          className="fixed inset-0 z-50 lg:hidden"
          role="presentation"
        >
          <motion.button
            type="button"
            aria-label="Dismiss lessons menu"
            className="absolute inset-0 bg-foreground/35"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            // No border-r/shadow here: the panel is deliberately full-screen
            // on mobile (see the component doc comment), so its right edge
            // sits exactly on the viewport edge — a border or shadow there
            // renders off-screen and is permanently invisible. Confirmed:
            // panel.getBoundingClientRect().right === window.innerWidth.
            // No accent strip down the left edge either (owner, 2026-09-24): in
            // the dark theme --accent is a light steel, so it read as a stray
            // white line beside the nav.
            className="absolute inset-0 flex flex-col bg-background"
            initial={reduceMotion ? false : { x: "-100%" }}
            animate={{ x: 0 }}
            exit={reduceMotion ? undefined : { x: "-100%" }}
            transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
          >
            <div className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border px-4">
              <span
                id={titleId}
                className="truncate text-base font-semibold tracking-tight"
              >
                Lessons
              </span>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[length:var(--radius-md)] border border-border text-muted transition hover:bg-surface hover:text-foreground"
                aria-label="Close lessons menu"
              >
                <X className="h-5 w-5" weight="bold" />
              </button>
            </div>
            {/* Quick-access utility strip for mobile navigation discoverability */}
            <div className="grid grid-cols-3 gap-2 border-b border-border bg-surface/40 p-3">
              <Link
                href="/courses/dsa/cheatsheets"
                onClick={onClose}
                className="flex items-center justify-center gap-1.5 rounded-[length:var(--radius-xs)] border border-border/80 bg-background/80 px-2 py-2 text-xs font-medium text-foreground transition-colors hover:bg-surface"
              >
                <FileText className="h-3.5 w-3.5 text-accent" />
                <span className="truncate">Cheatsheets</span>
              </Link>
              <Link
                href="/courses/dsa/roadmap"
                onClick={onClose}
                className="flex items-center justify-center gap-1.5 rounded-[length:var(--radius-xs)] border border-border/80 bg-background/80 px-2 py-2 text-xs font-medium text-foreground transition-colors hover:bg-surface"
              >
                <MapTrifold className="h-3.5 w-3.5 text-accent" />
                <span className="truncate">Roadmap</span>
              </Link>
              <Link
                href="/settings"
                onClick={onClose}
                className="flex items-center justify-center gap-1.5 rounded-[length:var(--radius-xs)] border border-border/80 bg-background/80 px-2 py-2 text-xs font-medium text-foreground transition-colors hover:bg-surface"
              >
                <Gear className="h-3.5 w-3.5 text-muted" />
                <span className="truncate">Settings</span>
              </Link>
            </div>
            {/* px-6, not px-4: the back row's caret hangs 16px into this gutter
                (CourseNavPanel), and px-4 is 13px at the phone's 13px root, so
                it poked 3px past the screen's edge. */}
            <CourseNavTree compact={false} className="px-6 py-5" />
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
