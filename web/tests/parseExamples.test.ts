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

  it("parses find-the-index style rows with explanations", () => {
    const rows = parseExampleRows(
      [
        'haystack = "sadbutsad", needle = "sad" → 0  (needle begins at index 0; a later copy at 6 is ignored)',
        'haystack = "leetcode", needle = "leeto" → -1  (no alignment matches)',
        'haystack = "mississippi", needle = "issip" → 4  (slice haystack[4:9] equals "issip")',
      ].join("\n"),
    );
    expect(rows).toEqual([
      {
        input: 'haystack = "sadbutsad", needle = "sad"',
        output: "0",
        note: "needle begins at index 0; a later copy at 6 is ignored",
      },
      {
        input: 'haystack = "leetcode", needle = "leeto"',
        output: "-1",
        note: "no alignment matches",
      },
      {
        input: 'haystack = "mississippi", needle = "issip"',
        output: "4",
        note: 'slice haystack[4:9] equals "issip"',
      },
    ]);
  });

  it("unwraps a fully quoted note without mangling inner quotes", () => {
    expect(parseExampleRows('"race a car" → false  ("raceacar")')).toEqual([
      { input: '"race a car"', output: "false", note: "raceacar" },
    ]);
    expect(
      parseExampleRows('haystack = "ab", needle = "a" → 0  ("a" is at index 0)'),
    ).toEqual([
      {
        input: 'haystack = "ab", needle = "a"',
        output: "0",
        note: '"a" is at index 0',
      },
    ]);
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
