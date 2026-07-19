# Glossary

Short, plain-English explanations of terms used in this handbook. Read a
definition in a few seconds — like a kid's dictionary for grown-up coding words.

Organized alphabetically within each family grouping for easier lookup.

---

## General

**Big O Notation** — A short name for "how work grows when the input gets
bigger," ignoring small constant details. `O(n)` means "roughly grows with the
input size."

**In-place** — Change the input itself instead of making a big new copy. Extra
space stays about `O(1)` (a few helpers).

**Amortized Complexity** — The *average* cost of an operation across many uses,
even if a few uses are expensive (like rare array resizing).

**Dual-Home Problem** — A question that honestly teaches two patterns. This
handbook goes deep under one owner and says "see also" under the other.

---

## Family 1 — Linear Traversal

**HashMap** — A labeled toy box: key → value. Lookup, insert, and delete are near
`O(1)` because a hash function turns the key into an array slot.

**Hash Set** — Membership-only version of a hash map: "have I seen this?" — no
counts or indices stored.

**Load Factor** — How full the hash table is (items ÷ buckets). Too full → more
collisions → slower ops.

**Collision** — Two different keys land in the same bucket. Handled by chaining
(lists per bucket) or open addressing (probe for the next free slot).

**Bucket** — One slot in the hash table's array; may hold several colliding
entries.

**Prefix Sum** — A running total written ahead of time,
`prefix[i] = sum(arr[0..i])`. Range sums become one subtraction instead of a
rescanning. **Subarray Sum Equals K** lives here (prefix frequencies), not under
Sliding Window, unless the window can shrink in a monotone way.

**Complement Lookup** — For target-sum problems: given `x`, look for the partner
`target - x` in a hash map of prior values.

---

## Family 2 — Pointer Movement

**Two Pointers** — Two fingers (indices) that move through a structure — often
from opposite ends or at different speeds — to avoid nested loops.

**Sliding Window** — A contiguous range `[left, right]` that grows and shrinks
over an array/string while you track a running property. Prefer when the
constraint is monotone (longest/shortest under a property) — not the default for
“count subarrays summing to K” with arbitrary integers.

**Fast & Slow Pointers** — Two references moving at different speeds (classically
1× and 2×) to find cycles or midpoints with almost no extra memory.

**Dummy Head** — A fake starter node before a list head so merge/insert edge
cases need no special empty-list branches.

---

## Family 3 — Ordering & Search

**Binary Search on Answer** — Binary search over a monotone range of *candidate
answers* (speeds, capacities), not just over array indices. Cut the guess space
in half.

**Interval** — A range `[start, end]` used in scheduling and merge problems.

**Sweep Line** — Sort start/end (or other) events and scan left→right while
keeping an active count or set (classic: minimum meeting rooms).

---

## Family 4 — Recursive Exploration

**Recursion** — A function that calls itself on a smaller version of the problem
until it hits a base case (like unpacking nested gift boxes).

**Backtracking** — Recursion that tries a choice, explores, then undoes
("puts the piece back") if it does not lead to a valid solution.

**Divide and Conquer** — Split into independent subproblems, solve them, then
combine (merge-sort style), including any cross-boundary case.

**Visited Set** — Marks nodes/cells already processed so graph/grid DFS/BFS
neither loops nor double-counts.

---

## Family 5 — State Transition

**Memoization** — Sticky notes for function answers: same inputs again → return
the cached result instead of recomputing.

**Dynamic Programming (DP)** — Break a problem into overlapping smaller pieces,
solve each once, and reuse those answers (via memoization or a table) to build
the final answer.

**Greedy** — Pick the locally best move at each step; valid only when a proof
(or well-known theorem) shows it yields a global best. Full Family 5 pattern
chapter (Jump Game / Gas Station class), not a cross-ref stub.

**State Transition** — The rule that computes `dp[state]` from already-solved
smaller states.

---

## Family 6 — Relationships

**Graph** — Nodes connected by edges — friends, roads, or dependencies drawn as
a map.

**Adjacency List** — Map from each node to its neighbor list; the usual sparse
graph representation in interviews.

**BFS** — Breadth-first search: explore by layers using a queue; finds
unweighted shortest paths (like ripples in a pond).

**Union Find (Disjoint Set)** — Tracks which elements are on the same team and
can merge two teams or ask "same team?" in near `O(1)`.

**Path Compression** — After `find(x)`, point nodes straight at the boss so
later finds are tiny — Union Find speed trick.

**Topological Sort** — An order of nodes in a directed acyclic graph so every
edge points from an earlier node to a later one — line up tasks with
prerequisites first.

**Dijkstra** — Shortest-path algorithm for graphs with non-negative edge weights,
driven by a min-heap of tentative distances.

**Relax** — Ask “can this neighbor get a better distance through me?” and update
if yes (Dijkstra / Bellman-Ford style).

**Settle** — Pop a node from Dijkstra’s priority queue as finished — with
non-negative weights its distance will never improve again.

**Minimum Spanning Tree (MST)** — A subset of undirected edges that connects all
vertices with minimum total weight and no cycles (Kruskal / Prim) — cheapest
wires that still link everyone.

---

## Family 7 — Priority Structures

**Stack** — Last-in, first-out (LIFO) — last plate on the pile comes off first.
Used for nesting, matching, and undo.

**Queue** — First-in, first-out (FIFO) — first in line, first served. Used for
fair order and BFS frontiers.

**Heap** — A tree that keeps the current min (or max) on top in `O(1)`, with
`O(log n)` insert/remove — always grab the current best.

**Monotonic Stack** — A stack kept strictly increasing or decreasing by popping
anything that would break the order before pushing — used to find the nearest
greater/smaller element efficiently.

**Trie (Prefix Tree)** — A tree where each path from the root spells a prefix —
fast prefix lookups (autocomplete, dictionaries), like a letter treasure map.
