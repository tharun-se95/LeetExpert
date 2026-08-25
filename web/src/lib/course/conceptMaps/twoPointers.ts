import type { MindMapNode } from "./types";

/**
 * Concept map for the Two Pointers module. Hand-authored from the
 * module's 2-lesson structure (course/two-pointers/*.md). Curriculum-
 * designer review recommended splitting Partition Pointers into two
 * lessons, reversing the lesson order, adding a "bottleneck dominance"
 * section to Converging Pointers, and removing the 2-way partition
 * function entirely — all rejected after verification: the lesson is one
 * coherent 2-zone-to-3-zone narrative (not three unrelated topics), the
 * current order deliberately opens Stage 2 with its unifying elimination
 * theme, `container-with-most-water.md` already self-teaches the
 * bottleneck argument in its own "insight" section, and the 2-way
 * partition is structurally necessary scaffolding for the lesson's own
 * 3-zone generalization.
 */
export const twoPointersConceptMap: MindMapNode = {
  id: "two-pointers",
  label: "Two Pointers",
  children: [
    {
      id: "converging-pointers",
      label: "Converging Pointers",
      children: [
        { id: "converging-shape", label: "Two indexes start at opposite ends, meet after at most n-1 moves — the gap shrinks by 1 each step" },
        { id: "converging-elimination", label: "Moving a pointer eliminates an entire index's unexplored pairs in one step, backed by a proof" },
        { id: "converging-sortedness", label: "Sortedness is the precondition — it's what makes one comparison speak for a whole family of pairs" },
        { id: "converging-heuristic-risk", label: "Passing tests without a stated elimination proof means you have a heuristic, not a solution" },
      ],
    },
    {
      id: "partition-pointers",
      label: "Partition Pointers",
      children: [
        { id: "partition-regions", label: "Same-direction pointers are a claim about regions — write-pointer compaction generalized to any predicate" },
        { id: "partition-instability", label: "Swap-based partitioning is not stable — the displaced element can land anywhere, reordering equal elements" },
        { id: "partition-dutch-flag", label: "Three zones need two boundaries (low, mid, high) — Dijkstra's Dutch national flag" },
        { id: "partition-asymmetry", label: "mid advances after a low-swap (examined) but not after a high-swap (unexamined) — forced by the regions, not a convention" },
      ],
    },
  ],
};
