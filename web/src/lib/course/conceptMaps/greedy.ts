import type { MindMapNode } from "./types";

/**
 * Concept map for the Greedy module. Hand-authored from the module's
 * single concept lesson (course/greedy/greedy-choice-and-proving-
 * correctness.md) plus its 5 problem lessons. This module is the
 * course's most proof-heavy — exchange arguments and induction, not
 * spatial structure — so it intentionally received no forced analogy,
 * consistent with reserving sustained physical analogy for spatial/
 * structural content. Curriculum-designer review confirmed the 1-concept/
 * 5-problem structure, current ordering (boolean reachability →
 * level-counted reachability → two-insight circular search → running-
 * boundary partitioning → bidirectional two-pass capstone), and that all
 * 5 problem lessons self-teach and correctly cross-reference each other.
 */
export const greedyConceptMap: MindMapNode = {
  id: "greedy",
  label: "Greedy",
  children: [
    {
      id: "greedy-choice-proving-correctness",
      label: "The Greedy Choice Property & Proving Correctness",
      children: [
        { id: "simple-but-dangerous", label: "Greedy commits to the locally-best choice and never reconsiders — short, fast code, but a wrong rule fails silently with a plausible-looking wrong answer, never a crash" },
        { id: "exchange-argument", label: "Assume an optimal solution disagrees with greedy at some step; swap in the greedy choice; prove the result is still valid and no worse — so an optimum agreeing with greedy always exists" },
        { id: "stays-ahead-argument", label: "Prove by induction that greedy's i-th partial choice is always at least as good as any competitor's i-th choice, so greedy can never fall behind" },
        { id: "coin-change-counterexample", label: "Largest-coin-first is optimal for {1,5,10,25} but gives 3 coins instead of 2 for {1,3,4} targeting 6 — the same simple rule is correct for one input family and provably wrong for another, and only the proof tells you which" },
      ],
    },
    {
      id: "jump-game",
      label: "Jump Game",
      children: [
        { id: "track-reach-not-path", label: "Reachability is a contiguous prefix [0, max_reach] — downward-closed within a jump — so a single running maximum is complete state; which specific jumps produced it is provably irrelevant" },
      ],
    },
    {
      id: "jump-game-ii",
      label: "Jump Game II",
      children: [
        { id: "bfs-levels-without-queue", label: "Each BFS-by-jump-distance level is itself a contiguous interval, so it compresses to two integers (cur_end, farthest) instead of an explicit queue" },
      ],
    },
    {
      id: "gas-station",
      label: "Gas Station",
      children: [
        { id: "total-decides-feasibility", label: "The full-loop net fuel is start-independent — its sign alone decides whether any valid start exists" },
        { id: "skip-the-dead-stretch", label: "If a start fails on arrival at B, every station strictly between the start and B is provably disqualified too (it inherits less buffer, not more) — so the search jumps straight to B" },
      ],
    },
    {
      id: "partition-labels",
      label: "Partition Labels",
      children: [
        { id: "extend-boundary-to-last-occurrence", label: "A running max of every seen letter's last occurrence gives a boundary that can't undershoot — closing exactly when the scan catches up to it is provably safe, the same shape as Jump Game II's farthest" },
      ],
    },
    {
      id: "candy",
      label: "Candy",
      children: [
        { id: "two-one-directional-passes", label: "A bidirectional constraint splits into two independently-correct one-directional greedy passes (left-to-right, right-to-left)" },
        { id: "max-combines-lower-bounds", label: "Each pass produces a lower bound on the required count; taking the elementwise max never weakens either bound, so both constraints hold at once" },
      ],
    },
  ],
};
