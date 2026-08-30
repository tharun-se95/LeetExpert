"use client";

import { CaretLeft } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { CourseNavTree } from "@/components/layout/CourseNavTree";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Desktop Lessons drawer (≥ lg): a full panel when open, zero-width when not.
 * Mobile uses {@link MobileLessonsSheet} from the header instead.
 *
 * The opener lives in the header rather than in a collapsed rail. A problem
 * page already has the description, the editor, and the coach competing for
 * horizontal space, so a drawer nobody has open should cost none of it.
 */
export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <aside
      id="lessons-sidebar"
      // Stays mounted so the width transition has something to collapse, and
      // inert while closed so the clipped tree leaves the tab order with it.
      inert={!open}
      className={cn(
        "print:hidden relative z-20 hidden h-full shrink-0 flex-col overflow-hidden bg-elevated transition-[width] duration-[var(--dur)] ease-[var(--ease)] lg:flex",
        // box-shadow isn't clipped by the element's own overflow-hidden, so
        // a w-0 closed drawer would still show a shadow sliver if this were
        // unconditional.
        open ? "w-80 border-r border-border shadow-edge-right" : "w-0",
      )}
    >
      {/*
        Fixed inner width: the panel has to clip as it collapses rather than
        reflow its contents down to nothing on the way.
      */}
      <div className="flex h-full w-80 flex-col">
        <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border px-4">
          <span className="truncate text-sm font-semibold tracking-tight">
            Lessons
          </span>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[length:var(--radius-md)] border border-border text-muted transition hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Close lessons drawer"
          >
            <CaretLeft className="h-4 w-4" weight="bold" />
          </button>
        </div>
        <CourseNavTree compact className="px-5 py-6" />
      </div>
    </aside>
  );
}
