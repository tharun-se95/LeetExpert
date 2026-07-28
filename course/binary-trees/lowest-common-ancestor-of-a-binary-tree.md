---
title: Lowest Common Ancestor of a Binary Tree
type: problem
---

## Problem

Given the `root` of a binary tree and two nodes `p` and `q` known to
exist in it, find their **lowest common ancestor (LCA)** — the deepest
node that has both `p` and `q` as descendants (a node is allowed to be a
descendant of itself). This is a general binary tree — **no ordering
invariant**, unlike a BST. (LeetCode 236.)

**Examples**

```text
      3
     / \
    5   1
   / \  / \
  6  2 0   8
    / \
   7   4

LCA(5, 1) = 3      (5 and 1 are in different subtrees of 3)
LCA(5, 4) = 5      (4 is a descendant of 5, so 5 is its own ancestor here)
```

**Constraints:** `2 ≤ n ≤ 10⁵` nodes, all values unique, `p` and `q`
both exist in the tree and are distinct.

## Attempt it first

Without a BST's ordering invariant, you can't decide "go left or go
right" the way Module 18's BST version of this problem will. The only
information available is structural: does a subtree contain `p`, does
it contain `q`, or does it contain both? Before opening anything, work
out what a recursive function `find(node)` should return so that a
parent, given its two children's return values, can determine whether
*it* is the LCA — and try to state the exact condition precisely.

```sandbox
{
  "id": "lowest-common-ancestor-of-a-binary-tree",
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
          3,
          5,
          1,
          6,
          2,
          0,
          8,
          null,
          null,
          7,
          4
        ],
        5,
        1
      ],
      "expect": [
        3,
        5,
        1,
        6,
        2,
        0,
        8,
        null,
        null,
        7,
        4
      ]
    },
    {
      "args": [
        [
          3,
          5,
          1,
          6,
          2,
          0,
          8,
          null,
          null,
          7,
          4
        ],
        5,
        4
      ],
      "expect": [
        5,
        6,
        2,
        null,
        null,
        7,
        4
      ]
    },
    {
      "args": [
        [
          1,
          2
        ],
        1,
        2
      ],
      "expect": [
        1,
        2
      ]
    },
    {
      "args": [
        [
          3,
          5,
          1,
          6,
          2,
          0,
          8,
          null,
          null,
          7,
          4
        ],
        7,
        4
      ],
      "expect": [
        2,
        7,
        4
      ]
    },
    {
      "args": [
        [
          3,
          5,
          1,
          6,
          2,
          0,
          8,
          null,
          null,
          7,
          4
        ],
        6,
        8
      ],
      "expect": [
        3,
        5,
        1,
        6,
        2,
        0,
        8,
        null,
        null,
        7,
        4
      ]
    },
    {
      "args": [
        [
          1,
          2,
          3
        ],
        2,
        3
      ],
      "expect": [
        1,
        2,
        3
      ]
    }
  ]
}
```

````reveal Hint — a node IS the LCA exactly when both searches return non-null
Define `find(node)` to search the subtree rooted at `node` for `p` OR
`q`, returning: `node` itself if `node` is `p` or `q`; otherwise, if
exactly one of the two recursive calls (`find(node.left)`,
`find(node.right)`) returns non-null, propagate that non-null result up
unchanged (it means the target found so far is somewhere in that
subtree, but we haven't yet learned whether the OTHER target is a
sibling ancestor above it); if BOTH recursive calls return non-null,
that means one target was found in the left subtree and the other in
the right subtree — which can only happen if `node` itself is the point
where their paths diverge, i.e. `node` is the LCA. Return `node` in that
case.
````

## The insight

The key realization: `find(node)` returning non-null does **not**
always mean "the LCA is this value" — most of the time it means "I
found `p` or `q` somewhere below, still searching for the other one, so
pass this candidate upward in case an ancestor turns out to have both."
Only the *one* node where left and right BOTH come back non-null is
genuinely the LCA — everywhere else, a non-null return is just relaying
a found target upward, not declaring victory.

This is worth proving, not just coding: suppose `node`'s left subtree
contains `p` and right subtree contains `q` (or vice versa). Then `p`
and `q` are on strictly different sides of `node` — any common ancestor
of both must be at or above `node`, and `node` itself IS a common
ancestor (both are its descendants). Since we want the *lowest* (deepest)
such node, and `node` is the deepest point where the two paths are still
joined before splitting into different subtrees, `node` is exactly the
LCA. This same logic handles the edge case where `p` is an ancestor of
`q` (or vice versa): `find` returns `p` itself as soon as it's reached,
and that value simply propagates up as the answer without either
sibling call also returning non-null.

## Solution

`````reveal Solution — postorder search, node is LCA iff both sides return non-null
````tabs
```python
def lowest_common_ancestor(
    root: "TreeNode | None", p: "TreeNode", q: "TreeNode"
) -> "TreeNode | None":
    if root is None or root is p or root is q:
        return root                       # found a target, or ran off the tree

    left = lowest_common_ancestor(root.left, p, q)
    right = lowest_common_ancestor(root.right, p, q)

    if left is not None and right is not None:
        return root                       # p and q on different sides → this IS the LCA
    return left if left is not None else right  # relay whichever side found something
```

```typescript
function lowestCommonAncestor(
  root: TreeNode | null,
  p: TreeNode,
  q: TreeNode,
): TreeNode | null {
  if (root === null || root === p || root === q) {
    return root; // found a target, or ran off the tree
  }

  const left = lowestCommonAncestor(root.left, p, q);
  const right = lowestCommonAncestor(root.right, p, q);

  if (left !== null && right !== null) {
    return root; // p and q on different sides → this IS the LCA
  }
  return left !== null ? left : right; // relay whichever side found something
}
```
````

The base case does double duty: `root is p or root is q` stops the
search the instant a target is found (no need to search further down —
if this node IS one of the targets, it can't contain the other target
*below* itself and still have this node be the LCA... unless the other
target is one of ITS descendants, which is exactly why we return `root`
here rather than continuing: that return value propagates up and gets
caught by the `left and right both non-null` check at whichever
ancestor is the true LCA). The final line is the "relay" — when only one
side found something, this node isn't the LCA, so hand the finding
upward unchanged.

```complexity
{
  "time": "O(n)",
  "space": "O(h)",
  "why": "Every node is visited at most once in the worst case (both p and q could be at the bottom of the tree, requiring a full traversal to confirm). Space is the recursion stack, O(h) — O(log n) balanced, O(n) skewed, same as every DFS on this data structure."
}
```
`````

## Variants

- **Lowest Common Ancestor of a BST** (Module 18): the same question,
  but the BST's ordering invariant lets the algorithm decide left-or-
  right in O(1) per node instead of exploring both subtrees — an O(h)
  solution built on comparison instead of this O(n) search-both-sides
  approach. Comparing the two side by side is the point of that lesson.
- **Lowest Common Ancestor of a Binary Tree III** (not covered): each
  node additionally has a `parent` pointer — turns the problem into
  finding the intersection of two upward linked lists, structurally
  identical to Module 7's linked-list intersection problem.
- **Path to a target node** (not covered, but implicit here): the
  recursion above never explicitly builds root-to-p and root-to-q paths
  and compares them, but that's an equally valid, more literal approach
  to the same problem — worth trying as an exercise.

```quiz
{
  "question": "find(node) returning a non-null value does not always mean 'this is the LCA.' What does a non-null return actually mean in general, and when specifically does it mean 'this IS the LCA'?",
  "options": [
    "A non-null return always means the current node is the LCA — whenever find(node) comes back non-null to its caller, that alone is sufficient proof that the current node is the deepest common ancestor being searched for",
    "A non-null return generally means 'p or q (or both) was found somewhere in this subtree, relayed upward' — it specifically means 'this node IS the LCA' only at the one node where BOTH the left and right recursive calls independently returned non-null, since that's the unique point where the paths to p and q diverge",
    "A non-null return means p and q are both descendants of the current node — any non-null result guarantees that both target nodes exist somewhere within the current subtree, regardless of which child call produced it"
  ],
  "answer": 1,
  "explanation": "Most non-null returns are just relays — a target was found somewhere below and is being passed up in case an ancestor needs it. The single node that gets non-null from BOTH children is special: it means p is reachable through one side and q through the other, so this node is exactly where their two paths from the root still meet before splitting — the definition of lowest common ancestor. Every other non-null return is passed through unchanged by the 'return left if left else right' line, not treated as a final answer."
}
```
