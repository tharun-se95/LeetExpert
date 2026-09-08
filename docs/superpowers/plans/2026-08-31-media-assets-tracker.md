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
| binary-search | 3 | 3/0/0 | 1 sched./0/0 | 2/0/0 (+1 sched.) |
| sliding-window | 2 | 2/0/0 | 1 sched./0/0 | — (blocked before started) |
| two-pointers | 2 | 2/0/0 | 1/0/0 (+1 blocked) | 2 sched./0/0 |
| queues | 3 | 3/0/0 | —/0/0 | 3/0/0 (all confirmed complete) |
| stacks | 3 | 3/0/0 | —/0/0 | 3/0/0 (1 confirmed, 2 submitted) |
| linked-lists | 3 | 3/0/0 (all confirmed complete) | —/0/0 | 3/0/0 (1 confirmed, 2 submitted) |
| arrays | 4 | 4/0/0 (all confirmed complete) | —/0/0 | 4/0/0 (2 submitted now, 2 scheduled) |
| strings | 3 | 3/0/0 (all confirmed complete, pre-existing) | —/0/0 | 3/0/0 (1 submitted now, 2 scheduled) |
| math-for-dsa | 6 | 6/0/0 | —/0/0 | 2/0/0 (2 scheduled, 4 not yet attempted) |
| big-o | 9 | 9/0/0 (all confirmed complete, including the 9th) | —/0/0 | —/0/0 |
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

## Session 2 (2026-09-06): generation resumed, new NotebookLM UI discovered

Resumed Phase 2 generation after the user asked to "proceed the generation
for the rest." Found NotebookLM's UI had changed since Session 1:

- **Quota now refreshes every 5 hours**, not daily (confirmed via an
  in-app onboarding tour: "Limits refresh every 5 hours... you get
  continuous allocation throughout the day"). This replaces the Session 1
  assumption of a once-daily reset.
- **New "Customize Infographic" / "Customize Audio Overview" / "Customize
  Video Overview" dialogs** replace the old free-text-prompt-only flow.
  Infographic now has a visual-style picker (Auto-select, Kawaii, Clay,
  Sketch Note, Anime, Editorial, Instructional, Bento Grid, Bricks,
  Scientific, **Professional**) — "Professional" (a clean flat-vector
  rocket-ship sample) is the closest match to the locked style spec and
  was selected for every infographic generated this session, with the
  locked spec's exact language (background/ink/accent hex, no gradients/
  shadows/3D/glow/photorealism, lesson's own analogy only) pasted into
  the new "Describe the infographic you want to create" field each time.
- **New "background queue" / "Generate later" feature**: when the account
  hits its usage cap, "Generate now" disappears but **"Generate later"
  stays available** — it schedules the job to run automatically once
  quota resets, shown in the Studio panel as `<Notebook Name> - Scheduled
  for after <time>` until it actually completes. This is a materially
  better story than Session 1's discovery (hard stop, come back later) —
  a full backlog of jobs can be queued across many notebooks in one
  sitting even after hitting the generation cap, and they resolve
  unattended. **However**, scheduling itself has its own cap: after ~5
  queued items in a short span (across two notebooks), every "Generate
  later" trigger stopped opening its dialog at all (button visibly
  disabled, tooltip still shows but no dialog) — this second, tighter cap
  is what actually ended this session's queueing, not the display-only
  "AI usage limit reached... available after 7:49 AM" banner (which only
  blocks "Generate now").
- Also reconfirmed: Video Overview now defaults to a new **"Short"**
  format (bite-sized, not in the original 3-way Explainer/Cinematic
  split) — always explicitly switched to **Cinematic** per the standing
  "Cinematic only, never Explainer" instruction; Short was never used.

**What got queued this session** (see table above for the up-to-date
per-module counts): finished binary-search's Session-1 gaps (3rd
infographic, 2 audio, 1 video scheduled); fully generated sliding-window's
2 infographics + 1 video scheduled; fully covered two-pointers (2
infographics + 2 audio generated, 1 of 2 videos scheduled — the 2nd
video's dialog stopped opening before it could be submitted); queues
module untouched — its Infographic button was already disabled by the
scheduling cap by the time it was reached.

**Everything currently shown as "Scheduled for after <time>" in a
notebook's Studio panel will keep generating unattended** — no further
action needed for those specific jobs to finish. The queues module (and
stacks through dynamic-programming, 12 modules total) still need a fresh
session, after the scheduling cap resets, to even get their first
Infographic/Audio/Video request queued.

## Session 3 (2026-09-07): quota reset, resumed queueing, browser auth lost mid-session

Quota reset overnight as expected. Resumed at **queues** and pushed through
in tracker order: queues (3/3 infographics confirmed complete; 2 of 3 audio
requests submitted via "Generate now," not confirmed complete before moving
on; 3rd audio never attempted — Audio button was busy on the 2-concurrent
cap when reached), stacks (3/3 infographics confirmed complete; 2 of 3
audio submitted, 3rd blocked by the same concurrency cap), linked-lists
(only 1 of 3 infographics submitted — session was interrupted mid-flow
right after clicking into the 2nd lesson's Infographic dialog, before
sources/style/description were set — do not assume it queued), math-for-dsa
(6/6 infographics confirmed complete, all with the monochrome `#1E293B`
accent since this module has no `familyTheme.ts` family), big-o (8 of 9
infographics confirmed complete — every lesson except
`amortized-analysis-dynamic-arrays.md`, which was never reached).

**Session ended when the Browser pane's Google session logged out again**
(same failure mode as the first session) while navigating back to the
notebook grid to start **getting-started**. Nothing was queued for
getting-started, greedy, prefix-sum, matrix, or dynamic-programming this
session. Per the hard rule against entering credentials, the user needs to
sign back into the Browser pane before generation can resume — see the
signin note in `2026-08-23-course-analogy-tracker.md`'s renaming section
for the exact failure mode (browser lands on accounts.google.com).

**Video Overview was not touched at all this session** — every action was
Infographic or Audio. two-pointers' still-missing Partition Pointers video
and sliding-window's still-missing audio (both flagged at the end of
Session 2) also remain untouched.

## Session 4 (2026-09-08): verified Session 3 gaps, pushed through arrays/strings/math-for-dsa, hit account-wide scheduling cap

Resumed after the user signed back into the Browser pane. Verified every
"submitted, not confirmed" item flagged at the end of Session 3, then
continued:

- **queues**: verified 3/3 infographics; all 3 audio now confirmed
  complete (the 2 "submitted" from Session 3 had in fact completed; added
  the 3rd).
- **stacks**: verified 3/3 infographics; found 0 audio actually existed
  (Session 3's "2 submitted" never landed) — resubmitted and confirmed all
  3 audio in flight/complete.
- **linked-lists**: verified 3/3 infographics were in fact already
  complete (Session 3's "only 1/3 submitted" note was wrong — the
  interrupted flow had actually succeeded); did all 3 audio from scratch.
- **arrays**: found all 4/4 infographics already complete (pre-existing,
  untracked); did all 4 audio (2 generated immediately, 2 queued via
  "Generate later" once the display cap hit).
- **strings**: found all 3 lessons' infographics already complete
  (4 infographic docs exist for 3 lessons — one extra); did all 3 audio
  (1 generated, 2 via "Generate later"; the account's usage limit
  self-restored mid-session, "Limit restored" banner confirmed, then
  re-capped again shortly after — consistent with the 5-hour rolling
  window, not a fixed clock).
- **math-for-dsa**: found all 6/6 infographics already complete; got 2 of
  6 audio queued via "Generate later" before hitting a **harder cap**
  where "Generate later" itself is greyed out (not just "Generate now") —
  this is the account-wide scheduling limit, distinct from the earlier
  per-notebook one documented in Session 2.
- **big-o**: found all 9/9 infographics already complete (the 9th,
  `amortized-analysis-dynamic-arrays`, thought missing at the end of
  Session 3, had actually gone through) — confirmed by testing an
  Audio Overview dialog here too, which showed the same fully-inert
  "Generate later" state, proving the cap is account-wide right now, not
  specific to the math-for-dsa notebook.

**Recurring lesson this session: never trust a "submitted" note from a
previous session without re-opening the Studio panel and counting items.**
Twice this session a prior note was wrong in each direction — stacks'
"2 submitted" audio turned out to be 0 actually generated, while
linked-lists' "1/3 submitted" infographics turned out to be 3/3 already
done. Always re-verify from the Studio panel before acting on the
tracker's own notes.

**Session ended on the account-wide "Generate later" cap** (not a browser
auth loss this time). getting-started, greedy, prefix-sum, matrix, and
dynamic-programming remain fully untouched. Video Overview remains
completely untouched since Session 2.

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

## Next generation session

**First: re-verify every module's Studio panel from scratch before
trusting any count below** — Session 4 found the tracker's own notes wrong
in both directions (see Session 4 write-up above). Don't act on a
"submitted"/"scheduled" note without opening the notebook and counting
items in the Studio panel.

Current confirmed state entering the next session:

1. **queues, stacks, linked-lists, arrays, strings, math-for-dsa, big-o**
   all have infographics fully complete (or effectively complete — see
   per-module notes). Audio is complete for queues/stacks/linked-lists/
   arrays/strings; math-for-dsa has only 2/6 audio scheduled; big-o has
   0/9 audio started.
2. **getting-started, greedy, prefix-sum, matrix, dynamic-programming** —
   fully untouched, start from infographics.
3. Once infographics/audio catch up, do a **Video Overview pass** across
   every module — it hasn't been touched since Session 2's binary-search/
   sliding-window/two-pointers work. Also finish two-pointers' Partition
   Pointers video and sliding-window's 2 missing audio (flagged at the end
   of Session 2, still open).

**On hitting the cap**: two distinct caps exist. A per-notebook
concurrency cap (max ~2 simultaneous generations) just makes "Generate
now" wait — switch to a different notebook and come back later. A
harder **account-wide scheduling cap** eventually greys out "Generate
later" too, with all dialog controls inert — when you see that (test it
in more than one notebook to confirm it's account-wide, not
per-notebook), stop entirely and let already-scheduled jobs resolve;
retrying doesn't help. This session's cap started around 8:00 PM
(quota window: "Limit resets at 2:49 PM" seen earlier the same day,
then a full re-cap by evening) — the 5-hour rolling window means it will
likely clear a few hours after the session ends.

Use the "Professional" infographic style and the locked spec text (§ above
/ media-rollout spec §3.4) plus each module's `familyTheme.ts` accent hex
every time — for math-for-dsa, big-o, and getting-started, which have no
family entry, use the monochrome ink hex `#1E293B` as the "accent" so the
infographic stays consistent with the site's colorless base for those
three modules. **Always screenshot-confirm a submission before navigating
away or claiming a count in this file** — most of this session's cleanup
work was re-verifying prior sessions' unconfirmed claims.
