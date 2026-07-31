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
              className="flex flex-col gap-1 rounded-lg border border-border px-4 py-3 text-sm transition hover:border-foreground/25 hover:bg-surface sm:flex-row sm:flex-wrap sm:items-center sm:gap-3"
            >
              <span className="min-w-0 flex-1 font-medium text-foreground">
                {row.title}
              </span>
              <span className="flex flex-wrap items-center gap-2 text-xs text-muted">
                {row.difficulty ? (
                  <span
                    className={cn(
                      "rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide",
                      difficulty
                        ? difficultyBadgeClass(difficulty)
                        : "border-border text-muted",
                    )}
                  >
                    {row.difficulty}
                  </span>
                ) : null}
                {row.pattern ? <span>{row.pattern}</span> : null}
                {isSolved ? (
                  <span className="ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-good/15 text-good sm:ml-0">
                    <Check size={12} weight="bold" aria-label="Solved" />
                  </span>
                ) : null}
              </span>
              {row.watch_for ? (
                <span className="basis-full text-xs text-muted sm:order-last">
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
