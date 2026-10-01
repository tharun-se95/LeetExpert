"""Puts the cheatsheet carousels into the posting kit (../posting-kit/october.json).

Owner, 2026-09-30 (#132): Oct 1-3 carry three posts a day in mixed formats (a reel, a carousel, a
single image), then one post a day at 6 pm. Oct 2 and Oct 3 were three reels each, so each takes
a carousel in its 1 pm slot and the reel it displaces moves after Oct 9, where the rest of the
carousels follow one a day, alternating with those two reels at first.

Caption, hashtags, alt text and hook come from each package's post.md, so rerun this after
cheatsheet.py. check.py fails if october.json no longer matches.

  python3 kit.py
"""
import json
import re
from pathlib import Path

from cheatsheet import DATE, HERE, ROOT

KIT = HERE.parent / "posting-kit" / "october.json"

LAUNCH = {"hash-tables": ("2026-10-02", "1 pm"), "dynamic-programming": ("2026-10-03", "1 pm")}
# reels displaced from those slots: post id -> new date (6 pm)
MOVED = {"p13": "2026-10-11", "p10": "2026-10-13"}
DAILY = [("2026-10-10", "arrays"), ("2026-10-12", "sliding-window"), ("2026-10-14", "strings"),
         ("2026-10-15", "linked-lists"), ("2026-10-16", "stacks"), ("2026-10-17", "binary-search"),
         ("2026-10-18", "recursion-backtracking"), ("2026-10-19", "binary-trees"), ("2026-10-20", "heaps"),
         ("2026-10-21", "graphs"), ("2026-10-22", "intervals")]
SLOTS = ["9 am", "1 pm", "6 pm"]


def section(md, name):
    return re.search(rf"^## {re.escape(name)}[^\n]*\n\n(.*?)(?=\n## |\Z)", md, re.S | re.M).group(1).strip()


def entry(slug, date, slot):
    d = f"{DATE}-{slug}-cheatsheet"
    md = (ROOT / "marketing/instagram" / d / "post.md").read_text()
    alt = re.sub(r"\*\*(Slide \d+)\.\*\*", r"\1.", section(md, "Alt text"))
    return {"date": date, "post": f"cs-{slug}", "dir": d, "title": md.splitlines()[0].lstrip("# "),
            "caption": section(md, "Caption"), "hashtags": section(md, "Hashtags"), "alt": alt,
            "hook": section(md, "Hook"), "slot": slot}


def kit():
    posts = [p for p in json.loads(KIT.read_text()) if not p["post"].startswith("cs-")]
    for p in posts:
        if p["post"] in MOVED:
            p["date"], p["slot"] = MOVED[p["post"]], "6 pm"
    posts += [entry(s, d, t) for s, (d, t) in LAUNCH.items()]
    posts += [entry(s, d, "6 pm") for d, s in DAILY]
    posts.sort(key=lambda p: (p["date"], SLOTS.index(p["slot"])))
    days = [(p["date"], p["slot"]) for p in posts]
    assert len(days) == len(set(days)), "two posts share a slot"
    return posts


if __name__ == "__main__":
    posts = kit()
    KIT.write_text(json.dumps(posts, indent=1, ensure_ascii=False))
    for p in posts:
        print(p["date"], p["slot"], p["post"])
