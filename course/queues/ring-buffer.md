---
title: Build a Ring Buffer
type: concept
---

## The clock, made structural

Module 3 promised the mod-as-clock model would run a real structure.
Here it is: a **ring buffer** (circular queue) is a fixed-size array
where the front and back **wrap around** — index arithmetic mod
capacity. No shifting, no compaction, no allocation after construction:
both queue operations are pure index moves.

```text
capacity 5:      [ _, B, C, D, _ ]
                      ↑        ↑
                    head      (tail lands here next)
enqueue(E):      [ _, B, C, D, E ]      tail wraps: (4+1) % 5 = 0
enqueue(F):      [ F, B, C, D, E ]      the "ring" in action
```

Fixed capacity is a *feature* in the ring's home turf — network
buffers, keyboard input, audio streams, log rings — where bounded
memory and zero allocation are requirements, not limitations.

## The one design decision: full vs empty

With head and tail both moving, `head == tail` is ambiguous: an empty
ring and a completely full ring look identical. Every implementation
must break the tie. The two standard answers:

1. **Keep a size counter** (we do this — simplest and clearest);
2. Sacrifice one slot: "full" means tail is one-behind head — capacity
   costs one wasted cell, but no counter.

## The implementation

````tabs
```python
class RingBuffer:
    def __init__(self, capacity: int) -> None:
        self._store = [None] * capacity
        self._capacity = capacity
        self._head = 0                    # index of front element
        self._size = 0                    # breaks the full/empty tie

    def is_empty(self) -> bool:
        return self._size == 0

    def is_full(self) -> bool:
        return self._size == self._capacity

    def enqueue(self, value) -> bool:
        if self.is_full():
            return False                  # or: overwrite / raise — a policy
        tail = (self._head + self._size) % self._capacity   # derived!
        self._store[tail] = value
        self._size += 1
        return True

    def dequeue(self):
        if self.is_empty():
            raise IndexError("dequeue from empty ring")
        value = self._store[self._head]
        self._store[self._head] = None    # release the reference
        self._head = (self._head + 1) % self._capacity      # the wrap
        self._size -= 1
        return value

    def peek(self):
        if self.is_empty():
            raise IndexError("peek at empty ring")
        return self._store[self._head]
```

```typescript
class RingBuffer<T> {
  private store: (T | undefined)[];
  private head = 0; // index of front element
  private sizeCount = 0; // breaks the full/empty tie

  constructor(private capacity: number) {
    this.store = new Array(capacity);
  }

  get size(): number {
    return this.sizeCount;
  }

  isFull(): boolean {
    return this.sizeCount === this.capacity;
  }

  enqueue(value: T): boolean {
    if (this.isFull()) return false; // or: overwrite / throw — a policy
    const tail = (this.head + this.sizeCount) % this.capacity; // derived!
    this.store[tail] = value;
    this.sizeCount++;
    return true;
  }

  dequeue(): T | undefined {
    if (this.sizeCount === 0) return undefined;
    const value = this.store[this.head];
    this.store[this.head] = undefined; // release the reference
    this.head = (this.head + 1) % this.capacity; // the wrap
    this.sizeCount--;
    return value;
  }

  peek(): T | undefined {
    return this.sizeCount === 0 ? undefined : this.store[this.head];
  }
}
```
````

Watch the ring fill, drain, and wrap on the diagram's own example — in a
circular layout, wrapping from the last slot to the first isn't a jump,
it's just the next neighbor:

```viz
{ "id": "ring-buffer", "capacity": 5, "ops": ["+A", "+B", "+C", "+D", "-", "+E", "+F"] }
```

Design notes worth reading against the code:

- **tail is derived, not stored**: `(head + size) % capacity`. One
  fewer variable to keep consistent — the same invariant-shrinking
  instinct as Module 7's dummy node. (Storing tail is also fine; then
  size or the sacrificial slot must disambiguate.)
- **The wraps are the Module 3 clock**: `(head + 1) % capacity` steps
  the ring; in a language where indices could go negative, the
  `((x % n) + n) % n` fix would apply — here they only grow, so plain
  `%` is safe in both languages.
- **Full-ring policy is a real decision**: reject (ours), overwrite the
  oldest (logging rings do this — the ring becomes a "last N items"
  window), or block (producer-consumer queues). The structure is the
  same; the policy is the product requirement.

```complexity
{
  "operations": [
    { "name": "enqueue / dequeue / peek", "time": "O(1) worst case — not amortized", "why": "pure index arithmetic; no resize ever happens. Stricter than the dynamic array's amortized bound — this is why real-time systems (audio!) use rings" },
    { "name": "space", "time": "O(capacity), fixed", "why": "allocated once up front; zero allocation during operation" }
  ]
}
```

That "O(1) worst case, not amortized" line is the ring's quiet superpower:
no operation EVER spikes. Systems that can't tolerate a pause (audio
callbacks, interrupt handlers) choose rings precisely to avoid the
dynamic array's rare-but-real O(n) copy.

```quiz
{
  "questions": [
    {
      "question": "Why does head == tail need a tie-breaker (size counter or sacrificial slot)?",
      "options": [
        "Both a completely empty and a completely full ring place tail on head — the index pair alone carries log₂(capacity²) bits but the state space has capacity+1 distinct fills; one configuration must encode two states without extra information",
        "It doesn't — head == tail always means empty; a full ring is structurally prevented from ever advancing tail back onto head, so the collision this question describes can't actually occur",
        "Because tail can overtake head — without a tie-breaker, a fast enqueue sequence could let tail lap past head entirely, silently overwriting unread entries before dequeue ever gets a chance to read them"
      ],
      "answer": 0,
      "explanation": "After capacity enqueues, tail wraps exactly onto head — the same picture as never having enqueued. The counter (or the wasted slot) adds the missing bit. Catching where a representation ALIASES two states is a core design-review skill."
    },
    {
      "question": "The ring's O(1) is 'worst case', the dynamic array's push is 'O(1) amortized'. When does this distinction actually matter?",
      "options": [
        "Never — amortized and worst case are equivalent in practice; since both bounds average out to the same constant over any sufficiently long run of operations, no real system could actually observe a difference between them",
        "When individual-operation latency matters (audio callbacks, real-time systems): the array's rare O(n) resize is a latency spike the ring structurally cannot have — at the price of fixed capacity",
        "Only for very large queues — the resize spike's cost grows with the structure's size, so the distinction only becomes practically relevant once a queue holds enough elements for that one-time cost to matter"
      ],
      "answer": 1,
      "explanation": "Amortized bounds promise cheap TOTALS while permitting expensive moments. Fixed capacity is what the ring pays for eliminating the moments. Choosing between them is a requirements question — throughput vs latency — not a Big O question."
    },
    {
      "question": "In enqueue, tail = (head + size) % capacity. Why is deriving tail preferable to storing it?",
      "options": [
        "A stored tail is a second mutable variable whose consistency with head/size must be maintained by EVERY method — deriving it makes desync structurally impossible, the same move as computing rather than caching any redundant state",
        "Stored tails waste memory — a dedicated integer field for tail occupies additional space in the struct that a purely derived value wouldn't need, which is the primary cost being avoided",
        "It's faster to compute than to read — a modular-arithmetic computation executes in fewer CPU cycles than a plain memory read of a stored field, making derivation the faster option on every call"
      ],
      "answer": 0,
      "explanation": "Module 7's delete-forgot-the-tail bug was exactly a redundant-variable desync. Where a value is cheaply derivable, deriving it deletes a whole bug class. (Cache it only when profiling says the recomputation hurts — it's one add and one mod.)"
    }
  ]
}
```
