---
title: The Four Hash Patterns
type: concept
---

## One structure, four verbs

Nearly every hash-table problem uses the map/set in one of four ways.
Naming them turns "somehow use a dict" into a decision you can make in
ten seconds — and the five problems ahead are one or two of these verbs
each.

## 1. Seen — membership

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

The map as a reverse array: value → where it lives. An array answers
index → value in O(1); the index map answers the opposite direction in
O(1), at O(n) build cost. Two Sum runs on this verb, with a twist you'll
find yourself.

## 4. Group — key → bucket of members

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

Two cautions. First, keys must be **hashable/immutable** — in Python,
`list` can't key a dict but `tuple` can; in JS, object keys in a `Map`
compare by *reference*, so use string keys for by-value grouping (build a
canonical string). Second, the hash map's O(1) is *average, unordered* —
if you need sorted keys or range queries, you want a tree (Module 18),
and knowing the difference is part of knowing hash tables.

```quiz
{
  "questions": [
    {
      "question": "\"Return the first element that appears exactly once\" — which verb(s)?",
      "options": [
        "Seen (set)",
        "Count (map → int), then a second pass over the ORIGINAL sequence asking counts[x] == 1",
        "Group"
      ],
      "answer": 1,
      "explanation": "'Exactly once' is a frequency fact — a set can't distinguish once from thrice. And 'first' forces the re-scan in input order, since map iteration order is not the answer's order."
    },
    {
      "question": "In JavaScript you want to group points {x, y} by coordinates-as-value. Why does `map.get({x: 1, y: 2})` fail, and what's the fix?",
      "options": [
        "Objects can't be Map keys at all",
        "Map compares object keys by reference — two structurally-equal literals are different keys; canonicalize to a string like `${x},${y}` so equality is by value",
        "You must use WeakMap"
      ],
      "answer": 1,
      "explanation": "Hash structures need key EQUALITY to match your intent. JS object identity is reference identity, so by-value grouping requires a by-value key — the canonical-string trick. (Python solves it with tuples, which hash by content.)"
    }
  ]
}
```
