---
title: The Heap Property & Array Representation
type: concept
---

## The one job a heap does well

A BST (Module 18) keeps its elements in *total* order: for every node,
everything on the left is smaller and everything on the right is larger.
That strong ordering is what buys you O(log n) search for *any* value —
at each node you know which way to go. A heap gives up almost all of
that. It enforces only a single, much weaker rule, and in exchange it
becomes the fastest structure we have for one specific question asked
over and over: **"what is the smallest (or largest) element right now?"**

That question shows up constantly. Dijkstra's algorithm repeatedly needs
the closest unvisited node. A task runner repeatedly needs the
highest-priority job. A streaming median needs the boundary between two
halves. In every case you never search for an arbitrary value — you only
ever want the extreme, you want it fast, and after taking it you want the
*next* extreme fast. A heap is the structure shaped exactly to that
access pattern.

## The heap property

A **min-heap** is a binary tree obeying one invariant:

> **Every node's value is ≤ both of its children's values.**

(A **max-heap** flips it: every node ≥ both children. Everything in this
module works identically for both; we'll use min-heap as the default and
flip only when a problem calls for it.)

Read that carefully and notice what it does *not* say. It says nothing
about the relationship between a node's two children, and nothing about
left-vs-right. Two siblings can be in either order. A node deep on the
left can be smaller than a node high on the right. The only constraint is
the vertical parent-child one, applied locally at every node.

The invariant chains: if every parent ≤ its children, then by transitivity
the root is ≤ everything beneath it. So **the root is the global minimum** —
guaranteed, readable in O(1), no searching. That is the entire payoff of
the heap property, and it is worth being precise that it is *all* you get.

## What the weaker invariant costs you

Because the heap says nothing horizontal, you cannot binary-search it.
Suppose you want to know whether the value `37` is in the heap. Standing
at the root, `37 ≥ root` tells you nothing about *which* subtree to
descend — `37` could be under the left child, the right child, both, or
neither, since siblings aren't ordered relative to each other. You have
no way to eliminate half the tree. Searching for an arbitrary value in a
heap is therefore **O(n)** — you may have to look at every node — exactly
the linear scan the BST's stronger invariant let you avoid.

Concretely, compared to a balanced BST:

- **Find min (or max):** heap O(1) vs. BST O(log n). The heap wins — its
  extreme sits at a fixed location (the root).
- **Search for an arbitrary value:** heap O(n) vs. BST O(log n). The BST
  wins decisively — this is the cost of the weaker invariant.
- **Insert / remove the extreme:** both O(log n), but the heap's constant
  factors are smaller (we prove the heap's bound in the next lesson).
- **In-order traversal (sorted output):** BST gives it directly; a heap
  has no cheap sorted walk — its elements are only *partially* ordered.

So the heap is not a "worse BST." It is a specialist. You reach for it
precisely when your workload is *only* repeated-extreme access and you're
willing to give up arbitrary search to get that access cheaper and in
less memory. If you need both extreme access *and* arbitrary search,
that's a different structure (a balanced BST, or an indexed heap).

## Why a heap can be a flat array with no pointers

Here is the second idea that makes heaps special, and it's independent of
the ordering property: **a heap is always a *complete* binary tree, and a
complete binary tree needs no pointers at all.**

"Complete" has a precise meaning: every level is entirely full except
possibly the last, and the last level is filled strictly left-to-right
with no gaps. Picture the nodes numbered in reading order — top to bottom,
left to right within each level:

```diagram
{
  "id": "heap-array",
  "values": [1, 3, 2, 7, 4, 5, 8]
}
```

Now write those numbers into a flat array in exactly that reading order.
The claim is that a node's parent and children are found by **pure index
arithmetic**, so we never store a single pointer. Let's derive the
formulas rather than memorize them — the derivation is short and it
depends entirely on "complete = no gaps."

Because there are no gaps, level `k` holds exactly `2^k` nodes (it's full,
except the last level which is a left-packed prefix). Count how many nodes
come *before* the start of level `k`: that's `2^0 + 2^1 + ... + 2^(k-1) =
2^k − 1`. So the leftmost node of level `k` sits at array index `2^k − 1`,
and the level's nodes occupy a contiguous run from there.

Take a node at index `i` on level `k`. Let `p` be its position within its
level (0-based), so `i = (2^k − 1) + p`. Its children live on level `k+1`,
which starts at index `2^(k+1) − 1`. Because each parent on level `k`
contributes exactly two children, filled left to right with no gaps, the
parent at position `p` owns the two children at positions `2p` and `2p+1`
of the next level. Convert those back to absolute indices:

```text
left child  = (2^(k+1) − 1) + 2p
            = (2·2^k − 1) + 2p
            = 2·(2^k − 1 + p) + 1
            = 2i + 1

right child = left child + 1 = 2i + 2
```

That's the whole derivation — the algebra collapses to `2i+1` and `2i+2`
*because* completeness guarantees the level sizes are exact powers of two
with no missing nodes. Invert it to get the parent: if `2i+1` and `2i+2`
map *to* `i`, then a child at index `c` came from `parent = (c − 1) // 2`
(integer division, which sends both `2i+1` and `2i+2` back to `i`).

```text
i = 0    children 1, 2       parent of 1 = (1-1)//2 = 0 ✓
i = 1    children 3, 4       parent of 4 = (4-1)//2 = 1 ✓
i = 2    children 5, 6       parent of 6 = (6-1)//2 = 2 ✓
i = 3    children 7, 8       parent of 7 = (7-1)//2 = 3 ✓
```

If the tree had a gap — some node missing in the middle of a level — this
arithmetic would break, because the counting argument ("`2^k − 1` nodes
precede level `k`") assumes every earlier slot is occupied. That's the
real reason heaps insist on staying complete: completeness is not
cosmetic, it is the precondition that lets the array *be* the tree.

Here are the three index helpers we'll use for the rest of the module:

````tabs
```python
def parent(i: int) -> int:
    return (i - 1) // 2

def left(i: int) -> int:
    return 2 * i + 1

def right(i: int) -> int:
    return 2 * i + 2
```

```typescript
const parent = (i: number): number => (i - 1) >> 1; // floor division by 2
const left = (i: number): number => 2 * i + 1;
const right = (i: number): number => 2 * i + 2;
```
````

(In TypeScript, `(i - 1) >> 1` is an arithmetic right shift by one bit —
floor-division by 2 for non-negative `i`, and cheaper than `Math.floor`.)

## Why the array form is more than a convenience

Storing the tree as an array isn't just tidy — it changes the machine-level
cost, and this is a genuine reason heaps are the go-to priority structure:

- **No pointer overhead.** A pointer-based tree node carries two child
  references (16 bytes on a 64-bit machine) alongside its payload. For an
  `int`-sized payload, the pointers can outweigh the data. The array
  stores *only* the values, back to back — roughly half the memory for
  small payloads, and no allocator bookkeeping per node.
- **Cache locality.** The array is one contiguous block. Walking from a
  node to its child touches index `2i+1`, which is nearby in memory, so
  the CPU's cache prefetcher keeps up. A pointer tree scatters its nodes
  across the heap (the memory kind), so each child dereference risks a
  cache miss — and a cache miss can cost as much as a hundred arithmetic
  operations. Two structures can share the same O(log n) *operation count*
  and still differ severalfold in wall-clock time because of this.
- **No allocation on the hot path.** Insert appends to the array (amortized
  O(1), Module 4's dynamic array) instead of calling into the allocator to
  build a node. Fewer allocations means less fragmentation and less GC
  pressure.

None of this shows up in the Big-O — it's all constant factors — but it's
why in practice the array-backed binary heap beats fancier
asymptotically-equal heaps for the common case, and why the standard
library heap in nearly every language is exactly this structure.

```complexity
{
  "operations": [
    { "name": "find min (min-heap) / max (max-heap)", "time": "O(1)", "why": "the invariant forces the global extreme to the root — a fixed location, array index 0, no search" },
    { "name": "search for an arbitrary value", "time": "O(n)", "why": "siblings are unordered, so no comparison lets you discard a subtree — you may scan every node" },
    { "name": "parent / child navigation", "time": "O(1)", "why": "pure index arithmetic (2i+1, 2i+2, (i-1)//2); completeness guarantees no gaps, so the formulas are exact" },
    { "name": "space", "time": "O(n)", "why": "one flat array of values, zero pointers — strictly less memory than a pointer-based tree of the same size" }
  ]
}
```

```quiz
{
  "questions": [
    {
      "question": "A min-heap guarantees the root is the global minimum, yet searching it for an arbitrary value like 37 is O(n). Why doesn't the heap property help you search?",
      "options": [
        "Because heaps aren't allowed to store duplicate values, so search is undefined — the structure assumes every value is unique, and searching for a value that could be a duplicate breaks the algorithm's assumptions entirely",
        "Because the array representation loses the tree structure needed for binary search — flattening the tree into a contiguous array discards the parent-child relationships a search would need, even though a pointer-based version would retain them",
        "The heap property only orders each node against its own children (vertically); it says nothing about left-vs-right siblings, so knowing 37 ≥ a node tells you nothing about WHICH subtree could contain it — you can't eliminate half the tree the way a BST can"
      ],
      "answer": 2,
      "explanation": "The heap invariant is strictly weaker than a BST's. A BST orders both directions, so a comparison at each node discards one subtree (O(log n) search). A heap orders only parent-below-children, so a comparison discards nothing horizontally — the value could be anywhere below, forcing a linear scan. That weakness is the price paid for O(1) extreme access."
    },
    {
      "question": "The child-index formulas 2i+1 / 2i+2 rely on the tree being COMPLETE (no gaps). What specifically breaks if a node in the middle of a level is missing?",
      "options": [
        "The formulas depend on the count of nodes before level k being exactly 2^k − 1, which assumes every earlier slot is filled; a gap makes that count wrong, so the arithmetic maps indices to the wrong nodes",
        "The heap property would be violated, but the indexing would still be correct — a gap in the middle of a level only disturbs the ordering invariant between parent and child, leaving the index arithmetic itself completely unaffected",
        "Nothing — the formulas work for any binary tree stored in an array — the 2i+1/2i+2 relationship is a general property of array-stored trees regardless of whether every level is fully packed"
      ],
      "answer": 0,
      "explanation": "Completeness is the precondition, not decoration. The derivation counts 2^0 + ... + 2^(k-1) = 2^k − 1 nodes before level k, assuming no gaps. A missing interior node shifts every subsequent index, so 2i+1 no longer lands on i's actual left child. This is exactly why heaps insist on staying complete: it's what lets a flat array stand in for the tree with no pointers."
    },
    {
      "question": "Two priority-queue implementations both do insert and extract-min in O(log n): an array-backed binary heap and a pointer-based balanced tree. Why does the array-backed heap typically run faster in practice despite identical Big-O?",
      "options": [
        "The array heap avoids ever comparing elements, so it does less work — its index-arithmetic navigation replaces the comparisons a pointer tree would need, cutting the total number of operations performed",
        "The array heap secretly has a better asymptotic complexity that Big-O rounds away — its true growth rate is sub-logarithmic, and the O(log n) label is a loose upper bound that understates how fast it actually runs",
        "Constant factors: the array is contiguous, so child navigation hits nearby memory the CPU cache prefetches, and there are no per-node pointers to store or allocator calls to make — a pointer tree scatters nodes across memory, risking a cache miss (≈100× an arithmetic op) on each dereference"
      ],
      "answer": 2,
      "explanation": "Big-O counts operations, not memory-access cost. Both structures do ~log n comparisons per operation, but the array heap's contiguous layout keeps those accesses cache-friendly and pointer-free, while the tree's scattered nodes incur cache misses and allocation overhead. Equal operation counts, unequal wall-clock time — which is why the standard-library heap everywhere is the array-backed one."
    }
  ]
}
```
