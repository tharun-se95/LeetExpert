import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import { METADATA_DESCRIPTION_MAX, metaDescription } from "../src/lib/seo/description";
import { MODULES } from "../src/lib/course/manifest";
import { readLessonMarkdown } from "../src/lib/course/load";

describe("metaDescription", () => {
  it("takes the first prose paragraph, skipping the section heading", () => {
    expect(metaDescription("## Spreading the word\n\nImagine a town.")).toBe(
      "Imagine a town.",
    );
  });

  it("strips bold, italic and inline code so no markdown reaches the SERP", () => {
    expect(
      metaDescription("## H\n\nReturn **all** possible `subsets` of *nums*."),
    ).toBe("Return all possible subsets of nums.");
  });

  it("strips ==highlight== marks, which this course uses in problem statements", () => {
    expect(metaDescription("## H\n\nRemove them ==in place== please.")).toBe(
      "Remove them in place please.",
    );
  });

  it("keeps link text and drops the URL", () => {
    expect(metaDescription("## H\n\nSee [the guide](/courses/dsa) first.")).toBe(
      "See the guide first.",
    );
  });

  it("skips fenced code blocks that precede the prose", () => {
    const md = '## H\n\n```diagram\n{ "id": "x" }\n```\n\nThe real sentence.';
    expect(metaDescription(md)).toBe("The real sentence.");
  });

  it("collapses hard-wrapped lines into one line", () => {
    expect(metaDescription("## H\n\nOne line\nand another\nand a third.")).toBe(
      "One line and another and a third.",
    );
  });

  it("skips tables and list markers to reach real prose", () => {
    const md = "## H\n\n| a | b |\n| - | - |\n\n- bullet\n\nActual prose here.";
    expect(metaDescription(md)).toBe("Actual prose here.");
  });

  it("never exceeds the length Google will render", () => {
    const long = `## H\n\n${"word ".repeat(200)}`;
    const out = metaDescription(long) ?? "";
    expect(out.length).toBeLessThanOrEqual(METADATA_DESCRIPTION_MAX);
  });

  it("truncates on a word boundary rather than mid-word", () => {
    const out = metaDescription(`## H\n\n${"alpha ".repeat(60)}`) ?? "";
    expect(out).toMatch(/(alpha|…)$/);
    expect(out).not.toMatch(/alph…?$/);
  });

  it("ends on a complete sentence when that still fills the snippet", () => {
    const first = `${"detail ".repeat(14)}ends here.`;
    const md = `## H\n\n${first} ${"tail ".repeat(60)}`;
    expect(metaDescription(md)).toBe(first);
  });

  // The opposite case, and the bug that motivated the rule: a very short
  // opening sentence must not collapse a rich paragraph into a fragment.
  it("does not collapse to a short opening sentence", () => {
    const md = `## H\n\nStages built containers. ${"real substance ".repeat(20)}`;
    const out = metaDescription(md) ?? "";
    expect(out).not.toBe("Stages built containers.");
    expect(out.length).toBeGreaterThan(100);
  });

  it("returns undefined when there is no prose to describe", () => {
    expect(metaDescription("## Only a heading\n\n```js\ncode();\n```")).toBeUndefined();
  });

  it("ignores a stray frontmatter block if one is passed in", () => {
    expect(
      metaDescription("---\ntitle: X\ntype: concept\n---\n\n## H\n\nBody text."),
    ).toBe("Body text.");
  });
});

// The real product surface: 220 authored files. A description that renders
// markdown syntax or runs past the SERP limit is a visible defect on a page
// we are asking Google to rank, so assert it across every one of them.
describe("every authored DSA lesson yields a usable description", () => {
  const ROOT = join(__dirname, "..", "..", "courses", "dsa");
  const lessons = MODULES.flatMap((m) =>
    m.lessons.map((l) => ({ module: m.slug, lesson: l.slug })),
  );

  it("covers every lesson in the manifest", () => {
    const missing = lessons.filter(({ module, lesson }) => {
      const body = matter(
        readFileSync(join(ROOT, module, `${lesson}.md`), "utf8"),
      ).content;
      return !metaDescription(body);
    });
    expect(missing).toEqual([]);
  });

  it("emits no markdown artifacts and no over-length text", () => {
    const bad: string[] = [];
    for (const { module, lesson } of lessons) {
      const body = matter(
        readFileSync(join(ROOT, module, `${lesson}.md`), "utf8"),
      ).content;
      const d = metaDescription(body) ?? "";
      if (d.length > METADATA_DESCRIPTION_MAX) bad.push(`${lesson}: too long`);
      // Unambiguous leaks only. "|", "*" and "#" all occur as real prose in
      // this course (absolute value, multiplication, and the "#" sentinel in
      // stream-first-unique); "#" is markdown only at the start of a line,
      // which the extractor already skips. A stray backtick, a link tail or
      // a raw newline is never anything but a leak.
      if (/[`]|\]\(|==|\n/.test(d)) bad.push(`${lesson}: markdown artifact -> ${d}`);
      if (d.length < 40) bad.push(`${lesson}: too short -> ${d}`);
    }
    expect(bad).toEqual([]);
  });
});

describe("readLessonMarkdown", () => {
  it("returns the lesson body with frontmatter stripped", () => {
    const md = readLessonMarkdown("big-o", "common-complexity-classes");
    expect(md).toBeTruthy();
    expect(md).not.toContain("title:");
    expect(md).toContain("## Spreading the word");
  });

  it("returns null for a lesson that is not in the manifest", () => {
    expect(readLessonMarkdown("big-o", "not-a-real-lesson")).toBeNull();
  });

  // generateMetadata runs per page at build time; re-running Shiki over every
  // code block just to get a description would be a real cost for nothing.
  it("does no syntax highlighting (raw markdown only)", () => {
    const md = readLessonMarkdown("big-o", "common-complexity-classes") ?? "";
    expect(md).not.toContain("<span");
  });
});
