---
title: Minimum Size Subarray Sum
type: problem
---

## Problem

Given a **positive**-integer array `nums` and a target, return the
length of the **shortest contiguous subarray** whose sum is ≥ target,
or 0 if none exists.

**Examples**

```text
target = 7, nums = [2,3,1,2,4,3]   →  2    ([4,3], sum 7)
target = 4, nums = [1,4,4]         →  1    ([4])
target = 11, nums = [1,1,1,1,1,1,1,1]  →  0   (max possible sum is 8)
```

**Constraints:** 1 ≤ n ≤ 10⁵ · 1 ≤ target ≤ 10⁹ · **all values
positive**.

## Attempt it first

This is the dynamic-windows lesson's opening trace, made concrete. The
window's size is now the unknown — you're hunting for the *shortest*
window meeting a lower-bound condition, which is exactly the "shrink
while valid, record the smallest" template. Notice which constraint
makes the whole technique legal before you write a line.

````reveal Hint 1 — which constraint licenses this?
All values are POSITIVE. That's what makes 'sum ≥ target' monotonic:
growing the window can only raise the sum (never valid → invalid by
growing), and shrinking can only lower it. Without positivity, this
exact reasoning fails — flag that explicitly in your own solution.
````

````reveal Hint 2 — state and the two conditions
State = running window sum. is_valid = "sum ≥ target". Expand: add
nums[right]. Shrink: subtract nums[left], left += 1. Record the window
length every time it's valid, BEFORE shrinking it away.
````

## Brute force, for contrast

All O(n²) subarrays with a running sum, or O(n²) with a fresh sum per
subarray (O(n³) if truly naive) — either way, out at n = 10⁵. The
positive-values guarantee is precisely what upgrades this to a
one-pass, O(n) dynamic window.

## Solution

`````reveal Solution — expand right, shrink left while valid
````tabs
```python
def min_subarray_len(target: int, nums: list[int]) -> int:
    left = 0
    window_sum = 0
    best = float("inf")
    for right in range(len(nums)):
        window_sum += nums[right]                    # expand
        while window_sum >= target:                   # shrink WHILE valid
            best = min(best, right - left + 1)
            window_sum -= nums[left]
            left += 1
    return best if best != float("inf") else 0
```

```typescript
function minSubArrayLen(target: number, nums: number[]): number {
  let left = 0;
  let windowSum = 0;
  let best = Infinity;
  for (let right = 0; right < nums.length; right++) {
    windowSum += nums[right]; // expand
    while (windowSum >= target) {
      // shrink WHILE valid
      best = Math.min(best, right - left + 1);
      windowSum -= nums[left];
      left++;
    }
  }
  return best === Infinity ? 0 : best;
}
```
````

Trace on `target=7, [2,3,1,2,4,3]` (left=0 throughout until noted):

| right | window_sum after expand | valid? | shrinks (best updated each time) | left after |
| --- | --- | --- | --- | --- |
| 0–2 | 2, 5, 6 | no | — | 0 |
| 3 | 8 | yes | best=4 ([2,3,1,2]); shrink → sum=6 | 1 |
| 4 | 10 | yes | best=4 ([3,1,2,4]); shrink → sum=7, **still valid** → best=3 ([1,2,4]); shrink → sum=6 | 3 |
| 5 | 9 | yes | best=3 ([2,4,3]); shrink → sum=7, **still valid** → best=2 ([4,3]); shrink → sum=3 | 5 |

Final best = **2**, matching the expected output. Notice the shrink loop
firing *twice* in a row on right=4 and right=5 — the `while`, not `if`,
is what lets a single expansion trigger multiple shrinks when the
window has slack, each one a candidate for a new best.

```viz
{ "id": "dynamic-window", "data": [2, 3, 1, 2, 4, 3], "target": 7 }
```

```complexity
{
  "time": "O(n)",
  "space": "O(1)",
  "why": "right and left each advance at most n times total across the whole run — the dynamic-window accounting from the lesson. One running sum, no auxiliary structure."
}
```
`````

## Variants

- **Subarray Product Less Than K:** same shape, multiplicative state —
  but requires K > 0 and careful handling of the empty-product edge
  case at window formation.
- **Longest Substring Without Repeating Characters** (next): the
  "longest, upper-bound" mirror of this "shortest, lower-bound"
  problem — same skeleton, opposite template half.
- **With possible negative numbers:** the shrink logic breaks (per the
  concept lesson); the fallback is prefix sums plus a monotonic
  structure — well beyond this module.

```quiz
{
  "question": "The problem guarantees all values in nums are positive. Where exactly does the solution rely on that guarantee, and what breaks without it?",
  "options": [
    "It doesn't rely on positivity — the code works for any integers",
    "The shrink loop's condition `while window_sum >= target` assumes shrinking (removing nums[left]) can only DECREASE window_sum — with a negative value at nums[left], removing it could increase the sum, so a window that looks 'newly invalid' might still be valid, and the loop would stop shrinking too early",
    "Positive values are needed so the sum doesn't overflow"
  ],
  "answer": 1,
  "explanation": "This is the concept lesson's monotonicity requirement made concrete: the shrink loop trusts that removing an element never helps validity. A single negative value anywhere in nums breaks that trust, and the algorithm can silently return a wrong (too-large, or missed) answer without erroring."
}
```
