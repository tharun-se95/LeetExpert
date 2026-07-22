---
title: The String Toolkit
type: concept
---

## Characters as numbers

Every string algorithm eventually touches character codes. The bridge
functions:

````tabs
```python
ord("a")          # 97 — character to code point
chr(98)           # "b" — code point to character
ord("c") - ord("a")   # 2 — letter's alphabet position
```

```typescript
"a".charCodeAt(0); // 97 — character to code unit
String.fromCharCode(98); // "b"
"c".charCodeAt(0) - "a".charCodeAt(0); // 2 — alphabet position
```
````

The payoff is the **count array**: when constraints promise "lowercase
English letters," 26 integer slots replace a whole hash map — smaller,
faster, and O(1)-iterable (26 is a constant):

````tabs
```python
def letter_counts(s: str) -> list[int]:
    counts = [0] * 26
    for ch in s:
        counts[ord(ch) - ord("a")] += 1
    return counts
```

```typescript
function letterCounts(s: string): number[] {
  const counts = new Array(26).fill(0);
  const a = "a".charCodeAt(0);
  for (const ch of s) {
    counts[ch.charCodeAt(0) - a]++;
  }
  return counts;
}
```
````

A count array is a **frequency fingerprint**: two strings are rearrangements
of each other exactly when their fingerprints match. The Valid Anagram
problem is this observation and nothing more; the Hash Tables module
generalizes it to unrestricted alphabets.

## Split / process / join

The workhorse pipeline for token-level transformations:

````tabs
```python
s = "  the   sky is  blue  "
words = s.split()             # no-arg split: splits on runs of whitespace,
                              # discards empties -> ["the","sky","is","blue"]
result = " ".join(words[::-1])
```

```typescript
const s = "  the   sky is  blue  ";
const words = s.split(/\s+/).filter((w) => w.length > 0);
// JS split needs the regex + filter to match Python's no-arg behavior
const result = words.reverse().join(" ");
```
````

Note the asymmetry — Python's no-arg `split()` handles runs-of-spaces and
edge trimming for free; JS needs `/\s+/` plus a filter for the possible
leading empty token. Both pipelines are O(n) time and O(n) space: with
immutable strings, token-level work *cannot* beat O(n) space without
dropping to a mutable char array.

## Scanning costs you should price correctly

- **`sub in s` / `s.includes(sub)`** — substring search is **O(n·m)** in
  the worst case (naive; libraries use better algorithms with good average
  behavior, but never assume O(1)). Pricing a loop that calls `includes`
  means multiplying by this — the "price the body honestly" rule.
- **`s.startswith(p)`** — O(|p|): compares only the prefix. Cheap; the
  Longest Common Prefix problem leans on it.
- **`s.find(c)` / `indexOf`** — O(n) scan. Inside a loop: quadratic alarm.

## Palindrome and prefix idioms

Two micro-patterns that recur enough to preload. **Palindrome check** is
converging pointers with reads instead of swaps — O(n) time, O(1) space,
no char-array conversion needed since nothing mutates. **Common prefix
scan** walks index i while all candidates agree at i. Both appear as
problems in this module; if you can derive them from their invariants
without peeking, the Arrays module did its job.

```quiz
{
  "questions": [
    {
      "question": "When is a 26-slot count array the right replacement for a hash map of character counts?",
      "options": [
        "When the constraints guarantee a small fixed alphabet (e.g. lowercase English letters) — the guarantee is what makes index = ord(ch) − ord('a') safe and complete",
        "Always — it's strictly better; a fixed 26-slot array beats a hash map on every input regardless of the actual character set, since arrays are inherently faster than maps",
        "Only for strings shorter than 26 characters — once the input has more characters than there are slots, some letters would need to share a slot and the counts would collide"
      ],
      "answer": 0,
      "explanation": "The count array trades generality for constant size and direct indexing. Unicode input would need 100k+ slots — that's when the hash map (Module 6) earns its place. Constraints are the contract."
    },
    {
      "question": "A loop over n words calls `text.includes(word)` on each (text has length n). Total cost?",
      "options": [
        "O(n) — includes is a built-in, and built-in string methods run in constant time per call regardless of how long the searched string is",
        "O(n log n) — each includes call internally sorts a working copy of the text to speed up the search, and that sorting cost is what the loop multiplies by n",
        "O(n²·w)-ish — each includes is a substring search costing up to O(n·|word|), and it runs n times"
      ],
      "answer": 2,
      "explanation": "Built-in ≠ free. Substring search is linear-times-pattern in the worst case, and the loop multiplies it. Pricing library calls honestly was the Big O module's rule; strings are where it bites hardest."
    },
    {
      "question": "Why does a palindrome check need no char-array conversion while string reversal does?",
      "options": [
        "Reversal is recursive — since it calls itself on a shrinking substring, each recursive layer needs its own private mutable buffer to swap characters into, which forces the array conversion",
        "Palindrome checks are O(1) — comparing s[left] and s[right] is a single constant-time operation independent of string length, so no linear-time setup like array conversion is ever needed",
        "The check only READS (compare s[left] vs s[right]) — immutability blocks writes, not reads; reversal must write, so it needs a mutable copy"
      ],
      "answer": 2,
      "explanation": "Immutability is a write-lock. Read-only two-pointer algorithms run directly on the string at O(1) auxiliary space; mutating ones pay the O(n) detour."
    }
  ]
}
```
