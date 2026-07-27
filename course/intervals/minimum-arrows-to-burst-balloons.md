---
title: Minimum Number of Arrows to Burst Balloons
type: problem
---

## Problem

Balloons are taped to a wall. Balloon *i* spans the horizontal range
`[start, end]` (its width). You shoot arrows straight up from points on
the x-axis; an arrow shot at `x` bursts **every** balloon whose range
contains `x` (i.e. `start <= x <= end`). Return the **minimum number of
arrows** needed to burst all balloons.

**Examples**

```text
[[10,16],[2,8],[1,6],[7,12]]  →  2
  (one arrow at x=6 bursts [2,8],[1,6]; another at x=11 bursts [10,16],[7,12])

[[1,2],[3,4],[5,6],[7,8]]     →  4   (no two balloons share any x — one arrow each)

[[1,2],[2,3],[3,4],[4,5]]     →  2   (arrow at x=2 bursts [1,2],[2,3]; x=4 bursts [3,4],[4,5])
```

**Constraints:** 1 ≤ n ≤ 10⁵ · endpoints fit in a 32-bit integer ·
touching endpoints count as overlapping (an arrow at a shared endpoint
bursts both).

## Attempt it first

If you solved **Non-overlapping Intervals** in the previous lesson, you
have already written this algorithm — you just called it something else.
Reframe: an arrow bursts a maximal *group* of balloons that all share at
least one common x. So "minimum arrows" is "minimum number of groups such
that every balloon in a group has a common piercing point." Try to see
that this is the same sort-by-end greedy before opening the hint.


```sandbox
{
  "id": "minimum-arrows-to-burst-balloons",
  "fn": { "python": "find_min_arrow_shots", "javascript": "findMinArrowShots" },
  "check": "return",
  "starter": {
    "python": "def find_min_arrow_shots(points):\n    # Return the fewest arrows that burst every balloon.\n    pass\n",
    "javascript": "function findMinArrowShots(points) {\n  // Return the fewest arrows that burst every balloon.\n}\n"
  },
  "cases": [
    { "args": [[[10, 16], [2, 8], [1, 6], [7, 12]]], "expect": 2 },
    { "args": [[[1, 2], [3, 4], [5, 6], [7, 8]]], "expect": 4 },
    { "args": [[[1, 2], [2, 3], [3, 4], [4, 5]]], "expect": 2 },
    { "args": [[[1, 2]]], "expect": 1 },
    { "args": [[[1, 10], [2, 3], [4, 5], [6, 7]]], "expect": 3 },
    { "args": [[[1, 5], [1, 5], [1, 5]]], "expect": 1 }
  ]
}
```

````reveal Hint — sort by end, plant an arrow at the earliest end
Sort balloons by their **end** coordinate. Shoot the first arrow at the
end of the earliest-ending balloon — that's the position most likely to
also catch its neighbors, and it's guaranteed to burst that balloon.
Then skip every balloon whose start is at or before that arrow (already
burst). When you hit a balloon that starts *after* the arrow, it needs a
new arrow — plant it at that balloon's end, and repeat.
````

## Brute force, for contrast

Model it as an interval-covering search: try every candidate arrow
position (each balloon's endpoints are the only positions worth
considering) and search for the smallest set of positions covering all
balloons. Done naively this is exponential; even a careful
set-cover-style formulation is far more expensive than needed. The greedy
below is **O(n log n)**, dominated entirely by the sort, and — as in the
previous lesson — provably optimal by an exchange argument.

## The insight

> This is **Non-overlapping Intervals with the sign flipped**. There, you
> counted intervals you had to *drop* to leave a disjoint set. Here, you
> count *arrows*, where one arrow serves one maximal cluster of
> mutually-piercing balloons. Both reduce to the identical move: sort by
> end, and greedily commit to the earliest end, skipping everything it
> covers.

Concretely, the previous lesson counted a **removal** every time an
interval overlapped the last kept one. This lesson counts a **new arrow**
every time a balloon does *not* overlap the current arrow. Same
comparison, opposite branch: overlap means "already handled" here (the
arrow gets it for free) rather than "must remove." The earliest-end
choice is safe for the same reason — an arrow at the earliest end catches
that balloon plus every balloon still open at that x, and there's no way
to burst the earliest-ending balloon with fewer arrows, so committing
there never costs you. The exchange argument from Non-overlapping
Intervals transfers line for line, which is why this is a **greedy**
algorithm (Module 22) just like its sibling.

## Solution

`````reveal Solution — sort by end, count arrows greedily
````tabs
```python
def find_min_arrow_shots(points: list[list[int]]) -> int:
    points.sort(key=lambda b: b[1])          # sort by END coordinate
    arrows = 1                                 # the first balloon always needs an arrow
    arrow_x = points[0][1]                     # plant it at the earliest end
    for start, end in points[1:]:
        if start > arrow_x:                    # this balloon is NOT pierced — new arrow
            arrows += 1
            arrow_x = end
        # else: start <= arrow_x — already burst by the current arrow, skip
    return arrows
```

```typescript
function findMinArrowShots(points: number[][]): number {
  points.sort((a, b) => a[1] - b[1]); // sort by END coordinate
  let arrows = 1; // the first balloon always needs an arrow
  let arrowX = points[0][1]; // plant it at the earliest end
  for (let i = 1; i < points.length; i++) {
    const [start] = points[i];
    if (start > arrowX) {
      // this balloon is NOT pierced — new arrow
      arrows++;
      arrowX = points[i][1];
    }
    // else: start <= arrowX — already burst by the current arrow, skip
  }
  return arrows;
}
```
````

The comparison is `start > arrow_x` (strict) because touching endpoints
count as overlapping here — a balloon starting exactly at `arrow_x` *is*
pierced by that arrow, so it should be skipped, not charged a new arrow.
This is the concept lesson's boundary choice again, set the opposite way
from Non-overlapping Intervals (which used `>=` on the keep side because
touching there did *not* count as overlap). The two problems share an
algorithm but make opposite boundary calls, and each inequality is dictated
by its own problem's rule about touching — verify the strict `>` against
the `[[1,2],[2,3],[3,4],[4,5]]` example, which must return 2, not 4.

We seed `arrows = 1` and `arrow_x` from the first (earliest-ending)
balloon rather than starting from zero, because there is always at least
one balloon (n ≥ 1) and it always needs an arrow. Every later balloon
either shares the current arrow (skip) or forces a fresh one.

```complexity
{
  "time": "O(n log n)",
  "space": "O(1)",
  "why": "The sort by end dominates. The sweep is a single O(n) pass carrying two scalars (arrows, arrow_x), adding no asymptotic cost and no extra space beyond the sort itself."
}
```
`````

## Complexity — same shape, same cost as its sibling

Identical to Non-overlapping Intervals: O(n log n) sort, O(n) sweep, O(1)
extra state. That the two problems land on the exact same complexity is
not a coincidence — they are the same algorithm. When you meet a new
interval problem and can map it onto "sort by end, greedily commit to the
earliest end," you already know its cost before writing a line.

## Variants

- **Non-overlapping Intervals** (previous): the sibling problem — same
  greedy, framed as removals instead of arrows. If these two feel like one
  algorithm to you now, this lesson did its job.
- **Merge Intervals** (Module 14): also groups overlapping intervals, but
  sorts by *start* and merges ranges rather than counting groups — a useful
  contrast on when to sort by start vs. end.
- **Greedy (Module 22):** the earliest-end exchange argument reused here is
  that module's core proof pattern, now seen on two problems in a row.

```quiz
{
  "question": "Minimum Arrows and Non-overlapping Intervals both sort by end and greedily commit to the earliest end, yet one increments its counter when the current interval OVERLAPS and the other when it does NOT overlap. Why do they take opposite branches on the same comparison?",
  "options": [
    "They count different things: Non-overlapping Intervals counts intervals it must REMOVE (charged when an interval overlaps a kept one), while Minimum Arrows counts NEW arrows (charged when a balloon does not overlap the current arrow, since overlap means it's already burst for free)",
    "One of them has a bug; correct code would use the same branch — since both problems sort by end and use the same greedy structure, a correct implementation should charge its counter on identical conditions in both, and the difference is an inconsistency that happens to still pass the examples",
    "The two problems sort in opposite directions, so the branches must differ — Minimum Arrows actually sorts by start while Non-overlapping Intervals sorts by end, and that reversed ordering is what forces the counting condition to flip"
  ],
  "answer": 0,
  "explanation": "It's the same sort-by-end greedy scaffold, but the quantity being counted is complementary. Overlap with the current commitment means 'already handled' for arrows (no new arrow needed) but 'conflict' for non-overlapping intervals (a removal). Recognizing that these are one algorithm with two accountings is the transferable insight."
}
```
