"use client";

import Link from "next/link";
import { ArrowRight, Check } from "@phosphor-icons/react";
import { problemHref } from "@/lib/course/nav";
import { difficultyBadgeClass } from "@/lib/course/problemDifficulty";
import type { CatalogProblem } from "@/lib/course/catalog/types";
import { cn } from "@/lib/utils";

export function CatalogProblemGridCard({
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
    <div
      className={cn(
        "group relative flex flex-col justify-between rounded-[length:var(--radius-lg)] border p-4.5 transition-[background-color,border-color,transform] duration-[var(--dur-fast)] ease-[var(--ease)] shadow-elevation motion-reduce:transition-none touch-manipulation",
        isSolved
          ? "border-border bg-good/[0.03] hover:border-good/40"
          : "border-border bg-elevated hover:-translate-y-0.5 hover:border-accent/40",
      )}
    >
      <div>
        {/* Top Header: ID, Difficulty & Solved state */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-medium text-muted">
              #{problem.id}
            </span>
            <span
              className={cn(
                "rounded-[length:var(--radius-xs)] border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide",
                difficultyBadgeClass(problem.difficulty),
              )}
            >
              {problem.difficulty}
            </span>
          </div>

          <button
            type="button"
            onClick={handleToggleClick}
            aria-label={
              isSolved
                ? `Mark #${problem.id} as unsolved`
                : `Mark #${problem.id} as solved`
            }
            className={cn(
              "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all hover:scale-105 touch-manipulation",
              isSolved
                ? "border-good bg-good text-on-pop"
                : "border-border bg-transparent hover:border-mark",
            )}
          >
            {isSolved ? <Check size={11} weight="bold" /> : null}
          </button>
        </div>

        {/* Title */}
        <h3 className="font-display text-base font-bold text-foreground group-hover:text-mark transition-colors line-clamp-2">
          {problem.title}
        </h3>

        {/* Pattern Hint */}
        {problem.pattern ? (
          <p className="mt-1 text-xs text-muted font-normal line-clamp-1">
            Pattern: <span className="text-foreground/80 font-medium">{problem.pattern}</span>
          </p>
        ) : null}

        {/* Topic Pills */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {problem.topics.map((t) => (
            <span
              key={t}
              className="rounded-[length:var(--radius-xs)] bg-accent/[0.08] px-2 py-0.5 text-[11px] text-muted font-medium"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Action CTA */}
      <div className="mt-4 pt-3 border-t border-border/50">
        <Link
          href={href}
          className={cn(
            "flex w-full min-h-9 items-center justify-center gap-1.5 rounded-[length:var(--radius-md)] border text-xs font-semibold transition-colors touch-manipulation",
            isCourseProblem
              ? "border-accent/30 bg-accent/10 text-accent hover:bg-accent/20"
              : "border-border bg-surface text-foreground hover:bg-code hover:border-accent/40",
          )}
        >
          <span>{isCourseProblem ? "Launch Curriculum Sandbox" : "Launch Sandbox Workspace"}</span>
          <ArrowRight size={12} weight="bold" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
