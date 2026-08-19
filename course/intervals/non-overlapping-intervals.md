---
title: Non-overlapping Intervals
type: problem
---

## Problem

Given an array of `intervals`, return the **minimum number of intervals
you must remove** so that the rest are non-overlapping. Touching at an
endpoint (`[1,2]` and `[2,3]`) does **not** count as overlapping.

**Examples**

```examples
[[1,2],[2,3],[3,4],[1,3]]  →  1   (remove [1,3]; the other three are disjoint)
[[1,2],[1,2],[1,2]]        →  2   (keep one copy of [1,2], remove the other two)
[[1,2],[2,3]]              →  0   (touching endpoints don't overlap)
```

```constraint
1 ≤ n ≤ 10⁵ · endpoints fit in a 32-bit integer.
```

## Attempt it first

Reframe before you code. "Minimum removals to make the rest
non-overlapping" is the same as "**maximum** number of intervals you can
**keep** that are already mutually non-overlapping" — remove everything
else. If you keep the largest possible non-overlapping set of size *k*,
you remove exactly `n − k`. So the real problem is: **pick the largest
set of mutually non-overlapping intervals.** That's a classic. Try to
find the greedy rule before opening the hint — and be careful which
endpoint you sort on.


```sandbox
{
  "id": "non-overlapping-intervals",
  "fn": { "python": "erase_overlap_intervals", "javascript": "eraseOverlapIntervals" },
  "check": "return",
  "starter": {
    "python": "def erase_overlap_intervals(intervals):\n    # Return the fewest intervals to drop so the rest do not overlap.\n    pass\n",
    "javascript": "function eraseOverlapIntervals(intervals) {\n  // Return the fewest intervals to drop so the rest do not overlap.\n}\n"
  },
  "cases": [
    { "args": [[[1, 2], [2, 3], [3, 4], [1, 3]]], "expect": 1 },
    { "args": [[[1, 2], [1, 2], [1, 2]]], "expect": 2 },
    { "args": [[[1, 2], [2, 3]]], "expect": 0 },
    { "args": [[[1, 2]]], "expect": 0 },
    { "args": [[[1, 100], [11, 22], [1, 11], [2, 12]]], "expect": 2 },
    { "args": [[[1, 2], [3, 4], [5, 6]]], "expect": 0 }
  ]
}
```

````reveal Hint 1 — it's the "activity selection" problem in disguise
"Choose the most non-overlapping intervals" is the activity-selection
problem: given intervals (activities with a start and finish), select as
many as possible with no two overlapping. The winning greedy rule is
counterintuitive at first — it does **not** sort by start.
````

````reveal Hint 2 — sort by END, always keep the one that finishes first
Sort the intervals by their **end** coordinate. Walk left to right
keeping track of the end of the last interval you decided to keep. For
each interval, if its start is at or after that last kept end, it doesn't
overlap — keep it and update the kept-end. Otherwise it overlaps a
kept interval, so it must be removed. Count the removals.
````

## Brute force, for contrast

Try every subset of intervals, check each for being fully
non-overlapping, and take the largest valid one: **O(2ⁿ · n)** — utterly
infeasible past n ≈ 20. Even a dynamic-programming formulation (sort, then
for each interval find the best compatible predecessor) is O(n²) or
O(n log n) and carries real bookkeeping. The greedy below is O(n log n)
dominated purely by the sort, with an O(n) sweep and no table at all —
and it is *provably* optimal, which is the interesting part.

## The insight

> Sort by **end** time. Repeatedly commit to the interval that finishes
> earliest among those that don't overlap what you've already kept.
> Finishing earliest leaves the maximum possible room for the intervals
> that follow, so this greedy choice is never worse than any other choice
> — an **exchange argument** proves it.

**Why earliest-end is safe (the exchange argument).** Suppose some optimal
solution exists. Look at the interval in it that ends earliest, call it
*O₁*, and compare to the interval our greedy picks first, *G₁* — which by
construction is the globally earliest-ending interval of all. Then *G₁*
ends no later than *O₁*. Swap *O₁* out of the optimal solution and *G₁*
in. Does that break anything? Every other interval in the optimal
solution started at or after *O₁* ended (they were compatible with *O₁*),
and *G₁* ends no later than *O₁* did — so they're all still compatible
with *G₁*. The swapped solution is still valid and still the same size,
hence still optimal. Repeat this argument down the line: at every step,
greedy's earliest-ending choice can replace the optimal solution's
corresponding choice without loss. So greedy is optimal. This is the same
style of reasoning **Module 22 (Greedy)** formalises — this problem is a
genuine greedy algorithm, and the exchange argument is exactly the proof
technique that module is built around. Keep it in mind; you'll see it
again.

**Why sort by end and not start?** The concept lesson's example showed it
concretely: keeping a long early-starting interval (like `[1,100]`) can
block many short ones. Sorting by start would tempt you to commit to it
first. Sorting by end forces you to commit to whatever frees up soonest,
which is precisely the choice the exchange argument shows is safe. Sort
key is not cosmetic here — start-sorted greedy gives wrong answers.

## Solution

`````reveal Solution — sort by end, greedy keep-earliest-finish
````tabs
```python
def erase_overlap_intervals(intervals: list[list[int]]) -> int:
    intervals.sort(key=lambda iv: iv[1])       # sort by END coordinate
    removals = 0
    last_end = float("-inf")                    # end of the last interval we KEPT
    for start, end in intervals:
        if start >= last_end:                   # no overlap — keep this interval
            last_end = end
        else:                                   # overlaps a kept interval — remove it
            removals += 1
    return removals
```

```typescript
function eraseOverlapIntervals(intervals: number[][]): number {
  intervals.sort((a, b) => a[1] - b[1]); // sort by END coordinate
  let removals = 0;
  let lastEnd = -Infinity; // end of the last interval we KEPT
  for (const [start, end] of intervals) {
    if (start >= lastEnd) {
      // no overlap — keep this interval
      lastEnd = end;
    } else {
      // overlaps a kept interval — remove it
      removals++;
    }
  }
  return removals;
}
```
````

The comparison is `start >= last_end` (not `>`), because the problem says
touching endpoints don't overlap: an interval starting exactly when the
last kept one ended is compatible and should be kept. That single
inequality is the concept lesson's boundary choice made concrete — flip
it to `>` and you'd wrongly count `[[1,2],[2,3]]` as needing a removal.
When we keep an interval we advance `last_end`; when we remove one we
leave `last_end` untouched (we're pretending the overlapping interval was
never there), so the *next* interval is still judged against the interval
we actually kept.

```complexity
{
  "time": "O(n log n)",
  "space": "O(1)",
  "why": "The sort by end dominates. The sweep is a single O(n) pass carrying two scalars (removals, last_end), so it adds no asymptotic cost and no extra space beyond the sort's own."
}
```
`````

## Variants

- **Minimum Number of Arrows to Burst Balloons** (next): structurally the
  *same* greedy — sort by end, keep committing to the earliest end. The
  only difference is framing (counting groups vs. counting removals). Read
  them back to back; seeing they're one algorithm is the point.
- **Merge Intervals** (Module 14): sorts by *start* and merges rather than
  removes — the contrast that shows sort-key choice is dictated by the
  question, not by habit.
- **Greedy (Module 22):** the exchange argument used above is that
  module's central proof technique. This problem is a preview of what
  "prove the greedy choice is safe" actually looks like.

```quiz
{
  "questions": [
    {
      "question": "The greedy algorithm sorts by END time and always keeps the interval that finishes earliest. What does the exchange argument actually establish about this choice?",
      "options": [
        "That earliest-finish is faster to compute than earliest-start — since end times are already produced by the sort, no additional subtraction or comparison is needed to identify the earliest-finishing interval, saving a constant amount of work per step",
        "That any optimal solution can have its earliest-ending interval swapped for greedy's earliest-ending choice without becoming invalid or smaller — so greedy's choice is never worse than optimal, which (applied repeatedly) proves greedy is optimal",
        "That earliest-finish intervals are always the shortest intervals — an interval that finishes earliest must, by definition, span the least distance from its start to its end, so sorting by end is equivalent to sorting by interval length"
      ],
      "answer": 1,
      "explanation": "The exchange argument shows the greedy choice is 'safe': swapping it into any optimal solution preserves both validity (everything compatible with the old choice is compatible with an earlier-ending one) and size. Since the greedy choice can always replace the optimal one step by step, greedy achieves the optimum. This is exactly the proof style Module 22 formalizes."
    },
    {
      "question": "Why does sorting by START time (instead of end) break this greedy algorithm?",
      "options": [
        "Start times can be negative but end times cannot — since coordinates can extend below zero on the start side but the problem guarantees ends stay non-negative, sorting by start would need to handle a sign case that sorting by end avoids",
        "Committing to the earliest-starting interval can lock in a long interval that overlaps many later short ones, blocking more intervals than necessary — whereas committing to the earliest-ENDING interval leaves the maximum room for what follows, which is the property the correctness proof depends on",
        "Start-sorting is slower asymptotically — comparing start values during the sort requires an extra pass to normalize the interval representation first, pushing the total complexity above O(n log n)"
      ],
      "answer": 1,
      "explanation": "The concept lesson's [[1,100],[2,3],[4,5]] example makes this concrete: earliest-start greedy keeps [1,100] and blocks both small intervals (keeps 1); earliest-end greedy keeps [2,3] and [4,5] (keeps 2). The exchange argument only goes through for the earliest-ending choice, which is precisely why the sort key is by end."
    }
  ]
}
```
