import type { InsightChecklistItem, MemoryMarker } from "@/lib/insight/types";

/**
 * Optional per-problem teaching overlays. Checklist lines name the pattern
 * or invariant — never solution source. Markers are schematic (case-bound).
 */
export interface GoldInsightConfig {
  checklist?: InsightChecklistItem[];
  /** Applied to string/array memory derived from the selected case. */
  markers?: MemoryMarker[];
  /** Prefer this pattern title from the module cheatsheet when present. */
  preferPattern?: string;
}

export const GOLD_INSIGHT: Record<string, GoldInsightConfig> = {
  "valid-palindrome": {
    preferPattern: "Two-pointer palindrome",
    checklist: [
      {
        label: "Skip non-alphanumeric before comparing",
        tone: "accent",
      },
      {
        label: "Compare lowercase forms at L and R",
        tone: "good",
      },
      {
        label: "Stop when pointers cross — empty cleaned string is true",
        tone: "mark",
      },
    ],
    markers: [
      { index: "start", label: "L", kind: "left" },
      { index: "end", label: "R", kind: "right" },
    ],
  },
  "two-sum": {
    preferPattern: "Complement map",
    checklist: [
      {
        label: "Need complement of current value vs target",
        tone: "accent",
      },
      {
        label: "One pass: remember values already seen",
        tone: "good",
      },
    ],
  },
  "two-sum-ii": {
    preferPattern: "Opposite ends",
    checklist: [
      {
        label: "Sorted input → move the end that reduces the error",
        tone: "accent",
      },
      {
        label: "L starts low, R starts high; they never cross past a hit",
        tone: "good",
      },
    ],
    markers: [
      { index: "start", label: "L", kind: "left" },
      { index: "end", label: "R", kind: "right" },
    ],
  },
  "move-zeroes": {
    preferPattern: "Write pointer",
    checklist: [
      {
        label: "Write index trails reads — swap or assign non-zeros forward",
        tone: "accent",
      },
      {
        label: "Fill the tail with zeros after the write frontier",
        tone: "mark",
      },
    ],
    markers: [{ index: "start", label: "W", kind: "write" }],
  },
  "container-with-most-water": {
    preferPattern: "Inward area search",
    checklist: [
      {
        label: "Area = width × min(height[L], height[R])",
        tone: "accent",
      },
      {
        label: "Advance the shorter side — width only shrinks",
        tone: "good",
      },
    ],
    markers: [
      { index: "start", label: "L", kind: "left" },
      { index: "end", label: "R", kind: "right" },
    ],
  },
  "longest-substring-without-repeating": {
    preferPattern: "Variable window",
    checklist: [
      {
        label: "Window holds unique chars; shrink when a duplicate enters",
        tone: "accent",
      },
      {
        label: "Track last-seen index (or a set) for the left edge",
        tone: "good",
      },
    ],
    markers: [
      { index: "start", label: "Lo", kind: "window-lo" },
      { index: "end", label: "Hi", kind: "window-hi" },
    ],
  },
};
