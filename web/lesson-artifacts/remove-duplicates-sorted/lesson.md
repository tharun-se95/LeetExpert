---
title: "Remove Duplicates from Sorted Array"
kicker: "Remove Duplicates from Sorted Array · Arrays module · problem lesson"
headline: "How do you squeeze the repeats out of a sorted row with no second row to write into?"
lede: "A hotel keeps its guest register as a bound book, sorted by guest, one line per night stayed, so a guest who stayed three nights fills three lines in a row. The manager wants each guest listed once, and the book has no spare pages: the clean list has to be written over the book itself, from the first line down. Two things move down the page. A finger reads every line once, and a pen marks where the next new guest goes. The pen never gets ahead of the finger, and that is the whole reason the trick works."
chips:
  - "needs **two pointers**"
  - "time **O(n)**"
  - "space **O(1)**"
hero: |
  <div class="hero-stage"><div class="hero-art navy"><svg id="heroSweep" viewBox="0 0 560 225" role="img" aria-label="Animation: a sorted row of ten values with repeats. A read marker visits each value in turn; a write marker stays behind it, and each value that differs from the last one kept is copied down to the write marker, until the first five slots hold each distinct value once."></svg>
  <div class="hero-read" id="heroRead"><div class="hero-num"><b id="heroNum">1</b> <span id="heroUnit">kept</span></div><div id="heroCap">Read each value; keep it only when it differs from the last one kept</div></div></div></div>
---

## Problem {#problem}

```vig "A sorted row of tiles with runs of repeats, an arrow down, and a shorter row holding one tile of each run"
<rect class="fk" x="22" y="22" width="20" height="22" rx="5"/><rect class="fa" x="46" y="22" width="20" height="22" rx="5"/><rect class="fk" x="76" y="22" width="20" height="22" rx="5"/><rect class="fa" x="100" y="22" width="20" height="22" rx="5"/><rect class="fa" x="124" y="22" width="20" height="22" rx="5"/><rect class="fk" x="154" y="22" width="20" height="22" rx="5"/><rect class="fa" x="178" y="22" width="20" height="22" rx="5"/><path class="sc" d="M120 54L120 76"/><path class="sc" d="M114 70L120 77L126 70"/><rect class="fk" x="76" y="86" width="20" height="22" rx="5"/><rect class="fk" x="106" y="86" width="20" height="22" rx="5"/><rect class="fk" x="136" y="86" width="20" height="22" rx="5"/>
```

Given an integer array `nums` sorted in non-decreasing order, remove the duplicates ==in place== so that each unique value appears once, keeping the relative order. Return `k`, the number of unique values. The first `k` slots of `nums` must hold the answer. What lies past slot `k` does not matter.

```examples
nums = [1, 1, 2] → k = 2, nums = [1, 2, _]
nums = [0, 0, 1, 1, 1, 2, 2, 3, 3, 4] → k = 5, nums = [0, 1, 2, 3, 4, _, _, _, _, _]
```

```constraint
1 ≤ n ≤ 3·10⁴ · values in [−100, 100] · nums is sorted · O(1) auxiliary space
```

In place means the answer is written into the same array, not into a copy. Read it as the register: the finger `read` visits every line once, and the pen `write` marks the line where the next new guest goes. Both start near the top and only move down. The pen is never ahead of the finger, because it moves only after the finger has read a line, so the pen can overwrite a line the finger has already passed and never one it still has to read. That is why one array is enough.

Try it by hand. At each step the finger rests on a value. Say whether the pen should keep it or skip it. The panel checks, at the end of each decision, that the kept slots rise strictly and hold every distinct value read so far.

```widget #byhand "By hand: keep or skip"
<div class="lvhost"></div><div class="actions"><button type="button" class="btn2" data-op="keep">Keep it</button><button type="button" class="btn2" data-op="skip">Skip it</button><button type="button" class="btn2 reset">Start again</button><span class="lv-hint" id="handHint"></span></div>
```

## Attempt it first {#attempt}

```caption
`read` visits every line once; `write` marks where the next new value goes.
```

```vig "A row of tiles with two markers: the one behind marks the next slot to fill, the one ahead marks the tile being read"
<rect class="fk" x="16" y="40" width="22" height="24" rx="5"/><rect class="fk" x="44" y="40" width="22" height="24" rx="5"/><rect class="fa" x="72" y="40" width="22" height="24" rx="5"/><rect class="fa" x="100" y="40" width="22" height="24" rx="5"/><rect class="fa" x="128" y="40" width="22" height="24" rx="5"/><rect class="fa" x="156" y="40" width="22" height="24" rx="5"/><rect class="fa" x="184" y="40" width="22" height="24" rx="5"/><polygon class="fk" points="72,78 84,78 78,70"/><polygon class="fc" points="156,78 168,78 162,70"/><path class="st" d="M82 92L160 92"/><path class="st" d="M154.8 88.4L160 92L154.8 95.6"/>
```

Take paper, write the ten-value example, and run a finger and a pen over it before reading on. The earlier lesson on stable compaction gave you the template: a write pointer that lags a read pointer and keeps some of what the read pointer sees. All that is left to decide is what "keep" means here. Predict how the two pointers stand after a few decisions.

```widget "Predict where write stands"
<div id="predict"></div>
```

````reveal #hint1 "Hint 1: what does keeper mean here?"
A value is a keeper if it is not equal to the previous keeper. In a sorted array duplicates are adjacent, so comparing with the last value written is enough to detect them. This is why sortedness matters: it turns a global question, "has this value appeared anywhere before?", into a local one, "is it different from the value just before it?"
````

````reveal #hint2 "Hint 2: the template, specialised"
Run `read` over every element and keep `nums[read]` when it differs from `nums[write − 1]`, the most recently kept value. Seed the process: the first element is always a keeper, so start with `write = 1` and `read = 1`.
````

## The trap: compare with the wrong slot {#trap toc="The trap"}

```caption
Compare with the last kept value, not with the slot the pen is about to fill.
```

```vig "A row of tiles with the pen over a slot that still holds an old value, and a dashed link to the last kept tile behind it"
<rect class="fk" x="16" y="40" width="22" height="24" rx="5"/><rect class="fk" x="44" y="40" width="22" height="24" rx="5"/><rect class="fa" x="72" y="40" width="22" height="24" rx="5"/><rect class="fr" x="100" y="40" width="22" height="24" rx="5"/><rect class="fa" x="128" y="40" width="22" height="24" rx="5"/><rect class="fa" x="156" y="40" width="22" height="24" rx="5"/><polygon class="fc" points="100,80 112,80 106,72"/><path class="st" d="M52 34L52 22L106 22L106 34" stroke-dasharray="3 3"/>
```

Two conventions for `write` are both reasonable, and the bug is mixing them. If `write` names the slot to fill next, the last kept value is one slot behind it, at `nums[write − 1]`. If `write` names the last kept slot, that value sits at `nums[write]`, and the answer is `write + 1`. The mistake keeps the first convention for where `write` starts and borrows the second for the comparison.

````warn
Do not compare with `nums[write]`. It is the slot the pen is about to fill, and it holds an old value, not the last kept one. On the ten-value example it keeps 2 and 3 twice and returns 7, where 5 is right, and the kept slots read [0, 1, 2, 2, 3, 3, 4]. Python and JavaScript fail the same way, because nothing in the mistake depends on the language.

```code mistake_wrong_slot "Comparing with the slot to fill"
```
````

It runs without an error and it is right on short arrays. The slot `write` holds either an original value that has not been read yet or a stale copy left behind by an earlier write, so comparing with it asks the wrong question, and its answer matches the right one only while nothing has been skipped. Watch the same array under both comparisons. The panel's second claim breaks the moment a repeat gets written.

```widget #trapper "The same array, two comparisons"
<div class="extabs" role="group" aria-label="Choose a comparison"></div><div class="lvhost"></div><p class="cost-note" id="trapNote"></p>
```

## The insight {#insight}

```caption
Sorted means equal values are neighbours, so "is this new?" is one comparison.
```

```vig "A sorted row cut into runs by dashed lines, with one tile of each run marked"
<rect class="fk" x="18" y="40" width="20" height="24" rx="5"/><rect class="fa" x="42" y="40" width="20" height="24" rx="5"/><rect class="fk" x="76" y="40" width="20" height="24" rx="5"/><rect class="fa" x="100" y="40" width="20" height="24" rx="5"/><rect class="fa" x="124" y="40" width="20" height="24" rx="5"/><rect class="fk" x="158" y="40" width="20" height="24" rx="5"/><rect class="fa" x="182" y="40" width="20" height="24" rx="5"/><path class="st" d="M69 28L69 78" stroke-dasharray="3 3"/><path class="st" d="M151 28L151 78" stroke-dasharray="3 3"/>
```

Stop the loop at any pass and look at the array. The kept slots, `nums[0..write)`, hold the distinct values among everything read so far, in order, and the array is sorted, so every value read so far is no larger than the one the finger is on. Two consequences follow. The largest value read so far is the last one kept, `nums[write − 1]`, because the kept slots are the distinct values in sorted order. And the value under the finger is either equal to that largest value, in which case it is a repeat, or different from it, in which case it must be larger, and so it appears nowhere earlier. One comparison against `nums[write − 1]` therefore answers a question that sounds global.

```key
Sorted means duplicates are adjacent, so "is this value new?" is one comparison with the last kept value, and the write-pointer template applies with keep = (current ≠ last kept).
```

The start is forced by the same picture. Slot 0 has nothing before it, so it cannot repeat anything and is always kept: `write` starts at 1, and so does `read`. It is tempting to start both at 0 and let the first pass find that out by reading `nums[write − 1]`, and that is a trap that only exists across languages. In Python `nums[-1]` is the last element; in JavaScript it is `undefined`. Seeded at 0 on `[2, 2, 2, 2]`, Python compares the first 2 with the last 2, finds them equal and keeps nothing, so it returns 0; JavaScript compares 2 with `undefined`, keeps the first 2, and returns 1, which is right by accident. The seed at 1 never reads before slot 0.

```rosetta "The code, read as the register"
In the code | In the register
`nums` | the book, one line per night stayed
`read` | the finger, resting on the line being read
`write` | the pen, on the line where the next new guest goes
`nums[write - 1]` | the last guest already written down
`nums[read] != nums[write - 1]` | is this a different guest from the last one written?
`nums[write] = nums[read]` | copy the name down to the pen
`return write` | how many guests were written: the clean list is the top `write` lines
```

Step through the three arrays below. The panel checks both claims after every decision.

```widget #stepper "Walk the two-pointer loop"
<div class="extabs" role="group" aria-label="Choose an array"></div><div class="lvhost"></div>
```

## Solution {#solution}

```caption
One pass: read every value once, and write only the ones that differ from the last kept.
```

```vig "A pen and a finger on a row: the finger ahead reads a tile, the pen behind copies it down"
<rect class="fk" x="16" y="44" width="22" height="24" rx="5"/><rect class="fk" x="44" y="44" width="22" height="24" rx="5"/><rect class="fk" x="72" y="44" width="22" height="24" rx="5"/><rect class="fa" x="100" y="44" width="22" height="24" rx="5"/><rect class="fa" x="128" y="44" width="22" height="24" rx="5"/><rect class="fc" x="156" y="44" width="22" height="24" rx="5"/><rect class="fa" x="184" y="44" width="22" height="24" rx="5"/><path class="sc" d="M167 38C167 14 111 14 111 36"/><path class="sc" d="M106 30L111 37L117 30"/>
```

Attempt it on paper first: seed the pointers, decide what to compare, and say what to return. Then compare.

`````reveal #solbox "Show the solution"
```code solution "Read every value, write only the new ones"
```

```notes
The loop body is the insight, line for line. `nums[read] != nums[write - 1]` asks whether the value under the finger differs from the last kept one. If it does, `nums[write] = nums[read]` copies it down and `write += 1` moves the pen on. `return write` hands back the count, because the pen stops one slot past the last kept value.

The invariant, stated fully: `nums[0..write)` holds the distinct values of everything read so far, in order, and `nums[write − 1]` is the largest of them. Every branch preserves it. When the loop ends, everything read is the whole array.
```

```derivation
**Time O(n).** `read` visits each index once and `write` only moves forward. On the ten-value example the loop makes {{cmps10}} comparisons, one per value after the first, and {{writes10}} writes, one per kept value after the first; it returns {{k10}}. Counted by running it. Each pass does a fixed amount of work, so the total is O(n).

**Space O(1).** Two integer indexes are the only extra state, whatever the length. The copying version below holds a second list.
```
`````

## What it costs {#cost}

```caption
The write pointer moves each kept value once; deleting the repeats moves everything behind them.
```

```vig "Two stacks of work: a tall bar for shifting the tail after each deletion and a short bar for writing one value"
<rect class="fa" x="48" y="24" width="52" height="76" rx="6"/><rect class="fk" x="140" y="76" width="52" height="24" rx="6"/><path class="st" d="M36 100L204 100"/>
```

Two other answers are worth knowing, because both are correct and both are what a first attempt tends to produce. Delete each repeat where it stands:

```code naive_delete "Delete each repeat"
```

It is correct, and every deletion shifts everything behind the repeat one slot left. A repeat at original index p costs the n − 1 − p elements after it, because deleting an earlier repeat lowers the position and the length together and leaves their difference alone. The other is the brute force: copy the distinct values into a second list and copy them back.

```code naive_copy "Copy through a second list"
```

It is O(n) time and it needs a second list, which is exactly what the constraint forbids. The chart counts the first.

```widget "Elements moved as the array grows"
<div class="chart" id="costplot"></div><p class="cost-note" id="costNote"></p>
```

## Variants {#variants}

```vig "A row cut into runs, with two tiles of each run kept and the rest crossed out"
<rect class="fk" x="18" y="40" width="20" height="24" rx="5"/><rect class="fk" x="42" y="40" width="20" height="24" rx="5"/><rect class="fa" x="66" y="40" width="20" height="24" rx="5"/><rect class="fk" x="100" y="40" width="20" height="24" rx="5"/><rect class="fk" x="124" y="40" width="20" height="24" rx="5"/><rect class="fa" x="148" y="40" width="20" height="24" rx="5"/><rect class="fa" x="172" y="40" width="20" height="24" rx="5"/>
```

```variants
[
  {
    "title": "Remove Duplicates from Sorted Array II",
    "source": "LeetCode 80",
    "text": "Allow each value at most twice. The same loop keeps a value when it differs from <code>nums[write − 2]</code>, the second-to-last kept value. If it equals that one, then because the kept slots are sorted the slot between them holds the same value, and writing would make a third copy. Replace 2 by k for at most k copies."
  },
  {
    "title": "Remove Element",
    "source": "LeetCode 27",
    "text": "Remove every copy of a given value. The template is unchanged and only the test moves: keep <code>nums[read]</code> when it is not the unwanted value. The array need not be sorted, because the test looks at one value and not at its neighbour."
  },
  {
    "title": "Unsorted input",
    "source": "Hash Tables module",
    "text": "Without the sort, repeats are no longer adjacent, so \"seen before\" is a global question again. A hash set answers it in O(n) time and O(n) space, or sort first and lose the original order. The one comparison with the last kept value works only because of the sort."
  }
]
```

## Check yourself {#quiz}

```vig "Three questions as rows, the first one answered and ticked"
<circle class="fg" cx="36" cy="24" r="10"/><path class="st" d="M31 24L35 28L42 20"/><circle class="st" cx="36" cy="56" r="10"/><circle class="st" cx="36" cy="88" r="10"/><rect class="fa" x="58" y="19" width="150" height="10" rx="5"/><rect class="fa" x="58" y="51" width="118" height="10" rx="5"/><rect class="fa" x="58" y="83" width="138" height="10" rx="5"/>
```

```quiz
{
  "questions": [
    {
      "question": "For the \"at most 2 copies\" variant, why does comparing <code>nums[read]</code> with <code>nums[write − 2]</code> work?",
      "options": [
        "It looks at the two values the finger read most recently, which are the only ones a third copy could match, whatever the pen has written into the prefix by then.",
        "Two slots back is the furthest the pen has not yet overwritten, so it is the only earlier slot that is still safe to read at that point.",
        "The kept slots are sorted, so if they match, slot <code>write − 1</code> between them holds the value too and writing adds a third copy."
      ],
      "answer": 2,
      "explanation": "The kept prefix is sorted. If <code>nums[read]</code> equals <code>nums[write − 2]</code>, the slot <code>write − 1</code> is sandwiched between two equal values, so it holds that value as well, and writing another would make a third. One comparison rules it out; the invariant does the rest. The slots behind <code>write</code> are never overwritten again, so safety is not the reason."
    },
    {
      "question": "The version that compares <code>nums[read]</code> with <code>nums[write]</code> passes {{wrongPass}} of the lesson's {{cases}} test arrays. What is <code>nums[write]</code> when it is compared?",
      "options": [
        "The last kept value, so the comparison is right and the failure must come from the return statement, which should be <code>write + 1</code>.",
        "The previous value read, <code>nums[read − 1]</code>, so the test compares neighbours, and comparing neighbours is a correct test for a sorted array.",
        "The slot about to be overwritten, holding an unread or stale value the output does not contain, so the test answers the wrong question."
      ],
      "answer": 2,
      "explanation": "The pen is on <code>write</code> and has not written there yet, so the slot still holds what it held before: an unread original value, or a copy left behind by an earlier write. The last kept value is one slot behind, at <code>write − 1</code>. The two coincide only while nothing has been skipped, which is why the short arrays pass and the ten-value array returns {{wrongK10}}."
    },
    {
      "question": "A solution starts with <code>write = 0</code> and compares with <code>nums[write − 1]</code> on the first pass. What happens on <code>[2, 2, 2, 2]</code>?",
      "options": [
        "Both languages raise an error: index −1 lies outside the array in Python and in JavaScript alike, so the first comparison cannot run at all.",
        "Python reads the last element, equal to the first, and keeps nothing: it returns 0. JavaScript reads <code>undefined</code>, keeps the 2, and returns 1.",
        "Both languages treat index −1 as the slot before the start and compare with nothing, so the first value is kept and each returns 1 here."
      ],
      "answer": 1,
      "explanation": "Python counts negative indexes from the end, so <code>nums[-1]</code> is the last element, equal to the first 2, and nothing is kept. JavaScript has no such rule: <code>nums[-1]</code> is an absent property, <code>undefined</code>, which is never equal to a number, so the first value is kept. Seeding <code>write</code> at 1 avoids reading before slot 0 in either language."
    }
  ]
}
```
