"use client";

import { ProblemFilterPanel } from "@/components/problems/ProblemFilterPanel";
import { ProblemsFlatList } from "@/components/problems/ProblemsFlatList";
import { ProblemSearch } from "@/components/problems/ProblemSearch";
import { useProblemFilters } from "@/components/problems/useProblemFilters";
import type { ProblemGroup } from "@/lib/course/manifest";

/**
 * The practice page's list inside the landing page's Practice window: the
 * same search, filters and rows, reading the visitor's own progress. The
 * filter column shows from sm, where the window is wide enough for it.
 */
export function PracticeWindow({ groups }: { groups: ProblemGroup[] }) {
  const { query, setQuery, solved, filtered, hasActiveFilters, emptyMessage, clearFilters, filterPanelProps } =
    useProblemFilters(groups);

  return (
    <div className="grid h-full min-h-0 gap-4 sm:grid-cols-[11rem_minmax(0,1fr)]">
      <div className="hidden min-h-0 overflow-y-auto pr-1 sm:block">
        <ProblemFilterPanel {...filterPanelProps} />
      </div>
      <div className="flex min-h-0 flex-col">
        <ProblemSearch query={query} onQueryChange={setQuery} className="shrink-0" />
        <p className="mt-3 mb-2 shrink-0 text-sm text-muted">
          Showing <span className="font-medium text-foreground">{filtered.length}</span> of {groups.reduce((n, g) => n + g.problems.length, 0)}
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
  );
}
