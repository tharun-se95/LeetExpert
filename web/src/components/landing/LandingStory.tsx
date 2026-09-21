"use client";

import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";
import { FeatureSection } from "@/components/landing/FeatureSection";
import { featureWindows, type FeatureWindowData } from "@/components/landing/FeatureWindows";
import { KICKER, STOP, TITLE } from "@/components/landing/landingClasses";
import { TypedText } from "@/components/landing/TypedText";
import { useSectionPaging } from "@/components/landing/useSectionPaging";
import { useActiveSection, useTypedText } from "@/components/landing/useSectionReveal";
import { featureSections, type FeatureSection as Section } from "@/lib/landing/features";
import {
  HERO,
  RISE_STAGGER_MS,
  countsLine,
  inside,
  stageMeta,
  type Chapter,
  type CurriculumCounts,
  type StageCard,
} from "@/lib/landing/story";
import { cn } from "@/lib/utils";

/** Reveals every typed layer and risen card when scripts never run (both start hidden). */
const NOSCRIPT_REVEAL = "[data-typed-rest]{color:inherit!important}.rise-in{opacity:1!important;transform:none!important}";

const BODY = "mt-4 max-w-2xl text-lg leading-relaxed text-muted";

/** Section order inside this component. */
const HERO_SECTION = 0;
const UNDERSTAND = 1;
const BUILD = 2;
const KEEP = 3;
const INSIDE = 4;

/**
 * The first five stops: the hero, Understand, Build and Keep — every feature
 * in the app as nine verbs (owner, 2026-09-17) — and the course stages. Each
 * types once when it becomes active. Counts, links, stage cards and the
 * windows' lessons come from the server so neither the course manifest nor
 * the filesystem readers ship to the client.
 */
export function LandingStory({
  counts,
  links,
  stages,
  features,
}: {
  counts: CurriculumCounts;
  links: { start: string; curriculum: string };
  stages: readonly StageCard[];
  features: FeatureWindowData;
}) {
  const { root, active, started } = useActiveSection<HTMLDivElement>(5);
  // Mounted once per landing page; it pages the outro's sections too.
  useSectionPaging();

  const sections = featureSections(features.counts);
  // A section's heavy windows load once it is the active stop or the next one.
  const near = (i: number) => (started[i] ?? false) || active === i - 1;
  const windows = featureWindows(features, { understand: near(UNDERSTAND), build: near(BUILD), keep: near(KEEP) });

  return (
    <div ref={root}>
      <noscript>
        <style>{NOSCRIPT_REVEAL}</style>
      </noscript>
      <Hero counts={counts} links={links} sections={sections} started={started[HERO_SECTION] ?? false} />
      {sections.map((section, i) => (
        <FeatureSection
          key={section.id}
          section={section}
          started={started[UNDERSTAND + i] ?? false}
          windows={windows}
        />
      ))}
      <Inside chapter={inside(counts)} stages={stages} started={started[INSIDE] ?? false} />
    </div>
  );
}

/** Not a snap stop itself: AppShell's desk wrapper is, so the first stop keeps the header in view. */
function Hero({
  counts,
  links,
  sections,
  started,
}: {
  counts: CurriculumCounts;
  links: { start: string; curriculum: string };
  sections: readonly Section[];
  started: boolean;
}) {
  const parts = useTypedText(started, [...HERO.lines, HERO.lede]);

  return (
    <section
      data-scroll-section
      className="grid min-h-[calc(100dvh-6rem)] content-center items-center py-16"
    >
      <div className="min-w-0">
        <p className={KICKER}>{HERO.kicker}</p>
        {/*
          One sentence per line. Sized so the longer line ("You decide if it's
          right.", 14.675em in Space Mono) fits the text column without wrapping:
          measured column 49rem from xl, 45rem+ from sm (the drawing that sat
          beside it at lg is the page backdrop now). Below sm a sentence still wraps inside its own
          line, but never across the full stop.
        */}
        <h1 className="mt-6 max-w-3xl font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-4xl lg:leading-[1.1] xl:text-5xl">
          {HERO.lines.map((line, i) => (
            <span key={line} className="block text-balance">
              <TypedText text={line} progress={parts[i] ?? 0} />
            </span>
          ))}
        </h1>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted">
          <TypedText text={HERO.lede} progress={parts[HERO.lines.length] ?? 0} />
        </p>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-foreground">{HERO.descriptor}</p>
        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
          <Link
            href={links.start}
            className="inline-flex items-center gap-2 rounded-full bg-pop px-5 py-2.5 text-base font-medium text-on-pop transition-opacity hover:opacity-90"
          >
            {HERO.start}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link
            href={links.curriculum}
            className="inline-flex items-center gap-2 border-b border-border pb-0.5 text-base text-foreground transition-colors hover:border-foreground"
          >
            {HERO.explore}
          </Link>
        </div>
        {/* The nine verbs, grouped as the sections below; each link selects its
            verb in that section and brings the section into view. */}
        {/* Columns sized to their verbs, so "Code Review Optimize" keeps one row
            where the column allows (it wrapped at an even three-way split). */}
        <nav aria-label="Features" className="mt-10 grid w-fit max-w-full gap-4 sm:grid-cols-[repeat(3,auto)] sm:gap-x-8">
          {sections.map((section) => (
            <div key={section.id} className="grid content-start gap-2 border-t border-border pt-3">
              <p className="text-[0.6875rem] font-medium tracking-[0.14em] text-muted uppercase">{section.title}</p>
              <ul className="flex flex-wrap gap-1.5">
                {section.verbs.map((verb) => (
                  <li key={verb.id}>
                    <a
                      href={`#${verb.id}`}
                      className="inline-flex rounded-[length:var(--radius-md)] border border-border bg-elevated px-2.5 py-1.5 font-display text-sm font-bold text-foreground transition-colors hover:border-foreground"
                    >
                      {verb.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <p className="mt-6 text-sm text-muted tabular-nums">{countsLine(counts)}</p>
      </div>
    </section>
  );
}

/**
 * What's inside: the counts, then one card per real course stage (owner,
 * 2026-09-15), each linking to that stage on the curriculum hub. The cards
 * rise in, staggered, when the section arrives — one attribute on the list,
 * CSS for the motion.
 */
function Inside({
  chapter,
  stages,
  started,
}: {
  chapter: Chapter;
  stages: readonly StageCard[];
  started: boolean;
}) {
  const parts = useTypedText(started, [chapter.title, ...chapter.body]);

  return (
    <section data-scroll-section className={STOP}>
      {/* mt-8: with the cards this section outgrows the viewport at 1024×768
          and on phones, so it snaps with its top under the sticky header — the
          kicker sat 2px below it at 375px and 5px at 1024px. */}
      <p className={cn(KICKER, "mt-8")}>{chapter.kicker}</p>
      <h2 className={TITLE}>
        <TypedText text={chapter.title} progress={parts[0] ?? 0} />
      </h2>
      {chapter.body.map((para, j) => (
        <p key={j} className={BODY}>
          <TypedText text={para} progress={parts[j + 1] ?? 0} />
        </p>
      ))}
      <ol data-lit={started || undefined} className="mt-10 grid max-w-3xl gap-3 sm:grid-cols-2">
        {stages.map((stage, i) => (
          <li key={stage.number} className="rise-in" style={{ transitionDelay: `${i * RISE_STAGGER_MS}ms` }}>
            <Link
              href={stage.href}
              className="group flex h-full flex-col rounded-[length:var(--radius-lg)] border border-border bg-elevated p-4 shadow-elevation transition-colors hover:border-accent/45"
            >
              <span className="flex items-center justify-between gap-3">
                <span className={KICKER}>Stage {stage.number}</span>
                <ArrowRight className="h-4 w-4 text-muted transition-colors group-hover:text-foreground" aria-hidden />
              </span>
              <span className="mt-2 font-display text-lg font-bold tracking-tight">{stage.title}</span>
              <span className="mt-1 text-sm leading-relaxed text-muted">{stage.description}</span>
              <span className="mt-3 text-xs text-muted tabular-nums">{stageMeta(stage)}</span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
