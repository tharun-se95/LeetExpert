---
title: Kth Smallest Element in a BST
type: problem
---

## Problem

Given the `root` of a binary search tree and an integer `k`, return the
**k-th smallest** value in the tree (1-indexed — `k = 1` is the
minimum).

**Examples**

```text
      3
     / \
    1   4        k = 1  →  1
     \
      2

      5
     / \
    3   6        k = 3  →  3
   / \
  2   4
 /
1
```

**Constraints:** 1 ≤ k ≤ n ≤ 10⁴ · node values are distinct.

## Attempt it first

You proved something in the first concept lesson that makes this
problem almost fall open by itself — recall what an *inorder traversal*
of a BST produces. Before writing anything, state what the k-th
smallest element *is* in terms of that traversal, and then think about
whether you actually need to finish the traversal to find it.

````reveal Hint
Inorder traversal of a BST visits values in ascending sorted order
(concept lesson 1, proved from the invariant). So the k-th smallest is
simply the k-th value emitted by an inorder walk. That already gives a
correct solution. The refinement: you don't need the *whole* sorted
sequence — only its first `k` elements. Can you stop the traversal the
instant you've emitted `k`?
````

## Brute force, for contrast

The most naive approach ignores the BST structure entirely: collect all
`n` values, sort them, return index `k − 1`. That's O(n log n) time and
O(n) space — and it throws away the fact that the tree is *already*
sorted-by-inorder. You're paying to sort data that a single inorder
walk would hand you in order for free.

One step better: do a full inorder traversal into a list (already
sorted, no separate sort needed — O(n) time), then index it. Correct,
but it still visits all `n` nodes and materializes the whole list even
when `k = 1`.

## The insight: inorder, but stop at k

Because inorder emits values in increasing order, the k-th value it
emits *is* the answer — and once you've emitted it, everything after is
irrelevant. So run an inorder traversal that counts emissions and
**terminates the moment the count reaches `k`**. You never touch the
part of the tree that holds the (k+1)-th value onward. For small `k` on
a large tree this is dramatically less work than a full walk: you visit
only the nodes up to and including the k-th smallest.

An iterative inorder traversal with an explicit stack makes the early
exit clean — you simply `return` mid-loop.

## Solution

`````reveal Solution — iterative inorder with early termination
````tabs
```python
def kth_smallest(root: "TreeNode | None", k: int) -> int:
    stack: list["TreeNode"] = []
    node = root
    count = 0
    while node is not None or stack:
        while node is not None:        # go as far left as possible
            stack.append(node)
            node = node.left
        node = stack.pop()             # smallest unvisited node
        count += 1
        if count == k:                 # the k-th value in sorted order
            return node.val            # stop — never visit anything larger
        node = node.right              # then explore the right subtree
    raise ValueError("k exceeds the number of nodes")
```

```typescript
function kthSmallest(root: TreeNode | null, k: number): number {
  const stack: TreeNode[] = [];
  let node = root;
  let count = 0;
  while (node !== null || stack.length > 0) {
    while (node !== null) {
      // go as far left as possible
      stack.push(node);
      node = node.left;
    }
    node = stack.pop()!; // smallest unvisited node
    count++;
    if (count === k) return node.val; // the k-th value in sorted order — stop here
    node = node.right; // then explore the right subtree
  }
  throw new Error("k exceeds the number of nodes");
}
```
````

The early `return` is the whole point: the loop processes nodes in
ascending order, so the instant `count === k` we hold the answer and
abandon the rest of the tree. A recursive inorder works too, but
threading the early stop through recursion requires an exception or a
mutable "found" flag; the explicit stack lets us just return.

```complexity
{
  "time": "O(h + k)",
  "space": "O(h)",
  "why": "We first descend to the smallest node (up to h steps to reach the leftmost leaf), then pop-and-advance k times to reach the k-th value; each advance pushes at most one root-to-leaf worth of nodes total. So work is O(h + k). The stack never holds more than one root-to-leaf path, so space is O(h)."
}
```
`````

## Complexity, spelled out

Worth being precise about the O(h + k) claim rather than rounding it to
O(n). Reaching the *first* (smallest) element takes up to `h` pushes —
the descent down the leftmost spine. After that, producing each
successive value in sorted order is amortized O(1): across the entire
traversal every node is pushed once and popped once, so getting to the
k-th emission costs O(k) beyond the initial descent. Total: **O(h +
k)**. When `k` is small and the tree is balanced this is O(log n),
much better than the O(n) full-traversal or O(n log n) sort-everything
approaches. Only when `k ≈ n` does it approach a full walk — which is
unavoidable, since the largest element genuinely requires visiting
everything.

## Variants

- **Kth Largest Element in a BST**: mirror the traversal — a *reverse*
  inorder (right, node, left) emits values in descending order, so the
  same early-stop logic finds the k-th largest.
- **Kth Smallest with frequent modification** (LeetCode 230 follow-up):
  if the tree is modified often and you query `k` repeatedly, augment
  each node with a *subtree size* count. Then you can navigate directly:
  if the left subtree has `L` nodes, the k-th smallest is in the left
  subtree (if `k ≤ L`), is the current node (if `k = L + 1`), or is the
  (k − L − 1)-th smallest of the right subtree — an O(h) query with O(h)
  update, avoiding re-traversal.
- **Validate BST** (previous lesson): the sibling application of
  inorder-is-sorted — there you check the *whole* sequence is
  increasing; here you stop as soon as you've counted far enough.

```quiz
{
  "questions": [
    {
      "question": "Why does an inorder traversal directly solve 'find the k-th smallest', with no sorting step?",
      "options": [
        "Because inorder traversal happens to visit nodes in the order they were inserted — the traversal order coincidentally lines up with insertion history, so the k-th value emitted corresponds to the k-th value that was ever added to the tree",
        "Because a BST's inorder traversal emits values in ascending sorted order (proved from the invariant), so the k-th value it emits is by definition the k-th smallest",
        "Because inorder traversal always visits the smallest node last — the traversal saves the minimum value for its final step, so identifying the k-th smallest means counting backward from the end of the traversal"
      ],
      "answer": 1,
      "explanation": "This is the direct payoff of concept lesson 1's proof: inorder = sorted, for any BST, because of the ordering invariant. The k-th emitted value is therefore the k-th smallest — the tree is already 'sorted' by this traversal, so no separate sort is needed."
    },
    {
      "question": "The early-termination version is O(h + k) rather than O(n). Why is the k, not n, the right term?",
      "options": [
        "Because k is always much smaller than n — the problem's constraints guarantee k stays a small constant relative to n, which is the only reason the traversal ends up touching fewer than all n nodes",
        "Because the traversal skips every left subtree — early termination is achieved by ignoring left children entirely once the count starts climbing, cutting the work down to roughly half the tree regardless of k",
        "Because the traversal produces values in increasing order and returns the instant it has emitted k of them — so it only ever touches the nodes up to and including the k-th smallest, never the larger remainder of the tree"
      ],
      "answer": 2,
      "explanation": "Emitting in sorted order means the answer is reached after exactly k emissions; the loop returns then, leaving the (k+1)-th value onward untouched. The cost is the initial descent O(h) plus O(k) to reach the k-th value — independent of how many nodes lie beyond it."
    }
  ]
}
```
