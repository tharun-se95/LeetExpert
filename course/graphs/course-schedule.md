---
title: Course Schedule
type: problem
---

## Problem

There are `numCourses` courses, labeled `0` to `numCourses - 1`. Some
courses have prerequisites, given as pairs `[a, b]` meaning "to take
course `a`, you must first take course `b`." Return `true` if it's
possible to finish all courses (i.e. the prerequisite requirements can
all be satisfied), or `false` otherwise. (LeetCode 207.)

**Examples**

```text
numCourses = 2, prerequisites = [[1,0]]         → true
   (take 0, then 1)

numCourses = 2, prerequisites = [[1,0],[0,1]]   → false
   (1 needs 0, but 0 needs 1 — impossible)
```

**Constraints:** up to `2000` courses, up to `5000` prerequisite pairs.

## Attempt it first

Model each prerequisite pair `[a, b]` as a directed edge `b → a` ("b
must come before a"). The question "can all courses be finished" is then
exactly this module's Topological Sort concept lesson's central
question: does a valid ordering of this directed graph exist at all?
Before opening anything, recall precisely what property of a directed
graph determines whether it does.

````reveal Hint — this is exactly "does this directed graph have a cycle"
A valid course order exists if and only if the prerequisite graph is a
DAG (directed, acyclic) — the Topological Sort concept lesson proved
this precisely: a cycle forces some course to be a prerequisite of
itself, transitively, which is impossible to satisfy. So this problem
doesn't need to construct the actual ordering at all (that's the very
next problem, Course Schedule II) — it only needs a yes/no cycle check,
which can use EITHER Kahn's algorithm (check whether every course
reaches in-degree zero) or the DFS three-color method from the DFS & BFS
concept lesson (check for a back edge into a node still on the current
recursion stack).
````

## The insight

Build the directed graph from the prerequisite pairs, then run a cycle
check. Kahn's algorithm is shown as the primary solution since it's
purely iterative (no recursion-depth concern on graphs with up to 2000
courses) and its "did every vertex reach in-degree zero" check is a
direct, mechanical translation of "does a valid order exist" — exactly
as derived in the concept lesson.

## Solution

`````reveal Solution — Kahn's algorithm, checking whether every course is reachable
````tabs
```python
from collections import deque

def can_finish(num_courses: int, prerequisites: list[list[int]]) -> bool:
    adj: list[list[int]] = [[] for _ in range(num_courses)]
    indegree = [0] * num_courses
    for course, prereq in prerequisites:
        adj[prereq].append(course)      # edge: prereq -> course
        indegree[course] += 1

    queue = deque(c for c in range(num_courses) if indegree[c] == 0)
    completed = 0
    while queue:
        course = queue.popleft()
        completed += 1
        for next_course in adj[course]:
            indegree[next_course] -= 1
            if indegree[next_course] == 0:
                queue.append(next_course)

    return completed == num_courses     # everyone reached in-degree 0 → no cycle
```

```typescript
function canFinish(numCourses: number, prerequisites: number[][]): boolean {
  const adj: number[][] = Array.from({ length: numCourses }, () => []);
  const indegree = new Array(numCourses).fill(0);
  for (const [course, prereq] of prerequisites) {
    adj[prereq].push(course); // edge: prereq -> course
    indegree[course]++;
  }

  const queue: number[] = [];
  for (let c = 0; c < numCourses; c++) {
    if (indegree[c] === 0) queue.push(c);
  }

  let completed = 0;
  let head = 0;
  while (head < queue.length) {
    const course = queue[head++];
    completed++;
    for (const next of adj[course]) {
      indegree[next]--;
      if (indegree[next] === 0) queue.push(next);
    }
  }

  return completed === numCourses; // everyone reached in-degree 0 → no cycle
}
```
````

`completed == num_courses` is the direct cycle check the concept lesson
derived: every course that made it into the queue had every one of its
prerequisites already satisfied (in-degree zero), so if any courses are
missing from that count, they — and whatever they're mutually waiting
on — are trapped in a cycle of unsatisfiable prerequisites.

```complexity
{
  "time": "O(V + E)",
  "space": "O(V + E)",
  "why": "Building the adjacency list and in-degree array is O(E). The Kahn's algorithm loop visits every vertex once and every edge once (each edge triggers exactly one in-degree decrement), O(V + E). Space is the adjacency list, O(V + E), plus O(V) for in-degree and the queue."
}
```
`````

## Variants

- **Course Schedule II** (next lesson): the natural extension — instead
  of a yes/no answer, return the actual valid order (or an empty array
  if impossible), reusing this exact algorithm's `queue`/`order`
  machinery directly.
- **Topological Sort** (concept lesson, this module): the full
  derivation of both algorithms (Kahn's and DFS-based) this problem
  applies directly, plus the correctness proof for why a missing vertex
  count signals a cycle.
- **Redundant Connection** (this module): a different flavor of cycle
  detection — there, the graph is UNDIRECTED and Union-Find is the
  natural tool, rather than Kahn's/DFS on a directed graph.

```quiz
{
  "question": "This problem never explicitly checks 'is there a cycle' with a separate cycle-detection routine — it only checks whether `completed == num_courses` after running Kahn's algorithm. Why is that count comparison a complete and correct substitute for an explicit cycle check?",
  "options": [
    "A course can only be dequeued (and counted) after every one of its prerequisites has already been dequeued, so any course whose prerequisite chain loops back on itself can never reach in-degree zero and is therefore never counted — meaning the count falls exactly as short of num_courses as there are courses trapped in cycles",
    "The count comparison works only because prerequisites are guaranteed not to contain cycles by the problem's constraints — the problem statement promises an acyclic input, which is what lets the algorithm skip an explicit check and simply trust the final count",
    "It isn't fully correct — a separate DFS-based cycle check is also required for correctness, since Kahn's algorithm alone can miss cycles that don't involve any in-degree-zero starting vertex"
  ],
  "answer": 0,
  "explanation": "This is the exact mechanism the Topological Sort concept lesson proved: reaching in-degree zero requires every predecessor to already be placed, which a cycle structurally prevents for every course involved in it (each is waiting on another that's also stuck). The final count is therefore an exact census of non-cycle-trapped courses — no separate cycle-detection pass is needed because the counting IS the cycle detection, for free, as a side effect of the algorithm's own termination condition."
}
```
