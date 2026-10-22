---
title: "Dynamic Arrays, Built From Scratch"
kicker: "Arrays · concept lesson"
headline: "Grow by a factor, and appending stays cheap."
lede: "Back to the train. It was built with a fixed number of cars, and the track right behind the last car belongs to something else, so there is no room to weld on one more. A raw array is fixed at allocation for the same reason. Programs rarely know their sizes up front, so a dynamic array keeps a raw block, tracks how much of it is used, and when it fills, builds a longer train on fresh track and moves every car across. The whole design question is how much longer the new train should be."
chips:
  - "length vs **capacity**"
  - "grow by a **factor**"
  - "shrink **lazily**"
hero: |
  <div class="hero-stage"><div class="hero-art navy"><div class="hero-box" id="heroBox"><svg id="heroBars" viewBox="0 0 560 204" role="img" aria-label="A bar chart of what each of sixteen appends to a doubling dynamic array costs. Most bars are one write. Appends two, three, five and nine are taller, because each had to copy the whole array into a larger block first. A dashed line marks the average cost per append, which stays near two."></svg></div>
  <div class="hero-read" id="heroRead"><div class="hero-num"><b id="heroNum">&nbsp;</b> <span id="heroUnit">writes for 16 appends</span></div><div id="heroCap"></div></div></div></div>
---

## Why a train cannot just grow {#problem toc="Why it cannot grow"}

```caption
A raw block cannot grow in place, so a dynamic array replaces it with a bigger one.
```

```vig "A short train on a track with another train's siding right behind it, and a longer empty track below"
<rect class="fa" x="14" y="24" width="30" height="22" rx="4"/><rect class="fa" x="48" y="24" width="30" height="22" rx="4"/><rect class="fk" x="82" y="24" width="30" height="22" rx="4"/><rect class="fr" x="120" y="24" width="30" height="22" rx="4"/><path class="st" d="M10 52H230"/><path class="sc" d="M60 60V80M56 76L60 80L64 76"/><rect class="st" x="14" y="88" width="30" height="22" rx="4" stroke-dasharray="3 3"/><rect class="st" x="48" y="88" width="30" height="22" rx="4" stroke-dasharray="3 3"/><rect class="st" x="82" y="88" width="30" height="22" rx="4" stroke-dasharray="3 3"/><rect class="st" x="116" y="88" width="30" height="22" rx="4" stroke-dasharray="3 3"/>
```

The memory after a raw array may belong to something else, so the array cannot be stretched. A dynamic array works around that with three parts and one rule:

1. a plain array, the ==backing store==, with some **capacity**;
2. a count of how many slots are actually used, the **length**;
3. when an append finds length equal to capacity, allocate a **bigger** block, copy everything across and retire the old one: build a longer train on a fresh stretch of track and move every car over, one by one.

The rule is how much bigger. That one choice decides whether appending is cheap or ruinous, and the next sections test it with counts instead of taking it on trust. Start by predicting what doubling costs.

```mount #predictcopies
```

Each prediction is a sum of the sizes at which the array was full. The sizes double, so each term is as large as all the earlier ones together, and that is what keeps the total under control.

## The implementation, one resize at a time {#build toc="Implementation"}

```caption
Append writes into a free slot, and a full block is replaced by one twice as large.
```

```vig "A full block copying its values into a block twice as long, with free slots at the end"
<rect class="fa" x="14" y="26" width="28" height="24" rx="3"/><rect class="fa" x="46" y="26" width="28" height="24" rx="3"/><path class="st" d="M28 54V76M60 54V76"/><rect class="fa" x="14" y="80" width="28" height="24" rx="3"/><rect class="fa" x="46" y="80" width="28" height="24" rx="3"/><rect class="fk" x="78" y="80" width="28" height="24" rx="3"/><rect class="st" x="110" y="80" width="28" height="24" rx="3" stroke-dasharray="3 3"/>
```

The standard `list` and `Array` do all of this for you. Here it is from scratch. (A Python list stands in for the raw block; `[None] * capacity` is fixed-size, and the code never uses its own growth.) Step through five appends, then an insert and a pop, and watch which operations ever touch capacity.

```widget #grow "Appends, an insert and a pop, one move at a time"
<div class="extabs" role="group" aria-label="Choose an operation"></div><div class="lvhost"></div>
```

Count what the first tab did: five appends and, over them, 7 copies, so 12 writes in all. `append` is a single write except on the call where length equals capacity, and `_grow` is the only place that copies. `get` and `set` are one slot and never resize. `pop` at the end never shifts, because the end is the one place a slot can be added or removed without moving anyone else. `insert` pays the shift a raw array pays, and grows first if the block is full.

```code solution "A dynamic array that doubles, with a copy counter"
```

```rosetta "What each operation costs"
Operation | Cost, and why
`get` / `set` | O(1): direct index into the backing store
`append` | O(1) amortized: usually one write, now and then a copy of everything
`pop` at the end | O(1): decrease the length, nothing moves
`insert` / delete at i | O(n − i): shifting, inherited from the raw array
```

## How much bigger? {#cost toc="How much bigger"}

```caption
Any factor above one keeps appending cheap on average; a fixed step never does.
```

```vig "Two curves over the same axis, one flat and one climbing steadily"
<path class="st" d="M10 96H230"/><path class="fk" d="M10 80C60 70 120 66 230 64"/><path class="sc" d="M10 92L230 16"/>
```

Doubling makes the sizes at which copies happen a geometric series, 1, 2, 4, 8, and so on. After n appends the copies are 1 + 2 + ⋯ + 2^(k−1) = 2^k − 1, where 2^k is the smallest power of two that holds n values, and that is always less than 2n. Spread over n appends it is under 2 copies each: O(1) amortized. The Big O module's lesson on amortized analysis proves exactly this with a bank of tokens, one charge per append that pays in advance for the next resize. Here the same counts answer a different question: what if the factor is not 2?

```derivation
**Any factor f above 1.** Each capacity is at least f times the one before, and a copy happens when the array is full at that capacity, copying that many values. The copied sizes are therefore at most n, n ÷ f, n ÷ f², and so on, and they sum to less than n × f ÷ (f − 1). That is 2n for a factor of 2, 3n for 1.5 and 5n for 1.25. A larger factor means fewer, larger copies and a smaller total, but it also leaves more of the block unused: right after a resize about (f − 1) ÷ f of it is empty, which is half for 2, a third for 1.5 and a fifth for 1.25. Choosing a factor trades copying for slack.

**A fixed step c.** Copies happen every c appends, at sizes c, 2c, 3c and so on up to n. That arithmetic series sums to about n² ÷ 2c, so each append averages about n ÷ 2c copies. That still grows with n, however large c is.
```

Slide n and switch policies. The faint curves are the other policies, so you can see what each choice does to copies per append as the array grows.

```widget #policy "Copies per append, for five growth policies"
<div class="extabs" role="group" aria-label="Growth policy"></div><div class="model-ctrls"><label class="lp-sl">Appends n <input type="range" id="poN" min="8" max="2000" value="500" aria-label="Number of appends"><b id="poNv"></b></label></div><div class="po-plot" id="poPlot"></div><div class="cm-cards" id="poCards"></div><p class="cost-note" id="poNote"></p>
```

## Growing by a constant {#trap toc="A fixed step"}

```caption
A fixed increment re-copies the same early elements again and again as the array grows.
```

```vig "A long train being rebuilt over and over, each new train just a little longer than the last"
<rect class="fa" x="14" y="20" width="50" height="14" rx="3"/><rect class="fa" x="14" y="42" width="66" height="14" rx="3"/><rect class="fa" x="14" y="64" width="82" height="14" rx="3"/><rect class="fr" x="14" y="86" width="98" height="14" rx="3"/><path class="st" d="M130 18V102"/>
```

Changing one operator in `_grow` still passes every test on small inputs: the array holds the right values, indexes correctly and passes every operation sequence. It fails only on cost.

````warn
Growing by a fixed step, `capacity += 8`, instead of by a factor. The values stay right, but appending 1000 items now makes 62125 element copies where doubling makes 1023. You would build a new train every 8 cars forever, moving the same early cars again each time.

```code mistake "Watch out: capacity += 8"
```
````

Real implementations use a factor for this reason. They do not all use 2. CPython's list grows by about an eighth plus a little, a factor close to 1.125, which keeps the slack small at the price of more resizes; the table below shows its actual capacities.

## Length is not capacity {#insight toc="Slack and shrinking"}

```caption
The block is usually bigger than the data, and shrinking it eagerly can cost more than never shrinking.
```

```vig "A half-empty block with a faint outline of a smaller block and a faint outline of a larger block either side of it"
<rect class="fa" x="14" y="40" width="26" height="24" rx="3"/><rect class="fa" x="44" y="40" width="26" height="24" rx="3"/><rect class="fa" x="74" y="40" width="26" height="24" rx="3"/><rect class="fa" x="104" y="40" width="26" height="24" rx="3"/><rect class="st" x="134" y="40" width="26" height="24" rx="3" stroke-dasharray="3 3"/><rect class="st" x="164" y="40" width="26" height="24" rx="3" stroke-dasharray="3 3"/><rect class="st" x="194" y="40" width="26" height="24" rx="3" stroke-dasharray="3 3"/><path class="sc" d="M14 78H130"/>
```

Space is still O(n): with doubling the block is at most about twice the data, a constant factor. Pop does not give the slack back, and there is a reason. Suppose the array shrinks the moment it is half empty, and the program appends and pops around that boundary. Take a full block of 64. An append grows it, which copies the 64. A pop leaves the array half empty, so it shrinks, which copies the 64 again. The next append is full again. Every single operation now costs a full copy, and the amortized argument is gone.

```widget #thrash "Append and pop around a full block"
<div class="extabs" role="group" aria-label="Shrinking rule"></div><div class="model-ctrls"><label class="lp-sl">Operations <input type="range" id="thN" min="2" max="40" step="2" value="20" aria-label="Number of operations"><b id="thNv"></b></label></div><div class="th-bars" id="thBars" role="img" aria-label="Elements copied by each operation"></div><div class="cm-cards" id="thCards"></div>
```

Shrinking lazily fixes it. If the rule waits until the array is a quarter full and then shrinks to half, a pop that reaches half full does nothing, and the array has to lose half of what it holds before it pays. Real implementations shrink lazily or never, which keeps the amortized bound intact.

The table puts one real runtime beside the lesson's model. The Python capacities were measured here by watching `sys.getsizeof` change as items were appended.

```rosetta "Growth in practice"
Policy | What it does
this lesson's doubling | Capacities 1, 2, 4, 8, 16 and so on; 1000 appends resize 10 times and copy 1023 values
CPython's `list` | Capacities 4, 8, 16, 24, 32, 40, 52, 64, 76 and on, growing by about an eighth; 1000 appends resize the block 28 times
other runtimes | Each picks its own factor; the widget above shows what any factor costs
```

## Where next {#next toc="Where next"}

```vig "Signpost pointing down multiple paths"
<path class="st" d="M120 100V24"/><rect class="fa" x="68" y="22" width="104" height="14" rx="4"/><rect class="fa" x="76" y="42" width="96" height="14" rx="4"/><rect class="fk" x="68" y="62" width="104" height="14" rx="4"/>
```

```variants
[
  {
    "title": "Amortized Analysis & Dynamic Arrays",
    "source": "Big O module",
    "text": "The proof behind the doubling rule, with a bank of tokens that pays for every resize in advance."
  },
  {
    "title": "In-Place Foundations",
    "source": "next lesson in this module",
    "text": "Working inside one array with two indices, so a problem that looks like it needs a second block never allocates one."
  },
  {
    "title": "Stacks and Queues",
    "source": "Stacks and Queues module",
    "text": "A stack is a dynamic array used only at its end, which is the one place that never shifts."
  }
]
```

## Check yourself {#quiz toc="Quiz"}

```vig "Three question rows with one checked off"
<circle class="fg" cx="36" cy="24" r="10"/><path class="st" d="M31 24L35 28L42 20"/><circle class="st" cx="36" cy="56" r="10"/><circle class="st" cx="36" cy="88" r="10"/><rect class="fa" x="58" y="19" width="150" height="10" rx="5"/><rect class="fa" x="58" y="51" width="118" height="10" rx="5"/><rect class="fa" x="58" y="83" width="138" height="10" rx="5"/>
```

```quiz
{
  "questions": [
    {
      "question": "In the implementation above, which calls can trigger the O(n) copy?",
      "options": [
        "get and set, when the capacity bookkeeping has drifted away from the length",
        "append and insert: any call that adds a value while length equals capacity",
        "Only pop, because shrinking the length lets the block release its unused slots"
      ],
      "answer": 1,
      "explanation": "Growth happens in exactly one place, when a value is added to a full block. Reads and writes never resize, and pop only lowers the length."
    },
    {
      "question": "Why does pop at the end cost O(1) while insert at index 0 costs O(n)?",
      "options": [
        "The last slot has nobody behind it, but the front slot needs every value shifted to stay packed",
        "Pop uses spare capacity, so it only moves a counter into slack that was already allocated before the call",
        "Pop is built into the standard library, which skips the interpreter loop that insert has to run in your code"
      ],
      "answer": 0,
      "explanation": "Contiguity is only threatened by changes in the interior. The end is the one place a slot can come or go without moving anyone else, which is why stacks are built there."
    },
    {
      "question": "`_grow` used `capacity += 8` instead of `capacity *= 2`. For 1000 appends, what changes?",
      "options": [
        "Nothing material: 8 is a constant, so any constant step keeps the same amortized bound that doubling gives",
        "{{step8_1000}} copies, not {{dbl1000}}: copies never get rarer and each is larger, so it is O(n) amortized",
        "It costs O(log n) amortized, since a fixed step still spaces the resizes apart in the way a halving pattern does"
      ],
      "answer": 1,
      "explanation": "A step keeps the gap between resizes fixed while each copy gets bigger, so the total grows like n² ÷ 16: {{step8_1000}} copies against {{dbl1000}}, about {{step8per1000}} copies per append instead of one. A factor spaces the resizes exponentially far apart."
    },
    {
      "question": "A block of 64 is full. The program appends, pops, appends, pops, and so on. Shrinking the moment the array is half empty copies how many elements over 20 operations?",
      "options": [
        "{{lazy20}}, once: the first append grows the block, and the pops never reach a shrinking point after that",
        "Close to 20, since each append or pop moves a single value into or out of the block's last slot",
        "{{eager20}}: every operation grows or shrinks the block, copying all 64 values"
      ],
      "answer": 2,
      "explanation": "Each append finds the block full and grows it, copying 64. Each pop leaves it half empty and shrinks it, copying 64 again, so 20 operations copy {{eager20}}. Shrinking at a quarter full copies {{lazy20}}, once, for the first growth."
    }
  ]
}
```
