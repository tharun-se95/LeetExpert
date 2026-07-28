---
title: Task Scheduler
type: problem
---

## Problem

Given an array `tasks` of uppercase letters (each letter is one unit-
time task) and a non-negative integer `n`, find the **minimum number of
time units** needed to complete all tasks, where the same task type must
be separated by **at least `n` units** of cooldown (during which you may
run a different task, or sit idle if none is available). (LeetCode 621.)

**Examples**

```text
tasks = ["A","A","A","B","B","B"], n = 2  →  8
one valid schedule: A B idle A B idle A B   (8 slots)

tasks = ["A","A","A","B","B","B"], n = 0  →  6   (no cooldown needed)
```

**Constraints:** `1 ≤ tasks.length ≤ 10⁴`, `0 ≤ n ≤ 100`, uppercase
letters only (at most 26 distinct task types).

## Attempt it first

This is the module's most involved problem because it combines a
heap-driven greedy simulation with a real correctness argument, not just
a mechanical heap-swap. Before opening anything, think through the
greedy instinct directly: at any moment when you must choose which task
to run next, which task SHOULD you run, to keep your options as open as
possible for the future? And separately: why might a most-frequent-task
strategy sometimes force idle slots that a less greedy strategy
wouldn't?

```sandbox
{
  "id": "task-scheduler",
  "fn": {
    "python": "least_interval",
    "javascript": "leastInterval"
  },
  "check": "return",
  "starter": {
    "python": "def least_interval(tasks, n):\n    # Return the fewest time units needed, cooldown included.\n    pass\n",
    "javascript": "function leastInterval(tasks, n) {\n  // Return the fewest time units needed, cooldown included.\n}\n"
  },
  "cases": [
    {
      "args": [
        [
          "A",
          "A",
          "A",
          "B",
          "B",
          "B"
        ],
        2
      ],
      "expect": 8
    },
    {
      "args": [
        [
          "A",
          "A",
          "A",
          "B",
          "B",
          "B"
        ],
        0
      ],
      "expect": 6
    },
    {
      "args": [
        [
          "A"
        ],
        5
      ],
      "expect": 1
    },
    {
      "args": [
        [
          "A",
          "B",
          "C",
          "D",
          "E",
          "A",
          "B",
          "C",
          "D",
          "E"
        ],
        4
      ],
      "expect": 10
    },
    {
      "args": [
        [
          "A",
          "A",
          "A",
          "A",
          "A",
          "A",
          "B",
          "C",
          "D",
          "E",
          "F",
          "G"
        ],
        2
      ],
      "expect": 16
    },
    {
      "args": [
        [
          "A",
          "B"
        ],
        2
      ],
      "expect": 2
    },
    {
      "args": [
        [
          "A",
          "A",
          "B",
          "B"
        ],
        1
      ],
      "expect": 4
    }
  ]
}
```

````reveal Hint — always run the most frequent remaining task that's off cooldown
Greedy idea: at each time step, among tasks that are currently allowed
to run (not on cooldown), run whichever one has the MOST remaining
occurrences. Intuition: a task with many remaining occurrences is the
one most likely to cause future idle slots if you let its count sit
unaddressed — chipping away at the largest remaining count keeps the
"most constrained" task moving instead of piling up. This is exactly
the fixed-size-frontier problem a max-heap solves: heap by remaining
count, pop the max, run it, decrement it, and (if it still has
occurrences left) it can't be pushed back until `n` units have passed —
which is what a **cooldown queue** tracks.
````

## Brute force, for contrast

A literal simulation could recompute, at every single time unit, a full
scan over all task types to find the max-count one that's off cooldown
— O(26) work per unit (fine, since 26 is a constant) but conceptually
this IS roughly the heap-based simulation with a linear scan standing in
for the heap's O(log 26) pop. It's worth naming as the "obviously
correct but less structured" version, since 26 is small enough that a
scan and a heap perform similarly here — the heap's asymptotic
advantage matters more when the alphabet is large; the real payoff for
using a heap here is conceptual clarity of the greedy rule, not a huge
constant-factor win.

## The insight: heap-driven simulation with an explicit cooldown queue

Maintain two structures as time advances one unit at a time:

- **A max-heap** of remaining counts for every task type that is
  currently allowed to run (off cooldown).
- **A cooldown queue** holding `(available_at_time, remaining_count)`
  pairs for tasks that were just run and are still serving their
  cooldown.

At each time unit: if the heap is non-empty, pop the max count, "run"
that task (decrement its count), and if it still has occurrences left,
enqueue it into the cooldown queue with `available_at_time = now + n +
1`. If the heap is empty, this unit is forced idle. Either way, check
the front of the cooldown queue: if its `available_at_time` has arrived,
move it back into the heap. Repeat until both structures are empty; the
final elapsed time is the answer.

## Solution

`````reveal Solution — max-heap simulation with a cooldown queue
````tabs
```python
import heapq
from collections import Counter, deque

def least_interval(tasks: list[str], n: int) -> int:
    counts = list(Counter(tasks).values())
    heap = [-c for c in counts]                # max-heap via negation
    heapq.heapify(heap)
    cooldown: deque[tuple[int, int]] = deque()  # (available_at_time, -remaining_count)

    time = 0
    while heap or cooldown:
        time += 1
        if heap:
            remaining = heapq.heappop(heap) + 1     # run it: count -= 1 (working in negatives)
            if remaining < 0:                       # still has occurrences left
                cooldown.append((time + n, remaining))
        # else: heap empty this instant — forced idle unit, time still advances
        if cooldown and cooldown[0][0] == time:
            _, remaining = cooldown.popleft()
            heapq.heappush(heap, remaining)         # cooldown served — back in the heap
    return time
```

```typescript
function leastInterval(tasks: string[], n: number): number {
  const freq = new Map<string, number>();
  for (const t of tasks) freq.set(t, (freq.get(t) ?? 0) + 1);

  // Max-heap of remaining counts.
  const heap: number[] = [...freq.values()];
  function siftUp(i: number): void {
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (heap[i] > heap[p]) {
        [heap[i], heap[p]] = [heap[p], heap[i]];
        i = p;
      } else break;
    }
  }
  function siftDown(i: number): void {
    const s0 = heap.length;
    while (true) {
      let s = i;
      const l = 2 * i + 1,
        r = 2 * i + 2;
      if (l < s0 && heap[l] > heap[s]) s = l;
      if (r < s0 && heap[r] > heap[s]) s = r;
      if (s === i) break;
      [heap[i], heap[s]] = [heap[s], heap[i]];
      i = s;
    }
  }
  for (let i = Math.floor(heap.length / 2) - 1; i >= 0; i--) siftDown(i); // heapify

  const cooldown: [number, number][] = []; // (availableAtTime, remainingCount), FIFO
  let cdHead = 0;

  let time = 0;
  while (heap.length > 0 || cdHead < cooldown.length) {
    time++;
    if (heap.length > 0) {
      const top = heap[0];
      const last = heap.pop()!;
      let remaining = top - 1; // run it: count -= 1
      if (heap.length > 0) {
        heap[0] = last;
        siftDown(0);
      }
      if (remaining > 0) {
        cooldown.push([time + n, remaining]); // still has occurrences left
      }
    }
    // else: heap empty this instant — forced idle unit, time still advances
    if (cdHead < cooldown.length && cooldown[cdHead][0] === time) {
      const [, remaining] = cooldown[cdHead++];
      heap.push(remaining);
      siftUp(heap.length - 1); // cooldown served — back in the heap
    }
  }
  return time;
}
```
````

Two subtleties worth naming explicitly. First, the cooldown queue is a
**FIFO**, not another heap — tasks always finish their cooldown in the
same order they entered it (whoever was pushed to cooldown first at
time `t` becomes available first, at `t + n + 1`), so a queue is exactly
the right structure, cheaper than a heap for this part. Second, the
"forced idle" case (heap empty but cooldown non-empty) still advances
`time` by 1 without running anything — that's precisely how the
algorithm produces idle slots in the output, and why the final `time`
can exceed `len(tasks)`.

```complexity
{
  "time": "O(tasks.length) — bounded by at most 26 distinct task types",
  "space": "O(1) — at most 26 heap entries and 26 cooldown entries",
  "why": "The simulation runs for exactly `time` units, and time is bounded by roughly len(tasks) + idle slots, itself bounded by a small multiple of len(tasks) since idle time can't exceed what the cooldown constraint forces. Each unit does O(log 26) = O(1) heap work (constant, since there are at most 26 distinct uppercase letters). Space is O(1) for the same reason — the heap and cooldown queue can never hold more than 26 entries total, independent of len(tasks)."
}
```
`````

`````reveal Alternative — closed-form counting formula (no simulation)
Because the alphabet is small and the structure is regular, this
problem also has a direct arithmetic answer, worth deriving as a second
way to see WHY the greedy simulation is optimal.

Let `maxCount` be the highest frequency among all task types, and
`maxCountTasks` be how many DIFFERENT task types share that highest
frequency. Arrange the most frequent task into `maxCount` "rows," each
row `n + 1` slots wide (the task itself, plus its cooldown). The last
row only needs `maxCountTasks` slots (one for each tied-for-most-
frequent task, no trailing cooldown needed after the very last unit).
This gives a lower bound:

```text
frame = (maxCount - 1) * (n + 1) + maxCountTasks
```

If `frame >= len(tasks)`, some idle slots are unavoidable and `frame`
IS the answer — every other, less-frequent task fits into the gaps
alongside the most-frequent ones without adding time. If `frame <
len(tasks)`, though, there are simply too many total tasks for the
frame to hold — every slot gets filled with some real task and no idle
time is needed at all, so the answer is just `len(tasks)`. The formula
is the max of the two:

````tabs
```python
from collections import Counter

def least_interval_formula(tasks: list[str], n: int) -> int:
    counts = Counter(tasks)
    max_count = max(counts.values())
    max_count_tasks = sum(1 for c in counts.values() if c == max_count)
    frame = (max_count - 1) * (n + 1) + max_count_tasks
    return max(frame, len(tasks))
```

```typescript
function leastIntervalFormula(tasks: string[], n: number): number {
  const freq = new Map<string, number>();
  for (const t of tasks) freq.set(t, (freq.get(t) ?? 0) + 1);
  const maxCount = Math.max(...freq.values());
  const maxCountTasks = [...freq.values()].filter((c) => c === maxCount).length;
  const frame = (maxCount - 1) * (n + 1) + maxCountTasks;
  return Math.max(frame, tasks.length);
}
```
````

```complexity
{
  "time": "O(tasks.length)",
  "space": "O(1)",
  "why": "One pass to count frequencies (bounded by 26 distinct keys), then O(26) work to find max and count ties — both effectively O(tasks.length) dominated by the initial counting pass, with no simulation loop at all."
}
```

This is faster in practice (no per-unit simulation) but the heap
simulation is what this module teaches, since it generalizes to variants
of the scheduling problem where a clean closed form may not exist — the
formula is a nice confirmation that the greedy simulation's answer is
provably optimal, not just plausible.
`````

## Variants

- **Rearrange String k Distance Apart** (not covered, similar to
  LeetCode 358): the general-alphabet version of the exact same
  constraint (identical characters must be ≥ k apart) — same heap +
  cooldown-queue simulation, without task-scheduler's small fixed
  alphabet.
- **Reorganize String** (LeetCode 767): the `n = 1` special case in a
  different guise (adjacent characters must differ) — solvable with a
  single max-heap and no cooldown queue at all, since a 1-step cooldown
  only ever needs to remember "the immediately previous character."
  Worth solving after this one to see the simulation simplify when `n`
  shrinks to its smallest useful case.
- **Heap Property & Array Representation** / **Heapify** (concept
  lessons, this module): the sift-up/sift-down mechanics reused directly
  here, with remaining-count as the ordering key instead of a raw
  number or a coordinate distance.

```quiz
{
  "question": "In the simulation, when the heap is empty but the cooldown queue is not, the algorithm still advances 'time' by one unit without running any task. Why is this forced-idle step necessary for correctness, rather than jumping time forward directly to the next task's available_at_time?",
  "options": [
    "It isn't necessary — jumping forward would give an identical, and faster, correct answer, since computing the exact number of units to skip and adding it directly to the elapsed-time counter preserves the same final total",
    "The problem counts total elapsed TIME UNITS as the answer, and an idle unit still consumes exactly one unit of that count — jumping ahead would undercount the schedule's true length by skipping the idle slots that the cooldown constraint actually forces into the output",
    "Advancing one unit at a time is required so the heap and cooldown queue stay synchronized in size — skipping time forward would let the two structures fall out of sync, since each expects exactly one check-in per elapsed unit to stay consistent"
  ],
  "answer": 1,
  "explanation": "The answer this problem wants IS the total number of time units, idle slots included — an idle unit is a real part of the schedule's length, not overhead to be optimized away in the counting. (A jump-ahead optimization is possible and would compute the same final answer correctly, since you can compute exactly how many units to skip — but the unit-by-unit version make the idle unit's contribution to the final count explicit and is simpler to reason about correctly, which is why it's shown as the primary solution.)"
}
```
