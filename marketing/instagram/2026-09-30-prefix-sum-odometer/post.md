# Answer any range sum in O(1): prefix sums as an odometer

- **Account:** leetexpert
- **Archetype:** trace it (reel), with the lesson's analogy and a line-by-line code walkthrough
- **Source lesson:** `courses/dsa/prefix-sum/prefix-sum-basics.md` (the odometer analogy, `[2,4,1,5,3]`, and the queries 1..3 and 2..4 from its viz)
- **Family:** prefix-sum
- **Format:** Reel, 1080×1920, ~101s on estimated timing (the recorded take sets the final length), loops to frame 1; tutor stills; Hope narration
- **Plan:** ledger post `p10`, planned as a carousel and made a reel at the owner's request on 2026-09-29. Issue #123.
- **Status:** narrated and rendered 2026-09-30 (`reel.mp4`, 2:12), not posted. Hope take; the tutor on cue only (hook, the key reaction, the challenge, the brand); a data-structure stage under each code walkthrough, built from the shown code's own run. `hyperframes check`: 0 errors.
- **Media (when final):** `reel.mp4`, `cover.png`

## Hook (first line — all most people read)

Answer any range sum in O(1).

## Caption

nums = [2, 4, 1, 5, 3]. What's the sum from index 1 to 3? 4 + 1 + 5 = 10.
Now answer 10,000 of those. Adding each range from scratch costs up to O(n) every time.

Think of a car's odometer: it only shows the total since the car was new. Any trip = end reading − start reading. You never re-drive the trip. 🚗

A prefix array is that odometer: 0, 2, 6, 7, 12, 15.

def build_prefix(nums):
    prefix = [0] * (len(nums) + 1)   # prefix[0] = 0, the sum of nothing
    for i, x in enumerate(nums):
        prefix[i + 1] = prefix[i] + x
    return prefix

sum(l..r) = prefix[r + 1] − prefix[l]
1..3 → 12 − 2 = 10. 2..4 → 15 − 6 = 9. One subtraction, however wide the range.

Our test run, 10,000 queries on 100,000 numbers (Python): 4.96 s summing each range vs 6.1 ms with a prefix array, build included.

⚠️ Only for an array that doesn't change: update one value and every later total is stale.
⚠️ Off-by-one: prefix[r] − prefix[l] drops nums[r] (7 − 2 = 5, not 10).

Your turn: using just two numbers, what's sum(0..4)? 👇

Step through it on leetExpert, the interactive DSA course. Link in bio.

## Hashtags

#prefixsum #algorithms #leetcode #python #codinginterview

## Alt text

A row of five number cells, 2, 4, 1, 5 and 3, with index labels 0 to 4. A bracket over indices 1 to 3 shows "4 + 1 + 5 = 10". Brackets flicker over other ranges, with the tag "10,000 queries × O(n) each". An odometer card shows a trip start of 12,040 km and a trip end of 12,075 km: "trip = 12,075 − 12,040 = 35 km, no re-driving the trip". A second row labelled "prefix (running total)" fills in cell by cell, 0, 2, 6, 7, 12, 15, each total under the number that completes it. A code card walks build_prefix and range_sum line by line: n + 1 slots with prefix[0] = 0 as the sum of nothing, next slot = previous slot + x, one pass O(n), and sum of l..r = prefix[r + 1] − prefix[l]. The rows return with prefix[4] and prefix[1] ringed: "sum(1..3) = prefix[4] − prefix[1] = 12 − 2 = 10". Then prefix[5] and prefix[2]: "15 − 6 = 9", and the chip "one subtraction per query: O(1)". Bars for 10,000 queries on 100,000 numbers show 4.96 s summing each range against 6.1 ms with a prefix array, "about 800× faster". The nums cell at index 1 changes from 4 to 9, and prefix cells 2 to 5 turn amber: "change nums[1] → prefix[2..5] are stale". An off-by-one card shows prefix[r] − prefix[l] giving 7 − 2 = 5, which drops nums[3] = 5, against prefix[r + 1] − prefix[l] giving 10. An interview-tell card reads "Many range sums, the array never changes. Say 'prefix sums'". A challenge shows the prefix array and asks for sum(0..4) using just two numbers. A leetExpert lockup ends the reel.

## Verified facts

The code card is `sources/code/prefix.py`. `gen.py` renders it verbatim and runs it to get every number on screen. `verify.py` runs it too, and `verify.mjs` runs the JavaScript twin `code/prefix.js`. A planted off-by-one fails each verifier (checked 2026-09-30).

- The array and both queries are read from the lesson's own viz block: `[2,4,1,5,3]`, `(1,3)`, `(2,4)`.
- prefix = `[0, 2, 6, 7, 12, 15]`; `sum(1..3) = 12 − 2 = 10`, and `sum(2..4) = 15 − 6 = 9`, both equal to adding the range. The off-by-one gives `7 − 2 = 5 = 10 − nums[3]`. Challenge: `15 − 0 = 15`.
- Changing nums[1] changes exactly prefix[2..5]. The odometer's `12,075 − 12,040 = 35`.
- `range_sum` equals slice-summing on 2,000 random arrays and ranges, negatives included, in both languages.
- Speed: our recorded run on 2026-09-30 (10,000 random queries, 100,000 numbers, Python) took 4.96 s summing each range vs 6.1 ms with a prefix array, build included. 4.96 s / 6.1 ms ≈ 813, so "about 800×". `verify.py` re-measures each run and asserts a gap over 100× (740× on a re-run). Node showed the same shape: 425 ms vs 5.8 ms.

## Sources

`script.txt`, `code/` (the shown code and its JavaScript twin), `gen.py` (scenes, on `marketing/reels-pipeline/reelkit/`), `style.css`, `verify.py`, `verify.mjs`.

Build (from `sources/`): `K=../../../reels-pipeline/reelkit; bash $K/prep.sh && python3 $K/narrate.py && python3 gen.py && npx hyperframes@0.8.77 check && npx hyperframes@0.8.77 render -o ../reel.mp4`.
