---
title: Analyzing Loops & API Complexity
type: concept
---

## The clerk's repetitive floor tasks

Back on the sorting floor, the clerk's daily tasks are almost all
repetitive physical actions performed on stacks of letters and packages.
Watching exactly how those tasks are structured turns out to predict how
the clerk's whole day scales.

**Two separate tasks.** First, you have a task where you must apply a
stamp to each of the letters in a stack. After you finish that, you have a
separate task to scan each of the packages in a cart. Because these tasks
happen one after another, your total effort is simply the *sum* of the
two stacks.

**Box inside box.** But now, you are given a crate containing some number
of shipping boxes. Inside each shipping box, there are several individual
parcel slots, and you must place a custom shipping label on every single
item inside every box. Here, your work *multiplies*: for every box you
open, you must perform a full round of labeling. The effort is the number
of boxes times the items per box.

This is the whole chapter, reduced to two rules. Look at these two code
fragments. Both have "two loops." One is O(n), the other is O(n²):

```text
for i in range(n):        for i in range(n):
    do_something()            for j in range(n):
for j in range(n):                do_something()
    do_something()
```

The reflex "two loops means n²" is wrong for the left one and right for the
right one — and if you can't tell why just by looking, you can't trust your
own complexity claims. The difference isn't the *number* of loops; it's
whether one is **inside** the other:

1. **Sequence → add.** Statements one after another — including two loops
   back to back — cost the *sum* of their costs; the dominant term wins.
   This is the stamps stack followed by the scan cart.
2. **Nesting → multiply.** Code *inside* a loop costs (iterations) × (cost
   per iteration). This is the box inside a box.

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

**A. The half-step jumps.** Suppose instead of checking every single
package in order, you inspect package 1, then package 2, then package 4,
then package 8, doubling your step each time. You will finish your
inspection incredibly fast because the number of checks scales
logarithmically with the pile size. `i` starts at 1 and doubles each pass:
1, 2, 4, 8, …, 2^k — until it reaches `n`. So the real question is "how
many doublings to reach n?" For `n = 8`: 1→2→4→8 is 3 doublings, and
that's exactly what log₂8 = 3 means. In general the loop runs k times
where 2^k ≥ n, i.e. **k = log₂n → O(log n)**. Any loop that multiplies or
divides its counter by a constant is logarithmic.

**B** is O(n) + O(n) = **O(n)** — the exact case from the top of this
chapter. Sequential loops add; they don't multiply. Multiplication
requires *nesting*, and B has none.

**C. The shrinking pile.** What if you check a stack of letters to make
sure no people have the exact same address? You take the first letter and
compare it to the remaining letters below it. Then you take the second
letter and compare it to the letters below it, and so on. Even though your
comparison piles shrink with each step, the total number of hand-comparisons
you make still scales as the square of the stack size — this shrinking-pile
strategy doesn't save you from heavy quadratic growth. C's inner loop runs
i times on pass i, so the total across all passes is 0 + 1 + 2 + ⋯ + (n−1).
Pair the smallest and largest: 0+(n−1), 1+(n−2), 2+(n−3), … — every pair
sums to exactly n−1, and there are n/2 pairs, so the total is n/2 × (n−1)
= **n(n−1)/2 → O(n²)**. Sanity-check with n = 4: 0+1+2+3 = 6, and 4·3/2 =
6. ✓ A dependent bound like this doesn't save you from quadratic — it only
halves the constant, and O notation throws constants away. (This
triangular sum reappears constantly: "process all pairs of n things" is
exactly this shape.)

## Price the body honestly

**The hidden scroll scan.** Finally, imagine you are processing a cart of
packages. For each package, you quickly write down its ID, but you also
have to check if the destination country is on a restricted list. The
catch is, to do this "quick check," you have to roll the scroll from top
to bottom, scanning every entry every single time. Though your main task
looks like a simple single loop of work, the hidden cost of scanning that
paper scroll at every single step is what actually determines your true
effort.

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
nothing here *looks* like a nested loop. This is the trap that matters
most in practice: modern languages hide loops inside method calls
(`.includes`, slicing, string concatenation, `in` on a list) so freely that
"no visible nesting" stops being proof of anything.

If instead you replaced that paper scroll with a direct-lookup slot
board — the same mail lookup shelves from the last lesson — checking the
restricted list would cost the same single glance every time, no matter
how long the list gets. The fix — a set, whose membership test is O(1) —
is the opening move of the Hash Tables module. Until you know a call's
real cost, you can't price any loop that contains it; that's why every
structure module in this course leads with an operation-cost table.

```quiz
{
  "questions": [
    {
      "question": "What is the complexity?\n`for (i = 0; i < n; i++) { for (j = 1; j < n; j *= 3) { work(); } }`",
      "options": [
        "O(n log n)",
        "O(n) — the inner loop's multiplicative step means it only touches a handful of values before exiting, so its cost is dominated by the outer loop alone",
        "O(n²) — any loop nested inside another loop multiplies the outer's n iterations by another full n, regardless of how the inner loop's counter moves"
      ],
      "answer": 0,
      "explanation": "Outer loop: n iterations. Inner loop multiplies by 3, so log₃ n iterations. Nesting multiplies: O(n log n)."
    },
    {
      "question": "A loop runs n times; its body calls a helper that is O(n), followed by a separate O(n) loop after it. Total?",
      "options": [
        "O(n³) — the O(n) helper called inside an n-iteration loop should multiply with the trailing O(n) loop as well, since all three linear factors compound together",
        "O(n) + O(n) = O(n) — treating the whole snippet as two independent linear passes back to back, as if the helper call inside the loop didn't also scale with n",
        "O(n²) — the nested part dominates the sequential part"
      ],
      "answer": 2,
      "explanation": "Loop × body = n · n = O(n²); the trailing loop adds O(n). Sum: O(n² + n) = O(n²)."
    }
  ]
}
```

The next lesson does this same pricing exercise for code that calls
itself — recurrences and the tree method, where "how many levels" replaces
"how many iterations."
