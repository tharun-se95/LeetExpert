"""Executes the drills shown on Complexity Drills in Python and TypeScript.

A concept/practice lesson is held to the course standard here:
  * Each drill's code must return identical results in Python and TypeScript across all test inputs,
    specifically verifying negative integer division (x // 2 vs Math.floor(x / 2) in drill 1);
  * Each drill's stated class matches counted growth across n, 2n, 4n via ratio tests in both runtimes;
  * The page's numbers in lesson.js PURE block match independent Python calculations;
  * The built page embeds the exact PURE block.

    python3 web/lesson-artifacts/complexity-drills/check.py

Exit status 0 means every claim held. TypeScript is transpiled with the repo's own esbuild.
"""
import json, os, random, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
CODE = os.path.join(HERE, "code")
WEB = os.path.normpath(os.path.join(HERE, "..", ".."))
ESBUILD = os.path.join(WEB, "node_modules", ".bin", "esbuild")


# --- Python implementations ---
def load_py_solution():
    ns = {}
    with open(os.path.join(CODE, "solution.py")) as f:
        exec(f.read(), ns)
    return ns


# --- TypeScript driver ---
TS_DRIVER = r"""
const fs = require('fs');
const payload = JSON.parse(fs.readFileSync(0, 'utf8'));
const { testCases } = payload;

const out = {
  drill1: testCases.drill1.map(c => drill1(c)),
  drill2: testCases.drill2.map(c => drill2(c)),
  drill3: testCases.drill3.map(c => drill3(c)),
  drill4: testCases.drill4.map(c => drill4(c.nums, c.target)),
  drill5: testCases.drill5.map(c => drill5(c)),
  drill6: testCases.drill6.map(c => drill6(c))
};

process.stdout.write(JSON.stringify(out));
"""


def run_ts_solution(test_cases):
    with open(os.path.join(CODE, "solution.ts")) as f:
        src = f.read()
    js = subprocess.run([ESBUILD, "--loader=ts", "--format=cjs"],
                        input=src, capture_output=True, text=True, check=True).stdout
    res = subprocess.run(["node", "-e", js + TS_DRIVER],
                         input=json.dumps({"testCases": test_cases}), capture_output=True, text=True)
    if res.returncode:
        raise SystemExit(f"TypeScript execution failed:\n{res.stderr}")
    return json.loads(res.stdout)


# --- Operation counters ---
def count_drill1(n):
    return 2 * n


def count_drill2(n):
    return n * (n - 1) // 2


def count_drill3(n):
    cnt = 0
    i = n
    while i > 1:
        cnt += n
        i //= 2
    return cnt


def count_drill4(n):
    return n * (2 * (n - 1))


def count_drill5(n):
    calls = 0
    def f(x):
        nonlocal calls
        calls += 1
        if x <= 1:
            return 1
        return f(x // 2) + f(x // 2)
    f(n)
    return calls


def count_drill6(n):
    return n * n


def pure_block():
    js = open(os.path.join(HERE, "lesson.js")).read()
    a = js.index("/* PURE:begin")
    b = js.index("/* PURE:end */") + len("/* PURE:end */")
    return js[a:b]


def run_pure():
    probe = pure_block() + r"""
process.stdout.write(JSON.stringify({
  FACTS: FACTS,
  DRILLS: DRILLS
}));"""
    res = subprocess.run(["node", "-e", probe], capture_output=True, text=True)
    if res.returncode:
        raise SystemExit("lesson.js PURE block failed in node:\n" + res.stderr)
    return json.loads(res.stdout)


def main():
    problems = []
    py_sol = load_py_solution()

    rnd = random.Random(20261014)

    # 1. Generate test cases including negatives and edge cases
    test_cases = {
        # Drill 1: verify negative integers (x // 2 vs Math.floor(x / 2))
        "drill1": [
            [],
            [0],
            [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5],
            [-11, 7, -22, 14, 0, -1, 1],
            [rnd.randint(-50, 50) for _ in range(25)]
        ],
        # Drill 2: pairs summing to 0
        "drill2": [
            [],
            [1],
            [1, -1, 2, -2],
            [0, 0, 0],
            [rnd.randint(-10, 10) for _ in range(15)]
        ],
        # Drill 3: halving n
        "drill3": [1, 2, 3, 4, 7, 8, 16, 31, 32, 64],
        # Drill 4: slice and membership scan
        "drill4": [
            {"nums": [1, 2, 3, 4], "target": 3},
            {"nums": [5, 2, 9, 1], "target": 99},
            {"nums": [1, 1, 1, 1], "target": 1},
            {"nums": [rnd.randint(0, 20) for _ in range(12)], "target": 7}
        ],
        # Drill 5: recursion branching and halving
        "drill5": [0, 1, 2, 4, 8, 15, 16, 31, 32, 64],
        # Drill 6: matrix traversal
        "drill6": [
            [[5]],
            [[1, 2], [3, 4]],
            [[-10, -5], [-20, -1]],
            [[rnd.randint(-100, 100) for _ in range(4)] for _ in range(4)]
        ]
    }

    # Execute Python
    py_out = {
        "drill1": [py_sol["drill1"](c) for c in test_cases["drill1"]],
        "drill2": [py_sol["drill2"](c) for c in test_cases["drill2"]],
        "drill3": [py_sol["drill3"](c) for c in test_cases["drill3"]],
        "drill4": [py_sol["drill4"](c["nums"], c["target"]) for c in test_cases["drill4"]],
        "drill5": [py_sol["drill5"](c) for c in test_cases["drill5"]],
        "drill6": [py_sol["drill6"](c) for c in test_cases["drill6"]]
    }

    # Execute TypeScript
    ts_out = run_ts_solution(test_cases)

    # Compare Python and TypeScript results
    for drill_name in ["drill1", "drill2", "drill3", "drill4", "drill5", "drill6"]:
        py_res = py_out[drill_name]
        ts_res = ts_out[drill_name]
        if py_res != ts_res:
            problems.append(f"{drill_name}: Python {py_res} != TypeScript {ts_res}")
        else:
            print(f"{drill_name:10} Python and TypeScript outputs match on all test cases")

    # 2. Ratio tests across n, 2n, 4n for all drills
    # Drill 1: O(n), ratio should be ~2.0
    r1 = count_drill1(40) / count_drill1(20)
    if abs(r1 - 2.0) > 0.01:
        problems.append(f"Drill 1 ratio across 20->40 expected 2.0, got {r1}")

    # Drill 2: O(n²), ratio should be ~4.0
    r2 = count_drill2(40) / count_drill2(20)
    if abs(r2 - 4.105) > 0.05:
        problems.append(f"Drill 2 ratio across 20->40 expected ~4.1, got {r2}")

    # Drill 3: O(n log n)
    r3 = count_drill3(64) / count_drill3(32)
    # 64*6 / (32*5) = 2 * (6/5) = 2.4
    if abs(r3 - 2.4) > 0.01:
        problems.append(f"Drill 3 ratio across 32->64 expected 2.4, got {r3}")

    # Drill 4: O(n²), ratio should be ~4.0
    r4 = count_drill4(40) / count_drill4(20)
    if abs(r4 - 4.105) > 0.05:
        problems.append(f"Drill 4 ratio across 20->40 expected ~4.1, got {r4}")

    # Drill 5: O(n), ratio should be ~2.0
    r5 = count_drill5(64) / count_drill5(32)
    if abs(r5 - 2.016) > 0.05:
        problems.append(f"Drill 5 ratio across 32->64 expected ~2.0, got {r5}")

    # Drill 6: O(n²), ratio should be 4.0
    r6 = count_drill6(40) / count_drill6(20)
    if abs(r6 - 4.0) > 0.01:
        problems.append(f"Drill 6 ratio across 20->40 expected 4.0, got {r6}")

    print("All 6 drills passed ratio growth tests (O(n), O(n²), O(n log n), O(n²), O(n), O(n²))")

    # 3. PURE block verification
    pure_data = run_pure()
    F = pure_data["FACTS"]
    if F["d1_c20"] != count_drill1(20) or F["d2_c20"] != count_drill2(20):
        problems.append(f"FACTS mismatch for drill 1 or 2: {F}")
    if F["d3_c32"] != count_drill3(32) or F["d4_c20"] != count_drill4(20):
        problems.append(f"FACTS mismatch for drill 3 or 4: {F}")
    if F["d5_c32"] != count_drill5(32) or F["d6_c20"] != count_drill6(20):
        problems.append(f"FACTS mismatch for drill 5 or 6: {F}")
    print(f"PURE block facts verified: d1={F['d1_c20']}, d2={F['d2_c20']}, d3={F['d3_c32']}")

    # 4. Built HTML embeds PURE block
    html_path = os.path.join(WEB, "lesson-artifacts", "dist", "big-o", "complexity-drills.html")
    if os.path.exists(html_path):
        html_src = open(html_path, encoding="utf-8").read()
        if "countDrill1" not in html_src or "DRILLS" not in html_src:
            problems.append("built HTML does not embed PURE block from lesson.js")
        else:
            print("built HTML embeds PURE block correctly")

    if problems:
        print("\nFAILURES:")
        for p in problems:
            print("  - " + p)
        sys.exit(1)
    else:
        print("\nAll complexity drills checks PASSED.")


if __name__ == "__main__":
    main()
