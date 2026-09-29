"""Records the Hope take for script.txt and times it with Scribe.

  ELEVENLABS_API_KEY=... python3 narrate.py   # writes vo.mp3 + words.json

Pipeline settings (reels-pipeline/README.md §4): eleven_v3, voice Hope, stability
0.5, one continuous take, levelled to -15 LUFS, no pause trimming. The key is
read from the environment only and never written to disk.
"""
import json, os, subprocess, sys, urllib.request, uuid

KEY = os.environ.get("ELEVENLABS_API_KEY") or sys.exit("set ELEVENLABS_API_KEY")
VOICE = "WZlYpi1yf6zJhNWXih74"  # Hope
API = "https://api.elevenlabs.io/v1"
FFMPEG = os.environ.get("FFMPEG", "ffmpeg")


def post(url, body, ctype):
    req = urllib.request.Request(url, data=body, headers={"xi-api-key": KEY, "Content-Type": ctype})
    with urllib.request.urlopen(req, timeout=300) as r:
        return r.read()


text = open("script.txt").read().strip()
settings = {"stability": 0.5}
if os.environ.get("VO_SPEED"):  # optional, e.g. 1.08 for a slightly quicker read
    settings["speed"] = float(os.environ["VO_SPEED"])
audio = post(f"{API}/text-to-speech/{VOICE}?output_format=mp3_44100_192",
             json.dumps({"text": text, "model_id": "eleven_v3", "voice_settings": settings}).encode(), "application/json")
open("vo_raw.mp3", "wb").write(audio)
subprocess.run([FFMPEG, "-y", "-loglevel", "error", "-i", "vo_raw.mp3", "-af", "loudnorm=I=-15:TP=-1.5:LRA=11", "-ar", "44100", "vo.mp3"], check=True)
os.remove("vo_raw.mp3")

# Scribe word timings, from the levelled file so they match what is muxed
b = uuid.uuid4().hex
body = (f"--{b}\r\nContent-Disposition: form-data; name=\"model_id\"\r\n\r\nscribe_v1\r\n"
        f"--{b}\r\nContent-Disposition: form-data; name=\"timestamps_granularity\"\r\n\r\nword\r\n"
        f"--{b}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"vo.mp3\"\r\nContent-Type: audio/mpeg\r\n\r\n").encode()
body += open("vo.mp3", "rb").read() + f"\r\n--{b}--\r\n".encode()
res = json.loads(post(f"{API}/speech-to-text", body, f"multipart/form-data; boundary={b}"))
words = [{"t": w["text"].strip(), "s": round(w["start"], 2), "e": round(w["end"], 2)}
         for w in res["words"] if w.get("type", "word") == "word" and w["text"].strip()]
json.dump(words, open("words.json", "w"))
print(f"vo.mp3 + words.json ({len(words)} words, {words[-1]['e']:.1f}s); now run gen.py")
