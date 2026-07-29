# Problem Lesson Split Layout

**Date:** 2026-07-30
**Scope:** A dedicated split-pane layout for `type: problem` lessons — the
markdown extraction it depends on, the responsive grid, and the content-test
invariants that keep the split correct. Concept lessons are untouched.

## Problem

Every problem lesson today renders through the same single-column template
as concept lessons: Problem → Examples → Constraints → "Attempt it first" →
the sandbox, embedded inline mid-scroll → Hints → Brute force → Insight →
Solution → Variants → Quiz. The editor is one component among many in a long
article, not the focus of the page, and scrolling past it to read a hint
loses it entirely. There is no layout that keeps the editor in view while
reading — the thing "focused on problems" is actually asking for.

## Approach

### Splitting the markdown

The sandbox is currently one node inline in the parsed markdown tree — a
` ```sandbox ` fence dispatched to `<Sandbox>` by `Markdown.tsx`'s `pre()`
handler, indistinguishable from any other fence. To move it into its own
pane without a second markdown parser or hand-rolled fence-matching regex,
`extractSandboxFence` does a real parse (the same `unified`/`remark-parse`/
`remark-gfm` stack `highlightBlocks.ts` already uses) and reads the fence
node's exact source offsets:

```ts
export interface SandboxExtraction {
  beforeSandbox: string;   // Problem / Examples / Constraints / "Attempt it first"
  sandboxSource: string;   // the fence's raw JSON body
  afterSandbox: string;    // Hints, Brute force, Insight, Solution, Variants, Quiz
}

export function extractSandboxFence(markdown: string): SandboxExtraction | null {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown);
  const node = tree.children.find(
    (c): c is Code => c.type === "code" && c.lang === "sandbox",
  );
  if (!node?.position) return null;
  const { start, end } = node.position;
  return {
    beforeSandbox: markdown.slice(0, start.offset!),
    sandboxSource: node.value,
    afterSandbox: markdown.slice(end.offset!),
  };
}
```

It scans `tree.children` — the root's direct children only. A `reveal`/
`aside`/`tabs` fence's body is stored as an opaque string on a leaf node,
never as nested AST children, so this scan cannot reach inside one; there is
no recursion flag to get wrong. `loadLesson` calls it once per lesson at
build time (all 191 pages are statically generated), alongside the existing
`highlightBlocks(trimmed)` call over the *original* full markdown, which is
unaffected since its lookup keys are content-keyed, not position-keyed.

Returning three pieces rather than one pre-joined `bodyMarkdown` matters:
it's what lets the mobile layout put the editor back in its original
textual position (§ Layout) instead of always showing it first or last.

Verified against all 116 problem lessons before committing to this design:
exactly one sandbox fence per lesson, none nested inside a `reveal`/`aside`/
`tabs` block, and no lesson has a heading whose text is duplicated across
the before/after split (relevant because `beforeSandbox`/`afterSandbox`
render as two independent `<Markdown>` instances, each running its own
`rehype-slug` pass — a collision would mean two elements with the same `id`
on one page).

### Layout

`ProblemLessonView` renders three fixed DOM nodes — `before`, `sandbox`
(the existing `TableOfContents` component, unmodified, stacked above
`<Sandbox>`), `after` — and
repositions them per breakpoint with CSS Grid `grid-template-areas`,
mobile-first:

```css
.problem-layout {
  display: grid;
  grid-template-areas: "before" "sandbox" "after";
}
@media (min-width: 1280px) { /* xl: — the breakpoint today's TOC already uses */
  .problem-layout {
    grid-template-columns: 1fr 24rem;
    grid-template-areas: "before sandbox" "after sandbox";
  }
}
```

This is the standard technique for reflowing a fixed set of DOM nodes per
breakpoint without duplicating them. `<Sandbox>` mounts exactly once —
rendering a second, CSS-hidden copy for mobile would double-mount
CodeMirror, the draft-restoration effect, and (for Python) a second Pyodide
worker. DOM order stays `before → sandbox → after` at every breakpoint; only
the visual position changes, so keyboard and screen-reader reading order
matches the visual order on both mobile and desktop.

At `xl:`, the `sandbox` area gets
`xl:sticky xl:top-24 xl:self-start xl:max-h-[calc(100vh-7rem)] xl:overflow-y-auto`
— the same sticky pattern `TableOfContents` already uses today, widened to
hold it and the editor stacked together. Below `xl:`, none of that
applies; the area is a plain stacked block, identical in behavior to
today's page. A thin `xl:border-l xl:border-border` separates the two
columns at desktop width, matching the weight of existing dividers
elsewhere in the app.

Only `ProblemLessonView` gets a wider container (`max-w-7xl`, vs. concept
lessons' unchanged `max-w-6xl`). Left-column readability doesn't need
separate handling: `.handbook-prose` already caps at `68ch` regardless of
container width. The right column starts at `24rem`; that number is a
starting point to confirm against a real rendered page in the browser
during implementation, not a value locked in here without having seen it
render.

### Components

| Unit | Responsibility | Depends on |
| --- | --- | --- |
| `lib/content/extractSandboxFence.ts` | Pure fn: splits markdown at the sandbox fence via AST offsets | `unified`/`remark-parse` (existing deps) |
| `components/course/ProblemLessonView.tsx` | The split/stacked layout | `Markdown`, `TableOfContents`, `Sandbox` |

**Modified:**

- `lib/course/load.ts` — `LoadedLesson` gains `sandbox: SandboxExtraction | null`.
- `app/course/[module]/[lesson]/page.tsx` — renders `ProblemLessonView` when
  `lesson.sandbox` is non-null, else the existing `LessonView` (concept
  lessons' path is untouched).
- `components/md/Markdown.tsx` — the `language-sandbox` branch in `pre()` is
  **deleted**, not kept as a fallback. It has exactly one caller in the
  whole codebase (`LessonView.tsx`, plus its own two recursive calls for
  `Reveal`/`MarginNote`); once every problem lesson renders through
  `ProblemLessonView`, that branch never fires again. Keeping it "just in
  case" would mean a future lesson author who nests a sandbox inside a
  reveal gets a silently wrong page (the editor renders hidden inside a
  collapsed hint) instead of an immediate, loud test failure.
- `web/tests/content.test.ts` — three new invariants, so the assumptions
  above are guaranteed permanently rather than true only as of this writing:
  1. Every `type: problem` lesson has **exactly one** sandbox fence
     (tightening today's "at least one" coverage gate).
  2. No sandbox fence is nested inside a `reveal`/`aside`/`tabs` fence, in
     any lesson.
  3. No `type: problem` lesson has a heading whose text appears on both
     sides of its sandbox fence.

`Sandbox.tsx` itself is unchanged in this phase — `ProblemLessonView` calls
it exactly as `Markdown.tsx` does today, `<Sandbox source={sandboxSource} />`.

## Deferred to a follow-up spec

Solved-state persistence (`lib/progress/solvedStorage.ts`, `Sandbox` gaining
`lessonId`/`onSolved` props, a `SolvedBadge` on the module list, the
"Solved" pill in this page's header) is out of scope here. This spec ships
the layout with no solved-state indicator anywhere; that lands as its own
spec once this is in place, since it depends on `ProblemLessonView` already
existing as the render target.

## Verification

- Unit tests for `extractSandboxFence`: a markdown fixture with a sandbox
  fence and surrounding text produces the exact expected three-way split,
  including the no-fence (concept lesson) case returning `null`.
- The three new content-test invariants pass against all 116 problem
  lessons, and a deliberate sabotage (a second sandbox fence, a sandbox
  nested inside a reveal, a duplicated heading across the split) fails each
  one individually.
- Manual/browser verification: layout at `xl:` and below, resized and
  screenshotted; sticky behavior scrolling a genuinely long lesson; DOM
  order confirmed identical to visual order at both breakpoints (tab order,
  screen-reader landmark order); a print preview shows continuous text with
  no editor or floating panel, matching today's concept-lesson printing.
- `tsc`, `eslint`, `npm test`, `npm run build` all pass; behavior confirmed
  in the browser, not just by a green typecheck.
