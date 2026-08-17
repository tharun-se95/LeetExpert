import { describe, it, expect } from "vitest";
import { coachSuggestions } from "../src/lib/coach/suggestions";
import type { Diagnosis } from "../src/lib/coach/types";

const passed: Diagnosis = {
  status: "all-passed",
  kind: "all-passed",
  firstFailIndex: null,
  caseName: null,
  got: null,
  expected: null,
  error: null,
  passed: 5,
  total: 5,
  prose: "All 5 cases passed.",
  nextHintIndex: null,
};

const failed: Diagnosis = {
  ...passed,
  status: "failed",
  kind: "wrong-value",
  firstFailIndex: 0,
  caseName: "str_str",
  passed: 2,
  prose: "str_str returned -1; expected 0.",
};

describe("coachSuggestions", () => {
  it("keeps the empty-state chips before any chat", () => {
    expect(coachSuggestions({ hasChat: false, diagnosis: null })).toEqual([
      "What pattern is this?",
      "Why did that case fail?",
      "What’s the next hint without spoiling it?",
    ]);
  });

  it("after a pass, asks about the bound — not a variant algorithm", () => {
    const chips = coachSuggestions({ hasChat: true, diagnosis: passed });
    expect(chips).toEqual([
      "What is the worst-case cost of what I wrote?",
      "Do I need a faster algorithm at these constraints?",
      "What should I take from this problem?",
    ]);
    expect(chips.join(" ")).not.toMatch(/variant/i);
  });

  it("does not offer a fail chip under a passing diagnosis before any chat", () => {
    const chips = coachSuggestions({ hasChat: false, diagnosis: passed });
    expect(chips).not.toContain("Why did that case fail?");
    expect(chips).toEqual([
      "What is the worst-case cost of what I wrote?",
      "Do I need a faster algorithm at these constraints?",
      "What should I take from this problem?",
    ]);
  });

  it("after a fail, points at the case and the next hint", () => {
    expect(coachSuggestions({ hasChat: true, diagnosis: failed })).toEqual([
      "Why did that case fail?",
      "What’s the next hint without spoiling it?",
    ]);
  });
});
