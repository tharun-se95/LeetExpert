import type { CueTone } from "@/lib/course/cheatsheets/types";

/** Border + wash classes for tone-coded surfaces (token colours only). */
export const TONE_RULE: Record<CueTone, string> = {
  accent: "border-l-accent bg-accent/5",
  good: "border-l-good bg-good/5",
  warn: "border-l-warn bg-warn/5",
  bad: "border-l-bad bg-bad/5",
  muted: "border-l-border bg-surface",
  mark: "border-l-mark bg-mark/5",
};

export const TONE_TEXT: Record<CueTone, string> = {
  accent: "text-accent",
  good: "text-good",
  warn: "text-warn",
  bad: "text-bad",
  muted: "text-muted",
  mark: "text-mark",
};

export const TONE_CHIP: Record<CueTone, string> = {
  accent: "border-accent/40 text-accent bg-accent/10",
  good: "border-good/40 text-good bg-good/10",
  warn: "border-warn/40 text-warn bg-warn/10",
  bad: "border-bad/40 text-bad bg-bad/10",
  muted: "border-border text-muted bg-surface",
  mark: "border-mark/40 text-mark bg-mark/10",
};
