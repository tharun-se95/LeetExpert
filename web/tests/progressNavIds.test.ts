import { describe, it, expect } from "vitest";
import { allLessonsNavIds } from "../src/lib/course/manifest";
import { countLessonsProgress, lessonId } from "../src/lib/course/nav";

describe("countLessonsProgress", () => {
  it("ignores problem ids even when present in visited", () => {
    const ids = new Set(allLessonsNavIds());
    const visited = [
      lessonId("arrays", "contiguous-memory"),
      lessonId("arrays", "move-zeroes"),
      lessonId("arrays", "practice"),
    ];
    expect(countLessonsProgress(visited, ids)).toBe(2);
  });

  it("denominator set is 103 after the arrays curriculum expansion", () => {
    expect(allLessonsNavIds()).toHaveLength(103);
  });
});
