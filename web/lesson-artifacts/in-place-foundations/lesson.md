---
title: "In-Place Foundations & Symmetric Pointers"
kicker: "In-Place Foundations · Arrays module · concept lesson"
headline: "How do you reverse a train when the yard has only one track?"
lede: "A freight yard has a single siding. There is no second track to park the cars on, so the only way to turn a train round is to uncouple two cars and exchange them where they stand, using one spare coupling pin. That is an in-place algorithm: it reuses the memory it was given and asks for a constant amount more. It has one cost, and the cost is the whole difficulty. Halfway through, part of the train is finished and part is not, and both parts sit on the same track. The tool that keeps you honest is the loop invariant, a claim about what each stretch of track means right now."
chips:
  - "extra space **O(1)**"
  - "time **O(n)**"
  - "proof by **initialize, maintain, terminate**"
hero: |
  <div class="hero-stage"><div class="hero-art navy"><div class="hero-box"><div class="ip-row" id="heroRow" role="img" aria-label="Animation: six train cars numbered 1 to 6 on one track. The outer pair swaps, then the next pair in, then the middle pair, until the numbers read 6 to 1. Markers L and R show the two pointers closing in."><span class="ip-car">1</span><span class="ip-car">2</span><span class="ip-car">3</span><span class="ip-car">4</span><span class="ip-car">5</span><span class="ip-car">6</span></div>
  <div class="ip-ptrs" id="heroPtrs" aria-hidden="true"><span>L</span><span></span><span></span><span></span><span></span><span>R</span></div></div>
  <div class="hero-read" id="heroRead"><div class="hero-num"><b id="heroNum">0</b> <span id="heroUnit">swaps, no second track</span></div><div id="heroCap">Cars 1 to 6 sit in order. <b>L</b> and <b>R</b> stand at the two ends.</div></div></div></div>
---

## One track, no spare {#problem toc="One track"}

```caption
In place means the finished work and the unfinished work share one stretch of track.
```

```vig "A short train of cars on one track, with a single spare slot hovering above it"
<rect class="fa" x="14" y="62" width="30" height="24" rx="5"/><rect class="fa" x="50" y="62" width="30" height="24" rx="5"/><rect class="fa" x="86" y="62" width="30" height="24" rx="5"/><rect class="fa" x="122" y="62" width="30" height="24" rx="5"/><path class="st" d="M8 94H160"/><rect class="fk" x="170" y="24" width="30" height="24" rx="5"/><path class="sc" d="M155 74L168 40"/>
```

A freight yard has a train of six cars and a single siding. The train has to leave the other way round, last car first. In a yard with two tracks you would roll the cars across one at a time and finish with a reversed copy beside the original. On one track there is nowhere to roll them. All you can do is uncouple two cars, exchange them, and couple them back, using one spare coupling pin to hold a car for a moment.

That is an ==in-place algorithm==: it rearranges the data inside the array it was given and uses O(1) extra space, which means an amount of extra memory that stays the same however long the array is. There is no second array and no temporary buffer the size of the input. Three reasons make it worth wanting:

- **Memory.** You reuse the memory you were given instead of asking for n more slots.
- **Time.** Copying n elements is real work, not free bookkeeping.
- **The problem demands it.** Many interview and library problems state O(1) extra space outright.

The widget runs both yards on a train of four cars. On the first tab the cars are copied one by one onto a second track, and the spare space grows with the train. On the second tab two cars trade places through the one spare slot, which is emptied again after every trade.

```widget #ipcost "Reverse four cars: a second track, or one spare slot"
<div class="extabs" role="group" aria-label="Choose a method"></div><div class="lvhost"></div>
```

By the end the copy was holding 4 spare slots, one for every car. The swap never held more than 1, and that slot was empty again after each pair. Add cars and the first number grows with them while the second does not, which is exactly what the cost section below counts.

In-place code pays for this in clarity. It is ==stateful==: at any instant part of the array is transformed and part is untouched, and both parts live in the same memory. If you allocate a second array, input and output are separate things you can reason about separately. In place they are the same array, so you must know at every moment which region means what. There is a tool for exactly that.

## What a loop invariant is {#insight toc="Loop invariants"}

```caption
An invariant is a claim about the regions of the array, true before the loop, after every pass, and at the end.
```

```vig "An array split into a finished block at each end and an unfinished block between them, with two markers on the boundaries"
<rect class="fg" x="14" y="46" width="40" height="28" rx="5"/><rect class="fa" x="60" y="46" width="40" height="28" rx="5"/><rect class="fa" x="106" y="46" width="40" height="28" rx="5"/><rect class="fg" x="152" y="46" width="40" height="28" rx="5"/><polygon class="fc" points="73,24 87,24 80,38"/><polygon class="fk" points="119,24 133,24 126,38"/>
```

When input and output are the same array, you need a way to say which part is which at every instant. A ==loop invariant== is a condition that is true before the loop starts and true again after every pass through it. It is not a line of code. It is a claim about the array, usually about what each region of the array contains right now.

For reversing the train, the pointers `left` and `right` are not really counters. They are the boundaries between regions: everything outside them is finished, and everything between them is still waiting. An invariant becomes a proof when you check three things.

```rosetta "The three checks"
The check | What you show, and why it is enough
Initialization | The invariant is true before the first pass. Here `left` and `right` stand at the two ends, so the finished region outside them is empty, and an empty region is correct without doing anything.
Maintenance | If it is true before a pass, it is still true after it. One swap puts both end cars in their final places, and moving the pointers inward adds exactly those two cars to the finished region.
Termination | When the loop stops, the invariant together with the stop condition gives the result you wanted. The loop stops when `left ≥ right`, so nothing is left unfinished and the whole train is reversed.
```

Initialization and maintenance together give you "true on every pass" by induction: the first pass starts from a true statement, and each pass hands a true statement to the next. That alone is not a result. Termination is the step that turns it into one, by combining the invariant with the exit condition.

```key
The invariant is one sentence, the same before, during and after the loop. Only the amount of array it covers grows, from none of it to all of it.
```

This is the most transferable idea in the lesson. Two pointers, sliding window, binary search and quicksort's partition are all algorithms built on a claim about regions: pick the claim, then make every step keep it true. Learn the framework once here and the later techniques are variations on it.

## Swap, then converge {#solution toc="Converging pointers"}

```caption
Two pointers start at opposite ends and swap their way inward; everything outside them is already final.
```

```vig "Two arrows starting at opposite ends of a row of cars and curving toward the middle"
<rect class="fa" x="14" y="62" width="26" height="24" rx="5"/><rect class="fa" x="46" y="62" width="26" height="24" rx="5"/><rect class="fa" x="78" y="62" width="26" height="24" rx="5"/><rect class="fa" x="110" y="62" width="26" height="24" rx="5"/><rect class="fa" x="142" y="62" width="26" height="24" rx="5"/><rect class="fa" x="174" y="62" width="26" height="24" rx="5"/><path class="sc" d="M27 52C40 24 70 24 84 46"/><path class="sc" d="M187 52C174 24 144 24 130 46"/>
```

The atom of in-place work is the swap, which exchanges two slots:

```code swap "The swap, in both languages"
```

Neither language makes you name a temporary. Under the hood there still is one: the pair on the right-hand side is built before either assignment happens, which is exactly why the swap does not overwrite a slot before it has been read. That hidden pair is the spare slot of the widget above.

The shape built on it is ==converging pointers==. Two pointers start at opposite ends and move toward each other, doing work as they meet. Reversing is the clean case, and its invariant is a claim about regions:

> Invariant: every slot outside [left, right] already holds its final, reversed value.

Step through the four runs below. The unfinished region is the bracket over the slots still waiting, finished cars keep an outline, and the panel under the picture checks the claim against the array itself after every pass.

```widget #rvtabs "Converging pointers on four trains"
<div class="extabs" role="group" aria-label="Choose a run"></div><div class="lvhost"></div>
```

```code solution "reverse_range: swap inward until the pointers meet"
```

Run the three checks on it:

- **Initialization.** Before the loop, `left` and `right` are the two ends of the range, so the region outside them is empty. An empty region is trivially correct.
- **Maintenance.** One swap puts the car at `left` where it belongs (the far end) and the car at `right` where it belongs (the near end). Both are final. Moving the pointers inward grows the outside region by exactly those two cars, so the invariant still holds.
- **Termination.** The loop ends when `left ≥ right`, which leaves the inside region empty or a single middle car. Nothing is unfinished, so everything is in its final place. The tabs show both endings. With six cars the loop stops with `left` at 3 and `right` at 2, having crossed. With seven it stops with both on slot 3, and the one car left is the exact middle, which belongs where it is. Either way the loop ran ⌊n/2⌋ times: 3 swaps for six cars and 3 swaps for seven.

```derivation
**Time O(n).** Each pass does one swap and moves two pointers, and the pointers close the gap by 2 every pass, so the loop runs ⌊n/2⌋ times. Counted by running it, 1,000 cars take 500 swaps. **Space O(1).** Two integers for the pointers and the temporary inside the swap, however long the array is.
```

Taking a `(left, right)` range, not the whole array, is deliberate. The last tab composes three range reversals into a rotation: reverse all 7 cars, then the first 3, then the other 4. Rotating right by 3 puts the last three cars in front, and it needs no new idea, because each range is an in-place reverse with an invariant of its own. The Rotate Array problem later in this module is built from exactly that.

## Looping too far {#trap toc="Looping too far"}

```caption
Loop over every position instead of every pair and each pair is swapped twice, which puts the train back as it was.
```

```vig "A row of cars with two curved arrows that swap a pair and then swap it straight back"
<rect class="fa" x="40" y="64" width="34" height="26" rx="5"/><rect class="fk" x="166" y="64" width="34" height="26" rx="5"/><path class="sc" d="M57 54C85 20 155 20 183 54"/><path class="st" d="M183 100C155 130 85 130 57 100"/><polygon class="fr" points="52,102 64,102 58,92"/>
```

The easy slip is to loop `i` over all n positions and swap `nums[i]` with `nums[n-1-i]`, as if every car needed a turn of its own. But slot `i` and slot `n-1-i` are one pair, and a loop over every position reaches the pair from both ends: once when `i` is on its left car, and again after `i` has crossed the middle and stands on its right car. The second swap undoes the first.

```warn
Looping `i` over all n positions swaps every pair twice, so the train comes back exactly as it went in. For six cars that is 6 swaps instead of 3, and no error is raised.
```

```code mistake "The loop that goes all the way round"
```

Run both loops side by side. The panel holds after every pass of the left tab. On the right tab it holds through the third pass, when the train is fully reversed, and breaks on the fourth, when slots 3 and 2 swap again and cars 3 and 4 go back to where they started. Nothing in the loop notices.

```widget #iptrap "Half the loop, or the whole loop"
<div class="extabs" role="group" aria-label="Choose a loop"></div><div class="lvhost"></div>
```

The half-length is also where the two languages part ways. Python has floor division, so `n // 2` is a whole number, and `range(n / 2)` raises a `TypeError` because `n / 2` is a float. JavaScript has no integer division: `7 / 2` is 3.5, so the loop `i < n / 2` runs for `i` = 0, 1, 2, 3, which is 4 passes where ⌊7 / 2⌋ is 3. The extra pass swaps the middle car with itself and harms nothing here, but it is a pass that should not exist. The `left < right` form never divides, so it cannot make this mistake in either language.

## What it costs {#cost toc="Cost"}

```caption
Reversing in place takes ⌊n/2⌋ swaps and one spare slot, however long the train is.
```

```vig "Two bar groups: bars growing taller with the train for a second track, and a single short bar for the spare slot"
<path class="st" d="M10 100H230"/><rect class="fr" x="20" y="84" width="10" height="16" rx="2"/><rect class="fr" x="36" y="68" width="10" height="32" rx="2"/><rect class="fr" x="52" y="52" width="10" height="48" rx="2"/><rect class="fr" x="68" y="36" width="10" height="64" rx="2"/><rect class="fr" x="84" y="20" width="10" height="80" rx="2"/><rect class="fg" x="140" y="90" width="10" height="10" rx="2"/><rect class="fg" x="156" y="90" width="10" height="10" rx="2"/><rect class="fg" x="172" y="90" width="10" height="10" rx="2"/><rect class="fg" x="188" y="90" width="10" height="10" rx="2"/>
```

Time is the loop above: each pass is a swap, a constant amount of work, and there are ⌊n/2⌋ passes. Space is the part that separates the two yards. The chart below counts the spare slots each method takes, by running both on trains of 0 to 64 cars.

```widget "Spare slots needed to reverse n cars"
<div class="chart" id="ip-chart"></div>
```

```mount #ip-facts
```

Predict before you run it. For three trains, say how many swaps the in-place loop makes.

```widget #ipguess "Predict: how many swaps?"
```

## Where next {#next toc="Where next"}

```caption
Converging pointers close in from both ends; the next lesson's pointers chase each other from one.
```

```vig "Two arrows pointing from the same end of a row, one running ahead of the other"
<rect class="fa" x="14" y="62" width="28" height="24" rx="5"/><rect class="fa" x="48" y="62" width="28" height="24" rx="5"/><rect class="fa" x="82" y="62" width="28" height="24" rx="5"/><rect class="fa" x="116" y="62" width="28" height="24" rx="5"/><rect class="fa" x="150" y="62" width="28" height="24" rx="5"/><polygon class="fc" points="53,36 67,36 60,50"/><polygon class="fk" points="121,36 135,36 128,50"/>
```

The same discipline, pick a claim about the regions and prove it in three checks, carries into pointers that move at different speeds, which is the next lesson. Until then, these are the places this lesson shows up:

```variants
[
  {
    "title": "Stable Compaction & Cyclic Placement",
    "source": "next lesson",
    "text": "A read pointer scans while a write pointer marks the finished prefix, so elements are kept or dropped in one pass with no second array."
  },
  {
    "title": "Rotate Array",
    "source": "problem, this module",
    "text": "Three range reversals turn a rotation into the reversal you just proved. The expert variant moves each element straight to its destination."
  },
  {
    "title": "Quicksort partitioning",
    "source": "Sorting module",
    "text": "Partitioning an array around a pivot is a region invariant too: everything left of one pointer is small, everything right of another is large."
  }
]
```

## Check yourself {#quiz toc="Quiz"}

```caption
Test your understanding of the invariant, the three checks, and the loop that goes too far.
```

```quiz
{
  "questions": [
    {
      "question": "Reversing an array with converging pointers: which invariant makes it correct?",
      "options": [
        "The slots outside [left, right] already hold their final reversed values",
        "The slots inside [left, right] are sorted, because every swap puts the smaller of the two cars nearer the front",
        "The slots outside [left, right] are still in their original positions, because a swap only ever touches the two pointers"
      ],
      "answer": 0,
      "explanation": "Each swap fixes two more cars for good and shrinks the unfinished region by two. When left ≥ right the unfinished region is empty. The inside is not sorted, and the outside is exactly what has moved: every swap sends a car to the far end for good, so the finished slots are the ones that no longer hold their starting car."
    },
    {
      "question": "Which of the three checks is the one that delivers the result you wanted?",
      "options": [
        "Termination: the invariant combined with the exit condition gives the conclusion",
        "Maintenance, because it runs on every pass and so does most of the work of the proof",
        "Initialization, because setting up the invariant correctly decides everything that follows"
      ],
      "answer": 0,
      "explanation": "Initialization plus maintenance give you that the invariant is true on every pass, by induction. That alone is not a result. Termination joins it to the stop condition left ≥ right, and only then does \"outside is final\" become \"everything is final\"."
    },
    {
      "question": "A loop runs `i` from 0 to n − 1 and swaps `nums[i]` with `nums[n-1-i]`. What does it do to a train of {{allSwaps6}} cars?",
      "options": [
        "Leaves it unchanged: every pair is swapped on the way in and swapped back on the way out",
        "Reverses it correctly but wastes {{swaps6}} swaps, since the second half repeats the first half's work harmlessly",
        "Reverses the first half and leaves the second half alone, because the pointers cross at the middle"
      ],
      "answer": 0,
      "explanation": "Pass i and pass n − 1 − i touch the same pair, so each pair is swapped twice and the second swap undoes the first. The array comes back as it started after {{allSwaps6}} swaps, with no error. The correct loop stops when the pointers meet, after {{swaps6}} swaps."
    },
    {
      "question": "In JavaScript, a loop written `for (let i = 0; i < n / 2; i++)` reverses a train of 7 cars. How many passes does it make?",
      "options": [
        "{{jsPasses7}}, one more than ⌊7 / 2⌋, because 7 / 2 is 3.5 and i = 3 still passes the test",
        "{{pyPasses7}}, the same as in Python, since JavaScript rounds 7 / 2 down when it compares it with an index",
        "It never starts, because 7 / 2 is not a whole number and an index cannot be compared with one"
      ],
      "answer": 0,
      "explanation": "JavaScript keeps the fraction: 7 / 2 is 3.5, and the loop continues while i < 3.5, so i takes 0, 1, 2, 3. The fourth pass swaps the middle car with itself, which is harmless here. Python's `range(7 / 2)` would raise a TypeError instead, and `7 // 2` gives {{pyPasses7}}."
    }
  ]
}
```
