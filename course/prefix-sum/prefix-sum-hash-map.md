---
title: Prefix Sum + Hash Map
type: concept
---

## A different question: does a subarray with sum K exist?

The last lesson answered "what's the sum of THIS range?" in O(1) after
preprocessing. A different, subtler question: **"does ANY contiguous
subarray sum to exactly K?"** — or "how many do?" You don't know the
range's endpoints in advance; you're searching for them.

Restated with prefix sums: `sum(nums[l..r]) = prefix[r+1] - prefix[l]`.
Setting this equal to K: `prefix[r+1] - prefix[l] = K`, i.e.
`prefix[l] = prefix[r+1] - K`. So for each position r, you're asking:
**"has some earlier prefix value equaled `prefix[r+1] - K`?"** That's
the Hash Tables module's Seen/Index verb, applied to prefix sums instead
of raw array values — a hash map remembers every prefix sum encountered
so far, and each new position asks the map a single O(1) question
instead of re-scanning backward.

```diagram
{
  "id": "hash-patterns",
  "patterns": ["seen", "index"]
}
```


## The pattern

````tabs
```python
def subarray_count(nums: list[int], k: int) -> int:
    seen: dict[int, int] = {0: 1}      # prefix sum 0 occurs once (before anything)
    running = 0
    count = 0
    for x in nums:
        running += x
        count += seen.get(running - k, 0)   # how many earlier prefixes give sum k?
        seen[running] = seen.get(running, 0) + 1
    return count
```

```typescript
function subarrayCount(nums: number[], k: number): number {
  const seen = new Map<number, number>([[0, 1]]); // prefix sum 0 occurs once
  let running = 0;
  let count = 0;
  for (const x of nums) {
    running += x;
    count += seen.get(running - k) ?? 0; // earlier prefixes giving sum k?
    seen.set(running, (seen.get(running) ?? 0) + 1);
  }
  return count;
}
```
````

Two design choices, both load-bearing:

- **`seen` starts with `{0: 1}`.** This represents the empty prefix
  (before index 0) — without it, a subarray that starts at index 0 and
  happens to sum to exactly K would never be counted, because there'd
  be no earlier prefix sum of 0 to match against. This is the identical
  role Module 6's Two Sum played with "check before insert": the
  running sum is checked against the map *before* the current position
  is added to it, and seeding the map with the identity value covers
  the boundary case.
- **Check before insert, same as Two Sum.** Querying `running - k` and
  THEN recording `running` (not the other way around) prevents a
  subarray of length 0 from matching against itself.

## Why this beats the O(n²) alternative

Without the map: for every pair (l, r), check if `prefix[r+1] -
prefix[l] == k` — O(n²) pairs, or O(n) per r if you don't precompute
prefix sums at all and just re-sum each subarray, which is even worse.
The map converts "search all earlier prefixes for a match" from an O(n)
scan into an O(1) average lookup, collapsing the whole thing to O(n) —
Two Sum's exact reduction, riding on a different underlying quantity.

```complexity
{
  "time": "O(n) average",
  "space": "O(n)",
  "why": "One pass; each step does O(1)-average map operations. The map can grow to hold up to n distinct prefix sums."
}
```

## When to reach for this vs. two pointers

A tempting shortcut: "can't I just slide a window like Module 11?" Only
if the array has a monotonicity guarantee (all non-negative, typically) —
sliding window's shrink logic depended on that explicitly. **This
technique has no such requirement**: it works with negative numbers,
because it never "shrinks" anything — it just asks a hash map a
question at every position. That's the trade-off to internalize: prefix
sum + hash map generalizes past sliding window's non-negativity
constraint, at the cost of O(n) space instead of O(1).

```quiz
{
  "questions": [
    {
      "question": "Why does the algorithm seed the map with {0: 1} before processing any elements?",
      "options": [
        "It represents the empty prefix sum (before index 0) — without it, a subarray starting at index 0 that sums to exactly k would have no earlier prefix sum of 0 to match against, so it would be silently undercounted",
        "To avoid a division-by-zero error — since the lookup at running - k could otherwise divide by a zero-valued prefix sum under certain inputs, seeding the map with a nonzero entry sidesteps that arithmetic failure",
        "It's a performance optimization — pre-populating the map with one entry warms up its internal hash table structure, shaving a small constant amount of time off the very first lookup"
      ],
      "answer": 0,
      "explanation": "This is the boundary case every prefix-sum-plus-map solution must handle: the subarray touching the very start of the array. Seeding the identity value is the standard fix, directly analogous to how Two Sum's map starts empty but is checked before insertion each step."
    },
    {
      "question": "This technique works with negative numbers, but Minimum Size Subarray Sum's sliding window required all-positive values. Why the difference?",
      "options": [
        "The hash-map version doesn't actually work with negatives either — both techniques quietly assume non-negative inputs, and the hash-map approach simply happens to fail more subtly, returning a plausible-looking but wrong count",
        "Sliding window's shrink logic relies on validity being monotonic in window size — a property negatives break. This technique never shrinks a window at all; it asks a hash map a direct O(1) question at each position, so it has no monotonicity requirement to violate",
        "Hash maps are inherently better with negative numbers — the underlying hashing scheme for negative integers distributes more evenly across buckets than for positive ones, giving this technique a structural advantage on such inputs"
      ],
      "answer": 1,
      "explanation": "The two techniques solve overlapping-looking problems through fundamentally different mechanisms — one leans on a structural guarantee about the window, the other leans on exact lookup. Recognizing which mechanism a problem's constraints permit is the actual skill."
    }
  ]
}
```
