# Binary search in JavaScript. One character is wrong. (the float `mid`)

- **Account:** leetexpert
- **Archetype:** would you ship this? (reel), with a walk through the bug and the fix line by line (JavaScript, the language the bug lives in)
- **Source lesson:** `courses/dsa/binary-search/the-invariant-template.md` (decision 2: the `mid` formula)
- **Family:** binary-search
- **Format:** Reel, 1080×1920, ~88s on estimated timing (the recorded take sets the final length), loops to frame 1; tutor stills; Hope narration
- **Plan:** ledger post `p14`, planned as a carousel and made a reel at the owner's request on 2026-09-29. Issue #127.
- **Status:** narrated and rendered 2026-09-30 (`reel.mp4`, 1:56), not posted. Hope take; the tutor on cue only (hook, the key reaction, the challenge, the brand); a data-structure stage under each code walkthrough, built from the shown code's own run. `hyperframes check`: 0 errors.
- **Media (when final):** `reel.mp4`, `cover.png`

## Hook (first line — all most people read)

Binary search in JavaScript. One character is wrong.

## Caption

Tested on [1, 3, 5, 7, 9, 11, 13]: every target found. Would you ship it? 🤔

const mid = (lo + hi) / 2;

Search [2, 4, 6, 8] for 6 → -1. But 6 is right there.

lo = 0, hi = 3 → (0 + 3) / 2 = 1.5. JavaScript doesn't round, so arr[1.5] is undefined. undefined isn't === 6 and isn't < 6, so the code falls into the last branch: hi = 0.5. It never looks at a real index again.

Why did the tests pass? On 7 numbers, lo + hi is even at every step. The bug only hides on lengths 1, 3, 7, 15…: one less than a power of two.

Python's / makes a float too, but it crashes: "TypeError: list indices must be integers or slices, not float". Loud beats silently wrong.

Fix: const mid = lo + Math.floor((hi - lo) / 2);
It's always a whole index, and it never adds two huge numbers (overflow-safe in Java/C++).

Your turn: 7 hides the bug. What's the next length that does? 👇

Step through every line on leetExpert, the interactive DSA course. Link in bio.

## Hashtags

#javascript #binarysearch #codinginterview #webdev #learntocode

## Alt text

A JavaScript code card shows binarySearch with the line "const mid = (lo + hi) / 2;", under a badge "one character is wrong". A note says it was tested on 7 numbers and every target was found, then "Would you ship it?". binarySearch([2, 4, 6, 8], 6) returns -1, marked wrong: "6 is right there, at index 2". A scene shows the line const mid = (lo + hi) / 2; above four cells, 2, 4, 6 and 8. An amber marker labelled 1.5 lands between the 4 and the 6: "lo = 0, hi = 3 → (0 + 3) / 2 = 1.5", then "arr[1.5] → undefined", "=== 6? false · < 6? false → hi = mid − 1 = 0.5", "never a real index again → -1". "Why the tests passed" shows a grid of lengths 1 to 16: 1, 3, 7 and 15 marked "hides" in teal, every other length "fails": "hides only on 2ᵏ − 1, one less than a power of two". A Python panel shows mid = (lo + hi) / 2 raising "TypeError: list indices must be integers or slices, not float": "loud beats silently wrong". The fixed code card highlights "const mid = lo + Math.floor((hi - lo) / 2);": always a whole index, never adds two huge numbers, overflow-safe in Java or C++. Then [2, 4, 6, 8], 6 → index 2, correct. An interview-tell card reads "A middle index in JavaScript? Say 'I'll floor it'". A challenge asks for the next length after 7 that hides the bug. A leetExpert lockup ends the reel.

## Verified facts

The code cards are `sources/code/bug.js` and `code/fixed.js`, shown minus their last line (the `module.exports` that lets the verifier import them). `verify.mjs` runs both; `verify.py` runs the Python twins in `code/twins.py`. Removing the `Math.floor` from the fix fails `verify.mjs` (checked 2026-09-30).

- The bug finds every target in `[1,3,5,7,9,11,13]`, and returns -1 for 6 in `[2,4,6,8]`. The walk's values are asserted one by one: 1.5, `arr[1.5] === undefined`, both comparisons false, hi = 0.5.
- The bug hides (finds every target) exactly when n + 1 is a power of two. This is checked for every length from 1 to 1,000, and lengths up to 16 give `[1, 3, 7, 15]`. Challenge answer: 15.
- The fix finds every target and rejects absent values, at every length from 0 to 200.
- Python: the same `/` raises `TypeError: list indices must be integers or slices, not float`, on `[2,4,6,8]` and on the 7-number list alike (a float index crashes even when it's whole).

## Sources

`script.txt`, `code/` (the JavaScript shown, plus Python twins), `gen.py` (scenes, on `marketing/reels-pipeline/reelkit/`), `style.css`, `verify.mjs`, `verify.py`.

Build (from `sources/`): `K=../../../reels-pipeline/reelkit; bash $K/prep.sh && python3 $K/narrate.py && python3 gen.py && npx hyperframes@0.8.77 check && npx hyperframes@0.8.77 render -o ../reel.mp4`.
