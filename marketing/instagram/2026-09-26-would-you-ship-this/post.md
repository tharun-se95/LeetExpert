# Would you ship this? — has_pair_sum reel

- **Archetype:** interview-reality edge case (reel)
- **Source lesson:** `courses/dsa/hash-tables/two-sum.md`
- **Family:** hash-tables
- **Format:** Reel, 1080×1920, 73s, loops to frame 1; code card as hero prop; Hope narration
- **Status:** posted to @leetexpert 2026-10-03: https://www.instagram.com/reel/DeBfi2UDhiq/. Before that: drafted (not posted)
- **Media:** `reel.mp4`, `cover.png`

## Hook (first line — all most people read)

An AI wrote this in about two seconds, and it passes the sample test. So… would you ship it?

## Caption

An AI wrote this in two seconds. It passes the sample test. Would you ship it?

Try one number: [5], target 10. It says True. Ten minus five is five, five is in the list, so it paired the number with itself.

And `x in nums` scans the whole list every time, a loop inside a loop. 40,000 numbers took over 10 seconds in our test.

The fix: keep a set of numbers you've already seen, check it before adding. Correct, and O(n). Same 40,000 numbers: 3.5 ms.

Passing the sample test isn't proof. Try the weird inputs: one number, duplicates, empty.

On leetExpert the coach tells you exactly which case broke. Link in bio.

## Hashtags

#aicoding #codereview #twosum #python #codinginterview

## Alt text

A code card types an AI-written has_pair_sum. The sample test passes, then [5] with target 10 returns True ✗ while the line `if target - x in nums:` lights amber and 5 loops an arrow back to itself. A scanner sweeps the list for every number and a stopwatch reaches 10.5 s. A diff adds `seen = set()` and the result flips to False ✓ beside 3.5 ms. The sample-test chip turns to “sample test ≠ proof” and a leetExpert lockup closes.

## Verified facts

AI version: [2,7,11,15],9 → True (correct); [5],10 → True; [3,5],6 → True; [4,1],8 → True (all wrong). Fix correct on all. 40,000 numbers, no pair: 10.53s vs 3.51ms (our run).

## Sources

`gen.py`, `style.css`, `words.json` (Scribe), `vo.mp3`, `timing.json`, `BRIEF.md` (storyboard written with the HyperFrames prompt guide).

Re-render: see `marketing/reels-pipeline/README.md` (HyperFrames 0.8.77; add `gsap.min.js` and the Space Grotesk / Space Mono TTFs next to the generator first).

## Open items

Does not feature the tutor yet; needs a re-layout or a corner reaction bubble. Spoken “what leetExpert is” line still to add.

<sub>Agent: Claude (claude.ai chat, Claude Opus 5.5) · project "LeetExpert" · branch `feat/66-instagram-reels-pipeline` · 2026-09-28 · issue #66</sub>
