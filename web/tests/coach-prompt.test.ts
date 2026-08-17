import { describe, it, expect } from "vitest";
import { buildModelMessages, COACH_SYSTEM_PROMPT } from "../src/lib/coach/prompt";
import type { CoachChatRequest, CoachProblem } from "../src/lib/coach/types";

const problem: CoachProblem = {
  sandboxId: "two-sum",
  title: "Two Sum",
  moduleSlug: "hash-tables",
  statement: "Return two indices that add to target.",
  thesis: "Naive is the correct move at these constraints.",
  hints: [
    { index: 1, label: "Hint 1 — look once", body: "Store what you have seen." },
  ],
  fn: { python: "two_sum", javascript: "twoSum" },
};

const request: CoachChatRequest = {
  sandboxId: "two-sum",
  lang: "python",
  code: "def two_sum(nums, target):\n    pass\n",
  diagnosis: {
    status: "failed",
    kind: "wrong-value",
    firstFailIndex: 0,
    caseName: "two_sum([2,7], 9)",
    got: "None",
    expected: "[0,1]",
    error: null,
    passed: 0,
    total: 1,
    prose: "two_sum([2,7], 9) returned None; expected [0,1].",
    nextHintIndex: 1,
  },
  messages: [{ role: "user", content: "Why did that fail?" }],
};

describe("buildModelMessages", () => {
  it("includes statement, hints, code, lang, and diagnosis", () => {
    const packed = buildModelMessages(problem, request);
    const blob = JSON.stringify(packed);
    expect(blob).toContain("Return two indices");
    expect(blob).toContain("Store what you have seen.");
    expect(blob).toContain("def two_sum");
    expect(blob).toContain("python");
    expect(blob).toContain("expected [0,1]");
    expect(blob).toContain("Why did that fail?");
    expect(COACH_SYSTEM_PROMPT).toMatch(/Socratic/i);
    expect(COACH_SYSTEM_PROMPT).toContain("two_sum");
  });

  it("does not serialize a solution field even if one is smuggled on the object", () => {
    const sneaky = {
      ...problem,
      solution: "def two_sum(nums, target):\n    return [0, 1]\n",
    };
    const packed = buildModelMessages(sneaky, request);
    const blob = JSON.stringify(packed);
    expect(blob).not.toContain("return [0, 1]");
    expect(blob).not.toMatch(/"solution"/);
  });

  it("packs the thesis and forbids assigning a faster algorithm after a pass", () => {
    const packed = buildModelMessages(problem, request);
    expect(packed.system).toContain(
      "Naive is the correct move at these constraints.",
    );
    expect(packed.system).toMatch(/plain text/i);
    expect(packed.system).toMatch(/LaTeX/i);
    expect(packed.system).toMatch(/ambiguous/i);
    expect(packed.system).toMatch(/do not assign a faster/i);
    expect(packed.system).not.toContain("return [0, 1]");
  });

  it("scopes the Socratic rule to this problem's solution, not language syntax", () => {
    // A learner asking "what does [::-1] do" has a Python gap, not an
    // algorithm gap — making them guess at slice notation teaches nothing
    // about the lesson and just adds friction. Only the solution itself
    // stays behind questions.
    const packed = buildModelMessages(problem, request);
    expect(packed.system).toMatch(/language syntax or a built-in/i);
    expect(packed.system).toMatch(/direct,? factual answer/i);
  });
});
