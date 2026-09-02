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
the correct insertion point, if target isn't present at all). It's the
same shape as a beach: walk from the water's edge inland and there's
one exact line where wet sand becomes dry — you're not looking for a
grain of sand, you're looking for the boundary itself.

```diagram
{
  "id": "search-range",
  "values": [1, 2, 2, 2, 3],
  "lo": 1,
  "hi": 4,
  "mid": 2,
  "target": 2
}
```


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

Trace a target *larger than every element* to see why `hi = len(arr)`
earns its keep: `arr = [1, 2, 3, 4]`, `target = 5`. `lo = 0, hi = 4`.
`mid = 2`: `arr[2] = 3 >= 5` is false, `lo = 3`. `mid = 3`:
`arr[3] = 4 >= 5` is still false, `lo = 4`. Now `lo == hi == 4`, the
loop ends, and `4` — one past the last valid index — is returned as the
correct insertion point. An inclusive `hi = len(arr) - 1` convention has
no way to express "the answer is past the end" without a separate
special case; the half-open range represents it for free, as an
ordinary value `lo` can reach.

Run the same three-step check from the previous lesson against this
template's own invariant — **`[0, lo)` is entirely false; `[hi, n)` is
entirely true; `[lo, hi)` is unexplored**:

- **Initialization.** Before the first iteration, `lo = 0` and
  `hi = len(arr)`, so both the false-region and true-region are empty.
  An empty region is trivially correct — nothing has been claimed yet.
- **Maintenance.** When `arr[mid] >= target` (predicate true), setting
  `hi = mid` is safe because `mid` itself is true — everything at or
  right of the new `hi` (which starts at `mid`) stays true. When
  `arr[mid] < target` (predicate false), setting `lo = mid + 1` is safe
  because `mid` itself is false — everything strictly left of the new
  `lo` (which is `mid + 1`) stays false, and `mid` is validly absorbed
  into the false region.
- **Termination.** The loop exits when `lo == hi` — the unexplored
  region `[lo, hi)` has shrunk to empty, meaning every index is now
  classified. `lo` sits exactly at the false→true flip: the answer.

## Getting the last occurrence

Flip the predicate to find where "false" begins, then step back one:
search for the first index where `arr[i] > target` (not `>=`), and
subtract 1. Why that lands exactly on the last occurrence: duplicates
of `target` form one contiguous block in a sorted array, and
`arr[i] > target` is false for the entire block and true for every
index strictly after it — so this search finds the first index *past*
the block, and stepping back one lands on the block's final element.
(A separate valid convention exists — walk the same halving with the
comparison and update roles mirrored — but picking ONE convention and
deriving every variant from it consistently, as this lesson does, is
more valuable than knowing several templates by rote.)

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
        "The half-open range [lo, hi) needs to represent 'the boundary could be one past the last valid index' (target larger than every element) without a separate special case — hi = len(arr) makes that representable as a normal state of the range",
        "It's an arbitrary convention with no functional difference — len(arr) - 1 would work exactly as well, since both conventions ultimately converge on the same final answer regardless of which one is chosen",
        "To avoid an off-by-one in the midpoint calculation — starting hi one index higher shifts every subsequent mid computation just enough to prevent the classic rounding error that plagues naive implementations"
      ],
      "answer": 0,
      "explanation": "This is the payoff of switching conventions: the half-open range can naturally express 'insert at the very end' as lo == hi == len(arr), something the inclusive [lo, hi] convention would need an extra branch to handle."
    },
    {
      "question": "In lower_bound, when arr[mid] >= target (predicate true), why does hi become mid rather than mid - 1?",
      "options": [
        "mid - 1 would also work correctly — since the search always converges to the same boundary index eventually, excluding mid here just means the loop takes one extra iteration to arrive at an equivalent final answer",
        "mid has NOT been ruled out as the boundary — it satisfies the predicate, so it's a candidate for being the first true index. Setting hi = mid keeps it in the search range; hi = mid - 1 would incorrectly discard a possibly-correct answer",
        "Because the range is inclusive — the [lo, hi] convention used elsewhere in binary search requires keeping mid in the range whenever a predicate holds, and this code is following that same inclusive-range rule"
      ],
      "answer": 1,
      "explanation": "This is the key asymmetry versus exact-match search: there, arr[mid] being wrong meant mid was fully eliminated. Here, arr[mid] satisfying the predicate means mid is still a LIVE CANDIDATE for the answer, so it must stay in the range rather than being excluded."
    }
  ]
}
```
