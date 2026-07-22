---
title: Meeting Rooms II
type: problem
---

## Problem

Given meeting time intervals `[start, end]`, return the **minimum
number of conference rooms** required so that no two meetings using the
same room overlap.

**Examples**

```text
[[0,30],[5,10],[15,20]]  →  2   (0-30 overlaps both others, but they don't overlap each other)
[[7,10],[2,4]]           →  1
```

**Constraints:** 1 ≤ n ≤ 10⁴.

## Attempt it first

This is NOT Merge Intervals — it doesn't ask to merge overlapping
ranges, it asks how many are simultaneously in progress at the busiest
moment. Separate the starts and ends and think about what a "room in
use" count does as time moves forward.

````reveal Hint 1 — separate starts from ends, sort each
Every meeting START is a +1 to rooms-needed; every meeting END is a −1.
Collect all starts into one sorted list and all ends into another
(NOT paired by meeting — just two independent sorted lists of times).
````

````reveal Hint 2 — merge-like sweep over the two sorted lists
Walk both sorted lists with two pointers (Merge Two Sorted Lists'
exact shape, Module 7): at each step, take whichever event (a start or
an end) happens EARLIEST. A start increments the current room count and
updates a running maximum; an end decrements it. The answer is the
maximum ever reached. One subtlety: if a start and an end happen at the
SAME time, process the end FIRST (a meeting ending at t frees the room
for one starting at t) — check this against the [[7,10],[2,4]] example.
````

## Brute force, for contrast

For each point in time, count how many intervals contain it: far too
slow over a continuous range, and even discretized to interval
endpoints it's O(n²). Separating starts/ends and sweeping is O(n log n)
— the sort is what turns "count overlaps at every possible instant"
into "count overlaps only at the O(n) moments where the count could
even change."

## The insight

> The room count only changes at a meeting's start or end — nowhere
> else. So track those n starts and n ends as two independently sorted
> timelines, and merge-sweep them exactly like Merge Two Sorted Lists:
> whichever event is earliest fires next, adjusting a running counter,
> and the answer is that counter's peak.

## Solution

`````reveal Solution — two sorted event lists, merge-style sweep
````tabs
```python
def min_meeting_rooms(intervals: list[list[int]]) -> int:
    starts = sorted(s for s, e in intervals)
    ends = sorted(e for s, e in intervals)

    rooms = 0
    max_rooms = 0
    i = j = 0
    while i < len(starts):
        if starts[i] < ends[j]:            # a meeting starts before the next ends
            rooms += 1
            max_rooms = max(max_rooms, rooms)
            i += 1
        else:                               # ends[j] <= starts[i]: free a room FIRST
            rooms -= 1
            j += 1
    return max_rooms
```

```typescript
function minMeetingRooms(intervals: number[][]): number {
  const starts = intervals.map(([s]) => s).sort((a, b) => a - b);
  const ends = intervals.map(([, e]) => e).sort((a, b) => a - b);

  let rooms = 0;
  let maxRooms = 0;
  let i = 0,
    j = 0;
  while (i < starts.length) {
    if (starts[i] < ends[j]) {
      // a meeting starts before the next ends
      rooms++;
      maxRooms = Math.max(maxRooms, rooms);
      i++;
    } else {
      // ends[j] <= starts[i]: free a room FIRST
      rooms--;
      j++;
    }
  }
  return maxRooms;
}
```
````

The tie-break — `starts[i] < ends[j]` (strict), not `<=` — is the same
subtlety Hint 2 flagged: on `[[7,10],[2,4]]`, sorted starts = [2,7],
ends = [4,10]. At i=0: start 2 < end 4 → room opens, rooms=1, max=1. At
i=1: start 7 < end 4? No (7 ≥ 4) → free a room first: rooms=0, j=1.
Then loop back: start 7 < end 10 → rooms=1, max stays 1. Final answer:
1 — correct, because the first meeting fully ends before the second
starts. Getting the strict inequality backwards would count the tie as
an overlap and overcount rooms.

```complexity
{
  "time": "O(n log n)",
  "space": "O(n)",
  "why": "Two sorts dominate; the sweep afterward is a single O(n) merge-style pass, each pointer advancing at most n times total."
}
```
`````

## Variants

- **Merge Intervals** (previous problem): asks a related but different
  question — WHICH ranges overlap, not how many overlap AT ONCE. Mixing
  these up is the most common confusion between the two.
- **Car Pooling / Meeting Rooms III:** the same start/end sweep,
  generalized to capacities or numbered rooms — a min-heap of "room
  free times" is the natural next step once you need to know WHICH
  room, not just how many (Module 19).

```quiz
{
  "question": "Why must an END event be processed before a START event when they occur at the exact same time?",
  "options": [
    "Because ends are always sorted before starts in the input — the two event lists are constructed in a way that guarantees this ordering automatically, so no special tie-breaking logic is actually needed in the sweep itself",
    "It's an arbitrary tie-breaking convention with no real consequence — processing starts before ends at a tie would just shift the peak-counting moment slightly without changing the final maximum the algorithm reports",
    "A meeting ending at time t genuinely frees its room at t, and a meeting starting at t can correctly reuse that same room — processing the start first would count both meetings as needing separate rooms for an instant that doesn't actually require it, overcounting the answer"
  ],
  "answer": 2,
  "explanation": "This is a real modeling choice about what 'the room is free' means at the boundary instant — not a coding formality. Getting it backwards produces a genuinely wrong (too large) room count on any input with a meeting ending exactly when another begins."
}
```
