---
title: Logarithms & Exponents
type: concept
---

## The one definition to internalize

> **log_b(x) is the answer to: "b to what power gives x?"**

That's the entire concept. log₂(8) = 3 because 2³ = 8. Logarithm and
exponentiation are inverse questions: exponentiation says "multiply b by
itself k times — what do you get?"; logarithm says "you got x — how many
times was b multiplied?"

In DSA the base is almost always 2, and the question takes an equivalent
form you've already met:

> **log₂(n) = how many times can you halve n before reaching 1?**

Those are the same question — halving k times leaves n/2^k, which hits 1
exactly when 2^k = n, i.e. k = log₂ n. This is why the logarithm is not a
"formula" in binary search's analysis; it's the literal count of the loop's
iterations.

## Feel for the numbers

Fluency here means knowing magnitudes without a calculator:

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
multiplications."

**Product rule: log(xy) = log(x) + log(y).**
x contributes log x factors of the base, y contributes log y more;
multiplying x·y stacks the factor counts.

**Power rule: log(xᵏ) = k · log(x).**
The product rule applied k times.

**Change of base: log_b(x) = log_c(x) / log_c(b).**
The practical consequence: any two log bases differ by a *constant factor*
(1/log_c b), which is why Big O never specifies a base — O(log₂ n) and
O(log₁₀ n) are the same class.

One more identity that shows up in analysis:
**2^(log₂ n) = n** (applying inverse operations returns you home), and its
sneaky cousin **a^(log_b n) = n^(log_b a)** — this is how "2 branches, log₂ n
deep" became n calls in the Big O module's Drill 5, and it returns in the
master-theorem-style analyses of divide & conquer.

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
      "options": ["About 40", "About 12", "About 4,000"],
      "answer": 0,
      "explanation": "10¹² = (10³)⁴ ≈ (2¹⁰)⁴ = 2⁴⁰. Every ×1,000 adds ~10 to the log."
    },
    {
      "question": "Why doesn't Big O notation ever specify a logarithm's base?",
      "options": [
        "Because base 2 is assumed by international convention",
        "Because logs of different bases differ only by a constant factor, which O absorbs",
        "Because the base doesn't affect the value of the logarithm"
      ],
      "answer": 1,
      "explanation": "Change of base: log_b n = log_c n / log_c b. That divisor is a constant — invisible to O. The values differ; the growth class doesn't."
    },
    {
      "question": "A loop processes a number by repeatedly stripping its last decimal digit (`n //= 10` / `n = Math.floor(n/10)`). Its complexity in terms of the value n is…",
      "options": [
        "O(n)",
        "O(log n) — one iteration per digit, and n has ~log₁₀ n digits",
        "O(√n)"
      ],
      "answer": 1,
      "explanation": "Dividing by 10 each step is the ×10 version of halving: the iteration count is 'how many times does 10 go into n multiplicatively' = log₁₀ n."
    }
  ]
}
```
