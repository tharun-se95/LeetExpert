# Media Assets Tracker — Generation → Download → Landed

Tracks the **retrieval** pipeline for Phase 2 media (Infographic, Cinematic
Video, Audio Overview): once NotebookLM has generated an asset, it exists
only inside that module's notebook until a human downloads it, and only
lands in the product after it's compressed and placed under
`web/public/media/<module>/`. Generation status (what NotebookLM has
produced) is tracked in `2026-08-23-course-analogy-tracker.md` — this file
tracks the three retrieval stages for each generated asset:

1. **Generated** — exists in the notebook's Studio panel (source of truth:
   the other tracker's Phase 2 section and session-result tables).
2. **Downloaded** — a human has pulled the file out of NotebookLM (via the
   Studio panel's download button, or the asset's direct
   `https://lh3.googleusercontent.com/notebooklm/...` URL) into a local
   folder, in their own authenticated browser — Claude cannot do this step
   (see the retrieval-blocker note in the other tracker's Task A/Phase 2
   sections: `curl`, in-page `fetch`, and `<canvas>` export are all blocked
   in the sandboxed browser).
3. **Landed** — the downloaded file has been compressed as needed and
   committed under `web/public/media/<module>/`, wired into the lesson via
   `ChapterInfographic` (or the video/audio equivalents once those
   components exist).

Delete this file once every module's row is fully landed across all three
asset types, or fold it back into the main tracker at that point.

## Status by module

Counts are `generated / downloaded / landed` out of the module's total
concept-lesson count for that asset type. A dash (`—`) means no notebook
generation has been attempted yet for that asset type in that module.

| Module | Lessons | Infographic | Video (Cinematic) | Audio Overview |
| --- | :-: | :-: | :-: | :-: |
| hash-tables | 6 | 6/6/6 | 6/6/6 | 6/6/6 |
| graphs | 6 | 6/0/0 | 2/0/0 | 6/0/0 |
| intervals | 1 | 1/0/0 | —/0/0 | 1/0/0 |
| tries | 1 | 1/0/0 | —/0/0 | 1/0/0 |
| heaps | 2 | 2/0/0 | —/0/0 | 2/0/0 |
| bst | 2 | 2/0/0 | —/0/0 | 2/0/0 |
| binary-trees | 4 | 4/0/0 | —/0/0 | 4/0/0 |
| recursion-backtracking | 3 | 3/0/0 | —/0/0 | 3/0/0 |
| sorting | 4 | 4/0/0 | —/0/0 | 4/0/0 |
| binary-search | 3 | 2/0/0 | —/0/0 | 1/0/0 |
| sliding-window | 2 | —/0/0 | —/0/0 | —/0/0 |
| two-pointers | 2 | —/0/0 | —/0/0 | —/0/0 |
| queues | 3 | —/0/0 | —/0/0 | —/0/0 |
| stacks | 3 | —/0/0 | —/0/0 | —/0/0 |
| linked-lists | 3 | —/0/0 | —/0/0 | —/0/0 |
| arrays | 4 | —/0/0 | —/0/0 | —/0/0 |
| strings | 3 | —/0/0 | —/0/0 | —/0/0 |
| math-for-dsa | 6 | —/0/0 | —/0/0 | —/0/0 |
| big-o | 9 | —/0/0 | —/0/0 | —/0/0 |
| getting-started | 4 | —/0/0 | —/0/0 | —/0/0 |
| greedy | 1 | —/0/0 | —/0/0 | —/0/0 |
| prefix-sum | 3 | —/0/0 | —/0/0 | —/0/0 |
| matrix | 3 | —/0/0 | —/0/0 | —/0/0 |
| dynamic-programming | 5 | —/0/0 | —/0/0 | —/0/0 |

**hash-tables** is the only module fully landed end-to-end (Task A,
shipped 2026-08-24) — reference module for what "landed" looks like:
`web/public/media/hash-tables/` holds the compressed infographic/video/
audio files, wired into each lesson via `ChapterInfographic` (or the
matching component for video/audio once built).

**graphs, intervals, tries, heaps, bst, binary-trees,
recursion-backtracking, sorting, binary-search** all have Infographic
and/or Audio generated in Session 1 (2026-08-26, see the other tracker's
Phase 2 section for exact per-lesson breakdown) but **zero downloads
performed** — nothing has moved out of NotebookLM yet. Video is further
behind: only graphs has any Cinematic videos generated (2/6), everything
else has none.

**sliding-window through dynamic-programming** (bottom 14 rows) have no
Phase 2 generation started at all — notebooks exist for all of them
(the last 4 were created fresh in the same session that hit all three
daily quotas), but no Infographic/Video/Audio requests have been issued.

## Notebook naming (2026-08-31)

All 24 NotebookLM notebooks now carry the `NN · Module Title` name
(matching `web/src/lib/course/manifest.ts` exactly) instead of their
NotebookLM-auto-generated titles — makes the notebook grid sort and scan
in course order during retrieval passes. See the renaming note in
`2026-08-23-course-analogy-tracker.md` for the full list and the
save-method gotcha (inline title edit needs a blur-click, not Return, to
actually persist).

## Next retrieval session

Recommend batching by module, in tracker order, starting with **graphs**
(most assets generated: 6 infographic + 2 video + 6 audio) since it has
the most to gain per session. For each module: open its notebook (now
named `NN · Module Title`), download every ready asset from the Studio
panel, compress, land under `web/public/media/<module>/`, then flip that
module's counts in the table above and check the lesson renders correctly
in the browser before moving to the next module.
