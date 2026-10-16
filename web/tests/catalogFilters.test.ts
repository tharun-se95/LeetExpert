import { describe, it, expect } from "vitest";
import {
  filterCatalog,
  sortCatalog,
  isProblemSolved,
  computeListCounts,
  computeTopicCounts,
} from "@/lib/course/catalog/filters";
import type { CatalogProblem } from "@/lib/course/catalog/types";

const MOCK_PROBLEMS: CatalogProblem[] = [
  {
    id: 1,
    slug: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    topics: ["Arrays", "Hash Tables"],
    pattern: "Complement lookup",
    lists: ["all", "course", "blind75", "neetcode150", "top150"],
    courseModuleSlug: "hash-tables",
    courseLessonSlug: "two-sum",
  },
  {
    id: 15,
    slug: "3sum",
    title: "3Sum",
    difficulty: "Medium",
    topics: ["Arrays", "Two Pointers"],
    pattern: "Sort + two-pointer per pivot",
    lists: ["all", "course", "blind75", "neetcode150"],
    courseModuleSlug: "two-pointers",
    courseLessonSlug: "three-sum",
  },
  {
    id: 42,
    slug: "trapping-rain-water",
    title: "Trapping Rain Water",
    difficulty: "Hard",
    topics: ["Arrays", "Two Pointers", "Stacks"],
    pattern: "Running maxima",
    lists: ["all", "course", "blind75", "top150"],
    courseModuleSlug: "two-pointers",
    courseLessonSlug: "trapping-rain-water",
  },
  {
    id: 217,
    slug: "contains-duplicate",
    title: "Contains Duplicate",
    difficulty: "Easy",
    topics: ["Arrays", "Hash Tables"],
    pattern: "Seen set lookup",
    lists: ["all", "blind75", "neetcode150"],
  },
];

describe("isProblemSolved", () => {
  it("resolves course problems via courseModule/courseLesson identifier", () => {
    const solved = new Set(["hash-tables/two-sum"]);
    expect(isProblemSolved(MOCK_PROBLEMS[0], solved)).toBe(true);
    expect(isProblemSolved(MOCK_PROBLEMS[1], solved)).toBe(false);
  });

  it("resolves external problems via slug or stringified id", () => {
    const solvedSlug = new Set(["contains-duplicate"]);
    expect(isProblemSolved(MOCK_PROBLEMS[3], solvedSlug)).toBe(true);

    const solvedCatalogSlug = new Set(["catalog/contains-duplicate"]);
    expect(isProblemSolved(MOCK_PROBLEMS[3], solvedCatalogSlug)).toBe(true);

    const solvedId = new Set(["217"]);
    expect(isProblemSolved(MOCK_PROBLEMS[3], solvedId)).toBe(true);
  });
});

describe("filterCatalog", () => {
  const emptySolved = new Set<string>();

  it("filters by curated list preset", () => {
    const courseOnly = filterCatalog(MOCK_PROBLEMS, {
      query: "",
      list: "course",
      difficulty: "All",
      status: "All",
      topics: new Set(),
      solvedIds: emptySolved,
    });
    expect(courseOnly.map((p) => p.slug)).toEqual([
      "two-sum",
      "3sum",
      "trapping-rain-water",
    ]);

    const top150Only = filterCatalog(MOCK_PROBLEMS, {
      query: "",
      list: "top150",
      difficulty: "All",
      status: "All",
      topics: new Set(),
      solvedIds: emptySolved,
    });
    expect(top150Only.map((p) => p.slug)).toEqual([
      "two-sum",
      "trapping-rain-water",
    ]);
  });

  it("filters by difficulty", () => {
    const hardOnly = filterCatalog(MOCK_PROBLEMS, {
      query: "",
      list: "all",
      difficulty: "Hard",
      status: "All",
      topics: new Set(),
      solvedIds: emptySolved,
    });
    expect(hardOnly.map((p) => p.id)).toEqual([42]);
  });

  it("filters by solved status", () => {
    const solved = new Set(["hash-tables/two-sum", "contains-duplicate"]);
    const solvedResult = filterCatalog(MOCK_PROBLEMS, {
      query: "",
      list: "all",
      difficulty: "All",
      status: "Solved",
      topics: new Set(),
      solvedIds: solved,
    });
    expect(solvedResult.map((p) => p.id)).toEqual([1, 217]);

    const unsolvedResult = filterCatalog(MOCK_PROBLEMS, {
      query: "",
      list: "all",
      difficulty: "All",
      status: "Unsolved",
      topics: new Set(),
      solvedIds: solved,
    });
    expect(unsolvedResult.map((p) => p.id)).toEqual([15, 42]);
  });

  it("filters by topics (multi-select OR intersection)", () => {
    const twoPointers = filterCatalog(MOCK_PROBLEMS, {
      query: "",
      list: "all",
      difficulty: "All",
      status: "All",
      topics: new Set(["Two Pointers"]),
      solvedIds: emptySolved,
    });
    expect(twoPointers.map((p) => p.id)).toEqual([15, 42]);
  });

  it("searches by problem number (#42 and 42)", () => {
    const hashSearch = filterCatalog(MOCK_PROBLEMS, {
      query: "#42",
      list: "all",
      difficulty: "All",
      status: "All",
      topics: new Set(),
      solvedIds: emptySolved,
    });
    expect(hashSearch.map((p) => p.id)).toEqual([42]);

    const plainSearch = filterCatalog(MOCK_PROBLEMS, {
      query: "15",
      list: "all",
      difficulty: "All",
      status: "All",
      topics: new Set(),
      solvedIds: emptySolved,
    });
    expect(plainSearch.map((p) => p.id)).toEqual([15]);
  });

  it("searches by pattern name", () => {
    const patternSearch = filterCatalog(MOCK_PROBLEMS, {
      query: "complement",
      list: "all",
      difficulty: "All",
      status: "All",
      topics: new Set(),
      solvedIds: emptySolved,
    });
    expect(patternSearch.map((p) => p.id)).toEqual([1]);
  });
});

describe("sortCatalog", () => {
  it("sorts by ID ascending and descending", () => {
    const asc = sortCatalog(MOCK_PROBLEMS, "id", "asc");
    expect(asc.map((p) => p.id)).toEqual([1, 15, 42, 217]);

    const desc = sortCatalog(MOCK_PROBLEMS, "id", "desc");
    expect(desc.map((p) => p.id)).toEqual([217, 42, 15, 1]);
  });

  it("sorts by difficulty (Easy -> Medium -> Hard)", () => {
    const diffAsc = sortCatalog(MOCK_PROBLEMS, "difficulty", "asc");
    expect(diffAsc.map((p) => p.difficulty)).toEqual([
      "Easy",
      "Easy",
      "Medium",
      "Hard",
    ]);
  });
});

describe("computeListCounts & computeTopicCounts", () => {
  it("aggregates list and topic counts accurately", () => {
    const listCounts = computeListCounts(MOCK_PROBLEMS);
    expect(listCounts.all).toBe(4);
    expect(listCounts.course).toBe(3);
    expect(listCounts.top150).toBe(2);

    const topicCounts = computeTopicCounts(MOCK_PROBLEMS);
    expect(topicCounts.get("Arrays")).toBe(4);
    expect(topicCounts.get("Two Pointers")).toBe(2);
    expect(topicCounts.get("Stacks")).toBe(1);
  });
});
