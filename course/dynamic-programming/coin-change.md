---
title: Coin Change
type: problem
---

## Problem

Given an array `coins` of distinct coin denominations and a target
`amount`, return the FEWEST number of coins needed to make exactly
`amount` (unlimited supply of each denomination), or `-1` if it's
impossible. (LeetCode 322.)

**Examples**

```text
coins = [1,2,5], amount = 11  →  3   (5 + 5 + 1)
coins = [2],      amount = 3  →  -1  (odd amount, only even coin)
```

**Constraints:** `1 ≤ coins.length ≤ 12`, `1 ≤ coins[i] ≤ 2³¹-1`,
`0 ≤ amount ≤ 10⁴`.

## Attempt it first

This is unbounded knapsack (this module's Knapsack-Style DP concept
lesson) — each coin denomination can be reused without limit. Before
opening anything, and crucially BEFORE reaching for DP at all: think
through why the seemingly-obvious greedy strategy — "always use the
largest coin that fits" — is WRONG in general, using the concrete
counterexample the Greedy module (Module 22) raised: denominations
`{1, 3, 4}`, target `6`. Work out what greedy produces versus what the
true optimum is, and only then think about the DP recurrence.

```sandbox
{
  "id": "coin-change",
  "fn": {
    "python": "coin_change",
    "javascript": "coinChange"
  },
  "check": "return",
  "starter": {
    "python": "def coin_change(coins, amount):\n    # Return the fewest coins summing to amount, or -1 if impossible.\n    pass\n",
    "javascript": "function coinChange(coins, amount) {\n  // Return the fewest coins summing to amount, or -1 if impossible.\n}\n"
  },
  "cases": [
    {
      "args": [
        [
          1,
          2,
          5
        ],
        11
      ],
      "expect": 3
    },
    {
      "args": [
        [
          2
        ],
        3
      ],
      "expect": -1
    },
    {
      "args": [
        [
          1
        ],
        0
      ],
      "expect": 0
    },
    {
      "args": [
        [
          2
        ],
        0
      ],
      "expect": 0
    },
    {
      "args": [
        [
          1,
          3,
          4
        ],
        6
      ],
      "expect": 2
    },
    {
      "args": [
        [
          5
        ],
        5
      ],
      "expect": 1
    },
    {
      "args": [
        [
          186,
          419,
          83,
          408
        ],
        6249
      ],
      "expect": 20
    },
    {
      "args": [
        [
          7,
          9
        ],
        11
      ],
      "expect": -1
    }
  ]
}
```

````reveal Hint — greedy fails; build up dp[amount] from smaller amounts
Greedy on {1,3,4} targeting 6: take 4 (largest that fits), leaving 2;
take 1, leaving 1; take 1, leaving 0 — that's 3 coins (4+1+1). But 3+3=6
uses only 2 coins — greedy's "always take the biggest" heuristic missed
it, exactly as Module 22 warned: a plausible-looking greedy rule needs
PROOF, and this one has none, because it's false.

The DP fix: `dp[a]` = fewest coins to make amount `a`. For each coin
denomination `c` that fits (`c <= a`), using that coin as part of the
solution means the REST of the amount, `a - c`, must be made optimally
too — so `dp[a] = 1 + min(dp[a - c] for every coin c that fits)`. Trying
EVERY coin and taking the best, rather than greedily committing to the
largest one, is what recovers the true optimum.
````

## Brute force, for contrast

Naive recursion: try every coin at every remaining amount, take the
minimum:

````tabs
```python
def coin_change_bruteforce(coins: list[int], amount: int) -> int:
    if amount == 0:
        return 0
    if amount < 0:
        return float("inf")
    best = float("inf")
    for coin in coins:
        best = min(best, 1 + coin_change_bruteforce(coins, amount - coin))
    return best
```

```typescript
function coinChangeBruteforce(coins: number[], amount: number): number {
  if (amount === 0) return 0;
  if (amount < 0) return Infinity;
  let best = Infinity;
  for (const coin of coins) {
    best = Math.min(best, 1 + coinChangeBruteforce(coins, amount - coin));
  }
  return best;
}
```
````

This explores every possible SEQUENCE of coins, which massively
overlaps: `amount = 6` reached via `1+1+4`, `4+1+1`, `1+4+1`, etc. are
all the SAME sub-amount (2 remaining) recomputed from scratch every
time it's reached by a different coin order — exponential blowup, the
same disease as naive Fibonacci.

## The insight

`dp[a] = 1 + min(dp[a - c] for c in coins if c <= a)` has overlapping
subproblems (the same remaining amount is reached via many different
coin orderings) and optimal substructure (the fewest-coins solution for
amount `a` is built from the fewest-coins solution for SOME smaller
amount `a - c`, and — crucially — trying every possible last coin `c`
and taking the min is what replaces the greedy's unproven single guess
with a provably-correct exhaustive comparison).

## Solution

`````reveal Solution — memoized top-down, then tabulated bottom-up
````tabs
```python
# Top-down: memoization
def coin_change_memo(coins: list[int], amount: int, memo: dict[int, int]) -> int:
    if amount == 0:
        return 0
    if amount < 0:
        return float("inf")
    if amount in memo:
        return memo[amount]
    best = float("inf")
    for coin in coins:
        best = min(best, 1 + coin_change_memo(coins, amount - coin, memo))
    memo[amount] = best
    return best

def coin_change(coins: list[int], amount: int) -> int:
    result = coin_change_memo(coins, amount, {})
    return result if result != float("inf") else -1

# Bottom-up: tabulation
def coin_change_tabulated(coins: list[int], amount: int) -> int:
    dp = [float("inf")] * (amount + 1)
    dp[0] = 0                                  # base case: 0 coins for amount 0
    for a in range(1, amount + 1):
        for coin in coins:
            if coin <= a:
                dp[a] = min(dp[a], 1 + dp[a - coin])
    return dp[amount] if dp[amount] != float("inf") else -1
```

```typescript
// Top-down: memoization
function coinChangeMemo(coins: number[], amount: number, memo: Map<number, number>): number {
  if (amount === 0) return 0;
  if (amount < 0) return Infinity;
  if (memo.has(amount)) return memo.get(amount)!;
  let best = Infinity;
  for (const coin of coins) {
    best = Math.min(best, 1 + coinChangeMemo(coins, amount - coin, memo));
  }
  memo.set(amount, best);
  return best;
}

function coinChange(coins: number[], amount: number): number {
  const result = coinChangeMemo(coins, amount, new Map());
  return result === Infinity ? -1 : result;
}

// Bottom-up: tabulation
function coinChangeTabulated(coins: number[], amount: number): number {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0; // base case: 0 coins for amount 0
  for (let a = 1; a <= amount; a++) {
    for (const coin of coins) {
      if (coin <= a) {
        dp[a] = Math.min(dp[a], 1 + dp[a - coin]);
      }
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}
```
````

The tabulated version's inner loop over `coins` at every amount `a` is
exactly "try every possible last coin used" — the exhaustive comparison
that recovers the true optimum where greedy's single guess failed.
Unlike the 0/1 knapsack case from the concept lesson, there's no need
to iterate capacity in reverse here — coins ARE meant to be reused, so
reading `dp[a - coin]` (a smaller, already-finalized amount within the
SAME forward pass) is exactly correct, not a bug to guard against.

```complexity
{
  "time": "O(amount · len(coins))",
  "space": "O(amount)",
  "why": "amount+1 distinct subproblems (amounts 0 through target), each doing O(len(coins)) work trying every denomination. Space is the dp array/memo table, O(amount) entries."
}
```
`````

## Variants

- **Knapsack-Style DP** (concept lesson, this module): the general
  unbounded-knapsack recurrence this problem instantiates directly.
- **Coin Change II** (LeetCode 518, not covered): counts the NUMBER OF
  WAYS to make the amount, rather than the fewest coins — same unbounded
  reuse, but `+` replaces `min` as the combining operator (counting, not
  optimizing), exactly the 1D DP Patterns lesson's operator-selection
  principle applied to a knapsack-shaped problem.
- **The Greedy Choice Property & Proving Correctness** (Module 22): the
  concept lesson whose {1,3,4}-targeting-6 counterexample is the direct
  motivation for why this problem needs DP's exhaustive comparison
  rather than a greedy largest-coin-first shortcut.

```quiz
{
  "question": "Greedy 'always take the largest coin that fits' fails on coins {1,3,4}, amount 6 (giving 4+1+1=3 coins instead of the optimal 3+3=2 coins). Why does DP's dp[a] = 1 + min(dp[a-c] for all coins c) avoid this specific failure?",
  "options": [
    "DP works because it processes coins from smallest to largest, unlike greedy which processes largest to smallest — reversing the order in which denominations are considered is what lets DP recover solutions like 3+3 that greedy's largest-first scan skips over",
    "Greedy commits to ONE choice (the largest coin) at each step without ever reconsidering it, so a locally-appealing choice that leads to a worse overall result is never corrected; DP instead computes dp[a-c] for EVERY possible coin c and takes the minimum, meaning it effectively considers ALL possible 'last coins used' and keeps whichever leads to the globally best total, rather than committing to a single unproven heuristic",
    "DP avoids the failure by trying coins in a different order than greedy — since DP's inner loop happens to iterate the coins array in a sequence distinct from greedy's largest-to-smallest scan, that different traversal order is what produces the better answer"
  ],
  "answer": 1,
  "explanation": "The structural difference is exhaustive comparison versus a single, unproven guess. Greedy's 'largest fits' rule has no correctness proof for general coin sets — as Module 22 established, an unproven greedy rule should be assumed wrong until proven otherwise. DP's min over every possible last coin used doesn't rely on any heuristic about which coin is 'obviously' best; it tries all of them and keeps the genuinely best result, which is why it recovers the true optimum (3+3) that greedy's single fixed strategy missed."
}
```
