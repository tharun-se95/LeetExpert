---
title: The Invariant-Driven Template
type: concept
---

## Why "the easy algorithm" ships with bugs constantly

Binary search is famously simple to describe and famously easy to get
subtly wrong — a widely cited study found the majority of published
binary search implementations, including ones in textbooks, contained
bugs. The fix isn't memorizing a magic template; it's writing the loop
from an **explicit invariant**, the same discipline every earlier
module in this course has built toward. Get the invariant right, and
the code follows mechanically. Skip it, and you're pattern-matching
against half-remembered code, which is exactly how off-by-ones creep
in.

## The invariant, stated precisely

Searching a sorted array for `target`, maintain two pointers `lo` and
`hi` such that:

> **The answer, if it exists, lies in `[lo, hi]` (inclusive on both
> ends).** Everything outside this range has been proven NOT to be the
> answer.

This should look familiar — it's the exact shape of the elimination
invariant from Two Pointers, specialized to a single search target
instead of a pair. Each iteration examines the midpoint and, based on
one comparison, **proves an entire half is impossible** and shrinks the
range:

```diagram
{
  "id": "search-range",
  "values": [1, 3, 5, 7, 9, 11, 13, 15],
  "lo": 0,
  "hi": 7,
  "mid": 3,
  "target": 7
}
```


````tabs
```python
def binary_search(arr: list[int], target: int) -> int:
    lo, hi = 0, len(arr) - 1
    while lo <= hi:                        # range [lo, hi] non-empty
        mid = lo + (hi - lo) // 2           # avoid overflow (see below)
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            lo = mid + 1                    # arr[lo..mid] all < target: eliminate
        else:
            hi = mid - 1                    # arr[mid..hi] all > target: eliminate
    return -1                               # range emptied: target absent
```

```typescript
function binarySearch(arr: number[], target: number): number {
  let lo = 0;
  let hi = arr.length - 1;
  while (lo <= hi) {
    // range [lo, hi] non-empty
    const mid = lo + Math.floor((hi - lo) / 2); // avoid overflow
    if (arr[mid] === target) {
      return mid;
    } else if (arr[mid] < target) {
      lo = mid + 1; // arr[lo..mid] all < target: eliminate
    } else {
      hi = mid - 1; // arr[mid..hi] all > target: eliminate
    }
  }
  return -1; // range emptied: target absent
}
```
````

Why `arr[mid] < target` eliminates the **entire left half through
mid**, not just `mid` itself: sortedness guarantees everything at
indices ≤ mid is ≤ `arr[mid]` < target, so none of them can equal
target either. One comparison, half the remaining range eliminated —
this is Two Pointers' batch-elimination argument again, just cutting a
single range in half instead of shrinking from two ends.

## The five decisions that cause every bug

**1. `lo <= hi` vs. `lo < hi`.** The loop condition must match the
invariant: since `[lo, hi]` is inclusive and can be a single element
(`lo == hi`), the loop must still run in that case — `lo <= hi` is
correct. Using `lo < hi` would skip checking the last remaining
candidate.

**2. `mid = lo + (hi - lo) // 2`, not `(lo + hi) // 2`.** In languages
with fixed-width integers, `lo + hi` can overflow before the division
happens, if both are large. `lo + (hi - lo) // 2` computes the same
midpoint without the intermediate overflow. JavaScript's numbers don't
overflow the same way at typical array sizes, but the habit transfers
directly to languages that do (Java, C++) — worth building now.

**3. `mid + 1` / `mid - 1`, never `mid`.** Once `arr[mid]` has been
ruled out (it's not the target and we know which side it's on), it
must be **excluded** from the new range — including it again would
either loop forever (if `mid` never changes) or silently re-examine an
already-eliminated element.

**4. What the invariant claims when the loop ends.** `lo > hi` means
the range has been proven empty — every index was checked or
eliminated with a proof — so returning "not found" is airtight, not a
guess.

**5. Which half a comparison eliminates.** Always eliminate the side
that CANNOT contain the answer, and always keep `mid` itself accounted
for exactly once (either it's the answer, or it's provably excluded
from `[lo, hi]` next iteration — never both kept and re-examined).

Step through a search and watch the eliminated half turn red at every
comparison — one comparison, half the live range gone, proof included:

```viz
{ "id": "binary-search", "data": [1, 3, 5, 7, 9, 11, 13], "target": 9 }
```

```complexity
{
  "time": "O(log n)",
  "space": "O(1) iterative, O(log n) recursive (call stack)",
  "why": "Each iteration halves the remaining range — the Big O module's halving-loop argument, run to completion here: after k iterations, range size is n/2^k, hitting 1 at k = log2 n."
}
```

## Why this generalizes past "find a value in a sorted array"

The invariant never actually required the array to be sorted VALUES —
it required that **comparing against `arr[mid]` reliably tells you
which half to eliminate**. That's a weaker, more general condition:
what it really needs is a **monotonic predicate** — some boolean
function of position that is `false` for a prefix and `true` for a
suffix (or vice versa), with no flip-flopping. "Is `arr[i] >= target`?"
is monotonic on a sorted array. So is "can Koko eat all the bananas at
speed k?" on the range of possible speeds — no sorted array in sight.
The next two lessons build exactly this generalization: first to
finding a *boundary* within a monotonic predicate, then to searching
an *answer space* that was never an array at all.

```quiz
{
  "questions": [
    {
      "question": "Why must the loop use `lo <= hi` rather than `lo < hi` for this template?",
      "options": [
        "lo <= hi runs faster — the extra equality check shaves a comparison off the loop's exit condition in a way that measurably speeds up the search compared to a strict inequality",
        "The invariant is that the answer (if present) lies in the INCLUSIVE range [lo, hi] — when lo == hi, that's a single unchecked candidate, and lo < hi would exit the loop without checking it",
        "Either works identically — since both conditions eventually converge on the same lo and hi values by the time the loop would naturally end, swapping one for the other doesn't change the algorithm's observable behavior"
      ],
      "answer": 1,
      "explanation": "The loop condition must match what the invariant claims. An inclusive range can validly contain exactly one element (lo == hi) that still needs checking — only lo <= hi keeps the loop running for that case."
    },
    {
      "question": "After `arr[mid] < target`, why does `lo` become `mid + 1` and not `mid`?",
      "options": [
        "mid has already been proven not to be the answer and proven to be on the excluded side — leaving it in the range would mean either an infinite loop (if lo stays at mid) or re-examining an eliminated element",
        "It doesn't matter which, as long as the loop terminates — any choice that eventually shrinks the range to empty is equally valid, since correctness only depends on the loop ending, not on which specific boundary value is chosen",
        "mid + 1 makes the algorithm faster — advancing past mid by one extra position shaves an iteration off the average search compared to setting lo to mid directly, which is the actual reason for the +1"
      ],
      "answer": 0,
      "explanation": "Every eliminated element must actually leave the range. mid was just examined and ruled out; excluding it via +1 is what guarantees progress and correctness together — using mid instead of mid+1 is the single most common infinite-loop bug in binary search."
    },
    {
      "question": "What does the underlying requirement for binary search really need to be true, beyond 'the array is sorted'?",
      "options": [
        "The array must have an odd number of elements — an even-length array has no single true middle element, which breaks the clean elimination argument that odd-length arrays rely on",
        "Comparing against the midpoint must reliably indicate which half can be eliminated — i.e., there's a monotonic predicate (false...false, true...true with no flips) over the search space, which sorted-array membership happens to satisfy but many other conditions do too",
        "The array must contain only unique elements — duplicate values would make the predicate ambiguous at the point of comparison, since arr[mid] could no longer reliably indicate which half to eliminate"
      ],
      "answer": 1,
      "explanation": "Sortedness is one way to get a monotonic predicate, not the only way. This reframing is what licenses binary search over answer spaces, feasibility checks, and other structures that were never sorted arrays — the next two lessons build on exactly this generalization."
    }
  ]
}
```
