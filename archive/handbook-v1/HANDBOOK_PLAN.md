# Handbook Plan

The complete outline and progress checklist for the DSA Pattern Handbook. Update
the checkboxes as chapters are drafted, reviewed, and finalized.

**Status: v1.1 — content complete (depth rewrite).** Gate A metrics pass for all
Part 2 patterns (word count ≥800, 10 sections, 3E/3M/2H). Greedy promoted;
Graph Traversal rewritten; Sorting identity = sort-then-scan.

Target size: **80–120 pages**, 20–30 chapters, heavy diagram use, minimal filler.

Legend: `[ ]` not started · `[~]` drafted / rewrite pending · `[x]` done (Gate C)

---

## Part 1 — Foundations (~10 pages)

- [x] Chapter 1 — How to Solve Any DSA Problem
  - The universal framework: Understand → Brute Force → Observe Patterns →
    Choose Data Structure → Optimize → Analyze Complexity
  - False-pattern example (Two Sum is not a window)
- [x] Chapter 2 — Big O in Practical Terms
  - O(1), O(log n), O(n), O(n log n), O(n²) explained with real-world analogies,
    not proofs. "Can this run on 100 inputs? 100,000? 10 million?"
- [x] Chapter 3 — Pattern Recognition
  - Introduce the seven pattern families and why almost every interview
    question belongs to one of them.

## Part 2 — The Seven Pattern Families (~56–70 pages)

Each pattern within a family gets the full structure defined in
[`HANDBOOK_STYLE_GUIDE.md`](HANDBOOK_STYLE_GUIDE.md). Depth target ~800–1200
words per pattern (Hash Maps = quality bar).

- [x] Family 1 — Linear Traversal
  - [x] Arrays
  - [x] Hash Maps
  - [x] Hash Sets
  - [x] Prefix Sum
- [x] Family 2 — Pointer Movement
  - [x] Two Pointers
  - [x] Sliding Window
  - [x] Fast & Slow Pointers
  - [x] Linked List Pointer Manipulation
- [x] Family 3 — Ordering & Search
  - [x] Sorting _(sort-then-scan identity)_
  - [x] Binary Search
  - [x] Intervals
  - [x] Sweep Line
- [x] Family 4 — Recursive Exploration
  - [x] DFS
  - [x] Tree Traversals (preorder / inorder / postorder)
  - [x] Divide and Conquer
  - [x] Backtracking
- [x] Family 5 — State Transition
  - [x] Memoization
  - [x] Dynamic Programming
  - [x] Greedy _(full 10-section pattern)_
- [x] Family 6 — Relationships
  - [x] BFS
  - [x] Graph Traversal _(representation + BFS vs DFS selection)_
  - [x] Union Find (Disjoint Set)
  - [x] Topological Sort
  - [x] Dijkstra
  - [x] Minimum Spanning Tree
- [x] Family 7 — Priority Structures
  - [x] Stack
  - [x] Queue
  - [x] Heap / Priority Queue _(Top K Frequent template)_
  - [x] Monotonic Stack
  - [x] Trie

## Part 3 — Pattern Recognition Guide (~15 pages)

- [x] Decision-tree walkthroughs ("Is data contiguous? → Need longest? → Sliding
      Window") for each family
- [x] The consolidated recognition cheat sheet (see `DECISION_TREES.md`)
- [x] Dual-home ownership table (Prefix vs Map, Set vs Map, Greedy vs DP, …)

## Part 4 — Pattern Cheat Sheets (~10 pages)

- [x] One page per pattern: Recognition, Template, Complexity, Data Structure,
      Common Questions, Interview Frequency, Difficulty
- [x] Family 5 includes full Greedy card

## Part 5 — Practice Roadmap (~10 pages)

- [x] 5–8 hand-picked questions per pattern with a one-line note on why each one
      matters (see `QUESTION_BANK.md` for the full pool to select from)
- [x] Greedy practice shortlist under Family 5

---

## Guiding Principle

> One concept per page. One pattern per spread. One memorable visual per pattern.

## Total Budget

| Section            | Pages        |
| ------------------ | ------------ |
| Foundations        | 10           |
| 7 Pattern Families | 56–70        |
| Recognition Guide  | 15           |
| Cheat Sheets       | 10           |
| Practice Roadmap   | 10           |
| **Total**          | **~100–115** |
