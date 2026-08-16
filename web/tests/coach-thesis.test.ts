import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import { extractSandboxFence } from "../src/lib/content/extractSandboxFence";
import { splitProblemTabs } from "../src/lib/content/splitProblemTabs";
import { extractThesis } from "../src/lib/coach/extractThesis";

const COURSE = join(__dirname, "..", "..", "course");

function explanationOf(rel: string): string {
  const raw = readFileSync(join(COURSE, rel), "utf8").replace(/\r\n/g, "\n");
  const { content } = matter(raw);
  const split = extractSandboxFence(content.trim());
  if (!split) throw new Error(`no sandbox in ${rel}`);
  return splitProblemTabs(split.afterSandbox).explanation;
}

describe("extractThesis", () => {
  it("reads Find the Index insight and stays on the constraint thesis", () => {
    const thesis = extractThesis(explanationOf("strings/find-the-index.md"));
    expect(thesis).toMatch(/correct move at these constraints/i);
    expect(thesis).not.toMatch(/^## Solution\b/m);
    expect(thesis).not.toMatch(/def str_str|function strStr/);
    expect(thesis).not.toMatch(/```viz/);
  });

  it("returns empty when the explanation is only hints", () => {
    expect(
      extractThesis(explanationOf("linked-lists/reverse-linked-list.md")),
    ).toBe("");
  });

  it("takes the first blockquote when there is no The insight heading", () => {
    const explanation = [
      "Some setup.",
      "",
      "> The move is a single pass with a seen set.",
      "",
      "````reveal Hint 1 — look once",
      "Store what you have seen.",
      "````",
    ].join("\n");
    expect(extractThesis(explanation)).toContain("single pass with a seen set");
  });

  it("stops before a viz fence and ignores Solution text below", () => {
    const explanation = [
      "## The insight",
      "",
      "> Stay with the O(n) pass at these constraints.",
      "",
      "```viz",
      '{ "id": "substring-search" }',
      "```",
      "",
      "## Solution",
      "",
      "def str_str(haystack, needle):",
      "    return 0",
    ].join("\n");
    const thesis = extractThesis(explanation);
    expect(thesis).toContain("O(n) pass");
    expect(thesis).not.toContain("def str_str");
    expect(thesis).not.toContain("substring-search");
  });
});
