"""Edge validation for voiceover clips.

A clip that begins or ends with audible energy at its very first/last frame
will click when it is butted against silence. That is exactly what request
stitching (`next_text`) produced: the model started the next utterance's
breath in the final milliseconds and the file boundary sliced it. TTS output
is non-deterministic, so this is checked on every clip, every build — a clean
run once proves nothing about the next generation.
"""
import math, struct, subprocess, sys

RATE = 44100
WIN = 441                 # 10 ms
EDGE_MAX_DB = -60.0       # the first and last window must be at least this quiet


def _pcm(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(RATE),
                          "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return struct.unpack(f"<{len(raw)//4}f", raw)


def _db(seg):
    r = math.sqrt(sum(v * v for v in seg) / max(1, len(seg)))
    return 20 * math.log10(r) if r > 1e-9 else -180.0


def edge_report(path):
    x = _pcm(path)
    head, tail = _db(x[:WIN]), _db(x[-WIN:])
    problems = []
    if head > EDGE_MAX_DB:
        problems.append(f"starts hot ({head:.1f} dB in first 10 ms)")
    if tail > EDGE_MAX_DB:
        problems.append(f"ends hot ({tail:.1f} dB in last 10 ms)")
    return {"path": path, "head_db": round(head, 1), "tail_db": round(tail, 1),
            "ok": not problems, "problems": problems}


if __name__ == "__main__":
    bad = 0
    for p in sys.argv[1:]:
        r = edge_report(p)
        bad += 0 if r["ok"] else 1
        print(f"{'PASS' if r['ok'] else 'FAIL'}  {p}  head {r['head_db']:>6} dB  tail {r['tail_db']:>6} dB"
              + (f"  ← {'; '.join(r['problems'])}" if r["problems"] else ""))
    print(f"\n{bad} of {len(sys.argv)-1} clips fail edge validation")
    sys.exit(1 if bad else 0)
