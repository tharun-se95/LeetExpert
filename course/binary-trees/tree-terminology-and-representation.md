---
title: Tree Terminology & Representation
type: concept
---

## Stage 3: structures that branch

Every structure so far had one obvious "next" — arrays step to the next
index, linked lists follow the single `next` pointer. A **binary tree**
keeps the free-standing node from the linked-list module but gives each
node **two** forward pointers instead of one: `left` and `right`. That
single change — one pointer becomes two — is the whole leap from a line
to a hierarchy, and it is why this module leans so heavily on recursion.
The rest of this lesson makes the vocabulary precise (loose tree
vocabulary is where most tree bugs are actually born) and then shows why
the *definition* of a tree hands you the *shape* of every algorithm you
will write on one.

## The node

A binary-tree node is a value plus two child pointers, either of which
may be null:

````tabs
```python
class TreeNode:
    def __init__(self, val: int = 0,
                 left: "TreeNode | None" = None,
                 right: "TreeNode | None" = None) -> None:
        self.val = val
        self.left = left
        self.right = right
```

```typescript
class TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;

  constructor(
    val: number = 0,
    left: TreeNode | null = null,
    right: TreeNode | null = null,
  ) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}
```
````

There is no separate "Tree" wrapper class the way `LinkedList` wrapped
`Node`. A tree *is* a node — specifically its topmost node, the **root**.
Hold the root and you hold the whole tree, because every other node is
reachable by following `left`/`right` pointers down from it. This is the
same "the structure is the pointers" idea from the linked-list module,
now branching.

```diagram
{
  "id": "binary-tree",
  "nodes": [
    { "id": "1", "label": "1 (root)", "left": "2", "right": "3" },
    { "id": "2", "left": "4", "right": "5" },
    { "id": "3", "left": "6" },
    { "id": "4", "nullLeft": true, "nullRight": true }
  ]
}
```

## The vocabulary, stated precisely

These terms recur in every problem statement in this module; imprecise
versions cause real off-by-one bugs, so pin them down:

- **Root**: the single node with no parent — the entry point.
- **Child / parent**: if `p.left == c` or `p.right == c`, then `c` is a
  **child** of `p` and `p` is the **parent** of `c`. In a tree every node
  has *exactly one* parent except the root, which has none. (That "exactly
  one" is what distinguishes a tree from a general graph.)
- **Leaf**: a node with **no children** — both `left` and `right` are
  null. Leaves are where recursion bottoms out.
- **Internal node**: any node that is not a leaf (has at least one child).
- **Subtree**: any node, taken *together with all of its descendants*, is
  itself a tree — a subtree of the original. The left subtree of a node is
  the whole tree rooted at its `left` child. This is not a figure of
  speech; it is literally true, and the next section shows why it matters.
- **Depth of a node**: the number of **edges** on the path from the root
  down to that node. The root has depth 0; its children have depth 1.
- **Height of a node**: the number of edges on the **longest** path from
  that node **down** to a leaf. A leaf has height 0. The **height of the
  tree** is the height of its root.
- **Level**: all nodes at the same depth form a level. Level 0 is just the
  root.

Depth counts *down from the root to you*; height counts *down from you to
the deepest leaf*. They are measured from opposite ends, which is exactly
why the next lesson has two different recursion shapes — one that carries
depth downward and one that returns height upward.

> A pitfall worth naming now: some sources define depth/height in terms of
> *nodes on the path* rather than *edges*, so a single-node tree has height
> 1 instead of 0. This course uses the edge count consistently. What
> matters is not which convention you pick but that you never mix them
> inside one algorithm — an unnoticed off-by-one between "nodes" and
> "edges" is a classic tree bug.

## The recursive definition — and why it dictates the code

Here is the definition that the whole module rests on. A **binary tree**
is one of exactly two things:

1. **empty** (represented by `null`), or
2. a **node** holding a value, whose `left` child is itself a binary tree
   and whose `right` child is itself a binary tree.

Read that again: the definition of a tree *mentions trees*. It is
**recursive** — a tree is built out of smaller trees, bottoming out at the
empty tree. This is not a convenient way to describe trees; it is what
trees *are*.

The consequence is the single most useful fact in this module. Because the
data is defined recursively, an algorithm over it can be defined the same
way, and it will be both correct and short *for the same structural
reason*:

> To compute something about a tree, handle the empty case directly (the
> base case), otherwise combine the value at the node with the results of
> the **same computation** on `node.left` and `node.right` (the recursive
> case).

That template mirrors the definition line-for-line: the two cases of the
data (empty / node-with-two-subtrees) become the two cases of the function
(base case / recursive case). Here is the skeleton every recursive tree
algorithm fills in:

````tabs
```python
def solve(node: TreeNode | None):
    if node is None:            # case 1: empty tree — the base case
        return base_value
    left = solve(node.left)     # same computation on the left subtree
    right = solve(node.right)   # same computation on the right subtree
    return combine(node.val, left, right)   # case 2: node with two subtrees
```

```typescript
function solve(node: TreeNode | null) {
  if (node === null) {
    // case 1: empty tree — the base case
    return baseValue;
  }
  const left = solve(node.left); // same computation on the left subtree
  const right = solve(node.right); // same computation on the right subtree
  return combine(node.val, left, right); // case 2: node with two subtrees
}
```
````

Why is this guaranteed to terminate and to be correct? Termination:
each recursive call is on a **strictly smaller** tree (a proper subtree
has fewer nodes than its parent tree), and you cannot shrink a finite tree
forever — every path hits `null`. Correctness: if you assume the recursive
calls return the right answer for the two subtrees (the induction
hypothesis), and your `combine` step is right, then the whole thing is
right by structural induction — the exact same induction the data's
definition is built on. You are not "trusting the recursion" as an act of
faith; the trust is licensed by the definition of the structure.

Almost everything in this module is this skeleton with different `base_value`
and `combine`. Maximum depth, diameter, LCA, serialization — all of them
are "handle null, recurse on both children, combine." Learning trees is
largely learning what to put in those two blanks.

## Why binary, and how it's stored

Two children (rather than three, or any number) is the common case because
it is the minimum branching that still gives a *hierarchy*, and because two
children map cleanly onto binary decisions — "less vs. greater" powers the
binary search trees of the next module. General trees with arbitrary
children exist (tries, in Module 20, are one), but the two-pointer node
above is the workhorse.

Note that we store trees by **pointers**, exactly like linked lists —
scattered node allocations wired together — not in a contiguous array. (A
complete binary tree *can* be packed into an array with children of index
`i` at `2i+1` and `2i+2`; that trick is what makes heaps efficient in
Module 19. For general-shaped trees it wastes too much space, so pointers
win here.)

```complexity
{
  "operations": [
    { "name": "follow a child pointer (left/right)", "time": "O(1)", "why": "a single reference read, exactly like a linked-list next hop" },
    { "name": "visit every node (traversal)", "time": "O(n)", "why": "each of the n nodes is reached once; the recursion touches every node and every null child exactly once" },
    { "name": "recursion stack for a traversal", "time": "O(h)", "why": "at most one node per level from root to current leaf is on the call stack at a time; h = tree height — this is the whole reason balanced vs. skewed trees matter, argued in the next lessons" }
  ]
}
```

That O(h) stack cost is the hinge of the entire module: a **balanced**
tree of n nodes has height ~log₂n, so recursion uses O(log n) stack, but a
**degenerate** tree (every node has only a left child — effectively a
linked list) has height n − 1, so recursion uses O(n) stack. Same node
count, same O(n) time, wildly different space and stack-overflow risk. The
next lesson makes this concrete; Module 18 (balanced BSTs) exists mostly to
guarantee the good case.

```quiz
{
  "questions": [
    {
      "question": "Why are tree algorithms 'naturally recursive' — what actually licenses writing them as recursion?",
      "options": [
        "The tree's own definition is recursive (a tree is a node whose two children are themselves trees, or empty), so a function that handles the empty case and recurses on both subtrees mirrors the data's structure exactly — correctness follows by the same structural induction the definition is built on",
        "Recursion is the only way a computer can walk a tree — no iterative technique, not even one using an explicit stack, is capable of visiting every node of a branching structure, which is why recursion is mandatory rather than merely natural",
        "Loops cannot express two-way branching — a single while or for loop is fundamentally limited to one direction of iteration, so representing a node's two separate children within a loop body is not mechanically possible"
      ],
      "answer": 0,
      "explanation": "The recursion isn't a stylistic choice imposed on the data — it's the data's structure reflected in code. Because a tree is literally defined in terms of smaller trees, 'combine the node with the results on its two subtrees' is guaranteed to terminate (subtrees are strictly smaller) and to be correct (structural induction). You can always convert to an explicit stack, but the recursive form is the honest one."
    },
    {
      "question": "Two trees each have 1000 nodes. One is balanced, one is a straight left-only chain. A recursive traversal of both is O(n) time. What differs, and why does it matter?",
      "options": [
        "The recursion stack: the balanced tree holds ~10 frames (height ≈ log₂1000), the chain holds ~1000 frames (height = 999), because at most one frame per level from root to current node is live — so the chain risks a stack overflow the balanced tree never does",
        "Nothing differs — both are O(n) time and that's the whole story; since total node visits is the only thing that determines a traversal's resource cost, the tree's shape has no bearing on anything beyond that shared time bound",
        "The chain is faster because it has no branching to decide between — with only one child to recurse into at every node, the chain skips the branch-comparison overhead the balanced tree pays at each level, giving it a real constant-factor speed advantage"
      ],
      "answer": 0,
      "explanation": "Time counts total node visits (n for both). Stack space counts the DEPTH of the deepest live recursive path, which is the tree's height h. Balanced height is log n; a degenerate chain's height is n−1. This O(h) vs O(n) gap — identical time, opposite space — is exactly why balancing (Module 18) is worth engineering."
    }
  ]
}
```
