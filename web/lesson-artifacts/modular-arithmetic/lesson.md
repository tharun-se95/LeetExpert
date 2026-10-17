---
title: "Modular Arithmetic"
kicker: "Math for DSA • Foundations • concept lesson"
headline: "Arithmetic survives the clock: keep numbers bounded without losing precision."
lede: "Every integer collapses onto a single position on an m-clock. Because addition and multiplication commute with modular reduction, algorithms can reduce intermediate values at every step, so numbers stay below m (below m² during one multiplication) instead of growing without bound."
chips:
  - "arithmetic **survives the collapse**"
  - "Python floors, **JavaScript truncates**"
  - "never bare % on **negative indices**"
hero: |
  <div class="hero-stage"><div class="hero-art navy"><svg id="heroClock" viewBox="0 0 560 160" role="img" aria-label="A 5-slot rotating carousel where 8 and negative 7 land on the same slot."></svg>
  <div class="hero-read" id="heroRead"><div class="hero-num"><b id="heroNum"></b> <span id="heroUnit"></span></div><div id="heroCap"></div></div></div></div>
---

## The rotating book carousel {#problem toc="The rotating carousel"}

```caption
A circular carousel of 5 slots maps the infinite number line onto five positions.
```

```vig "A circular turntable carousel with five partitioned book slots and indicator tokens"
<circle class="fa" cx="120" cy="56" r="44"/>
<circle class="fk" cx="120" cy="56" r="30"/>
<line class="st" x1="120" y1="12" x2="120" y2="26"/>
<line class="st" x1="162" y1="43" x2="149" y2="47"/>
<line class="st" x1="146" y1="92" x2="135" y2="81"/>
<line class="st" x1="94" y1="92" x2="105" y2="81"/>
<line class="st" x1="78" y1="43" x2="91" y2="47"/>
<circle class="fc" cx="140" cy="36" r="6"/>
<polygon class="fp" points="144,30 152,38 136,38"/>
```

The Grand Library Archive keeps a rotating carousel by the intake desk — a circular tray with exactly 5 numbered slots, 0 through 4, used to stage the day's books. Spin it far enough in either direction and it loops through the same five slots forever.

Hand the Archivist a delivery numbered 8 and she does not search for a nonexistent slot 8. She spins the carousel 8 positions forward: 1 full turn of 5 plus 3 slots forward, landing squarely on slot 3. Hand her a return numbered −7 (a volume due 7 slots before intake opened) and it also lands on slot 3 after 2 full backward turns. Different integers, identical physical slot.

That is ==modular arithmetic== — the remainder when dividing by m. The mental model is a **clock with m positions**: counting past m−1 wraps around to 0. Every integer lands on exactly one slot:

> a = turns · m + cell

```widget #rgtabs "The rotating book carousel: four residue ring scenarios"
<div class="extabs" role="group" aria-label="Residue ring scenarios"></div><div class="lvhost"></div>
```

Crucially, arithmetic survives this collapse onto the ring:

> (a + b) mod m = ((a mod m) + (b mod m)) mod m

> (a · b) mod m = ((a mod m) · (b mod m)) mod m

To see why: write a = q₁m + r₁ and b = q₂m + r₂. The sum is (q₁ + q₂)m + (r₁ + r₂). Everything multiplied by m vanishes modulo m, leaving only (r₁ + r₂) mod m. For the product, expand (q₁m + r₁)(q₂m + r₂) = (q₁q₂m + q₁r₂ + q₂r₁)m + r₁r₂: again everything but r₁r₂ is a multiple of m.

```key
Intermediate reduction preserves the final remainder: in long sums or products, reducing modulo m at each step keeps values small and exact without changing the answer.
```

## The backward-spin trap {#trap toc="The backward-spin trap"}

```caption
Python and JavaScript disagree on % for negative numbers: Python floors, JavaScript truncates toward zero.
```

```vig "A branch splitting into positive and negative remainder paths with a warning flag"
<path class="st" d="M30 56H80M80 56L130 28M80 56L130 84"/>
<circle class="fa" cx="150" cy="28" r="14"/>
<circle class="fr" cx="150" cy="84" r="14"/>
<line class="st" x1="150" y1="20" x2="150" y2="36"/>
<line class="st" x1="142" y1="28" x2="158" y2="28"/>
<line class="st" x1="142" y1="84" x2="158" y2="84"/>
<path class="sc" d="M180 84H210"/>
```

Spin the carousel backward from slot 0 and physical intuition says you must land on the preceding slot, 4. Step back once more and you land on 3. But give this exact calculation to a JavaScript runtime and it reports that −7 % 5 equals **−2** — a negative position that does not exist on a 5-slot carousel!

The two course languages follow different integer division definitions:
- **Python** uses ==floor division==: `a % m` takes the sign of the divisor m. For positive m, Python remainders always fall in `[0, m)`.
- **JavaScript** uses ==truncating division== toward zero: `a % m` takes the sign of the dividend a. A negative dividend yields a negative remainder.

```warn
In JavaScript and TypeScript, never write bare % when the dividend can be negative: −7 % 5 yields −2, producing an out-of-bounds array access.
```

```code mistake "Watch out: bare % truncates toward zero on negative numbers"
```

To guarantee a valid slot in `[0, m)` in JavaScript or TypeScript, use the shifted remainder pattern:
`((a % m) + m) % m`
When `a % m` is negative (such as −2), adding 5 lifts it to +3. When `a % m` is already positive (such as 3), adding 5 yields 8, and the outer `% 5` restores 3.

## Circular indexing and wrap-around {#solution toc="Wrap-around indexing"}

```caption
Stepping past the end or before the beginning of a circular buffer requires floored wrap.
```

```vig "A segmented linear array wrapping around with a feedback loop back to index zero"
<rect class="fa" x="25" y="38" width="190" height="34" rx="4"/>
<line class="st" x1="63" y1="38" x2="63" y2="72"/>
<line class="st" x1="101" y1="38" x2="101" y2="72"/>
<line class="st" x1="139" y1="38" x2="139" y2="72"/>
<line class="st" x1="177" y1="38" x2="177" y2="72"/>
<path class="sc" d="M200 38C200 16 50 16 50 38"/>
<polygon class="fc" points="46,30 50,38 54,30"/>
```

The circular clock model is exactly what cyclic buffers and queue structures require: an index that steps past the final cell simply reappears at slot 0.

Stepping forward from index i across capacity m:
`nxt = (i + 1) % m`
At index 4 on a buffer of size 5, (4 + 1) % 5 evaluates to 0, returning to the head.

Stepping backward from index i:
`prv = (i - 1) % m` works in Python because (0 − 1) % 5 is 4.
In TypeScript, (0 − 1) % 5 evaluates to −1, and reading `buffer[-1]` returns `undefined`. The wrapped helper function `wrap(a, m)` guarantees valid indices in both runtimes.

```code solution "Safe floored modulo wrap for circular indexing"
```

The Queues module builds ring-buffer deques on this mechanism, and `(i + k) % n` powers cyclic array rotations.

## Hashing previews: keys to buckets {#cost toc="Hashing and scale"}

```caption
Hash tables map arbitrary integer keys into bucket indices, requiring safe reduction and BigInt precision.
```

```vig "Keys on the left connected by arrows into a column of bucket slots"
<rect class="fa" x="30" y="20" width="45" height="18" rx="3"/>
<rect class="fa" x="30" y="48" width="45" height="18" rx="3"/>
<rect class="fa" x="30" y="76" width="45" height="18" rx="3"/>
<rect class="fk" x="165" y="16" width="50" height="80" rx="4"/>
<line class="st" x1="165" y1="36" x2="215" y2="36"/>
<line class="st" x1="165" y1="56" x2="215" y2="56"/>
<line class="st" x1="165" y1="76" x2="215" y2="76"/>
<path class="sc" d="M75 29L165 46M75 57L165 46M75 85L165 86"/>
```

In hash tables, every incoming key maps to an internal array bucket through `key mod table_size`:
- **Collisions**: When two distinct keys share a remainder (such as keys 15 and 22 modulo 7 both yielding bucket 1), they collide and must share a chain or probing sequence.
- **Negative keys**: Hashes of negative values produce negative indices under JavaScript's bare `%`, corrupting table lookup unless normalized into `[0, table_size)`.
- **Large integer bounds**: Python integers maintain arbitrary precision automatically. JavaScript numbers are IEEE 754 double-precision floats, and past `Number.MAX_SAFE_INTEGER` (2⁵³ − 1) not every integer exists: 2⁵³ + 1 evaluates to 2⁵³. Reducing at every step keeps a product below m², which stays exact only while m² fits under 2⁵³. For m = 10⁹ + 7 the product of two residues passes 2⁵³, so JavaScript needs `BigInt` even when it reduces at every step.

```key
Past Number.MAX_SAFE_INTEGER (2⁵³ − 1) a JavaScript number cannot hold every integer: reduce modulo m at each step, and use BigInt whenever m² can exceed 2⁵³.
```

## Where next {#next toc="Where next"}

```caption
Modular arithmetic underpins ring buffers, rolling hashes, and divisibility algorithms.
```

```vig "Three interconnected modules branching from modular arithmetic foundations"
<rect class="fa" x="20" y="40" width="55" height="32" rx="4"/>
<rect class="fa" x="100" y="20" width="55" height="32" rx="4"/>
<rect class="fa" x="100" y="60" width="55" height="32" rx="4"/>
<rect class="fa" x="175" y="40" width="55" height="32" rx="4"/>
<path class="st" d="M75 56H100M155 36L175 48M155 76L175 64"/>
```

Modular reduction appears throughout advanced algorithms:

```variants
[
  {
    "title": "Ring-Buffer Deque",
    "source": "Queues module",
    "text": "A fixed-size array where head and tail advance and retreat using circular modulo arithmetic without shifting elements."
  },
  {
    "title": "Rabin-Karp Rolling Hash",
    "source": "String Search module",
    "text": "Sliding a pattern window across text in O(1) time per character: remove the old byte's contribution, shift by the base, add the new byte, and reduce mod m."
  },
  {
    "title": "Euclid\u0027s Algorithm",
    "source": "Divisibility & GCD",
    "text": "Finding greatest common divisors in logarithmic steps by repeated modulo reduction: gcd(a, b) = gcd(b, a mod b)."
  }
]
```

## Check yourself {#quiz toc="Quiz"}

```caption
Test your understanding of clock residues, language differences, and modulo reduction.
```

```quiz
{
  "questions": [
    {
      "question": "A problem says 'return the count modulo 10⁹+7'. Your loop multiplies many numbers together. When must you apply the modulo?",
      "options": [
        "After every multiplication, since each factor's remainder fixes the product's",
        "Once at the very end, because reducing earlier would change which number is finally reduced",
        "Only on the step where the product is about to overflow, since earlier reductions waste work"
      ],
      "answer": 0,
      "explanation": "(a·b) mod m = ((a mod m)(b mod m)) mod m, so reducing at each step is provably equivalent and keeps values small. Reducing only at the end needs the full product, which is astronomically large, and in JS/TS inexact long before that."
    },
    {
      "question": "In TypeScript, `(i - 1) % n` for a circular buffer is buggy. Why, and what's the fix?",
      "options": [
        "At i = 0 it gives -1 (JS % keeps the dividend's sign); use ((i - 1) % n + n) % n",
        "It breaks only for huge i, once i - 1 passes 2⁵³ and the subtraction stops being exact",
        "It is fine: JS % wraps negative results into [0, n) the same way Python's % does"
      ],
      "answer": 0,
      "explanation": "JS % takes the dividend's sign, so -1 % n = -1, an invalid index. Adding n and re-reducing shifts into [0, n). Python's % does not have this trap."
    },
    {
      "question": "What is -13 mod 5, as a clock position in [0, 5)?",
      "options": [
        "-3, the remainder JavaScript prints",
        "3, the remainder of 13 with the sign dropped",
        "2, the position 15 − 13 = 2 on the clock"
      ],
      "answer": 2,
      "explanation": "-13 + 15 = 2, and 15 is a multiple of 5, so -13 and 2 share a clock position. (Python: -13 % 5 == 2. JS: -13 % 5 == -3, which needs the +m fix.)"
    }
  ]
}
```
