---
title: String APIs, Scan Costs & Idioms
type: concept
---

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

  Trace the naive search for `"ab"` in `"aabab"` to see where the cost
  comes from — at each starting position, compare character by character
  until a mismatch or a full match:

  | Start `i` | Comparisons | Result |
  | --- | --- | --- |
  | 0 | `text[0]='a'` vs `'a'` → match; `text[1]='a'` vs `'b'` → mismatch (2 compares) | fail, advance |
  | 1 | `text[1]='a'` vs `'a'` → match; `text[2]='b'` vs `'b'` → match (2 compares) | **match found** |

  Four character comparisons before the naive scan finds the match — and
  in the worst case (no match anywhere, or many near-misses) that count
  grows to roughly `n·m`, one full pattern-length comparison attempted at
  every starting position.
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
