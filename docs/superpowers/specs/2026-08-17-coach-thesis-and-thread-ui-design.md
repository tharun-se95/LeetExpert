# Coach thesis + thread UI

**Date:** 2026-08-17  
**Status:** approved for planning  
**Amends:** `docs/superpowers/specs/2026-08-16-problem-coach-design.md`  
**Surfaces:** Problem Coach rail / mobile Coach tab  
**Trigger:** Live Gemma thread on Find the Index after all cases passed

---

## Problem

The leak wall held. The coach still taught the wrong next move.

After a pass on Find the Index, the learner asked what pattern it was and
how to implement it “better.” The model named naive search correctly, then
sold KMP. This lesson’s actual content is: write naive cleanly, price the
worst case, and see that **at n, m ≤ 10⁴ naive is the intended answer**.
The quiz calls reaching for KMP here complexity theater.

Two product gaps caused that:

1. **The lesson thesis never reaches the model.** The corpus is statement +
   hints. The insight blockquote (“the correct move at these constraints”)
   and the “do not assign a faster algorithm” rule are absent. After
   `all-passed`, the local diagnosis CTA said “ask about complexity or a
   **variant**,” which primed the KMP path. A short “no” was treated as
   “keep teaching,” not as ambiguous.
2. **The thread cannot show what the model already writes.** `CoachThread`
   renders assistant text as a raw `<p>`. `**bold**` and `$N$` show as
   markup. Suggestion chips disappear after the first send, so the empty
   state is the only guided moment.

This is not a new coach. It is the same Socratic coach, given the thesis
it was missing, and a thread that can display a nudge.

---

## Non-goals

- Accounts, streaming token UI, KaTeX, pair-programmer / insert-into-editor.
- Reusing `components/md/Markdown.tsx` (Mermaid, Quiz, Reveal, Viz — 191
  lessons must not pay for a rail five problems need).
- Putting the Solution tab, quiz answers, or `web/tests/reference/**` in
  the corpus.
- Authoring missing `## The insight` headings on every problem in this
  work. Extraction has a fallback; empty thesis is allowed.
- Changing the Python boot/run timeout split (already shipped).

---

## Approaches considered

**Thesis into the model**

|            | How                                                                                      | Trade-off                           |
| ---------- | ---------------------------------------------------------------------------------------- | ----------------------------------- |
| A (chosen) | New `thesis` field: `## The insight` slice, else first explanation blockquote, else `""` | Per-problem, still no Solution      |
| B          | Ship the whole Explanation tab                                                           | Viz JSON, extra prose, leak surface |
| C          | Generic “stay on constraints” prompt only                                                | Find the Index keeps regressing     |

**Thread rendering**

|            | How                                                                         | Trade-off                                  |
| ---------- | --------------------------------------------------------------------------- | ------------------------------------------ |
| A (chosen) | Slim `CoachMarkdown`: GFM inline + lists; no fences, headings-as-paragraphs | Small client surface on problem pages only |
| B          | Full lesson `Markdown`                                                      | Violates the performance budget            |
| C          | `whitespace-pre-wrap` only                                                  | `**bold**` stays broken                    |

**Ambiguous “no”**

Prompt rule only. Do not special-case the composer. The model asks which
meaning they meant before teaching further.

---

## Design

### 1. Lesson thesis in the server corpus

`CoachProblem` gains `thesis: string`.

`extractThesis(explanation)` (same remark stack as `extractHints`):

1. If a heading whose text is `/^the insight$/i` exists, take the markdown
   of the nodes after it until the next heading or any `code` node (`viz`,
   `reveal`, `complexity`, …).
2. Else take the first `blockquote` in the explanation, by source offsets.
3. Else `""`.

`buildCorpus` writes `thesis`. Client still receives **hint labels only**.
Thesis stays server-side, like hint bodies.

Leak wall additions:

- Thesis must not contain `## Solution` or a `def` / `function` of the
  sandbox `fn` names.
- `find-the-index` thesis must contain `correct move at these constraints`
  (the live regression).

Empty thesis is valid (e.g. Reverse Linked List has hints and no insight
heading). The prompt then falls back to “Attempt it first” + constraints,
which are already in `statement`.

### 2. Prompt and local diagnosis

`buildSystemPrompt` keeps the existing never-implement / never-fence rules
and adds:

- Plain-text math only (`O(n*m)`, `n` and `m`). No LaTeX.
- Short or ambiguous replies (`yes`, `no`, `idk`, `ok`) → ask which
  meaning before teaching further.
- After they pass, stay on this lesson’s thesis. Do not assign a faster or
  different algorithm unless they clearly insist. Naming one as later
  reading is allowed; walking them through it is not.
- Do not dump authored hint bodies verbatim unless they already opened
  that hint.

`buildModelMessages` includes a `Lesson thesis` block.

All-passed diagnosis prose becomes:

> All N cases passed. Ask about this lesson’s bound or what to take from
> it — I still will not write the code.

It must not say `variant`.

`filterCoachReply` rejects **any** triple-backtick fence, not only
`python` / `javascript` / `typescript` / `ts`. That keeps `CoachMarkdown`
from growing a code-block path and tightens the leak wall.

### 3. Thread UI

**CoachMarkdown** (problem-page client only): `react-markdown` +
`remark-gfm`. Allowed: `p`, `strong`, `em`, `ul`, `ol`, `li`, inline
`code`. Headings render as `p`. `pre` / `img` drop. `a` only if
`http(s):`; otherwise the children render as text. Tokens only — no
`prose` class (typography plugin greys). User bubbles stay plain text.

**Suggestions** stay after the first message, driven by last diagnosis:

| State                           | Chips                                                                                    |
| ------------------------------- | ---------------------------------------------------------------------------------------- |
| No chat yet                     | existing three (“What pattern…”, fail, next hint)                                        |
| Last diagnosis `all-passed`     | worst-case cost; faster algorithm required at these constraints?; what to take from this |
| Last diagnosis failed / errored | why that case failed; next hint without spoiling                                         |

**Pending** is an assistant-shaped bubble (“Thinking…”) with
`aria-live="polite"` and no motion when `prefers-reduced-motion`.

Composer label stays “Ask a question — I will not write the code.” The
visible “Ask the coach” string is the `sr-only` label only; do not add a
second visible heading that reads as a model line.

Diagnosis cards stay templated prose (not markdown).

---

## Testing

- `extractThesis` on Find the Index, Reverse Linked List (empty), and a
  fixture that ignores Solution / viz.
- Corpus: 116 ids, `thesis` present, no Solution / fn-def leak, generated
  JSON matches `buildCorpus()`, Find the Index pin.
- Prompt contract includes thesis + new rules; still no `solution` field.
- Diagnose all-passed copy; filter rejects a bare ` ``` ` fence.
- `coachSuggestions` table for the three states.
- `tsc`, eslint, `vitest` for the touched files. Browser: Find the Index
  after pass — bold/lists render, `$N$` does not appear, chips match
  all-passed, a “no” gets a clarifying question, KMP is not assigned.

---

## Out of scope (unchanged)

Accounts, concept-lesson tutor, card-variant sandbox coach, live
execution tracing, third-party analytics.
