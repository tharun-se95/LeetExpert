---
title: Practice
type: practice
---

## How to practice this module

Arrays drills reward **in-place discipline**: write pointers, partitions,
and single-pass bookkeeping. Work the five problems in order — each one
reuses an idea from the previous concept lessons, then twists it.

Suggested loop for each problem: attempt the sandbox cold → read the
explanation only after a real try → re-solve from memory the next day.
You are done with Arrays Practice when all five show Solved in the hub.

## Problems

```practice-problems
- slug: remove-duplicates-sorted
  pattern: Two pointers / write pointer
  difficulty: Easy
  watch_for: Off-by-one on the write index; do not allocate a second array
- slug: move-zeroes
  pattern: Partition pointers
  difficulty: Easy
  watch_for: Stability of non-zero order; zeroes must survive at the end
- slug: rotate-array
  pattern: Reverse cycles / triple reverse
  difficulty: Medium
  watch_for: k can exceed n — normalise before indexing; O(1) extra space
- slug: best-time-to-buy-sell-stock
  pattern: Single-pass running minimum
  difficulty: Easy
  watch_for: Sell day must be after buy day; all-falling prices → 0
- slug: product-except-self
  pattern: Prefix / suffix products
  difficulty: Medium
  watch_for: No division; zeroes break the naive product/divide trick
```
