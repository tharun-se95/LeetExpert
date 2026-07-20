---
title: Two Sum II (Sorted Input)
type: problem
---

## Problem

Given a **1-indexed, sorted** array and a target, return the indices of
the two numbers summing to target. Exactly one solution exists. Required:
**O(1) extra space** (which rules out Module 6's hash map).

**Examples**

```text
numbers = [2,7,11,15], target = 9   →  [1,2]
numbers = [2,3,4],     target = 6   →  [1,3]
numbers = [-1,0],      target = -1  →  [1,2]
```

**Constraints:** 2 ≤ n ≤ 3·10⁴ · sorted non-decreasing · exactly one
answer.

## Attempt it first

The converging lesson used this exact problem to build the elimination
argument — so the test here is whether you can reproduce the *proof*,
not just the loop. Write the solution AND, in a comment, the one-sentence
reason each pointer move is safe. Then compare.

````reveal Hint — restate the elimination
Sum at the ends too big ⇒ right's SMALLEST possible partner already
overshoots ⇒ right can't be in any pair ⇒ discard it. Too small ⇒
mirror argument for left. Equal ⇒ done (uniqueness).
````

## Brute force, for contrast

All pairs O(n²), or Module 6's hash map at O(n) time / O(n) space. The
map version ignores sortedness entirely — it solves a harder problem
(unsorted) and pays memory for the generality. This problem is the
cleanest example of a constraint (*sorted*) being a **gift**: exploit it
and the auxiliary structure evaporates.

## Solution

`````reveal Solution — converge with proof attached
````tabs
```python
def two_sum_sorted(numbers: list[int], target: int) -> list[int]:
    left, right = 0, len(numbers) - 1
    while left < right:
        s = numbers[left] + numbers[right]
        if s == target:
            return [left + 1, right + 1]      # 1-indexed answer
        if s < target:
            left += 1     # even with the LARGEST remaining partner,
                          # numbers[left] undershoots — dead
        else:
            right -= 1    # even with the SMALLEST remaining partner,
                          # numbers[right] overshoots — dead
    return []             # unreachable: exactly one solution promised
```

```typescript
function twoSumSorted(numbers: number[], target: number): number[] {
  let left = 0;
  let right = numbers.length - 1;
  while (left < right) {
    const s = numbers[left] + numbers[right];
    if (s === target) return [left + 1, right + 1]; // 1-indexed
    if (s < target) {
      left++; // largest remaining partner still undershoots — dead
    } else {
      right--; // smallest remaining partner still overshoots — dead
    }
  }
  return []; // unreachable: exactly one solution promised
}
```
````

One subtlety the comments encode: the elimination compares against the
largest/smallest **remaining** partner, not the global extremes — which
works because everything outside [left, right] was already proven dead,
so the current window's ends ARE the live extremes. The invariant
sustains itself; that's what makes the induction go through. Trace it on
the first example:

```viz
{ "id": "converging-pointers", "data": [2, 7, 11, 15], "target": 9 }
```

```complexity
{
  "time": "O(n)",
  "space": "O(1)",
  "why": "Each iteration retires one index permanently; at most n − 1 iterations. Two integer indexes of state — the constraint's demand, met."
}
```
`````

## Variants

- **Unsorted:** hash map (Module 6) — or sort first at O(n log n),
  losing original indices (you'd need to carry them — usually the map
  is better).
- **Count pairs with sum < target / closest sum:** same walk; on each
  comparison, a whole RANGE of pairs is countable at once
  (`right − left` pairs share this left) — elimination doubling as
  bulk counting.
- **3Sum** (two problems ahead): this exact loop as the inner engine.

```quiz
{
  "question": "The elimination says 'right's smallest possible partner overshoots.' Why is numbers[left] — not the global minimum — the right value to reason with?",
  "options": [
    "It's an approximation that happens to work",
    "All indexes below left were already eliminated with proofs of their own, so within the live window [left, right], numbers[left] IS the minimum — the invariant makes the local extreme globally sufficient",
    "Because the array is 1-indexed"
  ],
  "answer": 1,
  "explanation": "The induction leans on itself: past eliminations guarantee the window's ends are the true remaining extremes, which powers the next elimination. This self-sustaining structure is what 'loop invariant' means in practice."
}
```
