---
title: Set Matrix Zeroes
type: problem
---

## Problem

Given an `m × n` matrix, if any cell is `0`, set its **entire row and
entire column** to `0`. Do it **in place**. (LeetCode 73.)

**Examples**

```text
[[1,1,1],        [[1,0,1],
 [1,0,1],   →     [0,0,0],
 [1,1,1]]         [1,0,1]]

[[0,1,2,0],      [[0,0,0,0],
 [3,4,5,2],  →    [0,4,5,0],
 [1,3,1,5]]       [0,3,1,0]]
```

**Constraints:** `1 ≤ m, n ≤ 200`, values in ±2³¹. The follow-up that
makes this problem interesting: a simple solution uses O(m+n) extra
space; **can you do it with O(1) extra space?** That follow-up is the
whole lesson.

## Attempt it first

Try the obvious thing first and watch it fail — that failure is the
teacher here. The naive move is: scan the grid, and whenever you see a
`0`, immediately zero out its row and column. **Do it on the second
example above and trace carefully.** Something goes wrong almost
immediately. Understand *what* goes wrong before reading on; it's the
observation the whole problem is built around.

````reveal Hint — why zeroing eagerly corrupts the grid
If you zero a row/column the moment you find a `0`, those freshly-written
zeros are indistinguishable from *original* zeros when your scan reaches
them. The scan then treats a zero-you-just-wrote as a new trigger and
zeros *its* row and column too — the zeros metastasize and you end up
with a grid that's almost entirely zero. The fix is a two-phase
structure: **first record which rows and columns must be zeroed, then
apply**. The only question left is *where* to store that record — and
that's where O(1) space comes in.
````

## Brute force and the O(m+n) approach

The eager approach is not just slow, it's *wrong* (see the hint). The
correct baseline is **two-phase with auxiliary storage**: one pass to
find every zero and remember its row and column in two boolean arrays,
then a second pass to zero any cell whose row or column was flagged.

````tabs
```python
def set_zeroes_aux(matrix: list[list[int]]) -> None:
    rows, cols = len(matrix), len(matrix[0])
    zero_rows = [False] * rows       # O(m) extra
    zero_cols = [False] * cols       # O(n) extra
    for r in range(rows):            # phase 1: record
        for c in range(cols):
            if matrix[r][c] == 0:
                zero_rows[r] = True
                zero_cols[c] = True
    for r in range(rows):            # phase 2: apply
        for c in range(cols):
            if zero_rows[r] or zero_cols[c]:
                matrix[r][c] = 0
```

```typescript
function setZeroesAux(matrix: number[][]): void {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const zeroRows: boolean[] = new Array(rows).fill(false); // O(m) extra
  const zeroCols: boolean[] = new Array(cols).fill(false); // O(n) extra
  for (let r = 0; r < rows; r++) {   // phase 1: record
    for (let c = 0; c < cols; c++) {
      if (matrix[r][c] === 0) {
        zeroRows[r] = true;
        zeroCols[c] = true;
      }
    }
  }
  for (let r = 0; r < rows; r++) {   // phase 2: apply
    for (let c = 0; c < cols; c++) {
      if (zeroRows[r] || zeroCols[c]) matrix[r][c] = 0;
    }
  }
}
```
````

This is correct and clean: **O(m·n)** time (two full passes) and
**O(m+n)** space for the two boolean arrays. For most purposes you'd stop
here. The follow-up asks whether the O(m+n) can become O(1) — and the
answer is the insight this whole module is building toward.

## The insight: use the grid's own first row and column as the scratch markers

Here is the key realization. We need `m + n` bits of memory: one per row
("does this row contain a zero?") and one per column. **The matrix
already contains `m + n` cells we can repurpose as exactly those markers
— its own first row and first column.** Cell `matrix[0][c]` becomes the
flag for "column `c` must be zeroed"; cell `matrix[r][0]` becomes the flag
for "row `r` must be zeroed." We spend zero extra memory because the
scratch space is *inside the input*.

There is one collision to resolve. `matrix[0][0]` sits at the
intersection of the first row and first column, so it would have to be two
flags at once — the marker for "row 0 needs zeroing" *and* "column 0 needs
zeroing." One cell can't hold both bits. The standard fix is to pull the
first column's own status out into a **single** extra scalar variable
(`first_col_zero`), leaving `matrix[0][0]` to serve solely as the first
row's flag. That single boolean is the entire "extra space" — O(1),
independent of grid size.

The ordering discipline is the other subtlety, and it's the same aliasing
care as Rotate Image's two phases: because the first row and column are
*both* markers and *actual cells to be zeroed*, we must read/use them as
markers **before** we overwrite them as data. So we apply zeros to the
interior first, and zero the first row and first column *last*.

## Solution

`````reveal Solution — O(1) space, first row/column as markers
````tabs
```python
def set_zeroes(matrix: list[list[int]]) -> None:
    rows, cols = len(matrix), len(matrix[0])
    first_col_zero = False           # the one extra bit, for column 0's status

    # Phase 1: record. Use row 0 and col 0 of the matrix itself as flags.
    for r in range(rows):
        if matrix[r][0] == 0:
            first_col_zero = True    # col 0's flag lives in a scalar, not matrix[0][0]
        for c in range(1, cols):     # start at 1: col 0 handled above
            if matrix[r][c] == 0:
                matrix[r][0] = 0     # mark this row
                matrix[0][c] = 0     # mark this column

    # Phase 2: apply to the interior, reading markers before we clobber them.
    for r in range(1, rows):
        for c in range(1, cols):
            if matrix[r][0] == 0 or matrix[0][c] == 0:
                matrix[r][c] = 0

    # Phase 3: handle row 0 using its own marker (matrix[0][0]).
    if matrix[0][0] == 0:
        for c in range(cols):
            matrix[0][c] = 0
    # Phase 4: handle col 0 using the saved scalar.
    if first_col_zero:
        for r in range(rows):
            matrix[r][0] = 0
```

```typescript
function setZeroes(matrix: number[][]): void {
  const rows = matrix.length;
  const cols = matrix[0].length;
  let firstColZero = false; // the one extra bit, for column 0's status

  // Phase 1: record. Use row 0 and col 0 of the matrix itself as flags.
  for (let r = 0; r < rows; r++) {
    if (matrix[r][0] === 0) firstColZero = true; // col 0's flag in a scalar
    for (let c = 1; c < cols; c++) {             // start at 1: col 0 handled above
      if (matrix[r][c] === 0) {
        matrix[r][0] = 0; // mark this row
        matrix[0][c] = 0; // mark this column
      }
    }
  }

  // Phase 2: apply to the interior, reading markers before we clobber them.
  for (let r = 1; r < rows; r++) {
    for (let c = 1; c < cols; c++) {
      if (matrix[r][0] === 0 || matrix[0][c] === 0) matrix[r][c] = 0;
    }
  }

  // Phase 3: handle row 0 using its own marker (matrix[0][0]).
  if (matrix[0][0] === 0) {
    for (let c = 0; c < cols; c++) matrix[0][c] = 0;
  }
  // Phase 4: handle col 0 using the saved scalar.
  if (firstColZero) {
    for (let r = 0; r < rows; r++) matrix[r][0] = 0;
  }
}
```
````

Trace the four phases against why each ordering choice is forced:

- **Phase 1** records every interior zero into the border markers, and
  peels column 0's status into `first_col_zero` so `matrix[0][0]` is left
  meaning only "row 0 has a zero." The inner loop starts at `c = 1` for
  exactly that reason.
- **Phase 2** zeros only the *interior* (`r ≥ 1, c ≥ 1`). It reads the
  markers `matrix[r][0]` and `matrix[0][c]` — which are still intact
  because we haven't touched the border yet.
- **Phases 3 and 4** zero the border *last*. If we'd zeroed the first row
  in phase 2, we'd have destroyed the column markers before the interior
  finished reading them — the eager-corruption bug in a new disguise.

```complexity
{
  "time": "O(m·n)",
  "space": "O(1)",
  "why": "Two full passes over the grid plus two border sweeps — all proportional to m·n. The only extra memory is the single boolean first_col_zero; the m + n markers live inside the input's own first row and column, so no storage grows with the grid size."
}
```
`````

## Why this trick generalizes

The move — **repurpose part of the input structure as the algorithm's
scratch space, with careful ordering so you read a cell's old meaning
before overwriting it** — is a genuine pattern, not a one-off. You saw the
aliasing discipline in Rotate Image's transpose-then-reverse; here it
buys an entire O(m+n) → O(1) space reduction. The cost is subtlety: the
code is harder to read and harder to get right than the boolean-array
version. That's the honest trade — spend O(1) space only when the
follow-up (or a real memory constraint) demands it; otherwise the O(m+n)
version is clearer and just as fast.

## Variants

- **Game of Life** (LeetCode 289): another in-place grid rewrite where the
  naive approach corrupts cells mid-computation; the O(1)-space fix
  encodes *both* old and new state in each cell (e.g. using two bits)
  instead of a second grid — the same "reuse the cell as scratch" idea.
- **Set Matrix Zeroes with O(m+n) space:** the boolean-array baseline above
  — the right answer when the space follow-up isn't imposed.

```quiz
{
  "questions": [
    {
      "question": "Why does eagerly zeroing a cell's row and column the instant you find a 0 (in a single pass) produce a wrong result?",
      "options": [
        "It only fails when the matrix contains negative numbers — the eager-zeroing bug is triggered specifically by sign confusion between an original negative value and a freshly written zero, which positive-only inputs never encounter",
        "It's too slow — O(m·n·(m+n)) time; the eager approach technically produces the correct final grid, but re-zeroing rows and columns repeatedly makes it too slow to pass within reasonable time limits",
        "The zeros you write become indistinguishable from original zeros; when the same scan later reaches a written zero, it treats it as a new trigger and zeros that cell's row and column too, so zeros spread far beyond the original ones"
      ],
      "answer": 2,
      "explanation": "The problem is that writes and reads share the same array with no way to tell 'was here originally' from 'I just wrote this.' A written zero re-triggers the rule. That's why every correct solution separates recording (which rows/cols to zero) from applying — the two-phase structure."
    },
    {
      "question": "The O(1)-space solution stores row and column markers inside matrix[0] and column 0. Why is a single extra boolean (first_col_zero) still needed?",
      "options": [
        "Because the matrix might have zero rows — an edge case where the grid has no rows at all requires a separate boolean to track, since the border-cell approach assumes at least one row exists",
        "To speed up the second pass — caching column 0's status in a fast-access scalar variable avoids repeatedly re-reading matrix[0][0] during the interior pass, which is purely a performance optimization",
        "matrix[0][0] lies at the intersection of the first row and first column, so it would need to encode two independent flags at once — 'row 0 has a zero' and 'column 0 has a zero' — which one cell can't do; pulling column 0's status into a scalar frees matrix[0][0] to mean only row 0's flag"
      ],
      "answer": 2,
      "explanation": "The border gives you exactly m + n marker cells, but the corner is double-booked between the row-marker set and the column-marker set. One of the two overlapping flags has to live somewhere else; a single scalar is the minimal fix, keeping total extra space at O(1)."
    },
    {
      "question": "Why must the O(1) solution zero the interior (phase 2) BEFORE zeroing the first row and first column (phases 3–4)?",
      "options": [
        "The order doesn't matter; it's arbitrary — zeroing the border first and the interior second would produce the identical final grid, since both phases only ever set cells to zero and never need to un-zero anything",
        "For cache efficiency — processing the interior before the border keeps the CPU's cache lines warm for the larger bulk of the matrix, a performance consideration rather than a correctness requirement",
        "The first row and column serve double duty as the markers AND as cells that will themselves be zeroed; if you zeroed the border first, you'd overwrite the markers the interior pass still needs to read, corrupting the result"
      ],
      "answer": 2,
      "explanation": "This is the same aliasing discipline as Rotate Image: when a location is both scratch and data, you must consume its scratch meaning before you overwrite it with its final data value. Zeroing the border early destroys the row/column flags mid-computation — the eager-corruption bug reintroduced."
    }
  ]
}
```
