---
title: The Greedy Choice Property & Proving Correctness
type: concept
---

## What "greedy" actually is

A greedy algorithm builds an answer one decision at a time, and at each
step it commits to whatever looks best **right now** — the
locally-optimal choice — and **never reconsiders it**. No backtracking,
no lookahead, no "try this branch, and if it fails, undo." You make the
choice, fold it into the partial solution, and move on.

That is the entire strategy. Its appeal is obvious: greedy algorithms
are usually short, run in one pass, and use O(1) or O(n) extra space —
no recursion tree (Module 16's backtracking), no DP table (Module 24).
Where a brute force explores all 2ⁿ subsets and dynamic programming
fills a table of overlapping subproblems, greedy walks straight to an
answer.

And that is exactly why greedy is dangerous. **Being simple to write has
nothing to do with being correct.** For most problems, the natural
greedy rule you'd reach for first is *wrong* — it produces an answer,
the answer looks plausible, it passes your hand-picked test cases, and
it is silently suboptimal on inputs you didn't think of. The failure
mode of a bad greedy is never a crash. It's a confidently-returned wrong
answer. So the real content of this module is not the algorithms — most
are three lines — it's the **proof obligation**: before you trust a
greedy rule, you must prove the local choice never sacrifices the global
optimum. This lesson teaches the two standard proof techniques with
enough rigor that you can actually carry them out, not just name them.

## The setup: Activity Selection

We'll ground both techniques in one concrete problem, because a proof
technique described in the abstract is useless — you learn it by
executing it on something real.

**Activity Selection.** You're given `n` activities, each with a start
and finish time. Only one activity can run at a time (no overlaps). Pick
the **maximum number** of non-overlapping activities. This is the same
interval-scheduling problem you already met informally in Module 21
(Non-overlapping Intervals) — here we prove the greedy rule from
scratch.

The greedy rule we'll prove correct: **always pick the activity that
finishes earliest** among those that don't conflict with what you've
already chosen. Concretely:

```text
sort activities by finish time, then:
  take the first activity
  repeatedly: take the next activity whose start ≥ last chosen finish
```

Why *this* rule and not, say, "shortest activity first" or "earliest
start first"? Because we can prove it — and, as we'll see at the end,
those other plausible rules are provably wrong. Here's a small instance
to keep in front of us:

```text
activity:  A      B      C      D      E
[start,end): [1,3)  [2,5)  [4,7)  [6,8)  [5,9)

sorted by finish:  A(3)  B(5)  C(7)  D(8)  E(9)
greedy picks:      A, then C (starts 4 ≥ 3), then D (starts 6 ≥ 7? no)…
```

Let's not hand-wave the trace — the point of the lesson is the proof
that this rule is *always* optimal, for every input, which no amount of
tracing establishes. Two ways to prove it.

## Technique 1: the exchange argument

The exchange argument answers the question "how do I know the greedy
choice doesn't cost me later?" by a direct manipulation of an optimal
solution. The shape is always the same three steps:

1. **Assume** there exists an optimal solution `O` that does *not* make
   the greedy choice at some step (if every optimal solution already
   agrees with greedy, there's nothing to prove).
2. **Exchange** the differing element of `O` for the greedy choice, and
   show the result is *still a valid solution* and *no worse* than `O`.
3. **Conclude** that a solution agreeing with the greedy choice is at
   least as good as `O` — so making the greedy choice loses nothing.

Let's carry it out fully for Activity Selection. Sort all activities by
finish time so `f₁ ≤ f₂ ≤ … ≤ fₙ`. Greedy's first choice is activity 1
(earliest finish). Let `O` be any optimal selection, and let its
earliest-finishing activity be some activity `k`. Two cases:

- If `k = 1`, `O` already made the greedy choice. Nothing to do.
- If `k ≠ 1`, perform the exchange: **remove `k` from `O` and insert
  activity 1 in its place**, forming `O′ = (O \ {k}) ∪ {1}`.

Now the two things we must verify — this is where the rigor lives, not in
the maneuver but in checking it:

**`O′` is still valid (no overlaps).** Activity 1 finishes no later than
`k`, because 1 has the earliest finish time of *all* activities, so
`f₁ ≤ fₖ`. In `O`, activity `k` was the earliest-finishing member, so
every *other* activity in `O` starts at or after `fₖ` (they didn't
conflict with `k`). Since `f₁ ≤ fₖ`, those same activities also start at
or after `f₁` — swapping in activity 1, which finishes even earlier,
cannot create a conflict with any of them. `O′` is a valid selection.

**`O′` is no worse than `O`.** We removed exactly one activity and added
exactly one, so `|O′| = |O|`. Since `O` was optimal, `O′` is optimal too.

So there is an optimal solution — namely `O′` — that makes greedy's
first choice. Making that choice cost us nothing. Now the crucial part:
**after picking activity 1, the remaining problem is "select the most
activities from those starting at or after `f₁`"** — the same problem on
a smaller input. Apply the identical argument to that subproblem to
justify greedy's second choice, and so on by induction. At every step
there's an optimal solution agreeing with all of greedy's choices so
far; when greedy finishes, greedy *is* that optimal solution. ∎

Notice what did the work: the fact that the greedy choice (earliest
finish) leaves the most room for future choices. The exchange is only
safe because `f₁ ≤ fₖ`. Change the greedy rule to "earliest start" and
this inequality evaporates — the exchange can create an overlap, and the
proof collapses. **The proof is not decoration; it's the thing that
tells you whether the rule is even true.**

## Technique 2: greedy stays ahead

The exchange argument transforms an optimal solution into the greedy
one. The "greedy stays ahead" argument runs the other direction: it
shows, by induction on the steps, that greedy's partial solution is
**always at least as good as any other solution's partial solution at
the same step** — so greedy can never fall behind and end up worse.

For Activity Selection, "ahead" means: *after choosing its i-th
activity, greedy's i-th activity finishes no later than the i-th
activity of any other valid selection (when both are sorted by finish
time).* Finishing earlier is being "ahead" because it leaves the most
time for the activities still to come.

Let greedy pick activities `g₁, g₂, …` (in order), and let
`o₁, o₂, …` be any other valid selection sorted by finish time. Claim:
for every `i`, `finish(gᵢ) ≤ finish(oᵢ)`.

- **Base case (i = 1).** Greedy picks the globally earliest-finishing
  activity, so `finish(g₁) ≤ finish(o₁)` for any `o₁`. Greedy is ahead
  after one step.
- **Inductive step.** Suppose `finish(gᵢ) ≤ finish(oᵢ)`. The other
  selection's next activity `oᵢ₊₁` starts at or after `finish(oᵢ)`,
  which is `≥ finish(gᵢ)` by hypothesis. So `oᵢ₊₁` is a valid candidate
  for greedy's (i+1)-th pick — it doesn't conflict with `gᵢ`. Greedy
  chooses the *earliest-finishing* valid candidate, and `oᵢ₊₁` is *a*
  valid candidate, so `finish(gᵢ₊₁) ≤ finish(oᵢ₊₁)`. Greedy is still
  ahead.

Now finish the argument. Suppose, for contradiction, that some other
selection has *more* activities than greedy — say greedy picks `m`
activities and `o` picks `m+1` or more. Consider `oₘ₊₁`. By the claim,
`finish(gₘ) ≤ finish(oₘ)`, and `oₘ₊₁` starts at or after `finish(oₘ) ≥
finish(gₘ)` — so `oₘ₊₁` doesn't conflict with greedy's last pick. But
then greedy would *not* have stopped at `m`: an activity compatible with
`gₘ` still existed, and greedy always takes the next compatible one.
Contradiction. So no selection beats greedy's count. ∎

Both techniques prove the same theorem; which you reach for is taste and
convenience. Exchange arguments tend to be cleaner when there's a natural
"swap" (scheduling, MST edge selection). Stays-ahead is cleaner when the
solution is naturally an increasing sequence you can index and compare
step by step. Learn both — some proofs are far shorter in one form than
the other.

## Implementing the (now-proven) rule

Only *after* the proof do we write code. Activity Selection in full:

````tabs
```python
def max_activities(intervals: list[tuple[int, int]]) -> int:
    # intervals are (start, end); end is exclusive
    intervals.sort(key=lambda iv: iv[1])   # sort by finish time — the proven rule
    count = 0
    last_finish = float("-inf")
    for start, end in intervals:
        if start >= last_finish:           # compatible with what we've chosen
            count += 1
            last_finish = end              # commit; never reconsider
    return count
```

```typescript
function maxActivities(intervals: [number, number][]): number {
  // intervals are [start, end]; end is exclusive
  intervals.sort((a, b) => a[1] - b[1]); // sort by finish time — the proven rule
  let count = 0;
  let lastFinish = Number.NEGATIVE_INFINITY;
  for (const [start, end] of intervals) {
    if (start >= lastFinish) {
      // compatible with what we've chosen
      count++;
      lastFinish = end; // commit; never reconsider
    }
  }
  return count;
}
```
````

The single scan after sorting is O(n): each activity is examined once,
and the `if` does O(1) work. Sorting dominates.

```complexity
{
  "time": "O(n log n)",
  "space": "O(1) or O(n)",
  "why": "The greedy scan itself is O(n) — one pass, O(1) per activity. Sorting by finish time is O(n log n) and dominates. Extra space is O(1) beyond the input (just count and last_finish); O(n) only if the sort isn't in-place."
}
```

The lesson to internalize: the *code* is trivial and would look
identical for a wrong rule (swap the sort key to `iv[0]` and you have a
plausible, wrong, equally-short algorithm). The difference between
correct and wrong lives entirely in the proof — which is why every
problem lesson in this module leads with the correctness argument, not
the code.

## The warning: greedy without proof is a guess

Here is the counterexample to keep permanently in mind, because it makes
the whole point concrete. **Coin change**: given coin denominations and a
target amount, use the *fewest coins* that sum to the target.

The irresistible greedy rule: **always take the largest coin that still
fits.** For the coins most currencies actually use ({1, 5, 10, 25}),
this rule happens to be optimal — which is exactly why it *feels*
obviously correct. But "feels correct on the examples I tried" is not a
proof. Change the denominations to **{1, 3, 4}** and target **6**:

```text
greedy (largest first):  6 → take 4 → remainder 2 → take 1 → take 1
                         = 4 + 1 + 1  →  3 coins

optimal:                 3 + 3        →  2 coins
```

Greedy returns 3 coins; the optimum is 2. The greedy rule is **wrong**,
and nothing about the code would tell you so — it runs, it returns an
answer, the answer is plausible, and it's suboptimal. The only thing
that ever distinguishes "correct greedy" from "wrong greedy" is whether
you can prove the exchange/stays-ahead argument goes through. For coin
change with arbitrary denominations, you *can't* — no such proof exists,
and the correct algorithm is dynamic programming (Module 24), which
reconsiders choices instead of committing to them.

Take this as the module's governing rule: **a greedy algorithm you
can't prove is a guess wearing an algorithm's clothes.** Simple to write
is not the same as correct, and the whole skill being trained here is
telling the difference.

```quiz
{
  "questions": [
    {
      "question": "In the exchange argument for Activity Selection, why is swapping the optimal solution's earliest activity k for greedy's activity 1 guaranteed not to create an overlap?",
      "options": [
        "Because activity 1 has the globally earliest finish time (f₁ ≤ fₖ), so every other activity in O — which already started at or after fₖ — also starts at or after f₁, leaving no room for a new conflict",
        "Because the activities were chosen at random and overlaps are rare — with a large enough pool of candidate activities, conflicting start and end times are statistically unlikely to line up, so an overlap after the swap is improbable rather than provably impossible",
        "Because activity 1 has the same start time as activity k — since both activities begin at the identical point on the timeline, swapping one for the other cannot change which other activities they conflict with"
      ],
      "answer": 0,
      "explanation": "The entire validity of the exchange rests on f₁ ≤ fₖ. Activity 1 finishing no later than k means it can only free up more room, never take room away — so it can't conflict with anything that already fit after k. Break that inequality (e.g. by sorting on start time instead) and the exchange can create an overlap, which is the proof telling you the rule is wrong."
    },
    {
      "question": "The greedy 'largest coin first' rule gives the optimal answer for coins {1,5,10,25} but a suboptimal 3 coins (4+1+1) for {1,3,4} targeting 6, where the optimum is 2 coins (3+3). What is the correct lesson to draw?",
      "options": [
        "The bug is that greedy didn't try enough coins — if the algorithm had considered a wider range of coin combinations at each step instead of committing to the single largest one, it would have discovered the 3+3 solution",
        "Greedy is always wrong for coin change and should never be used — no coin denomination system can ever be proven optimal under the largest-first rule, so a correct implementation must always fall back to dynamic programming regardless of which coins are available",
        "The rule's correctness depends on the specific denominations — it happens to be provable for some coin systems and provably false for others, so passing tests on one coin set tells you nothing about another; only a proof does"
      ],
      "answer": 2,
      "explanation": "This is the module's core point made concrete: the SAME simple greedy rule is correct for one input family and wrong for another. Nothing in the code changes; only whether the exchange argument goes through changes. 'It worked on the coins I tried' is not evidence of correctness — the failure mode of a bad greedy is a silently suboptimal answer, not a crash."
    },
    {
      "question": "What is the essential difference between the 'exchange argument' and the 'greedy stays ahead' technique?",
      "options": [
        "Exchange is for sorting problems and stays-ahead is for graph problems — the two techniques are scoped to different problem domains, so which one applies is determined by whether the input is a sorted sequence or a graph structure",
        "They are the same technique with different names — both ultimately construct the identical proof by comparing greedy's choices against an arbitrary alternative solution, just described using different vocabulary",
        "Exchange transforms an assumed optimal solution into the greedy one (showing a swap never worsens it); stays-ahead uses induction to show greedy's partial solution is at every step at least as good as any other solution's, so it can never end up behind"
      ],
      "answer": 2,
      "explanation": "Both prove greedy is optimal, but from opposite directions: exchange starts from an optimum and morphs it toward greedy without loss; stays-ahead starts from greedy and shows by induction it dominates every competitor step for step. Which is cleaner depends on the problem's structure, so both are worth having in hand."
    }
  ]
}
```
