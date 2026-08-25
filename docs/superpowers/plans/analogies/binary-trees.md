# Binary Trees — curriculum review + content-quality review

## Curriculum-designer review

Ran against the 4 concept-lesson sources (Tree Terminology & Representation,
DFS Traversals, BFS & Level-Order Traversal, Top-Down vs. Bottom-Up Tree
Recursion) plus the 7 problem lessons' worked-solution sections, explicitly
instructed to verify problem lessons self-teach before recommending any new
concept lesson, and to check whether the two problem lessons with no
"insight" section (Level Order Traversal, Right Side View) are adequately
covered by the BFS concept lesson alone.

- **Count, ordering, scope gaps:** confirmed 4 lessons is right, the
  current order is correct (DFS must precede the recursion-shapes lesson,
  which leans on DFS vocabulary like "preorder-ish"), and the two
  insight-less problem lessons are fully covered by the BFS lesson's
  size-snapshot technique — Level Order Traversal groups nodes by that
  snapshot directly, Right Side View just keeps the last node of each
  snapshotted batch.
- **Real bug caught: a lesson-order text mismatch.** The Terminology
  lesson said *"which is exactly why the next lesson has two different
  recursion shapes"* — but the two-recursion-shapes lesson (Top-Down vs.
  Bottom-Up) is actually Lesson 4, not Lesson 2 (DFS Traversals). Fixed
  by naming the lesson explicitly instead of saying "the next lesson."
- **Rejected:** recommending a new "Invert a Binary Tree" problem lesson.
  A genuinely reasonable pedagogical suggestion, but out of scope for a
  content-quality/analogy pass — a new problem lesson needs its own full
  attempt-it-first / insight / solution content plus a verified sandbox
  with hand-executed reference-solution test cases, not a prose edit to
  an existing file.
- **Rejected:** two "redundant across lessons" tightening claims on the
  O(h)/O(n) complexity restatements (Terminology → DFS → BFS). Each
  appearance builds on the last in a new context — a general property at
  first mention, then traversal-specific reasoning (recursive AND
  iterative), then a BFS-vs-DFS comparison — matching the course's
  established deliberate-reinforcement convention, not duplication.
- **Rejected:** iterative preorder/postorder as a missing-coverage gap.
  The lesson teaches the explicit-stack mechanism once, on inorder, which
  is the one of the three that actually needs the "not-yet-visited"
  bookkeeping the stack provides; extending the same mechanism to the
  other two orders is a mechanical exercise the lesson's existing
  explanation already equips a learner to do, not a genuine gap.

## Content-quality review — all suggestions independently verified

- **Lesson 1 (Terminology):** added a from-scratch derivation of the
  balanced-tree height claim (n = 2⁰+2¹+⋯+2ʰ = 2ʰ⁺¹−1, solving for
  h ≈ log₂n) instead of asserting it, verified in Python against several
  heights; added a bush-vs-vine analogy for balanced vs. degenerate tree
  shape.
- **Lesson 2 (DFS Traversals):** added a fully hand-verified iterative-
  inorder stack trace on a 3-node tree (root 2, children 1 and 3),
  confirmed against the actual algorithm in Python, showing the exact
  push/pop sequence and resulting output `[1, 2, 3]`.
- **Lesson 3 (BFS & Level-Order):** added a hand-verified size-snapshot
  trace on the lesson's own 6-node example tree (confirmed against the
  actual `level_order` code in Python), a derivation of the "last level
  holds ~n/2 of the nodes" claim (reusing the same doubling-sum result
  from Lesson 1), and a theme-park-queue-batch analogy for the size-
  snapshot mechanism.
- **Lesson 4 (Top-Down vs. Bottom-Up):** added a family-tree/rumor
  analogy for the two information-flow directions, placed before the
  formal definitions. Rejected the suggestion to add a third worked
  side-by-side trace — the lesson already has one (Node 4 returns 1→Node
  2 returns 2→Node 1 returns 3, vs. the top-down depth walk reaching the
  same answer), so the request was a duplicate of existing content, not
  a genuine gap.

Concept map hand-authored; media deferred to Phase 2.
