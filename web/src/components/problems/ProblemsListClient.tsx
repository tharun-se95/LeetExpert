"use client";

import { useState } from "react";
import { FunnelSimple } from "@phosphor-icons/react";
import { useProgress } from "@/components/providers/ProgressProvider";
import type { ProblemGroup } from "@/lib/course/manifest";
import { ProblemFilterPanel } from "@/components/problems/ProblemFilterPanel";
import { ProblemFilterSheet } from "@/components/problems/ProblemFilterSheet";
import { ProblemsFlatList } from "@/components/problems/ProblemsFlatList";
import { ProblemSearch } from "@/components/problems/ProblemSearch";
import { useProblemFilters } from "@/components/problems/useProblemFilters";
import { cn } from "@/lib/utils";

export function ProblemsListClient({ groups }: { groups: ProblemGroup[] }) {
  const { solvedCount, totalProblemCount } = useProgress();
  const {
    query,
    setQuery,
    solved,
    filtered,
    activeFilterCount,
    hasActiveFilters,
    emptyMessage,
    clearFilters,
    filterPanelProps,
  } = useProblemFilters(groups);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const remaining = Math.max(0, totalProblemCount - solvedCount);
  const pct =
    totalProblemCount > 0 ? Math.round((solvedCount / totalProblemCount) * 100) : 0;

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[22rem] bg-[radial-gradient(ellipse_at_top,_color-mix(in_oklab,var(--accent)_14%,transparent),_transparent_62%)]"
      />

      <div className="relative mx-auto flex h-full min-h-0 w-full max-w-5xl flex-col px-4 py-10 lg:px-8 lg:py-14">
        <div className="shrink-0">
          <p className="text-xs font-medium tracking-[0.14em] text-mark uppercase">
            Drill the course
          </p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl font-bold tracking-tight text-balance uppercase sm:text-5xl">
            Practice
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
            {totalProblemCount} solve-first problems, one list. Search, filter
            to exactly what you need, and drill it.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-2 sm:gap-3">
            <StatCard label="Problems" value={String(totalProblemCount)} hint="In the hub" />
            <StatCard
              label="Solved"
              value={String(solvedCount)}
              hint={`${pct}% complete`}
              tone="good"
            />
            <StatCard label="Remaining" value={String(remaining)} hint="Still to crack" />
          </div>

          <div
            className="mt-4 h-1.5 overflow-hidden rounded-full bg-border/60"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${pct}% of problems solved`}
          >
            <div
              className="h-full rounded-full bg-pop transition-[width] duration-[var(--dur)] ease-[var(--ease)] motion-reduce:transition-none"
              style={{ width: `${pct}%` }}
            />
          </div>

          <ProblemSearch query={query} onQueryChange={setQuery} className="mt-6" />

          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            aria-label={
              activeFilterCount > 0
                ? `Open filters, ${activeFilterCount} active`
                : "Open filters"
            }
            className="mt-3 flex min-h-11 w-full touch-manipulation items-center justify-center gap-2 rounded-[length:var(--radius-md)] border border-border bg-elevated text-sm font-medium text-foreground lg:hidden"
          >
            <FunnelSimple className="h-4 w-4" aria-hidden />
            Filters
            {activeFilterCount > 0 ? (
              <span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-pop px-1 text-[10px] font-bold text-on-pop">
                {activeFilterCount}
              </span>
            ) : null}
          </button>
        </div>

        {/*
          The chrome above is shrink-0 (fixed height); this row fills
          whatever's left of the viewport and is the ONLY thing that
          scrolls — each column scrolls internally instead of growing the
          page, matching the app-shell's own fixed-viewport main (see
          isProblemsListPath in AppShell.tsx).

          overflow-hidden alongside min-h-0 on both this grid and the list
          column below: Chrome shrinks a min-h-0 flex/grid item to its
          container correctly on its own, but WebKit (mobile Safari) doesn't
          reliably apply that shrink without an explicit overflow-hidden
          backstop — without it, the row can render at its content's full
          height and the list spills past the viewport instead of scrolling
          in its own box, the same failure mode `main` in AppShell.tsx
          already guards against with this exact pairing.
        */}
        <div className="mt-6 grid min-h-0 flex-1 gap-6 overflow-hidden lg:grid-cols-[272px_1fr]">
          <aside className="hidden lg:flex lg:h-full lg:min-h-0 lg:flex-col">
            <ProblemFilterPanel {...filterPanelProps} />
          </aside>

          <div className="flex h-full min-h-0 flex-col overflow-hidden">
            <p className="mb-3 shrink-0 text-sm text-muted">
              Showing <span className="font-medium text-foreground">{filtered.length}</span>{" "}
              of {totalProblemCount}
            </p>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <ProblemsFlatList
                problems={filtered}
                solved={solved}
                hasActiveFilters={hasActiveFilters}
                emptyMessage={emptyMessage}
                onClearFilters={clearFilters}
              />
            </div>
          </div>
        </div>
      </div>

      <ProblemFilterSheet
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        resultCount={filtered.length}
        {...filterPanelProps}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  tone?: "good";
}) {
  return (
    <div className="rounded-[length:var(--radius-lg)] border border-border bg-elevated shadow-elevation px-2.5 py-3 sm:px-4 sm:py-3.5">
      <p className="text-[10px] font-medium tracking-[0.12em] text-muted uppercase sm:text-[11px]">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 font-display text-xl font-bold tracking-tight tabular-nums sm:text-2xl",
          tone === "good" && "text-good",
        )}
      >
        {value}
      </p>
      <p className="mt-0.5 truncate text-[11px] text-muted sm:text-xs">{hint}</p>
    </div>
  );
}
