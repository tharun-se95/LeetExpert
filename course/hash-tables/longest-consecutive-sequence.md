---
title: Longest Consecutive Sequence
type: problem
---

## Problem

Given an unsorted array `nums`, return the length of the longest run of
**consecutive integer values** (positions in the array don't matter). You
must run in **O(n)**.

**Examples**

```text
nums = [100,4,200,1,3,2]      →  4    (1,2,3,4)
nums = [0,3,7,2,5,8,4,6,0,1]  →  9    (0..8)
nums = []                      →  0
```

**Constraints:** 0 ≤ n ≤ 10⁵ · values in ±10⁹ · **O(n) required.**

## Attempt it first

This is the module capstone: the required O(n) is the entire puzzle. The
obvious good solution — sort, scan for runs — is O(n log n), and the
problem explicitly bans it. Sit with it for a while; the trick is a new
*kind* of move, and meeting it cold is worth real struggle.

````reveal Hint 1 — what does a set make cheap?
Put everything in a set: now "is value v present?" is O(1). A run of
consecutive values 5,6,7,8 is fully described by: 5 is present, 4 is
NOT, and you can count upward while members exist. What's special about
5 there?
````

````reveal Hint 2 — only start counting at STARTS
v starts a run exactly when v − 1 is absent from the set. If you count
upward ONLY from starts (skip any v whose predecessor exists), how much
total counting work happens across the whole input? Count it the way the
amortized lesson taught — total, not per-element.
````

## Brute force, for contrast

- All-pairs chain-building: O(n²)-ish and messy.
- **Sort and scan runs: O(n log n), O(1) extra — genuinely good**, and
  the answer to give first. The follow-up "can you do O(n)?" is the
  problem's actual content.

## The insight

> A set of all values answers "is v−1 present?" in O(1) — which
> identifies each run's unique STARTING element. Counting upward only
> from starts means every element is stepped on at most twice across the
> entire algorithm (once as a membership probe, once inside its own run's
> upward walk) — a GLOBAL O(n) bound, even though a single start's walk
> can be long. That's amortized-style counting (Big O, lesson 5) doing
> the proof.

## Solution

`````reveal Solution — set + run starts
````tabs
```python
def longest_consecutive(nums: list[int]) -> int:
    values = set(nums)                     # O(n); also dedupes
    best = 0
    for v in values:                       # iterate the SET, not the list
        if v - 1 in values:
            continue                       # not a run start — skip
        length = 1
        while v + length in values:        # walk the run upward
            length += 1
        best = max(best, length)
    return best
```

```typescript
function longestConsecutive(nums: number[]): number {
  const values = new Set(nums); // O(n); also dedupes
  let best = 0;
  for (const v of values) {
    // iterate the SET, not the array
    if (values.has(v - 1)) continue; // not a run start — skip
    let length = 1;
    while (values.has(v + length)) length++; // walk the run upward
    best = Math.max(best, length);
  }
  return best;
}
```
````

The counting argument, spelled out: the `while` loop's total iterations
across ALL starts equal the total length of all runs = number of distinct
values ≤ n. The outer loop adds n membership probes. Total: O(n) average
— even though one run's walk might be length 10⁵ by itself. Per-iteration
bounds would never prove this; only whole-execution accounting does.

Two easy-to-miss details: iterating `values` (not `nums`) keeps
duplicates from re-walking runs; and the start-check makes each run
walked exactly once, from its unique minimum.

```complexity
{
  "time": "O(n) average",
  "space": "O(n)",
  "why": "Set build O(n); outer probes O(n); inner walks total O(n) by the run-length accounting. 'Average' rides on the hash set's O(1) membership — the module's standing premise."
}
```
`````

## Why this problem closes the module

It's the Seen verb pushed to its ceiling: the set isn't just remembering
the past, it's serving as an O(1) oracle over the whole value space,
letting an algorithm ask structural questions ("where do runs start?")
that sorting would have answered at log-factor cost. Trading order for
oracles is the hash table's deepest move.

````reveal Module complete — what carries forward
- **The four verbs** (Seen / Count / Index / Group) are the decision
  procedure for every "use a dict somehow" moment from here on.
- **Canonical keys** return in Sliding Window (window fingerprints) and
  beyond; **value → last index** returns in substring problems.
- The **average-case honesty** (uniform hash + bounded α premises) is
  now yours to quote precisely.
- The from-scratch HashMap gets its two structural cousins soon: ordered
  keys want trees (Module 18), priority wants heaps (Module 19).

**Next: Module 7 — Linked Lists**, where contiguity is finally dropped
and pointers become the data structure.
````

```quiz
{
  "question": "The inner while loop can run 10⁵ iterations for a single start. Why is the algorithm still O(n)?",
  "options": [
    "Because the set makes each iteration O(1) — since each membership check inside the while loop is a constant-time operation, the loop's own iteration count doesn't factor into the overall complexity at all",
    "Total inner iterations across the WHOLE execution are bounded by total run length ≤ n — each value is visited by exactly one run's walk, since runs are walked only from their unique starts",
    "Because that case is rare in random data — a single run of length 10⁵ is an unlikely edge case on typical inputs, so the algorithm's average behavior across realistic test data stays linear"
  ],
  "answer": 1,
  "explanation": "Same accounting style as the dynamic array: bound the SUM, not the step. One expensive walk is paid for by all the elements it consumes — every element is consumed at most once. The start-check is what makes the accounting airtight."
}
```
