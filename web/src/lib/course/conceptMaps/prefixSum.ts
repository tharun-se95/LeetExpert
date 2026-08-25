import type { MindMapNode } from "./types";

/**
 * Concept map for the Prefix Sum module. Hand-authored from the module's
 * 3-lesson structure (course/prefix-sum/*.md). This module is formal/
 * arithmetic rather than spatial/structural, so the lessons lean on
 * derivation and verified traces rather than sustained analogy — one light,
 * genuinely-fitting analogy was added to Prefix Sums (odometer) and 2D
 * Prefix Sums (rug/rectangle patches, since inclusion-exclusion on a grid
 * is itself spatial). Order (basics → hash-map → 2D, then problems applying
 * each) and all 5 problem lessons self-teaching were confirmed against the
 * actual lesson files.
 */
export const prefixSumConceptMap: MindMapNode = {
  id: "prefix-sum",
  label: "Prefix Sum",
  children: [
    {
      id: "prefix-sum-basics",
      label: "Prefix Sums",
      children: [
        { id: "off-by-one-convention", label: "prefix[i] = sum of the first i elements, prefix[0] = 0 — the empty sum, chosen so l=0 needs no special case" },
        { id: "range-query-formula", label: "sum(nums[l..r]) = prefix[r+1] - prefix[l] — one subtraction answers any range in O(1) after an O(n) build" },
        { id: "invertible-aggregates-only", label: "Any associative, invertible aggregate prefixes (sum, product, XOR) — max/min can't be subtracted out, which is why Sliding Window Maximum needed a monotonic deque instead" },
      ],
    },
    {
      id: "prefix-sum-hash-map",
      label: "Prefix Sum + Hash Map",
      children: [
        { id: "sum-to-k-as-lookup", label: "sum(nums[l..r]) = k rearranges to prefix[l] = prefix[r+1] - k — at each position, ask a hash map how many earlier prefixes equal that value" },
        { id: "seed-with-zero", label: "seen = {0: 1} represents the empty prefix — without it, a K-summing subarray starting at index 0 goes uncounted" },
        { id: "check-before-insert", label: "Query the map before recording the current running sum, same discipline as Two Sum — prevents a length-0 subarray from matching itself" },
        { id: "beats-sliding-window-negatives", label: "Works with negative numbers because it never shrinks a window — sliding window's shrink logic needed the monotonicity negatives break" },
      ],
    },
    {
      id: "prefix-sum-2d",
      label: "2D Prefix Sums",
      children: [
        { id: "three-neighbor-recurrence", label: "prefix[i][j] = grid cell + rectangle above + rectangle to the left − the corner counted twice by both" },
        { id: "four-term-query", label: "Rectangle sum = big corner rectangle − top strip − left strip + shared corner restored once — inclusion-exclusion run twice, build and query" },
        { id: "dimension-doubles-terms", label: "1D needs 2 terms, 2D needs 4 (2² overlapping regions) — each added dimension doubles how much double-counting must be corrected" },
      ],
    },
  ],
};
