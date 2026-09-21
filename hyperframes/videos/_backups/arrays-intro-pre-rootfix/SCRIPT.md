# SCRIPT — arrays-intro

**Voice:** ElevenLabs, informative/neutral register (voice id chosen at the audio stage)
**Voice settings:** stability 0.45 · similarity 0.75 · style 0.10
**Voice direction:** Explaining, not selling. Even pace, no upward inflection at line ends.
Land the arithmetic in Line 3 deliberately — it is the one thing the video exists to teach.
Everything else can move.

**Length budget:** 213 words · 85.2s spoken at 150 wpm · 86.5s of scene time including
breath. Cap is 90s.

**Pronunciation:** "O of one" (never "O one"). "two n" = 2n. "leetexpert dot com".

---

## Line 1 — The picture (Scene 1)

**Time:** 0.0 – 9.0s
**Delivery:** Open flat and concrete. No hook voice.
**Source:** `contiguous-memory.md` § What an array actually is

    Picture a train. Identical cars, permanently coupled, sitting on one straight
    length of track. That picture is what an array actually is.

## Line 2 — The definition (Scene 2)

**Time:** 9.0 – 17.5s
**Delivery:** Matter-of-fact. Small beat before "You compute."
**Source:** `contiguous-memory.md` § What an array actually is

    One contiguous block of memory. Equal-sized slots, packed end to end. So you
    never walk the platform counting cars. You compute.

## Line 3 — Why indexing is O(1) (Scene 3)

**Time:** 17.5 – 31.5s
**Delivery:** The core beat. Slow through the formula. Full stops after
"One multiply." and "One add." — those are separate landings.
**Source:** `contiguous-memory.md` — `address(i) = base_address + i × slot_size`,
and "That's why `arr[i]` is O(1)".

    The address of slot i is the base address plus i times the slot size. One
    multiply. One add. That cost does not grow with the array. That is what O of
    one means.

## Line 4 — The contrast (Scene 4)

**Time:** 31.5 – 40.5s
**Delivery:** Brisk. This is the payoff of Line 3, not a new idea.
**Source:** `contiguous-memory.md` — "reaching item 7 means walking 7 hops";
"No other position is touched."

    Reaching item seven in a linked chain means seven hops. Here, seven is a
    number you multiply. No other position is touched.

## Line 5 — Where the train breaks (Scene 5)

**Time:** 40.5 – 50.0s
**Delivery:** Turn. Drop half a step in energy on "Now the limit."
**Source:** `dynamic-arrays.md` § The problem a dynamic array solves — the track
behind the caboose already belongs to something else; a raw array's size is
fixed at allocation for the identical reason.

    Now the limit. The track behind the caboose already belongs to something
    else. A raw array cannot grow in place, for exactly that reason.

## Line 6 — Doubling (Scene 6)

**Time:** 50.0 – 65.0s
**Delivery:** Build through the copy, then settle on "amortized."
**Source:** `dynamic-arrays.md` § The problem a dynamic array solves —
multiplicative growth: copies at 1, 2, 4, 8, …, n, "a geometric series summing
to under 2n total copies across n appends… O(1) amortized each."

    So a dynamic array builds a longer train on fresh track and moves every car
    across. Double the capacity each time, and the copying across n appends sums
    to under two n. Constant work per append, amortized.

## Line 7 — In place (Scene 7)

**Time:** 65.0 – 77.0s
**Delivery:** Quieter, like a footnote that matters.
**Source:** `in-place-foundations.md` § What is an in-place technique? (O(1)
auxiliary space, no second array) and `stable-compaction-cyclic-placement.md`
§ Technique 3 — "write ≤ read always holds… the slot you overwrite has already
been read, so you can never destroy data you still need."

    The rest of the module stays inside one array. A read pointer and a write
    pointer. Write never passes read, so you can never destroy a value you still
    need.

## Line 8 — Close (Scene 8)

**Time:** 77.0 – 86.5s
**Delivery:** Plain. State the counts, say the URL once, stop.
**Source:** `web/src/lib/course/manifest.ts` — module `arrays`, `number: 4`,
`stage: 1`; 4 `concept(...)`, 5 `problem(...)`, 1 `practiceLesson()`.

    Four concept lessons, five problems, one practice set. Module four of the
    leetExpert DSA course. Free in early access at leetexpert dot com.

---

## Word count

| Line | Words | Spoken @150wpm |
| --- | --- | --- |
| 1 | 22 | 8.8s |
| 2 | 21 | 8.4s |
| 3 | 34 | 13.6s |
| 4 | 22 | 8.8s |
| 5 | 24 | 9.6s |
| 6 | 37 | 14.8s |
| 7 | 30 | 12.0s |
| 8 | 23 | 9.2s |
| **Total** | **213** | **85.2s** |

## Claims deliberately NOT made

No growth factor other than doubling is spoken. `dynamic-arrays.md` notes real
implementations use 1.5×–2× and that Python overallocates on a different
pattern; the video says "double" because that is the policy it derives the
under-2n bound from. No cache-locality number is spoken (the lesson's 10–100×
and 64-byte line are real but need their own beat). No student counts, no
"free forever".
