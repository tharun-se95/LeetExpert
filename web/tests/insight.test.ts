import { describe, it, expect } from "vitest";
import { extractComplexityFromMarkdown } from "../src/lib/insight/extractComplexity";
import {
  MEMORY_CELL_CAP,
  MEMORY_CELL_LABEL_MAX,
  mapMarkersToDisplay,
  parseCaseMemory,
} from "../src/lib/insight/parseCaseMemory";
import { resolveInsight } from "../src/lib/insight/resolveInsight";
import type { SandboxSpec } from "../src/components/sandbox/types";

function minimalSpec(overrides: Partial<SandboxSpec> & { id: string }): SandboxSpec {
  return {
    fn: { python: "f", javascript: "f" },
    starter: { python: "", javascript: "" },
    cases: [{ args: ["ab"], expect: true }],
    check: "return",
    arg: 0,
    timeoutMs: 2000,
    compare: "exact",
    shape: {},
    returns: "value",
    cls: null,
    methods: {},
    roundtrip: null,
    property: null,
    ...overrides,
  };
}

describe("extractComplexityFromMarkdown", () => {
  it("returns null when no fence exists", () => {
    expect(extractComplexityFromMarkdown("## Problem\n\nNo fence.\n")).toBeNull();
  });

  it("extracts a top-level complexity fence", () => {
    const md = [
      "## Solution",
      "",
      "```complexity",
      '{ "time": "O(n)", "space": "O(1)", "why": "one pass" }',
      "```",
    ].join("\n");
    expect(extractComplexityFromMarkdown(md)).toEqual({
      time: "O(n)",
      space: "O(1)",
      why: "one pass",
    });
  });

  it("finds complexity nested inside a reveal fence body", () => {
    const md = [
      "`````reveal Solution",
      "```python",
      "def f(): pass",
      "```",
      "",
      "```complexity",
      '{ "time": "O(n)", "space": "O(1)" }',
      "```",
      "`````",
    ].join("\n");
    expect(extractComplexityFromMarkdown(md)).toEqual({
      time: "O(n)",
      space: "O(1)",
      why: undefined,
    });
  });

  it("rejects invalid JSON", () => {
    const md = "```complexity\n{not-json}\n```";
    expect(extractComplexityFromMarkdown(md)).toBeNull();
  });
});

describe("parseCaseMemory", () => {
  it("builds character cells for a string arg", () => {
    const memory = parseCaseMemory(
      { args: ["ab_a"], expect: true },
      minimalSpec({ id: "demo" }),
      [
        { index: "start", label: "L" },
        { index: "end", label: "R" },
      ],
    );
    expect(memory?.kind).toBe("string");
    expect(memory?.cells).toEqual(["a", "b", "_", "a"]);
    expect(memory?.markers).toEqual([
      { index: 0, label: "L" },
      { index: 3, label: "R" },
    ]);
  });

  it("truncates long arrays and maps end markers onto the display", () => {
    const values = Array.from({ length: MEMORY_CELL_CAP + 10 }, (_, i) => i);
    const memory = parseCaseMemory(
      { args: [values], expect: null },
      minimalSpec({ id: "demo" }),
      [{ index: "end", label: "R", kind: "right" }],
    );
    expect(memory?.truncated).toBe(true);
    expect(memory?.cells.includes("…")).toBe(true);
    const mapped = mapMarkersToDisplay(memory!);
    expect(mapped.some((m) => m.label === "R")).toBe(true);
  });

  it("keeps short teaching strings intact in array cells", () => {
    const cases: { id: string; args: unknown[]; expect: unknown; cells: string[] }[] = [
      {
        id: "longest-common-prefix",
        args: [["flower", "flow", "flight"]],
        expect: "fl",
        cells: ["flower", "flow", "flight"],
      },
      {
        id: "group-anagrams",
        args: [["eat", "tea", "tan", "ate", "nat", "bat"]],
        expect: null,
        cells: ["eat", "tea", "tan", "ate", "nat", "bat"],
      },
      {
        id: "longest-word-in-dictionary",
        args: [["w", "wo", "wor", "worl", "world"]],
        expect: "world",
        cells: ["w", "wo", "wor", "worl", "world"],
      },
    ];
    for (const c of cases) {
      const memory = parseCaseMemory(
        { args: c.args, expect: c.expect },
        minimalSpec({ id: c.id }),
      );
      expect(memory?.kind, c.id).toBe("array");
      expect(memory?.cells, c.id).toEqual(c.cells);
      expect(memory?.truncated, c.id).toBe(false);
    }
  });

  it("ellipsizes only strings that exceed the per-cell label budget", () => {
    const long = "a".repeat(MEMORY_CELL_LABEL_MAX + 4);
    const memory = parseCaseMemory(
      { args: [[long, "ok"]], expect: null },
      minimalSpec({ id: "demo" }),
    );
    expect(memory?.cells[0]).toBe(`${"a".repeat(MEMORY_CELL_LABEL_MAX - 1)}…`);
    expect(memory?.cells[0]?.length).toBe(MEMORY_CELL_LABEL_MAX);
    expect(memory?.cells[1]).toBe("ok");
  });

  it("labels trees instead of inventing cells", () => {
    const memory = parseCaseMemory(
      { args: [[1, 2, 3]], expect: null },
      minimalSpec({ id: "demo", shape: { "0": "tree" } }),
    );
    expect(memory?.kind).toBe("tree");
    expect(memory?.cells).toEqual([]);
    expect(memory?.label).toMatch(/^Tree/);
  });
});

describe("resolveInsight", () => {
  it("prefers lesson complexity and gold checklist for valid-palindrome", () => {
    const insight = resolveInsight({
      spec: minimalSpec({
        id: "valid-palindrome",
        cases: [{ args: ["A man"], expect: true }],
      }),
      moduleSlug: "strings",
      extractedComplexity: { time: "O(n)", space: "O(1)", why: "pointers" },
      testCase: { args: ["A man"], expect: true },
      caseIndex: 0,
      result: null,
    });

    expect(insight.complexity).toEqual({
      time: "O(n)",
      space: "O(1)",
      why: "pointers",
      source: "lesson",
    });
    expect(insight.checklist.length).toBeGreaterThan(0);
    expect(insight.checklist[0].label).toMatch(/Skip non-alphanumeric/i);
    expect(insight.memory?.kind).toBe("string");
    expect(insight.variables.some((v) => v.name === "input")).toBe(true);
    expect(insight.variables.some((v) => v.provenance === "run")).toBe(false);
  });

  it("attaches after-run variables when a result is present", () => {
    const insight = resolveInsight({
      spec: minimalSpec({ id: "two-sum" }),
      moduleSlug: "hash-tables",
      extractedComplexity: null,
      testCase: { args: [[2, 7, 11], 9], expect: [0, 1] },
      caseIndex: 0,
      result: {
        index: 0,
        name: "case",
        passed: false,
        got: "[0, 2]",
        expected: "[0, 1]",
        error: null,
        logs: [],
      },
    });

    expect(insight.variables.find((v) => v.name === "output")?.value).toBe(
      "[0, 2]",
    );
    expect(insight.variables.find((v) => v.name === "status")?.value).toBe(
      "failed",
    );
    expect(insight.complexity?.source).toBe("module");
  });

  it("falls back to module patterns when no gold config exists", () => {
    const insight = resolveInsight({
      spec: minimalSpec({ id: "unknown-problem-xyz" }),
      moduleSlug: "arrays",
      extractedComplexity: null,
      testCase: { args: [[1, 0, 2]], expect: null },
      caseIndex: 0,
      result: null,
    });
    expect(insight.checklist.length).toBeGreaterThan(0);
    expect(insight.memory?.kind).toBe("array");
  });
});
