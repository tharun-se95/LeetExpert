---
title: Trapping Rain Water
type: problem
---

## Problem

Given an elevation map `height`, compute how much rain water it traps.

**Examples**

```examples
height = [0,1,0,2,1,0,1,3,2,1,2,1]  →  6
height = [4,2,0,3,2,5]              →  9
```

```text
        █
█   █░░░█ █
█ █░█░█░█░█ █        ░ = trapped water (first example)
```

```constraint
1 ≤ n ≤ 2·10⁴ · heights in [0, 10⁵].
```

## Attempt it first

The module capstone, and a hard one. Do NOT start from Container With
Most Water's pointer rule — start from physics: **why does any single
cell hold water?** Get the per-cell formula first (Hint 1), build the
O(n)-space solution honestly, and only then compress it to two
pointers. Each stage is a legitimate interview answer; the progression
is the point.


```sandbox
{
  "id": "trapping-rain-water",
  "fn": { "python": "trap", "javascript": "trap" },
  "check": "return",
  "starter": {
    "python": "def trap(height):\n    # Return total trapped water.\n    pass\n",
    "javascript": "function trap(height) {\n  // Return total trapped water.\n}\n"
  },
  "cases": [
    { "args": [[0,1,0,2,1,0,1,3,2,1,2,1]], "expect": 6 },
    { "args": [[4,2,0,3,2,5]], "expect": 9 },
    { "args": [[3,0,2]], "expect": 2 },
    { "args": [[1,2,3]], "expect": 0 }
  ]
}
```
````reveal Hint 1 — one cell at a time
Water above cell i rises to the lower of the two walls guarding it:
level = min(max height to my LEFT, max height to my RIGHT). Water held
= level − height[i] (if positive). The whole answer is the sum of this
per cell — verify against the picture.
````

````reveal Hint 2 — precompute the maxes
left_max[i] and right_max[i] are prefix/suffix running maxima — two
sweeps, exactly like Product of Array Except Self's prefix/suffix
products (Module 4). O(n) time, O(n) space: a complete, correct
solution. The follow-up: can one of the arrays become a scalar?
````

````reveal Hint 3 — the two-pointer compression
Walk from both ends tracking left_max and right_max as scalars. The
side with the SMALLER current max can settle its cell immediately: its
water level is decided by ITS side's max — the far side is guaranteed
at least as tall, wherever its true max lies. Settle, move that
pointer inward.
````

## Brute force, for contrast

Per cell, scan both directions for the maxes: O(n²). The prefix-array
version kills that in O(n)/O(n). The two-pointer version exists for the
O(1)-space follow-up — unlike some optimizations, each rung of this
ladder is worth stating in an interview: formula → arrays → pointers.

## The insight

> Per cell: water = min(left_max, right_max) − height. The min is the
> obstacle to computing left-to-right in one pass (right_max lives in
> the future) — but you don't need right_max's VALUE when you know
> left_max is smaller: min(known_smaller, anything ≥ it) = the known
> side. Converging pointers maintain both running maxes, and at every
> step at least one side's cells are decidable. Elimination again — but
> what's eliminated is UNCERTAINTY about the min, not candidate pairs.

## Solution

`````reveal Solution 1 — prefix/suffix maxima (the honest baseline)
````tabs
```python
def trap_arrays(height: list[int]) -> int:
    n = len(height)
    if n == 0:
        return 0
    left_max = [0] * n
    right_max = [0] * n
    left_max[0] = height[0]
    for i in range(1, n):
        left_max[i] = max(left_max[i - 1], height[i])
    right_max[n - 1] = height[n - 1]
    for i in range(n - 2, -1, -1):
        right_max[i] = max(right_max[i + 1], height[i])
    return sum(
        min(left_max[i], right_max[i]) - height[i] for i in range(n)
    )
```

```typescript
function trapArrays(height: number[]): number {
  const n = height.length;
  if (n === 0) return 0;
  const leftMax = new Array<number>(n);
  const rightMax = new Array<number>(n);
  leftMax[0] = height[0];
  for (let i = 1; i < n; i++) {
    leftMax[i] = Math.max(leftMax[i - 1], height[i]);
  }
  rightMax[n - 1] = height[n - 1];
  for (let i = n - 2; i >= 0; i--) {
    rightMax[i] = Math.max(rightMax[i + 1], height[i]);
  }
  let total = 0;
  for (let i = 0; i < n; i++) {
    total += Math.min(leftMax[i], rightMax[i]) - height[i];
  }
  return total;
}
```
````

```complexity
{
  "time": "O(n)",
  "space": "O(n)",
  "why": "Three sequential passes. The running-maxima arrays are Module 4's prefix/suffix sweep with max instead of product — same skeleton, new aggregate."
}
```
`````

`````reveal Solution 2 — two pointers, O(1) space
There are two ways to write the pointer rule. Comparing the *walls*
(`height[left] < height[right]`) works but has a surprisingly fiddly
correctness proof. Comparing the **maxes** makes the proof three
lines — teach yourself this one:

````tabs
```python
def trap(height: list[int]) -> int:
    left, right = 0, len(height) - 1
    left_max = right_max = 0
    total = 0
    while left < right:
        left_max = max(left_max, height[left])      # exact max of [0..left]
        right_max = max(right_max, height[right])   # exact max of [right..n)
        if left_max <= right_max:
            total += left_max - height[left]        # settle left cell
            left += 1
        else:
            total += right_max - height[right]      # settle right cell
            right -= 1
    return total
```

```typescript
function trap(height: number[]): number {
  let left = 0;
  let right = height.length - 1;
  let leftMax = 0;
  let rightMax = 0;
  let total = 0;
  while (left < right) {
    leftMax = Math.max(leftMax, height[left]); // exact max of [0..left]
    rightMax = Math.max(rightMax, height[right]); // exact max of [right..n)
    if (leftMax <= rightMax) {
      total += leftMax - height[left]; // settle left cell
      left++;
    } else {
      total += rightMax - height[right]; // settle right cell
      right--;
    }
  }
  return total;
}
```
````

The proof, for the left branch (the right is its mirror). Cell `left`
needs `min(true_left_max, true_right_max)`:

1. **true_left_max = left_max, exactly** — every index in [0, left] has
   been folded in (including `height[left]` on the line above).
2. **true_right_max ≥ right_max** — the true right side of cell `left`
   is [left+1, n), which contains everything the right pointer has
   folded in.
3. The branch says `right_max ≥ left_max`. Chain them:
   true_right_max ≥ right_max ≥ left_max = true_left_max — so the min
   is **left_max**, and the settle is exact.

That's the whole argument, and it's the same one-sided-bound trick as
`min(a, b) = a whenever you know b ≥ a`: the far side's exact maximum
is unknowable without the future, but a lower bound that already
clears your own side is all the min ever needed. (Water is never
negative here either: left_max folded in height[left], so the settle
is ≥ 0 by construction.)

```complexity
{
  "time": "O(n)",
  "space": "O(1)",
  "why": "One pointer retires per step. Two scalar maxima replace the two arrays — legal because each settle needs only 'my side's exact max' and 'a lower bound ≥ it on the other side.'"
}
```
`````

## Variants

- **Container With Most Water:** two walls, no interior — compare the
  two elimination proofs side by side; they share the converging
  skeleton and nothing else.
- **Trapping Rain Water II** (2-D, hard): the "lowest wall decides"
  idea survives, but the frontier needs a heap — Module 19 territory.
- **Product Except Self / prefix maxima:** the two-array pattern this
  capstone compressed; recognizing "prefix/suffix aggregate" as one
  reusable move is a Stage 2 meta-skill.

````reveal Module complete — what carries forward
- The **elimination proof** is now a form you can instantiate: state
  what a pointer move discards and why nothing discarded can win.
- **Region invariants** (partition, Dutch flag) feed directly into
  quicksort's engine room in Module 14.
- **Sort-then-two-point** (3Sum) is a general reduction: pay n log n
  once, buy adjacency-dedup and elimination together.
- **Prefix/suffix aggregates compressed to scalars** (this capstone)
  reappears in Kadane's (Module 12) and DP space optimizations
  (Stage 4).

**Next: Module 11 — Sliding Window**, where the two pointers move the
SAME direction and the window between them becomes the object of study.
````

```quiz
{
  "question": "In the two-pointer version, the left branch settles cell `left` using only left_max. What justifies ignoring the true right-side maximum?",
  "options": [
    "Because water can only flow rightward — physically, water trapped above a cell can only drain toward the right wall, so the left wall's height is the only side whose exact value the settle calculation ever needs",
    "The settle needs min(left_max, true_right_max); the branch guarantees right_max ≥ left_max, and true_right_max ≥ right_max — so the min is left_max regardless of the right side's exact value. A lower bound that clears your own max resolves the min completely",
    "The right side rarely matters in practice — on most realistic elevation profiles the right wall tends to be tall enough that its exact value rarely changes the outcome of the min computation anyway"
  ],
  "answer": 1,
  "explanation": "min(a, b) is decided the moment you know b ≥ a — b's exact value adds nothing. That's the entire compression: replace 'know the future max exactly' (the O(n) array) with 'know a bound that already beats my side' (a scalar you hold). The same one-sided-bound trick returns in DP space optimizations."
}
```
