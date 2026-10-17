---
format: 1920x1080
duration: 40s
message: "Appending to a dynamic array is amortized O(1), not always O(1) — one push in a doubling can copy the whole array."
arc: concept-explainer with process
audience: Engineers and students preparing for DSA interviews
mode: collaborative
music: tight minimal tech pulse, low and unobtrusive under narration
family: linear-traversal
accent: "#107d6e"
---

## Video direction

Fast cuts, motion-first. One object is held the whole way: **a row of cells** —
the backing store. It fills, overflows, is copied into a longer row, and later
becomes the bars of the copy-count chart. No second metaphor. Every number on
screen comes from `sources/compute.py` (mirrored by `sources/compute.mjs`);
none are typed in by hand.

Numbers used (computed, 1,024 appends, capacity starts at 1):

- doubling: copies happen at sizes 1, 2, 4, …, 512; **1,023** copies in total,
  ~1 per append; worst single append is #513, which copies **512**.
- grow by a fixed 4: **130,560** copies in total, **127.5** per append
  (~128× the doubling total).
- 9-append close-up: pushing into a full 8-cell row copies all **8** and the new
  capacity is **16**.

## Frame 1 — The claim

- scene: "append( ) is O(1)" slams in, then a question mark punches on and the O(1) cracks
- voiceover: "Appending to an array is O of one. Right? Not always."
- duration: 3s
- transition_in: cut
- status: built
- src: compositions/frames/01-claim.html
- type: hook
- persuasion: Common-belief vs reality
- beat: Surprise + skepticism
- blueprint: kinetic-type-beats

narrativeRole: Opens the gap by challenging the O(1) the viewer memorised.
keyMessage: The O(1) you learned has a catch.

## Frame 2 — The full row

- scene: 8 cells fill in a fast stagger; a 9th value arrives, bumps the wall; a 16-cell row appears and all 8 values fly across to it, a counter ticking copies 1…8
- voiceover: "Fill the array — and the next push has nowhere to go. So it builds a bigger one — and copies every element across. That one push is O of n."
- duration: 7s
- transition_in: cut
- status: built
- src: compositions/frames/02-full-row.html
- type: pain_point
- persuasion: Demonstration (show the mechanism running)
- beat: Tension + recognition

narrativeRole: Shows the expensive append happening, so the catch is seen, not asserted.
keyMessage: A push into a full array copies all n elements.

## Frame 3 — Amortized

- scene: the word AMORTIZED stamps over the row; the 8 copies smear out evenly across the 9 pushes beneath it
- voiceover: "So why do we still call it O of one? Amortized — averaged over every push."
- duration: 4s
- transition_in: crossfade
- status: built
- src: compositions/frames/03-amortized.html
- type: product_intro
- persuasion: Concept announcement + Frame-then-fill
- beat: Orientation + curiosity

narrativeRole: Names the idea that resolves the contradiction and lands the thesis by beat 3.
keyMessage: O(1) here means cheap on average, not cheap every time.

## Frame 4 — Doubling

- scene: the row doubles again and again; each copy drops a bar sized 1, 2, 4, 8 … 512 onto a baseline, bars halving as you read right to left
- voiceover: "The trick is doubling. Copies happen at one — two — four — eight — each one twice as rare as the last."
- duration: 7s
- transition_in: push-slide LEFT
- status: built
- src: compositions/frames/04-doubling.html
- type: feature_showcase
- persuasion: Progressive disclosure + Build-up
- beat: Comprehension + momentum

narrativeRole: Reveals the mechanism — geometric growth makes expensive copies exponentially rarer.
keyMessage: Doubling makes each big copy half as frequent as the one before.

## Frame 5 — The bill

- scene: the bars stack end to end into one line; a count-up lands on 1,023 copies against 1,024 pushes; "≈ 1 copy per push"
- voiceover: "Add them up. One thousand twenty-four pushes — one thousand twenty-three copies. About one per push."
- duration: 5s
- transition_in: push-slide LEFT
- status: built
- src: compositions/frames/05-the-bill.html
- type: social_proof
- persuasion: Worked example with real numbers
- beat: "Aha" + satisfaction
- blueprint: dataviz-countup

narrativeRole: Proves the average with the real total, so amortized O(1) is shown, not claimed.
keyMessage: Total copies stay under 2n, so each push averages O(1).

## Frame 6 — The trap

- scene: split-bar race — doubling's 1,023 stays a sliver while "grow by 4" counts up past it to 130,560; per-push readout flips from ≈1 to 127.5
- voiceover: "Grow by a fixed four instead — and the same pushes cost over a hundred and thirty thousand copies. That is O of n, every push."
- duration: 7s
- transition_in: push-slide LEFT
- status: built
- src: compositions/frames/06-the-trap.html
- type: feature_showcase
- persuasion: Counterexample + Comparison of two options
- beat: Unease + fascination
- blueprint: dataviz-countup

narrativeRole: Shows the policy that breaks the guarantee, so the viewer learns why the growth rule matters.
keyMessage: A fixed increment never gets amortized O(1).

## Frame 7 — The rule

- scene: "Double, don't add." punches in; beneath it "amortized O(1) ≠ O(1) every time"
- voiceover: "Double — don't add. Amortized O of one means cheap on average — not cheap every time."
- duration: 4s
- transition_in: crossfade
- status: built
- src: compositions/frames/07-the-rule.html
- type: branding
- persuasion: Distillation + Callback
- beat: Clarity + resolve
- blueprint: kinetic-type-beats

narrativeRole: Compresses the lesson into one line and calls back to the hook's O(1).
keyMessage: Growth policy decides whether append is O(1).

## Frame 8 — Build it

- scene: leetExpert wordmark with the green lamp; "Build a dynamic array from scratch — Python & TypeScript"; leetexpert.com
- voiceover: "Build one from scratch at leet Expert."
- duration: 3s
- transition_in: crossfade
- status: built
- src: compositions/frames/08-build-it.html
- type: cta
- persuasion: Direct address
- beat: Inspiration

narrativeRole: Points the viewer to the lesson where they implement it.
keyMessage: You can build this yourself in the course.
