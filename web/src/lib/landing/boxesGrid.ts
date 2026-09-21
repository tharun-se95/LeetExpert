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
import { hexToRgb, rgbToHex, type Rgb } from "@/lib/visual/palette";

export const CELL_W = 64;
export const CELL_H = 32;
export const COLS = 150;
export const ROWS = 100;
/** Every 4th column and row is a major line; the "+" marks sit on major crossings. */
export const MAJOR_EVERY = 4;
/** A flash rises over this long (ease-out), then decays over FLASH_DECAY_MS (cosine). */
export const FLASH_ATTACK_MS = 120;
export const FLASH_DECAY_MS = 1900;
export const FLASH_MS = FLASH_ATTACK_MS + FLASH_DECAY_MS;
/** How much of a flash's level each neighbour takes: edge-sharing, and corner-touching. */
export const SPILL_SIDE = 0.4;
export const SPILL_CORNER = 0.22;
/** Pointer travel over which the flash colour moves from one family to the next. */
export const RAMP_SPAN_PX = 320;

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

const inGrid = ({ col, row }: Cell) => col >= 0 && col < COLS && row >= 0 && row < ROWS;

export type Step = { cell: Cell; t: number };

/**
 * The cells a pointer crossed going from one viewport point to another, in
 * order, each with `t` in 0..1 for how far along the segment it was first
 * entered (the last is 1). The segment is walked in grid space, where a straight
 * line stays straight, at two samples per cell: consecutive samples are at most
 * half a cell apart, so consecutive cells are 8-connected. Points outside the
 * grid are skipped, not clamped onto its edge.
 */
export function cellsAlong(inverse: Affine, x0: number, y0: number, x1: number, y1: number): Step[] {
  const [ax, ay] = project(inverse, x0, y0);
  const [bx, by] = project(inverse, x1, y1);
  const n = Math.max(1, Math.ceil(2 * Math.max(Math.abs(bx - ax) / CELL_W, Math.abs(by - ay) / CELL_H)));
  const steps: Step[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const cell = { col: Math.floor((ax + (bx - ax) * t) / CELL_W), row: Math.floor((ay + (by - ay) * t) / CELL_H) };
    if (!inGrid(cell)) continue;
    const prev = steps.at(-1);
    if (prev && flashKey(prev.cell) === flashKey(cell)) {
      if (i === n) prev.t = 1;
      continue;
    }
    steps.push({ cell, t });
  }
  return steps;
}

/** A live flash: `from` is the level the cell still had when it was hit again (0 for a fresh one). */
export type Flash = { cell: Cell; colour: string; t0: number; from: number };
export type Glow = { cell: Cell; colour: string; level: number };

/**
 * A flash's level, 0..1, `ageMs` after it began: an ease-out-cubic rise from
 * `from` over FLASH_ATTACK_MS, then a cosine decay over FLASH_DECAY_MS (a soft
 * hold at the peak and a long tail). Continuous at the join and at the end.
 */
export function flashLevel(ageMs: number, from = 0): number {
  if (ageMs <= 0) return from;
  if (ageMs >= FLASH_MS) return 0;
  if (ageMs < FLASH_ATTACK_MS) {
    const p = ageMs / FLASH_ATTACK_MS;
    return from + (1 - from) * (1 - (1 - p) ** 3);
  }
  const p = (ageMs - FLASH_ATTACK_MS) / FLASH_DECAY_MS;
  return (1 + Math.cos(Math.PI * p)) / 2;
}

const SPILL: readonly (readonly [dcol: number, drow: number, weight: number])[] = [
  [-1, 0, SPILL_SIDE],
  [1, 0, SPILL_SIDE],
  [0, -1, SPILL_SIDE],
  [0, 1, SPILL_SIDE],
  [-1, -1, SPILL_CORNER],
  [1, -1, SPILL_CORNER],
  [-1, 1, SPILL_CORNER],
  [1, 1, SPILL_CORNER],
];

/**
 * Every lit cell at `now`: each live flash lights its own cell at its level and
 * spills onto its eight neighbours. Where pools overlap the strongest wins (and
 * keeps its colour); levels are never summed, so nothing exceeds 1 and the
 * flash alpha token still bounds the paint. Expired flashes contribute nothing.
 */
export function glowField(flashes: Iterable<Flash>, now: number): Map<number, Glow> {
  const field = new Map<number, Glow>();
  const put = (cell: Cell, colour: string, level: number) => {
    if (level <= 0 || !inGrid(cell)) return;
    const key = flashKey(cell);
    const held = field.get(key);
    if (!held || level > held.level) field.set(key, { cell, colour, level });
  };
  for (const flash of flashes) {
    const level = flashLevel(now - flash.t0, flash.from);
    if (level <= 0) continue;
    put(flash.cell, flash.colour, level);
    for (const [dc, dr, weight] of SPILL) {
      put({ col: flash.cell.col + dc, row: flash.cell.row + dr }, flash.colour, level * weight);
    }
  }
  return field;
}

const smoothstep = (f: number) => f * f * (3 - 2 * f);

/**
 * The flash colour after the pointer has travelled `travel` px: it moves through
 * the family list, RAMP_SPAN_PX per family, lingering on each (smoothstepped) and
 * mixing the two neighbours by channel in between, so a sweep leaves a smooth
 * ramp instead of confetti. Mixed colours are not tokens: paperContrast.test.ts
 * samples the whole ramp.
 */
export function rampColour(colours: readonly string[], travel: number): string {
  const n = colours.length;
  const first = colours[0];
  if (first === undefined) throw new Error("rampColour: no colours");
  const at = (((travel / RAMP_SPAN_PX) % n) + n) % n;
  const i = Math.floor(at);
  const from = hexToRgb(colours[i] ?? first);
  const to = hexToRgb(colours[(i + 1) % n] ?? first);
  const f = smoothstep(at - i);
  return rgbToHex(from.map((c, k) => c * (1 - f) + to[k]! * f) as Rgb);
}
