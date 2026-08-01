"use client";

import Link from "next/link";
import { Check } from "@phosphor-icons/react";
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
      {rows.map((row) => {
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
                "flex min-h-11 touch-manipulation flex-col gap-1.5 rounded-[length:var(--radius-md)] border border-border px-4 py-3.5 text-sm",
                "transition-[border-color,background-color] duration-[var(--dur-fast)] ease-[var(--ease)] motion-reduce:transition-none",
                "hover:border-accent/35 hover:bg-accent/[0.04]",
                isSolved && "border-good/25 bg-good/[0.04]",
              )}
            >
              <span className="flex items-start gap-3">
                <span className="min-w-0 flex-1 font-medium text-foreground">
                  {row.title}
                </span>
                {isSolved ? (
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-good/15 text-good">
                    <Check size={14} weight="bold" aria-label="Solved" />
                  </span>
                ) : null}
              </span>
              <span className="flex flex-wrap items-center gap-2 text-xs text-muted">
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
                {row.pattern ? <span>{row.pattern}</span> : null}
              </span>
              {row.watch_for ? (
                <span className="text-xs leading-relaxed text-muted">
                  Watch for: {row.watch_for}
                </span>
              ) : null}
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
