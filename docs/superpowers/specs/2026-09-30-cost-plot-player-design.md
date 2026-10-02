# Cost plots in the kit

Status: implemented for #79 (part of #14)

## 1. Problem

The Foundations lessons argue about **how a cost grows with n**, and nothing in the kit can draw that. The lane,
list, grid, heap, graph, call-tree, interval and trie players all draw a structure; none has an x axis that is a
number, a y axis that is a count, or a curve. What each lesson needs (audited 2026-09-30 from the lesson files):

| Lesson | Needs |
|---|---|
| big-o/why-efficiency-matters | pairs (n²) against one pass (n), measured; "growth beats hardware": an ops budget that rises 100×, and how far along n each curve gets under it |
| big-o/big-o-notation | f(n) = 3n² + 10n + 50 under c·g(n) = 4n² from n₀ = 14 on; n₀ as a marked x; "f ≤ c·g past n₀" as a checked claim |
| big-o/common-complexity-classes | the ladder: O(1), log n, n, n log n, n², 2ⁿ on one plot (log y); a 10⁸ ops budget against n up to 10⁹ (log x) for the constraints table |
| big-o/analyzing-loops-api-complexity | measured iteration counts of the doubling loop, two sequential loops and the dependent nested loop, against log₂n, 2n and n(n−1)/2 |
| big-o/input-dependency-best-worst-average | linear search: the best-to-worst range of probes at each n, and the average, measured over every target position |
| big-o/amortized-analysis-dynamic-arrays | the cost of each append as a bar (1s and resize spikes), the running total, and the 3n line it stays under |
| big-o/analyzing-recursion-tree-method | measured calls: halving (log n), split-and-merge (n log n), fib (≈ φⁿ) |
| big-o/space-complexity | peak stack depth measured: recursive sum (n) against the loop (1) |
| big-o/complexity-drills | a plot in a drill's reveal where the drill asks for a growth rate |
| math-for-dsa/logarithms-and-exponents | halvings to reach 1, measured at every n, against log₂n (a staircase) |
| math-for-dsa/summations-and-series | partial sums 1 + ⋯ + n against n(n+1)/2; 1 + 2 + 4 + ⋯ + 2ᵏ against 2ᵏ⁺¹ − 1 |
| math-for-dsa/counting-and-combinatorics | answer-space sizes: C(n, 2), 2ⁿ, n! on a log y |
| math-for-dsa/divisibility-primes-gcd | trial-division checks against √n; sieve work against n log log n; Euclid's steps against the Fibonacci worst case |
| math-for-dsa/math-drills | as complexity-drills |
| math-for-dsa/modular-arithmetic | **not a plot**: a residue clock. Out of scope here, see §7 |
| getting-started (4 lessons) | **nothing to plot**: course orientation. The audit that filed #79 grouped them with Foundations; no plot is missing there |

So the shape is: **named series of y against n, on one pair of axes; a cursor walking n with each series' value
read out beside the plot; reference lines (a budget, an n₀); series that are formulas and series that are
measured counts; bars and a best-to-worst range as well as lines.**

The kit's one chart, `costChart` in `kit.js`, cannot say that: exactly two series (red `naive`, green `once`),
no cursor, no reference lines, and its tick and value labels are SVG `<text>` inside a `viewBox`, so they scale
with the stage and drew at 8–9px on a phone. The landing learned the same thing about the Big-O plot (CLAUDE.md
§4: "text is never drawn inside a scaled SVG"). Five shipped lessons draw through it.

## 2. Decision: a plot view on the step player, and costChart rebuilt on it

A new optional module, `kit/plots.js` + `plots.css`, is a **view for `StepPlayer`** (the contract at the top of
`player.js`), so the chrome, clock, step track, captions, fields line, invariants, tabs and reduced motion are the
ones every player shares. It is not a lane kind: a lane is slots holding items, and a plot has neither.

**Text is HTML, never SVG text.** The SVG holds only lines, bars, bands and point markers, drawn at its real pixel
size (no `viewBox` scaling: it is re-laid out from the host's width on resize). Tick labels, axis names, the label
at each series' end and each reference line's name are absolutely positioned HTML over it, at the page's type
scale. The readout (one row per series: marker, name, value at the cursor) is an HTML list beside the plot, or
under it below 640px.

`costChart(host, o)` keeps its signature and becomes a one-snapshot plot drawn by the same renderer (no player
chrome), so the five lessons that call it get HTML text without changing a line, and there is one plot renderer,
not two. It moves from `kit.js` into `plots.js`; `build.py` ships `plots.js` to any lesson that names
`costChart(` as well as the plot's own entry points.

### Why not the alternatives

- *Extend `costChart`*: it is a string-built static SVG with no model; a cursor, steps and read-back would be a
  second player written inside it.
- *Share `BigOObservatory`'s code*: the kit is plain script concatenated into one page scope, and the
  observatory is a React component whose reusable part is five one-line formulas and a number formatter. Its
  y-axis soft cap (clip n² at 3 · n log n) hides the thing the lessons show. Sharing would mean a generated file
  for five formulas; the kit's `plotFmt` and class table are written once in `plots.js` instead, and the class
  labels are held to the app's (`O(n log n)`, `O(n²)`, `O(2ⁿ)`) by the kit test.
- *A lane with a numeric axis, as intervals did*: intervals needed positions on one axis for items in rows.
  A plot needs two numeric axes and no rows.

### Fixed for the player's life

Both scales are fixed across every step and tab of one player, as the interval axis is: x from the extent of every
n any step shows, y from every value any series, bar, range or level reaches (so a budget that rises 100× is on
the axis from the first step). Scales are `lin` or `log`. A log axis ticks at powers of 10 when it spans three
decades or more, else at powers of 2. Linear ticks are 1, 2, 5 × 10ᵏ, chosen so labels do not touch. Only the
cursor, reference lines and what is revealed change between steps.

## 3. The model

`new PlotTrace({x:{name, scale}, y:{name, scale}, series:[...]})`. A series is
`{id, name, kind, of}`:

| kind | what it is | values |
|---|---|---|
| `curve` | a formula: the named class, or c·g(n) | `of(n)`, evaluated at every x the plot draws |
| `points` | measured counts at chosen n | `{n: value}` from running code; `join: 'line' \| 'step' \| 'none'` |
| `bars` | a cost per item (the i-th append) | `{i: value}` from running code |
| `range` | best to worst at each n | `{n: [lo, hi]}` from running code over every input of size n |

Values must be finite and, on a log axis, positive (a log y draws 0 nowhere, so it is refused, not clipped).

Operations recorded into steps, as `IvTrace` records them:

- `reveal(id, upTo)` shows a series up to x = upTo (`Infinity`: all of it); `hide(id)` removes it.
- `cursor(n)` places the moving n marker; `null` removes it. The readout shows each shown series' value at the
  cursor: a curve's `of(n)`, a measured series' value at exactly n, or `–` where nothing was measured.
- `level(name, y)` a horizontal reference (a budget); `at(name, x)` a vertical one (n₀, where a curve crosses
  the budget). Each is drawn with its name and value as HTML; `null` removes it.
- `count(name, value)` a counter on the fields line, as `IvTrace` has.

**Series are told apart without colour.** Each shown series has its own ink from the six AA-checked hue inks every
page already carries (`--b/o/g/r/p/y-ink`, held to AA on every surface by `shared.py` in both themes), its own
dash pattern and point shape (circle, square, triangle, diamond, cross, bar), and its name in the readout, whose
swatch repeats the dash and the marker. Names are not written at the lines' ends: on a phone they crowded the
plot, and the readout already pairs each name with its swatch and value.

**Labels are placed, not stacked.** The cursor's name sits on the axis; a horizontal line's name above it at the
right, else below it, else at the left; a vertical line's name on the first free row across the top. Each label is
sized from its text and moves on until it overlaps nothing placed before it (first built with fixed rows, a
budget's name was overprinted by a vertical line's). Every label sits on a solid patch of its surface, so it reads
at AA over a line or a band. A seventh series is refused: there is no seventh ink. The lesson picks inks by meaning
(`tone: 'good' | 'bad' | ...` maps to the status inks, as the lanes' tones do) or takes them in table order.

## 4. Seek safety and correctness

The page runs the algorithm first. Measured series are **counts taken by running code**: the lesson instruments
the loop it shows (a counter incremented where the lesson says the work is) and records what it counts. Each
measured series is checked on load against an independent statement of it: the closed form the lesson derives
(`n(n−1)/2`, `⌊log₂ n⌋ + 1`, `2ᵏ⁺¹ − 1`), or a second implementation that shares no code. `plotCheck(series, want)`
throws with the first n that disagrees, so a wrong curve is a page that fails the gate, not a plot that lies.

`plotWalk(T, o)` replays the steps into snapshots for the player; the snapshot after k steps is a pure function of
the first k (`plotState`). Every recorded snapshot is read back (`plotRead`, which sees the snapshot, not the
trace: which series are drawn and how far, the cursor, the lines, and every readout value as text) and
`plotSame` throws when they disagree, so a step shown in any order means the same thing. The kit test does the
same on random traces read in random order, against a reference written in the test.

Invariants: a walkthrough states its claim as an invariant (`plotWalk`'s `o.inv`), e.g. "f ≤ c·g for n ≥ n₀",
checked on every snapshot by the player's invariant line; a player may add claims for all its tabs
(`mountPlotTabs`'s `o.inv`). The plot's own: every measured value, named line and the cursor lie inside the axes. A
curve may leave the top (2ⁿ does) and is cut off there.

Without a cursor the readout names the series and shows no values: the hardware walkthrough reads its answers off
the vertical lines and the counters instead.

## 5. Accessibility and motion

The stage's accessible name describes the snapshot in words: the axes and scales, each shown series with its
value at the cursor, and each reference line (`view.label`). Between steps the cursor and reference lines glide
and a revealed series draws on left to right; under reduced motion every step is its settled picture. On a phone
the plot keeps its full width (it is laid out from the host width, so it never scrolls sideways) and the readout
moves under it.

## 6. Where the code goes

- `kit/plots.js` + `plots.css`: `PlotTrace`, `plotWalk`, `plotState`, `plotRead`, `plotCheck`, `PlotView` and
  `costChart` (moved from `kit.js`; the old `.chart` and `.legend` rules in `kit.css` go with it, and the five
  lessons' hand-written colour-swatch legends are replaced by the readout).
- `kit/plotplayer.js`: `PlotPlayer` and `mountPlotTabs`, the stepped plot. It is a module of its own because the
  page script is linted as one scope: a page that draws only `costChart` must not name `StepPlayer`, and must not
  ship the player's chrome it does not use.
- `build.py`: `plots` is optional (no deps), shipped when a lesson names `costChart(`, `plotWalk(` or
  `new PlotTrace(`; `plotplayer` (deps `player`, `plots`) when it names `mountPlotTabs(` or `PlotPlayer(`.
- `player.js`: `view.inv` may be a function of the snapshot, so a walkthrough can state its own claims ("total ≤
  3n") beside the plot's, and the fields line reserves the height of the fullest set. Lists keep working as before.
- The kit-players specimen gains a "Cost plots" section with three tabs, every number from running code:
  loops (the doubling loop and the dependent nested loop, measured, against log₂n and n(n−1)/2, the cursor walking
  n); amortized appends (per-append bars, the running total, the 3n line); growth beats hardware (n and n² against
  a budget that rises 100×, with where each crosses it). Each checks its counts against its closed form on load,
  and the kit test repeats those checks with references written from scratch.
- The five lessons that call `costChart` are rebuilt and their ledger evidence re-recorded (the kit changed).

## 7. What it does not do

- **The residue clock** in modular-arithmetic is a ring of m cells, not a plot. No kit player draws a ring; it
  is filed as its own issue rather than bent into this one.
- **Euclid's shrinking pair** (divisibility-primes-gcd's `euclid-shrink`) is a sequence of (a, b) rows, which the
  lane player already draws; only its step-count plot is this player's.
- **Continuous zoom or a draggable n.** The cursor moves by steps; a learner scrubs with the step track. A
  free slider would need a readout for every n, which measured series do not have.
- **Two y axes.** Series that share a plot share a scale; a lesson that needs two scales draws two plots.
