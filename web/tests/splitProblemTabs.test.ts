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

  it("pulls the quiz fence out of solution into its own tab", () => {
    const { solution, quiz } = splitProblemTabs(
      '## Solution\n\nanswer body\n\n```quiz\n{ "question": "q" }\n```\n',
    );
    expect(solution).not.toContain("```quiz");
    expect(solution).toContain("answer body");
    expect(quiz).toContain('"question": "q"');
  });

  it("pulls the quiz fence out of explanation when there is no Solution heading", () => {
    const { explanation, quiz } = splitProblemTabs(
      '## Variants\n\nsome variants\n\n```quiz\n{ "question": "q" }\n```\n',
    );
    expect(explanation).not.toContain("```quiz");
    expect(explanation).toContain("Variants");
    expect(quiz).toContain('"question": "q"');
  });

  it("returns an empty quiz string when the lesson has none", () => {
    const { quiz } = splitProblemTabs("## Solution\n\nanswer body\n");
    expect(quiz).toBe("");
  });
});
