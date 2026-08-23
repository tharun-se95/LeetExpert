import type { CueTone } from "@/lib/course/cheatsheets/types";

/** Tone-tinted background wash, applied only on hover so cards read as ink-on-paper at rest. */
export const TONE_HOVER_BG: Record<CueTone, string> = {
  accent: "hover:bg-accent/5",
  good: "hover:bg-good/5",
  warn: "hover:bg-warn/5",
  bad: "hover:bg-bad/5",
  muted: "hover:bg-surface",
  mark: "hover:bg-mark/5",
  insight: "hover:bg-insight/5",
};

export const TONE_TEXT: Record<CueTone, string> = {
  accent: "text-accent",
  good: "text-good",
  warn: "text-warn",
  bad: "text-bad",
  muted: "text-muted",
  mark: "text-mark",
  insight: "text-insight",
};

export const TONE_CHIP: Record<CueTone, string> = {
  accent: "border-accent/40 text-accent bg-accent/10",
  good: "border-good/40 text-good bg-good/10",
  warn: "border-warn/40 text-warn bg-warn/10",
  bad: "border-bad/40 text-bad bg-bad/10",
  muted: "border-border text-muted bg-surface",
  mark: "border-mark/40 text-mark bg-mark/10",
  insight: "border-insight/40 text-insight bg-insight/10",
};
