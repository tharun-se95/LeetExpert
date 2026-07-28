---
title: Network Delay Time
type: problem
---

## Problem

`n` network nodes labeled `1` to `n`. `times[i] = [u, v, w]` means a
directed edge from `u` to `v` taking `w` time units to travel. A signal
is sent from node `k`. Return the minimum time for the signal to reach
ALL `n` nodes, or `-1` if some node is unreachable. (LeetCode 743.)

**Examples**

```text
times = [[2,1,1],[2,3,1],[3,4,1]], n = 4, k = 2  →  2
   (2 reaches 1 and 3 in 1 unit each — done in parallel — then reaches
    4 via 3, at time 2; the answer is the LAST node's arrival time)

n = 2, times = [[1,2,1]], k = 2  →  -1   (node 1 is unreachable from 2)
```

**Constraints:** `1 ≤ k ≤ n ≤ 100`, up to `6000` edges, positive weights.

## Attempt it first

This is a direct, unmodified application of the Shortest Paths concept
lesson's Dijkstra's algorithm — the exercise is recognizing the mapping:
"minimum time for the signal to reach every node" is exactly "the
maximum, over all nodes, of the shortest path distance from the source
`k`" (the whole network is "done" only once its SLOWEST-to-reach node
has been reached). Before opening anything, work out why taking the
MAXIMUM (not the sum, not the minimum) of all the shortest distances is
the right combination for this specific question.

```sandbox
{
  "id": "network-delay-time",
  "fn": {
    "python": "network_delay_time",
    "javascript": "networkDelayTime"
  },
  "check": "return",
  "starter": {
    "python": "def network_delay_time(times, n, k):\n    # Return the time for a signal from k to reach all n nodes, or -1.\n    pass\n",
    "javascript": "function networkDelayTime(times, n, k) {\n  // Return the time for a signal from k to reach all n nodes, or -1.\n}\n"
  },
  "cases": [
    {
      "args": [
        [
          [
            2,
            1,
            1
          ],
          [
            2,
            3,
            1
          ],
          [
            3,
            4,
            1
          ]
        ],
        4,
        2
      ],
      "expect": 2
    },
    {
      "args": [
        [
          [
            1,
            2,
            1
          ]
        ],
        2,
        2
      ],
      "expect": -1
    },
    {
      "args": [
        [
          [
            1,
            2,
            1
          ]
        ],
        2,
        1
      ],
      "expect": 1
    },
    {
      "args": [
        [],
        1,
        1
      ],
      "expect": 0
    },
    {
      "args": [
        [
          [
            1,
            2,
            1
          ],
          [
            2,
            3,
            2
          ],
          [
            1,
            3,
            4
          ]
        ],
        3,
        1
      ],
      "expect": 3
    },
    {
      "args": [
        [
          [
            1,
            2,
            1
          ],
          [
            2,
            3,
            7
          ],
          [
            1,
            3,
            4
          ],
          [
            2,
            1,
            2
          ]
        ],
        3,
        1
      ],
      "expect": 4
    }
  ]
}
```

````reveal Hint — run Dijkstra from k, then take the max finite distance
Run Dijkstra's algorithm (exactly as derived in the concept lesson,
edge weights here are all positive, satisfying its non-negative
requirement) from source `k`. This produces `dist[v]` for every node —
the fastest the signal can possibly reach `v`. Since every node receives
the signal independently and in parallel (nothing waits for anything
else), the moment the ENTIRE network has received it is the moment the
LAST (slowest) node receives it — the maximum of all the `dist[]`
values. If any node's `dist[]` is still infinity after Dijkstra
finishes, that node is unreachable, and the answer is `-1`.
````

## The insight

No new algorithm — this is Dijkstra's algorithm, verbatim, wrapped with
a two-line interpretation step: after computing `dist[]` from `k`, check
whether every node has a finite distance (if not, return `-1`,
reachability failure); otherwise, return `max(dist)` (the network is
"fully informed" at the moment its slowest node hears the signal, since
all propagation happens simultaneously and independently along
different paths).

## Solution

`````reveal Solution — Dijkstra from k, then max of the finite distances
````tabs
```python
import heapq

def network_delay_time(times: list[list[int]], n: int, k: int) -> int:
    adj: list[list[tuple[int, int]]] = [[] for _ in range(n + 1)]  # 1-indexed
    for u, v, w in times:
        adj[u].append((v, w))

    dist = [float("inf")] * (n + 1)
    dist[k] = 0
    heap = [(0, k)]

    while heap:
        d, u = heapq.heappop(heap)
        if d > dist[u]:
            continue
        for v, w in adj[u]:
            if d + w < dist[v]:
                dist[v] = d + w
                heapq.heappush(heap, (dist[v], v))

    reachable = dist[1:]                      # ignore index 0, nodes are 1..n
    slowest = max(reachable)
    return int(slowest) if slowest != float("inf") else -1
```

```typescript
function networkDelayTime(times: number[][], n: number, k: number): number {
  const adj: [number, number][][] = Array.from({ length: n + 1 }, () => []); // 1-indexed
  for (const [u, v, w] of times) {
    adj[u].push([v, w]);
  }

  const dist = new Array(n + 1).fill(Infinity);
  dist[k] = 0;
  const heap: [number, number][] = [[0, k]];
  const up = (i: number) => {
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (heap[i][0] < heap[p][0]) {
        [heap[i], heap[p]] = [heap[p], heap[i]];
        i = p;
      } else break;
    }
  };
  const down = (i: number) => {
    const s0 = heap.length;
    while (true) {
      let s = i;
      const l = 2 * i + 1,
        r = 2 * i + 2;
      if (l < s0 && heap[l][0] < heap[s][0]) s = l;
      if (r < s0 && heap[r][0] < heap[s][0]) s = r;
      if (s === i) break;
      [heap[i], heap[s]] = [heap[s], heap[i]];
      i = s;
    }
  };
  const push = (e: [number, number]) => {
    heap.push(e);
    up(heap.length - 1);
  };
  const pop = (): [number, number] => {
    const top = heap[0];
    const last = heap.pop()!;
    if (heap.length > 0) {
      heap[0] = last;
      down(0);
    }
    return top;
  };

  while (heap.length > 0) {
    const [d, u] = pop();
    if (d > dist[u]) continue;
    for (const [v, w] of adj[u]) {
      if (d + w < dist[v]) {
        dist[v] = d + w;
        push([dist[v], v]);
      }
    }
  }

  const reachable = dist.slice(1); // ignore index 0, nodes are 1..n
  const slowest = Math.max(...reachable);
  return slowest === Infinity ? -1 : slowest;
}
```
````

The problem-specific logic is entirely in the last two lines: `dist`
holds Dijkstra's usual output, and the only work this problem adds is
reducing that array to a single number via `max` (the network isn't
"done" until its slowest node hears the signal) with an explicit
infinity check standing in for "not every node was reachable."

```complexity
{
  "time": "O(E log V)",
  "space": "O(V + E)",
  "why": "Identical to Dijkstra's own bound — every edge triggers at most one heap push, each O(log V). The final max-and-check pass over dist[] is an additional O(V), a lower-order term."
}
```
`````

## Variants

- **Shortest Paths** (concept lesson, this module): the full derivation
  of the Dijkstra's algorithm this problem applies without modification.
- **Path with Maximum Probability** (LeetCode 1514, not covered): a
  Dijkstra variant where "shorter" is replaced by "higher probability"
  and the relaxation uses multiplication instead of addition — a good
  exercise in recognizing which parts of Dijkstra generalize (the greedy
  priority-queue structure) and which are problem-specific (the
  comparison and combination operators).
- **Cheapest Flights Within K Stops** (LeetCode 787, not covered):
  Dijkstra with an added constraint (limited number of edges used) that
  breaks the plain greedy's optimality, requiring a Bellman-Ford-style
  bounded-relaxation approach instead — worth knowing as an example of
  when Dijkstra's assumptions stop applying.

```quiz
{
  "question": "Why is the answer max(dist) — the LARGEST shortest-path distance among all nodes — rather than, say, the sum of all shortest-path distances or the average?",
  "options": [
    "max is used because Dijkstra's algorithm can only return a single maximum value, not an array — the algorithm's internal priority queue mechanics only ever expose the largest distance it has processed, so max is the only value that's actually accessible afterward",
    "Every node receives the signal independently and simultaneously along its own shortest path from k — the whole network is only 'fully informed' at the moment the SLOWEST (most distant) node finally receives it, since all the faster nodes have already received it by then; that slowest arrival time is exactly the maximum of the individual shortest-path distances",
    "max happens to give the right numeric answer on the example, but sum would be equally valid in general — since both aggregate the same underlying dist array, either reduction could plausibly represent 'total time for the network,' and max was chosen here somewhat arbitrarily"
  ],
  "answer": 1,
  "explanation": "The propagation model is fully parallel — the signal doesn't travel to nodes one at a time in sequence, it spreads simultaneously along all paths at once. So the elapsed time for 'everyone has now heard it' is determined entirely by whichever single node takes the longest, not by any aggregate over all nodes. Sum or average would answer a different (and not physically meaningful, for this problem) question."
}
```
