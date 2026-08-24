---
title: Amortized Analysis & Dynamic Arrays
type: concept
---

## The expanding shelf row

Back at your sorting desk, you're managing a row of storage shelves for
incoming packages. Normally, you have a designated row of shelves for
incoming packages, and when a new package arrives, placing it in the next
empty shelf slot is incredibly easy — just slide it in. But what happens
when the row of shelves is completely full? You have to move your entire
setup to a new, larger location. This is a massive, exhausting move: you
must pick up every single package on the shelf and carry them, one by
one, to the new rack.

To make sure you don't spend all your time moving, you establish a rule:
whenever your current shelf fills up, you build a new one that is exactly
**twice** the size of the old one. The moves get larger and further
apart, but they also become rarer, since it takes longer and longer
periods of quick, single-slide-ins between moves.

This is a different question than the case-analysis lessons asked. The
case-analysis lessons asked "what's a typical input?" — best, worst,
average, all about a *single call* on inputs that differ. Amortized
analysis asks something else entirely: **in any sequence of m
operations on the same structure — including an adversarial one — what's
the total cost, divided by m?** No probability anywhere; it's a worst-case
statement, just about a *sequence* instead of a single call.

## Charging peaks to quiet neighbors

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
4, 8, … doubling each time, exactly like your shelf-doubling rule. Summing
every cost through append 9 gives 24, for an average under 3 per append —
even counting every spike. In general, for n appends the resize costs are
1 + 2 + 4 + ⋯ + n/2 ≈ n, plus n ordinary O(1) writes: about 2n total work
for n appends → **O(1) amortized per append**. Watch the schedule play
out — the work counter is the whole argument:

```viz
{ "id": "dynamic-array-growth", "values": [3, 7, 1, 9, 4] }
```

That direct sum works because we could see the whole resize schedule laid
out in advance. Here's a technique that proves the same bound without
needing to precompute anything — the **accounting method**, and it's the
standard tool for amortized proofs you'll meet again later in the course.
Imagine that every time you place a new package, you charge yourself **3
tokens**, not 1: one token pays for the placement happening right now, and
two tokens go into a bank tied to that package. Consider the moment the
shelf fills up and the next package triggers a move, which must carry
every one of its **n** current packages. The shelf was last expanded when
it held **n/2** packages (that move doubled its capacity to n), so exactly
the newest **n/2** of the current packages were placed *since* that last
move — and each of those is still carrying its 2 banked tokens, for
exactly **n** tokens sitting in the bank. That's exactly enough to pay for
carrying all **n** packages at 1 token each: the older surviving n/2
packages already spent their own banked tokens paying for the *previous*
move, so it's the newer half's bank, not their own, that covers this one.
No move ever needs to draw on an empty bank, so a flat charge of 3 tokens
genuinely covers everything, spikes included. That's the proof — and it
exposes *why* the growth factor has to be multiplicative.

**The failure of fixed growth.** Now, imagine if you tried to save shelf
space by only adding 10 shelves at a time instead of doubling. This means
a grueling move of *all* the packages to a brand-new rack has to happen
every single time you exceed your current 10 new packages. The effort of
those moves becomes constant, and your banking system completely broke.
Grow by a fixed +10 slots instead of doubling, and a resize (cost ~n)
comes due every 10 appends regardless of how large the array already is:
total work ~n²/20 for n appends, i.e. **O(n) amortized** — quadratic, not
constant. Doubling isn't a stylistic convention; it's the one thing that
makes the banking argument close.

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
        "Any sequence of n appends totals O(n) work, even though single appends can cost Θ(n)",
        "Appends are O(1) if you get lucky with resizes — the amortized guarantee only holds for input sequences that happen to avoid triggering too many resizes in a row",
        "Each individual append takes O(1) time — every single call into append, including the ones that trigger a resize, completes in constant time because the array's capacity is pre-allocated generously enough"
      ],
      "answer": 0,
      "explanation": "Amortized bounds are exact statements about worst-case *totals* over sequences — no luck involved. Individual spikes are real but paid for by the cheap operations around them."
    },
    {
      "question": "Why does growing a dynamic array by a fixed 10 slots (instead of doubling) ruin the amortized bound?",
      "options": [
        "Allocation of small blocks is slow — requesting memory from the operating system in tiny 10-slot increments incurs high per-call overhead compared to requesting one large block up front",
        "It wastes memory — growing by a fixed amount leaves more unused slack in the backing array on average than doubling does, which is the actual problem with the fixed-increment strategy",
        "A copy of the whole array (cost ~n) then happens every 10 appends, totaling ~n²/20 for n appends — O(n) amortized"
      ],
      "answer": 2,
      "explanation": "With additive growth, each spike costs ~n and spikes come at a constant rate, so total work is quadratic. Multiplicative growth spaces the spikes out exponentially — that's the whole trick."
    },
    {
      "question": "Amortized analysis differs from average-case analysis because…",
      "options": [
        "they are two names for the same idea — both amortized and average-case analysis produce a single number by averaging costs, so the underlying mathematics is identical even if the terminology differs",
        "amortized is only an empirical estimate — you have to actually run the algorithm and measure real operation sequences to arrive at an amortized bound, unlike a worst-case bound which is proven mathematically",
        "amortized is a worst-case statement about operation sequences; average-case is an expectation over a distribution of inputs"
      ],
      "answer": 2,
      "explanation": "Amortized bounds hold for *every* sequence, adversarial included — no probability anywhere. Average case needs an assumed input distribution (or the algorithm's own randomness)."
    }
  ]
}
```
