# BST & Ordered Structures — curriculum review + content-quality review

## Curriculum-designer review — two real issues found

Ran against the 2 concept-lesson sources (The BST Invariant & Core
Operations, Balance & Why It Matters) plus the 6 problem lessons' worked-
solution sections, explicitly instructed to verify problem lessons
self-teach before recommending any new concept lesson.

- **Count and self-teaching:** confirmed 2 lessons is right — every
  problem lesson's own "insight" section maps cleanly onto one of the
  two concept lessons without needing new material.
- **Real ordering bug: LCA sequenced too late.** Lowest Common Ancestor
  of a BST is a pure read-only search-descent problem — simpler,
  structurally, than Insert (which mutates the tree) and far simpler
  than Delete (three cases) or Convert Sorted Array (recursive
  construction). It was sequenced last in the problem list, after all
  three of those harder problems, needlessly disrupting the difficulty
  curve. Moved to right after Kth Smallest Element and before Insert, in
  `web/src/lib/course/manifest.ts`. Verified no other lesson's prose
  references LCA's old position (checked all "Variants"/cross-reference
  sections in the module for stale ordering claims) and that Insert's
  "(previous lesson)" / Delete's "(previous lesson)" references to each
  other still hold, since their mutual adjacency was untouched.
- **Real bug: a lesson miscounted its own forward references.**
  Balance & Why It Matters said *"Two problems ahead lean directly on
  this lesson: Convert Sorted Array to BST ... and the whole reason the
  balanced height matters is that it's what keeps the O(h) operations
  from the last lesson honest"* — but only one problem was actually
  named; the second clause is a general statement about the lesson's
  importance, not a second problem. Fixed by rewording to correctly
  describe one problem plus the lesson's broader role.
- **Rejected:** recommending a new rotation-implementation problem
  lesson ("Rotate Subtree"). Out of scope for a content-quality pass —
  and the module's own text already explicitly frames AVL/red-black
  rotation as conceptual knowledge ("You will almost never implement
  one of these by hand, but you must know the two shapes"), not an
  interview-coding skill the module intends to test.
- **Rejected:** the prose-restates-complexity-table tightening claim on
  Lesson 1's search/delete descriptions — the course's established
  deliberate-reinforcement convention (first stated in flowing prose
  where the reasoning matters, then compressed into the reference table
  for lookup), not duplication.

## Content-quality review — all suggestions independently verified

- **Lesson 1:** added a concrete two-children deletion trace (root `5`,
  left subtree `3`/`1`/`4`, right subtree `8`/`7`/`9` → deleting `5`
  promotes successor `7`, final inorder `1,3,4,7,8,9`), verified against
  the actual `delete()` code in Python; added a one-clause note that
  O(h)+O(h) is O(h), not O(2h), addressing a common constant-factor
  confusion; added a sustained forest-trail/signpost analogy for the
  invariant-as-decision-procedure section.
- **Lesson 2:** added a full derivation of the `h ≥ log₂(n+1) − 1`
  height floor (geometric series telescoping, verified in Python against
  several heights) instead of asserting it; added a one-clause note on
  where the AVL `~1.44 log₂n` constant comes from (Fibonacci-growth
  worst-case trees) without a full derivation, since that section is
  explicitly framed as conceptual, not implementation-level; added
  concrete numbers to the right-rotation diagram (P=5, Q=3, A=1, B=4,
  C=8) with a verified before/after inorder check; added a sustained
  hanging-mobile analogy for rotation, tied back to "trading height from
  the heavy side to the light side" already in the text; lightly
  tightened the opening's near-duplicate "insert 1,2,3,4,5" example to
  reference Lesson 1's version instead of re-deriving it from scratch.

Concept map hand-authored; media deferred to Phase 2.
