---
title: Summations & Series
type: concept
---

## The triangular shelf

At the far end of the Grand Library Archive stands an odd bookcase: a
triangular one. The bottom shelf holds 1 book, the shelf above it holds 2,
the one above that holds 3, and so on up to the top shelf, which holds n
books. The Master Archivist asks a simple question: how many books does
the whole triangular bookcase hold, total?

You've actually answered a version of this question already, back in Big
O's lesson on analyzing loops — a nested loop where the inner loop runs
`i` times on pass `i` does a total of 0 + 1 + 2 + ⋯ + (n−1) work across
all passes. It's worth deriving the closed form properly, because this
exact sum — 1 + 2 + ⋯ + n — shows up constantly, anywhere the phrase
"process all pairs of n things" applies.

The trick (usually credited to a young Gauss, though the Archivist would
say it's just common sense once you've stacked enough shelves) is to take
a second, upside-down copy of the triangular bookcase and slot it against
the first — flip it so its 1-book shelf sits next to the original's
n-book shelf, its 2-book shelf next to the original's (n−1)-book shelf,
and so on:

```
  1  +  2  +  3  + ⋯ + (n−1) +  n
+ n  + (n−1) + (n−2) + ⋯ +  2  +  1
-----------------------------------
(n+1) + (n+1) + (n+1) + ⋯ + (n+1) + (n+1)
```

Every combined shelf now holds exactly `n+1` books, and there are `n`
shelves, so the two bookcases together hold `n(n+1)` books. Halve that for
one bookcase, and:

> **1 + 2 + ⋯ + n = n(n+1) / 2**

This is why a nested loop with a dependent inner bound is O(n²) and not
something gentler: n(n+1)/2 is a quadratic in n, and O notation drops the
constant ½ and the lower-order +1. It's also why "all pairs of n items"
problems — the handshake-greeting shape from Big O's complexity-classes
lesson — cost the same n(n-1)/2, off by one from the pure sum above
because you don't pair an item with itself.

## The growing storage boxes — doubling and halving

The Archive also keeps a row of expandable storage boxes for overflow
archives. Whenever the current box fills up, the Archivist doesn't buy a
slightly bigger one — she buys one **exactly twice the size** and moves
everything over. The first box holds 1 crate, the next holds 2, the next
4, the next 8, and so on. Her question this time: across every box she's
ever bought, how many crate-slots has she paid for in total?

This is the second shape you've already met — a sum where each term is a
constant multiple of the one before it, a **geometric series**. Two
versions of it appear constantly in this course, and they look like
mirror images of each other.

**Doubling.** 1 + 2 + 4 + 8 + ⋯ + 2^(k−1) — this is exactly the
Archivist's box-buying total, and it's the total cost of every resize a
dynamic array pays for on its way to holding n elements (the
amortized-analysis lesson in Big O used exactly this sum). Add the terms
and something clean happens: 1+2 = 3, which is one less than 4; 1+2+4 = 7,
one less than 8. In general:

> **1 + 2 + 4 + ⋯ + 2^(k−1) = 2^k − 1**

The whole sum is just *one step past its own last term* — the Archivist's
lifetime box-slot total is barely more than the size of the single
biggest box she ever bought. That's why a dynamic array's total resize
cost across n appends (1 + 2 + 4 + ⋯ + n/2) comes out to roughly n, not
something that grows faster than n — the sum of all the doublings barely
exceeds the size you ended up at.

**Halving.** The mirror image: n + n/2 + n/4 + ⋯ + 1. Picture the
Archivist clearing out an overflowing pile instead of growing one — day
one she clears n crates, day two half that many, day three half again,
and so on until there's nothing left to clear. Same shape as the boxes,
opposite direction — each term is half the one before instead of double.
The total still comes out close to **2n**: the first day's work alone is
already n, and every day after it only adds up to one more n combined,
for the same reason the doubling sum stopped just short of its last term.
This is the sum behind merge sort's "levels" table and behind any
recursive process that does a full pass of shrinking work at every level
of a halving recursion.

Both are instances of the general geometric series formula — a run of
terms `a, ar, ar², …, ar^(k−1)` sums to `a(r^k − 1)/(r − 1)` for ratio
`r ≠ 1` — but you'll rarely need the general formula by name. What you
need is the shape recognition, the Archivist's own rule of thumb: **a sum
that doubles or halves each term is dominated by its single largest
term**, and everything else combined barely matters. That single fact is
why "the work per level stays flat across log n levels" (merge sort:
O(n log n)) and "the total resize cost across n appends is proportional
to n" (dynamic arrays: O(1) amortized) are both true for the same
underlying reason.

## Why this matters beyond the two examples

Whenever you're staring at code and asking "what's the total across every
iteration of an outer loop, where the inner loop's size depends on the
outer index," you're asking a summation question, and it's almost always
one of these two shapes: constant differences between consecutive terms
(arithmetic, triangular shelves) or constant *ratios* between consecutive
terms (geometric, doubling/halving boxes). Recognizing which shape you're
looking at tells you the answer before you touch pen and paper: arithmetic
sums are quadratic in their term count, geometric sums are dominated by
their single biggest term.

```quiz
{
  "questions": [
    {
      "question": "A loop's inner body runs i times on pass i, for i from 1 to n. What is the total number of inner-loop iterations, in closed form?",
      "options": [
        "n(n+1)/2 — the triangular sum, from pairing the smallest and largest terms",
        "2^n — since the work compounds every pass, the total should grow exponentially with n",
        "n log n — a loop whose per-pass cost changes is the signature of a linearithmic total"
      ],
      "answer": 0,
      "explanation": "This is exactly the triangular sum 1+2+...+n = n(n+1)/2. It's a quadratic total, not exponential or linearithmic — the per-pass cost grows linearly with the pass number, and summing a linear sequence gives a quadratic total."
    },
    {
      "question": "A process does n units of work, then n/2, then n/4, and so on, until the remaining work rounds down to nothing. What's the total work, approximately?",
      "options": [
        "n log n — because there are about log n halvings before reaching a small remainder",
        "2n — a halving series is dominated by its first, largest term, and the rest combined barely add one more n",
        "n² — repeatedly reducing by half is the same shape as the triangular sum, so the same quadratic total applies"
      ],
      "answer": 1,
      "explanation": "A halving (geometric) series sums to roughly twice its first term — n + n/2 + n/4 + ... converges to about 2n. This is a different shape from the triangular sum: geometric series are dominated by one term, arithmetic series grow as the square of the term count."
    },
    {
      "question": "Why does a dynamic array's total resize cost across n appends work out to O(n), not something worse?",
      "options": [
        "The resize costs (1, 2, 4, 8, ... up to about n) form a doubling geometric series, and a doubling series sums to roughly twice its largest term — about 2n, not n²",
        "Because each individual resize is O(1), so n resizes cost O(n) total — the same reasoning as any loop that does constant work per iteration",
        "Because resizes only happen log n times, and each one costs O(n), giving O(n log n) total, which rounds down to O(n) for practical purposes"
      ],
      "answer": 0,
      "explanation": "Resizes aren't O(1) each — they cost 1, 2, 4, ..., up to about n. That's a doubling geometric series, and such a series is dominated by its last (largest) term: the sum barely exceeds n. This is the same fact that makes amortized analysis work, from the Big O module's amortized-analysis lesson."
    }
  ]
}
```
