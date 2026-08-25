# Binary Search — curriculum review + content-quality review

## Curriculum-designer review

Ran against the 3 concept-lesson sources (The Invariant-Driven Template,
Boundary Search, Binary Search on the Answer) plus the 5 problem
lessons. This review was fully well-calibrated — no structural changes
recommended on any of the 4 points:

- **Count:** keep exactly 3 lessons, confirmed correct (three distinct
  mental models — inclusive exact-match, half-open boundary-seeking,
  half-open answer-space — each needs its own lesson; merging any two
  would force incompatible loop conventions into one lesson).
- **Ordering:** current sequence stays — a deliberate scaffolded
  abstraction (concrete sorted-array search → boundary-within-a-
  predicate → answer-space-that-was-never-an-array), reordering would
  break the progression.
- **Scope gaps:** none. The review explicitly mapped all 5 problem
  lessons to the concept lessons' techniques, including confirming that
  Search in Rotated Sorted Array and Find Minimum in Rotated Sorted
  Array — despite introducing non-monotonic array *structure* — don't
  need a dedicated concept lesson, since the general invariant-proof
  skill from Lesson 1 is what actually transfers; the rotation-specific
  reasoning belongs in those problem lessons themselves.
- **Scope overlap:** none with the following Sorting module — binary
  search treats sortedness as a passive input precondition, never
  touches sorting logic itself.

## Content-quality review — one real clarity bug found

- **Lesson 3's problem-bounding example conflated two different
  variables.** The lesson illustrated "establishing lo/hi from
  constraints" with: *"minimum days to ship all packages" ranges from
  "the single heaviest package" ... to "the sum of everything"* — but
  the bounds given (heaviest package weight, sum of all weights) are
  **capacity** bounds, not **day** bounds; the sentence's subject and
  its bounds belonged to two different quantities in the underlying
  problem (Ship Packages Within D Days binary-searches over capacity,
  not days directly). Fixed by correctly framing it as "minimum ship
  capacity that gets every package out within the allotted days," with
  bounds that actually match that variable.

Also added, all independently verified:

- **Lesson 1:** a concrete overflow example with real numbers (1.4B +
  1.5B on a 32-bit int), a hand-traced infinite loop on `arr=[1,3]`
  showing exactly why the buggy `lo = mid` update (instead of
  `lo = mid + 1`) never terminates, and a "physical dictionary" analogy
  for the elimination mechanism — trimmed one of two near-duplicate Two
  Pointers cross-references while keeping the first.
- **Lesson 2:** the explicit 3-step invariant proof (initialization/
  maintenance/termination), tied back to the same framework the Arrays
  module established — the lesson had the *pieces* of this proof
  scattered in prose but never assembled it in the course's own proof
  structure. Added a derivation for why the last-occurrence trick
  (search `arr[i] > target`, subtract 1) actually lands on the right
  index, a concrete out-of-bounds-target trace showing why
  `hi = len(arr)` earns its keep, and a beach-shoreline analogy for the
  boundary concept. Lightly clarified (not deleted) a vague aside about
  a "symmetric" alternative convention.
- **Lesson 3:** an explicit derivation of the `O(f(n) · log R)` total
  cost as a literal multiplication (iterations × cost-per-iteration,
  not just an assertion), and a fully hand-verified trace of the actual
  Koko Eating Bananas numbers (`piles=[3,6,7,11]`, `hours=8`) reaching
  the correct answer of speed 4 in 4 iterations.

Rejected a "redundant recognition-signal restatement" tightening
suggestion and a recursive-space-complexity re-derivation as already
adequately covered by the existing halving-loop explanation.

Concept map hand-authored; media deferred to Phase 2.
