# Greedy — curriculum review + content-quality review

## Curriculum-designer review — no structural changes

Verified against the single concept-lesson source (The Greedy Choice
Property & Proving Correctness) plus all 5 problem lessons' worked-
solution sections.

- **Count, self-teaching:** confirmed 1 concept lesson + 5 problem
  lessons is right, and all 5 self-teach (each has its own "The insight"
  section deriving correctness, not just asserting it).
- **Ordering confirmed sound:** Jump Game (boolean reachability via a
  single running maximum) → Jump Game II (the same reachability made
  level-counted, "BFS without a queue") → Gas Station (a two-insight
  circular-search problem, its own variants section explicitly linking
  back to Best Time to Buy & Sell Stock's running-sum-reset shape) →
  Partition Labels (a running-boundary pattern whose own text calls out
  its structural identity with Jump Game II's `farthest`) → Candy (the
  capstone, explicitly composing two independent one-directional greedy
  passes — its own variants section names both Jump Game and the concept
  lesson directly). Each problem's cross-references were checked against
  the actual target lessons and all point to real, correctly-described
  content. No reorder needed.
- **No new lesson recommended.** The concept lesson already teaches both
  standard proof techniques (exchange argument, greedy-stays-ahead) with
  a full worked example (Activity Selection) and a worked counterexample
  (coin change with {1,3,4}) — the module doesn't need a second proof-
  technique lesson, and the problem set already exercises both techniques
  implicitly across its five entries.

## Content-quality review — no analogy added, by design

This module is the course's most proof-heavy: the concept lesson's core
content is two formal argument techniques (exchange argument, induction-
based "stays ahead"), and every problem lesson's "insight" section is
itself a correctness proof, not a physical mechanism. Per the course's
own selectivity principle — full sustained analogy for spatial/
structural content, minimized for formal/proof-heavy content — no
analogy was added anywhere in this module. Forcing a physical metaphor
onto an exchange argument or an inductive "stays ahead" proof would
translate rigor into vagueness exactly where the rigor is the entire
point being taught (the lesson says this explicitly: "the difference
between correct and wrong lives entirely in the proof").

- **No content bugs found.** Independently re-verified every numeric
  claim already in the lessons:
  - Gas Station's example (`gas=[1,2,3,4,5], cost=[3,4,5,1,2]`):
    traced the algorithm by hand — total=0 (feasible), and the running
    `tank` resets place the final candidate at index 3, matching the
    lesson's expected output.
  - Candy's hardest example (`ratings=[1,2,87,87,87,2,1]` → 13): computed
    both the left-to-right and right-to-left passes by hand
    (`left=[1,2,3,1,1,1,1]`, `right=[1,1,1,1,3,2,1]`), took the
    elementwise max, and summed to confirm 13.
  - The coin-change counterexample ({1,3,4}, target 6: greedy gives
    4+1+1=3 coins, optimal is 3+3=2 coins) — confirmed both sums and
    coin counts.
  All correct as shipped, no corrections needed.

Concept map hand-authored; media deferred to Phase 2.
