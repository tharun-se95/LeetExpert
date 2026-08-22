---
title: The Four Hash Patterns
type: concept
---

## One cabinet, four daily chores

The mailroom clerk's cabinet isn't just for filing and finding packages —
the same setup solves a handful of everyday chores that show up
constantly in problems. Nearly every hash-table problem is really just
the clerk running one of four routines. Naming them turns "somehow use a
dict" into a decision you can make in ten seconds — and the five problems
ahead are one or two of these verbs each.

```diagram
{
  "id": "hash-patterns"
}
```

## 1. Seen — membership

Chore one: the guest list. You want to know if you've already seen a
particular visitor today. Instead of walking around asking everyone, the
clerk writes a visitor's name on a tag the moment they arrive and files
it in the cabinet. Next time that name comes up, the clerk runs the
word-trick, checks that slot, and instantly knows whether they've been
here before — no asking around required.

The set as a memory: *have I encountered this before?*

````tabs
```python
def has_duplicate(nums: list[int]) -> bool:
    seen = set()
    for x in nums:
        if x in seen:
            return True
        seen.add(x)
    return False
```

```typescript
function hasDuplicate(nums: number[]): boolean {
  const seen = new Set<number>();
  for (const x of nums) {
    if (seen.has(x)) return true;
    seen.add(x);
  }
  return false;
}
```
````

The general shape: a scan that would need to re-search its own past
instead *records* its past. O(n²) re-scanning becomes O(n) remembering.

## 2. Count — frequency

Chore two: the ballot tally. You want to count how many votes each
candidate received. The clerk files a single card for each candidate in
their designated slot; every time a new vote comes in, they jump
straight to that slot and add a tick mark.

The map as a tally: key → how many times. Module 5's 26-slot count array,
generalized to any hashable key with no alphabet contract:

````tabs
```python
from collections import Counter, defaultdict

counts = Counter(words)              # idiomatic
counts2: dict[str, int] = defaultdict(int)
for w in words:
    counts2[w] += 1                  # explicit
```

```typescript
const counts = new Map<string, number>();
for (const w of words) {
  counts.set(w, (counts.get(w) ?? 0) + 1);
}
```
````

## 3. Index — value → location

Chore three: the coat check. Normally a coat-check ticket tells you where
your coat is by its number. But imagine the reverse problem: someone
loses their ticket and asks "where's my yellow coat?" Instead of walking
past hundreds of hanging coats, the clerk keeps a card filed under
"Yellow Coat" that lists the exact hanger number it's on.

The map as a reverse array: value → where it lives. An array answers
index → value in O(1); the index map answers the opposite direction in
O(1), at O(n) build cost. Two Sum runs on this verb, with a twist you'll
find yourself.

## 4. Group — key → bucket of members

Chore four: the sorting office. You have a pile of packages and want to
group them by destination city. The clerk runs the word-trick on the
city name ("Boston") to find a slot, and throws every package bound for
Boston onto that slot's hook.

The map as a sorting office: compute a **canonical key** for each item;
items sharing a key land in the same list.

````tabs
```python
from collections import defaultdict

def group_by_length(words: list[str]) -> list[list[str]]:
    groups: dict[int, list[str]] = defaultdict(list)
    for w in words:
        groups[len(w)].append(w)     # canonical key: length
    return list(groups.values())
```

```typescript
function groupByLength(words: string[]): string[][] {
  const groups = new Map<number, string[]>();
  for (const w of words) {
    const key = w.length; // canonical key: length
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(w);
  }
  return [...groups.values()];
}
```
````

The entire art is choosing the key so that *"same key" means exactly
"belongs together."* Group Anagrams will make you design one.

## Choosing in the wild

| The problem says… | Verb | Structure |
| --- | --- | --- |
| "contains", "appeared before", "distinct" | Seen | set |
| "how many times", "most/least frequent" | Count | map → int |
| "find the pair/partner", "at index" | Index | map → position |
| "group", "bucket", "same X together" | Group | map → list |

Two cautions. First, the clerk can only run the word-trick on a label
that doesn't change — file a package under "Blue Box" and then repaint
it "Red Box" while it sits in the cabinet, and the clerk has no way to
know to look for it under "Red." That's why keys must be
**hashable/immutable** — in Python, `list` can't key a dict but `tuple`
can; in JS, object keys in a `Map` compare by *reference*, so use string
keys for by-value grouping (build a canonical string). Second, the
mailroom cabinet is unbeatable for "find this one package fast," but
useless for "give me every package in alphabetical order" — for that
you'd need a completely different kind of organizer, one that keeps
items on a branching, ordered shelf instead of unordered slots. The hash
map's O(1) is *average, unordered* — if you need sorted keys or range
queries, you want a tree (Module 18), and knowing the difference is part
of knowing hash tables.

```quiz
{
  "questions": [
    {
      "question": "\"Return the first element that appears exactly once\" — which verb(s)?",
      "options": [
        "Count (map → int), then a second pass over the ORIGINAL sequence asking counts[x] == 1",
        "Seen (set) — membership alone can determine when a character has appeared before, and the first character never previously seen in a forward scan is exactly the one that appears once",
        "Group — bucketing characters by which other characters co-occur near them would let you read off, group by group, exactly which one is unique and appears earliest"
      ],
      "answer": 0,
      "explanation": "'Exactly once' is a frequency fact — a set can't distinguish once from thrice. And 'first' forces the re-scan in input order, since map iteration order is not the answer's order."
    },
    {
      "question": "In JavaScript you want to group points {x, y} by coordinates-as-value. Why does `map.get({x: 1, y: 2})` fail, and what's the fix?",
      "options": [
        "Map compares object keys by reference — two structurally-equal literals are different keys; canonicalize to a string like `${x},${y}` so equality is by value",
        "Objects can't be Map keys at all — the Map API only accepts primitive values like strings, numbers, and symbols as keys, rejecting any object literal passed directly",
        "You must use WeakMap — WeakMap performs structural comparison on its keys instead of Map's reference comparison, so switching container types alone would make coordinate-based lookups work"
      ],
      "answer": 0,
      "explanation": "Hash structures need key EQUALITY to match your intent. JS object identity is reference identity, so by-value grouping requires a by-value key — the canonical-string trick. (Python solves it with tuples, which hash by content.)"
    },
    {
      "question": "For the Group pattern, what is the actual design decision that determines whether the grouping is correct?",
      "options": [
        "Choosing a canonical key such that \"same key\" means exactly \"belongs together\" — get this wrong and unrelated items share a group, or related items scatter across groups",
        "Choosing a table size large enough that the load factor never crosses 0.75, since a resize mid-grouping would scramble which items are already grouped together",
        "Choosing a hash function fast enough to process every item in O(1) total time, since the grouping's correctness depends entirely on the hashing step finishing quickly"
      ],
      "answer": 0,
      "explanation": "Group's mechanics (map[key].append(value)) are trivial; the actual work is picking a key function where key equality captures exactly the intended notion of \"belongs together\" — e.g. sorted letters for anagrams, not the raw string itself."
    }
  ]
}
```
