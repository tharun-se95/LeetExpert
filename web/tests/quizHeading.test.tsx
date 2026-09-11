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

  it("labels its section, so the region is announced by its heading", () => {
    const id = html.match(/<h2[^>]*\sid="([^"]+)"[^>]*>Check yourself<\/h2>/)?.[1];
    expect(id).toBeDefined();
    expect(html).toContain(`aria-labelledby="${id}"`);
  });
});
