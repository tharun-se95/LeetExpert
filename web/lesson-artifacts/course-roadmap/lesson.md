---
title: "The Roadmap"
kicker: "The Roadmap · Getting Started module · concept lesson"
headline: "Why do the 24 modules come in this order?"
lede: "A serious culinary program does not teach dishes at random. Knife skills come before sauces and sauces before composed plates, because each course leans on what the last one built into your hands. The 24 modules of this course are grouped into five stages the same way. This page lays the course out as a map, lets you ask what any module leans on, and then turns the ordering rule into a function you can run."
chips:
  - "the course has **five stages**"
  - "each module **leans on earlier ones**"
  - "an order is valid when **nothing comes first that needs something later**"
hero: |
  <div class="hero-stage"><div class="hero-art navy"><svg id="heroMap" viewBox="0 0 560 300" role="img" aria-label="Animation: five columns of dots, one per stage of the course. The stages light up one after another from the first to the fifth, and a counter climbs to the number of modules in the course."></svg>
  <div class="hero-read" id="heroRead"><div class="hero-num"><b id="heroNum">0</b> <span id="heroUnit">modules</span></div><div id="heroCap"></div></div></div></div>
---

## The training menu {#graph}

```caption
The order is a dependency order: each stage uses what the stages before it built.
```

```vig "Five columns of growing height, each one standing on the one before it"
<rect class="fa" x="14" y="76" width="34" height="22" rx="4"/><rect class="fa" x="58" y="62" width="34" height="36" rx="4"/><rect class="fa" x="102" y="46" width="34" height="52" rx="4"/><rect class="fa" x="146" y="30" width="34" height="68" rx="4"/><rect class="fk" x="190" y="14" width="34" height="84" rx="4"/><path class="st" d="M10 100H228"/>
```

Most confusion in data structures and algorithms comes from meeting an idea before the idea it is made from. The course avoids that by ordering its modules so that each one leans only on modules taught earlier, and by grouping them into ==stages== that each add one kind of thing. Foundations teach how the course works and the analysis vocabulary the rest is written in. Linear Structures are the core containers. Techniques on Linear Data are ways to use them that turn quadratic scans into linear or logarithmic work. Recursive and Hierarchical brings in recursion and the tree-shaped structures built on it. Global Reasoning ends with problems where the answer depends on the whole input at once.

The map is the course's real module list, grouped by stage. Pick any module to see what it leans on and why.

```widget #map "Explore: what each module leans on"
<div id="rmFacts"></div><div class="rm-lanes" id="rmLanes"></div><ul class="rm-key" aria-label="Key"><li><i class="sel"></i>the module you picked</li><li><i class="dep"></i>it leans on this directly</li><li><i class="ind"></i>it leans on this through another</li><li><i class="use"></i>this leans on it directly</li></ul><div class="rm-read" id="rmRead" aria-live="polite"></div>
```

```key
Later stages are not harder for their own sake: they are built from the earlier ones, so the order is the dependency order.
```

## What leans on what {#pointers}

```caption
Every link is one claim with one reason, and it points back to a module the course teaches earlier.
```

```vig "Three boxes with arrows pointing back from each to the one before it"
<rect class="fa" x="14" y="40" width="56" height="32" rx="6"/><rect class="fa" x="92" y="40" width="56" height="32" rx="6"/><rect class="fk" x="170" y="40" width="56" height="32" rx="6"/><path class="sc" d="M92 56H72"/><path class="sc" d="M76 52L72 56L76 60"/><path class="sc" d="M170 56H150"/><path class="sc" d="M154 52L150 56L154 60"/>
```

The links below are the ones the course itself states or that one line can justify. Sliding Window uses arrays and a hash map of what is inside the window. Binary Trees need recursion. Heaps are trees. Graphs use queues and hash maps. A module can lean on several modules, and those lean on others, so what sits underneath a module is more than its direct links. The map above counts both.

The list is short on purpose. A link goes in only if its reason fits in one line, because a link with no reason cannot be checked, and an unchecked link is the first to go wrong.

```widget "Every link and its reason"
<dl class="rm-links" id="rmLinks"></dl>
```

## Checking an order {#attempt}

```caption
A valid order is one where every module's place is later than the place of everything it leans on.
```

```vig "A numbered row of five slots with a short arrow from the fourth back to the second"
<rect class="st" x="10" y="52" width="38" height="30" rx="5"/><rect class="st" x="54" y="52" width="38" height="30" rx="5"/><rect class="st" x="98" y="52" width="38" height="30" rx="5"/><rect class="fa" x="142" y="52" width="38" height="30" rx="5"/><rect class="st" x="186" y="52" width="38" height="30" rx="5"/><path class="sc" d="M161 52Q108 14 73 50"/><path class="sc" d="M79 44L73 50L81 52"/>
```

Putting the rule into code gives the course a way to test itself. Given an `order` (a list of module names) and `deps` (each module mapped to the modules it leans on), the function answers one question: does every module come after everything it needs?

```code solution "is_valid_order"
```

```rosetta "The code, read as a rule"
In the code | What it checks
`place[name] = i` | where each module sits: one position per module
`name in place` on the way in | no module is listed twice, so every module has a single place
`name not in place` | a module the table names is actually taught
`dep not in place` | what it needs is taught too
`place[dep] >= place[name]` | what it needs is not strictly earlier, so the order is broken
```

It makes two passes: one over the order to record each place, and one over the links to compare two places each. That is the order's length plus the number of links, a single sweep rather than a search. Remembering the places is what makes each comparison one lookup instead of a scan of the order.

Hold the course's own order to the table and then break it. The five orders below are built from the real modules. Click two modules in the list to swap them and watch where the full check objects.

```widget #order "Try: check an order against the table"
<div class="extabs" role="group" aria-label="Choose an order"></div><ol class="rm-order" id="rmOrder" aria-label="The order, first module first"></ol><p class="lv-hint" id="rmSwapHint"></p><div class="rm-verdict" id="rmFull" aria-live="polite"></div><div class="rm-verdict" id="rmNear" aria-live="polite"></div>
```

## Checking only neighbours {#trap}

```caption
A broken dependency can sit any distance away, so comparing each module with the next one proves nothing about the rest.
```

```vig "A row of four boxes, the first and the last joined by a long arc that no short arrow between neighbours can cover"
<rect class="fr" x="14" y="52" width="38" height="30" rx="5"/><rect class="st" x="68" y="52" width="38" height="30" rx="5"/><rect class="st" x="122" y="52" width="38" height="30" rx="5"/><rect class="fa" x="176" y="52" width="38" height="30" rx="5"/><path class="sc" d="M33 52Q114 4 195 50"/><path class="sc" d="M190 44L195 50L187 51"/>
```

The tempting shortcut is to compare each module with the one right after it. It does catch the simple slips: put Strings straight before Arrays and the pair is visibly wrong. But a module and the one it leans on need not be neighbours, and a check that looks only at adjacent pairs never sees them.

````warn
Comparing only adjacent modules misses any break that is not between neighbours. Move Recursion & Backtracking to just after Heaps: no module now sits directly before one it leans on, so the neighbour check returns True. Binary Trees, though, comes several places before the Recursion it needs, and the full check returns False. In both languages.

```code mistake "Only the next module is compared"
```
````

Pick "Recursion after Heaps" in the checker above and compare the two verdict lines. The full check names the broken pair; the neighbour check says the order is fine.

## How to move through it {#walk}

```caption
In order if you are building from scratch; back up a stage if a module feels hard in a missing-pieces way.
```

```vig "A path through five numbered stops with a short side branch that loops back one stop"
<circle class="fa" cx="26" cy="56" r="9"/><circle class="fa" cx="76" cy="56" r="9"/><circle class="fa" cx="126" cy="56" r="9"/><circle class="fa" cx="176" cy="56" r="9"/><circle class="fk" cx="216" cy="56" r="9"/><path class="st" d="M35 56H67M85 56H117M135 56H167M185 56H207"/><path class="sc" d="M176 46Q151 12 126 46" stroke-dasharray="4 4"/>
```

The links make the advice concrete. If you are building from scratch, go in order: the dependencies are real, so each module finds the ones it needs already in your hands. If you are refreshing, jump in at the module you want, and use the map above to see what sits underneath it. When a module feels hard because pieces are missing rather than because the idea is new, the missing pieces are among its links: back up to them, or one stage if you are not sure which.

Do not stockpile theory. A stage's techniques only settle once you have done its problems, so finish a module's problems before starting the next module. Momentum through problems beats coverage of prose.

## Where next {#next}

```vig "Three sketches: a ruler with growth marks, a small network of four nodes, and a staircase of three steps"
<path class="st" d="M10 56H70"/><path class="sc" d="M14 56V44M30 56V38M46 56V30M62 56V22"/><circle class="fa" cx="108" cy="34" r="6"/><circle class="fa" cx="148" cy="34" r="6"/><circle class="fa" cx="108" cy="72" r="6"/><circle class="fa" cx="148" cy="72" r="6"/><path class="st" d="M114 34H142M108 40V66M148 40V66M114 72H142"/><path class="st" d="M176 84H196V66H216V48H232"/>
```

```variants
[
  {
    "title": "Big O & Complexity Analysis",
    "source": "next module",
    "text": "The language the rest of the course is written in: how to say what an algorithm costs, with a full module rather than a cheat sheet."
  },
  {
    "title": "Course Schedule",
    "source": "Graphs module",
    "text": "This page's question turned around. Instead of checking a given order against the links, you are given the links and asked whether any valid order exists at all, which is the same rule with a cycle detector added."
  },
  {
    "title": "Course Schedule II",
    "source": "Graphs module",
    "text": "Produce a valid order rather than check one: the same rule, but you build the order a module at a time as its prerequisites are placed."
  }
]
```

## Check yourself {#quiz}

```vig "Three questions as rows, the first one answered and ticked"
<circle class="fg" cx="36" cy="24" r="10"/><path class="st" d="M31 24L35 28L42 20"/><circle class="st" cx="36" cy="56" r="10"/><circle class="st" cx="36" cy="88" r="10"/><rect class="fa" x="58" y="19" width="150" height="10" rx="5"/><rect class="fa" x="58" y="51" width="118" height="10" rx="5"/><rect class="fa" x="58" y="83" width="138" height="10" rx="5"/>
```

```quiz
{
  "questions": [
    {
      "question": "Why does Sliding Window (Stage 2) come after Arrays and Hash Tables (Stage 1)?",
      "options": [
        "A window problem keeps a hash map of what is inside a stretch of an array, so both structures have to exist first.",
        "The stages are a difficulty ramp, so Sliding Window follows them only because it is harder than either of those modules.",
        "Sliding Window needs sorted input, and the Stage 1 modules are where the course teaches sorting before it reaches the techniques."
      ],
      "answer": 0,
      "explanation": "Stage 2 techniques are algorithms over Stage 1 structures: a dynamic window is typically an array plus a hash map tracking what is in the window, which is the link the map shows. Difficulty alone does not order the modules, and Sorting is itself a Stage 2 module, taught after Stage 1."
    },
    {
      "question": "Recursion & Backtracking is moved to just after Heaps in the course order, so no module sits directly before one it leans on. What does the full check say?",
      "options": [
        "It returns True, because every module still appears once and no neighbouring pair is out of order.",
        "It returns False, because Binary Trees now sits before the Recursion & Backtracking it leans on.",
        "It returns True, because Heaps now sits between the two modules and a module in between repairs the order."
      ],
      "answer": 1,
      "explanation": "The full check compares positions, not neighbours: Binary Trees now comes several places before Recursion & Backtracking, so the module that needs recursion is placed first. Only the neighbour-only shortcut accepts this order, because BST & Ordered Structures and Heaps now sit between Binary Trees and Recursion, so no adjacent pair shows the break."
    },
    {
      "question": "Suppose the table gains a link saying Sliding Window leans on Heaps, which the course teaches in a later stage. What does the full check say about the course's own order?",
      "options": [
        "It still reports the order valid, because stages already sort modules and a link from an earlier stage to a later one is ignored.",
        "It reports the order valid, because a link only matters when a module is missing or listed twice.",
        "It reports the order invalid: Sliding Window comes before Heaps, so either the new link is wrong or the course order must change."
      ],
      "answer": 2,
      "explanation": "The check compares places and knows nothing about stages, so it flags any link that points forward. That is the check doing its job: the course order is valid for the table only because every link points back, and a link that does not forces a choice between the link and the order."
    }
  ]
}
```
