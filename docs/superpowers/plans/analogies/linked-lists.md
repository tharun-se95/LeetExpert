# Linked Lists — curriculum review + content-quality review

## Curriculum-designer review

Ran against the 3 concept-lesson sources (Nodes & Pointers, Build a Linked
List From Scratch, Pointer Surgery Patterns) plus the 5 problem lessons
already in the manifest. Four questions asked: is the lesson count right,
is the ordering right, is anything genuinely missing, does anything
duplicate or preempt a later module.

**Accepted — count and ordering are correct, no change.** 3 lessons maps
to a clean cognitive progression (mental model -> mechanics -> strategy);
merging would overload Pointer Surgery, splitting would introduce
premature structural variants (doubly linked, circular) that the review
itself flagged as belonging later, as an extension when the Hash Tables
module builds an LRU cache. Verified: `nodes-and-pointers.md` already
carries exactly that one-paragraph forward-reference, not a full lesson.

**Accepted — two genuine scope gaps, both added to Pointer Surgery
Patterns:**
- Null-pointer safety for the fast/slow runner: the pattern was described
  (`slow` steps once, `fast` steps twice) with no discussion of the loop
  guard's safety. Added a derivation of why `while fast and fast.next` is
  required — and, independently verified by hand-tracing list lengths 1
  through 8 in Python, corrected the review's own claim about *which*
  parity crashes (the review didn't specify; my first draft guessed wrong
  — see below).
- The dummy node's second use: Pointer Surgery only demonstrated the
  dummy trick for *deleting* from an existing list. Merge Two Sorted
  Lists (the very next problem lesson) needs the dummy as a *construction*
  anchor for a brand-new list — added that pattern with a short
  derivation.

**Rejected — stripping the `LinkedList` wrapper class from Lesson 2.**
The review argued the class (tail pointer, size counter) is premature
academic overhead since none of the 5 problem lessons use a class
wrapper — they all take a raw node/head reference. Verified against the
Arrays module: `dynamic-arrays.md` builds a full `DynamicArray` class
from scratch for the identical reason (teaching invariant discipline
through a from-scratch build), even though every Arrays problem lesson
just uses the language's native array. This is an established, deliberate
course pattern — concept lessons build the full structure as a teaching
vehicle, problem lessons work with the language's native/simplified form.
The recommendation contradicted precedent already set in a module
reviewed this same session, so it was rejected with that citation.

## Content-quality review

Same 4-question pass used for strings and arrays (gaps in derivation,
concrete-example opportunities, tightening, genuinely-spatial-only
analogy). Findings and dispositions:

- **Nodes & Pointers:** added a step-by-step geometric-series derivation
  for why binary search on a linked list degrades to O(n) (L/2 + L/4 +
  L/8 + ⋯ ≈ L), and a concrete 2-pointer splice trace for the "O(1)
  structural edit" claim. Rejected the review's suggested analogy
  ("array = theater seats, list = scavenger hunt") — the lesson's diagram
  and prose already carry the contiguous-vs-pointer-chasing idea
  concretely; the analogy would have been decorative. Rejected a
  complexity-table "redundancy" flag — restating cost reasoning inside
  the table's `why` field is a deliberate, course-wide convention for
  scanability, not accidental duplication.
- **Build a Linked List From Scratch:** promoted the tail-pointer bug's
  failure mode from quiz-explanation-only into main prose (a student who
  gets the quiz wrong should still have been taught the mechanism, not
  just told it after guessing), and added a worked `delete(3)` trace on
  `[7, 3, 12]`. Rejected the review's suggested chain-link analogy for
  the predecessor-holding requirement ("to splice a link in a physical
  chain, you must hold the link before it, not the link itself") — the
  section already states the mechanical constraint precisely in plain
  language ("a singly linked list can never edit what it's standing on,
  only what's ahead of a node it holds"), and the new `delete(3)` trace
  now makes it concrete; the chain-link framing would have restated the
  same idea without adding clarity.
- **Pointer Surgery Patterns:** added the fixed-gap n-th-from-end
  derivation and the null-safety section described above. Accepted the
  review's suggested cycle-detection analogy (two runners on a circular
  track vs. a straight dead-ending path) and added it — unlike the other
  two proposals, this one earns its place: the lesson's cycle-detection
  claim ("fast can never exhaust it — it laps slow, and they must meet")
  was a bare one-line assertion deferring its proof to a later problem
  lesson, with nothing concrete backing the *why* in the meantime, and
  Floyd's-cycle-style lapping is about as literally, physically spatial
  as a CS concept gets.

**Self-caught error:** my first draft of the null-safety section claimed
the unsafe guard (`while fast:` without `fast.next`) crashes on
*even*-length lists. A Python hand-trace of lengths 1 through 8 showed
the opposite — it crashes on odd-length lists and silently survives
even-length ones. Rewrote the section around the verified behavior, and
reframed it as the more pedagogically valuable point: this bug is
parity-dependent and can ship invisibly if tests happen to use
even-length inputs, the same class of bug as the lesson's own
`delete_all` advance-after-splice trap. See
`docs/superpowers/plans/2026-08-23-course-analogy-tracker.md` for the
summary entry.
