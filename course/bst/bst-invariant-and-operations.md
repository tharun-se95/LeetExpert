---
title: The BST Invariant & Core Operations
type: concept
---

## What a plain binary tree can't do

Module 17 gave you binary trees and the traversals over them — but a
raw binary tree is just *shape*. Ask it "is 42 in here?" and it has no
better answer than "let me visit every node until I find it or run
out" — O(n), the same as a linked list. The tree's branching bought
you nothing, because nothing about *where* a value sits tells you
where to look next.

A **binary search tree** adds exactly one rule that turns that
branching into a decision procedure. The rule is small; everything in
this module is a consequence of it.

## The invariant

A binary tree is a BST if, **at every node**, the following holds:

> Every value in the node's **left subtree** is **less than** the
> node's value, and every value in its **right subtree** is **greater
> than** the node's value.

Read that phrase *every value in the subtree* carefully, because the
single most common BST bug lives in misreading it. The rule is **not**
"left child < node < right child." It is about the *entire* left and
right subtrees, recursively, all the way down.

Here is a tree that satisfies the weak (children-only) reading but is
**not** a BST:

```diagram
{
  "id": "binary-tree",
  "nodes": [
    { "id": "5", "left": "3", "right": "8" },
    { "id": "3", "left": "1", "right": "6" },
    { "id": "8" },
    { "id": "1" },
    { "id": "6" }
  ]
}
```

Every parent-child pair looks fine locally: 3 < 5, 8 > 5, 1 < 3, 6 > 3.
But 6 sits in the *left* subtree of 5, and 6 > 5 — a violation of the
full invariant, even though every individual parent-child comparison
passed. Watch what that does to search: looking for 6, you start at
the root, compare 6 against 5, see 6 > 5, and go *right* toward 8 —
because that's what "greater goes right" means. You never even look at
3's subtree, where 6 is actually sitting. The search reports "not
found" on a value that's really in the tree. The invariant exists
precisely so that "go left when smaller, go right when larger" is
always correct. If a value can be on the wrong side of some *ancestor*
(not just its parent), the search breaks. So the invariant must be
stated over subtrees, and it must hold at **every** node
simultaneously. We will make the "checking this correctly" problem its
own lesson (Validate BST) — for now, just hold onto the fact that
local checks are insufficient.

We'll use this node definition throughout:

````tabs
```python
class TreeNode:
    def __init__(self, val: int,
                 left: "TreeNode | None" = None,
                 right: "TreeNode | None" = None):
        self.val = val
        self.left = left
        self.right = right
```

```typescript
class TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
  constructor(val: number, left: TreeNode | null = null, right: TreeNode | null = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}
```
````

## Search: the invariant as a decision procedure

Picture walking a forest trail that forks over and over, where every
fork has a signpost naming exactly one boundary value — "everything
down the left path is smaller than this, everything down the right is
larger." You're looking for a specific number carved on a tree deep in
the forest. At each signpost you don't have to check both paths or
backtrack — you just compare your number to the post and walk the one
path that could possibly contain it, trusting that the other path
holds nothing you need. Whole sections of forest get ruled out with a
single glance at a signpost, never visited at all.

That's exactly what the invariant buys you: at any node, the value you
want is on exactly one side, and you can tell which without looking at
that side at all. If the target is less than the current node, it
cannot be in the right subtree (everything there is larger), so you go
left — and vice versa. Each comparison discards an entire subtree:

````tabs
```python
def search(root: "TreeNode | None", target: int) -> "TreeNode | None":
    node = root
    while node is not None:
        if target == node.val:
            return node
        node = node.left if target < node.val else node.right
    return None
```

```typescript
function search(root: TreeNode | null, target: number): TreeNode | null {
  let node = root;
  while (node !== null) {
    if (target === node.val) return node;
    node = target < node.val ? node.left : node.right;
  }
  return null;
}
```
````

This is binary search (Module 13) walking a tree instead of an array.
Every step throws away one branch; the number of steps is bounded by
how many nodes lie on the path from root to a leaf — the tree's
**height**, `h`. So search is **O(h)**. Notice we said `h`, not
`log n`: whether `h` is `log n` or `n` depends on the tree's shape,
and that dependence is the entire subject of the next lesson. For now,
observe that *every* operation below is also O(h), because they all
begin with a search-like descent.

## Insert: search, then attach at the empty spot

To insert a value, you search for it. Because it isn't there, the
search "falls off" the tree at some empty child slot — and that slot
is exactly the one place the value can go while keeping the invariant
true, because the search path was governed by the same less-than /
greater-than comparisons that the invariant demands. So you attach a
new leaf there:

````tabs
```python
def insert(root: "TreeNode | None", val: int) -> TreeNode:
    if root is None:
        return TreeNode(val)              # fell off the tree: this is the spot
    if val < root.val:
        root.left = insert(root.left, val)
    elif val > root.val:
        root.right = insert(root.right, val)
    # val == root.val: already present, do nothing (a set, not a multiset)
    return root
```

```typescript
function insert(root: TreeNode | null, val: number): TreeNode {
  if (root === null) return new TreeNode(val); // fell off the tree: this is the spot
  if (val < root.val) {
    root.left = insert(root.left, val);
  } else if (val > root.val) {
    root.right = insert(root.right, val);
  }
  // val === root.val: already present, do nothing (a set, not a multiset)
  return root;
}
```
````

The recursion descends one level per call and does O(1) work per
level, so insert is O(h) — the descent to the empty slot dominates;
attaching the leaf is constant. The pattern "return the (possibly new)
subtree root, and let the parent reassign its child pointer" is worth
absorbing now: delete uses the same shape, and it's the cleanest way
to handle "the root itself might change."

## Delete: the one operation with real cases

Deletion is harder because removing an *internal* node leaves a hole
with up to two dangling subtrees that must be reconnected without
violating the invariant. There are three cases, and the third is the
only one with any subtlety:

1. **Leaf** — no children. Just remove it; nothing depends on it.
2. **One child** — splice the node out by replacing it with its single
   child. The child's subtree already satisfies the invariant relative
   to everything above, because it occupied a valid position under the
   deleted node.
3. **Two children** — you can't just promote one child, because the
   other child's whole subtree would have nowhere valid to attach. The
   standard move: find the node's **inorder successor** (the smallest
   value in the right subtree), copy its value into the node being
   "deleted," then delete *that successor* from the right subtree
   instead. The successor has no left child (it's the leftmost node of
   the right subtree), so deleting it is case 1 or case 2 — never case
   3 again. Why does this preserve the invariant? The successor is, by
   definition, the smallest value greater than everything in the left
   subtree and smaller than everything else in the right subtree — so
   it is *exactly* the value allowed to sit at that node's position.

````tabs
```python
def find_min(node: TreeNode) -> TreeNode:
    while node.left is not None:      # leftmost node = smallest value
        node = node.left
    return node

def delete(root: "TreeNode | None", val: int) -> "TreeNode | None":
    if root is None:
        return None
    if val < root.val:
        root.left = delete(root.left, val)
    elif val > root.val:
        root.right = delete(root.right, val)
    else:
        # found it — handle the three cases
        if root.left is None:
            return root.right          # cases: leaf (right is None too) or one child
        if root.right is None:
            return root.left
        successor = find_min(root.right)
        root.val = successor.val        # copy successor's value up
        root.right = delete(root.right, successor.val)  # then delete the successor
    return root
```

```typescript
function findMin(node: TreeNode): TreeNode {
  while (node.left !== null) node = node.left; // leftmost node = smallest value
  return node;
}

function deleteNode(root: TreeNode | null, val: number): TreeNode | null {
  if (root === null) return null;
  if (val < root.val) {
    root.left = deleteNode(root.left, val);
  } else if (val > root.val) {
    root.right = deleteNode(root.right, val);
  } else {
    // found it — handle the three cases
    if (root.left === null) return root.right; // leaf (right null too) or one child
    if (root.right === null) return root.left;
    const successor = findMin(root.right);
    root.val = successor.val; // copy successor's value up
    root.right = deleteNode(root.right, successor.val); // then delete the successor
  }
  return root;
}
```
````

Trace the two-children case on a concrete tree: root `5`, left subtree
`3` (children `1` and `4`), right subtree `8` (children `7` and `9`).
Deleting `5`: it has two children, so find its inorder successor —
the smallest value in its right subtree. Starting at `8` and walking
left, `7` has no left child, so `7` is the successor. Copy `7`'s value
into the node currently holding `5` (the root's value becomes `7`),
then delete `7` from the right subtree. `7` is a leaf there, so that
deletion is case 1 — just remove it. Final tree: root `7`, left
subtree unchanged (`3` with children `1`, `4`), right subtree `8` with
only child `9`. Inorder still reads `1, 3, 4, 7, 8, 9` — sorted, one
value shorter, exactly as deleting `5` from a sorted sequence should
look.

Delete does at most one descent to find the node (O(h)) plus, in the
two-children case, one more descent to find and remove the successor
(another O(h)) — two passes down the tree, still **O(h)** overall (the
two O(h) passes add to O(2h), and constant factors are exactly what
Big O discards — O(2h) and O(h) are the same class).

## Inorder traversal yields sorted order — and here's why

You met inorder traversal in Module 17: recurse left, visit the node,
recurse right. On a BST this produces values in **ascending sorted
order**, and this is not a coincidence to memorize — it falls directly
out of the invariant. Here is the argument.

Claim: inorder traversal of any BST visits values in strictly
increasing order.

Proof by structural induction on the tree. A single node (or empty
tree) is trivially "sorted." Now take any node `x` with left subtree
`L` and right subtree `R`, and assume inorder traversal of `L` and of
`R` are each already sorted (the induction hypothesis). Inorder
traversal of the whole tree emits, in order: *all of L*, then `x`,
then *all of R*. By the invariant, **every** value in `L` is less than
`x`, and **every** value in `R` is greater than `x`. So the sequence
(L's values, then x, then R's values) is: a sorted block all below
`x`, then `x`, then a sorted block all above `x` — which is itself
sorted. That's the whole proof. Notice it used the *subtree* form of
the invariant, not the children-only form — this is another place the
distinction matters concretely.

````tabs
```python
def inorder(root: "TreeNode | None", out: list[int]) -> None:
    if root is None:
        return
    inorder(root.left, out)     # all values < root.val, in sorted order
    out.append(root.val)        # root.val, greater than everything on the left
    inorder(root.right, out)    # all values > root.val, in sorted order
```

```typescript
function inorder(root: TreeNode | null, out: number[]): void {
  if (root === null) return;
  inorder(root.left, out); // all values < root.val, in sorted order
  out.push(root.val); // root.val, greater than everything on the left
  inorder(root.right, out); // all values > root.val, in sorted order
}
```
````

This single fact — a BST is a sorted sequence you can also search,
insert into, and delete from in O(h) — is why BSTs underpin ordered
maps and sets. The next two problem lessons (Validate BST, Kth
Smallest) are direct cash-outs of it.

## Complexity, and the question it forces

```complexity
{
  "operations": [
    { "name": "search", "time": "O(h)", "why": "each comparison discards one subtree; steps = length of a root-to-leaf path = height h" },
    { "name": "insert", "time": "O(h)", "why": "a search to the empty slot (O(h)) plus O(1) to attach the new leaf" },
    { "name": "delete", "time": "O(h)", "why": "descent to find the node, plus in the two-children case a second descent to the inorder successor — two O(h) passes, still O(h)" },
    { "name": "inorder traversal", "time": "O(n)", "why": "visits every node exactly once — this one is not O(h); it's inherently a full walk" }
  ]
}
```

Every core operation is O(h). That is only a *good* bound if `h` is
small — ideally O(log n), the way binary search over a sorted array is
O(log n). But nothing we've built *forces* `h` to be small. Insert the
values 1, 2, 3, 4, 5 in that order and trace where each one lands:
every value is larger than everything before it, so every insert goes
right, and you get a tree that is really just a downward-sloping chain
— height `n`, and O(h) = O(n). The abstraction has silently collapsed
back into a linked list. Fixing that — guaranteeing `h` stays
O(log n) — is the subject of the next lesson.

```quiz
{
  "questions": [
    {
      "question": "Why must the BST invariant be stated over entire subtrees ('all values in the left subtree < node') rather than just immediate children ('left child < node')?",
      "options": [
        "Subtree wording is only needed for delete, not for search — search only ever compares against immediate children during its descent, so the weaker children-only rule is already sufficient to guarantee search correctness on its own",
        "The two statements are equivalent — subtrees is just more precise wording for the same rule; any tree satisfying the children-only version automatically satisfies the full-subtree version too, since local correctness everywhere implies global correctness",
        "Search compares the target against a node and then commits to ONE side, skipping the other entirely. A value that is on the correct side of its parent but the wrong side of a higher ancestor lives in a subtree the search will skip — so search would wrongly report it absent. The children-only rule permits exactly such values."
      ],
      "answer": 2,
      "explanation": "The invariant's job is to make 'go left if smaller, right if larger' correct at every step. That requires every value in a subtree to be on the right side of EVERY ancestor above it, not just its parent — otherwise the pruning that makes search O(h) can skip past the target."
    },
    {
      "question": "The inorder-yields-sorted proof relies on which specific fact at each node?",
      "options": [
        "That the tree is balanced — the proof relies on the tree's height staying logarithmic, since an unbalanced, chain-shaped tree would break the inductive argument that inorder traversal stays sorted",
        "That the left and right children are themselves sorted — the induction only needs the two immediate child values to already be in relative order to itself, without needing to reason about the child's own subtrees at all",
        "That every value in the left subtree is less than the node and every value in the right subtree is greater — so concatenating (sorted L, node, sorted R) stays sorted"
      ],
      "answer": 2,
      "explanation": "The induction step glues three pieces: a sorted block entirely below the node, the node, and a sorted block entirely above it. It's the SUBTREE-wide invariant that guarantees those blocks are entirely-below and entirely-above — the children-only version wouldn't give you that, and the proof would fail."
    },
    {
      "question": "All core BST operations are O(h). Why is that not automatically O(log n)?",
      "options": [
        "It is — h is always log n for a binary tree; height is a mathematical property that holds regardless of how the nodes happen to be arranged or in what order they were inserted",
        "Because h (height) depends on the tree's shape, which depends on insertion order. Inserting already-sorted values makes every insert go the same direction, producing a chain of height n — so O(h) becomes O(n).",
        "Because traversal is O(n), which dominates — since a full traversal always costs O(n) regardless of height, that linear cost is what actually determines the real running time of insert, search, and delete in practice"
      ],
      "answer": 1,
      "explanation": "O(h) is only as good as h is small. A binary tree CAN have height log n, but nothing in plain insert forces it to — pathological (e.g. sorted) input degenerates the tree into a linked list of height n. Guaranteeing h = O(log n) is what balancing, the next lesson, is for."
    }
  ]
}
```
