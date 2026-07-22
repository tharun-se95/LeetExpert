---
title: Redundant Connection
type: problem
---

## Problem

A tree with `n` nodes originally had exactly `n - 1` edges (no cycles).
One EXTRA edge was added, creating exactly one cycle. Given the list of
`n` edges (as `[u, v]` pairs, in the order they were added), find the
one edge that, if removed, restores the graph to a tree. If multiple
such edges could work, return the one that appears LAST in the input.
(LeetCode 684.)

**Examples**

```text
edges = [[1,2],[1,3],[2,3]]  →  [2,3]
   (1-2 and 1-3 already connect all three nodes into a tree;
    2-3 is the extra edge that creates the cycle 1-2-3-1)
```

**Constraints:** `n` nodes, exactly `n` edges (one more than a tree
needs), no self-loops or duplicate edges.

## Attempt it first

Since the input is a TREE plus exactly one extra edge, exactly one edge
in the list — when added — will connect two nodes that were ALREADY
connected by the edges before it. That edge is both the cause of the
cycle and the answer. Before opening anything, think about how you'd
detect, incrementally, edge by edge in input order, "were these two
endpoints already connected before this edge was added" — and why
Union-Find's `find` operation answers exactly that question in near-O(1)
per edge, without needing a separate detection pass.

````reveal Hint — process edges in order; the first "already connected" edge is the answer
Process edges one at a time, in the given order, using Union-Find. For
each edge `(u, v)`: check `find(u) == find(v)` BEFORE unioning. If
they're already equal, `u` and `v` were already connected by some
combination of earlier edges — adding this edge creates a cycle, and
since edges are processed in input order, this is guaranteed to be the
LAST such edge relative to everything processed so far (there's only
ever exactly one cycle-creating edge in this problem, by the problem's
own guarantee, but Union-Find naturally reports whichever one appears
last if you don't stop early — which matters for the tie-breaking rule).
If they're not yet connected, `union(u, v)` and move to the next edge.
````

## Why plain DFS cycle detection is awkward here, by comparison

The DFS & BFS concept lesson's cycle detection (checking for a back edge
to an already-visited, non-parent node) works on a FIXED, fully-built
graph — you build the whole adjacency list first, then run one DFS over
it. This problem's structure is naturally INCREMENTAL: edges arrive one
at a time, and the answer is defined by which specific edge, when added,
FIRST created a cycle. Detecting that with DFS would mean re-running
cycle detection from scratch after adding each new edge (expensive,
O(n) per check, O(n²) total) — precisely the scenario the previous
lesson named as Union-Find's strength: connectivity queries interleaved
with incremental edge additions.

## The insight

Union-Find directly answers "are u and v already connected" in near-O(1)
via two `find` calls, BEFORE committing to `union`. Because this problem
guarantees the input is a tree plus exactly one extra edge, there is
exactly one point in the scan where `find(u) == find(v)` fires — that
edge is provably the one whose removal restores a tree, and it's found
directly, in one linear pass over the edges, with no separate detection
pass required.

## Solution

`````reveal Solution — Union-Find, return the first edge that connects an already-connected pair
````tabs
```python
def find_redundant_connection(edges: list[list[int]]) -> list[int]:
    n = len(edges)
    uf = UnionFind(n + 1)          # nodes are 1-indexed in this problem

    for u, v in edges:
        if uf.find(u) == uf.find(v):
            return [u, v]           # u, v already connected — THIS edge is redundant
        uf.union(u, v)

    return []                       # unreachable given the problem's guarantee
```

```typescript
function findRedundantConnection(edges: number[][]): number[] {
  const n = edges.length;
  const uf = new UnionFind(n + 1); // nodes are 1-indexed in this problem

  for (const [u, v] of edges) {
    if (uf.find(u) === uf.find(v)) {
      return [u, v]; // u, v already connected — THIS edge is redundant
    }
    uf.union(u, v);
  }

  return []; // unreachable given the problem's guarantee
}
```
````

The check `find(u) == find(v)` happens BEFORE the union — this ordering
is what makes the check meaningful: it's asking "were these two nodes
ALREADY in the same component from earlier edges," not "are they
connected after including this edge" (which would trivially always be
true once unioned). Because the scan processes edges strictly in the
given order and returns immediately on the first detected redundancy,
the result is automatically the one that appears LAST among all edges
that could be removed to fix the cycle, satisfying the tie-break rule
without any extra logic.

```complexity
{
  "time": "O(n · α(n)) ≈ O(n)",
  "space": "O(n)",
  "why": "Each of the n edges triggers exactly one find-pair check and at most one union, each O(α(n)) amortized (Union-Find concept lesson) — effectively O(1) per edge, O(n) total. Space is the Union-Find parent/size arrays, O(n)."
}
```
`````

## Variants

- **Redundant Connection II** (LeetCode 685, not covered): the DIRECTED
  version — a rooted tree plus one extra directed edge, which can create
  either a cycle OR a node with two parents (violating "tree"), requiring
  extra casework beyond plain Union-Find.
- **Number of Provinces** (previous lesson): the "count how many
  components total" question — a ONE-SHOT count over a static graph,
  contrasted with this problem's INCREMENTAL "which edge, added in
  order, first created a cycle" question — the comparison that motivates
  when Union-Find's incremental strength actually matters.
- **Minimum Spanning Trees** (concept lesson, this module): Kruskal's
  algorithm uses the exact same `find(u) == find(v)` check, for the
  opposite purpose — there, an edge creating a cycle is correctly
  SKIPPED (not wanted in the MST); here, that exact edge is what's being
  searched for.

```quiz
{
  "question": "The solution checks find(u) == find(v) BEFORE calling union(u, v) for each edge. Why would checking AFTER the union (i.e., always union first, then somehow check) fail to correctly identify the redundant edge?",
  "options": [
    "Once union(u, v) has been called, u and v are made to share the same root by definition — checking find(u) == find(v) AFTER that point would always be true regardless of whether they were already connected beforehand, destroying the very distinction (already-connected vs. newly-connected) the check exists to detect",
    "Checking after the union would only cause a performance problem, not an incorrect result — merging first and then checking would still eventually converge on the correct redundant edge, just after doing some avoidable extra union work",
    "Checking after would work identically, since union is a symmetric operation — because union(u, v) treats its two arguments interchangeably, performing it before or after the equality check shouldn't change what that check reports"
  ],
  "answer": 0,
  "explanation": "The entire signal this algorithm relies on is the state of connectivity BEFORE the current edge is incorporated. union(u, v) unconditionally merges u's and v's components (or does nothing if they're already merged) — so testing find equality afterward can never distinguish 'these were already connected' from 'this union just connected them,' since both cases look identical once the union has executed. The check must happen first specifically to observe the graph's state as it existed just before this edge was considered."
}
```
