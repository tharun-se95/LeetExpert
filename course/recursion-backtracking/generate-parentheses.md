---
title: Generate Parentheses
type: problem
---

## Problem

Given `n` pairs of parentheses, return *all* combinations of
well-formed (balanced, correctly nested) parenthesis strings of length
`2n`. (LeetCode 22.)

**Examples**

```text
n = 3  →  ["((()))","(()())","(())()","()(())","()()()"]
n = 1  →  ["()"]
```

**Constraints:** `1 ≤ n ≤ 8`.

## Attempt it first

This is a backtracking problem where the state-space tree's branching
looks simple — at each position, add `(` or add `)` — but most of that
naive tree is invalid strings. The concept lesson made a specific point
about this: pruning invalid branches *during construction* beats
generating everything and filtering afterward. Before opening anything,
work out: given how many `(` and `)` you've placed so far, what is the
exact rule for when it's still legal to place a `(`, and when it's still
legal to place a `)`? Get that rule right and the recursion is a direct
translation of it.

````reveal Hint — track open-count and close-count, not raw characters
Track two running counters as you build the path: how many `(` have been
placed (`openCount`) and how many `)` have been placed (`closeCount`).
Two rules govern every step: you may place another `(` only if
`openCount < n` (you haven't used up your budget of opens), and you may
place a `)` only if `closeCount < openCount` (there must be an
unmatched `(` still open to close — you can never have more closes than
opens at any prefix of a valid string). A complete, valid string is
exactly one where `openCount == closeCount == n`.
````

## Brute force, for contrast

The naive approach generates **every** string of length `2n` over the
alphabet `{(, )}` — there are `2^(2n)` of them — and checks each for
validity with a separate O(n) balance scan:

````tabs
```python
def generate_bruteforce(n: int) -> list[str]:
    result = []

    def is_valid(s: str) -> bool:
        balance = 0
        for ch in s:
            balance += 1 if ch == "(" else -1
            if balance < 0:
                return False
        return balance == 0

    def build(path: list[str]) -> None:
        if len(path) == 2 * n:
            candidate = "".join(path)
            if is_valid(candidate):
                result.append(candidate)
            return
        for ch in "()":
            path.append(ch)
            build(path)
            path.pop()

    build([])
    return result
```

```typescript
function generateBruteforce(n: number): string[] {
  const result: string[] = [];

  function isValid(s: string): boolean {
    let balance = 0;
    for (const ch of s) {
      balance += ch === "(" ? 1 : -1;
      if (balance < 0) return false;
    }
    return balance === 0;
  }

  function build(path: string[]): void {
    if (path.length === 2 * n) {
      const candidate = path.join("");
      if (isValid(candidate)) result.push(candidate);
      return;
    }
    for (const ch of ["(", ")"]) {
      path.push(ch);
      build(path);
      path.pop();
    }
  }

  build([]);
  return result;
}
```
````

This generates all `2^(2n)` strings and only *afterward* discovers most
are invalid — for `n = 8` that's 65,536 strings built and scanned, when
only 1,430 are actually valid. The waste is generating deep into a
branch that was already doomed at an earlier character.

## The insight

Instead of generating blindly and filtering, **prune at construction
time**: only ever place a character that keeps the prefix legal. This
means every leaf reached by the recursion is automatically valid — the
`is_valid` scan disappears entirely, and every branch that would have
produced a malformed string is cut at the exact character that broke
it, not 2n − (that position) characters later.

## Solution

`````reveal Solution — backtracking with the open/close budget prune
````tabs
```python
def generate_parenthesis(n: int) -> list[str]:
    result: list[str] = []

    def backtrack(path: list[str], open_count: int, close_count: int) -> None:
        if len(path) == 2 * n:              # base case: budget fully used
            result.append("".join(path))
            return
        if open_count < n:                  # PRUNE: only if opens remain
            path.append("(")                # CHOOSE
            backtrack(path, open_count + 1, close_count)  # EXPLORE
            path.pop()                      # UNCHOOSE
        if close_count < open_count:        # PRUNE: only if an open is unmatched
            path.append(")")                # CHOOSE
            backtrack(path, open_count, close_count + 1)  # EXPLORE
            path.pop()                      # UNCHOOSE

    backtrack([], 0, 0)
    return result
```

```typescript
function generateParenthesis(n: number): string[] {
  const result: string[] = [];

  function backtrack(path: string[], openCount: number, closeCount: number): void {
    if (path.length === 2 * n) {
      // base case: budget fully used
      result.push(path.join(""));
      return;
    }
    if (openCount < n) {
      // PRUNE: only if opens remain
      path.push("("); // CHOOSE
      backtrack(path, openCount + 1, closeCount); // EXPLORE
      path.pop(); // UNCHOOSE
    }
    if (closeCount < openCount) {
      // PRUNE: only if an open is unmatched
      path.push(")"); // CHOOSE
      backtrack(path, openCount, closeCount + 1); // EXPLORE
      path.pop(); // UNCHOOSE
    }
  }

  backtrack([], 0, 0);
  return result;
}
```
````

Every leaf this reaches has `len(path) == 2n` AND arrived there only by
moves that kept `close_count <= open_count <= n` at every step — which
is precisely the definition of a balanced string. There is no separate
validity check anywhere because validity was enforced incrementally, one
character at a time, exactly the pruning-during-construction idea the
concept lesson previewed.

```complexity
{
  "time": "O(4^n / sqrt(n)) — the nth Catalan number, times O(n) per string",
  "space": "O(n) auxiliary (recursion depth), plus output size",
  "why": "The number of valid strings of n pairs is exactly the nth Catalan number, C(n) = (2n choose n)/(n+1), which grows as Θ(4^n / n^1.5). Each is built and joined in O(n). This is the honest count of the actual (pruned) tree walked — far smaller than the brute force's full 2^(2n), which the pruning above never visits in the first place."
}
```
`````

## Variants

- **Valid Parentheses** (not covered — a simpler *checking*, not
  *generating*, problem): the `is_valid` helper shown in the brute force
  above **is** that problem, solved directly with a stack or counter.
- **Combination Sum** (this module): shares the choose/explore/unchoose
  skeleton, but prunes on a numeric running target instead of a
  structural open/close budget — compare the two prune conditions side
  by side.
- **N-Queens** (next lesson): pruning taken further — instead of two
  simple counters, the validity check involves tracking three separate
  conflict sets (columns, and both diagonals).

```quiz
{
  "question": "The brute-force approach generates all 2^(2n) strings and validates each afterward; the backtracking solution prunes with openCount < n and closeCount < openCount DURING construction. What is the concrete benefit of pruning early rather than validating at the end?",
  "options": [
    "Pruning only saves memory, not time — cutting a branch early frees up the recursion's call stack sooner, but the CPU still ends up performing the identical number of character-placement operations either way",
    "Once a prefix becomes invalid (e.g. closeCount would exceed openCount), every possible completion of it is also invalid — pruning at that exact character discards the entire remaining subtree in one step, instead of the brute force separately generating and then rejecting every one of those doomed completions",
    "There is no real benefit — both approaches do the same total work; validating a complete string at the end costs the same O(n) as checking validity incrementally during construction, so the totals wash out"
  ],
  "answer": 1,
  "explanation": "Invalidity is monotonic once it occurs: a broken prefix can never be repaired by later characters. Catching the violation the instant it would happen — rather than after building the full length-2n string — means the recursion never even visits any of the (potentially huge) subtree of completions rooted at that broken prefix, which is exactly why the pruned tree (Catalan number of leaves) is so much smaller than the unpruned one (2^(2n) leaves)."
}
```
