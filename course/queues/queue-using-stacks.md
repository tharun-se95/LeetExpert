---
title: Implement Queue Using Stacks
type: problem
---

## Problem

Implement a FIFO queue — `push`, `pop`, `peek`, `empty` — using **only
two stacks** (only push-to-top, pop-from-top, peek, isEmpty allowed on
them). Amortized O(1) per operation required.

**Example**

```text
push(1), push(2)
peek()  → 1        ← FIFO: the FIRST pushed
pop()   → 1
empty() → false
```

**Constraints:** ≤ 100 operations · calls are always valid.

## Attempt it first

A classic for a reason: it tests whether amortized analysis is something
you can *produce*, not just consume. The naive version (make every push
keep order) works but does O(n) per push. The good version does better
by being lazier. Find the laziness.

````reveal Hint 1 — one reversal makes FIFO from LIFO
Pouring a stack into another stack reverses it: pop-pop-pour puts the
OLDEST element on top of the second stack. So: an inbox stack for
arrivals, an outbox stack for departures.
````

````reveal Hint 2 — when to pour (the whole trick)
Only pour when the outbox is EMPTY and someone wants the front. Elements
already in the outbox are in correct FIFO order — pouring on every
operation would re-reverse them. Lazy pouring is what makes the
accounting work; eager pouring is what breaks it.
````

## Brute force, for contrast

Keep stack A in queue order by using B as a staging area on every push
(pour A→B, push new, pour back B→A): correct, O(n) per push, O(n²) for
n pushes. The lazy version moves each element through the system **once
per lifetime** instead of once per operation — that phrase is the
entire improvement.

## The insight

> A stack reverses; two reversals restore order. Let arrivals pile up
> LIFO in the inbox, and reverse them into the outbox only when needed —
> each element makes exactly one trip: inbox-push, pour (one pop + one
> push), outbox-pop. Four stack touches per element, EVER, regardless
> of how operations interleave. Amortized O(1) by the budget argument.

## Solution

`````reveal Solution — inbox / outbox with lazy pour
````tabs
```python
class MyQueue:
    def __init__(self) -> None:
        self._inbox: list[int] = []       # arrivals, newest on top
        self._outbox: list[int] = []      # departures, OLDEST on top

    def push(self, x: int) -> None:
        self._inbox.append(x)             # O(1) — just pile it up

    def _spill(self) -> None:
        if not self._outbox:              # ONLY when outbox is empty
            while self._inbox:
                self._outbox.append(self._inbox.pop())   # the reversal

    def pop(self) -> int:
        self._spill()
        return self._outbox.pop()

    def peek(self) -> int:
        self._spill()
        return self._outbox[-1]

    def empty(self) -> bool:
        return not self._inbox and not self._outbox
```

```typescript
class MyQueue {
  private inbox: number[] = []; // arrivals, newest on top
  private outbox: number[] = []; // departures, OLDEST on top

  push(x: number): void {
    this.inbox.push(x); // O(1) — just pile it up
  }

  private spill(): void {
    if (this.outbox.length === 0) {
      // ONLY when outbox is empty
      while (this.inbox.length > 0) {
        this.outbox.push(this.inbox.pop()!); // the reversal
      }
    }
  }

  pop(): number {
    this.spill();
    return this.outbox.pop()!;
  }

  peek(): number {
    this.spill();
    const v = this.outbox[this.outbox.length - 1];
    return v;
  }

  empty(): boolean {
    return this.inbox.length === 0 && this.outbox.length === 0;
  }
}
```
````

Why the empty-outbox guard is correctness, not optimization: the outbox
holds older elements than anything in the inbox, already in FIFO order.
Pouring on top of a non-empty outbox would bury older elements under
newer ones — breaking FIFO, not just slowing down. (Try push(1),
push(2), pop(), push(3), pop() against an always-pour version: it
returns 3 before 2.)

```complexity
{
  "time": "O(1) amortized per operation (any single pop may cost O(n))",
  "space": "O(n)",
  "why": "Per-element lifetime budget: one inbox push + one pour-out + one pour-in + one outbox pop = 4 touches total. n operations touch ≤ 4n stack-slots — O(1) amortized, exactly the dynamic-array style of argument."
}
```
`````

## Variants

- **Stack using two queues** (the mirror): possible but asymmetric —
  one operation goes O(n) *non*-amortized. Working out WHY the mirror
  is worse (queues don't reverse for free) is a better exercise than
  the implementation.
- **Real-world shape:** this inbox/outbox design is how functional
  languages implement persistent queues from immutable lists — the
  trick survives at industrial strength.

```quiz
{
  "question": "A sequence of n pushes then n pops: the FIRST pop costs n pour-steps. Why is the whole sequence still O(n) total?",
  "options": [
    "The first pop is an unlucky outlier we ignore",
    "That expensive pour moved ALL n elements into the outbox, prepaying every later pop — each of which is now O(1). Total touches: n pushes + n pour-steps + n pops ≈ 3n. Charge the pour to the elements moved, not to the operation that triggered it",
    "Because pours get faster as the inbox shrinks"
  ],
  "answer": 1,
  "explanation": "Amortized analysis in its purest form: the spike's size exactly equals the number of future operations it makes cheap. Same accounting as the dynamic array's resize and the monotonic stack's pops — by now this argument should feel like an old friend."
}
```
