"use client";

import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { useProgress } from "@/components/providers/ProgressProvider";
import { lessonHref } from "@/lib/course/nav";
import { lessonId } from "@/lib/course/nav";
import { cn } from "@/lib/utils";

/**
 * Practice-progress island for the module page. Reads the solved set from
 * ProgressProvider (client-only localStorage) — the surrounding page stays
 * a server component.
 */
export function ModulePracticeProgress({
  moduleSlug,
  problemSlugs,
}: {
  moduleSlug: string;
  problemSlugs: readonly string[];
}) {
  const { solved } = useProgress();
  const total = problemSlugs.length;
  const done = problemSlugs.filter((slug) =>
    solved.has(lessonId(moduleSlug, slug)),
  ).length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <Link
      href={lessonHref(moduleSlug, "practice")}
      className="group inline-flex items-center gap-3 rounded-[length:var(--radius-md)] border border-accent/30 bg-accent/[0.06] px-3.5 py-2.5 transition hover:border-accent/55 hover:bg-accent/[0.09]"
    >
      <span className="min-w-14 font-mono text-sm tabular-nums text-foreground">
        {done}/{total} solved
      </span>
      <span
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${pct}% of this module's problems solved`}
        className="h-1.5 w-24 overflow-hidden rounded-full bg-accent/20"
      >
        <span
          className={cn("block h-full rounded-full bg-accent", pct === 0 && "opacity-30")}
          style={{ width: `${pct}%` }}
        />
      </span>
      <span className="inline-flex items-center gap-1 text-sm font-medium text-accent">
        Practice
        <ArrowRight
          weight="bold"
          className="h-3.5 w-3.5 transition group-hover:translate-x-0.5"
        />
      </span>
    </Link>
  );
}