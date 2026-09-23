"use client";

import { List } from "@phosphor-icons/react";
import { useSidebar } from "@/components/layout/SidebarContext";
import { ROUND_CONTROL } from "@/components/layout/headerChrome";
import { cn } from "@/lib/utils";

/**
 * The lessons-drawer opener on desktop lesson and problem pages: a round
 * floating button in the viewport's bottom-left corner (owner, 2026-09-14; it
 * replaced the tab on the closed sheet's edge), mirroring the coach launcher's
 * inset on the other side. Hidden while the drawer is open — the drawer's own
 * pinned header row carries the close button then.
 *
 * z-40 keeps it above ordinary page content it floats over. Its fill inverts
 * against the page (.floating-invert, globals.css) rather than blending into
 * it (owner, 2026-09-23) — the header's round control shape, lifted to float
 * over content with a fill of its own and the card shadow.
 */
export function FloatingLessonsButton() {
  const { open, toggle } = useSidebar();
  if (open) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Open lessons drawer"
      aria-controls="lessons-sidebar"
      aria-expanded={false}
      className={cn(ROUND_CONTROL, "floating-invert fixed bottom-6 left-6 z-40 hidden h-11 w-11 shadow-elevation lg:flex")}
    >
      <List className="h-5 w-5" weight="bold" />
    </button>
  );
}
