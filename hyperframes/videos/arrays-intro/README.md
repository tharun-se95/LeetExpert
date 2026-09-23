# arrays-intro — Arrays module explainer

82.7s, 1920×1080, 30fps. Built with HyperFrames v0.8.35 through a staged
agent pipeline. Every stage writes an artifact the next stage reads, so any
stage can be re-run without redoing the ones before it.

## Pipeline

| # | Stage | Artifact | How |
| --- | --- | --- | --- |
| 1 | Intent | `BRIEF.md` | Routed via `/hyperframes` → `faceless-explainer` |
| 2 | Script & storyboard | `SCRIPT.md`, `STORYBOARD.md` | Script agent — every claim cites its lesson |
| 3 | Voiceover | `audio/line-*.mp3`, `audio/manifest.json` | `build-vo.py` (ElevenLabs) |
| 4 | Timeline | `audio/narration.m4a`, `scenes.json`, `timing.js`, HTML timing attributes | `build-timeline.py` — the only writer of timing |
| 5 | Composition | `index.html`, `compositions/s1–s8.html` | Composition agent |
| 6 | Verify & render | `renders/arrays-intro.mp4` | `check`, `snapshot`, `render` |
| 7 | Publish | `web/public/media/arrays/intro.mp4` | copy the verified render; the module page shows it via `getModuleVideo` |

## Rebuild

```bash
# 3 — voiceover (key from the environment only; never write it to a file)
ELEVENLABS_API_KEY=… python3 videos/arrays-intro/build-vo.py

# 4 — assemble narration and derive scene boundaries from MEASURED clip lengths
python3 videos/arrays-intro/build-timeline.py

# 6 — gate, inspect, render (run from hyperframes/)
npx hyperframes check videos/arrays-intro
npx hyperframes snapshot videos/arrays-intro --at 8.5,17.8,27.5,30,38.3,50,65.5,74.6,85.2
npx hyperframes render videos/arrays-intro --workers 1 --quality standard --strict \
  -o videos/arrays-intro/renders/arrays-intro.mp4
```

To publish a new render to the site (run from the repo root):

```bash
cp hyperframes/videos/arrays-intro/renders/arrays-intro.mp4 web/public/media/arrays/intro.mp4
```

`web/tests/moduleVideo.test.ts` fails CI if the file sits in a folder that is not
a real module slug, or if it is not faststart (the `moov` index must precede the
media data, or browsers download the whole file before playback starts).

If you change `SCRIPT.md`, re-run stages 3 **and** 4. Stage 4 is the single
writer of timing: it rewrites every scene's start/duration attribute in
`index.html` and `compositions/sN.html`, and generates `timing.js` (scene slots
plus word timings from the ElevenLabs alignment). **No timing number is copied by
hand.** Every scene beat is anchored to a spoken word — `WA(k, offset)` = word
`k`'s start in the current take plus a fixed offset — so a regenerated voiceover
moves the animation with the words instead of desyncing it.

Two guards make a bad regeneration fail `check` instead of shipping:
- **fit** — `LE.assertFits(n, tl)` throws if a scene's choreography outruns its
  narration slot (verified: shrinking scene 6's slot to 5s fails with
  "choreography runs 12.21s but its narration slot is 5.00s");
- **word count** — each scene throws if its take has a different number of
  words than its anchors expect, since a changed script means every anchor would
  name the wrong word (verified: dropping one word fails "expected 34 anchored
  words, got 33").

## Decisions and traps worth keeping

- **No `next_text`. This caused the audible glitches in the first render.**
  Request stitching's `next_text` assumes clips are joined back to back: the
  model may begin the *next* utterance (a breath, the next word's attack) in a
  clip's final milliseconds. This build inserts silence between scenes, so that
  sliced-off onset sat exposed against dead air — 4 of 8 clips, heard at 9.8s,
  41.3s, 51.3s and 75.8s. Proven by A/B: the same request reproduced it; the
  request without `next_text` ended clean. `previous_text` is kept for tone — it
  produced clean starts in 4/4 trials, and one hot start came from a request
  *without* it, so hot starts are random rather than caused by stitching.
- **Every clip is edge-validated, every build** (`audiocheck.py`): the first and
  last 10 ms must be quieter than −60 dB. `build-vo.py` regenerates a failing
  clip (up to 4 attempts), and `build-timeline.py` refuses to assemble one —
  verified by pointing it at the old clips, which it rejected (5 of 8).
- **The audio was verified by transcription, not assumed.** Whisper's output for
  Line 3 matched the script word for word.
- **Narration is joined with the concat *filter*, not the concat demuxer.** The
  demuxer needs identical codecs and fails when WAV silence sits between MP3 clips.
- **Every cell starts at `data-state="default"`.** Without an explicit starting
  state, seeking backwards left later states in place, so cells lit before their
  beat. Preview hid it, and a parallel render would have shipped it.
- **Traces are computed in the composition, not typed.** The Scene 6 doubling
  ledger simulates the appends and throws if total copies are not below 2n. The
  Scene 7 compaction runs the keep-nonzero loop on the lesson's own `0 1 0 3 12`
  and asserts the prefix is `1 3 12`.
- **Accent text is `--mark`, never `--accent`** (the product's own rule, now
  that `assets/brand.css` is generated from the app). The family accent clears
  only the 3:1 UI floor, so it fills rules, calipers and the token; the
  highlighted tokens in the code panel use the steel `--mark`. This replaced a
  composition-local lightened teal (`--accent-ink`), which existed only because
  brand.css had no text sibling.
- **Render with `--workers 1` on this machine.** Each worker is a separate Chrome
  instance at about 256 MB, and 2 workers thrashed at ~4 GB free.

## Source of truth

Claims come from `courses/dsa/arrays/{contiguous-memory, dynamic-arrays,
in-place-foundations, stable-compaction-cyclic-placement}.md`. The module counts
(4 concept, 5 problems, 1 practice) were counted from `web/src/lib/course/manifest.ts`.
The module art is `web/public/media/module-art/arrays-light.webp`, which is actually
the dark plate: the light/dark filenames are swapped, and that is tracked separately.
