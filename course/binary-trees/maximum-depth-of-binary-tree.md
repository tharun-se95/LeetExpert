---
title: Maximum Depth of Binary Tree
type: problem
---

## Problem

Given the `root` of a binary tree, return its **maximum depth** — the
number of nodes along the longest path from the root down to the farthest
leaf.

**Examples**

```examples
root = [3,9,20,null,null,15,7] → 3  (longest root-to-leaf: 3-20-15 or 3-20-7)
root = [] → 0  (empty tree)
root = [1,null,2] → 2  (path 1-2)
```

```text
      3
     / \
    9   20
       /  \
      15   7
```

```constraint
0 ≤ n ≤ 10⁴ nodes · node values fit in a machine int
```

## Attempt it first

This is the warm-up for the whole module, and it is deliberately the
cleanest possible instance of **bottom-up recursion** from the previous
lesson. Before revealing anything, write it: decide what an empty subtree
returns, decide how a node combines its two children's answers into its
own. If you internalize this one, maximum depth becomes the template you
pattern-match every harder tree problem against.

```sandbox
{
  "id": "maximum-depth-of-binary-tree",
  "fn": {
    "python": "max_depth",
    "javascript": "maxDepth"
  },
  "check": "return",
  "shape": {
    "0": "tree"
  },
  "starter": {
    "python": "def max_depth(root):\n    # Return the number of nodes on the longest root-to-leaf path.\n    pass\n",
    "javascript": "function maxDepth(root) {\n  // Return the number of nodes on the longest root-to-leaf path.\n}\n"
  },
  "cases": [
    {
      "args": [
        [
          3,
          9,
          20,
          null,
          null,
          15,
          7
        ]
      ],
      "expect": 3
    },
    {
      "args": [
        []
      ],
      "expect": 0
    },
    {
      "args": [
        [
          1,
          null,
          2
        ]
      ],
      "expect": 2
    },
    {
      "args": [
        [
          1
        ]
      ],
      "expect": 1
    },
    {
      "args": [
        [
          1,
          2,
          null,
          3,
          null,
          4
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
          5,
          6,
          7
        ]
      ],
      "expect": 3
    }
  ]
}
```

````reveal Hint — ask the right question at a node
A node cannot know the tree's depth by looking at itself. But it *can*
answer a local question if its children answer theirs first: "given how
deep my left subtree goes and how deep my right subtree goes, how deep do I
go?" That's one edge (me) plus the deeper of the two. Empty subtree → 0.
That's the entire recurrence.
````

## Brute force — is there even a naive version?

Unlike most problem lessons, there's no wasteful brute force to beat here:
you must look at every node to know the farthest one, so O(n) is the floor,
and the recursive solution already hits it. The only "naive" alternative is
doing more bookkeeping than needed — e.g., recording every root-to-leaf
path's length in a list and taking the max, which works but allocates O(n)
extra for paths you immediately throw away. The point of this problem is
that the clean bottom-up recurrence *is* the optimal solution; there's
nothing to optimize away, only a shape to learn.

## The insight

The maximum depth of a tree is `1 + max(depth of left subtree, depth of
right subtree)`, with the empty tree having depth 0. This is bottom-up
recursion in its purest form — the recurrence *is* the definition of depth,
read directly off the recursive structure of the tree. Every node does O(1)
work (one `max`, one `+1`) after its children report, and there are n
nodes, so the whole thing is O(n).

## Solution

`````reveal Solution — bottom-up recursion
````tabs
```python
def max_depth(root: TreeNode | None) -> int:
    if root is None:                 # base case: empty subtree has depth 0
        return 0
    left = max_depth(root.left)      # children report their depths UP
    right = max_depth(root.right)
    return 1 + max(left, right)      # combine: me + my deeper side
```

```typescript
function maxDepth(root: TreeNode | null): number {
  if (root === null) return 0; // base case: empty subtree has depth 0
  const left = maxDepth(root.left); // children report their depths UP
  const right = maxDepth(root.right);
  return 1 + Math.max(left, right); // combine: me + my deeper side
}
```
````

Read it against the module skeleton: base case handles `null`, the
recursive case recurses on both children and combines. The combine step,
`1 + max(...)`, is the entire content of the problem — it says the longest
path through this node runs down its taller side, plus the edge from the
node to that side. Because the work happens *after* both recursive calls
return, this is postorder; because each node returns a value its parent
consumes, it is textbook bottom-up.

```complexity
{
  "time": "O(n)",
  "space": "O(h)",
  "why": "Every node is visited once and does O(1) combine work, so time is proportional to the node count n. Space is the recursion stack, which holds the current root-to-node path — at most the tree's height h. That's O(log n) for a balanced tree but O(n) for a degenerate chain."
}
```
`````

`````reveal Alternative — BFS, counting levels
If recursion depth is a concern (a height-n degenerate tree could overflow
the call stack), the level-order traversal from the BFS lesson gives depth
iteratively: the maximum depth is simply the number of levels you process.
````tabs
```python
from collections import deque

def max_depth_bfs(root: TreeNode | None) -> int:
    if root is None:
        return 0
    depth = 0
    queue: deque[TreeNode] = deque([root])
    while queue:
        depth += 1                       # one more level exists
        for _ in range(len(queue)):      # drain exactly this level
            node = queue.popleft()
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
    return depth
```

```typescript
function maxDepthBfs(root: TreeNode | null): number {
  if (root === null) return 0;
  let depth = 0;
  const queue: TreeNode[] = [root];
  while (queue.length > 0) {
    depth += 1; // one more level exists
    const levelSize = queue.length; // drain exactly this level
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift()!;
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
  }
  return depth;
}
```
````
Same O(n) time. The space profile flips to O(w) — the widest level — which
is better on a degenerate chain (O(1)) and worse on a balanced tree (O(n)),
exactly the DFS-vs-BFS trade from the BFS lesson.
`````

## Variants

- **Minimum Depth of Binary Tree** (LeetCode 111): looks symmetric but has
  a subtle trap — the min path must end at a *leaf*, so a node with only one
  child cannot take `1 + min(left, right)` (the null side would wrongly
  report 0). You must take the non-null child's depth. A good exercise in
  reading the recurrence carefully.
- **Balanced Binary Tree** (LeetCode 110): height at every node, checking
  `|leftHeight − rightHeight| ≤ 1` — bottom-up, and the natural bridge to
  the next lesson's diameter, which also returns height while tracking a
  side quantity.
- **Diameter of Binary Tree** (next lesson): reuses this exact height
  recursion but accumulates a *global* answer alongside the returned height
  — the first problem where the returned value and the answer differ.

```quiz
{
  "question": "Why is `1 + max(maxDepth(left), maxDepth(right))` the correct recurrence, and why is O(n) unavoidable here?",
  "options": [
    "The longest root-to-leaf path through a node descends its deeper subtree plus the one edge to reach it, so the depth is 1 + the max of the two subtree depths (empty = 0); and O(n) is a floor because identifying the farthest leaf requires examining every node — you cannot skip any and still be sure",
    "It's a convention memorized for tree problems; O(n) is just how recursion works — the +1-and-max pattern is a standard idiom worth recognizing on sight, and any recursive traversal is O(n) simply as a general property of recursion over n items",
    "Because max is faster than min, and trees always have n nodes on the longest path — since max() is a cheaper operation than min() to compute, and every root-to-leaf path in an n-node tree passes through all n nodes, the recurrence follows directly"
  ],
  "answer": 0,
  "explanation": "The recurrence is the definition of depth read off the tree's recursive structure: any longest path goes through one child, and it's that child's longest path plus the current edge. Correctness follows by induction on subtree size. O(n) is optimal because the answer depends on the single farthest leaf, and you can't know which leaf that is without visiting them all — there's no structure (like sortedness) to let you skip nodes."
}
```
