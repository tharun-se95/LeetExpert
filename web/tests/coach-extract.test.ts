import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import { extractSandboxFence } from "../src/lib/content/extractSandboxFence";
import { splitProblemTabs } from "../src/lib/content/splitProblemTabs";
import { extractHints } from "../src/lib/coach/extractHints";

const COURSE = join(__dirname, "..", "..", "courses", "dsa");

function explanationOf(rel: string): string {
  const raw = readFileSync(join(COURSE, rel), "utf8").replace(/\r\n/g, "\n");
  const { content } = matter(raw);
  const split = extractSandboxFence(content.trim());
  if (!split) throw new Error(`no sandbox in ${rel}`);
  return splitProblemTabs(split.afterSandbox).explanation;
}

describe("extractHints", () => {
  it("returns two Hint reveals from remove-duplicates-sorted explanation", () => {
    const hints = extractHints(explanationOf("arrays/remove-duplicates-sorted.md"));
    expect(hints).toHaveLength(2);
    expect(hints[0]).toMatchObject({
      index: 1,
      label: 'Hint 1 — what does "keeper" mean here?',
    });
    expect(hints[0].body).toContain("not equal to the previous keeper");
    expect(hints[1]).toMatchObject({
      index: 2,
      label: "Hint 2 — the template, specialized",
    });
    expect(hints[1].body).toContain("write = 1");
  });

  it("ignores Solution / Alternative / Follow-up reveals", () => {
    const explanation = [
      "````reveal Hint — the move",
      "Compare neighbors.",
      "````",
      "",
      "`````reveal Solution — do not take this",
      "def solve(): pass",
      "`````",
      "",
      "````reveal Follow-up — also ignore",
      "A sequel.",
      "````",
      "",
      "````reveal Alternative — ignore too",
      "Another way.",
      "````",
    ].join("\n");
    const hints = extractHints(explanation);
    expect(hints).toEqual([
      {
        index: 1,
        label: "Hint — the move",
        body: "Compare neighbors.",
      },
    ]);
  });

  it("reads the authored Hint pair from middle-of-list", () => {
    const hints = extractHints(explanationOf("linked-lists/middle-of-list.md"));
    expect(hints).toHaveLength(2);
    expect(hints[0].label).toMatch(/^Hint 1\b/);
    expect(hints[1].label).toMatch(/^Hint 2\b/);
    expect(hints.some((h) => /def |function /i.test(h.body))).toBe(false);
  });

  it("returns an empty list when the explanation has no Hint reveal", () => {
    const explanation = [
      "## Brute force",
      "",
      "`````reveal Solution — iterative three-pointer",
      "prev = None",
      "`````",
    ].join("\n");
    expect(extractHints(explanation)).toEqual([]);
  });
});
