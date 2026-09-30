# Two pointers on one card (the real cheatsheet, as a reel and a single image) (carousel)

- **Account:** leetexpert
- **Archetype:** the reel as a carousel, for people who save rather than watch
- **Source:** the reel `2026-09-30-two-pointers-card`: its cover, its own frames (captions and tutor off) at the anchors in `sources/slides.json`, and words from its script and caption
- **Format:** Carousel, 8 slides, 1080×1350
- **Plan:** issue #134 (epic #132)
- **Status:** rendered, not scheduled.
- **Media:** `slide1.png`, `slide2.png`, `slide3.png`, `slide4.png`, `slide5.png`, `slide6.png`, `slide7.png`, `slide8.png`

## Hook (first line — all most people read)

Two pointers on one card. Save this.

## Caption

Two pointers, the whole pattern on one card. 📌 Save this.

Sorted array + pair sum → opposite ends: l at the front, r at the back; too small moves l in, too big moves r in.
Remove / move while reading ahead → fast & slow: fast explores, slow marks the end of what you keep.
Area between two lines → move inward, always the shorter side (the taller one can never raise the minimum).
Merge two sorted lists → one pointer each: take the smaller head, then append the rest.

Targets: O(n) time with O(1) extra space; the merge is O(n+m).
⚠️ Opposite ends needs sorted data.
⚠️ Watch l < r: with l <= r the middle element can pair with itself.

This is the real two-pointers cheatsheet from leetExpert. There are 21, one for every module with practice problems.

Your turn: checking whether a string is a palindrome. Which pattern? 👇

leetExpert, the interactive DSA course. Link in bio.

## Hashtags

#twopointers #cheatsheet #studygram #leetcode #codinginterview

## Alt text (per slide)

**Slide 1.** A text slide: "Two pointers on one card. Save this."

**Slide 2.** Under "Sorted array, pair / triplet sum → Opposite ends", Python two_sum(numbers, target) with l, r = 0, len(numbers) - 1 and while l < r; the branch if s < target: l += 1 is highlighted with the note "Sum too small: move l in". On 2, 7, 11, 15, l is on 2 and r on 7: 2 + 7 = 9.

**Slide 3.** Under "Remove / move while reading ahead → Fast / slow", Python remove_duplicates(nums) with if nums[fast] != nums[slow]: slow += 1; nums[slow] = nums[fast] highlighted and the note "Something new? slow steps forward, takes it". The array reads 0, 1, 2, 3 kept, then dimmed values, with fast on a 4: 4 is new.

**Slide 4.** Under "Container / area between indices → Inward from tallest hope", Python max_area(h) with if h[l] < h[r]: l += 1 else: r -= 1 highlighted and the note "Move the shorter side: the taller one can never raise the minimum". Heights 1, 8, 6, 2, 5, 4, 8, 3, 7; returns 49.

**Slide 5.** Under "Merge two sorted streams → One pointer each", Python merge(a, b) with return out + a[i:] + b[j:] highlighted and the note "One runs out: append the rest". a is 1, 2, 4 and b is 1, 3, 4: + the rest → [1, 1, 2, 3, 4, 4].

**Slide 6.** "Two traps": forgetting the sort prerequisite (opposite-end sum logic is wrong on unsorted data; sort first or pick another pattern) and crossing pointers (the loop condition is usually l < r; equality can double-count the middle element). while l < r ✓ against while l <= r, where [3], 6 → [1, 1] ✗.

**Slide 7.** A text slide under "Your turn": Checking whether a string is a palindrome. Which pattern?

**Slide 8.** Closing slide: every step of this, visualised, in leetExpert, the interactive DSA course. leetexpert.com, link in bio.

## Verified facts

- Every word on a slide is in the reel's `script.txt` or caption (`reelslides.py` fails otherwise), and those are held to the code by the reel's `verify.py` and `verify.mjs`. The frames are the reel's own render at those moments, so the stage shows what the reel's code did.
- `render.mjs` fails if any slide's text leaves its frame.

## Sources

`sources/slides.json` (the slides), built by `marketing/reels-pipeline/carousel/reelslides.py`; see its README.
