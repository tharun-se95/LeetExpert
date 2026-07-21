---
title: Linear-Time Sorts
type: concept
---

## Breaking the rules on purpose

The previous lesson proved that no algorithm sorting by **comparisons**
can beat Ω(n log n) in the worst case. That proof's power came entirely
from its assumption — "the only thing the algorithm can do is ask
`is A < B?`." Drop that assumption, and the proof simply doesn't apply.
This lesson's sorts don't compare elements to each other at all; they
exploit **structural knowledge about the values themselves** — and
that's precisely what lets them run in O(n).

## Counting sort: when values are small integers

If every value is a small integer in a known range `[0, k]`, you don't
need to compare anything — you can count directly:

````tabs
```python
def counting_sort(arr: list[int], k: int) -> list[int]:
    counts = [0] * (k + 1)
    for x in arr:
        counts[x] += 1                # tally each value — Module 6's Count verb
    result = []
    for value, count in enumerate(counts):
        result.extend([value] * count)   # emit each value 'count' times, in order
    return result
```

```typescript
function countingSort(arr: number[], k: number): number[] {
  const counts = new Array(k + 1).fill(0);
  for (const x of arr) {
    counts[x]++; // tally each value — Module 6's Count verb
  }
  const result: number[] = [];
  for (let value = 0; value <= k; value++) {
    for (let i = 0; i < counts[value]; i++) result.push(value); // emit in order
  }
  return result;
}
```
````

This is Hash Tables' Count pattern from Module 6, applied to sorting:
tally every value's frequency, then read the tallies out in order. No
comparison ever happens — the ORDER comes from iterating the counts
array 0, 1, 2, …, k, which is only possible because the values are
small integers you can use as array indices.

```complexity
{
  "time": "O(n + k)",
  "space": "O(n + k)",
  "why": "One pass to count (O(n)), one pass to emit (O(n) total elements + O(k) to walk the counts array). When k = O(n), this is O(n) — genuinely linear, beating the comparison-sort floor because it isn't a comparison sort."
}
```

The catch is exactly what makes it fast: **k must be small relative to
n**. Counting-sorting values up to 10⁹ would allocate a billion-entry
array to sort a handful of numbers — the technique needs a bounded,
usefully small range, not just "integers."

## Radix sort: sort digit by digit, when k is too large

When values are large integers but you still want to avoid
comparisons, sort by one digit at a time — least significant digit
first — using counting sort as the per-digit subroutine:

````tabs
```python
def radix_sort(arr: list[int]) -> list[int]:
    if not arr:
        return arr
    max_val = max(arr)
    exp = 1
    result = list(arr)
    while max_val // exp > 0:
        result = counting_sort_by_digit(result, exp)
        exp *= 10
    return result

def counting_sort_by_digit(arr: list[int], exp: int) -> list[int]:
    counts = [0] * 10
    for x in arr:
        counts[(x // exp) % 10] += 1
    for d in range(1, 10):
        counts[d] += counts[d - 1]        # prefix sum -> final positions
    result = [0] * len(arr)
    for x in reversed(arr):               # reversed: keeps it STABLE
        digit = (x // exp) % 10
        counts[digit] -= 1
        result[counts[digit]] = x
    return result
```

```typescript
function radixSort(arr: number[]): number[] {
  if (arr.length === 0) return arr;
  const maxVal = Math.max(...arr);
  let result = [...arr];
  for (let exp = 1; Math.floor(maxVal / exp) > 0; exp *= 10) {
    result = countingSortByDigit(result, exp);
  }
  return result;
}

function countingSortByDigit(arr: number[], exp: number): number[] {
  const counts = new Array(10).fill(0);
  for (const x of arr) counts[Math.floor(x / exp) % 10]++;
  for (let d = 1; d < 10; d++) counts[d] += counts[d - 1]; // prefix sum
  const result = new Array(arr.length).fill(0);
  for (let i = arr.length - 1; i >= 0; i--) {
    // reversed: keeps it STABLE
    const digit = Math.floor(arr[i] / exp) % 10;
    counts[digit]--;
    result[counts[digit]] = arr[i];
  }
  return result;
}
```
````

The per-digit pass is a **prefix-sum-positioned counting sort**
(Module 12's prefix sums, placing each element directly into its final
slot instead of just emitting counts in order) — and it must be
**stable**, because sorting by the next digit only produces a correct
overall order if ties from the previous digit stay in their
relative order. Walking the array in reverse while placing (rather than
forward) is what makes this particular implementation stable — trace
two equal last-digits through it once to see why order survives.

```complexity
{
  "time": "O(d · (n + b))",
  "space": "O(n + b)",
  "why": "d = number of digits in the largest value, b = base (10 here). Each of the d passes is an O(n + b) counting sort. When d is a constant (bounded-size integers), this is O(n) — again, only because it isn't comparing elements."
}
```

## Reading which sort a problem wants

| Signal | Reach for |
| --- | --- |
| general comparable objects, no structure to exploit | merge sort or quicksort (or the language's built-in sort — see below) |
| values are small integers (or map to one), frequency matters | counting sort |
| values are large integers/strings, sortable digit-by-digit | radix sort |
| need a real STABILITY guarantee | merge sort, or a stable counting/radix sort — never quicksort |
| need in-place, don't care about stability, want it fast in practice | quicksort |
| need a worst-case guarantee, not just average | merge sort or heapsort (Module 19) |

**In practice**, you will almost always call the language's built-in
sort — Python's Timsort and JS's engine sort are both highly-tuned
hybrids (insertion sort for small runs, merge-sort-like merging of
already-sorted runs, stable). Knowing the theory here isn't about
reimplementing sorts daily; it's about knowing which GUARANTEE you're
actually getting when you call `sorted()` or `.sort()` — stable,
O(n log n) worst case, not in-place — and recognizing the rare problems
(bounded small-integer keys, custom multi-key comparisons) where a
hand-written sort is the actually-correct engineering choice.

```quiz
{
  "questions": [
    {
      "question": "Counting sort runs in O(n + k). Why doesn't this contradict the Ω(n log n) lower bound proven in the previous lesson?",
      "options": [
        "It does contradict it — counting sort must have a hidden log factor",
        "The lower bound only applies to algorithms that sort by COMPARING elements. Counting sort never compares two array elements to each other — it uses each value directly as an array index, sidestepping the assumption the entire proof rests on",
        "The lower bound only applies to arrays larger than k"
      ],
      "answer": 1,
      "explanation": "This is the entire point of the lesson: the Ω(n log n) proof is airtight WITHIN its assumption and simply inapplicable outside it. Counting sort isn't a counterexample to the theorem — it's a different kind of algorithm the theorem never claimed to cover."
    },
    {
      "question": "Why must radix sort's per-digit counting pass be stable?",
      "options": [
        "Stability is a nice-to-have but not required for correctness",
        "Radix sort processes digits least-significant-first; if a pass reordered elements with EQUAL current digits, it would scramble the correct ordering already established by previous (less significant) digit passes — stability is what preserves that accumulated order",
        "Because counting sort is always stable regardless of implementation"
      ],
      "answer": 1,
      "explanation": "Correctness of the whole multi-pass algorithm depends on each individual pass being a stable sort — an unstable per-digit sort would silently produce wrong overall orderings on inputs with repeated digits, which is most inputs."
    },
    {
      "question": "A problem asks you to sort 10^5 integers, each in the range [0, 100]. What's the best-fit tool, and why?",
      "options": [
        "Quicksort, since it's generally fastest",
        "Counting sort: k = 100 is tiny relative to n = 10^5, so O(n + k) is essentially O(n) — strictly better than any comparison sort's O(n log n) floor, and simple to implement correctly",
        "Merge sort, for the stability guarantee"
      ],
      "answer": 1,
      "explanation": "This is exactly the signal from the reading table: small bounded integer range plus large n is counting sort's home turf. Reaching for a comparison sort here works but leaves real performance on the table for no benefit."
    }
  ]
}
```
