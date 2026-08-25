# Graphs — curriculum review + content-quality review

## Curriculum-designer review — well-calibrated, no structural changes

Ran against all 6 concept-lesson sources (Graph Representation, DFS & BFS
on Graphs, Topological Sort, Shortest Paths, Union-Find, Minimum Spanning
Trees) plus the 7 problem lessons' worked-solution sections, explicitly
instructed to verify problem lessons self-teach before recommending any
new concept lesson, and to specifically check whether Bellman-Ford's
non-implementation is a real gap.

- **Count, ordering, self-teaching:** confirmed 6 lessons is right, the
  current order is correct (each lesson's tools are prerequisites for the
  next — representation before traversal, traversal before topological
  sort and shortest paths, Union-Find before the MST capstone that uses
  it), and all 7 problem lessons self-teach their technique.
- **Confirmed non-gap: Bellman-Ford.** The module explains Bellman-Ford's
  existence, cost, and the reason it's needed, but never implements it in
  full. Verified this is intentional and correct: none of the 7 problem
  lessons involve negative edge weights (Network Delay Time, the module's
  only shortest-path problem, is solved with plain Dijkstra), so a full
  implementation would be dead-end depth with no problem to apply it to.
- **Confirmed non-gap: cycle detection.** Verified it doesn't need its
  own lesson — undirected detection (parent-guard check) and directed
  detection (three-color technique) are both taught in DFS & BFS on
  Graphs, reinforced dynamically in Union-Find (Redundant Connection) and
  Topological Sort (Kahn's in-degree-zero check).
- **Rejected:** recommending a new unweighted-BFS-shortest-path problem
  lesson (e.g. Rotting Oranges, Shortest Path in Binary Matrix) to exercise
  the concept lesson's BFS-solves-unweighted-shortest-paths claim more
  directly. This is a genuinely reasonable observation — no problem lesson
  in this module exercises that specific case — but out of scope for a
  content-quality pass, since a new problem lesson needs its own full
  attempt-it-first / insight / solution content and a verified sandbox,
  not a prose edit. Flagged here for a future problem-lessons pass.

## Content-quality review — all suggestions independently verified

- **Lesson 1 (Graph Representation):** added a from-scratch derivation of
  the adjacency list's O(V+E) space bound (V outer-array slots + edge
  entries, exactly E for directed / 2E for undirected, both O(E)) instead
  of asserting it; added a sustained index-card/club-roster analogy for
  the list-vs-matrix trade-off.
- **Lesson 2 (DFS & BFS on Graphs):** added a fully hand-verified
  mark-at-enqueue-vs-mark-at-dequeue trace on a small diamond graph
  (confirmed in Python: the wrong version enqueues vertex 3 twice); added
  a step-by-step three-color trace through the lesson's own existing
  A→B/A→C/B→C diamond example, confirmed against the actual algorithm in
  Python; added a sustained dark-tunnels-with-chalk analogy for the
  visited set.
- **Lesson 4 (Shortest Paths):** added a fully hand-verified Dijkstra
  stale-entry trace on a new small graph (deliberately using different
  vertex labels — S/X/Y instead of A/B/C — to avoid colliding with the
  lesson's existing negative-weight A/B/C counterexample a few paragraphs
  later, which the first draft of this trace would have clashed with);
  added a derivation of Bellman-Ford's O(V·E) bound (V−1 outer passes ×
  E inner edge-checks) instead of asserting it. Also fixed a real
  inconsistency while there: the prose said Dijkstra is "O(E log V)" but
  the lesson's own complexity table says "O((V+E) log V)" — corrected the
  prose to match the table.
- **Lesson 5 (Union-Find):** added the explicit log₂ inversion step
  (2^h ≤ n → h ≤ log₂n) the derivation had skipped; added a sustained
  playground-hand-holding-chain analogy for the parent forest.
- **Lesson 6 (Minimum Spanning Trees):** added a derivation for why
  Kruskal's and Prim's both land near O(E log V) — Kruskal's from sorting
  cost plus near-constant Union-Find operations, Prim's from V heap
  extractions plus E heap pushes, each O(log V) — instead of stating the
  bound as given.
- **Rejected:** two "redundant restatement" tightening claims (Lesson 3's
  one-clause "both are O(V+E)" framing sentence before a stylistic
  comparison, and Lesson 5's closing summary that explicitly calls back
  to "the very first, unoptimized version above" by name) — both are
  deliberate connective framing, not blind duplication.

Concept map hand-authored; media deferred to Phase 2.
