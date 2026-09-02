---
title: Strings in Memory & Immutability
type: concept
---

## A string is an array with a lock on it

Recall the train of coupled cars from the Arrays module — a string is
that exact same train, one character per car, except now every car is
welded shut. You can walk up to car `i` and look inside (`s[i]` is a
perfectly ordinary O(1) read), but you can never swap out what's in it.
Under the hood, a string is an array of character units — contiguous,
O(1)-indexable, scannable with everything you learned in the Arrays
module. One property changes the game: in both course languages, strings
are **immutable**. You can read `s[i]`; you cannot assign to it. Every
"modification" — `replace`, `upper`, concatenation — allocates a **new
string** and copies: not a weld cut open, but an entirely new train
built car-by-car to match what you asked for.

Why language designers lock strings: safe sharing (many variables can
point at one string with no defensive copies), hashability (a dict/Map key
must never change under the table — the Hash Tables module depends on
this), and interning optimizations. The price is that *mutation-shaped
code costs allocation-shaped money*.

## The classic trap: concatenation in a loop

````tabs
```python
def join_bad(words: list[str]) -> str:
    result = ""
    for w in words:
        result += w          # allocates a NEW string of len(result) + len(w)
    return result

def join_good(words: list[str]) -> str:
    parts = []               # list of pieces — a dynamic array
    for w in words:
        parts.append(w)      # O(1) amortized
    return "".join(parts)    # one O(total) concatenation at the end
```

```typescript
function joinBad(words: string[]): string {
  let result = "";
  for (const w of words) {
    result += w; // allocates a NEW string of result.length + w.length
  }
  return result;
}

function joinGood(words: string[]): string {
  const parts: string[] = []; // array of pieces
  for (const w of words) {
    parts.push(w); // O(1) amortized
  }
  return parts.join(""); // one O(total) concatenation at the end
}
```
````

```diagram
{
  "id": "string-builder-cost",
  "count": 4
}
```

Trace it on four single-character words — `["a", "b", "c", "d"]` — and
count every character copy `join_bad` performs:

| Step | Operation | Copies this step | Running total |
| --- | --- | --- | --- |
| 1 | `result = "" + "a"` | 1 (write `"a"`) | 1 |
| 2 | `result = "a" + "b"` | 2 (`"a"` then `"b"`) | 3 |
| 3 | `result = "ab" + "c"` | 3 (`"ab"` then `"c"`) | 6 |
| 4 | `result = "abc" + "d"` | 4 (`"abc"` then `"d"`) | 10 |

Ten copies to join four one-character words — `join_bad` welds together
a brand-new, slightly-longer train from scratch on every single word,
re-building every car it already had. `join_good` never copies a
character while appending — `parts.append(w)` stores a reference to `w`,
not its characters, at O(1) amortized each. The only character-copying
happens once, at the very end: `"".join(parts)` allocates a string of the
full length (4) and copies each word's characters into it exactly once —
4 copies total, against `join_bad`'s 10, and the gap only widens as n
grows. For n words of length L, `join_bad` re-copies the accumulated
prefix on every step: L + 2L + ⋯ + nL = L · n(n+1)/2 character copies —
the triangular sum again, **O(n² · L)**. `join_good` is the dynamic array
from Module 4 wearing a disguise: append references (O(1) amortized), pay
the character-copy cost exactly once, **O(n · L)**. This "builder"
pattern is the string module's single most important habit.

*Honesty note:* CPython and V8 both special-case `+=` on strings when the
reference is private, often making it effectively linear in practice. Rely
on that and your code's cost depends on interpreter internals and can
degrade back to O(n²) (e.g., prepending, or holding another reference).
The builder is the version whose cost you can *prove*.

```complexity
{
  "operations": [
    { "name": "read s[i], len(s)", "time": "O(1)", "why": "array indexing; length is stored" },
    { "name": "s + t", "time": "O(|s| + |t|)", "why": "allocate and copy both — immutability forbids extending in place" },
    { "name": "slice s[i:j]", "time": "O(j − i)", "why": "copies the range into a new string" },
    { "name": "s == t", "time": "O(min(|s|, |t|))", "why": "character-by-character until mismatch (after a length check)" },
    { "name": "build from n pieces via join", "time": "O(total length)", "why": "sum piece lengths, allocate once, copy each piece once" }
  ]
}
```

## Working mutably: the char-array detour

When an algorithm genuinely wants in-place surgery (reversal, two-pointer
swaps), convert once, work in the mutable array, convert back:

````tabs
```python
def reverse_string(s: str) -> str:
    chars = list(s)                      # O(n) once
    left, right = 0, len(chars) - 1
    while left < right:                  # converging pointers — Module 4
        chars[left], chars[right] = chars[right], chars[left]
        left, right = left + 1, right - 1
    return "".join(chars)                # O(n) once
```

```typescript
function reverseString(s: string): string {
  const chars = s.split(""); // O(n) once
  let left = 0,
    right = chars.length - 1;
  while (left < right) {
    // converging pointers — Module 4
    [chars[left], chars[right]] = [chars[right], chars[left]];
    left++;
    right--;
  }
  return chars.join(""); // O(n) once
}
```
````

Three sequential phases, each O(n): convert to array, mutate in place,
convert back. O(n) + O(n) + O(n) = O(n) — sequence adds, it doesn't
multiply, so bracketing an O(n) algorithm with two O(n) conversions is
still O(n) overall. (When a problem hands you `chars: list[str]` /
`string[]` directly, skip the conversions and you have true O(1)
auxiliary space.)

## The encoding footnote that occasionally bites

"Character" is fuzzier than it looks. JS strings are sequences of UTF-16
code units: `"🚀".length === 2`, and `s[i]` can land mid-emoji. Python 3
strings are sequences of code points: `len("🚀") == 1`. For this course's
problems (ASCII inputs, stated in constraints) the distinction is
invisible — but when constraints say "lowercase English letters," that's
the promise that makes `s[i]`-based logic and 26-slot count arrays (next
lesson) safe.

```quiz
{
  "questions": [
    {
      "question": "Why is `result += word` in a loop O(n²) in principle, when append to a list is O(1) amortized?",
      "options": [
        "Immutability forces each += to copy the ENTIRE accumulated string into a fresh allocation — copies sum to 1+2+⋯+n; a list append writes one slot into over-allocated capacity",
        "String concatenation has a hidden log factor — the runtime has to search for a large enough contiguous memory block to hold the growing result, and that search scales logarithmically with length",
        "It isn't — they're the same; both += on a string and append on a list write into pre-allocated capacity, so their amortized per-operation cost is identical"
      ],
      "answer": 0,
      "explanation": "The dynamic array's amortization needs spare capacity to write into. Immutable strings have none, so the prefix is re-copied every iteration — the triangular sum again."
    },
    {
      "question": "s == t on two million-character strings that differ at position 3 costs…",
      "options": [
        "O(n log n) — the comparison first hashes both strings to check for a quick-match shortcut, and computing a reliable hash over long input takes log-linear time",
        "O(1)-ish — comparison stops at the first mismatch (position 3)",
        "O(n) — the whole strings are compared, because equality checks always scan to the very end to confirm there isn't a later difference even after finding an early one"
      ],
      "answer": 1,
      "explanation": "Equality scans until it can decide: first mismatch, or exhaustion. Worst case O(n) (equal strings), best case constant. Knowing WHICH case your data hits is Big O lesson 5 in action."
    },
    {
      "question": "Why must dict/Map keys be immutable (the reason strings qualify)?",
      "options": [
        "The structure files a key by its hash at insert time; if the key later mutated, its hash would change and lookups would search the wrong place",
        "It's a style convention — language designers simply chose to disallow mutable dict/Map keys as a matter of API taste, not because of any underlying correctness requirement",
        "Mutable objects are larger — the extra bookkeeping a mutable type needs to support in-place changes takes up more memory than a hash table's key-storage slots can accommodate"
      ],
      "answer": 0,
      "explanation": "Hash structures locate entries BY key content. A key that changes after filing becomes unfindable — so hashable types must promise immutability. Full story in Module 6."
    }
  ]
}
```
