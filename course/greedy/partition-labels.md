---
title: Partition Labels
type: problem
---

## Problem

Given a string `s`, partition it into as many parts as possible so that
**each letter appears in at most one part** — every occurrence of a
given letter must fall entirely within a single partition. Return the
list of partition lengths. (LeetCode 763.)

**Examples**

```examples
s = "ababcbacadefegdehijhklij" → [9,7,8]  ("ababcbaca","defegde","hijhklij")
s = "eccbbbbdec" → [10]
```

```constraint
`1 ≤ s.length ≤ 500`, lowercase English letters only.
```

## Attempt it first

The constraint — every occurrence of a letter must be in one partition
— means a partition can't end at some position `i` if any letter seen
so far in the current partition still has a LATER occurrence beyond
`i`. Before opening anything, think about how you'd know, at every
position while scanning left to right, whether it's *safe* to end the
current partition right there — what single piece of information about
each letter would let you answer that in O(1) per character?


```sandbox
{
  "id": "partition-labels",
  "fn": { "python": "partition_labels", "javascript": "partitionLabels" },
  "check": "return",
  "starter": {
    "python": "def partition_labels(s):\n    # Return the length of each partition, in order.\n    pass\n",
    "javascript": "function partitionLabels(s) {\n  // Return the length of each partition, in order.\n}\n"
  },
  "cases": [
    { "args": ["ababcbacadefegdehijhklij"], "expect": [9, 7, 8] },
    { "args": ["eccbbbbdec"], "expect": [10] },
    { "args": ["a"], "expect": [1] },
    { "args": ["abc"], "expect": [1, 1, 1] },
    { "args": ["abac"], "expect": [3, 1] },
    { "args": ["aaaa"], "expect": [4] }
  ]
}
```

````reveal Hint — precompute each letter's last occurrence, then extend to match
Precompute, in one pass, the LAST index at which each letter appears
anywhere in `s`. Then scan left to right, maintaining the current
partition's boundary as the maximum "last occurrence" seen among all
letters encountered so far in this partition. The moment the scan
position reaches that boundary, every letter seen in the current
partition has now had its last occurrence accounted for — the partition
can safely close here, because extending further would only ever be
required if some letter's last occurrence were beyond the current
boundary, which by definition it isn't.
````

## Brute force, for contrast

A less structured approach might, for each candidate partition start,
try extending it character by character, and after each extension,
re-scan to check whether every letter included so far has all its
occurrences accounted for within the current bounds. That re-check is
itself O(n) per extension, and there are O(n) extensions per partition,
giving O(n²) in the worst case — wasteful, because "does every included
letter have all its occurrences accounted for" is exactly what
precomputing last-occurrence answers in O(1) per character, without
re-scanning anything.

## The insight

Two ingredients, combined into a single greedy pass:

1. **Precompute `last_occurrence[ch]`** for every character — one O(n)
   pass over `s`, overwriting each letter's recorded index every time
   it's seen, so after the pass each entry holds that letter's true
   final position.
2. **Greedily extend the current partition's boundary** as you scan:
   keep a running `end = max(end, last_occurrence[s[i]])` for every
   character encountered since the current partition started. The
   partition can close **exactly when `i == end`** — every letter seen
   in `[partition_start, i]` has had its last occurrence account for by
   the running max, so nothing later in the string can still need to be
   included in this partition. Extending the partition instead of
   closing it whenever the loop hasn't yet reached `end` is what
   correctly avoids splitting a letter's occurrences across two
   partitions.

This is the same "extend a boundary until it can safely stop" shape as
Jump Game II's contiguous BFS levels: `end` here plays the role of
`farthest` there — a running maximum reach that, once caught up to, is
proven not to require any further extension.

## Solution

`````reveal Solution — precompute last occurrence, then a single greedy pass
````tabs
```python
def partition_labels(s: str) -> list[int]:
    last_occurrence = {ch: i for i, ch in enumerate(s)}   # overwritten → ends up as LAST index

    result: list[int] = []
    start = 0
    end = 0
    for i, ch in enumerate(s):
        end = max(end, last_occurrence[ch])   # extend to cover this letter's last occurrence
        if i == end:                          # every letter so far is fully accounted for
            result.append(end - start + 1)
            start = i + 1                     # next partition begins right after

    return result
```

```typescript
function partitionLabels(s: string): number[] {
  const lastOccurrence = new Map<string, number>();
  for (let i = 0; i < s.length; i++) {
    lastOccurrence.set(s[i], i); // overwritten → ends up as LAST index
  }

  const result: number[] = [];
  let start = 0;
  let end = 0;
  for (let i = 0; i < s.length; i++) {
    end = Math.max(end, lastOccurrence.get(s[i])!); // extend to cover this letter's last occurrence
    if (i === end) {
      // every letter so far is fully accounted for
      result.push(end - start + 1);
      start = i + 1; // next partition begins right after
    }
  }

  return result;
}
```
````

The correctness argument mirrors Jump Game II precisely: `end` is a
running maximum over every character examined so far in the current
partition, so it can never UNDERSHOOT a letter's true last occurrence
(every contributing letter's last-occurrence value was folded into the
max the moment it was first seen in this partition). And `i == end`
firing means the scan has now walked all the way to that maximum
without discovering any letter whose last occurrence pushes the
boundary further out — so it's provably safe to close, not merely
convenient.

```complexity
{
  "time": "O(n)",
  "space": "O(1) extra (beyond the fixed 26-entry last-occurrence table)",
  "why": "The last-occurrence precomputation is one O(n) pass. The main scan is a second O(n) pass, O(1) work per character (one map lookup, one max, one comparison). The last-occurrence table holds at most 26 entries (lowercase letters), a constant independent of n — genuinely O(1), not O(n), auxiliary space."
}
```
`````

## Variants

- **Jump Game II** (this module): the structurally identical "extend a
  running boundary, close/increment when the scan catches up to it"
  pattern, applied to counting jumps instead of counting partition
  lengths — worth reading side by side to see the shared shape.
- **Merge Intervals** (Module 14): reframe this problem as merging the
  [first occurrence, last occurrence] interval of every letter, then
  reading off the sizes of the merged, non-overlapping result — an
  entirely different-looking but ultimately equivalent way to see the
  same structure.
- **Video Stitching / minimum intervals to cover a range** (not
  covered): another member of the "greedily extend a reach, commit when
  you must" family this module builds toward recognizing on sight.

```quiz
{
  "question": "The algorithm closes the current partition exactly when the scan index i equals the running boundary `end`. Why is it INCORRECT to close the partition any earlier — say, as soon as the current character's own last occurrence has been reached, ignoring other letters already included in this partition?",
  "options": [
    "A partition can only close safely once EVERY letter included so far has had its last occurrence accounted for, not just the most recently scanned one — an earlier letter in the same partition might have a later last-occurrence than the current character, and closing before reaching that letter's true boundary would split its occurrences across two partitions, violating the problem's core constraint",
    "Closing earlier would only affect performance, not correctness — ending the partition prematurely just means the algorithm does a bit more bookkeeping afterward to reconcile the split, but the final set of partition boundaries produced would still satisfy the one-letter-per-partition constraint",
    "Closing earlier is fine; it produces the same partitions in a different order — since partition boundaries are ultimately determined by letter positions rather than scan order, closing early just changes the sequence in which partitions are reported, not their actual sizes or contents"
  ],
  "answer": 0,
  "explanation": "The partition boundary must respect the LATEST last-occurrence among ALL letters included so far, not just whichever letter is currently being scanned — that's precisely what the running max in `end` accumulates. If an earlier letter in the partition has its last occurrence further out than the current character's, closing before reaching that point would leave that earlier letter's later occurrence stranded in a subsequent partition, breaking the 'each letter in at most one part' requirement."
}
```
