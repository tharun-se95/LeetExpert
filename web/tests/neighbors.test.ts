import { describe, it, expect } from "vitest";
import { getLessonNeighbors } from "../src/lib/course/load";

describe("getLessonNeighbors Lessons order", () => {
  it("skips individual problems between concepts and Practice", () => {
    const fromInPlace = getLessonNeighbors(
      "arrays",
      "stable-compaction-cyclic-placement",
    );
    expect(fromInPlace.next).toEqual({
      module: "arrays",
      lesson: "practice",
      title: "Practice",
    });

    const fromPractice = getLessonNeighbors("arrays", "practice");
    expect(fromPractice.prev).toEqual({
      module: "arrays",
      lesson: "stable-compaction-cyclic-placement",
      title: "Stable Compaction & Cyclic Placement",
    });
    expect(fromPractice.next?.module).toBe("strings");
    expect(fromPractice.next?.lesson).not.toBe("valid-palindrome");
  });

  it("does not treat a problem slug as a Lessons neighbor anchor", () => {
    const orphan = getLessonNeighbors("arrays", "move-zeroes");
    expect(orphan.prev).toBeNull();
    expect(orphan.next).toBeNull();
  });
});
