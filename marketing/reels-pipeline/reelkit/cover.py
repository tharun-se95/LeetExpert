"""A reel's cover.png: the hook as a headline, where Instagram's grid can see it.

  python3 cover.py "<hook with *key* words>" "<topic chip>" <still-name> [out.png]   # from a reel's sources/, after prep.sh

The profile grid shows the middle 1080x1350 of a 1080x1920 cover (y 285 to 1635), so the
brand, the headline and the tutor all sit inside that band. *Starred* words take the teal
accent. The page is rendered by `hyperframes snapshot`, the same browser the reel renders
in, so the fonts and colours match the reel exactly.
"""
import html, os, re, shutil, subprocess, sys, tempfile
from pathlib import Path

KIT = Path(__file__).resolve().parent
GRID_TOP, GRID_BOTTOM = 285, 1635


def page(hook, topic, still):
    words = html.escape(hook)
    words = re.sub(r"\*([^*]+)\*", r'<span class="teal">\1</span>', words)
    base = (KIT / "base.css").read_text()
    return f'''<!doctype html>
<html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=1080, height=1920" />
<title>cover</title><style>{base}
.top{{top:{GRID_TOP + 60}px}}
.hook{{position:absolute;left:80px;right:80px;top:{GRID_TOP + 190}px;font-size:116px;font-weight:700;line-height:1.04;letter-spacing:-.025em}}
.play{{display:block;margin-top:44px;font-family:"Space Mono",monospace;font-size:36px;font-weight:700;letter-spacing:0;color:#94a3b8}}
.cstill{{position:absolute;right:40px;bottom:{1920 - GRID_BOTTOM + 10}px;height:560px;width:auto}}
</style></head>
<body><div id="root" data-composition-id="main" data-start="0" data-width="1080" data-height="1920" data-duration="1">
<div class="top"><div class="brand">leetExpert<span class="dot"></span></div><div class="chip">{html.escape(topic)}</div></div>
<div class="hook">{words}<span class="play">▶ the interactive DSA course</span></div>
<img class="cstill" src="stills/{still}.png" alt="" />
</div></body></html>'''


def make(hook, topic, still, out="../cover.png"):
    assert os.path.exists(f"stills/{still}.png") and os.path.isdir("fonts"), "run reelkit/prep.sh first"
    with tempfile.TemporaryDirectory() as d:
        for f in ("fonts", "stills"):
            shutil.copytree(f, f"{d}/{f}")
        shutil.copy("hyperframes.json", d)
        Path(d, "index.html").write_text(page(hook, topic, still))
        subprocess.run(["npx", "-y", "hyperframes@0.8.77", "snapshot", "--at", "0.5", "--no-end", "-o", f"{d}/snap", d],
                       check=True, capture_output=True)
        shot = next(Path(d, "snap").glob("frame-*.png"))
        shutil.copy(shot, out)
    print(f"wrote {out}")


if __name__ == "__main__":
    make(*sys.argv[1:])
