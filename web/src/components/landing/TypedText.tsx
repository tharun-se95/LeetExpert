"use client";

import { useReducedMotion } from "motion/react";
import { typedLength } from "@/lib/landing/story";
import { cn } from "@/lib/utils";

/**
 * Text that appears as if typed, driven by a progress value (0..1).
 *
 * Two layers: a screen-reader copy of the whole text that never changes, and
 * an aria-hidden visual layer — typed slice, caret, then the untyped rest in a
 * transparent colour so wrapping and height are final from the first frame
 * and nothing reflows as characters arrive. The rest carries data-typed-rest
 * so LandingStory's <noscript> rule can reveal it when scripts never run.
 * Reduced motion shows everything at once, with no caret.
 */
export function TypedText({
  text,
  progress,
  className,
}: {
  text: string;
  progress: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const shown = typedLength(text, reduce ? 1 : progress);
  const typing = !reduce && shown > 0 && shown < text.length;

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {text.slice(0, shown)}
        {typing ? <span className="typed-caret" /> : null}
        {shown < text.length ? (
          <span data-typed-rest className={cn("text-transparent")}>
            {text.slice(shown)}
          </span>
        ) : null}
      </span>
    </span>
  );
}
