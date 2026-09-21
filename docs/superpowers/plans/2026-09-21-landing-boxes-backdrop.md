# Landing Boxes Backdrop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the landing page's evolving-structure backdrop with a fixed, whole-page canvas of the Aceternity "Background Boxes" skewed grid whose hovered cells flash a module family colour.

**Architecture:** A pure, DOM-free geometry module (`lib/landing/boxesGrid.ts`) owns the skew transform, the pointer-to-cell inverse and the visible-cell range. `LandingBackdrop` (client) draws the static grid once to an offscreen canvas and animates only the fading flashes, sleeping when none are live. Colours and alpha are CSS tokens; flash colours arrive from the server as props.

**Tech Stack:** Next.js (App Router), React, Canvas 2D, Tailwind v4, Vitest. No new dependency.

## Global Constraints

Spec: `docs/superpowers/specs/2026-09-21-landing-boxes-backdrop-design.md`.

- All colour goes through tokens: no hex literal in the component (CLAUDE.md §4).
- The layer is `fixed inset-0 -z-1`, `aria-hidden`, `pointer-events-none`, inside the desk's `isolate` wrapper.
- Hook-free modules only in `lib/landing/boxesGrid.ts` (the layout must be able to import it).
- Reduced motion is read live with `useMediaQuery`; touch shows the static grid.
- `data-backdrop-off` is removed everywhere; the grid shows at every width.
- Text over the grid keeps `--muted` and `--foreground` at AA 4.5:1 (`paperContrast.test.ts`).
- Never put the literal `.dark` in a comment or class name before the real `.dark {` block in `globals.css` (tests split on it).
- Comments explain why, not what. TypeScript strict, no `any`.
- Commit on branch `feat/landing-boxes-backdrop`; stage files surgically (`git add <paths>`), never `git add -A`.
- Every commit message ends with `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`.

## File Structure

| File | Change | Responsibility |
| --- | --- | --- |
| `web/src/lib/landing/boxesGrid.ts` | create | grid constants, `gridTransform`, `invert`, `project`, `cellAt`, `visibleCells`, `pickColour`, `flashAlpha`, `flashKey` |
| `web/tests/boxesGrid.test.ts` | create | geometry and helper tests |
| `web/src/components/landing/LandingBackdrop.tsx` | rewrite | the canvas layer |
| `web/src/app/globals.css` | modify | `--boxes-*` tokens, `.landing-boxes`; remove `.landing-backdrop*`, `backdrop-sway`, `--backdrop-*` |
| `web/src/lib/landing/productData.ts` | modify | `backdropColours()` becomes `flashColours()` |
| `web/src/components/landing/HomePage.tsx` | modify | pass `flashColours()` |
| `web/src/components/landing/LandingOutro.tsx`, `LandingFooter.tsx` | modify | drop `data-backdrop-off` |
| `web/src/components/landing/EvolvingStructure.tsx`, `web/src/lib/landing/structureLayouts.ts` | delete | retired |
| `web/tests/landingStory.test.tsx` | modify | remove structure tests, retarget backdrop guards |
| `web/tests/paperContrast.test.ts` | modify | flash contrast guard |
| `CLAUDE.md` | modify | landing bullet: backdrop paragraph |

---

### Task 1: Grid geometry

**Files:** create `web/src/lib/landing/boxesGrid.ts`, `web/tests/boxesGrid.test.ts`.

**Interfaces:**
- Produces: `Affine`, `Cell`, `CELL_W`, `CELL_H`, `COLS`, `ROWS`, `BOXES_FADE_MS`, `gridTransform(w,h)`, `invert(m)`, `project(m,x,y)`, `cellAt(inverse,x,y)`, `visibleCells(inverse,w,h)`, `pickColour(colours,rand)`, `flashAlpha(ageMs)`, `flashKey(cell)`.

- [ ] **Step 1: Write the failing tests** in `web/tests/boxesGrid.test.ts`

```ts
import { describe, expect, it } from "vitest";
import {
  BOXES_FADE_MS,
  CELL_H,
  CELL_W,
  COLS,
  ROWS,
  cellAt,
  flashAlpha,
  flashKey,
  gridTransform,
  invert,
  pickColour,
  project,
  visibleCells,
} from "@/lib/landing/boxesGrid";

const VIEWPORTS = [
  [390, 844],
  [1440, 900],
  [1920, 1080],
] as const;

describe("boxes grid geometry", () => {
  it("maps a viewport point back to the cell that was projected there", () => {
    for (const [w, h] of VIEWPORTS) {
      const m = gridTransform(w, h);
      const inv = invert(m);
      for (const [col, row] of [[0, 0], [3, 5], [40, 20], [77, 51], [149, 99]] as const) {
        const [x, y] = project(m, col * CELL_W + CELL_W / 2, row * CELL_H + CELL_H / 2);
        expect(cellAt(inv, x, y), `${w}x${h} cell ${col},${row}`).toEqual({ col, row });
      }
    }
  });

  it("covers every pixel of the viewport with a cell, as the original does", () => {
    // Guards the composition of translate, skewX, skewY and scale: a wrong origin
    // leaves a bare corner.
    for (const [w, h] of VIEWPORTS) {
      const inv = invert(gridTransform(w, h));
      for (let i = 0; i <= 24; i++) {
        for (let j = 0; j <= 24; j++) {
          expect(cellAt(inv, (w * i) / 24, (h * j) / 24), `${w}x${h} at ${i},${j}`).not.toBeNull();
        }
      }
    }
  });

  it("returns null outside the grid", () => {
    const m = gridTransform(1440, 900);
    const inv = invert(m);
    const [x0, y0] = project(m, -CELL_W, -CELL_H);
    const [x1, y1] = project(m, COLS * CELL_W + CELL_W, ROWS * CELL_H + CELL_H);
    expect(cellAt(inv, x0, y0)).toBeNull();
    expect(cellAt(inv, x1, y1)).toBeNull();
  });

  it("visibleCells contains every cell a viewport pixel falls in", () => {
    for (const [w, h] of VIEWPORTS) {
      const inv = invert(gridTransform(w, h));
      const range = visibleCells(inv, w, h);
      expect(range, `${w}x${h}`).not.toBeNull();
      for (let i = 0; i <= 30; i++) {
        for (let j = 0; j <= 30; j++) {
          const cell = cellAt(inv, (w * i) / 30, (h * j) / 30);
          if (!cell) continue;
          expect(cell.col).toBeGreaterThanOrEqual(range!.col0);
          expect(cell.col).toBeLessThanOrEqual(range!.col1);
          expect(cell.row).toBeGreaterThanOrEqual(range!.row0);
          expect(cell.row).toBeLessThanOrEqual(range!.row1);
        }
      }
      expect(range!.col1).toBeLessThan(COLS);
      expect(range!.row1).toBeLessThan(ROWS);
    }
  });

  it("gives every cell its own key", () => {
    const keys = new Set<number>();
    for (let col = 0; col < COLS; col++) for (let row = 0; row < ROWS; row++) keys.add(flashKey({ col, row }));
    expect(keys.size).toBe(COLS * ROWS);
  });
});

describe("flash helpers", () => {
  it("fades linearly from full to nothing over BOXES_FADE_MS", () => {
    expect(flashAlpha(0)).toBe(1);
    expect(flashAlpha(BOXES_FADE_MS / 2)).toBeCloseTo(0.5);
    expect(flashAlpha(BOXES_FADE_MS)).toBe(0);
    expect(flashAlpha(BOXES_FADE_MS * 3)).toBe(0);
  });

  it("picks each colour from a random source, and never runs off the end", () => {
    const colours = ["#111111", "#222222", "#333333"];
    expect(pickColour(colours, () => 0)).toBe("#111111");
    expect(pickColour(colours, () => 0.5)).toBe("#222222");
    expect(pickColour(colours, () => 0.999999)).toBe("#333333");
    expect(pickColour(colours, () => 1)).toBe("#333333");
  });

  it("refuses an empty palette instead of painting undefined", () => {
    expect(() => pickColour([], () => 0.5)).toThrow();
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `cd web && npx vitest run tests/boxesGrid.test.ts`
Expected: FAIL, cannot resolve `@/lib/landing/boxesGrid`.

- [ ] **Step 3: Implement** `web/src/lib/landing/boxesGrid.ts`

```ts
/**
 * Geometry of the landing backdrop's skewed box grid (spec
 * 2026-09-21-landing-boxes-backdrop-design.md). It rebuilds Aceternity UI's
 * Background Boxes (MIT, Manu Arora): 150 columns x 100 rows of 64x32px cells
 * inside a box positioned `-top-1/4 left-1/4`, shifted by translate(-50%,-50%)
 * and transformed by translate(-40%,-60%) skewX(-48deg) skewY(14deg)
 * scale(0.675) about its centre, with 16px of padding.
 *
 * Hook-free and DOM-free: the layout imports it, and the tests run it without
 * a canvas. Grid space is pixels from the grid's own corner (cell col,row spans
 * x 64*col..64*col+64, y 32*row..32*row+32); viewport space is CSS pixels.
 */
export const CELL_W = 64;
export const CELL_H = 32;
export const COLS = 150;
export const ROWS = 100;
/** A flash paints at once and fades out over this long, as the original's `duration: 2` does, a little shorter. */
export const BOXES_FADE_MS = 1500;

const PAD = 16;
const SKEW_X = Math.tan((-48 * Math.PI) / 180);
const SKEW_Y = Math.tan((14 * Math.PI) / 180);
const SCALE = 0.675;

/** Canvas order: x' = a*x + c*y + e, y' = b*x + d*y + f. */
export type Affine = readonly [a: number, b: number, c: number, d: number, e: number, f: number];
export type Cell = { col: number; row: number };

/**
 * Grid pixels to viewport pixels for a `w` x `h` viewport. The box is w x h at
 * (0.25w, -0.25h); percentages in the CSS refer to that box, and the transform
 * origin is its centre. Folding the translations gives the offset C below.
 */
export function gridTransform(w: number, h: number): Affine {
  // skewX(A) after skewY(B) after scale(s), as one linear map.
  const a = SCALE * (1 + SKEW_X * SKEW_Y);
  const c = SCALE * SKEW_X;
  const b = SCALE * SKEW_Y;
  const d = SCALE;
  // box corner + origin + translate(-50%,-50%) + translate(-40%,-60%)
  const cx = 0.25 * w + 0.5 * w - 0.5 * w - 0.4 * w;
  const cy = -0.25 * h + 0.5 * h - 0.5 * h - 0.6 * h;
  const ox = 0.5 * w - PAD;
  const oy = 0.5 * h - PAD;
  return [a, b, c, d, cx - a * ox - c * oy, cy - b * ox - d * oy];
}

export function invert([a, b, c, d, e, f]: Affine): Affine {
  const det = a * d - b * c;
  return [d / det, -b / det, -c / det, a / det, (c * f - d * e) / det, (b * e - a * f) / det];
}

export function project([a, b, c, d, e, f]: Affine, x: number, y: number): [number, number] {
  return [a * x + c * y + e, b * x + d * y + f];
}

/** The cell under a viewport point, given the inverse transform; null outside the grid. */
export function cellAt(inverse: Affine, x: number, y: number): Cell | null {
  const [gx, gy] = project(inverse, x, y);
  const col = Math.floor(gx / CELL_W);
  const row = Math.floor(gy / CELL_H);
  return col >= 0 && col < COLS && row >= 0 && row < ROWS ? { col, row } : null;
}

/**
 * The column and row range that can touch the viewport: the viewport's corners
 * mapped into grid space, bounded, padded by one cell and clamped to the grid.
 * A superset (the mapped viewport is a parallelogram), so drawing is bounded
 * by the screen, not by the 15,000-cell grid.
 */
export function visibleCells(inverse: Affine, w: number, h: number) {
  const corners = [project(inverse, 0, 0), project(inverse, w, 0), project(inverse, 0, h), project(inverse, w, h)];
  const xs = corners.map(([x]) => x);
  const ys = corners.map(([, y]) => y);
  const col0 = Math.max(0, Math.floor(Math.min(...xs) / CELL_W) - 1);
  const col1 = Math.min(COLS - 1, Math.ceil(Math.max(...xs) / CELL_W) + 1);
  const row0 = Math.max(0, Math.floor(Math.min(...ys) / CELL_H) - 1);
  const row1 = Math.min(ROWS - 1, Math.ceil(Math.max(...ys) / CELL_H) + 1);
  return col0 > col1 || row0 > row1 ? null : { col0, col1, row0, row1 };
}

export const flashKey = ({ col, row }: Cell) => row * COLS + col;

/** 1 the moment a cell is entered, 0 once BOXES_FADE_MS has passed. */
export const flashAlpha = (ageMs: number) => Math.min(1, Math.max(0, 1 - ageMs / BOXES_FADE_MS));

/** `rand` is injected so the pick is testable; `Math.random` in the page. */
export function pickColour(colours: readonly string[], rand: () => number): string {
  const colour = colours[Math.min(colours.length - 1, Math.floor(rand() * colours.length))];
  if (colour === undefined) throw new Error("pickColour: no colours to pick from");
  return colour;
}
```

- [ ] **Step 4: Run the tests and confirm they pass**

Run: `cd web && npx vitest run tests/boxesGrid.test.ts`
Expected: PASS, 8 tests.

- [ ] **Step 5: Prove the coverage test can fail.** Temporarily change `0.4 * w` to `0.1 * w` in `gridTransform`, run the test, confirm "covers every pixel" fails, then restore.

- [ ] **Step 6: Commit** `git add web/src/lib/landing/boxesGrid.ts web/tests/boxesGrid.test.ts docs/superpowers/specs/2026-09-21-landing-boxes-backdrop-design.md docs/superpowers/plans/2026-09-21-landing-boxes-backdrop.md`, message `feat(web): grid geometry for the boxes backdrop`.

---

### Task 2: Tokens and contrast guard

**Files:** modify `web/src/app/globals.css`, `web/tests/paperContrast.test.ts`.

**Interfaces:**
- Consumes: `FAMILY_THEMES` (`@/lib/visual/familyTheme`, each with `accentUi`).
- Produces: tokens `--boxes-line`, `--boxes-flash-alpha` (both theme blocks) and class `.landing-boxes` (sets `color: var(--boxes-line)` and the radial `mask-image`).

- [ ] **Step 1: Write the failing test.** Append to `web/tests/paperContrast.test.ts` (add `import { FAMILY_THEMES } from "@/lib/visual/familyTheme";` at the top):

```ts
describe("text over the landing's boxes backdrop", () => {
  // A flash is a family's UI accent at --boxes-flash-alpha over the page paper,
  // and text sits over the grid at every width. Worst case: any family, either
  // paper the desk can show.
  for (const [theme, t] of [
    ["light", light],
    ["dark", dark],
  ] as const) {
    it(`keeps --foreground and --muted AA under any family's flash in ${theme}`, () => {
      const alpha = Number(t["boxes-flash-alpha"]);
      expect(alpha, "--boxes-flash-alpha").toBeGreaterThan(0);
      expect(alpha, "--boxes-flash-alpha").toBeLessThanOrEqual(1);
      for (const surface of ["background", "elevated"]) {
        const paper = rgb(resolve(t, surface));
        for (const family of FAMILY_THEMES) {
          const flash = rgb(family.accentUi);
          const mix = paper.map((p, i) => alpha * flash[i] + (1 - alpha) * p);
          for (const ink of ["foreground", "muted"]) {
            expect(
              contrast(rgb(resolve(t, ink)), mix),
              `${theme} --${ink} under ${family.id} on --${surface}`,
            ).toBeGreaterThanOrEqual(4.5);
          }
        }
      }
    });
  }
});
```

- [ ] **Step 2: Run it and confirm it fails** (`--boxes-flash-alpha` undefined): `cd web && npx vitest run tests/paperContrast.test.ts`.

- [ ] **Step 3: Add tokens.** In `globals.css`, replace the `--backdrop-opacity` / `--backdrop-blur` pair and its comment in the light block with:

```css
  /* The landing's boxes backdrop (LandingBackdrop, spec 2026-09-21): hairlines
     in the page ink at low alpha, and a hover flash in a family's UI accent at
     --boxes-flash-alpha. Text sits over it at every width, so
     paperContrast.test.ts holds every family's flash under --foreground and
     --muted at AA. */
  --boxes-line: color-mix(in oklab, var(--press-ink) 16%, transparent);
  --boxes-flash-alpha: 0.3;
```

and the pair in the dark block with:

```css
  --boxes-line: color-mix(in oklab, var(--press-ink) 20%, transparent);
  --boxes-flash-alpha: 0.35;
```

Replace the whole `.landing-backdrop` / `@keyframes backdrop-sway` block (from the comment "The landing backdrop (LandingBackdrop, spec 2026-09-15 §14–§15)" to the reduced-motion rule ending `.landing-backdrop-drawing { animation: none; } }`) with:

```css
/*
  The landing's boxes backdrop (LandingBackdrop, spec 2026-09-21): a canvas of
  skewed hairline boxes. `color` carries the line token to the script, which
  reads it back with getComputedStyle. The mask is the original's radial fade
  (an opaque plate over the grid's edges) as an alpha ramp: full at the centre,
  falling toward the corners.
*/
.landing-boxes {
  color: var(--boxes-line);
  mask-image: radial-gradient(ellipse at center, black 20%, transparent 100%);
}
```

- [ ] **Step 4: Run and confirm it passes.** If a family fails AA at 0.3 or 0.35, lower the alpha; do not weaken the test. Record the measured worst ratios in a comment beside the tokens.

- [ ] **Step 5: Commit** `feat(web): boxes backdrop tokens and contrast guard` (paths: `web/src/app/globals.css`, `web/tests/paperContrast.test.ts`). Note the old `.landing-backdrop` rules are gone but `LandingBackdrop.tsx` still uses them until Task 3; do not run the app between the two commits.

---

### Task 3: The canvas layer, wiring, and removals

**Files:** rewrite `web/src/components/landing/LandingBackdrop.tsx`; modify `web/src/lib/landing/productData.ts`, `web/src/components/landing/HomePage.tsx`, `LandingOutro.tsx`, `LandingFooter.tsx`; delete `EvolvingStructure.tsx`, `structureLayouts.ts`; modify `web/tests/landingStory.test.tsx`.

**Interfaces:**
- Consumes: everything from Task 1; `.landing-boxes`, `--boxes-flash-alpha` from Task 2.
- Produces: `flashColours(): string[]` in `productData.ts`; `LandingBackdrop({ colours }: { colours: readonly string[] })`.

- [ ] **Step 1: `flashColours`.** In `productData.ts` remove the `STAGE_MODULES` import, replace `backdropColours()` and its comment with:

```ts
/**
 * The boxes backdrop's hover flashes: every course family's UI accent (3:1 on
 * every paper), read here on the server so the family table need not ship
 * to the landing client.
 */
export function flashColours(): string[] {
  return FAMILY_THEMES.map((theme) => theme.accentUi);
}
```

(import `FAMILY_THEMES` from `@/lib/visual/familyTheme`; drop `getFamilyTheme`/`moduleFamily` imports only if now unused.) In `HomePage.tsx` import `flashColours` instead of `backdropColours` and render `<LandingBackdrop colours={flashColours()} />`.

- [ ] **Step 2: Rewrite `LandingBackdrop.tsx`:**

```tsx
"use client";

import { useEffect, useRef } from "react";
import {
  CELL_H,
  CELL_W,
  COLS,
  cellAt,
  flashAlpha,
  flashKey,
  gridTransform,
  invert,
  pickColour,
  visibleCells,
  type Affine,
  type Cell,
} from "@/lib/landing/boxesGrid";
import { useMediaQuery } from "@/lib/useMediaQuery";

/** Device pixels past 2x add cost, not sharpness, on hairlines. */
const MAX_DPR = 2;
/** Half the length of a "+" mark's arm, in grid pixels (the original's are 12px across). */
const PLUS_ARM = 6;

type Flash = { cell: Cell; colour: string; t0: number };

/**
 * The landing page's backdrop: Aceternity's Background Boxes as one canvas
 * (owner, 2026-09-21; spec 2026-09-21-landing-boxes-backdrop-design.md). The
 * grid is drawn once per size or theme change to an offscreen layer; a hovered
 * cell flashes a random family colour and fades, and that fade is the only
 * thing that runs frames, so an idle page runs none.
 *
 * The pointer is read on `window`, not the canvas: the page's content sits above
 * this layer and would swallow the events. Touch shows the still grid, and so
 * does reduced motion. Decorative: hidden from assistive tech.
 */
export function LandingBackdrop({ colours }: { colours: readonly string[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const flashes = new Map<number, Flash>();
    let width = 0;
    let height = 0;
    let dpr = 1;
    let m: Affine = gridTransform(1, 1);
    let inverse: Affine = invert(m);
    let layer: HTMLCanvasElement | null = null;
    let frame = 0;
    let lastKey = -1;

    const paintLayer = () => {
      const off = document.createElement("canvas");
      off.width = canvas.width;
      off.height = canvas.height;
      const g = off.getContext("2d");
      const range = visibleCells(inverse, width, height);
      if (!g || !range) return off;
      g.setTransform(dpr * m[0], dpr * m[1], dpr * m[2], dpr * m[3], dpr * m[4], dpr * m[5]);
      g.strokeStyle = getComputedStyle(canvas).color;
      g.lineWidth = 1;
      g.beginPath();
      for (let c = range.col0; c <= range.col1 + 1; c++) {
        g.moveTo(c * CELL_W, range.row0 * CELL_H);
        g.lineTo(c * CELL_W, (range.row1 + 1) * CELL_H);
      }
      for (let r = range.row0; r <= range.row1 + 1; r++) {
        g.moveTo(range.col0 * CELL_W, r * CELL_H);
        g.lineTo((range.col1 + 1) * CELL_W, r * CELL_H);
      }
      // A "+" on every second corner of every second column, as the original.
      for (let c = range.col0 + (range.col0 % 2); c <= range.col1; c += 2) {
        for (let r = range.row0 + (range.row0 % 2); r <= range.row1; r += 2) {
          const x = c * CELL_W;
          const y = r * CELL_H;
          g.moveTo(x - PLUS_ARM, y);
          g.lineTo(x + PLUS_ARM, y);
          g.moveTo(x, y - PLUS_ARM);
          g.lineTo(x, y + PLUS_ARM);
        }
      }
      g.stroke();
      return off;
    };

    const draw = (now: number) => {
      frame = 0;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Flashes first, so the hairlines stay visible on top of a lit cell.
      ctx.setTransform(dpr * m[0], dpr * m[1], dpr * m[2], dpr * m[3], dpr * m[4], dpr * m[5]);
      const peak = Number.parseFloat(getComputedStyle(canvas).getPropertyValue("--boxes-flash-alpha")) || 0;
      for (const [key, flash] of flashes) {
        const alpha = flashAlpha(now - flash.t0);
        if (alpha === 0) {
          flashes.delete(key);
          continue;
        }
        ctx.globalAlpha = peak * alpha;
        ctx.fillStyle = flash.colour;
        ctx.fillRect(flash.cell.col * CELL_W, flash.cell.row * CELL_H, CELL_W, CELL_H);
      }
      ctx.globalAlpha = 1;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      if (layer) ctx.drawImage(layer, 0, 0);
      if (flashes.size > 0) frame = requestAnimationFrame(draw);
    };

    const repaint = () => {
      layer = paintLayer();
      if (!frame) draw(performance.now());
    };

    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      m = gridTransform(width, height);
      inverse = invert(m);
      repaint();
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const cell = cellAt(inverse, e.clientX, e.clientY);
      const key = cell ? flashKey(cell) : -1;
      if (!cell || key === lastKey) {
        lastKey = key;
        return;
      }
      lastKey = key;
      flashes.set(key, { cell, colour: pickColour(colours, Math.random), t0: performance.now() });
      if (!frame) frame = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    // The hairline colour is a token that changes with the theme.
    const theme = new MutationObserver(repaint);
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });
    if (!reduced) window.addEventListener("pointermove", onMove);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      theme.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [colours, reduced]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="landing-boxes pointer-events-none fixed inset-0 -z-1 h-full w-full"
    />
  );
}
```

- [ ] **Step 3: Drop `data-backdrop-off`** from `LandingOutro.tsx:27` (`<section data-scroll-section data-backdrop-off className={STOP}>` becomes `<section data-scroll-section className={STOP}>`) and `LandingFooter.tsx:35` (`<footer data-backdrop-off className=...` becomes `<footer className=...`).

- [ ] **Step 4: Delete the retired files:** `git rm web/src/components/landing/EvolvingStructure.tsx web/src/lib/landing/structureLayouts.ts`.

- [ ] **Step 5: Update `web/tests/landingStory.test.tsx`.** Remove the `EvolvingStructure` import, the whole `structureLayouts` import block, and the `describe("evolving structure data", ...)` block (line ~107 to the end of the structure/backdropColours tests, ~318). Replace the two backdrop guards (currently "draws the structure once, as the page backdrop" ~444 and "keeps the backdrop in the free space" ~469) and the `data-backdrop-off` expectations (~488, ~521-522) and the structure-loop expectations (~542-546) with:

```tsx
  it("draws the boxes once, as the page backdrop, and no longer steps aside", () => {
    const story = read("components", "landing", "LandingStory.tsx");
    const home = read("components", "landing", "HomePage.tsx");
    const backdrop = read("components", "landing", "LandingBackdrop.tsx");
    expect(story).not.toContain("LandingBackdrop");
    expect(home).toContain("<LandingBackdrop colours={flashColours()} />");
    // Fixed, behind the desk's paper, inert and hidden from assistive tech.
    expect(backdrop).toMatch(/<canvas[^>]*aria-hidden[^>]*className="landing-boxes pointer-events-none fixed inset-0 -z-1 /s);
    // Colour goes through tokens, and the app's animation library is `motion`.
    expect(backdrop).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(backdrop).not.toContain("framer-motion");
    // Pointer on window, since content covers the layer; touch and reduced motion stay still.
    expect(backdrop).toContain('window.addEventListener("pointermove", onMove)');
    expect(backdrop).toContain('e.pointerType === "touch"');
    expect(backdrop).toContain("prefers-reduced-motion: reduce");
    // The loop runs only while a flash is live.
    expect(backdrop).toMatch(/if \(flashes\.size > 0\) frame = requestAnimationFrame\(draw\)/);
    // Nothing asks it to step aside any more (owner, 2026-09-21).
    for (const file of ["LandingOutro.tsx", "LandingFooter.tsx", "LandingStory.tsx", "FeatureSection.tsx"]) {
      expect(read("components", "landing", file), file).not.toContain("data-backdrop-off");
    }
    const css = read("app", "globals.css");
    expect(css).not.toContain(".landing-backdrop");
    expect(css).not.toContain("backdrop-sway");
    expect(css).toMatch(/\.landing-boxes \{\s*color: var\(--boxes-line\);/);
  });
```

  Also update line ~603-607's expected imports list (`"@/components/landing/LandingBackdrop"` stays) and any `backdropColours` expectation to `flashColours`. Keep every non-backdrop test in that file untouched.

- [ ] **Step 6: Typecheck and run the full suite:** `cd web && npx tsc --noEmit && npx vitest run`. Fix any leftover reference (`grep -rn "structureLayouts\|EvolvingStructure\|backdropColours\|backdrop-off\|landing-backdrop" src tests`).

- [ ] **Step 7: Commit** `feat(web): boxes backdrop replaces the evolving structures` (stage the listed paths only, including the two deletions).

---

### Task 4: Docs

**Files:** modify `CLAUDE.md`, `docs/superpowers/specs/2026-09-15-landing-product-page-design.md`.

- [ ] **Step 1: CLAUDE.md.** In the landing bullet, replace the sentence beginning "One `EvolvingStructure` is the page's **backdrop**" through "…`landingStory.test.tsx`, which also holds the placement; Build's pair-sum input (`METHOD_VALUES`) is its own, not that seed." with a paragraph that says: the page's backdrop is `LandingBackdrop`, Aceternity's Background Boxes as one fixed canvas (owner, 2026-09-21; spec `docs/superpowers/specs/2026-09-21-landing-boxes-backdrop-design.md`); the grid geometry is pure in `lib/landing/boxesGrid.ts`; the hairline layer is painted once and only a hovered cell's fade runs frames; flashes are the families' `accentUi` from `flashColours()`; the pointer is read on `window`; touch and reduced motion show the still grid; text over it stays AA (`paperContrast.test.ts`); nothing steps it aside. Also delete the now-false clause "faded out while a stop marked `data-backdrop-off` is on screen" and the "Build's pair-sum input" sentence if it no longer has a referent (it keeps its own `METHOD_VALUES`; keep that fact in one short clause).
- [ ] **Step 2: Supersede note.** At the top of the 2026-09-15 spec's §15, add one line: `Superseded 2026-09-21 by 2026-09-21-landing-boxes-backdrop-design.md: the structure backdrop was replaced by the boxes grid.`
- [ ] **Step 3: Commit** `docs: landing backdrop is now the boxes grid`.

---

### Task 5: Verification

- [ ] **Step 1:** `cd web && npx tsc --noEmit && npx eslint . && npx vitest run && npm run build` all pass. Record counts.
- [ ] **Step 2: Fault injection.** For each: make the fault, run the named test, see it fail, restore. (a) put `data-backdrop-off` back on `LandingFooter`; (b) add `#ff0000` to the component; (c) raise `--boxes-flash-alpha` to `0.9`; (d) delete the `flashes.size > 0` line's guard.
- [ ] **Step 3: Browser** on the reused dev server (`web-dev`, :3002): at 1440x900 light and dark, hover across the hero and confirm cells flash in family colours and fade; confirm the grid sits behind the text and the navy cards; scroll through the feature stack and the last slide; at 390x844 confirm a static grid; emulate reduced motion and confirm no flash; in DevTools performance confirm no frames while idle. Compare the grid's look to the 21st.dev preview.
- [ ] **Step 3b:** Fix anything found, re-run Step 1.
- [ ] **Step 4:** Push the branch and report what was run and what was not.
