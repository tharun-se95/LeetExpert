import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import { extractSandboxFence } from "../src/lib/content/extractSandboxFence";

describe("extractSandboxFence", () => {
  it("returns null when there is no sandbox fence", () => {
    const markdown = "## Problem\n\nSome text.\n\n## Attempt it first\n\nMore text.\n";
    expect(extractSandboxFence(markdown)).toBeNull();
  });

  it("splits before/source/after around the fence", () => {
    const markdown = [
      "## Problem",
      "",
      "Some problem text.",
      "",
      "## Attempt it first",
      "",
      "Try it.",
      "",
      "```sandbox",
      '{"id": "demo"}',
      "```",
      "",
      "````reveal Hint 1",
      "A hint.",
      "````",
      "",
    ].join("\n");

    const result = extractSandboxFence(markdown);
    expect(result).not.toBeNull();
    if (!result) return;

    expect(result.sandboxSource).toBe('{"id": "demo"}');
    expect(result.beforeSandbox).toContain("## Problem");
    expect(result.beforeSandbox).toContain("## Attempt it first");
    expect(result.beforeSandbox).not.toContain("```sandbox");
    expect(result.afterSandbox).toContain("````reveal Hint 1");
    expect(result.afterSandbox).not.toContain("```sandbox");
  });

  it("splits a real lesson file the same way loadLesson will", () => {
    const path = join(
      __dirname,
      "..",
      "..",
      "course",
      "recursion-backtracking",
      "subsets.md",
    );
    const raw = readFileSync(path, "utf8");
    const { content } = matter(raw);
    const result = extractSandboxFence(content.trim());

    expect(result).not.toBeNull();
    if (!result) return;

    const spec = JSON.parse(result.sandboxSource) as { id: string };
    expect(spec.id).toBe("subsets");
    expect(result.beforeSandbox).toContain("## Problem");
    expect(result.afterSandbox).toContain("## Solution");
    expect(result.beforeSandbox).not.toContain("```sandbox");
    expect(result.afterSandbox).not.toContain("```sandbox");
  });
});
