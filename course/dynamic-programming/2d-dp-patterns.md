---
title: 2D DP Patterns
type: concept
---

## Two different things that both look like a 2D table

A DP table with two indices, `dp[i][j]`, shows up in two structurally
DIFFERENT situations that are easy to conflate because they look
identical on the page. Telling them apart precisely is the whole point
of this lesson; the anchor problems (Unique Paths for the first shape,
Longest Common Subsequence for the second) get full treatment later in
this module, so this lesson stays brief and focuses on the distinction.

## Shape 1: DP over an actual 2D grid

Here `i` and `j` are literally row and column — a real geometric
position. **Unique Paths** (full treatment later): `dp[i][j]` = the
number of ways to reach cell `(i, j)` from the top-left corner, moving
only right or down. Since the last move into `(i, j)` came from either
directly above (`(i-1, j)`) or directly to the left (`(i, j-1)`), and
these are the only two ways to arrive:

```text
dp[i][j] = dp[i-1][j] + dp[i][j-1]
```

The two indices here both describe ONE object's position in space — a
single point on a grid, moving through it over time.

## Shape 2: DP over two separate sequences

Here `i` and `j` are NOT a position in shared space — they're two
INDEPENDENT counters, one into each of two different input sequences.
**Longest Common Subsequence** (full treatment later): `dp[i][j]` = the
length of the longest common subsequence between the first `i`
characters of string A and the first `j` characters of string B. The
recurrence branches on whether the current characters match:

```text
dp[i][j] = dp[i-1][j-1] + 1              if A[i-1] == B[j-1]
dp[i][j] = max(dp[i-1][j], dp[i][j-1])   otherwise
```

There is no "grid" here in any geometric sense — `dp[i][j]` answers a
question about a PAIR of prefixes, one from each string, and the table
is just a convenient way to lay out every such pair's answer so each can
be looked up in O(1) when a larger pair needs it.

## Why the distinction matters

Confusing the two shapes leads to writing the wrong recurrence, because
the SET OF NEIGHBORS a cell depends on is different in each case, even
though "dp[i-1][j]" and "dp[i][j-1]" appear as terms in both:

- **Grid DP:** `dp[i-1][j]` means "the cell directly above" — a real
  spatial neighbor, and the recurrence is about physically possible
  MOVEMENTS between adjacent cells.
- **Two-sequence DP:** `dp[i-1][j]` means "the same prefix of B, but one
  fewer character consumed from A" — there is no movement being
  modeled; it's a bookkeeping index into "how much of A have I
  considered so far," entirely decoupled from B's index except insofar
  as the recurrence's combining rule (match vs. mismatch) links them.

Both shapes share one thing structurally: filling order. In both cases,
`dp[i][j]` depends only on cells with a smaller `i` and/or smaller `j`,
so filling row by row (or column by column), left to right, guarantees
every dependency is ready before it's needed — the same dependency-
ordering discipline used throughout Module 24.

```quiz
{
  "question": "Both Unique Paths and Longest Common Subsequence use a 2D table with recurrences referencing dp[i-1][j] and dp[i][j-1]. What is the concrete, structural difference between what these terms MEAN in each problem, despite looking identical as formulas?",
  "options": [
    "The difference is only that one problem counts paths and the other counts characters, but the table structure is identical in every other respect — since both fill a 2D grid using the same row-by-row, left-to-right traversal order, the only thing that changes between the two problems is what numeric quantity gets stored in each cell",
    "In Unique Paths, i and j are two coordinates of ONE object's position in a real 2D grid, and dp[i-1][j] means a genuine spatial neighbor (the cell above); in Longest Common Subsequence, i and j are two INDEPENDENT counters into two separate strings, and dp[i-1][j] means 'one fewer character considered from string A, same amount from string B' — a bookkeeping relationship with no spatial meaning at all",
    "There is no real difference — both problems are literally the same DP with different variable names, since renaming 'row/column' to 'string A index/string B index' is the only transformation needed to turn one problem into the other"
  ],
  "answer": 1,
  "explanation": "The formulas look alike because both are 2D tables filled by scanning increasing i and j — but what i and j REPRESENT differs completely. Grid DP's two indices describe a single point moving through physical space; two-sequence DP's two indices describe two SEPARATE, independent progress counters, one per string, with no notion of 'movement' between them at all. Recognizing which situation a new problem falls into is what tells you whether 'dp[i-1][j]' should be read as 'the cell above' or as 'one less input consumed from the first sequence.'"
}
```
