---
title: Kth Largest Element in a Stream
type: problem
---

## Problem

Design a class `KthLargest` that tracks the **kth largest** element in a
stream of numbers (note: the kth largest *value in sorted order*, counting
duplicates — not the kth distinct value).

- The constructor takes `k` and an initial array `nums`.
- `add(val)` appends `val` to the stream and returns the kth largest
  element seen so far.

**Example** (LeetCode 703)

```text
KthLargest(3, [4, 5, 8, 2])   // k = 3
add(3)  → 4      stream sorted desc: 8,5,4,3,2  → 3rd largest is 4
add(5)  → 5      8,5,5,4,3,2                    → 3rd largest is 5
add(10) → 5      10,8,5,5,4,3,2                 → 3rd largest is 5
add(9)  → 8      10,9,8,5,5,4,3,2               → 3rd largest is 8
add(4)  → 8      10,9,8,5,5,4,4,3,2             → 3rd largest is 8
```

**Constraints:** 1 ≤ k ≤ 10⁴, up to 10⁴ `add` calls, values in ±10⁴.

## Attempt it first

The naive version is easy; the point is to find the version whose `add`
does *not* re-sort the whole stream each time. Before reading on, ask
yourself the sharp question: to answer "kth largest," **how much of the
stream do you actually need to keep?** You are never asked about the
elements smaller than the kth largest — can you throw them away? And of
the elements you keep, which single one is the answer, and where would it
sit in a heap so you can read it in O(1)?

````reveal Hint — how much state do you truly need?
At any moment the answer is the kth largest value. The `k−1` values above
it and the answer itself are the only ones that can ever be returned;
everything smaller is irrelevant *and stays irrelevant* (adding more
elements can only push the boundary higher, never lower). So you need to
retain just the **top k elements**. The answer is the *smallest* of those
top k. What structure gives you the smallest of a set in O(1) and lets you
drop it cheaply when a better candidate arrives?
````

## Brute force, for contrast

Keep every element in a list. On each `add`, append and sort descending,
then return index `k−1`:

```text
add(val):  stream.append(val); stream.sort(reverse=True); return stream[k-1]
```

Correct, but each `add` sorts up to `n` elements: **O(n log n) per add**,
O(n² log n) over the whole stream. We're re-sorting data that was already
sorted a moment ago, and we're keeping elements we will never report.

## The insight: a min-heap of size k

Two observations collapse the problem:

1. **You only ever need the top k elements.** The answer is the kth
   largest, so anything ranked below kth can never be the answer now or
   later (future adds only raise the bar). Discard the bottom.

2. **Among the top k, the answer is the *smallest*.** Sort the top k
   descending: positions 1..k. Position k — the last, smallest of the top
   group — *is* the kth largest. So the element we want to report is the
   minimum of our retained set.

That second point is the whole trick, and it's why we use a **min-heap,
not a max-heap**, even though the question asks for the *largest*. A
min-heap keeps its smallest element at the root, readable in O(1) — and
the smallest of the top-k set is exactly the kth-largest answer. Better
still, the root is precisely the element we want to **evict** when a
larger value arrives: if the new value beats the current kth largest, it
belongs in the top k, and the element it displaces is the old smallest —
sitting right at the root, ready to pop.

So maintain a min-heap holding at most k elements:

- On `add(val)`: push `val`. If the heap now exceeds size k, pop the
  minimum (drop the smallest — it's fallen out of the top k). The heap
  always holds exactly the current top k, and its root is the answer.

Each `add` does one push and at most one pop on a heap of size ≤ k:
**O(log k)**, independent of how long the stream is.

## Solution

`````reveal Solution — size-k min-heap
Python's `heapq` is a min-heap, so this is direct. In TypeScript we reuse
the `MinHeap` class from the "Heapify" concept lesson.

````tabs
```python
import heapq

class KthLargest:
    def __init__(self, k: int, nums: list[int]) -> None:
        self.k = k
        self.heap = nums[:]           # copy, then reduce to top k
        heapq.heapify(self.heap)      # O(n) build (see Heapify lesson)
        while len(self.heap) > k:
            heapq.heappop(self.heap)  # drop everything below the top k

    def add(self, val: int) -> int:
        if len(self.heap) < self.k:
            heapq.heappush(self.heap, val)
        elif val > self.heap[0]:      # beats the current kth largest?
            heapq.heapreplace(self.heap, val)  # pop min, push val — one sift
        return self.heap[0]           # root = smallest of top k = kth largest
```

```typescript
// MinHeap is the from-scratch class from the "Heapify" concept lesson.
class KthLargest {
  private k: number;
  private heap = new MinHeap();

  constructor(k: number, nums: number[]) {
    this.k = k;
    for (const v of nums) {
      this.heap.push(v);
      if (this.heap.size > k) this.heap.pop(); // keep only the top k
    }
  }

  add(val: number): number {
    if (this.heap.size < this.k) {
      this.heap.push(val);
    } else if (val > this.heap.peek()) {
      // beats the current kth largest → replace the root
      this.heap.pop();
      this.heap.push(val);
    }
    return this.heap.peek(); // root = smallest of top k = kth largest
  }
}
```
````

`heapreplace` in Python pops the current min and pushes the new value in a
single sift-down — slightly cheaper than a separate pop then push, and
safe here because we only call it when `val > heap[0]`, so the new value
genuinely belongs and the old root genuinely leaves. The guard
`val > self.heap[0]` matters: without it, a value smaller than the current
kth largest would still be pushed and immediately popped, wasting work —
worse, replacing when the heap isn't yet full would break the count.

```complexity
{
  "operations": [
    { "name": "constructor", "time": "O(n log k) — or O(n) if you heapify then trim", "why": "heapify is O(n); trimming to size k pops n−k times at O(log n) each. Pushing one at a time with a size cap is O(n log k)." },
    { "name": "add", "time": "O(log k)", "why": "one push and at most one pop on a heap of size ≤ k — the height is log k, independent of the stream length n" },
    { "name": "space", "time": "O(k)", "why": "the heap never holds more than k elements; everything below the top k is discarded permanently" }
  ]
}
```
`````

Notice how much the size cap buys: `add` is O(log **k**), not O(log **n**).
For a long stream (n = 10⁴) tracking the 3rd largest (k = 3), each update
touches a 3-element heap — essentially constant — versus the brute force's
full re-sort. Bounding the heap to k is what makes this scale.

## Variants

- **Kth Largest Element in an Array** (one-shot, not a stream): the same
  size-k min-heap gives O(n log k); or use quickselect (Module 14's
  partition) for O(n) average. The streaming setting is what *forces* the
  heap — quickselect needs the whole array at once.
- **K Closest Points to Origin** (this module): the *mirror* — a size-k
  **max**-heap, because there you keep the k *smallest* distances and evict
  the largest. Watch the orientation flip; it's the same pattern reflected.
- **Top K Frequent Elements** (this module): a size-k min-heap keyed on
  frequency — the same "keep the top k, root is the eviction candidate"
  structure, over (frequency, value) pairs.

```quiz
{
  "questions": [
    {
      "question": "The problem asks for the kth LARGEST element, yet the solution uses a MIN-heap. Why is a min-heap the correct choice here rather than a max-heap?",
      "options": [
        "Min-heaps are faster than max-heaps in general — the underlying sift operations for a min-heap execute with fewer comparisons per step than a max-heap's, making min-heaps the more efficient default choice",
        "A max-heap can't store more than one element at a time — the max-heap data structure is fundamentally limited to tracking a single current maximum, unlike a min-heap which can hold an arbitrary collection",
        "We retain only the top k elements, and among those k the kth largest is the SMALLEST — a min-heap keeps that smallest at its root for O(1) reads, and the root is also exactly the element to evict when a larger value arrives"
      ],
      "answer": 2,
      "explanation": "The answer is the boundary of the top-k set: the smallest element still in the top k. A min-heap puts that boundary at the root, readable in O(1) and poppable in O(log k) when a bigger value bumps it out. A max-heap would put the LARGEST of the top k at the root — the wrong end, and it would make eviction of the correct element awkward. Orientation follows the eviction target, not the word in the problem."
    },
    {
      "question": "Why is each add O(log k) rather than O(log n), where n is the total number of elements added to the stream?",
      "options": [
        "Because add only runs when the stream length is a power of two — the algorithm only performs the expensive heap operation at specific milestone lengths, amortizing the cost down to an effective log k per call on average",
        "The heap is capped at size k: everything ranked below the kth largest is discarded permanently (future adds can only raise the boundary, never lower it), so push/pop operate on a heap of height log k no matter how long the stream grows",
        "Because heaps are always O(log k) regardless of size — this is simply an inherent property of heap data structures in general, true of any heap implementation regardless of how it's actually used in a given algorithm"
      ],
      "answer": 1,
      "explanation": "The size cap is the win. Elements below the top k can never become an answer, so we throw them away and the heap stays at k elements forever. Heap operation cost depends on the heap's height, which is log k — decoupled from n. Tracking the 3rd largest over a million-element stream still touches only a 3-element heap per update."
    }
  ]
}
```
