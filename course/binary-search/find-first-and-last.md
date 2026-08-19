---
title: Find First and Last Position
type: problem
---

## Problem

Given a sorted array (**duplicates allowed**) and a target, return
`[first index, last index]` of target's occurrences, or `[-1, -1]` if
absent — in **O(log n)**.

**Examples**

```examples
nums = [5,7,7,8,8,10], target = 8  →  [3, 4]
nums = [5,7,7,8,8,10], target = 6  →  [-1, -1]
nums = [], target = 0              →  [-1, -1]
```

```constraint
0 ≤ n ≤ 10⁵.
```

## Attempt it first

The two-sided version of the boundary-search lesson: find where target
STARTS and where it ENDS, each its own binary search. The tempting
shortcut — find target once, then scan outward — breaks the O(log n)
requirement (a run of equal values can be O(n) long). Two independent
boundary searches are the only way to keep the guarantee.


```sandbox
{
  "id": "find-first-and-last",
  "fn": { "python": "search_range", "javascript": "searchRange" },
  "check": "return",
  "starter": {
    "python": "def search_range(nums, target):\n    # Return [first, last], or [-1, -1].\n    pass\n",
    "javascript": "function searchRange(nums, target) {\n  // Return [first, last], or [-1, -1].\n}\n"
  },
  "cases": [
    { "args": [[5,7,7,8,8,10],8], "expect": [3,4] },
    { "args": [[5,7,7,8,8,10],6], "expect": [-1,-1] },
    { "args": [[],0], "expect": [-1,-1] },
    { "args": [[1],1], "expect": [0,0] },
    { "args": [[2,2],2], "expect": [0,1] }
  ]
}
```
````reveal Hint 1 — the first index, directly
lower_bound(target): first index where arr[i] >= target. If that index
is out of bounds OR arr[that index] != target, target isn't present —
return [-1,-1] immediately.
````

````reveal Hint 2 — the last index, via a second boundary
The last occurrence of target is one less than the first occurrence of
anything STRICTLY GREATER than target — i.e., lower_bound(target + 1)
- 1. Same function, different argument; no new logic needed.
````

## Brute force, for contrast

Linear scan for the first and last match: O(n). Correct, but the
problem explicitly demands O(log n) — the run of duplicates could be
the entire array, making a scan-outward approach degrade to O(n) in the
worst case even if you find ONE occurrence in O(log n) first.

## The insight

> Both boundaries reduce to the SAME lower_bound function, called
> twice with different targets: `lower_bound(target)` gives the start;
> `lower_bound(target + 1) - 1` gives the end. No new search logic —
> just recognizing that "last occurrence of X" is "one before the first
> occurrence of anything bigger than X," a reframing that turns a
> two-sided problem into two calls of a one-sided tool.

## Solution

`````reveal Solution — lower_bound, called twice
````tabs
```python
def search_range(nums: list[int], target: int) -> list[int]:
    def lower_bound(t: int) -> int:
        lo, hi = 0, len(nums)
        while lo < hi:
            mid = lo + (hi - lo) // 2
            if nums[mid] >= t:
                hi = mid
            else:
                lo = mid + 1
        return lo

    start = lower_bound(target)
    if start == len(nums) or nums[start] != target:
        return [-1, -1]                      # target not present
    end = lower_bound(target + 1) - 1         # one before the NEXT value's start
    return [start, end]
```

```typescript
function searchRange(nums: number[], target: number): [number, number] {
  function lowerBound(t: number): number {
    let lo = 0;
    let hi = nums.length;
    while (lo < hi) {
      const mid = lo + Math.floor((hi - lo) / 2);
      if (nums[mid] >= t) {
        hi = mid;
      } else {
        lo = mid + 1;
      }
    }
    return lo;
  }

  const start = lowerBound(target);
  if (start === nums.length || nums[start] !== target) {
    return [-1, -1]; // target not present
  }
  const end = lowerBound(target + 1) - 1; // one before the NEXT value's start
  return [start, end];
}
```
````

Verify on `[5,7,7,8,8,10], target=8`: `lower_bound(8)` finds index 3
(first `>= 8`) — `nums[3] == 8`, present. `lower_bound(9)` finds index
5 (first `>= 9`, which is `10`) — end = 5 − 1 = 4. Result `[3, 4]` ✓.

The existence check (`start == len(nums) or nums[start] != target`)
matters: `lower_bound` ALWAYS returns a valid index in `[0, n]` — it
never signals "not found" on its own, since its contract is "first
position satisfying the predicate," which is well-defined even when
target itself is absent (it returns where target *would* insert). The
caller must separately verify the value actually present there matches.

```complexity
{
  "time": "O(log n)",
  "space": "O(1)",
  "why": "Two independent binary searches, each O(log n); sequence adds, so total is still O(log n). No scanning, regardless of how many duplicates exist."
}
```
`````

## Variants

- **Search Insert Position** (previous problem): exactly `lower_bound`
  alone, without the existence check or the second call — this problem
  extends it in both the ways that matter.
- **Count occurrences of target in a sorted array:** `end - start + 1`
  once you have both boundaries — O(log n), not O(n), for something
  that looks like it needs counting.

```quiz
{
  "question": "Why can't a single lower_bound call, followed by scanning left and right to find the boundaries, satisfy the O(log n) requirement?",
  "options": [
    "If target occurs many times (up to the whole array), scanning outward from one found occurrence to find both ends costs O(count of duplicates) in the worst case — which can be O(n), violating the guarantee. Two independent binary searches avoid ever touching the duplicate run itself",
    "lower_bound doesn't reliably find target at all — its guarantee only holds for arrays without duplicate values, so relying on it as a starting point for a scan-outward approach is unsound from the very first step",
    "Scanning is always O(n) regardless of what's being scanned — any linear walk through an array, no matter how short the actual distance covered turns out to be, is charged the full O(n) cost by definition"
  ],
  "answer": 0,
  "explanation": "The failure mode is specifically adversarial duplicate-heavy input: an array of a single repeated value, searched for that value, would make scan-outward degrade to a full linear pass. The two-lower_bound-calls approach never depends on how many duplicates exist — it stays O(log n) unconditionally."
}
```
