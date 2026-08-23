# Course Analogy Rewrite — Progress Tracker

Delete this file (and `docs/superpowers/plans/analogies/`) once every module
row below is fully checked (all 5 columns). One NotebookLM notebook per
module — prose rewrite procedure is Task 3 of
`2026-08-23-course-analogy-rewrite.md`; the asset columns (Audio/Video/
Infographic/Mind Map) follow
`docs/superpowers/specs/2026-08-24-course-media-rollout.md` §3-4.

**Columns:** Prose = all concept lessons rewritten with the module's
analogy. Audio/Video/Infographic = every concept lesson in the module has
that asset landed at `web/public/media/<module>/`. Mind Map = the module's
concept map is transcribed and registered
(`web/src/lib/course/conceptMaps/registry.ts`).

| Module | Lessons | Prose | Audio | Video | Infographic | Mind Map |
| --- | --- | :-: | :-: | :-: | :-: | :-: |
| hash-tables | hashing-fundamentals, collision-resolution, build-a-hash-map, hash-patterns | x | x | 1/4 | x | x |
| getting-started | course-introduction, course-roadmap, how-lessons-work | | | | | |
| big-o | analyzing-code, common-complexity-classes, big-o-notation, best-worst-average-amortized, complexity-drills, why-efficiency-matters, space-complexity | | | | | |
| arrays | contiguous-memory, in-place-techniques, dynamic-arrays | | | | | |
| two-pointers | converging-pointers, partition-pointers | | | | | |
| sliding-window | dynamic-windows, fixed-size-windows | | | | | |
| strings | string-toolkit, strings-in-memory | | | | | |
| linked-lists | build-a-linked-list, nodes-and-pointers, pointer-surgery | | | | | |
| stacks | lifo-and-the-call-stack, matching-and-nesting, monotonic-stack | | | | | |
| queues | deques-and-monotonic, fifo-basics, ring-buffer | | | | | |
| binary-search | binary-search-on-the-answer, boundary-search, the-invariant-template | | | | | |
| sorting | baseline-sorts, linear-time-sorts, merge-sort-lower-bound, quicksort-partitioning | | | | | |
| recursion-backtracking | backtracking-choose-explore-unchoose, recursion-vs-iteration, the-call-stack-and-base-cases | | | | | |
| binary-trees | bfs-level-order, dfs-traversals, top-down-vs-bottom-up-recursion, tree-terminology-and-representation | | | | | |
| bst | balance-and-why-it-matters, bst-invariant-and-operations | | | | | |
| heaps | heap-property-and-array-representation, heapify-sift-up-and-sift-down | | | | | |
| tries | trie-structure-and-prefix-search | | | | | |
| graphs | dfs-and-bfs-on-graphs, graph-representation, minimum-spanning-trees, shortest-paths, topological-sort, union-find | | | | | |
| intervals | sorting-intervals-and-the-sweep | | | | | |
| prefix-sum | prefix-sum-2d, prefix-sum-basics, prefix-sum-hash-map | | | | | |
| matrix | grid-coordinates, traversal-orders, in-place-transformations | | | | | |
| greedy | greedy-choice-and-proving-correctness | | | | | |
| dynamic-programming | 1d-dp-patterns, 2d-dp-patterns, from-recursion-to-memoization, tabulation-and-space-optimization, knapsack-style-dp | | | | | |
| math-for-dsa | counting-and-combinatorics, logarithms-and-exponents, divisibility-primes-gcd, modular-arithmetic, math-drills | | | | | |

**hash-tables note:** prose/audio/infographic/mind-map complete and
content-reviewed (2026-08-24 — see the media-rollout spec §1 for the review
findings). Video is 1/4 (`collision-resolution` only) — generating the
other 3 is Task A of the media-rollout spec, and should close before this
row counts as fully done.
