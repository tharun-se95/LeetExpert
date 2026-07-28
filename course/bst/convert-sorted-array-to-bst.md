---
title: Convert Sorted Array to Binary Search Tree
type: problem
---

## Problem

Given an integer array `nums` sorted in ascending order, convert it to a
**height-balanced** binary search tree. (There may be multiple valid
answers; any height-balanced BST whose inorder traversal is `nums` is
accepted.) (LeetCode 108.)

**Examples**

```text
nums = [-10,-3,0,5,9]  →  one valid answer:
        0
       / \
     -3   9
     /   /
  -10   5
```

**Constraints:** `1 ≤ nums.length ≤ 10⁴`, strictly increasing values.

## Attempt it first

This is the direct payoff of the Balance & Why It Matters concept
lesson's central warning: inserting a sorted array's elements ONE AT A
TIME into a BST, in order, produces a completely degenerate tree (a
linked list, O(n) height). This problem asks for the opposite outcome —
guaranteed O(log n) height — from the exact same sorted data. Before
opening anything, think about why picking the array's **middle**
element as the root, recursively, sidesteps the degenerate-insertion
problem entirely, rather than being a clever trick layered on top of
insertion.

```sandbox
{
  "id": "convert-sorted-array-to-bst",
  "fn": {
    "python": "sorted_array_to_bst",
    "javascript": "sortedArrayToBst"
  },
  "check": "return",
  "returns": "tree",
  "property": "balanced-bst-of-nums",
  "starter": {
    "python": "def sorted_array_to_bst(nums):\n    # Build a height-balanced BST from the sorted values, return the root.\n    pass\n",
    "javascript": "function sortedArrayToBst(nums) {\n  // Build a height-balanced BST from the sorted values, return the root.\n}\n"
  },
  "cases": [
    {
      "args": [
        [
          -10,
          -3,
          0,
          5,
          9
        ]
      ]
    },
    {
      "args": [
        [
          1,
          3
        ]
      ]
    },
    {
      "args": [
        [
          1
        ]
      ]
    },
    {
      "args": [
        [
          1,
          2,
          3,
          4,
          5,
          6,
          7
        ]
      ]
    },
    {
      "args": [
        [
          0,
          1,
          2,
          3,
          4,
          5
        ]
      ]
    },
    {
      "args": [
        [
          -5,
          -4,
          -3,
          -2,
          -1
        ]
      ]
    }
  ]
}
```

````reveal Hint — always root at the middle; recurse on both halves
Don't insert elements one at a time at all. Instead, build the tree
directly from array structure: the middle element of `nums` becomes the
root (this immediately satisfies the BST invariant, since everything to
its left in the sorted array is smaller and everything to its right is
larger). Then recursively build the left subtree from the left half of
the array, and the right subtree from the right half — each half's own
middle becomes ITS root, and so on. Because the array is already sorted,
no comparisons are needed to decide where anything goes; the array's
position alone determines the tree's shape.
````

## Why one-at-a-time insertion fails here

It's worth confirming the failure mode the concept lesson described,
concretely, rather than taking it on faith. Inserting `[-10,-3,0,5,9]`
in order with ordinary BST insertion: `-10` becomes the root (nothing
to compare against yet); `-3 > -10` goes right; `0 > -3` and `0 > -10`
goes further right; and so on — every subsequent element is larger than
everything already in the tree, so each one becomes the right child of
the previous, producing a straight rightward chain of height `n`. That
is the exact degenerate case the balance lesson used to motivate
self-balancing trees. This problem sidesteps it entirely by never doing
sequential insertion at all.

## The insight

Recursively define `build(lo, hi)`: the middle index of the current
range becomes the root; `build(lo, mid - 1)` becomes its left subtree;
`build(mid + 1, hi)` becomes its right subtree. Because the array is
sorted, the middle element is automatically greater than everything to
its left and less than everything to its right — the BST invariant is
satisfied by construction, with zero comparisons. And because each
recursive call operates on (at most) half of the remaining range, the
resulting tree's height is bounded by `O(log n)` by construction too —
not as an incidental property, but as the direct consequence of always
halving.

## Solution

`````reveal Solution — recursively root at the middle of each range
````tabs
```python
def sorted_array_to_bst(nums: list[int]) -> "TreeNode | None":
    def build(lo: int, hi: int) -> "TreeNode | None":
        if lo > hi:
            return None
        mid = (lo + hi) // 2               # always split the range in half
        node = TreeNode(nums[mid])
        node.left = build(lo, mid - 1)     # left half → left subtree
        node.right = build(mid + 1, hi)    # right half → right subtree
        return node

    return build(0, len(nums) - 1)
```

```typescript
function sortedArrayToBst(nums: number[]): TreeNode | null {
  function build(lo: number, hi: number): TreeNode | null {
    if (lo > hi) return null;
    const mid = Math.floor((lo + hi) / 2); // always split the range in half
    const node = new TreeNode(nums[mid]);
    node.left = build(lo, mid - 1); // left half → left subtree
    node.right = build(mid + 1, hi); // right half → right subtree
    return node;
  }

  return build(0, nums.length - 1);
}
```
````

Every recursive call halves its index range (`[lo, mid-1]` and
`[mid+1, hi]` are each at most half the size of `[lo, hi]`), so the
recursion depth — which becomes the tree's height — is bounded by
`O(log n)` no matter what values are in `nums`. This is the same
"always halve" argument as binary search (Module 13), applied to
constructing a tree's shape instead of narrowing a search range.

```complexity
{
  "time": "O(n)",
  "space": "O(log n) auxiliary (recursion stack), O(n) for the output tree",
  "why": "Every index from 0 to n-1 is visited exactly once across the whole recursion (each becomes exactly one node), so O(n) time. Because the range always halves, recursion depth is O(log n) — this holds for EVERY input, not just typical ones, since it comes from arithmetic on indices, not from data-dependent branching."
}
```
`````

## Variants

- **Balance & Why It Matters** (concept lesson, this module): the
  motivating contrast — this problem is that lesson's "here's how you'd
  actually guarantee balance" made concrete.
- **Convert Sorted List to Binary Search Tree** (LeetCode 109): same
  idea, but the input is a linked list, which can't be randomly indexed
  in O(1) — finding the "middle" requires a slow/fast pointer walk
  (Module 7) instead of arithmetic, which changes the complexity
  analysis.
- **Validate Binary Search Tree** (this module): worth confirming
  mentally that the tree this problem builds does satisfy the BST
  invariant checked there — every node's value is properly bounded by
  its ancestors, by construction from the sorted order.

```quiz
{
  "question": "Why does always choosing the MIDDLE element of the current range as the root guarantee O(log n) height, when choosing, say, the FIRST element every time (as ordinary sequential insertion effectively does) does not?",
  "options": [
    "Choosing the middle guarantees each recursive call operates on at most half the remaining elements, so the recursion depth — and therefore the tree height — is bounded by log₂(n) regardless of the data; choosing the first element instead puts everything else in ONE subtree (the right), so the recursion doesn't shrink by a fixed fraction and can reach depth n",
    "Both choices produce the same height; height only depends on n — regardless of which index within each range is chosen as the root, the resulting tree ends up with the identical height once all n elements have been placed",
    "The middle element is always the true median value, which is what determines balance — since the array is sorted, its middle entry is mathematically the statistical median, and using the median as root is specifically what balances a tree"
  ],
  "answer": 0,
  "explanation": "Balance here is a consequence of index arithmetic, not value comparison. Splitting at the midpoint index guarantees a factor-of-2 reduction in range size at every level of recursion — this is true unconditionally, for any sorted array, which is exactly what bounds the depth at O(log n). Splitting at the first index instead leaves the entire rest of the range as a single unbalanced subtree, so depth can grow linearly, exactly reproducing sequential insertion's degenerate case."
}
```
