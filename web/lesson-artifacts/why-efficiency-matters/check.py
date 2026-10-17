"""Executes the gift-card matching code in Python and TypeScript and recomputes all facts.

Validates:
  * code/solution.* matches an independent model across 400+ random and edge cases.
  * code/mistake.* fails on cases where a single element equals target / 2 in both runtimes.
  * lesson.js PURE block matches Python's independent derivation of all FACTS.
  * built HTML embeds the exact PURE block.
"""
import json, os, random, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
CODE = os.path.join(HERE, "code")
WEB = os.path.normpath(os.path.join(HERE, "..", ".."))
ESBUILD = os.path.join(WEB, "node_modules", ".bin", "esbuild")

DEMO_INPUT = [15, 73, 25, 40, 5, 60]
DEMO_TARGET = 100


def cases(n=400, seed=20261014):
    rnd = random.Random(seed)
    out = [
        ([], 100),
        ([50], 100),  # mistake trigger: 2x == target
        ([50, 50], 100),  # genuine pair of 50s
        ([40, 60], 100),
        ([40, 15, 73, 60, 25], 100),
        ([10, 20, 30, 40], 100),  # no pair
        ([25, 40], 50),  # mistake trigger: 25 alone
        ([-20, 120], 100),  # negative numbers
        ([0, 100], 100),
        ([0], 0),  # 2*0 == 0
        ([0, 0], 0),
    ]
    for _ in range(n):
        size = rnd.randint(0, 25)
        target = rnd.randint(0, 200)
        arr = [rnd.randint(0, 100) for _ in range(size)]
        # Occasionally inject a valid pair
        if size >= 2 and rnd.random() < 0.5:
            i, j = rnd.sample(range(size), 2)
            arr[j] = target - arr[i]
        out.append((arr, target))
    return out


def model_has_pair(nums, target):
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return True
    return False


def run_py(name, fn, all_cases):
    ns = {}
    with open(os.path.join(CODE, name), encoding="utf-8") as f:
        exec(f.read(), ns)
    res = []
    for arr, target in all_cases:
        res.append(bool(ns[fn](list(arr), target)))
    return res


DRIVER = r"""
const CASES = JSON.parse(require('fs').readFileSync(0, 'utf8'));
const f = process.env.FN === 'mistake' ? hasPairMistake : hasPair;
const out = CASES.map(([arr, target]) => {
  return Boolean(f(arr.slice(), target));
});
process.stdout.write(JSON.stringify(out));
"""


def run_ts(files, fn, all_cases):
    src = "\n".join(open(os.path.join(CODE, f), encoding="utf-8").read() for f in files)
    js = subprocess.run([ESBUILD, "--loader=ts", "--format=cjs"], input=src, capture_output=True, text=True, check=True).stdout
    res = subprocess.run(["node", "-e", js + DRIVER], input=json.dumps(all_cases), capture_output=True, text=True,
                         env={**os.environ, "FN": fn})
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
  GROWTH_PTS: GROWTH_PTS,
  DEMO_STEPS_A: DEMO_STEPS_A,
  DEMO_STEPS_B: DEMO_STEPS_B
}));
"""
    res = subprocess.run(["node", "-e", probe], capture_output=True, text=True)
    if res.returncode:
        raise SystemExit("lesson.js PURE block failed in node:\n" + res.stderr)
    return json.loads(res.stdout)


def main():
    problems = []
    all_cases = cases()
    want = [model_has_pair(arr, target) for arr, target in all_cases]

    # 1. Solution in Python and TypeScript matches model
    for label, got in [("solution.py", run_py("solution.py", "has_pair", all_cases)),
                       ("solution.ts", run_ts(["solution.ts"], "hasPair", all_cases))]:
        bad = [(c, w, g) for c, w, g in zip(all_cases, want, got) if w != g]
        print(f"{label:12} {len(all_cases) - len(bad)}/{len(all_cases)} match model")
        if bad:
            problems.append(f"{label} failed on {len(bad)} cases: first {bad[:3]}")

    # 2. Mistake fails in both runtimes on single target/2 cases
    for label, got in [("mistake.py", run_py("mistake.py", "has_pair_mistake", all_cases)),
                       ("mistake.ts", run_ts(["mistake.ts"], "mistake", all_cases))]:
        wrong = sum(1 for w, g in zip(want, got) if w != g)
        print(f"{label:12} fails on {wrong}/{len(all_cases)} cases (expected)")
        if wrong == 0:
            problems.append(f"{label} unexpectedly passed all cases!")

    # 3. PURE block validation
    pure_data = run_pure()
    facts = pure_data["FACTS"]

    # Recompute FACTS in Python
    def count_ops_a(n):
        return n * (n - 1) // 2

    def count_ops_b(n):
        return n

    def crossover_n(s):
        return 2 * s + 1

    # Independent replay of the demo: Version A's pair checks until the first
    # match, Version B's lookups until the first complement is already seen.
    def trace_a(nums, t):
        k = 0
        for i in range(len(nums)):
            for j in range(i + 1, len(nums)):
                k += 1
                if nums[i] + nums[j] == t:
                    return k
        return k

    def trace_b(nums, t):
        seen = set()
        for k, x in enumerate(nums, 1):
            if t - x in seen:
                return k
            seen.add(x)
        return len(nums)

    if not model_has_pair(DEMO_INPUT, DEMO_TARGET):
        problems.append("demo input has no pair")
    fmt = lambda v: f"{round(v):,}"
    a1k, a100k = count_ops_a(1000), count_ops_a(100000)
    # The derivation's typed arithmetic: n* = 21 at 10x, A at 1,000 = 49,950 units, B 50x sooner.
    if crossover_n(10) != 21 or a1k / 10 != 49950 or round((a1k / 10) / 1000) != 50:
        problems.append("derivation arithmetic (21, 49,950, 50x) no longer holds")
    want_facts = {
        "aOps1k": fmt(a1k), "bOps1k": fmt(1000),
        "aOps100k": fmt(a100k), "bOps100k": fmt(100000),
        "aGrowth100x": fmt(a100k / a1k), "bGrowth100x": fmt(100),
    }
    for k, v in want_facts.items():
        if facts.get(k) != v:
            problems.append(f"FACTS.{k} {facts.get(k)!r} != {v!r}")
    if set(facts) != set(want_facts):
        problems.append(f"FACTS keys {sorted(facts)} != checked keys {sorted(want_facts)}")
    if len(pure_data["DEMO_STEPS_A"]) != trace_a(DEMO_INPUT, DEMO_TARGET) or len(pure_data["DEMO_STEPS_B"]) != trace_b(DEMO_INPUT, DEMO_TARGET):
        problems.append("demo step traces disagree with the independent replay")

    # The crossover formula n* = 2S + 1 is checked by scanning, not by re-deriving it:
    # the assistant (A on an S-times machine) wins below n*, ties at it, loses past it.
    for S in range(1, 51):
        tie = [n for n in range(2, 400) if count_ops_a(n) == S * n]
        a_wins = all(count_ops_a(n) < S * n for n in range(2, 2 * S + 1))
        b_wins = all(count_ops_a(n) > S * n for n in range(2 * S + 2, 400))
        if tie != [crossover_n(S)] or not a_wins or not b_wins:
            problems.append(f"crossover for S={S} is not 2S+1 by scan (ties at {tie})")
            break

    # 4. Built HTML check (if dist file exists)
    dist = os.path.join(WEB, "lesson-artifacts", "dist", "big-o", "why-efficiency-matters.html")
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
