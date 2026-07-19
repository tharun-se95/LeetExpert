---
title: Best, Worst, Average & Amortized
type: concept
---

## One algorithm, several cost functions

"What does this algorithm cost?" is underspecified — cost varies with the
*input*, not just its size. So we name which inputs we mean:

- **Worst case** — the maximum cost over all inputs of size n. The
  guarantee; the default meaning of a bare complexity claim.
- **Best case** — the minimum. Rarely useful alone, but it tells you what
  the algorithm can exploit (sortedness, early exits).
- **Average case** — the expected cost over some *distribution* of inputs.
  Only meaningful once you say what distribution — that's the fine print.

**Linear search** makes it concrete: target at index 0 → best case Θ(1);
target absent → worst case Θ(n); target equally likely at any position →
average ~n/2 probes → Θ(n).

## Two famous case-splits

**Quicksort** is Θ(n log n) on average but **Θ(n²) in the worst case**:
with a bad pivot rule (say, always the last element) an already-sorted
input produces splits of size 0 and n−1 — the recursion tree degenerates
into a path, and depth n × partition-work n gives n². Randomizing the pivot
makes bad splits *unlikely* rather than impossible: the average is over the
algorithm's own coin flips, valid for every input. (The Sorting module does
this properly.)

**Hash table lookup** is O(1) *average*, O(n) worst — if every key lands in
the same bucket, lookup degenerates to a scan. Why we may treat collisions
as rare is a real argument about hash functions and load factor, and the
Hash Tables module makes it. When you say "hash lookup is O(1)," know that
you're quoting the average case.

## Amortized: charging peaks to quiet neighbors

Amortized analysis answers a different question. Not "what's a typical
input?" but: **"in any sequence of m operations, what's the total — worst
case — divided by m?"** No probability involved.

The canonical example: appending to a **dynamic array** (Python `list`,
JS array). Normally append writes one slot: O(1). But when capacity runs
out, the array allocates a new block **twice the size** and copies
everything: O(n) for that one append.

So is append O(n)? Watch a full sequence. Start with capacity 1 and append
n times. Copies happen at sizes 1, 2, 4, 8, …, so the total copy work is
1 + 2 + 4 + ⋯ + n/2 ≈ **n**, plus n ordinary writes. Total ≈ 2n for n
appends → **O(1) amortized per append**, even counting the spikes.

The accounting view: charge each append **3 units** — one to write, two
banked. When a copy of n elements comes due, the n/2 elements appended
since the last resize have banked n units — exactly enough to pay for it.
No operation ever draws on an empty bank, so 3 units cover everything:
that's the proof, and it's *why* the growth factor must be multiplicative.
Growing by a fixed +10 slots instead would force a copy every 10 appends —
total work n²/20, i.e. **O(n) amortized**. Doubling isn't a convention;
it's what makes the argument work.

## Using the right lens

| Claim you'll meet | What it actually means |
| --- | --- |
| "Quicksort is O(n log n)" | average case (randomized pivots); worst is Θ(n²) |
| "Hash lookup is O(1)" | average case, assuming healthy hashing |
| "Array append is O(1)" | amortized over any sequence; single appends can be Θ(n) |
| "Merge sort is O(n log n)" | genuinely worst case — no fine print |

The skill isn't memorizing this table — it's asking, whenever you hear a
complexity claim, *"over what: worst input, random input, or a long
sequence?"*

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
