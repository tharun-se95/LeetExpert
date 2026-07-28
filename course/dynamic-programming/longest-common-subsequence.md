---
title: Longest Common Subsequence
type: problem
---

## Problem

Given two strings `text1` and `text2`, return the length of their
longest common subsequence (a subsequence need not be contiguous, but
must preserve relative order) — or `0` if they share none.
(LeetCode 1143.)

**Examples**

```text
text1 = "abcde", text2 = "ace"  →  3    ("ace" is a subsequence of both)
text1 = "abc",   text2 = "def"  →  0    (no common subsequence at all)
```

**Constraints:** `1 ≤ text1.length, text2.length ≤ 1000`.

## Attempt it first

This is the canonical two-sequence 2D DP from the 2D DP Patterns concept
lesson — `dp[i][j]` is NOT a grid position, it's a pair of independent
progress counters, one into each string. Before opening anything, define
`dp[i][j]` = the LCS length considering only the first `i` characters of
`text1` and the first `j` characters of `text2`, and work out the TWO
cases the recurrence must handle: what happens when `text1[i-1] ==
text2[j-1]` (the two strings' NEXT characters happen to match), and what
happens when they don't.

```sandbox
{
  "id": "longest-common-subsequence",
  "fn": {
    "python": "longest_common_subsequence",
    "javascript": "longestCommonSubsequence"
  },
  "check": "return",
  "starter": {
    "python": "def longest_common_subsequence(text1, text2):\n    # Return the length of the longest common subsequence.\n    pass\n",
    "javascript": "function longestCommonSubsequence(text1, text2) {\n  // Return the length of the longest common subsequence.\n}\n"
  },
  "cases": [
    {
      "args": [
        "abcde",
        "ace"
      ],
      "expect": 3
    },
    {
      "args": [
        "abc",
        "def"
      ],
      "expect": 0
    },
    {
      "args": [
        "abc",
        "abc"
      ],
      "expect": 3
    },
    {
      "args": [
        "a",
        "a"
      ],
      "expect": 1
    },
    {
      "args": [
        "a",
        "b"
      ],
      "expect": 0
    },
    {
      "args": [
        "bsbininm",
        "jmjkbkjkv"
      ],
      "expect": 1
    },
    {
      "args": [
        "oxcpqrsvwf",
        "shmtulqrypy"
      ],
      "expect": 2
    }
  ]
}
```

````reveal Hint — matching characters extend a diagonal; mismatches take the best of two options
**If `text1[i-1] == text2[j-1]`:** this character can be part of the
common subsequence — extend the best LCS found using one FEWER
character from EACH string: `dp[i][j] = dp[i-1][j-1] + 1`.

**If they don't match:** this specific pair of characters can't BOTH be
included together right here, so the best you can do is whichever is
better between "drop `text1`'s current character and try again" (`dp[i-1][j]`)
or "drop `text2`'s current character and try again" (`dp[i][j-1]`):
`dp[i][j] = max(dp[i-1][j], dp[i][j-1])`.
````

## Brute force, for contrast

Naive recursion trying both "match" and "skip" possibilities at every
pair of positions:

````tabs
```python
def lcs_bruteforce(text1: str, text2: str, i: int, j: int) -> int:
    if i == len(text1) or j == len(text2):
        return 0
    if text1[i] == text2[j]:
        return 1 + lcs_bruteforce(text1, text2, i + 1, j + 1)
    return max(lcs_bruteforce(text1, text2, i + 1, j),
               lcs_bruteforce(text1, text2, i, j + 1))
```

```typescript
function lcsBruteforce(text1: string, text2: string, i: number, j: number): number {
  if (i === text1.length || j === text2.length) return 0;
  if (text1[i] === text2[j]) {
    return 1 + lcsBruteforce(text1, text2, i + 1, j + 1);
  }
  return Math.max(
    lcsBruteforce(text1, text2, i + 1, j),
    lcsBruteforce(text1, text2, i, j + 1),
  );
}
```
````

This branches into up to 2 recursive calls at every pair `(i, j)`, and
the same `(i, j)` pair is reached via many different orders of
match/skip decisions — overlapping subproblems, exponential without
caching.

## The insight

The recurrence's two cases directly mirror the brute force's two
branches, but a 2D table indexed by `(i, j)` caches every distinct pair
exactly once, collapsing the exponential tree to `O(len(text1) ·
len(text2))` distinct subproblems, each O(1) work beyond its dependency
lookups.

## Solution

`````reveal Solution — tabulated 2D table, filled by increasing i then j
````tabs
```python
def longest_common_subsequence(text1: str, text2: str) -> int:
    m, n = len(text1), len(text2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]   # dp[0][*] and dp[*][0] = 0 (empty prefix)

    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if text1[i - 1] == text2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1           # extend a matched diagonal
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])  # best of dropping either side

    return dp[m][n]
```

```typescript
function longestCommonSubsequence(text1: string, text2: string): number {
  const m = text1.length;
  const n = text2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (text1[i - 1] === text2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1; // extend a matched diagonal
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]); // best of dropping either side
      }
    }
  }

  return dp[m][n];
}
```
````

The table is `(m+1) × (n+1)`, not `m × n` — row 0 and column 0
represent "zero characters considered from this string," an empty
prefix, which by definition shares a 0-length LCS with anything. Every
`dp[i][j]` reads only `dp[i-1][j-1]`, `dp[i-1][j]`, or `dp[i][j-1]` — all
strictly "earlier" in both indices — so filling with `i` and `j`
increasing guarantees every dependency is ready, the standard
dependency-ordering discipline of this module.

```complexity
{
  "time": "O(m · n)",
  "space": "O(m · n), reducible to O(min(m, n))",
  "why": "Every one of (m+1)(n+1) cells is computed once, O(1) work each. Space can be reduced to two rolling rows (or one, with care) since row i only ever reads row i-1 and its own earlier entries — the same rolling-array technique as the Tabulation & Space Optimization concept lesson, though reconstructing the ACTUAL subsequence (not just its length) requires keeping the full table, exactly the trade-off that lesson names."
}
```
`````

## Variants

- **2D DP Patterns** (concept lesson, this module): the exact
  two-sequence shape this problem instantiates, contrasted directly with
  Unique Paths' grid shape.
- **Edit Distance** (next lesson): the natural extension — three
  operations (insert/delete/replace) instead of LCS's implicit two
  (match/skip), worth reading immediately after this one to see how the
  recurrence grows a third case.
- **Longest Palindromic Subsequence** (LeetCode 516, not covered): LCS
  of a string with its own reverse — a clever reduction that turns a
  seemingly different problem into a direct application of this exact
  algorithm.

```quiz
{
  "question": "When text1[i-1] != text2[j-1], the recurrence takes max(dp[i-1][j], dp[i][j-1]) rather than, say, just dp[i-1][j-1]. Why must BOTH dp[i-1][j] and dp[i][j-1] be considered, rather than only dropping one character from just one of the two strings?",
  "options": [
    "A mismatch means these specific two characters can't both be part of the common subsequence together, but it doesn't tell you WHICH string's current character is the 'wrong' one to keep trying with — the true LCS might be found by keeping text1's current character and advancing text2, OR by keeping text2's current character and advancing text1, and only checking both possibilities and taking the better guarantees the optimal answer isn't missed",
    "dp[i-1][j-1] is used instead in the actual correct recurrence, and max(dp[i-1][j], dp[i][j-1]) is a common mistake — the diagonal cell already accounts for both strings having advanced past the mismatched characters, making it the single correct reference rather than a comparison between two options",
    "Only one of the two options is ever actually needed; checking both is a redundant safety measure — since text1 and text2 are processed in a fixed, predictable order, one of the two directions is always guaranteed to be at least as good as the other, making the second check unnecessary"
  ],
  "answer": 0,
  "explanation": "A mismatch at (i-1, j-1) only tells you these two specific characters can't be paired — it says nothing about which string 'should' give up its current character. dp[i-1][j] represents 'ignore text1's current character, keep looking'; dp[i][j-1] represents the symmetric choice for text2. The true optimum could come from either direction depending on what appears later in each string, so both must be computed and compared — taking only one arbitrarily could miss a longer common subsequence achievable via the other path."
}
```
