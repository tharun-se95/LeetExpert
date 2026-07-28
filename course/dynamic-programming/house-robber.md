---
title: House Robber
type: problem
---

## Problem

Given an array `nums` representing the amount of money in each house
along a street, determine the maximum amount you can rob **without
robbing two adjacent houses** (robbing adjacent houses trips the
alarm). (LeetCode 198.)

**Examples**

```text
nums = [1,2,3,1]    →  4   (rob house 0 and house 2: 1 + 3 = 4)
nums = [2,7,9,3,1]  →  12  (rob houses 0, 2, 4: 2 + 9 + 1 = 12)
```

**Constraints:** `1 ≤ nums.length ≤ 100`, values in `[0, 400]`.

## Attempt it first

Same 1D shape as Climbing Stairs — `dp[i]` depends on `dp[i-1]` and
`dp[i-2]` — but the combining operator changes, because this problem
asks for a MAXIMUM, not a count. Before opening anything, think through
what genuine CHOICE exists at house `i`, and why the adjacency
constraint means that choice has a direct consequence for what's
available at house `i-1`.

```sandbox
{
  "id": "house-robber",
  "fn": {
    "python": "rob",
    "javascript": "rob"
  },
  "check": "return",
  "starter": {
    "python": "def rob(nums):\n    # Return the most money robbable without taking two adjacent houses.\n    pass\n",
    "javascript": "function rob(nums) {\n  // Return the most money robbable without taking two adjacent houses.\n}\n"
  },
  "cases": [
    {
      "args": [
        [
          1,
          2,
          3,
          1
        ]
      ],
      "expect": 4
    },
    {
      "args": [
        [
          2,
          7,
          9,
          3,
          1
        ]
      ],
      "expect": 12
    },
    {
      "args": [
        [
          5
        ]
      ],
      "expect": 5
    },
    {
      "args": [
        [
          2,
          1
        ]
      ],
      "expect": 2
    },
    {
      "args": [
        [
          0,
          0,
          0
        ]
      ],
      "expect": 0
    },
    {
      "args": [
        [
          2,
          1,
          1,
          2
        ]
      ],
      "expect": 4
    },
    {
      "args": [
        [
          100,
          1,
          1,
          100
        ]
      ],
      "expect": 200
    }
  ]
}
```

````reveal Hint — at each house, decide: rob it, or don't
At house `i`, there are exactly two options: **rob it** (collect
`nums[i]`, but then house `i-1` is now off-limits, so the best you can
combine with is whatever was achievable using houses up to `i-2`) or
**skip it** (collect nothing extra, but keep whatever was the best
achievable using houses up to `i-1`, unconstrained). The answer at
house `i` is the BETTER of these two options — `max`, not `+`, because
you can only actually take one of them, not both.
````

## Brute force, for contrast

Naive recursion tries both choices (rob or skip) at every house and
takes the better result:

````tabs
```python
def rob_bruteforce(nums: list[int], i: int) -> int:
    if i < 0:
        return 0
    rob_it = nums[i] + rob_bruteforce(nums, i - 2)
    skip_it = rob_bruteforce(nums, i - 1)
    return max(rob_it, skip_it)

def rob_entry(nums: list[int]) -> int:
    return rob_bruteforce(nums, len(nums) - 1)
```

```typescript
function robBruteforce(nums: number[], i: number): number {
  if (i < 0) return 0;
  const robIt = nums[i] + robBruteforce(nums, i - 2);
  const skipIt = robBruteforce(nums, i - 1);
  return Math.max(robIt, skipIt);
}

function robEntry(nums: number[]): number {
  return robBruteforce(nums, nums.length - 1);
}
```
````

This is structurally identical to naive Fibonacci — two recursive calls
at every level, no caching — so it's **O(2ⁿ)**, exploding exactly the
same way, for exactly the same reason (massive overlapping subproblems:
`rob_bruteforce(nums, i-2)` gets reached via many different paths
through the recursion tree).

## The insight

`dp[i] = max(dp[i-1], dp[i-2] + nums[i])` has overlapping subproblems
(same as the brute force's redundant recursion) and optimal
substructure (the best strategy through house `i` is built from the
best strategies through the two houses before it, without needing to
reconsider HOW those earlier optimal values were achieved — only their
VALUES matter for the comparison at house `i`). Both memoization and
tabulation apply directly, exactly as the 1D DP Patterns concept lesson
previewed.

## Solution

`````reveal Solution — memoized top-down, then tabulated bottom-up with O(1) space
````tabs
```python
# Top-down: memoization
def rob_memo(nums: list[int], i: int, memo: dict[int, int]) -> int:
    if i < 0:
        return 0
    if i in memo:
        return memo[i]
    memo[i] = max(rob_memo(nums, i - 1, memo), nums[i] + rob_memo(nums, i - 2, memo))
    return memo[i]

def rob(nums: list[int]) -> int:
    return rob_memo(nums, len(nums) - 1, {})

# Bottom-up: tabulation, space-optimized to two rolling variables
def rob_tabulated(nums: list[int]) -> int:
    prev2, prev1 = 0, 0            # dp[-2], dp[-1] — no houses considered yet
    for num in nums:
        prev2, prev1 = prev1, max(prev1, prev2 + num)
    return prev1
```

```typescript
// Top-down: memoization
function robMemo(nums: number[], i: number, memo: Map<number, number>): number {
  if (i < 0) return 0;
  if (memo.has(i)) return memo.get(i)!;
  const result = Math.max(robMemo(nums, i - 1, memo), nums[i] + robMemo(nums, i - 2, memo));
  memo.set(i, result);
  return result;
}

function rob(nums: number[]): number {
  return robMemo(nums, nums.length - 1, new Map());
}

// Bottom-up: tabulation, space-optimized to two rolling variables
function robTabulated(nums: number[]): number {
  let prev2 = 0,
    prev1 = 0; // dp[-2], dp[-1] — no houses considered yet
  for (const num of nums) {
    [prev2, prev1] = [prev1, Math.max(prev1, prev2 + num)];
  }
  return prev1;
}
```
````

The tabulated version's `prev2, prev1 = prev1, max(prev1, prev2 + num)`
is the entire recurrence, applied once per house in a single pass —
`prev2 + num` is "rob this house," `prev1` is "skip this house," and
`max` picks the better of the two, exactly mirroring the brute force's
`rob_it`/`skip_it` comparison, just without redundant recomputation.

```complexity
{
  "time": "O(n)",
  "space": "O(n) memoized, O(1) tabulated",
  "why": "n distinct subproblems (one per house), each O(1) work beyond its recursive/loop dependency. Tabulated, only the previous two values are ever read, so the table collapses to two variables — identical space-optimization argument to Climbing Stairs."
}
```
`````

## Variants

- **Climbing Stairs** (previous lesson): the same `dp[i-1]`/`dp[i-2]`
  1D shape, but with `+` instead of `max` — direct comparison of when
  each operator applies.
- **House Robber II** (LeetCode 213, not covered): houses are arranged
  in a CIRCLE (first and last are now also adjacent) — solved by running
  this exact algorithm twice, once excluding the first house and once
  excluding the last, taking the max of the two results, since a circle
  breaks into two independent linear cases once you fix which "end" is
  excluded.
- **House Robber III** (this module, later): houses form a BINARY TREE
  instead of a line — the same rob-or-skip choice, but requiring
  Module 17's tree recursion to combine a node's decision with its
  children's, since "adjacent" now means "parent-child" rather than
  "consecutive index."

```quiz
{
  "question": "The recurrence is dp[i] = max(dp[i-1], dp[i-2] + nums[i]). Why does the 'rob it' branch specifically use dp[i-2], and not dp[i-1], as the value to add nums[i] to?",
  "options": [
    "dp[i-2] is used arbitrarily; dp[i-1] would work identically — since both represent 'the best achievable using some number of prior houses,' swapping which one nums[i] combines with wouldn't change the recurrence's correctness",
    "dp[i-2] is used because it requires less memory to access than dp[i-1] — since dp[i-2] was computed earlier and has had more time to settle in cache, referencing it instead of the more recently computed dp[i-1] is a minor performance optimization",
    "If house i is robbed, the adjacency constraint forbids also robbing house i-1 — so the best achievable total combined with robbing house i cannot include ANY strategy that robs house i-1, and dp[i-2] is exactly 'the best achievable using houses up to i-2,' which by construction never depends on whether house i-1 was robbed, making it the only value that's safe to combine with robbing house i"
  ],
  "answer": 2,
  "explanation": "This is the recurrence's core correctness argument: the 'rob it' choice at house i has a direct consequence (house i-1 is now forbidden), so the value it combines with must be one that's guaranteed not to have relied on robbing house i-1. dp[i-2] is precisely that — it's the optimal answer considering only houses 0 through i-2, which never touches house i-1's status at all, making it safe to add nums[i] on top without violating the adjacency constraint."
}
```
