"""Turn narration clips into frame timings, one assembled audio track per video, and the final mux.

    python3 build-narration.py --estimate   # no audio yet: timings estimated from word counts, for dry runs only
    python3 build-narration.py              # timings measured from audio/<video>/ (after build-vo.py)
    python3 build-narration.py --mux        # voice the silent renders in renders/<video>.timed.mp4

Timing rules (the only place they live, nothing is copied by hand):
  * the hook plays over the title card; the scene starts after it;
  * each body line covers a contiguous range of frames; its frames are spread
    evenly across the line's spoken duration, the first slightly before the
    first word so the picture leads the explanation;
  * the fact cards cut in after the last body line, revealed across the closing line.
Frames are spread evenly, not word-anchored: a beat's frames advance at a steady
pace under its sentences. A finer anchor per frame would need a per-frame word
index in SCRIPT.md.
"""
import json, os, subprocess, sys

from common import HERE, ROOT, ROWS, parse_script, validate

ESTIMATE = "--estimate" in sys.argv
GAP = 0.35            # silence between clips
HOOK_AT = 0.45        # hook starts just after the title card begins
LEAD = 0.10           # a frame lands this long before its line's first word
MIN_FRAME_GAP = 0.22  # faster than this the cell tweens blur into each other
TAIL = 1.8            # hold after the closing line
CARD_LEAD = 0.15      # a fact card starts rising this long before the sentence that states it


def est_words(text):
    """Word timings for a dry run: ~0.36 s a word plus pauses at commas and full stops."""
    t, out = 0.12, []
    for w in text.split():
        d = 0.10 + 0.045 * len(w.strip(".,:;'\""))
        out.append({"w": w, "s": round(t, 3), "e": round(t + d, 3)})
        t += d + 0.02 + (0.32 if w.endswith((".", ":")) else 0.16 if w.endswith(",") else 0)
    return out, round(t + 0.12, 3)


def load_clip(vid, ln):
    if ESTIMATE:
        w, d = est_words(ln["text"])
        return {"duration": d, "words": w, "file": None}
    d = os.path.join(HERE, "audio", vid)
    man = json.load(open(os.path.join(d, "manifest.json")))
    if man.get("estimated"):
        sys.exit(f"{vid}: audio manifest is an estimate; run build-vo.py")
    m = next(x for x in man["lines"] if x["line"] == ln["n"])
    if m["text"] != ln["text"]:
        sys.exit(f"{vid} line {ln['n']}: SCRIPT.md changed since the audio was generated; rerun build-vo.py")
    return {"duration": m["duration"], "words": json.load(open(os.path.join(d, f"line-{ln['n']}.words.json"))),
            "file": os.path.join(d, m["file"])}


def sentence_starts(words):
    """Start time of each sentence, from the word timings, so a card lands with the words that state it."""
    starts, first = [], True
    for w in words:
        if first:
            starts.append(w["s"])
        first = w["w"].endswith((".", "!", "?"))
    return starts


def plan(vid, lines, nframes):
    clips = [load_clip(vid, ln) for ln in lines]
    hook, body, facts = clips[0], list(zip(lines[1:-1], clips[1:-1])), clips[-1]
    t0 = max(2.4, HOOK_AT + hook["duration"] + 0.6)
    starts = {lines[0]["n"]: HOOK_AT}
    s = t0 + 0.3
    times = [0.0] * nframes
    for ln, c in body:
        starts[ln["n"]] = s
        n = ln["b"] - ln["a"] + 1
        span = c["duration"] + GAP * 0.5 + LEAD
        step = span / n
        for j in range(ln["a"], ln["b"] + 1):
            times[j] = round(s - LEAD + (j - ln["a"]) * step - t0, 3)
        s += c["duration"] + GAP
    times[0] = 0.0
    gaps = [times[k] - times[k - 1] for k in range(1, nframes)]
    assert all(g > 0 for g in gaps), f"{vid}: frame times not increasing"
    tight = min(gaps)
    end_body = s - GAP
    outro_at = end_body + 0.5
    facts_at = end_body + 0.9
    starts[lines[-1]["n"]] = facts_at
    sent = sentence_starts(facts["words"])
    assert len(sent) >= lines[-1]["cards"][-1], f"{vid}: facts line has {len(sent)} sentences, cards need {lines[-1]['cards']}"
    fact_times = [round(facts_at - outro_at + sent[k - 1] - CARD_LEAD, 3) for k in lines[-1]["cards"]]
    total = round(facts_at + facts["duration"] + TAIL, 3)
    return {"clips": clips, "starts": starts, "t0": round(t0, 3), "times": times, "min_gap": round(tight, 3),
            "outro_at": round(outro_at, 3), "fact_times": fact_times, "total": total}


def assemble(vid, lines, p):
    """One track per video: each clip delayed to its start time, mixed without renormalising."""
    ins, filt = [], []
    for i, (ln, c) in enumerate(zip(lines, p["clips"])):
        ins += ["-i", c["file"]]
        ms = int(round(p["starts"][ln["n"]] * 1000))
        filt.append(f"[{i}:a]adelay={ms}|{ms}[a{i}]")
    mix = "".join(f"[a{i}]" for i in range(len(lines))) + f"amix=inputs={len(lines)}:normalize=0:dropout_transition=0[out]"
    os.makedirs(os.path.join(HERE, "narration"), exist_ok=True)
    out = os.path.join(HERE, "narration", f"{vid}.m4a")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *ins, "-filter_complex", ";".join(filt + [mix]),
                    "-map", "[out]", "-c:a", "aac", "-b:a", "192k", out], check=True)
    return out


def mux():
    for vid in parse_script():
        silent = os.path.join(ROOT, "renders", f"{vid}.timed.mp4")
        audio = os.path.join(HERE, "narration", f"{vid}.m4a")
        final = os.path.join(ROOT, "renders", f"{vid}.narrated.mp4")
        if not (os.path.exists(silent) and os.path.exists(audio)):
            print(f"skip {vid}: need {os.path.basename(silent)} and narration/{vid}.m4a")
            continue
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", silent, "-i", audio, "-map", "0:v", "-map", "1:a",
                        "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", final], check=True)
        print("voiced", os.path.basename(final))


if "--mux" in sys.argv:
    mux()
    sys.exit(0)

videos = parse_script()
validate(videos)
base = {r["_out"]: r for r in json.load(open(ROWS))}
rows = []
for vid, lines in videos.items():
    row = dict(base[vid])
    n = len(json.loads(row["frames"]))
    p = plan(vid, lines, n)
    row.update({"_out": f"{vid}.timed", "frameTimes": json.dumps(p["times"]), "introSeconds": p["t0"],
                "outroAt": p["outro_at"], "factTimes": json.dumps(p["fact_times"]), "totalSeconds": p["total"]})
    rows.append(row)
    words = sum(len(c["words"]) for c in p["clips"])
    print(f"{vid:26s} {words:4d} words  scene starts {p['t0']:5.1f}s  outro {p['outro_at']:5.1f}s  "
          f"total {p['total']:5.1f}s  fastest frame gap {p['min_gap']:.2f}s" + ("  [ESTIMATE]" if ESTIMATE else ""))
    if p["min_gap"] < MIN_FRAME_GAP:
        sys.exit(f"{vid}: frames come {p['min_gap']}s apart, under {MIN_FRAME_GAP}s. Give that beat more speech or fewer frames.")
    if not ESTIMATE:
        assemble(vid, lines, p)

out = os.path.join(ROOT, "data", "rows-matrix-narrated.estimate.json" if ESTIMATE else "rows-matrix-narrated.json")
json.dump(rows, open(out, "w"), indent=2, ensure_ascii=False)
print("wrote", out)
