---
title: Big O Notation, Precisely
type: concept
---

## The definition

Big O is a statement about functions, made precise:

> **f(n) = O(g(n))** means there exist a constant **c > 0** and a threshold
> **n₀** such that for all **n ≥ n₀**:  f(n) ≤ c · g(n).

In words: *past some point, f is bounded above by a constant multiple of g.*
It's an **upper bound on growth** — it says "f grows no faster than g," and
nothing more.

Let's use the definition once, honestly. Claim: `3n² + 10n + 50 = O(n²)`.
Pick c = 4 and n₀ = 14. For n ≥ 14: 10n + 50 ≤ 10n + 4n ≤ n² (since
n ≥ 14 means 14n ≤ n²), so 3n² + 10n + 50 ≤ 3n² + n² = 4n². Done — the
definition is satisfied, and you'll rarely need to do this by hand again.

```diagram
{
  "id": "complexity-curve",
  "mode": "bound",
  "fLabel": "f(n)=3n²+10n+50",
  "gLabel": "4·n²",
  "c": 4,
  "n0": 14
}
```

What matters is what the definition *licenses* you to do.

## What the definition licenses

**Dropping constant factors.** `5n = O(n)` — take c = 5. The definition
absorbs any multiplier into c. This is a feature: the "5" depends on
language and hardware; the "n" doesn't.

**Dropping lower-order terms.** `n² + n = O(n²)` — for n ≥ 1, n ≤ n², so
n² + n ≤ 2n². For large n, the biggest term is essentially the whole value:
at n = 1,000,000, the n² term of n² + n contributes 99.9999% of the total.

**Keeping only the dominant term of a sum.** An algorithm that sorts
(n log n) and then scans (n) is O(n log n + n) = O(n log n).

What it does **not** license: dropping things that depend on n. `n · n` is
not "n times a constant." And exponents matter: 2ⁿ and 3ⁿ are *not* the
same class (3ⁿ/2ⁿ = 1.5ⁿ, which is unbounded).

## O, Ω, Θ — and the worst-case conflation

Big O has two siblings:

- **Ω (Omega)** — the same definition with ≥: a **lower** bound. "f grows
  at least this fast."
- **Θ (Theta)** — both at once: f is sandwiched between two constant
  multiples of g. This is what "exactly this growth rate" means.

Now the subtlety that trips almost everyone. **"Big O" and "worst case" are
independent ideas.** O/Ω/Θ describe *functions*; best/worst/average case
choose *which function of the algorithm you're describing*. You can
correctly say:

- insertion sort's **worst case** is Θ(n²) — a reversed array truly costs
  quadratic;
- insertion sort's **best case** is Θ(n) — an already-sorted array costs
  one comparison per element;
- and since every case is trivially O of the worst case, "insertion sort is
  O(n²)" is a statement about all inputs at once.

In casual usage — this course included — "the algorithm is O(g)" means "its
worst-case running time is O(g), and that bound is tight." When the case
distinction matters (hash tables, quicksort), we'll say so explicitly.
Lesson 5 is entirely about those distinctions.

## Why an upper bound is the default

Why does everyone lead with O rather than Θ? Because an upper bound is a
**guarantee**: "this will take *at most* this long" is the promise callers
need. Lower bounds matter too — proving *no* comparison sort can beat
n log n is an Ω statement, and we'll prove it in the Sorting module — but
day to day, you're budgeting against the ceiling.

```quiz
{
  "questions": [
    {
      "question": "Which statement does f(n) = O(n²) actually make?",
      "options": [
        "Beyond some point, f(n) is at most a constant multiple of n²",
        "f grows exactly like n² — the two functions track each other closely enough that neither can be a constant multiple bigger than the other for large n",
        "f's worst case takes n² steps — Big O is fundamentally a statement about the worst input, baked into the notation itself rather than being a separate choice you make"
      ],
      "answer": 0,
      "explanation": "O is only an upper bound on growth. Saying f grows *exactly* like n² is a Θ statement, and O by itself says nothing about cases at all."
    },
    {
      "question": "Is the claim `2n + 100 = O(n)` true?",
      "options": [
        "Only for small n — once n grows large enough the +100 term becomes negligible relative to 2n, so the bound flips from true to false past some threshold",
        "No — the +100 eventually matters, because Big O requires f(n) to equal c·n exactly in the limit, and an additive constant permanently breaks that equality",
        "Yes — pick c = 3, n₀ = 100: for n ≥ 100, 2n + 100 ≤ 2n + n = 3n"
      ],
      "answer": 2,
      "explanation": "Constants get absorbed: past n₀ = 100 the term 100 is at most n, so c = 3 works. The definition only cares about large n."
    },
    {
      "question": "An algorithm runs in Θ(n) on sorted input and Θ(n²) on reversed input. Which is correct?",
      "options": [
        "The algorithm is Θ(n²) — Θ bounds must hold for every input, so the presence of even one input class costing n² forces the whole algorithm's Θ to be n²",
        "Its worst case is Θ(n²) and its best case is Θ(n)",
        "The algorithm is O(n) — since the algorithm technically achieves linear time on some inputs, that best-case behavior is what the O notation is reporting"
      ],
      "answer": 1,
      "explanation": "O/Θ describe a chosen case's cost function. Naming the case makes both statements precise; a bare 'Θ(n²)' would wrongly claim every input costs quadratic."
    }
  ]
}
```
