import { describe, expect, it } from "vitest";
import { splitProblemTabs } from "@/lib/content/splitProblemTabs";

describe("splitProblemTabs", () => {
  it("splits on ## Solution", () => {
    const { explanation, solution } = splitProblemTabs(
      "````reveal Hint\nhint body\n````\n\n## Solution\n\nanswer body\n",
    );
    expect(explanation).toContain("Hint");
    expect(explanation).not.toContain("## Solution");
    expect(solution.startsWith("## Solution")).toBe(true);
    expect(solution).toContain("answer body");
  });

  it("puts everything in explanation when there is no Solution heading", () => {
    const { explanation, solution } = splitProblemTabs(
      "## Variants\n\nsome variants\n",
    );
    expect(explanation).toContain("Variants");
    expect(solution).toBe("");
  });

  it("does not split on ## Solution inside a nested heading-like line mid-paragraph", () => {
    // Only a line-start ## Solution counts — not "see ## Solution below".
    const { explanation, solution } = splitProblemTabs(
      "See the solution below.\n\n## Solution\n\ncode\n",
    );
    expect(explanation).toBe("See the solution below.");
    expect(solution).toContain("code");
  });
});
