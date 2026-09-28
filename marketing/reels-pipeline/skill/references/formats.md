# Instagram formats for leetExpert

Platform specs change. Treat the numbers below as working defaults and check current
Instagram guidance when a detail matters (e.g. hashtag limits, max carousel length).

## Specs (working defaults)

| Format | Size | Notes |
|---|---|---|
| Feed image / carousel | 1080×1350 (4:5 portrait) | Portrait takes the most feed space. Keep all slides the same ratio. |
| Reel / Story | 1080×1920 (9:16) | Keep text out of the top ~250px and bottom ~350px, where the UI overlays. |
| Caption | up to 2,200 characters | Only the first ~125 characters show before "more"; the hook goes there. |
| Hashtags | 3–5 focused tags | Specific beats broad. Put them at the end of the caption. |

## Carousel template (5–10 slides)

1. **Hook slide.** One line of tension, big type. Optional small leetExpert wordmark.
2. **Setup.** The problem or snippet in one screen.
3–N. **One idea per slide.** Code in a monospace font, ≤ ~12 lines, with the line that
   matters highlighted. Use arrows and pointer labels for traces.
N+1. **Takeaway.** The cue → pattern → target → trap summary in four short lines.
Last. **CTA.** "Save this for your next interview" / "Try it in your browser: link in bio."

Code on slides: prefer Python by default (most readable), and offer a JS version in the
caption or a follow-up slide when the post compares languages. Use descriptive variable
names; no single-letter soup except i/j/lo/hi/l/r in pointer patterns, where they're
idiomatic.

## "Would you ship this?" template

1. Hook: "An AI wrote this. It passes the sample test. Would you ship it?"
2. The prompt it was given (one line).
3. The code (clean-looking, plausible).
4. "Look closer…" with a hint (a specific input, or "what's the cost?").
5. Reveal: the exact failing case or the real complexity, highlighted.
6. The fix, with its complexity.
7. The judgment lesson in one sentence.
8. CTA: "leetExpert's coach names the case that broke. Link in bio."

The flaw must be real and verified by running it. Good flaw types: nested scan hiding in
`in list` or `.index()`, off-by-one in window bounds, empty/single-element input, integer
vs float division, mutating a list while iterating, recursion without memoization,
unsorted input assumed sorted.

## Reel script template (15–45 s)

```
0–2s   HOOK (on-screen text + first line of VO)
2–8s   SETUP (show the problem / snippet)
8–30s  PAYOFF (the trace, the reveal, or the feature demo)
last 3–5s  TAKEAWAY + CTA
```

For each beat give: on-screen text, voiceover line, and what's on screen (screen
recording of which leetExpert feature, animation, or code). Include burned-in captions;
many people watch muted.

## Single image / story

One claim, one visual. Good for "Cost check" comparisons, cheatsheet cards, streak
nudges, and polls ("Which is faster? A / B") in stories.

## Caption template

```
[Hook restated or extended, first ~125 chars]

[2–4 short lines: the key idea, in plain words]

[Question to drive comments, e.g. "What input breaks it? Answer below."]

[CTA: save / share / link in bio + which module to open]

[3–5 hashtags]
```

## Hashtag pool

Pick 3–5 that fit the specific post; don't paste the same block every time.

- Topic: #datastructures #algorithms #dsa #bigonotation #dynamicprogramming #recursion #graphs
- Audience: #codinginterview #softwareengineer #learntocode #computerscience #csstudent
- Language: #python #javascript
- Theme: #aicoding #codereview

## Alt text

Describe what's shown and the key content, not the design. For code: "Python function
two_sum using a hash map; the line `seen[x] = i` is highlighted." For traces: summarize
the state change.
