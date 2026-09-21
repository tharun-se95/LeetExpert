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
    /*
      The count+bar sit outside the link so the CTA's accessible name is
      just "Let's Practice" — inside it they were read out as part of the
      link. The stack is `items-stretch` so the bar row spans exactly the
      button's width and the two read as one control.
    */
    <div className="flex w-full max-w-xs flex-col items-stretch gap-2 sm:w-auto">
      <div className="flex items-center gap-2.5">
        <span className="font-mono text-xs tabular-nums text-foreground">
          {done}/{total} solved
        </span>
        <span
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${pct}% of this module's problems solved`}
          className="h-1.5 min-w-16 flex-1 overflow-hidden rounded-full bg-accent/20"
        >
          <span
            className={cn("block h-full rounded-full bg-accent", pct === 0 && "opacity-30")}
            style={{ width: `${pct}%` }}
          />
        </span>
      </div>
      {/*
        Solid inverted fill: --foreground/--background already swap between
        themes, so one pair gives a dark button on light paper and a light
        button on dark without a `dark:` variant. Same idiom as the
        DecisionObservatory primary button.

        `transition-opacity` rather than a bare `transition`: the bare
        utility also animates outline-color, which made the shared
        :focus-visible ring fade in from the button's own text colour
        instead of appearing at once.
      */}
      <Link
        href={lessonHref(moduleSlug, "practice")}
        className="group inline-flex h-11 items-center justify-center gap-2 rounded-[length:var(--radius-md)] bg-foreground px-5 text-sm font-semibold text-background transition-opacity hover:opacity-90 motion-reduce:transition-none"
      >
        {"Let's Practice"}
        <ArrowRight
          weight="bold"
          className="h-4 w-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
        />
      </Link>
    </div>
  );
}
