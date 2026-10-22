"""Executes the code shown on the page in Python and TypeScript and recomputes every number the page quotes.

    python3 web/lesson-artifacts/best-time-to-buy-sell-stock/check.py

Validates:
  * code/solution, naive and alt_min_first match two independent models (every pair; a prefix-minimum
    pass written differently) on the lesson's examples, the constraint's extremes (n = 1, n = 10^5,
    prices 0 and 10^4) and random histories, in both runtimes.
  * code/mistake_global_range and mistake_min_zero fail in both runtimes, and the page's claims about
    what they return are the real outputs.
  * lesson.js's PURE block, run in node, agrees with Python on every FACTS value, the table rows, the
    cost counts and the walkthrough numbers.
  * the built page embeds that exact PURE block.
Plant a fault in code/solution.py or code/solution.ts and this fails.
"""
import itertools, json, math, os, random, subprocess, sys, tracemalloc

HERE = os.path.dirname(os.path.abspath(__file__))
CODE = os.path.join(HERE, "code")
WEB = os.path.normpath(os.path.join(HERE, "..", ".."))
ESBUILD = os.path.join(WEB, "node_modules", ".bin", "esbuild")
SLUG = os.path.basename(HERE)

PY_FN = "max_profit"
TS_FN = "maxProfit"
TOP = 10000


def lcg(seed):
    """The page's generator: seed * 1664525 + 1013904223 mod 2^32, scaled to [0, 1)."""
    state = [seed]

    def nxt():
        state[0] = (state[0] * 1664525 + 1013904223) % 2 ** 32
        return state[0] / 4294967296
    return nxt


def history(n, seed, top):
    r = lcg(seed)
    return [math.floor(r() * (top + 1)) for _ in range(n)]


# ---------- independent models ----------
def model_pairs(prices):
    """Every (buy, sell) pair with buy < sell, or 0."""
    best = 0
    for i in range(len(prices)):
        for j in range(i + 1, len(prices)):
            best = max(best, prices[j] - prices[i])
    return best


def model_prefix_min(prices):
    """A different algorithm: the profit of selling on each day against the prefix minimum of the days before it."""
    if len(prices) < 2:
        return 0
    lows = list(itertools.accumulate(prices[:-1], min))
    return max(0, max(p - lo for p, lo in zip(prices[1:], lows)))


def model(prices):
    got = model_pairs(prices) if len(prices) <= 250 else model_prefix_min(prices)
    if len(prices) <= 250 and got != model_prefix_min(prices):
        raise SystemExit(f"the two models disagree on {prices[:20]}")
    return got


def cases():
    rnd = random.Random(20261020)
    out = [[7, 1, 5, 3, 6, 4], [7, 6, 4, 3, 1], [1], [2, 4, 1], [3, 3, 3], [5, 8, 1, 3], [3, 2, 6, 5, 0, 3],
           [0], [TOP], [0, TOP], [TOP, 0], [0, 0], [1, 2], [2, 1], [1, 2, 3, 4, 5], [5, 4, 3, 2, 1]]
    for _ in range(600):
        n = rnd.randint(1, 14)
        out.append([rnd.randint(0, 20) for _ in range(n)])
    for _ in range(100):
        n = rnd.randint(15, 250)
        out.append([rnd.randint(0, TOP) for _ in range(n)])
    # the constraint's extremes, also checked against the two models
    n = 10 ** 5
    out.append([rnd.randint(0, TOP) for _ in range(n)])
    out.append(list(range(TOP + 1)) * 9 + [0] * 5)                 # a long rise, then reset, repeated
    out.append([TOP - (i % (TOP + 1)) for i in range(n)])          # a long fall, then reset, repeated
    out.append([TOP if i % 2 else 0 for i in range(n)])            # saw-tooth between both bounds
    out.append([0] * n)
    out.append(history(n, 7, TOP))                                 # the history the page counts on
    return out


def run_py(name, all_cases):
    ns = {}
    with open(os.path.join(CODE, name + ".py")) as f:
        exec(f.read(), ns)
    return [ns[PY_FN](list(c)) for c in all_cases]


DRIVER = r"""
const CASES = JSON.parse(require('fs').readFileSync(0, 'utf8'));
process.stdout.write(JSON.stringify(CASES.map(c => maxProfit(c))));
"""


def ts_js(name):
    src = open(os.path.join(CODE, name + ".ts")).read()
    return subprocess.run([ESBUILD, "--loader=ts", "--format=cjs"], input=src, capture_output=True, text=True, check=True).stdout


def run_ts(name, all_cases):
    res = subprocess.run(["node", "-e", ts_js(name) + DRIVER], input=json.dumps(all_cases), capture_output=True, text=True)
    if res.returncode:
        raise SystemExit(f"TypeScript run of {name} failed:\n{res.stderr[:600]}")
    return json.loads(res.stdout)


def pure_block():
    js = open(os.path.join(HERE, "lesson.js")).read()
    a = js.index("/* PURE:begin")
    b = js.index("/* PURE:end */") + len("/* PURE:end */")
    return js[a:b]


def run_pure():
    probe = pure_block() + r"""
var fmt = function (n) { return n.toLocaleString('en-US'); };
var out = {facts: btFacts(fmt)};
out.sweeps = {};
[BT_A, BT_B, BT_C, BT_D, BT_E].forEach(function (p) { var s = btSweep(p); out.sweeps[btShow(p)] = {best: s.best, buy: s.buy, sell: s.sell, cmps: s.cmps, steps: s.steps}; });
out.range = {}; out.zero = {}; out.minfirst = {};
[BT_A, BT_B, BT_C, BT_D, BT_E, [1], [3, 3, 3]].forEach(function (p) { out.range[btShow(p)] = btRange(p); out.zero[btShow(p)] = btMinZero(p); out.minfirst[btShow(p)] = btMinFirst(p); });
out.cost = [];
for (var n = 0; n <= 60; n += 6) { var h = btHistory(n, n + 3, BT_TOP); out.cost.push([n, btBrute(h).pairs, n ? btSweep(h).steps.length : 0, h]); }
out.big = btHistory(BT_LIMIT, 7, BT_TOP);
out.diffs = btDiffs(BT_A);
process.stdout.write(JSON.stringify(out));
"""
    res = subprocess.run(["node", "-e", probe], capture_output=True, text=True)
    if res.returncode:
        raise SystemExit("lesson.js PURE block failed in node:\n" + res.stderr)
    return json.loads(res.stdout)


def py_sweep_trace(prices):
    """The sweep, written again in Python with its own counters (the page's numbers must equal these)."""
    low, low_day, best, buy, sell, cmps, steps = prices[0], 0, 0, 0, 0, 0, []
    for d, p in enumerate(prices):
        low_in, low_day_in, gain = low, low_day, p - low
        cmps += 1
        if gain > best:
            best, buy, sell = gain, low_day, d
        cmps += 1
        if p < low:
            low, low_day = p, d
        steps.append({"d": d, "price": p, "low": low_in, "lowDay": low_day_in, "gain": gain, "best": best,
                      "lowAfter": low, "lowDayAfter": low_day})
    return {"best": best, "buy": buy, "sell": sell, "cmps": cmps, "steps": steps}


def main():
    problems = []
    all_cases = cases()
    want = [model(c) for c in all_cases]
    small = [i for i, c in enumerate(all_cases) if len(c) <= 400]          # the quadratic code only gets these

    # 1. solutions against the models, both runtimes
    for name in ("solution", "alt_min_first", "naive"):
        idx = small if name == "naive" else list(range(len(all_cases)))
        sub = [all_cases[i] for i in idx]
        for label, got in ((name + ".py", run_py(name, sub)), (name + ".ts", run_ts(name, sub))):
            bad = [(i, want[i], g) for i, g in zip(idx, got) if want[i] != g]
            print(f"{label:24} {len(idx) - len(bad)}/{len(idx)} match the models")
            if bad:
                problems.append(f"{label} failed on {len(bad)} cases: first {bad[:3]}")

    # 2. mistakes fail in both runtimes
    page = run_pure()
    for name in ("mistake_global_range", "mistake_min_zero"):
        for label, got in ((name + ".py", run_py(name, all_cases)), (name + ".ts", run_ts(name, all_cases))):
            wrong = sum(1 for w, g in zip(want, got) if w != g)
            print(f"{label:24} fails on {wrong}/{len(all_cases)} cases (expected)")
            if wrong == 0:
                problems.append(f"{label} unexpectedly passed every case")
            if name == "mistake_min_zero" and got != [max(c) for c in all_cases]:
                problems.append(f"{label}: the page says it returns the highest price, and it does not")
    for key, v in page["range"].items():
        prices = json.loads(key)
        if run_py("mistake_global_range", [prices])[0] != v or run_ts("mistake_global_range", [prices])[0] != v:
            problems.append(f"the page's range answer for {key} is {v}, but the files disagree")
    # the page's table of range answers, row by row, and the zero-start answers it quotes
    for key, v in page["zero"].items():
        prices = json.loads(key)
        if run_py("mistake_min_zero", [prices])[0] != v or run_ts("mistake_min_zero", [prices])[0] != v:
            problems.append(f"the page's min-zero answer for {key} is {v}, but the files disagree")
    for key, v in page["minfirst"].items():
        prices = json.loads(key)
        if run_py("alt_min_first", [prices])[0] != v or run_ts("alt_min_first", [prices])[0] != v:
            problems.append(f"the page's swapped-order answer for {key} is {v}, but the files disagree")

    # 3. the page's own numbers, recomputed here
    f = page["facts"]
    n_big = 10 ** 5
    want_facts = {
        "iters": 6, "cmps": 12, "limitN": "100,000", "limitCmps": f"{2 * n_big:,}",
        "pairs": f"{math.comb(n_big, 2):,}", "secs": round(math.comb(n_big, 2) / 1e8),
        "diffs": "[-6,4,-2,3,-2]", "best": 5, "pairs6": math.comb(6, 2),
    }
    for k, v in want_facts.items():
        if f.get(k) != v:
            problems.append(f"FACTS.{k} is {f.get(k)!r} but the model says {v!r}")
    # kadane on the differences, a third algorithm, and the sum of rises
    diffs = [b - a for a, b in zip([7, 1, 5, 3, 6, 4], [7, 1, 5, 3, 6, 4][1:])]
    cur = best = 0
    for d in diffs:
        cur = max(0, cur + d)
        best = max(best, cur)
    if page["diffs"] != diffs or f["kadane"] != best or f["rises"] != sum(d for d in diffs if d > 0):
        problems.append("the maximum-subarray and many-trades variant numbers disagree with the model")
    # the self-check's list count: 12 named lists plus 300 random ones, regenerated here with the same generator
    r = lcg(20261020)
    lists = [[7, 1, 5, 3, 6, 4], [7, 6, 4, 3, 1], [3, 2, 6, 5, 0, 3], [5, 8, 1, 3], [2, 4, 1], [1], [0], [5, 5, 5],
             [1, 2, 3, 4, 5], [5, 4, 3, 2, 1], [0, 10000], [10000, 0]]
    for _ in range(300):
        n = 1 + math.floor(r() * 14)
        lists.append([math.floor(r() * 20) for _ in range(n)])
    if f["agree"] != len(lists):
        problems.append(f"FACTS.agree is {f['agree']} but {len(lists)} histories are checked")
    for lst in lists:
        w = model_pairs(lst)
        if run_py("solution", [lst])[0] != w or run_py("alt_min_first", [lst])[0] != w:
            problems.append(f"the python files disagree with the model on {lst}")
    # the zero-answers fact names these answers
    for token in ("<b>7</b> for <code>[7,1,5,3,6,4]</code>", "<b>7</b> for <code>[7,6,4,3,1]</code>", "<b>5</b> and <b>0</b>"):
        if token not in f["zeroAnswers"]:
            problems.append(f"FACTS.zeroAnswers lacks {token}")

    # the sweep numbers behind the walkthrough, every step, against a Python rewrite
    for key, s in page["sweeps"].items():
        mine = py_sweep_trace(json.loads(key))
        if mine != s:
            problems.append(f"the page's sweep of {key} differs from the Python trace")
    # limitCmps counts the sweep on the page's seeded history, and the history is the same as the one regenerated here
    if page["big"] != history(n_big, 7, TOP):
        problems.append("the page's generator and the Python generator disagree on the 10^5 history")
    if py_sweep_trace(page["big"])["cmps"] != 2 * n_big:
        problems.append("the sweep did not make two comparisons a day")
    # the cost plot: every count against the closed form and the code
    for n, pairs, sweep, h in page["cost"]:
        if pairs != math.comb(n, 2) or sweep != n or (n and model_pairs(h) != py_sweep_trace(h)["best"]):
            problems.append(f"cost point n={n}: {pairs} pairs, {sweep} sweep steps")
        if h != history(n, n + 3, TOP):
            problems.append(f"cost history for n={n} differs between the page and Python")

    # 4. the prose's typed numbers: the lesson's own examples and statements
    for prices, ans, why in (([7, 1, 5, 3, 6, 4], 5, "buy day 1 at 1, sell day 4 at 6"), ([7, 6, 4, 3, 1], 0, "prices only fall")):
        if model_pairs(prices) != ans:
            problems.append(f"example {prices} is not {ans}")
    ex = [7, 1, 5, 3, 6, 4]
    if not (ex[1] == 1 and ex[4] == 6 and ex[4] - ex[1] == 5):
        problems.append("the worked example's buy and sell days are wrong")
    if not (math.comb(n_big, 2) == n_big * (n_big - 1) // 2):
        problems.append("pair formula wrong")
    # the 'hint' and 'insight' claim: for each sell day the best buy is the cheapest day up to it
    rnd = random.Random(5)
    for _ in range(300):
        p = [rnd.randint(0, 30) for _ in range(rnd.randint(1, 12))]
        for j in range(len(p)):
            if max(p[j] - p[i] for i in range(j + 1)) != p[j] - min(p[: j + 1]):
                problems.append(f"fixed-sell-day claim fails on {p} day {j}")
    # the swapped-order derivation: a new low sells against itself for 0
    for _ in range(300):
        p = [rnd.randint(0, 30) for _ in range(rnd.randint(1, 12))]
        low = p[0]
        for x in p:
            if min(low, x) == x and x - min(low, x) != 0:
                problems.append("a new low does not sell for 0")
            low = min(low, x)
    # a Python slice copies: the page says iterating prices[1:] would cost O(n) space
    src = open(os.path.join(CODE, "solution.py")).read()
    sliced = src.replace("for price in prices:", "for price in prices[1:]:")
    if sliced == src:
        problems.append("solution.py no longer iterates `for price in prices:`")
    big_prices = list(range(10 ** 6))

    def peak(code):
        ns = {}
        exec(code, ns)
        tracemalloc.start()
        ns[PY_FN](big_prices)
        _, pk = tracemalloc.get_traced_memory()
        tracemalloc.stop()
        return pk
    p_plain, p_slice = peak(src), peak(sliced)
    print(f"python peak allocation on 10^6 prices: solution {p_plain:,} B, with prices[1:] {p_slice:,} B")
    if not (p_plain < 2000 and p_slice > 1_000_000):
        problems.append("the slice-copies claim does not hold: solution allocates too much or the slice too little")

    # 5. built page embeds the exact PURE block
    dist = os.path.join(WEB, "lesson-artifacts", "dist", "arrays", SLUG + ".html")
    if os.path.exists(dist):
        html = open(dist, encoding="utf-8").read()
        if pure_block() not in html:
            problems.append("built HTML does not embed the exact PURE block from lesson.js")
    else:
        print("note: no built page; run build.py to check the embed")

    if problems:
        print("\nERRORS:")
        for p in problems:
            print("  *", p)
        sys.exit(1)
    print("\nAll checks passed.")


if __name__ == "__main__":
    main()
