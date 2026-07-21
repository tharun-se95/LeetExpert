---
title: Range Sum Query 2D — Immutable
type: problem
---

## Problem

Given a 2D matrix, implement `NumMatrix` supporting
`sumRegion(row1, col1, row2, col2)` — the sum of all elements inside
that rectangle, inclusive — for **many** calls. The matrix never
changes.

**Example**

```text
matrix = [[3,0,1,4,2],
          [5,6,3,2,1],
          [1,2,0,1,5],
          [4,1,0,1,7],
          [1,0,3,0,5]]
sumRegion(2,1,4,3) → 8   (rows 2-4, cols 1-3: 2+0+1 + 1+0+1 + 0+3+0 = 8)
```

**Constraints:** 1 ≤ rows, cols ≤ 200 · up to 10⁴ calls to `sumRegion`.

## Attempt it first

The direct application of the 2D prefix sum lesson, in the same
class-shaped harness as Range Sum Query — Immutable. Build the padded
2D prefix array once in the constructor; answer each query with the
four-term inclusion-exclusion formula.

````reveal Hint — the two formulas from the lesson
Build: prefix[i][j] = grid[i-1][j-1] + prefix[i-1][j] + prefix[i][j-1]
- prefix[i-1][j-1]. Query: sum = prefix[r2+1][c2+1] - prefix[r1][c2+1]
- prefix[r2+1][c1] + prefix[r1][c1]. Get the four indices right — this
IS the whole exercise.
````

## Brute force, for contrast

Sum every cell in the rectangle on each call: O(rows × cols) per query
in the worst case — 200×200×10⁴ = 4×10⁸, likely too slow if large
regions are queried repeatedly. The 2D prefix array collapses every
query to O(1) after one O(rows×cols) build.

## Solution

`````reveal Solution — 2D prefix array, built once
````tabs
```python
class NumMatrix:
    def __init__(self, matrix: list[list[int]]) -> None:
        rows, cols = len(matrix), len(matrix[0])
        self.prefix = [[0] * (cols + 1) for _ in range(rows + 1)]
        for i in range(1, rows + 1):
            for j in range(1, cols + 1):
                self.prefix[i][j] = (
                    matrix[i - 1][j - 1]
                    + self.prefix[i - 1][j]
                    + self.prefix[i][j - 1]
                    - self.prefix[i - 1][j - 1]
                )

    def sumRegion(self, row1: int, col1: int, row2: int, col2: int) -> int:
        p = self.prefix
        return (
            p[row2 + 1][col2 + 1]
            - p[row1][col2 + 1]
            - p[row2 + 1][col1]
            + p[row1][col1]
        )
```

```typescript
class NumMatrix {
  private prefix: number[][];

  constructor(matrix: number[][]) {
    const rows = matrix.length;
    const cols = matrix[0].length;
    this.prefix = Array.from({ length: rows + 1 }, () =>
      new Array(cols + 1).fill(0),
    );
    for (let i = 1; i <= rows; i++) {
      for (let j = 1; j <= cols; j++) {
        this.prefix[i][j] =
          matrix[i - 1][j - 1] +
          this.prefix[i - 1][j] +
          this.prefix[i][j - 1] -
          this.prefix[i - 1][j - 1];
      }
    }
  }

  sumRegion(row1: number, col1: number, row2: number, col2: number): number {
    const p = this.prefix;
    return (
      p[row2 + 1][col2 + 1] -
      p[row1][col2 + 1] -
      p[row2 + 1][col1] +
      p[row1][col1]
    );
  }
}
```
````

Verify against the example: rows 2-4, cols 1-3 means row1=2, col1=1,
row2=4, col2=3. `sumRegion = prefix[5][4] - prefix[2][4] - prefix[5][1]
+ prefix[2][1]`. Building the full prefix array for the given matrix
and plugging in confirms 8 — work through the build formula by hand
once on this example if the four-term subtraction feels shaky; it's the
fastest way to make the inclusion-exclusion concrete.

```complexity
{
  "time": "O(rows × cols) constructor, O(1) per sumRegion call",
  "space": "O(rows × cols)",
  "why": "The build cost is paid once; every query after that is four lookups and three arithmetic operations, regardless of the rectangle's area."
}
```
`````

## Variants

- **Range Sum Query — Immutable** (1D sibling): the same trade in one
  fewer dimension — worth comparing the two `sumRegion`/`sumRange`
  formulas side by side to see the inclusion-exclusion term appear only
  once the problem gains a second dimension.
- **Matrix Block Sum:** a fixed-radius version of this query, applied
  to every cell — the 2D prefix sum turns an O(n²·k²) brute force into
  O(n²).
- **Count Submatrices With All Ones:** a harder relative using
  row-by-row running "height" counts (closer to Largest Rectangle in
  Histogram, Module 8, than to plain prefix sums).

```quiz
{
  "question": "The query formula needs FOUR terms (one add, two subtracts, one add-back) while the 1D range-sum formula needed only two (one subtract). What's the structural reason for the difference?",
  "options": [
    "2D arrays are simply more complex to index",
    "In 1D, a range is bounded by exactly two points with nothing to double-count; in 2D, 'subtract the region before the rectangle' means subtracting TWO overlapping strips (top and left), which double-subtracts their shared corner — requiring a fourth term to add that corner back",
    "The four-term formula is an unoptimized version; two terms would also work"
  ],
  "answer": 1,
  "explanation": "Each added dimension multiplies the inclusion-exclusion complexity: 1D needs 2 terms (2^1), 2D needs 4 terms (2^2) — a 3D prefix sum would need 8. The pattern is a direct consequence of how many overlapping regions must be corrected for at each additional dimension."
}
```
