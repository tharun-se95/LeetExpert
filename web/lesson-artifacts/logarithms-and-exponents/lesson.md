---
title: "Logarithms & Exponents"
kicker: "Math for DSA • Foundations • concept lesson"
headline: "Count the halvings: logarithmic time turns astronomical scale into trivial steps."
lede: "Every doubling of input adds merely a single halving round. Halving a billion folders reaches a single folder in only 29 halvings, which is why O(log n) algorithms stay fast on massive datasets."
chips:
  - "count the **halving rounds**"
  - "every ×1,000 **adds about 10 halvings**"
  - "all log bases share **O(log n)**"
hero: |
  <div class="hero-stage"><div class="hero-art navy"><svg id="heroHalving" viewBox="0 0 560 160" role="img" aria-label="A filing cabinet halved repeatedly: 16 folders cut to 8, 4, 2, and 1."></svg>
  <div class="hero-read" id="heroRead"><div class="hero-num"><b id="heroNum"></b> <span id="heroUnit"></span></div><div id="heroCap"></div></div></div></div>
---

## The filing cabinet search {#problem toc="Filing cabinet search"}

```caption
Finding one card among n by halving the search space counts rounds, not items.
```

```vig "A multi-drawer filing cabinet with an open central drawer and halved document stacks"
<rect class="fa" x="70" y="15" width="100" height="82" rx="4"/>
<line class="st" x1="70" y1="35" x2="170" y2="35"/>
<line class="st" x1="70" y1="56" x2="170" y2="56"/>
<line class="st" x1="70" y1="77" x2="170" y2="77"/>
<rect class="fk" x="110" y="22" width="20" height="6" rx="2"/>
<rect class="fc" x="110" y="43" width="20" height="6" rx="2"/>
<rect class="fk" x="110" y="64" width="20" height="6" rx="2"/>
<rect class="fk" x="110" y="85" width="20" height="6" rx="2"/>
<path class="sc" d="M170 56L205 38M205 38L225 56"/>
```

Picture the Grand Library Archive's central cabinet: a hierarchical storage system where each drawer splits into two smaller partitions, which each split into two smaller compartments, and so on.

The Master Archivist hands you a single index card to retrieve among thousands of filed cards. Instead of inspecting drawers sequentially, you play a halving game:
1. Open the middle partition.
2. Inspect the boundary card to decide which half holds your target.
3. Discard the other half entirely without inspecting it.
4. Repeat on the remaining pile until exactly one folder remains.

Every round the search space cuts in half. You are counting **rounds**, not individual cards.

> log₂ n = how many times can you halve n before reaching 1?

```widget #halvetabs "Filing cabinet search: step through halving n folders down to 1"
<div class="extabs" role="group" aria-label="Folder count presets"></div><div class="lvhost"></div>
```

Halving k times leaves n / 2ᵏ items. That remaining count reaches 1 precisely when 2ᵏ = n, which means k = log₂ n; when n is not a power of 2 the number of halvings is ⌊log₂ n⌋. In binary search, the logarithm is not an abstract formula — it is the literal count of drawer-halving decisions.

```key
log₂ n is the literal count of halving steps needed to reduce n items down to 1: counting halvings measures algorithmic depth directly.
```

## Feel for the numbers {#cost toc="Feel for the numbers"}

```caption
Every factor of 1,000 adds about 10 halvings: memorizing 2¹⁰ ≈ 10³ unlocks quick mental estimation.
```

```vig "A logarithmic scale compressing powers of ten into evenly spaced step notches"
<line class="st" x1="25" y1="56" x2="215" y2="56"/>
<line class="st" x1="45" y1="46" x2="45" y2="66"/>
<line class="st" x1="85" y1="46" x2="85" y2="66"/>
<line class="st" x1="125" y1="46" x2="125" y2="66"/>
<line class="st" x1="165" y1="46" x2="165" y2="66"/>
<line class="st" x1="205" y1="46" x2="205" y2="66"/>
<circle class="fc" cx="45" cy="56" r="4"/>
<circle class="fc" cx="85" cy="56" r="4"/>
<circle class="fc" cx="125" cy="56" r="4"/>
<circle class="fc" cx="165" cy="56" r="4"/>
<circle class="fc" cx="205" cy="56" r="4"/>
```

Fluency in algorithmic analysis means estimating magnitudes without reaching for a calculator.

Because 2¹⁰ = 1,024 ≈ 1,000 = 10³, every thousand-fold increase in input size adds about 10 halvings:

```rosetta "Feel for the numbers: input magnitude versus halvings"
Input size n | Halvings to 1: ⌊log₂ n⌋ (exact log₂ n)
1,000 (10³) | 9 halvings (log₂ n = 9.97)
1,000,000 (10⁶) | 19 halvings (log₂ n = 19.93)
1,000,000,000 (10⁹) | 29 halvings (log₂ n = 29.90)
10¹² (one trillion) | 39 halvings (log₂ n = 39.86)
10¹⁸ (one quintillion) | 59 halvings (log₂ n = 59.79)
```

Memorize the benchmark **2¹⁰ ≈ 10³**: whenever n multiplies by 1,000, log₂ n increases by 10. A binary search over one trillion sorted items needs at most 40 probes (39 halvings, then a look at the last folder), which is why a search that sounds impossible takes only a few dozen steps.

## The logarithmic rules {#insight toc="The logarithmic rules"}

```caption
Logarithmic identities are definitions of exponents in reverse: count the splits.
```

```vig "A balancing scale comparing multiplied inputs on one side and added exponents on the other"
<line class="st" x1="120" y1="20" x2="120" y2="85"/>
<polygon class="fk" points="105,85 135,85 120,70"/>
<line class="st" x1="50" y1="35" x2="190" y2="35"/>
<circle class="fa" cx="50" cy="50" r="14"/>
<circle class="fc" cx="190" cy="50" r="14"/>
<line class="st" x1="50" y1="35" x2="50" y2="50"/>
<line class="st" x1="190" y1="35" x2="190" y2="50"/>
```

Every rule of logarithms restates an exponent law. In each case, think ==count the factors==:

> log₂(x · y) = log₂ x + log₂ y

**Product rule:** Multiplying inputs adds their split counts. If two drawers split x ways and y ways, searching their combined space requires adding the depths: log₂(8 · 4) = log₂ 32 = 5, which equals log₂ 8 + log₂ 4 = 3 + 2 = 5.

> log₂(xᵏ) = k · log₂ x

**Power rule:** Exponentiating by k multiplies the split count k times: log₂(2⁴) = 4 · log₂ 2 = 4 · 1 = 4.

> log_b x = log_c x / log_c b

**Change of base:** Changing bases scales the depth by a fixed ratio (1 / log_c b). For example, log₂ 8 = log₁₀ 8 / log₁₀ 2 = 0.90309 / 0.30103 = 3. Because the conversion factor is a constant, Big O notation omits the base entirely: O(log₂ n) and O(log₁₀ n) represent the identical complexity class.

> a^(log_b n) = n^(log_b a)

**Base swap:** Crucial for divide-and-conquer recurrences: taking log_b of both sides shows they match. With a = 4, b = 2, n = 8: 4^(log₂ 8) = 4³ = 64, and 8^(log₂ 4) = 8² = 64.

```key
Logarithms of different bases differ only by a constant multiplier: Big O notation absorbs constant factors, making all logarithmic bases members of the identical O(log n) class.
```

## Integer halving in code {#solution toc="Implementation"}

```caption
With float division the loop runs ⌈log₂ n⌉ times instead of ⌊log₂ n⌋: one extra pass whenever n is not a power of 2.
```

```vig "A code window highlighting the difference between integer division and float division"
<rect class="fa" x="25" y="20" width="190" height="72" rx="4"/>
<line class="st" x1="45" y1="38" x2="110" y2="38"/>
<line class="st" x1="45" y1="56" x2="150" y2="56"/>
<line class="st" x1="45" y1="74" x2="90" y2="74"/>
<circle class="fr" cx="175" cy="45" r="12"/>
<line class="st" x1="169" y1="39" x2="181" y2="51"/>
<line class="st" x1="181" y1="39" x2="169" y2="51"/>
```

In Python, the `//` operator performs floor truncation automatically. In JavaScript and TypeScript, the `/` operator performs floating-point division by default.

When counting halvings with `n / 2` in a `while n > 1` loop, non-powers-of-two leave fractional values above 1: halving 3 produces 1.5, which is still greater than 1, triggering an erroneous second iteration!

```warn
Never use unrounded float division n = n / 2 in halving loops: a non-power of 2 like 3 leaves 1.5 > 1, so the loop runs one extra pass.
```

```code mistake "Watch out: unfloored float division in halving loop"
```

The correct implementation uses integer floor truncation on each step:

```code solution "Integer halving loop (floor log2 n)"
```

## Where logs appear in this course {#next toc="Where logs appear"}

```caption
Logarithmic complexity governs search trees, divide-and-conquer recursion, and bit representations.
```

```vig "A binary tree branching downward with logarithmic depth levels"
<circle class="fa" cx="120" cy="22" r="8"/>
<circle class="fk" cx="70" cy="50" r="7"/>
<circle class="fk" cx="170" cy="50" r="7"/>
<circle class="fc" cx="45" cy="82" r="6"/>
<circle class="fc" cx="95" cy="82" r="6"/>
<circle class="fc" cx="145" cy="82" r="6"/>
<circle class="fc" cx="195" cy="82" r="6"/>
<line class="st" x1="114" y1="28" x2="76" y2="44"/>
<line class="st" x1="126" y1="28" x2="164" y2="44"/>
<line class="st" x1="65" y1="56" x2="50" y2="76"/>
<line class="st" x1="75" y1="56" x2="90" y2="76"/>
<line class="st" x1="165" y1="56" x2="150" y2="76"/>
<line class="st" x1="175" y1="56" x2="190" y2="76"/>
```

Logarithmic scaling patterns appear across four fundamental curriculum structures:

```variants
[
  {
    "title": "Binary Search",
    "source": "Searching module",
    "text": "Eliminating half the search candidate space on every comparison, finding an element in at most ⌊log₂ n⌋ + 1 probes."
  },
  {
    "title": "Balanced Tree Height",
    "source": "Binary Search Trees & Heaps",
    "text": "A complete binary tree with n nodes has height ⌊log₂ n⌋, bounding search, insertion, and deletion times to O(log n)."
  },
  {
    "title": "Divide-and-Conquer Levels",
    "source": "Sorting module (Merge Sort)",
    "text": "Halving arrays recursively creates ⌈log₂ n⌉ levels of splitting, each requiring O(n) merging work for O(n log n) total cost."
  }
]
```

## Check yourself {#quiz toc="Quiz"}

```caption
Test your understanding of logarithmic scaling, base invariance, and digit loops.
```

```quiz
{
  "questions": [
    {
      "question": "Without a calculator: roughly what is log₂(1,000,000,000,000)?",
      "options": [
        "About 12, one per decimal zero",
        "About 120, ten per decimal zero",
        "About 40, ten per ×1,000 step"
      ],
      "answer": 2,
      "explanation": "10¹² = (10³)⁴ ≈ (2¹⁰)⁴ = 2⁴⁰. Every ×1,000 adds about 10 to the log, and 10¹² is four such steps. (Exactly: log₂ 10¹² = 39.86.)"
    },
    {
      "question": "Why doesn't Big O notation ever specify a logarithm's base?",
      "options": [
        "Base 2 is the universal convention, so omitting it is shorthand for log₂",
        "Logs of different bases differ only by a constant factor, which O absorbs",
        "Changing the base never changes the value, so log₂ n and log₁₀ n are equal"
      ],
      "answer": 1,
      "explanation": "Change of base: log_b n = log_c n / log_c b. That divisor is a constant, invisible to O. The values differ; the growth class does not."
    },
    {
      "question": "A loop processes a number by repeatedly stripping its last decimal digit (`n //= 10` / `n = Math.floor(n/10)`). Its complexity in terms of the value n is…",
      "options": [
        "O(√n), because stripping digits resembles trial division's search up to √n",
        "O(n), because the loop runs once for every unit of n it has to remove",
        "O(log n), one pass per digit, and n has about log₁₀ n digits"
      ],
      "answer": 2,
      "explanation": "Dividing by 10 each step is the ×10 version of halving: the iteration count is how many times 10 divides n repeatedly, which is about log₁₀ n."
    }
  ]
}
```
