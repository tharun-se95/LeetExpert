---
title: Construct Binary Tree from Preorder and Inorder Traversal
type: problem
---

## Problem

Given two integer arrays `preorder` and `inorder` — the preorder and
inorder traversal of the **same** binary tree (all values unique) —
reconstruct and return that binary tree. (LeetCode 105.)

**Examples**

```examples
preorder = [3,9,20,15,7], inorder = [9,3,15,20,7] → [3,9,20,null,null,15,7]
```

```text
      3
     / \
    9  20
       /  \
      15   7
```

```constraint
1 ≤ n ≤ 3000 nodes · all values unique (load-bearing — see below)
```

## Attempt it first

This problem asks you to reverse two of the DFS Traversals concept
lesson's outputs back into the tree that produced them. Before opening
anything, work out two facts precisely: (1) given only `preorder`, which
single element do you know for certain is the root, and why? (2) once
you know the root's *value*, what does that tell you about how
`inorder` splits into "everything in the left subtree" and "everything
in the right subtree"?

```sandbox
{
  "id": "construct-binary-tree-from-preorder-and-inorder",
  "fn": {
    "python": "build_tree",
    "javascript": "buildTree"
  },
  "check": "return",
  "returns": "tree",
  "starter": {
    "python": "def build_tree(preorder, inorder):\n    # Rebuild the tree from its two traversals and return the root.\n    pass\n",
    "javascript": "function buildTree(preorder, inorder) {\n  // Rebuild the tree from its two traversals and return the root.\n}\n"
  },
  "cases": [
    {
      "args": [
        [
          3,
          9,
          20,
          15,
          7
        ],
        [
          9,
          3,
          15,
          20,
          7
        ]
      ],
      "expect": [
        3,
        9,
        20,
        null,
        null,
        15,
        7
      ]
    },
    {
      "args": [
        [
          -1
        ],
        [
          -1
        ]
      ],
      "expect": [
        -1
      ]
    },
    {
      "args": [
        [
          1,
          2
        ],
        [
          2,
          1
        ]
      ],
      "expect": [
        1,
        2
      ]
    },
    {
      "args": [
        [
          1,
          2
        ],
        [
          1,
          2
        ]
      ],
      "expect": [
        1,
        null,
        2
      ]
    },
    {
      "args": [
        [
          1,
          2,
          3
        ],
        [
          2,
          1,
          3
        ]
      ],
      "expect": [
        1,
        2,
        3
      ]
    },
    {
      "args": [
        [
          3,
          1,
          2,
          4
        ],
        [
          1,
          2,
          3,
          4
        ]
      ],
      "expect": [
        3,
        1,
        4,
        null,
        2
      ]
    }
  ]
}
```

````reveal Hint — preorder's first element is the root; inorder splits around it
**Fact 1:** preorder visits a node BEFORE either of its subtrees (that's
the definition — root, then left, then right). So `preorder[0]` is
always the root of whatever tree (or subtree) that preorder slice
describes.

**Fact 2:** inorder visits left subtree, THEN the node, THEN right
subtree. So once you know the root's value, find that value's position
in the inorder slice — everything to its LEFT in the inorder array is
the entire left subtree (in inorder order), and everything to its RIGHT
is the entire right subtree (in inorder order). This is exactly why
uniqueness of values matters: you need the root's position in `inorder`
to be unambiguous.

Recursing: the *sizes* of the left and right inorder splits tell you how
to split the REMAINING preorder array too (preorder continues with the
entire left subtree, preorder-ordered, then the entire right subtree,
preorder-ordered) — so both arrays shrink together, in sync, at every
level of recursion.
````

## Brute force, for contrast

A naive implementation re-scans the inorder array with `.index()` (or
equivalent) on every single recursive call to find the root's position —
correct, but each lookup is an O(n) linear scan, and there are O(n) such
calls (one per node), for O(n²) total:

````tabs
```python
def build_tree_bruteforce(preorder: list[int], inorder: list[int]) -> "TreeNode | None":
    if not preorder:
        return None
    root_val = preorder[0]
    root = TreeNode(root_val)
    mid = inorder.index(root_val)          # O(n) linear scan, every call
    root.left = build_tree_bruteforce(preorder[1:mid + 1], inorder[:mid])
    root.right = build_tree_bruteforce(preorder[mid + 1:], inorder[mid + 1:])
    return root
```

```typescript
function buildTreeBruteforce(preorder: number[], inorder: number[]): TreeNode | null {
  if (preorder.length === 0) return null;
  const rootVal = preorder[0];
  const root = new TreeNode(rootVal);
  const mid = inorder.indexOf(rootVal); // O(n) linear scan, every call
  root.left = buildTreeBruteforce(preorder.slice(1, mid + 1), inorder.slice(0, mid));
  root.right = buildTreeBruteforce(preorder.slice(mid + 1), inorder.slice(mid + 1));
  return root;
}
```
````

Beyond the O(n) `.index()` scan repeated at every node, this also
allocates fresh sliced arrays at every call — both costs compound to
O(n²) time (and worse, real, space overhead from all the slicing).

## The insight

Two independent fixes, both worth making:

1. **Hash map for O(1) root lookup:** precompute `value → index in
   inorder` once, up front, so every recursive call's "find the root's
   position" becomes an O(1) dictionary lookup instead of an O(n) scan.
2. **Index ranges instead of sliced arrays:** pass `(start, end)` bounds
   into the *original* arrays instead of allocating new sliced arrays at
   every call — this turns O(n) slicing-per-call into O(1)
   pointer-arithmetic-per-call.

With both, each of the n recursive calls does O(1) work outside its two
child calls, for O(n) total — the honest linear bound this problem
should have, since reconstructing n nodes can't be done in less than
O(n) regardless.

## Solution

`````reveal Solution — hash map lookup + index ranges (no re-slicing)
````tabs
```python
def build_tree(preorder: list[int], inorder: list[int]) -> "TreeNode | None":
    inorder_index = {val: i for i, val in enumerate(inorder)}  # O(1) root lookup
    pre_pos = [0]                          # mutable cursor into preorder

    def build(in_lo: int, in_hi: int) -> "TreeNode | None":
        if in_lo > in_hi:
            return None
        root_val = preorder[pre_pos[0]]
        pre_pos[0] += 1                    # consume this preorder element
        root = TreeNode(root_val)
        mid = inorder_index[root_val]      # O(1), not a scan
        # Preorder continues: entire left subtree next, THEN entire right
        # subtree — so build left first, consuming exactly that many
        # preorder slots, before build right ever looks at pre_pos.
        root.left = build(in_lo, mid - 1)
        root.right = build(mid + 1, in_hi)
        return root

    return build(0, len(inorder) - 1)
```

```typescript
function buildTree(preorder: number[], inorder: number[]): TreeNode | null {
  const inorderIndex = new Map<number, number>();
  inorder.forEach((val, i) => inorderIndex.set(val, i)); // O(1) root lookup

  let prePos = 0; // mutable cursor into preorder

  function build(inLo: number, inHi: number): TreeNode | null {
    if (inLo > inHi) return null;
    const rootVal = preorder[prePos];
    prePos++; // consume this preorder element
    const root = new TreeNode(rootVal);
    const mid = inorderIndex.get(rootVal)!; // O(1), not a scan
    // Preorder continues: entire left subtree next, THEN entire right
    // subtree — so build left first, consuming exactly that many
    // preorder slots, before build right ever looks at prePos.
    root.left = build(inLo, mid - 1);
    root.right = build(mid + 1, inHi);
    return root;
  }

  return build(0, inorder.length - 1);
}
```
````

The `pre_pos` cursor (rather than slicing) is what makes this O(n): it
advances exactly once per node, globally, across the whole recursion,
so no array is ever re-copied. The order of the two recursive calls —
`build(left)` strictly before `build(right)` — is not stylistic; it must
match preorder's own root-left-right order, since `pre_pos` is a single
shared cursor consumed in the order the calls happen to make.

```complexity
{
  "time": "O(n)",
  "space": "O(n)",
  "why": "The hash map build is O(n). Each of the n recursive calls does O(1) work (one map lookup, one cursor increment) outside its two child calls, so the total is O(n). Space is O(n) for the hash map plus O(h) recursion depth — dominated by the O(n) map."
}
```
`````

## Variants

- **Construct Binary Tree from Inorder and Postorder Traversal**
  (LeetCode 106): the mirror problem — postorder's LAST element is the
  root (root visited after both subtrees), so the cursor walks
  postorder from the END, and the right subtree must be built before the
  left (since postorder's last elements belong to the right subtree).
- **Serialize and Deserialize Binary Tree** (next lesson): a related but
  distinct reconstruction problem — that one uses a SINGLE traversal
  with explicit null markers, which (unlike this problem) is sufficient
  on its own to reconstruct the exact tree, without needing a second
  traversal order at all. Worth reading immediately after this one to
  see why the extra null information changes what's required.
- **DFS Traversals** (concept lesson, this module): the forward
  direction — this problem is that lesson's traversal orders run in
  reverse.

```quiz
{
  "question": "Why does this problem need BOTH preorder and inorder — why can't the tree be reconstructed from preorder alone?",
  "options": [
    "Preorder is not deterministic for a given tree, so two different trees could share a preorder — the traversal order itself can vary depending on implementation details, making the same tree potentially produce different preorder sequences on different runs",
    "Because preorder doesn't include every node's value — some nodes are skipped during a preorder walk, so the sequence is missing values that inorder would need to be complete",
    "Preorder alone tells you the root, then that root's ENTIRE subtree traversal (left and right combined, root-first at each level) — but it gives no signal for where the left subtree's elements end and the right subtree's begin, so the split point is genuinely ambiguous without inorder's left/root/right structure to locate it"
  ],
  "answer": 2,
  "explanation": "Preorder fixes each node's position relative to its OWN subtree (root always first) but says nothing about subtree SIZES — after the root, you can't tell from preorder alone how many of the following elements belong to the left subtree versus the right. Inorder supplies exactly that missing information: the root's position within inorder directly partitions the remaining values into 'left subtree' and 'right subtree,' which preorder cannot do by itself."
}
```
