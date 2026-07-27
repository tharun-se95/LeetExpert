import { describe, it, expect } from "vitest";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { matches, type CompareMode } from "../src/lib/sandbox/compare";
import {
  runJavaScript,
  runPython,
  pythonAvailable,
  type Outcome,
  type RunRequest,
} from "./referenceRunner";

/**
 * Proves every sandbox expectation by execution.
 *
 * The standard is that no expected value is ever hand-written. This is what
 * enforces it: for each sandbox fence there is a checked-in reference
 * solution per language, and both are run against the committed cases. A
 * mismatch fails the build.
 *
 * It also catches the failure mode a single-language check cannot: Python
 * and JavaScript disagree on integer division of negatives, sort stability
 * and string iteration, so a case verified in one runtime proves nothing
 * about the other. Both must agree with the stored answer.
 */

const COURSE = join(__dirname, "..", "..", "course");
const REF = join(__dirname, "reference");

interface Fence {
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

function sandboxFences(): Fence[] {
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

const FENCES = sandboxFences();
const HAS_PYTHON = pythonAvailable();

function request(f: Fence, source: string): RunRequest {
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
  };
}

/** Mirrors useRunner: derive the compared value from the raw outcome. */
function actualFor(f: Fence, outcome: Outcome, index: number): unknown {
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

function expectedFor(f: Fence, index: number): unknown {
  const check = (f.spec.check as string) ?? "return";
  const c = (f.spec.cases as Record<string, unknown>[])[index];
  if (check === "sequence") {
    const ops = (c.ops as [string, unknown[], unknown][]) ?? [];
    return ops.map((op) => op[2]);
  }
  return c.expect;
}

/** Sequence op names differ per language exactly as function names do. */
function localiseOps(f: Fence, lang: "python" | "javascript"): unknown[] {
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

/**
 * The starter must FAIL.
 *
 * Added after a sabotage check went unnoticed: valid-parentheses had no case
 * ending in an unclosed opener, so deleting the final emptiness check broke
 * nothing. A reference passing is only half the guarantee — it says the
 * answers are right, not that the cases can tell right from wrong.
 *
 * Requiring the untouched starter to fail every sandbox is the cheap,
 * deterministic form of that second half: if doing nothing passes, the case
 * set proves nothing. (Full mutation testing is the stronger tool, but
 * equivalent mutants make it noisy rather than pass/fail.)
 */
describe("case sets are load-bearing", () => {
  for (const f of FENCES) {
    const compare = ((f.spec.compare as string) ?? "exact") as CompareMode;

    it(`${f.lesson} — the starter does not pass`, async () => {
      const starter = (f.spec.starter as Record<string, string>).javascript;
      const req = request(f, starter);
      req.cases = localiseOps(f, "javascript");

      let outcomes: Outcome[];
      try {
        outcomes = await runJavaScript(req);
      } catch {
        return; // a starter that will not even compile plainly fails
      }
      const passed = outcomes.filter(
        (o, i) => !o.error && matches(actualFor(f, o, i), expectedFor(f, i), compare),
      );
      expect(
        passed.length,
        `${passed.length} of ${outcomes.length} cases pass with the untouched starter — those cases cannot detect a wrong answer`,
      ).toBeLessThan(outcomes.length);
    });
  }
});

describe("reference solutions prove every expectation", () => {
  it("python3 is available to the test runner", () => {
    // Without it, half the guarantee silently disappears.
    expect(HAS_PYTHON).toBe(true);
  });

  it("every sandbox has a reference solution in both languages", () => {
    const missing: string[] = [];
    for (const f of FENCES) {
      for (const [lang, ext] of [
        ["javascript", "js"],
        ["python", "py"],
      ] as const) {
        if (!existsSync(join(REF, `${f.lesson}.${ext}`))) {
          missing.push(`${f.lesson} — missing ${lang} reference`);
        }
      }
    }
    expect(missing).toEqual([]);
  });

  for (const f of FENCES) {
    const compare = ((f.spec.compare as string) ?? "exact") as CompareMode;

    it(`${f.lesson} — JavaScript reference matches every case`, async () => {
      const file = join(REF, `${f.lesson}.js`);
      if (!existsSync(file)) return; // reported by the coverage test above
      const req = request(f, readFileSync(file, "utf8"));
      req.cases = localiseOps(f, "javascript");
      const outcomes = await runJavaScript(req);

      const bad: string[] = [];
      outcomes.forEach((o, i) => {
        if (o.error) return bad.push(`case ${i} threw: ${o.error}`);
        if (!matches(actualFor(f, o, i), expectedFor(f, i), compare)) {
          bad.push(
            `case ${i}: expected ${JSON.stringify(expectedFor(f, i))}, reference produced ${JSON.stringify(actualFor(f, o, i))}`,
          );
        }
      });
      expect(bad).toEqual([]);
    });

    it(`${f.lesson} — Python reference matches every case`, () => {
      const file = join(REF, `${f.lesson}.py`);
      if (!existsSync(file) || !HAS_PYTHON) return;
      const fn = f.spec.fn as Record<string, string>;
      const cls = f.spec.class as Record<string, string> | undefined;
      const req = request(f, readFileSync(file, "utf8"));
      req.fnName = fn.python;
      req.cls = cls?.python ?? null;
      req.cases = localiseOps(f, "python");
      const outcomes = runPython(req);

      const bad: string[] = [];
      outcomes.forEach((o, i) => {
        if (o.error) return bad.push(`case ${i} threw: ${o.error}`);
        if (!matches(actualFor(f, o, i), expectedFor(f, i), compare)) {
          bad.push(
            `case ${i}: expected ${JSON.stringify(expectedFor(f, i))}, reference produced ${JSON.stringify(actualFor(f, o, i))}`,
          );
        }
      });
      expect(bad).toEqual([]);
    });
  }
});
