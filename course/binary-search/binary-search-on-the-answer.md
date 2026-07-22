---
title: Binary Search on the Answer
type: concept
---

## The generalization that surprises people

Nothing in either previous lesson actually required a sorted **array**.
What both templates needed was a monotonic predicate over a **range of
candidate values** — and that range doesn't have to be array indices at
all. It can be **the space of possible answers to the problem**: every
integer from some minimum feasible value to some maximum. This
technique — binary search on the answer — is the single most-tested
generalization of binary search in interviews, precisely because it's
not obviously binary search until you've learned to see it.

## The recognition pattern

Three signals, together, mean "binary search on the answer":

1. The problem asks for a **minimum** (or maximum) value satisfying
   some condition — "minimum speed to finish in time," "maximum
   distance between placed items," "smallest capacity that works."
2. There's a **feasibility check**: given a candidate answer, you can
   determine "does this work?" in reasonable time (often O(n) or
   O(n log n)), even though you can't jump straight to the best one.
3. Feasibility is **monotonic** in the candidate value — if speed k
   works, every speed faster than k also works; if capacity c is
   enough, every larger capacity is also enough. One direction is all
   "no," the other is all "yes," with a single flip between them.

When all three hold, you don't need to search the *problem's* data
structure — you binary search the **range of possible answers**,
calling the feasibility check at each midpoint instead of comparing
array values.

## The template

````tabs
```python
def binary_search_on_answer(lo: int, hi: int, feasible) -> int:
    # feasible(x): True for all x >= the answer, False for all x < it
    while lo < hi:
        mid = lo + (hi - lo) // 2
        if feasible(mid):
            hi = mid           # mid works — the true answer might be here or smaller
        else:
            lo = mid + 1        # mid doesn't work — answer must be larger
    return lo                   # smallest feasible value
```

```typescript
function binarySearchOnAnswer(
  lo: number,
  hi: number,
  feasible: (x: number) => boolean,
): number {
  // feasible(x): true for all x >= the answer, false for all x < it
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (feasible(mid)) {
      hi = mid; // mid works — the true answer might be here or smaller
    } else {
      lo = mid + 1; // mid doesn't work — answer must be larger
    }
  }
  return lo; // smallest feasible value
}
```
````

This is **exactly** the boundary-search template from the previous
lesson — same half-open range, same `hi = mid` / `lo = mid + 1` split —
with `arr[mid] >= target` replaced by a call to `feasible(mid)`. The
code is nearly identical; what changed is what `mid` MEANS (a candidate
answer, not an array index) and what decides the branch (a feasibility
computation, not an array comparison).

## Bounding the search range

The one genuinely new step: you must establish `lo` and `hi` — the
smallest and largest values the answer could *possibly* be — before
searching. This usually comes straight from the problem's own
constraints: "eating speed" can't be below 1 or above the largest pile
(eating faster than the biggest pile finishes it in one hour, so
nothing is gained past that); "minimum days to ship all packages"
ranges from "the single heaviest package" (any less and it can't be
shipped at all) to "the sum of everything" (one shipment). Reading
constraints for these bounds is the same skill the Big O module built —
knowing where an answer space starts and ends before you search it.

## Total cost

If the feasibility check costs O(f(n)) and the answer range spans R
possible values, binary search on the answer costs **O(f(n) · log R)**
— the halving argument, with the feasibility check standing in for the
O(1) comparison of ordinary binary search. This is frequently the
difference between an infeasible brute force (try every candidate
answer, check each in O(f(n)): O(R · f(n))) and a fast one — R can be
up to 10⁹, and log₂(10⁹) ≈ 30, so the search itself is nearly free next
to the feasibility checks.

```quiz
{
  "questions": [
    {
      "question": "What THREE properties together signal that a problem wants binary search on the answer?",
      "options": [
        "The problem asks for a min/max value satisfying a condition; a feasibility check exists for any candidate value; and feasibility is monotonic across the candidate range (all infeasible, then all feasible, with one flip)",
        "The input array is sorted, has no duplicates, and is large — these three array properties are what license binary search in general, and they apply here in exactly the same way they do to ordinary sorted-array search",
        "The problem mentions the word 'search' explicitly — the presence of that specific keyword in the problem statement is the most reliable signal that a binary-search-shaped solution is the one being asked for"
      ],
      "answer": 0,
      "explanation": "None of these three properties requires a sorted array at all — which is exactly why this generalization is easy to miss. The monotonicity property is the one that actually licenses binary search; the other two just make it a natural fit to reach for."
    },
    {
      "question": "Why is 'binary search on the answer' structurally the SAME template as boundary search from the previous lesson, not a new algorithm?",
      "options": [
        "It's the same only when the array happens to be sorted — the template's logic secretly depends on comparing real array values, so it only coincidentally resembles boundary search when an actual sorted array is involved",
        "Both search a half-open range [lo, hi) for the first index/value where a monotonic predicate flips from false to true, using identical hi = mid / lo = mid + 1 logic — only the predicate's SOURCE changes, from an array comparison to a feasibility function call",
        "It isn't the same — it requires fundamentally different code; searching an abstract answer space needs its own loop structure entirely distinct from the array-index-based boundary search template"
      ],
      "answer": 1,
      "explanation": "Recognizing that these are the same template wearing different clothes — rather than two things to memorize separately — is the actual lesson. The array in boundary search and the abstract range in answer-search are both just 'a monotonic predicate's domain.'"
    },
    {
      "question": "For a problem with feasibility check cost O(n) and an answer range of size 10^9, what's the total complexity, and why does it beat brute force?",
      "options": [
        "O(n) — the log factor is negligible so it's dropped; since log of any practical range is a small constant, standard Big O convention absorbs it into the O(n) term entirely",
        "O(n · 10^9), same as brute force; since binary search still has to narrow down to a single specific answer among a billion candidates, the total work ends up proportional to the full range regardless of halving",
        "O(n log(10^9)) ≈ O(30n) — binary search calls the feasibility check about 30 times instead of up to 10^9 times (brute force checking every candidate), which is the difference between fast and impossible"
      ],
      "answer": 2,
      "explanation": "The feasibility check's cost is paid roughly log2(range) times instead of range times — collapsing a linear scan over a billion candidates into about 30 checks. This is the same halving-loop argument from the Big O module, applied to a search space that was never array indices."
    }
  ]
}
```
