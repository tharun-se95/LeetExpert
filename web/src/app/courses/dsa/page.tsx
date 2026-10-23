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

const STAGE_THEMES: Record<
  number,
  {
    kicker: string;
    badge: string;
    jumpDot: string;
    jumpHover: string;
  }
> = {
  0: {
    kicker: "text-good",
    badge: "border-good/40 bg-good-surface/40 text-good",
    jumpDot: "bg-good",
    jumpHover: "hover:border-good/60 hover:text-good",
  },
  1: {
    kicker: "text-warn",
    badge: "border-warn/40 bg-warn-surface/40 text-warn",
    jumpDot: "bg-warn",
    jumpHover: "hover:border-warn/60 hover:text-warn",
  },
  2: {
    kicker: "text-info",
    badge: "border-info/40 bg-info-surface/40 text-info",
    jumpDot: "bg-info",
    jumpHover: "hover:border-info/60 hover:text-info",
  },
  3: {
    kicker: "text-accent",
    badge: "border-accent/40 bg-pop/10 text-mark",
    jumpDot: "bg-accent",
    jumpHover: "hover:border-accent/60 hover:text-mark",
  },
  4: {
    kicker: "text-good",
    badge: "border-good/40 bg-good-surface/40 text-good",
    jumpDot: "bg-good",
    jumpHover: "hover:border-good/60 hover:text-good",
  },
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
        className="pointer-events-none absolute inset-x-0 top-0 h-[42rem] bg-[radial-gradient(ellipse_80%_55%_at_50%_-10%,_color-mix(in_srgb,var(--good)_16%,transparent),_color-mix(in_srgb,var(--info)_14%,transparent)_50%,_color-mix(in_srgb,var(--accent)_10%,transparent)_75%,_transparent_90%)]"
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Navigation Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: "Courses", href: "/" },
            { label: "Data Structures & Algorithms" },
          ]}
        />

        {/* Flagship Hero Card with 3D Banner */}
        <div className="relative overflow-hidden rounded-[length:var(--radius-xl)] border border-border bg-elevated/85 backdrop-blur-md p-8 sm:p-10 lg:p-12 shadow-elevation">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-good/35 to-transparent" aria-hidden />

          <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-good/40 bg-good-surface/40 px-3 py-1 font-mono text-xs uppercase tracking-wider text-good font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-good animate-pulse" aria-hidden />
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
                  className="inline-flex h-10 items-center gap-2 rounded-[length:var(--radius-md)] bg-good px-5 text-sm font-bold text-on-pop shadow-elevation transition hover:brightness-110 active:scale-[0.98]"
                >
                  Start Stage 0: Foundations
                  <ArrowRight weight="bold" className="h-4 w-4" />
                </Link>
                <Link
                  href="/courses/dsa/roadmap"
                  className="inline-flex h-10 items-center gap-1.5 rounded-[length:var(--radius-md)] border border-info/40 bg-info-surface/20 px-4 text-sm font-medium text-info transition hover:bg-info-surface/35 hover:border-info/60"
                >
                  <MapTrifold weight="bold" className="h-4 w-4 text-info" />
                  Curriculum Roadmap
                </Link>
                <Link
                  href="/courses/dsa/cheatsheets"
                  className="inline-flex h-10 items-center gap-1.5 rounded-[length:var(--radius-md)] border border-accent/40 bg-surface/80 px-4 text-sm font-medium text-foreground transition hover:border-accent hover:bg-surface"
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
                {STAGES.map((s) => {
                  const theme = STAGE_THEMES[s.number] ?? STAGE_THEMES[0];
                  return (
                    <a
                      key={s.number}
                      href={`#stage-${s.number}`}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-[length:var(--radius-sm)] border border-border bg-surface/70 px-3 py-1 font-mono text-xs text-foreground transition hover:bg-surface",
                        theme.jumpHover,
                      )}
                    >
                      <span className={cn("h-1.5 w-1.5 rounded-full", theme.jumpDot)} aria-hidden />
                      <span>Stage 0{s.number}: {s.title}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Engineering Highlights Strip */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="flex items-center gap-3 rounded-[length:var(--radius-md)] border border-good/30 bg-good-surface/25 backdrop-blur-sm p-3.5 shadow-elevation">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[length:var(--radius-xs)] bg-good/15 text-good">
              <Code weight="bold" className="h-4.5 w-4.5" />
            </span>
            <div className="min-w-0">
              <p className="truncate font-display text-xs font-bold text-foreground">Dual Python &amp; JS</p>
              <p className="truncate text-[11px] text-muted">In-browser Pyodide &amp; V8</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-[length:var(--radius-md)] border border-info/30 bg-info-surface/25 backdrop-blur-sm p-3.5 shadow-elevation">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[length:var(--radius-xs)] bg-info/15 text-info">
              <TreeStructure weight="bold" className="h-4.5 w-4.5" />
            </span>
            <div className="min-w-0">
              <p className="truncate font-display text-xs font-bold text-foreground">Memory Tracers</p>
              <p className="truncate text-[11px] text-muted">Pointer &amp; stack visualizers</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-[length:var(--radius-md)] border border-accent/30 bg-surface/80 backdrop-blur-sm p-3.5 shadow-elevation">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[length:var(--radius-xs)] bg-accent/15 text-accent">
              <Sparkle weight="bold" className="h-4.5 w-4.5" />
            </span>
            <div className="min-w-0">
              <p className="truncate font-display text-xs font-bold text-foreground">Socratic Coach</p>
              <p className="truncate text-[11px] text-muted">Zero-leak edge-case hints</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-[length:var(--radius-md)] border border-warn/30 bg-warn-surface/25 backdrop-blur-sm p-3.5 shadow-elevation">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[length:var(--radius-xs)] bg-warn/15 text-warn">
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
            <span className="h-2 w-2 rounded-full bg-good animate-pulse" aria-hidden />
            <span>
              <strong className="text-good font-bold">{availableCount}</strong> of <strong className="text-foreground font-bold">{MODULES.length}</strong> modules live &amp; interactive
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
          const stageTheme = STAGE_THEMES[stage.number] ?? STAGE_THEMES[0];
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
                    <span className={cn("font-mono text-xs uppercase tracking-widest font-bold", stageTheme.kicker)}>
                      Stage // 0{stage.number}
                    </span>
                    <span className={cn("rounded-[length:var(--radius-xs)] border px-2 py-0.5 font-mono text-[10px] font-medium", stageTheme.badge)}>
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
                  className="group mb-5 block rounded-[length:var(--radius-lg)] border border-border border-l-4 border-l-accent bg-elevated/90 backdrop-blur-sm p-5 shadow-elevation transition hover:border-accent/45"
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
              <div className="grid gap-5 sm:grid-cols-2 lg:gap-6">
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
                        "group flex flex-col overflow-hidden rounded-[length:var(--radius-lg)] border border-border/80 bg-elevated shadow-elevation transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:border-accent/60 hover:shadow-elevation focus-visible:-translate-y-1.5 motion-reduce:hover:transform-none motion-reduce:transition-none",
                        !available && "opacity-70",
                      )}
                    >
                      {/* Image Card Top / Visual Fill */}
                      <div className="relative aspect-[16/9] w-full overflow-hidden bg-surface/60 border-b border-border/70">
                        {art ? (
                          <>
                            <Image
                              src={art.light}
                              alt={module.title}
                              fill
                              sizes="(min-width: 1280px) 600px, (min-width: 640px) 50vw, 100vw"
                              className="module-art-light object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                            />
                            <Image
                              src={art.dark}
                              alt={module.title}
                              fill
                              sizes="(min-width: 1280px) 600px, (min-width: 640px) 50vw, 100vw"
                              className="module-art-dark object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                            />
                          </>
                        ) : (
                          <div className="flex h-full w-full items-center justify-center p-6 bg-gradient-to-br from-accent/10 to-transparent">
                            <ModuleGlyph slug={module.slug} />
                          </div>
                        )}

                        {/* Subtle bottom gradient scrim for grounding */}
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />

                        {/* Top Badges */}
                        <div className="absolute top-3 inset-x-3 z-10 flex items-center justify-between pointer-events-none">
                          <span className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-elevated/90 backdrop-blur-md px-2.5 py-0.5 text-xs tabular-nums text-foreground font-mono font-bold shadow-elevation">
                            #{String(module.number).padStart(2, "0")}
                          </span>
                          {available && familyLabel ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-elevated/90 backdrop-blur-md px-2.5 py-0.5 shadow-elevation">
                              <span
                                className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse"
                                aria-hidden
                              />
                              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-foreground">
                                {familyLabel}
                              </span>
                            </span>
                          ) : null}
                          {!available ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-elevated/90 backdrop-blur-md px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted shadow-elevation">
                              <Lock weight="bold" className="h-3 w-3" />
                              Soon
                            </span>
                          ) : null}
                        </div>
                      </div>

                      {/* Content Fill Body */}
                      <div className="flex flex-1 flex-col p-5 sm:p-6 bg-elevated">
                        <div className="flex items-center justify-between gap-2 text-xs text-muted font-mono mb-2">
                          <span className="font-medium text-[11px] text-muted">
                            {module.lessons.length} {module.lessons.length === 1 ? "lesson" : "lessons"}
                          </span>
                          <span className="text-[10px] uppercase tracking-wider text-muted/70">
                            Interactive Sandboxes
                          </span>
                        </div>

                        <h3 className="font-display text-lg sm:text-xl font-bold tracking-tight text-foreground group-hover:text-mark transition-colors">
                          {module.title}
                        </h3>

                        <p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted line-clamp-2 flex-1">
                          {module.description}
                        </p>

                        {/* Bottom Action Strip */}
                        <div className="mt-5 pt-3.5 flex items-center justify-between border-t border-border/60">
                          <span className="font-mono text-xs font-bold text-foreground group-hover:text-mark transition-colors inline-flex items-center gap-1.5">
                            {available ? "Explore module" : "Coming soon"}
                          </span>
                          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-border/70 bg-surface/80 group-hover:border-accent/50 group-hover:bg-accent group-hover:text-on-pop transition-all">
                            <ArrowRight
                              weight="bold"
                              className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                            />
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
