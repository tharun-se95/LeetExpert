"""Shared parts of the lesson artifacts: the page CSS, the icon sprite and the
app's colour tokens.

The light theme's tokens are read from hyperframes/assets/brand.css, whose generated block
comes from globals.css and familyTheme.ts (see web/src/lib/visual/hyperframesBrand.ts),
so an artifact wears the app's light theme and family colour without a hand-kept copy.
Rebuild an artifact after regenerating them.

The dark theme is The Grid Underneath's own (owner, 2026-09-25, D6 in the rollout spec): its
navy ladder, dot grid, fixed blue accent and state hues, and a navy code well. Since the app took
the same theme (#12), every value is read from the app: the dark block of globals.css and the
Grid's hues in familyTheme.ts (#20; a hand-kept table here, GRID_DARK, came first). Every ink is
held to AA on every surface it can sit on at build time.
"""
import os, re

HERE = os.path.dirname(os.path.abspath(__file__))
BRAND = os.path.join(HERE, "..", "..", "hyperframes", "assets", "brand.css")


def _decls(block):
    return {m.group(1): m.group(2).strip() for m in re.finditer(r"(--[\w-]+):\s*([^;]+);", block)}


def _rgb(h):
    h = h.strip().lstrip("#")
    return [int(h[i:i + 2], 16) for i in (0, 2, 4)]


def contrast(a, b):
    def lum(c):
        f = lambda v: v / 12.92 if (v := v / 255) <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4
        r, g, b_ = (f(x) for x in _rgb(c))
        return 0.2126 * r + 0.7152 * g + 0.0722 * b_
    x, y = sorted((lum(a), lum(b)), reverse=True)
    return (x + 0.05) / (y + 0.05)


def mix(a, b, t):
    """a mixed into b at weight t, as a hex the engine can read (it cannot parse color-mix())."""
    return "#" + "".join(f"{round(p * t + q * (1 - t)):02x}" for p, q in zip(_rgb(a), _rgb(b)))


def accent_cell(fam_hex, on_hex, card_hex, ink_hex):
    """The fill and ink of an 'acc' cell. The family colours are mid-tone UI fills (3:1), so small
    text on them rarely reaches AA: keep the solid fill only where its own on-accent ink clears
    4.5:1, else a tint of the family on the card with the normal ink. Measured, per family."""
    if contrast(fam_hex, on_hex) >= 4.5:
        return fam_hex, on_hex
    # the most saturated tint that still clears AA with the ink: as much family colour as reads
    for pct in range(90, 20, -2):
        tint = mix(fam_hex, card_hex, pct / 100)
        if contrast(tint, ink_hex) >= 4.5:
            return tint, ink_hex
    raise SystemExit(f"no AA pairing for accent {fam_hex} on card {card_hex} with ink {ink_hex}")


FAMILY_THEME = os.path.join(HERE, "..", "src", "lib", "visual", "familyTheme.ts")


def app_dark():
    """The Grid dark theme (D6) as the app defines it: the `.dark` block of globals.css, and the
    Grid's hues by name from familyTheme.ts GRID_HUES. Cell states take the Grid's hues, not the
    app's status palette, as D6 decided for the artifacts."""
    css = re.sub(r"/\*.*?\*/", "", open(GLOBALS).read(), flags=re.S)
    d = {}
    for block in re.findall(r"^\.dark \{([^}]*)\}", css, re.M):
        d.update(_decls(block))
    hues = re.search(r"GRID_HUES = \{([^}]*)\}", open(FAMILY_THEME).read())
    if not hues:
        raise SystemExit("familyTheme.ts: GRID_HUES not found")
    hue = dict(re.findall(r'(\w+): "(#[0-9A-Fa-f]{6})"', hues.group(1)))
    shadow = app_surfaces()[2]
    return {
        "ground": d["--press-paper"], "panel": d["--code"], "raise": d["--elevated"], "sunk": d["--press-paper-sunk"],
        "rule": d["--code-editor-border"], "dot": d["--desk-dot"], "ink": d["--press-ink"], "dim": d["--press-ink-soft"],
        # the blue fill and its ink; the glow tint (--fam-raw) uses the same fill blue
        "acc": d["--press-lime"], "acc-raw": d["--press-lime"], "acc-ink": d["--press-olive"], "acc-on": d["--on-pop"],
        "cur": hue["orange"], "done": hue["teal"], "bad": hue["pink"], "warn": hue["yellow"], "viol": hue["violet"],
        # the window cell, level 1 of the blue ramp, as the light theme's --b-1 is
        "win": d["--hue-blue-1"], "lamp": d["--press-lamp"], "shadow-tint": shadow["--shadow-tint"],
        "shadow": shadow["--shadow-elevation"],
    }


def grid_dark():
    """The dark token lists: (page, navy-card inks). Fails the build on any ink below AA."""
    g = app_dark()
    # level-1 tints (callout grounds, the win cell) are each hue mixed into the ground, as the Grid's win is
    tint = lambda h: mix(h, g["ground"], 0.2)
    inks = {"--fg": g["ink"], "--mk": g["acc-ink"], "--hair": g["rule"],
            "--o-ink": g["cur"], "--g-ink": g["done"], "--r-ink": g["bad"], "--y-ink": g["warn"], "--p-ink": g["viol"], "--b-ink": g["acc-ink"],
            "--g-1": tint(g["done"]), "--r-1": tint(g["bad"]), "--b-1": g["win"], "--y-1": tint(g["warn"]),
            # --fam is text and icons as well as bars in the kit, so it is the Grid's text accent (acc-ink);
            # the mid blue (acc) is only ever a cell fill, paired with its own dark ink below
            "--fam": g["acc-ink"], "--fam-on": g["acc-on"], "--fam-raw": g["acc-raw"], "--lamp": g["lamp"],
            "--lamp-glow": "rgba({},{},{},.55)".format(*_rgb(g["lamp"]))}
    page = {"--bg": g["ground"], "--card": g["panel"], "--well": g["sunk"], "--deep": g["sunk"], "--mut": g["dim"], "--hair2": g["rule"],
            "--pdot": g["dot"], **inks,
            # the instrument ladder: the card is the panel, cells idle on the raise, the stage is sunk
            "--nv-bg": g["panel"], "--nv-card": g["raise"], "--nv-deep": g["sunk"], "--nv-hair2": g["rule"], "--nv-mut": g["dim"],
            "--cw-bg": g["sunk"], "--cw-border": g["rule"], "--cw-ink": g["ink"], "--cw-mut": g["dim"],
            "--k-acc-fill": g["acc"], "--k-acc-on": g["acc-on"],
            "--shadow-tint": g["shadow-tint"], "--shadow-elevation": g["shadow"]}
    # every text ink against every surface it is drawn on; the state fills against their inks, as the
    # engine's K list pairs them inside a navy card (ink = the card, --nv-bg), and callout grounds
    surfaces = [g["ground"], g["panel"], g["raise"], g["sunk"]]
    pairs = [(i, s_) for i in (g["ink"], g["dim"], g["acc-ink"], g["cur"], g["done"], g["bad"], g["warn"], g["viol"]) for s_ in surfaces]
    pairs += [(f, g["panel"]) for f in (g["cur"], g["done"], g["bad"], g["warn"], g["viol"])]
    pairs += [(g["acc"], g["acc-on"]), (g["win"], g["ink"]), (g["raise"], g["ink"]), (g["sunk"], g["dim"])]
    pairs += [(mix(tint(h), g["panel"], 0.45), c) for h in (g["done"], g["bad"], g["warn"]) for c in (g["ink"], h)]
    bad = [f"{a} on {b}: {contrast(a, b):.2f}:1" for a, b in pairs if contrast(a, b) < 4.5]
    if bad:
        raise SystemExit("dark theme below AA: " + "; ".join(bad))
    fmt = lambda d: ";".join(f"{k}:{v}" for k, v in d.items())
    return fmt(page), fmt(inks)


def tokens(family):
    css = open(BRAND).read()
    g = css[css.index("BEGIN GENERATED"):css.index("END GENERATED")]

    def block(sel):
        i = g.index(sel + " {")
        return g[i + len(sel) + 2:g.index("}", i)]

    dark, light = _decls(block(':root,\n[data-theme="dark"]')), _decls(block('[data-theme="light"]'))
    # Each family has two blocks since #12: the first is the dark theme's colour, the
    # [data-theme="light"] one the light theme's. The light page must take the light block: the
    # dark hue on white paper is ~2:1 (the overview's teal headline word measured 1.98:1).
    fam = _decls(re.search(r'^\[data-family="%s"\] \{([^}]*)\}' % family, g, re.M).group(1))
    fam_light = re.search(r'\[data-theme="light"\]\[data-family="%s"\] \{([^}]*)\}' % family, g)
    if not fam_light:
        raise SystemExit(f"brand.css: no light-theme block for family {family}")
    fam_light = _decls(fam_light.group(1))
    names = {"--bg": "--ground", "--card": "--panel", "--well": "--code", "--deep": "--surface", "--fg": "--ink", "--mut": "--line",
             "--hair": "--rule", "--hair2": "--rule-strong", "--mk": "--mark", "--o-ink": "--hue-orange-ink", "--g-ink": "--hue-green-ink",
             "--r-ink": "--hue-red-ink", "--y-ink": "--hue-yellow-ink", "--p-ink": "--hue-purple-ink", "--b-ink": "--hue-blue-ink",
             "--g-1": "--hue-green-1", "--r-1": "--hue-red-1", "--b-1": "--hue-blue-1", "--y-1": "--hue-yellow-1"}

    def page(t, f, lamp, glow):
        s = ";".join(f"{a}:{t[b]}" for a, b in names.items())
        return s + f";--fam:{f['--accent']};--fam-on:{f['--on-accent']};--fam-raw:{f['--family-accent']};--lamp:{lamp};--lamp-glow:{glow}"

    nv_light, sh_light, _, well = app_surfaces()

    def extra(*ds):
        return "".join(f";{k}:{v}" for d in ds for k, v in d.items())

    # The light theme's code blocks sit on the app's navy code well, with the dark theme's inks.
    cw_light = {"--cw-bg": well[0][0], "--cw-border": well[0][1], "--cw-ink": dark["--ink"], "--cw-mut": dark["--line"]}
    # cells are painted on navy cards, whose card and ink are the navy ladder's in the light theme
    acc_l = accent_cell(fam["--accent"], fam["--on-accent"], nv_light["--nv-card"], dark["--ink"])
    ka_l = {"--k-acc-fill": acc_l[0], "--k-acc-on": acc_l[1]}
    L = page(light, fam_light, "#2b7a3b", "rgba(43,122,59,.45)") + extra(nv_light, sh_light, cw_light, ka_l) + ";--pdot:transparent"
    # N: the light theme's navy card takes the app's dark inks and the family's dark hue (as a navy
    # card in the app does), but keeps the navy ladder .navy maps.
    N = page(dark, fam, "#5be07a", "rgba(91,224,122,.55)")
    # The dark theme is the Grid's (D6): D for the page, ND for its navy cards (inks only, so
    # .navy's own ladder mapping still applies).
    D, ND = grid_dark()
    return L, D, N, ND


GLOBALS = os.path.join(HERE, "..", "src", "app", "globals.css")


def app_surfaces():
    """The navy instrument card and the elevation shadow, read from globals.css.

    A navy card in the light theme is the app's `.navy-card`: the dark theme's inks
    on its own navy ladder (ground, lifted, recessed). Its values are measured for
    AA in paperContrast.test.ts, so they are read, never retyped here.
    """
    css = re.sub(r"/\*.*?\*/", "", open(GLOBALS).read(), flags=re.S)
    navy = _decls(re.search(r":root:not\(\.dark\) \.navy-card \{([^}]*)\}", css).group(1))
    ground = re.search(r"--card-navy:\s*([^;]+);", css).group(1).strip()
    nv_light = {"--nv-bg": ground, "--nv-card": navy["--elevated"], "--nv-deep": navy["--surface"],
                "--nv-hair2": navy["--border"], "--nv-mut": navy["--muted"]}
    tint = re.findall(r"--shadow-tint:\s*([^;]+);", css)
    elev = [re.sub(r"\s+", " ", v).strip() for v in re.findall(r"--shadow-elevation:\s*([^;]+);", css)]
    # globals.css declares the light theme first and the dark theme second.
    # the code well (--code-editor) and its border, light theme first, dark second
    wells = list(zip(re.findall(r"--code-editor:\s*([^;]+);", css), re.findall(r"--code-editor-border:\s*([^;]+);", css)))
    if len(wells) < 2:
        raise SystemExit("globals.css: expected --code-editor and --code-editor-border in both themes")
    return (nv_light, {"--shadow-tint": tint[0], "--shadow-elevation": elev[0]},
            {"--shadow-tint": tint[1], "--shadow-elevation": elev[1]},
            [tuple(v.strip() for v in w) for w in wells[:2]])


# The state colours the engine paints cells with. Declared again on .navy: a custom
# property resolves where it is declared, so the :root copy would keep paper values.
K = ("--k-idle:var(--card);--k-idle-ink:var(--fg);--k-cur:var(--o-ink);--k-cur-ink:var(--bg);--k-acc:var(--k-acc-fill);--k-acc-ink:var(--k-acc-on);"
     "--k-done:var(--g-ink);--k-done-ink:var(--bg);--k-bad:var(--r-ink);--k-bad-ink:var(--bg);--k-warn:var(--y-ink);--k-warn-ink:var(--bg);"
     "--k-viol:var(--p-ink);--k-viol-ink:var(--bg);--k-dim:var(--well);--k-dim-ink:var(--mut);--k-win:var(--b-1);--k-win-ink:var(--fg);"
     "--e-idle:var(--mut);--e-path:var(--fam);--e-cur:var(--o-ink)")

# @@L@@ and @@D@@ become the light and dark token lists, @@N@@ the navy card's inks in the light
# theme and @@ND@@ in the dark one. The dark .navy rules outrank .navy (0,3,0 against 0,1,0).
BASE_CSS = r'''
:root{@@L@@;@@K@@}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){@@D@@}}
:root[data-theme="dark"]{@@D@@}
.navy{@@N@@;--bg:var(--nv-bg);--card:var(--nv-card);--deep:var(--nv-deep);--well:var(--nv-deep);--hair2:var(--nv-hair2);--mut:var(--nv-mut);@@K@@;color:var(--fg)}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .navy{@@ND@@}}
:root[data-theme="dark"] .navy{@@ND@@}'''.replace("@@K@@", K) + r'''
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:var(--bg);background-image:radial-gradient(var(--pdot) 1.4px,transparent 1.4px);background-size:26px 26px;background-position:13px 13px;color:var(--fg);font-family:'Space Grotesk',system-ui,sans-serif;font-size:16px;line-height:1.6;padding-inline:16px;font-variant-ligatures:none}
h1,h2,h3{font-family:'Space Mono',ui-monospace,monospace;font-weight:700;margin:0;text-wrap:balance;line-height:1.12}
p{margin:0} a{color:inherit} button{font:inherit;color:inherit}
:focus-visible{outline:2px solid var(--mk);outline-offset:2px}
.wrap{max-width:1180px;margin-inline:auto}
.kick{font-family:'JetBrains Mono',ui-monospace,monospace;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--mut)}
svg.i{width:1em;height:1em;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round;flex:none}
.top{position:sticky;top:env(safe-area-inset-top,0px);z-index:20;margin-inline:-16px;padding:10px 16px;background:color-mix(in srgb,var(--bg) 88%,transparent);backdrop-filter:blur(10px);border-bottom:1px solid var(--hair2)}
.top .wrap{display:flex;align-items:center;justify-content:space-between;gap:16px}
.mark{display:flex;align-items:center;gap:10px;font-family:'Space Mono',monospace;font-weight:700;font-size:18px;text-decoration:none}
.lamp{width:11px;height:11px;border-radius:50%;background:var(--lamp);box-shadow:0 0 10px 3px var(--lamp-glow)}
.seg{display:inline-flex;border:1px solid var(--hair2);border-radius:8px;overflow:hidden;background:var(--card)}
.seg button{border:0;background:none;padding:6px 12px;cursor:pointer;font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--mut)}
.seg button[aria-pressed="true"]{background:var(--fg);color:var(--bg)}
.prog{position:absolute;left:0;right:0;bottom:-1px;height:2px;pointer-events:none}
.prog i{display:block;height:100%;background:var(--fam);transform-origin:0 50%;transform:scaleX(0)}
.hero{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,.95fr);gap:48px;align-items:center;padding-block:64px 40px}
.hero h1{font-size:clamp(2.1rem,5.2vw,3.7rem);letter-spacing:-.02em}
.hero h1 em{font-style:normal;color:var(--fam)}
.hero .lede{font-size:18px;color:var(--mut);max-width:52ch;margin-top:20px}
.hero .kick{margin-bottom:18px}
.hero-meta{display:flex;flex-wrap:wrap;gap:8px 20px;margin-top:26px;font-family:'JetBrains Mono',monospace;font-size:13px;color:var(--mut)}
.hero-meta b{color:var(--fg);font-weight:500}
.idxbox{background:var(--card);border:1px solid var(--hair2);border-radius:14px;padding:18px;box-shadow:var(--shadow-elevation)}
.idx{position:relative;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));grid-template-rows:repeat(3,auto);row-gap:34px;column-gap:8px}
.idx-edges{position:absolute;inset:0;pointer-events:none}
.idx-edges line{stroke:var(--mut);stroke-width:1.6;opacity:.6}
.tile{position:relative;display:flex;flex-direction:column;gap:8px;justify-content:space-between;min-height:104px;padding:10px;border-radius:10px;border:1px solid var(--hair2);background:var(--bg);text-decoration:none;transition:background-color .2s,color .2s}
.tile .i{font-size:24px;color:var(--fam)}
.tile b,.tile span{display:block}
.tile b{font-family:'Space Mono',monospace;font-size:12.5px;line-height:1.2}
.tile span{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--mut);line-height:1.3}
.tile[data-on="1"]{background:var(--o-ink);border-color:var(--o-ink);color:var(--bg)}
.tile[data-on="1"] .i,.tile[data-on="1"] span{color:var(--bg)}
.idx-read{margin-top:14px;font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--mut)}
.idx-read b{color:var(--fg);font-weight:500}
.sys{padding-block:56px;border-top:1px solid var(--hair2);scroll-margin-top:60px}
.sys-head{display:flex;justify-content:space-between;align-items:flex-end;gap:24px;flex-wrap:wrap;margin-bottom:28px}
.sys-title{display:flex;flex-direction:column;gap:12px;max-width:640px}
.sys-title h2{font-size:clamp(1.6rem,3.4vw,2.4rem);letter-spacing:-.015em}
.sys-title .kick{display:flex;align-items:center;gap:10px}
.sys-title .kick .i{font-size:20px;color:var(--fam)}
.vig{width:260px;max-width:100%;height:auto;color:var(--fg)}
.vig .st{fill:none;stroke:currentColor;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}
.vig .fa{fill:var(--fam);opacity:.3} .vig .fk{fill:var(--fam)} .vig .fc{fill:var(--o-ink)} .vig .fr{fill:var(--r-ink)}
.vig .fg{fill:var(--g-ink)} .vig .fp{fill:var(--card)}
.vig .sc{stroke:var(--o-ink);fill:none;stroke-width:2.6;stroke-linecap:round}
.vig .tx{font:700 11px 'Space Mono',monospace;text-anchor:middle;fill:var(--bg)}
.sys-body{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:40px;align-items:start}
.story{display:flex;flex-direction:column;gap:22px}
.story .lede{font-size:17px;max-width:60ch}
.when{font-size:15px;color:var(--mut);max-width:60ch} .when b{color:var(--fg);font-weight:500}
.seen{display:flex;flex-wrap:wrap;gap:6px}
.seen span{font-family:'JetBrains Mono',monospace;font-size:11.5px;padding:4px 9px;border:1px solid var(--hair2);border-radius:99px;background:var(--card);color:var(--mut)}
.facts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;padding-block:6px;border-block:1px solid var(--hair2)}
.fact{padding-block:12px;display:flex;flex-direction:column;gap:4px}
.fact b{font-family:'Space Mono',monospace;font-size:clamp(1.15rem,2vw,1.55rem);color:var(--mk);font-variant-numeric:tabular-nums;letter-spacing:-.02em;overflow-wrap:anywhere}
.fact span{font-size:12.5px;color:var(--mut);line-height:1.4}
.code{border:1px solid var(--hair2);border-radius:10px;background:var(--well);overflow:hidden}
.code header{display:flex;justify-content:space-between;padding:8px 12px;border-bottom:1px solid var(--hair2);font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--mut)}
.code pre{margin:0;padding:12px 14px;overflow-x:auto;font-family:'JetBrains Mono',monospace;font-size:12.5px;line-height:1.65;tab-size:2}
main[data-code="py"] .c-ts,main[data-code="ts"] .c-py{display:none}
.watch{display:flex;gap:12px;font-size:14px;border:1px solid var(--hair2);border-radius:10px;padding:12px 14px;background:var(--card)}
.watch .i{font-size:20px;color:var(--r-ink);margin-top:1px}
.watch b{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.1em;text-transform:uppercase;display:block;color:var(--mut);font-weight:500}
.player{border:1px solid var(--hair2);border-radius:16px;background:var(--card);box-shadow:var(--shadow-elevation);overflow:hidden;min-width:0}
.stage{display:flex;flex-wrap:wrap;gap:20px 24px;justify-content:center;align-items:flex-start;padding:22px 18px;background:var(--deep);;min-height:300px}
.grp{flex:1 1 0;min-width:210px;display:flex;flex-direction:column;gap:14px;align-items:center}
.grp.wide{flex-basis:100%}
.bw{display:flex;flex-direction:column;gap:8px;align-items:center;max-width:100%}
.bl{font-family:'JetBrains Mono',monospace;font-size:11.5px;color:var(--mut);text-align:center;line-height:1.35}
.brd{display:grid;gap:3px;position:relative;margin:4px}
.brd.tree{display:block}
.brd.strip{gap:2px} .brd.strip .cell{border-radius:2px;height:22px} .brd.strip .cell:nth-child(4n+1):not(:first-child){margin-left:5px}
/* behind the cells, so its tint shows only in the gaps and never under a cell's text */
.brd.has-ov{isolation:isolate} .ov{position:absolute;left:0;top:0;z-index:-1;pointer-events:none;border-radius:8px;border:2px solid var(--k-cur);background:color-mix(in srgb,var(--k-cur) 14%,transparent);opacity:0}
.ov.bounds{border:2px dashed var(--mk);background:transparent;border-radius:6px}
.edges{position:absolute;left:0;top:0;pointer-events:none;overflow:visible}
.edges line{stroke:var(--e-idle);stroke-width:2;stroke-linecap:round}
.cell{width:var(--cs);height:var(--cs);border-radius:calc(var(--cs)*.16);display:flex;align-items:center;justify-content:center;font-family:'JetBrains Mono',monospace;font-weight:500;font-size:var(--fs);line-height:1;will-change:transform;user-select:none;box-shadow:inset 0 0 0 1px var(--hair2)}
.cell.node{position:absolute;border-radius:50%;--cs:auto;overflow:hidden;white-space:nowrap}
.note{padding:12px 18px;min-height:76px;font-size:14px;line-height:1.5;border-top:1px solid var(--hair2)}
.stats{display:flex;flex-wrap:wrap;gap:6px 8px;padding:0 18px 12px}
.stats span{font-family:'JetBrains Mono',monospace;font-size:12px;padding:3px 9px;border-radius:99px;border:1px solid var(--hair2);color:var(--mut);background:var(--bg);font-variant-numeric:tabular-nums}
.stats b{color:var(--fg);font-weight:500}
.ctl{display:flex;align-items:center;gap:8px;padding:10px 14px;border-top:1px solid var(--hair2)}
.btn{width:36px;height:36px;display:grid;place-items:center;border:1px solid var(--hair2);border-radius:9px;background:var(--bg);cursor:pointer;font-size:17px;flex:none}
.btn:hover{border-color:var(--mk)}
.btn.main{background:var(--fg);color:var(--bg);border-color:var(--fg)}
.spd{width:auto;padding-inline:9px;font-family:'JetBrains Mono',monospace;font-size:12px}
.track{position:relative;flex:1;min-width:0;height:36px}
.ticks{position:absolute;inset:11px 0;display:flex;gap:1px;align-items:stretch}
.ticks i{flex:1;min-width:1px;background:var(--hair2);border-radius:1px}
.ticks i.on{background:var(--fam)} .ticks i.key{background:var(--g-ink)} .ticks i.bad{background:var(--r-ink)}
.head{position:absolute;top:5px;bottom:5px;width:3px;margin-left:-1.5px;background:var(--o-ink);border-radius:2px;pointer-events:none;left:0;box-shadow:0 0 0 2px var(--card)}
.track input{position:absolute;inset:0;width:100%;height:100%;margin:0;opacity:0;cursor:ew-resize}
.track:focus-within{outline:2px solid var(--mk);outline-offset:2px;border-radius:6px}
.cnt{font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--mut);min-width:56px;text-align:right;font-variant-numeric:tabular-nums}
.outro{padding-block:64px 32px;border-top:1px solid var(--hair2)}
.outro h2{font-size:clamp(1.6rem,3.4vw,2.4rem);max-width:22ch}
.rules{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin-top:32px}
.rule{background:var(--card);border:1px solid var(--hair2);border-radius:14px;padding:22px;display:flex;flex-direction:column;gap:12px}
.rule .i{font-size:30px;color:var(--fam)} .rule h3{font-size:16px} .rule p{font-size:14.5px;color:var(--mut)}
.practice{margin-top:32px;display:flex;flex-wrap:wrap;gap:8px;align-items:center;font-family:'JetBrains Mono',monospace;font-size:12.5px;color:var(--mut)}
.practice .pill{padding:5px 11px;border:1px solid var(--hair2);border-radius:99px;background:var(--card);color:var(--fg)}
.foot{padding-block:24px 56px;font-size:13px;color:var(--mut);max-width:78ch} .foot b{color:var(--fg);font-weight:500}
@media (max-width:980px){.hero{grid-template-columns:minmax(0,1fr);gap:32px;padding-block:40px 24px}.sys-body{grid-template-columns:minmax(0,1fr);gap:28px}.rules{grid-template-columns:minmax(0,1fr)}}
@media (max-width:520px){.facts{grid-template-columns:minmax(0,1fr)}.fact{padding-block:8px}.stage{padding-inline:10px}.vig{display:none}.tile{min-height:88px;padding:8px}.tile span{display:none}}
@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
'''

ICONS = r'''<symbol id="i-ast" viewBox="0 0 24 24"><circle cx="12" cy="5" r="2.2"/><circle cx="6" cy="14" r="2.2"/><circle cx="18" cy="14" r="2.2"/><path d="M10.6 6.8L7.4 12.2M13.4 6.8l3.2 5.4M6 16.2v3.3M18 16.2v3.3"/></symbol>
<symbol id="i-stack" viewBox="0 0 24 24"><rect x="5" y="4" width="14" height="4" rx="1.2"/><rect x="5" y="10" width="14" height="4" rx="1.2"/><rect x="5" y="16" width="14" height="4" rx="1.2"/></symbol>
<symbol id="i-cloud" viewBox="0 0 24 24"><path d="M7 18a4 4 0 0 1-.6-7.95A5.5 5.5 0 0 1 17 8.6 4.7 4.7 0 0 1 17 18z"/><path d="M12 12v6M9.5 15.5L12 18l2.5-2.5"/></symbol>
<symbol id="i-box" viewBox="0 0 24 24"><rect x="3.5" y="4" width="17" height="16" rx="2"/><path d="M9 4v16M9 10h11.5"/></symbol>
<symbol id="i-route" viewBox="0 0 24 24"><circle cx="5" cy="18" r="2"/><circle cx="19" cy="18" r="2"/><circle cx="12" cy="6" r="2"/><path d="M6.4 16.4L10.8 7.8M17.6 16.4L13.2 7.8M7 18h10"/></symbol>
<symbol id="i-rack" viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="5" rx="1.2"/><rect x="4" y="9.5" width="16" height="5" rx="1.2"/><rect x="4" y="16" width="16" height="5" rx="1.2"/><path d="M7 5.5h.01M7 12h.01M7 18.5h.01M11 5.5h5M11 12h5M11 18.5h5"/></symbol>
<symbol id="i-file" viewBox="0 0 24 24"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 15h6M9 18h4"/></symbol>
<symbol id="i-warn" viewBox="0 0 24 24"><path d="M12 3.5l9.5 16.5h-19z"/><path d="M12 10v4.5M12 17.4h.01"/></symbol>
<symbol id="i-play" viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></symbol>
<symbol id="i-pause" viewBox="0 0 24 24"><path d="M8 5.5v13M16 5.5v13" stroke-width="3"/></symbol>
<symbol id="i-prev" viewBox="0 0 24 24"><path d="M7 5.5v13M18 5.5l-9 6.5 9 6.5z"/></symbol>
<symbol id="i-next" viewBox="0 0 24 24"><path d="M17 5.5v13M6 5.5l9 6.5-9 6.5z"/></symbol>
<symbol id="i-replay" viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 0 2.6-5.9"/><path d="M4 3.5v5h5"/></symbol>
<symbol id="i-recurse" viewBox="0 0 24 24"><path d="M12 4v6M12 10L6 15M12 10l6 5M6 15v5M18 15v5"/></symbol>
<symbol id="i-meet" viewBox="0 0 24 24"><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/><circle cx="12" cy="5" r="2"/><path d="M6 17.2L11 6.8M18 17.2L13 6.8"/></symbol>
<symbol id="i-flat" viewBox="0 0 24 24"><path d="M3 8h18M3 16h18"/><path d="M7 5v6M11 5v6M15 5v6M19 5v6M5 13v6M9 13v6M13 13v6M17 13v6" stroke-width="1.2"/></symbol>
<symbol id="i-g-cell" viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="17" height="17" rx="2"/><path d="M9.2 3.5v17M14.8 3.5v17M3.5 9.2h17M3.5 14.8h17"/><rect x="9.2" y="9.2" width="5.6" height="5.6" fill="currentColor" stroke="none" opacity=".45"/></symbol>
<symbol id="i-g-kernel" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9.3 4v16M14.7 4v16M4 9.3h16M4 14.7h16"/><rect x="9.6" y="9.6" width="4.8" height="4.8" fill="currentColor" stroke="none" opacity=".35"/></symbol>
<symbol id="i-g-rotate" viewBox="0 0 24 24"><path d="M20.5 12a8.5 8.5 0 1 1-2.6-6.1"/><path d="M20.5 3.5v5h-5"/><rect x="9" y="8" width="6" height="8" rx="1.4"/></symbol>
<symbol id="i-g-spiral" viewBox="0 0 24 24"><path d="M12 12h2.2v-2.2H9.8v4.4h6.6V7.6H7.6v8.8H18.6V5.4H5.4v13.2h15.2"/></symbol>
<symbol id="i-s-problem" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><path d="M12 12h.01"/></symbol>
<symbol id="i-s-attempt" viewBox="0 0 24 24"><path d="M4 20l1-4.5L15.5 5a2.1 2.1 0 0 1 3 3L8 18.5z"/><path d="M13.5 7l3 3"/></symbol>
<symbol id="i-s-insight" viewBox="0 0 24 24"><path d="M9.5 18h5M10.5 21h3"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1.1 1.3 1.1 2.2h5c0-.9.5-1.7 1.1-2.2A6 6 0 0 0 12 3z"/></symbol>
<symbol id="i-s-solution" viewBox="0 0 24 24"><circle cx="8" cy="15.5" r="4"/><path d="M11 12.5l8-8M16.5 7l2.5 2.5M14 9.5l2 2"/></symbol>
<symbol id="i-s-variants" viewBox="0 0 24 24"><circle cx="6" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="7" r="2"/><path d="M6 7v10M18 9c0 4.5-6.5 3.5-11 8.3"/></symbol>
<symbol id="i-s-quiz" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M8.2 12.3l2.6 2.6 5-5.2"/></symbol>
<symbol id="i-s-cost" viewBox="0 0 24 24"><path d="M4 4v16h16"/><path d="M7 16c4 0 7-2.5 11-10"/><path d="M7 17.5h11" stroke-dasharray="1.5 2.5"/></symbol>
<symbol id="i-eye" viewBox="0 0 24 24"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/></symbol>'''
