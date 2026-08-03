---
title: Top-Down vs. Bottom-Up Tree Recursion
type: concept
---

## The one distinction that unlocks tree problems

The last three lessons gave you traversals — ways to *reach* every node.
This lesson is about the harder thing: *computing an answer* as you
traverse. Almost every tree problem you'll solve is one of **two recursion
shapes**, and picking the right one is most of the battle. Get this
distinction crisp and problems that looked like a grab-bag of tricks
collapse into "which of the two shapes is this, and what do I put in the
blanks." Get it fuzzy and you'll write subtly wrong recursions that pass
small tests and fail on real trees (the diameter problem, two lessons on,
is a famous casualty).

The two shapes differ in **which way information flows** along the tree:

- **Top-down**: information flows **down**. A node receives context from
  its ancestors *as a parameter* (the depth so far, the path so far, the
  max-seen-above), does its bit, and passes updated context down to its
  children. The answer is assembled *on the way in*, at the leaves.
- **Bottom-up**: information flows **up**. A node asks its children to solve
  their subtrees, they *return* answers, and the node **combines** those
  returns into its own answer, which it returns further up. The answer is
  assembled *on the way out*, at the root.

That's the whole taxonomy. Everything below makes it concrete by solving
the *same* problem — the maximum depth of a tree — both ways, so the
contrast has nothing to hide behind.

## Shape 1: bottom-up (children return, parent combines)

Ask each node: "how tall is the tree rooted at me?" A node can't know
without asking its children first. So it recurses on both, gets back their
heights, and combines: *my height is one more than my taller child.* An
empty subtree has height 0 (by the edge-counting convention; we'll return
depth-in-nodes here so the final answer is the node count on the longest
path, matching LeetCode's "maximum depth"):

````tabs
```python
def max_depth_bottom_up(node: TreeNode | None) -> int:
    if node is None:                     # empty subtree contributes 0
        return 0
    left = max_depth_bottom_up(node.left)    # child returns its answer UP
    right = max_depth_bottom_up(node.right)  # child returns its answer UP
    return 1 + max(left, right)          # COMBINE: me + my taller side
```

```typescript
function maxDepthBottomUp(node: TreeNode | null): number {
  if (node === null) return 0; // empty subtree contributes 0
  const left = maxDepthBottomUp(node.left); // child returns its answer UP
  const right = maxDepthBottomUp(node.right); // child returns its answer UP
  return 1 + Math.max(left, right); // COMBINE: me + my taller side
}
```
````

Notice the signature: it takes only a node and **returns** a number. No
extra parameters, no shared state. Each call is a self-contained
question-and-answer about *its own subtree*. The work happens **after** the
recursive calls return — the `1 + max(...)` line is postorder (you saw that
order in the DFS lesson: both subtrees first, node last). This is the
defining fingerprint of bottom-up: **a meaningful return value, combined
after the recursion.**

Why is it correct? By induction: assume the two recursive calls correctly
report the heights of the left and right subtrees. The longest root-to-leaf
path in *this* tree either goes left or goes right, and in either case it's
one edge (this node) plus the longest path in that subtree — so
`1 + max(left, right)` is exactly it. Base case: the empty tree has no
nodes, depth 0. The induction is the structural induction from the
terminology lesson, instantiated.

## Shape 2: top-down (state flows down as a parameter)

Now solve the *identical* problem the other way. Instead of asking each
node how tall it is, *tell* each node how deep it is — carry the depth down
as a parameter — and whenever you reach a leaf, record whether this is the
deepest leaf seen so far. The recursion returns nothing useful; the answer
accumulates in shared state:

````tabs
```python
def max_depth_top_down(root: TreeNode | None) -> int:
    best = 0                             # shared answer, updated at leaves

    def visit(node: TreeNode | None, depth: int) -> None:
        nonlocal best
        if node is None:
            return
        depth += 1                       # context PASSED DOWN: my depth
        if node.left is None and node.right is None:   # a leaf
            best = max(best, depth)      # record on the way IN
        visit(node.left, depth)          # hand the deeper context to children
        visit(node.right, depth)

    visit(root, 0)
    return best
```

```typescript
function maxDepthTopDown(root: TreeNode | null): number {
  let best = 0; // shared answer, updated at leaves

  function visit(node: TreeNode | null, depth: number): void {
    if (node === null) return;
    depth += 1; // context PASSED DOWN: my depth
    if (node.left === null && node.right === null) {
      // a leaf
      best = Math.max(best, depth); // record on the way IN
    }
    visit(node.left, depth); // hand the deeper context to children
    visit(node.right, depth);
  }

  visit(root, 0);
  return best;
}
```
````

Different fingerprint entirely. The signature carries an **extra parameter**
(`depth`) — the context flowing down — and the function **returns nothing**;
the answer lives in `best`, a variable outside the recursion that leaf
visits mutate. The work that touches the answer happens *before* descending
(preorder-ish: you know your depth the moment you arrive, without waiting on
children). This is the defining fingerprint of top-down: **state passed as a
parameter, answer accumulated in shared/external storage.**

## The same tree, both shapes side by side

Run both on:

```diagram
{
  "id": "binary-tree",
  "nodes": [
    { "id": "1", "left": "2", "right": "3" },
    { "id": "2", "left": "4" }
  ]
}
```

- **Bottom-up** works from the leaves up. Node 4 returns 1. Node 3 returns
  1. Node 2 returns `1 + max(1, 0) = 2`. Node 1 returns
  `1 + max(2, 1) = 3`. The 3 bubbles up to the caller. Answer assembled at
  the root, on the way out.
- **Top-down** works from the root down. Enter 1 at depth 1; enter 2 at
  depth 2; enter 4 at depth 3 — it's a leaf, so `best = 3`. Back up, enter 3
  at depth 2 — a leaf, `best = max(3, 2) = 3`. Answer accumulated at the
  leaves, on the way in.

Same answer, 3. Same O(n) time, same O(h) stack. But the *mechanism* is a
mirror image: one sends questions down and folds answers up; the other
sends context down and drops answers into a bucket.

## How to tell which shape a problem wants

The deciding question: **does a node's answer depend on things ABOVE it, or
things BELOW it?**

- Depends on **ancestors** (depth, the path taken to get here, a running
  sum from the root, "is this node in a valid range") → **top-down**. The
  context you need is upstream, so carry it down as a parameter. Examples:
  path-sum-from-root problems, "print all root-to-leaf paths," validating a
  BST's value ranges.
- Depends on **descendants** (height, size, "is my subtree balanced," the
  best path *within* my subtree, the min/max value below me) → **bottom-up**.
  The information you need is downstream, so let children return it and
  combine. Examples: height, diameter, "count nodes," lowest common
  ancestor, most subtree-aggregation problems.

A reliable code-level tell: if you find yourself wanting a **return value
that the parent uses**, you're bottom-up. If you find yourself wanting to
**pass an accumulator or context parameter down** and record answers in a
shared variable, you're top-down. Some problems even use both at once — a
bottom-up return value *and* a closure variable capturing a global best.
That combination is exactly the diameter problem's twist (two lessons from
now), and recognizing it as "bottom-up return plus a top-level accumulator"
is what makes that problem tractable rather than mysterious.

```complexity
{
  "operations": [
    { "name": "both shapes, time", "time": "O(n)", "why": "each shape visits every node once and does O(1) work per node — the flow direction changes WHEN work happens, not HOW MUCH" },
    { "name": "both shapes, space", "time": "O(h)", "why": "both are DFS: the recursion stack holds the current root-to-node path, at most h frames; the top-down parameter and the bottom-up return value are each O(1) per frame" }
  ]
}
```

```quiz
{
  "questions": [
    {
      "question": "You must compute, for every node, the maximum value found ANYWHERE in that node's subtree. Which recursion shape fits, and why?",
      "options": [
        "Top-down — pass the running maximum down from the root as a parameter; since every node just needs to compare its own value against whatever maximum has been seen along the path from the root so far, threading that running value downward is sufficient",
        "Bottom-up — a node's subtree-max depends on its descendants, so let each child return its subtree-max and combine: max(node.val, leftMax, rightMax), returned upward",
        "Neither — this needs BFS, not recursion; finding a maximum across an entire subtree structurally requires processing nodes level by level with a queue, which DFS-based approaches can't express"
      ],
      "answer": 1,
      "explanation": "The needed information (the maximum below a node) lives in the node's DESCENDANTS, not its ancestors. That's the bottom-up signature: children return answers, the parent combines them into its own return value. Passing a max down (top-down) would give you the max ABOVE each node, which is a different, wrong quantity."
    },
    {
      "question": "What is the clearest CODE-level fingerprint distinguishing a top-down tree recursion from a bottom-up one?",
      "options": [
        "Top-down uses a while loop; bottom-up uses recursion — top-down implementations are typically written iteratively with an explicit stack or queue, while bottom-up implementations rely on the language's call stack via recursive calls",
        "Bottom-up has a meaningful RETURN value that the parent combines after the recursive calls; top-down carries extra CONTEXT as a parameter flowing down and accumulates the answer in shared/external state, returning nothing useful",
        "Top-down always visits the left child first; bottom-up always visits the right child first — the two shapes are defined by a fixed, opposite child-visitation order, which is the reliable way to tell which pattern a given piece of code is using"
      ],
      "answer": 1,
      "explanation": "Both are DFS and both can visit children in any order — that's not the tell. The tell is the direction of information: bottom-up folds child return values upward (work happens AFTER recursion, postorder-style), while top-down pushes context downward as a parameter and records answers on the way in (work happens BEFORE recursion, preorder-style). Spotting which one a problem needs is the core tree-solving skill."
    }
  ]
}
```
