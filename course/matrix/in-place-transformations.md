---
title: In-Place Transformations
type: concept
---

## Rearranging a grid without a second grid

Some grid problems don't traverse — they *rewrite* the grid into a
transformed version of itself: transpose it, rotate it, flip it. The
naive way is to allocate a fresh `R × C` grid, compute each output cell
from the input, and return the new grid. That's correct and often fine.
But a recurring constraint — stated outright in the next lesson's problem,
Rotate Image — is **do it in place, with O(1) extra space**. This lesson
builds the two in-place transforms you need (transpose and 90° rotation),
proves *why* the rotation decomposes the way it does, and pins down
exactly why "in place" is a meaningful demand here and not busywork.

We work with **square** grids (`n × n`) throughout, because in-place
rotation requires it — a non-square rotation changes the shape, so its
result can't overwrite the original's memory footprint. Transpose of a
non-square grid is possible but produces a differently-shaped grid, so it
too is an in-place operation only when square.

## Transpose: reflect across the main diagonal

The transpose swaps rows with columns: cell `(i, j)` and cell `(j, i)`
trade places. Equivalently, it reflects the grid across its **main
diagonal** (the cells where `i == j`, which stay put). To do it in place,
we swap each pair `(i, j) ↔ (j, i)` exactly once. The trap is swapping
each pair *twice* — which returns the grid to its original state — so the
inner loop must start at `j = i + 1`, touching only the cells strictly
above the diagonal:

````tabs
```python
def transpose(matrix: list[list[int]]) -> None:
    n = len(matrix)
    for i in range(n):
        for j in range(i + 1, n):        # strictly upper triangle only
            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
```

```typescript
function transpose(matrix: number[][]): void {
  const n = matrix.length;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {    // strictly upper triangle only
      [matrix[i][j], matrix[j][i]] = [matrix[j][i], matrix[i][j]];
    }
  }
}
```
````

Why `j = i + 1` and not `j = 0`? Each off-diagonal pair `{(i, j), (j, i)}`
must be swapped once to exchange the two values. If the loop visited both
`(i, j)` (with `j > i`) *and* later `(j, i)` (reached when the outer index
is `j` and inner is `i`), it would swap the same pair a second time and
undo the first swap. Starting the inner loop at `i + 1` visits each
unordered pair exactly once and leaves the diagonal (`i == j`) untouched,
as it should be — diagonal cells are their own reflection.

The work is one swap per upper-triangle cell: there are `n(n−1)/2` such
cells, so transpose is **O(n²)** time (you must touch a constant fraction
of all `n²` cells — unavoidable, since transposing genuinely relocates
almost every value) and **O(1)** extra space (a single temporary per
swap, which the tuple-swap hides).

## 90° rotation: transpose, then reverse each row

Rotating the grid 90° clockwise is the transform Rotate Image asks for.
The elegant in-place method is a **composition of two simpler in-place
steps**:

1. **Transpose** the grid (reflect across the main diagonal).
2. **Reverse each row** (reflect across the vertical center line).

We should not accept "transpose + reverse rows = rotate" on faith — the
course's rule is that a composition like this gets *proved*, because the
proof is exactly what tells you it's clockwise (and not counter-clockwise,
which is a different pair of steps). Here is the index-level argument.

Take an `n × n` grid. Under a **90° clockwise rotation**, the value at
input position `(r, c)` must end up at output position `(c, n−1−r)` — the
top row becomes the right column, which is what "clockwise" means at the
level of coordinates. Now track a single value through the two steps and
check it lands there:

```text
Start: value V sits at (r, c).

Step 1 — transpose swaps (i, j) ↔ (j, i):
   V moves from (r, c)  →  (c, r).

Step 2 — reverse row c: column index x becomes (n − 1 − x),
   row index unchanged:
   V moves from (c, r)  →  (c, n − 1 − r).

Result: V is at (c, n − 1 − r)  ==  the clockwise-rotation target. ✓
```

Because this holds for an arbitrary `(r, c)`, it holds for every value:
the composition transpose-then-reverse-rows reproduces the clockwise
rotation exactly. And the direction matters — swap the order or the
reversal axis and you get a different rotation:

- **Clockwise:** transpose, then reverse each **row**.
- **Counter-clockwise:** transpose, then reverse each **column**
  (equivalently, reverse each row *first*, then transpose).

````tabs
```python
def rotate_clockwise(matrix: list[list[int]]) -> None:
    n = len(matrix)
    # Step 1: transpose in place.
    for i in range(n):
        for j in range(i + 1, n):
            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
    # Step 2: reverse each row in place.
    for row in matrix:
        row.reverse()
```

```typescript
function rotateClockwise(matrix: number[][]): void {
  const n = matrix.length;
  // Step 1: transpose in place.
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      [matrix[i][j], matrix[j][i]] = [matrix[j][i], matrix[i][j]];
    }
  }
  // Step 2: reverse each row in place.
  for (const row of matrix) {
    row.reverse();
  }
}
```
````

## Why in-place matters here specifically

"O(1) extra space" is not a generic virtue to chase everywhere — it's a
demand that earns its weight in *this* setting for concrete reasons:

- **The alternative allocates a whole second grid.** Building the rotated
  result in a fresh array costs **O(n²)** auxiliary space — as much memory
  as the input itself. For a large image (grids here often *are* images),
  that can be the difference between fitting in memory and not. The
  in-place method needs only a scalar temporary per swap.
- **It forces you to reason about aliasing.** Doing it in place means
  every write lands in memory you're also reading from, so you must order
  the operations (transpose fully, *then* reverse) such that no step
  clobbers a value a later step still needs. The two-phase decomposition
  is what makes that safe — each phase is a set of independent swaps that
  don't interfere. This aliasing discipline is the transferable skill; the
  next lesson's Set Matrix Zeroes leans on the exact same "reuse the
  grid's own memory as scratch, carefully ordered" idea.

The trade is explicitness for memory. A from-scratch output grid is
arguably easier to read (each output cell computed by one clear formula
`out[c][n-1-r] = in[r][c]`), and if O(n²) extra space is acceptable,
prefer it for clarity. In-place is the right call exactly when the space
constraint is real — which, for grid-rewrite problems, it usually is
stated to be.

```complexity
{
  "operations": [
    { "name": "transpose (in place)", "time": "O(n²)", "why": "one swap per upper-triangle cell, n(n−1)/2 of them — a constant fraction of all n² cells, each genuinely relocated" },
    { "name": "reverse each row", "time": "O(n²)", "why": "n rows, each reversed in O(n) by swapping n/2 pairs — n × n/2 total" },
    { "name": "90° rotation (transpose + reverse)", "time": "O(n²)", "why": "sum of two O(n²) phases run in sequence; still O(n²)" },
    { "name": "in-place extra space", "time": "O(1)", "why": "every operation is a swap using one scalar temporary; no second grid, no recursion" },
    { "name": "naive rotation (fresh grid)", "time": "O(n²) time, O(n²) space", "why": "same time, but allocates a full second n×n grid to hold the output — the space cost in-place avoids" }
  ]
}
```

```quiz
{
  "questions": [
    {
      "question": "Why must the transpose's inner loop start at j = i + 1 rather than j = 0?",
      "options": [
        "To avoid an index-out-of-bounds error on the last row — starting the inner loop at 0 would eventually push j past the array's valid column range on the final row, crashing before the transpose completes",
        "Each off-diagonal pair {(i,j),(j,i)} must be swapped exactly once; starting at j = 0 would swap every such pair twice, and swapping a pair twice restores its original values — undoing the transpose",
        "Starting at 0 would transpose the grid counter-clockwise instead — the starting index of the inner loop is what determines the rotational direction of the resulting reflection, not just which cells get touched"
      ],
      "answer": 1,
      "explanation": "A swap is its own inverse: applying it twice is a no-op. Iterating j from 0 visits both (i,j) and (j,i), swapping the same unordered pair on two different outer iterations, so the net effect on each pair is nothing. j = i + 1 visits each pair once and correctly leaves the i == j diagonal fixed."
    },
    {
      "question": "The proof tracks a value from (r,c) through transpose to (c,r), then through row-reversal to (c, n−1−r). Why does establishing this for one arbitrary (r,c) prove the whole rotation is correct?",
      "options": [
        "Because r and c were arbitrary, the derived mapping (r,c) → (c, n−1−r) holds for every cell simultaneously, and that mapping IS the definition of a 90° clockwise rotation — so every value lands at its correct rotated position",
        "Because the corners are the only cells that matter for a rotation — once the four extreme corner values are confirmed to land correctly, the interior cells are guaranteed by symmetry to follow the same pattern automatically",
        "It doesn't — you'd need to check all n² cells individually; a single (r,c) example only demonstrates the mapping for that specific cell, and every other cell's correctness would need separate verification"
      ],
      "answer": 0,
      "explanation": "A universally-quantified argument ('for an arbitrary r, c…') establishes the claim for all r, c at once — that's the point of using variables instead of specific numbers. Since the composed map equals the clockwise-rotation coordinate transform for every cell, the two-step procedure equals the rotation."
    },
    {
      "question": "For rotating an image, why does the in-place method (transpose + reverse) matter versus building a fresh rotated grid, given both are O(n²) time?",
      "options": [
        "The fresh-grid method produces an incorrect rotation for even n — the formula for mapping input cells to output positions has an off-by-one that only manifests when the grid's side length is an even number",
        "In-place is asymptotically faster — avoiding the allocation of a second grid also reduces the total number of read/write operations enough to change the algorithm's time complexity class",
        "Building a fresh grid needs O(n²) auxiliary space — as much extra memory as the image itself — while in-place needs only O(1) extra (a scalar per swap); for large images this space difference can decide whether the operation fits in memory at all"
      ],
      "answer": 2,
      "explanation": "The distinction is space, not time — both touch every cell. Allocating a second n×n grid doubles the memory footprint, which is exactly the constraint the in-place transform removes. That's why problems like Rotate Image explicitly demand O(1) extra space."
    }
  ]
}
```
