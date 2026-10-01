# Whiteboard: a linked list is a train

- **Account:** leetexpert
- **Look:** Whiteboard (#149: one post in each of four new looks)
- **Format:** single image, 1080×1350
- **Media:** `slide1.png`
- **Build:** `marketing/reels-pipeline/looks/` (`facts.py`, `facts.mjs`, `looks.py`), rendered by `marketing/reels-pipeline/carousel/render.mjs`

## Hook

A linked list is a train.

## Caption

A linked list is a train. 🚂 Save this.

Each car only knows the car behind it (its next). The engine is the head: the one car you hold on to.

1️⃣ New car at the front? Point it at the old engine and make it the head. One link, whether the train has 5 cars or 100,000. O(1).
2️⃣ Want car 5? No jumping ahead: start at the engine and walk. 4 hops. O(n).
3️⃣ Drop the head and all 5 cars are still coupled, but nothing can reach them. The train is gone.

That's the trade against an array: cheap at the front, slow to reach the middle.

Your turn: on a train of 1,000 cars, how many hops from the engine to the last car? 👇

leetExpert, the interactive DSA course. Link in bio.

## Hashtags

#linkedlist #datastructures #bigo #leetcode #codinginterview

## Alt text

A whiteboard sketch in marker. Headline: "A linked list is a train." Below it, a hand-drawn train of 5 cars numbered 1 to 5, car 1 drawn as the engine, a blue arrow labelled "next" from each car to the one behind it, and a green arrow labelled "head" pointing at the engine. Three notes: O(1), add a car at the front: point it at the old engine and call it the head, one link whether the train has 5 cars or 100,000. O(n), reach car 5: no jumping ahead, start at the engine and walk, 4 hops. Head: lose the head and the train is gone; all 5 cars are still coupled, but nothing can reach them.

## Verified facts

- `facts.py` and `facts.mjs` build the train as a real singly linked list (car k's `next` is car k + 1) and agree: 5 cars reachable from the head; car 5 is 4 `next` hops from the engine.
- Front insertion on trains of 5, 1,000, 100,000 cars: the insertion is one statement, a new node whose `next` is the old head (that link checked by identity at each size); no other node is touched, so the work does not grow with the train. This is by construction, not a timing.
- Dropping the only head reference: 0 cars reachable from `head`; the 5 cars are still linked to each other (walked from a kept reference), which is the post's "still coupled".
- The challenge: the last of 1,000 cars is 999 hops from the engine (not shown on the post).
- Faces: Permanent Marker (Apache 2.0) and Caveat (OFL 1.1), vendored with their licences in `marketing/reels-pipeline/fonts/`. Neither has →, ✓ or ✗, so arrows are drawn; `render.mjs` fails if any text falls back to a system font.
