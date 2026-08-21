---
title: Practice
type: practice
---

## How to practice this module

Two-pointers drills reward **proving the walk is safe**: each move
eliminates a candidate region. Start with converging pointers on sorted
input (Two Sum II, Container, 3Sum), then the Dutch national flag, then
Trapping Rain Water which combines the invariant with running maxima. Done
when all five show Solved in the hub.

## Problems

```practice-problems
- slug: two-sum-ii
  pattern: Converging pointers
  difficulty: Medium
  watch_for: Move the pointer that overshoots — too big shrinks the right, too small grows the left
- slug: sort-colors
  pattern: Three-way partition
  difficulty: Medium
  watch_for: Swap a 0 to the front and a 2 to the back; only the value 1 advances the middle pointer
- slug: container-with-most-water
  pattern: Converging area
  difficulty: Medium
  watch_for: Move the shorter side — the area is bounded by the shorter height, so moving the taller side can never win
- slug: three-sum
  pattern: Sort + two-pointer per pivot
  difficulty: Medium
  watch_for: Skip duplicate pivots and duplicate pairs; the search target is the complement, not a fixed pair
- slug: trapping-rain-water
  pattern: Two-pointer running maxima
  difficulty: Hard
  watch_for: Water at a column is bounded by min(maxLeft, maxRight) — advance the side with the smaller running max
```
