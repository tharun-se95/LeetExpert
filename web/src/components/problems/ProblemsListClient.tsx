"use client";

import { useMemo, useState } from "react";
import { FunnelSimple, MagnifyingGlass } from "@phosphor-icons/react";
import { useProgress } from "@/components/providers/ProgressProvider";
import { getFamilyTheme } from "@/lib/visual/familyTheme";
import { moduleFamily, type ProblemGroup } from "@/lib/course/manifest";
import {
  flattenProblems,
  filterProblems,
  type DifficultyFilter,
  type StatusFilter,
} from "@/lib/course/problemsFilters";
import { ProblemFilterPanel, type TopicOption } from "@/components/problems/ProblemFilterPanel";
import { ProblemFilterSheet } from "@/components/problems/ProblemFilterSheet";
import { ProblemsFlatList } from "@/components/problems/ProblemsFlatList";
import { cn } from "@/lib/utils";

const NEUTRAL_DOT = "var(--muted)";

export function ProblemsListClient({ groups }: { groups: ProblemGroup[] }) {
  const { solved, solvedCount, totalProblemCount } = useProgress();
  const [query, setQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>("All");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [topicFilter, setTopicFilter] = useState<Set<string>>(new Set());
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const flat = useMemo(() => flattenProblems(groups), [groups]);

  const filtered = useMemo(
    () =>
      filterProblems(flat, {
        query,
        difficulty: difficultyFilter,
        status: statusFilter,
        topics: topicFilter,
        solved,
      }),
    [flat, query, difficultyFilter, statusFilter, topicFilter, solved],
  );

  const topics: TopicOption[] = useMemo(
    () =>
      groups.map((g) => {
        const familyId = moduleFamily(g.module);
        const solvedInModule = g.problems.filter((p) =>
          solved.has(`${g.module.slug}/${p.slug}`),
        ).length;
        return {
          slug: g.module.slug,
          label: g.module.shortTitle,
          count: g.problems.length,
          solvedCount: solvedInModule,
          color: familyId ? getFamilyTheme(familyId).accent : NEUTRAL_DOT,
        };
      }),
    [groups, solved],
  );

  const toggleTopic = (slug: string) => {
    setTopicFilter((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const remaining = Math.max(0, totalProblemCount - solvedCount);
  const pct =
    totalProblemCount > 0 ? Math.round((solvedCount / totalProblemCount) * 100) : 0;

  const activeFilterCount =
    (difficultyFilter !== "All" ? 1 : 0) +
    (statusFilter !== "All" ? 1 : 0) +
    topicFilter.size;
  const hasActiveFilters = query.trim().length > 0 || activeFilterCount > 0;

  // Names whichever filters are actually active, so the empty state reads
  // "Nothing matches Hard · Unsolved · Two Pointers" rather than a generic
  // "try loosening a filter" that doesn't say which one to loosen.
  const emptyMessage = useMemo(() => {
    if (!hasActiveFilters) return undefined;
    const parts: string[] = [];
    if (query.trim()) parts.push(`"${query.trim()}"`);
    if (difficultyFilter !== "All") parts.push(difficultyFilter);
    if (statusFilter !== "All") parts.push(statusFilter);
    if (topicFilter.size > 0) {
      const labels = topics
        .filter((t) => topicFilter.has(t.slug))
        .map((t) => t.label);
      parts.push(labels.join(", "));
    }
    return `Nothing matches ${parts.join(" · ")}. Try loosening one filter.`;
  }, [hasActiveFilters, query, difficultyFilter, statusFilter, topicFilter, topics]);

  const clearFilters = () => {
    setQuery("");
    setDifficultyFilter("All");
    setStatusFilter("All");
    setTopicFilter(new Set());
  };

  const filterPanelProps = {
    status: statusFilter,
    onStatusChange: setStatusFilter,
    difficulty: difficultyFilter,
    onDifficultyChange: setDifficultyFilter,
    topics,
    selectedTopics: topicFilter,
    onToggleTopic: toggleTopic,
    hasActiveFilters,
    onClearFilters: clearFilters,
  };

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

          <label
            className={cn(
              "mt-6 flex min-h-11 items-center gap-3 rounded-[length:var(--radius-lg)] border border-border bg-elevated px-4 py-3",
              "transition-[border-color,background-color] duration-[var(--dur-fast)] ease-[var(--ease)] motion-reduce:transition-none",
              "focus-within:border-accent/45 focus-within:bg-accent/[0.04]",
            )}
          >
            <MagnifyingGlass className="h-4 w-4 shrink-0 text-muted" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by problem, module, or difficulty…"
              aria-label="Search problems"
              className="min-w-0 flex-1 appearance-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted focus-visible:outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center text-xs font-medium text-muted transition-colors duration-[var(--dur-fast)] ease-[var(--ease)] hover:text-foreground motion-reduce:transition-none"
              >
                Clear
              </button>
            ) : null}
          </label>

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
        */}
        <div className="mt-6 grid min-h-0 flex-1 gap-6 lg:grid-cols-[272px_1fr]">
          <aside className="hidden lg:flex lg:h-full lg:min-h-0 lg:flex-col">
            <ProblemFilterPanel {...filterPanelProps} />
          </aside>

          <div className="flex h-full min-h-0 flex-col">
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
          "mt-1 font-display text-xl font-semibold tracking-tight tabular-nums sm:text-2xl",
          tone === "good" && "text-good",
        )}
      >
        {value}
      </p>
      <p className="mt-0.5 truncate text-[11px] text-muted sm:text-xs">{hint}</p>
    </div>
  );
}
