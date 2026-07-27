---
title: Permutation in String
type: problem
---

## Problem

Given strings `s1` and `s2`, return whether `s2` contains a **permutation
of `s1`** as a contiguous substring — i.e., some window of `s2` that's an
anagram of `s1`.

**Examples**

```text
s1 = "ab", s2 = "eidbaooo"  →  true   ("ba" at index 3)
s1 = "ab", s2 = "eidboaoo"  →  false
```

**Constraints:** 1 ≤ |s1| ≤ |s2| ≤ 10⁴ · lowercase English letters.

## Attempt it first

Two ideas collide here: **fixed-size windows** (the target length is
`len(s1)` — fixed and known up front) and **anagram fingerprints**
(Hash Tables' Group verb: two strings are anagrams iff their frequency
counts match). Combine them: slide a window of size `len(s1)` across
`s2`, and ask at each position whether the window's fingerprint matches
`s1`'s.


```sandbox
{
  "id": "permutation-in-string",
  "fn": { "python": "check_inclusion", "javascript": "checkInclusion" },
  "check": "return",
  "starter": {
    "python": "def check_inclusion(s1, s2):\n    # Return True if some window of s2 is a permutation of s1.\n    pass\n",
    "javascript": "function checkInclusion(s1, s2) {\n  // Return true if some window of s2 is a permutation of s1.\n}\n"
  },
  "cases": [
    { "args": ["ab", "eidbaooo"], "expect": true },
    { "args": ["ab", "eidboaoo"], "expect": false },
    { "args": ["a", "a"], "expect": true },
    { "args": ["adc", "dcda"], "expect": true },
    { "args": ["hello", "ooolleoooleh"], "expect": false },
    { "args": ["abc", "ccccbbbbaaaa"], "expect": false },
    { "args": ["aa", "aab"], "expect": true },
    { "args": ["abc", "bbbca"], "expect": true }
  ]
}
```

````reveal Hint 1 — the naive combination, and its cost
Compute s1's count array once. At each window position, compute the
window's count array from scratch and compare: O(26) per window,
O(26n) total — actually fine here, but the incremental version is the
real lesson.
````

````reveal Hint 2 — maintain the match count incrementally
Instead of comparing full 26-length arrays every slide, track a single
number: "how many of the 26 letters currently have EQUAL counts between
window and target." Expanding/shrinking the window changes at most 2
letters' counts — update the matches number by re-checking just those
2 letters (before vs. after each single-count change), an O(1) slide
instead of an O(26) full comparison.
````

## Brute force, for contrast

Check all substrings of length `len(s1)` by sorting each and comparing:
O(n·k log k). Comparing full frequency arrays per window: O(n·k) or
O(26n) with fixed alphabet. The incremental version below is O(n) flat —
the fixed-window slide applied to a frequency-map aggregate instead of a
sum.

## The insight

> The window size never changes (it's always `len(s1)`) — so this is
> fixed-size sliding, not dynamic. What slides is the *aggregate*: a
> "how many letters currently match" counter, updated by ±1 exactly
> like the sum in the fixed-window lesson, just with a frequency map
> underneath instead of a scalar.

## Solution

`````reveal Solution — fixed window, incremental match count
````tabs
```python
def check_inclusion(s1: str, s2: str) -> bool:
    k = len(s1)
    if k > len(s2):
        return False
    a = ord("a")

    need = [0] * 26
    window = [0] * 26
    for ch in s1:
        need[ord(ch) - a] += 1

    # Before any character has entered the window, window[idx] == 0 for
    # every idx — which already EQUALS need[idx] for every letter absent
    # from s1. Those trivial matches must be counted from the start, or
    # `matches` can never reach 26 even on a genuine hit.
    matches = sum(1 for count in need if count == 0)

    def bump(idx: int, delta: int) -> None:
        nonlocal matches
        if window[idx] == need[idx]:
            matches -= 1                     # about to break a match
        window[idx] += delta
        if window[idx] == need[idx]:
            matches += 1                     # now matches (or matches again)

    for i in range(k):                       # prime the first window
        bump(ord(s2[i]) - a, 1)

    if matches == 26:
        return True

    for right in range(k, len(s2)):
        left = right - k
        bump(ord(s2[left]) - a, -1)          # shrink: leaving char
        bump(ord(s2[right]) - a, 1)          # expand: entering char
        if matches == 26:
            return True

    return False
```

```typescript
function checkInclusion(s1: string, s2: string): boolean {
  const k = s1.length;
  if (k > s2.length) return false;
  const a = "a".charCodeAt(0);

  const need = new Array(26).fill(0);
  const window = new Array(26).fill(0);
  for (const ch of s1) need[ch.charCodeAt(0) - a]++;

  // Before any character has entered the window, window[idx] === 0 for
  // every idx — which already EQUALS need[idx] for every letter absent
  // from s1. Those trivial matches must be counted from the start, or
  // `matches` can never reach 26 even on a genuine hit.
  let matches = need.filter((count) => count === 0).length;

  function bump(idx: number, delta: number): void {
    if (window[idx] === need[idx]) matches--; // about to break a match
    window[idx] += delta;
    if (window[idx] === need[idx]) matches++; // now matches (or matches again)
  }

  for (let i = 0; i < k; i++) bump(s2.charCodeAt(i) - a, 1); // prime

  if (matches === 26) return true;

  for (let right = k; right < s2.length; right++) {
    const left = right - k;
    bump(s2.charCodeAt(left) - a, -1); // shrink: leaving char
    bump(s2.charCodeAt(right) - a, 1); // expand: entering char
    if (matches === 26) return true;
  }

  return false;
}
```
````

The `bump` helper's before/after check is the crux: it decrements
`matches` if the letter WAS matching (about to stop being true), applies
the change, then increments `matches` if it's NOW matching. This handles
all four transitions correctly (match→match, match→mismatch,
mismatch→match, mismatch→mismatch) with the same four lines — no need
to special-case which direction the count moved.

```complexity
{
  "time": "O(n)",
  "space": "O(1)",
  "why": "Priming is O(k). Each slide touches exactly 2 letters (O(1) each) instead of comparing all 26 — n − k slides at O(1) each. The 26-slot arrays are alphabet-sized, not input-sized."
}
```
`````

## Variants

- **Find All Anagrams in a String:** identical mechanics — instead of
  returning at the first match, collect every window's start index
  where `matches == 26`.
- **Minimum Window Substring** (next): the frequency-matching idea, but
  now the window is DYNAMIC (grows and shrinks to find the smallest
  window containing all of a target's characters) — the true synthesis
  of everything this module has built.

```quiz
{
  "question": "Why does bump() check `window[idx] === need[idx]` BEFORE applying delta, not just after?",
  "options": [
    "It's redundant — checking only after would give the same result; since matches only ever changes by at most one per bump call, checking window[idx] against need[idx] at the end captures the same transition either way",
    "matches must be decremented if the letter WAS matching before this change (since the change is about to disturb that equality) — checking only after would miss cases where a match breaks, since by then the 'before' state is already lost",
    "To avoid negative array indices — checking before applying delta ensures idx never goes out of bounds, which is the real reason the order matters rather than anything about correctness of the matches count"
  ],
  "answer": 1,
  "explanation": "matches counts letters where need equals window RIGHT NOW. A single delta can only move one letter's count by 1, so it can affect matches by at most ±1 — but which direction depends on the state before the change. Checking only the after-state would double-count or miss transitions; the before/after pair captures the transition correctly in all four cases."
}
```
