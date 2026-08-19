---
title: Word Break
type: problem
---

## Problem

Given a string `s` and a dictionary of strings `wordDict`, return `true`
if `s` can be segmented into a space-separated sequence of one or more
dictionary words. Words may be reused any number of times.
(LeetCode 139.)

**Examples**

```examples
s = "leetcode", wordDict = ["leet","code"]      →  true   ("leet" + "code")
s = "catsandog", wordDict = ["cats","dog","sand","and","cat"]  →  false
```

```constraint
`1 ≤ s.length ≤ 300`, up to `1000` dictionary words.
```

## Attempt it first

This has the exact same "try every split point" shape as Palindrome
Partitioning (Module 16) — but that problem needed EVERY valid
partitioning (backtracking, necessarily exploring many branches), while
this one only needs a single yes/no answer. Before opening anything,
think about why that difference — ALL partitionings vs. JUST
reachability — is precisely what makes DP applicable here where
Module 16 used backtracking, and define `dp[i]` = "can the prefix
`s[0:i]` be fully segmented using dictionary words."

```sandbox
{
  "id": "word-break",
  "fn": {
    "python": "word_break",
    "javascript": "wordBreak"
  },
  "check": "return",
  "starter": {
    "python": "def word_break(s, word_dict):\n    # Return True if s splits into a sequence of dictionary words.\n    pass\n",
    "javascript": "function wordBreak(s, wordDict) {\n  // Return true if s splits into a sequence of dictionary words.\n}\n"
  },
  "cases": [
    {
      "args": [
        "leetcode",
        [
          "leet",
          "code"
        ]
      ],
      "expect": true
    },
    {
      "args": [
        "catsandog",
        [
          "cats",
          "dog",
          "sand",
          "and",
          "cat"
        ]
      ],
      "expect": false
    },
    {
      "args": [
        "applepenapple",
        [
          "apple",
          "pen"
        ]
      ],
      "expect": true
    },
    {
      "args": [
        "a",
        [
          "a"
        ]
      ],
      "expect": true
    },
    {
      "args": [
        "a",
        [
          "b"
        ]
      ],
      "expect": false
    },
    {
      "args": [
        "aaaaaaa",
        [
          "aaaa",
          "aaa"
        ]
      ],
      "expect": true
    },
    {
      "args": [
        "cars",
        [
          "car",
          "ca",
          "rs"
        ]
      ],
      "expect": true
    }
  ]
}
```

````reveal Hint — dp[i] depends on trying every earlier split point j
`dp[i]` is true if there EXISTS some split point `j < i` such that
`dp[j]` is true (the prefix up to `j` is segmentable) AND `s[j:i]` is
itself a dictionary word. Try every `j` from `0` to `i-1`; if any one
works, `dp[i] = True`. The base case `dp[0] = True` represents the empty
prefix, trivially segmentable (zero words). The final answer is
`dp[len(s)]`.
````

## Brute force / why this is backtracking's exponential twin

The direct recursive translation — "can `s[i:]` be segmented, trying
every possible next word" — without caching is exactly Palindrome
Partitioning's shape, and shares its exponential worst case:

````tabs
```python
def word_break_bruteforce(s: str, word_set: set[str], i: int) -> bool:
    if i == len(s):
        return True
    for j in range(i + 1, len(s) + 1):
        if s[i:j] in word_set and word_break_bruteforce(s, word_set, j):
            return True
    return False
```

```typescript
function wordBreakBruteforce(s: string, wordSet: Set<string>, i: number): boolean {
  if (i === s.length) return true;
  for (let j = i + 1; j <= s.length; j++) {
    if (wordSet.has(s.slice(i, j)) && wordBreakBruteforce(s, wordSet, j)) {
      return true;
    }
  }
  return false;
}
```
````

Without caching, this re-explores the same starting index `i` many
times through different combinations of earlier split choices — the
familiar overlapping-subproblems pattern, exponential in the worst case.
The crucial difference from Palindrome Partitioning: THAT problem's
recursion tree genuinely needs to be fully explored, because every leaf
is a distinct answer to return (all partitionings). THIS problem only
needs to know if AT LEAST ONE leaf succeeds — a single boolean, which
means caching "is position `i` reachable" (rather than "what are all the
ways to reach position `i`") is sufficient, and that's exactly what
turns exponential backtracking into linear-ish DP.

## The insight

`dp[i]` caches exactly one bit of information — "is this position
reachable at all" — discarding the specific path that reached it (which
Palindrome Partitioning's problem statement required keeping, but this
one doesn't). That's the entire reduction: same search shape,
DIFFERENT question being asked of it, and the DP-friendly question
(reachability) is what collapses the exponential search space that
enumeration (all partitionings) cannot avoid.

## Solution

`````reveal Solution — tabulated 1D DP, trying every split point per position
````tabs
```python
def word_break(s: str, word_dict: list[str]) -> bool:
    word_set = set(word_dict)             # O(1) membership checks
    n = len(s)
    dp = [False] * (n + 1)
    dp[0] = True                          # empty prefix — trivially segmentable

    for i in range(1, n + 1):
        for j in range(i):
            if dp[j] and s[j:i] in word_set:
                dp[i] = True
                break                      # one valid split is enough

    return dp[n]
```

```typescript
function wordBreak(s: string, wordDict: string[]): boolean {
  const wordSet = new Set(wordDict); // O(1) membership checks
  const n = s.length;
  const dp = new Array(n + 1).fill(false);
  dp[0] = true; // empty prefix — trivially segmentable

  for (let i = 1; i <= n; i++) {
    for (let j = 0; j < i; j++) {
      if (dp[j] && wordSet.has(s.slice(j, i))) {
        dp[i] = true;
        break; // one valid split is enough
      }
    }
  }

  return dp[n];
}
```
````

The `break` the instant a valid split is found is a direct payoff of
only needing a boolean: unlike backtracking (which must continue
exploring to enumerate every partitioning), DP can stop the inner loop
immediately once ANY valid split for position `i` is confirmed, since
further splits wouldn't change `dp[i]`'s truth value.

```complexity
{
  "time": "O(n² ) accounting for substring extraction, O(n²) split-point checks",
  "space": "O(n) for dp, plus O(total dictionary characters) for the word set",
  "why": "n positions, each trying up to n split points, and each split-point check involves an O(n) substring slice — giving O(n³) in the most literal accounting, though the substring cost can be reduced to O(1) amortized with careful hashing; the split-point structure itself is O(n²) distinct (i, j) pairs, each O(1) work beyond string slicing. Either way, this is a dramatic improvement over the brute force's exponential blowup, since every position i is now finalized exactly once instead of being re-explored through every combination of earlier choices."
}
```
`````

## Variants

- **Palindrome Partitioning** (Module 16): the exact same "try every
  split point" search shape, kept as backtracking there because it needs
  every partitioning enumerated; read side by side with this problem to
  see precisely how the QUESTION being asked (enumerate all vs. does one
  exist) determines whether DP or backtracking is the right tool for an
  otherwise-identical search structure.
- **Word Break II** (LeetCode 140, not covered): asks for ALL valid
  segmentations, not just whether one exists — this reintroduces the
  need for backtracking-style enumeration (often combined with
  memoization of partial results, a hybrid technique called
  "memoized backtracking"), rather than the pure boolean DP shown here.
- **From Recursion to Memoization** (concept lesson, this module): the
  general overlapping-subproblems argument this problem is one more
  instance of.

```quiz
{
  "question": "Palindrome Partitioning (Module 16) uses backtracking; Word Break uses DP — despite both trying every possible split point of a string. What property of what each problem ASKS FOR is the actual determining factor, rather than any difference in the underlying search structure?",
  "options": [
    "Palindrome Partitioning must return EVERY valid partitioning (a list of full solutions), which requires exploring and recording every successful path through the search tree individually; Word Break only needs to know IF at least one valid partitioning exists (a single boolean), which lets a cache track just 'is this position reachable' — discarding the specific path — collapsing what would otherwise be the same exponential search into a polynomial one",
    "Word Break's search tree is smaller than Palindrome Partitioning's, which is why DP works for one but not the other — since dictionary-word splits are naturally fewer than palindrome splits, Word Break's recursion simply has fewer nodes to explore in the first place",
    "Word Break's dictionary words are always shorter than palindromes, which changes the algorithm's complexity — since dictionary entries tend to be short compared to arbitrary palindromic substrings, the branching factor at each recursive step is inherently smaller for Word Break"
  ],
  "answer": 0,
  "explanation": "The underlying search space (all ways to split a string at valid boundaries) is structurally identical for both problems. What differs is the OUTPUT each problem needs: enumerating all results forces visiting every successful leaf of the search tree individually (backtracking's job), while answering a yes/no reachability question allows caching a single bit per position and short-circuiting the moment any valid path is found — which is exactly what makes memoization/DP applicable to the reachability version but not directly to the enumerate-everything version."
}
```
