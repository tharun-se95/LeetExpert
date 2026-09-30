"""Gives words.json the script's words, keeping Scribe's timings.

  python3 respell.py            # from a reel's sources/: rewrites words.json in place

Scribe hears the take, not the script: "lo" comes back as "Low", "hash map" as
"HashMap", "leetExpert" as "Leet Expert". Captions and anchors are written against
the script, so each Scribe token is aligned to the script and takes its spelling:
one-for-one swaps directly, a glued or split token when the letters agree. A run of
spelled-out letters ("A A C C") keeps Scribe's joined "AACC", which reads better as
a caption. Anything else it cannot align is left as heard and reported.
"""
import json, re, sys


def key(t):
    return re.sub(r"[^a-z0-9]", "", t.lower())


def respell(words, script):
    toks = script.split()
    a, b = [key(w["t"]) for w in words], [key(t) for t in toks]
    n, m = len(a), len(b)
    # edit-distance alignment where gluing ("HashMap" = "hash map") and splitting
    # ("Leet Expert" = "leetExpert") are free when the letters agree
    INF = float("inf")
    cost = [[INF] * (m + 1) for _ in range(n + 1)]
    step = [[None] * (m + 1) for _ in range(n + 1)]
    cost[n][m] = 0
    for i in range(n, -1, -1):
        for j in range(m, -1, -1):
            opts = []
            if i < n and j < m:
                opts.append((cost[i + 1][j + 1] + (a[i] != b[j]), (1, 1)))
            for k in range(2, 5):
                if i < n and j + k <= m and a[i] == "".join(b[j:j + k]):
                    opts.append((cost[i + 1][j + k], (1, k)))
                if j < m and i + k <= n and "".join(a[i:i + k]) == b[j]:
                    opts.append((cost[i + k][j + 1], (k, 1)))
            if i < n:
                opts.append((cost[i + 1][j] + 1, (1, 0)))
            if j < m:
                opts.append((cost[i][j + 1] + 1, (0, 1)))
            if opts:
                cost[i][j], step[i][j] = min(opts, key=lambda o: o[0])
    out, changes, unaligned, i, j = [], [], [], 0, 0
    while i < n or j < m:
        di, dj = step[i][j]
        heard, said = words[i:i + di], toks[j:j + dj]
        if di and dj:
            if di == 1 and dj > 1 and all(len(x) == 1 for x in b[j:j + dj]):
                text = heard[0]["t"]  # spelled-out letters: keep "AACC"
            else:
                text = " ".join(said)
            was = " ".join(w["t"] for w in heard)
            if was != text:
                changes.append((was, text))
            out.append({"t": text, "s": heard[0]["s"], "e": heard[-1]["e"]})
        elif di:
            out += heard
            unaligned.append(heard[0]["t"])
        i, j = i + di, j + dj
    words[:] = out
    return changes, unaligned


if __name__ == "__main__":
    words = json.load(open("words.json"))
    changes, unaligned = respell(words, open("script.txt").read())
    json.dump(words, open("words.json", "w"))
    swaps = [f"{x} -> {y}" for x, y in changes if key(x) != key(y) or " " in y or " " in x]
    print(f"respelled {len(changes)} tokens; spelling changes: {', '.join(swaps) or 'none'}", file=sys.stderr)
    if unaligned:
        print("left as heard (not in the script): " + " | ".join(unaligned), file=sys.stderr)
