"""Facts for the meeting-rooms carousel: meeting ends read by comparing every pair, and by sorting and comparing neighbours."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[5]
lesson = (ROOT / "courses/dsa/intervals/meeting-rooms.md").read_text()
block = next(b for b in re.findall(r"```python\n(.*?)```", lesson, re.S) if "def can_attend_meetings" in b)
source = Path("code/meetings.py").read_text()
# the shown function is the lesson's block with its comments stripped
bare = "\n".join(re.sub(r"\s+#.*$", "", line) for line in block.splitlines()) + "\n"
assert source.endswith(bare), "can_attend_meetings is not the lesson's block"
assert "Using `<=` would\nwrongly reject `[[1,5],[5,8]]`" in lesson

mod = {}
exec(source, mod)
brute, fast = mod["can_attend_brute"], mod["can_attend_meetings"]
# the same function with <= at the boundary, and nothing else changed
strict = "intervals[i][0] < intervals[i - 1][1]"
assert source.count(strict) == 1
loose = {}
exec(source.replace(strict, strict.replace("<", "<=")), loose)

# the lesson's examples
for meetings, want in (([[0, 30], [5, 10], [15, 20]], False), ([[7, 10], [2, 4]], True), ([[1, 5], [5, 8]], True)):
    assert brute([m[:] for m in meetings]) is want and fast([m[:] for m in meetings]) is want
assert loose["can_attend_meetings"]([[1, 5], [5, 8]]) is False


class Meeting(list):
    """A [start, end] that counts reads of its end; the brute force reads two ends per pair, the scan one per neighbour."""
    ends = 0

    def __getitem__(self, i):
        Meeting.ends += i == 1
        return list.__getitem__(self, i)


def ends_read(fn, meetings):
    Meeting.ends = 0
    return fn([Meeting(m) for m in meetings]), Meeting.ends


N = 1000
day = [[10 * ((i * 37) % N), 10 * ((i * 37) % N) + 7] for i in range(N)]   # shuffled, none overlapping: the worst case
(a, brute_ends), (b, fast_ends) = ends_read(brute, day), ends_read(fast, day)
assert a is True and b is True
clash = day + [[5005, 5012]]   # one meeting that overlaps another
assert brute([m[:] for m in clash]) is False and fast([m[:] for m in clash]) is False

print(json.dumps({"n": N, "pairs": brute_ends // 2, "neighbours": fast_ends}))
