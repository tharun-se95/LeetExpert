import { describe, it, expect } from "vitest";
import {
  findProblemBySlug,
  getProblemNeighbors,
  groupedProblems,
  allProblemSlugs,
  practiceLesson,
  isLessonsNavLesson,
  allLessonsNavIds,
  MODULES,
} from "../src/lib/course/manifest";

describe("findProblemBySlug", () => {
  it("finds a real problem by slug", () => {
    const hit = findProblemBySlug("subsets");
    expect(hit?.module.slug).toBe("recursion-backtracking");
    expect(hit?.lesson.title).toBe("Subsets");
  });

  it("returns undefined for a concept-lesson slug", () => {
    expect(findProblemBySlug("common-complexity-classes")).toBeUndefined();
  });

  it("returns undefined for an unknown slug", () => {
    expect(findProblemBySlug("not-a-real-problem")).toBeUndefined();
  });
});

describe("getProblemNeighbors", () => {
  it("returns prev/next within the module's problem order", () => {
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
    expect(groups.some((g) => g.module.slug === "getting-started")).toBe(false);
    expect(groups.some((g) => g.module.slug === "recursion-backtracking")).toBe(
      true,
    );
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

describe("practiceLesson", () => {
  it("returns the fixed Practice chapter meta", () => {
    expect(practiceLesson()).toEqual({
      slug: "practice",
      title: "Practice",
      type: "practice",
    });
  });
});

describe("isLessonsNavLesson", () => {
  it("includes concept and practice, excludes problem", () => {
    expect(isLessonsNavLesson({ slug: "a", title: "A", type: "concept" })).toBe(
      true,
    );
    expect(
      isLessonsNavLesson({
        slug: "practice",
        title: "Practice",
        type: "practice",
      }),
    ).toBe(true);
    expect(
      isLessonsNavLesson({
        slug: "two-sum",
        title: "Two Sum",
        type: "problem",
      }),
    ).toBe(false);
  });
});

describe("allLessonsNavIds", () => {
  it("never includes a type: problem id", () => {
    const ids = allLessonsNavIds();
    for (const mod of MODULES) {
      for (const lesson of mod.lessons) {
        if (lesson.type !== "problem") continue;
        expect(ids).not.toContain(`${mod.slug}/${lesson.slug}`);
      }
    }
  });

  it("includes every concept lesson", () => {
    const ids = new Set(allLessonsNavIds());
    for (const mod of MODULES) {
      for (const lesson of mod.lessons) {
        if (lesson.type !== "concept") continue;
        expect(ids.has(`${mod.slug}/${lesson.slug}`)).toBe(true);
      }
    }
  });
});

describe("practice chapters in MODULES (after authoring)", () => {
  it("counts 21 practice lessons and 99 Lessons-nav ids", () => {
    const practices = MODULES.flatMap((m) =>
      m.lessons.filter((l) => l.type === "practice"),
    );
    expect(practices).toHaveLength(21);
    expect(allLessonsNavIds()).toHaveLength(99);
  });
});
