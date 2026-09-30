# "Next greater element" has a shape: the monotonic stack

- **Account:** leetexpert
- **Archetype:** pattern in 60 seconds (reel): cue, push/pop rule, O(n) target, and the trap; with the lesson's analogy and a line-by-line code walkthrough
- **Source lessons:** `courses/dsa/stacks/monotonic-stack.md` (the concert analogy, the viz `[2,1,5,3]`, `next_greater`); `daily-temperatures.md` (its cases, which the same shape solves)
- **Family:** stacks
- **Format:** Reel, 1080×1920, ~106s on estimated timing (the recorded take sets the final length), loops to frame 1; tutor stills; Hope narration
- **Plan:** ledger post `p16`, planned as a carousel and made a reel at the owner's request on 2026-09-29. Issue #129.
- **Status:** narrated and rendered 2026-09-30 (`reel.mp4`, 2:06), not posted. Hope take; the tutor on cue only (hook, the key reaction, the challenge, the brand); a data-structure stage under each code walkthrough, built from the shown code's own run. `hyperframes check`: 0 errors.
- **Media (when final):** `reel.mp4`, `cover.png`

## Hook (first line — all most people read)

"Next greater element" has a shape.

## Caption

For each number, find the first bigger number to its right: [2, 1, 5, 3]. Checking to the right of every number is O(n²).

Picture a concert 🎤: once someone tall stands in front of you, everyone shorter behind them is blocked for good. Only taller people ever matter again.

The stack keeps the numbers still waiting, biggest at the bottom:
2 arrives → push. 1 arrives → push. 5 arrives → pop 1 (answer 5), pop 2 (answer 5), push 5. 3 arrives → push. At the end, 5 and 3 keep −1.

def next_greater(nums):
    answer = [-1] * len(nums)
    stack = []                      # indexes, not values
    for i, x in enumerate(nums):
        while stack and nums[stack[-1]] < x:
            answer[stack.pop()] = x
        stack.append(i)
    return answer

Each index goes in once and comes out at most once: O(n). Our test run on 10,000 numbers (Python): 953 ms checking right of each vs 0.6 ms with the stack.

⚠️ The trap: store values instead of indexes, and when you pop you don't know where the answer goes. Look it up with index() and duplicates break it: [1, 1, 3] → [3, −1, −1].

Your turn: the next-greater list for [4, 3, 2, 5]? 👇

Step through every line on leetExpert, the interactive DSA course. Link in bio.

## Hashtags

#stack #dsa #codinginterview #python #learntocode

## Alt text

A row labelled nums holds 2, 1, 5, 3 with indices i=0 to i=3. Below it, an answer row starts at −1 in every cell, and a stack column with a floor stands on the right. The tag "check right of each: O(n²)" appears. A concert scene of silhouettes with different heights reads "someone tall in front: everyone shorter behind them is blocked; only taller people ever matter again". Back on the rows, an amber ring marks each arriving number. 2 (i=0) is pushed, and 1 (i=1) is pushed on top. When 5 arrives, the box for 1 flies to the answer row and index 1 becomes 5, then the box for 2 does the same and index 0 becomes 5. 5 is pushed, then 3 is pushed on top. The last two answers stay −1: "no greater → −1". A code card walks next_greater line by line: answer starts full of −1; the stack holds indexes, not values; while the top is smaller than x, pop it and x is its answer; then push this index; each index in once and out at most once, O(n). Bars for 10,000 numbers show 953 ms for checking right of every number against 0.6 ms for the monotonic stack. A trap card shows stack.append(x) and answer[nums.index(stack.pop())] = x: "popped a value: where does its answer go? [1, 1, 3] → [3, −1, −1] ✗; index(1) finds the first 1 twice; the second 1 never gets its 3". An interview-tell card reads "Next greater, next smaller, days until warmer? Say 'monotonic stack'". A challenge asks for the next-greater list of [4, 3, 2, 5]. A leetExpert lockup ends the reel.

## Verified facts

The code card is `sources/code/next_greater.py`, which `verify.py` checks is the lesson's `next_greater` (comments and type hints aside) and then runs. The value-stack version is `code/value_stack_bug.py`. `code/twins.js` runs in `verify.mjs`. A planted `<=` (which pops equal values) fails both verifiers (checked 2026-09-30).

- The viz array `[2, 1, 5, 3]` is read from the lesson. The animated events come from `sources/mstrace.py`: push 0, push 1, pop 1 (by i=2), pop 0 (by i=2), push 2, push 3. Answer: `[5, 5, -1, -1]`.
- The value stack also gives `[5, 5, -1, -1]` here (no duplicates), but `[1, 1, 3]` gives `[3, -1, -1]` where the right answer is `[3, 3, -1]`. Challenge: `[4, 3, 2, 5] → [5, 5, 5, -1]`.
- On 2,000 random lists the stack equals brute force, and every index is pushed exactly once and popped at most once. The same shape solves every Daily Temperatures lesson case.
- Speed: in our recorded run on 2026-09-30 (10,000 descending numbers, the brute force's worst case, Python), checking right of every number took 953 ms and the stack 0.6 ms. `verify.py` re-measures each run and asserts a gap over 100× (1,226× on a re-run).

## Sources

`script.txt`, `code/` (the shown code, the value-stack bug, and JavaScript twins), `mstrace.py` (the animated events), `gen.py` (scenes, on `marketing/reels-pipeline/reelkit/`), `style.css`, `verify.py`, `verify.mjs`.

Build (from `sources/`): `K=../../../reels-pipeline/reelkit; bash $K/prep.sh && python3 $K/narrate.py && python3 gen.py && npx hyperframes@0.8.77 check && npx hyperframes@0.8.77 render -o ../reel.mp4`.
