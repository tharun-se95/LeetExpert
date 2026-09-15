# Lesson reading page — design

**Date:** 2026-09-12
**Scope:** DSA concept and practice lessons (`web/src/components/course/LessonView.tsx`).
**Out of scope:** the Next.js course lesson page
(`app/courses/nextjs/[module]/[chapter]/[lesson]/page.tsx`) has its own layout
and does not use `LessonView`. It was listed here as a follow-up; the Next.js
course has since been disabled (`app/courses/nextjs/layout.tsx` 404s every
route), so there is nothing to follow up until that course is re-enabled.

## Problem

Lesson prose, tables and the quiz render directly on the `--background` desk.
Nothing frames the reading, and the column has no measure: at the widest
layout the article is 1128px, which at 19px Space Grotesk (measured 9.22px
average advance) is ~122 characters per line.

## Decision

Set the reading on a page — a sheet of `--elevated` paper on the desk —
following the doctrine already in `CLAUDE.md` ("white cards on a cool-gray
page").

### Layout

- One centred column holds, top to bottom: breadcrumb/eyebrow/title/meta,
  the interactive stage (if any), the reading page, prev/next. The "On this
  page" contents rail beside it was disabled on DSA lessons at the owner's
  request (2026-09-12), so the column centres on its own.
- **On the desk:** header, stage, prev/next. The stage stays a lifted card.
- **On the page (`.reading-page`):** markdown body, infographic, and the
  `afterMarkdown` slot (practice list + cheatsheet), plus any quiz authored as
  an inline fence.
- **Amended after implementation, on the owner's instruction:** the trailing
  lesson quiz moved OFF the page to the desk via a separate `afterPage` slot —
  an exercise about the reading, not part of it. `extractQuizFence` relocates
  only when a lesson has exactly one fence, so drill lessons (6 fences each in
  `math-for-dsa/math-drills.md`, `big-o/complexity-drills.md`) keep every quiz
  inline on the page.
- Page: `--elevated` fill, 1px `--border`, `--radius-lg`, `.shadow-elevation`.
- Measure: `--reading-measure: 54rem`, page padding `--reading-page-pad: 4rem`.
  The column (`.reading-column`) is `measure + 2 × pad`.
  - Characters per line, derived from the measured advance scaling with type
    size: 16px root / 19px prose ≈ 94; 15px root / 18px ≈ 93; 13px root /
    16.5px ≈ 88. A rem measure narrows with the laptop root steps, which is
    why it holds; a px measure would reach ~109 at the 13px step.
  - Started at 48rem/3rem (~83 characters); widened on the owner's call so the
    page uses the desk width instead of leaving it empty beside the contents
    rail. Past the classic 65–90 band at the top end, knowingly.
- The `border-t` above prev/next is removed — the page edge separates them.
- Below `sm` (40rem): the page is full-bleed (cancels the `px-4` gutter), no
  side border, no radius, no shadow — nothing beside it to cast onto.
- Print: no frame, fill, padding or shadow.

### Surfaces inside the page

The page is the brightest surface, so an in-flow card inside it must become a
well in the page instead of a lift off it.

- **Fill:** components pair `bg-elevated` with `in-[.reading-page]:bg-background`
  — explicit at the call site, no new token. (A `--card`/`--shadow-card` token
  was rejected: `--shadow-card` is a banned legacy name in
  `design-tokens.test.ts`, and remapping `--elevated` inside the page would make
  the page's own fill resolve to the remapped value.)
- **Shadow:** `.reading-page .shadow-elevation { box-shadow: none }` in
  `globals.css`. `.shadow-elevation` is unlayered, so a Tailwind `shadow-none`
  utility could never override it; the scope rule is the only correct place.
- Affected components (from a grep of everything that renders inside lesson
  content):
  - `Quiz` option buttons (unanswered and dimmed states). `Quiz` also renders
    outside a page — the problem Quiz tab (`ProblemLessonView` has no
    `.reading-page`) and, after the amendment above, the trailing lesson quiz on
    the desk — which is why the fill is a variant, not a replacement. It still
    applies to inline quiz fences, which render inside the page.
  - `Quiz` inline code chip: `bg-background` would vanish inside a grey option;
    it takes the prose inline-code accent tint, which reads on either surface.
  - `PatternCard` (cheatsheet, practice lessons).
  - `Scratchpad` header bar (rendered from `Markdown`). Found by the transitive
    test, not the initial grep — no DSA lesson uses a scratchpad fence today, so
    it is covered by the test but was not seen in the browser.
- Reached by the import walk but not an in-flow card on the page, pinned with
  a count so a new card in the same file still fails: `Mermaid.tsx` (its
  fullscreen dialog — not portaled, so the shadow scope rule excludes
  `[role="dialog"]`), `lib/course/problemDifficulty.ts` (only the problems-hub
  filter chip; reached via a sibling export `PracticeProblemsList` imports).
- The heading that opens the page carries no hairline and none of the
  hairline's spacing. This is not a reading-page rule:
  `.handbook-prose > h2:first-child:not(.chapter-heading)` (and the quiz's
  opening `.chapter-rule`) drop `border-top`, `padding-top` and `margin-top`
  for every prose body — problem tabs, reading pages, roadmap and callout
  bodies. Commit `8c9ec9d`, guarded by "the heading that opens a prose body
  carries no hairline". It replaced this spec's original patch,
  `.reading-page .handbook-prose > h2:first-child { margin-top: 0 }`, which
  fixed the stacked gap (81px above the first hairline against 45px sides)
  but still drew that hairline under the page's top edge, a divider with
  nothing above it. Measured after, at 1440px: first heading 0 margin,
  padding and border, 39px below the page edge; later headings keep their
  1px rule.
- Unaffected: table headers (`bg-surface`), code blocks (`bg-code-editor`),
  callouts (role surfaces), `.viz-stage` (transparent gradient), inline
  VizPlayer (stacks; the 34rem split is fullscreen-only). `ConceptMindMap`
  renders only on module pages, never inside a lesson.
- Ratios: page/well is `--elevated`/`--background` — 1.10 light, 1.24 dark,
  the same step as card/desk today; every ink already clears AA on
  `--background`.

## Tests (`web/tests/design-tokens.test.ts`)

1. `LessonView` renders exactly one `.reading-page`, carrying `.shadow-elevation`,
   and the `<Markdown>` sits inside it.
2. `.reading-page` fills with `--elevated`; `.reading-column` is capped by
   `--reading-measure`; `.reading-page .shadow-elevation` removes the shadow.
3. Components that render inside the page and paint an in-flow `bg-elevated`
   also carry `in-[.reading-page]:bg-background`.

Each test is shown to fail against a deliberate fault before it is trusted.

## Verification

`tsc`, `eslint`, `npm test`, `npm run build`; browser at 1440 / 768 / 375 in
both themes on a lesson with a stage, a lesson with a table + quiz, and a
practice lesson with the cheatsheet. If the dark page (`#26262a` at reading
scale) reads as muddy, that is raised as a palette decision, not patched with a
new token.
