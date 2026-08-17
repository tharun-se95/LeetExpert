import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { filterCoachReply } from "../src/lib/coach/filter";
import { COACH_REFUSE } from "../src/lib/coach/types";

const REF = join(__dirname, "reference", "hash-tables");

describe("filterCoachReply", () => {
  it("rejects the Two Sum Python reference", () => {
    const src = readFileSync(join(REF, "two-sum.py"), "utf8");
    expect(filterCoachReply(src, { python: "two_sum", javascript: "twoSum" })).toBe(
      COACH_REFUSE,
    );
  });

  it("rejects the Two Sum JavaScript reference", () => {
    const src = readFileSync(join(REF, "two-sum.js"), "utf8");
    expect(filterCoachReply(src, { python: "two_sum", javascript: "twoSum" })).toBe(
      COACH_REFUSE,
    );
  });

  it("rejects a fenced implementation", () => {
    const reply = [
      "Try a set.",
      "",
      "```python",
      "def other():",
      "    return 1",
      "```",
    ].join("\n");
    expect(filterCoachReply(reply, { python: "two_sum", javascript: "twoSum" })).toBe(
      COACH_REFUSE,
    );
  });

  it("rejects any fenced block, not only language-tagged ones", () => {
    const reply = "Count the alignments.\n\n```\nfor i in range(n):\n    pass\n```";
    expect(filterCoachReply(reply, { python: "two_sum", javascript: "twoSum" })).toBe(
      COACH_REFUSE,
    );
  });

  it("allows a Socratic nudge", () => {
    const reply =
      "Have you considered a set for values you have already seen? What would you store alongside each value?";
    expect(filterCoachReply(reply, { python: "two_sum", javascript: "twoSum" })).toBe(
      reply,
    );
  });
});
