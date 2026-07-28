---
title: Number of Recent Calls
type: problem
---

## Problem

Implement `RecentCounter.ping(t)`: each call records a request at time
`t` (milliseconds) and returns how many requests occurred in the window
`[t − 3000, t]`. Successive calls use strictly increasing `t`.

**Example**

```text
ping(1)     → 1     window [-2999, 1],    requests {1}
ping(100)   → 2     window [-2900, 100],  requests {1, 100}
ping(3001)  → 3     window [1, 3001],     requests {1, 100, 3001}
ping(3002)  → 3     window [2, 3002],     requests {100, 3001, 3002} — 1 expired
```

**Constraints:** ≤ 10⁴ calls · t strictly increasing.

## Attempt it first

The module's warm-up: a real rate-limiter's counting half. The
strictly-increasing guarantee is doing quiet, heavy work — identify
what it buys before opening the hint.

```sandbox
{
  "id": "recent-calls",
  "fn": { "python": "RecentCounter", "javascript": "RecentCounter" },
  "class": { "python": "RecentCounter", "javascript": "RecentCounter" },
  "check": "sequence",
  "starter": {
    "python": "class RecentCounter:\n    def __init__(self):\n        # Keep the pings that are still inside the window.\n        pass\n\n    def ping(self, t):\n        # Record a request at time t, return how many fall in [t - 3000, t].\n        pass\n",
    "javascript": "class RecentCounter {\n  constructor() {\n    // Keep the pings that are still inside the window.\n  }\n\n  ping(t) {\n    // Record a request at time t, return how many fall in [t - 3000, t].\n  }\n}\n"
  },
  "cases": [
    {
      "construct": [],
      "ops": [
        ["ping", [1], 1],
        ["ping", [100], 2],
        ["ping", [3001], 3],
        ["ping", [3002], 3]
      ]
    },
    { "construct": [], "ops": [["ping", [1], 1]] },
    {
      "construct": [],
      "ops": [
        ["ping", [1], 1],
        ["ping", [3001], 2],
        ["ping", [3002], 2],
        ["ping", [6002], 2]
      ]
    },
    {
      "construct": [],
      "ops": [
        ["ping", [1], 1],
        ["ping", [2], 2],
        ["ping", [3], 3],
        ["ping", [4], 4],
        ["ping", [5], 5]
      ]
    },
    {
      "construct": [],
      "ops": [
        ["ping", [10000], 1],
        ["ping", [20000], 1]
      ]
    }
  ]
}
```

````reveal Hint — expiry happens at the front
Requests arrive in time order, so they EXPIRE in the same order — the
oldest first. Keep them in a queue: on ping(t), enqueue t, then dequeue
from the front while front < t − 3000. The answer is the queue's size.
````

## Brute force, for contrast

Append every t to a list; on each ping, count entries ≥ t − 3000 (or
binary-search the boundary). The list grows without bound — O(total
calls) memory forever, and linear scans per ping. The queue's insight
is that expired entries are *permanently* irrelevant (t only
increases), so they can be discarded, keeping memory at O(window), not
O(history).

## The insight

> Monotonic time ⇒ arrival order = expiry order ⇒ the alive set is a
> contiguous RANGE of the arrival sequence, shrinking only at the front
> and growing only at the back. That shape IS a queue, and "count
> alive" becomes "queue size."

## Solution

`````reveal Solution — expiring queue
````tabs
```python
from collections import deque

class RecentCounter:
    def __init__(self) -> None:
        self._q: deque[int] = deque()

    def ping(self, t: int) -> int:
        self._q.append(t)                     # arrive at the back
        while self._q[0] < t - 3000:          # expire at the front
            self._q.popleft()
        return len(self._q)
```

```typescript
class RecentCounter {
  private q: number[] = [];
  private head = 0; // lesson 1's moving-front trick

  ping(t: number): number {
    this.q.push(t); // arrive at the back
    while (this.q[this.head] < t - 3000) {
      this.head++; // expire at the front (no shift)
    }
    return this.q.length - this.head;
  }
}
```
````

The while loop never underflows: the just-pushed t satisfies
t ≥ t − 3000, so the queue always retains at least one element — the
guard can stay lean because the invariant covers it.

```complexity
{
  "time": "O(1) amortized per ping",
  "space": "O(window size)",
  "why": "Each timestamp is enqueued once and expired at most once — the push-once/pop-once budget yet again. Any single ping may expire many entries, but n pings expire ≤ n total."
}
```
`````

## Variants

- **Moving Average from Data Stream:** same expiring queue, maintain a
  running sum alongside (subtract on expiry) — aggregate + queue.
- **Hit Counter / rate limiter:** this exact structure is the sliding
  log algorithm; production systems compress it into buckets when
  windows are large (trading exactness for memory).
- **Sliding Window Maximum** (capstone): same expiry mechanic, but the
  aggregate is max — which needs the monotonic deque, not just a size.

```quiz
{
  "question": "The strictly-increasing t guarantee is load-bearing. What breaks without it?",
  "options": [
    "Nothing — the queue still works; since every ping still gets enqueued and the expiry condition is checked independently on each call, out-of-order timestamps don't actually change which entries end up counted",
    "The queue overflows — without the strictly-increasing guarantee, expired entries would never get dequeued fast enough, and the backlog of un-expired timestamps would grow without bound",
    "Arrival order ≠ time order: a late-arriving old timestamp lands at the BACK while belonging near the front, so front-only expiry misses it (or expires fresh entries) — the alive set is no longer a contiguous range of arrivals"
  ],
  "answer": 2,
  "explanation": "The queue models 'alive = suffix of arrival order' — true only when arrivals are time-sorted. Unsorted timestamps would need an ordered structure (Module 18) or buckets. Spotting WHICH constraint licenses your structure is the recognition skill; lose the constraint, lose the structure."
}
```
