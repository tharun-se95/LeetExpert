---
title: Permutations
type: problem
---

## Problem

Given an array `nums` of **distinct** integers, return *all possible
permutations* — every ordering of the elements. You may return the answer
in any order.

**Examples**

```text
nums = [1,2,3]  →  [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]
nums = [0,1]    →  [[0,1],[1,0]]
nums = [1]      →  [[1]]
```

**Constraints:** 1 ≤ n ≤ 6 · all elements distinct · values in ±10.
(Even smaller n than Subsets — because n! grows even faster than 2ⁿ.)

## Attempt it first

You just wrote Subsets with a start index. Permutations looks similar but
has one decisive difference that breaks the start-index approach entirely.
Before reading on, figure out what it is by asking: **in Subsets, does
`[1,2]` differ from `[2,1]`? In Permutations, does it?** The answer to
that one question determines the entire structure of the solution. Try to
write it, and if you find yourself reaching for a start index, stop and
ask what that index was actually *for*.

````reveal Hint — why the start index is wrong here, and what replaces it
In Subsets, `[1,2]` and `[2,1]` are the *same* subset, so we used a start
index to build subsets in one fixed order and never look back — that's how
we avoided duplicates. In Permutations, `[1,2]` and `[2,1]` are
**different** answers — order is the whole point. So we must *not* restrict
ourselves to later elements; at each position we can place **any element
not already used**. The bookkeeping question flips from "which index did I
reach?" to "which elements have I already placed?" That calls for a
**used** marker (a boolean array or a set), not a start index.
````

## Brute force, for contrast

You could generate all n-length sequences allowing repeats (nⁿ of them)
and filter out the ones that reuse an element. That's wasteful: nⁿ is much
larger than n!, and most sequences get thrown away. For n = 6 that's
46,656 candidates to produce just 720 valid permutations. The
"used"-tracking backtracking below never generates an invalid sequence in
the first place — it's the generate-valid-only discipline, the same
philosophy that makes Generate Parentheses efficient.

## The insight

Think of building a permutation **position by position**. Position 0 can
be any of the n elements. Once you commit position 0, position 1 can be
any of the remaining n−1. Then n−2, and so on. The state-space tree
branches n ways at the root, n−1 ways at the next level, n−2 at the
next — so the number of leaves is n × (n−1) × (n−2) × … × 1 = **n!**,
exactly the number of permutations. That decreasing branching factor is
the structural signature of permutations, and it comes directly from "each
element may be used once."

To enforce "used once," we carry a `used` boolean array (or equivalently
remove/re-add from a pool). When we place `nums[i]`, we mark
`used[i] = True`, recurse to fill the next position, then **unmark it**
on the way back — the unchoose step, now applied to the used-marker
instead of only the path. Contrast this precisely with Subsets:

| | Subsets | Permutations |
|---|---|---|
| Does order matter? | No | Yes |
| Avoid revisiting via | `start` index (only later elements) | `used[]` marker (any unused element) |
| Tree branching | shrinks by position (skip earlier) | n, n−1, n−2, … |
| Leaves | 2ⁿ | n! |
| Record answer at | every node | only complete leaves (length n) |

The last row matters: unlike Subsets, a *partial* permutation is not an
answer. We record only when `path` has all n elements — the base case is
"path is full."

## Solution

`````reveal Solution — backtracking with a used-marker
````tabs
```python
def permute(nums: list[int]) -> list[list[int]]:
    result: list[list[int]] = []
    used = [False] * len(nums)

    def backtrack(path: list[int]) -> None:
        if len(path) == len(nums):          # base case: a full permutation
            result.append(path.copy())
            return
        for i in range(len(nums)):
            if used[i]:                     # skip elements already placed
                continue
            used[i] = True                  # CHOOSE nums[i] for this position
            path.append(nums[i])
            backtrack(path)                 # EXPLORE the next position
            path.pop()                      # UNCHOOSE ...
            used[i] = False                 # ... including the used-marker

    backtrack([])
    return result
```

```typescript
function permute(nums: number[]): number[][] {
  const result: number[][] = [];
  const used = new Array(nums.length).fill(false);

  function backtrack(path: number[]): void {
    if (path.length === nums.length) {
      // base case: a full permutation
      result.push([...path]);
      return;
    }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue; // skip elements already placed
      used[i] = true; // CHOOSE nums[i] for this position
      path.push(nums[i]);
      backtrack(path); // EXPLORE the next position
      path.pop(); // UNCHOOSE ...
      used[i] = false; // ... including the used-marker
    }
  }

  backtrack([]);
  return result;
}
```
````

Note there are now **two** things to undo — the `path.pop()` and the
`used[i] = False`. Both are shared mutable state that a sibling branch
must not see, so both must be rewound. Forgetting `used[i] = False` is the
classic bug: the element stays marked used, so later branches can't place
it, and you silently generate too few permutations.

```complexity
{
  "time": "O(n · n!)",
  "space": "O(n) auxiliary, plus O(n · n!) for the output",
  "why": "There are n! complete permutations (leaves). Each leaf costs O(n) to copy the length-n path into the result — so total is n! × O(n). Auxiliary space is the recursion depth (n frames), the length-n path, and the length-n used array — all O(n); the output unavoidably holds n! permutations of length n."
}
```
`````

Why n! leaves, argued from the code: the loop at depth d runs over all n
indices but skips the d already-used ones, so it branches into exactly
n − d recursive calls. The product across depths 0…n−1 is n · (n−1) ·
(n−2) · … · 1 = n!. And each leaf pays O(n) to copy — the same "work per
node" second factor as Subsets. So O(n · n!), and this grows brutally: 6!
is 720 but 10! is 3.6 million and 13! already exceeds a billion, which is
why permutation problems always come with tiny n.

## Variants

- **Permutations II** (LeetCode 47): input has **duplicates**, and
  duplicate permutations must be suppressed. Sort, then within a level
  skip `nums[i]` if it equals `nums[i-1]` and `nums[i-1]` is *not*
  currently used — the level-wise de-dup rule, adapted to the used-array.
- **Subsets** (previous problem): the direct contrast — order-insensitive,
  so a start index instead of a used-marker; 2ⁿ instead of n!.
- **Combinations / Combination Sum** (next): order-insensitive again, so
  back to a start index — reinforcing that "start index vs. used-marker"
  is decided entirely by whether order matters.
- **Letter Combinations of a Phone Number** (LeetCode 17): a permutation-
  flavored build where each position draws from a *different* pool (the
  letters of one digit) — same position-by-position construction.

```quiz
{
  "questions": [
    {
      "question": "Subsets used a start index to avoid duplicates; Permutations uses a boolean 'used' array instead. What determines which mechanism is correct?",
      "options": [
        "Whether order matters. In Subsets, [1,2] and [2,1] are the same answer, so a start index builds each set in one fixed order and never looks back. In Permutations, [1,2] and [2,1] are DIFFERENT answers, so you can't restrict to later elements — you must allow any not-yet-used element, which the 'used' array tracks",
        "The start index only works for arrays with fewer than 10 elements — beyond that size the index-based restriction stops correctly excluding earlier elements, a scaling limitation rather than a question of whether order matters",
        "Permutations are larger, so they need a faster data structure — since n! outgrows 2ⁿ quickly, the used-array is chosen mainly for its faster lookup performance compared to re-deriving a start index each time"
      ],
      "answer": 0,
      "explanation": "This is the central distinction of the module. Order-insensitive problems (subsets, combinations) use a start index to canonicalize ordering and dedupe. Order-sensitive problems (permutations) must revisit earlier elements in later positions, so they track used-ness instead. Reaching for the wrong one either produces duplicates or misses answers."
    },
    {
      "question": "In the Permutations solution, why must BOTH path.pop() and used[i] = False run after the recursive call, not just path.pop()?",
      "options": [
        "The two lines must run in that exact order or the recursion crashes — reversing path.pop() and used[i] = False triggers an index-out-of-range error the next time the loop reads from the used array",
        "Both path and used are shared mutable state across sibling branches; if you pop from path but leave used[i] marked True, the element stays 'placed' for every later branch, so those branches can never use it and you generate too few permutations",
        "used[i] = False is only for readability and can be safely omitted — since path.pop() already removes the element from the visible output, leaving the internal used flag stale doesn't change which permutations get generated"
      ],
      "answer": 1,
      "explanation": "Every piece of shared state mutated on the way down must be rewound on the way back up — that's the unchoose discipline applied to two variables. Leaving used[i] = True permanently removes element i from consideration in all sibling subtrees, silently undercounting. It's the single most common Permutations bug."
    },
    {
      "question": "Why does the permutation tree have exactly n! leaves, and where does the extra factor make the total time O(n · n!)?",
      "options": [
        "The n! comes from the recursion depth and there is no per-node cost — since the tree is exactly n levels deep, the total leaf count is simply n multiplied by itself n times, with no separate cost for assembling each result",
        "At depth d the loop skips the d already-used elements and branches n−d ways, so the leaf count is n·(n−1)·…·1 = n!; the extra n is the O(n) cost to copy each complete length-n permutation into the result",
        "It has 2ⁿ leaves like subsets; the n factor is from sorting — permutations share the same binary include/exclude branching as subsets, and the extra n comes from sorting the output before returning it"
      ],
      "answer": 1,
      "explanation": "Deriving n! from the code: decreasing branching (n, then n−1, …) because each level has one more used element to skip — the product is n!. Then the two-factor rule: n! leaves × O(n) to emit each = O(n · n!). This is why permutation problems ship with tiny n; 13! already exceeds a billion."
    }
  ]
}
```
