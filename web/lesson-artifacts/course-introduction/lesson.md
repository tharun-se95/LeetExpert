---
title: "Course Introduction"
kicker: "Course Introduction · Getting Started module · concept lesson"
headline: "Do you want a shelf of answers, or the skill that makes them?"
lede: "Picture two cooks. One has memorised a stack of recipe cards word for word and freezes the moment a dish is not on a card. The other knows how heat moves through a pan and cooks something good from whatever is in the fridge. This course is built to make you the second cook: someone who can meet a problem they have never seen, work out what it needs, and build the answer from understanding rather than from a list of things they have already met."
chips:
  - "a recipe answers **one problem**"
  - "a technique answers **every problem of its shape**"
  - "the set remembers **what was already read**"
hero: |
  <div class="hero-stage"><div class="hero-art navy"><svg id="heroShelf" viewBox="0 0 560 300" role="img" aria-label="Animation: three problems arrive one after another, finding duplicate numbers, a repeated letter and a repeated word. A recipe shelf keyed by exact title answers only the first. A technique, one function that asks whether it has seen the item before, answers all three."></svg>
  <div class="hero-read" id="heroRead"><div class="hero-num"><b id="heroNum">0</b> <span id="heroUnit">of 3 answered by the shelf</span></div><div id="heroCap"></div></div></div></div>
---

## Two cooks {#insight toc="Two cooks"}

```caption
A memorised answer matches the one problem it was written for; a technique matches every problem with the same shape.
```

```vig "A shelf of recipe cards on the left with one card pulled out, and a single pan on the right with three different dishes arriving in it"
<rect class="fa" x="12" y="30" width="22" height="46" rx="4"/><rect class="fa" x="38" y="30" width="22" height="46" rx="4"/><rect class="fk" x="64" y="18" width="22" height="46" rx="4"/><rect class="fa" x="90" y="30" width="22" height="46" rx="4"/><path class="st" d="M10 80H114"/><circle class="fa" cx="178" cy="62" r="24"/><path class="st" d="M202 62H226"/><circle class="fk" cx="168" cy="24" r="7"/><circle class="fk" cx="186" cy="20" r="7"/><circle class="fk" cx="204" cy="26" r="7"/>
```

The first cook has fifty recipes by heart: exact times, exact amounts, exact order. Hand them one of those fifty dishes and they will nail it. Hand them a fifty-first, even one made from ingredients they have used a hundred times, and nothing on their shelf matches the card in front of them, so they do not know where to start.

The second cook has memorised no recipe at all. What they know is ==technique==: why the surface of the meat browns, why salt added early behaves differently from salt added late. Given a dish they have never made, they look at what is in front of them, work out what the heat and the timing must do, and cook something good, because they understand what is happening in the pan.

Most interview preparation trains the first cook. It optimises for recognising problems you have effectively met, and recognition is a real skill, but it is a side effect of understanding, not a replacement for it. This course aims at the second cook: by the end you should be able to pick up an unfamiliar problem, reason about what the data demands, choose a structure because you understand its costs, and build it without a reference.

Here is that difference running. Three problems that look different: duplicate numbers in an array, the first repeated letter in a word, the first repeated word in a sentence. The recipe-reciter keeps a shelf with one card per problem, filed under the exact title the card was written for. The technique-cook keeps one function, `first_repeat(items)`. Pick a problem. The shelf either has a card for that title or it does not; the technique scans left to right and keeps a ==set== of everything it has read, so "have I seen this before?" is one question to the set.

```widget #shelf "Pick a problem: the shelf against the technique"
<div class="extabs" role="group" aria-label="Choose a problem"></div><div class="rc" id="rc" aria-live="polite"></div><div class="lvhost"></div>
```

Nothing about the problems the shelf missed was harder. They were just filed under different titles, and the shelf looks things up by title. The score under the widget counts what each side answered.

The technique transfers for a reason you can state. `first_repeat` never asks what the items are. It asks two things of them: is this one equal to another, and is it in the set. Numbers, letters and words all answer both, so one function covers all three problems and every other problem that reduces to "has this appeared before?".

```key
A recipe stores a result; a technique stores the reason the result is true, so it keeps working on inputs nobody wrote a card for.
```

## One function, one order of operations {#solution toc="One function"}

```caption
Ask the set first, then add: only earlier items are in the set when you ask.
```

```vig "A list read left to right with a pointer on one item, and a small set to its right collecting the items already read"
<rect class="fa" x="10" y="40" width="26" height="24" rx="4"/><rect class="fa" x="40" y="40" width="26" height="24" rx="4"/><rect class="fk" x="70" y="40" width="26" height="24" rx="4"/><rect class="fa" x="100" y="40" width="26" height="24" rx="4"/><polygon class="fk" points="77,22 89,22 83,33"/><path class="st" d="M140 52H160M155 47L160 52L155 57"/><rect class="st" x="168" y="30" width="62" height="44" rx="10" stroke-dasharray="4 4"/><circle class="fa" cx="188" cy="52" r="7"/><circle class="fa" cx="210" cy="52" r="7"/>
```

The whole technique fits in a few lines, and its order matters. At each item the function asks the set whether the item is already there, and only then adds it. That order is what makes the answer mean "appeared earlier": at the moment of the question, the set holds exactly the items read before this one.

```code solution "first_repeat: ask, then remember"
```

````warn
Adding the item to `seen` before asking about it. Then the item you just added is in `seen`, the question is answered yes every time, and the function returns the first item of any non-empty list. On `[4, 9, 2, 7, 9, 5]` it returns 4, not 9, in both languages.

```code mistake "The two lines, swapped"
```
````

## The three promises {#cost toc="Three promises"}

```caption
Every module keeps three promises, and each exists to make you the second cook.
```

```vig "Three stacked cards, each with a tick: a pan opened up, a price tag with a reason beside it, and a pair of hands"
<rect class="fa" x="16" y="12" width="150" height="26" rx="6"/><circle class="fg" cx="190" cy="25" r="9"/><path class="st" d="M185 25L189 29L195 21"/><rect class="fa" x="16" y="44" width="150" height="26" rx="6"/><circle class="fg" cx="190" cy="57" r="9"/><path class="st" d="M185 57L189 61L195 53"/><rect class="fa" x="16" y="76" width="150" height="26" rx="6"/><circle class="fg" cx="190" cy="89" r="9"/><path class="st" d="M185 89L189 93L195 85"/>
```

A cook who understands the pan has been shown the pan before being handed a dish, has been told why as well as how long, and has cooked the dish with their own hands. The course keeps those three promises in every module.

```rosetta "The three promises"
The promise | What it means for you
Mechanics before use | You see how each structure works, how it sits in memory and what happens step by step in each operation, before any problem asks you to use it. Nothing is a black box.
Costs come with reasons | You are never given a complexity table to memorise. Every O(·) claim arrives with the argument that produces it, so you can rebuild it, and tell when it stops holding.
You implement everything | Each structure is built from scratch in Python and in TypeScript. Using a `dict` or a `Map` is fine in a problem, but only after you have built the thing once and know what you are leaning on.
```

The second promise is the one to test. Here is a cost from this lesson with its reason attached. To find the first repeat, you could skip the set and compare every item with every item before it. Both versions below were run on lists of distinct items, the worst case, because a list with no repeat makes each version do all of its work. The chart is what the runs counted.

```widget "Work done to find the first repeat: nested loops against a set"
<div class="chart" id="cmp"></div><p class="cost-note" id="costNote"></p>
```


The reason for the gap is in the shape of the loops. The item at position i is compared with the i items before it, so the comparisons add up as 0 + 1 + 2 + … + (n − 1), which is n(n − 1) ÷ 2. The set version asks one question per item. It can ask it in one step because a set does not look through what it holds: it works out from the item itself where that item would be stored, and looks only there. The Hash Tables module builds exactly that, so you will see the argument rather than take it on trust. The price is memory: at the end of a list with no repeat, the set holds every item.

```derivation
**Nested loops: n(n − 1) ÷ 2 comparisons, so O(n²) time.** The item at position i is compared with the i before it, and 0 + 1 + … + (n − 1) is n(n − 1) ÷ 2. They keep nothing, so they use O(1) extra space.

**Set: n membership checks, so O(n) time and O(n) space.** One question per item, each answered without reading the rest of the set, and every item may end up stored.
```

## What the course asks of you {#attempt toc="What it asks"}

```caption
Three things from you, and the size of the road ahead.
```

```vig "A path winding through five milestone flags toward a lit doorway"
<path class="st" d="M14 90C50 90 50 60 86 60S124 86 160 70S200 40 226 40" stroke-dasharray="4 4"/><polygon class="fa" points="30,70 44,76 30,82"/><polygon class="fa" points="76,40 90,46 76,52"/><polygon class="fa" points="122,66 136,72 122,78"/><polygon class="fa" points="164,48 178,54 164,60"/><polygon class="fk" points="204,20 218,26 204,32"/>
```

The course asks for three things, and none of them is cleverness.

- **You can already program.** Variables, loops, conditionals, functions and basic objects in at least one language are assumed. This course teaches data structures and algorithms, not programming.
- **You attempt before you read.** Problem lessons are built solve-first: the statement, then your attempt, then hints one at a time, then the solution. The struggle before the reveal is where the learning happens, and a solution you only read is mostly one you forget.
- **You answer the quizzes honestly.** They exist to catch the gap between "that sounded reasonable" and "I can produce this myself". Nobody else sees your answers, so the only person you could fool is you.

The road is laid out below, stage by stage. The next lesson shows how a lesson is put together and what each interactive block is for.

```widget "The road: modules per stage"
<div class="stages" id="stages"></div>
```

## Where next {#next}

```vig "A signpost with three arrows pointing along three paths"
<path class="st" d="M120 100V24"/><rect class="fa" x="68" y="22" width="104" height="14" rx="4"/><rect class="fa" x="76" y="42" width="96" height="14" rx="4"/><rect class="fk" x="68" y="62" width="104" height="14" rx="4"/>
```

```variants
[
  {
    "title": "How Lessons & Problems Work",
    "source": "next lesson",
    "text": "The two kinds of lesson, the demonstration and the cook-off, and a live tour of each interactive block you will meet: code in both languages, complexity summaries, reveals, predict questions and quizzes."
  },
  {
    "title": "Big O & Complexity Analysis",
    "source": "next module in this stage",
    "text": "The cost argument you just saw in miniature, done properly: counting the work a loop does, why n(n - 1) ÷ 2 is quadratic, and how to read a cost off code without memorising a table."
  },
  {
    "title": "Hash Tables",
    "source": "Linear Structures stage",
    "text": "The structure behind the set in first_repeat. You build one from scratch and see why asking whether it holds an item does not mean looking at everything it holds, and what breaks that."
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
      "question": "Why does one <code>first_repeat</code> answer the numbers, the letters and the words alike?",
      "options": [
        "It asks only whether items are equal and whether one is in the set, which numbers, letters and words all answer.",
        "It converts every item to a number first, so the set only ever stores numbers and the three problems become one.",
        "It looks the problem up by its title, and the three titles are close enough for one shelf card to match each of them."
      ],
      "answer": 0,
      "explanation": "The function never asks what the items are, only the two questions equality and membership, and anything that can be compared and stored in a set answers both. That is what makes a technique transfer. The shelf is the other thing entirely: it matches an exact title, which is why it answered one problem of the three."
    },
    {
      "question": "What does the set buy over comparing each item with every item before it?",
      "options": [
        "It remembers what was read, so each item costs one check instead of a re-scan of the items before it.",
        "It uses less memory than the nested loops, because a set stores each distinct item once and the loops store nothing at all.",
        "It finds the repeat in fewer comparisons only when the repeat comes early; on a list with no repeat the two do the same work."
      ],
      "answer": 0,
      "explanation": "The nested loops re-read the past for every item: n(n - 1) ÷ 2 comparisons on a list with no repeat. The set remembers it and answers in one check per item. The memory claim is backwards, since the set is the version that spends memory, up to every item, and the loops spend none. And the gap is widest exactly when there is no repeat, not narrowest."
    },
    {
      "question": "<code>first_repeat_swapped</code> adds each item to <code>seen</code> before checking whether it is in <code>seen</code>. What does it return for <code>[4, 9, 2, 7, 9, 5]</code>?",
      "options": [
        "9, because the swap only changes how fast the check runs and never which item it finds first.",
        "None, because every item is in the set when it is checked, which the function reports as no repeat.",
        "4: the first item is already in the set by the time it is checked, so the function returns at once."
      ],
      "answer": 2,
      "explanation": "Add, then ask: the item just added is always found, so the very first item returns immediately, on any non-empty list and in both languages. It does not return None, because a found item returns the item, and it does not return 9, because it never reaches the second 9."
    }
  ]
}
```
