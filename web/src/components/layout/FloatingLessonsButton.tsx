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
 * z-40 keeps it above the hover edge strip (z-30), so resting the pointer on
 * the button does not throw the drawer open by itself. Grainy page paper with
 * the card shadow: the header's round control, lifted to float over content.
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
      className={cn(ROUND_CONTROL, "fixed bottom-6 left-6 z-40 hidden h-11 w-11 bg-background grain-paper shadow-elevation lg:flex")}
    >
      <List className="h-5 w-5" weight="bold" />
    </button>
  );
}
