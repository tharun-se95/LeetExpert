---
title: Insert Interval
type: problem
---

## Problem

You are given `intervals`, a list of non-overlapping intervals **sorted
by start time**, and a single `newInterval`. Insert `newInterval` into
the list so that the list stays sorted and non-overlapping (merging where
necessary), and return it.

**Examples**

```text
intervals = [[1,3],[6,9]],           newInterval = [2,5]
  →  [[1,5],[6,9]]                    (new interval overlaps [1,3], merges to [1,5])

intervals = [[1,2],[3,5],[6,7],[8,10],[12,16]], newInterval = [4,8]
  →  [[1,2],[3,10],[12,16]]           (new interval swallows [3,5],[6,7],[8,10])
```

**Constraints:** 0 ≤ n ≤ 10⁴ · `intervals` is already sorted by start and
already non-overlapping · `newInterval` may overlap zero, one, or many
existing intervals.

## Attempt it first

The lazy solution is one line: append `newInterval` to the list and run
Module 14's **Merge Intervals** on the result. That is correct, and if
you haven't solved it yet, do that first — it proves you understand the
reduction. But then look hard at the two words in the problem statement
you'd be throwing away: **already sorted**. Merge Intervals pays
O(n log n) *because* it starts from arbitrary order. Here the order is a
gift. Can you insert in a single linear pass and never sort at all?


```sandbox
{
  "id": "insert-interval",
  "fn": { "python": "insert", "javascript": "insert" },
  "check": "return",
  "starter": {
    "python": "def insert(intervals, new_interval):\n    # Return the sorted, non-overlapping list after inserting new_interval.\n    pass\n",
    "javascript": "function insert(intervals, newInterval) {\n  // Return the sorted, non-overlapping list after inserting newInterval.\n}\n"
  },
  "cases": [
    { "args": [[[1, 3], [6, 9]], [2, 5]], "expect": [[1, 5], [6, 9]] },
    {
      "args": [[[1, 2], [3, 5], [6, 7], [8, 10], [12, 16]], [4, 8]],
      "expect": [[1, 2], [3, 10], [12, 16]]
    },
    { "args": [[], [5, 7]], "expect": [[5, 7]] },
    { "args": [[[1, 5]], [2, 3]], "expect": [[1, 5]] },
    { "args": [[[1, 5]], [6, 8]], "expect": [[1, 5], [6, 8]] },
    { "args": [[[3, 5]], [1, 2]], "expect": [[1, 2], [3, 5]] },
    { "args": [[[1, 2], [5, 6]], [2, 5]], "expect": [[1, 6]] }
  ]
}
```

````reveal Hint — the input splits into exactly three zones
Because the list is sorted and non-overlapping, and `newInterval` is one
contiguous range, the existing intervals fall into three consecutive
groups as you scan left to right: those that end **before** `newInterval`
begins (untouched, copy them), those that **overlap** `newInterval`
(absorb them into a growing merged interval), and those that start
**after** `newInterval` ends (untouched, copy them). Handle the three
zones in order and you never look backward.
````

## Brute force, for contrast

Append and re-sort-and-merge: correct, **O(n log n)** dominated by the
sort. It works, but it recomputes global order the input already handed
you for free. On an input that's already sorted, sorting again is pure
waste — the whole reason this problem is a *separate* lesson from Merge
Intervals is to make that waste visible and remove it.

## The insight

> A sorted, non-overlapping list plus a single new interval partitions
> cleanly into three consecutive zones: **entirely before**, **overlapping**,
> **entirely after**. Sortedness guarantees these zones don't interleave —
> once you've passed the overlapping middle, everything remaining is after
> it. So one left-to-right pass with three phases handles it in O(n), no
> sort needed.

The overlap test is the one derived in the concept lesson. An existing
interval `[s, e]` is **entirely before** `newInterval = [ns, ne]` when
`e < ns` (it ends before the new one starts). It is **entirely after**
when `s > ne` (it starts after the new one ends). Anything else overlaps,
and gets merged by widening the new interval's bounds to
`[min(ns, s), max(ne, e)]`.

## Solution

`````reveal Solution — three-phase linear scan
````tabs
```python
def insert(intervals: list[list[int]], new_interval: list[int]) -> list[list[int]]:
    result: list[list[int]] = []
    ns, ne = new_interval
    i, n = 0, len(intervals)

    # Phase 1: intervals entirely before the new one — copy as-is.
    while i < n and intervals[i][1] < ns:
        result.append(intervals[i])
        i += 1

    # Phase 2: intervals that overlap — absorb them into [ns, ne].
    while i < n and intervals[i][0] <= ne:
        ns = min(ns, intervals[i][0])
        ne = max(ne, intervals[i][1])
        i += 1
    result.append([ns, ne])

    # Phase 3: intervals entirely after the (now-merged) new one — copy as-is.
    while i < n:
        result.append(intervals[i])
        i += 1

    return result
```

```typescript
function insert(intervals: number[][], newInterval: number[]): number[][] {
  const result: number[][] = [];
  let [ns, ne] = newInterval;
  let i = 0;
  const n = intervals.length;

  // Phase 1: intervals entirely before the new one — copy as-is.
  while (i < n && intervals[i][1] < ns) {
    result.push(intervals[i]);
    i++;
  }

  // Phase 2: intervals that overlap — absorb them into [ns, ne].
  while (i < n && intervals[i][0] <= ne) {
    ns = Math.min(ns, intervals[i][0]);
    ne = Math.max(ne, intervals[i][1]);
    i++;
  }
  result.push([ns, ne]);

  // Phase 3: intervals entirely after the (now-merged) new one — copy as-is.
  while (i < n) {
    result.push(intervals[i]);
    i++;
  }

  return result;
}
```
````

The three `while` loops share the single index `i` and run in sequence,
so each existing interval is visited exactly once across all three
phases. Note Phase 2's condition is `intervals[i][0] <= ne` — the overlap
test *after* Phase 1 has already skipped everything ending before `ns`.
An interval reaching Phase 2 therefore ends at or past `ns`; if it also
starts at or before `ne`, it overlaps (the concept lesson's condition,
with the earlier half already guaranteed). The `min`/`max` widening
handles the swallow case from example 2: `[4,8]` starts overlapping
`[3,5]` and keeps widening as it absorbs `[6,7]` and `[8,10]`, ending as
`[3,10]`.

```complexity
{
  "time": "O(n)",
  "space": "O(n)",
  "why": "The three while loops together advance the single index i from 0 to n exactly once, so every interval is touched a constant number of times — no sort, because the input is already sorted. Space is the output list, which holds at most n+1 intervals."
}
```
`````

## Complexity — why this beats Merge Intervals here

Merge Intervals is O(n log n) because *its* input is unordered, so it must
pay for a sort before the linear merge. Insert Interval is handed a
sorted, already-merged list, so the sort is unnecessary — and dropping it
takes the cost from O(n log n) down to **O(n)**. This is a general lesson,
not a trick: when a problem hands you a precondition (sorted,
non-overlapping), the first question is always *what work does this
precondition let me skip?* Here it removes the single most expensive step
entirely.

## Variants

- **Merge Intervals** (Module 14): the more general problem this reduces
  to when the input is unordered — the fallback O(n log n) solution appends
  and re-merges. Read it first; this lesson is the "input already sorted"
  optimization of it.
- **Non-overlapping Intervals** (next): also starts from intervals but
  asks a removal-count question, and — importantly — sorts by *end*, not
  start. A good contrast for when each sort key is correct.
- **Interval List Intersections:** two sorted interval lists merged by a
  two-pointer sweep — the same "sortedness lets you avoid re-sorting"
  idea, applied to intersection instead of insertion.

```quiz
{
  "question": "Insert Interval runs in O(n) while Merge Intervals runs in O(n log n), even though both merge overlapping intervals. What single property of the input accounts for the entire difference?",
  "options": [
    "Insert Interval's input is already sorted and non-overlapping, so the O(n log n) sort that Merge Intervals must perform is unnecessary — leaving only the O(n) linear merge, which both algorithms share",
    "Insert Interval has fewer intervals to process — since newInterval is just one additional interval being folded in, the total work is bounded by a smaller input size than Merge Intervals typically handles",
    "Insert Interval uses a faster merging technique in its inner loop — its three-phase scan applies a more efficient overlap-absorption strategy than the pairwise comparisons Merge Intervals performs"
  ],
  "answer": 0,
  "explanation": "The merge step itself is O(n) in both problems. The only difference is that Merge Intervals must first impose order on arbitrary input (O(n log n)), while Insert Interval is given order for free and skips that step. Recognizing which preconditions let you drop the dominant cost is the transferable skill here."
}
```
