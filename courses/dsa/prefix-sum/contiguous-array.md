---
title: Contiguous Array
type: problem
---

## Problem

Given a binary array `nums` (only 0s and 1s), return the length of the
**longest contiguous subarray** with an equal number of 0s and 1s.

**Examples**

```examples
nums = [0,1]      →  2   (the whole array)
nums = [0,1,0]    →  2   ([0,1] or [1,0])
nums = [0,0,1,0,1,1]  →  6   (the whole array: three 0s, three 1s)
```

```constraint
1 ≤ n ≤ 10⁵.
```

## Attempt it first

The reduction move: this doesn't look like a prefix-sum problem at
first glance ("equal 0s and 1s" isn't obviously a sum), but a one-line
transformation turns it into exactly Subarray Sum Equals K's shape.
Find the transformation before opening the hint.


```sandbox
{
  "id": "contiguous-array",
  "fn": { "python": "find_max_length", "javascript": "findMaxLength" },
  "check": "return",
  "starter": {
    "python": "def find_max_length(nums):\n    # Return the length of the longest subarray with equally many 0s and 1s.\n    pass\n",
    "javascript": "function findMaxLength(nums) {\n  // Return the length of the longest subarray with equally many 0s and 1s.\n}\n"
  },
  "cases": [
    { "args": [[0, 1]], "expect": 2 },
    { "args": [[0, 1, 0]], "expect": 2 },
    { "args": [[0, 0, 1, 0, 1, 1]], "expect": 6 },
    { "args": [[0]], "expect": 0 },
    { "args": [[1, 1, 1]], "expect": 0 },
    { "args": [[1, 0, 1, 0, 1]], "expect": 4 },
    { "args": [[0, 1, 1, 0, 1, 1, 1, 0]], "expect": 4 }
  ]
}
```

````reveal Hint 1 — turn counting into summing
Treat each 0 as -1 and each 1 as +1. A subarray has EQUAL 0s and 1s
exactly when its transformed values sum to 0 — count(1s) - count(0s) =
0 is the same statement as sum(+1s and -1s) = 0. Now it's Subarray Sum
Equals K with k = 0.
````

````reveal Hint 2 — but this asks for LONGEST, not count
Subarray Sum Equals K counted matches. Here you want the longest match.
Same prefix-sum reduction (prefix[l] = prefix[r+1] - 0 = prefix[r+1]),
but the map should remember the EARLIEST index where each prefix value
occurred — a longer gap between two equal prefix sums means a longer
zero-sum subarray between them.
````

## Brute force, for contrast

All O(n²) subarrays with a running 0/1 count: O(n²), 10¹⁰ at the
ceiling. The ±1 transformation plus prefix-sum-as-index-map collapses
this to O(n) — the same reduction as the previous problem, with a
different payload (earliest index, not a running count).

## The insight

> "Equal 0s and 1s" is a sum-to-zero condition in disguise, once 0 is
> relabeled -1. And "longest subarray with a given prefix-sum
> difference" is answered by tracking, for each distinct prefix sum,
> the FIRST index it occurred at — because the farther back that first
> occurrence, the longer the zero-sum stretch between it and now.

## Solution

`````reveal Solution — ±1 transform, first-occurrence map
````tabs
```python
def find_max_length(nums: list[int]) -> int:
    first_seen: dict[int, int] = {0: -1}   # prefix sum 0 first "occurs" before index 0
    running = 0
    best = 0
    for i, x in enumerate(nums):
        running += 1 if x == 1 else -1     # the ±1 transform
        if running in first_seen:
            best = max(best, i - first_seen[running])   # gap since first occurrence
        else:
            first_seen[running] = i         # record ONLY the first time
    return best
```

```typescript
function findMaxLength(nums: number[]): number {
  const firstSeen = new Map<number, number>([[0, -1]]); // sum 0 before index 0
  let running = 0;
  let best = 0;
  for (let i = 0; i < nums.length; i++) {
    running += nums[i] === 1 ? 1 : -1; // the ±1 transform
    if (firstSeen.has(running)) {
      best = Math.max(best, i - firstSeen.get(running)!); // gap since first
    } else {
      firstSeen.set(running, i); // record ONLY the first time
    }
  }
  return best;
}
```
````

The map's role has shifted from Subarray Sum Equals K: there it counted
occurrences (`{value: count}`); here it remembers the *earliest index*
(`{value: first index}`) and never overwrites once set — a later,
closer occurrence of the same prefix sum would only produce a SHORTER
gap, so overwriting would actively lose the best answer. This is the
same "keep only what the future needs" discipline as Module 6's
Contains Duplicate II compressing to "most recent index" — except here
the direction is reversed: keep the FIRST, not the latest, because
"longest" wants the widest possible gap.

Trace on `[0,0,1,0,1,1]`: transformed = [-1,-1,1,-1,1,1]. running:
-1,-2,-1,-2,-1,0. first_seen starts {0:-1}. i=0: running=-1, new →
record {-1:0}. i=1: running=-2, new → record {-2:1}. i=2: running=-1,
seen at 0 → best=max(0,2-0)=2. i=3: running=-2, seen at 1 →
best=max(2,3-1)=2. i=4: running=-1, seen at 0 → best=max(2,4-0)=4.
i=5: running=0, seen at -1 → best=max(4,5-(-1))=6. Final: 6, matching
the expected whole-array answer.

```complexity
{
  "time": "O(n) average",
  "space": "O(n)",
  "why": "One pass; O(1)-average map lookups. The map holds at most n+1 distinct running-sum values, each recorded once."
}
```
`````

## Variants

- **Subarray Sum Equals K:** the counting sibling of this problem —
  same transform-then-map idea, different payload in the map.
- **Maximum Size Subarray Sum Equals K:** the general (non-binary)
  version of this exact problem — literally identical code with
  `running += x` instead of the ±1 transform.

```quiz
{
  "question": "Why does the map here store the FIRST index of each prefix sum, while Subarray Sum Equals K's map stores a running COUNT?",
  "options": [
    "They're solving the same problem, so this is an arbitrary implementation choice — swapping which piece of information the map stores would produce an equally valid solution to either problem, since both are fundamentally the same underlying computation",
    "The two problems ask different questions: 'how many pairs share this prefix value' (Subarray Sum Equals K) needs a count; 'what's the WIDEST gap between two equal prefix values' (this problem) needs the earliest occurrence, since pairing with the earliest possible match always maximizes the gap",
    "Because this problem's values are restricted to 0 and 1 — the binary nature of the input caps how many distinct prefix sums can occur, which is what makes tracking the first index (rather than a count) sufficient here"
  ],
  "answer": 1,
  "explanation": "The map's payload should always be exactly what the specific question needs to extract at query time. 'Count matches' and 'find the longest gap' are different aggregations over the same underlying prefix-sum-collision idea — recognizing which one a problem needs is the actual design step, not a fixed recipe."
}
```
