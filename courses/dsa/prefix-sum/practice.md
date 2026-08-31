---
title: Practice
type: practice
---

## How to practice this module

Prefix-sum drills reward **precomputing ranges**: decide what the prefix
means, then every subarray query becomes a difference. Range queries first,
then the prefix + hash pair, then 2D inclusion–exclusion; Kadane is the
capstone that reuses the running-total idea as a 1-D DP. Done when all five
show Solved in the hub.

## Problems

```practice-problems
- slug: range-sum-query-immutable
  pattern: 1D prefix array
  difficulty: Easy
  watch_for: pref[i] is the sum of the first i elements; range [l, r] is pref[r+1] - pref[l] — get the off-by-one right once
- slug: subarray-sum-equals-k
  pattern: Prefix + hash map
  difficulty: Medium
  watch_for: Seed the map with prefix 0 -> count 1; a subarray ending at i sums to k iff prefix[i] - k was already seen
- slug: contiguous-array
  pattern: Prefix of a transformed array
  difficulty: Medium
  watch_for: Map 0 -> -1 so a zero balance means equal counts; store the FIRST occurrence of each prefix to maximise length
- slug: range-sum-2d-immutable
  pattern: 2D inclusion-exclusion
  difficulty: Medium
  watch_for: Grid prefix with +1 padding; a rectangle is four terms — the padded origin is where off-by-one lives
- slug: kadanes-algorithm
  pattern: Running maximum (1-D DP)
  difficulty: Medium
  watch_for: The running sum resets to 0 when negative — decide "extend" vs "restart" at each element and track the all-time max
```
