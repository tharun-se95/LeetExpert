"""Gives words.json the script's spelling where Scribe glued spoken words together.

  python3 respell.py            # from a reel's sources/: rewrites words.json in place

Scribe writes "hash map" as "HashMap", and the caption then shows a word the
narrator never said. A token whose letters equal two or three consecutive script
words, and that is not itself a script word, takes the script's phrase. Timings
are untouched. Spelled-out letters ("A A C C" -> "AACC") are left alone: the
joined form reads better as a caption than four single letters.
"""
import json, re, sys


def key(t):
    return re.sub(r"[^a-z0-9]", "", t.lower())


def respell(words, script):
    toks = script.split()
    singles = {key(t) for t in toks}
    phrases = {}
    for n in (2, 3):
        for i in range(len(toks) - n + 1):
            run = toks[i:i + n]
            if all(len(key(t)) > 1 for t in run):
                # the phrase without its trailing punctuation; the token keeps its own
                phrases.setdefault(key("".join(run)), re.sub(r"[^\w'é]+$", "", " ".join(run)))
    fixed = []
    for w in words:
        k = key(w["t"])
        if k in phrases and k not in singles:
            tail = re.search(r"[^\w'é]*$", w["t"]).group(0)
            fixed.append((w["t"], phrases[k] + tail))
            w["t"] = phrases[k] + tail
    return fixed


if __name__ == "__main__":
    words = json.load(open("words.json"))
    fixed = respell(words, open("script.txt").read())
    json.dump(words, open("words.json", "w"))
    print("respelled: " + (", ".join(f"{a} -> {b}" for a, b in fixed) or "nothing"), file=sys.stderr)
