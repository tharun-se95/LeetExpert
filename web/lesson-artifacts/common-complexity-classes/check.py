"""Executes the code shown on the page in Python and TypeScript and recomputes all facts.

Validates:
  * code/solution.* matches an independent model across 400+ random and edge cases.
  * code/mistake.* fails on non-powers-of-2 in both runtimes.
  * lesson.js PURE block matches Python's independent derivation of all FACTS.
  * built HTML embeds the exact PURE block.
"""
import json, math, os, random, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
CODE = os.path.join(HERE, "code")
WEB = os.path.normpath(os.path.join(HERE, "..", ".."))
ESBUILD = os.path.join(WEB, "node_modules", ".bin", "esbuild")


def cases(n=400, seed=20261014):
    rnd = random.Random(seed)
    edges = [
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
        15, 16, 17, 31, 32, 33, 63, 64, 65,
        100, 127, 128, 129, 255, 256, 500, 511, 512,
        1000, 1024, 2048, 10000, 65536, 100000, 1000000
    ]
    out = list(edges)
    for _ in range(n):
        out.append(rnd.randint(1, 1000000))
    return out


def model(n):
    if n <= 1:
        return 0
    return n.bit_length() - 1


def run_py(name, fn, all_cases):
    ns = {}
    with open(os.path.join(CODE, name)) as f:
        exec(f.read(), ns)
    res = []
    for c in all_cases:
        res.append(ns[fn](c))
    return res


DRIVER = r"""
const CASES = JSON.parse(require('fs').readFileSync(0, 'utf8'));
const f = process.env.FN === 'mistake' ? halvingsFloatDiv : halvings;
const out = CASES.map(n => f(n));
process.stdout.write(JSON.stringify(out));
"""


def run_ts(files, fn, all_cases):
    src = "\n".join(open(os.path.join(CODE, f)).read() for f in files)
    js = subprocess.run([ESBUILD, "--loader=ts", "--format=cjs"], input=src, capture_output=True, text=True, check=True).stdout
    res = subprocess.run(["node", "-e", js + DRIVER], input=json.dumps(all_cases), capture_output=True, text=True,
                         env={**os.environ, "FN": fn})
    if res.returncode:
        raise SystemExit("TypeScript run failed:\n" + res.stderr)
    return json.loads(res.stdout)


def pure_block():
    js = open(os.path.join(HERE, "lesson.js")).read()
    a = js.index("/* PURE:begin")
    b = js.index("/* PURE:end */") + len("/* PURE:end */")
    return js[a:b]


def run_pure():
    probe = pure_block() + r"""
var NS = LADDER_SIZES.concat(CONSTRAINTS.map(function(c) { return c.n; }));
process.stdout.write(JSON.stringify({
  CLASS_IDS: CLASS_IDS,
  LADDER_SIZES: LADDER_SIZES,
  CONSTRAINTS: CONSTRAINTS,
  LG: CLASS_IDS.map(function(id) { return NS.filter(function(n) { return n <= 1000000 || id !== 'nfac'; })
    .map(function(n) { return [id, n, opsLog10(id, n), formatOps(opsLog10(id, n)), formatTime(opsLog10(id, n))]; }); }),
  VERDICTS: CONSTRAINTS.map(function(c) { return constraintVerdict(c).map(function(v) { return [v.cls.id, v.lg]; }); })
}));
"""
    res = subprocess.run(["node", "-e", probe], capture_output=True, text=True)
    if res.returncode:
        raise SystemExit("lesson.js PURE block failed in node:\n" + res.stderr)
    return json.loads(res.stdout)


SUP = str.maketrans('⁰¹²³⁴⁵⁶⁷⁸⁹', '0123456789')


def main():
    problems = []
    all_cases = cases()
    want = [model(c) for c in all_cases]

    # 1. Solution in Python and TypeScript matches model
    for label, got in [("solution.py", run_py("solution.py", "halvings", all_cases)),
                       ("solution.ts", run_ts(["solution.ts"], "halvings", all_cases))]:
        bad = [(c, w, g) for c, w, g in zip(all_cases, want, got) if w != g]
        print(f"{label:12} {len(all_cases) - len(bad)}/{len(all_cases)} match model")
        if bad:
            problems.append(f"{label} failed on {len(bad)} cases: first {bad[:3]}")

    # 2. Mistake fails on non-powers-of-2 in both runtimes
    for label, got in [("mistake.py", run_py("mistake.py", "halvings_float_div", all_cases)),
                       ("mistake.ts", run_ts(["mistake.ts"], "mistake", all_cases))]:
        wrong = sum(1 for w, g in zip(want, got) if w != g)
        print(f"{label:12} fails on {wrong}/{len(all_cases)} cases (expected)")
        if wrong == 0:
            problems.append(f"{label} unexpectedly passed all cases!")

    # 3. PURE block validation
    pure_data = run_pure()

    # Exact counts with Python's big integers; the page carries log10 of these.
    def exact(cls, n):
        h = max(1, model(n))
        return {"1": lambda: 1, "logn": lambda: h, "n": lambda: n, "nlogn": lambda: n * h,
                "n2": lambda: n * n, "2n": lambda: 2 ** n, "nfac": lambda: math.factorial(n)}[cls]()

    def lg_exact(cls, n):
        # Big integers up to n = 3000; past that, 2^n and n! via exact-enough closed forms.
        if cls in ("2n", "nfac") and n > 3000:
            return n * math.log10(2) if cls == "2n" else math.lgamma(n + 1) / math.log(10)
        return ilog10(exact(cls, n))

    def ilog10(v):  # log10 of a big int without float overflow
        k = len(str(v)) - 1
        return k + math.log10(int(str(v)[:17]) / 10 ** (min(len(str(v)), 17) - 1))

    BUDGET = 10 ** 8
    for row in pure_data["LG"]:
        for cls, n, lg, ops_txt, time_txt in row:
            le = lg_exact(cls, n)
            if abs(lg - le) > 1e-6 * max(1, le):
                problems.append(f"opsLog10({cls}, {n}) = {lg} but exact log10 = {le}")
            if cls in ("2n", "nfac") and n > 3000:
                if math.floor(le) != math.floor(lg) or lg <= 8:
                    problems.append(f"{cls} at n={n}: power of ten differs or it passes")
                continue
            e = exact(cls, n)
            if (lg <= 8) != (e <= BUDGET):
                problems.append(f"pass/fail for {cls} at n={n} disagrees with the exact count")
            # A printed power of ten must be the exact count's own.
            if ops_txt.startswith("≈ 10") and len(str(e)) - 1 != int(ops_txt[4:].translate(SUP)):
                problems.append(f"formatOps({cls}, {n}) prints {ops_txt}, exact has {len(str(e)) - 1} as power")
            if not ops_txt.startswith("≈") and int(ops_txt.replace(",", "")) != e:
                problems.append(f"formatOps({cls}, {n}) prints {ops_txt} != exact {e}")
            if time_txt.endswith(" years") and time_txt.startswith("≈ 10"):
                yrs = ilog10(e) - 8 - math.log10(365.25 * 86400)
                if math.floor(yrs) != int(time_txt[4:-6].translate(SUP)):
                    problems.append(f"formatTime({cls}, {n}) prints {time_txt}, real 10^{yrs:.2f} years")

    # Each constraint tab: the class it names fits the budget, the next slower one does not.
    for c, v in zip(pure_data["CONSTRAINTS"], pure_data["VERDICTS"]):
        if lg_exact(v[0][0], c["n"]) > 8:
            problems.append(f"constraint {c['label']}: {v[0][0]} does not fit the budget")
        if len(v) > 1 and lg_exact(v[1][0], c["n"]) <= 8:
            problems.append(f"constraint {c['label']}: next class {v[1][0]} also fits, so the tab draws the line wrongly")

    # Quiz arithmetic at n = 10^5: n log n ~ 1.7e6, n^2 = 1e10 = 100 s, O(n)..O(n log n) spans 1e5 to under 2e6.
    nl = 100000 * math.log2(100000)
    if round(nl / 1e6, 1) != 1.7 or 100000 ** 2 / BUDGET != 100 or not (100000 * model(100000) < 2 * 10 ** 6):
        problems.append("quiz arithmetic at n = 10^5 no longer holds")

    # 4. Built HTML check (if dist file exists)
    dist = os.path.join(WEB, "lesson-artifacts", "dist", "big-o", "common-complexity-classes.html")
    if os.path.exists(dist):
        html = open(dist, encoding="utf-8").read()
        pb = pure_block()
        if pb not in html:
            problems.append("Built HTML does not embed the exact PURE block from lesson.js")

    if problems:
        print("\nERRORS:")
        for p in problems:
            print("  *", p)
        sys.exit(1)
    else:
        print("\nAll checks passed.")


if __name__ == "__main__":
    main()
