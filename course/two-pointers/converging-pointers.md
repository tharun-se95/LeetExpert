---
title: Converging Pointers
type: concept
---

## Stage 2 begins: techniques, not structures

Stages 0–1 built containers. Stage 2 is about **algorithms over them** —
and every technique in this stage does the same economic trick: it finds
a reason to *skip work* that brute force would do, and proves the
skipping safe. For two pointers, the brute force being beaten is the
**all-pairs scan**: C(n,2) ≈ n²/2 pairs (Math module), O(n²) time. The
technique collapses it to O(n) — when a certain precondition holds.

## The shape

Two indexes start at opposite ends and walk toward each other. Each step
examines the pair (left, right) and moves exactly one pointer inward.
They meet after at most n − 1 total moves — that's the O(n) bound,
unconditionally. Derive it directly: the gap `right − left` starts at
`n − 1` and every step shrinks it by exactly 1 (one pointer moves one
slot), so the loop can run at most `n − 1` times before `left ≥ right`
forces it to stop — no case analysis needed, just watching one number
count down. You saw the *mechanical* version in Module 4 (reverse:
swap and move both) and Module 5 (palindrome: compare and move both).
What's new in this module is the **decision** version: at each step,
*choose* which pointer to move — and that choice is where all the
intellectual content lives.

## The elimination argument

Why can moving one pointer be safe? Picture a shelf of price tags sorted
low to high, and two shoppers with a fixed budget hunting for two items
that add up to it exactly — one shopper starts at the cheapest item, the
other at the priciest, and they work toward each other. Consider the
sorted-array pair-sum problem (Two Sum II): find two values summing to
`target` in a sorted array. Look at the pair at the ends:

```text
sorted:  [2, 7, 11, 15, 21]      target = 22
          L               R      sum = 2 + 21 = 23 > target
```

The sum is too big. Now the key claim: **21 can never be in any answer
pair** — its smallest possible partner is 2 (the array's minimum), and
even that overshoots. Every pair containing R is ≥ the pair we just
tested. So `right -= 1` doesn't just move on; it **eliminates all n−1
pairs involving index R** in one step, provably losing nothing — the
shopper at the pricey end can walk away from that item entirely, because
even pairing it with the single cheapest item on the whole shelf already
blows the budget, so no other pairing could possibly work either.
Symmetrically, when the sum is too small, L's *largest* possible partner
(the current R, since everything bigger was already eliminated) still
undershoots — L is dead, `left += 1`, and the cheap-end shopper moves on
for the same reason in reverse.

Finish this trace to see the elimination actually converge on the
answer: **Step 2** — `R` moved to 15 (`sum = 2 + 15 = 17 < 22`, now too
small — `L` is dead by the same argument, `left += 1`). **Step 3** —
`L` moved to 7: `sum = 7 + 15 = 22`, a match, returning indices
`(1, 3)`. Two eliminations, three comparisons total, against
`C(5,2) = 10` pairs a brute force would have checked.

Count what happened: each step retires one index and all its unexplored
pairs. n steps retire all n²/2 pairs. That's the whole speedup — **batch
elimination with a proof**, not clever iteration. And notice the
precondition doing the work: **sortedness** is what let us know the
minimum and maximum possible partners without looking. No sortedness (or
a sortedness-like monotone structure) → no elimination argument → the
technique silently degrades into a heuristic that misses answers. Step
through the exact example above and watch the counter — every pointer
move is a batch of pairs dying with a proof:

```viz
{ "id": "converging-pointers", "data": [2, 7, 11, 15, 21], "target": 22 }
```

## The template

````tabs
```python
def converge(arr: list[int], target: int):
    left, right = 0, len(arr) - 1
    while left < right:
        current = evaluate(arr[left], arr[right])
        if current == target:
            return left, right           # or record and keep going
        if current < target:
            left += 1                    # left is dead: eliminate it
        else:
            right -= 1                   # right is dead: eliminate it
    return None
```

```typescript
function converge(arr: number[], target: number): [number, number] | null {
  let left = 0;
  let right = arr.length - 1;
  while (left < right) {
    const current = evaluate(arr[left], arr[right]);
    if (current === target) return [left, right]; // or record & continue
    if (current < target) {
      left++; // left is dead: eliminate it
    } else {
      right--; // right is dead: eliminate it
    }
  }
  return null;
}
```
````

Three slots vary per problem: what `evaluate` computes, what "dead"
means, and what you do on a hit. The invariant is always the same
sentence, worth memorizing as a *form*:

> **Every pair already eliminated provably cannot beat the answer; the
> answer, if it exists, uses only indexes in [left, right].**

When you face a new converging-pointer problem, your ONLY job is to
instantiate that sentence and prove the elimination step. If you can't
prove it, the technique doesn't apply — and knowing that is as valuable
as the technique. Container With Most Water will stress-test exactly
this: its elimination argument is famous for being *almost* obvious and
regularly believed without proof.

```quiz
{
  "questions": [
    {
      "question": "Converging pointers turn O(n²) pair-search into O(n). Where does the saving actually come from?",
      "options": [
        "Each pointer move eliminates an entire index — and all ~n unexplored pairs involving it — backed by a proof that none of them can be the answer",
        "Each step is faster than a pair-check — comparing two pointer positions and moving one is a cheaper CPU operation than evaluating a full pair sum, so the technique wins purely on lower constant-factor cost per step",
        "The array is only half-scanned — since the two pointers converge toward the middle from opposite ends, each index is visited by only one of them, roughly halving the total elements examined"
      ],
      "answer": 0,
      "explanation": "n steps × n pairs eliminated per step covers all n²/2 pairs. The technique is batch elimination; the proof of safety is the technique. Without the proof you have a fast way to get wrong answers."
    },
    {
      "question": "Why does the elimination argument for sorted pair-sum REQUIRE sortedness?",
      "options": [
        "It doesn't — the technique works unsorted; the elimination proof only needs SOME pair to be compared at each step, and that reasoning holds regardless of what order the underlying array happens to be in",
        "Sorted arrays are faster to index — accessing elements in a sorted array benefits from better cache behavior than an unsorted one, which is what actually accounts for the technique's speed advantage",
        "The argument reasons about an index's best possible partner ('even the minimum overshoots') — sortedness is what makes the ends the extremes, so one comparison speaks for all pairs at once"
      ],
      "answer": 2,
      "explanation": "One tested pair stands in for many untested ones only if you KNOW the untested ones are all ≥ or ≤ it. Sorted order provides that. On unsorted input, use the hash map (Module 6) or sort first and convert the problem."
    },
    {
      "question": "A converging-pointer solution runs and returns a plausible answer on all your test cases, but you can't articulate why moving the pointer is safe. What do you actually have?",
      "options": [
        "A correct solution — tests passing is evidence enough; an implementation that produces the right output on every test case you threw at it has, by that same evidence, been shown correct on all possible inputs",
        "A heuristic: without the elimination proof, some input may have its true answer eliminated silently, and pair-search bugs are exactly the kind tests miss",
        "A solution that's correct but slow — without a stated elimination proof the algorithm still visits every pair it needs to, it just does so less efficiently than a version with the argument spelled out explicitly"
      ],
      "answer": 1,
      "explanation": "The failure mode of an unproved elimination is a MISSED answer — invisible unless a test happens to have its optimum in the eliminated region. This is why every problem lesson in this module leads with the proof, not the code."
    }
  ]
}
```
