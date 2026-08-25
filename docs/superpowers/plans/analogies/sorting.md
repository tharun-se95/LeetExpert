# Sorting — curriculum review + content-quality review

## Curriculum-designer review — one real bug found

Ran against the 4 concept-lesson sources (The O(n²) Baseline Sorts, Merge
Sort & the n log n Lower Bound, Quicksort & Partitioning, Linear-Time
Sorts) plus the 5 problem lessons. Count, ordering, and scope boundaries
were all confirmed correct (no overlap with Binary Search before it or
Intervals after it; all 5 problem lessons map cleanly onto the 4
concepts' techniques without needing new lessons).

- **Broken cross-reference caught.** Lesson 4 (Linear-Time Sorts) opened
  with *"The previous lesson proved that no algorithm sorting by
  comparisons can beat Ω(n log n)..."* — but under the current lesson
  order, "the previous lesson" is Lesson 3 (Quicksort), which contains no
  such proof; the proof lives in Lesson 2 (Merge Sort). NotebookLM's
  first suggestion was a structural fix (reorder lessons or move the
  proof). Rejected that as too big for the actual problem — a genuine
  wording bug, not a sequencing bug, since the current order (baseline →
  merge sort's proof → quicksort's practical tradeoffs → linear-time
  sorts that break the proof's assumption) is the right pedagogical
  shape. Fixed with the minimal correction: name "the Merge Sort lesson"
  explicitly instead of "the previous lesson."

## Content-quality review — all suggestions independently verified

- **Lesson 1 (Baseline Sorts):** derived selection sort's "exactly n
  swaps" claim explicitly (n passes × 1 swap/pass) instead of asserting
  it; added a formal inversions derivation for insertion sort
  (`O(n + I)`, reverse-sorted has max `I = n(n-1)/2`, nearly-sorted has
  `I ≈ 0`) backing the existing best/worst-case claim with real math;
  hand-verified a reverse-sorted trace on `[5,4,3,2,1]` (shifts
  1+2+3+4 = 10, matching the triangular sum for n=5); added a
  bookshelf/shortest-book analogy for selection sort and a hand-of-cards
  analogy for insertion sort.
- **Lesson 2 (Merge Sort):** added an inline comment explaining why the
  leftover-copy step is correct (both sides were pre-sorted, so
  remainder is provably ≥ everything placed); added a fully verified
  tagged-duplicate stability trace (`left=[2ₐ,4]`, `right=[2ᵦ,3]` →
  `[2ₐ,2ᵦ,3,4]`); added a "two sorted stacks of paper" analogy for the
  merge step itself.
- **Lesson 3 (Quicksort):** added a hand-verified Lomuto partition trace
  on `arr=[8,3,7,1,5]`, pivot=5 → final `[3,1,5,8,7]`, pivot index 2 —
  confirmed by running the actual `partition()` code in Python; added a
  queue-of-people-by-height analogy for the partition mechanic.
  Rejected NotebookLM's suggestion to add an O(log n) worst-case space
  technique note (recurse-on-smaller-side-first) as out of scope — the
  lesson's existing complexity table already states O(log n) average /
  O(n) worst-case space accurately, and the recursion-order optimization
  is a level of implementation detail the lesson doesn't otherwise go
  into for any other technique.
- **Lesson 4 (Linear-Time Sorts):** fixed the cross-reference bug above;
  added a hand-verified reverse-iteration stability trace on
  `arr=[13,23,7]` showing `13` stays ahead of `23` through the ones-digit
  pass; added a full hand-verified 2-digit radix sort trace on
  `arr=[29,13,22,19,5]` → `[22,13,5,29,19]` after the ones-pass →
  `[5,13,19,22,29]` after the tens-pass, fully sorted — confirmed by
  running the actual `counting_sort_by_digit`/`radix_sort` code in
  Python; added a postal-code/pigeonhole analogy for counting sort and an
  index-cards-in-bins analogy for radix sort.

Rejected an "in practice redundancy" tightening suggestion on Lesson 4's
closing section (mischaracterized — the "in practice, call the built-in
sort" paragraph and the reading-signal table serve different purposes:
one is a practical default, the other is a decision guide for the rare
cases a hand-written sort is correct).

Concept map hand-authored; media deferred to Phase 2.
