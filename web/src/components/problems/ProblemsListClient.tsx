"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  MagnifyingGlass,
  Target,
} from "@phosphor-icons/react";
import { ModuleGlyph } from "@/components/course/ModuleGlyph";
import { useProgress } from "@/components/providers/ProgressProvider";
import { STAGES, type ProblemGroup } from "@/lib/course/manifest";
import { lessonHref, lessonId, problemHref } from "@/lib/course/nav";
import {
  difficultyBadgeClass,
  difficultyFilterChipClass,
  getProblemDifficulty,
  type Difficulty,
} from "@/lib/course/problemDifficulty";
import { cn } from "@/lib/utils";

type DifficultyFilter = "All" | Difficulty;

const DIFFICULTY_FILTERS: DifficultyFilter[] = [
  "All",
  "Easy",
  "Medium",
  "Hard",
];

export function ProblemsListClient({ groups }: { groups: ProblemGroup[] }) {
  const { solved, solvedCount, totalProblemCount } = useProgress();
  const [query, setQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] =
    useState<DifficultyFilter>("All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return groups
      .map((g) => ({
        ...g,
        problems: g.problems.filter((p) => {
          const difficulty = getProblemDifficulty(p.slug);
          if (
            difficultyFilter !== "All" &&
            difficulty !== difficultyFilter
          ) {
            return false;
          }
          if (!q) return true;
          return (
            p.title.toLowerCase().includes(q) ||
            g.module.shortTitle.toLowerCase().includes(q) ||
            g.module.title.toLowerCase().includes(q) ||
            (difficulty?.toLowerCase().includes(q) ?? false)
          );
        }),
      }))
      .filter((g) => g.problems.length > 0);
  }, [groups, query, difficultyFilter]);

  const remaining = Math.max(0, totalProblemCount - solvedCount);
  const pct =
    totalProblemCount > 0
      ? Math.round((solvedCount / totalProblemCount) * 100)
      : 0;

  const stageTitle = (stage: number) =>
    STAGES.find((s) => s.number === stage)?.title ?? `Stage ${stage}`;

  const hasActiveFilters =
    query.trim().length > 0 || difficultyFilter !== "All";

  const clearFilters = () => {
    setQuery("");
    setDifficultyFilter("All");
  };

  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[22rem] bg-[radial-gradient(ellipse_at_top,_color-mix(in_oklab,var(--accent)_14%,transparent),_transparent_62%)]"
      />

      <div className="relative mx-auto max-w-5xl px-4 py-10 lg:px-8 lg:py-14">
        <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">
          Drill the course
        </p>
        <h1 className="mt-3 max-w-2xl font-display text-4xl font-bold tracking-tight text-balance uppercase sm:text-5xl">
          Practice
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          {totalProblemCount} solve-first problems across the curriculum. Work
          them in module order, or jump to anything you want to drill.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <StatCard
            label="Problems"
            value={String(totalProblemCount)}
            hint="In the hub"
          />
          <StatCard
            label="Solved"
            value={String(solvedCount)}
            hint={`${pct}% complete`}
            tone="good"
          />
          <StatCard
            label="Remaining"
            value={String(remaining)}
            hint="Still to crack"
          />
        </div>

        <div
          className="mt-4 h-1.5 overflow-hidden rounded-full bg-border/60"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${pct}% of problems solved`}
        >
          <div
            className="h-full rounded-full bg-pop transition-[width] duration-[var(--dur)] ease-[var(--ease)] motion-reduce:transition-none"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="mt-4 space-y-3">
          <label
            className={cn(
              "flex items-center gap-3 rounded-[length:var(--radius-lg)] border border-border bg-elevated px-4 py-3.5",
              "transition-[border-color,background-color] duration-[var(--dur-fast)] ease-[var(--ease)] motion-reduce:transition-none",
              "focus-within:border-accent/45 focus-within:bg-accent/[0.04]",
            )}
          >
            <MagnifyingGlass
              className="h-4 w-4 shrink-0 text-muted"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by problem, module, or difficulty…"
              aria-label="Search problems"
              className="min-w-0 flex-1 appearance-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted focus-visible:outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-xs font-medium text-muted transition-colors duration-[var(--dur-fast)] ease-[var(--ease)] hover:text-foreground motion-reduce:transition-none"
              >
                Clear
              </button>
            ) : null}
          </label>

          <div
            className="flex flex-wrap items-center gap-2"
            role="group"
            aria-label="Filter by difficulty"
          >
            {DIFFICULTY_FILTERS.map((level) => {
              const active = difficultyFilter === level;
              return (
                <button
                  key={level}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setDifficultyFilter(level)}
                  className={cn(
                    "rounded-[length:var(--radius-md)] border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide",
                    "transition-[border-color,background-color,color] duration-[var(--dur-fast)] ease-[var(--ease)] motion-reduce:transition-none",
                    difficultyFilterChipClass(level, active),
                  )}
                >
                  {level}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-10 space-y-8">
          {filtered.map(({ module, problems }) => {
            const solvedInModule = problems.filter((p) =>
              solved.has(lessonId(module.slug, p.slug)),
            ).length;
            const modulePct =
              problems.length > 0
                ? Math.round((solvedInModule / problems.length) * 100)
                : 0;

            return (
              <section
                key={module.slug}
                className="overflow-hidden rounded-[length:var(--radius-lg)] border border-border bg-elevated"
              >
                <div className="flex flex-col gap-4 border-b border-border bg-accent/[0.06] px-4 py-4 sm:flex-row sm:items-center sm:px-5">
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    <div className="hidden h-14 w-20 shrink-0 sm:block">
                      <ModuleGlyph slug={module.slug} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-mono text-[10px] tracking-wide text-muted uppercase">
                        Stage {module.stage} · {stageTitle(module.stage)}
                      </p>
                      <h2 className="mt-0.5 font-display text-lg font-semibold tracking-tight">
                        <span className="tabular-nums text-muted">
                          {String(module.number).padStart(2, "0")}
                        </span>{" "}
                        {module.shortTitle}
                      </h2>
                      <p className="mt-1 text-sm text-muted">
                        {solvedInModule} of {problems.length} solved
                        {hasActiveFilters
                          ? ` · showing ${problems.length} match${problems.length === 1 ? "" : "es"}`
                          : null}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <div
                      className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-border sm:block"
                      aria-hidden
                    >
                      <div
                        className="h-full rounded-full bg-accent"
                        style={{ width: `${modulePct}%` }}
                      />
                    </div>
                    <Link
                      href={lessonHref(module.slug, "practice")}
                      className="inline-flex items-center gap-1.5 rounded-[length:var(--radius-md)] border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-accent/40 hover:text-accent"
                    >
                      <Target className="h-3.5 w-3.5" weight="bold" />
                      Playbook
                    </Link>
                  </div>
                </div>

                <ol className="divide-y divide-border">
                  {problems.map((p, i) => {
                    const id = lessonId(module.slug, p.slug);
                    const isSolved = solved.has(id);
                    const difficulty = getProblemDifficulty(p.slug);
                    return (
                      <li key={p.slug}>
                        <Link
                          href={problemHref(p.slug)}
                          className={cn(
                            "group flex items-center gap-3 px-4 py-3.5 text-sm transition sm:px-5",
                            isSolved
                              ? "bg-good/[0.04] hover:bg-good/[0.07]"
                              : "hover:bg-accent/[0.04]",
                          )}
                        >
                          <span
                            className={cn(
                              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-[11px] tabular-nums",
                              isSolved
                                ? "bg-good/15 text-good"
                                : "border border-border bg-background text-muted",
                            )}
                          >
                            {isSolved ? (
                              <Check
                                size={12}
                                weight="bold"
                                aria-label="Solved"
                              />
                            ) : (
                              String(i + 1).padStart(2, "0")
                            )}
                          </span>
                          <span
                            className={cn(
                              "min-w-0 flex-1 font-medium",
                              isSolved
                                ? "text-foreground"
                                : "text-foreground group-hover:text-accent",
                            )}
                          >
                            {p.title}
                          </span>
                          {difficulty ? (
                            <span
                              className={cn(
                                "shrink-0 rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide",
                                difficultyBadgeClass(difficulty),
                              )}
                            >
                              {difficulty}
                            </span>
                          ) : null}
                          <ArrowRight
                            className="h-4 w-4 shrink-0 text-muted opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100 group-hover:text-accent"
                            weight="bold"
                          />
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              </section>
            );
          })}

          {filtered.length === 0 ? (
            <div className="rounded-[length:var(--radius-lg)] border border-dashed border-border bg-elevated px-6 py-12 text-center">
              <p className="text-sm font-medium">No matches</p>
              <p className="mt-1 text-sm text-muted">
                {query.trim()
                  ? <>
                      Nothing matches &ldquo;{query.trim()}&rdquo;
                      {difficultyFilter !== "All"
                        ? ` in ${difficultyFilter}`
                        : null}
                      . Try a module name or a shorter problem title.
                    </>
                  : `No ${difficultyFilter} problems in this view.`}
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 text-sm font-medium text-accent transition hover:opacity-80"
              >
                Clear filters
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  tone?: "good";
}) {
  return (
    <div className="rounded-[length:var(--radius-lg)] border border-border bg-elevated px-4 py-3.5">
      <p className="text-[11px] font-medium tracking-[0.12em] text-muted uppercase">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 font-display text-2xl font-semibold tracking-tight tabular-nums",
          tone === "good" && "text-good",
        )}
      >
        {value}
      </p>
      <p className="mt-0.5 text-xs text-muted">{hint}</p>
    </div>
  );
}
