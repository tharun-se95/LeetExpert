import { describe, it, expect } from "vitest";
import {
  parsePracticeProblemsYaml,
  extractPracticeProblemsFence,
  mergePracticeProblems,
} from "../src/lib/content/parsePracticeProblems";

describe("parsePracticeProblemsYaml", () => {
  it("parses a YAML list of briefs", () => {
    const src = `
- slug: move-zeroes
  pattern: Partition pointers
  difficulty: Easy
  watch_for: Stability of non-zero order
`.trim();
    expect(parsePracticeProblemsYaml(src)).toEqual([
      {
        slug: "move-zeroes",
        pattern: "Partition pointers",
        difficulty: "Easy",
        watch_for: "Stability of non-zero order",
      },
    ]);
  });

  it("returns [] for empty / whitespace", () => {
    expect(parsePracticeProblemsYaml("")).toEqual([]);
    expect(parsePracticeProblemsYaml("\n  \n")).toEqual([]);
  });
});

describe("extractPracticeProblemsFence", () => {
  it("returns authored null and unchanged body when fence missing", () => {
    const md = "## How to practice\n\nHello.\n\n## Problems\n";
    const { body, authored } = extractPracticeProblemsFence(md);
    expect(authored).toBeNull();
    expect(body).toBe(md);
  });

  it("strips the fence and parses authored briefs", () => {
    const md = [
      "## Problems",
      "",
      "```practice-problems",
      "- slug: move-zeroes",
      "  difficulty: Easy",
      "```",
      "",
      "Tail",
    ].join("\n");
    const { body, authored } = extractPracticeProblemsFence(md);
    expect(authored).toEqual([{ slug: "move-zeroes", difficulty: "Easy" }]);
    expect(body).not.toContain("practice-problems");
    expect(body).toContain("## Problems");
    expect(body).toContain("Tail");
  });
});

describe("mergePracticeProblems", () => {
  it("lists every arrays problem in manifest order when authored is null", () => {
    const rows = mergePracticeProblems("arrays", null);
    expect(rows.map((r) => r.slug)).toEqual([
      "remove-duplicates-sorted",
      "move-zeroes",
      "best-time-to-buy-sell-stock",
      "rotate-array",
      "product-except-self",
    ]);
    expect(rows[0].href).toBe("/problems/remove-duplicates-sorted");
    expect(rows[0].pattern).toBeUndefined();
  });

  it("falls back to PROBLEM_DIFFICULTY when fence omits difficulty", () => {
    const rows = mergePracticeProblems("graphs", null);
    const mst = rows.find((r) => r.slug === "min-cost-to-connect-all-points");
    expect(mst?.difficulty).toBe("Medium");
    expect(rows.every((r) => typeof r.difficulty === "string")).toBe(true);
  });

  it("overlays authored fields by slug", () => {
    const rows = mergePracticeProblems("arrays", [
      {
        slug: "move-zeroes",
        pattern: "Partition pointers",
        difficulty: "Easy",
        watch_for: "Stability",
      },
    ]);
    const mz = rows.find((r) => r.slug === "move-zeroes")!;
    expect(mz.pattern).toBe("Partition pointers");
    expect(mz.difficulty).toBe("Easy");
    expect(mz.watch_for).toBe("Stability");
    expect(rows).toHaveLength(5);
  });

  it("prefers authored difficulty over the map fallback", () => {
    const rows = mergePracticeProblems("arrays", [
      { slug: "product-except-self", difficulty: "Hard" },
    ]);
    expect(
      rows.find((r) => r.slug === "product-except-self")?.difficulty,
    ).toBe("Hard");
    expect(rows.find((r) => r.slug === "move-zeroes")?.difficulty).toBe("Easy");
  });

  it("throws when authored references an unknown slug", () => {
    expect(() =>
      mergePracticeProblems("arrays", [{ slug: "not-a-real-problem" }]),
    ).toThrow(/not-a-real-problem/);
  });
});
