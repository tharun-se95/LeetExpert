---
title: Grid Representation & Coordinates
type: concept
---

## What a 2D array actually is

A grid problem hands you something that *looks* two-dimensional — rows
and columns, a picture in your head — but memory has no second
dimension. RAM is a single flat run of addressable bytes. So before any
traversal technique makes sense, you need to know the one structural
fact everything in this module rests on: **`matrix[i][j]` is arithmetic
on a flat array**, not a lookup into a genuinely 2D object. Getting this
wrong is the source of the two most common grid bugs — swapped indices
and off-by-one bounds — so we start here and prove the addressing rule
rather than asserting it.

## Row-major layout: how the rows are laid end to end

Picture a single, continuous bookshelf that a librarian fills one shelf
at a time: every book from shelf 0 goes on first, left to right, then
every book from shelf 1 continues immediately after — there's no gap,
no separate shelf-1 shelf sitting somewhere else in the room. If you
know a shelf holds exactly `C` books, and you want the 3rd book on
shelf 2, you don't search — you count off "2 full shelves, `C` books
each, then 3 more steps," and you're standing at the exact book. That
count is the whole addressing scheme; the rest of this section just
writes it as arithmetic.

A grid with `R` rows and `C` columns is stored as one contiguous block
of `R × C` cells, **row by row**: all of row 0's cells first, then all
of row 1's, and so on. This is called **row-major order** (C, Python
lists-of-lists conceptually, Java, JavaScript nested arrays all use it).
The cell at logical position `(i, j)` — row `i`, column `j` — lives at
flat offset:

```text
offset(i, j) = i * C + j
```

Read that formula as what it literally says: **skip `i` whole rows**
(each `C` cells wide), then walk `j` cells into the current row. Row 0,
column 0 is offset 0; row 0, column `C−1` is offset `C−1`; row 1, column
0 is the very next cell, offset `C`. That is why `matrix[i][j]` addresses
what it does — the two-bracket syntax is sugar over "multiply the row
index by the width, add the column index."

```diagram
{
  "id": "grid-coords",
  "rows": 3,
  "cols": 4,
  "highlight": [1, 2]
}
```

Two consequences fall out immediately, and both matter later:

- **The first index is the row, the second is the column.** `matrix[i][j]`
  means row `i`, column `j`. Swapping them isn't a stylistic choice — on a
  non-square grid it's an *index-out-of-range* crash, and on a square grid
  it silently reads the wrong cell. Every transpose/rotation bug in
  lesson 3 traces back to this.
- **Walking a full row is cheap; walking a full column is scattered.**
  Consecutive cells in a row (`j`, `j+1`, …) are adjacent in memory;
  consecutive cells in a column (`i`, `i+1`, …) are `C` cells apart —
  reading down a column means walking to book 3 on shelf 0, then to book
  3 on shelf 1, then shelf 2, each stop a full shelf-width away from the
  last. This is why row-major traversal is the natural default (lesson
  2) — it reads memory in the order it's physically laid out, one shelf
  straight through.

## Bounds checking: the frame around every grid algorithm

Because the grid is finite, every access must first ask "is `(i, j)`
actually inside?" A position is in-bounds exactly when **both** indices
sit in their valid half-open ranges:

```text
0 <= i < R    and    0 <= j < C
```

Both halves are load-bearing. `i` can be valid while `j` is off the edge,
or vice versa — a cell one step off the right edge (`j == C`) has a
perfectly legal row index. So the check is a conjunction of four
comparisons, and skipping any one of them is a latent crash. We'll write
it once as a helper and never open-code it again:

````tabs
```python
def in_bounds(r: int, c: int, rows: int, cols: int) -> bool:
    return 0 <= r < rows and 0 <= c < cols
```

```typescript
function inBounds(r: number, c: number, rows: number, cols: number): boolean {
  return r >= 0 && r < rows && c >= 0 && c < cols;
}
```
````

## Visiting neighbors: the direction-vector technique

Grid algorithms constantly need "the cells adjacent to `(r, c)`." The
naive way is four near-identical blocks:

````tabs
```python
# The anti-pattern — four copies of the same logic, four chances to typo
if in_bounds(r - 1, c, rows, cols): visit(r - 1, c)   # up
if in_bounds(r + 1, c, rows, cols): visit(r + 1, c)   # down
if in_bounds(r, c - 1, rows, cols): visit(r, c - 1)   # left
if in_bounds(r, c + 1, rows, cols): visit(r, c + 1)   # right
```

```typescript
// The anti-pattern — four copies of the same logic, four chances to typo
if (inBounds(r - 1, c, rows, cols)) visit(r - 1, c); // up
if (inBounds(r + 1, c, rows, cols)) visit(r + 1, c); // down
if (inBounds(r, c - 1, rows, cols)) visit(r, c - 1); // left
if (inBounds(r, c + 1, rows, cols)) visit(r, c + 1); // right
```
````

Four copies means four places to get a sign wrong, and the bug (say,
`c + 1` accidentally written as `c - 1`) type-checks and runs. The fix is
to notice that all four lines are the *same* line with a different
`(Δrow, Δcol)` offset. Pull those offsets into a list of
**direction vectors** and loop:

````tabs
```python
# 4-directional (von Neumann) neighbors: up, down, left, right
DIRS_4 = [(-1, 0), (1, 0), (0, -1), (0, 1)]

def neighbors(r: int, c: int, rows: int, cols: int):
    for dr, dc in DIRS_4:
        nr, nc = r + dr, c + dc
        if in_bounds(nr, nc, rows, cols):
            yield nr, nc
```

```typescript
// 4-directional (von Neumann) neighbors: up, down, left, right
const DIRS_4: [number, number][] = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

function neighbors(r: number, c: number, rows: number, cols: number): [number, number][] {
  const result: [number, number][] = [];
  for (const [dr, dc] of DIRS_4) {
    const nr = r + dr;
    const nc = c + dc;
    if (inBounds(nr, nc, rows, cols)) result.push([nr, nc]);
  }
  return result;
}
```
````

Now there is exactly **one** neighbor-generating line, exercised four
times with different data. A sign error would have to be in the `DIRS_4`
table, where it's visible and reviewable, instead of buried in the fourth
of four control-flow branches. This is the same "data instead of
repeated code" move you'll reuse in Number of Islands and Word Search
later in this module.

Extending to **8-directional** (adding the four diagonals — the "Moore
neighborhood", used in Game of Life and connected-component problems that
count diagonal adjacency) is now a one-line change to the table, not a
doubling of the if-statements:

````tabs
```python
# 8-directional: the 4 orthogonal + 4 diagonal offsets.
# Every (dr, dc) pair except (0, 0), which is the cell itself.
DIRS_8 = [(-1, -1), (-1, 0), (-1, 1),
          ( 0, -1),          ( 0, 1),
          ( 1, -1), ( 1, 0), ( 1, 1)]
```

```typescript
// 8-directional: the 4 orthogonal + 4 diagonal offsets.
// Every (dr, dc) pair except (0, 0), which is the cell itself.
const DIRS_8: [number, number][] = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1],
];
```
````

## Complexity of touching the grid

There is no algorithmic cleverness yet — just the cost of the primitives,
argued from the code:

```complexity
{
  "operations": [
    { "name": "matrix[i][j] access", "time": "O(1)", "why": "one multiply-add (i*C + j) to compute the flat offset, then a single memory read — no scan" },
    { "name": "in_bounds check", "time": "O(1)", "why": "exactly four scalar comparisons, independent of grid size" },
    { "name": "enumerate all neighbors of one cell", "time": "O(1)", "why": "the direction table has a fixed size (4 or 8) that does not grow with R or C — a constant number of iterations" },
    { "name": "space for the direction table", "time": "O(1)", "why": "4 or 8 fixed pairs, allocated once and shared across all cells" }
  ]
}
```

The point of stating even these is the habit the course insists on: an
O(1) claim is only trustworthy once you've named *why* the work doesn't
grow with input size. Here it's because the direction table's length is a
constant of the algorithm, not a function of the grid.

## Trade-offs and why this scaffolding pays off

You could hand-inline every neighbor check and every bounds test, and for
a *single* access that's fine. The direction-vector table earns its keep
the moment a problem visits neighbors in a loop over many cells: it turns
"4 (or 8) parallel branches, each a place to typo a sign or drop a bounds
check" into "one loop over a reviewable table." Every remaining lesson in
this module — spiral traversal's four boundary walks, flood-fill's
expansion, backtracking's four recursive calls — is that same table used
again. Learn it as a *form*, not as four lines you'll retype.

```quiz
{
  "questions": [
    {
      "question": "On a 3-row, 5-column grid stored in row-major order, at what flat offset does matrix[2][1] live, and why?",
      "options": [
        "Offset 3, because it's the third cell you'd reach scanning column-first — walking down column 1 first, then across, happens to land on row 2's cell after exactly 3 steps",
        "Offset 7, because you add the two indices (2 + 1) to a base — treating row and column as simply summable coordinates, plus a small fixed base offset, gives the flat position directly",
        "Offset 11, because you skip 2 full rows of width 5 (2*5 = 10) then walk 1 cell into row 2 (10 + 1)"
      ],
      "answer": 2,
      "explanation": "Row-major offset is i*C + j = 2*5 + 1 = 11. The multiply by C (the column count, the row width) is what 'skip whole rows' means; adding j walks into the current row. This arithmetic is exactly what the matrix[i][j] syntax compiles to."
    },
    {
      "question": "Why is the bounds check written as a conjunction of FOUR comparisons (0 <= r < rows AND 0 <= c < cols) rather than a single range test?",
      "options": [
        "It's just a stylistic convention; two comparisons would suffice — since rows and columns are checked together as a pair, one combined comparison per dimension would catch the same out-of-bounds cases just as reliably",
        "The extra comparisons make the check run faster — splitting the range test into four separate scalar comparisons lets the CPU pipeline them in parallel, which is faster than a single combined range check",
        "Row and column are independent dimensions — a position can have a valid row but an out-of-range column (or vice versa), so each index needs its own lower and upper bound checked separately"
      ],
      "answer": 2,
      "explanation": "A cell one step past the right edge (j == cols) still has a perfectly legal row index. Because the two indices vary independently, validity requires BOTH to be in range; dropping either half of either dimension's check leaves a latent out-of-bounds access."
    },
    {
      "question": "What does replacing four hand-written neighbor if-statements with a loop over a direction-vector table actually buy you, correctness-wise?",
      "options": [
        "It makes the code asymptotically faster — O(1) instead of O(4) — collapsing four branches into a loop reduces the actual number of operations performed per cell, which is where the speedup comes from",
        "It collapses four copies of the same bounds-check-and-visit logic into one, so a sign error can only occur in the small, reviewable offset table rather than being buried in the fourth of four control-flow branches",
        "It allows visiting neighbors in a different order — the loop-based version can traverse up, down, left, right in whatever sequence is most efficient, unlike the fixed order of four separate if-statements"
      ],
      "answer": 1,
      "explanation": "Both versions are O(1) — the count of directions is a fixed constant, so there's no speed difference. The win is that duplicated logic is duplicated risk: one loop body exercised by a data table has a single place to be wrong, and that place (the table) is trivially auditable."
    }
  ]
}
```
