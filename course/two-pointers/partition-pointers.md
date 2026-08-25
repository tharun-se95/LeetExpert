---
title: Partition Pointers
type: concept
---

## Same direction, different jobs

The second two-pointer shape moves both pointers the **same way** but
gives them different roles. You've been using its simplest form since
Module 4: the write pointer, whose invariant carved the array into
*finished / garbage / unread* regions. This lesson grows that idea into
**partitioning** — rearranging an array into value-based zones in one
pass, in place — and its three-zone crown jewel, the Dutch national
flag.

```diagram
{
  "id": "invariant-regions",
  "size": 8,
  "first": 3,
  "second": 5,
  "doneLabel": "keepers",
  "deadLabel": "junk",
  "openLabel": "unread",
  "firstMarker": "write",
  "secondMarker": "read"
}
```


## Region invariants, formalized

Every same-direction algorithm is a claim about regions. The
write-pointer compaction from Module 4:

```text
[ keepers | overwritable junk | unread ]
 0      write             read        n
```

Partitioning by a predicate (evens before odds, smalls before bigs) is
the same picture with "keepers" generalized to "satisfies the
predicate" — and the swap variant keeps *both* sides' elements (nothing
is junk):

````tabs
```python
def partition(nums: list[int], pred) -> int:
    boundary = 0                       # nums[0:boundary] all satisfy pred
    for i in range(len(nums)):
        if pred(nums[i]):
            nums[boundary], nums[i] = nums[i], nums[boundary]
            boundary += 1
    return boundary                    # first index of the "false" zone
```

```typescript
function partition<T>(nums: T[], pred: (x: T) => boolean): number {
  let boundary = 0; // nums[0..boundary) all satisfy pred
  for (let i = 0; i < nums.length; i++) {
    if (pred(nums[i])) {
      [nums[boundary], nums[i]] = [nums[i], nums[boundary]];
      boundary++;
    }
  }
  return boundary; // first index of the "false" zone
}
```
````

Invariant: *[0, boundary) satisfies pred; [boundary, i) does not; [i, n)
is unread.* Each iteration extends one region by one. This exact
function — with pred = "less than the pivot" — is **quicksort's
partition step** (Module 14); you are two lessons early to the most
consequential five lines in sorting.

One property to notice now because it matters later: this partition is
**not stable** — the swap can reorder equal elements (the element at
`boundary` gets flung to position i, wherever that is). Module 4's
copy-style write pointer WAS stable. Swap buys "keep everything, O(1)
space" at the price of order within zones — a trade you should be able
to name before Module 14 charges you for it.

Trace it on `[4a, 4b, 2]` (two equal 4s, tagged only so you can track
them) with `pred = x < 3`: `i=0`, `4a` fails the predicate, no swap,
`boundary` stays 0. `i=1`, `4b` fails too, `boundary` stays 0. `i=2`,
`2` passes — swap `nums[boundary]` and `nums[2]`, i.e. `nums[0]` and
`nums[2]`: the array becomes `[2, 4b, 4a]`, `boundary` becomes 1. The
two 4s survive, but in the *opposite* relative order they started in —
that swap is the instability, caught in the act.

## Three zones: the Dutch national flag

Two zones need one boundary; **three zones need two** — and the middle
zone's unread region gets squeezed from both sides. It's like sorting a
basket of laundry into darks, lights, and grays in one sweep: darks pile
up on the left, lights pile up on the right, and you only ever look at
the next unsorted item — grays never get their own pile because
"unsorted" and "gray" are the same region until the sweep finishes.
The setup (made famous by Dijkstra): sort an array of 0s, 1s, 2s in one
pass.

```text
[ 0s | 1s | unread | 2s ]
 0   low   mid  high    n
```

Three pointers: `low` (next slot for a 0), `mid` (the read head),
`high` (next slot for a 2, filled right-to-left). The rules, derived
from the picture:

- `nums[mid] == 1`: already in the middle zone — `mid += 1`.
- `nums[mid] == 0`: swap to `low`; both regions extend — `low += 1`,
  `mid += 1`.
- `nums[mid] == 2`: swap to `high`, `high -= 1` — **but do NOT advance
  mid**: the swapped-in element came from the *unread* region and
  hasn't been examined.

That last asymmetry is the entire difficulty of the algorithm, and it's
not a convention — it falls out of the regions: a swap with `low`
brings you an element from the *examined* middle zone (always a 1, safe
to step past); a swap with `high` brings you an unexamined stranger.
When the invariant is drawn, the asymmetry is forced; when it isn't,
the asymmetry is a coin flip that breaks half the time.

Trace it on `[2, 0, 1]` — the adversarial case where getting the
asymmetry wrong actually breaks — with `low = mid = 0`, `high = 2`:

- **Step 1.** `nums[mid] = 2`. Swap with `high`: `nums[0]` and `nums[2]`
  trade places, array becomes `[1, 0, 2]`, `high` becomes 1. `mid` does
  **not** advance — index 0 now holds an unexamined value.
- **Step 2.** `nums[mid] = 1` (the value just swapped in). It's already
  correct for the middle zone — `mid += 1` only, no swap needed.
- **Step 3.** `mid = 1`, `nums[mid] = 0`. Swap with `low`: `nums[0]` and
  `nums[1]` trade places, array becomes `[0, 1, 2]`. Both `low` and
  `mid` advance to 1 and 2.
- `mid` now exceeds `high` — loop ends. `[0, 1, 2]`, correctly sorted in
  one pass, three swaps total.

Notice step 1 is exactly why the asymmetry matters: if `mid` had
advanced there too, index 0's swapped-in value (`1`) would never get
inspected, and the array would end up misclassified. You'll build the
full algorithm in the Sort Colors problem.

## Choosing between the two shapes

| Signal in the problem | Shape |
| --- | --- |
| sorted input + a pair/sum/distance question | converging |
| "move X to one side," "partition," "group by value" | same-direction |
| both sequences advance by their own rules (merge two lists) | same-direction, two arrays |
| answer is about a RANGE that grows/shrinks | neither — sliding window (next module) |

```quiz
{
  "questions": [
    {
      "question": "In Dutch national flag, why does mid advance after a swap with low but NOT after a swap with high?",
      "options": [
        "Symmetry would cause an infinite loop — advancing mid identically after both kinds of swaps would let the pointer oscillate back and forth across the same boundary without ever making forward progress",
        "The element arriving from low's position was already examined (it's a 1 from the middle zone); the element arriving from high's position comes from the UNREAD region and must be examined before mid moves past it",
        "Because high moves leftward — since high is the only pointer moving in the opposite direction from mid, advancing mid after a high-swap would risk the two pointers crossing each other prematurely"
      ],
      "answer": 1,
      "explanation": "Regions answer it: [low, mid) is known-1s, so a low-swap hands you a known quantity; (…, high] was never read. Advance-after-high-swap is the classic bug, and it drops or misplaces exactly one element on adversarial inputs like [2,0,1]."
    },
    {
      "question": "The swap-based partition puts all pred-true elements first but may scramble their relative order. Where does the instability come from?",
      "options": [
        "Floating-point comparison — rounding error accumulated across repeated comparisons is what occasionally causes two otherwise-equal elements to be judged unequal and swapped into a different relative order",
        "It's actually stable — since the partition only ever swaps an element with the boundary position, and both are already confirmed to satisfy the same predicate, their relative order among equals is preserved by construction",
        "The swap displaces the element AT the boundary to position i — an arbitrary later slot — so two equal false-zone elements can end up reordered; the copy-based write pointer never displaces, hence stays stable"
      ],
      "answer": 2,
      "explanation": "Stability dies at the displacement. This is why stable partitioning in O(1) space is genuinely hard, and why quicksort (swap partition) is unstable while merge sort is stable — a Module 14 trade-off you can now derive rather than memorize."
    }
  ]
}
```
