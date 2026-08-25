import type { MindMapNode } from "./types";

/**
 * Concept map for the Graphs module. Hand-authored from the module's
 * 6-lesson structure (course/graphs/*.md). Curriculum-designer review
 * confirmed 6 lessons, the current ordering, and all 7 problem lessons
 * self-teach their technique — cycle detection and the Bellman-Ford
 * omission were both flagged as potential gaps and confirmed non-gaps
 * (cycle detection is fully covered across DFS/BFS, Union-Find, and
 * Topological Sort; Bellman-Ford's omission from implementation is
 * intentional, since no problem lesson has negative edge weights).
 * Rejected recommending a new unweighted-BFS-shortest-path problem
 * lesson (e.g. Rotting Oranges) as out of scope for a content-quality
 * pass — flagged as a good future addition, not implemented here.
 */
export const graphsConceptMap: MindMapNode = {
  id: "graphs",
  label: "Graphs",
  children: [
    {
      id: "graph-representation",
      label: "Graph Representation",
      children: [
        { id: "three-axes", label: "Directed/undirected, weighted/unweighted, cyclic/acyclic — three independent axes that decide what a representation must store" },
        { id: "list-vs-matrix", label: "Adjacency list O(V+E) space, O(degree) neighbor iteration; adjacency matrix O(V²) space, O(1) edge lookup but O(V) neighbor iteration" },
        { id: "sparse-favors-list", label: "Sparse graphs (the common case) favor the list — a full traversal is O(V+E) vs the matrix's O(V²) for the same result" },
      ],
    },
    {
      id: "dfs-bfs-graphs",
      label: "DFS & BFS on Graphs",
      children: [
        { id: "visited-set-load-bearing", label: "Trees never need a visited guard; on a graph it's load-bearing — without it a cycle makes traversal fail to terminate, not just slow down" },
        { id: "bfs-mark-on-enqueue", label: "BFS must mark visited at enqueue time, not dequeue — otherwise the same vertex can be queued many times before ever being processed" },
        { id: "cycle-detection-direction", label: "Undirected cycle detection excludes only the immediate parent; directed detection needs three colors (white/gray/black) since a 'diamond' DAG isn't a cycle" },
      ],
    },
    {
      id: "topological-sort",
      label: "Topological Sort",
      children: [
        { id: "dag-only", label: "A topological order exists iff the graph is a DAG — a cycle forces a vertex to come before itself, a contradiction" },
        { id: "kahns-algorithm", label: "Kahn's: repeatedly emit an in-degree-zero vertex and decrement its neighbors' in-degrees — a short output count means the missing vertices are cycle-trapped" },
        { id: "dfs-postorder-reversed", label: "DFS-based: reversed postorder is a valid order, proven by showing every edge u→v has v finishing before u" },
      ],
    },
    {
      id: "shortest-paths",
      label: "Shortest Paths (BFS, Dijkstra)",
      children: [
        { id: "bfs-unweighted-only", label: "BFS finds shortest paths only when every edge costs the same — once weights differ, fewer edges can mean more total weight" },
        { id: "dijkstra-stale-entries", label: "Dijkstra's stale-entry heap check is load-bearing, not defensive — a vertex can be pushed multiple times, and only the current-best entry is meaningful" },
        { id: "negative-weights-break-greedy", label: "Negative edges break Dijkstra's greedy finalization — a later, sharply negative edge can beat an already-finalized distance, with no mechanism to un-finalize" },
        { id: "bellman-ford-fallback", label: "Bellman-Ford tolerates negative weights (no negative cycle) by relaxing every edge V−1 times, O(V·E) — the price of giving up the greedy shortcut" },
      ],
    },
    {
      id: "union-find",
      label: "Union-Find (Disjoint Set)",
      children: [
        { id: "forest-of-parents", label: "Each group is a tree of parent pointers; a group's identity is its root; find walks up to the root, union attaches one root under another" },
        { id: "union-by-size", label: "Attaching the smaller tree under the larger bounds height at log₂n — attaching the bigger tree under the smaller could stack a whole tree's height on top" },
        { id: "path-compression", label: "Every find that reaches the root re-points every node it passed through directly to the root, so future finds on those nodes are O(1)" },
        { id: "near-constant-together", label: "Both optimizations together give amortized O(α(n)) — the inverse Ackermann function, effectively constant for any n that could ever exist" },
      ],
    },
    {
      id: "minimum-spanning-trees",
      label: "Minimum Spanning Trees (Kruskal's & Prim's)",
      children: [
        { id: "cut-property", label: "For any cut, the minimum-weight crossing edge belongs in some MST — proven by an exchange argument: swapping it in can only lower total weight" },
        { id: "kruskals-global-sort", label: "Kruskal's sorts all edges globally and adds each unless Union-Find shows it would close a cycle — efficient on sparse graphs" },
        { id: "prims-grows-one-tree", label: "Prim's grows one tree from a start vertex, structurally identical to Dijkstra but comparing raw edge weight, not accumulated path distance — preferred on dense graphs" },
      ],
    },
  ],
};
