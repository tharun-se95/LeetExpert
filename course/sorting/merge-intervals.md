---
title: Merge Intervals
type: problem
---

## Problem

Given a collection of intervals `[start, end]`, merge all **overlapping**
intervals and return the resulting non-overlapping set.

**Examples**

```text
[[1,3],[2,6],[8,10],[15,18]]  →  [[1,6],[8,10],[15,18]]
[[1,4],[4,5]]                  →  [[1,5]]   (touching counts as overlapping)
```

**Constraints:** 1 ≤ n ≤ 10⁴ · intervals given in **arbitrary order**.

## Attempt it first

The whole problem is exactly one insight away: overlapping intervals are
hard to detect in arbitrary order, but trivial once **sorted by start
time** — overlaps can then only happen between neighbors. Find the
one-line reduction before opening the hint.


```sandbox
{
  "id": "merge-intervals",
  "fn": { "python": "merge_intervals", "javascript": "mergeIntervals" },
  "check": "return",
  "starter": {
    "python": "def merge_intervals(intervals):\n    # Return the intervals with every overlap merged.\n    pass\n",
    "javascript": "function mergeIntervals(intervals) {\n  // Return the intervals with every overlap merged.\n}\n"
  },
  "cases": [
    { "args": [[[1, 3], [2, 6], [8, 10], [15, 18]]], "expect": [[1, 6], [8, 10], [15, 18]] },
    { "args": [[[1, 4], [4, 5]]], "expect": [[1, 5]] },
    { "args": [[[1, 4], [2, 3]]], "expect": [[1, 4]] },
    { "args": [[[1, 4]]], "expect": [[1, 4]] },
    { "args": [[[5, 6], [1, 2], [3, 4]]], "expect": [[1, 2], [3, 4], [5, 6]] },
    { "args": [[[1, 10], [2, 3], [4, 5], [6, 7]]], "expect": [[1, 10]] },
    { "args": [[[2, 3], [2, 3]]], "expect": [[2, 3]] }
  ]
}
```

````reveal Hint — sort, then one linear sweep
Sort by start. Walk the sorted list keeping a 'current merged interval.'
Each next interval either overlaps the current one (start <= current
end — extend it) or doesn't (start > current end — the current interval
is finished; push it, start a new current).
````

## Brute force, for contrast

Compare every pair of intervals for overlap, merging as you find them,
repeating until stable: O(n²) or worse, and genuinely fiddly to get
right (merging can cascade — merging A and C might newly make the
result overlap B). Sorting eliminates the cascading entirely: once
sorted, an interval can only possibly overlap its immediate
predecessor's merged range, never something farther back.

## The insight

> Overlap detection is a NEIGHBOR question once the intervals are in
> start order — sort pays O(n log n) once to convert an all-pairs
> problem into a single linear sweep. This is the same shape as 3Sum's
> sort-then-converge (Module 10): pay for order, then solve something
> much easier on the ordered structure.

## Solution

`````reveal Solution — sort by start, sweep and merge
````tabs
```python
def merge_intervals(intervals: list[list[int]]) -> list[list[int]]:
    intervals.sort(key=lambda pair: pair[0])       # sort by START
    merged: list[list[int]] = []
    for start, end in intervals:
        if merged and start <= merged[-1][1]:      # overlaps the current merged range
            merged[-1][1] = max(merged[-1][1], end)
        else:
            merged.append([start, end])            # starts a new range
    return merged
```

```typescript
function mergeIntervals(intervals: number[][]): number[][] {
  intervals.sort((a, b) => a[0] - b[0]); // sort by START — never default sort!
  const merged: number[][] = [];
  for (const [start, end] of intervals) {
    const last = merged[merged.length - 1];
    if (last && start <= last[1]) {
      // overlaps the current merged range
      last[1] = Math.max(last[1], end);
    } else {
      merged.push([start, end]); // starts a new range
    }
  }
  return merged;
}
```
````

The `max(merged[-1][1], end)` (not just `end`) matters on inputs like
`[[1,10],[2,3]]`: the second interval is fully contained in the first,
so extending to its end (3) would incorrectly SHRINK the merged range
from 10 to 3. Taking the max keeps the merged interval correctly
covering everything absorbed so far.

```complexity
{
  "time": "O(n log n)",
  "space": "O(n)",
  "why": "The sort dominates; the sweep afterward is a single O(n) linear pass. Sorting is why the dependent-neighbor check suffices instead of an O(n^2) all-pairs scan."
}
```
`````

## Variants

- **Insert Interval:** a single new interval into an ALREADY-sorted,
  already-merged list — no full sort needed, just find where it fits
  and merge locally, O(n).
- **Meeting Rooms II** (next): a harder relative — doesn't merge
  intervals, but counts how many overlap SIMULTANEOUSLY.
- **Non-overlapping Intervals** (remove the fewest to make the rest
  non-overlapping): sort by END instead of start — a preview of why
  Greedy (Module 22) so often starts with a sort choice that looks
  similar to this one but isn't interchangeable.

```quiz
{
  "question": "Why does sorting by start time reduce overlap-checking to only comparing NEIGHBORS, rather than needing to check every pair?",
  "options": [
    "It doesn't — some overlaps can still skip a neighbor; a sufficiently long interval can overlap several intervals that are two or more positions ahead in the sorted order, requiring occasional lookahead beyond the immediate neighbor",
    "Because overlapping intervals are always adjacent in the input — the problem guarantees that any two overlapping intervals appear next to each other in the original unsorted list, which is what sorting merely preserves",
    "Once sorted by start, if interval i doesn't overlap the currently-merged range (its start is past the merged range's end), no LATER interval can overlap that merged range either — later starts are only larger. So overlap can only ever be assessed against the immediately preceding merged interval"
  ],
  "answer": 2,
  "explanation": "This is the same 'sortedness makes local checks globally sufficient' argument from Two Pointers and Binary Search — sorting doesn't just make the DATA easier to look at, it changes what a single comparison is able to PROVE about everything else."
}
```
