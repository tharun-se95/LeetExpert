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


def terminal_crash():
    """A terminal window with an X: a crash or a raised error."""
    return svg("0 0 64 64", f'<rect x="4" y="8" width="56" height="48" rx="8" fill="{SLATE}"/><rect x="4" y="8" width="56" height="12" rx="6" fill="{STEEL}"/>'
               f'<path d="M14 30 L22 36 L14 42" stroke="{INK}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
               f'<path d="M34 28 L50 46 M50 28 L34 46" stroke="{AMB}" stroke-width="5" stroke-linecap="round"/>', "ico")

def robot():
    """'An AI wrote it': a small robot head, for would-you-ship-this hooks."""
    return svg("0 0 64 64", f'<path d="M32 4 V12" stroke="{MUTED}" stroke-width="4" stroke-linecap="round"/><circle cx="32" cy="4" r="4" fill="{AMB}"/>'
               f'<rect x="8" y="12" width="48" height="40" rx="12" fill="{SLATE}" stroke="{MUTED}" stroke-width="3"/>'
               f'<circle cx="23" cy="30" r="6" fill="{TEAL}"/><circle cx="41" cy="30" r="6" fill="{TEAL}"/>'
               f'<path d="M22 43 H42" stroke="{MUTED}" stroke-width="4" stroke-linecap="round"/><rect x="2" y="26" width="6" height="12" rx="3" fill="{MUTED}"/><rect x="56" y="26" width="6" height="12" rx="3" fill="{MUTED}"/>', "ico")


def cue_card(title_html, say):
    """The interview-tell card: mic, label, the cue, and the phrase to say (id cueB)."""
    return (f'<div class="cuebox" style="top:40px"><div class="cuemic">{mic()}</div><div class="mono amb" style="font-size:32px;font-weight:700">INTERVIEW TELL</div>'
            f'<div class="h" style="margin-top:18px">{title_html}</div>'
            f'<div id="cueB" class="chip" style="display:inline-block;margin-top:26px;font-size:44px">→ say “{say}”</div></div>')
