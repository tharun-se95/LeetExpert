---
title: Best Time to Buy & Sell Stock
type: problem
---

## Problem

`prices[i]` is a stock's price on day i. Choose one day to buy and a
**later** day to sell to maximize profit. Return the maximum profit, or 0
if no profitable trade exists.

**Examples**

```text
prices = [7,1,5,3,6,4]  →  5   (buy at 1 on day 1, sell at 6 on day 4)
prices = [7,6,4,3,1]    →  0   (prices only fall — don't trade)
```

**Constraints:** 1 ≤ n ≤ 10⁵ · 0 ≤ price ≤ 10⁴.

## Attempt it first

This one isn't a write-pointer problem — it's here to teach a different
single-pass discipline. The constraint n ≤ 10⁵ rules out one obvious
approach (you know which, and you know why — you read constraints now).

````reveal Hint 1 — what makes a day a good SELL day?
Selling on day i earns prices[i] − (the cheapest price on ANY earlier
day). If you knew that "cheapest so far" for every i, each day's best
profit is one subtraction. Can you know it without a second pass?
````

````reveal Hint 2 — carry state forward
Scan left to right, maintaining min_so_far. At each day: candidate profit
= prices[i] − min_so_far; update the best; update min_so_far. One pass,
two variables. Convince yourself no pair (buy < sell) escapes this
accounting.
````

## Brute force, for contrast

Try every (buy, sell) pair with buy < sell: the C(n,2) ≈ n²/2 pair-space
from the Math module — 5 × 10⁹ pairs at n = 10⁵. The constraint said no.

## The insight

> For a fixed sell day, the best buy day is *fully determined*: the
> minimum price before it. So instead of searching pairs, sweep sell days
> in order and drag the running minimum along. The pair search collapses
> because one side of the pair has a closed-form answer.

This "sweep + running extreme" move is your first taste of a huge family:
prefix minimums here, prefix sums in Module 12, DP's "best ending here"
in Stage 4 (this problem *is* Kadane's algorithm in disguise — sell-day
profit = prices[i] − min_prefix is the reduction).

## Solution

`````reveal Solution — one pass, two variables
````tabs
```python
def max_profit(prices: list[int]) -> int:
    min_so_far = prices[0]
    best = 0
    for price in prices[1:]:
        best = max(best, price - min_so_far)   # sell today?
        min_so_far = min(min_so_far, price)    # or is today the new best buy?
    return best
```

```typescript
function maxProfit(prices: number[]): number {
  let minSoFar = prices[0];
  let best = 0;
  for (let i = 1; i < prices.length; i++) {
    best = Math.max(best, prices[i] - minSoFar); // sell today?
    minSoFar = Math.min(minSoFar, prices[i]); // or new best buy?
  }
  return best;
}
```
````

Invariant after processing day i: *min_so_far = cheapest price in days
[0..i]; best = max profit using any sell day in [1..i]*. Both updates
preserve it, and the order matters — computing the day's profit before
updating the minimum enforces buy-strictly-before-sell (buying and
selling same-day yields 0, which `best` starts at anyway).

```complexity
{
  "time": "O(n)",
  "space": "O(1)",
  "why": "One pass; two scalars of carried state. This is optimal — every price must be examined, so Ω(n) is forced."
}
```
`````

## Variants

- **Unlimited transactions** (buy/sell many times): sum every positive
  day-to-day rise — a greedy whose correctness argument lives in Module 22.
- **Max subarray sum (Kadane's):** apply this exact sweep to day-to-day
  *differences*; covered as the Prefix Sum module's capstone.
- **At most two transactions:** needs DP state — Stage 4.

```quiz
{
  "questions": [
    {
      "question": "Why does the one-pass algorithm never miss the optimal (buy, sell) pair?",
      "options": [
        "It implicitly checks all pairs — when the optimal sell day arrives, min_so_far already equals the optimal buy price, since the buy day is earlier and minima only improve",
        "It assumes prices are sorted",
        "It doesn't — it's a heuristic that happens to pass the tests"
      ],
      "answer": 0,
      "explanation": "Fix the optimal pair (b, s). When the sweep reaches s, min_so_far ≤ prices[b] (day b was already seen), so best is updated with at least the optimal profit. The invariant is the proof."
    },
    {
      "question": "What if the two update lines were swapped — min first, then profit?",
      "options": [
        "Nothing changes",
        "Same-day buy-and-sell becomes possible, computing prices[i] − prices[i] = 0 — which is harmless here but the invariant becomes 'sell on or after buy'; in variants where same-day trades are forbidden with different payoffs, the order is load-bearing",
        "The algorithm breaks entirely"
      ],
      "answer": 1,
      "explanation": "Here profit-vs-itself is 0 and best starts at 0, so answers match. But noticing that the statement's guarantee shifted is the level of care in-place and sweep algorithms demand — update order IS part of the invariant."
    }
  ]
}
```
