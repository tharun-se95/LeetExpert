# Dynamic Programming — curriculum review + content-quality review

## Curriculum-designer review — no structural changes

Verified against all 5 concept-lesson sources (From Recursion to
Memoization, Tabulation & Space Optimization, 1D DP Patterns, 2D DP
Patterns, Knapsack-Style DP) plus all 10 problem lessons' worked-solution
sections.

- **Count, self-teaching:** confirmed 5 concept lessons + 10 problem
  lessons is right, and all 10 self-teach — each derives its recurrence
  rather than asserting it (most under "The insight," Longest Increasing
  Subsequence and House Robber III under differently-named but equally
  substantive derivation sections, checked directly).
- **Ordering confirmed sound, though not concept-lesson-order:** the
  problem sequence (Climbing Stairs, House Robber, Coin Change, LIS,
  Unique Paths, LCS, Edit Distance, Partition Equal Subset Sum, Word
  Break, House Robber III) is a difficulty progression rather than a
  strict replay of the 5 concept lessons in order — Coin Change
  (unbounded knapsack) appears well before the Knapsack concept lesson's
  other anchor, Partition Equal Subset Sum (0/1 knapsack). Checked every
  problem's own cross-references (each names the concept lesson or
  sibling problem it builds on) and found this intentional: Coin Change
  is a natural third step after two trivial 1D problems, while 0/1
  knapsack's reverse-iteration subtlety is deliberately saved for later
  once tabulation is second nature. No reorder made.
- **No new lesson recommended.** The module's 2 foundational lessons
  (recursion→memoization, tabulation) plus 3 pattern-recognition lessons
  (1D, 2D, knapsack) already cover every shape the 10 problems instantiate,
  including the module's tree-DP capstone (House Robber III), which the
  problem lesson itself correctly frames as a fusion of Module 17's
  tree recursion with this module's rob-or-skip choice, not a gap needing
  its own concept lesson.

## Content-quality review — no analogy added, by design

Like Greedy, this module is proof/derivation-heavy: every concept lesson
proves a claim (why caching only helps with overlap, why optimal
substructure holds via splice-and-contradict, why 0/1 vs. unbounded
knapsack hinges on one row-index difference) rather than describing a
mechanism a physical analogy could stand in for. Per the established
selectivity principle, no analogy was added anywhere in this module —
forcing one onto an index-bookkeeping proof would blur the exact
precision (which row, which index, which operator) that is the actual
content being taught.

- **No content bugs found.** Independently re-verified:
  - House Robber III's own worked example
    (`[3,2,3,null,3,null,1]` → 7): hand-traced the pair-return recursion
    node by node — leaf `3` under node `2` gives `(3,0)`, leaf `1` under
    the root's right child gives `(1,0)`, node `2` gives `(2,3)`, the
    root's right child gives `(3,1)`, and the root gives
    `rob_this = 3+3+1 = 7`, `skip_this = 3+3 = 6` → `max = 7`, matching
    the lesson's stated answer.
  - Edit Distance's base-case rows/columns (`dp[i][0]=i`, `dp[0][j]=j`)
    and its claim that the recurrence is LCS-plus-a-third-case — checked
    directly against the LCS recurrence in the 2D DP Patterns concept
    lesson, confirmed structurally accurate.
  - The knapsack concept lesson's core claim (0/1 reads the previous
    item row, unbounded reads the current row) — traced through both
    recurrences by hand on a small example to confirm the reuse/no-reuse
    distinction holds exactly as stated.
  All correct as shipped, no corrections needed.

Concept map hand-authored; media deferred to Phase 2.
