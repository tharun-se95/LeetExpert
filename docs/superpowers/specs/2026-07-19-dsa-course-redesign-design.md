# DSA Course Redesign — Design Spec

**Date:** 2026-07-19
**Status:** Approved by Tharun (chat, 2026-07-19)

## Problem

The pattern-recognition handbook (7 pattern families, metaphor-heavy prose,
cheat sheets, practice roadmap) is not helping the user learn DSA properly.
All four gaps were confirmed:

1. No real depth/rigor — metaphors instead of mechanics, complexity reasoning, trade-offs.
2. No structured progression — reference material, not a sequenced course.
3. No active practice/assessment — nothing tests internalization.
4. Wrong organizing principle — interview trick-spotting instead of a CS curriculum.

**Decision:** retire the handbook content entirely and rebuild the site as a
full DSA course. Keep the UI shell, theme, motion system, lab visualization
primitives, and the whole `video/` project. Curriculum modeled on
algomaster.io's DSA course, trimmed and adapted.

## Goal

True DSA mastery first — correctness, complexity, trade-offs, implementation.
Interview skill falls out of that. Full skeleton designed now; content written
module-by-module afterward.

## Curriculum skeleton (24 modules, 5 stages)

**Stage 0 — Foundations:** 1. How to Learn This Course · 2. Big O & Complexity
Analysis · 3. Math for DSA

**Stage 1 — Linear structures:** 4. Arrays & Dynamic Arrays · 5. Strings ·
6. Hash Tables · 7. Linked Lists · 8. Stacks (incl. monotonic) · 9. Queues
(incl. deque/monotonic)

**Stage 2 — Techniques on linear data:** 10. Two Pointers · 11. Sliding
Window · 12. Prefix Sum (Kadane's as capstone) · 13. Binary Search ·
14. Sorting · 15. Matrix / 2D Traversal

**Stage 3 — Recursive & hierarchical:** 16. Recursion & Backtracking ·
17. Binary Trees · 18. BST & Ordered Structures · 19. Heaps · 20. Tries

**Stage 4 — Global reasoning:** 21. Intervals · 22. Greedy · 23. Graphs
(sub-staged internally) · 24. Dynamic Programming

Dropped from AlgoMaster: language crash courses, interview-strategy module,
warmup printing problems, Eulerian circuits, standalone Data Structure Design
(selected design problems folded into Hash Tables / Heaps).

## Content architecture

- Course content lives in repo-root **`course/<module-slug>/<lesson-slug>.md`**
  with YAML frontmatter (title, type, order). Loader follows the existing
  repo-root-read pattern (`web/src/lib/course/`).
- Module/stage metadata (titles, order, prerequisites, lesson lists, status)
  lives in **`web/src/lib/course/manifest.ts`**.
- Two lesson types sharing one layout: **concept** and **problem**.
- Markdown pipeline stays react-markdown; interactive blocks are custom
  fenced-code languages rendered as components:
  - ```` ```quiz ```` — JSON quiz block → `<Quiz>` (instant feedback, feeds progress store)
  - ```` ````tabs ```` — contains ```` ```python ```` and ```` ```typescript ````
    sub-fences → `<CodeTabs>` (both languages always present)
  - ```` ````reveal <label> ```` — markdown inside → `<Reveal>` progressive
    disclosure (hints, solutions; powers the solve-first flow)
  - ```` ```complexity ```` — JSON → standardized time/space box with reasoning
- Routes: `/course` (overview: stages, modules, progress) and
  `/course/[module]/[lesson]`. Home page becomes the course overview
  entry. Old routes removed: `/patterns`, `/cheat-sheets`, `/practice`,
  `/recognition`, `/question-bank`, `/decision-trees`, `/foundations`,
  `/glossary`, `/pdf`, `/print`.
- Untouched: `AppShell` chrome, theme, motion, `components/lab` primitives,
  `video/`.

## Lesson formats (quality bar)

**Concept lesson:** motivation (what breaks without it) → mechanics (how it
works in memory, with visualization) → operations & complexity *with
reasoning* → implementation from scratch (Python + TypeScript) → trade-offs
vs. alternatives → quiz.

**Problem lesson (solve-first):** statement + examples + constraints →
attempt gate → progressive hints → brute force + complexity → the insight →
optimal approach → code (both languages) → complexity → variants. ~8–15
curated problems per module, every one with full treatment.

## Practice mechanics (v1)

- localStorage lesson completion + module progress bars (reuse
  ProgressProvider approach; new storage key, lesson-level ids).
- Quiz results feed the same local store.
- Deferred: spaced repetition, in-browser code execution, accounts/sync.

## Retirement & build order

1. Root markdown (part-1…part-5, GLOSSARY, QUESTION_BANK, DECISION_TREES,
   HANDBOOK_*) → `archive/handbook-v1/` in one commit; README rewritten.
2. Phase 1 (this cycle): content infrastructure, component library, `/course`
   routes with all 24 modules visible (unwritten ones "coming soon"),
   Module 1 (orientation) + Module 2 (Big O) written to completion as the
   quality bar.
3. Subsequent modules in curriculum order, each its own cycle.
