---
title: Practice
type: practice
---

## How to practice this module

Sliding-window drills are **invariant maintenance**: decide what the window
guarantees, then expand and shrink to keep it. Start with the fixed-size
average, then the dynamic shrink invariant; permutation and minimum-window
both use a "covered characters" counter. Done when all five show Solved in
the hub.

## Problems

```practice-problems
- slug: maximum-average-subarray
  pattern: Fixed-size window
  difficulty: Easy
  watch_for: Slide one element at a time and recompute incrementally, never per window
- slug: minimum-size-subarray-sum
  pattern: Dynamic shrink
  difficulty: Medium
  watch_for: Shrink the left end while the sum still meets the target; update the answer on every valid window
- slug: longest-substring-without-repeating
  pattern: Window + last-seen map
  difficulty: Medium
  watch_for: The left bound jumps to just after the previous occurrence — do not increment it by one
- slug: permutation-in-string
  pattern: Count-match window
  difficulty: Medium
  watch_for: Match means all 26 letter counts are equal, not merely that the window length fits
- slug: minimum-window-substring
  pattern: Coverage counter
  difficulty: Hard
  watch_for: Expand until every character is covered, then shrink until coverage breaks; record the answer while coverage holds
```
