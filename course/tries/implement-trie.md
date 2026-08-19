---
title: Implement Trie (Prefix Tree)
type: problem
---

## Problem

Implement a `Trie` class with three methods:

- `insert(word)` — add `word` to the trie.
- `search(word)` — return `true` if `word` was inserted (exactly), else
  `false`.
- `startsWith(prefix)` — return `true` if any inserted word begins with
  `prefix`, else `false`.

**Examples**

```examples
insert("apple"), search("apple") → true
search("app") → false  ("app" was never inserted as a word)
startsWith("app") → true  (but apple starts with "app")
insert("app"), search("app") → true  (now it has been)
```

```constraint
words and prefixes are lowercase English letters, 1–2000 characters; up to 3·10⁴ calls total across the three methods.
```

## Attempt it first

This is the concept lesson made into an interface — build it yourself
before reading on. The one thing to get exactly right is the difference
between `search` and `startsWith`: the `search("app") → false` line in
the example above is the entire test. If your `search` returns `true`
for `"app"` after only `"apple"` was inserted, you've forgotten the
`is_end_of_word` flag. Write all three methods and trace that example by
hand.

```sandbox
{
  "id": "implement-trie",
  "fn": {
    "python": "Trie",
    "javascript": "Trie"
  },
  "class": {
    "python": "Trie",
    "javascript": "Trie"
  },
  "check": "sequence",
  "methods": {
    "startsWith": {
      "python": "starts_with",
      "javascript": "startsWith"
    }
  },
  "starter": {
    "python": "class Trie:\n    def __init__(self):\n        # Build the empty trie.\n        pass\n\n    def insert(self, word):\n        # Add word to the trie.\n        pass\n\n    def search(self, word):\n        # Return True only if word itself was inserted.\n        pass\n\n    def starts_with(self, prefix):\n        # Return True if any inserted word begins with prefix.\n        pass\n",
    "javascript": "class Trie {\n  constructor() {\n    // Build the empty trie.\n  }\n\n  insert(word) {\n    // Add word to the trie.\n  }\n\n  search(word) {\n    // Return true only if word itself was inserted.\n  }\n\n  startsWith(prefix) {\n    // Return true if any inserted word begins with prefix.\n  }\n}\n"
  },
  "cases": [
    {
      "construct": [],
      "ops": [
        [
          "insert",
          [
            "apple"
          ]
        ],
        [
          "search",
          [
            "apple"
          ],
          true
        ],
        [
          "search",
          [
            "app"
          ],
          false
        ],
        [
          "startsWith",
          [
            "app"
          ],
          true
        ],
        [
          "insert",
          [
            "app"
          ]
        ],
        [
          "search",
          [
            "app"
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
          "startsWith",
          [
            "a"
          ],
          false
        ]
      ]
    },
    {
      "construct": [],
      "ops": [
        [
          "insert",
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
          "startsWith",
          [
            "a"
          ],
          true
        ],
        [
          "search",
          [
            "ab"
          ],
          false
        ],
        [
          "startsWith",
          [
            "ab"
          ],
          false
        ]
      ]
    },
    {
      "construct": [],
      "ops": [
        [
          "insert",
          [
            "apple"
          ]
        ],
        [
          "insert",
          [
            "apple"
          ]
        ],
        [
          "search",
          [
            "apple"
          ],
          true
        ],
        [
          "startsWith",
          [
            "appl"
          ],
          true
        ]
      ]
    },
    {
      "construct": [],
      "ops": [
        [
          "insert",
          [
            "car"
          ]
        ],
        [
          "insert",
          [
            "card"
          ]
        ],
        [
          "search",
          [
            "car"
          ],
          true
        ],
        [
          "search",
          [
            "card"
          ],
          true
        ],
        [
          "search",
          [
            "ca"
          ],
          false
        ],
        [
          "startsWith",
          [
            "ca"
          ],
          true
        ],
        [
          "startsWith",
          [
            "cards"
          ],
          false
        ]
      ]
    }
  ]
}
```

````reveal Hint — what distinguishes the two lookups
Both `search` and `startsWith` walk the query character by character
from the root, following child edges and failing the instant an edge is
missing. They diverge *only* at the end of a successful walk:
`startsWith` is satisfied that the node was reached at all; `search`
additionally demands that node be flagged as the end of a real word.
Factor the shared walk into one helper and the two public methods become
one line each.
````

## Brute force, for contrast

You could back the class with a plain list of inserted words. `insert`
is an append; `search` is `word in words`; `startsWith` scans every
stored word testing `w.startswith(prefix)`. Correct, and instructive
about *why we bother*: `search` and `startsWith` each cost O(n·L) — a
full scan of all n stored words — so a run of 3·10⁴ mixed calls
degrades to quadratic. A hash set fixes `search` (down to O(L)) but
leaves `startsWith` at O(n·L), because — as the concept lesson argued —
a hash set scatters related keys and cannot find prefix matches without
examining all of them. The trie is the structure that makes *all three*
operations O(L).

## The insight

There is no trick beyond the concept lesson: a shared root-anchored walk
serves all three methods. Each character is one edge; `insert` creates
missing edges, the two lookups fail on them. The only piece of state
that carries meaning beyond the tree's *shape* is the per-node
`is_end_of_word` flag, and it exists solely to let `search` reject a
prefix (`"app"`) that lies on the path to a stored word (`"apple"`)
without itself having been inserted.

## Solution

`````reveal Solution — the walk, factored once
The inputs are lowercase `a–z`, so both a hash map and a fixed 26-slot
array are viable for children. We use a map here for clarity and
generality; the "Variants" note below shows the array swap and what it
buys.

````tabs
```python
class TrieNode:
    def __init__(self) -> None:
        self.children: dict[str, "TrieNode"] = {}
        self.is_end_of_word: bool = False

class Trie:
    def __init__(self) -> None:
        self.root = TrieNode()

    def insert(self, word: str) -> None:
        node = self.root
        for ch in word:
            if ch not in node.children:
                node.children[ch] = TrieNode()
            node = node.children[ch]
        node.is_end_of_word = True

    def search(self, word: str) -> bool:
        node = self._walk(word)
        return node is not None and node.is_end_of_word

    def starts_with(self, prefix: str) -> bool:
        return self._walk(prefix) is not None

    def _walk(self, s: str) -> "TrieNode | None":
        node = self.root
        for ch in s:
            if ch not in node.children:
                return None
            node = node.children[ch]
        return node
```

```typescript
class TrieNode {
  children: Map<string, TrieNode> = new Map();
  isEndOfWord = false;
}

class Trie {
  private root = new TrieNode();

  insert(word: string): void {
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
    const node = this.walk(word);
    return node !== null && node.isEndOfWord;
  }

  startsWith(prefix: string): boolean {
    return this.walk(prefix) !== null;
  }

  private walk(s: string): TrieNode | null {
    let node = this.root;
    for (const ch of s) {
      const next = node.children.get(ch);
      if (next === undefined) return null;
      node = next;
    }
    return node;
  }
}
```
````

Trace the example: `insert("apple")` lays down `a→p→p→l→e` and marks
`e`. `search("apple")` walks all five edges and finds the flag: `true`.
`search("app")` walks three edges, lands on the second `p` node — which
exists but is *not* flagged (only `e` was) — so `false`. `startsWith("app")`
walks the same three edges and, reaching the node, returns `true`. That
single unflagged node is the whole problem.

```complexity
{
  "operations": [
    { "name": "insert(word)", "time": "O(L)", "why": "L = word length; one node visited and at most one created per character — no dependence on the number of words already inserted" },
    { "name": "search(word)", "time": "O(L)", "why": "walk L edges, then read one boolean; a missing edge returns early" },
    { "name": "startsWith(prefix)", "time": "O(L)", "why": "identical walk, minus the final flag check; the survival of the walk IS the answer" },
    { "name": "space", "time": "O(total characters inserted)", "why": "worst case each character of each word is its own node; shared prefixes collapse to shared nodes, so overlapping words cost less than that bound" }
  ]
}
```
`````

Each method's cost is read directly off its loop: the body runs once per
character of the argument and does O(1) work per step (a map lookup, an
optional insert, a flag read). There is no hidden n. That absence — cost
in L, not in the collection size — is precisely what a list or hash set
could not deliver for `startsWith`.

## Variants

- **Array-backed children** (concept lesson's trade-off): since inputs
  are `a–z`, replace each node's map with `children: list[TrieNode |
  None]` of length 26, indexing by `ord(ch) - ord('a')`. Access becomes
  a worst-case-O(1) array index with no hashing and better cache
  behavior, at the cost of 26 slots per node regardless of branching.
  Same asymptotics, different constants and memory profile.
- **Design Add and Search Words** (next problem): generalizes `search`
  to allow a `.` wildcard, which forces the deterministic single-path
  walk to branch into a DFS over children.
- **Word Search II** (this module's capstone): uses exactly this trie as
  the driver for a grid DFS, walking the trie and the grid in lockstep.

```quiz
{
  "question": "After only insert(\"apple\"), why does search(\"app\") correctly return false even though the walk for \"app\" completes successfully and lands on a real node?",
  "options": [
    "Completing the walk only proves the path exists; \"app\" was never inserted, so the node it lands on has is_end_of_word = false — search demands the flag, startsWith does not, and that flag is the sole difference between the two methods",
    "The walk for \"app\" actually fails on a missing edge — since \"apple\" was inserted, the second 'p' node was never actually created, so the walk silently stops partway through and search correctly reports false for that reason",
    "search re-inserts the word and checks a counter — the method temporarily inserts the queried word, checks whether doing so increments an internal occurrence counter, and rolls back the insertion before returning the result"
  ],
  "answer": 0,
  "explanation": "Inserting \"apple\" materializes the nodes for a, ap, app, appl, apple but flags only the last. The \"app\" node exists purely as a stepping stone. search returns node.is_end_of_word (false); startsWith returns node != null (true). Same walk, one extra check — the reason the flag exists."
}
```
