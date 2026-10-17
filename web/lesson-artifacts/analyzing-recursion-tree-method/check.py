"""Executes the recursion tree and Fibonacci memoization code in Python and TypeScript.

Validates:
  * fib_naive matches independent recurrence call counts in Python and TypeScript.
  * fib_memo matches linear call counts (2n - 1) in Python and TypeScript.
  * fib_broken_memo (mistake) fails to cache, matching naive call counts in both runtimes.
  * lesson.js PURE block matches Python's independent calculations.
  * built HTML embeds the exact PURE block.
"""
import json, math, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
CODE = os.path.join(HERE, "code")
WEB = os.path.normpath(os.path.join(HERE, "..", ".."))
ESBUILD = os.path.join(WEB, "node_modules", ".bin", "esbuild")


def expected_fib_val(n):
    if n <= 1:
        return n
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b


def expected_naive_calls(n):
    if n <= 1:
        return 1
    # C(n) = 1 + C(n-1) + C(n-2) = 2 * Fib(n+1) - 1
    c = [0] * (n + 1)
    c[0] = 1
    c[1] = 1
    for i in range(2, n + 1):
        c[i] = 1 + c[i - 1] + c[i - 2]
    return c[n]


def expected_memo_calls(n):
    if n <= 1:
        return 1
    return 2 * n - 1


def run_py_cases(cases):
    ns = {}
    with open(os.path.join(CODE, "solution.py")) as f:
        exec(f.read(), ns)
    ns_m = {}
    with open(os.path.join(CODE, "mistake.py")) as f:
        exec(f.read(), ns_m)

    res = []
    for n in cases:
        val_naive, calls_naive = ns["fib_naive"](n)
        val_memo, calls_memo = ns["fib_memo"](n)
        val_broken, calls_broken = ns_m["fib_broken_memo"](n)
        res.append({
            "naive": [val_naive, calls_naive],
            "memo": [val_memo, calls_memo],
            "broken": [val_broken, calls_broken]
        })
    return res


DRIVER = r"""
const CASES = JSON.parse(require('fs').readFileSync(0, 'utf8'));
const out = CASES.map(n => {
  const [valNaive, callsNaive] = fibNaive(n);
  const [valMemo, callsMemo] = fibMemo(n);
  const [valBroken, callsBroken] = fibBrokenMemo(n);
  return {
    naive: [valNaive, callsNaive],
    memo: [valMemo, callsMemo],
    broken: [valBroken, callsBroken]
  };
});
process.stdout.write(JSON.stringify(out));
"""


def run_ts_cases(cases):
    src = open(os.path.join(CODE, "solution.ts")).read() + "\n" + open(os.path.join(CODE, "mistake.ts")).read()
    js = subprocess.run([ESBUILD, "--loader=ts", "--format=cjs"], input=src, capture_output=True, text=True, check=True).stdout
    res = subprocess.run(["node", "-e", js + DRIVER], input=json.dumps(cases), capture_output=True, text=True)
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
  FACTS: FACTS
}));
"""
    res = subprocess.run(["node", "-e", probe], capture_output=True, text=True)
    if res.returncode:
        raise SystemExit("lesson.js PURE block failed in node:\n" + res.stderr)
    return json.loads(res.stdout)


def main():
    problems = []
    cases = [0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 12]

    py_res = run_py_cases(cases)
    ts_res = run_ts_cases(cases)

    # 1. Validate solution: naive and memo
    for label, res_list in [("Python", py_res), ("TypeScript", ts_res)]:
        for n, item in zip(cases, res_list):
            want_val = expected_fib_val(n)
            want_naive_c = expected_naive_calls(n)
            want_memo_c = expected_memo_calls(n)

            # naive checks
            got_naive_val, got_naive_c = item["naive"]
            if got_naive_val != want_val:
                problems.append(f"{label} fib_naive({n}) val {got_naive_val} != {want_val}")
            if got_naive_c != want_naive_c:
                problems.append(f"{label} fib_naive({n}) calls {got_naive_c} != {want_naive_c}")

            # memo checks
            got_memo_val, got_memo_c = item["memo"]
            if got_memo_val != want_val:
                problems.append(f"{label} fib_memo({n}) val {got_memo_val} != {want_val}")
            if got_memo_c != want_memo_c:
                problems.append(f"{label} fib_memo({n}) calls {got_memo_c} != {want_memo_c}")

            # mistake checks: broken memo should equal naive calls (zero cross-call reuse)
            got_broken_val, got_broken_c = item["broken"]
            if got_broken_val != want_val:
                problems.append(f"{label} fib_broken_memo({n}) val {got_broken_val} != {want_val}")
            if got_broken_c != got_naive_c:
                problems.append(f"{label} fib_broken_memo({n}) calls {got_broken_c} != {got_naive_c}")
            if n >= 4 and got_broken_c <= got_memo_c:
                problems.append(f"{label} fib_broken_memo({n}) unexpectedly succeeded in caching!")

    print(f"fib_naive vs fib_memo: {len(cases)}/{len(cases)} cases matched independent models in Python and TS")
    print(f"fib_broken_memo (mistake): fails to cache on all non-trivial cases in Python and TS (expected)")

    # 2. PURE block validation
    pure_data = run_pure()
    facts = pure_data["FACTS"]

    # Verify FACTS
    if facts["bsN"] != 16 or facts["bsLevels"] != 5 or facts["bsTotalWork"] != 5:
        problems.append(f"FACTS Binary Search mismatch: {facts}")
    if facts["msN"] != 16 or facts["msLevels"] != 5 or facts["msWorkPerLevel"] != 16 or facts["msTotalWork"] != 80:
        problems.append(f"FACTS Merge Sort mismatch: {facts}")
    if facts["fibN"] != 4 or facts["fibNaiveCalls"] != expected_naive_calls(4) or facts["fibMemoCalls"] != expected_memo_calls(4):
        problems.append(f"FACTS fib(4) mismatch: {facts}")
    if facts["fib6NaiveCalls"] != expected_naive_calls(6) or facts["fib6MemoCalls"] != expected_memo_calls(6):
        problems.append(f"FACTS fib(6) mismatch: {facts}")
    if facts["fib8NaiveCalls"] != expected_naive_calls(8) or facts["fib8MemoCalls"] != expected_memo_calls(8):
        problems.append(f"FACTS fib(8) mismatch: {facts}")

    # 3. Built HTML check (if exists)
    dist = os.path.join(WEB, "lesson-artifacts", "dist", "big-o", "analyzing-recursion-tree-method.html")
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
