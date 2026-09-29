# Two pointers — trace reel

- **Archetype:** trace it (reel)
- **Source lesson:** `courses/dsa/two-pointers/converging-pointers.md`
- **Family:** two-pointers
- **Format:** Reel, 1080×1920, 60s, loops; painted tutor stills cut on story beats; Hope narration
- **Status:** drafted (not posted)
- **Media:** `reel.mp4`, `cover.png`

## Hook (first line — all most people read)

Okay, sorted list. Find two numbers that add up to fifteen.

## Caption

Sorted list, target 15. Most people check every pair: 21 checks for just 7 numbers.

Two pointers: one at each end. Too small? Move the left one up. Too big? Move the right one in.

1+9, 3+9, 4+9, 5+9, 7+9 (too big), 7+8 = 15. Six checks instead of 21.

Why it works: if the sum is too small, even the biggest number can't rescue the left one, so drop it. Every step kills one option. O(n) time, O(1) extra memory.

Step through it line by line on leetExpert, link in bio.

## Hashtags

#twopointers #dsa #codinginterview #algorithms #learntocode

## Alt text

The tutor hosts a trace over [1, 3, 4, 5, 7, 8, 9] with target 15: L and R pointers move as each sum appears with a too small / too big tag, eliminated numbers dim, 7 and 8 light teal, a card explains why dropping the left element is safe, and a large 6 appears against 21 brute-force checks with O(n) time and O(1) memory badges.

## Verified facts

Trace verified: (1,9)=10, (3,9)=12, (4,9)=13, (5,9)=14, (7,9)=16, (7,8)=15 found at indices (4,5). C(7,2)=21; (7,8) is the only pair summing to 15. Target changed from 16 to 15 so both pointers move.

## Sources

`gen.py` (stills version; beat list `SB`), `style.css`, `words.json`, `vo.mp3`, `timing.json`. Tutor stills come from `marketing/reels-pipeline/tutor-poses/` (copy into `stills/` before rendering).

Re-render: see `marketing/reels-pipeline/README.md` (HyperFrames 0.8.77; add `gsap.min.js` and the Space Grotesk / Space Mono TTFs next to the generator first).

## Open items

Spoken “what leetExpert is” line still to add.

<sub>Agent: Claude (claude.ai chat, Claude Opus 5.5) · project "LeetExpert" · branch `feat/66-instagram-reels-pipeline` · 2026-09-28 · issue #66</sub>
