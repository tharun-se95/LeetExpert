---
title: Practice
type: practice
---

## How to practice this module

DP drills reward **naming the state first**: what does dp[i] mean, and which
choices build it? Climbing-stairs and house-robber are 1-D; coin-change and
partition-equal are knapsack-shaped; LIS / LCS and edit-distance are
sequence DP; house-robber-iii is tree DP. Done when all ten show Solved in
the hub.

## Problems

```practice-problems
- slug: climbing-stairs
  pattern: 1-D linear recurrence
  difficulty: Easy
  watch_for: dp[i] = dp[i-1] + dp[i-2]; nail the bases for n = 0, 1, 2 and iterate upward
- slug: house-robber
  pattern: Take / skip 1-D
  difficulty: Medium
  watch_for: dp[i] = max(skip, rob[i] + dp[i-2]); the empty and single-house bases are where people off-by-one
- slug: coin-change
  pattern: Unbounded knapsack min
  difficulty: Medium
  watch_for: For each amount, minimise over coin choices; seed dp[0] = 0 and use a large sentinel for unreachable amounts
- slug: longest-increasing-subsequence
  pattern: O(n^2) LIS
  difficulty: Medium
  watch_for: dp[i] = 1 + max dp[j] over j < i with nums[j] < nums[i]; the answer is the max over all i, not dp[n-1]
- slug: unique-paths
  pattern: Grid fill from corners
  difficulty: Medium
  watch_for: The first row and column are all 1; each cell sums top + left — loop from the top-left corner
- slug: longest-common-subsequence
  pattern: 2-D match table
  difficulty: Medium
  watch_for: Equal characters -> 1 + diagonal; otherwise max of up / left; pad the table with one zero row and column
- slug: edit-distance
  pattern: 2-D edit table
  difficulty: Hard
  watch_for: Insert, delete and replace are the three transitions from the neighbouring cells; base rows are the full length, not 0
- slug: partition-equal-subset-sum
  pattern: Subset-sum boolean DP
  difficulty: Medium
  watch_for: Target = total / 2 (an odd total fails immediately); iterate amounts high-to-low so an item is never reused
- slug: word-break
  pattern: Prefix-reachable boolean
  difficulty: Medium
  watch_for: dp[i] is reachable if some dp[j] holds and s[j:i] is a word; a trie over the dictionary makes the check cheap
- slug: house-robber-iii
  pattern: Tree DP pairs
  difficulty: Medium
  watch_for: Each node returns (rob, skip); a parent that robs needs both children to skip — post-order is the natural order
```
