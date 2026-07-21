---
title: Largest Number
type: problem
---

## Problem

Given a list of non-negative integers, arrange them (as strings) to
form the **largest possible number**, returned as a string.

**Examples**

```text
[10, 2]       →  "210"
[3, 30, 34, 5, 9]  →  "9534330"
[0, 0]        →  "0"    (no leading zeros in the result)
```

**Constraints:** 1 ≤ n ≤ 10⁴ · values in [0, 10⁹].

## Attempt it first

The whole problem is designing the right **comparator** — sorting
isn't in numeric or lexicographic order, but by a custom rule that
answers "which arrangement of THESE TWO pieces is bigger?" Find the
comparator before opening the hint; the sort itself is one line once
you have it.

````reveal Hint — compare by CONCATENATION, not by value
For two numbers (as strings) a and b, which should come first? Compare
a+b against b+a as strings (or numbers) — whichever concatenation is
LARGER tells you the correct order for a and b. Sort the whole list by
this comparator.
````

## Brute force, for contrast

Try all n! orderings, keep the largest: catastrophic even for small n
(Module 3's combinatorics — n! blows up past n≈11). The comparator
approach sorts in O(n log n) by defining the right notion of "greater
than" for this specific problem, rather than searching all
arrangements.

## The insight

> "Largest number" isn't asking for numeric or alphabetical order —
> it's asking for the order that makes the CONCATENATED result biggest.
> `a+b vs b+a` is exactly that question, asked pairwise: it defines a
> **total order** — for any two pieces, one comparison says which goes
> first — and sorting by a well-defined comparator is still just
> sorting, at O(n log n), no matter how unusual the comparator's rule
> looks.

## Solution

`````reveal Solution — sort by concatenation comparator
````tabs
```python
from functools import cmp_to_key

def largest_number(nums: list[int]) -> str:
    strs = [str(n) for n in nums]

    def compare(a: str, b: str) -> int:
        if a + b > b + a:
            return -1          # a should come FIRST (sorts "smaller")
        elif a + b < b + a:
            return 1
        return 0

    strs.sort(key=cmp_to_key(compare))
    result = "".join(strs)
    return "0" if result[0] == "0" else result   # all-zero input: avoid "000"
```

```typescript
function largestNumber(nums: number[]): string {
  const strs = nums.map(String);
  strs.sort((a, b) => (a + b > b + a ? -1 : a + b < b + a ? 1 : 0));
  const result = strs.join("");
  return result[0] === "0" ? "0" : result; // all-zero input: avoid "000"
}
```
````

The final guard handles `[0, 0]`: every comparison is a tie (any
arrangement of zeros concatenates the same), so the sort produces
`"00"` — correct in SHAPE but not in the expected single-`"0"` form the
problem wants. Checking the first character catches this in one line
rather than needing a special case earlier.

```complexity
{
  "time": "O(n log n · L)",
  "space": "O(n · L)",
  "why": "n log n comparisons (standard sort), each comparison doing string concatenation and comparison costing O(L) where L is the typical string length — the comparator's cost multiplies into the sort's, same as any custom-comparator sort."
}
```
`````

## Why the comparator defines a valid total order (worth trusting, not just using)

A sort is only correct if its comparator is **consistent** — transitive,
in particular: if A should come before B, and B before C, then A must
come before C, or the sort's internal assumptions break silently. For
`a+b vs b+a`, transitivity follows from comparing the DIGIT VALUES the
concatenation represents at each position — a real but genuinely fiddly
proof to write out fully; the practical takeaway is that this specific
comparator is a well-known, verified-correct one, and the pattern
("compare by how two things combine, not by their standalone value")
is reusable far beyond this problem.

## Variants

- **Smallest number arrangement** (no leading-zero constraint aside):
  flip the comparator's direction.
- **Custom sort with tie-breaking rules** generally (e.g. sort tasks by
  priority, then by arrival time): the `cmp_to_key` / custom-comparator
  pattern is the general tool — this problem is the sharpest example of
  "the comparator isn't obvious from the values alone."

```quiz
{
  "question": "Why does comparing `a + b` against `b + a` correctly decide which of two number-strings should come first, rather than just comparing a and b directly (numerically or lexicographically)?",
  "options": [
    "It doesn't reliably work — this is a common but flawed approach",
    "Neither numeric nor lexicographic order captures what actually matters here: which ORDER, when concatenated, produces a larger combined string. Directly forming both possible concatenations and comparing them answers exactly that question, for exactly this pair, regardless of digit count differences",
    "Because all the input numbers have the same number of digits"
  ],
  "answer": 1,
  "explanation": "Neither plain numeric comparison (30 < 34 numerically, but '304' < '340'... check: is '34' then '3' -> '343' vs '3' then '34' -> '334' — 343>334, so 34 before 3) nor string comparison ('3' < '30' lexicographically, but that's irrelevant to the concatenation question) answers the actual question being asked. The concatenation test is a comparator custom-built for exactly this problem's actual ordering criterion."
}
```
