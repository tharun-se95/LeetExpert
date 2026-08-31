---
title: Evaluate Reverse Polish Notation
type: problem
---

## Problem

Evaluate an arithmetic expression in **Reverse Polish Notation** (RPN,
postfix): operators come *after* their operands. Tokens are integers or
`+ - * /`; division **truncates toward zero**. The input is always a
valid expression.

**Examples**

```examples
["2","1","+","3","*"]      →  9     ((2 + 1) * 3)
["4","13","5","/","+"]     →  6     (4 + (13 / 5))
["10","6","9","3","+","-11","*","/","*","17","+","5","+"]  →  22
```

```constraint
1 ≤ tokens ≤ 10⁴ · intermediate values fit in 32 bits.
```

## Attempt it first

RPN looks alien until you see what it removes: parentheses. The order
of operations is *encoded in the token order itself* — which is exactly
why compilers convert your infix code to this form. The evaluation rule
is one sentence; find it by evaluating `2 1 + 3 *` by hand.


```sandbox
{
  "id": "evaluate-rpn",
  "fn": { "python": "eval_rpn", "javascript": "evalRPN" },
  "check": "return",
  "starter": {
    "python": "def eval_rpn(tokens):\n    # Return the integer result.\n    pass\n",
    "javascript": "function evalRPN(tokens) {\n  // Return the integer result.\n}\n"
  },
  "cases": [
    { "args": [["2","1","+","3","*"]], "expect": 9 },
    { "args": [["4","13","5","/","+"]], "expect": 6 },
    { "args": [["3","-4","+"]], "expect": -1 },
    { "args": [["10","6","9","3","+","-11","*","/","*","17","+","5","+"]], "expect": 22 }
  ]
}
```
````reveal Hint — what does an operator apply to?
An operator acts on the two most recent values that haven't been
consumed yet. "Most recent unconsumed" — the module's phrase. Numbers
push; operators pop twice, compute, push the result.
````

## Brute force, for contrast

Repeatedly find the leftmost operator, apply it to the two numbers
before it, splice the result back into the token list: correct, but
each splice is O(n) and there are O(n) operators — O(n²), the
front-insertion accidental-quadratic in costume. The stack version
never rescans or splices.

## The insight

> RPN's guarantee is that when an operator arrives, its two operands are
> the two most recently produced values — top two of a stack, by
> definition. Each token is handled once, in order, with no
> parenthesis-tracking state at all: the stack IS the pending
> sub-results.

## Solution

`````reveal Solution — operand stack
````tabs
```python
def eval_rpn(tokens: list[str]) -> int:
    stack: list[int] = []
    ops = {
        "+": lambda a, b: a + b,
        "-": lambda a, b: a - b,
        "*": lambda a, b: a * b,
        "/": lambda a, b: int(a / b),   # truncate toward zero — NOT a // b
    }
    for tok in tokens:
        if tok in ops:
            b = stack.pop()             # second operand pops FIRST
            a = stack.pop()
            stack.append(ops[tok](a, b))
        else:
            stack.append(int(tok))
    return stack[0]                     # valid input ⇒ exactly one value
```

```typescript
function evalRPN(tokens: string[]): number {
  const stack: number[] = [];
  for (const tok of tokens) {
    if (tok === "+" || tok === "-" || tok === "*" || tok === "/") {
      const b = stack.pop()!; // second operand pops FIRST
      const a = stack.pop()!;
      const result =
        tok === "+" ? a + b
        : tok === "-" ? a - b
        : tok === "*" ? a * b
        : Math.trunc(a / b); // truncate toward zero — NOT Math.floor
      stack.push(result);
    } else {
      stack.push(Number(tok));
    }
  }
  return stack[0]; // valid input ⇒ exactly one value
}
```
````

Two landmines, both in the details:

- **Operand order.** The first pop is the SECOND operand: in
  `"6 2 /"`, 2 was pushed last, so `b=2, a=6`, compute `a/b = 3`.
  Swapping them passes every `+`/`*` test and fails `-`/`/` — write a
  subtraction test first.
- **Truncation toward zero.** `-13 / 5` must give −2, not −3. Python's
  `//` floors (−3 — wrong here), so use `int(a / b)`; JS needs
  `Math.trunc`, not `Math.floor`. Module 3's division-convention
  warnings, now with a test case attached.

```complexity
{
  "time": "O(n)",
  "space": "O(n)",
  "why": "One pass; each token pushed/popped at most once. Stack depth peaks at the expression's operand backlog — worst case ~n/2 (all numbers first)."
}
```
`````

## Variants

- **Basic Calculator I/II** (infix, with parentheses): the same operand
  stack plus an operator stack — or convert to RPN first (the
  shunting-yard algorithm) and reuse THIS function verbatim.
- **Expression trees:** an RPN sequence is a post-order traversal of
  the expression tree — when Stage 3 reaches post-order, this problem
  is why it'll feel familiar.

```quiz
{
  "question": "Why does popping the operands in the wrong order survive + and * but break - and /?",
  "options": [
    "Addition and multiplication are commutative (a∘b = b∘a), so the swap is invisible; subtraction and division are not — '6 2 /' becomes 2/6 instead of 6/2",
    "Because division truncates — the toward-zero truncation rule absorbs the operand-order mistake in a way multiplication's exact result can't, which is why only two of the four operators end up affected",
    "It doesn't — all four break; every operator depends on knowing which operand came first, so swapping pop order produces a wrong result across addition, subtraction, multiplication, and division alike"
  ],
  "answer": 0,
  "explanation": "The bug is masked by an algebraic property of half the operators — the nastiest kind of bug, because plus-heavy tests all pass. Choosing test inputs that BREAK symmetry (subtraction, division, non-equal operands) is the testing discipline this problem teaches."
}
```
