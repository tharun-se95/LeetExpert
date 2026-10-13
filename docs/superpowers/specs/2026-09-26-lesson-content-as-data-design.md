# Lesson artifacts: content as data

Issue #21 (rollout spec `2026-09-24-lesson-artifacts-rollout-design.md` §5.1). Status: accepted.
Owner decision 2026-09-27 (on #21): `lesson.md` is written in **the course dialect**, the one the
220 course lessons use, and parsed by the app's own `gray-matter` + `remark`. A first draft
(2026-09-26) proposed TOML front matter and `:::` blocks with a Python parser; it was declined
because it made a second dialect and a second parser beside the course's, and because under D1 an
artifact may later replace its markdown lesson, which should then be a file move, not a conversion.

## 1. Problem

A lesson page today is `body.html` (hand-written markup: hero, sections, callouts, "rosetta"
tables, widget mounts, dual-language spans) plus `lesson.js`, which holds the topic animation
**and** the quiz, variants, hint and solution prose, built as HTML strings. At 220 lessons that
fails three ways:

- The kit's content rules (callout kinds, one job each, never adjacent; quiz distractors of
  similar length; code in both languages) hold only where `kit.js` happens to render the part.
  Hand-written markup bypasses them.
- Authoring is markup, not prose. A missing `c-py`/`c-ts` half or an unclosed `<div>` is silent.
- Nothing can be checked without a browser: a lesson's sections, callouts and quiz are not data.

## 2. Format

One file per lesson, `lesson.md`, beside `lesson.js`, `extra.css` and `code/`. Parsed by
`lesson-artifacts/lessonMd.ts` (gray-matter for the front matter, `remark-parse` + `remark-gfm` for
the body, the versions the app ships), which `build.py` runs through `tsx`, as it runs
`highlight.ts`. It returns the page body's HTML and the lesson's data as JSON.

**Front matter** (YAML, as in `courses/dsa/**/*.md`):

| key | what it is |
|---|---|
| `title` | the lesson's title, as in the course file (the document `<title>`) |
| `kicker`, `headline`, `lede` | the hero's copy; inline markdown |
| `chips` | list of short facts under the lede; inline markdown |
| `hero` | the topic's hero stage, raw markup (a block scalar): it is drawn by `lesson.js`, so it is a mount with structure, not prose |

The quiz and the variants are fences in the body, not front matter, so they sit where they render
(as the course's ` ```quiz ` does).

**Body.** Markdown paragraphs with inline `` `code` ``, `**bold**` (rendered `<b>`, as the kit
styles it), `*em*` and links. Inline HTML passes through, which is how a dual-language pair is
written (`<span class="c-py">…</span><span class="c-ts">…</span>`); the build rejects a half pair.

- `## Heading {#id toc="Short label"}` opens a section. `toc` defaults to the heading text. The
  contents rail is generated from the sections, so it cannot miss one. The `banner` flag was
  removed in #63 (`2026-10-06-lesson-artifact-split-layout-design.md`): a section now takes an
  optional `caption` fence and a `vig` fence straight after its heading.

**Fences.** The course's own fences keep their course meaning and syntax:

- `examples`: one `input → output  (note)` per line, as in the course.
- `constraint`, `key`, `warn`: callouts; the body is markdown. The course's `brain`, `tip`, `goal`
  and `aside` have no artifact styling yet, so the build refuses them rather than render them
  unstyled; each gets its look when a lesson first needs it.
- `quiz`: the course's JSON, `{"questions": [{question, options, answer, explanation}]}`.

New fences, for what a course lesson does not have. The info string carries the attributes:

- `rosetta "aria label"`: first line is the two column headings, `left | right`; each further
  line is one row, `` `code` | reading ``.
- `widget #id [classes] "Label"`: a navy instrument card with its label; the body is its inner
  markup (readouts, buttons), which `lesson.js` wires.
- `mount #id [classes]`: an element `lesson.js` fills (a chart, a code block, the quiz host);
  an optional body is its inner markup.
- `duo`: text beside a scene; markdown, then a line `---`, then the scene's markup.
- `reveal #id "Button label"`: hidden content. It is **data, not DOM** (CLAUDE.md §3, never leak
  solutions): the build stores its HTML in the lesson's data, and the kit inserts it only on
  click. The body is markdown and may hold fences, so the reveal fence is written with four
  backticks. `lesson.js` may register a hook for the id, to add what must be computed (a code
  block, a scene).
- `code <file> "title"`: a code block for `code/<file>.py` + `.ts`, placed by the kit.
- `notes`: prose grouped under a code block, as the solution reveals have it.
- `derivation`: the "Complexity, derived" box; markdown body.
- `variants`: JSON, `[{title, source, text}]`.
- `html`: markup passed through untouched, for a topic-specific piece no fence covers. Its uses
  are counted per lesson in the build output, so it cannot quietly become the default.

**Computed numbers.** A number the page shows is computed, never typed (CLAUDE.md, landing rule
applied here too). Prose writes `{{name}}`; `lesson.js` sets `FACTS.name` from the algorithm it
already runs, and the kit fills the text when it renders it. A placeholder with no fact throws,
so the browser gate fails on it.

**Rules enforced at build**, so they hold for every lesson: callouts never adjacent; every quiz
question has 3-5 options, one answer in range and an explanation; every `c-py` has its `c-ts`;
section ids are unique; every `{{name}}` sits in text the kit renders; `html` fences are counted.

## 3. What stays in `lesson.js`

The topic animation and its self-checks (scenes run the algorithm and throw on disagreement),
`FACTS`, and the wiring of widgets, mounts and reveal hooks. Quiz, variants, hint and solution
prose leave it.

## 4. Migration, proved lossless

Each of the five verified lessons moves in turn:

1. Write `lesson.md` from `body.html` and the prose and data in `lesson.js`.
2. **Proof:** `lesson-artifacts/dom-compare.mjs` builds the page from the old sources and from the
   new, opens both in Chromium with reduced motion (every animation at its finished frame), runs
   each reveal, and compares the resulting DOM after normalising whitespace. Zero differences, or
   each listed and justified in the PR. This covers the markup and the moved data together,
   because both end up in the same DOM.
3. Delete `body.html` and the moved prose and data, rebuild, and record all four gates: the
   lesson must be verified again on the new evidence.

`tests/lessonArtifactsData.test.ts` holds the §2 rules for every lesson with a `lesson.md`, and
renders each fence kind against a fixture. The DOM comparison is the migration's proof, not a
standing test: once `body.html` is deleted there is nothing old to compare with.

## 5. Out of scope

- The overview's data is already rendered from `lesson.js` records; it moves to `lesson.md` only
  if its sections fit the dialect without `html` for most of the page.
- New players (#22) and CI gates (#23) build on this but are separate issues.
