---
title: Practice
type: practice
---

## How to practice this module

Interval drills reward **sorting by the right endpoint**: merge extends the
current span, insert splices, arrows and meeting-rooms use an end-based
greedy, and employee-free-time sweeps both schedules at once. Done when all
five show Solved in the hub.

## Problems

```practice-problems
- slug: insert-interval
  pattern: Walk + coalesce
  difficulty: Medium
  watch_for: Push intervals before the overlap, merge through the overlap window, then append the rest — handle full containment
- slug: non-overlapping-intervals
  pattern: Earliest-end greedy
  difficulty: Medium
  watch_for: Keep the interval that ends soonest and drop overlapping later ones; the answer is drops, not kept
- slug: minimum-arrows-to-burst-balloons
  pattern: Sort by end + sweep
  difficulty: Medium
  watch_for: One arrow covers overlapping balloons — fire at the current end and only start a new arrow when a balloon begins after it
- slug: meeting-rooms
  pattern: Overlap check
  difficulty: Easy
  watch_for: Sort by start and compare each meeting's start with the previous end — you only need a conflict test, not rooms
- slug: employee-free-time
  pattern: Merged timeline sweep
  difficulty: Hard
  watch_for: Merge every employee's intervals into one sorted timeline, then the gaps between merged spans are the free time
```
