# Big type: binary search

- **Account:** leetexpert
- **Look:** Big type (#149: one post in each of four new looks)
- **Format:** single image, 1080×1350
- **Media:** `slide1.png`
- **Build:** `marketing/reels-pipeline/looks/` (`facts.py`, `facts.mjs`, `looks.py`), rendered by `marketing/reels-pipeline/carousel/render.mjs`

## Hook

A billion sorted numbers. At most 30 guesses.

## Caption

A billion sorted numbers. At most 30 guesses. 🔎

That's binary search: look at the middle, throw away the half that can't hold the answer, repeat.

Halving is brutal. 1,000,000,000 → 500,000,000 → 250,000,000 → … one item left after 29 guesses, and guess 30 settles it.

A line-by-line scan could need 1,000,000,000 looks. The catch: the numbers must be sorted.

Your turn: how many guesses for a TRILLION? 👇

leetExpert, the interactive DSA course. Link in bio.

## Hashtags

#binarysearch #logn #bigo #leetcode #codinginterview

## Alt text

Huge black type on a bright blue ground: "A billion sorted numbers. At most 30 guesses." Underneath, smaller: binary search guesses the middle and keeps the half that can still hold the answer; each guess halves what's left, and 1,000,000,000 halves to nothing in 30.

## Verified facts

- `facts.py` and `facts.mjs` compute the worst case for a `lo <= hi` binary search on 1,000,000,000 items as 30 (probe the middle, recurse on the larger side), check 2^29 ≤ n < 2^30 and ceil(log2(n + 1)) = 30, and run 20,006 real searches over a[i] = 2i (hits, misses, both ends): the most any took is 30, so the bound is reached, not just an upper limit.
- The halving chain: 1,000,000,000 // 2 = 500,000,000, // 4 = 250,000,000.
- The challenge: a trillion needs 40 (not shown on the post).
