---
title: Course Schedule II
type: problem
---

## Problem

Same setup as Course Schedule: `numCourses` courses and a list of
prerequisite pairs `[a, b]` meaning "b before a." Return **any valid
order** in which to take all the courses, or an empty array if no valid
order exists (a cycle makes it impossible). (LeetCode 210.)

**Examples**

```examples
numCourses = 2, prerequisites = [[1,0]] → [0,1]
numCourses = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]] → [0,1,2,3]  (or [0,2,1,3])
numCourses = 1, prerequisites = [] → [0]
```

```constraint
up to `2000` courses, up to `5000` prerequisite pairs.
```

## Attempt it first

This is Course Schedule with one change: instead of a boolean, return
the order itself. Before opening anything, revisit your Course Schedule
solution (or the Topological Sort concept lesson directly) and identify
exactly which variable in Kahn's algorithm already contains — as a side
effect of its normal operation — precisely the sequence this problem
asks for.

```sandbox
{
  "id": "course-schedule-ii",
  "fn": {
    "python": "find_order",
    "javascript": "findOrder"
  },
  "check": "return",
  "property": "topological-order",
  "starter": {
    "python": "def find_order(num_courses, prerequisites):\n    # Return any order that satisfies every prerequisite, or [] if none does.\n    pass\n",
    "javascript": "function findOrder(numCourses, prerequisites) {\n  // Return any order that satisfies every prerequisite, or [] if none does.\n}\n"
  },
  "cases": [
    {
      "args": [
        4,
        [
          [
            1,
            0
          ],
          [
            2,
            0
          ],
          [
            3,
            1
          ],
          [
            3,
            2
          ]
        ]
      ]
    },
    {
      "args": [
        2,
        [
          [
            1,
            0
          ],
          [
            0,
            1
          ]
        ]
      ]
    },
    {
      "args": [
        1,
        []
      ]
    },
    {
      "args": [
        2,
        [
          [
            1,
            0
          ]
        ]
      ]
    },
    {
      "args": [
        3,
        [
          [
            0,
            1
          ],
          [
            1,
            2
          ],
          [
            2,
            0
          ]
        ]
      ]
    },
    {
      "args": [
        5,
        [
          [
            1,
            0
          ],
          [
            2,
            1
          ],
          [
            3,
            2
          ],
          [
            4,
            3
          ]
        ]
      ]
    },
    {
      "args": [
        3,
        []
      ]
    }
  ]
}
```

````reveal Hint — the queue's dequeue order already IS the topological order
Kahn's algorithm, run for Course Schedule, dequeues each course only
after all its prerequisites have already been dequeued — which means
the SEQUENCE of dequeues is already a valid topological order, i.e. a
valid course-taking order. Course Schedule only needed the final COUNT
of how many courses got dequeued; this problem needs the actual
sequence, so the only change is: instead of just incrementing a
counter, append each dequeued course to a result list, and return that
list (or an empty list if the count comes up short — the same cycle
check as before).
````

## The insight

Literally no new algorithmic idea beyond Course Schedule — this is the
same Kahn's-algorithm run, with the dequeue sequence collected into the
output instead of merely counted. This is worth noting explicitly: it's
common for two "different" LeetCode problems to be the exact same
algorithm with a trivially different final step, and recognizing that
is itself a skill worth building.

## Solution

`````reveal Solution — Kahn's algorithm, returning the dequeue order directly
````tabs
```python
from collections import deque

def find_order(num_courses: int, prerequisites: list[list[int]]) -> list[int]:
    adj: list[list[int]] = [[] for _ in range(num_courses)]
    indegree = [0] * num_courses
    for course, prereq in prerequisites:
        adj[prereq].append(course)
        indegree[course] += 1

    queue = deque(c for c in range(num_courses) if indegree[c] == 0)
    order: list[int] = []
    while queue:
        course = queue.popleft()
        order.append(course)            # the dequeue sequence IS the valid order
        for next_course in adj[course]:
            indegree[next_course] -= 1
            if indegree[next_course] == 0:
                queue.append(next_course)

    return order if len(order) == num_courses else []   # short count → cycle → impossible
```

```typescript
function findOrder(numCourses: number, prerequisites: number[][]): number[] {
  const adj: number[][] = Array.from({ length: numCourses }, () => []);
  const indegree = new Array(numCourses).fill(0);
  for (const [course, prereq] of prerequisites) {
    adj[prereq].push(course);
    indegree[course]++;
  }

  const queue: number[] = [];
  for (let c = 0; c < numCourses; c++) {
    if (indegree[c] === 0) queue.push(c);
  }

  const order: number[] = [];
  let head = 0;
  while (head < queue.length) {
    const course = queue[head++];
    order.push(course); // the dequeue sequence IS the valid order
    for (const next of adj[course]) {
      indegree[next]--;
      if (indegree[next] === 0) queue.push(next);
    }
  }

  return order.length === numCourses ? order : []; // short count → cycle → impossible
}
```
````

Compare this line-by-line against Course Schedule's solution: identical
graph construction, identical queue loop — the ONLY difference is
`order.append(course)` replacing `completed += 1`, and returning `order`
(or `[]`) instead of a boolean derived from a count. Everything else,
including the cycle-detection reasoning, carries over unchanged.

```complexity
{
  "time": "O(V + E)",
  "space": "O(V + E)",
  "why": "Identical to Course Schedule — building the graph is O(E), the Kahn's algorithm loop is O(V + E). Collecting the order costs O(1) per dequeue, adding no extra asymptotic cost. Space is O(V + E) for the graph plus O(V) for the queue and output."
}
```
`````

## Variants

- **Course Schedule** (previous lesson): the exact algorithm this
  solution reuses, minus the collection step — worth re-reading side by
  side to see how little actually changed.
- **Alien Dictionary** (LeetCode 269, not covered): a harder application
  of the same topological-sort-on-Kahn's-algorithm idea, where the
  graph's edges must first be INFERRED from a list of sorted words
  before the same algorithm runs.
- **Topological Sort** (concept lesson, this module): the DFS-based
  alternative (postorder, reversed) would work equally well here — worth
  implementing as an exercise to confirm it produces an equally valid
  (though possibly different) order.

```quiz
{
  "question": "Course Schedule returns a boolean; Course Schedule II returns the actual order. Given how similar the two solutions are, why does Course Schedule NOT already implicitly produce a valid order as a byproduct that could simply be exposed, rather than requiring the explicit `order.append(course)` change?",
  "options": [
    "Course Schedule's algorithm is fundamentally different and doesn't produce an order at all — it only tracks a running count of dequeued courses and discards each course's identity immediately after counting it, so no ordering information survives the run",
    "The order can only be recovered by re-running the algorithm with cycle detection disabled — since Course Schedule's version stops tracking identities once it confirms feasibility, a second pass with the cycle check turned off is needed to actually reconstruct the sequence",
    "Course Schedule's algorithm DOES internally dequeue courses in a valid order — the only reason it wasn't 'already producing' the order as a visible output is that its code only kept a running COUNT of dequeues rather than appending each one to a list; the underlying dequeue sequence was a valid topological order the whole time, just never collected"
  ],
  "answer": 2,
  "explanation": "This is the entire point of comparing the two problems: Kahn's algorithm's dequeue order is ALWAYS a valid topological order whenever one exists, regardless of whether the calling code happens to record it. Course Schedule threw that sequence away and kept only a count because a count was all it needed; Course Schedule II needs the sequence itself, so the fix is purely about what gets recorded, not about the algorithm's underlying behavior, which was producing a valid order all along."
}
```
