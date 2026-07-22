---
title: From Recursion to Memoization
type: concept
---

## Where Module 16 left us stuck

In Module 16 you wrote naive recursive Fibonacci and watched it explode:

````tabs
```python
def fib(n: int) -> int:
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)
```

```typescript
function fib(n: number): number {
  if (n < 2) return n;
  return fib(n - 1) + fib(n - 2);
}
```
````

The recursion tree for `fib(5)` shows why this is O(2ⁿ). Every internal
node forks into two children, and the tree's depth is n, so the node
count grows like a power of two:

```text
                      fib(5)
              ┌──────────┴──────────┐
           fib(4)                 fib(3)
        ┌────┴────┐             ┌────┴────┐
     fib(3)     fib(2)       fib(2)     fib(1)
    ┌──┴──┐    ┌──┴──┐      ┌──┴──┐
 fib(2) fib(1) fib(1) fib(0) fib(1) fib(0)
 ┌──┴──┐
fib(1) fib(0)
```

Now **count how many times each argument appears**. `fib(3)` is
computed twice. `fib(2)` is computed three times. `fib(1)` appears
five times, `fib(0)` three times. The two calls to `fib(3)` are not
just similar — they are *identical*: same input, same output, computed
from scratch both times, each dragging its own entire subtree of
redundant work behind it. That is the exponential blowup, and it comes
entirely from **recomputing answers we have already found**.

This lesson is about the observation that turns that O(2ⁿ) disaster
into O(n), and the two properties a problem must have for the trick to
work at all.

## Property 1: overlapping subproblems

**Overlapping subproblems** means the recursion, expanded fully,
solves the *same* subproblem many times over. Fibonacci has this in the
extreme: there are only n+1 distinct subproblems (`fib(0)` through
`fib(n)`), yet the naive tree contains an exponential number of nodes.
Almost every node is a repeat.

Contrast this with a recursion that does *not* overlap. Merge sort
(Module 14) splits `[0, n)` into `[0, mid)` and `[mid, n)` — two
subproblems that share no elements and therefore never recompute each
other. Merge sort's tree has no duplicate nodes, which is exactly why
it is already O(n log n) with no caching possible or needed. **Caching
only helps when subproblems repeat.** No overlap, no benefit.

So the first question for any recursive solution is: *does the same
argument tuple show up in more than one place in the tree?* If yes, you
are paying for it more than once, and you have something to save.

## Property 2: optimal substructure

**Optimal substructure** means the optimal answer to a problem is
built from the optimal answers to its subproblems — and using anything
*less* than optimal subanswers can never give you a better whole.

State it precisely, because it is usually just asserted. For Fibonacci
the "optimal" framing is trivial (there is one right answer, not a best
among many), so take a real optimization example: shortest path from A
to C that passes through B. If the shortest A→C-via-B path exists, the
portion of it from A to B *must itself* be a shortest A→B path. Why?
Because if there were a shorter A→B path, you could splice it in and
get a shorter A→C-via-B path — contradicting that the original was
shortest. The optimal whole *forces* its pieces to be optimal.

That splice-and-contradict argument is the substance of optimal
substructure, and it is what lets a DP recurrence combine subanswers
without second-guessing them: once you know the best answer to each
subproblem, you never need to reconsider *how* it was achieved, only
its value. When a problem lacks this property — when a locally optimal
piece can block a globally optimal whole — DP's recurrence is simply
wrong, and you need a different tool.

Fibonacci has both properties: massive overlap, and a trivial "combine
the two subanswers by adding" rule. That is the green light for
memoization.

## Top-down memoization

The fix is almost insultingly small. Keep the exact recursive shape,
but before computing a subproblem, check whether you have already
solved it; after computing it, record the answer. This cache is the
**memo table**.

````tabs
```python
from functools import lru_cache

@lru_cache(maxsize=None)
def fib(n: int) -> int:
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)
```

```typescript
function fib(n: number, memo = new Map<number, number>()): number {
  if (n < 2) return n;
  const cached = memo.get(n);
  if (cached !== undefined) return cached;
  const result = fib(n - 1, memo) + fib(n - 2, memo);
  memo.set(n, result);
  return result;
}
```
````

The Python version uses `functools.lru_cache`, which wraps the
function in exactly this check-then-store logic keyed on the arguments.
The TypeScript version does it by hand with a `Map` so the mechanism is
visible. Both compute the identical Fibonacci numbers the naive version
did — only the *count* of computations changes.

To make the mechanism unmistakable, here is the same idea with an
explicit dictionary rather than the decorator:

````tabs
```python
def fib(n: int, memo: dict[int, int] | None = None) -> int:
    if memo is None:
        memo = {}
    if n < 2:
        return n
    if n in memo:                       # already solved — return the cached value
        return memo[n]
    memo[n] = fib(n - 1, memo) + fib(n - 2, memo)
    return memo[n]
```

```typescript
function fib(n: number, memo = new Map<number, number>()): number {
  if (n < 2) return n;
  if (memo.has(n)) return memo.get(n)!; // already solved — return the cached value
  const result = fib(n - 1, memo) + fib(n - 2, memo);
  memo.set(n, result);
  return result;
}
```
````

## Why this is O(n), argued precisely

DP complexity is never "just the answer." It is always the same
product:

> **total time = (number of distinct subproblems) × (work per subproblem, excluding recursive calls)**

Count each factor for memoized Fibonacci.

**Distinct subproblems.** The argument `n` ranges over the integers
`0, 1, …, n`. That is exactly **n+1 distinct subproblems** — the memo
table has n+1 slots and no more.

**Work per subproblem, excluding recursion.** The first time `fib(k)`
runs, it does a base-case check, two dictionary lookups/insertions, and
one addition — all **O(1)** — *beyond* the two recursive calls it
makes. Crucially, each subproblem's body runs *in full* only once:
every later call to `fib(k)` hits the `if n in memo` guard and returns
immediately, which is O(1) and does not re-enter the body at all.

Multiply: (n+1) subproblems × O(1) each = **O(n)** time. The memo
table also costs **O(n)** space for its entries, plus O(n) call-stack
depth for the deepest recursion chain (`fib(n) → fib(n-1) → … →
fib(0)`).

```complexity
{
  "operations": [
    { "name": "naive recursive fib", "time": "O(2ⁿ)", "why": "the recursion tree branches by two at every level down to depth n, and every subproblem past the first is recomputed from scratch" },
    { "name": "memoized fib, time", "time": "O(n)", "why": "n+1 distinct subproblems, each computed in full exactly once at O(1) work beyond its recursive calls; all later calls are O(1) cache hits" },
    { "name": "memoized fib, space", "time": "O(n)", "why": "n+1 memo entries, plus O(n) call-stack depth along the deepest recursion chain" }
  ]
}
```

The lesson generalizes: **any** recursion with overlapping subproblems
and optimal substructure collapses from exponential (or worse) to
"subproblem count × work each" the instant you add a memo. Every
problem in this module is an instance of finding those two numbers.

## Memoization vs. plain recursion — the trade-off

Memoization is not free. You trade **O(subproblems) memory** for the
time saving, and you keep recursion's O(depth) call-stack cost (which
matters in Python, whose default recursion limit is ~1000 — deep DPs
can hit it). The next lesson, *Tabulation & Space Optimization*, shows
the bottom-up counterpart that removes the call stack entirely and,
for many recurrences, shrinks the table itself to O(1).

```quiz
{
  "questions": [
    {
      "question": "Merge sort is recursive and clearly has optimal substructure, yet nobody memoizes it. Why would adding a memo table to merge sort be pointless?",
      "options": [
        "Merge sort is already O(n log n), which is the fastest any sort can be — since comparison-based sorting has a proven O(n log n) lower bound, there's no further speedup a memo table could offer even if the subproblems did overlap",
        "Merge sort doesn't return a value that could be cached — since the function sorts the array in place and its recursive calls are only used for their side effects, there's no return value for a memo table to store or look up",
        "Merge sort's subproblems never overlap — each recursive call sorts a disjoint slice of the array, so no subproblem is ever solved twice and there is nothing for a cache to hit"
      ],
      "answer": 2,
      "explanation": "Memoization only pays off when subproblems REPEAT. Merge sort splits into disjoint halves that share no work, so its tree has no duplicate nodes — a cache would sit empty of hits. Overlapping subproblems, not recursion alone, is what makes DP applicable."
    },
    {
      "question": "In memoized Fibonacci, the body of fib(k) contains two recursive calls, so why is the work-per-subproblem counted as O(1) rather than O(n) when we compute total time?",
      "options": [
        "The subproblem-count × work-per-subproblem formula counts each subproblem's OWN work once, excluding the recursive calls — those calls are themselves subproblems already counted in the 'number of subproblems' factor, so counting their cost again would double-count",
        "The two recursive calls cancel each other out — since fib(k-1) and fib(k-2) are added together in the return statement, their computational costs offset one another when accounting for the total work done",
        "The recursive calls are O(1) because Fibonacci is a simple function — since the function's body only contains a single addition and two recursive calls, the overall per-call overhead is small enough to be treated as constant regardless of what those calls eventually compute"
      ],
      "answer": 0,
      "explanation": "The recurrence's total cost is (number of nodes) × (non-recursive work per node). Each recursive call lands on a node already tallied in the subproblem count, so we charge each node only for its own O(1) glue work. Adding recursive-call cost on top would count the same nodes twice."
    }
  ]
}
```
