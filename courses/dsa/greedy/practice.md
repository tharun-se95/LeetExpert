---
title: Practice
type: practice
---

## How to practice this module

Greedy drills reward **the proof, not the guess**: name the invariant the
greedy choice maintains. Jump games track reach, gas-station uses a net
surplus tour, partition-labels closes intervals, candy distributes with two
sweeps. Done when all five show Solved in the hub.

## Problems

```practice-problems
- slug: jump-game
  pattern: Running reach
  difficulty: Medium
  watch_for: Track the farthest reachable index; if i ever passes it, the end is unreachable — greedy on reach, not on individual jumps
- slug: jump-game-ii
  pattern: Jump frontier
  difficulty: Medium
  watch_for: Count jumps per reach frontier; greedily maximise reach each step — the off-by-one on the final jump is the classic bug
- slug: gas-station
  pattern: Net surplus tour
  difficulty: Medium
  watch_for: If total gas < total cost there is no answer; start just after the point where the running surplus went most negative
- slug: partition-labels
  pattern: Last-occurrence windows
  difficulty: Medium
  watch_for: Extend the current partition's end to the last occurrence of each letter inside it; close only when i reaches that end
- slug: candy
  pattern: Two-sweep ratings
  difficulty: Hard
  watch_for: Pass left-to-right then right-to-left; a peak child gets max(left, right) + 1 — a single pass misses one side
```
