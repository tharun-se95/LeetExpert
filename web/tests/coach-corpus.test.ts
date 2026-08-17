import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { buildCorpus } from "../src/lib/coach/buildCorpus";

const GENERATED = join(__dirname, "..", "src", "lib", "coach", "corpus.generated.json");

describe("buildCorpus", () => {
  const corpus = buildCorpus();
  const ids = Object.keys(corpus);

  it("covers every problem sandbox id", () => {
    expect(ids).toHaveLength(116);
    expect(new Set(ids).size).toBe(116);
    expect(corpus["two-sum"]).toMatchObject({
      sandboxId: "two-sum",
      moduleSlug: "hash-tables",
    });
    expect(corpus["two-sum"].fn).toEqual({
      python: "two_sum",
      javascript: "twoSum",
    });
    expect(corpus["two-sum"].hints.length).toBeGreaterThanOrEqual(1);
    expect(corpus["two-sum"].statement).toContain("## Problem");
    expect(corpus["two-sum"].statement).not.toContain("```sandbox");
    expect(typeof corpus["two-sum"].thesis).toBe("string");
    expect(corpus["find-the-index"].thesis).toMatch(
      /correct move at these constraints/i,
    );
  });

  it("never includes the Solution tab or a Solution reveal body", () => {
    const leaked: string[] = [];
    for (const [id, problem] of Object.entries(corpus)) {
      if (/^## Solution\b/m.test(problem.statement)) {
        leaked.push(`${id} statement has ## Solution`);
      }
      if (/reveal Solution/i.test(problem.statement)) {
        leaked.push(`${id} statement has reveal Solution`);
      }
      if (/^## Solution\b/m.test(problem.thesis)) {
        leaked.push(`${id} thesis has ## Solution`);
      }
      if (
        new RegExp(
          String.raw`(?:def|function)\s+${problem.fn.python}|function\s+${problem.fn.javascript}`,
          "i",
        ).test(problem.thesis)
      ) {
        leaked.push(`${id} thesis defines the sandbox fn`);
      }
      for (const hint of problem.hints) {
        if (/^Solution\b/i.test(hint.label)) {
          leaked.push(`${id} hint labeled ${hint.label}`);
        }
        if (/^## Solution\b/m.test(hint.body)) {
          leaked.push(`${id} hint body has ## Solution`);
        }
      }
    }
    expect(leaked).toEqual([]);
  });

  it("generated JSON matches a fresh buildCorpus()", () => {
    expect(existsSync(GENERATED)).toBe(true);
    const written = JSON.parse(readFileSync(GENERATED, "utf8")) as ReturnType<
      typeof buildCorpus
    >;
    expect(Object.keys(written).sort()).toEqual(ids.sort());
    expect(written).toEqual(corpus);
  }, 20000);
});
