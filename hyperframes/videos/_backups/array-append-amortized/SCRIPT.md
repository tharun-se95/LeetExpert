# SCRIPT — array-append-amortized

**Voice:** am_michael (Kokoro, local via `hyperframes tts`)
**Voice settings:** speed 1.05
**Voice direction:** Quick, precise, a little wry. Punch the numbers; never hype.

---

## Line 1 — The claim (Frame 1)

**Time:** 0.0 – 3.0s
**Delivery:** Confident, then a beat of doubt on "Right?", flat on "Not always."

    Appending to an array is O of one. Right? Not always.

## Line 2 — The full row (Frame 2)

**Time:** 3.0 – 10.0s
**Delivery:** Brisk; slow slightly on "every element".

    Fill the array, and the next push has nowhere to go. So it builds a bigger one, and copies every element across. That one push is O of n.

## Line 3 — Amortized (Frame 3)

**Time:** 10.0 – 14.0s
**Delivery:** Lean on "Amortized".

    So why do we still call it O of one? Amortized. Averaged over every push.

## Line 4 — Doubling (Frame 4)

**Time:** 14.0 – 21.0s
**Delivery:** Count the sizes with rhythm.

    The trick is doubling. Copies happen at one, two, four, eight. Each one twice as rare as the last.

## Line 5 — The bill (Frame 5)

**Time:** 21.0 – 26.0s
**Delivery:** Land the total like a reveal.

    Add them up. One thousand twenty-four pushes. One thousand twenty-three copies. About one per push.

## Line 6 — The trap (Frame 6)

**Time:** 26.0 – 33.0s
**Delivery:** Rising; hit "a hundred and thirty thousand".

    Grow by a fixed four instead, and the same pushes cost over a hundred and thirty thousand copies. That is O of n, every push.

## Line 7 — The rule (Frame 7)

**Time:** 33.0 – 37.0s
**Delivery:** Measured, final.

    Double, don't add. Amortized O of one means cheap on average, not cheap every time.

## Line 8 — Build it (Frame 8)

**Time:** 37.0 – 40.0s
**Delivery:** Warm, short.

    Build one from scratch at leet Expert.
