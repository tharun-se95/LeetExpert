---
title: Quicksort & Partitioning
type: concept
---

## The partition step, reused

Module 10's Partition Pointers lesson built exactly the function
quicksort needs: rearrange an array in place so everything less than a
pivot comes before everything greater — the write-pointer partition
template, with `pred = "less than the pivot"`:

```diagram
{
  "id": "invariant-regions",
  "size": 8,
  "first": 3,
  "second": 7,
  "doneLabel": "< pivot",
  "deadLabel": "pivot",
  "openLabel": "≥ pivot",
  "firstMarker": "boundary",
  "secondMarker": "pivot"
}
```


````tabs
```python
def partition(arr: list[int], lo: int, hi: int) -> int:
    pivot = arr[hi]                    # choose the last element as pivot
    boundary = lo                       # arr[lo:boundary] < pivot
    for i in range(lo, hi):
        if arr[i] < pivot:
            arr[boundary], arr[i] = arr[i], arr[boundary]
            boundary += 1
    arr[boundary], arr[hi] = arr[hi], arr[boundary]   # pivot lands at boundary
    return boundary                     # pivot's FINAL sorted position
```

```typescript
function partition(arr: number[], lo: number, hi: number): number {
  const pivot = arr[hi]; // choose the last element as pivot
  let boundary = lo; // arr[lo..boundary) < pivot
  for (let i = lo; i < hi; i++) {
    if (arr[i] < pivot) {
      [arr[boundary], arr[i]] = [arr[i], arr[boundary]];
      boundary++;
    }
  }
  [arr[boundary], arr[hi]] = [arr[hi], arr[boundary]]; // pivot lands at boundary
  return boundary; // pivot's FINAL sorted position
}
```
````

The key fact partition delivers: after it runs, the pivot sits at its
**correct final position in the fully sorted array** — everything to
its left is smaller, everything to its right is larger. That's enough
to sort recursively: partition, then recursively sort the two sides
independently, never touching the pivot again.

## Quicksort itself

````tabs
```python
def quicksort(arr: list[int], lo: int = 0, hi: int | None = None) -> None:
    if hi is None:
        hi = len(arr) - 1
    if lo < hi:
        p = partition(arr, lo, hi)
        quicksort(arr, lo, p - 1)        # everything smaller than pivot
        quicksort(arr, p + 1, hi)        # everything larger than pivot
```

```typescript
function quicksort(arr: number[], lo = 0, hi: number = arr.length - 1): void {
  if (lo < hi) {
    const p = partition(arr, lo, hi);
    quicksort(arr, lo, p - 1); // everything smaller than pivot
    quicksort(arr, p + 1, hi); // everything larger than pivot
  }
}
```
````

Sorting happens entirely IN PLACE — no merge step, no auxiliary array
(unlike merge sort). This is quicksort's headline advantage: better
constant factors and O(log n) auxiliary space (the recursion stack)
instead of merge sort's O(n).

## The case split you already know how to reason about

The Big O module's best/worst/average lesson used quicksort as its
worked example, in the abstract. Now you have the actual partition
code to reason about directly:

**Worst case: Θ(n²).** If partition always picks a pivot that splits
the array into sizes 0 and n−1 (e.g., choosing the last element as
pivot on an already-sorted array — every element compares against a
pivot that's the current maximum, so nothing ever goes right), the
recursion degenerates into a straight chain, n levels deep, doing O(n)
partition work at each level: n × n = n².

**Average case: Θ(n log n).** With a **randomly chosen pivot**, bad
splits become vanishingly unlikely for any fixed input — the
randomness is in the algorithm's own coin flips, not an assumption
about "typical" data. This is Big O's "average case" done honestly: not
"assume nice input," but "the algorithm defends itself against ALL
input via its own randomization."

```text
randomized pivot choice (swap a random index into the pivot slot first):
```

````tabs
```python
import random

def partition_randomized(arr: list[int], lo: int, hi: int) -> int:
    r = random.randint(lo, hi)
    arr[r], arr[hi] = arr[hi], arr[r]     # randomize which element is "last"
    return partition(arr, lo, hi)          # then partition exactly as before
```

```typescript
function partitionRandomized(arr: number[], lo: number, hi: number): number {
  const r = lo + Math.floor(Math.random() * (hi - lo + 1));
  [arr[r], arr[hi]] = [arr[hi], arr[r]]; // randomize which element is "last"
  return partition(arr, lo, hi); // then partition exactly as before
}
```
````

One line — swap a random element into the pivot slot before running
the same deterministic partition — converts "fails on adversarial
input" into "expected O(n log n) on EVERY input," because no fixed
input can reliably trigger bad splits against a pivot the algorithm
itself chose unpredictably.

```complexity
{
  "operations": [
    { "name": "worst case (bad pivots, e.g. sorted input + last-element pivot)", "time": "Θ(n²)", "why": "each partition splits n elements into sizes 0 and n-1 — recursion degenerates to a chain, n levels deep, O(n) work per level" },
    { "name": "average / randomized case", "time": "Θ(n log n)", "why": "random pivots make balanced-ish splits overwhelmingly likely; expected recursion depth is O(log n) with O(n) work per level" },
    { "name": "space", "time": "O(log n) average, O(n) worst case", "why": "the recursion stack's depth — NOT an auxiliary array, unlike merge sort. Worst-case depth matches the worst-case chain of bad splits" }
  ]
}
```

## Stability, and why quicksort gives it up

The partition step's swap (`arr[boundary], arr[i] = arr[i],
arr[boundary]`) can move an element PAST an equal element it was
originally behind — quicksort is **not stable**. This is the direct
cost of the same trade the Partition Pointers lesson named back in
Module 10: swap-based partitioning buys in-place, O(1)-auxiliary
rearrangement at the price of order-within-groups. Merge sort spent
O(n) space to keep that order; quicksort spends none, and loses it.

```quiz
{
  "questions": [
    {
      "question": "Why does choosing the LAST element as pivot make quicksort degrade to O(n²) specifically on already-sorted input?",
      "options": [
        "On sorted input, the last element is always the maximum of whatever subarray it's partitioning — so partition always produces a split of sizes (n-1, 0), the worst possible imbalance, turning the recursion into an n-level chain instead of a balanced tree",
        "Sorted arrays are always slow to process — comparison-based algorithms in general perform worse on already-ordered input because there's no beneficial structure left to exploit, a property of sortedness itself rather than of pivot choice",
        "The partition function has a bug on sorted arrays — an off-by-one in the boundary tracking causes it to misplace elements specifically when the input arrives already in order, producing an incorrect but still O(n²)-costly split"
      ],
      "answer": 0,
      "explanation": "This is exactly why deterministic pivot choice is dangerous: an adversary (or just unlucky common input, like already-sorted data) can reliably trigger the worst case. Randomization breaks the ADVERSARY's ability to predict which element becomes the pivot."
    },
    {
      "question": "Randomizing the pivot doesn't change partition's worst-case Θ(n²) possibility — a terrible split can still happen. So what does randomization actually guarantee?",
      "options": [
        "It reduces the worst case to O(n log n) exactly — randomizing the pivot mathematically eliminates the possibility of an unbalanced split entirely, converting the algorithm's guarantee from probabilistic to absolute",
        "It guarantees the worst case never happens — once the pivot is chosen randomly, the specific sequence of splits that would produce Θ(n²) behavior becomes structurally impossible to encounter, not just unlikely",
        "It guarantees the worst case becomes vanishingly UNLIKELY for any fixed input, because the bad luck would have to come from the algorithm's own random choices rather than from a property of the input itself — the EXPECTED running time is O(n log n) for every input, not just typical ones"
      ],
      "answer": 2,
      "explanation": "This is the strong form of average-case guarantee from the Big O module: not 'assume nice input' but 'defend against ALL input using the algorithm's own randomness.' The Θ(n²) possibility technically still exists — it's just astronomically improbable, and no adversary can force it deliberately."
    },
    {
      "question": "Why is quicksort unstable while merge sort is stable, given both are comparison-based sorts?",
      "options": [
        "Merge sort's merge step never displaces an element past another during a copy — equal elements keep their relative order by construction (taking LEFT on ties). Quicksort's partition SWAPS elements, which can move an element past an equal one it started behind, with no mechanism preventing that reordering",
        "Quicksort simply has more bugs",
        "Stability is unrelated to the sorting mechanism used"
      ],
      "answer": 0,
      "explanation": "Stability is a direct consequence of HOW elements move: copy-based merging preserves order for free; swap-based partitioning actively can violate it. This is the same in-place-vs-stable trade-off the course has now seen in three different structures (Module 4's write pointer, Module 10's partition, and here)."
    }
  ]
}
```
