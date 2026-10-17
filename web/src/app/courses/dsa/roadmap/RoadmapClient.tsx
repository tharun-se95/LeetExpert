"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  CheckCircle,
  Circle,
  FileText,
  Lock,
  MapTrifold,
  Target,
  TreeStructure,
} from "@phosphor-icons/react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { useProgress } from "@/components/providers/ProgressProvider";
import {
  MODULES,
  STAGES,
  moduleFamily,
  type ModuleMeta,
} from "@/lib/course/manifest";
import { familyCssVars } from "@/lib/visual/familyTheme";
import { cn } from "@/lib/utils";

const STAGE_UNLOCKS: Record<number, { unlocks: string; prerequisiteText: string }> = {
  0: {
    prerequisiteText: "Entry point — no prerequisites required",
    unlocks: "Mathematical rigor, Big-O asymptotic analysis, and memory mental models",
  },
  1: {
    prerequisiteText: "Requires Stage 0 foundations (pointers, memory layouts, Big-O)",
    unlocks: "Contiguous vs node-based collections: Array buffer resizing, hash chaining, and pointer manipulation",
  },
  2: {
    prerequisiteText: "Requires Stage 1 linear collections (Arrays, Strings, Hash Tables)",
    unlocks: "Turning O(N²) nested loops into O(N) or O(log N) optimal traversal patterns",
  },
  3: {
    prerequisiteText: "Requires Stage 0 recursion & Stage 1 pointer traversal",
    unlocks: "Hierarchical branching, tree recursion, binary search trees, and priority heaps",
  },
  4: {
    prerequisiteText: "Requires Stages 1–3 (Trees, Queues, Sorting, Arrays)",
    unlocks: "Global input reasoning: greedy interval scheduling, graph traversal, and dynamic programming subproblems",
  },
};

export function RoadmapClient() {
  const [activeStageFilter, setActiveStageFilter] = useState<number | "all">("all");
  const { visited } = useProgress();

  const stagesWithData = useMemo(() => {
    return STAGES.map((stage) => {
      const stageModules = MODULES.filter((m) => m.stage === stage.number);
      const totalLessonsInStage = stageModules.reduce(
        (sum, m) => sum + m.lessons.length,
        0,
      );
      const visitedInStage = stageModules.reduce((sum, m) => {
        const stageLessonIds = m.lessons.map((l) => `${m.slug}/${l.slug}`);
        return sum + stageLessonIds.filter((id) => visited.has(id)).length;
      }, 0);

      const percent =
        totalLessonsInStage > 0
          ? Math.round((visitedInStage / totalLessonsInStage) * 100)
          : 0;

      return {
        ...stage,
        modules: stageModules,
        totalLessons: totalLessonsInStage,
        visitedLessons: visitedInStage,
        percent,
        meta: STAGE_UNLOCKS[stage.number] ?? {
          prerequisiteText: "",
          unlocks: "",
        },
      };
    });
  }, [visited]);

  const filteredStages =
    activeStageFilter === "all"
      ? stagesWithData
      : stagesWithData.filter((s) => s.number === activeStageFilter);

  const totalCourseLessons = MODULES.reduce((sum, m) => sum + m.lessons.length, 0);
  const totalVisited = useMemo(() => {
    let count = 0;
    for (const m of MODULES) {
      for (const l of m.lessons) {
        if (visited.has(`${m.slug}/${l.slug}`)) count++;
      }
    }
    return count;
  }, [visited]);

  const overallPercent =
    totalCourseLessons > 0
      ? Math.round((totalVisited / totalCourseLessons) * 100)
      : 0;

  return (
    <div className="relative min-h-screen pb-20">
      {/* Background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(ellipse_at_top,_color-mix(in_oklab,var(--accent)_12%,transparent),_transparent_65%)]"
      />

      <div className="relative mx-auto max-w-6xl px-4 py-8 lg:px-8 lg:py-12">
        <Breadcrumbs
          items={[
            { label: "DSA Curriculum", href: "/courses/dsa" },
            { label: "Curriculum Roadmap" },
          ]}
        />

        {/* Visual Banner Header */}
        <div className="relative mt-6 overflow-hidden rounded-[length:var(--radius-xl)] border border-border bg-surface/40 shadow-elevation">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 p-6 lg:p-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-surface/80 px-3 py-1 text-xs font-mono uppercase tracking-wider text-accent mb-3">
                <MapTrifold weight="bold" className="h-3.5 w-3.5" />
                <span>Dependency-Driven Progression</span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-tight text-foreground">
                DSA Curriculum Roadmap
              </h1>
              <p className="mt-3 text-base sm:text-lg leading-relaxed text-muted">
                Master algorithmic problem solving through structural dependency rather
                than arbitrary difficulty. Each stage establishes the memory primitives
                and asymptotic patterns that make subsequent techniques intuitive.
              </p>
              {/* Quick Stats Chip */}
              <div className="mt-5 inline-block rounded-[length:var(--radius-lg)] border border-border bg-elevated/80 p-3 shadow-elevation min-w-[240px]">
                <div className="flex items-center justify-between text-xs text-muted mb-1.5">
                  <span className="font-medium">Total Curriculum</span>
                  <span className="font-mono tabular-nums text-foreground font-semibold">
                    {overallPercent}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-surface">
                  <div
                    className="h-full rounded-full bg-accent transition-all duration-500"
                    style={{ width: `${overallPercent}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-muted">
                  <span className="font-mono text-foreground font-medium">
                    {totalVisited}
                  </span>{" "}
                  of {totalCourseLessons} lessons & drills completed
                </p>
              </div>
            </div>
            <div className="relative shrink-0 w-full lg:w-80 aspect-[16/9] rounded-[length:var(--radius-lg)] overflow-hidden border border-border shadow-elevation">
              <Image
                src="/media/banners/banner-roadmap.jpg"
                alt="DSA Curriculum Roadmap"
                fill
                sizes="(max-width: 1024px) 100vw, 320px"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>

        {/* Stage Filter Buttons & Quick Jump */}
        <div className="mt-8 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveStageFilter("all")}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-medium transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
              activeStageFilter === "all"
                ? "bg-pop text-on-pop font-semibold shadow-elevation"
                : "border border-border bg-surface text-muted hover:text-foreground",
            )}
          >
            All 5 Stages
          </button>
          {STAGES.map((s) => (
            <button
              key={s.number}
              type="button"
              onClick={() => setActiveStageFilter(s.number)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-medium transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                activeStageFilter === s.number
                  ? "bg-pop text-on-pop font-semibold shadow-elevation"
                  : "border border-border bg-surface text-muted hover:text-foreground",
              )}
            >
              Stage {s.number}: {s.title}
            </button>
          ))}

          <Link
            href="/courses/dsa/cheatsheets"
            className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted hover:text-foreground transition"
          >
            <FileText className="h-3.5 w-3.5 text-accent" />
            <span>Cheatsheets Hub</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Roadmap Visual Stages */}
        <div className="mt-10 space-y-12">
          {filteredStages.map((stage, idx) => (
            <div
              key={stage.number}
              id={`stage-${stage.number}`}
              className="relative rounded-[length:var(--radius-xl)] border border-border bg-elevated/40 p-5 sm:p-7 shadow-elevation backdrop-blur-xs"
            >
              {/* Stage Header */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-border/80 pb-5">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/15 font-mono text-xs font-bold text-accent">
                      {stage.number}
                    </span>
                    <span className="font-mono text-xs font-semibold uppercase tracking-wider text-accent">
                      Stage {stage.number}
                    </span>
                  </div>
                  <h2 className="mt-1 font-display text-2xl font-bold uppercase tracking-tight text-foreground sm:text-3xl">
                    {stage.title}
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
                    {stage.description}
                  </p>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                  <span className="font-mono text-xs tabular-nums text-muted">
                    Stage Progress: {stage.visitedLessons}/{stage.totalLessons} ({stage.percent}%)
                  </span>
                  <div className="h-1.5 w-32 overflow-hidden rounded-full bg-surface">
                    <div
                      className="h-full rounded-full bg-mark transition-all duration-500"
                      style={{ width: `${stage.percent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Unlocks & Dependency Info Banner */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs rounded-[length:var(--radius-md)] bg-surface/60 border border-border/60 p-3.5">
                <div>
                  <span className="font-semibold text-foreground">Prerequisites:</span>{" "}
                  <span className="text-muted">{stage.meta.prerequisiteText}</span>
                </div>
                <div>
                  <span className="font-semibold text-accent">Unlocks:</span>{" "}
                  <span className="text-muted">{stage.meta.unlocks}</span>
                </div>
              </div>

              {/* Module Cards Grid */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stage.modules.map((mod: ModuleMeta) => {
                  const family = moduleFamily(mod);
                  const concepts = mod.lessons.filter((l) => l.type === "concept");
                  const problems = mod.lessons.filter((l) => l.type === "problem");
                  const visitedLessonsCount = mod.lessons.filter((l) =>
                    visited.has(`${mod.slug}/${l.slug}`),
                  ).length;
                  const isAvailable = mod.status === "available";
                  const isDone =
                    isAvailable &&
                    mod.lessons.length > 0 &&
                    visitedLessonsCount === mod.lessons.length;

                  return (
                    <div
                      key={mod.slug}
                      style={family ? familyCssVars(family) : undefined}
                      className={cn(
                        "group flex flex-col justify-between rounded-[length:var(--radius-lg)] border border-border bg-elevated p-4 shadow-elevation transition hover:border-accent/40",
                        !isAvailable && "opacity-60 bg-surface/30",
                      )}
                    >
                      <div>
                        {/* Top row: Module index & status */}
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="font-mono text-[11px] text-muted">
                            Module {mod.number}
                          </span>
                          {isAvailable ? (
                            isDone ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-good/15 px-2 py-0.5 font-mono text-[10px] font-semibold text-good">
                                <CheckCircle weight="bold" className="h-3 w-3" />
                                Complete
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 font-mono text-[10px] text-muted">
                                <Circle weight="bold" className="h-2.5 w-2.5 text-accent" />
                                {visitedLessonsCount}/{mod.lessons.length}
                              </span>
                            )
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted">
                              <Lock weight="bold" className="h-2.5 w-2.5" />
                              Soon
                            </span>
                          )}
                        </div>

                        {/* Title & Description */}
                        <h3 className="font-display text-base font-bold tracking-tight text-foreground group-hover:text-accent transition-colors">
                          <Link href={`/courses/dsa/${mod.slug}`} className="hover:underline">
                            {mod.title}
                          </Link>
                        </h3>
                        <p className="mt-1.5 text-xs leading-relaxed text-muted line-clamp-2">
                          {mod.description}
                        </p>
                      </div>

                      {/* Footer actions & counts */}
                      <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3 text-muted font-mono text-[11px]">
                          <span className="flex items-center gap-1">
                            <BookOpen weight="bold" className="h-3 w-3 text-accent" />
                            {concepts.length}
                          </span>
                          {problems.length > 0 ? (
                            <span className="flex items-center gap-1">
                              <Target weight="bold" className="h-3 w-3 text-accent" />
                              {problems.length}
                            </span>
                          ) : null}
                        </div>

                        <div className="flex items-center gap-2">
                          <Link
                            href={`/courses/dsa/${mod.slug}/concept-map`}
                            title="Interactive Concept Map"
                            className="inline-flex h-7 w-7 items-center justify-center rounded-[length:var(--radius-xs)] border border-border bg-surface text-muted hover:text-accent hover:border-accent/40 transition"
                          >
                            <TreeStructure weight="bold" className="h-3.5 w-3.5" />
                          </Link>
                          <Link
                            href={`/courses/dsa/${mod.slug}`}
                            className="inline-flex items-center gap-1 font-medium text-xs text-accent hover:underline"
                          >
                            <span>Open</span>
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Stage Transition Arrow */}
              {idx < filteredStages.length - 1 && activeStageFilter === "all" ? (
                <div className="mt-8 flex justify-center">
                  <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/90 px-3 py-1 font-mono text-[11px] text-muted shadow-elevation">
                    <ArrowDown weight="bold" className="h-3.5 w-3.5 text-accent" />
                    <span>Unlocks Next Stage Techniques</span>
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
