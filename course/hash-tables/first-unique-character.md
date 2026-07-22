---
title: First Unique Character
type: problem
---

## Problem

Given a string `s`, return the index of the first character that appears
exactly once, or −1 if none exists.

**Examples**

```text
"leetcode"     →  0   ('l')
"loveleetcode" →  2   ('v')
"aabb"         →  -1
```

**Constraints:** 1 ≤ n ≤ 10⁵ · lowercase English letters.

## Attempt it first

The patterns-lesson quiz literally contained this problem's shape. The
one design decision worth pausing on: *why must there be two passes, and
over what?*

````reveal Hint — count, then re-scan the ORIGINAL
"Exactly once" is the Count verb. But no map tells you FIRST — map
iteration order is not input order (and even insertion-ordered maps give
first-inserted, which for a repeated character is not where its
uniqueness is decided). So: pass 1 builds counts; pass 2 walks s in order
asking counts[ch] == 1.
````

## Brute force, for contrast

For each position, scan the rest for a second occurrence: O(n²) — 10¹⁰ at
the limit. The count pass replaces every one of those inner scans with a
lookup.

## The insight

> Uniqueness is a GLOBAL frequency fact, but "first" is a POSITIONAL
> fact. One structure can't hold both cleanly — so compute them
> separately: frequencies in one pass, position by re-walking the input
> in its own order. Two clean passes beat one clever one.

## Solution

`````reveal Solution — count, then scan
````tabs
```python
def first_uniq_char(s: str) -> int:
    counts = [0] * 26                       # alphabet contract -> array
    a = ord("a")
    for ch in s:
        counts[ord(ch) - a] += 1
    for i, ch in enumerate(s):              # input order decides "first"
        if counts[ord(ch) - a] == 1:
            return i
    return -1
```

```typescript
function firstUniqChar(s: string): number {
  const counts = new Array(26).fill(0); // alphabet contract -> array
  const a = "a".charCodeAt(0);
  for (const ch of s) counts[ch.charCodeAt(0) - a]++;
  for (let i = 0; i < s.length; i++) {
    // input order decides "first"
    if (counts[s.charCodeAt(i) - a] === 1) return i;
  }
  return -1;
}
```
````

Note the structure choice: the constraints say lowercase English, so
Module 5's 26-slot array beats a map — same algorithm, smaller constant.
Drop the alphabet promise (Unicode input) and only the first line
changes: `counts` becomes a Counter/Map. The ALGORITHM — count then
re-scan — is structure-independent.

```complexity
{
  "time": "O(n)",
  "space": "O(1)",
  "why": "Two sequential passes (add, don't multiply). The 26-slot array is alphabet-sized, not input-sized. With a general alphabet: O(distinct characters) space."
}
```
`````

## Variants

- **First unique in a STREAM** (characters arrive forever, query anytime):
  counts alone can't recover order — you'd pair the Count map with a
  queue of candidates, lazily discarding non-unique fronts. Module 9
  material.
- **Sort Characters by Frequency:** Count verb feeding a sort — the
  count map's entries become the sortable items.

```quiz
{
  "question": "A single forward pass cannot, in general, DECLARE a character unique at the moment it reads it. Why?",
  "options": [
    "Uniqueness is only settled once the entire input has been read — any later duplicate revokes it, so a verdict at read-time can be wrong",
    "Hash operations are too slow inside a single pass — looking up and updating a running count map on every character introduces enough overhead that a second, separate pass ends up being faster overall",
    "Because map iteration order is random — even a fully populated frequency map can't be trusted to yield characters back in their original input order, which is what a single-pass verdict would need"
  ],
  "answer": 0,
  "explanation": "Uniqueness is a whole-input fact: character x at position i is unique only if x never appears in the unread suffix. That's why every correct solution takes some second look after counting — a re-scan of the input, or a scan of a first-index-carrying map. Both work; both are two looks."
}
```
