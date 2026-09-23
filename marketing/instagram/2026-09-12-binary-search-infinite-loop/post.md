# This loop never ends — binary search's two-element trap

- **Archetype:** interview-reality edge case
- **Source lesson:** `courses/dsa/binary-search/the-invariant-template.md`
- **Family:** ordering-search (module `binary-search`)
- **Palette:** monochrome, matched to the module card art —
  ground `#15202E`, ink `#E5EBF2`, rule `#AEBAC6`. No family accent, per the
  Blueprint monochrome base.
- **Format:** 4-slide carousel, 2160×2700 (4:5 at 2×)

## Hook (first line — all most people read)

This binary search never returns. The array is sorted, it is not empty, and the target is in it.

## Caption

This binary search never returns. The array is sorted, it is not empty, and the target is in it.

The input is `[1, 3]` and the target is `3`. Two elements. The bug is one character: the update
`lo = mid` where it should be `lo = mid + 1`.

Here is why that one character decides whether the loop terminates.

With `lo = 0` and `hi = 1`, the midpoint is `lo + (hi - lo) // 2` = `0 + 0` = `0`. Truncating
division floors the result, so whenever the range is exactly two wide, `mid` lands on `lo`.
`arr[0]` is `1`, which is less than `3`, so we take the "go right" branch and set `lo = mid`
— which assigns `lo` the value it already had.

Nothing moved. The next iteration computes the same `mid` from the same `lo` and `hi`, takes
the same branch, and makes the same non-assignment. The state vector `(lo=0, hi=1, mid=0)` is
identical on every pass, so the exit test `lo <= hi` can never become false.

The `+ 1` is not a style preference. Once `arr[mid]` has been ruled out, it has to leave the
range — that is what forces the range to shrink on every pass, and a range that always shrinks
is a loop that has to end.

This is why we teach binary search from its invariant — the answer, if it exists, lies in
`[lo, hi]` — instead of from a memorised template. Derive the loop from the invariant and this
bug is not one you can write.

Full lesson, with the tracer and a runnable sandbox in both Python and TypeScript, is free in
early access at leetexpert.com

## Hashtags

#binarysearch #datastructuresandalgorithms #codinginterview #leetcode #algorithms
#programming #python #softwareengineering

## Alt text

1. Dark navy slide, heading "THIS LOOP NEVER ENDS", with a Python binary search function whose
   update statement reads `lo = mid`.
2. Dark navy slide showing a two-cell array, 1 at index 0 and 3 at index 1 highlighted in white,
   labelled lo · mid and hi.
3. Dark navy slide, heading "THE STATE NEVER CHANGES", with a six-row trace table where every row
   reads lo 0, hi 1, mid 0, arr[mid] 1, annotated "identical. every time."
4. Dark navy slide contrasting the struck-through line `lo = mid` with the corrected
   `lo = mid + 1`, the "+ 1" set in a white chip.

## CTA

leetexpert.com — stated once, on slide 4 and at the end of the caption.

## Verification

Not asserted — executed. Transcript: `sources/verification-transcript.txt`.

- `sources/verify.py` runs the buggy update against `[1, 3]`, target `3`, with a 6-iteration cap.
  Output: six iterations of `lo=0 hi=1 mid=0 arr[mid]=1`, never returning. The corrected version
  returns `1`.
- `sources/verify.mjs` runs the identical pair in JavaScript (`Math.floor` standing in for
  Python's `//`). Byte-identical trace, same result — so the claim holds in both runtimes the
  course ships, not just Python.
- The code shown on slide 1 is the buggy function verbatim. Programming ligatures are disabled in
  the render, so `<=` and `==` appear as literal character pairs and the snippet stays retypable.
- Contrast measured on the `#15202E` ground: ink `#E5EBF2` 13.69:1, rule `#AEBAC6` 8.32:1 — both
  clear WCAG AA.
- Slide dimensions confirmed 2160×2700 (exact 4:5).

## Reproduce

```
cd sources && node render.mjs
```

Fonts are vendored in `sources/fonts/` and referenced by `sources/local.css`, so the render needs
no network and cannot silently fall back to a system face — `render.mjs` asserts all three faces
loaded and aborts if any did not.
