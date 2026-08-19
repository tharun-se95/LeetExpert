---
title: 3Sum
type: problem
---

## Problem

Given `nums`, return **all unique triplets** summing to zero. The answer
must contain no duplicate triplets (regardless of order).

**Examples**

```examples
nums = [-1,0,1,2,-1,-4]  →  [[-1,-1,2], [-1,0,1]]
nums = [0,1,1]           →  []
nums = [0,0,0]           →  [[0,0,0]]
```

```constraint
3 ≤ n ≤ 3000 · values in ±10⁵.
```

## Attempt it first

The classic composition problem: reduce 3Sum to n instances of a
problem you've already solved. Two designs compete (hash-based and
sort-based); the sort-based one wins here for a reason worth
discovering — the **duplicate handling**, which is 3Sum's real
difficulty and the reason interviewers love it.


```sandbox
{
  "id": "three-sum",
  "fn": { "python": "three_sum", "javascript": "threeSum" },
  "check": "return",
  "compare": "set-of-sets",
  "starter": {
    "python": "def three_sum(nums):\n    # Return every unique triplet summing to zero.\n    return []\n",
    "javascript": "function threeSum(nums) {\n  // Return every unique triplet summing to zero.\n  return [];\n}\n"
  },
  "cases": [
    { "args": [[-1, 0, 1, 2, -1, -4]], "expect": [[-1, -1, 2], [-1, 0, 1]] },
    { "args": [[0, 1, 1]], "expect": [] },
    { "args": [[0, 0, 0]], "expect": [[0, 0, 0]] },
    { "args": [[0, 0, 0, 0]], "expect": [[0, 0, 0]] },
    { "args": [[-2, 0, 1, 1, 2]], "expect": [[-2, 0, 2], [-2, 1, 1]] }
  ]
}
```
````reveal Hint 1 — fix one, solve two
Sort the array. For each index i, the remaining task is: find pairs in
nums[i+1..] summing to −nums[i] — Two Sum II on a sorted slice,
converging pointers, O(n) per i. Total O(n²), plus the O(n log n) sort.
````

````reveal Hint 2 — where duplicates come from, where to kill them
After sorting, equal values are adjacent. Duplicate triplets arise two
ways: the same i-value anchoring twice, and the same (left, right) pair
found twice within one anchor. Kill both at the source — skip repeated
values when advancing i, and after RECORDING a hit, advance left past
equal values (right follows automatically via the sum). Filtering with
a set afterward works but concedes the design point.
````

## Brute force, for contrast

Triple loop: C(n,3) ≈ 4.5·10⁹ at n = 3000 — out. Hash-assisted 2Sum
per anchor: O(n²) time but O(n) extra space AND thorny deduplication
(the map finds pairs in arbitrary order, so triplets need canonical
sorting + a seen-set — the machinery snowballs). Sorting once buys BOTH
the converging engine and adjacency-based dedup — one price, two goods.

## The insight

> Sorting converts 3Sum into n shrinking Two Sum II instances AND makes
> every duplicate adjacent, so uniqueness becomes local skip-rules
> instead of global bookkeeping. The composition is O(n²) — and n
> converging passes each doing batch elimination is exactly the n²-pairs
> budget spent with zero waste.

## Solution

`````reveal Solution — sort, anchor, converge, skip
````tabs
```python
def three_sum(nums: list[int]) -> list[list[int]]:
    nums.sort()                              # O(n log n), enables everything
    out: list[list[int]] = []
    n = len(nums)
    for i in range(n - 2):
        if nums[i] > 0:
            break                            # smallest anchor > 0 ⇒ no zero sums
        if i > 0 and nums[i] == nums[i - 1]:
            continue                         # duplicate anchor: skip
        left, right = i + 1, n - 1
        target = -nums[i]
        while left < right:
            s = nums[left] + nums[right]
            if s == target:
                out.append([nums[i], nums[left], nums[right]])
                left += 1
                while left < right and nums[left] == nums[left - 1]:
                    left += 1                # skip duplicate pair-lefts
                right -= 1
            elif s < target:
                left += 1                    # Two Sum II elimination
            else:
                right -= 1
    return out
```

```typescript
function threeSum(nums: number[]): number[][] {
  nums.sort((a, b) => a - b); // O(n log n), enables everything
  const out: number[][] = [];
  const n = nums.length;
  for (let i = 0; i < n - 2; i++) {
    if (nums[i] > 0) break; // smallest anchor > 0 ⇒ no zero sums
    if (i > 0 && nums[i] === nums[i - 1]) continue; // duplicate anchor
    let left = i + 1;
    let right = n - 1;
    const target = -nums[i];
    while (left < right) {
      const s = nums[left] + nums[right];
      if (s === target) {
        out.push([nums[i], nums[left], nums[right]]);
        left++;
        while (left < right && nums[left] === nums[left - 1]) {
          left++; // skip duplicate pair-lefts
        }
        right--;
      } else if (s < target) {
        left++; // Two Sum II elimination
      } else {
        right--;
      }
    }
  }
  return out;
}
```
````

The three guards, each earning its line:

- **`nums[i] > 0` break**: anchors are the smallest element of their
  triplet (sorted!), so a positive anchor makes a zero sum impossible —
  everything after is larger. A break, not a continue.
- **Anchor dedup compares i to i−1** (not i+1): skip an anchor only if
  the SAME value already served as anchor — comparing forward would
  wrongly skip [-1,-1,2]-style triplets that need equal values inside
  one triplet.
- **Pair dedup after a hit**: advancing only left past duplicates
  suffices — for a fixed anchor and sum, left determines right.

(Note the JS sort comparator: `(a, b) => a - b`. Default JS sort
compares STRINGS — `[-4, -1, 0, 2].sort()` gives `[-1, -4, 0, 2]`,
because "-1" < "-4" lexicographically. Every numeric sort in JS needs
the comparator; Module 14 will beat this drum, but start flinching now.)

```complexity
{
  "time": "O(n²)",
  "space": "O(1) beyond the output (sort's stack aside)",
  "why": "n anchors × O(n) converging pass, after an O(n log n) sort the n² dominates. Dedup guards only ever SKIP work — they can't add any."
}
```
`````

## Variants

- **3Sum Closest:** same skeleton, track nearest sum instead of exact
  hits — no dedup needed (one answer).
- **4Sum:** one more anchor loop around the same core — O(n³);
  k-Sum generalizes recursively with (k−2) anchors.
- **Two Sum (unsorted, indices required):** the case where sorting
  LOSES (destroys indices) and the hash map wins — the two designs'
  trade-off, now visible from both sides.

```quiz
{
  "question": "Why does the anchor dedup check nums[i] == nums[i−1] rather than nums[i] == nums[i+1]?",
  "options": [
    "Backward comparison is faster — checking against the previous element avoids an extra array bounds check that comparing against the next element would require, which is the actual reason for the direction chosen",
    "Either works — direction is a style choice; since the dedup check only compares adjacent equal values in a sorted array, scanning forward or backward produces the identical set of skipped anchors",
    "Backward-compare skips a value only on its SECOND-and-later uses as anchor. Forward-compare would skip the FIRST use — losing triplets like [-1,-1,2] where the duplicate value must appear within one triplet (as anchor and as pair member)"
  ],
  "answer": 2,
  "explanation": "The rule is 'each distinct value anchors once' — not 'skip all duplicated values.' The first occurrence must anchor (its pair-window includes its own duplicates); later occurrences are redundant. One index of direction encodes that entire distinction — trace [-1,-1,2] both ways to feel it."
}
```
