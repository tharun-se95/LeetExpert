---
title: Rotate Array
type: problem
---

## Problem

Given an integer array `nums`, rotate it **right** by `k` steps, in place.

**Examples**

```examples
nums = [1,2,3,4,5,6,7], k = 3  →  [5,6,7,1,2,3,4]
nums = [-1,-100,3,99],  k = 2  →  [3,99,-1,-100]
```

```constraint
1 ≤ n ≤ 10⁵ · 0 ≤ k ≤ 10⁵ (note: k can exceed n!) · follow-up: O(1) auxiliary space.
```

## Attempt it first

The O(n)-space version is warm-up; get it working mentally first. The real
problem is O(1) space — and the trick is *not* an incremental shuffle.

Note the constraint: ==k can exceed n==, so normalise it before you index
anything.

```sandbox
{
  "id": "rotate-array",
  "fn": { "python": "rotate", "javascript": "rotate" },
  "check": "mutate",
  "starter": {
    "python": "def rotate(nums, k):\n    # Rotate nums right by k, in place. Return nothing.\n    pass\n",
    "javascript": "function rotate(nums, k) {\n  // Rotate nums right by k, in place. Return nothing.\n}\n"
  },
  "cases": [
    { "args": [[1,2,3,4,5,6,7],3], "expect": [5,6,7,1,2,3,4] },
    { "args": [[-1,-100,3,99],2], "expect": [3,99,-1,-100] },
    { "args": [[1,2],3], "expect": [2,1] },
    { "args": [[1,2,3,4],6], "expect": [3,4,1,2] },
    { "args": [[1,2,3],0], "expect": [1,2,3] },
    { "args": [[1],0], "expect": [1] }
  ]
}
```

````reveal Hint 1 — normalize k, and find the destination map
Rotating by n changes nothing, so first take k = k mod n (the clock
arithmetic from the Math module). Then: where does the element at index i
end up? Write the formula before going further.

Answer: i → (i + k) mod n. The last k elements wrap to the front.
````

````reveal Hint 2 — the extra-array version
Allocate a result of size n and place each element directly:
result[(i + k) % n] = nums[i]. O(n) time, O(n) space. Now — the rotated
array is the original with its last k elements moved to the front, blocks
otherwise intact. What operation, applied to whole blocks, could rearrange
them without extra memory?
````

````reveal Hint 3 — reversal changes block ORDER
Reversing the whole array puts the last k elements first — but each block's
internal order is now backwards. You have reverse_range from the in-place
lesson. Can you repair the damage?
````

## Brute force, for contrast

Rotate by one, k times: each single rotation shifts the whole array —
O(n·k) total, up to 10¹⁰ operations here. The extra-array version (Hint 2)
is the *time*-optimal baseline; the challenge is matching it at O(1)
space.

## The insight

> Rotation permutes **blocks**: [A | B] → [B | A], where B is the last k
> elements. Reversing the whole array yields [B̄ | Ā] — right blocks,
> wrong internal order. Reversing each block in place fixes exactly that:
> reverse(B̄) = B, reverse(Ā) = A. Three reversals, all in place.

```text
[1,2,3,4,5 | 6,7]  k=2        A = first 5, B = last 2
reverse all   → [7,6,5,4,3,2,1]
reverse [0,k) → [6,7,5,4,3,2,1]
reverse [k,n) → [6,7,1,2,3,4,5]   ✓
```

Step it through. The state worth watching is the one after the first
reversal: the blocks are already in the right ==order==, and both are
merely backwards — which is exactly what the next two reversals undo.

```viz
{ "id": "block-reversal", "data": [1, 2, 3, 4, 5, 6, 7], "k": 3 }
```

## Solution

`````reveal Solution — three reversals
````tabs
```python
def reverse_range(nums: list[int], left: int, right: int) -> None:
    while left < right:
        nums[left], nums[right] = nums[right], nums[left]
        left, right = left + 1, right - 1

def rotate(nums: list[int], k: int) -> None:
    n = len(nums)
    k %= n                              # rotating by n is a no-op
    if k == 0:
        return
    reverse_range(nums, 0, n - 1)       # [B̄ | Ā]
    reverse_range(nums, 0, k - 1)       # [B | Ā]
    reverse_range(nums, k, n - 1)       # [B | A]
```

```typescript
function reverseRange(nums: number[], left: number, right: number): void {
  while (left < right) {
    [nums[left], nums[right]] = [nums[right], nums[left]];
    left++;
    right--;
  }
}

function rotate(nums: number[], k: number): void {
  const n = nums.length;
  k %= n; // rotating by n is a no-op
  if (k === 0) return;
  reverseRange(nums, 0, n - 1); // [B̄ | Ā]
  reverseRange(nums, 0, k - 1); // [B | Ā]
  reverseRange(nums, k, n - 1); // [B | A]
}
```
````

```complexity
{
  "time": "O(n)",
  "space": "O(1)",
  "why": "Three reversal passes touch each element at most twice in total swaps; only loop indexes are allocated. The k %= n normalization is what makes k > n inputs safe."
}
```
`````

`````reveal Expert variant — cycle chasing
The destination map i → (i + k) mod n decomposes the indices into
gcd(n, k) cycles (the Math module's gcd, appearing exactly where promised).
Follow each cycle: hold nums[start], repeatedly place the held value at
its destination and pick up what was there, until you return to start.
Every element moves exactly once — n moves total instead of ~n swaps.

````tabs
```python
from math import gcd

def rotate_cycles(nums: list[int], k: int) -> None:
    n = len(nums)
    k %= n
    if k == 0:
        return
    for start in range(gcd(n, k)):
        held = nums[start]
        i = start
        while True:
            j = (i + k) % n
            nums[j], held = held, nums[j]
            i = j
            if i == start:
                break
```

```typescript
function gcd(a: number, b: number): number {
  while (b !== 0) [a, b] = [b, a % b];
  return a;
}

function rotateCycles(nums: number[], k: number): void {
  const n = nums.length;
  k %= n;
  if (k === 0) return;
  for (let start = 0; start < gcd(n, k); start++) {
    let held = nums[start];
    let i = start;
    do {
      const j = (i + k) % n;
      [nums[j], held] = [held, nums[j]];
      i = j;
    } while (i !== start);
  }
}
```
````

Step through it — watch the token carry each displaced value around the
ring, and watch the first cycle close having placed only half the array:

```viz
{ "id": "cyclic-rotate", "data": [1, 2, 3, 4, 5, 6], "k": 2 }
```

That is the termination subtlety made concrete. With n = 6 and k = 2,
gcd(6, 2) = 2, so index 0 chases 0 → 2 → 4 → 0 and stops with 1, 3 and 5
still untouched. Chasing further from 0 would just retrace the same three
slots forever. The `for start in range(gcd(n, k))` header is what picks up
the second cycle at index 1.

Same O(n)/O(1), fewer element writes; the price is the cycle-termination
subtlety. Reversal is what you write under pressure; cycles are what you
discuss when asked "can you do fewer writes?"
`````

## Variants

- **Rotate left by k** = rotate right by n − k, or flip the reversal order.
- **Rotate a string / linked list:** same block insight; the list version
  (Linked Lists module) works by finding the split point and re-wiring —
  no per-element moves at all.

```quiz
{
  "question": "Why must k be reduced mod n before rotating?",
  "options": [
    "To keep k positive — without the mod reduction, a large k value passed in could otherwise be interpreted as a negative rotation amount by the reversal logic",
    "It's an optional micro-optimization — reducing k first just avoids a few redundant full-cycle rotations and makes the algorithm run slightly faster, but skipping it wouldn't change correctness",
    "Rotating by n returns the array to its start, so only k mod n matters — and unreduced k would break reverse_range's index bounds"
  ],
  "answer": 2,
  "explanation": "Rotation by n is the identity (every element returns home — the clock wraps). The constraints allow k up to 10⁵ with n as small as 1, so reduction is correctness, not style: reverse_range(nums, 0, k−1) with k > n would index out of range."
}
```
