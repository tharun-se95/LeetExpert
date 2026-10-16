import { describe, it, expect } from "vitest";
import { CATALOG_PROBLEMS } from "@/lib/course/catalog/data";
import {
  getAllCatalogExtraSlugs,
  getCatalogExtraProblem,
} from "@/lib/course/catalog/catalogExtraProblems";
import {
  loadCatalogLesson,
  getCatalogProblemNeighbors,
} from "@/lib/course/catalog/catalogLessonLoader";
import { allProblemSlugs } from "@/lib/course/manifest";
import { parseSandboxSpec } from "@/components/sandbox/parseSpec";

describe("Catalog Complete In-App Problem Hosting", () => {
  it("has exactly 157 catalog problems in total", () => {
    expect(CATALOG_PROBLEMS).toHaveLength(157);
  });

  it("has exactly 116 curriculum drills and 41 extra problems", () => {
    const curriculumProblems = CATALOG_PROBLEMS.filter((p) => p.courseLessonSlug);
    const extraProblems = CATALOG_PROBLEMS.filter((p) => !p.courseLessonSlug);

    expect(curriculumProblems).toHaveLength(116);
    expect(extraProblems).toHaveLength(41);
    expect(getAllCatalogExtraSlugs()).toHaveLength(41);
  });

  it("every extra catalog problem is present in CATALOG_EXTRA_PROBLEMS with valid metadata", () => {
    const extraProblems = CATALOG_PROBLEMS.filter((p) => !p.courseLessonSlug);

    for (const problem of extraProblems) {
      const extra = getCatalogExtraProblem(problem.slug);
      expect(extra, `Missing extra problem for slug: ${problem.slug}`).toBeDefined();
      if (!extra) continue;

      expect(extra.title).toBe(problem.title);
      expect(extra.difficulty).toBe(problem.difficulty);
      expect(extra.description.length).toBeGreaterThan(20);
      expect(extra.examples.length).toBeGreaterThan(10);
      expect(extra.constraints.length).toBeGreaterThan(5);
      expect(extra.hints.length).toBeGreaterThanOrEqual(1);
      expect(extra.thesis.length).toBeGreaterThan(10);
      expect(extra.solution.python.length).toBeGreaterThan(10);
      expect(extra.solution.typescript.length).toBeGreaterThan(10);

      // Verify sandbox spec
      expect(extra.sandbox.id).toBe(problem.slug);
      expect(extra.sandbox.fn.python).toBeTruthy();
      expect(extra.sandbox.fn.javascript).toBeTruthy();
      expect(
        extra.sandbox.starter.python.includes("def ") ||
          extra.sandbox.starter.python.includes("class "),
      ).toBe(true);
      expect(
        extra.sandbox.starter.javascript.includes("function ") ||
          extra.sandbox.starter.javascript.includes("class "),
      ).toBe(true);
      expect(extra.sandbox.cases.length).toBeGreaterThanOrEqual(1);

      // Verify starter code passes parseSandboxSpec
      const specString = JSON.stringify(extra.sandbox);
      const parsedSpec = parseSandboxSpec(specString);
      expect(parsedSpec, `parseSandboxSpec failed for ${problem.slug}`).not.toBeNull();
    }
  });

  it("loadCatalogLesson produces a valid LoadedLesson & SandboxExtraction for all 41 extra problems", async () => {
    const allExtraSlugs = getAllCatalogExtraSlugs();
    expect(allExtraSlugs).toHaveLength(41);

    for (const slug of allExtraSlugs) {
      const extra = getCatalogExtraProblem(slug);
      expect(extra).toBeDefined();
      if (!extra) continue;

      const loaded = await loadCatalogLesson(extra);
      expect(loaded, `Failed to load lesson for ${slug}`).not.toBeNull();
      if (!loaded) continue;

      expect(loaded.moduleSlug).toBe("catalog");
      expect(loaded.lessonSlug).toBe(slug);
      expect(loaded.title).toBe(extra.title);
      expect(loaded.toc.length).toBeGreaterThanOrEqual(3);
      expect(loaded.sandbox).not.toBeNull();
      expect(loaded.sandbox.sandboxSource).toBeTruthy();
      expect(loaded.sandbox.beforeSandbox).toContain("## Problem");
      expect(loaded.sandbox.afterSandbox).toContain("## Solution");
      expect(loaded.highlightedBlocks).toBeDefined();
    }
  });

  it("provides valid neighbor navigation across all 157 problems", () => {
    // Problem 1: Two Sum -> Next should be add-two-numbers
    const twoSumNeighbors = getCatalogProblemNeighbors("two-sum");
    expect(twoSumNeighbors.prev).toBeNull();
    expect(twoSumNeighbors.next).not.toBeNull();
    expect(twoSumNeighbors.next?.href).toBe("/courses/dsa/problems/add-two-numbers");

    // Problem 2: Add Two Numbers -> Prev is two-sum, Next is longest-substring
    const addTwoNumbersNeighbors = getCatalogProblemNeighbors("add-two-numbers");
    expect(addTwoNumbersNeighbors.prev?.href).toBe("/courses/dsa/problems/two-sum");
    expect(addTwoNumbersNeighbors.next?.href).toBe(
      "/courses/dsa/problems/longest-substring-without-repeating",
    );
  });

  it("combines core and extra slugs with zero duplicate route slugs", () => {
    const coreSlugs = allProblemSlugs();
    const extraSlugs = getAllCatalogExtraSlugs();

    expect(coreSlugs).toHaveLength(116);
    expect(extraSlugs).toHaveLength(41);

    const combined = [...coreSlugs, ...extraSlugs];
    const unique = new Set(combined);
    expect(unique.size).toBe(157);
  });
});
