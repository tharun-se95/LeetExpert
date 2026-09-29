# Same line, 1,000× slower — list vs set deep reel

- **Archetype:** cost check, deep dive (reel)
- **Source lesson:** `courses/dsa/hash-tables/hashing-fundamentals.md`
- **Family:** hash-tables
- **Format:** Reel, 1080×1920, 2:17, loops; tutor stills; Hope narration + lo-fi bed; rendered in two chunks and joined
- **Status:** posted 2026-09-29 — https://www.instagram.com/reel/Dd4j7dZjME-/
- **Media:** `reel.mp4`, `cover.png`

## Hook (first line — all most people read)

Learning Python? These two lines look exactly the same… but one is over a thousand times slower.

## Caption

Same line of Python. One is ~1,900× slower.

`if x in seen:` scans a list item by item: O(n) per lookup. Inside a loop, that's a hidden O(n²).

A set is a hash table: hash the value, jump to its slot. O(1) on average (collisions make it “average”, not a promise).

But sets aren't free: more memory, a build cost (~5 list scans for 10k items), no order, no duplicates, and only hashable items (`unhashable type: 'list'`).

Quick test: check one value, just once. List or set? 👇

Learn it with every step visualised on leetExpert, the interactive DSA course. Link in bio.

## Hashtags

#python #dsa #codinginterview #hashtable #softwareengineer

## Alt text

The tutor hosts: two near-identical code cards (list vs set), a race of 10,000 × 10,000 lookups (0.51 s vs 0.27 ms), a scanner walking a list, an 8×8 grid showing hidden O(n²), a coat-check hash table with a collision probing to the next slot, four trade-off cards including a real TypeError, an interview-tell card, a list-or-set challenge, and a leetExpert lockup.

## Verified facts

Our run: 10,000 items × 10,000 lookups (half hits): list 0.51s vs set 0.27ms (≈1,900×); 1,000: ≈180×; 40,000: ≈4,400×. sys.getsizeof at 10k ints: set 524,504 B vs list 80,056 B (≈6.6×). Building a 10k set ≈0.54ms ≈ 5 worst-case list scans. `{[1, 2]}` → TypeError: unhashable type: 'list'. set([3,1,3,2]) → {1,2,3}. Challenge answer: list.

## Sources

`gen.py` (stills version, beat list `SB`), `style.css`, `words.json`, `vo.mp3`, `mix.mp3`, `timing.json`. Render in two chunks (see pipeline README).

Re-render: see `marketing/reels-pipeline/README.md` (HyperFrames 0.8.77; add `gsap.min.js` and the Space Grotesk / Space Mono TTFs next to the generator first).

## Open items

Meets the depth and stand-alone rules.

<sub>Agent: Claude (claude.ai chat, Claude Opus 5.5) · project "LeetExpert" · branch `feat/66-instagram-reels-pipeline` · 2026-09-28 · issue #66</sub>
