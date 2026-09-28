# Grids and matrices in the lane player

Status: approved for #22 (the grids / matrices item) · owner, 2026-09-28 ("proceed", approach A)

## 1. Problem

The rollout spec (§5.2) asks for a shared player per structure. The matrix module (9 lessons) and
the grid lessons outside it (2D prefix sums, range sum 2D, word search II, the adjacency matrix in
graph representation) draw a board today only through the grid `Scene` (`kit/engine.js`). A Scene
paints cell colours, cell text, one rectangle overlay and value shades. It is not a `StepPlayer`:
no fields line, no invariants panel, and a cell has no identity, so a rotation that moves a value
cannot show where the value went.

What the lessons need, read from the lessons themselves:

| Need | Lessons |
|---|---|
| a flat row beside the grid (the row-major index, `mid → (r, c)`) | grid coordinates, search a 2D matrix |
| named row and column bounds: `top`, `bottom`, `left`, `right`, `r`, `c` | spiral matrix, traversal orders |
| a visit order drawn as a trail, which shrinks on backtrack | traversal orders, word search, word search II |
| values that move and keep their identity: swap, a four-way cycle | in-place transformations, rotate image |
| a grid and other lanes in one player: a queue, a flag row | number of islands, set matrix zeroes |
| named rectangles over cells; row and column labels | 2D prefix sums (inclusion and exclusion), adjacency matrix |
| cell state: current, visited, found, wrong | all of them |

## 2. Decision: a grid lane kind in the lane model

A fixed row lane (`cap`) is already an array of slots written by index, with items that keep their
identity. A grid is the same array read with two coordinates: slot `k = r × cols + c`, row-major,
which is exactly what the grid-coordinates lesson teaches. So a grid is a lane of `kind: 'grid'`,
and `put`, `clear`, `swap`, `copy`, `set` and `tone` work on it unchanged. The composition cases
come for free: an island cell's coordinates glide from the grid onto the BFS queue, and a prefix
sum's value enters from the cell it was read from.

Rejected:

- **A separate `Grids` model and `GridPlayer`.** Islands (grid + queue) and set zeroes (grid + flag
  row) would need a second composite view, duplicating layout, glide, marks and focus-follow: what
  the arrays spec rejected for the same reason (CLAUDE.md §5).
- **Extending `Scene`.** It does not implement the `StepPlayer` contract (§5.2).

## 3. Where the code goes

`lanes.js` keeps rows, stacks and queues. The grid lives in `kit/grids.js` (with `grids.css`), so a
lesson that draws no grid does not ship it (CLAUDE.md §5). `lanes.js` gains one seam, `LANE_KINDS`:
a lane kind registered there supplies its own set-up, snapshot fields, measurement, block size,
slot geometry, chrome, layout extras, drawing layers, focus ranges and description. The row, stack
and queue kinds stay inline. `build.py` ships `grids` (after `player` and `lanes`) when the lesson
names `kind:'grid'`.

## 4. The model

- Lane definition: `{id, kind:'grid', label, rows, cols, w, rkeys, ckeys}`. `rkeys` / `ckeys` label
  rows and columns (node names in an adjacency matrix); by default they are the indices.
- `at(id, r, c)` gives the slot; `cell(id, r, c)` the item there; `fill(id, rows)` puts a whole
  2D array of values.
- `axis(id, name, 'r' | 'c', i)`: a named row or column (`top`, `r`, `left`, `c`); `null` removes
  it. Row names stand left of the grid, column names above it, and each glides as its index changes.
- `rect(id, name, r0, c0, r1, c1)`: a named rectangle over cells, both corners included, gliding as
  its corners move. An empty one (`r0 > r1` or `c0 > c1`, a spiral whose bounds have crossed) is not
  drawn. `null` removes it.
- `path(id, name, slots)`: a trail through cells in visit order. A trail that gains or loses its
  last cell draws that segment growing or retracting.
- `mark` names a slot in a row; on a grid it throws. A cell is named by its row and column axes
  and a tone, so a grid has one way to say "here".
- Tones are the lane tones (`cur`, `good`, `bad`, `dim`): strokes, never fills, so the value keeps
  the body ink and no state costs contrast.

## 5. The view

- Cells are the lane's soft boxes on a fixed grid, with index (or key) labels above the columns and
  left of the rows. The block reserves room for the most axis names any snapshot shows, so nothing
  moves but the items, names, rectangles and trails.
- A trail is drawn under the cells: it shows in the gaps between them and through a visited (`dim`)
  cell, whose box is clear, so it reads as a thread through the cells it visited. A dim value in a
  grid carries a halo of the stage's paper, so the trail never strikes through a digit (seen at
  375 px in the first build; the contrast gate measures text against its background, not a line
  crossing it).
- A rectangle is an outline over the cells, with its name on a tag of card paper at its top-left
  corner, so the name's contrast is measured against the card, not a cell.
- Focus on a phone: a highlighted column name, rectangle or item, else the column names.
- A grid's drawn size is keyed by its shape as well as its id, so two tabs that each call their grid
  `g` with different shapes get their own boards (the first build merged a 3 × 4 into a 4 × 5).
- On a phone a board wider than the stage scrolls inside it, as a row does (arrays spec §4), and
  the lane label can scroll out of view while the focus is on the far columns.
- The accessible name reads the grid row by row, then its axes, rectangles and trails.

## 6. Proof

- Model tests hold the grid to a plain 2D array over random operations (put, clear, swap, a four-way
  cycle), check `at` against `r × cols + c`, `fill`, axis and rect snapshots, trail isolation between
  snapshots, and that `mark` on a grid throws. Faults are planted and seen failing.
- `build.py`'s dependency test covers `grids`.
- The `kit-players` specimen gains a grids section: spiral order with its four bounds and trail, a
  transpose by swaps, number of islands with its queue, and a 2D prefix-sum query with its
  rectangles. The browser gate runs every step in both themes at 1366 and 375 px.
- No lesson migrates in this change: that is phase 3 batch work, as with the arrays item.
