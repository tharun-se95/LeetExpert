---
title: "Input Dependency: Best, Worst, & Average"
type: concept
---

## The clerk and the mail bin

Imagine you're a clerk in a busy parcel-sorting post office, and a bin of
letters of a certain size arrives. You need to process them all — but
"how long will this take?" turns out to depend entirely on what's actually
in the bin, not just how many letters there are.

**The lucky delivery.** If the letters arrive already perfectly sorted by
zip code, you can just slide them directly into their delivery cubbies.
This is the absolute minimum effort possible — an incredibly lucky
scenario.

**The messy delivery.** If the letters arrive in a completely chaotic
mess, or if they are all mislabeled so you have to look up every address
in a paper directory, you have to do the maximum possible amount of work
for a bin of that size.

**The typical day.** Most days, the letters arrive in a typical, random
mixture. Your expected effort sits comfortably in the middle.

This is exactly the vocabulary this lesson formalizes. "What does this
algorithm cost?" is underspecified — cost varies with the *input*, not
just its size. Ask the more precise question instead: cost over *which*
inputs?

- **Worst case** — the maximum cost over all inputs of size n. The
  guarantee; the default meaning of a bare complexity claim. This is the
  messy delivery.
- **Best case** — the minimum. Rarely useful alone, but it tells you what
  the algorithm can exploit (sortedness, early exits). This is the lucky
  delivery.
- **Average case** — the expected cost over some *distribution* of inputs.
  Only meaningful once you say what distribution — that's the fine print.
  This is the typical day.

**Linear search** makes all three concrete. Searching for a target in an
n-element list, one index at a time:

- Target at index 0 → found on the first check → best case **Θ(1)**.
- Target missing entirely → every index gets checked → worst case
  **Θ(n)**.
- Target equally likely at any position → on average you check about
  halfway through: (0 + 1 + ⋯ + (n−1)) / n ≈ (n−1)/2 ≈ n/2 probes →
  **Θ(n)**.

Same code, three honest answers, depending only on what you assume about
the input. Keep this vocabulary loaded as you move into the next two
lessons — every loop and every recursive call you analyze there is
implicitly answering "which case?" the moment you pick an input to trace.

## Two famous case-splits

Two algorithms you already know quietly rely on this distinction — most
people quote their average case as if it were a guarantee.

**The divider sorting strategy.** Suppose you use a specific sorting
method: you pick one "divider" envelope from the pile, and split the pile
into letters that go to the left of the divider and letters that go to
the right. Then you repeat this for each sub-pile. This is **quicksort**,
and it is Θ(n log n) on average but **Θ(n²) in the worst case**.

**The lazy choice.** If you are lazy and always pick the very last
envelope in the pile as your divider, and the pile happens to already be
perfectly sorted, you make a terrible mistake. You split the pile into an
empty stack and a stack containing all the other letters except one — so
you have to repeat this agonizing process over and over, peeling off only
one letter at a time, resulting in a massive, slow quadratic pile of work.
With a naive pivot rule (always pick the last element), an *already-sorted*
input produces splits of size 0 and n−1 every time — the recursion tree
degenerates from a balanced tree into a straight path n levels deep, with
O(n) partition work at each level: n × n = n².

**The random choice.** If you instead grab a completely random envelope
from the pile as your divider, you are highly likely to get a balanced
split — even if the mail started out sorted, this random selection
guarantees the task completes fast on average. Randomizing the pivot
doesn't make bad splits impossible — it makes them *unlikely* for any
fixed input, because now the average is taken over the algorithm's own
coin flips, not over "typical" inputs. That's a much stronger guarantee: it
holds no matter what the input is. (The Sorting module builds this
properly.)

**The mail lookup shelves.** Finally, let's look at your mail lookup
shelves. You have a wall of labeled slots. Usually, the addresses are
distributed evenly, so each slot has at most one or two letters — finding
a letter is instant, you go straight to the slot and grab it. This is
**hash table lookup**, and it's O(1) *average*, O(n) worst.

**The sorting error.** But if a massive labeling error occurs and every
single letter in the shipment gets assigned to the exact same slot, the
system breaks down — to find a single letter, you now have to stand there
and manually search through the entire giant stack stuffed into that one
slot. If every key happens to land in the same bucket, lookup degenerates
into a scan of that one bucket. Whether that's realistic is a real
argument about hash functions and load factor, and the Hash Tables module
makes it in full. For now: when you say "hash lookup is O(1)," know
precisely which case you're quoting.

```quiz
{
  "questions": [
    {
      "question": "Quicksort with a naive 'always pick the last element' pivot is handed an already-sorted array. What happens to its running time?",
      "options": [
        "It stays Θ(n log n) — pivot choice only affects constant factors, not the asymptotic complexity",
        "It degrades to Θ(n²) — every partition splits into sizes 0 and n−1, turning the recursion tree into a straight path n levels deep with O(n) work per level",
        "It improves to Θ(n) — a sorted input needs no swaps during partitioning, so each partition step finishes in O(1)"
      ],
      "answer": 1,
      "explanation": "A degenerate split doesn't shrink the problem — it peels off one element per level. n levels × O(n) partition work per level = Θ(n²), the worst case the average-case Θ(n log n) claim quietly excludes."
    },
    {
      "question": "\"Hash table lookup is O(1)\" is almost always shorthand for which case?",
      "options": [
        "Worst case — the guarantee holds even if every key collides into a single bucket",
        "Best case — it only describes the lucky scenario where the first bucket checked happens to hold the key",
        "Average case, assuming a healthy hash function keeps keys spread across buckets — if every key collides into one bucket, lookup is O(n)"
      ],
      "answer": 2,
      "explanation": "The O(1) claim leans on keys being spread out. A pathological key set (or a broken hash function) collapses every lookup into scanning one bucket — that's the O(n) worst case the average-case shorthand hides."
    },
    {
      "question": "A function's best case is Θ(1) and its worst case is Θ(n). Which statement about its average case is correct?",
      "options": [
        "It must be Θ(n) — average case defaults to the worse of the two extremes when nothing else is specified",
        "It depends entirely on the assumed input distribution — average case isn't determined by the best/worst bounds alone, it needs a stated distribution (or the algorithm's own randomness) to mean anything",
        "It must be Θ(1) — as n grows, most randomly generated inputs end up resembling the best case more closely than the worst case"
      ],
      "answer": 1,
      "explanation": "Best and worst case bound the range; they don't pin down what's typical inside it. Average case is a separate claim that requires its own assumption about which inputs are likely."
    }
  ]
}
```
