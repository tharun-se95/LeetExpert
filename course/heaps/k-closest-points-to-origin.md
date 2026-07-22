---
title: K Closest Points to Origin
type: problem
---

## Problem

Given an array of `points` where `points[i] = [xi, yi]` represents a
point on the X-Y plane, return the `k` points **closest to the origin
(0, 0)**, in any order. Distance is the usual Euclidean distance.
(LeetCode 973.)

**Examples**

```text
points = [[1,3],[-2,2]], k = 1  →  [[-2,2]]
points = [[3,3],[5,-1],[-2,4]], k = 2  →  [[3,3],[-2,4]]
```

**Constraints:** `1 ≤ k ≤ points.length ≤ 10⁴`, coordinates in ±10⁴.

## Attempt it first

This is structurally the sibling of Kth Largest Element in a Stream —
both maintain a fixed-size-k heap of "the best k seen so far" — but
here the heap orientation FLIPS. Before opening anything, work out
precisely why: in Kth Largest, you wanted a min-heap so the smallest of
your current top-k sat at the root, ready to be evicted the instant
something larger arrived. Here, what quantity do you want sitting at
the root, ready for eviction, as you scan through candidate points?

````reveal Hint — max-heap by distance, evict the farthest
You want the k points with the SMALLEST distances — the opposite
direction from Kth Largest's "keep the k biggest." So maintain a
max-heap of size k, ordered by distance: as long as the heap has fewer
than k points, just push. Once it's at size k, compare each new
candidate's distance against the heap's root (the LARGEST distance
currently kept) — if the new point is closer than that, evict the root
and push the new point; otherwise skip it entirely, since it can't be
among the k closest. The root is always "the worst of the best k so
far, ready to be bumped" — but here "worst" means farthest, so the heap
must be a MAX-heap, the mirror image of Kth Largest's min-heap.
````

## Brute force, for contrast

Compute every point's distance, sort all `n` points by distance, and
take the first `k`:

````tabs
```python
import math

def k_closest_bruteforce(points: list[list[int]], k: int) -> list[list[int]]:
    points_sorted = sorted(points, key=lambda p: p[0] ** 2 + p[1] ** 2)
    return points_sorted[:k]
```

```typescript
function kClosestBruteforce(points: number[][], k: number): number[][] {
  const sorted = [...points].sort((a, b) => (a[0] ** 2 + a[1] ** 2) - (b[0] ** 2 + b[1] ** 2));
  return sorted.slice(0, k);
}
```
````

(Note: comparing squared distance, not the actual Euclidean distance
with a square root, is sufficient and cheaper — since `sqrt` is
monotonic, ordering by `x² + y²` gives the identical ordering as
ordering by `√(x² + y²)`, without the wasted `sqrt` call on every
point.) This is O(n log n) — correct, but it fully sorts all n points
when only the k smallest distances actually matter; the other `n − k`
points' relative order among themselves is discarded work.

## The insight

Bound a heap to size k instead of sorting everything. A max-heap (by
distance) of size k always holds "the best k candidates found in the
scan so far," with the single worst of them (farthest) sitting at the
root — exactly where it needs to be to compare against, and evict in
favor of, any better candidate encountered later. Once every point has
been scanned once, the heap necessarily contains the true k closest,
because any point that was ever farther than the current worst-of-top-k
was correctly rejected the moment it was compared, and any point that
was ever closer correctly bumped out the previous worst.

## Solution

`````reveal Solution — size-k max-heap by distance
````tabs
```python
import heapq

def k_closest(points: list[list[int]], k: int) -> list[list[int]]:
    heap: list[tuple[int, list[int]]] = []   # max-heap via negated distance
    for point in points:
        dist = point[0] ** 2 + point[1] ** 2
        if len(heap) < k:
            heapq.heappush(heap, (-dist, point))          # still filling to k
        elif -dist > heap[0][0]:                          # closer than the current worst kept
            heapq.heapreplace(heap, (-dist, point))        # evict root, push new — one O(log k) step
    return [point for _, point in heap]
```

```typescript
function kClosest(points: number[][], k: number): number[][] {
  // Max-heap by distance: parent's distance >= children's distances.
  const heap: number[][] = []; // each entry: [distance, x, y]

  function siftUp(i: number): void {
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (heap[i][0] > heap[p][0]) {
        [heap[i], heap[p]] = [heap[p], heap[i]];
        i = p;
      } else break;
    }
  }
  function siftDown(i: number): void {
    const n = heap.length;
    while (true) {
      let s = i;
      const l = 2 * i + 1,
        r = 2 * i + 2;
      if (l < n && heap[l][0] > heap[s][0]) s = l;
      if (r < n && heap[r][0] > heap[s][0]) s = r;
      if (s === i) break;
      [heap[i], heap[s]] = [heap[s], heap[i]];
      i = s;
    }
  }

  for (const [x, y] of points) {
    const dist = x * x + y * y;
    if (heap.length < k) {
      heap.push([dist, x, y]);
      siftUp(heap.length - 1);
    } else if (dist < heap[0][0]) {
      // closer than the current worst kept
      heap[0] = [dist, x, y]; // evict root, replace, re-sift down
      siftDown(0);
    }
  }
  return heap.map(([, x, y]) => [x, y]);
}
```
````

Notice the eviction condition is a STRICT improvement check
(`-dist > heap[0][0]` in Python, i.e. new distance is smaller than the
current worst; `dist < heap[0][0]` in TypeScript) — a point that's no
better than the current worst-of-top-k is correctly skipped entirely,
with zero heap operation, rather than pushed and immediately popped
back out. `heapq.heapreplace` (Python) does the pop-then-push as one
call, cheaper than a separate pop and push.

```complexity
{
  "time": "O(n log k)",
  "space": "O(k)",
  "why": "Every one of the n points does an O(1) distance computation and an O(1) size/comparison check; only points that improve the heap trigger an O(log k) heap operation — at most n such operations in the worst case, giving O(n log k). This beats the brute force's O(n log n) whenever k is meaningfully smaller than n (which is the whole point of bounding the heap to size k instead of sorting everything)."
}
```
`````

## Variants

- **Kth Largest Element in a Stream** (this module): the mirror
  problem — a size-k MIN-heap kept for "largest so far" instead of a
  size-k MAX-heap for "closest so far." Comparing the two eviction
  conditions side by side is the cleanest way to internalize when each
  heap orientation is correct.
- **Top K Frequent Elements** (this module): same size-k-heap skeleton,
  bounding by frequency instead of distance.
- **Quickselect** (Module 14, via Kth Largest Element in an Array): an
  entirely different O(n) average-case technique for "find the k
  best/smallest" that doesn't use a heap at all — worth knowing as an
  alternative when you need all k elements at once rather than
  processing a true, unbounded stream where quickselect's need to see
  the whole array upfront doesn't apply.

```quiz
{
  "question": "Kth Largest Element in a Stream uses a size-k MIN-heap; K Closest Points to Origin uses a size-k MAX-heap. Both maintain 'the best k seen so far.' Why does 'best k' require opposite heap orientations in these two problems?",
  "options": [
    "In each case, the heap's root must be the CURRENT WORST member of the kept set, since that's the one compared against new arrivals and evicted if beaten; for 'largest k', the worst-of-the-kept-k is the SMALLEST of them (root of a min-heap), while for 'closest k', the worst-of-the-kept-k is the FARTHEST of them (root of a max-heap) — the heap type is determined by which end of the kept set counts as 'worst'",
    "Min-heaps are only for numeric comparisons; max-heaps are required for compound values like points — since a point is a compound (x, y) structure rather than a single number, only a max-heap's comparator can be adapted to handle it correctly",
    "It's arbitrary — either orientation works for both problems; a min-heap and max-heap of size k would evict the same elements and converge on the identical final top-k set in either case"
  ],
  "answer": 0,
  "explanation": "The general pattern is: keep a heap of size k where the ROOT is always the weakest member of the currently-kept set, because that's the only one that ever needs comparing against a new candidate. What counts as 'weakest' flips with the goal — for 'largest k', weakest means smallest (so a min-heap keeps it at the root); for 'closest k', weakest means farthest (so a max-heap keeps it at the root). The heap orientation is a direct consequence of which extreme you're trying to keep OUT, not an arbitrary implementation choice."
}
```
