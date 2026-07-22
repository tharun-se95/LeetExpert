---
title: Koko Eating Bananas
type: problem
---

## Problem

Koko has `piles[i]` bananas in pile i. She eats at a constant speed of
`k` bananas per hour: from any pile, she eats `min(k, pile size)` that
hour (never combining piles in one hour). Given `h` hours until the
guards return, find the **minimum integer speed `k`** that lets her eat
all bananas within `h` hours.

**Examples**

```text
piles = [3,6,7,11], h = 8   →  4
piles = [30,11,23,4,20], h = 5   →  30
piles = [30,11,23,4,20], h = 6   →  23
```

**Constraints:** 1 ≤ piles.length ≤ 10⁴ · 1 ≤ piles[i] ≤ 10⁹ ·
piles.length ≤ h ≤ 10⁹.

## Attempt it first

This is the module's textbook example of binary search on the answer —
recognize the three-signal pattern from the concept lesson before
writing anything: minimum value satisfying a condition, a feasibility
check, monotonic feasibility.

````reveal Hint 1 — confirm all three signals
Asked for: MINIMUM speed satisfying 'finishes within h hours' — signal
1. Feasibility check: given a candidate speed k, compute total hours
needed (sum of ceil(pile / k) for each pile) and compare to h — signal
2, and it's clearly computable. Monotonicity: does a FASTER speed ever
take MORE hours? Convince yourself no — signal 3 confirmed.
````

````reveal Hint 2 — bound the search range
Slowest sensible speed: k=1 (worst case, could take forever — but the
problem guarantees a finite answer exists since piles.length <= h).
Fastest useful speed: k = max(piles) — any faster gains nothing, since
each pile still costs at least 1 hour regardless of how far speed
overshoots it. Search [1, max(piles)].
````

## Brute force, for contrast

Try every speed from 1 upward, computing hours needed for each, stop at
the first that works: O(max(piles) · n) — up to 10⁹ × 10⁴ = 10¹³,
hopeless. Binary search on the answer needs only about log₂(10⁹) ≈ 30
feasibility checks, each O(n): ~3×10⁵ total operations.

## Solution

`````reveal Solution — binary search over possible speeds
````tabs
```python
import math

def min_eating_speed(piles: list[int], h: int) -> int:
    def hours_needed(speed: int) -> int:
        return sum(math.ceil(pile / speed) for pile in piles)

    lo, hi = 1, max(piles)
    while lo < hi:
        mid = lo + (hi - lo) // 2
        if hours_needed(mid) <= h:      # speed mid is FEASIBLE
            hi = mid                     # the answer might be mid or smaller
        else:
            lo = mid + 1                  # too slow — need more speed
    return lo
```

```typescript
function minEatingSpeed(piles: number[], h: number): number {
  function hoursNeeded(speed: number): number {
    return piles.reduce((total, pile) => total + Math.ceil(pile / speed), 0);
  }

  let lo = 1;
  let hi = Math.max(...piles);
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (hoursNeeded(mid) <= h) {
      hi = mid; // the answer might be mid or smaller
    } else {
      lo = mid + 1; // too slow — need more speed
    }
  }
  return lo;
}
```
````

This is the boundary-search template with `feasible(mid)` instantiated
as `hours_needed(mid) <= h` — identical shape to `lower_bound`, just
searching "minimum speed such that hours needed drops to ≤ h" instead
of "minimum index such that a value is ≥ target." Verify on
`piles=[3,6,7,11], h=8`: at speed 4, hours = ceil(3/4)+ceil(6/4)+
ceil(7/4)+ceil(11/4) = 1+2+2+3 = 8 ≤ 8 — feasible. At speed 3, hours =
1+2+3+4 = 10 > 8 — infeasible. The boundary between infeasible and
feasible is exactly 4, matching the expected answer.

```complexity
{
  "time": "O(n log(max(piles)))",
  "space": "O(1)",
  "why": "log(max(piles)) ~ 30 iterations of the search, each paying an O(n) feasibility check — the binary-search-on-the-answer cost formula from the concept lesson, made concrete."
}
```
`````

## Variants

- **Capacity To Ship Packages Within D Days:** identical shape —
  minimum ship capacity, feasibility = "can all packages ship within D
  days at this capacity," monotonic in capacity.
- **Divide Chocolate / Split Array Largest Sum:** the MAXIMUM-instead-
  of-minimum mirror — binary search for the smallest possible "largest
  partition," same three signals, feasibility check counts partitions
  needed instead of hours.
- **Find Minimum in Rotated Sorted Array** (next): a reminder that not
  every binary-search problem searches an answer space — some still
  search actual array positions, just with a twist.

```quiz
{
  "question": "Why is it safe to bound the search range at hi = max(piles) rather than searching all the way up to some larger number?",
  "options": [
    "max(piles) is just a convenient round number — it happens to be a value already available from the input without further computation, which is why it was chosen as the upper bound rather than any deeper property of the feasibility function",
    "The problem guarantees the answer is at most max(piles) — this bound is stated explicitly in the problem's constraints section, so the search range is set directly from that guarantee rather than derived independently",
    "Any speed >= max(piles) finishes EVERY pile in exactly 1 hour each (since min(k, pile) caps at the pile size) — going faster than max(piles) can never reduce total hours further, so max(piles) is already the fastest speed that could possibly matter"
  ],
  "answer": 2,
  "explanation": "This is an argument about the feasibility function's behavior, not a guessed bound: hours_needed(speed) is constant (equal to piles.length) for every speed >= max(piles), so searching beyond that point can never find a DIFFERENT, smaller feasible answer — it would just re-confirm the same feasibility."
}
```
