---
title: Writing & Running Code
type: concept
---

## The workspace, not just prose

Concept lessons are read. Problem lessons open something different: a
workspace with the lesson's description, explanation, solution, and quiz on
one side, and a live code editor on the other. Starter code is already
there — the function signature and a one-line statement of what to return —
so you're never staring at a blank file wondering how to begin.

Nothing installs. There's no local Python or Node setup, no repository to
clone. The editor and the thing that runs your code both live in the
browser tab you're already in.

## Picking a language

Every problem ships starter code in **both** Python and TypeScript. A
toggle switches which one the editor shows. Your code in each language is
kept separately and saved as you type — switch languages to compare, and
whichever one you were mid-solution on is still there when you switch back
or come back tomorrow. Nothing is sent anywhere; it's saved in your
browser, same as your quiz answers and progress.

## Running your code

Hit **Run**. Your solution executes against a set of test cases for that
problem — not just the one example from the description, but the edge
cases the lesson calls out (empty input, duplicates, the boundary the
constraints mention).

The first time you run Python in a session, there's a short pause while
the browser downloads an in-browser Python runtime (about 10 MB) —
one-time cost, cached after that. TypeScript starts instantly; the browser
already knows how to run it.

Results land in three tabs:

- **Tests** — pass/fail per case, "X of Y passed." Failing cases show what
  your code returned next to what was expected, so you're debugging a
  concrete mismatch, not guessing.
- **Console** — whatever your code printed (`print()` in Python,
  `console.log()` in TypeScript). Useful for checking an intermediate value
  without instrumenting the test cases themselves.
- **Insight** — the complexity target for this problem next to what your
  solution actually did on the last run, plus a small trace of the
  variables that mattered. It's there so "did I actually hit O(n)?" has an
  answer that isn't a guess.

## When you're stuck

A **Coach** panel reads your failing test cases and offers a diagnosis —
which case broke, and a nudge toward why, before you burn hints on
something a closer look at the failure would have told you. You can also
ask it a direct question if the diagnosis alone doesn't clarify things.

This is a supplement to the hints described in the previous lesson, not a
replacement for attempting the problem yourself first — the Coach reacts to
code you already wrote, it doesn't write it for you.

## Starting over

If a solution goes sideways, **Reset** restores the starter code for the
language you're on. Your other language's draft is untouched.

```quiz
{
  "question": "You've been working in Python on a problem, then switch the language toggle to TypeScript to compare approaches. What happens to your Python draft?",
  "options": [
    "It's discarded — only one language's code is kept at a time",
    "It's saved and still there if you switch back to Python",
    "It's submitted automatically as your final answer before switching"
  ],
  "answer": 1,
  "explanation": "Drafts are kept per language and saved as you type. Switching languages doesn't discard or submit anything — both drafts persist independently."
}
```

Next: the full shape of the course — five stages, twenty-four modules, and
the order they build on each other.
