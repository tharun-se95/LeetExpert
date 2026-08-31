---
title: Practice
type: practice
---

## How to practice this module

Matrix drills reward **naming the traversal**: layer-by-layer, spiral, or
coordinate flood. Rotate, spiral and set-zeroes are structure problems;
search-a-2d and number-of-islands lean on coordinates and flood fill;
word-search is DFS along a board path. Done when all six show Solved in the
hub.

## Problems

```practice-problems
- slug: rotate-image
  pattern: Layer-by-layer swaps
  difficulty: Medium
  watch_for: Rotate rings inward; stash a corner before overwriting — or transpose then mirror, whichever you can trace
- slug: spiral-matrix
  pattern: Boundary walk
  difficulty: Medium
  watch_for: Shrink the four bounds after each edge; stop when the visited count reaches m*n so you never double-print
- slug: set-matrix-zeroes
  pattern: First row / column markers
  difficulty: Medium
  watch_for: Use the first row and column as flags; the [0][0] corner needs its own boolean or you zero the wrong line
- slug: search-a-2d-matrix
  pattern: Flattened binary search
  difficulty: Medium
  watch_for: Index a row-major array with (r*n + c) and rely on the ordering the problem states — a plain 2-D scan forfeits the log
- slug: number-of-islands
  pattern: Grid flood fill
  difficulty: Medium
  watch_for: Mark visited in place when you land; BFS or DFS from each unvisited '1' and count the frontiers
- slug: word-search
  pattern: DFS path search
  difficulty: Medium
  watch_for: Restore the board mark after backtracking; check bounds before indexing, not after the deref
```
