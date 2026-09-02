---
title: Longest Common Prefix
type: problem
---

## Problem

Given an array of strings, return the longest prefix shared by **all** of
them (possibly the empty string).

**Examples**

```examples
["flower","flow","flight"]  →  "fl"
["dog","racecar","car"]     →  ""
```

```constraint
1 ≤ count ≤ 200 · 0 ≤ each length ≤ 200 · lowercase letters.
```

## Attempt it first

Small constraints — almost anything passes. So this problem is about
*clean decomposition*, not speed. There are two natural shapes; find at
least one, ideally both.


```sandbox
{
  "id": "longest-common-prefix",
  "fn": { "python": "longest_common_prefix", "javascript": "longestCommonPrefix" },
  "check": "return",
  "starter": {
    "python": "def longest_common_prefix(strs):\n    # Return the shared prefix, or \"\".\n    pass\n",
    "javascript": "function longestCommonPrefix(strs) {\n  // Return the shared prefix, or \"\".\n}\n"
  },
  "cases": [
    { "args": [["flower","flow","flight"]], "expect": "fl" },
    { "args": [["dog","racecar","car"]], "expect": "" },
    { "args": [["a"]], "expect": "a" },
    { "args": [["abc","abc"]], "expect": "abc" },
    { "args": [["","a"]], "expect": "" }
  ]
}
```
````reveal Hint 1 — vertical scanning
Compare column by column: does every string agree at index 0? At index 1?
Stop at the first column where any string ends or disagrees. The answer is
everything before that column.
````

````reveal Hint 2 — horizontal shrinking
Alternatively: the answer is a prefix of the FIRST string. Start with all
of it and shrink while any string fails to start with the candidate.
Which toolkit operation makes "fails to start with" cheap?
````

## Brute force, for contrast

There's no meaningful brute force to beat here — total input is ≤ 4·10⁴
characters and any correct approach is near-instant. The value is in
which version you can state, verify, and defend fastest under pressure.

```diagram
{
  "id": "column-scan",
  "strings": ["flower", "flow", "flight"]
}
```

## The insight

> The common prefix is limited by the first disagreement in any column —
> so scan columns until one breaks (vertical), or maintain "longest prefix
> consistent with everything seen so far" and let each new string only
> shrink it (horizontal). Both are invariant statements.

## Solution

`````reveal Solution — vertical scan
````tabs
```python
def longest_common_prefix(strs: list[str]) -> str:
    first = strs[0]
    for col in range(len(first)):                # column index
        ch = first[col]
        for s in strs[1:]:
            if col == len(s) or s[col] != ch:    # ran out, or disagrees
                return first[:col]
    return first                                  # first string is the prefix
```

```typescript
function longestCommonPrefix(strs: string[]): string {
  const first = strs[0];
  for (let col = 0; col < first.length; col++) {
    const ch = first[col];
    for (let i = 1; i < strs.length; i++) {
      if (col === strs[i].length || strs[i][col] !== ch) {
        return first.slice(0, col); // ran out, or disagrees
      }
    }
  }
  return first; // first string is the prefix
}
```
````

Invariant: entering column `col`, all strings agree on [0, col). The
`col == len(s)` check must come first (short-circuit) — indexing past a
string's end would throw in Python and yield `undefined` in JS; ordering
the disjunction IS the bounds check.

```complexity
{
  "time": "O(total characters) worst case, O(count × answer length) typically",
  "space": "O(1)",
  "why": "Each character of each string is examined at most once, and scanning stops at the first breaking column — early exit is the common case. Only the final slice allocates."
}
```
`````

`````reveal Alternative — horizontal shrink
````tabs
```python
def longest_common_prefix_h(strs: list[str]) -> str:
    prefix = strs[0]
    for s in strs[1:]:
        while not s.startswith(prefix):   # O(|prefix|) per test
            prefix = prefix[:-1]          # shrink until consistent
            if not prefix:
                return ""
    return prefix
```

```typescript
function longestCommonPrefixH(strs: string[]): string {
  let prefix = strs[0];
  for (const s of strs.slice(1)) {
    while (!s.startsWith(prefix)) {
      prefix = prefix.slice(0, -1); // shrink until consistent
      if (prefix === "") return "";
    }
  }
  return prefix;
}
```
````

Invariant: after processing k strings, `prefix` is exactly their common
prefix. Same worst-case class; does more re-comparison (startswith
re-checks from position 0) but reads beautifully. A third shape — sort
and compare only first vs last — appears again when you reach the Sorting
module.
`````

## Variants

- **Huge string sets with many prefix queries:** this exact computation
  is what a **trie** (Module 20) amortizes across queries.
- **Longest common prefix of two SUFFIXES of one string:** the heart of
  suffix-array string algorithms — far beyond this module, but the same
  column-agreement idea.

```quiz
{
  "question": "In the vertical scan, why must `col == len(s)` be checked BEFORE `s[col] != ch`?",
  "options": [
    "Short-circuit ordering is the bounds check: with col past s's end, Python raises IndexError and JS compares against undefined — the length test must win the OR first",
    "The order doesn't matter — both conditions independently detect a valid stopping point, so evaluating `s[col] != ch` first would short-circuit to the same overall behavior on every input",
    "It's faster — checking the length first lets the loop skip past already-exhausted strings without evaluating the character comparison at all, saving a constant amount of work per column"
  ],
  "answer": 0,
  "explanation": "A string shorter than the current column ENDS the common prefix (correct answer: stop) — and simultaneously makes s[col] illegal. One condition, ordered correctly, handles both meanings."
}
```
