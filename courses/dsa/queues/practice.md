---
title: Practice
type: practice
---

## How to practice this module

Queue problems hinge on **FIFO order** and the ring-buffer mechanics behind
it. Recent Calls is a pure sliding-time queue; Queue Using Stacks forces you
to reason about order preservation; First Unique and Sliding Window Maximum
both need a queue of candidates. Done when all four show Solved in the hub.

## Problems

```practice-problems
- slug: recent-calls
  pattern: Time-window queue
  difficulty: Easy
  watch_for: Pop the front while it is older than t - 3000; a plain FIFO of timestamps is all you need
- slug: queue-using-stacks
  pattern: Two-stack amortised queue
  difficulty: Easy
  watch_for: Only refill the pop stack when it is empty, or order corrupts and peek goes stale
- slug: stream-first-unique
  pattern: Queue + frequency map
  difficulty: Medium
  watch_for: Eject repeated characters from the queue front as you discover them; '#' when the front is stale
- slug: sliding-window-maximum
  pattern: Monotonic deque
  difficulty: Hard
  watch_for: Drop from the back anything smaller than the new value and from the front anything out of window — the max is the front
```
