import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { matches, type CompareMode } from "../src/lib/sandbox/compare";
import { checkProperty } from "../src/lib/sandbox/properties";
import {
  runJavaScript,
  runPython,
  pythonAvailable,
  type Outcome,
} from "./referenceRunner";
import {
  actualFor,
  expectedFor,
  judge,
  localiseOps,
  request,
  roundtripFor,
  sandboxFences,
} from "./helpers/sandboxCases";

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

const REF = join(__dirname, "reference");

const FENCES = sandboxFences();
const HAS_PYTHON = pythonAvailable();

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
      // Judge the starter by the same rule the learner will be judged by,
      // or a property-graded lesson would be checked against equality here.
      const passes = (o: Outcome, i: number) => {
        if (o.error) return false;
        if (f.spec.returns === "graph" && o.aliased === true) return false;
        if (typeof f.spec.property === "string") {
          const args = (f.spec.cases as { args: unknown[] }[])[i].args;
          return checkProperty(f.spec.property, actualFor(f, o, i), args) === null;
        }
        return matches(actualFor(f, o, i), expectedFor(f, i), compare);
      };
      const passed = outcomes.filter(passes);
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
    it(`${f.lesson} — JavaScript reference matches every case`, async () => {
      const file = join(REF, `${f.lesson}.js`);
      if (!existsSync(file)) return; // reported by the coverage test above
      const req = request(f, readFileSync(file, "utf8"));
      req.cases = localiseOps(f, "javascript");
      const outcomes = await runJavaScript(req);

      expect(judge(f, outcomes)).toEqual([]);
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
      req.roundtrip = roundtripFor(f, "python");
      const outcomes = runPython(req);

      expect(judge(f, outcomes)).toEqual([]);
    });
  }
});
