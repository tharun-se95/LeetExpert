---
title: Knapsack-Style DP
type: concept
---

## The shape: items, a capacity, a choice per item

**Knapsack** DP applies whenever you're selecting from a set of items,
each with some cost, under a total capacity constraint, optimizing some
value. The canonical state is `dp[i][capacity]` = the best achievable
value using only the first `i` items, within `capacity` budget. This
lesson names the two variants and their key implementation difference;
Coin Change (unbounded) and Partition Equal Subset Sum (0/1) get full
problem treatment later in this module.

## 0/1 knapsack: each item used at most once

The defining constraint: item `i` is either included or excluded,
never reused. The recurrence considers item `i` explicitly at each
step: either skip it (`dp[i-1][capacity]`, unchanged) or take it (add
its value to the best achievable with the REMAINING capacity, using
only items BEFORE `i` — `dp[i-1][capacity - weight[i]] + value[i]`):

```text
dp[i][capacity] = max(dp[i-1][capacity], dp[i-1][capacity - weight[i]] + value[i])
```

The critical detail: both branches reference `dp[i-1][...]` — the
PREVIOUS item row, never the current one. This is what enforces "used
at most once": by the time item `i` is being decided, its own
contribution can only be added on top of a state that has not yet
included item `i` at all.

```diagram
{
  "id": "dp-table",
  "mode": "2d",
  "cols": 5,
  "values": [0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 0, 0, 3, 4, 4, 0, 0, 3, 4, 6],
  "currentCell": [3, 4],
  "caption": "0/1 knapsack: rows = items, cols = capacity"
}
```


**Partition Equal Subset Sum** (full treatment later) is 0/1 knapsack
in disguise: "can a subset sum to exactly `target`" is "is `dp[n][target]`
achievable," where every number is an item with weight equal to its own
value, and capacity is the target sum.

## Unbounded knapsack: items reusable without limit

The defining constraint flips: the same item can be used any number of
times. The recurrence differs in exactly one place — the "take it"
branch references the CURRENT row, not the previous one, since reusing
item `i` again is legal:

```text
dp[i][capacity] = max(dp[i-1][capacity], dp[i][capacity - weight[i]] + value[i])
```

That single index change (`dp[i][...]` instead of `dp[i-1][...]` in the
"take it" branch) is the entire difference between 0/1 and unbounded
knapsack — worth staring at until it's unmistakable, since it's exactly
the kind of off-by-one-feeling detail that produces a silently wrong
answer rather than a crash.

**Coin Change** (full treatment later) is unbounded knapsack: "fewest
coins to make an amount" reuses each coin denomination without limit,
which is why its recurrence allows revisiting the same coin
denomination arbitrarily many times while building up the target
amount.

## The space-optimization subtlety this introduces

Both knapsack variants can be space-optimized to a 1D rolling array (the
previous lesson's technique), but 0/1 knapsack has an extra
requirement: the capacity dimension must be iterated in REVERSE
(decreasing) order when collapsing to 1D, specifically to preserve the
"each item at most once" property — iterating forward would let a
single item's contribution be read and reused within the same row's
update, silently turning 0/1 behavior into unbounded behavior. This
subtlety is demonstrated concretely in the Partition Equal Subset Sum
problem lesson, where getting the iteration direction wrong is a
realistic, easy-to-make bug.

```quiz
{
  "question": "The 0/1 knapsack recurrence's 'take it' branch reads dp[i-1][capacity - weight[i]], while unbounded knapsack's reads dp[i][capacity - weight[i]] — differing only in whether the row index is i-1 or i. Why does this single difference correctly control whether an item can be reused?",
  "options": [
    "It doesn't actually matter which row is referenced; both produce identical results — since dp[i-1][...] and dp[i][...] both eventually converge to the same table values once the full grid is filled, the choice of row is purely stylistic",
    "The difference only affects performance (which row is faster to access in memory), not correctness — since both rows live in the same table and are equally cheap to read, referencing one instead of the other only changes cache locality, not the final computed values",
    "dp[i-1][...] reads a state that was computed WITHOUT ever considering item i at all, so item i's value can be added on top exactly once, no matter how the capacity was used in that state; dp[i][...] reads a state that MAY ALREADY include item i's contribution (since row i is being built as you go), so referencing it again lets item i's value be layered on top of a selection that could already contain it — i.e. reused"
  ],
  "answer": 2,
  "explanation": "Row i-1 represents 'the best achievable using only items strictly before i' — a state item i has never touched. Building item i's own 'take it' option from that row guarantees item i contributes exactly once. Row i, in contrast, is the row CURRENTLY being computed, which for capacities already processed within this same row may already reflect a choice to include item i. Referencing that row lets the recurrence effectively pick item i again on top of a selection that could already have it — which is precisely the unbounded-reuse behavior, not a coincidence of implementation."
}
```
