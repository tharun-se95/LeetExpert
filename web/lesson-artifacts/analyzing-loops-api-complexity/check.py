"""Executes the loop analysis and API pricing code in Python and TypeScript.

Validates:
  * count_iterations matches closed forms: doubling (ceil(log2 n)), sequential (2n), dependent (n(n-1)/2).
  * dedupe_set matches linear comparisons O(n) on distinct inputs.
  * dedupe_list (mistake) exhibits quadratic comparisons n(n-1)/2 in both Python and TS.
  * lesson.js PURE block matches Python's independent calculations.
  * built HTML embeds the exact PURE block.
"""
import json, math, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
CODE = os.path.join(HERE, "code")
WEB = os.path.normpath(os.path.join(HERE, "..", ".."))
ESBUILD = os.path.join(WEB, "node_modules", ".bin", "esbuild")


def closed_form(shape, n):
    if shape == "doubling":
        if n <= 1:
            return 0
        return math.ceil(math.log2(n))
    elif shape == "sequential":
        return 2 * n
    elif shape == "dependent":
        return n * (n - 1) // 2
    raise ValueError(f"unknown shape {shape}")


def run_py_iterations(n_values):
    ns = {}
    with open(os.path.join(CODE, "solution.py")) as f:
        exec(f.read(), ns)
    res = {}
    for shape in ["doubling", "sequential", "dependent"]:
        res[shape] = [ns["count_iterations"](shape, n) for n in n_values]
    return res


def run_py_dedupe(items):
    ns = {}
    with open(os.path.join(CODE, "solution.py")) as f:
        exec(f.read(), ns)
    res_set, comps_set = ns["dedupe_set"](list(items))

    ns_m = {}
    with open(os.path.join(CODE, "mistake.py")) as f:
        exec(f.read(), ns_m)
    res_list, comps_list = ns_m["dedupe_list"](list(items))

    return (res_set, comps_set), (res_list, comps_list)


DRIVER = r"""
const CASES = JSON.parse(require('fs').readFileSync(0, 'utf8'));
if (process.env.MODE === 'iterations') {
  const shapes = ['doubling', 'sequential', 'dependent'];
  const out = {};
  for (const s of shapes) {
    out[s] = CASES.map(n => countIterations(s, n));
  }
  process.stdout.write(JSON.stringify(out));
} else {
  // dedupe mode
  const out = CASES.map(items => {
    const [sRes, sComps] = dedupeSet(items.slice());
    const [lRes, lComps] = dedupeList(items.slice());
    return { set: [sRes, sComps], list: [lRes, lComps] };
  });
  process.stdout.write(JSON.stringify(out));
}
"""


def run_ts_iterations(n_values):
    src = open(os.path.join(CODE, "solution.ts")).read()
    js = subprocess.run([ESBUILD, "--loader=ts", "--format=cjs"], input=src, capture_output=True, text=True, check=True).stdout
    res = subprocess.run(["node", "-e", js + DRIVER], input=json.dumps(n_values), capture_output=True, text=True,
                         env={**os.environ, "MODE": "iterations"})
    if res.returncode:
        raise SystemExit("TypeScript iterations failed:\n" + res.stderr)
    return json.loads(res.stdout)


def run_ts_dedupe(cases):
    src = open(os.path.join(CODE, "solution.ts")).read() + "\n" + open(os.path.join(CODE, "mistake.ts")).read()
    js = subprocess.run([ESBUILD, "--loader=ts", "--format=cjs"], input=src, capture_output=True, text=True, check=True).stdout
    res = subprocess.run(["node", "-e", js + DRIVER], input=json.dumps(cases), capture_output=True, text=True,
                         env={**os.environ, "MODE": "dedupe"})
    if res.returncode:
        raise SystemExit("TypeScript dedupe failed:\n" + res.stderr)
    return json.loads(res.stdout)


def pure_block():
    js = open(os.path.join(HERE, "lesson.js")).read()
    a = js.index("/* PURE:begin")
    b = js.index("/* PURE:end */") + len("/* PURE:end */")
    return js[a:b]


def run_pure():
    probe = pure_block() + r"""
process.stdout.write(JSON.stringify({
  FACTS: FACTS,
  SHAPE_TESTS: SHAPE_TESTS,
  API_COSTS: API_COSTS,
  closedVsCounted: ['doubling', 'sequential', 'dependent'].map(function(s) {
    var bad = [];
    for (var n = 0; n <= 300; n++) if (closedFormValue(s, n) !== countLoopIterations(s, n)) bad.push(n);
    return [s, bad];
  })
}));
"""
    res = subprocess.run(["node", "-e", probe], capture_output=True, text=True)
    if res.returncode:
        raise SystemExit("lesson.js PURE block failed in node:\n" + res.stderr)
    return json.loads(res.stdout)


def main():
    problems = []

    # 1. Test count_iterations against closed form across range of n
    n_values = [0, 1, 2, 3, 4, 7, 8, 15, 16, 31, 32, 64, 100, 256, 500]
    py_iters = run_py_iterations(n_values)
    ts_iters = run_ts_iterations(n_values)

    for shape in ["doubling", "sequential", "dependent"]:
        expected = [closed_form(shape, n) for n in n_values]
        py_got = py_iters[shape]
        ts_got = ts_iters[shape]

        py_bad = [(n, exp, got) for n, exp, got in zip(n_values, expected, py_got) if exp != got]
        ts_bad = [(n, exp, got) for n, exp, got in zip(n_values, expected, ts_got) if exp != got]

        if py_bad:
            problems.append(f"Python {shape} mismatch: {py_bad[:3]}")
        if ts_bad:
            problems.append(f"TS {shape} mismatch: {ts_bad[:3]}")
        print(f"count_iterations({shape}): {len(n_values)}/{len(n_values)} matched closed form in Python and TS")

    # 2. Test dedupe_set vs dedupe_list
    test_cases = [
        list(range(10)),
        list(range(50)),
        list(range(100)),
        [1, 2, 2, 3, 3, 3, 4, 1, 5]
    ]

    for tc in test_cases:
        (py_set_res, py_set_c), (py_list_res, py_list_c) = run_py_dedupe(tc)
        n = len(tc)
        if len(set(tc)) == n:
            # Distinct elements: set is n comparisons, list is n*(n-1)//2
            if py_set_c != n:
                problems.append(f"dedupe_set comparisons {py_set_c} != {n}")
            expected_quad = n * (n - 1) // 2
            if py_list_c != expected_quad:
                problems.append(f"dedupe_list comparisons {py_list_c} != {expected_quad}")

    ts_dedupe_results = run_ts_dedupe(test_cases)
    for tc, res in zip(test_cases, ts_dedupe_results):
        n = len(tc)
        ts_set_c = res["set"][1]
        ts_list_c = res["list"][1]
        if len(set(tc)) == n:
            if ts_set_c != n:
                problems.append(f"TS dedupe_set comparisons {ts_set_c} != {n}")
            expected_quad = n * (n - 1) // 2
            if ts_list_c != expected_quad:
                problems.append(f"TS dedupe_list comparisons {ts_list_c} != {expected_quad}")

    print("dedupe_set (O(n)) vs dedupe_list (O(n²)) verified in Python and TS")

    # 3. PURE block validation
    pure_data = run_pure()
    facts = pure_data["FACTS"]

    # Verify FACTS calculations
    if facts["doubling16"] != closed_form("doubling", 16):
        problems.append(f"FACTS.doubling16 {facts['doubling16']} != {closed_form('doubling', 16)}")
    if facts["seq16"] != closed_form("sequential", 16):
        problems.append(f"FACTS.seq16 {facts['seq16']} != {closed_form('sequential', 16)}")
    if facts["dep16"] != closed_form("dependent", 16):
        problems.append(f"FACTS.dep16 {facts['dep16']} != {closed_form('dependent', 16)}")
    if facts["quad100"] != 100 * 99 // 2:
        problems.append(f"FACTS.quad100 {facts['quad100']} != 4950")
    # The widget's closed form must agree with its own counter at every slider value and beyond.
    for shape, bad in pure_data["closedVsCounted"]:
        if bad:
            problems.append(f"lesson.js closedFormValue({shape}) disagrees with the counter at n={bad[:5]}")
    for row in pure_data["API_COSTS"]:
        n = row["n"]
        if row["set"] != n or row["list"] != n * (n - 1) // 2:
            problems.append(f"API_COSTS n={n}: {row} != set {n}, list {n * (n - 1) // 2}")
    print("widget closed forms and dedupe counts recounted")

    # Both dedupes must return the distinct items in first-seen order, in both runtimes.
    for tc, res in zip(test_cases, ts_dedupe_results):
        want = list(dict.fromkeys(tc))
        (ps, _), (pl, _) = run_py_dedupe(tc)
        for label, got in [("py set", ps), ("py list", pl), ("ts set", res["set"][0]), ("ts list", res["list"][0])]:
            if got != want:
                problems.append(f"dedupe {label} returned {got[:6]} for {tc[:6]}, want {want[:6]}")

    # 4. Built HTML check (if exists)
    dist = os.path.join(WEB, "lesson-artifacts", "dist", "big-o", "analyzing-loops-api-complexity.html")
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
