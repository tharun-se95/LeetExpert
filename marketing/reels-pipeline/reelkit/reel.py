"""The shared reel engine: word anchors, seek-safe GSAP tracks, tutor stills,
captions, the brand chrome and lockup, and a code walkthrough.

A reel's gen.py builds one Reel, anchors its scenes to spoken words, adds its
own markup and tracks, and calls write(). Every element gets ONE keyframed
track (HyperFrames renders non-linearly; several tweens on one property of one
element broke that), and write() refuses a track whose keyframes overlap,
since GSAP would shift the later one off its word.

Timings come from words.json: Scribe's word timestamps for the recorded take,
or est_words.py's stand-in for a silent preview.
"""
import html, json, os, re, subprocess, sys
from pathlib import Path

KIT = Path(__file__).resolve().parent
sys.path.insert(0, str(KIT))
import kiticons as KI  # noqa: E402

# the reel palette (dark); style sheets use the same hexes
INK, NAVY, PANEL, RULE, MUTED = "#f1f4f9", "#0e1520", "#0e1520", "#263248", "#94a3b8"
TEAL, TEAL_D, AMB = "#5eead4", "#0f3d37", "#fbbf24"


def _duration(path):
    # ffprobe is not always installed; ffmpeg's banner carries the duration too
    try:
        return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path]))
    except FileNotFoundError:
        out = subprocess.run([os.environ.get("FFMPEG", "ffmpeg"), "-i", path], capture_output=True, text=True).stderr
        h, m, s = re.search(r"Duration: (\d+):(\d+):([\d.]+)", out).groups()
        return int(h) * 3600 + int(m) * 60 + float(s)


def norm(t):
    return re.sub(r"[^a-z0-9'\-]", "", t.lower()).strip("'-")


def forms(t):
    n = norm(t)
    return {n, n.replace("'", ""), *n.split("-")}


# ---------------------------------------------------------------- code highlighting
_KW = {
    "python": "def return if elif else for while in not and or is None True False import from as class lambda pass break continue with yield",
    "javascript": "function return if else for while of in let const var new null undefined true false class break continue typeof",
}
_TOKEN = re.compile(r"(?P<com>#.*|//.*)|(?P<str>\"[^\"]*\"|'[^']*')|(?P<num>\b\d[\d_]*(?:\.\d+)?\b)|(?P<word>[A-Za-z_]\w*)|(?P<other>.)")


def highlight(line, lang):
    """One source line as coloured spans. Colours match the site's dark code well."""
    kws = set(_KW[lang].split())
    out = []
    for m in _TOKEN.finditer(line):
        kind, text = m.lastgroup, m.group()
        esc = html.escape(text)
        if kind == "com":
            out.append(f'<span class="tc">{esc}</span>')
        elif kind == "str":
            out.append(f'<span class="ts">{esc}</span>')
        elif kind == "num":
            out.append(f'<span class="tn">{esc}</span>')
        elif kind == "word" and text in kws:
            out.append(f'<span class="tk">{esc}</span>')
        elif kind == "word" and line[m.end():m.end() + 1] == "(":
            out.append(f'<span class="tf">{esc}</span>')
        else:
            out.append(esc)
    return "".join(out) or "&nbsp;"


class Reel:
    def __init__(self, title, topic, lead=0.3):
        self.title, self.topic, self.lead = title, topic, lead
        self.W = json.load(open("words.json"))
        self.has_vo = os.path.exists("vo.mp3")
        self.K = {}
        self.A = {}
        self.parts = []
        self.css = []
        self.END = self.RESET = None

    # ---------------------------------------------------------------- anchors
    def at(self, alts, after=0.0, end=False):
        """Timeline time of the first word matching any of `alts` at or after `after`."""
        alts = [alts] if isinstance(alts, str) else alts
        for x in self.W:
            if self.lead + x["s"] >= after and forms(x["t"]) & set(alts):
                return round(self.lead + (x["e"] if end else x["s"]), 2)
        sys.exit(f"anchor not found: {alts} after {after}")

    def anchor(self, name, alts, after=None, end=False):
        """Adds A[name]; `after` is another anchor's name, or defaults to the last anchor added."""
        if after is None:
            after = list(self.A.values())[-1] if self.A else 0.0
        elif isinstance(after, str):
            after = self.A[after]
        self.A[name] = self.at(alts, after, end)
        return self.A[name]

    def close(self, tail=2.4):
        """Call once every anchor is in: checks their order, sets END and RESET (the loop point)."""
        order = list(self.A.values())
        bad = [(a, b) for (a, ta), (b, tb) in zip(self.A.items(), list(self.A.items())[1:]) if tb < ta]
        assert order == sorted(order), f"anchors out of narrative order: {bad}"
        self.END = round(self.A["bio"] + tail, 2)
        self.RESET = self.END - 0.5  # the last half second returns to frame 1 so the reel loops

    # ---------------------------------------------------------------- tracks
    def k(self, sel, t, props, d=0.3, e="power2.out"):
        self.K.setdefault(sel, {"init": {}, "pts": []})["pts"].append([round(t, 3), props, d, e])

    def init(self, sel, **props):
        self.K.setdefault(sel, {"init": {}, "pts": []})["init"].update(props)

    def show(self, sel, t0, t1, y=16, d=0.28):
        self.init(sel, autoAlpha=0, y=y)
        self.k(sel, t0, {"autoAlpha": 1, "y": 0}, d, "power3.out")
        self.k(sel, t1 - 0.2, {"autoAlpha": 0, "y": -y}, 0.2, "power1.in")

    def pop(self, sel, t, d=0.35):
        self.init(sel, autoAlpha=0, scale=0.7)
        self.k(sel, t, {"autoAlpha": 1, "scale": 1}, d, "back.out(2.2)")

    def swap(self, sels_times, t_end=None):
        """Shows each element from its time until the next one's (a cross-cut sequence)."""
        for j, (sel, t) in enumerate(sels_times):
            nxt = sels_times[j + 1][1] if j + 1 < len(sels_times) else t_end
            self.init(sel, autoAlpha=0)
            self.k(sel, t, {"autoAlpha": 1}, 0.12, "none")
            if nxt is not None:
                self.k(sel, nxt, {"autoAlpha": 0}, 0.08, "none")

    @staticmethod
    def spread(t0, t1, n):
        step = (t1 - t0) / n
        return [round(t0 + i * step, 3) for i in range(n)]

    def add(self, markup):
        self.parts.append(markup)

    # ---------------------------------------------------------------- code walkthrough
    def code(self, cid, src, steps, t0, t1, lang="python", top=360, note_top=None, label=None, font=32):
        """A code card that explains itself line by line.

        `src` is the exact source a verifier executes (read it from the file the
        verifier imports, never retype it). `steps` is [(time, line_numbers, note_html)]:
        at each time the highlight moves to those 1-based lines and the note under
        the card changes. The card shows from t0 to t1.
        """
        lines = src.rstrip("\n").split("\n")
        lh = round(font * 1.62)
        card_h = 70 + len(lines) * lh + 30
        note_top = note_top or top + card_h + 18
        rows = "".join(f'<div class="cl" style="height:{lh}px;line-height:{lh}px"><span class="cn">{i + 1}</span><span class="cx">{highlight(l, lang)}</span></div>'
                       for i, l in enumerate(lines))
        notes = "".join(f'<div class="cnote" id="{cid}-n{j}">{n}</div>' for j, (_, _, n) in enumerate(steps))
        lbl = label or ("python" if lang == "python" else "javascript")
        self.add(f'<div class="codecard" id="{cid}" data-layout-allow-overlap style="top:{top}px;height:{card_h}px;font-size:{font}px">'
                 f'<div class="chd"><i></i><i></i><i></i><span>{html.escape(lbl)}</span></div>'
                 f'<div class="cbody" data-layout-allow-overlap><div class="chl" id="{cid}-hl" style="height:{lh}px"></div>{rows}</div></div>'
                 f'<div class="cnotes" id="{cid}-notes" data-layout-allow-overlap style="top:{note_top}px">{notes}</div>')
        self.show(f"#{cid}", t0, t1, y=20)
        self.show(f"#{cid}-notes", t0, t1, y=12)
        # the highlight: one track, moved and resized per step
        first = steps[0]
        self.init(f"#{cid}-hl", autoAlpha=0, y=(min(first[1]) - 1) * lh, scaleY=1)
        self.k(f"#{cid}-hl", first[0], {"autoAlpha": 1}, 0.2)
        for t, ln, _ in steps[1:]:
            self.k(f"#{cid}-hl", t, {"y": (min(ln) - 1) * lh, "height": (max(ln) - min(ln) + 1) * lh}, 0.3, "power3.inOut")
        self.init(f"#{cid}-hl", height=(max(first[1]) - min(first[1]) + 1) * lh)
        self.swap([(f"#{cid}-n{j}", t) for j, (t, _, _) in enumerate(steps)], t1 - 0.2)

    # ---------------------------------------------------------------- product footage
    def screen(self, sid, shots, t0, t1, zooms=(), crops=(), top=350, width=880, aspect=850 / 1075, url="leetexpert.com"):
        """A browser window playing real product stills, cross-cut, with camera moves.

        `shots` is [(time, "screens/x.png")]: each still shows from its time until the next.
        Capture them from the running app (see a package's capture.mjs), never mock them.
        `zooms` is [(time, scale, fx, fy)]: at `time` the camera eases to `scale`, framing
        the point (fx, fy) given as fractions of the still. Scale 1 frames the whole still.
        `crops` is [(time, frac)]: the window's visible height eases to that fraction of the
        still, cutting off its bottom (framing, not retouching: nothing inside is changed).
        """
        h = round(width * aspect)
        imgs = "".join(f'<img class="shot" id="{sid}-s{j}" src="{src}" alt="">' for j, (_, src) in enumerate(shots))
        self.add(f'<div class="win" id="{sid}" data-layout-allow-overlap style="top:{top}px;left:{(1080 - width) // 2}px;width:{width}px">'
                 f'<div class="wbar"><i></i><i></i><i></i><span>{html.escape(url)}</span></div>'
                 f'<div class="wview" id="{sid}-view" style="height:{h}px"><div class="wcam" id="{sid}-cam" data-layout-allow-overlap style="height:{h}px">{imgs}</div></div></div>')
        self.show(f"#{sid}", t0, t1, y=24)
        self.swap([(f"#{sid}-s{j}", t) for j, (t, _) in enumerate(shots)], t1)
        self.init(f"#{sid}-cam", scale=1, x=0, y=0, transformOrigin="0 0")
        for t, s, fx, fy in zooms:
            # framing (fx, fy) at scale s with origin 0 0: shift so that point stays put
            self.k(f"#{sid}-cam", t, {"scale": s, "x": round(-(s - 1) * fx * width), "y": round(-(s - 1) * fy * h)}, 0.6, "power2.inOut")
        if crops:
            self.init(f"#{sid}-view", height=h)
            for t, frac in crops:
                self.k(f"#{sid}-view", t, {"height": round(frac * h)}, 0.4, "power2.inOut")

    # ---------------------------------------------------------------- tutor stills
    def stills(self, SB):
        """SB: [(time, still_name)], the first at 0 and the last at RESET (back to the first)."""
        assert [t for t, _ in SB] == sorted(t for t, _ in SB), "still cuts out of order"
        names = sorted({n for _, n in SB})
        missing = [n for n in names if not os.path.exists(f"stills/{n}.png")]
        assert not missing, f"run reelkit/prep.sh first; missing stills: {missing}"
        for n in names:
            on = SB[0][1] == n
            self.init(f"#st-{n}", autoAlpha=1 if on else 0, xPercent=-50)
            for t, m in SB[1:]:
                if m == n and not on:
                    self.k(f"#st-{n}", t, {"autoAlpha": 1}, 0.14, "power2.out"); on = True
                elif m != n and on:
                    self.k(f"#st-{n}", t, {"autoAlpha": 0}, 0.1, "none"); on = False
        # a slow push-in on each hold, reset at every cut
        self.init("#tutor", scale=1, transformOrigin="50% 100%")
        for j, (t, _) in enumerate(SB):
            nxt = SB[j + 1][0] if j + 1 < len(SB) else self.END
            if j:
                self.k("#tutor", t, {"scale": 1}, 0.001, "none")
            self.k("#tutor", t + 0.002, {"scale": 1.035}, max(0.01, nxt - t - 0.01), "none")
        imgs = "".join(f'<img class="still" id="st-{n}" src="stills/{n}.png" alt="" style="height:{800 if n.startswith("fb-") else 700 if n.startswith("cu-") else 760}px">' for n in names)
        self.add(f'<div class="tutor" id="tutor">{imgs}</div>')
        self.n_cuts = len(SB)

    # ---------------------------------------------------------------- captions
    def captions(self, amber, teal, until):
        """Groups of up to three words; key words coloured. Hidden from `until` (the lockup)."""
        W, L = self.W, self.lead
        groups, cur = [], []
        for i, x in enumerate(W):
            cur.append(i)
            if (x["t"][-1] in ".?!,:…" and len(cur) >= 2) or len(cur) >= 3 or x["t"][-1] in ".?!…":
                groups.append(cur); cur = []
        if cur:
            groups.append(cur)
        wc = lambda i: "ca" if forms(W[i]["t"]) & amber else "ct" if forms(W[i]["t"]) & teal else "cw"
        WS = [L + x["s"] for x in W]
        for g, ids in enumerate(groups):
            s = WS[ids[0]]
            self.init(f"#g{g}", autoAlpha=0)
            if s >= until - 0.05:
                continue
            e = min(WS[groups[g + 1][0]] if g + 1 < len(groups) else self.END, until - 0.1)
            self.k(f"#g{g}", s - 0.05, {"autoAlpha": 1}, 0.06, "none")
            self.k(f"#g{g}", max(e - 0.1, s + 0.02), {"autoAlpha": 0}, 0.04, "none")
            for i in ids:
                self.init(f"#w{i}", opacity=0.5)
                self.k(f"#w{i}", WS[i], {"opacity": 1}, 0.08, "none")
        cap = "".join(f'<div class="cg" id="g{g}">' + " ".join(f'<span class="{wc(i)}" id="w{i}">{html.escape(W[i]["t"])}</span>' for i in ids) + "</div>"
                      for g, ids in enumerate(groups))
        self.add(f'<div class="caps">{cap}</div>')

    # ---------------------------------------------------------------- brand
    def lockup(self, t_leet, t_link, line):
        """Top bar out, the leetExpert lockup in, CTA on 'link', all back at RESET."""
        for sel in ("#topbrand", "#topic"):
            self.init(sel, autoAlpha=1)
            self.k(sel, t_leet - 0.2, {"autoAlpha": 0}, 0.3)
            self.k(sel, self.RESET, {"autoAlpha": 1}, 0.4)
        self.init("#lock", autoAlpha=0, y=20)
        self.k("#lock", t_leet, {"autoAlpha": 1, "y": 0}, 0.45, "power3.out")
        self.k("#lock", self.RESET - 0.1, {"autoAlpha": 0, "y": -16}, 0.3)
        self.init("#lline", autoAlpha=0)
        self.k("#lline", t_leet + 0.8, {"autoAlpha": 1}, 0.4)
        self.init("#lcta", autoAlpha=0, scale=0.8)
        self.k("#lcta", t_link, {"autoAlpha": 1, "scale": 1}, 0.4, "back.out(2)")
        self.init("#larr", x=0)
        for n in range(2):
            self.k("#larr", t_link + 0.5 + n * 0.7, {"x": 12}, 0.35, "sine.inOut")
            self.k("#larr", t_link + 0.85 + n * 0.7, {"x": 0}, 0.35, "sine.inOut")
        self.add(f'<div class="lock" id="lock"><div class="lbrand">leetExpert<span class="ldot"></span></div><div class="lline" id="lline">{line}</div>'
                 f'<div class="lcta" id="lcta">Try leetExpert free <span id="larr">→</span> link in bio</div></div>')

    # ---------------------------------------------------------------- output
    def write(self, css=""):
        for sel, tr in self.K.items():
            tr["pts"].sort(key=lambda p: p[0])
            prev = 0.0
            for p in tr["pts"]:
                assert p[0] >= prev - 1e-6, f"{sel}: keyframe at {p[0]} overlaps previous ending {prev}"
                prev = p[0] + p[2]
        base = (KIT / "base.css").read_text()
        audio = (f'<audio id="vo" src="vo.mp3" data-start="{self.lead}" data-duration="{round(_duration("vo.mp3"), 2)}" data-track-index="1"></audio>'
                 if self.has_vo else "")
        top = (f'<div class="top"><div class="brand" id="topbrand">leetExpert<span class="dot"></span></div>'
               f'<div class="chip" id="topic">{html.escape(self.topic)}</div></div>')
        # tutor, captions and lockup were added last by convention; order in the DOM is paint order
        H = f'''<!doctype html>
<html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=1080, height=1920" />
<title>leetExpert: {html.escape(self.title)}</title><script src="gsap.min.js"></script><style>{base}{css}</style></head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-width="1080" data-height="1920" data-duration="{self.END}">
 {top}
 {"".join(self.parts)}
 {audio}
</div>
<script>
(function(){{
const tl=gsap.timeline({{paused:true}});
const K={json.dumps(self.K)};
for (const [sel,{{init,pts}}] of Object.entries(K)) {{
  gsap.set(sel,init); let prev=0; const kf=[];
  for (const [t,v,d,e] of pts) {{ kf.push(Object.assign({{}},v,{{duration:d||0.001,ease:e||"power2.out",delay:Math.max(0,t-prev)}})); prev=t+(d||0.001); }}
  if (kf.length) tl.to(sel,{{keyframes:kf}},0);
}}
window.__timelines=window.__timelines||{{}};
window.__timelines["main"]=tl;
}})();
</script></body></html>'''
        open("index.html", "w").write(H)
        json.dump({"END": self.END, "A": self.A}, open("timing.json", "w"))
        print(f"END {self.END}s · {len(self.K)} tracks · {getattr(self, 'n_cuts', 0)} still cuts · vo={'yes' if self.has_vo else 'no (silent preview)'}")
