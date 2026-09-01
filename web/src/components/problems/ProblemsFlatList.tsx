import Link from "next/link";
import { ArrowRight, Check, MagnifyingGlass } from "@phosphor-icons/react";
import { getFamilyTheme } from "@/lib/visual/familyTheme";
import { lessonId, problemHref } from "@/lib/course/nav";
import {
  difficultyBadgeClass,
  type Difficulty,
} from "@/lib/course/problemDifficulty";
import type { FlatProblem } from "@/lib/course/problemsFilters";
import { cn } from "@/lib/utils";

/** Neutral fallback for the (in practice unreachable, but typed) null-family case. */
const NEUTRAL_DOT = "var(--muted)";

export function ProblemsFlatList({
  problems,
  solved,
  hasActiveFilters,
  emptyMessage,
  onClearFilters,
}: {
  problems: FlatProblem[];
  solved: Set<string>;
  hasActiveFilters: boolean;
  /** Composed by the caller from the active filter values — e.g.
      `Nothing matches "foo" · Hard · Unsolved · Two Pointers.` The caller
      knows the filter state; this component only renders the sentence. */
  emptyMessage?: string;
  onClearFilters: () => void;
}) {
  if (problems.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-[length:var(--radius-lg)] border border-dashed border-border bg-elevated px-6 py-12 text-center">
        <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-surface text-muted">
          <MagnifyingGlass className="h-5 w-5" aria-hidden />
        </span>
        <p className="text-sm font-medium">No matches</p>
        <p className="mt-1 text-sm text-muted">
          {emptyMessage ?? "No problems to show yet."}
        </p>
        {hasActiveFilters ? (
          <button
            type="button"
            onClick={onClearFilters}
            className="mt-4 text-sm font-medium text-mark transition hover:opacity-80"
          >
            Clear filters
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <ol className="divide-y divide-border overflow-hidden rounded-[length:var(--radius-lg)] border border-border bg-elevated shadow-elevation">
      {problems.map((p) => {
        const id = lessonId(p.moduleSlug, p.slug);
        const isSolved = solved.has(id);
        const dotColor = p.familyId ? getFamilyTheme(p.familyId).accent : NEUTRAL_DOT;
        return (
          <li key={id}>
            <Link
              href={problemHref(p.slug)}
              className={cn(
                "group flex min-h-11 touch-manipulation items-center gap-3 px-4 py-3.5 text-sm transition-[background-color] duration-[var(--dur-fast)] ease-[var(--ease)] motion-reduce:transition-none sm:px-5",
                isSolved
                  ? "bg-good/[0.05] hover:bg-good/[0.08]"
                  : "hover:bg-accent/[0.07]",
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                  isSolved
                    ? "bg-good text-white"
                    : "border border-border bg-transparent",
                )}
              >
                {isSolved ? <Check size={12} weight="bold" aria-label="Solved" /> : null}
              </span>
              <span
                className={cn(
                  "min-w-0 flex-1 truncate font-medium",
                  isSolved ? "text-foreground" : "text-foreground group-hover:text-mark",
                )}
              >
                {p.title}
              </span>
              <span className="hidden shrink-0 items-center gap-1.5 rounded-[length:var(--radius-xs)] bg-accent/[0.08] px-2 py-0.5 text-[11px] text-muted sm:inline-flex">
                <span
                  aria-hidden
                  className="h-[6px] w-[6px] shrink-0 rounded-full"
                  style={{ backgroundColor: dotColor }}
                />
                {p.moduleLabel}
              </span>
              {p.difficulty ? (
                <span
                  className={cn(
                    "shrink-0 rounded-[length:var(--radius-xs)] border px-2 py-0.5 font-mono text-[11px] uppercase tracking-wide",
                    difficultyBadgeClass(p.difficulty as Difficulty),
                  )}
                >
                  {p.difficulty}
                </span>
              ) : null}
              <ArrowRight
                className="h-4 w-4 shrink-0 text-muted opacity-50 transition-[opacity,transform,color] duration-[var(--dur-fast)] ease-[var(--ease)] group-hover:translate-x-0.5 group-hover:text-accent group-hover:opacity-100 motion-reduce:transition-none sm:opacity-0 sm:group-hover:opacity-100"
                weight="bold"
                aria-hidden
              />
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
