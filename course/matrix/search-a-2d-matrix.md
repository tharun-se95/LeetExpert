---
title: Search a 2D Matrix
type: problem
---

## Problem

You are given an `m × n` integer matrix with two properties:

1. Each row is sorted in ascending order (left to right).
2. The first integer of each row is **greater than** the last integer of
   the previous row.

Given a `target`, return `true` if it appears in the matrix and `false`
otherwise. (LeetCode 74.)

**Examples**

```examples
matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 3 → true
matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 13 → false
```

```constraint
`1 ≤ m, n ≤ 100`, values in ±10⁴. Both stated properties matter — read them carefully before attempting, because together they say something stronger than "each row is sorted."
```

## Attempt it first

Before writing anything, stare at the two properties and ask what they
*jointly* imply about the matrix read in row-major order (lesson 1 / 2:
row 0 left-to-right, then row 1, and so on). Property 1 sorts within a
row; property 2 says every row starts above where the previous row ended.
Chain them. **What does the entire row-major sequence of values look
like?** If you see it, you'll know exactly which Module 13 technique
applies and you're most of the way done. Try to name the structure before
revealing the hint.


```sandbox
{
  "id": "search-a-2d-matrix",
  "fn": { "python": "search_matrix", "javascript": "searchMatrix" },
  "check": "return",
  "starter": {
    "python": "def search_matrix(matrix, target):\n    # Return True if target appears anywhere in the matrix.\n    pass\n",
    "javascript": "function searchMatrix(matrix, target) {\n  // Return true if target appears anywhere in the matrix.\n}\n"
  },
  "cases": [
    { "args": [[[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], 3], "expect": true },
    { "args": [[[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], 13], "expect": false },
    { "args": [[[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], 1], "expect": true },
    { "args": [[[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], 60], "expect": true },
    { "args": [[[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], 0], "expect": false },
    { "args": [[[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], 61], "expect": false },
    { "args": [[[1]], 1], "expect": true },
    { "args": [[[1]], 2], "expect": false },
    { "args": [[[1, 3], [5, 7]], 5], "expect": true }
  ]
}
```

````reveal Hint — flatten it in your head
Read the matrix in row-major order: `1, 3, 5, 7, 10, 11, 16, 20, 23, …`.
Property 1 keeps each row ascending; property 2 guarantees the jump from
one row's last element to the next row's first element is *also*
ascending (`7 → 10`, `20 → 23`). So the row-major reading is **one fully
sorted sequence of `m·n` values** — a sorted array that merely happens to
be stored folded into a grid. And you already have an O(log) technique for
searching a sorted array: Module 13's binary search. The only work left
is translating a 1D index back into a `(row, col)` pair.
````

## Brute force, for contrast

Ignore the structure entirely and scan every cell:

````tabs
```python
def search_bruteforce(matrix: list[list[int]], target: int) -> bool:
    for row in matrix:
        for value in row:
            if value == target:
                return True
    return False
```

```typescript
function searchBruteforce(matrix: number[][], target: number): boolean {
  for (const row of matrix) {
    for (const value of row) {
      if (value === target) return true;
    }
  }
  return false;
}
```
````

**O(m·n)** — correct, but it throws away both sortedness properties.
A middle-ground O(m + n) "staircase" search (start top-right, move left on
too-big, down on too-small) uses only property 1 and works even without
property 2. But property 2 is *stronger*, and it unlocks the full
**O(log(m·n))** binary search. When the problem hands you a strictly
stronger precondition, use it.

## The insight: it's a sorted array wearing a grid costume

The two properties together make the row-major sequence a single sorted
array of length `m·n`. So we run Module 13's binary search over the
**virtual index range `[0, m·n)`** — never materializing the flattened
array — and convert each virtual index `k` to its grid coordinates with
the row-major arithmetic from lesson 1, run in reverse:

```text
row = k // n      (which row: how many full rows of width n fit in k)
col = k %  n      (offset within that row)
```

This is precisely lesson 1's `offset(i, j) = i·n + j` inverted: integer
division recovers the row, remainder recovers the column. With that
translation in hand, the search is Module 13's invariant-driven template
verbatim.

## Solution

`````reveal Solution — binary search over the virtual flattened index
We keep Module 13's exact loop invariant: **if `target` is in the matrix,
its virtual index lies in the closed range `[lo, hi]`.** Each step
inspects the midpoint and provably discards the half that cannot contain
it, shrinking `[lo, hi]` until it's empty (target absent) or centered on
target.

````tabs
```python
def search_matrix(matrix: list[list[int]], target: int) -> bool:
    rows, cols = len(matrix), len(matrix[0])
    lo, hi = 0, rows * cols - 1          # virtual indices into the flattened array
    while lo <= hi:                      # invariant: answer, if any, is in [lo, hi]
        mid = (lo + hi) // 2
        value = matrix[mid // cols][mid % cols]   # unflatten to (row, col)
        if value == target:
            return True
        if value < target:
            lo = mid + 1                 # left half (incl. mid) is all < target
        else:
            hi = mid - 1                 # right half (incl. mid) is all > target
    return False
```

```typescript
function searchMatrix(matrix: number[][], target: number): boolean {
  const rows = matrix.length;
  const cols = matrix[0].length;
  let lo = 0;
  let hi = rows * cols - 1;              // virtual indices into the flattened array
  while (lo <= hi) {                     // invariant: answer, if any, is in [lo, hi]
    const mid = Math.floor((lo + hi) / 2);
    const value = matrix[Math.floor(mid / cols)][mid % cols]; // unflatten
    if (value === target) return true;
    if (value < target) {
      lo = mid + 1;                      // left half (incl. mid) is all < target
    } else {
      hi = mid - 1;                      // right half (incl. mid) is all > target
    }
  }
  return false;
}
```
````

The only line that differs from a plain 1D binary search is the value
read: `matrix[mid // cols][mid % cols]` instead of `arr[mid]`. Everything
else — the closed-interval `[lo, hi]`, the `lo <= hi` loop condition, the
`mid ± 1` updates that keep the interval strictly shrinking so the loop
must terminate — is Module 13's template unchanged. That's the point: the
grid never really mattered; it was a sorted array folded into two
dimensions, and unfolding the index at read-time is the whole trick.

```complexity
{
  "time": "O(log(m·n))",
  "space": "O(1)",
  "why": "Binary search halves the [lo, hi] index range each iteration, so it runs log₂(m·n) times before the interval empties — identical to searching a length-(m·n) sorted array. The index-to-coordinate conversion is one integer division and one remainder, both O(1). No flattened copy is built, so no extra space beyond a few scalars."
}
```

Note `log(m·n) = log m + log n`, which is strictly better than the
O(m + n) staircase search and dramatically better than the O(m·n) scan —
the payoff for exploiting property 2.
`````

## Variants

- **Search a 2D Matrix II** (LeetCode 240): rows and columns each sorted,
  but property 2 is *dropped* — the row-major reading is no longer globally
  sorted, so binary-search-the-flattened-array breaks. The right tool
  there is the O(m + n) staircase search that needs only per-row/per-column
  sortedness. Recognizing *which* precondition you have decides the
  algorithm.
- **Binary Search** (Module 13): the parent template this problem
  instantiates; revisit its invariant discussion if the `[lo, hi]` /
  `lo <= hi` / `mid ± 1` reasoning here felt unfamiliar.

```quiz
{
  "questions": [
    {
      "question": "Why does this problem's property 2 (each row's first element > previous row's last element) enable O(log(m·n)) binary search, when per-row sortedness alone would not?",
      "options": [
        "Property 2 makes each row shorter — knowing where each row's values start relative to the previous row lets the search skip over a prefix of every row, effectively shrinking the search space per row",
        "Property 2 is what makes the ENTIRE row-major reading one globally sorted sequence — without it, rows are individually sorted but the jump between rows can go down, so the flattened array isn't monotonic and binary search over it would be invalid",
        "Property 2 lets you skip empty rows — the guarantee about row boundaries is primarily useful for quickly identifying and bypassing rows that contain no data, speeding up the scan"
      ],
      "answer": 1,
      "explanation": "Binary search requires a globally monotonic sequence. Property 1 sorts within rows; property 2 guarantees the boundaries between rows are also ascending. Only both together make the m·n row-major values a single sorted array — which is the precondition Module 13's technique demands. Drop property 2 and you must fall back to the O(m+n) staircase (Search a 2D Matrix II)."
    },
    {
      "question": "The solution reads matrix[mid // cols][mid % cols]. How does this relate to lesson 1's row-major addressing?",
      "options": [
        "It's an unrelated coincidence of modular arithmetic — integer division and modulo happen to recover row and column correctly here, but this is a separate mathematical fact from the row-major addressing formula in lesson 1",
        "It only works when the matrix is square — the division-and-remainder trick to recover row and column from a flat index relies on rows and columns having the same length, breaking down on rectangular grids",
        "It's lesson 1's forward map offset = row·cols + col run in reverse: integer-dividing a flat index by the row width recovers the row, and the remainder recovers the column — converting a 1D virtual index back to 2D coordinates"
      ],
      "answer": 2,
      "explanation": "Lesson 1 established offset(i,j) = i·cols + j. Given a flat offset k, that equation inverts to i = k // cols and j = k % cols. This lets binary search operate on a virtual 1D index while reading the real 2D grid — no flattened copy needed. It works for any m×n, not just square."
    }
  ]
}
```
