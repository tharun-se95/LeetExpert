---
title: "Rotate Array"
kicker: "Rotate Array · Arrays module · problem lesson"
headline: "Rotate right by k in place: how do you transpose two blocks without extra memory?"
lede: "A long freight train needs its rear cars moved to the front while preserving the internal order of both segments. Shifting cars one slot at a time takes quadratic time on long trains, and laying a parallel siding requires allocating a whole second set of tracks. How can two contiguous segments swap places entirely in place, in linear time and with zero auxiliary memory?"
chips:
  - "three reversals"
  - "time **O(n)**"
  - "space **O(1)**"
hero: |
  <div class="hero-stage"><div class="hero-art navy"><svg id="heroRotate" viewBox="0 0 560 220" role="img" aria-label="Animation: an array of seven elements [1, 2, 3, 4, 5, 6, 7] is rotated right by three steps to [5, 6, 7, 1, 2, 3, 4] using three in-place reversals."></svg>
  <div class="hero-read" id="heroRead"><div class="hero-num"><b id="heroNum">0</b> <span id="heroUnit">steps</span> taken</div><div id="heroCap">Initial array partitioned into prefix A and suffix B</div></div></div></div>
---

## Problem {#problem}

```vig "An array split into two blocks A and B, an arrow down, and the blocks swapped into B followed by A"
<rect class="fa" x="20" y="36" width="100" height="36" rx="6"/>
<rect class="fk" x="126" y="36" width="74" height="36" rx="6"/>
<path class="sc" d="M110 82L110 102"/>
<path class="sc" d="M105 96L110 102L115 96"/>
<rect class="fk" x="20" y="112" width="74" height="36" rx="6"/>
<rect class="fa" x="100" y="112" width="100" height="36" rx="6"/>
```

Given an integer array `nums`, rotate the array to the right by `k` steps ==in place==.

```examples
nums = [1, 2, 3, 4, 5, 6, 7], k = 3 → [5, 6, 7, 1, 2, 3, 4]
nums = [-1, -100, 3, 99], k = 2 → [3, 99, -1, -100]
nums = [1], k = 0 → [1]
nums = [1, 2], k = 3 → [2, 1]
```

```constraint
1 ≤ n ≤ 10⁵ · 0 ≤ k ≤ 10⁵ (k can exceed n!) · O(1) auxiliary space.
```

In-place rotation means rearranging the elements directly inside the caller's array without allocating a copy. Notice the constraint: `k` can be zero, and `k` can exceed `n`. Rotating an array of length 7 by 7 steps returns every element back to where it started. Therefore, rotating by any multiple of `n` is an identity transformation: only `k % n` steps change positions.

Try executing the three reversals by hand on `[1, 2, 3, 4, 5, 6, 7]` with `k = 3`.

```widget #byhand "By hand: execute the three reversals in order"
<div class="ra-stage">
  <div class="ra-lane" id="byhandLane"></div>
  <div class="ra-readout" id="byhandReadout"></div>
  <div class="ra-actions">
    <button type="button" class="ra-btn" data-step="0">1. Reverse whole array</button>
    <button type="button" class="ra-btn" data-step="1">2. Reverse [0..k−1]</button>
    <button type="button" class="ra-btn" data-step="2">3. Reverse [k..n−1]</button>
    <button type="button" class="ra-btn reset" data-step="reset">Start again</button>
  </div>
</div>
```

## Attempt it first {#attempt toc="Attempt"}

```caption
Rotation permutes two contiguous blocks: prefix A of size n − k and suffix B of size k.
```

```vig "Two blocks A and B with curved arcs indicating that block B leaps over block A to the front"
<rect class="fa" x="20" y="44" width="90" height="32" rx="5"/>
<rect class="fk" x="116" y="44" width="70" height="32" rx="5"/>
<path class="sc" d="M151 36C151 16 65 16 65 36"/>
<path class="sc" d="M60 30L65 37L70 30"/>
```

Think about where each individual element ends up. The element at index `i` moves right by `k` steps. When an index exceeds the right boundary `n − 1`, it wraps around to the front. Its final location is given by `(i + k) % n`.

Before revealing the implementation, predict what the array looks like after each step of the three reversals.

```widget "Predict the intermediate array states"
<div id="predict"></div>
```

````reveal #hint1 "Hint 1: normalize k before touching anything"
Because rotating by n is a no-op, start with `k = k % n`. If `k == 0`, every element is already at its destination, so return immediately. If k were not normalized, an input with k > n would attempt to index past the end of the array.
````

````reveal #hint2 "Hint 2: what reversal does to block order"
Dividing the array into prefix A (the first n − k items) and suffix B (the last k items) gives the initial layout `[A | B]`. Reversing the whole array reverses the order of the blocks, producing `[B_rev | A_rev]`. Notice that B is now at the front and A is at the back, but the elements inside each block are backward.
````

````reveal #hint3 "Hint 3: repairing the backward blocks"
Because `B_rev` occupies indices `0` through `k − 1`, reversing that range in place restores its original order: `reverse(B_rev) = B`. Similarly, `A_rev` occupies indices `k` through `n − 1`, and reversing that range gives `reverse(A_rev) = A`. The final state is `[B | A]`, exactly the desired rotated array.
````

## The three reversals insight {#insight toc="Reversal insight"}

```vig "Three sequential reversals: whole array inverted, then left block flipped, then right block flipped"
<rect class="st" x="16" y="24" width="180" height="24" rx="4"/>
<path class="sc" d="M26 36L186 36"/>
<rect class="st" x="16" y="56" width="70" height="24" rx="4"/>
<path class="sc" d="M24 68L78 68"/>
<rect class="st" x="92" y="56" width="104" height="24" rx="4"/>
<path class="sc" d="M100 68L186 68"/>
```

> Rotating by `k` is equivalent to transposing two blocks: `[A | B] → [B | A]`. Reversing the entire array swaps the blocks while flipping their contents: `[B_rev | A_rev]`. Reversing each sub-array restores their original orientations.

```key
Reversal flips block positions globally in one linear sweep. Two targeted local reversals then restore the internal direction of each block.
```

```rosetta "The three reversal steps, read as train rearrangement"
Operation | Effect on blocks | Index range
Reverse all | Brings suffix B to front and pushes prefix A to back | 0 to n − 1
Reverse left block | Flips suffix B back to its forward order | 0 to k − 1
Reverse right block | Flips prefix A back to its forward order | k to n − 1
```

Step through the three reversals on the lesson's sandbox test cases:

```widget #stepper "Step through three reversals on test cases"
<div class="extabs" role="group" aria-label="Choose an array"></div>
<div class="lvhost"></div>
```

## Solution {#solution}

```caption
Three in-place reversals with two pointers each, running in O(n) time and O(1) auxiliary space.
```

```vig "Two pointers left and right converging toward each other while swapping elements"
<rect class="st" x="20" y="38" width="40" height="36" rx="6"/>
<rect class="st" x="65" y="38" width="40" height="36" rx="6"/>
<rect class="st" x="110" y="38" width="40" height="36" rx="6"/>
<rect class="st" x="155" y="38" width="40" height="36" rx="6"/>
<polygon class="fc" points="40,22 45,32 35,32"/>
<polygon class="fk" points="175,22 180,32 170,32"/>
```

`````reveal #solbox "Show the solution"
```code solution "Three in-place reversals"
```

```notes
The helper function `reverse_range` uses two symmetric converging pointers, `left` and `right`. While `left < right`, it swaps `nums[left]` and `nums[right]`, then moves `left` inward and `right` inward.

The main function normalizes `k` with `k %= n`. If `k == 0`, it returns immediately. Otherwise, it executes the three reversals sequentially.
```

```derivation
**Time O(n).** Reversing the whole array swaps n / 2 pairs. Reversing the first block swaps k / 2 pairs. Reversing the second block swaps (n − k) / 2 pairs. The total number of swaps is n / 2 + k / 2 + (n − k) / 2 = n swaps at most, touching each element twice.

**Space O(1).** Only integer indices (`left`, `right`, `n`, `k`) are created on the call stack. No auxiliary arrays, slices, or heap objects are allocated.
```

````warn
Always compute `k %= n` before calling `reverse_range`. If `k > n` (such as `n = 2, k = 3`), passing unreduced `k - 1` causes an index out of bounds error.
````
`````

## Cycle chasing variant {#variants toc="Cycle chasing"}

```vig "A circular ring of nodes with directed arcs showing token movements"
<circle class="st" cx="100" cy="65" r="45"/>
<circle class="fa" cx="100" cy="20" r="7"/>
<circle class="fa" cx="145" cy="65" r="7"/>
<circle class="fa" cx="100" cy="110" r="7"/>
<circle class="fa" cx="55" cy="65" r="7"/>
<path class="sc" d="M106 22C130 30 142 45 145 57"/>
```

An alternative O(1)-space approach directly moves each value to its target slot `(i + k) % n`. Starting at index 0, place the element at its destination, pick up the displaced element, and follow the chain until it loops back to 0.

If `gcd(n, k) == 1`, a single continuous cycle visits every slot in the array. If `gcd(n, k) > 1`, the array decomposes into exactly `gcd(n, k)` independent cycles, each of length `n / gcd(n, k)`.

`````reveal #cyclebox "Show the cycle chasing implementation"
```code alt_cycles "Cycle chasing with gcd"
```

```notes
The outer loop runs `gcd(n, k)` times, once for each disjoint cycle. Inside each cycle, a `held` variable transports elements around the ring until returning to `start`.
```

```derivation
Cycle chasing executes exactly n moves, performing fewer memory writes than the three reversals approach. However, it requires computing the greatest common divisor and managing loop termination conditions, making three reversals more robust under interview conditions.
```
`````

## Common mistakes & traps {#trap toc="Traps"}

```widget #trapper "Contrast three reversals against common traps"
<div class="extabs" role="group" aria-label="Choose an implementation"></div>
<div class="lvhost"></div>
<p class="cost-note" id="trapNote"></p>
```

A common pitfall is the incremental rotation: shifting elements right by one step, repeated `k` times. Shifting `n` elements takes O(n) work; repeating it `k` times yields an O(n · k) runtime. With constraints `n = 10⁵` and `k = 10⁵`, that reaches 10¹⁰ operations, causing an immediate Time Limit Exceeded.

Another error is omitting `k %= n`. When `k > n`, `reverse_range(nums, 0, k - 1)` accesses indices beyond the array bounds, raising an `IndexError`.

```quiz
{
  "questions": [
    {
      "question": "Why must k be reduced modulo n before beginning the reversals?",
      "options": [
        "To ensure k stays positive — without modulo reduction, negative rotation counts passed from callers would invert pointer movement",
        "It is an optional performance optimization — skipping it still yields the right array state eventually but repeats redundant full loops",
        "Rotating by n restores the array to its start, so only k % n matters — and an unreduced k > n indexes past array bounds"
      ],
      "answer": 2,
      "explanation": "Because rotating by n brings every element back to its starting index, only the remainder k % n changes positions. Furthermore, the constraints explicitly allow k up to 100,000 even when n is small, so reverse_range(nums, 0, k - 1) would crash with an out-of-bounds index without reduction."
    },
    {
      "question": "In the three-reversal method for rotating right by k, which reversal order correctly achieves [B | A] from [A | B]?",
      "options": [
        "Reverse prefix [0..k-1], reverse suffix [k..n-1], and leave the full array untouched",
        "Reverse the whole array [0..n-1], reverse prefix [0..k-1], then reverse suffix [k..n-1]",
        "Reverse suffix [k..n-1], reverse prefix [0..k-1], and finally reverse remaining middle elements"
      ],
      "answer": 1,
      "explanation": "Reversing the entire array transforms [A | B] into [B_rev | A_rev]. Since the suffix B now occupies the first k positions (indices 0..k-1), reversing [0..k-1] restores B to normal order, and reversing [k..n-1] restores A to normal order."
    },
    {
      "question": "For an array of size n = 6 rotated right by k = 2, how many independent cycles exist in cycle chasing?",
      "options": [
        "2 independent cycles of length 3 each, starting at index 0 and index 1 respectively",
        "1 continuous cycle touching all 6 elements consecutively before returning home to index 0",
        "3 independent cycles of length 2 each, starting at index 0, index 1, and index 2 respectively"
      ],
      "answer": 0,
      "explanation": "The number of independent cycles in cyclic permutation is given by gcd(n, k). Here gcd(6, 2) = 2 cycles. Starting at index 0 visits indices 0 -> 2 -> 4 -> 0 (length 3). The second cycle starts at index 1 and visits 1 -> 3 -> 5 -> 1 (length 3)."
    }
  ]
}
```
