# The coach won't give you the answer (inside leetExpert) (carousel)

- **Account:** leetexpert
- **Archetype:** the reel as a carousel, for people who save rather than watch
- **Source:** the reel `2026-09-30-coach-wont-answer`: its cover, its own frames (captions and tutor off) at the anchors in `sources/slides.json`, and words from its script and caption
- **Format:** Carousel, 9 slides, 1080×1350
- **Plan:** issue #134 (epic #132)
- **Status:** rendered, not scheduled.
- **Media:** `slide1.png`, `slide2.png`, `slide3.png`, `slide4.png`, `slide5.png`, `slide6.png`, `slide7.png`, `slide8.png`, `slide9.png`

## Hook (first line — all most people read)

The coach won't give you the answer. That's the point.

## Caption

I ran a broken Two Sum on leetExpert. The coach didn't fix it. 👀

Draft: for each number, store it in a map, then check if its partner is there.
Run → 2 of 4 tests pass.

The coach names the case that broke:
"two_sum([3, 2, 4], 6) returned [0, 0]; expected [1, 2]. Open Hint 1."

I swapped the pair and ran again. Now case 1 broke too, so it pointed one step further: Hint 2, "check before insert."

Why [0, 0]? At i = 0 we store 3, then ask whether 6 − 3 is in the map. It is: it's the 3 we just stored. So 3 pairs with itself.
Fix: check first, then store. The map now holds only earlier numbers, so a number can never find itself. 4 of 4. ✅

And the coach still says: "I still will not write the code."

In an interview nobody hands you the fix. You get a failing case and reason your way out.

Your turn: with the fix, why does [3, 3] still work? 👇

leetExpert, the interactive DSA course. Link in bio.

## Hashtags

#twosum #leetcode #edtech #learntocode #codinginterview

## Alt text (per slide)

**Slide 1.** The reel's cover: "The coach won't give you the answer. That's the point."

**Slide 2.** The leetExpert practice page for Two Sum (Module 6, Hash Tables), Code tab, with the draft in Python: seen = {}; for i, n in enumerate(nums): seen[n] = i; if target - n in seen: return [seen[target - n], i].

**Slide 3.** The Coach tab, close up. A CASE FAILED note reads: two_sum([3, 2, 4], 6) returned [0, 0]; expected [1, 2]. Open Hint 1 on Explanation for the next authored nudge.

**Slide 4.** The Explanation tab, close up, with Hint 2 open: "one pass, check before insert". For each nums[i], the partner is target − nums[i]; ask the map before inserting nums[i], so its stored index is earlier than i.

**Slide 5.** Python two_sum with the return line highlighted and the note "3 pairs with itself → [0, 0]". Under it nums 3, 2, 4 with target 6, the pointer i on 3, and the map seen holding 3 → 0; it returns [0, 0]: 3 found itself.

**Slide 6.** The fixed two_sum: the check, if target - n in seen: return [seen[target - n], i], now comes before seen[n] = i, which is highlighted. The note reads "Store after, so a number can never find itself"; nums 3, 2, 4 with 2 and 4 lit, seen holding 3 → 0 and 2 → 1, and it returns [1, 2] ✓.

**Slide 7.** The Two Sum page marked Solved, close up on the Coach tab: ALL CASES PASSED. All 4 cases passed. Ask about this lesson's bound or what to take from it — I still will not write the code.

**Slide 8.** A text slide under "Your turn": With the fix, why does [3, 3] still work?

**Slide 9.** Closing slide: every step of this, visualised, in leetExpert, the interactive DSA course. leetexpert.com, link in bio.

## Verified facts

- Every word on a slide is in the reel's `script.txt` or caption (`reelslides.py` fails otherwise), and those are held to the code by the reel's `verify.py` and `verify.mjs`. The frames are the reel's own render at those moments, so the stage shows what the reel's code did.
- `render.mjs` fails if any slide's text leaves its frame.

## Sources

`sources/slides.json` (the slides), built by `marketing/reels-pipeline/carousel/reelslides.py`; see its README.
