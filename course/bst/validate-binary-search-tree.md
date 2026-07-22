---
title: Validate Binary Search Tree
type: problem
---

## Problem

Given the `root` of a binary tree, determine whether it is a **valid
binary search tree**. Recall the invariant from the concept lesson: at
every node, *all* values in the left subtree must be strictly less than
the node, and *all* values in the right subtree strictly greater.

**Examples**

```text
      2
     / \
    1   3        →  true

      5
     / \
    1   4        →  false  (4 is in 5's right subtree, fine so far...
       / \                  but 3 is in 5's right subtree and 3 < 5)
      3   6
```

**Constraints:** 1 ≤ n ≤ 10⁴ nodes · node values fit in a 32-bit
signed integer (so they can be as extreme as −2³¹ or 2³¹−1 — this
detail will bite a naive fix later).

## Attempt it first

This problem looks trivial and has a famous trap, so do not skip
straight to code. Write down the check you'd perform at each node,
then ask yourself: does it catch the second example above? Specifically
— if you only compare each node to its immediate children, what happens
at the node with value 5? Try to *break* your own solution before
reading on.

````reveal Hint — the trap has a name
The tempting check is "at each node, verify `left.val < node.val <
right.val`," recursing into both children. This is the children-only
reading of the invariant that the concept lesson warned about. It is
**wrong**, and the examples above are built to expose it. Before
reading the solution, figure out what information a node needs from its
*ancestors* — not just its children — to be validated correctly.
````

## The trap, made concrete

The naive approach checks, at each node, only that its direct children
are on the correct side:

```text
      5
     / \
    1   4
       / \
      3   6
```

Walk the naive check through this tree. At the root 5: left child 1 < 5
✓, right child 4 > 5 ✓. At node 4: left child 3 < 4 ✓, right child 6 >
4 ✓. Every *local* parent-child comparison passes, so the naive check
returns **true**. But the tree is not a valid BST: the value **3 lives
in the right subtree of 5**, and 3 < 5 violates the invariant. A search
for 3 starting at the root would go right (3... no, 3 < 5, go left) and
miss it entirely.

The bug is exactly the concept lesson's point: the invariant is about
whole subtrees, so a node must be consistent with *every ancestor*, not
just its parent. Node 3's parent (4) is happy, but 3's *grandparent*
(5) is not — and the local check never consults the grandparent.

## The insight: carry a range that narrows as you descend

Instead of asking "is this node okay relative to its children," ask
"is this node's value inside the open interval of values *allowed* at
this position?" The root may hold any value, so its allowed range is
`(−∞, +∞)`. When you step **left** from a node with value `v`,
everything below must be less than `v`, so the upper bound tightens to
`v`: the range becomes `(low, v)`. When you step **right**, everything
below must exceed `v`, so the lower bound tightens: `(v, high)`.

Crucially, these bounds *accumulate* down the path. By the time you
reach node 3 in the bad example, you arrived by going **right** from 5
(lower bound became 5) then **left** from 4 (upper bound became 4) — so
3's allowed range is `(5, 4)`, and 3 is not in it (indeed the range is
empty, but the check `3 > 5` already fails). The lower bound of 5,
inherited from the *grandparent*, is exactly the ancestor information
the naive check threw away. Each node is valid iff `low < node.val <
high`, and you recurse with the appropriately tightened bound on each
side.

## Solution

`````reveal Solution — range-passing recursion
The bounds are open (strict inequalities), since BST values here are
distinct. We use `None`/`null` to represent ±∞ so we never rely on a
sentinel value that a real 32-bit node might actually equal — the
constraint that values can reach 2³¹−1 is why picking `Number.MAX` or
`float('inf')` as a fake bound is fine, but picking a large *integer*
sentinel would be a bug.

````tabs
```python
def is_valid_bst(root: "TreeNode | None") -> bool:
    def valid(node: "TreeNode | None",
              low: "int | None", high: "int | None") -> bool:
        if node is None:
            return True                       # empty subtree is trivially valid
        if low is not None and node.val <= low:
            return False                      # violates a lower bound from some ancestor
        if high is not None and node.val >= high:
            return False                      # violates an upper bound from some ancestor
        # going left tightens the upper bound to node.val; right tightens the lower bound
        return (valid(node.left, low, node.val)
                and valid(node.right, node.val, high))

    return valid(root, None, None)
```

```typescript
function isValidBST(root: TreeNode | null): boolean {
  function valid(node: TreeNode | null, low: number | null, high: number | null): boolean {
    if (node === null) return true; // empty subtree is trivially valid
    if (low !== null && node.val <= low) return false; // violates an ancestor's lower bound
    if (high !== null && node.val >= high) return false; // violates an ancestor's upper bound
    // going left tightens the upper bound to node.val; right tightens the lower bound
    return valid(node.left, low, node.val) && valid(node.right, node.val, high);
  }
  return valid(root, null, null);
}
```
````

```complexity
{
  "time": "O(n)",
  "space": "O(h)",
  "why": "Each node is visited exactly once and does O(1) comparison work, so time is O(n). Space is the recursion stack depth, which is the tree's height h — O(log n) for a balanced tree, O(n) in the degenerate case."
}
```
`````

`````reveal Alternative — inorder traversal must be strictly increasing
The concept lesson proved a BST's inorder traversal is sorted. The
*converse* is also true and gives a second solution: a binary tree is a
valid BST **iff** its inorder traversal is strictly increasing. So walk
the tree inorder and check each value is strictly greater than the
previous one — the moment it isn't, some node sits out of order, which
can only happen if the invariant is violated somewhere.

````tabs
```python
def is_valid_bst_inorder(root: "TreeNode | None") -> bool:
    prev: "int | None" = None
    stack: list["TreeNode"] = []
    node = root
    while node is not None or stack:
        while node is not None:           # descend to the leftmost unvisited node
            stack.append(node)
            node = node.left
        node = stack.pop()
        if prev is not None and node.val <= prev:
            return False                  # not strictly increasing → not a BST
        prev = node.val
        node = node.right
    return True
```

```typescript
function isValidBSTInorder(root: TreeNode | null): boolean {
  let prev: number | null = null;
  const stack: TreeNode[] = [];
  let node = root;
  while (node !== null || stack.length > 0) {
    while (node !== null) {
      // descend to the leftmost unvisited node
      stack.push(node);
      node = node.left;
    }
    node = stack.pop()!;
    if (prev !== null && node.val <= prev) return false; // not strictly increasing → not a BST
    prev = node.val;
    node = node.right;
  }
  return true;
}
```
````

Same O(n) time; O(h) space for the explicit stack. This version makes
the "why local checks fail" point vividly: it never compares a node to
its children at all — it compares each node to the *globally previous*
value in sorted order, which is exactly the kind of non-local
constraint the naive approach missed.

```complexity
{
  "time": "O(n)",
  "space": "O(h)",
  "why": "Every node is pushed and popped once (O(n)). The stack holds at most one root-to-leaf path at a time, so its depth is the height h."
}
```
`````

## Variants

- **Kth Smallest Element in a BST** (next lesson): also exploits
  inorder-is-sorted, but stops *early* instead of walking the whole
  tree — the same traversal, put to a different use.
- **Recover Binary Search Tree** (LeetCode 99): exactly two nodes of a
  BST are swapped; find and fix them. The inorder-must-be-increasing
  view is the key — the swapped pair shows up as the out-of-order
  elements in the inorder sequence.
- **Validate BST** contrasts with **Same Tree / Symmetric Tree**
  (Module 17 territory, not covered), which compare *structure*; here the constraint is about
  *value ordering* across the whole subtree, not shape.

```quiz
{
  "questions": [
    {
      "question": "The naive check 'left.val < node.val < right.val, recursing both sides' returns true on a tree that is NOT a valid BST. Why does it fail?",
      "options": [
        "It fails only on trees with duplicate values — the local children-only check is actually sound for trees with all-distinct values, and only breaks down once two equal values are allowed to appear in the structure",
        "It has an off-by-one error in the comparison operators — using <= and >= instead of strict < and > at the parent-child comparison is what lets this particular invalid tree slip through as a false positive",
        "It only enforces the invariant between a node and its immediate children, so a value that is on the correct side of its parent but the wrong side of a higher ancestor slips through — the ancestor's constraint is never checked"
      ],
      "answer": 2,
      "explanation": "The BST invariant is a whole-subtree constraint: every node must respect EVERY ancestor. The children-only check consults only the parent, so a node like 3 sitting in the right subtree of 5 (via a parent 4) passes locally while violating the grandparent 5. The range-passing approach fixes this by carrying each ancestor's bound down."
    },
    {
      "question": "In the range-passing solution, why do we represent the ±∞ bounds with None/null rather than a large integer constant?",
      "options": [
        "Node values can reach the full 32-bit range (down to −2³¹, up to 2³¹−1), so any concrete integer sentinel could equal a real node value and cause a valid tree to be rejected or an invalid one accepted. None/null is a bound no real value can collide with.",
        "None/null makes the recursion faster — comparing against a null sentinel short-circuits before the arithmetic comparison would even run, shaving a small but measurable amount of time off each recursive call",
        "For readability only — an integer sentinel would work identically, since swapping None/null for a fixed constant like ±2³² would behave the same in every case, being just outside the stated 32-bit value range"
      ],
      "answer": 0,
      "explanation": "A sentinel bound only works if it lies strictly outside the possible value range. Since values span the entire 32-bit signed range, there is no 'safe' integer to use as ±∞ — so an out-of-band marker (None/null, or a floating ±infinity) is required for correctness, not style."
    }
  ]
}
```
