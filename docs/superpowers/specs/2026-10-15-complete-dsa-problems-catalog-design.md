# Complete LeetCode DSA Problems Catalog & Advanced Filters — Design

**Date:** 2026-10-15  
**Status:** Draft / Ready for Review  
**Target:** `web/src/app/problems`, `web/src/lib/course/`, `web/src/components/problems/`

---

## 1. Problem & Context

Currently, the `/problems` page in the LeetExpert web application (`src/app/problems/page.tsx`) renders only the problems curated within the 24 DSA course modules (~111 problems). 

While these in-course problems provide fully interactive code sandboxes with dual-runtime test verification, learners preparing for technical interviews require:
1. **Access to the complete DSA landscape**: A catalog covering canonical curated tiers (**Blind 75**, **NeetCode 150**, **LeetCode Top Interview 150**, **Striver's SDE**, and the broader **LeetCode DSA Catalog** across 60+ topic tags).
2. **Multi-dimensional filtering**: Filtering by curated list, difficulty, solved status, topic/category, and pattern, combined with full-text and problem-number search.
3. **Seamless dual-destination routing**:
   - Problems that exist in our course launch our **interactive in-app sandbox** (`/courses/dsa/<module>/<slug>`).
   - Problems outside our current course curriculum launch the official **LeetCode problem statement** in a new tab (`https://leetcode.com/problems/<slug>/`).
4. **Persistent progress tracking**: Solved status automatically syncs from completed course sandboxes, with optional manual toggle tracking for external LeetCode problems.

This specification defines the architecture, data schemas, filtering engine, UI components, and design system integration for the complete DSA problems catalog in LeetExpert.

---

## 2. Scope & Non-Goals

### In Scope
- **Comprehensive DSA problem dataset**: Structured catalog of essential and canonical LeetCode DSA problems with metadata (LeetCode ID, title, slug, difficulty, primary topics, patterns, list memberships, and course lesson mapping).
- **Curated list selector**: Fast switching between curated subsets:
  - *All LeetCode DSA*
  - *In-Course Drills* (problems with interactive sandboxes)
  - *Blind 75*
  - *NeetCode 150*
  - *LeetCode Top Interview 150*
- **Advanced multi-filter controls**:
  - Curated List preset
  - Difficulty: *All*, *Easy*, *Medium*, *Hard*
  - Status: *All*, *Solved*, *Unsolved*
  - Topics: Multi-select categorized tags with search and problem counts
- **Sort & Search**:
  - Full-text search supporting problem title, slug, pattern, and problem number (e.g., `#1` or `1`).
  - Sort by: Problem ID (default), Title, Difficulty, and Solved status.
- **Dual-target row component**: Clean distinction between interactive in-course problems and external LeetCode problems.
- **Desktop sidebar & mobile bottom sheet**: Consistent with existing responsive layout and accessibility standards.

### Non-Goals (Explicitly Out of Scope)
- Generating 3,000+ interactive markdown lesson sandboxes (the catalog provides links to LeetCode for problems outside the course curriculum).
- Backend database or user account sync for external checkmarks (stored in client-side `localStorage` through the existing progress architecture).
- Company-specific premium paywalled data scraping.

---

## 3. Data Architecture & Schemas

### 3.1 Problem Catalog Item Definition
A new schema and dataset located in `web/src/lib/course/catalog/types.ts`:

```typescript
export type Difficulty = "Easy" | "Medium" | "Hard";

export type CuratedListId =
  | "all"
  | "course"
  | "blind75"
  | "neetcode150"
  | "top150";

export interface CatalogProblem {
  /** Official LeetCode problem number (e.g. 1, 15, 42). */
  id: number;
  /** LeetCode URL slug (e.g. "two-sum", "trapping-rain-water"). */
  slug: string;
  /** Human-readable title. */
  title: string;
  /** Official difficulty rating. */
  difficulty: Difficulty;
  /** Primary category / topic tags (e.g. ["Arrays", "Two Pointers"]). */
  topics: string[];
  /** Algorithmic pattern (e.g. "Converging Pointers", "Monotonic Stack"). */
  pattern?: string;
  /** Curated lists this problem belongs to. */
  lists: CuratedListId[];
  /** Course module slug if implemented in LeetExpert, else null. */
  courseModuleSlug?: string;
  /** Course lesson slug if implemented in LeetExpert, else null. */
  courseLessonSlug?: string;
}
```

### 3.2 Dataset Location
The full catalog data is stored as a statically compiled JSON / TypeScript artifact:
- `web/src/data/problems/leetcodeCatalog.json` (or `.ts`)
- Merged with existing `manifest.ts` at build time so existing course lessons automatically link to their respective `courseModuleSlug` and `courseLessonSlug`.

---

## 4. Filter Semantics & Pure Logic Engine

To maintain high testability and prevent boundary defects, filtering logic is isolated in `web/src/lib/course/catalogFilters.ts`:

```typescript
export interface CatalogFilterOptions {
  query: string;
  list: CuratedListId;
  difficulty: "All" | Difficulty;
  status: "All" | "Solved" | "Unsolved";
  topics: Set<string>;
  solvedIds: Set<number | string>;
  sortBy: "id" | "title" | "difficulty" | "status";
  sortOrder: "asc" | "desc";
}
```

### Filter Rules
1. **List Selection**: When `list !== "all"`, problem must have `p.lists.includes(list)`. When `list === "course"`, problem must have `p.courseModuleSlug != null`.
2. **Difficulty**: Matches `opts.difficulty === "All" || p.difficulty === opts.difficulty`.
3. **Status**:
   - Course problems check `lessonId(p.courseModuleSlug, p.courseLessonSlug)`.
   - External problems check `p.id` or `p.slug`.
   - `Solved`: Must be in `solvedIds`.
   - `Unsolved`: Must not be in `solvedIds`.
4. **Topics**: An empty `topics` set means **unrestricted** (matches all). Non-empty set requires at least one intersection (`p.topics.some(t => opts.topics.has(t))`).
5. **Search Query**:
   - If query starts with `#` or is purely numeric, perform exact / prefix match on `p.id`.
   - Otherwise, perform case-insensitive substring match against `p.title`, `p.slug`, `p.pattern`, and `p.topics`.
6. **Compound Operator**: Query AND List AND Difficulty AND Status AND Topics.

---

## 5. UI & Layout Architecture

### 5.1 Page Layout (`/problems`)
The problems page retains its 2-column layout on desktop (`lg:grid lg:grid-cols-[280px_1fr]`) and single-column with bottom sheet on mobile:

```
+-----------------------------------------------------------------------+
|  Practice Hub Header                                                  |
|  [Total Problems: 450+]  [Solved: 42]  [Remaining: 408]  (Progress)  |
|                                                                       |
|  [ Search by problem name, #id, pattern, or tag...                ]   |
+------------------------------------+----------------------------------+
| Filters (Desktop Sidebar / Sheet)  | Problem List Toolbar             |
|                                    | List: [All] [Course] [Blind 75]  |
| Curated List:                      |       [NeetCode 150] [Top 150]   |
|   (o) All DSA                      | Sort: [ # ID v ]                 |
|   ( ) Course Sandbox Only          +----------------------------------+
|   ( ) Blind 75                     | Problems List                    |
|   ( ) NeetCode 150                 | [x] #1  Two Sum                  |
|   ( ) Top Interview 150            |     Arrays · Hash Map            |
|                                    |     [Easy] [In-Course Sandbox ->]|
| Difficulty:                        +----------------------------------+
|   [All] [Easy] [Medium] [Hard]     | [ ] #42 Trapping Rain Water      |
|                                    |     Two Pointers · Monotonic     |
| Status:                            |     [Hard] [In-Course Sandbox ->]|
|   [All] [Solved] [Unsolved]        +----------------------------------+
|                                    | [ ] #128 Longest Consec. Seq.    |
| Topics (with search & counts):     |     Arrays · Union Find          |
|   [x] Arrays & Hashing (68)        |     [Medium] [LeetCode ↗]        |
|   [ ] Two Pointers (32)            +----------------------------------+
|   [ ] Sliding Window (24)          | ...                              |
|   ...                              |                                  |
+------------------------------------+----------------------------------+
```

### 5.2 Problem Row Component (`CatalogProblemRow.tsx`)
Each row displays:
- **Status Indicator**: Checkbox circle. Filled with `--good` if solved, subtle border if unsolved. Clicking toggles solved status for external problems; course problems link to the sandbox where completion is earned.
- **Problem ID**: Formatted as `#ID` in `font-mono` (JetBrains Mono) with `--muted` tone.
- **Title**: Space Grotesk `font-medium`.
- **Destination Badge**:
  - *Course Problem*: Interactive badge (`bg-pop/10 text-pop border-pop/20`) with link to `/courses/dsa/<module>/<slug>`.
  - *External Problem*: Subtle external link badge (`text-muted group-hover:text-foreground`) with an arrow icon pointing to LeetCode.
- **Topic Pills**: Small muted topic tags.
- **Difficulty Pill**: Standard course token classes (`border-good/40 bg-good/10 text-good`, `warn`, `bad`).

---

## 6. Design System & Accessibility Compliance

In accordance with `CLAUDE.md` §4:
- **Tokens Only**: All colours route through existing CSS variables (`--pop`, `--accent`, `--mark`, `--elevated`, `--good`, `--warn`, `--bad`). No raw Tailwind palette classes (`green-500`, `blue-600`).
- **Typography**:
  - Display & Section titles: Space Mono (`font-display`).
  - Body & UI Controls: Space Grotesk (`font-sans-face`).
  - IDs, metrics, and difficulty badges: JetBrains Mono (`font-mono`).
- **Contrast**: All badge texts and foreground elements guarantee WCAG AA (4.5:1 ratio for body, 3:1 for interactive controls).
- **Accessibility**:
  - Real semantic HTML: `role="group"` on filter fieldsets, real `<input type="checkbox">` elements inside `<label>`.
  - Bottom sheet on mobile implements focus trap, `aria-modal="true"`, and restores focus to trigger on close.
  - Keyboard navigation: Full ArrowKey / Tab accessibility across problem rows.

---

## 7. Implementation Plan

| Phase | Milestone | Deliverables |
| :--- | :--- | :--- |
| **Phase 1** | **Dataset & Types** | Create `catalog/types.ts` and `data/problems/leetcodeCatalog.json`. Build compiler helper that attaches course module and lesson links. |
| **Phase 2** | **Filter & Sort Engine** | Implement `catalogFilters.ts` and comprehensive test suite `tests/catalogFilters.test.ts`. |
| **Phase 3** | **UI Components** | Build `CatalogProblemRow`, `CatalogFilterPanel`, and `CatalogCuratedListTabs`. |
| **Phase 4** | **Page Integration** | Update `/problems` to support the extended catalog with view toggling and persistent progress state. |
| **Phase 5** | **Verification** | Execute `tsc`, `eslint`, `vitest`, and `npm run build`. Verify light and dark themes in the browser. |

---

## 8. Verification & Test Plan

1. **Unit Tests (`tests/catalogFilters.test.ts`)**:
   - Filtering by each curated list (`course`, `blind75`, `neetcode150`, `all`).
   - Query matching by title, pattern, and problem number (`#42` and `42`).
   - Multi-topic inclusion / intersection.
   - Solved / Unsolved status filtering.
   - Sorting stability (ascending, descending by ID, title, difficulty).
2. **Quality Gates**:
   - `npm run check` (`tsc --noEmit`).
   - `npm run lint`.
   - `npm test`.
   - `npm run build`.
