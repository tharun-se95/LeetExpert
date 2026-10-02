import { describe, it, expect, beforeAll } from "vitest";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { pythonDriver } from "./referenceRunner";
import { expandGenerators } from "../src/lib/sandbox/generate";

/**
 * Runs the shipped Python driver under the REAL Pyodide, because CPython's
 * own interpreter (what referenceRunner uses) frees a 5000-node chain without
 * complaint. Under Pyodide that free recurses on the WASM stack and raised a
 * fatal "Maximum call stack size exceeded" that killed the runner, even for a
 * correct iterative solution. Only this engine can show the regression.
 */

const PYODIDE = join(__dirname, "..", "public", "pyodide");

interface PyodideLike {
  runPython(code: string): unknown;
  globals: { get(name: string): (...args: unknown[]) => string };
}

let pyodide: PyodideLike;

beforeAll(async () => {
  // Vite logs a missing source map for this file (the package ships none);
  // harmless, and a native import is not available inside vitest's VM.
  const mod = (await import(
    /* @vite-ignore */ pathToFileURL(join(PYODIDE, "pyodide.mjs")).href
  )) as { loadPyodide(o: { indexURL: string }): Promise<PyodideLike> };
  pyodide = await mod.loadPyodide({ indexURL: `${PYODIDE}/` });
}, 60_000);

const REVERSE = `
def reverse_list(head):
    prev, cur = None, head
    while cur:
        nxt = cur.next
        cur.next = prev
        prev = cur
        cur = nxt
    return prev
`;
const HAS_CYCLE = `
def has_cycle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            return True
    return False
`;

function run(
  driver: string,
  source: string,
  fn: string,
  cases: unknown[],
): { error: string | null; ret: unknown }[] {
  pyodide.runPython(driver);
  const raw = pyodide.globals.get("__run_cases")(
    source,
    fn,
    JSON.stringify(cases),
    0,
    "return",
    JSON.stringify({ "0": "list" }),
    fn === "reverse_list" ? "list" : "value",
    "[]",
  );
  const parsed = JSON.parse(raw) as { outcomes: { error: string | null; ret: unknown }[] };
  return parsed.outcomes;
}

describe("long linked chains under Pyodide", () => {
  it("a correct iterative reverse of 5000 nodes passes", () => {
    const [o] = run(
      pythonDriver(),
      REVERSE,
      "reverse_list",
      [{ args: [{ $range: [1, 5000] }] }].map((c) => ({ args: expandGenerators(c.args) })),
    );
    expect(o.error).toBeNull();
    expect(o.ret).toEqual(expandGenerators({ $range: [5000, 1] }));
  });

  it("10000-node cycle cases (open, pos 0, pos 9999) pass", () => {
    const values = { $range: [1, 10000] };
    const cases = [
      { args: [values], expect: false },
      { args: [{ values, pos: 0 }], expect: true },
      { args: [{ values, pos: 9999 }], expect: true },
    ].map((c) => ({ args: expandGenerators(c.args), expect: c.expect }));
    const outcomes = run(pythonDriver(), HAS_CYCLE, "has_cycle", cases);
    expect(outcomes.map((o) => o.error)).toEqual([null, null, null]);
    expect(outcomes.map((o) => o.ret)).toEqual([false, true, true]);
  });

  it("fails without the teardown, so the test can tell", () => {
    // Registration goes too: a registry that is never torn down would keep
    // every node alive and hide the very free this guards.
    const withoutTeardown = pythonDriver()
      .replace("            __release_nodes()", "            pass")
      .replaceAll("_NODES.append(self)", "pass");
    expect(withoutTeardown).not.toBe(pythonDriver());
    const outcome = () =>
      run(withoutTeardown, REVERSE, "reverse_list", [
        { args: expandGenerators([{ $range: [1, 5000] }]) },
      ]);
    // Either the case reports the stack error or Pyodide dies outright.
    let failed = false;
    let detail = "";
    try {
      failed = outcome()[0].error !== null;
    } catch (e) {
      failed = true;
      detail = String(e);
    }
    expect(failed, detail).toBe(true);
    expect(detail).toMatch(/call stack/i);
  });
});
