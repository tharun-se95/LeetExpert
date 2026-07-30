import { describe, it, expect } from "vitest";
import { problemHref, lessonIdFromPathname, lessonId } from "../src/lib/course/nav";

describe("problemHref", () => {
  it("builds /problems/<slug>", () => {
    expect(problemHref("subsets")).toBe("/problems/subsets");
  });
});

describe("lessonIdFromPathname", () => {
  it("resolves a course lesson pathname (unchanged behavior)", () => {
    const id = lessonIdFromPathname("/course/big-o/common-complexity-classes");
    expect(id).toBe(lessonId("big-o", "common-complexity-classes"));
  });

  it("resolves a /problems/[slug] pathname to the SAME id its course path would give", () => {
    const viaProblems = lessonIdFromPathname("/problems/subsets");
    const viaCourse = lessonIdFromPathname("/course/recursion-backtracking/subsets");
    expect(viaProblems).toBe(viaCourse);
    expect(viaProblems).toBe(lessonId("recursion-backtracking", "subsets"));
  });

  it("returns null for an unknown problem slug", () => {
    expect(lessonIdFromPathname("/problems/not-a-real-problem")).toBeNull();
  });

  it("returns null for an unrelated pathname", () => {
    expect(lessonIdFromPathname("/about")).toBeNull();
  });
});
