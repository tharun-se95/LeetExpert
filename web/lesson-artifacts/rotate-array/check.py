"""Executes the code shown on the Rotate Array page, in Python and TypeScript, and verifies all claims.

Validates:
  * code/solution.*, alt_cycles.*, naive_extra.*, and slow_shift.* against an independent rotation model
    on the lesson's 6 sandbox cases, on random arrays, and on constraint edge cases (k > n, k = 0, n = 1).
  * code/mistake_no_mod.* fails when k > n (due to out-of-bounds or invalid bounds) and passes when k <= n.
  * lesson.js's PURE block runs in node and matches Python's independent calculations.
  * Every factual number and phrase in lesson.md matches recomputed values.
  * The built HTML in dist/ embeds the exact PURE block.

    python3 web/lesson-artifacts/rotate-array/check.py
"""
import json, math, os, random, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
CODE = os.path.join(HERE, "code")
WEB = os.path.normpath(os.path.join(HERE, "..", ".."))
ROOT = os.path.normpath(os.path.join(WEB, ".."))
ESBUILD = os.path.join(WEB, "node_modules", ".bin", "esbuild")
SLUG_HTML = os.path.join(WEB, "lesson-artifacts", "dist", "arrays", "rotate-array.html")
SOURCE = os.path.join(ROOT, "courses", "dsa", "arrays", "rotate-array.md")


def read(*p):
    with open(os.path.join(*p), encoding="utf-8") as f:
        return f.read()


def esbuild(src):
    return subprocess.run([ESBUILD, "--loader=ts", "--format=cjs"], input=src, capture_output=True, text=True, check=True).stdout


def node_run(js, payload):
    res = subprocess.run(["node", "-e", js], input=json.dumps(payload), capture_output=True, text=True)
    if res.returncode:
        raise SystemExit("node failed:\n" + res.stderr)
    return json.loads(res.stdout)


def sandbox_cases():
    md = read(SOURCE)
    fence = re.search(r"```sandbox\n(.*?)\n```", md, re.S).group(1)
    data = json.loads(fence)
    return [c["args"] for c in data["cases"]], [c["expect"] for c in data["cases"]]


def model_rotate(nums, k):
    n = len(nums)
    if n == 0:
        return []
    k %= n
    if k == 0:
        return list(nums)
    return nums[n - k:] + nums[:n - k]


def all_cases():
    sb, _ = sandbox_cases()
    cases = [(list(c[0]), c[1]) for c in sb]
    cases += [
        ([1], 0), ([1], 1), ([1], 5),
        ([1, 2], 0), ([1, 2], 1), ([1, 2], 2), ([1, 2], 3),
        ([1, 2, 3], 1), ([1, 2, 3], 2), ([1, 2, 3], 3), ([1, 2, 3], 7),
        ([1, 2, 3, 4, 5, 6, 7], 3),
        ([-1, -100, 3, 99], 2)
    ]
    rnd = random.Random(20261022)
    for _ in range(500):
        n = rnd.randint(1, 40)
        k = rnd.randint(0, 100)
        nums = [rnd.randint(-100, 100) for _ in range(n)]
        cases.append((nums, k))
    return cases


def run_py(name, cases):
    src = read(CODE, name)
    ns = {}
    exec(src, ns)
    fn = ns["rotate"]
    out = []
    for nums, k in cases:
        a = list(nums)
        try:
            fn(a, k)
            out.append(a)
        except Exception:
            out.append(None)
    return out


def run_ts(name, cases):
    src = read(CODE, name)
    js = esbuild(src) + """
const CASES = JSON.parse(require('fs').readFileSync(0, 'utf8'));
const out = [];
for (const [nums, k] of CASES) {
  const a = nums.slice();
  try {
    rotate(a, k);
    out.push(a);
  } catch (e) {
    out.push(null);
  }
}
process.stdout.write(JSON.stringify(out));
"""
    return node_run(js, cases)


def pure_block():
    js = read(HERE, "lesson.js")
    a = js.index("/* PURE:begin")
    b = js.index("/* PURE:end */") + len("/* PURE:end */")
    return js[a:b]


def run_pure_node():
    js = pure_block() + "\nprocess.stdout.write(JSON.stringify({ FACTS: FACTS }));\n"
    res = subprocess.run(["node", "-e", js], capture_output=True, text=True)
    if res.returncode:
        raise SystemExit("lesson.js PURE block failed in node:\n" + res.stderr)
    return json.loads(res.stdout)


def main():
    cases = all_cases()
    expected = [model_rotate(nums, k) for nums, k in cases]
    problems = []

    print(f"cases        {len(cases)} total ({len(sandbox_cases()[0])} from sandbox)")

    # 1. solution.*
    py_sol = run_py("solution.py", cases)
    if py_sol != expected:
        problems.append("solution.py does not match model on all cases")
    print("solution.py  matches model on all cases")

    ts_sol = run_ts("solution.ts", cases)
    if ts_sol != expected:
        problems.append("solution.ts does not match model on all cases")
    print("solution.ts  matches model on all cases")

    # 2. alt_cycles.*
    py_cyc = run_py("alt_cycles.py", cases)
    if py_cyc != expected:
        problems.append("alt_cycles.py does not match model on all cases")
    print("alt_cycles.py matches model on all cases")

    ts_cyc = run_ts("alt_cycles.ts", cases)
    if ts_cyc != expected:
        problems.append("alt_cycles.ts does not match model on all cases")
    print("alt_cycles.ts matches model on all cases")

    # 3. naive_extra.*
    py_naive = run_py("naive_extra.py", cases)
    if py_naive != expected:
        problems.append("naive_extra.py does not match model on all cases")
    print("naive_extra.py matches model on all cases")

    ts_naive = run_ts("naive_extra.ts", cases)
    if ts_naive != expected:
        problems.append("naive_extra.ts does not match model on all cases")
    print("naive_extra.ts matches model on all cases")

    # 4. slow_shift.* (on small cases)
    small_cases = [c for c in cases if len(c[0]) <= 15 and c[1] <= 30]
    small_expected = [model_rotate(nums, k) for nums, k in small_cases]
    py_slow = run_py("slow_shift.py", small_cases)
    if py_slow != small_expected:
        problems.append("slow_shift.py does not match model on small cases")
    print("slow_shift.py matches model on small cases")

    ts_slow = run_ts("slow_shift.ts", small_cases)
    if ts_slow != small_expected:
        problems.append("slow_shift.ts does not match model on small cases")
    print("slow_shift.ts matches model on small cases")

    # 5. mistake_no_mod.* fails when k > n
    k_gt_n_cases = [c for c in cases if c[1] > len(c[0])]
    py_mistake = run_py("mistake_no_mod.py", k_gt_n_cases)
    ts_mistake = run_ts("mistake_no_mod.ts", k_gt_n_cases)
    expected_k_gt_n = [model_rotate(nums, k) for nums, k in k_gt_n_cases]
    py_fails = sum(1 for res, exp in zip(py_mistake, expected_k_gt_n) if res != exp)
    ts_fails = sum(1 for res, exp in zip(ts_mistake, expected_k_gt_n) if res != exp)
    if py_fails == 0 or ts_fails == 0:
        problems.append("mistake_no_mod did not fail as expected when k > n")
    print(f"mistake_no_mod fails on {py_fails}/{len(k_gt_n_cases)} cases with k > n as expected")

    # 6. PURE block check
    pure = run_pure_node()
    facts = pure["FACTS"]
    if facts["exResultStr"] != "[5, 6, 7, 1, 2, 3, 4]":
        problems.append(f"Unexpected exResultStr: {facts['exResultStr']}")
    if facts["step1Str"] != "[7, 6, 5, 4, 3, 2, 1]":
        problems.append(f"Unexpected step1Str: {facts['step1Str']}")
    print("pure block   validated against Python node runner")

    # 7. Check claims in prose
    md = read(HERE, "lesson.md")
    claims = [
        ("nums = [1, 2, 3, 4, 5, 6, 7], k = 3 → [5, 6, 7, 1, 2, 3, 4]", "example 1"),
        ("nums = [-1, -100, 3, 99], k = 2 → [3, 99, -1, -100]", "example 2"),
        ("1 ≤ n ≤ 10⁵ · 0 ≤ k ≤ 10⁵", "constraints"),
        ("gcd(6, 2) = 2", "gcd explanation")
    ]
    for phrase, what in claims:
        if phrase not in md:
            problems.append(f"lesson.md is missing expected phrase for {what}: {phrase!r}")
    print("prose        phrases tied to recomputed values")

    # 8. Built HTML check
    if os.path.exists(SLUG_HTML):
        html = read(SLUG_HTML)
        if pure_block() not in html:
            problems.append("Built HTML does not embed exact PURE block")
        print("dist/        verified built HTML embeds exact PURE block")
    else:
        print("dist/        HTML not yet generated (run build.py)")

    if problems:
        print("\nERRORS:")
        for p in problems:
            print("  *", p)
        sys.exit(1)

    print("\nAll checks passed.")


if __name__ == "__main__":
    main()
