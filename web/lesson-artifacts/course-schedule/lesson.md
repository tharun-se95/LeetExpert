---
title: "Course Schedule"
kicker: "Course Schedule · Graphs module · problem lesson"
headline: "Can this build ever finish, or will it wait on itself forever?"
lede: "A monorepo has dozens of packages, and each one lists the packages that must be built before it. The build system has to find an order that respects every list. If package A needs B, B needs C and C needs A, no order exists, and the pipeline would sit there forever. Deciding whether an order exists is exactly the Course Schedule problem, with courses as packages and prerequisites as dependencies."
chips:
  - "needs **a directed graph**"
  - "shape **peel off what is ready**"
  - "time **O(V + E)**"
hero: |
  <div class="hero-stage"><div class="hero-art navy"><svg id="heroBuild" viewBox="0 0 560 300" role="img" aria-label="Animation: six packages joined by arrows that mean must be built first. Packages with nothing left to wait on are built one at a time, lighting up the packages they unlock, until all six are built."></svg>
  <div class="hero-read" id="heroRead"><div class="hero-num"><b id="heroNum">0</b> of 6 built</div><div id="heroCap"></div></div></div></div>
---

## Problem {#problem}

```caption
Each arrow means “must be built before”.
```

There are `numCourses` courses, numbered `0` to `numCourses - 1`. The list `prerequisites` holds pairs `[a, b]`, each meaning: to take course `a` you must first take course `b`. Return `true` if it is possible to take every course, and `false` if not.

```examples
numCourses = 2, prerequisites = [[1,0]] → true (take 0, then 1)
numCourses = 2, prerequisites = [[1,0],[0,1]] → false (each waits on the other)
```

```constraint
Up to 2000 courses and up to 5000 prerequisite pairs.
```

Draw each pair `[a, b]` as an arrow from `b` to `a`, meaning "b must come before a". Now the courses are packages, the arrows are build dependencies, and the question is whether the build can run to the end. The only thing that can stop it is a loop of packages each waiting on the next, so what you are really asking is whether the arrows contain a cycle.

```widget #explore "Explore: run the build yourself"
<div class="extabs" role="group" aria-label="Choose a build"></div><div class="tv-wrap"><div class="tv"></div></div><div class="readout" aria-live="polite"></div><div class="actions"><button type="button" class="btn2 reset">Reset</button><button type="button" class="btn2 best">Show a valid order</button></div>
```

## Attempt it first {#attempt}

The module's topological-sort lesson asks one question about a directed graph: does a valid ordering exist at all? Before opening anything, work out what property of the arrows decides it.

A tempting shortcut is to count: "if there are at least as many arrows as courses, there must be a loop". It does not hold. The diamond in the widget above has 4 courses and 4 arrows and can be built. A different set of 5 courses with 5 arrows cannot. The same counts, opposite answers, so the answer lives in how the arrows connect, not how many there are.

Predict each build, then check.

```widget "Can every course be finished?"
<div id="predict"></div>
```

```reveal #hint "Hint: start from what can be built now"
Some courses have no prerequisites, so they can be taken immediately. Take them, and notice that other courses have now had a prerequisite satisfied.

Keep, for every course, the number of prerequisites not yet taken. When it reaches zero the course is ready. Repeat until nothing is ready.

Then ask how many courses you managed to take, and what it means if that is fewer than all of them.
```

## Two traps {#trap}

```caption
Trying every build order grows factorially with the number of courses.
```

**The first trap is trying every build order.** An order is valid if every prerequisite comes before the course that needs it, so generate the orders and test them:

```code slow_orderings "Try every build order"
```

It is correct and it is hopeless. There are n! orders of n courses, and when no valid order exists it has to test every one of them before it can say so. Even 10 courses is 3,628,800 orders. The chart counts the orders it really tests on a loop of n courses, against the work of the method below.

```widget "Work to detect a loop of n courses"
<div class="chart" id="cost"></div><div class="legend"><span><i style="background:var(--r-ink)"></i>test every order</span><span><i style="background:var(--g-ink)"></i>peel off what is ready</span></div><p class="cost-note"></p>
```

**The second trap is a good idea used half-way.** The approach in the next section builds courses that are ready and stops when nothing is ready. The mistake is to conclude "the queue is empty, so we finished". An empty queue happens in two very different situations: everything was built, or what is left is locked in a loop. The warning at the end of the solution shows the code that mixes them up.

## The insight {#insight}

```caption
A course is ready when its waiting count reaches 0.
```

Think about how a real build starts. Some packages depend on nothing, so they can be built immediately. Once they are built, some other packages have had all their prerequisites satisfied, and those can be built next. Keep going: build whatever is ready, and record what it releases.

To know when a course is ready, keep one number per course: how many of its prerequisites are still unbuilt. When a course is built, every course that waited on it drops by one. A course that reaches zero is ready. That is all the bookkeeping there is.

Now the argument that makes it a complete answer. If the build gets stuck with courses left over, every one of them has at least one unbuilt prerequisite, and that prerequisite is also left over, because otherwise it would have been built. Follow "an unbuilt prerequisite" from any leftover course and you can never leave the leftovers, and there are only finitely many of them, so you must revisit one: a loop. So a build that gets stuck has found a cycle. And if a cycle exists, its courses can never reach zero, because each one waits on another in the loop. Stuck and cycle are the same thing.

```key
Build whatever has no unbuilt prerequisites. If every course gets built, an order exists. If some are left, they are waiting on each other in a cycle.
```

```rosetta "The code, read as a build system"
In the code | In the system
`[course, prereq]` | a dependency: the prerequisite package must be built first
`waiting[c]` | how many of package c's dependencies are not built yet
`ready` | packages the build can start right now
`unlocks[c]` | the packages that were waiting on c
`built` | how many packages the pipeline has completed
`built == num_courses` | the whole repo built, so no dependency loop
```

Watch it run. The arrows read "must be built before". The number under a course counts its unbuilt prerequisites, and a blue course is ready.

```widget #stepper "Run the build"
<div class="extabs" role="group" aria-label="Choose a build"></div><div class="plhost"></div>
```

## Solution {#solution}

Attempt it on paper first: decide what you keep per course, how a course becomes ready, and exactly what the final answer compares. Then compare. Read it as the build scheduler: a table of unmet dependencies, a queue of ready packages, and a count of what actually shipped.

`````reveal #solbox "Show the solution"
```code solution "Build what is ready, then count"
```

```notes
The first loop turns each pair into an arrow from the prerequisite to the course and counts, for every course, how many prerequisites it waits on. Every course with a count of zero starts in the queue. The main loop builds a ready course, lowers the count of each course that was waiting on it, and queues any that reach zero. At the end, `built` is compared with the number of courses: equal means every course was reachable, and fewer means the rest are locked in a cycle.

The loop is a queue and not recursion, so a chain of 2000 courses cannot overflow the call stack. A depth-first search with three colours finds cycles too, but in Python a chain that long would exceed the default recursion limit.
```

```derivation
**Time O(V + E).** Reading the pairs is E steps and filling the tables is V. After that each course is dequeued exactly once, and each arrow is used exactly once, to lower a count. On the diamond (V = {{V}}, E = {{E}}) that is {{V}} + {{E}} setup steps plus {{V}} dequeues plus {{E}} decrements, {{work}} in all, as measured. At the constraint's limits that is at most 2000 + 5000 in each phase, a few tens of thousands of steps, where testing every order was hopeless.

**Space O(V + E).** The adjacency lists hold every arrow once, and the counts and queue hold one entry per course.
```

````warn
Do not return `true` just because the queue ran out. A loop of courses never enters the queue, so the queue empties with the loop still unbuilt. That version answers true for all {{wrongCount}} of the builds tested here that contain a cycle, including the loop of three courses in the second example, where the answer is false.

```code mistake_true "The mistake"
```
````
`````

## Variants {#variants}

The same peeling process, asked a different question.

```variants
[
  {
    "title": "Course Schedule II",
    "source": "return the order",
    "text": "The same process, but you return the sequence in which courses were built, or an empty list when a cycle blocks it. The order you already recorded is the answer."
  },
  {
    "title": "Parallel Courses",
    "source": "count the rounds",
    "text": "Build everything that is ready at the same moment as one round, then the next wave. The number of waves is the fewest semesters, and a leftover course means the loop again."
  },
  {
    "title": "Task scheduling in real tools",
    "source": "same graph, real names",
    "text": "Package managers, build systems and CI pipelines all model tasks this way. A reported dependency cycle is exactly the stuck case: the tool lists the courses that never became ready."
  }
]
```

## Check yourself {#quiz}

```quiz
{
  "questions": [
    {
      "question": "The queue of ready courses has just run empty. Why is that alone not enough to say the answer is true?",
      "options": [
        "It empties in two cases: every course was built, or the rest wait on each other in a loop and were never queued. Only the built count against the total tells them apart.",
        "An empty queue proves every course was queued at some point: a course enters the queue when its waiting count reaches zero, and every count reaches zero in the end.",
        "The queue also empties early when the input repeats a prerequisite pair, because the duplicate lowers one count twice; the final check is there to rule those duplicates out."
      ],
      "answer": 0,
      "explanation": "A course only enters the queue when its waiting count reaches zero. A course inside a cycle never gets there, so it is never queued and never built, yet the queue still ends up empty. That is why the code ends with <code>built == num_courses</code>. The version that returns true after the loop says true for the loop of three courses as well."
    },
    {
      "question": "On the build with prerequisites <code>[[1,0],[2,1],[3,2],[4,3],[2,4]]</code>, which courses get built before the process stalls?",
      "options": [
        "Courses {{list_STALL_order}}. Course 2 waits on 1 and on 4, 4 waits on 3, and 3 waits on 2, so courses {{list_STALL_stuck}} never start.",
        "None of them: once the graph holds a cycle anywhere, the waiting counts never all reach zero, so the queue starts out empty and nothing is ever built.",
        "Courses 0, 1 and 2: course 2 becomes ready once course 1 is built, and the loop through 3 and 4 only blocks the courses that come after it."
      ],
      "answer": 0,
      "explanation": "A cycle blocks only what is inside it and what depends on it. Courses 0 and 1 have no prerequisites in the loop, so they are built. Course 2 has two prerequisites, 1 and 4. Course 1 is done, but 4 needs 3, and 3 needs 2, so 2 keeps waiting on 4 forever. The page above runs exactly this build in the third tab."
    },
    {
      "question": "Where does the O(V + E) time come from?",
      "options": [
        "Each course leaves the queue once and each arrow is followed once, lowering one waiting count: V dequeues plus E decrements, plus the pass that builds the tables.",
        "Each built course scans the list of all E arrows to find the ones leaving it, but the scan stops at the first match, so on average it costs about one step per arrow.",
        "The queue holds at most V courses, and each is compared with every arrow when it is dequeued, so the work is V for the queue plus E for those comparisons."
      ],
      "answer": 0,
      "explanation": "The adjacency list means a built course only looks at the arrows leaving it, not at all E. Summed over every course, those are exactly E looks. Counting on the loop chart above: about 2n work for n courses, while testing every order needs n!."
    }
  ]
}
```

