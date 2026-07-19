---
title: Remove Duplicates from Sorted Array
type: problem
---

## Problem

Given an integer array `nums` sorted in non-decreasing order, remove the
duplicates **in place** so that each unique element appears once, keeping
relative order. Return `k`, the number of unique elements. The first `k`
slots of `nums` must hold the answer; what's past them doesn't matter.

**Examples**

```text
nums = [1, 1, 2]            →  k = 2,  nums = [1, 2, _]
nums = [0,0,1,1,1,2,2,3,3,4] →  k = 5,  nums = [0,1,2,3,4,_,_,_,_,_]
```

**Constraints:** 1 ≤ n ≤ 3·10⁴ · values in [−100, 100] · nums is sorted ·
O(1) auxiliary space required.

## Attempt it first

You have every tool: this is the write-pointer template from the previous
lesson, with one twist to find. Genuinely try before opening anything.

````reveal Hint 1 — what does "keeper" mean here?
An element is a keeper if it's *not equal to the previous keeper*. In a
sorted array, duplicates are adjacent — so comparing against the last
written value is enough to detect them. (This is why sortedness matters:
it turns a global property, "seen before anywhere," into a local one.)
````

````reveal Hint 2 — the template, specialized
Run read over every element. Keep `nums[read]` when it differs from
`nums[write − 1]` — the most recently kept value. Seed the process: the
first element is always a keeper, so start write = 1, read = 1.
````

## Brute force, for contrast

Without the in-place constraint: copy unique values into a new list
(append when different from the list's last), then write back — O(n) time
but **O(n) auxiliary space**. The constraint isn't asking you to be faster;
it's asking you to be *tighter*. That's a different axis, and interviewers
probe it deliberately.

## The insight

> Sorted ⇒ duplicates are adjacent ⇒ "is this a new value?" is a single
> comparison against the last kept element ⇒ the write-pointer template
> applies with `keep = (current ≠ last kept)`.

## Solution

`````reveal Solution — code and walkthrough
````tabs
```python
def remove_duplicates(nums: list[int]) -> int:
    write = 1                          # nums[0] is always kept
    for read in range(1, len(nums)):
        if nums[read] != nums[write - 1]:
            nums[write] = nums[read]
            write += 1
    return write
```

```typescript
function removeDuplicates(nums: number[]): number {
  let write = 1; // nums[0] is always kept
  for (let read = 1; read < nums.length; read++) {
    if (nums[read] !== nums[write - 1]) {
      nums[write] = nums[read];
      write++;
    }
  }
  return write;
}
```
````

Trace on `[0,0,1,1,1,2]`: read=1 (0 == 0, skip) · read=2 (1 ≠ 0 → write
it, write=2) · read=3,4 (1 == 1, skip) · read=5 (2 ≠ 1 → write, write=3).
Result: `[0,1,2,…]`, k=3.

Invariant, stated fully: *nums[0..write) holds the distinct values of
everything read so far, in order, and nums[write−1] is the largest of
them.* Every branch preserves it; at loop end "everything read" is the
whole array.

```complexity
{
  "time": "O(n)",
  "space": "O(1)",
  "why": "read visits each index once; write only moves forward. Two integer indexes are the only extra state."
}
```
`````

## Variants

- **Allow at most 2 copies of each value** (LeetCode 80): same template,
  keep when `nums[read] != nums[write - 2]`. Generalizes to "at most k."
- **Unsorted input:** adjacency breaks; "seen before" becomes a global
  question needing a hash set (Hash Tables module) — O(n) time, O(n) space,
  or sort first and lose stability.

```quiz
{
  "question": "For the 'at most 2 duplicates' variant, why does comparing against nums[write − 2] work?",
  "options": [
    "It checks the two most recent reads",
    "If nums[read] equals nums[write − 2], then (by sortedness) write − 1 holds the same value too — writing would create a third copy",
    "It's an optimization to skip faster"
  ],
  "answer": 1,
  "explanation": "The kept prefix is sorted, so nums[write−2] == nums[read] forces nums[write−1] to be equal as well (it's sandwiched). One comparison rules out a third copy — the invariant does the work."
}
```
