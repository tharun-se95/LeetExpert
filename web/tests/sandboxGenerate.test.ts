import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  describeGenerated,
  expandGenerators,
  GeneratorError,
  hasGenerator,
  MAX_GENERATED_LENGTH,
} from "../src/lib/sandbox/generate";
import { parseSandboxSpec } from "../src/components/sandbox/parseSpec";
import { pretty } from "../src/lib/sandbox/compare";
import { runJavaScript } from "./referenceRunner";
import { judge, request, sandboxFences, type Fence } from "./helpers/sandboxCases";

describe("expandGenerators", () => {
  it("expands ascending and descending ranges inclusively", () => {
    expect(expandGenerators({ $range: [1, 4] })).toEqual([1, 2, 3, 4]);
    expect(expandGenerators({ $range: [3, 1] })).toEqual([3, 2, 1]);
    expect(expandGenerators({ $range: [7, 7] })).toEqual([7]);
  });

  it("expands at any depth and leaves plain data alone", () => {
    expect(
      expandGenerators({ values: { $range: [1, 3] }, pos: 0, other: [[1], "x", null] }),
    ).toEqual({ values: [1, 2, 3], pos: 0, other: [[1], "x", null] });
  });

  it("repeats a value, giving every copy its own identity", () => {
    const out = expandGenerators({ $repeat: [[0], 3] }) as number[][];
    expect(out).toEqual([[0], [0], [0]]);
    out[0].push(1);
    expect(out[1]).toEqual([0]);
    expect(expandGenerators({ $repeat: [{ $range: [1, 2] }, 2] })).toEqual([
      [1, 2],
      [1, 2],
    ]);
    expect(expandGenerators({ $repeat: [5, 0] })).toEqual([]);
  });

  it.each([
    [{ $rnage: [1, 3] }],
    [{ $range: [1, 3], extra: 1 }],
    [{ $range: [1] }],
    [{ $range: [1.5, 3] }],
    [{ $range: [1, MAX_GENERATED_LENGTH + 1] }],
    [{ $repeat: [1] }],
    [{ $repeat: [1, -1] }],
  ])("rejects a malformed generator %j", (bad) => {
    expect(() => expandGenerators(bad)).toThrow(GeneratorError);
  });
});

describe("describeGenerated", () => {
  it("summarises instead of expanding", () => {
    expect(describeGenerated({ $range: [1, 5000] })).toBe("[1..5000]");
    expect(describeGenerated({ values: { $range: [1, 10000] }, pos: 0 })).toBe(
      "{ values: [1..10000], pos: 0 }",
    );
    expect(describeGenerated({ $repeat: [0, 300] })).toBe("[0 × 300]");
    expect(hasGenerator([{ values: { $range: [1, 2] } }])).toBe(true);
    expect(hasGenerator([[1, 2], { values: [1] }])).toBe(false);
  });

  it("keeps failure output short and states the length", () => {
    expect(pretty(expandGenerators({ $range: [1, 5000] }))).toMatch(
      /…\s?\(5000 items\)$/,
    );
  });
});

describe("parseSandboxSpec with generated cases", () => {
  const base = (cases: unknown) =>
    JSON.stringify({
      id: "gen",
      fn: { python: "f", javascript: "f" },
      starter: { python: "", javascript: "" },
      cases,
    });

  it("expands args and expect and labels them for the UI", () => {
    const spec = parseSandboxSpec(
      base([
        { args: [{ $range: [1, 5000] }], expect: { $range: [5000, 1] } },
        { args: [[1]], expect: [1] },
      ]),
    )!;
    expect(spec.cases[0].args[0]).toHaveLength(5000);
    expect((spec.cases[0].expect as number[])[0]).toBe(5000);
    expect(spec.cases[0].argsLabel).toBe("[1..5000]");
    expect(spec.cases[0].expectLabel).toBe("[5000..1]");
    // A literal case carries no label, so it renders exactly as before.
    expect(spec.cases[1].argsLabel).toBeUndefined();
  });

  it("rejects a malformed generator rather than testing nothing", () => {
    expect(parseSandboxSpec(base([{ args: [{ $range: [1] }], expect: 1 }]))).toBeNull();
  });
});

describe("generated cases are judged against real reference solutions", () => {
  const reference = readFileSync(
    join(__dirname, "reference", "linked-lists", "reverse-linked-list.js"),
    "utf8",
  );
  // Own copy, because the tests below edit the cases.
  const fence = (): Fence => {
    const f = sandboxFences().find(
      (x) => x.lesson === "linked-lists/reverse-linked-list",
    )!;
    return { ...f, spec: structuredClone(f.spec) };
  };

  it("the ceiling case reaches the stated length", () => {
    const cases = fence().spec.cases as { args: number[][] }[];
    expect(Math.max(...cases.map((c) => c.args[0].length))).toBe(5000);
  });

  it("passes with the checked-in reference", async () => {
    const f = fence();
    expect(judge(f, await runJavaScript(request(f, reference)))).toEqual([]);
  });

  it("fails a reference that is wrong only at the ceiling", async () => {
    const f = fence();
    // Correct everywhere the old hand-written cases reached.
    const capped = `function reverseList(head) {
      let prev = null, cur = head, n = 0;
      while (cur && n < 4999) { const nxt = cur.next; cur.next = prev; prev = cur; cur = nxt; n++; }
      return prev;
    }`;
    const bad = judge(f, await runJavaScript(request(f, capped)));
    expect(bad).toHaveLength(1);
    expect(bad[0]).toContain("case 4");
  });

  it("fails when the generated expectation is wrong", async () => {
    const f = fence();
    const cases = f.spec.cases as { expect: unknown }[];
    cases[cases.length - 1].expect = expandGenerators({ $range: [1, 5000] });
    expect(judge(f, await runJavaScript(request(f, reference)))).toHaveLength(1);
  });
});
