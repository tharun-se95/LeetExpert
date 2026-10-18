"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const WORD = "leetExpert";

/** Reveals the wordmark when scripts never run (the letters start below their line). */
export const WORDMARK_NOSCRIPT = "[data-wordmark-letter]{opacity:1!important;transform:none!important}";

/**
 * The footer's oversized wordmark: each letter rises into place, staggered,
 * the first time the footer comes into view — a one-off flourish at the end
 * of the page, after the reference's vertical-cut text reveals.
 *
 * Decorative, so aria-hidden: the footer's home link already names the site.
 * Sized in container-query units so the word spans its container at any
 * width without overflowing (Space Mono is monospaced, so the word's width is
 * a fixed multiple of its font size). Reduced motion shows it settled.
 */
export function FooterWordmark({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      // <main> is the app's scroller; observing against it keeps the snap
      // container's own bounds as the viewport.
      { root: document.querySelector("main"), threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const settled = inView || reduce;

  return (
    <div ref={ref} aria-hidden className={cn("@container overflow-hidden select-none", className)}>
      <noscript>
        <style>{WORDMARK_NOSCRIPT}</style>
      </noscript>
      {/* pb: the box clips the letters' rise, and at leading-[0.85] it cut
          the descender of the "p" off; the padding keeps it inside the clip. */}
      <p className="pb-[0.2em] font-display text-[16.3cqw] leading-[0.85] font-bold whitespace-nowrap bg-gradient-to-b from-foreground via-foreground/90 to-muted/40 bg-clip-text text-transparent">
        {WORD.split("").map((letter, i) => (
          <motion.span
            key={i}
            data-wordmark-letter
            className="inline-block bg-gradient-to-b from-foreground via-foreground/90 to-muted/40 bg-clip-text text-transparent"
            initial={false}
            animate={settled ? { y: "0%", opacity: 1 } : { y: "100%", opacity: 0 }}
            transition={reduce ? { duration: 0 } : { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: i * 0.05 }}
          >
            {letter}
          </motion.span>
        ))}
      </p>
    </div>
  );
}
