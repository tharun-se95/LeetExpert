---
title: Unique Paths
type: problem
---

## Problem

A robot starts at the top-left corner of an `m × n` grid and wants to
reach the bottom-right corner. It can only move RIGHT or DOWN at each
step. Return the number of distinct paths. (LeetCode 62.)

**Examples**

```text
m = 3, n = 7  →  28
m = 3, n = 2  →  3    (paths: right-right-down, right-down-right, down-right-right)
```

**Constraints:** `1 ≤ m, n ≤ 100`.

## Attempt it first

This is the canonical grid-shaped 2D DP from this module's 2D DP
Patterns concept lesson: `dp[i][j]` genuinely represents a real position
in space, and the two indices ARE row and column, not two independent
sequence counters. Before opening anything, work out: how can the robot
have arrived at cell `(i, j)`, given the only two legal moves are right
and down — and what does that tell you about `dp[i][j]`'s dependencies?

````reveal Hint — the last move was either from above or from the left
The only way to arrive at `(i, j)` is either from directly ABOVE
(`(i-1, j)`, via a down-move) or directly to the LEFT (`(i, j-1)`, via a
right-move) — no other cell can be the immediate predecessor. So the
number of distinct paths to `(i, j)` is the SUM of the paths to each of
those two predecessors (every path to `(i, j)` splits cleanly into
exactly one of these two final-move cases, with no overlap, so sum —
not max — is the correct combining operator, since this is a "how many"
question).
````

## Brute force, for contrast

Naive recursion counting paths from `(0,0)` to `(m-1, n-1)`:

````tabs
```python
def unique_paths_bruteforce(m: int, n: int, i: int = 0, j: int = 0) -> int:
    if i == m - 1 and j == n - 1:
        return 1                        # reached the destination — one valid path
    if i >= m or j >= n:
        return 0                        # walked off the grid — invalid
    return (unique_paths_bruteforce(m, n, i + 1, j)
            + unique_paths_bruteforce(m, n, i, j + 1))
```

```typescript
function uniquePathsBruteforce(m: number, n: number, i = 0, j = 0): number {
  if (i === m - 1 && j === n - 1) return 1; // reached the destination
  if (i >= m || j >= n) return 0; // walked off the grid — invalid
  return uniquePathsBruteforce(m, n, i + 1, j) + uniquePathsBruteforce(m, n, i, j + 1);
}
```
````

This is O(2^(m+n)) in the worst case — every cell can be reached via
many different move sequences, and this naive version recomputes the
count from each intermediate cell every time it's re-reached, exactly
the overlapping-subproblems disease this module opened with.

## The insight

`dp[i][j] = dp[i-1][j] + dp[i][j-1]` has overlapping subproblems (the
brute force reaches the same `(i, j)` via many different move orders)
and optimal substructure — though for a pure counting problem like this
one, "optimal" is really just "correct": the count at `(i, j)` is fully
determined by the counts at its two possible predecessors, with no
ambiguity about how those predecessor counts were achieved.

## Solution

`````reveal Solution — tabulated 2D grid, filled row by row
````tabs
```python
def unique_paths(m: int, n: int) -> int:
    dp = [[1] * n for _ in range(m)]      # first row and first column: exactly 1 path each
    for i in range(1, m):
        for j in range(1, n):
            dp[i][j] = dp[i - 1][j] + dp[i][j - 1]
    return dp[m - 1][n - 1]
```

```typescript
function uniquePaths(m: number, n: number): number {
  const dp: number[][] = Array.from({ length: m }, () => new Array(n).fill(1));
  // first row and first column: exactly 1 path each
  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      dp[i][j] = dp[i - 1][j] + dp[i][j - 1];
    }
  }
  return dp[m - 1][n - 1];
}
```
````

Initializing the entire first row and first column to `1` encodes the
base case directly: a cell in the top row can ONLY be reached by moving
right repeatedly (there's no row above to come down from), so there's
exactly one path to it, and symmetrically for the first column. Filling
row by row, left to right, guarantees `dp[i-1][j]` and `dp[i][j-1]` are
always already computed before `dp[i][j]` needs them — the same
dependency-ordering discipline as every 2D DP in this module.

```complexity
{
  "time": "O(m · n)",
  "space": "O(m · n), reducible to O(n)",
  "why": "Every cell is computed once, O(1) work each — O(m·n) total. Space can be reduced to O(n) (a single rolling row) since dp[i][j] only ever reads the row directly above and the current row's own previous entry, never anything further back — a further space-optimization exercise worth doing after this."
}
```
`````

`````reveal Alternative — closed-form combinatorics, O(1) extra space
The robot makes exactly `m - 1` down-moves and `n - 1` right-moves, in
SOME order, totaling `m + n - 2` moves. Every distinct path corresponds
to a distinct choice of WHICH of those `m + n - 2` move-slots are the
down-moves (the rest are automatically right-moves) — a direct
combinations count:

````tabs
```python
from math import comb

def unique_paths_formula(m: int, n: int) -> int:
    return comb(m + n - 2, m - 1)     # choose which m-1 of the m+n-2 moves are "down"
```

```typescript
function uniquePathsFormula(m: number, n: number): number {
  // choose which (m-1) of the (m+n-2) moves are "down"
  function comb(nTotal: number, k: number): number {
    let result = 1;
    for (let i = 0; i < k; i++) {
      result = (result * (nTotal - i)) / (i + 1);
    }
    return Math.round(result);
  }
  return comb(m + n - 2, m - 1);
}
```
````

This connects back to Module 3 (Math for DSA)'s combinatorics, if that
module covered `nCr` — worth recognizing that a DP-shaped problem can
sometimes have a direct closed-form answer once its combinatorial
structure is recognized, though the DP solution remains the one to
default to when no such closed form is apparent.

```complexity
{
  "time": "O(min(m, n))",
  "space": "O(1)",
  "why": "Computing nCr iteratively (the loop above) does k = min(m-1, n-1) multiplications and divisions, no table at all."
}
```
`````

## Variants

- **2D DP Patterns** (concept lesson, this module): the exact grid-DP
  shape this problem instantiates, contrasted with the two-sequence
  shape of Longest Common Subsequence.
- **Unique Paths II** (LeetCode 63, not covered): the same grid, but
  with obstacles — cells marked as blocked get `dp[i][j] = 0`
  unconditionally, since no path can pass through them; otherwise
  identical recurrence.
- **Minimum Path Sum** (LeetCode 64, not covered): same grid-DP shape,
  but `dp[i][j] = grid[i][j] + min(dp[i-1][j], dp[i][j-1])` — `min`
  instead of `sum`, since the question changes from "how many paths" to
  "the cheapest path," another direct instance of the 1D/2D DP Patterns
  lessons' operator-selection principle.

```quiz
{
  "question": "Why is the entire first row and first column of the dp table initialized to 1, rather than being computed by the same dp[i][j] = dp[i-1][j] + dp[i][j-1] recurrence used everywhere else?",
  "options": [
    "A cell in the first row has no row above it, so dp[i-1][j] would be undefined — reaching it is only possible via a single unbroken sequence of right-moves, giving exactly 1 path; the same reasoning applies symmetrically to the first column via down-moves. These are the recurrence's BASE CASES, needed precisely because the general recurrence has no valid predecessor to reference there",
    "The first row and column are initialized to 1 to prevent division-by-zero errors later in the computation — since later cells in the recurrence divide by neighboring values under the hood, a zero in the boundary row or column would cause a runtime crash if left uninitialized",
    "It's an arbitrary convention that happens to produce correct results — since setting the boundary to 1 empirically matches the expected output on the example cases, it was adopted as a convention without a specific structural justification"
  ],
  "answer": 0,
  "explanation": "Every recurrence needs base cases where the general rule doesn't apply — here, cells with no cell above (row 0) or no cell to the left (column 0). Rather than special-casing the recurrence itself, the solution pre-fills those boundary values directly, since they have an obvious, provable answer (1 path each, via the only single sequence of moves that reaches them) that doesn't need the general two-term sum at all."
}
```
