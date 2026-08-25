# Heaps — curriculum review + content-quality review

## Curriculum-designer review

Ran against the 2 concept-lesson sources (The Heap Property & Array
Representation, Heapify: Sift-Up & Sift-Down) plus the 6 problem lessons'
worked-solution sections, explicitly instructed to verify problem lessons
self-teach before recommending any new concept lesson.

- **Count and self-teaching:** confirmed 2 lessons is right — the size-k
  heap pattern, k-way-merge tracking, two-heaps balancing, and heap-driven
  simulation are each fully self-taught in their own problem lesson.
- **Ordering improvement applied:** K Closest Points to Origin used the
  same size-k-heap trick as Kth Largest Element and Top K Frequent
  Elements (max-heap instead of min-heap) but was sequenced 5th, after
  the structurally different k-way-merge and two-heaps problems. Moved
  to 3rd — right after Top K Frequent, before Merge k Sorted Lists — so
  the three size-k-heap problems reinforce one pattern back-to-back
  before the module introduces new ones. Verified no lesson's prose
  depended on the old position.
- **Rejected:** a "tuple comparison trap" scope gap on Top K Frequent
  Elements and a "ListNode TypeError" gap on Merge k Sorted Lists — both
  claims describe pitfalls the problem lessons already explicitly
  explain in their own text (Top K Frequent: *"heapq orders tuples
  lexicographically... ties broken by value"*; Merge k Sorted Lists: the
  tiebreak counter *"prevents Python from ever trying to compare two
  ListNode objects when their values tie"*). Already self-taught, not a
  gap.
- **Rejected:** a `heapq.heapreplace`/`heappushpop` micro-optimization
  suggestion as a concept-lesson gap. Checked the actual code: Kth
  Largest Element already uses `heapreplace` correctly; only Top K
  Frequent Elements could adopt the equivalent `heappushpop`, and that's
  a problem-level style optimization, not a correctness or derivation
  issue worth a concept-lesson addition.

## Content-quality review — all suggestions independently verified

- **Lesson 2:** added a from-scratch derivation of the `(n−2)//2`
  last-non-leaf starting index (substituting `n−1` into Lesson 1's
  `parent(i) = (i−1)//2` formula) instead of dropping it as a magic
  number, verified in Python against several array sizes; added a brief
  justification for the `⌈n/2^(h+1)⌉`-nodes-of-height-`h` bound used in
  the O(n) heapify proof; added a fully hand-verified build-heap trace
  on `arr = [5,3,8,4,1,9,2]` (confirmed swap-by-swap against the actual
  algorithm in Python, including catching that the root's sift-down
  takes two swaps, not one, which an earlier draft of the trace got
  wrong before verification caught it); lightly tightened the
  back-to-back "why heapify is O(n)" and "contrast the two" paragraphs,
  which restated the same intuition in immediate succession (not the
  deliberate prose-then-table reinforcement pattern — this was prose
  immediately followed by more prose making the identical point).
- **Analogies:** added one sustained theater-seating analogy across
  Lesson 1's heap-property and array-representation sections (packed
  rows, front-to-back, no gaps — extended from "shorter than the two
  people in front of you" to "no usher needed to find a seat number");
  added one sustained weighted-boxes-on-a-shelf analogy across Lesson
  2's sift-up and sift-down sections (a light box floating up past
  heavier ones; a heavy box sinking past the lighter of its two
  supports).

Concept map hand-authored; media deferred to Phase 2.
