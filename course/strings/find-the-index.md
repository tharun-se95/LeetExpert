---
title: Find the Index (strStr)
type: problem
---

## Problem

Given `haystack` and `needle`, return the index of the **first**
occurrence of `needle` in `haystack`, or −1. (This is what `s.find` /
`indexOf` does — you're building it.)

**Examples**

```text
haystack = "sadbutsad",  needle = "sad"    →  0
haystack = "leetcode",   needle = "leeto"  →  -1
haystack = "mississippi", needle = "issip" →  4

Verify the third by hand (index tracing is the skill here):
m(0) i(1) s(2) s(3) i(4) s(5) s(6) i(7) p(8) p(9) i(10)
at 4: i s s i p  ✓
```

**Constraints:** 1 ≤ lengths ≤ 10⁴ · lowercase letters.

## Attempt it first

Write the naive version cleanly — every alignment, checked honestly. Then
find the worst case that makes it slow, because knowing *when* naive fails
is this lesson's actual content.

````reveal Hint 1 — alignments
needle can start at haystack positions 0 … n − m (n, m = lengths). Each
candidate start is an "alignment"; verify one with a character loop or a
slice/startswith. How many alignments, and what does each cost?
````

````reveal Hint 2 — the adversarial input
haystack = "aaaa…ab" (all a's), needle = "aaab". Every alignment matches
m − 1 characters before failing on the last. Count the total work.
````

## The insight

> Naive matching restarts from scratch at every alignment, re-reading
> characters it has already seen. That's O((n−m+1)·m) worst case — fine
> for everyday inputs and small constraints, catastrophic on repetitive
> data. Smarter algorithms (KMP, rolling hashes) never re-read — but the
> naive version, stated with its honest bound, is the correct move at
> these constraints.

## Solution

`````reveal Solution — check every alignment
````tabs
```python
def str_str(haystack: str, needle: str) -> int:
    n, m = len(haystack), len(needle)
    for start in range(n - m + 1):        # every viable alignment
        if haystack[start:start + m] == needle:
            return start
    return -1

# explicit-loop version (what the slice is doing for you):
def str_str_explicit(haystack: str, needle: str) -> int:
    n, m = len(haystack), len(needle)
    for start in range(n - m + 1):
        j = 0
        while j < m and haystack[start + j] == needle[j]:
            j += 1
        if j == m:
            return start
    return -1
```

```typescript
function strStr(haystack: string, needle: string): number {
  const n = haystack.length,
    m = needle.length;
  for (let start = 0; start <= n - m; start++) {
    // every viable alignment
    let j = 0;
    while (j < m && haystack[start + j] === needle[j]) j++;
    if (j === m) return start;
  }
  return -1;
}
```
````

The loop bound `n − m + 1` is where off-by-ones live: an alignment
starting later than n − m couldn't fit needle. (When m > n the range is
empty and we correctly fall through to −1.)

```complexity
{
  "time": "O((n − m + 1) · m) worst case, O(n) typical",
  "space": "O(1)",
  "why": "Alignments × verification cost. On random text, mismatches come after ~1 character (26 letters ⇒ expected verify cost is constant) — the average case is effectively linear. The 'aaa…b' family forces the full m per alignment: worst case is real, just rare."
}
```
`````

## Why this matters beyond the problem

Every time you write `sub in s` or `s.includes(sub)` inside a loop, THIS
algorithm's cost model (or a library cousin's) is what you're multiplying
by. The Big O module said "price the body honestly"; now you've built the
body. When repetitive data makes the worst case live, the fixes are:

- **KMP / Z-algorithm** — O(n + m) always, by precomputing how much of a
  partial match survives a mismatch (never re-reads). Advanced string
  territory, beyond this module's scope.
- **Rabin–Karp rolling hash** — compare fingerprints instead of
  characters; the modular arithmetic from Module 3 is exactly its engine.
  You'll build rolling hashes in the Hash Tables and Sliding Window
  modules.

```quiz
{
  "questions": [
    {
      "question": "What is the worst-case total work of naive matching with haystack = 'aaaa…a' (length n) and needle = 'aaab' (length m)?",
      "options": [
        "O(n·m) — every one of ~n alignments matches m−1 a's before failing on b",
        "O(n + m) — a linear-time algorithm like KMP achieves this by never re-reading a character, and naive matching is often mistakenly assumed to behave the same way",
        "O(n) — mismatches end alignments early, and since a mismatch is assumed to occur within a small constant number of characters, the per-alignment cost stays bounded regardless of m"
      ],
      "answer": 0,
      "explanation": "Repetitive data defeats early mismatch: each alignment does nearly full verification. This adversarial family is WHY linear-time algorithms (KMP) were invented."
    },
    {
      "question": "Why is naive matching nonetheless the right answer at these constraints (n, m ≤ 10⁴)?",
      "options": [
        "Worst case is ~10⁸ simple comparisons at the extreme corner, typical inputs are effectively linear, and the implementation is 10 obviously-correct lines — engineering judgment says start here",
        "It isn't — KMP is always required; any production substring-search code that skips building the failure function risks silently timing out the moment inputs turn adversarial",
        "Because the inputs are guaranteed random — the constraints implicitly promise no adversarial repetition, which is what licenses skipping a linear-time algorithm here"
      ],
      "answer": 0,
      "explanation": "Matching the tool to the constraints is the discipline this course drills. Reaching for KMP at n = 10⁴ is complexity theater; KNOWING KMP exists — and when the worst case becomes live — is the real requirement."
    }
  ]
}
```

````reveal Module complete — what carries forward
- The **builder pattern** kills the O(n²) concatenation trap forever.
- **Count-array fingerprints** become hash-map fingerprints in Module 6
  (Group Anagrams is waiting).
- **Converging pointers with skips** and **reverse-then-repair** join the
  in-place toolkit.
- Naive substring search is now a cost you can PRICE — and its failure
  mode motivates rolling hashes (Module 6/11) later.

**Next: Module 6 — Hash Tables**, where "have I seen this?" finally gets
its O(1) answer and the fingerprint idea goes fully general.
````
