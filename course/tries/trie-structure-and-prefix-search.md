---
title: Trie Structure & Prefix Search
type: concept
---

## The question this structure answers

A hash set answers **"is this exact string in the collection?"** in O(1)
average — Module 6 built the machine and proved the bound. So why does
this course need another string structure at all?

Because a hash set answers exactly one question, and a large class of
real problems ask a different one: **"is any stored word a prefix of —
or extended by — this string?"** Autocomplete needs every word starting
with `"pre"`. A spell-checker walks a word character by character,
asking at each step "could anything still match?" A router matches the
longest stored prefix of an address. None of these is an *exact-match*
query, and the hash set has nothing to offer them.

Watch it fail concretely. You store `n` words in a hash set and ask
"does any word start with `pre`?" The hash of `"pre"` tells you whether
`"pre"` itself is stored — nothing more. `"prefix"` and `"pretend"`
hashed to unrelated slots; the set has scattered them deliberately (that
scattering is *why* lookup is O(1)). To answer the prefix question you
must examine **every** entry and test whether it begins with `"pre"` —
O(n·L) work, where L is the average word length, for a single query. The
very property that makes a hash set fast for exact match — no
relationship between the slots of related keys — is what makes it
useless for prefixes.

A **trie** (from re*trie*val; usually said "try") is the structure that
keeps related keys *related*, so a prefix query touches only the prefix.

## The mechanics: one node per character position

A trie is a tree in which **edges are labeled with characters** and a
path from the root spells out a string. Every node represents the prefix
you get by concatenating the edge labels from the root down to it. Two
words that share a prefix share the *same* nodes for that prefix, then
branch:

```diagram
{
  "id": "trie-branches"
}
```

Here `car`, `card`, `cat`, and `cats` all descend through the shared
`c → a` spine before splitting. The trie physically stores the shared
prefix `ca` exactly once.

Two facts pin down the design:

- **Each node holds a set of children keyed by character.** From a node
  representing `"ca"`, the edge labeled `r` leads to the `"car"` node and
  the edge labeled `t` leads to the `"cat"` node. A node needs to look up
  a child *by its character*, so children is a map from character to
  child node (or an array indexed by character — the trade-off below).
- **Each node carries an `is_end_of_word` flag.** The path spelling
  `"car"` exists *because* `"card"` is stored — but is `"car"` itself a
  stored word? The tree shape alone cannot say. A boolean at each node
  records "a word ends exactly here." Without it a trie could not
  distinguish a *stored word* from a *prefix that merely happens to lie
  on the way to a longer word* — and that distinction is the whole point
  of the last two problems in this module.

The root represents the empty prefix `""` and stores no character; its
children are the valid first letters of stored words.

## The three operations, and why their cost is what it is

Every operation is a **walk down from the root**, consuming the query
string one character at a time. That single shape determines all three
complexities.

**Insert** walks the string; at each character it follows the matching
child edge, *creating* the node if it doesn't yet exist; at the end it
sets `is_end_of_word`. It touches one node per character, so inserting a
word of length L is **O(L)** — and, crucially, O(L) *regardless of how
many words are already stored*. The tree gets wider, never slower to
descend.

**Search** (exact match) walks the string the same way, but never
creates: if an edge is missing mid-walk, the word isn't present. If the
walk completes, the answer is precisely the `is_end_of_word` flag at the
final node — reaching a node is not enough, it must be *marked*. Also
**O(L)**.

**starts_with** (the prefix query) is search without the final flag
check: walk the prefix; if every edge exists, *something* is stored that
begins this way (some descendant is marked, or the prefix is itself a
word). **O(L) in the length of the prefix** — and this is the payoff.
Answering "does any word start with `pre`?" costs three edge-walks. It
does **not** depend on n, the number of stored words, at all. Contrast
the hash set's O(n·L) scan: the trie replaced a factor of n with nothing
by keeping shared prefixes physically shared.

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
        for ch in word:                       # one step per character
            if ch not in node.children:
                node.children[ch] = TrieNode()  # create missing edge
            node = node.children[ch]
        node.is_end_of_word = True            # mark the terminal node

    def search(self, word: str) -> bool:
        node = self._walk(word)
        return node is not None and node.is_end_of_word  # must be MARKED

    def starts_with(self, prefix: str) -> bool:
        return self._walk(prefix) is not None  # reaching the node suffices

    def _walk(self, s: str) -> "TrieNode | None":
        node = self.root
        for ch in s:
            if ch not in node.children:
                return None                   # edge missing → not present
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
      // one step per character
      if (!node.children.has(ch)) {
        node.children.set(ch, new TrieNode()); // create missing edge
      }
      node = node.children.get(ch)!;
    }
    node.isEndOfWord = true; // mark the terminal node
  }

  search(word: string): boolean {
    const node = this.walk(word);
    return node !== null && node.isEndOfWord; // must be MARKED
  }

  startsWith(prefix: string): boolean {
    return this.walk(prefix) !== null; // reaching the node suffices
  }

  private walk(s: string): TrieNode | null {
    let node = this.root;
    for (const ch of s) {
      const next = node.children.get(ch);
      if (next === undefined) return null; // edge missing → not present
      node = next;
    }
    return node;
  }
}
```
````

Notice that `search` and `starts_with` differ by exactly one line — the
flag check — because they *are* the same walk asking two different
questions of the node they land on. That is the structural insight the
whole module rests on.

```complexity
{
  "operations": [
    { "name": "insert(word)", "time": "O(L)", "why": "one node visited (and at most one created) per character of the word; independent of how many words are already stored" },
    { "name": "search(word)", "time": "O(L)", "why": "walk L edges, then read one flag; a missing edge ends the walk early" },
    { "name": "starts_with(prefix)", "time": "O(L)", "why": "walk L edges; the answer is whether the walk survived — n never enters the cost, which is the entire reason to prefer a trie here" },
    { "name": "hash set, prefix query", "time": "O(n·L)", "why": "for contrast: the set scatters related keys, so the only way to find prefix matches is to scan and test every one of the n entries" }
  ]
}
```

## The trade-off: a trie can cost more memory, not less

Tries buy prefix speed, and the price is paid in space. Two honest costs:

**Overhead per node.** Every character of every non-shared suffix is its
own node object, each carrying a children container and a boolean. A hash
set stores each word as one flat string with far less per-character
bookkeeping. Only *shared prefixes* save space (stored once instead of
per word); a collection of strings with little prefix overlap can make a
trie consume **more** total memory than the equivalent hash set — you're
paying for pointer-heavy tree structure and getting little sharing back.
A trie is a space win when prefixes are heavily shared and a space *loss*
when they aren't.

**The children container is itself a design choice** with its own
trade-off:

- **Hash map per node** (`dict` / `Map`, as coded above): stores only the
  edges that actually exist. A node with two children holds two entries.
  Access is O(1) *average* (a hash lookup per step), and memory is
  proportional to real branching. This is the safe default and the only
  sane choice for a large or unknown alphabet (full Unicode, arbitrary
  bytes).
- **Fixed array per node** (e.g. `children[26]` for lowercase `a–z`,
  indexing with `ord(ch) - ord('a')`): child access is a raw array index
  — O(1) *worst case*, no hashing, tiny constant, and cache-friendly. The
  cost: **every** node allocates all 26 slots whether or not it uses
  them. A node with one child still reserves 26 pointers; 25 sit empty.
  On a sparse trie that is mostly wasted space, and on a 128- or
  million-symbol alphabet it is fatal.

So the array-vs-map decision is the classic one this course keeps
returning to: **fixed O(1) worst-case access and cache locality, bought
with memory proportional to the alphabet size rather than to the branching
actually present.** For the constrained lowercase-English inputs common in
the following problems the array is often the faster choice; for anything
general, the map. Neither is "the trie" — they are two implementations of
the same tree, and knowing which cost you are paying is the point.

```quiz
{
  "questions": [
    {
      "question": "Why can't a hash set answer \"does any stored word start with 'pre'?\" in O(1), the way it answers \"is 'pre' stored?\" in O(1)?",
      "options": [
        "Hash sets are slower than tries at everything — the underlying hashing computation is a fundamentally more expensive operation than following a pointer edge, which is why tries outperform hash sets across every kind of query",
        "A hash set places each key in a slot derived from the WHOLE key, deliberately unrelating the slots of 'pre', 'prefix', and 'pretend' — so there is no way to find keys sharing a prefix except to scan and test all n of them (O(n·L))",
        "Hash sets can only store fixed-length strings — the fixed-size hash buckets require every key to occupy the same number of bytes, which is incompatible with variable-length prefix queries like this one"
      ],
      "answer": 1,
      "explanation": "The O(1) exact-match speed comes FROM scattering related keys across unrelated slots. That same scattering destroys any locality a prefix query could exploit. A trie makes the opposite choice — shared prefixes share nodes — so the prefix walk costs O(L) and never touches n."
    },
    {
      "question": "Why does a trie need a separate is_end_of_word flag instead of just checking whether a node exists?",
      "options": [
        "The flag is an optimization that can always be omitted — since the tree's shape already encodes every stored word implicitly, the is_end_of_word marker is redundant bookkeeping that a careful implementation could drop entirely",
        "Because storing a longer word (like 'card') creates every node along its path (including the 'car' node), so a node's mere existence can't distinguish a stored word from a prefix that only exists en route to a longer word — the flag records where words actually end",
        "To make deletion faster — the flag exists mainly so that removing a word can quickly identify which nodes are safe to free without walking the whole subtree, a performance concern unrelated to search correctness"
      ],
      "answer": 1,
      "explanation": "Inserting 'card' materializes the 'c', 'ca', 'car', 'card' nodes. If 'car' was never inserted itself, its node still exists but must NOT count as a stored word. search() therefore checks the flag, while starts_with() ignores it — the single-line difference between the two operations."
    },
    {
      "question": "You store one million random 20-character hex strings (almost no shared prefixes). Compared with a hash set, the trie will most likely use:",
      "options": [
        "Exactly the same memory — since both structures ultimately need to store every character of every string somewhere, the total number of bytes required ends up identical regardless of the underlying representation",
        "More memory, because with little prefix sharing almost every character becomes its own node with a children container and flag — you pay full tree overhead and reclaim almost nothing through sharing",
        "Much less memory, because tries always compress strings — a trie's node-sharing mechanism is a general-purpose compression scheme that always reduces total storage, independent of how much the actual input strings happen to overlap"
      ],
      "answer": 1,
      "explanation": "Tries save space only on the prefixes that are actually shared. With near-zero sharing there is nothing to amortize, so the pointer-heavy per-node overhead makes the trie strictly larger than the flat-string hash set. Tries trade memory for prefix-query speed; that trade is bad precisely when prefixes don't overlap."
    }
  ]
}
```
