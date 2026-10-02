# Big-O in 60 seconds — animated carousel

- **Archetype:** concept explainer (carousel)
- **Source lesson:** `courses/dsa/big-o/common-complexity-classes.md`
- **Family:** big-o
- **Format:** Carousel of 7 video slides, 1080×1350, 90s total, Hope narration per slide (one v3 take split at sentence breaks); post `cover.png` as slide 1
- **Status:** posted to @leetexpert 2026-10-01: https://www.instagram.com/p/Dd7BJ6OionQ/. Before that: drafted (not posted)
- **Media:** `slide1.mp4`–`slide7.mp4`, `cover.png`, `preview.mp4` (all slides joined)

## Hook (first line — all most people read)

Every coding interview eventually hits you with the same question: what's the Big O of this?

## Caption

Big-O isn't about seconds. It's about what happens when your input doubles. 📈

O(1): same work. O(n): 2× the work. O(n²): 4× the work.

That last one is the nested loop your AI loves to write. It passes the small tests, then crawls on real data.

Which one shows up most in your code? 👇

Save this for your next interview. Learn it properly on leetExpert, link in bio.

## Hashtags

#bigonotation #timecomplexity #algorithms #computerscience #codinginterview

## Alt text

Seven animated slides: a hash lookup jumps to its bucket in one step (O(1)), a scanner touches each item (O(n)), an 8×8 pair grid fills to 28 checks then 499,999,500,000 for a million numbers (O(n²)), three growth curves show same / 2× / 4× when n doubles, and a cue/cost/target/trap card closes.

## Verified facts

Pair counts: 1,000 → 499,500; 1,000,000 → 499,999,500,000; 8 → 28. Timed nested loop at 1,000/2,000/4,000 numbers: ~4× per doubling (0.020s → 0.073s → 0.299s, our run).

## Sources

`gen3.py` (HyperFrames composition generator), `style.css`, `split3.py` (splits the take per slide via Scribe), `timing3.json`, `vo/` (per-slide narration + word timings).

Re-render: see `marketing/reels-pipeline/README.md` (HyperFrames 0.8.77; add `gsap.min.js` and the Space Grotesk / Space Mono TTFs next to the generator first).

## Open items

Spoken brand line “leetExpert, the interactive DSA course” still to add (stand-alone rule).

<sub>Agent: Claude (claude.ai chat, Claude Opus 5.5) · project "LeetExpert" · branch `feat/66-instagram-reels-pipeline` · 2026-09-28 · issue #66</sub>
