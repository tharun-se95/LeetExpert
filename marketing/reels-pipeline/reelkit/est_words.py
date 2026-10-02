"""Stand-in word timings for a silent preview, until Scribe times the real take.

Writes words.json in Scribe's shape ({t, s, e} per word). The final render
always uses Scribe's timings; this only lets the visuals be built first.
"""
import json, re

words, t = [], 0.1
for w in open("script.txt").read().split():
    letters = len(re.sub(r"[^A-Za-z0-9]", "", w))
    dur = 0.05 + 0.05 * letters
    words.append({"t": w, "s": round(t, 2), "e": round(t + dur, 2)})
    t += dur + 0.03
    if w[-1] in ".?!…" or w.endswith('."'): t += 0.26
    elif w[-1] in ",:": t += 0.1
json.dump(words, open("words.json", "w"))
print(f"{len(words)} words, {t:.1f}s")
