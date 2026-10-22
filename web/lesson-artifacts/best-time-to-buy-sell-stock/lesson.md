---
title: "Best Time to Buy & Sell Stock"
kicker: "Best Time to Buy & Sell Stock · Arrays module · problem lesson"
headline: "How do you find the best trade without trying every pair of days?"
lede: "A monitoring agent logs one price a day and has to report the best single trade the history allowed: buy on one day, sell on a later one. Keeping every price and comparing every pair works, at a cost of about half of n² comparisons. But the agent does not need the whole history. The only thing about the past that matters on any given day is the lowest price so far, a low-water mark, so it keeps that one number and does the job in a single pass."
chips:
  - "needs **a running minimum**"
  - "time **O(n)**"
  - "space **O(1)**"
hero: |
  <div class="hero-stage"><div class="hero-art navy"><div class="bt-hero" id="heroBars" role="img" aria-label="Animation: six daily prices drawn as bars. A marker steps from day 0 to day 5 while a horizontal line tracks the lowest price so far, the gain of selling on the current day is shaded, and a counter shows the best profit found so far."></div>
  <div class="hero-read" id="heroRead"><div class="hero-num"><b id="heroNum">0</b> <span id="heroUnit">best profit so far</span></div><div id="heroCap"></div></div></div></div>
---

## Problem {#problem}

```vig "A row of price bars with a low one early and a taller one later, joined by an arrow from the low to the tall"
<rect class="fa" x="14" y="30" width="22" height="62" rx="4"/><rect class="fk" x="48" y="72" width="22" height="20" rx="4"/><rect class="fa" x="82" y="52" width="22" height="40" rx="4"/><rect class="fa" x="116" y="62" width="22" height="30" rx="4"/><rect class="fc" x="150" y="38" width="22" height="54" rx="4"/><rect class="fa" x="184" y="50" width="22" height="42" rx="4"/><path class="sc" d="M60 66C80 20 140 20 158 32"/><path class="sc" d="M152.5 28.5L158 32L153 36.5"/>
```

`prices[i]` is the price on day `i`. Choose one day to buy and a **later** day to sell, and return the largest profit you can make, or `0` if no trade makes money.

```examples
prices = [7,1,5,3,6,4] → 5 (buy on day 1 at 1, sell on day 4 at 6)
prices = [7,6,4,3,1] → 0 (prices only fall, so do not trade)
```

```constraint
1 ≤ n ≤ 10⁵, 0 ≤ prices[i] ≤ 10⁴.
```

Read the array as the agent's log, oldest day first. Two rules make this a different problem from "the biggest number minus the smallest". The sell day has to come **after** the buy day, because you cannot sell what you have not bought yet. And you are allowed not to trade at all, so the answer is never negative.

Try it by hand first. Press a day to buy on, then a later day to sell on, and compare your trade with the best one.

```widget #pick "Explore: pick a buy day and a sell day"
<div class="extabs" role="group" aria-label="Choose a price history"></div><div class="tv-wrap"><div class="bt-days" role="group" aria-label="Days. Press one to buy on it, then a later one to sell."></div></div><div class="readout" aria-live="polite"></div><div class="actions"><button type="button" class="btn2 reset">Clear</button><button type="button" class="btn2 best">Show a best trade</button></div>
```

## Attempt it first {#attempt}

```caption
Buy at the lowest price and sell at the highest is the tempting rule, and it ignores which came first.
```

```vig "Two price bars side by side: the tall one on the left, the short one on the right, with a crossed-out arrow from the short one back to the tall one"
<rect class="fc" x="46" y="22" width="26" height="70" rx="4"/><rect class="fk" x="118" y="70" width="26" height="22" rx="4"/><path class="st" d="M132 56C112 24 86 24 66 40" stroke-dasharray="3 3"/><circle class="fr" cx="100" cy="30" r="9"/><path class="st" d="M95 25L105 35M105 25L95 35"/>
```

The constraint allows `n` up to 10⁵ days, so a search over every pair of days is out, as the next section counts. Before looking for anything cleverer, work out a few small cases and see which rule holds up. Predict the best profit for each history, then check.

```widget "Predict the best profit"
<div id="predict"></div>
```

```reveal #hint "Hint: fix the sell day"
Pick a sell day `j`. Every trade that sells on day `j` earns `prices[j]` minus the price on its buy day, and `prices[j]` is the same for all of them. So the profit is biggest when the buy price is smallest.

That means the best buy day for sell day `j` is not a search at all: it is the cheapest day before `j`. If you knew that cheapest earlier price for every `j`, each day would need one subtraction. Can you keep it up to date as `j` moves right, without looking back?
```

## Two traps {#trap}

```caption
The two obvious answers are the wrong one and the slow one.
```

```vig "Two sketches: a single arrow from a low bar back to a taller bar on its left, and a grid of every pair of days"
<rect class="fa" x="12" y="30" width="14" height="56" rx="3"/><rect class="fk" x="34" y="66" width="14" height="20" rx="3"/><path class="st" d="M42 58C36 36 28 36 20 24" stroke-dasharray="3 3"/><circle class="fr" cx="76" cy="28" r="8"/><path class="st" d="M72 24L80 32M80 24L72 32"/><rect class="st" x="124" y="20" width="96" height="72" rx="6"/><path class="st" d="M124 44H220M124 68H220M156 20V92M188 20V92"/><circle class="fc" cx="140" cy="32" r="4"/><circle class="fc" cx="172" cy="32" r="4"/><circle class="fc" cx="204" cy="32" r="4"/><circle class="fc" cx="172" cy="56" r="4"/><circle class="fc" cx="204" cy="56" r="4"/><circle class="fc" cx="204" cy="80" r="4"/>
```

**The first trap is the biggest swing.** Take the highest price and subtract the lowest:

```code mistake_global_range "Highest minus lowest"
```

It is one line and it is fast, and it answers a different question: the biggest gap between any two prices, in whichever order they happened. The table runs it next to the best trade on a few histories.

```widget "Highest minus lowest against the best trade"
<div class="ex" id="range-table"></div><p class="cost-note" id="rangeNote"></p>
```

The cause is the order rule. A high that comes before a low can never be sold at, because you would have to sell before you bought.

**The second trap is trying every pair.** Fix the order rule by checking each buy day against every later sell day:

```code naive "Every buy day against every later sell day"
```

This one is correct, and for `n` days it makes n(n − 1) ÷ 2 comparisons, one for each pair with the buy before the sell. The chart counts them by running the code, next to the one-pass sweep that the rest of the lesson builds.

```widget "Comparisons made as the history grows"
<div class="chart" id="cost"></div><p class="cost-note" id="costNote"></p>
```

## The insight {#insight}

```caption
For a fixed sell day, the best buy day is the cheapest day before it, and that is one number carried along.
```

```vig "A row of price bars with a horizontal line at the height of the lowest bar so far, and the current bar's top rising above it"
<rect class="fa" x="14" y="32" width="22" height="60" rx="4"/><rect class="fk" x="48" y="72" width="22" height="20" rx="4"/><rect class="fa" x="82" y="52" width="22" height="40" rx="4"/><rect class="fa" x="116" y="62" width="22" height="30" rx="4"/><rect class="fc" x="150" y="38" width="22" height="54" rx="4"/><path class="st" d="M8 72H214" stroke-dasharray="4 3"/><path class="sc" d="M161 72V38"/><path class="sc" d="M156 43L161 38L166 43"/>
```

Fix a sell day `j`. Every trade that sells on day `j` buys on some day `i ≤ j`, and earns `prices[j] − prices[i]` (zero for `i = j`: buy and sell on the same day, which is the same as not trading). The first term is the same for every choice, so the profit is largest when `prices[i]` is smallest. The best buy day for sell day `j` is the cheapest day among days 0 to `j`, and nothing else about the past matters.

That turns the pair search into one question per sell day: what is the lowest price so far? And that number is cheap to keep. The lowest price over days 0 to `j` is the lowest price over days 0 to `j − 1` or today's price, whichever is smaller, so each day updates it with a single comparison.

```key
For a fixed sell day, the best buy day is forced: the cheapest day up to it. Sweep the sell day left to right, carry that minimum along, and the search over pairs becomes one subtraction a day.
```

The answer is the best of those daily profits, so a second number, `best`, keeps the high score. Two numbers carried across one pass is the whole algorithm.

```rosetta "The code, read as the monitoring agent"
In the code | In the agent
`prices[i]` | the price logged on day i
`min_so_far` | the low-water mark: the lowest price in the log so far
`price - min_so_far` | what selling today would earn against the best possible buy
`best` | the high score: the best gain seen so far, never below 0 (no trade)
`max(best, ...)` | keep the high score
`min(min_so_far, price)` | lower the mark if today broke it
`return best` | the report: 0 if no later price ever beat an earlier one
```

Watch it run. Each day takes three steps: read the mark going in, sell against it, then update the mark. The panel above each caption checks two claims against brute force at the end of every day.

```widget #stepper "Walk the sweep, a day at a time"
<div class="extabs" role="group" aria-label="Choose a price history"></div><div class="lvhost"></div>
```

## Solution {#solution}

```caption
Two numbers carried across one pass.
```

```vig "A row of bars being scanned left to right, with two small gauges at the end of the row"
<rect class="fa" x="10" y="52" width="18" height="40" rx="3"/><rect class="fk" x="34" y="72" width="18" height="20" rx="3"/><rect class="fa" x="58" y="58" width="18" height="34" rx="3"/><rect class="fa" x="82" y="64" width="18" height="28" rx="3"/><rect class="fc" x="106" y="46" width="18" height="46" rx="3"/><rect class="st fp" x="130" y="54" width="18" height="38" rx="3"/><path class="st" d="M10 104L124 104"/><path class="st" d="M119 107.4L124 104L119 100.6"/><rect class="st" x="168" y="30" width="44" height="22" rx="6"/><rect class="st" x="168" y="62" width="44" height="22" rx="6"/><rect class="fk" x="172" y="34" width="14" height="14" rx="3"/><rect class="fg" x="172" y="66" width="22" height="14" rx="3"/>
```

Attempt it on paper first: decide what the two carried numbers start as, what each day does with them, and what you return. Then compare.

`````reveal #solbox "Show the solution"
```code solution "One pass, two numbers"
```

```notes
The loop body is the insight, line for line. `price - min_so_far` is what selling today earns against the best possible buy, `max` keeps the high score, and `min` lowers the mark when today is the cheapest day yet. Day 0 needs no special case: `min_so_far` starts at `prices[0]`, so day 0 earns 0 against itself, which `best` already holds.

After day `i`, `min_so_far` is the lowest price on days 0 to `i`, and `best` is the best profit over every buy day and later sell day in that range. Both updates keep that true: `best` can only gain a trade that sells on day `i`, and the best of those uses the mark going in; the mark then folds in day `i`. The loop runs over `prices` itself rather than `prices[1:]` because a Python slice copies `n − 1` values, which would cost O(n) space for nothing.
```

```derivation
**Time O(n).** Each day does two comparisons, one for `best` and one for `min_so_far`, and never looks back. On the six-day example that is {{iters}} iterations and {{cmps}} comparisons, counted by running it. On a history of {{limitN}} days it is {{limitCmps}} comparisons, where the pair search needs {{pairs}}: about {{secs}} seconds at 10⁸ steps a second.

**Space O(1).** Two numbers, `min_so_far` and `best`, whatever the length of the log. This is optimal in time too: every price can change the answer, so every price has to be read.
```

````warn
Do not start `min_so_far` at 0 because prices are never negative. Zero is at or below every real price, so it is never replaced, so `price - min_so_far` is just the price, and the loop returns the highest price in the log instead of a profit: {{zeroAnswers}}.

```code mistake_min_zero "The mistake"
```
````
`````

`````reveal #orderbox "Does the order of the two updates matter?"
```code alt_min_first "Lower the mark first, then sell against it"
```

```notes
Here it does not, and the reason is worth deriving. If today's price is a new low, the swapped order sells against itself: `price - min_so_far` is 0, which cannot beat a `best` that starts at 0. If today's price is not a new low, the mark is unchanged and both orders compute the same profit. So the two versions always return the same number, which {{agree}} histories confirm when the page loads.

It would matter in a version where selling on the same day as the buy were forbidden and paid something other than 0. Noticing which line your invariant depends on is the habit, even where the answer comes out the same.
```
`````

## Variants {#variants}

```vig "The same row of price bars three times: every rise highlighted, a run of changes boxed, and two separate trades marked"
<rect class="fa" x="10" y="8" width="14" height="22" rx="3"/><rect class="fk" x="30" y="20" width="14" height="10" rx="3"/><rect class="fc" x="50" y="6" width="14" height="24" rx="3"/><rect class="fk" x="70" y="22" width="14" height="8" rx="3"/><rect class="fc" x="90" y="10" width="14" height="20" rx="3"/><rect class="fa" x="110" y="16" width="14" height="14" rx="3"/><rect class="fa" x="10" y="46" width="14" height="22" rx="3"/><rect class="fk" x="30" y="58" width="14" height="10" rx="3"/><rect class="fa" x="50" y="44" width="14" height="24" rx="3"/><rect class="fa" x="70" y="60" width="14" height="8" rx="3"/><rect class="fa" x="90" y="48" width="14" height="20" rx="3"/><rect class="fa" x="110" y="54" width="14" height="14" rx="3"/><rect class="st" x="26" y="40" width="82" height="34" rx="6" stroke-dasharray="3 3"/><rect class="fa" x="10" y="84" width="14" height="22" rx="3"/><rect class="fk" x="30" y="96" width="14" height="10" rx="3"/><rect class="fc" x="50" y="82" width="14" height="24" rx="3"/><rect class="fk" x="70" y="98" width="14" height="8" rx="3"/><rect class="fc" x="90" y="86" width="14" height="20" rx="3"/><rect class="fa" x="110" y="92" width="14" height="14" rx="3"/>
```

The same sweep, asked a different question.

```variants
[
  {
    "title": "Unlimited transactions",
    "source": "LeetCode 122",
    "text": "Buy and sell as many times as you like, one holding at a time. Add up every day-to-day rise: on the lesson's first history that is {{rises}}, against {{best}} for a single trade. Why that greedy sum is optimal is argued later in the course."
  },
  {
    "title": "Maximum subarray",
    "source": "LeetCode 53",
    "text": "The best single trade is the best run of consecutive day-to-day changes. The first history's changes are {{diffs}}, and its best run adds up to {{kadane}}, the same {{best}} as the sweep. Kadane's algorithm is this sweep applied to the changes."
  },
  {
    "title": "At most two transactions",
    "source": "LeetCode 123",
    "text": "One carried minimum no longer describes the past, because the second trade's buy price depends on the first trade's profit. It needs more carried state, one number per stage of the plan, which is the way dynamic programming thinks."
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
      "question": "Why does the one-pass sweep never miss the best pair of days?",
      "options": [
        "It assumes the prices rise over time, so the best sell day is always the last one, and the sweep only has to find the cheapest day anywhere before that final day.",
        "For the best pair (<em>b</em>, <em>s</em>), day <em>b</em> is behind the sweep when it reaches <em>s</em>, so the mark is at most <code>prices[b]</code> and the profit on day <em>s</em> is at least the best.",
        "It keeps the highest price seen as well as the lowest, and subtracting the two at the end always gives the best trade, whichever order the days happened to come in over the whole log."
      ],
      "answer": 1,
      "explanation": "The mark going into day <em>s</em> is the lowest price over every earlier day, including day <em>b</em>, so <code>price - min_so_far</code> on day <em>s</em> is at least <code>prices[s] - prices[b]</code>. That is the invariant doing the proof. The other two options describe the first trap: they ignore which day came first."
    },
    {
      "question": "Someone swaps the two update lines, lowering <code>min_so_far</code> first and selling against it second. What happens to the answer?",
      "options": [
        "It can come out too high, because a day can now be sold against a buy that only happens later in the log, so the sweep invents trades that go backwards in time.",
        "It never changes: a day that is a new low sells against itself for 0, which cannot beat <code>best</code>, and any other day sees the same mark.",
        "It can come out too low, because the first day is skipped once the mark has already moved onto it, so the profit that day would have earned is never counted."
      ],
      "answer": 1,
      "explanation": "The mark after folding in today's price is never above today's price and never below the lowest earlier price. When today is a new low the profit is price − price = 0, and best already starts at 0. When it is not, the mark is unchanged, so both orders compute the same profit. The reveal in the solution runs the swapped version on {{agree}} histories and it always agrees."
    },
    {
      "question": "At the constraint's {{limitN}} days, roughly how many pairs does the brute force compare?",
      "options": [
        "About {{pairs}}: a buy day paired with each later sell day, n(n − 1) ÷ 2.",
        "About 10¹⁰: every day paired with every day, n × n, since each day can be either end of a trade.",
        "About 1.7 million: n × log₂ n, since a sorted history could be searched by halving."
      ],
      "answer": 0,
      "explanation": "A trade is an ordered pair with the buy first, so each unordered pair of days counts once, not twice, and a day cannot pair with itself: n(n − 1) ÷ 2. That is {{pairs}} comparisons, about {{secs}} seconds at 10⁸ a second, where the sweep makes {{limitCmps}}. A price history is not sorted, so halving does not apply."
    }
  ]
}
```
