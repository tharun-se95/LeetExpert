---
title: The Call Stack & Base Cases
type: concept
---

## Stage 3 begins: problems that recurse into themselves

Everything so far has been flat — a loop marches an index across an
array, a pointer converges, a window slides. Stage 3 is about data and
problems that are **defined in terms of smaller copies of themselves**:
a tree is a node plus two smaller trees; "all subsets of n items" is
"all subsets of n−1 items, twice." Recursion is the tool that matches
that shape — a function that calls itself on a smaller input. But
recursion is not magic syntax; it runs on a concrete piece of machinery,
**the call stack**, and if you don't know exactly what that machine does
on each call, you cannot reason about when it terminates, how much
memory it costs, or why it crashes. This lesson makes the machine
concrete first, then gives you the two tools — a **base case** and an
**induction argument** — that let you prove a recursive function is
correct instead of hoping it is.

## What a function call actually does in memory

Every time any function is called — recursive or not — the language
runtime pushes a **stack frame** onto the call stack. A frame is a
small block of memory holding three things:

1. **The arguments and local variables** for *this* invocation. Each
   call gets its own frame, so `n` inside `factorial(3)` and `n` inside
   `factorial(2)` are two different memory locations that happen to
   share a name.
2. **The return address** — where in the *calling* function to resume
   once this call finishes. This is how the program knows to come back.
3. **A slot for the return value** to be handed back to the caller.

When a function returns, its frame is **popped** — the memory is
reclaimed, and control jumps to the saved return address. The stack is a
literal LIFO stack (Module 8): the most recently called function is the
first to finish and return. Recursion is not a special language feature;
it is just the ordinary call mechanism pointed at the same function, so
that many frames for the *same* function are on the stack at once, each
frozen mid-execution, waiting for the one above it to return.

## Making it concrete: factorial

`factorial(n) = n × factorial(n − 1)`, with `factorial(0) = 1`. Watch
the frames build up and then unwind:

````tabs
```python
def factorial(n: int) -> int:
    if n == 0:            # base case: stop recursing
        return 1
    return n * factorial(n - 1)   # recursive case: shrink toward the base
```

```typescript
function factorial(n: number): number {
  if (n === 0) return 1; // base case: stop recursing
  return n * factorial(n - 1); // recursive case: shrink toward the base
}
```
````

Trace `factorial(3)`. The stack grows on the way **down** — each call
suspends itself mid-expression, unable to compute `n * ...` until the
inner call returns, so its frame stays on the stack:

```text
push factorial(3)   frozen at  3 * factorial(2)
push factorial(2)   frozen at  2 * factorial(1)
push factorial(1)   frozen at  1 * factorial(0)
push factorial(0)   returns 1   ── base case, nothing suspended ──
pop  → factorial(1) resumes: 1 * 1 = 1,  returns 1
pop  → factorial(2) resumes: 2 * 1 = 2,  returns 2
pop  → factorial(3) resumes: 3 * 2 = 6,  returns 6
```

Two separate phases fall out of this picture, and naming them pays off
for the rest of Stage 3. The **winding** phase (calls pushing, going
deeper) is where you do work *before* recursing; the **unwinding** phase
(frames popping, returning back up) is where you do work *with the
results* of deeper calls. In `factorial`, the multiplication `n * ...`
happens on the way back up — during unwinding. The maximum stack depth
here is 4 frames (n = 3 down to n = 0), and in general **n + 1** frames.
Hold onto that number: it is not free, and it is the whole subject of
the "Recursion vs. Iteration" lesson.

## The base case is what makes recursion terminate

A recursive function needs two parts, and both are load-bearing:

- **The recursive case** must call the function on a **strictly
  smaller** subproblem — `n − 1`, half the array, one child node. "Makes
  progress toward the base" is the exact requirement.
- **The base case** is the smallest subproblem, solved directly with no
  further recursion. It is the floor the descent stops at.

Remove or mis-write the base case and the descent never stops. But be
precise about *how* it fails — this is a common misconception:

> A recursion with a broken base case does **not** hang like an infinite
> `while` loop. It crashes with a **stack overflow**.

The difference is memory. An infinite loop reuses one frame forever and
consumes no additional memory — it just spins. Infinite recursion pushes
a **new frame on every call** and never pops any of them, so the stack
grows without bound until it hits the runtime's stack-size limit (a
few thousand to a few tens of thousands of frames, depending on
language and settings) and the program is killed. Watch what "wrong base
case," not just "missing," looks like:

````tabs
```python
def broken(n: int) -> int:
    if n == 0:
        return 1
    return n * broken(n - 2)   # BUG: from odd n, we go 3 → 1 → -1 → -3 → ...
                               # and never hit exactly 0
```

```typescript
function broken(n: number): number {
  if (n === 0) return 1;
  return n * broken(n - 2); // BUG: odd n skips past 0 forever
}
```
````

`broken(4)` is fine (4 → 2 → 0). `broken(3)` steps 3 → 1 → −1 → −3 → …,
sailing past 0 forever: `RecursionError` in Python, `RangeError:
Maximum call stack size exceeded` in JavaScript. The lesson is that
"has a base case" is not enough — **every** recursive path must
provably reach a base case. The fix is a base case that catches the
whole descent, e.g. `if n <= 0: return 1`.

## Proving a recursive function correct: induction

Here is the part that separates using recursion from *trusting* it. You
never trace a recursive call all the way to the bottom in your head —
that defeats the purpose and is infeasible for real inputs. Instead you
prove correctness the same way mathematicians prove statements about all
integers: **induction**, which maps onto recursion's two parts exactly.

1. **Base case.** Show the function returns the right answer for the
   smallest input(s). For `factorial`, `factorial(0)` returns 1, and
   0! = 1. ✓
2. **Inductive step.** *Assume* the recursive call is already correct on
   every smaller input (this is the **inductive hypothesis**), then show
   this one call combines those correct sub-answers into the correct
   answer. For `factorial(n)` with n > 0: assume `factorial(n − 1)`
   correctly returns (n−1)!. Then `n * factorial(n − 1) = n × (n−1)! =
   n!`. ✓

That's a complete proof, and notice what it did **not** require: you
never unfolded the recursion. You reasoned about **one level** —
assuming the level below is right — and the induction principle
guarantees it holds all the way down, *because* the recursion is
guaranteed to reach the base case (which is why the termination
argument above is not optional; induction is only valid if the descent
bottoms out). This "assume the smaller calls already work" move is the
single most important habit in Stage 3. When you write the backtracking
solutions later, you will design them by trusting the recursive call
does its job on the smaller subproblem, not by simulating the whole tree
in your head.

## A preview of why Module 24 exists: naive Fibonacci

One more example, because it foreshadows a whole later module. Fibonacci
is doubly recursive — each call spawns *two* smaller calls:

````tabs
```python
def fib(n: int) -> int:
    if n < 2:            # base cases: fib(0) = 0, fib(1) = 1
        return n
    return fib(n - 1) + fib(n - 2)
```

```typescript
function fib(n: number): number {
  if (n < 2) return n; // base cases: fib(0)=0, fib(1)=1
  return fib(n - 1) + fib(n - 2);
}
```
````

This is *correct* by the same induction argument (base cases right; the
step adds two correct smaller answers). But it is disastrously slow. The
call tree branches two ways at every level, so its size roughly
**doubles each level down** — computing `fib(n)` makes on the order of
2ⁿ calls, an **exponential** number. The reason is pure redundancy:
`fib(5)` calls `fib(4)` and `fib(3)`; `fib(4)` *also* calls `fib(3)`;
that entire `fib(3)` subtree is recomputed from scratch every time it
appears. The same subproblems are re-solved an exponential number of
times.

```text
              fib(5)
          /            \
      fib(4)          fib(3)      ← fib(3) computed here...
      /     \         /    \
  fib(3)  fib(2)  fib(2) fib(1)   ← ...and AGAIN here, whole subtree
   ...      ...    ...
```

Nothing is wrong with the recursion *logically* — it is wrong
*economically*. The fix is to remember each subproblem's answer the
first time you compute it, so the exponential tree collapses to a linear
number of distinct subproblems. That fix is called **memoization /
dynamic programming**, and it is the entire subject of Module 24. For
now, the takeaway is the diagnostic skill: a recursion whose subproblems
**overlap** (the same input recurs across different branches) is a red
flag for exponential blowup, and recognizing it early is what tells you
"this needs DP" later.

```complexity
{
  "operations": [
    { "name": "factorial(n) — time", "time": "O(n)", "why": "exactly n+1 calls, each doing O(1) work; a single chain of frames, no branching" },
    { "name": "factorial(n) — space", "time": "O(n)", "why": "at peak, n+1 frames are on the call stack simultaneously (winding phase) before any pops" },
    { "name": "naive fib(n) — time", "time": "O(2ⁿ)", "why": "the call tree branches twice per level, so its node count grows exponentially; overlapping subproblems are recomputed from scratch" },
    { "name": "naive fib(n) — space", "time": "O(n)", "why": "despite exponential TIME, only one root-to-leaf path is on the stack at once — max depth is n, since the tree is explored depth-first" }
  ]
}
```

Note the last row carefully, because it is a distinction people
routinely get wrong: `fib`'s *time* is exponential but its *space* is
only linear. Time counts **every** node the recursion ever visits;
stack space counts only the frames alive **at one instant**, which is
the current root-to-leaf depth — the tree is walked one path at a time,
depth-first, popping each branch before starting the next. This
time-vs-depth gap comes back in every backtracking analysis in this
module.

```quiz
{
  "questions": [
    {
      "question": "A recursive function is missing its base case. Why does it crash with a stack overflow rather than hang forever like an infinite while-loop?",
      "options": [
        "Recursion is inherently slower, so it times out first — function calls carry enough overhead compared to loop iterations that a missing base case causes the program to exceed a time limit before memory becomes the actual problem",
        "Each recursive call pushes a NEW stack frame that is never popped, so memory grows without bound until the runtime's stack limit is hit and the program is killed — unlike a loop, which reuses one frame and consumes no additional memory",
        "The compiler detects the missing base case and refuses to run it — static analysis at compile time catches the unbounded recursive path and raises an error before the program is ever allowed to execute"
      ],
      "answer": 1,
      "explanation": "The defining difference is memory. An infinite loop spins in a single reused frame (constant memory). Infinite recursion accumulates frames — one per call, none returning — so it exhausts the finite call stack and is terminated. 'Hangs forever' and 'overflows' are different failure modes with different causes."
    },
    {
      "question": "To prove factorial(n) correct by induction, the inductive step assumes factorial(n−1) already returns the correct (n−1)! and shows n × (n−1)! = n!. Why is it valid to just ASSUME the smaller call is correct instead of tracing it to the bottom?",
      "options": [
        "Because the induction principle chains one-level-down correctness all the way to the base case — combined with a guarantee that the recursion actually reaches the base case, assuming the smaller subproblem is solved is exactly what lets you reason about one level instead of the whole descent",
        "Because factorial is a simple function so we can skip the proof — factorial's arithmetic is basic enough that formal correctness reasoning isn't really necessary the way it would be for a more complex recursive algorithm",
        "It is not valid — you must always trace recursion fully to be sure; skipping the full trace down to the base case leaves a gap that could hide an off-by-one error in the smaller subproblem"
      ],
      "answer": 0,
      "explanation": "Induction (base case + 'if it holds for smaller, it holds here') is precisely the tool that makes tracing unnecessary. The termination guarantee is what makes it sound: if the descent reaches the base — which is proven correct directly — the inductive chain carries correctness up through every level. This 'trust the smaller call' habit is how all of Stage 3's recursive code is designed."
    },
    {
      "question": "Naive fib(n) runs in O(2ⁿ) TIME but only O(n) SPACE. How can the time be exponential while the stack space stays linear?",
      "options": [
        "The space measurement is an approximation that ignores most frames — the O(n) figure is a simplification that undercounts true memory use, since exponentially many frames are technically created over the full execution",
        "Exponential time always implies exponential space; this is a special exception with no general rule — fib's linear space bound is a one-off quirk of this particular function rather than an instance of a broader, reusable principle",
        "Time counts every node the recursion ever visits across the whole branching tree; stack space counts only the frames alive at one instant, which is the current root-to-leaf path — the tree is explored depth-first, popping each branch fully before starting the next, so depth never exceeds n"
      ],
      "answer": 2,
      "explanation": "Depth-first exploration means at any moment only one path from root to the current node occupies the stack (max length n). Every other branch has already been popped or hasn't started. So the exponential number of total visits accumulates over time, but the simultaneous frame count — the space — is just the tree's depth. This time-vs-depth split recurs in every backtracking complexity analysis."
    }
  ]
}
```
