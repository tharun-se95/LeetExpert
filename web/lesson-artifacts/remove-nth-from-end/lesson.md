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

## Problem {#problem banner}

Given the `head` of a linked list, remove the **n-th node from the end** and return the head. n is always valid.

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

## Attempt it first {#attempt banner}

This is the module's graduation exercise: the two-walker gap, the dummy node, and standing on the predecessor, together in about ten lines. Work out where `trail` stops before you read on: it has to be the node **before** the target, never the target.

```widget "Predict where trail stops"
<div id="predict"></div>
```

```reveal #hint "Hint: start both walkers on a dummy"
Put a dummy node in front of the head and start `lead` and `trail` on it. Move `lead` n steps ahead, then move both until `lead` is on the last node. `trail` is then on the target's predecessor, and when the target is the head, that predecessor is the dummy, so the same splice removes it.
```

## Two passes, or one? {#trap toc="Two passes, or one?" banner}

The two-pass version is a fine first answer. Count the length L, then walk to node L − n from a dummy, which is the target's predecessor:

```code alt_two_pass "Count, then walk to the predecessor"
```

As in the middle-of-the-list lesson, one pass does not mean less work: the two versions read about the same number of links.

```widget "Links read, both versions, as the list grows"
<div class="chart" id="cost"></div><p class="cost-note" id="costNote"></p>
```

What the one-pass version buys is that it never needs the length: the position is carried as a **gap** between two walkers instead of as a number. The trap is in exactly where the march stops. Stop it when `lead` is null instead of when `lead` is on the last node, and both walkers take one more step: `trail` lands on the target itself, and the splice removes the node after it.

```widget #trapper "[1,2,3,4,5], n = 2, two stopping points"
<div class="extabs" role="group" aria-label="Choose a stopping point"></div><div class="lvhost"></div><p class="cost-note" id="trapNote"></p>
```

## The insight {#insight banner}

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

## Solution {#solution banner}

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
