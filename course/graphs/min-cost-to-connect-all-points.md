---
title: Min Cost to Connect All Points
type: problem
---

## Problem

Given `n` points on a 2D plane, the cost to connect two points `[xi,
yi]` and `[xj, yj]` is their **Manhattan distance**: `|xi - xj| + |yi -
yj|`. Return the minimum total cost to connect all points such that
there is exactly one path between any two points (i.e. build a
Minimum Spanning Tree over the complete graph these points define).
(LeetCode 1584.)

**Examples**

```examples
points = [[0,0],[2,2],[3,10],[5,2],[7,0]]  →  20
```

```constraint
`1 ≤ points.length ≤ 1000`, coordinates in `±10⁴`.
```

## Attempt it first

Every pair of points can be connected directly (there's no notion of
"no edge exists" here — any two points have a well-defined Manhattan
distance), so this is a **complete graph**: `n` points imply `n(n-1)/2`
possible edges. Before opening anything, revisit the Minimum Spanning
Trees concept lesson's comparison of Kruskal's vs. Prim's, and think
specifically about what a COMPLETE graph does to that comparison — what
happens to Kruskal's edge list, and to the cost of even constructing it,
when `E` is `O(n²)` instead of some smaller number tied to a sparser
structure?

```sandbox
{
  "id": "min-cost-to-connect-all-points",
  "fn": {
    "python": "min_cost_connect_points",
    "javascript": "minCostConnectPoints"
  },
  "check": "return",
  "starter": {
    "python": "def min_cost_connect_points(points):\n    # Return the least total Manhattan cost connecting every point.\n    pass\n",
    "javascript": "function minCostConnectPoints(points) {\n  // Return the least total Manhattan cost connecting every point.\n}\n"
  },
  "cases": [
    {
      "args": [
        [
          [
            0,
            0
          ],
          [
            2,
            2
          ],
          [
            3,
            10
          ],
          [
            5,
            2
          ],
          [
            7,
            0
          ]
        ]
      ],
      "expect": 20
    },
    {
      "args": [
        [
          [
            3,
            12
          ],
          [
            -2,
            5
          ],
          [
            -4,
            1
          ]
        ]
      ],
      "expect": 18
    },
    {
      "args": [
        [
          [
            0,
            0
          ]
        ]
      ],
      "expect": 0
    },
    {
      "args": [
        [
          [
            0,
            0
          ],
          [
            1,
            1
          ]
        ]
      ],
      "expect": 2
    },
    {
      "args": [
        [
          [
            0,
            0
          ],
          [
            1,
            1
          ],
          [
            1,
            0
          ],
          [
            0,
            1
          ]
        ]
      ],
      "expect": 3
    },
    {
      "args": [
        [
          [
            -1000,
            -1000
          ],
          [
            1000,
            1000
          ]
        ]
      ],
      "expect": 4000
    }
  ]
}
```

````reveal Hint — a complete graph favors Prim's over Kruskal's
Kruskal's algorithm needs to sort ALL edges upfront. With `n` up to
1000, a complete graph has up to `1000 · 999 / 2 ≈ 500,000` edges —
manageable, but it means explicitly materializing and sorting a
half-million-entry list just to get started, purely from the fact that
"complete graph" was chosen as the representation. Prim's algorithm,
growing outward from a single starting point and asking "what's the
cheapest edge to any point NOT yet in the tree," never needs to
materialize the full edge list at all — at each step it only needs the
distance from the CURRENT tree to every remaining point, computed
on-the-fly from coordinates, which is exactly what dense, complete-graph
MST problems favor.
````

## Building the graph, then running an MST algorithm

The "edges" here aren't given — they must be derived: every pair of
points has an edge with weight equal to their Manhattan distance. Two
valid approaches, both legitimate:

- **Kruskal's:** generate all `O(n²)` edges explicitly, sort them, run
  Kruskal's algorithm (Union-Find, skip edges that would create a
  cycle) exactly as in the concept lesson.
- **Prim's:** never materialize the edge list. Start from one point,
  and at each step, track the minimum distance from the growing tree to
  every point NOT yet included — recomputing those distances directly
  from coordinates as the tree grows, rather than consulting a
  precomputed edge list at all.

Prim's is shown as the primary solution because it's the better fit
for a dense, complete graph, exactly as the concept lesson's
"Kruskal vs. Prim: which wins when" section argues.

## Solution

`````reveal Solution — Prim's algorithm, distances computed directly from coordinates
````tabs
```python
import heapq

def min_cost_connect_points(points: list[list[int]]) -> int:
    n = len(points)
    visited = [False] * n
    heap = [(0, 0)]                # (edge cost to reach this point, point index) — start at point 0
    total_cost = 0
    edges_used = 0

    while heap and edges_used < n:
        cost, u = heapq.heappop(heap)
        if visited[u]:
            continue                # stale entry — u already joined the tree
        visited[u] = True
        total_cost += cost
        edges_used += 1
        xu, yu = points[u]
        for v in range(n):
            if not visited[v]:
                xv, yv = points[v]
                dist = abs(xu - xv) + abs(yu - yv)   # Manhattan distance, computed on the fly
                heapq.heappush(heap, (dist, v))

    return total_cost
```

```typescript
function minCostConnectPoints(points: number[][]): number {
  const n = points.length;
  const visited = new Array(n).fill(false);
  const heap: [number, number][] = [[0, 0]]; // (edge cost, point index) — start at point 0
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

  let totalCost = 0;
  let edgesUsed = 0;
  while (heap.length > 0 && edgesUsed < n) {
    const [cost, u] = pop();
    if (visited[u]) continue; // stale entry — u already joined the tree
    visited[u] = true;
    totalCost += cost;
    edgesUsed++;
    const [xu, yu] = points[u];
    for (let v = 0; v < n; v++) {
      if (!visited[v]) {
        const [xv, yv] = points[v];
        const dist = Math.abs(xu - xv) + Math.abs(yu - yv); // Manhattan distance, on the fly
        push([dist, v]);
      }
    }
  }

  return totalCost;
}
```
````

The critical difference from the concept lesson's Prim's template: there,
`adj[u]` was a precomputed list of `(neighbor, weight)` pairs; here,
there IS no precomputed adjacency list at all — the inner loop scans
EVERY unvisited point and computes its distance to `u` fresh, each time
a new point joins the tree. This is what avoids ever constructing the
full `O(n²)` edge set explicitly, at the cost of doing an O(n) scan
(rather than an O(degree(u))) scan every time a point is finalized.

```complexity
{
  "time": "O(n² log n)",
  "space": "O(n²) worst case for the heap (bounded by the number of pushes)",
  "why": "Each of the n point-finalizations triggers an O(n) scan over all other points (computing on-the-fly distances and pushing to the heap), so O(n²) total pushes, each O(log(heap size)) = O(log n) (heap size is bounded by total pushes, which is O(n²), so log of that is still O(log n) after accounting for the squaring inside a logarithm). This is actually BETTER than Kruskal's O(n² log n) from sorting a full O(n²) edge list upfront — Prim's here amortizes the O(n²) work across the algorithm's own steps rather than paying it all at once before starting, and never needs to hold the full edge set in memory simultaneously the way a sort would."
}
```
`````

## Variants

- **Minimum Spanning Trees** (concept lesson, this module): the full
  derivation of both Kruskal's and Prim's, and the sparse-vs-dense
  reasoning for choosing between them that this problem's complete-graph
  structure is a direct application of.
- **Connecting Cities With Minimum Cost** (LeetCode 1135, not covered):
  a nearly identical MST problem, but with a SPARSE, explicitly-given
  edge list rather than a complete graph derived from coordinates —
  worth solving with Kruskal's to see the sparse-graph case favor the
  other algorithm, completing the comparison.
- **Number of Provinces** and **Redundant Connection** (this module):
  both use Union-Find for connectivity questions without weights;
  contrasting them against this problem highlights when Union-Find
  alone suffices (unweighted connectivity) versus when a full MST
  algorithm (weighted optimization) is required.

```quiz
{
  "question": "This solution deliberately avoids ever constructing the full O(n²) list of pairwise distances, computing each distance on the fly instead. Why does that choice specifically favor Prim's algorithm over Kruskal's for this problem, rather than being an arbitrary implementation preference?",
  "options": [
    "It's arbitrary — Kruskal's could equally avoid materializing the edge list with the same technique, since sorting can in principle be performed incrementally on edges as they're discovered rather than requiring the full set up front",
    "Prim's algorithm doesn't actually need edge weights at all, only connectivity — since it grows the tree one vertex at a time based purely on which points are already included, the actual distance values are only used for tie-breaking rather than for deciding which edge to add",
    "Kruskal's algorithm fundamentally needs edges SORTED BY WEIGHT before it can begin processing them in order, which requires having the full edge set available to sort — there's no way to sort 'on the fly' one edge at a time as they're discovered; Prim's, by contrast, only ever needs the CURRENT cheapest frontier edge at each step, which a heap can maintain incrementally as new candidate distances are computed and pushed, one point at a time, with no need to ever hold or sort the complete edge set"
  ],
  "answer": 2,
  "explanation": "The structural requirement is the key difference. Kruskal's correctness argument (the cut property, applied via a globally sorted edge order) depends on processing edges from lightest to heaviest — which requires the full set to be known and sorted before the algorithm can make its first correct decision. Prim's correctness argument only requires knowing the cheapest edge crossing the CURRENT cut at each step, which a min-heap can supply incrementally, one new distance computation at a time, without ever needing the complete O(n²) edge set materialized or sorted as a whole."
}
```
