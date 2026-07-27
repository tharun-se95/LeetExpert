---
title: Product of Array Except Self
type: problem
---

## Problem

Given `nums`, return `answer` where `answer[i]` is the product of every
element **except** `nums[i]`. You must run in O(n) and **may not use
division**. (The output array doesn't count as auxiliary space in the
follow-up: achieve O(1) extra beyond it.)

**Examples**

```text
nums = [1,2,3,4]     →  [24,12,8,6]
nums = [-1,1,0,-3,3] →  [0,0,9,0,0]
```

**Constraints:** 2 ≤ n ≤ 10⁵ · products fit in 32 bits · **no division**.

## Attempt it first

First understand *why* no division: with division you'd multiply
everything and divide by nums[i] — but a single zero destroys it (0/0 on
the zero's own position), and two zeroes make every answer 0 in a way the
trick can't see. The ban isn't arbitrary; the division "solution" is
genuinely broken. Now find the real one.


```sandbox
{
  "id": "product-except-self",
  "fn": { "python": "product_except_self", "javascript": "productExceptSelf" },
  "check": "return",
  "starter": {
    "python": "def product_except_self(nums):\n    # Return a new array. No division.\n    pass\n",
    "javascript": "function productExceptSelf(nums) {\n  // Return a new array. No division.\n}\n"
  },
  "cases": [
    { "args": [[1,2,3,4]], "expect": [24,12,8,6] },
    { "args": [[-1,1,0,-3,3]], "expect": [0,0,9,0,0] },
    { "args": [[2,3]], "expect": [3,2] },
    { "args": [[1,1,1,1]], "expect": [1,1,1,1] }
  ]
}
```
````reveal Hint 1 — split the product at i
Everything-except-i = (product of all elements LEFT of i) × (product of
all elements RIGHT of i). Would knowing all the left-products and all the
right-products solve it?
````

````reveal Hint 2 — running products, like the running minimum
left[i] = nums[0]·…·nums[i−1] builds up in one forward sweep (left[0] = 1,
the empty product). right[i] builds in one backward sweep. That's O(n)
time with two helper arrays — get this version fully working first.
````

````reveal Hint 3 — for O(1) extra: reuse the output
Write the left-products directly into answer. Then sweep backward carrying
the right-product in a single scalar, multiplying into answer[i] as you
go. The scalar plays the role the whole right[] array played.
````

## Brute force, for contrast

For each i, multiply the other n−1 elements: O(n²) — 10¹⁰ at the limit.
The nested dependent loop again; the constraints again say no.

## The insight

> answer[i] = prefix_product(0..i−1) × suffix_product(i+1..n−1), and both
> factors are computable *incrementally*: each extends the previous by one
> multiplication. Sweep forward for prefixes, backward for suffixes, and
> let the output array double as storage for one of them.

This is the running-extreme trick from the stock problem upgraded to
running *products* — and it's the direct ancestor of prefix sums
(Module 12), where the same decomposition answers range queries.

## Solution

`````reveal Solution — two sweeps, output as storage
````tabs
```python
def product_except_self(nums: list[int]) -> list[int]:
    n = len(nums)
    answer = [1] * n

    for i in range(1, n):                    # forward: left products
        answer[i] = answer[i - 1] * nums[i - 1]

    right = 1                                # backward: carry suffix product
    for i in range(n - 1, -1, -1):
        answer[i] *= right
        right *= nums[i]
    return answer
```

```typescript
function productExceptSelf(nums: number[]): number[] {
  const n = nums.length;
  const answer = new Array<number>(n).fill(1);

  for (let i = 1; i < n; i++) {
    // forward: left products
    answer[i] = answer[i - 1] * nums[i - 1];
  }

  let right = 1; // backward: carry suffix product
  for (let i = n - 1; i >= 0; i--) {
    answer[i] *= right;
    right *= nums[i];
  }
  return answer;
}
```
````

Trace on `[1,2,3,4]`: after the forward pass answer = [1,1,2,6] (products
of everything left of each i). Backward: i=3 → answer[3]=6·1=6, right=4 ·
i=2 → answer[2]=2·4=8, right=12 · i=1 → answer[1]=1·12=12, right=24 ·
i=0 → answer[0]=1·24=24. Result [24,12,8,6]. ✓

Zeroes need no special case: a zero at position z makes every prefix past
z and every suffix before z zero, which is exactly the right answer —
the decomposition handles what division couldn't.

```complexity
{
  "time": "O(n)",
  "space": "O(1) auxiliary",
  "why": "Two sequential passes. Beyond the required output array, the only state is the scalar `right` — the backward sweep consumes suffix products the moment they're formed instead of storing them."
}
```
`````

## Variants

- **Range products/sums:** store *all* prefixes and answer arbitrary
  [l, r] queries in O(1) — that generalization is the Prefix Sum module.
- **With division allowed and guaranteed non-zero input:** total ÷ nums[i]
  works — recognizing when the cheap trick's preconditions hold is also a
  skill.

```quiz
{
  "questions": [
    {
      "question": "Why exactly does the division approach fail, motivating the ban?",
      "options": [
        "Division is slower than multiplication — CPUs take many more cycles to execute a division instruction than a multiplication, so the ban exists purely for performance, not correctness",
        "One zero in the input makes total = 0, and recovering answer[zero_position] requires 0/0; the prefix/suffix split never divides, so zeroes flow through correctly",
        "Floating-point precision — dividing the running total by nums[i] introduces rounding error that compounds across n divisions, producing answers that are close but not exactly correct"
      ],
      "answer": 1,
      "explanation": "The division trick needs to 'un-multiply' nums[i] out of the total — impossible when nums[i] is 0. The decomposition sidesteps it by never forming the full product at position i."
    },
    {
      "question": "The O(1)-extra-space version reuses the output for left products and a scalar for right products. Why can't BOTH be scalars?",
      "options": [
        "Each answer[i] needs left(i) and right(i) at the same moment, but a single sweep direction forms lefts and rights in opposite orders — one side must be materialized for all i before the combining pass",
        "JavaScript arrays can't be written backward — descending for-loops over array indices are disallowed by the language specification, forcing the right-product sweep to use a scalar instead",
        "They could, with more care — a single carefully-ordered scalar variable could track both the running left and right products simultaneously if updated in exactly the right sequence"
      ],
      "answer": 0,
      "explanation": "left(i) grows with i, right(i) shrinks with i. A forward sweep meets left values on time but right values too late (they need future elements). So one family is precomputed into storage — and the problem hands you a free array: the output."
    }
  ]
}
```
