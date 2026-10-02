# Tries in the lane player

Status: implemented for #76 (stacked on #118, the intervals player)

## 1. Problem

The tries module (6 lessons) needs a prefix tree that grows as words go in, with a walk that reads it:

| Lesson | Needs |
|---|---|
| trie-structure-and-prefix-search | nodes keyed by character, shared prefixes stored once, the end-of-word flag telling a stored word from a prefix in passing (`card` and `cat` stored, `car` walks but is not found) |
| implement-trie | insert (walk, creating what is missing), search (walk, then the flag), startsWith (walk only) |
| design-add-and-search-words | a wildcard that branches to every child, dead branches abandoned, the first success ends the search |
| longest-word-in-dictionary | a walk that only enters nodes whose flag is set |
| word-search-ii | a board and a trie walked in lockstep: a cell visited is a trie edge followed, a letter with no edge prunes the cell, a found word is cleared so it is reported once, and a spent leaf can be removed |
| practice | nothing to draw |

No kit player draws a tree that grows by character with a flag per node and a cursor that walks it.

## 2. Decision: a recording layer on the graph lane, like call trees

A trie is a directed tree, and `calltrees.js` already showed how a tree that grows stays honest under the player's rule
that only items move: run the algorithm first, so the finished tree is known, fix every node's position from it, and
let each node fill its slot when it appears. `kit/tries.js` adds no lane kind. It draws on a `graph` lane:

- **A node shows its letter**, the letter of the edge into it (the lessons' "edges labelled with characters" is the
  same information, and a plate on each edge would need the weight-plate gaps, spreading the tree). The root shows
  `""`, the empty prefix it represents.
- **The end-of-word flag is the node's second line: the word that ends there.** It is text, so it does not rest on
  colour, and it answers the lesson's question directly (is `car` stored? its node has no word under it).
- **The cursor is a mark named `node`**, the variable the lessons' code walks with, gliding under the node it is at.
  The edges from the root to the cursor are drawn as the current path; the fields line spells the prefix so far.
- Children are laid out in letter order (leaves left to right, a parent over the middle of its children), so the same
  words always draw the same tree whatever order they went in.

The tidy layout `calltrees.js` had is moved to `graphs.js` (`graphTreeLayout`), and both players use it.

## 3. The trace

`new TrieTrace()` is the trie itself: the lesson's real algorithm walks it with `child(ch)` (a lookup, no step) and
records what it does, one step per call, each with its caption and optional data for the lesson's other lanes:

| Call | Step |
|---|---|
| `make(ch)` | a new child of the cursor, and the cursor moves into it |
| `go(id)` | the cursor moves to an existing child |
| `miss(ch)` | the cursor has no child `ch`. The step lights the node and changes no state: in Word Search II a node that misses one neighbour's letter may still go on by another's. A branch is marked a dead end only when the walk leaves it (`back(true)`) |
| `end(word)` / `unend()` | set or clear the word on the cursor's node (the flag) |
| `found()` | the query succeeds at the cursor |
| `back(dead)` | the cursor returns to the parent; the node it left is a dead end or explored |
| `drop()` | the cursor's node, a leaf with no word, is removed and the cursor returns to the parent |
| `reset()` | a new query: every state is cleared and the cursor is at the root |

A node's state is one of `path` (on the walk, `cur`), `found` (`good`), `dead` (`bad`), `explored` (`dim`) or none.
A node where a query succeeded stays `found` after the walk leaves it, until a reset.

Refused while recording, so nothing draws wrong or nothing: `go` to a node that is not a child of the cursor, `make`
of a letter the cursor already has, `back` at the root, `drop` of the root, of a node with children or with a word,
a letter that is not one character, and walking from a removed node.

## 4. Seek safety

The picture after k steps is a pure function of the first k (`trieState`). `trieWalk` records the steps by driving the
lane with its own operations (`put`, `link`, `edge`, `tone`, `set`, `clear`, `unlink`, `mark`), then reads every
snapshot back (`trieRead`, which sees only the snapshot) and throws when the two disagree. The kit test does the same
against a reference written in the test, on random traces read in random order, and plants faults to show the check
fails. Each specimen walkthrough checks its answer against an implementation that shares none of its code (a set of
words, a brute-force match, a search of the board per word).

Invariants shown in the player (`TRIE_INV`): the current edges form one chain from the root to the cursor; every node
but the root has exactly one edge into it; no two children of a node share a letter.

## 5. Where the code goes

`kit/tries.js`, `KIT_DEPS.tries = ["player", "lanes", "graphs"]`, shipped only when a lesson names `new TrieTrace(`,
`trieWalk(` or `mountTrieTabs(`. A board for Word Search II is an ordinary grid lane passed in `o.lanes` and driven
from `o.on`, so a lesson that pairs them ships `grids.js` too by naming `kind:'grid'`.

The kit-players specimen gains a "Tries" section with three tabs: insert and search (`card`, `cat`, then `car`, `card`
and the prefix `ca`, as the structure lesson walks it), wildcard search (`.ot` over `bad`, `bat`, `cot`, a dead branch
before the match) and Word Search II on a small board.

## 6. What it does not do

- **Deleting a word** as its own operation (clearing the flag, then removing leaves upward) is `unend` plus `drop`
  steps; there is no single call for it.
- **Tries too wide to read.** One leaf per column; a trie of more than about a dozen leaves scrolls sideways in the
  stage, as every wide lane does. The lessons use small word lists.
- **Compressed (radix) tries**, where an edge carries a string, are not drawn.
