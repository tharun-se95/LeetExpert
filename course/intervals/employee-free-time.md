---
title: Employee Free Time
type: problem
---

## Problem

You're given a list of schedules, one per employee — each schedule is a
list of non-overlapping intervals **already sorted** for that one
employee, representing when they are busy. Return a list of finite
intervals representing the **common free time** for ALL employees,
sorted, and excluding the unbounded free time before the first busy
interval and after the last. (LeetCode 759.)

**Examples**

```text
schedule = [[[1,2],[5,6]], [[1,3]], [[4,10]]]
→ [[3,4]]
   (busy intervals across everyone, flattened & merged: [1,3],[4,10],[5,6]→
    merges to [1,3] and [4,10]; the only gap between merged busy blocks
    is [3,4])
```

**Constraints:** total intervals across all employees up to `~10⁴`.

## Attempt it first

This is the module's capstone because it chains two ideas from earlier
in this module (and Module 14) into one pipeline: first, treat every
employee's busy intervals as just one big unsorted pool and MERGE them
all — directly reusing Module 14's Merge Intervals logic — and then,
once you have one clean, sorted, non-overlapping list of "everyone's
combined busy time," the free time is exactly the GAPS between
consecutive merged intervals. Before opening anything, convince yourself
why merging across ALL employees together (not per-employee) is the
right first step, and what "a gap between two sorted, non-overlapping
intervals" looks like as a formula.

````reveal Hint — flatten everyone's intervals, merge once, then read off the gaps
Don't try to reason about multiple employees' schedules simultaneously —
collapse the problem back to one you've already solved. Take every
interval from every employee's schedule and pour them all into one flat
list (nobody's identity matters anymore at this point — only the union
of "somebody is busy" across the whole company matters for finding
company-wide free time). Sort that flat list by start time, then merge
overlapping/touching intervals exactly as in Merge Intervals (Module
14). What's left is a single sorted, non-overlapping list of "busy for
at least one employee" blocks. The free time is then just the gap
between each merged interval's end and the next merged interval's
start: for consecutive merged intervals `[s1, e1]` and `[s2, e2]`, if
`e1 < s2`, then `[e1, s2]` is a stretch of company-wide free time.
````

## Brute force, for contrast

A less structured approach might try to track, for every possible time
unit, how many employees are busy — a sweep-line with a counter,
incrementing at each interval's start and decrementing at each end, then
scanning for stretches where the counter is 0. This works but requires
discretizing or event-sorting every start/end point separately (2× the
number of intervals as separate events) and is more bookkeeping than
necessary here, since the values aren't guaranteed to be small integers
suitable for direct array indexing. The merge-then-find-gaps approach
below is more direct because it reuses an already-proven building block
(Merge Intervals) rather than building a new counting mechanism from
scratch.

## The insight

Two phases, each one you've already built elsewhere in this course:

1. **Merge** (Module 14): flatten every employee's intervals into one
   list, sort by start, and merge overlapping/touching intervals — this
   produces the exact set of time ranges during which AT LEAST ONE
   employee is busy, with no per-employee distinction remaining (none is
   needed for a company-wide free-time question).
2. **Gap-finding sweep** (this module's concept lesson): walk the merged
   list once, and for each consecutive pair, check whether the first
   one's end is strictly before the second one's start — if so, that gap
   `[end1, start2]` is a stretch of time nobody is busy, i.e. free time
   for everyone.

The two phases compose cleanly because merging guarantees the second
phase never has to worry about an interval hiding inside another or
overlapping across the "boundary" it's checking — by the time gap-
finding runs, the list is already the simplest possible representation
of "who's busy when," reduced to a single combined timeline.

## Solution

`````reveal Solution — merge across all employees, then scan consecutive gaps
````tabs
```python
def employee_free_time(schedule: list[list[list[int]]]) -> list[list[int]]:
    # Phase 1: flatten every employee's intervals into one list, and merge —
    # identical to Merge Intervals (Module 14), just fed a pooled input.
    all_intervals = [iv for employee in schedule for iv in employee]
    all_intervals.sort(key=lambda iv: iv[0])

    merged: list[list[int]] = []
    for start, end in all_intervals:
        if merged and start <= merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], end)   # overlap/touch — extend
        else:
            merged.append([start, end])               # new merged block

    # Phase 2: the gaps between consecutive merged blocks are free time.
    free_time: list[list[int]] = []
    for i in range(1, len(merged)):
        prev_end = merged[i - 1][1]
        curr_start = merged[i][0]
        if prev_end < curr_start:
            free_time.append([prev_end, curr_start])

    return free_time
```

```typescript
function employeeFreeTime(schedule: number[][][]): number[][] {
  // Phase 1: flatten every employee's intervals into one list, and merge —
  // identical to Merge Intervals (Module 14), just fed a pooled input.
  const allIntervals = schedule.flat();
  allIntervals.sort((a, b) => a[0] - b[0]);

  const merged: number[][] = [];
  for (const [start, end] of allIntervals) {
    if (merged.length > 0 && start <= merged[merged.length - 1][1]) {
      merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], end); // overlap/touch — extend
    } else {
      merged.push([start, end]); // new merged block
    }
  }

  // Phase 2: the gaps between consecutive merged blocks are free time.
  const freeTime: number[][] = [];
  for (let i = 1; i < merged.length; i++) {
    const prevEnd = merged[i - 1][1];
    const currStart = merged[i][0];
    if (prevEnd < currStart) {
      freeTime.push([prevEnd, currStart]);
    }
  }

  return freeTime;
}
```
````

Phase 1 is Merge Intervals verbatim — it doesn't know or care that the
intervals came from different employees, which is exactly why pooling
everyone together first is correct: company-wide free time is a
property of the UNION of everyone's busy time, not of any one employee's
schedule individually. Phase 2's condition `prev_end < curr_start`
(strict, not `<=`) matters: `merged` is already guaranteed
non-overlapping and non-touching by Phase 1's merge (touching or
overlapping intervals were already combined), so any `prev_end ==
curr_start` couldn't actually occur post-merge in the first place — but
the strict inequality is still the semantically correct check for "was
there a real gap," and guards correctness even if that invariant were
ever relaxed.

```complexity
{
  "time": "O(n log n)",
  "space": "O(n)",
  "why": "Flattening is O(n) where n is the total interval count across all employees. Sorting is O(n log n) and dominates. Merging and gap-finding are each a single O(n) linear pass. Space is O(n) for the flattened/merged lists."
}
```
`````

## Variants

- **Merge Intervals** (Module 14): Phase 1 of this solution, applied
  directly — re-reading it confirms nothing changes about the merge
  step just because the intervals originated from multiple sources.
- **Sorting Intervals & the Sweep** (concept lesson, this module):
  Phase 2's gap-finding is a direct instance of the general sweep model
  that lesson introduced — walk sorted data left to right, maintaining
  running state (here, "the end of the current merged block").
- **Meeting Rooms** and **Meeting Rooms II** (this module and Module
  14): related "when is everyone/anyone busy" questions, but asking for
  a count or a boolean rather than the actual free-time ranges.

```quiz
{
  "question": "Why is it correct to flatten every employee's intervals into ONE pooled list and merge them together, rather than merging each employee's schedule separately and then trying to compare the separately-merged results?",
  "options": [
    "Company-wide free time requires knowing when AT LEAST ONE employee is busy at any given moment — which is exactly the union of all employees' busy intervals — so merging the pooled set directly computes that union in one pass; merging per-employee first would still require a second cross-employee merge afterward to combine those separate results into the same union, achieving nothing beyond doing the same merge in two passes instead of one",
    "Per-employee schedules cannot be merged together because they use different time units — each employee's calendar is recorded against a locally-offset clock, so intervals from different schedules aren't directly comparable without first normalizing their timestamps",
    "Both approaches are equally valid; pooling first is just a coding convenience — merging per-employee first and then merging the merged results again would produce the identical output at the same asymptotic cost, so the choice is purely stylistic"
  ],
  "answer": 0,
  "explanation": "The quantity that matters for company-wide free time is the UNION of all busy intervals, since free time means nobody at all is busy. Merging is exactly the operation that computes a union of overlapping ranges. Pooling everyone's intervals first and merging once computes that union directly. Merging per-employee first produces several already-merged (but still separate) lists that would then need to be merged AGAIN against each other to get the true company-wide union — so per-employee-first isn't wrong, just strictly more work for an identical final result."
}
```
