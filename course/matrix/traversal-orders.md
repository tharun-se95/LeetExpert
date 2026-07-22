---
title: Traversal Orders
type: concept
---

## Visiting every cell — but in *what* order?

"Touch every cell of the grid" sounds like it has one obvious
implementation, and for many problems it does: two nested loops. But the
*order* you visit cells in is a real degree of freedom, and several
problems (and every problem lesson in this module) hinge on choosing a
specific order and executing it without ever stepping out of bounds or
revisiting a cell. This lesson catalogs the four traversal orders you'll
actually reuse — row-major, column-major, diagonal, and spiral — and
derives each as a disciplined index pattern, not a thing to memorize.

Throughout, the grid has `R` rows and `C` columns.

## Row-major and column-major: the two nested-loop orders

**Row-major** visits cells in exactly the order they sit in memory
(lesson 1): all of row 0 left-to-right, then row 1, and so on. The outer
loop picks the row, the inner loop walks the columns:

````tabs
```python
def row_major(matrix: list[list[int]]) -> list[int]:
    rows, cols = len(matrix), len(matrix[0])
    order = []
    for r in range(rows):            # outer: pick a row
        for c in range(cols):        # inner: walk its columns
            order.append(matrix[r][c])
    return order
```

```typescript
function rowMajor(matrix: number[][]): number[] {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const order: number[] = [];
  for (let r = 0; r < rows; r++) {   // outer: pick a row
    for (let c = 0; c < cols; c++) { // inner: walk its columns
      order.push(matrix[r][c]);
    }
  }
  return order;
}
```
````

**Column-major** is the same two loops with the roles swapped: the outer
loop picks the column, the inner walks down the rows. The only change is
which index the outer loop owns:

````tabs
```python
def column_major(matrix: list[list[int]]) -> list[int]:
    rows, cols = len(matrix), len(matrix[0])
    order = []
    for c in range(cols):            # outer: pick a column
        for r in range(rows):        # inner: walk down the rows
            order.append(matrix[r][c])
    return order
```

```typescript
function columnMajor(matrix: number[][]): number[] {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const order: number[] = [];
  for (let c = 0; c < cols; c++) {   // outer: pick a column
    for (let r = 0; r < rows; r++) { // inner: walk down the rows
      order.push(matrix[r][c]);
    }
  }
  return order;
}
```
````

Both visit all `R × C` cells exactly once, so both are **O(R·C)** time.
They differ only in *sequence*. One subtle but real difference: row-major
reads adjacent memory (fast, cache-friendly — lesson 1's layout fact),
while column-major jumps `C` cells between reads. On huge grids that
cache behavior is measurable, which is a reason to prefer row-major as
the default when the order is yours to choose.

## Diagonal traversal: grouping by a constant index-sum or index-difference

A diagonal is a line of cells sharing a fixed relationship between `r`
and `c`. There are two families, and the whole technique is spotting the
invariant that names each:

- **Anti-diagonals** (running ↙, from top-right toward bottom-left) share
  a constant **sum** `r + c`. The top-left cell has `r + c = 0`; its two
  neighbors down and right both have `r + c = 1`; and so on up to
  `r + c = (R−1) + (C−1)`.
- **Main diagonals** (running ↘) share a constant **difference** `r − c`.

Because the sum `r + c` ranges over `0 … R+C−2`, we can visit one
anti-diagonal at a time by fixing the sum `s`, then letting `r` range over
its legal values and deriving `c = s − r`:

````tabs
```python
def diagonal_traversal(matrix: list[list[int]]) -> list[int]:
    rows, cols = len(matrix), len(matrix[0])
    order = []
    # Each anti-diagonal is identified by s = r + c.
    for s in range(rows + cols - 1):
        # r can be at most s (else c = s - r > ... ) and at most rows-1;
        # c = s - r must be a valid column, i.e. 0 <= s - r < cols.
        for r in range(rows):
            c = s - r
            if 0 <= c < cols:
                order.append(matrix[r][c])
    return order
```

```typescript
function diagonalTraversal(matrix: number[][]): number[] {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const order: number[] = [];
  // Each anti-diagonal is identified by s = r + c.
  for (let s = 0; s < rows + cols - 1; s++) {
    // c = s - r must be a valid column: 0 <= s - r < cols.
    for (let r = 0; r < rows; r++) {
      const c = s - r;
      if (c >= 0 && c < cols) order.push(matrix[r][c]);
    }
  }
  return order;
}
```
````

The `if 0 <= c < cols` guard is doing the real work: for a given diagonal
sum `s`, not every row `r` yields a valid column, and the guard discards
the `(r, c)` pairs that fall off the grid. Swapping to **main diagonals**
(constant `r − c`) is the same structure with the invariant changed —
you'd iterate the difference `d = r − c` over its range `−(C−1) … (R−1)`
and derive `c = r − d`. The lesson isn't two separate algorithms; it's
one idea — *fix the diagonal's invariant, sweep the free index, derive
the other, bounds-check* — applied to whichever diagonal family the
problem wants.

This looks like `O((R+C)·R)` because of the doubled loop, but every
`(r, c)` pair is either a real cell (appended once) or an out-of-bounds
skip, and the skips are bounded by the reals plus the diagonal count, so
the total remains **O(R·C)** — we still touch each of the `R·C` cells
exactly once, plus a linear number of rejected pairs.

## Spiral traversal: the boundary-shrinking technique

Spiral order walks the outer ring of the grid clockwise — top row left→
right, right column top→bottom, bottom row right→left, left column
bottom→top — then does the same for the next ring in, and so on until
nothing is left. The clean way to implement this is **four moving
boundaries** that fence off the un-visited rectangle, shrinking one
boundary inward after each of the four edge-walks:

````tabs
```python
def spiral_order(matrix: list[list[int]]) -> list[int]:
    if not matrix or not matrix[0]:
        return []
    top, bottom = 0, len(matrix) - 1
    left, right = 0, len(matrix[0]) - 1
    order = []
    while top <= bottom and left <= right:
        for c in range(left, right + 1):        # top row: left → right
            order.append(matrix[top][c])
        top += 1                                # that row is done, fence it off

        for r in range(top, bottom + 1):        # right col: top → bottom
            order.append(matrix[r][right])
        right -= 1

        if top <= bottom:                       # guard: is there a bottom row left?
            for c in range(right, left - 1, -1): # bottom row: right → left
                order.append(matrix[bottom][c])
            bottom -= 1

        if left <= right:                       # guard: is there a left col left?
            for r in range(bottom, top - 1, -1): # left col: bottom → top
                order.append(matrix[r][left])
            left += 1
    return order
```

```typescript
function spiralOrder(matrix: number[][]): number[] {
  if (matrix.length === 0 || matrix[0].length === 0) return [];
  let top = 0;
  let bottom = matrix.length - 1;
  let left = 0;
  let right = matrix[0].length - 1;
  const order: number[] = [];
  while (top <= bottom && left <= right) {
    for (let c = left; c <= right; c++) order.push(matrix[top][c]); // top row →
    top++; // that row is done, fence it off

    for (let r = top; r <= bottom; r++) order.push(matrix[r][right]); // right col ↓
    right--;

    if (top <= bottom) {
      for (let c = right; c >= left; c--) order.push(matrix[bottom][c]); // bottom ←
      bottom--;
    }

    if (left <= right) {
      for (let r = bottom; r >= top; r--) order.push(matrix[r][left]); // left col ↑
      left++;
    }
  }
  return order;
}
```
````

Two things make this correct rather than *almost* correct:

- **The shrink after each walk is what prevents revisits.** Once we've
  emitted the top row, `top += 1` moves the fence so the right-column walk
  starts *below* the corner we already emitted — the corners are never
  double-counted precisely because each walk hands off a strictly smaller
  rectangle to the next.
- **The two inner guards (`if top <= bottom`, `if left <= right`) are not
  decoration.** After shrinking `top` and `right`, the remaining strip can
  be a single row or single column. Without the bottom-row guard, a
  single remaining row would get walked left→right by the top-row pass and
  *again* right→left by the bottom-row pass — every cell duplicated. The
  guard asks "is there still a distinct bottom row / left column?" before
  walking it. This is the classic spiral bug, and it only shows up on
  non-square or odd-dimension grids, which is exactly why it's easy to
  miss in casual testing.

Every cell is appended exactly once and the four boundaries collectively
sweep the whole grid, so spiral traversal is **O(R·C)** time and — beyond
the output list — **O(1)** extra space (just the four boundary integers).

```complexity
{
  "operations": [
    { "name": "row-major / column-major", "time": "O(R·C)", "why": "two nested loops covering every cell exactly once; identical work, only the visitation order differs" },
    { "name": "diagonal traversal", "time": "O(R·C)", "why": "each real cell is emitted once; the bounds-rejected (r,c) pairs add only a linear overhead, keeping the total proportional to the cell count" },
    { "name": "spiral traversal", "time": "O(R·C)", "why": "the four shrinking boundaries partition the grid; each cell is inside exactly one edge-walk and emitted once" },
    { "name": "spiral extra space", "time": "O(1)", "why": "only four boundary integers beyond the output — no auxiliary grid or recursion" }
  ]
}
```

## Choosing an order

All four cost the same asymptotically — the choice is driven by *what the
problem needs*, not speed:

- Default to **row-major** when order is free; it's the simplest and the
  most cache-friendly (lesson 1).
- Reach for **diagonal** only when the problem groups cells by `r ± c`
  (diagonal-sum queries, some DP tabulations that fill by anti-diagonal).
- **Spiral** is its own named problem (next lesson) and shows up whenever
  output must ring inward.

The boundary-shrinking pattern in spiral — four indices fencing a
shrinking region, each pass handing off a smaller region with a proof
that nothing is revisited — is the reusable idea here. It's the same
"maintain a region and shrink it with an invariant" discipline you saw in
converging pointers, lifted from a line into a rectangle.

```quiz
{
  "questions": [
    {
      "question": "In the diagonal traversal, why is the inner `if 0 <= c < cols` guard essential rather than optional?",
      "options": [
        "It speeds up the loop by skipping cells — the guard's real purpose is to short-circuit the inner loop early once invalid columns are detected, saving iterations rather than affecting which cells get included",
        "It ensures the diagonals are visited in the correct direction — without the guard, the traversal would still visit every valid cell, just in reverse order along each anti-diagonal instead of the intended sequence",
        "For a fixed anti-diagonal sum s = r + c, only some rows r produce a column c = s - r that actually lies within the grid; the guard discards the (r, c) pairs that fall off the edge"
      ],
      "answer": 2,
      "explanation": "Fixing s and sweeping r generates candidate columns c = s - r, but for short diagonals near the corners most of those candidates are negative or ≥ cols. The guard is what restricts each diagonal to its real, in-bounds cells — without it you'd index out of range."
    },
    {
      "question": "In spiral traversal, what breaks if you remove the `if top <= bottom` guard before the bottom-row walk?",
      "options": [
        "The traversal would visit cells in counter-clockwise order instead — removing this one guard flips the overall handedness of the spiral, since it's the step that determines which rotational direction the walks proceed in",
        "When a single row remains after shrinking top, the top-row pass already emitted it left-to-right; without the guard the bottom-row pass emits that same row again right-to-left, duplicating every cell in it",
        "Nothing — the guard is redundant with the outer while condition; the while loop's top <= bottom and left <= right check already covers every case the inner guard would, making it a harmless no-op"
      ],
      "answer": 1,
      "explanation": "The outer while check passes when a single row/column strip remains, but after `top++` and `right--` that strip must be walked only ONCE. The inner guards ask whether a distinct bottom row / left column still exists before re-walking it. This bug only surfaces on non-square or odd-sized grids, so it survives naive square-grid testing."
    },
    {
      "question": "Row-major and column-major traversal are both O(R·C) and visit the same cells. Why might row-major still be the better default?",
      "options": [
        "Row-major visits fewer cells in practice — depending on the grid's exact dimensions, starting with rows instead of columns can terminate the traversal after touching slightly fewer total cells",
        "Because the grid is stored row-major in memory, row-major traversal reads consecutive memory addresses (cache-friendly), while column-major jumps C cells between successive reads — a real constant-factor cost on large grids despite identical asymptotic complexity",
        "Column-major produces incorrect results on non-square grids — the column-first loop structure miscounts boundary cells when the row and column counts differ, an actual correctness bug rather than a performance concern"
      ],
      "answer": 1,
      "explanation": "Big O hides constant factors, and here the constant is cache behavior. Adjacent row cells are adjacent in memory (lesson 1's layout); adjacent column cells are C apart, defeating the cache line. Same O(R·C), measurably different wall-clock time when the grid is big."
    }
  ]
}
```
