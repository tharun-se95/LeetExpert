# Lessons vs Practice Separation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Separate Lessons (`/course…`) from Practice (`/problems…`): finish the Problems hub list, permanently redirect problem course URLs, add Header Lessons/Practice entry points, filter the Lessons sidebar to concepts + Practice chapters, and ship `type: practice` chapters with auto-listed hub links (arrays gold-template briefs; other modules honest placeholders).

**Architecture:** Extend the already-shipped hub helpers (`findProblemBySlug`, `groupedProblems`, `problemHref`, `solved` tracking, `/problems/[slug]`) with a new `LessonType` of `"practice"`, Lessons-nav filtering (`concept` + `practice` only), a `/problems` list page, `permanentRedirect` off course problem routes, and a `practice-problems` fence overlay merged against the module's manifest problem list. Lessons progress and Practice solved stay two independent meters.

**Tech Stack:** Next.js App Router, TypeScript strict, React client/server components, Vitest, gray-matter / js-yaml (transitive; declare direct if importing), Phosphor icons, handbook design tokens.

## Global Constraints

- TypeScript strict; no `any`, no unchecked casts to silence the compiler.
- All colour through handbook tokens — solved indicator is `bg-good/15 text-good` + `Check` (same vocabulary as `ProblemWorkspace` / sandbox pass pips). No `riso-stamp` for persistent solved state. No hardcoded Tailwind palette colours.
- Depth is flat (print language): no blur or drop shadows.
- Client components import icons from `@phosphor-icons/react`; Server Components from `@phosphor-icons/react/dist/ssr`.
- Do **not** embed sandboxes, full problem statements, or solutions inside Practice chapters — hub URLs only (`/problems/<slug>`).
- Do **not** link Practice chapter rows to `/course/<module>/<problem-slug>`.
- Practice chapters only on the 21 problem-bearing modules; never on `getting-started`, `big-o`, `math-for-dsa`.
- v1 content honesty: no fake filler difficulty/pattern text on non-gold modules; arrays is the gold-template module.
- `npx tsc --noEmit`, `npx eslint src tests`, `npm test`, and `npm run build` must all pass before a task is considered done.
- All commands below run from `/Users/tharunk/DSA/web` unless stated otherwise.
- Prefer `permanentRedirect` from `next/navigation` for problem course URLs (not temporary `redirect`).

## Already shipped (do not re-implement)

From `2026-07-30-problems-hub` (partial ship):

- `findProblemBySlug`, `getProblemNeighbors`, `groupedProblems`, `allProblemSlugs`
- `problemHref`, `lessonIdFromPathname` understanding `/problems/[slug]`
- `ProgressProvider` `solved` / `markSolved` / `totalProblemCount` (`dsa-course-solved`)
- `/problems/[slug]` → `ProblemWorkspace` (split-pane IDE)
- Sandbox `onSolved` → `markSolved`
- Problem-slug global uniqueness content-test invariant

## Conflicts with 2026-07-30 plan / shipped code

| 2026-07-30 claim or unfinished task | This plan |
| --- | --- |
| Task 8: sidebar keeps interleaved problem rows, href → hub | **Superseded** — drop individual problem rows; Practice chapter is the Lessons entry |
| Task 8: optional sidebar “Problems” link | **Superseded** — Header **Lessons** / **Practice** are primary |
| Task 7: `redirect()` for course problem URLs | Finish with **`permanentRedirect`** |
| Task 9: `/problems` list titled “Problems” | Finish as **Practice** naming (H1 + metadata) |
| `buildCourseNav` still maps problems via `lessonHref` | Filter problems out of nav entirely (do not rewrite to `problemHref` in sidebar) |
| Module overview lists every problem as a primary row | Concepts + Practice chapter only |
| Course lesson page still renders `ProblemLessonView` when `sandbox` present | Redirect problems; never render IDE on `/course/…` |
| `ProblemWorkspace` `backHref` → `moduleHref(module)` | Prefer `/course/<module>/practice` when Practice chapter exists |
| `visitedCount` / `totalCount` = all 191 lesson ids | Lessons meter = concept + practice only (96 after this plan) |

## File map

| File | Responsibility |
| --- | --- |
| `web/src/lib/course/manifest.ts` | `LessonType` + `"practice"`; `practiceLesson()`; append to 21 modules; `allLessonsNavIds()`; `isLessonsNavLesson()` |
| `web/src/lib/course/nav.ts` | `CourseNavLesson.type` includes `practice`; `buildCourseNav` filters to concept \| practice |
| `web/src/lib/course/load.ts` | `getLessonNeighbors` walks concept \| practice only |
| `web/src/lib/content/parsePracticeProblems.ts` | Parse YAML fence; merge with manifest; extract fence from markdown |
| `web/src/components/md/PracticeProblemsList.tsx` | Client list: title, hub link, optional brief fields, solved check |
| `web/src/components/problems/ProblemsListClient.tsx` | Practice hub list (grouped, search, solved summary) |
| `web/src/app/problems/page.tsx` | `/problems` route |
| `web/src/app/problems/[slug]/page.tsx` | Breadcrumbs / back → Practice chapter |
| `web/src/app/course/[module]/[lesson]/page.tsx` | `permanentRedirect` for problems; Practice `LessonView` + list |
| `web/src/app/course/[module]/page.tsx` | Module overview: concepts + Practice; problem-count metadata |
| `web/src/components/layout/Header.tsx` | Lessons / Practice text links + active states |
| `web/src/components/layout/AppShell.tsx` | Lessons-nav `totalCount` + id set for visited filter; simplify `isIdePath` |
| `web/src/components/providers/ProgressProvider.tsx` | Filter `visitedCount` to Lessons-nav ids |
| `web/src/components/layout/Sidebar.tsx` | Drop dead problem “P” badge; retitle “Course Overview” → “All modules” |
| `web/src/components/layout/SearchDialog.tsx` | Route `y === "problem"` → `/problems/<slug>`; practice badge |
| `web/src/components/course/LessonView.tsx` | `typeLabel` includes `"Practice"`; optional `afterMarkdown` slot |
| `course/<module>/practice.md` × 21 | Practice chapters (arrays gold; others honest short playbook) |
| `web/tests/manifestHelpers.test.ts` | `allLessonsNavIds` / practice helper coverage |
| `web/tests/nav.test.ts` | `buildCourseNav` filter + pathname for practice |
| `web/tests/neighbors.test.ts` | `getLessonNeighbors` skips problems |
| `web/tests/practiceProblems.test.ts` | Parser + merge + fence extract |
| `web/tests/content.test.ts` | Practice chapter invariants + fence slug ⊆ module problems |

---

### Task 1: `LessonType` practice + nav-id helpers

**Files:**
- Modify: `web/src/lib/course/manifest.ts`
- Test: `web/tests/manifestHelpers.test.ts`

**Interfaces:**
- Consumes: existing `MODULES`, `LessonMeta`
- Produces:
  - `export type LessonType = "concept" | "problem" | "practice"`
  - `practiceLesson(): LessonMeta` → `{ slug: "practice", title: "Practice", type: "practice" }`
  - `isLessonsNavLesson(l: LessonMeta): boolean` → `l.type === "concept" \|\| l.type === "practice"`
  - `allLessonsNavIds(): string[]` → `module/slug` for every concept + practice lesson across `MODULES` (same format as `allLessonIds`)

- [ ] **Step 1: Write the failing tests**

Append to `web/tests/manifestHelpers.test.ts`:

```ts
import {
  findProblemBySlug,
  getProblemNeighbors,
  groupedProblems,
  allProblemSlugs,
  practiceLesson,
  isLessonsNavLesson,
  allLessonsNavIds,
  MODULES,
} from "../src/lib/course/manifest";

describe("practiceLesson", () => {
  it("returns the fixed Practice chapter meta", () => {
    expect(practiceLesson()).toEqual({
      slug: "practice",
      title: "Practice",
      type: "practice",
    });
  });
});

describe("isLessonsNavLesson", () => {
  it("includes concept and practice, excludes problem", () => {
    expect(isLessonsNavLesson({ slug: "a", title: "A", type: "concept" })).toBe(
      true,
    );
    expect(
      isLessonsNavLesson({ slug: "practice", title: "Practice", type: "practice" }),
    ).toBe(true);
    expect(
      isLessonsNavLesson({ slug: "two-sum", title: "Two Sum", type: "problem" }),
    ).toBe(false);
  });
});

describe("allLessonsNavIds", () => {
  it("never includes a type: problem id", () => {
    const ids = allLessonsNavIds();
    for (const mod of MODULES) {
      for (const lesson of mod.lessons) {
        if (lesson.type !== "problem") continue;
        expect(ids).not.toContain(`${mod.slug}/${lesson.slug}`);
      }
    }
  });

  it("includes every concept lesson", () => {
    const ids = new Set(allLessonsNavIds());
    for (const mod of MODULES) {
      for (const lesson of mod.lessons) {
        if (lesson.type !== "concept") continue;
        expect(ids.has(`${mod.slug}/${lesson.slug}`)).toBe(true);
      }
    }
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/manifestHelpers.test.ts -t "practiceLesson|isLessonsNavLesson|allLessonsNavIds"`

Expected: FAIL — `practiceLesson` / `isLessonsNavLesson` / `allLessonsNavIds` are not exported

- [ ] **Step 3: Implement helpers**

In `web/src/lib/course/manifest.ts`, change the type and helpers:

```ts
export type LessonType = "concept" | "problem" | "practice";
```

Immediately after `function problem(...)`:

```ts
/** Fixed Practice chapter entry — always last in problem-bearing modules. */
export function practiceLesson(): LessonMeta {
  return { slug: "practice", title: "Practice", type: "practice" };
}

export function isLessonsNavLesson(lesson: LessonMeta): boolean {
  return lesson.type === "concept" || lesson.type === "practice";
}
```

Replace `allLessonIds` block with both helpers (keep `allLessonIds` for any legacy callers that need every markdown lesson including problems):

```ts
/** Every lesson id, including problems. Format: module/lesson. */
export function allLessonIds(): string[] {
  return MODULES.flatMap((m) => m.lessons.map((l) => `${m.slug}/${l.slug}`));
}

/**
 * Lessons-sidebar + Header progress denominator: concepts and Practice
 * chapters only — never individual problems.
 */
export function allLessonsNavIds(): string[] {
  return MODULES.flatMap((m) =>
    m.lessons
      .filter(isLessonsNavLesson)
      .map((l) => `${m.slug}/${l.slug}`),
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/manifestHelpers.test.ts -t "practiceLesson|isLessonsNavLesson|allLessonsNavIds"`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add web/src/lib/course/manifest.ts web/tests/manifestHelpers.test.ts
git commit -m "feat(course): add practice LessonType helpers and Lessons-nav ids"
```

---

### Task 2: Manifest entries + 21 `practice.md` files (usable, not gold)

**Files:**
- Modify: `web/src/lib/course/manifest.ts` (append `practiceLesson()` as last lesson in each of the 21 problem-bearing modules)
- Create: `course/<module>/practice.md` for each of:
  `arrays`, `strings`, `hash-tables`, `linked-lists`, `stacks`, `queues`, `two-pointers`, `sliding-window`, `prefix-sum`, `binary-search`, `sorting`, `matrix`, `recursion-backtracking`, `binary-trees`, `bst`, `heaps`, `tries`, `intervals`, `greedy`, `graphs`, `dynamic-programming`
- Test: `web/tests/content.test.ts`
- Test: `web/tests/manifestHelpers.test.ts` (extend count assertions)

**Interfaces:**
- Consumes: `practiceLesson()` from Task 1
- Produces: every problem-bearing module ends with `{ slug: "practice", title: "Practice", type: "practice" }`; matching `course/<module>/practice.md` on disk; concept-only modules unchanged

- [ ] **Step 1: Write failing content invariants**

Append to `web/tests/content.test.ts` (after the problem-slug uniqueness block is fine):

```ts
import { MODULES } from "../src/lib/course/manifest";

describe("Practice chapters", () => {
  it("every problem-bearing module has exactly one practice lesson, last", () => {
    const bad: string[] = [];
    for (const mod of MODULES) {
      const problems = mod.lessons.filter((l) => l.type === "problem");
      const practices = mod.lessons.filter((l) => l.type === "practice");
      if (problems.length === 0) {
        if (practices.length !== 0) {
          bad.push(`${mod.slug}: concept-only module has practice`);
        }
        continue;
      }
      if (practices.length !== 1) {
        bad.push(`${mod.slug}: expected 1 practice, found ${practices.length}`);
        continue;
      }
      const last = mod.lessons[mod.lessons.length - 1];
      if (last.type !== "practice" || last.slug !== "practice") {
        bad.push(`${mod.slug}: last lesson must be type/slug practice`);
      }
    }
    expect(bad).toEqual([]);
  });

  it("every practice.md on disk has type: practice frontmatter", () => {
    const bad: string[] = [];
    for (const lesson of LESSONS) {
      if (!lesson.rel.endsWith("/practice.md")) continue;
      const fm = /^---\n([\s\S]*?)\n---/.exec(lesson.body);
      if (!fm?.[1].includes("type: practice")) {
        bad.push(lesson.rel);
      }
    }
    expect(bad).toEqual([]);
  });

  it("practice-problems fence slugs are a subset of that module's problems", () => {
    const bad: string[] = [];
    const fence =
      /^(`{3,8})practice-problems\s*\n([\s\S]*?)^\1\s*$/gm;
    for (const lesson of LESSONS) {
      if (!lesson.rel.endsWith("/practice.md")) continue;
      const moduleSlug = lesson.rel.split("/")[0];
      const mod = MODULES.find((m) => m.slug === moduleSlug);
      if (!mod) {
        bad.push(`${lesson.rel}: unknown module`);
        continue;
      }
      const allowed = new Set(
        mod.lessons.filter((l) => l.type === "problem").map((l) => l.slug),
      );
      for (const m of lesson.body.matchAll(fence)) {
        const body = m[2];
        // Slug lines: "- slug: foo" (YAML list items)
        for (const sm of body.matchAll(/^\s*-\s+slug:\s*([^\s#]+)\s*$/gm)) {
          const slug = sm[1];
          if (!allowed.has(slug)) {
            bad.push(`${lesson.rel}: unknown slug "${slug}"`);
          }
        }
      }
    }
    expect(bad).toEqual([]);
  });
});
```

Also append to `web/tests/manifestHelpers.test.ts`:

```ts
describe("practice chapters in MODULES (after authoring)", () => {
  it("counts 21 practice lessons and 96 Lessons-nav ids", () => {
    const practices = MODULES.flatMap((m) =>
      m.lessons.filter((l) => l.type === "practice"),
    );
    expect(practices).toHaveLength(21);
    // 75 concepts + 21 practice = 96
    expect(allLessonsNavIds()).toHaveLength(96);
  });
});
```

- [ ] **Step 2: Run invariants — expect fail**

Run: `npx vitest run tests/content.test.ts -t "Practice chapters"`

Expected: FAIL — no practice lessons in MODULES / no practice.md files

- [ ] **Step 3: Append `practiceLesson()` to each of the 21 modules**

In `web/src/lib/course/manifest.ts`, for each problem-bearing module, add `practiceLesson(),` as the **last** entry in the `lessons` array (after the final `problem(...)`). Do this for all 21 modules listed in the Files section. Leave `getting-started`, `big-o`, and `math-for-dsa` without a practice entry.

Example for `arrays` (apply the same pattern to every other problem-bearing module):

```ts
      problem("product-except-self", "Product of Array Except Self"),
      practiceLesson(),
```

- [ ] **Step 4: Create non-gold `practice.md` files for all 21 modules**

For **every** module in the 21 list **including arrays for now** (arrays is enriched to gold in Task 12), create `course/<module>/practice.md` with this exact shape, substituting `MODULE_SHORT` with the module's `shortTitle` from the manifest (e.g. Arrays, Strings, Hash Tables):

```markdown
---
title: Practice
type: practice
---

## How to practice this module

Work the MODULE_SHORT problems in the order listed below. Each link opens
the Practice hub IDE — attempt the sandbox before reading the explanation.
Richer per-problem briefs for this module are tracked as a follow-up to the
Arrays gold template; the list itself is complete and ordered from the
manifest.

## Problems
```

(No `practice-problems` fence — the renderer auto-lists from the manifest.)

Use these `MODULE_SHORT` substitutions:

| module slug | MODULE_SHORT |
| --- | --- |
| arrays | Arrays |
| strings | Strings |
| hash-tables | Hash Tables |
| linked-lists | Linked Lists |
| stacks | Stacks |
| queues | Queues |
| two-pointers | Two Pointers |
| sliding-window | Sliding Window |
| prefix-sum | Prefix Sum |
| binary-search | Binary Search |
| sorting | Sorting |
| matrix | Matrix |
| recursion-backtracking | Recursion & Backtracking |
| binary-trees | Binary Trees |
| bst | BST |
| heaps | Heaps |
| tries | Tries |
| intervals | Intervals |
| greedy | Greedy |
| graphs | Graphs |
| dynamic-programming | Dynamic Programming |

- [ ] **Step 5: Run invariants — expect pass**

Run: `npx vitest run tests/content.test.ts -t "Practice chapters"`

Expected: PASS

Run: `npx vitest run tests/manifestHelpers.test.ts -t "practice chapters in MODULES"`

Expected: PASS — 21 practice lessons, 96 nav ids

- [ ] **Step 6: Commit**

```bash
git add web/src/lib/course/manifest.ts course/*/practice.md web/tests/content.test.ts web/tests/manifestHelpers.test.ts
git commit -m "feat(course): add Practice chapters to all 21 problem-bearing modules"
```

---

### Task 3: Filter Lessons nav + neighbors

**Files:**
- Modify: `web/src/lib/course/nav.ts`
- Modify: `web/src/lib/course/load.ts` (`getLessonNeighbors`)
- Modify: `web/src/components/layout/Sidebar.tsx` (remove problem “P” badge; retitle overview link)
- Test: `web/tests/nav.test.ts`
- Create: `web/tests/neighbors.test.ts`

**Interfaces:**
- Consumes: `isLessonsNavLesson` (Task 1); `lessonHref` (existing)
- Produces:
  - `CourseNavLesson.type: LessonType` narrowed in practice to `"concept" | "practice"` on nav rows
  - `buildCourseNav()` lesson rows = filtered `isLessonsNavLesson`, href always `lessonHref(module, slug)` (Practice stays a course URL)
  - `getLessonNeighbors(moduleSlug, lessonSlug)` flattens available modules' concept + practice only

- [ ] **Step 1: Write failing tests**

Append to `web/tests/nav.test.ts`:

```ts
import {
  problemHref,
  lessonIdFromPathname,
  lessonId,
  buildCourseNav,
  lessonHref,
} from "../src/lib/course/nav";

describe("buildCourseNav Lessons filter", () => {
  it("includes concepts and Practice, never individual problems", () => {
    const nav = buildCourseNav();
    const arrays = nav
      .flatMap((s) => s.modules)
      .find((m) => m.slug === "arrays");
    expect(arrays).toBeDefined();
    expect(arrays!.lessons.some((l) => l.type === "problem")).toBe(false);
    expect(arrays!.lessons.some((l) => l.slug === "remove-duplicates-sorted")).toBe(
      false,
    );
    const practice = arrays!.lessons[arrays!.lessons.length - 1];
    expect(practice).toEqual({
      id: lessonId("arrays", "practice"),
      title: "Practice",
      href: lessonHref("arrays", "practice"),
      type: "practice",
    });
  });

  it("omits Practice on concept-only modules", () => {
    const nav = buildCourseNav();
    const bigO = nav.flatMap((s) => s.modules).find((m) => m.slug === "big-o");
    expect(bigO!.lessons.every((l) => l.type === "concept")).toBe(true);
    expect(bigO!.lessons.some((l) => l.slug === "practice")).toBe(false);
  });
});
```

Create `web/tests/neighbors.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { getLessonNeighbors } from "../src/lib/course/load";

describe("getLessonNeighbors Lessons order", () => {
  it("skips individual problems between concepts and Practice", () => {
    // arrays concepts end at in-place-techniques; problems follow; Practice last.
    const fromInPlace = getLessonNeighbors("arrays", "in-place-techniques");
    expect(fromInPlace.next).toEqual({
      module: "arrays",
      lesson: "practice",
      title: "Practice",
    });

    const fromPractice = getLessonNeighbors("arrays", "practice");
    expect(fromPractice.prev).toEqual({
      module: "arrays",
      lesson: "in-place-techniques",
      title: "In-Place Techniques",
    });
    // Next module's first concept (strings)
    expect(fromPractice.next?.module).toBe("strings");
    expect(fromPractice.next?.lesson).not.toBe("valid-palindrome");
  });

  it("does not treat a problem slug as a Lessons neighbor anchor", () => {
    const orphan = getLessonNeighbors("arrays", "move-zeroes");
    expect(orphan.prev).toBeNull();
    expect(orphan.next).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests — expect fail**

Run: `npx vitest run tests/nav.test.ts -t "buildCourseNav" && npx vitest run tests/neighbors.test.ts`

Expected: FAIL — nav still includes problems; neighbors still walk problems

- [ ] **Step 3: Implement nav filter**

In `web/src/lib/course/nav.ts`:

```ts
import {
  MODULES,
  STAGES,
  findProblemBySlug,
  isLessonsNavLesson,
  type LessonType,
  type ModuleMeta,
} from "./manifest";

export interface CourseNavLesson {
  id: string;
  title: string;
  href: string;
  type: LessonType;
}
```

Replace the `lessons:` mapping inside `buildCourseNav`:

```ts
      lessons: m.lessons.filter(isLessonsNavLesson).map((l) => ({
        id: lessonId(m.slug, l.slug),
        title: l.title,
        href: lessonHref(m.slug, l.slug),
        type: l.type,
      })),
```

- [ ] **Step 4: Implement neighbor filter**

In `web/src/lib/course/load.ts`, update imports and `getLessonNeighbors`:

```ts
import {
  MODULES,
  getLesson,
  getModule,
  isLessonsNavLesson,
} from "./manifest";
```

```ts
/** Prev/next in Lessons-sidebar order (concept + practice; available modules). */
export function getLessonNeighbors(
  moduleSlug: string,
  lessonSlug: string,
): {
  prev: { module: string; lesson: string; title: string } | null;
  next: { module: string; lesson: string; title: string } | null;
} {
  const flat = MODULES.filter((m) => m.status === "available").flatMap((m) =>
    m.lessons.filter(isLessonsNavLesson).map((l) => ({
      module: m.slug,
      lesson: l.slug,
      title: l.title,
    })),
  );
  const idx = flat.findIndex(
    (e) => e.module === moduleSlug && e.lesson === lessonSlug,
  );
  if (idx < 0) return { prev: null, next: null };
  return {
    prev: idx > 0 ? flat[idx - 1] : null,
    next: idx < flat.length - 1 ? flat[idx + 1] : null,
  };
}
```

- [ ] **Step 5: Sidebar cleanup**

In `web/src/components/layout/Sidebar.tsx`:

1. Change the “Course Overview” label to `All modules` (href remains `/course`).
2. Remove the problem “P” badge block (`lesson.type === "problem" ? (…) : null`) — those rows no longer exist.

- [ ] **Step 6: Run tests — expect pass**

Run: `npx vitest run tests/nav.test.ts tests/neighbors.test.ts`

Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add web/src/lib/course/nav.ts web/src/lib/course/load.ts web/src/components/layout/Sidebar.tsx web/tests/nav.test.ts web/tests/neighbors.test.ts
git commit -m "feat(nav): Lessons sidebar and neighbors skip individual problems"
```

---

### Task 4: Lessons progress denominator filters out problems

**Files:**
- Modify: `web/src/components/providers/ProgressProvider.tsx`
- Modify: `web/src/components/layout/AppShell.tsx`
- Test: `web/tests/progressNavIds.test.ts` (new — pure helper re-export coverage; provider is client-only, so assert AppShell wiring via `allLessonsNavIds` length + a small pure filter helper)

**Interfaces:**
- Consumes: `allLessonsNavIds()` (Task 1)
- Produces:
  - `ProgressProvider` accepts `lessonProgressIds: readonly string[]`
  - `visitedCount` = number of visited ids that are in `lessonProgressIds`
  - `totalCount` prop remains the Lessons-nav length (96)
  - Visiting `/problems/<slug>` may still `markVisited` the problem id (unchanged `lessonIdFromPathname`); that id simply does not affect the Header chip

- [ ] **Step 1: Write failing test for the filter helper**

Add to `web/src/lib/course/nav.ts` (pure, easy to test):

```ts
/** Count visited Lessons-nav ids only (ignore problem drills in the chip). */
export function countLessonsProgress(
  visited: Iterable<string>,
  lessonProgressIds: ReadonlySet<string>,
): number {
  let n = 0;
  for (const id of visited) {
    if (lessonProgressIds.has(id)) n += 1;
  }
  return n;
}
```

Create `web/tests/progressNavIds.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { allLessonsNavIds } from "../src/lib/course/manifest";
import { countLessonsProgress, lessonId } from "../src/lib/course/nav";

describe("countLessonsProgress", () => {
  it("ignores problem ids even when present in visited", () => {
    const ids = new Set(allLessonsNavIds());
    const visited = [
      lessonId("arrays", "contiguous-memory"),
      lessonId("arrays", "move-zeroes"), // problem — must not count
      lessonId("arrays", "practice"),
    ];
    expect(countLessonsProgress(visited, ids)).toBe(2);
  });

  it("denominator set is 96 after Practice chapters ship", () => {
    expect(allLessonsNavIds()).toHaveLength(96);
  });
});
```

- [ ] **Step 2: Run test — expect fail on missing export**

Run: `npx vitest run tests/progressNavIds.test.ts`

Expected: FAIL — `countLessonsProgress` not exported

- [ ] **Step 3: Implement helper + wire ProgressProvider**

Add `countLessonsProgress` to `nav.ts` as shown in Step 1.

Update `ProgressProvider`:

```ts
import { countLessonsProgress } from "@/lib/course/nav";

export function ProgressProvider({
  children,
  totalCount,
  totalProblemCount,
  lessonProgressIds,
}: {
  children: React.ReactNode;
  totalCount: number;
  totalProblemCount: number;
  lessonProgressIds: readonly string[];
}) {
  // ... existing state ...

  const progressIdSet = useMemo(
    () => new Set(lessonProgressIds),
    [lessonProgressIds],
  );

  const value = useMemo(
    () => ({
      visited,
      markVisited,
      visitedCount: countLessonsProgress(visited, progressIdSet),
      totalCount,
      solved,
      markSolved,
      solvedCount: solved.size,
      totalProblemCount,
    }),
    [
      visited,
      markVisited,
      totalCount,
      solved,
      markSolved,
      totalProblemCount,
      progressIdSet,
    ],
  );
  // ...
}
```

Update `AppShell.tsx`:

```ts
import { allLessonsNavIds, allProblemSlugs, getLesson } from "@/lib/course/manifest";

// inside AppShell:
const lessonProgressIds = allLessonsNavIds();
const totalCount = lessonProgressIds.length;
const totalProblemCount = allProblemSlugs().length;

// ...
<ProgressProvider
  totalCount={totalCount}
  totalProblemCount={totalProblemCount}
  lessonProgressIds={lessonProgressIds}
>
```

Also simplify `isIdePath` — after redirects land (Task 7), course problem URLs never render; keep hub-only IDE detection now:

```ts
function isIdePath(pathname: string): boolean {
  return /^\/problems\/[^/]+\/?$/.test(pathname);
}
```

(Remove the unused `getLesson` import if nothing else needs it.)

- [ ] **Step 4: Run tests**

Run: `npx vitest run tests/progressNavIds.test.ts`

Expected: PASS

Run: `npx tsc --noEmit`

Expected: exit 0

- [ ] **Step 5: Commit**

```bash
git add web/src/lib/course/nav.ts web/src/components/providers/ProgressProvider.tsx web/src/components/layout/AppShell.tsx web/tests/progressNavIds.test.ts
git commit -m "fix(progress): Header lessons chip counts concepts and Practice only"
```

---

### Task 5: Header Lessons / Practice links

**Files:**
- Modify: `web/src/components/layout/Header.tsx`

**Interfaces:**
- Consumes: `usePathname` from `next/navigation`
- Produces: two text links — Lessons → `/course`, Practice → `/problems` — with active styles matching Sidebar pop block (`bg-pop font-semibold text-on-pop`); neither active on `/`

- [ ] **Step 1: Implement Header links**

Replace the brand `Link` + search layout so Lessons / Practice sit between brand and search on all breakpoints. Full component body for the nav portion:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { List as Menu, X, MagnifyingGlass } from "@phosphor-icons/react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useProgress } from "@/components/providers/ProgressProvider";
import { cn } from "@/lib/utils";

// ... HeaderProps unchanged ...

export function Header({
  sidebarOpen,
  onToggleSidebar,
  onOpenSearch,
  showSidebarToggle = true,
}: HeaderProps) {
  const pathname = usePathname();
  const { visitedCount, totalCount } = useProgress();
  const pct = totalCount > 0 ? Math.round((visitedCount / totalCount) * 100) : 0;

  const lessonsActive =
    pathname === "/course" || pathname.startsWith("/course/");
  const practiceActive =
    pathname === "/problems" || pathname.startsWith("/problems/");

  const modeLinkClass = (active: boolean) =>
    cn(
      "rounded-[4px] px-2 py-1 text-[13px] font-medium transition-colors",
      active
        ? "bg-pop font-semibold text-on-pop"
        : "text-muted hover:bg-surface hover:text-foreground",
    );

  return (
    <header className="print:hidden sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-background px-4">
      {showSidebarToggle ? (
        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted transition hover:bg-surface hover:text-foreground lg:hidden"
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? "Close navigation" : "Open navigation"}
        >
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      ) : null}

      <Link href="/" className="flex min-w-0 items-center gap-2">
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[length:var(--radius-md)] bg-pop font-mono text-[13px] font-bold text-on-pop"
          aria-hidden
        >
          {"</>"}
        </span>
        <span className="truncate text-sm font-semibold tracking-tight">
          <span className="text-foreground">code</span>
          <span className="text-accent">Macha</span>
        </span>
      </Link>

      <nav
        className="flex shrink-0 items-center gap-1"
        aria-label="Product modes"
      >
        <Link href="/course" className={modeLinkClass(lessonsActive)}>
          Lessons
        </Link>
        <Link href="/problems" className={modeLinkClass(practiceActive)}>
          Practice
        </Link>
      </nav>

      <div className="flex min-w-0 flex-1 items-center justify-end gap-3">
        <button
          type="button"
          onClick={onOpenSearch}
          aria-label="Search lessons and problems"
          className="flex items-center gap-2 rounded-full border border-border px-2.5 py-1 text-[11px] text-muted transition-colors hover:border-accent/50 hover:text-foreground"
        >
          <MagnifyingGlass size={12} aria-hidden />
          <span className="hidden sm:inline">Search</span>
          <kbd className="hidden font-mono text-[10px] sm:inline">⌘K</kbd>
        </button>

        <div className="hidden items-center gap-2 sm:flex">
          <div
            className="flex items-center gap-2 rounded-full border border-border px-2.5 py-1 text-[11px] text-muted"
            title={`${visitedCount} of ${totalCount} lessons completed`}
          >
            <span className="h-1.5 w-16 overflow-hidden rounded-full bg-surface">
              <span
                className="block h-full rounded-full bg-accent transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </span>
            <span className="tabular-nums">
              {visitedCount}/{totalCount}
            </span>
          </div>
        </div>

        <ThemeToggle />
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Typecheck / lint**

Run: `npx tsc --noEmit && npx eslint src/components/layout/Header.tsx`

Expected: exit 0

- [ ] **Step 3: Browser check (manual)**

With `npm run dev` running, confirm:

- `/` — neither link active
- `/course` and `/course/arrays/practice` — Lessons active
- `/problems` and `/problems/two-sum` — Practice active

- [ ] **Step 4: Commit**

```bash
git add web/src/components/layout/Header.tsx
git commit -m "feat(header): add Lessons and Practice mode links"
```

---

### Task 6: Module overview — concepts + Practice only

**Files:**
- Modify: `web/src/app/course/[module]/page.tsx`

**Interfaces:**
- Consumes: `isLessonsNavLesson`, `practiceLesson` shape; `lessonHref`
- Produces: primary list = filtered Lessons-nav lessons; muted “N problems in Practice” line linking to `/course/<module>/practice` when N > 0

- [ ] **Step 1: Rewrite the available-module lesson list**

Replace the `ol` mapping section in `web/src/app/course/[module]/page.tsx` with:

```tsx
import { BookOpen, Target } from "@phosphor-icons/react/dist/ssr";
import { getModule, STAGES, isLessonsNavLesson } from "@/lib/course/manifest";
import { lessonHref } from "@/lib/course/nav";

// inside ModulePage, after description:
const navLessons = mod.lessons.filter(isLessonsNavLesson);
const problemCount = mod.lessons.filter((l) => l.type === "problem").length;

// in the available branch:
<>
  {problemCount > 0 ? (
    <p className="mt-4 text-sm text-muted">
      <Link
        href={lessonHref(mod.slug, "practice")}
        className="font-medium text-accent underline decoration-accent/30 underline-offset-2 hover:decoration-accent"
      >
        {problemCount} problems in Practice
      </Link>
    </p>
  ) : null}
  <ol className="mt-10 grid gap-2">
    {navLessons.map((lesson, i) => (
      <li key={lesson.slug}>
        <Link
          href={lessonHref(mod.slug, lesson.slug)}
          className="flex items-center gap-3 rounded-lg border border-border px-4 py-3 text-sm transition hover:border-foreground/25 hover:bg-surface"
        >
          <span className="w-6 shrink-0 tabular-nums text-muted">
            {i + 1}.
          </span>
          {lesson.type === "practice" ? (
            <Target className="h-4 w-4 shrink-0 text-accent" weight="bold" />
          ) : (
            <BookOpen weight="bold" className="h-4 w-4 shrink-0 text-accent" />
          )}
          <span className="font-medium">{lesson.title}</span>
          <span className="ml-auto text-xs uppercase tracking-wide text-muted/70">
            {lesson.type}
          </span>
        </Link>
      </li>
    ))}
  </ol>
</>
```

Remove the unused `Puzzle` import.

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit && npx eslint src/app/course/[module]/page.tsx`

Expected: exit 0

- [ ] **Step 3: Commit**

```bash
git add web/src/app/course/[module]/page.tsx
git commit -m "feat(course): module overview lists concepts and Practice only"
```

---

### Task 7: Practice hub `/problems` list page

**Files:**
- Create: `web/src/components/problems/ProblemsListClient.tsx`
- Create: `web/src/app/problems/page.tsx`

**Interfaces:**
- Consumes: `groupedProblems`, `ProblemGroup`, `problemHref`, `lessonId`, `useProgress`
- Produces: `/problems` with H1 “Practice”, summary `{solvedCount} of {totalProblemCount} solved`, client title filter, empty-state copy, solved checks

- [ ] **Step 1: Create `ProblemsListClient`**

Create `web/src/components/problems/ProblemsListClient.tsx`:

```tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, MagnifyingGlass } from "@phosphor-icons/react";
import { useProgress } from "@/components/providers/ProgressProvider";
import { lessonId, problemHref } from "@/lib/course/nav";
import type { ProblemGroup } from "@/lib/course/manifest";

export function ProblemsListClient({ groups }: { groups: ProblemGroup[] }) {
  const { solved, solvedCount, totalProblemCount } = useProgress();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map((g) => ({
        ...g,
        problems: g.problems.filter((p) =>
          p.title.toLowerCase().includes(q),
        ),
      }))
      .filter((g) => g.problems.length > 0);
  }, [groups, query]);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 lg:px-8 lg:py-10">
      <h1 className="riso-overprint font-display text-3xl font-bold tracking-tight text-balance uppercase sm:text-[2.1rem]">
        Practice
      </h1>
      <p className="mt-2 text-sm text-muted">
        {totalProblemCount} problems · {solvedCount} of {totalProblemCount}{" "}
        solved
      </p>

      <label className="relative mt-6 block">
        <MagnifyingGlass
          className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted"
          aria-hidden
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search problems…"
          aria-label="Search problems"
          className="w-full rounded-lg border border-border bg-surface py-2 pr-3 pl-9 text-sm outline-none focus:border-foreground/25"
        />
      </label>

      <div className="mt-8 space-y-8">
        {filtered.map(({ module, problems }) => (
          <section key={module.slug}>
            <h2 className="mb-2 text-sm font-semibold tracking-wide text-muted uppercase">
              {module.number}. {module.shortTitle}
            </h2>
            <ol className="grid gap-2">
              {problems.map((p) => {
                const id = lessonId(module.slug, p.slug);
                const isSolved = solved.has(id);
                return (
                  <li key={p.slug}>
                    <Link
                      href={problemHref(p.slug)}
                      className="flex items-center gap-3 rounded-lg border border-border px-4 py-3 text-sm transition hover:border-foreground/25 hover:bg-surface"
                    >
                      <span className="font-medium">{p.title}</span>
                      {isSolved ? (
                        <span className="ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-good/15 text-good">
                          <Check size={12} weight="bold" aria-label="Solved" />
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
        {filtered.length === 0 ? (
          <p className="text-sm text-muted">
            No problems match &ldquo;{query}&rdquo;.
          </p>
        ) : null}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create the route**

Create `web/src/app/problems/page.tsx`:

```tsx
import type { Metadata } from "next";
import { groupedProblems } from "@/lib/course/manifest";
import { ProblemsListClient } from "@/components/problems/ProblemsListClient";

export const metadata: Metadata = { title: "Practice" };

export default function ProblemsPage() {
  return <ProblemsListClient groups={groupedProblems()} />;
}
```

- [ ] **Step 3: Build + test**

Run: `npx tsc --noEmit && npx eslint src/app/problems/page.tsx src/components/problems/ProblemsListClient.tsx && npm run build`

Expected: exit 0; `/problems` in the route list

- [ ] **Step 4: Browser check**

Open `/problems` — 21 module groups, 116 rows total, search “two sum” narrows, empty query restores full list.

- [ ] **Step 5: Commit**

```bash
git add web/src/app/problems/page.tsx web/src/components/problems/ProblemsListClient.tsx
git commit -m "feat(practice): add /problems hub list with search and solved summary"
```

---

### Task 8: Permanent redirect off course problem URLs

**Files:**
- Modify: `web/src/app/course/[module]/[lesson]/page.tsx`
- Modify: `web/src/components/course/LessonView.tsx`

**Interfaces:**
- Consumes: `permanentRedirect`, `problemHref`, `getLesson`, `getLessonNeighbors` (Task 3)
- Produces: `type: "problem"` → `permanentRedirect(problemHref(slug))`; concept and practice render `LessonView` (practice auto-list wired in Task 10); never `ProblemLessonView` / `ProblemWorkspace` on this route

- [ ] **Step 1: Extend `LessonView` typeLabel + afterMarkdown**

In `web/src/components/course/LessonView.tsx`:

```ts
typeLabel: "Concept" | "Problem" | "Practice";
afterMarkdown?: ReactNode;
```

Render `{afterMarkdown}` immediately after the `<Markdown … />` block inside the article (before neighbor links if those sit below markdown — place after the prose container that wraps Markdown).

- [ ] **Step 2: Rewrite the course lesson page (redirect + concept/practice shell)**

Replace `web/src/app/course/[module]/[lesson]/page.tsx` with:

```tsx
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { LessonView } from "@/components/course/LessonView";
import { LESSON_EMBEDS } from "@/components/course/embeds";
import {
  allLessonParams,
  getLessonNeighbors,
  loadLesson,
} from "@/lib/course/load";
import { getLesson, getModule } from "@/lib/course/manifest";
import { lessonHref, lessonId, moduleHref, problemHref } from "@/lib/course/nav";

interface PageProps {
  params: Promise<{ module: string; lesson: string }>;
}

export function generateStaticParams() {
  // Keep problem course paths so permanentRedirect pages exist for bookmarks.
  return allLessonParams();
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { module: moduleSlug, lesson: lessonSlug } = await params;
  const hit = getLesson(moduleSlug, lessonSlug);
  return { title: hit ? hit.lesson.title : "Lesson" };
}

export default async function LessonPage({ params }: PageProps) {
  const { module: moduleSlug, lesson: lessonSlug } = await params;
  const mod = getModule(moduleSlug);
  const meta = getLesson(moduleSlug, lessonSlug);
  if (!mod || !meta) notFound();

  if (meta.lesson.type === "problem") {
    permanentRedirect(problemHref(lessonSlug));
  }

  const lesson = await loadLesson(moduleSlug, lessonSlug);
  if (!lesson) notFound();

  const { prev, next } = getLessonNeighbors(moduleSlug, lessonSlug);
  const Embed = LESSON_EMBEDS[lessonId(moduleSlug, lessonSlug)];

  const breadcrumbs = [
    { label: "Lessons", href: "/course" },
    { label: mod.shortTitle, href: moduleHref(mod.slug) },
    { label: meta.lesson.title },
  ];
  const prevLink = prev
    ? { href: lessonHref(prev.module, prev.lesson), title: prev.title }
    : null;
  const nextLink = next
    ? { href: lessonHref(next.module, next.lesson), title: next.title }
    : null;

  const typeLabel =
    meta.lesson.type === "practice"
      ? "Practice"
      : meta.lesson.type === "concept"
        ? "Concept"
        : "Problem";

  return (
    <LessonView
      lesson={lesson}
      eyebrow={`Module ${mod.number} · ${mod.title}`}
      typeLabel={typeLabel}
      breadcrumbs={breadcrumbs}
      prev={prevLink}
      next={nextLink}
      stage={
        meta.lesson.type === "concept" && Embed ? <Embed /> : undefined
      }
    />
  );
}
```

- [ ] **Step 3: Typecheck / build**

Run: `npx tsc --noEmit && npm run build`

Expected: exit 0

- [ ] **Step 4: Browser — permanent redirect**

Navigate to `/course/recursion-backtracking/subsets`.

Expected: ends at `/problems/subsets` (permanent). Concept URL `/course/arrays/contiguous-memory` still renders. `/course/arrays/practice` renders the playbook markdown (problem list arrives in Task 10).

- [ ] **Step 5: Commit**

```bash
git add web/src/app/course/[module]/[lesson]/page.tsx web/src/components/course/LessonView.tsx
git commit -m "feat(course): permanentRedirect problems off course lesson routes"
```

---

### Task 9: Problem page back-link → Practice chapter

**Files:**
- Modify: `web/src/app/problems/[slug]/page.tsx`

**Interfaces:**
- Consumes: `lessonHref`, `hit.module.lessons`
- Produces: `backHref` = `/course/<module>/practice` when that lesson exists, else `moduleHref`; `backLabel` = `"Practice"` when pointing at the chapter, else module short title

- [ ] **Step 1: Update back link**

In `web/src/app/problems/[slug]/page.tsx`:

```tsx
import { lessonHref, moduleHref, problemHref } from "@/lib/course/nav";

// inside ProblemPage after hit is known:
const hasPractice = hit.module.lessons.some(
  (l) => l.type === "practice" && l.slug === "practice",
);
const backHref = hasPractice
  ? lessonHref(hit.module.slug, "practice")
  : moduleHref(hit.module.slug);
const backLabel = hasPractice ? "Practice" : hit.module.shortTitle;

return (
  <ProblemWorkspace
    lesson={{ ...lesson, sandbox: lesson.sandbox }}
    eyebrow={`Module ${hit.module.number} · ${hit.module.title}`}
    backHref={backHref}
    backLabel={backLabel}
    prev={prev ? { href: problemHref(prev.slug), title: prev.title } : null}
    next={next ? { href: problemHref(next.slug), title: next.title } : null}
  />
);
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`

Expected: exit 0

- [ ] **Step 3: Commit**

```bash
git add web/src/app/problems/[slug]/page.tsx
git commit -m "feat(practice): problem back-link prefers module Practice chapter"
```

---

### Task 10: `practice-problems` parse + merge + list UI + page wire-up

**Files:**
- Create: `web/src/lib/content/parsePracticeProblems.ts`
- Create: `web/src/components/md/PracticeProblemsList.tsx`
- Modify: `web/src/app/course/[module]/[lesson]/page.tsx` (Practice branch with `afterMarkdown`)
- Test: `web/tests/practiceProblems.test.ts`
- Dependency: add direct `"js-yaml"` (already transitive via gray-matter) and `"@types/js-yaml"` if needed for `tsc`

**Interfaces:**
- Consumes: `getModule`, `problemHref`, `lessonId`, `useProgress`, `LessonView.afterMarkdown` (Task 8)
- Produces:
  - `export interface PracticeBrief { slug: string; pattern?: string; difficulty?: string; watch_for?: string }`
  - `export interface PracticeProblemRow { slug: string; title: string; href: string; pattern?: string; difficulty?: string; watch_for?: string }`
  - `parsePracticeProblemsYaml(source: string): PracticeBrief[]`
  - `extractPracticeProblemsFence(markdown: string): { body: string; authored: PracticeBrief[] | null }` — `authored: null` when fence absent
  - `mergePracticeProblems(moduleSlug: string, authored: PracticeBrief[] | null): PracticeProblemRow[]` — manifest order is source of truth; unknown authored slug throws `Error`
  - `PracticeProblemsList({ moduleSlug, rows })` client component
  - Practice lesson pages always render the merged list via `afterMarkdown`

- [ ] **Step 1: Add js-yaml dependency**

Run: `npm install js-yaml && npm install -D @types/js-yaml`

Expected: `package.json` lists `js-yaml`

- [ ] **Step 2: Write failing parser tests**

Create `web/tests/practiceProblems.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  parsePracticeProblemsYaml,
  extractPracticeProblemsFence,
  mergePracticeProblems,
} from "../src/lib/content/parsePracticeProblems";

describe("parsePracticeProblemsYaml", () => {
  it("parses a YAML list of briefs", () => {
    const src = `
- slug: move-zeroes
  pattern: Partition pointers
  difficulty: Easy
  watch_for: Stability of non-zero order
`.trim();
    expect(parsePracticeProblemsYaml(src)).toEqual([
      {
        slug: "move-zeroes",
        pattern: "Partition pointers",
        difficulty: "Easy",
        watch_for: "Stability of non-zero order",
      },
    ]);
  });

  it("returns [] for empty / whitespace", () => {
    expect(parsePracticeProblemsYaml("")).toEqual([]);
    expect(parsePracticeProblemsYaml("\n  \n")).toEqual([]);
  });
});

describe("extractPracticeProblemsFence", () => {
  it("returns authored null and unchanged body when fence missing", () => {
    const md = "## How to practice\n\nHello.\n\n## Problems\n";
    const { body, authored } = extractPracticeProblemsFence(md);
    expect(authored).toBeNull();
    expect(body).toBe(md);
  });

  it("strips the fence and parses authored briefs", () => {
    const md = [
      "## Problems",
      "",
      "```practice-problems",
      "- slug: move-zeroes",
      "  difficulty: Easy",
      "```",
      "",
      "Tail",
    ].join("\n");
    const { body, authored } = extractPracticeProblemsFence(md);
    expect(authored).toEqual([{ slug: "move-zeroes", difficulty: "Easy" }]);
    expect(body).not.toContain("practice-problems");
    expect(body).toContain("## Problems");
    expect(body).toContain("Tail");
  });
});

describe("mergePracticeProblems", () => {
  it("lists every arrays problem in manifest order when authored is null", () => {
    const rows = mergePracticeProblems("arrays", null);
    expect(rows.map((r) => r.slug)).toEqual([
      "remove-duplicates-sorted",
      "move-zeroes",
      "rotate-array",
      "best-time-to-buy-sell-stock",
      "product-except-self",
    ]);
    expect(rows[0].href).toBe("/problems/remove-duplicates-sorted");
    expect(rows[0].pattern).toBeUndefined();
  });

  it("overlays authored fields by slug", () => {
    const rows = mergePracticeProblems("arrays", [
      {
        slug: "move-zeroes",
        pattern: "Partition pointers",
        difficulty: "Easy",
        watch_for: "Stability",
      },
    ]);
    const mz = rows.find((r) => r.slug === "move-zeroes")!;
    expect(mz.pattern).toBe("Partition pointers");
    expect(mz.difficulty).toBe("Easy");
    expect(mz.watch_for).toBe("Stability");
    expect(rows).toHaveLength(5);
  });

  it("throws when authored references an unknown slug", () => {
    expect(() =>
      mergePracticeProblems("arrays", [{ slug: "not-a-real-problem" }]),
    ).toThrow(/not-a-real-problem/);
  });
});
```

- [ ] **Step 3: Run tests — expect fail**

Run: `npx vitest run tests/practiceProblems.test.ts`

Expected: FAIL — module missing

- [ ] **Step 4: Implement parser**

Create `web/src/lib/content/parsePracticeProblems.ts`:

```ts
import yaml from "js-yaml";
import { getModule } from "@/lib/course/manifest";
import { problemHref } from "@/lib/course/nav";

export interface PracticeBrief {
  slug: string;
  pattern?: string;
  difficulty?: string;
  watch_for?: string;
}

export interface PracticeProblemRow {
  slug: string;
  title: string;
  href: string;
  pattern?: string;
  difficulty?: string;
  watch_for?: string;
}

function asBrief(raw: unknown): PracticeBrief {
  if (!raw || typeof raw !== "object") {
    throw new Error("practice-problems entry must be an object");
  }
  const rec = raw as Record<string, unknown>;
  if (typeof rec.slug !== "string" || !rec.slug.trim()) {
    throw new Error("practice-problems entry requires a string slug");
  }
  const brief: PracticeBrief = { slug: rec.slug.trim() };
  if (typeof rec.pattern === "string") brief.pattern = rec.pattern;
  if (typeof rec.difficulty === "string") brief.difficulty = rec.difficulty;
  if (typeof rec.watch_for === "string") brief.watch_for = rec.watch_for;
  return brief;
}

export function parsePracticeProblemsYaml(source: string): PracticeBrief[] {
  const trimmed = source.trim();
  if (!trimmed) return [];
  const data = yaml.load(trimmed);
  if (data == null) return [];
  if (!Array.isArray(data)) {
    throw new Error("practice-problems fence must be a YAML array");
  }
  return data.map(asBrief);
}

const FENCE = /^(`{3,8})practice-problems[^\n]*\n([\s\S]*?)^\1\s*$/m;

export function extractPracticeProblemsFence(markdown: string): {
  body: string;
  authored: PracticeBrief[] | null;
} {
  const m = FENCE.exec(markdown);
  if (!m) return { body: markdown, authored: null };
  const authored = parsePracticeProblemsYaml(m[2]);
  const body = (markdown.slice(0, m.index) + markdown.slice(m.index + m[0].length))
    .replace(/\n{3,}/g, "\n\n")
    .trimEnd()
    .concat("\n");
  return { body, authored };
}

export function mergePracticeProblems(
  moduleSlug: string,
  authored: PracticeBrief[] | null,
): PracticeProblemRow[] {
  const mod = getModule(moduleSlug);
  if (!mod) throw new Error(`Unknown module: ${moduleSlug}`);
  const problems = mod.lessons.filter((l) => l.type === "problem");
  const bySlug = new Map((authored ?? []).map((b) => [b.slug, b]));
  for (const slug of bySlug.keys()) {
    if (!problems.some((p) => p.slug === slug)) {
      throw new Error(
        `practice-problems references unknown slug "${slug}" in module ${moduleSlug}`,
      );
    }
  }
  return problems.map((p) => {
    const overlay = bySlug.get(p.slug);
    return {
      slug: p.slug,
      title: p.title,
      href: problemHref(p.slug),
      pattern: overlay?.pattern,
      difficulty: overlay?.difficulty,
      watch_for: overlay?.watch_for,
    };
  });
}
```

- [ ] **Step 5: Implement `PracticeProblemsList`**

Create `web/src/components/md/PracticeProblemsList.tsx`:

```tsx
"use client";

import Link from "next/link";
import { Check } from "@phosphor-icons/react";
import { useProgress } from "@/components/providers/ProgressProvider";
import { lessonId } from "@/lib/course/nav";
import type { PracticeProblemRow } from "@/lib/content/parsePracticeProblems";

export function PracticeProblemsList({
  moduleSlug,
  rows,
}: {
  moduleSlug: string;
  rows: PracticeProblemRow[];
}) {
  const { solved } = useProgress();

  return (
    <ol className="mt-6 grid gap-2">
      {rows.map((row) => {
        const id = lessonId(moduleSlug, row.slug);
        const isSolved = solved.has(id);
        return (
          <li key={row.slug}>
            <Link
              href={row.href}
              className="flex flex-col gap-1 rounded-lg border border-border px-4 py-3 text-sm transition hover:border-foreground/25 hover:bg-surface sm:flex-row sm:items-center sm:gap-3"
            >
              <span className="min-w-0 flex-1 font-medium text-foreground">
                {row.title}
              </span>
              <span className="flex flex-wrap items-center gap-2 text-xs text-muted">
                {row.difficulty ? (
                  <span className="rounded border border-border px-1.5 py-0.5 font-mono uppercase tracking-wide">
                    {row.difficulty}
                  </span>
                ) : null}
                {row.pattern ? <span>{row.pattern}</span> : null}
                {isSolved ? (
                  <span className="ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-good/15 text-good sm:ml-0">
                    <Check size={12} weight="bold" aria-label="Solved" />
                  </span>
                ) : null}
              </span>
              {row.watch_for ? (
                <span className="basis-full text-xs text-muted sm:order-last">
                  Watch for: {row.watch_for}
                </span>
              ) : null}
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
```

- [ ] **Step 6: Wire Practice branch on the course lesson page**

In `web/src/app/course/[module]/[lesson]/page.tsx`, add imports:

```tsx
import {
  extractPracticeProblemsFence,
  mergePracticeProblems,
} from "@/lib/content/parsePracticeProblems";
import { PracticeProblemsList } from "@/components/md/PracticeProblemsList";
```

Replace the single `return (<LessonView …/>)` with:

```tsx
  if (meta.lesson.type === "practice") {
    const { body, authored } = extractPracticeProblemsFence(lesson.markdown);
    const rows = mergePracticeProblems(moduleSlug, authored);
    return (
      <LessonView
        lesson={{ ...lesson, markdown: body }}
        eyebrow={`Module ${mod.number} · ${mod.title}`}
        typeLabel="Practice"
        breadcrumbs={breadcrumbs}
        prev={prevLink}
        next={nextLink}
        afterMarkdown={
          <PracticeProblemsList moduleSlug={moduleSlug} rows={rows} />
        }
      />
    );
  }

  return (
    <LessonView
      lesson={lesson}
      eyebrow={`Module ${mod.number} · ${mod.title}`}
      typeLabel={typeLabel}
      breadcrumbs={breadcrumbs}
      prev={prevLink}
      next={nextLink}
      stage={Embed ? <Embed /> : undefined}
    />
  );
```

- [ ] **Step 7: Run tests — expect pass**

Run: `npx vitest run tests/practiceProblems.test.ts && npx tsc --noEmit`

Expected: PASS / exit 0

- [ ] **Step 8: Browser — auto-list on a non-gold module**

Open `/course/stacks/practice` — full stack problem list with hub links even though no fence is authored.

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json web/src/lib/content/parsePracticeProblems.ts web/src/components/md/PracticeProblemsList.tsx web/src/app/course/[module]/[lesson]/page.tsx web/tests/practiceProblems.test.ts
git commit -m "feat(practice): auto-list module problems on Practice chapters"
```


---

### Task 11: SearchDialog routes problems to the hub

**Files:**
- Modify: `web/src/components/layout/SearchDialog.tsx`

**Interfaces:**
- Consumes: search index `y` field (frontmatter type); `problemHref` / course path
- Produces: `y === "problem"` → `/problems/<s>`; otherwise `/course/<m>/<s>`; optional badge for `practice`; aria/placeholder mention lessons and problems

- [ ] **Step 1: Update routing and copy**

In `SearchDialog.tsx`:

1. Import `problemHref` from `@/lib/course/nav`.
2. Change `go`:

```ts
const go = useCallback(
  (hit: Hit) => {
    onClose();
    if (hit.entry.y === "problem") {
      router.push(problemHref(hit.entry.s));
    } else {
      router.push(`/course/${hit.entry.m}/${hit.entry.s}`);
    }
  },
  [onClose, router],
);
```

3. Replace aria-label / placeholder strings:

- Dialog `aria-label="Search lessons and problems"`
- Input `placeholder="Search lessons and problems…"`
- Input `aria-label="Search lessons and problems"`

4. Extend the badge next to hits:

```tsx
{hit.entry.y === "problem" ? (
  <span className="shrink-0 rounded border border-border px-1.5 py-0.5 font-mono text-[0.6rem] text-muted">
    problem
  </span>
) : hit.entry.y === "practice" ? (
  <span className="shrink-0 rounded border border-border px-1.5 py-0.5 font-mono text-[0.6rem] text-muted">
    practice
  </span>
) : null}
```

- [ ] **Step 2: Rebuild search index + smoke**

Run: `node scripts/build-search-index.mjs`

Expected: exit 0; practice.md entries appear with `y: "practice"` once files exist

Manual: search “two sum” → navigates to `/problems/two-sum`; search “Practice” or a concept title → `/course/…`

- [ ] **Step 3: Commit**

```bash
git add web/src/components/layout/SearchDialog.tsx
git commit -m "feat(search): route problem hits to /problems hub"
```

---

### Task 12: Arrays gold-template Practice chapter

**Files:**
- Modify: `course/arrays/practice.md`

**Interfaces:**
- Consumes: Task 10 renderer; arrays' five problem slugs
- Produces: authored playbook + full `practice-problems` fence with pattern / difficulty / watch_for for every arrays problem

- [ ] **Step 1: Replace `course/arrays/practice.md` with gold content**

```markdown
---
title: Practice
type: practice
---

## How to practice this module

Arrays drills reward **in-place discipline**: write pointers, partitions,
and single-pass bookkeeping. Work the five problems in order — each one
reuses an idea from the previous concept lessons, then twists it.

Suggested loop for each problem: attempt the sandbox cold → read the
explanation only after a real try → re-solve from memory the next day.
You are done with Arrays Practice when all five show Solved in the hub.

## Problems

```practice-problems
- slug: remove-duplicates-sorted
  pattern: Two pointers / write pointer
  difficulty: Easy
  watch_for: Off-by-one on the write index; do not allocate a second array
- slug: move-zeroes
  pattern: Partition pointers
  difficulty: Easy
  watch_for: Stability of non-zero order; zeroes must survive at the end
- slug: rotate-array
  pattern: Reverse cycles / block reverse
  difficulty: Medium
  watch_for: k can exceed n — normalise before indexing; O(1) extra space
- slug: best-time-to-buy-sell-stock
  pattern: Single-pass running minimum
  difficulty: Easy
  watch_for: Sell day must be after buy day; all-falling prices → 0
- slug: product-except-self
  pattern: Prefix / suffix products
  difficulty: Medium
  watch_for: No division; zeroes break the naive product/divide trick
```
```

- [ ] **Step 2: Run content + parser tests**

Run: `npx vitest run tests/content.test.ts -t "Practice chapters" && npx vitest run tests/practiceProblems.test.ts`

Expected: PASS (fence slugs ⊆ arrays problems)

- [ ] **Step 3: Browser check**

Open `/course/arrays/practice` — playbook visible; five rows with difficulty/pattern/watch-for; each links to `/problems/…`; solved checks match hub vocabulary.

- [ ] **Step 4: Commit**

```bash
git add course/arrays/practice.md
git commit -m "content(arrays): gold-template Practice chapter with per-problem briefs"
```

---

### Task 13: Tracked follow-up — remaining module briefs

**Files:**
- Modify: `HANDOFF.md` (append a short “Next content” note)
- Optional create: `docs/superpowers/specs/2026-07-31-practice-briefs-follow-up.md` only if HANDOFF would be too long — prefer a HANDOFF section unless the user wants a separate spec

**Interfaces:**
- Produces: explicit checklist of 20 modules still on the honest placeholder playbook (everything except `arrays`)

- [ ] **Step 1: Append follow-up list to `HANDOFF.md`**

Add a section:

```markdown
## Follow-up — Practice chapter briefs

v1 shipped auto-list Practice chapters for all 21 problem-bearing modules
and a gold-template chapter for `arrays`. Fill the remaining modules to the
same standard (playbook + `practice-problems` fence with pattern /
difficulty / watch_for for every problem). No IA changes required — same
renderer.

Remaining modules:

- [ ] strings
- [ ] hash-tables (alternate gold if arrays had been thin)
- [ ] linked-lists
- [ ] stacks
- [ ] queues
- [ ] two-pointers
- [ ] sliding-window
- [ ] prefix-sum
- [ ] binary-search
- [ ] sorting
- [ ] matrix
- [ ] recursion-backtracking
- [ ] binary-trees
- [ ] bst
- [ ] heaps
- [ ] tries
- [ ] intervals
- [ ] greedy
- [ ] graphs
- [ ] dynamic-programming
```

- [ ] **Step 2: Commit**

```bash
git add HANDOFF.md
git commit -m "docs: track Practice brief fill-in for non-arrays modules"
```

---

### Task 14: Final verification

**Files:** none (verification only)

- [ ] **Step 1: Full suite**

Run from `web/`:

```bash
npx tsc --noEmit
npx eslint src tests
npm test
npm run build
```

Expected: all exit 0

- [ ] **Step 2: Spec checklist (browser)**

Confirm each item from design spec §12:

1. `/problems` lists 116; search filters; solved summary updates after a real sandbox pass
2. Header Lessons / Practice active states correct; neither on `/`
3. Sidebar for `recursion-backtracking` shows concepts + Practice only — no Subsets / Permutations rows
4. `/course/recursion-backtracking/subsets` permanently redirects to `/problems/subsets`
5. `/course/arrays/practice` shows playbook + all array problems with hub links and gold briefs
6. Search “two sum” → `/problems/two-sum`; concept title → `/course/…`
7. Header chip denominator is 96 (concepts + practice), not 191; solving a problem increments hub solved only
8. Concept prev/next skips problems; problem prev/next stays module-scoped via `getProblemNeighbors`
9. Non-arrays Practice chapters still list every problem via auto-list

- [ ] **Step 3: Prove one content test can fail**

Sabotage briefly:

```bash
# From repo root
cp course/arrays/practice.md /tmp/arrays-practice.md.bak
# Add an unknown slug to the fence, then:
cd web && npx vitest run tests/content.test.ts -t "practice-problems fence slugs"
# Expect FAIL mentioning the unknown slug
mv /tmp/arrays-practice.md.bak course/arrays/practice.md
cd web && npx vitest run tests/content.test.ts -t "practice-problems fence slugs"
# Expect PASS
```

- [ ] **Step 4: Final commit only if verification fixed anything; otherwise done**

If verification required fixes, commit those fixes with an accurate message. Do not create an empty commit.

---

## Self-review (plan author)

**Spec coverage**

| Spec section | Task(s) |
| --- | --- |
| §2 IA / routes | 5, 7, 8, 9 |
| §3 finish hub + supersede sidebar interleave | 3, 6, 7, 8 |
| §4 Header Lessons/Practice | 5 |
| §5 Sidebar filter + progress meters | 1, 3, 4 |
| §6 Practice hub | 7, 9 |
| §7 Practice chapters + auto-list + gold arrays | 2, 10, 12, 13 |
| §8 Redirects + neighbors + content tests | 2, 3, 8, 14 |
| §9 Search | 11 |
| §10 Module overview | 6 |
| §11 Manifest type system | 1, 2 |
| §12 Verification | 14 |

**Placeholder scan:** none intentionally left; follow-up briefs are an explicit Task 13 checklist, not deferred implementation of v1 IA.

**Type consistency:** `LessonType` includes `"practice"`; nav uses `isLessonsNavLesson`; progress uses `allLessonsNavIds` (96); hub solved stays `allProblemSlugs` (116).
