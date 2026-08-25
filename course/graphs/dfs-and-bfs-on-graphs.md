---
title: DFS & BFS on Graphs
type: concept
---

## The one thing trees let you assume that graphs don't

Module 17 built depth-first and breadth-first traversal on trees, and the
code was clean because trees hand you a guarantee: there is exactly one
path from the root to any node, and following child pointers can never
bring you back somewhere you've already been. A tree has no cycles by
definition. A general graph has none of that safety. From a vertex you may
reach a neighbor that can reach *back* to you — directly, or around a long
loop. Run tree DFS unmodified on a graph with a cycle and it recurses
forever, revisiting the same vertices endlessly.

Picture exploring a dark network of tunnels with a piece of chalk. Every
time you step into a new junction, you mark it with a chalk X before
going any further. Whenever a tunnel leads to a junction that's already
marked, you don't walk down it — you already know what's there, and
following it again would just send you back into tunnels you've already
mapped, possibly forever if the tunnels loop back on themselves.

So the single new ingredient this lesson adds is a **visited set**: a
record of which vertices the traversal has already entered, checked before
entering any vertex so that no vertex is processed twice. On a tree the
visited set is redundant (you can never revisit anyway); on a graph it is
load-bearing — remove it and the algorithm doesn't just get slow, it fails
to terminate. Everything else — the recursion for DFS, the queue for BFS —
carries over from Module 17 essentially unchanged.

```diagram
{
  "id": "graph-layers",
  "caption": "BFS layers from source 0 · DFS would go deep on one path first"
}
```


## DFS on a graph

Depth-first search goes as deep as it can down one path before backing up.
The structure is identical to tree DFS with one guard: mark a vertex
visited when you enter it, and never enter a visited vertex.

````tabs
```python
def dfs(adj: list[list[int]], start: int) -> list[int]:
    visited = [False] * len(adj)
    order: list[int] = []

    def visit(u: int) -> None:
        visited[u] = True          # mark BEFORE recursing — this is the guard
        order.append(u)
        for v in adj[u]:
            if not visited[v]:      # skip anything already entered
                visit(v)

    visit(start)
    return order

# Iterative form, if recursion depth is a concern (deep graphs).
def dfs_iterative(adj: list[list[int]], start: int) -> list[int]:
    visited = [False] * len(adj)
    order: list[int] = []
    stack = [start]
    while stack:
        u = stack.pop()
        if visited[u]:
            continue
        visited[u] = True
        order.append(u)
        for v in adj[u]:
            if not visited[v]:
                stack.append(v)
    return order
```

```typescript
function dfs(adj: number[][], start: number): number[] {
  const visited = new Array<boolean>(adj.length).fill(false);
  const order: number[] = [];

  function visit(u: number): void {
    visited[u] = true; // mark BEFORE recursing — this is the guard
    order.push(u);
    for (const v of adj[u]) {
      if (!visited[v]) visit(v); // skip anything already entered
    }
  }

  visit(start);
  return order;
}

// Iterative form, if recursion depth is a concern (deep graphs).
function dfsIterative(adj: number[][], start: number): number[] {
  const visited = new Array<boolean>(adj.length).fill(false);
  const order: number[] = [];
  const stack: number[] = [start];
  while (stack.length > 0) {
    const u = stack.pop()!;
    if (visited[u]) continue;
    visited[u] = true;
    order.push(u);
    for (const v of adj[u]) {
      if (!visited[v]) stack.push(v);
    }
  }
  return order;
}
```
````

## BFS on a graph

Breadth-first search explores in rings: all vertices at distance 1 from
the start, then all at distance 2, and so on. It uses a FIFO queue (the
queue from Module 9). The critical detail on graphs: mark a vertex visited
**when you enqueue it, not when you dequeue it**. If you wait until dequeue
to mark, the same vertex can be enqueued many times by different neighbors
before it's ever processed, which reinflates the work and can blow up the
queue.

Watch it happen on a small diamond: `0 → 1`, `0 → 2`, `1 → 3`, `2 → 3`.
Mark-at-dequeue (the wrong version): dequeue `0`, mark it visited, enqueue
`1` and `2` — queue is `[1, 2]`. Dequeue `1`; not yet marked, so mark it
and enqueue its neighbor `3` — queue is `[2, 3]`. Dequeue `2`; also not
yet marked, so mark it and enqueue `3` *again* — queue is `[3, 3]`, with
two separate entries for the same vertex. `3` gets dequeued and processed
twice before the duplicate is ever caught. Mark-at-enqueue (the correct
version): enqueue and mark `0`. Dequeue `0`, see `1` and `2` are
unmarked, mark *and* enqueue both — queue is `[1, 2]`. Dequeue `1`, see
`3` is unmarked, mark and enqueue it — queue is `[2, 3]`. Dequeue `2`,
check `3` — already marked (from `1`'s turn) — skip it, nothing enqueued.
`3` enters the queue exactly once, no matter how many different vertices
point to it.

````tabs
```python
from collections import deque

def bfs(adj: list[list[int]], start: int) -> list[int]:
    visited = [False] * len(adj)
    order: list[int] = []
    queue = deque([start])
    visited[start] = True          # mark on ENQUEUE, not on dequeue
    while queue:
        u = queue.popleft()
        order.append(u)
        for v in adj[u]:
            if not visited[v]:
                visited[v] = True   # so v is never enqueued twice
                queue.append(v)
    return order
```

```typescript
function bfs(adj: number[][], start: number): number[] {
  const visited = new Array<boolean>(adj.length).fill(false);
  const order: number[] = [];
  const queue: number[] = [start];
  visited[start] = true; // mark on ENQUEUE, not on dequeue
  let head = 0;
  while (head < queue.length) {
    const u = queue[head++];
    order.push(u);
    for (const v of adj[u]) {
      if (!visited[v]) {
        visited[v] = true; // so v is never enqueued twice
        queue.push(v);
      }
    }
  }
  return order;
}
```
````

**Complexity, both traversals.** Each vertex is entered at most once (the
visited guard), and from each entered vertex the loop iterates its
neighbor list exactly once. Summed over all vertices, the neighbor loops
touch each edge entry once, which is O(E) (O(2E) on an undirected list,
still O(E)). Adding the O(V) to account for every vertex once:
**O(V + E)** time, and **O(V)** space for the visited set plus the
stack/queue. This is why the adjacency list matters so much — the same
traversal on a matrix would be O(V²), from the previous lesson's argument.

```complexity
{
  "time": "O(V + E)",
  "space": "O(V)",
  "why": "Each vertex is entered once (visited guard), and each entered vertex iterates its neighbor list once — summed, that touches every edge once, O(E). The O(V) covers visiting every vertex and the visited set / frontier storage."
}
```

## What a graph traversal is good for: connected components

One DFS or BFS from a start vertex reaches exactly the vertices reachable
from that start — its **connected component**. To handle a graph that may
be in several disconnected pieces, loop over all vertices and launch a
fresh traversal from any not-yet-visited one. Each launch discovers one
whole component, so the number of launches is the number of components:

````tabs
```python
def count_components(adj: list[list[int]]) -> int:
    visited = [False] * len(adj)
    count = 0

    def visit(u: int) -> None:
        visited[u] = True
        for v in adj[u]:
            if not visited[v]:
                visit(v)

    for start in range(len(adj)):
        if not visited[start]:
            count += 1          # a new, previously-unreached component
            visit(start)        # absorb all of it
    return count
```

```typescript
function countComponents(adj: number[][]): number {
  const visited = new Array<boolean>(adj.length).fill(false);
  let count = 0;

  function visit(u: number): void {
    visited[u] = true;
    for (const v of adj[u]) {
      if (!visited[v]) visit(v);
    }
  }

  for (let start = 0; start < adj.length; start++) {
    if (!visited[start]) {
      count++; // a new, previously-unreached component
      visit(start); // absorb all of it
    }
  }
  return count;
}
```
````

The outer loop still runs in O(V + E) total: every vertex and edge is
touched once across all the traversals combined, because the shared
visited array prevents any re-entry. This is exactly the Number of
Provinces problem later in the module.

## Cycle detection — and why direction changes everything

A traversal can also detect whether a graph contains a cycle. The correct
check is **different for undirected and directed graphs**, and the reason
is worth understanding precisely, because it's a common source of wrong
solutions.

### Undirected: a back edge to a visited non-parent

Run DFS, and pass along which vertex you came *from* (the parent). If you
reach a neighbor that is already visited **and is not the parent you just
came from**, you've found a second, independent way to reach that vertex —
that is a cycle.

Why exclude the parent? On an undirected graph the edge you just traversed,
u→v, also exists as v→u (the list stores it both ways). Standing at v, you
will see u in v's neighbor list and u is already visited — but that's not a
cycle, it's just the edge you arrived on, looked at backwards. Excluding
the immediate parent filters out exactly that false alarm; any *other*
visited neighbor is a genuine cycle.

````tabs
```python
def has_cycle_undirected(adj: list[list[int]]) -> bool:
    visited = [False] * len(adj)

    def visit(u: int, parent: int) -> bool:
        visited[u] = True
        for v in adj[u]:
            if not visited[v]:
                if visit(v, u):
                    return True
            elif v != parent:      # visited AND not where we came from → cycle
                return True
        return False

    for start in range(len(adj)):
        if not visited[start]:
            if visit(start, -1):
                return True
    return False
```

```typescript
function hasCycleUndirected(adj: number[][]): boolean {
  const visited = new Array<boolean>(adj.length).fill(false);

  function visit(u: number, parent: number): boolean {
    visited[u] = true;
    for (const v of adj[u]) {
      if (!visited[v]) {
        if (visit(v, u)) return true;
      } else if (v !== parent) {
        // visited AND not where we came from → cycle
        return true;
      }
    }
    return false;
  }

  for (let start = 0; start < adj.length; start++) {
    if (!visited[start] && visit(start, -1)) return true;
  }
  return false;
}
```
````

### Directed: why the undirected check is wrong, and the fix

On a directed graph the "back edge to any visited node" idea breaks. Here
is the concrete failure: consider edges A→B, A→C, B→C. Start DFS at A, go
A→B, then B→C, finishing C; back up and from A also try A→C — but C is
already visited. The undirected-style check would call that a cycle. It is
not: there is no directed path from C back to A. C was simply reached by
two different forward routes, which is perfectly legal in a directed
acyclic graph (a "diamond").

The distinction the directed case needs: a cycle exists only when you find
an edge pointing to a vertex that is **currently still on the DFS recursion
stack** — an ancestor of the current vertex in the active exploration path,
meaning there's a path from that vertex down to you *and* a direct edge
from you back up to it. An edge to a vertex that was visited but has
already *finished* (left the stack) is fine. This is the **three-color**
technique:

- **White** — not yet visited.
- **Gray** — visited and currently on the recursion stack (in progress).
- **Black** — visited and fully finished (all descendants explored, popped
  off the stack).

An edge to a **gray** vertex is a back edge to an active ancestor → cycle.
An edge to a **black** vertex is a cross/forward edge → not a cycle.

````tabs
```python
WHITE, GRAY, BLACK = 0, 1, 2

def has_cycle_directed(adj: list[list[int]]) -> bool:
    color = [WHITE] * len(adj)

    def visit(u: int) -> bool:
        color[u] = GRAY            # u is now on the active recursion stack
        for v in adj[u]:
            if color[v] == GRAY:   # edge into the active path → cycle
                return True
            if color[v] == WHITE and visit(v):
                return True
        color[u] = BLACK           # u finished: off the stack, safe forever
        return False

    for start in range(len(adj)):
        if color[start] == WHITE:
            if visit(start):
                return True
    return False
```

```typescript
const WHITE = 0,
  GRAY = 1,
  BLACK = 2;

function hasCycleDirected(adj: number[][]): boolean {
  const color = new Array<number>(adj.length).fill(WHITE);

  function visit(u: number): boolean {
    color[u] = GRAY; // u is now on the active recursion stack
    for (const v of adj[u]) {
      if (color[v] === GRAY) return true; // edge into the active path → cycle
      if (color[v] === WHITE && visit(v)) return true;
    }
    color[u] = BLACK; // u finished: off the stack, safe forever
    return false;
  }

  for (let start = 0; start < adj.length; start++) {
    if (color[start] === WHITE && visit(start)) return true;
  }
  return false;
}
```
````

Trace the colors through the earlier A→B, A→C, B→C example (A=0, B=1,
C=2). `visit(0)`: color[0] → GRAY. Loop reaches neighbor 1 (white), so
`visit(1)` runs: color[1] → GRAY. `visit(1)`'s loop reaches neighbor 2
(white), so `visit(2)` runs: color[2] → GRAY, has no neighbors, finishes
immediately: color[2] → BLACK. Back in `visit(1)`, its loop is done, so
it finishes: color[1] → BLACK. Back in `visit(0)`, its loop continues to
neighbor 2 — color[2] is BLACK, not gray, so this is a cross edge, not a
cycle, and the loop just moves on. `visit(0)` finishes: color[0] →
BLACK. No cycle reported, correctly — the second visit to `2` found it
already *finished*, not still active on the stack.

The gray set is exactly "vertices on the current recursion stack." That is
the piece the undirected check lacks: undirected cycle detection only needs
"have I seen this before, other than my parent," because in an undirected
graph any previously-seen vertex genuinely reachable again *is* a loop. In
a directed graph, "seen before" splits into "still on my path" (a real
cycle) versus "seen on some earlier, already-completed path" (not a cycle),
and only the color distinction separates them. Course Schedule, later in
this module, is precisely this directed check applied to a prerequisites
graph.

```quiz
{
  "questions": [
    {
      "question": "Why is a `visited` set optional on a tree traversal but load-bearing on a general graph traversal?",
      "options": [
        "Graphs are larger than trees, so the set saves memory — since graphs typically have more vertices and edges than trees of comparable depth, tracking visited nodes becomes primarily a memory-management concern rather than a correctness one",
        "A tree has exactly one path to each node and no cycles, so a traversal can never return to a node it's already left; a general graph can have cycles, so without a visited guard the traversal re-enters nodes endlessly and never terminates",
        "The set makes graph traversal faster but is not required for correctness — without it the traversal would just redundantly re-explore some vertices, adding extra time but still eventually terminating with the right answer"
      ],
      "answer": 1,
      "explanation": "The visited set is what replaces the tree's structural no-cycles guarantee. On a tree there's nothing to guard against; on a graph, removing the guard doesn't merely slow things down — a cycle makes the traversal loop forever."
    },
    {
      "question": "In undirected cycle detection, why must the check ignore an edge back to the immediate parent?",
      "options": [
        "The parent is never actually visited yet at that point — since the parent's visited flag hasn't been set when its child begins exploring neighbors, checking against it would incorrectly treat the parent as unvisited rather than as a special case to skip",
        "An undirected edge u–v is stored in both directions; standing at v you'll see the visited vertex u, but that's just the edge you arrived on viewed backwards, not a second route — only a visited neighbor OTHER than the parent represents a genuine independent path forming a cycle",
        "Parents are always the cause of cycles, so ignoring them prevents false positives everywhere — since the parent-child edge is structurally the most common source of an apparent cycle, filtering out parent references catches essentially every case that would otherwise misfire"
      ],
      "answer": 1,
      "explanation": "The reverse copy of the traversed edge always makes the parent appear as a visited neighbor. That single case is the one false alarm to filter out; any other visited neighbor is a real cycle."
    },
    {
      "question": "For directed graphs, why isn't 'edge to any already-visited vertex' a correct cycle test — what does the three-color method add?",
      "options": [
        "The three-color method is just an optimization that runs faster — using three states instead of a single visited flag reduces the number of comparisons needed per edge, which is why it's preferred on large directed graphs",
        "It isn't different; directed and undirected use the same test — since both cases involve checking whether a neighbor has already been visited, the direction of the edges doesn't actually change what the check needs to verify",
        "In a directed graph you can reach the same vertex by two separate forward paths (a diamond like A→B, A→C, B→C) without any cycle; a cycle requires an edge back to a vertex still ON the current recursion stack (gray), whereas an edge to an already-finished vertex (black) is harmless — the colors distinguish these two kinds of 'already visited'"
      ],
      "answer": 2,
      "explanation": "'Already visited' conflates two situations in a directed graph: still-on-the-active-path (gray, a real cycle) versus visited-on-a-completed-earlier-path (black, fine, e.g. the diamond's shared node C). Only tracking the recursion stack via the gray color separates them correctly."
    }
  ]
}
```
