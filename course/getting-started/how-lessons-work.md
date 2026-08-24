---
title: How Lessons & Problems Work
type: concept
---

## The demonstration and the cook-off

Every good cooking class has two different kinds of sessions. In a
**demonstration**, the chef shows you a technique — explains why it
works, walks through it step by step, lets you watch closely. In a
**cook-off**, you're handed raw ingredients and a dish to make, with
minimal hand-holding — you attempt it yourself, ask for a hint only when
you're truly stuck, and compare your result to the chef's version
afterward.

**Concept lessons** are the demonstrations. They teach a structure or
technique itself, and follow a fixed arc:

1. *Motivation* — what problem exists that this thing solves; what breaks
   without it.
2. *Mechanics* — how it works, down to memory layout, with visualizations.
3. *Operations and their costs* — every operation's complexity, **with the
   reasoning**, not just the number.
4. *Implementation* — built from scratch in Python and TypeScript.
5. *Trade-offs* — when to reach for it, when its alternatives win.
6. *Quiz* — a short check that it stuck.

**Problem lessons** are the cook-offs. They apply what you've learned,
one problem each, solve-first: statement and constraints → your attempt →
progressive hints → the brute force and its cost → the key insight → the
optimal solution → variants.

## The interactive blocks

Lessons use a few interactive blocks. Here's each one, live.

**Code tabs** — implementations always come in both languages, the same
dish cooked two different ways. Pick your primary language, but skim the
other; seeing the same idea twice separates the idea from the syntax.

````tabs
```python
def contains_duplicate(nums: list[int]) -> bool:
    seen = set()
    for x in nums:
        if x in seen:
            return True
        seen.add(x)
    return False
```

```typescript
function containsDuplicate(nums: number[]): boolean {
  const seen = new Set<number>();
  for (const x of nums) {
    if (seen.has(x)) return true;
    seen.add(x);
  }
  return false;
}
```
````

**Complexity boxes** — the dish's nutrition label, standardized cost
summaries, always with the why:

```complexity
{
  "time": "O(n)",
  "space": "O(n)",
  "why": "One pass over n elements; each set membership check and insert is O(1) on average. The set can grow to hold all n elements."
}
```

**Reveals** — the tasting notes you only read after you've actually
cooked, used for hints and solutions in problem lessons. Genuinely try
first; then open them in order.

````reveal Try it — what does this hide?
Exactly this. In problem lessons, hints escalate one reveal at a time, so
you can take the smallest push you need and go back to attempting.
````

**Quizzes** — the taste test, instant feedback with an explanation either
way. Your answers are saved locally in your browser, nowhere else.

```quiz
{
  "question": "What should you do when you hit a problem lesson?",
  "options": [
    "Skip it if the concept lesson made sense",
    "Attempt it seriously, then take hints one at a time as needed",
    "Read the optimal solution first so you learn the right approach"
  ],
  "answer": 1,
  "explanation": "Retrieval — struggling to produce an answer — is what builds durable skill. Solutions you only read are the ones you forget."
}
```

## Progress

Opening a lesson marks it visited; the sidebar and header track how much of
the course you've covered. Progress lives entirely in your browser's local
storage — there are no accounts and nothing leaves your machine.

Next: how the code editor itself works — running your solution, reading
test results, and what to do when you're stuck.
