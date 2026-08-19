---
title: Number of Provinces
type: problem
---

## Problem

There are `n` cities. `isConnected` is an `n × n` matrix where
`isConnected[i][j] = 1` if city `i` and city `j` are directly connected,
`0` otherwise (this is a graph given as an **adjacency matrix**, and the
"direct connection" relation is symmetric — undirected). A **province**
is a group of directly-or-indirectly connected cities. Return the total
number of provinces. (LeetCode 547.)

**Examples**

```examples
isConnected = [[1,1,0],[1,1,0],[0,0,1]] → 2
isConnected = [[1,0,0],[0,1,0],[0,0,1]] → 3
```

```constraint
`1 ≤ n ≤ 200`.
```

## Attempt it first

Strip away the "cities and provinces" framing: this is asking for the
number of **connected components** in an undirected graph — a question
this module has two entirely different correct tools for. Before opening
anything, solve it with the traversal approach from the DFS & BFS
concept lesson (visit an unvisited node, flood-fill mark its whole
component, increment a counter, repeat). Then, separately, work out how
Union-Find would answer the exact same question, so you can compare both
approaches on the same problem below.

```sandbox
{
  "id": "number-of-provinces",
  "fn": {
    "python": "find_circle_num",
    "javascript": "findCircleNum"
  },
  "check": "return",
  "starter": {
    "python": "def find_circle_num(is_connected):\n    # Return how many provinces the adjacency matrix describes.\n    pass\n",
    "javascript": "function findCircleNum(isConnected) {\n  // Return how many provinces the adjacency matrix describes.\n}\n"
  },
  "cases": [
    {
      "args": [
        [
          [
            1,
            1,
            0
          ],
          [
            1,
            1,
            0
          ],
          [
            0,
            0,
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
            1,
            0,
            0
          ],
          [
            0,
            1,
            0
          ],
          [
            0,
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
            1
          ]
        ]
      ],
      "expect": 1
    },
    {
      "args": [
        [
          [
            1,
            1
          ],
          [
            1,
            1
          ]
        ]
      ],
      "expect": 1
    },
    {
      "args": [
        [
          [
            1,
            0,
            0,
            1
          ],
          [
            0,
            1,
            1,
            0
          ],
          [
            0,
            1,
            1,
            0
          ],
          [
            1,
            0,
            0,
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
            1,
            1,
            0
          ],
          [
            1,
            1,
            1
          ],
          [
            0,
            1,
            1
          ]
        ]
      ],
      "expect": 1
    }
  ]
}
```

````reveal Hint — two entirely different, both-correct tools
**DFS/BFS approach:** scan every city; whenever an unvisited city is
found, that's a new province — flood-fill (DFS or BFS) from it, marking
every city reachable via a direct-connection edge as visited, so they're
never counted again.

**Union-Find approach:** for every pair (i, j) with `isConnected[i][j]
== 1`, `union(i, j)`. After processing the whole matrix, the number of
DISTINCT roots (`find(i)` values) among all cities is the number of
provinces — cities that ended up under the same root are, by
construction, in the same connected component.
````

## Solution: DFS/BFS traversal

`````reveal Solution A — flood-fill each unvisited city
````tabs
```python
def find_circle_num_dfs(is_connected: list[list[int]]) -> int:
    n = len(is_connected)
    visited = [False] * n

    def dfs(city: int) -> None:
        visited[city] = True
        for neighbor in range(n):
            if is_connected[city][neighbor] == 1 and not visited[neighbor]:
                dfs(neighbor)

    provinces = 0
    for city in range(n):
        if not visited[city]:
            provinces += 1          # a fresh, unclaimed city = a new province
            dfs(city)                # claim its entire connected component
    return provinces
```

```typescript
function findCircleNumDfs(isConnected: number[][]): number {
  const n = isConnected.length;
  const visited = new Array(n).fill(false);

  function dfs(city: number): void {
    visited[city] = true;
    for (let neighbor = 0; neighbor < n; neighbor++) {
      if (isConnected[city][neighbor] === 1 && !visited[neighbor]) {
        dfs(neighbor);
      }
    }
  }

  let provinces = 0;
  for (let city = 0; city < n; city++) {
    if (!visited[city]) {
      provinces++; // a fresh, unclaimed city = a new province
      dfs(city); // claim its entire connected component
    }
  }
  return provinces;
}
```
````

This is structurally identical to Number of Islands (Module 15) — the
same "scan for unvisited, flood-fill claim the whole component,
increment a counter" skeleton, with an adjacency matrix's row lookup
standing in for a grid's direction-vector neighbor check.

```complexity
{
  "time": "O(n²)",
  "space": "O(n)",
  "why": "The outer scan is O(n); each city's DFS scans its full matrix row, O(n) per call, and every city is DFS'd at most once total across the whole run — so overall it's O(n) rows × O(n) per row = O(n²), which is unavoidable since simply reading the n×n input matrix is already O(n²). Space is the visited array plus O(n) recursion depth worst case."
}
```
`````

`````reveal Solution B — Union-Find over the matrix's edges
````tabs
```python
def find_circle_num_union_find(is_connected: list[list[int]]) -> int:
    n = len(is_connected)
    uf = UnionFind(n)          # from the Union-Find concept lesson

    for i in range(n):
        for j in range(i + 1, n):              # upper triangle — matrix is symmetric
            if is_connected[i][j] == 1:
                uf.union(i, j)

    roots = {uf.find(city) for city in range(n)}
    return len(roots)
```

```typescript
function findCircleNumUnionFind(isConnected: number[][]): number {
  const n = isConnected.length;
  const uf = new UnionFind(n); // from the Union-Find concept lesson

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      // upper triangle — matrix is symmetric
      if (isConnected[i][j] === 1) {
        uf.union(i, j);
      }
    }
  }

  const roots = new Set<number>();
  for (let city = 0; city < n; city++) roots.add(uf.find(city));
  return roots.size;
}
```
````

Iterating only the upper triangle (`j` starting at `i + 1`) avoids
redundant work: the matrix is symmetric (`isConnected[i][j] ==
isConnected[j][i]`) since the connection relation is undirected, so
processing each pair once is sufficient — `union` is idempotent anyway
(unioning an already-same-root pair is a no-op), but skipping the
redundant half avoids the wasted calls entirely.

```complexity
{
  "time": "O(n² · α(n)) ≈ O(n²)",
  "space": "O(n)",
  "why": "Scanning the upper triangle of the matrix is O(n²), unavoidable for the same input-reading reason as the DFS approach. Each union/find call is O(α(n)) — effectively O(1) — so the α(n) factor is negligible in practice, making this also effectively O(n²), the same as DFS/BFS for this particular input format."
}
```
`````

## Comparing the two approaches directly

On THIS problem, both run in effectively O(n²) — the matrix itself is
n² cells, so reading the input dominates either way, and Union-Find's
near-constant operations don't beat DFS/BFS's asymptotic bound here.
The real reason to know both: **Union-Find shines when connectivity
must be tracked INCREMENTALLY** — e.g. edges arriving one at a time in a
stream, with "how many components right now?" queried after each
addition — a scenario where re-running DFS/BFS from scratch after every
single edge would be far more expensive than Union-Find's near-O(1)
incremental updates. For a single, one-shot "count the components of a
static graph" question like this one, either tool is a reasonable
choice; DFS/BFS is often the more familiar default, while Union-Find is
the one that generalizes to Redundant Connection (next lesson), where
incrementality is exactly what's needed.

## Variants

- **Number of Islands** (Module 15): the grid-shaped sibling of this
  exact "count connected components" question — same DFS/BFS skeleton,
  adjacency defined by grid neighbors instead of an explicit matrix.
- **Redundant Connection** (next lesson): where Union-Find's
  INCREMENTAL nature (processing edges one at a time, querying
  connectivity as you go) is not just an alternative but the natural
  fit, unlike this problem's one-shot count.
- **Union-Find (Disjoint Set)** (concept lesson, this module): the full
  derivation of the structure used in Solution B.

```quiz
{
  "question": "On this specific problem (a static adjacency matrix, one-shot component count), both the DFS/BFS and Union-Find solutions run in effectively the same O(n²). Given that, what is the actual reason to prefer Union-Find over DFS/BFS in OTHER problems, if not raw speed here?",
  "options": [
    "There is no real reason — DFS/BFS should always be preferred when both are equally fast, since it's the more commonly taught technique and sticking with one traversal-based approach keeps a codebase simpler",
    "Union-Find's advantage is in INCREMENTAL scenarios — when edges arrive one at a time (e.g. a stream) and connectivity must be queried repeatedly as the graph grows — where its near-O(1) amortized union/find operations avoid re-running a full O(V+E) traversal from scratch after every single new edge, which DFS/BFS would otherwise require",
    "Union-Find uses less memory than DFS/BFS in every case — since it only stores a flat parent array rather than a visited array plus recursion stack, Union-Find's memory footprint is unconditionally smaller regardless of the problem's access pattern"
  ],
  "answer": 1,
  "explanation": "The two tools solve overlapping but not identical problems well. DFS/BFS is naturally suited to a graph given all at once, needing one full traversal. Union-Find is naturally suited to a graph that CHANGES over time (edges added incrementally) with connectivity queries interleaved — its whole design (near-constant find/union) is optimized for exactly that pattern, which a from-scratch traversal after every edge would handle far more expensively. On a static, one-shot problem like this one, that advantage simply doesn't come into play, which is why both perform similarly here."
}
```
