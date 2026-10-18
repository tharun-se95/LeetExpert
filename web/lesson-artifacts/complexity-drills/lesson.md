---
title: "Complexity Drills"
kicker: "Big O & Complexity Analysis · practice lesson"
headline: "Six scenarios, six code shapes: commit before you reveal."
lede: "Back on the warehouse floor one last time. Below are six real-world code snippets representing the classic patterns: sequential passes, shrinking bounds, halving loops, hidden body costs, branching recursion, and matrix scans. For each drill: commit to a time and auxiliary-space answer before opening the reveal, and check whether your prediction matches the instrumented operation count."
chips:
  - "commit to time and space **before revealing**"
  - "price the loop body **honestly**"
  - "branching twice with halving **is linear O(n)**"
hero: |
  <div class="hero-stage"><div class="hero-art navy"><svg id="heroDrills" viewBox="0 0 560 220" role="img" aria-label="Animation: Six complexity drill scenario cards highlighting patterns from sequential loops to recursive branching."></svg>
  <div class="hero-read" id="heroRead"><div class="hero-num"><b id="heroNum">1</b> <span id="heroUnit">of 6 drills</span></div><div id="heroCap"></div></div></div></div>
---

## How to drill {#problem toc="How to drill"}

```caption
Commit to a prediction first; the counted ratios then show which rule you applied and which one you missed.
```

```vig "A target bullseye beside a clipboard checklist"
<circle class="st" cx="50" cy="56" r="30"/><circle class="fa" cx="50" cy="56" r="20"/><circle class="fk" cx="50" cy="56" r="10"/><path class="st" d="M100 56H130M125 51L130 56L125 61"/><rect class="fa" x="144" y="26" width="60" height="66" rx="6"/><circle class="fg" cx="160" cy="42" r="5"/><circle class="fg" cx="160" cy="58" r="5"/><circle class="fg" cx="160" cy="74" r="5"/>
```

Complexity analysis is a reading skill. When you encounter code in an interview or code review, you need to recognize its growth rate by reading its loop bounds, function calls, and data structures.

For each of the six drills below:
1. Read the drill's code, in either language: the menu on the code block switches both.
2. Pick your prediction for **time complexity** and **auxiliary space**.
3. The page then runs an instrumented copy of the code and shows what it counted at n, 2n and 4n, and why those counts follow the rule you were applying.

## Drill 1: Sequential passes {#solution toc="Drill 1"}

```caption
Two passes over the same list: price each loop on its own, then decide how they combine.
```

```vig "Two separate sequential loop passes over a collection"
<rect class="fa" x="20" y="44" width="80" height="26" rx="4"/><path class="st" d="M110 57H136M131 52L136 57L131 62"/><rect class="fk" x="146" y="44" width="80" height="26" rx="4"/>
```

**The scenario:** Two separate passes over the same collection — first tallying every package's weight, then subtracting half of each one.

```code drill1 "Drill 1: net_weight, two sequential loops"
```

```widget #drill-card-1 "Drill 1: Predict time and auxiliary space"
```

## Drill 2: Triangular dependent bounds {#build toc="Drill 2"}

```caption
The inner loop's start depends on the outer one: count how many comparisons each outer step leaves.
```

```vig "A triangular staircase of comparison blocks"
<rect class="fa" x="20" y="80" width="30" height="20" rx="3"/><rect class="fa" x="54" y="60" width="30" height="40" rx="3"/><rect class="fa" x="88" y="40" width="30" height="60" rx="3"/><rect class="fk" x="122" y="20" width="30" height="80" rx="3"/>
```

**The scenario:** Every package checked against every package that comes after it, searching for a pair that cancels out to zero.

```code drill2 "Drill 2: count_cancelling_pairs, a triangular nest"
```

```widget #drill-card-2 "Drill 2: Predict time and auxiliary space"
```

## Drill 3: Halving outer with full inner {#insight toc="Drill 3"}

```caption
Two loops, but only one of them is as long as the input: find out how long each is.
```

```vig "Outer halving loop multiplied by a full linear inner scan"
<path class="st" d="M30 30H110M30 55H70M30 80H50"/><rect class="fk" x="140" y="24" width="80" height="66" rx="4"/>
```

**The scenario:** An outer loop halves a round size while an inner loop re-weighs the whole shelf of n packages on every single round.

```code drill3 "Drill 3: weigh_in_rounds, halving outer loop"
```

```widget #drill-card-3 "Drill 3: Predict time and auxiliary space"
```

## Drill 4: Hidden slice and scan {#trap toc="Drill 4"}

```caption
One line in the loop body reads like a single question; price what it really does.
```

```vig "A loop icon concealing an expanding buffer underneath"
<circle class="st" cx="60" cy="56" r="26"/><path class="sc" d="M78 40L86 48L78 56"/><rect class="fr" x="120" y="40" width="90" height="32" rx="4"/>
```

**The scenario:** For every package, a check looks for the same weight among the packages that come after it.


```code drill4 "Drill 4: has_duplicate, a slice in the body"
```

```widget #drill-card-4 "Drill 4: Predict time and auxiliary space"
```

```warn
Pricing a loop body by how many lines it has instead of what each line does. `x in nums[i + 1:]` is one expression, but it builds a new list of the remaining items and then walks it, and a loop pays that price once per item. Price every line of the body on its own before you multiply by the number of times the loop runs.
```

## Drill 5: Branching twice and halving {#cost toc="Drill 5"}

```caption
Two calls per call, on half the input each: count the calls, then count the frames alive at once.
```

```vig "A binary recursion tree branching down to leaf nodes"
<circle class="fa" cx="120" cy="20" r="10"/><line class="st" x1="112" y1="28" x2="80" y2="52"/><line class="st" x1="128" y1="28" x2="160" y2="52"/><circle class="fa" cx="80" cy="56" r="8"/><circle class="fa" cx="160" cy="56" r="8"/><line class="st" x1="74" y1="62" x2="50" y2="84"/><line class="st" x1="86" y1="62" x2="100" y2="84"/><line class="st" x1="154" y1="62" x2="140" y2="84"/><line class="st" x1="166" y1="62" x2="190" y2="84"/>
```

**The scenario:** A task delegated to two assistants, each getting half the load, repeating recursively.

```code drill5 "Drill 5: halving_sum, two calls per call"
```

```widget #drill-card-5 "Drill 5: Predict time and auxiliary space"
```

```key
Counting how many calls a function makes per call is not enough to price it: the depth of the recursion tree decides how many leaves it ends with.
```

## Drill 6: Full n × n matrix traversal {#node toc="Drill 6"}

```caption
Here n is the side of the grid, not the number of cells: be clear which one you are measuring against.
```

```vig "An n by n grid of cells with an arrow scanning each row"
<rect class="fa" x="40" y="24" width="22" height="22" rx="3"/><rect class="fa" x="66" y="24" width="22" height="22" rx="3"/><rect class="fa" x="92" y="24" width="22" height="22" rx="3"/><rect class="fa" x="40" y="50" width="22" height="22" rx="3"/><rect class="fa" x="66" y="50" width="22" height="22" rx="3"/><rect class="fa" x="92" y="50" width="22" height="22" rx="3"/><rect class="fa" x="40" y="76" width="22" height="22" rx="3"/><rect class="fa" x="66" y="76" width="22" height="22" rx="3"/><rect class="fk" x="92" y="76" width="22" height="22" rx="3"/>
```

**The scenario:** Packages arranged in a full n × n grid; the job is to find the single heaviest package.

```code drill6 "Drill 6: heaviest, an n by n grid"
```

```widget #drill-card-6 "Drill 6: Predict time and auxiliary space"
```

## Where next {#next toc="Where next"}

```vig "Signpost pointing down three paths"
<path class="st" d="M120 100V24"/><rect class="fa" x="68" y="22" width="104" height="14" rx="4"/><rect class="fa" x="76" y="42" width="96" height="14" rx="4"/><rect class="fk" x="68" y="62" width="104" height="14" rx="4"/>
```

```variants
[
  {
    "title": "Arrays & Dynamic Arrays",
    "source": "Linear Structures stage",
    "text": "The foundations of sequential memory: pointer arithmetic, contiguous storage, and in-place transformations."
  },
  {
    "title": "Nodes and Pointers",
    "source": "Linked Lists module",
    "text": "Moving from contiguous arrays to node-link structures where elements point to memory locations."
  },
  {
    "title": "Math for DSA",
    "source": "Foundations stage",
    "text": "Floor arithmetic, bit manipulation, logarithms, and summation series that prove the complexity classes used throughout the course."
  }
]
```

## Check yourself {#quiz toc="Quiz"}

```vig "Three question rows with one checked off"
<circle class="fg" cx="36" cy="24" r="10"/><path class="st" d="M31 24L35 28L42 20"/><circle class="st" cx="36" cy="56" r="10"/><circle class="st" cx="36" cy="88" r="10"/><rect class="fa" x="58" y="19" width="150" height="10" rx="5"/><rect class="fa" x="58" y="51" width="118" height="10" rx="5"/><rect class="fa" x="58" y="83" width="138" height="10" rx="5"/>
```

```quiz
{
  "questions": [
    {
      "question": "A function is defined by `f(n) = 1 if n <= 1 else f(n - 1) + f(n - 1)`. It branches twice per call, like Drill 5. What is its time complexity?",
      "options": [
        "O(n): two calls per level, but every call does only a constant amount of work itself",
        "O(2ⁿ): n levels deep, and the width doubles at every level",
        "O(n²): two calls at each of the n levels multiply into n × n calls"
      ],
      "answer": 1,
      "explanation": "Drill 5's input halved, so its tree was only log₂ n levels deep. Here the input shrinks by one, so the tree is n levels deep and the calls double at each: {{q1_calls}} calls at n = {{q1_n}} and {{q1_next}} at the next n. Branching twice is cheap only when the depth is logarithmic."
    },
    {
      "question": "A loop starts with `size = len(nums)`, then repeats: add up the first `size` items of `nums`, then do `size //= 2`, until `size` reaches 0. How does its running time grow?",
      "options": [
        "O(n log n): about log n rounds, and each round adds up as many as n items",
        "O(n): the rounds cost n, n/2, n/4, … items, which add up to less than 2n",
        "O(log n): the size halves every round, so only a logarithmic number of items is ever touched"
      ],
      "answer": 1,
      "explanation": "This looks like Drill 3 but the inner loop is not a full pass: it shrinks with size. Over the {{q2_rounds}} rounds at n = {{q2_n}} it counted {{q2_work}} items, where the n log n guess predicts {{q2_nlogn}}. A geometric series n + n/2 + n/4 + … is dominated by its first term."
    },
    {
      "question": "A recursive binary search halves the list each call, but passes `nums[mid + 1:]` or `nums[:mid]` to the next call instead of moving indices. Is it O(log n) time?",
      "options": [
        "Yes, O(log n): each call does only a constant amount of work after it halves the list",
        "No, O(n log n): each of the log n calls copies the whole list again",
        "No, O(n): the copies are about n/2, n/4, … items, which add up to under n"
      ],
      "answer": 2,
      "explanation": "Drill 4's rule applies: a slice is a loop. Each call copies only the half it passes on, so the copies shrink geometrically: {{q3_copied}} items copied in total at n = {{q3_n}}, under n. The time is O(n), and the slices alive on the stack add up to O(n) space too, where moving indices needs O(log n) time and copies nothing."
    }
  ]
}
```
