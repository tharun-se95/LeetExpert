"""Shared parsing for the matrix-systems narration pipeline."""
import json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))          # hyperframes/
ROWS = os.path.join(ROOT, "data", "rows-matrix-systems.json")


def parse_script():
    """{video: [{n, title, kind, a, b, text}]} in line order."""
    md = open(os.path.join(HERE, "SCRIPT.md")).read()
    videos = {}
    pat = re.compile(r'^## (\S+) · Line (\d+) — (.+?) \[(.+?)\]$(.*?)(?=^## |^# |\Z)', re.M | re.S)
    for m in pat.finditer(md):
        vid, n, title, where, body = m.group(1), int(m.group(2)), m.group(3), m.group(4), m.group(5)
        text = " ".join(l[4:].rstrip() for l in body.split("\n") if l.startswith("    ") and l.strip())
        fm = re.fullmatch(r'frames (\d+)-(\d+)', where)
        om = re.fullmatch(r'outro(?: cards (\d+),(\d+),(\d+))?', where)
        line = {"n": n, "title": title, "text": text,
                "kind": "frames" if fm else "outro" if om else where,
                "a": int(fm.group(1)) if fm else None, "b": int(fm.group(2)) if fm else None}
        if om:
            # Which spoken sentence (1-based) states each fact card; the card appears as it starts.
            line["cards"] = [int(g) for g in om.groups()] if om.group(1) else [1, 2, 3]
            assert line["cards"] == sorted(set(line["cards"])), f"{vid} line {n}: card sentences must increase"
        assert line["kind"] in ("intro", "outro", "frames"), where
        assert text, f"{vid} line {n} has no spoken text"
        videos.setdefault(vid, []).append(line)
    for vid, lines in videos.items():
        lines.sort(key=lambda l: l["n"])
        assert lines[0]["kind"] == "intro" and lines[-1]["kind"] == "outro", vid
    return videos


def frame_counts():
    return {r["_out"]: len(json.loads(r["frames"])) for r in json.load(open(ROWS))}


def validate(videos):
    """Beats must tile the scene's frames exactly, or the narration and the animation disagree."""
    counts = frame_counts()
    assert set(videos) == set(counts), (set(videos) ^ set(counts))
    for vid, lines in videos.items():
        body = [l for l in lines if l["kind"] == "frames"]
        expect = 0
        for l in body:
            assert l["a"] == expect and l["b"] >= l["a"], f"{vid} line {l['n']}: expected to start at frame {expect}, got {l['a']}"
            expect = l["b"] + 1
        assert expect == counts[vid], f"{vid}: beats cover {expect} frames, scene has {counts[vid]}"
