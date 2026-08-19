---
title: Reverse Words in a String
type: problem
---

## Problem

Given a string `s`, return its **words in reverse order**, joined by
single spaces. `s` may contain leading, trailing, or repeated spaces; the
output must contain none of those.

**Examples**

```examples
"the sky is blue"      →  "blue is sky the"
"  hello world  "      →  "world hello"
"a good   example"     →  "example good a"
```

```constraint
1 ≤ n ≤ 10⁴ · letters, digits, spaces · at least one word · follow-up: O(1) auxiliary space if given a mutable char array.
```

## Attempt it first

The pipeline version should take you two minutes with the toolkit lesson.
Then think hard about the follow-up — it has a genuinely pretty trick, and
you've already met its main ingredient in Rotate Array.


```sandbox
{
  "id": "reverse-words",
  "fn": { "python": "reverse_words", "javascript": "reverseWords" },
  "check": "return",
  "starter": {
    "python": "def reverse_words(s):\n    # Return the words in reverse order, single-spaced.\n    pass\n",
    "javascript": "function reverseWords(s) {\n  // Return the words in reverse order, single-spaced.\n}\n"
  },
  "cases": [
    { "args": ["the sky is blue"], "expect": "blue is sky the" },
    { "args": ["  hello world  "], "expect": "world hello" },
    { "args": ["a good   example"], "expect": "example good a" },
    { "args": ["single"], "expect": "single" }
  ]
}
```
````reveal Hint 1 — the pipeline
split (handling space runs) → reverse the word list → join with single
spaces. Mind the Python/JS split asymmetry from the toolkit lesson.
````

````reveal Hint 2 — the O(1)-space idea (char array version)
Rotate Array taught: reversal rearranges BLOCKS while flipping their
internal order — and a second, smaller reversal repairs the inside.
Words are blocks. Reverse the entire array, then…?
````

## Brute force, for contrast

There's no quadratic trap here if you use the builder pattern — but there
is if you build the answer with `result = word + " " + result` style
prepending: that re-copies the accumulator per word, the O(n²)
concatenation trap from the memory lesson wearing word-sized boots.

```diagram
{
  "id": "word-pipeline",
  "s": "the sky is blue"
}
```

## The insight

> Reversing the whole string puts words in the right ORDER with wrong
> SPELLING; re-reversing each word individually fixes the spelling without
> disturbing the order. Reverse-of-reverse composes into exactly the
> transformation asked for — the Rotate Array decomposition, reused.

## Solution

`````reveal Solution — pipeline (interview default)
````tabs
```python
def reverse_words(s: str) -> str:
    return " ".join(reversed(s.split()))
    # split() with no args: splits on whitespace runs, drops empties —
    # the cleanup requirements dissolve into the split
```

```typescript
function reverseWords(s: string): string {
  return s
    .split(/\s+/)
    .filter((w) => w.length > 0) // guard the possible leading empty token
    .reverse()
    .join(" ");
}
```
````

```complexity
{
  "time": "O(n)",
  "space": "O(n)",
  "why": "Each pipeline stage is one linear pass with one allocation. With immutable strings this space bound is forced — O(1) requires the char-array variant."
}
```
`````

`````reveal Follow-up — O(1) space on a char array
Three steps, each in place: (1) reverse the entire array — words now in
reversed order, each internally backwards; (2) reverse each word in place —
spelling repaired; (3) compact the spaces with a write pointer (Module 4's
template: copy words forward, emitting exactly one space between them).

````tabs
```python
def reverse_words_in_place(chars: list[str]) -> None:
    def rev(l: int, r: int) -> None:
        while l < r:
            chars[l], chars[r] = chars[r], chars[l]
            l, r = l + 1, r - 1

    rev(0, len(chars) - 1)              # 1) whole array

    start = 0
    for i in range(len(chars) + 1):     # 2) each word (sentinel at end)
        if i == len(chars) or chars[i] == " ":
            rev(start, i - 1)
            start = i + 1

    # 3) compact spaces: write pointer, one space between words
    write = 0
    read = 0
    n = len(chars)
    while read < n:
        while read < n and chars[read] == " ":
            read += 1                   # skip space runs
        if read < n and write > 0:
            chars[write] = " "          # single separator
            write += 1
        while read < n and chars[read] != " ":
            chars[write] = chars[read]
            write += 1
            read += 1
    del chars[write:]                   # trim tail
```

```typescript
function reverseWordsInPlace(chars: string[]): void {
  const rev = (l: number, r: number): void => {
    while (l < r) {
      [chars[l], chars[r]] = [chars[r], chars[l]];
      l++;
      r--;
    }
  };

  rev(0, chars.length - 1); // 1) whole array

  let start = 0;
  for (let i = 0; i <= chars.length; i++) {
    // 2) each word (sentinel)
    if (i === chars.length || chars[i] === " ") {
      rev(start, i - 1);
      start = i + 1;
    }
  }

  // 3) compact spaces: write pointer, one space between words
  let write = 0,
    read = 0;
  const n = chars.length;
  while (read < n) {
    while (read < n && chars[read] === " ") read++; // skip space runs
    if (read < n && write > 0) chars[write++] = " "; // single separator
    while (read < n && chars[read] !== " ") chars[write++] = chars[read++];
  }
  chars.length = write; // trim tail
}
```
````

```complexity
{
  "time": "O(n)",
  "space": "O(1)",
  "why": "Three sequential linear passes (add, don't multiply); all writes go into the input array. Every technique is a Module 4 alumnus: converging reversal ×2, then write-pointer compaction."
}
```
`````

## Variants

- **Reverse Words III** (reverse each word, keep order): just step 2.
- **Rotate Array**: the origin of the reverse-the-blocks trick — worth
  re-deriving both directions to cement it.

```quiz
{
  "question": "In the in-place version, why does reversing the whole array and then each word produce reversed WORD ORDER with correct spelling?",
  "options": [
    "Because words are all the same length — with uniform word sizes, reversing the whole array happens to permute characters in a way that lines up word order and spelling correctly at once",
    "Coincidence of the test cases — the given examples happen to produce readable output, but the technique isn't actually guaranteed to preserve spelling on strings with different word-length patterns",
    "Global reversal maps the k-th word from the end to the k-th position from the start (right order) while flipping its letters; per-word reversal is its own inverse on exactly those letters, restoring spelling without moving the word"
  ],
  "answer": 2,
  "explanation": "Reversal reverses block order AND block interiors; a second, block-local reversal cancels only the interior damage. Composing two reversals to isolate the effect you want is the same algebra as Rotate Array's three-reversal solution."
}
```
