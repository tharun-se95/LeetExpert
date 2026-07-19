---
title: Complexity Drills
type: concept
---

## How to drill

For each snippet: commit to a time *and* auxiliary-space answer **before**
answering the quiz, then open the worked reasoning. If you miss one, don't
just accept the answer — find which rule you misapplied (iteration count?
body price? stack depth?).

## Drill 1

````tabs
```python
def drill1(nums: list[int]) -> int:
    total = 0
    for x in nums:
        total += x
    for x in nums:
        total -= x // 2
    return total
```

```typescript
function drill1(nums: number[]): number {
  let total = 0;
  for (const x of nums) total += x;
  for (const x of nums) total -= Math.floor(x / 2);
  return total;
}
```
````

```quiz
{
  "question": "Drill 1 — time and auxiliary space?",
  "options": [
    "O(n²) time, O(1) space",
    "O(n) time, O(1) space",
    "O(n) time, O(n) space"
  ],
  "answer": 1,
  "explanation": "Two *sequential* loops add: O(n) + O(n) = O(n). One accumulator variable: O(1) auxiliary."
}
```

## Drill 2

````tabs
```python
def drill2(nums: list[int]) -> list[int]:
    out = []
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == 0:
                out.append(i)
    return out
```

```typescript
function drill2(nums: number[]): number[] {
  const out: number[] = [];
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === 0) out.push(i);
    }
  }
  return out;
}
```
````

```quiz
{
  "question": "Drill 2 — time complexity?",
  "options": [
    "O(n log n) — the inner loop shrinks",
    "O(n²) — the shrinking bound only halves the constant",
    "O(n)"
  ],
  "answer": 1,
  "explanation": "Inner iterations: (n−1) + (n−2) + … + 1 = n(n−1)/2. The ½ is a constant factor; the class is quadratic. (Space: up to O(n²) appends in pathological inputs — worth noticing that output size can dominate space.)"
}
```

## Drill 3

````tabs
```python
def drill3(n: int) -> int:
    count = 0
    i = n
    while i > 1:
        for _ in range(n):
            count += 1
        i //= 2
    return count
```

```typescript
function drill3(n: number): number {
  let count = 0;
  for (let i = n; i > 1; i = Math.floor(i / 2)) {
    for (let k = 0; k < n; k++) count++;
  }
  return count;
}
```
````

```quiz
{
  "question": "Drill 3 — time complexity?",
  "options": ["O(n)", "O(log n)", "O(n log n)"],
  "answer": 2,
  "explanation": "Outer loop halves i: log₂ n iterations. Inner loop is a full n each time regardless of i. Multiply: n · log n."
}
```

## Drill 4

````tabs
```python
def drill4(nums: list[int], target: int) -> bool:
    for x in nums:                 # n iterations
        if x in nums[1:]:          # slice + scan!
            pass
        if x == target:
            return True
    return False
```

```typescript
function drill4(nums: number[], target: number): boolean {
  for (const x of nums) {                    // n iterations
    if (nums.slice(1).includes(x)) {         // slice + scan!
      /* ... */
    }
    if (x === target) return true;
  }
  return false;
}
```
````

```quiz
{
  "question": "Drill 4 — time and auxiliary space?",
  "options": [
    "O(n) time, O(1) space — one loop",
    "O(n²) time, O(n) space — the body hides a linear slice and a linear scan",
    "O(n²) time, O(1) space"
  ],
  "answer": 1,
  "explanation": "Pricing the body: the slice copies ~n elements (O(n) time AND O(n) auxiliary), then the membership scan is O(n). Loop × body = O(n²) time; the temporary slice is O(n) space. Innocent-looking one-liners are where quadratic hides."
}
```

## Drill 5

````tabs
```python
def drill5(n: int) -> int:
    if n <= 1:
        return 1
    return drill5(n // 2) + drill5(n // 2)
```

```typescript
function drill5(n: number): number {
  if (n <= 1) return 1;
  return drill5(Math.floor(n / 2)) + drill5(Math.floor(n / 2));
}
```
````

```quiz
{
  "question": "Drill 5 — time complexity? (Careful: it branches twice AND halves.)",
  "options": [
    "O(log n) — it halves",
    "O(n) — 2 branches × log n depth gives ~2^(log n) = n leaf calls",
    "O(2ⁿ) — it branches twice"
  ],
  "answer": 1,
  "explanation": "Recursion tree: doubling width per level, log₂ n levels deep → about 2^(log₂ n) = n total calls of O(1) each. Branching twice is not automatically exponential — depth decides. (Space: O(log n) stack.)"
}
```

## Drill 6

````tabs
```python
def drill6(matrix: list[list[int]]) -> int:
    n = len(matrix)        # n × n matrix
    best = matrix[0][0]
    for row in matrix:
        for value in row:
            if value > best:
                best = value
    return best
```

```typescript
function drill6(matrix: number[][]): number {
  const n = matrix.length; // n × n matrix
  let best = matrix[0][0];
  for (const row of matrix) {
    for (const value of row) {
      if (value > best) best = value;
    }
  }
  return best;
}
```
````

```quiz
{
  "question": "Drill 6 — is this O(n²) 'bad'?",
  "options": [
    "Yes — nested loops should be optimized away",
    "It's O(n²) in n, but that's linear in the input size (n² cells), and you can't find a max without reading every cell — this is optimal",
    "It's O(n) because each row is one iteration"
  ],
  "answer": 1,
  "explanation": "Complexity is relative to what n names. The input has n² cells; touching each once is the floor for a max. 'Quadratic in n' and 'linear in input size' are the same statement here — always know what your variable counts."
}
```

````reveal Where you go from here
If drills 1–3 felt automatic and 4–6 needed thought, that's the intended
state after this module. The rules (add / multiply / price the body / draw
the tree) are complete — what's left is fluency, and fluency comes from the
per-module analyses ahead, starting with real data structures in Stage 1.

**Next module: Math for DSA** (coming soon), or jump ahead to **Arrays &
Dynamic Arrays** when it lands — where the amortized-doubling argument you
learned here becomes load-bearing.
````
