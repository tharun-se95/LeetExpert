---
title: Tabulation & Space Optimization
type: concept
---

## Memoization's iterative twin

The previous lesson turned exponential Fibonacci into O(n) by caching
recursive results top-down: start at `fib(n)`, recurse toward the base
cases, fill the memo on the way back up. **Tabulation** computes the
exact same table of answers, but from the *other* direction — start at
the base cases and build *up* to `fib(n)`, with a plain loop and no
recursion at all.

The two are not different algorithms. They fill the same memo table
with the same values; they only disagree on the order in which the
cells get filled and on whether the machine's call stack or your `for`
loop drives that order.

## Bottom-up tabulation

To tabulate, you need the subproblems in an order where every
subproblem is solved *before* anything that depends on it — a
**dependency order**. Fibonacci's recurrence `fib(i) = fib(i-1) +
fib(i-2)` says cell `i` depends on cells `i-1` and `i-2`, both smaller.
So filling the table left to right, `0, 1, 2, …, n`, guarantees both
dependencies are already present when we reach `i`:

```diagram
{
  "id": "dp-table",
  "mode": "1d",
  "values": [0, 1, 1, 2, 3, 5, 8],
  "current": 6,
  "caption": "fib tabulation: each cell uses the two before it"
}
```


````tabs
```python
def fib(n: int) -> int:
    if n < 2:
        return n
    dp = [0] * (n + 1)
    dp[1] = 1                    # base cases
    for i in range(2, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]   # dependencies dp[i-1], dp[i-2] already filled
    return dp[n]
```

```typescript
function fib(n: number): number {
  if (n < 2) return n;
  const dp = new Array<number>(n + 1).fill(0);
  dp[1] = 1; // base cases
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2]; // dependencies dp[i-1], dp[i-2] already filled
  }
  return dp[n];
}
```
````

The complexity argument is the same product as before: **n+1
subproblems (the table cells) × O(1) work each = O(n) time**, and O(n)
space for the array. Identical to memoization on the nose.

## Why tabulation avoids recursion's costs

Two concrete advantages fall out of "loop, not recursion":

**No O(depth) call stack.** Memoized `fib(n)` recurses `fib(n) →
fib(n-1) → … → fib(0)` before any value returns, so the call stack
holds n frames at its deepest — O(n) *stack* space on top of the memo.
Tabulation's loop keeps exactly one stack frame regardless of n. The
memory is all in the explicit `dp` array, which you control.

**No recursion-limit crash.** Python caps recursion depth at ~1000 by
default; a memoized DP whose deepest chain exceeds that raises
`RecursionError` even though the algorithm is correct and fast. A
bottom-up loop has no such ceiling — `i` can run to millions. This is a
real, frequent reason to prefer tabulation for deep 1-D and string DPs.

The trade the other way: top-down only ever computes subproblems it
actually *reaches*, so if large regions of the table are irrelevant to
the final answer, memoization skips them while a naive full table
computes everything. For dense DPs (Fibonacci, edit distance) that
distinction vanishes — every cell is needed — and tabulation's lower
constant factors and lack of stack overhead win.

## Space optimization: collapse the table

Look again at the recurrence `dp[i] = dp[i-1] + dp[i-2]`. Computing
cell `i` needs **only the previous two cells**. Once we have moved past
`dp[i]`, cell `dp[i-2]` and everything older can never be read again.
Yet the array above faithfully stores all n+1 of them. That storage is
pure waste for this recurrence.

Keep only what the recurrence reads. Two rolling variables suffice:

````tabs
```python
def fib(n: int) -> int:
    if n < 2:
        return n
    prev2, prev1 = 0, 1          # fib(0), fib(1)
    for _ in range(2, n + 1):
        prev2, prev1 = prev1, prev1 + prev2   # slide the window forward by one
    return prev1
```

```typescript
function fib(n: number): number {
  if (n < 2) return n;
  let prev2 = 0,
    prev1 = 1; // fib(0), fib(1)
  for (let i = 2; i <= n; i++) {
    [prev2, prev1] = [prev1, prev1 + prev2]; // slide the window forward by one
  }
  return prev1;
}
```
````

Same O(n) time, but now **O(1) space** — two numbers instead of an
n-cell array. The general rule: if `dp[i]` depends only on a fixed
window of the last *k* cells, you never need more than *k* rolling
variables (Fibonacci and Climbing Stairs: k = 2; some recurrences need
just the previous row of a 2-D table, giving O(width) instead of
O(height × width)). This same collapse works on 2-D DPs whenever a row
depends only on the row directly above it — you keep one or two rows,
not the whole grid.

## The trade-off you are accepting

Space optimization is not always the right call, and the reason is
specific: **once you overwrite the old cells, you have thrown away the
information needed to reconstruct the full solution path.**

The full `dp` array records the answer to *every* subproblem. Many
problems ask not just for the optimal *value* but for the optimal
*object* — the actual longest common subsequence, the specific coins
that make the amount, the path through the grid. Reconstructing that
object means walking *backward* through the table, reading old cells to
decide which choice was taken at each step. The rolling-variable version
has already discarded those cells. It can only ever tell you the final
number.

So the rule is:

> **Collapse to rolling variables only when you need the final value
> alone. If you must reconstruct the solution itself, keep the full
> table.**

This is why the problem lessons in this module often show three stages
— memoized, full-table tabulation, and space-optimized — and stop
short of collapsing whenever the problem wants the path, not just the
score.

```complexity
{
  "operations": [
    { "name": "tabulation, time", "time": "O(n)", "why": "n+1 table cells, each filled once with O(1) glue work — same subproblem-count × work-each product as memoization" },
    { "name": "tabulation, space", "time": "O(n)", "why": "the full dp array, but NO O(depth) call stack — a single loop frame replaces recursion's n stack frames" },
    { "name": "space-optimized, space", "time": "O(1)", "why": "the recurrence reads only the last two cells, so two rolling variables replace the whole array — at the cost of being unable to reconstruct the path" }
  ]
}
```

```quiz
{
  "questions": [
    {
      "question": "Memoized and tabulated Fibonacci are both O(n) time and O(n) space for the table. What real advantage does tabulation still hold?",
      "options": [
        "Tabulation uses a loop instead of recursion, so it avoids the O(n) call-stack depth and Python's recursion-limit ceiling that the top-down version incurs on deep inputs",
        "Tabulation computes different, more accurate values — since it fills the table in a strict bottom-up order rather than following the recursive call pattern, tabulation avoids small floating-point or intermediate rounding errors that memoization can introduce",
        "Tabulation is always asymptotically faster than memoization — since a loop has less per-iteration overhead than a function call, tabulation's asymptotic time complexity is strictly better than the top-down version's, not merely equal to it"
      ],
      "answer": 0,
      "explanation": "The table itself costs the same either way. The difference is the call stack: memoization stacks n frames deep before returning and can hit Python's ~1000 recursion limit, while a bottom-up loop keeps one frame no matter how large n is."
    },
    {
      "question": "You space-optimize a DP down to two rolling variables, then discover the problem actually wants the reconstructed solution (which coins, which path), not just the final number. Why does the optimization now bite you?",
      "options": [
        "Reconstructing the solution requires walking backward through the per-subproblem answers to see which choice was made at each step, but rolling variables have already overwritten and discarded all but the last one or two cells",
        "Rolling variables produce a wrong final value — since only two variables are kept instead of the full table, the accumulated numeric answer itself becomes inaccurate once the array has been fully collapsed",
        "Reconstruction requires recursion, which rolling variables forbid — since rolling variables are computed inside a plain loop rather than a recursive function, the resulting structure is fundamentally incompatible with any backward-reconstruction process, recursive or not"
      ],
      "answer": 0,
      "explanation": "The full table records every subproblem's answer, which backtracking reads to recover the choices taken. Collapsing to O(1) variables throws that history away — it can report the optimal value but not the object that achieved it. Keep the full table whenever you must reconstruct."
    }
  ]
}
```
