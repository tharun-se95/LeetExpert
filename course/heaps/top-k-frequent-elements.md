---
title: Top K Frequent Elements
type: problem
---

## Problem

Given an integer array `nums` and an integer `k`, return the `k` most
frequent elements. The answer may be in any order; the test guarantees it
is unique.

**Example** (LeetCode 347)

```text
nums = [1,1,1,2,2,3], k = 2   →  [1, 2]
   (1 appears ×3, 2 appears ×2, 3 appears ×1 — the two most frequent are 1 and 2)

nums = [1], k = 1             →  [1]
```

**Constraints:** 1 ≤ n ≤ 10⁵, k is between 1 and the number of distinct
values, values in ±10⁴.

## Attempt it first

Step one is unavoidable and cheap: count how often each value appears (a
hash map, Module 6 — one O(n) pass). The real question is step two. You
now have `m` distinct values with their counts and you want the `k` with
the highest counts. Before reading on, decide: do you need to *fully
order* all `m` values by frequency to name the top k? Sorting them is one
option — what does it cost, and can you do better when `k` is much smaller
than `m`?

```sandbox
{
  "id": "top-k-frequent-elements",
  "fn": {
    "python": "top_k_frequent",
    "javascript": "topKFrequent"
  },
  "check": "return",
  "compare": "sorted",
  "starter": {
    "python": "def top_k_frequent(nums, k):\n    # Return the k most frequent values, in any order.\n    pass\n",
    "javascript": "function topKFrequent(nums, k) {\n  // Return the k most frequent values, in any order.\n}\n"
  },
  "cases": [
    {
      "args": [
        [
          1,
          1,
          1,
          2,
          2,
          3
        ],
        2
      ],
      "expect": [
        1,
        2
      ]
    },
    {
      "args": [
        [
          1
        ],
        1
      ],
      "expect": [
        1
      ]
    },
    {
      "args": [
        [
          1,
          2,
          3,
          4
        ],
        4
      ],
      "expect": [
        1,
        2,
        3,
        4
      ]
    },
    {
      "args": [
        [
          4,
          4,
          4,
          5,
          5,
          6
        ],
        1
      ],
      "expect": [
        4
      ]
    },
    {
      "args": [
        [
          -1,
          -1,
          2,
          2,
          2,
          3
        ],
        2
      ],
      "expect": [
        2,
        -1
      ]
    },
    {
      "args": [
        [
          5,
          5,
          4,
          4,
          3
        ],
        3
      ],
      "expect": [
        5,
        4,
        3
      ]
    }
  ]
}
```

````reveal Hint — you don't need a total order
Sorting all m distinct values by frequency is O(m log m) and gives you far
more than asked — a full ranking when you only need the top k. As in the
previous lesson, you can keep a **bounded** structure of size k and stream
the m values through it, so the per-element cost is log **k** rather than
log **m**. Which heap orientation lets you cheaply discard the *least*
frequent element still in your candidate set?
````

## Brute force, for contrast

Count frequencies (O(n)), then sort the `m` distinct entries by count
descending and take the first k:

```text
counts = Counter(nums)                 # O(n)
ranked = sorted(counts, key=counts.get, reverse=True)   # O(m log m)
return ranked[:k]
```

Correct, and honestly fine in practice. But it does redundant work: it
produces a *complete* ordering of all `m` values when we only need the top
k. When `k ≪ m` (say the 2 most frequent out of 50,000 distinct values),
we're paying `log m` per element to learn a ranking we throw away.

## The insight: a size-k min-heap over (frequency, value) pairs

This is the previous lesson's pattern applied to *counts* instead of raw
values. After building the frequency map, we have `m` pairs
`(freq, value)`. We want the k pairs with the largest `freq`. Reusing the
Kth-Largest reasoning:

- We only need to retain the **top k** pairs by frequency.
- Among those k, the one on the bubble — the *least* frequent still in the
  set — is the first to be evicted when a more-frequent value shows up.
- A **min-heap keyed on frequency** keeps that least-frequent pair at its
  root, so we can compare against it in O(1) and pop it in O(log k).

Stream all `m` pairs through a heap capped at size k: push each pair; if
the heap exceeds k, pop the minimum-frequency pair. What remains is the k
most frequent. The heap only ever holds k pairs, so each push/pop is
**O(log k)**, and the whole second phase is **O(m log k)**.

Compare the totals. Sorting: O(n + m log m). Heap: O(n + m log k). Since
`k ≤ m`, `log k ≤ log m`, so the heap is never worse and is markedly
better when `k ≪ m`. Bounding the heap size to k — refusing to hold more
candidates than the answer needs — is the entire saving.

(There's an even faster O(n) method, bucket sort by frequency, noted in
the variants. The heap is the right *general* tool and the one this module
is teaching; the bucket trick exploits that counts are bounded by n.)

## Solution

`````reveal Solution — size-k min-heap keyed on frequency
In Python, `heapq` orders tuples lexicographically, so pushing
`(freq, value)` makes it a min-heap on `freq` (ties broken by `value`,
which is harmless here). In TypeScript we need a heap that compares by a
key; the `MinHeap` from the "Heapify" lesson stored raw numbers, so here
we store the frequency as the sort key alongside the value — the snippet
shows a small key-carrying variant.

````tabs
```python
import heapq
from collections import Counter

def top_k_frequent(nums: list[int], k: int) -> list[int]:
    counts = Counter(nums)               # O(n): value -> frequency
    heap: list[tuple[int, int]] = []     # min-heap of (freq, value)
    for value, freq in counts.items():   # stream the m distinct pairs
        heapq.heappush(heap, (freq, value))
        if len(heap) > k:
            heapq.heappop(heap)          # drop the least frequent so far
    return [value for freq, value in heap]  # the k most frequent (any order)
```

```typescript
function topKFrequent(nums: number[], k: number): number[] {
  const counts = new Map<number, number>(); // O(n): value -> frequency
  for (const v of nums) counts.set(v, (counts.get(v) ?? 0) + 1);

  // min-heap of [freq, value], ordered by freq. Reuses the sift logic from
  // the Heapify lesson, comparing element[0] (the frequency key).
  const heap: [number, number][] = [];
  const up = (i: number) => {
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (heap[i][0] < heap[p][0]) {
        [heap[i], heap[p]] = [heap[p], heap[i]];
        i = p;
      } else break;
    }
  };
  const down = (i: number) => {
    const n = heap.length;
    while (true) {
      let s = i;
      const l = 2 * i + 1;
      const r = 2 * i + 2;
      if (l < n && heap[l][0] < heap[s][0]) s = l;
      if (r < n && heap[r][0] < heap[s][0]) s = r;
      if (s === i) break;
      [heap[i], heap[s]] = [heap[s], heap[i]];
      i = s;
    }
  };

  for (const [value, freq] of counts) {
    heap.push([freq, value]);
    up(heap.length - 1);
    if (heap.length > k) {
      [heap[0], heap[heap.length - 1]] = [heap[heap.length - 1], heap[0]];
      heap.pop();
      down(0); // drop the least-frequent pair
    }
  }
  return heap.map(([, value]) => value); // k most frequent, any order
}
```
````

```complexity
{
  "time": "O(n + m log k), where n = array length and m = number of distinct values",
  "space": "O(m)",
  "why": "Counting is one O(n) pass. The heap holds at most k pairs, so each of the m pushes and pops costs O(log k). The frequency map dominates space at O(m) (≤ n)."
}
```
`````

The key line is the size cap `if len(heap) > k: pop`. Without it you'd
have a plain heap of all m pairs (O(m log m) to fill, no better than
sorting). With it, the heap is a moving window of the k best-so-far, and
every operation is log k. When k is small and m is large — the case that
matters — this is the difference between log 2 and log 50000 per element.

## Variants

- **Bucket sort, O(n):** a frequency can range only from 1 to n, so make
  `n+1` buckets, place each value in the bucket for its count, and read
  buckets from the top down until you have k. No heap, no log factor —
  it trades the heap's generality for the fact that counts are
  small integers. Worth knowing as the asymptotically-optimal answer.
- **Kth Largest Element in a Stream** (this module): the same size-k
  min-heap, keyed on the value itself instead of a frequency — this
  problem is that pattern with a counting pre-pass bolted on.
- **Top K Frequent Words** (LeetCode 692): identical heap, but ties break
  by lexicographic order, so the heap's comparator must order by
  `(freq, then reverse-alphabetical)` to evict correctly — a good exercise
  in getting a multi-key heap comparator right.

```quiz
{
  "questions": [
    {
      "question": "After counting frequencies of m distinct values, why is a size-k min-heap (O(m log k)) preferred over just sorting all m values by frequency (O(m log m)) when k is much smaller than m?",
      "options": [
        "Sorting produces a full ranking of all m values, which is more than the question asks; capping the heap at k means every push/pop touches only a k-element heap, so the per-element cost is log k instead of log m — a real saving precisely when k ≪ m",
        "Sorting can't handle frequency ties, but a heap can — a comparison sort has no well-defined behavior when two elements share the same frequency, whereas a heap resolves such ties automatically and correctly",
        "A heap uses less memory than sorting in every case — bounding the heap to size k also reduces its memory footprint below what an in-place sort of all m elements would require, regardless of how k and m compare"
      ],
      "answer": 0,
      "explanation": "Both start with the same O(n) count. The difference is the second phase: sorting orders all m entries (log m per element) to answer a question that only needs the top k, while the bounded heap never holds more than k candidates (log k per element). When you want the 2 most frequent out of 50,000 distinct values, log k ≈ 1 versus log m ≈ 16 — the heap does far less work for the same answer."
    },
    {
      "question": "In the size-k min-heap of (frequency, value) pairs, what sits at the root, and why does that make eviction correct?",
      "options": [
        "An arbitrary pair, since heaps don't order by frequency — the heap structure here is really just an unordered bag of candidate pairs, and which one happens to sit at index 0 is not meaningful",
        "The LEAST frequent pair currently among the top-k candidates — it's the one that should be dropped first when a more-frequent value arrives, and a min-heap exposes it at the root in O(1) for an O(log k) pop",
        "The most frequent pair, so we can return it immediately — since the heap is built to track the top-k candidates, its root naturally surfaces the single most frequent value among them for instant access"
      ],
      "answer": 1,
      "explanation": "Keying the min-heap on frequency puts the smallest frequency at the root. That bubble element is exactly the candidate most deserving of eviction: if a new value is more frequent than the current minimum, the minimum no longer belongs in the top k and gets popped. This is the same 'root = eviction target' logic as Kth Largest — a min-heap for a 'top/most' question, because the eviction candidate is the smallest of the retained set."
    }
  ]
}
```
