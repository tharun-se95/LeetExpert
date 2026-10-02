# Post 3 — "Would you ship this?" (leetExpert reel)

[route] /general-video, companion build, storyboard reviewed in chat
[spec] ~50s, 1080x1920 vertical, 30fps, one composition. Duration follows the narration.

Message: "Passing the sample test isn't proof."
Arc: Hook -> Setup -> Breather -> Reveal -> Hidden cost -> Fix -> Landing
Audience: developers prepping for interviews who use AI coding tools
Mood: playful tension resolving to calm confidence

## Direction (every frame)
- Ground #16202e, ink #f1f4f9. Teal #5eead4 = correct, amber #fbbf24 = bug. No other hues.
- Hero prop: the code card never leaves the frame. Scenes change around it; the camera travels over it.
- Camera: one slow push (4-6%) per beat, a genuine rest (~1.5-2s) on each reveal; world keeps resolving during rests.
- VO-paced reveals: each element lands on its spoken cue (Scribe word timestamps); narration never waits for visuals.
- Motion only with a reason: caret blinks (editor is live), stopwatch ticks while code runs. No decorative wobble.
- Overlap entrances at irregular offsets; overshoot on transforms only, never on numbers.
- Captions: caption-highlight, TikTok-style, one keyword lit teal (bugs/numbers amber), bottom third inside the IG safe zone.
- Transitions: none between most beats (hero prop carries continuity); one `glitch` accent (~0.2s) on "It says true".
- Callback: the teal "True ✓" chip planted in Setup returns in Landing, now under "Passing the sample test isn't proof."
- Breather: frame 3 (the tiny test) is the one calm, near-static beat.
- Negatives: no music (added in Instagram), no purple-blue gradients, no bokeh, no glassmorphism, no emoji, no browser chrome, no stock imagery, no Math.random, no frozen final second.

## Voice
ElevenLabs v3, voice Hope (WZlYpi1yf6zJhNWXih74), one continuous take, conversational, natural pauses kept.

## Frames (times approximate; VO sets the clock)
1 Hook (~0-6s) | hook, challenge question, curiosity | focal: code typed in ~2s via `code-typing` (Python), tag "AI-written" stamps top; "Would you ship it?" lands on "ship".
2 Setup (~6-15s) | demonstration, false confidence | test chip `[2, 7, 11, 15], target 9` -> "True ✓" teal on "True"; line 3 softly lit on "check if the one you'd need".
3 Breather (~15-19s) | counterexample setup, suspense | new chip `[5], target 10` alone; everything else dims; caret blinks.
4 Reveal (~19-27s) | counterexample, aha | glitch accent; "True ✗" amber on "true"; `code-highlight` on line 3 `if target - x in nums:`; the 5 loops an arrow back to itself: "10 − 5 = 5 → itself".
5 Hidden cost (~27-36s) | escalation, dread | "in nums" underlined; scanner sweeps a row of cells again for each number; stopwatch runs to "10.5 s" for 40,000 numbers on "over ten seconds".
6 Fix (~36-46s) | before/after, relief | `code-diff`: + `seen = set()`, `in nums` -> `in seen`, + `seen.add(x)`; chip `[5], 10 -> False ✓` teal; "3.5 ms" beside struck "10.5 s".
7 Landing (~46-54s) | callback + distillation, resolve | the Setup "True ✓" returns; "Passing the sample test isn't proof."; edge-case chips "one number / duplicates / empty"; CTA "leetExpert's coach names the case that broke. Link in bio."

## Verified facts (run 2026-09-25)
AI version: [2,7,11,15],9 True (correct); [5],10 True (wrong); [3,5],6 True (wrong); [4,1],8 True (wrong).
Fix: all correct. 40,000 numbers, no pair: 10.53s vs 3.51ms (our run; ~4x per doubling).
