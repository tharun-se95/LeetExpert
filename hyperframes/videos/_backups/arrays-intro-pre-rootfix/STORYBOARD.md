---
format: 1920x1080
duration: 86.5s
message: "An array is one contiguous block of equal-sized slots — which is why arr[i] is one multiply and one add, and why a raw array cannot grow"
arc: Picture → Definition → Derivation → Contrast → Limit → Growth → In-place → Course
audience: someone starting DSA who has written code but never reasoned about memory
mode: autonomous
music: none
family: linear-traversal
accent: "#0A7A6A"
---

## Video direction

**Ground.** Every scene sits on `.stage` from `assets/brand.css` in the **dark**
theme — `--ground #15202e`, the 26px blueprint dot grid, `--ink #e5ebf2`. The
root element carries `data-family="linear-traversal"` so `--accent` resolves to
`#0a7a6a`. Accent is used only on the term currently being derived (the
substituted numbers, the `< 2n`, the `write ≤ read`) — never on chrome, never on
body-size prose.

**One object, held all the way through.** The same eight-cell row is the only
diagram in the video. It is the train in Scene 1, the addressable block in
Scenes 2–4, the thing that cannot grow in Scene 5, the thing being copied in
Scene 6, and the thing being compacted in Scene 7. Nothing is ever cleared and
rebuilt from scratch between scenes — cells persist and re-label. Do not
introduce a second metaphor or a second shape.

**Cells.** Use the `.cell` atom from `brand.css` (2.5px `--ink` border, 12px
radius, JetBrains Mono 700) and its three states: default, `data-state="active"`
(ink fill), `data-state="eliminated"` (`--muted-fill`). Index labels use `.idx`
(`--dim`). Ligatures are already off globally in `brand.css`.

**Pacing.** Every scene develops across its full duration — the row is on screen
before its labels, labels before the arithmetic, arithmetic before the result.
No scene front-loads then freezes.

**Type.** Space Mono (`.display`, `.eyebrow`) for the two title moments only
(Scenes 1 and 8). JetBrains Mono (`.mono`) for every address, index, formula,
and pointer name. Space Grotesk for the one-line captions.

**Module art note.** The two files under `web/public/media/module-art/` are
swapped relative to their names. **`arrays-light.webp` is the dark-ground,
light-ink plate** — that is the one this video uses (verified by opening both).
`arrays-dark.webp` is the pale-ground plate; do not use it here.

---

## Scene 1 — The picture

- duration: 9s
- transition_in: cut
- status: outline
- scene: Eight identical cells couple up left-to-right along a track rule
- voiceover: "Picture a train. Identical cars, permanently coupled, sitting on one straight length of track. That picture is what an array actually is."
- source: courses/dsa/arrays/contiguous-memory.md § What an array actually is

**0.0–1.5s** — Cold open on `arrays-light.webp` (the dark-ground plate) filling
the frame, its own ARRAYS wordmark and five outline cells already in place.
**1.5–3.0s** — The art cross-dissolves out under the live cells: the five drawn
cells hand off to five real `.cell` elements at the same screen positions, so
the cut reads as the plate coming alive rather than a scene change.
**3.0–6.0s** — Three more cells couple on from the right, one every 0.4s, each
sliding in and stopping flush against its neighbour with a 2px `--rule`
baseline (the track) extending beneath the whole row. Eight cells, no gaps.
**6.0–9.0s** — A short `--ink` coupler bar draws between each adjacent pair, and
a `.eyebrow` line "IDENTICAL · COUPLED · CONTIGUOUS" fades up under the track.

The cells are empty in this scene. The point is the *shape* — equal widths,
touching, on one straight line — not the contents.

## Scene 2 — What that means in memory

- duration: 8.5s
- transition_in: cut
- status: outline
- scene: Index labels then byte addresses appear beneath the eight cells
- voiceover: "One contiguous block of memory. Equal-sized slots, packed end to end. So you never walk the platform counting cars. You compute."
- source: courses/dsa/arrays/contiguous-memory.md § What an array actually is; the lesson's own `memory-cells` diagram (baseAddress 4096, slotBytes 8)

**9.0–10.5s** — The eyebrow swaps to "ONE CONTIGUOUS BLOCK". The coupler bars
fade; a single `--line` bracket draws under the whole row, spanning all eight
cells, to read as one allocation rather than eight objects.
**10.5–13.0s** — Index labels `0 1 2 3 4 5 6 7` type on beneath the cells in
`.idx`, left to right, 0.15s apart.
**13.0–16.0s** — A second row of labels appears below the indices in `.mono`
`--dim`: `4096 4104 4112 4120 4128 4136 4144 4152`. These are the lesson's own
diagram values — base 4096, 8-byte slots.
**16.0–17.5s** — A small caption right of the row: `slot_size = 8 bytes`. Every
gap between consecutive addresses ticks once in accent to show it is the same
step, then settles.

## Scene 3 — The derivation

- duration: 14s
- transition_in: cut
- status: outline
- scene: The address formula assembles, then evaluates for i = 3 and lands on one cell
- voiceover: "The address of slot i is the base address plus i times the slot size. One multiply. One add. That cost does not grow with the array. That is what O of one means."
- source: courses/dsa/arrays/contiguous-memory.md — `address(i) = base_address + i × slot_size`; "That's why arr[i] is O(1): the computer doesn't search for index 7 — it computes 7's address and goes there directly."

This is the scene the video exists for. It gets the most time and the least
movement.

**17.5–20.0s** — The row shrinks to the upper third. Centre stage clears. The
formula assembles term by term in `.mono` at ~64px:
`address(i)` … `=` … `base_address` … `+` … `i × slot_size`. Each term fades up
as it is spoken, 0.6s apart.
**20.0–23.0s** — `base_address` lights accent and a thin accent leader line
drops from it to cell 0's left edge. `slot_size` lights accent and a leader
drops to the width of any one cell. The formula is now tied to the picture, not
floating.
**23.0–26.5s** — Substitution: a second line types beneath, `i = 3`, then
`4096 + 3 × 8`, then `= 4120`. The multiply and the add are revealed as two
separate steps, 0.8s apart, each with its operator briefly in accent — this is
"One multiply. One add." made visible.
**26.5–29.0s** — `4120` slides up and docks against the `4120` label already
under cell 3 (placed in Scene 2); cell 3 flips to `data-state="active"`. One
move, direct, no scanning animation across the other cells.
**29.0–31.5s** — Below the formula, a `.mono` line resolves:
`steps = 2, for any i` and then `O(1)` in accent. The eight-cell row briefly
stretches to a sixteen-cell row and back while `steps = 2` stays fixed — the
only visual proof that the cost is independent of n.

## Scene 4 — Against a chain

- duration: 9s
- transition_in: cut
- status: outline
- scene: Split screen — one arc to cell 7 above, seven hops along a linked list below
- voiceover: "Reaching item seven in a linked chain means seven hops. Here, seven is a number you multiply. No other position is touched."
- source: courses/dsa/arrays/contiguous-memory.md — "Compare a chain of linked nodes, where reaching item 7 means walking 7 hops"; "No other position is touched."

**31.5–33.0s** — The frame splits into two horizontal bands sharing the ground.
Top band keeps the eight-cell row. Bottom band builds the `linked-list`
primitive: seven boxes with arrow connectors, scattered on the baseline rather
than flush, each at a different y within a 40px band (the lesson's "scattered
across memory").
**33.0–35.5s** — Bottom band animates first: a token walks node to node, 0.3s
per hop, a hop counter incrementing `1 2 3 4 5 6 7` in `.mono`. Each visited
node dims to `data-state="eliminated"` behind it so the trail of touched
positions is visible.
**35.5–37.5s** — Top band: a single accent arc springs from the base marker
directly to cell 7, which flips to `data-state="active"`. Total elapsed 0.4s.
Every other cell stays untouched at default state — no dimming, because nothing
was read.
**37.5–40.5s** — Two counters settle side by side in `.mono`:
`array: 1 computation` / `chain: 7 hops`. Hold.

## Scene 5 — The limit

- duration: 9.5s
- transition_in: cut
- status: outline
- scene: A ninth car tries to couple past the caboose and is refused by an occupied block
- voiceover: "Now the limit. The track behind the caboose already belongs to something else. A raw array cannot grow in place, for exactly that reason."
- source: courses/dsa/arrays/dynamic-arrays.md § The problem a dynamic array solves

**40.5–42.0s** — The linked-list band clears. The eight-cell row returns to
centre, full width, all cells at default. Eyebrow: "FIXED AT ALLOCATION".
**42.0–44.5s** — Immediately right of cell 7, a `--muted-fill` block slides in
and locks, hatched, labelled `.mono` `--dim` `occupied`. The track rule
continues under it, so it is clearly the same stretch of memory, already
claimed.
**44.5–47.5s** — A ninth `.cell` drifts in from the right edge, tries to seat
itself where the occupied block sits, is blocked — it stops 12px short, nudges
twice, then dims to `data-state="eliminated"` and drops out of frame.
**47.5–50.0s** — Caption under the row in Space Grotesk: "the memory after it
may belong to something else". The occupied block holds; nothing else moves.

## Scene 6 — Doubling

- duration: 15s
- transition_in: cut
- status: outline
- scene: A longer row allocates below, cars copy across one by one, and the copy counts sum
- voiceover: "So a dynamic array builds a longer train on fresh track and moves every car across. Double the capacity each time, and the copying across n appends sums to under two n. Constant work per append, amortized."
- source: courses/dsa/arrays/dynamic-arrays.md § The problem a dynamic array solves — copies at 1, 2, 4, 8, …, n; geometric series under 2n total copies across n appends; O(1) amortized each

**50.0–52.0s** — The eight-cell row lifts to the upper third and labels itself
`.mono` `capacity 8 · length 8`. Below it, a new track rule draws across the
full width — visibly longer, "fresh track".
**52.0–54.5s** — Sixteen empty cells allocate onto the new track, left to right,
fast (0.06s each), at the same cell width. The capacity label on the new row
reads `capacity 16`.
**54.5–59.0s** — The copy. Each of the eight cars slides down and across into
its new slot, one at a time, 0.35s each, staggered 0.2s so several are in
flight — this is the visible O(n) work. As each leaves, its old cell drops to
`data-state="eliminated"`. When the last one lands, the entire old row fades to
30% and the old track rule dashes out: "retire the old, too-short train".
**59.0–62.0s** — A `.mono` ledger builds along the right margin, one row per
grow, in the lesson's own sequence: `1 · 2 · 4 · 8 · 16 …`, each with the copy
count it cost. The gaps between entries widen as the numbers grow — rebuilds
becoming rare.
**62.0–65.0s** — The ledger collapses into one accent line: `total copies < 2n`,
and under it `per append: O(1) amortized`. Hold on those two lines.

## Scene 7 — In place

- duration: 12s
- transition_in: cut
- status: outline
- scene: read and write pointers walk one row; keepers compact into an accent prefix
- voiceover: "The rest of the module stays inside one array. A read pointer and a write pointer. Write never passes read, so you can never destroy a value you still need."
- source: courses/dsa/arrays/in-place-foundations.md § What is an in-place technique? (O(1) auxiliary space, no second array); courses/dsa/arrays/stable-compaction-cyclic-placement.md § Technique 3 — invariant `nums[0..write)` holds the keepers in order; `write ≤ read` is the safety argument

Built from the `range-scan` primitive's row + pointer rig, with its `lo`/`hi`/
`mid` labels replaced by `read` and `write` and its elimination behaviour
replaced by compaction. Reuse the primitive's pointer geometry and caret shape
exactly; do not draw a new pointer.

**65.0–66.5s** — The doubled row collapses back to a single six-cell row holding
the lesson's own `write-pointer` tracer values: `0 1 0 3 12`, padded to six with
one more cell. Eyebrow: "O(1) AUXILIARY SPACE". A crossed-out ghost of a second
array appears and vanishes — "no second array" — inside 0.8s.
**66.5–68.0s** — Two `.mono` pointer carets drop in beneath cell 0, both
labelled: `read` and `write`, stacked so both are legible at the same index.
**68.0–74.0s** — Five steps, 1.2s each. `read` advances every step. When the
cell under `read` is a keeper (non-zero), its value copies down into the cell
under `write`, that cell tints accent-bordered (`data-state="marked"`), and
`write` advances. When it is a zero, only `read` moves. The prefix
`nums[0..write)` carries a soft accent underline that grows with `write`.
**74.0–77.0s** — Both pointers stop. The accent prefix holds the keepers; the
tail sits at `--dim` with no underline — the invariant says nothing about it. A
`.mono` line lands in accent: `write ≤ read`, with a short caption: "the slot
you overwrite was already read".

## Scene 8 — The module

- duration: 9.5s
- transition_in: cut
- status: outline
- scene: Module art returns; lesson counts stack; one URL
- voiceover: "Four concept lessons, five problems, one practice set. Module four of the leetExpert DSA course. Free in early access at leetexpert dot com."
- source: web/src/lib/course/manifest.ts — arrays module: `number: 4`, `stage: 1`, `title: "Arrays & Dynamic Arrays"`, 4 × concept(), 5 × problem(), 1 × practiceLesson()

**77.0–78.5s** — The six-cell row lifts and thins into the top rule of a title
card. `arrays-light.webp` (the dark-ground plate) fades back in at 40% on the
right half, anchored so its own cell row aligns with the rule — the same object
closing where it opened.
**78.5–82.0s** — Left half, `.display` in Space Mono: `MODULE 04` over
`ARRAYS & DYNAMIC ARRAYS` (the manifest's exact title). Beneath, a `.mono`
stack fading in one line at a time, 0.5s apart:
`4 concept lessons` / `5 problems` / `1 practice set`.
**82.0–84.5s** — The three counts underline in accent together, once.
**84.5–86.5s** — Everything holds; a single `.wordmark` line resolves at the
bottom: `leetexpert.com`, with `free in early access` above it in `.eyebrow`
`--dim`. No button, no second call to action, no other URL anywhere in the
video.
