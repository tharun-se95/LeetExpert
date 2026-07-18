# Hand-off: Part 1 video rebuild (word-synced scenes)

Context window is full — this doc is for the next agent picking this up cold.

## Where this fits

`/Users/tharunk/DSA` is the DSA Pattern Handbook repo: markdown handbook (parts
1–5) + a Next.js reader app in `web/` + this Remotion video project in
`video/`. This doc is only about `video/`. The handbook-writing and web-app
work earlier in the session are done and not in scope here.

## The ask, in order

1. User asked for 3 short narrated videos covering Part 1 Foundations
   (3 chapters). Built with Remotion + ElevenLabs voiceover.
2. User called the first attempt "boring... boring again", static, no motion
   graphics. Asked for two custom Claude Skills to fix this:
   `.claude/skills/creative-unlock/SKILL.md` and
   `.claude/skills/scene-composition/SKILL.md` (already written, already
   installed as project skills, already load correctly via the `Skill` tool —
   confirmed working). Core rule of both: **never caption the sentence, find
   the visual idea behind it.** Read these two files before making any scene
   decisions — they are the spec for what "good" looks like here.
3. First rebuild (all 3 chapters, ~6-8s static holds per beat) was still
   called "absolutely crap" — problem diagnosed as: too few scenes, too slow,
   proportional-word-count timing instead of real cuts.
4. **Current work**: rebuilding chapter 1 ONLY as a 21-scene fast-paced shot
   list (2-4s per scene, hard cuts, real motion). This landed much better —
   user said "The visuals have gotten much better" — but flagged that
   **audio/visual sync was still messy** because scene timing was computed
   from *word-count proportions* of each narration sentence, not the actual
   spoken audio. Chapters 2 and 3 have NOT been rebuilt with this approach yet
   — they still have the old, more static scene system from before step 3,
   and `Root.tsx` currently only registers `ch01` (ch02/ch03 imports were
   deliberately dropped from Root.tsx during the "start fresh" rebuild).

## Exact current state (mid-task)

Fixing the sync problem with **ElevenLabs Scribe** (speech-to-text with
word-level timestamps) so scene cuts land on the literal audio instead of an
estimate. This is IN PROGRESS, not done:

1. ✅ `video/generate-transcript.ts` written and working. Run with:
   ```bash
   cd video && set -a && source .env.local && set +a && node --experimental-strip-types generate-transcript.ts
   ```
   It transcribes `public/voiceover/ch01-solving-problems.mp3` via Scribe,
   then for each of the 21 scenes searches the transcript for a short anchor
   phrase (hardcoded in the `CHAPTERS[0].anchors` array in that file) using
   **character-stream matching** (not word-by-word — Scribe sometimes merges
   "hash map" → "HashMap" etc., so matching is done by concatenating
   normalized characters, not aligning word boundaries). Throws loudly with
   context if an anchor isn't found.
2. ✅ Ran successfully. Output written to:
   - `video/src/compositions/ch01/timing.json` — `{ audioEndSec: number,
     sceneStartSec: number[] }`, one start time per scene, index-aligned with
     the `SCENES` array in `ch01/index.tsx`.
   - `video/src/compositions/ch01/transcript.json` — full Scribe word list,
     kept for debugging/future anchors.
3. ✅ `tsconfig.json` updated with `"resolveJsonModule": true` so the JSON can
   be imported directly.
4. ✅ **DONE**: `ch01/index.tsx` now imports `timing.json` directly.
   `layoutScenes()` converts each `sceneStartSec[i]` to
   `INTRO_FRAMES + Math.round(sceneStartSec[i] * FPS)`, each scene's
   duration is the gap to the next scene's start frame (last scene ends at
   `INTRO_FRAMES + Math.round(audioEndSec * FPS)`). The old `BEATS` array,
   `timeBeats`/`layoutScenes(beats)` weight system, and the `beat`/`weight`
   fields on `SCENES` are gone — `SCENES` is now a flat ordered array of
   components, index-aligned 1:1 with `timing.sceneStartSec`. `WipeFlash`
   calls now reference `windows[3]`, `windows[10]`, `windows[16]`,
   `windows[20]` (same semantic cut points as before: bottleneck reveal,
   "let's try it" Two Sum intro, "here's the trap" alarm, final zoom out).
   `generate-transcript.ts` was added to `tsconfig.json`'s `exclude` (same
   treatment as `generate-voiceover.ts` — it's a standalone script run via
   `node --experimental-strip-types`, not part of the Remotion app build).
   Verified: `npx tsc --noEmit` and `npx eslint src` both clean; stills at
   frames 20, 1148, 1170, 1832, 2304 (scene-boundary and mid-scene frames
   computed straight from `timing.json`, not re-guessed) render correctly —
   e.g. frame 1170 shows the "TWO SUM" slam stamp already on screen, matching
   where the narration actually says "Let's try it. Two Sum."

**Immediate next step for whoever picks this up**: do a full render and a
real watch-through (not just stills) to confirm sync holds across the whole
21-scene cut, then get user sign-off on ch01 before touching ch02/ch03:
```bash
npx remotion render ch01-solving-problems out/ch01-solving-problems.mp4
```

## Architecture notes (so you don't relitigate these)

- **Scene = component + Sequence.** Every scene in ch01 is its own React
  component (`S01TitleStorm`, `S02FreezeLock`, ... `S21ZoomOut`) living in
  `video/src/compositions/ch01/scenes-intro.tsx`, `scenes-method.tsx`,
  `scenes-twosum.tsx`, `scenes-trap.tsx`. Each is mounted in its own
  `<Sequence from={...} durationInFrames={...}>`, so each component's
  `useCurrentFrame()` starts at 0 locally — no cross-scene frame math inside
  components. Shared primitives (tiles, stamps, shake, crosshair, pipeline
  diagram) live in `video/src/compositions/ch01/bits.tsx`.
- **Cinematic look system** (dark grid bg, particles, glass panels, gradient
  accent, spring-based motion) lives in `video/src/lib/cinematic.tsx` and
  `video/src/lib/theme.ts` — shared across all chapters, don't rebuild it.
- **Voiceover** was already generated once via `video/generate-voiceover.ts`
  (ElevenLabs TTS, voice "Sarah" `EXAVITQu4vr4xnSDxMaL`) — do NOT regenerate
  unless the script text changes, since Scribe timing is now keyed to the
  exact existing mp3 files in `public/voiceover/`.
- **`.env.local`** in `video/` holds `ELEVENLABS_API_KEY`, gitignored. It's
  already there and working — don't ask the user for it again.
- Node's `--experimental-strip-types` is required to run the `.ts` scripts
  directly (Node 22 on this machine). `import.meta.dirname` is used instead
  of `__dirname` since these scripts run as ESM.

## After ch01 sync is fixed

1. Get user sign-off on ch01 (watch/spot-check) before touching ch02/ch03.
2. Ch02 and ch03 need the **same treatment from scratch**: write a real
   20ish-scene shot list per the two skills (creative-unlock +
   scene-composition), build scene components, wire up via Scribe timing
   from the start (skip the proportional-timing intermediate step entirely
   this time — go straight to the `generate-transcript.ts` approach, just
   add a second/third entry to the `CHAPTERS` array in that script with each
   chapter's own anchor list once the scene list is designed).
3. Re-add `ch02`/`ch03` composition registration to `video/src/Root.tsx` once
   they're rebuilt (currently only `ch01` is registered — this was
   intentional mid-rebuild, not a bug).
4. Final step across all 3: `npx eslint src` + `npx tsc --noEmit` clean, spot
   render checks, then `npx remotion render` all three to `video/out/`.

## Don't re-litigate

- Don't reach for `@remotion/effects` / `@remotion/light-leaks` /
  `@remotion/starburst` — deliberately skipped, they need WebGL renderer
  config (`Config.setChromiumOpenGlRenderer('angle')`) which adds render
  risk for marginal gain over the CSS/SVG approach already in use.
- Don't use TransitionSeries for scene cuts — tried, reverted. It requires
  restructuring every scene's frame references to be TransitionSeries-local
  instead of absolute-timeline, which fights the "each scene owns its own
  Sequence" architecture above. Hard cuts (just adjacent Sequences) plus the
  occasional `WipeFlash` overlay component (`video/src/lib/wipe.tsx`) achieve
  the same visual punch with far less risk.
- Don't hand-write proportional/word-count timing again — that's the exact
  thing being replaced right now. Scribe + anchor phrases is the answer.
