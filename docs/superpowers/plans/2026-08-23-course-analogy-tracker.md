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
| two-pointers | converging-pointers, partition-pointers | x | | | | x |
| sliding-window | dynamic-windows, fixed-size-windows | x | | | | x |
| strings | strings-in-memory, character-arithmetic-count-arrays, string-apis-scan-costs-idioms | x | | | | x |
| linked-lists | build-a-linked-list, nodes-and-pointers, pointer-surgery | x | | | | x |
| stacks | lifo-and-the-call-stack, matching-and-nesting, monotonic-stack | x | | | | x |
| queues | deques-and-monotonic, fifo-basics, ring-buffer | x | | | | x |
| binary-search | binary-search-on-the-answer, boundary-search, the-invariant-template | x | | | | x |
| sorting | baseline-sorts, linear-time-sorts, merge-sort-lower-bound, quicksort-partitioning | x | | | | x |
| recursion-backtracking | backtracking-choose-explore-unchoose, recursion-vs-iteration, the-call-stack-and-base-cases | x | | | | x |
| binary-trees | bfs-level-order, dfs-traversals, top-down-vs-bottom-up-recursion, tree-terminology-and-representation | x | | | | x |
| bst | balance-and-why-it-matters, bst-invariant-and-operations | x | | | | x |
| heaps | heap-property-and-array-representation, heapify-sift-up-and-sift-down | x | | | | x |
| tries | trie-structure-and-prefix-search | x | | | | x |
| graphs | dfs-and-bfs-on-graphs, graph-representation, minimum-spanning-trees, shortest-paths, topological-sort, union-find | x | | | | x |
| intervals | sorting-intervals-and-the-sweep | x | | | | x |
| prefix-sum | prefix-sum-2d, prefix-sum-basics, prefix-sum-hash-map | x | | | | x |
| matrix | grid-coordinates, traversal-orders, in-place-transformations | x | | | | x |
| greedy | greedy-choice-and-proving-correctness | x | | | | x |
| dynamic-programming | 1d-dp-patterns, 2d-dp-patterns, from-recursion-to-memoization, tabulation-and-space-optimization, knapsack-style-dp | x | | | | x |
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

**two-pointers: Phase 1 complete (2026-08-25).** Curriculum-designer
review recommended splitting Partition Pointers, reversing the lesson
order, adding a bottleneck-dominance section to Converging Pointers, and
removing the 2-way partition function — all rejected: the lesson is one
coherent 2-zone-to-3-zone narrative, the current order deliberately opens
Stage 2 with its elimination theme, `container-with-most-water.md`
already self-teaches the bottleneck argument (with a two-way callback the
concept lesson deliberately sets up), and the 2-way partition is
structural scaffolding for the lesson's own 3-zone generalization, not
just a Sorting-module preview. Content-quality review completed the
Converging Pointers worked example (previously stopped after step 1) and
added a derivation for the n-1 move bound; for Partition Pointers, added
two hand-verified traces (`[4a,4b,2]` for instability, `[2,0,1]` for the
Dutch-flag asymmetry — the same adversarial example the quiz already
referenced but the prose never actually traced) and a laundry-sorting
analogy for the three-zone setup. See
`docs/superpowers/plans/analogies/two-pointers.md`. Concept map
hand-authored; media deferred to Phase 2.

**sliding-window: Phase 1 complete (2026-08-25).** Curriculum-designer
review (well-calibrated this time — no over-recommended lessons)
confirmed 2 lessons and the current ordering, and suggested only two
small light-touch additions (folded into existing prose rather than new
subsections). Content-quality review caught two real bugs, both
independently verified: Dynamic Windows' worked trace stopped one step
early and reported a "best so far" (3) that was not the actual answer —
running the algorithm on the full array shows the true minimum is 2,
found at the very last window; and the lesson's monotonicity claim
("growing always helps validity, shrinking always hurts it") was stated
as universal but is backwards for the module's own upper-bound
templates (hand-verified via "at most 2 distinct" on `a -> ab -> abc ->
bc`) — rewritten to state both directions explicitly, tied to the two
templates the lesson already presents. Also added a division-by-zero
trap note for running-product windows and two analogies (cropping tool,
inchworm). See `docs/superpowers/plans/analogies/sliding-window.md`.
Concept map hand-authored; media deferred to Phase 2.

**binary-search: Phase 1 complete (2026-08-25).** Curriculum-designer
review was fully well-calibrated — confirmed 3 lessons, the current
ordering, no scope gaps (explicitly mapping all 5 problem lessons,
including both rotated-sorted-array problems, to Lesson 1's invariant
skill without needing a new lesson), and no overlap with Sorting. No
structural changes. Content-quality review caught a real clarity bug:
Lesson 3's problem-bounding example conflated "minimum days to ship"
with capacity bounds ("heaviest package" to "sum of everything"),
mixing two different variables from the underlying problem — fixed by
correctly framing it as capacity bounds for a days-constrained problem.
Also added a concrete overflow-integer example, a hand-traced infinite
loop demonstrating why lo=mid+1 (not lo=mid) is mandatory, the explicit
3-step invariant proof for boundary search tied to the course's own
proof framework, a last-occurrence derivation, an out-of-bounds trace,
a from-scratch derivation of the O(f(n)·log R) total cost, and a fully
hand-verified Koko Eating Bananas trace. See
`docs/superpowers/plans/analogies/binary-search.md`. Concept map
hand-authored; media deferred to Phase 2.

**sorting: Phase 1 complete (2026-08-25).** Curriculum-designer review
caught one real bug: Lesson 4 (Linear-Time Sorts) opened with "the
previous lesson proved" the n log n lower bound, but under the current
order the previous lesson is Quicksort, not Merge Sort (where the proof
actually lives) — fixed as a minimal wording correction (name the Merge
Sort lesson explicitly) rather than NotebookLM's proposed restructure,
since the current lesson order is pedagogically correct as-is. Lesson
count, ordering, and scope boundaries with Binary Search and Intervals
all confirmed correct. Content-quality review added, all independently
hand-verified in Python: a derivation of selection sort's "exactly n
swaps" claim and an inversions-count derivation (`O(n+I)`) backing
insertion sort's best/worst-case gap, both with verified traces; an
inline correctness comment plus a verified tagged-duplicate stability
trace for merge sort; a verified Lomuto partition trace
(`[8,3,7,1,5]` → `[3,1,5,8,7]`) for quicksort; and verified
reverse-iteration-stability and full 2-digit radix-sort traces
(`[29,13,22,19,5]` → `[5,13,19,22,29]`) for linear-time sorts. Five
analogies added (bookshelf, playing cards, paper stacks, height queue,
pigeonholes/index cards). See
`docs/superpowers/plans/analogies/sorting.md`. Concept map
hand-authored; media deferred to Phase 2.

**recursion-backtracking: Phase 1 complete (2026-08-25).** Curriculum-
designer review confirmed 3 lessons is right and no new concept lesson
is needed (all 6 problem lessons already self-teach their device), but
caught two real bugs: Lesson 1 opened claiming "everything so far has
been flat," contradicting the immediately preceding Sorting module's
recursive merge sort and quicksort — fixed by acknowledging that
module's recursion while correctly framing this lesson as the first
place the call-stack machinery itself gets explained; and Lesson 2's
"unchoose" was demonstrated only via `path.pop()`, while Permutations
and N-Queens apply the same discipline to a used-array and to sets —
fixed with a generalizing paragraph. Rejected merging Lesson 3 into
Lesson 1 (its TCO section is deliberately corrective, not filler; its
one-paragraph tree-height forward-reference is the course's normal
pattern, not "premature cognitive load") and two "triplicate/repetitive"
tightening claims (each flagged passage served a distinct purpose).
Content-quality review added, independently verified in Python: a
concrete `factorial(1)` stack-frame trace, a Θ(φⁿ) precision aside on
naive Fibonacci plus a verified `fib(5)` call-count trace (15 calls
total), and a domination derivation showing leaf cost dominates
internal-node cost for the subsets/permutations complexity claims.
Three analogies added (cafeteria trays, dressing-room rack, desk-drawer
vs. floor space). See
`docs/superpowers/plans/analogies/recursion-backtracking.md`. Concept
map hand-authored; media deferred to Phase 2.

**binary-trees: Phase 1 complete (2026-08-25).** Curriculum-designer
review confirmed 4 lessons and the current order are right, and that the
two problem lessons with no "insight" section (Level Order Traversal,
Right Side View) are fully covered by the BFS lesson's size-snapshot
technique. Caught a real bug: the Terminology lesson said "the next
lesson has two different recursion shapes," but that's Lesson 4
(Top-Down vs. Bottom-Up), not Lesson 2 (DFS Traversals) — fixed by
naming the lesson explicitly. Rejected recommending a new "Invert a
Binary Tree" problem lesson (out of scope for a content-quality pass —
needs its own full sandbox, not a prose edit), an iterative-preorder/
postorder "coverage gap" claim (the lesson teaches the explicit-stack
mechanism once on the order that actually needs it), and two "redundant
across lessons" tightening claims on the O(h)/O(n) restatements (each
appearance adds traversal-specific or comparative context, the course's
established deliberate-reinforcement pattern). Content-quality review
added, independently verified in Python: a from-scratch derivation of
the balanced-tree height claim (n=2⁰+⋯+2ʰ, h≈log₂n), a verified
iterative-inorder stack trace on a 3-node tree, a verified BFS
size-snapshot trace on the lesson's own 6-node tree, and a derivation of
the "last level holds ~n/2 of the nodes" claim. Four analogies added
(bush vs. vine, theme-park queue batches, family-tree rumor relay). See
`docs/superpowers/plans/analogies/binary-trees.md`. Concept map
hand-authored; media deferred to Phase 2.

**bst: Phase 1 complete (2026-08-25).** Curriculum-designer review
confirmed 2 lessons is right and all 6 problem lessons self-teach.
Caught two real bugs: Lowest Common Ancestor of a BST — a pure
read-only search-descent problem — was sequenced last, after the much
harder Delete and Convert Sorted Array problems; moved to right after
Kth Smallest and before Insert in the manifest (verified no stale
cross-references broke). And Balance & Why It Matters said "two
problems ahead lean on this lesson" but named only one — fixed by
correctly describing one problem plus the lesson's broader role.
Rejected recommending a new rotation-implementation problem lesson (out
of scope for a content pass, and the module's own text already frames
rotation as conceptual, not an implementation skill) and a prose/table
tightening claim (deliberate reinforcement, not duplication).
Content-quality review added, independently verified: a concrete
two-children deletion trace, a full geometric-series derivation of the
h≥log₂(n+1)−1 height floor, concrete numbers on the rotation diagram
with a verified before/after inorder check, and a note on the AVL
constant's Fibonacci-tree origin. Two analogies added (forest-trail
signposts for search descent, hanging mobile for rotation). See
`docs/superpowers/plans/analogies/bst.md`. Concept map hand-authored;
media deferred to Phase 2.

**heaps: Phase 1 complete (2026-08-25).** Curriculum-designer review
confirmed 2 lessons is right and all 6 problem lessons self-teach their
pattern. Applied a sound ordering improvement: moved K Closest Points to
Origin from 5th to 3rd in the problem sequence (right after Top K
Frequent) to group the three size-k-heap problems together before the
k-way-merge and two-heaps patterns. Rejected two "scope gap" claims
(tuple-comparison pitfalls) that the affected problem lessons already
explicitly self-teach, and a heapreplace/heappushpop optimization
suggestion (problem-level style detail, not a concept-lesson gap — and
only true for one of the two problems it was claimed to affect).
Content-quality review added, independently verified in Python: a
from-scratch derivation of the `(n−2)//2` heapify starting index, a
justification for the height-`h` node-count bound in the O(n) proof,
and a fully hand-verified build-heap trace (which caught and fixed a
wrong swap-count in an earlier draft before it shipped). Two sustained
analogies added (theater seating for the heap property and array
packing, weighted boxes on a shelf for sift-up/sift-down). See
`docs/superpowers/plans/analogies/heaps.md`. Concept map hand-authored;
media deferred to Phase 2.

**tries: Phase 1 complete (2026-08-25).** Curriculum-designer review
confirmed 1 lesson is right and all 4 problem lessons self-teach their
extension of the base trie. Applied a sound ordering improvement:
swapped Word Search II and Longest Word in Dictionary so the pure-trie
traversal problem precedes the higher-complexity grid+trie capstone.
Rejected two "add a new problem lesson" scope-gap suggestions (trie
deletion, router-style longest-prefix-match) as out of scope for a
content pass. Content-quality review caught and fixed a real bug: the
lesson claimed a hash set's prefix-query cost is O(n·L) (L = word
length), but checking a prefix only costs up to the prefix's own length
— verified in Python, corrected to O(n·P) in all four places the claim
appeared (prose, payoff paragraph, complexity table, quiz option). Added
independently-verified concrete traces for the is_end_of_word flag and
the early-abort search case, concrete numbers for the array-overhead
claim (25/26 ≈ 96% wasted on a 26-letter alphabet), and a light
illustrative example for the memory-crossover claim. One sustained
hiking-trail analogy added across the whole lesson. See
`docs/superpowers/plans/analogies/tries.md`. Concept map hand-authored;
media deferred to Phase 2.

**graphs: Phase 1 complete (2026-08-25).** Curriculum-designer review
confirmed 6 lessons, the current order, and all 7 problem lessons
self-teach. Explicitly verified two potential gaps are non-gaps:
Bellman-Ford's non-implementation is intentional (no problem lesson has
negative edge weights), and cycle detection needs no dedicated lesson
(covered across DFS/BFS, Union-Find, and Topological Sort). Rejected
recommending a new unweighted-BFS-shortest-path problem lesson (e.g.
Rotting Oranges) as out of scope for a content pass — flagged for a
future problem-lessons pass. Content-quality review added, every trace
independently verified in Python: adjacency-list O(V+E) derivation,
mark-at-enqueue-vs-dequeue BFS trace, three-color cycle-detection trace
on the lesson's own diamond example, Dijkstra stale-entry trace (on a
deliberately different graph to avoid colliding with the lesson's
existing negative-weight example), Bellman-Ford O(V·E) derivation,
Union-Find's log₂ inversion step, and a Kruskal/Prim complexity
derivation. Also fixed a real inconsistency: the Shortest Paths lesson's
prose said Dijkstra is O(E log V) while its own complexity table said
O((V+E) log V) — corrected the prose to match. Three sustained analogies
added (index cards for adjacency lists, dark tunnels with chalk for the
visited set, playground hand-holding chains for Union-Find). See
`docs/superpowers/plans/analogies/graphs.md`. Concept map hand-authored;
media deferred to Phase 2.

**intervals: Phase 1 complete (2026-08-25).** Curriculum-designer review
confirmed 1 concept lesson + 5 problem lessons is right, and all 5
problem lessons self-teach. Accepted a reordering (Meeting Rooms moved
to lead the problem set, ahead of Insert Interval / Non-overlapping
Intervals / Burst Balloons) on its own simpler-first merit, but rejected
the reviewer's stated justification for it — the review claimed this
fixed "a major regression" because the simpler variant followed Meeting
Rooms II (Module 14); checked `course/intervals/meeting-rooms.md`
directly and found it already contains an explicit "Meeting Rooms vs.
Meeting Rooms II — why the harder one needs more" section, proving the
course deliberately revisits the simpler problem to teach
machinery-matching, not redundant repetition. Also rejected a new
"Point Event sweep" lesson suggestion as genuine duplication of Meeting
Rooms II. Content-quality review added a sustained shared-movie-
screening-room analogy across three points in the concept lesson
(touching-endpoint ambiguity, and the end-sort-greedy choice), plus a
hand-verified adjacent-neighbour trace (`[1,3]`, `[5,8]`, `[10,12]`,
confirmed in Python) showing why sorting collapses all-pairs checking to
one backward step. Added a k-way-merge/heap callback note to Employee
Free Time (genuinely the same trade-off as Merge k Sorted Lists, Module
19). Rejected three claims: a "double-complexity restatement" tightening
claim (table and prose serve different reading modes), a "walk
left-to-right" phrasing claim (consistent with Module 14's own usage),
and a derivation-gap claim on a trivial De Morgan's-law inequality flip.
See `docs/superpowers/plans/analogies/intervals.md`. Concept map
hand-authored; media deferred to Phase 2.

**prefix-sum: Phase 1 complete (2026-08-25).** Curriculum-designer
review confirmed 3 concept lessons + 5 problem lessons is right, the
current order (basics → hash-map → 2D, then problems applying each in
matching order) is correct, and all 5 problem lessons self-teach —
including Contiguous Array's explicit callback to Subarray Sum Equals K
confirming its position right after it. No new lesson or reorder
needed. Content-quality review applied selectively rather than a full
per-lesson analogy pass, since this module is arithmetic/derivation-
heavy rather than spatial/structural: added a light odometer analogy to
Prefix Sums (one paragraph, not sustained further) and a rug/rectangle-
patches analogy to 2D Prefix Sums (earns its place — inclusion-exclusion
on a grid is itself spatial; verified the build-and-query arithmetic
independently in Python against the lesson's own 3×3 example). Added no
analogy to Prefix Sum + Hash Map, since it directly continues Hash
Tables' Seen/Index pattern and a second analogy would blur rather than
clarify. Independently re-verified every numeric trace already in the
five problem lessons (Subarray Sum Equals K, Contiguous Array, Kadane's,
both Range Sum Query variants) — all correct as shipped, no bugs found.
See `docs/superpowers/plans/analogies/prefix-sum.md`. Concept map
hand-authored; media deferred to Phase 2.

**matrix: Phase 1 complete (2026-08-25).** Curriculum-designer review
confirmed 3 concept lessons + 6 problem lessons is right, all 6
problem lessons self-teach, and each explicitly names the concept
lesson it applies — confirming the current problem order (concept-
reinforcing problems first, then increasingly composite applications)
is intentional. No reorder or new lesson needed. Unlike Prefix Sum,
this module's subject matter is genuinely spatial, so it got the full
sustained-analogy treatment: a continuous bookshelf for row-major
addressing (with a callback explaining why column traversal is
scattered), peeling a picture frame's tile rings for spiral traversal
(with a callback into the guard-bug explanation), and a flat square
tile turned by two table-bound moves for the transpose+reverse
rotation proof. Independently re-verified the rotation proof's
coordinate claim and the row-major offset formula against the
lessons' own worked examples — both correct, no bugs found. See
`docs/superpowers/plans/analogies/matrix.md`. Concept map
hand-authored; media deferred to Phase 2.

**greedy: Phase 1 complete (2026-08-25).** Curriculum-designer review
confirmed 1 concept lesson + 5 problem lessons is right, all 5
self-teach, and the current order (boolean reachability → level-counted
reachability → two-insight circular search → running-boundary
partitioning → bidirectional two-pass capstone) is sound — every
problem's cross-references to other lessons were checked against the
actual target content and are accurate. No reorder or new lesson
needed. Content-quality review added no analogy anywhere in this
module, by design: this is the course's most proof-heavy module
(exchange arguments, induction), and the selectivity principle calls
for minimizing analogy exactly where formal rigor is the point being
taught. Independently re-verified Gas Station's example trace, Candy's
hardest example (`[1,2,87,87,87,2,1]` → 13, both directional passes
hand-computed), and the coin-change counterexample's arithmetic — all
correct, no bugs found. See
`docs/superpowers/plans/analogies/greedy.md`. Concept map
hand-authored; media deferred to Phase 2.

**dynamic-programming: Phase 1 complete (2026-08-25).** Curriculum-
designer review confirmed 5 concept lessons + 10 problem lessons is
right and all 10 self-teach. The problem order is a difficulty
progression rather than a strict replay of concept-lesson order (Coin
Change's unbounded knapsack appears well before Partition Equal Subset
Sum's 0/1 knapsack) — checked every problem's cross-references and
confirmed this is intentional, not an oversight, so no reorder was
made. No new lesson needed; House Robber III's tree-DP capstone
correctly frames itself as a fusion of Module 17 and this module's
rob-or-skip choice rather than a gap. Like Greedy, this module is
proof/derivation-heavy, so content-quality review added no analogy
anywhere, by design. Independently hand-traced House Robber III's own
worked example node by node to confirm the pair-return recurrence
(root gives rob_this=7, skip_this=6, matching the stated answer), and
checked Edit Distance's base cases and the knapsack row-index
distinction directly — all correct, no bugs found. See
`docs/superpowers/plans/analogies/dynamic-programming.md`. Concept map
hand-authored; media deferred to Phase 2.

**All Phase 1 modules complete.** Every module in the curriculum has
now had a curriculum-designer review and a content-quality review, per
the standing instruction to work through the full module list
autonomously. Phase 2 (audio, video, infographic) remains open for all
modules except hash-tables.

**Final course-wide analogy sweep (2026-08-26).** Requested by the user
as a dedicated final pass, separate from Phase 1: grepped all 83 concept
lessons across every module for real-world-analogy language, hand-
verified every zero-hit result against false positives (several modules
use an analogy introduced in an earlier sibling lesson and only
reference it lightly — hash-tables' "mailroom clerk" and math-for-dsa's
"Archive/Archivist" both checked out fine despite a raw zero count), and
compiled a genuine-gap list ranked by value. Reported to the user before
editing; user approved both the high-value and moderate lists.
Implemented:

- **Arrays** (`contiguous-memory.md`, `dynamic-arrays.md`,
  `stable-compaction-cyclic-placement.md`): added a sustained
  train-of-coupled-cars analogy across all three lessons — this reverses
  an earlier explicit "no forced analogy" policy call for this module
  (see `docs/superpowers/plans/analogies/arrays.md` addendum for the
  reasoning).
- **Linked Lists** (`nodes-and-pointers.md`, `build-a-linked-list.md`):
  added a scavenger-hunt analogy — also reverses an earlier explicit
  rejection of the same idea (see the linked-lists.md addendum).
  `pointer-surgery.md` untouched (already has a runners-on-a-track
  analogy for fast/slow pointers).
- **Graphs** (`shortest-paths.md`, `topological-sort.md`,
  `minimum-spanning-trees.md`): added GPS/road-trip, getting-dressed,
  and town-planner analogies respectively — these three were the only
  lessons in an otherwise-analogized module left without one; not a
  reversal, just closing an incomplete pass (see graphs.md addendum).
- **Two Pointers** (`converging-pointers.md`): added a sorted-shelf/
  two-shoppers analogy — reverses an earlier explicit rejection (see the
  two-pointers.md addendum). `partition-pointers.md` untouched (already
  has a laundry-sorting analogy).
- **Strings** (`strings-in-memory.md`): reused the Arrays module's train
  analogy, extended naturally by "every car is welded shut" for
  immutability. The other two lessons untouched (algorithmic/API-cost
  content, no spatial hook).

Investigated but left unchanged after finding they already have adequate
grounding on closer reading (initial grep flagged them as gaps, but they
were false positives): `queues/fifo-basics.md` (bus-seat-shuffle
analogy for the head-index trick) and `sliding-window/fixed-size-
windows.md` (crop-box-dragged-across-an-image analogy for the slide
update) — both already carry a one-line physical analogy that a
narrower grep pattern missed.

No math, derivation, complexity claim, or worked trace was altered
anywhere in this pass — every edit is prose-only, additive, and placed
alongside existing correct content. Concept maps unchanged (all already
registered from Phase 1).

## Phase 2 media generation — in progress (started 2026-08-26)

User decision (2026-08-26): fix the Infographic pipeline before generating
at scale (see below), then generate Infographic → Video (Cinematic only,
Explainer excluded per user instruction) → Audio for every module,
working until each day's quota is exhausted, fully autonomously.

**Infographic style fix.** The 6 original hash-tables infographics (shipped
in Task A) turned out wildly inconsistent — 6 different palettes/
illustration styles, none matching the site's flat "Blueprint" design
system, and none theme-aware (a light-background infographic renders as a
jarring bright rectangle in dark mode — confirmed live in the browser).
Root cause: the old prompt template (§3.4) said "in the visual style
already established (see prior modules' infographics to match)" — a
vague, visual-reference instruction NotebookLM couldn't actually hold
consistent. Replaced with a mechanical spec locked to codebase tokens:
background `#F1F4F9`, ink `#1E293B`, ONE accent per module (its
`familyTheme.ts` family hex), flat 2D vector line art, explicit "NO drop
shadows / NO 3D / NO gradients / NO glow / NO photorealism," and "use
only this lesson's own established analogy, do not invent a new scene."
Full updated template lives in
`docs/superpowers/specs/2026-08-24-course-media-rollout.md` §3.4.
Regenerated all 6 hash-tables infographics with the new prompt — visibly
consistent (flat silhouette figures, single accent color, no shadows/
gradients) — verified side-by-side against the originals before rolling
out further.

**Discovered: three separate daily quotas, not one.** NotebookLM caps
Infographic generation, Cinematic Video generation, and Audio Overview
generation independently per account (not per-notebook — confirmed by
testing a fresh notebook after Infographic capped and getting the same
"reached your daily limit" on the next attempt). Within Video/Audio,
there's also a per-notebook **concurrency** cap of 2 simultaneous
in-flight generations — a 3rd request in the same notebook silently
no-ops until a slot frees up (not a dialog error, just nothing happens;
learned to always verify the Studio panel's item count after a submit
rather than trust the click succeeded).

**Session 1 (2026-08-26) results before all three quotas exhausted:**

| Asset | Modules touched | Count |
| --- | --- | --- |
| Infographic | hash-tables (6/6), graphs (6/6), intervals (1/1), tries (1/1), heaps (2/2), bst (2/2), binary-trees (4/4), recursion-backtracking (3/3), sorting (4/4), binary-search (2/3 — `binary-search-on-the-answer` missing, capped mid-request) | 31 |
| Cinematic Video | graphs only: `graph-representation`, `dfs-and-bfs-on-graphs` (2/6) — account-wide cap hit on the 3rd request, before it could reach any other module | 2 |
| Audio Overview | graphs (6/6), intervals (1/1), tries (1/1), heaps (2/2), bst (2/2), binary-trees (4/4), recursion-backtracking (3/3), sorting (4/4), binary-search (1/3 — `boundary-search` and `binary-search-on-the-answer` missing, capped mid-module) | 24 |

**Not yet started (Phase 2):** sliding-window, two-pointers, queues,
stacks, linked-lists, arrays, strings, math-for-dsa, big-o,
getting-started (all have notebooks already, per Phase 1) — plus greedy,
dynamic-programming, prefix-sum, matrix, which have **no notebook yet**
and need one created (paste-sources, same as the Phase 1 onboarding
flow) before any asset generation can start there.

**Retrieval still blocked exactly as documented in Task A**: every asset
generated above exists only inside its NotebookLM notebook. Getting them
into `web/public/media/<module>/` requires the user to download each one
manually (the notebook UI's download button, or opening the file's
direct `https://lh3.googleusercontent.com/notebooklm/...` URL in their
own authenticated browser — tested faster than the download-button
click-through) and hand the files off. None of that happened this
session (user signed off before any download pass), so **zero of this
session's 57 new assets are landed in the repo yet** — this is purely
generation, not shipped media.

**Next session: resume in this order** — (1) once Infographic quota
resets, finish `binary-search-on-the-answer`'s infographic and move to
sliding-window through getting-started, in tracker order; (2) once Video
quota resets, resume at graphs lesson 3 (`topological-sort`) and
continue through the same module order — 2 Cinematic videos/day
account-wide means this is the slow one, budget ~12 days minimum to
cover all ~65 non-hash-tables concept lessons at 2/day, worth asking the
user whether that pace is acceptable or whether Explainer should be
reconsidered; (3) once Audio quota resets, finish `boundary-search` and
`binary-search-on-the-answer`, then continue past binary-search.

**Notebooks created for the 4 previously-missing modules (2026-08-26,
same session, after all three quotas exhausted — notebook creation and
source upload have no quota dependency, only generation does):**
`greedy`, `prefix-sum`, `matrix`, and `dynamic-programming` each now
have a notebook with the module's concept-lesson content pasted as one
or two "Copied text" sources (condensed by hand from the shipped
lesson files, preserving every derivation, formula, and named analogy
so generation prompts can reference them exactly as with every other
module). Notebook titles are auto-generated by NotebookLM from the
source content: "Greedy Choice Property and Proving Correctness",
"The Odometer of Arrays: Mastery of Prefix Sums" (prefix-sum, despite
the name — NotebookLM titled it from the odometer analogy in lesson 1),
"Mastering Matrix Navigation and In-Place Transformations", "The
Foundations of Dynamic Programming and Optimization". All 24 modules
now have a notebook; the next session can start generation on any of
them immediately without an onboarding step.

Retrieval (download + compress + land in
`web/public/media/`) needs a dedicated user-present session for each
batch of completed assets — recommend batching it per-module or
per-week rather than per-asset to keep it from being 300+ individual
downloads.

**Notebooks renamed to the manifest convention (2026-08-31).** All 24
NotebookLM notebooks (one per module, per Phase 1/2 above) renamed from
their NotebookLM-auto-generated titles to `NN · Module Title`, using the
exact module number and title strings from `web/src/lib/course/
manifest.ts` — e.g. "The Mechanics of Contiguous Memory and Array
Performance" → "04 · Arrays & Dynamic Arrays". This makes the notebook
grid sort and scan in course order instead of by whatever headline
NotebookLM generated from each module's pasted content. `06 · Hash
Tables` was already named this way from Phase 1 (Task A) and needed no
change; the other 23 were renamed this session. The unrelated "Enterprise
Agent Orchestration" notebook (not part of this course) was left
untouched.

Renaming method note for future sessions: NotebookLM's inline notebook
title field (click the title in the notebook's own header) does **not**
save on `cmd+a` + type + Return — that sequence visibly updates the
field but silently reverts to the old title on reload. The reliable
sequence is `triple_click` the title (selects existing text) → `type`
the replacement → `left_click` elsewhere on the page to blur (never
Return) — confirmed persisted via a hard page reload after every rename
in this pass. The notebook-grid's "⋮" → "Edit title" modal (a separate
UI path, used for the very first rename in this pass, Tries) also
persists correctly via its own Save button; either path works, but the
inline-title method is faster once you're inside a notebook.

Downloaded/landed-asset tracking has moved to its own file:
`docs/superpowers/plans/2026-08-31-media-assets-tracker.md` — this file
stays focused on prose/analogy/mind-map/generation status per the
columns above; that one tracks retrieval (download → compress → land in
`web/public/media/`) per asset, which is a distinct, user-present-only
step from generation.
