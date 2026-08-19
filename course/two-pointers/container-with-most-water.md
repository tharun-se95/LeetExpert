---
title: Container With Most Water
type: problem
---

## Problem

`height[i]` is the height of a vertical line at position i. Choose two
lines; together with the x-axis they form a container. Return the
**maximum water area** — `(distance between lines) × (shorter line's
height)`.

**Examples**

```examples
height = [1,8,6,2,5,4,8,3,7]  →  49    (lines at 1 and 8: width 7 × min(8,7))
height = [1,1]                →  1
```

```constraint
2 ≤ n ≤ 10⁵ · heights in [0, 10⁴].
```

## Attempt it first

The most famous elimination argument in interviewing — and the
converging lesson warned you about it: the pointer rule ("move the
shorter one") is easy to *guess* and hard to *prove*, and interviewers
push on the proof. The input is NOT sorted this time, so the lesson's
sortedness argument doesn't transfer directly — something else must
justify elimination. Find the rule, then find the reason.


```sandbox
{
  "id": "container-with-most-water",
  "fn": { "python": "max_area", "javascript": "maxArea" },
  "check": "return",
  "starter": {
    "python": "def max_area(height):\n    # Return the largest area.\n    pass\n",
    "javascript": "function maxArea(height) {\n  // Return the largest area.\n}\n"
  },
  "cases": [
    { "args": [[1,8,6,2,5,4,8,3,7]], "expect": 49 },
    { "args": [[1,1]], "expect": 1 },
    { "args": [[4,3,2,1,4]], "expect": 16 },
    { "args": [[1,2,1]], "expect": 2 }
  ]
}
```
````reveal Hint 1 — what does area depend on?
Area = width × min(left height, right height). Starting from the widest
container, any inward move SHRINKS width — so a move is only worth it
if it can increase the minimum height. Which pointer's move could?
````

````reveal Hint 2 — the elimination, precisely
Suppose height[L] ≤ height[R]. Consider ALL containers keeping line L
with some closer right wall: their width is smaller, and their height
is still capped at ≤ height[L] (the min can't exceed the shorter wall).
So every such container is ≤ the one just measured — L is fully
explored, discard it. The shorter wall is the dead one.
````

## Brute force, for contrast

All C(n,2) pairs: 5·10⁹ at n = 10⁵ — out. Note there's no sorting
escape here (positions matter; sorting destroys widths), and no obvious
hash trick: this problem is why the converging template exists beyond
sorted arrays.

## The insight

> The width shrinks with every move, so the only hope of improvement is
> a taller minimum — and the shorter wall is the binding constraint.
> Keeping the shorter wall while narrowing can NEVER win (width ↓, cap
> unchanged), so the shorter wall is eliminated — all its remaining
> pairings die with it, measured against the one (widest) pairing it
> already had. Sortedness isn't the precondition this time;
> **monotone-shrinking width** is what makes one measurement speak for
> a whole family.

## Solution

`````reveal Solution — move the shorter wall
````tabs
```python
def max_area(height: list[int]) -> int:
    left, right = 0, len(height) - 1
    best = 0
    while left < right:
        width = right - left
        if height[left] <= height[right]:
            best = max(best, width * height[left])
            left += 1          # shorter wall: fully explored, discard
        else:
            best = max(best, width * height[right])
            right -= 1
    return best
```

```typescript
function maxArea(height: number[]): number {
  let left = 0;
  let right = height.length - 1;
  let best = 0;
  while (left < right) {
    const width = right - left;
    if (height[left] <= height[right]) {
      best = Math.max(best, width * height[left]);
      left++; // shorter wall: fully explored, discard
    } else {
      best = Math.max(best, width * height[right]);
      right--;
    }
  }
  return best;
}
```
````

The tie case (`<=`): when walls are equal, moving EITHER is safe — any
container keeping one of them is capped at that shared height with less
width. Convince yourself once so the `<=` doesn't look arbitrary.

Invariant (the lesson's sentence, instantiated): *every eliminated
index had all its unexplored pairings proven ≤ best; the optimal pair,
if not yet recorded, lies within [left, right].* When the pointers
meet, the second clause is vacuous — best is the answer.

```complexity
{
  "time": "O(n)",
  "space": "O(1)",
  "why": "One index retires per iteration. Each retirement is justified against a single measured container — n measurements stand in for all n²/2."
}
```
`````

## Variants

- **Trapping Rain Water** (next): looks like a sibling, is a different
  beast — area BETWEEN all walls, not between two. The elimination
  survives in mutated form; comparing the two proofs is the module's
  best exercise.
- **Largest Rectangle in Histogram** (Module 8): interior heights
  constrain there, don't here — the reason these three look-alike
  problems take three different algorithms is exactly what "reading a
  problem's structure" means.

```quiz
{
  "question": "Why is 'move the shorter wall' provably safe rather than merely plausible?",
  "options": [
    "Taller walls always hold more water — since height is one of the two factors in the area formula, maximizing the shorter wall's height directly increases the product regardless of what happens to width",
    "Fix the shorter wall L: every remaining pairing of L has strictly less width AND height still capped at height[L] — all are ≤ the container just measured with L at maximum width. One measurement retires the whole family",
    "Because the array is processed from both ends — starting the pointers at the two extremes guarantees the initial measurement already covers the maximum possible width, so every subsequent move is safe by construction"
  ],
  "answer": 1,
  "explanation": "The proof leans on two monotone facts: width only shrinks inward, and min(·, height[L]) ≤ height[L]. Note what it does NOT claim — that moving the taller wall can't help NOW — but that keeping the shorter one can never beat what it already achieved. That asymmetry is the argument people hand-wave; being able to state it exactly is the difference the interviewer is probing."
}
```
