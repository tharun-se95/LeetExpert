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

```diagram
{
  "id": "fifo-queue",
  "values": [1, 2, 3, 4]
}
```


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
where the front is** rather than moving data. Concretely: start with
`items = ['A', 'B', 'C']`, `head = 0`. `dequeue()` reads `items[0]`
(`'A'`), clears that slot, and sets `head = 1` — the array itself never
moves, only the boundary that marks where the logical queue begins.
`enqueue('D')` just appends: `items = [_, 'B', 'C', 'D']`, `head`
unchanged. The logical queue (`items[head..]`) reads `['B', 'C', 'D']` —
correct — while the physical array underneath was never shifted. Compare
that to the shifting version: the same `dequeue()` would rewrite
`['B', 'C', _]`, copying every remaining element one slot left. It's the
difference between making every passenger on a bus physically shuffle
forward one seat when the front seat empties, versus just relabeling
which row now counts as "row one."

The tradeoff is `head` growing forever without bound, wasting the slots
behind it — which is what the occasional compaction reclaims. The
compaction condition (`head` past 1000 and past half the array's length)
means: by the time it fires, at least 1000 dequeues have happened since
the last reset (`head` only grows via dequeue), and the copy touches at
most half the array. Spreading a ≤n/2 copy over ≥1000 prior dequeues
gives O(1) amortized per operation — the same shape of argument as the
dynamic array's doubling, just triggered by a position threshold instead
of a capacity one. Two other O(1) designs you already own:

- **Linked list with a tail pointer** (Module 7): enqueue = push_back,
  dequeue = remove head — both O(1), no compaction needed. Note the
  asymmetry is forced: reverse the roles (enqueue at head, dequeue at
  tail) and dequeue would need to retarget `tail` to the *previous*
  node — but a singly linked node has no `prev`, so finding it means
  walking from the head, an O(n) search. The tail pointer only pays off
  when it's paired with head-side removal.
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
        "Language implementations are unoptimized — a sufficiently well-tuned runtime could in principle make front removal as fast as back removal, so O(n) here just reflects today's engineering effort, not anything fundamental",
        "The front element is harder to find — indexing from the front requires walking forward from the start of the array's allocated block, so locating it costs more than indexing from the already-known back position",
        "Removing the front leaves a gap at index 0; contiguity demands every remaining element shift left one slot — the mirrored version of Module 4's insert-at-front cost"
      ],
      "answer": 2,
      "explanation": "Same array fact from two sides: ends are free, interiors (and the front is adjacent to nothing on its left) cost movement. Every efficient queue design is a way of NOT moving data — moving an index, a pointer, or wrapping around."
    },
    {
      "question": "The SimpleQueue advances a head index instead of shifting. What did this change, in one phrase?",
      "options": [
        "It caches the front element — storing a separate reference to whatever value currently sits at the front avoids having to look it up through the array on every peek, which is the real speedup",
        "It redefined WHERE the front is instead of moving data to where the front was — the queue's contents are items[head..], and dequeue is head++",
        "It made the array circular — wrapping indices around the end of the backing array via modular arithmetic is what lets the front advance without ever needing to shift or reallocate"
      ],
      "answer": 1,
      "explanation": "Logical position vs physical position — the same length-vs-capacity divorce the dynamic array made. The occasional compaction keeps memory bounded and amortizes to O(1), by the standard doubling-style argument."
    },
    {
      "question": "A task scheduler must always run the job that has been WAITING LONGEST. Stack, queue, or neither?",
      "options": [
        "Queue — longest-waiting = earliest-arrived = FIFO front",
        "Stack — most efficient; since push and pop both happen at the same end, a stack avoids the front-access costs a queue can incur, making it the faster choice regardless of what ordering the scheduler needs",
        "Neither — it needs sorting; ranking jobs by wait time requires comparing every pair's arrival timestamps against each other, which is fundamentally a sorting problem rather than a fixed-discipline container"
      ],
      "answer": 0,
      "explanation": "'Longest waiting' is arrival order read backwards — exactly the queue's front. (If jobs instead had PRIORITIES trumping arrival, neither discipline fits — that's the heap, Module 19.)"
    }
  ]
}
```
