---
title: House Robber III
type: problem
---

## Problem

Houses form a binary tree instead of a line. A thief cannot rob a house
AND its direct parent or child on the same night (robbing two
DIRECTLY-connected houses trips the alarm — houses two levels apart are
fine). Return the maximum amount robbable. (LeetCode 337.)

**Examples**

```text
    3
   / \
  2   3          →  7   (rob 3 + 3 + 3 [root's val + both grandchildren],
   \   \              skip the two direct children valued 2 and 3)
    3   1
```

**Constraints:** up to `10⁴` nodes.

## Attempt it first

This is the module's true capstone: it fuses Module 17's top-down/
bottom-up tree recursion with THIS module's rob-or-skip DP thinking. The
1D House Robber problem's `dp[i] = max(dp[i-1], dp[i-2] + nums[i])`
worked because a house's only neighbors were its immediate array
predecessors — but a tree node's "forbidden neighbors" are its
CHILDREN, and a naive bottom-up recursion that returns just "the best
achievable at this subtree" runs into exactly the trap Diameter of
Binary Tree (Module 17) warned about: the value a PARENT needs from a
child depends on whether the CHILD was robbed, and a single returned
number can't convey that. Before opening anything, think about what a
node needs to return to its parent so the parent can correctly decide
its OWN rob-or-skip choice.

```sandbox
{
  "id": "house-robber-iii",
  "fn": {
    "python": "rob",
    "javascript": "rob"
  },
  "check": "return",
  "shape": {
    "0": "tree"
  },
  "starter": {
    "python": "def rob(root):\n    # Return the most money robbable with no two directly-connected houses.\n    pass\n",
    "javascript": "function rob(root) {\n  // Return the most money robbable with no two directly-connected houses.\n}\n"
  },
  "cases": [
    {
      "args": [
        [
          3,
          2,
          3,
          null,
          3,
          null,
          1
        ]
      ],
      "expect": 7
    },
    {
      "args": [
        [
          3,
          4,
          5,
          1,
          3,
          null,
          1
        ]
      ],
      "expect": 9
    },
    {
      "args": [
        [
          1
        ]
      ],
      "expect": 1
    },
    {
      "args": [
        [
          0
        ]
      ],
      "expect": 0
    },
    {
      "args": [
        [
          2,
          1,
          3,
          null,
          4
        ]
      ],
      "expect": 7
    },
    {
      "args": [
        [
          4,
          1,
          null,
          2,
          null,
          3
        ]
      ],
      "expect": 7
    }
  ]
}
```

````reveal Hint — return a PAIR: best-if-robbed and best-if-not-robbed
Have each node's recursive call return TWO values: `(rob_this, skip_this)`
— the best achievable in this node's subtree if this node IS robbed,
and the best achievable if it is NOT. A node computes its own pair from
its children's pairs:
- `rob_this = node.val + left.skip_this + right.skip_this` (if THIS node
  is robbed, both children must NOT be robbed — use their skip values).
- `skip_this = max(left.rob_this, left.skip_this) + max(right.rob_this,
  right.skip_this)` (if this node is NOT robbed, each child is free to
  be robbed or not — take whichever is better independently for each
  child).

The final answer is `max(root.rob_this, root.skip_this)`.
````

## Why returning a single value fails

Try the naive single-return version: `best(node)` returns "the max
robbable in this subtree," computed as something like `max(node.val +
best(left.left) + best(left.right) + best(right.left) + best(right.right),
best(left) + best(right))` — but this requires reaching down TWO levels
to check grandchildren whenever the node itself is robbed, which is
both awkward to write correctly and, worse, doesn't compose: a parent
calling `best(child)` genuinely cannot tell from that single number
whether the child's optimal plan included robbing the child or not —
information the parent's OWN rob-or-skip decision needs. This is
precisely the Diameter of Binary Tree lesson's lesson repeated: the
value the PARENT needs and the FINAL answer are not always the same
thing, and here the fix is returning a pair instead of a single
accumulator variable.

## The insight

Each node returns `(rob_this, skip_this)` — a pair, not a scalar — which
gives the parent EXACTLY the information it needs to compute its own
pair correctly, with no need to reach past its immediate children at
all. This is bottom-up tree recursion (Module 17) combined with the
rob-or-skip choice (this module's House Robber) — the fusion the whole
module has been building toward.

## Solution

`````reveal Solution — postorder recursion returning (rob, skip) pairs
````tabs
```python
def rob(root: "TreeNode | None") -> int:
    def dfs(node: "TreeNode | None") -> tuple[int, int]:
        # returns (best if node IS robbed, best if node is NOT robbed)
        if node is None:
            return (0, 0)

        left_rob, left_skip = dfs(node.left)
        right_rob, right_skip = dfs(node.right)

        rob_this = node.val + left_skip + right_skip      # children must be UNrobbed
        skip_this = max(left_rob, left_skip) + max(right_rob, right_skip)  # children free either way

        return (rob_this, skip_this)

    rob_root, skip_root = dfs(root)
    return max(rob_root, skip_root)
```

```typescript
function rob(root: TreeNode | null): number {
  function dfs(node: TreeNode | null): [number, number] {
    // returns [best if node IS robbed, best if node is NOT robbed]
    if (node === null) return [0, 0];

    const [leftRob, leftSkip] = dfs(node.left);
    const [rightRob, rightSkip] = dfs(node.right);

    const robThis = node.val + leftSkip + rightSkip; // children must be UNrobbed
    const skipThis = Math.max(leftRob, leftSkip) + Math.max(rightRob, rightSkip); // children free either way

    return [robThis, skipThis];
  }

  const [robRoot, skipRoot] = dfs(root);
  return Math.max(robRoot, skipRoot);
}
```
````

Read `rob_this` and `skip_this` as the direct tree analogue of the 1D
House Robber's `dp[i-2] + nums[i]` and `dp[i-1]`: `rob_this` is "take
this node's value, forcing both children into their must-not-be-robbed
state" (exactly like taking `nums[i]` forced `dp[i-2]` — the previous
element skipped); `skip_this` is "don't take this node, so each child
independently picks its own best option" (exactly like `dp[i-1]`
carrying forward the best achievable without constraint). The 1D
recurrence's "two preceding values" become, on a tree, "two children's
pairs" — same rob-or-skip logic, restructured for branching instead of
linear neighbors.

```complexity
{
  "time": "O(n)",
  "space": "O(h)",
  "why": "Postorder DFS visits every node exactly once, O(1) work per node beyond its two recursive calls (a few additions and comparisons). Space is the recursion stack, O(h) — O(log n) balanced, O(n) skewed, the standard tree-recursion bound from Module 17."
}
```
`````

## Variants

- **House Robber** (this module): the 1D line version this problem
  generalizes to a tree — re-reading it side by side makes the
  rob-or-skip logic's translation from "two preceding array values" to
  "two children's returned pairs" completely explicit.
- **Diameter of Binary Tree** (Module 17): the concept lesson's original
  "a parent needs different information than the final answer" trap —
  there, solved with a return value (height) plus a global accumulator;
  here, solved with a return value that's a PAIR instead of a scalar —
  two different fixes to the same underlying problem shape.
- **Binary Tree Maximum Path Sum** (Module 17, mentioned as a variant
  there): another tree DP requiring a node to return one thing to its
  parent while a DIFFERENT quantity is tracked as the actual answer —
  worth revisiting now that this problem has shown the "return a pair"
  alternative to that lesson's "return one value plus a global
  accumulator" approach.

```quiz
{
  "question": "Why is returning a single scalar 'best achievable in this subtree' insufficient for House Robber III, when the analogous 1D House Robber problem gets away with a single dp[i] value per position?",
  "options": [
    "It isn't actually insufficient — a single scalar return value works fine for both problems, since a parent can always infer whether a child was robbed by comparing the child's returned value against its own node value",
    "In the 1D array, dp[i] only ever needs to be combined with dp[i-1] or dp[i-2] in a FIXED, position-determined way, so a single cached value per position is enough context; on a tree, a PARENT's own rob-or-skip decision depends specifically on whether each CHILD was robbed (robbing the parent requires BOTH children unrobbed), and a single 'best of this subtree' number conflates the robbed-child and unrobbed-child cases, throwing away exactly the distinction the parent's decision needs to make correctly",
    "Trees require pair-returns only when they are unbalanced; balanced trees can use single-value returns, since a balanced tree's uniform depth means every node's rob-or-skip status can be inferred from its position alone"
  ],
  "answer": 1,
  "explanation": "The 1D case's dp[i] works as a single value because the recurrence's combining rule (dp[i-1] vs dp[i-2]+nums[i]) is fixed by POSITION, not by whether a specific earlier choice was 'robbed or not' in a way the current position needs to distinguish — dp[i-1] already IS 'the best considering robbery decisions up to i-1, whatever they were.' On a tree, by contrast, the parent's own robbery decision is directly gated on each child's robbery status specifically (rob parent requires BOTH children un-robbed) — a distinction a single collapsed 'best of subtree' value cannot preserve, which is exactly why the pair-return becomes necessary here and wasn't in the 1D version."
}
```
