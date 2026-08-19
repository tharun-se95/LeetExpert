---
title: Combination Sum
type: problem
---

## Problem

Given an array of **distinct** positive integers `candidates` and a
target integer `target`, return *all unique combinations* of candidates
that sum to `target`. **The same candidate may be chosen an unlimited
number of times.** Two combinations are the same if they use the same
numbers the same number of times (order doesn't matter).

**Examples**

```examples
candidates = [2,3,6,7], target = 7  →  [[2,2,3], [7]]
candidates = [2,3,5],   target = 8  →  [[2,2,2,2], [2,3,3], [3,5]]
candidates = [2],       target = 1  →  []          (can't reach 1)
```

```constraint
1 ≤ candidates.length ≤ 30 · 2 ≤ candidates[i] ≤ 40 · all distinct · 1 ≤ target ≤ 40. It's guaranteed the number of unique combinations fits in reasonable bounds for these limits.
```

## Attempt it first

Two features make this different from Subsets and Permutations, and both
change the recursion in a specific way: (1) there's now a **running
target** — a numeric constraint that decides when a path is a valid
answer and when it's a dead end — and (2) **reuse is unlimited** — the
same number can appear many times. Before reading on, think hard about
what the reuse rule does to the start index you'd use for a
subset/combination. Specifically: after you pick `candidates[i]`, what
should the *next* call's start index be — `i` or `i + 1`? Your answer to
that is the entire trick.


```sandbox
{
  "id": "combination-sum",
  "fn": { "python": "combination_sum", "javascript": "combinationSum" },
  "check": "return",
  "compare": "set-of-sets",
  "starter": {
    "python": "def combination_sum(candidates, target):\n    # Return every unique multiset of candidates summing to target.\n    pass\n",
    "javascript": "function combinationSum(candidates, target) {\n  // Return every unique multiset of candidates summing to target.\n}\n"
  },
  "cases": [
    { "args": [[2, 3, 6, 7], 7], "expect": [[2, 2, 3], [7]] },
    { "args": [[2, 3, 5], 8], "expect": [[2, 2, 2, 2], [2, 3, 3], [3, 5]] },
    { "args": [[2], 1], "expect": [] },
    { "args": [[2], 4], "expect": [[2, 2]] },
    { "args": [[7, 3, 2], 7], "expect": [[7], [3, 2, 2]] },
    { "args": [[8, 9], 4], "expect": [] }
  ]
}
```

````reveal Hint — the start index that does NOT advance
In Subsets we recursed with `start = i + 1` so each element was used at
most once. Here reuse is allowed, so after choosing `candidates[i]` we
recurse with `start = i` — **staying on the same index**, which lets us
pick that same candidate again on the next level. But we still *don't* go
backward (we never let start decrease below i), which is what keeps
combinations in non-decreasing order and thus prevents `[2,3]` and `[3,2]`
from both appearing. So: **`i` for reuse, but never less than `i`, for
de-duplication.** Meanwhile the target shrinks by `candidates[i]` each
time we pick it; when it hits 0 we've found a combination, and if it goes
negative this branch is dead.
````

## Brute force, and the pruning that replaces it

A truly naive approach would generate arbitrary-length sequences and sum-
check them — hopeless, since reuse means unbounded length. The structure
we actually want is a backtracking tree where two conditions govern each
node:

- **Success (base case):** the remaining target is exactly 0 → record the
  path.
- **Prune (dead end):** the remaining target is negative → this path
  overshot; return immediately without exploring further.

That second rule is real pruning (concept lesson): since all candidates
are positive, once the running sum exceeds the target, *every* deeper
choice only makes it worse — the entire subtree is hopeless and we cut it.
This is what keeps the tree finite despite unlimited reuse: you can only
add positive numbers so many times before blowing past the target.

## The insight

Combine the non-advancing start index with the shrinking target. At each
node we loop over candidates from `start` onward. Choosing
`candidates[i]`:

1. subtracts `candidates[i]` from the remaining target (**choose**),
2. recurses with the **same** `start = i` so `candidates[i]` can be reused
   (**explore**),
3. restores the target on return (**unchoose**).

The `start = i` (not `i + 1`) is the one line that distinguishes this from
every other problem so far:

- **Subsets / Combinations:** `start = i + 1` — each element used **at
  most once**.
- **Combination Sum:** `start = i` — each element reusable, but we never
  revisit *earlier* indices, so combinations come out in non-decreasing
  order and duplicates like `[2,3]`/`[3,2]` never both appear.
- **Permutations:** no start index at all — order matters, so a used-array
  instead.

Getting these three straight — and *why* each is what it is — is the whole
point of doing these problems in sequence.

## Solution

`````reveal Solution — non-advancing start index + target pruning
````tabs
```python
def combination_sum(candidates: list[int], target: int) -> list[list[int]]:
    result: list[list[int]] = []

    def backtrack(start: int, remaining: int, path: list[int]) -> None:
        if remaining == 0:                  # base case: exact hit → a combination
            result.append(path.copy())
            return
        if remaining < 0:                   # PRUNE: overshot, all deeper choices worse
            return
        for i in range(start, len(candidates)):
            path.append(candidates[i])      # CHOOSE
            backtrack(i, remaining - candidates[i], path)  # EXPLORE: start = i → reuse
            path.pop()                      # UNCHOOSE

    backtrack(0, target, [])
    return result
```

```typescript
function combinationSum(candidates: number[], target: number): number[][] {
  const result: number[][] = [];

  function backtrack(start: number, remaining: number, path: number[]): void {
    if (remaining === 0) {
      // base case: exact hit → a combination
      result.push([...path]);
      return;
    }
    if (remaining < 0) return; // PRUNE: overshot, all deeper choices worse
    for (let i = start; i < candidates.length; i++) {
      path.push(candidates[i]); // CHOOSE
      backtrack(i, remaining - candidates[i], path); // EXPLORE: start = i → reuse
      path.pop(); // UNCHOOSE
    }
  }

  backtrack(0, target, []);
  return result;
}
```
````

The `remaining < 0` prune and the `start = i` reuse are the two lines that
encode this problem's identity. Everything else is the standard skeleton.
A slightly tighter variant sorts `candidates` first and `break`s (instead
of `continue`/return) as soon as `candidates[i] > remaining`, since once
one candidate overshoots, all larger ones do too — but the version above
is correct as written.

```complexity
{
  "time": "O(n · 2^(target / min)) in the worst case",
  "space": "O(target / min) auxiliary, plus the output size",
  "why": "Let min be the smallest candidate. A path can add min at most target/min times before pruning, so the tree's depth is bounded by target/min, and its size is exponential in that depth. Each recorded combination costs O(depth) to copy. Because unlimited reuse makes the exact count input-dependent, the honest statement is 'exponential in target/min', derived from the max depth — not a clean closed form."
}
```
`````

Why is this exponential and *not* a neat 2ⁿ or n!? Because the tree's
size is governed by the **target and the smallest candidate**, not just n.
The longest any path can get is target ÷ min(candidates) picks (adding the
smallest number repeatedly until you'd overshoot), so that's the maximum
recursion depth, and the branching within that depth makes the node count
exponential in it. The candidate values, not just their count, set the
problem size — which is exactly why the constraints cap both `target` and
`candidates[i]` at 40. The pruning (`remaining < 0` return) is what keeps
this finite at all; without it, unlimited reuse would recurse forever.

## Variants

- **Combination Sum II** (LeetCode 40): each number used **at most once**
  *and* the input may have duplicates. Two changes: recurse with
  `start = i + 1` (no reuse, back to the subsets rule), and add the
  level-wise duplicate skip (`if i > start and candidates[i] ==
  candidates[i-1]: continue`) after sorting.
- **Combination Sum III** (LeetCode 216): fixed combination length k and
  digits 1–9 only — add a depth constraint to the base case.
- **Coin Change** (Module 24): "fewest coins to make an amount" is the
  *optimization* cousin — same reuse structure, but you want the best
  combination, not all of them, which is where DP beats backtracking.
- **Subsets** (this module): the `start = i + 1` sibling — the direct
  contrast that makes the `start = i` choice here meaningful.

```quiz
{
  "questions": [
    {
      "question": "When Combination Sum picks candidates[i], it recurses with start = i, whereas Subsets recursed with start = i + 1. Why the difference?",
      "options": [
        "It's an arbitrary style choice with no effect on the output — both Subsets and Combination Sum would produce the identical set of results regardless of whether the recursive call advances the start index or keeps it the same",
        "start = i makes the recursion terminate, which start = i + 1 would not — advancing the index too aggressively is what would actually cause the recursion to run past its natural stopping point in this problem",
        "Because Combination Sum allows unlimited reuse of a candidate — recursing with start = i (not i+1) keeps the same index available so it can be picked again; using start = i+1 would forbid reuse, and going below i would let duplicates like [2,3]/[3,2] both appear"
      ],
      "answer": 2,
      "explanation": "The start index encodes the reuse policy. i+1 = each element at most once (Subsets). i = reuse allowed but never revisit earlier indices, so combinations stay non-decreasing and dedupe naturally. This single line is the problem's identity relative to Subsets."
    },
    {
      "question": "The solution returns immediately when remaining < 0. Beyond correctness, why is this prune essential to the algorithm even terminating?",
      "options": [
        "All candidates are positive and reuse is unlimited, so without cutting off overshoot a path could keep adding numbers forever; the remaining < 0 prune bounds the recursion depth to about target/min, which is what makes the tree finite",
        "It only speeds things up but has no effect on whether recursion ends — the recursion would still naturally terminate on its own even without this check, just after exploring some additional unnecessary branches",
        "It isn't essential; the base case remaining == 0 alone guarantees termination — since every candidate is a positive integer, the running sum is guaranteed to land on exactly 0 at some point along any path, making the negative check redundant"
      ],
      "answer": 0,
      "explanation": "Unlimited reuse means a naive recursion has no natural depth limit. Because every candidate is positive, once the running sum overshoots the target every deeper choice is worse — pruning there caps the depth at target/min(candidates). Without it, the same small candidate could be added without bound and the recursion would never stop."
    },
    {
      "question": "Why is Combination Sum's complexity stated in terms of target and the smallest candidate (exponential in target/min), rather than a clean 2ⁿ or n! in the number of candidates?",
      "options": [
        "Because unlimited reuse makes the maximum path length depend on the values, not the count: you can add the smallest candidate up to target/min times before overshooting, so that ratio bounds the tree depth — the candidate magnitudes, not just how many there are, set the problem size",
        "Because the number of candidates is irrelevant to the runtime — once reuse is allowed, the array of candidates only serves to define which values are legal to pick, and has no bearing on how large the search tree ultimately grows",
        "It is actually exactly 2ⁿ; the target-based bound is a mistake — the reuse mechanic doesn't fundamentally change the branching structure from Subsets, so the same power-of-two leaf count applies here as well"
      ],
      "answer": 0,
      "explanation": "With reuse, n no longer caps depth — the target and smallest candidate do. The longest path adds min(candidates) repeatedly, target/min times, and the tree is exponential in that depth. This is why the constraints cap both target and candidate values, not just the array length."
    }
  ]
}
```
