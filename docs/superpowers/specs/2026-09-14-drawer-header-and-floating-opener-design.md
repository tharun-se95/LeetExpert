# Lessons drawer: header row and floating opener

**Date:** 2026-09-14
**Status:** approved by the owner in brainstorming, 2026-09-14.
**Replaces:** the "drawer tab" idiom — the close tab hanging off the rail and
the opener tab on the closed sheet's edge, with their concave fillets
(`.drawer-tab`), from `2026-09-13` work and CLAUDE.md §4 "The lessons drawer's
tabs are part of its sheet".
**Builds on:** `2026-09-14-app-header-and-grain-design.md` (uncommitted in the
main checkout; this work stays uncommitted too, owner's call).

---

## 1. Decisions (owner, 2026-09-14)

| Question | Decision |
| --- | --- |
| Where the close control lives | Inside the drawer's nav, in a header row: inside a module the row is "‹ {stage name}" (the existing back action) with ✕ at the right; at the top level the row holds only ✕. |
| The close tab and the fillets | Removed. No tab styles remain. |
| The opener | A round floating button at the viewport's bottom-left corner. |

## 2. Design

### 2.1 Header row (`CourseNavPanel`)

- `CourseNavPanel` takes an optional `onClose?: () => void`. `CourseNavTree`
  takes and forwards it; `Sidebar` passes its `onClose`. `MobileLessonsSheet`
  passes nothing and keeps its own "Lessons ✕" header, so the sheet never shows
  two close buttons.
- Level 2 (module): the existing back row ("‹ Foundations", `aria-label="Back to
  Foundations"`) and, when `onClose` is set, a close button share one row.
- Level 1 (modules): when `onClose` is set, a row holding only the close
  button; without it, no row.
- The row is `sticky top-0 z-10` inside the drawer's scroller (the `<nav>` in
  `CourseNavTree`), painted as grainy paper (`bg-background grain-paper`) so rows
  scrolling beneath do not show through, and it slides with its level like the
  rest of the panel. `position: sticky` resolves against the scroller; the
  slide's transform on an ancestor does not break it.
- Close button: `aria-label="Close lessons drawer"`, `X` icon,
  `cn(ROUND_CONTROL, "h-8 w-8")` from `layout/headerChrome.ts`, placed after the
  back button in source order.
- The back row's caret stays where it is, so the existing indent/guide-line
  tests keep measuring the same geometry.

### 2.2 Removals

- `Sidebar.tsx`: the absolute close tab and its comment.
- `globals.css`: `.drawer-tab::before/::after` rules and their comment; the
  fillet selectors leave the `--grain-veil` rule and the grain print rule, which
  go back to `.grain-paper` alone.
- `FloatingLessonsButton`: `sidebar-rail`, `drawer-tab`, `rounded-r-*`,
  `border-l-0`, `top-18`.
- `ProblemWorkspace` sub-header: the tab reservation `lg:py-3 lg:pl-12` and its
  comment; back to `px-2 py-1.5 sm:gap-3 sm:px-4 sm:py-2` (as before 124376a,
  still with no paper of its own).
- The rail keeps `[clip-path:inset(0_-3rem_0_0)]` (its shadow stays off the
  header; the right stays open for the shadow and the resize grip), and
  `AppShell` keeps its `rail.contains()` hit test (the resize grip's pill
  overhangs the rail's right edge by a few pixels).

### 2.3 Floating opener (`FloatingLessonsButton`)

- `fixed bottom-6 left-6 z-40 hidden h-11 w-11 lg:flex`, `ROUND_CONTROL`,
  `bg-background grain-paper shadow-elevation`, `List` icon,
  `aria-label="Open lessons drawer"`, `aria-controls="lessons-sidebar"`,
  `aria-expanded={false}`; hidden while the drawer is open (unchanged).
- Mirrors the coach launcher's `right-6` inset on the other side. z-40 keeps it
  above the hover edge strip (z-30), so hovering the button does not open the
  drawer by itself.

### 2.4 Dev badge

`next.config.ts`: `devIndicators: { position: "bottom-right" }`. Dev only; the
badge (≈36px tall at 20px from the bottom) ends below the coach launcher at
`bottom-20`, so it overlaps nothing.

## 3. Tests

- `courseNavPanel.test.tsx`:
  - with `onClose`, level 2 renders the back button and a "Close lessons drawer" button in one sticky row;
  - level 1 renders a sticky row holding only the close button;
  - without `onClose`, neither level renders a close button or an empty row.
- `sidebarChrome.test.ts`:
  - replace the close-tab and tab-idiom tests with: `Sidebar` passes `onClose` to `CourseNavTree`, which forwards it; `Sidebar` has no absolute close button;
  - no `.drawer-tab` rule remains in `globals.css` and no component uses `drawer-tab`;
  - the opener is round, `fixed bottom-6 left-6`, shadowed, above the edge strip, and returns `null` while open;
  - the problem sub-header reserves nothing (`lg:pl-*` and `lg:py-*` absent);
  - the rail clip, paper, hover and Esc tests stay.
- `paperGrain.test.ts`:
  - allowlist Header 1, Sidebar 1, FloatingLessonsButton 1, MobileLessonsSheet 1, CourseNavPanel 1;
  - the veil rule is `.grain-paper` alone;
  - the fillet test is removed.
- Every new or changed assertion seen failing first.

## 4. Browser verification (both themes, 1280px)

1. At level 1, scroll the drawer's module list: the ✕ row stays pinned, and rows pass under it without showing through.
2. At level 2, "‹ Foundations" and ✕ share the row. Back still works and returns focus to the module row.
3. ✕ closes the drawer, and the round opener appears bottom-left. Clicking it opens the drawer; hovering the left edge still opens it.
4. On the problem page, the sub-header is back to its compact band, and the opener sits clear of the IDE.
5. Mobile lessons sheet at 375px: one ✕ (the sheet's own), and the back row still works.

`tsc`, `lint`, `vitest` and `build` pass.

## 5. Doctrine (CLAUDE.md §4)

- Rewrite "The lessons drawer's tabs are part of its sheet" as the drawer header row plus the floating opener, per §2.
- In the grain bullet, replace "both drawer tabs and their mask-cut fillets" with the drawer's pinned header row and the floating opener.
