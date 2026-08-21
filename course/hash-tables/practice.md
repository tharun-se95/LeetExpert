---
title: Practice
type: practice
---

## How to practice this module

Hash-table problems reward **choosing the key**: the pair or group you look
up defines the whole solution. Two Sum and Contains Duplicate build
complement lookups; First Unique and Group Anagrams turn counts into
structure; Longest Consecutive Sequence stretches the key idea to runs.
Done when all five show Solved in the hub.

## Problems

```practice-problems
- slug: two-sum
  pattern: Complement lookup
  difficulty: Easy
  watch_for: Store value → index while scanning; return the original indices and never reuse the same element twice
- slug: contains-duplicate-ii
  pattern: Last-seen index map
  difficulty: Easy
  watch_for: The window is index distance |i - j| <= k — the map must hold the most recent occurrence
- slug: first-unique-character
  pattern: Count, then scan
  difficulty: Easy
  watch_for: Two passes, first build counts then find the first index with count 1 — a set of seen-once is not enough
- slug: group-anagrams
  pattern: Sorted-key grouping
  difficulty: Medium
  watch_for: The key is the letter multiset (sorted word or a 26-count), never the original order
- slug: longest-consecutive-sequence
  pattern: Run detection from heads
  difficulty: Medium
  watch_for: Only start counting from numbers with no left neighbour; a Set keeps the contains cheap
```
