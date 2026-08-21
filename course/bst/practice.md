---
title: Practice
type: practice
---

## How to practice this module

BST drills reward **the ordering invariant**: validation carries bounds,
kth-smallest reads inorder, insert and delete are walks, and
sorted-array-to-BST balances by mid-splitting. Done when all six show
Solved in the hub.

## Problems

```practice-problems
- slug: validate-binary-search-tree
  pattern: Bound propagation
  difficulty: Medium
  watch_for: Carry (low, high) down the recursion — comparing only against the parent misses ancestor violations
- slug: kth-smallest-element-in-a-bst
  pattern: Inorder count
  difficulty: Medium
  watch_for: Inorder yields sorted order; count down in one pass and stop at zero, or use an explicit stack
- slug: insert-into-a-binary-search-tree
  pattern: Leaf placement walk
  difficulty: Medium
  watch_for: The BST property fixes the insertion point — attach at a null child and return the (possibly new) root
- slug: delete-node-in-a-bst
  pattern: Three-case delete
  difficulty: Medium
  watch_for: Leaf, one child, two children (replace with the inorder successor) — the two-child case is where people leak the tree
- slug: convert-sorted-array-to-bst
  pattern: Mid-split recursion
  difficulty: Easy
  watch_for: Always take the middle element as root so both halves stay balanced; an empty span returns null
- slug: lowest-common-ancestor-of-a-bst
  pattern: Property-guided walk
  difficulty: Medium
  watch_for: If both values sit on one side, go that way; the first node whose value lies between them is the LCA
```
