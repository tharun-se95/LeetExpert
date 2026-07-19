# DSA Course

A full Data Structures & Algorithms course website — built for real mastery,
not pattern-spotting shortcuts. Every module teaches the structure or
technique from first principles: why it exists, how it works in memory,
what its operations cost *and why*, implemented from scratch in Python and
TypeScript, then drilled with curated solve-first problems and quizzes.

## Live site

| | |
| --- | --- |
| Live | [dsa-handbook-seven.vercel.app](https://dsa-handbook-seven.vercel.app) |
| Repo | [tharun-se95/dsa-handbook](https://github.com/tharun-se95/dsa-handbook) |
| CI | GitHub Actions — lint + production build on `main` / PRs |
| CD | Vercel — production deploy on push to `main` (Root Directory = `web`) |

```bash
cd web
npm install
npm run dev
```

## Curriculum (24 modules, 5 stages)

| Stage | Modules |
| --- | --- |
| 0 — Foundations | How to Learn This Course · Big O & Complexity Analysis · Math for DSA |
| 1 — Linear structures | Arrays & Dynamic Arrays · Strings · Hash Tables · Linked Lists · Stacks · Queues |
| 2 — Techniques on linear data | Two Pointers · Sliding Window · Prefix Sum · Binary Search · Sorting · Matrix Traversal |
| 3 — Recursive & hierarchical | Recursion & Backtracking · Binary Trees · BST & Ordered Structures · Heaps · Tries |
| 4 — Global reasoning | Intervals · Greedy · Graphs · Dynamic Programming |

Content is written module-by-module in curriculum order. Modules without
content yet appear on the site as "coming soon."

## How this repo is organized

```
DSA/
├── course/                  Course content — one folder per module,
│                            one markdown lesson per file (frontmatter + custom blocks)
├── web/                     Next.js app (reads course/ at build time)
│   └── src/lib/course/      Curriculum manifest (stages, modules, lessons)
├── video/                   Remotion project for course videos
├── docs/superpowers/specs/  Design specs
└── archive/handbook-v1/     The retired v1 "pattern handbook" content
```

## Authoring lessons

Lessons are markdown with YAML frontmatter plus custom fenced blocks the web
app renders as interactive components:

- ```` ```quiz ```` — JSON multiple-choice quiz with instant feedback
- ```` ````tabs ```` — grouped ```` ```python ```` / ```` ```typescript ```` code tabs (both languages always)
- ```` ````reveal Label ```` — progressive disclosure (hints, solutions)
- ```` ```complexity ```` — standardized time/space box with reasoning

Two lesson types: **concept** (motivation → mechanics → operations & cost →
implementation → trade-offs → quiz) and **problem** (solve-first: statement →
attempt gate → hints → brute force → insight → optimal → variants).

See [the design spec](docs/superpowers/specs/2026-07-19-dsa-course-redesign-design.md)
for the full architecture and quality bar.
