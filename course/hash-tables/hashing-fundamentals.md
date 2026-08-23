---
title: Hashing Fundamentals
type: concept
---

## The problem hashing solves

Picture a neighborhood lost-and-found closet — thousands of unlabeled
items thrown into one big pile. Someone walks in and asks, "have you seen
my red umbrella?" There's only one way to answer: pick up every item and
look at it, one at a time, until you either find the umbrella or run out
of pile. The bigger the closet gets, the longer every single question
takes to answer.

That closet is exactly what Stage 1 has been building so far. Answering
**"have I seen this value?"** costs a scan every time. Arrays locate by
*position* in O(1), but by *value* only in O(n) — you have to check items
one by one, same as the closet. The pair-sum problem from the very first
Big O lesson went from O(n²) to O(n) on the strength of one line — `if x
in seen` — and this module finally explains why that line works.

The wish: a structure where insert, lookup, and delete **by value** are
all O(1) — you ask "have you seen X?" and get an answer without checking
a single other item. The obstacle: values come from enormous universes
(all strings, all 64-bit ints), while memory is finite. You can't build a
closet with a labeled shelf reserved for every possible umbrella that
might ever exist.

## The idea: hire a clerk who never has to search

Here's the fix: instead of one giant unsorted pile, imagine hiring a
mailroom clerk to manage a cabinet of numbered slots. The clerk has one
job and one rule: they never keep a master list, and they never search.
Instead, when you hand them a package labeled "dog," they glance at the
name, run a quick, fixed mental trick on the letters, and immediately
call out a slot number — say, Slot 6. You walk straight there and drop it
off. Later, when you come back asking for "dog," the clerk runs the exact
same trick on the exact same word, gets the exact same number, and points
you straight at Slot 6 again. No searching, ever, in either direction.

That mental trick is a **hash function**: a rule h that maps any key to a
number. Take that number mod the size of the cabinet, and you have a
slot:

> slot = h(key) mod m    (m = number of buckets)

```diagram
{
  "id": "hash-pipeline",
  "keyLabel": "\"dog\"",
  "hashValue": 4182,
  "capacity": 8
}
```

Every operation starts the same way: hash the key, jump to the slot. No
scan; the key itself tells you where to look — that's the entire
mechanism. The rest of the module is about the two places a real clerk's
trick can go wrong:

1. what makes the trick *good* (this lesson), and
2. what to do when two different keys get called out to the same slot
   (next lesson).

## What makes a hash function good

For the clerk's trick to actually work, it has to satisfy three rules —
and each one maps to a way a careless trick would break the mailroom:

- **Deterministic.** Run the trick on "dog" today, get Slot 6. Run it on
  "dog" tomorrow, you must get Slot 6 again — otherwise you file a
  package in one slot and go searching in another. This is exactly why
  keys must be **immutable** (the promise strings made in Module 5): if a
  package's label could change while it sat in the cabinet, the clerk's
  trick would point to the wrong slot the next time, and the package
  would effectively vanish.
- **Fast.** The trick has to be a glance, not a 20-minute crossword
  puzzle — O(size of key), not O(anything else) — because it runs on
  every single operation, all day, every day.
- **Uniform.** The trick needs to spread packages evenly across all the
  slots. A lazy trick that sends everything to Slot 0 turns the whole
  cabinet into one overstuffed pile — you're back to the closet you were
  trying to escape.

Here's a subtlety that trips up a naive trick: if the clerk's rule were
simply "count the letters," then "abc," "cab," and "bca" — three letters
each — would all pile into the same slot, even though they're different
words. Real hash functions avoid this with the **polynomial hash**: treat
each character as a digit of a number in some base p, weighting each
position differently, reduced modulo a large value as you go (Module 3's
identities make the running reduction legal):

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

Why base-31-style mixing beats simply summing character codes: summing is
order-blind — "abc", "cab", "bca" all collide by construction, exactly
like the naive letter-counting trick above. The polynomial weights each
position differently, so anagrams (usually) part ways. Uniformity is
exactly this: no *structural* family of keys should pile into one slot.

## Double-bookings are a guarantee, not a bug

Here's the part that surprises people: even with the most brilliant
clerk running the most perfectly uniform trick, you only have a fixed
number of slots and an enormous universe of possible names. Sooner or
later, two different people's names are going to land in the same slot —
and it happens far sooner than intuition suggests. Picture a mailroom
with 365 slots, one for every day of the year, and a trick that sends
each person to the slot matching their birthday. You might assume you
wouldn't see two people share a slot until the room is half full. In
reality, once just 23 people have come through, there's already better
than a coin-flip chance that two of them share a birthday slot — the
classic birthday paradox. A million-slot table sees its first
double-booking around a thousand inserts, not half a million.

So a collision isn't the clerk making a mistake, and it isn't a flaw in
the trick — it's simple arithmetic about slots and people. Collisions
aren't a defect to eliminate; they're a certainty to **manage**. The next
lesson covers the clerk's first fix for a double-booking, and the one
number that governs how bad things get if too many packages pile into
the same cabinet — the load factor. A second, hookless fix follows a few
lessons later.

```quiz
{
  "questions": [
    {
      "question": "Why must dictionary keys be immutable?",
      "options": [
        "Immutable objects hash faster — since the runtime can cache a hash value permanently once computed without worrying about staleness, avoiding a recomputation cost every time the key is used again",
        "It prevents memory leaks — allowing a key to be mutated after insertion would let outside code hold a persistent reference to internal table state, preventing garbage collection from ever reclaiming it",
        "The table files a key by hash-derived slot at insert time; mutating the key would change its hash, so lookups would compute a different slot and miss it — the entry becomes unreachable"
      ],
      "answer": 2,
      "explanation": "Determinism must hold ACROSS TIME: the slot computed at insert and at lookup must agree. Mutation breaks the agreement silently — the entry is still there, but nobody can compute its address."
    },
    {
      "question": "Why is summing character codes a poor string hash?",
      "options": [
        "The sums grow too large — summing character codes for long strings can overflow the integer type used to store the running total, corrupting the hash value before it's even reduced",
        "Addition is slow — repeatedly adding character codes one at a time in a loop is a slower CPU operation than the multiply-and-add step a polynomial hash uses, which is the real performance gap",
        "It's order-blind: every anagram of a string produces the identical hash, so a structural family of keys is GUARANTEED to collide — the opposite of uniformity"
      ],
      "answer": 2,
      "explanation": "Uniformity fails worst when collisions are systematic, not random. Position-weighted (polynomial) mixing makes rearranged keys diverge."
    },
    {
      "question": "A table has 1,000,000 slots. Roughly when should you expect the FIRST collision under uniform random hashing?",
      "options": [
        "Around 500,000 inserts — collisions should become likely once roughly half the table's capacity is filled, since that's the point at which more than half the available slots are already occupied",
        "Around 1,000 inserts — the birthday paradox: collisions appear near √m",
        "Only after 1,000,000 inserts — with uniform hashing spreading keys evenly, no two keys are expected to collide until literally every slot has already been claimed"
      ],
      "answer": 1,
      "explanation": "Pairwise collision chances accumulate quadratically: k keys create ~k²/2 pairs, each colliding with probability 1/m — crossing 50% near k ≈ √(2m ln 2) ≈ 1.2√m. Collisions are early, normal, and must be designed for."
    }
  ]
}
```
