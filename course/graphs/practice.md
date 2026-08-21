---
title: Practice
type: practice
---

## How to practice this module

Graph problems reward **choosing the traversal and marking visited
correctly**. Clone Graph tests BFS with an aliasing trap; Course Schedule
and II test cycle detection (Kahn and DFS postorder); the rest are
shortest-path and union-find applications. Done when all seven show Solved
in the hub.

## Problems

```practice-problems
- slug: clone-graph
  pattern: BFS + clone map
  difficulty: Medium
  watch_for: Returning the original graph is the classic trap — the map must hold clones and every edge must be cloned
- slug: course-schedule
  pattern: Cycle detection (Kahn)
  difficulty: Medium
  watch_for: A course graph with a cycle can never finish; track the processed count against the number of courses
- slug: course-schedule-ii
  pattern: Topological order
  difficulty: Medium
  watch_for: The order is the peel order of zero-indegree nodes — a partial peel means a cycle, not a valid order
- slug: network-delay-time
  pattern: Dijkstra
  difficulty: Medium
  watch_for: The answer is the max of all shortest paths; a node never reached means -1
- slug: number-of-provinces
  pattern: Union-find / components
  difficulty: Medium
  watch_for: Count roots, not edges — union rows with a 1 and count distinct parents
- slug: redundant-connection
  pattern: Union-find cycle break
  difficulty: Medium
  watch_for: The edge that joins two already-connected nodes is the redundant one; return the last such edge
- slug: min-cost-to-connect-all-points
  pattern: MST (Kruskal / Prim)
  difficulty: Medium
  watch_for: A complete graph is O(n^2) edges — stop early once n - 1 edges are in the tree
```
