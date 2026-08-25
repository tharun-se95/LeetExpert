import type { MindMapNode } from "./types";

/**
 * Concept map for the Sorting module. Hand-authored from the module's
 * 4-lesson structure (course/sorting/*.md). Curriculum-designer review
 * caught one broken cross-reference (Lesson 4 named "the previous lesson"
 * for the n log n proof, but under the current order that's Quicksort, not
 * Merge Sort) — fixed as a minimal wording correction rather than a
 * restructure. No other structural changes; lesson count, ordering, and
 * scope boundaries with Binary Search (before) and Intervals (after) all
 * confirmed correct.
 */
export const sortingConceptMap: MindMapNode = {
  id: "sorting",
  label: "Sorting",
  children: [
    {
      id: "baseline-sorts",
      label: "The O(n²) Baseline Sorts",
      children: [
        { id: "selection-invariant", label: "Selection sort: first i positions hold the i smallest, sorted — always scans the full remainder, exactly n swaps total" },
        { id: "insertion-invariant", label: "Insertion sort: arr[0..i) is sorted — each pass shifts the next element back through the sorted prefix" },
        { id: "insertion-inversions", label: "Cost is O(n + I) where I is the inversion count — proportional to how far each element is from its final spot, not to n outright" },
        { id: "baseline-tradeoffs", label: "Insertion sort is online and wins on nearly-sorted or small inputs — real hybrid sorts fall back to it for small subarrays" },
      ],
    },
    {
      id: "merge-sort",
      label: "Merge Sort & the n log n Lower Bound",
      children: [
        { id: "merge-recurrence", label: "T(n) = 2T(n/2) + O(n) — the exact recurrence the Big O module already analyzed, giving O(n log n)" },
        { id: "merge-stability", label: "The <= tie-break takes LEFT first — equal elements never swap relative order, so merge sort is stable" },
        { id: "merge-lower-bound", label: "Decision-tree proof: n! possible orderings need n! leaves, forcing height Ω(n log n) — a hard floor for ANY comparison sort" },
      ],
    },
    {
      id: "quicksort",
      label: "Quicksort & Partitioning",
      children: [
        { id: "quicksort-partition-reuse", label: "Reuses Module 10's write-pointer partition template — after it runs, the pivot sits at its correct final sorted position" },
        { id: "quicksort-in-place", label: "Sorts entirely in place — O(log n) average auxiliary space (the recursion stack), not O(n) like merge sort" },
        { id: "quicksort-worst-case", label: "Worst case Θ(n²): a deterministic pivot on adversarial input (e.g. last-element pivot on sorted data) splits n and 0 every time" },
        { id: "quicksort-randomization", label: "Randomizing the pivot converts 'fails on adversarial input' into 'expected O(n log n) on every input' — the algorithm defends itself" },
        { id: "quicksort-unstable", label: "Partition's swaps can move an element past an equal one — quicksort trades stability for in-place, O(1)-auxiliary rearrangement" },
      ],
    },
    {
      id: "linear-time-sorts",
      label: "Linear-Time Sorts",
      children: [
        { id: "linear-breaks-the-bound", label: "The n log n floor only binds comparison sorts — dropping comparisons entirely means the proof simply doesn't apply" },
        { id: "counting-sort", label: "Counting sort: tally each small-integer value as an array index, then read tallies out in order — O(n + k), no comparisons" },
        { id: "radix-sort", label: "Radix sort: counting-sort one digit at a time, least-significant first — each pass must be stable or later passes scramble earlier order" },
        { id: "reading-the-signal", label: "Reading table: bounded small-integer keys → counting/radix; general objects or a worst-case guarantee → merge sort; in-place and fast in practice → quicksort" },
      ],
    },
  ],
};
