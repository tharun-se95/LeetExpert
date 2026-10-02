"""Illustrations for the remove-while-iterating reel, in the reel palette."""

INK, NAVY, SLATE, STEEL, MUTED = "#f1f4f9", "#0e1520", "#334155", "#64748b", "#94a3b8"
TEAL, AMB = "#5eead4", "#fbbf24"


def svg(vb, body, cls="", extra=""):
    return f'<svg class="{cls}" viewBox="{vb}" {extra} xmlns="http://www.w3.org/2000/svg">{body}</svg>'


def seat():
    """A cinema seat seen from the front; the passenger token sits on it."""
    return svg("0 0 180 200", f'<rect x="20" y="10" width="140" height="130" rx="26" fill="{SLATE}"/>'
               f'<rect x="8" y="110" width="28" height="70" rx="12" fill="{STEEL}"/><rect x="144" y="110" width="28" height="70" rx="12" fill="{STEEL}"/>'
               f'<rect x="30" y="128" width="120" height="44" rx="14" fill="{STEEL}"/><rect x="50" y="172" width="12" height="24" fill="{SLATE}"/><rect x="118" y="172" width="12" height="24" fill="{SLATE}"/>', "seat")


def finger():
    """The loop's hidden index, drawn as a pointing hand with an 'i' cuff."""
    return svg("0 0 64 112", f'<rect x="10" y="0" width="44" height="18" rx="5" fill="{TEAL}"/>'
               f'<text x="32" y="14" text-anchor="middle" style="font-family:\'Space Mono\',monospace;font-weight:700;font-size:14px" fill="{NAVY}">i</text>'
               f'<rect x="12" y="15" width="40" height="36" rx="15" fill="#f5d0b0"/>'
               f'<rect x="6" y="22" width="15" height="28" rx="7.5" fill="#f5d0b0" stroke="#d9a37f" stroke-width="2" transform="rotate(-18 13 36)"/>'
               f'<path d="M20 26 H44 M20 36 H44" stroke="#d9a37f" stroke-width="2.5" stroke-linecap="round"/>'
               f'<rect x="25" y="38" width="15" height="68" rx="7.5" fill="#f5d0b0"/><rect x="28.5" y="89" width="8" height="12" rx="4" fill="#fde9da"/>', "fing")


def silent_skip():
    """No error shown: a list icon with a skipped row."""
    return svg("0 0 64 64", "".join(f'<rect x="8" y="{y}" width="48" height="10" rx="4" fill="{SLATE if i != 1 else "none"}" stroke="{AMB if i == 1 else "none"}" stroke-width="2.5" stroke-dasharray="{"5 4" if i == 1 else "0"}"/>'
                                    for i, y in enumerate((10, 27, 44))), "ico")
