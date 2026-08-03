---
title: BFS & Level-Order Traversal
type: concept
---

## A different question: what's on each level?

DFS plunges down one branch to the bottom before touching the next. But
many tree questions are about **breadth**, not depth: "what does the tree
look like row by row," "what's the value at each level," "how far is the
nearest leaf." For those, you want to visit **all of level 0, then all of
level 1, then all of level 2** — the root, then its children, then its
grandchildren. That is **breadth-first search (BFS)**, and on a tree it is
also called **level-order traversal**.

DFS was powered by a stack (LIFO — last in, first out), whether the call
stack or an explicit one. BFS is powered by a **queue** (FIFO — first in,
first out). That one swap, stack for queue, is the entire difference
between "go deep" and "go wide," and the reason is worth seeing precisely.

## Why a queue produces level order

The invariant: **process nodes in the order they were discovered.** Start
by putting the root in the queue. Then repeat: remove the front node,
process it, and add its children to the back.

Watch what the FIFO discipline guarantees. The root (level 0) is
discovered first, so it's processed first. Processing it enqueues its
children (level 1) at the back. Those level-1 nodes sit *behind* nothing,
so they come out next — before any level-2 node, because level-2 nodes are
only enqueued *while processing level-1 nodes*, which happens later and
adds to the back. A node at level k is always enqueued before any node at
level k+1 (its discovery requires processing a level-k parent first) and
FIFO preserves that order on the way out. So nodes exit the queue level by
level, left to right. The queue *sorts discoveries by depth automatically*
— that's the whole trick.

```diagram
{
  "id": "binary-tree",
  "nodes": [
    { "id": "1", "left": "2", "right": "3" },
    { "id": "2", "left": "4", "right": "5" },
    { "id": "3", "left": "6" }
  ]
}
```

Queue trace: `[1]` → process 1, enqueue 2,3 → `[2,3]` → process 2, enqueue
4,5 → `[3,4,5]` → process 3, enqueue 6 → `[4,5,6]` → process 4,5,6. Output
order: 1, 2, 3, 4, 5, 6 — exactly level by level.

## Tracking level boundaries: the size snapshot

Plain BFS gives you nodes in level order but *flattened* — it doesn't tell
you where one level ends and the next begins. Most level-order problems
(next lesson's "return a list per level," right-side view two lessons on)
need that boundary. The clean trick: **at the top of each level, snapshot
the current queue size.**

The key observation: at the instant you're about to start a new level, the
queue contains **exactly** the nodes of that level and nothing else — every
previous level has been fully dequeued, and no node from the *next* level
has been enqueued yet (those get added only as you process this level).
So the queue's current length *is* this level's node count. Grab that
number, then dequeue exactly that many nodes, processing them as one level,
enqueuing their children (the next level) for the following round:

````tabs
```python
from collections import deque

def level_order(root: TreeNode | None) -> list[list[int]]:
    levels: list[list[int]] = []
    if root is None:
        return levels
    queue: deque[TreeNode] = deque([root])
    while queue:
        level_size = len(queue)          # queue == exactly this level, right now
        current: list[int] = []
        for _ in range(level_size):      # dequeue precisely one level's worth
            node = queue.popleft()
            current.append(node.val)
            if node.left:                # enqueue children = the NEXT level
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        levels.append(current)           # one level finished
    return levels
```

```typescript
function levelOrder(root: TreeNode | null): number[][] {
  const levels: number[][] = [];
  if (root === null) return levels;
  const queue: TreeNode[] = [root];
  while (queue.length > 0) {
    const levelSize = queue.length; // queue == exactly this level, right now
    const current: number[] = [];
    for (let i = 0; i < levelSize; i++) {
      // dequeue precisely one level's worth
      const node = queue.shift()!;
      current.push(node.val);
      if (node.left) queue.push(node.left); // enqueue children = the NEXT level
      if (node.right) queue.push(node.right);
    }
    levels.push(current); // one level finished
  }
  return levels;
}
```
````

Capturing `level_size` *before* the inner loop is load-bearing: the loop
enqueues the next level's nodes into the same queue as it runs, so
`len(queue)` grows during the loop. Reading it once, up front, freezes the
count at "this level only." That single snapshot is the standard idiom for
every level-boundary problem in this module.

(Python note: use `collections.deque`, whose `popleft` is O(1). A plain
list's `pop(0)` is O(n) because it shifts every remaining element — using
it would silently turn the whole traversal into O(n²). TypeScript's
`Array.shift` has the same O(n) hazard; for large inputs a head-index
pointer or a real queue avoids it. The complexity claims below assume an
O(1) dequeue.)

## DFS vs. BFS: the memory profiles, argued

Both visit every node once, so both are **O(n) time**. Their **space** is
where they diverge, and the difference is not arbitrary — each holds a
different "frontier" of the tree:

- **DFS holds a root-to-node path.** Its stack (call stack or explicit)
  contains the chain of ancestors of the node it's currently at — one entry
  per level, from the root down. The most it ever holds at once is the
  tree's **height**. So DFS space is **O(h)**.
- **BFS holds an entire level.** Its queue, at its fullest, contains all
  the nodes of the widest level (plus possibly the tail of the previous
  one), because it must remember every node on the current row in order to
  visit their children next. So BFS space is **O(w)**, where w is the
  maximum **width** of the tree.

Now the consequences, which are opposite for the two tree shapes:

- **A balanced tree** is *wide at the bottom*: the last level holds up to
  n/2 of the n nodes. So BFS peaks at **O(n)** space, while DFS uses only
  **O(log n)** (the height). Here **DFS is far cheaper.**
- **A degenerate tree** (a single chain, effectively a linked list) has
  width 1 at every level but height n. So BFS holds only **O(1)** at a time,
  while DFS's stack grows to **O(n)** (and risks a recursion-limit crash).
  Here **BFS is far cheaper.**

Neither dominates; they trade width for height. The rule of thumb that
falls out: BFS's O(w) hurts most on the bushy trees where DFS thrives, and
DFS's O(h) hurts most on the stringy trees where BFS thrives. Choose by
what the *problem* needs (level structure → BFS; path/subtree combination →
DFS), and be aware of the space profile the tree's shape will hand you.

```complexity
{
  "operations": [
    { "name": "BFS / level-order, time", "time": "O(n)", "why": "each node is enqueued once and dequeued once, doing O(1) work each time" },
    { "name": "BFS space", "time": "O(w)", "why": "the queue at its fullest holds one whole level; w = maximum tree width. For a balanced tree the bottom level is ~n/2 nodes, so this is O(n)" },
    { "name": "DFS space", "time": "O(h)", "why": "the stack holds only the current root-to-node path; h = height. For a balanced tree this is O(log n); for a chain it is O(n)" }
  ]
}
```

```quiz
{
  "questions": [
    {
      "question": "Why must you snapshot the queue's size BEFORE the inner loop that processes a level, rather than looping 'while the queue is non-empty'?",
      "options": [
        "At the top of a level the queue holds exactly that level's nodes, but the inner loop enqueues the NEXT level's nodes as it runs, so the queue length grows mid-loop; freezing the count up front is what pins the loop to 'this level only' and keeps the level boundaries correct",
        "The queue size is undefined until the loop starts — most queue implementations don't expose a length property reliably until at least one element has been dequeued, so reading it early would return an unpredictable value",
        "For readability — it makes no functional difference; looping until the queue empties and snapshotting the size up front both drain the exact same nodes in the exact same order, just with different-looking code"
      ],
      "answer": 0,
      "explanation": "The snapshot exploits a precise invariant: the moment before processing a level, the queue contains that level and nothing else (prior levels dequeued, next level not yet enqueued). Reading len(queue) once captures that count; if you instead looped until the queue emptied, you'd merge every remaining level into one, losing the per-level structure the problem asks for."
    },
    {
      "question": "On a BALANCED tree of n nodes, DFS uses O(log n) space but BFS can use O(n). Where does BFS's extra space actually go?",
      "options": [
        "BFS copies the whole tree into the queue at startup — the algorithm front-loads every node into the queue before processing begins, which is what accounts for the queue's large size throughout the traversal",
        "BFS's queue must hold an entire level at once to visit that level's children next, and a balanced tree's bottom level contains up to ~n/2 nodes — so the queue peaks at O(n), whereas DFS only ever holds the O(log n)-length root-to-node path on its stack",
        "BFS visits each node twice, doubling memory — once when it's discovered and enqueued, and again when it's dequeued and processed, so the extra space comes from this double-counting rather than from level width"
      ],
      "answer": 1,
      "explanation": "The two searches hold different frontiers: DFS holds a vertical path (height h), BFS holds a horizontal level (width w). Balanced trees are wide at the bottom (half the nodes on the last level) and shallow (height log n), so BFS's O(w) balloons to O(n) exactly where DFS's O(h) shrinks to O(log n). On a degenerate chain the roles flip — that's the height-vs-width trade."
    }
  ]
}
```
