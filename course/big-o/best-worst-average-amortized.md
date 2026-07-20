---
title: Best, Worst, Average & Amortized
type: concept
---

## One algorithm, several cost functions

"What does this algorithm cost?" is underspecified — cost varies with the
*input*, not just its size. Ask the more precise question instead: cost
over *which* inputs?

- **Worst case** — the maximum cost over all inputs of size n. The
  guarantee; the default meaning of a bare complexity claim.
- **Best case** — the minimum. Rarely useful alone, but it tells you what
  the algorithm can exploit (sortedness, early exits).
- **Average case** — the expected cost over some *distribution* of inputs.
  Only meaningful once you say what distribution — that's the fine print.

**Linear search** makes all three concrete. Searching for a target in an
n-element list, one index at a time:

- Target at index 0 → found on the first check → best case **Θ(1)**.
- Target missing entirely → every index gets checked → worst case
  **Θ(n)**.
- Target equally likely at any position → on average you check about
  halfway through: (0 + 1 + ⋯ + (n−1)) / n ≈ (n−1)/2 ≈ n/2 probes →
  **Θ(n)**.

Same code, three honest answers, depending only on what you assume about
the input.

## Two famous case-splits

Two algorithms you already know quietly rely on this distinction — most
people quote their average case as if it were a guarantee.

**Quicksort** is Θ(n log n) on average but **Θ(n²) in the worst case**.
With a naive pivot rule (always pick the last element), an *already-sorted*
input produces splits of size 0 and n−1 every time — the recursion tree
degenerates from a balanced tree into a straight path n levels deep, with
O(n) partition work at each level: n × n = n². Randomizing the pivot
doesn't make bad splits impossible — it makes them *unlikely* for any
fixed input, because now the average is taken over the algorithm's own
coin flips, not over "typical" inputs. That's a much stronger guarantee: it
holds no matter what the input is. (The Sorting module builds this
properly.)

**Hash table lookup** is O(1) *average*, O(n) worst — if every key
happens to land in the same bucket, lookup degenerates into a scan of
that one bucket. Whether that's realistic is a real argument about hash
functions and load factor, and the Hash Tables module makes it in full.
For now: when you say "hash lookup is O(1)," know precisely which case
you're quoting.

## Amortized: charging peaks to quiet neighbors

Amortized analysis answers a different question again. Not "what's a
typical input?" (that's average case) but: **in any sequence of m
operations — including an adversarial one — what's the total cost, divided
by m?** No probability anywhere; it's a worst-case statement, just about a
*sequence* instead of a single call.

The canonical example: appending to a **dynamic array** (Python `list`,
JS array). Normally an append just writes to the next free slot: O(1).
But when the array is full, it has to allocate a new block **twice the
size** and copy every existing element into it before the new item can go
in: O(n) for that one append. Watch what that actually costs across a run,
starting from capacity 1:

| Append # | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Capacity before | 1 | 1 | 2 | 4 | 4 | 8 | 8 | 8 | 8 |
| Cost | 1 | 2 (resize) | 3 (resize) | 1 | 5 (resize) | 1 | 1 | 1 | 9 (resize) |

Most appends cost 1. The expensive ones (resizes) get *rarer* exactly as
fast as they get *bigger* — they happen once the array reaches size 1, 2,
4, 8, … doubling each time. Summing every cost through append 9 gives 24,
for an average under 3 per append — even counting every spike. In general,
for n appends
the resize costs are 1 + 2 + 4 + ⋯ + n/2 ≈ n, plus n ordinary O(1) writes:
about 2n total work for n appends → **O(1) amortized per append**. Watch
the schedule play out — the work counter is the whole argument:

```viz
{ "id": "dynamic-array-growth", "values": [3, 7, 1, 9, 4] }
```

That direct sum works because we could see the whole resize schedule laid
out in advance. Here's a technique that proves the same bound without
needing to precompute anything — the **accounting method**, and it's the
standard tool for amortized proofs you'll meet again later in the course.
Pretend every append is charged **3 units**, not 1: one unit pays for the
write happening right now, and two units go into a bank tied to that
element. When a resize copies n/2 elements, those are exactly the n/2
elements appended since the *last* resize — and each one banked 2 units,
for exactly n units sitting in the bank, exactly enough to pay for copying
them. No operation ever needs to draw on an empty bank, so a flat charge
of 3 units genuinely covers everything, spikes included. That's the proof
— and it exposes *why* the growth factor has to be multiplicative. Grow by
a fixed +10 slots instead of doubling, and a resize (cost ~n) comes due
every 10 appends regardless of how large the array already is: total work
~n²/20 for n appends, i.e. **O(n) amortized** — quadratic, not constant.
Doubling isn't a stylistic convention; it's the one thing that makes the
banking argument close.

## Using the right lens

| Claim you'll meet | What it actually means |
| --- | --- |
| "Quicksort is O(n log n)" | average case (randomized pivots); worst is Θ(n²) |
| "Hash lookup is O(1)" | average case, assuming healthy hashing |
| "Array append is O(1)" | amortized over any sequence; single appends can be Θ(n) |
| "Merge sort is O(n log n)" | genuinely worst case — no fine print |

The skill isn't memorizing this table — it's asking, whenever you hear a
bare complexity claim, *"over what: the worst input, a random input, or a
long sequence of operations?"* Those are three different promises, and
conflating them is where most "but I thought this was fast" surprises
come from.

```quiz
{
  "questions": [
    {
      "question": "Dynamic-array append is 'O(1) amortized.' What does that claim actually say?",
      "options": [
        "Each individual append takes O(1) time",
        "Appends are O(1) if you get lucky with resizes",
        "Any sequence of n appends totals O(n) work, even though single appends can cost Θ(n)"
      ],
      "answer": 2,
      "explanation": "Amortized bounds are exact statements about worst-case *totals* over sequences — no luck involved. Individual spikes are real but paid for by the cheap operations around them."
    },
    {
      "question": "Why does growing a dynamic array by a fixed 10 slots (instead of doubling) ruin the amortized bound?",
      "options": [
        "Allocation of small blocks is slow",
        "A copy of the whole array (cost ~n) then happens every 10 appends, totaling ~n²/20 for n appends — O(n) amortized",
        "It wastes memory"
      ],
      "answer": 1,
      "explanation": "With additive growth, each spike costs ~n and spikes come at a constant rate, so total work is quadratic. Multiplicative growth spaces the spikes out exponentially — that's the whole trick."
    },
    {
      "question": "Amortized analysis differs from average-case analysis because…",
      "options": [
        "amortized is a worst-case statement about operation sequences; average-case is an expectation over a distribution of inputs",
        "amortized is only an empirical estimate",
        "they are two names for the same idea"
      ],
      "answer": 0,
      "explanation": "Amortized bounds hold for *every* sequence, adversarial included — no probability anywhere. Average case needs an assumed input distribution (or the algorithm's own randomness)."
    }
  ]
}
```
