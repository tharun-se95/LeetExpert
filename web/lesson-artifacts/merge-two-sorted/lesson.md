---
title: "Merge Two Sorted Lists"
kicker: "Merge Two Sorted Lists · Linked Lists module · problem lesson"
headline: "How do you weave two sorted chains into one without copying a link?"
lede: "Two servers each write their log in time order. To read one timeline, you merge them: look at the oldest unread entry from each, take the older, and repeat. Databases built on sorted runs do the same thing when they compact two runs into one. In a linked list nothing has to move to do it: every entry stays where it is, and only the next pointers are rewritten."
chips:
  - "needs **a dummy node**"
  - "rewires **existing nodes**"
  - "time **O(m + n)**"
hero: |
  <div class="hero-stage"><div class="hero-art navy"><svg id="heroMerge" viewBox="0 0 560 300" role="img" aria-label="Animation: two rows of log entries, each in time order, one per server. A thread starts at a marker on the left and moves to whichever row's front entry is older, linking the entries into one timeline that zigzags between the rows."></svg>
  <div class="hero-read" id="heroRead"><div class="hero-num"><b id="heroNum">0</b> <span id="heroUnit">entries</span> linked</div><div id="heroCap"></div></div></div></div>
---

## Problem {#problem}

```caption
The next node of the merge is always at the front of one list or the other.
```

```vig "Two short chains feeding into one, whose nodes alternate between them"
<circle class="fa" cx="20" cy="26" r="7"/><circle class="fa" cx="58" cy="26" r="7"/><circle class="fa" cx="96" cy="26" r="7"/><path class="st" d="M30 26L48 26"/><path class="st" d="M43.9 23.2L48 26L43.9 28.8"/><path class="st" d="M68 26L86 26"/><path class="st" d="M81.9 23.2L86 26L81.9 28.8"/><circle class="fk" cx="20" cy="86" r="7"/><circle class="fk" cx="58" cy="86" r="7"/><circle class="fk" cx="96" cy="86" r="7"/><path class="st" d="M30 86L48 86"/><path class="st" d="M43.9 83.2L48 86L43.9 88.8"/><path class="st" d="M68 86L86 86"/><path class="st" d="M81.9 83.2L86 86L81.9 88.8"/><path class="st" d="M106 30L138 50"/><path class="st" d="M136 45.4L138 50L133 50.2"/><path class="st" d="M106 82L138 62"/><path class="st" d="M133 61.8L138 62L136 66.6"/><circle class="fa" cx="150" cy="56" r="7"/><circle class="fk" cx="186" cy="56" r="7"/><circle class="fa" cx="222" cy="56" r="7"/><path class="st" d="M160 56L176 56"/><path class="st" d="M171.9 53.2L176 56L171.9 58.8"/><path class="st" d="M196 56L212 56"/><path class="st" d="M207.9 53.2L212 56L207.9 58.8"/>
```

Given the heads of two **sorted** linked lists, merge them into one sorted list by ==splicing together the existing nodes==, and return its head.

```examples
list1 = [1,2,4], list2 = [1,3,4] → [1,1,2,3,4,4]
list1 = [], list2 = [] → []
list1 = [], list2 = [0] → [0]
```

```constraint
0 ≤ each length ≤ 50. Both inputs are sorted in non-decreasing order.
```

Splicing means the answer is made of the same nodes the inputs were made of, linked in a new order: no new node for each value, no copying values around. Read it as the two logs. Each is already in time order, so the oldest unread entry of the whole merge is always at the front of one log or the other. Nothing deeper in a log can be older than its own front.

Merge two lists yourself. Each button takes the front node of one list and links it on after the merged part. When one list runs out, a single link attaches everything left in the other.

```widget #byhand "By hand: take a front, or attach the rest"
<div class="lvhost"></div><div class="actions"><button type="button" class="btn2" data-take="l1"></button><button type="button" class="btn2" data-take="l2"></button><button type="button" class="btn2" data-take="rest">Attach the rest</button><button type="button" class="btn2 reset">Start again</button></div>
```

## Attempt it first {#attempt}

```vig "A placeholder and a short merged chain with a tail marker, and two front nodes waiting to be linked on"
<rect class="st" x="10" y="46" width="24" height="20" rx="4" stroke-dasharray="3 3"/><path class="st" d="M34 56L52 56"/><path class="st" d="M47.9 53.2L52 56L47.9 58.8"/><circle class="fa" cx="62" cy="56" r="8"/><circle class="fa" cx="104" cy="56" r="8"/><path class="st" d="M73 56L93 56"/><path class="st" d="M88.9 53.2L93 56L88.9 58.8"/><polygon class="fc" points="98,26 110,26 104,37"/><circle class="fa" cx="176" cy="28" r="8"/><circle class="fk" cx="176" cy="86" r="8"/><path class="st" d="M114 51L165 32" stroke-dasharray="3 3"/><path class="st" d="M160.1 30.8L165 32L162.1 36.1"/><path class="st" d="M114 61L165 82" stroke-dasharray="3 3"/><path class="st" d="M162.3 77.8L165 82L160.1 83"/>
```

This is the dummy node's signature problem, and it is the merge step inside merge sort and the k-way merge of a later module, so it is worth writing cold. Sketch two short lists and stitch them on paper. Before you do, predict how many times the loop compares two fronts: the answer says something about where the work ends.

```widget "Predict how many comparisons the merge makes"
<div id="predict"></div>
```

```reveal #hint "Hint: a dummy, so the first node is not special"
Start the merged list from a fake node, the dummy, and keep `tail` on the last node of the merged part. Then the first splice is the same as every later one: `tail.next` gets the smaller front, and `tail` moves onto it. The real head is `dummy.next` at the end. When one list runs out, the other is already sorted and every value in it is at least the merged tail's, so one write, `tail.next = what is left`, finishes the job.
```

## Two traps {#trap}

```caption
When one list runs out, the rest of the other is linked on with a single write.
```

```vig "A merged chain, and below it a leftover chain that nothing links to yet"
<circle class="fa" cx="30" cy="36" r="8"/><circle class="fa" cx="70" cy="36" r="8"/><circle class="fa" cx="110" cy="36" r="8"/><path class="st" d="M41 36L59 36"/><path class="st" d="M54.9 33.2L59 36L54.9 38.8"/><path class="st" d="M81 36L99 36"/><path class="st" d="M94.9 33.2L99 36L94.9 38.8"/><circle class="fk" cx="150" cy="84" r="8"/><circle class="fk" cx="186" cy="84" r="8"/><circle class="fk" cx="222" cy="84" r="8"/><path class="st" d="M161 84L175 84"/><path class="st" d="M170.9 81.2L175 84L170.9 86.8"/><path class="st" d="M197 84L211 84"/><path class="st" d="M206.9 81.2L211 84L206.9 86.8"/><path class="st" d="M118 44L142 76" stroke-dasharray="3 3"/><circle class="fr" cx="130" cy="60" r="3.5"/>
```

The first trap is forgetting the leftover. The loop stops as soon as **either** list is empty, and the other may still hold nodes. Without one last write they are never linked on:

```code mistake_no_remainder "No last write"
```

```widget #trapper "[5] and [1,2,3], with and without the last write"
<div class="extabs" role="group" aria-label="Choose a version"></div><div class="lvhost"></div><p class="cost-note" id="trapNote"></p>
```

The second trap is the head. Without a dummy, the first node of the result has no node before it to link from, so it needs its own branch, and the empty lists need theirs:

```code alt_no_dummy "Correct, without a dummy"
```

It is correct, and every one of its extra lines is a place for a bug. The dummy removes all of them: it gives the first real node a node before it, exactly like every other node.

The leftover's single write also matters for the work done. A version that keeps looping through the leftover one node at a time is still correct, but it pays a step for every leftover node:

```widget "Steps taken when one list is much longer"
<div class="chart" id="cost"></div><p class="cost-note" id="costNote"></p>
```

## The insight {#insight}

```caption
The merged part stays sorted, and its tail is never larger than either front.
```

```vig "Four bars rising in order with a marker on the last, and two taller bars waiting beside them"
<path class="st" d="M10 98H230"/><rect class="fg" x="22" y="82" width="12" height="14" rx="2"/><rect class="fg" x="42" y="72" width="12" height="24" rx="2"/><rect class="fg" x="62" y="62" width="12" height="34" rx="2"/><rect class="fg" x="82" y="52" width="12" height="44" rx="2"/><polygon class="fc" points="82,34 94,34 88,45"/><rect class="fa" x="140" y="38" width="14" height="58" rx="2"/><rect class="fk" x="180" y="24" width="14" height="72" rx="2"/>
```

Keep one picture true from start to finish: the nodes from `dummy.next` to `tail` are exactly the nodes taken so far, in sorted order, and `tail` holds a value no larger than either list's front.

- **One step.** The smaller of the two fronts is no smaller than `tail` (the picture says so) and no larger than anything left in either list, since each list is sorted behind its front. So linking it on after `tail` keeps the merged part sorted, and moving `tail` onto it keeps the picture true.
- **The end.** When one list is empty, the other's front was never the smaller one, so it is at least the merged tail; behind it the list is sorted. The whole leftover chain can follow `tail` with one write.

Every comparison retires one node for good, so the loop makes at most m + n − 1 comparisons, and the leftover costs one write however long it is.

```key
Grow the merged list from a dummy with a tail: link the smaller front on, move tail onto it, and when one list runs out, link the rest of the other on in one write.
```

```rosetta "The code, read as two logs"
In the code | In the logs
`list1`, `list2` | the oldest unread entry of each server's log
`list1.val <= list2.val` | which of the two is older, taking server one's on a tie
`tail.next = list1` | the older entry linked onto the merged timeline
`tail` | the newest entry merged so far
`dummy` | a placeholder before the first entry, so the first merge is like every other
`tail.next = list1 or list2` | one log is done: the rest of the other follows as it is
```

`<=` rather than `<` takes ties from `list1` first. That makes the merge **stable**: equal values keep the order their lists gave them, which matters when a node carries more than its key and which merge sort inherits. Watch it on each of the lesson's inputs, and on a tie decided both ways.

```widget #stepper "Walk the merge"
<div class="extabs" role="group" aria-label="Choose an input"></div><div class="lvhost"></div>
```

## Solution {#solution}

```vig "One chain threading back and forth between the nodes of two rows"
<circle class="fa" cx="30" cy="30" r="8"/><circle class="fa" cx="110" cy="30" r="8"/><circle class="fa" cx="190" cy="30" r="8"/><circle class="fk" cx="70" cy="84" r="8"/><circle class="fk" cx="150" cy="84" r="8"/><path class="st" d="M36.5 38.8L63.5 75.2"/><path class="st" d="M63.3 70.2L63.5 75.2L58.7 73.5"/><path class="st" d="M76.5 75.2L103.5 38.8"/><path class="st" d="M98.7 40.5L103.5 38.8L103.3 43.8"/><path class="st" d="M116.5 38.8L143.5 75.2"/><path class="st" d="M143.3 70.2L143.5 75.2L138.7 73.5"/><path class="st" d="M156.5 75.2L183.5 38.8"/><path class="st" d="M178.7 40.5L183.5 38.8L183.3 43.8"/>
```

Attempt it on paper first: set up the dummy and `tail`, write the loop, and say how the leftover gets attached. Then compare.

`````reveal #solbox "Show the solution"
```code solution "Dummy, tail, one last write"
```

```notes
The loop body is one step of the picture: pick the smaller front, link it after `tail`, advance that list, move `tail`. `tail.next = list1 if list1 is not None else list2` is the end of the picture: at most one list still has nodes, and they all belong after `tail`. `dummy.next` is the merged list's first real node, or null when both inputs were empty.
```

```derivation
**Time O(m + n).** Each comparison links one node and never revisits it, and the loop ends as soon as one list is empty, so it makes at most m + n − 1 comparisons. On the lesson's first example, [1,2,4] and [1,3,4], it makes {{cmpExample}}, counted by running it; the leftover, one node, is linked by a single write.

**Space O(1).** The dummy node and the `tail` reference, whatever the lengths: every node of the result is a node of the input, rewired. Checked on {{spliceChecks}} random pairs of sorted lists: every node of the merged list is one of the input nodes, and each appears once.
```

````warn
Attach the leftover. The loop stops when either list is empty, so a version without the last write loses whatever the other list still holds: on the lesson's four inputs it returns {{noRemainderAnswers}}.

```code mistake_no_remainder "No last write"
```
````
`````

## Variants {#variants}

```vig "Three sketches: three rows funnelling into one, two pairs joined into a row of four, and a row of boxes filled from the back"
<path class="st" d="M14 14H64M14 30H64M14 46H64"/><path class="st" d="M68 14L95 26"/><path class="st" d="M92.4 21.7L95 26L90.1 26.9"/><path class="st" d="M68 30L94 30"/><path class="st" d="M89.9 27.2L94 30L89.9 32.8"/><path class="st" d="M68 46L95 34"/><path class="st" d="M90.1 33.1L95 34L92.4 38.3"/><circle class="fk" cx="104" cy="30" r="7"/><circle class="fa" cx="150" cy="14" r="5"/><circle class="fa" cx="172" cy="14" r="5"/><circle class="fa" cx="198" cy="14" r="5"/><circle class="fa" cx="220" cy="14" r="5"/><path class="st" d="M161 21L170 38"/><path class="st" d="M170.6 33L170 38L165.6 35.7"/><path class="st" d="M209 21L200 38"/><path class="st" d="M204.4 35.7L200 38L199.4 33"/><circle class="fk" cx="152" cy="46" r="5"/><circle class="fk" cx="174" cy="46" r="5"/><circle class="fk" cx="196" cy="46" r="5"/><circle class="fk" cx="218" cy="46" r="5"/><rect class="fa" x="30" y="82" width="20" height="18" rx="3"/><rect class="fa" x="54" y="82" width="20" height="18" rx="3"/><rect class="fa" x="78" y="82" width="20" height="18" rx="3"/><rect class="st" x="102" y="82" width="20" height="18" rx="3"/><rect class="st" x="126" y="82" width="20" height="18" rx="3"/><rect class="fk" x="150" y="82" width="20" height="18" rx="3"/><rect class="fk" x="174" y="82" width="20" height="18" rx="3"/><rect class="fk" x="198" y="82" width="20" height="18" rx="3"/><polygon class="fc" points="130,64 142,64 136,75"/>
```

```variants
[
  {
    "title": "Merge k Sorted Lists",
    "source": "LeetCode 23",
    "text": "Merge pairs of lists until one is left, or keep the k fronts in a min-heap and pop the smallest each time. Both use this lesson's dummy and tail."
  },
  {
    "title": "Sort List",
    "source": "LeetCode 148",
    "text": "Merge sort on a linked list: split at the middle with the slow and fast walkers, sort both halves, and merge them with this loop. No random access is needed anywhere."
  },
  {
    "title": "Merge Sorted Array",
    "source": "LeetCode 88",
    "text": "The same merge on arrays, done in place. Arrays cannot be spliced, so the merge fills the larger array from the back, where the free slots are."
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
      "question": "When the loop ends, why can a single write attach everything left in the other list?",
      "options": [
        "The leftover's front was never the smaller front, so it is at least the tail, and its list is sorted behind it.",
        "The dummy node keeps the merged list sorted, so anything linked after <code>tail</code> ends up in order automatically.",
        "The leftover is always a single node, because the loop stops when the two lists differ in length by exactly one."
      ],
      "answer": 0,
      "explanation": "Two facts combine. The leftover's front survived every comparison it took part in, so it is no smaller than anything already merged. And the rest of its list is sorted behind it. So the whole chain continues the merged order, and linking its front on links all of it. The dummy only removes the special case for the first node, and the leftover can be any length."
    },
    {
      "question": "Without a dummy node, which parts of the merge need special cases?",
      "options": [
        "The last node, because without a dummy <code>tail</code> ends one node short of where the leftover has to be attached.",
        "The first node and the empty inputs, since the result's first node has no node before it to link from.",
        "Ties between equal values, because without a dummy the loop cannot tell which list an equal value came from."
      ],
      "answer": 1,
      "explanation": "Every node except the first is attached by <code>tail.next = …</code>. The first has no <code>tail</code> before it, so it needs its own branch, and so do the empty inputs that have no first node. A dummy is a node before the first, which makes the first splice the same as every other one."
    },
    {
      "question": "The comparison is <code>list1.val &lt;= list2.val</code>. What changes if it uses <code>&lt;</code> instead?",
      "options": [
        "The merge would drop one of two equal values, since <code>&lt;</code> treats a tie as neither list's turn.",
        "The loop would never end on a tie, since neither front would count as smaller and neither list would advance.",
        "Ties would be taken from <code>list2</code> first, so equal values would no longer keep the order their lists gave them."
      ],
      "answer": 2,
      "explanation": "With <code>&lt;</code> a tie makes the condition false, so the else branch takes <code>list2</code>'s node. Every node is still merged and the values come out sorted, but equal keys from the two lists swap their order. That is the loss of stability, which matters once nodes carry data beyond the value compared."
    }
  ]
}
```
