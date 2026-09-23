"""Bake a generated row into a primitive's variable DEFAULTS.

`preview` and `snapshot` read defaults and accept no --variables, so a
primitive whose defaults are a placeholder cannot be reviewed without a full
render. Rewriting the attribute via a JSON round-trip (never string surgery —
that corrupted it once) keeps it valid by construction.

usage: python3 data/set-defaults.py <primitive> <rows.json> <_out value>
"""
import json, sys, os

prim, rowsfile, want = sys.argv[1], sys.argv[2], sys.argv[3]
here = os.path.dirname(os.path.abspath(__file__))
root = os.path.dirname(here)
row = next(r for r in json.load(open(os.path.join(root, rowsfile))) if r["_out"] == want)

p = os.path.join(root, "primitives", prim, "index.html")
h = open(p).read()
start = h.index("data-composition-variables='")
end = h.index("'\n>", start)
raw = h[start + len("data-composition-variables='"):end]
spec = json.loads(raw.replace("&#39;", "'").replace("&amp;", "&"))

applied = []
for decl in spec:
    if decl["id"] in row:
        decl["default"] = row[decl["id"]]
        applied.append(decl["id"])

attr = json.dumps(spec, ensure_ascii=False).replace("&", "&amp;").replace("'", "&#39;")
json.loads(attr.replace("&#39;", "'").replace("&amp;", "&"))   # prove it parses
open(p, "w").write(h[:start] + "data-composition-variables='" + attr + h[end:])
print(f"{prim}: defaults <- {want}  ({', '.join(applied)})")
