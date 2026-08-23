"use client";

import Link from "next/link";
import { ArrowRight, Check } from "@phosphor-icons/react";
import { useProgress } from "@/components/providers/ProgressProvider";
import { lessonId } from "@/lib/course/nav";
import type { PracticeProblemRow } from "@/lib/content/parsePracticeProblems";
import {
  difficultyBadgeClass,
  type Difficulty,
} from "@/lib/course/problemDifficulty";
import { cn } from "@/lib/utils";

function asDifficulty(value: string): Difficulty | null {
  if (value === "Easy" || value === "Medium" || value === "Hard") return value;
  return null;
}

/** The module's actionable checklist — a plain divided list, not a boxed card. */
export function PracticeProblemsList({
  moduleSlug,
  moduleTitle,
  rows,
}: {
  moduleSlug: string;
  moduleTitle: string;
  rows: PracticeProblemRow[];
}) {
  const { solved } = useProgress();
  const solvedCount = rows.filter((row) =>
    solved.has(lessonId(moduleSlug, row.slug)),
  ).length;

  return (
    <section className="my-10" aria-labelledby="problems">
      <header className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {/* Same family-accent rule + display heading as the article's own h2s (globals.css .handbook-prose h2). */}
          <span
            aria-hidden
            className="mb-2 block h-[3px] w-10 rounded-[length:var(--radius-xs)] bg-[var(--family-accent,var(--accent))]"
          />
          <h2
            id="problems"
            className="font-display text-[1.44em] font-semibold tracking-[-0.015em] text-foreground"
          >
            Problems
          </h2>
          <p className="mt-1 text-sm text-muted">
            <span className="font-medium text-foreground">{moduleTitle}</span>
            {" — "}work them in order; difficulty ascends.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end sm:gap-0">
          <p className="font-mono text-2xl font-bold tabular-nums text-foreground">
            {solvedCount}
            <span className="text-muted">/{rows.length}</span>
          </p>
          <p className="font-mono text-[10px] tracking-wide text-muted uppercase">
            solved
          </p>
        </div>
      </header>

      <ol>
        {rows.map((row, i) => {
          const id = lessonId(moduleSlug, row.slug);
          const isSolved = solved.has(id);
          const difficulty = row.difficulty
            ? asDifficulty(row.difficulty)
            : null;
          return (
            <li
              key={row.slug}
              className={cn(
                "border-b border-border",
                i === rows.length - 1 && "border-b-0",
              )}
            >
              <Link
                href={row.href}
                className={cn(
                  "group flex min-h-11 touch-manipulation items-start gap-3 py-3.5 text-sm",
                  "transition-colors duration-[var(--dur-fast)] ease-[var(--ease)] motion-reduce:transition-none",
                  "hover:bg-accent/[0.04]",
                  isSolved && "bg-good/[0.03]",
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-semibold tabular-nums",
                    isSolved
                      ? "bg-good/15 text-good"
                      : "bg-accent/10 text-mark",
                  )}
                >
                  {isSolved ? (
                    <Check size={14} weight="bold" aria-label="Solved" />
                  ) : (
                    i + 1
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span className="min-w-0 font-medium text-foreground">
                      {row.title}
                    </span>
                    {row.difficulty ? (
                      <span
                        className={cn(
                          "rounded-[length:var(--radius-xs)] border px-2 py-0.5 font-mono text-[11px] uppercase tracking-wide",
                          difficulty
                            ? difficultyBadgeClass(difficulty)
                            : "border-border text-muted",
                        )}
                      >
                        {row.difficulty}
                      </span>
                    ) : null}
                  </span>
                  {row.pattern ? (
                    <span className="mt-1 block text-xs text-muted">
                      {row.pattern}
                    </span>
                  ) : null}
                  {row.watch_for ? (
                    <span className="mt-1 block text-xs leading-relaxed text-muted">
                      Watch for: {row.watch_for}
                    </span>
                  ) : null}
                </span>
                <ArrowRight
                  weight="bold"
                  className="mt-1 h-4 w-4 shrink-0 text-muted transition group-hover:text-accent"
                />
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
