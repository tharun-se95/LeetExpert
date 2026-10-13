---
title: "Middle of the Linked List"
kicker: "Middle of the Linked List · Linked Lists module · problem lesson"
headline: "How do you find the halfway point of a chain you can only walk forwards?"
lede: "A git history is a chain: each commit records its parent and nothing else. When git bisect hunts for the commit that broke a build, every round tests the commit halfway along the range still in doubt. With only parent links to follow, finding that halfway commit is this problem: the middle of a singly linked list, from one end, with no length written down anywhere."
chips:
  - "needs **two pointers**"
  - "shape **one step and two**"
  - "time **O(n)**, one pass"
hero: |
  <div class="hero-stage"><div class="hero-art navy"><svg id="heroRace" viewBox="0 0 560 300" role="img" aria-label="Animation: nine commits in a chain. Two markers start at the newest commit; one moves one commit at a time, the other two at a time. When the fast one reaches the oldest commit, the slow one stands on the fifth, the middle of the nine."></svg>
  <div class="hero-read" id="heroRead"><div class="hero-num"><b id="heroNum">0</b> <span id="heroUnit">steps</span></div><div id="heroCap"></div></div></div></div>
---

## Problem {#problem}

```vig "Five nodes in a chain with the middle one ringed"
<circle class="fa" cx="28" cy="56" r="8"/><circle class="fa" cx="74" cy="56" r="8"/><circle class="fk" cx="120" cy="56" r="8"/><circle class="fa" cx="166" cy="56" r="8"/><circle class="fa" cx="212" cy="56" r="8"/><path class="st" d="M39 56L63 56"/><path class="st" d="M58.9 53.2L63 56L58.9 58.8"/><path class="st" d="M85 56L109 56"/><path class="st" d="M104.9 53.2L109 56L104.9 58.8"/><path class="st" d="M131 56L155 56"/><path class="st" d="M150.9 53.2L155 56L150.9 58.8"/><path class="st" d="M177 56L201 56"/><path class="st" d="M196.9 53.2L201 56L196.9 58.8"/><circle class="st" cx="120" cy="56" r="14" stroke-dasharray="3 3"/>
```

Given the `head` of a singly linked list, return its ==middle node==. If the list has an even length there are two middles; return the **second** one.

```examples
head = [1,2,3,4,5] → [3,4,5]
head = [1,2,3,4,5,6] → [4,5,6]  (the second middle)
```

```constraint
1 ≤ length ≤ 100.
```

Returning a node means returning the rest of the list from it, which is why the answers are written as lists. Read it as the git history: the head is the newest commit, each `next` is a parent link, and the middle is the commit bisect would test first. Nothing in the chain says how long it is, and you can only follow links forwards.

Here is the race the lesson builds on. Two walkers start at the head; `slow` takes one step at a time and `fast` takes two. Pick a length and watch where `slow` is standing when `fast` cannot take another full double step.

```widget #race "Explore: race two walkers"
<div class="extabs" role="group" aria-label="Choose a length"></div><div class="lvhost"></div>
```

## Attempt it first {#attempt}

```caption
`slow` takes one step for every two that `fast` takes.
```

```vig "A chain with a slow marker two nodes in and a fast marker four nodes in"
<circle class="fa" cx="18" cy="72" r="6"/><circle class="fa" cx="52" cy="72" r="6"/><circle class="fa" cx="86" cy="72" r="6"/><circle class="fa" cx="120" cy="72" r="6"/><circle class="fa" cx="154" cy="72" r="6"/><circle class="fa" cx="188" cy="72" r="6"/><circle class="fa" cx="222" cy="72" r="6"/><path class="st" d="M27 72L43 72"/><path class="st" d="M38.9 69.2L43 72L38.9 74.8"/><path class="st" d="M61 72L77 72"/><path class="st" d="M72.9 69.2L77 72L72.9 74.8"/><path class="st" d="M95 72L111 72"/><path class="st" d="M106.9 69.2L111 72L106.9 74.8"/><path class="st" d="M129 72L145 72"/><path class="st" d="M140.9 69.2L145 72L140.9 74.8"/><path class="st" d="M163 72L179 72"/><path class="st" d="M174.9 69.2L179 72L174.9 74.8"/><path class="st" d="M197 72L213 72"/><path class="st" d="M208.9 69.2L213 72L208.9 74.8"/><polygon class="fc" points="80,42 92,42 86,53"/><polygon class="fk" points="148,42 160,42 154,53"/>
```

Counting the nodes, then walking half of them, is correct, and it is worth thirty seconds to write. The version this lesson is about does it in one pass with the two walkers. Work out where `slow` lands for **both** parities before opening anything: the even case is where implementations quietly differ.

```widget "Predict where slow stops"
<div id="predict"></div>
```

```reveal #hint "Hint: which middle is in the stopping condition"
The loop runs while `fast` can take a full double step: `fast` is a node, and so is `fast.next`. On an odd length `fast` ends on the last node, with no `next`. On an even length the last double step carries `fast` past the end, so it ends at null. Trace length 4 and length 5 on paper: they end one `slow` step apart, and that step is the difference between the two middles.
```

## Two passes, or one? {#trap toc="Two passes, or one?"}

```caption
One pass is not less work: both versions read about the same number of links.
```

```vig "Two pairs of bars of equal total length, one above the other, with an equals sign between"
<rect class="fa" x="20" y="18" width="130" height="12" rx="3"/><rect class="fk" x="154" y="18" width="65" height="12" rx="3"/><path class="st" d="M110 50H130M110 60H130"/><rect class="fa" x="20" y="80" width="130" height="12" rx="3"/><rect class="fk" x="154" y="80" width="65" height="12" rx="3"/>
```

The two-pass version is the honest first answer, and it is correct:

```code alt_two_pass "Count, then walk half"
```

It is tempting to sell the two-walker version as faster. Count the pointer moves and it is not. The two-pass version reads `next` once per node to count, then n ÷ 2 more times to walk; the two walkers read it about n times for `fast` and n ÷ 2 times for `slow`.

```widget "Pointer moves, both versions, as the list grows"
<div class="chart" id="cost"></div><p class="cost-note" id="costNote"></p>
```

So the one-pass version wins nothing on a list in memory. It earns its place in three other ways. It never needs the length, so it works on a chain you can only walk once. Its loop states its own answer, with no arithmetic on a count. And it is the same machine as the next lesson's cycle detection and the palindrome check, where a count cannot help at all.

The real trap is in the stopping condition. Stop one double step early and the loop returns the **first** middle on even lengths. Here is the same list run both ways:

```widget #trapper "Two stopping conditions on [1,2,3,4,5,6]"
<div class="extabs" role="group" aria-label="Choose a condition"></div><div class="lvhost"></div><p class="cost-note" id="trapNote"></p>
```

## The insight {#insight}

```caption
`fast` is always exactly twice as far along as `slow`.
```

```vig "A number line with one dot twice as far along as the other, and two equal arcs marking the halves"
<path class="st" d="M16 74H224M16 68V80M42 68V80M68 68V80M94 68V80M120 68V80M146 68V80M172 68V80M198 68V80M224 68V80"/><circle class="fc" cx="94" cy="74" r="7"/><circle class="fk" cx="172" cy="74" r="7"/><path class="st" d="M16 60Q55 30 94 60" stroke-dasharray="3 3"/><path class="st" d="M94 60Q133 30 172 60" stroke-dasharray="3 3"/>
```

Number the nodes from 0. After k passes of the loop, `slow` has taken k steps and `fast` 2k, so `slow` is on node k and `fast` on node 2k: `fast` is always exactly twice as far along. The loop stops at the first k where `fast` cannot take another double step, and that pins down `slow`:

- **Odd length n.** `fast` stops on the last node, index n − 1, so 2k = n − 1 and `slow` is on node (n − 1) ÷ 2, the one middle.
- **Even length n.** The last double step takes `fast` from index n − 2 to n, one past the end, so `fast` is null, 2k = n, and `slow` is on node n ÷ 2, the second middle.

Both cases are index ⌊n ÷ 2⌋, which is what the two-pass version walks to.

```key
Two walkers at speeds one and two keep the fast one at exactly twice the slow one's distance, so wherever fast runs out, slow is halfway.
```

```rosetta "The code, read as the git history"
In the code | In the history
`head` | the newest commit
`node.next` | a commit's parent link
`slow` | the commit bisect would test, one parent at a time
`fast` | a scout following two parent links per round
`fast is None` | the scout ran past the first commit ever made
`return slow` | the halfway commit
```

Watch it on each of the lesson's lists. The panel checks that `fast` is twice as far along as `slow` after every pass.

```widget #stepper "Walk the two walkers"
<div class="extabs" role="group" aria-label="Choose a list"></div><div class="lvhost"></div>
```

## Solution {#solution}

```vig "An odd chain and an even chain: in each the fast marker has run out and the slow one sits on the middle"
<circle class="fa" cx="40" cy="30" r="6"/><circle class="fa" cx="80" cy="30" r="6"/><circle class="fk" cx="120" cy="30" r="6"/><circle class="fa" cx="160" cy="30" r="6"/><circle class="fa" cx="200" cy="30" r="6"/><path class="st" d="M49 30L71 30"/><path class="st" d="M66.9 27.2L71 30L66.9 32.8"/><path class="st" d="M89 30L111 30"/><path class="st" d="M106.9 27.2L111 30L106.9 32.8"/><path class="st" d="M129 30L151 30"/><path class="st" d="M146.9 27.2L151 30L146.9 32.8"/><path class="st" d="M169 30L191 30"/><path class="st" d="M186.9 27.2L191 30L186.9 32.8"/><polygon class="fc" points="194,6 206,6 200,17"/><circle class="fa" cx="40" cy="86" r="6"/><circle class="fa" cx="80" cy="86" r="6"/><circle class="fk" cx="120" cy="86" r="6"/><circle class="fa" cx="160" cy="86" r="6"/><path class="st" d="M49 86L71 86"/><path class="st" d="M66.9 83.2L71 86L66.9 88.8"/><path class="st" d="M89 86L111 86"/><path class="st" d="M106.9 83.2L111 86L106.9 88.8"/><path class="st" d="M129 86L151 86"/><path class="st" d="M146.9 83.2L151 86L146.9 88.8"/><path class="st" d="M169 86L189 86"/><path class="st" d="M184.9 83.2L189 86L184.9 88.8"/><circle class="st" cx="200" cy="86" r="7"/><path class="st" d="M195.1 90.9L204.9 81.1"/><polygon class="fc" points="194,62 206,62 200,73"/>
```

Attempt it on paper first: write the loop condition, decide what to return, and check it on lengths 1, 2, 5 and 6. Then compare.

`````reveal #solbox "Show the solution"
```code solution "Two walkers"
```

```notes
The condition `fast is not None and fast.next is not None` asks one question: can `fast` take a full double step? Its two halves cover the two parities: an even list ends with `fast` at null, an odd one with `fast` on the last node.

`return slow` because `fast` has gone twice as far, so `slow` is halfway: index ⌊n ÷ 2⌋, the second middle when there are two.
```

```derivation
**Time O(n).** The loop runs once per double step `fast` can take, ⌊n ÷ 2⌋ times: {{passes100}} passes for the constraint's 100 nodes, counted by running it. Each pass is two pointer reads and a check, so the work grows linearly with n.

**Space O(1).** Two references, whatever the length.
```

````warn
Test `fast` before `fast.next`. With the halves swapped, an even-length list ends a pass with `fast` at null, and the next check reads `fast.next` from null: `AttributeError` in Python, `TypeError` in TypeScript. Run on the lesson's lists it {{orderCrashes}}.

```code mistake_condition_order "The halves of the condition, swapped"
```
````

```code mistake_first_middle "Stopping one double step early"
```

```notes
This version stops while `fast.next.next` is null, one double step earlier, so on an even length `slow` stops on the **first** middle: {{firstMiddleAnswers}}. It is the right loop for problems that want the first middle, such as splitting a list into halves for merge sort. Which middle you get is decided entirely by the condition.
```
`````

## Variants {#variants}

```vig "Three sketches: a chain that mirrors itself, a chain split into two halves, and a chain whose end links back"
<circle class="fk" cx="30" cy="16" r="5"/><circle class="fa" cx="70" cy="16" r="5"/><circle class="fc" cx="110" cy="16" r="5"/><circle class="fa" cx="150" cy="16" r="5"/><circle class="fk" cx="190" cy="16" r="5"/><path class="st" d="M38 16L62 16"/><path class="st" d="M57.9 13.2L62 16L57.9 18.8"/><path class="st" d="M78 16L102 16"/><path class="st" d="M97.9 13.2L102 16L97.9 18.8"/><path class="st" d="M118 16L142 16"/><path class="st" d="M137.9 13.2L142 16L137.9 18.8"/><path class="st" d="M158 16L182 16"/><path class="st" d="M177.9 13.2L182 16L177.9 18.8"/><circle class="fa" cx="30" cy="56" r="5"/><circle class="fa" cx="70" cy="56" r="5"/><path class="st" d="M38 56L62 56"/><path class="st" d="M57.9 53.2L62 56L57.9 58.8"/><circle class="fa" cx="150" cy="56" r="5"/><circle class="fa" cx="190" cy="56" r="5"/><path class="st" d="M158 56L182 56"/><path class="st" d="M177.9 53.2L182 56L177.9 58.8"/><path class="st" d="M90 56L130 56" stroke-dasharray="3 3"/><circle class="fa" cx="60" cy="92" r="5"/><circle class="fa" cx="100" cy="92" r="5"/><circle class="fa" cx="140" cy="92" r="5"/><circle class="fa" cx="180" cy="92" r="5"/><path class="st" d="M68 92L92 92"/><path class="st" d="M87.9 89.2L92 92L87.9 94.8"/><path class="st" d="M108 92L132 92"/><path class="st" d="M127.9 89.2L132 92L127.9 94.8"/><path class="st" d="M148 92L172 92"/><path class="st" d="M167.9 89.2L172 92L167.9 94.8"/><path class="st" d="M180 99Q140 116 102 99"/><path class="st" d="M104.6 103.3L102 99L106.9 98.1"/>
```

```variants
[
  {
    "title": "Palindrome Linked List",
    "source": "LeetCode 234",
    "text": "Find the middle with these two walkers, reverse the second half with the previous lesson's loop, then compare the halves node by node."
  },
  {
    "title": "Sort List",
    "source": "LeetCode 148",
    "text": "Merge sort on a linked list splits it at the first middle, cuts the link there, sorts both halves, and merges them with the merge-two-sorted lesson's loop."
  },
  {
    "title": "Linked List Cycle",
    "source": "next lesson",
    "text": "The same two walkers asking a different question: on a list with a loop, fast never runs out, and the two meet inside the loop instead."
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
      "question": "This loop returns the second middle on even lengths. Which single change returns the first middle instead?",
      "options": [
        "Loop while <code>fast.next</code> and <code>fast.next.next</code> exist: the walkers stop one double step earlier, on the first middle.",
        "Return <code>slow.next</code> instead of <code>slow</code>: <code>slow</code> always stops one node short of the middle, so reading forward once corrects it.",
        "Move <code>slow</code> two steps and <code>fast</code> one: swapping the two speeds makes the walkers settle on the other middle of the list."
      ],
      "answer": 0,
      "explanation": "Which middle you get lives entirely in the stopping condition. Requiring <code>fast.next.next</code> stops the loop one pass earlier on even lengths, leaving <code>slow</code> on index n ÷ 2 − 1. <code>slow.next</code> moves the wrong way, past the second middle, and swapping the speeds breaks the two-to-one distance the answer depends on."
    },
    {
      "question": "Why must the condition test <code>fast</code> before <code>fast.next</code>?",
      "options": [
        "On an even length the last double step leaves <code>fast</code> at null, and reading <code>fast.next</code> from null throws before the loop can stop.",
        "Testing <code>fast.next</code> first makes the loop run one extra time on odd lengths, so <code>slow</code> ends one node past the middle.",
        "Both orders behave the same in Python, but TypeScript evaluates the two halves right to left, so only one order is safe there."
      ],
      "answer": 0,
      "explanation": "<code>and</code> and <code>&&</code> stop at the first false half. With <code>fast</code> first, a null <code>fast</code> ends the check before <code>fast.next</code> is read. Swapped, an even list reaches the check with <code>fast</code> at null and the read throws. Odd lengths never reach that state, which is why the bug survives tests that only use odd lists."
    },
    {
      "question": "The two-pass version counts the nodes and then walks half of them. How does its number of pointer moves compare with the two walkers'?",
      "options": [
        "The two walkers make about half as many, since they finish the job in a single pass where counting first needs two full passes.",
        "They are about the same, roughly 1.5 n each: n to count plus n ÷ 2 to walk, against n for fast plus n ÷ 2 for slow.",
        "The two walkers make about twice as many, because fast reads two links on every pass of the loop while counting reads one."
      ],
      "answer": 1,
      "explanation": "Counted on every length from 1 to 100, the two totals are never more than one move apart. The one-pass version's real advantages are that it never needs the length and that the same loop detects cycles, not that it does less work."
    }
  ]
}
```
