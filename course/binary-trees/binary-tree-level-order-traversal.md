---
title: Binary Tree Level Order Traversal
type: problem
---

## Problem

Given the `root` of a binary tree, return the values of its nodes as
**level order traversal** — grouped into a list of lists, one inner list
per level, left to right. (LeetCode 102.)

**Examples**

```text
      3
     / \
    9  20        →  [[3], [9,20], [15,7]]
       /  \
      15   7
```

**Constraints:** `0 ≤ n ≤ 2000` nodes.

## Attempt it first

This is a direct, unmodified application of the BFS & Level-Order
Traversal concept lesson — the exercise is confirming you can reproduce
the level-boundary technique (snapshotting the queue's size at the start
of each level) without re-deriving it. Try writing it before opening
anything.

````reveal Hint — snapshot the queue length before draining it
A plain queue-based BFS visits nodes in level order but doesn't, by
itself, tell you *where one level ends and the next begins* — nodes from
level k and level k+1 sit mixed together in the queue as it grows. The
fix from the concept lesson: at the top of each iteration of the outer
loop, read `len(queue)` ONCE and store it — that count is exactly how
many nodes belong to the current level (every node enqueued so far that
hasn't been dequeued yet is from this level; nothing from the next level
has been pushed until you start dequeuing this batch). Loop that many
times, collecting values and enqueuing children, then close out the
level as one list.
````

## Solution

Since this is a direct application rather than a problem requiring a
separate brute-force-vs-optimal contrast, the solution is shown directly:

`````reveal Solution — BFS with a per-level size snapshot
````tabs
```python
from collections import deque

def level_order(root: TreeNode | None) -> list[list[int]]:
    if root is None:
        return []
    result: list[list[int]] = []
    queue = deque([root])
    while queue:
        level_size = len(queue)          # snapshot: exactly this level's count
        level_values = []
        for _ in range(level_size):
            node = queue.popleft()
            level_values.append(node.val)
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        result.append(level_values)
    return result
```

```typescript
function levelOrder(root: TreeNode | null): number[][] {
  if (root === null) return [];
  const result: number[][] = [];
  const queue: TreeNode[] = [root];
  let head = 0;
  while (head < queue.length) {
    const levelSize = queue.length - head; // snapshot: exactly this level's count
    const levelValues: number[] = [];
    for (let i = 0; i < levelSize; i++) {
      const node = queue[head++];
      levelValues.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    result.push(levelValues);
  }
  return result;
}
```
````

The `level_size = len(queue)` line, read once before the inner `for`
loop begins, is what makes this a *level*-order traversal rather than a
plain BFS: it fixes exactly how many dequeues belong to the current
level before any children of this level get enqueued and could be
mistaken for members of it.

```complexity
{
  "time": "O(n)",
  "space": "O(w)",
  "why": "Every node is enqueued and dequeued exactly once, O(1) work each — O(n) total. The queue's maximum size is bounded by the widest level of the tree, w — for a balanced tree that's up to ~n/2 at the last level, so O(w) is the honest bound, not O(n), even though w can equal a constant fraction of n."
}
```
`````

## Variants

- **Binary Tree Right Side View** (next lesson): reuses this exact
  level-by-level structure, but keeps only the *last* value seen at each
  level instead of the whole list.
- **Average of Levels in Binary Tree** (not covered): same skeleton,
  accumulate a sum instead of a list per level.
- **BFS & Level-Order Traversal** (concept lesson, this module): the
  full derivation of the technique this problem applies directly.

```quiz
{
  "question": "If you forget to snapshot level_size before the inner loop, and instead just loop 'while the queue is non-empty, dequeue and process one node at a time,' what goes wrong?",
  "options": [
    "Nothing — the output would be identical, just computed differently; the queue still yields nodes in the same overall level order regardless of whether a count is snapshotted, so grouping them into per-level lists afterward would still work out",
    "Without a fixed count captured before enqueuing children, a level's own children get pushed onto the queue and then immediately processed as if they belonged to the CURRENT level, since there's no marker separating one level's nodes from the next's",
    "The traversal would visit nodes in the wrong left-to-right order within a level — omitting the snapshot causes nodes to be dequeued out of their left-to-right sequence, scrambling the order within each level's list"
  ],
  "answer": 1,
  "explanation": "The queue is one continuous FIFO holding nodes from possibly multiple levels at once as the BFS runs. The snapshot IS the only thing that tells the loop 'stop after exactly this many dequeues — everything after that, even though it's already sitting in the queue, belongs to the next level.' Without it, there's no way to know where one level's output should end and the next's should begin."
}
```
