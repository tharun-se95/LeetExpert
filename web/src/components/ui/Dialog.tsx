"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]):not([type="hidden"]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable]:not([contenteditable="false"])';

// contenteditable is listed because a code editor (CodeMirror) is one, and a
// trap that cannot see it would keep keyboard users out of a read-only view.
// jsdom has no layout, so visibility is judged from attributes, not geometry.
function focusables(panel: HTMLElement): HTMLElement[] {
  return [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => !el.closest("[hidden], [inert]"));
}

/**
 * The SearchDialog surface plus the two things a confirm dialog needs that
 * search did not: a focus trap, and focus returned to whatever opened it.
 */
export function Dialog({
  open,
  onClose,
  label,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  children: ReactNode;
  className?: string;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  // Read through a ref so a parent's inline onClose does not re-subscribe the
  // listener (and re-run the focus effect) on every render.
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    // A text-only dialog has nothing to focus; without the panel as a fallback
    // focus would stay on the opener behind the backdrop.
    const el = panel.current;
    if (el) (focusables(el)[0] ?? el).focus();
    return () => opener.current?.focus();
  }, [open]);

  // On the document, not the panel: clicking plain text moves focus to body,
  // and a panel-level handler would then never see Tab or Escape.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close.current();
        return;
      }
      const el = panel.current;
      if (e.key !== "Tab" || !el) return;
      const items = focusables(el);
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) {
        e.preventDefault();
        el.focus();
        return;
      }
      const active = document.activeElement;
      // Outside the panel, or on the panel itself (focused by a click on
      // text): the browser's own next stop would be behind the modal.
      if (!(active instanceof Node) || !el.contains(active) || active === el) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      } else if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-foreground/25 px-4 pt-[12vh] backdrop-blur-[2px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={cn(
          "w-full max-w-md rounded-[length:var(--radius-lg)] border border-border bg-elevated p-6 shadow-elevation focus-visible:outline-none!",
          className,
        )}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
