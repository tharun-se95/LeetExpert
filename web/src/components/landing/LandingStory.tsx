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

        <div className="landing-hero-copy relative z-10 shrink-0 px-6 pt-8 text-center md:px-16 lg:pt-12">
          {/* Living ticker / live badge centered */}
          <div className="mx-auto flex flex-wrap items-center justify-center gap-3">
            <p className={cn(KICKER, "hero-kicker-pill inline-flex items-center gap-2 rounded-full border border-good-line/60 bg-good-surface/70 px-3.5 py-1 text-xs font-mono font-semibold text-good")}>
              <span aria-hidden className="relative flex h-2 w-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-good opacity-75 motion-reduce:animate-none" />
                <span className="relative h-2 w-2 rounded-full bg-good" />
              </span>
              <span>{HERO.kicker}</span>
            </p>

            {/* Real-time community live badge */}
            <div className="hero-beacon-glow-good inline-flex items-center gap-1.5 rounded-full border border-good-line/60 bg-good-surface/70 px-3 py-1 text-xs font-mono font-medium text-good">
              <span aria-hidden className="relative flex h-2 w-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-good opacity-75 motion-reduce:animate-none" />
                <span className="relative h-2 w-2 rounded-full bg-good" />
              </span>
              <span>● 142 engineers practicing now</span>
            </div>

            {/* Live runtime status indicator */}
            <div className="hero-beacon-glow-info inline-flex items-center gap-1.5 rounded-full border border-info-line/60 bg-info-surface/70 px-3 py-1 text-xs font-mono font-medium text-info">
              <span aria-hidden className="h-2 w-2 rounded-full bg-good animate-pulse motion-reduce:animate-none" />
              <span className="font-bold tracking-wider text-good">● LIVE</span>
              <span className="text-muted/60">·</span>
              <span className="text-foreground">In-Browser WASM</span>
              <span className="text-muted/60">·</span>
              <span className="text-muted">Python 3.12 (Pyodide) &amp; V8 Node</span>
            </div>
          </div>

          <HeroHeadline />

          {/* Technical rigor badge below the headline */}
          <div className="mx-auto mt-4 flex flex-wrap items-center justify-center gap-3">
            <div className="hero-beacon-glow-warn inline-flex items-center gap-2 rounded-full border border-warn-line/70 bg-warn-surface/70 px-3.5 py-1 text-xs font-mono font-medium text-warn">
              <span className="font-bold text-insight">★</span>
              <span className="font-semibold text-foreground">FAANG-Calibrated Rigor</span>
              <span className="text-muted/60">·</span>
              <span className="text-muted">Blind 75 &amp; NeetCode 150</span>
            </div>
          </div>

          <p className="mx-auto mt-6 max-w-3xl text-center text-lg leading-relaxed text-muted sm:text-xl md:text-2xl">{leadAndTail(HERO.lede)}</p>
          <p className="mx-auto mt-3 max-w-2xl text-center text-base leading-relaxed text-foreground sm:text-lg">{HERO.descriptor}</p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-5">
            <Link
              href={links.start}
              className="hero-start-cta inline-flex items-center gap-2 rounded-full bg-good px-7 py-3.5 text-base font-semibold text-on-pop shadow-elevation transition-all duration-[var(--dur-fast)] ease-[var(--ease)] hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] sm:text-lg motion-reduce:transition-none"
            >
              {HERO.start}
              <ArrowRight className="h-5 w-5" aria-hidden />
            </Link>
            <Link
              href={links.curriculum}
              className="hero-explore-cta inline-flex items-center gap-2 rounded-full border border-border bg-elevated/70 px-6 py-3.5 text-base font-medium text-foreground shadow-elevation transition-all duration-[var(--dur-fast)] ease-[var(--ease)] hover:border-foreground/50 hover:bg-elevated hover:-translate-y-0.5 active:translate-y-0 sm:text-lg motion-reduce:transition-none"
            >
              {HERO.explore}
            </Link>
          </div>
          <p className="mt-6 text-center text-sm text-muted tabular-nums">{countsLine(counts)}</p>
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
      className="mx-auto mt-7 max-w-5xl text-center font-display text-5xl font-bold tracking-tight leading-[1.04] sm:text-6xl md:text-7xl lg:text-8xl"
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
      <ol data-lit={started || undefined} className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-6 [perspective:1000px]">
        {stages.map((stage, i) => (
          <li
            key={stage.number}
            className={cn("rise-in [perspective:1000px]", i < 3 ? "lg:col-span-2" : "lg:col-span-3")}
            style={{ transitionDelay: `${i * RISE_STAGGER_MS}ms` }}
          >
            <StageCardLink stage={stage} />
          </li>
        ))}
      </ol>
    </section>
  );
}

const STAGE_THEMES: Record<
  number,
  {
    binder: string;
    border: string;
    pill: string;
  }
> = {
  0: {
    binder: "binder-stage-0",
    border: "border-t-2 border-t-warn",
    pill: "binder-pill-0",
  },
  1: {
    binder: "binder-stage-1",
    border: "border-t-2 border-t-good",
    pill: "binder-pill-1",
  },
  2: {
    binder: "binder-stage-2",
    border: "border-t-2 border-t-info",
    pill: "binder-pill-2",
  },
  3: {
    binder: "binder-stage-3",
    border: "border-t-2 border-t-accent",
    pill: "binder-pill-3",
  },
  4: {
    binder: "binder-stage-4",
    border: "border-t-2 border-t-good",
    pill: "binder-pill-4",
  },
};

const STAGE_HIGHLIGHTS: Record<number, readonly string[]> = {
  0: [
    "+ First-principles invariants",
    "+ Zero-install interactive execution",
    "+ Asymptotic edge case proofs",
  ],
  1: [
    "+ Pointer arithmetic & two-pointer technique",
    "+ Sliding window dynamic state",
    "+ In-place memory mutations",
  ],
  2: [
    "+ Recursion tree unwinding & call stacks",
    "+ Binary search partitions & bifurcations",
    "+ Tree traversals & balancing invariants",
  ],
  3: [
    "+ Graph cycle detection & topological sorts",
    "+ Dynamic programming state transitions",
    "+ Memoization tables & DAG traversals",
  ],
  4: [
    "+ Monotonic stacks & priority heaps",
    "+ Bitwise arithmetic & segment trees",
    "+ Hard FAANG-calibrated problem sets",
  ],
};

const DEFAULT_HIGHLIGHTS = [
  "+ First-principles invariants",
  "+ Zero-install interactive execution",
  "+ Asymptotic edge case proofs",
];

/**
 * One stage as a rich, tangible physical 3D notebook/binder:
 * - Left spine band with physical book stitching/rivet accents.
 * - Custom tactile texture & color wash (blueprint grid, retro coordinates, marbled, or cyber circuit).
 * - Metallic embossed stage number foil badge.
 * - 3D perspective hover lift.
 * - Decorative module art fanned over the cover field.
 */
function StageCardLink({ stage }: { stage: StageCard }) {
  const art = stage.art ?? [];
  const theme = STAGE_THEMES[stage.number] ?? {
    binder: "binder-stage-0",
    border: "border-t-2 border-t-good",
    pill: "binder-pill-0",
  };
  // Fanned from the middle: the centre card on top, its neighbours tipped out.
  const fan = art.length === 1 ? [0] : art.length === 2 ? [-1, 1] : [-1, 0, 1];
  const highlights = STAGE_HIGHLIGHTS[stage.number] ?? DEFAULT_HIGHLIGHTS;

  return (
    <Link
      href={stage.href}
      className={cn(
        "track-binder group relative flex h-[500px] sm:h-[520px] flex-col overflow-hidden rounded-[length:var(--radius-lg)] border bg-elevated shadow-elevation transition-all duration-300 group-hover:[transform:translateY(-0.5rem)_rotateX(3deg)_rotateY(-2deg)]",
        theme.binder,
        theme.border,
      )}
    >
      {/* Left spine band with physical book stitching and rivet accents */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-20 flex w-4 sm:w-5 flex-col items-center justify-between border-r border-border/70 bg-gradient-to-r from-foreground/[0.06] via-foreground/[0.02] to-transparent py-5"
      >
        <div className="absolute inset-y-0 right-1 w-px border-r border-dashed border-foreground/15" />
        <div className="relative flex h-2 w-2 items-center justify-center rounded-full border border-border/80 bg-surface shadow-elevation">
          <span className="h-0.5 w-0.5 rounded-full bg-foreground/40" />
        </div>
        <div className="relative flex h-2 w-2 items-center justify-center rounded-full border border-border/80 bg-surface shadow-elevation">
          <span className="h-0.5 w-0.5 rounded-full bg-foreground/40" />
        </div>
        <div className="relative flex h-2 w-2 items-center justify-center rounded-full border border-border/80 bg-surface shadow-elevation">
          <span className="h-0.5 w-0.5 rounded-full bg-foreground/40" />
        </div>
        <div className="relative flex h-2 w-2 items-center justify-center rounded-full border border-border/80 bg-surface shadow-elevation">
          <span className="h-0.5 w-0.5 rounded-full bg-foreground/40" />
        </div>
      </div>

      {/* 3D folder tab on the right edge of the binder */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-7 z-20 h-14 w-3 rounded-r-[length:var(--radius-sm)] border-r-2 border-y border-foreground/20 bg-foreground/10 transition-transform duration-300 group-hover:translate-x-0.5"
      />

      {art.length > 0 ? (
        <div aria-hidden className="stage-art relative h-56 sm:h-64 overflow-hidden bg-surface/40 pl-4 [perspective:900px]">
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
      <div className="flex flex-1 flex-col py-5 pr-5 pl-7 sm:pl-8">
        <span className="flex items-center justify-between gap-3">
          <span
            className={cn(
              "relative inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold tracking-wider uppercase shadow-elevation transition-transform duration-300 group-hover:scale-105",
              theme.pill,
            )}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" aria-hidden />
            Stage {stage.number}
          </span>
          <ArrowRight
            className="h-4 w-4 text-muted transition-[color,transform] duration-[var(--dur-fast)] ease-[var(--ease)] group-hover:translate-x-1 group-hover:text-foreground motion-reduce:transition-none"
            aria-hidden
          />
        </span>
        <span className="mt-2.5 font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground">{stage.title}</span>
        <span className="mt-1 text-sm leading-relaxed text-muted line-clamp-2">{stage.description}</span>

        {/* 3 key syllabus highlights with bullet marks */}
        <ul className="mt-3.5 space-y-1.5 text-xs font-mono text-muted/90">
          {highlights.map((bullet, idx) => (
            <li key={idx} className="flex items-center gap-1.5">
              <span className="font-bold text-good">{bullet.slice(0, 1)}</span>
              <span>{bullet.slice(2)}</span>
            </li>
          ))}
        </ul>

        {/* Telemetry pill at bottom & Open -> action row */}
        <div className="mt-auto flex items-center justify-between pt-4 border-t border-border/40">
          <span className="rounded-full border border-border/80 bg-surface/80 px-3 py-1 text-xs font-mono text-muted tabular-nums">
            {stageMeta(stage)}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-foreground group-hover:text-good transition-colors">
            <span>Open</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" aria-hidden />
          </span>
        </div>
      </div>
    </Link>
  );
}
