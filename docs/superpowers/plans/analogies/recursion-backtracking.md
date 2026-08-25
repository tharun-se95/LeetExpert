# Recursion & Backtracking — curriculum review + content-quality review

## Curriculum-designer review

Ran against the 3 concept-lesson sources (The Call Stack & Base Cases,
Backtracking: Choose/Explore/Unchoose, Recursion vs. Iteration) plus the
6 problem lessons' "The insight" sections (Subsets, Permutations,
Combination Sum, Generate Parentheses, Palindrome Partitioning,
N-Queens), explicitly instructed to verify the problem lessons self-teach
before recommending any new concept lesson.

- **Count and scope gaps:** confirmed 3 lessons is right and no new
  concept lesson is needed — all 6 problem lessons already self-teach
  their own device (start index, used-array, non-advancing start index,
  construction-time pruning, palindrome recursion, three-set legality
  checks) in their own "The insight" sections.
- **Real bug caught: Lesson 1's opening claim.** *"Everything so far has
  been flat"* is false — the immediately preceding Sorting module's merge
  sort and quicksort are both explicitly recursive, with real recursive
  code and recursion-stack space analysis. Fixed by rewording to
  acknowledge that module's recursion while correctly framing this lesson
  as the first place the underlying call-stack machinery itself gets
  explained (not the first recursive code the learner has seen).
- **Real gap caught: "unchoose" was under-generalized.** Lesson 2 only
  ever demonstrates the undo step via `path.pop()`, but Permutations
  unchoose a `used` boolean array and N-Queens unchoose three sets —
  learners could wrongly associate "unchoose" with list-popping
  specifically. Fixed by adding a paragraph generalizing the mechanism
  (mutate on choose, restore on unchoose, applied to whatever tracker is
  shared) and naming both problems' trackers explicitly.
- **Rejected:** merging Lesson 3 into Lesson 1 and dropping it entirely.
  The proposal characterized the TCO section as "confusing syntax tricks
  that solve nothing" — but the section exists specifically to correct a
  plausible, commonly-held misconception (that rewriting to tail-call
  form helps in Python/JS); that's corrective content, not filler. The
  proposal also called the tree-height material "a large portion" of the
  lesson needing removal as premature — on inspection it's one paragraph
  and one clause, a normal single-sentence forward-reference to Module 17
  (the same pattern used throughout the course, already established as
  acceptable), not multiple sections of premature material.
- **Rejected:** "triplicate" claims about Lesson 2's shared-mutable-state
  explanations. The three flagged passages serve three different
  purposes — why record a copy at the leaf, why the undo step specifically
  prevents cross-branch pollution (via a worked bug), and the cost
  tradeoff of an alternative copy-based design — not pure restatement of
  the same point.

## Content-quality review — all suggestions independently verified

- **Lesson 1:** added a concrete `factorial(1)` stack-frame trace (exact
  argument, return address, return value) instead of leaving frame
  contents purely abstract; added a precision aside on naive Fibonacci's
  growth rate (Θ(φⁿ), φ≈1.618 — tighter than the stated O(2ⁿ) bound, both
  verified in Python) and a fully hand-verified call-count trace on
  `fib(5)` (`fib(3)` runs twice, `fib(2)` three times, `fib(1)` five
  times, `fib(0)` three times, 15 calls total — confirmed by
  instrumenting the actual recursive function); added a cafeteria-tray
  analogy for stack-frame suspension.
- **Lesson 2:** added a hand-derived domination check for the subsets/
  permutations complexity claims — showing internal-node cost (O(2ⁿ) /
  O(n!) at O(1) each) is dominated by leaf cost (O(n·2ⁿ) / O(n·n!)),
  making the "two-factor" answer a derivation rather than an asserted
  multiplication; added the unchoose-generalizes paragraph (see above);
  added a dressing-room/shared-rack analogy sustained across the state-
  space-tree framing and the choose/explore/unchoose template itself.
- **Lesson 3:** added a desk-drawer/floor-space analogy for why an
  explicit stack survives depths the call stack can't (capped drawer vs.
  uncapped floor). Rejected the "repetitive stack-space explanations"
  tightening claim — the three flagged passages are the general O(depth)
  rule, a tree-specific O(h) specialization, and the complexity-table
  restatement (the course's established, deliberate reinforcement
  convention), not three restatements of one idea.

Concept map hand-authored; media deferred to Phase 2.
