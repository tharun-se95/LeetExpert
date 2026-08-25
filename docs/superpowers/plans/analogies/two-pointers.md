# Two Pointers — curriculum review + content-quality review

## Curriculum-designer review

Ran against the 2 concept-lesson sources (Converging Pointers, Partition
Pointers) plus the 5 problem lessons.

**Rejected — all 4 recommendations**, each after verification:

- **Split Partition Pointers into two lessons** (write-pointer
  compaction, then Dutch national flag separately) on the grounds it's
  "overloaded." Rejected: re-reading the lesson, it's one coherent
  narrative — two-zone partitioning generalizing to three zones — not
  three unrelated topics. This is a direct 1:1 generalization
  relationship, unlike say Deques & the Monotonic Deque (two genuinely
  different structures in one lesson, where a split concern would be
  more founded).
- **Reverse the lesson order** (Partition before Converging) because
  same-direction pointers are "already familiar" from Arrays. Rejected:
  the current order deliberately opens Stage 2 with its unifying theme
  (batch elimination with a proof) using the cleanest example first;
  reversing would bury the stage's headline idea under a recap lesson.
  Also rejected the accompanying problem-reorder suggestion — interleaved
  practice across the two patterns is a legitimate design choice, not an
  oversight, especially since both concept lessons are taught before any
  problem lesson anyway.
- **Add a "Bottleneck-Based Dominance" section to Converging Pointers**
  for unsorted applications (Container With Most Water, Trapping Rain
  Water). Rejected after reading `container-with-most-water.md` in full:
  it already has a complete "The insight" section deriving the
  monotone-shrinking-width argument, explicitly noting "sortedness isn't
  the precondition this time." The concept lesson's forward-reference
  ("Container... elimination argument is famous for being almost obvious
  and regularly believed without proof") is a deliberate two-way
  callback — the problem lesson opens with "the converging lesson warned
  you about it," directly reciprocating. Removing either side breaks a
  working cross-lesson connection.
- **Remove the 2-way swap partition function entirely**, relocating it
  to the Sorting module as a Quicksort introduction, since none of this
  module's 5 problems use 2-way partition directly (only Sort Colors,
  which is 3-way). The "zero local utility" claim is factually true, but
  the recommendation misses that the function is structural scaffolding
  *within this lesson* — "two zones need one boundary; three zones need
  two" only makes sense as a generalization if two zones was taught
  first, in the same lesson. Removing it wouldn't just cut a preview, it
  would break the Dutch-flag section's own setup.

## Content-quality review

Same 4-question pass, analogies suggested freely per the corrected
prompt style.

- **Converging Pointers:** added a one-line closed-form derivation for
  the `n-1` move bound (the gap `right - left` starts at `n-1` and
  shrinks by 1 per step), and completed the worked example's trace
  (previously only step 1 was shown; added steps 2-3 to reach the actual
  match, hand-verified in Python). Rejected removing the Container
  forward-reference (see above) and rejected a suggested analogy — the
  lesson's elimination argument is already rigorously concrete via the
  numeric example and an interactive viz; a narrative would be
  decorative on top of an already-strong treatment.
- **Partition Pointers:** added a hand-verified instability trace
  (`[4a, 4b, 2]` with `pred = x < 3`, showing the swap reverses the two
  4s' relative order — the exact mechanism the "not stable" claim
  asserts) and a hand-verified Dutch-flag asymmetry trace on `[2, 0, 1]`
  — notably the *same* adversarial example the lesson's own quiz
  explanation already references ("adversarial inputs like [2,0,1]")
  but had never actually traced in the prose; now the quiz and the
  worked example reinforce each other instead of one asserting what the
  other never showed. Added a laundry-sorting analogy for the three-zone
  setup (darks/lights/grays piling up while "unsorted" and "gray" are
  the same region until the sweep finishes) — genuinely spatial and this
  lesson had zero analogies before. Rejected removing the "(made famous
  by Dijkstra)" aside as not worth even a trivial edit, and rejected
  restructuring the asymmetry explanation since the new worked trace
  supersedes the need.

Concept map hand-authored; media deferred to Phase 2.

## Addendum (2026-08-26): final course-wide analogy sweep — reverses the earlier rejection

A later full-course review flagged Converging Pointers as one of a
handful of genuinely spatial/structural lessons with zero real-world
analogy language, directly revisiting the "rejected a suggested
analogy... would be decorative" call above. On reflection: the numeric
trace and interactive viz make the elimination argument *provably*
correct, but proof and intuition are different things, and this lesson
opens Stage 2 for every student in the course — a concrete picture
before the formal argument is worth having here specifically, unlike
Partition Pointers where a spatial analogy (laundry sorting) was already
judged to earn its place in the same review.

Added a sorted-shelf-of-price-tags analogy (two shoppers with a fixed
budget, scanning from opposite ends) at two points: introducing the
elimination argument, and callback into both the "right is dead" and
"left is dead" elimination steps. Partition Pointers was not touched —
its laundry-sorting analogy from the original pass already covers it.
