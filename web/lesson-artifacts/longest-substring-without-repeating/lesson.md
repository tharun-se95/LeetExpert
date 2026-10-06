---
title: "Longest Substring Without Repeating Characters"
kicker: "Longest Substring Without Repeating Characters · Sliding Window module · problem lesson"
headline: "How long can traffic run before one server is hit twice?"
lede: "A load balancer hands each request to one of a few backends. Watch a stretch of that traffic and ask how long it can go on before some backend gets a second request. That longest clean stretch is the longest substring without repeating characters, and finding it needs one idea: never look at the same request twice."
chips:
  - "needs **a set**"
  - "shape **expand, then shrink**"
  - "time **O(n)**"
hero: |
  <div class="hero-stage"><div class="hero-art navy"><svg id="heroStream" viewBox="0 0 560 300" role="img" aria-label="Animation: a window slides across a stream of requests, each labelled with the backend that handled it. It widens while every backend is new and shrinks from the left the moment a backend repeats."></svg>
  <div class="hero-read" id="heroRead"><div class="hero-num"><b id="heroNum">0</b> in a row</div><div id="heroCap"></div></div></div></div>
---

## Problem {#problem banner}

Given a string `s`, return the length of the longest **substring** that has no repeating characters. A substring is a stretch of consecutive characters, so it cannot skip any.

```examples
s = "abcabcbb" → 3 ("abc")
s = "bbbbb" → 1 ("b")
s = "pwwkew" → 3 ("wke", and note "pwke" is not a substring)
```

```constraint
0 ≤ n ≤ 5·10⁴ characters: letters, digits, symbols and spaces.
```

Read the string as a log of requests: each character is the backend that served one request, in order. A stretch is clean when no backend appears in it twice, which is what a well-spread burst of traffic looks like. The question is how long the longest clean stretch is. You are choosing two things, where the stretch starts and where it ends, and that is the whole difficulty: there are far too many pairs to try naively.

```widget #explore "Explore: pick a stretch and see whether it is clean"
<div class="tv-wrap"><div class="tv"></div></div><div class="readout" aria-live="polite"></div><div class="actions"><button type="button" class="btn2 best">Show a longest clean stretch</button><button type="button" class="btn2 clear">Clear</button></div>
```

## Attempt it first {#attempt banner}

This is the "longest window that stays valid" shape from the dynamic-window lesson, and it is the mirror image of Minimum Size Subarray Sum, which looked for the shortest one. Two questions decide everything, so settle them before opening anything.

First, what single piece of state answers "is the request that just arrived a repeat of one already in my stretch?" in constant time? Second, when the answer is yes, what must happen to the stretch, and how far must it shrink?

To get a feel for it, predict the answer for each string, then see the stretch.

```widget "Predict the longest clean stretch"
<div id="predict"></div>
```

```reveal #hint "Hint: one set and one rule"
Keep a set of the characters in the current window. When the next character is already in the set, the window is invalid.

A window that is invalid stays invalid as it grows, so extending is pointless: remove characters from the left, one at a time, until the earlier copy of the newcomer is gone. Then add the newcomer.

Record the length only once the window is clean.
```

## The restart trap {#trap banner}

The direct approach is to fix every possible start and read forward until a backend repeats, remembering the longest run seen. It is correct, and it is what most people write first:

```code naive "Restart from every position"
```

Look at what it throws away. When the run from start 0 stops at position 5 because position 5 repeats position 2, the run from start 1 will read positions 1 to 4 again, and the run from start 2 will read 2 to 4 once more. Every one of those characters was already checked and known to be clean. The restart forgets everything and re-derives it.

How much is wasted depends on how long clean stretches run. A stretch can never be longer than the number of distinct characters in play, so each start re-reads at most that many. In a string cycling through 26 letters each start re-reads about 26 characters, so the total is about 26 times the length. If identifiers were unbounded, as request IDs are in a real system, clean stretches could be as long as the log and the cost would be quadratic. Either way the same characters are read again and again.

```widget "Characters read as the log grows (a cycle of 26 backends)"
<div class="chart" id="cost"></div><p class="cost-note"></p>
```

## The insight {#insight banner}

Two facts, and the second one is what makes a single pass possible.

**First: keep the stretch, not the restarts.** Hold a window over the log, with a left edge and a right edge, and a set of the backends currently inside it. Each new request extends the right edge by one. Checking the set answers "is it a repeat?" in constant time.

**Second: a repeat can only be cured by shrinking.** If a stretch contains a repeated backend, every longer stretch that contains it also does, because adding requests can never remove a duplicate. So when the newcomer repeats a backend in the window, extending further is pointless and the only way back to clean is to move the left edge forward. So drop requests from the left, one at a time, until the earlier copy of that backend has left. Stopping sooner leaves the duplicate inside. Going further would discard requests that are still clean. The window that remains is therefore the longest clean stretch that ends at the newcomer, and since every clean stretch ends somewhere, taking the best over all right edges misses nothing.

```key
A window that is invalid stays invalid as it grows, so it is only ever repaired from the left. That is why each request enters the window once and leaves it at most once.
```

```rosetta "The code, read as a load balancer"
In the code | In the system
`s[right]` | the backend that just served a request
`window` | the set of backends used in the current stretch
`s[right] in window` | this backend was already used in the stretch: a hot spot has formed
`left += 1` | forget the oldest request until the hot spot is gone
`right - left + 1` | how many requests the clean stretch spans
`best` | the longest clean stretch on record
```

Watch it happen. The top row is the log. The key above it names each marking: the cells inside the window, the request that just arrived, and the earlier copy of a repeated backend. Below it is the set.

```widget #stepper "Walk the window through a log"
<div class="extabs" role="group" aria-label="Choose a log"></div><div class="plhost"></div>
```

## Solution {#solution banner}

Attempt it on paper first: write the loop, decide where the shrinking happens, and decide exactly where `best` is updated. Then compare. Read it as one clerk at the load balancer, who keeps a list of the backends in the current stretch, ticks off the oldest request whenever a repeat shows up, and updates the record only when the stretch is clean.

`````reveal #solbox "Show the solution"
```code solution "Expand, shrink until clean, then record"
```

```notes
The `while` loop is the shrink: while the newcomer is already in the set, drop the leftmost character and move `left` forward. When it stops, the window is clean, so the newcomer is added and the length is measured. `best` is read once per request, after the repair, which is the only moment the window is guaranteed to be a clean stretch.
```

```derivation
**Time O(n).** The right edge visits each of the n requests once, and each request is added to the set once. The left edge only moves forward and never passes the right edge, so it drops each request at most once. Counting on `abcabcbb` gives {{adds}} adds and {{removes}} drops for a log of 8, and on every string tested here the adds equal n and the drops never exceed n. That is at most 2n set operations, each constant time. The restart version could not say this: it re-read characters it had already cleared.

**Space O(min(n, σ)).** The set holds only characters inside the window, all distinct, so it can never be larger than the number of distinct characters σ that can occur, or than n.
```

````warn
Do not record the length before the shrink. Counting `right - left + 1` while a repeat is still inside the window credits a stretch that is not clean. On this lesson's own cases that version is wrong for {{wrongCases}}.

```code mistake "The mistake"
```
````
`````

## Variants {#variants}

Once you see "grow while valid, shrink until valid again", a family of problems opens up. Only the meaning of valid changes.

```variants
[
  {
    "title": "Longest Substring with At Most K Distinct",
    "source": "same window, new rule",
    "text": "Valid now means the window holds at most k different characters. A set is no longer enough: you need a count per character, so that dropping one copy of a character does not remove it while other copies remain."
  },
  {
    "title": "Longest Repeating Character Replacement",
    "source": "same window, new rule",
    "text": "Valid means the window length minus the count of its most frequent character is at most k, because that many characters can be replaced. The rule is still monotonic, so the window still only shrinks from the left."
  },
  {
    "title": "Permutation in String",
    "source": "fixed size instead",
    "text": "The window never changes size: it slides one step at a time and compares its letter counts with the target's. It is the same two edges moving together, with a different question at each stop."
  }
]
```

## Check yourself {#quiz}

```quiz
{
  "questions": [
    {
      "question": "A faster version stores each backend's last position and, on a repeat, jumps the left edge to one past it. Why must the jump be guarded with <code>last[c] >= left</code>?",
      "options": [
        "The map keeps positions from before the window began. Unguarded, an old one drags the left edge back, so on <code>abba</code> the window holds a repeat and the answer is {{abbaBad}}, not {{abbaOk}}.",
        "Without it, a backend that has never appeared is looked up in the map and the lookup throws, so the guard exists only to protect the first appearance of each backend.",
        "It is only a speed-up: it skips moving the left edge when the jump would not change the answer, and removing it would leave every result the same, just a little slower."
      ],
      "answer": 0,
      "explanation": "The map never forgets. In <code>abba</code>, when the last <code>a</code> arrives the map still says <code>a</code> was at position 0, but the window has already moved past it. Jumping to position 1 moves the left edge backward and the window <code>bba</code> contains a repeat. The guard separates \"a repeat inside my window\" from \"a backend I saw long ago\", and the left edge must only ever move forward."
    },
    {
      "question": "The loop has a <code>while</code> inside a <code>for</code>. Why is the total still O(n) and not O(n²)?",
      "options": [
        "The left edge only moves forward, so over the whole run the while loop drops at most n requests: each request is added once and dropped at most once.",
        "The while loop runs at most 26 times per step, once per letter, so each step costs a constant amount and the total is 26 × n, which is still O(n).",
        "The while loop only fires when a request repeats, and repeats are rare in real traffic logs, so on average the inner loop does almost no work per step."
      ],
      "answer": 0,
      "explanation": "This is an amortised count: the cost of the inner loop is paid for by the requests it removes, and each request can be removed only once. The 26-per-step argument gives a weaker bound that fails when identifiers are unbounded, and a log such as <code>bbbbb</code> repeats on every step, so \"repeats are rare\" is not true."
    },
    {
      "question": "Where must <code>best</code> be updated?",
      "options": [
        "After the while loop, once the window is clean again: only then does <code>right - left + 1</code> measure a stretch with no repeat in it.",
        "At the top of the loop body, as soon as the newcomer arrives, so the record counts the request that just came in before anything is removed.",
        "Inside the while loop, on every step of the shrinking, so that each smaller window the left edge passes through is compared with the record."
      ],
      "answer": 0,
      "explanation": "Before the shrink the window may still hold a repeat. Counting it credits a stretch that is not clean: the version that records first answers {{mistakeLongest_bbbbb}} on <code>bbbbb</code>, where the answer is 1. Inside the while loop every window is still invalid, so nothing there qualifies."
    }
  ]
}
```

