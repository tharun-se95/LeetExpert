---
title: Insert into a Binary Search Tree
type: problem
---

## Problem

Given the `root` of a binary search tree and a value `val` **not**
already present, insert `val` into the tree and return the root. Any
valid BST that contains all the original values plus `val` is accepted
— there is more than one correct shape, but the standard result is the
one where the new value becomes a leaf.

**Examples**

```text
      4                       4
     / \                     / \
    2   7     insert 5  →    2   7
   / \                     / \  /
  1   3                   1  3 5

  empty     insert 8   →   8
```

**Constraints:** 0 ≤ n ≤ 10⁴ nodes · −10⁸ ≤ values ≤ 10⁸ · `val` is not
already in the tree.

## Attempt it first

You already derived this operation in concept lesson 1 — this problem
is here so you can produce it cold, in both a recursive and an
iterative form, and articulate exactly why the spot you land on is the
*only* place the value can go. Before revealing anything: where does a
search for `val` end up in a tree that doesn't contain `val`, and why
is that endpoint automatically a legal insertion point?

```sandbox
{
  "id": "insert-into-a-binary-search-tree",
  "fn": {
    "python": "insert_into_bst",
    "javascript": "insertIntoBST"
  },
  "check": "return",
  "shape": {
    "0": "tree"
  },
  "returns": "tree",
  "starter": {
    "python": "def insert_into_bst(root, val):\n    # Insert val as a new leaf and return the root.\n    pass\n",
    "javascript": "function insertIntoBST(root, val) {\n  // Insert val as a new leaf and return the root.\n}\n"
  },
  "cases": [
    {
      "args": [
        [
          4,
          2,
          7,
          1,
          3
        ],
        5
      ],
      "expect": [
        4,
        2,
        7,
        1,
        3,
        5
      ]
    },
    {
      "args": [
        [],
        8
      ],
      "expect": [
        8
      ]
    },
    {
      "args": [
        [
          1
        ],
        2
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
          1
        ],
        0
      ],
      "expect": [
        1,
        0
      ]
    },
    {
      "args": [
        [
          40,
          20,
          60,
          10,
          30,
          50,
          70
        ],
        25
      ],
      "expect": [
        40,
        20,
        60,
        10,
        30,
        50,
        70,
        null,
        null,
        25
      ]
    },
    {
      "args": [
        [
          4,
          2,
          7,
          1,
          3
        ],
        8
      ],
      "expect": [
        4,
        2,
        7,
        1,
        3,
        null,
        8
      ]
    },
    {
      "args": [
        [
          4,
          2,
          7,
          1,
          3
        ],
        0
      ],
      "expect": [
        4,
        2,
        7,
        1,
        3,
        null,
        null,
        0
      ]
    }
  ]
}
```

````reveal Hint
Search for `val`. Since it isn't in the tree, the search "falls off"
the bottom at some empty child slot. That slot is the one and only
position where `val` keeps the invariant true — because the entire
search path was decided by the same less-than / greater-than
comparisons the invariant requires. So: descend as if searching, and
when you reach a null child, put the new leaf there.
````

## The insight (a one-line argument)

There is no brute force worth contrasting here — inserting into a BST
is inherently an O(h) descent, and there's no faster or slower "naive"
version. The entire content is *why the landing spot is correct*, which
is the argument from concept lesson 1 restated:

When you search for `val` and it isn't present, every comparison sends
you strictly left (if `val` is smaller) or strictly right (if larger).
The empty slot where you finally fall off satisfies, by construction,
every ancestor constraint on the path — `val` is less than every
ancestor you turned left at and greater than every ancestor you turned
right at. That is precisely the subtree-wide invariant. So attaching
`val` as a leaf there is guaranteed valid, and it requires no
restructuring of any existing node.

## Solution

`````reveal Solution — recursive and iterative
**Recursive.** The "return the (possibly new) subtree root and let the
parent reattach" pattern from concept lesson 1: the base case (null)
*is* the empty slot, so we return a fresh node and the caller wires it
in.

````tabs
```python
def insert_into_bst(root: "TreeNode | None", val: int) -> TreeNode:
    if root is None:
        return TreeNode(val)              # empty slot found: this is where val belongs
    if val < root.val:
        root.left = insert_into_bst(root.left, val)
    else:                                 # val > root.val (val is guaranteed absent)
        root.right = insert_into_bst(root.right, val)
    return root
```

```typescript
function insertIntoBST(root: TreeNode | null, val: number): TreeNode {
  if (root === null) return new TreeNode(val); // empty slot found: val belongs here
  if (val < root.val) {
    root.left = insertIntoBST(root.left, val);
  } else {
    // val > root.val (val is guaranteed absent)
    root.right = insertIntoBST(root.right, val);
  }
  return root;
}
```
````

**Iterative.** Walk down keeping a `parent` pointer; when the next step
would go null, attach the new node to `parent` on the correct side. The
only fiddly case is an initially empty tree, where there is no parent —
the new node becomes the root.

````tabs
```python
def insert_into_bst_iter(root: "TreeNode | None", val: int) -> TreeNode:
    new_node = TreeNode(val)
    if root is None:
        return new_node                   # empty tree: new node is the root
    parent = root
    while True:
        if val < parent.val:
            if parent.left is None:
                parent.left = new_node     # empty left slot: attach here
                return root
            parent = parent.left
        else:                             # val > parent.val
            if parent.right is None:
                parent.right = new_node    # empty right slot: attach here
                return root
            parent = parent.right
```

```typescript
function insertIntoBSTIter(root: TreeNode | null, val: number): TreeNode {
  const newNode = new TreeNode(val);
  if (root === null) return newNode; // empty tree: new node is the root
  let parent = root;
  while (true) {
    if (val < parent.val) {
      if (parent.left === null) {
        parent.left = newNode; // empty left slot: attach here
        return root;
      }
      parent = parent.left;
    } else {
      // val > parent.val
      if (parent.right === null) {
        parent.right = newNode; // empty right slot: attach here
        return root;
      }
      parent = parent.right;
    }
  }
}
```
````

Both do one descent to a leaf position and O(1) work to attach. The
iterative version trades the recursion stack for a single `parent`
pointer — O(1) auxiliary space instead of O(h) — which is the usual
reason to prefer it.

```complexity
{
  "operations": [
    { "name": "recursive insert", "time": "O(h) time, O(h) space", "why": "one descent to the empty slot; the recursion stack is as deep as the path, i.e. the height h" },
    { "name": "iterative insert", "time": "O(h) time, O(1) space", "why": "same single descent, but a lone parent pointer replaces the call stack — constant extra space" }
  ]
}
```
`````

## The catch this problem quietly demonstrates

Insert is O(h), and this problem is a good place to remember what
lesson 2 warned about: `h` is not guaranteed to be small. If you insert
values in *sorted* order using this exact code, each insert appends to
the rightmost tip and the tree degenerates into a height-`n` chain —
turning a sequence of `n` inserts into O(n²) total work. Plain BST
insert is correct but not self-balancing; production ordered maps use
the AVL / red-black rebalancing from lesson 2 to keep `h = O(log n)`.
The next problem, **Convert Sorted Array to BST**, shows the flip side:
given the values up front, you can *construct* a balanced tree directly
and dodge the degeneration entirely.

## Variants

- **Delete Node in a BST** (next lesson): the inverse operation, and
  strictly harder — removing an internal node needs the inorder-
  successor trick, whereas insert always lands cleanly at a leaf.
- **Search in a BST** (LeetCode 700): the same descent without the
  attach step — literally the loop above, returning the node instead of
  inserting.
- **Convert Sorted Array to BST** (LeetCode 108): don't insert
  one-by-one at all; build balanced in one recursive construction.

```quiz
{
  "questions": [
    {
      "question": "Why is the empty child slot where a search for `val` falls off guaranteed to be a legal place to insert `val`?",
      "options": [
        "Because the slot is always at the deepest level of the tree — insertion points are guaranteed to occur only at the tree's maximum depth, which is what makes attaching a new leaf there automatically safe",
        "Because the search path was governed by the same less-than/greater-than comparisons the invariant requires — so val is smaller than every ancestor it turned left at and larger than every ancestor it turned right at, which is exactly the subtree-wide invariant satisfied",
        "Because new nodes can be attached anywhere in a BST without consequence — the invariant only governs existing relationships between nodes already in the tree, so a freshly inserted leaf is exempt from needing to satisfy it"
      ],
      "answer": 1,
      "explanation": "The insertion point isn't arbitrary — it's the unique spot consistent with every ancestor constraint, precisely because the descent used the invariant's own comparisons to get there. That's why attaching a leaf needs no restructuring."
    },
    {
      "question": "The iterative insert uses O(1) auxiliary space while the recursive insert uses O(h). Where does the recursive version's extra space go?",
      "options": [
        "Into the call stack — one stack frame per level of descent, so a path of length h costs O(h) stack space; the iterative version replaces all those frames with a single reusable parent pointer",
        "Into storing every node it visits in a list — the recursive version explicitly appends each visited node to an auxiliary list for later use, and that growing list is where the O(h) space actually accumulates",
        "Into a copy of the tree it makes before inserting — the recursive approach defensively clones the path from root to insertion point before modifying anything, and that cloned path is the source of the extra space"
      ],
      "answer": 0,
      "explanation": "Each recursive call adds a frame that persists until the base case returns and the stack unwinds. The descent is h levels deep, so the stack reaches depth h. The iterative loop keeps only a current pointer, needing no per-level storage — hence O(1)."
    }
  ]
}
```
