"""Generate the narration for the matrix-systems videos with ElevenLabs.

One clip per script line, edge-validated, with word timings from the
`with-timestamps` endpoint so frames can be timed to the spoken words. Same
voice, model and settings as videos/arrays-intro/build-vo.py, and the same
lessons: no `next_text` (it exposes a sliced onset against the silence between
clips), `previous_text` kept for tone, every clip regenerated if it starts or
ends hot.

The API key is read from the environment and never written to disk:

    ELEVENLABS_API_KEY=... python3 videos/matrix-systems/build-vo.py            # all 8 videos
    ELEVENLABS_API_KEY=... python3 videos/matrix-systems/build-vo.py matrix-chip-routing   # one video

Cost: one credit per character, about 12,000 for all eight videos, more for
any regenerated clip. Run a single video first to hear the voice.
"""
import base64, json, os, subprocess, sys, urllib.request

from common import HERE, ROOT, parse_script, validate

sys.path.insert(0, os.path.join(ROOT, "videos", "arrays-intro"))
from audiocheck import edge_report  # noqa: E402

KEY = os.environ.get("ELEVENLABS_API_KEY")
if not KEY:
    sys.exit("ELEVENLABS_API_KEY not set. Export it in your shell for this one command; it is never written to disk.")

VOICE = "SAz9YHcvj6GT2YYXdXww"          # River, relaxed and neutral: the arrays-intro voice
MODEL = "eleven_multilingual_v2"
SETTINGS = {"stability": 0.45, "similarity_boost": 0.75, "style": 0.10, "use_speaker_boost": True}
MAX_ATTEMPTS = 4

videos = parse_script()
validate(videos)
want = sys.argv[1:] or list(videos)
unknown = [w for w in want if w not in videos]
if unknown:
    sys.exit(f"unknown video(s): {unknown}; choose from {list(videos)}")


def duration(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", path],
                         capture_output=True, text=True)
    return round(float(out.stdout.strip()), 3)


def words_from_alignment(al, text):
    chars, starts, ends = al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]
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
        data=json.dumps(payload).encode(), headers={"xi-api-key": KEY, "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=180) as r:
        return json.load(r)


for vid in want:
    outdir = os.path.join(HERE, "audio", vid)
    os.makedirs(outdir, exist_ok=True)
    manifest = []
    for i, ln in enumerate(videos[vid]):
        path = os.path.join(outdir, f"line-{ln['n']}.mp3")
        previous = videos[vid][i - 1]["text"] if i > 0 else None
        for attempt in range(1, MAX_ATTEMPTS + 1):
            res = synthesize(ln["text"], previous)
            with open(path, "wb") as f:
                f.write(base64.b64decode(res["audio_base64"]))
            rep = edge_report(path)
            if rep["ok"]:
                break
            print(f"  {vid} line {ln['n']} attempt {attempt}: {'; '.join(rep['problems'])}, regenerating")
        else:
            sys.exit(f"{vid} line {ln['n']}: still fails edge validation after {MAX_ATTEMPTS} attempts")
        words = words_from_alignment(res["alignment"], ln["text"])
        json.dump(words, open(os.path.join(outdir, f"line-{ln['n']}.words.json"), "w"), indent=1)
        d = duration(path)
        manifest.append({"line": ln["n"], "title": ln["title"], "file": f"line-{ln['n']}.mp3", "duration": d,
                         "word_count": len(words), "attempts": attempt, "text": ln["text"]})
        print(f"  {vid} line {ln['n']}  {d:>6.2f}s  {len(words):>3} words  attempts {attempt}  {ln['title']}")
    json.dump({"voice": VOICE, "model": MODEL, "settings": SETTINGS, "estimated": False, "lines": manifest},
              open(os.path.join(outdir, "manifest.json"), "w"), indent=2)
    print(f"{vid}: {round(sum(m['duration'] for m in manifest), 1)}s of speech, all clips edge-validated\n")
