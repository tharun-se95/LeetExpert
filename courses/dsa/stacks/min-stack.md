---
title: Min Stack
type: problem
---

## Problem

Design a stack supporting `push`, `pop`, `top`, and `getMin` — **all in
O(1)**. `getMin` returns the minimum element currently in the stack.

**Examples**

```examples
push(-2), push(0), push(-3), getMin() → -3
pop(), top() → 0
getMin() → -2  (minimum recovered after the pop)
```

```constraint
≤ 3·10⁴ operations · pop/top/getMin always called on a non-empty stack.
```

## Attempt it first

The trap is version one: keep a single `min` variable. It breaks — find
the exact operation where, before reading on (the example above walks
you right into it). Then ask: what information would you have needed to
keep?


```sandbox
{
  "id": "min-stack",
  "check": "sequence",
  "class": {"python": "MinStack", "javascript": "MinStack"},
  "methods": {
    "getMin": { "python": "get_min", "javascript": "getMin" }
  },
  "fn": {"python": "MinStack", "javascript": "MinStack"},
  "starter": {
    "python": "class MinStack:\n    def __init__(self):\n        pass\n\n    def push(self, val):\n        pass\n\n    def pop(self):\n        pass\n\n    def top(self):\n        pass\n\n    def get_min(self):\n        pass\n",
    "javascript": "class MinStack {\n  constructor() {}\n\n  push(val) {}\n\n  pop() {}\n\n  top() {}\n\n  getMin() {}\n}\n"
  },
  "cases": [
    {
      "construct": [],
      "ops": [
        ["push", [-2], null],
        ["push", [0], null],
        ["push", [-3], null],
        ["getMin", [], -3],
        ["pop", [], null],
        ["top", [], 0],
        ["getMin", [], -2]
      ]
    },
    {
      "construct": [],
      "ops": [
        ["push", [1], null],
        ["getMin", [], 1],
        ["push", [1], null],
        ["getMin", [], 1],
        ["pop", [], null],
        ["getMin", [], 1]
      ]
    },
    {
      "construct": [],
      "ops": [
        ["push", [5], null],
        ["push", [3], null],
        ["push", [7], null],
        ["getMin", [], 3],
        ["pop", [], null],
        ["getMin", [], 3],
        ["pop", [], null],
        ["getMin", [], 5]
      ]
    }
  ]
}
```
````reveal Hint 1 — why one variable fails
When the minimum itself is popped, the new minimum is whatever was
minimal BEFORE it arrived — information a single overwritten variable
has destroyed. You'd have to rescan (O(n)). The fix: remember the
answer to 'what was min?' at every DEPTH of the stack.
````

````reveal Hint 2 — history, stack-shaped
Minimum-so-far history grows and shrinks in lockstep with the stack
itself — push adds a chapter, pop removes exactly the latest chapter.
History that unwinds LIFO belongs in… a second stack.
````

## The insight

> getMin's difficulty is that pop must RESTORE a previous answer. But
> pops undo pushes in exact reverse order — so snapshot "min of
> everything at or below this depth" alongside each push, and pop
> discards precisely the snapshot that expires. State that unwinds with
> the stack lives ON a stack. (This is also how the call stack restores
> your local variables after every return.)

## Solution

`````reveal Solution — paired min-snapshot stack
````tabs
```python
class MinStack:
    def __init__(self) -> None:
        self._stack: list[int] = []
        self._mins: list[int] = []        # mins[i] = min of stack[0..i]

    def push(self, val: int) -> None:
        self._stack.append(val)
        current_min = min(val, self._mins[-1]) if self._mins else val
        self._mins.append(current_min)    # snapshot for this depth

    def pop(self) -> None:
        self._stack.pop()
        self._mins.pop()                  # expire exactly one snapshot

    def top(self) -> int:
        return self._stack[-1]

    def getMin(self) -> int:
        return self._mins[-1]             # O(1): the current snapshot
```

```typescript
class MinStack {
  private stack: number[] = [];
  private mins: number[] = []; // mins[i] = min of stack[0..i]

  push(val: number): void {
    this.stack.push(val);
    const currentMin =
      this.mins.length > 0 ? Math.min(val, this.mins[this.mins.length - 1]) : val;
    this.mins.push(currentMin); // snapshot for this depth
  }

  pop(): void {
    this.stack.pop();
    this.mins.pop(); // expire exactly one snapshot
  }

  top(): number {
    return this.stack[this.stack.length - 1];
  }

  getMin(): number {
    return this.mins[this.mins.length - 1]; // O(1): the current snapshot
  }
}
```
````

Invariant: `mins[i]` = minimum of the stack's bottom i+1 elements —
maintained by push (extend with `min(new, previous snapshot)`) and by
pop (discard the top snapshot, exposing the one that was correct for
the smaller stack). Replaying the example: mins runs [−2, −2, −3];
popping −3 exposes −2 — the "recovery" is just reading what was never
lost.

```complexity
{
  "time": "O(1) per operation",
  "space": "O(n)",
  "why": "Every operation is one or two end-of-array touches. The second stack doubles memory — the classic space-for-time purchase, priced explicitly."
}
```
`````

`````reveal Optimization — store snapshots only when they change
The mins stack repeats values (`[-2, -2, -3]`). Push to it only when
val ≤ current min; pop from it only when the popped value EQUALS its
top. Space drops to O(number of running minima) — worst case still
O(n) (a decreasing sequence), but typically far less. The ≤ (not <)
matters: with duplicates of the minimum, each copy needs its own
snapshot or an early pop of one duplicate strands getMin on a value no
longer present. Off-by-one-duplicate is THE bug in this variant.
`````

## Variants

- **Max Stack** — same design, flipped comparator.
- **Stack with O(1) getMin AND getMax** — two snapshot stacks.
- **Min Queue** — much harder (queues don't unwind LIFO!); needs the
  monotonic deque, Module 9. Understanding *why* the trick doesn't
  transfer directly is a better lesson than the trick itself.

```quiz
{
  "question": "Why does the two-stack design achieve O(1) getMin when a single min variable cannot?",
  "options": [
    "Because pops restore PAST states, min must be stored per-depth, not as one mutable value — the snapshot stack keeps every still-relevant historical minimum, and LIFO expiry keeps exactly the right one on top",
    "Two stacks let you search twice as fast — having a second stack available in parallel means getMin can search both structures simultaneously, halving the number of elements each one needs to scan",
    "The second stack caches recent queries — it remembers the results of the most recently asked getMin calls, so repeated queries for the same minimum are served from cache instead of being recomputed"
  ],
  "answer": 0,
  "explanation": "A single variable answers 'min now' but not 'min after this pop' — that answer was overwritten. The insight generalizes: any aggregate you must UNWIND (min, max, running sum) rides shotgun on the stack as per-depth snapshots. The call stack does the same for your local variables."
}
```
