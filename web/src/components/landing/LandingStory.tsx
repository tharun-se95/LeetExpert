"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";
import { CompanyLogoStrip } from "@/components/landing/CompanyLogoStrip";
import { FeatureSection } from "@/components/landing/FeatureSection";
import { featureWindows, type FeatureWindowData } from "@/components/landing/FeatureWindows";
import { HeroFloor } from "@/components/landing/HeroFloor";
import { KICKER, STOP } from "@/components/landing/landingClasses";
import { MarkedHeading } from "@/components/landing/MarkedHeading";
import { SectionDeco } from "@/components/landing/SectionDeco";
import { usePopIn } from "@/components/landing/usePopIn";
import { useSmoothScroll } from "@/components/landing/useSmoothScroll";
import { useActiveSection } from "@/components/landing/useSectionReveal";
import { featureSections } from "@/lib/landing/features";
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
import { familyCssVars } from "@/lib/visual/familyTheme";
import { cn } from "@/lib/utils";

/** Reveals every risen card when scripts never run (they start hidden). */
const NOSCRIPT_REVEAL = ".rise-in{opacity:1!important;transform:none!important}";

/** Section order inside this component: which have arrived drives lazy loading and the cards' rise. */
const UNDERSTAND = 1;
const BUILD = 2;
const KEEP = 3;
const INSIDE = 4;

/**
 * The hero, Understand, Build and Keep — every feature in the app as nine
 * verbs (owner, 2026-09-17) — and the course stages, on a page that scrolls
 * like any other (owner, 2026-09-23: "like a regular landing page scroll").
 * Motion as the page moves is CSS on view timelines (globals.css, "Landing
 * motion"); the only script here watches which sections have arrived, so heavy
 * features load once they are near and the stage cards rise. Counts, links,
 * stage cards and the windows' lessons come from the server so neither the
 * course manifest nor the filesystem readers ship to the client.
 * Spec: docs/superpowers/specs/2026-09-23-landing-natural-scroll-3d-hero-design.md
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
  // Once per landing page: it pops the outro's rows too.
  usePopIn();
  useSmoothScroll();

  const sections = featureSections(features.counts);
  // A section's heavy windows load once it has arrived, is the next one, or
  // lies behind the active one: a jump past it (a #link, a restored scroll)
  // never crosses the middle band, and scrolling back up met stand-ins.
  const near = (i: number) => (started[i] ?? false) || active >= i - 1;
  const windows = featureWindows(features, {
    understand: near(UNDERSTAND),
    build: near(BUILD),
    keep: near(KEEP),
  });

  return (
    // landing-story scopes the cover timeline, so the pinned hero can read how
    // far the sheet below it has risen.
    <div ref={root} className="landing-story">
      <noscript>
        <style>{NOSCRIPT_REVEAL}</style>
      </noscript>
      <Hero counts={counts} links={links} />
      {/*
        The sheet (owner, 2026-09-23): everything after the hero rides up over
        it as one opaque panel with rounded top corners and a shadow on its
        leading edge. The hero stays pinned beneath until the sheet has covered
        it, then leaves with the page. The sentinel is one hero-height tall at
        the sheet's top: its view timeline runs from the sheet entering the
        viewport to the hero being fully covered.
      */}
      <div className="landing-sheet relative z-20 -mx-6 rounded-t-[length:var(--radius-xl)] bg-background px-6 shadow-edge-top md:-mx-16 md:px-16">
        <div aria-hidden className="landing-cover-sentinel pointer-events-none absolute inset-x-0 top-0 h-[var(--landing-hero-h)]" />
        <CompanyLogoStrip />
        {sections.map((section) => (
          <FeatureSection key={section.id} section={section} windows={windows} />
        ))}
        <Inside chapter={inside(counts)} stages={stages} started={started[INSIDE] ?? false} />
      </div>
    </div>
  );
}

/**
 * The hero (owner, 2026-09-23): exactly the viewport below the landing header,
 * pinned there (sticky) while the sheet after it slides up over it; it scales
 * back a little and dims as it is covered. Inside, a column: the copy on clear
 * paper, with the course counts under the buttons, then the 3D floor of data
 * structures (HeroFloor) filling the height left to the hero's foot — so
 * nothing the floor draws sits under text. (A strip of the nine verbs along
 * the foot was removed on the owner's call, 2026-09-24: it repeated the
 * sections just below.) It spans the landing
 * column past its gutters, so the floor runs to the column's edges, and brings
 * the gutters back for its copy.
 * The headline keeps one sentence per line; its words arrive on load, "code."
 * with a caret and "right." with a hand-drawn ring, then a tick.
 */
function Hero({ counts, links }: { counts: CurriculumCounts; links: { start: string; curriculum: string } }) {
  return (
    <section
      data-scroll-section
      // The family colour the headline's accents take; content, not chrome.
      style={familyCssVars("linear-traversal")}
      className="sticky top-[var(--landing-header-h)] -mx-6 h-[var(--landing-hero-h)] overflow-clip md:-mx-16"
    >
      <div className="landing-hero-stage flex h-full flex-col">
        {/* Ambient hero spotlight to lift the 3D floor and copy */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-20 -z-10 h-[520px] overflow-hidden opacity-75 dark:opacity-35"
          style={{
            background:
              "radial-gradient(ellipse 65% 50% at 50% 15%, color-mix(in srgb, var(--good) 22%, transparent), color-mix(in srgb, var(--info) 14%, transparent) 50%, transparent 80%)",
          }}
        />

        <div className="landing-hero-copy relative z-10 shrink-0 px-6 pt-10 md:px-16 lg:pt-16">
          <p className={cn(KICKER, "flex items-center gap-2.5")}>
            <span aria-hidden className="relative flex h-2.5 w-2.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-good opacity-60 motion-reduce:animate-none" />
              <span className="relative h-2.5 w-2.5 rounded-full bg-good" />
            </span>
            <span className="font-semibold text-good">{HERO.kicker}</span>
          </p>
          <HeroHeadline />
          <p className="mt-8 max-w-2xl text-xl leading-relaxed text-muted">{leadAndTail(HERO.lede)}</p>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-foreground">{HERO.descriptor}</p>
          <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link
              href={links.start}
              className="inline-flex items-center gap-2 rounded-full bg-good px-6 py-3 text-base font-semibold text-on-pop shadow-elevation transition-[opacity,transform,filter] duration-[var(--dur-fast)] ease-[var(--ease)] hover:brightness-105 hover:-translate-y-0.5 active:translate-y-0 motion-reduce:transition-none"
            >
              {HERO.start}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href={links.curriculum}
              className="inline-flex items-center gap-2 border-b border-border pb-0.5 text-base text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease)] hover:border-foreground motion-reduce:transition-none"
            >
              {HERO.explore}
            </Link>
          </div>
          <p className="mt-6 text-sm text-muted tabular-nums">{countsLine(counts)}</p>
        </div>

        {/* The floor takes the height the copy leaves, to the hero's foot (never
            less than a band tall), and fades in from its top edge. */}
        <div className="relative min-h-40 flex-1">
          <HeroFloor />
        </div>
      </div>
      {/* Dims the hero as the sheet covers it (globals.css, .landing-hero-dim). */}
      <div aria-hidden className="landing-hero-dim" />
    </section>
  );
}

/** The lede's clause after "for" set in ink, so the sentence lands on it. */
function leadAndTail(text: string) {
  const at = text.indexOf(" for ");
  if (at === -1) return text;
  return (
    <>
      {text.slice(0, at + 5)}
      <span className="font-medium text-foreground">{text.slice(at + 5)}</span>
    </>
  );
}

/**
 * One sentence per line (owner, 2026-09-14). The heading's accessible name is
 * the plain sentences; the animated words are aria-hidden, so a screen reader
 * never hears them split up.
 */
function HeroHeadline() {
  const [first, second] = HERO.lines;
  const words = (line: string, start: number) =>
    line.split(" ").map((word, i) => (
      <span key={i}>
        {i > 0 ? " " : null}
        <span className="hero-word" style={{ animationDelay: `${(start + i * 0.07).toFixed(2)}s` }}>
          {word}
        </span>
      </span>
    ));
  const firstWords = first.split(" ");
  const secondWords = second.split(" ");
  return (
    <h1
      aria-label={HERO.title}
      className="mt-7 font-display text-4xl leading-[1.06] font-bold tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl"
      style={{ perspective: "600px" }}
    >
      <span aria-hidden className="block">
        {words(firstWords.slice(0, -1).join(" "), 0.1)}{" "}
        <span className="hero-word font-bold text-good" style={{ animationDelay: "0.31s" }}>
          {firstWords.at(-1)}
        </span>
        <span className="hero-caret" />
      </span>
      <span aria-hidden className="block">
        {words(secondWords.slice(0, -1).join(" "), 0.5)} {/* "right." and its tick never part across a wrap. */}
        <span className="whitespace-nowrap">
          <span className="hero-word relative" style={{ animationDelay: "0.78s" }}>
            {secondWords.at(-1)}
            <svg
              className="hero-ring pointer-events-none absolute -top-[22%] -left-[7%] h-[150%] w-[114%] overflow-visible"
              viewBox="0 0 200 100"
              preserveAspectRatio="none"
            >
              <path
                d="M20 58 C 18 22, 150 8, 184 40 C 206 64, 150 92, 90 90 C 40 88, 6 70, 22 46 C 30 34, 60 26, 96 24"
                fill="none"
                stroke="var(--good)"
                strokeWidth="3.2"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <svg className="hero-tick ml-[0.4em] inline-block h-[0.6em] w-[0.7em] align-baseline" viewBox="0 0 46 40">
            <path
              d="M4 22 L 17 34 L 42 5"
              fill="none"
              stroke="var(--good)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </span>
    </h1>
  );
}

/**
 * What's inside: the counts, then one card per real course stage (owner,
 * 2026-09-15), each linking to that stage on the curriculum hub. The cards
 * rise in, staggered, when the section arrives — one attribute on the list,
 * CSS for the motion.
 */
function Inside({ chapter, stages, started }: { chapter: Chapter; stages: readonly StageCard[]; started: boolean }) {
  return (
    <section
      data-scroll-section
      id="inside"
      style={familyCssVars("ordering-search")}
      className={cn(STOP, "relative border-t border-border")}
    >
      <SectionDeco id="inside" />
      <p className={cn(KICKER, "landing-pop flex items-center gap-2.5")}>
        {chapter.kicker}
        <span aria-hidden className="landing-kline" />
      </p>
      <MarkedHeading text={chapter.title} mark={{ word: "inside.", style: "highlight" }} />
      {chapter.body.map((para, j) => (
        <p key={j} className="landing-pop mt-5 max-w-3xl text-xl leading-relaxed text-muted">
          {para}
        </p>
      ))}
      {/* Five cards: three across, then two wider ones, so the last row fills. */}
      <ol data-lit={started || undefined} className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
        {stages.map((stage, i) => (
          <li
            key={stage.number}
            className={cn("rise-in", i < 3 ? "lg:col-span-2" : "lg:col-span-3")}
            style={{ transitionDelay: `${i * RISE_STAGGER_MS}ms` }}
          >
            <StageCardLink stage={stage} />
          </li>
        ))}
      </ol>
    </section>
  );
}

const STAGE_THEMES: Record<number, { border: string; pill: string }> = {
  0: { border: "border-t-2 border-t-good hover:border-good/60", pill: "border border-good/40 bg-good-surface/30 text-good font-semibold" },
  1: { border: "border-t-2 border-t-warn hover:border-warn/60", pill: "border border-warn/40 bg-warn-surface/30 text-warn font-semibold" },
  2: { border: "border-t-2 border-t-info hover:border-info/60", pill: "border border-info/40 bg-info-surface/30 text-info font-semibold" },
  3: { border: "border-t-2 border-t-accent hover:border-accent/60", pill: "border border-accent/40 bg-pop/10 text-mark font-semibold" },
  4: { border: "border-t-2 border-t-good hover:border-good/60", pill: "border border-good/40 bg-good-surface/30 text-good font-semibold" },
};

/**
 * One stage as an image card (owner, 2026-09-23: "beautiful image cards … that
 * pop"): the art of its first modules fanned like a hand of cards over a
 * dotted field, spreading and lifting on hover or focus, then the stage's
 * name, line and counts. The art is decorative (each still repeats a module
 * title in pixels); the card's text names the stage.
 */
function StageCardLink({ stage }: { stage: StageCard }) {
  const art = stage.art ?? [];
  const theme = STAGE_THEMES[stage.number] ?? { border: "hover:border-accent/45", pill: "text-muted" };
  // Fanned from the middle: the centre card on top, its neighbours tipped out.
  const fan = art.length === 1 ? [0] : art.length === 2 ? [-1, 1] : [-1, 0, 1];
  return (
    <Link
      href={stage.href}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-[length:var(--radius-lg)] border border-border bg-elevated shadow-elevation transition-[transform,border-color] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-1.5 focus-visible:-translate-y-1.5",
        theme.border,
      )}
    >
      {art.length > 0 ? (
        <div aria-hidden className="stage-art relative h-44 overflow-hidden bg-surface [perspective:900px]">
          {art.map((still, k) => (
            <div
              key={still.title}
              className="stage-tile absolute top-1/2 left-1/2 aspect-[43/24] h-[68%] overflow-hidden rounded-[length:var(--radius-md)] shadow-elevation"
              style={{ "--fan": fan[k], zIndex: fan[k] === 0 ? 2 : 1 } as CSSProperties}
            >
              <Image src={still.light} alt="" fill sizes="(min-width: 1024px) 280px, 60vw" className="module-art-light object-cover" />
              <Image src={still.dark} alt="" fill sizes="(min-width: 1024px) 280px, 60vw" className="module-art-dark object-cover" />
            </div>
          ))}
        </div>
      ) : null}
      <div className="flex flex-1 flex-col p-5">
        <span className="flex items-center justify-between gap-3">
          <span className={cn(KICKER, "rounded-full px-2.5 py-0.5 text-[10px] font-mono", theme.pill)}>
            Stage {stage.number}
          </span>
          <ArrowRight
            className="h-4 w-4 text-muted transition-[color,transform] duration-[var(--dur-fast)] ease-[var(--ease)] group-hover:translate-x-1 group-hover:text-foreground motion-reduce:transition-none"
            aria-hidden
          />
        </span>
        <span className="mt-2 font-display text-xl font-bold tracking-tight">{stage.title}</span>
        <span className="mt-1 text-sm leading-relaxed text-muted">{stage.description}</span>
        <span className="mt-auto pt-4 text-xs text-muted tabular-nums">{stageMeta(stage)}</span>
      </div>
    </Link>
  );
}
