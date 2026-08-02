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

export function PracticeProblemsList({
  moduleSlug,
  rows,
}: {
  moduleSlug: string;
  rows: PracticeProblemRow[];
}) {
  const { solved } = useProgress();

  return (
    <ol className="mt-6 grid gap-2">
      {rows.map((row, i) => {
        const id = lessonId(moduleSlug, row.slug);
        const isSolved = solved.has(id);
        const difficulty = row.difficulty
          ? asDifficulty(row.difficulty)
          : null;
        return (
          <li key={row.slug}>
            <Link
              href={row.href}
              className={cn(
                "group flex min-h-11 touch-manipulation items-start gap-3 rounded-[length:var(--radius-md)] border border-border px-4 py-3.5 text-sm",
                "transition-[border-color,background-color] duration-[var(--dur-fast)] ease-[var(--ease)] motion-reduce:transition-none",
                "hover:border-accent/35 hover:bg-accent/[0.04]",
                isSolved && "border-good/25 bg-good/[0.04]",
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-semibold tabular-nums",
                  isSolved
                    ? "bg-good/15 text-good"
                    : "bg-accent/10 text-accent",
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
                        "rounded border px-2 py-0.5 font-mono text-[11px] uppercase tracking-wide",
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
  );
}
