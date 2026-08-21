---
title: Practice
type: practice
---

## How to practice this module

Tree drills reward **choosing the traversal that carries the answer**: depth
and diameter are bottom-up returns, level-order is a BFS queue,
reconstruction splits by the inorder root, and LCA combines both. Done when
all seven show Solved in the hub.

## Problems

```practice-problems
- slug: maximum-depth-of-binary-tree
  pattern: Bottom-up height
  difficulty: Easy
  watch_for: Base null -> 0; height = 1 + max(left, right) — count nodes or edges consistently
- slug: diameter-of-binary-tree
  pattern: Post-order + global
  difficulty: Easy
  watch_for: The diameter can skip the root — track the max left+right path anywhere in the tree, not just at the root
- slug: binary-tree-level-order-traversal
  pattern: BFS level drain
  difficulty: Medium
  watch_for: Drain exactly size nodes per level; a single queue plus per-level sizing is the whole technique
- slug: construct-binary-tree-from-preorder-and-inorder
  pattern: Split by inorder root
  difficulty: Medium
  watch_for: Preorder gives the root, inorder tells the split — recurse by index spans (lengths), never by global positions
- slug: lowest-common-ancestor-of-a-binary-tree
  pattern: Post-order presence
  difficulty: Medium
  watch_for: If left and right both report a target, this node is the LCA; otherwise propagate whichever side found one
- slug: binary-tree-right-side-view
  pattern: BFS rightmost per level
  difficulty: Medium
  watch_for: Record the last node of each level; a depth-first visit also works if you overwrite the slot per depth
- slug: serialize-and-deserialize-binary-tree
  pattern: Preorder with nulls
  difficulty: Hard
  watch_for: Emit a marker for null children so the shape is recoverable — a value-only stream loses structure
```
