"""Daily story frames and highlight covers (#137).

One story a day for the rest of October, tied to that day's feed post (../posting-kit/october.json):

- a reel day: a quiz-sticker prompt that asks the reel's own "Your turn" challenge, and the next
  day an answer frame. The answer is not typed here on trust: REELS names the line of the reel's
  verifier that asserts it, and verify_reels() runs that verifier.
- a cheatsheet day: a poll, "which trap has cost you a test case?", whose options are the sheet's
  own traps (../carousel/sheets.json).
- a reel-carousel day: a poll on how people learn, which claims nothing.

A frame carries the question and leaves its lower half empty for Instagram's sticker; story.md
beside the frames gives the sticker's type, text and options. Frames are 1080x1920 and keep
clear of the top 250px and the bottom 340px, where Instagram draws its own controls.

Writes HTML to ../carousel/build/story-<date>/ and build/highlight-covers/ for
../carousel/render.mjs (a `size` file tells it 1080x1920), and story.md / highlights.md.

  python3 storykit.py && (cd ../carousel && node render.mjs $(ls build | grep -E '^(story-|highlight-)') && python3 kit.py)
"""
import datetime
import html
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / "carousel"))
sys.path.insert(0, str(HERE.parent / "spotbug"))
from glyphs import FACES, draw  # noqa: E402
from spotbug import CSS as CARD_CSS  # noqa: E402  (the reels' look, with the code face)

ROOT = HERE.parents[2]
BUILD = HERE.parent / "carousel" / "build"
POSTS = ROOT / "marketing/instagram"
SHEETS = {s["moduleSlug"]: s for s in json.loads((HERE.parent / "carousel" / "sheets.json").read_text())["sheets"]}
FIRST, LAST = "2026-10-04", "2026-10-31"  # Oct 1-3 were posted before the kit existed
e = html.escape

# post id -> the reel's challenge. proof: a line of the reel's verifier (sources/<verifier>) that
# asserts the answer; it must end with `answer`. options: what the quiz sticker offers, the answer
# among them. context: what the question refers to ("this list"), and it must be in the reel's
# post.md word for word.
REELS = {
    "p08": {"verifier": "verify.py", "proof": "assert bug([1, 2, 2, 3]) == [1, 2, 3]", "answer": "[1, 2, 3]",
            "options": ["[1, 3]", "[1, 2, 3]", "[1, 2, 2, 3]"]},
    "p11": {"verifier": "verify.py", "proof": "assert fix(11, [1, 2, 3, 4, 5]) == 3", "answer": "3", "options": ["2", "3", "4"]},
    "p12": {"verifier": "verify.py", "proof": "assert 10 - 3 + 1 == 8", "answer": "8", "options": ["7", "8", "10"]},
    "p14": {"verifier": "verify.mjs", "proof": "find(hides), 15", "answer": "15", "options": ["8", "14", "15"]},
    "p17": {"verifier": "verify.py", "proof": "for i in range(len(ev5))) == 6", "answer": "6", "options": ["5", "6", "120"]},
    "p18": {"verifier": "verify.py", "proof": "assert len(call_tree(6)[1]) == calls(6) == 25", "answer": "25", "options": ["13", "25", "64"]},
    "p13": {"verifier": "verify.py", "proof": "assert len(search_trace(ARR, 13)) == 3", "answer": "3", "options": ["2", "3", "7"],
            "context": "[1, 3, 5, 7, 9, 11, 13]"},
    "p10": {"verifier": "verify.py", "proof": "assert range_sum(P, 0, 4) == P[5] - P[0] == 15", "answer": "15", "options": ["12", "15", "17"],
            "context": "nums = [2, 4, 1, 5, 3]"},
}

CSS = CARD_CSS + """
html,body{height:1920px}
.top{top:270px}
.content{top:400px;bottom:400px;justify-content:flex-start}
.foot{bottom:340px}
.q{font-family:"Space Mono",monospace;font-size:76px;font-weight:700;line-height:1.14;margin-top:22px}
.sub{font-size:44px;color:#cbd5e1;line-height:1.4;margin-top:36px}
.ctx{font-family:"JetBrains Mono",monospace;font-variant-ligatures:none;font-size:46px;background:#0e1520;border:2px solid #263248;border-radius:22px;padding:26px 32px;margin-top:40px;align-self:flex-start}
.tap{font-family:"Space Mono",monospace;font-size:38px;font-weight:700;color:#5eead4;margin-top:56px}
.ans{font-family:"JetBrains Mono",monospace;font-variant-ligatures:none;font-size:150px;font-weight:700;color:#5eead4;line-height:1.1;margin-top:50px}
.ans.long{font-size:104px}
.cover{position:absolute;left:0;right:0;top:0;bottom:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
.disc{width:560px;height:560px;border-radius:50%;background:#0e1520;border:6px solid #263248;display:flex;align-items:center;justify-content:center}
.disc svg{width:300px;height:300px;fill:none;stroke:#5eead4;stroke-width:6;stroke-linecap:round;stroke-linejoin:round}
.cover .name{position:absolute;left:0;right:0;top:1300px;text-align:center;font-family:"Space Mono",monospace;font-size:54px;font-weight:700}
"""

# name -> the art inside the circle Instagram crops a highlight cover to (viewBox 0 0 100 100).
# Start here is the brand lamp, the one green in the chrome; the rest are line icons in the accent.
COVERS = {
    "Start here": '<circle cx="50" cy="50" r="30" style="stroke:#3fae5a;opacity:.3"/><circle cx="50" cy="50" r="17" style="fill:#3fae5a;stroke:none"/>',
    "Cheatsheets": '<path d="M26 12 H62 L76 26 V88 H26 Z M62 12 V26 H76 M38 44 H64 M38 58 H64 M38 72 H54"/>',
    "Quizzes": '<path d="M34 36 C34 14 68 14 68 36 C68 50 50 50 50 64"/><circle cx="50" cy="82" r="2.5" style="fill:#5eead4"/>',
    "Reels": '<rect x="16" y="22" width="68" height="56" rx="10"/><path d="M43 38 V62 L63 50 Z"/>',
}


def section(md, name):
    return re.search(rf"^## {re.escape(name)}[^\n]*\n\n(.*?)(?=\n## |\Z)", md, re.S | re.M).group(1).strip()


def challenge(post):
    """The reel's own 'Your turn' question, from its caption."""
    md = (POSTS / post["dir"] / "post.md").read_text()
    q = re.search(r"^Your turn: (.+?)\s*👇", section(md, "Caption"), re.M).group(1)
    r = REELS[post["post"]]
    assert r["answer"] in r["options"] and len(set(r["options"])) == len(r["options"]), f"{post['post']}: the options need the answer once"
    assert r["proof"].endswith(r["answer"]), f"{post['post']}: the proof line does not end with the answer {r['answer']}"
    assert r["proof"] in (POSTS / post["dir"] / "sources" / r["verifier"]).read_text(), \
        f"{post['post']}: {r['verifier']} no longer asserts `{r['proof']}`"
    assert "context" not in r or r["context"] in md, f"{post['post']}: its post.md does not say {r.get('context')}"
    return q[0].upper() + q[1:], r


def verify_reels(posts):
    """Runs every reel verifier a story answer rests on; a failing one means the answer is unproven."""
    for post in posts:
        if post["post"] in REELS and FIRST <= post["date"] <= LAST:
            src = POSTS / post["dir"] / "sources"
            cmd = ["node", "verify.mjs"] if REELS[post["post"]]["verifier"].endswith(".mjs") else [sys.executable, "verify.py"]
            run = subprocess.run(cmd, cwd=src, capture_output=True, text=True)
            assert run.returncode == 0, f"{post['dir']}: {' '.join(cmd)} failed, so its story answer is unproven\n{run.stderr[-400:]}"


def frames(post, before):
    """The day's frames: yesterday's answer (after a reel), then today's prompt."""
    out = []
    if before and before["post"] in REELS:
        q, r = challenge(before)
        long = " long" if len(r["answer"]) > 6 else ""
        ctx = f'<div class="ctx">{e(r["context"])}</div>' if "context" in r else ""
        out.append({"kind": "answer", "sticker": "none", "question": q, "answer": r["answer"],
                    "html": f'<div class="k">YESTERDAY\'S ANSWER</div><div class="sub">{e(q)}</div>{ctx}<div class="ans{long}">{e(r["answer"])}</div>'
                            f'<div class="sub">The reel walks through why. It is on the feed.</div>',
                    "alt": f"Yesterday's answer. {q} {r.get('context', '')} The answer: {r['answer']}. The reel walks through why."})
    pid = post["post"]
    if pid in REELS:
        q, r = challenge(post)
        ctx = f'<div class="ctx">{e(r["context"])}</div>' if "context" in r else ""
        out.append({"kind": "quiz", "sticker": "Quiz", "question": q, "options": r["options"], "answer": r["answer"],
                    "html": f'<div class="k">TODAY ON THE FEED · REEL</div><div class="q">{e(q)}</div>{ctx}<div class="tap">Tap your answer ↓</div>',
                    "alt": f"Quiz for today's reel. {q} {r.get('context', '')} Tap your answer."})
    elif pid.startswith("cs-"):
        sheet = SHEETS[pid[3:]]
        traps = [t["title"] for t in sheet["traps"]]
        q = "Which trap has cost you a test case?"
        out.append({"kind": "poll", "sticker": "Poll", "question": q, "options": traps,
                    "html": f'<div class="k">TODAY ON THE FEED · CHEATSHEET</div><div class="q">{e(q)}</div>'
                            f'<div class="sub">{e(sheet["title"])}: the real cheatsheet is today\'s carousel.</div><div class="tap">Vote ↓</div>',
                    "alt": f"Poll for today's {sheet['title']} cheatsheet carousel. {q} Vote."})
    else:
        assert pid.startswith("rc-"), f"{pid}: no story is defined for this kind of post"
        q = "How do you learn a pattern best?"
        out.append({"kind": "poll", "sticker": "Poll", "question": q, "options": ["Watch the reel", "Swipe the carousel"],
                    "html": f'<div class="k">TODAY ON THE FEED · CAROUSEL</div><div class="q">{e(q)}</div>'
                            f'<div class="sub">Today\'s carousel is a reel you can swipe: {e(post["hook"].splitlines()[0])}</div><div class="tap">Vote ↓</div>',
                    "alt": f"Poll for today's carousel. {q} Vote."})
    return out


def page(title, body, foot):
    return (f'<!doctype html><html lang="en"><head><meta charset="UTF-8"/><title>{e(title)}</title><style>{CSS}{FACES}</style></head><body>'
            f'<div class="top"><div class="brand">leetExpert<i></i></div><div class="n">STORY</div></div>'
            f'<div class="content">{draw(body)}</div>'
            f'<div class="foot"><span>@leetexpert</span><span>{e(foot)}</span></div></body></html>')


def story_md(date, post, fs):
    day = datetime.date.fromisoformat(date).strftime("%a %b %-d")
    parts = [f"# Story for {day}: {post['post']} ({post['title']})\n",
             "Post the frames in order, at or just after the feed post goes up. Place each sticker in the empty lower half of its frame.\n"]
    for i, f in enumerate(fs, 1):
        lines = [f"## Frame {i}: `slide{i}.png` ({f['kind']})\n"]
        if f["kind"] == "answer":
            lines.append(f"- **Sticker:** none. It answers yesterday's quiz: {f['question']} → **{f['answer']}**")
        else:
            lines.append(f"- **Sticker:** {f['sticker']}")
            lines.append(f"- **Sticker question:** {f['question']}")
            for o in f["options"]:
                lines.append(f"- **Option:** {o}" + (" (correct)" if o == f.get("answer") else ""))
        lines.append(f"- **Alt text:** {f['alt'].replace('  ', ' ').strip()}")
        parts.append("\n".join(lines) + "\n")
    return "\n".join(parts)


def stories(posts):
    """date -> (package dir, story.md, frames) for every day from FIRST to LAST with a feed post."""
    days = {}
    for p in posts:
        days.setdefault(p["date"], []).append(p)
    out = {}
    for date in sorted(d for d in days if FIRST <= d <= LAST):
        assert len(days[date]) == 1, f"{date} has {len(days[date])} feed posts; the story kit pairs one story with one post"
        post = days[date][0]
        prev = str(datetime.date.fromisoformat(date) - datetime.timedelta(days=1))
        before = days[prev][0] if prev >= FIRST and prev in days else None
        fs = frames(post, before)
        out[date] = (POSTS / "stories" / date, story_md(date, post, fs), fs)
    return out


def attach(posts):
    """Adds each day's story to its feed post, for the posting kit page."""
    for date, (pkg, _, fs) in stories(posts).items():
        post = next(p for p in posts if p["date"] == date)
        post["story"] = {"dir": str(pkg.relative_to(POSTS)),
                         "frames": [{k: f[k] for k in ("kind", "sticker", "question", "options", "answer") if k in f} for f in fs]}
    return posts


def highlights_md():
    rows = "\n".join(f"| `slide{i}.png` | {name} |" for i, name in enumerate(COVERS, 1))
    return ("# Highlight covers\n\nSet each as its highlight's cover (Edit highlight → Edit cover). Instagram crops the cover to a circle: "
            "the art sits inside the centre disc, and the name under it is for telling the files apart, not for the crop.\n\n"
            f"| File | Highlight |\n|---|---|\n{rows}\n")


def write_build(name, pkg, pages):
    d = BUILD / name
    shutil.rmtree(d, ignore_errors=True)
    d.mkdir(parents=True)
    for i, p in enumerate(pages, 1):
        (d / f"slide{i}.html").write_text(p)
    (d / "target").write_text(str(pkg.relative_to(ROOT)))
    (d / "size").write_text("1080x1920")


def build(posts):
    for date, (pkg, _, fs) in stories(posts).items():
        foot = "new on the feed today"
        write_build(f"story-{date}", pkg, [page(f"story {date} {i}", f["html"], foot) for i, f in enumerate(fs, 1)])
    covers = [(f'<!doctype html><html lang="en"><head><meta charset="UTF-8"/><title>{e(name)}</title><style>{CSS}{FACES}</style></head><body>'
               f'<div class="cover"><div class="disc"><svg viewBox="0 0 100 100" role="img" aria-label="{e(name)}">{art}</svg></div>'
               f'<div class="name">{e(name)}</div></div></body></html>') for name, art in COVERS.items()]
    write_build("highlight-covers", POSTS / "highlights", covers)


if __name__ == "__main__":
    from kit import kit  # here, not at the top: kit.py imports this module to attach the stories
    posts = kit(stories=False)
    verify_reels(posts)
    build(posts)
    for date, (pkg, md, fs) in stories(posts).items():
        pkg.mkdir(parents=True, exist_ok=True)
        (pkg / "story.md").write_text(md)
        print(date, [f["kind"] for f in fs])
    (POSTS / "highlights").mkdir(exist_ok=True)
    (POSTS / "highlights" / "highlights.md").write_text(highlights_md())
