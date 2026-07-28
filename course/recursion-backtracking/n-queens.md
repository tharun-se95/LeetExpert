---
title: N-Queens
type: problem
---

## Problem

Place `n` chess queens on an `n × n` board so that **no two queens
attack each other** — no two share a row, a column, or a diagonal.
Return all distinct solutions, each as a board configuration.
(LeetCode 51.)

**Examples**

```text
n = 4  →  2 solutions:
.Q..    ..Q.
...Q    Q...
Q...    ...Q
..Q.    .Q..
```

**Constraints:** `1 ≤ n ≤ 9`.

## Attempt it first

This is the module's capstone because it's the first problem where the
pruning check itself is non-trivial — it's not a single counter
(Generate Parentheses) or a single predicate on one substring
(Palindrome Partitioning), but **three simultaneous conflict
conditions**. Before opening anything, work out two things: (1) why can
you assume, without loss of generality, exactly one queen per row (so
the choice at each recursion level is *which column* in that row, not
*whether* to place a queen), and (2) how would you check, in O(1), that
placing a queen at `(row, col)` doesn't share a diagonal with any
already-placed queen?


```sandbox
{
  "id": "n-queens",
  "fn": { "python": "solve_n_queens", "javascript": "solveNQueens" },
  "check": "return",
  "compare": "sorted",
  "starter": {
    "python": "def solve_n_queens(n):\n    # Return every board, each a list of n strings of \".\" and \"Q\".\n    pass\n",
    "javascript": "function solveNQueens(n) {\n  // Return every board, each a list of n strings of \".\" and \"Q\".\n}\n"
  },
  "cases": [
    {
      "args": [4],
      "expect": [[".Q..", "...Q", "Q...", "..Q."], ["..Q.", "Q...", "...Q", ".Q.."]]
    },
    { "args": [1], "expect": [["Q"]] },
    { "args": [2], "expect": [] },
    { "args": [3], "expect": [] },
    {
      "args": [5],
      "expect": [
        ["Q....", "..Q..", "....Q", ".Q...", "...Q."],
        ["Q....", "...Q.", ".Q...", "....Q", "..Q.."],
        [".Q...", "...Q.", "Q....", "..Q..", "....Q"],
        [".Q...", "....Q", "..Q..", "Q....", "...Q."],
        ["..Q..", "Q....", "...Q.", ".Q...", "....Q"],
        ["..Q..", "....Q", ".Q...", "...Q.", "Q...."],
        ["...Q.", "Q....", "..Q..", "....Q", ".Q..."],
        ["...Q.", ".Q...", "....Q", "..Q..", "Q...."],
        ["....Q", ".Q...", "...Q.", "Q....", "..Q.."],
        ["....Q", "..Q..", "Q....", "...Q.", ".Q..."]
      ]
    },
    {
      "args": [6],
      "expect": [
        [".Q....", "...Q..", ".....Q", "Q.....", "..Q...", "....Q."],
        ["..Q...", ".....Q", ".Q....", "....Q.", "Q.....", "...Q.."],
        ["...Q..", "Q.....", "....Q.", ".Q....", ".....Q", "..Q..."],
        ["....Q.", "..Q...", "Q.....", ".....Q", "...Q..", ".Q...."]
      ]
    }
  ]
}
```

````reveal Hint — one queen per row, and diagonals via row±col
Since no two queens can share a row, you can place exactly one queen per
row and recurse row by row — the state-space tree's branching at each
level is "which column in this row," never "place or don't." That
collapses the search from "choose n cells out of n²" down to "choose one
column per row," which is already a huge prune.

For diagonals: every cell on the same "↘" diagonal (top-left to
bottom-right) shares the same value of `row − col`. Every cell on the
same "↙" diagonal (top-right to bottom-left) shares the same value of
`row + col`. So instead of scanning previously placed queens to check
diagonals, maintain three sets — used columns, used `row − col` values,
and used `row + col` values — and a placement is legal exactly when its
column, its `row − col`, and its `row + col` are all absent from their
respective sets.
````

## Brute force, for contrast

The naive approach tries to place n queens on n² cells with no
structural insight at all — choose any n of the n² cells (an
astronomically large space), and validate the *entire* board's pairwise
non-attack condition only once a full placement is proposed:

````tabs
```python
from itertools import combinations

def solve_n_queens_bruteforce(n: int) -> int:
    def attacks(a, b):
        r1, c1 = a
        r2, c2 = b
        return r1 == r2 or c1 == c2 or abs(r1 - r2) == abs(c1 - c2)

    cells = [(r, c) for r in range(n) for c in range(n)]
    count = 0
    for combo in combinations(cells, n):        # choose n of n² cells
        if all(not attacks(a, b) for i, a in enumerate(combo)
               for b in combo[i + 1:]):
            count += 1
    return count
```

```typescript
function solveNQueensBruteforceCount(n: number): number {
  function attacks(a: [number, number], b: [number, number]): boolean {
    const [r1, c1] = a;
    const [r2, c2] = b;
    return r1 === r2 || c1 === c2 || Math.abs(r1 - r2) === Math.abs(c1 - c2);
  }

  const cells: [number, number][] = [];
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) cells.push([r, c]);

  // (choosing n of n^2 cells and validating pairwise — infeasible beyond tiny n)
  let count = 0;
  // ... combinatorial enumeration omitted: this approach doesn't scale
  return count;
}
```
````

This is combinatorially hopeless — choosing `n` cells out of `n²` is
`C(n², n)`, which for `n = 8` is already over 4 billion candidate
placements, each requiring a pairwise check. It's included only to make
explicit how much structure the "one queen per row" observation buys:
it replaces "choose n of n² cells" with "choose 1 of n columns, n
times," which is what the real solution exploits.

## The insight

Recurse row by row, `place(row)`. At each row, try every column `col`
from `0` to `n − 1`:

- **Legal check (the prune), O(1) per candidate:** `col` not in
  `used_cols`, `row − col` not in `used_diag1`, `row + col` not in
  `used_diag2`.
- **Choose:** record the queen at `(row, col)`, add `col`, `row − col`,
  `row + col` to their respective sets.
- **Explore:** recurse to `row + 1`.
- **Unchoose:** remove the queen and the three set entries before trying
  the next column.
- **Base case:** `row == n` — every row has a legally placed queen, so
  this is a complete solution; record the board.

The three sets turn what would otherwise be an O(row) scan over already-
placed queens (checking each for a column or diagonal conflict) into
three O(1) membership tests, which matters because this check runs at
*every* node of a tree that's already large.

## Solution

`````reveal Solution — row-by-row backtracking with column/diagonal conflict sets
````tabs
```python
def solve_n_queens(n: int) -> list[list[str]]:
    result: list[list[str]] = []
    cols: set[int] = set()
    diag1: set[int] = set()   # row - col, constant along a "\" diagonal
    diag2: set[int] = set()   # row + col, constant along a "/" diagonal
    placement: list[int] = [] # placement[row] = column of that row's queen

    def backtrack(row: int) -> None:
        if row == n:                                # base case: every row placed
            board = []
            for r in range(n):
                line = "." * placement[r] + "Q" + "." * (n - placement[r] - 1)
                board.append(line)
            result.append(board)
            return
        for col in range(n):
            if col in cols or (row - col) in diag1 or (row + col) in diag2:
                continue                             # PRUNE: conflict
            # CHOOSE
            cols.add(col); diag1.add(row - col); diag2.add(row + col)
            placement.append(col)
            backtrack(row + 1)                        # EXPLORE
            # UNCHOOSE
            cols.remove(col); diag1.remove(row - col); diag2.remove(row + col)
            placement.pop()

    backtrack(0)
    return result
```

```typescript
function solveNQueens(n: number): string[][] {
  const result: string[][] = [];
  const cols = new Set<number>();
  const diag1 = new Set<number>(); // row - col
  const diag2 = new Set<number>(); // row + col
  const placement: number[] = []; // placement[row] = column of that row's queen

  function backtrack(row: number): void {
    if (row === n) {
      // base case: every row placed
      const board: string[] = [];
      for (let r = 0; r < n; r++) {
        board.push(".".repeat(placement[r]) + "Q" + ".".repeat(n - placement[r] - 1));
      }
      result.push(board);
      return;
    }
    for (let col = 0; col < n; col++) {
      if (cols.has(col) || diag1.has(row - col) || diag2.has(row + col)) {
        continue; // PRUNE: conflict
      }
      // CHOOSE
      cols.add(col);
      diag1.add(row - col);
      diag2.add(row + col);
      placement.push(col);
      backtrack(row + 1); // EXPLORE
      // UNCHOOSE
      cols.delete(col);
      diag1.delete(row - col);
      diag2.delete(row + col);
      placement.pop();
    }
  }

  backtrack(0);
  return result;
}
```
````

The three `.add`/`.remove`
(Python) or `.add`/`.delete` (TS) pairs are the choose/unchoose ritual
applied to three pieces of state at once instead of one — every set
that gets an entry added on the way in must have that *exact* entry
removed on the way out, or the sets desynchronize from `placement` and
later legality checks become wrong.

```complexity
{
  "time": "O(n!) worst case",
  "space": "O(n) auxiliary (recursion depth, plus the three O(n)-sized sets)",
  "why": "Row 0 has n column choices; row 1 has at most n-1 remaining after column-conflict pruning (fewer still once diagonals are counted); this bounds the tree by n!, the same factorial shape as Permutations, though the diagonal prunes typically cut it far smaller in practice. The concept lesson's warning applies exactly here: pruning shrinks what's ACTUALLY walked dramatically, but the worst-case label stays O(n!) because an input could theoretically leave little to prune."
}
```
`````

## Variants

- **N-Queens II** (LeetCode 52): identical search, but return only the
  **count** of solutions, not the boards themselves — drop the `board`
  construction in the base case and just increment a counter, saving the
  O(n) string-building cost at every leaf.
- **Permutations** (this module): N-Queens' column-choice-per-row is
  structurally a permutation problem (each column used exactly once
  across all rows) with two *extra* constraints (the two diagonal sets)
  layered on top — worth re-reading Permutations side by side with this
  solution to see the relationship.
- **Sudoku Solver** (not covered): the natural "next problem" in this
  family — backtracking over cell choices with row/column/box conflict
  sets instead of row/column/diagonal ones.

```quiz
{
  "question": "Why does tracking row − col and row + col in two separate sets correctly detect diagonal conflicts, instead of needing to scan all previously placed queens on each check?",
  "options": [
    "Every cell along one falling diagonal (↘) shares the same row − col value, and every cell along one rising diagonal (↙) shares the same row + col value; so two queens share a diagonal if and only if they share one of these two values, which membership in a set checks in O(1) without ever looking at individual queens",
    "row - col and row + col are only approximations and can produce false negatives — they catch most diagonal conflicts reliably but can occasionally miss a genuine attack along longer diagonals, which is why a scanning fallback is still recommended",
    "It doesn't fully work — diagonal conflicts still require scanning previous queens as a fallback; the two sets only narrow down likely candidates, and a final O(placed queens) pass is needed to confirm no attack actually exists"
  ],
  "answer": 0,
  "explanation": "This is an exact algebraic characterization, not a heuristic: moving one step along a ↘ diagonal increases both row and col by 1, leaving row − col unchanged; moving along a ↙ diagonal increases row and decreases col (or vice versa), leaving row + col unchanged. Since these are the ONLY two diagonal directions a queen attacks along, two cells are diagonally aligned exactly when one of these two differences/sums matches — turning an O(placed queens) scan into an O(1) set lookup."
}
```
