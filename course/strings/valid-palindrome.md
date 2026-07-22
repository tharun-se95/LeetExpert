---
title: Valid Palindrome
type: problem
---

## Problem

A phrase is a palindrome if, after converting to lowercase and removing
all non-alphanumeric characters, it reads the same forward and backward.
Given `s`, return whether it is a palindrome.

**Examples**

```text
"A man, a plan, a canal: Panama"  →  true   ("amanaplanacanalpanama")
"race a car"                      →  false  ("raceacar")
" "                               →  true   (empty after cleaning)
```

**Constraints:** 1 ≤ n ≤ 2·10⁵ · printable ASCII · follow-up: O(1)
auxiliary space.

## Attempt it first

The easy version (clean the string, compare with its reverse) is worth 60
seconds. The real target is the follow-up: no cleaned copy at all.

````reveal Hint 1 — the O(n)-space version, for grounding
Filter alphanumerics, lowercase, compare against the reversal. One line in
either language. Its space cost is the cleaned copy — what the follow-up
bans.
````

````reveal Hint 2 — filter on the fly
Converging pointers from the toolkit lesson — but when a pointer lands on
punctuation or a space, it just steps past it. Only when BOTH pointers
rest on alphanumerics do you compare. What's the invariant?
````

## Brute force, for contrast

Clean + reverse + compare: O(n) time, O(n) space — completely fine as a
first answer, and saying so out loud ("I'll start with the allocation
version, then remove the allocation") is good interview craft. The
follow-up version below removes the copy without touching the time class.

## The insight

> "Ignore some characters" doesn't require *building the ignored-free
> string* — pointers can skip non-qualifying positions as they converge.
> Filtering becomes movement logic instead of allocation.

## Solution

`````reveal Solution — converging pointers with skips
````tabs
```python
def is_palindrome(s: str) -> bool:
    left, right = 0, len(s) - 1
    while left < right:
        while left < right and not s[left].isalnum():
            left += 1
        while left < right and not s[right].isalnum():
            right -= 1
        if s[left].lower() != s[right].lower():
            return False
        left += 1
        right -= 1
    return True
```

```typescript
function isPalindrome(s: string): boolean {
  const isAlnum = (c: string) => /[a-z0-9]/i.test(c);
  let left = 0,
    right = s.length - 1;
  while (left < right) {
    while (left < right && !isAlnum(s[left])) left++;
    while (left < right && !isAlnum(s[right])) right--;
    if (s[left].toLowerCase() !== s[right].toLowerCase()) return false;
    left++;
    right--;
  }
  return true;
}
```
````

Invariant: *all alphanumeric pairs strictly outside [left, right] have
already matched.* The inner skip-loops preserve it trivially (skipped
characters aren't part of any pair); the comparison either extends it or
correctly returns false. The `left < right` guards inside the skip loops
matter — without them, an all-punctuation string would run the pointers
past each other.

```complexity
{
  "time": "O(n)",
  "space": "O(1)",
  "why": "Each pointer moves monotonically inward — every index is visited at most once by either pointer, skips included. Two indexes of state; no cleaned copy."
}
```
`````

## Variants

- **Valid Palindrome II** (may delete at most one character): on the first
  mismatch, branch — skip left OR skip right — and check the remainder
  plainly. A first taste of controlled backtracking.
- **Palindromic substrings / longest palindromic substring:** the
  expand-from-center family — Two Pointers module.

```quiz
{
  "question": "Why do the inner skip-loops need their own `left < right` guards?",
  "options": [
    "On inputs like \",,,,\" a skip loop without the guard would march its pointer past the other and out of bounds; with guards the loops halt at the crossing point and the outer loop exits cleanly (vacuously a palindrome)",
    "They don't — the outer while already checks it; since left < right is evaluated once per outer iteration, that single check already bounds every step the inner skip loops could take",
    "Performance — fewer comparisons; adding the guard lets the skip loops exit a few iterations earlier on average, trading a small amount of correctness risk for speed on typical inputs"
  ],
  "answer": 0,
  "explanation": "The outer check happens once per outer iteration, but a skip loop can advance MANY steps within one iteration. Boundary discipline inside nested loops is exactly the kind of detail invariant-thinking catches."
}
```
