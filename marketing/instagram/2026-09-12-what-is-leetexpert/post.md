# What leetExpert is

- **Archetype:** product introduction (new archetype, added on user instruction 2026-09-12)
- **Source:** `web/src/lib/course/manifest.ts`, `courses/dsa/**`, verified by
  `sources/verify-counts.py`
- **Family:** none — product post, monochrome house style
- **Format:** 4-slide carousel, 2160×2700 (4:5 at 2×)

## Hook (first line — all most people read)

The code on the page runs. Not a screenshot of a solution — an editor, in the lesson, in Python or TypeScript.

## Caption

The code on the page runs. Not a screenshot of a solution — an editor, inside the lesson, in
Python or in TypeScript, that you edit and execute without leaving the page.

leetExpert is an interactive DSA course. Here is what is actually in it.

**24 modules, in five stages, in order.** Foundations (3) → Linear Structures (6) → Techniques
on Linear Data (6) → Recursive & Hierarchical (5) → Global Reasoning (4). Nothing is introduced
before the thing it depends on, which is why Big O is stage 0 rather than an appendix. Most
DSA material is a list of problems; the ordering is the part that makes it a course.

**220 lessons: 83 concepts, 116 problems, 21 practice sets.** Every one of the 116 problem
lessons ships a sandbox with starter code in both Python and TypeScript, run in the browser
against real test cases — not one language with the other promised later.

**27 animated tracers and 61 diagrams.** Deliberately not a graphic on every page. A picture
appears where it shows something the prose cannot — a pointer moving, a window sliding, a call
stack unwinding — and nowhere else.

**Solutions stay hidden until you ask.** Reading an answer you never attempted teaches nothing.

It is free while it is in early access, with no account wall in front of the curriculum. It is
still being finished, in the open.

leetexpert.com

## Hashtags

#datastructuresandalgorithms #codinginterview #leetcode #algorithms #learntocode
#programming #python #typescript #softwareengineering

## Alt text

1. Dark navy slide, heading "THE CODE ON THE PAGE RUNS", showing a code editor with Python and
   TypeScript tabs and a correct binary search implementation.
2. Dark navy slide, heading "24 MODULES. FIVE STAGES. IN ORDER.", with five rows of small
   outlined squares — 3, 6, 6, 5 and 4 — labelled Foundations, Linear Structures, Techniques,
   Recursive & Tree, and Global Reasoning. One square is one module.
3. Dark navy slide, heading "WHAT 220 LESSONS ACTUALLY CONTAIN", listing 116 runnable problems,
   27 animated tracers and 61 diagrams, and solutions that stay hidden.
4. Dark navy slide with the word "Free" set large, explaining that all 24 modules and 220
   lessons are open during early access, with the address leetexpert.com in a white chip.

## CTA

leetexpert.com — once, on slide 4 and at the end of the caption.

## Verification

Every figure on these slides is computed from the repo by `sources/verify-counts.py`, which
exits non-zero if any claim stops being true. Transcript: `sources/verification-transcript.txt`.

    modules 24 · stages 5 (3/6/6/5/4) · 220 lesson files
    83 concepts + 116 problems + 21 practice = 220
    sandbox blocks 116 == problem lessons 116
    viz tracers 27 · diagrams 61
    all 7 claim checks PASS

Also checked:

- **"No account wall" is true, not assumed.** `web/` has no middleware, no auth dependency in
  `package.json`, and no sign-in route. There is no authentication in the app at all.
- **Earlier drafts of this post were wrong and were corrected.** A first pass claimed "84
  concept lessons, 117 problems" — `grep -c` had counted the `function concept(` /
  `function problem(` declarations themselves. A first pass also claimed every lesson has an
  animated tracer; only 27 of 220 do. Slide 3 was rewritten around the real numbers.
- The code on slide 1 is the **correct** binary search (`lo = mid + 1`), deliberately — unlike
  the previous post, which showed the buggy variant. Ligatures are disabled so `<=` and `==`
  stay literal.
- Claims deliberately avoided: no student counts, no testimonials, no "free forever", no
  comparison to a named competitor.

## Reproduce

```
cd sources && node render.mjs
python3 sources/verify-counts.py     # from the repo root
```
