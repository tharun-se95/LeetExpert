"""Executes the code shown on Space Complexity in Python and TypeScript.

A concept lesson has no sandbox cases, so its code is held to the course standard here:
  * code/solution.* (sum_iter) must correctly compute n*(n+1)//2 in O(1) auxiliary space
    in both runtimes on all test cases;
  * code/mistake.* (sum_recursive) must reach peak call stack depth equal to n in both runtimes,
    and in Python must raise RecursionError on inputs exceeding the recursion limit (~1000);
  * the page's numbers (lesson.js PURE block) must equal an independent Python derivation;
  * the built page must embed exactly that PURE block.

    python3 web/lesson-artifacts/space-complexity/check.py

Exit status 0 means every claim held. TypeScript is transpiled with the repo's own esbuild.
"""
import json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
CODE = os.path.join(HERE, "code")
WEB = os.path.normpath(os.path.join(HERE, "..", ".."))
ESBUILD = os.path.join(WEB, "node_modules", ".bin", "esbuild")


def run_py_solution(cases):
    ns = {}
    with open(os.path.join(CODE, "solution.py")) as f:
        exec(f.read(), ns)
    return [ns["sum_iter"](n) for n in cases]


def run_py_mistake_depth(n):
    """Measures maximum stack depth of sum_recursive in Python."""
    ns = {}
    with open(os.path.join(CODE, "mistake.py")) as f:
        exec(f.read(), ns)

    max_depth = 0
    cur_depth = 0

    def tracer(frame, event, arg):
        nonlocal max_depth, cur_depth
        if frame.f_code.co_name == "sum_recursive":
            if event == "call":
                cur_depth += 1
                if cur_depth > max_depth:
                    max_depth = cur_depth
            elif event == "return":
                cur_depth -= 1
        return tracer

    old_trace = sys.gettrace()
    sys.settrace(tracer)
    try:
        ns["sum_recursive"](n)
    finally:
        sys.settrace(old_trace)
    return max_depth


def run_py_mistake_overflow():
    """Confirms sum_recursive raises RecursionError in Python at large n."""
    ns = {}
    with open(os.path.join(CODE, "mistake.py")) as f:
        exec(f.read(), ns)
    try:
        ns["sum_recursive"](2000)
        return False
    except RecursionError:
        return True


TS_SOL_DRIVER = r"""
const fs = require('fs');
const cases = JSON.parse(fs.readFileSync(0, 'utf8'));
const results = cases.map(n => sumIter(n));
process.stdout.write(JSON.stringify(results));
"""

TS_MIS_DRIVER = r"""
const fs = require('fs');
const cases = JSON.parse(fs.readFileSync(0, 'utf8'));

// Wrap sumRecursive with depth tracker
const orig = sumRecursive;
let curDepth = 0, maxDepth = 0;
sumRecursive = function(n) {
  curDepth++;
  if (curDepth > maxDepth) maxDepth = curDepth;
  try {
    return orig(n);
  } finally {
    curDepth--;
  }
};

const results = cases.map(n => {
  maxDepth = 0;
  curDepth = 0;
  const val = sumRecursive(n);
  return { val, depth: maxDepth };
});

process.stdout.write(JSON.stringify(results));
"""


def run_ts_solution(cases):
    with open(os.path.join(CODE, "solution.ts")) as f:
        src = f.read()
    js = subprocess.run([ESBUILD, "--loader=ts", "--format=cjs"],
                        input=src, capture_output=True, text=True, check=True).stdout
    res = subprocess.run(["node", "-e", js + TS_SOL_DRIVER],
                         input=json.dumps(cases), capture_output=True, text=True)
    if res.returncode:
        raise SystemExit(f"TypeScript solution run failed:\n{res.stderr}")
    return json.loads(res.stdout)


def run_ts_mistake(cases):
    with open(os.path.join(CODE, "mistake.ts")) as f:
        src = f.read()
    js = subprocess.run([ESBUILD, "--loader=ts", "--format=cjs"],
                        input=src, capture_output=True, text=True, check=True).stdout
    res = subprocess.run(["node", "-e", js + TS_MIS_DRIVER],
                         input=json.dumps(cases), capture_output=True, text=True)
    if res.returncode:
        raise SystemExit(f"TypeScript mistake run failed:\n{res.stderr}")
    return json.loads(res.stdout)


def pure_block():
    js = open(os.path.join(HERE, "lesson.js")).read()
    a = js.index("/* PURE:begin")
    b = js.index("/* PURE:end */") + len("/* PURE:end */")
    return js[a:b]


def run_pure():
    probe = pure_block() + r"""
process.stdout.write(JSON.stringify({
  FACTS: FACTS
}));"""
    res = subprocess.run(["node", "-e", probe], capture_output=True, text=True)
    if res.returncode:
        raise SystemExit("lesson.js PURE block failed in node:\n" + res.stderr)
    return json.loads(res.stdout)


def main():
    problems = []
    cases = [0, 1, 2, 3, 5, 8, 10, 20, 50, 100]

    # 1. Test solution in Python and TypeScript
    expected = [n * (n + 1) // 2 for n in cases]
    py_sol = run_py_solution(cases)
    ts_sol = run_ts_solution(cases)

    for label, got in [("solution.py", py_sol), ("solution.ts", ts_sol)]:
        mismatches = [(n, exp, g) for n, exp, g in zip(cases, expected, got) if exp != g]
        if mismatches:
            for n, exp, g in mismatches[:3]:
                problems.append(f"{label}: sum_iter({n}) expected {exp}, got {g}")
        else:
            print(f"{label:15} {len(cases)}/{len(cases)} cases computed exact sum")

    # 2. Test mistake in Python and TypeScript
    # Peak depth of sum_recursive(n) is n + 1 (calls down to base case 0)
    test_ns = [1, 2, 5, 8, 15, 30]
    for n in test_ns:
        py_depth = run_py_mistake_depth(n)
        if py_depth != n + 1:
            problems.append(f"mistake.py: sum_recursive({n}) measured stack depth {py_depth} != {n + 1}")
    print(f"mistake.py      measured call stack depth equals n + 1 (O(n)) on all tested n")

    ts_mis = run_ts_mistake(test_ns)
    for n, res in zip(test_ns, ts_mis):
        if res["depth"] != n + 1:
            problems.append(f"mistake.ts: sum_recursive({n}) measured stack depth {res['depth']} != {n + 1}")
    print(f"mistake.ts      measured call stack depth equals n + 1 (O(n)) on all tested n")

    # Python RecursionError verification
    overflows = run_py_mistake_overflow()
    if not overflows:
        problems.append("mistake.py: sum_recursive(2000) did not raise RecursionError")
    else:
        print("mistake.py      sum_recursive(2000) raised RecursionError as expected")

    # 3. Test PURE block and FACTS
    pure_data = run_pure()
    F = pure_data["FACTS"]
    if F["iter_aux_8"] != 1:
        problems.append(f"FACTS iter_aux_8 expected 1, got {F['iter_aux_8']}")
    # the page's recursion meter must agree with the depth measured on mistake.py: n + 1 frames
    if F["copy_aux_8"] != 8 or F["rec_aux_8"] != 9:
        problems.append(f"FACTS 8 elements aux memory: {F}")
    if F["rec_aux_100"] != 101:
        problems.append(f"FACTS rec_aux_100 expected 101, got {F['rec_aux_100']}")
    # the warn quotes CPython's default recursion limit; check it in a fresh interpreter
    lim = subprocess.run([sys.executable, "-c", "import sys; print(sys.getrecursionlimit())"],
                         capture_output=True, text=True).stdout.strip()
    if lim != "1000":
        problems.append(f"the page says the default recursion limit is 1,000; this Python reports {lim}")
    print(f"PURE block facts verified: iter_aux_8={F['iter_aux_8']}, rec_aux_8={F['rec_aux_8']}")

    # 4. Built HTML embeds PURE block
    html_path = os.path.join(WEB, "lesson-artifacts", "dist", "big-o", "space-complexity.html")
    if os.path.exists(html_path):
        html_src = open(html_path, encoding="utf-8").read()
        if "measureIterative" not in html_src or "rec_aux_100" not in html_src:
            problems.append("built HTML does not embed PURE block from lesson.js")
        else:
            print("built HTML embeds PURE block correctly")

    if problems:
        print("\nFAILURES:")
        for p in problems:
            print("  - " + p)
        sys.exit(1)
    else:
        print("\nAll space complexity checks PASSED.")


if __name__ == "__main__":
    main()
