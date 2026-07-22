---
title: Climbing Stairs
type: problem
---

## Problem

You're climbing a staircase with `n` steps. Each move, you can climb
either 1 or 2 steps. Return the number of DISTINCT ways to reach the
top. (LeetCode 70.)

**Examples**

```text
n = 2  →  2   (1+1, or 2)
n = 3  →  3   (1+1+1, 1+2, 2+1)
```

**Constraints:** `1 ≤ n ≤ 45`.

## Attempt it first

This is the simplest possible 1D DP, previewed in this module's 1D DP
Patterns concept lesson — it's worth deriving the recurrence yourself
before opening anything. Think about the very LAST move made to reach
step `n`: what are the only two possibilities for that final move, and
what does each one imply about how many ways exist to have reached the
step just before it?

````reveal Hint — condition on the last move, not the first
The last move to reach step n is either a 1-step move (from step n-1)
or a 2-step move (from step n-2) — there are no other options. Every
distinct way to reach step n therefore falls into exactly one of these
two categories, with no overlap between them (a specific sequence of
moves has one specific last move). So the total count is the SUM of
"ways to reach n-1" and "ways to reach n-2" — which is the Fibonacci
recurrence from the From Recursion to Memoization concept lesson, in
disguise.
````

## Brute force, for contrast

The direct translation of "last move is 1 step or 2 steps" into naive
recursion:

````tabs
```python
def climb_stairs_bruteforce(n: int) -> int:
    if n <= 2:
        return n
    return climb_stairs_bruteforce(n - 1) + climb_stairs_bruteforce(n - 2)
```

```typescript
function climbStairsBruteforce(n: number): number {
  if (n <= 2) return n;
  return climbStairsBruteforce(n - 1) + climbStairsBruteforce(n - 2);
}
```
````

This is exactly naive Fibonacci with different base cases, so it
inherits naive Fibonacci's exact flaw: overlapping subproblems computed
repeatedly from scratch, giving **O(2ⁿ)** time — hopelessly slow for `n`
even in the 40s, despite the constraint explicitly allowing `n` up to
45.

## The insight

`ways(n) = ways(n-1) + ways(n-2)` has both properties the From
Recursion to Memoization lesson requires: overlapping subproblems (the
naive tree recomputes the same `n` values over and over) and optimal
substructure (the count for `n` is exactly determined by the counts for
`n-1` and `n-2`, no reconsideration needed). Both memoization (cache
each `ways(k)` the first time it's computed) and tabulation
(build the answers bottom-up in a loop) apply directly.

## Solution

`````reveal Solution — memoized top-down, then tabulated bottom-up with O(1) space
````tabs
```python
# Top-down: memoization
def climb_stairs_memo(n: int, memo: dict[int, int] | None = None) -> int:
    if memo is None:
        memo = {}
    if n <= 2:
        return n
    if n in memo:
        return memo[n]
    memo[n] = climb_stairs_memo(n - 1, memo) + climb_stairs_memo(n - 2, memo)
    return memo[n]

# Bottom-up: tabulation, space-optimized to two rolling variables
def climb_stairs(n: int) -> int:
    if n <= 2:
        return n
    prev2, prev1 = 1, 2                # ways(1), ways(2)
    for _ in range(3, n + 1):
        prev2, prev1 = prev1, prev1 + prev2
    return prev1
```

```typescript
// Top-down: memoization
function climbStairsMemo(n: number, memo = new Map<number, number>()): number {
  if (n <= 2) return n;
  if (memo.has(n)) return memo.get(n)!;
  const result = climbStairsMemo(n - 1, memo) + climbStairsMemo(n - 2, memo);
  memo.set(n, result);
  return result;
}

// Bottom-up: tabulation, space-optimized to two rolling variables
function climbStairs(n: number): number {
  if (n <= 2) return n;
  let prev2 = 1,
    prev1 = 2; // ways(1), ways(2)
  for (let i = 3; i <= n; i++) {
    [prev2, prev1] = [prev1, prev1 + prev2];
  }
  return prev1;
}
```
````

The tabulated version only ever reads the previous two values, exactly
the "1D DP that reduces to two rolling variables" signal from this
module's concept lessons — so the O(n)-sized table collapses to O(1)
space, at the cost (as the Tabulation & Space Optimization lesson
noted) of no longer being able to reconstruct which specific SEQUENCE
of moves achieves any particular count, only the final number.

```complexity
{
  "time": "O(n)",
  "space": "O(n) memoized (memo table + recursion stack), O(1) tabulated",
  "why": "n-1 distinct subproblems (steps 2 through n), each O(1) work beyond its recursive/loop dependencies — the same 'distinct subproblems × work per subproblem' argument as memoized Fibonacci. Tabulation additionally drops both the memo table and the call stack, since the loop only ever needs the last two values."
}
```
`````

## Variants

- **From Recursion to Memoization** (concept lesson, this module): the
  exact Fibonacci argument this problem's recurrence reduces to,
  including the full O(2ⁿ) → O(n) derivation.
- **House Robber** (next lesson): the same 1D, depends-on-two-previous-
  values shape, but with `max` replacing `+` as the combining operator —
  read immediately after this one to see the operator distinction made
  concrete.
- **Climbing Stairs with variable step sizes** (a natural extension, not
  covered): if you could climb `1, 2, ..., k` steps instead of just 1 or
  2, the recurrence generalizes to `ways(n) = sum(ways(n-j) for j in
  1..k)` — the same last-move argument, with more cases to sum over.

```quiz
{
  "question": "The recurrence sums ways(n-1) and ways(n-2) rather than, say, taking their max. What in the PROBLEM STATEMENT specifically determines that sum is the correct combining operator here?",
  "options": [
    "The problem asks for the NUMBER OF DISTINCT WAYS to reach the top — every distinct sequence of moves is a separate way to be counted, and the two cases (last move was 1 step vs. last move was 2 steps) are mutually exclusive and collectively exhaustive, so the total count is the sum of the counts in each case, not a comparison between them",
    "Sum is correct because n is a positive integer, and max would only be used for negative inputs — since step counts can never go below zero in this problem, the sign of n is what determines which combining operator the recurrence should use",
    "Sum is simply the default choice for any 1D DP unless stated otherwise — in the absence of an explicit instruction to optimize a value, a 1D recurrence defaults to summing its dependencies rather than comparing them"
  ],
  "answer": 0,
  "explanation": "This is the 1D DP Patterns lesson's operator-selection rule applied directly: 'how many ways' means counting every distinct possibility, and when a set of possibilities splits cleanly into non-overlapping cases (here: which move was last), the total count is their sum. Had the problem instead asked for something like 'the minimum number of moves,' the correct operator would flip to min, comparing the two cases instead of adding them."
}
```
