# Landing boxes backdrop

Owner direction 2026-09-21: use 21st.dev's Background Boxes (Aceternity UI, MIT,
by Manu Arora) as the landing page's background, replacing the evolving-structure
backdrop everywhere. Supersedes the backdrop parts of
`2026-09-15-landing-product-page-design.md` §14–§15 (the floating points, their
schedule, the free-space placement and the `data-backdrop-off` fade).

## Decisions (owner)

- The boxes **replace** `EvolvingStructure` on the whole page; no structures remain.
- Hover flashes a **module family colour** (`accentUi`), never a hand-picked one.
- The layer is **whole page, fixed**, behind every section, as the old backdrop was.
- Approved by the owner in chat: drop `data-backdrop-off`; show the grid at every width.

## Source geometry

The Aceternity component is 150 columns × 100 rows of 64×32px cells with a 1px
`border-l`/`border-t`/`border-r` grid and a "+" mark on every second cell of every
second column, inside a container transformed by
`translate(-40%,-60%) skewX(-48deg) skewY(14deg) scale(0.675)`, positioned
`-top-1/4 left-1/4` and `-translate(50%,50%)`, with 16px padding. Hover paints a
random colour instantly and lets it fade over 2s. It renders ~15,000 `motion.div`s.

## Design

One fixed `<canvas>` (`LandingBackdrop`), `aria-hidden`, `pointer-events-none`,
`-z-1` inside the desk's existing `isolate` (that stacking context is
load-bearing; see CLAUDE.md "The desk is flat paper").

**Geometry is pure** (`lib/landing/boxesGrid.ts`, hook-free, no DOM):
- `gridTransform(w, h)` returns the 2×3 affine matrix taking grid-local pixels to
  viewport pixels, composed exactly as the CSS above composes them.
- `invert(m)` and `cellAt(m, x, y)` map a viewport point back to a `{col,row}`
  cell or `null` outside the 150×100 grid.
- `visibleCells(m, w, h)` returns the col/row range whose parallelograms can touch
  the viewport (invert the four corners, pad by one), so drawing is bounded by
  the screen, not the grid.
- `pickColour(colours, rand)` picks one entry from an injected random source.

**Drawing** (`BoxesCanvas`, client):
- The static grid (hairlines + "+" marks) is drawn once per size change to an
  offscreen canvas, in `--boxes-line`, and blitted each frame.
- Flashes are a small map `cell -> {colour, t0}`. A frame fills each live cell's
  parallelogram at `alpha = BOXES_FLASH_ALPHA * (1 - age/FADE_MS)` and drops
  expired ones. The loop starts on the first flash and stops when none remain, so
  an idle page runs no frames.
- Input: one `pointermove` on `window` (touched only when `pointerType` is
  `mouse` or `pen`), turned into a cell with `cellAt`. Window, not the canvas,
  because content sits above the layer and would swallow the events.
- The radial fade of the original (`radial-gradient(transparent, white)` over a
  paper-coloured plate) becomes a CSS `mask-image` on the canvas.
- DPR capped at 2; the canvas is resized on `resize`.
- Reduced motion (`useMediaQuery`, read live) draws the static grid and never
  listens for the pointer. Touch devices likewise show the static grid.
- Hidden tabs pause naturally (`requestAnimationFrame`).

**Colour and contrast.** Tokens in `globals.css` replace `--backdrop-opacity` and
`--backdrop-blur`: `--boxes-line` (ink at low alpha, light and dark),
`--boxes-flash-alpha`, `--boxes-mask`. Flash colours are the families' `accentUi`
(`flashColours()` in `productData.ts`, server side, passed as props) so the course
manifest does not ship to the client. Text sits over the grid at every width, so
`paperContrast.test.ts` holds the worst case: every family's `accentUi` blended
at `--boxes-flash-alpha` over each paper must keep `--muted` and `--foreground`
at AA 4.5:1. The grid lines are decorative and carry no information.

## Removed

`EvolvingStructure.tsx`, `lib/landing/structureLayouts.ts` (its layouts, schedule,
float and `STAGE_MODULES`), their block in `landingStory.test.tsx`, the
`.landing-backdrop*` rules and `@keyframes backdrop-sway`, `--backdrop-*` tokens,
and the two `data-backdrop-off` attributes (`LandingOutro`, `LandingFooter`).

## Verification

Unit: geometry round trip (`cellAt(gridTransform, project(cell centre))` is that
cell for a spread of cells), `visibleCells` covers a brute-force scan, colour
pick is deterministic with a seeded source. Guards: no `data-backdrop-off`
left, the layer is fixed/aria-hidden/pointer-events-none, no `framer-motion`, no
hex literals in the component, the contrast test above. Fault-inject each guard
(§2 of CLAUDE.md). Then `tsc`, `eslint`, vitest, `npm run build`, and a browser
check in light and dark at desktop and phone widths, and under reduced motion,
hovering to see a flash and watching the frame loop stop when idle.

## Not doing

Ambient random flashes on touch (YAGNI), a separate colour setting, the Aceternity
`motion.div` port, `framer-motion` (the app uses `motion`).
