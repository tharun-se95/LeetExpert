# Coach floating panel — design

## Problem

The Coach is currently a drawer: opening it resizes the code editor via a
`PanelSplit` secondary pane, and it's toggled from a small text button buried
in the sandbox toolbar. This reads as a bolted-on utility panel, not the
premium, differentiated feature it's meant to be. This spec redesigns Coach
as a floating chat widget — a launcher button plus an overlay panel that sits
on top of the workspace instead of sharing its layout — and specifies the
visual/interaction polish needed for it to read as a first-class, deliberately
designed feature rather than a mediocre add-on.

Scope is desktop only. Mobile's full-screen "Coach" tab is unchanged — a
floating panel doesn't have room to float on a phone, and a full-screen
surface is already the native mobile chat pattern.

## Current architecture (for reference)

- `CoachProvider` (`web/src/components/coach/CoachProvider.tsx`) owns all
  state: thread, diagnosis, `railOpen`, unread flag, focus-on-explicit-open
  logic, chat networking.
- `IdeWithCoach` wraps the sandbox in a `PanelSplit` whose secondary pane is
  `CoachRail` when `railOpen`, using `PanelSplit`'s `secondaryCollapsed` prop
  to avoid remounting the sandbox subtree when the rail toggles.
- `CoachRail` renders variant `"rail"` (desktop, bordered panel with its own
  header/close button) or `"page"` (mobile, inside the workspace tab strip).
- Sandbox's own toolbar has a small "Coach" text button that calls
  `coach.toggleCoach()`; `CoachFailBanner` inside the results area surfaces
  "X failed — Coach has a diagnosis" with an "Open coach" button, hiding
  itself once the rail/panel is already open.
- `PanelSplit`'s `secondaryCollapsed` prop exists solely to let `IdeWithCoach`
  close the coach pane without switching which element type wraps the
  sandbox at that JSX position (switching types would remount the sandbox
  subtree and wipe run results — a real bug fixed earlier in this project).

## Target architecture

`IdeWithCoach` no longer uses `PanelSplit` at all — the sandbox renders at
full width, and a launcher button + floating panel render as portaled
overlays alongside it:

```tsx
export function IdeWithCoach({ sandbox }: { sandbox: ReactNode }) {
  return (
    <div className="relative h-full min-h-0 min-w-0 overflow-hidden">
      {sandbox}
      <CoachLauncher />
      <CoachPanel variant="floating" />
    </div>
  );
}
```

`CoachLauncher` and `CoachPanel` (floating variant) each render their actual
DOM into `document.body` via `createPortal`, rather than relying on
`position: fixed` at their JSX position. This is necessary, not defensive:
`PageEnter` (`web/src/components/layout/PageEnter.tsx`) wraps route content
in a Framer Motion `motion.div`, which leaves an inline `transform` on the
element. A `transform` on an ancestor makes it the containing block for any
`position: fixed` descendant — the descendant becomes fixed relative to that
ancestor's box, not the true viewport. Portaling to `document.body` (which
has no transform ancestor) avoids depending on that always staying true.

### Renames

The component and state are renamed to match what they now are:

- `CoachRail.tsx` → `CoachPanel.tsx`; the `variant` prop's `"rail"` value
  becomes `"floating"` (`"page"` is unchanged).
- `CoachProvider`'s `railOpen` / `setRailOpen` → `open` / `setOpen`.
- Internal comments referencing "the rail" are updated to "the panel" where
  they still apply, and removed where they described rail-specific mechanics
  that no longer exist (e.g. the remount-avoidance comment in
  `IdeWithCoach`, which no longer applies once `PanelSplit` is gone from this
  path).

### Cleanup

`PanelSplit`'s `secondaryCollapsed` prop was added specifically for the old
`IdeWithCoach`/rail remount-avoidance problem. Once `IdeWithCoach` stops
using `PanelSplit`, it has no remaining callers (`ProblemWorkspace`'s
top-level description/editor split always renders both panes) and is removed
from `PanelSplit.tsx` along with its associated conditional rendering, rather
than left as unused capability.

## Desktop interaction design

**Launcher.** A circular button, 56px (`h-14 w-14`), fixed bottom-right of
the IDE viewport (portaled, so "viewport" here is the real browser viewport).
`bg-pop` / `text-on-pop` fill with the same `ChatCircle` mark used in the
current masthead, `shadow-elevation`. Visible whenever the panel is closed;
hidden while it's open (matching the existing `FloatingLessonsButton`
show/hide convention). An unread diagnosis renders as a small dot,
`bg-bad` with a `ring-2 ring-background` cutout — a fixed notification color
independent of the per-topic family accent, so it can't blend into
`bg-pop` under some family's particular hue and stop being legible as "new."

**Panel.** Fixed footprint, roughly 420×640px (`max-h` clamped to viewport
height so it can't overflow above the top of the screen on short viewports),
anchored bottom-right with a small offset above where the launcher sits.
`rounded-[length:var(--radius-lg)]` (20px — softer than the rail's sharp
rectangle, appropriate for a fully-detached floating surface) and
`shadow-elevation` (all-around lift, per the existing elevation-shadow rule:
edge-shadow is for panels attached on one side to visible content, and this
panel is attached on none).

**Motion.** `AnimatePresence` + `motion.div`, scale 0.95→1 and translateY
8px→0 with opacity 0→1, transform-origin bottom-right, 200ms at `--ease`
(`cubic-bezier(0.2, 0, 0, 1)`) — the same idiom already used by
`MobileLessonsSheet`, gated by `useReducedMotion()` (skip the transform
entirely, keep the opacity fade only, when reduced motion is requested).

**No backdrop, no click-outside-to-close.** The primary workflow is "read
the coach's note, then click back into the code to act on it" — a widget
that dismisses itself on that exact click would undermine its own purpose.
Escape still closes it, matching today's rail behavior.

**Focus.** Opening explicitly (launcher click, or `CoachFailBanner`'s "Open
coach") focuses the composer textarea, reusing the existing `focusRequest`
counter mechanism unchanged — the auto-open on a learner's first failing run
still must not steal focus. Closing (Escape, or the panel's own close
button) returns focus to the launcher button. This focus-return is new: the
rail never needed it since it was part of page layout, not a disclosure
widget, but a floating panel without it is a keyboard dead end.

**Accessibility role.** `role="dialog"`, `aria-label="Problem coach"`, no
`aria-modal` and no focus trap — the panel is explicitly non-modal, since the
whole point is that the editor stays interactive while it's open.

## Visual polish

No new design tokens. `--radius-lg`, `--shadow-elevation`, and `--dur`
(250ms) / `--ease` already cover everything this needs — confirming the
"stay on-token" direction is achievable without adding new visual primitives.
Concrete changes within the existing system:

- Header: larger mark icon, tighter title/subtitle spacing — more confident
  now that it isn't fighting a narrow rail width.
- Message thread: unchanged. The visual language (user bubbles on
  `bg-surface`, assistant replies as undecorated prose with the mark avatar,
  diagnosis cards as a left-rule note) is already right, and the floating
  panel at 26rem is only marginally wider than the rail it replaces (the
  rail took 38% of the IDE column, ≈24rem at a 1440px viewport), so there is
  no "now it has room" justification for resizing anything here. Changing it
  would be churn.
- Composer: input pill goes fully rounded (`rounded-full`) to match the
  panel's own softer corner radius, rather than the rail's `radius-md`
  rectangle.
- `CoachFailBanner`: unchanged behavior, its "Open coach" button now opens
  the floating panel; still hides itself once the panel is already open.

## Testing / validation

- `npx tsc --noEmit`, `npx eslint src` clean.
- Full `npm test` — in particular confirming nothing else depended on
  `PanelSplit`'s `secondaryCollapsed` prop before removing it (verified
  during design: no other callers exist).
- `npm run build`.
- Live browser verification (both themes, `prefers-reduced-motion`):
  - Launcher ↔ panel swap; unread dot appears on a failing run, clears when
    opened.
  - Panel is genuinely fixed to the true viewport, not clipped or
    mis-positioned by `PageEnter`'s transform — this is the specific risk
    the portal exists to prevent, so it gets an explicit check rather than
    just trusting the reasoning.
  - Escape closes the panel and returns focus to the launcher.
  - Auto-open on first failing run does not steal focus (existing guarantee,
    reconfirmed after the rename).
  - Panel doesn't collide with another *floating* element at the
    bottom-right of the IDE viewport at various widths ≥1024px
    (`FloatingLessonsButton` is top-left and already hidden on IDE routes, so
    there's no other fixed-position UI to conflict with). Covering the
    sandbox's own controls or results rail underneath it is expected — that's
    how a floating overlay is supposed to behave — not something to avoid.
