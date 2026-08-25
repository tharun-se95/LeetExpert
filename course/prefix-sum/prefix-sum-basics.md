---
title: Prefix Sums
type: concept
---

## The question this module answers

Sliding window's incremental slide handled "process every window once,
each in O(1) amortized." A different, equally common need: **many range
queries against a FIXED array** — "sum of indices 3 to 7," then "sum of
indices 0 to 4," then "sum of 6 to 9," in any order, possibly thousands
of times. The array itself never changes between queries. Sliding
window doesn't fit (there's no single sweep — queries jump around
arbitrarily); recomputing each range's sum from scratch is O(range
length) per query, O(n) per query in the worst case, O(n·q) for q
queries.

## Precompute once, answer instantly

Think of a car's odometer: it never tells you "how far did the last
trip take," only "total distance since the car was new." To find any
trip's distance, you subtract the odometer reading at its start from
the reading at its end — the car never re-drives the trip to measure
it. A prefix-sum array is exactly that odometer, kept for a fixed list
of numbers instead of a fixed road: one running total, recorded at
every position, so that the "distance" between any two positions is a
single subtraction away.

The trick: build one auxiliary array — the **prefix sum** — where
`prefix[i]` holds the sum of everything from the start up through index
i−1 (equivalently, `prefix[i] = nums[0] + nums[1] + ... + nums[i-1]`,
with `prefix[0] = 0`, the empty sum):

```text
nums:    [2, 4, 1, 5, 3]
prefix:  [0, 2, 6, 7, 12, 15]
          ^  ^  ^  ^  ^   ^
        empty [2] [2,4] [2,4,1] ... everything
```

`prefix[i]` is one array position larger than `nums` (n+1 entries for n
elements) precisely so that `prefix[0] = 0` represents "sum of nothing"
without a special case. Building it is one linear pass:

````tabs
```python
def build_prefix(nums: list[int]) -> list[int]:
    prefix = [0] * (len(nums) + 1)
    for i, x in enumerate(nums):
        prefix[i + 1] = prefix[i] + x
    return prefix
```

```typescript
function buildPrefix(nums: number[]): number[] {
  const prefix = new Array(nums.length + 1).fill(0);
  for (let i = 0; i < nums.length; i++) {
    prefix[i + 1] = prefix[i] + nums[i];
  }
  return prefix;
}
```
````

## Answering a range sum in O(1)

The sum of `nums[l..r]` (inclusive) is `prefix[r+1] - prefix[l]` — the
running total up through r, minus the running total up through
everything before l. Every query becomes one subtraction:

```text
sum(nums[1..3]) = prefix[4] - prefix[1] = 12 - 2 = 10
check: nums[1]+nums[2]+nums[3] = 4+1+5 = 10  ✓
```

Why `prefix[l]`, not `prefix[l-1]`: `prefix[l]` already means "sum of
indices 0 through l−1" by definition, which is exactly the part you
want to subtract away. Off-by-one errors here are the single most
common prefix-sum bug — always re-derive the formula from the
definition (`prefix[i]` = sum of the first i elements, indices 0..i−1)
rather than memorizing "subtract something."

Watch the prefix array build once, then answer two different ranges
against it without ever re-scanning `nums`:

```viz
{ "id": "prefix-sum", "data": [2, 4, 1, 5, 3], "queries": [{ "l": 1, "r": 3 }, { "l": 2, "r": 4 }] }
```

```complexity
{
  "operations": [
    { "name": "build the prefix array", "time": "O(n)", "why": "one linear pass, one addition per element" },
    { "name": "range sum query, any [l, r]", "time": "O(1)", "why": "one array lookup difference — no matter how wide the range" },
    { "name": "space", "time": "O(n)", "why": "one extra array of size n+1 — the price for O(1) queries" }
  ]
}
```

## The trade this module keeps making

This is a **preprocessing trade**: pay O(n) once, up front, to buy O(1)
per query forever after. It's the same shape as the dynamic array's
amortized doubling (pay occasionally, benefit constantly) but inverted —
there, the expensive step was unpredictable and spread across
operations; here, it's a single deliberate investment before any
queries arrive. The trade only pays off when **queries repeat against a
fixed array** — if the array changes between queries (a value gets
updated), the whole prefix array is stale and would need an O(n) rebuild,
erasing the advantage. (Structures that support O(log n) updates *and*
O(log n) range queries — Fenwick trees, segment trees — exist for that
case, and are beyond this module's scope.)

## Why this generalizes past sums

Prefix sums are one instance of a broader idea: **any associative,
invertible aggregate can be prefixed**. Running product works
identically (divide instead of subtract, watching for zeros); running
XOR works (XOR is its own inverse: `range_xor(l,r) = prefix[r+1] ^
prefix[l]`). What breaks the pattern is a non-invertible aggregate —
running MAX can't be "subtracted out," which is exactly why Sliding
Window Maximum (Module 9) needed a monotonic deque instead of a simple
prefix array. You've now met this fork three times: sum/count/XOR are
prefix-friendly; max/min are not, and need a different structure
entirely.

```quiz
{
  "questions": [
    {
      "question": "Why is prefix[i] defined as the sum of the FIRST i elements (indices 0..i-1), with prefix[0] = 0, rather than prefix[i] = sum through index i?",
      "options": [
        "This shift makes range queries a single clean subtraction (prefix[r+1] - prefix[l]) with no special case for l = 0, since prefix[0] = 0 correctly represents 'nothing summed yet' — the empty range",
        "Both conventions work equally well — defining prefix[i] as the sum through index i instead would require the exact same subtraction formula and produce identical query behavior, just with different index labels",
        "It uses less memory — the shifted convention needs one fewer stored value than summing through index i would, which is the actual reason prefix[0] = 0 was chosen over the alternative"
      ],
      "answer": 0,
      "explanation": "The off-by-one convention is chosen specifically so l=0 needs no special-casing: prefix[0]=0 makes 'sum of nothing before index 0' true by definition, not by a guard clause."
    },
    {
      "question": "A prefix-sum array is built once; then the underlying array gets one value updated. What's the cheapest correct way to answer the next range query?",
      "options": [
        "Only rebuild prefix[i] for the single updated index — since each prefix entry is defined independently from the raw array rather than accumulated from its neighbor, fixing just that one position restores full correctness",
        "Rebuild the ENTIRE prefix array in O(n), since every prefix[i] at or past the updated index is now stale — or use a different structure (Fenwick/segment tree) if updates are frequent",
        "The existing prefix array still works — updates don't affect it, since prefix sums are a read-only summary computed once at build time and are mathematically independent of subsequent changes to the source array"
      ],
      "answer": 1,
      "explanation": "prefix[i] accumulates EVERYTHING before it, so one changed value invalidates every prefix entry from that point onward. This is precisely why plain prefix sums suit read-heavy, write-never scenarios — frequent updates call for a different data structure entirely."
    },
    {
      "question": "Why can't 'prefix maximum' answer a range-maximum query the same way prefix sum answers range-sum?",
      "options": [
        "Maximum is more expensive to compute than sum — comparing values to find the largest one takes more CPU cycles per element than adding them together, which is the real obstacle standing in the way of a prefix-maximum trick",
        "Sum is invertible (subtraction undoes addition), so removing a prefix's contribution is exact; maximum has no inverse operation — knowing prefix_max[r] and prefix_max[l] tells you nothing about whether the range's actual max lies inside [l, r] or was contributed entirely before l",
        "Prefix arrays only work for numeric data — the subtraction step at query time is only mathematically defined for numbers, so extending the technique to a non-numeric aggregate is structurally impossible"
      ],
      "answer": 1,
      "explanation": "The subtraction trick specifically needs an operation with an inverse. Sum, product, and XOR have one; max and min don't — which is the same fork Sliding Window Maximum ran into, now named explicitly as a property (invertibility) rather than a one-off exception."
    }
  ]
}
```
