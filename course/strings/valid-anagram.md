---
title: Valid Anagram
type: problem
---

## Problem

Given two strings `s` and `t`, return whether `t` is an anagram of `s` —
a rearrangement using exactly the same characters with the same
multiplicities.

**Examples**

```text
s = "anagram", t = "nagaram"  →  true
s = "rat",     t = "car"      →  false
```

**Constraints:** 1 ≤ n ≤ 5·10⁴ · lowercase English letters · follow-up:
what if inputs contain arbitrary Unicode?

## Attempt it first

The toolkit lesson called count arrays "frequency fingerprints" and said
this problem is that observation and nothing more. Prove it to yourself
before opening hints — including the early exit that makes many calls
O(1).

````reveal Hint 1 — what property is invariant under rearrangement?
Order changes; COUNTS don't. Two strings are anagrams iff every character
appears the same number of times in both. So compare fingerprints, not
strings.
````

````reveal Hint 2 — one array, two directions
You don't need two count arrays: increment for characters of s, decrement
for characters of t. Anagrams ⇔ every slot ends at zero. And before any
counting: what single check eliminates most non-anagrams instantly?
````

## Brute force, for contrast

Sort both strings and compare: O(n log n) time, O(n) space — and honestly
fine at n = 5·10⁴. It loses to counting on asymptotics and on the
follow-up (sorting arbitrary Unicode still works, but counting adapts more
gracefully). Knowing the sort version *is* worth something: "canonical
form by sorting" generalizes to Group Anagrams (Module 6).

## The insight

> Anagram-ness is equality of frequency fingerprints. Fingerprints are
> computable in one pass each, and comparable in O(alphabet) — or foldable
> into a single increment/decrement array that must return to all-zeroes.

## Solution

`````reveal Solution — one count array, ±1
````tabs
```python
def is_anagram(s: str, t: str) -> bool:
    if len(s) != len(t):          # different lengths can't be anagrams
        return False
    counts = [0] * 26
    a = ord("a")
    for ch_s, ch_t in zip(s, t):  # one fused pass
        counts[ord(ch_s) - a] += 1
        counts[ord(ch_t) - a] -= 1
    return all(c == 0 for c in counts)
```

```typescript
function isAnagram(s: string, t: string): boolean {
  if (s.length !== t.length) return false; // fast reject
  const counts = new Array(26).fill(0);
  const a = "a".charCodeAt(0);
  for (let i = 0; i < s.length; i++) {
    counts[s.charCodeAt(i) - a]++;
    counts[t.charCodeAt(i) - a]--;
  }
  return counts.every((c) => c === 0);
}
```
````

Why all-zeroes is exactly right: slot k ends at (count of letter k in s) −
(count in t); all differences zero ⇔ identical fingerprints. The length
check isn't just speed — it's what licenses the fused single loop over
both strings.

```complexity
{
  "time": "O(n)",
  "space": "O(1)",
  "why": "One pass over both strings plus a 26-slot sweep. The count array's size is fixed by the ALPHABET, not the input — that's why it counts as O(1)."
}
```
`````

## The follow-up: Unicode

The 26-slot array leans on the "lowercase English letters" contract. For
arbitrary Unicode, replace it with a dictionary / `Map` keyed by
character — same ±1 algorithm, O(k) space for k distinct characters. This
is precisely the count-array → hash-map generalization Module 6 opens
with; you'll rewrite this solution there in one line of diff.

## Variants

- **Group Anagrams:** fingerprint (or sorted form) becomes a *grouping
  key* — Module 6.
- **Find All Anagrams in a String:** fingerprint maintained over a sliding
  window — Module 11.

```quiz
{
  "questions": [
    {
      "question": "Why does the 26-slot count array legitimately count as O(1) space while a hash map of counts is O(k)?",
      "options": [
        "Arrays are smaller than maps",
        "Its size is a constant fixed by the problem's alphabet guarantee, independent of input length; the map grows with the number of distinct characters actually seen",
        "It doesn't — both are O(n)"
      ],
      "answer": 1,
      "explanation": "O() measures growth with input. 26 never grows. Drop the alphabet guarantee and the honest bound becomes O(alphabet) or O(distinct chars) — which is why the Unicode follow-up changes the structure."
    },
    {
      "question": "The sorting approach is O(n log n) vs counting's O(n). At n = 5·10⁴, is the difference decisive?",
      "options": [
        "Yes — sorting would time out",
        "No — log₂(5·10⁴) ≈ 16, both finish in milliseconds; counting wins on elegance and on scaling, but 'sort + compare' is a legitimate answer to state before refining",
        "They're the same complexity"
      ],
      "answer": 1,
      "explanation": "Constraints-reading cuts both ways: n² (2.5×10⁹) is out, but n log n (~8×10⁵) is comfortable. Knowing an approach is ADEQUATE — and saying you can do better — beats silently reaching for the fancy one."
    }
  ]
}
```
