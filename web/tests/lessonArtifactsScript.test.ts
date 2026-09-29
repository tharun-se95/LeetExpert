import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { Linter } from "eslint";
import js from "@eslint/js";
import globals from "globals";

/**
 * Every artifact page's script, linted as the one script it ships as (#23).
 *
 * The kit and a lesson's lesson.js are fragments that build.py joins into one function scope, so a
 * name defined in one file and used in another is the normal case, and per-file lint cannot tell a
 * missing name from a shared one. Here each page's parts are joined exactly as build.py joins them
 * (build.page_parts, the list build() itself uses), then held to eslint's recommended rules: a typo'd
 * name (no-undef) or a kit function defined twice, where the later one silently replaces the first
 * (no-redeclare), fails here instead of as a console error in one lesson's browser gate.
 */
const ARTIFACTS = join(__dirname, "..", "lesson-artifacts");

type Page = { id: string; parts: { name: string; text: string }[] };
const PAGES: Page[] = JSON.parse(spawnSync("python3", ["-c",
  `import sys,json;sys.path.insert(0,${JSON.stringify(ARTIFACTS)});import build
print(json.dumps([{"id":m+"/"+s,"parts":[{"name":n,"text":t} for n,t in build.page_parts(s)]} for m,s,*_ in build.LESSONS]))`],
  { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }).stdout);

const CONFIG: Linter.Config[] = [{
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: "script",
    // motion.js is loaded before the page script and publishes window.Motion
    globals: { ...globals.browser, Motion: "readonly" },
  },
  rules: {
    ...js.configs.recommended.rules,
    // a fragment defines what later fragments use; build.py's own unused-kit trimming is
    // optional_kit, and a helper one lesson does not call is not a defect in that lesson
    "no-unused-vars": "off",
  },
}];

/* the joined script, with each line traced back to the file it came from */
function lint(page: Page) {
  const lines: string[] = [], from: string[] = [];
  // build() puts the page's data between the kit and lesson.js, and calls wirePage() after it
  const parts = [...page.parts.slice(0, -1), { name: "data", text: "var CODE={},LESSON={},HL={};" }, page.parts.at(-1)!,
    { name: "tail", text: "wirePage();" }];
  parts.forEach((p) => p.text.split("\n").forEach((l, k) => { lines.push(l); from.push(`${p.name}:${k + 1}`); }));
  const src = "(function(){\n'use strict';\n" + lines.join("\n") + "\n})();";
  return new Linter({ configType: "flat" }).verify(src, CONFIG)
    .map((m) => `${from[m.line - 3] ?? "wrapper"} ${m.ruleId ?? "parse"}: ${m.message}`);
}

describe("lesson artifacts: each page's script", () => {
  it("build.py lists every page, with the kit core before the lesson", () => {
    expect(PAGES.length).toBeGreaterThan(5);
    for (const p of PAGES) {
      const names = p.parts.map((x) => x.name);
      expect(names.slice(0, 3)).toEqual(["kit/engine.js", "kit/trees.js", "kit/kit.js"]);
      expect(names.at(-1)).toBe("lesson.js");
    }
  });

  for (const page of PAGES) {
    it(`${page.id} passes eslint as one script`, () => {
      expect(lint(page)).toEqual([]);
    });
  }

  it("a name no fragment defines, and a function defined twice, both fail", () => {
    const page = PAGES[0]!;
    // planted in the kit, ahead of lesson.js, as a kit edit would be
    const plant = (text: string): Page => ({ ...page, parts: [...page.parts.slice(0, -1), { name: "planted.js", text }, page.parts.at(-1)!] });
    const withTypo = plant("drawTheHeroo();"), twice = plant("function wirePage(){}");
    expect(lint(withTypo)).toEqual([expect.stringMatching(/^planted\.js:1 no-undef: 'drawTheHeroo' is not defined/)]);
    expect(lint(twice).some((m) => /^planted\.js:1 no-redeclare/.test(m))).toBe(true);
  });
});
