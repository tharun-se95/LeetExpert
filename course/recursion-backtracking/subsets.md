---
title: Subsets
type: problem
---

## Problem

Given an integer array `nums` of **unique** elements, return *all
possible subsets* (the power set). The solution set must not contain
duplicate subsets, and the order of subsets does not matter.

**Examples**

```text
nums = [1,2,3]  →  [[], [1], [2], [3], [1,2], [1,3], [2,3], [1,2,3]]
nums = [0]      →  [[], [0]]
```

**Constraints:** 1 ≤ n ≤ 10 · all elements distinct · values in ±10.
(Note the tiny n — a strong hint the intended answer is exponential and
that's *expected*, not a failure.)

## Attempt it first

This is the smallest, cleanest backtracking template there is — the one
worth burning into muscle memory, because Permutations, Combination Sum,
and Palindrome Partitioning are all variations on it. Before reading on,
try to answer one question on paper: **at each element, what is the
choice?** If you can name the choice, the tree — and the code — follows
almost mechanically. Try to write it fully with the choose/explore/
unchoose skeleton from the concept lesson.


```sandbox
{
  "id": "subsets",
  "fn": { "python": "subsets", "javascript": "subsets" },
  "check": "return",
  "compare": "set-of-sets",
  "starter": {
    "python": "def subsets(nums):\n    # Return every subset of nums, including the empty one.\n    pass\n",
    "javascript": "function subsets(nums) {\n  // Return every subset of nums, including the empty one.\n}\n"
  },
  "cases": [
    {
      "args": [[1, 2, 3]],
      "expect": [[], [1], [1, 2], [1, 2, 3], [1, 3], [2], [2, 3], [3]]
    },
    { "args": [[0]], "expect": [[], [0]] },
    { "args": [[1, 2]], "expect": [[], [1], [1, 2], [2]] },
    {
      "args": [[1, 2, 3, 4]],
      "expect": [
        [],
        [1],
        [1, 2],
        [1, 2, 3],
        [1, 2, 3, 4],
        [1, 2, 4],
        [1, 3],
        [1, 3, 4],
        [1, 4],
        [2],
        [2, 3],
        [2, 3, 4],
        [2, 4],
        [3],
        [3, 4],
        [4]
      ]
    },
    {
      "args": [[-1, 0, 1]],
      "expect": [[], [-1], [-1, 0], [-1, 0, 1], [-1, 1], [0], [0, 1], [1]]
    }
  ]
}
```

````reveal Hint — the choice at each element
For each element, there are exactly two options: **include it** in the
current subset, or **exclude it**. That's a binary choice, made once per
element, independently. So the state-space tree is a binary tree n levels
deep — and every one of its 2ⁿ leaves is a distinct subset. There's no
validity constraint to check and nothing to prune: *every* leaf is a
valid answer. That's what makes this the canonical minimal template.
````

## Brute force, and why it's the same tree

The "brute force" here is not really different from the optimal — there's
no cleverer algorithm hiding, because you genuinely must produce all 2ⁿ
subsets, and just *emitting* them is already Ω(2ⁿ). A common first
instinct is the **bitmask** method: there are 2ⁿ integers from 0 to 2ⁿ−1,
and each one's binary digits say which elements are in that subset (bit i
set → include `nums[i]`). That works and is a legitimate solution:

````tabs
```python
def subsets_bitmask(nums: list[int]) -> list[list[int]]:
    n = len(nums)
    result = []
    for mask in range(1 << n):            # 0 .. 2ⁿ − 1
        subset = [nums[i] for i in range(n) if mask & (1 << i)]
        result.append(subset)
    return result
```

```typescript
function subsetsBitmask(nums: number[]): number[][] {
  const n = nums.length;
  const result: number[][] = [];
  for (let mask = 0; mask < 1 << n; mask++) {
    // 0 .. 2ⁿ − 1
    const subset: number[] = [];
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) subset.push(nums[i]);
    }
    result.push(subset);
  }
  return result;
}
```
````

That's O(n · 2ⁿ) — 2ⁿ masks, each scanned in O(n) — and it's a fine
answer. But the backtracking formulation is the one that *generalizes* to
every other problem in this module, so we learn the tree explicitly.

## The insight

The bitmask enumerates subsets by counting; backtracking builds them by
**walking the include/exclude decision tree**. At depth i we decide the
fate of `nums[i]`: the recursion branches once with the element chosen and
once without. A crucial subtlety makes subsets different from many
backtracking problems: **every node of the tree is a valid answer, not
just the leaves.** The empty prefix `[]` is a subset; `[1]` is a subset;
`[1,2]` is a subset. So we record the current `path` at *every* node we
enter, not only at the bottom.

The standard, tidy way to encode "include or exclude each element without
producing duplicates" is a **start index**: at each call we may add any
element from `start` onward, and each choice recurses with `start = i + 1`
so we never look back at earlier elements (which prevents `[2,1]` from
appearing as a duplicate of `[1,2]`). This start-index device is the
backbone of the whole module — reappearing in Combination Sum and
Palindrome Partitioning — so understand it here: **it enforces that
subsets are built in increasing index order, giving each distinct subset
exactly one path in the tree.**

## Solution

`````reveal Solution — backtracking with a start index
````tabs
```python
def subsets(nums: list[int]) -> list[list[int]]:
    result: list[list[int]] = []

    def backtrack(start: int, path: list[int]) -> None:
        result.append(path.copy())          # EVERY node is a valid subset
        for i in range(start, len(nums)):
            path.append(nums[i])            # CHOOSE nums[i]
            backtrack(i + 1, path)          # EXPLORE: only later elements
            path.pop()                      # UNCHOOSE
    # start index i+1 ensures increasing order → no duplicate subsets

    backtrack(0, [])
    return result
```

```typescript
function subsets(nums: number[]): number[][] {
  const result: number[][] = [];

  function backtrack(start: number, path: number[]): void {
    result.push([...path]); // EVERY node is a valid subset
    for (let i = start; i < nums.length; i++) {
      path.push(nums[i]); // CHOOSE nums[i]
      backtrack(i + 1, path); // EXPLORE: only later elements
      path.pop(); // UNCHOOSE
    }
  }
  // start index i+1 ensures increasing order → no duplicate subsets

  backtrack(0, []);
  return result;
}
```
````

Read it against the template from the concept lesson: `result.push` is
the "record" step (here at every node, since every prefix is an answer),
and the loop body is the choose / explore / unchoose ritual. The `start`
parameter is the only problem-specific piece — it's what turns "pick any
remaining element" into "pick any *later* element," which is exactly the
constraint that makes each subset appear once.

```complexity
{
  "time": "O(n · 2ⁿ)",
  "space": "O(n) auxiliary, plus O(n · 2ⁿ) for the output",
  "why": "The tree has 2ⁿ nodes that emit a subset (one per subset). Emitting one costs O(n) to copy the path. So total work is 2ⁿ × O(n). Auxiliary space is just the recursion depth (≤ n frames) and the path (≤ n long); the output itself unavoidably holds 2ⁿ subsets totaling O(n · 2ⁿ)."
}
```
`````

Why is the tree exactly 2ⁿ subsets and not more? Because each of the n
elements is independently in-or-out — a product of n binary choices,
2 × 2 × … × 2 = 2ⁿ, and the start-index discipline guarantees no subset
is generated twice. The O(n) per subset is the copy cost, not free: that
second factor is exactly the "work per node" discipline from the concept
lesson, and forgetting it is the classic way people mis-state this bound
as "O(2ⁿ)."

## Variants

- **Subsets II** (LeetCode 90): the array may contain **duplicates**, and
  duplicate subsets must be suppressed. Sort first, then within each
  recursive level skip an element equal to the previous one you already
  tried at that level (`if i > start and nums[i] == nums[i-1]: continue`)
  — the same de-duplication trick you'll see again in Combination Sum II.
- **Permutations** (next problem): drops the start index and instead
  tracks *used* elements, because order now matters — n! leaves instead of
  2ⁿ. The contrast between "start index" (order doesn't matter) and "used
  set" (order matters) is the single most useful distinction in this
  module.
- **Combinations** (LeetCode 77): all subsets of a fixed size k — the same
  tree, pruned to stop at depth k.

```quiz
{
  "questions": [
    {
      "question": "The Subsets solution calls result.append(path.copy()) at the TOP of every recursive call, before the loop — unlike many backtracking problems that record only at leaves. Why?",
      "options": [
        "Recording at leaves would miss the largest subset [1,2,3] — since the full array itself is also a valid subset, recording only at the deepest leaves would fail to capture that one specific complete case",
        "Because in Subsets every node of the state-space tree is itself a valid answer — the empty prefix [], [1], [1,2] are all subsets — so a subset must be recorded at every node, not only at complete leaves",
        "It's a performance optimization to avoid deep recursion — recording eagerly at every node lets the function return early in some branches, keeping the maximum recursion depth smaller than it would otherwise be"
      ],
      "answer": 1,
      "explanation": "This is what distinguishes Subsets from constraint problems like N-Queens (where only complete configurations count). Here the partial solution at each node IS a subset, so every node emits one. That's exactly why the tree has 2ⁿ emitting nodes and the answer count is 2ⁿ."
    },
    {
      "question": "Why does recursing with start = i + 1 (rather than start = 0) prevent duplicate subsets like [2,1] appearing alongside [1,2]?",
      "options": [
        "It makes the recursion terminate faster — skipping already-considered indices shortens the effective search space enough to noticeably reduce the total runtime, which is the main reason for advancing the start index",
        "It sorts the output array — building subsets index-by-index in increasing order happens to leave the final result list sorted, a side effect of the start-index technique rather than its purpose",
        "It forces every subset to be built in strictly increasing index order — once you've moved past element i you never reconsider earlier elements — so each distinct subset corresponds to exactly one root-to-node path in the tree"
      ],
      "answer": 2,
      "explanation": "The start index is the de-duplication mechanism. Allowing start = 0 everywhere would let you pick element 2 then element 1, generating [2,1] as a separate path from [1,2] even though they're the same set. Advancing start to i+1 means each subset is generated in one canonical (increasing-index) order and therefore exactly once."
    },
    {
      "question": "Subsets runs in O(n · 2ⁿ), not O(2ⁿ). Where does the extra factor of n come from?",
      "options": [
        "From the recursion depth being n — since the tree is n levels deep, that depth factor multiplies directly into the total time complexity alongside the 2ⁿ leaf count",
        "From the cost of copying each generated subset (up to n elements) into the result — there are 2ⁿ subsets and each copy is O(n), so total work is 2ⁿ × O(n)",
        "From sorting the input before generating subsets — an O(n log n) sort performed once at the start is what contributes the extra linear-ish factor visible in the final O(n · 2ⁿ) bound"
      ],
      "answer": 1,
      "explanation": "The two-factor discipline: number of nodes (2ⁿ) times work per node. The work per emitted subset is the O(n) copy of the path into the result. Quoting O(2ⁿ) drops the per-node cost. (The recursion depth of n contributes to SPACE, not this time factor.)"
    }
  ]
}
```
