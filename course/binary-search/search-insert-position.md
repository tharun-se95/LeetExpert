---
title: Search Insert Position
type: problem
---

## Problem

Given a sorted array of **distinct** integers and a target, return the
index if the target is found. If not, return the index where it
**would be inserted** to keep the array sorted.

**Examples**

```examples
nums = [1,3,5,6], target = 5  →  2   (found at index 2)
nums = [1,3,5,6], target = 2  →  1   (would insert between 1 and 3)
nums = [1,3,5,6], target = 7  →  4   (would insert at the end)
nums = [1,3,5,6], target = 0  →  0   (would insert at the start)
```

```constraint
1 ≤ n ≤ 10⁴ · sorted, distinct values.
```

## Attempt it first

This problem is the boundary-search lesson's `lower_bound`, verbatim —
"where would target go" and "first index with `arr[i] >= target`" are
the same question when values are distinct. The exercise is recognizing
that identity, not writing new code.


```sandbox
{
  "id": "search-insert-position",
  "fn": { "python": "search_insert", "javascript": "searchInsert" },
  "check": "return",
  "starter": {
    "python": "def search_insert(nums, target):\n    # Return the index where target is or belongs.\n    pass\n",
    "javascript": "function searchInsert(nums, target) {\n  // Return the index where target is or belongs.\n}\n"
  },
  "cases": [
    { "args": [[1,3,5,6],5], "expect": 2 },
    { "args": [[1,3,5,6],2], "expect": 1 },
    { "args": [[1,3,5,6],7], "expect": 4 },
    { "args": [[1,3,5,6],0], "expect": 0 },
    { "args": [[1],1], "expect": 0 }
  ]
}
```
````reveal Hint — it's lower_bound, unmodified
The insertion point for target is exactly the first index where
arr[i] >= target — if target is present, that's its index (found); if
absent, that's precisely where it belongs to keep order.
````

## Brute force, for contrast

Linear scan for the first element ≥ target: O(n). Fine at this size,
but the point of the exercise is recognizing the boundary-search
reduction — this exact shape reappears in every "find where X starts"
problem from here on, at scales where O(n) won't do.

## Solution

`````reveal Solution — lower_bound, unmodified
````tabs
```python
def search_insert(nums: list[int], target: int) -> int:
    lo, hi = 0, len(nums)
    while lo < hi:
        mid = lo + (hi - lo) // 2
        if nums[mid] >= target:
            hi = mid
        else:
            lo = mid + 1
    return lo
```

```typescript
function searchInsert(nums: number[], target: number): number {
  let lo = 0;
  let hi = nums.length;
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (nums[mid] >= target) {
      hi = mid;
    } else {
      lo = mid + 1;
    }
  }
  return lo;
}
```
````

Check all four examples against the template directly: target=5 finds
`nums[2]=5 >= 5` first at index 2 — correct whether "found" or
"insertion point," because they coincide exactly when the target is
present. target=7 never satisfies `>= 7` within the array, so the loop
runs until `lo == hi == 4` (one past the end) — the correct "insert at
the end" answer, for free, from the half-open range convention.

```complexity
{
  "time": "O(log n)",
  "space": "O(1)",
  "why": "Standard halving loop — the invariant template applied directly."
}
```
`````

## Variants

- **Find First and Last Position** (next): the two-sided generalization
  when duplicates are allowed — this problem's distinctness constraint
  is what let a single boundary search double as both "found" and
  "insert here."
- **Search a 2D Matrix:** treat the 2D grid as a flattened 1D sorted
  array via index arithmetic (`row = mid // cols, col = mid % cols`) —
  same template, one extra translation step.

```quiz
{
  "question": "Why does this problem's DISTINCT-values constraint matter for reusing lower_bound unmodified?",
  "options": [
    "With distinct values, 'first index >= target' and 'the index of target if present' are the same index — with duplicates, lower_bound still finds the FIRST occurrence, which is usually what you want, but the problem's guarantee of distinctness is what makes 'found' and 'insertion point' collapse into a single unambiguous answer",
    "Distinctness is needed to avoid infinite loops — without it, two adjacent equal elements could cause the search range to stop shrinking on certain inputs, since the predicate wouldn't reliably distinguish between them",
    "It doesn't matter — lower_bound works the same either way; the function's behavior and output are entirely unaffected by whether the input array contains duplicate values"
  ],
  "answer": 0,
  "explanation": "lower_bound is well-defined regardless of duplicates — but THIS problem's phrasing ('find target OR return insertion point') only makes sense as a single coherent question because distinctness guarantees at most one correct index either way."
}
```
