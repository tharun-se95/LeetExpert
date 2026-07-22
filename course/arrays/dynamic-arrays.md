---
title: Dynamic Arrays, Built From Scratch
type: concept
---

## The problem a dynamic array solves

A raw array's size is fixed at allocation — the memory after it may belong
to something else, so it cannot simply grow in place. But programs rarely
know sizes up front. The dynamic array's answer:

1. keep a plain array (the **backing store**) with some **capacity**,
2. track how many slots are actually used (the **length**),
3. when an append finds length == capacity, allocate a **bigger** block,
   copy everything over, and retire the old one.

The whole design question is step 3: *how much bigger?* You proved the
answer in the Big O module: grow **multiplicatively** (double), and the
occasional O(n) copy averages out to O(1) amortized per append; grow
additively and appends degrade to O(n) amortized. Now we build it.

## The implementation

Everything the standard `list` / `Array` does for appends, reads, and
removal — from scratch. (Python note: we deliberately use a fixed-size
allocation to *simulate* the raw array underneath.)

````tabs
```python
class DynamicArray:
    def __init__(self) -> None:
        self._capacity = 1
        self._length = 0
        self._store = [None] * self._capacity   # simulated raw array

    def __len__(self) -> int:
        return self._length

    def get(self, i: int):
        if not 0 <= i < self._length:
            raise IndexError(i)
        return self._store[i]                   # O(1): address arithmetic

    def set(self, i: int, value) -> None:
        if not 0 <= i < self._length:
            raise IndexError(i)
        self._store[i] = value                  # O(1)

    def append(self, value) -> None:
        if self._length == self._capacity:
            self._grow()                        # O(n), but rare
        self._store[self._length] = value       # O(1)
        self._length += 1

    def pop(self):
        if self._length == 0:
            raise IndexError("pop from empty array")
        self._length -= 1
        value = self._store[self._length]
        self._store[self._length] = None        # release the reference
        return value                            # O(1) — no shifting at the end

    def insert(self, i: int, value) -> None:
        if not 0 <= i <= self._length:
            raise IndexError(i)
        if self._length == self._capacity:
            self._grow()
        for j in range(self._length, i, -1):    # shift right: O(n - i)
            self._store[j] = self._store[j - 1]
        self._store[i] = value
        self._length += 1

    def _grow(self) -> None:
        self._capacity *= 2                     # multiplicative — load-bearing!
        new_store = [None] * self._capacity
        for j in range(self._length):           # copy: O(n)
            new_store[j] = self._store[j]
        self._store = new_store
```

```typescript
class DynamicArray<T> {
  private capacity = 1;
  private length_ = 0;
  private store: (T | undefined)[] = new Array(1); // simulated raw array

  get length(): number {
    return this.length_;
  }

  get(i: number): T {
    if (i < 0 || i >= this.length_) throw new RangeError(`index ${i}`);
    return this.store[i] as T; // O(1): address arithmetic
  }

  set(i: number, value: T): void {
    if (i < 0 || i >= this.length_) throw new RangeError(`index ${i}`);
    this.store[i] = value; // O(1)
  }

  append(value: T): void {
    if (this.length_ === this.capacity) this.grow(); // O(n), but rare
    this.store[this.length_] = value; // O(1)
    this.length_++;
  }

  pop(): T {
    if (this.length_ === 0) throw new RangeError("pop from empty array");
    this.length_--;
    const value = this.store[this.length_] as T;
    this.store[this.length_] = undefined; // release the reference
    return value; // O(1) — no shifting at the end
  }

  insert(i: number, value: T): void {
    if (i < 0 || i > this.length_) throw new RangeError(`index ${i}`);
    if (this.length_ === this.capacity) this.grow();
    for (let j = this.length_; j > i; j--) {
      this.store[j] = this.store[j - 1]; // shift right: O(n - i)
    }
    this.store[i] = value;
    this.length_++;
  }

  private grow(): void {
    this.capacity *= 2; // multiplicative — load-bearing!
    const next: (T | undefined)[] = new Array(this.capacity);
    for (let j = 0; j < this.length_; j++) next[j] = this.store[j];
    this.store = next;
  }
}
```
````

Walk the code against the design: `append` is a single write except when
`_grow` fires; `_grow` doubles (the amortization argument needs exactly
this); `pop` at the end never shifts; `insert` pays the shifting cost that
contiguity demands. Step through five appends and watch `_grow` earn its
keep:

```viz
{ "id": "dynamic-array-growth", "values": [3, 7, 1, 9, 4] }
```

```complexity
{
  "operations": [
    { "name": "get / set", "time": "O(1)", "why": "direct index into the backing store" },
    { "name": "append", "time": "O(1) amortized", "why": "doubling: total copy work across n appends is 1+2+4+…+n/2 < n (proved in Big O module)" },
    { "name": "pop (end)", "time": "O(1)", "why": "decrement length; nothing moves" },
    { "name": "insert / delete at i", "time": "O(n − i)", "why": "shift to preserve contiguity — inherited from the raw array" }
  ]
}
```

## Design notes worth internalizing

- **Length ≠ capacity.** The store is usually bigger than the data. Space
  is O(n) still — doubling wastes at most half, a constant factor.
- **Why not shrink eagerly?** Popping just below a power of two and
  re-appending would then thrash grow/shrink at O(n) each. Real
  implementations shrink lazily (e.g. at ¼ occupancy) or never — keeping
  the amortized argument intact.
- **Growth factors in the wild** are 1.5×–2× (Python ~1.125×+ overallocation
  pattern, many `ArrayList`s 1.5×, JS engines vary). Any factor > 1 gives
  O(1) amortized; the choice trades memory waste against copy frequency.

```quiz
{
  "questions": [
    {
      "question": "In the implementation above, which operations can trigger the O(n) copy?",
      "options": [
        "get and set — reading or writing an existing slot can trigger a bounds-check-triggered reallocation if the backing store's capacity tracking falls out of sync with its logical length",
        "append and insert — anything that adds an element when length == capacity",
        "Only pop — shrinking the logical length can force the backing store to reallocate down to a smaller block to avoid holding onto unused capacity indefinitely"
      ],
      "answer": 1,
      "explanation": "Growth happens exactly when adding to a full store. Reads never resize; pop only shrinks length."
    },
    {
      "question": "Why does pop-at-end run in strict O(1) while insert-at-0 costs O(n)?",
      "options": [
        "Removing the last element leaves no gap; removing/inserting at the front requires shifting every element to keep the block contiguous",
        "pop uses the capacity slack — since capacity is usually larger than length, popping just decrements into that pre-allocated slack space instead of touching the backing store's actual boundary",
        "pop is implemented in native code — the standard library's version bypasses the interpreter loop entirely, a language-runtime speedup unrelated to the array's underlying layout"
      ],
      "answer": 0,
      "explanation": "Contiguity is only threatened by interior changes. The end of the array is the one place you can add/remove without moving anyone else — a fact stacks (Module 8) are built on."
    },
    {
      "question": "If _grow used `capacity += 8` instead of `capacity *= 2`, appends would become…",
      "options": [
        "O(n) amortized — a full copy every 8 appends sums to ~n²/8 total work",
        "O(log n) amortized — a fixed increment still spaces resizes apart in a way that mirrors a halving pattern once accounted for across the full sequence of appends",
        "O(1) amortized still — since 8 is a constant, any constant amount of growth per resize should preserve the same amortized guarantee that doubling provides"
      ],
      "answer": 0,
      "explanation": "Additive growth means copies of size ~8, 16, 24, … n arrive at a constant rate: total Θ(n²)/n = Θ(n) per append. Multiplicative growth spaces copies exponentially apart — that's the whole theorem from the Big O module."
    }
  ]
}
```
