---
title: Hashing Fundamentals
type: concept
---

## The problem hashing solves

Everything in Stage 1 so far shares a weakness: answering **"have I seen
this value?"** costs a scan. Arrays locate by *position* in O(1), but by
*value* only in O(n). The pair-sum problem from the very first Big O
lesson went from O(n²) to O(n) on the strength of one line — `if x in
seen` — and this module finally pays for that line.

The wish: a structure where insert, lookup, and delete **by value** are
all O(1). The obstacle: values come from enormous universes (all strings,
all 64-bit ints), while memory is finite. You can't have a slot for every
possible value.

## The idea: compute the address

Arrays already do O(1) location when you *know the index*. So —
manufacture the index. A **hash function** h maps any key to a number;
take it mod the table size and you have a slot:

> slot = h(key) mod m    (m = number of buckets)

Every operation starts the same way: hash the key, jump to the slot. No
scan; the key itself tells you where to look. That's the entire mechanism
— the rest of the module is about the two places it leaks:

1. what makes h(key) *good* (this lesson), and
2. what to do when two keys land in the same slot (next lesson).

## What makes a hash function good

A hash function for a table must be:

- **Deterministic.** Same key ⇒ same hash, always — otherwise you file a
  key in one slot and search another. This is why keys must be
  **immutable** (the promise strings made in Module 5): a key that
  changes after filing has silently changed its slot.
- **Fast.** O(size of key), not O(anything else) — it runs on every
  operation.
- **Uniform.** Keys should spread evenly across slots. A hash that maps
  everything to slot 0 turns the table into one long scan.

For strings, the standard construction is the **polynomial hash** — treat
characters as digits of a number in some base p, reduced modulo a large
value as you go (Module 3's identities make the running reduction legal):

> h("abc") = (a·p² + b·p + c) mod M

````tabs
```python
def poly_hash(s: str, p: int = 31, M: int = 10**9 + 7) -> int:
    h = 0
    for ch in s:
        h = (h * p + ord(ch)) % M    # reduce every step — Module 3
    return h
```

```typescript
function polyHash(s: string, p = 31, M = 1_000_000_007): number {
  let h = 0;
  for (const ch of s) {
    // Number stays exact: h < 1e9, h*31 + code < 2^53
    h = (h * p + ch.charCodeAt(0)) % M;
  }
  return h;
}
```
````

Why base-31-style mixing beats, say, summing character codes: summing is
order-blind — "abc", "cab", "bca" all collide by construction. The
polynomial weights each position differently, so anagrams (usually) part
ways. Uniformity is exactly this: no *structural* family of keys should
pile into one slot.

## Collisions are mathematically unavoidable

However good h is, the universe of keys dwarfs m slots, so **some keys
must share** (pigeonhole principle). Even probabilistically, sharing
happens far sooner than intuition says — with uniform hashing into m
slots, expect a collision once you've inserted about **√m keys** (the
birthday paradox: 23 people suffice for a shared birthday among 365
days). A million-slot table sees its first collision around a thousand
inserts, not half a million.

So collisions aren't a defect to eliminate; they're a certainty to
**manage**. The next lesson covers the two management strategies and the
quantity that governs how bad things get — the load factor.

```quiz
{
  "questions": [
    {
      "question": "Why must dictionary keys be immutable?",
      "options": [
        "Immutable objects hash faster",
        "The table files a key by hash-derived slot at insert time; mutating the key would change its hash, so lookups would compute a different slot and miss it — the entry becomes unreachable",
        "It prevents memory leaks"
      ],
      "answer": 1,
      "explanation": "Determinism must hold ACROSS TIME: the slot computed at insert and at lookup must agree. Mutation breaks the agreement silently — the entry is still there, but nobody can compute its address."
    },
    {
      "question": "Why is summing character codes a poor string hash?",
      "options": [
        "Addition is slow",
        "It's order-blind: every anagram of a string produces the identical hash, so a structural family of keys is GUARANTEED to collide — the opposite of uniformity",
        "The sums grow too large"
      ],
      "answer": 1,
      "explanation": "Uniformity fails worst when collisions are systematic, not random. Position-weighted (polynomial) mixing makes rearranged keys diverge."
    },
    {
      "question": "A table has 1,000,000 slots. Roughly when should you expect the FIRST collision under uniform random hashing?",
      "options": [
        "Around 500,000 inserts",
        "Around 1,000 inserts — the birthday paradox: collisions appear near √m",
        "Only after 1,000,000 inserts"
      ],
      "answer": 1,
      "explanation": "Pairwise collision chances accumulate quadratically: k keys create ~k²/2 pairs, each colliding with probability 1/m — crossing 50% near k ≈ √(2m ln 2) ≈ 1.2√m. Collisions are early, normal, and must be designed for."
    }
  ]
}
```
