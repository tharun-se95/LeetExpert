# Multi-Course Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Introduce a real course boundary in the app — DSA moves from being
the app's only, fused-in content to being the first registered course under
`/courses/dsa/`, with a thin shared platform contract (catalog registry,
namespaced progress storage, multi-course search, theming dispatch) that a
future course (e.g. Next.js) can plug into without adopting DSA's lesson
taxonomy, practice mechanism, or route shape.

**Architecture:** Per
`docs/superpowers/specs/2026-08-31-multi-course-platform-design.md` — each
course owns a literal route subtree under `app/courses/<slug>/` and its own
manifest/content. The platform shares only: a `CourseRegistryEntry` contract
(catalog + nav), a course-namespaced progress-storage mechanism, a
`SearchDocument` contract (search aggregation), and the existing
`--accent/--pop/--highlight/--on-pop` CSS theming contract. This plan
executes the DSA-side migration end to end and stands up the shared
contracts as real, working code (not stubs) — there is no second course to
onboard yet, but every shared piece is built generically from the start so
onboarding one later touches exactly the files the design promises (one
registry file + an isolated route folder).

**Tech Stack:** Next.js App Router, TypeScript strict, Vitest, existing
`lib/course/*` DSA manifest/loader (untouched in shape — its content root
and consumers move, its exports don't change).

## Global Constraints

- TypeScript strict; no `any`, no unchecked casts (per `CLAUDE.md` §5).
- Every existing test must still pass; tests whose assertions encode the
  old `/course/...` / `/problems/...` URL shape must be updated to the new
  shape as part of the same task that changes the shape (never left red).
- No unrelated refactoring — `components/course/*` markdown-fence renderers
  (`Quiz`, `Reveal`, `CodeTabs`, `ConceptMindMap`, `embeds`, `Complexity`,
  `ChapterInfographic`, `VideoPlayer`, `AudioMini`, `WatchLessonLink`,
  `LessonView`, `ProblemLessonView`) are explicitly **not** reclassified or
  moved in this plan — see Task 5's note. Splitting them into a shared
  "lesson kit" is deferred until a second course actually needs one of
  them, per YAGNI.
- Comments explain why, not what (per `CLAUDE.md` §5).
- Run `npm test` (in `web/`) after every task; run `npm run build` after
  Task 4 (once routing has fully moved) and again at the end.

---

## File Structure

**New files:**
- `web/src/lib/courses/registry.ts` — `CourseRegistryEntry` type + the
  top-level static aggregator (`COURSES: CourseRegistryEntry[]`)
- `web/src/app/courses/dsa/registry.ts` — DSA's own `CourseRegistryEntry`
- `web/tests/coursesRegistry.test.ts` — registry shape/uniqueness tests
- `web/tests/courseContentCoverage.test.ts` — every registered course has
  a non-empty content directory (closes the "silent zero coverage" gap)
- `web/tests/progressStorage.test.ts` — namespacing + legacy-migration tests
- `web/src/lib/search/types.ts` — `SearchDocument` interface
- `web/src/components/kit/CodeEditor.tsx` — extracted generic editor
  primitive (moved out of `components/sandbox/CodeEditor.tsx`, which
  already exists — see Task 10; this bullet documents its **new** import
  path, the file itself is a `git mv`, not a fresh file)

**Moved files** (git mv, contents adjusted where noted):
- `course/` → `courses/dsa/` (repo root, outside `web/`)
- `web/src/app/course/[module]/page.tsx` → `web/src/app/courses/dsa/[module]/page.tsx`
- `web/src/app/course/[module]/[lesson]/page.tsx` → `web/src/app/courses/dsa/[module]/[lesson]/page.tsx`
- `web/src/app/course/page.tsx` → `web/src/app/courses/dsa/page.tsx` (becomes DSA's own landing; see Task 11 for what replaces it at `app/page.tsx`)
- `web/src/app/problems/page.tsx` → `web/src/app/courses/dsa/problems/page.tsx`
- `web/src/app/problems/[slug]/page.tsx` → `web/src/app/courses/dsa/problems/[slug]/page.tsx`
- `web/src/components/course/ModuleGlyph.tsx` → `web/src/app/courses/dsa/_components/ModuleGlyph.tsx`
- `web/src/components/course/ModuleMedia.tsx` → `web/src/app/courses/dsa/_components/ModuleMedia.tsx`
- `web/src/components/course/ModulePracticeProgress.tsx` → `web/src/app/courses/dsa/_components/ModulePracticeProgress.tsx`
- `web/src/components/course/ConceptMapNode.tsx` → `web/src/app/courses/dsa/_components/ConceptMapNode.tsx`

**Modified files** (existing, edited in place):
- `web/src/lib/course/load.ts` — `resolveCourseRoot()` content-root check
- `web/src/lib/course/nav.ts` — every href builder + `lessonIdFromPathname`
- `web/next.config.ts` — two redirect rules
- `web/src/components/providers/ProgressProvider.tsx` — namespaced storage
  keys + legacy-key migration
- `web/src/components/layout/AppShell.tsx` — `activeFamilyFor` →
  `activeThemeFor`, course-slug resolution passed to `ProgressProvider`
- `web/src/components/layout/Header.tsx` — `/course` / `/problems` active-tab
  checks
- `web/src/components/layout/SearchDialog.tsx` — consumes `SearchDocument[]`
- `web/scripts/build-search-index.mjs` — iterates the course registry,
  emits `SearchDocument[]`
- `web/scripts/build-coach-corpus.mjs` — content-root path only
- `web/src/lib/landing/content.ts` — hrefs updated to `/courses/dsa/...`
- `web/src/app/layout.tsx` — course-agnostic site metadata
- `web/src/app/page.tsx` — becomes the course catalog (was DSA's landing)
- `web/tests/content.test.ts` — `COURSE_DIR` path
- `web/tests/nav.test.ts`, `web/tests/manifestHelpers.test.ts` — URL-shape
  assertions
- `web/src/components/sandbox/Sandbox.tsx` — imports the moved
  `CodeEditor` from its new path

---

### Task 1: Move DSA content root and update the loader

**Files:**
- Move: `course/` → `courses/dsa/` (repo root)
- Modify: `web/src/lib/course/load.ts:64-77`
- Test: `web/tests/content.test.ts:30` (path constant only — full test
  logic untouched)

**Interfaces:**
- Produces: `courses/dsa/<module>/<lesson>.md` as the on-disk location every
  later task's route files read from.

- [ ] **Step 1: Move the content folder**

```bash
git mv course courses/dsa
```

- [ ] **Step 2: Update `resolveCourseRoot()` in `load.ts`**

Current (`web/src/lib/course/load.ts:59-77`):

```ts
/**
 * Resolve the repo root (folder that contains `course/`).
 * Local & Vercel with Root Directory=`web` use the parent of cwd.
 * Override with `COURSE_ROOT` when needed.
 */
function resolveCourseRoot(): string {
  if (process.env.COURSE_ROOT) {
    return path.resolve(process.env.COURSE_ROOT);
  }
  const candidates = [path.resolve(process.cwd(), ".."), process.cwd()];
  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, "course"))) {
      return dir;
    }
  }
  return path.resolve(process.cwd(), "..");
}
```

Replace with:

```ts
/**
 * Resolve the repo root (folder that contains `courses/`).
 * Local & Vercel with Root Directory=`web` use the parent of cwd.
 * Override with `COURSE_ROOT` when needed.
 */
function resolveCourseRoot(): string {
  if (process.env.COURSE_ROOT) {
    return path.resolve(process.env.COURSE_ROOT);
  }
  const candidates = [path.resolve(process.cwd(), ".."), process.cwd()];
  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, "courses", "dsa"))) {
      return dir;
    }
  }
  return path.resolve(process.cwd(), "..");
}
```

And update the lesson-file path it builds (`web/src/lib/course/load.ts:100`):

```ts
  const relative = path.join("course", moduleSlug, `${lessonSlug}.md`);
```

→

```ts
  const relative = path.join("courses", "dsa", moduleSlug, `${lessonSlug}.md`);
```

- [ ] **Step 3: Update the path constant in `content.test.ts`**

`web/tests/content.test.ts:30`:

```ts
const COURSE_DIR = join(__dirname, "..", "..", "course");
```

→

```ts
const COURSE_DIR = join(__dirname, "..", "..", "courses", "dsa");
```

- [ ] **Step 4: Run the content test suite**

Run: `cd web && npx vitest run tests/content.test.ts`
Expected: PASS (same assertions, new path)

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor(course): move DSA content to courses/dsa/"
```

---

### Task 2: Course registry contract

**Files:**
- Create: `web/src/lib/courses/registry.ts`
- Create: `web/src/app/courses/dsa/registry.ts`
- Test: `web/tests/coursesRegistry.test.ts`

**Interfaces:**
- Produces: `CourseRegistryEntry` type, `COURSES: CourseRegistryEntry[]`
  from `@/lib/courses/registry` — consumed by Task 11 (catalog page) and
  Task 6/7 (course-slug resolution).

- [ ] **Step 1: Write the failing test**

```ts
// web/tests/coursesRegistry.test.ts
import { describe, it, expect } from "vitest";
import { COURSES } from "../src/lib/courses/registry";

describe("COURSES registry", () => {
  it("includes a dsa entry with the required fields", () => {
    const dsa = COURSES.find((c) => c.slug === "dsa");
    expect(dsa).toBeDefined();
    expect(dsa!.title).toBe("Data Structures & Algorithms");
    expect(dsa!.status).toBe("available");
    expect(dsa!.href).toBe("/courses/dsa");
  });

  it("every entry has a unique slug", () => {
    const slugs = COURSES.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("every entry's href matches its slug", () => {
    for (const c of COURSES) {
      expect(c.href).toBe(`/courses/${c.slug}`);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd web && npx vitest run tests/coursesRegistry.test.ts`
Expected: FAIL — `Cannot find module '../src/lib/courses/registry'`

- [ ] **Step 3: Create the registry type + aggregator**

```ts
// web/src/lib/courses/registry.ts

/**
 * The one contract every course must satisfy to appear in the catalog,
 * top-nav switcher, and course-prefix routing resolvers (theming,
 * progress namespacing). Nothing else about a course's internals is
 * shared — see docs/superpowers/specs/2026-08-31-multi-course-platform-design.md.
 */
export interface CourseRegistryEntry {
  slug: string;
  title: string;
  tagline: string;
  /** Single accent hex for the catalog card + nav chip. */
  accent: string;
  status: "available" | "coming-soon";
  href: string;
  stats?: { label: string; value: string }[];
}

import { DSA_COURSE } from "@/app/courses/dsa/registry";

/**
 * Static, compile-time registration — not a dynamic plugin loader. This is
 * the one file a new course must add itself to; everything else about a
 * course lives isolated under its own `app/courses/<slug>/` folder.
 */
export const COURSES: CourseRegistryEntry[] = [DSA_COURSE];
```

- [ ] **Step 4: Create DSA's registry entry**

```ts
// web/src/app/courses/dsa/registry.ts
import type { CourseRegistryEntry } from "@/lib/courses/registry";
import { MODULES, allProblemSlugs } from "@/lib/course/manifest";

export const DSA_COURSE: CourseRegistryEntry = {
  slug: "dsa",
  title: "Data Structures & Algorithms",
  tagline:
    "Learn data structures and algorithms from first principles — interactive lessons, live sandboxes, and solve-first problems.",
  accent: "#1E293B",
  status: "available",
  href: "/courses/dsa",
  stats: [
    { label: "modules", value: String(MODULES.length) },
    { label: "problems", value: String(allProblemSlugs().length) },
  ],
};
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd web && npx vitest run tests/coursesRegistry.test.ts`
Expected: PASS

- [ ] **Step 6: Add the content-coverage guard**

This is the fix for a real gap the design doc flagged: `web/tests/
content.test.ts` validates DSA's specific manifest/sandbox-spec shape and
correctly stays DSA-only (a future course's content shape is that
course's own concern, same as Task 5's page-shell components) — but
nothing today would catch a course being *registered* with no content
behind it at all, which is exactly the "silently gets zero validation
coverage" failure mode the design doc calls out. Add a minimal, generic
guard that isn't tied to any one course's content shape:

```ts
// web/tests/courseContentCoverage.test.ts
import { describe, it, expect } from "vitest";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { COURSES } from "../src/lib/courses/registry";

const COURSES_ROOT = join(__dirname, "..", "..", "courses");

describe("every registered course has a non-empty content directory", () => {
  for (const course of COURSES) {
    it(`${course.slug} has content under courses/${course.slug}/`, () => {
      const dir = join(COURSES_ROOT, course.slug);
      expect(statSync(dir).isDirectory()).toBe(true);
      const entries = readdirSync(dir);
      expect(entries.length).toBeGreaterThan(0);
    });
  }
});
```

Run: `cd web && npx vitest run tests/courseContentCoverage.test.ts`
Expected: PASS (once Task 1's `git mv course courses/dsa` has run — if
executing tasks strictly in order, Task 1 runs first, so this is already
satisfied by the time this step runs).

- [ ] **Step 7: Commit**

```bash
git add web/src/lib/courses web/src/app/courses/dsa/registry.ts web/tests/coursesRegistry.test.ts web/tests/courseContentCoverage.test.ts
git commit -m "feat(courses): add CourseRegistryEntry contract and DSA's entry"
```

---

### Task 3: Move DSA's routes under `/courses/dsa/` and update href builders

**Files:**
- Move: `web/src/app/course/[module]/page.tsx` → `web/src/app/courses/dsa/[module]/page.tsx`
- Move: `web/src/app/course/[module]/[lesson]/page.tsx` → `web/src/app/courses/dsa/[module]/[lesson]/page.tsx`
- Move: `web/src/app/course/page.tsx` → `web/src/app/courses/dsa/page.tsx`
- Move: `web/src/app/problems/page.tsx` → `web/src/app/courses/dsa/problems/page.tsx`
- Move: `web/src/app/problems/[slug]/page.tsx` → `web/src/app/courses/dsa/problems/[slug]/page.tsx`
- Modify: `web/src/lib/course/nav.ts` (all href builders + `lessonIdFromPathname`)
- Modify: `web/src/app/courses/dsa/[module]/page.tsx` (Breadcrumbs root href)
- Test: `web/tests/nav.test.ts`

**Interfaces:**
- Consumes: `CourseRegistryEntry` (Task 2) — not used yet by nav.ts itself,
  but this task establishes the literal `/courses/dsa` prefix Task 6/7's
  resolvers match against.
- Produces: `lessonHref`, `moduleHref`, `problemHref`,
  `lessonIdFromPathname` all resolving to `/courses/dsa/...` — every other
  file that calls them (route pages, landing content, SearchDialog,
  Sidebar, Breadcrumbs) needs no further change, since they already go
  through these functions rather than hardcoding paths (verified: only
  `Header.tsx` and `app/course/[module]/page.tsx`'s Breadcrumbs call
  hardcode literals — both fixed in this task).

- [ ] **Step 1: Move the route folders**

```bash
mkdir -p web/src/app/courses/dsa
git mv "web/src/app/course/[module]" "web/src/app/courses/dsa/[module]"
git mv web/src/app/course/page.tsx web/src/app/courses/dsa/page.tsx
mkdir -p web/src/app/courses/dsa/problems
git mv "web/src/app/problems/[slug]" "web/src/app/courses/dsa/problems/[slug]"
git mv web/src/app/problems/page.tsx web/src/app/courses/dsa/problems/page.tsx
rmdir web/src/app/course web/src/app/problems 2>/dev/null || true
```

- [ ] **Step 2: Update the failing test expectations first (TDD for the shape change)**

`web/tests/nav.test.ts` — replace the whole file:

```ts
import { describe, it, expect } from "vitest";
import {
  problemHref,
  lessonIdFromPathname,
  lessonId,
  buildCourseNav,
  lessonHref,
} from "../src/lib/course/nav";

describe("problemHref", () => {
  it("builds /courses/dsa/problems/<slug>", () => {
    expect(problemHref("subsets")).toBe("/courses/dsa/problems/subsets");
  });
});

describe("lessonIdFromPathname", () => {
  it("resolves a course lesson pathname (unchanged behavior)", () => {
    const id = lessonIdFromPathname(
      "/courses/dsa/big-o/common-complexity-classes",
    );
    expect(id).toBe(lessonId("big-o", "common-complexity-classes"));
  });

  it("resolves a /courses/dsa/problems/[slug] pathname to the SAME id its course path would give", () => {
    const viaProblems = lessonIdFromPathname("/courses/dsa/problems/subsets");
    const viaCourse = lessonIdFromPathname(
      "/courses/dsa/recursion-backtracking/subsets",
    );
    expect(viaProblems).toBe(viaCourse);
    expect(viaProblems).toBe(lessonId("recursion-backtracking", "subsets"));
  });

  it("returns null for an unknown problem slug", () => {
    expect(
      lessonIdFromPathname("/courses/dsa/problems/not-a-real-problem"),
    ).toBeNull();
  });

  it("returns null for an unrelated pathname", () => {
    expect(lessonIdFromPathname("/about")).toBeNull();
  });
});

describe("buildCourseNav Lessons filter", () => {
  it("includes concepts and Practice, never individual problems", () => {
    const nav = buildCourseNav();
    const arrays = nav
      .flatMap((s) => s.modules)
      .find((m) => m.slug === "arrays");
    expect(arrays).toBeDefined();
    expect(arrays!.lessons.some((l) => l.type === "problem")).toBe(false);
    expect(
      arrays!.lessons.some((l) => l.id === "arrays/remove-duplicates-sorted"),
    ).toBe(false);
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
    expect(bigO!.lessons.some((l) => l.id === "big-o/practice")).toBe(false);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd web && npx vitest run tests/nav.test.ts`
Expected: FAIL — hrefs still resolve to `/course/...` / `/problems/...`

- [ ] **Step 4: Update the href builders in `nav.ts`**

`web/src/lib/course/nav.ts:37-47`:

```ts
export function lessonHref(moduleSlug: string, lessonSlug: string): string {
  return `/course/${moduleSlug}/${lessonSlug}`;
}

export function moduleHref(moduleSlug: string): string {
  return `/course/${moduleSlug}`;
}

export function problemHref(slug: string): string {
  return `/problems/${slug}`;
}
```

→

```ts
export function lessonHref(moduleSlug: string, lessonSlug: string): string {
  return `/courses/dsa/${moduleSlug}/${lessonSlug}`;
}

export function moduleHref(moduleSlug: string): string {
  return `/courses/dsa/${moduleSlug}`;
}

export function problemHref(slug: string): string {
  return `/courses/dsa/problems/${slug}`;
}
```

And `lessonIdFromPathname` (`web/src/lib/course/nav.ts:82-108`):

```ts
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

→

```ts
export function lessonIdFromPathname(pathname: string): string | null {
  const problemMatch = /^\/courses\/dsa\/problems\/([^/]+)\/?$/.exec(
    pathname,
  );
  if (problemMatch) {
    const [, slug] = problemMatch;
    const hit = findProblemBySlug(slug);
    if (!hit) return null;
    return lessonId(hit.module.slug, hit.lesson.slug);
  }

  const courseMatch = /^\/courses\/dsa\/([^/]+)\/([^/]+)\/?$/.exec(pathname);
  if (courseMatch) {
    const [, moduleSlug, lessonSlug] = courseMatch;
    const mod = MODULES.find((m) => m.slug === moduleSlug);
    if (!mod) return null;
    if (!mod.lessons.some((l) => l.slug === lessonSlug)) return null;
    return lessonId(moduleSlug, lessonSlug);
  }

  return null;
}
```

(The problem-match check now runs first — under the old two-segment
`/course/[module]/[lesson]` shape, `/problems/[slug]` was structurally
distinct and order didn't matter; under the new shape both are
`/courses/dsa/...` prefixes with a `problems` literal in the second
segment, so checking the more specific `problems` pattern first avoids it
ever being mis-parsed as a module named `problems`.)

- [ ] **Step 5: Fix the hardcoded Breadcrumbs root in the module page**

`web/src/app/courses/dsa/[module]/page.tsx` (was line 70, adjust to actual
line after the move):

```tsx
        <Breadcrumbs
          items={[{ label: "Lessons", href: "/course" }, { label: mod.title }]}
        />
```

→

```tsx
        <Breadcrumbs
          items={[
            { label: "Lessons", href: "/courses/dsa" },
            { label: mod.title },
          ]}
        />
```

- [ ] **Step 6: Run test to verify it passes**

Run: `cd web && npx vitest run tests/nav.test.ts`
Expected: PASS

- [ ] **Step 7: Run the full test suite to catch any other break**

Run: `cd web && npm test`
Expected: PASS, except `manifestHelpers.test.ts` if it asserts URL shapes
— it doesn't (confirmed: it only asserts slugs/counts), so this should be
green. If anything else fails on a `/course/` or `/problems/` string
assertion, fix that assertion's expected value to the `/courses/dsa/...`
equivalent before proceeding — do not silence or skip the test.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "refactor(routing): move DSA routes under /courses/dsa/"
```

---

### Task 4: Redirects for legacy URLs

**Files:**
- Modify: `web/next.config.ts`

**Interfaces:**
- Consumes: nothing new.
- Produces: `/course/...` and `/problems/...` requests 308-redirect to
  their `/courses/dsa/...` equivalents — verified manually (no automated
  redirect test in this codebase's existing suite; Next.js redirects are
  framework-level config, not unit-testable without a running server).

- [ ] **Step 1: Add the redirect rules**

`web/next.config.ts` — current:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Mermaid is client-only; keep it out of the RSC graph.
  serverExternalPackages: ["mermaid"],
};

export default nextConfig;
```

→

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Mermaid is client-only; keep it out of the RSC graph.
  serverExternalPackages: ["mermaid"],
  async redirects() {
    return [
      {
        source: "/course",
        destination: "/courses/dsa",
        permanent: true,
      },
      {
        source: "/course/:path*",
        destination: "/courses/dsa/:path*",
        permanent: true,
      },
      {
        source: "/problems",
        destination: "/courses/dsa/problems",
        permanent: true,
      },
      {
        source: "/problems/:path*",
        destination: "/courses/dsa/problems/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
```

- [ ] **Step 2: Verify manually in the dev server**

Run: `cd web && npm run dev`, then in another terminal:

```bash
curl -sI http://localhost:3000/course/hash-tables/two-sum | grep -i location
```

Expected: `location: /courses/dsa/hash-tables/two-sum`

```bash
curl -sI http://localhost:3000/problems/two-sum | grep -i location
```

Expected: `location: /courses/dsa/problems/two-sum`

Stop the dev server after verifying.

- [ ] **Step 3: Confirm the redirects also work in a production build**

Run: `cd web && npm run build`
Expected: build succeeds (this is the Global Constraints' "run `npm run
build` after Task 4" checkpoint — dev-mode redirects and build-time
redirect-manifest generation are handled by different code paths in
Next.js, so a successful build here is the real confirmation, not just
the dev-server curl checks above).

- [ ] **Step 4: Commit**

```bash
git add web/next.config.ts
git commit -m "feat(routing): redirect legacy /course and /problems URLs"
```

---

### Task 5: Move DSA's page-shell components

**Files:**
- Move: `web/src/components/course/ModuleGlyph.tsx` → `web/src/app/courses/dsa/_components/ModuleGlyph.tsx`
- Move: `web/src/components/course/ModuleMedia.tsx` → `web/src/app/courses/dsa/_components/ModuleMedia.tsx`
- Move: `web/src/components/course/ModulePracticeProgress.tsx` → `web/src/app/courses/dsa/_components/ModulePracticeProgress.tsx`
- Move: `web/src/components/course/ConceptMapNode.tsx` → `web/src/app/courses/dsa/_components/ConceptMapNode.tsx`
- Modify: `web/src/app/courses/dsa/[module]/page.tsx` (import paths)
- Modify: any other importer of these four components (found in Step 2)

**Note on scope:** `components/course/` also holds markdown-fence
renderers (`Quiz`, `Reveal`, `CodeTabs`, `ConceptMindMap`, `embeds`,
`Complexity`, `ChapterInfographic`, `VideoPlayer`, `AudioMini`,
`WatchLessonLink`) and the lesson-page composers (`LessonView`,
`ProblemLessonView`). These are candidates for the shared "lesson kit"
described in the design doc, but reclassifying them correctly requires
knowing what a second course actually needs to reuse — moving them now,
with no second consumer, is exactly the premature abstraction the design
doc's YAGNI note warns against. They stay at `components/course/` in this
plan, unmoved. Only the four components above are DSA-page-shell-specific
(they render `ModuleMeta`/`FamilyId`/practice-progress concepts tied
directly to the manifest) and move now because their only sensible home is
inside DSA's own route tree.

**Interfaces:**
- Consumes: nothing new.
- Produces: nothing new — pure relocation, all four components' own
  props/exports are unchanged.

- [ ] **Step 1: Find every importer of the four components**

Run:
```bash
cd web && grep -rn "components/course/ModuleGlyph\|components/course/ModuleMedia\|components/course/ModulePracticeProgress\|components/course/ConceptMapNode" src
```

Expected output includes at minimum
`src/app/course/[module]/page.tsx` (now at
`src/app/courses/dsa/[module]/page.tsx` after Task 3) importing
`ModuleGlyph`, `ModuleMedia`, `ModulePracticeProgress`, and
`ConceptMindMap.tsx` (staying put, per the note above) importing
`ConceptMapNode`. Record every file the grep returns — the next step
updates all of them, not just the ones named here.

- [ ] **Step 2: Move the files**

```bash
mkdir -p web/src/app/courses/dsa/_components
git mv web/src/components/course/ModuleGlyph.tsx web/src/app/courses/dsa/_components/ModuleGlyph.tsx
git mv web/src/components/course/ModuleMedia.tsx web/src/app/courses/dsa/_components/ModuleMedia.tsx
git mv web/src/components/course/ModulePracticeProgress.tsx web/src/app/courses/dsa/_components/ModulePracticeProgress.tsx
git mv web/src/components/course/ConceptMapNode.tsx web/src/app/courses/dsa/_components/ConceptMapNode.tsx
```

- [ ] **Step 3: Update every importer found in Step 1**

For `web/src/app/courses/dsa/[module]/page.tsx`, change:

```ts
import { ModuleGlyph } from "@/components/course/ModuleGlyph";
import { ModuleMedia } from "@/components/course/ModuleMedia";
import { ModulePracticeProgress } from "@/components/course/ModulePracticeProgress";
```

→

```ts
import { ModuleGlyph } from "@/app/courses/dsa/_components/ModuleGlyph";
import { ModuleMedia } from "@/app/courses/dsa/_components/ModuleMedia";
import { ModulePracticeProgress } from "@/app/courses/dsa/_components/ModulePracticeProgress";
```

For `ConceptMindMap.tsx`'s import of `ConceptMapNode`, apply the same
`@/components/course/ConceptMapNode` → `@/app/courses/dsa/_components/ConceptMapNode`
substitution. Apply the identical substitution pattern to every other file
Step 1's grep returned.

- [ ] **Step 4: Typecheck**

Run: `cd web && npx tsc --noEmit`
Expected: no errors referencing the four moved files

- [ ] **Step 5: Run the full test suite**

Run: `cd web && npm test`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor(courses): move DSA page-shell components into its route tree"
```

---

### Task 6: Namespace progress storage, with legacy-key migration

**Files:**
- Modify: `web/src/components/providers/ProgressProvider.tsx`
- Modify: `web/src/components/layout/AppShell.tsx`
- Test: `web/tests/progressStorage.test.ts`

**Interfaces:**
- Consumes: nothing new (this task doesn't yet need `CourseRegistryEntry`
  — `AppShell` derives the active course slug directly from the pathname).
- Produces: `ProgressProvider` accepts a new required `courseSlug: string`
  prop; storage keys become `course-progress:<courseSlug>` /
  `course-solved:<courseSlug>`. `useProgress()`'s returned shape is
  unchanged — every consumer of `useProgress()` needs no changes.

- [ ] **Step 1: Write the failing test**

```ts
// web/tests/progressStorage.test.ts
import { describe, it, expect, beforeEach, vi } from "vitest";

// jsdom's localStorage is provided by vitest's default environment for
// this project (see other tests in this file's directory reading/writing
// localStorage directly) — no extra setup needed.

describe("progress storage key namespacing", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("legacy flat key is migrated into the namespaced key on first read", async () => {
    localStorage.setItem(
      "dsa-course-progress",
      JSON.stringify(["arrays/contiguous-memory"]),
    );
    const { migrateLegacyProgress } = await import(
      "../src/components/providers/progressStorage"
    );
    migrateLegacyProgress("dsa");
    const migrated = JSON.parse(
      localStorage.getItem("course-progress:dsa") ?? "[]",
    );
    expect(migrated).toEqual(["arrays/contiguous-memory"]);
  });

  it("does not overwrite an existing namespaced key with the legacy one", async () => {
    localStorage.setItem(
      "course-progress:dsa",
      JSON.stringify(["big-o/big-o-notation"]),
    );
    localStorage.setItem(
      "dsa-course-progress",
      JSON.stringify(["arrays/contiguous-memory"]),
    );
    const { migrateLegacyProgress } = await import(
      "../src/components/providers/progressStorage"
    );
    migrateLegacyProgress("dsa");
    const kept = JSON.parse(
      localStorage.getItem("course-progress:dsa") ?? "[]",
    );
    expect(kept).toEqual(["big-o/big-o-notation"]);
  });

  it("does nothing when there is no legacy key", async () => {
    const { migrateLegacyProgress } = await import(
      "../src/components/providers/progressStorage"
    );
    migrateLegacyProgress("dsa");
    expect(localStorage.getItem("course-progress:dsa")).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd web && npx vitest run tests/progressStorage.test.ts`
Expected: FAIL — `Cannot find module '../src/components/providers/progressStorage'`

- [ ] **Step 3: Extract storage helpers into their own module**

Create `web/src/components/providers/progressStorage.ts`:

```ts
/**
 * Legacy flat keys, pre-multi-course. Migrated once per course into the
 * namespaced keys below, then left alone (not deleted — a second read
 * would just no-op against Step 3's "existing namespaced key wins" check,
 * and deleting adds a failure mode — an interrupted migration — for no
 * benefit).
 */
const LEGACY_VISITED_KEY = "dsa-course-progress";
const LEGACY_SOLVED_KEY = "dsa-course-solved";

export function visitedKey(courseSlug: string): string {
  return `course-progress:${courseSlug}`;
}

export function solvedKey(courseSlug: string): string {
  return `course-solved:${courseSlug}`;
}

export function readSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

export function writeSet(key: string, value: Set<string>) {
  try {
    localStorage.setItem(key, JSON.stringify([...value]));
  } catch {
    /* private mode or a full quota — losing the record is survivable */
  }
}

/**
 * One-time migration from the pre-multi-course flat keys into this
 * course's namespaced keys. Only DSA ever had the legacy keys (it was the
 * only course when they were written), so this is a no-op for any future
 * course — but it's written generically rather than DSA-hardcoded so it
 * stays correct if DSA's slug ever needs to change.
 */
export function migrateLegacyProgress(courseSlug: string) {
  try {
    if (localStorage.getItem(visitedKey(courseSlug)) === null) {
      const legacy = localStorage.getItem(LEGACY_VISITED_KEY);
      if (legacy !== null) localStorage.setItem(visitedKey(courseSlug), legacy);
    }
    if (localStorage.getItem(solvedKey(courseSlug)) === null) {
      const legacy = localStorage.getItem(LEGACY_SOLVED_KEY);
      if (legacy !== null) localStorage.setItem(solvedKey(courseSlug), legacy);
    }
  } catch {
    /* private mode or a full quota — losing the migration is survivable */
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd web && npx vitest run tests/progressStorage.test.ts`
Expected: PASS

- [ ] **Step 5: Wire the helpers into `ProgressProvider`**

`web/src/components/providers/ProgressProvider.tsx` — full replacement:

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
import { countLessonsProgress } from "@/lib/course/nav";
import {
  migrateLegacyProgress,
  readSet,
  solvedKey,
  visitedKey,
  writeSet,
} from "./progressStorage";

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

export function ProgressProvider({
  children,
  courseSlug,
  totalCount,
  totalProblemCount,
  lessonProgressIds,
}: {
  children: React.ReactNode;
  courseSlug: string;
  totalCount: number;
  totalProblemCount: number;
  lessonProgressIds: readonly string[];
}) {
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [solved, setSolved] = useState<Set<string>>(new Set());
  const vKey = visitedKey(courseSlug);
  const sKey = solvedKey(courseSlug);

  // Reading localStorage during render would desync server and client
  // HTML, so both restores happen in an effect, once, on mount.
  useEffect(() => {
    migrateLegacyProgress(courseSlug);
    setVisited(readSet(vKey));
    setSolved(readSet(sKey));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseSlug]);

  const markVisited = useCallback(
    (id: string) => {
      setVisited((prev) => {
        if (prev.has(id)) return prev;
        // Merge against what's actually on disk, not just React's prior
        // state. VisitTracker calls this from ITS OWN mount effect, and
        // React runs a child's effects before its parent's — so this can
        // fire before the restore effect above has run, meaning `prev` is
        // still the pre-restore empty set. Writing `prev + id` in that case
        // would silently overwrite (not merge with) everything already
        // persisted from earlier sessions. Reading fresh here means the
        // write is always additive, regardless of which effect wins the race.
        const next = new Set([...readSet(vKey), ...prev, id]);
        writeSet(vKey, next);
        return next;
      });
    },
    [vKey],
  );

  const markSolved = useCallback(
    (id: string) => {
      setSolved((prev) => {
        if (prev.has(id)) return prev;
        const next = new Set([...readSet(sKey), ...prev, id]);
        writeSet(sKey, next);
        return next;
      });
    },
    [sKey],
  );

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

- [ ] **Step 6: Pass `courseSlug` from `AppShell`**

`web/src/components/layout/AppShell.tsx` — add a resolver next to
`activeFamilyFor` (kept separate from Task 7's `activeThemeFor` rename so
this task's diff stays reviewable on its own):

```ts
/**
 * Every route currently belongs to DSA (the only registered course) or to
 * no course at all (the catalog root). Progress still needs a bucket even
 * on non-course routes today, so this defaults to "dsa" rather than
 * returning null — the one course that exists is the reasonable default
 * until a second course makes that default ambiguous.
 */
function activeCourseSlugFor(pathname: string): string {
  const match = /^\/courses\/([^/]+)/.exec(pathname);
  return match ? match[1] : "dsa";
}
```

And update the `<ProgressProvider>` call site:

```tsx
    <ProgressProvider
      totalCount={totalCount}
      totalProblemCount={totalProblemCount}
      lessonProgressIds={lessonProgressIds}
    >
```

→

```tsx
    <ProgressProvider
      courseSlug={activeCourseSlugFor(pathname)}
      totalCount={totalCount}
      totalProblemCount={totalProblemCount}
      lessonProgressIds={lessonProgressIds}
    >
```

- [ ] **Step 7: Run the full test suite**

Run: `cd web && npm test`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(progress): namespace localStorage keys by course, migrate legacy data"
```

---

### Task 7: Generalize the theming resolver

**Files:**
- Modify: `web/src/components/layout/AppShell.tsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: `activeThemeFor(pathname): FamilyId | null` — same return
  shape and same call site as the old `activeFamilyFor`, renamed and
  re-scoped to the new `/courses/dsa/...` prefix. No other file imports
  `activeFamilyFor` (it's a private, unexported function in `AppShell.tsx`
  — verified by its absence from any `export` line), so this is a
  same-file rename with no cross-file follow-up.

- [ ] **Step 1: Rename and re-scope the resolver**

`web/src/components/layout/AppShell.tsx:39-54` — current:

```ts
/**
 * The current topic's family, derived from the route. Lifted to the shell so
 * the whole chrome (header, sidebar, mobile sheet, search) tints with the
 * lesson's family instead of staying steel. List/landing routes have no
 * single topic → null → monochrome.
 */
function activeFamilyFor(pathname: string): FamilyId | null {
  const course = /^\/course\/([^/]+)/.exec(pathname);
  if (course) return moduleFamily(course[1]);
  const problem = /^\/problems\/([^/]+)/.exec(pathname);
  if (problem) {
    const hit = findProblemBySlug(problem[1]);
    if (hit) return moduleFamily(hit.module);
  }
  return null;
}
```

→

```ts
/**
 * The current topic's theme, derived from the route. Lifted to the shell
 * so the whole chrome (header, sidebar, mobile sheet, search) tints with
 * the lesson's theme instead of staying steel. List/landing routes have no
 * single topic → null → monochrome.
 *
 * DSA resolves its theme via its own 7-family lookup (moduleFamily). A
 * future course under /courses/<slug>/ can dispatch to whatever theming
 * logic it wants here — one accent per module, a single course-wide
 * accent, or none — this function is the one place that needs a new
 * branch per course, not a shared family system every course must adopt.
 */
function activeThemeFor(pathname: string): FamilyId | null {
  const dsaModule = /^\/courses\/dsa\/(?!problems(?:\/|$))([^/]+)/.exec(
    pathname,
  );
  if (dsaModule) return moduleFamily(dsaModule[1]);
  const dsaProblem = /^\/courses\/dsa\/problems\/([^/]+)/.exec(pathname);
  if (dsaProblem) {
    const hit = findProblemBySlug(dsaProblem[1]);
    if (hit) return moduleFamily(hit.module);
  }
  return null;
}
```

- [ ] **Step 2: Update the call site**

`web/src/components/layout/AppShell.tsx:68`:

```ts
  const family = activeFamilyFor(pathname);
```

→

```ts
  const family = activeThemeFor(pathname);
```

- [ ] **Step 3: Typecheck and run the full suite**

Run: `cd web && npx tsc --noEmit && npm test`
Expected: no errors, all tests PASS

- [ ] **Step 4: Manual verification in the browser**

Run: `cd web && npm run dev`, open `http://localhost:3000/courses/dsa/hash-tables/hashing-fundamentals` — the header/sidebar should tint with the Hash Tables module's family accent (linear-traversal), same as it did at the old `/course/hash-tables/...` URL before this migration. Open `http://localhost:3000/courses/dsa/problems/two-sum` and confirm the same tint applies there. Stop the dev server.

- [ ] **Step 5: Commit**

```bash
git add web/src/components/layout/AppShell.tsx
git commit -m "refactor(theming): rescope AppShell's theme resolver to /courses/dsa/"
```

---

### Task 8: Fix remaining hardcoded path literals (Header active-tab state)

**Files:**
- Modify: `web/src/components/layout/Header.tsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: nothing new — `lessonsActive` / `practiceActive` booleans keep
  their existing meaning, just matched against the new URL shape.

Note: this is the task where "Coach gating per course" from the design doc
turns out to need no code at all — `CoachOverlay` is mounted inside
`IdeWithCoach`, which is only rendered by `ProblemWorkspace`
(`web/src/components/problems/ProblemWorkspace.tsx`), which is only used
by DSA's `problems/[slug]/page.tsx`. Since that page already moved under
`app/courses/dsa/` in Task 3, the Coach is already scoped to DSA with zero
additional gating logic — confirmed by `grep -rn "CoachOverlay\|CoachLauncher" web/src` returning only `CoachPanel.tsx`, `CoachOverlay.tsx`, and `IdeWithCoach.tsx` (Coach's own component tree), never `AppShell.tsx` or any other shared-chrome file.

- [ ] **Step 1: Update the active-tab path checks**

`web/src/components/layout/Header.tsx:31-34` — current:

```ts
  const lessonsActive =
    pathname === "/course" || pathname.startsWith("/course/");
  const practiceActive =
    pathname === "/problems" || pathname.startsWith("/problems/");
```

→

```ts
  const lessonsActive =
    pathname === "/courses/dsa" ||
    (pathname.startsWith("/courses/dsa/") &&
      !pathname.startsWith("/courses/dsa/problems"));
  const practiceActive = pathname.startsWith("/courses/dsa/problems");
```

- [ ] **Step 2: Run the full test suite**

Run: `cd web && npm test`
Expected: PASS

- [ ] **Step 3: Manual verification**

Run: `cd web && npm run dev`, visit
`http://localhost:3000/courses/dsa/hash-tables/hashing-fundamentals` and
confirm the header's "Lessons" tab reads as active; visit
`http://localhost:3000/courses/dsa/problems/two-sum` and confirm
"Practice" reads as active instead. Stop the dev server.

- [ ] **Step 4: Commit**

```bash
git add web/src/components/layout/Header.tsx
git commit -m "fix(header): match active-tab state to /courses/dsa/ URLs"
```

---

### Task 9: Multi-course search index

**Files:**
- Create: `web/src/lib/search/types.ts`
- Modify: `web/scripts/build-search-index.mjs`
- Modify: `web/src/components/layout/SearchDialog.tsx`

**Interfaces:**
- Consumes: `COURSES` from `@/lib/courses/registry` (Task 2) is **not**
  imported by the build script — the script runs in plain Node via
  `node scripts/build-search-index.mjs` (see `package.json`'s `predev` /
  `prebuild`), outside the Next.js/TypeScript module graph, so it can't
  `import` a `.ts` path alias. It stays a filesystem walk, generalized
  from "one course directory" to "iterate every subdirectory of
  `courses/`" — which is equivalent in behavior to reading the registry
  (every registered course has a content folder there) without needing a
  TS-to-JS bridge for one script.
- Produces: `public/search-index.json` entries gain a `c: string`
  (courseSlug) field; `SearchDocument` type formalizes the shape for
  `SearchDialog` to consume.

- [ ] **Step 1: Define the `SearchDocument` type**

```ts
// web/src/lib/search/types.ts

/**
 * One search-index entry. Field names stay short (matches the existing
 * `build-search-index.mjs` output) since this file is fetched by every
 * client that opens search — see that script's own comment on why the
 * index carries only titles/headings, not full prose.
 */
export interface SearchDocument {
  /** Course slug, e.g. "dsa". */
  c: string;
  /** Module slug within the course. */
  m: string;
  /** Lesson slug. */
  s: string;
  /** Lesson title. */
  t: string;
  /** Lesson type: "concept" | "problem" | "practice" (course-defined). */
  y: string;
  /** ## headings, for heading-level matches. */
  h: string[];
}
```

- [ ] **Step 2: Generalize the build script to iterate `courses/`**

`web/scripts/build-search-index.mjs` — full replacement:

```js
/**
 * Builds the lesson search index across every course under `courses/`.
 *
 * Written to public/ and fetched on demand rather than bundled: the index
 * is useless until someone actually opens search, so making every lesson
 * across every course pay for it on every page load would be the wrong
 * trade.
 *
 * The index deliberately carries only titles and headings, not full prose.
 * Headings are where the answerable questions live ("where did he explain
 * the write-pointer invariant?"), and indexing the body would multiply the
 * file size for matches too diffuse to rank well without a real search
 * engine.
 *
 * Module titles are NOT included — the client already imports the DSA
 * manifest for its sidebar, so it joins them by slug instead of
 * duplicating them here. A future course's index entries carry their own
 * `m` (module-equivalent) slug; how a course's UI resolves that slug to a
 * display title is that course's own concern.
 */
import { readdirSync, readFileSync, writeFileSync, statSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const COURSES_ROOT = join(here, "..", "..", "courses");
const OUT = join(here, "..", "public", "search-index.json");

const entries = [];

for (const courseSlug of readdirSync(COURSES_ROOT)) {
  const courseDir = join(COURSES_ROOT, courseSlug);
  if (!statSync(courseDir).isDirectory()) continue;

  for (const moduleSlug of readdirSync(courseDir)) {
    const moduleDir = join(courseDir, moduleSlug);
    if (!statSync(moduleDir).isDirectory()) continue;

    for (const file of readdirSync(moduleDir)) {
      if (!file.endsWith(".md")) continue;
      const body = readFileSync(join(moduleDir, file), "utf8");

      const fm = /^---\n([\s\S]*?)\n---/.exec(body);
      const title = fm && /(?:^|\n)title:\s*(.+)/.exec(fm[1])?.[1]?.trim();
      const type = fm && /(?:^|\n)type:\s*(.+)/.exec(fm[1])?.[1]?.trim();
      if (!title) continue;

      // `## ` only. h3s are mostly sub-steps and would crowd the results.
      const headings = [...body.matchAll(/^##\s+(.+)$/gm)]
        .map((m) => m[1].trim())
        .filter((h) => h.length < 70);

      entries.push({
        c: courseSlug,
        m: moduleSlug,
        s: file.replace(/\.md$/, ""),
        t: title,
        y: type ?? "concept",
        h: headings,
      });
    }
  }
}

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(entries));

const kb = (Buffer.byteLength(JSON.stringify(entries)) / 1024).toFixed(1);
console.log(`[search-index] ${entries.length} lessons across ${readdirSync(COURSES_ROOT).length} course(s), ${kb} KB → public/search-index.json`);
```

- [ ] **Step 3: Regenerate the index and inspect it**

Run: `cd web && node scripts/build-search-index.mjs`
Expected output: `[search-index] 191 lessons across 1 course(s), NN.N KB → public/search-index.json` (lesson count matches whatever `content.test.ts` currently asserts as the total — do not hardcode 191 as a check, just confirm the script runs and the count is non-zero and matches the pre-migration count reported by the same script before this task's changes).

Run: `head -c 300 web/public/search-index.json` — confirm entries now start with `{"c":"dsa","m":...`.

- [ ] **Step 4: Update `SearchDialog` to consume the new field and route via `problemHref`/course-aware paths**

`web/src/components/layout/SearchDialog.tsx:10-16` — current:

```ts
interface Entry {
  m: string;
  s: string;
  t: string;
  y: string;
  h: string[];
}
```

→

```ts
import type { SearchDocument } from "@/lib/search/types";

type Entry = SearchDocument;
```

(Remove the now-redundant inline `interface Entry` block entirely and add
the import at the top of the file alongside the existing imports.)

Then update the `go` callback (`web/src/components/layout/SearchDialog.tsx:103-113`):

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

→

```ts
  const go = useCallback(
    (hit: Hit) => {
      onClose();
      if (hit.entry.y === "problem") {
        router.push(problemHref(hit.entry.s));
      } else {
        router.push(`/courses/${hit.entry.c}/${hit.entry.m}/${hit.entry.s}`);
      }
    },
    [onClose, router],
  );
```

(`problemHref` already resolves to `/courses/dsa/problems/...` as of Task
3 — it's course-hardcoded today because DSA is the only course with a
"problems" concept; a future course's problem-shaped entries, if any,
would need their own href builder, which is out of scope here since no
such course exists yet.)

- [ ] **Step 5: Typecheck and run the full suite**

Run: `cd web && npx tsc --noEmit && npm test`
Expected: no errors, all tests PASS

- [ ] **Step 6: Manual verification**

Run: `cd web && npm run dev`, press Cmd+K (or Ctrl+K), search "two sum",
confirm the result navigates to `/courses/dsa/hash-tables/two-sum` — wait,
verify it navigates to the correct problem page via `problemHref`
(`/courses/dsa/problems/two-sum`). Search a concept lesson title (e.g.
"hashing fundamentals") and confirm it navigates to
`/courses/dsa/hash-tables/hashing-fundamentals`. Stop the dev server.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(search): index across courses/, add SearchDocument type"
```

---

### Task 10: Split `CodeEditor` into a shared kit primitive

**Files:**
- Move: `web/src/components/sandbox/CodeEditor.tsx` → `web/src/components/kit/CodeEditor.tsx`
- Modify: `web/src/components/sandbox/Sandbox.tsx` (import path)
- Modify: any other importer of `components/sandbox/CodeEditor` (found in
  Step 1)

**Interfaces:**
- Consumes: nothing new.
- Produces: `CodeEditor` importable from `@/components/kit/CodeEditor` —
  same props/exports as before, pure relocation. This is the first file in
  the "lesson kit" the design doc describes: a genuinely course-agnostic
  primitive (CodeMirror setup + theme + tab chrome, no algorithm-judge
  logic in it) available to any future course that wants code editing
  without adopting DSA's test-case-runner semantics.

- [ ] **Step 1: Find every importer**

Run:
```bash
cd web && grep -rn "components/sandbox/CodeEditor" src
```

Record every match — Step 3 updates each one.

- [ ] **Step 2: Move the file**

```bash
mkdir -p web/src/components/kit
git mv web/src/components/sandbox/CodeEditor.tsx web/src/components/kit/CodeEditor.tsx
```

- [ ] **Step 3: Update every importer found in Step 1**

For each file, change:

```ts
import { CodeEditor } from "@/components/sandbox/CodeEditor";
```

→

```ts
import { CodeEditor } from "@/components/kit/CodeEditor";
```

(Adjust the imported symbol name to whatever Step 1's grep shows is
actually exported/imported — `CodeEditor` is the component's own file
name and the conventional default export name in this codebase's other
files, but confirm against the grep output before editing.)

- [ ] **Step 4: Typecheck and run the full suite**

Run: `cd web && npx tsc --noEmit && npm test`
Expected: no errors, all tests PASS

- [ ] **Step 5: Manual verification**

Run: `cd web && npm run dev`, open
`http://localhost:3000/courses/dsa/problems/two-sum`, confirm the code
editor still renders, accepts typing, and switches Python/JavaScript tabs
correctly. Stop the dev server.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor(kit): extract CodeEditor as a course-agnostic primitive"
```

---

### Task 11: Root landing page becomes the course catalog

**Files:**
- Modify: `web/src/app/page.tsx` (becomes the catalog)
- Modify: `web/src/lib/landing/content.ts` (hrefs)
- Test: none new — this is a presentational change; existing content
  validation tests don't assert landing-page markup.

**Interfaces:**
- Consumes: `COURSES` from `@/lib/courses/registry` (Task 2).
- Produces: nothing new consumed elsewhere.

DSA's existing rich landing page (hero, curriculum preview, FAQ, waitlist
form, etc. — currently `web/src/app/page.tsx`) already moved its route
slot: after Task 3, `web/src/app/courses/dsa/page.tsx` is the **module
list** page (was `app/course/page.tsx`), not the marketing landing. The
marketing landing content itself was never moved by Task 3 — it's still
sitting in `web/src/app/page.tsx`, which now needs to become the catalog.
Given the scope of this plan (platform boundary, not a redesign of DSA's
marketing page), the minimal correct move is: keep DSA's full marketing
page content, but relocate it to live under DSA's own path, and replace
root `page.tsx` with a small catalog that — with only one course
registered — links straight into it.

- [ ] **Step 1: Move DSA's marketing landing to its own path**

```bash
git mv web/src/app/page.tsx web/src/app/courses/dsa/marketing/page.tsx
```

(A separate path from `web/src/app/courses/dsa/page.tsx`, which Task 3
already populated with the module-list page — the two must not collide.
`marketing` is an explicit, honest name for what this page is, not a
generic `page.tsx` clash.)

- [ ] **Step 2: Update DSA's own internal root reference, if any**

Run: `grep -n '"/"' web/src/app/courses/dsa/marketing/page.tsx`

If any link inside that file points at `"/"` expecting to mean "DSA
home," change it to `"/courses/dsa/marketing"`. (Grounded uncertainty: the
file's exact internal links weren't enumerated during planning since its
900+ lines are out of this migration's functional scope — this step is
the checkpoint that catches any such reference before it silently breaks.)

- [ ] **Step 3: Write the catalog page**

```tsx
// web/src/app/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import { COURSES } from "@/lib/courses/registry";

export const metadata: Metadata = {
  title: "Courses",
  description: "Pick a course to start learning.",
};

export default function CatalogPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 lg:px-8">
      <h1 className="text-2xl font-semibold text-foreground">Courses</h1>
      <p className="mt-2 text-muted">
        Pick a course to start learning.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {COURSES.map((course) => (
          <Link
            key={course.slug}
            href={
              course.status === "available"
                ? course.slug === "dsa"
                  ? "/courses/dsa/marketing"
                  : course.href
                : "#"
            }
            aria-disabled={course.status !== "available"}
            className="block rounded-[length:var(--radius-lg)] border border-border bg-elevated p-5 shadow-elevation transition-colors hover:border-accent"
            style={{ borderTopColor: course.accent, borderTopWidth: 3 }}
          >
            <h2 className="text-lg font-semibold text-foreground">
              {course.title}
            </h2>
            <p className="mt-1 text-sm text-muted">{course.tagline}</p>
            {course.stats ? (
              <div className="mt-3 flex gap-4 text-xs text-muted">
                {course.stats.map((s) => (
                  <span key={s.label}>
                    {s.value} {s.label}
                  </span>
                ))}
              </div>
            ) : null}
            {course.status === "coming-soon" ? (
              <span className="mt-3 inline-block rounded-[length:var(--radius-xs)] border border-border px-1.5 py-0.5 text-xs text-muted">
                coming soon
              </span>
            ) : null}
          </Link>
        ))}
      </div>
    </div>
  );
}
```

(The `course.slug === "dsa"` special-case routing to `/courses/dsa/marketing`
instead of `course.href` is a deliberate, temporary seam: DSA's `href` in
its registry entry is `/courses/dsa`, which per Task 3 is now the
module-list page, not the marketing page. A cleaner long-term fix —
making the catalog card go straight to the module list, and moving DSA's
rich marketing content to be that module list's content — is a real
option but reshapes DSA's own page further than this migration's stated
scope; noted here rather than silently decided.)

- [ ] **Step 4: Update `lib/landing/content.ts` hrefs**

`web/src/lib/landing/content.ts:48-55, 60-61` — current:

```ts
  { label: "Arrays", href: "/course/arrays" },
  { label: "Hash Tables", href: "/course/hash-tables" },
  { label: "Trees", href: "/course/binary-trees" },
  { label: "Graphs", href: "/course/graphs" },
  { label: "DP", href: "/course/dynamic-programming" },
  { label: "Two Pointers", href: "/course/two-pointers" },
  { label: "Binary Search", href: "/course/binary-search" },
  { label: "Recursion", href: "/course/recursion-backtracking" },
```

→

```ts
  { label: "Arrays", href: "/courses/dsa/arrays" },
  { label: "Hash Tables", href: "/courses/dsa/hash-tables" },
  { label: "Trees", href: "/courses/dsa/binary-trees" },
  { label: "Graphs", href: "/courses/dsa/graphs" },
  { label: "DP", href: "/courses/dsa/dynamic-programming" },
  { label: "Two Pointers", href: "/courses/dsa/two-pointers" },
  { label: "Binary Search", href: "/courses/dsa/binary-search" },
  { label: "Recursion", href: "/courses/dsa/recursion-backtracking" },
```

and:

```ts
export const BIG_O = "/course/big-o";
export const FIRST_PROBLEM = "/problems/two-sum";
```

→

```ts
export const BIG_O = "/courses/dsa/big-o";
export const FIRST_PROBLEM = "/courses/dsa/problems/two-sum";
```

(`lessonHref("getting-started", ...)` calls elsewhere in this file need
no change — they already go through the `nav.ts` helper Task 3 updated.)

- [ ] **Step 5: Update `isLandingPath` in `AppShell.tsx`**

`web/src/components/layout/AppShell.tsx:34-37` — current:

```ts
/** Course overview is a full-width landing — no course nav chrome. */
function isLandingPath(pathname: string): boolean {
  return pathname === "/";
}
```

→

```ts
/** Both the catalog root and DSA's own marketing page are full-width
 *  landings — no course nav chrome. */
function isLandingPath(pathname: string): boolean {
  return pathname === "/" || pathname === "/courses/dsa/marketing";
}
```

- [ ] **Step 6: Typecheck, run the full suite, and build**

Run: `cd web && npx tsc --noEmit && npm test && npm run build`
Expected: no errors, all tests PASS, build succeeds

- [ ] **Step 7: Manual verification**

Run: `cd web && npm run dev`. Visit `http://localhost:3000/` — confirm the
catalog renders one card ("Data Structures & Algorithms") and clicking it
lands on the full DSA marketing page at `/courses/dsa/marketing`. Visit
`http://localhost:3000/courses/dsa` directly — confirm it shows the module
list (Task 3's moved `[module]`-listing page), not the marketing page.
Stop the dev server.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(catalog): make the root page a course catalog"
```

---

### Task 12: Course-agnostic site metadata

**Files:**
- Modify: `web/src/app/layout.tsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: nothing new consumed elsewhere — pure copy change.

- [ ] **Step 1: Update the title template and description**

`web/src/app/layout.tsx:31-37` — current:

```ts
export const metadata: Metadata = {
  title: {
    default: "codeMacha — DSA Course: Data Structures & Algorithms",
    template: "%s · codeMacha",
  },
  description:
    "Learn data structures and algorithms from first principles. Interactive lessons, live sandboxes in Python and JavaScript, visualizations, and solve-first problems — 212 lessons.",
};
```

→

```ts
export const metadata: Metadata = {
  title: {
    default: "codeMacha",
    template: "%s · codeMacha",
  },
  description:
    "Interactive courses with live sandboxes, visualizations, and solve-first problems. Start with Data Structures & Algorithms.",
};
```

- [ ] **Step 2: Run the full suite and build**

Run: `cd web && npm test && npm run build`
Expected: PASS, build succeeds

- [ ] **Step 3: Commit**

```bash
git add web/src/app/layout.tsx
git commit -m "feat(metadata): make site title/description course-agnostic"
```

---

### Task 13: Fix the coach-corpus build script's content root

**Files:**
- Modify: `web/scripts/build-coach-corpus.mjs`

**Interfaces:**
- Consumes: nothing new.
- Produces: nothing new — same corpus output shape, new source path.

- [ ] **Step 1: Find and update the content-root reference**

Run: `grep -n '"course"' web/scripts/build-coach-corpus.mjs`

Expected: a `join(here, "..", "..", "course")`-shaped line, analogous to
`build-search-index.mjs`'s pre-Task-9 constant. Change it to
`join(here, "..", "..", "courses", "dsa")` — the coach corpus stays
DSA-only per the design doc, so unlike Task 9's search index it does not
need to generalize to iterate all of `courses/`, only to follow DSA's
content to its new location.

- [ ] **Step 2: Regenerate and verify**

Run: `cd web && node scripts/build-coach-corpus.mjs`
Expected: succeeds, produces the same corpus size/shape as before this
task (compare `wc -c web/src/lib/coach/corpus.generated.json` before and
after — should be unchanged, since the underlying lesson content didn't
change, only its path).

- [ ] **Step 3: Run the coach test suite**

Run: `cd web && npx vitest run tests/coach-corpus.test.ts tests/coach-diagnose.test.ts tests/coach-extract.test.ts tests/coach-filter.test.ts tests/coach-prompt.test.ts tests/coach-quota.test.ts tests/coach-thesis.test.ts tests/coach-ui.test.ts tests/coach-api.test.ts`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "fix(coach): point corpus builder at courses/dsa/"
```

---

### Task 14: Full verification pass

**Files:** none (verification only)

- [ ] **Step 1: Full clean install + build**

```bash
cd web && rm -rf .next && npm run build
```

Expected: build succeeds with no errors. This runs `prebuild`
(`copy-pyodide.mjs`, `build-search-index.mjs`, `build-coach-corpus.mjs`)
first — confirms both generation scripts work end-to-end from a clean
state, not just via the manual runs in Tasks 9/13.

- [ ] **Step 2: Full test suite**

```bash
cd web && npm test
```

Expected: every test file PASSES, including the large
`tests/reference/**` reference-solution tree (exercised via
`content.test.ts`, whose `COURSE_DIR` Task 1 already repointed).

- [ ] **Step 3: Typecheck**

```bash
cd web && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Lint**

```bash
cd web && npm run lint
```

Expected: no errors.

- [ ] **Step 5: End-to-end manual smoke test in the browser**

Run: `cd web && npm run dev`. Walk this exact path and confirm each step:

1. `http://localhost:3000/` → catalog, one course card
2. Click the DSA card → `/courses/dsa/marketing` → full marketing page
   renders (hero, curriculum, FAQ, waitlist form)
3. Navigate to a module via the sidebar or a curriculum link → URL is
   `/courses/dsa/<module>` → module page renders with hero, glyph, concept
   map, cheatsheet
4. Click into a concept lesson → URL is
   `/courses/dsa/<module>/<lesson>` → lesson content, TOC, progress mark
   as visited (check the header progress chip increments)
5. Click into a problem → URL is `/courses/dsa/problems/<slug>` → IDE
   workspace renders, code editor works, Coach launcher is present and
   opens
6. Press Cmd/Ctrl+K, search a lesson title → result navigates correctly
7. Old bookmarked URL: visit `http://localhost:3000/course/hash-tables` →
   redirects to `/courses/dsa/hash-tables`
8. Old bookmarked URL: visit `http://localhost:3000/problems/two-sum` →
   redirects to `/courses/dsa/problems/two-sum`
9. Toggle dark mode — theming/family accents still resolve correctly on a
   module page

Stop the dev server once every step is confirmed.

- [ ] **Step 6: Final commit (if any verification step required a fix)**

If Step 5 surfaced any issue, fix it, re-run the affected verification
step, then:

```bash
git add -A
git commit -m "fix: address issues found in end-to-end verification"
```

If no issues were found, this task requires no commit — Tasks 1-13
already captured all changes.
