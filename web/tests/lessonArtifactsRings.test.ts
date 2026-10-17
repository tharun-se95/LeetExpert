import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { runInNewContext } from "node:vm";

/* residue rings (kit/rings.js, #141): a ring's model, read back and held to a reference written here, and every
   Python answer a ring shows held to python3 itself. Drawing is the browser gate's job. Spec:
   docs/superpowers/specs/2026-10-18-residue-ring-player-design.md */
const ARTIFACTS = join(__dirname, "..", "lesson-artifacts");

type RgOp = (string | number | null)[];
type RgRow = [string, string, string, string, string];
interface RgRead { at: Record<string, number>; from: Record<string, number | null>; rows: RgRow[]; counts: [string, string][] }
interface RgSnap {
  note: string; hi: string[]; fields: [string, string][];
  ring: { T: RgTrace; at: Record<string, number>; from: Record<string, number | null>; inv: [string, string, (s: RgSnap) => boolean][] | null;
    rows: { id: string; on: boolean; cell?: number; turns?: number; text: string; eq: string; expr?: string; py: string; js: string }[] };
}
interface RgTrace {
  m: number; name: string; cells: string[]; langs: boolean; tokens: { id: string; name: string; ink: string }[];
  events: { note: string; ops: RgOp[]; hi: string[] }[];
  step(note: string, ops: RgOp[], hi?: string[]): RgTrace;
  put(id: string, at: number | null): RgOp; walk(id: string, by: number): RgOp; count(n: string, v: unknown): RgOp; done(): RgTrace;
}
interface RgKit {
  RingTrace: new (o: object) => RgTrace;
  ringWalk(T: RgTrace, o?: object): RgSnap[];
  ringState(T: RgTrace, k: number): RgRead;
  ringRead(s: RgSnap): RgRead;
  ringSame(w: RgRead, g: RgRead, k: number): void;
  rgFloorMod(a: number, m: number): number;
  rgSpan(by: number, m: number): number;
  RingModel: { prototype: { apply(op: RgOp): void } };
  RG_INV: [string, string, (s: RgSnap) => boolean][];
  RG_LAPS: number;
  rgClockSteps?(): RgSnap[]; rgWrapSteps?(): RgSnap[]; rgHashSteps?(): RgSnap[];
}
function rgKit(extra = ""): RgKit {
  const ctx: Record<string, unknown> = {};
  const names = ["RingTrace", "ringWalk", "ringState", "ringRead", "ringSame", "rgFloorMod", "rgSpan", "RingModel", "RG_INV", "RG_LAPS"];
  runInNewContext(readFileSync(join(ARTIFACTS, "kit", "rings.js"), "utf8") + "\n" + extra + "\n" + names.map((n) => `this.${n}=${n};`).join(""), ctx);
  return ctx as unknown as RgKit;
}
/* python3's own answers: one process for a whole list of [a, m] */
function pythonMod(pairs: [number, number][]): number[] {
  const r = spawnSync("python3", ["-c", "import sys,json;print(json.dumps([a % m for a, m in json.load(sys.stdin)]))"], { input: JSON.stringify(pairs), encoding: "utf8" });
  if (r.status) throw new Error(r.stderr);
  return JSON.parse(r.stdout) as number[];
}
/* a number as the readout prints it, from scratch: grouped digits and a true minus sign; JavaScript's -0 kept */
const say = (v: number) => (Object.is(v, -0) ? "−0" : (v < 0 ? "−" : "") + Math.abs(v).toLocaleString("en-US"));

/* what the ring must say after k steps: the cell by BigInt remainder, which neither the kit's floor division nor its
   shifted remainder uses */
function rgReference(T: RgTrace, k: number): RgRead {
  const at = new Map<string, number>(), from = new Map<string, number | null>(), counts = new Map<string, string>();
  for (const e of T.events) for (const op of e.ops) if (op[0] === "count" && !counts.has(op[1] as string)) counts.set(op[1] as string, "–");
  for (const e of T.events.slice(0, k)) for (const op of e.ops) {
    const id = op[1] as string;
    if (op[0] === "put") { if (op[2] === null) { at.delete(id); from.delete(id); } else { at.set(id, op[2] as number); from.set(id, null); } }
    else if (op[0] === "walk") { from.set(id, at.get(id)!); at.set(id, at.get(id)! + (op[2] as number)); }
    else if (op[0] === "count") counts.set(id, String(op[2]));
  }
  const rows = T.tokens.map((t): RgRow => {
    if (!at.has(t.id)) return [t.id, "not on the ring", "", "", ""];
    const a = at.get(t.id)!, M = BigInt(T.m), cell = Number(((BigInt(a) % M) + M) % M), turns = (a - cell) / T.m;
    return [t.id, `${T.name} ${T.cells[cell]}`, `${say(a)} = ${say(turns)} × ${T.m} + ${cell}`, T.langs ? say(cell) : "", T.langs ? say(a % T.m) : ""];
  });
  return { at: Object.fromEntries(at), from: Object.fromEntries(from), rows, counts: [...counts] };
}
function randomRgTrace(K: RgKit, rnd: (n: number) => number): RgTrace {
  const m = 2 + rnd(23), ids = ["a", "b", "c"];
  const T = new K.RingTrace({ m, langs: !!rnd(2), name: rnd(2) ? "slot" : "bucket", tokens: ids.map((id) => ({ id, name: `token ${id}` })) });
  const on = new Set<string>();
  for (let s = 0, n = 1 + rnd(12); s < n; s++) {
    const ops: RgOp[] = [];
    for (let o = 0, c = 1 + rnd(3); o < c; o++) {
      const r = rnd(6), id = ids[rnd(3)]!;
      if (r === 0 || !on.has(id)) { ops.push(T.put(id, rnd(5) ? rnd(4 * m) - 2 * m : 0)); on.add(id); }
      else if (r === 1) { ops.push(T.put(id, null)); on.delete(id); }
      else if (r === 2) ops.push(T.count(rnd(2) ? "collisions" : "keys", rnd(9)));
      else ops.push(T.walk(id, rnd(2) ? rnd(3 * m) - Math.floor(1.5 * m) : (rnd(2) ? 1 : -1) * (5 * m + rnd(m))));
    }
    T.step(`step ${s}`, ops, []);
  }
  return T;
}

describe("lesson artifacts kit: residue rings (rings.js)", () => {
  it("build.py ships rings.js, after the player, only to a lesson that draws a ring", () => {
    const run = (js: string) => {
      const r = spawnSync("python3", ["-c", `import sys,json;sys.path.insert(0,${JSON.stringify(ARTIFACTS)});import build;print(json.dumps(build.optional_kit(sys.stdin.read())))`], { input: js, encoding: "utf8" });
      if (r.status) throw new Error(r.stderr);
      return JSON.parse(r.stdout) as string[];
    };
    expect(run("var T=new RingTrace({m:5});var s=ringWalk(T);")).toEqual(["player", "rings"]);
    expect(run("mountRingTabs(w,[]);")).toEqual(["player", "rings"]);
    expect(run("costChart(host,{pts:[]});")).not.toContain("rings");
  });

  it("every step reads back as the steps say, on random walkthroughs read in random order", () => {
    const K = rgKit();
    let seed = 20261018;
    const rnd = (n: number) => ((seed = (seed * 1664525 + 1013904223) >>> 0), Math.floor((seed / 4294967296) * n));
    for (let t = 0; t < 200; t++) {
      const T = randomRgTrace(K, rnd), steps = K.ringWalk(T), ks = steps.map((_, i) => i).sort(() => rnd(3) - 1);
      for (const k of ks) {
        expect(K.ringRead(steps[k]!)).toEqual(rgReference(T, k));
        for (const [short, , f] of K.RG_INV) expect(f(steps[k]!), short).toBe(true);
      }
    }
  });

  it("a drawing that disagrees with the steps is refused, and a model that drops an operation fails the walk", () => {
    const K = rgKit(), T = new K.RingTrace({ m: 5, langs: true, tokens: [{ id: "a", name: "8" }] });
    T.step("put", [T.put("a", 0)]).step("walk", [T.walk("a", 8), T.count("turns", 1)]);
    const steps = K.ringWalk(T), good = steps[2]!;
    const copy = () => ({ ...good, ring: { ...good.ring, at: { ...good.ring.at }, rows: good.ring.rows.map((r) => ({ ...r })) } });
    K.ringSame(K.ringState(T, 2), K.ringRead(good), 2);
    const row = copy(); row.ring.rows[0]!.text = "slot 2";
    expect(() => K.ringSame(K.ringState(T, 2), K.ringRead(row), 2)).toThrow(/readout for a/);
    const py = copy(); py.ring.rows[0]!.py = "−2";
    expect(() => K.ringSame(K.ringState(T, 2), K.ringRead(py), 2)).toThrow(/readout for a/);
    const pos = copy(); pos.ring.at.a = 3;
    expect(() => K.ringSame(K.ringState(T, 2), K.ringRead(pos), 2)).toThrow(/ring step 2: at/);
    const cnt = { ...copy(), fields: [["turns", "2"]] as [string, string][] };
    expect(() => K.ringSame(K.ringState(T, 2), K.ringRead(cnt), 2)).toThrow(/counter turns/);
    // the ring's own invariant catches a cell that disagrees with the position
    const cell = copy(); cell.ring.rows[0]!.cell = 2;
    expect(K.RG_INV[0]![2](cell)).toBe(false);
    const apply = K.RingModel.prototype.apply;
    K.RingModel.prototype.apply = function (op: RgOp) { if (op[0] !== "walk") apply.call(this, op); };
    try { expect(() => K.ringWalk(T)).toThrow(/ring step 2: at/); } finally { K.RingModel.prototype.apply = apply; }
  });

  it("refuses what it cannot draw or would draw wrong", () => {
    const K = rgKit(), tk = [{ id: "a", name: "a" }];
    expect(() => new K.RingTrace({ m: 1, tokens: tk })).toThrow(/2 to 24 cells/);
    expect(() => new K.RingTrace({ m: 25, tokens: tk })).toThrow(/2 to 24 cells/);
    expect(() => new K.RingTrace({ m: 2.5, tokens: tk })).toThrow(/2 to 24 cells/);
    expect(() => new K.RingTrace({ m: 3, cells: ["a", "b"], tokens: tk })).toThrow(/names each of the 3/);
    expect(() => new K.RingTrace({ m: 2, cells: ["a", "a"], tokens: tk })).toThrow(/name of its own/);
    expect(() => new K.RingTrace({ m: 5, tokens: [] })).toThrow(/at least one token/);
    expect(() => new K.RingTrace({ m: 5, tokens: "abcdefg".split("").map((id) => ({ id, name: id })) })).toThrow(/no seventh ink/);
    expect(() => new K.RingTrace({ m: 5, tokens: [{ id: "a" }] })).toThrow(/needs a name/);
    expect(() => new K.RingTrace({ m: 5, tokens: [{ id: "a", name: "a", tone: "good" }, { id: "b", name: "b", tone: "good" }] })).toThrow(/share an ink/);
    const T = () => new K.RingTrace({ m: 5, tokens: tk });
    expect(() => { const t = T(); t.step("x", [t.walk("a", 1)]).done(); }).toThrow(/put it on the ring first/);
    expect(() => { const t = T(); t.step("x", [t.put("a", 0.5)]).done(); }).toThrow(/not a whole number/);
    expect(() => { const t = T(); t.step("x", [t.put("a", 0), t.walk("a", 1.5)]).done(); }).toThrow(/not a whole number of cells/);
    expect(() => { const t = T(); t.step("x", [t.put("z", 0)]).done(); }).toThrow(/no token z/);
    expect(() => { const t = T(); t.step("x", [["spin", "a", 1]]).done(); }).toThrow(/unknown ring operation/);
    expect(() => T().done()).toThrow(/empty ring walkthrough/);
  });

  it("Python's answer is Python's: the kit's floor remainder matches python3 on every signed operand and ring size", () => {
    const K = rgKit(), pairs: [number, number][] = [];
    for (let m = 2; m <= 24; m++) for (let a = -60; a <= 60; a++) pairs.push([a, m]);
    pairs.push([-1_000_000_007, 7], [10 ** 15, 13], [-(10 ** 15), 24]);
    const py = pythonMod(pairs);
    pairs.forEach(([a, m], i) => expect(K.rgFloorMod(a, m), `${a} % ${m}`).toBe(py[i]));
  });

  it("a long walk glides through at most RG_LAPS turns and still ends on its cell", () => {
    const K = rgKit();
    for (let m = 2; m <= 24; m++) for (const by of [1, -1, m, -m, 3 * m, -3 * m, 3 * m + 1, -(3 * m + 1), 40 * m + 3, -(40 * m + 3)]) {
      const span = K.rgSpan(by, m);
      expect(Math.abs(span), `${by} on ${m}`).toBeLessThanOrEqual(K.RG_LAPS * m);
      expect(Math.sign(span)).toBe(Math.sign(by));
      expect(((span - by) % m + m) % m).toBe(0);
    }
  });

  /* the specimen's three walkthroughs, from its own source: every Python answer they show is run in python3, every
     JavaScript answer is % in this runtime, and every step keeps the ring's invariant and the walkthrough's claims */
  it("the specimen's rings show each language's own answer, and land where walking one cell at a time lands", () => {
    const src = readFileSync(join(ARTIFACTS, "kit-players", "lesson.js"), "utf8"), start = src.indexOf("/* ---------- residue rings"), cut = src.indexOf("\n/* ---------- pointer lists");
    expect(start).toBeGreaterThan(0);
    expect(cut).toBeGreaterThan(start);
    const K = rgKit(src.slice(start, cut) + "\nthis.rgClockSteps=rgClockSteps;this.rgWrapSteps=rgWrapSteps;this.rgHashSteps=rgHashSteps;");
    const tabs = [K.rgClockSteps!(), K.rgWrapSteps!(), K.rgHashSteps!()], shown: [number, number, string, string][] = [];
    for (const steps of tabs) for (const s of steps) {
      for (const [short, , f] of [...K.RG_INV, ...(s.ring.inv || [])]) expect(f(s), `${s.note.slice(0, 40)}: ${short}`).toBe(true);
      for (const r of s.ring.rows) if (r.on && r.expr) shown.push([s.ring.at[r.id]!, s.ring.T.m, r.py, r.js]);
    }
    expect(shown.length).toBeGreaterThan(10);
    const py = pythonMod(shown.map(([a, m]) => [a, m]));
    shown.forEach(([a, m, p, j], i) => {
      expect(p, `Python ${a} % ${m}`).toBe(say(py[i]!));
      expect(j, `JavaScript ${a} % ${m}`).toBe(say(a % m));
    });
    const last = (s: RgSnap[]) => Object.fromEntries(K.ringRead(s[s.length - 1]!).rows.map((r) => [r[0], r.slice(1)]));
    expect(last(tabs[0]!)).toEqual({ p: ["slot 3", "8 = 1 × 5 + 3", "3", "3"], n: ["slot 3", "−7 = −2 × 5 + 3", "3", "−2"] });
    expect(last(tabs[1]!)).toMatchObject({ i: ["index 0", "5 = 1 × 5 + 0", "0", "0"], j: ["index 4", "−1 = −1 × 5 + 4", "4", "−1"] });
    expect(last(tabs[2]!)).toMatchObject({ a: ["bucket 1", "15 = 2 × 7 + 1", "1", "1"], b: ["bucket 1", "22 = 3 × 7 + 1", "1", "1"], d: ["bucket 6", "−8 = −2 × 7 + 6", "6", "−1"] });
  });
});
