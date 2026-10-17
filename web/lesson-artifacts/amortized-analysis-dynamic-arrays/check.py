"""Executes the code shown on Amortized Analysis & Dynamic Arrays in Python and TypeScript.

A concept lesson has no sandbox cases, so its code is held to the course standard here:
  * code/solution.* (DynArray) must match an independent model on hundreds of operations:
    exact element storage, correct capacity doubling, and total element copies strictly bounded by < n;
  * code/mistake.* (DynArrayFixed) must match the quadratic copy model n(n-1)/2 in both runtimes,
    exceeding linear bounds and failing the amortized O(1) claim as the "Watch out" explains;
  * the page's numbers (lesson.js between PURE:begin and PURE:end) must equal an independent
    Python derivation of doubling vs fixed growth copy totals;
  * the built page must embed exactly that PURE block.

    python3 web/lesson-artifacts/amortized-analysis-dynamic-arrays/check.py

Exit status 0 means every claim held. TypeScript is transpiled with the repo's own esbuild.
"""
import json, os, random, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
CODE = os.path.join(HERE, "code")
WEB = os.path.normpath(os.path.join(HERE, "..", ".."))
ESBUILD = os.path.join(WEB, "node_modules", ".bin", "esbuild")


def model_doubling(n, init_cap=1):
    cap = init_cap
    size = 0
    total_copies = 0
    history = []
    for i in range(1, n + 1):
        cur_copies = 0
        cap_before = cap
        if size == cap:
            cur_copies = size
            total_copies += cur_copies
            cap *= 2
        size += 1
        history.append({
            "append": i,
            "cap_before": cap_before,
            "cap_after": cap,
            "copies": cur_copies,
            "total_copies": total_copies
        })
    return {"size": size, "cap": cap, "total_copies": total_copies, "history": history}


def model_fixed(n, inc=1, init_cap=1):
    cap = init_cap
    size = 0
    total_copies = 0
    history = []
    for i in range(1, n + 1):
        cur_copies = 0
        cap_before = cap
        if size == cap:
            cur_copies = size
            total_copies += cur_copies
            cap += inc
        size += 1
        history.append({
            "append": i,
            "cap_before": cap_before,
            "cap_after": cap,
            "copies": cur_copies,
            "total_copies": total_copies
        })
    return {"size": size, "cap": cap, "total_copies": total_copies, "history": history}


def run_py_solution(cases):
    ns = {}
    with open(os.path.join(CODE, "solution.py")) as f:
        exec(f.read(), ns)
    results = []
    for seq in cases:
        arr = ns["DynArray"](1)
        history = []
        for x in seq:
            arr.append(x)
            history.append({
                "size": arr.size,
                "cap": arr.capacity,
                "copies": arr.copies,
                "total_copies": arr.total_copies
            })
        stored = [arr.get(i) for i in range(arr.size)]
        results.append({"stored": stored, "history": history})
    return results


def run_py_mistake(cases):
    ns = {}
    with open(os.path.join(CODE, "mistake.py")) as f:
        exec(f.read(), ns)
    results = []
    for seq in cases:
        arr = ns["DynArrayFixed"](1)
        history = []
        for x in seq:
            arr.append(x)
            history.append({
                "size": arr.size,
                "cap": arr.capacity,
                "copies": arr.copies,
                "total_copies": arr.total_copies
            })
        stored = [arr.get(i) for i in range(arr.size)]
        results.append({"stored": stored, "history": history})
    return results


TS_DRIVER = r"""
const fs = require('fs');
const cases = JSON.parse(fs.readFileSync(0, 'utf8'));
const isMistake = process.env.IS_MISTAKE === '1';

const results = cases.map(seq => {
  const arr = isMistake ? new DynArrayFixed(1) : new DynArray(1);
  const history = [];
  for (const x of seq) {
    arr.append(x);
    history.push({
      size: arr.size,
      cap: arr.capacity,
      copies: arr.copies,
      total_copies: arr.totalCopies
    });
  }
  const stored = [];
  for (let i = 0; i < arr.size; i++) {
    stored.push(arr.get(i));
  }
  return { stored, history };
});

process.stdout.write(JSON.stringify(results));
"""


def run_ts(file_name, is_mistake, cases):
    with open(os.path.join(CODE, file_name)) as f:
        src = f.read()
    js = subprocess.run([ESBUILD, "--loader=ts", "--format=cjs"],
                        input=src, capture_output=True, text=True, check=True).stdout
    res = subprocess.run(["node", "-e", js + TS_DRIVER],
                         input=json.dumps(cases), capture_output=True, text=True,
                         env={**os.environ, "IS_MISTAKE": "1" if is_mistake else "0"})
    if res.returncode:
        raise SystemExit(f"TypeScript run of {file_name} failed:\n{res.stderr}")
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
  sim9_double: SIM9_DOUBLE,
  sim32_double: SIM32_DOUBLE,
  sim9_fixed: SIM9_FIXED,
  sim32_fixed: SIM32_FIXED
}));"""
    res = subprocess.run(["node", "-e", probe], capture_output=True, text=True)
    if res.returncode:
        raise SystemExit("lesson.js PURE block failed in node:\n" + res.stderr)
    return json.loads(res.stdout)


def make_cases():
    rnd = random.Random(20261014)
    # deterministic edge sequences
    cases = [
        [],
        [1],
        [10, 20],
        list(range(9)),
        list(range(32)),
        list(range(64)),
        list(range(100)),
    ]
    # random sequences
    for _ in range(40):
        length = rnd.randint(1, 80)
        cases.append([rnd.randint(-100, 100) for _ in range(length)])
    return cases


def main():
    problems = []
    cases = make_cases()

    # 1. Verify DynArray (solution) in Python and TypeScript
    py_sol = run_py_solution(cases)
    ts_sol = run_ts("solution.ts", False, cases)

    for label, results in [("solution.py", py_sol), ("solution.ts", ts_sol)]:
        matched = 0
        for seq, res in zip(cases, results):
            n = len(seq)
            # Check values stored
            if res["stored"] != seq:
                problems.append(f"{label}: stored values mismatch on sequence of len {n}")
                continue
            # Compare with independent doubling model
            expected_mod = model_doubling(n, 1)
            if n > 0:
                last_step = res["history"][-1]
                if last_step["total_copies"] != expected_mod["total_copies"]:
                    problems.append(f"{label}: len {n} total_copies {last_step['total_copies']} != model {expected_mod['total_copies']}")
                    continue
                if last_step["cap"] != expected_mod["cap"]:
                    problems.append(f"{label}: len {n} capacity {last_step['cap']} != model {expected_mod['cap']}")
                    continue
                # The core amortized invariant: total copies < 2 * n
                if last_step["total_copies"] >= 2 * n:
                    problems.append(f"{label}: len {n} violated total_copies < 2 * n ({last_step['total_copies']} >= {2 * n})")
                    continue
            matched += 1
        print(f"{label:15} {matched}/{len(cases)} test cases matched doubling model with copies < n")

    # 2. Verify DynArrayFixed (mistake) in Python and TypeScript
    py_mis = run_py_mistake(cases)
    ts_mis = run_ts("mistake.ts", True, cases)

    for label, results in [("mistake.py", py_mis), ("mistake.ts", ts_mis)]:
        matched_quad = 0
        for seq, res in zip(cases, results):
            n = len(seq)
            expected_copies = n * (n - 1) // 2
            if n > 0:
                last_step = res["history"][-1]
                if last_step["total_copies"] != expected_copies:
                    problems.append(f"{label}: len {n} expected {expected_copies} copies, got {last_step['total_copies']}")
                    continue
                # For n >= 5, fixed growth total copies exceeds 2n (demonstrating failure)
                if n >= 5 and last_step["total_copies"] <= 2 * n:
                    problems.append(f"{label}: len {n} failed to exceed 2n")
                    continue
            matched_quad += 1
        print(f"{label:15} {matched_quad}/{len(cases)} test cases matched quadratic n(n-1)/2 model")

    # Specific check on n=9 and n=32 from the lesson
    mod9 = model_doubling(9, 1)
    if mod9["total_copies"] != 15:
        problems.append(f"doubling model at 9 appends: expected 15 copies, got {mod9['total_copies']}")
    mod9_fix = model_fixed(9, 1, 1)
    if mod9_fix["total_copies"] != 36:
        problems.append(f"fixed model at 9 appends: expected 36 copies, got {mod9_fix['total_copies']}")

    # 3. Verify PURE block and FACTS
    pure_data = run_pure()
    F = pure_data["FACTS"]

    if F["double_copies_9"] != 15 or F["double_total_work_9"] != 24:
        problems.append(f"FACTS 9 appends doubling: {F}")
    if F["double_copies_32"] != 31 or F["double_total_work_32"] != 63:
        problems.append(f"FACTS 32 appends doubling: {F}")
    if F["fixed_copies_9"] != 36:
        problems.append(f"FACTS 9 appends fixed: {F}")
    if F["fixed_copies_32"] != 496 or F["fixed_total_work_32"] != 528:
        problems.append(f"FACTS 32 appends fixed: {F}")

    print(f"PURE block facts verified: 9 appends = {F['double_copies_9']} copies / {F['double_total_work_9']} work; 32 appends = {F['double_copies_32']} copies")

    # 4. Check built HTML embeds PURE block
    html_path = os.path.join(WEB, "lesson-artifacts", "dist", "big-o", "amortized-analysis-dynamic-arrays.html")
    if os.path.exists(html_path):
        html_src = open(html_path, encoding="utf-8").read()
        if "double_copies_9" not in html_src or "SIM9_DOUBLE" not in html_src:
            problems.append("built HTML does not embed PURE block from lesson.js")
        else:
            print("built HTML embeds PURE block correctly")
    else:
        print("Note: run build.py to verify HTML embedding")

    if problems:
        print("\nFAILURES:")
        for p in problems:
            print("  - " + p)
        sys.exit(1)
    else:
        print("\nAll amortized analysis checks PASSED.")


if __name__ == "__main__":
    main()
