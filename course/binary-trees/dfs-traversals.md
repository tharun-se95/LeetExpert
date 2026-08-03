---
title: DFS Traversals
type: concept
---

## Visiting every node — but in what order?

"Traverse the tree" means visit every node exactly once. The previous
lesson showed the recursive skeleton that does this in O(n). But a tree
branches, so unlike an array there is no single obvious order — at every
node you have three things to do (process **this** node, recurse **left**,
recurse **right**) and the *order you interleave them in* is a genuine
choice with genuine consequences. **Depth-first search (DFS)** commits to
going as deep as possible down one branch before backing up. The three
classical DFS orders differ in exactly one thing: *when the current node
gets processed relative to its two subtrees.*

## The three orders, by the single rule that defines each

Let "visit" mean *do the work at this node* (print it, collect its value,
whatever). In all three, you still recurse left then right; only the
placement of the visit moves:

- **Preorder**: visit **node**, then recurse left, then recurse right.
  The node is handled *before* its subtrees — "root first."
- **Inorder**: recurse left, then visit **node**, then recurse right.
  The node is handled *between* its two subtrees — "root in the middle."
- **Postorder**: recurse left, then recurse right, then visit **node**.
  The node is handled *after* both subtrees — "root last."

The names are literal: *pre/in/post* describe where the node's own visit
sits relative to its children's. On this tree —

```diagram
{
  "id": "binary-tree",
  "nodes": [
    { "id": "1", "left": "2", "right": "3" },
    { "id": "2", "left": "4", "right": "5" }
  ]
}
```

- **Preorder**: 1, 2, 4, 5, 3  (node, then its left subtree, then its right)
- **Inorder**: 4, 2, 5, 1, 3  (left subtree, node, right subtree)
- **Postorder**: 4, 5, 2, 3, 1  (both subtrees, then node)

Trace preorder by hand once: at 1 we emit 1, then descend left to 2, emit
2, descend left to 4, emit 4 (4 is a leaf, both recursions hit null and
return), back at 2 we descend right to 5, emit 5, back to 1, descend right
to 3, emit 3. The recursion's back-and-forth *is* the traversal.

## The recursive implementations

Each is the module's skeleton with the visit line moved. Nothing else
changes:

````tabs
```python
def preorder(node: TreeNode | None, out: list[int]) -> None:
    if node is None:
        return
    out.append(node.val)        # visit BEFORE the subtrees
    preorder(node.left, out)
    preorder(node.right, out)

def inorder(node: TreeNode | None, out: list[int]) -> None:
    if node is None:
        return
    inorder(node.left, out)
    out.append(node.val)        # visit BETWEEN the subtrees
    inorder(node.right, out)

def postorder(node: TreeNode | None, out: list[int]) -> None:
    if node is None:
        return
    postorder(node.left, out)
    postorder(node.right, out)
    out.append(node.val)        # visit AFTER the subtrees
```

```typescript
function preorder(node: TreeNode | null, out: number[]): void {
  if (node === null) return;
  out.push(node.val); // visit BEFORE the subtrees
  preorder(node.left, out);
  preorder(node.right, out);
}

function inorder(node: TreeNode | null, out: number[]): void {
  if (node === null) return;
  inorder(node.left, out);
  out.push(node.val); // visit BETWEEN the subtrees
  inorder(node.right, out);
}

function postorder(node: TreeNode | null, out: number[]): void {
  if (node === null) return;
  postorder(node.left, out);
  postorder(node.right, out);
  out.push(node.val); // visit AFTER the subtrees
}
```
````

All three are **O(n) time** — each node is reached once and does O(1) work
at its visit — and **O(h) space** for the recursion stack, where h is the
height, because the deepest chain of un-returned calls runs from the root
to the current node (one frame per level). This is the O(h) stack cost from
the previous lesson, now with concrete code behind it.

## When each order is the right tool

The orders aren't interchangeable trivia; each matches a class of problem:

- **Postorder** is the natural fit whenever a node's answer *depends on its
  children's answers* — you must finish both subtrees before you can
  combine. Computing height, diameter, "is this subtree balanced," deleting
  a tree (free the children before the parent) — all postorder. This is
  "bottom-up" recursion, the subject of two lessons from now, and it is the
  most common shape in this module.
- **Preorder** fits when a node's work depends on information coming *from
  above* — passing a running path, a depth, or a prefix down to children.
  Serializing a tree (next-to-last lesson) emits preorder so the root
  comes first and reconstruction can start from it. This is "top-down."
- **Inorder** has one headline use, next.

## Why inorder on a BST yields sorted output

Preview of Module 18. A **binary search tree** maintains one invariant at
every node: *everything in the left subtree is smaller than the node, and
everything in the right subtree is larger.* Now apply the inorder rule —
left subtree, then node, then right subtree — and ask what it prints:

Inorder emits *everything smaller than the node* (the entire left subtree,
recursively in sorted order by the same argument), then *the node itself*,
then *everything larger* (the right subtree, sorted). So for every node,
its value lands in the output after all smaller values and before all
larger ones. That is the definition of sorted order. By induction over the
tree, inorder traversal of a BST produces its values in ascending order —
in O(n), with no comparison sort needed, because the BST's structure
*already encodes* the order and inorder is exactly the walk that reads it
out. Keep this fact; the next module builds heavily on it.

## The iterative version: making the call stack explicit

Recursion is doing bookkeeping for you invisibly: every time `inorder`
calls itself, the language pushes a **stack frame** remembering where to
resume — specifically, which node it was working on and that it still owes
"visit the node, then recurse right" after the left call returns. An
iterative traversal does that same bookkeeping by hand, with an explicit
stack. This matters when recursion depth would overflow the call stack (a
degenerate tree of height n), and it makes the hidden mechanism visible.

Here is inorder, iteratively:

````tabs
```python
def inorder_iterative(root: TreeNode | None) -> list[int]:
    out: list[int] = []
    stack: list[TreeNode] = []
    curr = root
    while curr is not None or stack:
        while curr is not None:      # go as far LEFT as possible,
            stack.append(curr)       # remembering each node we pass
            curr = curr.left
        curr = stack.pop()           # backtrack to the deepest un-visited node
        out.append(curr.val)         # visit it (left subtree is now done)
        curr = curr.right            # then turn to its right subtree
    return out
```

```typescript
function inorderIterative(root: TreeNode | null): number[] {
  const out: number[] = [];
  const stack: TreeNode[] = [];
  let curr: TreeNode | null = root;
  while (curr !== null || stack.length > 0) {
    while (curr !== null) {
      // go as far LEFT as possible,
      stack.push(curr); // remembering each node we pass
      curr = curr.left;
    }
    curr = stack.pop()!; // backtrack to the deepest un-visited node
    out.push(curr.val); // visit it (left subtree is now done)
    curr = curr.right; // then turn to its right subtree
  }
  return out;
}
```
````

Read the stack as memory the recursion had for free. In the recursive
version, when you descend left, the language remembers on your behalf,
"once this left call finishes, come back to *this* node, visit it, then go
right." The `while curr is not None: push; go left` loop is doing precisely
that remembering — it stacks up the chain of ancestors you'll need to
return to. Popping pulls back the deepest node whose left side is fully
explored (that's why we visit it *now* — inorder's "node after left
subtree" rule), and setting `curr = curr.right` is the deferred "then go
right." The explicit stack holds exactly the nodes the call stack would
have held as frames: the current root-to-node spine, at most O(h) of them.

Same output as the recursive version, same O(n) time, same O(h) space —
but now the space is a heap-allocated list you control, not the call stack,
so a height-n tree can't blow the recursion limit. That is the entire
reason to prefer the iterative form when it matters.

```complexity
{
  "operations": [
    { "name": "any DFS traversal (recursive or iterative)", "time": "O(n) time", "why": "every node is pushed/visited exactly once and does O(1) work; the total is proportional to the node count regardless of order" },
    { "name": "space, balanced tree", "time": "O(log n)", "why": "the stack (call stack or explicit) holds one entry per level of the current root-to-node path; a balanced tree's height is ~log₂n" },
    { "name": "space, degenerate tree", "time": "O(n)", "why": "a left- or right-leaning chain has height n−1, so the whole spine is on the stack at once — the iterative form survives this without a recursion-limit crash" }
  ]
}
```

```quiz
{
  "questions": [
    {
      "question": "Inorder traversal of a binary SEARCH tree prints values in ascending order. Why is that guaranteed by the traversal rule, not a coincidence?",
      "options": [
        "Inorder sorts the values as it collects them — the traversal function performs an implicit comparison-based sort on the accumulated output list as each new value is appended, which is what produces the ascending order",
        "A BST guarantees left subtree < node < right subtree; inorder emits (left subtree, then node, then right subtree), so every value is printed after all smaller values and before all larger ones — which is the definition of sorted, provable by induction over the tree",
        "Inorder happens to visit nodes left-to-right on the page — since a BST is typically drawn with smaller values toward the left side of the diagram, reading the picture left to right happens to match ascending order for this visualization convention"
      ],
      "answer": 1,
      "explanation": "Inorder does no sorting — it's O(n) with no comparisons between collected values. The order comes entirely from the BST invariant lining up with inorder's 'node between its subtrees' rule: smaller things are emitted first (left), then the node, then larger (right), recursively. The structure already holds the sort; inorder is just the walk that reads it out."
    },
    {
      "question": "In the iterative inorder traversal, what is the explicit stack actually storing — and what was doing that job in the recursive version?",
      "options": [
        "The chain of ancestor nodes from the root down to the current node whose left subtrees still need finishing — exactly the stack frames the language's call stack held implicitly, each remembering 'come back here, visit me, then go right'",
        "Every node in the tree, so none is visited twice — the stack acts as a visited-set, holding every node the traversal has ever encountered to prevent the algorithm from processing the same node more than once",
        "The output values, waiting to be reversed at the end — the algorithm collects results in reverse order for efficiency, and the stack holds them until a final reversal pass produces the correct ascending sequence"
      ],
      "answer": 0,
      "explanation": "Recursion's call stack silently remembers, for each node you descended past, that you owe it a visit and a right-recursion once its left side returns. The explicit stack makes that memory tangible: it holds only the current root-to-node spine (O(h) entries), pops the deepest left-finished node to visit it, then pivots to its right child — the deferred second half of the work."
    }
  ]
}
```
