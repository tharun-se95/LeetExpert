# Viz family theming and motif backgrounds

**Date:** 2026-08-01
**Status:** approved, implementing
**Scope:** the 16 lesson tracer components in `web/src/components/viz/vizzes/` and
their shared chrome (`VizPlayer`, `pieces.tsx`, `CodePanel`). Not in scope:
which lessons get a visual (the "visualisation triage" HANDOFF.md already
flags as blocked on the course author) — this is about how the vizzes that
already exist look, not adding coverage.

---

## Problem

Every tracer renders in the same generic indigo (`--accent`/`--pop`)
regardless of what it's teaching — a linked-list reversal and a binary
search look identical except for the data. A 7-family accent + motif
system already exists (`web/src/lib/visual/familyTheme.ts`) but is only
consumed by three unrelated explorer components (`PatternLab`,
`BigOObservatory`, `DecisionObservatory`) — never by the actual lesson
tracers. The CSS layer even has the fallback already wired
(`var(--family-accent, var(--accent))` in `.lab-stage`/`.poster-roof`) and
has sat unused by vizzes since it was written.

---

## Family assignment

One family per **viz component** (not per lesson) — the viz embodies the
concept wherever it's reused. Lives as a new `family` field alongside each
entry in `registry.ts`.

| Family | Accent | Motif | Vizzes |
|---|---|---|---|
| Pointer movement | `#C45C26` | cursors | `converging-pointers`, `sliding-window`, `dynamic-window`, `fast-slow`, `write-pointer`, `cyclic-rotate`, `block-reversal` |
| Linear traversal | `#0A7A6A` | tiles | `kadane`, `prefix-sum`, `dynamic-array-growth` |
| Ordering & search | `#2F6FED` | ruler | `binary-search` |
| Recursive exploration | `#6B4CE6` | tree | `fib-call-tree` |
| State transition | `#C9A227` | switchboard | `monotonic-stack`, `ring-buffer` |
| Relationships | `#1F9D8A` | constellation | `list-reversal`, `hash-buckets` |
| Priority structures | `#E11D48` | podium | *(none yet — reserved for a future heap tracer)* |

---

## Contrast finding — the active cell can't just inherit white text

`Cell`'s `active` tone is a **solid fill** (not a translucent wash), which
means the family accent has to work as a real background with real text on
top of it — unlike the callout surfaces from the earlier palette pass,
where opacity did the softening. Computed white-text contrast against each
family accent (WCAG relative luminance, not eyeballed):

| Family accent | White-text contrast | AA? |
|---|---|---|
| `#C45C26` pointer movement | 4.28:1 | large-text pass |
| `#0A7A6A` linear traversal | 5.24:1 | pass |
| `#2F6FED` ordering & search | 4.55:1 | pass |
| `#6B4CE6` recursive exploration | 5.52:1 | pass |
| `#C9A227` state transition | **2.42:1** | **fail** |
| `#1F9D8A` relationships | 3.36:1 | large-text only, marginal |
| `#E11D48` priority structures | 4.70:1 | pass |

State transition's gold fails outright as white-on-fill; relationships is
too marginal to trust. Fix: `familyTheme.ts` gains a computed `onAccent`
field per family — `#ffffff` for the five that pass comfortably, a fixed
dark ink (`#111827`, mode-invariant since the fill itself doesn't change
between light/dark) for state-transition and relationships. Verified:
`#111827` on `#C9A227` is 7.33:1, on `#1F9D8A` is 5.28:1. `familyCssVars()`
emits this as `--family-on-accent`; `Cell`'s active tone reads it instead
of the hardcoded `text-on-pop`.

---

## Wiring

- `VizPlayer` gains an optional `family?: FamilyId` prop. When set, it
  applies `familyCssVars(family)` (now including `--family-on-accent`) as
  inline style on its root, and sets `data-motif={getFamilyTheme(family).motif}`
  on the `.viz-stage` element. Omitted `family` → no vars set → every
  consumer's existing `var(--family-accent, var(--accent))` fallback keeps
  today's indigo behavior, so nothing breaks for an unassigned viz.
- `Cell` (`pieces.tsx`): `active` and `kept` tones move from hardcoded
  `border-pop bg-pop text-on-pop` / `border-accent bg-accent/14` to
  `border-[var(--family-accent,var(--accent))]`, same for `bg-`, and active
  text becomes `text-[var(--family-on-accent,var(--on-pop))]`. `dropped`
  (red) and `resolved` (green) are **untouched** — those are universal
  pass/fail meanings from the semantic-palette work, not family identity,
  and recoloring them would undo it.
- `MarkerRow`: default arrow `color` becomes `var(--family-accent, var(--accent))`
  instead of `var(--accent)`. Call sites that already pass an explicit
  color (e.g. a "dead" marker in muted grey) are unaffected.
- `CodePanel`: the active-line highlight bar moves from
  `border-accent bg-accent/12` to
  `border-[var(--family-accent,var(--accent))] bg-[var(--family-accent,var(--accent))]/12`.
- `poster-roof` and `.lab-stage`'s radial wash already read
  `var(--family-accent, var(--accent))` — no change needed, they just
  start picking up real values.

---

## Motif backgrounds

Seven CSS `background-image` patterns (no new SVG assets, no new
dependencies), applied via `.viz-stage[data-motif="…"]::before`, reusing
the exact layering trick `.riso-halftone` already uses in `globals.css`
(`::before` absolutely positioned + `inset:0` + `pointer-events:none`,
direct children get `position: relative` so they paint above it in the
same stacking context — proven pattern, not new invention). Ink color via
`color-mix(in oklab, var(--family-accent) N%, transparent)`, N in the 8–12%
range (matching the existing `.lab-mesh` 6% precedent, dark mode +3–4
points same as `.viz-stage`'s existing light/dark radial-wash split).
Explicitly **not** attempting bespoke illustrative art per family — that's
a materially bigger, separate initiative and risks fighting the flat/print
identity (ink, rules, halftone — never blur) if rushed. These are
geometric, not pictorial:

| Motif | Pattern |
|---|---|
| tiles | fine grid (two 1px linear-gradients, ~22px cells) — literally `.lab-mesh`'s technique, recolored |
| cursors | diagonal hatch (`repeating-linear-gradient(45deg, …)`) — suggests directional movement |
| ruler | regular vertical hairlines (`repeating-linear-gradient(to right, …)`) — a scale/number-line |
| tree | two crossing diagonal repeating-gradients (±60deg, sparse ~26px spacing) — a lattice/branch feel |
| switchboard | the same grid technique as tiles but coarser (~34px) — a distinct rhythm, not a new mechanism |
| constellation | repeating radial dots (`radial-gradient(circle, …)`, ~20px grid) — nodes, not lines |
| podium | horizontal repeating bands (`repeating-linear-gradient(to top, …)`) — tiered/stepped |

---

## Out of scope

- Which lessons get a viz at all (HANDOFF.md's blocked triage item).
- Bespoke illustrative SVG art per family (flagged above as a bigger,
  separate initiative).
- `priority-structures` has no assigned viz yet — nothing to wire until a
  heap tracer exists.
- Touching `dropped`/`resolved` cell tones, or any other already-correct
  semantic-palette token from the earlier pass.

---

## Verification

- `tsc` / `eslint` clean on every touched file.
- A design-tokens-style regression test asserting: every entry in
  `VIZ_REGISTRY` (or the parallel family-assignment map) has a `family`
  value that resolves to a real `FamilyId`; `familyTheme.ts`'s `onAccent`
  values match the computed table above (so a future palette tweak can't
  silently reintroduce the gold-on-white failure).
- Manual, both themes: Converging Pointers (pointer movement/orange),
  Fibonacci call tree (recursive exploration/purple), Monotonic Stack
  (state transition/gold — the contrast-risk case) — confirm active-cell
  text is readable, motif is visible but not distracting, poster-roof and
  code-panel highlight match the family color.
