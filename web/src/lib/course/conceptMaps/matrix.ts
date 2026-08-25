import type { MindMapNode } from "./types";

/**
 * Concept map for the Matrix / 2D Traversal module. Hand-authored from the
 * module's 3-lesson structure (course/matrix/*.md). Curriculum-designer
 * review confirmed 3 concept lessons + 6 problem lessons is right, the
 * current order needs no changes, and all 6 problem lessons self-teach
 * (each explicitly names which concept lesson it applies). This module is
 * genuinely spatial/structural, so it got full sustained-analogy treatment:
 * a continuous bookshelf for row-major addressing, peeling a picture
 * frame's rings for spiral traversal, and a flat square tile turned by two
 * table-bound moves for the transpose+reverse rotation proof.
 */
export const matrixConceptMap: MindMapNode = {
  id: "matrix",
  label: "Matrix / 2D Traversal",
  children: [
    {
      id: "grid-coordinates",
      label: "Grid Representation & Coordinates",
      children: [
        { id: "row-major-offset", label: "matrix[i][j] is arithmetic on a flat array: offset = i*C + j — skip i whole rows, then walk j cells into the current row" },
        { id: "row-cheap-column-scattered", label: "Consecutive row cells are adjacent in memory; consecutive column cells are C cells apart — row-major traversal is the cache-friendly default" },
        { id: "four-comparison-bounds", label: "In-bounds is a conjunction of 4 independent checks (0<=i<R and 0<=j<C) — a valid row doesn't guarantee a valid column, or vice versa" },
        { id: "direction-vector-table", label: "One loop over a (Δrow,Δcol) table replaces 4 near-identical branches — a sign error becomes visible in a reviewable table instead of buried in duplicated code" },
      ],
    },
    {
      id: "traversal-orders",
      label: "Traversal Orders",
      children: [
        { id: "row-vs-column-major", label: "Same O(R·C), different sequence and different cache behavior — row-major reads memory in the order it's laid out, column-major jumps C cells per read" },
        { id: "diagonal-invariant", label: "Anti-diagonals share a constant r+c, main diagonals a constant r−c — fix the invariant, sweep the free index, derive the other, bounds-check" },
        { id: "spiral-boundary-shrink", label: "Four moving boundaries fence the un-visited rectangle; each edge-walk shrinks one boundary inward, so no cell is revisited" },
        { id: "spiral-guard-bug", label: "The inner guards (top<=bottom, left<=right) prevent re-walking a single leftover row/column twice — the classic bug that only surfaces on non-square or odd-dimension grids" },
      ],
    },
    {
      id: "in-place-transformations",
      label: "In-Place Transformations",
      children: [
        { id: "transpose-upper-triangle-only", label: "Swap (i,j)↔(j,i) only for j>i — starting at j=0 would swap every pair twice and undo itself, since a swap is its own inverse" },
        { id: "rotation-as-composition", label: "90° clockwise rotation = transpose, then reverse each row — proved by tracking an arbitrary (r,c) through both steps to (c, n−1−r), the rotation's coordinate target" },
        { id: "in-place-vs-fresh-grid", label: "In-place needs O(1) extra space (a scalar per swap) vs. a fresh grid's O(n²) — the trade is explicitness for memory, worth it exactly when the space constraint is real" },
      ],
    },
  ],
};
