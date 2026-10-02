# Stop sorting to check anagrams: the tally-sheet reel (carousel)

- **Account:** leetexpert
- **Archetype:** the reel as a carousel, for people who save rather than watch
- **Source:** the reel `2026-09-29-anagram-tally`: its cover, its own frames (captions and tutor off) at the anchors in `sources/slides.json`, and words from its script and caption
- **Format:** Carousel, 9 slides, 1080×1350
- **Plan:** issue #134 (epic #132)
- **Status:** rendered, not scheduled.
- **Media:** `slide1.png`, `slide2.png`, `slide3.png`, `slide4.png`, `slide5.png`, `slide6.png`, `slide7.png`, `slide8.png`, `slide9.png`

## Hook (first line — all most people read)

Stop sorting to check anagrams.

## Caption

"listen" and "silent": same letters? 🧩
Most people sort both words and compare. That's O(n log n).

Think Scrabble. You wouldn't alphabetize two racks of tiles. You'd keep a tally:
+1 for every tile in the first rack, −1 for every tile in the second.
Every row back at zero means the same tiles.

In code: return False if the lengths differ; counts is the tally sheet (a dict from letter to number); +1 for each letter of s, −1 for each letter of t; then every count must be 0. One pass: O(n).

Our test run on 1,000,000 letters (Python): sorted() 215 ms, Counter 55 ms. Counting took about a quarter of the time.

Warehouses reconcile stock the same way: +1 per box in, −1 per box out.

⚠️ The classic 26-slot array only covers a–z. Give it "café" and Python raises IndexError: list index out of range, while JavaScript quietly returns false. Beyond a–z, count with a hash map.
⚠️ Never compare sets: set("aacc") == set("ccac") is True, but they aren't anagrams. Counts matter.

Your turn: "aab" vs "abb". Which rows miss zero? 👇

Watch every count change on leetExpert, the interactive DSA course. Link in bio.

## Hashtags

#validanagram #hashmap #leetcode #python #codinginterview

## Alt text (per slide)

**Slide 1.** The reel's cover: "Stop sorting to check anagrams."

**Slide 2.** Two racks of word-game tiles, both sorted to E I L N S T, above a code card: sorted("listen") == sorted("silent"), then "eilnst" == "eilnst" with an O(n log n) tag.

**Slide 3.** Racks spelling LISTEN and SILENT above a tally sheet with one row per letter, L, I, S, T, E and N; after the first rack every row reads +1.

**Slide 4.** The same tally sheet with all six rows back at 0, each ticked, and an ANAGRAM stamp.

**Slide 5.** Python function is_anagram(s, t) with the second loop, for ch in t: counts[ch] = counts.get(ch, 0) - 1, highlighted. Under it the counts map for listen and silent with every letter at 0, and the note t: 't' → counts['t'] = 0.

**Slide 6.** A stopwatch over two bars for 1,000,000 letters in our Python test run: sorted(s) == sorted(t) at 215 ms and Counter(s) == Counter(t) at 55 ms, with the label "counting: about ¼ of the time".

**Slide 7.** "The catch: a 26-slot array covers a to z only" over a strip of slots a to z. Tiles C A F É point to "slot 136?"; Python crashes with IndexError: list index out of range, and JavaScript returns false, quietly wrong.

**Slide 8.** A text slide under "Your turn": "aab" vs "abb". Which rows miss zero?

**Slide 9.** Closing slide: every step of this, visualised, in leetExpert, the interactive DSA course. leetexpert.com, link in bio.

## Verified facts

- Every word on a slide is in the reel's `script.txt` or caption (`reelslides.py` fails otherwise), and those are held to the code by the reel's `verify.py` and `verify.mjs`. The frames are the reel's own render at those moments, so the stage shows what the reel's code did.
- `render.mjs` fails if any slide's text leaves its frame.

## Sources

`sources/slides.json` (the slides), built by `marketing/reels-pipeline/carousel/reelslides.py`; see its README.
