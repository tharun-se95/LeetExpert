import { describe, it, expect } from "vitest";
import { allProblemSlugs } from "../src/lib/course/manifest";
import {
  PROBLEM_DIFFICULTY,
  getProblemDifficulty,
  type Difficulty,
} from "../src/lib/course/problemDifficulty";

const VALID: Difficulty[] = ["Easy", "Medium", "Hard"];

describe("PROBLEM_DIFFICULTY", () => {
  it("has an Easy|Medium|Hard entry for every manifest problem slug", () => {
    const slugs = allProblemSlugs();
    expect(slugs).toHaveLength(116);

    const missing = slugs.filter((slug) => !(slug in PROBLEM_DIFFICULTY));
    expect(missing).toEqual([]);

    for (const slug of slugs) {
      const d = getProblemDifficulty(slug);
      expect(VALID.includes(d as Difficulty)).toBe(true);
    }
  });

  it("does not contain orphan slugs outside the manifest", () => {
    const known = new Set(allProblemSlugs());
    const extras = Object.keys(PROBLEM_DIFFICULTY).filter((s) => !known.has(s));
    expect(extras).toEqual([]);
  });

  it("uses the course slug for Add-and-Search Words and arrows", () => {
    expect(getProblemDifficulty("design-add-and-search-words")).toBe("Medium");
    expect(
      getProblemDifficulty("design-add-and-search-words-data-structure"),
    ).toBeUndefined();
    expect(getProblemDifficulty("minimum-arrows-to-burst-balloons")).toBe(
      "Medium",
    );
    expect(
      getProblemDifficulty("minimum-number-of-arrows-to-burst-balloons"),
    ).toBeUndefined();
  });

  it("covers partition-equal-subset-sum and min-cost-to-connect-all-points", () => {
    expect(getProblemDifficulty("partition-equal-subset-sum")).toBe("Medium");
    expect(getProblemDifficulty("min-cost-to-connect-all-points")).toBe(
      "Medium",
    );
    expect(getProblemDifficulty("maximum-product-subarray")).toBeUndefined();
  });
});
