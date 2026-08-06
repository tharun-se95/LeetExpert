---
title: Why Efficiency Matters
type: concept
---

## Two correct programs, one useless

Here is a task: given a list of numbers and a target, decide whether any two
of them sum to the target.

Both of these solve it correctly:

````tabs
```python
# Version A — check every pair
def has_pair_a(nums: list[int], target: int) -> bool:
    n = len(nums)
    for i in range(n):
        for j in range(i + 1, n):
            if nums[i] + nums[j] == target:
                return True
    return False


# Version B — remember what we've seen
def has_pair_b(nums: list[int], target: int) -> bool:
    seen = set()
    for x in nums:
        if target - x in seen:
            return True
        seen.add(x)
    return False
```

```typescript
// Version A — check every pair
function hasPairA(nums: number[], target: number): boolean {
  const n = nums.length;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (nums[i] + nums[j] === target) return true;
    }
  }
  return false;
}

// Version B — remember what we've seen
function hasPairB(nums: number[], target: number): boolean {
  const seen = new Set<number>();
  for (const x of nums) {
    if (seen.has(target - x)) return true;
    seen.add(x);
  }
  return false;
}
```
````

For 1,000 numbers, both feel instant. Scale the input and watch what
happens. Version A does roughly n²/2 pair-checks; Version B does n set
operations. Assuming a machine that does about 10⁸ simple operations per
second:

| n | Version A (~n²/2 ops) | Version B (~n ops) |
| --- | --- | --- |
| 1,000 | ~5 ms | ~0.01 ms |
| 100,000 | ~50 s | ~1 ms |
| 10,000,000 | ~6 days | ~0.1 s |

Version A didn't get a little worse — it fell off a cliff. At ten million
elements, one program finishes before you release the Enter key and the
other finishes next week. **Nothing about correctness distinguishes them.
Only their growth behavior does.**

```diagram
{
  "id": "complexity-curve",
  "mode": "compare",
  "leftLabel": "O(n²) pairs",
  "rightLabel": "O(n) hash"
}
```

## Growth beats hardware

The instinctive fix — "run it on a faster machine" — doesn't work, and it's
worth seeing exactly why. Suppose you buy a machine that is 100× faster.
For Version B, you can now handle 100× more data in the same time. For
Version A, doubling your input quadruples the work, so a 100× faster
machine only buys you **10× more data** (because √100 = 10).

The worse the growth, the less hardware helps:

- linear algorithm, 100× faster machine → 100× more data
- quadratic algorithm, 100× faster machine → 10× more data
- exponential algorithm (2ⁿ), 100× faster machine → about **7 more
  elements** (2⁷ ≈ 128)

This is why algorithm analysis exists as a discipline. The shape of the
growth curve is a property of your *algorithm*, and no amount of hardware
budges it.

## Why we count "operations," not seconds

Measuring wall-clock time is fragile: it depends on the machine, the
language, the compiler, what else is running. So instead we count **basic
operations** — comparisons, additions, assignments — as a function of input
size n, and we care about how that count *grows*.

That's a deliberate simplification. It treats a cheap operation and an
expensive one as the same "step," and it ignores constant factors entirely.
The trade is worth it: what we keep is the one thing that dominates at
scale, and the next lesson makes that idea precise with actual notation.

```quiz
{
  "questions": [
    {
      "question": "An algorithm does n² operations. You upgrade to a machine that is 10,000× faster. In fixed time, how much more input can you handle?",
      "options": [
        "100× more",
        "10,000× more",
        "About the same"
      ],
      "answer": 0,
      "explanation": "If work is n², then handling k× more input costs k²× more work. To spend 10,000× more work, k = √10000 = 100."
    },
    {
      "question": "Why analyze operation counts instead of measuring runtime with a stopwatch?",
      "options": [
        "Growth in operation count is a property of the algorithm itself, independent of machine and language",
        "Operation counts are always exactly proportional to runtime, so counting operations gives the identical number a stopwatch would, just without needing to run the code",
        "Timing code is technically difficult — stopwatches and profilers introduce enough measurement overhead and noise that operation counting is really just a more convenient substitute for the same timing measurement"
      ],
      "answer": 0,
      "explanation": "Stopwatch numbers mix the algorithm with the hardware, language, and load. The growth rate isolates the part that's intrinsic to the algorithm — the part that dominates at scale."
    }
  ]
}
```
