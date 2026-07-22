---
title: Gas Station
type: problem
---

## Problem

There are `n` gas stations arranged in a **circle**. `gas[i]` is the
fuel available at station `i`, and `cost[i]` is the fuel needed to drive
from station `i` to station `i+1` (wrapping around from `n-1` back to
`0`). You start with an empty tank at some station and drive clockwise,
picking up `gas[i]` and spending `cost[i]` at each leg. Return the index
of the station you should **start** from to complete the full circle
once, or `-1` if it's impossible. The answer, when it exists, is
guaranteed unique.

**Examples**

```text
gas  = [1,2,3,4,5]
cost = [3,4,5,1,2]        →  3
       Start at 3: tank 0+4−1=3, →4: 3+5−2=6, →0: 6+1−3=4, →1: 4+2−4=2, →2: 2+3−5=0. Full loop.

gas  = [2,3,4]
cost = [3,4,3]            →  -1
       Total gas 9 < total cost 10, so no start can finish.
```

**Constraints:** 1 ≤ n ≤ 10⁵ · 0 ≤ gas[i], cost[i].

## Attempt it first

The obvious solution — try each of the `n` stations as a start and
simulate the loop — is O(n²) and correct. Write that first if you need
to; it clarifies the mechanics. Then look for the two structural facts
that let you find the answer in a *single* pass. Both are provable, and
the second one is the real prize.

````reveal Hint — two facts to prove
(1) A feasibility fact: if the total gas across all stations is at least
the total cost, a valid start is *guaranteed to exist*; if it's less,
none does. (2) A locating fact: suppose you start at station A and your
tank goes negative for the first time upon *arriving at* station B. Then
no station strictly between A and B can be a valid start either — so you
can skip all of them and restart the search at B. Fact (2) is what turns
O(n²) into O(n). Try to prove it before revealing the solution.
````

## Brute force, for contrast

For each candidate start `s`, simulate: run the tank around all `n` legs
and check it never drops below zero. That's `n` starts × up to `n` legs
= **O(n²)**. At n = 10⁵ that's 10¹⁰ operations — too slow. Every
restart throws away everything the previous simulation learned, and the
insight below is precisely that the failed simulation tells us a lot
about where *not* to restart.

## Insight 1: total gas ≥ total cost ⟺ a solution exists

Over one full loop from *any* start, the net fuel change is
`Σ gas[i] − Σ cost[i]`, the same total regardless of where you begin —
it's just the sum of all legs. Call it `total`.

- If `total < 0`, you burn more than you carry over the full circle. No
  matter where you start, the tank must end below where it began, so it
  dipped negative somewhere. **Impossible — return −1.**
- If `total ≥ 0`, we'll prove a valid start *must* exist (Insight 2
  constructs it). This is the feasibility guarantee: we never have to
  wonder whether a solution exists once we've checked the totals — the
  sign of `total` settles it.

This already lets us answer the yes/no half of the problem in one O(n)
sum. The harder half is *which* station.

## Insight 2: skip everything between a failed start and its failure point

This is the crux. Suppose we start at station `A` with an empty tank and
drive forward, and the running tank balance first goes **negative when
arriving at station `B`** (i.e. the leg from `B-1` to `B` is the one that
breaks us). Claim: **no station strictly between `A` and `B` can be a
valid start.**

Here's the proof. Let `tank(X)` denote the tank level as we *arrive* at
station `X`, having started from `A` with an empty tank. By assumption,
for every station `C` strictly between `A` and `B` (inclusive of `A`,
exclusive of `B`), we arrived with `tank(C) ≥ 0` — otherwise `B`
wouldn't be the *first* failure. Now consider restarting from such a `C`
instead of `A`. Starting fresh from `C` with an empty tank, the tank on
arriving at `B` would be:

```text
tank_from_C(B) = (net fuel over legs from C to B)
tank_from_A(B) = tank(C) + (net fuel over legs from C to B)   [< 0, by assumption]
```

The only difference is the `tank(C)` term: starting from `A` gave us a
*head start* of `tank(C) ≥ 0` fuel when passing through `C`, whereas
starting from `C` gives us zero there. So:

```text
tank_from_C(B) = tank_from_A(B) − tank(C)  ≤  tank_from_A(B)  <  0.
```

Starting from `C` reaches `B` with *even less* fuel than starting from
`A` did — because it lacks the positive buffer `A` had accumulated by
the time it reached `C`. Since starting from `A` already failed at `B`,
starting from any such `C` fails at `B` (or sooner) too. **Every station
strictly between `A` and `B` is disqualified.** ∎

The payoff: when a simulation from `A` fails on arrival at `B`, we don't
restart at `A+1` — we restart at `B`, skipping the entire dead stretch
in between. Each station is visited by at most one simulation attempt,
so the total work across all restarts is O(n), not O(n²).

**Putting the two together for one clean pass.** We don't even need to
restart explicitly. Sweep once, keeping `total` (running net over the
whole array, to decide feasibility at the end) and a `tank` that
accumulates net fuel since the *current* candidate start. Whenever
`tank` goes negative at station `i`, Insight 2 says every candidate from
the old start through `i` is dead — so set the candidate start to `i+1`
and reset `tank` to 0. If `total ≥ 0` at the end, the last candidate we
settled on is the unique answer.

**Why the surviving candidate is actually valid.** This is the subtle
part that ties Insight 1 to Insight 2. The final candidate `start` is the
station after the *last* place the tank went negative. From `start` to
the end of the array, `tank` never went negative (or we'd have moved the
candidate again). What about the wrap-around portion, from index 0 back
to `start`? Insight 1 guarantees `total ≥ 0`, and all the negative
"debt" incurred before `start` is, by construction, covered by the
positive surplus accumulated from `start` onward — that's exactly what
`total = (surplus from start to end) + (deficit before start) ≥ 0`
means. So the tank, buffered by the surplus earned in the first
(non-wrapping) stretch, survives the wrap. A single valid start, and by
the problem's uniqueness guarantee, *the* answer.

## Solution

`````reveal Solution — single pass, O(n)
````tabs
```python
def can_complete_circuit(gas: list[int], cost: list[int]) -> int:
    total = 0        # net over the whole array — decides feasibility
    tank = 0         # net since the current candidate start
    start = 0
    for i in range(len(gas)):
        diff = gas[i] - cost[i]
        total += diff
        tank += diff
        if tank < 0:             # candidate start..i all disqualified (Insight 2)
            start = i + 1        # restart the search past the failure
            tank = 0
    return start if total >= 0 else -1   # feasibility from Insight 1
```

```typescript
function canCompleteCircuit(gas: number[], cost: number[]): number {
  let total = 0; // net over the whole array — decides feasibility
  let tank = 0; // net since the current candidate start
  let start = 0;
  for (let i = 0; i < gas.length; i++) {
    const diff = gas[i] - cost[i];
    total += diff;
    tank += diff;
    if (tank < 0) {
      // candidate start..i all disqualified (Insight 2)
      start = i + 1; // restart the search past the failure
      tank = 0;
    }
  }
  return total >= 0 ? start : -1; // feasibility from Insight 1
}
```
````

Two accumulators doing two jobs: `total` answers "does *any* start
work?" (Insight 1), and `tank` — reset on each failure — implements the
skip-ahead search for *which* start (Insight 2). The `-1` case and the
answer case share the same loop; only the final line distinguishes them.

```complexity
{
  "time": "O(n)",
  "space": "O(1)",
  "why": "One pass over the arrays; each station does O(1) work. The restart on failure never re-examines a station — Insight 2 proves every station between a failed start and its failure point is dead, so the candidate pointer only ever moves forward, making total work O(n) rather than the brute force's O(n²). Three integer accumulators, so O(1) extra space."
}
```
`````

## Variants

- **Best Time to Buy and Sell Stock** (Arrays module): the same
  "running sum, reset when it goes negative" skeleton underlies Kadane's
  maximum-subarray reasoning — a negative running total means the prefix
  is worth discarding. Recognizing the shared structure is the point.
- **Circular array problems** generally: the wrap-around here is handled
  *without* physically doubling the array, because Insight 1's total
  bound certifies the wrap in advance. Compare with problems where you
  do concatenate the array to itself.
- The two-part structure (a global feasibility check + a local
  locating argument) recurs in many greedy proofs — Insight 1 tells you
  *whether*, Insight 2 tells you *where*.

```quiz
{
  "questions": [
    {
      "question": "You start at station A and the tank first goes negative on arriving at station B. Why can no station C strictly between A and B be a valid start?",
      "options": [
        "Because C has less gas than A — station C's own gas[C] value is smaller than station A's gas[A] value, so C simply starts with less fuel available to work with than A did",
        "Because the stations between A and B all have cost greater than gas — every individual leg strictly between A and B is itself a net loss (cost[i] > gas[i]), which is what drives the tank negative by the time it reaches B",
        "Because starting from A gave a non-negative head-start buffer tank(C) ≥ 0 upon reaching C, so starting fresh from C reaches B with exactly tank(C) LESS fuel — and since A already failed to reach B with a positive tank, C fails at B or sooner"
      ],
      "answer": 2,
      "explanation": "The algebra is tank_from_C(B) = tank_from_A(B) − tank(C). A's run through C accumulated a non-negative buffer that C's fresh run lacks, so C arrives at B with less fuel than A did — and A's already went negative there. Every intermediate C is therefore disqualified, which is exactly what lets the search jump straight to B and achieve O(n)."
    },
    {
      "question": "If total gas equals total cost minus 1 (total < 0), the function returns -1 without checking individual stations. Why is that valid?",
      "options": [
        "Because the first station always fails when total is negative — station 0's own gas[0] − cost[0] value is guaranteed to be negative whenever the array-wide total is negative, so checking just the first station is sufficient",
        "Because over one full loop the net fuel change is Σgas − Σcost regardless of start; if that total is negative, the tank must end below where it began from ANY start, meaning it dipped negative somewhere — so no start can succeed",
        "Because -1 is the default answer when unsure — when the total comes out negative the algorithm has no better answer to offer, so it falls back to returning -1 as a placeholder rather than as a proven impossibility"
      ],
      "answer": 1,
      "explanation": "The full-loop net is start-independent — it's just the sum of every leg. A negative total means you can't return to your starting fuel level no matter where you begin, so the tank went negative en route from every possible start. The sign of the total is a complete feasibility test, which is Insight 1."
    }
  ]
}
```
