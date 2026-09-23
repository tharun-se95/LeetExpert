"use client";

import { useEffect, useRef, useState } from "react";

/** A 1% band across the scroller's middle; the section it crosses is active. */
export const MIDDLE_BAND = "-49.5% 0px -49.5% 0px";

/** Index of the section whose box spans `line` (px from the viewport top), or -1. */
export function activeSectionIndex(
  boxes: readonly { top: number; bottom: number }[],
  line: number,
): number {
  return boxes.findIndex(({ top, bottom }) => top <= line && line < bottom);
}

/**
 * Which `[data-scroll-section]` inside `root` is active — the one crossing the
 * middle of <main>, the app's only scroller — and which have ever been active.
 *
 * An IntersectionObserver, not a scroll listener: measured at 375px, a page
 * that came back already scrolled to a section fired no scroll event, so a
 * listener never measured and the section sat untyped until the reader
 * scrolled. The observer reports the current position as soon as it starts,
 * and on any change of position, however it happened.
 *
 * It drives no animation (the landing's motion is CSS on view timelines):
 * only which heavy features load and when the stage cards rise. `active`
 * keeps its last value while the band crosses none of this root's sections.
 */
export function useActiveSection<T extends HTMLElement = HTMLDivElement>(count: number) {
  const root = useRef<T>(null);
  const [active, setActive] = useState(-1);
  const [started, setStarted] = useState<readonly boolean[]>(() => new Array<boolean>(count).fill(false));

  useEffect(() => {
    const sections = root.current
      ? Array.from(root.current.querySelectorAll<HTMLElement>("[data-scroll-section]"))
      : [];
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((entry) => entry.isIntersecting).at(-1);
        if (!hit) return;
        const i = sections.findIndex((section) => section === hit.target);
        if (i === -1) return;
        setActive(i);
        setStarted((prev) => (prev[i] ? prev : prev.map((was, k) => was || k === i)));
      },
      { root: document.querySelector("main"), rootMargin: MIDDLE_BAND, threshold: 0 },
    );
    for (const section of sections) observer.observe(section);
    return () => observer.disconnect();
  }, [count]);

  return { root, active, started };
}
