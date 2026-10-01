# Light post: valid parentheses

- **Account:** leetexpert
- **Look:** Light post (#149: one post in each of four new looks)
- **Format:** single image, 1080×1350
- **Media:** `slide1.png`
- **Build:** `marketing/reels-pipeline/looks/` (`facts.py`, `facts.mjs`, `looks.py`), rendered by `marketing/reels-pipeline/carousel/render.mjs`

## Hook

Every closer must match the last opener.

## Caption

Valid parentheses is one rule: every closer must match the LAST opener. 📌 Save this.

That "last" is why it's a stack. Openers go on top; a closer checks the top and pops it.

([{}]) → the stack grows to ([{ and unwinds to empty ✓
([)] → ) arrives while [ is on top ✗ (both brackets are "closed", in the wrong order)

And don't forget the end: "(" never meets a wrong closer, but the stack isn't empty, so it's invalid too.

Your turn: is "{[]}" valid? Trace the stack 👇

leetExpert, the interactive DSA course. Link in bio.

## Hashtags

#validparentheses #stack #python #leetcode #codinginterview

## Alt text

A light card on pale grey paper headed "Stacks · valid parentheses": every closer must match the last opener. The string ([{}]) is drawn one bracket at a time, each with the stack under it: after ( the stack holds (; after [ the stack holds ([; after { the stack holds ([{; after } the stack holds ([; after ] the stack holds (; after ) the stack holds nothing; it ends empty, marked valid. The string ([)] pushes ( and [, then ) arrives while [ is on top, marked invalid: ) needs ( on top. The rule underneath: opener, push; closer, the top must be its partner, so pop; valid only if the stack ends empty.

## Verified facts

- Traces come from `facts.py` / `facts.mjs`, which also run the lesson's reference solution (`web/tests/reference/stacks/valid-parentheses.{py,js}`) on all 8 sandbox cases of `courses/dsa/stacks/valid-parentheses.md`, and the trace on each; both runtimes agree.
- `([{}])` is valid and `([)]` is invalid by the reference in both languages. `(` is invalid (a lesson case: "the stack isn't empty"). The challenge `{[]}` is valid by the same reference.
