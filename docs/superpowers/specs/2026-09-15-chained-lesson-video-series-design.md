# Chained lesson video series

**Date:** 2026-09-15
**Scope:** one explainer video per DSA concept lesson (83), produced in course
order so each video continues the one before it. Covers how the chain is
defined, how continuity is planned and checked, how a single two-voice video
is produced, where it is published, and how several agents share the work.
**Builds on:** the HyperFrames pipeline proven by the Arrays module intro,
documented in `hyperframes/README.md` and
`hyperframes/videos/arrays-intro/README.md`. Read both before working on this.
**Status:** pending owner review of this spec.
- **Decided by the owner** in brainstorming on 2026-09-15: everything in §2.
- **Proposed by the agent:** everything else. It follows from those decisions
  and was presented in the same session, but has not been signed off section
  by section. The course-introduction pilot (§10, phase 3) settles the open
  parameters in §6, and the owner reviews that video before any further video
  is produced.
---

## 1. Why this exists

The owner wants the course's videos to feel like **one continuous course,
not a stack of separate clips**. No video may start cold: each one picks up
where the previous one left off and hands something on to the next.

The first video, the Arrays module intro, proved the production pipeline:
ElevenLabs voiceover, word-anchored HyperFrames scenes, measured timing, and
render verification. It was built as a standalone module trailer. This spec
turns that pipeline into a **series**.

## 2. Owner decisions (2026-09-15)

| Question | Decision |
| --- | --- |
| Unit of the chain | **One video per concept lesson**: 83 videos, in course order |
| First video | `getting-started/course-introduction` |
| Length | **Varies by lesson**: set by what the lesson's core idea needs, capped at 3 minutes. It is not proportional to word count; lessons range from 584 to 3,643 words. |
| Voice | **A narrator leads, and a learner voice** asks the question a learner would ask at key moments. The owner likes the discussed feel of the NotebookLM audio overviews. The narrator carries the explanation; this is not an equal two-host podcast. |
| Planning | **Plan a stage, then produce.** Every opener and handoff in a stage is planned and reviewed before any audio is recorded. |
| Hash Tables NotebookLM videos | **Kept as reference.** The six existing videos stay. How a chained video and a NotebookLM video share those lesson pages is decided at Stage 1 (§11). |

## 3. Prerequisites: blocking, do these before any agent starts

1. **Get the pipeline into git.** On 2026-09-15 everything this spec builds on
   was untracked, and a fresh worktree or clone has none of it:
   `hyperframes/` (pipeline scripts, primitives, the Arrays video project and
   its audio), `docs/hyperframes/`, `web/tests/moduleVideo.test.ts`,
   `web/public/media/arrays/intro.mp4`, and the uncommitted changes to
   `web/src/components/course/VideoPlayer.tsx`,
   `web/src/app/courses/dsa/[module]/page.tsx` and
   `web/src/lib/course/media.ts`. The owner decides what is committed.
   Recommended rules:
   - **Commit voiceover clips and their word timings** (`audio/line-*.mp3`,
     `audio/*.words.json`). TTS output is non-deterministic, and every scene
     beat is anchored to the exact take. A regenerated take is a new take
     with new timings, so these files are source, not build output.
   - **Ignore** each project's `renders/` (the published copy lives in
     `web/public/media/`) and `hyperframes/videos/_backups/`. Neither is ignored
     today. `node_modules/` is already ignored repo-wide.
2. **Voice credentials.** Agents read `ELEVENLABS_API_KEY` from the
   environment, which the owner provides. It is never written to a file, a
   commit or a log line. The current key was exposed in a session transcript
   on 2026-09-12, and the owner was advised to rotate it.
3. **A known asset defect.** The module-art light and dark files are swapped:
   `*-light.webp` is the dark plate. Until that is fixed, choose a plate by
   looking at it, never by its filename.

## 4. The chain

### 4.1 Definition

The chain is every `concept(...)` lesson in `web/src/lib/course/manifest.ts`.
Modules are taken in `number` order, and lessons in their manifest order
within each module. Problem and practice lessons are not in the chain.

| Stage | Videos | First | Last |
| --- | --- | --- | --- |
| 0 Foundations | 19 | `getting-started/course-introduction` | `math-for-dsa/math-drills` |
| 1 Linear structures | 22 | `arrays/contiguous-memory` | `queues/deques-and-monotonic` |
| 2 Techniques | 17 | `two-pointers/converging-pointers` | `matrix/in-place-transformations` |
| 3 Recursive & hierarchical | 12 | `recursion-backtracking/the-call-stack-and-base-cases` | `tries/trie-structure-and-prefix-search` |
| 4 Global reasoning | 13 | `intervals/sorting-intervals-and-the-sweep` | `dynamic-programming/knapsack-style-dp` |
| **Total** | **83** | | |

The chain crosses module and stage boundaries: the last video of one stage
hands off to the first video of the next.

### 4.2 `chain.json` is generated, never typed

`hyperframes/series/dsa/chain.json` is written by a script that reads the
manifest. Each entry holds `index`, `stage`, `module`, `lesson`, and the
`prev` and `next` lesson ids. A reordered or renamed lesson in the manifest
must flow in by regenerating the file. A CI test (§8) fails whenever the file
and the manifest disagree.

### 4.3 Continuity rules for scripts

These rules bind every script:

1. **Openers state the previous idea as a fact.** The video plays on its
   lesson page, often for someone who never watched the previous one. "You
   can now measure what an algorithm costs. Now…" works for everyone. "As we
   saw last time…", "previously" and "welcome back" are banned.
2. **Every video ends on a handoff:** the question or idea the next lesson
   answers, taken from that next lesson's own content. Never a teaser the
   next lesson doesn't deliver.
3. **No outro card.** No URL, no counts, no "subscribe". The video already
   plays on the site. (The Arrays module intro's closing counts and URL do
   not carry over into chained videos.)
4. **Visual handoff.** A video's final frame is the next video's opening
   frame: the same scene state, re-entered.
5. **One sound across the series.** The same narrator voice and settings,
   the same learner voice once the pilot chooses it, and one consistent
   opening cue.
6. **Analogies follow the lesson.** A lesson's own analogy is used where the
   lesson carries one (for example the cooking framing in Getting Started,
   or the train in Arrays). No metaphor is forced across the whole series.
   Formal math and proof-heavy lessons keep analogy minimal.
7. **The chain's two ends.** The first video,
   `getting-started/course-introduction`, opens the course itself: it has no
   previous idea to state and no opening frame to match. The last video,
   `dynamic-programming/knapsack-style-dp`, closes the course instead of
   handing off. Rules 1, 2 and 4 and the checks that enforce them skip those
   two ends.

## 5. Stage plans

### 5.1 Layout

```
hyperframes/series/dsa/
  chain.json                     generated (§4.2)
  stage-<n>/PLAN.md              the plan the owner reviews
  stage-<n>/handoffs.json        machine-readable form of the same plan
  <module>/<lesson>/             one video project per lesson (§6)
hyperframes/series/shared/       the generalised pipeline (§6)
```

### 5.2 `handoffs.json`

There is one entry per lesson in the stage, in chain order:

```json
{
  "lesson": "big-o/big-o-notation",
  "opens_from": "the idea the previous video handed on, as a fact",
  "core_idea": "the one thing this video must teach, derived not asserted",
  "hands_off": "the question the next lesson answers",
  "source_sections": ["big-o-notation.md § ..."],
  "target_seconds": 120,
  "end_state": "the scene state of the final frame, which the next video opens on",
  "status": "planned",
  "owner": null
}
```

- **`status`** is one of `planned`, `scripted`, `voiced`, `composed`,
  `checked`, `published`.
- **`owner`** holds the id of the agent currently working the lesson.
- **Invariants:**
  - An entry's `hands_off` and the next entry's `opens_from` are the **same
    sentence, verbatim**. The plan writes each boundary once and uses it on
    both sides, so the pairing is checkable, not a judgement call. This holds
    across stage boundaries too.
  - `target_seconds` is at most 180.
  - The first entry of the chain has an empty `opens_from`, and the last has
    an empty `hands_off` (§4.3 rule 7).

### 5.3 Process

1. **Draft.** One agent drafts the whole stage plan, reading every lesson in
   it. Every `core_idea` and `hands_off` cites the lesson section it came from.
2. **Review.** The owner reviews `PLAN.md`. No audio is recorded for the
   stage until the plan is approved.
3. **Change control.** Changing a handoff after approval means updating the
   next entry's `opens_from` in the same change. If either video is already
   published, both are re-cut; that touches only their opening or closing
   scenes, because everything is anchored to words.

## 6. Producing one video (proposed)

### 6.1 Project

`hyperframes/series/dsa/<module>/<lesson>/` is its own HyperFrames project,
because every HyperFrames quality gate is directory-scoped. The shared
`assets` folder is symlinked in, never copied. At this depth the link is
`assets -> ../../../../assets`: paths must stay root-relative, because a `../`
climb above the project root fails lint.

The project contains `BRIEF.md` (generated from the stage plan entry),
`SCRIPT.md`, `STORYBOARD.md`, `audio/`, `scenes.json`, `timing.js`,
`index.html` and `compositions/`.

### 6.2 Script format

Each scene is a sequence of turns. Each turn names its speaker, `NARRATOR`
or `LEARNER`, and every claim cites its lesson section, as in the Arrays
`SCRIPT.md`.

- **The learner speaks only at key moments:** the natural question before a
  derivation, or the misconception the lesson corrects.
- **The narrator carries the explanation.** The script's own word counts
  must predict at most `target_seconds`.

### 6.3 Voiceover

Generalise `hyperframes/videos/arrays-intro/build-vo.py` into `series/shared/`:

- **Per turn:** each turn is generated separately with its speaker's voice,
  through the `with-timestamps` endpoint.
- **Stitching:**
  - **No `next_text`, ever.** Stitching starts the next utterance inside the
    clip's tail, and that fragment clicks against inserted silence. This was
    the root cause of the Arrays glitch; see that video's README.
  - `previous_text` is set to the previous turn's text. It is verified clean
    for a single narrator only; the pilot confirms it across two speakers.
- **Edge validation:** every clip is checked with `audiocheck.py` (the first
  and last 10 ms must be quieter than −60 dB), with up to 4 attempts in
  total. The build fails rather than keep a clip that clicks.
- **Word timings:** saved per turn from the alignment of the exact audio
  returned.
- **Voices:** the narrator stays "River" (`SAz9YHcvj6GT2YYXdXww`,
  `eleven_multilingual_v2`, stability 0.45, similarity 0.75, style 0.10). The
  learner voice is chosen by ear in the pilot and recorded here.

### 6.4 Timeline

Generalise `build-timeline.py`, which remains the only writer of timing:

- **Joins:** a short gap between turns, a longer gap between scenes. Both
  lengths are tuned in the pilot.
- **`timing.js`:** each scene lists its turns (speaker plus words). A scene's
  anchor list is the concatenation of its turns' words, so `WA(k, offset)`
  keeps the meaning it has in the Arrays video.
- **Safety:** it refuses to assemble any clip that fails edge validation,
  and rewrites every scene's `data-start` and `data-duration` from the
  measured audio.

### 6.5 Composition

Every trap in `hyperframes/README.md` applies:

- State changes use `tl.set`, never `tl.call`.
- Fonts are inlined; GSAP is vendored; ligatures are off.
- Each scene calls `LE.assertFits` and carries a word-count guard.
- Renders use `--workers 1`.
- A lint error silently disables the layout and contrast audits.

Additional rules:
- **Never caption the spoken sentence.** Build the visual idea behind it
  (project skills `creative-unlock` and `scene-composition`).
- **The learner's turn needs a visual cue** so a viewer knows who is
  speaking. The form (a speaker mark, a question pulse) is chosen in the
  pilot; it is not a caption.
- **The first scene re-enters the previous video's `end_state`,** and the
  last scene builds this video's `end_state`.

### 6.6 Per-video verification (all required before `checked`)

1. A transcription of every turn matches the script.
2. Every clip passes edge validation. A whole-file scan of the render finds
   **0** abrupt cut-offs.
3. `hyperframes check` passes with 0 errors, 0 warnings, and a real contrast
   sample count, not `0/0`.
4. A snapshot of every scene has been looked at, and frames just before and
   after each anchor word show the beat landing on its word.
5. **Continuity gate:** this video's first frame matches the previous
   video's last frame. The pilot sets the threshold, by measuring one
   intentional match and one intentional mismatch, and proves the gate can
   fail.
6. Rendered length is at most 180 s and within 15% of `target_seconds`, or
   the plan entry is updated with a reason.

## 7. Publishing

- **Destination:** a verified render is copied to
  `web/public/media/<module>/video-<lesson>.mp4`. `getChapterMedia` already
  resolves that path, and the lesson page's "Watch this lesson" button
  (`WatchLessonLink`) already plays it. No new site UI is needed.
- **Streamable files only:** the MP4's index (the `moov` atom) must come
  before the media data, or the browser downloads the whole file before
  playback.
- **Do not overwrite the six Hash Tables NotebookLM videos.** A chained video
  for a Hash Tables lesson uses the same filename and would silently replace
  them. Until the Stage 1 decision (§11), publishing into those six paths is
  forbidden, and a CI test enforces it (§8).

## 8. Checks and where they run

CI runs only in `web/` (`npm run lint`, `npm test`, `npm run build`). A rule
that must fail CI therefore lives in `web/tests/`, which already reads
repo-root `courses/` and can read repo-root `hyperframes/series/` the same way.
None of the tests below exists yet; phase 1 (§10) builds them.

| Check | Where |
| --- | --- |
| `chain.json` equals the chain derived from the manifest | CI, `web/tests` |
| Every `video-<lesson>.mp4` is a real lesson and faststart | CI |
| Every published chained video has a `handoffs.json` entry with status `published`, and its `hands_off` is identical to the next lesson's `opens_from` | CI |
| The six Hash Tables NotebookLM files are unchanged (pinned by content hash) until the §11 decision | CI |
| Published duration is at most 180 s (read from the MP4 header) | CI |
| Transcription, edge validation, `hyperframes check`, snapshots, the continuity frame gate | Local gate before publishing; CI has no Chrome, ffmpeg or TTS set up |

Every new test must be proven able to fail: introduce the fault, watch the
test fail, restore (CLAUDE.md §2).

## 9. Agent coordination (proposed)

- **One lesson, one owner.** An agent claims a lesson by setting `owner` and
  advancing `status` in `handoffs.json`, and never works a lesson another
  agent owns.
- **Stage plans:** one agent writes a whole stage plan, because handoffs
  depend on their neighbours.
- **Sequential by default.** Parallel Opus agents spiked cost and hit the
  session cap before, and a single long composition agent hit it on the
  Arrays video. Lessons that are not adjacent may run in parallel once the
  plan is approved. Adjacent lessons never run at the same time, because
  they share a handoff and a boundary frame.
- **A video depends on its predecessor's render.** The continuity gate
  compares a video's first frame with the previous video's last frame, so a
  video cannot reach `checked` until the previous video has been rendered.
  Non-adjacent lessons can still be scripted and voiced in parallel.
- **Resuming:** when an agent is cut off, the next agent resumes from the
  project's files and its recorded status, not from memory. Re-read the
  project before continuing it.
- **Reporting:** state what was verified and how, and name anything not
  verified (CLAUDE.md §6).

## 10. Rollout

| Phase | Work | Exit condition |
| --- | --- | --- |
| 0 | §3 prerequisites | Pipeline committed; key available in the environment |
| 1 | Series system: `chain.json` generator, `handoffs.json` schema, the §8 CI tests, and the §6 pipeline generalised into `series/shared/` | Tests pass, and each is proven able to fail |
| 2 | Stage 0 plan (19 lessons) | Owner approves `stage-0/PLAN.md` |
| 3 | **Pilot:** `course-introduction`. Choose the learner voice, tune turn and scene gaps, choose the learner cue, set the continuity threshold | Owner approves the video and the recorded parameters; §6 changes from proposed to approved |
| 4 | The remaining 18 Stage 0 videos | All 19 published and passing §6.6 and §8 |
| 5 | Stage 1, starting with the §11 decisions | Stage 1 plan approved |

## 11. Open decisions (owner)

1. **Hash Tables at Stage 1.** How the chained video and the NotebookLM video
   share each of the six lesson pages: for example, the chained video in
   "Watch this lesson" and the NotebookLM video as a secondary link. Nothing
   before Stage 1 depends on this.
2. **The Arrays module intro.** It stays outside the chain as a module-page
   trailer. Once the `arrays/contiguous-memory` lesson video exists, the two
   overlap. Decide at Stage 1 whether the trailer stays, is re-cut, or is
   retired.
3. **The learner voice.** Chosen in the pilot (phase 3).

## 12. Out of scope

Problem and practice lesson videos; the Next.js course (disabled); captions
and subtitles; vertical and social cuts; other languages.
