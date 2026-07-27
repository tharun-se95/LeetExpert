---
title: Sort Colors (Dutch National Flag)
type: problem
---

## Problem

An array contains only 0s, 1s, and 2s (red/white/blue). Sort it **in
place**, in **one pass**, without the library sort.

**Examples**

```text
[2,0,2,1,1,0]  →  [0,0,1,1,2,2]
[2,0,1]        →  [0,1,2]
[0]            →  [0]
```

**Constraints:** 1 ≤ n ≤ 300 · values ∈ {0,1,2} · follow-up: one pass,
O(1) space.

## Attempt it first

The partition lesson handed you the three-zone picture and derived the
asymmetric mid rule. Reconstruct the algorithm from the picture — drawing
the four regions and asking "what restores the invariant?" for each of
the three possible values at mid. If you get stuck on whether mid
advances, you're at the exact spot the lesson said you would be; go back
to the regions, not to trial and error.


```sandbox
{
  "id": "sort-colors",
  "fn": { "python": "sort_colors", "javascript": "sortColors" },
  "check": "mutate",
  "starter": {
    "python": "def sort_colors(nums):\n    # Sort 0s, 1s, 2s in place. Return nothing.\n    pass\n",
    "javascript": "function sortColors(nums) {\n  // Sort 0s, 1s, 2s in place. Return nothing.\n}\n"
  },
  "cases": [
    { "args": [[2,0,2,1,1,0]], "expect": [0,0,1,1,2,2] },
    { "args": [[2,0,1]], "expect": [0,1,2] },
    { "args": [[0]], "expect": [0] },
    { "args": [[1,2,0,2,1,0,1]], "expect": [0,0,1,1,1,2,2] }
  ]
}
```
````reveal Hint 1 — the two-pass warm-up
Counting sort in miniature: count the 0s, 1s, 2s (Module 6's Count
verb — or just three integers), then overwrite the array in order. Two
passes, O(1) space, completely fine — but the follow-up says one pass,
and the interviewer's real question is the flag algorithm.
````

````reveal Hint 2 — the regions and their agents
[0, low) zeros · [low, mid) ones · [mid, high] UNREAD · (high, n) twos.
mid is the read head. Write the three rules by asking, for each value
mid can see, which swap/advance extends a region without breaking
another. The lesson already argued the one non-obvious rule.
````

## Brute force, for contrast

Any real sort is O(n log n) and ignores the three-value promise. The
counting version (Hint 1) is O(n) but two passes and doesn't generalize
to "partition around a pivot" — the flag version is quicksort's 3-way
partition (Module 14 again), which is why it's worth owning in exactly
this form.

## Solution

`````reveal Solution — three pointers, one pass
````tabs
```python
def sort_colors(nums: list[int]) -> None:
    low, mid, high = 0, 0, len(nums) - 1
    while mid <= high:                        # note: <=, not <
        if nums[mid] == 0:
            nums[low], nums[mid] = nums[mid], nums[low]
            low += 1
            mid += 1        # what arrived is a known 1 (or mid==low: itself)
        elif nums[mid] == 1:
            mid += 1        # already in place
        else:  # nums[mid] == 2
            nums[mid], nums[high] = nums[high], nums[mid]
            high -= 1       # do NOT advance mid: arrival is unread
```

```typescript
function sortColors(nums: number[]): void {
  let low = 0;
  let mid = 0;
  let high = nums.length - 1;
  while (mid <= high) {
    // note: <=, not <
    if (nums[mid] === 0) {
      [nums[low], nums[mid]] = [nums[mid], nums[low]];
      low++;
      mid++; // what arrived is a known 1 (or mid==low: itself)
    } else if (nums[mid] === 1) {
      mid++; // already in place
    } else {
      // nums[mid] === 2
      [nums[mid], nums[high]] = [nums[high], nums[mid]];
      high--; // do NOT advance mid: arrival is unread
    }
  }
}
```
````

The loop condition is `mid <= high` because the unread region is the
CLOSED interval [mid, high] — when they're equal, one element remains
unexamined. `mid < high` skips it; test `[2,0,1]` catches the bug (as
does `[1,2,0]` for the advance-after-high-swap bug — two three-element
inputs that between them kill both classic mistakes).

Why the 0-case may advance mid: what arrives from position low is
either a 1 (if [low, mid) was non-empty — its elements are all 1s) or
mid's own element back (if low == mid). Both are safe to step past.
The lesson's asymmetry argument, now embodied in three test-able lines.

```complexity
{
  "time": "O(n) — one pass",
  "space": "O(1)",
  "why": "Every iteration either advances mid or shrinks high by one: the unread region loses one element per step, so exactly n examinations happen. Three indexes of state."
}
```
`````

## Variants

- **Partition around an arbitrary pivot 3-ways** (< pivot, == pivot,
  > pivot): the same algorithm with comparisons instead of value
  checks — the engine of 3-way quicksort, which demolishes
  many-duplicates inputs (Module 14).
- **Move Zeroes** (Module 4) was the two-zone version; try deriving it
  from this one by deleting a region.
- **Sort an array of 0s and 1s:** two zones, one boundary — the plain
  partition from the lesson.

```quiz
{
  "question": "Which pair of test inputs kills the two classic Dutch-flag bugs, and why these?",
  "options": [
    "[0,0,0] and [2,2,2] — the extremes; a uniform array forces every iteration down the same code path repeatedly, which is the most direct way to exercise each branch of the three-way conditional at least once",
    "[2,0,1] (loop with mid < high leaves the final element unexamined) and [1,2,0] (advancing mid after the high-swap steps past the unread 0 that just arrived) — each input is minimal for its bug",
    "Any random large array — with enough elements and enough randomness in the value distribution, both classic bugs are statistically certain to be triggered somewhere in the array purely by chance"
  ],
  "answer": 1,
  "explanation": "Both bugs are boundary errors, so tiny adversarial inputs find them where random data won't: the bugs need a 2 early (forcing the high-swap path) and the wrong element arriving at exactly the wrong moment. Deriving minimal killer tests from the invariant is the same skill as deriving the algorithm."
}
```
