"""Generate the voiceover from SCRIPT.md: one clip per scene, edge-validated.

ROOT-CAUSE NOTE — why there is no `next_text` here.
Request stitching (`next_text`) is designed for clips that are joined back to
back with no gap: the model may begin the NEXT utterance (an intake breath, the
attack of the next word) in the clip's last milliseconds, and the next clip is
meant to cover it. build-timeline.py deliberately inserts silence between
scenes, so that sliced-off onset was left exposed against dead air and heard as
a glitch (4 of 8 clips, 2026-09-13). `previous_text` is kept for tone
continuity: in a 2026-09-14 test it produced clean starts in 4 of 4 trials,
while a request WITHOUT it produced one hot start — hot starts are random,
not caused by stitching, which is why validation below is the real guard.

TTS output is non-deterministic, so the parameter change is not trusted on its
own: every clip is edge-checked (audiocheck.py) and regenerated if it starts or
ends hot. The build fails rather than ship a clip that still clicks.

Word timings come from the `with-timestamps` endpoint — the alignment of the
exact audio returned — so scene choreography can anchor to spoken words.

The API key is read from the environment and never written to disk.
"""
import base64, json, os, re, subprocess, sys, urllib.request

from audiocheck import edge_report

KEY = os.environ.get("ELEVENLABS_API_KEY")
if not KEY:
    sys.exit("ELEVENLABS_API_KEY not set")

VOICE = "SAz9YHcvj6GT2YYXdXww"          # River — relaxed, neutral, informative
MODEL = "eleven_multilingual_v2"
SETTINGS = {"stability": 0.45, "similarity_boost": 0.75, "style": 0.10, "use_speaker_boost": True}
MAX_ATTEMPTS = 4

here = os.path.dirname(os.path.abspath(__file__))
md = open(os.path.join(here, "SCRIPT.md")).read()

lines = []
for m in re.finditer(r'^## Line (\d+) — (.+?)$(.*?)(?=^## |\Z)', md, re.M | re.S):
    n, title, body = int(m.group(1)), m.group(2).strip(), m.group(3)
    spoken = [l[4:].rstrip() for l in body.split("\n") if l.startswith("    ") and l.strip()]
    if spoken:
        lines.append({"n": n, "title": title, "text": " ".join(spoken)})
lines.sort(key=lambda x: x["n"])
assert len(lines) == 8, f"expected 8 spoken lines, parsed {len(lines)}"

outdir = os.path.join(here, "audio")
os.makedirs(outdir, exist_ok=True)


def duration(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                          "-of", "default=nw=1:nk=1", path], capture_output=True, text=True)
    return round(float(out.stdout.strip()), 3)


def words_from_alignment(al, text):
    chars = al["characters"]
    starts, ends = al["character_start_times_seconds"], al["character_end_times_seconds"]
    if "".join(chars) != text:
        raise ValueError("alignment text does not match the request text")
    words, cur, ws, we = [], "", None, None
    for c, s, e in zip(chars, starts, ends):
        if not c.strip():
            if cur:
                words.append({"w": cur, "s": round(ws, 3), "e": round(we, 3)})
                cur = ""
            continue
        if not cur:
            ws = s
        cur += c
        we = e
    if cur:
        words.append({"w": cur, "s": round(ws, 3), "e": round(we, 3)})
    return words


def synthesize(text, previous):
    payload = {"text": text, "model_id": MODEL, "voice_settings": SETTINGS, "previous_text": previous}
    req = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE}/with-timestamps?output_format=mp3_44100_128",
        data=json.dumps(payload).encode(),
        headers={"xi-api-key": KEY, "Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=180) as r:
        return json.load(r)


manifest = []
for i, ln in enumerate(lines):
    path = os.path.join(outdir, f"line-{ln['n']}.mp3")
    previous = lines[i - 1]["text"] if i > 0 else None
    for attempt in range(1, MAX_ATTEMPTS + 1):
        res = synthesize(ln["text"], previous)
        with open(path, "wb") as f:
            f.write(base64.b64decode(res["audio_base64"]))
        rep = edge_report(path)
        if rep["ok"]:
            break
        print(f"  line {ln['n']} attempt {attempt}: {'; '.join(rep['problems'])} — regenerating")
    else:
        sys.exit(f"line {ln['n']}: still fails edge validation after {MAX_ATTEMPTS} attempts")

    words = words_from_alignment(res["alignment"], ln["text"])
    json.dump(words, open(os.path.join(outdir, f"line-{ln['n']}.words.json"), "w"), indent=1)
    d = duration(path)
    manifest.append({"line": ln["n"], "title": ln["title"], "file": f"audio/line-{ln['n']}.mp3",
                     "words_file": f"audio/line-{ln['n']}.words.json", "word_count": len(words),
                     "duration": d, "attempts": attempt, "head_db": rep["head_db"],
                     "tail_db": rep["tail_db"], "text": ln["text"]})
    print(f"  line {ln['n']}  {d:>6.2f}s  {len(words):>3} words  attempts {attempt}  "
          f"edges {rep['head_db']}/{rep['tail_db']} dB  {ln['title']}")

total = round(sum(m["duration"] for m in manifest), 3)
json.dump({"voice": VOICE, "model": MODEL, "settings": SETTINGS,
           "stitching": "previous_text only (next_text removed — see module docstring)",
           "total_speech": total, "lines": manifest},
          open(os.path.join(outdir, "manifest.json"), "w"), indent=2)
print(f"\ntotal speech {total}s across {len(manifest)} clips, all edge-validated")
