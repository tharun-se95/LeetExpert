# Residue rings in the kit

Status: implemented for #141 (blocks #83, part of #14)

## 1. Problem

`math-for-dsa/modular-arithmetic` argues about **where a number lands on a clock of m positions**, and no kit
player draws a ring. Lanes are rows and columns, the grid is rectangular, the graph lane places nodes by tree
layout, and the cost plot (#79) is two numeric axes. What the lesson needs (audited 2026-10-18 from the lesson
file):

| Section | Needs |
|---|---|
| The rotating book carousel | the app's `mod-clock` (m = 5, values 8 and −7): both land on slot 3, after a different number of whole turns |
| The backward-spin trap | `-7 % 5` is 3 in Python and −2 in JavaScript; the fix `((a % m) + m) % m` |
| Wrap-around indexing | `nxt = (i + 1) % m` stepping off the end to 0; `prv` from 0, where JavaScript's bare `%` gives −1 |
| Hashing previews | keys reduced to buckets by `key mod size`, two keys sharing a bucket, a negative key |

So the shape is: **a ring of m named cells; named tokens that walk a number of cells forward or backward from where
they stand, counting the whole turns they make; the cell each lands on; and, where the lesson's point is the
operator, both languages' `%` side by side, each the runtime's own answer.**

## 2. Decision: a ring view on the step player

`kit/rings.js` + `rings.css` is a **view for `StepPlayer`** (the contract at the top of `player.js`), as
`plots.js` is, so the chrome, clock, captions, fields line, invariants, tabs and reduced motion are the shared
ones. It is not a lane kind: a lane is slots in a row, and the point here is that the last slot is next to the
first. It is not a plot: there is no axis, and a value's position is an angle.

**Text is HTML, never SVG text.** The SVG (cells, trails, tokens) is drawn at its real pixel size from the host's
width; cell names and token names are positioned HTML over it, each on a solid patch of its surface, as the plot's
labels are. The readout (one row per token: marker, name, where it landed and how) is an HTML list beside the
ring, or under it below 640px.

`RingPlayer` and `mountRingTabs` live in the same file: unlike the plot there is no static use, so there is no
page that would ship the ring without the player.

### Why not the alternatives

- *The app's `mod-clock` diagram*: a React component in the app, drawn once with no steps; the kit is plain script
  concatenated into one page scope (the plot spec rejected sharing `BigOObservatory` for the same reason).
- *A lane with wrap-around arrows*: draws the ring as a row with a return arrow, which is the picture the lesson
  replaces. Whole turns cannot be counted on it.

## 3. The model

`new RingTrace({m, name, cells, tokens, langs})`: `m` cells (2 to 24, so a cell's name fits), named `0 … m−1`
unless `cells` names them; `name` is what a cell is called in the readout and the accessible name ("slot",
"bucket"). A token is `{id, name, tone}`; at most six, each with its own ink, marker shape and trail dash, so none
rests on colour. `langs: true` adds both languages' `%` to every token's readout row.

Operations recorded into steps:

- `put(id, at)` stands a token at the whole number `at` (any sign) without walking; `null` removes it.
- `walk(id, by)` moves it `by` cells from where it stands, forward (clockwise) when `by > 0`. The trail of the
  walk stays drawn until the token is put or walked again.
- `count(name, value)` a counter on the fields line.

A token's position is the integer it has reached, not the cell: the cell is derived. For a position `a` on a ring of
`m`: the **cell** it lands on is the floored remainder `a − m·⌊a/m⌋`, always in `[0, m)`, and the **turns** are
`⌊a/m⌋`, so `a = turns · m + cell` (8 = 1 × 5 + 3, −7 = −2 × 5 + 3). The readout says that sentence. With `langs`,
it also says what each language's `%` returns for `a % m`: Python floors (the cell), JavaScript truncates, so a
negative `a` gives a negative remainder, which is not a cell, and the row says so.

## 4. Seek safety and correctness

`ringWalk(T, o)` replays the steps on a model and records a snapshot after each; `ringRead` reads a snapshot back
(which tokens stand where, their trails, every readout row as text, the counters) and `ringSame` throws when it
disagrees with `ringState`, the pure function of the first k steps written separately. The kit test does the same
on random traces read in random order against a reference written in the test, as it does for plots.

**Each language's answer is that language's own.** JavaScript's is computed on the page with `%`, which is the
runtime. Python's cannot be run on the page; it is computed as Python defines `%` (floor division), and the kit
test runs `python3` on every `a % m` the specimen shows and on a grid of signed operands, failing if any differs.
A lesson that shows a Python answer holds it to real Python in its own `check.py`.

Invariant every ring shows (`RG_INV`): every token lands on exactly one cell, `0 ≤ cell < m` and
`a = turns · m + cell`, checked with arithmetic the model does not use (`((a % m) + m) % m`). A walkthrough may add
claims of its own (`o.inv`).

## 5. Drawing, accessibility and motion

Cell 0 is at the top and positive steps go clockwise, as a clock. A token stands on a track outside the ring at its
cell's angle; the cell it lands on takes the token's ink as a tint and an outline. A walk's trail is drawn outside
the track and moves outward one lane per whole turn, so the turns can be counted on the picture: 8 on a 5-ring is one
full lap and three more cells. Between steps a walking token glides through every cell it passes; a walk of more
than three turns glides through three and the readout carries the true count. Under reduced motion every step is its
settled picture.

The stage's accessible name describes the snapshot: the ring and its size, then each token's position, whole turns
and landing cell, and with `langs` both languages' answers.

## 6. Where the code goes

- `kit/rings.js` + `rings.css`: `RingTrace`, `ringWalk`, `ringState`, `ringRead`, `ringSame`, `rgFloorMod`,
  `RingView`, `RingPlayer`, `mountRingTabs`, `RG_INV`.
- `build.py`: `rings` is optional (deps `player`), shipped when a lesson names `new RingTrace(`, `ringWalk(`,
  `RingPlayer(` or `mountRingTabs(`; section icon `rings`.
- The kit-players specimen gains a "Residue rings" section with three tabs, every number computed by running the
  operator: 8 and −7 on a 5-ring (both languages), wrap-around indexing on a ring buffer of 5, and hash buckets on
  a 7-ring with a collision and a negative key. The kit test runs Python on every Python answer they show.

## 7. What it does not do

- **Modular multiplication or exponentiation as pictures.** The identities are prose and formula lines in the
  lesson; a walk is addition.
- **More than 24 cells.** A hash table of 1,000 buckets is a lane (the tables player), not a ring.
