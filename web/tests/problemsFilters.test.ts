import { describe, it, expect } from "vitest";
import {
  flattenProblems,
  filterProblems,
  type FlatProblem,
} from "@/lib/course/problemsFilters";
import type { ProblemGroup } from "@/lib/course/manifest";

function group(
  moduleSlug: string,
  moduleNumber: number,
  shortTitle: string,
  problems: { slug: string; title: string }[],
): ProblemGroup {
  return {
    module: {
      slug: moduleSlug,
      number: moduleNumber,
      title: shortTitle,
      shortTitle,
      description: "",
      stage: 1,
      status: "available",
      lessons: problems.map((p) => ({ ...p, type: "problem" as const })),
    },
    problems: problems.map((p) => ({ ...p, type: "problem" as const })),
  };
}

const GROUPS: ProblemGroup[] = [
  group("arrays", 4, "Arrays", [
    { slug: "move-zeroes", title: "Move Zeroes" },
    { slug: "rotate-array", title: "Rotate Array" },
  ]),
  group("two-pointers", 10, "Two Pointers", [
    { slug: "three-sum", title: "Three Sum" },
  ]),
];

describe("flattenProblems", () => {
  it("preserves module order, then in-module order", () => {
    const flat = flattenProblems(GROUPS);
    expect(flat.map((p) => p.slug)).toEqual([
      "move-zeroes",
      "rotate-array",
      "three-sum",
    ]);
  });

  it("carries module metadata onto each row", () => {
    const flat = flattenProblems(GROUPS);
    expect(flat[0]).toMatchObject({
      slug: "move-zeroes",
      moduleSlug: "arrays",
      moduleLabel: "Arrays",
      moduleNumber: 4,
    });
  });
});

describe("filterProblems", () => {
  const flat = flattenProblems(GROUPS);
  const noSolved = new Set<string>();

  it("query matches by title, case-insensitive", () => {
    const result = filterProblems(flat, {
      query: "zero",
      difficulty: "All",
      status: "All",
      topics: new Set(),
      solved: noSolved,
    });
    expect(result.map((p) => p.slug)).toEqual(["move-zeroes"]);
  });

  it("empty topics set means unrestricted, not 'match nothing'", () => {
    const result = filterProblems(flat, {
      query: "",
      difficulty: "All",
      status: "All",
      topics: new Set(),
      solved: noSolved,
    });
    expect(result).toHaveLength(3);
  });

  it("topics set restricts to the checked modules", () => {
    const result = filterProblems(flat, {
      query: "",
      difficulty: "All",
      status: "All",
      topics: new Set(["two-pointers"]),
      solved: noSolved,
    });
    expect(result.map((p) => p.slug)).toEqual(["three-sum"]);
  });

  it("status Solved keeps only rows in the solved set", () => {
    const solved = new Set(["arrays/move-zeroes"]);
    const result = filterProblems(flat, {
      query: "",
      difficulty: "All",
      status: "Solved",
      topics: new Set(),
      solved,
    });
    expect(result.map((p) => p.slug)).toEqual(["move-zeroes"]);
  });

  it("status Unsolved excludes rows in the solved set", () => {
    const solved = new Set(["arrays/move-zeroes"]);
    const result = filterProblems(flat, {
      query: "",
      difficulty: "All",
      status: "Unsolved",
      topics: new Set(),
      solved,
    });
    expect(result.map((p) => p.slug)).toEqual(["rotate-array", "three-sum"]);
  });

  it("combines query, topic, and status with AND logic", () => {
    const solved = new Set<string>();
    const result = filterProblems(flat, {
      query: "three",
      difficulty: "All",
      status: "Unsolved",
      topics: new Set(["two-pointers"]),
      solved,
    });
    expect(result.map((p) => p.slug)).toEqual(["three-sum"]);
  });

  it("returns [] when nothing matches", () => {
    const result = filterProblems(flat, {
      query: "nonexistent-problem-xyz",
      difficulty: "All",
      status: "All",
      topics: new Set(),
      solved: noSolved,
    });
    expect(result).toEqual([]);
  });
});
