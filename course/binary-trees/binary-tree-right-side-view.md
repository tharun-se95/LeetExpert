---
title: Binary Tree Right Side View
type: problem
---

## Problem

Given the `root` of a binary tree, imagine standing on its right side —
return the values of the nodes you can see, ordered from top to bottom
(one value per level: the rightmost node at that level). (LeetCode 199.)

**Examples**

```text
      1
     / \
    2   3          →  [1, 3, 4]
     \    \
      5    4
```

Note row 1 has only a left child (5) visible from the right, but it's
*hidden* behind 3 — the answer skips it, since 3 is farther right at
that level.

**Constraints:** `0 ≤ n ≤ 100` nodes.

## Attempt it first

This looks like a new problem but it's the previous lesson's level-order
BFS with one change: instead of collecting every value at a level, keep
only the *last* one processed (the rightmost, if children are enqueued
left-before-right). Try adapting your level-order solution before
opening anything — or, if you want the alternative framing, think about
what a DFS that visits **right child before left child** would need to
track to get the same answer without a queue at all.

````reveal Hint — two valid framings, pick one
**BFS framing:** reuse the level-order traversal exactly, but instead of
appending every value to a per-level list, just remember the value of
the LAST node dequeued in each level's inner loop — that's the
rightmost node in left-to-right enqueue order.

**DFS framing (the sharper one):** traverse right child before left
child, and track the current depth. The first time you reach a given
depth is now guaranteed to be via the rightmost node at that depth
(because right is always explored before left) — so if `depth ==
len(result)` (this is a depth never recorded yet), record this node's
value. Every node at this depth reached afterward is further left and
must be skipped, which falls out automatically since `depth ==
len(result)` becomes false for them.
````

## Solution

Both framings are legitimate; the DFS version is shown as the primary
solution since it makes the "first visit at a new depth is the answer"
invariant explicit, and the BFS version is included as a direct
alternative.

`````reveal Solution — DFS, right before left, first-at-depth wins
````tabs
```python
def right_side_view(root: TreeNode | None) -> list[int]:
    result: list[int] = []

    def dfs(node: TreeNode | None, depth: int) -> None:
        if node is None:
            return
        if depth == len(result):     # first time reaching this depth
            result.append(node.val)  # → must be the rightmost node here
        dfs(node.right, depth + 1)   # RIGHT first
        dfs(node.left, depth + 1)    # then left — only fills depths not yet seen

    dfs(root, 0)
    return result
```

```typescript
function rightSideView(root: TreeNode | null): number[] {
  const result: number[] = [];

  function dfs(node: TreeNode | null, depth: number): void {
    if (node === null) return;
    if (depth === result.length) {
      // first time reaching this depth
      result.push(node.val); // → must be the rightmost node here
    }
    dfs(node.right, depth + 1); // RIGHT first
    dfs(node.left, depth + 1); // then left — only fills depths not yet seen
  }

  dfs(root, 0);
  return result;
}
```
````

`depth == result.length` is the crux: `result` grows by exactly one
entry each time a *new* depth is reached for the first time, so its
length always equals "how many depths have been recorded so far," which
equals the next depth expected. Because right is explored exhaustively
before any left subtree, the FIRST node to reach a given depth is
guaranteed to be the rightmost one — any node reaching that same depth
later, via a left branch, sees `depth < len(result)` (already recorded)
and correctly does nothing.

```complexity
{
  "time": "O(n)",
  "space": "O(h)",
  "why": "Every node is visited exactly once, O(1) work each. Space is the recursion stack, O(h) — the height of the tree, not the width, since this is DFS rather than BFS."
}
```
`````

`````reveal Alternative — BFS, keep only the last value per level
````tabs
```python
from collections import deque

def right_side_view_bfs(root: TreeNode | None) -> list[int]:
    if root is None:
        return []
    result: list[int] = []
    queue = deque([root])
    while queue:
        level_size = len(queue)
        last_value = None
        for _ in range(level_size):
            node = queue.popleft()
            last_value = node.val         # overwritten until the last dequeue
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        result.append(last_value)
    return result
```

```typescript
function rightSideViewBfs(root: TreeNode | null): number[] {
  if (root === null) return [];
  const result: number[] = [];
  const queue: TreeNode[] = [root];
  let head = 0;
  while (head < queue.length) {
    const levelSize = queue.length - head;
    let lastValue = 0;
    for (let i = 0; i < levelSize; i++) {
      const node = queue[head++];
      lastValue = node.val; // overwritten until the last dequeue
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    result.push(lastValue);
  }
  return result;
}
```
````

Note this version enqueues left before right and simply keeps
overwriting `last_value` through the inner loop — the final overwrite,
by construction, belongs to the rightmost node processed in that level.
Functionally identical output to the DFS version, different traversal
order underneath.

```complexity
{
  "time": "O(n)",
  "space": "O(w)",
  "why": "Same total-visits argument as level-order traversal — O(n) time. Space is the queue's maximum size, bounded by the tree's widest level, O(w), rather than DFS's O(h)."
}
```
`````

## Variants

- **Binary Tree Level Order Traversal** (previous lesson): the BFS
  version above is exactly that solution with the per-level list
  collapsed to its last element.
- **Average of Levels / Level Order Traversal II** (not covered): more
  small variations on the same level-tracking skeleton.
- **Top-Down vs. Bottom-Up Tree Recursion** (concept lesson, this
  module): the DFS solution's `depth == len(result)` trick is a
  top-down technique — depth is *passed down* as a parameter, and the
  decision of whether to record happens on the way down, not built from
  values returned up.

```quiz
{
  "question": "In the DFS solution, why must dfs(node.right, ...) be called BEFORE dfs(node.left, ...), rather than the more usual left-then-right order?",
  "options": [
    "The order doesn't actually matter as long as depth is tracked correctly — since depth is passed as an explicit parameter regardless of traversal order, the algorithm would identify the same set of visible nodes whether right or left is explored first",
    "The 'first node to reach a given depth gets recorded' rule only produces the RIGHTMOST node at each depth if right subtrees are fully explored before left ones — with left-before-right, a left-side node would often reach a new depth first and get incorrectly recorded instead of a rightmost node further right",
    "Right-before-left is required to keep the recursion's time complexity at O(n) — visiting left before right would force some nodes to be revisited to correct earlier mistakes, pushing the complexity above linear"
  ],
  "answer": 1,
  "explanation": "The whole algorithm hinges on the invariant 'first arrival at a depth = rightmost node at that depth,' and that invariant is only true because right is explored exhaustively before left ever gets a turn. Swap the order and a left branch could reach depth 3 before the true rightmost node at depth 3 (reached via some right branch) — the first-arrival value recorded would then be the wrong (leftward) node."
}
```
