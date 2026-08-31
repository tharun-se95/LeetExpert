---
title: Graph Representation
type: concept
---

## Stage 4, and the most general structure yet

Every structure so far has constrained how things connect. Arrays connect
by adjacency in memory. Linked lists connect each node to exactly one
next. Trees connect each node to one parent and some children, with no
cycles allowed. A **graph** drops all of these constraints: any node may
connect to any other node, in any number, with or without direction, with
or without a cost. That generality is exactly why graphs model so much —
road networks, task dependencies, social follows, package imports, state
machines — and it's why the first real decision is not an algorithm but a
**representation**. The wrong representation can turn an O(V+E) algorithm
into an O(V²) one on the same input, so this lesson argues the trade-off
precisely before any traversal is written.

## The vocabulary, made precise

A graph is a set of **vertices** (also called nodes) `V` and a set of
**edges** `E`, where each edge joins two vertices. Three independent axes
describe any graph, and each one changes what the representation must
store:

- **Directed vs. undirected.** In an *undirected* graph an edge `{u, v}`
  means u and v are mutually connected — if you can walk u→v you can walk
  v→u. In a *directed* graph (digraph) an edge `(u, v)` is one-way: it
  permits u→v and says nothing about v→u. "Follows" on a social network
  is directed; "is friends with" is undirected.
- **Weighted vs. unweighted.** An *unweighted* edge just records that a
  connection exists. A *weighted* edge carries a number — a distance, a
  cost, a capacity. Shortest-path and minimum-spanning-tree algorithms
  later in this module exist precisely because edges have weights.
- **Cyclic vs. acyclic.** A *cycle* is a path that returns to its start.
  Graphs may contain cycles; the acyclic special cases (trees, and
  directed acyclic graphs) enable algorithms that general graphs can't
  support, which the topological-sort lesson depends on entirely.

Two counts drive every complexity argument in this module: `V = |V|`, the
number of vertices, and `E = |E|`, the number of edges. Their relationship
is what "sparse" and "dense" name. A graph with V vertices can have at most
about V² edges (every vertex connected to every other). A **sparse** graph
has E much smaller than V² — often E is O(V), as in a road network where
each intersection has a handful of roads. A **dense** graph has E close to
V². Keep both numbers in view; the whole representation choice turns on
which regime you're in.

```diagram
{
  "id": "graph-representation",
  "vertexCount": 4,
  "edges": [
    { "from": 0, "to": 1 },
    { "from": 0, "to": 2 },
    { "from": 1, "to": 2 },
    { "from": 2, "to": 3 }
  ],
  "directed": false
}
```

## Adjacency list: store each vertex's neighbors

Picture a club roster where, instead of one giant table of every possible
pair of members, each person just keeps a small index card listing the
names of their own friends. Looking up "who are Sam's friends" means
reading Sam's card directly — nothing else in the room needs to be
touched.

The **adjacency list** stores, for each vertex, a list of the vertices it
has an edge to. Concretely: an array (or hash map) indexed by vertex,
whose entry is the list of that vertex's neighbors. For a weighted graph,
each neighbor entry also carries the edge weight.

````tabs
```python
# Unweighted, vertices labelled 0..V-1.
# adj[u] is the list of vertices u has an edge to.
def build_adjacency_list(num_vertices: int, edges: list[tuple[int, int]],
                         directed: bool = False) -> list[list[int]]:
    adj: list[list[int]] = [[] for _ in range(num_vertices)]
    for u, v in edges:
        adj[u].append(v)
        if not directed:
            adj[v].append(u)   # undirected: record the edge both ways
    return adj

# Weighted variant: store (neighbor, weight) pairs.
def build_weighted_list(num_vertices: int,
                        edges: list[tuple[int, int, int]]
                        ) -> list[list[tuple[int, int]]]:
    adj: list[list[tuple[int, int]]] = [[] for _ in range(num_vertices)]
    for u, v, w in edges:
        adj[u].append((v, w))
        adj[v].append((u, w))
    return adj
```

```typescript
// Unweighted, vertices labelled 0..V-1.
// adj[u] is the list of vertices u has an edge to.
function buildAdjacencyList(
  numVertices: number,
  edges: [number, number][],
  directed = false,
): number[][] {
  const adj: number[][] = Array.from({ length: numVertices }, () => []);
  for (const [u, v] of edges) {
    adj[u].push(v);
    if (!directed) adj[v].push(u); // undirected: record the edge both ways
  }
  return adj;
}

// Weighted variant: store [neighbor, weight] pairs.
function buildWeightedList(
  numVertices: number,
  edges: [number, number, number][],
): [number, number][][] {
  const adj: [number, number][][] = Array.from(
    { length: numVertices },
    () => [],
  );
  for (const [u, v, w] of edges) {
    adj[u].push([v, w]);
    adj[v].push([u, w]);
  }
  return adj;
}
```
````

**Space.** Count it directly: the outer array has exactly one slot per
vertex — V slots. Each edge contributes one list entry per direction it's
stored in: a directed edge `(u, v)` appears once (in `adj[u]`), an
undirected edge appears twice (in both `adj[u]` and `adj[v]`) — either
way, the total entries across all lists combined is proportional to E
(exactly E for directed, 2E for undirected, and 2E is still O(E), since
constants drop out). Adding the outer array's V slots to the ≤ 2E list
entries gives **O(V + E)** total. Nothing is stored for pairs of
vertices that have no edge, which is the crucial property: a sparse
graph costs proportionally little — one index card per person, sized to
their actual friend count, not to the size of the whole club.

## Adjacency matrix: a full V×V grid

The **adjacency matrix** is a V×V grid where entry `M[u][v]` records
whether an edge u→v exists — `1`/`0` for unweighted, or the weight (with
some sentinel like infinity for "no edge") for weighted. An undirected
graph's matrix is symmetric (`M[u][v] == M[v][u]`).

````tabs
```python
INF = float("inf")

def build_adjacency_matrix(num_vertices: int,
                           edges: list[tuple[int, int]],
                           directed: bool = False) -> list[list[int]]:
    # 0 = no edge, 1 = edge. Every cell is allocated up front.
    matrix = [[0] * num_vertices for _ in range(num_vertices)]
    for u, v in edges:
        matrix[u][v] = 1
        if not directed:
            matrix[v][u] = 1
    return matrix
```

```typescript
function buildAdjacencyMatrix(
  numVertices: number,
  edges: [number, number][],
  directed = false,
): number[][] {
  // 0 = no edge, 1 = edge. Every cell is allocated up front.
  const matrix: number[][] = Array.from({ length: numVertices }, () =>
    new Array<number>(numVertices).fill(0),
  );
  for (const [u, v] of edges) {
    matrix[u][v] = 1;
    if (!directed) matrix[v][u] = 1;
  }
  return matrix;
}
```
````

**Space.** The grid allocates one cell for every ordered pair of vertices,
whether or not an edge exists there — that's **O(V²)**, unconditionally.
On a graph with V = 10⁴ vertices and only 10⁴ edges (a very sparse graph),
the matrix still reserves 10⁸ cells, almost all of them zero. That is the
matrix's defining weakness and the reason it is wrong for sparse graphs.

## The trade-off, operation by operation

The two representations are not "one is better" — they trade the two
operations you actually perform against each other. Argue each from what
the code above must do:

- **"Does edge u→v exist?" (edge lookup).** The matrix answers by reading
  one cell, `M[u][v]` — **O(1)**. The list must scan `adj[u]` looking for
  v, which costs time proportional to u's number of neighbors (its
  *degree*) — **O(degree(u))**, up to O(V) if u is connected to
  everything. If your algorithm constantly asks "are these two specific
  vertices adjacent?", the matrix wins this operation outright.
- **"Iterate over all neighbors of u."** The list hands you exactly u's
  neighbors: **O(degree(u))**, doing no wasted work. The matrix must scan
  the entire row `M[u]` — all V cells — to find which are non-zero, so
  it's **O(V)** even if u has two neighbors. Almost every graph traversal
  (BFS, DFS, Dijkstra, and everything built on them) is a loop of "visit
  a vertex, then iterate its neighbors," so this operation dominates real
  algorithm cost — and the list wins it.
- **Iterating the whole graph's edges** (the shape of a full traversal).
  Summing "iterate neighbors" over every vertex: the list touches each
  edge entry once, totalling **O(V + E)**; the matrix scans every one of
  its V² cells, totalling **O(V²)**. On a sparse graph where E = O(V),
  that's the difference between O(V) and O(V²) work for the same result —
  the single most important consequence in this lesson.

```complexity
{
  "operations": [
    { "name": "adjacency list — space", "time": "O(V + E)", "why": "one slot per vertex, plus one entry per edge-direction stored; nothing stored for absent edges" },
    { "name": "adjacency matrix — space", "time": "O(V²)", "why": "a cell for every ordered pair of vertices, allocated whether or not an edge exists" },
    { "name": "edge lookup u→v — list", "time": "O(degree(u))", "why": "must scan u's neighbor list for v" },
    { "name": "edge lookup u→v — matrix", "time": "O(1)", "why": "read the single cell M[u][v]" },
    { "name": "iterate neighbors of u — list", "time": "O(degree(u))", "why": "the list IS exactly u's neighbors — no wasted work" },
    { "name": "iterate neighbors of u — matrix", "time": "O(V)", "why": "must scan all V cells of row u to find the non-zero ones" }
  ]
}
```

## Which to use, and why this course defaults to the list

Read the trade-off through the sparse/dense axis:

- **Sparse graph (E far below V², the common case):** use the **adjacency
  list**. Its O(V + E) space is proportional to the actual data, and its
  O(degree) neighbor iteration makes traversals O(V + E) rather than
  O(V²). Road maps, dependency graphs, social graphs, and essentially
  every graph problem in this module are sparse.
- **Dense graph (E approaching V²), OR an algorithm dominated by "is u
  adjacent to v?" queries:** the **adjacency matrix** becomes competitive
  or better. When E is already Θ(V²), the matrix's O(V²) space is no worse
  asymptotically than the list's O(V + E) = O(V²), and you gain O(1) edge
  lookups and simpler code. Some algorithms (Floyd–Warshall all-pairs
  shortest paths, for one) are naturally expressed on a matrix.

Because the problems in this module are sparse and traversal-driven, the
rest of the module uses adjacency lists by default — and when a problem
gives you an edge list or a grid, the first step is almost always to build
one. The one recurring exception is a *dense complete graph* built from
points (the module's capstone, Min Cost to Connect All Points), where the
edge count is inherently Θ(V²) and the representation choice interacts with
the algorithm choice — we return to it there.

```quiz
{
  "questions": [
    {
      "question": "A graph has 100,000 vertices and 300,000 edges. Why is the adjacency list strongly preferred over the matrix here?",
      "options": [
        "This graph is sparse (E ≈ 3·10⁵ is tiny next to V² = 10¹⁰); the matrix would allocate 10¹⁰ cells — almost all zero — while the list uses O(V + E) ≈ 4·10⁵ entries, and traversals cost O(V + E) instead of O(V²)",
        "The matrix cannot represent graphs with more than 10,000 vertices — since matrix cells are typically allocated using a fixed-width integer type, vertex counts beyond that threshold would overflow the indexing scheme",
        "The list is always faster for every operation — since it avoids allocating unused cells for absent edges, the list representation outperforms the matrix on every single operation, including direct edge-existence lookups"
      ],
      "answer": 0,
      "explanation": "The matrix's O(V²) space is allocated regardless of how many edges actually exist. On a sparse graph almost every cell is wasted zero, and any full traversal pays O(V²) instead of the list's O(V + E). This gap is the entire reason sparse graphs use lists."
    },
    {
      "question": "Why does iterating over all neighbors of a vertex u cost O(V) on an adjacency matrix even when u has only two neighbors?",
      "options": [
        "Because the matrix stores neighbors in sorted order — maintaining that sorted order requires scanning the full row to find each non-zero cell's correct position relative to the others, which is what drives the O(V) cost",
        "The neighbors of u are scattered across row u as non-zero cells among V cells total; the matrix has no way to know which cells are non-zero without scanning the whole row — so it examines all V, most of them zero",
        "Because matrix rows are stored as linked lists internally — traversing a linked-list-backed row requires following each node's next pointer sequentially, which costs O(V) even when only a few cells actually hold non-zero values"
      ],
      "answer": 1,
      "explanation": "The matrix records adjacency by position, not by listing neighbors. To enumerate u's actual neighbors you must inspect every cell of its row and keep the non-zeros — O(V) work regardless of the true degree. The list, by contrast, physically stores only the real neighbors, so it iterates them in O(degree(u))."
    },
    {
      "question": "For which situation does the adjacency matrix's O(1) edge lookup genuinely earn its O(V²) space cost?",
      "options": [
        "Any graph, since O(1) lookups are always worth it — regardless of how sparse or dense the graph is, the guaranteed constant-time edge check justifies paying for the full V² grid of cells up front",
        "A sparse graph where you mostly traverse neighbors — since traversal-heavy workloads benefit from quick access to a vertex's connections, a sparse graph's smaller neighbor lists make the matrix's O(1) lookup especially valuable despite the space cost",
        "A dense graph (E already near V², so O(V²) space is no worse than the list's O(V + E) anyway) whose algorithm repeatedly asks 'is u directly adjacent to v?' rather than 'iterate u's neighbors'"
      ],
      "answer": 2,
      "explanation": "The matrix pays O(V²) space unconditionally, so it's only 'free' when the graph is already dense enough that O(V²) is unavoidable. Its O(1) edge-existence check then pays off — but only for algorithms dominated by adjacency queries, not neighbor iteration, which the list does better."
    }
  ]
}
```
