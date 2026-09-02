---
title: Shortest Paths (BFS, Dijkstra)
type: concept
---

## What "shortest" means depends on the graph

"Find the shortest path from A to B" sounds like one problem, but the
right algorithm changes completely depending on one property: are the
edges weighted? An **unweighted** graph (or one where every edge costs
exactly 1) has a shortest path that means "fewest edges" — plain BFS
(this module's DFS & BFS lesson) already solves this, though it's worth
re-deriving *why*, since the same argument sets up why weighted graphs
need something stronger. A **weighted** graph's shortest path means
"minimum total edge weight," and once weights differ, BFS's guarantee
breaks — a path with more edges can still have lower total weight than
a path with fewer, bigger ones. This lesson covers both: why BFS solves
the unweighted case, and Dijkstra's algorithm for the non-negative-
weighted case.

Picture a road network of towns connected by streets, and a GPS trying
to find the shortest route between two of them. If every street were
exactly one block long, "fewest turns" and "shortest distance" would be
the same question — count the turns, you've counted the blocks. That's
the unweighted case, and it's why plain BFS (which only ever counts
edges) gets it right. But real streets aren't uniform: a highway segment
might cover ten blocks' worth of distance in one "turn," while a side
street covers one. The instant that's true, the route with fewer turns
can easily be the LONGER one in actual miles — and a GPS that only
counted turns would send you the wrong way.

```diagram
{
  "id": "graph-layers",
  "caption": "unweighted shortest path = BFS layer distance"
}
```


## BFS finds shortest paths, but only in unweighted graphs

BFS explores the graph in layers: everything reachable in 1 edge, then
everything newly reachable in 2 edges, then 3, and so on — this is the
level-order idea from Module 17 applied to a general graph instead of a
tree. Because BFS never visits a vertex through a longer path before
trying every shorter path first (it exhausts each "distance layer"
completely before advancing to the next), **the first time BFS reaches
any vertex, it has done so via a shortest (fewest-edges) path to it.**
This is provable by induction on distance: every vertex at true distance
`d` has at least one neighbor at true distance `d - 1` (by definition of
shortest path), and by the inductive hypothesis every distance-`(d-1)`
vertex is discovered by BFS at exactly the moment its layer is
processed — so the distance-`d` vertex is discovered no later than the
following layer, i.e. at distance `d`, and not before (since a vertex at
true distance `d` has no neighbor at distance `< d - 1`, so it cannot be
reached in fewer than `d` steps by any path, BFS or otherwise).

This guarantee depends entirely on every edge costing the same
(implicitly, 1). The instant edges carry different weights, "fewest
edges" and "least total weight" can disagree — a two-edge path of
weights `[1, 1]` is worse than a three-edge path of weights `[0.5, 0.5,
0.5]`, and BFS, which only counts edges, has no way to notice.

## Dijkstra's algorithm: greedy relaxation with a priority queue

Dijkstra's algorithm computes shortest paths from a single source in a
graph with **non-negative** edge weights (the non-negative requirement
matters — see below). The idea generalizes BFS's "process in increasing
order of distance" strategy, but since edges no longer all cost the
same, a priority queue (not a plain FIFO queue) is needed to always
process the CURRENTLY closest unfinalized vertex next, whatever its
edge-count distance happens to be — back to the road trip: instead of
visiting towns in "number of turns away" order, you always drive next
to whichever not-yet-visited town is currently closest by total miles
driven so far, wherever on the map that happens to be.

Maintain a `dist[]` array (best known distance to each vertex, starting
at infinity except the source at 0) and a min-heap of `(distance,
vertex)` pairs. Repeatedly pop the vertex with the smallest known
distance; if it's already been finalized, skip it (a stale heap entry —
see below); otherwise, finalize it, and **relax** every outgoing edge:
for edge `(u, v, w)`, if `dist[u] + w < dist[v]`, update `dist[v]` and
push `(dist[v], v)` onto the heap.

````tabs
```python
import heapq

def dijkstra(num_vertices: int, adj: list[list[tuple[int, int]]], src: int) -> list[float]:
    # adj[u] = list of (neighbor, weight) — the weighted adjacency list
    # from the Graph Representation concept lesson.
    dist = [float("inf")] * num_vertices
    dist[src] = 0
    heap = [(0, src)]                 # (distance, vertex)

    while heap:
        d, u = heapq.heappop(heap)
        if d > dist[u]:
            continue                  # stale entry — a better one was already processed
        for v, w in adj[u]:
            if d + w < dist[v]:       # relax: found a shorter path to v through u
                dist[v] = d + w
                heapq.heappush(heap, (dist[v], v))

    return dist
```

```typescript
function dijkstra(
  numVertices: number,
  adj: [number, number][][],
  src: number,
): number[] {
  // adj[u] = list of [neighbor, weight] — the weighted adjacency list
  // from the Graph Representation concept lesson.
  const dist = new Array(numVertices).fill(Infinity);
  dist[src] = 0;

  // Min-heap of [distance, vertex] — same sift logic as the Heaps module.
  const heap: [number, number][] = [[0, src]];
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
    const n = heap.length;
    while (true) {
      let s = i;
      const l = 2 * i + 1,
        r = 2 * i + 2;
      if (l < n && heap[l][0] < heap[s][0]) s = l;
      if (r < n && heap[r][0] < heap[s][0]) s = r;
      if (s === i) break;
      [heap[i], heap[s]] = [heap[s], heap[i]];
      i = s;
    }
  };
  const push = (entry: [number, number]) => {
    heap.push(entry);
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
    if (d > dist[u]) continue; // stale entry — a better one was already processed
    for (const [v, w] of adj[u]) {
      if (d + w < dist[v]) {
        // relax: found a shorter path to v through u
        dist[v] = d + w;
        push([dist[v], v]);
      }
    }
  }

  return dist;
}
```
````

**The stale-entry check (`if d > dist[u]: continue`) is not defensive
programming — it's load-bearing.** Because a vertex can be pushed onto
the heap multiple times (once per relaxation that improves its distance),
the heap can hold several entries for the same vertex simultaneously,
with different (decreasing) distances. Only the entry matching the
CURRENT best-known `dist[u]` is meaningful; any entry popped later with
a larger `d` is a leftover from an earlier, since-improved-upon
relaxation and must be skipped, or the algorithm could re-relax edges
using a worse distance than what's already been established.

Trace it on a different small graph — source `S`, with `S → X` (weight
10), `S → Y` (weight 3), `Y → X` (weight 2) — to keep this separate from
the A/B/C example just ahead. Pop `(0, S)`, finalize `S`, relax both its
edges: push `(10, X)` and `(3, Y)`. Pop `(3, Y)` — matches `dist[Y] = 3`,
so finalize `Y`, and relax `Y → X`: `dist[Y] + 2 = 5 < dist[X] = 10`, so
update `dist[X] = 5` and push `(5, X)`. The heap now holds *two* entries
for `X`: the stale `(10, X)` from `S`'s relaxation and the fresh
`(5, X)` from `Y`'s. Pop `(5, X)` next (it's smaller) — matches the
current `dist[X] = 5`, so finalize `X` at its true shortest distance.
Eventually `(10, X)` is popped too, but by then `10 > dist[X] = 5`, so
the check fires and it's skipped — without it, this stale entry would
re-finalize `X` at the wrong, larger distance.

## Why Dijkstra fails with negative edge weights

The greedy step "pop the smallest known distance and finalize it
permanently" assumes that once a vertex is popped, no future discovery
can ever produce a shorter path to it — true only when all remaining
edge weights are non-negative (adding a non-negative weight to an
already-larger path can never make it smaller than the just-finalized
one). A negative edge breaks this: a longer path that later takes a
sharply negative edge can end up shorter than a path that looked optimal
when it was finalized. Imagine one road segment that isn't a toll road
at all but a rebate — driving it actually PAYS you, subtracting from
your trip's total cost. Dijkstra locks in a town's final distance and
never revisits it, the moment it's popped as the current cheapest — so
if the rebate road is discovered only after a town has already been
locked in, there's no mechanism left to go back and say "actually, the
longer-looking route through the rebate road was cheaper after all."

Concretely: vertices A, B, C with edges A→B (weight 5), A→C (weight 2),
C→B (weight -10). Dijkstra processes A (distance 0), then greedily
picks the smallest next: C (distance 2) before B (distance 5) — correct
so far. But after finalizing C, relaxing C→B gives `dist[B] = 2 + (-10)
= -8`, which is far better than the seemingly-final `dist[B] = 5`
computed earlier. If B had been popped and finalized before C (which
could happen with a different graph shape), Dijkstra would have locked
in the wrong, too-large answer for B and never revisited it. The
algorithm has no mechanism to "un-finalize" a vertex, so negative edges
can produce silently incorrect results.

## Bellman-Ford: the fallback for negative weights

**Bellman-Ford** handles negative edge weights (as long as there's no
*negative cycle*, which would make "shortest path" undefined — you
could loop the cycle forever, decreasing the total without bound).
Instead of greedily finalizing vertices in distance order, it relaxes
**every edge, V − 1 times** (a straightforward loop, no priority queue),
which is enough because any shortest path has at most `V - 1` edges,
and each full pass is guaranteed to correctly extend the confirmed
shortest paths by at least one more edge. The cost follows directly from
that shape: an outer loop of `V - 1` passes, each doing an inner loop
over all `E` edges — `(V - 1) × E` relaxations total, which is
**O(V · E)** — markedly worse than Dijkstra's `O((V + E) log V)`, which
is precisely the price paid for tolerating negative edges: no greedy
shortcut is safe, so every edge must be reconsidered repeatedly rather
than each vertex being settled once. Bellman-Ford is not implemented in
full here; know its existence, its cost, and the reason it's needed when
Dijkstra's non-negative assumption doesn't hold.

```complexity
{
  "operations": [
    { "name": "BFS (unweighted shortest path)", "time": "O(V + E)", "why": "every vertex and edge visited once, exactly as in ordinary BFS" },
    { "name": "Dijkstra (non-negative weights)", "time": "O((V + E) log V)", "why": "each vertex popped once (amortized, ignoring stale entries which are O(1) to skip), each edge triggers at most one heap push, each heap operation is O(log V)" },
    { "name": "Bellman-Ford (tolerates negative weights)", "time": "O(V · E)", "why": "V-1 full passes over all E edges, since no greedy shortcut is safe without a non-negativity guarantee" }
  ]
}
```

```quiz
{
  "questions": [
    {
      "question": "Why does plain BFS correctly compute shortest paths in an unweighted graph, but fail to do so once edges have different weights?",
      "options": [
        "BFS explores strictly in order of edge-count distance, so the first visit to any vertex is guaranteed to be via a fewest-edges path — but with unequal weights, a path with MORE edges can have LESS total weight than a path with fewer edges, which BFS's edge-counting has no way to detect",
        "BFS requires the graph to be a DAG, which weighted graphs often aren't — since BFS's layer-by-layer exploration assumes no back-references complicate the distance calculation, cyclic graphs (which weighted graphs commonly are) violate that assumption",
        "BFS only works on trees, not general graphs — since a tree guarantees exactly one path between any two nodes, BFS's shortest-path guarantee depends on that uniqueness, which general graphs with multiple paths don't provide"
      ],
      "answer": 0,
      "explanation": "BFS's correctness rests entirely on 'more edges = worse,' which is only true when every edge costs the same. Weighted graphs break that equivalence — a 3-edge path can beat a 2-edge path if its edges are cheap enough — so BFS's layer-by-layer, edge-count-based exploration no longer identifies the true minimum-weight path."
    },
    {
      "question": "In Dijkstra's algorithm, why is the check 'if d > dist[u]: skip this heap entry' necessary for correctness, rather than just being a minor optimization?",
      "options": [
        "It's purely an optimization; removing it would only slow the algorithm down, not break it — since every heap entry eventually gets processed and the dist array always ends up holding the smallest values seen, skipping this check just means doing some redundant relaxation work",
        "A vertex can be pushed onto the heap multiple times as relaxation repeatedly finds shorter paths to it, leaving stale (outdated, larger-distance) entries in the heap alongside the current best one — processing a stale entry as if it were current could cause the algorithm to re-relax edges from an already-superseded, worse distance, corrupting dist[] for downstream vertices",
        "The check is required only when the graph contains a cycle — since acyclic graphs never revisit the same vertex through a different path, the stale-entry problem this check guards against can only arise once a cycle creates multiple routes back to a vertex"
      ],
      "answer": 1,
      "explanation": "Every time a shorter path to u is found, a new heap entry with the improved distance is pushed — but the OLD, larger-distance entry is not removed from the heap (removing an arbitrary heap entry isn't an O(log n) operation a binary heap supports directly). The stale-entry check is what prevents that leftover from being treated as authoritative when it's eventually popped, which is essential, not incidental, to producing correct final distances."
    },
    {
      "question": "Why specifically does a negative edge weight break Dijkstra's greedy 'finalize the vertex with the smallest known distance, permanently' strategy?",
      "options": [
        "Negative weights cause the priority queue to malfunction — since heap implementations typically assume non-negative keys internally, a negative distance value can corrupt the heap's internal ordering invariants and produce incorrect pop order",
        "The greedy finalization relies on the fact that extending an already-longer path with more (non-negative) edges can never make it shorter than an already-finalized, smaller distance — a negative edge breaks this by potentially making a path that looked longer become shorter than the finalized one, but Dijkstra has no mechanism to revisit and correct an already-finalized vertex",
        "Negative weights make the graph disconnected — since a negative edge effectively cancels out the connectivity contributed by a positive one, introducing negative weights can sever paths that would otherwise exist between vertices"
      ],
      "answer": 1,
      "explanation": "Dijkstra's correctness proof depends on non-negativity to guarantee that once a vertex is popped with the smallest current distance, no future relaxation through a not-yet-processed vertex could ever produce something smaller — extending a path can only add non-negative cost. A negative edge invalidates exactly that guarantee, and since finalized vertices are never reconsidered, an early wrong finalization becomes a permanent, uncorrected error."
    }
  ]
}
```
