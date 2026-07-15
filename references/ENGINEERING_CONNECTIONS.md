# Engineering Connections Lookup

One concrete production system (or subsystem) per pattern. Prefer these when
writing Part 2 **Engineering Connections** sections; research only if a pattern
needs a better example than the table row.

| Pattern | Concrete system | Why it fits |
| --- | --- | --- |
| Arrays | Image pixel buffers (OpenCV / GPU textures) | Contiguous indexed storage, in-place transforms |
| Hash Maps | Redis hashes / session stores | Key → value O(1) lookup for user/session state |
| Hash Sets | Bloom filters / dedup caches (CDN, crawlers) | Membership / “seen before” without valuing counts |
| Prefix Sum | Analytics range dashboards (Grafana-style rollups) | Precomputed running totals for fast time-range queries |
| Two Pointers | Merge step in external sort / sorted join | Two cursors walk ordered streams toward a goal |
| Sliding Window | TCP congestion / rate-limit windows | Contiguous recent interval tracking |
| Fast & Slow Pointers | Cycle detection in allocators / freelist integrity checks | Meeting-point detects loops without extra space |
| Linked List Pointer Manipulation | Kernel task lists / intrusive lists | Local pointer rewiring for reverse/splice |
| Sorting | Database `ORDER BY` / LSM flush ordering | Sort-then-scan enables linear passes |
| Binary Search | B-tree / sorted index lookup | Halve sorted search space each probe |
| Intervals | Calendar / meeting-room schedulers | Merge/overlap of `[start, end)` ranges |
| Sweep Line | Collision detection / map renderers | Sort events, scan left→right with active set |
| DFS | Dependency/package graph exploration | Recursive “go deep, then backtrack” walk |
| Tree Traversals | DOM / AST walks in browsers & compilers | Pre/in/postorder over hierarchical data |
| Divide and Conquer | MapReduce / merge-sort parallel stages | Split → solve → combine |
| Backtracking | Constraint solvers / Sudoku-class configurators | Try → constrain → undo on failure |
| Memoization | HTTP caches / computed property caches | Store result of expensive pure computation |
| Dynamic Programming | Route optimization / edit-distance in diff tools | Overlapping subproblems + optimal substructure |
| Greedy (cross-ref) | Activity selection / interval scheduling heuristics | Local optimal choice with proven global property |
| BFS | Shortest path in unweighted social graphs | Level-order expansion = distance |
| Graph Traversal | Service mesh / call-graph tooling | Adj-list + visited hygiene for component walks |
| Union Find | Kruskal MST / online connectivity (Accounts Merge) | Merge sets, query same-component |
| Topological Sort | Build systems (Make/Bazel) / job schedulers | Order nodes with prerequisites |
| Dijkstra | GPS / network routing (OSPF-like) | Non-negative weighted shortest path |
| Minimum Spanning Tree | Network cabling / cluster interconnect design | Connect all nodes at min total edge cost |
| Stack | Browser history / undo stacks / call stack | LIFO nested scopes & matching |
| Queue | Task queues / message brokers (SQS, RabbitMQ) | FIFO fair processing |
| Heap / Priority Queue | OS schedulers / latency-sensitive job queues | Continuous min/max / Top-K selection |
| Monotonic Stack | Stock span / next-greater in streaming metrics | Nearest greater/smaller in amortized O(1) |
| Trie | Autocomplete / IP routing tables / spellcheck | Shared-prefix dictionary lookup |
