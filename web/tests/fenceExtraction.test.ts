import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { visit } from "unist-util-visit";
import type { Code, Root } from "mdast";
import { extractQuizFence } from "../src/lib/content/extractQuizFence";
import { extractPracticeProblemsFence } from "../src/lib/content/parsePracticeProblems";

/*
  The lesson loader highlights every fence keyed on its exact text, before the
  lesson page lifts the quiz or practice-problems fence out. If lifting a fence
  rewrites the text of any fence left behind, its lookup misses: a `tabs` block
  renders as raw markdown and a plain code block loses its highlighting.
*/

const COURSE_ROOT = join(__dirname, "..", "..", "courses", "dsa");

function markdownFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? markdownFiles(full) : entry.endsWith(".md") ? [full] : [];
  });
}

function fences(markdown: string): string[] {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown) as Root;
  const out: string[] = [];
  visit(tree, "code", (node: Code) => {
    out.push(`${node.lang ?? ""} ${node.value}`);
  });
  return out;
}

const PEP8_BLOCK = ["```python", "class A:", "    pass", "", "", "class B:", "    pass", "```"].join("\n");

describe("lifting a fence out of a lesson", () => {
  it("leaves blank lines inside other code fences alone (quiz)", () => {
    const md = ["# Lesson", "", PEP8_BLOCK, "", "```quiz", "q: 1", "```", ""].join("\n");
    const { body, quizSource } = extractQuizFence(md);
    expect(quizSource).not.toBeNull();
    expect(fences(body)).toEqual(fences(md).filter((f) => !f.startsWith("quiz ")));
  });

  it("leaves blank lines inside other code fences alone (practice problems)", () => {
    const md = ["## Problems", "", "```practice-problems", "- slug: x", "```", "", PEP8_BLOCK, ""].join("\n");
    const { body, authored } = extractPracticeProblemsFence(md);
    expect(authored).not.toBeNull();
    expect(fences(body)).toEqual(fences(md).filter((f) => !f.startsWith("practice-problems ")));
  });

  it("still closes the gap the fence leaves in the prose", () => {
    const md = ["Before", "", "```quiz", "q: 1", "```", "", "After", ""].join("\n");
    expect(extractQuizFence(md).body).toBe("Before\n\nAfter\n");
    const tail = ["Before", "", "```quiz", "q: 1", "```", ""].join("\n");
    expect(extractQuizFence(tail).body).toBe("Before\n");
  });

  it("changes no remaining fence in any lesson", () => {
    const offenders: string[] = [];
    for (const file of markdownFiles(COURSE_ROOT)) {
      // The same normalisation the loader applies before highlighting.
      const raw = readFileSync(file, "utf8").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
      const markdown = matter(raw).content.trim();
      const bodies = [extractQuizFence(markdown).body, extractPracticeProblemsFence(markdown).body].filter(
        (body) => body !== markdown,
      );
      // Most lessons lift nothing; parsing only the ones that changed keeps
      // this well inside the timeout when the whole suite shares the CPU.
      if (bodies.length === 0) continue;
      const before = new Set(fences(markdown));
      for (const body of bodies) {
        for (const fence of fences(body)) {
          if (!before.has(fence)) offenders.push(`${file.slice(COURSE_ROOT.length + 1)}: ${fence.slice(0, 40)}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});
