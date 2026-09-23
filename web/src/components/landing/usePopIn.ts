"use client";

import { useEffect } from "react";

/**
 * Pops each `.landing-pop` element in as it first comes into view (owner,
 * 2026-09-23: "the animations of the cards should pop, no scroll fade in").
 * A pop is a timed animation (globals.css, `[data-pop="in"]`), played once,
 * not scrubbed by the scroll position — scrubbing left a card half-faded
 * whenever the reader paused mid-arrival.
 *
 * Only elements still below the fold are armed (hidden, ready to pop); what
 * is already on screen when the page loads is left alone, so nothing that
 * rendered visible on the server blanks on hydration. Reduced motion arms
 * nothing. One observer for the whole page, on <main>, the app's scroller.
 */
export function usePopIn() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const main = document.querySelector("main");
    if (!main) return;
    const fold = main.getBoundingClientRect().bottom;
    const targets = Array.from(main.querySelectorAll<HTMLElement>(".landing-pop")).filter(
      (el) => el.getBoundingClientRect().top > fold,
    );
    for (const el of targets) el.dataset.pop = "armed";

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.pop = "in";
          observer.unobserve(entry.target);
        }
      },
      { root: main, rootMargin: "0px 0px -12% 0px", threshold: 0 },
    );
    for (const el of targets) observer.observe(el);
    return () => {
      observer.disconnect();
      // Leave nothing hidden if the page unmounts mid-scroll.
      for (const el of targets) if (el.dataset.pop === "armed") delete el.dataset.pop;
    };
  }, []);
}
