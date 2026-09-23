"""Generate the voiceover from SCRIPT.md, one clip per scene.

Clips are generated separately so each scene gets an exact, measured duration —
the composition syncs to real audio, never to the script's word-count estimate.
`previous_text` / `next_text` are passed so ElevenLabs keeps prosody continuous
across the cuts instead of restarting the sentence contour each time.

The API key is read from the environment and never written to disk.
"""
import json, os, re, subprocess, sys, urllib.request

KEY = os.environ.get("ELEVENLABS_API_KEY")
if not KEY:
    sys.exit("ELEVENLABS_API_KEY not set")

VOICE = "SAz9YHcvj6GT2YYXdXww"          # River — relaxed, neutral, informative
MODEL = "eleven_multilingual_v2"
SETTINGS = {"stability": 0.45, "similarity_boost": 0.75, "style": 0.10, "use_speaker_boost": True}

here = os.path.dirname(os.path.abspath(__file__))
md = open(os.path.join(here, "SCRIPT.md")).read()

# Spoken text is the 4-space-indented block under each "## Line N" heading.
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

def dur(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                          "-of", "default=nw=1:nk=1", path], capture_output=True, text=True)
    return round(float(out.stdout.strip()), 3)

manifest = []
for i, ln in enumerate(lines):
    payload = {
        "text": ln["text"],
        "model_id": MODEL,
        "voice_settings": SETTINGS,
        "previous_text": lines[i - 1]["text"] if i > 0 else None,
        "next_text": lines[i + 1]["text"] if i < len(lines) - 1 else None,
    }
    req = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE}?output_format=mp3_44100_128",
        data=json.dumps(payload).encode(),
        headers={"xi-api-key": KEY, "Content-Type": "application/json"},
    )
    path = os.path.join(outdir, f"line-{ln['n']}.mp3")
    with urllib.request.urlopen(req, timeout=180) as r, open(path, "wb") as f:
        f.write(r.read())
    d = dur(path)
    manifest.append({"line": ln["n"], "title": ln["title"], "file": f"audio/line-{ln['n']}.mp3",
                     "words": len(ln["text"].split()), "duration": d, "text": ln["text"]})
    print(f'  line {ln["n"]}  {d:>6.2f}s  {len(ln["text"].split()):>3} words  {ln["title"]}')

total = round(sum(m["duration"] for m in manifest), 3)
json.dump({"voice": VOICE, "model": MODEL, "settings": SETTINGS,
           "total_speech": total, "lines": manifest},
          open(os.path.join(outdir, "manifest.json"), "w"), indent=2)
print(f"\ntotal speech {total}s across {len(manifest)} clips")
