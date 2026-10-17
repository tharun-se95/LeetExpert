import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Code,
  Cpu,
  FileText,
  Lock,
  MapTrifold,
  Sparkle,
  TreeStructure,
} from "@phosphor-icons/react/dist/ssr";
import { ModuleGlyph } from "@/app/courses/dsa/_components/ModuleGlyph";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import {
  MODULES,
  STAGES,
  moduleFamily,
  modulesByStage,
} from "@/lib/course/manifest";
import { familyCssVars, getFamilyTheme } from "@/lib/visual/familyTheme";
import { getModuleArt } from "@/lib/course/media";
import { moduleHref } from "@/lib/course/nav";
import { overviewHref, overviewsByStage } from "@/lib/course/overviews";
import { cn } from "@/lib/utils";
import { canonicalFor } from "@/lib/seo/site";
import { JsonLd } from "@/components/seo/JsonLd";
import { courseLd, educationalCredentialLd } from "@/lib/seo/jsonLd";
import { SyncHint } from "@/components/auth/SyncHint";

export const metadata: Metadata = {
  title: "Data Structures & Algorithms Course",
  description:
    "The full DSA curriculum — 24 modules from Big-O to dynamic programming, each with visualizations, live sandboxes and solve-first problems.",
  alternates: canonicalFor("/courses/dsa"),
};

const STAGE_DIFFICULTIES: Record<number, { level: string; label: string }> = {
  0: { level: "Core Foundations", label: "Mental Models & Asymptotics" },
  1: { level: "Linear Memory", label: "Contiguous Buffers & Pointers" },
  2: { level: "Optimal Patterns", label: "Sliding Window & Binary Search" },
  3: { level: "Hierarchical", label: "Trees, Tries & Heap Partitions" },
  4: { level: "Global Reasoning", label: "Graphs & Dynamic Programming" },
};

/**
 * Full curriculum map — stages and modules. The marketing sell page lives
 * at `/`; this is where learners browse structure before (or after) starting.
 */
export default function CourseOverviewPage() {
  const availableCount = MODULES.filter(
    (m) => m.status === "available",
  ).length;

  return (
    <div className="relative overflow-hidden">
      <JsonLd data={courseLd()} />
      <JsonLd data={educationalCredentialLd()} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[36rem] bg-[radial-gradient(ellipse_at_top,_color-mix(in_oklab,var(--accent)_14%,transparent),_transparent_65%)]"
      />
      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:py-12 lg:px-8">
        {/* Navigation Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: "Courses", href: "/" },
            { label: "Data Structures & Algorithms" },
          ]}
        />

        {/* Flagship Hero Card with 3D Banner */}
        <div className="relative overflow-hidden rounded-[length:var(--radius-xl)] border border-border bg-elevated/80 backdrop-blur-md p-6 shadow-elevation sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

          <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-surface/80 px-3 py-1 font-mono text-xs uppercase tracking-wider text-accent">
                <Sparkle weight="bold" className="h-3.5 w-3.5" />
                <span>Curriculum Architecture · Zero-Install Masterclass</span>
              </div>
              <h1 className="mt-3 font-display text-3xl font-bold uppercase tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                Data Structures &amp; Algorithms
              </h1>
              <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
                {MODULES.length} modules, built from first principles. Memory
                layouts and hardware cache behavior, asymptotic operation costs,
                implemented from scratch, then drilled with solve-first problems
                and interactive visual state tracers.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href="/courses/dsa/getting-started/course-introduction"
                  className="inline-flex h-10 items-center gap-2 rounded-[length:var(--radius-md)] bg-pop px-5 text-sm font-bold text-on-pop transition hover:opacity-90"
                >
                  Start Stage 0: Foundations
                  <ArrowRight weight="bold" className="h-4 w-4" />
                </Link>
                <Link
                  href="/courses/dsa/roadmap"
                  className="inline-flex h-10 items-center gap-1.5 rounded-[length:var(--radius-md)] border border-border bg-surface/80 px-4 text-sm font-medium transition hover:border-accent/40 hover:bg-surface"
                >
                  <MapTrifold weight="bold" className="h-4 w-4 text-accent" />
                  Curriculum Roadmap
                </Link>
                <Link
                  href="/courses/dsa/cheatsheets"
                  className="inline-flex h-10 items-center gap-1.5 rounded-[length:var(--radius-md)] border border-border bg-surface/80 px-4 text-sm font-medium transition hover:border-accent/40 hover:bg-surface"
                >
                  <FileText weight="bold" className="h-4 w-4 text-accent" />
                  Cheatsheets Hub
                </Link>
              </div>
            </div>

            {/* 3D Visual Asset Column */}
            <div className="lg:col-span-5">
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[length:var(--radius-lg)] border border-border bg-surface/50 shadow-elevation">
                <Image
                  src="/media/banners/banner-course-overview.jpg"
                  alt="leetExpert 3D Data Structures and Algorithms Curriculum Overview"
                  fill
                  sizes="(max-width: 1024px) 100vw, 460px"
                  className="object-cover"
                  priority
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent" />
              </div>
            </div>
          </div>

          {/* Stage Waypoint Quick-Jumper Ribbon */}
          <div className="mt-8 border-t border-border/70 pt-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="font-mono text-xs uppercase tracking-wider text-muted font-medium">
                Jump to Stage:
              </span>
              <div className="flex flex-wrap gap-2">
                {STAGES.map((s) => (
                  <a
                    key={s.number}
                    href={`#stage-${s.number}`}
                    className="inline-flex items-center gap-1.5 rounded-[length:var(--radius-sm)] border border-border bg-surface/60 px-3 py-1 font-mono text-xs text-foreground transition hover:border-accent/40 hover:bg-surface hover:text-accent"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
                    <span>Stage 0{s.number}: {s.title}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Engineering Highlights Strip */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="flex items-center gap-3 rounded-[length:var(--radius-md)] border border-border bg-elevated/70 backdrop-blur-sm p-3.5 shadow-elevation">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[length:var(--radius-xs)] bg-accent/[0.12] text-accent">
              <Code weight="bold" className="h-4.5 w-4.5" />
            </span>
            <div className="min-w-0">
              <p className="truncate font-display text-xs font-bold text-foreground">Dual Python &amp; JS</p>
              <p className="truncate text-[11px] text-muted">In-browser Pyodide &amp; V8</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-[length:var(--radius-md)] border border-border bg-elevated/70 backdrop-blur-sm p-3.5 shadow-elevation">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[length:var(--radius-xs)] bg-accent/[0.12] text-accent">
              <TreeStructure weight="bold" className="h-4.5 w-4.5" />
            </span>
            <div className="min-w-0">
              <p className="truncate font-display text-xs font-bold text-foreground">Memory Tracers</p>
              <p className="truncate text-[11px] text-muted">Pointer &amp; stack visualizers</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-[length:var(--radius-md)] border border-border bg-elevated/70 backdrop-blur-sm p-3.5 shadow-elevation">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[length:var(--radius-xs)] bg-accent/[0.12] text-accent">
              <Sparkle weight="bold" className="h-4.5 w-4.5" />
            </span>
            <div className="min-w-0">
              <p className="truncate font-display text-xs font-bold text-foreground">Socratic Coach</p>
              <p className="truncate text-[11px] text-muted">Zero-leak edge-case hints</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-[length:var(--radius-md)] border border-border bg-elevated/70 backdrop-blur-sm p-3.5 shadow-elevation">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[length:var(--radius-xs)] bg-accent/[0.12] text-accent">
              <Cpu weight="bold" className="h-4.5 w-4.5" />
            </span>
            <div className="min-w-0">
              <p className="truncate font-display text-xs font-bold text-foreground">Zero Local Setup</p>
              <p className="truncate text-[11px] text-muted">WebAssembly execution</p>
            </div>
          </div>
        </div>

        {/* Curriculum Telemetry Bar */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-pop animate-pulse" aria-hidden />
            <span>
              <strong className="text-foreground font-bold">{availableCount}</strong> of <strong className="text-foreground font-bold">{MODULES.length}</strong> modules live &amp; interactive
            </span>
          </div>
          <SyncHint />
        </div>

        {/* Curriculum Stages & Modules */}
        {STAGES.map((stage) => {
          const stageModules = modulesByStage(stage.number);
          const totalLessonsInStage = stageModules.reduce(
            (sum, m) => sum + m.lessons.length,
            0,
          );
          const stageMeta = STAGE_DIFFICULTIES[stage.number] ?? {
            level: "Core",
            label: "Algorithmic Pattern",
          };
          const stageOverviews = overviewsByStage(stage.number);

          return (
            <section
              key={stage.number}
              id={`stage-${stage.number}`}
              className="mt-16 scroll-mt-8"
            >
              {/* Chapter hairline divider */}
              <div className="chapter-rule mb-6" />

              {/* Stage Header */}
              <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs uppercase tracking-widest text-accent font-bold">
                      Stage // 0{stage.number}
                    </span>
                    <span className="rounded-[length:var(--radius-xs)] border border-border bg-surface px-2 py-0.5 font-mono text-[10px] text-muted">
                      {stageMeta.level}
                    </span>
                  </div>
                  <h2 className="mt-2 font-display text-2xl font-bold uppercase tracking-tight text-foreground sm:text-3xl">
                    Stage {stage.number} — {stage.title}
                  </h2>
                  <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted">
                    {stage.description}
                  </p>
                </div>
                <div className="shrink-0 text-left sm:text-right">
                  <span className="font-mono text-xs text-muted">
                    {stageModules.length} modules · {totalLessonsInStage} lessons
                  </span>
                </div>
              </div>

              {/* Stage Architectural Overviews (if any) */}
              {stageOverviews.map((overview) => (
                <Link
                  key={overview.slug}
                  href={overviewHref(overview.slug)}
                  data-overview-card={overview.slug}
                  style={familyCssVars(overview.family)}
                  className="group mb-5 block rounded-[length:var(--radius-lg)] border border-border bg-elevated/90 backdrop-blur-sm p-5 shadow-elevation transition hover:border-accent/45"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1">
                      <p className="inline-flex items-center gap-2 font-mono text-[10px] tracking-wide text-muted uppercase">
                        <span
                          className="h-1.5 w-1.5 rounded-full bg-accent"
                          aria-hidden
                        />
                        Stage {stage.number} Architectural Overview
                      </p>
                      <h3 className="mt-1.5 font-display text-xl font-bold tracking-tight text-foreground group-hover:text-mark transition-colors">
                        {overview.title}
                      </h3>
                      <p className="mt-1 max-w-3xl text-[13px] leading-relaxed text-muted">
                        {overview.summary}
                      </p>
                    </div>
                    <div className="shrink-0">
                      <span
                        aria-hidden
                        className="inline-flex items-center gap-1.5 rounded-[length:var(--radius-sm)] border border-border bg-surface/80 px-3 py-1.5 font-mono text-xs font-bold text-mark transition group-hover:border-accent/40 group-hover:bg-surface"
                      >
                        Open overview
                        <ArrowRight weight="bold" className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}

              {/* Modules Grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                {stageModules.map((module) => {
                  const available = module.status === "available";
                  const family = moduleFamily(module);
                  const familyLabel = family
                    ? getFamilyTheme(family).label
                    : null;
                  const art = getModuleArt(module.slug);

                  return (
                    <Link
                      key={module.slug}
                      href={moduleHref(module.slug)}
                      style={family ? familyCssVars(family) : undefined}
                      className={cn(
                        "module-card group block overflow-hidden rounded-[length:var(--radius-lg)] border border-border bg-elevated shadow-elevation transition hover:border-accent/45",
                        !available && "opacity-70",
                      )}
                    >
                      <div className="module-card-inner h-full">
                        {/* Front Face */}
                        <div className="module-card-face module-card-front">
                          <div
                            className={cn(
                              "relative border-b border-border bg-accent/[0.08]",
                              !art && "px-3 pt-3 pb-2",
                            )}
                          >
                            {art ? (
                              <div className="relative aspect-[43/24] w-full">
                                <Image
                                  src={art.light}
                                  alt=""
                                  fill
                                  sizes="(min-width: 1024px) 560px, (min-width: 640px) 46vw, 92vw"
                                  className="module-art-light object-cover"
                                />
                                <Image
                                  src={art.dark}
                                  alt=""
                                  fill
                                  sizes="(min-width: 1024px) 560px, (min-width: 640px) 46vw, 92vw"
                                  className="module-art-dark object-cover"
                                />
                              </div>
                            ) : (
                              <div className="h-16 w-full sm:h-[4.5rem]">
                                <ModuleGlyph slug={module.slug} />
                              </div>
                            )}
                            {available && familyLabel ? (
                              <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-elevated/95 px-2 py-0.5">
                                <span
                                  className="h-1.5 w-1.5 rounded-full bg-accent"
                                  aria-hidden
                                />
                                <span className="font-mono text-[10px] tracking-wide text-muted">
                                  {familyLabel}
                                </span>
                              </span>
                            ) : null}
                            {!available ? (
                              <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 rounded-full border border-border bg-elevated/95 px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted">
                                <Lock weight="bold" className="h-3 w-3" />
                                Soon
                              </span>
                            ) : null}
                          </div>
                          <div className="flex flex-1 flex-col p-4">
                            <div className="flex items-center gap-2">
                              <span className="text-xs tabular-nums text-muted font-mono">
                                {String(module.number).padStart(2, "0")}
                              </span>
                              {available ? (
                                <span className="ml-auto font-mono text-[10px] tracking-wide text-muted">
                                  {module.lessons.length} lessons
                                </span>
                              ) : null}
                            </div>
                            <h3 className="mt-1 font-display text-sm font-bold tracking-tight text-foreground group-hover:text-mark transition-colors">
                              {module.title}
                            </h3>
                          </div>
                        </div>

                        {/* Back Face */}
                        <div className="module-card-face module-card-back bg-elevated">
                          <div className="flex flex-1 flex-col p-4">
                            <div className="module-card-back-head" aria-hidden>
                              <span className="text-xs tabular-nums text-muted font-mono">
                                {String(module.number).padStart(2, "0")}
                              </span>
                              <p className="mt-1.5 text-sm font-bold text-mark">
                                {module.title}
                              </p>
                            </div>
                            <p className="mt-2 flex-1 text-[13px] leading-relaxed text-muted">
                              {module.description}
                            </p>
                            <span
                              aria-hidden
                              className="mt-3 inline-flex items-center gap-1.5 font-mono text-[10px] tracking-wide text-mark"
                            >
                              Open module
                              <ArrowRight weight="bold" className="h-3 w-3" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
