import type { curriculumStats } from "@/lib/landing/content";

/**
 * The landing page's copy and the pure helpers that type it out as each
 * section snaps into view. Kept free of runtime imports from content.ts (which pulls the course
 * manifest) so the client components that render it stay small.
 * Spec: docs/superpowers/specs/2026-09-14-landing-rewrite-agentic-ai-design.md
 */

export type CurriculumCounts = Pick<ReturnType<typeof curriculumStats>, "modules" | "lessons" | "problems">;

// --- numbers the copy states, computed rather than typed in -------------
export const MILLION = 1_000_000;
/** Comparisons needed to check every pair of n records. */
export const pairCount = (n: number) => (n * (n - 1)) / 2;
/** Steps a loop nested over n items takes. */
export const nestedSteps = (n: number) => n * n;

const SPELLED: readonly (readonly [number, string])[] = [
  [1e12, "a trillion"],
  [1e9, "a billion"],
  [1e6, "a million"],
];

/** "a million" for exactly 10^6 and so on; digits with separators otherwise. */
export function spellCount(n: number): string {
  return SPELLED.find(([value]) => value === n)?.[1] ?? n.toLocaleString("en-US");
}

// --- copy ---------------------------------------------------------------
/**
 * One sentence per line (owner, 2026-09-14): wrapped as one string it broke
 * "…the / code. You decide / if it's right." Judgment, not "agents can't solve
 * problems": the contrast has to be true for readers who use agents daily.
 */
const HERO_LINES = ["Agents write the code.", "You decide if it's right."] as const;

export const HERO = {
  lines: HERO_LINES,
  title: HERO_LINES.join(" "),
  // Owner's wording (2026-09-14).
  lede: "Learning data structures and algorithms is for the part of the job that doesn't get automated.",
} as const;

export type Point = { title: string; body: string };

/**
 * The whole argument on one screen (owner, 2026-09-14): four full chapters
 * were a long scroll to reach the point. Each point is one line of claim and
 * one line of evidence; the structure beside it takes one stage per point.
 */
export const WHY: { kicker: string; title: string; points: readonly Point[] } = {
  kicker: "Why it still matters",
  title: "The code is cheap now. Judgment isn't.",
  points: [
    {
      title: "Problem solving is the job.",
      body: "Most new problems are counting, searching, ordering or connecting things in disguise.",
    },
    {
      title: "Frame it before you prompt.",
      body: `A million records is about ${Math.round(pairCount(MILLION) / 1e9)} billion pair checks, or one pass with a hash table.`,
    },
    {
      title: "Review what it costs.",
      body: `A nested loop is ${spellCount(nestedSteps(100))} steps on a hundred items and ${spellCount(nestedSteps(MILLION))} on a million.`,
    },
    {
      title: "Learn what doesn't expire.",
      body: "Dijkstra's shortest-path algorithm is from 1959, and routing still builds on it. Interviews still ask for it.",
    },
  ],
};

/** How long each point takes to type; longer than the structure's 0.9s morph so each stage lands before the next begins. */
export const POINT_MS = 1100;

/** Typing order: the heading, then each point's title and body. */
export function argumentLengths(): number[] {
  return [WHY.title.length, ...WHY.points.flatMap((p) => [p.title.length, p.body.length])];
}

export function argumentDuration(): number {
  return WHY.points.length * POINT_MS;
}

/** The structure's stage while the argument types: the last point whose title has started, 0 before any. */
export function argumentStage(parts: readonly number[]): number {
  let stage = 0;
  WHY.points.forEach((_, i) => {
    if ((parts[1 + 2 * i] ?? 0) > 0) stage = i;
  });
  return stage;
}

export type Chapter = {
  id: string;
  kicker: string;
  title: string;
  body: readonly string[];
  /** The structure's stage while this chapter is on screen (pinned from lg, inline below). */
  stage: number;
};

export function inside(counts: CurriculumCounts): Chapter {
  return {
    id: "inside",
    kicker: "The course",
    title: "What's inside.",
    body: [
      `${counts.modules} modules · ${counts.lessons} lessons · ${counts.problems} problems, each one runnable in Python and JavaScript.`,
      "Every problem runs in your browser, with nothing to install.",
    ],
    stage: WHY.points.length - 1,
  };
}

export const PRICING = {
  kicker: "Pricing",
  title: "Start free. Pay as you learn.",
  body: "The early modules are free. After that, you unlock modules one at a time, as you reach them.",
  cta: "Start the first lesson",
} as const;

/**
 * The heatmap, presented as a feature (owner, 2026-09-14), with the owner's
 * credits line beneath it. Credit rules aren't defined yet, so the copy names
 * no amounts or rates.
 */
export const HEAT = {
  kicker: "Feature",
  title: "Heatmap",
  body: "Every day you practise lights up a square, so your rhythm is visible at a glance: the weeks you kept going, the days you stalled, and how long your streak has run.",
  credits: "Earn credits for consistent heat.",
  example: "An example year",
} as const;

export const FAQ: readonly { q: string; a: string }[] = [
  {
    q: "If AI can write code, why learn this?",
    a: "Because deciding what to build, and whether what was built is right and fast enough, is still yours. That judgment is what this course trains.",
  },
  {
    q: "Which languages?",
    a: "Lessons teach in Python and TypeScript; sandboxes run Python and JavaScript.",
  },
  {
    q: "Do I need a CS degree?",
    a: "No. If you can write basic loops and functions, you can start; the first stage builds the vocabulary the rest of the course uses.",
  },
];

// --- typing -------------------------------------------------------------
const clamp01 = (v: number) => (Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 0);

/**
 * Characters of `text` visible at `progress`, in whole words: the cut always
 * lands at the end of a word, so a word never appears half-typed. Word by word
 * rather than letter by letter (owner, 2026-09-14) — per-letter typing was too
 * busy to read along with. A word is a run of non-space characters, so an
 * emoji's surrogate pair can never be split either.
 */
export function typedLength(text: string, progress: number): number {
  const ends = [...text.matchAll(/\S+/g)].map((m) => m.index + m[0].length);
  if (ends.length === 0) return text.length;
  const words = Math.round(clamp01(progress) * ends.length);
  if (words === 0) return 0;
  return words === ends.length ? text.length : ends[words - 1]!;
}

/**
 * Splits one progress value across consecutive strings by length, so a
 * heading finishes typing before its paragraphs start.
 */
export function segmentProgress(lengths: readonly number[], progress: number): number[] {
  const total = lengths.reduce((sum, len) => sum + len, 0);
  if (total === 0) return lengths.map(() => 1);
  const done = clamp01(progress) * total;
  let start = 0;
  return lengths.map((len) => {
    const p = len === 0 ? (done >= start ? 1 : 0) : clamp01((done - start) / len);
    start += len;
    return p;
  });
}

/**
 * How long a section takes to type: ~12ms a character, but never so quick it
 * reads as a flash, nor so slow a long chapter keeps the reader waiting.
 */
export function typingDuration(chars: number): number {
  return Math.min(2400, Math.max(700, chars * 12));
}
