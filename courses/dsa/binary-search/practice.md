---
title: Practice
type: practice
---

## How to practice this module

Binary-search drills reward **the invariant**: name what the search region
guarantees, then shrink it. Insert position and first/last are boundary
searches; rotated-array tests the pivot split; Koko and minimum-rotated are
binary search on the answer. Done when all five show Solved in the hub.

## Problems

```practice-problems
- slug: search-insert-position
  pattern: Lower-bound search
  difficulty: Easy
  watch_for: The invariant decides the answer — return lo, not lo-1 or hi; a single-element array is the edge case
- slug: find-first-and-last
  pattern: Two boundary searches
  difficulty: Medium
  watch_for: First and last are separate lower/upper-bound walks; an absent target must return [-1, -1]
- slug: search-rotated-sorted-array
  pattern: Pivot-aware binary search
  difficulty: Medium
  watch_for: Detect which half is sorted and check membership there — the rotation breaks the naive mid comparison
- slug: koko-eating-bananas
  pattern: Binary search on the answer
  difficulty: Medium
  watch_for: Speed is monotonic in time; search the range [1, max(pile)] and the feasibility check must run in O(n)
- slug: find-minimum-in-rotated-sorted-array
  pattern: Pivot minimum
  difficulty: Medium
  watch_for: Compare mid with the right end to decide which side holds the minimum — the pivot is the drop between sorted halves
```
