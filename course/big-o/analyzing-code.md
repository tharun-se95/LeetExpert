---
title: Analyzing Loops & Recursion
type: concept
---

## The two composition rules

All code analysis reduces to two rules:

1. **Sequence → add.** Statements one after another cost the sum of their
   costs; the dominant term wins.
2. **Nesting → multiply.** Code inside a loop costs (iterations) × (cost per
   iteration).

Everything below is these two rules applied carefully — the errors all come
from *miscounting iterations* or *mispricing the body*.

## Loops that don't step by one

The reflex "loop = O(n)" is only right when the loop variable moves by a
constant. Count what actually happens:

````tabs
```python
# A: i doubles — how many iterations?
i = 1
while i < n:
    do_something()  # O(1)
    i *= 2

# B: two sequential loops
for i in range(n):      # O(n)
    do_something()
for j in range(n):      # O(n)
    do_something()

# C: nested, dependent bound
for i in range(n):
    for j in range(i):  # j runs i times, not n times
        do_something()
```

```typescript
// A: i doubles — how many iterations?
for (let i = 1; i < n; i *= 2) {
  doSomething(); // O(1)
}

// B: two sequential loops
for (let i = 0; i < n; i++) doSomething(); // O(n)
for (let j = 0; j < n; j++) doSomething(); // O(n)

// C: nested, dependent bound
for (let i = 0; i < n; i++) {
  for (let j = 0; j < i; j++) {
    // j runs i times, not n times
    doSomething();
  }
}
```
````

**A** runs until 2^k ≥ n, i.e. k = log₂ n iterations → **O(log n)**. Any
loop that multiplies or divides its counter by a constant is logarithmic —
this is the code-shape of "discard a constant fraction."

**B** is O(n) + O(n) = **O(n)**. Sequential loops add; they don't multiply.
"There are two loops so it's n²" is exactly the confusion the rules prevent —
multiplication requires *nesting*.

**C**'s inner loop runs 0, 1, 2, …, n−1 times: total = n(n−1)/2 →
**O(n²)**. Dependent bounds don't save you from quadratic; they halve the
constant, which O discards. (This triangular sum reappears constantly —
e.g. "process all pairs" is exactly it.)

## Price the body honestly

The multiply rule needs the *real* cost of the body — including hidden work
inside library calls:

````tabs
```python
result = []
for word in words:          # n iterations
    if target in result:    # 'in' on a LIST scans it: O(len) each time!
        break
    result.append(word)
```

```typescript
const result: string[] = [];
for (const word of words) {          // n iterations
  if (result.includes(target)) break; // .includes scans the array: O(len)!
  result.push(word);
}
```
````

That "one line" membership test is a linear scan, making the loop O(n²).
The fix — a set — is the opening move of the Hash Tables module. Until you
know a call's cost, you can't price any loop that contains it; that's why
every structure module in this course leads with an operation-cost table.

## Recursion: recurrences and the tree method

A recursive function's cost is a **recurrence** — cost at size n expressed
via cost at smaller sizes. The reliable way to solve one is to draw the
**recursion tree** and total the work per level.

**Halve and recurse once** — binary search: T(n) = T(n/2) + O(1). The tree
is a single path of depth log n, O(1) at each step → **O(log n)**.

**Split, recurse twice, merge** — merge sort: T(n) = 2T(n/2) + O(n). Level
0 does n work; level 1 has two halves totaling n; level 2 four quarters
totaling n… every one of the log n levels totals n → **O(n log n)**. The
per-level total staying flat is *why* the answer is n · log n.

**Branch twice without shrinking fast** — naive Fibonacci:
T(n) = T(n−1) + T(n−2) + O(1). The tree doubles nearly every level and is n
levels deep → **O(2ⁿ)**-ish (Θ(φⁿ) precisely). Exponential blowups in
recursion come from *re-solving the same subproblems* — count the distinct
subproblems (here only n of them!) and you've discovered why memoization
(Stage 4) collapses this to O(n).

```quiz
{
  "questions": [
    {
      "question": "What is the complexity?\n`for (i = 0; i < n; i++) { for (j = 1; j < n; j *= 3) { work(); } }`",
      "options": ["O(n²)", "O(n log n)", "O(n)"],
      "answer": 1,
      "explanation": "Outer loop: n iterations. Inner loop multiplies by 3, so log₃ n iterations. Nesting multiplies: O(n log n)."
    },
    {
      "question": "A loop runs n times; its body calls a helper that is O(n), followed by a separate O(n) loop after it. Total?",
      "options": [
        "O(n) + O(n) = O(n)",
        "O(n²) — the nested part dominates the sequential part",
        "O(n³)"
      ],
      "answer": 1,
      "explanation": "Loop × body = n · n = O(n²); the trailing loop adds O(n). Sum: O(n² + n) = O(n²)."
    },
    {
      "question": "Why is naive recursive Fibonacci exponential while merge sort's two-way recursion is only O(n log n)?",
      "options": [
        "Fibonacci's branches barely shrink the problem (n−1, n−2), so the tree is n levels deep with ~doubling width; merge sort halves, giving only log n levels",
        "Merge sort's recursion is tail-recursive",
        "Fibonacci does more work per call"
      ],
      "answer": 0,
      "explanation": "Both branch twice. What differs is depth: halving → log n levels of flat total work; shrinking by 1 → n levels of doubling width. How fast subproblems shrink controls everything."
    }
  ]
}
```
