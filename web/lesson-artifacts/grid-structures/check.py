"""Executes every code snippet the grid-structures overview shows, in Python and TypeScript.

Each system's code must agree with an independent model on random inputs; each system's
"Watch out" mistake must disagree at least once, in both runtimes, so no warning on the page is
untrue. The models are written differently from the code they check (the blur by slicing a
clipped window, islands by union-find, the rotation by an index formula, the spiral by peeling
and turning the rest, the route by an explicit stack of paths), so one idea cannot be wrong in
both places at once. TypeScript is transpiled with the repo's own esbuild.

    python3 web/lesson-artifacts/grid-structures/check.py
"""
import json, os, random, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
CODE = os.path.join(HERE, "code")
ESBUILD = os.path.normpath(os.path.join(HERE, "..", "..", "node_modules", ".bin", "esbuild"))
SYSTEMS = ["framebuffer", "pages", "filter", "alerts", "camera", "mask", "cnc", "route"]

# ---------- inputs, and what an independent model says the answers are ----------


def grid(R_, rows, cols, lo=0, hi=9):
    return [[R_.randint(lo, hi) for _ in range(cols)] for _ in range(rows)]


def cases():
    R = random.Random(20260928)   # same inputs on every call: the model and both runtimes see one set
    c = {}
    fb = []
    for _ in range(60):
        w, h, pad = R.randint(1, 6), R.randint(1, 5), R.choice([0, 0, 1, 2, 3])
        img = grid(R, h, w)
        buf = []
        for row in img:              # each row, then its padding: bytes that are not pixels
            buf += row + [R.randint(50, 99) for _ in range(pad)]
        fb.append({"img": img, "args": [buf, w, h, w + pad]})
    c["framebuffer"] = fb
    pages = []
    for rows, cols in [(1, 1), (2, 2), (3, 3), (2, 5), (5, 2), (4, 6), (6, 4), (1, 7), (7, 1), (5, 6)]:
        for _ in range(6):
            keys, k = [], R.randint(-5, 5)
            for _ in range(rows * cols):
                k += R.randint(1, 4)
                keys.append(k)
            m = [keys[i * cols:(i + 1) * cols] for i in range(rows)]
            for t in [R.choice(keys), keys[0], keys[-1], keys[0] - 1, keys[-1] + 1, R.choice(keys) + 0.5]:
                pages.append([m, t])
    c["pages"] = pages
    c["filter"] = [grid(R, R.randint(1, 6), R.randint(1, 6)) for _ in range(40)]
    c["alerts"] = [[[1 if R.random() < d else 0 for _ in range(cols)] for _ in range(rows)]
                   for rows, cols, d in [(R.randint(1, 7), R.randint(1, 10), R.choice([.2, .4, .6])) for _ in range(60)]]
    c["camera"] = [grid(R, n, n, 1, 99) for n in [1, 2, 3, 4, 5, 6] for _ in range(5)]
    c["mask"] = [[[R.choice([0, 1, 2, 3, 4, 5, 6, 7]) for _ in range(cols)] for _ in range(rows)]
                 for rows, cols in [(R.randint(1, 6), R.randint(1, 6)) for _ in range(60)]]
    c["cnc"] = [grid(R, R.randint(1, 6), R.randint(1, 6)) for _ in range(50)]
    route = []
    for _ in range(80):
        rows, cols = R.randint(1, 4), R.randint(1, 4)
        b = [[R.choice("ROUTE") for _ in range(cols)] for _ in range(rows)]
        route.append([b, "".join(R.choice("ROUTE") for _ in range(R.randint(1, 5)))])
    # Un-marking only matters when a word repeats a letter: with distinct letters a cell can only ever
    # sit at one position of a path, so a cell that failed once fails again. The page's board: from the
    # top R the first try goes down, R-O-T-O, and needs that same R again; the route that exists leaves
    # the same R the other way, R-O-T-O-R, through the O, T and O the first try marked.
    route.append([[list("ORX"), list("TOR")], "ROTOR"])
    route.append([[list("AB"), list("CD")], "ABDC"])
    c["route"] = route
    return c


def model(c):
    m = {}
    m["framebuffer"] = [sum(map(sum, x["img"])) for x in c["framebuffer"]]
    m["pages"] = [t in [v for row in g for v in row] for g, t in c["pages"]]

    def window_mean(g, r, cc):
        rows = g[max(0, r - 1):r + 2]
        vals = [v for row in rows for v in row[max(0, cc - 1):cc + 2]]
        return sum(vals) // len(vals)
    m["filter"] = [[[window_mean(g, r, cc) for cc in range(len(g[0]))] for r in range(len(g))] for g in c["filter"]]

    def islands(g):
        parent = {}
        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x
        for r, row in enumerate(g):
            for cc, v in enumerate(row):
                if v:
                    parent[(r, cc)] = (r, cc)
        for (r, cc) in list(parent):
            for nb in ((r + 1, cc), (r, cc + 1)):
                if nb in parent:
                    parent[find(nb)] = find((r, cc))
        return len({find(x) for x in parent})
    m["alerts"] = [islands(g) for g in c["alerts"]]
    m["camera"] = [[[g[len(g) - 1 - cc][r] for cc in range(len(g))] for r in range(len(g))] for g in c["camera"]]

    def zeroed(g):
        rows = {i for i, row in enumerate(g) if 0 in row}
        cols = {j for row in g for j, v in enumerate(row) if v == 0}
        return [[0 if i in rows or j in cols else v for j, v in enumerate(row)] for i, row in enumerate(g)]
    m["mask"] = [zeroed(g) for g in c["mask"]]

    def peel(g):
        g, out = [list(row) for row in g], []
        while g:
            out += g.pop(0)                         # take the top row, then turn the rest a quarter
            g = [list(col) for col in zip(*g)][::-1]
        return out
    m["cnc"] = [peel(g) for g in c["cnc"]]

    def spelled(b, w):
        R_, C_ = len(b), len(b[0])
        stack = [((r, cc),) for r in range(R_) for cc in range(C_) if b[r][cc] == w[0]]
        while stack:
            path = stack.pop()
            if len(path) == len(w):
                return True
            r, cc = path[-1]
            for nr, nc in ((r - 1, cc), (r + 1, cc), (r, cc - 1), (r, cc + 1)):
                if 0 <= nr < R_ and 0 <= nc < C_ and (nr, nc) not in path and b[nr][nc] == w[len(path)]:
                    stack.append(path + ((nr, nc),))
        return False
    m["route"] = [spelled(b, w) for b, w in c["route"]]
    return m

# ---------- Python ----------


def run_py(system, mistake):
    ns = {}
    exec(open(os.path.join(CODE, system + ("_mistake" if mistake else "") + ".py")).read(), ns)
    c = cases()[system]
    try:
        if system == "framebuffer":
            return [ns["total"](*x["args"]) for x in c]
        if system == "pages":
            return [ns["search"](g, t) for g, t in c]
        if system == "filter":
            return [ns["blur"](g) for g in c]
        if system == "alerts":
            return [ns["incidents"](g) for g in c]
        if system == "camera":
            return [ns["rotate"](g) for g in c]
        if system == "mask":
            return [ns["mask"](g) for g in c]
        if system == "cnc":
            return [ns["spiral"](g) for g in c]
        if system == "route":
            return [ns["exists"](b, w) for b, w in c]
    except Exception as e:  # a mistake that crashes (a stack overflow, a row that is not there) has failed
        return f"raised {type(e).__name__}"

# ---------- TypeScript ----------


TS_DRIVER = r'''
const C = JSON.parse(require('fs').readFileSync(0, 'utf8'));
const sys = process.env.SYS;
let out;
try {
  if (sys === 'framebuffer') out = C.map((x) => total(...x.args));
  if (sys === 'pages') out = C.map(([g, t]) => search(g, t));
  if (sys === 'filter') out = C.map((g) => blur(g));
  if (sys === 'alerts') out = C.map((g) => incidents(g));
  if (sys === 'camera') out = C.map((g) => rotate(g));
  if (sys === 'mask') out = C.map((g) => mask(g));
  if (sys === 'cnc') out = C.map((g) => spiral(g));
  if (sys === 'route') out = C.map(([b, w]) => exists(b, w));
} catch (e) { out = 'raised ' + e.constructor.name; }
process.stdout.write(JSON.stringify(out));
'''


def run_ts(system, mistake):
    src = open(os.path.join(CODE, system + ("_mistake" if mistake else "") + ".ts")).read()
    js = subprocess.run([ESBUILD, "--loader=ts", "--format=cjs"], input=src, capture_output=True, text=True)
    if js.returncode:
        raise SystemExit(f"{system}: TypeScript does not compile:\n{js.stderr}")
    run = subprocess.run(["node", "--stack-size=4000", "-e", js.stdout + TS_DRIVER], input=json.dumps(cases()[system]),
                         capture_output=True, text=True, env={**os.environ, "SYS": system})
    if run.returncode:
        raise SystemExit(f"{system}: TypeScript run failed:\n{run.stderr[:400]}")
    return json.loads(run.stdout)


def main():
    expected = model(cases())
    problems, lines = [], []
    for system in SYSTEMS:
        for lang, runner in (("python", run_py), ("typescript", run_ts)):
            good = runner(system, False)
            bad = runner(system, True)
            if good != expected[system]:
                first = next((k for k, (g, e) in enumerate(zip(good, expected[system])) if g != e), None) if isinstance(good, list) else None
                problems.append(f"{system} ({lang}) disagrees with the model" + (f" at case {first}" if first is not None else f": {good}"))
            if bad == expected[system]:
                problems.append(f"{system}_mistake ({lang}) passes every case, so its warning is not true")
        lines.append(f"{system}: code agrees, mistake fails, in both runtimes")
    for p in problems:
        print("FAIL " + p)
    if problems:
        raise SystemExit(f"FAILED {len(problems)} check(s)")
    print("\n".join(lines))
    print("all claims hold")


if __name__ == "__main__":
    main()
