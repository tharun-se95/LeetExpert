---
title: "Coin Change"
kicker: "Coin Change · Dynamic Programming module · problem lesson"
headline: "How few machines add up to exactly this much capacity?"
lede: "A customer asks for exactly 11 vCPUs. The cloud sells instances in sizes of 1, 2 and 5 vCPUs, in any quantity, and every instance you launch is one more line on the bill. What is the fewest instances that add up to exactly 11? Grabbing the biggest size each time feels right and is sometimes wrong, and finding out why leads to one of the most useful ideas in the course."
chips:
  - "needs **a table of answers**"
  - "shape **try every last piece**"
  - "time **O(amount × sizes)**"
hero: |
  <div class="hero-stage"><div class="hero-art navy"><svg id="heroFleet" viewBox="0 0 560 300" role="img" aria-label="Animation: a row of cells labelled 0 to 11 fills in from left to right. Each cell shows the fewest instances that add up to exactly that many vCPUs, built from the cells behind it."></svg>
  <div class="hero-read" id="heroRead"><div class="hero-num"><b id="heroNum">0</b> <span id="heroUnit">instances</span></div><div id="heroCap"></div></div></div></div>
---

## Problem {#problem banner}

You are given a list of `coins`, the sizes available, all different, and a target `amount`. Return the **fewest** coins that add up to exactly `amount`, using each size as many times as you like, or `-1` if no combination adds up to it.

```examples
coins = [1,2,5], amount = 11 → 3 (5 + 5 + 1)
coins = [2], amount = 3 → -1 (only even totals are possible)
```

```constraint
1 ≤ coins.length ≤ 12, 1 ≤ coins[i] ≤ 2³¹ − 1, 0 ≤ amount ≤ 10⁴.
```

Read a coin as an instance size and the amount as the capacity a customer asked for. Launching an instance costs one unit no matter how big it is, so the job is to reach the exact capacity with as few launches as possible. It is exact, not "at least": an order that overshoots is not a solution. Sometimes no mix works at all, which is what the `-1` is for.

```widget #explore "Explore: build an order by hand"
<div class="extabs" role="group" aria-label="Choose an order"></div><div class="tv-wrap"><div class="fleet"></div></div><div class="readout" aria-live="polite"></div><div class="actions"><span class="picks"></span><button type="button" class="btn2 undo">Undo</button><button type="button" class="btn2 best">Show a fewest order</button></div>
```

## Attempt it first {#attempt banner}

This is unbounded knapsack: each size can be reused without limit. Before writing any table, think about the greedy rule first, because it is the natural first move and it is worth knowing exactly why it fails. Take sizes `{1, 3, 4}` and a capacity of 6. Work out what "always launch the biggest size that still fits" does, and compare it with the best possible order.

Predict the fewest instances for each order, then check.

```widget "Predict the fewest instances"
<div id="predict"></div>
```

```reveal #hint "Hint: look only at the last instance"
Suppose you already knew the fewest instances for every smaller capacity. How would you use that to answer for capacity a?

Whatever the best order is, one instance was launched last, and it had some size c. Take it away and you are looking at an order for a − c. So the answer for a is one more than the answer for a − c, for whichever c was last.

You do not know which c was last, so try each size that fits and keep the smallest result.
```

## Two traps {#trap banner}

**The first trap is greedy.** Keep launching the biggest size that still fits, and stop when nothing is left:

```code mistake_greedy "Greedy: the biggest size that fits"
```

It is fast and it is often right, which is what makes it dangerous. The table below runs it next to the true optimum on a few size sets.

```widget "Greedy against the true fewest"
<div class="ex" id="greedy-table"></div><p class="cost-note" id="greedy-note"></p>
```

The reason is that a big size can leave an awkward remainder. With `{1, 3, 4}` and 6, greedy takes the 4 and is left with 2, which can only be filled by two 1s. The optimum passes on the 4 and takes 3 + 3. One early choice was never revisited.

**The second trap is trying everything.** Fix greedy by trying every size as the last instance and recursing on what remains:

```code slow_recursion "Try every last size, recursively"
```

This is correct, and it is slow for a specific reason. To make 11 it asks about 10, 9 and 6. To make 10 it asks about 9, 8 and 5. Both of those need 9, and both then need 8, so the same question is asked over and over. The chart counts the calls the recursion really makes against the number of different questions, which is only one per amount.

```widget "Calls made as the amount grows (sizes 1, 2 and 5)"
<div class="chart" id="cost"></div><div class="legend"><span><i style="background:var(--r-ink)"></i>recursion, every call</span><span><i style="background:var(--g-ink)"></i>different questions</span></div><p class="cost-note"></p>
```

## The insight {#insight banner}

Look at an optimal order for some amount `a` and ask only about its **last** instance, whatever its size `c`. Remove it, and what is left adds up to exactly `a − c`. That leftover order must itself be a fewest order for `a − c`: if a shorter one existed, putting the last instance back on it would give a shorter order for `a`, and we assumed ours was the fewest. So the best answer for `a` is built from the best answer for some smaller amount.

We do not know which size came last, so try them all. Every size that fits is a candidate, and the fewest order for `a` is the best of them:

```key
dp[a] = 1 + the smallest dp[a − c] over every size c that fits. Trying every last piece replaces greedy's single guess with a comparison that cannot miss.
```

Each `dp[a]` depends only on entries with smaller amounts, so fill the table from 0 upward and every value you need is already there. Each question is answered once. That is what turns the exponential recursion into a loop.

```rosetta "The code, read as capacity planning"
In the code | In the system
`amount` | the capacity the customer asked for, in vCPUs
`c in coins` | an instance size the cloud sells
`dp[a]` | the fewest instances that add up to exactly a vCPUs
`dp[a - c] + 1` | the best order for what is left, plus the instance we launch last
`INF` | "no order reaches this capacity yet"
`dp[0] = 0` | zero vCPUs needs zero instances
```

Watch the table fill. The orange cell is the amount being solved. The blue cells are the entries it reads, one for each size that fits.

```widget #stepper "Fill the table"
<div class="extabs" role="group" aria-label="Choose an order"></div><div class="plhost"></div>
```

## Solution {#solution banner}

Attempt it on paper first: decide what the table holds, what goes in cell 0, what unreachable cells start as, and what the answer is once it is full. Then compare. Read it as a capacity planner who fills a price sheet from the smallest order upward, so that pricing any order only needs a lookup in cells already filled.

`````reveal #solbox "Show the solution"
```code solution "Fill the table from 0 to amount"
```

```notes
The outer loop walks the amounts upward, so when cell `a` is computed every cell it reads, `a - c`, is already final. The inner loop tries each size as the last instance. `c <= a` skips sizes that are too big. After the loops, a cell that still holds the placeholder was never reachable, and that becomes `-1`.
```

```derivation
**Time O(amount × sizes).** The table has amount + 1 cells and each one tries every size once. For sizes {1, 2, 5} and amount 11 that is {{steps}} cells and {{tries}} tries, of which {{fits}} fit and do a lookup. At the constraint's limits, 10⁴ × 12 is {{fmt_OPS}} tries. The recursion could not say this: it repeated questions instead of storing them.

**Space O(amount).** One number per amount from 0 to amount, {{smallCells}} cells in the small example and 10,001 at the limit.
```

````warn
Do not return `dp[amount]` as it is. For an amount no order can reach, that cell still holds the placeholder `amount + 1`, so the answer comes out as {{rawCases}} instead of **-1**.

```code mistake_inf "The mistake"
```
````
`````

## Variants {#variants}

The same table with a different question in each cell.

```variants
[
  {
    "title": "Coin Change II",
    "source": "count the ways",
    "text": "Same sizes, but the question is how many different combinations reach the amount. The loop order changes: put the sizes in the outer loop, so 2 + 1 and 1 + 2 count as one combination and not two."
  },
  {
    "title": "Perfect Squares",
    "source": "sizes are the squares",
    "text": "The sizes are 1, 4, 9, 16 and so on, and the question is the fewest that sum to n. It is this table exactly, with the sizes generated on the fly."
  },
  {
    "title": "Minimum Cost For Tickets",
    "source": "last ticket decides",
    "text": "A day is covered by a 1-day, 7-day or 30-day pass, and the cheapest plan for each day depends on the cheapest plan a fixed number of days earlier. It is the same \"try every last piece\" recurrence over days instead of vCPUs."
  }
]
```

## Check yourself {#quiz}

```quiz
{
  "questions": [
    {
      "question": "Why is it enough to try every size as the <em>last</em> instance and take the best, when greedy's single choice is not?",
      "options": [
        "Any fewest order for a ends in some size c, and what remains must be a fewest order for a − c, or the whole could be shorter. So 1 + the best dp[a − c] over all c misses nothing.",
        "Trying every size makes the table record every order in which instances could be launched, and taking the minimum then picks the cheapest of those orders once all of them are listed.",
        "Taking the minimum over every size ends up choosing the smallest size at each step, and building the order from small sizes is what keeps the count of instances as low as it can go."
      ],
      "answer": 0,
      "explanation": "This is optimal substructure: the best solution contains a best solution to a smaller version of the same problem. Greedy commits to one candidate without comparing, so a locally big choice can strand an awkward remainder. Trying every last size compares them all, and the order in which instances are launched never matters to the total."
    },
    {
      "question": "The table starts with <code>dp[0] = 0</code> and every other entry at <code>amount + 1</code>. Why not start them all at 0?",
      "options": [
        "A 0 would win every minimum, so every cell would claim zero instances. amount + 1 means \"not reachable yet\": any real count beats it, and a cell still holding it at the end is unreachable.",
        "Zero would give the same answers, since cells that are never reached are never read; the large value only guards against integer overflow when 1 is added to an entry that is already large.",
        "Starting high lets the inner loop stop early: once one size gives a count below the starting value, the remaining sizes cannot do better, so the comparison exits on most steps."
      ],
      "answer": 0,
      "explanation": "Take sizes {2} and capacity 3. With zeros everywhere, dp[1] and dp[3] would stay at their starting 0 and the code would answer 0, claiming no instances are needed. With the placeholder, dp[3] stays at 4 and the check turns it into -1. Forgetting that check, as the warning below shows, returns the placeholder itself."
    },
    {
      "question": "For the constraint's largest input, an amount of 10⁴ with 12 sizes, roughly how many inner steps does the table version take?",
      "options": [
        "About {{fmt_OPS}} steps: each of the 10⁴ amounts is solved once, and solving one tries each of the 12 sizes once, so 10⁴ × 12.",
        "About 2¹² = 4,096 steps, since each of the 12 sizes is either used or not, and the table only settles which subset of sizes the best order draws from.",
        "About 10⁴ steps, since the table has 10⁴ cells and each is filled by one lookup into the cell for the largest size that fits, which keeps the work linear."
      ],
      "answer": 0,
      "explanation": "Each of the 10⁴ cells tries every one of the 12 sizes, and a try is one lookup and one comparison. The plain recursion, by contrast, asks the same question again and again, and its call count multiplies at every step: see the chart above. The table is the same recurrence with each answer stored once."
    }
  ]
}
```

