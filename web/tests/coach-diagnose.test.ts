import { describe, it, expect } from "vitest";
import { diagnose } from "../src/lib/coach/diagnose";
import type { CaseResult } from "../src/components/sandbox/types";

function result(partial: Partial<CaseResult> & Pick<CaseResult, "passed">): CaseResult {
  return {
    index: 0,
    name: "f([1])",
    got: "0",
    expected: "1",
    error: null,
    logs: [],
    ...partial,
  };
}

describe("diagnose", () => {
  it("reports a fatal runner failure", () => {
    const d = diagnose({
      results: null,
      fatal: "Could not start the python runner",
      hintCount: 2,
      failCount: 1,
      property: false,
    });
    expect(d.kind).toBe("fatal");
    expect(d.status).toBe("errored");
    expect(d.prose).toContain("Could not start the python runner");
    expect(d.nextHintIndex).toBe(1);
    expect(d.prose).not.toMatch(/keeper|set of visited/i);
  });

  it("reports all cases passed", () => {
    const d = diagnose({
      results: [result({ passed: true, got: "1", expected: "1" })],
      fatal: null,
      hintCount: 2,
      failCount: 0,
      property: false,
    });
    expect(d.kind).toBe("all-passed");
    expect(d.status).toBe("all-passed");
    expect(d.nextHintIndex).toBeNull();
    expect(d.passed).toBe(1);
    expect(d.total).toBe(1);
    expect(d.prose).toBe(
      "All 1 cases passed. Ask about this lesson's bound or what to take from it — I still will not write the code.",
    );
    expect(d.prose).not.toMatch(/variant/i);
  });

  it("diagnoses a wrong return value", () => {
    const d = diagnose({
      results: [
        result({ passed: true, index: 0, got: "1", expected: "1" }),
        result({
          passed: false,
          index: 1,
          name: "twoSum([2,7], 9)",
          got: "[0,0]",
          expected: "[0,1]",
        }),
      ],
      fatal: null,
      hintCount: 2,
      failCount: 1,
      property: false,
    });
    expect(d.kind).toBe("wrong-value");
    expect(d.status).toBe("failed");
    expect(d.firstFailIndex).toBe(1);
    expect(d.caseName).toBe("twoSum([2,7], 9)");
    expect(d.got).toBe("[0,0]");
    expect(d.expected).toBe("[0,1]");
    expect(d.prose).toContain("twoSum([2,7], 9)");
    expect(d.prose).toContain("[0,0]");
    expect(d.prose).toContain("[0,1]");
    expect(d.nextHintIndex).toBe(1);
  });

  it("diagnoses mutate and prefix mismatches as wrong-value using got/expected", () => {
    const mutate = diagnose({
      results: [
        result({
          passed: false,
          name: "moveZeroes([0,1])",
          got: "[0,1]",
          expected: "[1,0]",
        }),
      ],
      fatal: null,
      hintCount: 1,
      failCount: 1,
      property: false,
    });
    expect(mutate.kind).toBe("wrong-value");
    expect(mutate.prose).toContain("[1,0]");

    const prefix = diagnose({
      results: [
        result({
          passed: false,
          name: "removeDuplicates([-1,-1,0])",
          got: "[-1,-1]",
          expected: "[-1,0]",
        }),
      ],
      fatal: null,
      hintCount: 1,
      failCount: 1,
      property: false,
    });
    expect(prefix.kind).toBe("wrong-value");
  });

  it("uses the sequence op name already on the case result", () => {
    const d = diagnose({
      results: [
        result({
          passed: false,
          name: "MinStack: op 2 — getMin([])",
          got: "3",
          expected: "1",
        }),
      ],
      fatal: null,
      hintCount: 2,
      failCount: 1,
      property: false,
    });
    expect(d.caseName).toBe("MinStack: op 2 — getMin([])");
    expect(d.prose).toContain("op 2");
  });

  it("diagnoses a property failure", () => {
    const d = diagnose({
      results: [
        result({
          passed: false,
          expected: "any order satisfying every prerequisite",
          got: "[0,0]",
          error: "missing an edge",
        }),
      ],
      fatal: null,
      hintCount: 1,
      failCount: 1,
      property: true,
    });
    expect(d.kind).toBe("property");
    expect(d.prose).toContain("missing an edge");
  });

  it("diagnoses an aliased graph return", () => {
    const aliased =
      "This returns the original graph, not a copy — the shape is right, but at least one node is the very same object.";
    const d = diagnose({
      results: [result({ passed: false, error: aliased, got: null })],
      fatal: null,
      hintCount: 1,
      failCount: 1,
      property: false,
    });
    expect(d.kind).toBe("aliased");
    expect(d.prose).toContain("original graph");
  });

  it("diagnoses a thrown exception", () => {
    const d = diagnose({
      results: [
        result({
          passed: false,
          got: null,
          error: "TypeError: cannot read next of null",
        }),
      ],
      fatal: null,
      hintCount: 1,
      failCount: 1,
      property: false,
    });
    expect(d.kind).toBe("exception");
    expect(d.prose).toContain("cannot read next of null");
  });

  it("diagnoses a timeout", () => {
    const d = diagnose({
      results: [
        result({
          passed: false,
          got: null,
          error: "Timed out after 2000ms",
        }),
      ],
      fatal: null,
      hintCount: 1,
      failCount: 1,
      property: false,
    });
    expect(d.kind).toBe("timeout");
    expect(d.prose).toMatch(/timed out/i);
  });

  it("caps nextHintIndex at hintCount after many fails", () => {
    const d = diagnose({
      results: [result({ passed: false })],
      fatal: null,
      hintCount: 2,
      failCount: 3,
      property: false,
    });
    expect(d.nextHintIndex).toBe(2);
    expect(d.prose).toMatch(/Hint 2/);
    expect(d.prose).not.toContain("keeper");
  });

  it("returns a failed diagnosis with no hint pointer when there are no hints", () => {
    const d = diagnose({
      results: [result({ passed: false })],
      fatal: null,
      hintCount: 0,
      failCount: 1,
      property: false,
    });
    expect(d.nextHintIndex).toBeNull();
    expect(d.prose).not.toMatch(/Hint \d/);
  });

  it("treats empty results as fatal", () => {
    const d = diagnose({
      results: [],
      fatal: null,
      hintCount: 1,
      failCount: 1,
      property: false,
    });
    expect(d.kind).toBe("fatal");
    expect(d.status).toBe("errored");
  });
});
