# DSA Pattern Handbook

## Think in Patterns, Not Problems

A compact (~100 page) handbook that teaches Data Structures & Algorithms
through **pattern recognition** instead of memorization. Thousands of interview
questions shrink into a small set of repeating patterns. Once you can spot
"what pattern is this?", most new problems feel like remixed old ones.

This is **not** a traditional DSA textbook and **not** a dump of LeetCode
answers. It teaches you to name the pattern, understand *why* the idea works
(in plain language), and see where the same idea shows up in real software.

## Status

**v1.1 — content complete (depth rewrite).** All Part 2 patterns meet the Hash
Maps quality bar (≥800 words, full 10-section arcs, honest 3E/3M/2H lists).
Greedy is a full Family 5 pattern; Graph Traversal is a real representation +
selection chapter. Checklist in [`HANDBOOK_PLAN.md`](HANDBOOK_PLAN.md). Bit /
math / simulation remain optional appendix only (see Uncategorized in
`QUESTION_BANK.md`).

## Table of Contents

### Part 1 — Foundations
- [Ch 1 — How to Solve Any DSA Problem](part-1-foundations/chapter-01-solving-problems.md)
- [Ch 2 — Big O in Practical Terms](part-1-foundations/chapter-02-big-o.md)
- [Ch 3 — Pattern Recognition](part-1-foundations/chapter-03-pattern-recognition.md)

### Part 2 — Pattern Families
- [Family 1 — Linear Traversal](part-2-pattern-families/family-1-linear-traversal.md) (Arrays, Hash Maps, Hash Sets, Prefix Sum)
- [Family 2 — Pointer Movement](part-2-pattern-families/family-2-pointer-movement.md)
- [Family 3 — Ordering & Search](part-2-pattern-families/family-3-ordering-search.md)
- [Family 4 — Recursive Exploration](part-2-pattern-families/family-4-recursive-exploration.md)
- [Family 5 — State Transition](part-2-pattern-families/family-5-state-transition.md) _(Memoization, DP, Greedy)_
- [Family 6 — Relationships](part-2-pattern-families/family-6-relationships.md)
- [Family 7 — Priority Structures](part-2-pattern-families/family-7-priority-structures.md)

### Part 3 — Pattern Recognition Guide
- [Guide + walkthrough](part-3-pattern-recognition/README.md)
- [Practice stems](part-3-pattern-recognition/recognition-stems.md)
- [Decision Trees (source)](DECISION_TREES.md)

### Part 4 — Cheat Sheets
- [Index](part-4-cheat-sheets/README.md)
- Families [1](part-4-cheat-sheets/family-1-linear-traversal.md) ·
  [2](part-4-cheat-sheets/family-2-pointer-movement.md) ·
  [3](part-4-cheat-sheets/family-3-ordering-search.md) ·
  [4](part-4-cheat-sheets/family-4-recursive-exploration.md) ·
  [5](part-4-cheat-sheets/family-5-state-transition.md) ·
  [6](part-4-cheat-sheets/family-6-relationships.md) ·
  [7](part-4-cheat-sheets/family-7-priority-structures.md)

### Part 5 — Practice Roadmap
- [Index](part-5-practice-roadmap/README.md)
- Families [1](part-5-practice-roadmap/family-1-linear-traversal.md) ·
  [2](part-5-practice-roadmap/family-2-pointer-movement.md) ·
  [3](part-5-practice-roadmap/family-3-ordering-search.md) ·
  [4](part-5-practice-roadmap/family-4-recursive-exploration.md) ·
  [5](part-5-practice-roadmap/family-5-state-transition.md) ·
  [6](part-5-practice-roadmap/family-6-relationships.md) ·
  [7](part-5-practice-roadmap/family-7-priority-structures.md)

### Reference
- [Question Bank](QUESTION_BANK.md) · [Glossary](GLOSSARY.md) ·
  [Engineering Connections](references/ENGINEERING_CONNECTIONS.md) ·
  [Style Guide](HANDBOOK_STYLE_GUIDE.md) · [Plan](HANDBOOK_PLAN.md)

## How This Project Is Organized

```
DSA Pattern recognition/
│
├── .cursor/
│   ├── rules/              Persistent authoring rules the agent always follows
│   └── prompts/             Reusable prompt templates for common writing tasks
│
├── README.md                You are here
├── HANDBOOK_PLAN.md          Full outline + progress checklist
├── HANDBOOK_STYLE_GUIDE.md   The "constitution" — required structure & quality bar
├── GLOSSARY.md               One-paragraph explanations of core terms
├── QUESTION_BANK.md          Classic interview questions, grouped by pattern
├── DECISION_TREES.md         "What pattern is this?" recognition flowcharts
│
├── assets/
│   ├── diagrams/             Mermaid (.mmd) source diagrams
│   ├── images/                Rendered/exported images
│   ├── icons/                  Icon assets
│   └── covers/                  Cover art
│
├── part-1-foundations/        How to solve problems, Big O intuition, pattern families overview
├── part-2-pattern-families/    The 7 pattern families (one file per family)
├── part-3-pattern-recognition/ Recognition guide — decision trees turned into prose
├── part-4-cheat-sheets/        One page per pattern: recognition, template, complexity, mistakes
├── part-5-practice-roadmap/    Curated 5-8 question roadmap per pattern
│
└── references/                 External sources and further reading
```

## The Seven Pattern Families

| #   | Family                | Patterns                                                                            |
| --- | --------------------- | ----------------------------------------------------------------------------------- |
| 1   | Linear Traversal      | Arrays, Hash Maps, Hash Sets, Prefix Sum                                            |
| 2   | Pointer Movement      | Two Pointers, Sliding Window, Fast & Slow Pointer, Linked List Pointer Manipulation |
| 3   | Ordering & Search     | Sorting, Binary Search, Intervals, Sweep Line                                       |
| 4   | Recursive Exploration | DFS, Tree Traversals, Divide and Conquer, Backtracking                              |
| 5   | State Transition      | Memoization, Dynamic Programming                                                    |
| 6   | Relationships         | BFS, Graph Traversal, Union Find, Topological Sort, Dijkstra, Minimum Spanning Tree |
| 7   | Priority Structures   | Stack, Queue, Heap, Monotonic Stack, Trie                                           |

## Writing a Chapter

1. Check off the relevant item in [`HANDBOOK_PLAN.md`](HANDBOOK_PLAN.md).
2. Use the prompt in `.cursor/prompts/create-chapter.md` (adapt the pattern name).
3. Follow [`HANDBOOK_STYLE_GUIDE.md`](HANDBOOK_STYLE_GUIDE.md) — structure, diagrams,
   and length budget (**~800–1,200 words** per pattern + diagrams).
4. Run `.cursor/prompts/review-chapter.md` against the new chapter before marking
   it done.

## Versioning

Treat the handbook like software. Use Git, write meaningful commits ("Add Sliding
Window chapter", "Refine DP decision tree"), and release iteratively (v0.1, v0.2,
v1.0) rather than trying to finish it in one pass.
