import type { ModuleCheatsheet } from "@/lib/course/cheatsheets/types";
import type { MindMapNode } from "@/lib/course/conceptMaps/types";
import type { ProblemGroup } from "@/lib/course/manifest";
import type { FamilyId } from "@/lib/content/manifest";
import { METHOD_TARGET, METHOD_VALUES } from "@/lib/landing/method";
import { plural } from "@/lib/landing/story";

/**
 * Understand, Build and Keep: every feature in the app on the landing page,
 * as nine verbs in three sections (owner, 2026-09-17 — headings and verbs as
 * approved in the layout mock). Counts come from the server.
 * Spec: docs/superpowers/specs/2026-09-15-landing-product-page-design.md §12,
 * §13; laid out as stacked rows, spec 2026-09-23-landing-natural-scroll-3d-hero-design.md.
 */

export type VerbId = "watch" | "learn" | "map" | "code" | "review" | "optimize" | "practice" | "recall" | "burn";
export type SectionId = "understand" | "build" | "keep";

export type FeatureCounts = {
  problems: number;
  cheatsheets: number;
};

/** What the nine windows read from the course; built on the server by productData.ts. */
export type FeatureData = {
  counts: FeatureCounts;
  /** The module intro video (HyperFrames), owner 2026-09-19: the Arrays one. */
  watch: { title: string; href: string; video: string };
  learn: { title: string; href: string; viz: string };
  map: { root: MindMapNode; moduleTitle: string; family: FamilyId | null; href: string };
  practice: { groups: ProblemGroup[]; href: string };
  recall: { sheet: ModuleCheatsheet; moduleTitle: string; href: string };
};

export type Verb = {
  id: VerbId;
  title: string;
  /** What the feature does, beside its component. */
  line: string;
};

export type FeatureSection = {
  id: SectionId;
  title: string;
  heading: string;
  /**
   * The heading's key word, drawn over as the section arrives (owner,
   * 2026-09-23): underlined by hand, or swept with a highlighter.
   */
  mark: { word: string; style: "underline" | "highlight" };
  /** The family whose colour the section's marks, icons and rules take — content-scoped, never chrome. */
  family: FamilyId;
  lede: string;
  verbs: readonly Verb[];
};

export function featureSections(counts: FeatureCounts): readonly FeatureSection[] {
  return [
    {
      id: "understand",
      title: "Understand",
      heading: "See it before you solve it.",
      mark: { word: "before", style: "underline" },
      family: "linear-traversal",
      lede: "Watch the idea explained, step through it line by line, then see where it sits in the module.",
      verbs: [
        {
          id: "watch",
          title: "Watch",
          line: "Narrated video and audio walkthroughs.",
        },
        {
          id: "learn",
          title: "Learn",
          line: "Lessons with tracers that step through the code.",
        },
        {
          id: "map",
          title: "Map",
          line: "Each module as a concept map you can expand.",
        },
      ],
    },
    {
      id: "build",
      title: "Build",
      heading: "The code is cheap now. Judgment isn't.",
      mark: { word: "Judgment", style: "highlight" },
      family: "pointer-movement",
      lede: `One problem through all three: find two numbers in [${METHOD_VALUES.join(", ")}] that add up to ${METHOD_TARGET}. Write it, let the coach catch a broken draft, then make it fast.`,
      verbs: [
        {
          id: "code",
          title: "Code",
          line: "Solve it in Python or JavaScript, in the browser.",
        },
        {
          id: "review",
          title: "Review",
          line: "The coach names the case that broke and points to a hint.",
        },
        {
          id: "optimize",
          title: "Optimize",
          line: "Know the cost to aim for, and why it matters.",
        },
      ],
    },
    {
      id: "keep",
      title: "Keep",
      heading: "Come back tomorrow.",
      mark: { word: "tomorrow.", style: "underline" },
      family: "recursive-exploration",
      lede: "Practise across the whole course, recall a pattern in seconds, and keep the streak burning.",
      verbs: [
        {
          id: "practice",
          title: "Practice",
          line: `${plural(counts.problems, "problem")} in one workspace.`,
        },
        {
          id: "recall",
          title: "Recall",
          line: `${plural(counts.cheatsheets, "cheatsheet")}: cues, patterns, targets, traps.`,
        },
        {
          id: "burn",
          title: "Burn",
          line: "Every practice day lights a square.",
        },
      ],
    },
  ];
}

export const ALL_VERBS: readonly VerbId[] = ["watch", "learn", "map", "code", "review", "optimize", "practice", "recall", "burn"];
