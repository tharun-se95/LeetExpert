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

// The CSS the original applies, composed as the spec composes it: the individual
// `translate` property, then the `transform` list, all about the transform origin.
// A second derivation of gridTransform, kept deliberately unlike it (no folding).
type M3 = number[][];
const mul = (a: M3, b: M3): M3 => a.map((row, i) => b[0].map((_, j) => row.reduce((s, _v, k) => s + a[i][k] * b[k][j], 0)));
const T = (x: number, y: number): M3 => [[1, 0, x], [0, 1, y], [0, 0, 1]];
const S = (k: number): M3 => [[k, 0, 0], [0, k, 0], [0, 0, 1]];
const skewX = (deg: number): M3 => [[1, Math.tan((deg * Math.PI) / 180), 0], [0, 1, 0], [0, 0, 1]];
const skewY = (deg: number): M3 => [[1, 0, 0], [Math.tan((deg * Math.PI) / 180), 1, 0], [0, 0, 1]];

describe("the transform is the original's CSS", () => {
  it("matches translate(-50%,-50%) then translate(-40%,-60%) skewX(-48deg) skewY(14deg) scale(.675) about the centre of a box at (25%, -25%)", () => {
    for (const [w, h] of VIEWPORTS) {
      const origin = [w / 2, h / 2];
      const chain = [
        T(0.25 * w, -0.25 * h), // the box's corner: left-1/4 top-1/4 (negative)
        T(origin[0], origin[1]),
        T(-0.5 * w, -0.5 * h), // the `translate` property (-translate-x/y-1/2)
        T(-0.4 * w, -0.6 * h), // transform: translate(-40%,-60%)
        skewX(-48),
        skewY(14),
        S(0.675),
        T(-origin[0], -origin[1]),
        T(16, 16), // p-4
      ].reduce((acc, next) => mul(acc, next));
      const [a, b, c, d, e, f] = gridTransform(w, h);
      expect(a).toBeCloseTo(chain[0][0], 9);
      expect(c).toBeCloseTo(chain[0][1], 9);
      expect(e).toBeCloseTo(chain[0][2], 6);
      expect(b).toBeCloseTo(chain[1][0], 9);
      expect(d).toBeCloseTo(chain[1][1], 9);
      expect(f).toBeCloseTo(chain[1][2], 6);
    }
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
