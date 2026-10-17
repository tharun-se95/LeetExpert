"""Executes the halving code in Python and TypeScript and recomputes all facts.

Validates:
  * code/solution.* matches the independent halving model across 400+ random and edge cases in both runtimes.
  * code/mistake.* fails on non-powers of two in both runtimes.
  * lesson.js PURE block matches Python's independent derivation of all FACTS and rules.
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
        100, 127, 128, 129, 255, 256, 500, 511, 512,
        1000, 1024, 2048, 10000, 65536, 100000, 1000000
    ]
    out = list(edges)
    for _ in range(n):
        out.append(rnd.randint(1, 1000000))
    return out


def model_halvings(n):
    """Independent bit-length model of floor(log2(n))."""
    if n <= 1:
        return 0
    return n.bit_length() - 1


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
const f = halvings;
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
  FACTS: FACTS,
  POWERS_TABLE: POWERS_TABLE,
  RULE_CHECKS: RULE_CHECKS
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


SUP = str.maketrans("0123456789", "\u2070\u00b9\u00b2\u00b3\u2074\u2075\u2076\u2077\u2078\u2079")


def sup(n):
    return str(n).translate(SUP)


def prose_claims():
    """(exact phrase in lesson.md, built from a value recomputed here) pairs.

    The phrase is formatted from numbers computed here (integer arithmetic for halvings, python3 and node
    for float claims) and looked up in lesson.md, so editing the prose number without the maths, or the maths
    without the prose, makes the phrase vanish and the check fail.
    """
    h = model_halvings
    claims = []
    # lede and chips
    claims.append((f"reaches a single folder in only {h(10**9)} halvings", "lede: halvings of a billion"))
    up = math.log2(1000)
    if abs(up - 10) > 0.05:
        raise SystemExit("log2(1000) is no longer about 10")
    claims.append((f"adds about {round(up)} halvings", "chip, caption and prose: x1,000 adds about 10", 3))
    steps = [16]
    while steps[-1] > 1:
        steps.append(steps[-1] // 2)
    claims.append((f"{steps[0]} folders cut to {', '.join(map(str, steps[1:-1]))}, and {steps[-1]}", "hero aria-label"))
    # 2^10 ~ 10^3
    if abs(2**10 / 1000 - 1) > 0.03:
        raise SystemExit("2^10 is no longer within 3% of 10^3")
    claims.append((f"2{sup(10)} = {2**10:,} \u2248 1,000 = 10{sup(3)}", "2^10 ~ 10^3"))
    # the table
    labels = {10**3: "1,000 (10\u00b3)", 10**6: "1,000,000 (10\u2076)", 10**9: "1,000,000,000 (10\u2079)",
              10**12: "10\u00b9\u00b2 (one trillion)", 10**18: "10\u00b9\u2078 (one quintillion)"}
    for n, label in labels.items():
        claims.append((f"{label} | {h(n)} halvings (log\u2082 n = {math.log2(n):.2f})", f"table row {n}"))
        if f"{node_eval(f'Math.log2({n})'):.2f}" != f"{math.log2(n):.2f}":
            raise SystemExit("JS Math.log2 disagrees at 2 d.p. for " + str(n))
    claims.append((f"needs at most {h(10**12) + 1} probes ({h(10**12)} halvings, then a look at the last folder)", "trillion probes"))
    # rules, with integer log2
    lg = lambda x: x.bit_length() - 1
    claims += [
        (f"log\u2082(8 \u00b7 4) = log\u2082 {8 * 4} = {lg(32)}, which equals log\u2082 8 + log\u2082 4 = {lg(8)} + {lg(4)} = {lg(8) + lg(4)}", "product rule"),
        (f"log\u2082(2{sup(4)}) = 4 \u00b7 log\u2082 2 = 4 \u00b7 {lg(2)} = {4 * lg(2)}", "power rule"),
        (f"4^(log\u2082 8) = 4{sup(lg(8))} = {4 ** lg(8)}, and 8^(log\u2082 4) = 8{sup(lg(4))} = {8 ** lg(4)}", "base swap"),
    ]
    if 4 ** lg(8) != 8 ** lg(4):
        raise SystemExit("base swap sides differ")
    l8, l2 = math.log10(8), math.log10(2)
    if node_eval("[Math.log10(8).toFixed(5), Math.log10(2).toFixed(5)]") != [f"{l8:.5f}", f"{l2:.5f}"] or round(l8 / l2) != 3 or abs(l8 / l2 - 3) > 1e-12:
        raise SystemExit("change-of-base numbers differ between python and node")
    claims.append((f"log\u2082 8 = log\u2081\u2080 8 / log\u2081\u2080 2 = {l8:.5f} / {l2:.5f} = {round(l8 / l2)}", "change of base"))
    # the float-division mistake, run in both runtimes (verified against the code files in main())
    claims += [
        (f"halving 3 produces {3 / 2}, which is still greater than 1", "halving 3 by float division"),
        (f"a non-power of 2 like 3 leaves {3 / 2} > 1", "warn: 3 leaves 1.5"),
    ]
    if node_eval("3 / 2") != 3 / 2:
        raise SystemExit("3 / 2 differs between runtimes")
    # quiz
    zeros = len(str(10**12)) - 1
    claims += [
        (f"About {zeros}, one per decimal zero", "quiz option 1"),
        (f"About {10 * zeros}, ten per decimal zero", "quiz option 2"),
        (f"About {round(math.log2(10**12))}, ten per \u00d71,000 step", "quiz option 3"),
        (f"10{sup(12)} = (10{sup(3)}){sup(4)} \u2248 (2{sup(10)}){sup(4)} = 2{sup(40)}", "quiz derivation"),
        (f"(Exactly: log\u2082 10{sup(12)} = {math.log2(10**12):.2f}.)", "quiz exact value"),
    ]
    if (10**3) ** 4 != 10**12 or abs(2**40 / 10**12 - 1) > 0.1:
        raise SystemExit("quiz derivation arithmetic broke")
    return claims


def check_prose(problems):
    md = open(os.path.join(HERE, "lesson.md"), encoding="utf-8").read()
    claims = prose_claims()
    for phrase, what, *need in claims:
        if md.count(phrase) < (need[0] if need else 1):
            problems.append(f"lesson.md is missing the recomputed phrase for {what}: {phrase!r}")
    print(f"prose        {len(claims)} phrases tied to recomputed values")

    # Variants: binary search needs at most floor(log2 n) + 1 probes (worst case over every target);
    # a complete binary tree with n nodes has height floor(log2 n); halving splits go ceil(log2 n) deep.
    for n in range(1, 400):
        worst = 0
        for target in range(n):
            lo, hi, p = 0, n - 1, 0
            while lo <= hi:
                mid = (lo + hi) // 2
                p += 1
                if mid == target:
                    break
                lo, hi = (mid + 1, hi) if target > mid else (lo, mid - 1)
            worst = max(worst, p)
        if worst != model_halvings(n) + 1:
            problems.append(f"binary search worst case on n={n} is {worst}, not floor(log2 n) + 1")
            break
        depth, node = 0, n
        while node > 1:
            node //= 2
            depth += 1
        if depth != model_halvings(n):
            problems.append(f"complete tree height with {n} nodes is {depth}, not floor(log2 n)")
            break
        split = lambda k: 0 if k <= 1 else 1 + split((k + 1) // 2)
        if split(n) != (n - 1).bit_length():
            problems.append(f"halving splits on n={n} go {split(n)} deep, not ceil(log2 n)")
            break


def main():
    problems = []
    all_cases = cases()
    want = [model_halvings(c) for c in all_cases]

    # 1. Solution in Python and TypeScript matches model
    for label, got in [("solution.py", run_py("solution.py", "halvings", all_cases)),
                       ("solution.ts", run_ts(["solution.ts"], "halvings", all_cases))]:
        bad = [(c, w, g) for c, w, g in zip(all_cases, want, got) if w != g]
        print(f"{label:12} {len(all_cases) - len(bad)}/{len(all_cases)} match model")
        if bad:
            problems.append(f"{label} failed on {len(bad)} cases: first {bad[:3]}")

    # 2. Mistake fails on non-powers of two in both runtimes
    non_powers = [c for c in all_cases if c > 2 and (c & (c - 1)) != 0]
    want_non = [model_halvings(c) for c in non_powers]
    for label, got in [("mistake.py", run_py("mistake.py", "halvings", non_powers)),
                       ("mistake.ts", run_ts(["mistake.ts"], "halvings", non_powers))]:
        wrong = sum(1 for w, g in zip(want_non, got) if w != g)
        print(f"{label:12} fails on {wrong}/{len(non_powers)} non-power cases (expected)")
        if wrong == 0:
            problems.append(f"{label} unexpectedly passed all non-power cases!")

    # 2b. The warn's claim: float halving runs ceil(log2 n) passes where the solution runs floor(log2 n)
    ge1 = [c for c in all_cases if c >= 1]
    for label, got in [("mistake.py", run_py("mistake.py", "halvings", ge1)),
                       ("mistake.ts", run_ts(["mistake.ts"], "halvings", ge1))]:
        if any(g != (c - 1).bit_length() for c, g in zip(ge1, got)):
            problems.append(f"{label} is not ceil(log2 n) on every n >= 1")
        if run_py("solution.py", "halvings", [3]) != [1] or got[ge1.index(3)] != 2:
            problems.append(f"{label}: halving 3 should take 2 passes (solution: 1)")

    # 3. PURE block validation
    pure_data = run_pure()
    facts = pure_data["FACTS"]

    # Recompute FACTS in Python
    probes = lambda n: model_halvings(n) + 1
    want_facts = {
        "halvings8": model_halvings(8), "probes8": probes(8),
        "halvings16": model_halvings(16), "probes16": probes(16),
        "halvings32": model_halvings(32), "probes32": probes(32),
        "halvings1k": model_halvings(10**3), "halvings1m": model_halvings(10**6),
        "halvings1b": model_halvings(10**9), "halvings1t": model_halvings(10**12),
        "halvings1q": model_halvings(10**18), "probes1t": probes(10**12),
        "prodCheck": round(math.log2(8 * 4)),
        "powerCheck": round(math.log2(2**4)),
        "changeOfBaseCheck": round(math.log2(8)),
        "baseSwapCheck": round(4 ** math.log2(8)),
        "quizAns1": round(math.log2(10**12)),
    }

    for k, v in want_facts.items():
        if facts.get(k) != v:
            problems.append(f"FACTS.{k} {facts.get(k)!r} != {v!r}")
    if set(facts) != set(want_facts):
        problems.append(f"FACTS keys {sorted(facts)} != checked keys {sorted(want_facts)}")

    # Verify rule checks LHS == RHS
    rules = pure_data["RULE_CHECKS"]
    for rname in ["product", "power", "changeOfBase", "baseSwap"]:
        lhs = rules[rname]["lhs"]
        rhs = rules[rname]["rhs"]
        if lhs != rhs:
            problems.append(f"rule check {rname} disagrees: lhs {lhs} != rhs {rhs}")

    # 3b. The feel-for-the-numbers table: the page's own rows against exact integer arithmetic
    for row in pure_data["POWERS_TABLE"]:
        n = int(row["n"])
        if row["halvings"] != model_halvings(n) or row["probes"] != model_halvings(n) + 1 or abs(row["exact"] - math.log2(n)) > 1e-9:
            problems.append(f"POWERS_TABLE row {n} disagrees with exact arithmetic: {row}")

    # 3c. Every number in the body prose, tied to its text
    check_prose(problems)

    # 4. Built HTML check (if dist file exists)
    dist = os.path.join(WEB, "lesson-artifacts", "dist", "math-for-dsa", "logarithms-and-exponents.html")
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
