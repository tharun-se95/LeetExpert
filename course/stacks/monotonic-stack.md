---
title: The Monotonic Stack
type: concept
---

## The question it answers

A family of problems asks, for every element: **"where is the next
element to my right that is greater than me?"** (Or smaller, or the
previous one to the left — four symmetric flavors.) Daily temperatures,
stock spans, histogram rectangles, sliding-window maxima — all are this
question wearing costumes.

Brute force: for each element, scan right until something bigger
appears — O(n²) on descending-ish inputs. The fix is a stack with one
extra rule, and it computes ALL n answers in one O(n) pass.

## The mechanism

Scan left to right, keeping a stack of **indices whose answer is still
unknown**. Maintain one invariant:

> The stack's values are **strictly decreasing** from bottom to top.

When element x arrives, every index on top with value < x has just found
its answer — x is the first bigger thing to its right (nothing between
them was bigger, or it would have popped them earlier). Pop them,
record x as their answer, then push x, which now waits for *its* bigger
thing:

```text
values:  [2, 1, 5, 3]           processing 5:
stack:   [2, 1]   ← 5 arrives   pop 1 (answer: 5), pop 2 (answer: 5)
         [5]      ← push 5      5 waits; 3 arrives, 3 < 5: just push
         [5, 3]   ← end         5 and 3 never found answers: none exist
```

````tabs
```python
def next_greater(nums: list[int]) -> list[int]:
    answer = [-1] * len(nums)          # -1: no greater element exists
    stack: list[int] = []              # indices; values strictly decreasing
    for i, x in enumerate(nums):
        while stack and nums[stack[-1]] < x:
            answer[stack.pop()] = x    # x is their next greater
        stack.append(i)
    return answer
```

```typescript
function nextGreater(nums: number[]): number[] {
  const answer = new Array(nums.length).fill(-1); // -1: none exists
  const stack: number[] = []; // indices; values strictly decreasing
  for (let i = 0; i < nums.length; i++) {
    while (stack.length > 0 && nums[stack[stack.length - 1]] < nums[i]) {
      answer[stack.pop()!] = nums[i]; // nums[i] is their next greater
    }
    stack.push(i);
  }
  return answer;
}
```
````

Step through the mechanism on the example above — watch the stack shrink
on arrival and the answer row fill in from the pops:

```viz
{ "id": "monotonic-stack", "data": [2, 1, 5, 3] }
```

## The two arguments you must own

**Correctness.** When x pops index j, nothing between j and x was
greater than nums[j] — anything greater would have popped j already.
So x really is j's *first* greater-to-the-right. And indices still
stacked at the end genuinely have no answer: everything after them was
smaller (else they'd have popped). The invariant proves both directions.

**Cost.** The while loop inside a for loop *looks* quadratic. But each
index is pushed exactly once and popped at most once — total pops ≤ n
across the entire run. This is whole-execution accounting (Big O's
amortized lesson; the same argument as the cancellation scan): bound
the sum, not the step. O(n) total, honestly.

## Choosing your flavor

Four questions, four settings of two knobs — the scan direction stays
left-to-right; what changes is the pop comparison and what you record:

| Question | Stack kept… | Pop when incoming is… |
| --- | --- | --- |
| next greater | decreasing | greater |
| next smaller | increasing | smaller |
| previous greater | decreasing | (answer read at PUSH: the top below you) |
| previous smaller | increasing | (same, mirrored) |

Don't memorize the table — re-derive it each time from the invariant:
"what must the stack look like so that the top is exactly the candidate
my question needs?" The two problem lessons ahead (Daily Temperatures,
Largest Rectangle) each need a different row, and the histogram needs
*two at once*.

```quiz
{
  "questions": [
    {
      "question": "Why is the nested while-inside-for still O(n) total?",
      "options": [
        "The while rarely runs in practice",
        "Each index enters the stack once and leaves at most once — total pop-work across the WHOLE run is ≤ n, so the sum of all while-iterations is bounded, regardless of how any single step spikes",
        "Because the stack stays small"
      ],
      "answer": 1,
      "explanation": "Per-iteration bounds would give O(n²) and be uselessly loose. The push-once/pop-once budget is the amortized accounting pattern — the third time this course has used it (dynamic array, cancellation scan, now this)."
    },
    {
      "question": "When x pops index j, why is x guaranteed to be j's FIRST greater element to the right, not just some greater element?",
      "options": [
        "Because the scan goes left to right",
        "Any element between j and x that was greater than nums[j] would have popped j at ITS arrival — j still being on the stack certifies that nothing in between qualified",
        "Because the stack is sorted"
      ],
      "answer": 1,
      "explanation": "The stack holds exactly the still-unanswered indices. Survival ON the stack is itself the proof that no earlier arrival beat them — the data structure's state encodes the 'first' guarantee."
    },
    {
      "question": "You need, for each element, the nearest SMALLER element on its LEFT. What does the stack look like?",
      "options": [
        "Strictly decreasing; answers recorded on pop",
        "Increasing; the answer is read at PUSH time — after popping ≥ elements, the surviving top is the nearest smaller to the left",
        "It can't be done in one pass"
      ],
      "answer": 1,
      "explanation": "Previous-X questions read the answer when the element ARRIVES (what's below me after clearing non-candidates), next-X questions record when elements LEAVE. Re-deriving this from 'what must the top mean?' beats memorizing the four-row table."
    }
  ]
}
```
