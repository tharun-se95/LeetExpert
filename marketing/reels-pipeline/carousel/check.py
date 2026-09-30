"""Fails if a cheatsheet carousel no longer matches the product.

1. Re-dumps gold.ts (dump_sheets.ts) and compares it to sheets.json.
2. Rebuilds every post.md from sheets.json and compares it to the package's copy.
3. Checks each package has exactly the slides its build has (render.mjs made them).
4. Checks the posting kit carries each carousel as kit.py places it.

  PYTHONDONTWRITEBYTECODE=1 python3 check.py
"""
import json
import re
import subprocess

from cheatsheet import DATA, HERE, ROOT, build
from kit import KIT, kit

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
if json.loads(KIT.read_text()) != kit():
    problems.append("posting-kit/october.json differs from kit.py: rerun kit.py")
assert not problems, "\n".join(problems)
print(f"{len(build())} carousels match gold.ts ({DATA['counts']['cheatsheets']} cheatsheets in the registry)")
