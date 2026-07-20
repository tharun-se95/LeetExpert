---
title: FIFO & Queue Mechanics
type: concept
---

## The opposite discipline

A queue restricts a container the other way around from a stack: add at
the **back** (enqueue), remove from the **front** (dequeue). First in,
first out. Where the stack modeled *interrupted* work — most recent
first — the queue models **fair** work: things are served in arrival
order. Print jobs, request buffers, message queues, and (in Stage 3–4)
breadth-first search, which is nothing but "explore in discovery order."

## The implementation problem stacks didn't have

A stack was free: both operations at the array's end. A queue needs
**both ends**, and the array's front is its bad end — `pop(0)` /
`shift()` moves every remaining element:

````tabs
```python
from collections import deque

bad = []
bad.append(1)          # enqueue: O(1)
bad.pop(0)             # dequeue: O(n) — shifts everything!

q = deque()            # doubly-ended queue — the right tool
q.append(1)            # enqueue        O(1)
q.append(2)
front = q[0]           # peek           O(1)
x = q.popleft()        # dequeue -> 1   O(1)
```

```typescript
const bad: number[] = [];
bad.push(1); // enqueue: O(1)
bad.shift(); // dequeue: O(n) — shifts everything!

// JS has no built-in deque; for O(1) both ends use an index-based
// wrapper (below) or a linked list. For MODEST sizes, shift() is
// often tolerated — know that you're paying O(n) when you do.
class SimpleQueue<T> {
  private items: T[] = [];
  private head = 0; // index of current front

  enqueue(x: T): void {
    this.items.push(x); // O(1)
  }

  dequeue(): T | undefined {
    if (this.head === this.items.length) return undefined;
    const x = this.items[this.head];
    this.items[this.head] = undefined as T; // release reference
    this.head++; // O(1): MOVE THE FRONT, don't shift the data
    if (this.head > 1000 && this.head * 2 > this.items.length) {
      this.items = this.items.slice(this.head); // occasional compaction
      this.head = 0;
    }
    return x;
  }

  get size(): number {
    return this.items.length - this.head;
  }
}
```
````

The `SimpleQueue` trick — advance a `head` index instead of shifting —
is worth reading twice: it converts dequeue to O(1) by **redefining
where the front is** rather than moving data, with occasional amortized
compaction to reclaim memory. Two other O(1) designs you already own:

- **Linked list with a tail pointer** (Module 7): enqueue = push_back,
  dequeue = remove head — both O(1), no compaction needed.
- **Ring buffer** (next lesson): array + modular indices — the tightest
  version, and the one worth building from scratch.

```complexity
{
  "operations": [
    { "name": "enqueue / dequeue / peek (deque, linked list, ring)", "time": "O(1)", "why": "each design gives both ends constant-time access — by pointer, moving index, or modular index" },
    { "name": "dequeue via array shift (pop(0)/shift)", "time": "O(n)", "why": "contiguity closes the front gap by moving every element — Module 4's insert-at-0 cost, mirrored" },
    { "name": "search / random access", "time": "O(n)", "why": "as with stacks: the discipline trades access for an ordering guarantee" }
  ]
}
```

## Recognizing queue-shaped problems

The cue is **arrival order matters for service order**: process requests
as they came; expire the oldest entries first; explore neighbors before
neighbors-of-neighbors (BFS's whole idea); buffer between a producer and
a consumer. If the most-recent item is special → stack. If the oldest
is → queue. If BOTH ends are active → deque (lesson 3).

```quiz
{
  "questions": [
    {
      "question": "Why is list.pop(0) / array.shift() O(n) when pop() / push() are O(1)?",
      "options": [
        "The front element is harder to find",
        "Removing the front leaves a gap at index 0; contiguity demands every remaining element shift left one slot — the mirrored version of Module 4's insert-at-front cost",
        "Language implementations are unoptimized"
      ],
      "answer": 1,
      "explanation": "Same array fact from two sides: ends are free, interiors (and the front is adjacent to nothing on its left) cost movement. Every efficient queue design is a way of NOT moving data — moving an index, a pointer, or wrapping around."
    },
    {
      "question": "The SimpleQueue advances a head index instead of shifting. What did this change, in one phrase?",
      "options": [
        "It caches the front element",
        "It redefined WHERE the front is instead of moving data to where the front was — the queue's contents are items[head..], and dequeue is head++",
        "It made the array circular"
      ],
      "answer": 1,
      "explanation": "Logical position vs physical position — the same length-vs-capacity divorce the dynamic array made. The occasional compaction keeps memory bounded and amortizes to O(1), by the standard doubling-style argument."
    },
    {
      "question": "A task scheduler must always run the job that has been WAITING LONGEST. Stack, queue, or neither?",
      "options": [
        "Stack — most efficient",
        "Queue — longest-waiting = earliest-arrived = FIFO front",
        "Neither — it needs sorting"
      ],
      "answer": 1,
      "explanation": "'Longest waiting' is arrival order read backwards — exactly the queue's front. (If jobs instead had PRIORITIES trumping arrival, neither discipline fits — that's the heap, Module 19.)"
    }
  ]
}
```
