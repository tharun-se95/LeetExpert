import { describe, it, expect } from "vitest";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { runJavaScript, runPython, pythonAvailable } from "./referenceRunner";
import { judge, localiseOps, request, roundtripFor, sandboxFences } from "./helpers/sandboxCases";

/**
 * A mistake a lesson warns about must fail that lesson's sandbox.
 *
 * The reference tests prove the answers are right, and the starter test
 * proves doing nothing fails. Neither notices a case set that passes the
 * very bug the lesson teaches against: Partition Equal Subset Sum spends a
 * section on why the capacity loop must run in reverse, and the forward
 * loop passed all seven of its cases (#164), so a learner who made the
 * mistake was told they were right.
 *
 * Each file in tests/mistakes/<module>/<lesson>.<mistake>.{py,js} is such a
 * wrong solution. It must fail at least one of the lesson's cases, in both
 * runtimes, because the same bug can pass in one language and not the other.
 */

const DIR = join(__dirname, "mistakes");
const FENCES = sandboxFences();

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((e) => {
    const full = join(dir, e);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

// "dynamic-programming/coin-change.each-coin-once" -> its lesson and name
const MISTAKES = [...new Set(walk(DIR).map((p) => relative(DIR, p).replace(/\.(py|js)$/, "")))].sort();

describe("the mistakes lessons warn about fail their sandboxes", () => {
  it("python3 is available to the test runner", () => {
    expect(pythonAvailable()).toBe(true);
  });

  for (const id of MISTAKES) {
    const lesson = id.slice(0, id.lastIndexOf("."));
    const f = FENCES.find((x) => x.lesson === lesson);

    it(`${id} — names a lesson with a sandbox, in both languages`, () => {
      expect(f, `no sandbox for ${lesson}`).toBeDefined();
      expect(existsSync(join(DIR, `${id}.py`)) && existsSync(join(DIR, `${id}.js`))).toBe(true);
    });
    if (!f) continue;

    it(`${id} — fails a case in JavaScript`, async () => {
      const req = request(f, readFileSync(join(DIR, `${id}.js`), "utf8"));
      req.cases = localiseOps(f, "javascript");
      expect(judge(f, await runJavaScript(req)), "every case passes with this mistake in it").not.toEqual([]);
    });

    it(`${id} — fails a case in Python`, () => {
      const fn = f.spec.fn as Record<string, string>;
      const cls = f.spec.class as Record<string, string> | undefined;
      const req = request(f, readFileSync(join(DIR, `${id}.py`), "utf8"));
      req.fnName = fn.python;
      req.cls = cls?.python ?? null;
      req.cases = localiseOps(f, "python");
      req.roundtrip = roundtripFor(f, "python");
      expect(judge(f, runPython(req)), "every case passes with this mistake in it").not.toEqual([]);
    });
  }
});
