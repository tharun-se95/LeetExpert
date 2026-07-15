# Diagrams

Mermaid source files (`.mmd`) for diagrams reused across chapters, the
recognition guide, and the cheat sheets.

Naming convention: `<pattern-name>-<short-description>.mmd`, e.g.
`sliding-window-expand-shrink.mmd`, `union-find-parents.mmd`.

Diagrams that only appear once in a single chapter can stay inline in that
chapter's Markdown — extract here when a diagram is reusable across the
handbook (cheat sheets, Part 3, foundations).

## Catalog

| File | Pattern / idea | Source |
| --- | --- | --- |
| `hash-map-complement.mmd` | Two Sum complement lookup | Family 1 Hash Map |
| `prefix-sum-equals-k.mmd` | Prefix freq map for sum = K | Family 1 Prefix Sum |
| `sliding-window-expand-shrink.mmd` | Expand right / shrink left | Family 2 Sliding Window |
| `binary-search-answer-space.mmd` | Monotone feasibility binary search | Family 3 Binary Search |
| `backtracking-choose-explore-undo.mmd` | Choose → deepen → undo | Family 4 Backtracking |
| `greedy-jump-reach.mmd` | Max reach / Jump Game greedy | Family 5 Greedy |
| `bfs-frontier-loop.mmd` | Queue frontier loop | Family 6 BFS |
| `bfs-levels.mmd` | Level-by-level expansion | Family 6 BFS |
| `union-find-parents.mmd` | Parent pointers / components | Family 6 Union Find |
| `topological-sort-kahn.mmd` | Kahn indegree-0 emit loop | Family 6 Topo Sort |
| `dijkstra-relax.mmd` | Pop closest → relax neighbors | Family 6 Dijkstra |
| `monotonic-stack-next-greater.mmd` | Decreasing stack next warmer | Family 7 Mono Stack |

Inline Part 2 diagrams remain the chapter source of truth; these `.mmd` files
are extracts for reuse (cheat sheets, stems, decision trees). Prefer
extract-only edits when Part 2 writers are active — do not require chapters to
link here.
