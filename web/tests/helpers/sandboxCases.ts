import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { matches, type CompareMode } from "../../src/lib/sandbox/compare";
import { checkProperty } from "../../src/lib/sandbox/properties";
import type { Outcome, RunRequest } from "../referenceRunner";

/**
 * Reading the course's sandbox fences and judging a solution against them,
 * shared by the reference-solution tests and the lesson-artifact tests so
 * that "passes the lesson's cases" means the same thing in both.
 */

export const COURSE = join(__dirname, "..", "..", "..", "courses", "dsa");

export interface Fence {
  lesson: string;
  line: number;
  spec: Record<string, unknown>;
}

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const e of readdirSync(dir)) {
    const full = join(dir, e);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (e.endsWith(".md")) out.push(full);
  }
  return out;
}

export function sandboxFences(): Fence[] {
  const found: Fence[] = [];
  for (const path of walk(COURSE)) {
    const rel = relative(COURSE, path).replace(/\.md$/, "");
    const lines = readFileSync(path, "utf8").split("\n");
    for (let i = 0; i < lines.length; i++) {
      if (!/^```sandbox\s*$/.test(lines[i])) continue;
      const buf: string[] = [];
      let j = i + 1;
      for (; j < lines.length && lines[j].trimEnd() !== "```"; j++) buf.push(lines[j]);
      found.push({ lesson: rel, line: i + 1, spec: JSON.parse(buf.join("\n")) });
      i = j;
    }
  }
  return found;
}


export function request(f: Fence, source: string): RunRequest {
  const fn = f.spec.fn as Record<string, string>;
  const cls = f.spec.class as Record<string, string> | undefined;
  return {
    source,
    fnName: fn.javascript,
    cls: cls?.javascript ?? null,
    cases: f.spec.cases as unknown[],
    arg: typeof f.spec.arg === "number" ? f.spec.arg : 0,
    check: (f.spec.check as string) ?? "return",
    shape: (f.spec.shape as Record<string, string>) ?? {},
    returns: (f.spec.returns as string) ?? "value",
    roundtrip: roundtripFor(f, "javascript"),
  };
}

/** `roundtrip`'s [encode, decode] pair for one language. */
export function roundtripFor(f: Fence, lang: "python" | "javascript"): string[] | undefined {
  const rec = f.spec.roundtrip as Record<string, string[]> | undefined;
  return rec?.[lang];
}

/** Mirrors useRunner: derive the compared value from the raw outcome. */
export function actualFor(f: Fence, outcome: Outcome, index: number): unknown {
  const check = (f.spec.check as string) ?? "return";
  const cases = f.spec.cases as Record<string, unknown>[];
  if (check === "sequence") {
    const ops = (cases[index].ops as [string, unknown[], unknown][]) ?? [];
    const got = outcome.opResults ?? [];
    return ops.map((op, i) => (op[2] === null ? null : got[i]));
  }
  if (check === "mutate") return outcome.argAfter;
  if (check === "prefix") {
    const k = typeof outcome.ret === "number" ? outcome.ret : NaN;
    return Array.isArray(outcome.argAfter)
      ? outcome.argAfter.slice(0, Number.isFinite(k) ? k : 0)
      : outcome.argAfter;
  }
  return outcome.ret;
}

export function expectedFor(f: Fence, index: number): unknown {
  const check = (f.spec.check as string) ?? "return";
  const c = (f.spec.cases as Record<string, unknown>[])[index];
  if (check === "sequence") {
    const ops = (c.ops as [string, unknown[], unknown][]) ?? [];
    return ops.map((op) => op[2]);
  }
  return c.expect;
}

/** Sequence op names differ per language exactly as function names do. */
export function localiseOps(f: Fence, lang: "python" | "javascript"): unknown[] {
  const methods = (f.spec.methods as Record<string, Record<string, string>>) ?? {};
  const cases = f.spec.cases as Record<string, unknown>[];
  if ((f.spec.check as string) !== "sequence") return cases;
  return cases.map((c) => ({
    ...c,
    ops: ((c.ops as [string, unknown[], unknown][]) ?? []).map(([m, a, e]) => [
      methods[m]?.[lang] ?? m,
      a,
      e,
    ]),
  }));
}


/** Judges a run the way `useRunner` does; returns one message per failing case. */
export function judge(f: Fence, outcomes: Outcome[]): string[] {
  const compare = ((f.spec.compare as string) ?? "exact") as CompareMode;
  const bad: string[] = [];
  outcomes.forEach((o, i) => {
    if (o.error) return bad.push(`case ${i} threw: ${o.error}`);
    // A clone that reuses input nodes serialises identically to a correct one.
    if (f.spec.returns === "graph" && o.aliased === true) {
      return bad.push(`case ${i}: returned the input's own nodes, not a copy`);
    }
    // Several-correct-answers problems are graded by a property.
    if (typeof f.spec.property === "string") {
      const args = (f.spec.cases as { args: unknown[] }[])[i].args;
      const why = checkProperty(f.spec.property, actualFor(f, o, i), args);
      if (why) bad.push(`case ${i}: ${why}`);
      return;
    }
    if (!matches(actualFor(f, o, i), expectedFor(f, i), compare)) {
      bad.push(
        `case ${i}: expected ${JSON.stringify(expectedFor(f, i))}, produced ${JSON.stringify(actualFor(f, o, i))}`,
      );
    }
  });
  return bad;
}
