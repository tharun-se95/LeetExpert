"""Puts the cheatsheet (#133), reel (#134) and spot-the-bug (#135) carousels and the Big-O quiz
singles (#136) into the posting kit
(../posting-kit/october.json).

Owner, 2026-09-30 (#132): Oct 1-3 carry three posts a day in mixed formats (a reel, a carousel, a
single image), then one post a day at 6 pm. Oct 2 and Oct 3 were three reels each, so each takes
a carousel in its 1 pm slot and the reel it displaces moves after Oct 9, where the rest of the
carousels follow one a day, alternating with those two reels at first.

Caption, hashtags, alt text and hook come from each package's post.md, so rerun this after
cheatsheet.py. check.py fails if october.json no longer matches.

  python3 kit.py
"""
import datetime
import json
import re
from pathlib import Path

import sys

from cheatsheet import DATE, HERE, ROOT

sys.path.insert(0, str(HERE.parent / "spotbug"))
sys.path.insert(0, str(HERE.parent / "bigoquiz"))
sys.path.insert(0, str(HERE.parent / "storykit"))
sys.path.insert(0, str(HERE.parent / "lessons"))
import bigoquiz  # noqa: E402
import lessons  # noqa: E402
import spotbug  # noqa: E402
import storykit  # noqa: E402

KIT = HERE.parent / "posting-kit" / "october.json"

LAUNCH = {"hash-tables": ("2026-10-02", "1 pm"), "dynamic-programming": ("2026-10-03", "1 pm")}
# reels displaced from those slots: post id -> new date (6 pm)
MOVED = {"p13": "2026-10-11", "p10": "2026-10-13"}
DAILY = [("2026-10-10", "arrays"), ("2026-10-12", "sliding-window"), ("2026-10-14", "strings"),
         ("2026-10-15", "linked-lists"), ("2026-10-16", "stacks"), ("2026-10-17", "binary-search"),
         ("2026-10-18", "recursion-backtracking"), ("2026-10-19", "binary-trees"), ("2026-10-20", "heaps"),
         ("2026-10-21", "graphs"), ("2026-10-22", "intervals")]
# The reels' carousel versions (#134), in the order their reels post, from Oct 23: each lands at
# least two weeks after its reel, so it reaches the people who saved rather than watched.
# The last three run into November.
REELS = ["anagram-tally", "two-pointers-reel", "coach-wont-answer", "monotonic-stack", "remove-while-iterating",
         "sliding-window-inchworm", "max-sum-k-window", "js-float-mid", "call-stack-trays", "fib-memo",
         "binary-search-halves", "prefix-sum-odometer"]
REELS_FROM = "2026-10-23"
# Spot-the-bug carousels (#135, ../spotbug/), one a day after the last reel carousel, so nothing
# already scheduled moves; the owner may pull them earlier.
SPOTBUG_FROM = "2026-11-04"
# Big-O quiz singles (#136, ../bigoquiz/), one a day after the last spot-the-bug carousel. They are
# quick posts for gaps in the calendar, so the owner may pull any of them earlier.
BIGO_FROM = "2026-11-10"
# Lesson carousels (#172, ../lessons/), one a day after the last quiz single, in the order built.
LESSONS_FROM = "2026-11-18"
# post id -> the order it was built in; a new post is appended, so earlier dates never move
LESSON_ORDER = ["dynamic-array-append", "string-concat-loop", "mutable-key", "matrix-binary-search", "move-zeroes", "hash-collisions", "build-order", "provinces", "growth-beats-hardware", "space-complexity", "lowest-common-ancestor", "arrays-in-memory", "birthday-collisions", "queue-pop-front", "skewed-bst", "greedy-coins", "insertion-sort-inversions", "heap-as-array", "trie-prefix", "cycle-detection", "subarray-sum-seed", "min-stack-snapshots", "container-shorter-wall", "search-the-answer"]
SLOTS = ["9 am", "1 pm", "6 pm"]


def section(md, name):
    return re.search(rf"^## {re.escape(name)}[^\n]*\n\n(.*?)(?=\n## |\Z)", md, re.S | re.M).group(1).strip()


def entry(slug, date, slot, kind="cheatsheet", prefix="cs", made=DATE):
    d = f"{made}-{slug}-{kind}"
    md = (ROOT / "marketing/instagram" / d / "post.md").read_text()
    alt = re.sub(r"\*\*(Slide \d+)\.\*\*", r"\1.", section(md, "Alt text"))
    post = {"date": date, "post": f"{prefix}-{slug}", "dir": d, "title": md.splitlines()[0].lstrip("# "),
            "caption": section(md, "Caption"), "hashtags": section(md, "Hashtags"), "alt": alt,
            "hook": section(md, "Hook"), "slot": slot}
    if "\n## First comment" in md:  # a quiz single's answer, posted as the first comment
        post["comment"] = section(md, "First comment")
    return post


def kit(stories=True):
    """The whole schedule; each October day from Oct 4 also carries its story (#137, ../storykit/)."""
    posts = [p for p in json.loads(KIT.read_text()) if not p["post"].startswith(("cs-", "rc-", "sb-", "bq-", "lc-"))]
    for p in posts:
        if p["post"] in MOVED:
            p["date"], p["slot"] = MOVED[p["post"]], "6 pm"
    posts += [entry(s, d, t) for s, (d, t) in LAUNCH.items()]
    posts += [entry(s, d, "6 pm") for d, s in DAILY]
    start = datetime.date.fromisoformat(REELS_FROM)
    posts += [entry(s, str(start + datetime.timedelta(days=i)), "6 pm", "carousel", "rc") for i, s in enumerate(REELS)]
    start = datetime.date.fromisoformat(SPOTBUG_FROM)
    posts += [entry(b, str(start + datetime.timedelta(days=i)), "6 pm", "spot-the-bug", "sb", spotbug.DATE)
              for i, b in enumerate(spotbug.BUGS)]
    start = datetime.date.fromisoformat(BIGO_FROM)
    posts += [entry(q, str(start + datetime.timedelta(days=i)), "6 pm", "big-o-quiz", "bq", bigoquiz.DATE)
              for i, q in enumerate(bigoquiz.QUIZZES)]
    assert sorted(LESSON_ORDER) == lessons.POSTS, "LESSON_ORDER and ../lessons/posts name different posts"
    start = datetime.date.fromisoformat(LESSONS_FROM)
    posts += [entry(q, str(start + datetime.timedelta(days=i)), "6 pm", "lesson", "lc", lessons.load(q)["date"])
              for i, q in enumerate(LESSON_ORDER)]
    posts.sort(key=lambda p: (p["date"], SLOTS.index(p["slot"])))
    days = [(p["date"], p["slot"]) for p in posts]
    assert len(days) == len(set(days)), "two posts share a slot"
    for p in posts:
        p.pop("story", None)
    return storykit.attach(posts) if stories else posts


if __name__ == "__main__":
    posts = kit()
    KIT.write_text(json.dumps(posts, indent=1, ensure_ascii=False))
    for p in posts:
        print(p["date"], p["slot"], p["post"])
