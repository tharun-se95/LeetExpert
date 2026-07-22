---
title: Daily Temperatures
type: problem
---

## Problem

Given daily `temperatures`, return an array where `answer[i]` is the
number of days you must wait after day i for a **warmer** temperature —
`0` if it never comes.

**Examples**

```text
[73,74,75,71,69,72,76,73]  →  [1,1,4,2,1,1,0,0]
[30,40,50,60]              →  [1,1,1,0]
[30,60,90]                 →  [1,1,0]
```

**Constraints:** 1 ≤ n ≤ 10⁵ · temperatures in [30, 100].

## Attempt it first

Read the question as the monotonic-stack lesson taught: this is
next-greater-element with the answer expressed as a **distance** (i − j)
instead of a value. If you can adapt the template without re-opening the
lesson, the pattern is yours. One extra wrinkle: which flavor row, and
what exactly gets recorded on each pop?

````reveal Hint — indices are the payload
Stack indices of days still awaiting warmth, values strictly decreasing.
When day i's temperature beats the top index j's, day j's wait is
i − j — pop and record. Push i. Days still stacked at the end wait
forever: 0.
````

## Brute force, for contrast

For each day, scan forward for warmth: O(n²) — 10¹⁰ at n = 10⁵ on the
adversarial descending input [100, 99, 98, …]. Note *which* inputs are
bad: on random data the forward scan exits fast; the descending case is
where the quadratic lives. Constraints say assume adversarial.

## Solution

`````reveal Solution — monotonic stack, distance recorded
````tabs
```python
def daily_temperatures(temps: list[int]) -> list[int]:
    answer = [0] * len(temps)             # 0 = never warmer
    stack: list[int] = []                 # indices, temps strictly decreasing
    for i, t in enumerate(temps):
        while stack and temps[stack[-1]] < t:
            j = stack.pop()
            answer[j] = i - j             # DISTANCE, not value
        stack.append(i)
    return answer
```

```typescript
function dailyTemperatures(temps: number[]): number[] {
  const answer = new Array(temps.length).fill(0); // 0 = never warmer
  const stack: number[] = []; // indices, temps strictly decreasing
  for (let i = 0; i < temps.length; i++) {
    while (stack.length > 0 && temps[stack[stack.length - 1]] < temps[i]) {
      const j = stack.pop()!;
      answer[j] = i - j; // DISTANCE, not value
    }
    stack.push(i);
  }
  return answer;
}
```
````

This is why the template stacks **indices**, never values: the pop-time
computation needs j itself (for i − j). A value-stack version of
next-greater happens to work when you only need values; the index stack
subsumes it — one habit covers every variant. The mechanic underneath is
identical to next-greater-value — only what gets recorded on a pop
changes (a distance instead of a value):

```viz
{ "id": "monotonic-stack", "data": [2, 1, 5, 3] }
```

Equal temperatures check: 72 then 72 — is the second "warmer"? No; the
pop condition is strict (`<`), so equal days stay stacked, correctly
waiting for STRICTLY warmer. Whether your comparison is `<` or `<=` is a
specification decision, made deliberately, tested with a duplicate
input.

```complexity
{
  "time": "O(n)",
  "space": "O(n)",
  "why": "Push once, pop at most once per index — the whole-execution budget from the monotonic lesson. Worst-case stack: the fully-descending input holds all n."
}
```
`````

## Variants

- **Next Greater Element II** (circular array): run the same scan over
  the array twice (indices mod n — Module 3); second lap answers what
  the first left stacked, pushes nothing new.
- **Stock Span:** previous-greater flavor, answered at push time.
- **Sliding Window Maximum:** the same "useless elements never come
  back" logic on a deque — Module 9 closes the loop.

```quiz
{
  "questions": [
    {
      "question": "The input [100, 99, 98, ..., 31] (strictly descending). What happens in the stack version, and what does it cost?",
      "options": [
        "The algorithm fails — nothing is ever recorded; a strictly descending sequence violates the loop's assumption that some warmer day eventually arrives, so the answer array is left in an undefined state",
        "No pop ever fires; all n indices pile up and every answer stays 0 — one O(n) pass with the stack at maximum depth. The input that made brute force quadratic is the stack's EASIEST case",
        "The stack thrashes — worst case O(n²); every new colder temperature has to be compared against the full depth of the stack before it can be pushed, and that comparison cost compounds across n days"
      ],
      "answer": 1,
      "explanation": "Descending input = zero pops = pure pushes. Answers of 0 are correct (never warmer). The adversarial input and the expensive input have swapped places — a sign the algorithm's work is proportional to ANSWERS FOUND, not searching done."
    },
    {
      "question": "Why must the stack hold indices rather than temperature values?",
      "options": [
        "Indices compare faster — integer index comparisons execute in fewer CPU cycles than comparing arbitrary temperature values, which is the actual reason the stack is built around indices instead",
        "The answer is a DISTANCE i − j; at pop time you must know where j was, and a value-only stack has discarded that. Indices always suffice (values are one lookup away); values alone often don't",
        "Values would overflow — temperatures accumulated across a long descending run can exceed the range a stack of raw values is able to hold, forcing the switch to smaller index values instead"
      ],
      "answer": 1,
      "explanation": "temps[j] is recoverable from j, but j is not recoverable from temps[j] (duplicates!). Index stacks strictly dominate — which is why the module's template never stacks raw values."
    }
  ]
}
```
