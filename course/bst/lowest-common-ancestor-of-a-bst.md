---
title: Lowest Common Ancestor of a BST
type: problem
---

## Problem

Given the `root` of a **binary search tree** and two nodes `p` and `q`
known to exist in it, find their lowest common ancestor (LCA) — the
deepest node that has both `p` and `q` as descendants (a node counts as
a descendant of itself). (LeetCode 235.)

**Examples**

```examples
root = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 8 → 6
root = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 4 → 2
root = [6,2,8,0,4,7,9,null,null,3,5], p = 3, q = 5 → 4
```

```text
      6
     / \
    2   8
   / \  / \
  0  4 7   9
    / \
   3   5
```

```constraint
2 ≤ n ≤ 10⁵ nodes · all values unique · p and q both exist and are distinct
```

## Attempt it first

This is the same question as Module 17's Lowest Common Ancestor of a
Binary Tree, but with one extra fact available: the BST ordering
invariant. That problem needed to search BOTH subtrees at every node,
because a general binary tree gives no way to predict which side `p`
and `q` are on. Before opening anything, work out what the BST
invariant lets you conclude, from a single comparison at the current
node, about which side (or whether *this* node itself) the LCA must be
on — without recursing into both sides to find out.

```sandbox
{
  "id": "lowest-common-ancestor-of-a-bst",
  "fn": {
    "python": "lowest_common_ancestor",
    "javascript": "lowestCommonAncestor"
  },
  "check": "return",
  "shape": {
    "0": "tree",
    "1": "node",
    "2": "node"
  },
  "returns": "tree",
  "starter": {
    "python": "def lowest_common_ancestor(root, p, q):\n    # p and q are nodes in the tree. Return their lowest common ancestor.\n    pass\n",
    "javascript": "function lowestCommonAncestor(root, p, q) {\n  // p and q are nodes in the tree. Return their lowest common ancestor.\n}\n"
  },
  "cases": [
    {
      "args": [
        [
          6,
          2,
          8,
          0,
          4,
          7,
          9,
          null,
          null,
          3,
          5
        ],
        2,
        8
      ],
      "expect": [
        6,
        2,
        8,
        0,
        4,
        7,
        9,
        null,
        null,
        3,
        5
      ]
    },
    {
      "args": [
        [
          6,
          2,
          8,
          0,
          4,
          7,
          9,
          null,
          null,
          3,
          5
        ],
        2,
        4
      ],
      "expect": [
        2,
        0,
        4,
        null,
        null,
        3,
        5
      ]
    },
    {
      "args": [
        [
          6,
          2,
          8,
          0,
          4,
          7,
          9,
          null,
          null,
          3,
          5
        ],
        3,
        5
      ],
      "expect": [
        4,
        3,
        5
      ]
    },
    {
      "args": [
        [
          2,
          1
        ],
        2,
        1
      ],
      "expect": [
        2,
        1
      ]
    },
    {
      "args": [
        [
          6,
          2,
          8,
          0,
          4,
          7,
          9,
          null,
          null,
          3,
          5
        ],
        0,
        5
      ],
      "expect": [
        2,
        0,
        4,
        null,
        null,
        3,
        5
      ]
    },
    {
      "args": [
        [
          6,
          2,
          8,
          0,
          4,
          7,
          9,
          null,
          null,
          3,
          5
        ],
        7,
        9
      ],
      "expect": [
        8,
        7,
        9
      ]
    }
  ]
}
```

````reveal Hint — compare both targets' values against the current node
At any node, compare `p.val` and `q.val` against `node.val`. Three cases:
(1) both `p.val` and `q.val` are LESS than `node.val` → by the BST
invariant, both targets live entirely in the left subtree, so the LCA
must be in the left subtree too — move left, no need to ever look right.
(2) both are GREATER → symmetric, move right. (3) otherwise (one is
less-or-equal and the other is greater-or-equal — including the case
where `node` itself IS `p` or `q`) → `p` and `q` are on different sides
of `node` (or one of them IS `node`), which means `node` is exactly the
point where their paths diverge: `node` is the LCA. Stop.
````

## Contrast with the general binary tree version

Module 17's solution recursed into `root.left` AND `root.right`
unconditionally at every node, because nothing about a general binary
tree tells you in advance which subtree(s) contain `p` and `q` — you
have to search both and combine the results (the "left and right both
non-null → this is the LCA" logic). Here, the BST invariant answers that
question **before recursing at all**, from one comparison: it tells you
definitively which single direction to go, or that you've already
arrived. That collapses the general version's "explore both, then
combine" pattern into "decide a direction, then explore just that one" —
turning an O(n) worst-case search into O(h).

## Solution

`````reveal Solution — walk down, using the invariant to pick a direction
````tabs
```python
def lowest_common_ancestor(
    root: "TreeNode", p: "TreeNode", q: "TreeNode"
) -> "TreeNode":
    node = root
    while True:
        if p.val < node.val and q.val < node.val:
            node = node.left               # both targets are smaller — go left
        elif p.val > node.val and q.val > node.val:
            node = node.right              # both targets are larger — go right
        else:
            return node                    # paths diverge here (or node IS p/q) — this is the LCA
```

```typescript
function lowestCommonAncestor(root: TreeNode, p: TreeNode, q: TreeNode): TreeNode {
  let node = root;
  while (true) {
    if (p.val < node.val && q.val < node.val) {
      node = node.left!; // both targets are smaller — go left
    } else if (p.val > node.val && q.val > node.val) {
      node = node.right!; // both targets are larger — go right
    } else {
      return node; // paths diverge here (or node IS p/q) — this is the LCA
    }
  }
}
```
````

No recursion is even required — this is an iterative walk, one
comparison per step, moving strictly downward. The `else` branch covers
every remaining case at once: `p` and `q` straddling `node` on opposite
sides, OR `node` itself being equal to `p` or `q` (in which case one
"side" condition is false because `node.val` isn't strictly less/greater
than itself) — both correctly resolve to "stop here, this is the LCA,"
matching the general-tree version's base case of `root is p or root is
q` returning immediately.

```complexity
{
  "time": "O(h)",
  "space": "O(1)",
  "why": "Each step moves strictly one level down the tree toward the LCA and never revisits a node, so at most h steps run before hitting the answer. Unlike the general binary tree version's O(n) worst case (which must potentially explore every node since it can't rule out subtrees), the BST invariant lets each step rule out an entire subtree in O(1), and the walk is iterative — no recursion stack — so space is O(1), not O(h)."
}
```
`````

## Variants

- **Lowest Common Ancestor of a Binary Tree** (Module 17): the general
  version this problem specializes — re-reading it side by side makes
  the value of the BST invariant concrete: O(n) worst-case search-both-
  sides collapses to O(h) directed walk.
- **BST Iterator** (not covered): another problem where the ordering
  invariant turns what would be an O(n) general-tree operation into
  something with a tight, structure-derived bound.
- **Insert into a Binary Search Tree** (this module): the same
  "compare against node.val, go left or right, no backtracking" walk
  shape, reused here for search instead of insertion.

```quiz
{
  "question": "The BST version of LCA never recurses into (or even examines) both children of a node — it always commits to exactly one direction, or stops. Why is committing to one direction still guaranteed correct, when the general binary tree version needed to check both sides?",
  "options": [
    "It works because p and q are guaranteed to always be on opposite sides of the root — the problem's constraints promise the two target nodes never both fall in the same subtree of the very first node checked, which is what licenses skipping the other side",
    "The BST invariant guarantees that if both p.val and q.val are less than node.val, BOTH nodes are provably located somewhere in the left subtree (that's what the invariant means), so the right subtree can be ruled out with certainty from the comparison alone — no exploration needed to confirm it",
    "It isn't actually guaranteed correct in all cases — it's a common but occasionally wrong shortcut; on certain tree shapes committing to only one direction can walk past the true LCA without realizing it, though it's rare enough to pass casual testing"
  ],
  "answer": 1,
  "explanation": "The BST invariant isn't just structural bookkeeping — it's a provable guarantee about VALUE placement: every node in a subtree is bounded by its ancestors' comparisons. So 'both p.val and q.val are less than node.val' isn't a heuristic hint that they're probably on the left — it's a certainty, because the invariant guarantees the entire right subtree holds only values greater than node.val, which by hypothesis neither p nor q is. That certainty is exactly what a general binary tree lacks, forcing it to explore both sides to find out."
}
```
