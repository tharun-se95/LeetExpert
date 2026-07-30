import { describe, it, expect } from "vitest";
import {
  findProblemBySlug,
  getProblemNeighbors,
  groupedProblems,
  allProblemSlugs,
} from "../src/lib/course/manifest";

describe("findProblemBySlug", () => {
  it("finds a real problem by slug", () => {
    const hit = findProblemBySlug("subsets");
    expect(hit?.module.slug).toBe("recursion-backtracking");
    expect(hit?.lesson.title).toBe("Subsets");
  });

  it("returns undefined for a concept-lesson slug", () => {
    // "common-complexity-classes" is a real slug, but type: concept —
    // this lookup must not accidentally match it.
    expect(findProblemBySlug("common-complexity-classes")).toBeUndefined();
  });

  it("returns undefined for an unknown slug", () => {
    expect(findProblemBySlug("not-a-real-problem")).toBeUndefined();
  });
});

describe("getProblemNeighbors", () => {
  it("returns prev/next within the module's problem order", () => {
    // recursion-backtracking's problems, in file order: subsets,
    // permutations, combination-sum, generate-parentheses,
    // palindrome-partitioning, n-queens.
    const mid = getProblemNeighbors("recursion-backtracking", "combination-sum");
    expect(mid.prev?.slug).toBe("permutations");
    expect(mid.next?.slug).toBe("generate-parentheses");
  });

  it("prev is null for the first problem in a module", () => {
    const first = getProblemNeighbors("recursion-backtracking", "subsets");
    expect(first.prev).toBeNull();
  });

  it("next is null for the last problem in a module", () => {
    const last = getProblemNeighbors("recursion-backtracking", "n-queens");
    expect(last.next).toBeNull();
  });
});

describe("groupedProblems", () => {
  it("only includes modules that have at least one problem", () => {
    const groups = groupedProblems();
    // "getting-started" is concept-only — must not appear.
    expect(groups.some((g) => g.module.slug === "getting-started")).toBe(false);
    expect(groups.some((g) => g.module.slug === "recursion-backtracking")).toBe(true);
  });

  it("every group's problems are all type: problem", () => {
    const groups = groupedProblems();
    for (const g of groups) {
      expect(g.problems.every((p) => p.type === "problem")).toBe(true);
      expect(g.problems.length).toBeGreaterThan(0);
    }
  });
});

describe("allProblemSlugs", () => {
  it("returns exactly 116 slugs, all unique", () => {
    const slugs = allProblemSlugs();
    expect(slugs.length).toBe(116);
    expect(new Set(slugs).size).toBe(116);
  });
});
