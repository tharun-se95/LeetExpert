---
title: Boundary Search
type: concept
---

## A different question: not "is it here," but "where does it START"

Exact-match search answers one question. A whole family of problems
asks something related but distinct: given a sorted array with
**duplicates**, find the **first** index where `target` appears (or the
**last**, or the first index where some condition first becomes true).
The array `[1,2,2,2,3]` searching for 2 might need to return index 1
(first occurrence) or index 3 (last occurrence) — plain binary search,
which stops at the first match it stumbles into, returns neither
reliably.

## Reframe as a monotonic predicate

The move from the previous lesson, applied: define a boolean predicate
over positions that is monotonic (all `false`, then all `true`), and
binary-search for **where it flips**. For "first occurrence of target":

> predicate(i) = `arr[i] >= target`

On a sorted array, this is false for every index before target's first
occurrence, then true from there onward — exactly the false...false,
true...true shape. The first `true` index IS the first occurrence (or
the correct insertion point, if target isn't present at all).

```text
[1, 2, 2, 2, 3], target = 2
predicate (arr[i] >= 2):  F  T  T  T  T
                              ^
                       first true — the answer
```

## The template

This version tracks the **boundary itself**, not a found/not-found
flag — the loop invariant shifts accordingly:

````tabs
```python
def lower_bound(arr: list[int], target: int) -> int:
    lo, hi = 0, len(arr)          # NOTE: hi starts at len(arr), one PAST the end
    while lo < hi:                 # half-open range [lo, hi)
        mid = lo + (hi - lo) // 2
        if arr[mid] >= target:
            hi = mid                # mid COULD be the boundary — keep it in range
        else:
            lo = mid + 1             # mid is provably before the boundary
    return lo                       # lo == hi: the first index where predicate is true
```

```typescript
function lowerBound(arr: number[], target: number): number {
  let lo = 0;
  let hi = arr.length; // NOTE: hi starts at arr.length, one PAST the end
  while (lo < hi) {
    // half-open range [lo, hi)
    const mid = lo + Math.floor((hi - lo) / 2);
    if (arr[mid] >= target) {
      hi = mid; // mid COULD be the boundary — keep it in range
    } else {
      lo = mid + 1; // mid is provably before the boundary
    }
  }
  return lo; // lo == hi: the first index where predicate is true
}
```
````

Three deliberate departures from the exact-match template, each earning
its keep:

- **`hi` starts at `len(arr)`, not `len(arr) - 1`.** The range is now
  **half-open** `[lo, hi)` — representing "the boundary lies somewhere
  in here, possibly even past the last valid index" (target bigger than
  everything present). An inclusive range can't represent "the answer
  might be one past the end" without an awkward special case; the
  half-open convention handles it for free.
- **`hi = mid` (not `mid - 1`) when the predicate is true.** Because
  `mid` might BE the boundary itself, it can't be excluded — only
  positions strictly after a false-to-true flip are safe to drop, and
  `mid` hasn't been ruled out, only confirmed to be at-or-after the
  boundary.
- **The loop condition is `lo < hi`, not `lo <= hi`.** A half-open range
  `[lo, hi)` is empty exactly when `lo == hi` — unlike the inclusive
  template, there's no valid single-element case left to check once
  they meet, because they've already converged on the answer itself.

This is worth internalizing as a genuinely different (though related)
invariant, not a variation to patch onto the first template. Mixing the
two conventions — half-open bounds with inclusive-style elimination, or
vice versa — is where boundary-search bugs live.

## Getting the last occurrence

Flip the predicate to find where "false" begins, then step back one:
search for the first index where `arr[i] > target` (not `>=`), and
subtract 1. Or, symmetrically, run the same halving with roles reversed
— both work; picking ONE convention and deriving every variant from it
consistently is more valuable than knowing many templates by rote.

```complexity
{
  "time": "O(log n)",
  "space": "O(1)",
  "why": "Still one halving per iteration — the search space shape changed (half-open, boundary-seeking) but the elimination rate didn't."
}
```

```quiz
{
  "questions": [
    {
      "question": "Why does the boundary-search template initialize `hi` to `len(arr)` instead of `len(arr) - 1`?",
      "options": [
        "It's an arbitrary convention with no functional difference",
        "The half-open range [lo, hi) needs to represent 'the boundary could be one past the last valid index' (target larger than every element) without a separate special case — hi = len(arr) makes that representable as a normal state of the range",
        "To avoid an off-by-one in the midpoint calculation"
      ],
      "answer": 1,
      "explanation": "This is the payoff of switching conventions: the half-open range can naturally express 'insert at the very end' as lo == hi == len(arr), something the inclusive [lo, hi] convention would need an extra branch to handle."
    },
    {
      "question": "In lower_bound, when arr[mid] >= target (predicate true), why does hi become mid rather than mid - 1?",
      "options": [
        "mid - 1 would also work correctly",
        "mid has NOT been ruled out as the boundary — it satisfies the predicate, so it's a candidate for being the first true index. Setting hi = mid keeps it in the search range; hi = mid - 1 would incorrectly discard a possibly-correct answer",
        "Because the range is inclusive"
      ],
      "answer": 1,
      "explanation": "This is the key asymmetry versus exact-match search: there, arr[mid] being wrong meant mid was fully eliminated. Here, arr[mid] satisfying the predicate means mid is still a LIVE CANDIDATE for the answer, so it must stay in the range rather than being excluded."
    }
  ]
}
```
