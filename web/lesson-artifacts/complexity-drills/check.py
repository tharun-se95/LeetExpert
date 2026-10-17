"""Holds the Complexity Drills page to the course standard: every count it shows is counted, none typed.

  * each drill's Python and TypeScript (code/drillN.py|ts) return identical values on random inputs,
    including negatives (`//` floors, so the TypeScript must use Math.floor);
  * lesson.js's PURE block (instrumented copies of the same code) runs in node, and its `result` for every
    row equals what the real Python and the real TypeScript return on the same input, so the copies
    are the shown code plus counters;
  * every row's count is re-derived by an independent Python instrumented copy and compared;
  * each drill's counts at n, 2n, 4n match the growth its stated class predicts (ratio test), and a
    wrong class is shown to fail the same test;
  * stated auxiliary space is measured: tracemalloc on the real Python (flat for O(1), linear for drill 4),
    nesting depth of the real drill 5 (log2 n + 1);
  * the three quiz snippets' FACTS match independent Python copies;
  * the choices rules (right choice never the longest, positions vary) and the built page
    (embeds the PURE block, holds no answer in its static DOM).

    cd web && python3 lesson-artifacts/build.py big-o/complexity-drills && python3 lesson-artifacts/complexity-drills/check.py

Exit status 0 means every claim held. TypeScript is transpiled with the repo's own esbuild.
"""
import json, math, os, random, re, subprocess, sys, tracemalloc

HERE = os.path.dirname(os.path.abspath(__file__))
CODE = os.path.join(HERE, "code")
WEB = os.path.normpath(os.path.join(HERE, "..", ".."))
ESBUILD = os.path.join(WEB, "node_modules", ".bin", "esbuild")
HTML = os.path.join(WEB, "lesson-artifacts", "dist", "big-o", "complexity-drills.html")

PY_NAMES = {1: "net_weight", 2: "count_cancelling_pairs", 3: "weigh_in_rounds", 4: "has_duplicate", 5: "halving_sum", 6: "heaviest"}
TS_NAMES = {1: "netWeight", 2: "countCancellingPairs", 3: "weighInRounds", 4: "hasDuplicate", 5: "halvingSum", 6: "heaviest"}

problems = []


def fail(msg):
    problems.append(msg)
    print("FAIL: " + msg)


# ---- the real code, in both languages ----
def load_py(k):
    ns = {}
    with open(os.path.join(CODE, f"drill{k}.py")) as f:
        exec(f.read(), ns)
    return ns[PY_NAMES[k]]


def run_ts(k, arg_lists):
    """The real drill k in TypeScript on each argument: transpile with esbuild, call in node."""
    src = open(os.path.join(CODE, f"drill{k}.ts")).read()
    js = subprocess.run([ESBUILD, "--loader=ts", "--format=cjs"], input=src, capture_output=True, text=True, check=True).stdout
    driver = "\nconst fn = " + TS_NAMES[k] + ";\nconst cases = JSON.parse(require('fs').readFileSync(0, 'utf8'));\nprocess.stdout.write(JSON.stringify(cases.map(c => fn(c))));\n"
    res = subprocess.run(["node", "-e", js + driver], input=json.dumps(arg_lists), capture_output=True, text=True)
    if res.returncode:
        raise SystemExit(f"drill{k}.ts failed in node:\n{res.stderr}")
    return json.loads(res.stdout)


# ---- independent instrumented Python copies (code/drillN.py with a counter added, nothing else changed) ----
def d_list(n):
    return [i - n // 2 for i in range(n)]


def d_grid(n):
    return [[(r * 7 + c * 13) % 101 for c in range(n)] for r in range(n)]


def count1(nums):
    total = steps = 0
    for x in nums:
        total += x; steps += 1
    for x in nums:
        total -= x // 2; steps += 1
    return total, steps, 0


def count2(nums):
    pairs = steps = 0
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            steps += 1
            if nums[i] + nums[j] == 0:
                pairs += 1
    return pairs, steps, 0


def count3(nums):
    total = steps = 0
    size = len(nums)
    while size > 1:
        for x in nums:
            total += x; steps += 1
        size //= 2
    return total, steps, 0


def count4(nums):
    steps = peak = 0
    for i, x in enumerate(nums):
        rest = nums[i + 1:]
        steps += len(rest)
        peak = max(peak, len(rest))
        for y in rest:
            steps += 1
            if y == x:
                return True, steps, peak
    return False, steps, peak


def count5(nums):
    st = {"calls": 0, "depth": 0, "peak": 0}

    def go(lo, hi):
        st["calls"] += 1; st["depth"] += 1
        st["peak"] = max(st["peak"], st["depth"])
        if hi - lo <= 1:
            r = nums[lo] if hi > lo else 0
        else:
            mid = (lo + hi) // 2
            r = go(lo, mid) + go(mid, hi)
        st["depth"] -= 1
        return r

    return go(0, len(nums)), st["calls"], st["peak"]


def count6(grid):
    best = grid[0][0]; steps = 0
    for row in grid:
        for w in row:
            steps += 1
            if w > best:
                best = w
    return best, steps, 0


COUNTERS = {1: count1, 2: count2, 3: count3, 4: count4, 5: count5, 6: count6}
INPUTS = {1: d_list, 2: d_list, 3: d_list, 4: d_list, 5: d_list, 6: d_grid}


def pure_block():
    js = open(os.path.join(HERE, "lesson.js")).read()
    a = js.index("/* PURE:begin")
    b = js.index("/* PURE:end */") + len("/* PURE:end */")
    return js[a:b]


def run_pure():
    probe = pure_block() + "\nprocess.stdout.write(JSON.stringify({FACTS: FACTS, DRILLS: DRILLS}));"
    res = subprocess.run(["node", "-e", probe], capture_output=True, text=True)
    if res.returncode:
        raise SystemExit("lesson.js PURE block failed in node:\n" + res.stderr)
    return json.loads(res.stdout)


def ratio_ok(cls, counts, ns):
    """Does counts (at n, 2n, 4n) show the growth class `cls`? Returns None when it does, else why not."""
    r = [counts[i + 1] / counts[i] for i in range(2)]
    if cls == "O(n)":
        ok = all(1.9 <= x <= 2.1 for x in r)
    elif cls == "O(n²)":
        ok = all(3.8 <= x <= 4.5 for x in r)
    elif cls == "O(n log n)":
        # exact on powers of two: n * log2(n)
        ok = all(c == n * int(math.log2(n)) for c, n in zip(counts, ns)) and all(2.0 < x < 2.6 for x in r)
    else:
        return f"no ratio test for {cls}"
    return None if ok else f"ratios {[round(x, 3) for x in r]} do not fit {cls}"


def main():
    pure = run_pure()
    D = pure["DRILLS"]
    F = pure["FACTS"]
    rnd = random.Random(20261017)

    # 1. Python == TypeScript on random inputs (negatives, empties, duplicates)
    cases = {
        1: [[]] + [[rnd.randint(-60, 60) for _ in range(rnd.randint(0, 25))] for _ in range(40)] + [[-1], [-11, 7, -22, 14, 0, -1, 1]],
        2: [[]] + [[rnd.randint(-5, 5) for _ in range(rnd.randint(0, 14))] for _ in range(40)] + [[0, 0, 0], [1, -1, 2, -2]],
        3: [[]] + [[rnd.randint(-9, 9) for _ in range(n)] for n in list(range(1, 20)) + [31, 32, 33, 64, 65]],
        4: [[]] + [[rnd.randint(0, 12) for _ in range(rnd.randint(1, 14))] for _ in range(40)] + [list(range(10)), [3, 1, 3], [5, 5]],
        5: [[]] + [[rnd.randint(-30, 30) for _ in range(n)] for n in list(range(1, 20)) + [31, 32, 33, 64, 65]],
        6: [[[rnd.randint(-100, 100) for _ in range(s)] for _ in range(s)] for s in range(1, 8)] + [[[-3, -9], [-20, -1]], [[5]]],
    }
    for k in range(1, 7):
        py = load_py(k)
        py_out = [py(json.loads(json.dumps(c))) for c in cases[k]]
        ts_out = run_ts(k, cases[k])
        if py_out != ts_out:
            bad = next(i for i, (a, b) in enumerate(zip(py_out, ts_out)) if a != b)
            fail(f"drill{k}: Python and TypeScript differ on {cases[k][bad]}: {py_out[bad]} vs {ts_out[bad]}")
        else:
            print(f"drill{k}: Python and TypeScript agree on {len(cases[k])} inputs")
    # the cases must be able to tell the languages apart where they differ
    if not any(any(x < 0 and x % 2 for x in c) for c in cases[1]):
        fail("drill1 cases never put a negative odd number through x // 2")
    if not any(count2(c)[0] > 0 for c in cases[2]):
        fail("drill2 cases never contain a cancelling pair")
    if not any(count4(c)[0] for c in cases[4]) or not any(not count4(c)[0] for c in cases[4]):
        fail("drill4 cases need both a duplicate and none")

    # 2. PURE block: result equals the real code's, count equals the independent copy's, at every row
    for d in D:
        k = d["id"]
        py = load_py(k)
        inputs = [INPUTS[k](r["n"]) for r in d["rows"]]
        ts_res = run_ts(k, inputs)
        for r, inp, tr in zip(d["rows"], inputs, ts_res):
            res, steps, peak = COUNTERS[k](inp)
            real = py(json.loads(json.dumps(inp)))
            if not (r["result"] == real == tr == res):
                fail(f"drill{k} n={r['n']}: PURE result {r['result']}, Python {real}, TypeScript {tr}, counting copy {res}")
            if r["steps"] != steps:
                fail(f"drill{k} n={r['n']}: PURE counted {r['steps']}, independent Python copy counted {steps}")
            if r["peak"] != peak:
                fail(f"drill{k} n={r['n']}: PURE peak {r['peak']}, Python copy {peak}")
        print(f"drill{k}: PURE counts {[r['steps'] for r in d['rows']]} equal the Python copy and the real code's results")

    # 3. growth class by ratio test, and a wrong class must fail it
    wrong = {1: "O(n²)", 2: "O(n)", 3: "O(n²)", 4: "O(n)", 5: "O(n²)", 6: "O(n)"}
    for d in D:
        k = d["id"]
        ns = [r["n"] for r in d["rows"]]
        if ns[1] != 2 * ns[0] or ns[2] != 4 * ns[0]:
            fail(f"drill{k}: sizes {ns} are not n, 2n, 4n")
        py_counts = [COUNTERS[k](INPUTS[k](n))[1] for n in ns]
        for who, counts in (("node (PURE)", [r["steps"] for r in d["rows"]]), ("Python copy", py_counts)):
            why = ratio_ok(d["time"], counts, ns)
            if why:
                fail(f"drill{k} {who}: stated {d['time']} but {why}")
            if ratio_ok(wrong[k], counts, ns) is None:
                fail(f"drill{k} {who}: the ratio test accepts the wrong class {wrong[k]}")
        # a longer ladder, in Python, so a class cannot hide behind three points
        big = [COUNTERS[k](INPUTS[k](n))[1] for n in (ns[0], 2 * ns[0], 4 * ns[0], 8 * ns[0], 16 * ns[0])]
        r = [big[i + 1] / big[i] for i in range(4)]
        lo, hi = {"O(n)": (1.9, 2.1), "O(n²)": (3.8, 4.5), "O(n log n)": (2.0, 2.6)}[d["time"]]
        if not all(lo <= x <= hi for x in r):
            fail(f"drill{k}: ratios over five sizes {[round(x, 3) for x in r]} leave [{lo}, {hi}] for {d['time']}")
    print("growth: every drill's counts at n, 2n, 4n fit its stated class and reject a wrong one")

    # 4. auxiliary space, measured
    py_peaks = {}
    for k in (1, 2, 3, 6):  # O(1): extra bytes do not grow with n
        py = load_py(k)
        peaks = []
        for n in (300, 1200):
            inp = INPUTS[k](n)
            tracemalloc.start(); tracemalloc.reset_peak()
            base = tracemalloc.get_traced_memory()[0]
            py(inp)
            peaks.append(tracemalloc.get_traced_memory()[1] - base)
            tracemalloc.stop()
        py_peaks[k] = peaks
        if max(peaks) > 2048:
            fail(f"drill{k}: stated O(1) space but tracemalloc peaked at {peaks} bytes")
    print(f"space: drills 1, 2, 3, 6 allocate {py_peaks} bytes at n = 300 and 1200 (flat)")
    py4 = load_py(4)
    p4 = []
    for n in (2000, 8000):
        inp = d_list(n)
        tracemalloc.start(); tracemalloc.reset_peak()
        base = tracemalloc.get_traced_memory()[0]
        py4(inp)
        p4.append(tracemalloc.get_traced_memory()[1] - base)
        tracemalloc.stop()
    if not (3.5 <= p4[1] / p4[0] <= 4.5) or p4[1] < 8 * 7999:
        fail(f"drill4: stated O(n) auxiliary space but tracemalloc peaked at {p4} bytes (n=2000, 8000)")
    for r in D[3]["rows"]:
        if r["peak"] != r["n"] - 1:
            fail(f"drill4: largest slice at n={r['n']} was {r['peak']}, expected n - 1")
    print(f"space: drill 4 allocates {p4} bytes at n = 2000, 8000 (x{p4[1] / p4[0]:.2f}) and its largest slice is n - 1")
    # drill 5: nesting depth of the real function, read from the interpreter's own call profile
    py5 = load_py(5)
    for r in D[4]["rows"]:
        depth = {"cur": 0, "max": 0}

        def prof(frame, event, arg):
            if frame.f_code.co_name == "go":
                if event == "call":
                    depth["cur"] += 1; depth["max"] = max(depth["max"], depth["cur"])
                elif event == "return":
                    depth["cur"] -= 1
        sys.setprofile(prof)
        py5(d_list(r["n"]))
        sys.setprofile(None)
        want = int(math.log2(r["n"])) + 1
        if not (depth["max"] == want == r["peak"]):
            fail(f"drill5 n={r['n']}: real depth {depth['max']}, PURE {r['peak']}, expected log2 n + 1 = {want}")
        if r["steps"] != 2 * r["n"] - 1:
            fail(f"drill5 n={r['n']}: {r['steps']} calls, expected 2n - 1")
    print("space: drill 5 real call depth is log2 n + 1 at every n")

    # 5. quiz snippets, re-counted independently in Python
    def q1(n):
        c = [0]

        def f(m):
            c[0] += 1
            return 1 if m <= 1 else f(m - 1) + f(m - 1)
        f(n)
        return c[0]

    def q2(n):
        work = rounds = 0
        size = n
        while size >= 1:
            rounds += 1
            work += size
            size //= 2
        return work, rounds

    def q3(nums, target):
        copied = 0

        def has(a):
            nonlocal copied
            if not a:
                return False
            mid = len(a) // 2
            if a[mid] == target:
                return True
            nxt = a[mid + 1:] if a[mid] < target else a[:mid]
            copied += len(nxt)
            return has(nxt)
        has(nums)
        return copied
    want = {"q1_calls": q1(12), "q1_next": q1(13), "q2_work": q2(64)[0], "q2_rounds": q2(64)[1],
            "q2_nlogn": 64 * q2(64)[1], "q3_copied": q3(sorted(d_list(64)), 1000)}
    for key, v in want.items():
        if F[key] != v:
            fail(f"FACTS.{key} = {F[key]}, independent Python copy gives {v}")
    if not (q1(13) == 2 * q1(12) + 1 and want["q3_copied"] < 64 and want["q2_work"] < 2 * 64):
        fail("a quiz explanation's claim (doubling, copies under n, work under 2n) does not hold")
    print("quiz: FACTS match the independent copies and the explanations' claims hold")

    # 6. the choices: the right one is present, never the longest, and not always in the same place
    pos = []
    for d in D:
        ch = d["choices"]
        if ch.count(d["expect"]) != 1 or len(set(ch)) != len(ch):
            fail(f"drill{d['id']}: choices must hold the expected answer exactly once and no repeats")
            continue
        if len(d["expect"]) > max(len(c) for c in ch if c != d["expect"]):
            fail(f"drill{d['id']}: the right choice is the longest")
        pos.append(ch.index(d["expect"]))
    if len(set(pos)) < 3:
        fail(f"right choices sit in only {len(set(pos))} positions: {pos}")

    # 7. lesson.md references each drill's code, and nothing stale remains
    md = open(os.path.join(HERE, "lesson.md")).read()
    for k in range(1, 7):
        if f"```code drill{k} " not in md:
            fail(f"lesson.md does not show code/drill{k}")
    left = sorted(f for f in os.listdir(CODE) if not re.match(r"drill[1-6]\.(py|ts)$", f))
    if left:
        fail(f"unreferenced code files: {left}")

    # 8. the built page
    if not os.path.exists(HTML):
        fail("built page missing; run build.py big-o/complexity-drills first")
    else:
        html = open(HTML, encoding="utf-8").read()
        if pure_block() not in html:
            fail("the built page does not embed the exact PURE block from lesson.js")
        else:
            print("built page embeds the PURE block")
        static = re.sub(r"<(script|style)\b.*?</\1>", "", html, flags=re.S)
        for d in D:
            for phrase in (d["expect"], "baseline", "Counted " + d["unit"]):
                if phrase in static:
                    fail(f"drill{d['id']}: '{phrase}' is in the page's static DOM before the learner answers")

    if problems:
        print(f"\n{len(problems)} FAILURE(S)")
        sys.exit(1)
    print("\nAll complexity drills checks PASSED.")


if __name__ == "__main__":
    main()
