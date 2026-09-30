# This removes the even numbers. Or does it? (remove while iterating)

- **Account:** leetexpert
- **Archetype:** would you ship this? (reel), with an analogy and a line-by-line code walkthrough
- **Source lesson:** `courses/dsa/arrays/stable-compaction-cyclic-placement.md` (read/write pointers); `arrays/dynamic-arrays.md` (removing shifts the tail)
- **Family:** arrays
- **Format:** Reel, 1080×1920, ~106s on estimated timing (the recorded take sets the final length), loops to frame 1; tutor stills; Hope narration
- **Plan:** ledger post `p08`, planned as a carousel and made a reel at the owner's request on 2026-09-29. Issue #121.
- **Status:** narrated and rendered 2026-09-30 (`reel.mp4`, 1:56), not posted. Hope take; the tutor on cue only (hook, the key reaction, the challenge, the brand); a data-structure stage under each code walkthrough, built from the shown code's own run. `hyperframes check`: 0 errors.
- **Media (when final):** `reel.mp4`, `cover.png`

## Hook (first line — all most people read)

This removes the even numbers. Or does it?

## Caption

An AI wrote this in two seconds. It passes the sample test. Would you ship it? 🤔

for n in nums:
    if n % 2 == 0:
        nums.remove(n)

[1, 2, 3] → [1, 3] ✓
[2, 4, 6, 7] → [4, 7] ✗ (4 is even, and it survived)

Why: the for loop walks by position, and the position moves forward every time. remove() deletes the value and shifts everything after it one step left, so the next item lands in the slot you just checked, and the loop skips it. It's like checking tickets along a row of seats while everyone slides left under your finger.

Fix 1: don't edit the list you're reading. Build a new one:
return [n for n in nums if n % 2 != 0]

Fix 2, in place: a read pointer and a write pointer. Copy each keeper to write and move write forward. Write never passes read, so nothing unread is overwritten. Then del nums[write:].

And even the version that works (loop over a copy, remove from the original) is O(n²). Our test run on 100,000 numbers: 7,972 ms vs 4 ms for the new list.

Python raises "RuntimeError: dictionary changed size during iteration" for a dict. Lists and JavaScript arrays just skip, silently.

Your turn: what does the buggy version return for [1, 2, 2, 3]? 👇

Step through every line on leetExpert, the interactive DSA course. Link in bio.

## Hashtags

#python #javascript #codinginterview #dsa #learntocode

## Alt text

A code card shows a Python function, remove_evens, that loops over nums and calls nums.remove(n) on each even number. An "AI · 2 seconds" badge sits above it, and a note says remove_evens([1, 2, 3]) returns [1, 3], a pass. Then remove_evens([2, 4, 6, 7]) returns [4, 7], with the 4 outlined in amber: "4 is even. It survived." A row of four cinema seats holds passengers 2, 4, 6 and 7, with a pointing finger marked i over seat 0. Passenger 2 leaves, everyone slides one seat left, and the finger moves on to seat 1. Passenger 4, now in seat 0, gets a dashed ring: "Nobody checked it." Then 6 leaves, 7 slides left, and the finger points past the end: the loop stops with [4, 7]. The code card returns, and a highlight walks it: the loop's position always moves forward, remove shifts the tail left, and the next item lands in the checked slot and is skipped. Fix 1 is a one-line list comprehension that keeps odd numbers, giving [7]. Fix 2 is an in-place read/write pointer version, walked line by line, ending with del nums[write:]. Bars for 100,000 numbers show 7,972 ms for looping with remove against 4 ms for the new list, "about 2,000× slower". A panel shows Python's RuntimeError for deleting from a dict during iteration, and another says lists and JavaScript arrays skip items with no error. An interview-tell card reads "Changing a collection while looping over it? Say 'new list, or a write pointer'". A challenge asks what remove_evens([1, 2, 2, 3]) returns. A leetExpert lockup ends the reel.

## Verified facts

The three code cards are `sources/code/bug.py`, `fix_new_list.py` and `fix_in_place.py`. `gen.py` renders them verbatim, and `verify.py` loads and runs them. `code/twins.js` holds the JavaScript versions, run by `verify.mjs`. A planted bug in either language fails its verifier (checked 2026-09-29).

- `bug([1, 2, 3]) == [1, 3]`, `bug([2, 4, 6, 7]) == [4, 7]`, and challenge `bug([1, 2, 2, 3]) == [1, 2, 3]`. The same results come from the JavaScript version (`for...of` + `splice`).
- The loop visits only 2 (list `[2,4,6,7]`) and 6 (list `[4,6,7]`), which is the trace the seats scene draws.
- Both fixes match `[x for x in xs if x % 2 != 0]` on 2,000 random lists with negatives, in both languages. `-3 % 2` is `-1` in JavaScript and `1` in Python, and `!== 0` / `!= 0` is right in both. The in-place fix returns the same list object, shortened.
- A dict raises `RuntimeError: dictionary changed size during iteration`. A JavaScript `Map` doesn't throw.
- Cost: in our recorded run on 100,000 random numbers in Python, looping over a copy and removing took 7,972 ms, the new list 4.0 ms, and the write pointer 6.1 ms. 7,972 / 4.0 ≈ 1,993, so "about 2,000×". `verify.py` re-measures each run and asserts a gap over 300× (2,157× on 2026-09-29).

## Sources

`script.txt`, `code/` (the shown code and its JavaScript twins), `gen.py` (scenes, on `marketing/reels-pipeline/reelkit/`), `icons.py`, `style.css`, `verify.py`, `verify.mjs`.

Build (from `sources/`): `K=../../../reels-pipeline/reelkit; bash $K/prep.sh && python3 $K/narrate.py && python3 gen.py && npx hyperframes@0.8.77 check && npx hyperframes@0.8.77 render -o ../reel.mp4`.
