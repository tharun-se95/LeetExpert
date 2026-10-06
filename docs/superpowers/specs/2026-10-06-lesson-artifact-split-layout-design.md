# Lesson artifacts: split layout, section vignettes, captions and key terms

Issue: #63. Replaces PR #65, which was built on the kit before #22, #25 and #26 rebuilt it and no
longer merges. This is the same design redone on the current kit, extended from 5 lessons to all 12.

## 1. Why

On a lesson page the section list took a 200px column of its own, and every visual (banner, examples,
rosetta, players) broke the prose at full width beside an empty strip about 360px wide. The owner asked
(2026-09-28) for the page to read as The Grid Underneath does: story on the left, its visual on the
right, without breaking the reading order.

## 2. Decisions already taken by the owner

All recorded as comments on #63, 2026-09-28. They are inputs here, not open questions.

| Decision | Detail |
| --- | --- |
| Split layout | Prose in the left column; each visual sits beside the prose that introduces it. Reading order is unchanged: text, then what it points at. One column below 1100px. |
| Icon rail | The section list leaves the page grid and becomes an icon rail in the left margin. It fades in once the hero scrolls away, expands on hover or focus, and shows from 1300px. |
| No blank columns | Prose flows as one unbroken column and each scene hangs beside its own paragraph, so a short paragraph beside a tall scene leaves no gap. |
| A vignette per section | Every section carries a small spot drawing on its heading row, drawn for that section. |
| Key terms in colour | The term a paragraph turns on is set in the family's ink, through tokens, AA in both themes. |
| Banners removed | The animated banners are gone. A banner's one good line, where it had one, becomes a text caption under the heading. |

Why the banners went, as measured on the trial lesson: they took 1,115 of 6,540px at 1366; their text
was drawn in a scaled SVG, about 6px on a phone; they were hidden from screen readers and played once;
and most repeated a widget beside them.

## 3. Still open (owner)

Where the vignette sits on the heading row. This build keeps #65's placement: the heading and caption
on the left, the vignette on the right of the same row, bottom-aligned, 220px wide, hidden below
760px. Moving it later is a change to `.sec-head` in `kit.css` and touches no lesson.

## 4. How it is built

- **`build.py` `split_section`** regroups one section's top-level elements into beats at build time.
  `_kind` sorts each element: `vis` (examples, widgets, rosetta, code, the solution box) is drawn
  beside prose; `full` (caption, vignette, an authored `duo`, a card grid, the quiz) spans both
  columns; anything else is `text`. A visual joins the text run before it. Visuals that open a section
  join the first run and are marked `.lead`, so a stacked page still shows them first. A visual with no
  prose around it spans the page.
- **`decorate(body, split)`** applies it to every lesson and the kit specimen. The two overviews keep
  their own story-and-visual grid, the design the split was taken from.
- **`kit.js` `lay()`** places each scene beside its own paragraph on a wide page; `kit.css` holds the
  split grid, the icon rail and the stacked order.
- **`lessonMd.ts`**:
  - `caption` fence: one sentence, rendered as `p.sec-sub` under the heading.
  - `vig "description"` fence: checked markup. Drawing elements only, a fixed attribute list, and
    colour only through the kit's `.vig` classes (`st sc fa fk fc fr fg fp`), because an SVG
    presentation attribute is not CSS and would survive a theme change. The description becomes the
    drawing's `aria-label`.
  - Both go straight after the heading, at most one of each per section.
  - `==term==` becomes `span.term`. A spaced `a == b` is left alone; an unclosed `==word` fails the
    build.
  - A `banner` flag on a heading fails the build and says where its line should go.
- **`shared.py` `text_ink`** derives `--fam-ink`: the family colour mixed toward the ink until it
  clears 4.5:1 on every surface prose sits on, per family and theme. The dark theme uses the Grid's
  text accent, which is already held to AA.

## 5. Content rules

- A caption is the sentence the section concludes. It is optional: a section whose prose already ends
  in a Key idea or Watch out saying the same thing gets none (CLAUDE.md §3, no callout restating its
  neighbour).
- A vignette shows the section's own idea, never a generic decoration, and carries no text.
- Key terms are few: the words a lesson defines, marked where they are defined.

## 6. Scope

All 12 lesson artifacts and the kit specimen:

- 5 lessons carry #65's vignettes and captions, ported: coin-change, course-schedule,
  diameter-of-binary-tree, longest-substring-without-repeating, build-a-linked-list.
- 7 Linked Lists lessons from #26 get them new: nodes-and-pointers, pointer-surgery,
  reverse-linked-list, middle-of-list, linked-list-cycle, merge-two-sorted, remove-nth-from-end.
  48 vignettes, 18 captions.
- Banner code is deleted from every `lesson.js`, with `chainArt` in `kit/lists.js` and the `.bn-*`
  styles, which nothing else used.

## 7. Verification

- `lessonArtifactsData.test.ts`: every rejection the dialect makes (unclosed term, banner flag,
  misplaced or doubled caption, vignette with no description, a colour attribute, an unknown class,
  text inside a drawing).
- `lessonArtifactsKit.test.ts`: `split_section` on planted cases.
- Every gated page passes build, code, light and dark gates at 1366px and 375px, and the ledger is
  re-recorded, since the kit change stales every row.
- The pages are looked at in a browser in both themes at both widths before the PR is marked ready.
