"""Renders the single-image post: card.html (1080x1350) and, via render_card.mjs, ../card.png.

Run after reelkit/prep.sh (it needs fonts/):  python3 card.py && node render_card.mjs
"""
from pathlib import Path
from cardhtml import card, CARD_CSS, COUNTS

page = f"""<!doctype html><html lang="en"><head><meta charset="UTF-8"/><title>Two pointers cheatsheet</title><style>
@font-face{{font-family:"Space Grotesk";src:url("fonts/SpaceGrotesk.woff2");font-weight:300 700}}
@font-face{{font-family:"Space Mono";src:url("fonts/SpaceMono-400.woff2");font-weight:400}}
@font-face{{font-family:"Space Mono";src:url("fonts/SpaceMono-700.woff2");font-weight:700}}
*{{margin:0;padding:0;box-sizing:border-box}}
html,body{{width:1080px;height:1350px;overflow:hidden;background:#16202e;font-family:"Space Grotesk",sans-serif;color:#f1f4f9}}
body{{background-image:linear-gradient(#1c2838 1px,transparent 1px),linear-gradient(90deg,#1c2838 1px,transparent 1px);background-size:90px 90px}}
.top{{position:absolute;left:60px;right:60px;top:48px;display:flex;justify-content:space-between;align-items:center}}
.brand{{display:flex;align-items:center;gap:12px;font-size:40px;font-weight:700}}.brand i{{width:18px;height:18px;border-radius:50%;background:#3fae5a;display:block}}
.save{{font-family:"Space Mono",monospace;font-size:28px;font-weight:700;color:#0e1520;background:#5eead4;padding:8px 18px;border-radius:10px}}
.wrap{{position:absolute;left:50%;top:140px;transform:translateX(-50%) scale(1.04);transform-origin:50% 0}}
.foot{{position:absolute;left:60px;right:60px;bottom:44px;display:flex;justify-content:space-between;font-family:"Space Mono",monospace;font-size:24px;font-weight:700;color:#94a3b8}}
{CARD_CSS}
</style></head><body>
<div class="top"><div class="brand">leetExpert<i></i></div><div class="save">Save this</div></div>
<div class="wrap">{card("s")}</div>
<div class="foot"><span>{COUNTS["cheatsheets"]} cheatsheets · Recall</span><span>link in bio</span></div>
</body></html>"""
Path("card.html").write_text(page)
print("card.html written")
