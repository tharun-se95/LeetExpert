"use client";

import Link from "next/link";
import {
  ArrowsClockwise,
  ArrowsInLineHorizontal,
  ArrowsLeftRight,
  BracketsSquare,
  Graph,
  GridFour,
  Hash,
  TreeStructure,
} from "@phosphor-icons/react";
import type { ComponentType } from "react";
import { EvolvingStructure } from "@/components/landing/EvolvingStructure";
import { TypedText } from "@/components/landing/TypedText";
import { useSectionPaging } from "@/components/landing/useSectionPaging";
import { useActiveSection, useRevealProgress } from "@/components/landing/useSectionReveal";
import type { TOPIC_CHIPS } from "@/lib/landing/content";
import {
  HERO,
  WHY,
  argumentDuration,
  argumentLengths,
  argumentStage,
  inside,
  segmentProgress,
  typingDuration,
  type Chapter,
  type CurriculumCounts,
} from "@/lib/landing/story";

type Topic = (typeof TOPIC_CHIPS)[number];

/** One icon per topic link, keyed by label so a new chip without an icon fails the typecheck. */
const TOPIC_ICONS: Record<Topic["label"], ComponentType<{ className?: string; "aria-hidden"?: boolean }>> = {
  Arrays: BracketsSquare,
  "Hash Tables": Hash,
  Trees: TreeStructure,
  Graphs: Graph,
  DP: GridFour,
  "Two Pointers": ArrowsLeftRight,
  "Binary Search": ArrowsInLineHorizontal,
  Recursion: ArrowsClockwise,
};

/** Reveals every typed layer when scripts never run (TypedText starts untyped). */
const NOSCRIPT_REVEAL = "[data-typed-rest]{color:inherit!important}";

const KICKER = "text-xs font-medium tracking-[0.14em] text-mark uppercase";
const STOP = "flex min-h-dvh snap-start flex-col justify-center py-24";

/** Section order inside this component. */
const HERO_SECTION = 0;
const ARGUMENT_SECTION = 1;

/**
 * The hero, the argument on one screen, and what's inside — with one
 * structure pinned beside them from lg. The argument's four points type in
 * sequence and the structure takes one stage per point (array → hash table →
 * tree → graph), so the motion that four chapters used to carry now plays on
 * a single stop. Below lg the structure sits inline. Topics and counts come
 * from the server so the course manifest never ships to the client.
 */
export function LandingStory({
  counts,
  topics,
}: {
  counts: CurriculumCounts;
  topics: readonly Topic[];
}) {
  const course = inside(counts);
  const { root, active, started } = useActiveSection<HTMLDivElement>(3);
  // Lifted here, not inside Argument, because the pinned structure follows it.
  const argumentProgress = useRevealProgress(started[ARGUMENT_SECTION] ?? false, argumentDuration());
  const argumentParts = segmentProgress(argumentLengths(), argumentProgress);
  const stage =
    active === HERO_SECTION || active === -1
      ? 0
      : active === ARGUMENT_SECTION
        ? argumentStage(argumentParts)
        : course.stage;
  // Mounted once per landing page; it pages the outro's sections too.
  useSectionPaging();

  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-x-20">
      <noscript>
        <style>{NOSCRIPT_REVEAL}</style>
      </noscript>

      <div ref={root} className="min-w-0">
        <Hero topics={topics} started={started[HERO_SECTION] ?? false} />
        <Argument parts={argumentParts} />
        <StoryChapter chapter={course} started={started[2] ?? false} />
      </div>

      {/* The column spans every section. A viewport-tall sticky box centres the
          drawing whatever its rendered height — an offset computed from the
          drawing's size sat it at 88% of the viewport. */}
      <div className="hidden lg:block">
        <div className="sticky top-0 flex h-dvh items-center">
          <EvolvingStructure stage={stage} className="w-full" />
        </div>
      </div>
    </div>
  );
}

/** Not a snap stop itself: AppShell's grain wrapper is, so the first stop keeps the header in view. */
function Hero({ topics, started }: { topics: readonly Topic[]; started: boolean }) {
  const progress = useRevealProgress(started, typingDuration(HERO.title.length + HERO.lede.length));
  const [title, lede] = segmentProgress([HERO.title.length, HERO.lede.length], progress);

  return (
    <section data-scroll-section className="flex min-h-[calc(100dvh-6rem)] flex-col justify-center py-16">
      <h1 className="max-w-3xl font-display text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl lg:leading-[1.1]">
        <TypedText text={HERO.title} progress={title ?? 0} />
      </h1>
      <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted">
        <TypedText text={HERO.lede} progress={lede ?? 0} />
      </p>
      <ul className="mt-12 flex flex-wrap gap-x-5 gap-y-4">
        {topics.map(({ label, href }) => {
          const Icon = TOPIC_ICONS[label];
          return (
            <li key={href}>
              <Link
                href={href}
                className="group inline-flex items-center gap-2 border-b border-border pb-0.5 text-base text-foreground transition-colors hover:border-foreground"
              >
                <Icon className="h-5 w-5 text-muted transition-colors group-hover:text-foreground" aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** The four points, typed in order from one progress value owned by LandingStory. */
function Argument({ parts }: { parts: readonly number[] }) {
  return (
    <section data-scroll-section className={STOP}>
      {/* mt-8: the argument outgrows a phone screen, so it snaps with its top
          at py-24 — 2px under the sticky header — and the drawing's top nodes
          sat right against the hairline (measured 78px vs 76px at 375px). */}
      <EvolvingStructure stage={argumentStage(parts)} className="mt-8 mb-10 w-full max-w-[16rem] lg:hidden" />
      <p className={KICKER}>{WHY.kicker}</p>
      <h2 className="mt-4 max-w-3xl font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
        <TypedText text={WHY.title} progress={parts[0] ?? 0} />
      </h2>
      <ol className="mt-12 grid max-w-2xl gap-8">
        {WHY.points.map((point, i) => (
          <li key={point.title} className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-4">
            <span aria-hidden className="pt-1 font-display text-sm font-bold text-mark tabular-nums">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <h3 className="font-display text-xl font-bold tracking-tight">
                <TypedText text={point.title} progress={parts[1 + 2 * i] ?? 0} />
              </h3>
              <p className="mt-2 text-lg leading-relaxed text-muted">
                <TypedText text={point.body} progress={parts[2 + 2 * i] ?? 0} />
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function StoryChapter({ chapter, started }: { chapter: Chapter; started: boolean }) {
  const lengths = [chapter.title.length, ...chapter.body.map((para) => para.length)];
  const progress = useRevealProgress(started, typingDuration(lengths.reduce((sum, n) => sum + n, 0)));
  const parts = segmentProgress(lengths, progress);

  return (
    <section data-scroll-section className={STOP}>
      <EvolvingStructure stage={chapter.stage} className="mt-8 mb-12 w-full max-w-sm lg:hidden" />
      <p className={KICKER}>{chapter.kicker}</p>
      <h2 className="mt-4 max-w-3xl font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
        <TypedText text={chapter.title} progress={parts[0] ?? 0} />
      </h2>
      {chapter.body.map((para, j) => (
        <p key={j} className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          <TypedText text={para} progress={parts[j + 1] ?? 0} />
        </p>
      ))}
    </section>
  );
}
