---
title: "Remove Nth Node From End of List"
kicker: "Remove Nth Node From End of List · Linked Lists module · problem lesson"
headline: "How do you find a spot counted from the end when you can only start at the front?"
lede: "A change log is kept as a chain, oldest entry first, and you can only read it forwards from the start. Asked to drop the entry n back from the newest, you could count the whole chain and then walk again. Or you could send a scout n entries ahead and walk a second reader behind it at the same pace: when the scout reaches the newest entry, the reader is standing just before the one to remove."
chips:
  - "needs **a dummy and a gap**"
  - "stands on **the predecessor**"
  - "time **O(L)**, one pass"
hero: |
  <div class="hero-stage"><div class="hero-art navy"><svg id="heroGap" viewBox="0 0 560 300" role="img" aria-label="Animation: a chain of seven log entries, oldest first. A scout moves two entries ahead, then the scout and a reader move forward together, keeping the gap. When the scout reaches the newest entry, the reader stands just before the entry two from the end, which is then unlinked."></svg>
  <div class="hero-read" id="heroRead"><div class="hero-num"><b id="heroNum">2</b> <span id="heroUnit">entries</span> apart</div><div id="heroCap"></div></div></div></div>
---

## Problem {#problem}

```vig "A chain whose second node from the end is marked, with the node before it re-aimed past it"
<circle class="fa" cx="28" cy="56" r="8"/><circle class="fa" cx="74" cy="56" r="8"/><circle class="fa" cx="120" cy="56" r="8"/><path class="st" d="M39 56L63 56"/><path class="st" d="M58.9 53.2L63 56L58.9 58.8"/><path class="st" d="M85 56L109 56"/><path class="st" d="M104.9 53.2L109 56L104.9 58.8"/><circle class="fr" cx="166" cy="56" r="8"/><circle class="fa" cx="212" cy="56" r="8"/><path class="st" d="M131 56L155 56" stroke-dasharray="3 3"/><path class="st" d="M177 56L201 56"/><path class="st" d="M196.9 53.2L201 56L196.9 58.8"/><path class="st" d="M126 66Q166 108 205 67"/><path class="st" d="M200.1 68L205 67L204.2 71.9"/>
```

Given the `head` of a linked list, remove the ==n-th node from the end== and return the head. n is always valid.

```examples
head = [1,2,3,4,5], n = 2 → [1,2,3,5]  (removed 4)
head = [1], n = 1 → []  (removed the only node, the head)
head = [1,2], n = 2 → [2]  (removed the head)
```

```constraint
1 ≤ L ≤ 30, where L is the length, and 1 ≤ n ≤ L. Follow-up: do it in one pass.
```

Removing a node from a singly linked list means rewriting its **predecessor's** `next` to skip it, so what you actually need is the node just before the target. Read it as the change log: the head is the oldest entry, the last node is the newest, and n counts back from the newest. Two of the examples remove the head itself, which has no node before it; let that shape your setup.

Here is the gap idea on its own, before any removal. Two readers start together; `lead` goes n nodes ahead, then both move one node at a time until `lead` is on the last node. Pick an n and see where `trail` ends up.

```widget #gaps "Explore: a reader lagging by n"
<div class="extabs" role="group" aria-label="Choose n"></div><div class="lvhost"></div>
```

## Attempt it first {#attempt}

```caption
`trail` must stop on the node before the target, never on the target itself.
```

```vig "A placeholder and five nodes: the lead marker on the last node, the trail marker on the node before the one to remove"
<rect class="st" x="8" y="62" width="22" height="18" rx="4" stroke-dasharray="3 3"/><path class="st" d="M30 71L47 71"/><path class="st" d="M42.9 68.2L47 71L42.9 73.8"/><circle class="fa" cx="58" cy="71" r="7"/><circle class="fa" cx="96" cy="71" r="7"/><circle class="fa" cx="134" cy="71" r="7"/><circle class="fr" cx="172" cy="71" r="7"/><circle class="fa" cx="210" cy="71" r="7"/><path class="st" d="M68 71L86 71"/><path class="st" d="M81.9 68.2L86 71L81.9 73.8"/><path class="st" d="M106 71L124 71"/><path class="st" d="M119.9 68.2L124 71L119.9 73.8"/><path class="st" d="M144 71L162 71"/><path class="st" d="M157.9 68.2L162 71L157.9 73.8"/><path class="st" d="M182 71L200 71"/><path class="st" d="M195.9 68.2L200 71L195.9 73.8"/><polygon class="fc" points="128,42 140,42 134,53"/><polygon class="fk" points="204,42 216,42 210,53"/>
```

This is the module's graduation exercise: the two-walker gap, the dummy node, and standing on the predecessor, together in about ten lines. Work out where `trail` stops before you read on: it has to be the node **before** the target, never the target.

```widget "Predict where trail stops"
<div id="predict"></div>
```

```reveal #hint "Hint: start both walkers on a dummy"
Put a dummy node in front of the head and start `lead` and `trail` on it. Move `lead` n steps ahead, then move both until `lead` is on the last node. `trail` is then on the target's predecessor, and when the target is the head, that predecessor is the dummy, so the same splice removes it.
```

## Two passes, or one? {#trap toc="Two passes, or one?"}

```caption
The position is carried as a gap between two walkers, not as a count.
```

```vig "Two markers on a chain joined by a bracket that spans the nodes between them"
<circle class="fa" cx="20" cy="76" r="6"/><circle class="fa" cx="60" cy="76" r="6"/><circle class="fa" cx="100" cy="76" r="6"/><circle class="fa" cx="140" cy="76" r="6"/><circle class="fa" cx="180" cy="76" r="6"/><circle class="fa" cx="220" cy="76" r="6"/><path class="st" d="M29 76L51 76"/><path class="st" d="M46.9 73.2L51 76L46.9 78.8"/><path class="st" d="M69 76L91 76"/><path class="st" d="M86.9 73.2L91 76L86.9 78.8"/><path class="st" d="M109 76L131 76"/><path class="st" d="M126.9 73.2L131 76L126.9 78.8"/><path class="st" d="M149 76L171 76"/><path class="st" d="M166.9 73.2L171 76L166.9 78.8"/><path class="st" d="M189 76L211 76"/><path class="st" d="M206.9 73.2L211 76L206.9 78.8"/><polygon class="fc" points="94,48 106,48 100,59"/><polygon class="fk" points="174,48 186,48 180,59"/><path class="sc" d="M100 40V33H180V40"/>
```

The two-pass version is a fine first answer. Count the length L, then walk to node L − n from a dummy, which is the target's predecessor:

```code alt_two_pass "Count, then walk to the predecessor"
```

As in the middle-of-the-list lesson, one pass does not mean less work: the two versions read about the same number of links.

```widget "Links read, both versions, as the list grows"
<div class="chart" id="cost"></div><p class="cost-note" id="costNote"></p>
```

What the one-pass version buys is that it never needs the length: the position is carried as a ==gap== between two walkers instead of as a number. The trap is in exactly where the march stops. Stop it when `lead` is null instead of when `lead` is on the last node, and both walkers take one more step: `trail` lands on the target itself, and the splice removes the node after it.

```widget #trapper "[1,2,3,4,5], n = 2, two stopping points"
<div class="extabs" role="group" aria-label="Choose a stopping point"></div><div class="lvhost"></div><p class="cost-note" id="trapNote"></p>
```

## The insight {#insight}

```caption
Both walkers move one node per step, so the gap stays exactly n.
```

```vig "The same bracket over a chain twice: first at the start, then slid along to the end, its width unchanged"
<circle class="fa" cx="20" cy="34" r="6"/><circle class="fa" cx="60" cy="34" r="6"/><circle class="fa" cx="100" cy="34" r="6"/><circle class="fa" cx="140" cy="34" r="6"/><circle class="fa" cx="180" cy="34" r="6"/><circle class="fa" cx="220" cy="34" r="6"/><path class="st" d="M29 34L51 34"/><path class="st" d="M46.9 31.2L51 34L46.9 36.8"/><path class="st" d="M69 34L91 34"/><path class="st" d="M86.9 31.2L91 34L86.9 36.8"/><path class="st" d="M109 34L131 34"/><path class="st" d="M126.9 31.2L131 34L126.9 36.8"/><path class="st" d="M149 34L171 34"/><path class="st" d="M166.9 31.2L171 34L166.9 36.8"/><path class="st" d="M189 34L211 34"/><path class="st" d="M206.9 31.2L211 34L206.9 36.8"/><path class="sc" d="M20 22V15H100V22"/><circle class="fa" cx="20" cy="92" r="6"/><circle class="fa" cx="60" cy="92" r="6"/><circle class="fa" cx="100" cy="92" r="6"/><circle class="fa" cx="140" cy="92" r="6"/><circle class="fa" cx="180" cy="92" r="6"/><circle class="fa" cx="220" cy="92" r="6"/><path class="st" d="M29 92L51 92"/><path class="st" d="M46.9 89.2L51 92L46.9 94.8"/><path class="st" d="M69 92L91 92"/><path class="st" d="M86.9 89.2L91 92L86.9 94.8"/><path class="st" d="M109 92L131 92"/><path class="st" d="M126.9 89.2L131 92L126.9 94.8"/><path class="st" d="M149 92L171 92"/><path class="st" d="M166.9 89.2L171 92L166.9 94.8"/><path class="st" d="M189 92L211 92"/><path class="st" d="M206.9 89.2L211 92L206.9 94.8"/><path class="sc" d="M140 80V73H220V80"/><path class="st" d="M104 58L136 58"/><path class="st" d="M131.9 55.2L136 58L131.9 60.8"/>
```

Number the nodes from the dummy: the dummy is 0 and the list's nodes are 1 to L. The n-th node from the end is node L − n + 1, so its predecessor is node L − n.

- **Opening the gap.** `lead` moves n steps from the dummy, to node n. `trail` stays on 0. They are n apart.
- **The march.** Both move one node per step, so the gap stays exactly n. The march stops when `lead` is on node L, the last one, which takes L − n steps.
- **Where trail is.** `trail` has made the same L − n steps from node 0, so it is on node L − n: exactly the target's predecessor.

When n = L the target is the head, node 1, and its predecessor is node 0: the dummy. The march takes L − L = 0 steps and the same splice, `trail.next = trail.next.next`, removes the head. No length was ever computed and no case is special.

```key
Open a gap of n between two walkers starting on a dummy, and march both until the lead is on the last node: the trailer is then on the target's predecessor, even when the target is the head.
```

```rosetta "The code, read as the change log"
In the code | In the log
`dummy` | a blank entry before the oldest, so the oldest one has something before it too
`lead` | the scout, n entries ahead
`trail` | the reader, keeping the same pace behind it
`lead.next is None` | the scout is on the newest entry
`trail.next = trail.next.next` | the entry n back from the newest is unlinked
`return dummy.next` | the log's first entry, whichever it now is
```

Watch it on each of the lesson's lists. The panel checks the gap on every step after it opens.

```widget #stepper "Walk the dummy and the gap"
<div class="extabs" role="group" aria-label="Choose an input"></div><div class="lvhost"></div>
```

## Solution {#solution}

```vig "A chain after the splice: one node drawn dashed and stepped over by the arrow from the node before it"
<rect class="st" x="8" y="62" width="22" height="18" rx="4" stroke-dasharray="3 3"/><path class="st" d="M30 71L47 71"/><path class="st" d="M42.9 68.2L47 71L42.9 73.8"/><circle class="fa" cx="58" cy="71" r="7"/><circle class="fa" cx="96" cy="71" r="7"/><circle class="fa" cx="134" cy="71" r="7"/><path class="st" d="M68 71L86 71"/><path class="st" d="M81.9 68.2L86 71L81.9 73.8"/><path class="st" d="M106 71L124 71"/><path class="st" d="M119.9 68.2L124 71L119.9 73.8"/><circle class="st" cx="172" cy="71" r="7" stroke-dasharray="3 3"/><circle class="fa" cx="210" cy="71" r="7"/><path class="st" d="M139 61Q172 28 204 61"/><path class="st" d="M203.2 56.1L204 61L199.1 60"/>
```

Attempt it on paper first: set up the dummy, open the gap, write the march condition, and do the splice. Check it on n = 1 and n = L. Then compare.

`````reveal #solbox "Show the solution"
```code solution "Dummy and a gap of n"
```

```notes
The dummy does two jobs at once. It gives the head a predecessor, so removing the head is the same splice as removing any node. And it makes `trail` stop **on** the predecessor: counting from the dummy shifts every position by one, which is exactly the offset between the target and the node before it.

`while lead.next is not None` stops with `lead` on the last node, not past it. That one choice is what puts `trail` on node L − n and not L − n + 1.
```

```derivation
**Time O(L).** `lead` moves n steps to open the gap and L − n to march: L steps in all, one pass. On [1,2,3,4,5] with n = 2 that is {{leadSteps}} steps for `lead` and {{trailSteps}} for `trail`, counted by running it.

**Space O(1).** One dummy node and two references, whatever the length.
```

````warn
Do not start the walkers on the head. Without a dummy the head has no predecessor, so when n is the length `lead` walks off the list while opening the gap, and the march then reads `lead.next` from null: `AttributeError` in Python, `TypeError` in TypeScript. On the lesson's seven test inputs it {{noDummyAnswers}}.

```code mistake_no_dummy "Starting on the head"
```
````

```code mistake_one_too_far "Marching one step too far"
```

```notes
This is the trap from above as code. `while lead is not None` lets both walkers take one more step after `lead` reaches the last node, so `trail` stands on the target and the splice removes the node after it, or reads from null when the target is the last node. On the lesson's inputs: {{tooFarAnswers}}.
```
`````

## Variants {#variants}

```vig "Three sketches: a chain whose end links round to its start, a chain with neighbours swapping in pairs, and a chain with its middle node marked"
<circle class="fa" cx="30" cy="12" r="5"/><circle class="fa" cx="70" cy="12" r="5"/><circle class="fa" cx="110" cy="12" r="5"/><circle class="fa" cx="150" cy="12" r="5"/><circle class="fa" cx="190" cy="12" r="5"/><path class="st" d="M38 12L62 12"/><path class="st" d="M57.9 9.2L62 12L57.9 14.8"/><path class="st" d="M78 12L102 12"/><path class="st" d="M97.9 9.2L102 12L97.9 14.8"/><path class="st" d="M118 12L142 12"/><path class="st" d="M137.9 9.2L142 12L137.9 14.8"/><path class="st" d="M158 12L182 12"/><path class="st" d="M177.9 9.2L182 12L177.9 14.8"/><path class="st" d="M190 19Q110 44 33 20"/><path class="st" d="M36.1 23.9L33 20L37.8 18.5"/><circle class="fa" cx="40" cy="62" r="5"/><circle class="fa" cx="80" cy="62" r="5"/><circle class="fa" cx="150" cy="62" r="5"/><circle class="fa" cx="190" cy="62" r="5"/><path class="sc" d="M48 59L72 59"/><path class="sc" d="M67.9 56.2L72 59L67.9 61.8"/><path class="st" d="M72 66L48 66"/><path class="st" d="M52.1 68.8L48 66L52.1 63.2"/><path class="sc" d="M158 59L182 59"/><path class="sc" d="M177.9 56.2L182 59L177.9 61.8"/><path class="st" d="M182 66L158 66"/><path class="st" d="M162.1 68.8L158 66L162.1 63.2"/><circle class="fa" cx="30" cy="100" r="5"/><circle class="fa" cx="70" cy="100" r="5"/><circle class="fr" cx="110" cy="100" r="5"/><circle class="fa" cx="150" cy="100" r="5"/><circle class="fa" cx="190" cy="100" r="5"/><path class="st" d="M38 100L62 100"/><path class="st" d="M57.9 97.2L62 100L57.9 102.8"/><path class="st" d="M78 100L102 100"/><path class="st" d="M97.9 97.2L102 100L97.9 102.8"/><path class="st" d="M118 100L142 100"/><path class="st" d="M137.9 97.2L142 100L137.9 102.8"/><path class="st" d="M158 100L182 100"/><path class="st" d="M177.9 97.2L182 100L177.9 102.8"/>
```

```variants
[
  {
    "title": "Rotate List",
    "source": "LeetCode 61",
    "text": "Move the last k nodes to the front. A gap of k finds the node before the block to move; then the block's end is linked to the old head and the predecessor becomes the new tail."
  },
  {
    "title": "Swap Nodes in Pairs",
    "source": "LeetCode 24",
    "text": "Swap every two adjacent nodes by rewiring, never values. A dummy and a pointer standing on the predecessor of each pair make every swap, including the first, the same three writes."
  },
  {
    "title": "Delete the Middle Node",
    "source": "LeetCode 2095",
    "text": "The middle of the list lesson's two walkers, stopped one node early so the slow one stands on the middle's predecessor, then this lesson's splice."
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
      "question": "Both walkers start on the dummy and the march runs while <code>lead.next</code> is not null. What do those two choices give you together?",
      "options": [
        "<code>trail</code> stops on the target's predecessor, which for the head is the dummy, so one splice covers every case.",
        "<code>trail</code> stops on the target itself, which is what the splice <code>trail.next = trail.next.next</code> needs in order to remove it.",
        "The loop stops on lists with a cycle, because the dummy guarantees that <code>lead</code> eventually reaches a node whose <code>next</code> is null."
      ],
      "answer": 0,
      "explanation": "Counting from the dummy shifts every position by one, so after L − n steps <code>trail</code> is on node L − n, the node before the target. The splice needs the predecessor, not the target, because only the predecessor's <code>next</code> can be rewritten to skip it. And the head's predecessor is the dummy, so removing the head is not a special case."
    },
    {
      "question": "With n equal to the list's length, how many times do the walkers march together after the gap opens?",
      "options": [
        "Once, so that <code>trail</code> moves off the dummy and onto the head, which is the node being removed.",
        "n times, the same as opening the gap, because the march always mirrors the steps <code>lead</code> took to open it.",
        "Zero: opening the gap puts <code>lead</code> on the last node, so the march ends at once with <code>trail</code> on the dummy."
      ],
      "answer": 2,
      "explanation": "The march takes L − n steps, and here L − n is 0. <code>lead</code> is already on node n = L, the last node, so <code>lead.next</code> is null before the first step. <code>trail</code> is still on the dummy, the head's predecessor, and the splice removes the head."
    },
    {
      "question": "The two-pass version counts the length first. Why is the one-pass version not really faster?",
      "options": [
        "It reads about as many links: L for the lead plus L − n for the trail, against L to count plus L − n to walk.",
        "It is slower, because moving two pointers on each step of the march costs twice as much as moving one.",
        "It reads half as many links, since the march covers the list once while the two-pass version covers it twice."
      ],
      "answer": 0,
      "explanation": "Both read L links to reach the end once and L − n more to reach the predecessor; the totals match. What the one-pass version gains is that it never stores or computes the length: the target's position is carried by the gap, which is the skill the follow-up asks for."
    }
  ]
}
```
