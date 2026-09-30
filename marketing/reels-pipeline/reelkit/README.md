# reelkit: the shared reel engine

One copy of what every leetExpert reel needs, so reels don't each carry a
450-line engine that drifts from the others. The reels from `2026-09-29-anagram-tally`
on are built on it. The gift-card re-cut (#119) predates it and still has its own engine.

| File | What it is |
|---|---|
| `reel.py` | `Reel`: word anchors (`anchor`, `at`), seek-safe tracks (`k`, `init`, `show`, `pop`, `swap`, `spread`), tutor stills, captions, brand lockup, the **code walkthrough** (`code`), and `write()` |
| `base.css` | Chrome: fonts, grid background, top bar, panels, code card, cue card, lockup, tutor and caption zones |
| `kiticons.py` | Icons every reel reuses: interview mic, challenge bubble, word-game tile, `cue_card` |
| `prep.sh` | Copies tutor stills, fonts, GSAP and the HyperFrames config into a reel's `sources/` (git-ignored there) |
| `narrate.py` | Hope TTS + Scribe word timings → `vo.mp3` + `words.json` (needs `ELEVENLABS_API_KEY` and network access to api.elevenlabs.io) |
| `respell.py` | Aligns Scribe's words to `script.txt` so captions and anchors use the script's spelling (Scribe hears "lo" as "Low", "leetExpert" as "Leet Expert", "hash map" as "HashMap"); `narrate.py` runs it, and it reruns safely on an existing `words.json` |
| `est_words.py` | Stand-in `words.json` from `script.txt`, for a silent preview before the take exists |

## A reel package

```
marketing/instagram/<date>-<slug>/
  post.md                 hook, caption, alt text, verified facts, status
  sources/
    script.txt            the narration, one paragraph
    code/                 the code the reel shows + its twin in the other language
    verify.py, verify.mjs every claim recomputed in both runtimes; exits non-zero on drift
    gen.py                scenes: anchors, markup, tracks (imports reel.py)
    icons.py, style.css   this reel's illustrations and scene styles
```

Build, from `sources/`:

```bash
K=../../../reels-pipeline/reelkit
bash $K/prep.sh
python3 $K/est_words.py          # silent preview, or: python3 $K/narrate.py for the real take
PYTHONDONTWRITEBYTECODE=1 python3 verify.py && node verify.mjs
python3 gen.py
npx hyperframes@0.8.77 check     # 0 errors
npx hyperframes@0.8.77 render -o renders/preview.mp4   # or ../reel.mp4 with the take
```

`PYTHONDONTWRITEBYTECODE` matters: when you plant a fault in `code/*.py` to prove the
verifier fails, a `__pycache__` written in the same second can survive the restore, and
the verifier then keeps testing the broken copy.

## Rules the kit enforces or expects

- **Read respell's spelling changes.** A homophone ("Write" → "Right") is Scribe mishearing; a
  different word ("That" → "Best") can mean the take itself said the wrong word. Cut that
  span from `vo.mp3`, transcribe it alone, and re-record if the take is wrong: the caption
  would otherwise show a word the narrator never said.

- **The code on screen is the code that ran.** `R.code()` renders a string; pass it
  `Path("code/x.py").read_text()`, the same file `verify.py` imports. Never retype code in `gen.py`.
- **Explain the code** (owner, 2026-09-29): every reel whose topic has code walks through
  it with `R.code(...)`. Each step highlights lines and shows a one-line note, anchored to
  the words that explain those lines.
- One track per element: `write()` fails on overlapping keyframes, and `close()` fails if
  the anchors run out of narrative order.
- Add the lockup, stills and captions last. DOM order is paint order, so the tutor and
  captions sit above the scenes.
- The final half second resets to frame 1, so the reel loops. Keep frame 1 fully drawn.
