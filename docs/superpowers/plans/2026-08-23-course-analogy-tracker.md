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

**Phasing (decided 2026-08-24, media-rollout spec §4 Task C):** Prose and
Mind Map are filled in per module now (Phase 1 — curriculum + content
first, in tracker order). Audio/Video/Infographic are deliberately left
blank until Phase 2, a separate pass across all 24 modules once Phase 1 is
done — cinematic-vs-explainer is an editorial call made once across the
finished course, not per module, and NotebookLM's 2/day Cinematic cap
makes interleaving media into each module pass a bottleneck. Do not treat
a row with only Prose/Mind Map checked as incomplete for Phase 1 purposes.

| Module | Lessons | Prose | Audio | Video | Infographic | Mind Map |
| --- | --- | :-: | :-: | :-: | :-: | :-: |
| hash-tables | hashing-fundamentals, collision-chaining, build-a-hash-map, collision-open-addressing, keys-immutability-hashing, hash-patterns | x | x | x | x | x |
| getting-started | course-introduction, how-lessons-work, writing-and-running-code, course-roadmap | x | | | | x |
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

**hash-tables: fully done (2026-08-24).** Restructured to 6 lessons per
the curriculum-designer review (media-rollout spec §2.5/§1.5), content-
reviewed (spec §1), and every lesson now ships a complete audio +
infographic + video set (spec §1.5 — the per-format daily video cap was
worked around by switching Cinematic → Explainer; the download-retrieval
blocker was resolved by the user downloading manually from the notebook
and handing the files off for compression). This is the reference module
for the remaining 23 — see the media-rollout spec end to end for the
repeatable procedure.
