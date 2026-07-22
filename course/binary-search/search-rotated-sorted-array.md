---
title: Search in Rotated Sorted Array
type: problem
---

## Problem

A sorted array (**distinct values**) has been **rotated** at an unknown
pivot (e.g. `[0,1,2,4,5,6,7]` → `[4,5,6,7,0,1,2]`). Given the rotated
array and a target, return its index, or −1. Required: **O(log n)**.

**Examples**

```text
nums = [4,5,6,7,0,1,2], target = 0  →  4
nums = [4,5,6,7,0,1,2], target = 3  →  -1
nums = [1], target = 0              →  -1
```

**Constraints:** 1 ≤ n ≤ 5000 · distinct values · rotated at some
unknown pivot (possibly 0, i.e. not rotated at all).

## Attempt it first

The array as a whole isn't sorted, so the plain invariant template
doesn't directly apply — but a crucial fact rescues it: **at least one
half of any split is always fully sorted.** Find that fact yourself by
sketching a few rotated examples and splitting them at the midpoint
before opening the hint.

````reveal Hint 1 — which half is sorted?
Split at mid. Compare nums[lo] to nums[mid]: if nums[lo] <= nums[mid],
the LEFT half [lo, mid] is sorted (no rotation point inside it — a
rotation point would make nums[lo] > nums[mid]). Otherwise the RIGHT
half [mid, hi] must be the sorted one.
````

````reveal Hint 2 — once you know the sorted half, decide normally
If target falls within the sorted half's value range (nums[lo] <=
target < nums[mid], say), search there with the ORDINARY invariant
argument — sortedness guarantees the elimination is valid. Otherwise,
target must be in the other half — recurse there instead. Every
iteration eliminates a full half, exactly like plain binary search.
````

## Brute force, for contrast

Linear scan: O(n), and it ignores the fact that the array is "sorted,
except for one rotation" — nearly all of the ordering structure that
makes fast search possible. The O(log n) requirement forces recognizing
that structure.

## The insight

> A rotated sorted array splits into exactly one sorted half and one
> "rotated" half at any midpoint — never two rotated halves. Determine
> which half is sorted with one comparison (`nums[lo]` vs `nums[mid]`),
> then use ordinary range-containment to decide whether target could be
> in the sorted half; if not, it must be in the other, still-eliminable
> half. Each iteration eliminates half the array either way, so the
> O(log n) bound survives even though nothing is globally sorted.

## Solution

`````reveal Solution — determine the sorted half, then decide
````tabs
```python
def search(nums: list[int], target: int) -> int:
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = lo + (hi - lo) // 2
        if nums[mid] == target:
            return mid
        if nums[lo] <= nums[mid]:                  # left half is sorted
            if nums[lo] <= target < nums[mid]:
                hi = mid - 1                        # target in the sorted left half
            else:
                lo = mid + 1                        # target must be in the other half
        else:                                        # right half is sorted
            if nums[mid] < target <= nums[hi]:
                lo = mid + 1                        # target in the sorted right half
            else:
                hi = mid - 1                        # target must be in the other half
    return -1
```

```typescript
function search(nums: number[], target: number): number {
  let lo = 0;
  let hi = nums.length - 1;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (nums[mid] === target) return mid;
    if (nums[lo] <= nums[mid]) {
      // left half is sorted
      if (nums[lo] <= target && target < nums[mid]) {
        hi = mid - 1; // target in the sorted left half
      } else {
        lo = mid + 1; // target must be in the other half
      }
    } else {
      // right half is sorted
      if (nums[mid] < target && target <= nums[hi]) {
        lo = mid + 1; // target in the sorted right half
      } else {
        hi = mid - 1; // target must be in the other half
      }
    }
  }
  return -1;
}
```
````

Trace on `[4,5,6,7,0,1,2], target=0`: lo=0,hi=6,mid=3, `nums[3]=7`.
`nums[0]=4 <= nums[3]=7` → left sorted. Is `4 <= 0 < 7`? No → search
right: `lo=4`. Now lo=4,hi=6,mid=5, `nums[5]=1`. `nums[4]=0 <=
nums[5]=1` → left sorted. Is `0 <= 0 < 1`? Yes → search left: `hi=4`.
Now lo=4,hi=4,mid=4, `nums[4]=0 == target` → return 4 ✓.

The `nums[lo] <= nums[mid]` check (not `<`) matters when the sorted
half has exactly one or two elements — with `<`, a two-element sorted
half where they happen to be adjacent-and-equal-comparison edge cases
would misclassify which side is sorted; `<=` handles `lo == mid`
correctly (a single-element range is trivially "sorted").

```complexity
{
  "time": "O(log n)",
  "space": "O(1)",
  "why": "Exactly one half is eliminated per iteration, same as ordinary binary search — the rotation adds one extra comparison per step to determine WHICH elimination rule applies, not an extra factor of complexity."
}
```
`````

## Variants

- **Search in Rotated Sorted Array II** (duplicates allowed): the
  `nums[lo] <= nums[mid]` check can become ambiguous when
  `nums[lo] == nums[mid] == nums[hi]` — neither half is provably
  sorted. The fix degrades gracefully: shrink both ends by one and
  retry, which costs the worst-case O(n) guarantee (adversarial
  all-equal input) but stays correct.
- **Find Minimum in Rotated Sorted Array** (next): the same "which half
  is sorted" reasoning, aimed at finding the rotation point itself
  rather than a target value.

```quiz
{
  "question": "Why does exactly ONE of the two halves around any midpoint always end up fully sorted in a rotated array?",
  "options": [
    "It's a coincidence that happens to hold for the given examples — the specific arrays used to illustrate the algorithm happen to split cleanly, but a differently-rotated array could produce a midpoint where neither half is sorted",
    "A rotated sorted array has exactly ONE rotation point (one place where a larger value is immediately followed by a smaller one). Splitting at any midpoint, that single discontinuity can only fall in one of the two halves — the half WITHOUT the discontinuity is necessarily still in sorted order",
    "Because the array has distinct values — without a guarantee of distinctness, ties between elements would make it possible for both halves around a midpoint to appear unsorted simultaneously, breaking the classification"
  ],
  "answer": 1,
  "explanation": "The key structural fact is that rotation introduces exactly one 'break' in the ordering. A split can separate the break from one side but never from both — which is precisely why one comparison (nums[lo] vs nums[mid]) is enough to identify the sorted half every time."
}
```
