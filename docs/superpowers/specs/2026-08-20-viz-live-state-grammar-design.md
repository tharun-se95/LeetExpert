# Algorithm tracer revamp — the live-state grammar

**Date:** 2026-08-20  
**Status:** in progress  
**Applies to:** `web/src/components/viz/**` (19 tracers, `VizPlayer`, `pieces.tsx`, stage CSS)  
**Prior art:** `2026-07-31-codemacha-handbook-identity-design.md` (tokens/accents), `2026-07-25-in-place-diagrams-design.md` (diagram language), the approved FamilySpotlight hero visual (soft radial washes, family accents, motion-forward, no heavy card boxes).

## Problem

The tracers render algorithms as a flat row of 40px squares + tiny arrow markers + an ad-hoc mono chip row. Diagnosis from code review:

1. **Uniformity without meaning** — nearly every array tracer is the same cells-and-arrows layout; the algorithm's *shape* is invisible.
2. **Movement missing where movement is the algorithm** — rotate/reverse/swap change fill colors; values never physically relocate.
3. **Ranges aren't expressed** — lo/mid/hi are three floating arrows; the sliding window has no frame. The structure of range algorithms is invisible.
4. **No guided attention** — the step's subject is one tone among identical cells; the eye hunts.
5. **Ad-hoc status text** — `target · sum · pairs eliminated` chips are inconsistent across tracers; live variables have no designed home.
6. **Three unrelated custom languages** — FibCallTree (circles), HashBuckets (dashed columns, 9px indices), CyclicRotate (ring). No shared grammar.
7. **Boxy chrome** — stage box + code box + caption bar + controls bar.

## Goals

- A single, coherent **live-state grammar** shared by every tracer.
- The algorithm's **action is shown, not implied**: values move, ranges are visible objects, the step's subject is obvious before the caption is read.
- Visually consistent with the approved FamilySpotlight hero look: soft radial washes, family accents, flat editorial chrome, motion-forward, `prefers-reduced-motion` honoured.
- Nothing half-built: every tracer migrates; no new ad-hoc visual invented per tracer.

## The grammar — five primitives

### 1. `Tape` — the array, as slots
- `Tape` renders a fixed row of N slots (standard width/gap). Slots are the geometry anchor so overlays align exactly.
- **Values move**: each value is a `motion` element with `layoutId` keyed by value identity; when a step relocates a value (swap/rotate/reverse/insert), the element **glides** to its new slot. Under reduced motion the glide collapses to a jump (MotionConfig `reducedMotion="user"` already in `VizPlayer`).
- Slots that are "empty" for a beat (a held value in hand) render as an empty track marker.
- API (see `pieces.tsx`): `values`, `toneFor(i)`, `focal` (the attention index), optional `markers` (heads), `bracket`, `frame`.

### 2. Range objects — windows and brackets
- **`WindowFrame`** — a translucent, accent-tinted frame drawn over a contiguous run of slots (the sliding window, the live range). It *slides* when the range shifts. Draw as a rounded outline + soft fill behind the slots, not a fourth arrow.
- **`RangeBracket`** — a bracket with end caps spanning `[lo, hi]` (binary search, subarray candidates). Shrinks step by step; collapsed range = resolved.
- **`Head`** — a compact pointer that sits above a slot with a label (i/j/lo/hi/w/mid). Bigger and cleaner than today's 10px arrows; only one label per head, colored by role (pointer vs bound vs write-head).

### 3. Focus
- Every step designates **at most one focal index** (or edge/node). The focal element gets the family accent fill, a slight scale, and the surrounding irrelevant region is dimmed (default tone). The change is legible in one glance.
- `focal` is declarative on `Tape` / `Node`; vizzes compute it in the snapshot renderer.

### 4. `StatusPanel` — the instrument strip
- One consistent, flat strip under the stage: `label value` pairs in tabular mono, muted labels, foreground values, subtle separators. Replaces the ad-hoc chip rows in every tracer.
- Shares one component + one look across all 19 tracers. Reduced-motion safe (no motion inside).

### 5. `Node` — shared shape for lists/trees/graphs
- One node component for FastSlow, ListReversal, FibCallTree, HashBuckets entries: rounded-square or circle, value, states (`default/active/visited/result/held`), same accent palette as cells, edges drawn as the family-tinted lines. Consistent stroke/fill/radius across all structure tracers.

## Tone semantics (one vocabulary, all tracers)

| Tone | Meaning | Visual |
| --- | --- | --- |
| `default` | not yet touched | plain cell, border |
| `focal` | the step's subject | family accent fill + slight scale (the focus rule) |
| `range` | inside the current window/bracket | soft accent tint |
| `eliminated` | proven irrelevant | dimmed, de-emphasized |
| `result` | final/resolved | good/bad ink per pass/fail |
| `held` | value in hand / displaced | amber/junk treatment |

Renamed from the current `CellTone`; the new `Tone` type is exported from `pieces.tsx` and used by every tracer (no per-tracer tone classes).

## Chrome (`VizPlayer`)

- Stage: **no heavy box**. Soft radial family wash + the existing motif pattern, rounded, subtle hairline. Same family accent story as the spotlight.
- Caption: designed line, keeps `aria-live`, step counter (`step n / m`) as a small accent-led tag. Integrated under the stage (not a separate bordered bar).
- Code panel: stays (Shiki tokens + active-line highlight) but loses its boxy frame in embedded/fullscreen; the two-column stage/code grid keeps working at all breakpoints.
- Controls: single flat footer strip — play/pause, step back/forward, reset, scrub, expand — flat buttons, no per-button borders where possible.
- All three modes keep working: lesson embed (framed), landing embed (`embedded`, transparent), fullscreen overlay.

## Migration

Phase 1 — shared primitives + `VizPlayer` chrome (this defines the look; everything downstream inherits).
Phase 2 — range/pointer array tracers onto `Tape` + `WindowFrame`/`Bracket` + `StatusPanel`:
`binary-search`, `sliding-window`, `dynamic-window`, `converging-pointers`, `write-pointer`, `prefix-sum`, `kadane`, `frequency-count`, `palindrome-check`, `substring-search`, `monotonic-stack`, `ring-buffer`, `dynamic-array-growth`.
Phase 3 — movement tracers (values glide): `block-reversal`, `cyclic-rotate` (keep the ring, restyle to Node/StatusPanel), `list-reversal`, `fast-slow`.
Phase 4 — structure tracers onto `Node`: `fib-call-tree`, `hash-buckets`.

Static `diagram` fences are out of scope (separate, already-designed system) — noted so the two vocabularies don't drift.

## Verification (project standard)

- `tsc`, `eslint`, full test suite, `npm run build` all green.
- Browser-check representative lessons in both runtimes and at least one of each tracer family (array, range, movement, structure) — behavior confirmed live, not just compiled.
- Reduced-motion: every tracer renders its settled frame with no transitions.
- Prove it can fail: introduce a deliberate tone/alignment fault, watch CI fail, restore.