---
title: Candy
type: problem
---

## Problem

`n` children stand in a line, each with a `rating[i]`. You must give
each child at least 1 candy, and any child with a **higher rating than
an immediate neighbor** must receive **more candies than that
neighbor**. Return the minimum total candies needed. (LeetCode 135.)

**Examples**

```examples
ratings = [1,0,2] → 5  (candies [2,1,2])
ratings = [1,2,2] → 4  (candies [1,2,1]; equal neighbors need not differ)
```

```constraint
`1 ≤ n ≤ 2·10⁴`.
```

## Attempt it first

This is the module's capstone because the constraint applies **in both
directions simultaneously** — a child's candy count depends on
comparisons with the neighbor to their LEFT and the neighbor to their
RIGHT independently. Before opening anything, try to convince yourself
of something specific: why can't a single left-to-right pass alone get
this right? Construct (mentally or on paper) a small ratings array
where a purely-left-to-right greedy assignment gives a WRONG answer
because it never looked back after the fact to the right-side
constraint, and think about what a second pass would need to do to fix
it.


```sandbox
{
  "id": "candy",
  "fn": { "python": "candy", "javascript": "candy" },
  "check": "return",
  "starter": {
    "python": "def candy(ratings):\n    # Return the minimum total candies satisfying both neighbours.\n    pass\n",
    "javascript": "function candy(ratings) {\n  // Return the minimum total candies satisfying both neighbours.\n}\n"
  },
  "cases": [
    { "args": [[1, 0, 2]], "expect": 5 },
    { "args": [[1, 2, 2]], "expect": 4 },
    { "args": [[1]], "expect": 1 },
    { "args": [[1, 2, 3, 4, 5]], "expect": 15 },
    { "args": [[5, 4, 3, 2, 1]], "expect": 15 },
    { "args": [[1, 3, 2, 2, 1]], "expect": 7 },
    { "args": [[1, 2, 87, 87, 87, 2, 1]], "expect": 13 }
  ]
}
```

````reveal Hint — two one-directional passes, then take the max at each position
A single pass genuinely cannot satisfy both directions' constraints at
once, because when you're deciding child `i`'s candy count while
scanning left to right, you don't yet know whether child `i+1` will
turn out to need MORE candies than child `i` (which would additionally
constrain child `i`, working against what you already committed to).
The fix: solve the two directions SEPARATELY, each with its own
easy, one-directional greedy pass, then combine.

- **Left-to-right pass:** ensure every child with a higher rating than
  their LEFT neighbor gets more candy than that left neighbor. This
  alone is a simple greedy — if `rating[i] > rating[i-1]`, set
  `left[i] = left[i-1] + 1`; otherwise `left[i] = 1`.
- **Right-to-left pass:** the mirror — ensure every child with a higher
  rating than their RIGHT neighbor gets more candy than that right
  neighbor, exactly the same greedy rule run backward.

Take `max(left[i], right[i])` at every position: this is a candy count
that is simultaneously ≥ what the left-constraint requires AND ≥ what
the right-constraint requires, so both hold at once.
````

## Brute force, for contrast

An iterative "keep re-scanning and bumping violators until nothing
changes" approach — repeatedly walk the array, and whenever a
higher-rated child doesn't have more candy than a neighbor, bump their
count and mark that a change happened; repeat until a full pass makes no
changes — is correct but has no clean worst-case bound: a single
violation can require its correction to propagate arbitrarily far down
the line, and the number of full re-scans needed isn't obviously
bounded by a small constant. It is included only to make explicit why a
single pass isn't naturally sufficient; the two-pass solution below
achieves the same corrected result deterministically, in exactly two
passes, with no iteration-until-fixed-point uncertainty.

## The insight: why a single pass can't work, and why max(left, right) does

Try a purely left-to-right greedy on `ratings = [1, 2, 2, 1]` (mentally
tracing it): at index 1 (`rating = 2 > 1`), you'd give more candy than
index 0. At index 2 (`rating = 2`, tied with index 1), no constraint
from the left. At index 3 (`rating = 1 < 2`), the LEFT-only rule says
nothing (this rule only fires when the current rating is HIGHER than
the previous). But index 3 has a lower rating than index 2, which means
index 2 must have MORE candy than index 3 — a constraint that only
becomes visible when looking rightward from index 2, something a
purely-left-to-right pass has already finished deciding by the time it
would matter.

Running two independent one-directional passes sidesteps this entirely:
each pass only needs to satisfy constraints in ITS OWN direction, which
is a simple, provably-correct greedy on its own (identical in spirit to
Jump Game's single-direction reachability tracking). Taking the
elementwise max of the two results then guarantees BOTH sets of
constraints hold simultaneously, since each position's final count is
never less than what either direction independently required.

## Solution

`````reveal Solution — left pass, right pass, combine with max
````tabs
```python
def candy(ratings: list[int]) -> int:
    n = len(ratings)
    left = [1] * n
    for i in range(1, n):
        if ratings[i] > ratings[i - 1]:
            left[i] = left[i - 1] + 1        # higher than left neighbor → more than them

    right = [1] * n
    for i in range(n - 2, -1, -1):
        if ratings[i] > ratings[i + 1]:
            right[i] = right[i + 1] + 1      # higher than right neighbor → more than them

    return sum(max(left[i], right[i]) for i in range(n))
```

```typescript
function candy(ratings: number[]): number {
  const n = ratings.length;
  const left = new Array(n).fill(1);
  for (let i = 1; i < n; i++) {
    if (ratings[i] > ratings[i - 1]) {
      left[i] = left[i - 1] + 1; // higher than left neighbor → more than them
    }
  }

  const right = new Array(n).fill(1);
  for (let i = n - 2; i >= 0; i--) {
    if (ratings[i] > ratings[i + 1]) {
      right[i] = right[i + 1] + 1; // higher than right neighbor → more than them
    }
  }

  let total = 0;
  for (let i = 0; i < n; i++) {
    total += Math.max(left[i], right[i]);
  }
  return total;
}
```
````

Each pass is a direct, single-direction greedy — no lookahead, no
backtracking — because within one pass, only ONE side's constraint is
being enforced, and that constraint only ever depends on the
immediately preceding element in the direction of the scan. The `max`
combination at the end is what reconciles the two independently-correct
partial answers into one answer correct for both directions at once.

```complexity
{
  "time": "O(n)",
  "space": "O(n)",
  "why": "Three linear passes (left-to-right build, right-to-left build, and the final max-and-sum) each visit every index a constant number of times, giving O(n) total. Space is O(n) for the two auxiliary arrays — this can be reduced to O(1) by folding the right-to-left pass and the summation into one combined backward pass that only needs the previous right[i+1] value and running total, but the two-array version is shown for clarity of the two separate constraints."
}
```
`````

## Variants

- **Trapping Rain Water** (Module 10): a strikingly similar shape — a
  quantity at each position determined by the max of a
  left-to-right-computed value and a right-to-left-computed value
  (there, the tallest wall seen from each direction; here, the
  candy count required from each direction). Worth comparing the two
  solutions directly to see the shared "two one-directional sweeps,
  combine with max/min" technique.
- **Jump Game / Jump Game II** (this module): single-direction greedy
  sweeps on their own — useful as the simpler building block this
  problem composes two of.
- **The Greedy Choice Property & Proving Correctness** (concept lesson,
  this module): each one-directional pass individually satisfies the
  exchange-argument style proof from that lesson; the insight specific
  to THIS problem is recognizing that two such proofs, run
  independently and then combined with max, together satisfy a
  bidirectional constraint that neither proof alone could.

```quiz
{
  "question": "Why does taking max(left[i], right[i]) at every position correctly satisfy BOTH the left-neighbor and right-neighbor candy constraints simultaneously, rather than needing some more complex reconciliation between the two passes?",
  "options": [
    "max works only because ratings are compared, not the actual candy counts — since the left and right passes both derive their increments from rating comparisons rather than raw candy values, taking the max of two rating-derived numbers happens to preserve correctness in a way that wouldn't hold if candy counts were computed some other way",
    "left[i] alone already guarantees the left-neighbor constraint holds (it's not affected by whatever value is chosen for right[i]), and right[i] alone already guarantees the right-neighbor constraint holds independently; since max(left[i], right[i]) is always ≥ both left[i] and right[i], the final count is never LESS than either independently-sufficient value, so both constraints remain satisfied by the larger of the two",
    "It doesn't fully work in general — max only happens to work for the specific examples shown here; a longer or differently-shaped ratings array could produce a case where max(left[i], right[i]) falls short of one of the two individual constraints"
  ],
  "answer": 1,
  "explanation": "Each one-directional constraint (e.g. 'more candy than my left neighbor if my rating is higher') is a LOWER BOUND on a child's candy count relative to one specific neighbor. left[i] is a value already proven to satisfy the left-side lower bound; right[i] already satisfies the right-side lower bound. Taking the max doesn't weaken either bound — a value that is ≥ a lower bound is still ≥ that lower bound even if it came from satisfying a DIFFERENT lower bound at the same time. That's precisely what makes combining two independently-correct one-directional solutions with max produce a jointly-correct bidirectional solution, without needing to re-verify anything from scratch."
}
```
