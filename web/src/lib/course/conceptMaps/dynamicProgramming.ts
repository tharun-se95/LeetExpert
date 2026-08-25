import type { MindMapNode } from "./types";

/**
 * Concept map for the Dynamic Programming module. Hand-authored from the
 * module's 5-lesson structure (course/dynamic-programming/*.md). Like
 * Greedy, this module is formal/derivation-heavy (recurrence proofs, index
 * bookkeeping) rather than spatial/structural, so it received no forced
 * analogy, consistent with the course's selectivity principle. Verified
 * the 5-concept/10-problem structure and current problem ordering (1D
 * warm-ups, an early unbounded-knapsack problem, LIS's two-solution escalation,
 * a cluster of 2D-DP problems, then knapsack/string/tree closers) against
 * every problem lesson's own cross-references — all point to real,
 * correctly-described content, so no reorder was made. Hand-traced House
 * Robber III's own worked example ([3,2,3,null,3,null,1] -> 7) to confirm
 * the pair-return recurrence, and independently checked Edit Distance's
 * base-case rows/columns — both correct.
 */
export const dynamicProgrammingConceptMap: MindMapNode = {
  id: "dynamic-programming",
  label: "Dynamic Programming",
  children: [
    {
      id: "recursion-to-memoization",
      label: "From Recursion to Memoization",
      children: [
        { id: "overlapping-subproblems", label: "Caching only helps when the same subproblem recurs — merge sort's disjoint splits have nothing to cache; Fibonacci's exponential tree is almost all repeats" },
        { id: "optimal-substructure", label: "The optimal whole is built from optimal subanswers — provable by a splice-and-contradict argument (a shorter sub-path would splice into a shorter whole path)" },
        { id: "complexity-as-a-product", label: "DP time is always (distinct subproblems) x (work per subproblem, excluding recursive calls) — every subsequent problem's complexity is this product, counted explicitly" },
      ],
    },
    {
      id: "tabulation-space-optimization",
      label: "Tabulation & Space Optimization",
      children: [
        { id: "dependency-order", label: "Tabulation fills the same table bottom-up in dependency order instead of top-down via recursion — same values, no call stack, no recursion-limit ceiling" },
        { id: "rolling-variables", label: "If dp[i] reads only a fixed window of prior cells, that window collapses to a fixed number of rolling variables — O(1) space instead of O(n)" },
        { id: "collapse-loses-reconstruction", label: "Collapsing to rolling variables discards the per-subproblem history — fine for the final value alone, but the full table must be kept to reconstruct the actual solution object" },
      ],
    },
    {
      id: "1d-dp-patterns",
      label: "1D DP Patterns",
      children: [
        { id: "fixed-window-state", label: "The tell: the best answer at position i reduces to a small, fixed number of earlier dp values, not the whole history" },
        { id: "operator-follows-the-question", label: "The recurrence's shape comes from how state i is reachable; the combining operator comes from what's asked — sum for counting ways, max/min for optimizing a value" },
      ],
    },
    {
      id: "2d-dp-patterns",
      label: "2D DP Patterns",
      children: [
        { id: "grid-dp-vs-two-sequence-dp", label: "Two structurally different things share the dp[i][j] shape: one object's real position on a grid (Unique Paths), versus two independent counters into two separate sequences (LCS) — the same-looking terms mean different things" },
        { id: "shared-fill-order", label: "Both shapes still fill row by row, left to right — dp[i][j] depends only on smaller i and/or j in either case" },
      ],
    },
    {
      id: "knapsack-style-dp",
      label: "Knapsack-Style DP",
      children: [
        { id: "01-vs-unbounded", label: "0/1 knapsack's 'take it' branch reads the PREVIOUS item row (dp[i-1][...]); unbounded's reads the CURRENT row (dp[i][...]) — that single index changes whether an item can be reused" },
        { id: "reverse-iteration-for-01", label: "Space-optimizing 0/1 knapsack to 1D requires iterating capacity in reverse — forward iteration would let an item's contribution be read and reused within the same pass, silently turning it unbounded" },
      ],
    },
  ],
};
