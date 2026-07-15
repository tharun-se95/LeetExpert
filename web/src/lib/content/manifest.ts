import { slugify } from "@/lib/slugify";

/** Handbook root is one level above the Next.js `web/` app. */
export const HANDBOOK_ROOT = ".." as const;

export type FamilyId =
  | "linear-traversal"
  | "pointer-movement"
  | "ordering-search"
  | "recursive-exploration"
  | "state-transition"
  | "relationships"
  | "priority-structures";

export interface PatternMeta {
  slug: string;
  title: string;
  /** Exact ## heading text in the family markdown file */
  heading: string;
}

export interface FamilyMeta {
  id: FamilyId;
  number: number;
  title: string;
  shortTitle: string;
  description: string;
  file: string;
  cheatSheetFile: string;
  practiceFile: string;
  patterns: PatternMeta[];
}

export interface FoundationChapter {
  slug: string;
  title: string;
  shortTitle: string;
  file: string;
}

function patterns(
  items: { title: string; heading?: string }[],
): PatternMeta[] {
  return items.map((item) => ({
    title: item.title,
    heading: item.heading ?? item.title,
    slug: slugify(item.title),
  }));
}

export const FAMILIES: FamilyMeta[] = [
  {
    id: "linear-traversal",
    number: 1,
    title: "Linear Traversal",
    shortTitle: "Linear",
    description:
      "Stop scanning the same data twice — maps, sets, prefix sums, and in-place arrays.",
    file: "part-2-pattern-families/family-1-linear-traversal.md",
    cheatSheetFile: "part-4-cheat-sheets/family-1-linear-traversal.md",
    practiceFile: "part-5-practice-roadmap/family-1-linear-traversal.md",
    patterns: patterns([
      { title: "Arrays" },
      { title: "Hash Maps" },
      { title: "Hash Sets" },
      { title: "Prefix Sum" },
    ]),
  },
  {
    id: "pointer-movement",
    number: 2,
    title: "Pointer Movement",
    shortTitle: "Pointers",
    description:
      "Two fingers on a line — windows, two pointers, cycles, and list surgery.",
    file: "part-2-pattern-families/family-2-pointer-movement.md",
    cheatSheetFile: "part-4-cheat-sheets/family-2-pointer-movement.md",
    practiceFile: "part-5-practice-roadmap/family-2-pointer-movement.md",
    patterns: patterns([
      { title: "Two Pointers" },
      { title: "Sliding Window" },
      { title: "Fast & Slow Pointers" },
      { title: "Linked List Pointer Manipulation" },
    ]),
  },
  {
    id: "ordering-search",
    number: 3,
    title: "Ordering & Search",
    shortTitle: "Ordering",
    description:
      "Sort once, then hunt — binary search, intervals, and sweep line.",
    file: "part-2-pattern-families/family-3-ordering-search.md",
    cheatSheetFile: "part-4-cheat-sheets/family-3-ordering-search.md",
    practiceFile: "part-5-practice-roadmap/family-3-ordering-search.md",
    patterns: patterns([
      { title: "Sorting" },
      { title: "Binary Search" },
      { title: "Intervals" },
      { title: "Sweep Line" },
    ]),
  },
  {
    id: "recursive-exploration",
    number: 4,
    title: "Recursive Exploration",
    shortTitle: "Recursive",
    description:
      "Branch into trees and graphs — DFS, traversals, divide & conquer, backtracking.",
    file: "part-2-pattern-families/family-4-recursive-exploration.md",
    cheatSheetFile: "part-4-cheat-sheets/family-4-recursive-exploration.md",
    practiceFile: "part-5-practice-roadmap/family-4-recursive-exploration.md",
    patterns: patterns([
      { title: "DFS" },
      { title: "Tree Traversals" },
      { title: "Divide and Conquer" },
      { title: "Backtracking" },
    ]),
  },
  {
    id: "state-transition",
    number: 5,
    title: "State Transition",
    shortTitle: "State",
    description:
      "Remember overlapping answers — memoization, DP, and proven greedy picks.",
    file: "part-2-pattern-families/family-5-state-transition.md",
    cheatSheetFile: "part-4-cheat-sheets/family-5-state-transition.md",
    practiceFile: "part-5-practice-roadmap/family-5-state-transition.md",
    patterns: patterns([
      { title: "Memoization" },
      { title: "Dynamic Programming" },
      { title: "Greedy" },
    ]),
  },
  {
    id: "relationships",
    number: 6,
    title: "Relationships",
    shortTitle: "Graphs",
    description:
      "Nodes and edges — BFS, Union Find, topo sort, Dijkstra, MST.",
    file: "part-2-pattern-families/family-6-relationships.md",
    cheatSheetFile: "part-4-cheat-sheets/family-6-relationships.md",
    practiceFile: "part-5-practice-roadmap/family-6-relationships.md",
    patterns: patterns([
      { title: "BFS" },
      { title: "Graph Traversal" },
      { title: "Union Find", heading: "Union Find (Disjoint Set)" },
      { title: "Topological Sort" },
      { title: "Dijkstra" },
      { title: "Minimum Spanning Tree" },
    ]),
  },
  {
    id: "priority-structures",
    number: 7,
    title: "Priority Structures",
    shortTitle: "Priority",
    description:
      "Order by importance — stacks, queues, heaps, monotonic stacks, tries.",
    file: "part-2-pattern-families/family-7-priority-structures.md",
    cheatSheetFile: "part-4-cheat-sheets/family-7-priority-structures.md",
    practiceFile: "part-5-practice-roadmap/family-7-priority-structures.md",
    patterns: patterns([
      { title: "Stack" },
      { title: "Queue" },
      { title: "Heap / Priority Queue" },
      { title: "Monotonic Stack" },
      { title: "Trie" },
    ]),
  },
];

export const FOUNDATIONS: FoundationChapter[] = [
  {
    slug: "solving-problems",
    title: "How to Solve Any DSA Problem",
    shortTitle: "Ch 1 — Solving Problems",
    file: "part-1-foundations/chapter-01-solving-problems.md",
  },
  {
    slug: "big-o",
    title: "Big O in Practical Terms",
    shortTitle: "Ch 2 — Big O",
    file: "part-1-foundations/chapter-02-big-o.md",
  },
  {
    slug: "pattern-recognition",
    title: "Pattern Recognition",
    shortTitle: "Ch 3 — Pattern Recognition",
    file: "part-1-foundations/chapter-03-pattern-recognition.md",
  },
];

export const STATIC_PAGES = {
  recognition: {
    title: "Pattern Recognition Guide",
    file: "part-3-pattern-recognition/README.md",
    href: "/recognition",
  },
  stems: {
    title: "Recognition Stems",
    file: "part-3-pattern-recognition/recognition-stems.md",
    href: "/recognition/stems",
  },
  glossary: {
    title: "Glossary",
    file: "GLOSSARY.md",
    href: "/glossary",
  },
  decisionTrees: {
    title: "Decision Trees",
    file: "DECISION_TREES.md",
    href: "/decision-trees",
  },
  questionBank: {
    title: "Question Bank",
    file: "QUESTION_BANK.md",
    href: "/question-bank",
  },
  cheatSheetsIndex: {
    title: "Cheat Sheets",
    file: "part-4-cheat-sheets/README.md",
    href: "/cheat-sheets",
  },
  practiceIndex: {
    title: "Practice Roadmap",
    file: "part-5-practice-roadmap/README.md",
    href: "/practice",
  },
} as const;

export function getFamily(id: string): FamilyMeta | undefined {
  return FAMILIES.find((f) => f.id === id);
}

export function getPattern(
  familyId: string,
  patternSlug: string,
): { family: FamilyMeta; pattern: PatternMeta } | undefined {
  const family = getFamily(familyId);
  if (!family) return undefined;
  const pattern = family.patterns.find((p) => p.slug === patternSlug);
  if (!pattern) return undefined;
  return { family, pattern };
}

export function getFoundation(slug: string): FoundationChapter | undefined {
  return FOUNDATIONS.find((c) => c.slug === slug);
}
