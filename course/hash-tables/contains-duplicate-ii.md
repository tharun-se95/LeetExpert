---
title: Contains Duplicate II
type: problem
---

## Problem

Given `nums` and an integer `k`, return whether there exist two **equal**
elements whose indices differ by **at most k**.

**Examples**

```text
nums = [1,2,3,1], k = 3  →  true   (indices 0 and 3, distance 3)
nums = [1,0,1,1], k = 1  →  true   (indices 2 and 3)
nums = [1,2,3,1,2,3], k = 2  →  false  (equal values are 3 apart)
```

**Constraints:** 1 ≤ n ≤ 10⁵ · 0 ≤ k ≤ 10⁵.

## Attempt it first

Plain Contains Duplicate is the Seen verb from the patterns lesson. The
distance condition is the new ingredient — there are two clean ways to
absorb it, one per hint. Find at least one.


```sandbox
{
  "id": "contains-duplicate-ii",
  "fn": { "python": "contains_nearby_duplicate", "javascript": "containsNearbyDuplicate" },
  "check": "return",
  "starter": {
    "python": "def contains_nearby_duplicate(nums, k):\n    # Return True or False.\n    pass\n",
    "javascript": "function containsNearbyDuplicate(nums, k) {\n  // Return true or false.\n}\n"
  },
  "cases": [
    { "args": [[1,2,3,1],3], "expect": true },
    { "args": [[1,0,1,1],1], "expect": true },
    { "args": [[1,2,3,1,2,3],2], "expect": false },
    { "args": [[99,99],0], "expect": false }
  ]
}
```
````reveal Hint 1 — remember more: value → last index
Upgrade Seen to Index: map each value to its MOST RECENT index. On
seeing x at i, if the map has x at j and i − j ≤ k → true; either way
store i (why is keeping only the latest index safe?).
````

````reveal Hint 2 — remember less: a sliding set
Alternatively, maintain a set holding only the last k elements — the
window nums[i−k .. i−1]. Then ANY hit in the set is automatically within
distance. One add, and (once the window is full) one remove per step.
````

## Brute force, for contrast

For each i, compare against the previous k elements: O(n·k) — with both
at 10⁵, that's 10¹⁰. The constraints kill it; the hash structures absorb
either the *distance check* (Hint 1) or the *window membership* (Hint 2)
into O(1) work.

## The insight

> For a fixed value, only its LATEST previous occurrence matters — any
> older one is farther away. So value → last index is a complete summary
> of the past (Hint 1). Dually, membership-in-the-last-k is a set whose
> contents shift by one element per step (Hint 2) — your first sliding
> window, one module early.

## Solution

`````reveal Solution — value → last index
````tabs
```python
def contains_nearby_duplicate(nums: list[int], k: int) -> bool:
    last: dict[int, int] = {}              # value -> most recent index
    for i, x in enumerate(nums):
        if x in last and i - last[x] <= k:
            return True
        last[x] = i                        # newer index strictly better
    return False
```

```typescript
function containsNearbyDuplicate(nums: number[], k: number): boolean {
  const last = new Map<number, number>(); // value -> most recent index
  for (let i = 0; i < nums.length; i++) {
    const j = last.get(nums[i]);
    if (j !== undefined && i - j <= k) return true;
    last.set(nums[i], i); // newer index strictly better
  }
  return false;
}
```
````

Why keeping only the latest index loses nothing: if the pair (j_old, i)
satisfied i − j_old ≤ k, then the later occurrence j_new (j_old < j_new
< i) satisfies i − j_new < i − j_old ≤ k too — the newer index can only
make the distance smaller. Overwriting is not an approximation; it's a
proof-backed compression of the past.

```complexity
{
  "time": "O(n) average",
  "space": "O(min(n, distinct values))",
  "why": "One pass, O(1)-average map operations. The map holds at most one entry per distinct value."
}
```
`````

`````reveal Alternative — sliding window set
````tabs
```python
def contains_nearby_duplicate_window(nums: list[int], k: int) -> bool:
    window: set[int] = set()               # exactly the last k elements
    for i, x in enumerate(nums):
        if x in window:
            return True
        window.add(x)
        if len(window) > k:                # evict the element leaving range
            window.remove(nums[i - k])
    return False
```

```typescript
function containsNearbyDuplicateWindow(nums: number[], k: number): boolean {
  const window = new Set<number>(); // exactly the last k elements
  for (let i = 0; i < nums.length; i++) {
    if (window.has(nums[i])) return true;
    window.add(nums[i]);
    if (window.size > k) window.delete(nums[i - k]); // evict
  }
  return false;
}
```
````

Invariant: entering step i, `window` holds exactly the values of
nums[max(0, i−k) .. i−1] — so a membership hit IS a within-k duplicate,
no arithmetic needed. Space improves to O(min(k, n)); the eviction line
is the sliding-window discipline Module 11 builds a whole toolkit around.
`````

## Variants

- **Contains Duplicate III** (values within range too, not just indices):
  needs ordered structure per window — buckets or a tree; far harder.
- **Longest substring without repeating characters:** the window-set
  idea with a variable-size window — Module 11's flagship.

```quiz
{
  "question": "The map version stores only each value's LATEST index. Why is discarding older indices provably safe?",
  "options": [
    "For any future position i, distance to the newest occurrence is strictly smaller than to older ones — so if ANY previous occurrence is within k of i, the newest is too",
    "Older duplicates were already checked against everything — once an earlier occurrence has been compared once, revisiting it again later would only ever re-confirm a result already recorded",
    "It isn't fully safe, but the constraints forbid the failing case — there could exist an input where an older occurrence is the one within distance k, but the given bounds on n and k happen to rule it out"
  ],
  "answer": 0,
  "explanation": "The check i − last[x] ≤ k is monotone in the stored index: bigger j, smaller distance. Keeping the max j preserves every future YES. Arguing 'what does the future need from the past?' is how you justify any state compression."
}
```
