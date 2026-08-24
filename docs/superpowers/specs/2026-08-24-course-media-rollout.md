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

Performed 2026-08-24 in two passes.

**Pass 1 (manual, offline):** read all 4 concept lessons
(`hashing-fundamentals.md`, `collision-resolution.md`, `build-a-hash-map.md`,
`hash-patterns.md`), all 5 problem lessons (`two-sum.md`,
`contains-duplicate-ii.md`, `first-unique-character.md`, `group-anagrams.md`,
`longest-consecutive-sequence.md`), and `practice.md` in full — the module's
complete lesson list, not just the concept lessons. Cross-checked every
`diagram`/`viz`/`sandbox`/`examples` block's actual values against the
surrounding prose's claims, cross-checked the concept map
(`web/src/lib/course/conceptMaps/hashTables.ts`) against final lesson content
leaf-by-leaf, cross-checked `practice.md`'s five problems against the "four
verbs" table in `hash-patterns.md`, and confirmed the module's manifest entry
(`web/src/lib/course/manifest.ts`) sequences concept → problem
(easy → medium) → practice correctly, with problem-lesson cross-references
to other modules (e.g. Group Anagrams referencing Strings' Valid Anagram)
pointing at lessons that actually exist and are sequenced earlier.

**Result: content is consistent and complete.** No defect found in any of
the 10 lessons — diagrams, worked examples, sandbox test cases, and
complexity claims all check out arithmetically; every problem lesson names
the correct usage verb and cross-references real, correctly-sequenced
lessons elsewhere in the course.

**Pass 2 (live NotebookLM, with the user signed in):** the pilot's
hash-tables notebook still had its original pre-rewrite draft sources
loaded, not the final shipped prose — refreshed it by adding the 4 final
lesson bodies as new sources (labeled `SOURCE (FINAL, shipped 2026-08-24)`)
and deselecting the stale drafts, then re-ran both Task 3 Step 6.7 (Mind
Map) and 6.8 (Quiz) against the final content only.
- **Mind Map:** every one of its ~25 leaves across 6 branches (Core
  Mechanism, Collision Resolution, Dynamic Resizing, Complexity Analysis,
  Practical Patterns, Implementation Constraints) traced to an existing
  claim in the lessons or concept map — with one exception: a **Space:
  O(n)** leaf under Complexity Analysis that isn't stated anywhere in the
  shipped `complexity` fence (only time complexities were listed). **Fixed**
  — added a `space` row to `collision-resolution.md`'s complexity table.
- **Quiz (10 questions):** 8 of 10 duplicated an existing hand-written quiz
  question almost exactly (the expected, reassuring outcome). 2 surfaced
  real gaps and were **fixed**:
  - Iteration cost (O(n + m)) is taught in the complexity table but was
    never quizzed — added to `collision-resolution.md`.
  - The Index verb is named for Two Sum in `hash-patterns.md`'s prose, but
    no quiz question ever asked a learner to identify it — added to
    `hash-patterns.md`.

All fixes verified: `npm test` (551 tests), `npm run build`, and both new
questions/the new complexity row confirmed rendering correctly in the
browser. See `git log` for the two commits (structural fixes had none
needed; quiz/complexity fixes are one commit).

**One structural gap remains open: video coverage is incomplete.** Only
`collision-resolution.md` has a video (`video-collision-resolution.mp4`);
`hashing-fundamentals.md`, `build-a-hash-map.md`, and `hash-patterns.md` have
none. Audio and infographic are present for all 4. This isn't a prose defect
— `WatchLessonLink` degrades gracefully (link doesn't render without a
`videoSrc`) — but it means 3 of 4 lessons are missing one of the module's
four asset types. **Action:** generate the missing 3 videos before treating
hash-tables as the fully-realized reference module (see §4, Task A).

**Superseded by §1.5 below** — the module was restructured to 6 lessons
the same day, which changes which lessons need which assets.

---

## 1.5 Restructure execution + media session (2026-08-24, later the same day)

Executed the §2.5 curriculum-designer recommendation from earlier in the
day: split `collision-resolution.md` into `collision-chaining.md` and
`collision-open-addressing.md`, added a new `keys-immutability-hashing.md`
lesson, expanded `hash-patterns.md` with a formal Maps-vs-Sets section, and
updated `manifest.ts`, the two lesson-count tests, and the concept map.
`npm test` (551), `npm run build` (214→~ lessons), and all 6 lessons
spot-checked rendering correctly. Full detail in the git log (3 commits:
content restructure, concept-map update, and this doc).

**Media generation session (same NotebookLM notebook, sources refreshed to
the split lesson content):**

| Lesson | Audio | Infographic | Video |
| --- | :-: | :-: | :-: |
| 1. Hashing Fundamentals | had it already | had it already | **generated** ("Hashing Fundamentals", Explainer) |
| 2. Collision: Chaining | reused old combined-lesson asset (renamed) | reused old combined-lesson asset (renamed) | reused old combined-lesson asset (renamed) |
| 3. Build a Hash Map | had it already | had it already | **generated** ("Build a Hash Map From Scratch", Explainer) |
| 4. Collision: Open Addressing | **generated** ("Linear probing and the tombstone fix") | **generated** ("Open Addressing Hash Table Guide") | **generated** ("The Contiguous Hash: Density, Degradation...", Cinematic) |
| 5. Keys, Immutability & Crypto | **generated** ("Why Mutating Hash Keys Destroys Data") | **generated** ("Keys and Hashing Infographic") | **generated** ("Anatomy of a Lost Package: Three Ways Hashing Fails", Cinematic) |
| 6. Four Hash Patterns | **regenerated** ("Four Architectural Patterns for Hash...") — old one predated the Sets section | **regenerated** ("Hash Patterns and Usage Verbs") — same reason | **generated** ("The Four Hash Patterns", Explainer) |

**Every lesson in the module now has a complete audio+infographic+video set
generated inside the notebook** (lesson 2 via the renamed pre-restructure
asset, lessons 1/3/4/5/6 fresh this session). The Cinematic-format daily
cap (§1.5) turned out to be per-*format*, not per-notebook: after 2
Cinematic videos succeeded and a 3rd was refused, switching the remaining
3 videos to the **Explainer** format (a distinct, differently-styled
overview — structured/comprehensive rather than cinematic/narrative) let
all 3 generate without hitting any further limit. **For future modules:
default to Explainer format for Video Overview generation** — it wasn't
capped this session, where Cinematic was after 2.

Also regenerated the Mind Map for the full 6-lesson structure ("Hashing
Mindmap", 7 sources) and transcribed it into
`web/src/lib/course/conceptMaps/hashTables.ts` (verified the Fundamentals
branch node-by-node against the live mind map; the rest transcribed from
the lesson content directly, same method as the original concept map).

**Two hard blockers hit, both worth knowing for every future module pass:**

1. **NotebookLM's Cinematic Video Overview has a daily generation cap on
   this account.** 2 videos generated successfully this session (lessons 4
   and 5); a 3rd attempt (lesson 1) showed no confirmable result and a 4th
   (lesson 3) was explicitly refused with "You have reached your daily
   Cinematics limit, come back later." **Budget roughly 2 Cinematic videos
   per notebook per day** when planning a module's media session — spread
   video generation for a 6+ lesson module across multiple days, or across
   multiple days per module during the 23-module rollout.
2. **This session's browser sandbox cannot retrieve the generated binary
   files.** NotebookLM's "Download" action triggers a client-side blob
   download (confirmed via DOM inspection — no plain `<audio>`/`<video>`
   src, no downloadable network request; Google's batchexecute RPC
   protocol serves the bytes directly into a blob URL the browser
   click-downloads), and this session's sandboxed automation environment
   does not surface that download anywhere on the local filesystem
   (checked `~/Downloads`, the platform's real download dir, and
   `~/.claude/downloads`, the tool's documented download landing spot —
   both stayed empty after multiple confirmed download-button clicks).
   **All 5 assets generated this session (audio ×2, infographic ×2, video
   ×2 — see table above) exist and are playable inside the NotebookLM
   notebook itself, but are NOT yet in `web/public/media/hash-tables/`.**
   Getting them from NotebookLM into the repo needs either: the user
   downloading them manually (they have an unsandboxed browser) and
   handing the files over, or a different automation surface than this
   session's Browser pane that can complete a real file download. Until
   one of those happens, lessons 4 and 5 have no shipped media despite
   the source material existing and being generated.

**Revised action for Task A:** don't just generate the missing videos —
first solve the download-retrieval blocker (item 2 above), since it now
blocks *all* newly generated assets from this session, not just video.

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

## 2.5 Curriculum-designer lesson-list review (run FIRST, before Task 3)

Added 2026-08-24, after running this against hash-tables retroactively and
getting a real, actionable finding (see §1 note below) — for every module
from here on, **run this before starting the Task 3 prose rewrite**, not
after. Deciding the right lesson list first means the analogy rewrite
happens once, on the right set of lessons, instead of getting redone after
a structural review finds the list itself was wrong.

**What it checks, and why it's a separate step from §2:** §2's checklist
audits *internal consistency* of the lessons that already exist (do the
diagrams match the prose, does the concept map match the lessons). This
step instead asks whether the *list of lessons itself* is the right one —
count, scope per lesson, order, and completeness — independent of how
practice problems are organized. That's a curriculum-design question, not
a correctness check, and it needs to be asked explicitly or it never gets
asked at all.

**Procedure:**

1. In the module's NotebookLM notebook (created/reused per Task 3 Step 1),
   make sure the sources reflect the module's *existing* lesson list (for
   a not-yet-rewritten module, this is simply its current `course/<module>/
   *.md` concept-lesson files — the curriculum question doesn't depend on
   the analogy pass having happened yet).
2. Ask this exact question as its own, standalone chat turn — not combined
   with any other question in the same message, so the model doesn't blend
   this with an unrelated concept-vs-practice framing (a real failure mode
   hit on the first attempt: asking two structural questions in one prompt
   made the response answer only the first one):

   ```
   New, separate question — evaluate purely as a curriculum designer,
   independent of how practice/problem lessons are organized. This module
   currently has [N] concept lessons: (1) [Lesson 1 title], (2) [Lesson 2
   title], ... ([N]) [Lesson N title].

   Is [N] the right NUMBER of concept lessons to teach [MODULE TOPIC]
   properly, or should there be more or fewer? For each existing lesson,
   tell me: is its topic scope correct as a single lesson, too broad
   (should split into multiple lessons), or too narrow (should merge with
   a neighbor)? Is the ORDER of topics correct, or should any lesson move
   earlier/later? Is there any topic, sub-topic, or concept a properly
   designed module should teach as its own lesson (or fold into an
   existing one) that is currently missing entirely? Give a recommended
   lesson list — names, count, and order — with a one-line justification
   for each entry.
   ```

3. Treat the response as a **recommendation to review with the user, not
   an instruction to execute automatically.** A restructure (splitting or
   merging lesson files, renumbering, touching `manifest.ts`, the concept
   map, and every affected quiz) is a bigger change than a prose rewrite
   and can break existing links/progress state — get an explicit go-ahead
   before implementing it, same as any other architecturally significant
   change.
4. If the recommendation is accepted: implement the revised lesson list
   *before* running Task 3's prose rewrite on it, so the analogy pass
   happens once, on the final lesson boundaries — not once on the old
   list and then again after a restructure.
5. If the recommendation is declined or the existing list is confirmed
   sound: proceed straight to Task 3 on the existing list.

**hash-tables retroactive finding (2026-08-24):** run against the pilot's
already-shipped 4-lesson list as a validation of the step itself. Verdict:
4 is too few — recommended 6, splitting the overloaded `collision-
resolution.md` (currently chaining + resizing + open addressing +
tombstones all in one lesson) into two lessons with the coding lab
sandwiched between them, expanding "The Four Hash Patterns" to formally
cover Hash Sets, and adding a new lesson on key immutability and the
non-cryptographic-vs-cryptographic-hashing distinction (a real,
commonly-confused gap the existing 4 lessons never address). **Not yet
implemented** — pending the user's decision on whether to restructure the
already-shipped pilot module or treat this as input for module 2 onward
only.

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

### Task A: Close the hash-tables gap — DONE (2026-08-24)

Closed in three passes: §1.5's restructure/media session, a follow-up
that closed the remaining generation gap with the Explainer video-format
workaround, and a final pass where the user downloaded all 11 generated
files manually from the notebook UI (this session's browser sandbox
never did solve the download-retrieval blocker itself — manual handoff
was the actual resolution) and handed them off for compression and
landing.

- [x] Retrieved and compressed (§3.2) all 11 assets, landed at
      `web/public/media/hash-tables/<type>-<slug>.<ext>`: video for
      `hashing-fundamentals` and `build-a-hash-map`; audio + infographic +
      video for `collision-open-addressing` and `keys-immutability-
      hashing`; audio + infographic + video for `hash-patterns`
      (replacing the stale pre-Sets-expansion audio/infographic).
- [x] `WatchLessonLink` confirmed rendering (and playing) on all 6
      lessons; `AudioMini` confirmed playing the new/refreshed audio;
      both new infographics confirmed rendering in the article body.
- [x] `npm test` (551), `npm run build`, browser spot-checks — all clean.
- [x] Tracker's hash-tables row updated to all-x.

**Lesson for the remaining 23-module rollout:** the download-retrieval
blocker never got a real fix — it was worked around by the user
downloading manually. Budget that manual step into every future module's
media session rather than assuming it'll resolve itself.

### Task B: Extend the tracker to track asset completeness, not just prose

`docs/superpowers/plans/2026-08-23-course-analogy-tracker.md` currently
tracks prose-rewrite completion only. Extend each row to a 5-column
checklist (prose / audio / video / infographic / mind map) so a module
can't be marked done with silent asset gaps the way hash-tables just was
found to have. Update the hash-tables row once Task A closes it out.

### Task C: Two-phase rollout — structure/prose/mind-map first, media later

**Changed 2026-08-24 (user decision, after the hash-tables pilot):** media
generation (audio/video/infographic) is split off the per-module loop into
its own later pass across all 24 modules, run only after every module's
curriculum and lesson content is finished. Reasons: (1) NotebookLM's
Cinematic cap (2/day on this account — confirmed against the documented
per-tier limit) makes interleaving media into 23 sequential module passes
a pacing bottleneck; deciding cinematic-vs-explainer per module is a
separate editorial call better made once, late, with the full course in
view rather than piecemeal per module. (2) Explainer-format output quality
needs a refinement pass of its own (open, not yet scoped) — no value in
generating 71 Explainer videos before that refinement lands, since they'd
need regenerating anyway. (3) Content quality (curriculum + prose) is the
product; shipping the full curriculum first is higher-value than partial
modules with polished media.

**Phase 1 — structure, prose, mind map (run now, all 24 modules):**

For each of the 23 unchecked rows in the tracker, in tracker order:

1. Run §2.5's curriculum-designer lesson-list review **first**, against
   the module's current lesson list. Get the user's go-ahead on the
   recommendation (accept, partially accept, or keep the existing list)
   before continuing.
2. Run the analogy-rewrite plan's Task 3 Steps 1–8 (prose rewrite,
   including the diagram/viz reconciliation and Mind-Map/Quiz coverage
   checks it already specifies) against the lesson list §2.5 settled on.
3. Run §2's structural review checklist against the result.
4. Transcribe the concept map per §3.5, register it (mind map ships now —
   it's authored data, not a generated media asset, and costs nothing to
   ship alongside prose).
5. `npm test && npm run build`; fix before moving on.
6. Mark the tracker row's **Prose** and **Mind Map** columns only — leave
   Audio/Video/Infographic blank, they belong to Phase 2.
7. Commit.

**Phase 2 — media generation (run once Phase 1 clears all 24 rows):**

1. For every module, decide per-lesson which get **Cinematic** video vs
   **Explainer**, against the 2/day Cinematic budget — a deliberate
   editorial call across the finished curriculum (which lessons are the
   selling-point/hook lessons vs supporting ones), not a per-module
   default. Record the decision in this file before generating.
2. Before generating any Explainer video, land the Explainer quality
   refinement (tracked as an open item below — not yet scoped).
3. Generate all 4 asset types per §3.3, using §3.4's dynamic prompts.
4. Confirm the UI wiring checklist (§3.6) in the browser per module.
5. Mark the remaining 3 tracker columns (Audio/Video/Infographic).
6. Commit.

**Open item — Explainer quality refinement:** flagged by the user
2026-08-24 as needed before Phase 2 generates any Explainer video at
scale. Not yet scoped — revisit once Phase 1 is closer to done.

### End condition (per CLAUDE.md §1 — scaffolding must have a stated end)

Once every row in the extended tracker (Task B) is fully checked (all 5
columns, all 24 rows): remove `docs/superpowers/plans/analogies/` and the
tracker file, per the analogy-rewrite plan's existing "Final step."

---

## 5. Open items needing the user before Task A/C can run live

- **NotebookLM auth.** Resolved 2026-08-24 — the user signed in for the
  live review pass in §1, and the pilot notebook's sources are now current
  (final content, not pre-rewrite drafts). Task A (3 missing hash-tables
  videos) and Task C (23-module rollout) can proceed live from here without
  a fresh sign-in, for as long as the session's auth stays valid.
- **Pacing.** Each Video/Audio Overview generation takes several minutes of
  wall-clock NotebookLM processing time per lesson; the full 23-module
  rollout is roughly 71 remaining concept lessons × 3 generated-and-timed
  assets each, plus 23 prose rewrites and structural reviews. This is
  realistically a multi-session effort, not a single-turn one — the tracker
  (Task B) exists specifically so progress survives across sessions.

---

## Self-Review

**Spec coverage:** in-depth review findings for the pilot module (§1,
explicitly requested) — updated with the live NotebookLM Mind-Map/Quiz
pass and the retroactive curriculum-designer finding. Per-module
structural checklist (§2) — generalizes what was actually done in §1 into
a repeatable internal-consistency gate. Curriculum-designer lesson-list
review (§2.5) — a distinct, earlier step asking whether the lesson list
itself is right, added after running it live against hash-tables and
getting a real restructuring recommendation; sequenced first in Task C so
future modules get the right lesson list before the prose pass, not after.
Asset pipeline (§3) — codifies file layout, compression settings, and
NotebookLM scoping already proven on the pilot, plus the dynamic
(per-module) prompt templates explicitly asked for. Rollout plan (§4) —
sequences curriculum review, gap-closure, tracker extension, and the
23-module rollout with an explicit end condition per CLAUDE.md §1. Open
items (§5) — states pacing realistically rather than implying this all
happens in one turn.

**Placeholder scan:** no TBD steps; prompt templates are given verbatim
with named substitution fields; file paths and naming conventions are
exact throughout, matching what's already shipped in `media.ts` and the
`conceptMaps` registry.
