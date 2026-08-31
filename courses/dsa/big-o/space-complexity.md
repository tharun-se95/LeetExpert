---
title: Space Complexity
type: concept
---

## The counter space on your desk

Back at your sorting desk, there's another cost besides how long a task
takes: how much physical counter space it eats up while you work. Space
complexity applies the same O machinery to memory, and one distinction
does most of the work:

- **Total space** — everything on the desk, including the original bin of
  mail itself.
- **Auxiliary space** — only the *extra* counter space you personally
  clear for scratch work.

If you read through a stack of n letters and just keep one running "best
so far" letter off to the side, you're using the whole desk (O(n) total,
since the bin of letters is sitting there) but only a single extra spot
for your "best so far" letter (**O(1) auxiliary**) — and auxiliary is
what people mean by default, since the size of the incoming bin isn't
something you chose. "In-place" means O(1) (or sometimes O(log n))
auxiliary space, exactly like clearing almost no extra counter space at
all.

````tabs
```python
def max_of(nums: list[int]) -> int:
    best = nums[0]        # O(1) auxiliary — one variable
    for x in nums:
        if x > best:
            best = x
    return best

def sorted_copy(nums: list[int]) -> list[int]:
    return sorted(nums)   # O(n) auxiliary — a full new list
```

```typescript
function maxOf(nums: number[]): number {
  let best = nums[0]; // O(1) auxiliary — one variable
  for (const x of nums) {
    if (x > best) best = x;
  }
  return best;
}

function sortedCopy(nums: number[]): number[] {
  return [...nums].sort((a, b) => a - b); // O(n) auxiliary — a full copy
}
```
````

```diagram
{
  "id": "complexity-curve",
  "mode": "space"
}
```

## The memory you don't see: the call stack

Recall the office hierarchy from the recursion lesson — every manager who
delegates a task has to keep a sticky note on their own desk reminding
them what they're still waiting on, until their subordinate reports back.
Every active function call occupies a **stack frame** (parameters,
locals, return address) the exact same way — a pile of sticky notes,
one per manager still waiting in the delegation chain. Recursion
therefore costs memory proportional to its **depth** — even if no frame
allocates anything:

````tabs
```python
def sum_to(n: int) -> int:
    if n == 0:
        return 0
    return n + sum_to(n - 1)   # n frames deep -> O(n) space

def sum_iter(n: int) -> int:
    total = 0                  # O(1) space
    for i in range(1, n + 1):
        total += i
    return total
```

```typescript
function sumTo(n: number): number {
  if (n === 0) return 0;
  return n + sumTo(n - 1); // n frames deep -> O(n) space
}

function sumIter(n: number): number {
  let total = 0; // O(1) space
  for (let i = 1; i <= n; i++) total += i;
  return total;
}
```
````

```diagram
{
  "id": "call-stack-frames",
  "title": "sum_to(3)",
  "frames": [
    { "label": "sum_to(3)", "detail": "waiting on n-1" },
    { "label": "sum_to(2)", "detail": "waiting on n-1" },
    { "label": "sum_to(1)", "detail": "waiting on n-1" },
    { "label": "sum_to(0)", "detail": "base → 0" }
  ],
  "caption": "n frames deep → O(n) auxiliary space"
}
```

Same time complexity, different space — and the recursive one actually
crashes: Python's default recursion limit (~1000) and JS engines' stack
sizes both make `sum_to(100_000)` a stack-overflow error, not a slow call.
Depth matters differently per shape: binary search recursion is log n deep
→ O(log n) space (a single-chain delegation, one sticky note at a time);
DFS on a path-shaped graph can be n deep → O(n). When we analyze recursive
algorithms from here on, stack depth is always part of the space answer.

```complexity
{
  "operations": [
    { "name": "running max (loop)", "time": "O(n)", "why": "one pass, one variable" },
    { "name": "sum via recursion", "time": "O(n)", "why": "n frames on the call stack — O(n) auxiliary space" },
    { "name": "binary search (recursive)", "time": "O(log n)", "why": "halving depth — O(log n) stack space" },
    { "name": "merge sort", "time": "O(n log n)", "why": "O(n) auxiliary for merge buffers + O(log n) stack" }
  ]
}
```

## The time–space trade

A huge fraction of algorithm design is *buying time with memory*. You've
already seen it: lesson 1's gift-card board strategy went from O(n²) time
/ O(1) space (the walk-around, empty-handed) to O(n) time / **O(n) space**
(the chalkboard is the purchase — you spent counter space to save
walking time). Prefix sums, memoization, and hash indexes are all the
same transaction. The reverse trade exists too (recomputing instead of
storing, when memory is the scarce resource).

Neither direction is "better." The skill is noticing that the trade is
available and pricing both sides — which is why every problem lesson in
this course reports time *and* space.

```quiz
{
  "questions": [
    {
      "question": "A function recursively halves its input, doing O(1) work per call with no allocations. Its auxiliary space is…",
      "options": [
        "O(n) — recursive calls always cost space proportional to the original input size n, regardless of how much smaller each subsequent call's input actually is",
        "O(1) — it allocates nothing, and since no explicit data structure is created inside the function body, the recursion itself is assumed to be free of any space cost",
        "O(log n) — one stack frame per level of halving"
      ],
      "answer": 2,
      "explanation": "Frames are memory even when the body allocates nothing. Halving gives log n simultaneous frames at peak."
    },
    {
      "question": "Reversing an array by swapping ends toward the middle, versus building a reversed copy — what's the auxiliary-space comparison?",
      "options": [
        "O(1) versus O(n)",
        "O(n) for both — the array has n elements, so any operation performed on it inherits that size as its auxiliary space cost regardless of whether new memory is actually allocated",
        "O(log n) versus O(n) — swapping ends toward the middle still needs a small amount of bookkeeping proportional to how many halvings it takes to meet in the middle, rather than truly constant space"
      ],
      "answer": 0,
      "explanation": "Swapping in place needs one temporary variable: O(1) auxiliary (the input doesn't count). The copy allocates n new slots."
    }
  ]
}
```
