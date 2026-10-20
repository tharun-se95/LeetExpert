"""Executes the modular arithmetic code in Python and TypeScript and recomputes all facts.

Validates:
  * code/solution.* matches the floored modulo model across 400+ random and edge cases in both runtimes.
  * code/mistake.* fails on negative non-multiples in both runtimes.
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
        (0, 5), (1, 5), (4, 5), (5, 5), (6, 5), (8, 5), (10, 5),
        (-1, 5), (-4, 5), (-5, 5), (-6, 5), (-7, 5), (-8, 5), (-13, 5),
        (15, 7), (22, 7), (40, 7), (-8, 7), (0, 7), (-7, 7), (7, 7),
        (0, 1), (1, 1), (-1, 1), (100, 1), (-100, 1),
        (1000000007, 1000), (-1000000007, 1000),
        (9007199254740991, 100), (-9007199254740991, 100),
    ]
    out = list(edges)
    for _ in range(n):
        a = rnd.randint(-1000000, 1000000)
        m = rnd.randint(1, 1000)
        out.append((a, m))
    return out


def model_wrap(a, m):
    """Mathematical floored remainder in [0, m) for m > 0."""
    return a % m


def run_py(name, fn, all_cases):
    ns = {}
    with open(os.path.join(CODE, name), encoding="utf-8") as f:
        exec(f.read(), ns)
    res = []
    for a, m in all_cases:
        res.append(ns[fn](a, m))
    return res


DRIVER = r"""
const CASES = JSON.parse(require('fs').readFileSync(0, 'utf8'));
const f = wrap;
const out = CASES.map(([a, m]) => f(a, m));
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
    kit_rings = open(os.path.join(WEB, "lesson-artifacts", "kit", "rings.js"), encoding="utf-8").read()
    probe = kit_rings + "\n" + pure_block() + r"""
process.stdout.write(JSON.stringify({
  FACTS: FACTS,
  CLOCK_STEPS: rgClockSteps().length,
  TRAP_STEPS: rgTrapSteps().length,
  WRAP_STEPS: rgWrapSteps().length,
  HASH_STEPS: rgHashSteps().length
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


def minus(v):
    """How lesson.md writes a number in prose: U+2212 for a negative sign."""
    return str(v).replace("-", "\u2212")


SUP = str.maketrans("0123456789", "\u2070\u00b9\u00b2\u00b3\u2074\u2075\u2076\u2077\u2078\u2079")


def prose_claims():
    """(exact phrase in lesson.md, built from a value recomputed here) pairs.

    Each phrase is formatted from a number computed in the runtime it describes (python3 for Python
    claims, node for JavaScript ones), then looked up in lesson.md. Editing the prose number without
    the maths, or the maths without the prose, makes the phrase vanish and the check fails.
    """
    claims = []
    q8, r8 = divmod(8, 5)
    qn, rn = divmod(-7, 5)  # Python floors: -7 = -2 * 5 + 3
    js_n7 = node_eval("-7 % 5")
    js_n1 = node_eval("-1 % 5")
    fix = node_eval("((-7 % 5) + 5) % 5")
    claims += [
        (f"{q8} full turn of 5 plus {r8} slots forward, landing squarely on slot {r8}", "8 on a 5-clock"),
        (f"it also lands on slot {rn} after {-qn} full backward turns", "-7 on a 5-clock"),
        (f"must land on the preceding slot, {(-1) % 5}. Step back once more and you land on {(-2) % 5}", "backward steps"),
        (f"reports that \u22127 % 5 equals **{minus(js_n7)}**", "JS -7 % 5"),
        (f"\u22127 % 5 yields {minus(js_n7)}, producing", "JS -7 % 5 in the warn"),
        (f"(such as {minus(js_n7)}), adding 5 lifts it to +{fix}", "fix lifts -2 to 3"),
        (f"(such as {rn}), adding 5 yields {rn + 5}, and the outer `% 5` restores {(rn + 5) % 5}", "fix leaves 3 at 3"),
        (f"(4 + 1) % 5 evaluates to {(4 + 1) % 5}", "wrap forward"),
        (f"(0 \u2212 1) % 5 is {(0 - 1) % 5}", "Python wrap backward"),
        (f"(0 \u2212 1) % 5 evaluates to {minus(node_eval('(0 - 1) % 5'))}", "JS wrap backward"),
        (f"keys 15 and 22 modulo 7 both yielding bucket {15 % 7}", "collision"),
    ]
    if 22 % 7 != 15 % 7 or (8 - -7) % 5:
        raise SystemExit("collision / congruence premise broken")
    if node_eval("typeof [1, 2, 3][-1]") != "undefined":
        raise SystemExit("buffer[-1] is no longer undefined in JS")
    claims.append(("`buffer[-1]` returns `undefined`", "buffer[-1]"))
    # precision claims, executed in node
    e = node_eval("Math.log2(Number.MAX_SAFE_INTEGER + 1)")
    if node_eval("Number.MAX_SAFE_INTEGER === 2 ** 53 - 1") is not True or node_eval("2 ** 53 + 1 === 2 ** 53") is not True or e != 53:
        raise SystemExit("2^53 precision claim fails in node")
    sup = str(e).translate(SUP)
    claims.append((f"(2{sup} \u2212 1) not every integer exists: 2{sup} + 1 evaluates to 2{sup}", "2^53 + 1 === 2^53"))
    m = 10**9 + 7
    exact = (m - 1) ** 2  # Python int
    if node_eval(f"BigInt({m - 1}) ** 2n === {exact}n") is not True or node_eval(f"BigInt(({m - 1}) * ({m - 1})) !== {exact}n") is not True or exact <= 2**53:
        raise SystemExit("(10^9+6)^2 is expected to exceed 2^53 and be inexact as a JS Number")
    claims.append((f"For m = 10\u2079 + 7 the product of two residues passes 2{sup}", "(m-1)^2 > 2^53"))
    # quiz explanation arithmetic
    claims += [
        (f"-13 + 15 = {-13 + 15}", "quiz -13 + 15"),
        (f"Python: -13 % 5 == {-13 % 5}. JS: -13 % 5 == {node_eval('-13 % 5')}", "quiz -13 % 5 in both runtimes"),
        (f"-1 % n = {node_eval('-1 % 7')}", "quiz -1 % n in JS (n = 7)"),
    ]
    return claims


def check_prose(problems):
    md = open(os.path.join(HERE, "lesson.md"), encoding="utf-8").read()
    claims = prose_claims()
    for phrase, what in claims:
        if phrase not in md:
            problems.append(f"lesson.md is missing the recomputed phrase for {what}: {phrase!r}")
    print(f"prose        {len(claims)} phrases tied to recomputed values")
    # Python's % lands in [0, m) for every m > 0, as the Python bullet says
    if not all(0 <= a % m < m for a, m in cases()):
        problems.append("Python a % m left [0, m) for some m > 0")


def main():
    problems = []
    all_cases = cases()
    want = [model_wrap(a, m) for a, m in all_cases]

    # 1. Solution in Python and TypeScript matches model
    for label, got in [("solution.py", run_py("solution.py", "wrap", all_cases)),
                       ("solution.ts", run_ts(["solution.ts"], "wrap", all_cases))]:
        bad = [(c, w, g) for c, w, g in zip(all_cases, want, got) if w != g]
        print(f"{label:12} {len(all_cases) - len(bad)}/{len(all_cases)} match model")
        if bad:
            problems.append(f"{label} failed on {len(bad)} cases: first {bad[:3]}")

    # 2. Mistake fails on negative non-multiples in both runtimes
    neg_cases = [(a, m) for a, m in all_cases if a < 0 and a % m != 0]
    want_neg = [model_wrap(a, m) for a, m in neg_cases]
    for label, got in [("mistake.py", run_py("mistake.py", "wrap", neg_cases)),
                       ("mistake.ts", run_ts(["mistake.ts"], "wrap", neg_cases))]:
        wrong = sum(1 for w, g in zip(want_neg, got) if w != g)
        print(f"{label:12} fails on {wrong}/{len(neg_cases)} negative cases (expected)")
        if wrong == 0:
            problems.append(f"{label} unexpectedly passed all negative cases!")
        # Also confirm all got values for negative cases are actually negative
        non_neg = [g for g in got if g >= 0]
        if non_neg:
            problems.append(f"{label} returned non-negative remainder on negative cases: {non_neg[:3]}")

    # 3. PURE block validation
    pure_data = run_pure()
    facts = pure_data["FACTS"]

    # Independent derivation of facts in Python
    def sim(a, m):
        cell, turns, d = 0, 0, -1 if a < 0 else 1
        for _ in range(abs(a)):
            cell += d
            if cell == m:
                cell = 0
                turns += 1
            elif cell < 0:
                cell = m - 1
                turns -= 1
        return cell, turns

    c8, t8 = sim(8, 5)
    cn7, tn7 = sim(-7, 5)
    want_facts = {
        "slot8_5": c8,
        "turns8_5": t8,
        "slotNeg7_5": cn7,
        "turnsNeg7_5": tn7,
        "pyNeg7_5": -7 % 5,
        "jsNeg7_5": int(math.fmod(-7, 5)),
        "pyWrapPrev": -1 % 5,
        "jsBarePrev": int(math.fmod(-1, 5)),
        "fixedPrev": ((-1 % 5) + 5) % 5,
        "hashCollisionKey1": 15,
        "hashCollisionKey2": 22,
        "hashBucket": 15 % 7,
        "hashNegKey": -8,
        "hashNegBucket": -8 % 7,
        "hashNegJs": int(math.fmod(-8, 7)),
        "safeInt": 2**53 - 1,
        "quizAns3": -13 % 5,
    }

    for k, v in want_facts.items():
        if facts.get(k) != v:
            problems.append(f"FACTS.{k} {facts.get(k)!r} != {v!r}")
    if set(facts) != set(want_facts):
        problems.append(f"FACTS keys {sorted(facts)} != checked keys {sorted(want_facts)}")

    # Verify scenario step counts are positive and non-empty
    for scenario in ["CLOCK_STEPS", "TRAP_STEPS", "WRAP_STEPS", "HASH_STEPS"]:
        if pure_data.get(scenario, 0) < 3:
            problems.append(f"{scenario} has fewer than 3 steps: {pure_data.get(scenario)}")

    # 3b. Every number in the body prose, tied to its text
    check_prose(problems)

    # 4. Built HTML check (if dist file exists)
    dist = os.path.join(WEB, "lesson-artifacts", "dist", "math-for-dsa", "modular-arithmetic.html")
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
