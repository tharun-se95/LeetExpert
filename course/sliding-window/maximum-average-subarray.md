---
title: Maximum Average Subarray I
type: problem
---

## Problem

Given `nums` and an integer `k`, find the contiguous subarray of length
k with the **maximum average**, and return that average.

**Examples**

```text
nums = [1,12,-5,-6,50,3], k = 4  →  12.75   (window [12,-5,-6,50], sum 51)
nums = [5], k = 1                →  5.0
```

**Constraints:** 1 ≤ k ≤ n ≤ 10⁵ · values in ±10⁴.

## Attempt it first

This is the fixed-window lesson with a division tacked on at the end.
The whole exercise is noticing that maximizing average is the same as
maximizing sum (k is fixed, so dividing by it at the end doesn't change
which window wins) — then applying the slide template directly.


```sandbox
{
  "id": "maximum-average-subarray",
  "fn": { "python": "find_max_average", "javascript": "findMaxAverage" },
  "check": "return",
  "starter": {
    "python": "def find_max_average(nums, k):\n    # Return the maximum average over any window of length k.\n    pass\n",
    "javascript": "function findMaxAverage(nums, k) {\n  // Return the maximum average over any window of length k.\n}\n"
  },
  "cases": [
    { "args": [[1, 12, -5, -6, 50, 3], 4], "expect": 12.75 },
    { "args": [[5], 1], "expect": 5 },
    { "args": [[-1, -2, -3, -4], 2], "expect": -1.5 },
    { "args": [[1, 2, 4], 3], "expect": 2.3333333333333335 },
    { "args": [[0, 1, 1, 3, 3], 4], "expect": 2 },
    { "args": [[4, 0, 4, 3, 3], 5], "expect": 2.8 }
  ]
}
```

````reveal Hint — reduce to the lesson's exact template
Maximize sum over all windows of size k (the lesson's template, verbatim),
then divide the best sum by k once, at the very end.
````

## Brute force, for contrast

Re-sum every window: O(n·k) — up to 10¹⁰ at the constraint ceiling. The
slide reduces this to O(n) by reusing the previous window's sum.

## Solution

`````reveal Solution — slide the sum, divide once
````tabs
```python
def find_max_average(nums: list[int], k: int) -> float:
    window_sum = sum(nums[:k])       # prime: O(k), once
    best = window_sum
    for right in range(k, len(nums)):
        left = right - k
        window_sum += nums[right] - nums[left]   # slide: O(1)
        best = max(best, window_sum)
    return best / k                  # divide ONCE, at the end
```

```typescript
function findMaxAverage(nums: number[], k: number): number {
  let windowSum = nums.slice(0, k).reduce((a, b) => a + b, 0); // prime
  let best = windowSum;
  for (let right = k; right < nums.length; right++) {
    const left = right - k;
    windowSum += nums[right] - nums[left]; // slide: O(1)
    best = Math.max(best, windowSum);
  }
  return best / k; // divide ONCE, at the end
}
```
````

Why dividing once at the end is correct (not just faster): k is fixed
for the whole problem, so `sum_A > sum_B ⟺ sum_A / k > sum_B / k` — the
division is a strictly increasing transform, and comparing sums finds
the same winner as comparing averages. Dividing inside the loop would
give the same answer at k extra divisions of cost — harmless here, but
recognizing when a transform can be deferred is a general skill (it
returns when problems ask you to compare ratios, rates, or normalized
scores).

```complexity
{
  "time": "O(n)",
  "space": "O(1)",
  "why": "One O(k) prime, then O(1) per remaining position. A single division at the end, not per window."
}
```
`````

## Variants

- **Maximum Average Subarray II** (length ≥ k, not exactly k): the fixed
  slide no longer applies directly — needs binary search on the answer
  (Module 13) combined with a prefix-sum feasibility check.
- **Minimum Size Subarray Sum** (next): same slide mechanics, but now
  the window SIZE is what's unknown — the dynamic-window lesson's
  territory.

```quiz
{
  "question": "Why is it correct to compare SUMS throughout the loop and only divide by k once, at the very end, instead of computing each window's average inside the loop?",
  "options": [
    "Since k is constant across every window, dividing by k is a strictly increasing transform — it preserves ordering, so whichever window has the largest SUM also has the largest AVERAGE. Comparing sums and comparing averages find the same winner",
    "It's a micro-optimization that happens to give the same answer — deferring the division saves a few CPU cycles across the loop, but computing each window's average inline would still find the correct maximum, just slightly slower",
    "Floating point division is unsafe inside loops — repeated division operations inside a tight loop can accumulate rounding error across iterations in a way that a single division at the end avoids"
  ],
  "answer": 0,
  "explanation": "Deferring a monotonic transform until after the comparisons that matter is a recurring move: it's valid exactly because the transform doesn't change relative order. The same reasoning would break if k varied per window — then sums wouldn't be comparable at all."
}
```
