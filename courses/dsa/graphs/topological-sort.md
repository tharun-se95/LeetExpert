---
title: Topological Sort
type: concept
---

## Ordering things that depend on each other

Some tasks must happen before others. To take a course you must first take
its prerequisites; to build a source file you must first build the modules
it imports; to run a cell in a spreadsheet you must first compute the cells
it references. Even getting dressed has this shape: socks go on before
shoes, a shirt before a jacket, and no rule stops you from putting your
belt on before your shirt — those two just don't constrain each other at
all. Model each task as a vertex and each "A must come before B"
constraint as a directed edge A→B. A **topological sort** (or topological
ordering) is a linear ordering of all the vertices such that for every edge
A→B, A appears before B. Produce such an ordering and you have a valid
schedule: do the tasks in that order and no task ever runs before something
it depends on.

```diagram
{
  "id": "graph-representation",
  "vertexCount": 4,
  "edges": [
    { "from": 0, "to": 1 },
    { "from": 0, "to": 2 },
    { "from": 1, "to": 3 },
    { "from": 2, "to": 3 }
  ],
  "directed": true
}
```


## When is it even possible? Only for DAGs

A topological order does not always exist. Suppose A→B, B→C, and C→A. Any
valid order must put A before B (edge A→B), B before C (edge B→C), and C
before A (edge C→A) — so A must come before C which must come before A,
a contradiction. No ordering can satisfy all three. The obstruction is
exactly the **cycle** A→B→C→A: a cycle is a set of tasks each waiting on
the next, forming a loop with no possible starting point — a rule that
said "belt before pants, pants before shirt, shirt before belt" would
leave you unable to put on ANY of the three first, no matter where you
started.

So a topological sort is well-defined **if and only if the graph is a
DAG** — a **directed acyclic graph**. "Directed" because the constraints
have a direction (before/after); "acyclic" because any cycle makes ordering
impossible, as just shown. Every topological-sort algorithm therefore does
double duty: it produces an order *when one exists*, and it detects the
presence of a cycle *when one doesn't*. Both algorithms below make this
explicit.

## Kahn's algorithm — BFS by in-degree

A vertex with **in-degree zero** — no incoming edges — depends on nothing,
so it is safe to place first: your socks, your underwear, anything with
no prerequisite of its own. Kahn's algorithm builds the order by
repeatedly doing exactly that:

1. Compute each vertex's in-degree (number of incoming edges).
2. Put all in-degree-zero vertices in a queue — these have no unmet
   dependencies.
3. Repeatedly remove a vertex from the queue, append it to the output, and
   "delete" it by decrementing the in-degree of each vertex it points to.
   Any neighbor whose in-degree hits zero has now had all its dependencies
   placed, so enqueue it — putting your socks on is exactly what clears
   shoes' one dependency and makes shoes available to put on next.
4. When the queue empties, if every vertex made it into the output, that's
   a valid topological order. If some vertices never reached in-degree zero,
   they are caught in a cycle — no valid order exists.

````tabs
```python
from collections import deque

def topo_sort_kahn(num_vertices: int,
                   adj: list[list[int]]) -> list[int] | None:
    indegree = [0] * num_vertices
    for u in range(num_vertices):
        for v in adj[u]:
            indegree[v] += 1                # count incoming edges

    queue = deque(u for u in range(num_vertices) if indegree[u] == 0)
    order: list[int] = []
    while queue:
        u = queue.popleft()
        order.append(u)                     # u has no remaining dependencies
        for v in adj[u]:
            indegree[v] -= 1                # remove u's edge into v
            if indegree[v] == 0:            # v's last dependency just cleared
                queue.append(v)

    # If a cycle exists, its vertices never hit in-degree 0 and are missing.
    return order if len(order) == num_vertices else None
```

```typescript
function topoSortKahn(
  numVertices: number,
  adj: number[][],
): number[] | null {
  const indegree = new Array<number>(numVertices).fill(0);
  for (let u = 0; u < numVertices; u++) {
    for (const v of adj[u]) indegree[v]++; // count incoming edges
  }

  const queue: number[] = [];
  for (let u = 0; u < numVertices; u++) {
    if (indegree[u] === 0) queue.push(u);
  }

  const order: number[] = [];
  let head = 0;
  while (head < queue.length) {
    const u = queue[head++];
    order.push(u); // u has no remaining dependencies
    for (const v of adj[u]) {
      indegree[v]--; // remove u's edge into v
      if (indegree[v] === 0) queue.push(v); // v's last dependency cleared
    }
  }

  // If a cycle exists, its vertices never hit in-degree 0 and are missing.
  return order.length === numVertices ? order : null;
}
```
````

**Why the cycle check works.** Every vertex in the output was emitted only
after its in-degree reached zero, i.e. after every one of its predecessors
was already emitted — so the "A before B" property holds by construction.
And a vertex on a cycle can never reach in-degree zero: some predecessor on
the cycle is also stuck waiting, so neither is ever emitted. If the output
count is short of V, exactly the cycle-trapped vertices are missing — that
is the cycle detection, for free.

**Complexity.** Computing in-degrees scans every edge once: O(V + E).
Each vertex is enqueued and dequeued at most once (it hits in-degree zero
once), and each edge is used exactly once for its decrement. Total
**O(V + E)** time, **O(V)** space for the in-degree array and queue.

## DFS-based topological sort — postorder, reversed

The second algorithm uses depth-first search and a fact about *when DFS
finishes* a vertex. Run DFS; when a vertex's recursive call is about to
return — after the loop over all its neighbors has completed — append it to
a list. This is the **postorder** finish order. Then **reverse** that list.
The reversed postorder is a valid topological order.

````tabs
```python
def topo_sort_dfs(num_vertices: int,
                  adj: list[list[int]]) -> list[int] | None:
    WHITE, GRAY, BLACK = 0, 1, 2
    color = [WHITE] * num_vertices
    postorder: list[int] = []
    has_cycle = False

    def visit(u: int) -> None:
        nonlocal has_cycle
        color[u] = GRAY
        for v in adj[u]:
            if color[v] == GRAY:            # back edge into active path → cycle
                has_cycle = True
            elif color[v] == WHITE:
                visit(v)
        color[u] = BLACK
        postorder.append(u)                 # u finishes AFTER all descendants

    for start in range(num_vertices):
        if color[start] == WHITE:
            visit(start)

    if has_cycle:
        return None
    postorder.reverse()                     # dependencies now come first
    return postorder
```

```typescript
function topoSortDfs(
  numVertices: number,
  adj: number[][],
): number[] | null {
  const WHITE = 0,
    GRAY = 1,
    BLACK = 2;
  const color = new Array<number>(numVertices).fill(WHITE);
  const postorder: number[] = [];
  let hasCycle = false;

  function visit(u: number): void {
    color[u] = GRAY;
    for (const v of adj[u]) {
      if (color[v] === GRAY) {
        hasCycle = true; // back edge into active path → cycle
      } else if (color[v] === WHITE) {
        visit(v);
      }
    }
    color[u] = BLACK;
    postorder.push(u); // u finishes AFTER all descendants
  }

  for (let start = 0; start < numVertices; start++) {
    if (color[start] === WHITE) visit(start);
  }

  if (hasCycle) return null;
  postorder.reverse(); // dependencies now come first
  return postorder;
}
```
````

### Why reversed postorder is correct — a proof, not an assertion

The claim to prove: for every edge u→v, u appears before v in the reversed
postorder. Equivalently, u appears *after* v in the raw postorder — i.e.
**u finishes its DFS call later than v does.**

Take any edge u→v and look at the moment DFS processes that edge, while
inside `visit(u)`. When `visit(u)` reaches v in u's neighbor loop, v is in
one of two states (assuming no cycle, which we've separately detected):

- **v is white (unvisited).** Then `visit(u)` calls `visit(v)` right now.
  That recursive call runs to completion — fully finishing v and appending
  it to postorder — *before* control returns to u's loop, and u only
  finishes after its loop ends. So v is appended before u. ✓
- **v is black (already finished).** Then v was appended to postorder at
  some earlier time, and u has not finished yet (we're still inside its
  loop). So v is appended before u. ✓
- **v is gray (on the current stack)** would mean v is an ancestor of u
  and u→v closes a cycle. That case is exactly what the gray-edge check
  flags, and we return "no order" — so it can't occur in a successful run.

In both possible cases, v is appended to postorder before u. Since that
holds for *every* edge u→v, every vertex finishes after all vertices it
points to (all its descendants in the dependency sense). Reversing the
postorder therefore places every u before every v it has an edge to —
which is precisely the definition of a topological order. The key
structural fact powering this: **a vertex's DFS call cannot finish until
all vertices reachable from it have finished**, because those calls are
nested inside it. Reversing "finish order" turns "finishes last" into
"comes first," and dependencies (which finish later) land ahead of their
dependents.

```complexity
{
  "operations": [
    { "name": "Kahn's (BFS)", "time": "O(V + E)", "why": "in-degrees scan every edge once; each vertex enqueued/dequeued once, each edge decremented once" },
    { "name": "DFS-based", "time": "O(V + E)", "why": "a single DFS over the graph — each vertex entered once, each edge examined once" },
    { "name": "space, both", "time": "O(V)", "why": "in-degree array + queue (Kahn) or color array + recursion stack + output (DFS)" }
  ]
}
```

## Which to reach for

Both are O(V + E); the choice is stylistic and situational. Kahn's is
iterative (no recursion-depth limit to worry about on huge graphs) and its
queue naturally produces a "process things as their dependencies clear"
order that's easy to reason about — and it hands you the in-degree-zero
frontier, which some problems want directly. The DFS version is a tiny
addition to a traversal you already know and is convenient when you're
already doing DFS for other reasons. The two related problems in this
module lean on Kahn's: Course Schedule (does *any* valid order exist —
i.e. is the graph acyclic) and Course Schedule II (return an actual order).

```quiz
{
  "questions": [
    {
      "question": "Why is a topological ordering impossible exactly when the directed graph contains a cycle?",
      "options": [
        "Cycles are only a problem in undirected graphs — since undirected edges create an inherent two-way relationship that easily loops back on itself, while directed edges have a fixed direction that naturally prevents any such contradiction from arising",
        "A cycle A→B→…→A forces A before B before … before A — a contradiction, since no vertex can precede itself; with no cycle every 'before' constraint can be satisfied simultaneously",
        "Cycles make the graph too large to sort efficiently — since a cycle adds extra edges that must all be considered during the sort, the presence of a cycle pushes the algorithm's runtime past what's practical rather than making the ordering logically impossible"
      ],
      "answer": 1,
      "explanation": "Each edge is a strict 'before' constraint. A cycle chains these constraints back to their own start, demanding a vertex come before itself — logically impossible. Acyclicity is precisely the condition under which all the constraints are jointly satisfiable."
    },
    {
      "question": "In the DFS-based algorithm, why does reversing the postorder (finish order) yield a valid topological sort?",
      "options": [
        "Postorder already is a topological sort, so reversing just makes it descending — since the finish-order property already satisfies every 'before' constraint on its own, the reversal step is a cosmetic convenience rather than something correctness depends on",
        "Reversing is a heuristic that usually works but can fail on some DAGs — since postorder's finish times don't always perfectly track dependency structure, certain DAG shapes can produce a reversed order that violates one or more edge constraints",
        "For any edge u→v, v's DFS call always finishes before u's — because v is either recursed into and completed inside u's loop, or already finished when u reaches it — so u finishes later than every vertex it points to; reversing finish order puts those later-finishing dependencies first"
      ],
      "answer": 2,
      "explanation": "The load-bearing fact is that a vertex can't finish until everything reachable from it has finished (those calls are nested inside it). So along every edge u→v, v finishes first; reversing turns 'u finishes last' into 'u comes first,' satisfying every edge constraint."
    },
    {
      "question": "In Kahn's algorithm, how does the same run that produces an ordering also detect a cycle?",
      "options": [
        "It counts edges and compares to vertices — the algorithm tallies the total number of edges processed during the run and checks whether that total matches an expected count derived from the vertex count, flagging a mismatch as a cycle",
        "A vertex is emitted only when its in-degree reaches zero (all predecessors already emitted); vertices trapped in a cycle always have an unemitted predecessor on the cycle, so they never reach in-degree zero — if the output count is less than V, exactly those cycle-bound vertices are missing",
        "It runs a separate DFS afterwards to check for cycles — after Kahn's algorithm finishes producing whatever order it can, a second, independent depth-first traversal is performed specifically to look for back edges that indicate a cycle"
      ],
      "answer": 1,
      "explanation": "Reaching in-degree zero requires all predecessors to have been placed. On a cycle that never happens — each waits on the next around the loop — so cycle vertices are exactly the ones absent from the output. A short output count is the cycle signal, obtained for free."
    }
  ]
}
```
