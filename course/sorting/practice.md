---
title: Practice
type: practice
---

## How to practice this module

Sorting drills reward **knowing what order buys you**: sort once, then
scan, merge, or compare. Sort-an-array proves you can implement the
workhorse; merge-intervals and meeting-rooms show sort-then-sweep;
largest-number and kth-largest need custom ordering and partitioning. Done
when all five show Solved in the hub.

## Problems

```practice-problems
- slug: sort-an-array
  pattern: Comparison sort (merge / quicksort)
  difficulty: Medium
  watch_for: In-place quicksort needs the partition right; merge sort needs the temp array — worst case O(n log n), never accidental O(n^2)
- slug: merge-intervals
  pattern: Sort by start, then merge
  difficulty: Medium
  watch_for: Sort by start; extend current.end while the next.start <= current.end, else push the interval and move on
- slug: largest-number
  pattern: Custom comparator
  difficulty: Medium
  watch_for: Compare concatenations a+b vs b+a, not numeric value; strip leading zeroes from the final result
- slug: meeting-rooms-ii
  pattern: Sweep with heap / events
  difficulty: Medium
  watch_for: Sort by start and free a room by earliest end; or sweep +1/-1 events and track the peak
- slug: kth-largest-element
  pattern: Quickselect / size-k min-heap
  difficulty: Medium
  watch_for: After partitioning, recurse into only the side holding the target index — that is what makes quickselect near-linear
```
