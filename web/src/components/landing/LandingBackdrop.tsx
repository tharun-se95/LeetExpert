"use client";

import { useEffect, useState } from "react";
import { EvolvingStructure } from "@/components/landing/EvolvingStructure";
import { MIDDLE_BAND } from "@/components/landing/useSectionReveal";

/**
 * The landing page's backdrop: floating data points that gather into data
 * structures on their own slow clock, each in its module's family colour,
 * soft and on a slowly swaying 3D plane (owner, 2026-09-19; floating points,
 * its own clock and family colour, 2026-09-20).
 *
 * It keeps to the free space beside the text (owner: "don't disturb the
 * text"): fixed to the right of the text column from xl, hidden below xl,
 * where the text spans the screen. Stops whose right side carries text mark
 * themselves `data-backdrop-off`, and it fades out while one is on screen —
 * that is the only thing it watches; the shapes never follow the scroll.
 * Decorative: hidden from assistive tech.
 * Spec: docs/superpowers/specs/2026-09-15-landing-product-page-design.md §14–§15
 */
export function LandingBackdrop({ colours }: { colours: readonly string[] }) {
  const [off, setOff] = useState(false);

  useEffect(() => {
    const main = document.querySelector("main");
    const stops = main ? Array.from(main.querySelectorAll<HTMLElement>("[data-backdrop-off]")) : [];
    if (stops.length === 0) return;
    const showing = new Set<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) showing.add(e.target);
          else showing.delete(e.target);
        }
        setOff(showing.size > 0);
      },
      { root: main, rootMargin: MIDDLE_BAND, threshold: 0 },
    );
    for (const s of stops) observer.observe(s);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      aria-hidden
      data-off={off || undefined}
      className="landing-backdrop pointer-events-none fixed inset-y-0 right-0 -z-1 hidden items-center justify-center px-8 xl:flex"
    >
      <EvolvingStructure colours={colours} className="landing-backdrop-drawing w-[min(100%,110vh)] shrink-0" />
    </div>
  );
}
