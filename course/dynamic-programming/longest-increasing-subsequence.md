---
title: Longest Increasing Subsequence
type: problem
---

## Problem

Given an integer array `nums`, return the length of the longest STRICTLY
increasing subsequence (elements need not be contiguous, but must
preserve their original relative order). (LeetCode 300.)

**Examples**

```text
nums = [10,9,2,5,3,7,101,18]  →  4    (2, 3, 7, 18 — or 2, 3, 7, 101)
nums = [0,1,0,3,2,3]           →  4    (0, 1, 2, 3)
```

**Constraints:** `1 ≤ nums.length ≤ 2500`.

## Attempt it first

Two distinct solutions worth building, in order: first the O(n²) DP
(genuinely the more natural first attempt), and then — as a real
optimization, not just a faster implementation of the same idea — an
O(n log n) approach borrowed from binary search. Before opening
anything, define `dp[i]` = the length of the longest increasing
subsequence that ENDS AT index `i` specifically (not "using the first i
elements" — this distinction matters), and work out the recurrence in
terms of all `j < i` with `nums[j] < nums[i]`.

```sandbox
{
  "id": "longest-increasing-subsequence",
  "fn": {
    "python": "length_of_lis",
    "javascript": "lengthOfLIS"
  },
  "check": "return",
  "starter": {
    "python": "def length_of_lis(nums):\n    # Return the length of the longest strictly increasing subsequence.\n    pass\n",
    "javascript": "function lengthOfLIS(nums) {\n  // Return the length of the longest strictly increasing subsequence.\n}\n"
  },
  "cases": [
    {
      "args": [
        [
          10,
          9,
          2,
          5,
          3,
          7,
          101,
          18
        ]
      ],
      "expect": 4
    },
    {
      "args": [
        [
          0,
          1,
          0,
          3,
          2,
          3
        ]
      ],
      "expect": 4
    },
    {
      "args": [
        [
          7,
          7,
          7,
          7
        ]
      ],
      "expect": 1
    },
    {
      "args": [
        [
          1
        ]
      ],
      "expect": 1
    },
    {
      "args": [
        [
          5,
          4,
          3,
          2,
          1
        ]
      ],
      "expect": 1
    },
    {
      "args": [
        [
          1,
          2,
          3,
          4,
          5
        ]
      ],
      "expect": 5
    },
    {
      "args": [
        [
          4,
          10,
          4,
          3,
          8,
          9
        ]
      ],
      "expect": 3
    }
  ]
}
```

````reveal Hint — dp[i] looks BACKWARD at every smaller, earlier, smaller-valued element
`dp[i]` = 1 (the element by itself is always a valid subsequence of
length 1) plus the best `dp[j]` among every earlier index `j < i` where
`nums[j] < nums[i]` (since extending that subsequence with `nums[i]`
keeps it strictly increasing). The final answer is the MAX over all
`dp[i]`, not `dp[n-1]` — the longest increasing subsequence doesn't have
to end at the last element.
````

## Brute force / the O(n²) DP

`````reveal Solution — O(n²) DP, looking back at every valid predecessor
````tabs
```python
def length_of_lis(nums: list[int]) -> int:
    n = len(nums)
    dp = [1] * n                          # every element alone is length 1
    for i in range(n):
        for j in range(i):
            if nums[j] < nums[i]:
                dp[i] = max(dp[i], dp[j] + 1)
    return max(dp)
```

```typescript
function lengthOfLIS(nums: number[]): number {
  const n = nums.length;
  const dp = new Array(n).fill(1); // every element alone is length 1
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i]) {
        dp[i] = Math.max(dp[i], dp[j] + 1);
      }
    }
  }
  return Math.max(...dp);
}
```
````

For each `i`, the inner loop tries EVERY earlier index as a possible
predecessor and keeps the best resulting chain length — this is
overlapping subproblems (many `i`'s inner loops re-examine the same
earlier `dp[j]` values) with optimal substructure (the longest chain
ending at `i` is built from the longest chain ending at whichever valid
predecessor `j` gives the best result).

```complexity
{
  "time": "O(n²)",
  "space": "O(n)",
  "why": "For each of n indices, the inner loop scans up to n earlier indices — O(n²) total. Space is the dp array."
}
```
`````

## The O(n log n) improvement: patience sorting with binary search

`````reveal Optimization — maintain a "tails" array, binary search for the insertion point
Maintain an array `tails`, where `tails[k]` holds the SMALLEST possible
tail value among all increasing subsequences of length `k+1` found so
far. For each new number, binary search `tails` for the leftmost
position where it can either extend `tails` (if it's larger than
everything currently there) or REPLACE an existing entry (if it's
smaller than some entry, since a smaller tail value at the same length
gives future numbers a better — easier to extend — chance).

````tabs
```python
import bisect

def length_of_lis_fast(nums: list[int]) -> int:
    tails: list[int] = []
    for num in nums:
        pos = bisect.bisect_left(tails, num)   # leftmost index where num fits
        if pos == len(tails):
            tails.append(num)                   # num extends the longest chain so far
        else:
            tails[pos] = num                    # num improves (lowers) an existing tail
    return len(tails)
```

```typescript
function lengthOfLISFast(nums: number[]): number {
  const tails: number[] = [];
  for (const num of nums) {
    let lo = 0,
      hi = tails.length;
    while (lo < hi) {
      // binary search: leftmost index where num fits
      const mid = (lo + hi) >> 1;
      if (tails[mid] < num) lo = mid + 1;
      else hi = mid;
    }
    if (lo === tails.length) {
      tails.push(num); // num extends the longest chain so far
    } else {
      tails[lo] = num; // num improves (lowers) an existing tail
    }
  }
  return tails.length;
}
```
````

**Why `tails` is correct despite NOT always being a real subsequence.**
This is the subtle part worth getting exactly right: after processing
some prefix of `nums`, `tails` is NOT necessarily an actual increasing
subsequence that appears in `nums` — it's a record of "the best (smallest)
tail achievable for each possible length seen so far," and those
best-tails can come from DIFFERENT candidate subsequences at different
lengths. What IS guaranteed, and is all that's actually needed, is that
`tails.length` always equals the TRUE longest increasing subsequence
length found in the prefix processed so far. This holds because: (1)
appending only happens when a number extends the longest chain found so
far, which correctly grows the answer by exactly the cases that should
grow it, and (2) replacing an existing entry with a smaller value can
only ever HELP future numbers extend a chain of that length (a smaller
tail is easier to beat), never hurt — so replacement never causes the
algorithm to under-count.

```complexity
{
  "time": "O(n log n)",
  "space": "O(n)",
  "why": "n numbers, each doing one binary search over a `tails` array of length at most n — O(log n) per number, O(n log n) total. This beats the O(n²) DP by replacing the linear inner scan (checking every earlier index) with a binary search enabled by tails being maintained in sorted order at all times."
}
```
`````

## Variants

- **2D DP Patterns** (concept lesson, this module): the O(n²) version's
  `dp[i]` looking back at every `j < i` is a 1D-over-a-sequence pattern,
  though its O(n) inner scan rather than O(1) lookup distinguishes it
  from the simplest 1D shapes (Climbing Stairs, House Robber).
- **The Invariant-Driven Template** (Module 13, Binary Search): the
  `tails` optimization's binary search is a direct application of that
  module's boundary-search technique, finding the correct insertion
  point rather than an exact match.
- **Russian Doll Envelopes** (LeetCode 354, not covered): a 2D
  generalization of LIS — sort by one dimension, then find the LIS on
  the other, reusing the O(n log n) technique as a subroutine.

```quiz
{
  "question": "The `tails` array in the O(n log n) solution is generally NOT an actual increasing subsequence present in the input. Why is this acceptable — why doesn't it invalidate the algorithm's correctness?",
  "options": [
    "The algorithm only needs tails.length to correctly equal the TRUE longest increasing subsequence length at every point — it never claims tails itself IS an actual subsequence, and the append/replace rules are specifically designed so that length grows exactly when the true LIS length grows, and shrinks never (replacement changes a value but never the array's length), which is the only property the algorithm's final answer actually depends on",
    "It's acceptable because the problem only asks for a subsequence's length, so any incorrect subsequence with the right count is fine to report as the answer — since correctness is measured purely by the numeric output, the algorithm is free to construct tails however is most convenient internally",
    "It IS always a real subsequence; the claim that it isn't is a common misconception — every value ever stored in tails corresponds to an element that was genuinely part of some increasing run actually present in the input array, in the exact order tails records them"
  ],
  "answer": 0,
  "explanation": "The algorithm's contract is narrower than 'produce a valid subsequence' — it's 'produce the correct LENGTH.' tails.length tracking the true LIS length is what's actually proven and actually used; the individual VALUES in tails are a bookkeeping device (the best-possible-tail-per-length) that helps maintain that length correctly, not a subsequence to be read out as an answer. Confusing 'this structure tracks the right count' with 'this structure IS the answer object' is the exact misunderstanding this quiz question is checking for."
}
```
