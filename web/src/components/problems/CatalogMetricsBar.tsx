"use client";

import { List, SquaresFour } from "@phosphor-icons/react";
import type { CatalogProblem } from "@/lib/course/catalog/types";
import { isProblemSolved } from "@/lib/course/catalog/filters";
import { cn } from "@/lib/utils";

export type ViewMode = "list" | "grid";

export function CatalogMetricsBar({
  problems,
  solvedIds,
  viewMode,
  onViewModeChange,
}: {
  problems: readonly CatalogProblem[];
  solvedIds: Set<string>;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}) {
  let easyTotal = 0;
  let easySolved = 0;
  let medTotal = 0;
  let medSolved = 0;
  let hardTotal = 0;
  let hardSolved = 0;

  for (const p of problems) {
    const isSolved = isProblemSolved(p, solvedIds);
    if (p.difficulty === "Easy") {
      easyTotal++;
      if (isSolved) easySolved++;
    } else if (p.difficulty === "Medium") {
      medTotal++;
      if (isSolved) medSolved++;
    } else if (p.difficulty === "Hard") {
      hardTotal++;
      if (isSolved) hardSolved++;
    }
  }

  const total = problems.length;
  const totalSolved = easySolved + medSolved + hardSolved;
  const pct = total > 0 ? Math.round((totalSolved / total) * 100) : 0;

  const easyPct = total > 0 ? (easySolved / total) * 100 : 0;
  const medPct = total > 0 ? (medSolved / total) * 100 : 0;
  const hardPct = total > 0 ? (hardSolved / total) * 100 : 0;

  return (
    <div className="flex flex-col gap-3.5 rounded-[length:var(--radius-lg)] border border-border/80 bg-elevated shadow-elevation p-3.5">
      {/* Sleek Segmented Progress Track */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface border border-border/40 flex">
        {easyPct > 0 ? (
          <div
            style={{ width: `${easyPct}%` }}
            className="h-full bg-good transition-all duration-300"
            title={`Easy Solved: ${easySolved}/${easyTotal}`}
          />
        ) : null}
        {medPct > 0 ? (
          <div
            style={{ width: `${medPct}%` }}
            className="h-full bg-warn transition-all duration-300"
            title={`Medium Solved: ${medSolved}/${medTotal}`}
          />
        ) : null}
        {hardPct > 0 ? (
          <div
            style={{ width: `${hardPct}%` }}
            className="h-full bg-bad transition-all duration-300"
            title={`Hard Solved: ${hardSolved}/${hardTotal}`}
          />
        ) : null}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Overall Progress Stats */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-2xl font-bold tracking-tight text-foreground tabular-nums">
                {totalSolved}
              </span>
              <span className="text-xs text-muted">/ {total} solved</span>
              <span className="ml-1 rounded-[length:var(--radius-xs)] bg-good-surface/60 border border-good-line/40 px-1.5 py-0.5 font-mono text-[10px] font-bold text-good">
                {pct}%
              </span>
            </div>
            <p className="text-[10px] uppercase tracking-wider text-muted font-medium">
              Overall Completion
            </p>
          </div>

          {/* Difficulty Breakdown semantic badge containers */}
          <div className="flex flex-wrap items-center gap-2 border-l border-border/80 pl-4 sm:pl-6">
            <div className="flex items-center gap-2 rounded-[length:var(--radius-sm)] border border-good-line/30 bg-good-surface/30 px-2.5 py-1">
              <span className="h-2 w-2 rounded-full bg-good shrink-0" aria-hidden />
              <div className="flex flex-col leading-tight">
                <span className="text-[9px] font-bold text-good uppercase tracking-wider">Easy</span>
                <span className="font-mono text-xs font-bold text-foreground">
                  {easySolved}<span className="text-muted font-normal">/{easyTotal}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-[length:var(--radius-sm)] border border-warn-line/30 bg-warn-surface/30 px-2.5 py-1">
              <span className="h-2 w-2 rounded-full bg-warn shrink-0" aria-hidden />
              <div className="flex flex-col leading-tight">
                <span className="text-[9px] font-bold text-warn uppercase tracking-wider">Med</span>
                <span className="font-mono text-xs font-bold text-foreground">
                  {medSolved}<span className="text-muted font-normal">/{medTotal}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-[length:var(--radius-sm)] border border-bad-line/30 bg-bad-surface/30 px-2.5 py-1">
              <span className="h-2 w-2 rounded-full bg-bad shrink-0" aria-hidden />
              <div className="flex flex-col leading-tight">
                <span className="text-[9px] font-bold text-bad uppercase tracking-wider">Hard</span>
                <span className="font-mono text-xs font-bold text-foreground">
                  {hardSolved}<span className="text-muted font-normal">/{hardTotal}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

      {/* View Switcher: List vs Grid */}
      <div className="flex items-center justify-between sm:justify-end gap-2 border-t border-border/60 pt-2 sm:border-0 sm:pt-0">
        <span className="text-xs text-muted sm:hidden">Layout</span>
        <div className="flex items-center rounded-[length:var(--radius-md)] border border-border bg-code p-0.5">
          <button
            type="button"
            aria-label="Switch to list view"
            aria-pressed={viewMode === "list"}
            onClick={() => onViewModeChange("list")}
            className={cn(
              "flex h-8 items-center gap-1.5 rounded-[length:var(--radius-sm)] px-2.5 text-xs font-medium transition-colors touch-manipulation",
              viewMode === "list"
                ? "bg-pop text-on-pop"
                : "text-muted hover:text-foreground",
            )}
          >
            <List size={14} weight="bold" />
            <span className="hidden md:inline">Table</span>
          </button>
          <button
            type="button"
            aria-label="Switch to card grid view"
            aria-pressed={viewMode === "grid"}
            onClick={() => onViewModeChange("grid")}
            className={cn(
              "flex h-8 items-center gap-1.5 rounded-[length:var(--radius-sm)] px-2.5 text-xs font-medium transition-colors touch-manipulation",
              viewMode === "grid"
                ? "bg-pop text-on-pop"
                : "text-muted hover:text-foreground",
            )}
          >
            <SquaresFour size={14} weight="bold" />
            <span className="hidden md:inline">Cards</span>
          </button>
        </div>
      </div>
    </div>
  </div>
);
}
