---
title: Diameter of Binary Tree
type: problem
---

## Problem

Given the `root` of a binary tree, return the length of its **diameter** —
the number of **edges** on the longest path between *any two nodes* in the
tree. This path may or may not pass through the root.

**Examples**

```text
      1
     / \
    2   3          →  3   (path 4 → 2 → 1 → 3, three edges;
   / \                   or 5 → 2 → 1 → 3)
  4   5

root = [1, 2]      →  1   (the single edge 1 → 2)
```

**Constraints:** 1 ≤ n ≤ 10⁴ nodes.

## Attempt it first

This is the problem where bottom-up recursion first bites back. It *looks*
like maximum depth — and the height recursion from the last lesson is
indeed the engine — but the answer you want and the value each call must
return are **two different things**, and conflating them produces a wrong
answer that passes on small symmetric trees. Try it before revealing.
Specifically, wrestle with this: the longest path *bending* at a node (down
its left, up through the node, down its right) is a great candidate for the
answer — but can a function return that quantity to its parent and have the
parent use it? Work out why not; that dead end is the whole lesson.

```sandbox
{
  "id": "diameter-of-binary-tree",
  "fn": {
    "python": "diameter_of_binary_tree",
    "javascript": "diameterOfBinaryTree"
  },
  "check": "return",
  "shape": {
    "0": "tree"
  },
  "starter": {
    "python": "def diameter_of_binary_tree(root):\n    # Return the number of edges on the longest path between any two nodes.\n    pass\n",
    "javascript": "function diameterOfBinaryTree(root) {\n  // Return the number of edges on the longest path between any two nodes.\n}\n"
  },
  "cases": [
    {
      "args": [
        [
          1,
          2,
          3,
          4,
          5
        ]
      ],
      "expect": 3
    },
    {
      "args": [
        [
          1,
          2
        ]
      ],
      "expect": 1
    },
    {
      "args": [
        [
          1
        ]
      ],
      "expect": 0
    },
    {
      "args": [
        [
          1,
          2,
          null,
          3,
          null,
          4,
          null,
          5
        ]
      ],
      "expect": 4
    },
    {
      "args": [
        [
          1,
          2,
          3,
          4,
          null,
          null,
          5,
          6,
          null,
          null,
          7
        ]
      ],
      "expect": 6
    },
    {
      "args": [
        [
          1,
          2,
          3,
          4,
          5,
          null,
          null,
          6,
          7
        ]
      ],
      "expect": 4
    }
  ]
}
```

````reveal Hint — separate two quantities that want to be one
At each node there are two different numbers in play. (1) The longest path
that **bends** at this node = leftHeight + rightHeight (go down the left as
far as possible, back up, down the right as far as possible). That's a
diameter *candidate*. (2) The **height** of this node = 1 + max(leftHeight,
rightHeight) — a single downward path, because that's all a parent can
extend. The answer is the max of quantity (1) over *all* nodes; the value
returned upward is quantity (2). Don't return (1).
````

## The naive trap: "just return the diameter"

The tempting first attempt: write a function `diameter(node)` that returns
the diameter of the subtree rooted at `node`, recursing on children like
maximum depth did. But try to write the combine step and you hit a wall.
The diameter at a node depends on the two subtrees' **heights** (to measure
the path that bends through the node), *not* on the two subtrees'
diameters. A subtree's diameter tells you the longest path *somewhere
inside* that subtree — it says nothing about how far down the subtree
reaches, which is what the parent needs to extend a path through itself.

So a function returning diameter has thrown away the one number its parent
requires (height) and kept a number the parent can't use (diameter). People
patch this by computing height *separately* inside the diameter function:

````tabs
```python
def diameter_naive(node: TreeNode | None) -> int:
    if node is None:
        return 0
    # path bending through this node:
    through = height(node.left) + height(node.right)
    # best diameter inside either subtree:
    left_d = diameter_naive(node.left)
    right_d = diameter_naive(node.right)
    return max(through, left_d, right_d)

def height(node: TreeNode | None) -> int:
    if node is None:
        return 0
    return 1 + max(height(node.left), height(node.right))
```

```typescript
function diameterNaive(node: TreeNode | null): number {
  if (node === null) return 0;
  // path bending through this node:
  const through = height(node.left) + height(node.right);
  const leftD = diameterNaive(node.left); // best diameter inside subtrees
  const rightD = diameterNaive(node.right);
  return Math.max(through, leftD, rightD);
}

function height(node: TreeNode | null): number {
  if (node === null) return 0;
  return 1 + Math.max(height(node.left), height(node.right));
}
```
````

This is **correct but slow**. For every node, `diameter_naive` calls
`height` on its children, and `height` itself walks that entire subtree.
So a node near the root triggers a height computation over almost the whole
tree, and this repeats at every node. That's the same redundant-recompute
pattern as naive recursive Fibonacci: **O(n) work per node × n nodes =
O(n²)**, degenerating to fully quadratic on a skewed tree. The height of a
subtree gets recomputed once for every ancestor it has.

## The insight

Both numbers a node needs — its height, and the best path bending through
it — are computable from *the same two child heights*. So make the
recursion return **height** (the value the parent genuinely needs to
extend a path), and while you're there, having both child heights in hand,
compute the bending path `left + right` and fold it into a **single shared
answer** kept outside the recursion. One postorder pass, each subtree's
height computed exactly once, and the diameter accumulated as a side effect.

This is the pattern the top-down/bottom-up lesson flagged as the diameter
twist: **a bottom-up return value (height) plus a closure/global
accumulator (the best diameter seen).** The return value and the answer are
allowed to be different things — recognizing that is the entire skill this
problem teaches.

## Solution

`````reveal Solution — return height, accumulate diameter
````tabs
```python
def diameter_of_binary_tree(root: TreeNode | None) -> int:
    best = 0                             # shared answer, lives outside recursion

    def height(node: TreeNode | None) -> int:
        nonlocal best
        if node is None:
            return 0
        left = height(node.left)         # child heights, computed ONCE each
        right = height(node.right)
        best = max(best, left + right)   # bending path through node = a candidate
        return 1 + max(left, right)      # return HEIGHT — what the parent can use

    height(root)
    return best
```

```typescript
function diameterOfBinaryTree(root: TreeNode | null): number {
  let best = 0; // shared answer, lives outside recursion

  function height(node: TreeNode | null): number {
    if (node === null) return 0;
    const left = height(node.left); // child heights, computed ONCE each
    const right = height(node.right);
    best = Math.max(best, left + right); // bending path through node = candidate
    return 1 + Math.max(left, right); // return HEIGHT — what the parent can use
  }

  height(root);
  return best;
}
```
````

The two lines after the recursive calls do the two jobs cleanly. `best =
max(best, left + right)` considers the longest path that bends at *this*
node — down the left subtree (`left` edges), up through the node, down the
right subtree (`right` edges) — as a candidate for the global answer. The
return, `1 + max(left, right)`, hands the parent the one thing it can build
on: how far *straight down* this subtree reaches. Every node's bending path
is considered exactly once, so `best` ends up as the maximum over all
nodes, which is the diameter.

```complexity
{
  "time": "O(n)",
  "space": "O(h)",
  "why": "One postorder pass: each node's height is computed exactly once (the naive version recomputed it O(n) times, hence its O(n²)), and each node does O(1) work updating `best`. Space is the recursion stack, O(h) — O(log n) balanced, O(n) skewed."
}
```
`````

## Variants

- **Binary Tree Maximum Path Sum** (LeetCode 124): the same shape at a
  higher difficulty — return the best *downward* path sum for the parent to
  extend, while accumulating the best *bending* path sum globally. The extra
  twist: a negative subtree contributes `max(0, childSum)` because you can
  choose not to include it. Master diameter and 124 is a one-step
  generalization.
- **Balanced Binary Tree** (LeetCode 110): another "return height, but also
  track a boolean side-answer" instance — return height while flagging any
  node whose two subtree heights differ by more than 1.
- **Maximum Depth** (previous lesson): the plain height recursion that this
  problem wraps — worth re-reading to see that diameter is "height, plus one
  accumulator line."

```quiz
{
  "questions": [
    {
      "question": "Why can't the recursion simply RETURN each subtree's diameter to its parent, the way maxDepth returns each subtree's depth?",
      "options": [
        "A parent extending a path through itself needs to know how far its child's subtree reaches DOWNWARD (the child's height), but a subtree's diameter is a path buried somewhere inside it that says nothing about downward reach — so the parent would be missing the only quantity it can actually build on",
        "Returning the diameter would double-count edges — if a parent added its own edge to a child's already-returned diameter, the resulting sum would count some edges in the child's subtree twice",
        "It can — returning the diameter directly works fine and is the standard solution; a parent can always combine its two children's diameters with its own local bending path to get a fully correct result"
      ],
      "answer": 0,
      "explanation": "The answer (max path anywhere) and the value a parent needs (max downward reach = height) are different quantities. A subtree's diameter is un-extendable — it's an internal path, not a downward one — so a parent can't stitch it into a path through itself. That's why the returned value must be height, and the diameter is accumulated separately in a shared variable while both child heights are in hand."
    },
    {
      "question": "The 'correct but slow' version computes height separately inside the diameter function and runs in O(n²). Where does the quadratic cost come from?",
      "options": [
        "Each node calls height() on its children, and height() re-walks that entire subtree — so every subtree's height is recomputed once per ancestor it has; summed over the tree that's O(n) work per node × n nodes = O(n²), worst on a skewed tree",
        "From the two recursive diameter calls doubling the work at each node — since each node's diameter call spawns two more diameter calls that spawn two more each, the branching factor itself is what produces the quadratic blowup",
        "From the max() call, which scans all nodes each time — computing the maximum of the through-path and both subtree diameters requires a full tree scan on every single call, and that repeated scanning is where the quadratic cost originates"
      ],
      "answer": 0,
      "explanation": "It's the naive-Fibonacci redundant-recompute pattern. A subtree near the root gets its height recalculated once for every ancestor, so the same nodes are re-walked over and over. The fix folds height and diameter into ONE postorder pass so each height is computed exactly once — dropping O(n²) to O(n) by not throwing away work the traversal already did."
    }
  ]
}
```
