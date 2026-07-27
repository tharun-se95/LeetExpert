# In-Place Techniques — SVG Diagrams

**Date:** 2026-07-25
**Scope:** `course/arrays/in-place-techniques.md` only.

## Problem

The In-Place Techniques lesson teaches ideas that are inherently spatial —
array regions, converging pointers, displacement cycles — almost entirely
in prose. Only Technique 3 has a visual (the interactive `write-pointer`
tracer). Techniques 2 and 4 have none, and the loop-invariant framework
added in the last revision is the most abstract content in the lesson with
nothing to anchor it.

## Approach

Four static SVG diagrams, following the conventions already established by
`ModClockDiagram`, `EuclidShrinkDiagram`, and `LogHalvingDiagram`:

- `"use client"` components under `web/src/components/md/diagrams/`
- prop-driven, computing geometry from props rather than hardcoding
- themed only through CSS custom properties (`--accent`, `--surface`,
  `--border`, `--muted`), so light/dark works without extra code
- `role="img"` plus an `aria-label` stating the end state
- registered by id in `registry.ts`, used from markdown via the
  ` ```diagram ` fence

### Shared primitive

Three of the four render the same base shape: a row of array cells tinted
by region, with pointer markers beneath. These compose over one internal
helper, `ArrayStrip`, rather than triplicating cell and marker geometry.

`ArrayStrip` is **not** registered in `DIAGRAM_REGISTRY` and is not usable
from markdown. It is an implementation detail of the three components that
consume it.

This is a deliberate departure: the existing three diagrams are each fully
self-contained. The justification is 3x reuse within a single lesson, and
that region tinting stays consistent across the three by construction
rather than by discipline.

The ring diagram (`cyclic-placement`) shares no geometry and stands alone.

### Components

| id | Placement | Renders |
| --- | --- | --- |
| `invariant-regions` | "What is a loop invariant?" | One strip, three labeled regions, boundary markers |
| `invariant-phases` | "The three steps" | Three stacked strips: finished region empty → partial → complete |
| `converging-pointers` | Technique 2 | One row per swap; outside `[left, right]` tinted final; region shrinks row to row |
| `cyclic-placement` | Technique 4 | Ring of indices, arrows `i → (i + k) mod n`, one colour per cycle |

## Decisions

**The two concept diagrams use abstract region labels.** They sit in the
loop-invariant section, which precedes the introduction of `read` and
`write` in Technique 3. Naming those pointers there would forward-reference
material the reader has not met. Labels are props, so a later lesson can
pass concrete ones.

**Technique 3 gets no new diagram.** It already has the interactive
`write-pointer` tracer. A static twin beside it would be redundant.

**`converging-pointers` uses stacked shrinking rows**, matching the visual
language of `EuclidShrinkDiagram` and `LogHalvingDiagram`. The arrays
module then rhymes with the math module instead of introducing a second
idiom for "a region shrinking each step".

**`cyclic-placement` defaults to `n = 6, k = 2`**, which yields two
disjoint cycles, `{0, 2, 4}` and `{1, 3, 5}`. That is the case that shows
why the algorithm must detect a closed cycle and restart elsewhere — the
exact subtlety the prose calls "subtle". A default with a single cycle
would hide it.

## Risk

Four diagrams plus the existing tracer is dense for a ~10 minute lesson. If
it reads as cluttered, `invariant-phases` is the first cut — it overlaps
most with `invariant-regions` directly above it.

## Verification

Render the lesson in the dev server and confirm: all four diagrams mount,
no unknown-id error cards, no horizontal overflow at desktop and mobile
widths, and legible in both light and dark themes.
