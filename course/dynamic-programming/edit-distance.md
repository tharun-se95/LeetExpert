---
title: Edit Distance
type: problem
---

## Problem

Given two strings `word1` and `word2`, return the minimum number of
operations to convert `word1` into `word2`, where each operation is one
of: insert a character, delete a character, or replace a character.
(LeetCode 72.)

**Examples**

```text
word1 = "horse", word2 = "ros"    →  3
   (horse → rorse [replace h→r] → rose [delete r] → ros [delete e])

word1 = "intention", word2 = "execution"  →  5
```

**Constraints:** `0 ≤ word1.length, word2.length ≤ 500`.

## Attempt it first

This is the two-sequence 2D DP structural sibling of Longest Common
Subsequence, but with THREE operations available instead of LCS's
implicit two (match or skip). Before opening anything, define
`dp[i][j]` = the minimum edits to convert the first `i` characters of
`word1` into the first `j` characters of `word2`, and work out what
each of the three operations DOES to the indices `i` and `j` — that's
the whole derivation.

````reveal Hint — derive each operation's index effect, then take the min
**If `word1[i-1] == word2[j-1]`:** no edit needed for this pair of
characters — carry forward `dp[i-1][j-1]` unchanged (exactly LCS's match
case, but here it costs 0, not +1, since we're minimizing edits, not
maximizing matches).

**If they differ, three options, each costing 1 edit plus the best
sub-solution for what remains:**
- **Replace** `word1[i-1]` with `word2[j-1]`: both strings advance past
  this position → `dp[i-1][j-1] + 1`.
- **Delete** `word1[i-1]`: `word1` advances past this position, `word2`
  does not → `dp[i-1][j] + 1`.
- **Insert** a character into `word1` matching `word2[j-1]`: `word2`
  advances past this position, `word1` does not (conceptually, the
  inserted character is "free" to place, so only `word1`'s index stays
  put) → `dp[i][j-1] + 1`.

Take the MIN of the three, since any of them is a legal move and you
want the cheapest overall path.
````

## Brute force, for contrast

Naive recursion, trying all three operations at every mismatch:

````tabs
```python
def edit_distance_bruteforce(word1: str, word2: str, i: int, j: int) -> int:
    if i == 0:
        return j                          # insert all remaining word2 characters
    if j == 0:
        return i                          # delete all remaining word1 characters
    if word1[i - 1] == word2[j - 1]:
        return edit_distance_bruteforce(word1, word2, i - 1, j - 1)
    return 1 + min(
        edit_distance_bruteforce(word1, word2, i - 1, j - 1),   # replace
        edit_distance_bruteforce(word1, word2, i - 1, j),       # delete
        edit_distance_bruteforce(word1, word2, i, j - 1),       # insert
    )
```

```typescript
function editDistanceBruteforce(word1: string, word2: string, i: number, j: number): number {
  if (i === 0) return j; // insert all remaining word2 characters
  if (j === 0) return i; // delete all remaining word1 characters
  if (word1[i - 1] === word2[j - 1]) {
    return editDistanceBruteforce(word1, word2, i - 1, j - 1);
  }
  return (
    1 +
    Math.min(
      editDistanceBruteforce(word1, word2, i - 1, j - 1), // replace
      editDistanceBruteforce(word1, word2, i - 1, j), // delete
      editDistanceBruteforce(word1, word2, i, j - 1), // insert
    )
  );
}
```
````

Same overlapping-subproblems story as every DP in this module: the same
`(i, j)` pair is reached through many different combinations of
operations, recomputed from scratch each time without caching.

## The insight

The recurrence caches every distinct `(i, j)` pair exactly once,
collapsing the exponential branching to `O(len(word1) · len(word2))`
distinct subproblems. Structurally this is LCS with a third case added
(replace) and a different cost accounting (count edits, minimize;
instead of count matches, maximize) — worth explicitly comparing the two
recurrences side by side to see how closely related they are.

## Solution

`````reveal Solution — tabulated 2D table with base-case rows/columns for pure insert/delete
````tabs
```python
def min_distance(word1: str, word2: str) -> int:
    m, n = len(word1), len(word2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]

    for i in range(m + 1):
        dp[i][0] = i                      # delete all i characters of word1
    for j in range(n + 1):
        dp[0][j] = j                      # insert all j characters of word2

    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if word1[i - 1] == word2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]                  # no edit needed
            else:
                dp[i][j] = 1 + min(
                    dp[i - 1][j - 1],    # replace
                    dp[i - 1][j],        # delete
                    dp[i][j - 1],        # insert
                )

    return dp[m][n]
```

```typescript
function minDistance(word1: string, word2: string): number {
  const m = word1.length;
  const n = word2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i; // delete all i characters of word1
  for (let j = 0; j <= n; j++) dp[0][j] = j; // insert all j characters of word2

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (word1[i - 1] === word2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]; // no edit needed
      } else {
        dp[i][j] =
          1 +
          Math.min(
            dp[i - 1][j - 1], // replace
            dp[i - 1][j], // delete
            dp[i][j - 1], // insert
          );
      }
    }
  }

  return dp[m][n];
}
```
````

The base-case row and column (`dp[i][0] = i`, `dp[0][j] = j`) are worth
reading concretely: converting `i` characters into an empty string
requires exactly `i` deletions, and converting an empty string into `j`
characters requires exactly `j` insertions — no cleverness available at
the boundary, just the direct cost of doing the only possible thing.

```complexity
{
  "time": "O(m · n)",
  "space": "O(m · n), reducible to O(min(m, n))",
  "why": "Every one of (m+1)(n+1) cells does O(1) work (one comparison, one min over 3 values). Space reduces to two rolling rows via the same technique as LCS, since each row only reads the row directly above and its own earlier entries."
}
```
`````

## Variants

- **Longest Common Subsequence** (previous lesson): the two-case sibling
  this problem extends with a third operation — comparing the two
  recurrences directly is the clearest way to internalize both.
- **Delete Operation for Two Strings** (LeetCode 583, not covered): edit
  distance restricted to ONLY deletions (no insert or replace) — reduces
  directly to `m + n - 2 · LCS(word1, word2)`, an elegant reuse of the
  previous lesson's algorithm rather than a new DP from scratch.
- **One Edit Distance** (LeetCode 161, not covered): a yes/no version
  ("is the edit distance exactly 1"), solvable directly without DP at
  all — a good check that you understand what the DP is actually
  computing, not just how to run it.

```quiz
{
  "question": "In the mismatch case, the 'insert' option is dp[i][j-1] + 1 — word1's index i does NOT decrease, only word2's index j does. Why does inserting a character into word1 correspond to word2's index moving, rather than word1's?",
  "options": [
    "Inserting a new character into word1 (to match word2[j-1]) means that character can be considered 'free' to place at this position and immediately matched — the effect on the REMAINING problem is that word2's next character has now been accounted for, while word1's original i characters are still fully unconsumed and still need to be dealt with, so the recursive subproblem is dp[i][j-1]: same word1 prefix, one less of word2 to match",
    "It's a notational convention with no deeper meaning — either index could be chosen to represent insertion, and dp[i-1][j] would work exactly as well as dp[i][j-1] for tracking the same operation",
    "The insert case actually should reference dp[i+1][j], and dp[i][j-1] is a simplification that happens to give the same answer — the 'correct' formulation looks one step ahead in word1's index, but the simplified dp[i][j-1] form coincidentally produces identical results for this particular recurrence"
  ],
  "answer": 0,
  "explanation": "Each operation's index bookkeeping reflects what's been 'resolved' by that operation. Inserting a character into word1 to match word2[j-1] resolves word2's current character (it's now matched) without consuming anything from word1's original content — so the subproblem shrinks only in j, not i. This is the same index-tracking discipline as the Construct Binary Tree lesson's preorder cursor: each operation advances exactly the counters it actually accounts for, nothing more."
}
```
