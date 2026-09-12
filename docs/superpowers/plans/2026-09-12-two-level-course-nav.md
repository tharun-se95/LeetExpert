# Two-Level Course Nav Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the course nav from one inline expand/collapse tree into two levels: a module list, and a single module's lessons reached by following a module row.

**Architecture:** Level resolution moves into a pure module (`lib/course/navLevel.ts`), the markup becomes a props-only `CourseNavPanel`, and `CourseNavTree` keeps the hooks, the back override, the cross-slide animation and scroll/focus handling. `Sidebar` and `MobileLessonsSheet` call sites are untouched.

**Tech Stack:** Next.js 16 App Router, React 19 client components, `motion@^12.42.2` (`motion/react`), Vitest 4 with `renderToStaticMarkup` (verified: `next/link` renders without App Router context).

**Spec:** `docs/superpowers/specs/2026-09-12-two-level-course-nav-design.md`

## Global Constraints

- Level follows the route; back is an override dropped on the next pathname change. Back never navigates.
- A module with no lessons never resolves to level 2.
- Stage headings stay on level 1.
- Motion: `motion/react`, `duration: 0.22`, `ease: [0.2, 0, 0, 1]`, `AnimatePresence mode="wait"`; under `useReducedMotion()` render with no `motion` wrapper (the `PageEnter.tsx` pattern).
- Back is a `<button>`; module, lesson and extra rows stay `Link`s. `aria-current="page"` on the active row. Module header is an `<h2>`. `<nav aria-label="Course">` stays.
- `compact` keeps meaning dense desktop rows (`min-h-8 py-1.5`) vs ≥44px mobile taps (`min-h-11 py-2.5`).
- `CourseNavTree`'s props (`compact`, `className`) do not change.
- TypeScript strict, no `any`, no unchecked casts. Colour only through tokens; no raw `box-shadow`; radius only as `rounded-[length:var(--radius-*)]` (guarded by `design-tokens.test.ts`).
- Every new test is seen failing first (`CLAUDE.md` §2).

---

## Execution setup

`main` is clean apart from unrelated untracked folders (`marketing/`, `design-drafts/`, `.opencode-shots/`, the social-artist agent). Work on a branch, not on `main`.

- [ ] **Create the branch and commit the spec**

```bash
cd /Users/tharunk/leetExpert
git checkout -b feat/two-level-nav
git add docs/superpowers/specs/2026-09-12-two-level-course-nav-design.md docs/superpowers/plans/2026-09-12-two-level-course-nav.md
git commit -m "$(printf 'docs(nav): two-level course nav spec and plan\n\nCo-Authored-By: Claude Opus 5 <noreply@anthropic.com>')"
```

All commands below run from `/Users/tharunk/leetExpert/web`. `T` means `NODE_OPTIONS=--no-experimental-webstorage npx vitest run`.

---

### Task 1: Level resolution (pure)

**Files:**
- Create: `web/src/lib/course/navLevel.ts`
- Create: `web/tests/navLevel.test.ts`
- Modify: `web/src/components/layout/CourseNavTree.tsx` (delete the local `activeModuleSlug`, import it instead)

**Interfaces:**
- Produces: `type NavView = { level: "modules" } | { level: "module"; navModule: CourseNavModule }`, `activeModuleSlug(stages: CourseNavStage[], pathname: string): string | null`, `resolveNavView(args: { stages: CourseNavStage[]; pathname: string; backToModules?: boolean }): NavView`. Tasks 2 and 3 consume both.

- [ ] **Step 1: Write the failing test** — `web/tests/navLevel.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { buildCourseNav } from "@/lib/course/nav";
import { activeModuleSlug, resolveNavView } from "@/lib/course/navLevel";

const stages = buildCourseNav();
const modules = stages.flatMap((s) => s.modules);
const withLessons = modules.find((m) => m.lessons.length > 0)!;
const withExtras = modules.find((m) => (m.extras ?? []).length > 0)!;

describe("activeModuleSlug", () => {
  it("matches a module page, a lesson under it, and an extra under it", () => {
    expect(activeModuleSlug(stages, withLessons.href)).toBe(withLessons.slug);
    expect(activeModuleSlug(stages, withLessons.lessons[0]!.href)).toBe(withLessons.slug);
    expect(activeModuleSlug(stages, withExtras.extras![0]!.href)).toBe(withExtras.slug);
  });

  it("returns null off the course", () => {
    expect(activeModuleSlug(stages, "/courses/dsa")).toBeNull();
    expect(activeModuleSlug(stages, "/")).toBeNull();
  });
});

describe("resolveNavView", () => {
  it("opens the module the route is inside", () => {
    const view = resolveNavView({ stages, pathname: withLessons.lessons[0]!.href });
    expect(view).toEqual({ level: "module", navModule: withLessons });
  });

  it("shows the module list on the hub", () => {
    expect(resolveNavView({ stages, pathname: "/courses/dsa" })).toEqual({ level: "modules" });
  });

  it("shows the module list while the back override is set", () => {
    expect(
      resolveNavView({ stages, pathname: withLessons.lessons[0]!.href, backToModules: true }),
    ).toEqual({ level: "modules" });
  });

  it("never opens an empty level 2 for a module with no lessons", () => {
    const empty = { ...withLessons, lessons: [], extras: [] };
    const onlyEmpty = [{ number: 1, title: "Stage", modules: [empty] }];
    expect(resolveNavView({ stages: onlyEmpty, pathname: empty.href })).toEqual({
      level: "modules",
    });
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `T tests/navLevel.test.ts`
Expected: FAIL — cannot resolve `@/lib/course/navLevel`.

- [ ] **Step 3: Create `web/src/lib/course/navLevel.ts`**

```ts
import type { CourseNavModule, CourseNavStage } from "@/lib/course/nav";

/** Which pane the course nav shows: every module, or one module's lessons. */
export type NavView =
  | { level: "modules" }
  | { level: "module"; navModule: CourseNavModule };

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Module whose page, lesson, or extra destination matches the current route. */
export function activeModuleSlug(
  stages: CourseNavStage[],
  pathname: string,
): string | null {
  for (const stage of stages) {
    for (const navModule of stage.modules) {
      if (pathname === navModule.href) return navModule.slug;
      if (navModule.lessons.some((l) => isActivePath(pathname, l.href))) {
        return navModule.slug;
      }
      // Extras must open the module too: without this, visiting a module's
      // concept map drops the nav back to the module list.
      if ((navModule.extras ?? []).some((e) => isActivePath(pathname, e.href))) {
        return navModule.slug;
      }
    }
  }
  return null;
}

/**
 * The level is derived from the route, not stored — except `backToModules`,
 * the one-shot override the back button sets so a reader can browse other
 * modules without leaving the page they are on.
 */
export function resolveNavView({
  stages,
  pathname,
  backToModules = false,
}: {
  stages: CourseNavStage[];
  pathname: string;
  backToModules?: boolean;
}): NavView {
  if (backToModules) return { level: "modules" };
  const slug = activeModuleSlug(stages, pathname);
  if (!slug) return { level: "modules" };
  const navModule = stages
    .flatMap((stage) => stage.modules)
    .find((m) => m.slug === slug);
  // Nothing to show at level 2, so following the row just navigates.
  if (!navModule || navModule.lessons.length === 0) return { level: "modules" };
  return { level: "module", navModule };
}
```

- [ ] **Step 4: Point the component at it.** In `CourseNavTree.tsx`, delete the local `isActivePath` and `activeModuleSlug` functions and add to the imports:

```ts
import { activeModuleSlug } from "@/lib/course/navLevel";
```

- [ ] **Step 5: Run tests and typecheck**

Run: `T tests/navLevel.test.ts && npx tsc --noEmit`
Expected: PASS; tsc exits 0. (`CourseNavTree` still renders the old tree — that is replaced in Task 3.)

- [ ] **Step 6: Commit**

```bash
cd .. && git add web/src/lib/course/navLevel.ts web/tests/navLevel.test.ts web/src/components/layout/CourseNavTree.tsx
git commit -m "$(printf 'refactor(nav): extract course nav level resolution\n\nCo-Authored-By: Claude Opus 5 <noreply@anthropic.com>')"
```

---

### Task 2: The panel (presentational)

**Files:**
- Create: `web/src/components/layout/CourseNavPanel.tsx`
- Create: `web/tests/courseNavPanel.test.tsx`

**Interfaces:**
- Consumes: `NavView` from Task 1.
- Produces: `CourseNavPanel(props: { nav: CourseNavStage[]; view: NavView; pathname: string; visited: Set<string>; compact: boolean; curriculumHref: string; onBack: () => void; allModulesRef?: Ref<HTMLAnchorElement> })`. Task 3 renders it.

- [ ] **Step 1: Write the failing test** — `web/tests/courseNavPanel.test.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { buildCourseNav } from "@/lib/course/nav";
import { CourseNavPanel } from "@/components/layout/CourseNavPanel";

const nav = buildCourseNav();
const modules = nav.flatMap((s) => s.modules);
const navModule = modules.find((m) => (m.extras ?? []).length > 0 && m.lessons.length > 0)!;
const other = modules.find((m) => m.slug !== navModule.slug)!;
const lesson = navModule.lessons[0]!;

const render = (view: Parameters<typeof CourseNavPanel>[0]["view"], pathname: string) =>
  renderToStaticMarkup(
    <CourseNavPanel
      nav={nav}
      view={view}
      pathname={pathname}
      visited={new Set<string>()}
      compact
      curriculumHref="/courses/dsa"
      onBack={() => {}}
    />,
  );

describe("CourseNavPanel level 1", () => {
  const html = render({ level: "modules" }, "/courses/dsa");

  it("lists every stage heading and module, and no lesson titles", () => {
    for (const stage of nav) expect(html).toContain(stage.title);
    for (const m of modules) expect(html).toContain(m.shortTitle);
    expect(html).not.toContain(lesson.title);
  });

  it("marks a coming-soon module", () => {
    const soon = modules.find((m) => m.status === "coming-soon");
    if (soon) expect(html).toContain("soon");
  });
});

describe("CourseNavPanel level 2", () => {
  const html = render({ level: "module", navModule }, lesson.href);

  it("shows only the open module's lessons and extras", () => {
    for (const l of navModule.lessons) expect(html).toContain(l.title);
    for (const e of navModule.extras ?? []) expect(html).toContain(e.title);
    // Match the href, not the title: a module's short title can appear inside
    // another module's lesson titles ("… (Linked Lists module)").
    expect(html).not.toContain(`href="${other.href}"`);
  });

  it("offers a back control and names the module", () => {
    expect(html).toMatch(/<button[^>]*>[\s\S]*?All modules[\s\S]*?<\/button>/);
    expect(html).toContain(navModule.title);
  });

  it("marks the active lesson for assistive tech", () => {
    expect(html).toMatch(new RegExp(`aria-current="page"[^>]*href="${lesson.href}"|href="${lesson.href}"[^>]*aria-current="page"`));
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `T tests/courseNavPanel.test.tsx`
Expected: FAIL — cannot resolve `@/components/layout/CourseNavPanel`.

- [ ] **Step 3: Create `web/src/components/layout/CourseNavPanel.tsx`**

```tsx
"use client";

import type { ReactNode, Ref } from "react";
import Link from "next/link";
import { CaretLeft, CaretRight, TreeStructure } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import type {
  CourseNavExtra,
  CourseNavLesson,
  CourseNavModule,
  CourseNavStage,
} from "@/lib/course/nav";
import type { NavView } from "@/lib/course/navLevel";

export interface CourseNavPanelProps {
  nav: CourseNavStage[];
  view: NavView;
  pathname: string;
  visited: Set<string>;
  /** Desktop rail uses denser rows; mobile sheet needs ≥44px taps. */
  compact: boolean;
  curriculumHref: string;
  onBack: () => void;
  /** Focus target after back, so the unmounting button doesn't drop focus. */
  allModulesRef?: Ref<HTMLAnchorElement>;
}

const rowPad = (compact: boolean) =>
  compact ? "min-h-8 py-1.5" : "min-h-11 py-2.5";
const iconBox = (compact: boolean) => (compact ? "h-8 w-6" : "h-11 w-11");

function ModuleRow({
  navModule,
  pathname,
  visited,
  compact,
}: {
  navModule: CourseNavModule;
  pathname: string;
  visited: Set<string>;
  compact: boolean;
}) {
  const doneCount = navModule.lessons.filter((l) => visited.has(l.id)).length;
  const hasLessons = navModule.lessons.length > 0;
  const active = pathname === navModule.href;

  return (
    <Link
      href={navModule.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group flex items-center gap-1 rounded-[length:var(--radius-xs)] px-2 text-[13px] transition-colors",
        rowPad(compact),
        navModule.status === "coming-soon" && "text-muted/60",
        active
          ? "bg-pop font-semibold text-on-pop"
          : "text-foreground/80 hover:bg-surface hover:text-foreground",
      )}
    >
      <span className="min-w-0 flex-1 truncate">
        <span className="mr-1.5 tabular-nums text-[11px] text-muted">
          {navModule.number}.
        </span>
        {navModule.shortTitle}
        {navModule.status === "coming-soon" ? (
          <span className="ml-1.5 text-[10px] uppercase tracking-wide text-muted/50">
            soon
          </span>
        ) : hasLessons ? (
          <span
            className={cn(
              "ml-1.5 font-mono text-[10px] tabular-nums",
              active
                ? "text-on-pop/70"
                : doneCount === navModule.lessons.length
                  ? "text-mark"
                  : "text-muted",
            )}
          >
            {doneCount}/{navModule.lessons.length}
          </span>
        ) : null}
      </span>
      {hasLessons ? (
        <CaretRight
          aria-hidden
          className="h-3 w-3 shrink-0 text-muted transition-transform group-hover:translate-x-0.5"
        />
      ) : null}
    </Link>
  );
}

function DestinationRow({
  href,
  title,
  pathname,
  compact,
  marker,
}: {
  href: string;
  title: string;
  pathname: string;
  compact: boolean;
  marker: ReactNode;
}) {
  const active = pathname === href;
  return (
    <div className="flex items-start gap-1">
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center",
          iconBox(compact),
        )}
      >
        {marker}
      </span>
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex min-w-0 flex-1 items-center rounded-[length:var(--radius-xs)] px-2 text-[13px] leading-snug transition-colors",
          rowPad(compact),
          active
            ? "bg-pop font-semibold text-on-pop"
            : "text-muted hover:bg-surface hover:text-foreground",
        )}
      >
        <span className="min-w-0">{title}</span>
      </Link>
    </div>
  );
}

function LessonRow({
  lesson,
  pathname,
  visited,
  compact,
}: {
  lesson: CourseNavLesson;
  pathname: string;
  visited: Set<string>;
  compact: boolean;
}) {
  const isDone = visited.has(lesson.id);
  return (
    <DestinationRow
      href={lesson.href}
      title={lesson.title}
      pathname={pathname}
      compact={compact}
      marker={
        <span
          className={cn(
            "h-2 w-2 rounded-[length:var(--radius-xs)] transition-colors",
            isDone ? "bg-accent" : "border border-border bg-transparent",
          )}
          title={isDone ? "Completed" : "Not completed"}
        />
      }
    />
  );
}

function ExtraRow({
  extra,
  pathname,
  compact,
}: {
  extra: CourseNavExtra;
  pathname: string;
  compact: boolean;
}) {
  return (
    <DestinationRow
      href={extra.href}
      title={extra.title}
      pathname={pathname}
      compact={compact}
      marker={
        <TreeStructure weight="bold" className="h-3 w-3 text-muted" aria-hidden />
      }
    />
  );
}

/**
 * Props-only view for both nav levels — no hooks and no context, so it
 * renders under renderToStaticMarkup in tests without mocking the router.
 */
export function CourseNavPanel({
  nav,
  view,
  pathname,
  visited,
  compact,
  curriculumHref,
  onBack,
  allModulesRef,
}: CourseNavPanelProps) {
  if (view.level === "module") {
    const { navModule } = view;
    const doneCount = navModule.lessons.filter((l) => visited.has(l.id)).length;
    return (
      <div>
        <button
          type="button"
          onClick={onBack}
          className={cn(
            "mb-2.5 flex w-full items-center gap-1.5 rounded-[length:var(--radius-xs)] px-2 text-[13px] font-medium text-foreground transition-colors hover:bg-surface",
            rowPad(compact),
          )}
        >
          <CaretLeft aria-hidden className="h-3.5 w-3.5 shrink-0 text-muted" />
          All modules
        </button>
        <div className="border-b border-border px-2 pb-2">
          <h2 className="font-display text-[13px] font-bold tracking-tight text-foreground">
            <span className="mr-1.5 tabular-nums text-[11px] text-muted">
              {navModule.number}.
            </span>
            {navModule.title}
          </h2>
          {navModule.lessons.length > 0 ? (
            <p className="mt-0.5 font-mono text-[10px] tabular-nums text-muted">
              {doneCount}/{navModule.lessons.length}
            </p>
          ) : null}
        </div>
        <div className={cn("mt-2", compact ? "space-y-0.5" : "space-y-1")}>
          {navModule.lessons.map((lesson) => (
            <LessonRow
              key={lesson.id}
              lesson={lesson}
              pathname={pathname}
              visited={visited}
              compact={compact}
            />
          ))}
          {/* Non-lesson destinations: no completion dot, and deliberately not
              part of the x/y count above — they have no progress to track. */}
          {(navModule.extras ?? []).map((extra) => (
            <ExtraRow
              key={extra.id}
              extra={extra}
              pathname={pathname}
              compact={compact}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link
        ref={allModulesRef}
        href={curriculumHref}
        aria-current={pathname === curriculumHref ? "page" : undefined}
        className={cn(
          "mb-2.5 block rounded-[length:var(--radius-xs)] px-2 text-[13px] font-medium transition-colors",
          rowPad(compact),
          pathname === curriculumHref
            ? "bg-pop font-semibold text-on-pop"
            : "text-foreground hover:bg-surface",
        )}
      >
        All modules
      </Link>
      {nav.map((stage) => (
        <div
          key={stage.number}
          className={cn(compact ? "mt-5 first:mt-3" : "mt-6 first:mt-4")}
        >
          <p
            className={cn(
              "border-b border-border px-2 font-display text-[11px] font-bold uppercase tracking-[0.1em] text-foreground/70",
              compact ? "mb-2 pb-1.5" : "mb-3 pb-2",
            )}
          >
            {stage.title}
          </p>
          <div className={cn(compact ? "space-y-1" : "space-y-1.5")}>
            {stage.modules.map((m) => (
              <ModuleRow
                key={m.slug}
                navModule={m}
                pathname={pathname}
                visited={visited}
                compact={compact}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Run tests, typecheck, lint**

Run: `T tests/courseNavPanel.test.tsx && npx tsc --noEmit && npx eslint src/components/layout/CourseNavPanel.tsx tests/courseNavPanel.test.tsx`
Expected: all PASS.

- [ ] **Step 5: Prove the level-2 isolation test can fail.** Temporarily change the level-2 branch to render `nav.flatMap((s) => s.modules).map(...)` lesson rows instead of `navModule.lessons`, run `T tests/courseNavPanel.test.tsx`, confirm the "only the open module's lessons" test FAILS, then restore.

- [ ] **Step 6: Commit**

```bash
cd .. && git add web/src/components/layout/CourseNavPanel.tsx web/tests/courseNavPanel.test.tsx
git commit -m "$(printf 'feat(nav): add the props-only two-level nav panel\n\nCo-Authored-By: Claude Opus 5 <noreply@anthropic.com>')"
```

---

### Task 3: Wire the tree (state, motion, scroll, focus)

**Files:**
- Modify: `web/src/components/layout/CourseNavTree.tsx` (replace everything below the imports)
- Create: `web/tests/courseNavTree.test.ts` (source guard)

**Interfaces:**
- Consumes: `resolveNavView`, `NavView` (Task 1), `CourseNavPanel` (Task 2).
- Produces: unchanged public props `{ compact?: boolean; className?: string }`.

- [ ] **Step 1: Write the failing guard test** — `web/tests/courseNavTree.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const SRC = join(__dirname, "..", "src");
const tree = readFileSync(
  join(SRC, "components", "layout", "CourseNavTree.tsx"),
  "utf8",
);

describe("CourseNavTree wiring", () => {
  it("renders one Course nav landmark around the shared panel", () => {
    expect(tree.match(/aria-label="Course"/g)).toHaveLength(1);
    expect(tree).toContain("<CourseNavPanel");
  });

  it("derives the level instead of storing it, and drops the override on navigation", () => {
    expect(tree).toContain("resolveNavView");
    // The override is the only stored piece; a stored level would go stale
    // against the route.
    expect(tree).toMatch(/useState<boolean>\(false\)|useState\(false\)/);
    expect(tree).toMatch(/useEffect\(\(\) => \{\s*setBackToModules\(false\);?\s*\}, \[pathname\]\)/);
  });

  it("skips the animation under prefers-reduced-motion", () => {
    expect(tree).toContain("useReducedMotion");
    expect(tree).toContain("AnimatePresence");
  });

  it("keeps the call-site props", () => {
    expect(tree).toMatch(/compact = true/);
    expect(tree).toMatch(/className\?: string/);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `T tests/courseNavTree.test.ts`
Expected: FAIL — no `CourseNavPanel`, no `resolveNavView`, no `useReducedMotion`.

- [ ] **Step 3: Replace `CourseNavTree.tsx` with:**

```tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { buildCourseNav } from "@/lib/course/nav";
import { resolveNavView } from "@/lib/course/navLevel";
import { CourseNavPanel } from "@/components/layout/CourseNavPanel";
import { buildNextjsCourseNav } from "@/app/courses/nextjs/nav";
import { activeCourseSlugFor } from "@/lib/courses/activeCourse";
import { useProgress } from "@/components/providers/ProgressProvider";
import { CURRICULUM } from "@/lib/landing/content";
import { NEXTJS_COURSE } from "@/app/courses/nextjs/registry";

/** Matches --dur/--ease in globals.css, and the mobile sheet's own motion. */
const SLIDE = { duration: 0.22, ease: [0.2, 0, 0, 1] } as const;
const SLIDE_PX = 24;

/**
 * Shared course nav for the desktop drawer and mobile sheet: a module list
 * that drills into one module's lessons. The level is derived from the route
 * (see lib/course/navLevel.ts); only the back override lives here.
 */
export function CourseNavTree({
  compact = true,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  const pathname = usePathname();
  const courseSlug = activeCourseSlugFor(pathname);
  const nav = useMemo(
    () => (courseSlug === "nextjs" ? buildNextjsCourseNav() : buildCourseNav()),
    [courseSlug],
  );
  const curriculumHref = courseSlug === "nextjs" ? NEXTJS_COURSE.href : CURRICULUM;
  const { visited } = useProgress();
  const reduceMotion = useReducedMotion();

  const [backToModules, setBackToModules] = useState(false);
  // Following any row navigates, which is the reader's own answer to "which
  // module am I in" — the override has served its purpose.
  useEffect(() => {
    setBackToModules(false);
  }, [pathname]);

  const view = resolveNavView({ stages: nav, pathname, backToModules });
  const viewKey = view.level === "module" ? view.navModule.slug : "modules";

  const scrollRef = useRef<HTMLElement | null>(null);
  const allModulesRef = useRef<HTMLAnchorElement | null>(null);
  const wantsFocus = useRef(false);

  // A fresh level starts at its own top; keeping the old offset lands the
  // reader mid-list in a list they have not seen.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
    if (wantsFocus.current) {
      wantsFocus.current = false;
      allModulesRef.current?.focus();
    }
  }, [viewKey]);

  const panel = (
    <CourseNavPanel
      nav={nav}
      view={view}
      pathname={pathname}
      visited={visited}
      compact={compact}
      curriculumHref={curriculumHref}
      allModulesRef={allModulesRef}
      onBack={() => {
        // The back button unmounts with the level, so move focus deliberately.
        wantsFocus.current = true;
        setBackToModules(true);
      }}
    />
  );

  return (
    <nav
      ref={scrollRef}
      className={cn("flex-1 overflow-y-auto", className)}
      aria-label="Course"
    >
      {reduceMotion ? (
        panel
      ) : (
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={viewKey}
            initial={{
              opacity: 0,
              x: view.level === "module" ? SLIDE_PX : -SLIDE_PX,
            }}
            animate={{ opacity: 1, x: 0 }}
            exit={{
              opacity: 0,
              x: view.level === "module" ? -SLIDE_PX : SLIDE_PX,
            }}
            transition={SLIDE}
          >
            {panel}
          </motion.div>
        </AnimatePresence>
      )}
    </nav>
  );
}
```

- [ ] **Step 4: Run the guard, the full suite, typecheck and lint**

Run: `T tests/courseNavTree.test.ts && npm test && npx tsc --noEmit && npm run lint`
Expected: guard PASS; full suite green; tsc exits 0; eslint 0 errors (9 pre-existing warnings).

- [ ] **Step 5: Commit**

```bash
cd .. && git add web/src/components/layout/CourseNavTree.tsx web/tests/courseNavTree.test.ts
git commit -m "$(printf 'feat(nav): two-level course nav with cross-slide between levels\n\nCo-Authored-By: Claude Opus 5 <noreply@anthropic.com>')"
```

---

### Task 4: Browser verification and doctrine

**Files:**
- Modify: `CLAUDE.md` (§4, one line on the nav shape) — only if the browser pass is clean

- [ ] **Step 1: Build, then start the dev server**

```bash
npm run build
```

Expected: exits 0. Then `preview_start` the `web-dev` config. If styles look stale after the branch switch, stop the server, `rm -rf .next/dev`, restart (see the stale-dev-cache note).

- [ ] **Step 2: Desktop drawer, dark theme.** On `http://localhost:3002/courses/dsa/arrays/contiguous-memory`:
  - the nav opens at level 2 for Arrays: back row, `4. Arrays` header with `1/5`, its five lessons, active row highlighted;
  - `read_page` shows `aria-current="page"` on the active lesson;
  - press back → level 1 with every stage heading, and the URL is unchanged;
  - follow another module → its level 2, and the page navigates to that module.

- [ ] **Step 3: Level-2 isolation.** In `javascript_tool`, confirm no other module's rows are present:

```js
const links = [...document.querySelectorAll('nav[aria-label="Course"] a')].map((a) => a.getAttribute("href"));
({ count: links.length, offModule: links.filter((h) => h && !h.startsWith("/courses/dsa/arrays") && h !== "/courses/dsa") })
```

Expected: `offModule` is empty at level 2.

- [ ] **Step 4: Mobile.** `resize_window` preset `mobile`, open the lessons sheet, repeat drill-in and back, and check row heights are ≥44px:

```js
[...document.querySelectorAll('nav[aria-label="Course"] a, nav[aria-label="Course"] button')].map((el) => el.getBoundingClientRect().height).filter((h) => h > 0 && h < 44)
```

Expected: empty array. Restore `desktop` afterwards.

- [ ] **Step 5: Light theme** on the same two levels; then `resize_window` with `colorScheme: "light"` reverted.

- [ ] **Step 6: Reduced motion.** With `prefers-reduced-motion: reduce` emulated, switch levels and confirm no transform animation runs.

- [ ] **Step 7: Next.js course aliased modules.** Temporarily return `_props.children` from `web/src/app/courses/nextjs/layout.tsx` (never commit this), load a Next.js lesson, confirm the nav resolves to that module's level 2, then `git checkout -- web/src/app/courses/nextjs/layout.tsx`.

- [ ] **Step 8: Doctrine.** In `CLAUDE.md` §4, add to the nav description: the course nav is two levels (modules → one module's lessons), the level is derived from the route with a back override, and `lib/course/navLevel.ts` owns that resolution.

- [ ] **Step 9: Commit and report**

```bash
git add CLAUDE.md && git commit -m "$(printf 'docs(claude): record the two-level course nav\n\nCo-Authored-By: Claude Opus 5 <noreply@anthropic.com>')"
```

Report: test counts, screenshots of both levels in both themes, anything found in passing. Then use superpowers:finishing-a-development-branch.
