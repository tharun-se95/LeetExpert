---
title: Matching & Nesting
type: concept
---

## Nesting is stack-shaped, provably

`([{}])` is well-nested; `([)]` is not. What distinguishes them? In
well-nested text, **every closer closes the most recently opened thing**.
That phrase — *most recently* — is LIFO verbatim, which is why the stack
is not merely *a* way to check nesting but the canonical one:

> Scan left to right. Opener ⇒ push it (an obligation). Closer ⇒ it must
> match the stack's top obligation — pop on match, fail on mismatch.
> Well-nested ⇔ the scan never fails and ends with an empty stack.

```diagram
{
  "id": "call-stack-frames",
  "title": "scanning ([])",
  "frames": [
    { "label": "(", "detail": "obligation" },
    { "label": "[", "detail": "top · match next ]" }
  ],
  "caption": "opener pushes · matching closer pops"
}
```


The three failure modes fall out mechanically, and enumerating them is
what makes implementations correct rather than lucky:

1. **Wrong closer** — top is `(` but you read `]` → mismatch (`([)]`).
2. **Closer with nothing open** — pop on empty (`())`... the last `)`).
3. **Leftover obligations** — scan ends, stack non-empty (`((`).

The Valid Parentheses problem asks you to turn exactly this into code;
its quiz will ask which failure mode each broken input triggers.

## The same shape in the wild

The opener/obligation framing generalizes far past brackets — push an
obligation when a context opens, pop when it closes, and the stack top
is always "the context I'm inside right now":

- **Parsers and compilers** — every `{` block, XML/HTML tag, or indent
  level is an obligation; your editor's "highlight matching bracket" is
  running this scan continuously.
- **Directory traversal** — `cd` into a folder pushes, `cd ..` pops;
  paths like `a/b/../c` simplify with a stack (Simplify Path problem).
- **Backspace processing** — a backspace "closes" the previous
  character: `ab#c` → stack ends `["a","c"]`.
- **Nested function evaluation** — the deepest call finishes first;
  expression evaluation (next lessons) rides entirely on this.

The recognition cue: the input has **paired open/close events**, or
edits that **cancel the most recent item**. Either phrase should make
your hand reach for a stack before your brain finishes the sentence.

## Worked micro-example: string with cancellations

Remove adjacent duplicate pairs repeatedly: `"abbaca"` → remove `bb` →
`"aaca"` → remove `aa` → `"ca"`. The naive re-scan-after-each-removal is
O(n²); the stack sees it in one pass:

````tabs
```python
def remove_adjacent_dupes(s: str) -> str:
    stack: list[str] = []
    for ch in s:
        if stack and stack[-1] == ch:
            stack.pop()              # ch cancels the most recent survivor
        else:
            stack.append(ch)
    return "".join(stack)            # builder pattern, Module 5
```

```typescript
function removeAdjacentDupes(s: string): string {
  const stack: string[] = [];
  for (const ch of s) {
    if (stack.length > 0 && stack[stack.length - 1] === ch) {
      stack.pop(); // ch cancels the most recent survivor
    } else {
      stack.push(ch);
    }
  }
  return stack.join(""); // builder pattern, Module 5
}
```
````

Why one pass suffices when removals *cascade* (`abba`: removing `bb`
exposes `aa`): the stack top after a pop is exactly the character that
became adjacent — the cascade is *automatic*, no re-scan. The stack's
survivors are always "the processed prefix after all cancellations," an
invariant that makes the O(n) bound and the correctness one argument.

```complexity
{
  "time": "O(n)",
  "space": "O(n)",
  "why": "Each character is pushed at most once and popped at most once — the pop-budget accounting from Big O's amortized lesson. Cascading removals cost nothing extra; they're just pops already paid for."
}
```

That push-once/pop-once accounting is worth tattooing somewhere: it's
the exact argument that will make the monotonic stack (next lesson)
O(n) despite its nested-looking while loop.

```quiz
{
  "questions": [
    {
      "question": "Why does a stack — rather than counters — correctly validate multi-type brackets like ([{}])?",
      "options": [
        "Counters would be O(n²) — maintaining a separate running count for each bracket type requires re-scanning the counts on every character to check they're still consistent with each other, which is what makes it slow",
        "Stacks handle longer inputs — a stack's dynamic resizing lets it validate strings well beyond what a fixed set of counters could track before running into overflow, which is the real advantage here",
        "Counters check only that opens equal closes per type; they'd accept ([)] where counts balance but ORDER is wrong. The stack enforces that each closer matches the MOST RECENT open obligation"
      ],
      "answer": 2,
      "explanation": "One counter per bracket type passes `([)]` — every count is fine. Nesting is an ordering property, and LIFO is the ordering. (For a SINGLE bracket type, a counter that must never go negative genuinely suffices — knowing why both facts are true is the real understanding.)"
    },
    {
      "question": "In remove_adjacent_dupes(\"abba\"), how does the cascade (bb removal exposing aa) happen without any re-scan?",
      "options": [
        "It doesn't — 'abba' needs two passes; the first pass removes the inner 'bb' and a second, separate scan over the shortened string is required to notice and remove the newly-adjacent 'aa'",
        "The function calls itself recursively on the result — after processing the string once, it feeds its own output back into another call, and this recursive re-application is what catches cascades like 'aa'",
        "After popping b, the stack top is the first a — precisely the character now adjacent to the incoming second a; the very next comparison handles it"
      ],
      "answer": 2,
      "explanation": "The stack top IS the current end of the surviving prefix, so newly-exposed adjacencies are always the next comparison. Trace: push a, push b, b cancels b, then a cancels a — empty. One pass, cascade included."
    },
    {
      "question": "Which input triggers the 'pop on empty' failure mode of bracket matching?",
      "options": [
        "\"(])\"",
        "\"(()\"",
        "\"())\""
      ],
      "answer": 2,
      "explanation": "The third character of \"())\" is a closer arriving when the stack is already empty — nothing is open to close. \"(()\" fails the OTHER way (leftover obligation at end), and \"(])\" is a wrong-closer mismatch. Naming which mode an input hits is how you test your own implementation."
    }
  ]
}
```
