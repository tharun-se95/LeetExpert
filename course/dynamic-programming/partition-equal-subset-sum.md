---
title: Partition Equal Subset Sum
type: problem
---

## Problem

Given an integer array `nums` of positive integers, return `true` if it
can be partitioned into TWO subsets with EQUAL sum. (LeetCode 416.)

**Examples**

```text
nums = [1,5,11,5]  →  true    ([1,5,5] and [11], both sum to 11)
nums = [1,2,3,5]   →  false   (total is 11, odd — can't split evenly)
```

**Constraints:** `1 ≤ nums.length ≤ 200`, values in `[1, 100]`.

## Attempt it first

This is 0/1 knapsack in disguise — the Knapsack-Style DP concept lesson's
exact shape, with each number treated as an "item" of weight (and value)
equal to itself. Before opening anything, work out the reduction: if the
total sum is `S`, what must be true about `S` before any partition into
two equal-sum subsets is even possible, and what SINGLE knapsack
question — about ONE target capacity — is equivalent to "can this array
be split into two equal halves"?

````reveal Hint — reduce to "can a subset sum to exactly total/2"
If the total sum `S` is ODD, an equal split is impossible immediately —
return false without any further computation (two equal integer halves
of an odd number don't exist). If `S` is even, the question "can this
array split into two equal-sum subsets" is EXACTLY equivalent to "does
some subset of `nums` sum to exactly `S / 2`" — because if one subset
sums to `S/2`, the REMAINING elements automatically also sum to `S/2`
(the total minus S/2 is S/2). This reduces the problem to a single 0/1
knapsack question: is `target = S/2` achievable, treating each number as
an item usable at most once (0/1, since each array element can only go
into one of the two subsets).
````

## Brute force, for contrast

Naive recursion: for each number, try including it in "the subset being
built toward target" or excluding it:

````tabs
```python
def can_partition_bruteforce(nums: list[int], i: int, remaining: int) -> bool:
    if remaining == 0:
        return True
    if i == len(nums) or remaining < 0:
        return False
    return (can_partition_bruteforce(nums, i + 1, remaining - nums[i])   # include nums[i]
            or can_partition_bruteforce(nums, i + 1, remaining))         # exclude nums[i]
```

```typescript
function canPartitionBruteforce(nums: number[], i: number, remaining: number): boolean {
  if (remaining === 0) return true;
  if (i === nums.length || remaining < 0) return false;
  return (
    canPartitionBruteforce(nums, i + 1, remaining - nums[i]) || // include nums[i]
    canPartitionBruteforce(nums, i + 1, remaining) // exclude nums[i]
  );
}
```
````

O(2ⁿ) — every element independently branches into include/exclude,
exactly the 0/1 knapsack shape's naive recursion, with the same
overlapping-subproblems disease as everything else in this module (the
same `(i, remaining)` pair is reached via many different subsets of
earlier include/exclude decisions).

## The insight

`dp[i][capacity]` = "can the first `i` numbers reach exactly
`capacity`" — this is 0/1 knapsack's boolean variant (the Knapsack-Style
DP concept lesson's `dp[i-1][...]` referencing pattern applies
unchanged; only the combining operator changes from `max` to logical
`OR`, since this is a reachability question, not an optimization). The
2D table can then be space-optimized to 1D — but ONLY with the reverse-
iteration discipline the concept lesson flagged, since this is genuinely
0/1 (each number usable once).

## Solution

`````reveal Solution — 1D boolean DP, iterating capacity in REVERSE
````tabs
```python
def can_partition(nums: list[int]) -> bool:
    total = sum(nums)
    if total % 2 != 0:
        return False                          # odd total — no equal split possible
    target = total // 2

    dp = [False] * (target + 1)
    dp[0] = True                              # sum 0 is always achievable (take nothing)

    for num in nums:
        for capacity in range(target, num - 1, -1):   # REVERSE — see explanation below
            if dp[capacity - num]:
                dp[capacity] = True

    return dp[target]
```

```typescript
function canPartition(nums: number[]): boolean {
  const total = nums.reduce((a, b) => a + b, 0);
  if (total % 2 !== 0) return false; // odd total — no equal split possible
  const target = total / 2;

  const dp = new Array(target + 1).fill(false);
  dp[0] = true; // sum 0 is always achievable (take nothing)

  for (const num of nums) {
    for (let capacity = target; capacity >= num; capacity--) {
      // REVERSE — see explanation below
      if (dp[capacity - num]) dp[capacity] = true;
    }
  }

  return dp[target];
}
```
````

**Why the capacity loop MUST run in reverse.** This is exactly the
Knapsack-Style DP concept lesson's flagged subtlety, made concrete. In
the 2D formulation, `dp[i][capacity]` reads `dp[i-1][capacity - num]` —
the PREVIOUS item's row, guaranteeing `num` is used at most once. When
collapsing to a single 1D array reused across every item, that
"previous row" guarantee has to be reproduced through ITERATION ORDER
instead of a separate row index. Iterating `capacity` from HIGH to LOW
means that when `dp[capacity - num]` is read, it still holds its value
from BEFORE this item's pass began (since only higher capacities have
been touched so far this pass) — correctly simulating "the previous
row." Iterating forward (low to high) would let `dp[capacity - num]`
already reflect THIS SAME item having been used to reach the lower
capacity earlier in the same pass — silently allowing the same number to
be counted twice, turning 0/1 behavior into unbounded behavior by
accident.

```complexity
{
  "time": "O(n · target)",
  "space": "O(target)",
  "why": "n items, each doing an O(target) inner loop — O(n · target) total, where target = totalSum / 2. Space is the 1D dp array, O(target), down from the 2D table's O(n · target) via the reverse-iteration trick."
}
```
`````

## Variants

- **Knapsack-Style DP** (concept lesson, this module): the general 0/1
  knapsack recurrence and the exact reverse-iteration requirement this
  problem demonstrates concretely.
- **Target Sum** (LeetCode 494, not covered): assign `+` or `-` to each
  number to reach a target sum — reduces to this exact subset-sum
  problem via algebra (the "positive" subset's sum `P` satisfies `P -
  (total - P) = target`, so `P = (target + total) / 2`, turning it into
  "does a subset sum to P").
- **Coin Change** (this module): the UNBOUNDED knapsack sibling — no
  reverse iteration needed there, since coins ARE meant to be reused, a
  direct contrast for when the reverse-iteration rule applies and when
  it doesn't.

```quiz
{
  "question": "If the capacity loop iterated LOW to HIGH instead of HIGH to LOW, why specifically would that break the 'each number used at most once' 0/1 constraint, rather than just being a cosmetic ordering difference?",
  "options": [
    "Low-to-high iteration would cause the loop to skip some capacities entirely, producing an incomplete result — since the loop bounds are computed relative to num, iterating upward instead of downward would cause certain capacity values to fall outside the range the loop actually visits",
    "It wouldn't actually break anything — both iteration orders produce identical results for this problem, since dp[capacity - num] holds the same value regardless of which direction the outer capacity loop happens to traverse",
    "With low-to-high iteration, dp[capacity - num] may have ALREADY been updated earlier in this SAME pass over num (since a smaller capacity is processed before a larger one), meaning that update might already reflect num having been included — reading it again while processing a larger capacity would let num's value be added a second time within the same item's pass, effectively reusing it"
  ],
  "answer": 2,
  "explanation": "The whole point of reverse iteration is to read dp[capacity - num] in a state that has NOT yet been touched by the current item's own pass — simulating 'the previous row' from the 2D formulation. Forward iteration processes smaller capacities first, so by the time a larger capacity is reached within the SAME pass over the SAME num, dp[capacity - num] could already carry that num's contribution from earlier in this very pass — letting num be silently double-counted, exactly the unbounded-reuse behavior 0/1 knapsack must forbid."
}
```
