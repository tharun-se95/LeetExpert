---
title: Group Anagrams
type: problem
---

## Problem

Given an array of strings, group the anagrams together (any group order,
any order within groups).

**Examples**

```text
["eat","tea","tan","ate","nat","bat"]
  →  [["eat","tea","ate"], ["tan","nat"], ["bat"]]
[""]   →  [[""]]
["a"]  →  [["a"]]
```

**Constraints:** 1 ≤ count ≤ 10⁴ · 0 ≤ each length ≤ 100 · lowercase
English letters.

## Attempt it first

This is the Group verb, and Valid Anagram already gave you the hard part.
The whole design problem is one question: **what canonical key makes
"same key" mean exactly "are anagrams"?** There are two good answers with
a real trade-off.

````reveal Hint 1 — key candidate #1
Valid Anagram's sorting variant: anagrams share a sorted form.
sorted("eat") = sorted("tea") = "aet". Sort each word, use the result as
the map key.
````

````reveal Hint 2 — key candidate #2, and the encoding trap
Valid Anagram's main solution: anagrams share a frequency fingerprint.
A 26-slot count array describes each word — but an ARRAY can't be a map
key (unhashable in Python, reference-compared in JS — the patterns
lesson's caution). How do you turn the counts into a hashable, by-value
key?
````

## Brute force, for contrast

Compare every pair with is_anagram and merge groups: C(n,2) ≈ 5·10⁷ pair
checks, each O(word length) — ~10⁹ operations, plus awkward group
bookkeeping. Grouping by canonical key does zero comparisons: items never
meet each other, they just land in the same bucket.

## The insight

> A grouping problem is solved the moment you find a **canonical form** —
> a function where f(a) == f(b) exactly when a and b belong together.
> Then the hash map does ALL the work: one pass, each item filed under
> f(item). Sorted-word and count-fingerprint are both canonical forms for
> anagram-ness; they differ only in cost.

## Solution

`````reveal Solution — sorted-word key
````tabs
```python
from collections import defaultdict

def group_anagrams(strs: list[str]) -> list[list[str]]:
    groups: dict[str, list[str]] = defaultdict(list)
    for s in strs:
        key = "".join(sorted(s))          # canonical form
        groups[key].append(s)
    return list(groups.values())
```

```typescript
function groupAnagrams(strs: string[]): string[][] {
  const groups = new Map<string, string[]>();
  for (const s of strs) {
    const key = [...s].sort().join(""); // canonical form
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(s);
  }
  return [...groups.values()];
}
```
````

```complexity
{
  "time": "O(n · L log L)",
  "space": "O(n · L)",
  "why": "n words, each paying an O(L log L) sort for its key (L = word length ≤ 100). The map stores every word once plus keys."
}
```
`````

`````reveal Alternative — count-fingerprint key, O(L) per word
````tabs
```python
from collections import defaultdict

def group_anagrams_counts(strs: list[str]) -> list[list[str]]:
    groups: dict[tuple, list[str]] = defaultdict(list)
    a = ord("a")
    for s in strs:
        counts = [0] * 26
        for ch in s:
            counts[ord(ch) - a] += 1
        groups[tuple(counts)].append(s)   # tuple: hashable by VALUE
    return list(groups.values())
```

```typescript
function groupAnagramsCounts(strs: string[]): string[][] {
  const groups = new Map<string, string[]>();
  const a = "a".charCodeAt(0);
  for (const s of strs) {
    const counts = new Array(26).fill(0);
    for (const ch of s) counts[ch.charCodeAt(0) - a]++;
    const key = counts.join(","); // canonical STRING: by-value equality
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(s);
  }
  return [...groups.values()];
}
```
````

The key construction is the lesson: Python freezes the counts into a
`tuple` (hashable, compares by content); JS serializes to a string
(`"1,0,0,…"`), because a Map would compare an array key by reference.
Same trade-off, two language idioms. The `,` separator is load-bearing —
`join("")` would make counts [1, 12] and [11, 2] both "112".

Cost: O(n·L) — asymptotically better than sorting, though with L ≤ 100
and log₂ 100 ≈ 7 the sorted key is usually faster in practice and easier
to write. Both are right; say the trade-off out loud.
`````

## Variants

- **Valid Anagram** is this problem at n = 2 — one key comparison.
- **Group Shifted Strings** ("abc"→"bcd" are shifts): same Group verb,
  different canonical form (difference sequence mod 26 — the Math
  module's clock again). Designing f is always the whole problem.

```quiz
{
  "questions": [
    {
      "question": "What property must a canonical key f satisfy for hash-map grouping to be CORRECT (not just fast)?",
      "options": [
        "f must be quick to compute",
        "f(a) == f(b) if AND ONLY IF a, b belong to the same group — 'if' prevents split groups, 'only if' prevents merged ones",
        "f must produce short keys"
      ],
      "answer": 1,
      "explanation": "Both directions carry weight. If anagrams could get different keys, a group fragments; if non-anagrams could share a key, groups fuse. Sorted-form and count-fingerprint both satisfy the biconditional — that's WHY they work."
    },
    {
      "question": "Why does the JS count-key need a separator (counts.join(\",\") not join(\"\"))?",
      "options": [
        "Readability",
        "Without it the digit strings of different counts can collide: [1,12,0,…] and [11,2,0,…] both serialize to '1120…' — two DIFFERENT fingerprints, one key: groups wrongly merge",
        "join(\"\") is slower"
      ],
      "answer": 1,
      "explanation": "Serialization must be INJECTIVE on fingerprints or the canonical-key biconditional breaks in the 'only if' direction. Ambiguous flattening is a classic silent grouping bug — same reason '1,2' + '3' vs '1' + '2,3' style key-building needs care everywhere."
    }
  ]
}
```
