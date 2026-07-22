---
title: Spiral Matrix
type: problem
---

## Problem

Given an `m × n` matrix, return **all its elements in spiral order** —
starting at the top-left, walking the outer ring clockwise (right, down,
left, up), then spiralling inward ring by ring until every element is
collected. (LeetCode 54.)

**Examples**

```text
[[1,2,3],
 [4,5,6],   →  [1,2,3,6,9,8,7,4,5]
 [7,8,9]]

[[1, 2, 3, 4],
 [5, 6, 7, 8],   →  [1,2,3,4,8,12,11,10,9,5,6,7]
 [9,10,11,12]]
```

**Constraints:** `1 ≤ m, n ≤ 10`, values in ±100. Note the grid is `m × n`
— **not** necessarily square — which is exactly where the subtle bug in
this problem lives.

## Attempt it first

This is the direct application of the concept lesson's spiral traversal
(Traversal Orders). The mechanics — four moving boundaries fencing the
un-visited rectangle, each edge-walk shrinking one boundary inward — are
already derived there. Your job is to reproduce it *correctly on a
non-square grid*, which means getting the two inner guards right. Before
revealing anything, write the four edge-walks and ask yourself: **after
I've walked the top row and the right column, what goes wrong on a grid
that has only one row, or only one column, left?**

````reveal Hint — where the non-square grids bite
The four walks are: top row left→right, right column top→bottom, bottom
row right→left, left column bottom→top, shrinking `top`, `right`,
`bottom`, `left` respectively after each. The trap: after shrinking `top`
and `right`, the leftover region can be a single row or single column. The
bottom-row and left-column walks must each be *guarded* by re-checking
`top <= bottom` and `left <= right`, or a lone remaining row/column gets
emitted twice. Copy this discipline exactly from the concept lesson.
````

## Brute force, for contrast

There isn't a meaningfully different "brute force" here — you can't avoid
touching all `m·n` cells, and there's no slower-but-simpler correct
algorithm worth writing. The instructive contrast is instead the *wrong*
simple attempt: the four walks **without** the inner guards. It looks
right and passes on square grids, then double-counts cells on grids like
`3 × 4` or `1 × n`. We show the correct version directly, and the quiz
returns to why the naive one fails.

## The insight

The whole problem is the **boundary-shrinking invariant**: at all times,
the un-emitted cells form an axis-aligned rectangle
`[top..bottom] × [left..right]`. Each of the four edge-walks emits one
edge of that rectangle and then retracts the corresponding boundary,
handing a strictly smaller rectangle to the next walk. Because every walk
starts from the *already-shrunken* boundaries of the previous walks, the
four corners are never double-emitted — provided each walk first confirms
its edge still exists (the guards). When the rectangle becomes empty
(`top > bottom` or `left > right`), every cell has been emitted exactly
once.

## Solution

`````reveal Solution — four shrinking boundaries
````tabs
```python
def spiral_order(matrix: list[list[int]]) -> list[int]:
    if not matrix or not matrix[0]:
        return []
    top, bottom = 0, len(matrix) - 1
    left, right = 0, len(matrix[0]) - 1
    result = []
    while top <= bottom and left <= right:
        for c in range(left, right + 1):          # top row: left → right
            result.append(matrix[top][c])
        top += 1

        for r in range(top, bottom + 1):          # right col: top → bottom
            result.append(matrix[r][right])
        right -= 1

        if top <= bottom:                         # is a distinct bottom row left?
            for c in range(right, left - 1, -1):  # bottom row: right → left
                result.append(matrix[bottom][c])
            bottom -= 1

        if left <= right:                         # is a distinct left col left?
            for r in range(bottom, top - 1, -1):  # left col: bottom → top
                result.append(matrix[r][left])
            left += 1
    return result
```

```typescript
function spiralOrder(matrix: number[][]): number[] {
  if (matrix.length === 0 || matrix[0].length === 0) return [];
  let top = 0;
  let bottom = matrix.length - 1;
  let left = 0;
  let right = matrix[0].length - 1;
  const result: number[] = [];
  while (top <= bottom && left <= right) {
    for (let c = left; c <= right; c++) result.push(matrix[top][c]); // top →
    top++;

    for (let r = top; r <= bottom; r++) result.push(matrix[r][right]); // right ↓
    right--;

    if (top <= bottom) {
      for (let c = right; c >= left; c--) result.push(matrix[bottom][c]); // bottom ←
      bottom--;
    }

    if (left <= right) {
      for (let r = bottom; r >= top; r--) result.push(matrix[r][left]); // left ↑
      left++;
    }
  }
  return result;
}
```
````

The two `if` guards before the bottom-row and left-column walks are the
entire difference between correct and almost-correct. After `top++` and
`right--`, a grid that started as (say) `1 × 4` has `top > bottom`; the
guard skips the bottom-row walk that would otherwise re-emit the single
row right-to-left. Every cell is appended exactly once.

```complexity
{
  "time": "O(m·n)",
  "space": "O(1)",
  "why": "The four boundaries partition the grid so each of the m·n cells falls in exactly one edge-walk and is appended once. Beyond the required output list, only the four boundary integers are used — no auxiliary grid, no recursion."
}
```
`````

## Variants

- **Spiral Matrix II** (LeetCode 59): the inverse — *fill* an `n × n` grid
  with `1..n²` in spiral order. Same boundary-shrinking loop, but you write
  an incrementing counter into each cell instead of reading it out.
- **Rotate Image** (previous lesson): the other rotational grid problem,
  but an in-place *rewrite* rather than an order-of-visitation *read*.
- **Diagonal Traverse** (LeetCode 498): a different fixed visitation order,
  built on the diagonal-invariant technique from the concept lesson rather
  than boundary shrinking.

```quiz
{
  "questions": [
    {
      "question": "On a 1×4 grid [[1,2,3,4]], why would the four walks WITHOUT the inner guards produce a wrong answer?",
      "options": [
        "They would skip the last element — without the guards, the boundary-shrinking logic terminates one step too early on a 1×4 grid, leaving the final cell in the row unvisited by any of the four walks",
        "The top-row walk emits 1,2,3,4 and shrinks top past bottom; without the `if top <= bottom` guard, the bottom-row walk then re-emits 4,3,2,1 — duplicating every cell — because the outer while condition alone doesn't know the row was already consumed",
        "The walks would visit the cells in reverse order — omitting the guards causes the bottom-row and left-column walks to fire before the top-row and right-column walks, inverting the overall spiral direction"
      ],
      "answer": 1,
      "explanation": "After `top++`, top becomes 1 while bottom stays 0, so top > bottom — there is no distinct bottom row. The outer while check was evaluated before this shrink; only the inner guard catches that the bottom-row edge no longer exists. This is why the bug appears specifically on single-row/column (non-square) grids."
    },
    {
      "question": "What guarantees the four corner cells of each ring are emitted exactly once, not twice?",
      "options": [
        "Each edge-walk retracts its boundary immediately after emitting its edge, so the next walk starts from the already-shrunken boundary and never re-touches the corner the previous walk ended on",
        "The corners are emitted twice, and a deduplication pass removes the copies — the algorithm allows redundant corner visits during the walks themselves, then filters the output list afterward to strip out any repeated values",
        "A separate visited-set that marks emitted cells — an auxiliary hash set tracks every coordinate already appended to the output, letting each walk check and skip cells it would otherwise re-emit"
      ],
      "answer": 0,
      "explanation": "The boundary-shrinking invariant does it with no auxiliary state: after the top-row walk does `top += 1`, the right-column walk begins at row `top` (now below the top-right corner already emitted). Each shrink hands off a strictly smaller rectangle, so corners are consumed once. No visited-set is needed — that's what keeps it O(1) space."
    }
  ]
}
```
