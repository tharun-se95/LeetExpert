"use client";

import { Pause, Play } from "@phosphor-icons/react";
import { useEffect, useId, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { PlaceholderTag } from "@/components/landing/PlaceholderTag";
import { ReviewerAvatar, reviewerColours } from "@/components/landing/ReviewerAvatar";
import type { ProofQuote } from "@/lib/landing/story";

/** Drift speed in px per second: slow enough to read a quote as it passes. */
const SPEED = 28;

/**
 * Learner quotes as a river of cards (owner, 2026-09-23, after 21st.dev's
 * landing): one row drifting sideways without end, faded at both edges. Drag
 * it with the pointer (touch still scrolls the page vertically); it rests while
 * the pointer or focus is on it, and the button beside it stops it for good
 * (WCAG 2.2.2: moving content can be paused). Reduced motion never starts it.
 *
 * The server renders the quotes once; after mount the client adds the copies
 * a seamless loop needs, aria-hidden and inert, so assistive tech and the
 * tests meet each quote exactly once. One animation-frame loop writes the
 * track's transform directly — no React render per frame.
 */
export function TestimonialRiver({ quotes, label }: { quotes: readonly ProofQuote[]; label: string }) {
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const [copies, setCopies] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduce, setReduce] = useState(false);
  const state = useRef({ offset: 0, period: 0, hover: false, drag: null as null | { x: number; from: number } });

  // Enough copies to cover the viewport twice over, measured once laid out.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(mq.matches);
    const measure = () => {
      const list = track.current;
      const box = viewport.current;
      if (!list || !box) return;
      const cards = Array.from(list.children).slice(0, quotes.length) as HTMLElement[];
      if (cards.length === 0) return;
      const gap = parseFloat(getComputedStyle(list).columnGap) || 0;
      const period = cards.reduce((sum, card) => sum + card.offsetWidth, 0) + gap * cards.length;
      state.current.period = period;
      setCopies(Math.max(1, Math.ceil((box.clientWidth * 2) / period)));
    };
    measure();
    const size = new ResizeObserver(measure);
    if (viewport.current) size.observe(viewport.current);
    return () => size.disconnect();
  }, [quotes.length]);

  // The drift: one loop, the offset wrapped into one period so it never ends.
  useEffect(() => {
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const s = state.current;
      const dt = Math.min(64, now - last) / 1000;
      last = now;
      if (!s.drag && !s.hover && !paused && !reduce) s.offset -= SPEED * dt;
      if (s.period > 0) s.offset = ((s.offset % s.period) - s.period) % s.period;
      if (track.current) track.current.style.transform = `translate3d(${s.offset}px, 0, 0)`;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [paused, reduce]);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    state.current.drag = { x: e.clientX, from: state.current.offset };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = state.current.drag;
    if (!drag) return;
    state.current.offset = drag.from + (e.clientX - drag.x);
  };
  const endDrag = () => {
    state.current.drag = null;
  };

  return (
    <div className="relative">
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-pressed={paused}
          aria-label={paused ? "Play the learner quotes" : "Pause the learner quotes"}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-foreground hover:text-foreground"
        >
          {paused ? <Play weight="fill" className="h-3.5 w-3.5" aria-hidden /> : <Pause weight="fill" className="h-3.5 w-3.5" aria-hidden />}
        </button>
      </div>
      <div
        ref={viewport}
        role="region"
        aria-label={label}
        onPointerEnter={() => (state.current.hover = true)}
        onPointerLeave={() => {
          state.current.hover = false;
          endDrag();
        }}
        onFocusCapture={() => (state.current.hover = true)}
        onBlurCapture={() => (state.current.hover = false)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className="landing-river -mx-6 cursor-grab touch-pan-y overflow-hidden py-4 select-none active:cursor-grabbing md:-mx-16"
      >
        <ul ref={track} className="flex w-max gap-6 px-6 will-change-transform md:px-16">
          {quotes.map((quote) => (
            <QuoteCard key={quote.name} quote={quote} />
          ))}
          {Array.from({ length: copies }, (_, c) =>
            quotes.map((quote) => <QuoteCard key={`${c}-${quote.name}`} quote={quote} clone />),
          )}
        </ul>
      </div>
    </div>
  );
}

/**
 * One review as an image card (owner, 2026-09-23: "beautiful image cards"): a
 * band in the reviewer's two colours with a large quote mark, the generated
 * avatar riding its edge, then the name, role and quote. It lifts and tips
 * toward the reader on hover or focus. The placeholder tag stays on every card.
 */
function QuoteCard({ quote, clone = false }: { quote: ProofQuote; clone?: boolean }) {
  const { a, b } = reviewerColours(quote.name);
  // Per card, not per name: the loop's copies repeat each name.
  const dots = `${useId()}-dots`;
  return (
    <li aria-hidden={clone || undefined} inert={clone || undefined} className="group w-[21rem] shrink-0 [perspective:900px]">
      <figure
        tabIndex={clone ? -1 : 0}
        className="flex h-full flex-col overflow-hidden rounded-[length:var(--radius-lg)] border border-border bg-elevated shadow-elevation transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:[transform:translateY(-0.5rem)_rotateX(4deg)_rotateY(-4deg)] focus-visible:[transform:translateY(-0.5rem)]"
      >
        <div
          aria-hidden
          className="relative h-24 shrink-0 overflow-hidden"
          style={{ background: `linear-gradient(120deg, ${a}, ${b})` } as CSSProperties}
        >
          <svg className="absolute inset-0 h-full w-full opacity-25" aria-hidden>
            <defs>
              <pattern id={dots} width="14" height="14" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.2" fill="var(--elevated)" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#${dots})`} />
          </svg>
          <svg
            viewBox="0 0 48 36"
            className="absolute top-3 right-5 h-14 w-16 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6"
            aria-hidden
          >
            <path
              d="M0 36V22C0 10 6 2 18 0l2 5C13 7 10 11 10 17h8v19H0Zm28 0V22C28 10 34 2 46 0l2 5c-7 2-10 6-10 12h8v19H28Z"
              fill="var(--elevated)"
              opacity="0.55"
            />
          </svg>
        </div>
        {/* relative: the band is positioned, and would otherwise paint over the avatar riding its edge. */}
        <div className="relative -mt-8 flex flex-1 flex-col px-6 pb-6">
          <div className="flex items-end justify-between gap-3">
            <span className="rounded-full ring-4 ring-[var(--elevated)] transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110">
              <ReviewerAvatar name={quote.name} size={56} />
            </span>
            <PlaceholderTag className="mb-1 bg-elevated" />
          </div>
          <figcaption className="mt-3">
            <span className="block font-display text-base font-bold tracking-tight text-foreground">{quote.name}</span>
            <span className="block text-sm text-muted">{quote.role}</span>
          </figcaption>
          <blockquote className="mt-4 flex-1 text-base leading-relaxed text-foreground">“{quote.quote}”</blockquote>
        </div>
      </figure>
    </li>
  );
}
