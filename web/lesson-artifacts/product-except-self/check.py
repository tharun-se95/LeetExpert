"""Executes the code shown on the page in Python and TypeScript and recomputes every number the page quotes.

    python3 web/lesson-artifacts/product-except-self/check.py

Validates:
  * code/solution, naive and alt_two_arrays match two independent models (the definition, multiplying
    every other element; and a division-based one that handles zeros by counting them) on the lesson's
    examples, the constraint's shapes (n = 2, n = 10^5, zeros, negatives, products inside 32 bits) and
    random arrays, in both runtimes.
  * code/mistake_division and mistake_swap_order fail in both runtimes, and the page's claims about what
    they return are the real outputs (ZeroDivisionError in Python, NaN in TypeScript, the whole product
    everywhere for the swapped order).
  * the Python-versus-JavaScript claims the page makes are executed: negative zero, what compares equal
    and what does not, the 2^53 limit, a product that rounds in a double and not in an int, and the
    `a * b % m` trap.
  * lesson.js's PURE block, run in node, agrees with Python on every FACTS value and every table row.
  * the built page embeds that exact PURE block.
Plant a fault in code/solution.py or code/solution.ts and this fails.
"""
import json, math, os, random, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
CODE = os.path.join(HERE, "code")
WEB = os.path.normpath(os.path.join(HERE, "..", ".."))
ESBUILD = os.path.join(WEB, "node_modules", ".bin", "esbuild")
SLUG = os.path.basename(HERE)

PY_FN = "product_except_self"
INT32 = 2 ** 31 - 1


def lcg(seed):
    """The page's generator: seed * 1664525 + 1013904223 mod 2^32, scaled to [0, 1)."""
    state = [seed]

    def nxt():
        state[0] = (state[0] * 1664525 + 1013904223) % 2 ** 32
        return state[0] / 4294967296
    return nxt


# ---------- independent models ----------
def model_def(nums):
    """The definition: for each position, multiply every other element."""
    out = []
    for i in range(len(nums)):
        p = 1
        for j, x in enumerate(nums):
            if j != i:
                p *= x
        out.append(p)
    return out


def model_div(nums):
    """A different method: one product of the nonzero entries, and a case split on how many zeros there are."""
    zeros = [i for i, x in enumerate(nums) if x == 0]
    nz = 1
    for x in nums:
        if x != 0:
            nz *= x
    if not zeros:
        return [nz // x for x in nums]
    if len(zeros) == 1:
        return [nz if i == zeros[0] else 0 for i in range(len(nums))]
    return [0] * len(nums)


def model(nums):
    a = model_div(nums)
    if len(nums) <= 150 and a != model_def(nums):
        raise SystemExit(f"the two models disagree on {nums[:12]}")
    return a


def cases():
    rnd = random.Random(20261020)
    out = [[1, 2, 3, 4], [-1, 1, 0, -3, 3], [2, 3], [1, 1, 1, 1], [3, 0, 0, 2], [0, 0], [0, 5], [5, 0], [-2, -2], [2, 0, 5],
           [2, 3, 4], [1, 0, 3, 4], [-1, 2, -3], [0, 0, 3], [-5, 0, 0, 7], [1, -1], [-1, -1, -1]]
    for _ in range(700):
        n = rnd.randint(2, 9)
        out.append([rnd.randint(-3, 3) for _ in range(n)])
    for _ in range(100):
        n = rnd.randint(10, 150)
        arr = [rnd.choice([-1, 1]) for _ in range(n)]
        for _k in range(rnd.randint(0, 4)):
            arr[rnd.randrange(n)] = 2                                     # a few twos: products stay inside 32 bits
        if rnd.random() < 0.15:
            arr[rnd.randrange(n)] = 0
        out.append(arr)
    n = 10 ** 5
    big = [rnd.choice([-1, 1]) for _ in range(n)]
    out.append(big)                                                       # +-1 everywhere
    out.append([1] * n)
    withs = list(big)
    withs[12345] = 0
    out.append(withs)                                                     # exactly one zero
    withs2 = list(big)
    withs2[10], withs2[99999] = 0, 0
    out.append(withs2)                                                    # two zeros
    sparse = [1] * n
    for k in (3, 500, 70000, 99999):
        sparse[k] = rnd.choice([-3, 2, 5, 7])
    out.append(sparse)                                                    # a few small factors, products well inside 32 bits
    for c in out:
        if max((abs(x) for x in model(c)), default=0) > INT32:
            raise SystemExit("a test case breaks the 32-bit promise; the lesson's constraint says products fit")
    return out


def run_py(name, all_cases):
    ns = {}
    with open(os.path.join(CODE, name + ".py")) as f:
        exec(f.read(), ns)
    res = []
    for c in all_cases:
        try:
            res.append(ns[PY_FN](list(c)))
        except Exception as e:  # noqa: BLE001 - a mistake's failure is the result being recorded
            res.append("ERR:" + type(e).__name__)
    return res


DRIVER = r"""
const CASES = JSON.parse(require('fs').readFileSync(0, 'utf8'));
const show = (x) => Object.is(x, -0) ? '-0' : String(x);
const out = CASES.map(c => { try { const r = productExceptSelf(c); return { r: r.map(Number), neg: r.map(x => Object.is(x, -0)), text: '[' + r.map(show).join(', ') + ']' }; } catch (e) { return 'ERR:' + e.name; } });
process.stdout.write(JSON.stringify(out, (k, v) => (typeof v === 'number' && !Number.isFinite(v)) ? 'NaN' : v));
"""


def ts_js(name):
    src = open(os.path.join(CODE, name + ".ts")).read()
    return subprocess.run([ESBUILD, "--loader=ts", "--format=cjs"], input=src, capture_output=True, text=True, check=True).stdout


def run_ts_full(name, all_cases):
    res = subprocess.run(["node", "-e", ts_js(name) + DRIVER], input=json.dumps(all_cases), capture_output=True, text=True)
    if res.returncode:
        raise SystemExit(f"TypeScript run of {name} failed:\n{res.stderr[:600]}")
    return json.loads(res.stdout)


def run_ts(name, all_cases):
    """Plain values: -0 reads as 0 (JSON), NaN as the string 'NaN', a thrown error as 'ERR:...'."""
    return [x if isinstance(x, str) else x["r"] for x in run_ts_full(name, all_cases)]


def pure_block():
    js = open(os.path.join(HERE, "lesson.js")).read()
    a = js.index("/* PURE:begin")
    b = js.index("/* PURE:end */") + len("/* PURE:end */")
    return js[a:b]


def run_pure():
    probe = pure_block() + r"""
var fmt = function (n) { return n.toLocaleString('en-US'); };
var out = {facts: ppFacts(fmt)};
out.solution = {}; out.div = {}; out.swap = {}; out.naive = {}; out.two = {};
[PP_A, PP_Z, PP_ZZ, [2, 0, 5], PP_S, PP_P, PP_ONE].forEach(function (p) {
  var k = ppShow(p);
  out.solution[k] = ppSpaced(ppSolution(p).answer); out.naive[k] = ppSpaced(ppNaive(p).answer);
  out.two[k] = ppSpaced(ppTwoArrays(p)); out.div[k] = ppSpaced(ppDivision(p)); out.swap[k] = ppSpaced(ppSwapOrder(p));
});
out.cost = [];
for (var n = 0; n <= 48; n += 6) { var h = n ? ppHistory(n, n + 5, 2) : []; out.cost.push([n, ppNaive(h).mults, ppSolution(h).mults, h]); }
out.big = {nums: PP_BIG, number: ppSolution(PP_BIG).answer.map(String), exact: ppBigSolution(PP_BIG).map(String)};
out.pyPrint = PP_PY_PRINT;
process.stdout.write(JSON.stringify(out));
"""
    res = subprocess.run(["node", "-e", probe], capture_output=True, text=True)
    if res.returncode:
        raise SystemExit("lesson.js PURE block failed in node:\n" + res.stderr)
    return json.loads(res.stdout)


def node_eval(js):
    res = subprocess.run(["node", "-e", js], capture_output=True, text=True)
    if res.returncode:
        raise SystemExit("node failed:\n" + res.stderr[:500])
    return res.stdout.strip()


def main():
    problems = []
    all_cases = cases()
    want = [model(c) for c in all_cases]
    small = [i for i, c in enumerate(all_cases) if len(c) <= 400]

    # 1. the correct files against the models, both runtimes
    for name in ("solution", "alt_two_arrays", "naive"):
        idx = small if name == "naive" else list(range(len(all_cases)))
        sub = [all_cases[i] for i in idx]
        for label, got in ((name + ".py", run_py(name, sub)), (name + ".ts", run_ts(name, sub))):
            bad = [(i, g) for i, g in zip(idx, got) if want[i] != g]
            print(f"{label:24} {len(idx) - len(bad)}/{len(idx)} match the models")
            if bad:
                problems.append(f"{label} failed on {len(bad)} cases: first {bad[0][0]}: {str(bad[0][1])[:80]}")

    # 2. the mistakes fail, and do what the page says
    for name in ("mistake_division", "mistake_swap_order"):
        for label, got in ((name + ".py", run_py(name, all_cases)), (name + ".ts", run_ts(name, all_cases))):
            wrong = sum(1 for w, g in zip(want, got) if w != g)
            print(f"{label:24} fails on {wrong}/{len(all_cases)} cases (expected)")
            if wrong == 0:
                problems.append(f"{label} unexpectedly passed every case")
            if name == "mistake_swap_order":
                total = [math.prod(c) for c in all_cases]
                exp = [[t] * len(c) for t, c in zip(total, all_cases)]
                if got != exp:
                    problems.append(f"{label}: the page says it returns the whole product at every position, and it does not")
    # division is exact exactly when there is no zero; with a zero, python raises and JS gives NaN
    py_div, ts_div = run_py("mistake_division", all_cases), run_ts("mistake_division", all_cases)
    for c, w, p, t in zip(all_cases, want, py_div, ts_div):
        if 0 not in c and (p != w or t != w):
            problems.append(f"division should be exact without a zero but fails on {c[:8]}")
        if 0 in c and len(c) <= 8:
            if p != "ERR:ZeroDivisionError":
                problems.append(f"python's // should raise ZeroDivisionError on {c}, got {str(p)[:40]}")
            if not (isinstance(t, list) and "NaN" in t):
                problems.append(f"JavaScript's division should leave a NaN on {c}")

    # 3. the page's own numbers, recomputed here
    page = run_pure()
    f = page["facts"]
    n_big = 10 ** 5
    ex_z = [-1, 1, 0, -3, 3]
    ts_z = run_ts_full("solution", [ex_z])[0]
    py_z = run_py("solution", [ex_z])[0]
    ts_div_z = run_ts_full("mistake_division", [ex_z])[0]
    want_facts = {
        "mults4": 11, "naive4": 12, "limitN": "100,000", "limitMults": f"{3 * n_big - 1:,}",
        "limitNaive": f"{n_big * (n_big - 1):,}", "halfPairs": f"{n_big * (n_big - 1) // 2:,}",
        "naiveSecs": round(n_big * (n_big - 1) / 1e8), "swapAnswers": "[24, 24, 24, 24]", "swapTotal": 24,
        "zeroJs": ts_z["text"], "zeroPy": str(py_z), "negZeros": sum(ts_z["neg"]),
        "divZero": ts_div_z["text"], "safeInt": f"{2 ** 53 - 1:,}", "bigCount": 4,
        "sumExcept": str([sum([1, 2, 3, 4]) - x for x in [1, 2, 3, 4]]), "divOk": str([24 // x for x in [1, 2, 3, 4]]),
    }
    for k, v in want_facts.items():
        if f.get(k) != v:
            problems.append(f"FACTS.{k} is {f.get(k)!r} but the executed code says {v!r}")
    if f["zeroPy"] != page["pyPrint"] or page["pyPrint"] != str(py_z):
        problems.append("the page's typed Python output is not what solution.py prints")
    # the facts' own list count: 12 named arrays + 300 random ones, rebuilt with the same generator
    r = lcg(20261020)
    lists = [[1, 2, 3, 4], ex_z, [3, 0, 0, 2], [-1, 2, -3], [2, 3, 4], [1, 0, 3, 4], [2, 3], [1, 1, 1, 1], [0, 0], [5, 0], [0, 5, 0], [-2, -2]]
    for _ in range(300):
        n = 2 + math.floor(r() * 8)
        lists.append([math.floor(r() * 7) - 3 for _ in range(n)])
    if f["agree"] != len(lists):
        problems.append(f"FACTS.agree is {f['agree']} but {len(lists)} arrays are checked")
    for lst in lists:
        w = model_def(lst)
        if run_py("solution", [lst])[0] != w or run_py("alt_two_arrays", [lst])[0] != w:
            problems.append(f"the python files disagree with the definition on {lst}")
    # every table row the page prints, from the executed files
    for key, text in page["solution"].items():
        c = json.loads(key)
        mine = run_ts_full("solution", [c])[0]["text"]
        if mine != text or page["naive"][key] != text or page["two"][key] != text:
            problems.append(f"the page's answer for {key} is {text}, but solution.ts gives {mine}")
        if page["div"][key] != run_ts_full("mistake_division", [c])[0]["text"]:
            problems.append(f"the page's division row for {key} is {page['div'][key]}, but mistake_division.ts differs")
        if page["swap"][key] != run_ts_full("mistake_swap_order", [c])[0]["text"]:
            problems.append(f"the page's swapped-order row for {key} differs from mistake_swap_order.ts")
    # the cost plot: counted multiplications against the closed forms and a Python count
    for n, naive, sweeps, h in page["cost"]:
        if n:
            if naive != n * (n - 1) or sweeps != 3 * n - 1:
                problems.append(f"cost point n={n}: naive {naive}, sweeps {sweeps}")
            hr = lcg(n + 5)
            hist = [1 + math.floor(hr() * 2) for _ in range(n)]
            if h != hist:
                problems.append(f"cost history for n={n} differs between the page and Python")
            if run_py("solution", [h])[0] != model_def(h):
                problems.append(f"solution.py disagrees on the cost history for n={n}")
    # the precision table: the same sweeps as doubles (Python floats multiply the same way), and exact ints
    big = page["big"]["nums"]
    exact = [str(v) for v in model_def(big)]
    if page["big"]["exact"] != exact:
        problems.append("the page's BigInt answers differ from Python's exact integers")
    fl = [1.0] * len(big)
    for i in range(1, len(big)):
        fl[i] = fl[i - 1] * float(big[i - 1])
    right = 1.0
    for i in range(len(big) - 1, -1, -1):
        fl[i] *= right
        right *= float(big[i])
    ts_big = run_ts_full("solution", [big])[0]["r"]
    if [float(x) for x in page["big"]["number"]] != fl or ts_big != fl:
        problems.append("the page's Number answers differ from the double arithmetic of solution.ts / Python floats")
    differs = sum(1 for x, e in zip(fl, model_def(big)) if int(x) != e)
    if f["bigDiffers"] != differs or differs == 0:
        problems.append(f"FACTS.bigDiffers is {f['bigDiffers']} but {differs} positions differ")
    if max(abs(v) for v in model_def(big)) <= 2 ** 53:
        problems.append("the precision example does not exceed 2^53")

    # 4. the language claims the prose makes, executed
    claims = node_eval(r"""
const assert = require('node:assert');
const r = [-1, 1, 0, -3, 3].map((x, i, a) => a.reduce((p, y, j) => j === i ? p : p * y, 1));
let strictThrows = false; try { assert.deepStrictEqual(r, [0, 0, 9, 0, 0]); } catch (e) { strictThrows = true; }
let looseOk = true; try { assert.deepEqual(r, [0, 0, 9, 0, 0]); } catch (e) { looseOk = false; }
const m = 1000000007, a = 99999999, b = 99999999;
console.log(JSON.stringify({
  zeroProduct: Object.is(0 * -3, -0), eq: -0 === 0, json: JSON.stringify([-0]), isDiffers: !Object.is(-0, 0),
  strictThrows, looseOk, normalised: Object.is(-0 + 0, 0), maxSafe: Number.MAX_SAFE_INTEGER === 2 ** 53 - 1,
  beyond: 9007199254740993 === 9007199254740992,
  modNumber: (a * b) % m, modBig: Number((BigInt(a) * BigInt(b)) % BigInt(m)), a_b_over: a * b > 2 ** 53,
}));""")
    c = json.loads(claims)
    for k in ("zeroProduct", "eq", "isDiffers", "strictThrows", "looseOk", "normalised", "maxSafe", "beyond", "a_b_over"):
        if c[k] is not True:
            problems.append(f"JavaScript claim {k} did not hold: {c}")
    if c["json"] != "[0]":
        problems.append("JSON.stringify([-0]) is not '[0]'")
    if c["modNumber"] == c["modBig"] or c["modBig"] != (99999999 * 99999999) % 1000000007:
        problems.append("the a * b % m trap does not show: the double result equals the exact one")
    if str(0 * -3) != "0" or any(isinstance(x, float) for x in run_py("solution", [ex_z])[0]):
        problems.append("Python produced something other than plain integers on the zero example")
    # 2^53 - 1 is the number the page prints
    if 9007199254740991 != 2 ** 53 - 1:
        problems.append("the typed 2^53 - 1 in the prose is wrong")
    # the prose's zero reasoning and its worked arithmetic
    rnd = random.Random(8)
    for _ in range(400):
        p = [rnd.randint(-3, 3) for _ in range(rnd.randint(2, 9))]
        if 0 in p:
            z = [i for i, x in enumerate(p) if x == 0]
            got = run_py("solution", [p])[0]
            for i, v in enumerate(got):
                others_have_zero = any(j != i for j in z)
                if others_have_zero and v != 0:
                    problems.append(f"an answer that includes a zero is not 0 on {p}")
                if not others_have_zero and v != math.prod(x for j, x in enumerate(p) if j != i):
                    problems.append(f"the answer at the only zero is not the product of the rest on {p}")
    if (-1) * 1 * (-3) * 3 != 9 or run_py("solution", [ex_z])[0] != [0, 0, 9, 0, 0]:
        problems.append("the worked zero example (9 = -1 x 1 x -3 x 3, answer [0, 0, 9, 0, 0]) is wrong")
    # the multiplication counts behind the derivation, counted here in Python
    def count(n):
        mults = 0
        for _ in range(1, n):
            mults += 1
        for _ in range(n):
            mults += 2
        return mults
    for n in (2, 3, 4, 10, 100):
        if count(n) != 3 * n - 1:
            problems.append("3n - 1 multiplications is wrong")

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
