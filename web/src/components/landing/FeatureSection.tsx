"use client";

import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { useCallback, useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { KICKER, STOP } from "@/components/landing/landingClasses";
import { TypedText } from "@/components/landing/TypedText";
import { MIDDLE_BAND, useTypedText } from "@/components/landing/useSectionReveal";
import type { FeatureSection as Section, VerbId } from "@/lib/landing/features";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { cn } from "@/lib/utils";

const FADE = { duration: 0.3, ease: [0.65, 0, 0.35, 1] as const };
const TURN = { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const };
/** The stack from lg; below it, a swipeable row. */
const DECK_QUERY = "(min-width: 1024px)";
export const REDUCE_QUERY = "(prefers-reduced-motion: reduce)";
/**
 * From lg a feature section is one screen per feature (`--steps` screens
 * tall), the stop's flex centring moving onto the pinned inner box.
 */
const STEPPED = "relative lg:block lg:h-[calc(var(--steps)*100dvh)] lg:min-h-0 lg:py-0";

/**
 * How far a component travels as it leaves or arrives (owner, 2026-09-20:
 * "vertical, only one visible at a time, the others hidden"): the one before
 * slides up and out, the next rises from below.
 */
const SLIDE_Y = 56;
/**
 * The row's style below lg, spelled out: motion keeps the last inline values
 * when `style` goes undefined, so crossing the breakpoint (a tablet turned)
 * left the stack's offset and fade on the row (found in the browser).
 */
const FLAT = { y: 0, opacity: 1 } as const;

export type WindowContent = {
  body: ReactNode;
  /** Names the component for screen readers: with no card, it has no title of its own. */
  label: string;
  link?: { label: string; href: string };
  /** A second line under the tabs while this verb is selected. */
  note?: string;
  /** The component takes the slot's full height (the map, the list, the coach). */
  fill?: boolean;
};

/**
 * One of Understand, Build and Keep (owner, 2026-09-17), its three features
 * shown as the bare components (owner, 2026-09-19: no card, title or footer)
 * one at a time in a vertical stack (owner, 2026-09-20): only the selected one
 * is visible; scrolling down slides it up and out and brings the next up from
 * below. From lg the section is one screen per feature with its content
 * pinned, and scrolling past the last feature moves on to the next section;
 * a tab or a hero verb link (#watch, #review…) scrolls to its feature's step.
 * Below lg the components are a swipeable row instead, since one feature's
 * content outgrows a phone screen.
 * Spec: docs/superpowers/specs/2026-09-15-landing-product-page-design.md §14–§16
 */
export function FeatureSection({
  section,
  started,
  windows,
}: {
  section: Section;
  /** The section has been reached, so its copy types. */
  started: boolean;
  windows: Record<VerbId, WindowContent>;
}) {
  // Read live, not through motion's useReducedMotion, which keeps the first
  // value it saw: turning the setting on mid-visit must stop the slides.
  const reduce = useMediaQuery(REDUCE_QUERY);
  const deck = useMediaQuery(DECK_QUERY);
  const count = section.verbs.length;
  const [active, setActive] = useState(0);
  const id = useId();
  const root = useRef<HTMLElement>(null);
  const row = useRef<HTMLDivElement>(null);
  /** One marker per feature, a screen apart: the scroll positions of the steps. */
  const steps = useRef<(HTMLDivElement | null)[]>([]);
  const [title, lede] = useTypedText(started, [section.heading, section.lede]);


  // Stable, and reading the media live rather than from state: the hash
  // effect below depends on it, and an identity that changed when `deck`
  // resolved after hydration re-ran that effect and re-applied a stale #hash
  // over the reader's own choice.
  const choose = useCallback(
    (i: number) => {
      setActive(i);
      const behavior = window.matchMedia(REDUCE_QUERY).matches ? "auto" : "smooth";
      // From lg the feature is a scroll position: go to its step, so the page
      // and the stack never disagree.
      if (window.matchMedia(DECK_QUERY).matches) {
        steps.current[i]?.scrollIntoView({ behavior, block: "start" });
        return;
      }
      // Below lg the components are a scroll row, so choosing one scrolls to it.
      const list = row.current;
      const card = list?.children[i] as HTMLElement | undefined;
      if (!list || !card) return;
      list.scrollTo({ left: card.offsetLeft - list.offsetLeft - (list.clientWidth - card.clientWidth) / 2, behavior });
    },
    [],
  );

  // Keyed on the verb ids, not the verbs array: the parent rebuilds that array
  // every render, and re-running this re-applied a stale #hash a frame after
  // the reader had moved to another verb (found in the browser).
  const verbIds = section.verbs.map((v) => v.id).join(" ");
  useEffect(() => {
    const ids = verbIds.split(" ");
    const pick = () => {
      const i = ids.findIndex((v) => `#${v}` === window.location.hash);
      if (i === -1) return;
      choose(i);
      // From lg choose() already scrolled to the feature's own step.
      if (window.matchMedia(DECK_QUERY).matches) return;
      root.current?.scrollIntoView({
        behavior: window.matchMedia(REDUCE_QUERY).matches ? "auto" : "smooth",
        block: "start",
      });
    };
    // A frame later, so a page opened at #review lands after layout settles.
    const frame = requestAnimationFrame(pick);
    window.addEventListener("hashchange", pick);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", pick);
    };
  }, [verbIds, choose]);

  // From lg, the step crossing the middle of the scroller is the feature in
  // front: scrolling down brings the next one up, scrolling up the one before.
  useEffect(() => {
    const main = document.querySelector("main");
    const markers = steps.current.filter((m): m is HTMLDivElement => m !== null);
    if (!deck || !main || markers.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).at(-1);
        if (hit) setActive(markers.indexOf(hit.target as HTMLDivElement));
      },
      { root: main, rootMargin: MIDDLE_BAND, threshold: 0 },
    );
    for (const m of markers) observer.observe(m);
    return () => observer.disconnect();
  }, [deck]);

  // Below lg, swiping the row selects the component that comes to rest in it.
  useEffect(() => {
    const list = row.current;
    if (deck || !list) return;
    const cards = Array.from(list.children);
    const observer = new IntersectionObserver(
      (entries) => {
        // The first client render assumes the row (the server can't know the
        // width), so this observer starts on wide screens too and its first
        // report would pull the stack back to the first component.
        if (window.matchMedia(DECK_QUERY).matches) return;
        const hit = entries.find((e) => e.isIntersecting);
        if (hit) setActive(cards.indexOf(hit.target));
      },
      { root: list, threshold: 0.6 },
    );
    for (const card of cards) observer.observe(card);
    return () => observer.disconnect();
  }, [deck]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const moves: Record<string, number> = {
      ArrowDown: active + 1,
      ArrowRight: active + 1,
      ArrowUp: active - 1,
      ArrowLeft: active - 1,
      Home: 0,
      End: count - 1,
    };
    const to = moves[e.key];
    if (to === undefined) return;
    e.preventDefault();
    const next = (to + count) % count;
    choose(next);
    document.getElementById(`${id}-tab-${next}`)?.focus();
  };

  const selected = windows[section.verbs[active]!.id];

  return (
    <section
      ref={root}
      data-scroll-section
      data-scroll-steps={count}
      id={section.id}
      // From lg: a screen per feature (STEPPED), its content pinned in view.
      className={cn(STOP, STEPPED)}
      style={{ "--steps": count } as CSSProperties}
    >
      {/* The snap stops, one a screen apart; useSectionPaging moves one per
          wheel gesture. Below lg there are none: the section is one stop. */}
      {section.verbs.map((v, i) => (
        <div
          key={v.id}
          ref={(el) => {
            steps.current[i] = el;
          }}
          aria-hidden
          data-step={i}
          className="pointer-events-none absolute inset-x-0 hidden h-dvh snap-start lg:block"
          style={{ top: `${i * 100}dvh` }}
        />
      ))}
      <div className="lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:justify-center lg:py-24">
        {/* mt-8: on phones and at 1024×768 the section outgrows the screen and
            snaps with its top under the sticky header. */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,21rem)_minmax(0,1fr)] lg:items-center lg:gap-10">
          <div className="min-w-0">
            <p className={KICKER}>{section.title}</p>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl lg:text-3xl">
              <TypedText text={section.heading} progress={title ?? 0} />
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted lg:text-base">
              <TypedText text={section.lede} progress={lede ?? 0} />
            </p>
            <div
              role="tablist"
              aria-label={`${section.title} features`}
              aria-orientation="horizontal"
              onKeyDown={onKeyDown}
              className="mt-6 grid grid-cols-3 gap-1"
            >
              {section.verbs.map((v, i) => {
                const on = i === active;
                return (
                  <button
                    key={v.id}
                    id={`${id}-tab-${i}`}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    aria-controls={`${id}-panel-${i}`}
                    tabIndex={on ? 0 : -1}
                    onClick={() => choose(i)}
                    className={cn(
                      "relative overflow-hidden rounded-[length:var(--radius-md)] px-3 py-2 text-center outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent/40",
                      on ? "text-foreground" : "text-muted hover:text-foreground",
                    )}
                  >
                    {on ? (
                      <motion.span
                        layoutId={`${id}-selected`}
                        transition={reduce ? { duration: 0 } : FADE}
                        aria-hidden
                        className="absolute inset-0 rounded-[length:var(--radius-md)] border border-border bg-elevated shadow-elevation"
                      />
                    ) : null}
                    <span className="relative block font-display text-base font-bold tracking-tight">{v.title}</span>
                    <span className="sr-only">{v.line}</span>
                  </button>
                );
              })}
            </div>
            {/* The selected verb's line once under the row (the tabs carry it
                for screen readers), with its note and the page it comes from. */}
            <div aria-hidden className="mt-3 min-h-[3lh] text-sm leading-snug">
              <p className="text-muted">{section.verbs[active]!.line}</p>
              {selected.note ? <p className="mt-1 font-display font-bold text-foreground">{selected.note}</p> : null}
            </div>
            <div className="mt-1 flex min-h-9 flex-wrap items-center gap-x-5 gap-y-1">
              {selected.link ? (
                <Link href={selected.link.href} className="inline-flex min-h-9 items-center gap-1 text-sm text-foreground hover:underline">
                  {selected.link.label}
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              ) : null}
            </div>
          </div>

          <div
            ref={row}
            className={cn(
              "min-w-0",
              deck
                ? "relative h-[46rem]"
                : "-mx-6 flex snap-x snap-mandatory items-start gap-4 overflow-x-auto px-6 pb-2 [scrollbar-width:none] md:-mx-16 md:px-16",
            )}
          >
            {section.verbs.map((verb, i) => (
              <StackItem key={verb.id} offset={Math.sign(i - active)} deck={deck} reduce={reduce}>
                <Panel id={`${id}-panel-${i}`} content={windows[verb.id]} front={i === active} deck={deck} />
              </StackItem>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * One component in the stack: in place and visible when it is the selected
 * one (offset 0), otherwise slid above (-1) or below (1) and hidden: faded
 * out, taking no pointer, and its panel `inert`, so it can't be focused or read.
 */
function StackItem({
  offset,
  deck,
  reduce,
  children,
}: {
  offset: number;
  deck: boolean;
  reduce: boolean;
  children: ReactNode;
}) {
  const shown = offset === 0;
  return (
    <motion.div
      data-offset={offset}
      initial={false}
      animate={
        deck
          ? { y: shown ? 0 : offset * SLIDE_Y, opacity: shown ? 1 : 0 }
          : FLAT
      }
      transition={reduce ? { duration: 0 } : TURN}
      className={cn(
        deck
          ? "absolute inset-0 flex items-center"
          : "relative w-[86%] shrink-0 snap-center sm:w-[80%]",
        deck && !shown && "pointer-events-none",
      )}
    >
      <div className="relative w-full">
        {/* The components have no card, so a see-through one (the map's
            canvas) showed the blurred backdrop through it and read as
            blurred; opaque paper, feathered at the edges, sits
            behind each one instead, and no frame is drawn. */}
        {deck ? <div aria-hidden className="ring-veil pointer-events-none absolute -inset-4" /> : null}
        {children}
      </div>
    </motion.div>
  );
}

function Panel({ id, content, front, deck }: { id: string; content: WindowContent; front: boolean; deck: boolean }) {
  return (
    // inert behind: a component out of front can't be focused or read, so
    // the tab order and a screen reader only meet the one the tabs selected.
    // In the ring the box is its content's height, up to the stage's (a tall
    // cheatsheet scrolls inside); the map, the list and the coach have no
    // height of their own, so they get a set one.
    <div
      id={id}
      role="tabpanel"
      aria-label={content.label}
      tabIndex={0}
      inert={!front}
      className={cn(
        "relative flex min-w-0 flex-col overflow-y-auto rounded-[length:var(--radius-lg)] outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
        deck ? (content.fill ? "h-[34rem]" : "max-h-[46rem]") : "h-[28rem]",
      )}
    >
      <div className={cn("w-full min-w-0", content.fill ? "h-full min-h-0" : deck ? "" : "my-auto")}>{content.body}</div>
    </div>
  );
}
