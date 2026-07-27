---
title: Jump Game
type: problem
---

## Problem

You're given an integer array `nums`. You start at index `0`. Each
`nums[i]` is the **maximum** jump length from index `i` — from `i` you
may step to any index in `i+1 … i+nums[i]`. Return `true` if you can
reach the last index, `false` otherwise.

**Examples**

```text
nums = [2,3,1,1,4]   →  true
        start at 0, nums[0]=2 lets you reach index 1; nums[1]=3 reaches index 4. Done.

nums = [3,2,1,0,4]   →  false
        every route lands on index 3 (value 0), a dead end before index 4.
```

**Constraints:** 1 ≤ n ≤ 10⁴ · 0 ≤ nums[i] ≤ 10⁵.

## Attempt it first

Before reading on, try to write *any* correct solution — even a slow
one — and get very precise about the question you're actually answering
at each index. The trap here is thinking you have to decide *which*
specific jump to take. You don't. Sit with what information you truly
need before revealing the hint.


```sandbox
{
  "id": "jump-game",
  "fn": { "python": "can_jump", "javascript": "canJump" },
  "check": "return",
  "starter": {
    "python": "def can_jump(nums):\n    # Return True if the last index is reachable from index 0.\n    pass\n",
    "javascript": "function canJump(nums) {\n  // Return true if the last index is reachable from index 0.\n}\n"
  },
  "cases": [
    { "args": [[2, 3, 1, 1, 4]], "expect": true },
    { "args": [[3, 2, 1, 0, 4]], "expect": false },
    { "args": [[0]], "expect": true },
    { "args": [[0, 1]], "expect": false },
    { "args": [[2, 0, 0]], "expect": true },
    { "args": [[1, 1, 1, 0]], "expect": true },
    { "args": [[1, 0, 1, 0]], "expect": false }
  ]
}
```

````reveal Hint — reframe the question
Don't ask "which sequence of jumps reaches the end?" — that's an
exponential search over jump choices. Ask instead: "what is the
*farthest index I can possibly reach* as I move left to right?" If that
farthest reach ever falls behind the index I'm currently standing on,
I'm stuck. If it ever reaches the last index, I'm done. Notice this
question doesn't care *how* you got somewhere — only how far you can get.
````

## Brute force, for contrast

The literal reading is a search: from index 0, try every jump length
`1 … nums[0]`, recurse from each landing spot, and report success if any
branch reaches the end. That's correct but explores an exponential tree
of jump sequences — the same index gets re-solved along many different
paths. Memoizing "can I reach the end from index i?" makes it O(n²)
(for each of n indices, you may scan up to n forward jumps). Both are
far more work than the problem needs, and the reason is that we're
tracking *which jumps we took*, information the answer doesn't depend on.

## The insight: track the farthest reach, never the path

Here is the reframing that collapses the whole problem. Sweep left to
right maintaining a single number, `max_reach` = the farthest index
reachable using any jumps decided so far. At index `i`:

- If `i > max_reach`, then *nothing* could get us to `i` — every earlier
  index's reach fell short of `i` — so the last index is unreachable.
  Return `false`.
- Otherwise `i` is reachable, so we may stand on it and extend our
  horizon: `max_reach = max(max_reach, i + nums[i])`.

If we survive the sweep with `max_reach ≥ n-1`, the end is reachable.

**Why we never need to reconsider a jump choice.** The greedy claim is
that `max_reach` alone is sufficient state — we throw away *which* jumps
produced it, and that loss is provably harmless. The argument: the set
of reachable indices is exactly the contiguous range `[0, max_reach]`.
It's contiguous because reachability is "downward closed" within a jump:
if you can reach index `i`, and `nums[i] ≥ 1`, you can reach every index
from `i+1` up to `i+nums[i]` — you're never forced to *skip* an index
inside a jump's range. So the reachable set is never a scattered
collection of indices where the *specific route* would matter; it's
always a solid prefix, and a prefix is fully described by its right
endpoint, `max_reach`. Two different jump sequences that reach the same
farthest index leave you in *identical* situations going forward, so
there is nothing to gain by remembering which one you took. That is
precisely why the greedy is safe: the only thing the future depends on
is how far right you can currently get, and that's the one number we
keep.

Contrast this with a *wrong* greedy for a related-looking problem: "at
each index, always jump the maximum length." That commits to a specific
landing spot and can overshoot a valuable stepping stone. Tracking
`max_reach` commits to *nothing* — it records a capability, not a
decision — which is exactly why no reconsideration is ever needed.

## Solution

`````reveal Solution — single forward sweep
````tabs
```python
def can_jump(nums: list[int]) -> bool:
    max_reach = 0
    last = len(nums) - 1
    for i in range(len(nums)):
        if i > max_reach:          # index i is unreachable — stuck
            return False
        max_reach = max(max_reach, i + nums[i])
        if max_reach >= last:      # can already reach the end; done early
            return True
    return True
```

```typescript
function canJump(nums: number[]): boolean {
  let maxReach = 0;
  const last = nums.length - 1;
  for (let i = 0; i < nums.length; i++) {
    if (i > maxReach) return false; // index i is unreachable — stuck
    maxReach = Math.max(maxReach, i + nums[i]);
    if (maxReach >= last) return true; // can already reach the end; done early
  }
  return true;
}
```
````

The `i > max_reach` check is the whole correctness story in one line: it
fires exactly when the contiguous reachable prefix `[0, max_reach]`
fails to include the index we're trying to stand on. The early
`max_reach >= last` return isn't necessary for correctness (the loop
would finish fine without it) — it just stops as soon as the answer is
settled.

```complexity
{
  "time": "O(n)",
  "space": "O(1)",
  "why": "One left-to-right pass; each index does O(1) work — a comparison and a max update. We keep a single integer of state (max_reach), no array or recursion, so O(1) extra space. This beats the memoized O(n²) because we never re-examine an index from multiple predecessors: the prefix structure means one number summarizes all of them."
}
```
`````

## Variants

- **Jump Game II** (next lesson): instead of *whether* you can reach the
  end, count the *minimum jumps* to do so — same reachability idea, now
  tracked in "levels."
- **Reachability as a contiguous prefix** is the same downward-closed
  structure that makes the sweep in Module 21 (Intervals) work — worth
  recognizing the pattern across modules.
- **Jump Game III / with obstacles**: once jumps can go *both*
  directions or land on forbidden cells, reachability stops being a
  contiguous prefix and the greedy breaks — you're back to BFS/DFS graph
  reachability (Module 23). A good check on *why* the greedy worked here.

```quiz
{
  "questions": [
    {
      "question": "Why is it correct to track only max_reach (a single number) and discard which specific jumps produced it?",
      "options": [
        "Because the set of reachable indices is always a contiguous prefix [0, max_reach] — reachability is downward-closed within each jump — so two routes reaching the same farthest index leave identical futures, making the route itself irrelevant",
        "Because we only ever take the maximum-length jump at each step — the algorithm commits to jumping as far as nums[i] allows at every index, so max_reach simply tracks the single greedy path actually taken rather than summarizing multiple possible routes",
        "Because the array is sorted, so order doesn't matter — since nums is guaranteed to be in non-decreasing order, any jump sequence reaches the same farthest point regardless of which specific jumps are chosen"
      ],
      "answer": 0,
      "explanation": "The reachable set is never a scattered collection of indices; it's a solid prefix, fully described by its right endpoint. Since the future depends only on how far right you can get, max_reach is complete state and the specific jump history carries no additional information — that's exactly why no reconsideration is ever needed."
    },
    {
      "question": "The check `if i > max_reach: return False` is the core of the algorithm. What condition does it actually detect?",
      "options": [
        "That we have jumped too many times — the check counts how many jumps have been taken so far and fails once that count exceeds some implicit limit derived from the array's length",
        "That nums[i] is zero — the check is really testing whether the current index has no forward reach of its own, which would make any further progress from this specific index impossible",
        "That the contiguous reachable prefix [0, max_reach] does not include index i — i.e. every earlier index's reach fell short of i, so i (and therefore the end) can't be reached"
      ],
      "answer": 2,
      "explanation": "max_reach is the far edge of everything reachable so far. If the loop counter i has passed it, no earlier index could stretch to i, so i is a gap that stalls all progress. This single comparison is the entire failure test — everything else just extends the horizon."
    }
  ]
}
```
