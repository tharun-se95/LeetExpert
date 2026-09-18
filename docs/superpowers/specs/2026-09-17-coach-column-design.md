# Coach column on large screens — design

**Date:** 2026-09-17
**Status:** approved by the owner 2026-09-17 ("always there, collapsible";
"drag handle, remembered"; no auto-expand on a failing run; threshold on
workspace width).
**Amends:** `2026-08-30-coach-floating-panel-design.md`, which replaced the
coach rail with a floating panel. The floating panel stays below the
threshold defined here.

---

## 1. Why

On a problem page the floating coach covers the right of the editor and the
results tabs beneath it (owner screenshot, Rotate Array). Since the description
pane was capped at the prose measure (60ch of problem prose plus padding,
542px at the 15px root), a large workspace has width to spare, so the coach
can take a column instead of covering code.

The 2026-08-30 spec retired the old rail for two reasons, and this design
answers both:

- **It resized the editor every time it opened**, including when a failing
  run opened it automatically. The column is present by default; the editor
  changes width only when the learner collapses, expands or drags. A failing
  run never expands it.
- **It read as a bolted-on utility**, opened from a small text button in the
  sandbox toolbar. The column is a first-class pane with the coach's own mark
  and header, in the IDE's own pane language; collapsed, it hands back to the
  same launcher (and unread dot) the floating coach uses.

## 2. Decisions (owner, 2026-09-17)

| Question | Decision |
| --- | --- |
| When | When the problem workspace (description + IDE, the measured row, not the viewport) can hold the description at its cap, an editor of at least 80 code columns plus its gutter (`--ide-editor-columns: 86`, at the code size) and a coach of at least `--coach-column-min` (20rem), plus the two handles, judged at the browser's default text size (§4). Otherwise the floating launcher and panel, unchanged. |
| Open/close | Always there, collapsible. Expanded by default; the choice is remembered. Collapsed, the column leaves the layout (the editor takes the full width) and the coach's floating launcher, with its unread dot, brings it back. |
| Width | A drag handle between editor and coach, bounded by both minimums; the width is remembered in rem. Default `--coach-column-width` (26rem, the floating panel's width). |
| A failing run | Never expands a collapsed column. It sets the unread dot on the launcher. |
| Escape | Does nothing in column mode: the column is layout, not a popover. |

Why workspace width: the lessons drawer docks in flow on problem pages and
narrows the workspace, so a 1920px screen with the drawer open can have less
room than a 1600px screen with it closed.

**Correction recorded during spec:** the design review mentioned a
"X failed — Coach has a diagnosis / Open coach" banner. It no longer exists
in the code (nothing renders `CoachFailBanner`). In column mode the launcher's
unread dot is the only signal on a collapsed column. Bringing a banner back is
out of scope here.

## 3. Layout

- Three full-height columns: description │ editor (with its status bar and
  results rail) │ coach.
- The editor/coach seam is `PanelSplit`'s handle, the same grip as the
  description/editor seam.
- **Expanded column:** `CoachPanel` variant `"column"` on `--elevated` with the
  desk grain (`grain-paper`, like the description pane; AA already measured
  there), a hairline on its left via the handle, no shadow (the IDE's flush
  panes carry none). Its header is the coach mark and title, with a
  "Collapse problem coach" button (`aria-expanded="true"`) where the floating
  panel has ✕.
- **Collapsed:** the column leaves the layout and the editor takes the full
  width. The coach's floating launcher (bottom-right, with its unread dot)
  expands it again. A 3rem strip holding the mark at the right edge was built
  first and withdrawn the same day (owner, 2026-09-17: "it doesn't look
  good").
- Focus: expanding from the launcher focuses the composer, as an explicit open
  does today; collapsing returns focus to the launcher (the provider's existing
  close-focus path).

## 4. Threshold

`coachColumnFits` in `lib/coach/coachColumn.ts`, a pure function:

    workspace >= descriptionCap·k + editorMin + coachMin + 2·handle·k

The terms:

- `k = defaultRoot / currentRoot`.
- `editorMin` is 86 code columns at the code size (JetBrains Mono advances
  0.6em, measured) plus its 2rem line padding.
- `coachMin` is 20rem.
- The rem parts are all taken at the browser's default text size
  (`font-size: medium`).

**Revised during the browser check (2026-09-17).** Two inversions shaped
this. The app steps its root down on smaller screens (15px up to 1600px wide,
13px up to 1400px) while code type holds its size:

- **A 40rem editor floor** let a 1280px screen fit a column that 1440px did
  not. The floor is now counted in code columns.
- **Judging the fit at the current root** let 1600px fit a column that
  1608px, one root step up, did not. The fit is now judged at the default
  text size, where the need is one stable width. The default is never below
  the current root, so a column that fits there also fits as rendered.

`coachColumn.test.ts` sweeps every width from 1024 to 2560 through the real
steps parsed from `globals.css` and requires that a wider screen never lacks a
column a narrower one has.

At a 16px default this needs about 1640px of workspace: a 1680px or wider
screen with the drawer closed, or a 1920px screen with it closed. With the
drawer open (320px), a 1920×1080 screen floats. A ResizeObserver on the
workspace row re-evaluates, so opening the drawer or resizing switches the
mode live. The coach's own width is not in that row, so the switch cannot
feed back into itself.

## 5. State (`CoachProvider`)

- New `layout: "floating" | "column"` and `setLayout`, reported by `IdeWithCoach`.
- Two open states with their own persistence:
  - floating keeps `dsa:coach:rail-open` (default closed, unchanged);
  - column uses `dsa:coach:column-open` (default open).
- `open` in the context means "visible in the current layout".
- `setOpen`, `toggleCoach` and `closeCoach` act on the current layout's state.
- `reportRun` auto-opens on the session's first failure only in floating
  layout; it marks unread whenever the coach is not visible.

## 6. Components

- **`PanelSplit`** gains:
  - an optional `secondary`: `null` means the primary fills the row, with no
    handle;
  - `sizedPane: "primary" | "secondary"` (default `"primary"`, today's
    behaviour);
  - `storageKey`: persists a secondary size in rem and restores it.

  A secondary-sized drag is bounded by the secondary's CSS min/max width and
  by the primary's CSS min-width. The primary pane stays at the same place in
  the tree in every mode, so switching layout, collapsing or resizing never
  remounts the sandbox. A remount would wipe run results, a bug this project
  already fixed once.
- **`IdeWithCoach`:**
  - measures the workspace row (`data-problem-workspace`, added by
    `ProblemWorkspace`) and reports the layout;
  - renders `PanelSplit` with the sandbox as primary, and the expanded column
    or nothing as secondary;
  - always renders `CoachOverlay`, which shows the launcher whenever the coach
    is closed and the floating panel only in floating layout. It is never
    unmounted by a layout change: mounted fresh on a collapse, its launcher did
    not exist yet when focus returned to it (found in the browser check).
- **`CoachPanel`:** variant `"column"`, with a header whose collapse control
  replaces ✕. It registers its composer for focus like the floating variant.
  It takes no dialog role and handles no Escape.

## 7. Tokens

In `:root`, beside `--problem-prose-scale`:
- `--ide-editor-columns: 86` (80 code columns plus a 6-column line-number gutter)
- `--coach-column-min: 20rem`
- `--coach-column-width: 26rem`

`.coach-column` carries `min-width: var(--coach-column-min)`. `.ide-editor-pane`
carries `min-width: calc(var(--code-size) * 0.6 * var(--ide-editor-columns) + 2rem)`,
applied only in column mode, where the threshold guarantees it fits.

## 8. Tests (each seen failing before it passes)

1. `coachColumn.test.ts`: the threshold, just below and at the boundary, with
   tokens resolved from a root size.
2. `panelSplit.test.tsx`:
   - the primary keeps its state when the secondary appears, disappears or
     stops being resizable;
   - a secondary-sized drag is clamped by both minimums;
   - the width persists in rem and is restored.
3. `coachLayout.test.tsx` (provider):
   - in column layout the coach is open by default and a failing run neither
     opens a collapsed column nor stays unread on an open one;
   - collapse and expand persist;
   - floating layout still auto-opens on the first failure.
4. `coach-ui.test.ts`: the overlay renders unless the column is expanded, no
   strip component exists, and the collapse control carries its label and
   `aria-expanded`.

Browser verification:
- Widths 1280, 1600 and 1920, drawer open and closed; mode matches the
  threshold.
- Run results survive a mode switch (drawer toggle) and a collapse.
- Drag limits and remembered width across reload.
- Keyboard: collapse, expand and focus return.
- Both themes, and no auto-expand on a failing run.
- `tsc`, lint, `npm test` and `npm run build` pass.
