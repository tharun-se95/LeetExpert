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
| big-o | why-efficiency-matters, big-o-notation, common-complexity-classes, input-dependency-best-worst-average, analyzing-loops-api-complexity, analyzing-recursion-tree-method, amortized-analysis-dynamic-arrays, space-complexity, complexity-drills | x | | | | x |
| arrays | contiguous-memory, dynamic-arrays, in-place-foundations, stable-compaction-cyclic-placement | x | | | | x |
| two-pointers | converging-pointers, partition-pointers | | | | | |
| sliding-window | dynamic-windows, fixed-size-windows | | | | | |
| strings | strings-in-memory, character-arithmetic-count-arrays, string-apis-scan-costs-idioms | x | | | | x |
| linked-lists | build-a-linked-list, nodes-and-pointers, pointer-surgery | x | | | | x |
| stacks | lifo-and-the-call-stack, matching-and-nesting, monotonic-stack | x | | | | x |
| queues | deques-and-monotonic, fifo-basics, ring-buffer | x | | | | x |
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
| math-for-dsa | logarithms-and-exponents, summations-and-series, modular-arithmetic, divisibility-primes-gcd, counting-and-combinatorics, math-drills | x | | | | x |

**hash-tables: fully done (2026-08-24).** Restructured to 6 lessons per
the curriculum-designer review (media-rollout spec §2.5/§1.5), content-
reviewed (spec §1), and every lesson now ships a complete audio +
infographic + video set (spec §1.5 — the per-format daily video cap was
worked around by switching Cinematic → Explainer; the download-retrieval
blocker was resolved by the user downloading manually from the notebook
and handing the files off for compression). This is the reference module
for the remaining 23 — see the media-rollout spec end to end for the
repeatable procedure.

**getting-started: Phase 1 complete (2026-08-25).** Curriculum-designer
review added a 4th lesson (Writing & Running Code — corrected from
NotebookLM's local-environment-setup guess to the actual in-browser
sandbox mechanics, verified against the real component code). Analogy
pass hand-authored (no live NotebookLM session — meta/onboarding content,
not a CS mechanism): "learning to cook, not memorizing recipes,"
sustained across all 4 lessons. Concept map hand-authored. Media
deferred to Phase 2.

**big-o: Phase 1 complete (2026-08-25).** Curriculum-designer review
split 7 lessons into 9 (iterative vs. recursive analysis; case-analysis
vs. amortized/sequence-analysis). Full analogy pass via NotebookLM:
gift-card matching game, summer-camp cookie-budget ceiling, town
message-spreading, and a mailroom/delivery-clerk throughline sustained
across lessons 4-8. Concept map hand-authored. Media deferred to Phase 2.

**math-for-dsa: Phase 1 complete (2026-08-25).** Curriculum-designer
review recommended adding a Summations & Series lesson (a real gap — big-o
leans on triangular/geometric sums informally with no formal treatment)
and reordering Divisibility before Modular Arithmetic. Accepted the new
lesson (5→6), rejected the reorder after verifying Divisibility's Euclid
section uses the `%` operator that Modular Arithmetic explains first —
the reorder would have introduced a forward reference. Also rejected an
unjustified "& Probability" scope addition to Counting & Combinatorics.
Full analogy pass via NotebookLM (requested as a Studio document instead
of a chat reply, per user tip — far more stable to read than scrolling
the chat panel): "The Grand Library Archive" / "the Master Archivist"
throughline sustained across all 6 lessons. Concept map hand-authored.
Media deferred to Phase 2.

**Policy change (2026-08-26):** after math-for-dsa, the user asked for an
unbiased review of whether the sustained-analogy treatment was genuinely
helpful or overdone. Verdict: valuable for spatial/structural/process
lessons (data structure internals, collision handling, memory/pointer
mechanics), decorative for proof-heavy formal-math lessons (Big O's
precise definition, Euclid's proof, binomial derivations) — those had to
stretch the throughline to stay consistent rather than because the
analogy was the best tool for that content, and every lesson got
measurably longer for it. Saved as `feedback_analogy_selectivity` memory.
**Applies going forward, not retroactively** — hash-tables/getting-
started/big-o/math-for-dsa stand as shipped. From arrays onward: full
analogy only where genuinely spatial/structural; formal/proof-heavy
lessons get a tight concrete example instead of a forced narrative.

**arrays: Phase 1 complete (2026-08-26).** Curriculum-designer review
recommended splitting "In-Place Techniques" (4 techniques, each with a
full loop-invariant proof, in one lesson) into a symmetric-pointer
foundation and an asymmetric-technique follow-up — accepted. Rejected a
second recommendation to fold row/column-major memory flattening into
"Arrays in Memory": verified that topic already belongs to the later
Matrix module (`course/matrix/grid-coordinates.md`), would have been
premature and duplicative here. Per the policy change above, this
module's lessons were left as their existing concrete/diagram-grounded
prose — no forced analogy narrative — since the content is already
spatial and visual (memory-cell diagrams, pointer-region diagrams).
Concept map hand-authored. Media deferred to Phase 2.

**Policy correction (2026-08-26):** arrays shipped with zero NotebookLM
involvement — the user corrected this: "let's not completely abandon the
rewrite... you should still use the notebook to do a proper rewrite."
Tighter standard means tighter on *narrative*, not skipping the tool.
From strings onward: still run NotebookLM every module, but ask for a
content-quality review (gaps, awkward transitions, where a concrete
worked example beats an assertion) instead of a forced-analogy draft.
See `feedback_analogy_selectivity` memory for the full correction.

**arrays: retroactively re-reviewed (2026-08-25).** Per the correction
above, ran the same content-quality NotebookLM pass used for strings
against the already-shipped arrays lessons. It flagged 4 real derivation
gaps (front-insertion triangular-sum closed form, a concrete cache-line
ratio, a self-contained multiplicative-vs-additive growth derivation, and
a general gcd(n,k)-cycles rule for cyclic placement) — all added, hand-
verified. It also flagged 2 gaps that independent verification showed
were already fully covered in the shipped text (lesson 3's tuple-swap
explanation, lesson 4's write≤read safety proof) — left unchanged. See
`docs/superpowers/plans/analogies/arrays.md` for the full breakdown.

**strings: Phase 1 complete (2026-08-26).** Curriculum-designer review
recommended splitting "The String Toolkit" (mixed low-level char
arithmetic, high-level API costs, and two-pointer idioms in one lesson)
into two lessons — accepted. Rejected its second recommendation to fold
a "Sliding Window on Strings" preview into the API-costs lesson: verified
Sliding Window is its own dedicated module (11), taught much later than
Strings (5) — teaching it here would preempt that module. Ran a
NotebookLM content-quality review pass (not a narrative-analogy pass) per
the corrected policy — it surfaced genuine gaps: assertions ("O(n²)",
"O(1) beats hash map") that had no shown derivation. Added three
independently-verified concrete traces: a step-by-step join_bad/join_good
copy-count table (4 words → 10 vs. 4 copies, generalized to L·n(n+1)/2),
a count-array build trace for "cab", and a naive-substring-search trace
for "ab" in "aabab" (4 comparisons to match). Caught and fixed a
diagram/prose mismatch this pass introduced (the existing string-builder-
cost diagram defaulted to count=6 while the new table used 4 words —
changed the diagram's count to 4 so both show the same "10 copies").
Concept map hand-authored; media deferred to Phase 2.

**linked-lists: Phase 1 complete (2026-08-25).** Curriculum-designer
review confirmed 3 lessons is the right count and the existing ordering
(Nodes & Pointers -> Build From Scratch -> Pointer Surgery) is correct —
no structural change. It correctly flagged doubly linked / circular lists
as premature here (already appropriately deferred as a one-paragraph
forward-reference to the Hash Tables module's LRU cache). It surfaced two
genuine scope gaps, both added to Pointer Surgery Patterns: null-pointer
safety for the fast/slow guard (`while fast and fast.next` — checking
only `fast` is a parity-dependent bug that crashes only on odd-length
lists, verified by hand-tracing lengths 1-8), and the dummy node's second
use as a construction anchor for building a new list (not just deleting
from an existing one) — directly needed for the upcoming Merge Two Sorted
Lists problem. Its fourth recommendation — stripping the `LinkedList`
wrapper class (tail pointer, size counter) from "Build a Linked List From
Scratch" as premature OOP overhead, since none of the 5 problem lessons
use it — was rejected: the Arrays module builds a full `DynamicArray`
class from scratch for the same pedagogical reason (teaching invariant
discipline) even though its own problems only use native arrays; this is
an established course pattern, not an oversight. Content-quality review
(same pass as strings/arrays) added a self-verified geometric-series
derivation for why binary search on a linked list is O(n) not O(log n), a
concrete two-pointer splice trace, a promoted-to-prose derivation of the
tail-pointer bug's silent failure mode (previously only in a quiz
explanation), a worked `delete(3)` trace, and a derivation for the
fixed-gap n-th-from-end pattern. One self-introduced error caught during
independent verification: an early draft of the null-safety note claimed
the unsafe guard crashes on even-length lists — a Python hand-trace of
lengths 1-8 showed the opposite (crashes on odd-length, silently survives
even-length), so the note was rewritten around the verified, more
pedagogically useful "silent parity-dependent bug" framing instead.
Concept map hand-authored; media deferred to Phase 2.

**stacks: Phase 1 complete (2026-08-25).** Curriculum-designer review
recommended expanding 3 lessons to 5 (adding "Expression Evaluation &
Postfix Notation" and "State-Tracking & Auxiliary Stacks") — rejected
after verifying the problem lessons it cited (Evaluate Reverse Polish
Notation, Min Stack) already contain a full derivation section teaching
exactly that content, matching the established problem-lessons-self-teach
pattern. Also rejected its claim that the recursion-to-iteration example
in Lesson 1 is premature — `big-o` (module 2) precedes `stacks` (module
8) by six modules and already teaches recursion-tree analysis;
`recursion-backtracking` is module 16. Content-quality review added a
call-stack-vs-heap depth-limit derivation, a hand-verified `count_down(3)`
trace, an O(n²) derivation for naive bracket-cascade removal, a `([)]`
mismatch trace, a full character-by-character `"abbaca"` cascade table, a
strengthened monotonic-stack invariant argument, and 3 accepted analogies
(paperwork desk, cafeteria trays, concert sightlines) alongside 2
rejected ones. See `docs/superpowers/plans/analogies/stacks.md`. Concept
map hand-authored; media deferred to Phase 2.

**queues: Phase 1 complete (2026-08-25).** Curriculum-designer review
(now explicitly told to check whether problem lessons self-teach before
recommending new ones — a fix learned from stacks) correctly found no
genuine concept-lesson gaps. It recommended relocating the Monotonic
Deque + Sliding Window Maximum to "Module 10 (Two Pointers & Sliding
Window)" — rejected after checking the manifest: Two Pointers (10) and
Sliding Window (11) are separate modules, and Sliding Window's actual
scope (window-boundary invariants) doesn't fit the deque technique; the
lesson already frames it as this module's deliberate capstone. Content-
quality review caught a real correctness/completeness gap, independently
verified by hand-running the algorithm: the monotonic-deque worked
example traced *values* instead of *indices*, which meant it never
actually demonstrated the front-expiry mechanic firing, even though it
genuinely fires in that exact example at i=4. Replaced with a hand-
verified index-based trace. Also added derivations for the linked-list
tail-pointer asymmetry, the SimpleQueue compaction's amortized cost (using
the real trigger condition from the code), and why `head == tail`
aliases both empty and full in a ring buffer. See
`docs/superpowers/plans/analogies/queues.md`. Concept map hand-authored;
media deferred to Phase 2.
