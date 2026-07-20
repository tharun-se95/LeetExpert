---
title: Valid Parentheses
type: problem
---

## Problem

Given a string of only `()[]{}`, return whether it is **valid**: every
opener closed by the matching closer type, in the correct nesting order.

**Examples**

```text
"()"      →  true          "()[]{}"  →  true
"(]"      →  false         "([)]"    →  false
"([{}])"  →  true          "("       →  false
```

**Constraints:** 1 ≤ n ≤ 10⁴ · only the six bracket characters.

## Attempt it first

The matching lesson gave you the algorithm in prose and the three
failure modes by name. Your job is a clean translation — and hitting all
three failure modes with your own test inputs before running anything.

````reveal Hint — the mapping trick
Store closer → opener in a map: on a closer c, valid iff the stack is
non-empty AND its top equals map[c]. One comparison covers failure
modes 1 and 2; the end-of-scan emptiness check covers mode 3.
````

## Brute force, for contrast

Repeatedly delete any adjacent matched pair (`()`, `[]`, `{}`) until
nothing changes; valid iff empty remains. Correct — and O(n²): each
deletion pass is O(n) and up to n/2 passes happen (`((((...))))`). The
stack does all cascades in one pass, exactly like the cancellation scan
in the matching lesson.

## Solution

`````reveal Solution — obligation stack
````tabs
```python
def is_valid(s: str) -> bool:
    pairs = {")": "(", "]": "[", "}": "{"}     # closer -> required opener
    stack: list[str] = []
    for ch in s:
        if ch in pairs:                        # a closer
            if not stack or stack[-1] != pairs[ch]:
                return False                   # empty-pop OR wrong closer
            stack.pop()
        else:                                  # an opener
            stack.append(ch)
    return not stack                           # leftovers ⇒ invalid
```

```typescript
function isValid(s: string): boolean {
  const pairs: Record<string, string> = { ")": "(", "]": "[", "}": "{" };
  const stack: string[] = [];
  for (const ch of s) {
    if (ch in pairs) {
      // a closer
      if (stack.length === 0 || stack[stack.length - 1] !== pairs[ch]) {
        return false; // empty-pop OR wrong closer
      }
      stack.pop();
    } else {
      // an opener
      stack.push(ch);
    }
  }
  return stack.length === 0; // leftovers ⇒ invalid
}
```
````

Test against the failure modes: `"([)]"` — reading `)`, top is `[` ≠
`(` → mode 1 ✓. `"())"` — final `)` finds an empty stack → mode 2 ✓.
`"("` — scan ends, stack holds `(` → mode 3, caught by the last line ✓.
An implementation that passes all three named modes is correct by
construction; one that merely passes sample tests is correct by luck.

```complexity
{
  "time": "O(n)",
  "space": "O(n)",
  "why": "One pass, O(1) per character. Worst-case stack: all openers ('((((' → n deep). The early-return on failure makes many invalid inputs cheaper."
}
```
`````

## Variants

- **Single bracket type:** a counter that must never dip negative and
  must end at zero — the stack degenerates because there's nothing to
  mismatch. (The matching lesson's quiz explained why counters fail for
  multiple types.)
- **Minimum Remove to Make Valid / Longest Valid Parentheses:** the
  stack holds INDICES so you can locate the offenders — same machine,
  richer payload.
- **Score of Parentheses:** the stack accumulates values per nesting
  level — matching as a computational frame, which is the next
  problem's whole idea.

```quiz
{
  "question": "Why is `stack and stack[-1] == pairs[ch]` a COMPLETE validity check for a closer — what do its two halves rule out?",
  "options": [
    "It's incomplete — type counts must also be checked at the end",
    "Non-empty rules out a closer-with-nothing-open (mode 2); top-equality rules out closing the wrong obligation (mode 1). Mode 3 can't be checked mid-scan — it's the final emptiness test, and together the three checks are exhaustive",
    "The two halves are redundant — either alone suffices"
  ],
  "answer": 1,
  "explanation": "Each failure mode maps to exactly one check, and the three modes partition every way validity can break (wrong match now, no match now, unmatched later). That's what makes the implementation an ARGUMENT, not a hope — no count check needed, since matched pops already balance counts."
}
```
