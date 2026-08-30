"use client";

import { List } from "@phosphor-icons/react";
import { useSidebar } from "@/components/layout/SidebarContext";

/**
 * The lessons-drawer opener for desktop lesson pages — floats over the
 * content instead of living in the header (moved out to make room there,
 * and because a page-scoped opener reads better sitting near the content
 * it opens onto rather than fixed chrome). Hidden while the drawer is
 * already open: Sidebar carries its own close button once open, so this
 * would only be a redundant control sitting underneath it.
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
      className="shadow-elevation fixed top-20 left-4 z-30 hidden h-11 w-11 items-center justify-center rounded-full border border-border bg-elevated text-muted transition hover:border-accent/40 hover:bg-accent/5 hover:text-accent lg:flex"
    >
      <List className="h-4 w-4" weight="bold" />
    </button>
  );
}
