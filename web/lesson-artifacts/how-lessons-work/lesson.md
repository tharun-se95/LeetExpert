---
title: "How Lessons & Problems Work"
kicker: "How Lessons & Problems Work · Getting Started module · concept lesson"
headline: "A demonstration to learn from, a cook-off to learn by doing."
lede: "A cooking class has two kinds of session. In a demonstration the chef shows a technique, explains why it works and lets you watch closely. In a cook-off you are handed raw ingredients and a dish to make, with as little help as you can manage: you attempt it, ask for a hint only when truly stuck, and compare your result with the chef's afterward. Concept lessons are the demonstrations and problem lessons are the cook-offs, and every interactive block in the course exists to serve one of the two. This page uses each block on itself, so you meet them working."
chips:
  - "concept lessons **teach a structure**"
  - "problem lessons **hand you the work**"
  - "every block has **one job**"
hero: |
  <div class="hero-stage"><div class="hero-art navy"><svg id="heroArcs" viewBox="0 0 560 300" role="img" aria-label="Animation: two rows of numbered steps. The top row is a concept lesson, a demonstration with six steps from motivation to quiz. The bottom row is a problem lesson, a cook-off with seven steps from the statement through your attempt, hints, brute force, insight and the optimal solution to variants. The problem lesson's steps light up one after another."></svg>
  <div class="hero-read" id="heroRead"><div class="hero-num"><b id="heroNum">0</b> <span id="heroUnit">steps taken</span></div><div id="heroCap"></div></div></div></div>
---

## The demonstration and the cook-off {#insight toc="Two sessions"}

```caption
A concept lesson explains and you follow; a problem lesson hands you the work and you explain it back in code.
```

```vig "A chef's pan on the left with a pointing arrow, and on the right an empty pan with a basket of raw ingredients beside it"
<circle class="fa" cx="62" cy="64" r="26"/><path class="st" d="M88 64H118"/><path class="st" d="M92 40L110 24"/><path class="st" d="M114 20L110 24L112 30"/><circle class="st" cx="176" cy="64" r="26" stroke-dasharray="4 4"/><rect class="fk" x="196" y="76" width="30" height="22" rx="4"/><circle class="fk" cx="206" cy="72" r="6"/><circle class="fk" cx="218" cy="70" r="6"/>
```

Watching a technique and doing it are different skills, and the course gives each its own kind of lesson so neither is squeezed into the other. In a **concept lesson** the structure or technique is the subject. The lesson tells you why it exists, how it works and what each operation costs, and then builds it from scratch in front of you. In a **problem lesson** a single problem is the subject, and the lesson is arranged to make you struggle usefully with it before it shows you anything.

The two follow different orders, and the order is the design. A concept lesson moves from why, to how, to what it costs, to building it, to when not to use it, and ends in a quiz. A problem lesson is solve-first: the statement, then your attempt, then hints, then the obvious slow solution and its cost, then the insight that beats it, then the best solution, then variants. Step through both below. Each step names the blocks you meet there, and for a problem lesson, which tab of the workspace holds it.

```widget #arcs "Walk each lesson, one step at a time"
<div class="extabs" role="group" aria-label="Choose a kind of lesson"></div><div class="hw-track" id="hwTrack" role="group" aria-label="Steps of the lesson"></div><div class="hw-panel" id="hwPanel" aria-live="polite"></div><div class="actions"><button type="button" class="btn2" id="hwPrev">Back</button><button type="button" class="btn2 best" id="hwNext">Next step</button></div><p class="cost-note" id="hwNote"></p>
```

The reason the problem lesson hides its help until you ask is that a solution you only read is mostly one you forget. Producing an answer, even a wrong one, is what builds the skill, so the lesson keeps its hints and its solution behind buttons that you press on purpose.

```key
A concept lesson earns its place by making a structure clear; a problem lesson earns it by making you produce the answer yourself.
```

## Attempt first, hints one at a time {#attempt toc="Hints"}

```caption
A hint is a reveal: closed, it holds nothing, and each one opens on its own, so you take the smallest push you need.
```

```vig "Three stacked cards, the top one open and showing a few lines, the lower two closed with a small eye mark each"
<rect class="fa" x="16" y="12" width="208" height="44" rx="8"/><path class="sc" d="M30 28H150M30 42H118"/><rect class="st" x="16" y="62" width="208" height="14" rx="6"/><circle class="fk" cx="206" cy="69" r="4"/><rect class="st" x="16" y="82" width="208" height="14" rx="6"/><circle class="fk" cx="206" cy="89" r="4"/>
```

Here is the problem the rest of this page uses: given a list of whole numbers `nums`, return `True` if any number appears twice or more, and `False` if every number is distinct. Stop and try it before you open anything. A reveal is the course's button for what you should read only after you have tried, and a problem lesson hangs its hints on it. Open the hints below in order, taking only as many as you need. In a real problem lesson they sit under "Attempt it first", in the Explanation tab.

```reveal #hintone "Hint 1: what must you know at each number?"
At each number in the list, the only question that matters is whether you have met this exact number earlier. The numbers after it do not matter yet. So the real task is to be able to answer "have I seen this one before?" quickly, for every number as you go.
```

```reveal #hinttwo "Hint 2: where could the earlier numbers live?"
Comparing the new number against every earlier number answers the question, but it makes you re-read the past once for each position. Instead, keep the earlier numbers in a structure that answers "is this in here?" in one step and does not make you look through everything it holds. A set does that.
```

```reveal #hintthree "Hint 3: ask first, then add"
Walk the list once. For each number, ask the set whether it is already inside. If yes, you have found a repeat and can stop. If no, add the number and move on. If you reach the end, nothing repeated. The order matters: ask before you add, or the number you just added will answer for itself.
```

The three buttons are independent: open the third without the first and it still opens, close one and its text is gone. Closed, a reveal holds nothing, not even hidden text, so searching the page for a word will not find a hint you have not opened. That is deliberate. Almost every problem's solution is kept in a reveal too, so a search for a function name cannot spoil the answer.

A real problem lesson carries between one and three hints. The bars are counted from the course's problem lessons.

```widget "Hints per problem lesson"
<div class="hbars" id="hintBars"></div>
```

## Code in both languages {#solution toc="Code"}

```caption
Every implementation appears in Python and TypeScript, and one menu chooses which you see everywhere.
```

```vig "The same small loop drawn twice, once under a Py label and once under a TS label, joined by a double arrow"
<rect class="fa" x="14" y="22" width="86" height="60" rx="8"/><path class="sc" d="M26 40H84M26 52H72M26 64H80"/><rect class="fa" x="140" y="22" width="86" height="60" rx="8"/><path class="sc" d="M152 40H210M152 52H198M152 64H206"/><path class="st" d="M106 52H134M111 47L106 52L111 57M129 47L134 52L129 57"/>
```

Here is the answer to the problem above, the way a lesson shows any solution. The page shows one language at a time and a menu on the code block switches it. The choice is a single preference for the whole course, so picking Python on one block changes every code block on every page. Pick whichever language you are working in, but read the other once: seeing the same idea in two syntaxes is how you separate the idea from the language.

```code solution "contains_duplicate: ask the set, then remember"
```

The editor in a problem runs Python and JavaScript. The lessons show TypeScript, which is JavaScript with type annotations, and the types stay in the lesson text and out of the editor.

````warn
Comparing each number only with the one right before it. It looks reasonable and it works on any list that is sorted, because equal numbers sit side by side there. On `[3, 1, 3]` the two 3s are never neighbours, so it returns False where the answer is True, in both languages.

```code mistake "The neighbour check"
```
````

## A cost comes with its reason {#cost toc="Cost"}

```caption
A complexity box gives time, space and the argument behind them, so you can rebuild the claim.
```

```vig "A small box with two labelled rows, a clock and a stack of cells, and a short line of text under each"
<rect class="st" x="14" y="14" width="212" height="84" rx="10"/><circle class="fa" cx="40" cy="38" r="11"/><path class="st" d="M40 31V38L46 42"/><path class="sc" d="M62 34H200M62 44H170"/><rect class="fa" x="30" y="62" width="20" height="8" rx="2"/><rect class="fa" x="30" y="72" width="20" height="8" rx="2"/><path class="sc" d="M62 68H200M62 78H176"/>
```

Beside a solution or a brute force, a lesson puts a complexity box with three parts: the time, the space, and a sentence on why. The sentence is the part that matters. A table of bare costs is something you memorise and then misapply; a reason is something you can check against a new problem. For `contains_duplicate` the box would read like this, and the chart is what the page measured by running the function.

```widget "Loop iterations of contains_duplicate, counted"
<div class="chart" id="cmp"></div><p class="cost-note" id="costNote"></p>
```

The two lines differ because the function can leave early. A list whose first two numbers match is finished after two iterations, however long it is. A list with no repeat forces the loop to visit every number before it can say False. A cost bound has to hold for every input of that size, so it takes the slow line.

```derivation
**Time: O(n).** The loop runs at most once per number. Each membership check and each insert on a set takes about one step on average, because a set works out from the number itself where it would be stored instead of searching through what it holds.

**Space: O(n).** On a list with no repeat the set ends up holding every number, so its size grows with the list.
```

## Predict, then run {#walk toc="Predict"}

```caption
Guess before the page tells you: committing to an answer is what makes the explanation stick.
```

```vig "A list of three numbers with a question mark above it and a pointer hovering before the first one"
<rect class="fa" x="40" y="52" width="40" height="30" rx="5"/><rect class="fa" x="90" y="52" width="40" height="30" rx="5"/><rect class="fa" x="140" y="52" width="40" height="30" rx="5"/><circle class="fk" cx="120" cy="22" r="12"/><polygon class="fk" points="26,36 38,36 32,46"/>
```

A predict block asks a question about code you can see and makes you commit to an answer before it reveals the right one and the steps that produce it. It is the quickest way to find out whether you have actually followed the loop or only recognised it. The loop in `contains_duplicate` returns the moment it meets a repeat, so the count of iterations depends on where the repeat sits. Predict each one.

```widget #predict "Predict: the result and the iterations"
```

## Your progress {#lists toc="Progress"}

```caption
The course keeps your place without an account; signing in only adds syncing.
```

```vig "A header bar with a small fraction in the corner and a row of lesson squares below it, some filled"
<rect class="st" x="14" y="12" width="212" height="26" rx="6"/><rect class="fa" x="178" y="19" width="38" height="12" rx="4"/><rect class="fg" x="22" y="58" width="26" height="22" rx="4"/><rect class="fg" x="56" y="58" width="26" height="22" rx="4"/><rect class="fa" x="90" y="58" width="26" height="22" rx="4"/><rect class="fa" x="124" y="58" width="26" height="22" rx="4"/><rect class="fa" x="158" y="58" width="26" height="22" rx="4"/>
```

Opening a lesson marks it visited. The sidebar and the header keep track of it, and a problem you solve gets a Solved mark: a problem counts as solved when every one of its test cases passes. The small fraction in the header counts only concept lessons and practice chapters, never the individual problems, so it measures how much of the teaching you have covered.

You do not need an account. Signed out, everything lives in your browser's local storage and goes nowhere else. If you do sign in, your visited lessons, your solved problems and your code drafts for problems sync to the account and follow you to another device. Quiz answers are different: they are saved in the browser where you gave them and are not synced, signed in or not. The model below acts the same way, with five pretend lessons. Open some, solve the problem, answer a quiz question, and flip between signed out and signed in to see where each kind of progress is kept.

```widget #progress "Model: what the course remembers, and where"
<div class="pg-top"><span class="pg-chipbox">Header progress <span class="pg-chip" id="pgChip"></span></span><button type="button" class="btn2" id="pgSign" aria-pressed="false">Signed out</button></div><div class="actions" id="pgActions"></div><div class="pg-rows" id="pgRows"></div><p class="cost-note" id="pgNote"></p>
```

The next lesson covers the editor itself: running your code, reading the test results and what to do when you are stuck.

## Where next {#next}

```vig "A signpost with three arrows pointing along three paths"
<path class="st" d="M120 100V24"/><rect class="fa" x="68" y="22" width="104" height="14" rx="4"/><rect class="fa" x="76" y="42" width="96" height="14" rx="4"/><rect class="fk" x="68" y="62" width="104" height="14" rx="4"/>
```

```variants
[
  {
    "title": "Writing & Running Code",
    "source": "next lesson",
    "text": "How the workspace runs your code against the lesson's test cases, how to read a failing case, and what Console, Insight and Reset do."
  },
  {
    "title": "Big O & Complexity Analysis",
    "source": "next module in this stage",
    "text": "The complexity box done properly: counting the work a loop does, and reading a cost off code from its reason rather than from a memorised table."
  },
  {
    "title": "Hash Tables",
    "source": "Linear Structures stage",
    "text": "The structure behind the set in contains_duplicate. You build one from scratch and see why asking whether it holds something does not mean looking at everything in it."
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
      "question": "A problem lesson hands you a task. In what order does it expect you to work?",
      "options": [
        "Read the statement, try it yourself, open hints one at a time only when stuck, then compare with the solution.",
        "Read the statement, open the solution to see the target, then rewrite it from memory so the pattern settles in.",
        "Open all the hints first so the attempt goes quickly, then read the statement to check you solved the same problem."
      ],
      "answer": 0,
      "explanation": "A problem lesson is solve-first because producing an answer, even a wrong one, is what builds the skill. The hints are separate reveals so you can take the smallest push and return to your attempt. Reading the solution first removes the struggle, and opening every hint first removes it just as surely."
    },
    {
      "question": "<code>contains_duplicate_neighbours</code> compares each number only with the one before it. What does it return for <code>[3, 1, 3]</code>?",
      "options": [
        "False, since the two 3s are never next to each other; the correct answer is True.",
        "True, because 3 appears twice and any comparison of values finds a repeat wherever the repeats sit in the list.",
        "True, because the function walks the list from the left and so ends up checking every pair of numbers it meets."
      ],
      "answer": 0,
      "explanation": "Only pairs of neighbours are compared: 3 with 1, then 1 with 3. The two 3s are two places apart, so no comparison ever puts them side by side, and the function returns False in both Python and TypeScript. It is right only on lists where equal numbers are neighbours, such as a sorted list."
    },
    {
      "question": "You solve a problem and answer a quiz question while signed in on your laptop, then open the course on your phone. What is there?",
      "options": [
        "The solved problem and your visited lessons, but not the quiz answer, which was saved only in the laptop's browser.",
        "Everything, including the quiz answer, because signing in makes all of your progress sync to the account on every device.",
        "Nothing, because progress is kept only in the browser where it was made and signing in changes how you log in, not what is stored."
      ],
      "answer": 0,
      "explanation": "Signed in, visited lessons, solved problems and problem code drafts sync to the account. Quiz answers are written to the browser's local storage and never leave it, whether or not you are signed in, so the phone shows the solved problem and the visited lessons, and not the quiz answer."
    }
  ]
}
```
