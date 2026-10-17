"""Executes the Big O witness code in Python and TypeScript and recomputes all facts.

Validates:
  * code/solution.* matches an independent model across 400+ random and edge cases.
  * code/mistake.* fails on cases where curves cross back above c*g in both runtimes.
  * lesson.js PURE block matches Python's independent derivation of all FACTS.
  * built HTML embeds the exact PURE block.
"""
import json, math, os, random, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
CODE = os.path.join(HERE, "code")
WEB = os.path.normpath(os.path.join(HERE, "..", ".."))
ESBUILD = os.path.join(WEB, "node_modules", ".bin", "esbuild")

G_MAP = {
    "1": lambda n: 1.0,
    "logn": lambda n: math.log2(max(1, n)),
    "n": lambda n: float(n),
    "nlogn": lambda n: n * math.log2(max(1, n)),
    "n2": lambda n: float(n * n),
    "2n": lambda n: float(2**n),
}


def model_eval_poly(coeffs, n):
    val = 0.0
    for c in coeffs:
        val = val * n + c
    return val


def model_is_witness(f_coeffs, g_key, c, n0, n_max=100):
    if c <= 0 or n0 < 0 or n0 > n_max:
        return False
    g_fn = G_MAP[g_key]
    for n in range(n0, n_max + 1):
        if model_eval_poly(f_coeffs, n) > c * g_fn(n):
            return False
    return True


def cases(n=400, seed=20261014):
    rnd = random.Random(seed)
    # Structured edge cases
    out = [
        ([3, 10, 50], "n2", 4.0, 14, 50),   # True: the camp cookie witness
        ([3, 10, 50], "n2", 4.0, 13, 50),   # False: violated at n=13
        ([3, 10, 50], "n", 10.0, 1, 50),    # False: quadratic exceeds linear
        ([3, 20], "n", 4.0, 20, 50),        # True: 3n+20 <= 4n from n0=20
        ([3, 20], "n", 3.0, 20, 50),        # False: 3n+20 > 3n
        ([2, 100], "n", 3.0, 100, 200),     # True: 2n+100 <= 3n from n0=100
        ([1, 0], "n2", 5.0, 2, 50),         # False for mistake: n^2 vs 5n crosses back
        ([1, -10], "n", 2.0, 1, 50),
        ([5], "1", 5.0, 1, 50),             # Constant
        ([5], "1", 4.0, 1, 50),
        ([1, 0, 0], "n2", -1.0, 1, 50),     # Negative c -> False
        ([1, 0], "n", 2.0, 60, 50),         # n0 > n_max -> False
    ]
    # Randomized polynomial cases
    keys = ["1", "logn", "n", "nlogn", "n2"]
    for _ in range(n):
        degree = rnd.randint(0, 3)
        coeffs = [rnd.randint(1, 10)] + [rnd.randint(0, 50) for _ in range(degree)]
        g_key = rnd.choice(keys)
        c = rnd.choice([0.5, 1.0, 2.0, 3.0, 4.0, 5.0, 10.0, 20.0])
        n0 = rnd.randint(1, 25)
        n_max = n0 + rnd.randint(5, 50)
        out.append((coeffs, g_key, c, n0, n_max))
    return out


def run_py(name, fn, all_cases):
    ns = {}
    with open(os.path.join(CODE, name), encoding="utf-8") as f:
        exec(f.read(), ns)
    res = []
    for f_coeffs, g_key, c, n0, n_max in all_cases:
        res.append(bool(ns[fn](list(f_coeffs), g_key, c, n0, n_max)))
    return res


DRIVER = r"""
const CASES = JSON.parse(require('fs').readFileSync(0, 'utf8'));
const f = process.env.FN === 'mistake' ? isWitnessMistake : isWitness;
const out = CASES.map(([fCoeffs, gKey, c, n0, nMax]) => {
  return Boolean(f(fCoeffs.slice(), gKey, c, n0, nMax));
});
process.stdout.write(JSON.stringify(out));
"""


def run_ts(files, fn, all_cases):
    src = "\n".join(open(os.path.join(CODE, f), encoding="utf-8").read() for f in files)
    js = subprocess.run([ESBUILD, "--loader=ts", "--format=cjs"], input=src, capture_output=True, text=True, check=True).stdout
    res = subprocess.run(["node", "-e", js + DRIVER], input=json.dumps(all_cases), capture_output=True, text=True,
                         env={**os.environ, "FN": fn})
    if res.returncode:
        raise SystemExit("TypeScript run failed:\n" + res.stderr)
    return json.loads(res.stdout)


def pure_block():
    js = open(os.path.join(HERE, "lesson.js"), encoding="utf-8").read()
    a = js.index("/* PURE:begin")
    b = js.index("/* PURE:end */") + len("/* PURE:end */")
    return js[a:b]


def run_pure():
    probe = pure_block() + r"""
process.stdout.write(JSON.stringify({
  COOKIE: COOKIE,
  F_PRESETS: F_PRESETS
}));
"""
    res = subprocess.run(["node", "-e", probe], capture_output=True, text=True)
    if res.returncode:
        raise SystemExit("lesson.js PURE block failed in node:\n" + res.stderr)
    return json.loads(res.stdout)


def main():
    problems = []
    all_cases = cases()
    want = [model_is_witness(*c) for c in all_cases]

    # 1. Solution in Python and TypeScript matches model
    for label, got in [("solution.py", run_py("solution.py", "is_witness", all_cases)),
                       ("solution.ts", run_ts(["solution.ts"], "isWitness", all_cases))]:
        bad = [(c, w, g) for c, w, g in zip(all_cases, want, got) if w != g]
        print(f"{label:12} {len(all_cases) - len(bad)}/{len(all_cases)} match model")
        if bad:
            problems.append(f"{label} failed on {len(bad)} cases: first {bad[:3]}")

    # 2. Mistake fails in both runtimes on crossing-back cases
    for label, got in [("mistake.py", run_py("mistake.py", "is_witness_mistake", all_cases)),
                       ("mistake.ts", run_ts(["mistake.ts"], "mistake", all_cases))]:
        wrong = sum(1 for w, g in zip(want, got) if w != g)
        print(f"{label:12} fails on {wrong}/{len(all_cases)} cases (expected)")
        if wrong == 0:
            problems.append(f"{label} unexpectedly passed all cases!")

    # 3. PURE block validation
    pure_data = run_pure()

    # The camp's witness, found by scanning rather than by the page's own search.
    f = lambda n: 3 * n * n + 10 * n + 50
    n0 = next(k for k in range(1, 10_000) if all(f(n) <= 4 * n * n for n in range(k, 20_000)))
    if pure_data["COOKIE"]["n0"] != n0:
        problems.append(f"COOKIE.n0 {pure_data['COOKIE']['n0']} != scanned {n0}")
    # The prose and derivation's typed arithmetic: n0 = 14; at 13, spares 169 vs 180, 676 < 687.
    if n0 != 14 or (13 * 13, 10 * 13 + 50, 4 * 169, f(13)) != (169, 180, 676, 687):
        problems.append("lesson.md's n0 = 14 / 13-cabin arithmetic no longer holds")
    if any(f(n) < 3 * n * n for n in range(1, 20_000)) or pure_data["COOKIE"]["floorC"] != 3:
        problems.append("floor 3n^2 <= f(n) for n >= 1 fails")
    if round(1e12 / (1e12 + 1e6) * 100, 4) != 99.9999:
        problems.append("99.9999% share at n = 10^6 no longer holds")
    if not (2 * 100 + 100 <= 3 * 100 and all(2 * n + 100 <= 3 * n for n in range(100, 10_000))):
        problems.append("quiz witness c=3, n0=100 for 2n+100 fails")

    # Presets: each shown witness is the minimal one on the plot, and it really holds.
    for p in pure_data["F_PRESETS"]:
        fp = lambda n, cs=p["coeffs"]: model_eval_poly(cs, n)
        g = G_MAP[p["g"]]
        want_n0 = next((k for k in range(1, 31) if all(fp(n) <= p["c"] * g(n) for n in range(k, 31))), -1)
        if p["n0"] != want_n0 or want_n0 < 1:
            problems.append(f"preset {p['name']} n0 {p['n0']} != {want_n0}")

    # The verdict says a witness valid on the plot holds forever when degree(f) <= degree(g).
    # Check that claim over every slider position the widget can reach.
    degs = {"n2": 2, "n": 1, "logn": 0}
    for p in pure_data["F_PRESETS"]:
        for gk, gd in degs.items():
            if p["degree"] > gd:
                continue
            for ci in range(2, 21):
                c = ci / 2
                for k in range(1, 31):
                    if model_is_witness(p["coeffs"], gk, c, k, 30) and not model_is_witness(p["coeffs"], gk, c, k, 5000):
                        problems.append(f"verdict 'holds to infinity' false for {p['name']}, g={gk}, c={c}, n0={k}")

    # 4. Built HTML check (if dist file exists)
    dist = os.path.join(WEB, "lesson-artifacts", "dist", "big-o", "big-o-notation.html")
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
