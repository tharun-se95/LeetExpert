---
workflow: faceless-explainer
flow: automation
storyboard: yes
message: "Appending to a dynamic array is amortized O(1), not always O(1) — one push in a doubling can copy the whole array."
destination: youtube
aspect: 1920x1080
language: en
audience: "Engineers and students preparing for DSA interviews"
length: 40s
angle: concept
voice: am_michael
---

## Intent

Post 1 of leetExpert's 30-post roadmap (`marketing/CONTENT_ROADMAP.md`, row 1,
General educational pillar). Owner's words: "fast paced explainer videos with
cool animations and motion graphics" — fast cuts, motion-graphics-first, not
the slower documentary pacing of the older `matrix-systems` narrations.

## Customizations

- Dual export: this project is the 16:9 master (YouTube). A separate native
  1080x1920 project (Reels/Shorts) follows — designed for portrait from the
  start, never cropped from this one (faceless-explainer visual-design rule).
- Voice through the HyperFrames CLI's local Kokoro engine (owner: "use
  hyperframes cli"); `HYPERFRAMES_PYTHON=~/.venvs/kokoro/bin/python`.

## Notes

- Source of truth: `courses/dsa/arrays/dynamic-arrays.md` — doubling copies at
  sizes 1, 2, 4, …, n sum to under 2n (O(1) amortized); a fixed increment c
  copies Θ(n²/c) in total (Θ(n/c) amortized, never constant).
- Every number on screen must be computed from the lesson's own mechanism,
  never typed in (repo CLAUDE.md §2). No invented stats, no competitor names.
- Brand: monochrome/steel, precise, not hype-y.
