import { describe, expect, it } from "vitest";
import {
  looksLikeExamples,
  parseExampleRows,
} from "../src/lib/content/parseExamples";

describe("parseExampleRows", () => {
  it("splits arrow rows and trailing notes", () => {
    const rows = parseExampleRows(
      [
        '"race a car" → false  ("raceacar")',
        "nums = [1,1,2] → k = 2, nums = [1,2,_]",
      ].join("\n"),
    );
    expect(rows).toEqual([
      {
        input: '"race a car"',
        output: "false",
        note: "raceacar",
      },
      {
        input: "nums = [1,1,2]",
        output: "k = 2, nums = [1,2,_]",
        note: undefined,
      },
    ]);
  });

  it("accepts ASCII arrows", () => {
    expect(parseExampleRows("a -> b")).toEqual([
      { input: "a", output: "b", note: undefined },
    ]);
  });

  it("returns null when no arrows", () => {
    expect(parseExampleRows("just prose\nstill prose")).toBeNull();
  });
});

describe("looksLikeExamples", () => {
  it("is true when most lines have arrows", () => {
    expect(
      looksLikeExamples("a → 1\nb → 2\n"),
    ).toBe(true);
  });

  it("is false for ordinary text fences", () => {
    expect(looksLikeExamples("line one\nline two\n")).toBe(false);
  });
});
