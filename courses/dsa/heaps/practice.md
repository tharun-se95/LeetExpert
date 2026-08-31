---
title: Practice
type: practice
---

## How to practice this module

Heap drills reward **keeping the right shape in O(log n)**: a size-k heap
holds top-k, two heaps hold a running median, a heap of list heads merges k
lists, and task scheduling re-pushes cooldowns. Done when all six show
Solved in the hub.

## Problems

```practice-problems
- slug: kth-largest-element-in-a-stream
  pattern: Size-k min-heap
  difficulty: Easy
  watch_for: Emit the root after each add; only push values larger than the current kth-largest or the heap overgrows
- slug: top-k-frequent-elements
  pattern: Count + size-k heap
  difficulty: Medium
  watch_for: Build the frequency map first, then a min-heap of size k keyed by frequency — the comparator is the frequency, not the value
- slug: merge-k-sorted-lists
  pattern: Heap of list heads
  difficulty: Hard
  watch_for: Push each head with its list identity; after popping, push that same list's next node
- slug: find-median-from-data-stream
  pattern: Two-heap median
  difficulty: Hard
  watch_for: Max-heap holds the lower half, min-heap the upper; rebalance so the sizes differ by at most one
- slug: k-closest-points-to-origin
  pattern: Max-heap of size k
  difficulty: Medium
  watch_for: Closest points need a MAX-heap of size k that evicts the farthest; compare by squared distance
- slug: task-scheduler
  pattern: Greedy with heap + cooldown
  difficulty: Medium
  watch_for: Run the most frequent eligible task; park just-run tasks in a cooldown queue and re-push them when their gap clears
```
