---
title: Practice
type: practice
---

## How to practice this module

Trie drills reward **shared prefixes**: an edge per character, an end marker
per word. Implement-trie nails insert/search/startsWith; add-and-search adds
wildcards; word-search-ii prunes a board walk with the trie; longest-word
composes both. Done when all four show Solved in the hub.

## Problems

```practice-problems
- slug: implement-trie
  pattern: Insert / walk / end marker
  difficulty: Medium
  watch_for: The end flag separates a word from a prefix — startsWith stops at the path, search requires the marker
- slug: design-add-and-search-words
  pattern: Wildcard DFS
  difficulty: Medium
  watch_for: A '.' must branch over every child; backtrack on mismatch and never prune the branch that might still match
- slug: word-search-ii
  pattern: Trie-pruned board DFS
  difficulty: Hard
  watch_for: Advance the trie node with each board step and cut dead branches; restore the board mark after backtracking
- slug: longest-word-in-dictionary
  pattern: Build and verify prefixes
  difficulty: Medium
  watch_for: A word is valid only if every prefix is a word — insert everything, then pick the longest whose prefixes all exist
```
