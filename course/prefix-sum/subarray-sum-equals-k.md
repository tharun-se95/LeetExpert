---
title: Subarray Sum Equals K
type: problem
---

## Problem

Given an integer array `nums` (values **may be negative**) and an
integer `k`, return the **number** of contiguous subarrays whose sum
equals `k`.

**Examples**

```text
nums = [1,1,1], k = 2   →  2    ([1,1] at 0-1, [1,1] at 1-2)
nums = [1,2,3], k = 3   →  2    ([1,2] and [3])
nums = [1,-1,0], k = 0  →  3    ([1,-1], [0], [1,-1,0])
```

**Constraints:** 1 ≤ n ≤ 2·10⁴ · values in ±1000 · **can be negative**.

## Attempt it first

The prefix-sum + hash map lesson built this exact algorithm — this
problem is that derivation, asked to be reproduced. The negative-values
constraint is the tell: it rules out Module 11's sliding window (which
needed non-negativity for its shrink logic) and points straight at the
hash-map technique instead.

````reveal Hint — restate the reduction
sum(nums[l..r]) = k  ⟺  prefix[r+1] - prefix[l] = k  ⟺
prefix[l] = prefix[r+1] - k. At each r, ask a hash map: 'how many
earlier prefixes equal prefix[r+1] - k?' Don't forget the seed {0: 1}.
````

## Brute force, for contrast

All O(n²) subarrays with a running sum per starting index: O(n²) — 4×10⁸
at the ceiling, likely too slow. Sliding window doesn't apply (negative
values break its monotonicity requirement, per the Sliding Window
module) — this is the textbook case for prefix-sum + hash map.

## Solution

`````reveal Solution — running prefix sum, hash map of counts
````tabs
```python
def subarray_sum(nums: list[int], k: int) -> int:
    seen: dict[int, int] = {0: 1}       # empty prefix occurs once
    running = 0
    count = 0
    for x in nums:
        running += x
        count += seen.get(running - k, 0)     # earlier prefixes matching
        seen[running] = seen.get(running, 0) + 1
    return count
```

```typescript
function subarraySum(nums: number[], k: number): number {
  const seen = new Map<number, number>([[0, 1]]); // empty prefix occurs once
  let running = 0;
  let count = 0;
  for (const x of nums) {
    running += x;
    count += seen.get(running - k) ?? 0; // earlier prefixes matching
    seen.set(running, (seen.get(running) ?? 0) + 1);
  }
  return count;
}
```
````

Trace on `[1,1,1], k=2`: running sums are 1, 2, 3. At running=1: seek
1-2=-1, not seen, count stays 0; record {0:1, 1:1}. At running=2: seek
2-2=0, seen once, count=1; record {0:1,1:1,2:1}. At running=3: seek
3-2=1, seen once, count=2; done. Matches the expected 2.

```complexity
{
  "time": "O(n) average",
  "space": "O(n)",
  "why": "One pass; O(1)-average map operations per step. Handles negative values correctly because it never assumes any monotonic relationship between window size and sum."
}
```
`````

## Variants

- **Contiguous Array** (next): same skeleton, mapping 0/1 values to
  −1/+1 first — count subarrays summing to exactly 0.
- **Subarray Sums Divisible by K:** same reduction, but keys the map by
  `running % k` instead of `running` — the same modular-arithmetic
  reduction from Module 3, applied to prefix sums.
- **Binary Subarrays With Sum:** identical shape restricted to 0/1
  arrays with `k` an exact target.

```quiz
{
  "question": "For nums = [1,-1,0], k = 0, the answer is 3. Which subarrays produce it, and what does that reveal about the algorithm's handling of ZERO-VALUED elements?",
  "options": [
    "The algorithm fails on arrays containing 0 — a zero-valued element leaves the running sum unchanged, which the hash map interprets as never having advanced position, causing it to silently skip or miscount any subarray that includes that element",
    "Only [1,-1] and [1,-1,0] — single-element zero subarrays don't count, since a subarray consisting of exactly one zero-valued element is defined as trivial and excluded from the count by convention",
    "[1,-1], [0], and [1,-1,0] — a single zero element forms its own valid subarray, which the algorithm counts naturally because running sum stays UNCHANGED across a zero, matching whatever prefix value was already seen"
  ],
  "answer": 2,
  "explanation": "A zero element doesn't change the running sum at all — so if running was already matched by an earlier prefix, a zero element automatically extends that match set by one more subarray. No special case is needed; it falls out of the prefix-difference logic for free."
}
```
