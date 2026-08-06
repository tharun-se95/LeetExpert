---
title: Deques & the Monotonic Deque
type: concept
---

## Both ends open

A **deque** (double-ended queue, "deck") lifts the last restriction:
push and pop at *either* end, all O(1). Python's `collections.deque` is
the real thing (a segmented ring underneath); in JS you approximate
with the head-index wrapper from lesson 1 extended to both ends, or a
doubly linked list (Module 7's `prev` pointers finally earning rent).

```diagram
{
  "id": "fifo-queue",
  "values": [1, 2, 3, 4],
  "frontLabel": "front · push/pop",
  "backLabel": "back · push/pop"
}
```


````tabs
```python
from collections import deque

d = deque([2, 3])
d.appendleft(1)     # [1, 2, 3]     O(1)
d.append(4)         # [1, 2, 3, 4]  O(1)
d.popleft()         # -> 1          O(1)
d.pop()             # -> 4          O(1)
d[0], d[-1]         # peeks at both ends, O(1)
```

```typescript
// Minimal doubly-linked deque — O(1) at both ends, no library needed
class Deque<T> {
  private front_: { v: T; prev: unknown; next: unknown } | null = null;
  private back_: typeof this.front_ = null;
  size = 0;
  pushBack(v: T) {
    const n = { v, prev: this.back_, next: null };
    if (this.back_) (this.back_ as { next: unknown }).next = n;
    else this.front_ = n;
    this.back_ = n;
    this.size++;
  }
  pushFront(v: T) {
    const n = { v, prev: null, next: this.front_ };
    if (this.front_) (this.front_ as { prev: unknown }).prev = n;
    else this.back_ = n;
    this.front_ = n;
    this.size++;
  }
  popFront(): T | undefined {
    if (!this.front_) return undefined;
    const n = this.front_;
    this.front_ = n.next as typeof this.front_;
    if (this.front_) (this.front_ as { prev: unknown }).prev = null;
    else this.back_ = null;
    this.size--;
    return n.v;
  }
  popBack(): T | undefined {
    if (!this.back_) return undefined;
    const n = this.back_;
    this.back_ = n.prev as typeof this.back_;
    if (this.back_) (this.back_ as { next: unknown }).next = null;
    else this.front_ = null;
    this.size--;
    return n.v;
  }
  peekFront(): T | undefined { return this.front_?.v; }
  peekBack(): T | undefined { return this.back_?.v; }
}
```
````

A deque subsumes both disciplines — use one end only: stack; use
opposite ends: queue. Its own identity emerges when **both ends are
active at once**, and one pattern owns that niche.

## The monotonic deque

Recall Min Stack's punchline: min-tracking transfers to stacks because
stack state unwinds LIFO — and the lesson warned that QUEUES break the
trick, because the minimum can *expire out the front*. The monotonic
deque is the repair, and it powers "max/min of a sliding window" in
O(n) total.

Setup: a window slides rightward over an array; you must report the
window's **maximum** at each position. Keep a deque of **indices** whose
values are **decreasing** front-to-back. Both ends have jobs:

- **Back — usefulness filter** (the monotonic stack's move): when x
  arrives, every index at the back with value ≤ x can never be a future
  maximum — x is newer AND bigger, it outlives and outranks them. Pop
  them; push x.
- **Front — expiry** (the queue's move): when the front index slides
  out of the window, pop it from the front.

The invariant that makes it work:

> The deque holds exactly the window's **still-relevant candidates** in
> decreasing order — every element that could still become a maximum of
> this or a future window. The front is therefore always the current
> window's maximum.

```text
window size 3 over [1, 3, -1, -3, 5]:
  1 arrives:  deque [1]
  3 arrives:  1 ≤ 3 — pop it (dominated); deque [3]        max 3? (window not full)
 -1 arrives:  deque [3, -1]                                 max 3
 -3 arrives:  deque [3, -1, -3]                             max 3
  5 arrives:  3, -1, -3 all ≤ 5 — pop all; deque [5]        max 5
```

Cost: each index is pushed once, popped at most once (from ONE of the
two ends) — the push-once/pop-once budget for the third time, now split
across two doors. O(n) total, O(k) space.

## Why both structures were necessary

This pattern is unreachable by either parent alone. A stack can filter
dominated candidates but can't expire the oldest; a queue can expire but
can't evict dominated backs. Sliding-window extremes need both — which
is WHY the deque exists as a named structure and not just a convenience.
You'll implement the full algorithm in this module's capstone.

```quiz
{
  "questions": [
    {
      "question": "When x arrives, indices at the BACK with values ≤ x are discarded permanently. Why is this safe for all future windows?",
      "options": [
        "They might return when x expires — once x eventually slides out of the window, the discarded smaller elements could theoretically become relevant again for whatever window forms next",
        "x entered later, so x expires later — any future window containing a discarded index also contains x, whose value is ≥ theirs; they can never be the answer again",
        "Because the deque would overflow otherwise — keeping every candidate around regardless of dominance would let the structure grow past its bounded capacity, so weaker elements must be evicted"
      ],
      "answer": 1,
      "explanation": "Dominated = strictly worse on BOTH axes that matter: value (≤ x) and lifetime (expires before x). The safety proof needs both — value alone wouldn't suffice if the smaller element outlived x. This dominance argument is the pattern's entire correctness core."
    },
    {
      "question": "Why couldn't Min Stack's snapshot trick give an O(1) min-QUEUE directly?",
      "options": [
        "It could, with more snapshots — doubling the number of snapshot stacks to track both ends of the structure would restore the same O(1) guarantee that Min Stack achieves for a single end",
        "Queues can't hold auxiliary data — a FIFO structure's interface is fundamentally too restrictive to attach any parallel bookkeeping structure like a second stack alongside it",
        "Snapshots unwind LIFO — they expire in reverse insertion order. A queue's oldest element leaves FIRST, invalidating snapshots from the wrong end; the monotonic deque replaces per-depth snapshots with a candidate list that supports front-expiry"
      ],
      "answer": 2,
      "explanation": "The snapshot design's correctness leaned entirely on pops undoing pushes. FIFO breaks that symmetry, so the aggregate must be maintained by a structure that can shed from both ends — exactly the deque's niche."
    }
  ]
}
```
