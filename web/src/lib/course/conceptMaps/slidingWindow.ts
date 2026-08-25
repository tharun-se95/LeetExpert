import type { MindMapNode } from "./types";

/**
 * Concept map for the Sliding Window module. Hand-authored from the
 * module's 2-lesson structure (course/sliding-window/*.md). Curriculum-
 * designer review confirmed 2 lessons and the current ordering are
 * correct, and (having been explicitly told to check first) did not
 * over-recommend new lessons — its two suggestions were small additions
 * (a concrete "what is state" note, a closing Sliding-Window-vs-Prefix-
 * Sum comparison), not new lessons, both accepted in light-touch form.
 */
export const slidingWindowConceptMap: MindMapNode = {
  id: "sliding-window",
  label: "Sliding Window",
  children: [
    {
      id: "fixed-size-windows",
      label: "Fixed-Size Windows",
      children: [
        { id: "fixed-brute-force", label: "Brute force resums every window from scratch — O(n·k), throwing away k-1 shared elements" },
        { id: "fixed-slide", label: "Slide instead of recompute: new_sum = old_sum - leaving + entering, O(1) per slide" },
        { id: "fixed-maintainable", label: "Only works when the aggregate is incrementally maintainable — sum/count/XOR qualify, max/min do not" },
        { id: "fixed-generalize", label: "Generalizes to any 'remove one, add one' update: predicate counts, frequency maps, product (with a zero trap)" },
      ],
    },
    {
      id: "dynamic-windows",
      label: "Dynamic Windows & the Shrink Invariant",
      children: [
        { id: "dynamic-grow-shrink", label: "right expands until invalid or past the goal; left shrinks to restore or tighten — both only move forward, O(n) total" },
        { id: "dynamic-monotonicity", label: "Validity is monotonic in window size — but the direction flips between lower-bound (sum≥target) and upper-bound (at most k distinct) conditions" },
        { id: "dynamic-two-templates", label: "Mirror-image templates: shrink WHILE valid (record inside) vs shrink UNTIL valid (record after) — swapping them is the classic bug" },
        { id: "dynamic-accounting", label: "Same push-once/pop-once accounting as the monotonic stack — bound total pointer movement, not one outer step" },
      ],
    },
  ],
};
