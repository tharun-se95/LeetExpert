import type { curriculumStats } from "@/lib/landing/content";

/**
 * The landing page's copy and the pure helpers that type it out as each
 * section snaps into view. Kept free of runtime imports from content.ts (which pulls the course
 * manifest) so the client components that render it stay small.
 * Specs: docs/superpowers/specs/2026-09-14-landing-rewrite-agentic-ai-design.md,
 * docs/superpowers/specs/2026-09-15-landing-product-page-design.md
 */

export type CurriculumCounts = Pick<ReturnType<typeof curriculumStats>, "modules" | "lessons" | "problems">;

export const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

export function countsLine(counts: CurriculumCounts): string {
  return `${counts.modules} modules · ${counts.lessons} lessons · ${counts.problems} problems`;
}

// --- hero ---------------------------------------------------------------
/**
 * One sentence per line (owner, 2026-09-14): wrapped as one string it broke
 * "…the / code. You decide / if it's right." Judgment, not "agents can't solve
 * problems": the contrast has to be true for readers who use agents daily.
 */
const HERO_LINES = ["Agents write the code.", "You decide if it's right."] as const;

export const HERO = {
  kicker: "DSA for the age of AI",
  lines: HERO_LINES,
  title: HERO_LINES.join(" "),
  // Owner's wording (2026-09-14).
  lede: "Learning data structures and algorithms is for the part of the job that doesn't get automated.",
  // What the product is, for a visitor who has never heard of it (owner, 2026-09-15).
  descriptor:
    "A structured course in data structures and algorithms: visual lessons, and problems you solve in your browser in Python or JavaScript.",
  start: "Start learning free",
  explore: "Explore the curriculum",
} as const;

// --- what's inside ------------------------------------------------------
export type Chapter = {
  id: string;
  kicker: string;
  title: string;
  body: readonly string[];
};

export function inside(counts: CurriculumCounts): Chapter {
  return {
    id: "inside",
    kicker: "The course",
    title: "What's inside.",
    body: [
      `${countsLine(counts)}, each one runnable in Python and JavaScript.`,
      "Every problem runs in your browser, with nothing to install.",
    ],
  };
}

/** One real course stage as a "What's inside" card; built on the server from the manifest. */
export type StageCard = {
  number: number;
  title: string;
  description: string;
  modules: number;
  lessons: number;
  href: string;
};

export function stageMeta(stage: Pick<StageCard, "modules" | "lessons">): string {
  return `${plural(stage.modules, "module")} · ${plural(stage.lessons, "lesson")}`;
}

/** Delay between cards as they rise in, so a row reads left to right, top to bottom. */
export const RISE_STAGGER_MS = 70;

// --- burn (the heatmap) --------------------------------------------------
/**
 * The heatmap, renamed Burn (owner, 2026-09-17) and shown in Keep, with the
 * owner's credits line beneath it. Credit rules aren't defined yet, so the
 * copy names no amounts or rates.
 */
export const HEAT = {
  title: "Burn",
  body: "Every day you practise lights up a square, so your rhythm is visible at a glance: the weeks you kept going, the days you stalled, and how long your streak has run.",
  credits: "Earn credits for consistent heat.",
  example: "An example year",
} as const;

// --- learners (placeholder social proof) --------------------------------
export type ProofStat = { value: string; label: string; placeholder: true };
export type ProofQuote = { quote: string; name: string; role: string; placeholder: true };

/**
 * Placeholder social proof (owner, 2026-09-15): examples, labelled on the page
 * in every build. The one deliberate exception to "every number computed" —
 * there are no learners to count yet. Quotes are attributed to "Name Surname",
 * never an invented person. End condition: replace with real numbers and
 * quotes, then drop the flags and the tags.
 */
export const PROOF: {
  kicker: string;
  title: string;
  note: string;
  stats: readonly ProofStat[];
  quotes: readonly ProofQuote[];
} = {
  kicker: "Learners",
  title: "What learners say.",
  note: "example numbers and quotes, to be replaced with real ones before launch",
  stats: [
    { value: "2,400+", label: "engineers learning", placeholder: true },
    { value: "18,000", label: "problems solved", placeholder: true },
    { value: "4.8 / 5", label: "average lesson rating", placeholder: true },
  ],
  quotes: [
    {
      quote: "I stopped memorising solutions. Now I can tell why the agent's answer times out.",
      name: "Name Surname",
      role: "Backend engineer",
      placeholder: true,
    },
    {
      quote: "The tracers made recursion click in an afternoon.",
      name: "Name Surname",
      role: "Computer science student",
      placeholder: true,
    },
    {
      quote: "Every problem asks what it costs. That habit changed how I review pull requests.",
      name: "Name Surname",
      role: "Senior engineer",
      placeholder: true,
    },
  ],
};

// --- pricing and questions ----------------------------------------------
export const PRICING = {
  kicker: "Pricing",
  title: "Start free. Pay as you learn.",
  body: "The early modules are free. After that, you unlock modules one at a time, as you reach them.",
  cta: "Start the first lesson",
} as const;

export const FAQ: readonly { q: string; a: string }[] = [
  {
    q: "Who is it for?",
    a: "Engineers preparing for interviews, students breaking into software, and working engineers who use AI and want to judge what it writes.",
  },
  {
    q: "Does it help with interviews?",
    a: "Yes. The problems are the kind interviews ask, and each one asks for the time and space it should take, not just code that passes.",
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
// NaN is "not started"; Infinity (a zero duration) is finished, so the reveal loop stops.
export const clamp01 = (v: number) => (Number.isNaN(v) ? 0 : Math.min(1, Math.max(0, v)));

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
