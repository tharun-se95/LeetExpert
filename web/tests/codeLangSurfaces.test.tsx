import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const read = (...p: string[]) => readFileSync(join(__dirname, "..", "src", ...p), "utf8");
const globals = read("app", "globals.css");
const COURSE_ROOT = join(__dirname, "..", "..", "courses", "dsa");

function markdownFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? markdownFiles(full) : entry.endsWith(".md") ? [full] : [];
  });
}

describe("panel hide rules", () => {
  it("hide the unchosen language, keyed off an explicit js", () => {
    // No attribute (script blocked, first visit) must render as Python.
    expect(globals).toContain(
      'html[data-code-lang="js"] [data-code-lang-panel="python"],\nhtml:not([data-code-lang="js"]) [data-code-lang-panel="js"] {\n  display: none;\n}',
    );
  });
});

describe("tabs fences", () => {
  it("carry exactly python and typescript, so the switch never lands on a missing language", () => {
    const offenders: string[] = [];
    let blocks = 0;
    for (const file of markdownFiles(COURSE_ROOT)) {
      const text = readFileSync(file, "utf8");
      for (const match of text.matchAll(/(`{4,})tabs[^\n]*\n([\s\S]*?)\1/g)) {
        blocks++;
        const langs = [...match[2].matchAll(/```(\w+)\n/g)].map((m) => m[1]).sort();
        if (langs.join(",") !== "python,typescript") {
          offenders.push(`${file.slice(COURSE_ROOT.length + 1)}: ${langs.join(",") || "(none)"}`);
        }
      }
    }
    expect(blocks).toBeGreaterThan(0);
    expect(offenders).toEqual([]);
  });
});
