---
title: Balance & Why It Matters
type: concept
---

## The promise, and how it breaks

The previous lesson ended on a threat: every BST operation is O(h),
and `h` — the height — is only small if the tree's shape cooperates.
This lesson is about what happens when it doesn't, what "balanced"
precisely means, and the mechanism real libraries use to *guarantee*
it.

Start with the failure, concretely. Insert 1, 2, 3, 4, 5 into an empty
BST, in that order, using the insert from the last lesson. Trace it:

```text
insert 1:   1

insert 2:   1          2 > 1, go right, attach
             \
              2

insert 3:   1          3 > 1 → right; 3 > 2 → right, attach
             \
              2
               \
                3

...continuing 4, 5:

            1
             \
              2
               \
                3
                 \
                  4
                   \
                    5
```

Every value is larger than everything already in the tree, so every
insert turns right, and the "tree" is a single downward chain. Its
height is `n`, not `log n`. A search for 5 visits all 5 nodes. This is
a **degenerate** BST, and it is not an exotic edge case — it's what
you get from *sorted input*, which is extremely common (data loaded
from an ordered file, timestamps arriving in order, an already-sorted
array inserted one element at a time). The BST has silently become a
linked list with extra pointer overhead: O(n) search, O(n) insert,
O(n) delete. Everything the invariant promised is still *true* — it's
just worthless, because `h = n`.

## What "balanced" means

Informally, a tree is balanced when it's "bushy" rather than
"stringy." Precisely, a family of trees is balanced when it guarantees

> **height `h` = O(log n)**

for `n` nodes. That bound is the whole point, because it's what turns
the honest O(h) cost of every operation into O(log n).

Why is O(log n) the *best* you can hope for, and why is it achievable?
A binary tree of height `h` has at most `2^(h+1) − 1` nodes (level 0
holds 1 node, level 1 holds ≤ 2, level `k` holds ≤ `2^k`; sum the
geometric series). Turn that around: to hold `n` nodes you need at
least `h ≥ log₂(n+1) − 1` levels — so **no** binary tree can be
shorter than about `log₂ n`. A perfectly full tree hits that floor
exactly. "Balanced" means staying within a constant factor of that
unavoidable floor, forever, no matter the insertion order. The
degenerate chain above is the opposite extreme: it puts one node per
level, spending `n` levels on `n` nodes.

The catch: we can't just *hope* for balance, because as we saw,
adversarial (or merely sorted) input destroys it. We need a mechanism
that actively restores balance as the tree changes — and it has to do
so **without breaking the BST invariant**, or search stops working.
That mechanism is rotation.

## Rotation: the one primitive

A rotation is a local, O(1) restructuring that changes a subtree's
*height* while preserving its inorder order — and therefore the BST
invariant. It rewires exactly three pointers. Here is a **right
rotation** around a node `P`, promoting its left child `Q`:

```text
        P                    Q
       / \                  / \
      Q   C     ───►       A   P
     / \                      / \
    A   B                    B   C
```

Look at what moved: `Q` rises to the top, `P` descends to become `Q`'s
right child, and `B` — which was `Q`'s right subtree — is handed to
`P` as its new left child. Everything else stays put. Only three
links change (`P.left`, `Q.right`, and the parent's pointer to the
subtree root).

Why does this preserve the invariant? The cleanest way to see it is
through **inorder order**, which the last lesson proved is the sorted
sequence of values. Read off the inorder sequence of the *before*
tree: `A, Q, B, P, C` (left subtree of Q, then Q, then B, then P, then
C). Now read off the *after* tree: `A, Q, B, P, C` — identical.
Rotation does not change which values come before which in the inorder
walk; it only changes the *shape* (who is whose parent). Since the
invariant is equivalent to "inorder is sorted" (a BST is exactly a
tree whose inorder walk is sorted), and rotation leaves the inorder
walk untouched, a rotation of a valid BST is always a valid BST. What
it *does* change is height: in the picture, if the left side was too
tall, promoting `Q` and demoting `P` shortens the left path and
lengthens the right — trading height from the heavy side to the light
side. A **left rotation** is the exact mirror image, promoting the
right child.

That is the entire mechanical toolkit. Every self-balancing BST is
"plain BST insert/delete, followed by a sequence of rotations that
restore the height guarantee." The families differ only in *when* they
rotate and *how strict* a balance they insist on.

## Two classic approaches (conceptual)

You will almost never implement one of these by hand, but you must
know the two shapes, because the ordered maps and sets you use every
day are built from them.

**AVL trees** enforce *strict* balance: at every node, the heights of
the left and right subtrees differ by at most 1. This is stored as a
small per-node "balance factor" and checked on the way back up after
every insert and delete; whenever a node goes out of range, one or two
rotations fix it. The payoff is a very tight height bound (about
`1.44 log₂ n` worst case), so lookups are as fast as a BST can offer.
The cost: because the balance condition is strict, insertions and
deletions rotate *often* — more restructuring work per update.

**Red-black trees** enforce a *looser* balance using a coloring scheme
(each node red or black, with rules that no red node has a red child
and every root-to-leaf path crosses the same number of black nodes).
These rules only guarantee that the longest root-to-leaf path is at
most twice the shortest — a weaker bound than AVL (height up to about
`2 log₂ n`), so lookups are very slightly slower in the worst case.
In exchange, updates need *fewer* rotations on average, which makes
insert/delete-heavy workloads cheaper. This trade — a little lookup
speed for a lot less restructuring — is why red-black trees are the
default in most production ordered containers: **C++'s `std::map` and
`std::set`, Java's `TreeMap` and `TreeSet`** are red-black trees. AVL
tends to win where reads vastly dominate writes.

Both guarantee **h = O(log n)**, and therefore restore all the core
operations to O(log n) — the point of the whole exercise. The
difference between them is a knob on the read-versus-write trade-off,
not a difference in what they promise asymptotically.

```complexity
{
  "operations": [
    { "name": "unbalanced BST, worst case", "time": "O(n)", "why": "sorted input degenerates the tree into a height-n chain; h = n" },
    { "name": "balanced BST (AVL / red-black), all core ops", "time": "O(log n)", "why": "the balance rule guarantees h = O(log n), and every core operation is O(h)" },
    { "name": "a single rotation", "time": "O(1)", "why": "it rewires a fixed number (three) of pointers regardless of tree size" },
    { "name": "rebalancing after one insert/delete", "time": "O(log n)", "why": "at most O(h) = O(log n) rotations along the path back to the root — often O(1) amortized for red-black" }
  ]
}
```

## Where this lands

The lower bound `h ≥ log₂ n` says a balanced BST is asymptotically
optimal for a comparison-based ordered structure — you cannot search
faster than O(log n) this way. Two problems ahead lean directly on
this lesson: **Convert Sorted Array to BST** builds a guaranteed-
balanced tree in one shot by always choosing the middle element as the
root (contrast it with the degenerate chain above — same values,
opposite outcome, entirely because of construction order), and the
whole reason the balanced height matters is that it's what keeps the
O(h) operations from the last lesson honest.

```quiz
{
  "questions": [
    {
      "question": "Inserting the already-sorted sequence 1,2,3,4,5 into a plain BST produces a height-5 chain. What is the underlying reason?",
      "options": [
        "Sorted input has duplicate values that confuse the tree — repeated adjacent values in the sequence trigger the tree's duplicate-handling logic repeatedly, and that repeated handling is what produces the elongated chain shape",
        "Each value is larger than everything inserted so far, so every insert takes the right branch — no left branches are ever created, and the tree becomes one downward path of height n",
        "Plain BSTs reject sorted input and store it linearly on purpose — the data structure detects that the incoming values are already ordered and deliberately falls back to a simple linked-list storage mode"
      ],
      "answer": 1,
      "explanation": "Insertion order determines shape. Monotonically increasing input makes every comparison go the same direction, so the tree never branches — it degenerates into a linked list of height n, and every O(h) operation becomes O(n)."
    },
    {
      "question": "Why does a rotation preserve the BST invariant?",
      "options": [
        "Because it only ever moves leaf nodes, which have no constraints — since rotation is restricted to nodes without children, there's never a subtree structure whose ordering could possibly be disturbed by the pointer changes",
        "Because it leaves the inorder traversal sequence unchanged — and a tree is a valid BST exactly when its inorder walk is sorted. Rotation changes parent/child shape (and thus height) but not the left-to-right order of values.",
        "Because it recomputes and reassigns every node's value to satisfy the invariant — after the pointers are rewired, a follow-up pass walks the affected subtree and rewrites each node's stored value to match its new sorted position"
      ],
      "answer": 1,
      "explanation": "A BST is precisely a tree whose inorder traversal is sorted. Rotation rewires three pointers to change height but produces the identical inorder sequence, so if the tree was a valid BST before, it still is after — while the height (the thing we're trying to fix) has changed."
    },
    {
      "question": "C++'s std::map and Java's TreeMap use red-black trees rather than AVL trees. What trade-off does that reflect?",
      "options": [
        "AVL trees don't guarantee O(log n) height, so they can't be used in a standard library — their stricter balancing rule occasionally lets pathological insert sequences slip through without triggering a rebalance, undermining the height guarantee",
        "Red-black trees enforce looser balance (height up to ~2 log n vs AVL's ~1.44 log n), giving slightly slower worst-case lookups but requiring fewer rotations per update — a good default when insertions and deletions are common, not just lookups",
        "Red-black trees have a strictly better height bound, so lookups are always faster — the looser balance rule is actually a tighter constraint in practice, meaning red-black trees stay shorter than AVL trees on typical workloads"
      ],
      "answer": 1,
      "explanation": "Both guarantee O(log n) height. AVL's strict balance makes lookups marginally faster but forces more rotations on every update; red-black's looser balance trades a bit of lookup speed for cheaper updates. General-purpose libraries pick red-black because real workloads mix reads and writes."
    }
  ]
}
```
