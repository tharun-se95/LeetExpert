---
title: Modular Arithmetic
type: concept
---

## Remainders as a number system

`a mod m` is the remainder when a is divided by m. The productive mental
model is a **clock with m positions**: counting past m−1 wraps to 0. Every
integer lands on exactly one clock position, so "mod m" collapses the
infinite number line onto m values:

```diagram
{ "id": "mod-clock", "m": 5, "values": [8, -7] }
```

Both 8 and −7 land on the same position (3) on this 5-clock — different
numbers, same remainder. That's the whole idea in one picture. And,
crucially, arithmetic *survives the collapse*:

> (a + b) mod m = ((a mod m) + (b mod m)) mod m
> (a · b) mod m = ((a mod m) · (b mod m)) mod m

Why: write a = q₁m + r₁ and b = q₂m + r₂. Then a + b = (q₁+q₂)m + (r₁+r₂) —
everything except r₁+r₂ is a multiple of m and vanishes mod m. Same argument
for the product. **Consequence:** you may reduce mod m at every intermediate
step of a long sum or product and the final answer is unchanged. That's what
makes "return the answer modulo 10⁹+7" problems tractable — you never hold
the astronomically large true value, just its clock position.

## The negative-number trap (Python ≠ JavaScript)

The two course languages *disagree* about `%` on negatives:

````tabs
```python
print(-7 % 5)   # 3   — Python: result has the sign of the DIVISOR
print(7 % -5)   # -3
```

```typescript
console.log(-7 % 5); // -2  — JS: result has the sign of the DIVIDEND
console.log(7 % -5); // 2
```
````

Both are self-consistent conventions, but for clock arithmetic you almost
always want the mathematician's answer in [0, m): −7 on a 5-clock is
position **3** (walk back 7 from 0: 4, 3, 2, 1, 0, 4, 3). Python's `%`
already gives that. In JavaScript, use the standard fix:

````tabs
```python
def mod(a: int, m: int) -> int:
    return a % m          # already in [0, m) for m > 0
```

```typescript
function mod(a: number, m: number): number {
  return ((a % m) + m) % m; // shift into [0, m)
}
```
````

This bites in real code: circular-buffer indices, rotating an array left by
k, hash functions on negative values. If you take one thing from this
lesson: **never write bare `%` in JS/TS when the left side can be
negative.**

## Wrap-around indexing

The clock model is exactly what circular structures need:

````tabs
```python
# next/prev position in a ring buffer of size m
nxt = (i + 1) % m
prv = (i - 1) % m          # safe in Python

# rotate array right by k without a second array pass of thought:
# element at index i moves to (i + k) % n
```

```typescript
const nxt = (i + 1) % m;
const prv = mod(i - 1, m); // NOT (i - 1) % m — breaks at i = 0

// rotate right by k: index i -> (i + k) % n
```
````

The Queues module builds a ring-buffer deque on precisely this trick, and
`(i + k) % n` is the index map behind every rotation problem.

## Hashing previews

Two facts you'll use in the Hash Tables module:

- Reducing a huge key to a bucket is `key mod table_size` — the identities
  above are why you can compute a "rolling" hash of a string incrementally,
  reducing at every step, without overflow.
- **Python's ints are arbitrary-precision, JavaScript's are not.** JS
  numbers lose integer exactness past 2⁵³ (`Number.MAX_SAFE_INTEGER`), so
  mod-heavy accumulation in TS either reduces aggressively at each step or
  uses `BigInt`. Python lets you be lazy; TS does not.

```quiz
{
  "questions": [
    {
      "question": "A problem says 'return the count modulo 10⁹+7'. Your loop multiplies many numbers together. When must you apply the modulo?",
      "options": [
        "Once, at the very end",
        "At every multiplication — the identity (a·b) mod m = ((a mod m)(b mod m)) mod m guarantees the same answer",
        "Only when the product happens to exceed 10⁹+7"
      ],
      "answer": 1,
      "explanation": "Reducing at each step keeps values small and is provably equivalent. Reducing only at the end requires holding the true product — astronomically large, and in JS/TS numerically wrong long before that."
    },
    {
      "question": "In TypeScript, `(i - 1) % n` for a circular buffer is buggy. Why, and what's the fix?",
      "options": [
        "It's fine — JS % already wraps",
        "At i = 0 it yields -1 (JS keeps the dividend's sign); use ((i - 1) % n + n) % n",
        "It overflows for large i"
      ],
      "answer": 1,
      "explanation": "JS % takes the dividend's sign, so -1 % n = -1, an invalid index. Adding n and re-reducing shifts into [0, n). Python's % doesn't have this trap."
    },
    {
      "question": "What is -13 mod 5, as a clock position in [0, 5)?",
      "options": ["-3", "2", "3"],
      "answer": 1,
      "explanation": "-13 + 15 = 2, and 15 is a multiple of 5, so -13 and 2 share a clock position. (Python: -13 % 5 == 2. JS: -13 % 5 == -3, which needs the +m fix.)"
    }
  ]
}
```
