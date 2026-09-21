"use client";

import Link from "next/link";
import { ArrowRight, Plus } from "@phosphor-icons/react";
import { KICKER, STOP, TITLE } from "@/components/landing/landingClasses";
import { PlaceholderTag } from "@/components/landing/PlaceholderTag";
import { TypedText } from "@/components/landing/TypedText";
import { useActiveSection, useTypedText } from "@/components/landing/useSectionReveal";
import { FAQ, PRICING, PROOF, RISE_STAGGER_MS } from "@/lib/landing/story";
import { cn } from "@/lib/utils";

const CARD = "rounded-[length:var(--radius-lg)] border border-border bg-elevated shadow-elevation";
const LABEL = "text-[0.6875rem] font-medium tracking-[0.14em] text-muted uppercase";

/**
 * The last slide (owner, 2026-09-19): pricing across the top, then learners
 * and the questions in two rows beside each other, one snap stop instead of
 * three. The questions open one at a time so the slide fits a laptop screen.
 */
export function LandingOutro({ firstLessonHref }: { firstLessonHref: string }) {
  const { root, started } = useActiveSection<HTMLDivElement>(1);
  const lit = started[0] ?? false;
  const [title, body] = useTypedText(lit, [PRICING.title, PRICING.body]);

  return (
    <div ref={root}>
      <section data-scroll-section data-backdrop-off className={STOP}>
        <div className="mt-8">
          <p className={KICKER}>{PRICING.kicker}</p>
          <h2 className={TITLE}>
            <TypedText text={PRICING.title} progress={title ?? 0} />
          </h2>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
            <p className="max-w-2xl text-lg leading-relaxed text-muted">
              <TypedText text={PRICING.body} progress={body ?? 0} />
            </p>
            <Link
              href={firstLessonHref}
              className="inline-flex items-center gap-2 rounded-full bg-pop px-5 py-2.5 text-base font-medium text-on-pop transition-opacity hover:opacity-90"
            >
              {PRICING.cta}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
        <div data-lit={lit || undefined} className="mt-10 grid gap-10 border-t border-border pt-8 lg:grid-cols-2 lg:gap-16">
          <Learners />
          <Questions />
        </div>
      </section>
    </div>
  );
}

/** Placeholder social proof, tagged as such item by item and as a whole (owner, 2026-09-15). */
function Learners() {
  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className={LABEL}>{PROOF.kicker}</h3>
        <PlaceholderTag label={PROOF.note} />
      </div>
      <p className="mt-3 font-display text-xl font-bold tracking-tight">{PROOF.title}</p>
      <dl className="mt-5 grid grid-cols-3 gap-4">
        {PROOF.stats.map((stat, i) => (
          <div key={stat.label} className="rise-in flex flex-col gap-1" style={{ transitionDelay: `${i * RISE_STAGGER_MS}ms` }}>
            <dt className="flex flex-wrap items-center gap-2 text-xs text-muted">
              {stat.label}
              <PlaceholderTag />
            </dt>
            <dd className="order-first font-display text-2xl font-bold tracking-tight tabular-nums">{stat.value}</dd>
          </div>
        ))}
      </dl>
      <ul className="mt-5 grid gap-3">
        {PROOF.quotes.map((quote, i) => (
          <li key={quote.role} className="rise-in" style={{ transitionDelay: `${(i + PROOF.stats.length) * RISE_STAGGER_MS}ms` }}>
            <figure className={cn(CARD, "flex items-start gap-3 p-3.5")}>
              <PlaceholderTag />
              <div className="min-w-0">
                <blockquote className="text-sm leading-relaxed text-foreground">“{quote.quote}”</blockquote>
                <figcaption className="mt-1 text-xs">
                  <span className="font-medium text-foreground">{quote.name}</span>
                  <span className="text-muted"> · {quote.role}</span>
                </figcaption>
              </div>
            </figure>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Questions() {
  return (
    <div className="min-w-0">
      <h3 className={LABEL}>Questions</h3>
      <div className="mt-3 divide-y divide-border border-y border-border">
        {FAQ.map(({ q, a }) => (
          <details key={q} name="landing-faq" className="group py-1">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-display text-base font-bold tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-accent/40 [&::-webkit-details-marker]:hidden">
              {q}
              <Plus className="h-4 w-4 shrink-0 text-muted transition-transform group-open:rotate-45 motion-reduce:transition-none" aria-hidden />
            </summary>
            <p className="pb-3 text-sm leading-relaxed text-muted">{a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
