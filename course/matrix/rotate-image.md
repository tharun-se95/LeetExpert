---
title: Rotate Image
type: problem
---

## Problem

You are given an `n × n` 2D matrix representing an image. Rotate the
image by **90 degrees clockwise**, **in place** — you must modify the
input matrix directly and may **not** allocate another 2D matrix to do
it. (LeetCode 48.)

**Examples**

```text
[[1,2,3],        [[7,4,1],
 [4,5,6],   →     [8,5,2],
 [7,8,9]]         [9,6,3]]

[[5,1,9,11],      [[15,13, 5, 1],
 [2,4,8,10],  →    [14, 3, 4, 9],
 [13,3,6,7],       [12, 6, 8,11],
 [15,14,12,16]]    [16, 7,10,13]]
```

**Constraints:** `n == matrix.length == matrix[i].length`, `1 ≤ n ≤ 20`,
values in ±1000. The in-place / no-extra-matrix requirement is part of
the problem, not a bonus.

## Attempt it first

This problem is a direct application of the previous concept lesson (In-
Place Transformations) — that's deliberate. Before revealing anything,
try to answer the two questions the concept lesson set up: **what is the
target position `(r, c)` rotates *to* under a 90° clockwise turn, and
which two in-place reflections compose to produce that map?** If you can
write down where `(r, c)` lands, the code writes itself. Try it, then
open the hint only if you're stuck on the decomposition.


```sandbox
{
  "id": "rotate-image",
  "fn": { "python": "rotate", "javascript": "rotate" },
  "check": "mutate",
  "starter": {
    "python": "def rotate(matrix):\n    # Rotate matrix 90 degrees clockwise in place. Return nothing.\n    pass\n",
    "javascript": "function rotate(matrix) {\n  // Rotate matrix 90 degrees clockwise in place. Return nothing.\n}\n"
  },
  "cases": [
    {
      "args": [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]],
      "expect": [[7, 4, 1], [8, 5, 2], [9, 6, 3]]
    },
    {
      "args": [[[5, 1, 9, 11], [2, 4, 8, 10], [13, 3, 6, 7], [15, 14, 12, 16]]],
      "expect": [[15, 13, 2, 5], [14, 3, 4, 1], [12, 6, 8, 9], [16, 7, 10, 11]]
    },
    { "args": [[[1]]], "expect": [[1]] },
    { "args": [[[1, 2], [3, 4]]], "expect": [[3, 1], [4, 2]] },
    {
      "args": [
        [
          [1, 2, 3, 4, 5],
          [6, 7, 8, 9, 10],
          [11, 12, 13, 14, 15],
          [16, 17, 18, 19, 20],
          [21, 22, 23, 24, 25]
        ]
      ],
      "expect": [
        [21, 16, 11, 6, 1],
        [22, 17, 12, 7, 2],
        [23, 18, 13, 8, 3],
        [24, 19, 14, 9, 4],
        [25, 20, 15, 10, 5]
      ]
    },
    { "args": [[[-1, 2], [3, -4]]], "expect": [[3, -1], [-4, 2]] }
  ]
}
```

````reveal Hint — decompose, don't index-juggle
You *can* rotate by directly computing each destination — value at
`(r, c)` goes to `(c, n−1−r)` — but doing that in place forces you to
rotate four cells at a time in a cycle so you don't overwrite a value you
still need. That works and is a legitimate solution, but it's fiddly. The
cleaner route is the concept lesson's: express the rotation as **two
in-place reflections you already know are safe** — a transpose followed by
a per-row reverse. Recover which two, and in which order, from the proof
that `(r, c) → (c, r) → (c, n−1−r)`.
````

## Brute force, for contrast

The straightforward approach ignores the constraint and allocates a fresh
`n × n` grid, writing `result[c][n−1−r] = matrix[r][c]` for every cell,
then (if the signature demands mutating the input) copies it back:

````tabs
```python
def rotate_bruteforce(matrix: list[list[int]]) -> None:
    n = len(matrix)
    result = [[0] * n for _ in range(n)]      # the disallowed second grid
    for r in range(n):
        for c in range(n):
            result[c][n - 1 - r] = matrix[r][c]
    for r in range(n):
        matrix[r][:] = result[r]              # copy back into the input
```

```typescript
function rotateBruteforce(matrix: number[][]): void {
  const n = matrix.length;
  const result: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      result[c][n - 1 - r] = matrix[r][c]; // the disallowed second grid
    }
  }
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) matrix[r][c] = result[r][c]; // copy back
  }
}
```
````

It's O(n²) time — fine — but O(n²) space for `result`, which the problem
explicitly forbids. It's worth writing once because it makes the target
formula `result[c][n−1−r] = matrix[r][c]` completely explicit; the
in-place solution has to reproduce *that same mapping* without the second
grid to hold intermediate values.

## The insight

The mapping `(r, c) → (c, n−1−r)` is not one atomic move but the
**composition of two reflections**, each of which is a set of independent
in-place swaps that can't clobber each other:

1. **Transpose** — reflect across the main diagonal, sending `(r, c) →
   (c, r)`. Done as swaps of `(i, j) ↔ (j, i)` over the upper triangle.
2. **Reverse each row** — reflect across the vertical center, sending
   `(c, r) → (c, n−1−r)`. Done as in-place row reversals.

Run in this order, transpose lands every value at `(c, r)` and the row
reversals push each to `(c, n−1−r)` — exactly the clockwise target proved
in the concept lesson. Because each phase is internally a bunch of swaps
that touch disjoint pairs, no write destroys a value a later step of the
*same* phase still needs, so the whole thing is safe in place with only a
scalar temporary.

## Solution

`````reveal Solution — transpose, then reverse each row
````tabs
```python
def rotate(matrix: list[list[int]]) -> None:
    n = len(matrix)
    # Step 1: transpose — swap (i, j) with (j, i) over the upper triangle.
    for i in range(n):
        for j in range(i + 1, n):
            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
    # Step 2: reverse each row, mapping column x → n-1-x.
    for row in matrix:
        row.reverse()
```

```typescript
function rotate(matrix: number[][]): void {
  const n = matrix.length;
  // Step 1: transpose — swap (i, j) with (j, i) over the upper triangle.
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      [matrix[i][j], matrix[j][i]] = [matrix[j][i], matrix[i][j]];
    }
  }
  // Step 2: reverse each row, mapping column x → n-1-x.
  for (const row of matrix) {
    row.reverse();
  }
}
```
````

The inner loop's `j = i + 1` (not `j = 0`) is load-bearing exactly as the
concept lesson argued: iterating the full row would swap each pair twice
and undo the transpose. Everything else is the two-phase composition
applied verbatim.

```complexity
{
  "time": "O(n²)",
  "space": "O(1)",
  "why": "Transpose does one swap per upper-triangle cell (n(n−1)/2 of them); reversing all rows does n × n/2 swaps. Both are proportional to n², and every value is genuinely relocated so O(n²) is unavoidable. Only a scalar temporary is used per swap — no second grid."
}
```
`````

`````reveal Alternative — the four-way cyclic rotation (one pass, no transpose)
This rotates four cells at a time around a cycle, layer by layer — the
"index-juggling" route the hint warned is fiddlier. It's included because
it's a legitimate O(1)-space answer and makes the four-cell aliasing
explicit.

````tabs
```python
def rotate_cyclic(matrix: list[list[int]]) -> None:
    n = len(matrix)
    for layer in range(n // 2):                 # each concentric ring
        first, last = layer, n - 1 - layer
        for i in range(first, last):
            offset = i - first
            top = matrix[first][i]              # save top
            matrix[first][i] = matrix[last - offset][first]   # left → top
            matrix[last - offset][first] = matrix[last][last - offset]  # bottom → left
            matrix[last][last - offset] = matrix[i][last]     # right → bottom
            matrix[i][last] = top                              # top → right
```

```typescript
function rotateCyclic(matrix: number[][]): void {
  const n = matrix.length;
  for (let layer = 0; layer < Math.floor(n / 2); layer++) {
    const first = layer;
    const last = n - 1 - layer;
    for (let i = first; i < last; i++) {
      const offset = i - first;
      const top = matrix[first][i]; // save top
      matrix[first][i] = matrix[last - offset][first]; // left → top
      matrix[last - offset][first] = matrix[last][last - offset]; // bottom → left
      matrix[last][last - offset] = matrix[i][last]; // right → bottom
      matrix[i][last] = top; // top → right
    }
  }
}
```
````

Same O(n²) time and O(1) space, done in a single pass. The four
assignments move each value straight to its final home in a four-cycle,
with `top` saved first so the cycle doesn't lose it. It's harder to get
right than transpose-plus-reverse — which is precisely why the two-phase
decomposition is the recommended answer: it trades one clever pass for
two obviously-correct ones.

```complexity
{
  "time": "O(n²)",
  "space": "O(1)",
  "why": "Every cell is moved exactly once as part of some four-cycle; one scalar (top) holds the displaced value. Fewer total writes than transpose+reverse, but the index arithmetic is far more error-prone."
}
```
`````

## Variants

- **Rotate counter-clockwise:** transpose, then reverse each **column**
  (or reverse each row *first*, then transpose) — the mirror-image
  decomposition from the concept lesson.
- **Rotate 180°:** reverse the row order, then reverse each row (two
  reflections through the center) — or apply the 90° rotation twice.
- **Spiral Matrix** (next lesson): the other headline "walk the grid in a
  rotational pattern" problem, but a *read* in spiral order rather than an
  in-place *rewrite*.

```quiz
{
  "question": "Why does the transpose-then-reverse-rows solution correctly produce a CLOCKWISE rotation, and how would you get counter-clockwise instead?",
  "options": [
    "Transpose sends (r,c) → (c,r) and reversing each row then sends (c,r) → (c, n−1−r), which is the clockwise target; reversing each COLUMN instead (or reversing rows before transposing) yields the counter-clockwise map (n−1−c, r)",
    "Clockwise vs counter-clockwise depends only on whether n is even or odd — the parity of the grid's side length determines which rotational direction the transpose-and-reverse composition produces, independent of which axis is reversed",
    "It's clockwise by convention; direction can't be controlled with these operations — transpose and row-reversal always compose to the same clockwise result regardless of order or axis, so counter-clockwise needs an entirely different technique"
  ],
  "answer": 0,
  "explanation": "The direction is entirely determined by which axis the second reflection uses. Transpose is common to both; reversing rows after it gives clockwise, reversing columns after it gives counter-clockwise. Tracing (r,c) through the composed map is what tells you which you built — it's not a convention to memorize."
}
```
