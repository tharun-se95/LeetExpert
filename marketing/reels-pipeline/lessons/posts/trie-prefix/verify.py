"""Facts for the trie carousel: the course's reference Trie on the lesson's words, against scanning a set."""
import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[5]
assert Path("code/trie.py").read_text() == (ROOT / "web/tests/reference/tries/implement-trie.py").read_text()
lesson = (ROOT / "courses/dsa/tries/trie-structure-and-prefix-search.md").read_text()
assert "`car`, `card`, `cat`, and `cats`" in lesson and "the walk stops dead after 2 characters, on a 5-character query" in lesson

spec = importlib.util.spec_from_file_location("trie", "code/trie.py")
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)


def build(words):
    t = mod.Trie()
    for w in words:
        t.insert(w)
    return t


def nodes(node):
    """Character nodes below this one (the end-of-word mark is not a node)."""
    return sum(1 + nodes(child) for ch, child in node.items() if ch != "$")


def matched(t, s):
    """Characters of s the walk consumes before it stops."""
    node, n = t.root, 0
    for ch in s:
        if ch not in node:
            break
        node, n = node[ch], n + 1
    return n


WORDS = ["car", "card", "cat", "cats"]
shared = build(WORDS)
two = build(["card", "cat"])   # the lesson's example: "car" is on the way to "card", but not stored
assert two.search("car") is False and two.starts_with("car") is True and two.search("card") is True

N, PREFIX = 10_000, "pre"
# 10,000 distinct words; a few start with the prefix
alphabet = "abcdefghijklmnopqrstuvwxyz"
many = ["".join(alphabet[(i // 26 ** k) % 26] for k in range(4)) + "x" for i in range(N - 3)] + ["prefix", "pretend", "press"]
assert len(set(many)) == N
as_set, big = set(many), build(many)
scan_checks = sum(1 for _ in as_set)                     # the set must test every entry
assert {"prefix", "press", "pretend"} <= {w for w in as_set if w.startswith(PREFIX)}
assert big.starts_with(PREFIX) and not big.starts_with("prq")

print(json.dumps({"words": ", ".join(WORDS), "chars": sum(map(len, WORDS)), "nodes": nodes(shared.root),
                  "cable_matched": matched(two, "cable"), "cable_len": len("cable"),
                  "n": N, "scan_checks": scan_checks, "prefix_steps": matched(big, PREFIX)}))
