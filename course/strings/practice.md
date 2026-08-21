---
title: Practice
type: practice
---

## How to practice this module

Strings drills reward **input hygiene**: clean, normalise, then compare.
Work in order — palindrome and anagram build the two-pointer and count
toolkits; prefix and strStr reuse them. You are done with Strings Practice
when all five show Solved in the hub.

## Problems

```practice-problems
- slug: valid-palindrome
  pattern: Two-pointer cleanup
  difficulty: Easy
  watch_for: Filter non-alphanumerics and normalise case before comparing; advance both ends past noise
- slug: valid-anagram
  pattern: Character counts
  difficulty: Easy
  watch_for: Length check first; one pass to count, then compare maps — sorting hides the multiset idea
- slug: longest-common-prefix
  pattern: Vertical / horizontal shrink
  difficulty: Easy
  watch_for: Empty list → empty string; trim at the first mismatch, not the first word
- slug: find-the-index
  pattern: Window match scan
  difficulty: Easy
  watch_for: Return the first valid start; a needle longer than the haystack is an immediate -1
- slug: reverse-words
  pattern: Split and rebuild
  difficulty: Medium
  watch_for: Collapse runs of spaces and trim the ends; keep exactly one space between words
```
