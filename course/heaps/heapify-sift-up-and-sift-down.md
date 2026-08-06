---
title: "Heapify: Sift-Up & Sift-Down"
type: concept
---

## The problem the operations solve

The previous lesson gave us the heap property (parent ≤ both children,
for a min-heap) and showed the tree lives in a flat array. But a static
heap is useless — we need to *insert* new elements and *remove* the
minimum, and every such change threatens to violate the invariant. The
two repair operations that fix a single local violation are **sift-up**
and **sift-down**, and every heap operation is built from them. Both cost
O(log n) for the same structural reason, which we'll pin down precisely,
and then we'll meet the module's one genuinely surprising result:
building a heap from an unsorted array is O(n), not O(n log n).

Throughout, remember the array indexing from last lesson: for node `i`,
`left = 2i+1`, `right = 2i+2`, `parent = (i−1)//2`.

## Sift-up: repair an element that's too small for where it sits

**Insertion** works like this: append the new value to the end of the
array. That keeps the tree complete (the new node fills the next
left-to-right slot), but the value may be smaller than its parent,
violating the invariant at that one spot. Everywhere else the heap is
still fine. So we only need to fix this one node, by **sifting it up**:
compare it to its parent; if it's smaller, swap; repeat from the new
position until it's ≥ its parent or reaches the root.

After appending `1`, the value sifts up until the heap property holds
again:

```diagram
{
  "id": "heap-array",
  "values": [1, 2, 3, 7, 5, 4]
}
```

Trace: append into `[2, 4, 3, 7, 5]` → `[2, 4, 3, 7, 5, 1]`, then swap
with parent 4, then with root 2, landing at `[1, 2, 3, 7, 5, 4]`.

Why is this correct? When we swap the new value `v` up past its parent
`p`, we push `p` down into the slot `v` vacated. We must check that `p`
still dominates that slot's subtree — and it does: `p` was already ≤ its
other child (the heap was valid there before), and `p ≤ v`'s former
subtree because `v` was the smallest thing in it (it just arrived as a
leaf). So each swap fixes the violation locally without creating a new
one below. The value climbs until it finds a parent no larger than itself.

## Sift-down: repair an element that's too large for where it sits

**Extract-min** is the mirror image. The minimum is at the root, index 0.
We want to remove it while keeping the tree complete. The trick: swap the
root with the *last* element, then shrink the array by one (removing what
is now the old minimum from the end — cheap, no shifting). The last
element is now sitting at the root, almost certainly too large. Every
other node still satisfies the invariant. So we fix the root by **sifting
it down**: compare it to its two children, swap with the *smaller* child
if that child is smaller than it, and repeat until both children are ≥ it
(or it becomes a leaf).

```text
extract-min from [1, 2, 3, 7, 5, 4]
  root (1) is the answer.  swap root with last → [4, 2, 3, 7, 5, 1]
  drop the last element (the 1 we're returning) → [4, 2, 3, 7, 5]

[4, 2, 3, 7, 5]   children of 0 are 2 and 3; smaller is 2 (index 1). 2 < 4 → swap
[2, 4, 3, 7, 5]   children of 1 are 7 and 5; smaller is 5 (index 4). 5 > 4 → stop.
  return 1.  Heap restored.
```

Why swap with the *smaller* child specifically? The child that moves up
becomes the new parent of the other child, so it must be ≤ both. Only the
smaller of the two children is guaranteed ≤ the other — pick the larger
and you'd immediately re-violate the invariant on the other side.

## Why both are O(log n)

Both operations walk a single root-to-leaf path, doing O(1) work per step
(a constant number of comparisons and one swap). The number of steps is
bounded by the tree's **height**. A complete binary tree with `n` nodes
has height `⌊log₂ n⌋`: each level `k` holds up to `2^k` nodes, so to hold
`n` nodes you need about `log₂ n` levels (from last lesson's counting:
`2^0 + ... + 2^h = 2^(h+1) − 1 ≥ n` forces `h ≥ log₂(n+1) − 1`). Sift-up
traverses at most one node per level from a leaf to the root; sift-down at
most one per level from the root to a leaf. Either way, **at most
`⌊log₂ n⌋` steps, each O(1) → O(log n).** No input makes the path longer,
because completeness caps the height — that's the guarantee the balanced
shape buys us.

## From scratch: a full MinHeap and MaxHeap

Python ships `heapq` (we cover it below), but implementing the structure
once, by hand, is the point of this lesson — you should be able to write
these two operations from memory. Here is a complete min-heap. In
TypeScript there is no built-in heap at all, so this class is what every
problem lesson in this module will reuse.

````tabs
```python
class MinHeap:
    def __init__(self) -> None:
        self._data: list[int] = []

    def __len__(self) -> int:
        return len(self._data)

    def peek(self) -> int:
        return self._data[0]            # global min, O(1)

    def push(self, value: int) -> None:
        self._data.append(value)        # keep the tree complete
        self._sift_up(len(self._data) - 1)

    def pop(self) -> int:
        d = self._data
        d[0], d[-1] = d[-1], d[0]        # move min to the end
        minimum = d.pop()               # remove it, O(1)
        if d:
            self._sift_down(0)
        return minimum

    def _sift_up(self, i: int) -> None:
        d = self._data
        while i > 0:
            p = (i - 1) // 2
            if d[i] < d[p]:             # smaller than parent: climb
                d[i], d[p] = d[p], d[i]
                i = p
            else:
                break                   # invariant satisfied
    def _sift_down(self, i: int) -> None:
        d = self._data
        n = len(d)
        while True:
            smallest = i
            l, r = 2 * i + 1, 2 * i + 2
            if l < n and d[l] < d[smallest]:
                smallest = l
            if r < n and d[r] < d[smallest]:
                smallest = r
            if smallest == i:           # both children ≥ i: stop
                break
            d[i], d[smallest] = d[smallest], d[i]
            i = smallest
```

```typescript
class MinHeap {
  private data: number[] = [];

  get size(): number {
    return this.data.length;
  }

  peek(): number {
    return this.data[0]; // global min, O(1)
  }

  push(value: number): void {
    this.data.push(value); // keep the tree complete
    this.siftUp(this.data.length - 1);
  }

  pop(): number {
    const d = this.data;
    const last = d.length - 1;
    [d[0], d[last]] = [d[last], d[0]]; // move min to the end
    const minimum = d.pop() as number; // remove it, O(1)
    if (d.length > 0) this.siftDown(0);
    return minimum;
  }

  private siftUp(i: number): void {
    const d = this.data;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (d[i] < d[p]) {
        // smaller than parent: climb
        [d[i], d[p]] = [d[p], d[i]];
        i = p;
      } else break; // invariant satisfied
    }
  }

  private siftDown(i: number): void {
    const d = this.data;
    const n = d.length;
    while (true) {
      let smallest = i;
      const l = 2 * i + 1;
      const r = 2 * i + 2;
      if (l < n && d[l] < d[smallest]) smallest = l;
      if (r < n && d[r] < d[smallest]) smallest = r;
      if (smallest === i) break; // both children ≥ i: stop
      [d[i], d[smallest]] = [d[smallest], d[i]];
      i = smallest;
    }
  }
}
```
````

A **max-heap** is the identical structure with every comparison reversed
(`>` instead of `<`, `largest` instead of `smallest`). Rather than
duplicate the code, many implementations take a comparator; for this
module, mentally swap the comparisons — we'll show the max-heap variant
where a problem needs it (e.g. K Closest Points).

## Python's heapq: a min-heap, and the max-heap workaround

Python's `heapq` is exactly the array-backed binary heap above, exposed
as free functions operating on a plain list:

````tabs
```python
import heapq

h: list[int] = []
heapq.heappush(h, 5)
heapq.heappush(h, 1)
heapq.heappush(h, 3)
print(h[0])            # 1 — the min is always at index 0
print(heapq.heappop(h))  # 1, then re-heapifies

# heapq is MIN-ONLY. To get a max-heap, negate on the way in and out:
maxh: list[int] = []
for v in (5, 1, 3):
    heapq.heappush(maxh, -v)     # store negatives
largest = -maxh[0]               # 5 — negate back when reading
largest = -heapq.heappop(maxh)   # 5 — and when popping
```

```typescript
// JavaScript/TypeScript has NO built-in heap. Use the MinHeap class above.
// For a max-heap, either write a MaxHeap (flip the comparisons) or,
// mirroring the Python trick, push negated values into a MinHeap:
const maxViaMin = new MinHeap();
for (const v of [5, 1, 3]) maxViaMin.push(-v);
const largest = -maxViaMin.peek(); // 5 — negate back when reading
```
````

The negation trick trips people up, so be explicit about *why* it works:
a min-heap always hands you the algebraically smallest stored value. If
you store `−v` for every `v`, then the smallest stored value is `−(max v)`,
so negating the heap's output recovers the true maximum. Every comparison
`−a < −b` is exactly `a > b`, so ordering by negatives *is* reverse
ordering. The catch to remember: negate **both** on push and on
peek/pop, and it only works cleanly for numbers (for tuples or objects
you'd negate the key or use a comparator/wrapper).

## Build-heap: O(n), not O(n log n)

Now the surprising result. Suppose you have an unsorted array of `n`
elements and want to turn it into a heap. The obvious way: start with an
empty heap and `push` all `n` elements. Each push is O(log n), so this is
**O(n log n)**. Correct, but not optimal.

There is a better way — **`heapify`** — that runs in **O(n)**. Take the
raw array as-is (it's already a complete tree, just not a valid heap), and
sift *down* every non-leaf node, working from the last non-leaf backward
to the root:

````tabs
```python
def build_heap(arr: list[int]) -> None:
    n = len(arr)
    # last non-leaf is the parent of the last element:
    start = (n - 2) // 2
    for i in range(start, -1, -1):      # from last non-leaf up to root
        _sift_down_on(arr, i, n)
```

```typescript
function buildHeap(arr: number[]): void {
  const n = arr.length;
  const start = (n - 2) >> 1; // last non-leaf = parent of last element
  for (let i = start; i >= 0; i--) {
    siftDownOn(arr, i, n); // from last non-leaf up to root
  }
}
```
````

(Python's `heapq.heapify(arr)` does exactly this in one C call.) Why go
*backward* from the bottom? Sift-down assumes both of a node's subtrees
are already valid heaps and only its own value might be misplaced.
Processing bottom-up guarantees that precondition: when we reach node `i`,
every node below it has already been sifted, so its children are valid
heap roots. Leaves need no work (no children to violate against), which is
why we start at the last non-leaf, `(n−2)//2`.

**The complexity claim.** The naive "`n` pushes × O(log n)" bound is
O(n log n), and it is a genuine *over*-estimate here. It assumes every
element travels the full height of the tree. But `heapify` sifts *down*,
and the overwhelming majority of nodes are near the bottom, where
sift-down can only travel a tiny distance. Let's sum the actual work.

Group the nodes by their height (distance to the *farthest leaf below
them*, so leaves have height 0). In a complete tree of `n` nodes:

- height 0 (leaves): about `n/2` nodes
- height 1: about `n/4` nodes
- height 2: about `n/8` nodes
- ... in general, at most `⌈n / 2^(h+1)⌉` nodes of height `h`

A node of height `h` sifts down at most `h` steps. So total work is
bounded by summing (number of nodes at height `h`) × (steps `h`) over all
heights up to `log n`:

```text
Total  ≤  Σ (h = 0 .. log n)  (n / 2^(h+1)) · h
       =  (n/2) · Σ (h = 0 .. ∞)  h / 2^h
```

The remaining sum `Σ h/2^h` is a standard convergent series. Its exact
value is 2 (it's `x/(1−x)²` at `x = 1/2`, giving `(1/2)/(1/4) = 2`). So:

```text
Total  ≤  (n/2) · 2  =  n   →   O(n)
```

The intuition behind the algebra: the expensive nodes (the ones that can
sift far, near the top) are *few* — only the root can travel the full
`log n`, its two children only `log n − 1`, and so on. The *many* cheap
nodes near the bottom dominate the count but each does almost no work. The
work per level *halves* as you go up while the distance only *increases*
by one, so the total is a converging geometric-ish sum, not a growing one.
That's the whole reason it telescopes to O(n) instead of O(n log n).

Contrast the two clearly: **`n` sequential pushes is O(n log n)** because
sift-*up* on a freshly appended leaf can climb the full height, and
half the elements are leaves paying up to `log n` each. **`heapify` is
O(n)** because sift-*down* on those same bottom-heavy nodes barely moves.
Same array, same heap, different construction cost — one of the few places
where the "obvious" bound is loose and the real answer is better.

```complexity
{
  "operations": [
    { "name": "peek (min / max)", "time": "O(1)", "why": "the extreme is at the root, array index 0 — no work" },
    { "name": "push (insert)", "time": "O(log n)", "why": "append is amortized O(1); sift-up walks at most one node per level, and height is ⌊log₂ n⌋" },
    { "name": "pop (extract extreme)", "time": "O(log n)", "why": "swap-with-last and remove is O(1); sift-down walks at most one node per level, bounded by the height" },
    { "name": "build-heap via n pushes", "time": "O(n log n)", "why": "each of n elements sift-UPs, and ~half are leaves that can climb the full height — the work does NOT telescope" },
    { "name": "build-heap via heapify", "time": "O(n)", "why": "sift-DOWN bottom-up; work per height level halves while distance grows by one, so Σ (n/2^(h+1))·h = (n/2)·Σ h/2^h = (n/2)·2 = n" },
    { "name": "space", "time": "O(1) extra", "why": "all operations are in-place on the backing array; heapify rearranges it without a second buffer" }
  ]
}
```

```quiz
{
  "questions": [
    {
      "question": "During extract-min, after moving the last element to the root we sift it DOWN, and each step swaps it with the SMALLER of its two children. Why the smaller one specifically?",
      "options": [
        "The child that moves up becomes the parent of the other child, so it must end up ≤ both; only the smaller of the two children is guaranteed ≤ the other, so swapping with the larger would immediately re-violate the heap property on the other side",
        "Either child works; the smaller one is just a convention — swapping with whichever child happens to be examined first produces an equally valid heap, and 'smaller' is just a common style choice rather than a requirement",
        "To reduce the number of total swaps by a constant factor — picking the smaller child on average shortens the distance the element needs to sift, cutting the total number of swap operations across the whole run"
      ],
      "answer": 0,
      "explanation": "Correctness, not a heuristic. When the demoted value's replacement rises into the parent slot, it sits above BOTH children. Picking the smaller child guarantees it dominates the sibling it now parents (smaller ≤ larger). Choosing the larger child would leave the smaller sibling with a bigger parent — the invariant broken exactly where we thought we'd fixed it."
    },
    {
      "question": "Building a heap by pushing n elements one at a time is O(n log n), but heapify is O(n) on the same data. What is the essential reason heapify avoids the extra log factor?",
      "options": [
        "heapify skips the comparisons that push performs, so it does strictly less work per element — each node it processes needs fewer comparison checks than an equivalent push would, which directly explains the lower total",
        "heapify sifts DOWN from the bottom up, and most nodes live near the bottom where sift-down can travel only a short distance — the work per height level halves as you go up while the distance grows by only one, so the total sum Σ (n/2^(h+1))·h converges to O(n) rather than accumulating to O(n log n)",
        "heapify uses a different, faster comparison operation than push — the two algorithms are built on fundamentally different low-level comparison primitives, and heapify's is a constant factor cheaper per call"
      ],
      "answer": 1,
      "explanation": "It's about where the work concentrates. The naive bound assumes every element travels the full height; that's true-ish for sift-UP on leaves (half the elements, each climbing up to log n). But heapify sift-DOWNs, and the ~n/2 leaves do zero work, the ~n/4 nodes at height 1 do ≤1 step each, and so on. Summing (nodes at height h)·h gives (n/2)·Σ h/2^h = (n/2)·2 = n. The many cheap nodes dominate the count; the few expensive nodes are too rare to matter."
    },
    {
      "question": "Python's heapq is a min-heap only. To use it as a max-heap you push -v and read back -heap[0]. Why does negating values turn a min-heap into a max-heap?",
      "options": [
        "heapq detects negative numbers and switches to max-heap mode automatically — the library inspects the sign of pushed values and silently flips its internal comparison direction whenever it notices negative inputs",
        "A min-heap always yields the algebraically smallest STORED value; the smallest stored value among the negatives −v is −(max v), and since −a < −b exactly when a > b, ordering by negatives is reverse ordering — so negating the output recovers the true maximum",
        "Negation randomizes the order, which happens to reverse it on average — flipping every value's sign scrambles the relative ordering unpredictably, and reversal is just the statistically likely outcome rather than a guaranteed one"
      ],
      "answer": 1,
      "explanation": "The heap's logic never changes — it faithfully returns the minimum of whatever it holds. By storing −v, you make 'minimum of the stored values' equal to −(maximum of the real values), because the comparison −a < −b is identical to a > b. Negate on the way in AND on the way out. The pitfall: it's clean only for plain numbers; for tuples/objects you negate the key or supply a comparator."
    }
  ]
}
```
