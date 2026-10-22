---
title: "Stable Compaction & Cyclic Placement"
kicker: "Stable Compaction & Cyclic Placement · Arrays module · concept lesson"
headline: "How does an inspector shorten a train without moving the whole thing?"
lede: "The last lesson's pointers met in the middle. These two techniques break that symmetry. An inspector walks a train car by car, and every car with cargo worth keeping is re-coupled right behind the last good one, so the good cars end up in a short, gap-free train at the front, in their original order. That is stable compaction, and it takes two indexes walking one array. The second technique is for rearrangements where every car has a known destination that can be anywhere: you carry one parcel along a chain of owners until the chain closes. Both keep the discipline of the last lesson: a claim about regions that every step keeps true."
chips:
  - "compaction is **stable**"
  - "time **O(n)**"
  - "extra space **O(1)**"
hero: |
  <div class="hero-stage"><div class="hero-art navy"><div class="hero-box"><div class="cp-row" id="heroRow" role="img" aria-label="Animation: five train cars carrying 0, 1, 0, 3 and 12. An inspector walks from the engine. Each car that carries something is re-coupled behind the last kept car, so the train ends 1, 3, 12 at the front. Markers R and W show the read and write positions."><span class="cp-car">0</span><span class="cp-car">1</span><span class="cp-car">0</span><span class="cp-car">3</span><span class="cp-car">12</span></div>
  <div class="cp-ptrs" id="heroPtrs" aria-hidden="true"><span>R W</span><span></span><span></span><span></span><span></span></div></div>
  <div class="hero-read" id="heroRead"><div class="hero-num"><b id="heroNum">0</b> <span id="heroUnit">cars kept</span></div><div id="heroCap">Five cars. The inspector (<b>R</b>) starts at the engine, and the coupling point (<b>W</b>) with it.</div></div></div></div>
---

## The inspector walks the train {#problem toc="The inspector"}

```caption
Keep some cars, drop the rest, preserve their order, and do it all inside the one array.
```

```vig "A train where the cars with cargo are re-coupled at the front and the empty ones are left behind on a siding"
<rect class="fg" x="14" y="40" width="28" height="24" rx="5"/><rect class="fg" x="46" y="40" width="28" height="24" rx="5"/><rect class="fg" x="78" y="40" width="28" height="24" rx="5"/><rect class="fa" x="130" y="76" width="28" height="24" rx="5"/><rect class="fa" x="162" y="76" width="28" height="24" rx="5"/><path class="st" d="M8 72H112M120 108H200"/><path class="sc" d="M112 72C122 72 124 88 128 88"/>
```

The task is to keep some elements, drop the rest, preserve the relative order of the ones you keep, and use O(1) extra space.

An inspector walks the train from the engine, checking each car's cargo. A car with cargo worth keeping is re-coupled immediately behind the last car that passed inspection: no gap, and no reshuffling of cars that were already re-coupled. A car carrying nothing worth keeping is skipped and left behind on the original track. By the time the inspector reaches the caboose, every kept car is coupled into one short, gap-free train at the front, in the same relative order it started in.

Two indexes walk the same array:

- ==read== scans every element, left to right: the inspector walking car by car.
- ==write== marks the boundary of the finished prefix: the coupling point where the next kept car will join the shortened train.

> Invariant: nums[0 .. write) holds exactly the keepers seen so far, in their original relative order.

Step through four trains. The bracket over the front is that prefix, the outlined cars are the ones just coupled, and the panel checks three claims against the array itself after every car: the prefix holds, `write` has not passed `read`, and no car the inspector has not reached has been touched.

```widget #rwtabs "Read and write pointers on four trains"
<div class="extabs" role="group" aria-label="Choose a train"></div><div class="lvhost"></div>
```

Look at what is left after the prefix. On the first tab the train ends as 1, 3, 12 in slots 0 to 2, with 3 and 12 still sitting in slots 3 and 4. Nothing erased them; the pointers simply stopped caring about those slots. Hold on to that, because it is exactly what the invariant does and does not say.

## The code, and why it is safe {#solution toc="Read and write"}

```caption
write advances only when a keeper is placed, so it can never get ahead of read; that is the whole safety argument.
```

```vig "Two arrows over a row of slots, the read arrow ahead and the write arrow trailing behind it"
<rect class="fa" x="14" y="62" width="26" height="24" rx="5"/><rect class="fa" x="46" y="62" width="26" height="24" rx="5"/><rect class="fa" x="78" y="62" width="26" height="24" rx="5"/><rect class="fa" x="110" y="62" width="26" height="24" rx="5"/><rect class="fa" x="142" y="62" width="26" height="24" rx="5"/><rect class="fa" x="174" y="62" width="26" height="24" rx="5"/><polygon class="fk" points="55,34 69,34 62,48"/><polygon class="fc" points="151,34 165,34 158,48"/>
```

```code solution "keep_if: the read/write template"
```

Run the three checks on it:

- **Initialization.** `write = 0`, so `nums[0 .. 0)` is the empty range: zero keepers seen, zero keepers stored. True.
- **Maintenance.** `read` advances on every iteration, and `write` advances only when a keeper is placed, so `write ≤ read` always holds. That is the safety argument. The slot you overwrite is slot `write`, and a slot at or behind `read` has already been read on this iteration or an earlier one, so you can never destroy a car you still need. A keeper then extends the prefix by one and a non-keeper leaves it alone, so the invariant survives either way.
- **Termination.** `read` has passed every element, so "keepers seen so far" means all of them. The invariant now says that `nums[0 .. write)` holds every keeper, in order, and `write` is the new logical length.

The argument is short, so run it rather than trust it. The page ran `keep_if` on 500 random trains and checked every copy against the read position: of 2,312 copies in all, 0 landed on a slot that `read` had not reached.

Note what the invariant does not promise. It says nothing about `nums[write .. n)`. That region is leftover history, which is exactly why the function returns a length and does not pretend the array shrank: the same split a dynamic array keeps between its length and its capacity.

```derivation
**Time O(n).** `read` visits each slot once and each visit does a constant amount of work. **Space O(1).** Two integers, however long the train is. Counted by running it, a train of 1,000 cars with every other one dropped takes 500 copies.
```

## Deleting as you walk {#trap toc="Deleting as you walk"}

```caption
Delete a car while an iterator walks the list and the next car slides into the slot the iterator has just left.
```

```vig "A row of cars where one is removed, the cars after it slide left, and the walking marker steps right past the car that slid into its place"
<rect class="fa" x="14" y="62" width="28" height="24" rx="5"/><rect class="fr" x="78" y="62" width="28" height="24" rx="5"/><rect class="fa" x="110" y="62" width="28" height="24" rx="5"/><rect class="fa" x="142" y="62" width="28" height="24" rx="5"/><path class="sc" d="M92 52L92 36M128 76L108 76"/><polygon class="fk" points="121,30 135,30 128,44"/>
```

The obvious way to drop cars is to delete each one as you meet it: `for x in nums: if drop: nums.remove(x)`. It looks like compaction and it breaks in two ways. First, the loop walks by position. Deleting the car in slot `i` slides every later car one slot left, so the car that was in slot `i + 1` is now in slot `i`, and the loop's next step goes to slot `i + 1`. That car is never inspected. Second, every delete shifts the whole tail, which is a cost the pointers never pay.

```warn
Deleting while iterating skips the car after every deleted car, so two cars to drop side by side leave one behind. In both runtimes, keeping the even cars of 1, 3, 5, 2, 4, 6 returns 4 cars and leaves the 3 on the train.
```

```code mistake "The delete that skips a car"
```

Run both versions on the same train. The pointer version holds all three claims after every car. The delete version breaks the first one at the first delete, when the 3 slides into slot 0 before the iterator moves on, and it never recovers, though it loses no keeper. By the end it has shifted 8 cars and left the 3 behind; the pointer version made 3 copies and got it right.

```widget #rwtrap "Pointers, or delete as you go"
<div class="extabs" role="group" aria-label="Choose a method"></div><div class="lvhost"></div>
```

## Cyclic placement: parcels along a chain {#walk toc="Cyclic placement"}

```caption
When every car has a known destination, no prefix grows. You carry one parcel along a chain of owners until the chain closes.
```

```vig "Four seats in a ring with a curved arrow from each to the next, and one parcel held out in a hand"
<circle class="fa" cx="120" cy="56" r="34"/><circle class="fk" cx="120" cy="22" r="8"/><circle class="fk" cx="154" cy="56" r="8"/><circle class="fk" cx="120" cy="90" r="8"/><circle class="fk" cx="86" cy="56" r="8"/><path class="sc" d="M130 24C146 28 152 40 152 46"/><rect class="fc" x="196" y="44" width="22" height="22" rx="5"/>
```

Some rearrangements are permutations with known destinations: the element at `i` belongs at `(i + k) mod n`. Read and write pointers do not apply, because there is no single prefix growing left to right. Every element's destination can be anywhere.

Picture a group of people, each holding one parcel, where every parcel has a specific new owner. You take a parcel to its rightful owner, but that owner is already holding a parcel of their own, which you now carry on to its rightful owner, and so on. You pass parcels along a chain of owners until, eventually, someone hands you the parcel that was meant for the seat you started from. The chain has closed. Throughout, you carry exactly one parcel, which is the O(1) space.

```widget #cytabs "Carry one parcel along each chain"
<div class="extabs" role="group" aria-label="Choose a number of seats"></div><div class="lvhost"></div>
```

It is subtle because you must notice when a chain closes and where the next one starts. A chain closes the moment it comes back to the seat it began at. The next chain can begin at the very next seat: as the next section derives, the chains are the groups of seats that leave the same remainder when divided by gcd(n, k), so seats 0, 1, 2 and so on each belong to a different chain until every chain has been walked. The inner loop ends when a chain closes, and the outer loop ends when n parcels have been set down.

```code cyclic "rotate_cyclic: one parcel in hand, one chain at a time"
```

Two guards sit at the top. `k` may exceed `n`, and rotating by `n + 2` is rotating by 2, so the code reduces `k` first. And the empty array must return before that reduction, because `k % 0` is not the same thing in the two languages: Python raises `ZeroDivisionError`, while JavaScript quietly gives `NaN`, and `nums[NaN]` is `undefined`.

## How many chains? {#rings toc="How many chains"}

```caption
Shifting n seats by k splits them into gcd(n, k) separate chains, each n / gcd(n, k) seats long.
```

```vig "A ring of cells with two interleaved loops drawn through alternate cells"
<circle class="st" cx="120" cy="56" r="40"/><circle class="fa" cx="120" cy="16" r="7"/><circle class="fk" cx="160" cy="56" r="7"/><circle class="fa" cx="120" cy="96" r="7"/><circle class="fk" cx="80" cy="56" r="7"/><path class="sc" d="M120 23C140 40 150 46 154 52"/>
```

The seats live on a clock, so the ring from the last module is the right picture. A parcel starting at seat `s` returns to `s` after `t` hops exactly when `t · k` is a multiple of `n`. Write `g = gcd(n, k)`. Dividing `n` and `k` by `g` leaves two numbers with nothing in common, and `n` divides `t · k` exactly when `n / g` divides `t · (k / g)`; since `n / g` and `k / g` share no factor, that happens only when `n / g` divides `t`. So the smallest `t` is `n / g`: every chain is `n / g` seats long, and n seats make `g` chains.

```widget #cyring "Three residue rings: where the chains close"
<div class="extabs" role="group" aria-label="Choose a ring"></div><div class="lvhost"></div>
```

For six seats and `k = 2`, `g` is 2, so there are 2 chains of 3 seats: the parcel from seat 0 is home after 3 hops, and the other 3 seats are a chain of their own that it never visits. For five seats and `k = 2`, `g` is 1, so one chain of 5 seats touches every seat before it closes. That is why a single walk from seat 0 sometimes finishes the job and sometimes does not.

The third tab shows the language fork. Rotating right uses `(i + k) % n`, which both languages agree on while `i + k` is not negative. Rotating left uses `(i − k) % n`, and when `i − k` is negative Python's `%` floors, so `(0 − 2) % 6` is 4, while JavaScript's truncates toward zero, so `(0 − 2) % 6` is −2, which is not a seat. In JavaScript write `((i − k) % n + n) % n`, or rotate right by `n − k`.

## Stopping after the first chain {#attempt toc="One chain is not enough"}

```caption
One walk from seat 0 closes one chain; it moves every parcel only when there is just one chain.
```

```vig "A ring of seats where only one of two interleaved loops has been walked, the other left untouched"
<circle class="st" cx="120" cy="56" r="40"/><circle class="fg" cx="120" cy="16" r="7"/><circle class="fg" cx="160" cy="56" r="7"/><circle class="fg" cx="120" cy="96" r="7"/><circle class="fr" cx="80" cy="56" r="7"/>
```

The tempting shortcut is to follow the chain from seat 0 and stop when it closes, as if one chain always covered the ring. When `gcd(n, k)` is 1 it does, so the shortcut passes every test with a coprime `n` and `k`. Otherwise the loop closes after `n / gcd(n, k)` seats and quits, leaving the seats of the other chains exactly where they started.

```warn
Stopping when the first chain closes moves every parcel only if gcd(n, k) is 1. For six seats and k = 2 it moves 3 of the 6 and leaves the other 3 where they started, with no error.
```

```code cyclic_mistake "The rotation that stops after one chain"
```

The first tab runs that loop on six seats, and the second runs the same loop on five, where it happens to be correct. A test suite that only tried odd lengths with `k = 2` would never catch it.

```widget #cymistake "The same loop, two trains"
<div class="extabs" role="group" aria-label="Choose a number of seats"></div><div class="lvhost"></div>
```

## What it costs {#cost toc="Cost"}

```caption
Both techniques do O(n) work with one slot to spare; the delete they replace does about n² / 4.
```

```vig "Two bar groups: a steep staircase of bars for deleting and sliding, and a short flat row for the pointers"
<path class="st" d="M10 100H118M130 100H230"/><rect class="fr" x="14" y="86" width="9" height="10" rx="2"/><rect class="fr" x="27" y="74" width="9" height="22" rx="2"/><rect class="fr" x="40" y="60" width="9" height="36" rx="2"/><rect class="fr" x="53" y="46" width="9" height="50" rx="2"/><rect class="fr" x="66" y="32" width="9" height="64" rx="2"/><rect class="fr" x="79" y="20" width="9" height="76" rx="2"/><rect class="fg" x="134" y="86" width="8" height="14" rx="2"/><rect class="fg" x="148" y="86" width="8" height="14" rx="2"/><rect class="fg" x="162" y="86" width="8" height="14" rx="2"/><rect class="fg" x="176" y="86" width="8" height="14" rx="2"/>
```

The read and write pointers touch each car once and copy a keeper at most once, so the time is O(n). Deleting each unwanted car and sliding the rest left pays for the slide every time. The chart counts the cars each method moves on a train where every other car is dropped, which is where the slide hurts most.

```widget "Cars moved to drop every other car"
<div class="chart" id="cp-chart"></div>
```

```mount #cp-facts
```

Cyclic placement is O(n) too, and the facts above show why: every parcel is set down exactly once, however many chains there are, and the one parcel in hand is the only extra space. Predict how many chains three rotations split into.

```widget #cypred "Predict: how many separate chains?"
```

## Where next {#next toc="Where next"}

```caption
The compaction template drives the next two problems; cyclic placement is the expert route through the third.
```

```vig "A signpost with arrows pointing to three problem names"
<path class="st" d="M120 100V24"/><rect class="fa" x="64" y="22" width="108" height="14" rx="4"/><rect class="fa" x="72" y="42" width="100" height="14" rx="4"/><rect class="fk" x="64" y="62" width="108" height="14" rx="4"/>
```

The next two problems, Remove Duplicates and Move Zeroes, are the template above with a different keep condition, which is why they are your first solve-first exercises.

```variants
[
  {
    "title": "Remove Duplicates from Sorted Array",
    "source": "problem, this module",
    "text": "Keep a car only when it differs from the last car kept. The same read and write pointers, with the keep test comparing against the kept prefix."
  },
  {
    "title": "Move Zeroes",
    "source": "problem, this module",
    "text": "Keep every non-zero, then fill the rest with zeroes. The same template, and the leftover history after the prefix is what you overwrite."
  },
  {
    "title": "Rotate Array",
    "source": "problem, this module",
    "text": "The expert variant moves each element straight to its destination along its chain, which is the cyclic placement here, with the chain count and the n = 0 guard to get right."
  },
  {
    "title": "Partition pointers",
    "source": "Two Pointers module",
    "text": "A write pointer marks the boundary of one region while a read pointer scans: the same prefix invariant, applied to sorting colours and partitioning around a pivot."
  }
]
```

## Check yourself {#quiz toc="Quiz"}

```caption
Test your understanding of the safety argument, the leftover tail, the chain count and the language fork.
```

```quiz
{
  "questions": [
    {
      "question": "In the read/write template, why does `nums[write] = nums[read]` never destroy data we still need?",
      "options": [
        "write ≤ read always, so the slot being overwritten has already been read",
        "The keepers all start to the left of the non-keepers, so the copy always lands on a car that is being dropped anyway",
        "The loop copies the array first and reads from the copy, so the live array can be overwritten freely as it goes"
      ],
      "answer": 0,
      "explanation": "write advances at most as fast as read, so the slot it names is never ahead of the car being inspected. Every car at or behind read has been looked at already, so overwriting one cannot lose a car the loop still needs. The ordering argument is the template's whole safety proof, and it needs no copy and no assumption about where the keepers start."
    },
    {
      "question": "After keep_if returns, what do the slots from write onward hold?",
      "options": [
        "Leftover old values, which the invariant says nothing about",
        "The dropped cars in their original order, because skipping a car pushes it towards the end of the train as the pointers pass",
        "Zeroes, because every slot the write pointer passes over is cleared before it moves on to the next one"
      ],
      "answer": 0,
      "explanation": "The invariant only governs the slots before write. What sits after it is whatever the earlier passes left behind, which is why the function returns the new length: a caller who reads past it sees stale values, exactly like the unused capacity of a dynamic array."
    },
    {
      "question": "Rotating {{quizN}} seats by k = {{quizK}} sends seat i to seat (i + {{quizK}}) mod {{quizN}}. How many separate chains do the seats form?",
      "options": [
        "{{quizCycles}}, which is gcd({{quizN}}, {{quizK}}), each chain {{quizLen}} seats long",
        "1, because every seat is eventually reached by following the hops from seat 0",
        "{{quizLen}}, the number of seats in each chain, since the chains are as many as they are long"
      ],
      "answer": 0,
      "explanation": "A chain closes after n / gcd(n, k) hops, so each chain has {{quizLen}} seats and the {{quizN}} seats make {{quizCycles}} chains. Following hops from seat 0 reaches only the seats whose numbers are multiples of {{quizCycles}}, so one walk is not enough."
    },
    {
      "question": "In JavaScript, rotating left by 2 on 6 seats, what does `(0 - 2) % 6` give, and what fixes it?",
      "options": [
        "{{jsNegMod}}, because % keeps the sign of the left operand; write ((i − k) % n + n) % n",
        "{{pyNegMod}}, the same as in Python, because both languages floor the quotient for a negative left operand",
        "NaN, because a negative number cannot be reduced modulo a positive one; reduce k before subtracting"
      ],
      "answer": 0,
      "explanation": "JavaScript's % truncates toward zero, so the result takes the sign of the left operand: (0 − 2) % 6 is {{jsNegMod}}, which is not a seat. Python floors instead and gives {{pyNegMod}}. Adding n and reducing again lifts a negative remainder into [0, n) in both runtimes."
    }
  ]
}
```
