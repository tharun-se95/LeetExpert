"""Icons every reel reuses (interview mic, challenge bubble, tiles). Flat two-tone SVG
in the reel palette; a reel keeps its own scene illustrations in its icons.py."""

INK, NAVY, SLATE, STEEL, MUTED = "#f1f4f9", "#0e1520", "#334155", "#64748b", "#94a3b8"
TEAL, TEAL_D, TEAL_M = "#5eead4", "#0f3d37", "#14b8a6"
AMB, AMB_D = "#fbbf24", "#b45309"
TILE, TILE_D = "#f3e3c3", "#d9c49b"
MONO = "font-family:'Space Mono',monospace;font-weight:700"


def svg(vb, body, cls="", extra=""):
    return f'<svg class="{cls}" viewBox="{vb}" {extra} xmlns="http://www.w3.org/2000/svg">{body}</svg>'


def mic():
    return svg("0 0 64 64", f'<rect x="22" y="4" width="20" height="34" rx="10" fill="{AMB}"/><path d="M26 14 H38 M26 22 H38" stroke="{AMB_D}" stroke-width="2.5"/>'
               f'<path d="M14 28 A18 18 0 0 0 50 28" stroke="{MUTED}" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M32 46 V58 M22 58 H42" stroke="{MUTED}" stroke-width="4" stroke-linecap="round"/>', "ico")


def question():
    return svg("0 0 64 64", f'<path d="M8 10 H56 V44 H30 L18 56 V44 H8 Z" fill="{TEAL}" stroke-linejoin="round"/>'
               f'<text x="32" y="38" text-anchor="middle" style="{MONO};font-size:30px" fill="{NAVY}">?</text>', "ico")


def tile(letter, pts=1):
    """A word-game tile: cream face, letter, small point value (#4f5d72 clears 4.5:1 on the cream)."""
    return svg("0 0 100 100", f'<rect x="3" y="6" width="94" height="91" rx="12" fill="{TILE_D}"/>'
               f'<rect x="3" y="3" width="94" height="88" rx="12" fill="{TILE}"/>'
               f'<text x="46" y="68" text-anchor="middle" style="{MONO};font-size:58px" fill="{NAVY}">{letter.upper()}</text>'
               f'<text x="82" y="84" text-anchor="middle" style="{MONO};font-size:18px" fill="#4f5d72">{pts}</text>', "tl")


def cue_card(title_html, say):
    """The interview-tell card: mic, label, the cue, and the phrase to say (id cueB)."""
    return (f'<div class="cuebox" style="top:40px"><div class="cuemic">{mic()}</div><div class="mono amb" style="font-size:32px;font-weight:700">INTERVIEW TELL</div>'
            f'<div class="h" style="margin-top:18px">{title_html}</div>'
            f'<div id="cueB" class="chip" style="display:inline-block;margin-top:26px;font-size:44px">→ say “{say}”</div></div>')
