---
title: Practice
type: practice
---

## How to practice this module

Stack problems are **matching and history**: brackets validate nesting, RPN
and the monotonic stack keep recent context. Do valid-parentheses first —
the matching discipline repeats everywhere; largest-rectangle is the
capstone that sweeps the monotonic stack both directions. Done when all
five show Solved in the hub.

## Problems

```practice-problems
- slug: valid-parentheses
  pattern: Bracket matching
  difficulty: Easy
  watch_for: Push openers, pop on closers; the popped type must match and the stack must end empty
- slug: evaluate-rpn
  pattern: Operand stack
  difficulty: Medium
  watch_for: Pop the last two operands in order — b comes before a for a - b; single-value input returns it directly
- slug: min-stack
  pattern: Parallel min stack
  difficulty: Medium
  watch_for: Push min(prevMin, value) alongside each element so a pop restores the previous minimum
- slug: daily-temperatures
  pattern: Monotonic stack
  difficulty: Medium
  watch_for: Store indices, not temperatures; a warmer day only resolves the colder days still waiting
- slug: largest-rectangle
  pattern: Monotonic stack boundaries
  difficulty: Hard
  watch_for: A bar's rectangle ends at the first smaller bar on each side — pop on a smaller height; a sentinel zero drains the stack
```
