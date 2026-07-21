---
title: Analyzing Loops & Recursion
type: concept
---

## Why "count the loops" isn't enough

Look at these two fragments. Both have "two loops." One is O(n), the other
is O(n²):

```text
for i in range(n):        for i in range(n):
    do_something()            for j in range(n):
for j in range(n):                do_something()
    do_something()
```

The reflex "two loops means n²" is wrong for the left one and right for the
right one — and if you can't tell why just by looking, you can't trust your
own complexity claims. The difference isn't the *number* of loops; it's
whether one is **inside** the other. That's the whole chapter, reduced to
two rules:

1. **Sequence → add.** Statements one after another — including two loops
   back to back — cost the *sum* of their costs; the dominant term wins.
2. **Nesting → multiply.** Code *inside* a loop costs (iterations) × (cost
   per iteration).

The left fragment is two separate loops: O(n) + O(n) = O(n). The right one
is one loop inside another: O(n) × O(n) = O(n²). Same "two loops," opposite
shape, opposite answer. Every mistake below comes from *miscounting
iterations* or *mispricing the body* — never from anything more exotic.

## Loops that don't step by one

The reflex "loop = O(n)" is only right when the loop variable moves by a
constant each time. When it doesn't, you have to actually count:

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

**A.** `i` starts at 1 and doubles each pass: 1, 2, 4, 8, …, 2^k — until it
reaches `n`. So the real question is "how many doublings to reach n?" For
`n = 8`: 1→2→4→8 is 3 doublings, and that's exactly what log₂8 = 3 means.
In general the loop runs k times where 2^k ≥ n, i.e. **k = log₂n →
O(log n)**. Any loop that multiplies or divides its counter by a constant
is logarithmic — this is the code-shape of "discard a constant fraction
each step."

**B** is O(n) + O(n) = **O(n)** — the exact case from the top of this
chapter. Sequential loops add; they don't multiply. Multiplication
requires *nesting*, and B has none.

**C**'s inner loop runs i times on pass i, so the total across all passes
is 0 + 1 + 2 + ⋯ + (n−1). Pair the smallest and largest: 0+(n−1),
1+(n−2), 2+(n−3), … — every pair sums to exactly n−1, and there are n/2
pairs, so the total is n/2 × (n−1) = **n(n−1)/2 → O(n²)**. Sanity-check
with n = 4: 0+1+2+3 = 6, and 4·3/2 = 6. ✓ A dependent bound like this
doesn't save you from quadratic — it only halves the constant, and O
notation throws constants away. (This triangular sum reappears constantly:
"process all pairs of n things" is exactly this shape.)

## Price the body honestly

The multiply rule needs the *real* cost of the body — including hidden
work inside library calls that look like one line:

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

That "one line" membership test is a linear scan over a list that can grow
to length n — n iterations × O(n) per check = **O(n²)**, even though
nothing here *looks* like a nested loop. The fix — a set, whose membership
test is O(1) — is the opening move of the Hash Tables module. Until you
know a call's real cost, you can't price any loop that contains it; that's
why every structure module in this course leads with an operation-cost
table.

## Recursion: recurrences and the tree method

A recursive function calls itself on smaller inputs, so its total cost is
a **recurrence** — cost at size n expressed in terms of cost at smaller
sizes. Draw every call as a node in a tree (the top call is the root; each
recursive call is a child); the total work is every node's cost, added up.
Three shapes cover almost everything you'll meet.

**Halve and recurse once** — binary search: T(n) = T(n/2) + O(1). The tree
is a single chain, one child per node: n → n/2 → n/4 → … → 1. That's log n
steps, O(1) work at each → **O(log n)**.

**Split, recurse twice, merge** — merge sort: T(n) = 2T(n/2) + O(n). Now
each level *branches*, but also does less work per node — and the two
balance out:

| Level | Subproblems | Size each | Work per level |
| --- | --- | --- | --- |
| 0 | 1 | n | n |
| 1 | 2 | n/2 | n |
| 2 | 4 | n/4 | n |
| … | … | … | … |
| log n | n | 1 | n |

Every level totals **n**, and there are log n levels, so the grand total
is n · log n → **O(n log n)**. The per-level total staying flat — not
growing, not shrinking — is *why* the answer is n times log n and not
just n or just log n.

**Branch twice without shrinking fast** — naive Fibonacci:
T(n) = T(n−1) + T(n−2) + O(1). Here the subproblem barely gets smaller
(n−1, not n/2), so the tree stays almost as wide as it is deep. Watch what
actually happens computing `fib(4)` with no memoization — every node is a
real function call:

```text
fib(4)
├─ fib(3)
│  ├─ fib(2)
│  │  ├─ fib(1)
│  │  └─ fib(0)
│  └─ fib(1)
└─ fib(2)
   ├─ fib(1)
   └─ fib(0)
```

`fib(2)` gets computed twice, `fib(1)` three times, `fib(0)` twice — 9
calls total to answer one question with only 5 distinct inputs (0
through 4). That's the whole story of the blowup: the tree doubles nearly
every level and is n levels deep → **O(2ⁿ)**-ish (Θ(φⁿ) precisely, where
φ ≈ 1.618 is the golden ratio — the exact constant rarely matters, only
that it's exponential). Exponential recursion always comes from
*re-solving the same subproblems*, and you can see it directly in the
tree: count the distinct subproblems (here, only 5 — one per value of n)
and you've already discovered why memoization (Stage 4) collapses this to
O(n): compute each distinct subproblem once, reuse it everywhere it
repeats.

Watch the tree grow call by call, in the exact order the real call stack
unwinds — every red flash is a subproblem being solved again from
scratch:

```viz
{ "id": "fib-call-tree", "n": 4 }
```

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
