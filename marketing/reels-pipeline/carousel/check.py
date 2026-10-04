"""Fails if a cheatsheet carousel no longer matches the product.

1. Re-dumps gold.ts (dump_sheets.ts) and compares it to sheets.json.
2. Rebuilds every post.md from sheets.json and compares it to the package's copy.
3. Checks each package has exactly the slides its build has (render.mjs made them).
4. Checks the posting kit carries each carousel as kit.py places it.
5. Rebuilds every reel carousel (reelslides.py; its words must be the reel's own) and compares
   its post.md and slide count, from the frames already rendered.
6. Reruns the spot-the-bug verifiers in both runtimes (../spotbug/verify.py, verify.mjs) against
   facts.json, then rebuilds each of those carousels' post.md and compares it and its slides.
7. Reruns the Big-O quiz verifier (../bigoquiz/verify.py) against its facts.json, then rebuilds
   each quiz's post.md and compares it and its image.
9. Reruns each lesson carousel's verifiers in both runtimes (../lessons/), then rebuilds its
   post.md and compares it and its slides.
8. Reruns every reel verifier a story answer rests on (../storykit/), then rebuilds each day's
   story.md and compares it and its frames; the four highlight covers must be there too.

  PYTHONDONTWRITEBYTECODE=1 python3 check.py
"""
import json
import re
import subprocess

from cheatsheet import DATA, HERE, ROOT, build
from kit import KIT, kit
import reelslides

fresh = subprocess.run(["npx", "tsx", str(HERE / "dump_sheets.ts")], cwd=ROOT / "web",
                       capture_output=True, text=True, check=True).stdout
assert json.loads(fresh) == DATA, "sheets.json drifted from gold.ts: re-run dump_sheets.ts, then cheatsheet.py and render.mjs"

problems = []
for slug, (pkg, md, n) in build().items():
    if not (pkg / "post.md").exists() or (pkg / "post.md").read_text() != md:
        problems.append(f"{pkg.name}/post.md differs from a fresh build")
    pngs = sorted(p.name for p in pkg.glob("slide*.png"))
    want = sorted(f"slide{i}.png" for i in range(1, n + 1))
    if pngs != want:
        problems.append(f"{pkg.name}: slides {pngs} but the build has {n}")
    tags = re.search(r"## Hashtags\n\n(.+)\n", md).group(1).split()
    if len(tags) != 5 or len(set(tags)) != 5:
        problems.append(f"{pkg.name}: {len(tags)} hashtags, Instagram allows exactly 5 to be used")
for car in sorted(p.parent.parent for p in (ROOT / "marketing/instagram").glob("*-carousel/sources/slides.json")):
    md = reelslides.build(car)
    if (car / "post.md").read_text() != md:
        problems.append(f"{car.name}/post.md differs from a fresh build")
    n = len(list((HERE / "build" / car.name).glob("slide*.html")))
    if sorted(p.name for p in car.glob("slide*.png")) != sorted(f"slide{i}.png" for i in range(1, n + 1)):
        problems.append(f"{car.name}: its slides don't match its build of {n}")
    if "TODO" in md:
        problems.append(f"{car.name}: alt text still TODO")
import spotbug  # noqa: E402  (kit put its folder on the path)
import verify as spotverify  # noqa: E402
if spotverify.compute() != json.loads(spotverify.FACTS.read_text()):
    problems.append("spotbug/facts.json differs from a fresh run of verify.py: rerun it, then spotbug.py and render.mjs")
js = subprocess.run(["node", str(spotverify.HERE / "verify.mjs")], capture_output=True, text=True)
if js.returncode:
    problems.append("spotbug/verify.mjs: " + (js.stderr or js.stdout).strip())
for bug, (pkg, md, n) in spotbug.build().items():
    if not (pkg / "post.md").exists() or (pkg / "post.md").read_text() != md:
        problems.append(f"{pkg.name}/post.md differs from a fresh build")
    if sorted(p.name for p in pkg.glob("slide*.png")) != sorted(f"slide{i}.png" for i in range(1, n + 1)):
        problems.append(f"{pkg.name}: its slides don't match its build of {n}")
    tags = re.search(r"## Hashtags\n\n(.+)\n", md).group(1).split()
    if len(tags) != 5 or len(set(tags)) != 5:
        problems.append(f"{pkg.name}: {len(tags)} hashtags, Instagram allows exactly 5 to be used")
import bigoquiz  # noqa: E402
# both verifiers are called verify.py, so the quiz's is loaded by path
from importlib.util import module_from_spec, spec_from_file_location  # noqa: E402
spec = spec_from_file_location("bigoverify", bigoquiz.HERE / "verify.py")
bigoverify = module_from_spec(spec)
spec.loader.exec_module(bigoverify)
if bigoverify.compute() != json.loads(bigoverify.FACTS.read_text()):
    problems.append("bigoquiz/facts.json differs from a fresh run of verify.py: rerun it, then bigoquiz.py and render.mjs")
for quiz, (pkg, md, n) in bigoquiz.build().items():
    if not (pkg / "post.md").exists() or (pkg / "post.md").read_text() != md:
        problems.append(f"{pkg.name}/post.md differs from a fresh build")
    if sorted(p.name for p in pkg.glob("slide*.png")) != ["slide1.png"]:
        problems.append(f"{pkg.name}: a quiz single is exactly slide1.png")
    tags = re.search(r"## Hashtags\n\n(.+)\n", md).group(1).split()
    if len(tags) != 5 or len(set(tags)) != 5:
        problems.append(f"{pkg.name}: {len(tags)} hashtags, Instagram allows exactly 5 to be used")
    if "#" in re.search(r"## First comment[^\n]*\n\n(.*?)\n## ", md, re.S).group(1):
        problems.append(f"{pkg.name}: a hashtag in the first comment counts against the caption's five")
import lessons  # noqa: E402
for post in lessons.POSTS:
    try:
        if lessons.run_verifiers(post) != json.loads((lessons.HERE / "posts" / post / "facts.json").read_text()):
            problems.append(f"lessons/posts/{post}/facts.json differs from a fresh run: python3 lessons.py --facts")
    except AssertionError as err:
        problems.append(str(err))
for post, (pkg, md, n) in lessons.build().items():
    if not (pkg / "post.md").exists() or (pkg / "post.md").read_text() != md:
        problems.append(f"{pkg.name}/post.md differs from a fresh build")
    if sorted(p.name for p in pkg.glob("slide*.png")) != sorted(f"slide{i}.png" for i in range(1, n + 1)):
        problems.append(f"{pkg.name}: its slides don't match its build of {n}")
    tags = re.search(r"## Hashtags\n\n(.+)\n", md).group(1).split()
    if len(tags) != 5 or len(set(tags)) != 5:
        problems.append(f"{pkg.name}: {len(tags)} hashtags, Instagram allows exactly 5 to be used")
import storykit  # noqa: E402
base = kit(stories=False)
try:
    storykit.verify_reels(base)
except AssertionError as err:
    problems.append(str(err))
days = storykit.stories(base)
for date, (pkg, md, fs) in days.items():
    if not (pkg / "story.md").exists() or (pkg / "story.md").read_text() != md:
        problems.append(f"stories/{date}/story.md differs from a fresh build")
    if sorted(p.name for p in pkg.glob("slide*.png")) != sorted(f"slide{i}.png" for i in range(1, len(fs) + 1)):
        problems.append(f"stories/{date}: its frames don't match its build of {len(fs)}")
covers = storykit.POSTS / "highlights"
if sorted(p.name for p in covers.glob("slide*.png")) != [f"slide{i}.png" for i in range(1, len(storykit.COVERS) + 1)]:
    problems.append("highlights: the covers don't match storykit.COVERS")
if not (covers / "highlights.md").exists() or (covers / "highlights.md").read_text() != storykit.highlights_md():
    problems.append("highlights/highlights.md differs from a fresh build")
if json.loads(KIT.read_text()) != kit():
    problems.append("posting-kit/october.json differs from kit.py: rerun kit.py")
assert not problems, "\n".join(problems)
reels = len(list((ROOT / "marketing/instagram").glob("*-carousel/sources/slides.json")))
print(f"{len(build())} cheatsheet carousels match gold.ts ({DATA['counts']['cheatsheets']} cheatsheets in the registry); "
      f"{reels} reel carousels match their reels; {len(spotbug.BUGS)} spot-the-bug carousels match their verified code; "
      f"{len(bigoquiz.QUIZZES)} Big-O quiz singles match their measured answers; "
      f"{len(lessons.POSTS)} lesson carousels match their verified facts; "
      f"{len(days)} story days and {len(storykit.COVERS)} highlight covers match their posts")
