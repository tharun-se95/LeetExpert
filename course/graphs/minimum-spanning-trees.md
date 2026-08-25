---
title: Minimum Spanning Trees (Kruskal's & Prim's)
type: concept
---

## What a spanning tree is, and why "minimum" matters

A **spanning tree** of a connected, undirected graph is a subset of its
edges that connects every vertex, using the fewest possible edges to do
so (exactly `V − 1` edges for `V` vertices) — and, being a tree,
contains no cycles. Many graphs have MANY different spanning trees; if
edges are weighted, the **Minimum Spanning Tree (MST)** is the one
whose edges sum to the smallest total weight. This is well-defined only
for graphs that are **connected** (otherwise no single tree can reach
every vertex) and **undirected** (an MST's edges don't have a
direction — "connect A and B as cheaply as possible" is symmetric).
Practically, this is the "wire every house to the electrical grid for
the least total cable" question, or "connect every server with the
least total network cost."

```diagram
{
  "id": "graph-representation",
  "vertexCount": 4,
  "edges": [
    { "from": 0, "to": 1 },
    { "from": 1, "to": 2 },
    { "from": 2, "to": 3 },
    { "from": 0, "to": 3 }
  ],
  "directed": false
}
```


This module presents two classic MST algorithms, both greedy, both
provably correct via the same underlying fact (the **cut property**,
below) — but built on different data structures and suited to different
graph shapes.

## The cut property: why greedy works here at all

A **cut** is any partition of the vertices into two non-empty groups. A
**crossing edge** is an edge with one endpoint in each group. The **cut
property** states: for any cut of the graph, the minimum-weight crossing
edge is part of SOME minimum spanning tree (assuming all edge weights
are distinct, for simplicity of statement — ties can be broken
consistently without changing the argument).

Why: suppose, for contradiction, that the minimum-weight crossing edge
`e` were NOT in some particular MST `T`. Since `T` connects every
vertex, it must contain some OTHER edge `e'` crossing the same cut (any
spanning tree must cross every cut at least once, or the two groups
wouldn't be connected to each other). Since `e` is the minimum-weight
crossing edge, `weight(e) < weight(e')`. Swap `e'` out of `T` and `e` in
— this produces another spanning tree (removing `e'` splits `T` into two
pieces exactly along the cut, and adding `e` reconnects them, since `e`
also crosses the same cut) with strictly LOWER total weight than `T`.
This contradicts `T` being minimum. So the minimum crossing edge must
have been in an MST all along. **This is the exchange argument from the
Greedy module's concept lesson, applied concretely to spanning trees.**

Both algorithms below are just different strategies for repeatedly
finding a cut and taking its minimum crossing edge, in an order that's
convenient to compute.

## Kruskal's algorithm: sort edges, add if no cycle

Kruskal's algorithm processes ALL edges globally, sorted by weight from
smallest to largest, greedily adding each edge to the growing MST
**unless it would create a cycle** (which would mean both its endpoints
are already connected within the MST-so-far — adding it wouldn't
connect anything new, only waste weight on a redundant edge).

The "would this edge create a cycle" check is exactly what Union-Find
(previous lesson) answers efficiently: two endpoints are already
connected if and only if `find(u) == find(v)`. Skip the edge if so;
otherwise, `union(u, v)` and add the edge to the MST.

````tabs
```python
def kruskal_mst(num_vertices: int, edges: list[tuple[int, int, int]]) -> int:
    # edges: list of (weight, u, v) — sorted below by weight.
    edges = sorted(edges, key=lambda e: e[0])
    uf = UnionFind(num_vertices)          # from the Union-Find concept lesson
    total_weight = 0
    edges_used = 0

    for weight, u, v in edges:
        if uf.find(u) != uf.find(v):      # would NOT create a cycle
            uf.union(u, v)
            total_weight += weight
            edges_used += 1
            if edges_used == num_vertices - 1:   # MST is complete
                break

    return total_weight
```

```typescript
function kruskalMst(numVertices: number, edges: [number, number, number][]): number {
  // edges: array of [weight, u, v] — sorted below by weight.
  const sortedEdges = [...edges].sort((a, b) => a[0] - b[0]);
  const uf = new UnionFind(numVertices); // from the Union-Find concept lesson
  let totalWeight = 0;
  let edgesUsed = 0;

  for (const [weight, u, v] of sortedEdges) {
    if (uf.find(u) !== uf.find(v)) {
      // would NOT create a cycle
      uf.union(u, v);
      totalWeight += weight;
      edgesUsed++;
      if (edgesUsed === numVertices - 1) break; // MST is complete
    }
  }

  return totalWeight;
}
```
````

**Why this is correct, via the cut property:** processing edges in
increasing weight order means that whenever an edge `(u, v)` is
considered and `u`, `v` are in different components (different Union-
Find groups), that edge is provably the minimum-weight edge crossing
the cut "u's current component vs. everything else" — because every
smaller-weight edge has already been processed, and none of them
connected `u`'s component to `v`'s (or they'd already be the same
component). The cut property guarantees this edge belongs in an MST, so
adding it is always safe.

## Prim's algorithm: grow one tree from a single vertex

Prim's algorithm builds the MST differently: start from any single
vertex, and repeatedly add the minimum-weight edge that connects the
GROWING TREE to any vertex not yet in it — always extending the same
single connected tree, rather than Kruskal's approach of considering
edges globally regardless of which component they're in.

This is structurally the same shape as **Dijkstra's algorithm**
(previous lesson): a priority queue of "frontier" edges, repeatedly
popping the minimum and, if it reaches a new vertex, adding it to the
tree and pushing its outgoing edges. The difference: Dijkstra relaxes by
comparing PATH DISTANCE FROM THE SOURCE (`dist[u] + weight`), while
Prim's compares the SINGLE EDGE WEIGHT directly (no accumulation) — Prim's
is asking "what's the cheapest way to reach a new vertex from the tree
so far," not "what's the cheapest total path from the start."

````tabs
```python
import heapq

def prim_mst(num_vertices: int, adj: list[list[tuple[int, int]]]) -> int:
    # adj[u] = list of (neighbor, weight) — the weighted adjacency list.
    visited = [False] * num_vertices
    heap = [(0, 0)]                    # (edge weight to reach this vertex, vertex) — start at 0
    total_weight = 0

    while heap:
        weight, u = heapq.heappop(heap)
        if visited[u]:
            continue                    # stale entry — u already joined the tree
        visited[u] = True
        total_weight += weight
        for v, w in adj[u]:
            if not visited[v]:
                heapq.heappush(heap, (w, v))   # cost is the RAW edge weight, not accumulated

    return total_weight
```

```typescript
function primMst(numVertices: number, adj: [number, number][][]): number {
  // adj[u] = list of [neighbor, weight] — the weighted adjacency list.
  const visited = new Array(numVertices).fill(false);
  // Min-heap of [edge weight to reach this vertex, vertex].
  const heap: [number, number][] = [[0, 0]]; // start at vertex 0, cost 0
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

  let totalWeight = 0;
  while (heap.length > 0) {
    const [weight, u] = pop();
    if (visited[u]) continue; // stale entry — u already joined the tree
    visited[u] = true;
    totalWeight += weight;
    for (const [v, w] of adj[u]) {
      if (!visited[v]) push([w, v]); // cost is the RAW edge weight, not accumulated
    }
  }

  return totalWeight;
}
```
````

**Why this is correct, also via the cut property:** at every step, the
cut is "the tree built so far vs. everything else." Popping the
minimum-weight edge crossing that exact cut and adding its new endpoint
is precisely the cut property's guarantee applied with the tree-so-far
as one side of the cut — so, just like Kruskal's, every edge Prim's adds
is provably part of some MST.

## Kruskal vs. Prim: which wins when

Both run close to `O(E log E)`, and it's worth seeing where each factor
comes from rather than taking it on faith. **Kruskal's** is dominated by
the upfront sort: comparison sorting E edges costs `O(E log E)`, and the
Union-Find operations that follow (E of them, one `find`/`union` pair
per edge, each amortized O(α(V)) from the previous lesson) add only a
lower-order term. Since a simple graph has at most `V²` edges,
`E ≤ V²`, so `log E ≤ log(V²) = 2 log V` — the `2` is a constant factor
Big O discards, which is why this is often written `O(E log V)`
instead. **Prim's** total is the same shape for a different reason: with
a binary heap, each of the V vertices is extracted at most once
(`O(log V)` per extraction) and each of the E edges triggers at most one
heap push (`O(log V)` per push) — summing `V` extractions and `E`
pushes, both costing `O(log V)` each, gives `O((V + E) log V)`, which
for a connected graph (`E ≥ V − 1`) simplifies to `O(E log V)` — the
same reasoning as Dijkstra in the previous lesson. The practical
difference is in how each accesses the graph:

- **Kruskal's** processes edges GLOBALLY and needs them sorted upfront —
  natural when the graph is given as an edge list, and efficient on
  **sparse** graphs (E close to V) since sorting a small edge list is
  cheap and Union-Find operations are near-constant.
- **Prim's** grows outward from a vertex using the adjacency
  representation directly, never needing to look at the whole edge set
  at once — natural when the graph is given (or can cheaply be treated)
  as an adjacency list, and preferred on **dense** graphs (E close to
  V²) since it avoids ever materializing and sorting the full,
  potentially huge, edge list that Kruskal's requires upfront.

```complexity
{
  "operations": [
    { "name": "Kruskal's", "time": "O(E log E) = O(E log V)", "why": "dominated by sorting all E edges; the Union-Find operations that follow are near-O(1) amortized each (previous lesson), contributing a lower-order term" },
    { "name": "Prim's (binary heap)", "time": "O(E log V)", "why": "same structure as Dijkstra — each edge triggers at most one heap push, O(log V) each, over up to E edges" },
    { "name": "space, both", "time": "O(V + E)", "why": "the adjacency list or edge list itself, plus O(V) for the Union-Find or visited array" }
  ]
}
```

```quiz
{
  "questions": [
    {
      "question": "The cut property states that the minimum-weight edge crossing ANY cut belongs in some MST. How does Kruskal's algorithm exploit this while only ever considering edges in a single globally-sorted order, rather than explicitly examining different cuts?",
      "options": [
        "When Kruskal's processes an edge (u,v) in sorted order and finds u and v in different Union-Find components, that edge is automatically the minimum-weight edge crossing the cut between u's component and everything else, BECAUSE every smaller-weight edge has already been considered and none of them merged those two particular components — so the cut property applies implicitly at every accepted edge, without Kruskal's ever needing to identify the cut explicitly",
        "Kruskal's algorithm does not actually rely on the cut property — it uses a different correctness argument entirely, one based purely on the fact that a tree with V-1 edges and no cycles must already be minimal by construction",
        "Kruskal's algorithm only works correctly on graphs with no cycles to begin with — since the algorithm's cycle-skipping logic assumes the input graph starts out acyclic, running it on a graph containing cycles would produce an invalid result"
      ],
      "answer": 0,
      "explanation": "The global sorted order does the work implicitly. At the moment edge (u,v) is considered and accepted, every lighter edge has already been processed, and by hypothesis none of them connected u's and v's current components (otherwise they wouldn't be in different components now) — which means (u,v) is provably the cheapest edge crossing that specific cut, satisfying the cut property's precondition without the algorithm ever having to explicitly construct or name the cut."
    },
    {
      "question": "Prim's algorithm and Dijkstra's algorithm share nearly identical code structure (priority queue, pop minimum, relax neighbors). What is the one substantive difference in what gets compared/pushed?",
      "options": [
        "Dijkstra's heap key is the ACCUMULATED path distance from the source (dist[u] + edge weight), since it's answering 'what's the cheapest total path here'; Prim's heap key is the RAW edge weight alone, since it's answering 'what's the cheapest single edge connecting the tree-so-far to a new vertex' — accumulation across multiple edges is irrelevant to Prim's question",
        "There is no real difference; they are the same algorithm under different names — both maintain a priority queue of frontier vertices and greedily extend the current structure, and the historical distinction between them is purely nomenclature",
        "Prim's uses a max-heap while Dijkstra's uses a min-heap — since Prim's is looking for the single most expensive edge to skip over, a max-heap ordering naturally surfaces the right candidate at the top"
      ],
      "answer": 0,
      "explanation": "The two algorithms ask different questions despite the identical control flow. Dijkstra accumulates weight along a path from a fixed source, because total path cost is what 'shortest path' means. Prim's never accumulates — each heap entry is just one edge's own weight, because MST-building only cares about the cheapest way to attach one MORE vertex to the tree, not about any notion of cumulative distance from a starting point."
    }
  ]
}
```
