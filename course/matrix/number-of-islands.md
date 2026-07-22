---
title: Number of Islands
type: problem
---

## Problem

Given an `m × n` binary grid where `'1'` is land and `'0'` is water,
return the number of **islands** — a group of `'1'`s connected
**4-directionally** (horizontally or vertically, not diagonally). All
four edges of the grid are assumed to be surrounded by water.
(LeetCode 200.)

**Examples**

```text
grid = [
  ["1","1","0","0","0"],
  ["1","1","0","0","0"],
  ["0","0","1","0","0"],
  ["0","0","0","1","1"]
]
→ 3
```

**Constraints:** `1 ≤ m, n ≤ 300`, each cell is `'0'` or `'1'`.

## Attempt it first

This is the direction-vector technique from the Grid Representation
concept lesson, applied to a new question: not "visit every neighbor"
but "visit every cell *reachable* from a starting cell." Before opening
anything, try to answer: if you land on an unvisited `'1'`, how do you
mark an *entire* connected blob of land as counted, without re-counting
it, and without walking off the grid?

````reveal Hint — flood fill, and the marking trick
Standard graph traversal: from an unvisited `'1'`, explore every
4-directional neighbor that is also `'1'` and not yet visited, then their
neighbors, and so on, until the whole connected blob has been visited.
Each time you *start* this exploration from a fresh, unvisited `'1'`,
that's one new island. The one implementation detail worth deciding
upfront: do you allocate a separate `visited` grid, or mutate the input
by flipping visited land to `'0'` as you go (sinking it)? Both work; the
mutation approach is what the reference solution uses, since it needs no
extra `O(m·n)` structure.
````

## Brute force, for contrast

There isn't a meaningfully different "brute force" here — the naive and
optimal approaches are the same traversal idea. What *is* worth ruling
out explicitly: you might be tempted to scan the grid, and every time you
see a `'1'`, check whether it's "new" by comparing against previously
seen land coordinates. That degenerates into re-deriving connectivity by
hand and is both slower and more error-prone than just traversing. The
real solution below **is** the efficient one; there's no separate
inferior tier to contrast it against, unlike most problems in this
course.

## The insight

Two things need to be true for the count to come out right:

1. **Every scan of the grid only ever starts a new traversal from land
   that hasn't been claimed by an earlier traversal.** This is what makes
   "one island" mean one connected component, not one land cell.
2. **A traversal from one land cell must visit its *entire* connected
   component before returning**, so that by the time the outer scan moves
   on, every cell in that island is already marked and will never trigger
   a second, spurious traversal.

This is exactly DFS (or BFS — either works; DFS is shown below) using the
`DIRS_4` direction-vector table and `in_bounds` check from the concept
lesson: from a starting `'1'`, recursively visit every 4-directional
neighbor that's still `'1'`, sinking each one to `'0'` the instant it's
visited (before recursing further) so it can never be revisited or
re-counted.

## Solution

`````reveal Solution — DFS flood fill, sinking visited land
````tabs
```python
def num_islands(grid: list[list[str]]) -> int:
    if not grid:
        return 0
    rows, cols = len(grid), len(grid[0])
    DIRS_4 = [(-1, 0), (1, 0), (0, -1), (0, 1)]

    def sink(r: int, c: int) -> None:
        # Mark visited immediately — before recursing — so this exact
        # cell can never trigger a second traversal from any direction.
        grid[r][c] = "0"
        for dr, dc in DIRS_4:
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == "1":
                sink(nr, nc)

    islands = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == "1":
                islands += 1     # a fresh, unclaimed land cell = a new island
                sink(r, c)       # claim its entire connected component
    return islands
```

```typescript
function numIslands(grid: string[][]): number {
  if (grid.length === 0) return 0;
  const rows = grid.length;
  const cols = grid[0].length;
  const DIRS_4: [number, number][] = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  function sink(r: number, c: number): void {
    // Mark visited immediately — before recursing — so this exact
    // cell can never trigger a second traversal from any direction.
    grid[r][c] = "0";
    for (const [dr, dc] of DIRS_4) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === "1") {
        sink(nr, nc);
      }
    }
  }

  let islands = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === "1") {
        islands++; // a fresh, unclaimed land cell = a new island
        sink(r, c); // claim its entire connected component
      }
    }
  }
  return islands;
}
```
````

The single most important line is `grid[r][c] = "0"` happening **before**
the neighbor loop, not after. Sinking on entry (not on exit) is what
guarantees a cell can't be re-entered by one of its own neighbors during
the same traversal — without it, two adjacent cells would each try to
recurse into the other, forever.

```complexity
{
  "time": "O(m · n)",
  "space": "O(m · n) worst case",
  "why": "Every cell is visited by `sink` at most once total across the whole run (each visit sinks it, permanently removing it from future visits), so the outer double loop plus every recursive call together do O(m·n) work. Space is the recursion stack depth, which in the worst case (one island filling the entire grid in a snake pattern) is O(m·n) — this is real auxiliary space, not free, exactly as the Recursion module's call-stack lesson argues."
}
```
`````

`````reveal Alternative — BFS with an explicit queue (avoids recursion depth)
Same traversal idea, but using an explicit queue instead of the call
stack — trades the O(m·n) worst-case recursion depth (which can hit
language stack limits on a huge single island) for an O(m·n) worst-case
heap-allocated queue instead, which doesn't have that failure mode.

````tabs
```python
from collections import deque

def num_islands_bfs(grid: list[list[str]]) -> int:
    if not grid:
        return 0
    rows, cols = len(grid), len(grid[0])
    DIRS_4 = [(-1, 0), (1, 0), (0, -1), (0, 1)]

    def bfs(r: int, c: int) -> None:
        grid[r][c] = "0"
        queue = deque([(r, c)])
        while queue:
            cr, cc = queue.popleft()
            for dr, dc in DIRS_4:
                nr, nc = cr + dr, cc + dc
                if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == "1":
                    grid[nr][nc] = "0"   # sink on enqueue, not on dequeue
                    queue.append((nr, nc))

    islands = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == "1":
                islands += 1
                bfs(r, c)
    return islands
```

```typescript
function numIslandsBfs(grid: string[][]): number {
  if (grid.length === 0) return 0;
  const rows = grid.length;
  const cols = grid[0].length;
  const DIRS_4: [number, number][] = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  function bfs(r: number, c: number): void {
    grid[r][c] = "0";
    const queue: [number, number][] = [[r, c]];
    let head = 0;
    while (head < queue.length) {
      const [cr, cc] = queue[head++];
      for (const [dr, dc] of DIRS_4) {
        const nr = cr + dr;
        const nc = cc + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === "1") {
          grid[nr][nc] = "0"; // sink on enqueue, not on dequeue
          queue.push([nr, nc]);
        }
      }
    }
  }

  let islands = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === "1") {
        islands++;
        bfs(r, c);
      }
    }
  }
  return islands;
}
```
````

Note the sink happens **on enqueue**, not on dequeue — the BFS analogue
of "mark before recursing." Sinking on dequeue would let the same cell be
pushed onto the queue multiple times by different neighbors before any of
them dequeues it, wasting work (though still correct, since re-sinking an
already-`"0"` cell no-ops on the next dequeue's check — but it's needless
duplication worth avoiding).

```complexity
{
  "time": "O(m · n)",
  "space": "O(min(m, n)) typical, O(m · n) worst case",
  "why": "Same total-visits argument as DFS. The queue's *maximum simultaneous size* is bounded by the frontier of the flood fill, which for a roughly-square blob is O(min(m,n)) — smaller than DFS's worst-case stack depth in practice, though a pathological shape can still push it to O(m·n)."
}
```
`````

## Variants

- **Word Search** (next lesson): also a grid DFS with a "mark visited,
  recurse, then un-mark" pattern — but Word Search *must* undo the mark on
  backtrack (multiple root starting points reuse the same cells across
  attempts), while sinking here is permanent because each island is only
  ever counted once.
- **Number of Islands II** (not covered): the online/streaming variant —
  land cells are added one at a time and the island count is queried
  after each addition — is a canonical Union-Find application (Module 23),
  since re-running full flood fill after every addition would be far too
  slow.
- **Max Area of Island** (not covered): identical traversal, but `sink`
  returns a size (1 + sum of recursive sizes) instead of nothing, and the
  outer loop tracks the max instead of a count.

```quiz
{
  "question": "Why does marking a cell as visited (sinking it) BEFORE recursing into its neighbors matter, rather than after the recursive calls return?",
  "options": [
    "It doesn't matter — either order produces the same result; since every land cell eventually gets sunk regardless of when the marking happens relative to recursion, the final island count comes out identical either way",
    "If two adjacent land cells are visited close together, each cell's neighbor loop would try to recurse into the other before either had a chance to mark itself, causing infinite mutual recursion — marking on entry closes that cycle immediately",
    "Marking after is required to correctly count the island's area — the recursive calls need to tally up each cell's contribution before the parent cell is marked, similar to how a post-order traversal accumulates a subtree's total"
  ],
  "answer": 1,
  "explanation": "Consider cells A and B, adjacent to each other. Traversal reaches A and, before marking it, recurses into B; B's neighbor loop then sees A still marked '1' and recurses back into A — forever, if marking happened only on return. Marking on entry means by the time A's neighbor loop even looks at B (or vice versa), the current cell is already claimed, so a neighbor can never recurse back into its own caller."
}
```
