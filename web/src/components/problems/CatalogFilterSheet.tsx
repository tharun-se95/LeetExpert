"use client";

import { useEffect, useId, useRef, type ComponentProps } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X } from "@phosphor-icons/react";
import { CatalogFilterPanel } from "@/components/problems/CatalogFilterPanel";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function CatalogFilterSheet({
  open,
  onClose,
  resultCount,
  ...panelProps
}: {
  open: boolean;
  onClose: () => void;
  resultCount: number;
} & ComponentProps<typeof CatalogFilterPanel>) {
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
            tabIndex={-1}
            className="absolute inset-x-0 bottom-0 flex max-h-[82vh] flex-col rounded-t-[length:var(--radius-xl)] border-t border-border bg-surface p-5 shadow-elevation"
            initial={reduceMotion ? false : { y: "100%" }}
            animate={{ y: 0 }}
            exit={reduceMotion ? undefined : { y: "100%" }}
            transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
          >
            <div className="mb-4 flex shrink-0 items-center justify-between border-b border-border pb-3">
              <h2 id={titleId} className="font-display text-base font-bold uppercase tracking-tight">
                Filters
              </h2>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close filters"
                className="flex h-9 w-9 items-center justify-center rounded-[length:var(--radius-sm)] text-muted hover:text-foreground touch-manipulation"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
              <CatalogFilterPanel {...panelProps} />
            </div>

            <div className="mt-4 border-t border-border pt-3">
              <button
                type="button"
                onClick={onClose}
                className="flex min-h-11 w-full items-center justify-center rounded-[length:var(--radius-md)] bg-pop text-sm font-semibold text-on-pop touch-manipulation"
              >
                View {resultCount} {resultCount === 1 ? "problem" : "problems"}
              </button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
