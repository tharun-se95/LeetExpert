"use client";

import {
  CaretLeft,
  CaretRight,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { CourseNavTree } from "@/components/layout/CourseNavTree";

interface SidebarProps {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}

/**
 * Desktop Lessons drawer (≥ lg): full panel when open, narrow rail when closed.
 * Mobile uses {@link MobileLessonsSheet} from the header instead — no rail.
 */
export function Sidebar({ open, onOpen, onClose }: SidebarProps) {
  return (
    <aside
      className={cn(
        "print:hidden relative z-20 hidden h-full shrink-0 flex-col border-r border-border bg-elevated transition-[width] duration-[var(--dur)] ease-[var(--ease)] lg:flex",
        open ? "w-72" : "w-12",
      )}
    >
      {open ? (
        <>
          <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border px-4">
            <span className="truncate text-sm font-semibold tracking-tight">
              Lessons
            </span>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border text-muted transition hover:bg-surface hover:text-foreground"
              aria-label="Close lessons drawer"
            >
              <CaretLeft className="h-4 w-4" weight="bold" />
            </button>
          </div>
          <CourseNavTree compact className="px-5 py-6" />
        </>
      ) : (
        <div className="flex h-full flex-col items-center py-3">
          <button
            type="button"
            onClick={onOpen}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted transition hover:border-accent/40 hover:bg-accent/5 hover:text-accent"
            aria-label="Open lessons drawer"
          >
            <CaretRight className="h-4 w-4" weight="bold" />
          </button>
          <span
            className="mt-4 origin-center rotate-180 text-[10px] font-semibold tracking-[0.18em] text-muted uppercase"
            style={{ writingMode: "vertical-rl" }}
          >
            Lessons
          </span>
        </div>
      )}
    </aside>
  );
}
