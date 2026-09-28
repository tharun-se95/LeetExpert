import { describe, it, expect } from "vitest";
import { readdirSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { renderLesson } from "../lesson-artifacts/lessonMd";

/**
 * Lesson artifacts written as lesson.md (spec 2026-09-26-lesson-content-as-data-design.md).
 *
 * Every lesson.md renders, and the dialect's rules hold at build: the kit enforces them once,
 * so no lesson can bypass them with hand-written markup. Each fence is rendered against a
 * fixture, and each rule is shown rejecting what it should.
 */
const ARTIFACTS = join(__dirname, "..", "lesson-artifacts");

const FRONT = `---
title: T
kicker: K
headline: H
lede: L
chips: ["time **O(n)**"]
hero: |
  <div class="hero-stage"></div>
---
`;
const page = (body: string) => renderLesson(FRONT + body);
const QUIZ = (q: object) => "```quiz\n" + JSON.stringify({ questions: [q] }) + "\n```";
const Q = { question: "Why?", options: ["a", "b", "c"], answer: 1, explanation: "Because." };

/* kit fixtures build.py declares under "specimens": written in the same dialect, but not lessons */
const SPECIMENS: string[] = JSON.parse(spawnSync("python3", ["-c",
  `import sys,json;sys.path.insert(0,${JSON.stringify(ARTIFACTS)});import build;print(json.dumps([s for m,s,*_ in build.LESSONS if m=="specimens"]))`],
  { encoding: "utf8" }).stdout);

describe("lesson artifacts: lesson.md", () => {
  const written = readdirSync(ARTIFACTS).filter((d) => existsSync(join(ARTIFACTS, d, "lesson.md")));
  const lessons = written.filter((d) => !SPECIMENS.includes(d));

  it("kit specimens render in the dialect too, with no raw html fences", () => {
    expect(SPECIMENS).toEqual(["kit-players"]);
    for (const s of SPECIMENS) {
      expect(written).toContain(s);
      expect(renderLesson(readFileSync(join(ARTIFACTS, s, "lesson.md"), "utf8")).rawBlocks).toBe(0);
    }
  });

  it("the five verified lessons are written as lesson.md, with no body.html left", () => {
    expect(lessons.sort()).toEqual([
      "build-a-linked-list",
      "coin-change",
      "course-schedule",
      "diameter-of-binary-tree",
      "longest-substring-without-repeating",
    ]);
    for (const l of lessons) expect(existsSync(join(ARTIFACTS, l, "body.html")), `${l}/body.html`).toBe(false);
  });

  it.each(lessons)("%s renders, with no raw html fences", (l) => {
    const r = renderLesson(readFileSync(join(ARTIFACTS, l, "lesson.md"), "utf8"));
    expect(r.rawBlocks).toBe(0);
    expect(r.data.quiz.length).toBeGreaterThan(0);
    // every {{fact}} the prose quotes is set by the lesson's own script
    const js = readFileSync(join(ARTIFACTS, l, "lesson.js"), "utf8");
    const text = JSON.stringify(r);
    for (const [, name] of text.matchAll(/\{\{(\w+)\}\}/g)) expect(js, `FACTS.${name}`).toMatch(new RegExp(`\\b${name}:`));
  });

  it("builds the page frame: hero copy, contents rail from the sections, banners", () => {
    const r = page("## The long title {#trap toc=\"Short\" banner}\n\nText with `code`, **bold** and *em*.\n\n## Plain {#next}\n\nMore.\n");
    expect(r.html).toContain('<div class="kick">K</div>');
    expect(r.html).toContain('<h1 id="h1">H</h1>');
    expect(r.html).toContain('<div class="chips"><span>time <b>O(n)</b></span></div>');
    expect(r.html).toContain('<a href="#trap">Short</a><a href="#next">Plain</a>');
    expect(r.html).toContain('<section class="sec" id="trap"><h2>The long title</h2><div class="banner" data-b="trap"></div>');
    expect(r.html).toContain('<section class="sec" id="next"><h2>Plain</h2>\n');
    expect(r.html).toContain("<p>Text with <code>code</code>, <b>bold</b> and <em>em</em>.</p>");
  });

  it("renders each fence the way the kit styles it", () => {
    const r = page(`## S {#s}

\`\`\`examples
s = "ab" → 2  ("ab")
\`\`\`

\`\`\`constraint
1 ≤ n.
\`\`\`

\`\`\`rosetta "Read it"
In the code | In the system
\`x\` | a *thing*
a case | the \`next\` it lacks
\`\`\`

\`\`\`widget #w "Try **it**"
<div class="tv"></div>
\`\`\`

\`\`\`mount #m chart
\`\`\`

\`\`\`code solution "The fix"
\`\`\`

\`\`\`notes
Why.
\`\`\`

\`\`\`derivation
**Time O(n).** Counted {{n}}.
\`\`\`

\`\`\`duo
Text.
---
<div id="scene"></div>
\`\`\`
`);
    expect(r.html).toContain('<div class="ex"><div><span>s = "ab"</span><em>→ 2 ("ab")</em></div></div>');
    expect(r.html).toContain('<div class="callout constraint"><div class="cl"><svg class="i"><use href="#i-warn"/></svg>Constraint</div><p>1 ≤ n.</p></div>');
    expect(r.html).toContain('<div class="rosetta" aria-label="Read it"><div class="ro-h"><span>In the code</span><span>In the system</span></div><div class="ro"><code>x</code><span>a <em>thing</em></span></div><div class="ro"><b class="ro-k">a case</b><span>the <code>next</code> it lacks</span></div></div>');
    expect(r.html).toContain('<div class="widget navy" id="w"><div class="wl">Try <b>it</b></div><div class="tv"></div></div>');
    expect(r.html).toContain('<div class="chart" id="m"></div>');
    expect(r.html).toContain('<div data-code-file="solution" data-title="The fix"></div>');
    expect(r.html).toContain('<div class="notes"><p>Why.</p></div>');
    expect(r.html).toContain('<div class="complexity"><div class="cx-h">Complexity, derived</div><p><b>Time O(n).</b> Counted {{n}}.</p></div>');
    expect(r.html).toContain('<div class="duo"><div class="duo-text"><p>Text.</p></div><div class="duo-scene"><div id="scene"></div></div></div>');
  });

  it("keeps a reveal out of the page: its text is data, inserted only on click", () => {
    const r = page('## S {#s}\n\n````reveal #sol "Show it"\nThe **answer**.\n\n```code solution "Code"\n```\n````\n');
    expect(r.html).toContain('<div id="sol"></div>');
    expect(r.html).not.toContain("answer");
    expect(r.data.reveals.sol).toEqual({ label: "Show it", html: '<p>The <b>answer</b>.</p>\n<div data-code-file="solution" data-title="Code"></div>' });
  });

  it("reads the quiz and variants in the course's own format", () => {
    const r = page(`## S {#s}\n\n${QUIZ({ ...Q, question: "Why `x`?" })}\n\n\`\`\`variants\n[{"title":"T","source":"LeetCode 1","text":"Uses \`y\`."}]\n\`\`\`\n`);
    expect(r.html).toContain('<div id="qlist"></div>');
    expect(r.html).toContain('<div class="vgrid" id="vlist"></div>');
    expect(r.data.quiz).toEqual([{ q: "Why <code>x</code>?", opts: ["a", "b", "c"], a: 1, why: "Because." }]);
    expect(r.data.variants).toEqual([{ title: "T", source: "LeetCode 1", text: "Uses <code>y</code>." }]);
  });

  it("leaves > raw in text, as the hand-written pages did (the quiz slot hashes the markup)", () => {
    expect(page("## S {#s}\n\n`a >= b` and a < b.\n").html).toContain("<p><code>a >= b</code> and a &lt; b.</p>");
  });

  it("marks ==key terms== in the family's ink, in prose and table cells alike", () => {
    const r = page("## S {#s}\n\nHold a ==window== and a **==set==**.\n");
    expect(r.html).toContain('<p>Hold a <span class="term">window</span> and a <b><span class="term">set</span></b>.</p>');
    expect(page("## S {#s}\n\nStop when built == n.\n").html).toContain("<p>Stop when built == n.</p>");
  });

  it("draws a section's vignette beside its heading, named for a screen reader", () => {
    const r = page('## S {#s banner}\n\n```vig "Tiles in a row"\n<rect class="fa" x="1" y="2" width="3" height="4" rx="1"/><path class="sc" d="M0 0H9"/>\n```\n\nText.\n');
    expect(r.html).toContain('<section class="sec" id="s"><h2>S</h2><svg class="vig" viewBox="0 0 240 112" role="img" aria-label="Illustration: Tiles in a row"><rect class="fa" x="1" y="2" width="3" height="4" rx="1"/><path class="sc" d="M0 0H9"/></svg><div class="banner" data-b="s"></div>');
  });

  it("the split-layout lesson draws a vignette for every section (#63)", () => {
    const r = renderLesson(readFileSync(join(ARTIFACTS, "longest-substring-without-repeating", "lesson.md"), "utf8"));
    const secs = [...r.html.matchAll(/<section class="sec" id="(\w+)"><h2>.*?<\/h2>(<svg class="vig")?/g)];
    expect(secs.length).toBeGreaterThan(5);
    for (const [, id, vig] of secs) expect(vig, `#${id}`).toBeTruthy();
  });

  describe("rejects what the rules forbid", () => {
    const cases: [string, string, RegExp][] = [
      ["two adjacent callouts", "```key\nA.\n```\n\n```warn\nB.\n```", /adjacent/],
      ["a callout kind with no artifact styling", "```brain\nA.\n```", /no artifact styling/],
      ["a quiz with two options", QUIZ({ ...Q, options: ["a", "b"] }), /3-5 options/],
      ["a quiz answer out of range", QUIZ({ ...Q, answer: 3 }), /not an option/],
      ["a quiz with no explanation", QUIZ({ ...Q, explanation: " " }), /explanation/],
      ["half a language pair", '<span class="c-py">`a`</span> only.', /half written/],
      ["a duplicate id", "```mount #x\n```\n\n```mount #x\n```", /duplicate id #x/],
      ["an unknown fence", "```sparkle\n```", /unknown fence/],
      ["raw HTML outside an html fence", "<div>raw</div>", /raw HTML block/],
      ["a reveal with no button label", "```reveal #r\nA.\n```", /button label/],
      ["an examples line without →", "```examples\nno arrow\n```", /no →/],
      ["an unclosed key term", "A ==window without its end.", /==term==/],
      ["a vignette with no description", '```vig\n<rect class="fa"/>\n```', /quoted description/],
      ["a vignette below the section's prose", 'Text.\n\n```vig "x"\n<rect class="fa"/>\n```', /straight after the heading/],
      ["a vignette coloured by attribute", '```vig "x"\n<rect fill="#f00"/>\n```', /colour goes through a class/],
      ["a vignette class the kit does not paint", '```vig "x"\n<rect class="hot"/>\n```', /not a vignette class/],
      ["text drawn inside a vignette", '```vig "x"\n<text>hi</text>\n```', /not a drawing element/],
      ["loose words in a vignette", '```vig "x"\nhello <rect class="fa"/>\n```', /outside drawing elements/],
    ];
    it.each(cases)("%s", (_, body, err) => {
      expect(() => page("## S {#s}\n\n" + body + "\n")).toThrow(err);
    });

    it("a section heading without an id", () => {
      expect(() => page("## Untagged\n\nText.\n")).toThrow(/needs \{#id\}/);
    });

    it("content before the first section", () => {
      expect(() => page("Loose text.\n\n## S {#s}\n")).toThrow(/before the first/);
    });
  });
});
