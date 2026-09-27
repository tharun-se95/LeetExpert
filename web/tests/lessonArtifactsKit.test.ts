import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { runInNewContext } from "node:vm";

/**
 * The lane model behind the stack and queue player (lesson-artifacts/kit/stacks.js, #22).
 *
 * Every lane view draws a snapshot, so a snapshot that misstates the structure teaches the wrong
 * thing however well it is drawn. The model is held here to a plain array, on random operations,
 * the way build-a-linked-list's load check holds its list. How it is drawn is the browser gate's
 * job: the kit-players specimen runs the player through every shape in both themes.
 */
const ARTIFACTS = join(__dirname, "..", "lesson-artifacts");

type Item = { id: number; v: string; sub: string | null; tone: string | null } | null;
type Lane = { id: string; kind: string; items: Item[]; marks: Record<string, number> };
type Snap = { note: string; lanes: Lane[]; ends: Record<string, string>; fields: [string, unknown][] };
interface Model {
  push(id: string, v: unknown, sub?: unknown): { id: number; v: unknown };
  pushFront(id: string, v: unknown): { id: number };
  pop(id: string, front?: boolean): { id: number; v: unknown };
  popFront(id: string): { id: number; v: unknown };
  move(from: string, to: string, fromFront?: boolean, toFront?: boolean): { id: number; v: unknown };
  put(id: string, slot: number, v: unknown): { id: number };
  clear(id: string, slot: number): { id: number; v: unknown };
  set(it: object, v?: unknown, sub?: unknown): object;
  mark(id: string, name: string, slot: number | null): void;
  size(id: string): number;
  snap(note: string, o?: object): Snap;
}
type Kit = { Lanes: new (defs: object[], o?: object) => Model };

/* stacks.js shares one scope with the rest of the kit; its model half needs no DOM to run */
function kit(): Kit {
  const ctx: Record<string, unknown> = {};
  runInNewContext(readFileSync(join(ARTIFACTS, "kit", "stacks.js"), "utf8") + "\nthis.Lanes=Lanes;", ctx);
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
});

describe("lesson artifacts kit: build.py ships a player with its chrome", () => {
  const optional = (js: string) => {
    const run = spawnSync("python3", ["-c", `import sys,json;sys.path.insert(0,${JSON.stringify(ARTIFACTS)});import build;print(json.dumps(build.optional_kit(sys.stdin.read())))`], { input: js, encoding: "utf8" });
    if (run.status) throw new Error(run.stderr);
    return JSON.parse(run.stdout) as string[];
  };
  it("the step player comes first, once, whichever players a lesson uses", () => {
    expect(optional("var M=new Lanes([])")).toEqual(["player", "stacks"]);
    expect(optional("new ListPlayer(h)")).toEqual(["player", "lists"]);
    expect(optional("new ListPlayer(h);new LanePlayer(h)")).toEqual(["player", "lists", "stacks"]);
    expect(optional("drawTheHero()")).toEqual([]);
  });
});
