# Product screenshot: Big-O at n = 1,000

- **Account:** leetexpert
- **Look:** Product screenshot (#149: one post in each of four new looks)
- **Format:** single image, 1080×1350
- **Media:** `slide1.png`
- **Build:** `marketing/reels-pipeline/looks/` (`facts.py`, `facts.mjs`, `looks.py`), rendered by `marketing/reels-pipeline/carousel/render.mjs`

## Hook

At n = 1,000, n² is a million steps.

## Caption

At n = 1,000, n² is a million steps. 📈

That's one nested loop over a thousand items: 1,000 × 1,000 = 1,000,000.

Same input, other growth rates:
O(log n) → about 10
O(n) → 1,000
O(n log n) → about 9,966
O(n²) → 1,000,000

This is the course's Big-O observatory: drag n and watch the curves split.

Your turn: at n = 1,000, how many times bigger is n² than n log n? 👇

leetExpert, the interactive DSA course. Link in bio.

## Hashtags

#bigonotation #timecomplexity #algorithms #leetcode #codinginterview

## Alt text

A screenshot from the leetExpert course: the Big-O observatory, a dark panel listing five curves at input size n = 1.0K: O(1) 1, O(log n) 10, O(n) 1.0K, O(n log n) 10.0K, O(n²) 1.0M. Under it, the input-size slider set to 1.0K. The headline reads "At n = 1,000, n² is a million steps." The caption: same input, five growth rates; n log n is about 9,966, n² is 1,000,000.

## Verified facts

- `shot.mjs` drives the running app (`/courses/dsa/big-o/common-complexity-classes`), sets n to 1,000 through the page's own slider and **fails** unless the page shows n = 1.0K, O(n) = 1.0K and O(n²) = 1.0M. It shows: O(1) 1, O(log n) 10, O(n) 1.0K, O(n log n) 10.0K, O(n²) 1.0M.
- `facts.py` / `facts.mjs` count a 1,000 × 1,000 nested loop: 1,000,000 steps in both runtimes; n log2 n = 9,966 (rounded), log2 n = 9.97.
- The challenge: 1,000,000 / 9,966 ≈ 100 (not shown on the post).
- The observatory is a navy instrument card in both themes, so the capture is the same in either.
