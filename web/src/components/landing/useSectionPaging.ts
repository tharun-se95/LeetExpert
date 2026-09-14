"use client";

import { useEffect } from "react";
import { activeSectionIndex } from "@/components/landing/useSectionReveal";

/** Longer than the smooth scroll between stops, so one gesture moves one stop. */
const LOCK_MS = 900;
/** Wheel events closer together than this are one gesture's momentum tail. */
const MOMENTUM_MS = 250;

export type Paging = "down" | "up" | "hold" | "native";

/**
 * What one wheel event should do on the landing page.
 * - "down" / "up": move one snap stop.
 * - "hold": swallow it — a stop change is already under way, or this is the
 *   momentum tail of the gesture that started it.
 * - "native": let the browser scroll — the current section is taller than
 *   the viewport and the reader hasn't reached its edge in that direction.
 */
export function pagingIntent({
  deltaY,
  locked,
  sectionTop,
  sectionBottom,
  viewport,
}: {
  deltaY: number;
  locked: boolean;
  sectionTop: number;
  sectionBottom: number;
  viewport: number;
}): Paging {
  if (locked) return "hold";
  const down = deltaY > 0;
  if (down && sectionBottom > viewport + 2) return "native";
  if (!down && sectionTop < -2) return "native";
  return down ? "down" : "up";
}

/**
 * One wheel gesture moves one section on the landing page (from lg, fine
 * pointers only). Measured in Chrome with `snap-mandatory`: a 300px wheel
 * scroll from the top ended back at 0, because the nearest stop to 300px of a
 * 1306px section is the one it left — a mouse-wheel reader felt the page
 * resist. A programmatic scrollBy under the same snapping resolves to the next
 * stop in its direction, so the wheel is turned into that. Keyboard and touch
 * keep the browser's native snapping; reduced motion pages instantly.
 */
export function useSectionPaging() {
  useEffect(() => {
    const main = document.querySelector("main");
    if (!main) return;
    const desktop = window.matchMedia("(pointer: fine) and (min-width: 1024px)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lockedUntil = 0;

    const onWheel = (e: WheelEvent) => {
      // ctrl+wheel is pinch-zoom on trackpads; leave it to the browser.
      if (!desktop.matches || e.ctrlKey || e.deltaY === 0) return;
      const now = performance.now();
      const viewport = main.clientHeight;
      const sections = Array.from(main.querySelectorAll<HTMLElement>("[data-scroll-section]"));
      const boxes = sections.map((el) => el.getBoundingClientRect());
      const current = boxes[activeSectionIndex(boxes, viewport / 2)];
      const intent = pagingIntent({
        deltaY: e.deltaY,
        locked: now < lockedUntil,
        sectionTop: current?.top ?? 0,
        sectionBottom: current?.bottom ?? viewport,
        viewport,
      });
      if (intent === "native") return;
      e.preventDefault();
      if (intent === "hold") {
        lockedUntil = Math.max(lockedUntil, now + MOMENTUM_MS);
        return;
      }
      lockedUntil = now + LOCK_MS;
      main.scrollBy({
        top: (intent === "down" ? 1 : -1) * viewport,
        behavior: reduce.matches ? "instant" : "smooth",
      });
    };

    main.addEventListener("wheel", onWheel, { passive: false });
    return () => main.removeEventListener("wheel", onWheel);
  }, []);
}
