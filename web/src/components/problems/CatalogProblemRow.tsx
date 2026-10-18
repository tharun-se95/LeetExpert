"use client";

import Link from "next/link";
import { ArrowRight, Check } from "@phosphor-icons/react";
import { problemHref } from "@/lib/course/nav";
import { difficultyBadgeClass } from "@/lib/course/problemDifficulty";
import type { CatalogProblem } from "@/lib/course/catalog/types";
import { cn } from "@/lib/utils";

export function CatalogProblemRow({
  problem,
  isSolved,
  onToggleSolved,
}: {
  problem: CatalogProblem;
  isSolved: boolean;
  onToggleSolved?: (problem: CatalogProblem) => void;
}) {
  const isCourseProblem = Boolean(problem.courseLessonSlug);
  const href = problemHref(problem.courseLessonSlug ?? problem.slug);

  const handleToggleClick = (e: React.MouseEvent) => {
    if (onToggleSolved) {
      e.preventDefault();
      e.stopPropagation();
      onToggleSolved(problem);
    }
  };

  return (
    <li className="group relative">
      <div
        className={cn(
          "flex min-h-11 items-center gap-3 border-l-2 border-l-transparent px-4 py-3 text-sm transition-all duration-[var(--dur-fast)] ease-[var(--ease)] motion-reduce:transition-none sm:px-5 touch-manipulation group-hover:border-l-accent",
          isSolved
            ? "bg-good/[0.03] hover:bg-good/[0.07]"
            : "hover:bg-accent/[0.06]",
        )}
      >
        {/* Solved check circle */}
        <button
          type="button"
          onClick={handleToggleClick}
          aria-label={
            isSolved
              ? `Mark #${problem.id} ${problem.title} as unsolved`
              : `Mark #${problem.id} ${problem.title} as solved`
          }
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all duration-[var(--dur-fast)] hover:scale-105 touch-manipulation",
            isSolved
              ? "checkbox-glow-good border-good bg-good text-on-pop"
              : "checkbox-glow-accent border-border bg-transparent hover:border-accent hover:bg-accent/10",
          )}
        >
          {isSolved ? <Check size={11} weight="bold" /> : null}
        </button>

        {/* Problem ID */}
        <span className="w-11 shrink-0 font-mono text-xs text-muted">
          #{problem.id}
        </span>

        {/* Title & Pattern link */}
        <Link
          href={href}
          className="min-w-0 flex-1 truncate font-medium text-foreground group-hover:text-mark focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-[length:var(--radius-xs)]"
        >
          <span className="truncate">{problem.title}</span>
          {problem.pattern ? (
            <span className="hidden text-xs text-muted font-normal sm:inline ml-2 truncate">
              · {problem.pattern}
            </span>
          ) : null}
        </Link>

        {/* Topic tags (desktop) */}
        <div className="hidden items-center gap-1.5 md:flex shrink-0">
          {problem.topics.slice(0, 2).map((t) => (
            <span
              key={t}
              className="rounded-[length:var(--radius-xs)] bg-accent/[0.08] px-2 py-0.5 text-[11px] text-muted"
            >
              {t}
            </span>
          ))}
        </div>

        {/* Target Badge */}
        {isCourseProblem ? (
          <span className="hidden sm:inline-flex shrink-0 items-center gap-1 rounded-[length:var(--radius-xs)] border border-accent/25 bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent">
            <span>Curriculum</span>
            <ArrowRight size={10} aria-hidden />
          </span>
        ) : (
          <span className="hidden sm:inline-flex shrink-0 items-center gap-1 rounded-[length:var(--radius-xs)] border border-border bg-surface px-2 py-0.5 text-[11px] font-medium text-muted group-hover:text-foreground">
            <span>Sandbox</span>
            <ArrowRight size={10} aria-hidden />
          </span>
        )}

        {/* Difficulty badge */}
        <span
          className={cn(
            "inline-flex items-center gap-1.5 shrink-0 rounded-[length:var(--radius-xs)] border px-2 py-0.5 font-mono text-[11px] uppercase tracking-wide",
            difficultyBadgeClass(problem.difficulty),
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current shrink-0" aria-hidden />
          {problem.difficulty}
        </span>
      </div>
    </li>
  );
}
