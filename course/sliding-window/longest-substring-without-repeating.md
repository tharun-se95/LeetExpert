---
title: Longest Substring Without Repeating Characters
type: problem
---

## Problem

Given a string `s`, return the length of the longest substring without
repeating characters.

**Examples**

```text
"abcabcbb"  →  3    ("abc")
"bbbbb"     →  1    ("b")
"pwwkew"    →  3    ("wke")
```

**Constraints:** 0 ≤ n ≤ 5·10⁴ · letters, digits, symbols, spaces.

## Attempt it first

The dynamic-window lesson's "longest, upper-bound" template, mirrored
against Minimum Size Subarray Sum's "shortest, lower-bound" shape.
Validity here is "no duplicate in the window" — figure out what state
answers "is the incoming character already in the window?" in O(1),
and what invalidates the window when it arrives.


```sandbox
{
  "id": "longest-substring-without-repeating",
  "fn": { "python": "length_of_longest_substring", "javascript": "lengthOfLongestSubstring" },
  "check": "return",
  "starter": {
    "python": "def length_of_longest_substring(s):\n    # Return the length of the longest substring with no repeated character.\n    pass\n",
    "javascript": "function lengthOfLongestSubstring(s) {\n  // Return the length of the longest substring with no repeated character.\n}\n"
  },
  "cases": [
    { "args": ["abcabcbb"], "expect": 3 },
    { "args": ["bbbbb"], "expect": 1 },
    { "args": ["pwwkew"], "expect": 3 },
    { "args": [""], "expect": 0 },
    { "args": [" "], "expect": 1 },
    { "args": ["dvdf"], "expect": 3 },
    { "args": ["abba"], "expect": 2 },
    { "args": ["tmmzuxt"], "expect": 5 }
  ]
}
```

````reveal Hint 1 — what breaks validity, and how do you know?
A window is invalid the instant it contains the SAME character twice.
Track a set (or map to last-seen index) of characters currently in the
window. When nums[right] is already in the window, shrink from the left
until it isn't.
````

````reveal Hint 2 — shrink by exactly how much?
Naively: remove characters from the left one at a time until the
duplicate is gone — correct, and each character is removed at most
once ever (the O(n) accounting holds). A map of char → last index lets
you jump left directly to one past the duplicate's last occurrence,
skipping the one-at-a-time removal — an optimization, not a requirement.
````

## Brute force, for contrast

Check every substring for duplicates: O(n³) (O(n²) substrings, O(n)
duplicate check each) — or O(n²) with a per-start rolling set. The
window approach's insight — each character enters and leaves the window
at most once across the whole scan — collapses this to O(n).

## The insight

> "No duplicates in the window" is monotonic in the required direction:
> if a window has a duplicate, EVERY larger window containing it also
> has that duplicate (adding elements can't remove one) — so once
> invalid-by-duplicate, only shrinking can fix it, never further
> expansion. That's exactly the precondition the dynamic-window template
> needs.

## Solution

`````reveal Solution — set-based shrink, one character at a time
````tabs
```python
def length_of_longest_substring(s: str) -> int:
    window: set[str] = set()
    left = 0
    best = 0
    for right in range(len(s)):
        while s[right] in window:                # shrink UNTIL valid
            window.remove(s[left])
            left += 1
        window.add(s[right])                      # expand
        best = max(best, right - left + 1)        # record AFTER restoring validity
    return best
```

```typescript
function lengthOfLongestSubstring(s: string): number {
  const window = new Set<string>();
  let left = 0;
  let best = 0;
  for (let right = 0; right < s.length; right++) {
    while (window.has(s[right])) {
      // shrink UNTIL valid
      window.delete(s[left]);
      left++;
    }
    window.add(s[right]); // expand
    best = Math.max(best, right - left + 1); // record AFTER restoring validity
  }
  return best;
}
```
````

Note the loop's shape matches the "longest, upper-bound" template
exactly: shrink is a `while (!isValid)` in spirit (`while duplicate
present`), and `best` updates once, after the window is guaranteed
valid — not inside the shrink loop, unlike Minimum Size Subarray Sum.
Getting this backwards (recording before shrinking) would credit
windows that still contain the duplicate.

```complexity
{
  "time": "O(n)",
  "space": "O(min(n, alphabet size))",
  "why": "Each character enters the set once and leaves at most once across the ENTIRE scan — the same push-once/pop-once budget as the monotonic stack, here applied to set membership instead of a stack."
}
```
`````

`````reveal Optimization — jump left directly with a last-seen map
````tabs
```python
def length_of_longest_substring_fast(s: str) -> int:
    last_seen: dict[str, int] = {}
    left = 0
    best = 0
    for right, ch in enumerate(s):
        if ch in last_seen and last_seen[ch] >= left:
            left = last_seen[ch] + 1              # jump past the duplicate
        last_seen[ch] = right
        best = max(best, right - left + 1)
    return best
```

```typescript
function lengthOfLongestSubstringFast(s: string): number {
  const lastSeen = new Map<string, number>();
  let left = 0;
  let best = 0;
  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    if (lastSeen.has(ch) && lastSeen.get(ch)! >= left) {
      left = lastSeen.get(ch)! + 1; // jump past the duplicate
    }
    lastSeen.set(ch, right);
    best = Math.max(best, right - left + 1);
  }
  return best;
}
```
````

The `>= left` guard matters: a stale last-seen index from BEFORE the
current window started must not yank `left` backward — `left` only ever
moves forward, same invariant as before, just reached by a jump instead
of a walk. Same O(n) time complexity as the set version — fewer
iterations, not a better asymptotic class; worth knowing, not required.
`````

## Variants

- **Longest Substring with At Most K Distinct Characters:** same
  template, validity = "distinct count ≤ k" instead of "no duplicates" —
  a strict generalization (this problem is k=1... no, k = window size,
  actually this problem is the K-distinct problem with the stronger
  condition "every character's count ≤ 1").
- **Longest Repeating Character Replacement:** validity uses "window
  length − max character frequency ≤ k" — a non-obvious invariant, still
  monotonic, still the same skeleton.
- **Permutation in String** (next): fixed-size window + frequency
  matching, a different validity notion entirely.

```quiz
{
  "question": "In the optimized version, why must the check be `last_seen[ch] >= left` rather than just `ch in last_seen`?",
  "options": [
    "It prevents a KeyError/undefined access — without the guard, looking up a character that has never appeared in the string at all would throw, so the check exists purely to avoid that runtime error",
    "last_seen holds the MOST RECENT index for every character ever seen, including ones from before the current window's left boundary — without the >= left guard, a stale index could yank left backward, past where it already validly advanced, breaking the invariant that left only moves forward",
    "It's a minor performance optimization — the guard just lets the algorithm skip a redundant map lookup in cases where the jump wouldn't have changed the outcome anyway, saving a constant amount of work per character"
  ],
  "answer": 1,
  "explanation": "last_seen never forgets a character once seen, even after it's fallen out of the window. The guard is what distinguishes 'this duplicate is still in my current window' from 'this character appeared long ago and is irrelevant now' — omitting it is the classic bug in this optimization."
}
```
