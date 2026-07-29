# Problem Lesson Split Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give `type: problem` lessons a split-pane layout — problem text and
hints on the left, a sticky code editor on the right on wide screens,
identical reading order stacked on narrow screens — without touching how
concept lessons render.

**Architecture:** A pure function parses each lesson's markdown once at
build time (via the `unified`/`remark-parse` stack already used for syntax
highlighting) and slices it into three pieces around the sandbox fence's
exact AST offsets. A new view component renders those three pieces as fixed
DOM nodes inside a CSS Grid that reflows at `xl:` via `grid-template-areas`,
never duplicating the sandbox component in the DOM. Three content-test
invariants make the split's assumptions permanent CI guarantees rather than
one-time observations.

**Tech Stack:** Next.js (App Router, React Server Components), TypeScript
strict, Tailwind CSS v4, `unified`/`remark-parse`/`remark-gfm` (existing
deps), Vitest.

## Global Constraints

- TypeScript strict; no `any`, no unchecked casts to silence the compiler.
  (`highlightBlocks.ts` already casts a `unified().parse()` result `as
  Root` because the fluent `.use().use().parse()` chain doesn't infer a
  concrete node type — this plan's new code matches that one existing,
  narrow, justified cast rather than inventing a different typing style.)
- Comments explain why, never what.
- All color goes through the existing design tokens in `globals.css`; this
  plan introduces zero new colors or tokens.
- DOM order must equal visual reading order at every breakpoint — no
  `order` property, no visual-only reordering that would desync keyboard
  and screen-reader navigation from what's on screen.
- Never assert something works — confirm it in the browser, per lesson
  page, at both the `xl:` and pre-`xl:` breakpoints.
- `npx tsc --noEmit`, `npx eslint src tests`, `npm test`, and
  `npm run build` must all pass before any task is considered done.
- `LessonView.tsx` and the concept-lesson rendering path are **not**
  modified anywhere in this plan.
- Solved-state (`solvedStorage.ts`, a `SolvedBadge`, `Sandbox` gaining
  `lessonId`/`onSolved` props, any "Solved" indicator) is explicitly out of
  scope — do not add it. It is a follow-up spec.
- All commands below run from `/Users/tharunk/DSA/web` unless stated
  otherwise.

---

### Task 1: `extractSandboxFence` — pure markdown-splitting function

**Files:**
- Create: `src/lib/content/extractSandboxFence.ts`
- Test: `tests/extractSandboxFence.test.ts`

**Interfaces:**
- Produces: `export interface SandboxExtraction { beforeSandbox: string; sandboxSource: string; afterSandbox: string }` and `export function extractSandboxFence(markdown: string): SandboxExtraction | null`.
- Consumes: nothing from other tasks (first task in the plan).

- [ ] **Step 1: Write the failing test**

Create `tests/extractSandboxFence.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import { extractSandboxFence } from "../src/lib/content/extractSandboxFence";

describe("extractSandboxFence", () => {
  it("returns null when there is no sandbox fence", () => {
    const markdown = "## Problem\n\nSome text.\n\n## Attempt it first\n\nMore text.\n";
    expect(extractSandboxFence(markdown)).toBeNull();
  });

  it("splits before/source/after around the fence", () => {
    const markdown = [
      "## Problem",
      "",
      "Some problem text.",
      "",
      "## Attempt it first",
      "",
      "Try it.",
      "",
      "```sandbox",
      '{"id": "demo"}',
      "```",
      "",
      "````reveal Hint 1",
      "A hint.",
      "````",
      "",
    ].join("\n");

    const result = extractSandboxFence(markdown);
    expect(result).not.toBeNull();
    if (!result) return;

    expect(result.sandboxSource).toBe('{"id": "demo"}');
    expect(result.beforeSandbox).toContain("## Problem");
    expect(result.beforeSandbox).toContain("## Attempt it first");
    expect(result.beforeSandbox).not.toContain("```sandbox");
    expect(result.afterSandbox).toContain("````reveal Hint 1");
    expect(result.afterSandbox).not.toContain("```sandbox");
  });

  it("splits a real lesson file the same way loadLesson will", () => {
    const path = join(
      __dirname,
      "..",
      "..",
      "course",
      "recursion-backtracking",
      "subsets.md",
    );
    const raw = readFileSync(path, "utf8");
    const { content } = matter(raw);
    const result = extractSandboxFence(content.trim());

    expect(result).not.toBeNull();
    if (!result) return;

    const spec = JSON.parse(result.sandboxSource) as { id: string };
    expect(spec.id).toBe("subsets");
    expect(result.beforeSandbox).toContain("## Problem");
    expect(result.afterSandbox).toContain("## Solution");
    expect(result.beforeSandbox).not.toContain("```sandbox");
    expect(result.afterSandbox).not.toContain("```sandbox");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/extractSandboxFence.test.ts`
Expected: FAIL — `Cannot find module '../src/lib/content/extractSandboxFence'`

- [ ] **Step 3: Write the implementation**

Create `src/lib/content/extractSandboxFence.ts`:

```ts
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import type { Root, Code } from "mdast";

/**
 * The three pieces a problem lesson's markdown splits into around its
 * sandbox fence. Kept as three strings, not one rejoined `bodyMarkdown`:
 * the split-pane layout needs `beforeSandbox`/`afterSandbox` on either
 * side of a separately-rendered `<Sandbox>`, and the narrow-screen layout
 * needs to put the editor back in its original textual position rather
 * than always first or last.
 */
export interface SandboxExtraction {
  beforeSandbox: string;
  sandboxSource: string;
  afterSandbox: string;
}

/**
 * Finds the lesson's sandbox fence via a real parse (the same
 * unified/remark-parse/remark-gfm stack `highlightBlocks.ts` already uses)
 * and slices the original markdown at the fence node's exact source
 * offsets. Not a regex/indexOf scan: a hand-rolled fence matcher would
 * have to reimplement CommonMark's fence-length rule (a fence closes only
 * on a fence of at least the same backtick count) to be correct.
 *
 * Scans `tree.children` — the root's direct children only. A `reveal`/
 * `aside`/`tabs` fence's body is stored as an opaque string on a leaf
 * node, never as nested AST children, so this can never reach inside one;
 * there is no recursion flag to get wrong. `content.test.ts`'s "sandbox
 * fence is safe to extract" suite is what guarantees every lesson only
 * ever has a fence this function can actually find.
 */
export function extractSandboxFence(markdown: string): SandboxExtraction | null {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown) as Root;
  const node = tree.children.find(
    (child): child is Code => child.type === "code" && child.lang === "sandbox",
  );
  if (!node?.position) return null;

  const { start, end } = node.position;
  return {
    beforeSandbox: markdown.slice(0, start.offset),
    sandboxSource: node.value,
    afterSandbox: markdown.slice(end.offset),
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/extractSandboxFence.test.ts`
Expected: PASS — 3 tests passed

- [ ] **Step 5: Typecheck and lint**

Run: `npx tsc --noEmit && npx eslint src tests`
Expected: both exit 0

- [ ] **Step 6: Commit**

```bash
git add src/lib/content/extractSandboxFence.ts tests/extractSandboxFence.test.ts
git commit -m "Add extractSandboxFence: splits a lesson's markdown around its sandbox fence via real AST offsets"
```

---

### Task 2: Content-test invariants that keep the split safe forever

**Files:**
- Modify: `tests/content.test.ts`

**Interfaces:**
- Consumes: `extractSandboxFence` from Task 1 (`../src/lib/content/extractSandboxFence`), the existing `fences()` helper and `LESSONS` array already in this file.
- Produces: nothing new for later tasks — this is a terminal safety net.

- [ ] **Step 1: Add the imports**

At the top of `tests/content.test.ts`, after the existing imports (currently
ending at line 5, `import { parseSandboxSpec } from "@/components/sandbox/parseSpec";`), add:

```ts
import matter from "gray-matter";
import { extractSandboxFence } from "../src/lib/content/extractSandboxFence";
```

- [ ] **Step 2: Write the three new tests**

Insert this new `describe` block immediately after the closing `});` of
the existing `describe("every sandbox fence survives the real parser", ...)`
block (that block currently ends at line 321) and before the comment block
that starts `/**\n * Sandbox coverage, as a hard gate.` (currently line 323):

```ts
/**
 * The split-pane problem view (a follow-up piece of work) hoists the
 * sandbox fence out of the markdown into its own pane by parsing at build
 * time and slicing on real AST offsets — see
 * `lib/content/extractSandboxFence.ts`. That extraction is only correct
 * if three things hold about every lesson; these tests make sure they
 * hold forever, not just as of this writing.
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
```

- [ ] **Step 3: Run the new tests, confirm they pass against real content**

Run: `npx vitest run tests/content.test.ts -t "safe to extract"`
Expected: PASS — 3 tests passed (this is expected: the earlier design
work already verified these hold across all 116 problem lessons; this
step confirms the *test code itself* is correct, not that the invariant
is new)

- [ ] **Step 4: Prove each test can actually fail — sabotage one lesson at a time**

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

- [ ] **Step 5: Confirm the file is restored and the full suite is green**

Run: `git diff --stat course/recursion-backtracking/subsets.md`
Expected: empty output (no diff — the three sabotages were each reverted)

Run: `npm test`
Expected: all tests pass, same total count as before this task

- [ ] **Step 6: Commit**

```bash
git add tests/content.test.ts
git commit -m "Guarantee the sandbox-fence split stays safe: exactly one, never nested, no heading collision"
```

---

### Task 3: Wire the extraction into `loadLesson`

**Files:**
- Modify: `src/lib/course/load.ts`

**Interfaces:**
- Consumes: `extractSandboxFence`, `SandboxExtraction` from Task 1.
- Produces: `LoadedLesson.sandbox: SandboxExtraction | null`, read by Task 4's `ProblemLessonView` and Task 5's route.

- [ ] **Step 1: Add the import**

In `src/lib/course/load.ts`, after the existing
`import { highlightBlocks, type TabBlock } from "@/lib/content/highlightBlocks";`
line, add:

```ts
import {
  extractSandboxFence,
  type SandboxExtraction,
} from "@/lib/content/extractSandboxFence";
```

- [ ] **Step 2: Add the field to `LoadedLesson`**

Change:

```ts
export interface LoadedLesson {
  moduleSlug: string;
  lessonSlug: string;
  title: string;
  markdown: string;
  toc: TocItem[];
  readingMinutes: number;
  sourcePath: string;
  highlightedBlocks: Record<string, string | null>;
  highlightedTabs: Record<string, TabBlock[]>;
}
```

to:

```ts
export interface LoadedLesson {
  moduleSlug: string;
  lessonSlug: string;
  title: string;
  markdown: string;
  toc: TocItem[];
  readingMinutes: number;
  sourcePath: string;
  highlightedBlocks: Record<string, string | null>;
  highlightedTabs: Record<string, TabBlock[]>;
  /** Non-null only for problem lessons — see extractSandboxFence.ts */
  sandbox: SandboxExtraction | null;
}
```

- [ ] **Step 3: Compute it in `loadLesson` and return it**

Change the body of `loadLesson` from:

```ts
  const { content, data } = matter(raw);
  const trimmed = content.trim();
  const { blocks, tabs } = await highlightBlocks(trimmed);

  return {
    moduleSlug,
    lessonSlug,
    title: (data.title as string) ?? hit.lesson.title,
    markdown: trimmed,
    toc: extractToc(content),
    readingMinutes: Math.max(1, Math.ceil(readingTime(content).minutes)),
    sourcePath: relative,
    highlightedBlocks: blocks,
    highlightedTabs: tabs,
  };
```

to:

```ts
  const { content, data } = matter(raw);
  const trimmed = content.trim();
  const { blocks, tabs } = await highlightBlocks(trimmed);

  return {
    moduleSlug,
    lessonSlug,
    title: (data.title as string) ?? hit.lesson.title,
    markdown: trimmed,
    toc: extractToc(content),
    readingMinutes: Math.max(1, Math.ceil(readingTime(content).minutes)),
    sourcePath: relative,
    highlightedBlocks: blocks,
    highlightedTabs: tabs,
    sandbox: extractSandboxFence(trimmed),
  };
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: exit 0. (If any other file constructs a `LoadedLesson` object
literal directly rather than via `loadLesson`, this step is what catches
a missing `sandbox` field — check the error output names one, since that
would mean this task's Step 3 wasn't the only construction site.)

- [ ] **Step 5: Confirm against a real lesson with a quick script**

Run:
```bash
npx tsx -e '
import { loadLesson } from "./src/lib/course/load";
loadLesson("recursion-backtracking", "subsets").then((lesson) => {
  console.log("sandbox non-null:", lesson?.sandbox !== null);
  console.log("sandboxSource starts with:", lesson?.sandbox?.sandboxSource.slice(0, 30));
});
'
```
Expected output:
```
sandbox non-null: true
sandboxSource starts with: {
  "id": "subsets",
```

Run the same for a concept lesson to confirm the `null` path:
```bash
npx tsx -e '
import { loadLesson } from "./src/lib/course/load";
loadLesson("big-o", "common-complexity-classes").then((lesson) => {
  console.log("sandbox is null:", lesson?.sandbox === null);
});
'
```
Expected output: `sandbox is null: true`

- [ ] **Step 6: Run the full test suite**

Run: `npm test`
Expected: all tests pass (same count as end of Task 2)

- [ ] **Step 7: Commit**

```bash
git add src/lib/course/load.ts
git commit -m "Wire extractSandboxFence into loadLesson: LoadedLesson.sandbox"
```

---

### Task 4: `ProblemLessonView` — the split/stacked layout

**Files:**
- Create: `src/components/course/ProblemLessonView.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `LoadedLesson`/`SandboxExtraction` (Tasks 1 & 3), the existing
  `Markdown`, `TableOfContents`, `Sandbox`, `Breadcrumbs` components
  (unchanged — none of their props change in this plan).
- Produces: `ProblemLessonView` component, consumed by Task 5's route.

Scoping note: no `type: problem` lesson currently uses a `stage` embed
(`LESSON_EMBEDS` has exactly one entry, `big-o/common-complexity-classes`,
which is `type: concept`) — so this component deliberately has no `stage`
prop. If a future problem lesson needs one, add it then.

- [ ] **Step 1: Add the CSS grid rule**

Append to the end of `src/app/globals.css` (after the existing
`@media (prefers-reduced-motion: no-preference) { .riso-overprint { ... } }`
block):

```css

/*
  Problem lessons: three fixed DOM nodes (before / sandbox / after)
  reflow via named grid areas instead of duplicating the sandbox in the
  DOM for a second, CSS-hidden layout. Mobile-first: stacked, reading
  order unchanged from before this existed. At `xl:` (the same breakpoint
  `TableOfContents` already gates on) the sandbox column becomes sticky —
  same sticky mechanics TableOfContents already uses, just holding the
  table of contents and the editor together.
*/
.problem-layout {
  display: grid;
  grid-template-areas: "before" "sandbox" "after";
  column-gap: 2.5rem;
}
.problem-layout > .problem-layout-before {
  grid-area: before;
  /*
    Trailing space before whatever comes next in DOM order. A grid
    `row-gap` would do this too, but at `xl:` the sandbox area spans both
    rows — a row-gap would cut a visible seam through the middle of that
    spanning, sticky column. Per-element margin only affects the column
    it's in, at every breakpoint, so it can't do that.
  */
  margin-bottom: 2.5rem;
}
.problem-layout > .problem-layout-sandbox {
  grid-area: sandbox;
  margin-bottom: 2.5rem;
}
.problem-layout > .problem-layout-after {
  grid-area: after;
}

@media (min-width: 1280px) {
  .problem-layout {
    grid-template-columns: 1fr 24rem;
    grid-template-areas: "before sandbox" "after sandbox";
  }
  .problem-layout > .problem-layout-sandbox {
    position: sticky;
    top: 6rem;
    align-self: start;
    max-height: calc(100vh - 7rem);
    overflow-y: auto;
    border-left: 1px solid var(--border);
    padding-left: 1.5rem;
  }
}
```

- [ ] **Step 2: Create the component**

Create `src/components/course/ProblemLessonView.tsx`:

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
  /** `sandbox` narrowed non-null by the caller — see the route in Task 5 */
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

- [ ] **Step 3: Typecheck and lint**

Run: `npx tsc --noEmit && npx eslint src tests`
Expected: both exit 0 (this component isn't imported by anything yet, so
this only proves the file itself is well-typed — Task 5 proves it renders)

- [ ] **Step 4: Commit**

```bash
git add src/components/course/ProblemLessonView.tsx src/app/globals.css
git commit -m "Add ProblemLessonView: split-pane layout for problem lessons, unused until Task 5 wires the route"
```

---

### Task 5: Wire the route, remove the dead Markdown.tsx branch

**Files:**
- Modify: `src/app/course/[module]/[lesson]/page.tsx`
- Modify: `src/components/md/Markdown.tsx`

**Interfaces:**
- Consumes: `ProblemLessonView` (Task 4), `LoadedLesson.sandbox` (Task 3).
- Produces: nothing further — this is the last functional task.

- [ ] **Step 1: Branch the route on `lesson.sandbox`**

In `src/app/course/[module]/[lesson]/page.tsx`, add the import:

```ts
import { ProblemLessonView } from "@/components/course/ProblemLessonView";
```

Change the `return` statement from:

```tsx
  return (
    <LessonView
      lesson={lesson}
      eyebrow={`Module ${mod.number} · ${mod.title}`}
      typeLabel={meta.lesson.type === "problem" ? "Problem" : "Concept"}
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
```

to:

```tsx
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
```

(`{ ...lesson, sandbox: lesson.sandbox }` re-states the field so
TypeScript narrows the object literal's `sandbox` type to
`SandboxExtraction`, matching `ProblemLessonView`'s prop type exactly —
no `!` assertion needed.)

- [ ] **Step 2: Remove the now-dead branch in Markdown.tsx**

In `src/components/md/Markdown.tsx`, remove the import (currently one of
the lines near the top):

```ts
import { Sandbox } from "@/components/sandbox/Sandbox";
```

and remove this block from inside the `pre()` handler:

```tsx
        if (className.includes("language-sandbox")) {
          return <Sandbox source={text()} />;
        }
```

- [ ] **Step 3: Typecheck, lint, build**

Run: `npx tsc --noEmit && npx eslint src tests`
Expected: both exit 0 — if `Sandbox` were still referenced anywhere else
in `Markdown.tsx`, removing the import would fail here, confirming the
branch really was dead.

Run: `npm run build`
Expected: exit 0, all 191 pages generated (same count as before this
plan — this plan adds no lessons, only changes how existing ones render)

- [ ] **Step 4: Full test suite**

Run: `npm test`
Expected: all tests pass

- [ ] **Step 5: Browser verification — problem lesson, desktop width**

```
mcp__Claude_Browser__preview_start { name: "web-dev" }
mcp__Claude_Browser__navigate { url: "http://localhost:3002/course/recursion-backtracking/subsets" }
mcp__Claude_Browser__resize_window { preset: "desktop" }
mcp__Claude_Browser__computer { action: "screenshot" }
```
Expected: two columns — problem text/hints on the left, "ON THIS PAGE" +
the Python/JavaScript editor on the right, right column visibly not
scrolling with the page when you scroll the left column.

Confirm the sticky behavior concretely:
```
mcp__Claude_Browser__computer { action: "scroll", coordinate: [300, 400], scroll_direction: "down", scroll_amount: 15 }
mcp__Claude_Browser__computer { action: "screenshot" }
```
Expected: left column has scrolled further down (later hints/solution
visible); right column (TOC + editor) is still visible at the same
on-screen position.

- [ ] **Step 6: Browser verification — same lesson, narrow width**

```
mcp__Claude_Browser__resize_window { preset: "mobile" }
mcp__Claude_Browser__navigate { url: "http://localhost:3002/course/recursion-backtracking/subsets" }
mcp__Claude_Browser__computer { action: "screenshot" }
```
Expected: single column. Reading top to bottom: title/pills, "## Problem",
"## Attempt it first", then the Python/JavaScript editor, then the hints
and everything after — same order as the page had before this plan,
confirmed by comparing against a `git show` of the pre-change rendered
order if there's any doubt.

- [ ] **Step 7: Confirm the editor still actually works end to end**

While still on the mobile-width tab (or resize back to desktop first):
type a correct solution into the Python editor and click "Run tests" —
reuse the exact working solution already verified for this lesson
earlier in this project's history:

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

Expected: "All 5 passed" (or however many cases this lesson has) — this
confirms `Sandbox`/`useRunner`/`parseSandboxSpec` all still function
completely unchanged after being relocated to the new pane.

- [ ] **Step 8: Browser verification — concept lesson unaffected**

```
mcp__Claude_Browser__navigate { url: "http://localhost:3002/course/big-o/common-complexity-classes" }
mcp__Claude_Browser__resize_window { preset: "desktop" }
mcp__Claude_Browser__computer { action: "screenshot" }
```
Expected: unchanged from before this plan — single article column, right
"ON THIS PAGE" sidebar at `max-w-6xl`, the `BigOObservatory` stage embed
rendered above the markdown.

- [ ] **Step 9: Commit**

```bash
git add "src/app/course/[module]/[lesson]/page.tsx" src/components/md/Markdown.tsx
git commit -m "Route problem lessons through ProblemLessonView; remove the now-dead inline sandbox render path"
```

---

### Task 6: Final full-suite verification

**Files:** none (verification only)

- [ ] **Step 1: All four gates**

```bash
npx tsc --noEmit
npx eslint src tests
npm test
npm run build
```
Expected: all four exit 0. `npm test` reports 3 more tests than before
this plan started (Task 1's 3 unit tests) plus 3 more (Task 2's 3
invariant tests) = 6 net new tests; content-test totals otherwise
unchanged.

- [ ] **Step 2: Print preview sanity check**

```
mcp__Claude_Browser__navigate { url: "http://localhost:3002/course/recursion-backtracking/subsets" }
```
Open the browser's print preview (or use the page's own print stylesheet
via a screenshot after forcing print media, if the tool supports it —
otherwise inspect computed style on `.problem-layout-sandbox` at print
media and confirm `display: none` is applied).
Expected: no editor, no floating panel — continuous problem text, hints,
solution, variants, matching how this lesson printed before this plan.

- [ ] **Step 3: Confirm a second, structurally different problem lesson also works**

Pick one with `sequence` mode (a class-based sandbox, e.g.
`course/queues/queue-using-stacks.md`) to make sure the layout isn't
accidentally coupled to `return`-mode sandboxes specifically:

```
mcp__Claude_Browser__navigate { url: "http://localhost:3002/course/queues/queue-using-stacks" }
mcp__Claude_Browser__computer { action: "screenshot" }
```
Expected: same two-column layout, editor and results render normally.

- [ ] **Step 4: Final commit (only if any fixups were needed above)**

If every gate and every browser check already passed with no changes
needed, there is nothing to commit here — Task 5's commit is the last
one. If a fixup was required, commit it with a message describing what
Task 6's verification caught.
