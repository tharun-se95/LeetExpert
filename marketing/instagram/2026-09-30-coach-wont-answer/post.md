# The coach won't give you the answer (inside leetExpert)

- **Account:** leetexpert
- **Archetype:** inside leetExpert (reel): real product footage, plus a code walkthrough
- **Source lesson:** `courses/dsa/hash-tables/two-sum.md` (the problem, its four cases, and Hints 1 and 2); coach behaviour from `web/src/lib/coach/diagnose.ts`
- **Family:** hash-tables
- **Format:** Reel, 1080×1920, ~89s on estimated timing (the recorded take sets the final length), loops to frame 1; tutor stills; Hope narration
- **Plan:** ledger post `p09`. Issue #122.
- **Status:** narrated and rendered 2026-09-30 (`reel.mp4`, 1:48), not posted. Hope take; the tutor on cue only (hook, the key reaction, the challenge, the brand); a data-structure stage under each code walkthrough, built from the shown code's own run. `hyperframes check`: 0 errors.
- **Media (when final):** `reel.mp4`, `cover.png`

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

#codinginterview #leetcode #python #dsa #learntocode

## Alt text

A title card reads "The coach won't give you the answer. That's the point." A browser window labelled leetexpert.com shows the real Two Sum problem page on a phone-sized layout. A Python draft is typed line by line: a map called seen, a loop that stores each number and then checks for its partner. Running it shows "2 of 4 tests passed". The Coach tab shows a CASE FAILED card: "two_sum([3, 2, 4], 6) returned [0, 0]; expected [1, 2]. Open Hint 1 on Explanation for the next authored nudge." Hint 1, "which verb?", opens. The return line is changed to swap the pair, and a second run shows "0 of 4 tests passed". A new CASE FAILED card reads "two_sum([2, 7, 11, 15], 9) returned [1, 0]; expected [0, 1]. Open Hint 2". Hint 2 opens: "one pass, check before insert". A code card walks the draft on [3, 2, 4]: i = 0, n = 3, store seen = {3: 0}, 6 − 3 = 3 is in seen but it's the 3 just stored, so 3 pairs with itself and the result is [0, 0]. In the app, the line seen[n] = i moves below the check, and a code card explains "check first: seen only holds earlier numbers; store after, so a number can never find itself". The next run shows "All 4 tests passed" and a Solved badge, and the coach's ALL CASES PASSED card says "I still will not write the code." An interview-tell card reads "In an interview, nobody hands you the fix. Say 'walk the failing case'". A challenge asks why two_sum([3, 3], 6) still works with the fix. A leetExpert lockup ends the reel.

## Verified facts

- **The product footage is real.** `sources/screens/` holds stills that `sources/capture.mjs` took from the running app (`cd web && npm run dev -- -p 3100`, then `node capture.mjs`) on 2026-09-30. Every diagnosis, hint, test count and badge on screen is the app's own output. The coach's case diagnosis and hint pointer are deterministic (`diagnose.ts`), with no AI call.
- **One thing is framed out.** Chat needs a model key, which this local capture didn't have, and the panel shows "Chat unavailable" under the diagnosis. The coach shots are cropped above it with `crops` in `R.screen` (the window's visible height). Nothing inside a still is altered, and the reel never shows or implies a chat reply.
- **The escalation is real.** The sandbox ignores an identical re-run, so the second failing run is a different attempt (swapping the pair), and that is what moves the coach from Hint 1 to Hint 2.
- `verify.py` reads the four cases from the lesson file itself and runs `code/draft.py` (2 of 4 pass; the first failure is `[3,2,4], 6 → [0,0]` vs `[1,2]`, and the diagnosis sentence is rebuilt and matched), `code/swapped.py` (0 of 4; case 1 gives `[1,0]` vs `[0,1]`) and `code/fixed.py` (4 of 4; challenge `[3,3] → [0,1]`; on 3,000 random inputs every answer has a < b and sums to the target). It also checks that the lines `capture.mjs` types are exactly `code/draft.py`.
- `verify.mjs` runs the JavaScript twins on the same lesson cases. A planted bug fails each verifier (checked 2026-09-30).

## Sources

`script.txt`, `capture.mjs` (drives the app, writes `screens/`), `screens/` (the footage), `code/` (the drafts and fix, plus JavaScript twins), `gen.py` (scenes, on `marketing/reels-pipeline/reelkit/`, using its `R.screen` window), `verify.py`, `verify.mjs`.

Build (from `sources/`): `K=../../../reels-pipeline/reelkit; bash $K/prep.sh && python3 $K/narrate.py && python3 gen.py && npx hyperframes@0.8.77 check && npx hyperframes@0.8.77 render -o ../reel.mp4`.
