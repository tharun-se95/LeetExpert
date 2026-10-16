"use client";

import { GraduationCap, Code } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export interface NavModeSwitcherProps {
  filter: "lessons" | "practice";
  onFilterChange: (filter: "lessons" | "practice") => void;
  compact?: boolean;
  className?: string;
}

/**
 * Filter switcher in the left navigation panel.
 * Filters the single-level navigation tree between Lessons and Practice problems.
 */
export function NavModeSwitcher({
  filter,
  onFilterChange,
  compact = true,
  className,
}: NavModeSwitcherProps) {
  const isLessons = filter === "lessons";
  const isPractice = filter === "practice";

  const segmentBase = cn(
    "flex-1 min-w-0 inline-flex items-center justify-center gap-1.5 rounded-[length:var(--radius-xs)] font-medium transition-all duration-[var(--dur-fast)] ease-[var(--ease)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer",
    compact ? "min-h-8 py-1 px-2 text-[12px]" : "min-h-11 py-2 px-3 text-[13px]",
  );

  return (
    <div
      role="tablist"
      aria-label="Filter course content"
      className={cn(
        "flex w-full items-center gap-1 p-1 rounded-[length:var(--radius-xs)] bg-surface border border-border mb-3",
        className,
      )}
    >
      <button
        type="button"
        role="tab"
        id="tab-lessons"
        aria-selected={isLessons}
        aria-controls="nav-tree-content"
        onClick={() => onFilterChange("lessons")}
        className={cn(
          segmentBase,
          isLessons
            ? "bg-elevated text-foreground font-semibold border border-border shadow-elevation"
            : "text-muted hover:text-foreground hover:bg-surface/80 border border-transparent",
        )}
      >
        <GraduationCap
          className={cn(
            "h-3.5 w-3.5 shrink-0 transition-colors",
            isLessons ? "text-accent" : "text-muted",
          )}
          weight={isLessons ? "fill" : "bold"}
          aria-hidden
        />
        <span className="truncate">Lessons</span>
      </button>

      <button
        type="button"
        role="tab"
        id="tab-practice"
        aria-selected={isPractice}
        aria-controls="nav-tree-content"
        onClick={() => onFilterChange("practice")}
        className={cn(
          segmentBase,
          isPractice
            ? "bg-elevated text-foreground font-semibold border border-border shadow-elevation"
            : "text-muted hover:text-foreground hover:bg-surface/80 border border-transparent",
        )}
      >
        <Code
          className={cn(
            "h-3.5 w-3.5 shrink-0 transition-colors",
            isPractice ? "text-accent" : "text-muted",
          )}
          weight="bold"
          aria-hidden
        />
        <span className="truncate">Practice</span>
      </button>
    </div>
  );
}
