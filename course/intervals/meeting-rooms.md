---
title: Meeting Rooms
type: problem
---

## Problem

Given an array of meeting time intervals `[start, end]`, determine
whether a person could attend **all** of them — that is, return `true` if
no two meetings overlap, and `false` otherwise. A meeting ending exactly
when another begins does **not** count as a conflict.

**Examples**

```text
[[0,30],[5,10],[15,20]]  →  false   ([0,30] overlaps both others)
[[7,10],[2,4]]           →  true    (2–4 finishes before 7–10 starts)
[[1,5],[5,8]]            →  true    (touching endpoints are fine)
```

**Constraints:** 0 ≤ n ≤ 10⁴.

## Attempt it first

This is the *boolean* cousin of Module 14's **Meeting Rooms II**. That
problem asked "how many rooms are needed at once?" and required real
machinery — a heap or a two-pointer sweep over separated endpoints. This
one asks only "is one room ever enough?", i.e. "do any two meetings
overlap at all?" That is a strictly easier question, and it should need
strictly less machinery. Find the one-pass check before opening the hint.

````reveal Hint — sort by start, then check adjacent pairs only
Sort by start time. Once sorted, if *any* two meetings overlap, two
**adjacent** meetings in sorted order must overlap — so you only need to
check each meeting against its immediate predecessor. If meeting i starts
before meeting i−1 ends, there's a conflict; return false. If you get
through the whole list with no such clash, return true.
````

## Brute force, for contrast

Compare every pair of meetings for overlap: **O(n²)**. Correct, but it
ignores the structure sorting exposes. As the concept lesson argued, once
you sort by start, overlap becomes a *neighbor* question — so the O(n²)
all-pairs scan collapses to a single O(n) adjacent-pairs check after an
O(n log n) sort.

## The insight

> Sort by start. If two meetings anywhere in the list overlap, then two
> **adjacent** meetings must overlap — so a single pass comparing each
> meeting's start against the previous meeting's end decides the whole
> question.

**Why adjacent pairs suffice.** After sorting by start, suppose meeting *j*
overlaps some earlier meeting *i* (so *i* starts before *j*, and *j*
starts before *i* ends). Consider meeting *j−1*, the one right before *j*.
Its start is ≥ meeting *i*'s start (sorted order) but ≤ meeting *j*'s
start. Since meeting *i* is still in progress when *j* starts, and *j−1*
starts no later than *j*, meeting *i* is still in progress when *j−1*
starts too — so *j−1* also sits inside a conflict. Pushing this down,
*some* adjacent pair must clash. Contrapositive: if **no** adjacent pair
clashes, no pair clashes at all. That's exactly the running-state sweep —
the only state you carry is "the previous meeting's end."

## Solution

`````reveal Solution — sort by start, scan adjacent pairs
````tabs
```python
def can_attend_meetings(intervals: list[list[int]]) -> bool:
    intervals.sort(key=lambda iv: iv[0])       # sort by START
    for i in range(1, len(intervals)):
        if intervals[i][0] < intervals[i - 1][1]:   # this start is before previous end
            return False                             # overlap → can't attend all
    return True
```

```typescript
function canAttendMeetings(intervals: number[][]): boolean {
  intervals.sort((a, b) => a[0] - b[0]); // sort by START
  for (let i = 1; i < intervals.length; i++) {
    if (intervals[i][0] < intervals[i - 1][1]) {
      // this start is before previous end → overlap
      return false;
    }
  }
  return true;
}
```
````

The comparison is `intervals[i][0] < intervals[i - 1][1]` (strict `<`),
because a meeting starting exactly when the previous one ends is
*allowed* — touching endpoints don't conflict here. Using `<=` would
wrongly reject `[[1,5],[5,8]]`. This is the concept lesson's boundary
choice once more, set so that shared endpoints are fine (the opposite of
Merge Intervals, where touching intervals *did* merge). Because we sorted
by start, `intervals[i-1][1]` is the end of the meeting that starts just
before meeting `i` — the only predecessor that could possibly still be
running when `i` begins.

```complexity
{
  "time": "O(n log n)",
  "space": "O(1)",
  "why": "The sort by start dominates. The scan is one O(n) pass comparing each meeting to its predecessor, carrying no state beyond the loop index — so no extra space and no extra asymptotic cost."
}
```
`````

## Meeting Rooms vs. Meeting Rooms II — why the harder one needs more

Both start by sorting, but the questions diverge sharply, and so does the
machinery each demands:

- **Meeting Rooms (this problem):** "Is one room ever enough?" A yes/no
  question. The moment you find a *single* overlap the answer is settled,
  so a plain adjacent-pair scan after sorting by start suffices — O(1)
  running state (just the previous end).
- **Meeting Rooms II (Module 14):** "What is the *maximum* number of
  meetings overlapping at once?" A counting question. Knowing that *some*
  overlap exists tells you nothing about how *many* pile up at the busiest
  instant, so a single previous-end isn't enough state. You must track
  every currently-live meeting — separating starts and ends into two
  sorted lists and sweeping them (or using a min-heap of end times). That
  extra bookkeeping is not incidental complexity: the harder question
  genuinely requires more state to answer.

The lesson generalises: **match the machinery to the question.** A boolean
"does any conflict exist" needs only to detect one clash; a quantitative
"how bad is the worst moment" needs to maintain a live count. Reaching
for Meeting Rooms II's heap here would be correct but over-built — and
reaching for this adjacent-scan on Meeting Rooms II would be simply wrong,
because it can't count simultaneity.

## Variants

- **Meeting Rooms II** (Module 14): the counting version — read it to see
  exactly what extra machinery the harder question forces, as contrasted
  above.
- **Merge Intervals** (Module 14): also sorts by start and does a neighbor
  sweep, but its boundary treats touching as overlapping (it merges
  `[1,4]` and `[4,5]`) — a clean contrast in how the same sweep flips one
  inequality based on the problem's rule about shared endpoints.

```quiz
{
  "question": "Meeting Rooms is solved with a simple adjacent-pair scan, but Meeting Rooms II needs a heap or a two-pointer sweep over separated endpoints. What about the two questions justifies the difference in machinery?",
  "options": [
    "Meeting Rooms II has larger inputs, so it needs a faster data structure — once the number of meetings grows past some threshold, the adjacent-pair scan becomes too slow and a heap becomes necessary purely for performance reasons",
    "Meeting Rooms II cannot be sorted, so it needs a heap instead — because it tracks multiple simultaneous meetings, sorting the input by start time would destroy the information needed to count overlaps, so a heap replaces the sort entirely",
    "Meeting Rooms only needs to detect whether ANY overlap exists (a boolean settled by the first clash, so O(1) running state suffices), while Meeting Rooms II must count the MAXIMUM simultaneous overlaps — which requires tracking all currently-live meetings, not just the previous one"
  ],
  "answer": 2,
  "explanation": "The boolean question is decided the instant one overlap appears, so carrying a single previous-end is enough. The counting question needs to know how many meetings are simultaneously active at the busiest moment, which no single scalar of state can capture — hence the heap or dual-pointer sweep. Match the machinery to what the question actually demands."
}
```
