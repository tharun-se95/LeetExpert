"use client";

import { List } from "@phosphor-icons/react";
import { useSidebar } from "@/components/layout/SidebarContext";

/**
 * The lessons-drawer opener for desktop lesson and problem pages — floats over the
 * content instead of living in the header (moved out to make room there,
 * and because a page-scoped opener reads better sitting near the content
 * it opens onto rather than fixed chrome). Hidden while the drawer is
 * already open: Sidebar carries its own close button once open, so this
 * would only be a redundant control sitting underneath it.
 *
 * It is the same tab as that close button, on the closed sheet's edge: the
 * drawer collapses to the viewport's left edge, so the tab sits there — same
 * paper, same size, same .drawer-tab fillets (globals.css), and at the same
 * height on screen (header h-14 + the close tab's top-4). Closing the drawer
 * leaves the tab where the eye already is, one sheet-width to the left.
 * On problem pages that spot is inside ProblemWorkspace's header, which
 * reserves it (lg:pl-12, lg:py-3) rather than this tab moving per page.
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
      className="sidebar-rail drawer-tab fixed top-18 left-0 z-30 hidden h-9 w-9 items-center justify-center rounded-r-[length:var(--radius-md)] border border-l-0 border-border text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent lg:flex"
    >
      <List className="h-4 w-4" weight="bold" />
    </button>
  );
}
