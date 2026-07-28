---
title: Longest Word in Dictionary
type: problem
---

## Problem

Given an array of strings `words`, find the **longest** word that can be
"built" one character at a time by other words in `words` — meaning
every proper prefix of the word is *also* present in `words`. If there
are ties for longest, return the lexicographically smallest one. If no
word qualifies, return the empty string. (LeetCode 720.)

**Examples**

```text
words = ["w","wo","wor","worl","world"]
→ "world"     (every prefix — w, wo, wor, worl — is also in words)

words = ["a","banana","app","appl","ap","apply","apple"]
→ "apple"     (a, ap, app, appl, apple all present; "apply" also
               qualifies at length 5, but "apple" < "apply" lexically)
```

**Constraints:** `1 ≤ words.length ≤ 1000`, `1 ≤ words[i].length ≤ 30`,
lowercase letters only.

## Attempt it first

This problem reuses the trie's `is_end_of_word` flag as the entire
constraint check — "every proper prefix is also a complete word" is
literally "every node on the path to this word, except possibly the
word's own final node, has `is_end_of_word = True`." Before opening
anything, think about how you'd walk the trie to find the longest such
"fully-buildable" path, and how you'd break ties toward the
lexicographically smallest word without sorting the whole input first.

```sandbox
{
  "id": "longest-word-in-dictionary",
  "fn": {
    "python": "longest_word",
    "javascript": "longestWord"
  },
  "check": "return",
  "starter": {
    "python": "def longest_word(words):\n    # Return the longest word whose every proper prefix is also in words,\n    # breaking ties lexicographically. \"\" if none qualifies.\n    pass\n",
    "javascript": "function longestWord(words) {\n  // Return the longest word whose every proper prefix is also in words,\n  // breaking ties lexicographically. \"\" if none qualifies.\n}\n"
  },
  "cases": [
    {
      "args": [
        [
          "w",
          "wo",
          "wor",
          "worl",
          "world"
        ]
      ],
      "expect": "world"
    },
    {
      "args": [
        [
          "a",
          "banana",
          "app",
          "appl",
          "ap",
          "apply",
          "apple"
        ]
      ],
      "expect": "apple"
    },
    {
      "args": [
        [
          "abc"
        ]
      ],
      "expect": ""
    },
    {
      "args": [
        [
          "a"
        ]
      ],
      "expect": "a"
    },
    {
      "args": [
        [
          "a",
          "b",
          "ab",
          "ba"
        ]
      ],
      "expect": "ab"
    },
    {
      "args": [
        [
          "yo",
          "ew",
          "fgerfe",
          "fgerfew",
          "fgerf",
          "fg",
          "f",
          "fger",
          "fgerf"
        ]
      ],
      "expect": "fg"
    }
  ]
}
```

````reveal Hint — DFS the trie, only descending through end-of-word nodes
Insert every word into a trie as usual. Then DFS from the root,
descending into a child ONLY IF that child is itself flagged
`is_end_of_word` — a child that isn't a complete word breaks the
"buildable one character at a time" chain, so there's no point
exploring past it (this is a direct pruning application: an invalid
prefix means every longer word through it is automatically invalid
too). Track the best (longest, then lexicographically smallest)
complete word found during the walk. Visiting a trie's children in
sorted character order during the DFS handles the tie-break naturally,
since the first path reaching a given depth in sorted-child-order is
already the lexicographically smallest at that depth.
````

## Brute force, for contrast

For every word, check whether ALL of its proper prefixes are also
present in `words`, using a hash set for O(1) prefix membership tests,
then track the best qualifying word by (length, lexicographic order):

````tabs
```python
def longest_word_bruteforce(words: list[str]) -> str:
    word_set = set(words)
    best = ""
    for word in words:
        if all(word[:i] in word_set for i in range(1, len(word))):
            if len(word) > len(best) or (len(word) == len(best) and word < best):
                best = word
    return best
```

```typescript
function longestWordBruteforce(words: string[]): string {
  const wordSet = new Set(words);
  let best = "";
  for (const word of words) {
    let allPrefixesPresent = true;
    for (let i = 1; i < word.length; i++) {
      if (!wordSet.has(word.slice(0, i))) {
        allPrefixesPresent = false;
        break;
      }
    }
    if (allPrefixesPresent) {
      if (word.length > best.length || (word.length === best.length && word < best)) {
        best = word;
      }
    }
  }
  return best;
}
```
````

For a word of length `L`, checking all its prefixes costs O(L²) (L
prefixes, each an O(L) substring-and-hash operation) — over all `n`
words this is O(n · L²) in the worst case, since string slicing and
hashing aren't free. Correct, but this repeats work: many words share
long common prefixes, and each shares those prefixes' membership checks
independently rather than reusing a single shared walk.

## The insight

A trie makes "is this prefix present" a byproduct of the tree's shape
rather than a repeated hash lookup — walking one edge deeper IS checking
the next-longer prefix, and the walk is shared across every word with a
common prefix (they literally pass through the same nodes). Insert
every word, then DFS from the root: a subtree is only worth exploring if
the path to it so far represents a chain of complete words, which is
exactly "every node visited on the way down (except the very root) has
`is_end_of_word = True`." The instant that's false, prune — nothing
deeper in that subtree can qualify either, since the chain is already
broken. Handling the lexicographic tie-break by visiting children in
sorted order (rather than sorting candidates after the fact) means the
first longest word discovered during the walk is guaranteed to already
be the lexicographically smallest one at that length.

## Solution

`````reveal Solution — build the trie, then DFS pruning on the end-of-word flag
````tabs
```python
class TrieNode:
    def __init__(self) -> None:
        self.children: dict[str, "TrieNode"] = {}
        self.is_end_of_word: bool = False

def longest_word(words: list[str]) -> str:
    root = TrieNode()
    for word in words:
        node = root
        for ch in word:
            if ch not in node.children:
                node.children[ch] = TrieNode()
            node = node.children[ch]
        node.is_end_of_word = True

    best = [""]

    def dfs(node: "TrieNode", path: str) -> None:
        if len(path) > len(best[0]) or (len(path) == len(best[0]) and path < best[0]):
            best[0] = path
        for ch in sorted(node.children):          # sorted → smallest-first tie-break
            child = node.children[ch]
            if child.is_end_of_word:               # PRUNE: chain broken otherwise
                dfs(child, path + ch)

    dfs(root, "")
    return best[0]
```

```typescript
class TrieNode {
  children: Map<string, TrieNode> = new Map();
  isEndOfWord = false;
}

function longestWord(words: string[]): string {
  const root = new TrieNode();
  for (const word of words) {
    let node = root;
    for (const ch of word) {
      if (!node.children.has(ch)) node.children.set(ch, new TrieNode());
      node = node.children.get(ch)!;
    }
    node.isEndOfWord = true;
  }

  let best = "";

  function dfs(node: TrieNode, path: string): void {
    if (path.length > best.length || (path.length === best.length && path < best)) {
      best = path;
    }
    const sortedChars = [...node.children.keys()].sort(); // smallest-first tie-break
    for (const ch of sortedChars) {
      const child = node.children.get(ch)!;
      if (child.isEndOfWord) {
        // PRUNE: chain broken otherwise
        dfs(child, path + ch);
      }
    }
  }

  dfs(root, "");
  return best;
}
```
````

Note the root itself is never checked against `is_end_of_word` (the
empty string isn't a candidate answer, and `path = ""` starts every walk
without needing that flag) — the flag check happens on each CHILD before
recursing into it, which is what enforces "every step of the way down
must itself be a complete word." Visiting `sorted(node.children)` means
that among several children that all lead to equally-long qualifying
words, the alphabetically-first branch is explored (and therefore
recorded into `best`) first — and since ties only update `best` when
strictly better (`path < best[0]`), the alphabetically smaller one that
was found first is correctly kept.

```complexity
{
  "time": "O(n · L) for building, O(total characters) for the DFS, with a sort of at most 26 children per node",
  "space": "O(n · L) worst case",
  "why": "Building the trie visits every character of every word once, O(total characters) = O(n · L) where L is average word length. The DFS visits each trie node at most once (bounded by total characters inserted, since nodes aren't shared beyond common prefixes), and sorting a node's children costs O(c log c) where c ≤ 26 — a constant, contributing at most a constant multiplicative factor. Space is dominated by the trie itself, O(total characters) in the worst case of no shared prefixes."
}
```
`````

## Variants

- **Trie Structure & Prefix Search** (concept lesson, this module): this
  problem is a direct payoff of the concept lesson's `is_end_of_word`
  design — here that single flag encodes the entire "buildable"
  constraint, with no extra state needed anywhere in the trie.
- **Implement Trie** (this module): the exact insert/walk machinery
  reused here verbatim; this problem only adds the pruned DFS on top.
- **Longest Word in Dictionary through Deleting** (LeetCode 524, not
  covered): a similarly-named but structurally different problem — no
  trie involved, it's a subsequence-matching question instead.

```quiz
{
  "question": "The DFS only recurses into a child node if that child is flagged is_end_of_word. Why is this check sufficient to guarantee that any word the DFS eventually records as a candidate has ALL of its proper prefixes present in the dictionary, not just its immediate parent prefix?",
  "options": [
    "It isn't sufficient on its own — the solution also needs a separate pass checking every prefix explicitly; without that extra verification step, the DFS alone could still record a word whose prefixes were never actually validated",
    "Because words in the input are guaranteed to be prefix-complete by the problem's constraints, making the check redundant — the problem statement promises every word already satisfies the buildable property, so the check is really just a defensive formality",
    "Because the DFS only ever reaches a given depth by passing through every ancestor node along the path from the root, and the is_end_of_word check is applied at EVERY one of those steps before descending further — so a path only survives to depth k if every one of its k prefixes, not just the immediate one, passed the check"
  ],
  "answer": 2,
  "explanation": "The check isn't applied once at the end — it's applied at every single edge traversed during the walk down from the root. To reach depth k at all, the DFS must have already passed the is_end_of_word check at depth 1, depth 2, ..., depth k-1 as prerequisites for even being at depth k. This is the same 'prune the moment a chain breaks, not after' discipline used throughout this module — checking incrementally at construction time is what makes the single per-step check equivalent to validating the whole prefix chain."
}
```
