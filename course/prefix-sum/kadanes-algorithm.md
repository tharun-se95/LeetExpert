---
title: Maximum Subarray (Kadane's Algorithm)
type: problem
---

## Problem

Given an integer array `nums` (**may contain negatives**), find the
contiguous subarray with the **largest sum**, and return that sum.

**Examples**

```text
nums = [-2,1,-3,4,-1,2,1,-5,4]  →  6    ([4,-1,2,1])
nums = [1]                       →  1
nums = [5,4,-1,7,8]              →  23   (the whole array)
```

**Constraints:** 1 ≤ n ≤ 10⁵ · values in ±10⁴.

## Attempt it first

This is the module's capstone — and it's actually a problem you've
already solved once. Best Time to Buy & Sell Stock (Module 4) tracked a
running minimum and a running best profit in a single pass. This
problem asks something structurally identical, phrased differently:
find the connection before opening any hints.

````reveal Hint 1 — the reduction to a prefix-sum question
Every subarray's sum is a prefix difference: sum(nums[l..r]) =
prefix[r+1] - prefix[l]. Maximizing this over all l < r+1 means, for
each r, subtracting the SMALLEST prefix value seen so far. Sound
familiar? Best Time to Buy & Sell Stock tracked a running minimum and
the best (price[i] - min_so_far) — this is the exact same shape, with
'prefix' standing in for 'price'.
````

````reveal Hint 2 — the equivalent local formulation
There's a second way to see it, arguably cleaner: for each position,
ask 'is it better to EXTEND the previous subarray, or START FRESH here?'
Extend if the running sum-ending-here is still positive (it's helping);
start fresh if it's dragged negative (it's hurting more than starting
over would).
````

## Brute force, for contrast

All O(n²) subarrays with a running sum: O(n²), 10¹⁰ at the ceiling —
out. Both hints above collapse this to O(n); they're the same algorithm
viewed from two angles, and seeing both is the point of this lesson.

## The insight

> A subarray sum is a prefix-sum difference, so "maximize the subarray
> sum ending at r" is "maximize prefix[r+1] minus the smallest prefix
> seen so far" — a running-minimum problem, identical in shape to the
> stock problem's running minimum. Equivalently: track "best sum of a
> subarray ENDING exactly at position i" — it either extends the
> previous best (if positive) or restarts at i (if the previous best
> was negative, since a negative running sum can only drag the total
> down). Both formulations converge on one O(n) pass with O(1) memory —
> the algorithm is **Kadane's algorithm**, and it's the answer to "what
> was that running-max trick from Module 4, generalized?"

## Solution

`````reveal Solution — Kadane's: extend or restart
````tabs
```python
def max_subarray(nums: list[int]) -> int:
    best_ending_here = nums[0]     # best sum of a subarray ENDING at i
    best = nums[0]
    for x in nums[1:]:
        best_ending_here = max(x, best_ending_here + x)   # extend or restart
        best = max(best, best_ending_here)
    return best
```

```typescript
function maxSubArray(nums: number[]): number {
  let bestEndingHere = nums[0]; // best sum of a subarray ENDING at i
  let best = nums[0];
  for (let i = 1; i < nums.length; i++) {
    bestEndingHere = Math.max(nums[i], bestEndingHere + nums[i]); // extend or restart
    best = Math.max(best, bestEndingHere);
  }
  return best;
}
```
````

`best_ending_here + x` is "extend" (the previous best subarray, plus
me); `x` alone is "restart here" (previous contribution was net
negative, so dropping it and starting fresh at x beats carrying it
forward). Taking the max of the two IS the decision, made freshly at
every position — no lookahead, no backtracking, because a negative
running total can never help a FUTURE sum, so discarding it loses
nothing.

Trace on `[-2,1,-3,4,-1,2,1,-5,4]`: best_ending_here sequence: -2, 1,
-2, 4, 3, 5, 6, 1, 5. Running best: -2, 1, 1, 4, 4, 5, 6, 6, 6. Final
answer 6 — matching the expected subarray `[4,-1,2,1]`.

```complexity
{
  "time": "O(n)",
  "space": "O(1)",
  "why": "One pass, two scalars of state — exactly the stock problem's shape. This is optimal: every element must be examined, so Omega(n) is forced."
}
```
`````

`````reveal The prefix-sum-and-running-minimum version, side by side
````tabs
```python
def max_subarray_prefix(nums: list[int]) -> int:
    running = 0
    min_prefix = 0          # smallest prefix seen so far (prefix[0] = 0)
    best = float("-inf")
    for x in nums:
        running += x
        best = max(best, running - min_prefix)   # exactly the stock trick
        min_prefix = min(min_prefix, running)
    return best
```

```typescript
function maxSubArrayPrefix(nums: number[]): number {
  let running = 0;
  let minPrefix = 0; // smallest prefix seen so far (prefix[0] = 0)
  let best = -Infinity;
  for (const x of nums) {
    running += x;
    best = Math.max(best, running - minPrefix); // exactly the stock trick
    minPrefix = Math.min(minPrefix, running);
  }
  return best;
}
```
````

Line up `running - min_prefix` against Module 4's `price - min_so_far`:
identical shape, different variable names. This version and the
extend-or-restart version above always agree — they're two derivations
of the same O(n) answer, and recognizing that they're the SAME
algorithm (not two different ones you need to memorize) is worth more
than either version alone.
`````

## Why this problem closes the module

Every idea in Prefix Sum converges here: subarray sums as prefix
differences (basics lesson), a running structure standing in for
"remember what I need from the past" (hash-map lesson's spirit, though
here a scalar suffices since we only need the minimum, not every
value), and — most of all — the recognition that this is the SAME
algorithm as a problem from three modules ago, wearing new clothes.
That recognition, more than any single technique, is what "thinking in
patterns" actually means by this point in the course.

````reveal Stage 2 momentum check
Kadane's is a genuine landmark: it's the first algorithm in this course
you've now derived from TWO different directions (local decision-making,
and global prefix-sum reasoning) and connected to a THIRD, earlier
problem (Best Time to Buy & Sell Stock) that looked unrelated on the
surface. That triangulation — same algorithm, three framings — is
usually the signal that an idea is genuinely fundamental rather than a
one-off trick.

**Next: Module 13 — Binary Search**, where a similarly foundational
idea (the invariant-driven halving template) gets the same full
treatment: the template, its boundary variants, and "binary search on
the answer" as its most surprising generalization.
````

```quiz
{
  "questions": [
    {
      "question": "In the extend-or-restart formulation, why is it always safe to 'restart' (discard best_ending_here) whenever it goes negative?",
      "options": [
        "Negative numbers are invalid in a sum",
        "A negative running total, carried into any FUTURE subarray, can only make that future subarray's sum smaller than if it started fresh at the current element — so discarding it never loses a better answer",
        "Because Kadane's algorithm requires resetting periodically"
      ],
      "answer": 1,
      "explanation": "This is a real optimality argument, not a heuristic: for any x, best_ending_here + x < x whenever best_ending_here < 0. So carrying a negative prefix forward is strictly worse than dropping it — the algorithm never sacrifices a superior subarray by restarting."
    },
    {
      "question": "How does Kadane's algorithm relate to Best Time to Buy & Sell Stock (Module 4)?",
      "options": [
        "They're unrelated problems that happen to both use a single pass",
        "They're the same algorithm: 'maximize price[i] - min_so_far' and 'maximize running_prefix - min_prefix_so_far' are identical in structure — a running minimum subtracted from the current value, tracked in one O(n), O(1) pass",
        "Kadane's is a generalization that REPLACES the stock algorithm"
      ],
      "answer": 1,
      "explanation": "Once subarray sums are expressed as prefix differences, the maximum-subarray problem becomes EXACTLY the stock problem's shape with 'prefix sum' substituted for 'price'. Seeing this connection is more valuable than memorizing either algorithm in isolation."
    }
  ]
}
```
