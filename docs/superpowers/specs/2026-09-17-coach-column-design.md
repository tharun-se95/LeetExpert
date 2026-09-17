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
  and header, in the IDE's own pane language, and it collapses to a strip
  that still carries the mark and the unread dot.

## 2. Decisions (owner, 2026-09-17)

| Question | Decision |
| --- | --- |
| When | When the problem workspace (description + IDE, the measured row, not the viewport) can hold the description at its cap, an editor of at least `--ide-editor-min` (40rem) and a coach of at least `--coach-column-min` (20rem), plus the two handles. Otherwise the floating launcher and panel, unchanged. |
| Open/close | Always there, collapsible. Expanded by default; collapses to a strip; the choice is remembered. |
| Width | A drag handle between editor and coach, bounded by both minimums; the width is remembered in rem. Default `--coach-column-width` (26rem, the floating panel's width). |
| A failing run | Never expands a collapsed column. It sets the unread dot on the strip. |
| Escape | Does nothing in column mode: the column is layout, not a popover. |

Why workspace width: the lessons drawer docks in flow on problem pages and
narrows the workspace, so a 1920px screen with the drawer open can have less
room than a 1600px screen with it closed.

**Correction recorded during spec:** the design review mentioned a
"X failed — Coach has a diagnosis / Open coach" banner. It no longer exists
in the code (nothing renders `CoachFailBanner`). In column mode the strip's
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
- **Collapsed strip:** `w-12` (3rem, so its left hairline never squeezes the 44px
  button inside), same paper, `border-l border-border`,
  no handle (a fixed strip has nothing to resize). At its top, a 44px button
  with the coach mark, "Expand problem coach", `aria-expanded="false"`, and the
  unread dot plus "New diagnosis" for screen readers when unread.
- Focus: expanding from the strip focuses the composer, as an explicit open
  does today; collapsing returns focus to the strip button (the provider's
  existing close-focus path, with the strip registered as the launcher).

## 4. Threshold

`coachColumnFits` in `lib/coach/coachColumn.ts`, a pure function:

    workspace >= descriptionCap + editorMin + coachMin + 2 × handle

- `descriptionCap` is read from the description pane's computed `max-width`,
  so it follows the prose cap if that changes.
- `editorMin` and `coachMin` are the `--ide-editor-min` and `--coach-column-min`
  tokens, resolved against the root font size.
- The handle width comes from the rendered handle.

At the 15px root that is 542 + 600 + 300 + 7.5 ≈ 1450px of workspace. A
ResizeObserver on the workspace row re-evaluates it, so opening the drawer or
resizing the window switches mode live. The coach's own width is not in the
row being measured, so the switch cannot feed back into itself.

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
  - `resizable` (default `true`): `false` renders no handle and applies no
    size;
  - `storageKey`: persists a secondary size in rem and restores it.

  A secondary-sized drag is bounded by the secondary's CSS min/max width and
  by the primary's CSS min-width. The primary pane stays at the same place in
  the tree in every mode, so switching layout, collapsing or resizing never
  remounts the sandbox. A remount would wipe run results, a bug this project
  already fixed once.
- **`IdeWithCoach`:**
  - measures the workspace row (`data-problem-workspace`, added by
    `ProblemWorkspace`) and reports the layout;
  - renders `PanelSplit` with the sandbox as primary, and the column, the
    strip or nothing as secondary;
  - renders `CoachOverlay` only in floating layout.
- **`CoachPanel`:** variant `"column"`, with a header whose collapse control
  replaces ✕. It registers its composer for focus like the floating variant.
  It takes no dialog role and handles no Escape.
- **`CoachStrip`** (new): the collapsed strip button, registered as the launcher.

## 7. Tokens

In `:root`, beside `--problem-prose-scale`:
- `--ide-editor-min: 40rem`
- `--coach-column-min: 20rem`
- `--coach-column-width: 26rem`

`.coach-column` carries `min-width: var(--coach-column-min)`. `.ide-editor-pane`
carries `min-width: var(--ide-editor-min)`, applied only in column mode, where
the threshold guarantees it fits.

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
4. `coach-ui.test.ts`: the floating overlay only renders in floating layout;
   the strip and column controls carry their labels and `aria-expanded`.

Browser verification:
- Widths 1280, 1600 and 1920, drawer open and closed; mode matches the
  threshold.
- Run results survive a mode switch (drawer toggle) and a collapse.
- Drag limits and remembered width across reload.
- Keyboard: collapse, expand and focus return.
- Both themes, and no auto-expand on a failing run.
- `tsc`, lint, `npm test` and `npm run build` pass.
