---
title: Jump Game II
type: problem
---

## Problem

Same setup as Jump Game: integer array `nums`, start at index `0`,
`nums[i]` is the maximum jump length from `i`. This time you're
guaranteed the last index **is** reachable, and you must return the
**minimum number of jumps** to get there.

**Examples**

```text
nums = [2,3,1,1,4]   →  2
        0 →(jump)→ 1 →(jump)→ 4.  Two jumps. (0→2→? also works but never fewer.)

nums = [2,3,0,1,4]   →  2
        0 → 1 → 4.
```

**Constraints:** 1 ≤ n ≤ 10⁴ · 0 ≤ nums[i] ≤ 1000 · last index always reachable.

## Attempt it first

You already know from Jump Game that tracking `max_reach` captures
reachability. The new question is *counting* jumps — so the natural
first instinct is a shortest-path / BFS framing. Try to write it that
way before revealing the hint, then look for how to get the same answer
without an explicit queue.


```sandbox
{
  "id": "jump-game-ii",
  "fn": { "python": "jump", "javascript": "jump" },
  "check": "return",
  "starter": {
    "python": "def jump(nums):\n    # Return the minimum number of jumps to reach the last index.\n    pass\n",
    "javascript": "function jump(nums) {\n  // Return the minimum number of jumps to reach the last index.\n}\n"
  },
  "cases": [
    { "args": [[2, 3, 1, 1, 4]], "expect": 2 },
    { "args": [[2, 3, 0, 1, 4]], "expect": 2 },
    { "args": [[0]], "expect": 0 },
    { "args": [[1, 1, 1, 1]], "expect": 3 },
    { "args": [[2, 1]], "expect": 1 },
    { "args": [[5, 1, 1, 1, 1]], "expect": 1 },
    { "args": [[1, 2, 3]], "expect": 2 }
  ]
}
```

````reveal Hint — think in "levels" of one jump each
Group indices by *how many jumps it takes to first reach them*. Level 0
is just index 0. Level 1 is every index reachable in one jump from level
0. Level 2 is everything reachable in one more jump from anywhere in
level 1 — and so on. The minimum number of jumps to reach the end is the
level number the last index lands in. You can compute these levels in a
single left-to-right pass by remembering where the current level *ends*
and how far the *next* level can reach.
````

## Brute force, for contrast

The "try every jump" recursion from Jump Game, adapted to *count* jumps
and take the minimum, is exponential. Memoizing "fewest jumps from index
i to the end" gives a clean O(n²) DP: for each index, scan all
`nums[i]` forward targets and take 1 + the best of them. Correct, but it
re-derives per-index information the greedy gets for free in one pass.

There's also a genuine BFS reading (Module 17's level-order idea): treat
each index as a node with edges to `i+1 … i+nums[i]`, and BFS from index
0 — the level at which you first dequeue the last index is the answer.
That's O(n) *nodes* but the edges can total O(n²), and it needs a queue
and visited array. The greedy below is that same level-order idea
compressed into two pointers and O(1) space.

## The insight: BFS levels without the queue

Think of the indices as being explored in **levels**, where level `k`
is "all indices reachable in exactly `k` jumps, and not fewer." This is
literally BFS by distance-in-jumps — but because every index in a level
can reach a *contiguous* forward range (the downward-closed property
from Jump Game), each level is itself a contiguous interval of indices.
That means we don't need a queue to remember which indices are in the
current level; we only need its **right boundary**.

Sweep left to right with three variables:

- `jumps` — how many jumps we've committed to so far (the current level
  number).
- `cur_end` — the last index reachable within the current level. When
  `i` passes this, we've exhausted the current level and *must* spend a
  jump to enter the next.
- `farthest` — the farthest index reachable by jumping from *any* index
  we've scanned in the current level. This becomes the next level's
  right boundary.

At each `i` (before the last index), update `farthest = max(farthest, i
+ nums[i])`. When `i == cur_end`, we've walked to the edge of the
current level: increment `jumps` and advance `cur_end = farthest` — we
"cross the boundary" into the next level, whose reach we've already
accumulated.

**Why the greedy is correct.** The claim is that `farthest` at the
moment we cross a boundary is the *true* right edge of the next BFS
level — i.e. no index beyond it is reachable in one more jump, and every
index up to it is. It's the true edge because `farthest` is the max over
*every* index in the current level of that index's own reach: any index
reachable in one jump from the current level is reachable from *some*
member of it, and that member's contribution is already folded into the
max. So `farthest` misses nothing, and by the downward-closed property
it overshoots nothing reachable — the next level is exactly `(cur_end,
farthest]`. Because each level's boundary is computed from the complete
level before it, incrementing `jumps` exactly when we cross a boundary
counts levels correctly, and the level containing the last index is —
by the BFS argument — its minimum jump distance. We never reconsider a
jump because, just as in Jump Game, the specific index we "jumped from"
inside a level is irrelevant: only the level's collective reach matters,
and that's what `farthest` holds.

**Why we stop the loop before the last index.** We iterate `i` only up
to `n-2`. If `i` reached `n-1` and happened to equal `cur_end`, we'd
increment `jumps` for a jump we never actually take (we're already *at*
the destination). Stopping at `n-2` counts only the jumps that move us,
and since the last index is guaranteed reachable, `cur_end` reaches
`n-1` on or before we run out of indices.

## Solution

`````reveal Solution — level-by-level sweep
````tabs
```python
def jump(nums: list[int]) -> int:
    jumps = 0
    cur_end = 0        # right boundary of the current level
    farthest = 0       # farthest reachable from within the current level
    for i in range(len(nums) - 1):        # stop before the last index
        farthest = max(farthest, i + nums[i])
        if i == cur_end:                  # walked to the edge of this level
            jumps += 1                    # must cross into the next level
            cur_end = farthest            # next level's boundary
    return jumps
```

```typescript
function jump(nums: number[]): number {
  let jumps = 0;
  let curEnd = 0; // right boundary of the current level
  let farthest = 0; // farthest reachable from within the current level
  for (let i = 0; i < nums.length - 1; i++) {
    // stop before the last index
    farthest = Math.max(farthest, i + nums[i]);
    if (i === curEnd) {
      // walked to the edge of this level
      jumps++; // must cross into the next level
      curEnd = farthest; // next level's boundary
    }
  }
  return jumps;
}
```
````

Read `cur_end` and `farthest` as the current and next BFS frontier; the
`if i == cur_end` is the "we've drained this level's queue, advance a
level" moment — the same event that in a real BFS is "the level marker
comes off the queue." The whole level machinery collapses to two
integers precisely because each level is a contiguous interval.

```complexity
{
  "time": "O(n)",
  "space": "O(1)",
  "why": "A single pass over the array; each index does O(1) work — one max update and one boundary check. Three integer variables, no queue or visited array, so O(1) extra space. This is the payoff over both the O(n²) DP (which rescans forward targets per index) and the explicit BFS (which has O(n²) edges and O(n) queue/visited space): the contiguous-level structure lets one number stand in for an entire frontier."
}
```
`````

## Variants

- **Jump Game** (previous lesson): the yes/no reachability version —
  same `max_reach` idea, without the level counting.
- **BFS & Level-Order Traversal** (Module 17): this problem *is* BFS by
  jump-distance; the level boundary here plays the same role as the
  per-level node count in level-order tree traversal. Recognizing the
  equivalence is the point — an explicit queue would also be correct,
  just heavier.
- **Word Ladder / shortest transformation** (Module 23 territory, not
  covered): when the graph
  *isn't* a line of contiguous ranges, the levels stop being intervals
  and you genuinely need the queue — a good marker for when this O(1)
  compression is available and when it isn't.

```quiz
{
  "questions": [
    {
      "question": "Why can this problem's BFS levels be tracked with a single boundary integer (cur_end) instead of an explicit queue of nodes?",
      "options": [
        "Because the array is small enough to fit in registers — for the input sizes this problem allows, the entire nums array can be held in CPU registers, which is what lets the algorithm skip maintaining an explicit queue",
        "Because we only ever visit each index once — since the main loop advances i exactly once per index with no revisiting, there's no need for a queue to track indices that might otherwise be processed multiple times",
        "Because every index in a level can reach a contiguous forward range, so each BFS level is itself a contiguous interval of indices — fully described by its right boundary, with no need to store the individual members"
      ],
      "answer": 2,
      "explanation": "The downward-closed reachability from Jump Game means a level is never a scattered set of nodes; it's a solid interval. An interval is captured by one endpoint, so the queue of 'nodes in this level' compresses to the single number cur_end, and the queue of the next level compresses to farthest. That's the whole reason O(1) space suffices where general BFS needs O(n)."
    },
    {
      "question": "At the moment we cross a boundary, why is `farthest` guaranteed to be the exact right edge of the next BFS level?",
      "options": [
        "Because farthest is set to i + nums[i] for the last index only — the variable is only meaningfully updated once the loop reaches the final index of the current level, so its value reflects that single index's reach rather than an accumulated maximum",
        "Because the problem guarantees the last index is reachable — since the problem statement promises a path to the end exists, farthest is automatically correct as a consequence of that guarantee, regardless of how it's computed during the sweep",
        "Because farthest is the maximum of (index + reach) over EVERY index in the current level, so it captures the reach of whichever member goes furthest — nothing reachable in one more jump is missed, and downward-closure means nothing beyond it is reachable either"
      ],
      "answer": 2,
      "explanation": "Any index reachable in one jump from the current level is reachable from some member of it, and every member's reach is folded into the running max. So farthest misses nothing (it's a max over the complete level) and overshoots nothing (contiguity), making (cur_end, farthest] exactly the next level. That completeness is why counting boundary-crossings counts jumps correctly."
    }
  ]
}
```
