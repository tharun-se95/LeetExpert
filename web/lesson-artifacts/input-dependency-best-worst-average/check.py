"""Executes the code shown on the page in Python and TypeScript and recomputes all facts.

Validates:
  * code/solution.* matches an independent linear search model across 400+ random and edge cases.
  * code/mistake.* fails on non-trivial cases in both runtimes (returns on first mismatch).
  * lesson.js PURE block matches Python's independent derivation of all FACTS.
  * built HTML embeds the exact PURE block.
"""
import json, os, random, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
CODE = os.path.join(HERE, "code")
WEB = os.path.normpath(os.path.join(HERE, "..", ".."))
ESBUILD = os.path.join(WEB, "node_modules", ".bin", "esbuild")

# Fixed scenarios from the page
MAIL_BIN = [142, 305, 418, 529, 631, 745, 890, 912]


def cases(n=400, seed=20261014):
    rnd = random.Random(seed)
    out = [
        ([], 42),
        ([10], 10),
        ([10], 20),
        (list(MAIL_BIN), 142),  # best case (index 0)
        (list(MAIL_BIN), 529),  # middle (index 3)
        (list(MAIL_BIN), 912),  # worst case present (index 7)
        (list(MAIL_BIN), 999),  # worst case absent
    ]
    for _ in range(n):
        size = rnd.randint(0, 20)
        arr = [rnd.randint(0, 100) for _ in range(size)]
        if size > 0 and rnd.random() < 0.7:
            target = rnd.choice(arr)
        else:
            target = rnd.randint(101, 200)
        out.append((arr, target))
    return out


def model(arr, target):
    for i, val in enumerate(arr):
        if val == target:
            return [i, i + 1]
    return [-1, len(arr)]


def run_py(name, fn, all_cases):
    ns = {}
    with open(os.path.join(CODE, name)) as f:
        exec(f.read(), ns)
    res = []
    for arr, target in all_cases:
        idx, comps = ns[fn](list(arr), target)
        res.append([idx, comps])
    return res


DRIVER = r"""
const CASES = JSON.parse(require('fs').readFileSync(0, 'utf8'));
const f = process.env.FN === 'mistake' ? linearSearchEarlyExit : linearSearch;
const out = CASES.map(([arr, target]) => {
  const [idx, comps] = f(arr.slice(), target);
  return [idx, comps];
});
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
process.stdout.write(JSON.stringify({
  FACTS: FACTS,
  MAIL_BIN: MAIL_BIN,
  SORT_COSTS: SORT_COSTS,
  SORT_CASES: SORT_CASES
}));
"""
    res = subprocess.run(["node", "-e", probe], capture_output=True, text=True)
    if res.returncode:
        raise SystemExit("lesson.js PURE block failed in node:\n" + res.stderr)
    return json.loads(res.stdout)


def insertion_sort_count(arr):
    a = list(arr)
    comps = 0
    for i in range(1, len(a)):
        val = a[i]
        j = i - 1
        while j >= 0:
            comps += 1
            if a[j] > val:
                a[j + 1] = a[j]
                j -= 1
            else:
                break
        a[j + 1] = val
    return comps


def main():
    problems = []
    all_cases = cases()
    want = [model(arr, target) for arr, target in all_cases]

    # 1. Solution in Python and TypeScript matches model
    for label, got in [("solution.py", run_py("solution.py", "linear_search", all_cases)),
                       ("solution.ts", run_ts(["solution.ts"], "linearSearch", all_cases))]:
        bad = [(c, w, g) for c, w, g in zip(all_cases, want, got) if w != g]
        print(f"{label:12} {len(all_cases) - len(bad)}/{len(all_cases)} match model")
        if bad:
            problems.append(f"{label} failed on {len(bad)} cases: first {bad[:3]}")

    # 2. Mistake fails in both runtimes
    non_initial_hits = [(arr, target) for arr, target in all_cases if len(arr) >= 2 and target in arr and arr.index(target) > 0]
    for label, got in [("mistake.py", run_py("mistake.py", "linear_search_early_exit", all_cases)),
                       ("mistake.ts", run_ts(["mistake.ts"], "mistake", all_cases))]:
        wrong = sum(1 for w, g in zip(want, got) if w != g)
        print(f"{label:12} fails on {wrong}/{len(all_cases)} cases (expected)")
        if wrong == 0:
            problems.append(f"{label} unexpectedly passed all cases!")

    # 3. PURE block validation
    pure_data = run_pure()
    facts = pure_data["FACTS"]
    mail_bin = pure_data["MAIL_BIN"]

    if mail_bin != MAIL_BIN:
        problems.append(f"MAIL_BIN mismatch: {mail_bin} vs {MAIL_BIN}")

    # Recompute FACTS in Python
    n = len(MAIL_BIN)
    best_c = 1
    worst_c = n
    avg_c = sum(i + 1 for i in range(n)) / n

    if facts["binSize"] != n:
        problems.append(f"FACTS.binSize {facts['binSize']} != {n}")
    if facts["bestCompares"] != best_c:
        problems.append(f"FACTS.bestCompares {facts['bestCompares']} != {best_c}")
    if facts["worstCompares"] != worst_c:
        problems.append(f"FACTS.worstCompares {facts['worstCompares']} != {worst_c}")
    if float(facts["avgCompares"]) != avg_c:
        problems.append(f"FACTS.avgCompares {facts['avgCompares']} != {avg_c}")

    if facts["sumCompares"] != sum(i + 1 for i in range(n)):
        problems.append(f"FACTS.sumCompares {facts['sumCompares']} wrong")

    # Insertion sort: every widget case and chart point recounted independently
    sort_cases = pure_data["SORT_CASES"]
    orders = [sorted, lambda a: sorted(a, reverse=True), None]
    for case, order in zip(sort_cases, orders):
        got = insertion_sort_count(case["arr"])
        if case["compares"] != got:
            problems.append(f"SORT_CASES {case['name']}: {case['compares']} != counted {got}")
        if order and case["arr"] != order(case["arr"]):
            problems.append(f"SORT_CASES {case['name']} array is not in the order its name claims")
    for key, case in zip(["insSortedCompares", "insReversedCompares", "insRandomCompares"], sort_cases):
        if facts[key] != insertion_sort_count(case["arr"]):
            problems.append(f"FACTS.{key} {facts[key]} != counted")
    for n_, rev, srt in pure_data["SORT_COSTS"]:
        if rev != insertion_sort_count(list(range(n_ - 1, -1, -1))) or srt != insertion_sort_count(list(range(n_))):
            problems.append(f"SORT_COSTS row n={n_} wrong")
    print("insertion sort counts (cases + chart) recounted in Python")

    # 4. Built HTML check (if dist file exists)
    dist = os.path.join(WEB, "lesson-artifacts", "dist", "big-o", "input-dependency-best-worst-average.html")
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
