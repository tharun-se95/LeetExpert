# Course visualization ledger

Tracks the visual-coverage pass described in
`docs/superpowers/specs/2026-08-02-course-visualization-design.md`. One row
per lesson. Update `Status` as work lands — don't reorder rows, this is a
tracking doc, not a priority list (priority = module order, top to bottom).

**Status values:** `existing` (already had a visual before this pass) ·
`done` (built and verified in this pass) · `todo` (embed pending) ·
`defer` (no clean reuse fit yet — bespoke, lower priority until the
reuse-first roster is built and proven) · `none` (deliberately no visual
— meta/drill content)

**Important correction from the Strings batch:** viz components turned
out to hardcode their source problem's exact step logic and code panel,
not just its data — `converging-pointers` (two-sum-sorted), `write-pointer`
(compact_nonzero), and `sliding-window` (max-window-sum) cannot be
literally reused for a different algorithm via props alone, only for
lessons that are the *same* algorithm (which is why Two Sum II's reuse of
`converging-pointers` was always correct — it IS two-sum-sorted). Every
other module's `(reuse)` annotations below need the same scrutiny before
embedding — many will turn out to need a small new component, same as
Strings did with `palindrome-check`/`frequency-count`/`substring-search`.

**Roster reference** (component → type → family): see the design spec §4
for the original 12. Triage surfaced two more reuse-worthy additions not
in that list:

- `stack-lifo` (viz, state-transition) — plain push/pop animation. Serves
  4 Stacks lessons that don't fit `monotonic-stack`'s ordering constraint.
- `union-find` (viz, relationships) — path-compression + union animation.
  Serves 2 Graphs lessons.

**Second correction, from the 2026-08-02 mermaid-replacement pass:** all 8
of the course's `mermaid` fences were replaced with proper family-colored
`diagram` components (`docs`/git: "Replace all 8 mermaid diagrams with
custom static visuals"). Two of those — `dfs-traversals` and
`bfs-level-order` — were sitting in this ledger as `todo` waiting on a
`tree-traversal` viz; they now have a static `binary-tree` diagram instead
and move to `done`. The other 6 replacements were already `existing` (they
had a mermaid before), just upgraded in place — no tally change from those.
Five more reusable components exist now, beyond the original 14:
`memory-cells`, `binary-tree`, `bucket-layout`, `linked-list`,
`grid-regions`. Note `binary-tree` is *static* — it covers lessons that
just need to show tree *shape*, not the ones below still marked for
`tree-traversal` (a viz), which need to show *visit order over time*
(DFS/BFS-family traversal problems) and remain genuinely separate work.

Total: 191 lessons. `existing`: 32. `done`: 9. `none`: 8. `todo`: 137.
`defer`: 5. **Coverage: 41/191 (21%).**

---

## Getting Started (0/3 need one — meta content)

| Lesson | Type | Decision | Component | Status |
|---|---|---|---|---|
| course-introduction | concept | — | — | none |
| how-lessons-work | concept | — | — | none |
| course-roadmap | concept | — | — | none |

## Big-O

| Lesson | Type | Decision | Component | Status |
|---|---|---|---|---|
| why-efficiency-matters | concept | diagram | `complexity-curve` (new) | todo |
| big-o-notation | concept | diagram | `complexity-curve` | todo |
| common-complexity-classes | concept | diagram | `complexity-curve` | todo |
| analyzing-code | concept | viz | (embedded) | existing |
| best-worst-average-amortized | concept | viz | (embedded) | existing |
| space-complexity | concept | diagram | `complexity-curve` (space axis) | todo |
| complexity-drills | concept | — | — | none |

## Math for DSA

| Lesson | Type | Decision | Component | Status |
|---|---|---|---|---|
| logarithms-and-exponents | concept | diagram | `log-halving` | existing |
| modular-arithmetic | concept | diagram | `mod-clock` | existing |
| divisibility-primes-gcd | concept | diagram | `euclid-shrink` | existing |
| counting-and-combinatorics | concept | — | — | defer (weak visual case, revisit) |
| math-drills | concept | — | — | none |

## Arrays

| Lesson | Type | Decision | Component | Status |
|---|---|---|---|---|
| contiguous-memory | concept | diagram | `memory-cells` (embedded, replaces mermaid) | existing |
| dynamic-arrays | concept | viz | (embedded) | existing |
| in-place-techniques | concept | viz+diagram | (embedded) | existing |
| remove-duplicates-sorted | problem | viz | `write-pointer` (reuse) | todo |
| move-zeroes | problem | viz | (embedded) | existing |
| best-time-to-buy-sell-stock | problem | — | — | defer (single-pass tracker, no clean fit) |
| rotate-array | problem | viz | (embedded) | existing |
| product-except-self | problem | viz | `prefix-sum` (reuse) | todo |

## Strings — done (2026-08-02)

Corrected during build: `converging-pointers`, `write-pointer`, and
`sliding-window` turned out to hardcode their source problem's exact step
logic *and* code panel (not just data-parameterized), so embedding them
into a different algorithm would have shown the wrong code. Built new,
correctly-scoped components instead — still sharing `Cell`/`MarkerRow`/
`Legend`/`VizPlayer`, just not literal registry reuse. Also built the
diagram-family wiring (spec §3) as a prerequisite, applied retroactively
to the 4 existing pointer-movement diagrams too.

| Lesson | Type | Decision | Component | Status |
|---|---|---|---|---|
| strings-in-memory | concept | diagram | `string-builder-cost` (new, linear-traversal) | done |
| string-toolkit | concept | viz | `frequency-count` + `palindrome-check` (new, 2 embeds) | done |
| valid-palindrome | problem | viz | `palindrome-check` (new, pointer-movement) | done |
| valid-anagram | problem | viz | `frequency-count` (new, linear-traversal) | done |
| longest-common-prefix | problem | diagram | `column-scan` (new, linear-traversal) | done |
| find-the-index | problem | viz | `substring-search` (new, pointer-movement) | done |
| reverse-words | problem | diagram | `word-pipeline` (new, neutral) | done |

## Hash Tables

| Lesson | Type | Decision | Component | Status |
|---|---|---|---|---|
| hashing-fundamentals | concept | diagram | `bucket-layout` (new) | todo |
| collision-resolution | concept | viz+diagram | `bucket-layout` (embedded, replaces mermaid) | existing |
| build-a-hash-map | concept | viz | `hash-buckets` (reuse) | todo |
| hash-patterns | concept | diagram | `bucket-layout` (reuse) | todo |
| two-sum | problem | viz | `hash-buckets` (reuse) | todo |
| contains-duplicate-ii | problem | viz | `hash-buckets` (reuse) | todo |
| first-unique-character | problem | viz | `hash-buckets` (reuse) | todo |
| group-anagrams | problem | viz | `hash-buckets` (reuse) | todo |
| longest-consecutive-sequence | problem | viz | `hash-buckets` (reuse) | todo |

## Linked Lists

| Lesson | Type | Decision | Component | Status |
|---|---|---|---|---|
| nodes-and-pointers | concept | diagram | `linked-list` (embedded, replaces mermaid) | existing |
| build-a-linked-list | concept | diagram | bespoke (node/pointer static) | defer |
| pointer-surgery | concept | viz | (embedded) | existing |
| reverse-linked-list | problem | viz | (embedded) | existing |
| middle-of-list | problem | viz | (embedded, `fast-slow`) | existing |
| linked-list-cycle | problem | viz | (embedded, `fast-slow`) | existing |
| merge-two-sorted | problem | viz | bespoke (two-list merge pointer) | defer |
| remove-nth-from-end | problem | viz | `fast-slow` (reuse, gap technique) | todo |

## Stacks

| Lesson | Type | Decision | Component | Status |
|---|---|---|---|---|
| lifo-and-the-call-stack | concept | diagram | `call-stack-frames` (new) | todo |
| matching-and-nesting | concept | viz | `stack-lifo` (new) | todo |
| monotonic-stack | concept | viz | (embedded) | existing |
| valid-parentheses | problem | viz | `stack-lifo` (reuse) | todo |
| evaluate-rpn | problem | viz | `stack-lifo` (reuse) | todo |
| min-stack | problem | viz | `stack-lifo` (reuse) | todo |
| daily-temperatures | problem | viz | (embedded, `monotonic-stack`) | existing |
| largest-rectangle | problem | viz | `monotonic-stack` (reuse) | todo |

## Queues

| Lesson | Type | Decision | Component | Status |
|---|---|---|---|---|
| fifo-basics | concept | viz | `ring-buffer` (reuse) | todo |
| ring-buffer | concept | viz | (embedded) | existing |
| deques-and-monotonic | concept | viz | `monotonic-stack` (deque mode, reuse) | todo |
| recent-calls | problem | viz | `ring-buffer` (reuse) | todo |
| queue-using-stacks | problem | viz | `stack-lifo` (reuse, ×2) | todo |
| stream-first-unique | problem | viz | bespoke (ring-buffer + hash combo) | defer |
| sliding-window-maximum | problem | viz | `monotonic-stack` (deque mode, reuse) | todo |

## Two Pointers

| Lesson | Type | Decision | Component | Status |
|---|---|---|---|---|
| converging-pointers | concept | viz | (embedded) | existing |
| partition-pointers | concept | viz | `write-pointer` (reuse) | todo |
| two-sum-ii | problem | viz | (embedded) | existing |
| sort-colors | problem | viz | `write-pointer` (3-way partition, reuse) | todo |
| container-with-most-water | problem | viz | `converging-pointers` (reuse) | todo |
| three-sum | problem | viz | `converging-pointers` (reuse) | todo |
| trapping-rain-water | problem | viz | `converging-pointers` (reuse) | todo |

## Sliding Window

| Lesson | Type | Decision | Component | Status |
|---|---|---|---|---|
| fixed-size-windows | concept | viz | (embedded) | existing |
| dynamic-windows | concept | viz | (embedded) | existing |
| maximum-average-subarray | problem | viz | `sliding-window` (reuse) | todo |
| minimum-size-subarray-sum | problem | viz | (embedded) | existing |
| longest-substring-without-repeating | problem | viz | `dynamic-window` (reuse) | todo |
| permutation-in-string | problem | viz | `dynamic-window` (reuse) | todo |
| minimum-window-substring | problem | viz | `dynamic-window` (reuse) | todo |

## Prefix Sum

| Lesson | Type | Decision | Component | Status |
|---|---|---|---|---|
| prefix-sum-basics | concept | viz | (embedded) | existing |
| prefix-sum-hash-map | concept | viz | `prefix-sum` (reuse) | todo |
| prefix-sum-2d | concept | diagram | `grid-regions` (embedded, replaces mermaid) | existing |
| range-sum-query-immutable | problem | viz | `prefix-sum` (reuse) | todo |
| subarray-sum-equals-k | problem | viz | `prefix-sum` + `hash-buckets` (combo, reuse) | todo |
| contiguous-array | problem | viz | `prefix-sum` (reuse) | todo |
| range-sum-2d-immutable | problem | diagram | bespoke (2D grid variant) | defer |
| kadanes-algorithm | problem | viz | (embedded) | existing |

## Binary Search

| Lesson | Type | Decision | Component | Status |
|---|---|---|---|---|
| the-invariant-template | concept | viz | (embedded) | existing |
| boundary-search | concept | viz | `binary-search` (reuse) | todo |
| binary-search-on-the-answer | concept | viz | `binary-search` (reuse) | todo |
| search-insert-position | problem | viz | `binary-search` (reuse) | todo |
| find-first-and-last | problem | viz | `binary-search` (reuse) | todo |
| search-rotated-sorted-array | problem | viz | `binary-search` (reuse) | todo |
| koko-eating-bananas | problem | viz | `binary-search` (answer-space mode, reuse) | todo |
| find-minimum-in-rotated-sorted-array | problem | viz | `binary-search` (reuse) | todo |

## Sorting

| Lesson | Type | Decision | Component | Status |
|---|---|---|---|---|
| baseline-sorts | concept | viz | `compare-swap-bars` (new) | todo |
| merge-sort-lower-bound | concept | viz | `compare-swap-bars` (merge mode, reuse) | todo |
| quicksort-partitioning | concept | viz | `compare-swap-bars` (partition mode, reuse) | todo |
| linear-time-sorts | concept | viz | `compare-swap-bars` (counting/radix mode, reuse) | todo |
| sort-an-array | problem | viz | `compare-swap-bars` (reuse) | todo |
| merge-intervals | problem | viz | `interval-sweep` (reuse) | todo |
| largest-number | problem | diagram | bespoke (comparator ordering) | defer |
| meeting-rooms-ii | problem | viz | `interval-sweep` (reuse) | todo |
| kth-largest-element | problem | viz | `heap-sift` (reuse) | todo |

## Matrix

| Lesson | Type | Decision | Component | Status |
|---|---|---|---|---|
| grid-coordinates | concept | viz | `grid-traversal` (new) | todo |
| traversal-orders | concept | viz | `grid-traversal` (reuse) | todo |
| in-place-transformations | concept | viz | `grid-traversal` (reuse) | todo |
| rotate-image | problem | viz | `grid-traversal` (reuse) | todo |
| spiral-matrix | problem | viz | `grid-traversal` (reuse) | todo |
| set-matrix-zeroes | problem | viz | `grid-traversal` (reuse) | todo |
| search-a-2d-matrix | problem | viz | `binary-search` or `grid-traversal` (reuse) | todo |
| number-of-islands | problem | viz | `grid-traversal` (flood-fill mode, reuse) | todo |
| word-search | problem | viz | `grid-traversal` + `backtracking-tree` (combo, reuse) | todo |

## Recursion & Backtracking

| Lesson | Type | Decision | Component | Status |
|---|---|---|---|---|
| the-call-stack-and-base-cases | concept | diagram | `call-stack-frames` (reuse) | todo |
| backtracking-choose-explore-unchoose | concept | viz | `backtracking-tree` (new) | todo |
| recursion-vs-iteration | concept | diagram | `call-stack-frames` (reuse) | todo |
| subsets | problem | viz | `backtracking-tree` (reuse) | todo |
| permutations | problem | viz | `backtracking-tree` (reuse) | todo |
| combination-sum | problem | viz | `backtracking-tree` (reuse) | todo |
| generate-parentheses | problem | viz | `backtracking-tree` (reuse) | todo |
| palindrome-partitioning | problem | viz | `backtracking-tree` (reuse) | todo |
| n-queens | problem | viz | `backtracking-tree` (reuse) | todo |

## Binary Trees

| Lesson | Type | Decision | Component | Status |
|---|---|---|---|---|
| tree-terminology-and-representation | concept | diagram | `binary-tree` (embedded, replaces mermaid) | existing |
| dfs-traversals | concept | diagram | `binary-tree` (done, replaces mermaid) | done |
| bfs-level-order | concept | diagram | `binary-tree` (done, replaces mermaid) | done |
| top-down-vs-bottom-up-recursion | concept | diagram | `binary-tree` (embedded, replaces mermaid) | existing |
| maximum-depth-of-binary-tree | problem | viz | `tree-traversal` (reuse) | todo |
| diameter-of-binary-tree | problem | viz | `tree-traversal` (reuse) | todo |
| binary-tree-level-order-traversal | problem | viz | `tree-traversal` (reuse) | todo |
| construct-binary-tree-from-preorder-and-inorder | problem | viz | `tree-traversal` (reuse) | todo |
| lowest-common-ancestor-of-a-binary-tree | problem | viz | `tree-traversal` (reuse) | todo |
| binary-tree-right-side-view | problem | viz | `tree-traversal` (reuse) | todo |
| serialize-and-deserialize-binary-tree | problem | viz | `tree-traversal` (reuse) | todo |

## BST & Ordered Structures

| Lesson | Type | Decision | Component | Status |
|---|---|---|---|---|
| bst-invariant-and-operations | concept | viz | `tree-traversal` (BST mode, reuse) | todo |
| balance-and-why-it-matters | concept | diagram | bespoke (balanced vs skewed compare) | defer |
| validate-binary-search-tree | problem | viz | `tree-traversal` (reuse) | todo |
| kth-smallest-element-in-a-bst | problem | viz | `tree-traversal` (reuse) | todo |
| insert-into-a-binary-search-tree | problem | viz | `tree-traversal` (reuse) | todo |
| delete-node-in-a-bst | problem | viz | `tree-traversal` (reuse) | todo |
| convert-sorted-array-to-bst | problem | viz | `tree-traversal` (reuse) | todo |
| lowest-common-ancestor-of-a-bst | problem | viz | `tree-traversal` (reuse) | todo |

## Heaps

| Lesson | Type | Decision | Component | Status |
|---|---|---|---|---|
| heap-property-and-array-representation | concept | viz | `heap-sift` (new) | todo |
| heapify-sift-up-and-sift-down | concept | viz | `heap-sift` (reuse) | todo |
| kth-largest-element-in-a-stream | problem | viz | `heap-sift` (reuse) | todo |
| top-k-frequent-elements | problem | viz | `heap-sift` (reuse) | todo |
| merge-k-sorted-lists | problem | viz | `heap-sift` (reuse) | todo |
| find-median-from-data-stream | problem | viz | `heap-sift` (two-heap mode, reuse) | todo |
| k-closest-points-to-origin | problem | viz | `heap-sift` (reuse) | todo |
| task-scheduler | problem | viz | `heap-sift` (reuse) | todo |

## Tries

| Lesson | Type | Decision | Component | Status |
|---|---|---|---|---|
| trie-structure-and-prefix-search | concept | diagram | `trie-branches` (new) | todo |
| implement-trie | problem | viz | `tree-traversal` (trie mode, reuse) | todo |
| design-add-and-search-words | problem | viz | `tree-traversal` (reuse) | todo |
| word-search-ii | problem | viz | `tree-traversal` + `grid-traversal` (combo, reuse) | todo |
| longest-word-in-dictionary | problem | viz | `tree-traversal` (reuse) | todo |

## Intervals

| Lesson | Type | Decision | Component | Status |
|---|---|---|---|---|
| sorting-intervals-and-the-sweep | concept | viz | `interval-sweep` (new) | todo |
| insert-interval | problem | viz | `interval-sweep` (reuse) | todo |
| non-overlapping-intervals | problem | viz | `interval-sweep` (reuse) | todo |
| minimum-arrows-to-burst-balloons | problem | viz | `interval-sweep` (reuse) | todo |
| meeting-rooms | problem | viz | `interval-sweep` (reuse) | todo |
| employee-free-time | problem | viz | `interval-sweep` (reuse) | todo |

## Greedy

| Lesson | Type | Decision | Component | Status |
|---|---|---|---|---|
| greedy-choice-and-proving-correctness | concept | diagram | bespoke (exchange-argument picture) | defer |
| jump-game | problem | viz | bespoke (reach-tracking) | defer |
| jump-game-ii | problem | viz | bespoke (reach-tracking) | defer |
| gas-station | problem | viz | bespoke (running-tank tracker) | defer |
| partition-labels | problem | viz | `write-pointer` (reuse) | todo |
| candy | problem | diagram | bespoke (two-pass compare) | defer |

## Graphs

| Lesson | Type | Decision | Component | Status |
|---|---|---|---|---|
| graph-representation | concept | mermaid | (generic, reuse) | todo |
| dfs-and-bfs-on-graphs | concept | viz | `graph-frontier` (new) | todo |
| topological-sort | concept | viz | `graph-frontier` (reuse) | todo |
| shortest-paths | concept | viz | `graph-frontier` (reuse) | todo |
| union-find | concept | viz | `union-find` (new) | todo |
| minimum-spanning-trees | concept | viz | `graph-frontier` (reuse) | todo |
| clone-graph | problem | viz | `graph-frontier` (reuse) | todo |
| course-schedule | problem | viz | `graph-frontier` (reuse) | todo |
| course-schedule-ii | problem | viz | `graph-frontier` (reuse) | todo |
| network-delay-time | problem | viz | `graph-frontier` (reuse) | todo |
| number-of-provinces | problem | viz | `graph-frontier` (reuse) | todo |
| redundant-connection | problem | viz | `union-find` (reuse) | todo |
| min-cost-to-connect-all-points | problem | viz | `graph-frontier` (MST mode, reuse) | todo |

## Dynamic Programming

| Lesson | Type | Decision | Component | Status |
|---|---|---|---|---|
| from-recursion-to-memoization | concept | viz | `dp-table-fill` (new) | todo |
| tabulation-and-space-optimization | concept | viz | `dp-table-fill` (reuse) | todo |
| 1d-dp-patterns | concept | viz | `dp-table-fill` (reuse) | todo |
| 2d-dp-patterns | concept | viz | `dp-table-fill` (reuse) | todo |
| knapsack-style-dp | concept | viz | `dp-table-fill` (reuse) | todo |
| climbing-stairs | problem | viz | `dp-table-fill` (reuse) | todo |
| house-robber | problem | viz | `dp-table-fill` (reuse) | todo |
| coin-change | problem | viz | `dp-table-fill` (reuse) | todo |
| longest-increasing-subsequence | problem | viz | `dp-table-fill` (reuse) | todo |
| unique-paths | problem | viz | `dp-table-fill` (reuse) | todo |
| longest-common-subsequence | problem | viz | `dp-table-fill` (reuse) | todo |
| edit-distance | problem | viz | `dp-table-fill` (reuse) | todo |
| partition-equal-subset-sum | problem | viz | `dp-table-fill` (reuse) | todo |
| word-break | problem | viz | `dp-table-fill` (reuse) | todo |
| house-robber-iii | problem | viz | `tree-traversal` (tree-DP mode, reuse) | todo |
