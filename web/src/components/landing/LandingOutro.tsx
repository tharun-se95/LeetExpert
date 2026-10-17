"use client";

import Link from "next/link";
import { ArrowRight, Plus } from "@phosphor-icons/react";
import { KICKER, STOP } from "@/components/landing/landingClasses";
import { MarkedHeading } from "@/components/landing/MarkedHeading";
import { PlaceholderTag } from "@/components/landing/PlaceholderTag";
import { TestimonialRiver } from "@/components/landing/TestimonialRiver";
import { useActiveSection } from "@/components/landing/useSectionReveal";
import { FAQ, PRICING, PROOF, RISE_STAGGER_MS } from "@/lib/landing/story";
import { familyCssVars } from "@/lib/visual/familyTheme";
import { cn } from "@/lib/utils";

const LABEL = "text-[0.6875rem] font-medium tracking-[0.14em] text-muted uppercase";

/**
 * The last section (owner, 2026-09-19): pricing across the top, then learners
 * and the questions beside each other. The questions open one at a time.
 * "free." is drawn over as the section arrives, like the headings above it.
 */
export function LandingOutro({ firstLessonHref }: { firstLessonHref: string }) {
  const { root, started } = useActiveSection<HTMLDivElement>(1);
  const lit = started[0] ?? false;

  return (
    <div ref={root}>
      <section
        data-scroll-section
        id="pricing"
        style={familyCssVars("linear-traversal")}
        className={cn(STOP, "border-t border-border")}
      >
        <div>
          <p className={cn(KICKER, "landing-pop flex items-center gap-2.5")}>
            {PRICING.kicker}
            <span aria-hidden className="landing-kline" />
          </p>
          <MarkedHeading text={PRICING.title} mark={{ word: "free.", style: "underline" }} split={false} />
          <div className="mt-5 flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
            <p className="landing-pop max-w-2xl text-xl leading-relaxed text-muted">{PRICING.body}</p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-5 py-2.5 text-base font-medium text-foreground shadow-elevation transition-[border-color,background-color,transform] duration-[var(--dur-fast)] ease-[var(--ease)] hover:border-accent hover:bg-elevated hover:-translate-y-0.5 active:translate-y-0 motion-reduce:transition-none"
              >
                View Plans & Pricing
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href={firstLessonHref}
                className="inline-flex items-center gap-2 rounded-full bg-pop px-5 py-2.5 text-base font-medium text-on-pop shadow-elevation transition-[opacity,transform] duration-[var(--dur-fast)] ease-[var(--ease)] hover:opacity-95 hover:-translate-y-0.5 active:translate-y-0 motion-reduce:transition-none"
              >
                {PRICING.cta}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
        <div data-lit={lit || undefined} className="mt-14 border-t border-border pt-10">
          <Learners />
        </div>
        <div className="mt-14 border-t border-border pt-10">
          <Questions />
        </div>
      </section>
    </div>
  );
}

/**
 * Placeholder social proof, tagged as such item by item and as a whole (owner,
 * 2026-09-15): the numbers in a row beside the title, then the quotes as a
 * river of cards across the column (owner, 2026-09-23; TestimonialRiver).
 */
function Learners() {
  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-6">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h3 className={LABEL}>{PROOF.kicker}</h3>
            <PlaceholderTag label={PROOF.note} />
          </div>
          <p className="mt-3 font-display text-2xl font-bold tracking-tight">{PROOF.title}</p>
        </div>
      <dl className="grid grid-cols-3 gap-8">
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
      </div>
      <div className="mt-8">
        <TestimonialRiver quotes={PROOF.quotes} label={PROOF.title} />
      </div>
    </div>
  );
}

function Questions() {
  return (
    // Full width now that the learners have their own row: the label beside
    // the list from lg, so the questions don't stretch across the column.
    <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
      <h3 className={LABEL}>Questions</h3>
      <div className="divide-y divide-border border-y border-border">
        {FAQ.map(({ q, a }) => (
          <details key={q} name="landing-faq" className="landing-faq group py-1">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-display text-base font-bold tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-accent/40 [&::-webkit-details-marker]:hidden">
              {q}
              <Plus className="h-4 w-4 shrink-0 text-muted transition-transform duration-[var(--dur-fast)] ease-[var(--ease)] group-open:rotate-45 motion-reduce:transition-none" aria-hidden />
            </summary>
            <p className="pb-3 text-sm leading-relaxed text-muted">{a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
