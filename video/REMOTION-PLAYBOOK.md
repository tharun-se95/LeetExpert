# Remotion + word-level-synced narrated video playbook

A portable writeup of the process, architecture, and lessons learned
building narrated motion-graphic videos with Remotion, ElevenLabs
(voice + speech-to-text), and word-level audio sync. Written to be copied
into other projects, not tied to this repo's specific content.

Three real videos were built with this process (see `src/compositions/`:
`ch01`, `family7`, `family3-sorting`) — this is the distilled result of
what worked, what didn't, and why.

---

## 1. The stack

- **[Remotion](https://remotion.dev)** — React components rendered frame-by-frame to video. Everything is code: no timeline GUI.
- **ElevenLabs Text-to-Speech** — generates the narration `.mp3` from a script file.
- **ElevenLabs Scribe** (speech-to-text) — transcribes that *same* `.mp3` back out with word-level timestamps. This is the key trick: don't estimate timing from word counts, transcribe the real audio.
- **`@remotion/google-fonts`** — load real webfonts (no network dependency at render time, fonts are bundled).
- **`@remotion/media`** — `<Audio>` component for the voiceover track.

Nothing here is exotic. The entire system is: generate audio → transcribe
it → look up exact timestamps for the phrases you care about → drive
React component mount/unmount timing off those timestamps.

---

## 2. The core pipeline (word-level sync)

This is the part worth stealing wholesale.

### Step 1 — Write the script to full depth, first pass

Don't write a rushed, mechanical script and plan to fix it later. A script
that only describes *what* happens (mechanics) without explaining *why*
(hook, motivation, the "click" moment) produces a worse video than any
visual bug will — script quality is at least as important as animation
quality. A good structure for a single-concept explainer:

1. **Hook** — why does this matter / what's the pain point.
2. **Concrete example** — a specific problem, not an abstraction.
3. **Naive approach** — with real numbers (e.g. "45 pairs... 50 million
   pairs"), so the cost is felt, not just stated.
4. **The click** — the actual insight, stated plainly.
5. **Generalization** — 2-3 other places the same idea applies, so it
   doesn't feel like a one-off trick.
6. **Common pitfalls** — where this gets misapplied or confused with a
   neighboring concept.
7. **Closing takeaway** — one sentence, memorable.

If narrating expressively matters, ElevenLabs' `eleven_v3` model accepts
inline **audio tags** directly in the script text — `[excited]`,
`[curious]`, `[calm]`, `[sighs]`, `[playfully]`, etc. — that steer delivery
without SSML. Use them sparingly (5-8 per ~300-word script, at real
emotional beats), not per-sentence.

### Step 2 — Decide scene-cut density *while writing the script*, not after

Pick short, exact phrases from the script — 3-6 words, unique substrings —
that will become **scene-cut anchors**. Do this at the density you actually
want in the final video (roughly one anchor every 2-4 seconds of narration
for a fast-paced explainer), not a coarse first pass you'll split later.
Splitting anchors after the fact means re-running transcription and
rebuilding every scene downstream of the split — a full extra round trip.

A narration sentence like:

> "Ten intervals, that's forty five pairs. Ten thousand intervals, that's
> fifty million, and most of those pairs never even touch."

...might become three separate scene anchors: `"ten intervals thats forty
five"`, `"ten thousand intervals thats fifty million"`, and a later one for
`"most of those pairs never even touch"` if that clause needs its own beat.

### Step 3 — Generate the voiceover

```ts
const response = await fetch(
  `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
  {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text,                                  // the full script, including [audio tags]
      model_id: "eleven_v3",                 // or "eleven_multilingual_v2" for a steadier, less tagged read
      voice_settings: { stability: 0.3, use_speaker_boost: true },
    }),
  },
);
```

Notes:
- `eleven_v3` trades away fine-grained `similarity_boost`/speed control for
  the audio-tag system and a much wider expressive range. Lower `stability`
  (~0.3) biases toward the more emotionally varied end of its range.
- `eleven_multilingual_v2` with `{ stability: 0.5, similarity_boost: 0.75,
  style: 0.35 }` is the steadier, more "professional narrator" default if
  expressive delivery isn't the goal.
- **Only regenerate a chapter's audio if the script text changes.**
  Word-level timing is keyed to the exact existing `.mp3` — regenerating it
  casually invalidates every downstream timing file for that chapter.

### Step 4 — Transcribe that exact audio file with word-level timestamps

```ts
const form = new FormData();
form.append("file", new Blob([buf], { type: "audio/mpeg" }), filename);
form.append("model_id", "scribe_v1");
form.append("timestamps_granularity", "word");

const response = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
  method: "POST",
  headers: { "xi-api-key": apiKey },
  body: form,
});
// response.words: [{ text, type: "word" | "spacing" | "audio_event", start, end }]
```

Save the full word list (`transcript.json`) alongside the derived timing —
if a later pass needs finer-grained anchors, you can re-derive timing
**locally from the saved transcript**, with zero additional API calls.

### Step 5 — Match each anchor phrase against the transcript

Anchors are matched via a **normalized character-stream search**, not
word-by-word — this survives STT quirks like "hash map" → "HashMap" or the
reverse.

```ts
function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function findAnchorStart(words: ScribeWord[], anchor: string, searchFrom: number): number {
  const target = normalize(anchor);
  for (let i = searchFrom; i < words.length; i++) {
    let acc = "";
    for (let j = i; j < words.length && acc.length < target.length; j++) {
      acc += normalize(words[j].text);
    }
    if (acc.startsWith(target)) return i;
  }
  return -1; // fail LOUDLY — never silently fall back to a guess
}
```

Walk the anchor list in order with a moving `cursor` (each match advances
the cursor past itself), so repeated words earlier in the script can't
accidentally match a later anchor. If an anchor isn't found, **throw**, with
the surrounding transcript context in the error message — never silently
drift back to an estimate.

Output shape (`timing.json`):

```json
{
  "audioEndSec": 110.9,
  "sceneStartSec": [0, 4.6, 8.46, 12.48, ...]
}
```

One entry per scene, index-aligned with the shot list. `null` anchors mean
"this scene starts at the top of the audio" (used for the very first
scene).

### Step 6 — Convert seconds to frames in the composition

```ts
const INTRO_FRAMES = 20;  // small pre-roll before audio starts
const FPS = 30;

function layoutScenes(timing: Timing, scenes: React.FC[]) {
  const frames = timing.sceneStartSec.map((s) => INTRO_FRAMES + Math.round(s * FPS));
  const audioEndFrame = INTRO_FRAMES + Math.round(timing.audioEndSec * FPS);
  return scenes.map((Comp, i) => ({
    from: frames[i],
    dur: (i === scenes.length - 1 ? audioEndFrame : frames[i + 1]) - frames[i],
    Comp,
  }));
}
```

Each scene mounts in its own `<Sequence from={from} durationInFrames={dur}>`
— components call `useCurrentFrame()` and get a value starting at 0 *within
their own Sequence*, so no scene ever needs to know the absolute timeline
position. This is what makes scenes independently writable/testable.

### Step 7 — Make the composition's duration follow the real audio, not a guess

```ts
export const calculateMetadata: CalculateMetadataFunction = async () => {
  const durationInSeconds = await getAudioDuration(AUDIO_SRC);
  return { durationInFrames: INTRO_FRAMES + Math.ceil(durationInSeconds * FPS) + OUTRO_FRAMES };
};
```

Never hardcode total video length — it drifts the moment the script or
voice settings change.

---

## 3. Sync-architecture gotchas

- **Scene duration should stay in a 2-4 second band.** Longer scenes (5s+)
  need internal staged sub-beats or continuous motion, or they read as
  "dead air" while the narration keeps going but nothing on screen moves.
  If a scene comes out long because a particular sentence was narrated
  slowly, split it into two anchors rather than trying to keep one scene
  "busy" for 6+ seconds.
- **TTS pacing is not uniform.** The same word count can render at very
  different speeds depending on sentence complexity and (with `eleven_v3`)
  the emotional tag applied. Don't assume even pacing when picking anchor
  density — check the actual `sceneStartSec` gaps after transcription and
  split anywhere that's much longer than its neighbors.
- **When re-anchoring an existing chapter**, don't call the Scribe API
  again — the saved `transcript.json` already has every word's timestamp.
  Write a small local script that re-runs the anchor-matching function
  against the saved JSON.
- **When running a shared transcription script across many chapters**,
  temporarily narrow it to just the chapter you're re-processing before
  running (then restore the full list) — otherwise you re-transcribe (and
  re-bill) chapters that didn't change.

---

## 4. Motion-graphics quality bar

- **Never caption the literal narration sentence on screen.** Find the
  *visual idea* behind the line and build that instead. Text on screen
  should be rare — 1-4 word labels, a number, a formula — not a
  restatement of what's being said. (If your project has "don't caption
  the sentence" as an explicit rule, treat it as load-bearing; it's the
  single biggest lever between "looks like animated subtitles" and "looks
  like a real motion graphic.")
- **Many short, hard-cut scenes beat few long ones.** 2-4 second scenes
  with a real "hit" on arrival (spring overshoot, a slam/snap, a brief
  screen shake, a hard color-flash cut between scenes) read as premium and
  energetic. Slow fades and long holds read as a slideshow.
- **One consistent visual system per video.** Background treatment, type
  system, color usage, and motion primitives (how things pop in, how cuts
  punctuate) should be defined once in a small shared lib and reused by
  every scene — not re-invented ad hoc per scene. This is also what makes
  a second video fast to build: reuse the lib, write new scene content.
  A shared lib usually splits into: a **theme** file (palette constants),
  a **fonts** file (webfont loaders), a **visual-system** file (background,
  card/panel primitives, stamp/tag/label components, transition/flash
  helpers), and a per-video **bits** file (content-specific shared pieces:
  the specific icons, the specific data being visualized).
- **One dominant color per structure/section**, not five accent colors
  fighting in one frame. Reserve extra accent colors for meanings that
  repeat *across* the whole video (a "current/active" indicator, a
  complexity-tier color) rather than decorating individual scenes with
  whichever color looks nice.

---

## 5. Verification — do this *before* declaring a render done

1. **Self-QA stills pass.** Render a still frame at every scene's start
   (and a mid-frame for any scene over ~4s) and actually look at the
   images. This catches broken layouts, occluded/overlapping text, and
   animations that never visibly move — all things a full render will
   "succeed" at producing while still being wrong.
2. **A full render, not just stills**, is the only way to catch some
   classes of bug: transition timing between scenes, whether a "continuous
   motion" scene actually looks continuous, and (if using any WebGL/canvas
   layer) whether the renderer stays stable across hundreds of frames
   instead of just one.
3. Only after both pass, treat the video as done.

---

## 6. Process / speed lessons

- The full pipeline (script → voice → transcribe → build scenes → render)
  can reliably be **one pass** if scene density and script depth are both
  decided *while writing the script*, not discovered after a rough first
  attempt. Redo cycles (re-anchoring, rebuilding scenes because pacing was
  wrong, a second script pass because it was rushed) are the actual time
  cost — not the technical steps themselves.
- Reuse existing infrastructure (voice settings, the shared visual lib, the
  transcription script) rather than re-deriving it per video. The slow
  part is creative iteration, not the mechanical pipeline.
- For any **iteration loop** on visual tuning (layout, timing, color, a
  lighting rig, anything you need to look at repeatedly while adjusting
  values) — run a live dev server (`remotion studio`) instead of
  re-rendering a still image on every single tweak. A still-image render
  re-bundles the whole project from scratch every call; a dev server
  bundles once and hot-reloads on save, so each check is seconds instead
  of tens of seconds.
- **Don't apply "production discipline" (decide everything up front,
  gather references before starting) to open-ended experimentation.** If
  the goal is "see what's possible," blind trial and error *is* the
  process — forcing a reference-first, plan-everything approach onto
  exploratory work just adds friction without the payoff it has for a
  repeatable production task. Read which mode you're in before optimizing
  for speed.

---

## 7. Things that were tried and abandoned (don't re-litigate)

- **`TransitionSeries`** (Remotion's built-in transition helper) for scene
  cuts — it requires every scene's internal frame references to be
  relative to the TransitionSeries, not the absolute timeline, which
  fights an architecture where "each scene owns its own independent
  Sequence" (needed for the word-sync approach above). Plain adjacent
  `<Sequence>`s plus an occasional hard-cut flash/wipe overlay component
  achieve the same visual punch with far less structural risk.
- **`@remotion/effects` / light-leak / starburst WebGL packages** — need
  `Config.setChromiumOpenGlRenderer('angle')` to render in headless
  Chromium, which is extra render-fragility surface for a marginal visual
  gain over CSS/SVG-based approaches.
- **Real 3D via `@remotion/three`** — this *does* work technically (with
  the same `angle` renderer config) and can look genuinely more
  dimensional than CSS-faked depth — real bevels, real specular
  highlights, real perspective falloff. But: camera framing must always be
  explicitly set (the default camera doesn't frame content usefully), 3D
  text (`drei`'s `<Text>`) is unreliable — depends on a network font fetch
  that's a real risk in headless rendering — so labels must be 2D HTML
  overlays hand-calibrated against the 3D scene's screen projection, and
  getting lighting right (enough fill light that inactive elements aren't
  pure black, but not so many point lights that glossy surfaces get a
  "glittery" multi-highlight look) took 6+ iteration rounds per scene type.
  Worth it only if the depth genuinely matters to the concept (e.g.,
  mapping literal recursion depth to camera Z-depth) and the team is
  willing to pay the WebGL fragility + tuning cost. For most content, 2D
  CSS/SVG is faster to iterate on and has none of the render-stability
  risk.
- **Proportional/word-count timing** (estimating scene cuts from narration
  word counts instead of transcribing the real audio) — this is the
  mistake the whole word-level-sync pipeline above exists to avoid. It
  drifts, sometimes badly, especially with expressive TTS models where
  pacing varies a lot sentence to sentence.

---

## 8. Minimal file layout

```
video/
  generate-voiceover.ts       # script text -> mp3 via ElevenLabs TTS
  generate-transcript.ts      # mp3 -> word-level transcript -> timing.json per chapter
  scripts/<chapter>.txt       # narration scripts, one per video
  public/voiceover/<chapter>.mp3
  src/
    lib/
      theme.ts                # palette constants
      fonts.ts                # webfont loaders (@remotion/google-fonts)
      <visual-system>.tsx     # shared background/card/label/transition primitives
    compositions/<chapter>/
      index.tsx                # Sequence wiring: timing.json -> scene layout
      bits.tsx                 # chapter-specific shared visual pieces
      scenes-*.tsx              # the actual scene components
      timing.json               # generated — sceneStartSec[] + audioEndSec
      transcript.json           # generated — full word-level Scribe output
    Root.tsx                    # registers every <Composition>
```
