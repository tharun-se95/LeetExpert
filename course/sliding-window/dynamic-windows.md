---
title: Dynamic Windows & the Shrink Invariant
type: concept
---

## When the window's SIZE is the unknown

Fixed windows answer "best window of size k." A different family of
questions makes k itself the answer: *shortest* subarray with sum ≥
target, *longest* substring without repeats. Here the window has to
**grow and shrink** as it slides — a dynamic (variable-size) window.

The shape: two pointers `left` and `right`, both starting at 0. `right`
expands the window one step at a time; whenever the window becomes
**invalid** by some problem-specific rule, `left` advances to shrink it
back to valid. Both pointers only ever move forward — each takes at
most n steps total, so the whole scan is **O(n)**, not O(n²), even
though it looks like a loop inside a loop.

```text
target sum ≥ 7, nums = [2, 3, 1, 2, 4, 3]

right=0: [2]            sum=2  invalid, keep expanding
right=1: [2,3]           sum=5  invalid
right=2: [2,3,1]         sum=6  invalid
right=3: [2,3,1,2]       sum=8  valid! shrink:
  left→1: [3,1,2]        sum=6  invalid again — stop shrinking, record length 4→ but
                                  we already had length 4 at left=0; try smaller windows as right grows
right=4: [3,1,2,4]       sum=10 valid! shrink:
  left→2: [1,2,4]        sum=7  valid! shrink:
    left→3: [2,4]        sum=6  invalid — stop; best length so far = 3
```

(Minimum Size Subarray Sum works this exact trace in full, with the
running best tracked precisely.)

```viz
{ "id": "dynamic-window", "data": [2, 3, 1, 2, 4, 3], "target": 7 }
```

## Why "expand right, shrink left" is safe — the monotonicity requirement

This only works because of a property worth naming explicitly:
**growing the window can only make it MORE valid (or keep it valid),
and shrinking can only make it LESS valid (or keep it valid)** — for
whatever "valid" means in the problem. Formally: validity is monotonic
in window size, for a fixed left or a fixed right endpoint.

For "sum ≥ target" with non-negative numbers, this is obviously true:
adding an element can't decrease the sum, so growing never hurts
validity, and removing an element can't increase it, so shrinking never
helps. **This is why the technique needs non-negative numbers here** —
with negative values, a longer window could have a *smaller* sum, and
the whole one-directional shrink logic collapses (you'd have no
guarantee that shrinking makes things worse, so you couldn't safely
stop). Whenever you reach for a dynamic window, ask explicitly: *"if
this window is invalid, is EVERY larger window (with this same left)
also invalid? Is every smaller window (with this same right) also
valid, once I've shrunk enough?"* If you can't answer yes, the
technique doesn't apply as-is — same discipline as the elimination
proof from Two Pointers.

## The template

Two variants, depending on whether you're chasing "smallest valid" or
"largest valid" — the difference is *when* you record the answer.

**Shrink while valid, record the smallest** (find minimum window
satisfying a lower-bound condition):

````tabs
```python
def shortest_valid(arr) -> int:
    left = 0
    state = init_state()          # e.g. running sum, running count
    best = float("inf")
    for right in range(len(arr)):
        state = extend(state, arr[right])          # expand
        while is_valid(state):                      # shrink while still valid
            best = min(best, right - left + 1)
            state = shrink(state, arr[left])
            left += 1
    return best if best != float("inf") else 0
```

```typescript
function shortestValid(arr: number[]): number {
  let left = 0;
  let state = initState(); // e.g. running sum, running count
  let best = Infinity;
  for (let right = 0; right < arr.length; right++) {
    state = extend(state, arr[right]); // expand
    while (isValid(state)) {
      // shrink while still valid
      best = Math.min(best, right - left + 1);
      state = shrink(state, arr[left]);
      left++;
    }
  }
  return best === Infinity ? 0 : best;
}
```
````

**Shrink until valid, record the largest** (find maximum window
satisfying an upper-bound condition, e.g. "at most k distinct"):

````tabs
```python
def longest_valid(arr) -> int:
    left = 0
    state = init_state()
    best = 0
    for right in range(len(arr)):
        state = extend(state, arr[right])           # expand
        while not is_valid(state):                  # shrink UNTIL valid
            state = shrink(state, arr[left])
            left += 1
        best = max(best, right - left + 1)           # record AFTER restoring validity
    return best
```

```typescript
function longestValid(arr: number[]): number {
  let left = 0;
  let state = initState();
  let best = 0;
  for (let right = 0; right < arr.length; right++) {
    state = extend(state, arr[right]); // expand
    while (!isValid(state)) {
      // shrink UNTIL valid
      state = shrink(state, arr[left]);
      left++;
    }
    best = Math.max(best, right - left + 1); // record AFTER restoring validity
  }
  return best;
}
```
````

The mirror-image structure is worth staring at: `while (isValid)` versus
`while (!isValid)`, and the record happening *inside* the shrink loop
versus *after* it. Getting these backwards is the single most common
sliding-window bug — swap them and the code often still runs, just
computes the wrong thing on some inputs, silently.

## Why total cost is still O(n)

`right` advances n times, total, across the whole run. `left` advances
at most n times, total, across the whole run — it never resets or moves
backward. Two pointers, each making at most n forward steps: **O(n)
total work**, even though the shrink loop is textually nested inside
the expand loop. This is the exact push-once/pop-once accounting from
the Monotonic Stack lesson, wearing yet another costume: bound the sum
of all iterations across the *entire* run, not the worst case of one
outer step.

```quiz
{
  "questions": [
    {
      "question": "Why does 'shrink while sum ≥ target' require non-negative numbers?",
      "options": [
        "It doesn't — the technique works for any numbers; the shrink loop's stop condition only checks the current sum against the target, which stays a valid check no matter what sign the array's elements happen to have",
        "The shrink logic relies on validity being monotonic in window size — with negative numbers, removing an element could INCREASE the sum, so a window that looks invalid after shrinking might become valid again later, breaking the one-directional stop condition",
        "Negative numbers are slower to add — arithmetic involving a sign bit takes marginally more CPU cycles than unsigned addition, which is the actual reason the technique's performance guarantee depends on non-negative inputs"
      ],
      "answer": 1,
      "explanation": "Monotonicity is the load-bearing assumption, not a technicality. Without it, 'shrink until invalid, then stop' can skip over valid windows or stop too early — the algorithm would need a fundamentally different approach (like prefix sums with a sorted structure)."
    },
    {
      "question": "A dynamic-window solution has a nested while loop inside a for loop. Why is the total cost still O(n) and not O(n²)?",
      "options": [
        "Because the window has bounded size — since the window can never grow past a fixed maximum length for this kind of problem, the inner while loop is capped at that same constant regardless of how large the input array gets",
        "left and right EACH advance at most n times across the entire run — they never reset — so total iterations of both loops combined is bounded by 2n, regardless of how the work is distributed across outer steps",
        "The while loop rarely executes — on typical, non-adversarial inputs the shrink condition fails most of the time, so the nested loop's real-world behavior stays close to linear even though its worst case looks quadratic"
      ],
      "answer": 1,
      "explanation": "Same accounting discipline as the monotonic stack: sum the total movement of each pointer across the WHOLE execution, not the worst case of a single outer iteration. Neither pointer ever moves backward, which is what caps the total at O(n)."
    },
    {
      "question": "In the 'longest valid' template, why is best updated AFTER the shrink loop rather than inside it?",
      "options": [
        "Style preference — either position works; recording the best length before or after the shrink loop produces the identical final answer, since the loop always converges to the same valid window regardless of when the measurement is taken",
        "To save one comparison per iteration — moving the update outside the shrink loop means it only runs once per outer iteration instead of once per shrink step, which is purely a minor performance optimization",
        "The window is only guaranteed valid once the shrink loop exits (that's its exit condition) — recording during shrinking would credit an invalid window's length as if it were a valid answer"
      ],
      "answer": 2,
      "explanation": "The two templates are mirror images for a reason: 'shrink WHILE valid' means every window seen mid-shrink IS still valid (record inside); 'shrink UNTIL valid' means windows mid-shrink are NOT yet valid (record only after). Placing the record on the wrong side of the loop is the classic bug this lesson warns about."
    }
  ]
}
```
