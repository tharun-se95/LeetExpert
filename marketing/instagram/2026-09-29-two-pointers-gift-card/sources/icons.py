"""Illustrations for the gift-card reel: flat, two-tone SVG in the reel's palette.

Each function returns an <svg> string. Colour is the reel's dark palette (the
same hexes as style.css); nothing here is loaded at runtime.
"""
from math import cos, sin, pi

INK, NAVY, SLATE, STEEL, MUTED = "#f1f4f9", "#0e1520", "#334155", "#64748b", "#94a3b8"
TEAL, TEAL_D, TEAL_M = "#5eead4", "#0f3d37", "#14b8a6"
TEAL_INK = "#0f766e"  # teal text on the light receipt paper: 4.96:1 on #f1f4f9 (TEAL_M there was 2.26:1)
AMB, AMB_D = "#fbbf24", "#b45309"
VIO, VIO_D = "#c4b5fd", "#6d28d9"
PINK, SKIN, SKIN_D = "#f9a8d4", "#f5d0b0", "#d9a37f"
BROWN, CHOC = "#c08457", "#5b3a1e"
MONO = "font-family:'Space Mono',monospace;font-weight:700"


def svg(vb, body, cls="", extra=""):
    return f'<svg class="{cls}" viewBox="{vb}" {extra} xmlns="http://www.w3.org/2000/svg">{body}</svg>'


def _star(cx, cy, ro, ri, n=5):
    pts = []
    for i in range(2 * n):
        r = ro if i % 2 == 0 else ri
        a = -pi / 2 + i * pi / n
        pts.append(f"{cx + r * cos(a):.1f},{cy + r * sin(a):.1f}")
    return " ".join(pts)


# ---------------------------------------------------------------- menu items
def sticker():
    return svg("0 0 64 64", f'<polygon points="{_star(32, 34, 27, 12)}" fill="{INK}"/>'
               f'<polygon points="{_star(32, 34, 22, 9.5)}" fill="{AMB}"/>'
               f'<circle cx="52" cy="12" r="3" fill="{AMB}"/><circle cx="10" cy="16" r="2" fill="{INK}"/>')


def pencil():
    return svg("0 0 64 64", f'<g transform="rotate(-40 32 32)">'
               f'<rect x="14" y="25" width="30" height="14" fill="{AMB}"/><path d="M14 30 H44 M14 34 H44" stroke="{AMB_D}" stroke-width="1.5"/>'
               f'<rect x="44" y="25" width="5" height="14" fill="{MUTED}"/><rect x="49" y="25" width="8" height="14" rx="3" fill="{PINK}"/>'
               f'<polygon points="14,25 14,39 3,32" fill="{SKIN}"/><polygon points="7,29.8 7,34.2 3,32" fill="{SLATE}"/></g>')


def coffee():
    return svg("0 0 64 64", f'<path d="M24 12 q-4 -4 0 -9 M32 12 q-4 -4 0 -9 M40 12 q-4 -4 0 -9" stroke="{MUTED}" stroke-width="2.5" fill="none" stroke-linecap="round"/>'
               f'<rect x="12" y="15" width="40" height="8" rx="3" fill="#cbd5e1"/>'
               f'<path d="M15 23 H49 L45 56 Q44 60 40 60 H24 Q20 60 19 56 Z" fill="{INK}"/>'
               f'<path d="M17.4 34 H46.6 L45.3 45 H18.7 Z" fill="{TEAL}"/>')


def cookie():
    return svg("0 0 64 64", f'<path d="M50 14 A24 24 0 1 0 55 36 A8 8 0 0 1 50 14 Z" fill="{BROWN}"/>'
               + "".join(f'<ellipse cx="{x}" cy="{y}" rx="3.2" ry="2.6" fill="{CHOC}"/>' for x, y in [(22, 22), (34, 30), (20, 40), (32, 48), (44, 44), (38, 18)]))


def notebook():
    return svg("0 0 64 64", f'<rect x="16" y="6" width="36" height="52" rx="4" fill="{TEAL}"/><rect x="16" y="6" width="8" height="52" rx="3" fill="{TEAL_M}"/>'
               f'<rect x="30" y="16" width="16" height="9" rx="2" fill="{INK}"/>'
               + "".join(f'<rect x="10" y="{y}" width="12" height="4" rx="2" fill="{INK}"/>' for y in (13, 25, 37, 49)))


def book():
    return svg("0 0 64 64", f'<path d="M32 18 C24 12 12 12 3 15 V55 C12 52 24 52 32 58 C40 52 52 52 61 55 V15 C52 12 40 12 32 18 Z" fill="{VIO_D}"/>'
               f'<path d="M32 16 C25 10 14 10 7 12 V50 C14 48 25 48 32 54 Z" fill="{INK}"/><path d="M32 16 C39 10 50 10 57 12 V50 C50 48 39 48 32 54 Z" fill="#e2e8f0"/>'
               f'<path d="M12 22 C18 21 23 22 27 24 M12 30 C18 29 23 30 27 32 M37 24 C41 22 46 21 52 22 M37 32 C41 30 46 29 52 30" stroke="{MUTED}" stroke-width="2" fill="none"/>')


def headphones():
    return svg("0 0 64 64", f'<path d="M12 40 V32 A20 20 0 0 1 52 32 V40" stroke="{STEEL}" stroke-width="6" fill="none" stroke-linecap="round"/>'
               f'<rect x="5" y="34" width="15" height="23" rx="6" fill="{AMB}"/><rect x="44" y="34" width="15" height="23" rx="6" fill="{AMB}"/>'
               f'<rect x="16" y="38" width="5" height="15" rx="2" fill="{AMB_D}"/><rect x="43" y="38" width="5" height="15" rx="2" fill="{AMB_D}"/>')


ITEMS = {1: sticker, 3: pencil, 4: coffee, 5: cookie, 7: notebook, 8: book, 9: headphones}
NAMES = {1: "sticker", 3: "pencil", 4: "coffee", 5: "cookie", 7: "notebook", 8: "book", 9: "headphones"}


# ---------------------------------------------------------------- the analogy
def gift_card(amount, uid):
    """Card face with a ribbon and bow; text sits in HTML on top of it."""
    return svg("0 0 740 440", f'<defs><linearGradient id="gcg{uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{TEAL_D}"/><stop offset="1" stop-color="#12314a"/></linearGradient></defs>'
               f'<rect x="3" y="3" width="734" height="434" rx="36" fill="url(#gcg{uid})" stroke="{TEAL}" stroke-width="5"/>'
               f'<rect x="560" y="3" width="46" height="434" fill="{AMB}"/><rect x="560" y="3" width="10" height="434" fill="{AMB_D}" opacity=".45"/>'
               f'<path d="M583 92 C520 20 505 110 583 98 C661 110 646 20 583 92 Z" fill="{AMB}" stroke="{AMB_D}" stroke-width="4"/>'
               f'<path d="M583 98 L548 158 M583 98 L618 158" stroke="{AMB}" stroke-width="16" stroke-linecap="round"/>'
               f'<circle cx="583" cy="96" r="16" fill="{AMB_D}"/>'
               f'<circle cx="80" cy="370" r="10" fill="{TEAL}" opacity=".5"/><circle cx="110" cy="370" r="10" fill="{TEAL}" opacity=".3"/>', "gcsvg")


def cart(slots=2, fill=None):
    """A cart with `slots` dashed spaces, or filled with the given item icons."""
    body = (f'<path d="M6 12 H26 L40 80 H130 L146 30 H34" stroke="{MUTED}" stroke-width="7" fill="none" stroke-linejoin="round" stroke-linecap="round"/>'
            f'<circle cx="54" cy="98" r="9" fill="{MUTED}"/><circle cx="118" cy="98" r="9" fill="{MUTED}"/>')
    for i in range(slots):
        x = 46 + i * 46
        body += f'<rect x="{x}" y="36" width="38" height="38" rx="8" fill="none" stroke="{TEAL}" stroke-width="3" stroke-dasharray="6 5"/>'
    return svg("0 0 160 110", body, "cart")


def coins():
    return svg("0 0 80 80", "".join(f'<ellipse cx="40" cy="{62 - i * 10}" rx="26" ry="9" fill="{AMB if i % 2 else AMB_D}" stroke="{AMB_D}" stroke-width="2"/>' for i in range(4))
               + f'<ellipse cx="40" cy="22" rx="26" ry="9" fill="{AMB}"/><text x="40" y="27" text-anchor="middle" style="{MONO};font-size:14px" fill="{NAVY}">$</text>')


def hand(cuff, letter):
    """A hand pointing down, the reel's 'finger'. The cuff colour marks L or R."""
    return svg("0 0 64 112", f'<rect x="10" y="0" width="44" height="18" rx="5" fill="{cuff}"/>'
               f'<text x="32" y="14" text-anchor="middle" style="{MONO};font-size:14px" fill="{NAVY}">{letter}</text>'
               f'<rect x="12" y="15" width="40" height="36" rx="15" fill="{SKIN}"/>'
               f'<rect x="6" y="22" width="15" height="28" rx="7.5" fill="{SKIN}" stroke="{SKIN_D}" stroke-width="2" transform="rotate(-18 13 36)"/>'
               f'<path d="M20 26 H44 M20 36 H44" stroke="{SKIN_D}" stroke-width="2.5" stroke-linecap="round"/>'
               f'<rect x="25" y="38" width="15" height="68" rx="7.5" fill="{SKIN}"/>'
               f'<rect x="28.5" y="89" width="8" height="12" rx="4" fill="#fde9da"/>'
               f'<path d="M25 62 H40" stroke="{SKIN_D}" stroke-width="2" stroke-linecap="round"/>', "hand")


def balance():
    """Scale for the 'why': left pan ($1 + $9) rises, right pan ($15) sinks."""
    pan = lambda cx, fill, label, gid: (f'<g id="{gid}"><path d="M{cx} 46 L{cx - 38} 104 M{cx} 46 L{cx + 38} 104" stroke="{MUTED}" stroke-width="2.5"/>'
                                         f'<path d="M{cx - 46} 104 H{cx + 46} Q{cx + 40} 132 {cx} 132 Q{cx - 40} 132 {cx - 46} 104 Z" fill="{fill}"/>'
                                         f'<text x="{cx}" y="96" text-anchor="middle" style="{MONO};font-size:30px" fill="{INK}">{label}</text></g>')
    return svg("0 0 300 190", f'<rect x="144" y="40" width="12" height="130" rx="4" fill="{STEEL}"/><rect x="104" y="166" width="92" height="14" rx="7" fill="{STEEL}"/>'
               f'<g id="beam"><rect x="40" y="38" width="220" height="12" rx="6" fill="{MUTED}"/><circle cx="150" cy="44" r="11" fill="{AMB}"/></g>'
               + pan(50, AMB, "$10", "panL") + pan(250, TEAL, "$15", "panR"), "scale")


def receipt():
    zig = "".join(f"L{20 + i * 20} {228 if i % 2 else 218} " for i in range(1, 45))
    lines = [("notebook", "$7"), ("book", "$8")]
    text = "".join(f'<text x="40" y="{76 + i * 40}" style="{MONO};font-size:30px" fill="{NAVY}">{a}</text>'
                   f'<text x="600" y="{76 + i * 40}" text-anchor="end" style="{MONO};font-size:30px" fill="{NAVY}">{b}</text>' for i, (a, b) in enumerate(lines))
    return svg("0 0 920 232", f'<path d="M0 0 H920 V218 {zig} L0 218 Z" fill="{INK}"/>'
               f'<text x="40" y="34" style="{MONO};font-size:20px;letter-spacing:.2em" fill="{STEEL}">GIFT CARD RECEIPT</text>'
               f'{text}<path d="M40 136 H600" stroke="{STEEL}" stroke-width="2" stroke-dasharray="6 6"/>'
               f'<text x="40" y="180" style="{MONO};font-size:38px" fill="{NAVY}">TOTAL</text><text x="600" y="180" text-anchor="end" style="{MONO};font-size:38px" fill="{NAVY}">$15.00</text>'
               f'<g transform="rotate(-12 770 110)"><g id="paid"><rect x="660" y="70" width="220" height="80" rx="12" fill="none" stroke="{TEAL_INK}" stroke-width="6"/>'
               f'<text x="770" y="126" text-anchor="middle" style="{MONO};font-size:44px" fill="{TEAL_INK}">EXACT</text></g></g>', "rcpt")


def shelves():
    """1,000 items: a warehouse shelf unit."""
    body = f'<rect x="4" y="4" width="92" height="92" rx="6" fill="none" stroke="{STEEL}" stroke-width="4"/>'
    body += "".join(f'<path d="M4 {y} H96" stroke="{STEEL}" stroke-width="4"/>' for y in (34, 64))
    cols = [AMB, TEAL, VIO, BROWN, INK]
    for r, y in enumerate((12, 42, 72)):
        for c in range(5):
            body += f'<rect x="{10 + c * 17}" y="{y}" width="13" height="18" rx="2" fill="{cols[(r * 2 + c) % 5]}"/>'
    return svg("0 0 100 100", body, "ico")


def hourglass():
    return svg("0 0 64 80", f'<rect x="8" y="2" width="48" height="8" rx="3" fill="{STEEL}"/><rect x="8" y="70" width="48" height="8" rx="3" fill="{STEEL}"/>'
               f'<path d="M14 10 H50 Q50 30 34 40 Q50 50 50 70 H14 Q14 50 30 40 Q14 30 14 10 Z" fill="none" stroke="{MUTED}" stroke-width="3"/>'
               f'<path d="M20 16 H44 Q42 28 32 36 Q22 28 20 16 Z" fill="{AMB}"/><path d="M18 68 Q22 56 32 52 Q42 56 46 68 Z" fill="{AMB}"/>'
               f'<path d="M32 38 V52" stroke="{AMB}" stroke-width="2.5"/>', "ico")


# ---------------------------------------------------------------- systems
def database(color):
    return svg("0 0 64 72", f'<path d="M6 12 V58 A26 10 0 0 0 58 58 V12" fill="{SLATE}"/>'
               + "".join(f'<path d="M6 {y} A26 10 0 0 0 58 {y}" fill="none" stroke="{color}" stroke-width="3"/>' for y in (28, 43, 58))
               + f'<ellipse cx="32" cy="12" rx="26" ry="10" fill="{color}"/>'
               f'<circle cx="46" cy="36" r="2.5" fill="{color}"/><circle cx="46" cy="51" r="2.5" fill="{color}"/>', "dbi")


def server():
    body = "".join(f'<rect x="6" y="{y}" width="52" height="16" rx="4" fill="{SLATE}"/><circle cx="16" cy="{y + 8}" r="3" fill="{TEAL}"/>'
                   f'<path d="M26 {y + 8} H50" stroke="{STEEL}" stroke-width="3" stroke-linecap="round"/>' for y in (4, 24, 44))
    return svg("0 0 64 64", body, "ico")


def no_loop():
    return svg("0 0 64 64", f'<path d="M44 20 A16 16 0 1 0 48 36" stroke="{MUTED}" stroke-width="5" fill="none" stroke-linecap="round"/>'
               f'<path d="M36 14 L46 20 L40 30" stroke="{MUTED}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
               f'<path d="M8 56 L56 8" stroke="{AMB}" stroke-width="6" stroke-linecap="round"/>', "ico")


def sort_bars():
    return svg("0 0 64 64", "".join(f'<rect x="{6 + i * 13}" y="{52 - h}" width="10" height="{h}" rx="2" fill="{TEAL}"/>' for i, h in enumerate((10, 20, 30, 40)))
               + f'<path d="M6 60 H58" stroke="{MUTED}" stroke-width="3"/>', "ico")


def buckets():
    body = ""
    for i, (x, dots) in enumerate([(4, 2), (24, 1), (44, 3)]):
        body += f'<path d="M{x} 26 H{x + 16} L{x + 14} 58 H{x + 2} Z" fill="{SLATE}" stroke="{TEAL}" stroke-width="2.5"/>'
        body += "".join(f'<circle cx="{x + 8}" cy="{52 - d * 9}" r="3.5" fill="{AMB}"/>' for d in range(dots))
        body += f'<text x="{x + 8}" y="18" text-anchor="middle" style="{MONO};font-size:12px" fill="{MUTED}">{i}</text>'
    return svg("0 0 64 64", body, "ico")


def mic():
    return svg("0 0 64 64", f'<rect x="22" y="4" width="20" height="34" rx="10" fill="{AMB}"/><path d="M26 14 H38 M26 22 H38" stroke="{AMB_D}" stroke-width="2.5"/>'
               f'<path d="M14 28 A18 18 0 0 0 50 28" stroke="{MUTED}" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M32 46 V58 M22 58 H42" stroke="{MUTED}" stroke-width="4" stroke-linecap="round"/>', "ico")


def question():
    return svg("0 0 64 64", f'<path d="M8 10 H56 V44 H30 L18 56 V44 H8 Z" fill="{TEAL}" stroke-linejoin="round"/>'
               f'<text x="32" y="38" text-anchor="middle" style="{MONO};font-size:30px" fill="{NAVY}">?</text>', "ico")


def clock():
    return svg("0 0 32 32", f'<circle cx="16" cy="16" r="12" fill="none" stroke="{NAVY}" stroke-width="3"/><path d="M16 9 V16 L21 19" stroke="{NAVY}" stroke-width="3" fill="none" stroke-linecap="round"/>', "bico")


def chip():
    return svg("0 0 32 32", f'<rect x="8" y="8" width="16" height="16" rx="3" fill="none" stroke="{NAVY}" stroke-width="3"/>'
               + "".join(f'<path d="M{a}" stroke="{NAVY}" stroke-width="2.5" stroke-linecap="round"/>' for a in
                         ("12 3 V8", "20 3 V8", "12 24 V29", "20 24 V29", "3 12 H8", "3 20 H8", "24 12 H29", "24 20 H29")), "bico")
