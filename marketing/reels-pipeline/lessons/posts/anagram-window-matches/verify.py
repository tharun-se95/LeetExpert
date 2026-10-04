"""Facts for the anagram-window carousel: characters of s2 read by re-sorting every window, and by sliding a match count."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[5]
lesson = (ROOT / "courses/dsa/sliding-window/permutation-in-string.md").read_text()
block = next(b for b in re.findall(r"```python\n(.*?)```", lesson, re.S) if "def check_inclusion" in b)
source = Path("code/window.py").read_text()
# the shown function is the lesson's block without its comments (trailing ones stripped, comment-only lines dropped)
bare = "\n".join(re.sub(r"\s+#.*$", "", l) for l in block.splitlines() if not l.strip().startswith("#")) + "\n"
assert source.endswith(bare), "check_inclusion is not the lesson's block"
assert 's1 = "ab", s2 = "eidbaooo"  →  true   ("ba" at index 3)' in lesson
assert "changes at most 2\nletters' counts" in lesson

mod = {}
exec(source, mod)
brute, fast = mod["check_inclusion_brute"], mod["check_inclusion"]
for s1, s2, want in (("ab", "eidbaooo", True), ("ab", "eidboaoo", False), ("abc", "ab", False), ("a", "a", True)):
    assert fast(s1, s2) is want and (len(s1) > len(s2) or brute(s1, s2) is want)


class Counted(list):
    """s2 as a list of characters that counts the characters read from it by index."""
    reads = 0

    def __getitem__(self, i):
        self.reads += 1
        return list.__getitem__(self, i)


N, K = 10_000, 100
s2 = "".join(chr(97 + (i * 7 + i // 13) % 25) for i in range(N))   # a to y only; no randomness
s1 = "z" + s2[:K - 1]                                              # holds a z, so no window can match: the full scan
a, b = Counted(s2), Counted(s2)
assert brute(s1, a) is False and fast(s1, b) is False
hit = s2[5000:5000 + K][::-1]                                      # a real anagram, found by both
assert brute(hit, list(s2)) is True and fast(hit, list(s2)) is True

print(json.dumps({"n": N, "k": K, "windows": N - K + 1, "brute_reads": a.reads, "fast_reads": b.reads}))
