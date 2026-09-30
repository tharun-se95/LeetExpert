# Two pointers, as a gift card: trace reel (re-cut)

- **Archetype:** trace it (reel), with a real-world analogy and a systems tie-in
- **Source lesson:** `courses/dsa/two-pointers/converging-pointers.md`
- **Family:** two-pointers
- **Format:** Reel, 1080×1920, ~70s (final length set by the recorded take), loops to frame 1; tutor stills; Hope narration
- **Replaces:** `2026-09-27-two-pointers-trace` (drafted, never posted), at the owner's request on 2026-09-29: explain it through an analogy, richer visuals, faster pacing. Issue #119.
- **Status:** narrated (Hope take recorded 2026-09-30); final render pending; not posted. Rebuilt on the shared reelkit engine on 2026-09-30, with the tutor on cue only (hook, the 21 combos, the find, the pitfall, the challenge, the brand).
- **Media (when final):** `reel.mp4`, `cover.png`

## Hook (first line — all most people read)

You've got a fifteen-dollar gift card. Spend every cent on exactly two things.

## Caption

$15 gift card. Two items. Every cent. 🎁
The menu is sorted: $1 $3 $4 $5 $7 $8 $9.

Trying every pair takes 21 checks. With 1,000 items, it's 499,500.

Two pointers: put one finger on the cheapest item and one on the priciest.
Too low? Even the priciest item can't lift the cheapest one to $15, so cross the cheapest off.
Too high? The priciest item can't fit with anything that's left, so cross it off.

$1+$9, $3+$9, $4+$9, $5+$9, $7+$9 (too high), $7+$8 = $15. That's 6 checks instead of 21: O(n) time, O(1) memory.

Databases join sorted tables the same way (a merge join): one pointer per table, with no nested loop over every pair.

⚠️ It only works on sorted input. Stop when the fingers meet (`left < right`), or you'll buy the same item twice.

Your turn: a $12 card and the same menu. Which pair does two pointers hit first? 👇

Step through it line by line on leetExpert, the interactive DSA course. Link in bio.

## Hashtags

#twopointers #dsa #codinginterview #algorithms #learntocode

## Alt text

The tutor holds up an illustrated $15 gift card with a gold ribbon, next to a shopping cart with two empty slots and a stack of coins. A menu of seven illustrated price tags appears: sticker $1, pencil $3, coffee $4, cookie $5, notebook $7, book $8, headphones $9. A grid of 21 squares shows every pair to try, then a warehouse shelf and an hourglass mark 499,500 pairs for 1,000 items. Two pointing hands (L and R) mark the cheapest and priciest tags while a gift-card meter fills to each sum. A balance scale shows $1 + $9 = $10 rising against $15, and crossed-off tags dim. When $7 + $8 hits $15, a receipt prints "TOTAL $15.00" with an EXACT stamp. "6 checks vs 21" appears with clock and memory-chip badges. Database cylinders over two sorted tables are linked by a merge join. The fixes for an unsorted menu get a sorting-bars icon and a hash-bucket icon. Two cookies ×2 show the `left <= right` pitfall, a microphone marks the interview tip, and a $12 gift card with a question bubble sets the challenge. A leetExpert lockup ends the reel.

## Verified facts

`sources/verify.py` recomputes every number and fails if one drifts. Checked it fails on a wrong value, 2026-09-29.

- Trace on [1,3,4,5,7,8,9] with target 15: (1,9)=10 low, (3,9)=12 low, (4,9)=13 low, (5,9)=14 low, (7,9)=16 high, (7,8)=15. That's 6 checks, and (7,8) is the only pair summing to 15.
- C(7,2) = 21; C(1000,2) = 499,500.
- Crossing off $1 is safe because $1 + $9 = $10 < $15. Crossing off $9 at step 5 is safe because the cheapest item still in play is $7, and $7 + $9 = $16 > $15.
- Pitfall: with `left <= right`, [5] and target 10 returns (5, 5); with `left < right` it returns nothing.
- Challenge answer: $12 → (3, 9) after 2 checks; (4,8) and (5,7) also sum to 12.
- The merge-join animation is computed by running a merge join over orders.user_id [1,2,2,4,5] and users.id [1,2,3,4,5]: 9 steps and 5 matches, (1,1) (2,2) (2,2) (4,4) (5,5).

## Sources

`script.txt` (the narration), `vo.mp3` + `words.json` (the take and its Scribe timings, from `reelkit/narrate.py`), `gen.py` (scenes, on `reels-pipeline/reelkit`), `icons.py` (the SVG illustrations), `style.css`, `verify.py`.

Build: see `marketing/reels-pipeline/reelkit/README.md` (`prep.sh`, `narrate.py`, then `gen.py`, `check`, `render -o ../reel.mp4`). HyperFrames needs `ffmpeg` and `ffprobe` on PATH.
