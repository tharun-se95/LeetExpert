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
        "group relative flex flex-col justify-between overflow-hidden rounded-[length:var(--radius-lg)] border p-4.5 transition-all duration-[var(--dur-fast)] ease-[var(--ease)] shadow-elevation motion-reduce:transition-none touch-manipulation",
        isSolved
          ? "border-good/30 bg-good/[0.03] hover:border-good/50"
          : "border-border/70 bg-elevated hover:-translate-y-0.5 hover:border-accent/40",
      )}
    >
      {/* Specular top hairline */}
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-px transition-opacity duration-300",
          isSolved
            ? "bg-gradient-to-r from-transparent via-good-line/60 to-transparent opacity-80"
            : "bg-gradient-to-r from-transparent via-accent/35 to-transparent opacity-60 group-hover:opacity-100",
        )}
        aria-hidden
      />

      <div>
        {/* Top Header: ID, Difficulty & Solved state */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-medium text-muted">
              #{problem.id}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-[length:var(--radius-xs)] border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide",
                difficultyBadgeClass(problem.difficulty),
              )}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current shrink-0" aria-hidden />
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
              "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all duration-[var(--dur-fast)] ease-[var(--ease)] hover:scale-105 active:scale-95 touch-manipulation focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent",
              isSolved
                ? "checkbox-glow-good border-good bg-good text-on-pop"
                : "checkbox-glow-accent border-border bg-transparent hover:border-accent hover:bg-accent/10",
            )}
          >
            {isSolved ? <Check size={11} weight="bold" /> : null}
          </button>
        </div>

        {/* Title */}
        <h3 className="font-display text-base font-bold text-foreground group-hover:text-mark transition-colors duration-[var(--dur-fast)] ease-[var(--ease)] line-clamp-2">
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
              className="rounded-[length:var(--radius-xs)] bg-surface/80 px-2 py-0.5 text-[11px] text-muted font-medium transition-colors duration-[var(--dur-fast)] ease-[var(--ease)] group-hover:text-foreground"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Action CTA */}
      <div className="mt-4 pt-3 border-t border-border/40">
        <Link
          href={href}
          className={cn(
            "flex w-full min-h-9 items-center justify-center gap-1.5 rounded-[length:var(--radius-md)] border text-xs font-semibold transition-all duration-[var(--dur-fast)] ease-[var(--ease)] shadow-elevation touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
            isCourseProblem
              ? "border-accent/35 bg-accent/10 text-accent hover:border-accent/60 hover:bg-accent/20"
              : "border-border/80 bg-surface/80 text-foreground hover:border-accent/40 hover:bg-elevated hover:text-mark",
          )}
        >
          <span>{isCourseProblem ? "Launch Curriculum Sandbox" : "Launch Sandbox Workspace"}</span>
          <ArrowRight size={12} weight="bold" className="transition-transform duration-[var(--dur-fast)] ease-[var(--ease)] group-hover:translate-x-0.5" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
