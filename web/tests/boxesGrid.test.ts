import { describe, expect, it } from "vitest";
import {
  CELL_H,
  CELL_W,
  COLS,
  FLASH_ATTACK_MS,
  FLASH_MS,
  RAMP_SPAN_PX,
  ROWS,
  SPILL_CORNER,
  SPILL_SIDE,
  cellAt,
  cellsAlong,
  flashKey,
  flashLevel,
  glowField,
  gridTransform,
  invert,
  project,
  rampColour,
  visibleCells,
  type Flash,
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

describe("the pointer's trail", () => {
  const m = gridTransform(1440, 900);
  const inv = invert(m);
  const at = (col: number, row: number) => project(m, col * CELL_W + CELL_W / 2, row * CELL_H + CELL_H / 2);

  it("is 8-connected, starts and ends in the endpoints' cells, and never repeats a cell in a row", () => {
    for (const [a, b] of [
      [at(20, 10), at(60, 40)],
      [at(60, 40), at(20, 10)],
      [at(30, 30), at(31, 30)],
      [at(30, 30), at(30, 30)],
    ] as const) {
      const steps = cellsAlong(inv, a[0], a[1], b[0], b[1]);
      expect(steps.length).toBeGreaterThan(0);
      expect(steps[0]!.cell).toEqual(cellAt(inv, a[0], a[1]));
      expect(steps.at(-1)!.cell).toEqual(cellAt(inv, b[0], b[1]));
      for (let i = 1; i < steps.length; i++) {
        const p = steps[i - 1]!.cell;
        const q = steps[i]!.cell;
        expect(Math.max(Math.abs(p.col - q.col), Math.abs(p.row - q.row)), `step ${i}`).toBe(1);
      }
    }
  });

  it("orders steps by t from 0 to 1", () => {
    const [x0, y0] = at(10, 10);
    const [x1, y1] = at(50, 30);
    const steps = cellsAlong(inv, x0, y0, x1, y1);
    expect(steps[0]!.t).toBe(0);
    expect(steps.at(-1)!.t).toBe(1);
    for (let i = 1; i < steps.length; i++) expect(steps[i]!.t).toBeGreaterThan(steps[i - 1]!.t);
  });

  it("skips points outside the grid instead of clamping them onto its edge", () => {
    const [x0, y0] = project(m, -500, -500);
    const [x1, y1] = project(m, -300, -300);
    expect(cellsAlong(inv, x0, y0, x1, y1)).toEqual([]);
  });
});

describe("the flash envelope", () => {
  it("rises with an ease-out attack, then decays softly to nothing", () => {
    expect(flashLevel(0)).toBe(0);
    expect(flashLevel(FLASH_ATTACK_MS)).toBeCloseTo(1, 9);
    // Ease-out: most of the rise is done by the halfway point.
    expect(flashLevel(FLASH_ATTACK_MS / 2)).toBeGreaterThan(0.8);
    // A soft hold: barely below the peak just after it, a long tail near the end.
    expect(flashLevel(FLASH_ATTACK_MS + 50)).toBeGreaterThan(0.98);
    expect(flashLevel(FLASH_MS - 100)).toBeLessThan(0.01);
    expect(flashLevel(FLASH_MS)).toBe(0);
    expect(flashLevel(FLASH_MS * 3)).toBe(0);
  });

  it("is continuous and only falls after the peak", () => {
    let prev = flashLevel(0);
    for (let age = 1; age <= FLASH_MS; age++) {
      const level = flashLevel(age);
      expect(Math.abs(level - prev), `age ${age}`).toBeLessThan(0.1);
      if (age > FLASH_ATTACK_MS) expect(level, `age ${age}`).toBeLessThanOrEqual(prev + 1e-9);
      prev = level;
    }
  });

  it("resumes a re-hit from the level it had, so it never dips first", () => {
    expect(flashLevel(0, 0.6)).toBe(0.6);
    expect(flashLevel(FLASH_ATTACK_MS, 0.6)).toBeCloseTo(1, 9);
    let prev = 0.6;
    for (let age = 0; age <= FLASH_ATTACK_MS; age++) {
      const level = flashLevel(age, 0.6);
      expect(level).toBeGreaterThanOrEqual(prev - 1e-9);
      prev = level;
    }
  });
});

describe("the pool of light", () => {
  const flash = (col: number, row: number, colour: string, t0 = 0, from = 0): Flash => ({ cell: { col, row }, colour, t0, from });
  const peak = FLASH_ATTACK_MS;

  it("lights the cell fully and its eight neighbours by the spill weights", () => {
    const field = glowField([flash(10, 10, "#111111")], peak);
    expect(field.size).toBe(9);
    expect(field.get(flashKey({ col: 10, row: 10 }))!.level).toBeCloseTo(1, 9);
    expect(field.get(flashKey({ col: 11, row: 10 }))!.level).toBeCloseTo(SPILL_SIDE, 9);
    expect(field.get(flashKey({ col: 10, row: 9 }))!.level).toBeCloseTo(SPILL_SIDE, 9);
    expect(field.get(flashKey({ col: 11, row: 11 }))!.level).toBeCloseTo(SPILL_CORNER, 9);
  });

  it("takes the strongest contribution where pools overlap, never the sum", () => {
    // Two adjacent flashes at the peak: each is the other's side neighbour.
    const field = glowField([flash(10, 10, "#111111"), flash(11, 10, "#222222")], peak);
    for (const glow of field.values()) expect(glow.level).toBeLessThanOrEqual(1 + 1e-9);
    expect(field.get(flashKey({ col: 10, row: 10 }))).toMatchObject({ colour: "#111111" });
    expect(field.get(flashKey({ col: 11, row: 10 }))).toMatchObject({ colour: "#222222" });
    // A cell between two peaks gets the larger spill (0.4), not 0.8.
    const between = glowField([flash(10, 10, "#111111"), flash(12, 10, "#222222")], peak);
    expect(between.get(flashKey({ col: 11, row: 10 }))!.level).toBeCloseTo(SPILL_SIDE, 9);
  });

  it("drops expired flashes and clips the pool at the grid's edge", () => {
    expect(glowField([flash(10, 10, "#111111", 0)], FLASH_MS).size).toBe(0);
    const corner = glowField([flash(0, 0, "#111111")], peak);
    expect(corner.size).toBe(4);
    for (const { cell } of corner.values()) {
      expect(cell.col).toBeGreaterThanOrEqual(0);
      expect(cell.row).toBeGreaterThanOrEqual(0);
    }
    const far = glowField([flash(COLS - 1, ROWS - 1, "#111111")], peak);
    expect(far.size).toBe(4);
  });
});

describe("the colour ramp", () => {
  const colours = ["#ff0000", "#00ff00", "#0000ff"];

  it("sits on each family's colour at the start of its span and wraps around", () => {
    expect(rampColour(colours, 0)).toBe("#ff0000");
    expect(rampColour(colours, RAMP_SPAN_PX)).toBe("#00ff00");
    expect(rampColour(colours, RAMP_SPAN_PX * 2)).toBe("#0000ff");
    expect(rampColour(colours, RAMP_SPAN_PX * 3)).toBe("#ff0000");
    expect(rampColour(colours, -RAMP_SPAN_PX)).toBe("#0000ff");
  });

  it("mixes the neighbours between two spans, and lingers on each colour", () => {
    expect(rampColour(colours, RAMP_SPAN_PX / 2)).toBe("#808000");
    // Smoothstepped: a tenth of the way in is still nearly the first colour.
    const early = rampColour(colours, RAMP_SPAN_PX * 0.1);
    expect(parseInt(early.slice(1, 3), 16)).toBeGreaterThan(240);
  });

  it("works for a single colour and refuses none", () => {
    expect(rampColour(["#123456"], 12345)).toBe("#123456");
    expect(() => rampColour([], 0)).toThrow();
  });
});
