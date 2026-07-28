---
title: Design Add and Search Words Data Structure
type: problem
---

## Problem

Design a data structure supporting two methods:

- `addWord(word)` — store `word`.
- `search(word)` — return `true` if any stored word *matches* `word`.
  Here `word` may contain the wildcard character `.`, which matches **any
  single letter**.

**Example**

```text
addWord("bad")
addWord("dad")
addWord("mad")
search("pad")   → false
search("bad")   → true
search(".ad")   → true      ← "." matches b, d, or m
search("b..")   → true      ← "b" then any two letters: "bad"
```

**Constraints:** stored words are lowercase `a–z`, 1–25 characters;
search patterns are `a–z` or `.`, 1–25 characters; up to 10⁴ calls.

## Attempt it first

`addWord` is just the trie insert you already wrote — nothing changes
there. The whole problem lives in `search`, and specifically in the `.`.
Try it before reading on, and think hard about this: your trie's walk so
far has always been **deterministic** — at each character there was
exactly one edge to follow, or none. What does a `.` do to that? At a
`.`, *which* child do you descend into?

```sandbox
{
  "id": "design-add-and-search-words",
  "fn": {
    "python": "WordDictionary",
    "javascript": "WordDictionary"
  },
  "class": {
    "python": "WordDictionary",
    "javascript": "WordDictionary"
  },
  "check": "sequence",
  "methods": {
    "addWord": {
      "python": "add_word",
      "javascript": "addWord"
    }
  },
  "starter": {
    "python": "class WordDictionary:\n    def __init__(self):\n        # Build the empty dictionary.\n        pass\n\n    def add_word(self, word):\n        # Store word.\n        pass\n\n    def search(self, word):\n        # Return True if any stored word matches; \".\" matches any letter.\n        pass\n",
    "javascript": "class WordDictionary {\n  constructor() {\n    // Build the empty dictionary.\n  }\n\n  addWord(word) {\n    // Store word.\n  }\n\n  search(word) {\n    // Return true if any stored word matches; \".\" matches any letter.\n  }\n}\n"
  },
  "cases": [
    {
      "construct": [],
      "ops": [
        [
          "addWord",
          [
            "bad"
          ]
        ],
        [
          "addWord",
          [
            "dad"
          ]
        ],
        [
          "addWord",
          [
            "mad"
          ]
        ],
        [
          "search",
          [
            "pad"
          ],
          false
        ],
        [
          "search",
          [
            "bad"
          ],
          true
        ],
        [
          "search",
          [
            ".ad"
          ],
          true
        ],
        [
          "search",
          [
            "b.."
          ],
          true
        ]
      ]
    },
    {
      "construct": [],
      "ops": [
        [
          "search",
          [
            "a"
          ],
          false
        ],
        [
          "search",
          [
            "."
          ],
          false
        ]
      ]
    },
    {
      "construct": [],
      "ops": [
        [
          "addWord",
          [
            "a"
          ]
        ],
        [
          "search",
          [
            "a"
          ],
          true
        ],
        [
          "search",
          [
            "."
          ],
          true
        ],
        [
          "search",
          [
            ".."
          ],
          false
        ],
        [
          "search",
          [
            "a."
          ],
          false
        ]
      ]
    },
    {
      "construct": [],
      "ops": [
        [
          "addWord",
          [
            "ab"
          ]
        ],
        [
          "addWord",
          [
            "ac"
          ]
        ],
        [
          "search",
          [
            "a."
          ],
          true
        ],
        [
          "search",
          [
            "."
          ],
          false
        ],
        [
          "search",
          [
            ".c"
          ],
          true
        ],
        [
          "search",
          [
            ".."
          ],
          true
        ],
        [
          "search",
          [
            "ad"
          ],
          false
        ]
      ]
    },
    {
      "construct": [],
      "ops": [
        [
          "addWord",
          [
            "at"
          ]
        ],
        [
          "addWord",
          [
            "and"
          ]
        ],
        [
          "addWord",
          [
            "an"
          ]
        ],
        [
          "addWord",
          [
            "add"
          ]
        ],
        [
          "search",
          [
            "a"
          ],
          false
        ],
        [
          "search",
          [
            ".at"
          ],
          false
        ],
        [
          "addWord",
          [
            "bat"
          ]
        ],
        [
          "search",
          [
            ".at"
          ],
          true
        ],
        [
          "search",
          [
            "an."
          ],
          true
        ],
        [
          "search",
          [
            "a.d."
          ],
          false
        ],
        [
          "search",
          [
            "b."
          ],
          false
        ],
        [
          "search",
          [
            "a.d"
          ],
          true
        ],
        [
          "search",
          [
            "."
          ],
          false
        ]
      ]
    }
  ]
}
```

````reveal Hint — a wildcard has no single next edge
For a concrete letter, you follow the one matching edge. For `.`, **any**
child could be the right one — `.ad` succeeds through the `b` child
(`bad`), but on a different trie it might only succeed through `m`. You
cannot know in advance which, so you must *try every child* and succeed
if any of them leads to a full match of the rest of the pattern. "Try
every option, recurse on the remainder, succeed if any branch does" is
recursion with branching — the walk stops being a loop and becomes a
DFS.
````

## Brute force, for contrast

Keep all words in a list; on `search`, scan every stored word and test
it against the pattern position by position (letter must match exactly,
`.` matches anything). Correct, and O(n·L) per search — a full pass over
all n words each time. With 10⁴ calls this is the quadratic behavior the
trie exists to avoid on the non-wildcard part. The interesting question
is whether a trie can do better *despite* the wildcard — and it can,
because a `.` only forces branching at the nodes the walk has actually
reached, not across the entire dictionary.

## The insight

For a concrete letter the walk is unchanged: one edge, deterministic,
O(1) per character. A `.` is the only thing that branches. At a `.`,
instead of following one edge you **recurse into every existing child**,
each time trying to match the *rest* of the pattern from that child. If
any child's subtree can complete the match, the answer is `true`; if none
can, `false`.

This is Module 16's choose / explore / unchoose in miniature: at a `.`
you *choose* a child, *explore* the remaining pattern below it, and if
that fails, *unchoose* (return and try the next child). Concrete letters
never branch, so the DFS only fans out at wildcards — the cost is driven
entirely by how many `.` the pattern contains and where they sit.

## Solution

`````reveal Solution — deterministic walk, DFS at each wildcard
`search` is written recursively over `(pattern index, current node)`.
Concrete letters advance down one edge; a `.` loops over `node.children`
and recurses into each. The base case: pattern exhausted → the node must
be flagged.

````tabs
```python
class TrieNode:
    def __init__(self) -> None:
        self.children: dict[str, "TrieNode"] = {}
        self.is_end_of_word: bool = False

class WordDictionary:
    def __init__(self) -> None:
        self.root = TrieNode()

    def add_word(self, word: str) -> None:
        node = self.root
        for ch in word:
            if ch not in node.children:
                node.children[ch] = TrieNode()
            node = node.children[ch]
        node.is_end_of_word = True

    def search(self, word: str) -> bool:
        return self._dfs(word, 0, self.root)

    def _dfs(self, pattern: str, i: int, node: "TrieNode") -> bool:
        if i == len(pattern):
            return node.is_end_of_word          # matched every char → must be a word
        ch = pattern[i]
        if ch == ".":
            for child in node.children.values():  # wildcard: try EVERY child
                if self._dfs(pattern, i + 1, child):
                    return True                 # any branch matching is enough
            return False
        if ch not in node.children:
            return False                        # concrete letter, no edge → dead end
        return self._dfs(pattern, i + 1, node.children[ch])
```

```typescript
class TrieNode {
  children: Map<string, TrieNode> = new Map();
  isEndOfWord = false;
}

class WordDictionary {
  private root = new TrieNode();

  addWord(word: string): void {
    let node = this.root;
    for (const ch of word) {
      if (!node.children.has(ch)) {
        node.children.set(ch, new TrieNode());
      }
      node = node.children.get(ch)!;
    }
    node.isEndOfWord = true;
  }

  search(word: string): boolean {
    return this.dfs(word, 0, this.root);
  }

  private dfs(pattern: string, i: number, node: TrieNode): boolean {
    if (i === pattern.length) {
      return node.isEndOfWord; // matched every char → must be a word
    }
    const ch = pattern[i];
    if (ch === ".") {
      for (const child of node.children.values()) {
        // wildcard: try EVERY child
        if (this.dfs(pattern, i + 1, child)) return true; // any match is enough
      }
      return false;
    }
    const next = node.children.get(ch);
    if (next === undefined) return false; // concrete letter, no edge → dead end
    return this.dfs(pattern, i + 1, next);
  }
}
```
````

Trace `search("b..")` against `{bad, dad, mad}`. Index 0 is `b`: one
edge, descend to the `b` node (deterministic). Index 1 is `.`: the `b`
node's only child is `a`, so recurse there. Index 2 is `.`: the `a`
node's only child is `d`, recurse. Index 3 = length: the `d` node is
flagged (`bad` was added) → `true`. The wildcards branched, but the trie
structure kept each branch narrow — only real edges were tried.

```complexity
{
  "operations": [
    { "name": "addWord(word)", "time": "O(L)", "why": "identical to the plain trie insert — one node per character" },
    { "name": "search, no wildcards", "time": "O(L)", "why": "every character has one edge; the DFS never branches, so it degenerates to the deterministic O(L) walk" },
    { "name": "search, w wildcards", "time": "O(26^w · L) worst case", "why": "each '.' can fan out to up to 26 children, and wildcards compound multiplicatively; see the argument below" },
    { "name": "space", "time": "O(total characters added) + O(L) recursion", "why": "trie storage as before, plus recursion depth bounded by pattern length L" }
  ]
}
```
`````

## Why all-dots is exponential

The complexity claim deserves its argument, because "trie search is
O(L)" no longer holds once wildcards enter.

A concrete letter multiplies the work by 1 — there is exactly one edge to
follow. A `.` multiplies it by up to **26** — the branching factor of the
alphabet — because in the worst case (a densely populated trie) the
current node has a child for every letter and the DFS must try them all.
These multipliers compound: a pattern with `w` wildcards can, in the
worst case, spawn up to 26 branches at the first `.`, 26 again at the
second within each of those, and so on — **26^w** root-to-depth paths
explored, each costing O(L) to walk. Hence **O(26^w · L)**.

The extreme case is a pattern of *all* dots, like `"........"` against a
trie holding every 8-letter string: `w = L`, and the search degenerates
to enumerating essentially the entire trie — O(26^L), exponential in the
pattern length. This is not a flaw in the code; it is intrinsic. `"...."`
is asking "does any 4-letter word exist?", and answering it genuinely
may require visiting every 4-letter path. The trie still helps: it only
ever descends *edges that exist*, so a sparse dictionary branches far
less than 26-way in practice, and any concrete letter in the pattern
collapses that position back to a single deterministic step, pruning
whole subtrees. Wildcards are expensive exactly in proportion to how
little the pattern constrains.

## Variants

- **Implement Trie** (previous problem): this is that trie with `search`
  generalized; `addWord` is unchanged.
- **Module 16 — backtracking**: the wildcard branch is the choose /
  explore / unchoose template applied to trie children — try a child,
  recurse, fall through to the next on failure.
- **Regular-expression matching** (dynamic programming, later module):
  the same "wildcard forces branching" idea, extended to `*`
  (zero-or-more), where the branching also spans *how many* characters to
  consume.

```quiz
{
  "questions": [
    {
      "question": "Why does a concrete letter in the search pattern keep that step O(1), while a '.' can make it branch up to 26 ways?",
      "options": [
        "The '.' is slower only because comparing it to letters takes longer — checking whether a character equals the wildcard symbol involves a marginally more expensive comparison operation than a direct character match",
        "A concrete letter names exactly one edge to follow (or none), so there is a single deterministic next node; a '.' names no specific edge, so every existing child is a candidate and the DFS must try each until one completes the match",
        "Concrete letters are stored differently from wildcards in the trie — the trie maintains two separate storage representations, one optimized for literal characters and a slower one reserved for wildcard matching"
      ],
      "answer": 1,
      "explanation": "Determinism is the whole difference. A letter prunes to one path; a wildcard preserves all of them. That's why cost scales with the number and position of wildcards, not with pattern length alone — and why any concrete letter after a run of dots snaps the search back to a single path."
    },
    {
      "question": "Searching \"......\" (six dots) against a trie of all six-letter lowercase words approaches O(26^6). Why is this exponential blow-up not a bug in the algorithm?",
      "options": [
        "The pattern places no constraints at all, so it literally asks whether ANY six-letter word exists; answering that can genuinely require exploring every six-letter path in the trie, and the code only ever walks edges that actually exist",
        "It is a bug — the DFS should memoize to avoid it — caching previously-explored (index, node) pairs would eliminate the redundant work and bring the search back down to linear time",
        "Using an array instead of a map for children would make it O(L) — swapping the hash-map-based children lookup for a fixed 26-slot array removes the branching cost entirely, collapsing the search back to a single deterministic pass"
      ],
      "answer": 0,
      "explanation": "The cost reflects the question's inherent difficulty, not wasted work. An all-wildcard pattern rules nothing out, so no pruning is possible. The trie still avoids exploring non-existent edges, so a sparse dictionary is far cheaper than the 26^w bound — the bound is the worst case of a fully dense trie."
    }
  ]
}
```
