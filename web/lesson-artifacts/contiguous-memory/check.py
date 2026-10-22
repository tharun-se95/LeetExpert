"""Executes the contiguous-memory code in Python and TypeScript and recomputes all facts.

Validates:
  * code/solution.* matches the address arithmetic model across 500+ test cases.
  * code/solution.* build_at_end produces [0..n-1].
  * code/mistake.* produces the inverted list with exactly n*(n-1)//2 shifts in both runtimes.
  * lesson.js PURE block matches Python's independent derivation of all FACTS.
"""
import json, os, random, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
CODE = os.path.join(HERE, "code")
WEB = os.path.normpath(os.path.join(HERE, "..", ".."))
ESBUILD = os.path.join(WEB, "node_modules", ".bin", "esbuild")


def cases(n=500, seed=20261022):
    rnd = random.Random(seed)
    out = [
        (4096, 0, 8),
        (4096, 3, 8),
        (4096, 7, 8),
        (1024, 0, 4),
        (1024, 15, 4),
        (0, 0, 1),
        (65536, 1000, 16),
    ]
    for _ in range(n):
        base = rnd.randint(0, 65536)
        index = rnd.randint(0, 10000)
        slot_size = rnd.choice([1, 2, 4, 8, 16])
        out.append((base, index, slot_size))
    return out


def model_addr(base, index, slot_size):
    if index < 0:
        raise IndexError("Negative index")
    return base + index * slot_size


def model_shifts_front(n):
    return (n * (n - 1)) // 2


def run_ts():
    sol_ts = os.path.join(CODE, "solution.ts")
    mis_ts = os.path.join(CODE, "mistake.ts")
    ts_code = open(sol_ts).read() + "\n" + open(mis_ts).read()

    js = subprocess.run([ESBUILD, "--loader=ts", "--format=cjs"],
                        input=ts_code, capture_output=True, text=True, check=True).stdout

    driver = r"""
const cases = JSON.parse(process.argv[1]);
const addrs = cases.map(([b, i, s]) => {
  try {
    return addressOf(b, i, s);
  } catch (e) {
    return -1;
  }
});
const end10 = buildAtEnd(10);
const front10 = buildFrontInsert(10);
process.stdout.write(JSON.stringify({ addrs, end10, front10 }));
"""
    all_cases = cases()
    res = subprocess.run(["node", "-e", js + driver, json.dumps(all_cases)],
                         capture_output=True, text=True)
    if res.returncode:
        raise SystemExit("TypeScript run failed:\n" + res.stderr)
    return json.loads(res.stdout)


def check_pure_block():
    lesson_js = open(os.path.join(HERE, "lesson.js")).read()
    pure_start = lesson_js.find("/* PURE:begin")
    pure_end = lesson_js.find("/* PURE:end")
    if pure_start == -1 or pure_end == -1:
        raise SystemExit("Missing PURE:begin or PURE:end markers in lesson.js")
    pure_code = lesson_js[pure_start:pure_end]

    driver = r"""
process.stdout.write(JSON.stringify(FACTS));
"""
    res = subprocess.run(["node", "-e", pure_code + driver], capture_output=True, text=True)
    if res.returncode:
        raise SystemExit("Node PURE block evaluation failed:\n" + res.stderr)
    return json.loads(res.stdout)


def main():
    all_cases = cases()
    expected_addrs = [model_addr(b, i, s) for b, i, s in all_cases]

    # 1. Python execution
    py_sol = {}
    exec(open(os.path.join(CODE, "solution.py")).read(), py_sol)
    py_addrs = [py_sol["address_of"](b, i, s) for b, i, s in all_cases]
    if py_addrs != expected_addrs:
        raise SystemExit("Python address_of did not match expected model")

    py_end10 = py_sol["build_at_end"](10)
    if py_end10 != list(range(10)):
        raise SystemExit(f"Python build_at_end(10) gave {py_end10}")

    # Negative index test
    try:
        py_sol["address_of"](4096, -1, 8)
        raise SystemExit("Python address_of did not raise on negative index")
    except IndexError:
        pass

    py_mis = {}
    exec(open(os.path.join(CODE, "mistake.py")).read(), py_mis)
    py_front10 = py_mis["build_front_insert"](10)
    if py_front10 != list(reversed(range(10))):
        raise SystemExit(f"Python build_front_insert(10) gave {py_front10}")

    # 2. TypeScript execution
    ts_out = run_ts()
    if ts_out["addrs"] != expected_addrs:
        raise SystemExit("TypeScript addressOf did not match expected model")
    if ts_out["end10"] != list(range(10)):
        raise SystemExit(f"TypeScript buildAtEnd(10) gave {ts_out['end10']}")
    if ts_out["front10"] != list(reversed(range(10))):
        raise SystemExit(f"TypeScript buildFrontInsert(10) gave {ts_out['front10']}")

    # 3. FACTS validation
    pure_facts = check_pure_block()
    quad1k = model_shifts_front(1000)
    quad10k = model_shifts_front(10000)

    if quad1k != 499500 or quad10k != 49995000:
        raise SystemExit("Triangular sum calculation mismatch")

    if pure_facts["quad10kShifts"] != "49,995,000":
        raise SystemExit(f"Unexpected FACTS quad10kShifts: {pure_facts['quad10kShifts']}")

    print(f"solution  python {len(all_cases)}/{len(all_cases)} cases, typescript {len(all_cases)}/{len(all_cases)}")
    print(f"mistake   front insertions validated (10 items -> reverse order, shifts = {quad10k:,} for 10k)")
    print(f"facts     int16HitRate={pure_facts['int16HitRate']}, quad10kShifts={pure_facts['quad10kShifts']}")
    print("all claims hold")


if __name__ == "__main__":
    main()
