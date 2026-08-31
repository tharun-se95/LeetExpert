---
title: Practice
type: practice
---

## How to practice this module

Linked-list problems reward **pointer discipline**: draw the list, name the
pointers, then touch links in the right order. Reversal and middle build
the surgery habits; cycle and merge lean on fast/slow and dummy nodes;
remove-nth needs the gap walked once. Done when all five show Solved in the
hub.

## Problems

```practice-problems
- slug: reverse-linked-list
  pattern: Iterative relinking
  difficulty: Easy
  watch_for: Save the next pointer before rewiring — three pointers (prev / curr / next) are the whole trick
- slug: middle-of-list
  pattern: Fast / slow pointers
  difficulty: Easy
  watch_for: Stop when fast reaches the end; an even-length list yields the second middle
- slug: linked-list-cycle
  pattern: Fast / slow detection
  difficulty: Easy
  watch_for: Slow moves one, fast moves two; null-check fast and fast.next before advancing
- slug: merge-two-sorted
  pattern: Dummy-head merge
  difficulty: Easy
  watch_for: A dummy head removes the first-node special case; drain whichever list is left, exactly once
- slug: remove-nth-from-end
  pattern: Gap pointer
  difficulty: Medium
  watch_for: Advance the first pointer by n before moving both — when n equals the length you remove the head
```
