---
title: 1D DP Patterns
type: concept
---

## The general shape

The simplest DP shape is a single array `dp[]` indexed by position in a
sequence, where `dp[i]` depends on a small, FIXED set of earlier
indices — `dp[i-1]`, `dp[i-2]`, or occasionally a bounded window further
back. This lesson names the shape and its recognition signal; the two
problems that anchor it (Climbing Stairs, House Robber) get their own
full problem lessons later in this module, so treatment here stays
brief and illustrative.

## Recognizing it: what makes a problem "1D DP"

The tell is that the state needed to describe "the best answer up to
position `i`" fits in a **fixed number of preceding values** — not the
entire history, just the last one or two. From Module 24's earlier
lesson, this is exactly what makes tabulation's space optimization
possible: if `dp[i]` only ever reads `dp[i-1]` and `dp[i-2]`, you never
need the full table, only two rolling variables.

**Climbing Stairs** (full treatment later in this module): `dp[i]` = the
number of ways to reach step `i`, given you can climb 1 or 2 steps at a
time. Since your last move landed you on step `i` either from step
`i-1` (a 1-step climb) or step `i-2` (a 2-step climb), and every way of
reaching `i` splits cleanly into exactly one of those two cases:

```text
dp[i] = dp[i-1] + dp[i-2]
```

This is literally the Fibonacci recurrence from the previous lesson,
wearing a different name — recognizing that equivalence on sight is
itself a useful skill.

**House Robber** (full treatment later in this module): `dp[i]` = the
maximum money robbable from the first `i` houses, given adjacent houses
can't both be robbed. At house `i`, there's a genuine CHOICE — rob it
(collect `nums[i]`, but then house `i-1` is forbidden, so add `dp[i-2]`)
or skip it (carry forward `dp[i-1]` unchanged):

```text
dp[i] = max(dp[i-1], dp[i-2] + nums[i])
```

The structural difference from Climbing Stairs is worth naming
precisely: Climbing Stairs SUMS both ways of arriving (every path counts
independently, since the question is "how many ways"), while House
Robber takes the MAX of two competing choices (since the question is
"the best value," and only one choice can be taken at each position).
Same "depends on `i-1` and `i-2`" shape, different combining operator —
`+` for counting, `max` for optimizing — and that operator is exactly
what the problem statement's own question ("how many" vs. "the best")
tells you to use.

## The recognition checklist

Before reaching for a 2D table, ask: does the state I need at position
`i` reduce to a small, constant number of earlier `dp` values? If yes,
this is a 1D DP problem, and the derivation pattern is always the same —
identify what choice or split happens at position `i`, express each
option in terms of already-solved smaller subproblems, and combine with
whichever operator (`+`, `max`, `min`) the question is actually asking
for.

```quiz
{
  "question": "Climbing Stairs sums dp[i-1] and dp[i-2]; House Robber takes their max (well, max(dp[i-1], dp[i-2] + nums[i])). Both are 1D DP with the same 'depends on the previous two positions' shape. What determines which combining operator is correct?",
  "options": [
    "The operator follows directly from what the problem is actually asking: 'how many total ways' requires SUMMING every distinct way of arriving (each path is counted once, and different paths are independent alternatives to add together), while 'the best/maximum achievable value' requires taking the MAX of competing choices, since only one choice can actually be taken and the others are alternatives to discard, not accumulate",
    "The operator is arbitrary and either problem could use either operator with a different constant tacked on — swapping sum for max in either recurrence would just shift the final numeric answer by some fixed offset, without changing which problem the recurrence actually solves",
    "Sum is always used for problems with two subproblems, and max is used for problems with more than two — the choice of operator is dictated purely by how many earlier dp values the recurrence happens to reference, independent of what the problem is actually asking for"
  ],
  "answer": 0,
  "explanation": "The recurrence's shape (which earlier states it depends on) and its combining operator answer two different questions. The shape comes from the problem's structural constraint (how can you reach state i). The operator comes from what quantity the problem wants: counting distinct possibilities sums them; optimizing a value maxes (or mins) over competing options. Misreading which one the problem wants is a common, avoidable DP bug."
}
```
