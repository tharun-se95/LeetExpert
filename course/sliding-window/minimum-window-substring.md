---
title: Minimum Window Substring
type: problem
---

## Problem

Given strings `s` and `t`, return the **smallest substring of `s`** that
contains every character of `t` (with at least `t`'s multiplicity — if
`t` has two `a`s, the window needs at least two). Return `""` if no such
window exists.

**Examples**

```text
s = "ADOBECODEBANC", t = "ABC"  →  "BANC"
s = "a", t = "aa"               →  ""     (s has only one 'a')
s = "a", t = "a"                →  "a"
```

**Constraints:** 1 ≤ |s|, |t| ≤ 10⁵ · letters (upper and lower case).

## Attempt it first

The module's capstone: it fuses Minimum Size Subarray Sum's shape
(shrink while valid, hunt for shortest) with Permutation in String's
frequency matching (need vs. have counts) — except the window is now
**dynamic**, not fixed, because `t`'s characters don't have to be
contiguous or exactly `len(t)` long in `s`. Define "valid" precisely
before writing anything.


```sandbox
{
  "id": "minimum-window-substring",
  "fn": { "python": "min_window", "javascript": "minWindow" },
  "check": "return",
  "starter": {
    "python": "def min_window(s, t):\n    # Return the smallest substring of s covering all of t, or \"\".\n    pass\n",
    "javascript": "function minWindow(s, t) {\n  // Return the smallest substring of s covering all of t, or \"\".\n}\n"
  },
  "cases": [
    { "args": ["ADOBECODEBANC", "ABC"], "expect": "BANC" },
    { "args": ["a", "aa"], "expect": "" },
    { "args": ["a", "a"], "expect": "a" },
    { "args": ["ab", "b"], "expect": "b" },
    { "args": ["aa", "aa"], "expect": "aa" },
    { "args": ["bba", "ab"], "expect": "ba" },
    { "args": ["cabwefgewcwaefgcf", "cae"], "expect": "cwae" },
    { "args": ["ADOBECODEBANC", "ABCC"], "expect": "CODEBANC" }
  ]
}
```

````reveal Hint 1 — what does "valid" mean here?
The window is valid when it contains AT LEAST need[c] copies of every
character c in t. Track have[c] (window's counts) and a single number
'satisfied' = how many distinct characters currently meet their need
(have[c] >= need[c]). Valid ⟺ satisfied == number of distinct chars in t.
````

````reveal Hint 2 — expand to find validity, shrink to MINIMIZE it
Expand right until the window becomes valid (satisfied hits the target).
Then shrink from the left WHILE still valid, recording the window length
each time — exactly Minimum Size Subarray Sum's 'shrink while valid'
template, with 'sum >= target' replaced by 'satisfied == required'.
````

## Brute force, for contrast

All O(n²) substrings, each checked for containment in O(|t|) or O(26):
O(n²) or worse. The dynamic window collapses this because — same
argument as every problem in this module — each character enters and
leaves the window at most once across the whole scan.

## The insight

> "Contains at least these counts" is monotonic exactly like "sum ≥
> target": growing the window can only add characters (never removes
> progress toward satisfying `t`), and shrinking can only remove them.
> That licenses the shrink-while-valid template directly — the only new
> piece is that "valid" is now a frequency condition instead of a sum
> comparison, tracked with the same before/after `bump`-style accounting
> as Permutation in String.

## Solution

`````reveal Solution — dynamic window, need/have frequency matching
````tabs
```python
from collections import Counter

def min_window(s: str, t: str) -> str:
    if not t or not s:
        return ""

    need = Counter(t)
    required = len(need)                      # distinct chars t needs satisfied

    have: dict[str, int] = {}
    satisfied = 0

    best_len = float("inf")
    best_left = 0
    left = 0

    for right, ch in enumerate(s):
        have[ch] = have.get(ch, 0) + 1                       # expand
        if ch in need and have[ch] == need[ch]:
            satisfied += 1                     # this char JUST became satisfied

        while satisfied == required:           # shrink WHILE valid
            if right - left + 1 < best_len:
                best_len = right - left + 1
                best_left = left

            left_ch = s[left]
            have[left_ch] -= 1
            if left_ch in need and have[left_ch] < need[left_ch]:
                satisfied -= 1                  # shrinking just broke validity
            left += 1

    return "" if best_len == float("inf") else s[best_left : best_left + best_len]
```

```typescript
function minWindow(s: string, t: string): string {
  if (!t || !s) return "";

  const need = new Map<string, number>();
  for (const ch of t) need.set(ch, (need.get(ch) ?? 0) + 1);
  const required = need.size; // distinct chars t needs satisfied

  const have = new Map<string, number>();
  let satisfied = 0;

  let bestLen = Infinity;
  let bestLeft = 0;
  let left = 0;

  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    have.set(ch, (have.get(ch) ?? 0) + 1); // expand
    if (need.has(ch) && have.get(ch) === need.get(ch)) {
      satisfied++; // this char JUST became satisfied
    }

    while (satisfied === required) {
      // shrink WHILE valid
      if (right - left + 1 < bestLen) {
        bestLen = right - left + 1;
        bestLeft = left;
      }

      const leftCh = s[left];
      have.set(leftCh, have.get(leftCh)! - 1);
      if (need.has(leftCh) && have.get(leftCh)! < need.get(leftCh)!) {
        satisfied--; // shrinking just broke validity
      }
      left++;
    }
  }

  return bestLen === Infinity ? "" : s.slice(bestLeft, bestLeft + bestLen);
}
```
````

Three details doing the real work:

- **`satisfied` counts DISTINCT characters meeting their need**, not
  total matched characters — comparing `satisfied === required` is O(1)
  regardless of `t`'s length, avoiding a full frequency-map comparison
  on every step (the same trick Permutation in String used).
- **The `== need[ch]` check on expand** fires exactly once per
  character, the moment it CROSSES from under-satisfied to satisfied —
  further copies of an already-satisfied character correctly don't
  re-increment `satisfied`.
- **The `< need[left_ch]` check on shrink** is the mirror: it fires
  exactly when removing a copy drops a character BELOW its requirement —
  removing a "surplus" copy (window has more than `t` needs) correctly
  leaves `satisfied` untouched.

```complexity
{
  "time": "O(|s| + |t|)",
  "space": "O(|s| distinct + |t| distinct)",
  "why": "Building need is O(|t|). left and right each advance at most |s| times total across the whole run — the dynamic-window accounting, one more time. have and need are bounded by the alphabet, not the input length."
}
```
`````

## Why this closes the module

Every idea from this module's five problems lands here at once: fixed
windows taught incremental maintenance (`have` updates by ±1, never
recomputed); dynamic windows taught the shrink-while-valid skeleton and
its monotonicity requirement (surplus copies only ever help validity,
never hurt it); Permutation in String taught frequency-based validity
with an O(1) "how close am I" summary instead of a full comparison.
Minimum Window Substring is those three ideas, composed.

````reveal Module complete — what carries forward
- **Incremental maintenance** (slide, don't recompute) is the fixed-
  window idea; it returns anywhere an aggregate can be updated from
  "what changed" — prefix sums (Module 12) generalize it further.
- **Shrink-while/until-valid**, with its monotonicity precondition
  stated explicitly, is the dynamic-window skeleton — misapplying it to
  a non-monotonic condition is the most common real-world bug in this
  family.
- **O(1) validity summaries** (a single `matches`/`satisfied` counter
  instead of comparing full frequency maps) is a pattern worth
  recognizing on sight: whenever "is this state valid?" would otherwise
  cost O(alphabet) or O(distinct), maintain a running summary instead.

**Next: Module 12 — Prefix Sum**, where the "precompute once, query
fast" idea this module's incremental sums hinted at gets its own
dedicated toolkit — including Kadane's algorithm as the capstone.
````

```quiz
{
  "questions": [
    {
      "question": "Why does `satisfied` track distinct SATISFIED characters rather than total matched character count?",
      "options": [
        "Total character count would overflow — summing every matched character's count across a long string risks exceeding the range a standard counter variable can safely hold",
        "Comparing satisfied === required is an O(1) check regardless of t's length or alphabet size; recomputing or comparing full frequency maps on every single expand/shrink would cost O(distinct characters) per step, turning an O(n) algorithm back into something slower",
        "It's simpler to implement — tracking distinct satisfied characters avoids having to write the nested loop logic that comparing total matched counts across two frequency maps would otherwise require"
      ],
      "answer": 1,
      "explanation": "This is the same move as Permutation in String's `matches` counter: replace 'compare two frequency structures' with 'maintain one integer that summarizes whether they'd compare equal.' The O(1) validity check is what keeps the whole algorithm at O(n) instead of O(n · alphabet)."
    },
    {
      "question": "On the shrink step, why does the code check `have[left_ch] < need[left_ch]` rather than `have[left_ch] == need[left_ch] - 1` or similar?",
      "options": [
        "They're equivalent for this problem's purposes — both expressions describe the exact same underlying event, so there's no meaningful difference in what they check or when they'd fire during the shrink loop",
        "Because have[left_ch] could be negative — allowing the count to dip below zero during shrinking is what forces the code to use a range check like `<` rather than testing for one specific value",
        "Because have[left_ch] can be decremented below need[left_ch] by exactly 1 each removal, `< need[left_ch]` and `== need[left_ch] - 1` happen to coincide here — but `<` is the more ROBUST condition: it directly states the validity-breaking fact ('no longer meets requirement') rather than assuming a specific prior value"
      ],
      "answer": 2,
      "explanation": "Both conditions fire at the same moment in this specific code, since decrements are always by 1. But writing the check as the actual semantic condition ('did we drop below what's needed') rather than an arithmetic coincidence ('is it exactly one less') is the more defensible, bug-resistant way to state it — worth the habit even when a shortcut would technically work."
    }
  ]
}
```
