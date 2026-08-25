import type { MindMapNode } from "./types";

/**
 * Concept map for the Binary Search module. Hand-authored from the
 * module's 3-lesson structure (course/binary-search/*.md). Curriculum-
 * designer review was fully well-calibrated — confirmed 3 lessons, the
 * current ordering, no scope gaps (explicitly mapping all 5 problem
 * lessons, including the two rotated-sorted-array problems, to the
 * invariant skill from Lesson 1 without needing a dedicated lesson), and
 * no overlap with the following Sorting module. No structural changes.
 */
export const binarySearchConceptMap: MindMapNode = {
  id: "binary-search",
  label: "Binary Search",
  children: [
    {
      id: "invariant-template",
      label: "The Invariant-Driven Template",
      children: [
        { id: "invariant-claim", label: "The answer, if it exists, lies in [lo, hi] — everything outside is proven not the answer" },
        { id: "invariant-five-bugs", label: "Five decisions cause every bug: loop condition, overflow-safe mid, mid±1 never mid, what lo>hi means, which half to eliminate" },
        { id: "invariant-monotonic", label: "The real requirement is a monotonic predicate, not a sorted array — sortedness is just one way to get one" },
      ],
    },
    {
      id: "boundary-search",
      label: "Boundary Search",
      children: [
        { id: "boundary-reframe", label: "Binary-search for WHERE a monotonic predicate flips, not whether a value exists" },
        { id: "boundary-half-open", label: "Half-open [lo, hi) with hi=len(arr): represents 'boundary could be past the end' without a special case" },
        { id: "boundary-live-candidate", label: "hi = mid (not mid-1) because mid might BE the boundary — still a live candidate, not eliminated" },
        { id: "boundary-last-occurrence", label: "Last occurrence: search for the first index where arr[i] > target, then step back one" },
      ],
    },
    {
      id: "answer-search",
      label: "Binary Search on the Answer",
      children: [
        { id: "answer-three-signals", label: "Min/max value satisfying a condition + a feasibility check + monotonic feasibility = binary search on the answer" },
        { id: "answer-same-template", label: "Structurally identical to boundary search — feasible(mid) replaces arr[mid] >= target" },
        { id: "answer-bounding", label: "The new step: establish lo/hi from the problem's own constraints before searching" },
        { id: "answer-cost", label: "O(f(n) · log R) — feasibility cost times iteration count, turning a billion-candidate scan into ~30 checks" },
      ],
    },
  ],
};
