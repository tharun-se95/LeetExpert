"use client";

import { useEffect, useId, useRef, type ComponentProps } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X } from "@phosphor-icons/react";
import { ProblemFilterPanel } from "@/components/problems/ProblemFilterPanel";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/**
 * Mobile filter sheet. Reuses the exact interaction MECHANISM
 * MobileLessonsSheet.tsx already established — scrim, body-scroll lock,
 * Tab focus trap, Escape closes, focus returns to the trigger on close —
 * but slides up from the bottom with soft-cornered top edges, not in from
 * the left: this is a bottom sheet, not a drawer, so the transform axis
 * differs even though the mechanics are identical.
 */
export function ProblemFilterSheet({
  open,
  onClose,
  resultCount,
  ...panelProps
}: {
  open: boolean;
  onClose: () => void;
  resultCount: number;
} & ComponentProps<typeof ProblemFilterPanel>) {
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
        <div className="fixed inset-0 z-50 lg:hidden" role="presentation">
          <motion.button
            type="button"
            aria-label="Dismiss filters"
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
            className="absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-[length:var(--radius-lg)] border border-border border-b-0 bg-elevated"
            initial={reduceMotion ? false : { y: "100%" }}
            animate={{ y: 0 }}
            exit={reduceMotion ? undefined : { y: "100%" }}
            transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
          >
            <div className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border px-4">
              <span id={titleId} className="text-base font-semibold tracking-tight">
                Filters
              </span>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[length:var(--radius-md)] border border-border text-muted transition hover:bg-surface hover:text-foreground"
                aria-label="Close filters"
              >
                <X className="h-5 w-5" weight="bold" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
              <ProblemFilterPanel {...panelProps} />
            </div>
            <div className="shrink-0 border-t border-border p-4">
              <button
                type="button"
                onClick={onClose}
                className="flex min-h-12 w-full items-center justify-center rounded-[length:var(--radius-md)] bg-pop text-sm font-semibold text-on-pop"
              >
                Show {resultCount} problem{resultCount === 1 ? "" : "s"}
              </button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
