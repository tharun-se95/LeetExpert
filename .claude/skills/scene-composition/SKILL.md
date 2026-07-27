---
name: scene-composition
description: Use when turning a narration script into actual on-screen scenes for a motion graphic, explainer video, or Remotion composition in this project — decides what visual (UI panel, icon, metaphor, timeline, diagram) represents each idea instead of displaying the sentence as a caption. Trigger whenever building or revising anything under video/, whenever text is about to become an on-screen caption, and whenever the user asks for visual metaphors, premium UI-style scenes, "less text," or a cleaner/more cinematic look.
---

# Scene Composition

## Why this exists

Once you've found the real idea behind a line (see `creative-unlock`), you
still have to decide what actually goes in the frame. The default instinct is
to put the sentence on screen. This skill is the alternative toolkit: a set of
visual building blocks and a translation habit so scenes explain themselves
through motion and imagery first, words second.

## Core rule

**Do not display the sentence. Visualize the point.**

Bad (most of the time):
> Script: "Creators waste hours trying to organize their editing workflow."
> On screen: the sentence, as text.

Better:
> Show a messy timeline, scattered files, floating warning icons — then wipe
> into a clean, organized dashboard with a subtle glow.
> On-screen text, if any: `MESSY WORKFLOW → CLEAN SYSTEM`

The sentence is what the narrator says. The scene is what the *viewer sees*
that makes the sentence's point land without having to read it.

## The translation habit

For each beat, ask: **"What is this line really saying, visually?"** Then
build the scene that represents that idea, using whichever of these fits:

- clean UI elements (panels, cards, toggles, badges)
- minimal keywords, not sentences
- visual metaphors
- icons
- timeline animations
- workflow / pipeline diagrams
- floating cards
- before/after comparisons
- software-style panels
- cinematic overlays
- subtle motion accents (grain, glow, parallax, drift)

### Worked mapping (adapt this logic, don't copy these examples literally)

| The line is about... | Show... |
|---|---|
| Speed | Fast-moving UI cards, compressed timelines, progress bars, time-saved counters |
| Confusion / waste | Scattered panels, overlapping windows, blurred labels, chaotic movement |
| Clarity / the insight | Everything snapping into alignment, fog clearing, a clean panel appearing, one highlighted path |
| Growth / improvement | Rising graphs, blocks stacking upward, a dashboard leveling up |
| An automated / systematic process | Clean flow diagrams, connected glowing nodes, cards moving through stations — not literal robots or mascots |

The pattern generalizes: find the *shape* of the idea (fast, chaotic, aligning,
climbing, flowing) and build a scene with that shape, in this project's own
domain (data structures and algorithms) rather than borrowing someone else's
literal example.

## Text usage

Text should be rare and load-bearing. When you do use it, keep it to:

- 1-4 word labels
- short callouts
- simple contrast phrases (`MESSY → CLEAN`, `O(n²) → O(n)`)
- clean section titles
- UI-style tags, button labels, timeline markers

Avoid:

- full script sentences on screen (only pull out the one phrase worth
  emphasizing, if any)
- paragraph-style overlays
- stacking multiple labels in one frame
- a caption for every single sentence the narrator says
- text that competes with the voiceover for the viewer's attention — if
  they're listening and reading dense text at the same time, neither lands

## Creative freedom, inside a style

You have permission to choose the graphics, simplify ideas, invent metaphors,
build premium UI-style scenes, and restructure a scene's composition when the
literal version is weak. That freedom operates inside one consistent visual
system, so the piece feels directed rather than improvised per scene:

- dark, cinematic background (never flat/plain black — give it depth: a
  subtle grid, soft vignette, faint particles, or a slow ambient drift)
- glass/frosted UI panels (soft translucency, subtle border, soft shadow) —
  not flat filled rectangles
- one confident gradient accent used for highlights and glows (this project's
  existing dark theme uses blue; a warm amber/orange gradient reads as more
  premium and cinematic against near-black and is worth using deliberately
  for glows, progress states, and emphasis — pick one direction per video and
  stay consistent within it rather than mixing accent colors scene to scene)
- off-white (not pure white) text for anything that isn't an accent
- generous, premium spacing — nothing crammed to the edges
- smooth motion with real easing (ease-out settles, slight overshoot on
  arrivals, momentum on exits) — never a linear/robotic move
- no clutter — one clear focal point per scene, always

## Final direction

The script provides the meaning. The scene provides the visual explanation.
Show the concept — don't repeat the words, unless the content is genuinely a
list or a term that must be read exactly (a formula, a specific number, a
named pattern). When in doubt, cut the caption and strengthen the visual
instead.
