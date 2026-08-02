---
title: The String Toolkit
type: concept
---

## Characters as numbers

Every string algorithm eventually touches character codes — a computer
stores letters as numbers, and these functions move between the two. The
bridge functions:

````tabs
```python
ord("a")             # 97 — character to code point
chr(98)               # "b" — code point to character
ord("c") - ord("a")   # 2 — letter's alphabet position
```

```typescript
"a".charCodeAt(0); // 97 — character to code unit
String.fromCharCode(98); // "b"
"c".charCodeAt(0) - "a".charCodeAt(0); // 2 — alphabet position
```
````

Because `a`–`z` sit on one unbroken run of consecutive codes, subtracting
`ord("a")` from any lowercase letter's code gives that letter's position in
the alphabet, starting at 0 — that's what makes `ord(ch) - ord("a")` a safe
array index.

The payoff is the **count array**: when constraints promise "lowercase
English letters," 26 integer slots replace a whole hash map — smaller,
faster, and O(1)-iterable, since 26 never grows with the input:

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

```viz
{
  "id": "frequency-count",
  "s": "letters",
  "speed": 500
}
```

A count array is a **frequency fingerprint**: if two strings produce
identical counts, they contain exactly the same letters the same number of
times each — which is exactly what it means for one to be a rearrangement
of the other, and rearranging can't change those counts either way. So
matching fingerprints isn't just a good sign, it's a complete test. The
Valid Anagram problem is this observation and nothing more; the Hash Tables
module generalizes it to unrestricted alphabets, where a fixed 26-slot
array stops being practical.

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

Note the asymmetry — Python's no-arg `split()` treats any run of spaces as
one separator and drops the empty strings that leading/trailing spaces
would otherwise leave behind; JS's `split()` doesn't do either
automatically, so it needs `/\s+/` plus a filter for the leftover empty
tokens. Both pipelines are O(n) time and O(n) space: strings are immutable,
so rearranging pieces of one means building a new string (or a mutable
char-array copy) that scales with the input — there's no way to beat that
O(n) space floor without dropping to a mutable array first.

## Scanning costs you should price correctly

- **`sub in s` / `s.includes(sub)`** — substring search is **O(n·m)** in
  the worst case (naive; libraries do better on average, but never assume
  O(1)). Call it once per iteration of an n-length loop and the total
  becomes **O(n²·m)** — the "price the body honestly" rule, and strings are
  where it bites hardest.
- **`s.startswith(p)`** — O(|p|): it only compares up to the prefix's
  length and stops at the first mismatch. Cheap; the Longest Common Prefix
  problem leans on it.
- **`s.find(c)` / `indexOf`** — O(n): a full scan, no shortcut. Inside a
  loop, the same multiplication applies — quadratic alarm.

## Palindrome and prefix idioms

Two micro-patterns that recur enough to preload. **Palindrome check** is
converging pointers with reads instead of swaps: compare `s[left]` and
`s[right]`, close the gap until they meet. O(n) time, O(1) space — no
char-array conversion needed, since immutability only blocks writes and a
palindrome check never writes anything. **Common prefix scan** walks index
`i` forward while every candidate string still agrees at position `i`,
stopping at the first mismatch or the shortest string's end — whatever
matched so far is the answer. Both appear as problems in this module; if
you can derive them from their invariants without peeking, the Arrays
module did its job.

```viz
{
  "id": "palindrome-check",
  "s": "level",
  "speed": 700
}
```

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
      "explanation": "The count array trades generality for constant size and direct indexing — it only works because the alphabet is guaranteed small, which is what makes matching counts a complete test for anagrams. Unicode input would need 100k+ slots — that's when the hash map (Hash Tables module) earns its place. Constraints are the contract."
    },
    {
      "question": "A loop over n words calls `text.includes(word)` on each (text has length n). Total cost?",
      "options": [
        "O(n) — includes is a built-in, and built-in string methods run in constant time per call regardless of how long the searched string is",
        "O(n log n) — each includes call internally sorts a working copy of the text to speed up the search, and that sorting cost is what the loop multiplies by n",
        "O(n²·w)-ish — each includes is a substring search costing up to O(n·|word|), and it runs n times"
      ],
      "answer": 2,
      "explanation": "Built-in ≠ free: substring search still costs O(n·m) in the worst case, and calling it once per loop iteration multiplies that cost by n. Pricing library calls honestly was the Big O module's rule; strings are where it bites hardest."
    },
    {
      "question": "Why does a palindrome check need no char-array conversion while string reversal does?",
      "options": [
        "Reversal is recursive — since it calls itself on a shrinking substring, each recursive layer needs its own private mutable buffer to swap characters into, which forces the array conversion",
        "Palindrome checks are O(1) — comparing s[left] and s[right] is a single constant-time operation independent of string length, so no linear-time setup like array conversion is ever needed",
        "The check only READS (compare s[left] vs s[right]) — immutability blocks writes, not reads; reversal must write, so it needs a mutable copy"
      ],
      "answer": 2,
      "explanation": "Immutability is a write-lock, not a read-lock. Read-only two-pointer algorithms like a palindrome check run directly on the string at O(1) auxiliary space; algorithms that need to write characters, like reversal, pay the O(n) detour into a mutable copy."
    }
  ]
}
```
