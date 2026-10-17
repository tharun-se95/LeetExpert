"use client";

import { MagnifyingGlass } from "@phosphor-icons/react";
import { CatalogProblemRow } from "./CatalogProblemRow";
import { CatalogProblemGridCard } from "./CatalogProblemGridCard";
import { isProblemSolved } from "@/lib/course/catalog/filters";
import type { CatalogProblem, SortField } from "@/lib/course/catalog/types";
import type { ViewMode } from "./CatalogMetricsBar";

export function CatalogFlatList({
  problems,
  solved,
  onToggleSolved,
  sortBy,
  onSortChange,
  hasActiveFilters,
  emptyMessage,
  onClearFilters,
  viewMode = "list",
}: {
  problems: CatalogProblem[];
  solved: Set<string>;
  onToggleSolved: (problem: CatalogProblem) => void;
  sortBy: SortField;
  onSortChange: (sort: SortField) => void;
  hasActiveFilters: boolean;
  emptyMessage?: string;
  onClearFilters: () => void;
  viewMode?: ViewMode;
}) {
  return (
    <div className="flex flex-col gap-3">
      {/* List Toolbar */}
      <div className="flex items-center justify-between text-xs text-muted">
        <span>
          Showing <strong className="text-foreground font-medium">{problems.length}</strong> problems
        </span>
        <div className="flex items-center gap-1.5">
          <label htmlFor="catalog-sort" className="text-muted">
            Sort by:
          </label>
          <select
            id="catalog-sort"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortField)}
            className="rounded-[length:var(--radius-xs)] border border-border bg-code px-2 py-1 text-xs text-foreground focus:border-accent focus:outline-none"
          >
            <option value="id">Problem #</option>
            <option value="title">Title (A-Z)</option>
            <option value="difficulty">Difficulty</option>
            <option value="status">Solved Status</option>
          </select>
        </div>
      </div>

      {/* Empty State */}
      {problems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[length:var(--radius-lg)] border border-dashed border-border bg-elevated px-6 py-14 text-center shadow-elevation">
          <div className="relative mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-surface border border-border shadow-elevation">
            <MagnifyingGlass size={22} className="text-muted" weight="bold" aria-hidden />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-mark text-on-pop text-[9px] font-bold">
              0
            </span>
          </div>
          <p className="font-display text-base font-bold text-foreground">No matching problems found</p>
          <p className="mt-1 text-xs text-muted max-w-sm leading-relaxed">
            {emptyMessage ?? "No problems match your current combination of difficulty, topics, and search keywords."}
          </p>
          {hasActiveFilters ? (
            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={onClearFilters}
                className="inline-flex items-center gap-1.5 rounded-[length:var(--radius-md)] bg-pop px-3.5 py-1.5 text-xs font-semibold text-on-pop shadow-elevation transition-[opacity,transform] duration-[var(--dur-fast)] ease-[var(--ease)] hover:opacity-90 active:scale-95 motion-reduce:transition-none touch-manipulation"
              >
                Clear all filters
              </button>
            </div>
          ) : null}
        </div>
      ) : viewMode === "grid" ? (
        /* Visual Card Grid View */
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
          {problems.map((problem) => (
            <CatalogProblemGridCard
              key={problem.id}
              problem={problem}
              isSolved={isProblemSolved(problem, solved)}
              onToggleSolved={onToggleSolved}
            />
          ))}
        </div>
      ) : (
        /* Dense Table List View */
        <ol className="divide-y divide-border overflow-hidden rounded-[length:var(--radius-lg)] border border-border bg-elevated shadow-elevation">
          {problems.map((problem) => (
            <CatalogProblemRow
              key={problem.id}
              problem={problem}
              isSolved={isProblemSolved(problem, solved)}
              onToggleSolved={onToggleSolved}
            />
          ))}
        </ol>
      )}
    </div>
  );
}
