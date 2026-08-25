import type { MindMapNode } from "./types";

/**
 * Concept map for the Heaps module. Hand-authored from the module's
 * 2-lesson structure (course/heaps/*.md). Curriculum-designer review
 * confirmed 2 lessons is right and all 6 problem lessons self-teach
 * their pattern (size-k heap, k-way merge, two heaps, heap-driven
 * simulation). It recommended moving K Closest Points to Origin to be
 * 3rd in the problem sequence (right after Top K Frequent Elements,
 * before Merge k Sorted Lists) to group the three size-k-heap problems
 * together before introducing the k-way-merge and two-heaps patterns —
 * applied, since it's a sound difficulty-curve improvement and no
 * lesson's prose depended on the old position (verified). Rejected a
 * "tuple comparison trap" scope-gap claim on Top K Frequent and a
 * "ListNode TypeError" claim on Merge k Sorted Lists — both problem
 * lessons already explicitly explain Python's tuple comparison and the
 * tiebreak-counter trick in their own text, so the concern was already
 * self-taught, not a gap. Rejected a heapq.heapreplace/heappushpop
 * micro-optimization suggestion as a concept-lesson gap — it's a
 * problem-level API detail (Kth Largest already uses heapreplace
 * correctly; only Top K Frequent could adopt it, and it's a style
 * optimization, not a correctness or derivation issue).
 */
export const heapsConceptMap: MindMapNode = {
  id: "heaps",
  label: "Heaps",
  children: [
    {
      id: "heap-property-array-representation",
      label: "The Heap Property & Array Representation",
      children: [
        { id: "weaker-invariant", label: "Every node's value ≤ both children's — only a vertical constraint, nothing about siblings or left/right, unlike a BST's total order" },
        { id: "root-is-extreme", label: "The invariant chains by transitivity: the root is the global minimum (or maximum), readable in O(1), no search" },
        { id: "cant-binary-search", label: "Searching for an arbitrary value is O(n) — no comparison lets you discard a subtree, since siblings aren't ordered relative to each other" },
        { id: "complete-tree-no-pointers", label: "A heap is always a complete binary tree, so parent/child indices are pure arithmetic (2i+1, 2i+2, (i-1)//2) — derived from 'complete = no gaps,' not memorized" },
        { id: "array-beats-pointers-practice", label: "No pointer overhead, cache-local contiguous memory, no per-node allocation — constant factors that make array-backed heaps win in practice despite equal Big-O" },
      ],
    },
    {
      id: "heapify-sift-up-sift-down",
      label: "Heapify: Sift-Up & Sift-Down",
      children: [
        { id: "sift-up-insert", label: "Insert appends a leaf, then sifts it up past parents until it finds one no larger than itself — fixes the one violated spot without breaking anything below" },
        { id: "sift-down-extract", label: "Extract-min swaps root with the last element, then sifts that element down, always toward the smaller child (the larger child would re-violate the invariant)" },
        { id: "both-o-log-n", label: "Both walk at most one node per level along a root-to-leaf path — bounded by the tree's height, O(log n)" },
        { id: "heapify-is-on", label: "Building a heap via n sift-downs from the bottom up is O(n), not O(n log n) — the many cheap near-leaf nodes dominate the count while the few expensive near-root nodes are rare, and Σh/2^h converges to 2" },
      ],
    },
  ],
};
