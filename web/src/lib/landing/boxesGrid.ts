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
