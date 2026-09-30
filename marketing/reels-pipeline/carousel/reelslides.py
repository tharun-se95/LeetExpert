"""Carousel versions of the narrated reels (#134), for people who save rather than watch.

A carousel lives beside its reel as marketing/instagram/<DATE>-<slug>-carousel/ and is described
by its sources/slides.json:

  {"reel": "2026-09-29-anagram-tally",
   "slides": [{"at": "<anchor in the reel's timing.json>", "dt": 1.5, "zoom": [x, y, w, h] (optional),
               "text": "<words from the reel's script or caption>", "alt": "<what the frame shows>"},
              {"say": "<a text-only slide, also from script or caption>", "alt": "..."}],
   "challenge": "<the reel's own challenge line>"}

Slide 1 is the reel's cover (its grid-safe band is already 1080x1350); each "at" slide is the
reel's own frame at that moment, rendered with the captions and tutor off and cropped to what
is on the stage; then the challenge and a close. Every word set on a slide must appear in the
reel's script.txt or post.md caption, which its verify.py/verify.mjs already hold to the
code: a carousel restates the reel, it never makes a new claim.

  python3 reelslides.py <carousel dir> [--snap]    # --snap re-renders the reel's frames
  node render.mjs <slug>-carousel                   # then the slide PNGs, failing on overflow
"""
import html
import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

from PIL import Image

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
IG = ROOT / "marketing/instagram"
KIT = ROOT / "marketing/reels-pipeline/reelkit"
FONTS = (ROOT / "web/lesson-artifacts/fonts").as_uri()
e = html.escape

GRID_TOP, GRID_BOTTOM = 285, 1635  # the cover's profile-grid band (reelkit/cover.py)
STAGE_TOP, STAGE_BOTTOM = 320, 1250  # under the reel's top bar (base.css .top, top 250px), above its caption zone (reel.py CAP_TOP)
PAPER = [(0x16, 0x20, 0x2E), (0x1C, 0x28, 0x38)]  # the reel's ground and its grid lines

CSS = f"""
@font-face{{font-family:"Space Grotesk";src:url("{FONTS}/SpaceGrotesk-latin-V8mDoQDjQS.woff2");font-weight:300 700}}
@font-face{{font-family:"Space Mono";src:url("{FONTS}/SpaceMono-latin-i7dPIFZifj.woff2");font-weight:400}}
@font-face{{font-family:"Space Mono";src:url("{FONTS}/SpaceMono-latin-i7dMIFZifj.woff2");font-weight:700}}
*{{margin:0;padding:0;box-sizing:border-box}}
html,body{{width:1080px;height:1350px;overflow:hidden;background:#16202e;font-family:"Space Grotesk",sans-serif;color:#f1f4f9}}
body{{background-image:linear-gradient(#1c2838 1px,transparent 1px),linear-gradient(90deg,#1c2838 1px,transparent 1px);background-size:90px 90px}}
.top{{position:absolute;left:60px;right:60px;top:48px;height:64px;display:flex;justify-content:space-between;align-items:center}}
.brand{{display:flex;align-items:center;gap:12px;font-size:40px;font-weight:700}}.brand i{{width:18px;height:18px;border-radius:50%;background:#3fae5a;display:block}}
.n{{font-family:"Space Mono",monospace;font-size:26px;font-weight:700;color:#94a3b8}}
.content{{position:absolute;left:60px;right:60px;top:150px;bottom:110px;overflow:hidden;display:flex;flex-direction:column;justify-content:center;gap:40px}}
.foot{{position:absolute;left:60px;right:60px;bottom:40px;display:flex;justify-content:space-between;font-family:"Space Mono",monospace;font-size:24px;font-weight:700;color:#94a3b8}}
.fig{{flex:0 1 auto;min-height:0;display:flex;justify-content:center}}
.fig img{{display:block;max-width:100%;max-height:100%;object-fit:contain;border:2px solid #263248;border-radius:22px;background:#16202e}}
.txt{{flex:none;font-size:42px;line-height:1.3;font-weight:500}}
.say{{font-size:58px;line-height:1.25;font-weight:700}}
.k{{font-family:"Space Mono",monospace;font-size:26px;font-weight:700;letter-spacing:.18em;color:#5eead4}}
.cover{{position:absolute;inset:0}}.cover img{{display:block;width:1080px;height:1350px}}
.where{{font-family:"Space Mono",monospace;font-size:34px;font-weight:700;color:#0e1520;background:#5eead4;border-radius:12px;padding:14px 22px;align-self:flex-start}}
"""


def norm(s):
    return re.sub(r"\s+", " ", s).strip()


def section(md, name):
    return re.search(rf"^## {re.escape(name)}[^\n]*\n\n(.*?)(?=\n## |\Z)", md, re.S | re.M).group(1).strip()


def load(car):
    spec = json.loads((car / "sources/slides.json").read_text())
    reel = IG / spec["reel"]
    md = (reel / "post.md").read_text()
    sources = [norm((reel / "sources/script.txt").read_text()), norm(section(md, "Caption"))]
    for s in spec["slides"] + [{"say": spec["challenge"]}]:
        words = s.get("text") or s.get("say")
        assert any(norm(words) in src for src in sources), f"not said in the reel's script or caption: {words!r}"
    anchors = json.loads((reel / "sources/timing.json").read_text())["A"]
    shots = [[round(anchors[s["at"]] + s.get("dt", 0), 2), s.get("zoom")] for s in spec["slides"] if "at" in s]
    assert all(t < json.loads((reel / "sources/timing.json").read_text())["END"] for t, _ in shots)
    return spec, reel, md, shots


def snap(reel, shots, out):
    """The reel's frames, captions and tutor off, as out/NN.png: one per (time, zoom) in `shots`.

    A zoom is a region of the 1080x1920 frame, rendered at twice the density by hyperframes'
    own --zoom, for footage the reel shows too small to read on a still (the coach's replies).
    """
    src = reel / "sources"
    subprocess.run(["bash", str(KIT / "prep.sh")], cwd=src, check=True, capture_output=True)
    subprocess.run([sys.executable, "gen.py"], cwd=src, check=True, capture_output=True,
                   env={**os.environ, "PYTHONDONTWRITEBYTECODE": "1"})
    proj = out / "proj"
    shutil.rmtree(out, ignore_errors=True)
    shutil.copytree(src, proj)
    page = (proj / "index.html").read_text()
    (proj / "index.html").write_text(page.replace("</head>", "<style>#caps,#tutorwrap{display:none!important}</style></head>", 1))

    def run(times, zoom, dest):
        extra = ["--zoom", ",".join(map(str, zoom)), "--zoom-scale", "2"] if zoom else []
        shutil.rmtree(out / "raw", ignore_errors=True)
        subprocess.run(["npx", "-y", "hyperframes@0.8.77", "snapshot", "--at", ",".join(map(str, times)), "--no-end",
                        "--describe", "false", *extra, "-o", str(out / "raw"), "."], cwd=proj, check=True, capture_output=True)
        raw = sorted((out / "raw").glob("frame-*.png"))
        assert len(raw) == len(times), f"{len(raw)} frames for {len(times)} times"
        for f, i in zip(raw, dest):
            f.rename(out / f"{i:02d}.png")

    plain = [i for i, (_, z) in enumerate(shots) if not z]
    run([shots[i][0] for i in plain], None, plain)
    for i, (t, z) in enumerate(shots):
        if z:
            run([t], z, [i])
    shutil.rmtree(out / "raw", ignore_errors=True)
    shutil.rmtree(proj)
    (out / "shots.json").write_text(json.dumps(shots))


def crop(path, dest):
    """The stage band, trimmed to the rows that carry something other than the reel's paper."""
    im = Image.open(path).convert("RGB")
    assert im.size == (1080, 1920), f"{path} is {im.size}, not a 1080x1920 reel frame"
    band = im.crop((0, STAGE_TOP, 1080, STAGE_BOTTOM))
    px = band.load()
    rows = [y for y in range(band.height)
            if any(min(sum(abs(a - b) for a, b in zip(px[x, y], p)) for p in PAPER) > 20 for x in range(0, 1080, 3))]
    assert rows, f"{path}: the stage is empty at that moment"
    top, bottom = max(rows[0] - 30, 0), min(rows[-1] + 30, band.height)
    band.crop((0, top, 1080, bottom)).save(dest)


def cap(words):
    """The reel's words, capitalised because they now start a slide (the check compares them as written)."""
    return words[0].upper() + words[1:]


def page(n, total, body):
    """Slide 1 is the reel's cover, whole; the rest carry the brand, a counter and a foot."""
    last = n == total
    head = "" if n == 1 else f'<div class="top"><div class="brand">leetExpert<i></i></div><div class="n">{n} / {total}</div></div>'
    foot = "" if n == 1 else (f'<div class="foot"><span>{"leetexpert.com" if last else "swipe for the next step"}</span>'
                              f'<span>{"link in bio" if last else "swipe →"}</span></div>')
    return (f'<!doctype html><html lang="en"><head><meta charset="UTF-8"/><title>slide {n}</title><style>{CSS}</style></head>'
            f'<body>{head}{body}{foot}</body></html>')


def build(car, snap_frames=False):
    spec, reel, md, shots = load(car)
    name = car.name
    d = HERE / "build" / name
    frames = HERE / "build" / "_frames" / name
    done = frames / "shots.json"
    if snap_frames or not done.exists() or json.loads(done.read_text()) != shots:
        snap(reel, shots, frames)
    for f in d.glob("*"):
        f.unlink()
    d.mkdir(parents=True, exist_ok=True)
    (d / "target").write_text(str(car.relative_to(ROOT)))
    cover = Image.open(reel / "cover.png").convert("RGB")
    assert cover.size == (1080, 1920)
    cover.crop((0, GRID_TOP, 1080, GRID_BOTTOM)).save(d / "cover.png")
    bodies, alts = [('<div class="cover"><img src="cover.png" alt=""></div>', None)], [section(md, "Hook")]
    fi = 0
    for s in spec["slides"]:
        if "at" in s:
            if s.get("zoom"):
                shutil.copy(frames / f"{fi:02d}.png", d / f"f{fi}.png")
            else:
                crop(frames / f"{fi:02d}.png", d / f"f{fi}.png")
            bodies.append((f'<div class="content"><div class="fig"><img src="f{fi}.png" alt=""></div>'
                           f'<div class="txt">{e(cap(s["text"]))}</div></div>', None))
            fi += 1
        else:
            bodies.append((f'<div class="content"><div class="say">{e(cap(s["say"]))}</div></div>', None))
        alts.append(s["alt"])
    ask = cap(spec["challenge"])
    bodies.append((f'<div class="content"><div class="k">YOUR TURN</div><div class="say">{e(ask)}</div></div>', None))
    alts.append(f'A text slide under "Your turn": {ask}')
    bodies.append(('<div class="content"><div class="k">WATCH IT MOVE</div>'
                   '<div class="say">Every step of this, visualised, in leetExpert: the interactive DSA course.</div>'
                   '<div class="where">leetexpert.com · link in bio</div></div>', None))
    alts.append("Closing slide: every step of this, visualised, in leetExpert, the interactive DSA course. leetexpert.com, link in bio.")
    total = len(bodies)
    assert 5 <= total <= 10, f"{total} slides; the carousel template is 5-10"
    for n, (body, _) in enumerate(bodies, 1):
        (d / f"slide{n}.html").write_text(page(n, total, body))
    return post_md(spec, reel, md, alts, total)


def post_md(spec, reel, md, alts, total):
    title = md.splitlines()[0].lstrip("# ").strip()
    alt = "\n\n".join(f"**Slide {i}.** {a}" for i, a in enumerate(alts, 1))
    return f"""# {title} (carousel)

- **Account:** leetexpert
- **Archetype:** the reel as a carousel, for people who save rather than watch
- **Source:** the reel `{reel.name}`: its cover, its own frames (captions and tutor off) at the anchors in `sources/slides.json`, and words from its script and caption
- **Format:** Carousel, {total} slides, 1080×1350
- **Plan:** issue #134 (epic #132)
- **Status:** rendered, not scheduled.
- **Media:** {", ".join(f"`slide{i}.png`" for i in range(1, total + 1))}

## Hook (first line — all most people read)

{section(md, "Hook")}

## Caption

{section(md, "Caption")}

## Hashtags

{section(md, "Hashtags")}

## Alt text (per slide)

{alt}

## Verified facts

- Every word on a slide is in the reel's `script.txt` or caption (`reelslides.py` fails otherwise), and those are held to the code by the reel's `verify.py` and `verify.mjs`. The frames are the reel's own render at those moments, so the stage shows what the reel's code did.
- `render.mjs` fails if any slide's text leaves its frame.

## Sources

`sources/slides.json` (the slides), built by `marketing/reels-pipeline/carousel/reelslides.py`; see its README.
"""


if __name__ == "__main__":
    car = Path(sys.argv[1]).resolve()
    md = build(car, "--snap" in sys.argv)
    (car / "post.md").write_text(md)
    print(car.name, "built")
