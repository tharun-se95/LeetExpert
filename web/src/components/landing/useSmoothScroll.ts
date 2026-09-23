"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Inertial wheel scrolling on the landing page (owner, 2026-09-24: native
 * wheel steps felt "very rigid ... not smooth and sensitive"). Lenis eases
 * each wheel delta toward its target instead of jumping a notch at a time.
 *
 * <main> is the app's scroller, not the document, so Lenis is pointed at it
 * as the wrapper. Touch keeps native momentum (syncTouch stays off), nested
 * boxes that can still scroll — the cheatsheet, the problem list, the coach
 * thread — keep the wheel (allowNestedScroll), and anchor links go through
 * Lenis so a #verb jump glides too and still honours scroll-margin-top.
 * Scroll-driven CSS (the hero's cover timeline, the pops) reads the real
 * scrollTop, which Lenis writes every frame, so nothing else changes. Reduced
 * motion gets no instance at all.
 */
export function useSmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const main = document.querySelector("main");
    const content = main?.firstElementChild;
    if (!main || !(content instanceof HTMLElement)) return;
    const lenis = new Lenis({
      wrapper: main,
      content,
      lerp: 0.09,
      wheelMultiplier: 0.85,
      allowNestedScroll: true,
      anchors: true,
      autoRaf: true,
    });
    return () => lenis.destroy();
  }, []);
}
