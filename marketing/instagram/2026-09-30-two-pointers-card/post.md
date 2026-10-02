# Two pointers on one card (the real cheatsheet, as a reel and a single image)

- **Account:** leetexpert
- **Archetype:** keep the streak / Recall: the product's two-pointers cheatsheet, with each pattern's code walked line by line
- **Source:** `web/src/lib/course/cheatsheets/content/gold.ts` (module `two-pointers`), dumped to `sources/sheet.json`. Snippets check against the lessons `two-pointers/two-sum-ii.md`, `arrays/remove-duplicates-sorted.md`, `two-pointers/container-with-most-water.md` and `linked-lists/merge-two-sorted.md`.
- **Family:** two-pointers
- **Formats:** Reel, 1080×1920, ~86s on estimated timing, loops to frame 1; tutor stills; Hope narration. **And** `card.png`, 1080×1350, the single-image post the plan named.
- **Plan:** ledger post `p15` (single image). Made as both at the owner's direction (reels explain their code). Issue #128.
- **Status:** card.png posted to @leetexpert 2026-10-01: https://www.instagram.com/p/Dd7BNEgk-Wy/. Before that: `card.png` is final and can be posted. narrated and rendered 2026-09-30 (`reel.mp4`, 1:38), not posted. Hope take; the tutor on cue only (hook, the key reaction, the challenge, the brand); a data-structure stage under each code walkthrough, built from the shown code's own run. `hyperframes check`: 0 errors.
- **Media:** `card.png` (final); `reel.mp4` and `cover.png` when the take exists

## Hook (first line — all most people read)

Two pointers on one card. Save this.

## Caption (reel; the single image can use the same)

Two pointers, the whole pattern on one card. 📌 Save this.

Sorted array + pair sum → opposite ends: l at the front, r at the back; too small moves l in, too big moves r in.
Remove / move while reading ahead → fast & slow: fast explores, slow marks the end of what you keep.
Area between two lines → move inward, always the shorter side (the taller one can never raise the minimum).
Merge two sorted lists → one pointer each: take the smaller head, then append the rest.

Targets: O(n) time with O(1) extra space; the merge is O(n+m).
⚠️ Opposite ends needs sorted data.
⚠️ Watch l < r: with l <= r the middle element can pair with itself.

This is the real two-pointers cheatsheet from leetExpert. There are 21, one for every module with practice problems.

Your turn: checking whether a string is a palindrome. Which pattern? 👇

leetExpert, the interactive DSA course. Link in bio.

## Hashtags

#twopointers #cheatsheet #studygram #leetcode #codinginterview

## Alt text (reel)

A dark card titled "Two pointers", with the tagline "Opposite ends or same direction — drop a nested loop". It lists smell → pattern pairs (sorted array, pair or triplet sum → opposite ends; remove or move while reading ahead → fast / slow; container or area between indices → inward from tallest hope; merge two sorted streams → one pointer each), time and extra-space targets, and two traps. Each pattern then gets its own banner and a Python code card, highlighted line by line: two_sum with l and r moving inward; remove_duplicates with fast exploring and slow keeping; max_area moving the shorter side; merge taking the smaller head and appending the rest. A "Targets" table shows O(n) and O(1) for opposite ends and fast / slow, and O(n+m) and O(1)* for the merge. A "Two traps" card shows the sort prerequisite and crossing pointers, with while l < r ✓ against while l <= r giving [3], 6 → [1, 1] ✗. The card returns with the chip "21 cheatsheets · one per module with practice". A challenge asks which pattern checks whether "racecar" is a palindrome. A leetExpert lockup ends the reel.

## Alt text (card.png)

A leetExpert cheatsheet card titled "Two pointers" with a "Save this" tag. It reads: "Opposite ends or same direction — drop a nested loop." Smell → pattern: sorted array, pair / triplet sum → opposite ends; remove / move while reading ahead → fast / slow; container / area between indices → inward from tallest hope; merge two sorted streams → one pointer each. Targets (time · extra space): opposite ends on sorted, O(n), O(1), plus sort if needed; fast / slow rewrite, O(n), O(1), in-place; merge two sorted, O(n+m), O(1)*, or O(n+m) for a new array. Traps: forgetting the sort prerequisite; crossing pointers. The footer reads "21 cheatsheets · Recall" and "link in bio".

## Verified facts

- **The card is the product's content.** `dump_sheet.ts` prints the two-pointers cheatsheet from `gold.ts` plus the registry counts. `verify.py` re-runs it and fails if `sheet.json` has drifted. Counts: 21 cheatsheets, 21 modules with a Practice chapter, 24 modules. That backs "21, one for every module with practice problems".
- Each code card is a file in `sources/code/` that `verify.py` runs on its lesson's own sandbox cases: Two Sum II (1-based indices), Remove Duplicates (the lesson checks the kept prefix), Container With Most Water, and Merge Two Sorted (the lesson's lists as arrays). `code/twins.js` does the same in `verify.mjs`. Flipping the shorter-side comparison fails both verifiers (checked 2026-09-30).
- Crossing pointers: with `l <= r`, `[3]` with target 6 returns `[1, 1]` (the element paired with itself); with `l < r` it returns nothing. Sort prerequisite: on `[1, 4, 2, 3]` with target 5, opposite ends finds nothing although 1 + 4 = 5; sorted first, it finds a pair.
- Challenge: a palindrome check is opposite ends ("racecar" is true, "race" is false).

## Sources

`script.txt`, `sheet.json` + `dump_sheet.ts` (the product's cheatsheet), `cardhtml.py` (the card, shared by both formats), `code/` (four snippets, plus JavaScript twins), `gen.py` (reel scenes, on `marketing/reels-pipeline/reelkit/`), `style.css`, `card.py` + `render_card.mjs` (the single image), `verify.py`, `verify.mjs`.

Build (from `sources/`): `K=../../../reels-pipeline/reelkit; bash $K/prep.sh`, then the image with `python3 card.py && node render_card.mjs`, then the reel with `python3 $K/narrate.py && python3 gen.py && npx hyperframes@0.8.77 check && npx hyperframes@0.8.77 render -o ../reel.mp4`.
