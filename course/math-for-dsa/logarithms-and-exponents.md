---
title: Logarithms & Exponents
type: concept
---

## The filing cabinet search

Picture the Grand Library Archive's oldest cabinet: a branching filing
system where every drawer splits into two smaller drawers, which each
split into two smaller ones, and so on. The Master Archivist hands you a
single index card to find among a billion filed cards, and instead of
opening drawers one at a time, you play a halving game: open the middle
drawer, see which half the card must be in, and discard the other half
entirely. Repeat. Every round the pile you're searching cuts in half, and
you're counting *rounds*, not cards.

That round count is the entire concept this lesson formalizes:

> **log_b(x) is the answer to: "b to what power gives x?"**

log₂(8) = 3 because 2³ = 8. Logarithm and exponentiation are inverse
questions: exponentiation says "multiply b by itself k times — what do you
get?"; logarithm says "you got x — how many times was b multiplied?"

In DSA the base is almost always 2, and the question is exactly the
halving game you just played:

> **log₂(n) = how many times can you halve n before reaching 1?**

Those are the same question — halving k times leaves n/2^k, which hits 1
exactly when 2^k = n, i.e. k = log₂ n. This is why the logarithm is not a
"formula" in binary search's analysis; it's the literal count of the
drawer-halvings.

```diagram
{ "id": "log-halving", "n": 8 }
```

Three halvings, three bars, done — that row count IS log₂ 8.

## Feel for the numbers

Fluency here means knowing magnitudes without a calculator — the
Archivist's own trick: a cabinet holding a thousand cards needs about ten
halving rounds to find one; a cabinet a thousand times bigger only needs
about ten *more* rounds, not a thousand more.

| n | log₂ n (≈) |
| --- | --- |
| 1,000 | 10 (2¹⁰ = 1,024) |
| 1,000,000 | 20 |
| 1,000,000,000 | 30 |
| 10¹² | 40 |

The pattern behind the table: **every ×1,000 adds about 10** (because
2¹⁰ ≈ 10³). Memorize `2¹⁰ ≈ 10³` and you can reconstruct everything else.
This is what makes O(log n) algorithms feel like cheating — a trillion
inputs, 40 steps.

## The rules, and why they're true

Each rule is just the definition restated. In every case, think "count the
splits."

**Product rule: log(xy) = log(x) + log(y).** If two cabinets need to be
searched together — one halving-split x ways deep, the other y ways
deep — the combined search depth is just the two split-counts added.
x contributes log x factors of the base, y contributes log y more;
multiplying x·y stacks the factor counts.

**Power rule: log(xᵏ) = k · log(x).**
The product rule applied k times.

**Change of base: log_b(x) = log_c(x) / log_c(b).** Whether the Archivist
splits each drawer two ways or three ways, the two search-depth counts
differ only by a fixed ratio — never by a different growth shape. The
practical consequence: any two log bases differ by a *constant factor*
(1/log_c b), which is why Big O never specifies a base — O(log₂ n) and
O(log₁₀ n) are the same class.

One more identity that shows up in analysis: **2^(log₂ n) = n** — the
Archive's own self-indexing property, where a branching cabinet that
doubles in width at every one of its log₂ n levels ends up holding
exactly n cards, applying a function and its inverse returns you home
(this is exactly what made Big O's Drill 5 work: a recursion tree that
doubles in width at every one of its log₂ n levels ends with
2^(log₂ n) = n leaves).

A less obvious cousin, worth seeing derived rather than just stated:
**a^(log_b n) = n^(log_b a)**. Take log_b of both sides and check they
match: log_b(a^(log_b n)) = (log_b n)(log_b a) by the power rule, and
log_b(n^(log_b a)) = (log_b a)(log_b n) — same product, so the two
original expressions are equal. This shows up when a recursion branches
`a` ways and shrinks by a factor of `b` each level (T(n) = a·T(n/b) + …):
the leaf count works out to n^(log_b a), and this identity is the reason
that expression can also be written base-a instead of base-b.

## Where logs appear in this course

- **Halving loops** — binary search, `i *= 2` loops: log n iterations.
- **Balanced tree height** — a binary tree that's "full" at every level has
  ~2^h nodes at height h, so n nodes ⇒ height ≈ log₂ n. BST/heap operation
  costs are tree-height costs.
- **Divide & conquer depth** — merge sort's log n levels.
- **Digits** — a number n has ⌊log₁₀ n⌋ + 1 decimal digits (and
  ⌊log₂ n⌋ + 1 bits): "how many digits" is "how many times can you divide by
  10." Any digit-by-digit loop is O(log n).

```quiz
{
  "questions": [
    {
      "question": "Without a calculator: roughly what is log₂(1,000,000,000,000)?",
      "options": [
        "About 12",
        "About 4,000",
        "About 40"
      ],
      "answer": 2,
      "explanation": "10¹² = (10³)⁴ ≈ (2¹⁰)⁴ = 2⁴⁰. Every ×1,000 adds ~10 to the log."
    },
    {
      "question": "Why doesn't Big O notation ever specify a logarithm's base?",
      "options": [
        "Because base 2 is assumed by international convention, so omitting a base in Big O is simply shorthand for log₂, the same way we omit units in other contexts",
        "Because logs of different bases differ only by a constant factor, which O absorbs",
        "Because the base doesn't affect the value of the logarithm — log₂(x) and log₁₀(x) compute the identical number once you account for how logarithms are defined"
      ],
      "answer": 1,
      "explanation": "Change of base: log_b n = log_c n / log_c b. That divisor is a constant — invisible to O. The values differ; the growth class doesn't."
    },
    {
      "question": "A loop processes a number by repeatedly stripping its last decimal digit (`n //= 10` / `n = Math.floor(n/10)`). Its complexity in terms of the value n is…",
      "options": [
        "O(√n) — stripping digits one at a time resembles trial division's up-to-√n search pattern, since both loops terminate once they've covered roughly half the number's magnitude",
        "O(n) — the loop divides by 10 a fixed amount less each time rather than shrinking multiplicatively, so the iteration count scales directly with the size of n itself, not its digit count",
        "O(log n) — one iteration per digit, and n has ~log₁₀ n digits"
      ],
      "answer": 2,
      "explanation": "Dividing by 10 each step is the ×10 version of halving: the iteration count is 'how many times does 10 go into n multiplicatively' = log₁₀ n."
    }
  ]
}
```
