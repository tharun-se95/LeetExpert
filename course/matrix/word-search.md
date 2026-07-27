---
title: Word Search
type: problem
---

## Problem

Given an `m × n` grid of characters `board` and a string `word`, return
`true` if `word` exists in the grid as a path of **adjacent** cells
(horizontally or vertically neighboring — no diagonals), where **the
same cell cannot be used more than once** within a single word.
(LeetCode 79.)

**Examples**

```text
board = [["A","B","C","E"],
         ["S","F","C","S"],
         ["A","D","E","E"]]

word = "ABCCED"  →  true
word = "SEE"     →  true
word = "ABCB"    →  false   (the second B would reuse the first C's cell)
```

**Constraints:** `1 ≤ m, n ≤ 6`, `1 ≤ word.length ≤ 15`.

## Attempt it first

This is a grid DFS like Number of Islands, but the goal is different:
instead of exploring an *entire* connected region once, you're trying
every possible *path* that spells `word`, and abandoning a path the
moment it can't work. That "try a path, and if it fails, undo and try a
different one" shape should sound familiar even before Module 16
(Recursion & Backtracking) formally names it. Before opening anything,
work out: what has to be undone when a path attempt fails, and why does
skipping that step break the *next* attempt, not the current one?


```sandbox
{
  "id": "word-search",
  "fn": { "python": "exist", "javascript": "exist" },
  "check": "return",
  "starter": {
    "python": "def exist(board, word):\n    # Return True if word can be spelled along adjacent, non-reused cells.\n    pass\n",
    "javascript": "function exist(board, word) {\n  // Return true if word can be spelled along adjacent, non-reused cells.\n}\n"
  },
  "cases": [
    {
      "args": [[["A", "B", "C", "E"], ["S", "F", "C", "S"], ["A", "D", "E", "E"]], "ABCCED"],
      "expect": true
    },
    {
      "args": [[["A", "B", "C", "E"], ["S", "F", "C", "S"], ["A", "D", "E", "E"]], "SEE"],
      "expect": true
    },
    {
      "args": [[["A", "B", "C", "E"], ["S", "F", "C", "S"], ["A", "D", "E", "E"]], "ABCB"],
      "expect": false
    },
    { "args": [[["a"]], "a"], "expect": true },
    { "args": [[["a"]], "b"], "expect": false },
    { "args": [[["a", "b"], ["c", "d"]], "abcd"], "expect": false },
    { "args": [[["a", "b"], ["c", "d"]], "acdb"], "expect": true },
    {
      "args": [[["A", "B", "C", "E"], ["S", "F", "E", "S"], ["A", "D", "E", "E"]], "ABCESEEEFS"],
      "expect": true
    }
  ]
}
```

````reveal Hint — mark, recurse, un-mark
You need a way to prevent the current path from reusing a cell — but
unlike Number of Islands, that marking must be **temporary**. If path
attempt #1 marks a cell as used and never un-marks it on failure, path
attempt #2 (which starts from a different cell, or takes a different
turn) will see that cell as permanently blocked, even though attempt #2
never actually visited it. The fix: mark the cell as "in use" right
before recursing into it, and restore it right after that recursive call
returns — regardless of whether it found a match. This exact
choose → explore → unchoose shape is Module 16's backtracking template,
seen here first.
````

## Brute force, for contrast

As with Number of Islands, there isn't a separate weaker tier to contrast
against — depth-first search with backtracking over every possible
starting cell **is** the direct, correct approach; there's no obviously
"naive" first attempt that isn't already this. What's worth ruling out:
generating every possible path of the right length and checking each
against `word` — that's the same algorithm described less efficiently
(it doesn't prune early on a mismatched character, which the DFS below
does implicitly by returning `false` the moment a character fails to
match).

## The insight

A recursive `dfs(r, c, index)` asks: *"can the remainder of `word`,
starting at `word[index]`, be spelled starting from `board[r][c]`?"*

- **Base case (success):** `index == len(word)` — every character has
  already matched on the way in, so the whole word is spelled.
- **Failure conditions, checked before anything else:** out of bounds,
  or `board[r][c] != word[index]` (this character doesn't match — no
  need to look further down this branch at all).
- **Recursive case:** the current cell matches. Temporarily mark it used
  (so the next call can't step back onto it), then try all four
  neighbors for `word[index + 1]`. If *any* neighbor's DFS succeeds,
  this path succeeds — propagate `true` up immediately. Whether it
  succeeded or not, **restore the cell before returning** (the
  "unchoose" step), so that a *different* starting cell's path attempt
  can still use this one.

The outer loop tries every cell in the grid as a possible starting point
for `word[0]`, since the word can start anywhere.

## Solution

`````reveal Solution — DFS with backtracking (mark, recurse, un-mark)
````tabs
```python
def exist(board: list[list[str]], word: str) -> bool:
    rows, cols = len(board), len(board[0])
    DIRS_4 = [(-1, 0), (1, 0), (0, -1), (0, 1)]

    def dfs(r: int, c: int, index: int) -> bool:
        if index == len(word):
            return True                              # every char matched
        if not (0 <= r < rows and 0 <= c < cols):
            return False
        if board[r][c] != word[index]:
            return False                              # mismatch — dead end

        # Choose: temporarily consume this cell so it can't be reused
        # by a deeper call in THIS path.
        original = board[r][c]
        board[r][c] = "#"                              # sentinel, not a letter

        for dr, dc in DIRS_4:
            if dfs(r + dr, c + dc, index + 1):
                board[r][c] = original                 # unchoose before returning
                return True

        # Unchoose: no neighbor completed the word from here — restore
        # the cell so a DIFFERENT path (different start, different turn)
        # can still use it.
        board[r][c] = original
        return False

    for r in range(rows):
        for c in range(cols):
            if dfs(r, c, 0):
                return True
    return False
```

```typescript
function exist(board: string[][], word: string): boolean {
  const rows = board.length;
  const cols = board[0].length;
  const DIRS_4: [number, number][] = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  function dfs(r: number, c: number, index: number): boolean {
    if (index === word.length) return true; // every char matched
    if (r < 0 || r >= rows || c < 0 || c >= cols) return false;
    if (board[r][c] !== word[index]) return false; // mismatch — dead end

    // Choose: temporarily consume this cell so it can't be reused
    // by a deeper call in THIS path.
    const original = board[r][c];
    board[r][c] = "#"; // sentinel, not a letter

    for (const [dr, dc] of DIRS_4) {
      if (dfs(r + dr, c + dc, index + 1)) {
        board[r][c] = original; // unchoose before returning
        return true;
      }
    }

    // Unchoose: no neighbor completed the word from here — restore
    // the cell so a DIFFERENT path (different start, different turn)
    // can still use it.
    board[r][c] = original;
    return false;
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (dfs(r, c, 0)) return true;
    }
  }
  return false;
}
```
````

Notice `board[r][c] = original` appears in **two** places — once right
before an early `return true` (a match was found, but the cell must still
be restored since the *caller's* caller might backtrack further up and
need it), and once at the very end for the failure path. Both are
required; a version that only restores on failure would leave the board
corrupted after a successful search, which matters if `exist` is ever
called again on the same board.

```complexity
{
  "time": "O(m · n · 4^L)",
  "space": "O(L)",
  "why": "The outer loop tries all m·n cells as a starting point. From each, the DFS branches into up to 4 directions at every one of the L = len(word) characters, so a single starting cell's worst-case work is O(4^L) — in practice much less, since a mismatched character prunes a branch immediately rather than exploring all 4^L paths to completion. Space is the recursion depth, which is at most L (the DFS never recurses deeper than the word is long), plus the board is reused as its own visited-marker so no separate O(m·n) structure is needed."
}
```
`````

## Variants

- **Word Search II** (Module 20, Tries): the same grid-backtracking
  shape, but searching for *many* words at once — building a trie from
  the word list first lets a single grid traversal check all words
  simultaneously instead of re-running this DFS once per word.
- **Number of Islands** (previous lesson): the closest sibling — also a
  grid DFS with a "mark visited" step, but that mark is *permanent*
  (each island is only ever counted once), while here it must be
  *temporary* and undone, because the same cell can legitimately appear
  in many different candidate paths across different search attempts.
- **N-Queens** (Module 16): a non-grid-traversal example of the exact
  same choose → explore → unchoose shape, applied to placing queens
  instead of walking cells — worth comparing once you've seen both.

```quiz
{
  "question": "Word Search restores (\"un-marks\") a visited cell after its recursive exploration returns, but Number of Islands never restores a sunk cell. Why is that difference correct, not an inconsistency?",
  "options": [
    "Number of Islands counts each connected component exactly once, so a permanently sunk cell is *supposed* to stay claimed forever; Word Search evaluates many independent candidate paths (different starting cells, different turns) that legitimately need to reuse the same cell across different attempts, so marks must be scoped to a single path attempt and undone afterward",
    "It's an arbitrary implementation choice — both problems could use either strategy; swapping Number of Islands to temporary marks or Word Search to permanent marks would produce equally correct results either way",
    "Restoring is only needed when the search fails, not when it succeeds — once a path successfully spells the word, there's no future attempt left to interfere with, so only the failure branch needs to undo its marks"
  ],
  "answer": 0,
  "explanation": "The two problems ask structurally different questions. Number of Islands asks 'how many distinct connected regions exist' — once a cell is claimed by a region, it's correctly claimed forever. Word Search asks 'does ANY path spell the word' — trying path A from cell X must not prevent path B (a completely different attempt) from also using cell X, so the mark can only last as long as the ONE path currently being explored."
}
```
