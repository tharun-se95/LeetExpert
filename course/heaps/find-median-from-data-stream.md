---
title: Find Median from Data Stream
type: problem
---

## Problem

Design a data structure that supports two operations on a stream of
integers arriving one at a time: `addNum(num)` — add a number to the
running data set — and `findMedian()` — return the median of all
numbers added so far. Both must run efficiently, called repeatedly as
the stream grows. (LeetCode 295.)

**Example**

```text
addNum(1); addNum(2)
findMedian()  → 1.5              (average of 1, 2)
addNum(3)
findMedian()  → 2                (the middle of 1, 2, 3)
```

**Constraints:** up to `5·10⁴` calls total to `addNum`/`findMedian`.

## Attempt it first

The naive approach — keep every number in a sorted structure and read
the middle — either re-sorts on every insert (expensive) or maintains a
sorted list with O(n) insertion (shifting elements). This module's whole
point is that a SINGLE heap only ever gives you fast access to one end
(the min or the max) of the data — but a median needs fast access to
the middle. Before opening anything, think about how you could use TWO
heaps together so that the median always sits at a boundary between
them, accessible in O(1) — this is the module's centerpiece technique,
worth genuinely struggling with before reading on.

```sandbox
{
  "id": "find-median-from-data-stream",
  "fn": {
    "python": "MedianFinder",
    "javascript": "MedianFinder"
  },
  "class": {
    "python": "MedianFinder",
    "javascript": "MedianFinder"
  },
  "check": "sequence",
  "methods": {
    "addNum": {
      "python": "add_num",
      "javascript": "addNum"
    },
    "findMedian": {
      "python": "find_median",
      "javascript": "findMedian"
    }
  },
  "starter": {
    "python": "class MedianFinder:\n    def __init__(self):\n        # Hold the stream so the middle stays cheap to reach.\n        pass\n\n    def add_num(self, num):\n        # Add num to the data set.\n        pass\n\n    def find_median(self):\n        # Return the median of everything added so far.\n        pass\n",
    "javascript": "class MedianFinder {\n  constructor() {\n    // Hold the stream so the middle stays cheap to reach.\n  }\n\n  addNum(num) {\n    // Add num to the data set.\n  }\n\n  findMedian() {\n    // Return the median of everything added so far.\n  }\n}\n"
  },
  "cases": [
    {
      "construct": [],
      "ops": [
        [
          "addNum",
          [
            1
          ]
        ],
        [
          "addNum",
          [
            2
          ]
        ],
        [
          "findMedian",
          [],
          1.5
        ],
        [
          "addNum",
          [
            3
          ]
        ],
        [
          "findMedian",
          [],
          2
        ]
      ]
    },
    {
      "construct": [],
      "ops": [
        [
          "addNum",
          [
            5
          ]
        ],
        [
          "findMedian",
          [],
          5
        ]
      ]
    },
    {
      "construct": [],
      "ops": [
        [
          "addNum",
          [
            -1
          ]
        ],
        [
          "addNum",
          [
            -2
          ]
        ],
        [
          "findMedian",
          [],
          -1.5
        ],
        [
          "addNum",
          [
            -3
          ]
        ],
        [
          "findMedian",
          [],
          -2
        ],
        [
          "addNum",
          [
            -4
          ]
        ],
        [
          "findMedian",
          [],
          -2.5
        ],
        [
          "addNum",
          [
            -5
          ]
        ],
        [
          "findMedian",
          [],
          -3
        ]
      ]
    },
    {
      "construct": [],
      "ops": [
        [
          "addNum",
          [
            2
          ]
        ],
        [
          "addNum",
          [
            2
          ]
        ],
        [
          "findMedian",
          [],
          2
        ],
        [
          "addNum",
          [
            2
          ]
        ],
        [
          "findMedian",
          [],
          2
        ]
      ]
    },
    {
      "construct": [],
      "ops": [
        [
          "addNum",
          [
            6
          ]
        ],
        [
          "addNum",
          [
            10
          ]
        ],
        [
          "addNum",
          [
            2
          ]
        ],
        [
          "addNum",
          [
            6
          ]
        ],
        [
          "addNum",
          [
            5
          ]
        ],
        [
          "findMedian",
          [],
          6
        ],
        [
          "addNum",
          [
            0
          ]
        ],
        [
          "findMedian",
          [],
          5.5
        ]
      ]
    }
  ]
}
```

````reveal Hint — split the data into a "lower half" and an "upper half"
Maintain two heaps: a MAX-heap holding the smaller half of the numbers
seen so far, and a MIN-heap holding the larger half. Keep them balanced
in size (equal, or the max-heap holding exactly one more element than
the min-heap). Under that invariant, the median is always readable from
the two heaps' ROOTS alone: if the sizes are equal, it's the average of
both roots; if the max-heap has one extra, it's the max-heap's root
alone. The hard part is maintaining the balance and the ordering
property (everything in the max-heap ≤ everything in the min-heap) as
numbers keep arriving — work out the insert-then-rebalance procedure
before opening the solution.
````

## Brute force, for contrast

Keep a single sorted list; on each `addNum`, insert the new value at its
correct sorted position (or `bisect.insort` in Python, which finds the
position in O(log n) but still SHIFTS elements to make room in O(n)),
and `findMedian` reads the middle index (or averages the two middle
indices) in O(1):

````tabs
```python
import bisect

class MedianFinderBruteforce:
    def __init__(self) -> None:
        self.sorted_nums: list[int] = []

    def add_num(self, num: int) -> None:
        bisect.insort(self.sorted_nums, num)   # O(log n) find, O(n) shift

    def find_median(self) -> float:
        n = len(self.sorted_nums)
        mid = n // 2
        if n % 2 == 1:
            return float(self.sorted_nums[mid])
        return (self.sorted_nums[mid - 1] + self.sorted_nums[mid]) / 2
```

```typescript
class MedianFinderBruteforce {
  private sortedNums: number[] = [];

  addNum(num: number): void {
    let lo = 0,
      hi = this.sortedNums.length;
    while (lo < hi) {
      // O(log n) binary search for position
      const mid = (lo + hi) >> 1;
      if (this.sortedNums[mid] < num) lo = mid + 1;
      else hi = mid;
    }
    this.sortedNums.splice(lo, 0, num); // O(n) shift to make room
  }

  findMedian(): number {
    const n = this.sortedNums.length;
    const mid = Math.floor(n / 2);
    if (n % 2 === 1) return this.sortedNums[mid];
    return (this.sortedNums[mid - 1] + this.sortedNums[mid]) / 2;
  }
}
```
````

`findMedian` is O(1), which looks great — but `addNum` is O(n) per call
because inserting into a sorted array requires shifting every element
after the insertion point. Over `n` calls to `addNum`, that's O(n²)
total, which is exactly the cost this problem's constraints (up to
5×10⁴ calls) are designed to make too slow.

## The insight: two heaps, kept balanced, roots give the median

Split the running data set into two halves at the median:

- **`lower` — a MAX-heap** holding the smaller (or equal) half of the
  numbers, so its root is the LARGEST of the small half — the number
  closest to the median from below.
- **`upper` — a MIN-heap** holding the larger half, so its root is the
  SMALLEST of the large half — the number closest to the median from
  above.

Maintained so `len(lower)` is either equal to `len(upper)` or exactly
one more, the median is always exactly at this boundary: if sizes are
equal, average the two roots; if `lower` has one extra, its root alone
is the median.

**Insertion, done carefully:** you can't just decide up front which
heap a new number belongs in — a naive "if smaller than current median,
push to lower, else upper" can leave `lower`'s root larger than `upper`'s
root if the new number lands awkwardly. The robust procedure: always
push the new number into `lower` first, then immediately move
`lower`'s new root over to `upper` (this guarantees `upper` only ever
receives a value that's ≥ everything in `lower`, preserving the
ordering invariant), then, if `upper` has grown to outnumber `lower`,
move `upper`'s root back to `lower` to restore the size balance. Three
heap operations, each O(log n), and the invariant holds after every
single insertion.

## Solution

`````reveal Solution — max-heap of the lower half, min-heap of the upper half
Python's `heapq` is min-only, so `lower` (needed as a max-heap) is
implemented with negated values — the trick from the Heapify concept
lesson.

````tabs
```python
import heapq

class MedianFinder:
    def __init__(self) -> None:
        self.lower: list[int] = []   # max-heap via negation: smaller half
        self.upper: list[int] = []   # min-heap: larger half

    def add_num(self, num: int) -> None:
        heapq.heappush(self.lower, -num)              # 1. always insert into lower first
        moved = -heapq.heappop(self.lower)             #    then promote its new max...
        heapq.heappush(self.upper, moved)              #    ...into upper (keeps ordering)
        if len(self.upper) > len(self.lower):          # 2. rebalance sizes if needed
            moved_back = heapq.heappop(self.upper)
            heapq.heappush(self.lower, -moved_back)

    def find_median(self) -> float:
        if len(self.lower) > len(self.upper):
            return float(-self.lower[0])                # lower has the extra element
        return (-self.lower[0] + self.upper[0]) / 2      # equal sizes — average both roots
```

```typescript
// Minimal binary heap, parameterized by a comparator — the same
// up/down sift logic as the Heapify concept lesson's MinHeap class.
class BinaryHeap {
  private data: number[] = [];
  constructor(private less: (a: number, b: number) => boolean) {}

  get size(): number {
    return this.data.length;
  }
  peek(): number {
    return this.data[0];
  }

  push(val: number): void {
    this.data.push(val);
    let i = this.data.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.less(this.data[i], this.data[p])) {
        [this.data[i], this.data[p]] = [this.data[p], this.data[i]];
        i = p;
      } else break;
    }
  }

  pop(): number {
    const top = this.data[0];
    const last = this.data.pop()!;
    if (this.data.length > 0) {
      this.data[0] = last;
      let i = 0;
      while (true) {
        let s = i;
        const l = 2 * i + 1,
          r = 2 * i + 2;
        if (l < this.data.length && this.less(this.data[l], this.data[s])) s = l;
        if (r < this.data.length && this.less(this.data[r], this.data[s])) s = r;
        if (s === i) break;
        [this.data[i], this.data[s]] = [this.data[s], this.data[i]];
        i = s;
      }
    }
    return top;
  }
}

class MedianFinder {
  private lower = new BinaryHeap((a, b) => a > b); // max-heap: smaller half
  private upper = new BinaryHeap((a, b) => a < b); // min-heap: larger half

  addNum(num: number): void {
    this.lower.push(num); // 1. always insert into lower first
    const moved = this.lower.pop(); //    then promote its new max...
    this.upper.push(moved); //    ...into upper (keeps ordering)
    if (this.upper.size > this.lower.size) {
      // 2. rebalance sizes if needed
      const movedBack = this.upper.pop();
      this.lower.push(movedBack);
    }
  }

  findMedian(): number {
    if (this.lower.size > this.upper.size) {
      return this.lower.peek(); // lower has the extra element
    }
    return (this.lower.peek() + this.upper.peek()) / 2; // equal sizes — average both roots
  }
}
```
````

The insert-then-immediately-rebalance sequence (push to `lower`, move
its root to `upper`, conditionally move `upper`'s root back) is what
keeps BOTH invariants — the size balance and the ordering (`max(lower)
<= min(upper)`) — true after every single call, not just eventually.
Skipping the "always route through lower first" step and instead trying
to guess which heap a new number belongs in is the common bug: it can
leave a number in the wrong heap relative to the other heap's root,
silently breaking `find_median`'s correctness without any error being
raised.

```complexity
{
  "time": "O(log n) per addNum, O(1) per findMedian",
  "space": "O(n)",
  "why": "addNum does exactly 2–3 heap push/pop operations, each O(log n) on a heap of size up to n/2. findMedian only reads root(s), no restructuring, O(1). Space is O(n) total across both heaps, holding every number ever added."
}
```
`````

## Variants

- **Sliding Window Median** (LeetCode 480): the same two-heap balance,
  but numbers must also be REMOVED as the window slides — requires
  "lazy deletion" (mark a value as stale, discard it only when it
  surfaces at a root) since heaps don't support efficient arbitrary
  removal.
- **Kth Largest Element in a Stream** (this module): a simpler single-
  heap streaming problem — comparing the two side by side shows why a
  MEDIAN specifically needs two heaps (fast access to a middle boundary)
  while a fixed-k threshold needs only one (fast access to one end).
- **IPO / Two Heaps for greedy selection** (not covered): another
  classic two-heap pattern, though for a different purpose (selecting
  the most profitable feasible project at each step) than balancing a
  median.

```quiz
{
  "question": "Why does the insertion procedure always push a new number into `lower` FIRST and then immediately move lower's new root to `upper`, rather than directly deciding upfront which of the two heaps the new number belongs in?",
  "options": [
    "It doesn't matter which heap gets it first — both orders produce a correct result; since the rebalancing step runs afterward regardless, any initial placement gets corrected into the same final state",
    "Deciding upfront requires knowing the current median to compare against, but computing that comparison correctly, then inserting into the 'right' heap directly, can still leave an ordering violation (the new value could be smaller than lower's current root, or larger than upper's) — routing through lower and then promoting its max to upper guarantees upper only ever receives a value that is provably ≥ everything already in lower",
    "Pushing into lower first is only necessary when the two heaps are already unequal in size — when the heaps are perfectly balanced, the new value can be pushed directly into either heap without needing the extra promotion step"
  ],
  "answer": 1,
  "explanation": "The invariant that must hold after every insertion is max(lower) ≤ min(upper). Blindly comparing the new number to 'the median so far' and routing it into whichever heap seems right doesn't automatically preserve that cross-heap ordering — the new number could still be smaller than something already sitting in upper, or larger than something in lower. Always inserting into lower first and then moving lower's own new maximum over to upper guarantees, by construction, that upper only ever gains a value that was just confirmed to be the largest of everything routed through lower so far — preserving the invariant unconditionally."
}
```
