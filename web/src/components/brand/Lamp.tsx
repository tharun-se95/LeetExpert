"use client";

import { useId, type AnimationEvent } from "react";

interface LampProps {
  /** Rendered width and height in px; the mark is drawn on a 64 grid. */
  size: number;
  /**
   * Power-on bloom: plays on the first paint of a tab (see lampBoot.ts) and
   * on hover/focus of an ancestor `.lamp-link`. Only the header lamp blooms.
   */
  bloom?: boolean;
  className?: string;
}

/**
 * The leetExpert mark: a soft-glowing dot. Painted only from the --lamp
 * tokens so both themes come from globals.css.
 * Spec: docs/superpowers/specs/2026-09-13-lamp-logo-design.md
 */
export function Lamp({ size, bloom = false, className }: LampProps) {
  // useId's output format has changed across React versions and can include
  // characters that break a url(#…) reference, so keep only id-safe ones.
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const haloId = `lamp-halo-${uid}`;
  const coreId = `lamp-core-${uid}`;

  // Clear the first-paint flag once the bloom finishes. Left in place, a
  // hover that ends would drop the replay animation, fall back to the boot
  // selector, and play the bloom a second time.
  function handleAnimationEnd(event: AnimationEvent<SVGSVGElement>) {
    if (event.animationName.startsWith("lamp-halo")) {
      delete document.documentElement.dataset.lampBoot;
    }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden
      focusable="false"
      className={["lamp", bloom ? "lamp--bloom" : null, className]
        .filter(Boolean)
        .join(" ")}
      onAnimationEnd={bloom ? handleAnimationEnd : undefined}
    >
      <defs>
        <radialGradient id={haloId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" style={{ stopColor: "var(--lamp)", stopOpacity: "var(--lamp-halo-a)" }} />
          <stop offset="33%" style={{ stopColor: "var(--lamp)", stopOpacity: "var(--lamp-halo-b)" }} />
          <stop offset="69%" style={{ stopColor: "var(--lamp)", stopOpacity: "var(--lamp-halo-c)" }} />
          <stop offset="100%" style={{ stopColor: "var(--lamp)", stopOpacity: 0 }} />
        </radialGradient>
        <radialGradient id={coreId} cx="38%" cy="34%" r="70%">
          <stop offset="0%" style={{ stopColor: "var(--lamp-hi)" }} />
          <stop offset="45%" style={{ stopColor: "var(--lamp)" }} />
          <stop offset="100%" style={{ stopColor: "var(--lamp-lo)" }} />
        </radialGradient>
      </defs>
      <circle className="lamp-halo" cx="32" cy="32" r="30" fill={`url(#${haloId})`} />
      <circle className="lamp-core" cx="32" cy="32" r="15" fill={`url(#${coreId})`} />
    </svg>
  );
}
