import type { MindMapNode } from "./types";

/**
 * Concept map for the Intervals module. Hand-authored from the module's
 * single concept lesson (course/intervals/sorting-intervals-and-the-sweep.md)
 * plus its 5 problem lessons. Curriculum-designer review confirmed the
 * 1-concept/5-problem structure is right and all 5 problem lessons
 * self-teach their technique. Reordered Meeting Rooms to lead the problem
 * set (simpler variant before the harder Insert Interval / Non-overlapping
 * Intervals / Burst Balloons progression) — on its own merits, not the
 * reviewer's flawed "regression overlap with Module 14" framing, which was
 * rejected (see docs/superpowers/plans/analogies/intervals.md).
 */
export const intervalsConceptMap: MindMapNode = {
  id: "intervals",
  label: "Intervals",
  children: [
    {
      id: "overlap-condition",
      label: "The Overlap Condition, Derived",
      children: [
        { id: "disjoint-two-cases", label: "Disjoint has only two shapes on a line — a entirely left of b, or b entirely left of a — negate with De Morgan's to get overlap" },
        { id: "boundary-is-a-choice", label: "Touching-endpoint inclusion (< vs <=) is a deliberate per-problem decision, not a fact — Merge Intervals wants touching to merge, Meeting Rooms wants touching to be fine" },
      ],
    },
    {
      id: "sort-collapses-all-pairs",
      label: "Why Sorting Collapses All-Pairs to Neighbours",
      children: [
        { id: "monotonic-starts", label: "After sorting by start, starts only increase moving right — once the current interval fails to reach back to the running state, every later interval reaches back even less" },
        { id: "past-is-settled", label: "The past is permanently settled after one failed check — no O(n) backward rescan is ever needed, which is what makes a single linear pass sufficient" },
        { id: "on-log-n-total", label: "Sort O(n log n) once, sweep O(n) once — sorting dominates, beating the naive O(n²) all-pairs scan" },
      ],
    },
    {
      id: "sort-key-choice",
      label: "Sort by Start, or Sort by End?",
      children: [
        { id: "start-for-timeline-order", label: "Sort by start when processing intervals in the order they begin — merging, clash-checking, inserting" },
        { id: "end-for-greedy-commitment", label: "Sort by end when making a greedy commitment that frees up room fastest — 'keep the interval that ends earliest' (Non-overlapping Intervals, Burst Balloons; Module 22 proves why it's safe)" },
        { id: "same-data-different-answers", label: "The same three intervals sorted two different ways produce two different correct algorithms — the key is chosen by what you're trying to prove, never by habit" },
      ],
    },
    {
      id: "the-sweep-skeleton",
      label: "The Sweep: One Pass, Some Running State",
      children: [
        { id: "sort-then-walk", label: "Every interval algorithm in this module is: sort into event order, then walk once carrying running state that update() adjusts per interval" },
        { id: "state-is-the-design-decision", label: "What changes between problems is only what 'state' means and how update() adjusts it — merged range, live-meeting count, or last-kept interval's end" },
        { id: "two-questions-first", label: "Meeting a new interval problem: what is the running state, and which endpoint do I sort on so a left-to-right pass keeps it correct?" },
      ],
    },
  ],
};
