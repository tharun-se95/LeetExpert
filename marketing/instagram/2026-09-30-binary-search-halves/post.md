# Watch binary search throw away half

- **Account:** leetexpert
- **Archetype:** trace it (reel), with the lesson's analogy and a line-by-line code walkthrough
- **Source lesson:** `courses/dsa/binary-search/the-invariant-template.md` (the dictionary analogy, its viz `[1,3,5,7,9,11,13]` target 9, its template, and bug 3: `lo = mid`)
- **Family:** binary-search
- **Format:** Reel, 1080×1920, ~92s on estimated timing (the recorded take sets the final length), loops to frame 1; tutor stills; Hope narration
- **Plan:** ledger post `p13`. Issue #126.
- **Status:** narrated and rendered 2026-09-30 (`reel.mp4`, 1:54), not posted. Hope take; the tutor on cue only (hook, the key reaction, the challenge, the brand); a data-structure stage under each code walkthrough, built from the shown code's own run. `hyperframes check`: 0 errors.
- **Media (when final):** `reel.mp4`, `cover.png`

## Hook (first line — all most people read)

Watch binary search throw away half.

## Caption

Find 9 in [1, 3, 5, 7, 9, 11, 13]. 📖 Do what you'd do with a paper dictionary: open the middle, keep one half, ignore the other.

mid = 7 < 9 → everything up to 7 is too small. Gone.
mid = 11 > 9 → 11 and everything after it. Gone.
mid = 9 → found, in 3 checks.

def binary_search(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid = lo + (hi - lo) // 2
        if arr[mid] == target: return mid
        elif arr[mid] < target: lo = mid + 1
        else: hi = mid - 1
    return -1

Each check halves the range: O(log n). A million sorted numbers take at most 20 checks. A billion, 30.

⚠️ The classic bug: lo = mid instead of mid + 1. Search [1, 3] for 3: mid stays 0 and lo stays 0, forever.
⚠️ It only works on sorted data, or anything where one comparison tells you which half to drop.

Your turn: how many checks to find 13 in this list? 👇

Step through every line on leetExpert, the interactive DSA course. Link in bio.

## Hashtags

#binarysearch #dsa #codinginterview #python #learntocode

## Alt text

Seven number cells, 1, 3, 5, 7, 9, 11 and 13, with the prompt "sorted list · find 9". A paper-dictionary card shows an open book: "open the middle, keep one half, ignore the other". Back on the row, lo sits under the first cell and hi under the last. An amber ring marks the middle, 7: "mid = 7 < 9 → drop 7 and everything left of it". Cells 1 to 7 grey out and lo moves to the 9. The ring moves to 11: "mid = 11 > 9 → drop 11 and everything right". 11 and 13 grey out and hi moves onto the 9. The ring lands on 9, which turns teal: "found in 3 checks". A code card walks binary_search line by line: [lo, hi] is where the answer could still be; while the range isn't empty, take the middle; return the target; too small moves lo past mid; too big moves hi below mid; if the range runs out, it's not there; each check halves the range, O(log n). A bar labelled "1,000,000 sorted numbers" halves twenty times while a counter counts the checks down to at most 1 left: "at most 20 checks", then "1,000,000,000 → at most 30". A bug card compares "lo = mid + 1 ✓" with "lo = mid ✗": on [1, 3], finding 3, lo = 0, hi = 1, mid = 0, "1 < 3 → lo = mid = 0 … again, forever". A card reads "Only on sorted data, or anything where one comparison tells you which half to drop". An interview-tell card reads "Sorted data and a search? Say 'binary search'". A challenge asks how many checks it takes to find 13 in the list. A leetExpert lockup ends the reel.

## Verified facts

The code card is `sources/code/binary_search.py`. `verify.py` checks that it is the lesson's template (comments and type hints aside), then runs it; `verify.mjs` runs the JavaScript twin. The trace the reel animates comes from `sources/bstrace.py`, which `verify.py` holds to the shown code. A planted bug fails each verifier (checked 2026-09-30).

- The array and target are read from the lesson's viz. Trace: mid 7 (low), mid 11 (high), mid 9 (found); ranges (0,6), (4,6), (4,4); index 4, in 3 checks. Challenge: 13 is also 3 checks, at index 6.
- Scale: the worst case is floor(log2 n) + 1 checks. This is confirmed by running the search on every target, present and absent, for every n below 300, and on extreme targets at 10⁶ and 10⁹. That gives 20 for a million and 30 for a billion.
- The bug: with `lo = mid`, searching `[1, 3]` for 3 stays at (lo, hi, mid) = (0, 1, 0) for every one of 50 capped checks.
- The code equals a linear scan on 3,000 random sorted arrays, in both languages.

## Sources

`script.txt`, `code/` (the shown code and its JavaScript twin), `bstrace.py` (the animated states), `gen.py` (scenes, on `marketing/reels-pipeline/reelkit/`), `style.css`, `verify.py`, `verify.mjs`.

Build (from `sources/`): `K=../../../reels-pipeline/reelkit; bash $K/prep.sh && python3 $K/narrate.py && python3 gen.py && npx hyperframes@0.8.77 check && npx hyperframes@0.8.77 render -o ../reel.mp4`.
