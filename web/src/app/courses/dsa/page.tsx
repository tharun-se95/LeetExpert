import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Lock } from "@phosphor-icons/react/dist/ssr";
import { ModuleGlyph } from "@/app/courses/dsa/_components/ModuleGlyph";
import {
  MODULES,
  STAGES,
  moduleFamily,
  modulesByStage,
} from "@/lib/course/manifest";
import { familyCssVars, getFamilyTheme } from "@/lib/visual/familyTheme";
import { getModuleArt } from "@/lib/course/media";
import { moduleHref } from "@/lib/course/nav";
import { cn } from "@/lib/utils";
import { canonicalFor } from "@/lib/seo/site";
import { JsonLd } from "@/components/seo/JsonLd";
import { courseLd } from "@/lib/seo/jsonLd";

/**
 * This page had no metadata export at all, so it inherited the layout's
 * default title ("leetExpert") — the curriculum map, the single most
 * link-worthy page in the course, was competing for search results with
 * a title that said nothing about it.
 */
export const metadata: Metadata = {
  title: "Data Structures & Algorithms Course",
  description:
    "The full DSA curriculum — 24 modules from Big-O to dynamic programming, each with visualizations, live sandboxes and solve-first problems.",
  alternates: canonicalFor("/courses/dsa"),
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
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(ellipse_at_top,_color-mix(in_oklab,var(--accent)_12%,transparent),_transparent_60%)]"
      />
      <div className="relative mx-auto max-w-6xl px-4 py-12 lg:px-8 lg:py-16">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent">
          Curriculum
        </p>
        <h1 className="mt-3 max-w-2xl font-display text-4xl font-bold tracking-tight text-balance uppercase sm:text-5xl">
          Course overview
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
          {MODULES.length} modules, built in order. Every structure taught from
          first principles — how it works in memory, what operations really
          cost and why, implemented from scratch — then drilled with
          solve-first problems and quizzes.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/courses/dsa/getting-started/course-introduction"
            className="inline-flex h-10 items-center gap-2 rounded-[length:var(--radius-md)] bg-pop px-4 text-sm font-semibold text-on-pop transition hover:opacity-90"
          >
            Start the course
            <ArrowRight weight="bold" className="h-4 w-4" />
          </Link>
          <Link
            href="/"
            className="inline-flex h-10 items-center rounded-[length:var(--radius-md)] border border-border px-4 text-sm font-medium transition hover:bg-surface"
          >
            Back to home
          </Link>
        </div>
        <p className="mt-4 text-sm text-muted">
          {availableCount} of {MODULES.length} modules live — the rest are
          being written in curriculum order.
        </p>

        {STAGES.map((stage) => (
          <section key={stage.number} className="mt-14">
            <div className="mb-4">
              <h2 className="text-xl font-semibold tracking-tight">
                Stage {stage.number} — {stage.title}
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-muted">
                {stage.description}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {modulesByStage(stage.number).map((module) => {
                const available = module.status === "available";
                // Each card carries its own family scope so the glyph, wash
                // band, and hover all read that module's family colour.
                const family = moduleFamily(module);
                const familyLabel = family
                  ? getFamilyTheme(family).label
                  : null;
                // Generated art when the module has it; the hand-drawn glyph
                // is the fallback, so a missing or rejected image degrades to
                // the previous design rather than to a hole in the grid.
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
                      {/* Front — art and the module's name, nothing else. */}
                      <div className="module-card-face module-card-front">
                        <div
                          className={cn(
                            "relative border-b border-border bg-accent/[0.08]",
                            !art && "px-3 pt-3 pb-2",
                          )}
                        >
                          {art ? (
                            // alt="" on purpose: the art now has the module
                            // title drawn INTO it, and an image of text that
                            // duplicates adjacent DOM text is decorative. The
                            // real heading is the sr-only h3 below — that is
                            // what carries the name to assistive tech, so the
                            // title is never trapped in pixels.
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
                            <span className="text-xs tabular-nums text-muted">
                              {String(module.number).padStart(2, "0")}
                            </span>
                            {available ? (
                              <span className="ml-auto font-mono text-[10px] tracking-wide text-muted">
                                {module.lessons.length} lessons
                              </span>
                            ) : null}
                          </div>
                          {/* The generated art carries the title now. Kept in
                              the DOM as the card's heading so screen readers,
                              the heading outline and search all still have it —
                              an image of a word is not a heading. */}
                          <h3 className="sr-only">{module.title}</h3>
                        </div>
                      </div>
                      {/* Back — the description. Kept in the DOM and not
                          aria-hidden: the flip is visual only, so this text is
                          still read aloud and still indexed. The number and
                          title ARE hidden here, to avoid announcing them twice. */}
                      <div className="module-card-face module-card-back bg-elevated">
                        <div className="flex flex-1 flex-col p-4">
                          {/* Repeats the front's heading for the flipped
                              state. Hidden from screen readers always, and
                              hidden visually when the faces stack (touch),
                              where the front's copy is right above it. */}
                          <div className="module-card-back-head" aria-hidden>
                            <span className="text-xs tabular-nums text-muted">
                              {String(module.number).padStart(2, "0")}
                            </span>
                            <p className="mt-1.5 text-sm font-semibold text-accent">
                              {module.title}
                            </p>
                          </div>
                          <p className="mt-2 flex-1 text-[13px] leading-relaxed text-muted">
                            {module.description}
                          </p>
                          <span
                            aria-hidden
                            className="mt-3 inline-flex items-center gap-1.5 font-mono text-[10px] tracking-wide text-accent"
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
        ))}
      </div>
    </div>
  );
}
