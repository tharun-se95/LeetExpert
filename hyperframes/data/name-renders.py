"""Rename batch outputs from their row's `_out` key.

`--batch` names files by row index; the manifest carries the variables that
produced each one, so the meaningful name is recoverable rather than guessed.
"""
import json, os, sys
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
m = json.load(open(os.path.join(root, "renders", "manifest.json")))
for row in m["rows"]:
    if row["status"] != "completed":
        print("skip (not completed):", row["index"]); continue
    src = row["outputPath"]
    name = row["variables"].get("_out")
    if not name:
        print("skip (no _out):", src); continue
    dst = os.path.join(os.path.dirname(src), name + os.path.splitext(src)[1])
    if os.path.exists(src):
        os.replace(src, dst)
        print(f'{os.path.basename(src)}  ->  {os.path.basename(dst)}')
    elif os.path.exists(dst):
        print(f'already named: {os.path.basename(dst)}')
