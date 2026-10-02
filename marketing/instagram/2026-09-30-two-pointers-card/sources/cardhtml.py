"""The two-pointers cheatsheet card, drawn from sheet.json (the product's own gold.ts content).

Used twice: inside the reel (gen.py) and as the single-image post (card.py renders card.png).
"""
import html
import json
from pathlib import Path

DATA = json.loads((Path(__file__).resolve().parent / "sheet.json").read_text())
SHEET, COUNTS = DATA["sheet"], DATA["counts"]
e = html.escape


def card(prefix="k"):
    """The card's markup. `prefix` keeps element ids unique when it appears twice in one page."""
    smells = "".join(f'<div class="tpc-row" id="{prefix}sm{j}"><span class="s">{e(s["smell"])}</span><span class="a">→</span><span class="p">{e(s["pattern"])}</span></div>'
                     for j, s in enumerate(SHEET["smells"]))
    note = lambda c: f'<small>{e(c["note"])}</small>' if c.get("note") else ""
    cx = "".join(f'<div class="tpc-cx"><span class="l">{e(c["label"])}{note(c)}</span><span class="t">{e(c["time"])}</span><span class="m">{e(c["space"])}</span></div>'
                 for c in SHEET["complexity"])
    traps = "".join(f'<div class="tpc-trap {t["tone"]}"><b>{e(t["title"])}</b><span>{e(t["detail"])}</span></div>' for t in SHEET["traps"])
    return (f'<div class="tpc"><div class="tpc-top"><span class="tpc-k">CHEATSHEET</span><span class="tpc-brand">leetExpert<i></i></span></div>'
            f'<div class="tpc-t">Two pointers</div><div class="tpc-tag">{e(SHEET["tagline"])}</div>'
            f'<div class="tpc-sec">Smell → pattern</div>{smells}'
            f'<div class="tpc-sec">Targets <span>time · extra space</span></div>{cx}'
            f'<div class="tpc-sec">Traps</div>{traps}</div>')


CARD_CSS = """
.tpc{width:920px;background:#0e1520;border:2px solid #263248;border-radius:26px;padding:30px 34px;font-family:"Space Grotesk",sans-serif;color:#f1f4f9}
.tpc-top{display:flex;justify-content:space-between;align-items:center}
.tpc-k{font-family:"Space Mono",monospace;font-size:22px;font-weight:700;letter-spacing:.18em;color:#5eead4}
.tpc-brand{display:flex;align-items:center;gap:8px;font-size:24px;font-weight:700}.tpc-brand i{width:12px;height:12px;border-radius:50%;background:#3fae5a;display:block}
.tpc-t{font-family:"Space Mono",monospace;font-size:52px;font-weight:700;margin-top:6px}
.tpc-tag{font-size:26px;color:#cbd5e1;margin-top:2px}
.tpc-sec{font-family:"Space Mono",monospace;font-size:22px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#94a3b8;margin:20px 0 8px;display:flex;gap:14px;align-items:baseline}
.tpc-sec span{text-transform:none;letter-spacing:0;font-size:20px}
.tpc-row{display:grid;grid-template-columns:1fr 30px 330px;align-items:center;padding:7px 0;border-top:1px solid #1c2838;font-size:25px}
.tpc-row .a{color:#94a3b8}.tpc-row .p{font-weight:700;color:#5eead4}
.tpc-cx{display:grid;grid-template-columns:1fr 150px 110px;padding:5px 0;font-size:24px}
.tpc-cx small{display:block;font-size:19px;color:#94a3b8}
.tpc-cx .t,.tpc-cx .m{font-family:"Space Mono",monospace;font-weight:700;color:#5eead4}
.tpc-trap{border-left:5px solid #fbbf24;padding:6px 14px;margin-top:10px;display:flex;flex-direction:column;gap:2px}
.tpc-trap b{font-size:25px}.tpc-trap span{font-size:21px;color:#cbd5e1;line-height:1.3}
"""
