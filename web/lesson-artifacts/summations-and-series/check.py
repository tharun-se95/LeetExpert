"""Executes the triangular sum code in Python and TypeScript and recomputes all facts.

Validates:
  * code/solution.* matches the independent closed-form model across 400+ random and edge cases in both runtimes.
  * code/mistake.* fails on odd positive integers in both runtimes.
  * lesson.js PURE block matches Python's independent derivation of all FACTS.
  * built HTML embeds the exact PURE block.
"""
import json, math, os, random, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
CODE = os.path.join(HERE, "code")
WEB = os.path.normpath(os.path.join(HERE, "..", ".."))
ESBUILD = os.path.join(WEB, "node_modules", ".bin", "esbuild")


def cases(n=400, seed=20261018):
    rnd = random.Random(seed)
    edges = [
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
        15, 16, 17, 31, 32, 33, 63, 64, 65,
        94906265, 99, 100, 101, 127, 128, 129, 255, 256, 500, 511, 512,
        999, 1000, 1001, 1024, 2048, 10000, 65536, 100000, 1000000
    ]
    out = list(edges)
    for _ in range(n):
        out.append(rnd.randint(0, 1000000))
    return out


def model_triangle(n):
    """Independent accumulation model of 1 + 2 + ... + n (a loop, not the closed form under test)."""
    return sum(range(1, n + 1))


def run_py(name, fn, all_cases):
    ns = {}
    with open(os.path.join(CODE, name), encoding="utf-8") as f:
        exec(f.read(), ns)
    res = []
    for c in all_cases:
        res.append(ns[fn](c))
    return res


DRIVER = r"""
const CASES = JSON.parse(require('fs').readFileSync(0, 'utf8'));
const f = triangle;
const out = CASES.map(n => f(n));
process.stdout.write(JSON.stringify(out));
"""


def run_ts(files, fn, all_cases):
    src = "\n".join(open(os.path.join(CODE, f), encoding="utf-8").read() for f in files)
    js = subprocess.run([ESBUILD, "--loader=ts", "--format=cjs"], input=src, capture_output=True, text=True, check=True).stdout
    res = subprocess.run(["node", "-e", js + DRIVER], input=json.dumps(all_cases), capture_output=True, text=True)
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
  FACTS: FACTS
}));
"""
    res = subprocess.run(["node", "-e", probe], capture_output=True, text=True)
    if res.returncode:
        raise SystemExit("lesson.js PURE block failed in node:\n" + res.stderr)
    return json.loads(res.stdout)


def node_eval(expr):
    """Runs one JavaScript expression in node and returns its JSON value (the JS result, not a model of it)."""
    res = subprocess.run(["node", "-p", "JSON.stringify(" + expr + ")"], capture_output=True, text=True)
    if res.returncode:
        raise SystemExit("node failed on " + expr + ":\n" + res.stderr)
    return json.loads(res.stdout)


def appended_copies(n):
    """Elements copied while appending n items to an array that starts at capacity 1 and doubles when full."""
    cap, size, copies = 1, 0, 0
    for _ in range(n):
        if size == cap:
            copies += size
            cap *= 2
        size += 1
    return copies


def max_exact_n():
    """Largest n with n * (n + 1) below 2**53, so the product is an exact JS number."""
    n = math.isqrt(2**53)
    while n * (n + 1) >= 2**53:
        n -= 1
    return n


def prose_claims():
    """(exact phrase in lesson.md, built from a value recomputed here) pairs: edit the prose number or the
    maths alone and the phrase is missing, so the check fails."""
    claims = []
    tri5 = sum(range(1, 6))
    claims.append((f"{' + '.join(map(str, range(1, 6)))} = {tri5} blocks doubled into a 5 \u00d7 6 rectangle of {5 * 6} blocks", "hero aria-label"))
    for k in (1, 2, 3):
        terms = [2**i for i in range(k + 1)]
        claims.append((f"{' + '.join(map(str, terms))} = {sum(terms)} (one less than {2 ** (k + 1)})", f"doubling to 2^{k}"))
    # the odd-n mistake, run in the runtime each snippet is written in
    py_mistake, py_true = (3 // 2) * (3 + 1), 3 * (3 + 1) // 2
    js_mistake = node_eval("Math.floor(3 / 2) * (3 + 1)")
    if js_mistake != py_mistake:
        raise SystemExit("the odd-n mistake differs between python and node")
    claims += [
        (f"for n = 3, `3 // 2 * 4 = {3 // 2} * 4 = {py_mistake}`, losing {py_true - py_mistake} full units", "n = 3 truncation"),
        (f"returning {py_mistake} instead of {py_true} for n = 3", "warn: 4 instead of 6"),
    ]
    # array copies at n = 17
    claims.append((f"For n = 17 the copies total {appended_copies(17)}, which is more than n but still under 2n = {2 * 17}", "copies at n = 17"))
    if not (appended_copies(17) > 17 and appended_copies(17) < 34):
        raise SystemExit("n = 17 copies claim broke")
    nmax = max_exact_n()
    if node_eval(f"BigInt({nmax} * ({nmax} + 1)) === {nmax}n * {nmax + 1}n") is not True or nmax * (nmax + 1) >= 2**53:
        raise SystemExit("n(n+1) is not exact in node at the claimed bound")
    claims.append((f"stays exact while it is below 2\u2075\u00b3, which holds up to n = {nmax:,}", "TS exactness bound"))
    return claims


def check_prose(problems):
    md = open(os.path.join(HERE, "lesson.md"), encoding="utf-8").read()
    claims = prose_claims()
    for phrase, what in claims:
        if phrase not in md:
            problems.append(f"lesson.md is missing the recomputed phrase for {what}: {phrase!r}")
    print(f"prose        {len(claims)} phrases tied to recomputed values")

    # Symbolic statements, by brute force over every n the check can afford
    for n in range(1, 400):
        if sum(1 for i in range(n) for j in range(i)) != n * (n - 1) // 2:
            problems.append(f"dependent loop count at n={n} is not n(n-1)/2")
            break
        if 2 * sum(range(1, n + 1)) != n * (n + 1):
            problems.append(f"staircase doubled is not n x (n+1) at n={n}")
            break
    for k in range(0, 40):
        if sum(2**i for i in range(k + 1)) != 2 ** (k + 1) - 1 or sum(2**i for i in range(k)) != 2**k - 1:
            problems.append(f"doubling sums fail at k={k}")
            break
        if sum(1 << d for d in range(k + 1)) != 2 ** (k + 1) - 1:
            problems.append(f"perfect tree node count fails at height {k}")
            break
    for n in range(1, 6000):
        total, cur = 0, n
        while cur >= 1:
            total += cur
            cur //= 2
        if not (total < 2 * n and n > total / 2):
            problems.append(f"halving series at n={n}: total {total} not under 2n with the first pass more than half")
            break
        c = appended_copies(n)
        sizes_ok = c == (0 if n < 2 else 2 * (1 << (n - 1).bit_length() - 1) - 1)
        if not (c < 2 * n and c + n < 3 * n and sizes_ok):
            problems.append(f"append copies at n={n}: {c} (expected 2^(j+1)-1 for the largest power 2^j below n, under 2n, under 3n with the writes)")
            break


def check_exactness(problems):
    nmax = max_exact_n()
    want = [nmax * (nmax + 1) // 2]
    got_py = run_py("solution.py", "triangle", [nmax])
    got_ts = run_ts(["solution.ts"], "triangle", [nmax])
    print(f"exactness    n={nmax:,}: python {got_py == want}, typescript {got_ts == want}")
    if got_py != want or got_ts != want:
        problems.append(f"solution is not exact at the bound n={nmax}: py {got_py} ts {got_ts} want {want}")
    # the mistake is right on even n and wrong on every odd n (so the warn's 'odd integers' is exact)
    sample = list(range(1, 200))
    for label, got in [("mistake.py", run_py("mistake.py", "triangle", sample)),
                       ("mistake.ts", run_ts(["mistake.ts"], "triangle", sample))]:
        for n, g in zip(sample, got):
            if (g == model_triangle(n)) != (n % 2 == 0):
                problems.append(f"{label}: wrong/right pattern is not 'right exactly on even n' at n={n}")
                break


def main():
    problems = []
    all_cases = cases()
    want = [model_triangle(c) for c in all_cases]

    # 1. Solution in Python and TypeScript matches model
    for label, got in [("solution.py", run_py("solution.py", "triangle", all_cases)),
                       ("solution.ts", run_ts(["solution.ts"], "triangle", all_cases))]:
        bad = [(c, w, g) for c, w, g in zip(all_cases, want, got) if w != g]
        print(f"{label:12} {len(all_cases) - len(bad)}/{len(all_cases)} match model")
        if bad:
            problems.append(f"{label} failed on {len(bad)} cases: first {bad[:3]}")

    # 2. Mistake fails on odd positive integers in both runtimes
    odd_cases = [c for c in all_cases if c > 0 and c % 2 == 1]
    want_odd = [model_triangle(c) for c in odd_cases]
    for label, got in [("mistake.py", run_py("mistake.py", "triangle", odd_cases)),
                       ("mistake.ts", run_ts(["mistake.ts"], "triangle", odd_cases))]:
        wrong = sum(1 for w, g in zip(want_odd, got) if w != g)
        print(f"{label:12} fails on {wrong}/{len(odd_cases)} odd cases (expected)")
        if wrong == 0:
            problems.append(f"{label} unexpectedly passed all odd cases!")

    # 3. PURE block validation
    pure_data = run_pure()
    facts = pure_data["FACTS"]

    # Recompute FACTS independently in Python
    def py_triangle(n):
        return sum(range(1, n + 1))

    def py_doubling(k):
        return sum(2**i for i in range(k + 1))

    def py_halving(n):
        s = 0
        while n >= 1:
            s += n
            n //= 2
        return s

    def py_loop(n):
        return sum(1 for i in range(n) for j in range(i))

    def py_copies(n):
        cap, size, copies = 1, 0, 0
        for _ in range(1, n + 1):
            if size == cap:
                copies += size
                cap *= 2
            size += 1
        return copies

    want_facts = {
        "tri5": py_triangle(5),
        "rect5": 5 * 6,
        "twin5": 5 * 6 - py_triangle(5),
        "tri10": py_triangle(10),
        "doubling4": py_doubling(4),
        "halving32": py_halving(32),
        "loop10": py_loop(10),
        "copies16": py_copies(16),
        "copies17": py_copies(17),
    }

    for k, v in want_facts.items():
        if facts.get(k) != v:
            problems.append(f"FACTS.{k} {facts.get(k)!r} != {v!r}")
    if set(facts) != set(want_facts):
        problems.append(f"FACTS keys {sorted(facts)} != checked keys {sorted(want_facts)}")

    # 3b. Every number in the body prose, tied to its text
    check_prose(problems)
    check_exactness(problems)

    # 4. Built HTML check (if dist file exists)
    dist = os.path.join(WEB, "lesson-artifacts", "dist", "math-for-dsa", "summations-and-series.html")
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
        sys.exit(0)


if __name__ == "__main__":
    main()
