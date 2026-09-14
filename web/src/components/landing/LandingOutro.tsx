"use client";

import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";
import { HeatMap } from "@/components/landing/HeatMap";
import { TypedText } from "@/components/landing/TypedText";
import { useActiveSection, useRevealProgress } from "@/components/landing/useSectionReveal";
import type { HeatYear } from "@/lib/landing/heat";
import { FAQ, HEAT, PRICING, segmentProgress, typingDuration } from "@/lib/landing/story";

const KICKER = "text-xs font-medium tracking-[0.14em] text-mark uppercase";
const SECTION = "flex min-h-dvh snap-start flex-col justify-center py-24";
const TITLE = "mt-4 max-w-3xl font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl";
const BODY = "mt-6 max-w-2xl text-lg leading-relaxed text-muted";

/**
 * Pricing, credits and the three questions: three more snap stops, typed once
 * as each becomes active, like the story above. The one call to action on the
 * page is the plain "Start the first lesson" link — the owner asked for a page
 * that explains rather than sells.
 */
export function LandingOutro({ firstLessonHref, heat }: { firstLessonHref: string; heat: HeatYear }) {
  const { root, started } = useActiveSection<HTMLDivElement>(3);

  return (
    <div ref={root}>
      <Pricing started={started[0] ?? false} firstLessonHref={firstLessonHref} />
      <HeatmapFeature started={started[1] ?? false} heat={heat} />
      <Questions started={started[2] ?? false} />
    </div>
  );
}

function Pricing({ started, firstLessonHref }: { started: boolean; firstLessonHref: string }) {
  const lengths = [PRICING.title.length, PRICING.body.length];
  const progress = useRevealProgress(started, typingDuration(lengths[0]! + lengths[1]!));
  const [title, body] = segmentProgress(lengths, progress);

  return (
    <section data-scroll-section className={SECTION}>
      <p className={KICKER}>{PRICING.kicker}</p>
      <h2 className={TITLE}>
        <TypedText text={PRICING.title} progress={title ?? 0} />
      </h2>
      <p className={BODY}>
        <TypedText text={PRICING.body} progress={body ?? 0} />
      </p>
      <Link
        href={firstLessonHref}
        className="mt-10 inline-flex w-fit items-center gap-2 border-b border-border pb-0.5 text-base text-foreground transition-colors hover:border-foreground"
      >
        {PRICING.cta}
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </section>
  );
}

/** The heatmap as a feature; the credits line types last, as its payoff. */
function HeatmapFeature({ started, heat }: { started: boolean; heat: HeatYear }) {
  const lengths = [HEAT.title.length, HEAT.body.length, HEAT.credits.length];
  const progress = useRevealProgress(started, typingDuration(lengths.reduce((sum, n) => sum + n, 0)));
  const [title, body, credits] = segmentProgress(lengths, progress);

  return (
    <section data-scroll-section className={SECTION}>
      <p className={KICKER}>{HEAT.kicker}</p>
      <h2 className={TITLE}>
        <TypedText text={HEAT.title} progress={title ?? 0} />
      </h2>
      <p className={BODY}>
        <TypedText text={HEAT.body} progress={body ?? 0} />
      </p>
      <p className="mt-4 max-w-2xl text-lg font-medium text-foreground">
        <TypedText text={HEAT.credits} progress={credits ?? 0} />
      </p>
      <HeatMap year={heat} lit={started} className="mt-12" />
    </section>
  );
}

function Questions({ started }: { started: boolean }) {
  const lengths = FAQ.flatMap(({ q, a }) => [q.length, a.length]);
  const progress = useRevealProgress(started, typingDuration(lengths.reduce((sum, n) => sum + n, 0)));
  const parts = segmentProgress(lengths, progress);

  return (
    <section data-scroll-section className={SECTION}>
      <p className={KICKER}>Questions</p>
      <dl className="mt-10 grid gap-12 lg:grid-cols-3">
        {FAQ.map(({ q, a }, i) => (
          <div key={q}>
            <dt className="font-display text-xl font-bold tracking-tight">
              <TypedText text={q} progress={parts[i * 2] ?? 0} />
            </dt>
            <dd className="mt-3 text-base leading-relaxed text-muted">
              <TypedText text={a} progress={parts[i * 2 + 1] ?? 0} />
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
