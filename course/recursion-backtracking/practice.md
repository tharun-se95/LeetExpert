---
title: Practice
type: practice
---

## How to practice this module

Backtracking drills reward **the choose-explore-unchoose rhythm**: record at
a complete state, prune early, and always undo. Subsets and permutations
are the pure tree; combination-sum and parentheses add constraints;
palindrome-partitioning and n-queens prune harder. Done when all six show
Solved in the hub.

## Problems

```practice-problems
- slug: subsets
  pattern: Include / exclude tree
  difficulty: Medium
  watch_for: Branch on taking or skipping each element and advance the index; hand each answer a copied list, never a shared one
- slug: permutations
  pattern: Swap-based tree
  difficulty: Medium
  watch_for: Swap, recurse, swap back; a used-index approach must track exactly which positions remain
- slug: combination-sum
  pattern: Unbounded choice tree
  difficulty: Medium
  watch_for: The same candidate may repeat — recurse on the same index after taking; sorting candidates makes the prune sound
- slug: generate-parentheses
  pattern: Count-constrained branching
  difficulty: Medium
  watch_for: Only add ')' when open > close; the two counters prune the tree — never validate the full string afterwards
- slug: palindrome-partitioning
  pattern: Prefix-split tree
  difficulty: Medium
  watch_for: Cut a valid palindrome prefix and recurse on the remainder; reject the branch when the prefix itself is not a palindrome
- slug: n-queens
  pattern: Place + prune board
  difficulty: Hard
  watch_for: Check columns and both diagonals before placing; index arrays by column and diagonal to keep the check O(1)
```
