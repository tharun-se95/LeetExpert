# Drawer Header Row and Floating Opener Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The lessons drawer closes from a pinned header row inside its nav ("‹ {stage}" + ✕, or just ✕ at the top level). The edge tabs and their fillets go, and the opener becomes a round floating button at the bottom-left.

**Architecture:**
- `CourseNavPanel` takes an optional `onClose` and renders a `sticky top-0` grainy row carrying the close button.
- `CourseNavTree` forwards the prop, and only the desktop `Sidebar` passes it.
- `FloatingLessonsButton` becomes a `ROUND_CONTROL` fixed to the bottom-left.
- `.drawer-tab` CSS is deleted, and the grain veil rule becomes `.grain-paper` alone.

**Tech Stack:** Next.js 16.2 App Router, React 19.2, Tailwind v4, Vitest 4, Playwright MCP.

**Spec:** `docs/superpowers/specs/2026-09-14-drawer-header-and-floating-opener-design.md`

## Global Constraints

- Close button: `aria-label="Close lessons drawer"`. Opener: `aria-label="Open lessons drawer"`, hidden while open.
- The pinned row carries no `border-b`. `courseNavPanel.test.tsx` reads the first `border-b` div as the module heading.
- The mobile sheet passes no `onClose`, so its markup is unchanged.
- The rail keeps `[clip-path:inset(0_-3rem_0_0)]`. `AppShell` keeps `rail.contains()`, because the resize grip's pill overhangs the rail.
- `.grain-paper` call sites: Header 1, Sidebar 1, FloatingLessonsButton 1, MobileLessonsSheet 1, CourseNavPanel 1.
- Builds on uncommitted header/grain work. **No commits** (owner: leave uncommitted). Never `git stash`. Never run Prettier.
- Gate: `tsc`, `lint` (0 errors), `vitest`, `build`, and browser checks (spec §4).

---

### Task 1: Pinned header row with the close button

**Files:**
- Modify: `web/src/components/layout/CourseNavPanel.tsx`, `CourseNavTree.tsx`, `Sidebar.tsx`
- Test: `web/tests/courseNavPanel.test.tsx`, `web/tests/sidebarChrome.test.ts`

**Interfaces:**
- Produces: `CourseNavPanelProps.onClose?: () => void`
- Produces: `CourseNavTree({ compact?, className?, onClose? })`

- [ ] **Step 1: Failing tests.**
  - Append a `CourseNavPanel header row` describe to `courseNavPanel.test.tsx`:
    - with `onClose` at level 2, the back row and the close button share one `sticky top-0` row, back first and close before the first lesson link;
    - at level 1 the row holds only the close button, before "Overview";
    - the row is `bg-background grain-paper`;
    - without `onClose`, there is no close button and no `sticky`.
  - In `sidebarChrome.test.ts`:
    - read `CourseNavTree.tsx` and `CourseNavPanel.tsx`;
    - "always offers a close button" asserts `<CourseNavTree … onClose={onClose}`, the tree forwarding it, and the panel rendering the label;
    - replace the hanging, tab-look, flush and tab-order close-tab tests with "keeps the close button inside the drawer, not hanging off its edge" (no close label and no `-right-9` in `Sidebar`).
- [ ] **Step 2: Run** `npx vitest run tests/courseNavPanel.test.tsx tests/sidebarChrome.test.ts`. Expected: the new assertions FAIL.
- [ ] **Step 3: Implement.**
  - **`CourseNavPanel`:** import `X` and `ROUND_CONTROL`; add the prop; add `PinnedRow`:

```tsx
function PinnedRow({ children, onClose }: { children?: ReactNode; onClose: () => void }) {
  return (
    <div className="sticky top-0 z-10 flex items-center justify-end gap-2 bg-background grain-paper pt-3 pb-1">
      {children}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close lessons drawer"
        className={cn(ROUND_CONTROL, "h-8 w-8")}
      >
        <X className="h-4 w-4" weight="bold" />
      </button>
    </div>
  );
}
```

    - Level 2: the back button's classes become `cn("relative flex items-center rounded-[length:var(--radius-xs)] px-2 py-1 text-foreground transition-colors hover:bg-surface", onClose ? "min-w-0 flex-1" : "mb-1 w-full")`, wrapped in `PinnedRow` when `onClose` is set.
    - Level 1: `{onClose ? <PinnedRow onClose={onClose} /> : null}` before the Overview link.
  - **`CourseNavTree`:** add `onClose?: () => void` and pass `onClose={onClose}` to the panel.
  - **`Sidebar`:**
    - delete the `{open ? (<button … Close lessons drawer …/>) : null}` block and its comment;
    - render `<CourseNavTree compact onClose={onClose} className="px-5 pb-6" />` (the row supplies `pt-3`);
    - rewrite the rail comment lines that mention the hanging close button/tab. The aside doesn't clip because the resize grip's pill overhangs its right edge.
- [ ] **Step 4: Run** the same command plus `npx tsc --noEmit`. Expected: PASS.

### Task 2: Floating opener, tab CSS removal, problem header, dev badge

**Files:**
- Modify: `web/src/components/layout/FloatingLessonsButton.tsx`, `web/src/app/globals.css`, `web/src/components/problems/ProblemWorkspace.tsx`, `web/src/components/layout/AppShell.tsx` (comments only), `web/next.config.ts`
- Test: `web/tests/sidebarChrome.test.ts`, `web/tests/paperGrain.test.ts`

- [ ] **Step 1: Failing tests.**
  - **`sidebarChrome.test.ts`:**
    - the rail-clip test drops its tab-width check;
    - the `drawer tab idiom` describe keeps "paints the rail in the app header's own paper" and replaces the rest with a `floating opener` describe:
      - "is a round floating button in the bottom-left corner, not a tab": `cn(ROUND_CONTROL, "…fixed bottom-6 left-6 … bg-background grain-paper shadow-elevation lg:flex")`, and no `drawer-tab`, `sidebar-rail`, `rounded-r-` or `border-l-0`;
      - "floats above the hover edge strip": opener z > strip z;
      - "leaves no drawer tab styles behind": no `.drawer-tab` in globals, none in Sidebar or the opener;
    - `problem page drawer tab` is renamed `problem page drawer opener`: keep the first two tests, and replace the reservation and height tests with "reserves no room for a tab" (no `lg:pl-*` or `lg:py-*`; `sm:py-2` present).
  - **`paperGrain.test.ts`:**
    - the veil regex is read from `body(".grain-paper")`;
    - the fillet test is removed;
    - the print test is `@media print { .grain-paper { background-image: none; } }` with no ordering clause;
    - the allowlist adds `CourseNavPanel.tsx: 1` and sets `Sidebar.tsx: 1`;
    - "tells the drawer's surfaces…" checks `Sidebar` only.
- [ ] **Step 2: Run** `npx vitest run tests/sidebarChrome.test.ts tests/paperGrain.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement.**
  - **`FloatingLessonsButton`:** `className={cn(ROUND_CONTROL, "fixed bottom-6 left-6 z-40 hidden h-11 w-11 bg-background grain-paper shadow-elevation lg:flex")}`, `List` icon `h-5 w-5`, and a rewritten doc comment.
  - **`globals.css`:**
    - merge the `--grain-veil` declaration into the one `.grain-paper` rule;
    - move the print rule to `@media print { .grain-paper { background-image: none; } }` right after it;
    - delete the `.drawer-tab` comment and the `::before`/`::after` rules;
    - update the grain and `.sidebar-rail` comments.
  - **`ProblemWorkspace`:** remove ` lg:py-3 lg:pl-12` and the reservation paragraph of the comment.
  - **`AppShell`:** the opener comment says round floating button, bottom-left; the `rail.contains` comment names the resize grip.
  - **`next.config.ts`:** add `devIndicators: { position: "bottom-right" }` with a one-line why.
- [ ] **Step 4: Run** the suites, `tsc`, `lint`. Expected: PASS, 0 lint errors.

### Task 3: Doctrine and verification

- [ ] **CLAUDE.md §4:** replace the "lessons drawer's tabs are part of its sheet" bullet with the header-row + floating-opener bullet. In the grain bullet, replace "both drawer tabs" with "its pinned header row, the floating opener".
- [ ] **Gate:** full `npx vitest run`, `npx tsc --noEmit`, `npm run lint`, `npm run build`.
- [ ] **Browser checks** (both themes, 1280px, spec §4 items 1–5): Playwright checks and screenshots of the pinned row while scrolling, level 2 back plus focus return, close and reopen, hover-open, the problem page, and the mobile sheet at 375px.
- [ ] **Report.** Leave everything uncommitted.
