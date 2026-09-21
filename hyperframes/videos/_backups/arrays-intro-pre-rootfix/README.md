# arrays-intro — Arrays module explainer

87.8s, 1920×1080, 30fps. Built with HyperFrames v0.8.35 through a staged
agent pipeline. Every stage writes an artifact the next stage reads, so any
stage can be re-run without redoing the ones before it.

## Pipeline

| # | Stage | Artifact | How |
| --- | --- | --- | --- |
| 1 | Intent | `BRIEF.md` | Routed via `/hyperframes` → `faceless-explainer` |
| 2 | Script & storyboard | `SCRIPT.md`, `STORYBOARD.md` | Script agent — every claim cites its lesson |
| 3 | Voiceover | `audio/line-*.mp3`, `audio/manifest.json` | `build-vo.py` (ElevenLabs) |
| 4 | Timeline | `audio/narration.m4a`, `scenes.json` | `build-timeline.py` |
| 5 | Composition | `index.html`, `compositions/s1–s8.html` | Composition agent |
| 6 | Verify & render | `renders/arrays-intro.mp4` | `check`, `snapshot`, `render` |

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

If you change `SCRIPT.md`, re-run stages 3 **and** 4: the composition's scene
starts (`S[]` in `index.html`) come from `scenes.json`, which comes from the real
audio durations, not from the script's word-count estimates. Those estimates were
off by up to 22% per scene (Scene 7: estimated 12s, spoken 9.78s).

## Decisions and traps worth keeping

- **Voiceover is generated per scene with request stitching** (`previous_text` /
  `next_text`), so each scene gets an exact measured duration and the prosody
  still carries across the cuts.
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
- **`--accent-ink` (`#29a691`)** is the AA text sibling of the linear-traversal
  accent: `#0A7A6A` is 3.10:1 on the ground (enough for rules, not text), and
  `#29a691` is 5.45:1. It lives in this composition only. Promoting it to
  `assets/brand.css` would mean an AA-verified sibling for all seven families.
- **Render with `--workers 1` on this machine.** Each worker is a separate Chrome
  instance at about 256 MB, and 2 workers thrashed at ~4 GB free.

## Source of truth

Claims come from `courses/dsa/arrays/{contiguous-memory, dynamic-arrays,
in-place-foundations, stable-compaction-cyclic-placement}.md`. The module counts
(4 concept, 5 problems, 1 practice) were counted from `web/src/lib/course/manifest.ts`.
The module art is `web/public/media/module-art/arrays-light.webp`, which is actually
the dark plate: the light/dark filenames are swapped, and that is tracked separately.
