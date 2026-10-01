"""Faces and drawn glyphs for every builder that feeds render.mjs (cheatsheet.py, reelslides.py,
../looks/looks.py), so the slides never reach a system font.

The course's font files are Google's Latin subsets, which stop short of →, ≤, ≈ and ⁿ, though the
complete faces have them; no Space face has Greek; and no course face has ⇔, ✓ or ✗. Chrome draws
a missing glyph in whatever the machine has (Menlo or Lucida Grande on a Mac, something else in the
cloud) without an error, so render.mjs fails on any system-font fallback (#152). This adds:
  - ../fonts/*-symbols.woff2: the complete faces cut to SYMBOLS, under the same family names
  - ../fonts/JetBrainsMono-greek.woff2: Greek from the course's code face (Σ and α appear only in
    complexity notation, which reads as code)
  - draw(): ⇔ ✓ ✗ as inline SVG in the text's colour
../fonts/README.md says how the subsets are cut.
"""
import re
from pathlib import Path

FONTS = (Path(__file__).resolve().parent.parent / "fonts").as_uri()
SYMBOLS = "U+2000-206F,U+2070-209F,U+2190-21FF,U+2200-22FF"
GREEK = "U+0370-03FF"

# Each face repeats the weight descriptor of the course face it extends (Space Grotesk 300 700,
# Space Mono 400 and 700): Chrome picks a weight group before it reads unicode-range, so a Greek
# face declared 100 800 won a bold request and every digit in it fell back to Courier.
FACES = f"""
@font-face{{font-family:"Space Grotesk";src:url("{FONTS}/SpaceGrotesk-symbols.woff2");font-weight:300 700;unicode-range:{SYMBOLS}}}
@font-face{{font-family:"Space Mono";src:url("{FONTS}/SpaceMono-400-symbols.woff2");font-weight:400;unicode-range:{SYMBOLS}}}
@font-face{{font-family:"Space Mono";src:url("{FONTS}/SpaceMono-700-symbols.woff2");font-weight:700;unicode-range:{SYMBOLS}}}
@font-face{{font-family:"Space Grotesk";src:url("{FONTS}/JetBrainsMono-greek.woff2");font-weight:300 700;unicode-range:{GREEK}}}
@font-face{{font-family:"Space Mono";src:url("{FONTS}/JetBrainsMono-greek.woff2");font-weight:400;unicode-range:{GREEK}}}
@font-face{{font-family:"Space Mono";src:url("{FONTS}/JetBrainsMono-greek.woff2");font-weight:700;unicode-range:{GREEK}}}
@font-face{{font-family:"Caveat";src:url("{FONTS}/Caveat[wght].ttf");font-weight:400 700}}
@font-face{{font-family:"Permanent Marker";src:url("{FONTS}/PermanentMarker-Regular.ttf");font-weight:400}}
.drawn{{height:.9em;vertical-align:-.1em;fill:none;stroke:currentColor;stroke-width:3.2;stroke-linecap:round;stroke-linejoin:round}}
"""

# glyph -> (viewBox width, path); the box is 24 high
DRAWN = {"✓": (24, "M3 13 L9 19 L21 5"), "✗": (24, "M5 5 L19 19 M19 5 L5 19"),
         "⇔": (34, "M9 9 H25 M9 15 H25 M9 5 L3 12 L9 19 M25 5 L31 12 L25 19")}


def svg(ch):
    w, d = DRAWN[ch]
    return (f'<svg class="drawn" viewBox="0 0 {w} 24" style="width:{.9 * w / 24:.2f}em" role="img" '
            f'aria-label="{ch}"><path d="{d}"/></svg>')


def draw(markup):
    """The glyphs no course face has, drawn: in text only, never inside a tag's attributes."""
    return re.sub(r"[^<>]+(?=<|$)", lambda m: re.sub("[" + "".join(DRAWN) + "]", lambda g: svg(g.group()), m.group()), markup)
