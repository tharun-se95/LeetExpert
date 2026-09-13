import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { Quiz } from "@/components/course/Quiz";

/**
 * The quiz section heading must be a real heading: screen-reader users jump
 * between sections by heading, and a styled <p> made "Check yourself"
 * invisible to that navigation. Rendered from an authored quiz fence so the
 * test exercises the spec format lessons actually ship.
 */
const lesson = readFileSync(
  join(__dirname, "..", "..", "courses", "dsa", "recursion-backtracking", "subsets.md"),
  "utf8",
);
const source = lesson.match(/```quiz\n([\s\S]*?)\n```/)?.[1] ?? "";

describe("Quiz section heading", () => {
  const html = renderToStaticMarkup(<Quiz source={source} />);

  it("renders an authored quiz, not the invalid-spec fallback", () => {
    expect(source).not.toBe("");
    expect(html).not.toContain("Invalid quiz block");
  });

  it("is an h2 carrying the shared chapter-heading class", () => {
    const attrs = html.match(/<h2([^>]*)>Check yourself<\/h2>/)?.[1];
    expect(attrs).toBeDefined();
    expect(attrs).toMatch(/class="chapter-heading"/);
  });

  it("sits the question count on the heading's baseline", () => {
    // The header aligned by `items-end` while its count was a <p> inside
    // .handbook-prose, whose unlayered `p { margin: 0.85rem 0 }` beat the
    // count's mb-1: the margin box bottom-aligned, not the text, and the count
    // rode 11.5px above the heading's baseline (measured 166.05 vs 177.55px).
    // Same fix the question row below it already uses: baseline + !m-0.
    const header = html.match(/<header class="([^"]*)"[^>]*><h2[^>]*>Check yourself<\/h2>/)?.[1];
    expect(header).toBeDefined();
    expect(header).toContain("items-baseline");
    expect(header).not.toContain("items-end");
    const count = html.match(/<\/h2><p class="([^"]*)"[^>]*>\d+(?:<!-- -->)?\s?(?:<!-- -->)?questions?<\/p>/)?.[1];
    expect(count).toBeDefined();
    expect(count).toContain("!m-0");
    expect(count).not.toMatch(/\bmb-1\b/);
  });

  it("labels its section, so the region is announced by its heading", () => {
    const id = html.match(/<h2[^>]*\sid="([^"]+)"[^>]*>Check yourself<\/h2>/)?.[1];
    expect(id).toBeDefined();
    expect(html).toContain(`aria-labelledby="${id}"`);
  });
});
