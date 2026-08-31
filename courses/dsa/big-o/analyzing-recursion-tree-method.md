---
title: "Analyzing Recursion: The Tree Method"
type: concept
---

## The office hierarchy

Now imagine you are the manager of the post office, and a giant task
arrives. Instead of doing it yourself, you divide the task and delegate
work to subordinate clerks, who each do the same with *their* assistants,
creating a branching pyramid of effort throughout the office hierarchy.
This is a fundamentally different shape than the clerk's repetitive floor
tasks from the last lesson — there's no loop to count. Instead, the total
work is every delegated piece added back up, however many layers deep the
delegation goes.

A recursive function calls itself on smaller inputs, so its total cost is
a **recurrence** — cost at size n expressed in terms of cost at smaller
sizes. Draw every call as a node in a tree — the top call is the root,
each recursive call is a child — and the total work is every node's cost,
added up. Three shapes cover almost everything you'll meet.

## Halve and recurse once — O(log n)

**The single-chain search.** A massive crate of packages arrives, and you
need to locate one specific golden package. Instead of doing it yourself,
you split the crate in half, figure out which half contains the package,
and hand off the entire task to a subordinate — they do the same, passing
only half the pile onward each time. At any depth of the delegation, only
one person is doing a quick check and the pile size shrinks very fast.

This is binary search: T(n) = T(n/2) + O(1). The tree is a single chain,
one child per node: n → n/2 → n/4 → … → 1. That's log n steps, O(1) work
at each → **O(log n)**.

## Split, recurse twice, merge — O(n log n)

**The active pyramid.** You have a pile of letters to sort. Instead of
doing it yourself, you split the pile in half and hand both halves to two
assistants, who split *their* piles and pass them onward once each. Once
the sub-piles are sorted and sent back up, you merge every pair of sorted
piles back into one. Every single worker in the hierarchy is active, and
if you sum the total effort of physical actions performed across all
levels of the pyramid, it is actually proportional to the number of
letters in the original crate, and your desk only needs a tiny stack of
delegation cards.

This is merge sort: T(n) = 2T(n/2) + O(n). Now each level *branches*, but
also does less work per node — and the two balance out:

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

## Branch twice without shrinking fast — O(2ⁿ)

**The exploding staff.** Now imagine you have a task, but to solve a task
of difficulty n, you must call up two assistants and delegate a task of
difficulty n−1 to one and n−2 to the other. Because the difficulty of
workers doubles at every single level, and the pyramid of workers grows
almost as fast as it shrinks depth-wise, everyone ends up re-scanning and
re-solving the same small sub-tasks over and over again.

Naive Fibonacci: T(n) = T(n−1) + T(n−2) + O(1). Here the subproblem barely
gets smaller (n−1, not n/2), so the tree stays almost as wide as it is
deep. Watch what actually happens computing `fib(4)` with no memoization —
every node is a real function call:

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

**The shared bulletin board.** As soon as any worker calculates a solution
for a task of a given difficulty level, they pin the answer on a shared
office bulletin board. Now, as soon as any worker is handed a task, they
first walk over and check the board — if the answer is already there,
they grab it instantly instead of redoing the work. That single board is
the whole idea of memoization and dynamic programming.

Watch the tree grow call by call, in the exact order the real call stack
unwinds — every red flash is a subproblem being solved again from
scratch:

```viz
{ "id": "fib-call-tree", "n": 4 }
```

Notice what separates the three shapes: it was never *how many* branches
a call makes — merge sort and Fibonacci both branch twice per call. It's
how fast the input shrinks. Halving gives log n levels; subtracting a
constant gives n levels. Depth, not branching factor, decides whether you
get a flat n log n or an exploding 2ⁿ.

```quiz
{
  "questions": [
    {
      "question": "Binary search's recurrence is T(n) = T(n/2) + O(1). How many levels does its call tree have, and what's the total cost?",
      "options": [
        "n levels, O(n) total — each recursive call peels off one element, so the tree needs one level per element in the input",
        "log n levels, O(log n) total — the tree is a single chain, one child per node, and each level does O(1) work",
        "log n levels, O(n log n) total — like merge sort, each level does O(n) work summed across that level's nodes, and there are log n levels"
      ],
      "answer": 1,
      "explanation": "The tree is a chain, not a branching structure: n → n/2 → n/4 → … → 1 is log n steps, and each step does only O(1) work. Total: O(log n)."
    },
    {
      "question": "Merge sort's recurrence is T(n) = 2T(n/2) + O(n). Why does the total work come out to O(n log n) rather than O(n) or O(2ⁿ)?",
      "options": [
        "Because each of the log n levels does a total of O(n) work — twice as many subproblems, each half the size, so the per-level total stays flat, and log n such levels multiply to n log n",
        "Because the tree branches twice per node, and any recursion that branches more than once is exponential by definition, giving roughly 2 to the log n power",
        "Because merging two sorted halves takes O(log n) time using an internal binary search, and that log n cost multiplies with the n elements processed overall"
      ],
      "answer": 0,
      "explanation": "Branching twice isn't automatically exponential — Fibonacci's blowup comes from barely shrinking the subproblem, not from branching twice. Merge sort halves, so each level's work stays flat at O(n), and there are only log n levels."
    },
    {
      "question": "Why is naive recursive Fibonacci exponential while merge sort's two-way recursion is only O(n log n)?",
      "options": [
        "Fibonacci does more work per call — each call performs extra arithmetic that merge sort's calls skip, so the per-node cost compounds across the recursion tree",
        "Merge sort's recursion is tail-recursive, so the runtime collapses each recursive call into a loop with no extra stack frames or repeated work, unlike Fibonacci's stacked calls",
        "Fibonacci's branches barely shrink the problem (n−1, n−2), so the tree is n levels deep with ~doubling width; merge sort halves, giving only log n levels"
      ],
      "answer": 2,
      "explanation": "Both branch twice. What differs is depth: halving → log n levels of flat total work; shrinking by 1 → n levels of doubling width. How fast subproblems shrink controls everything."
    }
  ]
}
```
