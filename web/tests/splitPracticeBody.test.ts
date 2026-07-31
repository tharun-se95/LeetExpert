import { describe, it, expect } from "vitest";
import { splitPracticeBody } from "../src/lib/content/splitPracticeBody";

describe("splitPracticeBody", () => {
  it("splits intro from an exact ## Problems heading", () => {
    const md = [
      "## How to practice this module",
      "",
      "Do the drills.",
      "",
      "## Problems",
      "",
      "```practice-problems",
      "- slug: move-zeroes",
      "```",
    ].join("\n");
    const { intro, hadProblemsHeading } = splitPracticeBody(md);
    expect(hadProblemsHeading).toBe(true);
    expect(intro).toBe(
      ["## How to practice this module", "", "Do the drills."].join("\n"),
    );
    expect(intro).not.toContain("## Problems");
  });

  it("returns full body when Problems heading is missing", () => {
    const md = "## How to practice\n\nHello.\n";
    const { intro, hadProblemsHeading } = splitPracticeBody(md);
    expect(hadProblemsHeading).toBe(false);
    expect(intro).toBe("## How to practice\n\nHello.");
  });
});
