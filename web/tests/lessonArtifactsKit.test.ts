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
    expect(optional("drawTheHero()")).toEqual([]);
  });
});
