# Family 5 — State Transition Cheat Sheets

One-page refreshers. Depth lives in Part 2; use these the night before.

---

## Memoization

**Recognition:** recursive overlap, cache by args, number of ways, Fibonacci / climb stairs bridge to DP  
**Complexity:** Time O(#states × work per state) · Space O(#states) + recursion depth  
**Data Structure:** Map / array keyed by immutable state — sticky notes so you never redo the same homework  
**Difficulty:** Easy–Medium · **Interview Frequency:** High

### Template

```pseudo
memo = {}
function f(state):
    if state in memo: return memo[state]
    if is_base(state): return base_value
    ans = combine(f(next1), f(next2), …)
    memo[state] = ans
    return ans
```

### Common Questions

- Climbing Stairs · House Robber · Unique Paths · Decode Ways · Word Break · Regular Expression Matching

### Common Mistakes

- Mutable / incomplete keys (must hash a frozen snapshot)
- Missing base cases → infinite recursion

---

## Dynamic Programming

**Recognition:** ways / min / max with overlapping subproblems, coin change, LIS, LCS, edit distance, knapsack  
**Complexity:** Time O(#states × transitions) · Space O(#states) or rolling O(prev row)  
**Data Structure:** Table / rolling arrays filled in dependency order  
**Difficulty:** Medium–Hard · **Interview Frequency:** Very High

### Template

```pseudo
dp = init base cases
for state in safe_order:
    dp[state] = best/combine over transitions from smaller states
return dp[target]
```

### Common Questions

- Climbing Stairs · Coin Change · Longest Increasing Subsequence · Longest Common Subsequence · Edit Distance · Partition Equal Subset Sum

### Common Mistakes

- Wrong state (missing a dimension)
- Filling in an order that reads unready values
- Calling it "greedy" without a proof when DP is required

---

## Greedy

**Recognition:** local choice with a clear proof; jump reachability; gas station circuit; activity / interval selection  
**Complexity:** Often O(n) or O(n log n) after sort · Space O(1)–O(n)  
**Data Structure:** Sorted choices / running extremum (no full DP table) — pick the best move *when a proof says that is safe*  
**Difficulty:** Medium · **Interview Frequency:** High

### Template

```pseudo
# Only when local choice is provably safe (exchange / stay-ahead)
sort or scan in the justified order
for each candidate:
    if locally_safe(candidate, state):
        commit(candidate); update state
return state / answer
```

### Common Questions

- Assign Cookies · Jump Game · Gas Station · Non-overlapping Intervals · Jump Game II · Candy

### Common Mistakes

- Picking greedy because it "looks optimal" without a two-sentence proof
- Using greedy when overlapping suboptimal structure needs DP

> Prefer DP when counting ways or min cost reuses sub-answers; prefer greedy
> when a local rule stays globally safe. Decision-tree leaf: "Greedy — verify proof."
