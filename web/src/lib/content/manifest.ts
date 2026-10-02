import { slugify } from "@/lib/slugify";

export type FamilyId =
  | "linear-traversal"
  | "pointer-movement"
  | "ordering-search"
  | "recursive-exploration"
  | "state-transition"
  | "relationships"
  | "priority-structures"
  | "foundations";

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
  patterns: PatternMeta[];
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
    patterns: patterns([
      { title: "Stack" },
      { title: "Queue" },
      { title: "Heap / Priority Queue" },
      { title: "Monotonic Stack" },
      { title: "Trie" },
    ]),
  },
  {
    id: "foundations",
    number: 8,
    title: "Foundations",
    shortTitle: "Foundations",
    description:
      "Before the patterns — how to approach a problem, Big-O, and the maths the course leans on.",
    // no pattern lab: these modules teach tools the patterns use, not a pattern
    patterns: [],
  },
];
