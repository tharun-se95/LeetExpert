---
title: Palindrome Partitioning
type: problem
---

## Problem

Given a string `s`, partition it so that **every substring of the
partition is a palindrome**. Return *all* possible such partitionings.
(LeetCode 131.)

**Examples**

```text
s = "aab"  →  [["a","a","b"], ["aa","b"]]
s = "a"    →  [["a"]]
```

**Constraints:** `1 ≤ s.length ≤ 16`, lowercase English letters only.

## Attempt it first

This is a backtracking problem whose choices aren't "include or
exclude an element" (Subsets) or "reuse or not" (Combination Sum) but
**where to cut**: given you're currently at some starting position in
the string, how far forward should the *next* piece extend? Before
opening anything, work out: at a given start index, how many different
"next cuts" are legal candidates to try, and what has to be true about
each candidate substring before it's worth recursing past it?


```sandbox
{
  "id": "palindrome-partitioning",
  "fn": { "python": "partition", "javascript": "partition" },
  "check": "return",
  "compare": "sorted",
  "starter": {
    "python": "def partition(s):\n    # Return every partition of s whose every piece is a palindrome.\n    pass\n",
    "javascript": "function partition(s) {\n  // Return every partition of s whose every piece is a palindrome.\n}\n"
  },
  "cases": [
    { "args": ["aab"], "expect": [["a", "a", "b"], ["aa", "b"]] },
    { "args": ["a"], "expect": [["a"]] },
    { "args": ["ab"], "expect": [["a", "b"]] },
    { "args": ["aaa"], "expect": [["a", "a", "a"], ["a", "aa"], ["aa", "a"], ["aaa"]] },
    { "args": ["aba"], "expect": [["a", "b", "a"], ["aba"]] },
    { "args": ["cdd"], "expect": [["c", "d", "d"], ["c", "dd"]] }
  ]
}
```

````reveal Hint — try every end index, but only recurse past valid cuts
From a start index, try every possible end index for the next piece:
`s[start:end+1]` for `end` ranging from `start` to `len(s) - 1`. For each
candidate, check whether that specific substring is a palindrome. If it
is, that's a **valid cut** — commit to it (append it to the current
partition) and recurse from `end + 1` to partition the rest of the
string. If it isn't a palindrome, skip that end index entirely — this is
the prune: don't waste a recursive call exploring partitions built on a
piece that already fails the constraint. The base case is reaching the
end of the string with the current partition intact.
````

## Brute force, and the pruning that replaces it

There's no separate weaker tier here beyond the naive palindrome check
itself — the real efficiency question is *when* you check
palindrome-ness. A less disciplined version might build a partition
first and validate it entirely at the end, which means constructing
many partitions whose very first piece was already non-palindromic. The
efficient version checks each candidate piece for the palindrome
property **the moment it's proposed**, before ever recursing into it —
exactly the "prune during construction, not after" idea from Generate
Parentheses.

## The insight

The recursion is `partition_from(start, path)`: try every `end` from
`start` to the string's last index, check if `s[start:end+1]` is a
palindrome, and only if it is, choose it (append to `path`), explore
(recurse on `partition_from(end + 1, path)`), then unchoose (pop). The
base case — `start == len(s)` — means every character has been consumed
by a valid palindromic piece, so `path` is a complete, valid
partitioning worth recording.

## Solution

`````reveal Solution — backtracking over cut points, pruning non-palindromic pieces
````tabs
```python
def partition(s: str) -> list[list[str]]:
    result: list[list[str]] = []
    n = len(s)

    def is_palindrome(lo: int, hi: int) -> bool:
        while lo < hi:
            if s[lo] != s[hi]:
                return False
            lo += 1
            hi -= 1
        return True

    def backtrack(start: int, path: list[str]) -> None:
        if start == n:                      # base case: whole string consumed
            result.append(path.copy())
            return
        for end in range(start, n):
            if not is_palindrome(start, end):
                continue                    # PRUNE: this piece isn't a palindrome
            path.append(s[start:end + 1])   # CHOOSE
            backtrack(end + 1, path)        # EXPLORE
            path.pop()                      # UNCHOOSE

    backtrack(0, [])
    return result
```

```typescript
function partition(s: string): string[][] {
  const result: string[][] = [];
  const n = s.length;

  function isPalindrome(lo: number, hi: number): boolean {
    while (lo < hi) {
      if (s[lo] !== s[hi]) return false;
      lo++;
      hi--;
    }
    return true;
  }

  function backtrack(start: number, path: string[]): void {
    if (start === n) {
      // base case: whole string consumed
      result.push([...path]);
      return;
    }
    for (let end = start; end < n; end++) {
      if (!isPalindrome(start, end)) continue; // PRUNE: not a palindrome
      path.push(s.slice(start, end + 1)); // CHOOSE
      backtrack(end + 1, path); // EXPLORE
      path.pop(); // UNCHOOSE
    }
  }

  backtrack(0, []);
  return result;
}
```
````

The `continue` on a failed `is_palindrome` check is the whole prune: it
skips straight to trying the next `end` without ever pushing the
invalid piece onto `path` or recursing past it. Every recursive call
that does happen is therefore guaranteed to be building on an
all-palindrome prefix.

```complexity
{
  "time": "O(n · 2^n) worst case",
  "space": "O(n) auxiliary (recursion depth) plus O(n) per palindrome check",
  "why": "Every position between two characters is either a cut or not — 2^(n-1) ways to place cuts in the worst case (e.g. a string of all-identical characters, where every substring is a palindrome and no cut is ever pruned) — and each of the resulting partitions costs O(n) to copy into the result. The is_palindrome check itself is O(n) per call, tried up to n times per start position, adding another linear factor that the stated bound already absorbs into the O(n) multiplier."
}
```
`````

`````reveal Optimization — precompute palindrome checks with DP
The `is_palindrome(lo, hi)` helper above recomputes from scratch on
every call, and the same `(lo, hi)` range can be queried many times
across different branches of the search. A `n × n` boolean table,
filled bottom-up before the backtracking starts, answers every
palindrome query in O(1):

````tabs
```python
def partition_precomputed(s: str) -> list[list[str]]:
    n = len(s)
    # is_pal[lo][hi] = True iff s[lo:hi+1] is a palindrome.
    is_pal = [[False] * n for _ in range(n)]
    for hi in range(n):
        for lo in range(hi + 1):
            if s[lo] == s[hi] and (hi - lo <= 2 or is_pal[lo + 1][hi - 1]):
                is_pal[lo][hi] = True

    result: list[list[str]] = []

    def backtrack(start: int, path: list[str]) -> None:
        if start == n:
            result.append(path.copy())
            return
        for end in range(start, n):
            if not is_pal[start][end]:
                continue
            path.append(s[start:end + 1])
            backtrack(end + 1, path)
            path.pop()

    backtrack(0, [])
    return result
```

```typescript
function partitionPrecomputed(s: string): string[][] {
  const n = s.length;
  // isPal[lo][hi] = true iff s[lo..hi] is a palindrome.
  const isPal: boolean[][] = Array.from({ length: n }, () => new Array(n).fill(false));
  for (let hi = 0; hi < n; hi++) {
    for (let lo = 0; lo <= hi; lo++) {
      if (s[lo] === s[hi] && (hi - lo <= 2 || isPal[lo + 1][hi - 1])) {
        isPal[lo][hi] = true;
      }
    }
  }

  const result: string[][] = [];

  function backtrack(start: number, path: string[]): void {
    if (start === n) {
      result.push([...path]);
      return;
    }
    for (let end = start; end < n; end++) {
      if (!isPal[start][end]) continue;
      path.push(s.slice(start, end + 1));
      backtrack(end + 1, path);
      path.pop();
    }
  }

  backtrack(0, []);
  return result;
}
```
````

The DP fill order matters: `is_pal[lo][hi]` depends on `is_pal[lo+1][hi-1]`
(a shorter, inner range), so `hi` must be the outer loop increasing
from 0 and `lo` the inner loop from 0 up to `hi`, guaranteeing the inner
range is always already computed. This is a preview of Module 24 (Dynamic
Programming)'s two-sequence-style table filling, used here just to cache
a predicate rather than an optimum.

```complexity
{
  "time": "O(n²) to build the table, O(n · 2^n) for the backtracking itself",
  "space": "O(n²) for the table",
  "why": "Filling is O(n²) since it's exactly n(n+1)/2 cells, each O(1) with the recurrence. The backtracking's own worst case is unchanged from before — the table doesn't shrink the search TREE, only the cost of each palindrome check within it, from O(n) to O(1)."
}
```
`````

## Variants

- **Palindrome Partitioning II** (not covered): asks for the *minimum*
  number of cuts, not all partitionings — an optimization question,
  which is where DP (Module 24) beats backtracking, exactly as Coin
  Change beats a Combination-Sum-style enumeration.
- **Word Break** (Module 24): the same "try every cut point from
  `start`" shape, but the predicate is "is this piece a dictionary
  word" instead of "is this piece a palindrome" — and because Word Break
  only needs a yes/no answer (not every partitioning), DP's caching
  avoids backtracking's exponential blowup entirely.
- **Combination Sum** (this module): another backtracking problem with
  a per-branch validity check baked into the recursion, though pruning
  there is numeric (running target) rather than structural (palindrome
  test).

```quiz
{
  "question": "The precomputed is_pal table is filled with hi as the OUTER loop (increasing from 0) and lo as the inner loop (from 0 to hi). Why would swapping the loop order — lo outer, hi inner — break the table?",
  "options": [
    "It wouldn't break anything; the fill order is arbitrary — since every cell's recurrence only references other cells within the same fixed-size table, any traversal order eventually fills in the correct values",
    "is_pal[lo][hi] depends on is_pal[lo+1][hi-1], a range that is SHORTER and has both a larger lo and a smaller hi than the current cell; the hi-outer/lo-inner order guarantees every dependency is computed before it's read, while lo-outer, hi-inner would read is_pal[lo+1][...] before that row has been filled for the needed hi-1 column",
    "The loop order only affects performance, not correctness — a differently-ordered fill might touch cache lines less efficiently, but every dependency would still resolve to the right value by the time the table finishes"
  ],
  "answer": 1,
  "explanation": "This is a dependency-ordering requirement, the same discipline Module 24's DP lessons make explicit: every cell must be computed only after every cell it depends on. is_pal[lo][hi] needs is_pal[lo+1][hi-1] already filled. With hi increasing outermost and lo increasing (up to hi) innermost, by the time cell (lo, hi) is reached, all cells with a smaller hi (and in particular hi-1) are already fully computed across all lo — so the dependency is guaranteed ready."
}
```
