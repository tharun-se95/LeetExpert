# Problems Hub Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A centralized, LeetCode-style home for all 116 problems at
`/problems` and `/problems/[slug]`, addressed independently of the
course's module/lesson structure, with solved-state tracking extending
the app's existing visited-tracking system rather than a parallel one.

**Architecture:** A new `findProblemBySlug` lookup resolves a flat slug to
its owning module (slugs are verified globally unique and that's a
permanent content-test invariant). The split-pane `ProblemLessonView`
built previously is reused wholesale at the new route; the old
`/course/[module]/[lesson]` route redirects problem lessons there instead
of rendering them. `ProgressProvider` (already tracking *visited* lessons
sitewide) gains a second tracked set, `solved`, with its own storage key
but the same id format and the same Context — not a new module.

**Tech Stack:** Next.js (App Router, React Server + Client Components),
TypeScript strict, Tailwind CSS v4, React Context, Vitest.

## Global Constraints

- TypeScript strict; no `any`, no unchecked casts to silence the compiler.
- Comments explain why, never what.
- All color goes through the existing design tokens; the solved checkmark
  reuses the exact `bg-good/15 text-good` + `Check` vocabulary the
  sandbox's own per-case pass pips already use (`Sandbox.tsx`) — the
  rotated `riso-stamp` motif stays reserved for the one-time "you just
  solved this" moment inside the sandbox itself, not reused as a
  persistent list/badge indicator.
- Client components import icons from `@phosphor-icons/react` (not the
  `/dist/ssr` build, which is for Server Components only).
- No content authoring across the 75 concept lessons in this plan — the
  existing sidebar/module-page listing (updated to link into the hub) is
  what satisfies "chapters are linked to their problems."
- No difficulty rating is added in this plan.
- `npx tsc --noEmit`, `npx eslint src tests`, `npm test`, and
  `npm run build` must all pass before any task is considered done.
- All commands below run from `/Users/tharunk/DSA/web` unless stated
  otherwise.

---

### Task 1: Content-test invariants

Four permanent CI guarantees the rest of this plan depends on: three from
the already-shipped split-pane work (never actually added to
`content.test.ts` before this plan started — verify that's still true
before adding them, so they aren't duplicated), plus one new one this
plan specifically needs.

**Files:**
- Modify: `tests/content.test.ts`

**Interfaces:**
- Consumes: `extractSandboxFence` (`../src/lib/content/extractSandboxFence`,
  already exists from the split-pane work), the existing `fences()`
  helper and `LESSONS` array already in this file.
- Produces: nothing for later tasks to import — this is a safety net.
  Task 2's `findProblemBySlug` *depends on* the invariant this task adds
  actually holding, but doesn't import anything from this file.

- [ ] **Step 1: Confirm the three split-pane invariants aren't already present**

Run: `grep -n "safe to extract" tests/content.test.ts`
Expected: no output (confirms this wasn't added in an earlier, unmerged
attempt — if it DOES print a match, stop and re-read that describe block
before proceeding, since Steps 2–3 below would then duplicate it).

- [ ] **Step 2: Add the imports**

In `tests/content.test.ts`, the current imports end at line 5:
```ts
import { parseSandboxSpec } from "@/components/sandbox/parseSpec";
```
Add immediately after:
```ts
import matter from "gray-matter";
import { extractSandboxFence } from "../src/lib/content/extractSandboxFence";
```

- [ ] **Step 3: Add the three split-pane invariants and the new slug-uniqueness one**

Insert this new block immediately after the closing `});` of the
existing `describe("every sandbox fence survives the real parser", ...)`
block (ends at line 321 today) and before the comment block that starts
`/**\n * Sandbox coverage, as a hard gate.` (starts at line 323 today):

```ts
/**
 * The split-pane problem view hoists the sandbox fence out of the
 * markdown into its own pane by parsing at build time and slicing on
 * real AST offsets — see `lib/content/extractSandboxFence.ts`. That
 * extraction is only correct if three things hold about every lesson;
 * these tests make sure they hold forever, not just as of this writing.
 */
describe("the sandbox fence is safe to extract", () => {
  it("every problem lesson has exactly one sandbox fence", () => {
    const bad: string[] = [];
    for (const lesson of LESSONS) {
      const fm = /^---\n([\s\S]*?)\n---/.exec(lesson.body);
      if (!fm?.[1].includes("type: problem")) continue;
      const count = fences(lesson.body, "sandbox").length;
      if (count !== 1) bad.push(`${lesson.rel} — found ${count}`);
    }
    expect(bad).toEqual([]);
  });

  it("no sandbox fence is nested inside a reveal/aside/tabs fence", () => {
    const bad: string[] = [];
    // Fence bodies here can carry a label after the lang word
    // ("````reveal Hint 1 — ..."), so `fences()`'s exact-match regex
    // can't be reused — this matches the same shape, tolerant of
    // trailing text on the opening line.
    const outer = /^(`{4,8})(?:reveal|aside|tabs)[^\n]*\n([\s\S]*?)^\1\s*$/gm;
    for (const lesson of LESSONS) {
      for (const m of lesson.body.matchAll(outer)) {
        if (/^```sandbox\s*$/m.test(m[2])) bad.push(lesson.rel);
      }
    }
    expect(bad).toEqual([]);
  });

  it("no problem lesson has a heading duplicated across its sandbox split", () => {
    // beforeSandbox/afterSandbox render as two independent <Markdown>
    // instances, each running its own rehype-slug pass — a heading with
    // the same text on both sides would collide on the same DOM id.
    const heading = /^#{2,3}\s+(.+)$/gm;
    const bad: string[] = [];
    for (const lesson of LESSONS) {
      const fm = /^---\n([\s\S]*?)\n---/.exec(lesson.body);
      if (!fm?.[1].includes("type: problem")) continue;

      const { content } = matter(lesson.body);
      const split = extractSandboxFence(content.trim());
      if (!split) continue;

      const before = new Set(
        [...split.beforeSandbox.matchAll(heading)].map((m) => m[1].trim()),
      );
      for (const m of split.afterSandbox.matchAll(heading)) {
        if (before.has(m[1].trim())) {
          bad.push(`${lesson.rel} — "${m[1].trim()}"`);
        }
      }
    }
    expect(bad).toEqual([]);
  });
});

/**
 * `/problems/[slug]` addresses a problem by slug alone, scanning every
 * module for a match (`findProblemBySlug`) — safe only because no two
 * problem lessons anywhere in the course share a slug. Verified true for
 * all 116 before this plan was written; this is what keeps it true.
 */
describe("problem slugs are globally unique", () => {
  it("no two problem lessons share a slug", () => {
    const seenAt = new Map<string, string>();
    const bad: string[] = [];
    for (const lesson of LESSONS) {
      const fm = /^---\n([\s\S]*?)\n---/.exec(lesson.body);
      if (!fm?.[1].includes("type: problem")) continue;
      const slug = lesson.rel.replace(/\.md$/, "").split("/").pop()!;
      const existing = seenAt.get(slug);
      if (existing) {
        bad.push(`"${slug}" used by both ${existing} and ${lesson.rel}`);
      } else {
        seenAt.set(slug, lesson.rel);
      }
    }
    expect(bad).toEqual([]);
  });
});
```

- [ ] **Step 4: Run the new tests, confirm they pass against real content**

Run: `npx vitest run tests/content.test.ts -t "safe to extract"`
Expected: PASS — 3 tests passed

Run: `npx vitest run tests/content.test.ts -t "globally unique"`
Expected: PASS — 1 test passed

- [ ] **Step 5: Prove each test can actually fail — sabotage one lesson at a time**

Run each of these, confirm the named test goes red with the shown
message, then restore the file before moving to the next:

```bash
# Sabotage 1: a second sandbox fence
cp course/recursion-backtracking/subsets.md /tmp/subsets.md.bak
cat >> course/recursion-backtracking/subsets.md <<'EOF'

```sandbox
{"id": "subsets-2"}
```
EOF
npx vitest run tests/content.test.ts -t "exactly one sandbox fence"
# Expected: FAIL, "recursion-backtracking/subsets.md — found 2"
cp /tmp/subsets.md.bak course/recursion-backtracking/subsets.md
```

```bash
# Sabotage 2: a sandbox fence nested inside a reveal
cp course/recursion-backtracking/subsets.md /tmp/subsets.md.bak
python3 - <<'PY'
path = "course/recursion-backtracking/subsets.md"
s = open(path).read()
anchor = "````reveal Hint — the choice at each element"
assert anchor in s
injected = anchor + "\n```sandbox\n{\"id\": \"nested\"}\n```\n"
open(path, "w").write(s.replace(anchor, injected, 1))
PY
npx vitest run tests/content.test.ts -t "nested inside a reveal"
# Expected: FAIL, "recursion-backtracking/subsets.md"
cp /tmp/subsets.md.bak course/recursion-backtracking/subsets.md
```

```bash
# Sabotage 3: a heading duplicated across the split
cp course/recursion-backtracking/subsets.md /tmp/subsets.md.bak
python3 - <<'PY'
path = "course/recursion-backtracking/subsets.md"
s = open(path).read()
anchor = "## Variants"
assert anchor in s
s = s.replace(anchor, "## Attempt it first\n\n" + anchor, 1)
open(path, "w").write(s)
PY
npx vitest run tests/content.test.ts -t "heading duplicated"
# Expected: FAIL, mentioning "Attempt it first"
cp /tmp/subsets.md.bak course/recursion-backtracking/subsets.md
```

```bash
# Sabotage 4: a duplicate problem slug
cp course/dynamic-programming/climbing-stairs.md /tmp/climbing-stairs.md.bak
cp course/dynamic-programming/climbing-stairs.md course/recursion-backtracking/climbing-stairs.md
npx vitest run tests/content.test.ts -t "globally unique"
# Expected: FAIL, "\"climbing-stairs\" used by both dynamic-programming/... and recursion-backtracking/..."
rm course/recursion-backtracking/climbing-stairs.md
cp /tmp/climbing-stairs.md.bak course/dynamic-programming/climbing-stairs.md
```

- [ ] **Step 6: Confirm every sabotaged file is restored and the suite is green**

Run: `git status --short course/`
Expected: empty output (no diff, no untracked files — all four sabotages
were reverted)

Run: `npm test`
Expected: all tests pass

- [ ] **Step 7: Commit**

```bash
git add tests/content.test.ts
git commit -m "Guarantee the sandbox split and problem-slug uniqueness stay safe forever"
```

---

### Task 2: Manifest lookups — `findProblemBySlug`, `getProblemNeighbors`, `groupedProblems`, `allProblemSlugs`

**Files:**
- Modify: `src/lib/course/manifest.ts`
- Test: `tests/manifestHelpers.test.ts` (new)

**Interfaces:**
- Consumes: existing `MODULES`, `ModuleMeta`, `LessonMeta` (all in this
  same file already).
- Produces:
  - `findProblemBySlug(slug: string): { module: ModuleMeta; lesson: LessonMeta } | undefined`
  - `getProblemNeighbors(moduleSlug: string, problemSlug: string): { prev: { slug: string; title: string } | null; next: { slug: string; title: string } | null }`
  - `export interface ProblemGroup { module: ModuleMeta; problems: LessonMeta[] }`
  - `groupedProblems(): ProblemGroup[]`
  - `allProblemSlugs(): string[]`

  All four are consumed by later tasks (3, 6, 7, 8, 9).

- [ ] **Step 1: Write the failing tests**

Create `tests/manifestHelpers.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  findProblemBySlug,
  getProblemNeighbors,
  groupedProblems,
  allProblemSlugs,
} from "../src/lib/course/manifest";

describe("findProblemBySlug", () => {
  it("finds a real problem by slug", () => {
    const hit = findProblemBySlug("subsets");
    expect(hit?.module.slug).toBe("recursion-backtracking");
    expect(hit?.lesson.title).toBe("Subsets");
  });

  it("returns undefined for a concept-lesson slug", () => {
    // "common-complexity-classes" is a real slug, but type: concept —
    // this lookup must not accidentally match it.
    expect(findProblemBySlug("common-complexity-classes")).toBeUndefined();
  });

  it("returns undefined for an unknown slug", () => {
    expect(findProblemBySlug("not-a-real-problem")).toBeUndefined();
  });
});

describe("getProblemNeighbors", () => {
  it("returns prev/next within the module's problem order", () => {
    // recursion-backtracking's problems, in file order: subsets,
    // permutations, combination-sum, generate-parentheses,
    // palindrome-partitioning, n-queens.
    const mid = getProblemNeighbors("recursion-backtracking", "combination-sum");
    expect(mid.prev?.slug).toBe("permutations");
    expect(mid.next?.slug).toBe("generate-parentheses");
  });

  it("prev is null for the first problem in a module", () => {
    const first = getProblemNeighbors("recursion-backtracking", "subsets");
    expect(first.prev).toBeNull();
  });

  it("next is null for the last problem in a module", () => {
    const last = getProblemNeighbors("recursion-backtracking", "n-queens");
    expect(last.next).toBeNull();
  });
});

describe("groupedProblems", () => {
  it("only includes modules that have at least one problem", () => {
    const groups = groupedProblems();
    // "getting-started" is concept-only — must not appear.
    expect(groups.some((g) => g.module.slug === "getting-started")).toBe(false);
    expect(groups.some((g) => g.module.slug === "recursion-backtracking")).toBe(true);
  });

  it("every group's problems are all type: problem", () => {
    const groups = groupedProblems();
    for (const g of groups) {
      expect(g.problems.every((p) => p.type === "problem")).toBe(true);
      expect(g.problems.length).toBeGreaterThan(0);
    }
  });
});

describe("allProblemSlugs", () => {
  it("returns exactly 116 slugs, all unique", () => {
    const slugs = allProblemSlugs();
    expect(slugs.length).toBe(116);
    expect(new Set(slugs).size).toBe(116);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run tests/manifestHelpers.test.ts`
Expected: FAIL — `findProblemBySlug` (and the other three) are not
exported from `../src/lib/course/manifest`

- [ ] **Step 3: Add the four functions**

In `src/lib/course/manifest.ts`, after the existing `getLesson` function
(ends with the closing `}` right before `export function modulesByStage`),
insert:

```ts
export function findProblemBySlug(
  slug: string,
): { module: ModuleMeta; lesson: LessonMeta } | undefined {
  for (const mod of MODULES) {
    const lesson = mod.lessons.find(
      (l) => l.slug === slug && l.type === "problem",
    );
    if (lesson) return { module: mod, lesson };
  }
  return undefined;
}

/** Prev/next among a module's OWN problems, in their authored order. */
export function getProblemNeighbors(
  moduleSlug: string,
  problemSlug: string,
): {
  prev: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
} {
  const mod = getModule(moduleSlug);
  if (!mod) return { prev: null, next: null };
  const problems = mod.lessons.filter((l) => l.type === "problem");
  const idx = problems.findIndex((l) => l.slug === problemSlug);
  if (idx < 0) return { prev: null, next: null };
  return {
    prev: idx > 0 ? { slug: problems[idx - 1].slug, title: problems[idx - 1].title } : null,
    next:
      idx < problems.length - 1
        ? { slug: problems[idx + 1].slug, title: problems[idx + 1].title }
        : null,
  };
}

export interface ProblemGroup {
  module: ModuleMeta;
  problems: LessonMeta[];
}

/** Every module that has at least one problem, with just its problems. */
export function groupedProblems(): ProblemGroup[] {
  return MODULES.map((m) => ({
    module: m,
    problems: m.lessons.filter((l) => l.type === "problem"),
  })).filter((g) => g.problems.length > 0);
}

/** Every problem lesson's slug — used by /problems/[slug]'s generateStaticParams. */
export function allProblemSlugs(): string[] {
  return MODULES.flatMap((m) =>
    m.lessons.filter((l) => l.type === "problem").map((l) => l.slug),
  );
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run tests/manifestHelpers.test.ts`
Expected: PASS — 9 tests passed

- [ ] **Step 5: Typecheck and lint**

Run: `npx tsc --noEmit && npx eslint src tests`
Expected: both exit 0

- [ ] **Step 6: Commit**

```bash
git add src/lib/course/manifest.ts tests/manifestHelpers.test.ts
git commit -m "Add findProblemBySlug, getProblemNeighbors, groupedProblems, allProblemSlugs"
```

---

### Task 3: `nav.ts` — `problemHref` and the `lessonIdFromPathname` fix

**Files:**
- Modify: `src/lib/course/nav.ts`
- Test: `tests/nav.test.ts` (new)

**Interfaces:**
- Consumes: `findProblemBySlug` (Task 2).
- Produces: `problemHref(slug: string): string`. `lessonIdFromPathname`'s
  exported signature is unchanged, but it now also resolves
  `/problems/[slug]` paths — consumed by `VisitTracker` (already calls it,
  no changes needed there) and by Task 4's manual verification.

- [ ] **Step 1: Write the failing test**

Create `tests/nav.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { problemHref, lessonIdFromPathname, lessonId } from "../src/lib/course/nav";

describe("problemHref", () => {
  it("builds /problems/<slug>", () => {
    expect(problemHref("subsets")).toBe("/problems/subsets");
  });
});

describe("lessonIdFromPathname", () => {
  it("resolves a course lesson pathname (unchanged behavior)", () => {
    const id = lessonIdFromPathname("/course/big-o/common-complexity-classes");
    expect(id).toBe(lessonId("big-o", "common-complexity-classes"));
  });

  it("resolves a /problems/[slug] pathname to the SAME id its course path would give", () => {
    const viaProblems = lessonIdFromPathname("/problems/subsets");
    const viaCourse = lessonIdFromPathname("/course/recursion-backtracking/subsets");
    expect(viaProblems).toBe(viaCourse);
    expect(viaProblems).toBe(lessonId("recursion-backtracking", "subsets"));
  });

  it("returns null for an unknown problem slug", () => {
    expect(lessonIdFromPathname("/problems/not-a-real-problem")).toBeNull();
  });

  it("returns null for an unrelated pathname", () => {
    expect(lessonIdFromPathname("/about")).toBeNull();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run tests/nav.test.ts`
Expected: FAIL — `problemHref` is not exported, and the `/problems/[slug]`
case returns `null` instead of matching the course path's id

- [ ] **Step 3: Add `problemHref` and fix `lessonIdFromPathname`**

In `src/lib/course/nav.ts`, change the import line:

```ts
import { MODULES, STAGES, type ModuleMeta } from "./manifest";
```

to:

```ts
import {
  MODULES,
  STAGES,
  findProblemBySlug,
  type ModuleMeta,
} from "./manifest";
```

Add `problemHref` right after the existing `moduleHref`:

```ts
export function moduleHref(moduleSlug: string): string {
  return `/course/${moduleSlug}`;
}

export function problemHref(slug: string): string {
  return `/problems/${slug}`;
}
```

Replace the whole `lessonIdFromPathname` function:

```ts
/** Map a /course/[module]/[lesson] pathname to its progress id. */
export function lessonIdFromPathname(pathname: string): string | null {
  const match = /^\/course\/([^/]+)\/([^/]+)\/?$/.exec(pathname);
  if (!match) return null;
  const [, moduleSlug, lessonSlug] = match;
  const mod = MODULES.find((m) => m.slug === moduleSlug);
  if (!mod) return null;
  if (!mod.lessons.some((l) => l.slug === lessonSlug)) return null;
  return lessonId(moduleSlug, lessonSlug);
}
```

with:

```ts
/**
 * Map a lesson-bearing pathname to its progress id — either the course
 * shape (/course/[module]/[lesson], concept lessons and, historically,
 * problems too) or the hub shape (/problems/[slug]). Both resolve to the
 * SAME `moduleSlug/lessonSlug` id, so a problem visited at its old course
 * URL and its new hub URL count as the same lesson for progress purposes.
 */
export function lessonIdFromPathname(pathname: string): string | null {
  const courseMatch = /^\/course\/([^/]+)\/([^/]+)\/?$/.exec(pathname);
  if (courseMatch) {
    const [, moduleSlug, lessonSlug] = courseMatch;
    const mod = MODULES.find((m) => m.slug === moduleSlug);
    if (!mod) return null;
    if (!mod.lessons.some((l) => l.slug === lessonSlug)) return null;
    return lessonId(moduleSlug, lessonSlug);
  }

  const problemMatch = /^\/problems\/([^/]+)\/?$/.exec(pathname);
  if (problemMatch) {
    const [, slug] = problemMatch;
    const hit = findProblemBySlug(slug);
    if (!hit) return null;
    return lessonId(hit.module.slug, hit.lesson.slug);
  }

  return null;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run tests/nav.test.ts`
Expected: PASS — 5 tests passed

- [ ] **Step 5: Typecheck, lint, full suite**

Run: `npx tsc --noEmit && npx eslint src tests && npm test`
Expected: all exit 0 / pass

- [ ] **Step 6: Commit**

```bash
git add src/lib/course/nav.ts tests/nav.test.ts
git commit -m "Add problemHref; teach lessonIdFromPathname the /problems/[slug] URL shape"
```

---

### Task 4: `ProgressProvider` gains `solved` tracking

**Files:**
- Modify: `src/components/providers/ProgressProvider.tsx`
- Modify: `src/components/layout/AppShell.tsx`

**Interfaces:**
- Consumes: `allProblemSlugs` (Task 2) — used to compute the new
  `totalProblemCount`, the same way `AppShell` already computes
  `totalCount` from `allLessonIds()`.
- Produces: `useProgress()` now also returns `solved: Set<string>`,
  `markSolved(id: string): void`, `solvedCount: number`,
  `totalProblemCount: number`. Consumed by Task 5 indirectly (Sandbox
  itself doesn't call this — see Task 5's note), Task 6
  (`ProblemLessonView`), Task 8 (`Sidebar`), Task 9 (the list page).

- [ ] **Step 1: Replace `ProgressProvider.tsx`**

Current full content of `src/components/providers/ProgressProvider.tsx`:

```tsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "dsa-course-progress";

interface ProgressContextValue {
  visited: Set<string>;
  markVisited: (id: string) => void;
  visitedCount: number;
  totalCount: number;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({
  children,
  totalCount,
}: {
  children: React.ReactNode;
  totalCount: number;
}) {
  const [visited, setVisited] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const arr = JSON.parse(raw) as string[];
        setVisited(new Set(arr));
      }
    } catch {
      /* ignore */
    }
  }, []);

  const markVisited = useCallback((id: string) => {
    setVisited((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      visited,
      markVisited,
      visitedCount: visited.size,
      totalCount,
    }),
    [visited, markVisited, totalCount],
  );

  return (
    <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used within ProgressProvider");
  return ctx;
}
```

Replace it entirely with:

```tsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const VISITED_KEY = "dsa-course-progress";
const SOLVED_KEY = "dsa-course-solved";

interface ProgressContextValue {
  visited: Set<string>;
  markVisited: (id: string) => void;
  visitedCount: number;
  totalCount: number;
  solved: Set<string>;
  markSolved: (id: string) => void;
  solvedCount: number;
  totalProblemCount: number;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

/** Reads a JSON string-array key from localStorage, or an empty set on any failure. */
function readSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function writeSet(key: string, value: Set<string>) {
  try {
    localStorage.setItem(key, JSON.stringify([...value]));
  } catch {
    /* private mode or a full quota — losing the record is survivable */
  }
}

export function ProgressProvider({
  children,
  totalCount,
  totalProblemCount,
}: {
  children: React.ReactNode;
  totalCount: number;
  totalProblemCount: number;
}) {
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [solved, setSolved] = useState<Set<string>>(new Set());

  // Reading localStorage during render would desync server and client
  // HTML, so both restores happen in an effect, once, on mount.
  useEffect(() => {
    setVisited(readSet(VISITED_KEY));
    setSolved(readSet(SOLVED_KEY));
  }, []);

  const markVisited = useCallback((id: string) => {
    setVisited((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      writeSet(VISITED_KEY, next);
      return next;
    });
  }, []);

  const markSolved = useCallback((id: string) => {
    setSolved((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      writeSet(SOLVED_KEY, next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      visited,
      markVisited,
      visitedCount: visited.size,
      totalCount,
      solved,
      markSolved,
      solvedCount: solved.size,
      totalProblemCount,
    }),
    [visited, markVisited, totalCount, solved, markSolved, totalProblemCount],
  );

  return (
    <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used within ProgressProvider");
  return ctx;
}
```

(The internal `STORAGE_KEY` constant is renamed to `VISITED_KEY` — this is
a private, unexported identifier, so the rename cannot affect any other
file. `readSet`/`writeSet` are extracted because the pattern is now used
twice; this is not a new public API, both stay unexported.)

- [ ] **Step 2: Wire `totalProblemCount` in `AppShell.tsx`**

Current relevant lines in `src/components/layout/AppShell.tsx`:

```tsx
import { allLessonIds } from "@/lib/course/manifest";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const totalCount = allLessonIds().length;
```

Change to:

```tsx
import { allLessonIds, allProblemSlugs } from "@/lib/course/manifest";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const totalCount = allLessonIds().length;
  const totalProblemCount = allProblemSlugs().length;
```

And change:

```tsx
    <ProgressProvider totalCount={totalCount}>
```

to:

```tsx
    <ProgressProvider totalCount={totalCount} totalProblemCount={totalProblemCount}>
```

- [ ] **Step 3: Typecheck, lint, full suite**

Run: `npx tsc --noEmit && npx eslint src tests && npm test`
Expected: all exit 0 / pass. (`tsc` here is what actually proves nothing
else constructs a `<ProgressProvider>` without the new required prop —
there is only the one call site, in `AppShell.tsx`, just changed above.)

- [ ] **Step 4: Browser check — visited counter still works**

```
mcp__Claude_Browser__preview_start { name: "web-dev" }
mcp__Claude_Browser__navigate { url: "http://localhost:3002/course/big-o/common-complexity-classes" }
```
Check the header's "X/191" counter increments as it did before this
change (open dev tools or just note the number, navigate to one more
never-visited lesson, confirm it goes up by exactly one) — this task
changes the Provider's internals and adds a new required prop; this step
confirms the pre-existing visited behavior survived the refactor.

- [ ] **Step 5: Commit**

```bash
git add src/components/providers/ProgressProvider.tsx src/components/layout/AppShell.tsx
git commit -m "Add solved tracking to ProgressProvider, alongside the existing visited tracking"
```

---

### Task 5: `Sandbox` gains `onSolved`

**Files:**
- Modify: `src/components/sandbox/Sandbox.tsx`

**Interfaces:**
- Consumes: nothing new — `Sandbox` does not import `ProgressProvider`
  or know about lesson ids at all, by design (see the spec's rationale:
  it stays a generic, context-free code runner).
- Produces: `Sandbox`'s props gain `onSolved?: () => void`, called once
  per pass-transition. Consumed by Task 6's `ProblemLessonView`.

- [ ] **Step 1: Add the prop and the pass-transition effect**

In `src/components/sandbox/Sandbox.tsx`, change the top-level export:

```tsx
export function Sandbox({ source }: { source: string }) {
  const spec = useMemo(() => parseSandboxSpec(source), [source]);
  if (!spec) return <ErrorCard message="Invalid sandbox block." />;
  return <SandboxBody spec={spec} />;
}
```

to:

```tsx
export function Sandbox({
  source,
  onSolved,
}: {
  source: string;
  onSolved?: () => void;
}) {
  const spec = useMemo(() => parseSandboxSpec(source), [source]);
  if (!spec) return <ErrorCard message="Invalid sandbox block." />;
  return <SandboxBody spec={spec} onSolved={onSolved} />;
}
```

Change the `SandboxBody` signature:

```tsx
function SandboxBody({
  spec,
}: {
  spec: NonNullable<ReturnType<typeof parseSandboxSpec>>;
}) {
```

to:

```tsx
function SandboxBody({
  spec,
  onSolved,
}: {
  spec: NonNullable<ReturnType<typeof parseSandboxSpec>>;
  onSolved?: () => void;
}) {
```

Immediately after the existing line

```tsx
  const allPassed = results !== null && passed === total;
```

add:

```tsx
  // A side effect synchronized to derived state, not a write during
  // render — the standard React idiom for "call this once when a value
  // transitions," and safe under Strict Mode's dev-only double-invoke.
  useEffect(() => {
    if (allPassed) onSolved?.();
  }, [allPassed, onSolved]);
```

- [ ] **Step 2: Typecheck and lint**

Run: `npx tsc --noEmit && npx eslint src tests`
Expected: both exit 0 (the new prop is optional, so every existing call
site — currently just `ProblemLessonView`, updated in Task 6 — keeps
compiling either way)

- [ ] **Step 3: Full test suite**

Run: `npm test`
Expected: all tests pass, unchanged count (no test exercises `onSolved`
directly yet — Task 6's browser verification is what proves this works
end to end, since it requires a real pass/fail run through the actual
Python/JS runners)

- [ ] **Step 4: Commit**

```bash
git add src/components/sandbox/Sandbox.tsx
git commit -m "Add onSolved to Sandbox, called once on the pass-transition"
```

---

### Task 6: `/problems/[slug]` route + `ProblemLessonView` updates

**Files:**
- Create: `src/app/problems/[slug]/page.tsx`
- Modify: `src/components/course/ProblemLessonView.tsx`

**Interfaces:**
- Consumes: `findProblemBySlug`, `getProblemNeighbors` (Task 2),
  `problemHref`, `moduleHref` (Task 3/existing), `useProgress` (Task 4),
  `Sandbox`'s `onSolved` (Task 5), `loadLesson` (existing, unchanged).
- Produces: the live `/problems/[slug]` route. Nothing later depends on
  this task directly, but Task 7's redirect target is this route's URL
  shape (`problemHref(slug)`).

- [ ] **Step 1: Make `ProblemLessonView` a client component and add the Solved badge**

Current full content of `src/components/course/ProblemLessonView.tsx`:

```tsx
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Markdown } from "@/components/md/Markdown";
import { TableOfContents } from "@/components/md/TableOfContents";
import { Sandbox } from "@/components/sandbox/Sandbox";
import { Breadcrumbs, type Crumb } from "@/components/layout/Breadcrumbs";
import type { LoadedLesson } from "@/lib/course/load";
import type { SandboxExtraction } from "@/lib/content/extractSandboxFence";

interface NeighborLink {
  href: string;
  title: string;
}

interface ProblemLessonViewProps {
  /** `sandbox` narrowed non-null by the caller — see the route */
  lesson: LoadedLesson & { sandbox: SandboxExtraction };
  breadcrumbs: Crumb[];
  eyebrow: string;
  prev: NeighborLink | null;
  next: NeighborLink | null;
}

export function ProblemLessonView({
  lesson,
  breadcrumbs,
  eyebrow,
  prev,
  next,
}: ProblemLessonViewProps) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8 lg:py-10">
      <Breadcrumbs items={breadcrumbs} />
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-accent">
        {eyebrow}
      </p>
      <h1 className="riso-overprint font-display text-3xl font-bold tracking-tight text-balance uppercase sm:text-[2.1rem]">
        {lesson.title}
      </h1>
      <p className="mt-2 flex items-center gap-3 text-sm text-muted">
        <span className="rounded-full border border-border px-2 py-0.5 text-xs">
          Problem
        </span>
        ~{lesson.readingMinutes} min
      </p>

      <div className="problem-layout mt-8">
        <div className="problem-layout-before min-w-0">
          <Markdown
            source={lesson.sandbox.beforeSandbox}
            highlightedBlocks={lesson.highlightedBlocks}
            highlightedTabs={lesson.highlightedTabs}
          />
        </div>

        <div className="problem-layout-sandbox min-w-0 print:hidden">
          <TableOfContents items={lesson.toc} />
          <div className="mt-6">
            <Sandbox source={lesson.sandbox.sandboxSource} />
          </div>
        </div>

        <div className="problem-layout-after min-w-0">
          <Markdown
            source={lesson.sandbox.afterSandbox}
            highlightedBlocks={lesson.highlightedBlocks}
            highlightedTabs={lesson.highlightedTabs}
          />
        </div>
      </div>

      <nav className="mt-12 flex items-stretch justify-between gap-4 border-t border-border pt-6">
        {prev ? (
          <Link
            href={prev.href}
            className="group flex max-w-[45%] items-center gap-2 rounded-lg border border-border px-4 py-3 text-sm transition hover:border-foreground/25 hover:bg-surface"
          >
            <ArrowLeft weight="bold" className="h-4 w-4 shrink-0 text-muted transition group-hover:text-foreground" />
            <span className="min-w-0">
              <span className="block text-xs text-muted">Previous</span>
              <span className="block truncate font-medium">{prev.title}</span>
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={next.href}
            className="group flex max-w-[45%] items-center gap-2 rounded-lg border border-border px-4 py-3 text-right text-sm transition hover:border-foreground/25 hover:bg-surface"
          >
            <span className="min-w-0">
              <span className="block text-xs text-muted">Next</span>
              <span className="block truncate font-medium">{next.title}</span>
            </span>
            <ArrowRight weight="bold" className="h-4 w-4 shrink-0 text-muted transition group-hover:text-foreground" />
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
```

Replace it entirely with:

```tsx
"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Check } from "@phosphor-icons/react";
import { Markdown } from "@/components/md/Markdown";
import { TableOfContents } from "@/components/md/TableOfContents";
import { Sandbox } from "@/components/sandbox/Sandbox";
import { Breadcrumbs, type Crumb } from "@/components/layout/Breadcrumbs";
import { useProgress } from "@/components/providers/ProgressProvider";
import { lessonId } from "@/lib/course/nav";
import type { LoadedLesson } from "@/lib/course/load";
import type { SandboxExtraction } from "@/lib/content/extractSandboxFence";

interface NeighborLink {
  href: string;
  title: string;
}

interface ProblemLessonViewProps {
  /** `sandbox` narrowed non-null by the caller — see the route */
  lesson: LoadedLesson & { sandbox: SandboxExtraction };
  breadcrumbs: Crumb[];
  eyebrow: string;
  prev: NeighborLink | null;
  next: NeighborLink | null;
}

export function ProblemLessonView({
  lesson,
  breadcrumbs,
  eyebrow,
  prev,
  next,
}: ProblemLessonViewProps) {
  const { solved, markSolved } = useProgress();
  const id = lessonId(lesson.moduleSlug, lesson.lessonSlug);
  const isSolved = solved.has(id);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8 lg:py-10">
      <Breadcrumbs items={breadcrumbs} />
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-accent">
        {eyebrow}
      </p>
      <h1 className="riso-overprint font-display text-3xl font-bold tracking-tight text-balance uppercase sm:text-[2.1rem]">
        {lesson.title}
      </h1>
      <p className="mt-2 flex items-center gap-3 text-sm text-muted">
        <span className="rounded-full border border-border px-2 py-0.5 text-xs">
          Problem
        </span>
        ~{lesson.readingMinutes} min
        {isSolved ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-good/15 px-2 py-0.5 text-xs font-medium text-good">
            <Check size={11} strokeWidth={3} aria-hidden />
            Solved
          </span>
        ) : null}
      </p>

      <div className="problem-layout mt-8">
        <div className="problem-layout-before min-w-0">
          <Markdown
            source={lesson.sandbox.beforeSandbox}
            highlightedBlocks={lesson.highlightedBlocks}
            highlightedTabs={lesson.highlightedTabs}
          />
        </div>

        <div className="problem-layout-sandbox min-w-0 print:hidden">
          <TableOfContents items={lesson.toc} />
          <div className="mt-6">
            <Sandbox
              source={lesson.sandbox.sandboxSource}
              onSolved={() => markSolved(id)}
            />
          </div>
        </div>

        <div className="problem-layout-after min-w-0">
          <Markdown
            source={lesson.sandbox.afterSandbox}
            highlightedBlocks={lesson.highlightedBlocks}
            highlightedTabs={lesson.highlightedTabs}
          />
        </div>
      </div>

      <nav className="mt-12 flex items-stretch justify-between gap-4 border-t border-border pt-6">
        {prev ? (
          <Link
            href={prev.href}
            className="group flex max-w-[45%] items-center gap-2 rounded-lg border border-border px-4 py-3 text-sm transition hover:border-foreground/25 hover:bg-surface"
          >
            <ArrowLeft weight="bold" className="h-4 w-4 shrink-0 text-muted transition group-hover:text-foreground" />
            <span className="min-w-0">
              <span className="block text-xs text-muted">Previous</span>
              <span className="block truncate font-medium">{prev.title}</span>
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={next.href}
            className="group flex max-w-[45%] items-center gap-2 rounded-lg border border-border px-4 py-3 text-right text-sm transition hover:border-foreground/25 hover:bg-surface"
          >
            <span className="min-w-0">
              <span className="block text-xs text-muted">Next</span>
              <span className="block truncate font-medium">{next.title}</span>
            </span>
            <ArrowRight weight="bold" className="h-4 w-4 shrink-0 text-muted transition group-hover:text-foreground" />
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
```

Note the icon import changed from `@phosphor-icons/react/dist/ssr` to
plain `@phosphor-icons/react` — required now that this file is a Client
Component (`"use client"`), and consistent with how every other client
component in this app imports Phosphor icons (e.g. `Sandbox.tsx`).

`lessonId(lesson.moduleSlug, lesson.lessonSlug)` computes the same
composite id `visited`/`solved` already use — `LoadedLesson` already
carries both fields, so no new prop is needed to know it here.

- [ ] **Step 2: Create the route**

Create `src/app/problems/[slug]/page.tsx`:

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProblemLessonView } from "@/components/course/ProblemLessonView";
import { loadLesson } from "@/lib/course/load";
import {
  findProblemBySlug,
  getProblemNeighbors,
  allProblemSlugs,
} from "@/lib/course/manifest";
import { moduleHref, problemHref } from "@/lib/course/nav";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return allProblemSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const hit = findProblemBySlug(slug);
  return { title: hit ? hit.lesson.title : "Problem" };
}

export default async function ProblemPage({ params }: PageProps) {
  const { slug } = await params;
  const hit = findProblemBySlug(slug);
  if (!hit) notFound();

  const lesson = await loadLesson(hit.module.slug, hit.lesson.slug);
  if (!lesson || !lesson.sandbox) notFound();

  const { prev, next } = getProblemNeighbors(hit.module.slug, slug);

  return (
    <ProblemLessonView
      lesson={{ ...lesson, sandbox: lesson.sandbox }}
      eyebrow={`Module ${hit.module.number} · ${hit.module.title}`}
      breadcrumbs={[
        { label: "Problems", href: "/problems" },
        { label: hit.module.shortTitle, href: moduleHref(hit.module.slug) },
        { label: hit.lesson.title },
      ]}
      prev={prev ? { href: problemHref(prev.slug), title: prev.title } : null}
      next={next ? { href: problemHref(next.slug), title: next.title } : null}
    />
  );
}
```

- [ ] **Step 3: Typecheck, lint, build**

Run: `npx tsc --noEmit && npx eslint src tests`
Expected: both exit 0

Run: `npm run build`
Expected: exit 0, and the printed route table lists
`/problems/[slug]` with its 116 generated paths alongside the existing
`/course/[module]/[lesson]` paths (Task 7 hasn't changed that route yet,
so both exist and render full content for the same 116 problems right
now — don't try to predict the exact total page count from this;
just confirm the build has no errors and `/problems/[slug]` is present).

- [ ] **Step 4: Full test suite**

Run: `npm test`
Expected: all tests pass

- [ ] **Step 5: Browser verification — the new route, solving a problem**

```
mcp__Claude_Browser__navigate { url: "http://localhost:3002/problems/subsets" }
mcp__Claude_Browser__resize_window { preset: "desktop" }
mcp__Claude_Browser__computer { action: "screenshot" }
```
Expected: identical split-pane layout to what the old
`/course/recursion-backtracking/subsets` route rendered — breadcrumb now
reads "Problems > Recursion > Subsets" instead of "Course > Recursion >
Subsets", and the header's type-pill line has room for (but does not yet
show) a Solved badge.

Type a correct solution into the Python editor and run it — reuse the
same solution already verified for this lesson:

```python
def subsets(nums):
    result = []
    def backtrack(start, path):
        result.append(path[:])
        for i in range(start, len(nums)):
            path.append(nums[i])
            backtrack(i + 1, path)
            path.pop()
    backtrack(0, [])
    return result
```

Click "Run tests", confirm "All 5 passed", then take another screenshot
and confirm a green "Solved" badge now appears next to "~10 min" in the
header — proving `onSolved` → `markSolved` → the badge's `solved.has(id)`
read all actually connect, not just typecheck.

Reload the page (`mcp__Claude_Browser__navigate` to the same URL) and
confirm the Solved badge is still there — proving it persisted to
`localStorage`, not just in-memory React state.

- [ ] **Step 6: Browser verification — prev/next is module-scoped**

Still on `/problems/subsets`, check the bottom nav: "Previous" should be
absent (Subsets is `recursion-backtracking`'s first problem) and "Next"
should read "Permutations". Click it, confirm it navigates to
`/problems/permutations`.

- [ ] **Step 7: Commit**

```bash
git add src/app/problems src/components/course/ProblemLessonView.tsx
git commit -m "Add /problems/[slug]; ProblemLessonView gets the Solved badge and onSolved wiring"
```

---

### Task 7: Redirect problem lessons off `/course/[module]/[lesson]`

**Files:**
- Modify: `src/app/course/[module]/[lesson]/page.tsx`

**Interfaces:**
- Consumes: `problemHref` (Task 3).
- Produces: nothing for later tasks.

- [ ] **Step 1: Replace the route**

Current full content of `src/app/course/[module]/[lesson]/page.tsx`:

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LessonView } from "@/components/course/LessonView";
import { ProblemLessonView } from "@/components/course/ProblemLessonView";
import { LESSON_EMBEDS } from "@/components/course/embeds";
import {
  allLessonParams,
  getLessonNeighbors,
  loadLesson,
} from "@/lib/course/load";
import { getLesson, getModule } from "@/lib/course/manifest";
import { lessonHref, lessonId, moduleHref } from "@/lib/course/nav";

interface PageProps {
  params: Promise<{ module: string; lesson: string }>;
}

export function generateStaticParams() {
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
  const lesson = await loadLesson(moduleSlug, lessonSlug);
  if (!mod || !meta || !lesson) notFound();

  const { prev, next } = getLessonNeighbors(moduleSlug, lessonSlug);
  const Embed = LESSON_EMBEDS[lessonId(moduleSlug, lessonSlug)];

  const breadcrumbs = [
    { label: "Course", href: "/" },
    { label: mod.shortTitle, href: moduleHref(mod.slug) },
    { label: meta.lesson.title },
  ];
  const prevLink = prev
    ? { href: lessonHref(prev.module, prev.lesson), title: prev.title }
    : null;
  const nextLink = next
    ? { href: lessonHref(next.module, next.lesson), title: next.title }
    : null;

  if (lesson.sandbox) {
    return (
      <ProblemLessonView
        lesson={{ ...lesson, sandbox: lesson.sandbox }}
        eyebrow={`Module ${mod.number} · ${mod.title}`}
        breadcrumbs={breadcrumbs}
        prev={prevLink}
        next={nextLink}
      />
    );
  }

  return (
    <LessonView
      lesson={lesson}
      eyebrow={`Module ${mod.number} · ${mod.title}`}
      typeLabel={meta.lesson.type === "problem" ? "Problem" : "Concept"}
      breadcrumbs={breadcrumbs}
      prev={prevLink}
      next={nextLink}
      stage={Embed ? <Embed /> : undefined}
    />
  );
}
```

Replace it entirely with:

```tsx
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
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

  // Problems live at /problems/[slug] now — this keeps the old course
  // URL working (rather than 404ing) in case anything still links to it.
  if (meta.lesson.type === "problem") {
    redirect(problemHref(lessonSlug));
  }

  const lesson = await loadLesson(moduleSlug, lessonSlug);
  if (!lesson) notFound();

  const { prev, next } = getLessonNeighbors(moduleSlug, lessonSlug);
  const Embed = LESSON_EMBEDS[lessonId(moduleSlug, lessonSlug)];

  return (
    <LessonView
      lesson={lesson}
      eyebrow={`Module ${mod.number} · ${mod.title}`}
      typeLabel="Concept"
      breadcrumbs={[
        { label: "Course", href: "/" },
        { label: mod.shortTitle, href: moduleHref(mod.slug) },
        { label: meta.lesson.title },
      ]}
      prev={prev ? { href: lessonHref(prev.module, prev.lesson), title: prev.title } : null}
      next={next ? { href: lessonHref(next.module, next.lesson), title: next.title } : null}
      stage={Embed ? <Embed /> : undefined}
    />
  );
}
```

(`typeLabel` is hardcoded to `"Concept"` now — this render path is only
ever reached for concept lessons, since problem lessons redirect above
before `loadLesson` is even called.)

- [ ] **Step 2: Typecheck and lint**

Run: `npx tsc --noEmit && npx eslint src tests`
Expected: both exit 0

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: exit 0, no errors. `generateStaticParams` is unchanged in this
file, so Next still pre-renders a page for all 116 problem slugs under
`/course/[module]/[lesson]` — each one now redirects instead of
rendering content. Don't assert a specific total page count here; the
functional checks in Steps 5–6 below are what actually prove this task
works, not build-time arithmetic.

- [ ] **Step 4: Full test suite**

Run: `npm test`
Expected: all tests pass

- [ ] **Step 5: Browser verification — old URL redirects**

```
mcp__Claude_Browser__navigate { url: "http://localhost:3002/course/recursion-backtracking/subsets" }
```
Expected: browser ends up at `http://localhost:3002/problems/subsets`,
rendering the same split-pane page verified in Task 6 — not a 404.

- [ ] **Step 6: Browser verification — concept lessons still render directly**

```
mcp__Claude_Browser__navigate { url: "http://localhost:3002/course/big-o/common-complexity-classes" }
```
Expected: renders normally at this exact URL — no redirect, single-column
layout with the `BigOObservatory` stage embed, unchanged from before this
plan.

- [ ] **Step 7: Commit**

```bash
git add "src/app/course/[module]/[lesson]/page.tsx"
git commit -m "Redirect problem lessons from /course/[module]/[lesson] to /problems/[slug]"
```

---

### Task 8: Sidebar + module page link into the hub; a "Problems" entry in primary nav

The written spec covers the href changes and the Sidebar solved
checkmark. It does not mention how `/problems` itself is *reached* from
anywhere other than a problem page's own breadcrumb (which only exists
once you're already on one) — that's a real gap, not an intentional
omission, so this task adds a single small "Problems" link near the
existing "Course Overview" link at the top of the sidebar to close it.

**Files:**
- Modify: `src/lib/course/nav.ts`
- Modify: `src/components/layout/Sidebar.tsx`
- Modify: `src/app/course/[module]/page.tsx`

**Interfaces:**
- Consumes: `problemHref` (Task 3), `useProgress().solved` (Task 4).
- Produces: nothing for later tasks.

- [ ] **Step 1: Make `buildCourseNav` route problem lessons into the hub**

In `src/lib/course/nav.ts`, change:

```ts
      lessons: m.lessons.map((l) => ({
        id: lessonId(m.slug, l.slug),
        title: l.title,
        href: lessonHref(m.slug, l.slug),
        type: l.type,
      })),
```

to:

```ts
      lessons: m.lessons.map((l) => ({
        id: lessonId(m.slug, l.slug),
        title: l.title,
        href: l.type === "problem" ? problemHref(l.slug) : lessonHref(m.slug, l.slug),
        type: l.type,
      })),
```

- [ ] **Step 2: Add the solved checkmark and a "Problems" link in `Sidebar.tsx`**

Change the icon import line:

```ts
import { CaretDown as ChevronDown, CaretRight as ChevronRight } from "@phosphor-icons/react";
```

to:

```ts
import { CaretDown as ChevronDown, CaretRight as ChevronRight, Check } from "@phosphor-icons/react";
```

In `ModuleNode`, change:

```tsx
  const { visited } = useProgress();
```

to:

```tsx
  const { visited, solved } = useProgress();
```

Change the per-lesson row:

```tsx
          {module.lessons.map((lesson) => {
            const active = pathname === lesson.href;
            const isDone = visited.has(lesson.id);
            return (
              <div key={lesson.id} className="flex items-center gap-0.5">
                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center">
                  <span
                    className={cn(
                      "h-2 w-2 rounded-[1px] transition-colors",
                      isDone
                        ? "bg-accent"
                        : "border border-border bg-transparent",
                    )}
                    title={isDone ? "Completed" : "Not completed"}
                  />
                </span>
                <Link
                  href={lesson.href}
                  className={cn(
                    "min-w-0 flex-1 truncate rounded-[4px] py-1 pl-1.5 pr-1.5 text-[13px] transition-colors",
                    active
                      ? "bg-pop font-semibold text-on-pop"
                      : "text-muted hover:bg-surface hover:text-foreground",
                  )}
                >
                  {lesson.title}
                </Link>
              </div>
            );
          })}
```

to:

```tsx
          {module.lessons.map((lesson) => {
            const active = pathname === lesson.href;
            const isDone = visited.has(lesson.id);
            const isSolved = lesson.type === "problem" && solved.has(lesson.id);
            return (
              <div key={lesson.id} className="flex items-center gap-0.5">
                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center">
                  <span
                    className={cn(
                      "h-2 w-2 rounded-[1px] transition-colors",
                      isDone
                        ? "bg-accent"
                        : "border border-border bg-transparent",
                    )}
                    title={isDone ? "Completed" : "Not completed"}
                  />
                </span>
                <Link
                  href={lesson.href}
                  className={cn(
                    "min-w-0 flex-1 truncate rounded-[4px] py-1 pl-1.5 pr-1.5 text-[13px] transition-colors",
                    active
                      ? "bg-pop font-semibold text-on-pop"
                      : "text-muted hover:bg-surface hover:text-foreground",
                  )}
                >
                  {lesson.title}
                </Link>
                {isSolved ? (
                  <span className="mr-1.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-good/15 text-good">
                    <Check size={10} strokeWidth={3} aria-label="Solved" />
                  </span>
                ) : null}
              </div>
            );
          })}
```

Add the "Problems" link right after the existing "Course Overview" link
in the top-level `Sidebar` component. Change:

```tsx
          <Link
            href="/"
            className={cn(
              "mb-1 block rounded-[4px] py-1 pl-2 text-[13px] font-medium transition-colors",
              pathname === "/"
                ? "bg-pop font-semibold text-on-pop"
                : "text-foreground hover:bg-surface",
            )}
          >
            Course Overview
          </Link>
          {nav.map((stage) => (
```

to:

```tsx
          <Link
            href="/"
            className={cn(
              "mb-1 block rounded-[4px] py-1 pl-2 text-[13px] font-medium transition-colors",
              pathname === "/"
                ? "bg-pop font-semibold text-on-pop"
                : "text-foreground hover:bg-surface",
            )}
          >
            Course Overview
          </Link>
          <Link
            href="/problems"
            className={cn(
              "mb-2 block rounded-[4px] py-1 pl-2 text-[13px] font-medium transition-colors",
              pathname === "/problems"
                ? "bg-pop font-semibold text-on-pop"
                : "text-foreground hover:bg-surface",
            )}
          >
            Problems
          </Link>
          {nav.map((stage) => (
```

- [ ] **Step 3: Update the module page's problem-row links**

In `src/app/course/[module]/page.tsx`, change the import:

```ts
import { lessonHref } from "@/lib/course/nav";
```

to:

```ts
import { lessonHref, problemHref } from "@/lib/course/nav";
```

Change:

```tsx
              <Link
                href={lessonHref(mod.slug, lesson.slug)}
                className="flex items-center gap-3 rounded-lg border border-border px-4 py-3 text-sm transition hover:border-foreground/25 hover:bg-surface"
              >
```

to:

```tsx
              <Link
                href={
                  lesson.type === "problem"
                    ? problemHref(lesson.slug)
                    : lessonHref(mod.slug, lesson.slug)
                }
                className="flex items-center gap-3 rounded-lg border border-border px-4 py-3 text-sm transition hover:border-foreground/25 hover:bg-surface"
              >
```

- [ ] **Step 4: Typecheck, lint, full suite**

Run: `npx tsc --noEmit && npx eslint src tests && npm test`
Expected: all exit 0 / pass

- [ ] **Step 5: Browser verification**

```
mcp__Claude_Browser__navigate { url: "http://localhost:3002/course/recursion-backtracking" }
```
Confirm: the "Subsets" row's link goes to `/problems/subsets` (hover or
click to confirm), and a "Problems" link is visible near the top of the
sidebar, above the stage list.

Click into `/problems/subsets`, solve it (reuse the same Python solution
from Task 6), then navigate back to
`/course/recursion-backtracking/subsets` — confirm it redirects to
`/problems/subsets` (Task 7's behavior) and check the sidebar: "Subsets"
should now show a green solved checkmark next to it.

- [ ] **Step 6: Commit**

```bash
git add src/lib/course/nav.ts src/components/layout/Sidebar.tsx "src/app/course/[module]/page.tsx"
git commit -m "Sidebar and module page link problem rows into the hub; add a Problems nav entry and solved checkmark"
```

---

### Task 9: `/problems` list page

**Files:**
- Create: `src/app/problems/page.tsx`
- Create: `src/components/problems/ProblemsListClient.tsx`

**Interfaces:**
- Consumes: `groupedProblems`, `ProblemGroup` (Task 2), `problemHref`
  (Task 3), `useProgress` (Task 4).
- Produces: nothing for later tasks — the last new page in this plan.

- [ ] **Step 1: Create the client list component**

Create `src/components/problems/ProblemsListClient.tsx`:

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
        problems: g.problems.filter((p) => p.title.toLowerCase().includes(q)),
      }))
      .filter((g) => g.problems.length > 0);
  }, [groups, query]);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 lg:px-8 lg:py-10">
      <h1 className="riso-overprint font-display text-3xl font-bold tracking-tight text-balance uppercase sm:text-[2.1rem]">
        Problems
      </h1>
      <p className="mt-2 text-sm text-muted">
        {solvedCount} of {totalProblemCount} solved
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
                          <Check size={12} strokeWidth={3} aria-label="Solved" />
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
          <p className="text-sm text-muted">No problems match "{query}".</p>
        ) : null}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create the route**

Create `src/app/problems/page.tsx`:

```tsx
import type { Metadata } from "next";
import { groupedProblems } from "@/lib/course/manifest";
import { ProblemsListClient } from "@/components/problems/ProblemsListClient";

export const metadata: Metadata = { title: "Problems" };

export default function ProblemsPage() {
  return <ProblemsListClient groups={groupedProblems()} />;
}
```

- [ ] **Step 3: Typecheck, lint, build**

Run: `npx tsc --noEmit && npx eslint src tests`
Expected: both exit 0

Run: `npm run build`
Expected: exit 0, `/problems` appears in the static route list

- [ ] **Step 4: Full test suite**

Run: `npm test`
Expected: all tests pass

- [ ] **Step 5: Browser verification**

```
mcp__Claude_Browser__navigate { url: "http://localhost:3002/problems" }
mcp__Claude_Browser__computer { action: "screenshot" }
```
Expected: grouped-by-module list, "Recursion & Backtracking" section
shows Subsets with a green solved checkmark (from Task 6/8's earlier
solve) and its five sibling problems without one. Summary line at top
reads "1 of 116 solved" (or however many were solved during this plan's
verification steps).

Type "subsets" into the search box — confirm the list narrows to just
that one row under its module heading, all other groups disappear. Clear
the search, confirm the full list returns.

Click the Subsets row, confirm it navigates to `/problems/subsets`.

- [ ] **Step 6: Commit**

```bash
git add src/app/problems/page.tsx src/components/problems/ProblemsListClient.tsx
git commit -m "Add the /problems list: grouped by module, search, solved summary"
```

---

### Task 10: Final full-suite verification

**Files:** none (verification only)

- [ ] **Step 1: All four gates**

```bash
npx tsc --noEmit
npx eslint src tests
npm test
npm run build
```
Expected: all four exit 0. Don't check this against a specific expected
page-count number — Steps 2–4 below are the actual proof this plan
works, by exercising both route shapes directly rather than inferring
correctness from build output arithmetic.

- [ ] **Step 2: End-to-end walk, a problem never touched before**

Pick one not used in any earlier task's verification, e.g.
`course-schedule` in `graphs`:

```
mcp__Claude_Browser__navigate { url: "http://localhost:3002/problems" }
```
Search "course schedule", click through to `/problems/course-schedule`,
confirm the page renders with an empty (unsolved) state — no Solved
badge, no checkmark back on the list for it.

- [ ] **Step 3: Visited-counter regression check, once more, end to end**

Note the header's "X/191" value. Navigate to a lesson never visited in
any earlier task (e.g. a concept lesson deep in a module not yet
touched, and a problem not yet touched). Confirm the counter increments
by exactly one for each — proving Task 3's `lessonIdFromPathname` fix
holds for both URL shapes under real navigation, not just its unit test.

- [ ] **Step 4: Print check**

```
mcp__Claude_Browser__navigate { url: "http://localhost:3002/problems/subsets" }
```
Confirm print media still shows continuous text with no editor/floating
panel (unchanged from the split-pane work — this plan didn't touch that
CSS, this step just confirms moving the route didn't regress it).

- [ ] **Step 5: Final commit (only if any fixups were needed above)**

If every gate and every browser check already passed with no changes
needed, there is nothing to commit here — Task 9's commit is the last
one. If a fixup was required, commit it with a message describing what
this task's verification caught.
