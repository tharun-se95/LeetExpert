# Story kit and highlight covers (#137)

One story a day for the rest of October (Oct 4–31; Oct 1–3 were posted before this existed), each
tied to that day's feed post, and four highlight covers. Frames are 1080×1920.

| Feed post | Story | Next day |
|---|---|---|
| Reel | Quiz sticker: the reel's own "Your turn" challenge, three options | An answer frame |
| Cheatsheet carousel | Poll: "Which trap has cost you a test case?", the sheet's own traps as options | — |
| Reel carousel | Poll: "How do you learn a pattern best?" (Watch the reel / Swipe the carousel) | — |

A frame carries the question and leaves its lower half empty for the sticker. It keeps clear of
the top 250px and the bottom 340px, where Instagram draws its own controls. The sticker's type,
text and options are in `story.md` beside the frames, and in the posting kit page's "Story"
section for that day.

## Nothing new is claimed

- A quiz's question is the reel's caption line ("Your turn: …"). Its answer is in `REELS` with the
  line of the reel's own verifier that asserts it; `storykit.py` fails if that line is gone or
  does not end with the answer, and it runs the verifier (`sources/verify.py` or `verify.mjs`).
- What a question points at ("this list") is shown on the frame and must appear word for word
  in the reel's `post.md`.
- A poll's options are the cheatsheet's trap titles from `../carousel/sheets.json`.
- The other quiz options are only required to differ from the answer.

Not checked: Instagram's length limits for sticker text. A long trap title may need trimming
when the sticker is typed.

## Files

- `storykit.py`: `REELS` (the challenges), `COVERS` (the cover art), the frames and notes.
  Writes `../carousel/build/story-<date>/` and `build/highlight-covers/`, each with a `size`
  file that tells `render.mjs` to shoot 1080×1920, and `marketing/instagram/stories/<date>/story.md`
  and `marketing/instagram/highlights/highlights.md`.
- `../carousel/kit.py` attaches each day's story to its post in `october.json`;
  `../posting-kit/build.py` shows it.

## Build

```bash
python3 storykit.py
cd ../carousel && node render.mjs $(ls build | grep -E '^(story-|highlight-)') && python3 kit.py
PYTHONDONTWRITEBYTECODE=1 python3 check.py
```

If a feed post moves to another day, rerun all three: the stories follow the kit's dates.
The media are not yet assets of the kit artifact, as for the carousels.
