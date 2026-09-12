# Two-level course nav — design

**Date:** 2026-09-12
**Status:** draft — awaiting owner review
**Supersedes (partial):** the inline expand/collapse tree in
`web/src/components/layout/CourseNavTree.tsx`. Nav data (`buildCourseNav`,
`buildNextjsCourseNav`), progress, and both hosts (desktop drawer, mobile
sheet) are unchanged.

---

## 1. Why

The nav shows all 24 modules and, for one of them, its lessons inline. The
open module's lessons push every later module down, so the list a reader
scrolls is part module index and part lesson list. A drill-down separates the
two: pick a module, then work inside it.

## 2. The two levels

### Level 1 — modules

Unchanged from today except the chevron: stage headings (Foundations, Linear
Structures, …) with one row per module carrying number, short title and
progress (`2/5`), and `soon` for `status: "coming-soon"`. The row is a
`Link` to the module's `href`. A right caret at the row's end signals that
following it drills in. **Stage headings stay** — they are the only grouping
the reader has.

### Level 2 — one module

1. A back row: `←  All modules`.
2. A module header: number, full `title`, and progress `2/5`.
3. The module's lessons, each with its completion dot, then its `extras`
   (e.g. Concept map), exactly as the open branch renders them today.

No stage headings, no other module.

## 3. Which level is showing

Level is derived, not stored:

- **From the route.** If the pathname matches a module page, one of its
  lessons, or one of its extras, the nav opens at that module's level 2.
  Otherwise level 1. This is today's `activeModuleSlug` logic, which already
  handles all three cases.
- **Back is an override.** Pressing back shows level 1 without navigating, so
  a reader can browse other modules while staying on the page they are
  reading. The override is dropped on the next pathname change, so following
  any lesson link returns the nav to route-derived behaviour.

Back does **not** link to the hub: browsing would then cost a page load on
every peek.

## 4. Component split

`CourseNavTree.tsx` currently mixes routing hooks, progress context, level
state and markup, which is also why it has no render test today.

- **`web/src/lib/course/navLevel.ts` (new, pure).**
  - `activeModuleSlug(stages, pathname): string | null` — moved verbatim from
    the component.
  - `resolveNavView({ stages, pathname, backToModules }): NavView` where
    `NavView = { level: "modules" } | { level: "module"; module: CourseNavModule }`.
    `backToModules` is the override from §3.
  - A module with **no lessons** never resolves to level 2: following it just
    navigates, and the nav stays on level 1 rather than showing an empty
    pane.
- **`CourseNavPanel` (new, presentational).** Takes `nav`, `pathname`,
  `view`, `visited`, `compact`, `curriculumHref` and `onBack`. No hooks, no
  context — so it renders under `renderToStaticMarkup` in tests without
  mocking `next/navigation` or wrapping a provider.
- **`CourseNavTree` (kept, stateful).** Owns `usePathname`, `useProgress`,
  the override state and the animation, and renders `CourseNavPanel`. Its
  public props (`compact`, `className`) do not change, so `Sidebar.tsx:139`
  and `MobileLessonsSheet.tsx:127` are untouched.

## 5. Motion

`motion/react` with `useReducedMotion`, matching `PageEnter.tsx` and
`MobileLessonsSheet.tsx` (already a dependency, `motion@^12.42.2`).

- Levels cross-slide: the outgoing level leaves to the left when drilling in
  and to the right when going back, with the incoming level entering from the
  opposite side, plus a fade.
- `duration: 0.22`, `ease: [0.2, 0, 0, 1]` — the same curve as the sheet and
  the `--ease` token.
- `AnimatePresence mode="wait"`, so the panel's scroll height never holds two
  levels at once.
- Under `prefers-reduced-motion`, `useReducedMotion()` returns true and the
  panel renders with no `motion` wrapper at all, as `PageEnter` does.
- The nav scroll container resets to `scrollTop = 0` when the level changes:
  landing mid-list in a fresh level is disorienting.

## 6. Accessibility

- The back control is a `<button>` (it changes nothing in the URL); module
  and lesson rows stay `Link`s, so middle-click and open-in-new-tab keep
  working.
- `aria-current="page"` on the active lesson, module or extra row. Today
  active state is colour only.
- The level-2 module header is an `<h2>`, and the `<nav aria-label="Course">`
  wrapper stays.
- After pressing back, focus moves to the "All modules" link, so keyboard
  focus isn't dropped to `<body>` when the back button unmounts.
- Decorative carets and dots keep `aria-hidden`.
- Mobile keeps its `min-h-11` rows (`compact={false}`); the back row and
  module header follow the same sizing switch.

## 7. Tests

Each new test is seen failing before it is trusted (`CLAUDE.md` §2).

1. **`navLevel.test.ts`** — `resolveNavView` returns level 2 for a module
   page, a lesson under it, and an extra under it; level 1 for the hub and
   for an unrelated path; level 1 when `backToModules` is set; and level 1
   for a module with no lessons. `activeModuleSlug`'s existing behaviour is
   pinned here too.
2. **`courseNavPanel.test.tsx`** — renders `CourseNavPanel` with
   `buildCourseNav()`:
   - level 1 lists every stage heading and module, and no lesson titles;
   - level 2 lists only the active module's lessons plus its extras, with the
     back row and the module header, and no other module's title;
   - the active lesson row carries `aria-current="page"`;
   - a `coming-soon` module still renders its `soon` marker at level 1.
3. **Guard** — `CourseNavTree` renders exactly one `<nav aria-label="Course">`
   and still exports the same props (`Sidebar` / `MobileLessonsSheet` call
   sites unchanged).

`tsc`, `eslint`, `npm test` and `npm run build` must pass.

## 8. Browser verification (both themes; desktop and 375px)

- Desktop drawer: drill in, back, drill into another module.
- Mobile sheet (`compact={false}`): the same, with tap targets ≥44px.
- Deep link straight to a lesson URL: nav opens at that module's level 2.
- In-lesson prev/next across a module boundary: the nav follows to the new
  module.
- Back, then read on: level 1 stays until the next navigation.
- Course hub and a problem page (the drawer is hidden on IDE routes).
- The Next.js course's aliased modules (module `href` equals its first
  lesson's `href`) still resolve to level 2 — verified with the course gate
  lifted locally, since `/courses/nextjs` 404s by design.
- `prefers-reduced-motion: reduce` emulated: levels swap with no animation.

## 9. Rejected alternatives

- **Drill-in without navigating** (row becomes a button): the row stops being
  a link, losing middle-click and open-in-new-tab.
- **Split row** (title navigates, caret drills in): two targets per row, a
  smaller tap area on mobile.
- **Back as a link to the hub**: every peek at the module list costs a page
  load.
- **Persisting the level in `localStorage`**: state that outlives the route
  it describes, for no gain — the route already says where the reader is.
- **Flat module list without stage headings**: the owner kept the stages.

## 10. Out of scope

- Nav data, progress tracking, and the problem workspace's own tabs.
- Search, the article's breadcrumbs, and the on-this-page rail.
- Sidebar width, drag handle, and open/close behaviour.
