---
title: Word Search II
type: problem
---

## Problem

Given an `m × n` grid of lowercase letters and a list of `words`, return
every word from the list that can be formed by a path in the grid.
A path steps between **horizontally or vertically adjacent** cells and
may not reuse a cell within a single word.

**Examples**

```examples
board = [["o","a","a","n"],["e","t","a","e"],["i","h","k","r"],["i","f","l","v"]], words = ["oath","pea","eat","rain"] → ["oath","eat"]
```

`oath` traces `o(0,0) → a(0,1) → t(1,1) → h(2,1)`; `eat` traces
`e(1,3) → a(1,2) → t(1,1)`. `"pea"` and `"rain"` have no such path, so
they're excluded.

```constraint
grid up to 12×12; up to 3·10⁴ words, each up to 10 letters, lowercase `a–z`.
```

## Attempt it first

You already know how to check whether **one** word exists in a grid —
that's Word Search (Module 15): a DFS from each cell that walks the grid
following the word's letters, marking cells visited (Module 16's
backtracking) and unmarking on the way back. The obvious approach here is
to run that once per word. Try that first — get it correct — and then ask
the question this whole module has been building toward: **when many
words share prefixes, how much of that per-word DFS work is being
repeated?**

```sandbox
{
  "id": "word-search-ii",
  "fn": {
    "python": "find_words",
    "javascript": "findWords"
  },
  "check": "return",
  "compare": "sorted",
  "starter": {
    "python": "def find_words(board, words):\n    # Return every word that can be traced on the board.\n    pass\n",
    "javascript": "function findWords(board, words) {\n  // Return every word that can be traced on the board.\n}\n"
  },
  "cases": [
    {
      "args": [
        [
          [
            "o",
            "a",
            "a",
            "n"
          ],
          [
            "e",
            "t",
            "a",
            "e"
          ],
          [
            "i",
            "h",
            "k",
            "r"
          ],
          [
            "i",
            "f",
            "l",
            "v"
          ]
        ],
        [
          "oath",
          "pea",
          "eat",
          "rain"
        ]
      ],
      "expect": [
        "oath",
        "eat"
      ]
    },
    {
      "args": [
        [
          [
            "a",
            "b"
          ],
          [
            "c",
            "d"
          ]
        ],
        [
          "abcb"
        ]
      ],
      "expect": []
    },
    {
      "args": [
        [
          [
            "a"
          ]
        ],
        [
          "a"
        ]
      ],
      "expect": [
        "a"
      ]
    },
    {
      "args": [
        [
          [
            "a"
          ]
        ],
        [
          "b"
        ]
      ],
      "expect": []
    },
    {
      "args": [
        [
          [
            "a",
            "b"
          ],
          [
            "c",
            "d"
          ]
        ],
        [
          "ab",
          "cd",
          "ac",
          "abcd",
          "ba"
        ]
      ],
      "expect": [
        "ac",
        "ab",
        "ba",
        "cd"
      ]
    },
    {
      "args": [
        [
          [
            "a",
            "a"
          ]
        ],
        [
          "aaa"
        ]
      ],
      "expect": []
    }
  ]
}
```

````reveal Hint — what does running Word Search 30,000 times waste?
Suppose `words` contains `"aaa"`, `"aab"`, and `"aac"`. Running Word
Search separately for each re-explores every grid path spelling `"aa"`
**three times** — once per word — even though the grid exploration for
`"aa"` is identical each time. The per-word approach is blind to shared
prefixes: it re-walks the shared part of the grid once for every word
that shares it. What structure turns a set of words into their shared
prefixes so you can explore each shared path *once*? That is the trie —
and the move is to walk the grid and the trie **together**.
````

## Brute force, and why it repeats itself

**Run Word Search once per word.** Each call is a DFS from every grid
cell trying to spell that one word: O(m·n · 4^L) in the worst case (from
each of m·n starting cells, up to 4 directions at each of L steps). Total
across the list: **O(W · m·n · 4^L)** for W words. Correct, but it pays
the grid-exploration cost W independent times, sharing nothing. The
concrete waste: two words with a common prefix cause the DFS to walk that
prefix's grid paths once for *each* word, re-deriving the same partial
explorations again and again.

## The insight: walk the grid and a trie in lockstep

Build a trie from all W words **once**. Now do a single DFS over the grid
in which the trie tells you, at every step, whether continuing is
worthwhile:

- Start a DFS from each grid cell, positioned at the **root** of the trie.
- To step from the current cell into a neighbor holding letter `c`, first
  check that the current trie node has a child edge labeled `c`. **If it
  doesn't, no stored word can continue this way — prune the entire branch
  immediately, without exploring it.** This is the payoff: the trie
  vetoes grid paths that no word could complete, so the DFS never wanders
  down them.
- If the edge exists, descend both the grid (into the neighbor) and the
  trie (into that child) in lockstep. Whenever the trie node you land on
  is flagged `is_end_of_word`, you've spelled a complete stored word —
  record it.

Why this beats per-word search: the trie **merges the words by shared
prefix**, so each shared grid path is explored **once**, not once per
word sharing it. And the DFS is driven by *what the grid offers* checked
against *what the trie allows* — it explores each cell's neighborhood a
single time, following only edges that some word could still use, instead
of restarting the whole grid scan for every word in the list. Prefixes
are shared work, and the trie is what makes the sharing structural.

## Solution

`````reveal Solution — one grid DFS, trie-guided, with three refinements
Three details make this both correct and fast:

1. **Store the whole word on its terminal node** (`node.word = word`)
   rather than a bare flag — then when we hit a flagged node during the
   DFS we can emit the word directly, with no reconstruction.
2. **Mark visited cells in place** by overwriting with `#` and restoring
   on the way back (Module 16's choose / unchoose), so no word reuses a
   cell.
3. **De-duplicate and prune found words** by clearing a node's `word`
   after emitting it, so the same word is never added twice from two grid
   paths.

````tabs
```python
class TrieNode:
    def __init__(self) -> None:
        self.children: dict[str, "TrieNode"] = {}
        self.word: str | None = None          # store the word itself at its end

def find_words(board: list[list[str]], words: list[str]) -> list[str]:
    root = TrieNode()
    for word in words:                          # build the trie ONCE
        node = root
        for ch in word:
            if ch not in node.children:
                node.children[ch] = TrieNode()
            node = node.children[ch]
        node.word = word

    rows, cols = len(board), len(board[0])
    found: list[str] = []

    def dfs(r: int, c: int, node: TrieNode) -> None:
        ch = board[r][c]
        child = node.children.get(ch)
        if child is None:                       # trie has no such edge → PRUNE
            return
        if child.word is not None:              # landed on a complete word
            found.append(child.word)
            child.word = None                   # emit once, then clear (dedupe)

        board[r][c] = "#"                        # choose: mark visited
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and board[nr][nc] != "#":
                dfs(nr, nc, child)              # descend grid AND trie together
        board[r][c] = ch                         # unchoose: restore

    for r in range(rows):
        for c in range(cols):
            dfs(r, c, root)                     # every cell is a potential start
    return found
```

```typescript
class TrieNode {
  children: Map<string, TrieNode> = new Map();
  word: string | null = null; // store the word itself at its end
}

function findWords(board: string[][], words: string[]): string[] {
  const root = new TrieNode();
  for (const word of words) {
    // build the trie ONCE
    let node = root;
    for (const ch of word) {
      if (!node.children.has(ch)) node.children.set(ch, new TrieNode());
      node = node.children.get(ch)!;
    }
    node.word = word;
  }

  const rows = board.length;
  const cols = board[0].length;
  const found: string[] = [];

  const dfs = (r: number, c: number, node: TrieNode): void => {
    const ch = board[r][c];
    const child = node.children.get(ch);
    if (child === undefined) return; // trie has no such edge → PRUNE
    if (child.word !== null) {
      found.push(child.word); // landed on a complete word
      child.word = null; // emit once, then clear (dedupe)
    }

    board[r][c] = "#"; // choose: mark visited
    for (const [dr, dc] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc] !== "#") {
        dfs(nr, nc, child); // descend grid AND trie together
      }
    }
    board[r][c] = ch; // unchoose: restore
  };

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      dfs(r, c, root); // every cell is a potential start
    }
  }
  return found;
}
```
````

The single line `child = node.children.get(ch); if child is None: return`
is the entire optimization. It fuses the grid step and the trie step: the
DFS only advances into a neighbor when *some* stored word could still be
spelled by doing so. A grid path that spells `"zx…"` when no word starts
`"zx"` is abandoned after one edge lookup, never explored further.

```complexity
{
  "time": "O(build) + O(m·n · 4·3^(L−1)) grid DFS",
  "space": "O(total characters in words) for the trie, plus O(L) recursion depth",
  "why": "See the reasoning below — the 4·3^(L−1) is the shape of a single grid DFS bounded by the longest word L, and the trie makes the words share that exploration instead of each paying for it."
}
```
`````

## Reading the complexity

**Building the trie** is O(total characters across all words) — each
character of each word is one insert step. This happens once.

**The grid DFS** starts from each of the m·n cells. From a starting cell,
a search path can branch to at most 4 neighbors on the first step and (at
most) 3 thereafter (one neighbor is always the cell you just came from,
already marked `#`), for a path length bounded by the longest word L,
since the trie prunes the moment the spelled prefix leaves the word set.
So a single start explores O(4·3^(L−1)) paths in the worst case, and
across all starts the grid work is **O(m·n · 4·3^(L−1))**.

The key comparison with brute force: that bound has **no factor of W**.
The per-word approach was O(W · m·n · 4^L) — it multiplied the full grid
exploration by the number of words. The trie-guided DFS explores the grid
*once*, letting all W words share the traversal, and uses the trie to
prune the moment a partial path can't extend to any word. When words
share prefixes heavily (the case this module is about), that shared
exploration is exactly the redundant work per-word search was repeating.
The trie converted "re-walk the shared prefix once per word" into "walk
it once."

## Variants

- **Word Search** (Module 15): the W = 1 case — a single word, plain grid
  DFS with backtracking, no trie needed. This problem is that DFS lifted
  to a whole dictionary at once.
- **Module 15 — grid traversal** and **Module 16 — backtracking**: this
  is their direct fusion. The four-direction neighbor loop with bounds
  checks is grid traversal; the mark-`#` / restore pair is the choose /
  unchoose template; the trie is the new ingredient that makes them scale
  to many words.
- **Implement Trie / Add and Search Words** (this module): both build the
  same node structure; here the trie *drives* a search over an external
  structure (the grid) rather than being searched itself.

```quiz
{
  "questions": [
    {
      "question": "Why does building one trie from all the words and running a single grid DFS beat running Word Search (Module 15) separately for each word?",
      "options": [
        "The trie lets the DFS skip the backtracking step entirely — since the trie already encodes which paths are valid, there's no need to mark and later unmark visited cells, removing that whole mechanism from the algorithm",
        "The trie makes each individual grid DFS asymptotically faster than Module 15's — looking up a child in the trie is a faster operation than the character comparison Module 15's single-word DFS performs, speeding up every step of the walk",
        "Per-word search re-explores shared grid paths once for every word that shares that prefix; the trie merges words by prefix so each shared grid path is explored ONCE, and its edges prune any path that no remaining word could complete — removing the factor of W from the grid work"
      ],
      "answer": 2,
      "explanation": "Brute force is O(W · m·n · 4^L): the grid exploration is repeated per word, sharing nothing. The trie-guided DFS is O(m·n · 4·3^(L−1)) for the grid — no W multiplier — because words with common prefixes traverse the shared grid paths together, and a missing trie edge aborts a doomed path after a single lookup."
    },
    {
      "question": "During the DFS, why do we return immediately when node.children.get(ch) is None instead of continuing to explore that neighbor?",
      "options": [
        "Because the cell has already been visited — the missing-child check is really just a secondary visited-cell guard, catching cells that the '#' marking step failed to flag correctly",
        "It prevents the recursion from exceeding the stack limit — returning early here is primarily a safeguard against runaway recursion depth on large grids, rather than a reflection of anything about word validity",
        "A missing trie edge means no stored word has this letter as its next character along the current prefix, so continuing down this grid path can never spell a word in the list — pruning it is the trie's entire contribution, avoiding the blind wandering the per-word DFS does"
      ],
      "answer": 2,
      "explanation": "The trie encodes exactly which prefixes are worth pursuing. If the current node has no edge for the grid letter, every word is off the table down this path, so the DFS abandons it after one O(1) edge check rather than exploring up to 4^remaining more cells. That prune, applied at every step, is why the grid is traversed once instead of once-per-word."
    }
  ]
}
```
