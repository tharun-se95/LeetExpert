import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { parseRoadmapStages } from "@/lib/content/parseRoadmapStages";
import { extractToc } from "@/lib/course/load";

describe("parseRoadmapStages", () => {
  it("splits five Stage headings into five chunks", () => {
    const source = [
      "### Stage 0 — Foundations",
      "",
      "body zero",
      "",
      "### Stage 1 — Linear structures",
      "",
      "body one",
    ].join("\n");
    const stages = parseRoadmapStages(source);
    expect(stages).toHaveLength(2);
    expect(stages![0]).toMatch(/^### Stage 0/);
    expect(stages![0]).toContain("body zero");
    expect(stages![1]).toMatch(/^### Stage 1/);
  });

  it("returns null when a chunk lacks a Stage heading", () => {
    expect(parseRoadmapStages("### Not a stage\n\nhi")).toBeNull();
  });

  it("returns null for empty source", () => {
    expect(parseRoadmapStages("")).toBeNull();
    expect(parseRoadmapStages("   \n")).toBeNull();
  });
});

describe("extractToc roadmap fence", () => {
  it("includes headings inside a roadmap fence", () => {
    const md = [
      "## Five stages, in dependency order",
      "",
      "```roadmap",
      "### Stage 0 — Foundations",
      "",
      "para",
      "",
      "### Stage 1 — Linear structures",
      "",
      "para",
      "```",
      "",
      "## How to move through it",
    ].join("\n");
    const toc = extractToc(md);
    expect(toc.map((t) => t.text)).toEqual([
      "Five stages, in dependency order",
      "Stage 0 — Foundations",
      "Stage 1 — Linear structures",
      "How to move through it",
    ]);
  });

  it("still skips headings inside reveal fences", () => {
    const md = ["## Outer", "", "```reveal Hint", "### Hidden", "```"].join(
      "\n",
    );
    expect(extractToc(md).map((t) => t.text)).toEqual(["Outer"]);
  });
});

describe("course-roadmap content", () => {
  it("has one roadmap fence with stages 0–4", () => {
    const file = path.resolve(
      __dirname,
      "../../courses/dsa/getting-started/course-roadmap.md",
    );
    const raw = fs.readFileSync(file, "utf8");
    const body = raw.replace(/^---\r?\n[\s\S]*?---\r?\n/, "");
    const fences = [...body.matchAll(/^```roadmap\r?\n([\s\S]*?)^```/gm)];
    expect(fences).toHaveLength(1);
    const stages = parseRoadmapStages(fences[0][1]);
    expect(stages).toHaveLength(5);
    for (let n = 0; n < 5; n++) {
      expect(stages![n]).toMatch(new RegExp(`^### Stage ${n}`));
    }
    const toc = extractToc(body);
    expect(toc.some((t) => t.text.startsWith("Stage 0"))).toBe(true);
    expect(toc.some((t) => t.text.startsWith("Stage 4"))).toBe(true);
  });
});
