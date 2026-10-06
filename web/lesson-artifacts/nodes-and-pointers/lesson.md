---
title: "Nodes and Pointers"
kicker: "Nodes and Pointers · Linked Lists module · concept lesson"
headline: "What changes when the elements stop sitting next to each other?"
lede: "A running program asks for memory one object at a time, and the allocator puts each object wherever it finds a free gap. Nothing lines them up. An array fights that: it demands one unbroken block. A linked list accepts it: each element sits wherever it landed and records the address of the next one. That single choice decides everything the list is good at, and everything it is bad at."
chips:
  - "a node is **a value and an address**"
  - "edit **two writes**"
  - "reach **one link at a time**"
hero: |
  <div class="hero-stage"><div class="hero-art navy"><svg id="heroHeap" viewBox="0 0 560 300" role="img" aria-label="Animation: four objects sit at scattered addresses in memory, each holding the address of the next. A new object is allocated in a free gap and spliced in between two of them by rewriting two addresses; none of the existing objects move."></svg>
  <div class="hero-read" id="heroRead"><div class="hero-num"><b id="heroNum">0</b> <span id="heroUnit">objects</span> moved</div><div id="heroCap"></div></div></div></div>
---

## A value and an address {#node}

```vig "One node drawn large, a value cell and an address cell, its arrow leaving for the next node"
<rect class="fa" x="16" y="32" width="78" height="48" rx="6"/><rect class="st" x="94" y="32" width="50" height="48" rx="6"/><circle class="fk" cx="119" cy="56" r="4"/><path class="st" d="M119 56L176 56"/><path class="st" d="M171.9 53.2L176 56L171.9 58.8"/><rect class="fa" x="180" y="44" width="26" height="24" rx="4"/><rect class="st" x="206" y="44" width="16" height="24" rx="4"/><circle class="fk" cx="214" cy="56" r="2.5"/>
```

Every structure so far kept its elements in one contiguous block, so the address of element i was a sum: the block's start plus i times the element size. A ==linked list== gives that up. Each element is a free-standing ==node==: a value, plus a ==pointer== to the next node, which is nothing more than that node's address. The last node's pointer is empty (`None` in Python, `null` in TypeScript, drawn here as ∅). The only thing you hold on to is a reference to the first node, the **head**.

In Python and TypeScript every object variable is already a reference, so a pointer needs no special syntax: `node.next = other` stores where `other` lives, not a copy of it. Assigning one is a single write, and it never moves any data. That fact is the source of everything a list is good at.

```code solution "A node, a walk and an insert"
```

```rosetta "The code, read as memory"
In the code | In memory
`Node(value)` | an object the allocator placed wherever it found room
`node.next` | the address of the next object, stored inside this one
`None` / `null` | an address that names nothing: the end of the chain
`head` | the one address the program keeps: the way in
`node.next = other` | one address written into one object; nothing moves
```

Here is a real list of three nodes. Insert a new value after any of them and watch the two writes. Every node stays exactly where it was; only arrows change.

```widget #play "Insert after a node: two writes"
<div class="lvhost"></div><div class="actions" id="playBtns"></div><div class="actions"><button type="button" class="btn2 reset">Start again</button><span class="lv-hint" id="playHint"></span></div>
```

```key
A linked list is nodes that each hold the address of the next; the head is the only way in, and editing the chain means rewriting addresses, never moving nodes.
```

## Reaching a node: walk, don't jump {#walk}

```caption
A position is a walk: node i is i links from the head, and nothing else records where it lives.
```

```vig "Five nodes in a row, with a walker hopping link by link from the first to the fourth"
<circle class="fa" cx="24" cy="76" r="8"/><circle class="fa" cx="70" cy="76" r="8"/><circle class="fa" cx="116" cy="76" r="8"/><circle class="fa" cx="162" cy="76" r="8"/><circle class="fa" cx="208" cy="76" r="8"/><path class="st" d="M35 76L59 76"/><path class="st" d="M54.9 73.2L59 76L54.9 78.8"/><path class="st" d="M81 76L105 76"/><path class="st" d="M100.9 73.2L105 76L100.9 78.8"/><path class="st" d="M127 76L151 76"/><path class="st" d="M146.9 73.2L151 76L146.9 78.8"/><path class="st" d="M173 76L197 76"/><path class="st" d="M192.9 73.2L197 76L192.9 78.8"/><path class="sc" d="M24 62Q47 34 70 62" stroke-dasharray="4 4"/><path class="sc" d="M69.6 57L70 62L65.2 60.6"/><path class="sc" d="M70 62Q93 34 116 62" stroke-dasharray="4 4"/><path class="sc" d="M115.6 57L116 62L111.2 60.6"/><path class="sc" d="M116 62Q139 34 162 62" stroke-dasharray="4 4"/><path class="sc" d="M161.6 57L162 62L157.2 60.6"/><polygon class="fk" points="156,16 168,16 162,27"/>
```

The price of scattering the nodes is that a position means nothing to the machine. With an array, element i is one multiplication and one addition away. In a list, node i can only be reached by starting at the head and following `next` i times, because the only record of where node i lives is inside node i − 1. Reaching node i costs i steps, so finding a position or a value is O(n).

```widget #walker "Walk to node i"
<div class="extabs" role="group" aria-label="Choose i"></div><div class="lvhost"></div>
```

That changes which algorithms are worth running. Binary search needs a cheap jump to the middle of a range, and a list has none. On a sorted list the search still needs only about log₂ L comparisons, but reaching each middle is a walk: L ÷ 2 links in the first round, L ÷ 4 in the next, and so on, which adds up to about L. The count of rounds survives; the cheap round does not.

```widget "Links followed: binary search on a sorted list against a plain scan"
<div class="chart" id="cost"></div><p class="cost-note" id="costNote"></p>
```

## Two writes, in the right order {#trap}

```caption
Save the old pointer in the new node before you overwrite it.
```

```vig "A new node above a chain of two: its own pointer aimed at the second node, and the first node's pointer turned up to it"
<rect class="fa" x="20" y="64" width="26" height="24" rx="4"/><rect class="st" x="46" y="64" width="16" height="24" rx="4"/><circle class="fk" cx="54" cy="76" r="2.5"/><rect class="fa" x="150" y="64" width="26" height="24" rx="4"/><rect class="st" x="176" y="64" width="16" height="24" rx="4"/><circle class="fk" cx="184" cy="76" r="2.5"/><path class="st" d="M184 76L204 76"/><path class="st" d="M199.9 73.2L204 76L199.9 78.8"/><circle class="st" cx="214" cy="76" r="7"/><path class="st" d="M209.1 80.9L218.9 71.1"/><path class="st" d="M56 76L146 76" stroke-dasharray="3 3"/><rect class="fk" x="86" y="14" width="26" height="24" rx="4"/><rect class="st" x="112" y="14" width="16" height="24" rx="4"/><circle class="fk" cx="120" cy="26" r="2.5"/><path class="sc" d="M120 26L158 60"/><path class="sc" d="M156.8 55.1L158 60L153 59.4"/><path class="st" d="M54 76L90 42"/><path class="st" d="M85.1 42.8L90 42L88.9 46.9"/>
```

Inserting a value after a node you hold is the list's best trick: two writes, whatever the length. Make the new node point where the old one pointed, then point the old one at the new node. The order is not a style choice. The old node's `next` is the only route to everything after it, so it must be copied into the new node before it is overwritten.

```widget #trapper "Insert 9 after 3 in 7 → 3 → 12, two orders"
<div class="extabs" role="group" aria-label="Choose an order"></div><div class="lvhost"></div>
```

````warn
Write the new node's `next` before the old node's. Swapped, `node.next = new` runs first, so `new.next = node.next` reads the new node itself: it points at itself, and 12 and everything after it can no longer be reached. In both languages, inserting 9 after 3 in 7 → 3 → 12 leaves a walk from the head that reads 7, 3, 9, 9, 9, … and never ends.

```code mistake "The two writes, swapped"
```
````

## What it costs {#cost toc="What it costs"}

```vig "One short bar for a write beside a climbing staircase of bars for a walk"
<path class="st" d="M10 100H78M96 100H230"/><rect class="fg" x="36" y="84" width="16" height="12" rx="2"/><rect class="fr" x="104" y="86" width="10" height="10" rx="2"/><rect class="fr" x="119" y="76" width="10" height="20" rx="2"/><rect class="fr" x="134" y="66" width="10" height="30" rx="2"/><rect class="fr" x="149" y="56" width="10" height="40" rx="2"/><rect class="fr" x="164" y="46" width="10" height="50" rx="2"/><rect class="fr" x="179" y="36" width="10" height="60" rx="2"/><rect class="fr" x="194" y="26" width="10" height="70" rx="2"/><rect class="fr" x="209" y="16" width="10" height="80" rx="2"/>
```

Every cost follows from the same two facts: an edit is a few writes, and a position is a walk.

```rosetta "The costs, and where each one comes from"
The operation | Its cost
reach node i | O(i): follow i links from the head, since nothing records where node i lives except node i − 1
find a value | O(n): walk and compare, exactly like an unsorted array
insert or delete after a node you hold | O(1): two writes, and nothing shifts
insert after the node holding 42 | O(n): the walk to find 42 dominates, and the two writes are the cheap part
push to the front | O(1): the new node points at the old head, and head points at the new node
```

The fourth row is the one to remember. The O(1) insert is conditional on already holding the neighbour. A list pays off when the algorithm walks past the splice point anyway, holding the nodes it needs as it goes, which is exactly what the problems in this module do.

Memory is the cost big-O hides. Each value carries an address beside it and is a separate allocation, so a list spends at least twice the slots per value of an array, and its scattered nodes defeat the cache that makes an array fast to read in order. In practice an array wins most container jobs. Lists earn their place where edits dominate: schedulers, LRU caches, adjacency lists. And they matter in this course because trees and graphs are node-and-pointer structures with more pointers: this module is where that skill is built.

## Where next {#next}

```vig "Three sketches: a chain with a marker on each end, a chain linked in both directions, and a chain with a placeholder box in front"
<circle class="fa" cx="14" cy="34" r="6"/><circle class="fa" cx="48" cy="34" r="6"/><circle class="fa" cx="82" cy="34" r="6"/><path class="st" d="M23 34L39 34"/><path class="st" d="M34.9 31.2L39 34L34.9 36.8"/><path class="st" d="M57 34L73 34"/><path class="st" d="M68.9 31.2L73 34L68.9 36.8"/><polygon class="fc" points="8,10 20,10 14,21"/><polygon class="fk" points="76,10 88,10 82,21"/><circle class="fa" cx="136" cy="34" r="6"/><circle class="fa" cx="176" cy="34" r="6"/><circle class="fa" cx="216" cy="34" r="6"/><path class="st" d="M145 31L167 31"/><path class="st" d="M162.9 28.2L167 31L162.9 33.8"/><path class="sc" d="M167 38L145 38"/><path class="sc" d="M149.1 40.8L145 38L149.1 35.2"/><path class="st" d="M185 31L207 31"/><path class="st" d="M202.9 28.2L207 31L202.9 33.8"/><path class="sc" d="M207 38L185 38"/><path class="sc" d="M189.1 40.8L185 38L189.1 35.2"/><rect class="st" x="56" y="72" width="22" height="18" rx="4" stroke-dasharray="3 3"/><path class="st" d="M78 81L98 81"/><path class="st" d="M93.9 78.2L98 81L93.9 83.8"/><circle class="fa" cx="108" cy="81" r="6"/><circle class="fa" cx="148" cy="81" r="6"/><circle class="fa" cx="188" cy="81" r="6"/><path class="st" d="M117 81L139 81"/><path class="st" d="M134.9 78.2L139 81L134.9 83.8"/><path class="st" d="M157 81L179 81"/><path class="st" d="M174.9 78.2L179 81L174.9 83.8"/>
```

```variants
[
  {
    "title": "Build a Linked List From Scratch",
    "source": "next lesson",
    "text": "Wrap the nodes in a class that keeps head, tail and size, and see which pointer every operation has to rewrite, including the ones that are easy to forget."
  },
  {
    "title": "Doubly linked lists",
    "source": "variant",
    "text": "Each node also holds the address of the node before it, so a node can be removed without walking to its predecessor, and the list can be walked backwards. The price is one more pointer per node to keep consistent; an LRU cache is built on one."
  },
  {
    "title": "Sentinel (dummy) nodes",
    "source": "Pointer Surgery Patterns",
    "text": "A permanent placeholder before the real head, there only so that editing at the head looks like editing anywhere else. The surgery lesson leans on it."
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
      "question": "Why is there no useful binary search on a sorted linked list?",
      "options": [
        "Binary search needs a cheap jump to the middle, and a list reaches its middle only by walking, about L links in all.",
        "Reading each node's value before comparing adds enough work per step that binary search loses its advantage over a scan.",
        "A linked list cannot be kept sorted, because without random access there is no way to put its values in order."
      ],
      "answer": 0,
      "explanation": "The log n bound comes from jumping straight to the middle. On a list, reaching the middle of a range of L nodes takes L ÷ 2 steps, then L ÷ 4, and so on: about L in total, a scan's worth of walking spread over log L rounds. The comparisons are no slower, and sorting a list is entirely possible: merge sort does it."
    },
    {
      "question": "What does \"insert x after the node holding 42\" really cost in a singly linked list?",
      "options": [
        "O(1), because a list insertion only ever writes a fixed number of pointers, wherever the node is.",
        "O(n): finding the node holding 42 is a walk, and only the two writes after you hold it are O(1).",
        "O(log n), because the walk can skip half of the remaining nodes each time it compares a value."
      ],
      "answer": 1,
      "explanation": "The O(1) insert assumes you already hold the neighbour. Here you hold only the head, so the walk to 42 comes first: O(n) to find, then O(1) to splice. A walk cannot skip nodes, because each node's address is stored only in the node before it."
    },
    {
      "question": "The insert writes <code>new.next = node.next</code> and then <code>node.next = new</code>. What happens if the two lines are swapped?",
      "options": [
        "Nothing changes: the two lines write different fields, so either order leaves the same pointers once both have run.",
        "The new node lands one position too late, after the node that followed the one you meant to insert after.",
        "<code>new.next</code> reads the already-updated <code>node.next</code>, which is the new node, so it points at itself and the rest is lost."
      ],
      "answer": 2,
      "explanation": "Both lines touch <code>node.next</code>: the first reads it, the second overwrites it. Swapped, the overwrite comes first, so the read sees the new node and the new node points at itself. Nothing points at the old successor any more, so it and everything after it is lost, and a walk from the head never reaches null."
    }
  ]
}
```
