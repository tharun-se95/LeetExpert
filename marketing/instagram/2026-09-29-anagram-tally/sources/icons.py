"""Illustrations for the anagram-tally reel: flat, two-tone SVG in the reel's palette.

Same palette and drawing style as the gift-card reel's icons.py; each function
returns an <svg> string, and nothing here is loaded at runtime.
"""

INK, NAVY, SLATE, STEEL, MUTED = "#f1f4f9", "#0e1520", "#334155", "#64748b", "#94a3b8"
TEAL, TEAL_D, TEAL_M = "#5eead4", "#0f3d37", "#14b8a6"
AMB, AMB_D = "#fbbf24", "#b45309"
WOOD, WOOD_D, TILE, TILE_D = "#c08457", "#8a5a34", "#f3e3c3", "#d9c49b"
MONO = "font-family:'Space Mono',monospace;font-weight:700"


def svg(vb, body, cls="", extra=""):
    return f'<svg class="{cls}" viewBox="{vb}" {extra} xmlns="http://www.w3.org/2000/svg">{body}</svg>'




def rack():
    """The wooden ledge the tiles stand on."""
    return svg("0 0 800 40", f'<path d="M0 8 H800 L786 40 H14 Z" fill="{WOOD}"/><rect x="0" y="0" width="800" height="10" rx="4" fill="{WOOD_D}"/>', "rk")


def clipboard():
    """Tally sheet header: a clip over the sheet's top edge."""
    return svg("0 0 120 60", f'<rect x="20" y="14" width="80" height="34" rx="10" fill="{STEEL}"/><rect x="42" y="4" width="36" height="22" rx="8" fill="none" stroke="{MUTED}" stroke-width="6"/>'
               f'<circle cx="60" cy="31" r="5" fill="{NAVY}"/>', "clip")


def stopwatch():
    return svg("0 0 64 64", f'<rect x="26" y="2" width="12" height="8" rx="2" fill="{MUTED}"/><path d="M48 12 L54 6" stroke="{MUTED}" stroke-width="5" stroke-linecap="round"/>'
               f'<circle cx="32" cy="36" r="24" fill="none" stroke="{INK}" stroke-width="5"/><path d="M32 36 V20" stroke="{AMB}" stroke-width="5" stroke-linecap="round"/>'
               f'<circle cx="32" cy="36" r="4" fill="{AMB}"/>', "ico")


def warehouse():
    return svg("0 0 120 100", f'<path d="M6 40 L60 8 L114 40 V96 H6 Z" fill="{SLATE}"/><path d="M6 40 L60 8 L114 40" stroke="{MUTED}" stroke-width="6" fill="none" stroke-linejoin="round"/>'
               f'<rect x="30" y="52" width="60" height="44" fill="{NAVY}"/>'
               + "".join(f'<path d="M30 {y} H90" stroke="{STEEL}" stroke-width="3"/>' for y in (62, 72, 82))
               + f'<rect x="50" y="24" width="20" height="14" rx="3" fill="{AMB}"/>', "wh")


def box(color=AMB, dark=AMB_D):
    return svg("0 0 80 80", f'<path d="M8 24 L40 10 L72 24 V62 L40 76 L8 62 Z" fill="{dark}"/><path d="M8 24 L40 38 L72 24 L40 10 Z" fill="{color}"/>'
               f'<path d="M40 38 V76" stroke="{NAVY}" stroke-width="2" opacity=".4"/><path d="M24 17 L56 31" stroke="{INK}" stroke-width="5" opacity=".7"/>', "bx")




def shh():
    """A speech bubble with a dotted line: JavaScript saying the wrong thing quietly."""
    return svg("0 0 64 64", f'<path d="M8 10 H56 V44 H30 L18 56 V44 H8 Z" fill="none" stroke="{AMB}" stroke-width="4" stroke-linejoin="round"/>'
               f'<text x="32" y="35" text-anchor="middle" style="{MONO};font-size:15px" fill="{AMB}">false</text>', "ico")


def buckets():
    body = ""
    for i, (x, dots) in enumerate([(4, 2), (24, 1), (44, 3)]):
        body += f'<path d="M{x} 26 H{x + 16} L{x + 14} 58 H{x + 2} Z" fill="{SLATE}" stroke="{TEAL}" stroke-width="2.5"/>'
        body += "".join(f'<circle cx="{x + 8}" cy="{52 - d * 9}" r="3.5" fill="{AMB}"/>' for d in range(dots))
        body += f'<text x="{x + 8}" y="18" text-anchor="middle" style="{MONO};font-size:12px" fill="{MUTED}">{"abé"[i]}</text>'  # any key, é included
    return svg("0 0 64 64", body, "ico")



