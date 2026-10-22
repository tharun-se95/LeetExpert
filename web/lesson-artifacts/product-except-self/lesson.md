---
title: "Product of Array Except Self"
kicker: "Product of Array Except Self · Arrays module · problem lesson"
headline: "How do you get everyone-but-me without dividing the total by me?"
lede: "A request passes through a pipeline of stages, and each stage scales its throughput by a gain: ×2, ×3, or ×0 for a stage that is switched off. For capacity planning you want, for every stage, the gain of all the others: what the pipeline would deliver with that stage bypassed. The tempting shortcut is to compute the whole pipeline's gain once and divide each stage's own gain back out. It fails exactly where it matters, at a stage that is off, because you cannot undo a ×0. The reliable way is to see that the other stages are the ones upstream and the ones downstream, and each of those is a running product."
chips:
  - "needs **prefix and suffix products**"
  - "time **O(n)**"
  - "space **O(1)** beyond the output"
hero: |
  <div class="hero-stage"><div class="hero-art navy"><div class="pp-hero" id="heroPipe" role="img" aria-label="Animation: a row of four stage gains, 1, 2, 3 and 4, above a row that fills in with the product of all the other stages. A forward sweep writes the products of everything upstream, then a backward sweep multiplies in everything downstream, finishing each cell from the last to the first, to give 24, 12, 8 and 6."></div>
  <div class="hero-read" id="heroRead"><div class="hero-num"><b id="heroNum">1</b> <span id="heroUnit">written to answer[0]</span></div><div id="heroCap"></div></div></div></div>
---

## Problem {#problem}

```vig "A row of four stages with the second one crossed out, an arrow in from the left and an arrow out to the right"
<rect class="fa" x="14" y="44" width="40" height="40" rx="8"/><rect class="st" x="66" y="44" width="40" height="40" rx="8" stroke-dasharray="3 3"/><path class="st" d="M72 50L100 78M100 50L72 78"/><rect class="fa" x="118" y="44" width="40" height="40" rx="8"/><rect class="fa" x="170" y="44" width="40" height="40" rx="8"/><path class="sc" d="M14 28H56"/><path class="sc" d="M51 24.6L56 28L51 31.4"/><path class="sc" d="M118 100H206"/><path class="sc" d="M201 96.6L206 100L201 103.4"/>
```

Given `nums`, return `answer` where `answer[i]` is the product of every element of `nums` **except** `nums[i]`. It has to run in O(n) and **may not use division**. The follow-up asks for O(1) extra space, not counting the output array.

```examples
nums = [1,2,3,4] → [24,12,8,6]
nums = [-1,1,0,-3,3] → [0,0,9,0,0]
```

```constraint
2 ≤ n ≤ 10⁵, products fit in 32 bits, no division.
```

Read `nums[i]` as the gain of stage `i` in a pipeline, and `answer[i]` as the gain of everything else: the pipeline with stage `i` bypassed. Every answer leaves out exactly one stage, and a different one each time, which is why a single total will not do on its own.

Try it by hand. Press a stage to bypass it and see its answer built from the stages before it and the stages after it.

```widget #pick "Explore: bypass one stage"
<div class="extabs" role="group" aria-label="Choose a pipeline"></div><div class="tv-wrap"><div class="pp-stages" role="group" aria-label="Stages. Press one to bypass it."></div></div><div class="readout" aria-live="polite"></div><div class="actions"><button type="button" class="btn2 reset">Clear</button><button type="button" class="btn2 best">Show every answer</button></div>
```

## Attempt it first {#attempt}

```caption
Everything except one is the stages before it times the stages after it.
```

```vig "Three arrows: a long one over the whole row, and two shorter ones that stop on either side of one cell"
<rect class="fa" x="14" y="56" width="26" height="26" rx="6"/><rect class="fa" x="46" y="56" width="26" height="26" rx="6"/><rect class="fk" x="78" y="56" width="26" height="26" rx="6"/><rect class="fa" x="110" y="56" width="26" height="26" rx="6"/><rect class="fa" x="142" y="56" width="26" height="26" rx="6"/><path class="st" d="M14 28H168" stroke-dasharray="3 3"/><path class="sc" d="M14 100H72"/><path class="sc" d="M67 96.6L72 100L67 103.4"/><path class="sc" d="M110 100H168"/><path class="sc" d="M163 96.6L168 100L163 103.4"/>
```

First, why is division banned? With no zeros it would make this easy: multiply everything once, then `total ÷ nums[i]` answers every position. The ban is there because that shortcut breaks, and the next section shows how. Work out the answer for a few small cases before reaching for anything cleverer, and see what the answer at each position is made of. Predict each array, then check.

```widget "Predict the array"
<div id="predict"></div>
```

```reveal #hint1 "Hint 1: split the product at i"
Everything except `nums[i]` is two groups: the elements to the left of `i` and the elements to the right. So `answer[i]` is the product of the left group times the product of the right group. Would knowing every left-product and every right-product solve it?
```

```reveal #hint2 "Hint 2: running products, in both directions"
The product of the elements left of `i` extends the one for `i − 1` by a single multiplication, so one forward sweep builds all of them. One backward sweep builds the right-products the same way. That is O(n) time with two helper arrays: get that version working first.
```

```reveal #hint3 "Hint 3: for O(1) extra, reuse the output"
Write the left-products straight into `answer`. Then sweep backward carrying the right-product in a single number, and multiply it into `answer[i]` as you go. That number does the job the whole `right` array did.
```

## Two traps {#trap}

```caption
Division breaks at a zero, and trying every position is the slow way to be correct.
```

```vig "A crossed-out division sign next to a cell holding zero, and a grid of every position against every other"
<circle class="fr" cx="44" cy="56" r="22"/><path class="st" d="M32 56H56"/><circle class="st" cx="44" cy="44" r="2.5"/><circle class="st" cx="44" cy="68" r="2.5"/><path class="st" d="M26 38L62 74"/><rect class="st" x="124" y="26" width="92" height="64" rx="6"/><path class="st" d="M124 48H216M124 69H216M155 26V90M186 26V90"/><circle class="fc" cx="170" cy="37" r="4"/><circle class="fc" cx="140" cy="58" r="4"/><circle class="fc" cx="201" cy="58" r="4"/><circle class="fc" cx="140" cy="79" r="4"/><circle class="fc" cx="170" cy="79" r="4"/>
```

**The first trap is division.** Multiply everything once, then divide each element back out:

```code mistake_division "The whole product, divided back out"
```

This is exactly right when no element is zero, and it is wrong the moment one is. The table runs it, with JavaScript's division, next to the true answers.

```widget "Total ÷ each element, against the true answer"
<div class="ex" id="div-table"></div><p class="cost-note" id="divNote"></p>
```

The cause is that a zero cannot be undone. Dividing by `x` recovers "the product of the others" only if `x` was a factor you can take back out, and a zero factor made the total 0 no matter what the others were. The information about the other elements is gone before the division starts.

**The second trap is trying every position.** Multiply the other `n − 1` elements for each position:

```code naive "Multiply the others, once per position"
```

This is correct and does n(n − 1) multiplications, since each of the n positions multiplies the other n − 1 elements. The chart counts them by running the code, next to the two sweeps that the rest of the lesson builds.

```widget "Multiplications made as the array grows"
<div class="chart" id="cost"></div><p class="cost-note" id="costNote"></p>
```

## The insight {#insight}

```caption
answer[i] is the product of the stages before i times the product of the stages after i.
```

```vig "A row of cells with two arrows meeting at one cell: a product accumulated from the left, and one from the right"
<rect class="fa" x="14" y="50" width="26" height="26" rx="6"/><rect class="fa" x="46" y="50" width="26" height="26" rx="6"/><rect class="st" x="78" y="50" width="26" height="26" rx="6" stroke-dasharray="3 3"/><rect class="fa" x="110" y="50" width="26" height="26" rx="6"/><rect class="fa" x="142" y="50" width="26" height="26" rx="6"/><path class="sc" d="M14 36C40 18 70 18 88 40"/><path class="sc" d="M85 34L88 40L82 40"/><path class="sc" d="M168 36C142 18 112 18 94 40"/><path class="sc" d="M97 34L94 40L100 40"/>
```

Everything except `nums[i]` is two groups: the elements before `i` and the elements after it. Call their products `left[i]` and `right[i]`:

> left[i] = nums[0] × … × nums[i − 1]  ·  right[i] = nums[i + 1] × … × nums[n − 1]

An empty group multiplies to 1, so `left[0]` and `right[n − 1]` are 1 and erase nothing. Then `answer[i] = left[i] × right[i]`, because the two groups together are every element but `i`.

That would cost about n multiplications per position if each product were computed from scratch. They do not need to be. Each one extends its neighbour by a single multiplication: `left[i] = left[i − 1] × nums[i − 1]` just adds stage `i − 1` to the group, and `right[i] = right[i + 1] × nums[i + 1]` does the same from the other end.

```key
answer[i] = left[i] × right[i]: everything before i times everything after it, each built by a sweep that extends the previous entry by one multiplication.
```

```rosetta "The code, read as the pipeline"
In the code | In the pipeline
`nums[i]` | stage i's gain
`answer[i]` | the gain of all the other stages: the pipeline with stage i bypassed
`left[i]` | the combined gain of every stage upstream of i
`right[i]` | the combined gain of every stage downstream of i
`left[i - 1] * nums[i - 1]` | extend the upstream gain by one more stage
`total / nums[i]` | un-doing stage i's gain, which is impossible for a stage with gain 0
```

Watch the three passes on a small pipeline. The panel above the caption checks every filled entry against the definition, "multiply every other stage", at the end of each step.

```widget #helpers "Walk the two helper arrays"
<div class="extabs" role="group" aria-label="Choose a pipeline"></div><div class="lvhost"></div>
```

## Solution {#solution}

```caption
Left products written into the output, right products carried in one number.
```

```vig "A row of cells holding left products, with a single small box beside the row carrying a running value"
<rect class="fk" x="14" y="52" width="26" height="26" rx="6"/><rect class="fk" x="46" y="52" width="26" height="26" rx="6"/><rect class="fk" x="78" y="52" width="26" height="26" rx="6"/><rect class="fk" x="110" y="52" width="26" height="26" rx="6"/><rect class="fc" x="178" y="52" width="26" height="26" rx="6"/><path class="sc" d="M170 65H144"/><path class="sc" d="M148 62L144 65L148 68"/><path class="st" d="M14 94H136"/><path class="st" d="M131 90.6L136 94L131 97.4"/>
```

The two helper arrays cost O(n) extra space, and the problem allows only the output. The output has to exist anyway, so write the left products straight into it. The right products are needed in the opposite order, and each is used the moment it is formed, so one number is enough: when the backward sweep reaches `i`, `right` holds the product of everything after `i`. Multiply it into `answer[i]`, then include `nums[i]` for the stage before. The order inside that pair of lines is the whole trick.

Watch it on the same pipelines. The output array holds the left products after the forward sweep, and each cell is finished as the backward sweep passes it.

```widget #stepper "Walk the one-array version"
<div class="extabs" role="group" aria-label="Choose a pipeline"></div><div class="lvhost"></div>
```

Attempt it on paper first: write both loops, decide what `answer` and `right` start as, and say what each line of the backward sweep does. Then compare.

`````reveal #solbox "Show the solution"
```code solution "Forward for the left, backward for the right"
```

```notes
The forward loop is `left[i] = left[i - 1] × nums[i - 1]` with `answer` as the storage. `answer[0]` stays 1, the empty product. The backward loop visits each position once, from the end. At position `i`, `right` already holds `nums[i + 1] × … × nums[n − 1]`, so `answer[i] *= right` turns the stored left product into left × right. Only then does `right *= nums[i]` take `nums[i]` into the group, ready for position `i − 1`. Swapped, `nums[i]` would be multiplied into its own answer.

A zero needs no case of its own. If `nums[z]` is 0, every answer except `answer[z]` has it on one side or the other, so its product contains a 0 and is 0. `answer[z]` leaves `nums[z]` out, so it is the true product of the rest. The sweeps compute exactly that without ever looking for a zero: on `[-1, 1, 0, -3, 3]` they return `[0, 0, 9, 0, 0]`, and 9 is (−1) × 1 × (−3) × 3.
```

```derivation
**Time O(n).** The forward sweep makes n − 1 multiplications and the backward sweep makes two per position, 3n − 1 in all: {{mults4}} for the four-stage pipeline, counted by running it, and {{limitMults}} at the constraint's {{limitN}} elements. The brute force needs {{limitNaive}} there, about {{naiveSecs}} seconds at 10⁸ a second. Every element is multiplied in at least once, so linear is the least possible.

**Space O(1) beyond the output.** One number, `right`, whatever the length. The `answer` array is the required result, not auxiliary storage.
```

````warn
Do not fold `nums[i]` into `right` before multiplying. If the two lines of the backward loop are swapped, `right` already contains `nums[i]` when it is multiplied into `answer[i]`, so every position ends up holding its left side times its own value times its right side: the whole product, at every position. On `[1, 2, 3, 4]` it returns {{swapAnswers}}.

```code mistake_swap_order "The mistake"
```
````
`````

## Where the languages differ {#cost toc="Two languages"}

```caption
The same sweeps give the same numbers in Python and JavaScript, until a zero or a big product shows the difference.
```

```vig "Two copies of the same row of numbers, one with a small sign mark on a zero and one without"
<rect class="fa" x="14" y="22" width="30" height="26" rx="6"/><rect class="fa" x="50" y="22" width="30" height="26" rx="6"/><rect class="fa" x="86" y="22" width="30" height="26" rx="6"/><rect class="fa" x="14" y="68" width="30" height="26" rx="6"/><rect class="fa" x="50" y="68" width="30" height="26" rx="6"/><rect class="fa" x="86" y="68" width="30" height="26" rx="6"/><path class="st" d="M20 35H30"/><path class="sc" d="M20 81H24"/><path class="st" d="M140 35H210M140 81H210"/><circle class="fr" cx="170" cy="58" r="5"/>
```

The sweeps are the same loops in both languages, and on the lesson's examples they agree. They can still disagree in two ways that do not come from the algorithm at all. Python integers and JavaScript numbers are different kinds of value, and this problem is built from multiplications, which is where the difference shows.

**A zero can carry a sign.** A JavaScript number is a floating-point double, and a double has a negative zero: `0 * -3` is `-0`. A Python `int` has no such thing. So on the zero example the TypeScript solution holds negative zeros in some positions where Python prints plain ones, as the first row of the table shows. Almost everything treats the two zeros as equal: `===` does, and so does `JSON.stringify`, which is how the sandbox compares answers (second row). `Object.is` does not, and neither does Node's `assert.deepStrictEqual`, so a test that compares with those fails on a correct answer (third row). Adding `0` to each entry turns `-0` into `0`.

**A product can leave the exact range.** A double stores integers exactly only up to 2⁵³ − 1, which is 9,007,199,254,740,991. Past that it rounds to the nearest value it can hold, silently. Python integers grow as large as needed and stay exact. The constraint promises that products fit in 32 bits, far below that line, so `number` is safe here and the solutions above are right. Take the promise away and the last two rows show what happens: the same sweeps on large values, stored as numbers and then exactly.

```widget "The same sweeps, two ways of storing the numbers"
<div class="ex" id="lang-table"></div>
```

The TypeScript fix is to run the same sweeps on `BigInt` values, which are exact at any size, as the last row shows. The other common fix, reducing modulo `m` after each multiplication, has a JavaScript trap of its own: `a * b % m` multiplies first, so `a * b` must itself stay under 2⁵³ or the remainder is computed from a rounded number.

## Variants {#variants}

```vig "The same row of cells three times: a sum with one cell removed, a division with no zero, and a running maximum from each end"
<rect class="fa" x="12" y="8" width="20" height="20" rx="4"/><rect class="fa" x="36" y="8" width="20" height="20" rx="4"/><rect class="st" x="60" y="8" width="20" height="20" rx="4" stroke-dasharray="3 3"/><rect class="fa" x="84" y="8" width="20" height="20" rx="4"/><rect class="fa" x="108" y="8" width="20" height="20" rx="4"/><rect class="fa" x="12" y="46" width="20" height="20" rx="4"/><rect class="fa" x="36" y="46" width="20" height="20" rx="4"/><rect class="fk" x="60" y="46" width="20" height="20" rx="4"/><rect class="fa" x="84" y="46" width="20" height="20" rx="4"/><rect class="fa" x="108" y="46" width="20" height="20" rx="4"/><rect class="fa" x="12" y="84" width="20" height="20" rx="4"/><rect class="fa" x="36" y="84" width="20" height="20" rx="4"/><rect class="fk" x="60" y="84" width="20" height="20" rx="4"/><rect class="fa" x="84" y="84" width="20" height="20" rx="4"/><rect class="fa" x="108" y="84" width="20" height="20" rx="4"/><path class="sc" d="M12 108C30 118 50 118 66 108M126 108C108 118 88 118 70 108"/>
```

The same two-sided idea, with a different operation or a different guarantee.

```variants
[
  {
    "title": "Sum of the others",
    "source": "subtraction undoes addition",
    "text": "For sums there is no trap: one total, then total − nums[i] at every position, because subtracting an element always removes it, zero or not. On the lesson's first array that gives {{sumExcept}}. Product is harder because division cannot undo a zero."
  },
  {
    "title": "Division allowed, no zeros",
    "source": "know the precondition",
    "text": "If the input is guaranteed to hold no zero, total ÷ nums[i] is a fine O(n) answer with one pass for the total: {{divOk}} on the first array. The skill is knowing the precondition that makes the cheap trick safe, and what to do when it fails."
  },
  {
    "title": "Trapping Rain Water",
    "source": "LeetCode 42",
    "text": "The water above a bar depends on the tallest bar to its left and the tallest to its right. Both are running values built by two sweeps, one from each end, exactly like left and right here, with max in place of ×."
  }
]
```

## Check yourself {#quiz}

```vig "Four questions as rows, the first one answered and ticked"
<circle class="fg" cx="36" cy="18" r="9"/><path class="st" d="M31 18L35 22L41 14"/><circle class="st" cx="36" cy="42" r="9"/><circle class="st" cx="36" cy="66" r="9"/><circle class="st" cx="36" cy="90" r="9"/><rect class="fa" x="56" y="13" width="150" height="10" rx="5"/><rect class="fa" x="56" y="37" width="118" height="10" rx="5"/><rect class="fa" x="56" y="61" width="138" height="10" rx="5"/><rect class="fa" x="56" y="85" width="126" height="10" rx="5"/>
```

```quiz
{
  "questions": [
    {
      "question": "Why does dividing the total by each element fail, while the left-and-right split does not?",
      "options": [
        "Division is slower than multiplication on most processors, so the ban is about speed: two sweeps of multiplications cost fewer cycles per element than a pass of divisions.",
        "A zero makes the total 0, so the zero's own answer needs 0 ÷ 0. The split never divides, so a zero is just a factor.",
        "Dividing the total by each element adds a rounding error that grows with every division, so the answers come out close to the true values but not exactly equal."
      ],
      "answer": 1,
      "explanation": "Once a zero is in the total, the total is 0 whatever the other elements are, so the other elements cannot be recovered by dividing. On <code>[-1, 1, 0, -3, 3]</code> the position of the zero would have to be 0 ÷ 0, which JavaScript returns as NaN and Python refuses with <code>ZeroDivisionError</code>. With integers below 2⁵³ the division itself is exact, so rounding is not the reason, and both approaches are O(n)."
    },
    {
      "question": "The O(1)-extra version keeps the left products in the output and the right product in one number. Why can't both be single numbers in one sweep?",
      "options": [
        "Arrays can only be read from the left, so the right products cannot be formed until the elements have been copied into a second array to read them backwards.",
        "A sweep from the left has seen left[i] by the time it reaches i, but right[i] depends on elements it has not reached, so one side must be stored first.",
        "Two running numbers would overflow a 32-bit integer long before the end of the array, while an array of products can hold values of any size."
      ],
      "answer": 1,
      "explanation": "<code>left[i]</code> grows with i and is complete when a forward sweep arrives; <code>right[i]</code> needs every element after i, which a forward sweep has not read yet. One family has to be stored for every i, and the output array is free storage the problem hands you. Arrays can be read in either direction, and a number that grew too large would be as large in an array as in a variable."
    },
    {
      "question": "At the constraint's {{limitN}} elements, roughly how many multiplications does the brute force make?",
      "options": [
        "About {{limitNaive}}: n − 1 multiplications for each of the n positions.",
        "About {{halfPairs}}: each pair of positions needs multiplying only once, so half of n × n.",
        "About {{limitMults}}: three multiplications for each element, as the two sweeps make."
      ],
      "answer": 0,
      "explanation": "Position i multiplies the n − 1 other elements, and there are n positions, so n(n − 1) in all: {{limitNaive}} at {{limitN}} elements, about {{naiveSecs}} seconds at 10⁸ a second. Halving would apply to unordered pairs, but each position here needs its own product of all the others, shared with no one. The last option is the two sweeps' count, {{limitMults}}, which is the point of them."
    },
    {
      "question": "Suppose the 32-bit guarantee were removed and the TypeScript answers grew past 2⁵³. What keeps them exact?",
      "options": [
        "Run the same sweeps on BigInt values, which hold integers of any size exactly.",
        "Wrap each product in <code>Math.trunc</code>, which rounds the result back to the whole number it should have been.",
        "Declare the result as <code>number[]</code> with a strict type, so the compiler checks the size of every product."
      ],
      "answer": 0,
      "explanation": "By then the rounding has already happened inside the multiplication: of the {{bigCount}} answers in the table, {{bigDiffers}} differ from the exact values, and <code>Math.trunc</code> of a rounded number is the same rounded number. Types are erased before the program runs, so they cannot change the arithmetic. BigInt, or reducing modulo m while keeping each product under 2⁵³, does."
    }
  ]
}
```
