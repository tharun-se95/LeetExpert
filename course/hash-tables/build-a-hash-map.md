---
title: Build a Hash Map From Scratch
type: concept
---

## The contract


```diagram
{
  "id": "bucket-layout",
  "capacity": 8,
  "buckets": [
    { "index": 1, "entries": ["alice, 10"] },
    { "index": 4, "entries": ["bob, 20", "bea, 5"] },
    { "index": 6, "entries": ["cara, 7"] }
  ]
}
```

We build a string-keyed map with the full core API — `get`, `set`,
`delete`, `size` — using **separate chaining**, the polynomial hash from
lesson 1, and **doubling at α = 1**. Everything in the previous two
lessons becomes a line of code you can point at.

````tabs
```python
class HashMap:
    def __init__(self) -> None:
        self._num_buckets = 8
        self._size = 0
        self._buckets: list[list[tuple[str, object]]] = [
            [] for _ in range(self._num_buckets)
        ]

    def __len__(self) -> int:
        return self._size

    def _hash(self, key: str) -> int:                 # polynomial hash
        h = 0
        for ch in key:
            h = (h * 31 + ord(ch)) % 1_000_000_007
        return h

    def _bucket(self, key: str) -> list[tuple[str, object]]:
        return self._buckets[self._hash(key) % self._num_buckets]

    def get(self, key: str, default=None):
        for k, v in self._bucket(key):                # scan ONE chain
            if k == key:
                return v
        return default

    def set(self, key: str, value) -> None:
        bucket = self._bucket(key)
        for i, (k, _) in enumerate(bucket):
            if k == key:
                bucket[i] = (key, value)              # overwrite existing
                return
        bucket.append((key, value))                   # new entry
        self._size += 1
        if self._size > self._num_buckets:            # α > 1 → resize
            self._resize()

    def delete(self, key: str) -> bool:
        bucket = self._bucket(key)
        for i, (k, _) in enumerate(bucket):
            if k == key:
                bucket[i] = bucket[-1]                # swap-remove: O(1)
                bucket.pop()
                self._size -= 1
                return True
        return False

    def _resize(self) -> None:
        old_buckets = self._buckets
        self._num_buckets *= 2                        # doubling — amortized O(1)
        self._buckets = [[] for _ in range(self._num_buckets)]
        for bucket in old_buckets:                    # re-file EVERY entry
            for key, value in bucket:
                self._buckets[self._hash(key) % self._num_buckets].append(
                    (key, value)
                )
```

```typescript
type Entry<V> = { key: string; value: V };

class HashMap<V> {
  private numBuckets = 8;
  private sizeCount = 0;
  private buckets: Entry<V>[][] = Array.from({ length: 8 }, () => []);

  get size(): number {
    return this.sizeCount;
  }

  private hash(key: string): number {
    // polynomial hash
    let h = 0;
    for (const ch of key) {
      h = (h * 31 + ch.charCodeAt(0)) % 1_000_000_007;
    }
    return h;
  }

  private bucket(key: string): Entry<V>[] {
    return this.buckets[this.hash(key) % this.numBuckets];
  }

  get_(key: string): V | undefined {
    for (const e of this.bucket(key)) {
      // scan ONE chain
      if (e.key === key) return e.value;
    }
    return undefined;
  }

  set_(key: string, value: V): void {
    const bucket = this.bucket(key);
    for (const e of bucket) {
      if (e.key === key) {
        e.value = value; // overwrite existing
        return;
      }
    }
    bucket.push({ key, value }); // new entry
    this.sizeCount++;
    if (this.sizeCount > this.numBuckets) this.resize(); // α > 1
  }

  delete_(key: string): boolean {
    const bucket = this.bucket(key);
    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i].key === key) {
        bucket[i] = bucket[bucket.length - 1]; // swap-remove: O(1)
        bucket.pop();
        this.sizeCount--;
        return true;
      }
    }
    return false;
  }

  private resize(): void {
    const old = this.buckets;
    this.numBuckets *= 2; // doubling — amortized O(1)
    this.buckets = Array.from({ length: this.numBuckets }, () => []);
    for (const bucket of old) {
      // re-file EVERY entry
      for (const e of bucket) {
        this.buckets[this.hash(e.key) % this.numBuckets].push(e);
      }
    }
  }
}
```
````

## Read the code against the theory

- **Every operation begins `hash → mod → bucket`** — the "compute the
  address" idea, verbatim.
- **`set` scans before appending** — a map holds one value per key;
  the scan is bounded by chain length, i.e. by α.
- **`delete` uses swap-remove** — chains are unordered, so we may move
  the last entry into the hole: O(1) instead of the shifting cost an
  ordered array would pay (Module 4's lesson, exploited).
- **Resize doubles and re-files** — `% self._num_buckets` with the new m
  sends entries to new homes; the amortized-doubling theorem prices it.
- **What's NOT here:** per-entry order. Iteration would walk buckets in
  hash order. Real Python/JS dicts add an insertion-order layer on top.

Try it mentally: insert 9 string keys. The 9th crosses α = 1 with 8
buckets, triggering a resize to 16 — one O(9) rehash, then calm until 17.

## Sets: the same machine, minus values

A **hash set** stores only keys — membership without payload. Every
pattern below that says "map" with a dummy value really wants a set;
Python `set` / JS `Set` are this exact structure with entries of just
`key`. (Our pair-sum `seen` from the first Big O lesson was one.)

```quiz
{
  "questions": [
    {
      "question": "Why can delete use swap-remove (move the last chain entry into the hole) when Module 4 said array deletion costs O(n−i)?",
      "options": [
        "Chains are short so O(n−i) is fine anyway — with load factor kept low, the expected chain length is small enough that even a shifting deletion would cost only a constant amount of work",
        "The O(n−i) cost paid for preserving ORDER; a bucket's chain has no meaningful order to preserve, so any element may fill the hole",
        "Linked lists make deletion free — unlinking a node from a linked chain is always O(1) regardless of ordering requirements, which is the real reason swap-remove isn't needed here"
      ],
      "answer": 1,
      "explanation": "Costs buy properties. Ordered container ⇒ shifting; unordered ⇒ swap-remove. Knowing WHICH property you're paying for lets you drop it when it's worthless."
    },
    {
      "question": "In this implementation, what sequence of events makes a single `set` call cost O(n)?",
      "options": [
        "The insert that pushes size past the bucket count triggers _resize, which re-hashes and re-files all n entries — the amortized-O(1) spike, exactly like the dynamic array's grow",
        "Setting a key that already exists — overwriting a value still walks the full bucket to find the matching key first, and that linear scan is what makes the call cost O(n)",
        "It never can — every operation in this implementation is bounded by the load factor's constant chain length, so no single call is ever allowed to touch more than a fixed number of entries"
      ],
      "answer": 0,
      "explanation": "Same shape as Module 4: cheap steady-state, rare O(n) spike, doubling makes the spikes sum to O(n) over n inserts. One theorem, two structures."
    },
    {
      "question": "If the hash function returned 0 for every key, what would each operation cost, and which premise failed?",
      "options": [
        "Still O(1) — the table absorbs it, since the number of buckets is independent of which bucket keys land in, the resizing logic keeps operations fast regardless of hash quality",
        "O(n): every entry chains in bucket 0, so every operation scans the full chain — the UNIFORMITY premise of the average-case theorem is gone",
        "O(log n) — with every key colliding into one bucket, the chain would effectively become a balanced structure internally once it grows past a certain size, giving logarithmic scan cost"
      ],
      "answer": 1,
      "explanation": "The structure runs fine — correctness doesn't need uniformity — but performance collapses to one long list. Average-case O(1) was a theorem WITH premises, and this deletes one."
    }
  ]
}
```
