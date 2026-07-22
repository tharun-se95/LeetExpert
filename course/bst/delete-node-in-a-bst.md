---
title: Delete Node in a BST
type: problem
---

## Problem

Given the `root` of a binary search tree and a `key`, delete the node
with value `key` (if it exists) and return the root of the modified
tree. The result must still be a valid BST.

**Examples**

```text
      5                         5
     / \                       / \
    3   6     delete 3   →     4   6         (or: promote 2 — see below)
   / \   \                    /     \
  2   4   7                  2       7

      5                         6
     / \                       / \
    3   6     delete 5   →     3   7          (5 replaced by its
   / \   \                    / \             inorder successor, 6)
  2   4   7                  2   4
```

**Constraints:** 0 ≤ n ≤ 10⁴ nodes · −10⁵ ≤ values ≤ 10⁵ · values are
distinct.

## Attempt it first

Deletion is the hardest of the three core operations, and the reason is
worth discovering yourself. Insert always lands at a clean empty leaf;
delete can rip a node out of the *middle* of the tree, leaving up to two
orphaned subtrees that must be reattached without breaking the
invariant. Before revealing anything, enumerate the cases by *how many
children* the target node has — there are three — and work out which
one is genuinely tricky and why.

````reveal Hint — the three cases
Split on the number of children of the node to delete:

1. **No children (leaf):** remove it outright.
2. **One child:** replace the node with that child.
3. **Two children:** you cannot just promote one child — the *other*
   child's entire subtree would have no valid place to go. You need a
   single value that can legally sit at this position in place of the
   deleted one. Which value, among all values in the two subtrees, is
   allowed to go here without disturbing anything? Think about what the
   inorder-sorted order says.
````

## Why the two-children case is the whole problem

Cases 1 and 2 are mechanical. A leaf depends on nothing, so deleting it
is a single pointer set to null. A node with exactly one child can be
*spliced out*: replace it with its child, and the child's subtree —
which already satisfied the invariant relative to everything above the
deleted node — slots straight into the vacated position, still valid.

The two-children case is different because there's a genuine conflict:
remove the node and you're holding two subtrees but only one attachment
point. Promoting the left child strands the right subtree; promoting
the right child strands the left. Neither works directly.

## The insight: replace with the inorder successor

The trick is to *not really delete the node's position at all* — keep
the node, but change its **value** to one that's allowed to live there,
then delete *that* value from where it originally sat. Which value?

The node's position, in inorder-sorted order, sits exactly between all
the left-subtree values (which are smaller) and all the right-subtree
values (which are larger). The value that can legally occupy this slot
is one that is still greater than everything on the left and less than
everything remaining on the right. The **inorder successor** — the
*smallest* value in the right subtree — is exactly that: it's larger
than every left-subtree value (since it's in the right subtree, it
exceeds the node, which exceeds them all) and, being the *minimum* of
the right subtree, it's ≤ every other right-subtree value. So copying
the successor's value into the node preserves the invariant perfectly.

And here's why this makes deletion *terminate cleanly*: the inorder
successor is the leftmost node of the right subtree, so **it has no
left child**. That means deleting the successor from the right subtree
is always case 1 (leaf) or case 2 (one right child) — never the hard
two-children case again. The recursion bottoms out immediately. (The
inorder *predecessor* — the largest value in the left subtree — works
symmetrically; successor is just the conventional choice.)

## Solution

`````reveal Solution — recursive delete with successor replacement
The "return the (possibly changed) subtree root, parent reattaches"
pattern from concept lesson 1 again — it's what lets the deleted node's
*parent* update its child pointer cleanly, including when the root
itself is deleted.

````tabs
```python
def find_min(node: TreeNode) -> TreeNode:
    while node.left is not None:          # leftmost node = smallest value = inorder successor
        node = node.left
    return node

def delete_node(root: "TreeNode | None", key: int) -> "TreeNode | None":
    if root is None:
        return None                        # key not in the tree: nothing to do
    if key < root.val:
        root.left = delete_node(root.left, key)
    elif key > root.val:
        root.right = delete_node(root.right, key)
    else:
        # found the node to delete
        if root.left is None:
            return root.right              # case 1/2: leaf (right is None) or only a right child
        if root.right is None:
            return root.left               # case 2: only a left child
        # case 3: two children — replace value with inorder successor, then delete successor
        successor = find_min(root.right)
        root.val = successor.val
        root.right = delete_node(root.right, successor.val)
    return root
```

```typescript
function findMin(node: TreeNode): TreeNode {
  while (node.left !== null) node = node.left; // leftmost = smallest = inorder successor
  return node;
}

function deleteNode(root: TreeNode | null, key: number): TreeNode | null {
  if (root === null) return null; // key not in the tree: nothing to do
  if (key < root.val) {
    root.left = deleteNode(root.left, key);
  } else if (key > root.val) {
    root.right = deleteNode(root.right, key);
  } else {
    // found the node to delete
    if (root.left === null) return root.right; // case 1/2: leaf or only a right child
    if (root.right === null) return root.left; // case 2: only a left child
    // case 3: two children — replace with inorder successor, then delete it
    const successor = findMin(root.right);
    root.val = successor.val;
    root.right = deleteNode(root.right, successor.val);
  }
  return root;
}
```
````

Trace `delete 5` on the second example. Key 5 is the root, two
children. `find_min(root.right)` walks the right subtree (6, then no
left child) and returns 6. We copy 6 into the root, then recursively
delete 6 from the right subtree — where 6 is now a node whose only
child is 7, a clean case-2 splice. Result: root 6, left subtree
unchanged (3,2,4), right child 7. Still a valid BST.

```complexity
{
  "time": "O(h)",
  "space": "O(h)",
  "why": "One descent to locate the key (O(h)). In the two-children case, find_min walks down the right subtree (another O(h)) and then a second delete descends to remove the successor — but that successor is at most O(h) deep, so the total is a constant number of root-to-leaf passes: O(h). Space is the recursion stack depth, O(h)."
}
```
`````

## Why the successor choice preserves the invariant (restated tightly)

The single subtle claim deserves to be nailed down, because it's the
crux: after copying the successor `s` into the deleted node's slot, is
the tree still a valid BST? The slot must hold a value greater than all
of `L` (the left subtree) and less than all of the *remaining* right
subtree. `s` was the minimum of the original right subtree `R`, so
every remaining value of `R` (after `s` is removed) is `≥ s` — actually
`> s` since values are distinct — so `s` is less than all of them. And
`s ∈ R` means `s > root.val > ` everything in `L`, so `s` exceeds all
of `L`. Both conditions hold, so the invariant is intact. The only
thing that changed elsewhere is that `s`'s original location lost a
node, handled by the recursive delete — which, because `s` had no left
child, is a trivial splice that keeps *its* local invariant too.

## Variants

- **Insert into a BST** (previous lesson): the inverse, and strictly
  easier — insertion always terminates at a clean empty leaf, so it has
  no analogue of the two-children case.
- **Trim a Binary Search Tree** (LeetCode 669): remove *all* nodes
  outside a value range `[low, high]`; a recursive rebuild that leans
  on the invariant to prune whole subtrees at once.
- **Balanced deletion:** the plain delete here does *not* rebalance, so
  a long series of deletes can unbalance a tree just as sorted inserts
  do (lesson 2). AVL / red-black trees run rotations after each delete
  to restore `h = O(log n)`.

```quiz
{
  "questions": [
    {
      "question": "Deleting a node with two children can't be done by simply promoting one of its children. Why not?",
      "options": [
        "Because promoting one child leaves the OTHER child's entire subtree with no valid attachment point — there's only one vacated slot but two subtrees to reconnect",
        "Because the children might have the same value — if the two child subtrees happened to share a duplicate value at their roots, promoting either one would create an ambiguous, invalid tree state",
        "Because the BST invariant forbids any node from having two children after a deletion — the invariant includes a rule that a freshly-promoted node may retain at most one child, which directly rules out simple promotion"
      ],
      "answer": 0,
      "explanation": "The conflict is structural: one hole, two orphaned subtrees. Promoting the left child strands the right subtree (and vice versa). The successor trick sidesteps this by keeping the node's position and only swapping in a value that legally belongs there, so no subtree is ever orphaned."
    },
    {
      "question": "In the two-children case we replace the node's value with its inorder successor, then delete the successor. Why is deleting the successor guaranteed to be easy (never itself a two-children case)?",
      "options": [
        "Because the successor is always a leaf — the leftmost node of any subtree is guaranteed to have no children whatsoever, making its removal a trivial pointer-nulling operation every time",
        "Because the successor is the leftmost node of the right subtree, so it has no left child — deletion of a node with no left child is always the leaf or one-(right)-child case, which terminates immediately",
        "Because the successor has already been copied, so deleting it does nothing — once its value has been transferred to the target node's slot, the original successor node becomes an inert duplicate that can simply be ignored"
      ],
      "answer": 1,
      "explanation": "The inorder successor is found by walking left until you can't — so by construction it has no left child (it may have a right child). A node missing one child is case 1 or case 2, never case 3. That's why the recursion bottoms out and never re-triggers the hard case."
    },
    {
      "question": "Why does copying the inorder successor's value into the deleted node's slot keep the tree a valid BST?",
      "options": [
        "Because the successor is greater than every value in the left subtree (it lies in the right subtree, above the node) and, being the minimum of the right subtree, is less than every remaining right-subtree value — exactly the two conditions the slot requires",
        "Because the successor is the largest value in the whole tree — being the single greatest value anywhere in the structure automatically qualifies it to replace any node without violating ordering anywhere else",
        "Because any value from the right subtree can legally occupy that slot — since every value in the right subtree is already greater than everything on the left, all of them are interchangeably valid replacements for the deleted node"
      ],
      "answer": 0,
      "explanation": "The slot needs a value strictly between all left-subtree values and all remaining right-subtree values. The minimum of the right subtree is the unique value satisfying both bounds after its own removal, which is why the successor (not just any right-subtree node) is the correct replacement."
    }
  ]
}
```
