---
title: Find Minimum in Rotated Sorted Array
type: problem
---

## Problem

A sorted array (**distinct values**) has been rotated at an unknown
pivot. Return the **minimum element**, in O(log n).

**Examples**

```examples
nums = [3,4,5,1,2]      →  1
nums = [4,5,6,7,0,1,2]  →  0
nums = [11,13,15,17]    →  11    (not rotated at all — pivot = 0)
```

```constraint
1 ≤ n ≤ 5000 · distinct values.
```

## Attempt it first

The module's capstone: it's the boundary-search template (lesson 2)
applied to Search in Rotated Sorted Array's "one sorted half" insight
(the previous problem). Define the right monotonic predicate over
positions and this becomes a single clean binary search — no target to
compare against, just structure.


```sandbox
{
  "id": "find-min-rotated",
  "fn": { "python": "find_min", "javascript": "findMin" },
  "check": "return",
  "starter": {
    "python": "def find_min(nums):\n    # Return the minimum value.\n    pass\n",
    "javascript": "function findMin(nums) {\n  // Return the minimum value.\n}\n"
  },
  "cases": [
    { "args": [[3,4,5,1,2]], "expect": 1 },
    { "args": [[4,5,6,7,0,1,2]], "expect": 0 },
    { "args": [[11,13,15,17]], "expect": 11 },
    { "args": [[2,1]], "expect": 1 }
  ]
}
```
````reveal Hint 1 — what's monotonic here?
The minimum is the ROTATION POINT — the one index where nums[i] <
nums[i-1]. Compare each candidate against the array's LAST element:
predicate(i) = 'nums[i] <= nums[-1]'. Before the rotation point, this
is false (those elements are all bigger than the last element); from
the rotation point onward, it's true. Classic false...false, true...true.
````

````reveal Hint 2 — binary search for where it flips
Standard boundary-search template: predicate true -> the minimum could
be here or earlier, shrink hi to mid. Predicate false -> the minimum is
strictly later, lo = mid + 1.
````

## Brute force, for contrast

Linear scan for the one place `nums[i] < nums[i-1]`: O(n). Correct, and
throws away the same "one broken point" structure the previous problem
exploited — the O(log n) requirement is what forces recognizing it.

## The insight

> The rotation point is exactly the boundary of a monotonic predicate
> (`nums[i] <= nums[last]`), so finding it is boundary search with the
> array's own last element playing the role of `target`. No new
> algorithm — this problem is proof that "search in a rotated array"
> and "find where a rotated array's structure flips" are the same
> template, aimed at different questions.

## Solution

`````reveal Solution — boundary search against the last element
````tabs
```python
def find_min(nums: list[int]) -> int:
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        mid = lo + (hi - lo) // 2
        if nums[mid] <= nums[hi]:      # mid is in (or past) the rotation point
            hi = mid                    # minimum could be mid or earlier
        else:
            lo = mid + 1                 # mid is in the "high" unrotated part
    return nums[lo]
```

```typescript
function findMin(nums: number[]): number {
  let lo = 0;
  let hi = nums.length - 1;
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (nums[mid] <= nums[hi]) {
      // mid is in (or past) the rotation point
      hi = mid; // minimum could be mid or earlier
    } else {
      lo = mid + 1; // mid is in the "high" unrotated part
    }
  }
  return nums[lo];
}
```
````

Trace on `[4,5,6,7,0,1,2]`: lo=0,hi=6,mid=3, `nums[3]=7`, `nums[6]=2`.
`7 <= 2`? No → `lo=4`. Now lo=4,hi=6,mid=5, `nums[5]=1`, `nums[6]=2`.
`1 <= 2`? Yes → `hi=5`. Now lo=4,hi=5,mid=4, `nums[4]=0`, `nums[5]=1`.
`0 <= 1`? Yes → `hi=4`. Now lo=4,hi=4: loop ends. Return `nums[4] = 0`
✓.

Comparing against `nums[hi]` (not `nums[lo]` or a fixed target) is the
one genuinely new idea: it works because `nums[hi]` is always a valid
"is this the high part or the low part" reference point, no matter
where the range currently sits — unlike the previous problem, there's
no external target to anchor the comparison to, so the array anchors
itself.

```complexity
{
  "time": "O(log n)",
  "space": "O(1)",
  "why": "One elimination per iteration, standard halving — the boundary-search cost, applied to finding a structural feature instead of a value."
}
```
`````

## Why this closes the module

Every idea from this module lands here: the invariant-driven halving
(lesson 1) is the mechanism; boundary search's half-open range and
`hi = mid` / `lo = mid + 1` split (lesson 2) is the exact template used;
and recognizing "the rotation point is a monotonic predicate boundary"
rather than an array value to match is the same reframing that made
binary search on the answer (lesson 3) possible — just applied to a
structural feature of the array instead of an abstract answer space.

````reveal Module complete — what carries forward
- The **invariant-first discipline** — state what [lo, hi] or [lo, hi)
  claims BEFORE writing the loop — is the difference between binary
  search you can trust and binary search you hope works. Apply it to
  every future halving algorithm, not just explicit "binary search"
  problems.
- **Monotonic predicates** generalize binary search past sorted arrays
  entirely — this recognition returns constantly in Stage 4, where
  "binary search on the answer" solves DP and greedy problems that
  don't look like search problems at all.
- **"Which half is eliminable"** reasoning — proving a whole region is
  safe to discard from ONE comparison — is Two Pointers' elimination
  argument, Prefix Sum's monotonic-aggregate reasoning, and this
  module's halving, all the same underlying move at different scales.

**Next: Module 14 — Sorting**, where comparison sorts get real proofs
of their bounds, and the partition step from Two Pointers becomes
quicksort's engine.
````

```quiz
{
  "question": "Why does the predicate `nums[mid] <= nums[hi]` correctly split the array into 'before the rotation point' (false) and 'at or after it' (true), for ANY valid lo/hi range during the search?",
  "options": [
    "It works by coincidence for these specific examples — the walkthrough above happens to trace through inputs where the predicate holds, but a differently-rotated array could easily produce a counterexample where the split logic breaks down",
    "nums[hi] always belongs to whichever contiguous piece of the ORIGINAL sorted sequence the current search range sits in; every index at or after the true rotation point is <= that piece's largest value (nums[hi]), and every index before it is > nums[hi], because rotation guarantees exactly one discontinuity, and the range never straddles the wrong side of it incorrectly",
    "It only works for the initial full-array range, not shrunk ranges — once lo and hi have moved inward from the original endpoints, nums[hi] no longer reliably represents the boundary between the two rotated pieces"
  ],
  "answer": 1,
  "explanation": "The invariant survives shrinking because the search range always stays a contiguous sub-piece of the original rotated array, and the SAME single discontinuity property (from the previous problem) guarantees the predicate stays monotonic within any such sub-piece — this is worth confirming by re-tracing the walkthrough above and checking the predicate at each step."
}
```
