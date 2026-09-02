---
title: Character Arithmetic & Count Arrays
type: concept
---

## Characters as numbers

Every string algorithm eventually touches character codes — a computer
stores letters as numbers, and these functions move between the two. The
bridge functions:

````tabs
```python
ord("a")             # 97 — character to code point
chr(98)               # "b" — code point to character
ord("c") - ord("a")   # 2 — letter's alphabet position
```

```typescript
"a".charCodeAt(0); // 97 — character to code unit
String.fromCharCode(98); // "b"
"c".charCodeAt(0) - "a".charCodeAt(0); // 2 — alphabet position
```
````

Because `a`–`z` sit on one unbroken run of consecutive codes, subtracting
`ord("a")` from any lowercase letter's code gives that letter's position in
the alphabet, starting at 0 — that's what makes `ord(ch) - ord("a")` a safe
array index.

## The count array

The payoff is the **count array**: when constraints promise "lowercase
English letters," 26 integer slots replace a whole hash map — smaller,
faster, and O(1)-iterable, since 26 never grows with the input:

````tabs
```python
def letter_counts(s: str) -> list[int]:
    counts = [0] * 26
    for ch in s:
        counts[ord(ch) - ord("a")] += 1
    return counts
```

```typescript
function letterCounts(s: string): number[] {
  const counts = new Array(26).fill(0);
  const a = "a".charCodeAt(0);
  for (const ch of s) {
    counts[ch.charCodeAt(0) - a]++;
  }
  return counts;
}
```
````

```viz
{
  "id": "frequency-count",
  "s": "letters",
  "speed": 500
}
```

Trace it on `s = "cab"`, starting from `counts = [0, 0, 0, ..., 0]` (26
zeros):

| Step | Character | Offset | Slot updated | `counts` (a, b, c, …) |
| --- | --- | --- | --- | --- |
| 1 | `'c'` | `ord('c') - ord('a')` = 99 − 97 = 2 | index 2 | `[0, 0, 1, 0, …]` |
| 2 | `'a'` | `ord('a') - ord('a')` = 97 − 97 = 0 | index 0 | `[1, 0, 1, 0, …]` |
| 3 | `'b'` | `ord('b') - ord('a')` = 98 − 97 = 1 | index 1 | `[1, 1, 1, 0, …]` |

Three characters, three O(1) index computations, done — the final array
says "one a, one b, one c," regardless of what order they arrived in.

## Why a count array beats a hash map here

The lesson isn't "arrays are always faster" — it's that a hash map is
paying for generality this problem doesn't need, in three concrete ways:

1. **Allocation.** A hash map dynamically allocates buckets, resizes
   them as entries grow, and handles collisions (Hash Tables module). A
   count array is one fixed block of 26 slots, sized once.
2. **Per-operation cost.** A hash map insert computes a hash function
   before it can even find a bucket. A count array "insert" is one
   subtraction (`ord(ch) - ord("a")`) and one array write — no hashing
   step exists to pay for.
3. **Iteration.** Iterating a hash map visits however many *distinct*
   keys are present — that count can grow with the input. Iterating a
   count array always visits exactly 26 slots, no matter how long the
   input string is. Because 26 is a fixed constant, that iteration is
   O(1), not O(number of distinct characters).

A count array is a **frequency fingerprint**: if two strings produce
identical counts, they contain exactly the same letters the same number of
times each — which is exactly what it means for one to be a rearrangement
of the other, and rearranging can't change those counts either way. So
matching fingerprints isn't just a good sign, it's a complete test. The
Valid Anagram problem is this observation and nothing more; the Hash Tables
module generalizes it to unrestricted alphabets, where a fixed 26-slot
array stops being practical.

```quiz
{
  "question": "When is a 26-slot count array the right replacement for a hash map of character counts?",
  "options": [
    "When the constraints guarantee a small fixed alphabet (e.g. lowercase English letters) — the guarantee is what makes index = ord(ch) − ord('a') safe and complete",
    "Always — it's strictly better; a fixed 26-slot array beats a hash map on every input regardless of the actual character set, since arrays are inherently faster than maps",
    "Only for strings shorter than 26 characters — once the input has more characters than there are slots, some letters would need to share a slot and the counts would collide"
  ],
  "answer": 0,
  "explanation": "The count array trades generality for constant size and direct indexing — it only works because the alphabet is guaranteed small, which is what makes matching counts a complete test for anagrams. Unicode input would need 100k+ slots — that's when the hash map (Hash Tables module) earns its place. Constraints are the contract."
}
```

Next: the string's own standard-library methods — what they actually
cost, and the two-pointer idioms that recur across string problems.
