# Family 6 — Relationships Cheat Sheets

One-page refreshers. Depth lives in Part 2; use these the night before.

---

## BFS

**Recognition:** level order, shortest path unweighted, rotting oranges, word ladder, multi-source flood  
**Complexity:** Time O(V + E) or O(R·C) · Space O(V) queue + visited  
**Data Structure:** Queue + visited (± distance array) — explore layer by layer like ripples in a pond  
**Difficulty:** Easy–Hard · **Interview Frequency:** Very High

### Template

```pseudo
queue = all sources
dist[source] = 0
mark sources visited
while queue not empty:
    u = dequeue()
    for v in neighbors(u):
        if not visited(v):
            visited(v) = true
            dist[v] = dist[u] + 1
            enqueue(v)
```

### Common Questions

- Binary Tree Level Order · Rotting Oranges · Shortest Path in Binary Matrix · Open the Lock · Word Ladder

### Common Mistakes

- Using DFS for shortest unweighted paths
- Marking visited too late → duplicate enqueue blowups

---

## Graph Traversal

**Recognition:** build adj list, connected components, bipartite, path exists, choose DFS vs BFS  
**Complexity:** Time O(V + E) · Space O(V + E) for adj + visited  
**Data Structure:** Adjacency list / matrix + visited (templates: BFS / Family 4 DFS)  
**Difficulty:** Easy–Medium · **Interview Frequency:** High

### Template

```pseudo
adj = map node → list
for (u, v) in edges:
    adj[u].append(v)
    # if undirected: adj[v].append(u)

visited = set()
for start in nodes:
    if start not in visited:
        # dfs(start) or bfs(start) — pick by need (deep vs shortest hops)
```

### Common Questions

- Find if Path Exists · Clone Graph · Is Graph Bipartite · Number of Connected Components · Keys and Rooms

### Common Mistakes

- Undirected edge missing the reverse adj entry
- Sparse graph stored as a dense matrix

---

## Union Find (Disjoint Set)

**Recognition:** provinces, redundant connection, accounts merge, valid tree, Kruskal edge accept  
**Complexity:** Time ~O(α(n)) per op with compression + rank · Space O(n)  
**Data Structure:** Parent (± rank) arrays — which kids are on the same team  
**Difficulty:** Medium · **Interview Frequency:** High

### Template

```pseudo
parent[i] = i; rank[i] = 0

function find(x):
    if parent[x] != x:
        parent[x] = find(parent[x])   # path compression
    return parent[x]

function union(a, b):
    ra, rb = find(a), find(b)
    if ra == rb: return false         # already same / cycle edge
    if rank[ra] < rank[rb]: swap
    parent[rb] = ra
    if rank[ra] == rank[rb]: rank[ra] += 1
    return true
```

### Common Questions

- Number of Provinces · Redundant Connection · Accounts Merge · Graph Valid Tree · Similar String Groups

### Common Mistakes

- Skipping path compression / union by rank on large n
- Using UF when you need the actual path or levels (BFS/DFS)

---

## Topological Sort

**Recognition:** course schedule, prerequisites, alien dictionary, DAG order, directed cycle via topo failure  
**Complexity:** Time O(V + E) · Space O(V + E)  
**Data Structure:** Adj list + indegree array + queue (Kahn) — line up tasks so no prerequisite is after  
**Difficulty:** Medium–Hard · **Interview Frequency:** High

### Template

```pseudo
indegree[v] = 0; build adj for each edge u → v: indegree[v] += 1
queue = all v with indegree[v] == 0
order = []
while queue:
    u = dequeue(); order.append(u)
    for v in adj[u]:
        indegree[v] -= 1
        if indegree[v] == 0: enqueue(v)
if len(order) != n: return cycle / impossible
return order
```

### Common Questions

- Course Schedule · Course Schedule II · Alien Dictionary · Sequence Reconstruction · Parallel Courses III

### Common Mistakes

- Edge direction confusion (prerequisite vs dependent)
- Claiming success without `len(order) == n`

---

## Dijkstra

**Recognition:** weighted shortest path, non-negative weights, network delay, min effort path  
**Complexity:** Time O((V + E) log V) binary heap · Space O(V + E)  
**Data Structure:** Min-heap of `(dist, node)` + `dist[]` — always expand the currently closest unprocessed node  
**Difficulty:** Medium–Hard · **Interview Frequency:** Medium–High

### Template

```pseudo
dist[] = INF; dist[source] = 0
heap.push(0, source)
while heap:
    d, u = heap.pop()
    if d > dist[u]: continue          # stale
    for v, w in adj[u]:
        if dist[u] + w < dist[v]:
            dist[v] = dist[u] + w
            heap.push(dist[v], v)
```

### Common Questions

- Network Delay Time · Path With Minimum Effort · Cheapest Flights Within K Stops _(variant)_ · Swim in Rising Water

### Common Mistakes

- Dijkstra with negative weights
- Using BFS hop-count on weighted graphs

---

## Minimum Spanning Tree

**Recognition:** connect all nodes min total weight, cable cities, Kruskal vs Prim  
**Complexity:** Time O(E log E) Kruskal · Space O(V) UF (+ edges)  
**Data Structure:** Sorted edges + Union Find (or Prim heap) — cheapest wires that still connect everyone  
**Difficulty:** Medium · **Interview Frequency:** Medium

### Template

```pseudo
# Kruskal
sort edges by weight ascending
uf = UnionFind(n); total = 0; used = 0
for (u, v, w) in edges:
    if uf.union(u, v):
        total += w; used += 1
        if used == n - 1: break
return total if used == n - 1 else impossible
```

### Common Questions

- Min Cost to Connect All Points · Connecting Cities With Minimum Cost · Optimize Water Distribution

### Common Mistakes

- Wanting shortest path to one target (Dijkstra) instead of spanning all
- Stopping without one connected component
