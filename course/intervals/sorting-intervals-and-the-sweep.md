---
title: Sorting Intervals & the Sweep
type: concept
---

## Why intervals are hard in the wrong order

An interval is just a pair `[start, end]` with `start <= end`, standing
for a stretch of a line — a time range, a numeric range, a segment of a
road. Almost every question you can ask about a *collection* of them is
some flavour of "how do these overlap?": merge the ones that touch,
count how many pile up at once, remove the fewest to leave the rest
disjoint. And in **arbitrary order**, every one of those questions is an
all-pairs question — interval *i* might overlap interval *j* for any
*i*, *j*, so naively you compare all n(n−1)/2 pairs, **O(n²)**.

Module 14 already showed the escape hatch on two headline problems —
**Merge Intervals** and **Meeting Rooms II**. Both opened with the same
move: sort first, then walk left to right in one pass. This lesson
extracts *why* that move works so reliably, so you can reach for it on
problems you haven't seen. There are exactly three ideas to nail down:
the overlap condition (stated precisely, not by picture), the choice of
sort key (start vs. end — they are **not** interchangeable), and the
sweep itself (walk the sorted sequence maintaining running state).

## The overlap condition, derived

Take two intervals `a = [a.start, a.end]` and `b = [b.start, b.end]`.
We want a single boolean that is true exactly when they share at least
one point. It is easier to characterise when they **don't** overlap,
because that has only two cases, and then negate.

Two intervals are disjoint when one lies entirely to the left of the
other:

- `a` is entirely left of `b`: `a.end < b.start`
- `b` is entirely left of `a`: `b.end < a.start`

Those are the *only* two ways to miss — there's nowhere else on a line
for a segment to be relative to another segment except left of it,
right of it, or touching it. So:

```text
disjoint  ⇔  (a.end < b.start)  OR  (b.end < a.start)
```

Overlap is the negation. Apply De Morgan's law (`not (P or Q)` becomes
`not P and not Q`):

```text
overlap   ⇔  NOT(a.end < b.start)  AND  NOT(b.end < a.start)
          ⇔  (a.end >= b.start)    AND  (b.end >= a.start)
```

Rearranged into the form you'll see everywhere:

```text
overlap   ⇔  a.start <= b.end  AND  b.start <= a.end
```

This is worth deriving rather than memorising because the boundary is a
*decision*, not a fact. We used `<` for disjoint (so `a.end == b.start`
counts as overlapping — the intervals touch at a shared endpoint). If
your problem treats touching endpoints as **not** overlapping (a meeting
ending at 10 doesn't clash with one starting at 10), you flip those to
`<=` in the disjoint test, which makes the overlap test strict:
`a.start < b.end AND b.start < a.end`. Same derivation, one choice
changed on purpose. Merge Intervals wanted touching to merge (`[1,4]`
and `[4,5]` become `[1,5]`); Meeting Rooms wants touching to be fine.
Neither is "the" answer — you pick based on the problem, and the
derivation is what lets you pick correctly instead of guessing.

```diagram
{
  "id": "interval-timeline",
  "intervals": [
    { "start": 1, "end": 100, "label": "[1,100]" },
    { "start": 2, "end": 3, "label": "[2,3]" },
    { "start": 4, "end": 5, "label": "[4,5]" }
  ],
  "domain": [0, 105]
}
```

## Why sorting collapses all-pairs to neighbours

Here is the load-bearing claim, the one that makes O(n log n) possible:

> Once the intervals are sorted by start, if the current interval does
> **not** overlap the running state, no *later* interval can retroactively
> overlap something already behind the running state either.

Why? After sorting by start, starts only increase as you move right. So
when you're standing at interval *i* and it doesn't reach back far enough
to touch what came before, every interval after *i* starts at least as
late as *i* does — it reaches back even *less*. The past is settled; you
never have to look backward more than one step. That is exactly the
argument Merge Intervals rested on, and it generalises: **sorting turns a
question about all pairs into a question about adjacent elements**, and
adjacent-element questions are answerable in one linear pass. Sorting
costs O(n log n) once; the pass is O(n); the O(n log n) sort dominates
and the whole thing beats O(n²).

## Sort by start, or sort by end?

Both are "sort the intervals," but they encode different intentions, and
swapping them silently breaks algorithms. The rule of thumb:

- **Sort by start** when you're building up or scanning a timeline in the
  order things *begin* — merging overlapping ranges, checking whether a
  schedule has any clash, inserting a new range. You process intervals in
  the order they enter the picture.
- **Sort by end** when you're making a *greedy commitment* and want to
  leave as much room as possible for whatever comes next — "keep the
  interval that frees up earliest." This is the shape behind
  Non-overlapping Intervals and Burst Balloons later in this module, and
  it is genuinely a greedy strategy (Module 22 will prove why the
  earliest-ending choice is safe).

A concrete contrast. Consider `[[1,100], [2,3], [4,5]]`.

**Sorted by start** it's already `[[1,100],[2,3],[4,5]]`. If your job is
to *merge*, you walk it keeping a current range: start at `[1,100]`, then
`[2,3]` overlaps (2 ≤ 100) and is absorbed, then `[4,5]` overlaps (4 ≤
100) and is absorbed → one merged interval `[1,100]`. Start order is
right here because merging is about *which begins-inside-which*.

**Sorted by end** it's `[[2,3],[4,5],[1,100]]`. Now suppose the job is
"keep as many mutually non-overlapping intervals as possible." Greedily
take `[2,3]` (ends earliest, 3). Next `[4,5]` starts at 4 > 3, no clash,
keep it (now ends at 5). Next `[1,100]` starts at 1, which *is* ≤ 5 —
clash, discard. You keep two intervals. Had you sorted by start and
greedily kept `[1,100]` first, you'd block both small intervals and keep
only one. The end-sorted order is what makes the greedy choice optimal,
because ending early is precisely what leaves the most room afterward.
Same three intervals, two different sort keys, two different correct
algorithms — the key is chosen by what you're trying to prove, never by
habit.

## The sweep: one pass, some running state

Strip the specifics away and every interval algorithm in this module has
the same skeleton. Sort the intervals (or their endpoints) into event
order, then walk left to right carrying a small amount of **running
state**, updating it at each interval:

````tabs
```python
def sweep(intervals: list[list[int]]) -> object:
    intervals.sort(key=lambda iv: iv[0])   # or iv[1] — the key IS the design decision
    state = initial_state()
    for start, end in intervals:
        state = update(state, start, end)  # the only problem-specific line
    return finish(state)
```

```typescript
function sweep(intervals: number[][]): unknown {
  intervals.sort((a, b) => a[0] - b[0]); // or a[1]-b[1] — the key IS the design decision
  let state = initialState();
  for (const [start, end] of intervals) {
    state = update(state, start, end); // the only problem-specific line
  }
  return finish(state);
}
```
````

What changes between problems is *only* what "state" is and how `update`
adjusts it:

- Merge Intervals: state is the current merged range; `update` extends it
  or emits it and starts fresh.
- Meeting Rooms II: state is a running count of live meetings (via two
  sorted endpoint lists); `update` is +1 on a start, −1 on an end, and
  tracks the peak.
- Non-overlapping Intervals: state is the end of the last kept interval;
  `update` keeps or drops the current interval by comparing to it.

Recognising the skeleton is the point of this concept lesson. When you
meet a new interval problem, the first two questions are always: *what is
the running state, and which endpoint do I sort on so that a single
left-to-right pass keeps that state correct?* Answer those and the code
writes itself.

```complexity
{
  "operations": [
    { "name": "naive all-pairs overlap scan", "time": "O(n²)", "why": "in arbitrary order any interval can overlap any other, so you compare all n(n−1)/2 pairs" },
    { "name": "sort by start or end", "time": "O(n log n)", "why": "a comparison sort on n intervals; this step dominates the total cost" },
    { "name": "the sweep afterward", "time": "O(n)", "why": "one left-to-right pass; sortedness means each interval is compared only against O(1) running state, never against all predecessors" },
    { "name": "total (sort + sweep)", "time": "O(n log n)", "why": "the sort dominates the linear sweep, so the collection is processed in O(n log n) instead of O(n²)" }
  ]
}
```

```quiz
{
  "questions": [
    {
      "question": "The overlap test `a.start <= b.end && b.start <= a.end` was derived by negating the disjoint condition. Why is deriving it (rather than memorizing it) worth the trouble?",
      "options": [
        "Memorizing it is fine; the derivation adds nothing — since the formula is short enough to recall directly, working through the De Morgan's-law negation each time is unnecessary overhead that doesn't change how the formula is applied",
        "The boundary case — whether two intervals sharing exactly one endpoint count as overlapping — is a deliberate choice encoded in the strict-vs-nonstrict inequality, and the derivation is what lets you set that boundary correctly for a given problem instead of guessing",
        "The derived form is faster to compute than the memorized form — negating the disjoint condition through De Morgan's law produces an expression with fewer comparisons than checking overlap directly, shaving a constant factor off every check"
      ],
      "answer": 1,
      "explanation": "Disjoint-via-`<` makes touching endpoints overlap; disjoint-via-`<=` makes touching endpoints disjoint. Different problems want different answers (merge wants touching to merge; meeting attendance wants touching to be fine). The derivation exposes exactly which inequality to flip, turning an error-prone guess into a decision."
    },
    {
      "question": "Sorting by start reduces overlap-checking to comparing only adjacent intervals. What is the actual reason a later interval can never overlap something already behind the running state?",
      "options": [
        "Because sorting removes overlapping intervals from the list — the sort step itself deduplicates and merges any intervals that touch or overlap before the adjacent-pair scan even begins, so no overlapping pair is left for the scan to find",
        "Because overlapping intervals always appear next to each other in the input — regardless of the original ordering, any two intervals that overlap are guaranteed to already be positioned as neighbors before sorting, which is what the sort step preserves rather than creates",
        "Because after sorting by start, starts only increase moving right — so if the current interval doesn't reach back to the running state, every later interval starts even later and reaches back even less, making the past permanently settled"
      ],
      "answer": 2,
      "explanation": "It is monotonicity of the sort key doing the work: non-decreasing starts mean 'reach-back' can only shrink as you advance, so once the current interval fails to touch the past, nothing after it can either. This is what makes a single O(1)-lookback pass sufficient instead of an O(n) backward scan at each step."
    }
  ]
}
```
