import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { runInNewContext } from "node:vm";

/**
 * The lane model behind the array, string, stack and queue player (lesson-artifacts/kit/lanes.js, #22).
 *
 * Every lane view draws a snapshot, so a snapshot that misstates the structure teaches the wrong
 * thing however well it is drawn. The model is held here to a plain array, on random operations,
 * the way build-a-linked-list's load check holds its list. How it is drawn is the browser gate's
 * job: the kit-players specimen runs the player through every shape in both themes.
 */
const ARTIFACTS = join(__dirname, "..", "lesson-artifacts");

type Item = { id: number; v: string; sub: string | null; tone: string | null } | null;
type Lane = { id: string; kind: string; items: Item[]; marks: Record<string, number>; spans: Record<string, { lo: number; hi: number }> };
type Snap = { note: string; lanes: Lane[]; ends: Record<string, string>; from: Record<number, { lane: string; slot: number }>; fields: [string, unknown][] };
interface Model {
  push(id: string, v: unknown, sub?: unknown): { id: number; v: unknown };
  pushFront(id: string, v: unknown): { id: number };
  pop(id: string, front?: boolean): { id: number; v: unknown };
  popFront(id: string): { id: number; v: unknown };
  move(from: string, to: string, fromFront?: boolean, toFront?: boolean): { id: number; v: unknown };
  put(id: string, slot: number, v: unknown): { id: number };
  swap(id: string, i: number, j: number): void;
  insert(id: string, k: number, v: unknown): { id: number };
  remove(id: string, k: number): { id: number; v: unknown };
  copy(from: string, i: number, to: string, j?: number): { id: number; v: unknown };
  span(id: string, name: string, lo: number | null, hi?: number): void;
  clear(id: string, slot: number): { id: number; v: unknown };
  set(it: object, v?: unknown, sub?: unknown): object;
  mark(id: string, name: string, slot: number | null): void;
  size(id: string): number;
  snap(note: string, o?: object): Snap;
}
type Kit = { Lanes: new (defs: object[], o?: object) => Model };

/* lanes.js shares one scope with the rest of the kit; its model half needs no DOM to run */
function kit(): Kit {
  const ctx: Record<string, unknown> = {};
  runInNewContext(readFileSync(join(ARTIFACTS, "kit", "lanes.js"), "utf8") + "\nthis.Lanes=Lanes;", ctx);
  return ctx as unknown as Kit;
}
const values = (s: Snap, lane: string) => s.lanes.find((l) => l.id === lane)!.items.map((x) => (x ? x.v : null));
const lane = (s: Snap, id: string) => s.lanes.find((l) => l.id === id)!;

describe("lesson artifacts kit: the lane model", () => {
  it("a stack and a deque match a plain array over random operations, with their ends marked", () => {
    const { Lanes } = kit();
    let seed = 20260927;
    const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0), seed / 4294967296);
    for (let t = 0; t < 200; t++) {
      const M = new Lanes([{ id: "s", kind: "stack" }, { id: "d", kind: "queue" }]);
      const S: string[] = [], D: string[] = [];
      for (let k = 0; k < 20; k++) {
        const v = String(Math.floor(rnd() * 9)), r = rnd();
        if (r < 0.3) { M.push("s", v); S.push(v); }
        else if (r < 0.45 && S.length) expect(M.pop("s").v).toBe(S.pop());
        else if (r < 0.6) { M.push("d", v); D.push(v); }
        else if (r < 0.7) { M.pushFront("d", v); D.unshift(v); }
        else if (r < 0.85 && D.length) expect(M.popFront("d").v).toBe(D.shift());
        else if (D.length) expect(M.pop("d").v).toBe(D.pop());
        const s = M.snap("x");
        expect(values(s, "s")).toEqual(S);
        expect(values(s, "d")).toEqual(D);
        expect(lane(s, "s").marks).toEqual(S.length ? { top: S.length - 1 } : {});
        expect(lane(s, "d").marks).toEqual(D.length ? { front: 0, back: D.length - 1 } : {});
      }
    }
  });

  it("records which end an item used, once, so the view knows which way it came or went", () => {
    const { Lanes } = kit();
    const M = new Lanes([{ id: "d", kind: "queue" }]);
    const a = M.push("d", 1), b = M.pushFront("d", 2);
    expect(M.snap("x").ends).toEqual({ [a.id]: "back", [b.id]: "front" });
    expect(M.snap("y").ends).toEqual({});
    M.popFront("d");
    expect(M.snap("z").ends).toEqual({ [b.id]: "front" });
  });

  it("an item moved between lanes keeps its identity, and a move is not an entry or an exit", () => {
    const { Lanes } = kit();
    const M = new Lanes([{ id: "in", kind: "stack" }, { id: "out", kind: "stack" }]);
    const one = M.push("in", 1);
    M.push("in", 2);
    M.snap("pushed");
    const moved = M.move("in", "out");
    const s = M.snap("moved");
    expect(moved.v).toBe(2);
    expect(lane(s, "out").items[0]!.id).toBe(moved.id);
    expect(lane(s, "in").items[0]!.id).toBe(one.id);
    expect(s.ends).toEqual({});
  });

  it("a fixed row is written by slot and refuses stack and queue moves", () => {
    const { Lanes } = kit();
    const M = new Lanes([{ id: "buf", kind: "row", cap: 4 }, { id: "s", kind: "stack", cap: 1 }]);
    expect(values(M.snap("empty"), "buf")).toEqual([null, null, null, null]);
    M.put("buf", 2, 7);
    M.mark("buf", "head", 2);
    const s = M.snap("one");
    expect(values(s, "buf")).toEqual([null, null, "7", null]);
    expect(lane(s, "buf").marks).toEqual({ head: 2 });
    expect(M.clear("buf", 2).v).toBe(7);
    expect(() => M.push("buf", 1)).toThrow(/fixed slots/);
    expect(() => M.put("buf", 4, 1)).toThrow(/out of range/);
    expect(() => M.put("s", 0, 1)).toThrow(/not a fixed row/);
    M.push("s", 1);
    expect(() => M.push("s", 2)).toThrow(/full/);
    expect(() => new Lanes([{ id: "q", kind: "queue" }]).pop("q")).toThrow(/empty/);
  });

  it("a snapshot is a copy: later changes never reach a step already recorded", () => {
    const { Lanes } = kit();
    const M = new Lanes([{ id: "calls", kind: "stack" }], { fields: (m: Model) => [["size", m.size("calls")]] });
    const f = M.push("calls", "f(1)", "n=1");
    const before = M.snap("called");
    M.set(f, undefined, "n=1 · returns 1");
    M.push("calls", "f(2)");
    expect(lane(before, "calls").items).toEqual([{ id: f.id, v: "f(1)", sub: "n=1", tone: null }]);
    expect(before.fields).toEqual([["size", 1]]);
    expect(lane(M.snap("later"), "calls").items[0]!.sub).toBe("n=1 · returns 1");
  });
  it("an array's swap, insert and remove match a plain array, and each moved item keeps its identity", () => {
    const { Lanes } = kit();
    let seed = 7;
    const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0), seed / 4294967296);
    for (let t = 0; t < 200; t++) {
      const M = new Lanes([{ id: "a", kind: "row", idx: true }]);
      const A: { v: string; id: number }[] = [];
      for (let k = 0; k < 24; k++) {
        const r = rnd(), v = String(Math.floor(rnd() * 9));
        if (r < 0.35 || A.length < 2) { const at = Math.floor(rnd() * (A.length + 1)); A.splice(at, 0, { v, id: M.insert("a", at, v).id }); }
        else if (r < 0.6) { const at = Math.floor(rnd() * A.length); expect(M.remove("a", at).id).toBe(A.splice(at, 1)[0]!.id); }
        else { const i = Math.floor(rnd() * A.length), j = Math.floor(rnd() * A.length); M.swap("a", i, j); [A[i], A[j]] = [A[j]!, A[i]!]; }
        const got = lane(M.snap("x"), "a").items;
        expect(got.map((x) => x!.v)).toEqual(A.map((x) => x.v));
        expect(got.map((x) => x!.id)).toEqual(A.map((x) => x.id));
      }
    }
    const M = new Lanes([{ id: "a", kind: "row" }]);
    M.push("a", 1);
    expect(() => M.swap("a", 0, 1)).toThrow(/out of range/);
    expect(() => M.insert("a", 3, 2)).toThrow(/out of range/);
    expect(() => new Lanes([{ id: "f", kind: "row", cap: 2 }]).remove("f", 0)).toThrow(/fixed slots/);
  });

  it("a copy is a new item that remembers the slot it was read from, for one step", () => {
    const { Lanes } = kit();
    const M = new Lanes([{ id: "old", kind: "row", cap: 2 }, { id: "big", kind: "row", cap: 4 }, { id: "out", kind: "stack" }]);
    const a = M.put("old", 1, 7);
    M.snap("written");
    const c = M.copy("old", 1, "big", 3), d = M.copy("old", 1, "out");
    const s = M.snap("copied");
    expect(c.id).not.toBe(a.id);
    expect(values(s, "big")).toEqual([null, null, null, "7"]);
    expect(values(s, "out")).toEqual(["7"]);
    expect(values(s, "old")).toEqual([null, "7"]);
    expect(s.from).toEqual({ [c.id]: { lane: "old", slot: 1 }, [d.id]: { lane: "old", slot: 1 } });
    expect(s.ends).toEqual({});
    expect(M.snap("later").from).toEqual({});
    expect(() => M.copy("old", 0, "big", 0)).toThrow(/empty/);
  });

  it("a named range is recorded with the snapshot, empty when lo passes hi, and removed by null", () => {
    const { Lanes } = kit();
    const M = new Lanes([{ id: "a", kind: "row", idx: true }]);
    [2, 1, 5].forEach((v) => M.push("a", v));
    M.span("a", "window", 0, -1);
    const empty = M.snap("empty");
    M.span("a", "window", 0, 2);
    const full = M.snap("full");
    M.span("a", "window", null);
    expect(lane(empty, "a").spans).toEqual({ window: { lo: 0, hi: -1 } });
    expect(lane(full, "a").spans).toEqual({ window: { lo: 0, hi: 2 } });
    expect(lane(M.snap("gone"), "a").spans).toEqual({});
  });
});

/* grids.js registers the grid lane kind on lanes.js's seam, so the two load together, in build order */
type GridLane = Lane & { rows: number; cols: number; rkeys: string[] | null; ckeys: string[] | null;
  axes: Record<string, { ax: "r" | "c"; i: number }>; rects: Record<string, { r0: number; c0: number; r1: number; c1: number }>; paths: Record<string, number[]>;
  deps: Record<string, { to: number; from: number[] }> };
interface GridModel extends Model {
  at(id: string, r: number, c: number): number;
  cell(id: string, r: number, c: number): { id: number; v: unknown } | null;
  fill(id: string, rows: unknown[][]): void;
  axis(id: string, name: string, ax: "r" | "c" | null, i?: number): void;
  rect(id: string, name: string, r0: number | null, c0?: number, r1?: number, c1?: number): void;
  path(id: string, name: string, slots: number[] | null): void;
  deps(id: string, name: string, toSlot: number | null, fromSlots?: number[]): void;
  tone(it: object, t: string | null): object;
}
function gridKit(): { Lanes: new (defs: object[], o?: object) => GridModel } {
  const ctx: Record<string, unknown> = {};
  const src = ["lanes.js", "grids.js"].map((f) => readFileSync(join(ARTIFACTS, "kit", f), "utf8")).join("\n");
  runInNewContext(src + "\nthis.Lanes=Lanes;", ctx);
  return ctx as unknown as { Lanes: new (defs: object[], o?: object) => GridModel };
}
const grid = (s: Snap, id: string) => s.lanes.find((l) => l.id === id)! as GridLane;

describe("lesson artifacts kit: the grid lane (grids.js)", () => {
  it("a grid is row-major slots: at(r, c) is r * cols + c, and fill puts every value there", () => {
    const { Lanes } = gridKit();
    const M = new Lanes([{ id: "g", kind: "grid", rows: 3, cols: 4 }]);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) expect(M.at("g", r, c)).toBe(r * 4 + c);
    expect(() => M.at("g", 3, 0)).toThrow(/out of range/);
    expect(() => M.at("g", 0, 4)).toThrow(/out of range/);
    const rows = [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]];
    M.fill("g", rows);
    const s = M.snap("filled"), g = grid(s, "g");
    expect(g.rows).toBe(3);
    expect(g.cols).toBe(4);
    expect(g.items.map((x) => (x ? x.v : null))).toEqual(rows.flat().map(String));
    expect(M.cell("g", 2, 1)!.v).toBe(10);
    expect(() => M.fill("g", [[1, 2]])).toThrow(/3 rows of 4/);
  });

  it("matches a plain 2D array over random puts, clears, swaps and four-way cycles, keeping identity", () => {
    const { Lanes } = gridKit();
    let seed = 20260928;
    const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0), seed / 4294967296);
    const R = 4, C = 5;
    for (let t = 0; t < 150; t++) {
      const M = new Lanes([{ id: "g", kind: "grid", rows: R, cols: C }]);
      const A: (string | null)[][] = Array.from({ length: R }, () => Array(C).fill(null));
      const ids: (number | null)[][] = Array.from({ length: R }, () => Array(C).fill(null));
      const pick = () => [Math.floor(rnd() * R), Math.floor(rnd() * C)] as const;
      for (let k = 0; k < 30; k++) {
        const x = rnd();
        if (x < 0.4) { const [r, c] = pick(), v = String(Math.floor(rnd() * 99)); ids[r][c] = M.put("g", M.at("g", r, c), v).id; A[r][c] = v; }
        else if (x < 0.55) { const [r, c] = pick(); M.clear("g", M.at("g", r, c)); A[r][c] = null; ids[r][c] = null; }
        else if (x < 0.8) {
          const [r1, c1] = pick(), [r2, c2] = pick();
          M.swap("g", M.at("g", r1, c1), M.at("g", r2, c2));
          [A[r1][c1], A[r2][c2]] = [A[r2][c2], A[r1][c1]];
          [ids[r1][c1], ids[r2][c2]] = [ids[r2][c2], ids[r1][c1]];
        } else {
          /* rotate image's step: four cells a quarter-turn apart trade places by three swaps */
          const i = Math.floor(rnd() * (R - 1)), n = R - 1;
          const ring = [[0, i], [i, n], [n, n - i], [n - i, 0]].map(([r, c]) => M.at("g", r, c));
          for (let j = 3; j > 0; j--) M.swap("g", ring[j], ring[j - 1]);
          const cs = [[0, i], [i, n], [n, n - i], [n - i, 0]];
          const va = cs.map(([r, c]) => A[r][c]), ia = cs.map(([r, c]) => ids[r][c]);
          cs.forEach(([r, c], j) => { A[r][c] = va[(j + 3) % 4]; ids[r][c] = ia[(j + 3) % 4]; });
        }
      }
      const g = grid(M.snap("t"), "g");
      expect(g.items.map((x) => (x ? x.v : null))).toEqual(A.flat());
      expect(g.items.map((x) => (x ? x.id : null))).toEqual(ids.flat());
    }
  });

  it("axes, rectangles and trails are snapshotted, removable, and isolated from later moves", () => {
    const { Lanes } = gridKit();
    const M = new Lanes([{ id: "g", kind: "grid", rows: 3, cols: 3, rkeys: ["a", "b", "c"] }]);
    M.axis("g", "top", "r", 0); M.axis("g", "left", "c", 0);
    M.rect("g", "bounds", 0, 0, 2, 2);
    M.path("g", "order", [0, 1, 2]);
    const a = M.snap("a");
    M.axis("g", "top", "r", 1); M.rect("g", "bounds", 1, 0, 2, 1);
    const trail = [0, 1, 2, 5]; M.path("g", "order", trail); trail.push(8);
    const b = M.snap("b");
    M.axis("g", "left", null); M.rect("g", "bounds", null); M.path("g", "order", null);
    const c = M.snap("c");
    expect(grid(a, "g").axes).toEqual({ top: { ax: "r", i: 0 }, left: { ax: "c", i: 0 } });
    expect(grid(a, "g").rects).toEqual({ bounds: { r0: 0, c0: 0, r1: 2, c1: 2 } });
    expect(grid(a, "g").paths).toEqual({ order: [0, 1, 2] });
    expect(grid(b, "g").axes.top).toEqual({ ax: "r", i: 1 });
    expect(grid(b, "g").rects.bounds).toEqual({ r0: 1, c0: 0, r1: 2, c1: 1 });
    expect(grid(b, "g").paths.order).toEqual([0, 1, 2, 5]);
    expect(grid(c, "g").axes).toEqual({ top: { ax: "r", i: 1 } });
    expect(grid(c, "g").rects).toEqual({});
    expect(grid(c, "g").paths).toEqual({});
    expect(grid(a, "g").rkeys).toEqual(["a", "b", "c"]);
    expect(() => M.axis("g", "r", "r", 3)).toThrow(/out of range/);
    expect(() => M.axis("g", "c", "x" as "r", 0)).toThrow(/'r' or 'c'/);
    expect(() => M.path("g", "p", [9])).toThrow(/out of range/);
  });

  it("a grid is written by slot and named by its axes: push and mark throw", () => {
    const { Lanes } = gridKit();
    const M = new Lanes([{ id: "g", kind: "grid", rows: 2, cols: 2 }, { id: "q", kind: "queue" }]);
    expect(() => M.push("g", 1)).toThrow(/fixed slots/);
    expect(() => M.mark("g", "i", 0)).toThrow(/axis/);
    expect(() => M.put("g", 4, 1)).toThrow(/out of range/);
    expect(() => new Lanes([{ id: "h", kind: "grid", rows: 0, cols: 2 }])).toThrow(/rows and cols/);
    /* a cell read onto the queue enters from that cell */
    M.put("g", M.at("g", 1, 0), "(1,0)");
    const it = M.copy("g", M.at("g", 1, 0), "q");
    const s = M.snap("copied");
    expect(s.from[it.id]).toEqual({ lane: "g", slot: 2 });
    expect(values(s, "q")).toEqual(["(1,0)"]);
  });

  it("lanes without a grid are unchanged by the seam", () => {
    const { Lanes } = gridKit();
    const M = new Lanes([{ id: "a", kind: "row", cap: 2 }]);
    M.put("a", 0, 1);
    expect(Object.keys(lane(M.snap("row"), "a")).sort()).toEqual(["cap", "id", "idx", "items", "keys", "kind", "label", "marks", "spans", "w"]);
  });
});

/*
 * The DP dependency-arrow layer (kit/grids.js `deps`, #22's tables item): a named set of arrows
 * into one target cell from one or more source cells, the same shape as `rect`/`path` but
 * directional. Held to a plain Map<name, {to, from}> reference over random operations, the way
 * the grid's own random test above holds `put`/`swap`/`clear` to a plain 2D array.
 */
describe("lesson artifacts kit: the DP dependency-arrow layer (grids.js deps())", () => {
  it("is a named {to, from} set, snapshotted, removable, and isolated from later moves", () => {
    const { Lanes } = gridKit();
    const M = new Lanes([{ id: "g", kind: "grid", rows: 3, cols: 3 }]);
    M.deps("g", "cell", M.at("g", 1, 1), [M.at("g", 0, 0), M.at("g", 0, 1)]);
    const a = M.snap("a");
    M.deps("g", "cell", M.at("g", 2, 2), [M.at("g", 1, 1)]);
    const b = M.snap("b");
    M.deps("g", "cell", null);
    const c = M.snap("c");
    expect(grid(a, "g").deps).toEqual({ cell: { to: 4, from: [0, 1] } });
    expect(grid(b, "g").deps).toEqual({ cell: { to: 8, from: [4] } });
    expect(grid(a, "g").deps).toEqual({ cell: { to: 4, from: [0, 1] } }); // (a) untouched by (b)'s move
    expect(grid(c, "g").deps).toEqual({});
    expect(() => M.deps("g", "x", 9, [0])).toThrow(/out of range/);
    expect(() => M.deps("g", "x", 0, [9])).toThrow(/out of range/);
  });

  it("matches a plain Map<name, {to, from}> over random set/remove operations, several names at once", () => {
    const { Lanes } = gridKit();
    let seed = 20260929;
    const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0), seed / 4294967296);
    const R = 3, C = 3, CAP = R * C, names = ["a", "b", "c"];
    for (let t = 0; t < 150; t++) {
      const M = new Lanes([{ id: "g", kind: "grid", rows: R, cols: C }]);
      const ref = new Map<string, { to: number; from: number[] }>();
      for (let k = 0; k < 25; k++) {
        const name = names[Math.floor(rnd() * names.length)];
        if (rnd() < 0.25) { M.deps("g", name, null); ref.delete(name); continue; }
        const to = Math.floor(rnd() * CAP);
        const from = Array.from({ length: 1 + Math.floor(rnd() * 3) }, () => Math.floor(rnd() * CAP));
        M.deps("g", name, to, from);
        ref.set(name, { to, from: from.slice() });
      }
      const got = grid(M.snap("t"), "g").deps;
      expect(Object.keys(got).sort()).toEqual([...ref.keys()].sort());
      ref.forEach((v, name) => expect(got[name]).toEqual(v));
    }
  });
});

/* heaps.js registers the heap lane kind on lanes.js's seam. A heap is a growing lane: push, swap and
   remove already do everything an insert/repair/extract needs, so the model half is held to a plain
   array exactly as a row is (the array's own test above); what is specific to a heap is heapHolds
   (the invariant a snapshot must satisfy), the comparator, and that mark works while span does not. */
type HeapLane = Lane & { cmp: "min" | "max" };
type HeapKit = Kit & { heapHolds: (l: HeapLane) => boolean };
function heapKit(): HeapKit {
  const ctx: Record<string, unknown> = {};
  const src = ["lanes.js", "heaps.js"].map((f) => readFileSync(join(ARTIFACTS, "kit", f), "utf8")).join("\n");
  runInNewContext(src + "\nthis.Lanes=Lanes;this.heapHolds=heapHolds;", ctx);
  return ctx as unknown as HeapKit;
}
const heapLane = (s: Snap, id: string) => s.lanes.find((l) => l.id === id)! as HeapLane;

describe("lesson artifacts kit: the heap lane (heaps.js)", () => {
  it("a heap lane grows and repairs exactly like a plain row over random pushes, swaps and removes", () => {
    const { Lanes } = heapKit();
    let seed = 20260929;
    const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0), seed / 4294967296);
    for (let t = 0; t < 200; t++) {
      const M = new Lanes([{ id: "h", kind: "heap" }]);
      const A: { v: string; id: number }[] = [];
      for (let k = 0; k < 24; k++) {
        const r = rnd(), v = String(Math.floor(rnd() * 99));
        if (r < 0.5 || A.length < 2) { A.push({ v, id: M.push("h", v).id }); }
        else if (r < 0.7) { const i = Math.floor(rnd() * A.length), j = Math.floor(rnd() * A.length); M.swap("h", i, j); [A[i], A[j]] = [A[j]!, A[i]!]; }
        else { const last = A.length - 1; expect(M.remove("h", last).id).toBe(A.pop()!.id); }
        const got = heapLane(M.snap("x"), "h").items;
        expect(got.map((x) => x!.v)).toEqual(A.map((x) => x.v));
        expect(got.map((x) => x!.id)).toEqual(A.map((x) => x.id));
      }
    }
  });

  it("cmp defaults to a min-heap, is carried onto every snapshot, and rejects anything else", () => {
    const { Lanes } = heapKit();
    const M = new Lanes([{ id: "h", kind: "heap" }, { id: "g", kind: "heap", cmp: "max" }]);
    expect(heapLane(M.snap("x"), "h").cmp).toBe("min");
    expect(heapLane(M.snap("x"), "g").cmp).toBe("max");
    expect(() => new Lanes([{ id: "bad", kind: "heap", cmp: "up" }])).toThrow(/cmp is 'min' or 'max'/);
  });

  it("a slot is named with mark(), unaffected by the seam; a heap has no span", () => {
    const { Lanes } = heapKit();
    const M = new Lanes([{ id: "h", kind: "heap" }]);
    [5, 3, 8].forEach((v) => M.push("h", v));
    M.mark("h", "i", 2);
    const s = M.snap("marked");
    expect(heapLane(s, "h").marks).toEqual({ i: 2 });
    M.mark("h", "i", null);
    expect(heapLane(M.snap("cleared"), "h").marks).toEqual({});
    expect(() => M.span("h", "window", 0, 1)).toThrow(/name a slot with mark/);
  });

  it("heapHolds matches a hand-built min-heap and max-heap, and catches a planted violation", () => {
    const { Lanes, heapHolds } = heapKit();
    /* build-heap trace from heapify-sift-up-and-sift-down.md's own worked example: sift down every
       non-leaf, from the last one back to the root, and the invariant holds only once that is done */
    const raw = [5, 3, 8, 4, 1, 9, 2];
    function siftDown(a: number[], i: number, n: number): void {
      for (;;) {
        let smallest = i;
        const l = 2 * i + 1, r = 2 * i + 2;
        if (l < n && a[l]! < a[smallest]!) smallest = l;
        if (r < n && a[r]! < a[smallest]!) smallest = r;
        if (smallest === i) return;
        [a[i], a[smallest]] = [a[smallest]!, a[i]!];
        i = smallest;
      }
    }
    const arr = raw.slice();
    const M = new Lanes([{ id: "h", kind: "heap" }]);
    arr.forEach((v) => M.push("h", v));
    expect(heapHolds(heapLane(M.snap("raw"), "h"))).toBe(false);
    const start = Math.floor((arr.length - 2) / 2);
    for (let i = start; i >= 0; i--) {
      siftDown(arr, i, arr.length);
      // replay the same swaps on the model by rebuilding from the mutated reference array's identity
      // (heapHolds only reads values, so re-pushing a fresh model per check keeps the id bookkeeping
      // out of this pure-reference trace while still exercising the real check function)
      const M2 = new Lanes([{ id: "h", kind: "heap" }]);
      arr.forEach((v) => M2.push("h", v));
      const holds = heapHolds(heapLane(M2.snap("x"), "h"));
      expect(holds).toBe(i === 0); // only the fully-heapified array (i back to the root) satisfies it
    }
    expect(arr.slice().sort((a, b) => a - b)).toEqual(raw.slice().sort((a, b) => a - b));
    // a max-heap checks the opposite direction
    const Mx = new Lanes([{ id: "h", kind: "heap", cmp: "max" }]);
    [8, 5, 4, 3, 1].forEach((v) => Mx.push("h", v));
    expect(heapHolds(heapLane(Mx.snap("x"), "h"))).toBe(true);
    // fault: swap the root with a smaller leaf and the check must fail
    Mx.swap("h", 0, 4);
    expect(heapHolds(heapLane(Mx.snap("broken"), "h"))).toBe(false);
  });
});

/* lists.js: the pointer snapshot (spec 2026-10-01-pointer-list-player-design.md). Its model half,
   snapshot and layout, needs no DOM. */
type PNode = { id: number; value: unknown; next: PNode | null; x?: number; y?: number };
type PSnap = { head: number | null; chain: number[]; cyclic: boolean; live: number[]; tags: Record<string, number | null>; fixed: boolean; nodes: { id: number; next: number | null; x: number; y: number }[] };
interface ListKit {
  mkNode(v: unknown, next?: PNode | null): PNode;
  ptrSnap(note: string, o: object): PSnap;
  listLayout(s: object): Record<string, { x: number; y: number }>;
  listOf(vals: unknown[]): object;
  listSnap(L: object, note: string, o?: object): PSnap;
}
function listKit(): ListKit {
  const ctx: Record<string, unknown> = {};
  runInNewContext(readFileSync(join(ARTIFACTS, "kit", "lists.js"), "utf8") + "\nthis.mkNode=mkNode;this.ptrSnap=ptrSnap;this.listLayout=listLayout;this.listOf=listOf;this.listSnap=listSnap;", ctx);
  return ctx as unknown as ListKit;
}
const row = (K: ListKit, vals: number[]) => {
  const ns = vals.map((v, i) => Object.assign(K.mkNode(v), { x: i, y: 0 }));
  ns.forEach((n, i) => { n.next = ns[i + 1] ?? null; });
  return ns;
};

describe("lesson artifacts kit: pointer lists (ptrSnap in lists.js)", () => {
  it("authored positions come back as given, and a null name stands past the end it names", () => {
    const K = listKit(), ns = row(K, [1, 2, 3]);
    const s = K.ptrSnap("start", { nodes: ns, head: ns[0], tags: { prev: null, curr: ns[0] }, nil: { prev: "left" } });
    const pos = K.listLayout(s);
    ns.forEach((n, i) => expect(pos[n.id]).toEqual({ x: i, y: 0 }));
    expect(pos["nil:left"]).toEqual({ x: -1, y: 0 });
    expect(pos["nil:right"]).toBeUndefined();
    expect(s.tags).toEqual({ prev: null, curr: ns[0]!.id });
    const end = K.listLayout(K.ptrSnap("end", { nodes: ns, head: ns[2], tags: { curr: null } }));
    expect(end["nil:right"]).toEqual({ x: 3, y: 0 });
  });

  it("the chain is read from head and stops at a cycle, which is reported", () => {
    const K = listKit(), ns = row(K, [3, 2, 0, -4]);
    expect(K.ptrSnap("x", { nodes: ns, head: ns[0] })).toMatchObject({ chain: ns.map((n) => n.id), cyclic: false });
    ns[3]!.next = ns[1]!;
    const s = K.ptrSnap("x", { nodes: ns, head: ns[0] });
    expect(s.chain).toEqual(ns.map((n) => n.id));
    expect(s.cyclic).toBe(true);
    // a reversal's prefix: head is the reversed part's first node, which ends at null
    const r = row(K, [1, 2, 3]);
    r[0]!.next = null; r[1]!.next = r[0]!;
    expect(K.ptrSnap("x", { nodes: r, head: r[1] }).chain).toEqual([r[1]!.id, r[0]!.id]);
  });

  it("a node no name reaches is not live: a flip made before saving next loses the rest", () => {
    const K = listKit(), ns = row(K, [1, 2, 3]);
    expect(K.ptrSnap("x", { nodes: ns, tags: { prev: null, curr: ns[0] } }).live).toEqual(ns.map((n) => n.id));
    ns[0]!.next = null;  // curr.next = prev, with nothing holding 2
    expect(K.ptrSnap("x", { nodes: ns, tags: { prev: null, curr: ns[0] } }).live).toEqual([ns[0]!.id]);
    expect(K.ptrSnap("x", { nodes: ns, tags: { prev: null, curr: ns[0], nxt: ns[1] } }).live.sort()).toEqual(ns.map((n) => n.id).sort());
  });

  it("a snapshot copies the pointers, so a later write never reaches an earlier step", () => {
    const K = listKit(), ns = row(K, [1, 2]), s = K.ptrSnap("x", { nodes: ns, head: ns[0] });
    ns[1]!.next = ns[0]!; ns[0]!.next = null;
    expect(s.nodes.map((n) => n.next)).toEqual([ns[1]!.id, null]);
  });

  it("a List snapshot keeps the computed layout it always had", () => {
    const K = listKit(), s = K.listSnap(K.listOf([7, 3, 12]), "x");
    expect(s.fixed).toBeUndefined();
    expect(Object.values(K.listLayout(s))).toEqual([{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }]);
  });
});

describe("lesson artifacts kit: build.py ships a player with its chrome", () => {
  const optional = (js: string) => {
    const run = spawnSync("python3", ["-c", `import sys,json;sys.path.insert(0,${JSON.stringify(ARTIFACTS)});import build;print(json.dumps(build.optional_kit(sys.stdin.read())))`], { input: js, encoding: "utf8" });
    if (run.status) throw new Error(run.stderr);
    return JSON.parse(run.stdout) as string[];
  };
  it("the step player comes first, once, whichever players a lesson uses", () => {
    expect(optional("var M=new Lanes([])")).toEqual(["player", "lanes"]);
    expect(optional("new ListPlayer(h)")).toEqual(["player", "lists"]);
    expect(optional("new ListPlayer(h);new LanePlayer(h)")).toEqual(["player", "lists", "lanes"]);
    expect(optional("var M=new Lanes([{id:'g',kind:'grid',rows:2,cols:2}])")).toEqual(["player", "lanes", "grids"]);
    expect(optional('new Lanes([{id:"g",kind:"grid"}]);new ListPlayer(h)')).toEqual(["player", "lists", "lanes", "grids"]);
    // the heap-only marker alone (no literal "new Lanes(" in this string) must still pull lanes in
    // first, via heaps' own KIT_DEPS, not because the marker string happens to also match lanes'
    expect(optional("var d={kind:'heap'};")).toEqual(["player", "lanes", "heaps"]);
    expect(optional('new Lanes([{id:"g",kind:"grid"}]);var d={kind:"heap"};')).toEqual(["player", "lanes", "grids", "heaps"]);
    expect(optional("drawTheHero()")).toEqual([]);
    expect(optional("var g={kind:'graph'};")).toEqual(["player", "lanes", "graphs"]);
    expect(optional('new Lanes([{id:"g",kind:"graph",nodes:[],edges:[]}])')).toEqual(["player", "lanes", "graphs"]);
  });
});

/* graphs.js registers the graph lane kind on lanes.js's seam. A graph is a fixed lane (slot k is node
   k) plus edges held on the lane with a state each; the edge bookkeeping is held to a plain map over
   random links, unlinks and state changes, in both directions of lookup, as the row is held to an array. */
type GraphEdge = { key: string; a: number; b: number; w: unknown; state: string };
type GraphLane = Lane & { nodes: { x: number; d: number; l: string }[]; directed: boolean; edges: GraphEdge[] };
interface GraphModel extends Model {
  nodes(id: string): { id: number; v: unknown }[];
  edge(id: string, a: number, b: number, state?: string): { a: number; b: number; w: unknown; state: string };
  hasEdge(id: string, a: number, b: number): boolean;
  adj(id: string, a: number): { to: number; w: unknown }[];
  link(id: string, a: number, b: number, w?: unknown): object;
  unlink(id: string, a: number, b: number): void;
  weight(id: string, a: number, b: number, w: unknown): void;
  lane(id: string): Lane;
}
function graphKit(): { Lanes: new (defs: object[], o?: object) => GraphModel; LANE_KINDS: Record<string, { key: (l: object) => string }> } {
  const ctx: Record<string, unknown> = {};
  const src = ["lanes.js", "graphs.js"].map((f) => readFileSync(join(ARTIFACTS, "kit", f), "utf8")).join("\n");
  runInNewContext(src + "\nthis.Lanes=Lanes;this.LANE_KINDS=LANE_KINDS;", ctx);
  return ctx as unknown as ReturnType<typeof graphKit>;
}
const graphLane = (s: Snap, id: string) => s.lanes.find((l) => l.id === id)! as GraphLane;
const ROW5 = [0, 1, 2, 3, 4].map((x) => ({ x, d: 0, l: "ABCDE"[x] }));

describe("lesson artifacts kit: the graph lane (graphs.js)", () => {
  it("edge bookkeeping matches a plain map over random links, unlinks and state changes", () => {
    const { Lanes } = graphKit();
    const STATES = ["idle", "seen", "tree", "cur", "bad"];
    let seed = 20260928;
    const rnd = (n: number) => ((seed = (seed * 1664525 + 1013904223) >>> 0), Math.floor((seed / 4294967296) * n));
    for (const directed of [false, true]) {
      for (let t = 0; t < 100; t++) {
        const M = new Lanes([{ id: "g", kind: "graph", nodes: ROW5, directed }]);
        const ref = new Map<string, { w: unknown; state: string }>();
        const key = (a: number, b: number) => (directed ? `${a}>${b}` : `${Math.min(a, b)}-${Math.max(a, b)}`);
        const kept: [Snap, [string, { w: unknown; state: string }][]][] = [];
        for (let k = 0; k < 30; k++) {
          const a = rnd(5), b = (a + 1 + rnd(4)) % 5, r = rnd(3), has = ref.has(key(a, b));
          // undirected lookups are asked in either order; directed ones only as stored
          const [qa, qb] = !directed && rnd(2) ? [b, a] : [a, b];
          if (r === 0 && !has) { const w = rnd(9); M.link("g", a, b, w); ref.set(key(a, b), { w, state: "idle" }); }
          else if (r === 1 && has) { M.unlink("g", qa, qb); ref.delete(key(a, b)); }
          else if (has) { const st = STATES[rnd(5)]!; M.edge("g", qa, qb, st); ref.get(key(a, b))!.state = st; }
          for (const [x, y] of [[a, b], [b, a]] as const) expect(M.hasEdge("g", x, y)).toBe(ref.has(key(x, y)));
          const s = M.snap("x");
          kept.push([s, [...ref].map(([kk, v]) => [kk, { ...v }])]);
          const got = graphLane(s, "g").edges.map((e) => [e.key, { w: e.w, state: e.state }]);
          expect(Object.fromEntries(got)).toEqual(Object.fromEntries(ref));
        }
        // no later change reached an earlier snapshot
        for (const [s, want] of kept) expect(Object.fromEntries(graphLane(s, "g").edges.map((e) => [e.key, { w: e.w, state: e.state }]))).toEqual(Object.fromEntries(want));
      }
    }
  });

  it("a node is a fixed slot: nodes() fills exactly one slot per node with its label", () => {
    const { Lanes } = graphKit();
    const M = new Lanes([{ id: "g", kind: "graph", nodes: ROW5, edges: [[0, 1]] }]);
    const items = M.nodes("g");
    const s = graphLane(M.snap("x"), "g");
    expect(s.items.map((x) => x && x.v)).toEqual(["A", "B", "C", "D", "E"]);
    expect(items.map((x) => x.id)).toEqual(s.items.map((x) => x!.id));
    expect(() => M.push("g", "F")).toThrow(/fixed slots/);
  });

  it("adj lists out-edges of a directed graph and every incident edge of an undirected one", () => {
    const { Lanes } = graphKit();
    const E = [[0, 1, 4], [2, 0, 1], [0, 3]];
    const U = new Lanes([{ id: "g", kind: "graph", nodes: ROW5, edges: E }]);
    const D = new Lanes([{ id: "g", kind: "graph", nodes: ROW5, edges: E, directed: true }]);
    expect(U.adj("g", 0)).toEqual([{ to: 1, w: 4 }, { to: 2, w: 1 }, { to: 3, w: null }]);
    expect(D.adj("g", 0)).toEqual([{ to: 1, w: 4 }, { to: 3, w: null }]);
    expect(D.adj("g", 2)).toEqual([{ to: 0, w: 1 }]);
    expect(D.hasEdge("g", 0, 2)).toBe(false);
    expect(() => D.edge("g", 0, 2)).toThrow(/no edge \(0, 2\)/);
  });

  it("rejects what would draw wrong or nothing: typos, duplicates, loops, overlaps, spans", () => {
    const { Lanes } = graphKit();
    const M = new Lanes([{ id: "g", kind: "graph", nodes: ROW5, edges: [[0, 1]] }]);
    expect(() => M.edge("g", 0, 2, "tree")).toThrow(/no edge/);
    expect(() => M.edge("g", 0, 1, "done")).toThrow(/edge state is one of/);
    expect(() => M.link("g", 1, 0)).toThrow(/already exists/);
    expect(() => M.link("g", 0, 5)).toThrow(/out of range/);
    expect(() => M.link("g", 2, 2)).toThrow(/self-loop/);
    expect(() => M.unlink("g", 2, 3)).toThrow(/no edge/);
    expect(() => M.mark("g", "u", 7)).toThrow(/out of range/);
    expect(() => M.span("g", "w", 0, 1)).toThrow(/name a node with mark/);
    expect(() => new Lanes([{ id: "g", kind: "graph", nodes: [{ x: 0, d: 0 }, { x: 0, d: 0 }] }])).toThrow(/share the position/);
    expect(() => new Lanes([{ id: "g", kind: "graph", nodes: [] }])).toThrow(/needs nodes/);
    expect(() => new Lanes([{ id: "g", kind: "graph", nodes: ROW5, edges: [[0, 9]] }])).toThrow(/out of range/);
  });

  it("two graphs with the same id but different shapes are measured apart", () => {
    const { Lanes, LANE_KINDS } = graphKit();
    const a = new Lanes([{ id: "g", kind: "graph", nodes: ROW5 }]).lane("g");
    const b = new Lanes([{ id: "g", kind: "graph", nodes: ROW5.map((n) => ({ ...n, d: 1 })) }]).lane("g");
    expect(LANE_KINDS.graph!.key(a)).not.toBe(LANE_KINDS.graph!.key(b));
  });

  it("a graph's gap is measured with its shape, and defaults to room for a weight plate", () => {
    const { Lanes, LANE_KINDS } = graphKit();
    const def = new Lanes([{ id: "g", kind: "graph", nodes: ROW5 }]).lane("g");
    const tight = new Lanes([{ id: "g", kind: "graph", nodes: ROW5, gap: [16, 26] }]).lane("g");
    expect(LANE_KINDS.graph!.key(def)).not.toBe(LANE_KINDS.graph!.key(tight));
    expect(graphLane(new Lanes([{ id: "g", kind: "graph", nodes: ROW5 }]).snap("x"), "g")).toMatchObject({ gap: [34, 30], words: null, plain: false });
  });
});

/* calltrees.js builds a call tree from a graph lane and a stack lane. It draws with no code of its own, so
   what is held here is the bookkeeping: the layout, and that the state at step k is a pure function of the
   first k events, checked against a stack machine that shares none of the kit's code. */
type CtNode = { id: number; v: string; sub: string; parent: number; kids: number[]; depth: number };
type CtEvent = { ev: "call" | "base" | "ret" | "prune"; node: number; val?: string | null };
type CtTrace = {
  nodes: CtNode[]; events: CtEvent[];
  call(v: string, sub?: string, note?: string | null, frame?: string[]): number;
  base(id: number, val?: unknown, note?: string): number;
  ret(id: number, val?: unknown, note?: string): number;
  prune(v: string, sub?: string, note?: string): number;
  done(): CtTrace;
};
type CtState = { nodes: Record<string, { state: string; sub: string }>; edges: Record<string, string>; path: number[] };
type CtSteps = Snap[] & { states: string[] };
interface CtKit {
  CallTrace: new () => CtTrace;
  callTreeLayout(nodes: CtNode[]): { x: number; d: number }[];
  callTreeState(t: CtTrace, k: number): CtState;
  callTreeRead(s: Snap): CtState;
  callTreeSame(want: CtState, got: CtState, k: number): void;
  callTreeWalk(t: CtTrace, o?: object): CtSteps;
  LANE_KINDS: { graph: { describe(l: object): string } };
}
function ctKit(): CtKit {
  const ctx: Record<string, unknown> = {};
  const src = ["lanes.js", "graphs.js", "calltrees.js"].map((f) => readFileSync(join(ARTIFACTS, "kit", f), "utf8")).join("\n");
  runInNewContext(src + "\nthis.CallTrace=CallTrace;this.callTreeLayout=callTreeLayout;this.callTreeState=callTreeState;this.callTreeRead=callTreeRead;this.callTreeSame=callTreeSame;this.callTreeWalk=callTreeWalk;this.LANE_KINDS=LANE_KINDS;", ctx);
  return ctx as unknown as CtKit;
}
/* a random recursion: each call makes 0 to 3 calls, some of them cut before entry, some base cases */
function randomTrace(K: CtKit, rnd: (n: number) => number): CtTrace {
  const T = new K.CallTrace();
  let n = 0;
  const go = (depth: number, label: string) => {
    const id = T.call(label, `d=${depth}`);
    const kids = depth >= 4 ? 0 : rnd(4);
    if (!kids) { T.base(id, rnd(2) ? String(rnd(9)) : null); return; }
    for (let c = 0; c < kids; c++) { if (rnd(4) === 0) T.prune(`x${n++}`, "cut"); else go(depth + 1, `n${n++}`); }
    T.ret(id, rnd(2) ? String(rnd(9)) : null);
  };
  go(0, "root");
  return T;
}
const lcg = (seed: number) => (n: number) => ((seed = (seed * 1664525 + 1013904223) >>> 0), Math.floor((seed / 4294967296) * n));

describe("lesson artifacts kit: call trees (calltrees.js)", () => {
  it("build.py ships it with the player, lanes and graphs it draws on, once and in that order", () => {
    const run = (js: string) => {
      const r = spawnSync("python3", ["-c", `import sys,json;sys.path.insert(0,${JSON.stringify(ARTIFACTS)});import build;print(json.dumps(build.optional_kit(sys.stdin.read())))`], { input: js, encoding: "utf8" });
      if (r.status) throw new Error(r.stderr);
      return JSON.parse(r.stdout) as string[];
    };
    expect(run("var s=callTreeWalk(T);")).toEqual(["player", "lanes", "graphs", "calltrees"]);
    expect(run("var T=new CallTrace();")).toEqual(["player", "lanes", "graphs", "calltrees"]);
    expect(run("mountCallTreeTabs(w,[]);var d={kind:'graph'};")).toEqual(["player", "lanes", "graphs", "calltrees"]);
    expect(run("var d={kind:'graph'};")).toEqual(["player", "lanes", "graphs"]);
  });

  it("lays out leaves in call order with each parent over its children, and no two nodes share a place", () => {
    const K = ctKit(), rnd = lcg(20260929);
    for (let t = 0; t < 150; t++) {
      const T = randomTrace(K, rnd), pos = K.callTreeLayout(T.nodes);
      expect(new Set(pos.map((p) => `${p.x},${p.d}`)).size).toBe(T.nodes.length);
      const leaves = T.nodes.filter((n) => !n.kids.length).map((n) => pos[n.id]!.x);
      expect(leaves).toEqual(leaves.map((_, i) => i));
      for (const n of T.nodes) {
        expect(pos[n.id]!.d).toBe(n.parent < 0 ? 0 : pos[n.parent]!.d + 1);
        if (n.kids.length) expect(pos[n.id]!.x).toBe((pos[n.kids[0]!]!.x + pos[n.kids[n.kids.length - 1]!]!.x) / 2);
      }
    }
  });

  it("step k shows exactly what the first k events say, whatever order the steps are read in", () => {
    const K = ctKit(), rnd = lcg(778), PAINT: Record<string, string> = { call: "active", base: "base", ret: "returned", prune: "pruned" };
    for (let t = 0; t < 120; t++) {
      const T = randomTrace(K, rnd), steps = K.callTreeWalk(T);
      expect(steps.length).toBe(T.events.length + 2);
      const order = steps.map((_, k) => k).sort(() => rnd(3) - 1);
      for (const k of order) {
        // a reference that shares no code with the kit: a plain stack machine over the events
        const stack: number[] = [], seen = new Map<number, { state: string; sub: string }>();
        for (const e of T.events.slice(0, Math.min(k, T.events.length))) {
          const n = T.nodes[e.node]!;
          if (e.ev === "call") stack.push(n.id);
          if (e.ev === "base" || e.ev === "ret") expect(stack.pop()).toBe(n.id);
          seen.set(n.id, { state: PAINT[e.ev]!, sub: (e.ev === "base" || e.ev === "ret") && e.val != null ? `= ${e.val}` : n.sub });
        }
        const got = K.callTreeRead(steps[k]!);
        expect(Object.keys(got.nodes).map(Number).sort((a, b) => a - b)).toEqual([...seen.keys()].sort((a, b) => a - b));
        for (const [id, want] of seen) expect(got.nodes[id]).toEqual(want);
        expect(got.path).toEqual(stack);
        // the path edges are lit, a cut edge is cut, every other edge is at rest
        for (const [id, st] of Object.entries(got.edges)) expect(st).toBe(seen.get(+id)!.state === "pruned" ? "bad" : stack.includes(+id) ? "cur" : "idle");
        // the call stack lane holds one frame per active call, root first
        expect(lane(steps[k]!, "stack").items.map((x) => x!.v)).toEqual(stack.map((id) => T.nodes[id]!.v));
        // and the pure function agrees with what was drawn
        expect(K.callTreeState(T, Math.min(k, T.events.length))).toEqual(got);
      }
    }
  });

  it("a drawing that disagrees with the events is refused, so the check can fail", () => {
    const K = ctKit(), T = new K.CallTrace();
    const r = T.call("f(2)", "n=2");
    const a = T.call("f(1)", "n=1");
    T.base(a, 1);
    const b = T.call("f(0)", "n=0");
    T.base(b, 1);
    T.ret(r, 2);
    const steps = K.callTreeWalk(T);
    // step 3 is after the events call f(2), call f(1), base f(1)
    const drawn = steps[3]!, copy = () => JSON.parse(JSON.stringify(drawn)) as Snap;
    K.callTreeSame(K.callTreeState(T, 3), K.callTreeRead(drawn), 3);
    const lingering = copy();
    lane(lingering, "tree").items[a]!.tone = "cur";
    expect(() => K.callTreeSame(K.callTreeState(T, 3), K.callTreeRead(lingering), 3)).toThrow(/call tree step 3/);
    const lit = copy();
    (lane(lit, "tree") as unknown as GraphLane).edges.find((e) => e.b === a)!.state = "cur";
    expect(() => K.callTreeSame(K.callTreeState(T, 3), K.callTreeRead(lit), 3)).toThrow(/edge into call/);
    expect(() => K.callTreeSame(K.callTreeState(T, 1), K.callTreeRead(drawn), 1)).toThrow(/call tree step 1/);
  });

  it("rejects what would draw a tree that is not a call tree", () => {
    const K = ctKit(), T = new K.CallTrace();
    const r = T.call("root"), c = T.call("child");
    expect(() => T.ret(r)).toThrow(/not the innermost/);
    expect(() => T.done()).toThrow(/never returned/);
    T.ret(c);
    T.ret(r);
    expect(() => T.call("second root")).toThrow(/one root/);
    expect(() => new K.CallTrace().done()).toThrow(/empty/);
    expect(() => new K.CallTrace().prune("x")).toThrow(/needs a caller/);
  });

  it("the tree lane is described in the call tree's words, and only for calls that exist", () => {
    const K = ctKit(), T = new K.CallTrace();
    const r = T.call("root", "n=1");
    T.prune("cut", "over");
    const c = T.call("kid");
    T.base(c, 7);
    T.ret(r);
    const steps = K.callTreeWalk(T), said = (k: number) => K.LANE_KINDS.graph.describe(lane(steps[k]!, "tree"));
    expect(said(0)).toMatch(/Nodes: \./);
    expect(said(2)).toContain("root (n=1), active");
    expect(said(2)).toContain("cut (over), pruned");
    expect(said(2)).not.toContain("kid");
    expect(said(4)).toContain("kid (= 7), base case");
    expect(said(5)).toContain("root (n=1), returned");
  });
});

/* intervals.js draws bars on an axis. The layout is checked against the arithmetic it claims (a bar spans
   its extent, and only its extent), and the walkthrough's state at step k against a reference written here
   from the events with none of the kit's code. */
type IvOp = [string, ...unknown[]];
type IvEvent = { note: string; ops: IvOp[]; hi: (number | string)[] };
type IvState = { order: { id: number; lo: number; hi: number; st: string | null; tone: string | null }[]; marks: Record<string, number>; bands: Record<string, number[]>; counts: [string, string][] };
type IvRead = { order: { lo: number; hi: number; tone: string | null; label: string }[]; marks: Record<string, number>; bands: Record<string, number[]>; counts: [string, string][] };
type IvTrace = {
  start: { id: number; lo: number; hi: number }[]; events: IvEvent[]; initial: string | null;
  step(note: string, ops: IvOp[], hi?: (number | string)[]): IvTrace;
  sort(by: string): IvOp; state(id: number, st: string): IvOp; reach(id: number, lo: number, hi: number): IvOp; merge(keep: number, gone: number): IvOp;
  add(lo: number, hi: number, at?: number): IvOp; remove(id: number): IvOp; mark(name: string, x: number | null): IvOp;
  band(name: string, lo: number | null, hi?: number): IvOp; count(name: string, v: unknown): IvOp; done(): IvTrace;
};
type IvSteps = Snap[] & { key: { tone: string | null; label: string; band?: boolean }[]; answer?: unknown };
type IvBox = { x: number; y: number; w: number; h: number; ch: number; rowsY: number; axisY: number; unit: number; axis: { lo: number; hi: number } };
type IvLane = { items: { tone: string | null; v: string }[]; ext: { lo: number; hi: number }[]; marks: Record<string, number> };
interface IvKit {
  Lanes: new (defs: object[], o?: object) => Model & { bar(id: string, lo: number, hi: number, at?: number): { id: number; lo: number; hi: number; v: string }; reach(it: object, lo: number, hi: number): object };
  IvTrace: new (intervals: number[][], o?: object) => IvTrace;
  ivState(t: IvTrace, k: number): IvState;
  ivRead(s: Snap): IvRead;
  ivSame(want: IvState, got: IvRead, k: number): void;
  ivWalk(t: IvTrace, o?: object): IvSteps;
  ivLabel(lo: number, hi: number): string;
  ivX(b: IvBox, c: number): number;
  ivLabelW(v: string): number;
  IV_INV: [string, string, (s: Snap) => boolean][];
  LANE_KINDS: { intervals: { measure(m: object, l: object): void; block(m: object): { w: number; h: number }; box(m: object, x: number, y: number): IvBox; place(b: IvBox, k: number, l: object): { x: number; y: number; w: number; h: number }; describe(l: object): string } };
  ivMergeSteps?(): IvSteps;
  ivRoomsSteps?(): IvSteps;
}
function ivKit(extra = ""): IvKit {
  const ctx: Record<string, unknown> = {};
  const src = ["lanes.js", "intervals.js"].map((f) => readFileSync(join(ARTIFACTS, "kit", f), "utf8")).join("\n");
  runInNewContext(src + "\n" + extra + "\nthis.Lanes=Lanes;this.IvTrace=IvTrace;this.ivState=ivState;this.ivRead=ivRead;this.ivSame=ivSame;this.ivWalk=ivWalk;this.ivLabel=ivLabel;this.ivX=ivX;this.ivLabelW=ivLabelW;this.IV_INV=IV_INV;this.LANE_KINDS=LANE_KINDS;", ctx);
  return ctx as unknown as IvKit;
}
const IV_STATES = [["waiting", null, "not read"], ["active", "cur", "being built"], ["kept", "good", "kept"], ["dropped", "bad", "removed"], ["ended", "dim", "over"]];
const IV_TONE: Record<string, string | null> = { waiting: null, active: "cur", kept: "good", dropped: "bad", ended: "dim" };

/* a random walkthrough over a list of intervals: every operation is legal at the moment it is made,
   judged by a model kept here, so the trace is valid without the kit's own rules deciding what is */
function randomIvTrace(K: IvKit, rnd: (n: number) => number): IvTrace {
  const pair = (): [number, number] => { const a = rnd(30), b = a + rnd(9); return [a, b]; };
  const input = Array.from({ length: 1 + rnd(6) }, pair);
  const T = new K.IvTrace(input, { states: IV_STATES, band: "a gap" });
  const alive: number[] = input.map((_, i) => i);
  for (let s = 0, n = 1 + rnd(14); s < n; s++) {
    const ops: IvOp[] = [];
    for (let o = 0, m = 1 + rnd(3); o < m; o++) {
      const r = rnd(10), pick = () => alive[rnd(alive.length)]!;
      if (r === 0) ops.push(T.sort(rnd(2) ? "lo" : "hi"));
      else if (r <= 2 && alive.length) ops.push(T.state(pick(), Object.keys(IV_TONE)[rnd(5)]!));
      else if (r === 3 && alive.length) { const p = pair(); ops.push(T.reach(pick(), p[0], p[1])); }
      else if (r === 4 && alive.length > 1) {
        const a = pick(); let b = pick(); while (b === a) b = pick();
        alive.splice(alive.indexOf(b), 1); ops.push(T.merge(a, b));
      } else if (r === 5) {
        const p = pair(), at = rnd(alive.length + 1), op = T.add(p[0], p[1], rnd(2) ? at : undefined);
        alive.splice(op[4] === undefined ? alive.length : at, 0, op[1] as number); ops.push(op);
      } else if (r === 6 && alive.length > 1) { const id = pick(); alive.splice(alive.indexOf(id), 1); ops.push(T.remove(id)); }
      else if (r === 7) ops.push(T.mark(rnd(2) ? "sweep" : "end", rnd(4) ? rnd(40) : null));
      else if (r === 8) { const nm = `gap ${rnd(2)}`, a = rnd(30); ops.push(rnd(4) ? T.band(nm, a, a + rnd(9)) : T.band(nm, null)); }
      else ops.push(T.count(rnd(2) ? "rooms" : "peak", rnd(9)));
    }
    T.step(`step ${s}`, ops, []);
  }
  return T;
}
/* what the drawing must show after k events, worked out from the events alone. Sorting is by extent, stable. */
function ivReference(T: IvTrace, k: number) {
  let rows = T.start.map((p) => ({ id: p.id, lo: p.lo, hi: p.hi, st: T.initial }));
  const marks = new Map<string, number>(), bands = new Map<string, number[]>(), counts = new Map<string, string>();
  // every counter is on the fields line from the first step, a dash until it is set
  for (const e of T.events) for (const op of e.ops) if (op[0] === "count" && !counts.has(op[1] as string)) counts.set(op[1] as string, "–");
  for (const e of T.events.slice(0, Math.min(k, T.events.length))) for (const op of e.ops) {
    const name = op[0], at = (id: unknown) => rows.findIndex((r) => r.id === id);
    if (name === "sort") { const key = op[1] as "lo" | "hi"; rows = rows.map((r, i) => ({ r, i })).sort((x, y) => x.r[key] - y.r[key] || x.i - y.i).map((x) => x.r); }
    else if (name === "state") rows[at(op[1])]!.st = op[2] as string;
    else if (name === "reach") { rows[at(op[1])]!.lo = op[2] as number; rows[at(op[1])]!.hi = op[3] as number; }
    else if (name === "merge") { const a = rows[at(op[1])]!, g = rows[at(op[2])]!; a.lo = Math.min(a.lo, g.lo); a.hi = Math.max(a.hi, g.hi); rows.splice(at(op[2]), 1); }
    else if (name === "add") rows.splice(op[4] === undefined ? rows.length : (op[4] as number), 0, { id: op[1] as number, lo: op[2] as number, hi: op[3] as number, st: T.initial });
    else if (name === "remove") rows.splice(at(op[1]), 1);
    else if (name === "mark") { if (op[2] === null) marks.delete(op[1] as string); else marks.set(op[1] as string, op[2] as number); }
    else if (name === "band") { if (op[2] === null) bands.delete(op[1] as string); else bands.set(op[1] as string, [op[2] as number, op[3] as number]); }
    else if (name === "count") counts.set(op[1] as string, String(op[2]));
  }
  return { rows, marks, bands, counts };
}

describe("lesson artifacts kit: the key above a player (laneKey in lanes.js)", () => {
  /* just enough DOM for the key: an element whose height is one line per entry, and a ResizeObserver whose
     callback the test fires, since the browser's first call comes after the tabs have set their key */
  type Fake = { kids: Fake[]; html: string; hidden: boolean; style: Record<string, string>; offsetHeight: number;
    innerHTML: string; appendChild(c: Fake): void; setAttribute(): void; insertBefore(c: Fake): void };
  function fake(html = ""): Fake {
    const e = { kids: [] as Fake[], html, hidden: false, style: {} as Record<string, string>,
      get offsetHeight() { return e.kids.length * 10; },
      get innerHTML() { return e.html + e.kids.map((k) => k.innerHTML).join(""); },
      set innerHTML(v: string) { e.html = v; e.kids = []; },
      appendChild(c: Fake) { e.kids.push(c); }, setAttribute() {}, insertBefore(c: Fake) { e.kids.push(c); } };
    return e as Fake;
  }
  function keyKit() {
    const fire: (() => void)[] = [];
    const ctx: Record<string, unknown> = { el: (_t: string, _c: string | null, html?: string) => fake(html ?? "") };
    ctx.window = { ResizeObserver: 1 };
    ctx.ResizeObserver = function (cb: () => void) { return { observe() { fire.push(cb); } }; };
    runInNewContext(readFileSync(join(ARTIFACTS, "kit", "lanes.js"), "utf8") + "\nthis.laneKey=laneKey;", ctx);
    const laneKey = ctx.laneKey as (h: Fake) => { el: Fake; set(e: object[] | null): void; reserve(l: object[][]): void };
    return { laneKey, resize: () => fire.forEach((f) => f()) };
  }
  const one = [{ tone: "cur", label: "active: the block being grown" }];
  const three = [{ tone: null, label: "waiting: not started yet" }, { tone: "cur", label: "running" }, { tone: "dim", label: "ended" }];

  it("holds the tallest tab's height, and a resize keeps the shown tab's key, not the last one measured", () => {
    const { laneKey, resize } = keyKit(), k = laneKey(fake());
    k.reserve([one, three]);
    k.set(one);
    expect(k.el.style.minHeight).toBe("30px");
    resize();
    expect(k.el.innerHTML).toContain("active: the block being grown");
    expect(k.el.innerHTML).not.toContain("waiting");
    expect(k.el.style.minHeight).toBe("30px");
    k.set(three);
    resize();
    expect(k.el.innerHTML).toContain("waiting: not started yet");
    expect(k.el.innerHTML).not.toContain("active");
  });
});

describe("lesson artifacts kit: intervals on an axis (intervals.js)", () => {
  it("build.py ships it with the player and lanes it draws on, once and in that order, and only where it is used", () => {
    const run = (js: string) => {
      const r = spawnSync("python3", ["-c", `import sys,json;sys.path.insert(0,${JSON.stringify(ARTIFACTS)});import build;print(json.dumps(build.optional_kit(sys.stdin.read())))`], { input: js, encoding: "utf8" });
      if (r.status) throw new Error(r.stderr);
      return JSON.parse(r.stdout) as string[];
    };
    expect(run("var s=ivWalk(T);")).toEqual(["player", "lanes", "intervals"]);
    expect(run("var T=new IvTrace([[1,2]]);")).toEqual(["player", "lanes", "intervals"]);
    expect(run("mountIvTabs(w,[]);")).toEqual(["player", "lanes", "intervals"]);
    expect(run("var d={kind:'intervals'};")).toEqual(["player", "lanes", "intervals"]);
    expect(run("var d={kind:'graph'};")).toEqual(["player", "lanes", "graphs"]);
  });

  it("a bar spans exactly its extent on the axis, in its own row, and no label overflows its bar", () => {
    const K = ivKit(), rnd = lcg(20260930), I = K.LANE_KINDS.intervals;
    for (let t = 0; t < 150; t++) {
      const axis = { lo: rnd(5) - 2, hi: 30 + rnd(30) }, M = new K.Lanes([{ id: "iv", kind: "intervals", label: "x", axis }]);
      const n = 1 + rnd(8);
      for (let i = 0; i < n; i++) { const lo = axis.lo + rnd(axis.hi - axis.lo), hi = Math.min(axis.hi, lo + rnd(12)); M.bar("iv", lo, hi); }
      const snap = M.snap("x"), l = snap.lanes[0] as unknown as { items: { v: string }[]; ext: { lo: number; hi: number }[] };
      const m: Record<string, unknown> = { kind: "intervals", label: "x", cw: 56, ch: 40, len: n };
      I.measure(m, l);
      const b = I.box(m, 10, 20), spans: [number, number][] = [];
      expect(I.block(m)).toMatchObject({ w: b.w, h: b.h });
      l.ext.forEach((e, k) => {
        const p = I.place(b, k, l), w = e.hi - e.lo;
        if (w > 0) {
          expect(p.x - p.w / 2).toBeCloseTo(K.ivX(b, e.lo), 6);
          expect(p.x + p.w / 2).toBeCloseTo(K.ivX(b, e.hi), 6);
          expect(p.w).toBeGreaterThanOrEqual(K.ivLabelW(l.items[k]!.v));
        } else expect(p.x).toBeCloseTo(K.ivX(b, e.lo), 6);
        // inside the block, between the top of the rows and the axis
        expect(p.x - p.w / 2).toBeGreaterThanOrEqual(b.x);
        expect(p.x + p.w / 2).toBeLessThanOrEqual(b.x + b.w);
        expect(p.y - p.h / 2).toBeGreaterThanOrEqual(b.rowsY);
        expect(p.y + p.h / 2).toBeLessThanOrEqual(b.axisY);
        spans.push([p.y - p.h / 2, p.y + p.h / 2]);
      });
      // one row per bar, so no two bars share vertical space whatever their extents
      spans.sort((a, c) => a[0] - c[0]);
      for (let i = 1; i < spans.length; i++) expect(spans[i]![0]).toBeGreaterThanOrEqual(spans[i - 1]![1]);
    }
  });

  it("the scale is one number for the lane, so equal extents draw equal widths at any row", () => {
    const K = ivKit(), I = K.LANE_KINDS.intervals, M = new K.Lanes([{ id: "iv", kind: "intervals", label: "x", axis: { lo: 0, hi: 40 } }]);
    M.bar("iv", 3, 9); M.bar("iv", 20, 26); M.bar("iv", 0, 40);
    const l = M.snap("x").lanes[0] as unknown as { ext: { lo: number; hi: number }[]; items: { v: string }[] }, m: Record<string, unknown> = { kind: "intervals", label: "x", cw: 56, ch: 40, len: 3 };
    I.measure(m, l);
    const b = I.box(m, 0, 0);
    expect(I.place(b, 0, l).w).toBeCloseTo(I.place(b, 1, l).w, 6);
    expect(I.place(b, 2, l).w).toBeCloseTo(40 * b.unit, 6);
  });

  it("step k shows exactly what the first k events say, whatever order the steps are read in", () => {
    const K = ivKit(), rnd = lcg(7707);
    for (let t = 0; t < 120; t++) {
      const T = randomIvTrace(K, rnd), steps = K.ivWalk(T);
      expect(steps.length).toBe(T.events.length + 2);
      const order = steps.map((_, k) => k).sort(() => rnd(3) - 1);
      for (const k of order) {
        const want = ivReference(T, k), got = K.ivRead(steps[k]!);
        expect(got.order.map((r) => [r.lo, r.hi, r.tone])).toEqual(want.rows.map((r) => [r.lo, r.hi, r.st === null ? null : IV_TONE[r.st]]));
        expect(got.order.map((r) => r.label)).toEqual(want.rows.map((r) => K.ivLabel(r.lo, r.hi)));
        expect(got.marks).toEqual(Object.fromEntries(want.marks));
        expect(got.bands).toEqual(Object.fromEntries(want.bands));
        expect(got.counts).toEqual([...want.counts].map(([a, b]) => [a, b]));
        // and the kit's own pure function agrees with the reference
        const st = K.ivState(T, k);
        expect(st.order.map((r) => [r.lo, r.hi, r.tone])).toEqual(got.order.map((r) => [r.lo, r.hi, r.tone]));
        K.ivSame(st, got, k);
        // the rows are the lane's items in order, so the picture is read top to bottom
        expect(lane(steps[k]!, "iv").items.map((x) => x!.v)).toEqual(got.order.map((r) => r.label));
        for (const [, , ok] of K.IV_INV) expect(ok(steps[k]!)).toBe(true);
      }
    }
  });

  it("a drawing that disagrees with the events is refused, so the check can fail", () => {
    const K = ivKit(), T = new K.IvTrace([[1, 3], [2, 6]], { states: IV_STATES });
    T.step("merge", [T.merge(0, 1), T.state(0, "active"), T.mark("end", 6), T.count("blocks", 1)], [0]);
    const steps = K.ivWalk(T), good = steps[1]!, copy = () => JSON.parse(JSON.stringify(good)) as Snap;
    const iv = (s: Snap) => lane(s, "iv") as unknown as IvLane;
    K.ivSame(K.ivState(T, 1), K.ivRead(good), 1);
    const hull = copy(); iv(hull).ext[0]!.hi = 3; iv(hull).items[0]!.v = "[1,3]";
    expect(() => K.ivSame(K.ivState(T, 1), K.ivRead(hull), 1)).toThrow(/interval step 1: row 0/);
    const tone = copy(); iv(tone).items[0]!.tone = "good";
    expect(() => K.ivSame(K.ivState(T, 1), K.ivRead(tone), 1)).toThrow(/row 0/);
    const label = copy(); iv(label).items[0]!.v = "[1,9]";
    expect(() => K.ivSame(K.ivState(T, 1), K.ivRead(label), 1)).toThrow(/row 0/);
    const sweep = copy(); iv(sweep).marks.end = 3;
    expect(() => K.ivSame(K.ivState(T, 1), K.ivRead(sweep), 1)).toThrow(/mark end/);
    const counter = copy(); counter.fields = [["blocks", 2]];
    expect(() => K.ivSame(K.ivState(T, 1), K.ivRead(counter), 1)).toThrow(/counter blocks/);
    const extra = copy(); iv(extra).items.push({ tone: null, v: "[0,1]" }); iv(extra).ext.push({ lo: 0, hi: 1 });
    expect(() => K.ivSame(K.ivState(T, 1), K.ivRead(extra), 1)).toThrow(/bars/);
    expect(() => K.ivSame(K.ivState(T, 0), K.ivRead(good), 0)).toThrow(/interval step 0/);
  });

  it("rejects what would draw wrong or nothing: no axis, a bar off it, a plain push, a mark off it, alike states", () => {
    const K = ivKit(), mk = () => new K.Lanes([{ id: "iv", kind: "intervals", label: "x", axis: { lo: 0, hi: 10 } }]);
    expect(() => new K.Lanes([{ id: "iv", kind: "intervals" }])).toThrow(/needs an axis/);
    expect(() => new K.Lanes([{ id: "iv", kind: "intervals", axis: { lo: 5, hi: 5 } }])).toThrow(/lo below hi/);
    expect(() => mk().bar("iv", 6, 2)).toThrow(/ends before it starts/);
    expect(() => mk().bar("iv", 2, 11)).toThrow(/outside the axis/);
    expect(() => mk().bar("iv", NaN, 3)).toThrow(/numeric/);
    const pushed = mk(); pushed.push("iv", "raw");
    expect(() => pushed.snap("x")).toThrow(/no extent: add bars with bar/);
    expect(() => mk().mark("iv", "sweep", 11)).toThrow(/outside the axis/);
    expect(() => mk().mark("iv", "sweep", "x" as unknown as number)).toThrow(/coordinate/);
    expect(() => mk().span("iv", "gap", 7, 3)).toThrow(/ends before it starts/);
    expect(() => new K.Lanes([{ id: "s", kind: "stack" }]).bar("s", 1, 2)).toThrow(/not an interval lane/);
    const M = mk(), it = M.bar("iv", 1, 3);
    expect(() => M.reach({ v: "x" }, 1, 2)).toThrow(/made by bar/);
    M.reach(it, 2, 8);
    expect(it.v).toBe("[2,8]");
    expect(() => new K.IvTrace([[1, 2]], { states: [["a", "cur"], ["b", "cur"]] })).toThrow(/drawn alike/);
    expect(() => new K.IvTrace([[1, 2]], { states: [["a", null], ["b", null]] })).toThrow(/drawn alike/);
    expect(() => new K.IvTrace([[1, 2]], { states: [["a", "purple"]] })).toThrow(/tone is one of/);
    expect(() => new K.IvTrace([[1, 2]], { states: [["a", null], ["a", "cur"]] })).toThrow(/named twice/);
    expect(() => new K.IvTrace([[1, 2]], { states: [] })).toThrow(/names its states/);
    expect(() => new K.IvTrace([[3, 1]], { states: IV_STATES })).toThrow(/ends before it starts/);
    const T = () => new K.IvTrace([[1, 2], [4, 5]], { states: IV_STATES });
    expect(() => T().done()).toThrow(/empty/);
    expect(() => { const t = T(); t.step("x", [t.state(0, "nope")]).done(); }).toThrow(/not one of/);
    expect(() => { const t = T(); t.step("x", [t.merge(0, 7)]).done(); }).toThrow(/no bar 7/);
    expect(() => { const t = T(); t.step("x", [t.merge(0, 0)]).done(); }).toThrow(/itself/);
    expect(() => { const t = T(); t.step("x", [t.remove(0), t.state(0, "kept")]).done(); }).toThrow(/no bar 0/);
    expect(() => { const t = T(); t.step("x", [t.add(1, 2, 9)]).done(); }).toThrow(/out of range/);
    expect(() => { const t = T(); t.step("x", [t.band("g", 1, 2)]); K.ivWalk(t); }).toThrow(/names no meaning/);
    expect(() => { const t = T(); t.step("x", [["fly", 1]]); t.done(); }).toThrow(/unknown operation/);
    expect(() => { const t = new K.IvTrace([[1, 2]], { states: IV_STATES, axis: { lo: 0, hi: 3 } }); t.step("x", [t.mark("m", 9)]); K.ivWalk(t); }).toThrow(/outside the axis/);
  });

  it("the lane is described in its own words: rows top to bottom, states by the walkthrough's name, coordinates and ranges", () => {
    const K = ivKit(), T = new K.IvTrace([[1, 3], [2, 6]], { states: IV_STATES, band: "free" });
    T.step("a", [T.state(1, "kept"), T.mark("sweep", 4), T.band("gap", 6, 8)], []);
    const steps = K.ivWalk(T, { axis: { lo: 0, hi: 10 } }), said = (k: number) => K.LANE_KINDS.intervals.describe(lane(steps[k]!, "iv"));
    expect(said(0)).toBe("Intervals intervals on an axis from 0 to 10, top to bottom: [1,3]; [2,6].");
    expect(said(1)).toBe("Intervals intervals on an axis from 0 to 10, top to bottom: [1,3]; [2,6], kept. sweep at 4, gap from 6 to 8.");
    expect(steps.key).toEqual([{ tone: null, label: "waiting: not read" }, { tone: "good", label: "kept: kept" }, { band: true, label: "free" }]);
  });

  /* the specimen's two walkthroughs run the real algorithm; here their answers meet an implementation written
     from scratch, and the walkthrough functions are the specimen's own, taken from its source */
  it("the specimen's merge and meeting-rooms walkthroughs match independent implementations", () => {
    const src = readFileSync(join(ARTIFACTS, "kit-players", "lesson.js"), "utf8");
    const cut = src.indexOf("\nmountLesson();");
    expect(cut).toBeGreaterThan(0);
    const K = ivKit(src.slice(0, cut) + "\nthis.ivMergeSteps=ivMergeSteps;this.ivRoomsSteps=ivRoomsSteps;");
    // union of covered intervals: sweep the sorted endpoints with a depth counter, joining touching blocks
    const merge = (iv: number[][]) => {
      const ev = iv.flatMap(([a, b]) => [[a!, 0], [b!, 1]] as [number, number][]).sort((x, y) => x[0] - y[0] || x[1] - y[1]);
      const out: number[][] = []; let depth = 0, from = 0;
      for (const [t, end] of ev) { if (!end) { if (!depth) from = t; depth++; } else if (!--depth) { if (out.length && out[out.length - 1]![1] === from) out[out.length - 1]![1] = t; else out.push([from, t]); } }
      return out;
    };
    const rooms = (iv: number[][]) => { let best = 0; for (let t = 0; t <= Math.max(...iv.map((p) => p[1]!)); t += 0.5) best = Math.max(best, iv.filter((p) => p[0]! <= t && t < p[1]!).length); return best; };
    const m = K.ivMergeSteps!(), r = K.ivRoomsSteps!();
    expect(m.answer).toEqual(merge([[1, 3], [2, 6], [8, 10], [15, 18]]));
    expect(m.answer).toEqual([[1, 6], [8, 10], [15, 18]]);
    expect(r.answer).toBe(rooms([[0, 30], [5, 10], [15, 20]]));
    expect(r.answer).toBe(2);
    // the last picture of each walkthrough is its answer, and every step passed the read-back on load
    expect(K.ivRead(m[m.length - 1]!).order.map((x) => [x.lo, x.hi])).toEqual(m.answer);
    expect(K.ivRead(r[r.length - 1]!).counts).toContainEqual(["most so far", "2"]);
    // the fields line has all its counters from the first step, so it never grows (and re-wraps) mid-walkthrough
    expect(K.ivRead(r[0]!).counts).toEqual([["rooms in use", "–"], ["most so far", "–"]]);
    expect(K.ivRead(m[0]!).counts).toEqual([["blocks done", "–"]]);
    // the merge draws a gap between blocks, so its key names a range; the rooms walkthrough draws none
    expect(m.key.some((k) => k.band)).toBe(true);
    expect(r.key.some((k) => k.band)).toBe(false);
  });
});

/* ---------- tries (tries.js) ---------- */
type TrNode = { id: number; ch: string; parent: number; kids: Record<string, number>; depth: number; gone: boolean; word: string };
type TrEvent = { ev: string; node: number; ch?: string; word?: string; dead?: boolean };
interface TrTrace {
  nodes: TrNode[]; events: TrEvent[]; at: number;
  child(ch: string): number; children(): number[]; word(): string; prefix(id?: number): string;
  make(ch: string, note?: string): number; go(id: number, note?: string): number; miss(ch: string, note?: string): void;
  end(word: string, note?: string): void; unend(note?: string): void; found(note?: string): void;
  back(dead: boolean, note?: string): void; drop(note?: string): void; reset(note?: string): void; done(): TrTrace;
}
type TrState = { nodes: Record<string, { state: string | null; word: string }>; edges: Record<string, string>; cursor: number };
type TrSteps = Snap[] & { states: string[]; answer?: unknown; trace?: TrTrace };
interface TrKit {
  TrieTrace: new () => TrTrace;
  trieShape(T: TrTrace): { kids: number[]; depth: number }[];
  graphTreeLayout(nodes: { kids: number[]; depth: number }[]): { x: number; d: number }[];
  trieState(T: TrTrace, k: number): TrState;
  trieRead(s: Snap): TrState;
  trieSame(want: TrState, got: TrState, k: number): void;
  trieWalk(T: TrTrace, o?: object): TrSteps;
  TRIE_INV: [string, string, (s: Snap) => boolean][];
  trieInsertSteps?: () => TrSteps; trieWildSteps?: () => TrSteps; trieBoardSteps?: () => TrSteps;
}
function trKit(extra = ""): TrKit {
  const ctx: Record<string, unknown> = {};
  const src = ["lanes.js", "graphs.js", "grids.js", "tries.js"].map((f) => readFileSync(join(ARTIFACTS, "kit", f), "utf8")).join("\n");
  runInNewContext(src + "\n" + extra + "\nthis.TrieTrace=TrieTrace;this.trieShape=trieShape;this.graphTreeLayout=graphTreeLayout;this.trieState=trieState;this.trieRead=trieRead;this.trieSame=trieSame;this.trieWalk=trieWalk;this.TRIE_INV=TRIE_INV;", ctx);
  return ctx as unknown as TrKit;
}
/* random walks over a random alphabet: every operation the trace offers, each only where it is allowed */
function randomTrie(K: TrKit, rnd: (n: number) => number): TrTrace {
  const T = new K.TrieTrace(), A = "abcd";
  const n = 10 + rnd(40);
  for (let i = 0; i < n; i++) {
    const cur = T.nodes[T.at]!, kids = T.children(), op = rnd(10), ch = A[rnd(A.length)]!;
    if (op < 3 && T.child(ch) < 0 && cur.depth < 5) T.make(ch);
    else if (op < 5 && kids.length) T.go(kids[rnd(kids.length)]!);
    else if (op === 5 && T.child(ch) < 0) T.miss(ch);
    else if (op === 6 && T.at) { if (T.word()) T.unend(); else T.end(T.prefix()); }
    else if (op === 7) T.found();
    else if (op === 8 && T.at) { if (!kids.length && !T.word() && rnd(2)) T.drop(); else T.back(!!rnd(2)); }
    else if (op === 9 && rnd(4) === 0) T.reset();
    else T.found();
  }
  return T;
}

describe("lesson artifacts kit: tries (tries.js)", () => {
  it("build.py ships it with the player, lanes and graphs it draws on, once and in that order", () => {
    const run = (js: string) => {
      const r = spawnSync("python3", ["-c", `import sys,json;sys.path.insert(0,${JSON.stringify(ARTIFACTS)});import build;print(json.dumps(build.optional_kit(sys.stdin.read())))`], { input: js, encoding: "utf8" });
      if (r.status) throw new Error(r.stderr);
      return JSON.parse(r.stdout) as string[];
    };
    expect(run("var s=trieWalk(T);")).toEqual(["player", "lanes", "graphs", "tries"]);
    expect(run("var T=new TrieTrace();")).toEqual(["player", "lanes", "graphs", "tries"]);
    expect(run("mountTrieTabs(w,[]);")).toEqual(["player", "lanes", "graphs", "tries"]);
    // Word Search II pairs it with a board: naming the grid kind ships grids too
    expect(run("var T=new TrieTrace();var d={kind:'grid'};")).toEqual(["player", "lanes", "grids", "graphs", "tries"]);
  });

  it("lays children out in letter order, each parent over its children, and no two nodes share a place", () => {
    const K = trKit(), rnd = lcg(20260930);
    for (let t = 0; t < 150; t++) {
      const T = randomTrie(K, rnd), shape = K.trieShape(T), pos = K.graphTreeLayout(shape);
      expect(new Set(pos.map((p) => `${p.x},${p.d}`)).size).toBe(T.nodes.length);
      for (const n of T.nodes) {
        const kids = shape[n.id]!.kids;
        expect(kids.map((k) => T.nodes[k]!.ch)).toEqual(kids.map((k) => T.nodes[k]!.ch).sort());
        expect(pos[n.id]!.d).toBe(n.depth);
        if (kids.length) expect(pos[n.id]!.x).toBe((pos[kids[0]!]!.x + pos[kids[kids.length - 1]!]!.x) / 2);
        // a removed node keeps its slot: nothing drawn moves when a later node takes the letter back
        for (const k of kids) expect(pos[k]!.x).toBeGreaterThanOrEqual(pos[kids[0]!]!.x);
      }
    }
  });

  it("step k shows exactly what the first k events say, whatever order the steps are read in", () => {
    const K = trKit(), rnd = lcg(3030);
    for (let t = 0; t < 120; t++) {
      const T = randomTrie(K, rnd), steps = K.trieWalk(T);
      expect(steps.length).toBe(T.events.length + 2);
      const order = steps.map((_, k) => k).sort(() => rnd(3) - 1);
      for (const k of order) {
        // a reference that shares no code with the kit: replay the events on plain maps
        const st = new Map<number, { state: string | null; word: string; hit: boolean }>([[0, { state: "path", word: "", hit: false }]]);
        let cur = 0;
        for (const e of T.events.slice(0, Math.min(k, T.events.length))) {
          const n = st.get(e.node);
          if (e.ev === "make") { st.set(e.node, { state: "path", word: "", hit: false }); cur = e.node; }
          else if (e.ev === "go") { n!.state = "path"; cur = e.node; }
          else if (e.ev === "end") n!.word = e.word!;
          else if (e.ev === "unend") n!.word = "";
          else if (e.ev === "found") { n!.state = "found"; n!.hit = true; }
          else if (e.ev === "back") { n!.state = n!.hit ? "found" : e.dead ? "dead" : "explored"; cur = T.nodes[e.node]!.parent; }
          else if (e.ev === "drop") { st.delete(e.node); cur = T.nodes[e.node]!.parent; }
          else if (e.ev === "reset") { for (const v of st.values()) { v.state = null; v.hit = false; } st.get(0)!.state = "path"; cur = 0; }
        }
        const onPath = new Set<number>(); for (let n = cur; n >= 0; n = T.nodes[n]!.parent) onPath.add(n);
        const got = K.trieRead(steps[k]!);
        expect(Object.keys(got.nodes).map(Number).sort((a, b) => a - b)).toEqual([...st.keys()].sort((a, b) => a - b));
        for (const [id, want] of st) expect(got.nodes[id]).toEqual({ state: want.state, word: want.word });
        for (const [id, s] of Object.entries(got.edges)) expect(s).toBe(onPath.has(+id) ? "cur" : "idle");
        expect(Object.keys(got.edges).length).toBe(st.size - 1);
        expect(got.cursor).toBe(cur);
        // the drawn letters are the trie's, and the pure function agrees with what was drawn
        const g = lane(steps[k]!, "trie") as unknown as GraphLane;
        for (const id of st.keys()) expect(g.items[id]!.v).toBe(id ? T.nodes[id]!.ch : '""');
        expect(K.trieState(T, Math.min(k, T.events.length))).toEqual(got);
        // and every invariant the player shows holds on every step
        for (const [name, , holds] of K.TRIE_INV) expect(holds(steps[k]!), name).toBe(true);
      }
    }
  });

  it("a drawing that disagrees with the events is refused, and each invariant can fail", () => {
    const K = trKit(), T = new K.TrieTrace();
    T.make("c"); T.make("a"); T.make("r"); T.end("car"); T.reset(); T.go(T.child("c")); T.make("o");
    const steps = K.trieWalk(T), k = 7, drawn = steps[k]!, copy = () => JSON.parse(JSON.stringify(drawn)) as Snap;
    K.trieSame(K.trieState(T, k), K.trieRead(drawn), k);
    const toned = copy(); lane(toned, "trie").items[2]!.tone = "cur";
    expect(() => K.trieSame(K.trieState(T, k), K.trieRead(toned), k)).toThrow(/trie step 7: node 2/);
    const unworded = copy(); lane(unworded, "trie").items[3]!.sub = "";
    expect(() => K.trieSame(K.trieState(T, k), K.trieRead(unworded), k)).toThrow(/node 3/);
    const lit = copy(); (lane(lit, "trie") as unknown as GraphLane).edges.find((e) => e.b === 2)!.state = "cur";
    expect(() => K.trieSame(K.trieState(T, k), K.trieRead(lit), k)).toThrow(/edge into node 2/);
    const moved = copy(); lane(moved, "trie").marks.node = 1;
    expect(() => K.trieSame(K.trieState(T, k), K.trieRead(moved), k)).toThrow(/cursor/);
    const [path, parent, unique] = K.TRIE_INV;
    expect(path![2](drawn) && parent![2](drawn) && unique![2](drawn)).toBe(true);
    expect(path![2](lit)).toBe(false);
    const twice = copy(); (lane(twice, "trie") as unknown as GraphLane).edges.push({ a: 1, b: 2, w: null, state: "idle", key: "1>2x" } as unknown as GraphEdge);
    expect(parent![2](twice)).toBe(false);
    const same = copy(); (lane(same, "trie") as unknown as GraphLane).nodes[4]!.l = "a";
    expect(unique![2](same)).toBe(false);
  });

  it("rejects what would draw a structure that is not a trie", () => {
    const K = trKit(), T = new K.TrieTrace();
    expect(() => T.back(false)).toThrow(/at the root/);
    expect(() => T.drop()).toThrow(/root cannot be removed/);
    expect(() => T.end("")).toThrow(/empty prefix/);
    expect(() => T.make("ab")).toThrow(/one character/);
    const c = T.make("c");
    T.reset();
    expect(() => T.make("c")).toThrow(/already has a child c/);
    expect(() => T.miss("c")).toThrow(/does have a child c/);
    expect(() => T.go(99)).toThrow(/not a child/);
    T.go(c); T.make("a");
    expect(() => T.end("cx")).toThrow(/spells "ca"/);
    expect(() => T.unend()).toThrow(/no word ends/);
    T.end("ca"); expect(() => T.drop()).toThrow(/still ends the word ca/);
    T.back(false); expect(() => T.drop()).toThrow(/still has children/);
    expect(() => new K.TrieTrace().done()).toThrow(/empty/);
  });

  it("the specimen's walkthroughs match independent implementations", () => {
    const src = readFileSync(join(ARTIFACTS, "kit-players", "lesson.js"), "utf8");
    const cut = src.indexOf("\nmountLesson();");
    expect(cut).toBeGreaterThan(0);
    const K = trKit(src.slice(0, cut) + "\nthis.trieInsertSteps=trieInsertSteps;this.trieWildSteps=trieWildSteps;this.trieBoardSteps=trieBoardSteps;");
    const words = ["card", "cat"];
    const ins = K.trieInsertSteps!();
    expect(ins.answer).toEqual([["search", "car", words.includes("car")], ["search", "card", words.includes("card")], ["startsWith", "ca", words.some((w) => w.startsWith("ca"))]]);
    // the finished trie stores each word's letters once per shared prefix: c, a, r, d, t
    expect(ins.trace!.nodes.length).toBe(1 + new Set(words.flatMap((w) => [...w].map((_, i) => w.slice(0, i + 1)))).size);
    const wild = K.trieWildSteps!();
    expect(wild.answer).toBe(["bad", "bat", "cot"].some((w) => w.length === 3 && w.slice(1) === "ot"));
    expect(wild.states).toContain("dead");
    // Word Search II: a word is on a 2 × 2 board when some order of distinct neighbouring cells spells it
    const B = ["oa", "et"], cells = [[0, 0], [0, 1], [1, 0], [1, 1]] as const;
    const spells = (w: string) => {
      const perms = (xs: readonly (readonly [number, number])[], n: number): (readonly [number, number])[][] =>
        n === 0 ? [[]] : xs.flatMap((x, i) => perms([...xs.slice(0, i), ...xs.slice(i + 1)], n - 1).map((p) => [x, ...p]));
      return perms(cells, w.length).some((p) => p.every(([r, c], i) => B[r]![c] === w[i] && (i === 0 || Math.abs(r - p[i - 1]![0]) + Math.abs(c - p[i - 1]![1]) === 1)));
    };
    const board = K.trieBoardSteps!();
    expect((board.answer as string[]).slice().sort()).toEqual(["oat", "ate", "eat"].filter(spells).sort());
    // every found word was cleared so it is reported once; a word not on the board keeps its flag
    const left = Object.values(K.trieRead(board[board.length - 1]!).nodes).map((n) => n.word).filter(Boolean).sort();
    expect(left).toEqual(["oat", "ate", "eat"].filter((w) => !(board.answer as string[]).includes(w)).sort());
    expect(lane(board[board.length - 1]!, "w").items.map((x) => x!.v).sort()).toEqual((board.answer as string[]).slice().sort());
  });
});

/* cost plots (plots.js): a plot's model, read back and held to a reference written here. Drawing is the browser
   gate's job; what is tested here is that every snapshot says what the steps say, and that what it refuses is refused. */
type PlOp = (string | number | null)[];
type PlRows = [string, string][];
interface PlSnap { note: string; hi: string[]; fields: [string, string][]; plot: { cursor: number | null; shown: Record<string, number>; levels: Record<string, number>; ats: Record<string, number>; rows: { id: string; text: string }[]; ax: { x: { lo: number; hi: number }; y: { lo: number; hi: number } }; inv: [string, string, (s: PlSnap) => boolean][] | null } }
interface PlRead { shown: Record<string, number>; cursor: number | null; levels: Record<string, number>; ats: Record<string, number>; rows: PlRows; counts: [string, string][] }
interface PlTrace {
  events: { note: string; ops: PlOp[]; hi: string[] }[];
  step(note: string, ops: PlOp[], hi?: string[]): PlTrace;
  reveal(id: string, upTo?: number): PlOp; hide(id: string): PlOp; cursor(x: number | null): PlOp;
  level(n: string, y: number | null): PlOp; at(n: string, x: number | null): PlOp; count(n: string, v: unknown): PlOp; done(): PlTrace;
}
interface PlKit {
  PlotTrace: new (o: object) => PlTrace;
  plotWalk(T: PlTrace, o?: object): PlSnap[];
  plotState(T: PlTrace, k: number): PlRead;
  plotRead(s: PlSnap): PlRead;
  plotSame(w: PlRead, g: PlRead, k: number): void;
  plotCheck(d: number[][], want: (n: number) => unknown, what?: string): number[][];
  plotFmt(v: unknown): string;
  plotExtent(T: PlTrace): { x: { lo: number; hi: number }; y: { lo: number; hi: number } };
  plScale(a: object, p0: number, p1: number, gap: number): { map(v: number): number; ticks: number[] };
  plNiceHi(v: number): number;
  PlotModel: { prototype: { apply(op: PlOp): void } };
  PL_CLASSES: Record<string, [string, (n: number) => number]>;
  PL_INV: [string, string, (s: PlSnap) => boolean][];
  plLoopsSteps?(): PlSnap[]; plAppendSteps?(): PlSnap[]; plHardwareSteps?(): PlSnap[];
}
function plKit(extra = ""): PlKit {
  const ctx: Record<string, unknown> = {};
  const names = ["PlotTrace", "plotWalk", "plotState", "plotRead", "plotSame", "plotCheck", "plotFmt", "plotExtent", "plScale", "plNiceHi", "PlotModel", "PL_CLASSES", "PL_INV"];
  runInNewContext(readFileSync(join(ARTIFACTS, "kit", "plots.js"), "utf8") + "\n" + extra + "\n" + names.map((n) => `this.${n}=${n};`).join(""), ctx);
  return ctx as unknown as PlKit;
}
const grouped = (v: number) => v.toLocaleString("en-US");

/* a random walkthrough: integer-valued series, so the reference's readout needs only digit grouping */
function randomPlTrace(K: PlKit, rnd: (n: number) => number): PlTrace {
  const pts = (): number[][] => { const out: number[][] = []; for (let n = 1; n <= 20; n++) if (rnd(3)) out.push([n, rnd(500)]); return out.length ? out : [[3, 7]]; };
  const T = new K.PlotTrace({ x: { name: "n", lo: 0, hi: 20 }, y: { name: "work", lo: 0, hi: 600 }, series: [
    { id: "a", name: "measured", kind: "points", data: pts() },
    { id: "b", name: "bars", kind: "bars", data: pts() },
    { id: "c", name: "square", kind: "curve", of: (n: number) => n * n },
    { id: "r", name: "range", kind: "range", data: pts().map(([n, v]) => [n!, v!, v! + rnd(50)]) }] });
  const ids = ["a", "b", "c", "r"];
  for (let s = 0, n = 1 + rnd(12); s < n; s++) {
    const ops: PlOp[] = [];
    for (let o = 0, m = 1 + rnd(3); o < m; o++) {
      const r = rnd(7), id = ids[rnd(4)]!;
      if (r === 0) ops.push(T.reveal(id, rnd(3) ? rnd(21) : undefined));
      else if (r === 1) ops.push(T.hide(id));
      else if (r === 2) ops.push(T.cursor(rnd(5) ? rnd(21) : null));
      else if (r === 3) ops.push(T.level(rnd(2) ? "budget" : "cap", rnd(5) ? rnd(400) : null));
      else if (r === 4) ops.push(T.at(rnd(2) ? "n₀" : "cross", rnd(5) ? rnd(21) : null));
      else ops.push(T.count(rnd(2) ? "steps" : "total", rnd(99)));
    }
    T.step(`step ${s}`, ops, []);
  }
  return T;
}
/* what the plot must say after k steps, from the steps and the series alone */
function plReference(T: PlTrace, k: number, series: Record<string, (x: number) => number | number[] | null>, order: string[]) {
  const shown = new Map<string, number>(), levels = new Map<string, number>(), ats = new Map<string, number>(), counts = new Map<string, string>();
  let cursor: number | null = null;
  for (const e of T.events) for (const op of e.ops) if (op[0] === "count" && !counts.has(op[1] as string)) counts.set(op[1] as string, "–");
  for (const e of T.events.slice(0, k)) for (const op of e.ops) {
    if (op[0] === "reveal") shown.set(op[1] as string, op[2] as number);
    else if (op[0] === "hide") shown.delete(op[1] as string);
    else if (op[0] === "cursor") cursor = op[1] as number | null;
    else if (op[0] === "level") { if (op[2] === null) levels.delete(op[1] as string); else levels.set(op[1] as string, op[2] as number); }
    else if (op[0] === "at") { if (op[2] === null) ats.delete(op[1] as string); else ats.set(op[1] as string, op[2] as number); }
    else if (op[0] === "count") counts.set(op[1] as string, String(op[2]));
  }
  const rows: PlRows = order.map((id) => {
    if (!shown.has(id)) return [id, "not shown"];
    if (cursor === null) return [id, ""];
    if (cursor > shown.get(id)!) return [id, "–"];
    const v = series[id]!(cursor);
    return [id, v === null ? "–" : Array.isArray(v) ? `${grouped(v[0]!)}–${grouped(v[1]!)}` : grouped(v)];
  });
  return { shown: Object.fromEntries(shown), cursor, levels: Object.fromEntries(levels), ats: Object.fromEntries(ats), rows, counts: [...counts] };
}

describe("lesson artifacts kit: cost plots (plots.js)", () => {
  it("build.py ships plots.js for the static chart alone, and adds the player only where a plot is stepped through", () => {
    const run = (js: string) => {
      const r = spawnSync("python3", ["-c", `import sys,json;sys.path.insert(0,${JSON.stringify(ARTIFACTS)});import build;print(json.dumps(build.optional_kit(sys.stdin.read())))`], { input: js, encoding: "utf8" });
      if (r.status) throw new Error(r.stderr);
      return JSON.parse(r.stdout) as string[];
    };
    expect(run("costChart(host,{pts:[]});")).toEqual(["plots"]);
    expect(run("var T=new PlotTrace({});var s=plotWalk(T);")).toEqual(["plots"]);
    expect(run("mountPlotTabs(w,[]);")).toEqual(["player", "plots", "plotplayer"]);
    expect(run("var p=new PlotPlayer(h,{});")).toEqual(["player", "plots", "plotplayer"]);
  });

  it("every step reads back as the steps say, on random walkthroughs read in random order", () => {
    const K = plKit();
    let seed = 20260930;
    const rnd = (n: number) => ((seed = (seed * 1664525 + 1013904223) >>> 0), Math.floor((seed / 4294967296) * n));
    for (let t = 0; t < 150; t++) {
      const T = randomPlTrace(K, rnd) as PlTrace & { by: Record<string, { kind: string; of?: (n: number) => number; data?: number[][] }>; series: { id: string }[] };
      const at = (id: string) => (x: number) => {
        const s = T.by[id]!;
        if (s.of) return s.of(x);
        const hit = s.data!.find((p) => p[0] === x);
        return hit ? (hit.length === 3 ? [hit[1]!, hit[2]!] : hit[1]!) : null;
      };
      const steps = K.plotWalk(T), order = T.series.map((s) => s.id);
      const ks = steps.map((_, i) => i).sort(() => rnd(3) - 1);
      for (const k of ks) expect(K.plotRead(steps[k]!)).toEqual(plReference(T, k, { a: at("a"), b: at("b"), c: at("c"), r: at("r") }, order));
    }
  });

  it("a drawing that disagrees with the steps is refused, and a model that drops an operation fails the walk", () => {
    const K = plKit(), T = new K.PlotTrace({ x: { name: "n", lo: 0, hi: 10 }, y: { name: "work", lo: 0, hi: 100 },
      series: [{ id: "a", name: "counted", kind: "points", data: [[2, 4], [4, 16]] }] });
    T.step("go", [T.reveal("a"), T.cursor(4), T.level("budget", 50), T.at("n₀", 3), T.count("steps", 2)], ["a"]);
    const steps = K.plotWalk(T), good = steps[1]!, copy = () => { const c = { ...good, plot: { ...good.plot } }; c.plot.rows = good.plot.rows.map((r) => ({ ...r })); return c; };
    K.plotSame(K.plotState(T, 1), K.plotRead(good), 1);
    const row = copy(); row.plot.rows[0]!.text = "15";
    expect(() => K.plotSame(K.plotState(T, 1), K.plotRead(row), 1)).toThrow(/readout for a/);
    const cur = copy(); cur.plot.cursor = 2;
    expect(() => K.plotSame(K.plotState(T, 1), K.plotRead(cur), 1)).toThrow(/cursor/);
    const lv = copy(); lv.plot.levels = { budget: 40 };
    expect(() => K.plotSame(K.plotState(T, 1), K.plotRead(lv), 1)).toThrow(/levels/);
    const cnt = { ...copy(), fields: [["steps", "3"]] as [string, string][] };
    expect(() => K.plotSame(K.plotState(T, 1), K.plotRead(cnt), 1)).toThrow(/counter steps/);
    expect(() => K.plotSame(K.plotState(T, 0), K.plotRead(good), 0)).toThrow(/plot step 0/);
    // plant a fault in the model the view draws: it forgets named lines. The walk's own read-back must catch it.
    const apply = K.PlotModel.prototype.apply;
    K.PlotModel.prototype.apply = function (op: PlOp) { if (op[0] !== "level") apply.call(this, op); };
    try { expect(() => K.plotWalk(T)).toThrow(/plot step 1: levels/); } finally { K.PlotModel.prototype.apply = apply; }
  });

  it("refuses what would draw wrong or nothing", () => {
    const K = plKit(), ax = { x: { name: "n" }, y: { name: "work" } }, pts = { id: "a", name: "a", kind: "points", data: [[1, 1]] };
    const mk = (series: object[], o: object = {}) => new K.PlotTrace({ ...ax, ...o, series });
    expect(() => mk(Array.from({ length: 7 }, (_, i) => ({ ...pts, id: `s${i}` })))).toThrow(/no seventh ink/);
    expect(() => mk([pts, pts])).toThrow(/id of its own/);
    expect(() => mk([{ ...pts, kind: "pie" }])).toThrow(/kind is one of/);
    expect(() => mk([{ id: "c", name: "c", kind: "curve" }])).toThrow(/a curve is a formula/);
    expect(() => mk([{ id: "c", kind: "curve", cls: "cubic" }])).toThrow(/no class cubic/);
    expect(() => mk([{ id: "m", name: "m", kind: "points" }])).toThrow(/measured by running code/);
    expect(() => mk([{ ...pts, data: [[1, 1], [1, 2]] }])).toThrow(/given twice/);
    expect(() => mk([{ ...pts, data: [[1, NaN]] }])).toThrow(/finite numbers/);
    expect(() => mk([{ id: "r", name: "r", kind: "range", data: [[1, 5, 2]] }])).toThrow(/above the worst/);
    expect(() => mk([{ id: "b", name: "b", kind: "bars", data: [[1.5, 2]] }])).toThrow(/whole number/);
    expect(() => mk([{ ...pts, data: [[1, 0]] }], { y: { name: "w", scale: "log" } })).toThrow(/cannot sit on a log axis/);
    expect(() => mk([pts], { x: { name: "n", scale: "log", lo: 0, hi: 9 } })).toThrow(/starts above 0/);
    expect(() => mk([{ ...pts, name: "" }])).toThrow(/needs a name/);
    expect(() => mk([{ ...pts, tone: "good" }, { ...pts, id: "b", tone: "good" }])).toThrow(/share an ink/);
    expect(() => mk([pts], { y: { name: "w", scale: "sqrt" } })).toThrow(/scale is lin or log/);
    expect(() => new K.PlotTrace({ y: { name: "w" }, series: [pts] })).toThrow(/names its x axis/);
    const T = () => mk([pts]);
    expect(() => T().done()).toThrow(/empty/);
    expect(() => { const t = T(); t.step("x", [t.reveal("zz")]).done(); }).toThrow(/no series zz/);
    expect(() => { const t = T(); t.step("x", [["fly", 1]]).done(); }).toThrow(/unknown plot operation/);
    expect(() => { const t = T(); t.step("x", [t.cursor("far" as unknown as number)]).done(); }).toThrow(/not a number/);
  });

  it("plotCheck holds a measured series to its independent statement, and fails at the first n that differs", () => {
    const K = plKit(), d = [[1, 0], [2, 1], [3, 3], [4, 6]];
    expect(K.plotCheck(d, (n) => (n * (n - 1)) / 2)).toBe(d);
    expect(() => K.plotCheck([...d, [5, 11]], (n) => (n * (n - 1)) / 2, "triangle")).toThrow(/triangle: at n = 5 the count is 11 but should be 10/);
    expect(() => K.plotCheck([[3, 1, 3]], () => [1, 2])).toThrow(/at n = 3/);
  });

  it("numbers read as a reader says them, and axes fit what is drawn with ticks that leave room for their labels", () => {
    const K = plKit();
    expect(K.plotFmt(2016)).toBe("2,016");
    expect(K.plotFmt(2.5)).toBe("2.5");
    expect(K.plotFmt(1e12)).toBe("1 × 10¹²");
    expect(K.plotFmt(1.5e13)).toBe("1.5 × 10¹³");
    expect(K.plotFmt([1, 5])).toBe("1–5");
    expect(K.plotFmt(null)).toBe("–");
    expect(K.plotFmt(Infinity)).toBe("over 10³⁰⁸");
    expect(() => K.plotFmt(NaN)).toThrow(/not a number/);
    expect(K.plNiceHi(2016)).toBe(2500);
    expect(K.plNiceHi(96)).toBe(100);
    const lin = K.plScale({ scale: "lin", lo: 0, hi: 2500 }, 0, 200, 26);
    expect(lin.ticks).toEqual([0, 500, 1000, 1500, 2000, 2500]);
    for (let i = 1; i < lin.ticks.length; i++) expect(Math.abs(lin.map(lin.ticks[i]!) - lin.map(lin.ticks[i - 1]!))).toBeGreaterThanOrEqual(26);
    expect(K.plScale({ scale: "log", lo: 1, hi: 1e8 }, 0, 400, 26).ticks).toEqual([1, 10, 100, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8]);
    expect(K.plScale({ scale: "log", lo: 1, hi: 1e8 }, 0, 100, 26).ticks.length).toBeLessThanOrEqual(5);
    expect(K.plScale({ scale: "log", lo: 1, hi: 64 }, 0, 400, 26).ticks).toEqual([1, 2, 4, 8, 16, 32, 64]);
    // the extent covers every step, including a line that is later taken away, and keeps an axis the walkthrough set
    const T = new K.PlotTrace({ x: { name: "n" }, y: { name: "w" }, series: [{ id: "a", name: "a", kind: "points", data: [[2, 10], [9, 40]] }] });
    T.step("a", [T.reveal("a", 5), T.level("cap", 300)]).step("b", [T.level("cap", null)]);
    const e = K.plotExtent(T);
    expect([e.x.lo, e.x.hi, e.y.lo, e.y.hi]).toEqual([0, 2, 0, 300]);
    const S = new K.PlotTrace({ x: { name: "n", lo: 0, hi: 64 }, y: { name: "w", scale: "log", lo: 1, hi: 1e4 }, series: [{ id: "c", kind: "curve", cls: "n2" }] });
    S.step("a", [S.reveal("c")]);
    expect(K.plotExtent(S).y).toMatchObject({ lo: 1, hi: 1e4 });
  });

  it("the named classes are labelled as the app labels them", () => {
    const K = plKit();
    const app = readFileSync(join(__dirname, "..", "src", "components", "explorers", "BigOObservatory.tsx"), "utf8") +
      readFileSync(join(__dirname, "..", "src", "components", "md", "diagrams", "ComplexityCurveDiagram.tsx"), "utf8");
    const labels = new Set([...app.matchAll(/label: "(O\([^"]+\))"/g)].map((m) => m[1]));
    for (const [key, [label, f]] of Object.entries(K.PL_CLASSES)) {
      expect(labels.has(label), `${key}: ${label}`).toBe(true);
      expect(Number.isFinite(f(8))).toBe(true);
    }
    expect(K.PL_CLASSES.n2![1](8)).toBe(64);
    expect(K.PL_CLASSES.log![1](8)).toBe(3);
    expect(K.PL_CLASSES.exp![1](10)).toBe(1024);
  });

  /* the specimen's three walkthroughs count by running code; here each count meets a reference written from
     scratch, and every step's claims hold. The walkthrough functions are the specimen's own, from its source. */
  it("the specimen's loops, appends and hardware walkthroughs match independent references, and their claims hold", () => {
    const src = readFileSync(join(ARTIFACTS, "kit-players", "lesson.js"), "utf8"), start = src.indexOf("/* cost plots:"), cut = src.indexOf("\nmountLesson();");
    expect(start).toBeGreaterThan(0);
    expect(cut).toBeGreaterThan(start);
    const K = plKit(src.slice(start, cut) + "\nthis.plLoopsSteps=plLoopsSteps;this.plAppendSteps=plAppendSteps;this.plHardwareSteps=plHardwareSteps;");
    const loops = K.plLoopsSteps!(), appends = K.plAppendSteps!(), hw = K.plHardwareSteps!();
    const last = (s: PlSnap[]) => Object.fromEntries(K.plotRead(s[s.length - 1]!).rows);
    // doubling from 1 until reaching n takes ⌈log₂ n⌉ steps; the dependent loop is 0 + 1 + ⋯ + (n − 1)
    let tri = 0; for (let i = 0; i < 64; i++) tri += i;
    expect(last(loops)).toEqual({ dbl: String(Math.ceil(Math.log2(64))), lg: "6", nest: grouped(tri), sq: grouped(64 * 64) });
    // appends: simulate the capacities directly, charging a copy of everything at each doubling
    let cap = 1, total = 0;
    for (let i = 1; i <= 32; i++) { total += 1; if (i - 1 === cap) { total += cap; cap *= 2; } }
    expect(last(appends)).toMatchObject({ tot: String(total), lim: "96" });
    expect(total).toBeLessThanOrEqual(96);
    // the hardware tab's reach is the inverse of each cost under 10⁶ and then 10⁸, drawn as its vertical lines
    const inverse = (b: number) => ({ "n reaches": b, "n² reaches": Math.floor(Math.sqrt(b)), "2ⁿ reaches": Math.floor(Math.log(b) / Math.LN2) });
    expect(K.plotRead(hw[2]!)).toMatchObject({ levels: { budget: 1e6 }, ats: inverse(1e6) });
    expect(K.plotRead(hw[hw.length - 1]!)).toMatchObject({ levels: { budget: 1e8 }, ats: inverse(1e8) });
    expect(inverse(1e8)).toEqual({ "n reaches": 1e8, "n² reaches": 1e4, "2ⁿ reaches": 26 });
    // every step of every walkthrough keeps the plot's invariant and its own claims
    for (const s of [...loops, ...appends, ...hw]) for (const [short, , f] of [...K.PL_INV, ...(s.plot.inv || [])]) expect(f(s), `${s.note.slice(0, 40)}: ${short}`).toBe(true);
    // no counters: a count that grows from "–" to "100,000,000" wrapped the phone's invariant line mid-walkthrough
    expect(K.plotRead(hw[0]!).counts).toEqual([]);
  });
});
