# Course-Wide Media & Content Rollout — Spec

**Status:** Hash Tables (pilot module) content-reviewed complete; UI shell for
all media types shipped and verified. This spec is the reference for rolling
the full package — analogy prose + audio + video + infographic + mind map —
out to the remaining 23 modules.

**Relationship to existing docs:** `docs/superpowers/plans/2026-08-23-course-analogy-rewrite.md`
already specifies the analogy-prose rewrite procedure (Task 3, Steps 1–8) and
the style guide it depends on
(`docs/superpowers/specs/2026-08-23-analogy-style-guide.md`). This spec does
**not** duplicate that procedure — it wraps it with everything the prose
rewrite doesn't cover: the structural review pass, the four media types, the
per-module asset pipeline, and dynamic (per-module) prompt templates. Treat
"run the Task 3 procedure" below as a reference to that existing document.

---

## 1. Hash Tables in-depth review — findings

Performed 2026-08-24: read all 4 concept lessons (`hashing-fundamentals.md`,
`collision-resolution.md`, `build-a-hash-map.md`, `hash-patterns.md`) plus
`practice.md` in full, cross-checked every `diagram`/`viz` fence's JSON props
against the surrounding prose's claims, cross-checked the concept map
(`web/src/lib/course/conceptMaps/hashTables.ts`) against final lesson content
leaf-by-leaf, and cross-checked `practice.md`'s five problems against the
"four verbs" table in `hash-patterns.md`.

**Result: content is consistent and complete.**
- `hash-pipeline` diagram (`hashValue: 4182, capacity: 8`) → 4182 mod 8 = 6;
  prose says Slot 6. Correct.
- `bucket-layout` diagrams in both `collision-resolution.md` (dog/god at
  Slot 2) and `build-a-hash-map.md` (alice/bob/bea/cara) match their prose
  exactly.
- Concept map's 5 branches / 27 leaves each map to an actual claim in the
  4 lessons — no orphaned leaf, no uncovered lesson claim.
- All 5 practice problems map onto the four verbs (Seen/Count/Index/Group)
  the module teaches; no verb is left unpracticed, no problem is orphaned
  from a verb.
- Quiz distractors across all 4 lessons (13 questions total) are specific
  and plausible, each with a reasoning `explanation` — no asserted answer
  without a derivation, per CLAUDE.md §3.

**One structural gap found: video coverage is incomplete.** Only
`collision-resolution.md` has a video (`video-collision-resolution.mp4`);
`hashing-fundamentals.md`, `build-a-hash-map.md`, and `hash-patterns.md` have
none. Audio and infographic are present for all 4. This isn't a prose defect
— `WatchLessonLink` degrades gracefully (link doesn't render without a
`videoSrc`) — but it means 3 of 4 lessons are missing one of the module's
four asset types. **Action:** generate the missing 3 videos before treating
hash-tables as the fully-realized reference module (see §4, Task A).

**NotebookLM re-verification not run this pass.** The live Mind-Map/Quiz
coverage checks (Task 3 Steps 6.7–6.8 of the analogy-rewrite plan) require an
authenticated `notebooklm.google.com` session; this session's browser
context isn't signed in. The manual audit above substitutes for it and found
no gaps, but if a fresh NotebookLM pass is wanted before moving on, it needs
the user to sign in first (same as the original pilot — see that plan's
Task 3 Step 1).

---

## 2. Per-module structural review checklist

Run this against every module **before** starting its Task 3 procedure (the
prose rewrite), and again after, as a cheap correctness gate. This is what
was done for hash-tables in §1 above, generalized:

1. **Diagram/viz reconciliation.** For every `diagram`/`viz` fence with
   numeric or named props (hash values, array contents, specific keys),
   compute what it actually renders and confirm the surrounding prose's
   claims (slot numbers, comparison results, ordering) match. This is
   already Step 6.5 of the Task 3 procedure — do not skip it.
2. **Concept map completeness.** Once a module's concept map
   (`web/src/lib/course/conceptMaps/<module>.ts`) exists, walk every leaf
   and confirm it corresponds to an actual sentence/claim in the rewritten
   lessons, and walk every rewritten lesson's major claims and confirm each
   has a home in the map. Flag orphans either direction.
3. **Practice-problem-to-pattern mapping.** If the module has a
   `practice.md` with a "how to practice" framing (most do), confirm every
   named pattern/verb in that framing is actually exercised by at least one
   listed problem, and every listed problem's `pattern`/`watch_for` matches
   a concept the lessons actually teach.
4. **Quiz quality spot-check.** Distractors should be specific and
   plausible (not "obviously wrong" filler) and every question needs an
   `explanation` that derives the answer, not just asserts it — CLAUDE.md
   §3's rule, checked by eye since it's not mechanically testable.
5. **Asset completeness.** Confirm all 4 asset types exist for every
   concept lesson in the module: audio (`audio-<slug>.m4a`), infographic
   (`infographic-<slug>.webp`), video (`video-<slug>.mp4`), and — once per
   module, not per lesson — the concept map. Missing assets are a gap to
   close, not a silent omission (CLAUDE.md §1).

Where this checklist finds a defect, fix it before moving to the next
module — same "no shortcuts" discipline as the rest of this project.

---

## 3. Asset pipeline (per lesson / per module)

Established during the hash-tables pilot; codified here so it's repeatable
without re-deriving it each time.

### 3.1 Source of truth and file layout

- **Raw NotebookLM exports** (large, unoptimized) go in a **local-only**
  `media-source/<module>/` directory — gitignored except for its own
  `README.md` (see the `.gitignore` negation pattern already in place:
  `media-source/*` + `!media-source/README.md`). Never commit raw exports.
- **Optimized, shipped assets** go in `web/public/media/<module>/`, tracked
  in git, named by convention:
  - `audio-<lesson-slug>.m4a`
  - `video-<lesson-slug>.mp4`
  - `infographic-<lesson-slug>.webp`
  - (concept map is not a media file — it's hand-transcribed data at
    `web/src/lib/course/conceptMaps/<module>.ts`, see §3.5)
- `web/src/lib/course/media.ts`'s `getChapterMedia(moduleSlug, lessonSlug)`
  resolves all three per-lesson paths via `existsSync`, returning `undefined`
  for anything not present — every consuming component already degrades
  gracefully on a missing asset, so partial coverage never breaks a build.

### 3.2 Compression settings (reuse verbatim)

- **Audio:** mono, 64kbps AAC (`ffmpeg -i in.wav -ac 1 -b:a 64k out.m4a`).
- **Video:** H.264, CRF 28, capped at 960p
  (`ffmpeg -i in.mp4 -vf scale=-2:960 -c:v libx264 -crf 28 -c:a aac -b:a 96k out.mp4`).
- **Infographic:** WebP quality 82–85 (`cwebp -q 84 in.png -o out.webp`).

### 3.3 Generating each asset in NotebookLM

Per module, one notebook (reused from the Task 3 prose-rewrite pass — don't
create a second notebook for assets, the sources are already loaded):

- **Audio Overview** (Studio panel → Audio Overview): scope per lesson, not
  per module — a chapter-level audio walkthrough plays alongside that one
  lesson's header. Takes several minutes to generate; queue it and let it
  run while doing the prose rewrite work.
- **Video Overview** (Studio panel → Video Overview): also scoped per
  lesson, chapter-level, matching what a "Watch this lesson" link should
  actually be about (see the original module-vs-chapter-scope correction in
  the analogy-rewrite plan's history — a module-wide video talking about a
  scope wider than one lesson is the wrong grain).
- **Infographic** (Studio panel → Infographic): scoped per lesson — "at a
  glance" visual recap of that lesson's content.
- **Mind Map** (Studio panel → Mind Map): scoped per **module** (not
  per-lesson) — "every technical concept across [module]'s lessons." This
  is both the concept-map source material (§3.5) and the coverage-check
  tool from the analogy-rewrite plan's Step 6.7.

Download each generated asset, compress per §3.2, save to
`web/public/media/<module>/` with the naming convention above, and keep the
raw original in the local `media-source/<module>/` directory (not
committed).

### 3.4 Dynamic per-module prompt templates

The analogy-rewrite plan's Task 3 Step 4 prompt is fixed and reused verbatim
across modules (only the module name changes in conversation, not in the
prompt text) — that one doesn't need to be "dynamic" because it already asks
NotebookLM to work from whatever sources are loaded.

The **asset-scoping instructions**, by contrast, read better when they name
the module's actual topic and its established analogy, so paste these with
the bracketed fields filled in from that module's row in the tracker and
(once past Task 3) its chosen analogy:

```
Mind Map scope prompt:
"Generate a mind map covering every technical concept across this
notebook's sources — [MODULE TITLE]'s lessons. Include the core mechanism,
every named strategy/pattern, complexity results, and constraints/edge
cases. Expand every branch."

Video Overview scope prompt (run once per lesson, select only that
lesson's source before generating):
"Generate a Video Overview of [LESSON TITLE] only. It should walk through
the [ANALOGY NAME] the lesson uses to introduce [CORE MECHANISM], then the
technical payoff, in the same order the lesson itself presents them.
Keep it grounded in this lesson's own content — do not pull in later
lessons' material."

Audio Overview scope prompt (run once per lesson, select only that
lesson's source before generating):
"Generate an Audio Overview of [LESSON TITLE] only, as a two-host
walkthrough of the lesson's own analogy and technical content — not a
survey of the whole module."

Infographic scope prompt (run once per lesson, select only that lesson's
source before generating):
"Generate an infographic summarizing [LESSON TITLE] at a glance: the core
mechanism, one worked example, and the complexity result, in the visual
style already established (see prior modules' infographics for the visual
language to match)."
```

Fill `[MODULE TITLE]` / `[LESSON TITLE]` / `[ANALOGY NAME]` /
`[CORE MECHANISM]` from that module's tracker row and its Task 3 Step 5
scratch file (`docs/superpowers/plans/analogies/<module>.md`) — the analogy
name and core mechanism are already written down there by the time asset
generation starts, so this is a copy, not a new drafting pass.

### 3.5 Concept map transcription

Not generated by a script — hand-transcribe the Mind Map's branches into
`web/src/lib/course/conceptMaps/<module>.ts` as a `MindMapNode` tree (see
`hashTables.ts` for the reference shape: ~5 top branches, up to 3 levels
deep, one leaf per distinct claim). Register it in
`web/src/lib/course/conceptMaps/registry.ts`'s `CONCEPT_MAPS` map. This is
manual because the Mind Map's node text needs light editing to read well as
a UI label (NotebookLM's raw phrasing is sometimes too long or too
chat-register for a card).

### 3.6 UI wiring checklist (already built, just needs data)

No new components required — every module reuses the same wiring path,
already shipped:
- `ModuleMedia` on `/course/[module]/page.tsx` renders the concept map once
  `getConceptMap(moduleSlug)` resolves (registry lookup — add the module's
  entry in §3.5 and it appears automatically).
- `AudioMini` / `WatchLessonLink` / `ChapterInfographic` on
  `/course/[module]/[lesson]/page.tsx` all resolve through
  `getChapterMedia(moduleSlug, lessonSlug)` — drop files into
  `web/public/media/<module>/` with the right names and they appear
  automatically, no code changes needed per module.

---

## 4. Rollout plan

### Task A: Close the hash-tables gap (do first — it's the reference module)

- [ ] Generate Video Overviews for `hashing-fundamentals`,
      `build-a-hash-map`, `hash-patterns` (the pilot's hash-tables notebook
      already has all sources loaded — reuse it, don't recreate).
- [ ] Compress and land at `web/public/media/hash-tables/video-<slug>.mp4`
      for each.
- [ ] Confirm `WatchLessonLink` appears in all 4 lessons' headers.
- [ ] `npm test && npm run build`, spot-check in browser, commit.

### Task B: Extend the tracker to track asset completeness, not just prose

`docs/superpowers/plans/2026-08-23-course-analogy-tracker.md` currently
tracks prose-rewrite completion only. Extend each row to a 5-column
checklist (prose / audio / video / infographic / mind map) so a module
can't be marked done with silent asset gaps the way hash-tables just was
found to have. Update the hash-tables row once Task A closes it out.

### Task C: Run the combined procedure against each remaining module

For each of the 23 unchecked rows in the tracker, in tracker order:

1. Run the analogy-rewrite plan's Task 3 Steps 1–8 (prose rewrite,
   including the diagram/viz reconciliation and Mind-Map/Quiz coverage
   checks it already specifies).
2. Run §2's structural review checklist against the result.
3. Generate all 4 asset types per §3.3, using §3.4's dynamic prompts filled
   in from that module's own analogy/mechanism.
4. Transcribe the concept map per §3.5, register it.
5. Confirm the UI wiring checklist (§3.6) — should be automatic, but
   verify in the browser once per module rather than assuming.
6. `npm test && npm run build`; fix before moving on.
7. Mark all 5 columns of that module's tracker row.
8. Commit.

### End condition (per CLAUDE.md §1 — scaffolding must have a stated end)

Once every row in the extended tracker (Task B) is fully checked (all 5
columns, all 24 rows): remove `docs/superpowers/plans/analogies/` and the
tracker file, per the analogy-rewrite plan's existing "Final step."

---

## 5. Open items needing the user before Task A/C can run live

- **NotebookLM auth.** This session's browser isn't signed in to
  `notebooklm.google.com`. Generating any new asset (Task A's 3 missing
  hash-tables videos, or any of the 23 remaining modules) needs the user to
  sign in first, same as the original pilot.
- **Pacing.** Each Video/Audio Overview generation takes several minutes of
  wall-clock NotebookLM processing time per lesson; the full 23-module
  rollout is roughly 71 remaining concept lessons × 3 generated-and-timed
  assets each, plus 23 prose rewrites and structural reviews. This is
  realistically a multi-session effort, not a single-turn one — the tracker
  (Task B) exists specifically so progress survives across sessions.

---

## Self-Review

**Spec coverage:** in-depth review findings for the pilot module (§1,
explicitly requested) — done via manual audit since live NotebookLM access
wasn't available this pass, with that limitation stated rather than
glossed over. Per-module structural checklist (§2) — generalizes what was
actually done in §1 into a repeatable gate. Asset pipeline (§3) — codifies
file layout, compression settings, and NotebookLM scoping already proven
on the pilot, plus the dynamic (per-module) prompt templates explicitly
asked for. Rollout plan (§4) — sequences the gap-closure, tracker
extension, and 23-module rollout with an explicit end condition per
CLAUDE.md §1. Open items (§5) — states the actual blocker (auth) and
realistic pacing rather than implying this all happens in one turn.

**Placeholder scan:** no TBD steps; prompt templates are given verbatim
with named substitution fields; file paths and naming conventions are
exact throughout, matching what's already shipped in `media.ts` and the
`conceptMaps` registry.
