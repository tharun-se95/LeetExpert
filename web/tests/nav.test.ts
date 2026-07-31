import { describe, it, expect } from "vitest";
import {
  problemHref,
  lessonIdFromPathname,
  lessonId,
  buildCourseNav,
  lessonHref,
} from "../src/lib/course/nav";

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

describe("buildCourseNav Lessons filter", () => {
  it("includes concepts and Practice, never individual problems", () => {
    const nav = buildCourseNav();
    const arrays = nav
      .flatMap((s) => s.modules)
      .find((m) => m.slug === "arrays");
    expect(arrays).toBeDefined();
    expect(arrays!.lessons.some((l) => l.type === "problem")).toBe(false);
    expect(
      arrays!.lessons.some((l) => l.id === "arrays/remove-duplicates-sorted"),
    ).toBe(false);
    const practice = arrays!.lessons[arrays!.lessons.length - 1];
    expect(practice).toEqual({
      id: lessonId("arrays", "practice"),
      title: "Practice",
      href: lessonHref("arrays", "practice"),
      type: "practice",
    });
  });

  it("omits Practice on concept-only modules", () => {
    const nav = buildCourseNav();
    const bigO = nav.flatMap((s) => s.modules).find((m) => m.slug === "big-o");
    expect(bigO!.lessons.every((l) => l.type === "concept")).toBe(true);
    expect(bigO!.lessons.some((l) => l.id === "big-o/practice")).toBe(false);
  });
});
