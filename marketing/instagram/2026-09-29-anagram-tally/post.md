# Stop sorting to check anagrams: the tally-sheet reel

- **Account:** leetexpert
- **Archetype:** pattern explainer (reel), with a real-world analogy and a systems tie-in
- **Source lesson:** `courses/dsa/strings/valid-anagram.md`
- **Family:** hash-tables (hash-map counting)
- **Format:** Reel, 1080×1920, ~91s on estimated timing (the recorded take sets the final length), loops to frame 1; tutor stills; Hope narration
- **Plan:** ledger post `p07` ("Stop sorting to check anagrams."), planned as a carousel and made a reel at the owner's request on 2026-09-29. Issue #120.
- **Status:** in production. The visuals are built and pass `hyperframes check` (0 errors). The narration is not recorded yet (`narrate.py`, which needs ElevenLabs; the owner deferred it on 2026-09-29), so the only render is a silent preview on estimated timings.
- **Media (when final):** `reel.mp4`, `cover.png`

## Hook (first line — all most people read)

Stop sorting to check anagrams.

## Caption

"listen" and "silent": same letters? 🧩
Most people sort both words and compare. That's O(n log n).

Think Scrabble. You wouldn't alphabetize two racks of tiles. You'd keep a tally:
+1 for every tile in the first rack, −1 for every tile in the second.
Every row back at zero means the same tiles.

In code: return False if the lengths differ; counts is the tally sheet (a dict from letter to number); +1 for each letter of s, −1 for each letter of t; then every count must be 0. One pass: O(n).

Our test run on 1,000,000 letters (Python): sorted() 215 ms, Counter 55 ms. Counting took about a quarter of the time.

Warehouses reconcile stock the same way: +1 per box in, −1 per box out.

⚠️ The classic 26-slot array only covers a–z. Give it "café" and Python raises IndexError: list index out of range, while JavaScript quietly returns false. Beyond a–z, count with a hash map.
⚠️ Never compare sets: set("aacc") == set("ccac") is True, but they aren't anagrams. Counts matter.

Your turn: "aab" vs "abb". Which rows miss zero? 👇

Watch every count change on leetExpert, the interactive DSA course. Link in bio.

## Hashtags

#dsa #hashmap #codinginterview #python #learntocode

## Alt text

The tutor stands under two racks of word-game tiles spelling LISTEN and SILENT. The tiles slide into alphabetical order, EILNST and EILNST, beside the code sorted("listen") == sorted("silent") and an O(n log n) tag, which is then struck out with "don't sort". A tally sheet appears with one row per letter. As each LISTEN tile hops, its row gets a tick and +1. As each SILENT tile hops, the tick is rubbed out and the row drops to 0. All six rows turn teal and an ANAGRAM stamp lands. A code card shows is_anagram in Python, and a highlight walks it line by line with a note under each step: the length check, counts as the tally sheet, +1 for each letter of s, −1 for each letter of t, every count back at 0, and "one pass over each word: O(n) time". A stopwatch sits over two bars for 1,000,000 letters: sorted() at 215 ms and Counter at 55 ms, "about ¼ of the time". A warehouse takes a box in (+1) and sends one out (−1), and its stock row returns to 0. A strip of 26 slots, a to z, sits above the tiles C A F É, with an arrow to "slot 136?". Three panels follow: Python crashes with IndexError: list index out of range; JavaScript returns false, quietly wrong; and the fix, "the hash map takes any character", with is_anagram("café", "éfac") → True. The code set("aacc") == set("ccac") → True is marked wrong, next to dot counts showing a 2, c 2 against a 1, c 3. A microphone marks the interview tell, "same letters, any order → say 'count them'". AAB and ABB tiles with a question bubble set the challenge. A leetExpert lockup ends the reel.

## Verified facts

The code on screen is `sources/code/is_anagram.py`, which `gen.py` reads to render the code card and `verify.py` imports and runs. `code/is_anagram.js` is its JavaScript twin, run by `verify.mjs`. Both run on the lesson's five cases plus the reel's, including café/éfac → True and ""/"" → True. A planted bug in either file fails its verifier.

`sources/verify.py` (Python) and `sources/verify.mjs` (Node) recompute every claim and exit non-zero if one drifts. Each was run with a deliberately wrong assertion and failed, then restored, on 2026-09-29.

- Tally for listen/silent: after "listen" every row (l, i, s, t, e, n) is +1; after "silent" every row is 0. Both words sort to "eilnst".
- Lengths: "listen" is 6 and "listens" is 7, so the check rejects the pair before counting.
- 26-slot array on "café"/"éfac" (the right answer is true): Python raises `IndexError: list index out of range` (é reaches slot 136). JavaScript returns `false`, because `counts[136]` goes `undefined` → `NaN`. A hash map (`Counter` / `Map`) returns `true` in both.
- `set("aacc") == set("ccac")` is True, but the counts are a:2 c:2 vs a:1 c:3, so they aren't anagrams.
- Challenge: "aab" vs "abb" leaves a at +1 and b at −1.
- Speed: in our recorded run on 1,000,000 random a–z letters in Python, `sorted` took 214.7 ms and `Counter` 54.9 ms (ratio 0.26). `verify.py` re-measures on each run and asserts the ratio stays under 0.4: 0.26 on 2026-09-29. For reference, in Node the sort took 424 ms and the 26-slot array 4.5 ms.

## Sources

`script.txt` (the narration), `code/` (the shown code and its JS twin), `gen.py` (scenes, on the shared engine in `marketing/reels-pipeline/reelkit/`), `icons.py` (this reel's SVG illustrations), `style.css` (its scenes), `verify.py`, `verify.mjs`. The shared kit holds `narrate.py`, `est_words.py` and `prep.sh`.

Build (from `sources/`): `K=../../../reels-pipeline/reelkit; bash $K/prep.sh && python3 $K/narrate.py && python3 gen.py && npx hyperframes@0.8.77 check && npx hyperframes@0.8.77 render -o ../reel.mp4`. HyperFrames needs `ffmpeg` and `ffprobe` on PATH (`pip install imageio-ffmpeg` and the npm package `@ffprobe-installer/linux-x64` provide them when the system has neither).
