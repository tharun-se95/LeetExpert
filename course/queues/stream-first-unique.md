---
title: First Unique in a Stream
type: problem
---

## Problem

Characters arrive one at a time from a stream. After **each** arrival,
report the first character (in arrival order) that has appeared exactly
once so far — or `#` if none exists.

**Example**

```text
stream:  a    b    a    b    c    b
report:  a    a    b    #    c    c
```

(After `a b a`: `a` has count 2, so the first unique is `b`. After
`a b a b`: nothing is unique. After `…c`: `c`.)

**Constraints:** ≤ 10⁵ arrivals · lowercase letters.

## Attempt it first

Module 6's First Unique Character ended with this exact variant as
"Module 9 material" — the promised follow-up. There, you could re-scan
the string per query: O(n) per report, O(n²) for the stream. The
challenge: **amortized O(1) per arrival**. The Count verb still
provides half the answer; the new half is what this module adds.

````reveal Hint 1 — what breaks, what survives
Counts update in O(1) per arrival — that half survives. What broke is
the RE-SCAN for "first with count 1": the scan's answer only ever moves
FORWARD through arrival order (a unique character can become
non-unique, never the reverse). Forward-only consumption of
arrival-ordered items is a…
````

````reveal Hint 2 — lazy deletion
Queue of candidate characters in arrival order + count map. On each
arrival: bump the count, enqueue the character. To report: pop the
front WHILE its count > 1 — those are dead candidates. The front that
survives is the answer. Dead entries left mid-queue don't matter;
they'll be discarded whenever they reach the front. (Deferred cleanup =
the tombstone idea from Module 6's open addressing.)
````

## Brute force, for contrast

Counts + full re-scan per arrival: O(alphabet) per report with the
26-array (fine here — constraints again!), but O(distinct) in general
and O(n) for arbitrary streams. The queue version's cost is
independent of alphabet size, which is what "stream-grade" means.

## The insight

> The candidate for "first unique" only moves forward: once a character
> is disqualified (count ≥ 2), it is disqualified forever. So keep
> candidates in a queue and DISCARD LAZILY from the front — each
> arrival enqueues once, each queue entry is dequeued at most once, and
> the front-surviving candidate is always correct. The re-scan hasn't
> been eliminated; it's been AMORTIZED across the stream.

## Solution

`````reveal Solution — count map + lazy candidate queue
````tabs
```python
from collections import deque

class FirstUnique:
    def __init__(self) -> None:
        self._counts: dict[str, int] = {}
        self._candidates: deque[str] = deque()   # arrival order

    def add(self, ch: str) -> str:
        self._counts[ch] = self._counts.get(ch, 0) + 1
        self._candidates.append(ch)
        while self._candidates and self._counts[self._candidates[0]] > 1:
            self._candidates.popleft()           # lazy discard of the dead
        return self._candidates[0] if self._candidates else "#"
```

```typescript
class FirstUnique {
  private counts = new Map<string, number>();
  private candidates: string[] = []; // arrival order
  private head = 0; // moving-front trick again

  add(ch: string): string {
    this.counts.set(ch, (this.counts.get(ch) ?? 0) + 1);
    this.candidates.push(ch);
    while (
      this.head < this.candidates.length &&
      (this.counts.get(this.candidates[this.head]) ?? 0) > 1
    ) {
      this.head++; // lazy discard of the dead
    }
    return this.head < this.candidates.length
      ? this.candidates[this.head]
      : "#";
  }
}
```
````

Note what the queue holds: **every arrival**, including duplicates —
`a b a` puts two `a` entries in. That's fine: both die at the front
check (`count > 1`). Trying to keep the queue "clean" (removing the
mid-queue `a` when its count hits 2) would require O(n) mid-queue
deletion — the exact operation queues are bad at. Lazy deletion works
WITH the structure's grain instead of against it.

```complexity
{
  "time": "O(1) amortized per arrival",
  "space": "O(n)",
  "why": "Each arrival: one count update, one enqueue, and front-discards paid from the enqueue-once/dequeue-once budget. Queue may hold dead entries — the price of laziness is space, bounded by stream length."
}
```
`````

## Variants

- **First Unique Number (design)**: same structure, numeric keys.
- **LRU cache** (a later composition): also "order + hash map," but
  needs mid-sequence deletion to be O(1) — which forces the doubly
  linked list instead of a queue. Comparing that design to this one is
  the best possible lesson in *why* each structure exists.

```quiz
{
  "question": "Why is leaving dead (count ≥ 2) entries in the middle of the queue acceptable?",
  "options": [
    "The count map removes them automatically — updating a character's count to 2 or more triggers a cleanup pass that reaches back into the queue and deletes that character's earlier entries on the spot",
    "They're rare in practice — most streams don't repeat characters often enough for dead entries to accumulate meaningfully, so the queue's size stays close to the number of truly unique candidates",
    "Correctness only ever reads the FRONT, and the front check filters the dead on contact; mid-queue removal would cost O(n) against the queue's grain, while lazy discard rides the existing dequeue budget for free"
  ],
  "answer": 2,
  "explanation": "Lazy deletion is a recurring systems trick (hash-table tombstones, heap lazy-delete, log compaction): when a structure can't remove interior items cheaply, mark-and-skip at the access point — provided every read path performs the check. Here the single read path is the front, making it airtight."
}
```
