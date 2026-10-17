"""Holds Counting & Combinatorics to the course standard: every count and formula verified.

Validates:
  * code/solution.* matches math.comb on 18 edge cases, 400 random pairs with n <= 50 and every (n, k)
    with n <= 120, in both runtimes (TypeScript returns a bigint, so it is exact for all of them).
  * code/mistake.* is wrong where the warn says: the first (n, k) scanning n then k, C(171, 2) in
    TypeScript (Infinity), and the exact JavaScript facts about n! (passes 2^53 at 19, inexact double at
    23, Infinity at 171) are run in node.
  * small-set permutations and combinations match itertools exactly; the product rule is enumerated; the
    stepwise accumulator is C(n - k + i, i) after step i, increasing to C(n, k).
  * lesson.js PURE block (basket data, enumerations, answer-space table with its formatting, FACTS) is
    rebuilt independently, including the exact BigInt sizes and the time-at-10^8 strings.
  * every number the prose states is tied to its text: the sentence is rebuilt from recomputed values and
    must appear in lesson.md (so editing the prose or the maths fails); a sweep then fails on any digit in
    the prose that no claim and no stated input covers.
  * quiz options are of similar length and the answer is not the longest.
  * built HTML embeds the exact PURE block.

    LESSON_MD=<alternative lesson.md> python3 check.py   # used to prove a changed prose number fails
"""
import itertools, json, math, os, random, re, subprocess, sys
from decimal import Decimal, ROUND_HALF_UP

HERE = os.path.dirname(os.path.abspath(__file__))
CODE = os.path.join(HERE, "code")
WEB = os.path.normpath(os.path.join(HERE, "..", ".."))
ESBUILD = os.path.join(WEB, "node_modules", ".bin", "esbuild")
HTML = os.path.join(WEB, "lesson-artifacts", "dist", "math-for-dsa", "counting-and-combinatorics.html")
LESSON_MD = os.environ.get("LESSON_MD", os.path.join(HERE, "lesson.md"))

problems = []


def fail(msg):
    problems.append(msg)
    print("FAIL: " + msg)


# ---- Prose claims: every number the lesson states is tied to its text ----
SUPERS = "⁰¹²³⁴⁵⁶⁷⁸⁹"


def sup(n):
    return "".join(SUPERS[int(c)] for c in str(n))


def sci(x, digits=2):
    """6227020800 -> '6.2 × 10⁹': exact Decimal arithmetic rounded half up, so no float error in the mantissa."""
    d = Decimal(x)
    e = d.adjusted()
    m = (d.scaleb(-e)).quantize(Decimal(1).scaleb(-(digits - 1)), rounding=ROUND_HALF_UP)
    if m >= 10:
        m, e = m / 10, e + 1
    return f"{m} × 10{sup(e)}"


def pw10(x):
    """10**k -> '10ᵏ'; raises if x is not an exact power of ten, so a typo'd 'power' cannot pass."""
    k = len(str(x)) - 1
    if x != 10 ** k:
        raise ValueError(f"{x} is not a power of ten")
    return "10" + sup(k)


def read_md():
    return open(LESSON_MD, encoding="utf-8").read()


MD = read_md()
CLAIM_PHRASES = []


def claim(template, *vals):
    """Rebuild the sentence from recomputed values; it must be in lesson.md verbatim."""
    phrase = template.format(*vals)
    CLAIM_PHRASES.append(phrase)
    if phrase not in MD:
        fail(f"lesson.md does not contain {phrase!r}: the prose and the recomputed maths disagree")


# A digit run, with an attached superscript exponent if there is one: '10⁹', '9,007,199,254,740,991', '1.5'.
NUMBER = re.compile(r"\d[\d,]*(?:\.\d+)?[⁰¹²³⁴⁵⁶⁷⁸⁹]*")


def uncovered_numbers(stated_inputs):
    """Every digit run left in the prose after the claims and the stated inputs are blanked out.

    Fences that carry no prose numbers of their own are skipped: vig (drawing coordinates), widget and
    html (markup, filled by lesson.js from computed data), code (loaded from code/), derivation (symbols,
    its lemma and bound are scanned in check.py)."""
    text = MD
    for ph in sorted(CLAIM_PHRASES + list(stated_inputs), key=len, reverse=True):
        text = text.replace(ph, " ")
    text = re.sub(r"(`{3,})(?:vig|widget|html|code|derivation)\b.*?\n\1", " ", text, flags=re.S)
    text = re.sub(r"(?m)^`{3,}[^\n]*$", " ", text)  # fence lines carry ids (reveal #drill-2-reveal), not prose
    text = re.sub(r'"answer":\s*\d', " ", text)  # quiz JSON key
    text = re.sub(r"<[^>]+>", " ", text)  # markup attributes (viewBox, ids) are not prose
    text = re.sub(r"(?m)^\s*\d+\.\s", " ", text)  # numbered-list markers
    text = re.sub(r"\b(?:Drill|Step) \d\b", " ", text)  # ordinal labels
    text = re.sub(r"\{#[a-z]+[^}]*\}", " ", text)  # section ids
    text = re.sub(r"\{\{[a-zA-Z0-9_]+\}\}", " ", text)  # a {{fact}} is computed in lesson.js
    return [text[max(0, m.start() - 22):m.end() + 12].replace("\n", " ") for m in NUMBER.finditer(text)]


def cases(n=400, seed=20261018):
    rnd = random.Random(seed)
    edges = [
        (0, 0), (1, 0), (1, 1), (5, 0), (5, 1), (5, 2), (5, 3), (5, 4), (5, 5), (5, 6),
        (10, 0), (10, 1), (10, 5), (10, 10), (20, 10), (30, 15), (50, 3), (50, 25), (-1, 0), (3, -1)
    ]
    out = list(edges)
    for _ in range(n):
        nv = rnd.randint(0, 50)
        kv = rnd.randint(0, nv)
        out.append((nv, kv))
    out += [(nv, kv) for nv in range(121) for kv in range(nv + 1)]
    out += [(200, 100), (500, 250), (1000, 3)]
    return out


def ref_comb(n, k):
    if k < 0 or k > n or n < 0:
        return 0
    return math.comb(n, k)


def run_py(name, all_cases):
    ns = {}
    with open(os.path.join(CODE, name), encoding="utf-8") as f:
        exec(f.read(), ns)
    fn = ns["n_choose_k"]
    return [str(fn(n, k)) for n, k in all_cases]


def ts_module(file_name):
    src = open(os.path.join(CODE, file_name), encoding="utf-8").read()
    return subprocess.run([ESBUILD, "--loader=ts", "--format=cjs"], input=src, capture_output=True, text=True, check=True).stdout


def run_ts(file_name, all_cases):
    driver = r"""
const CASES = JSON.parse(require('fs').readFileSync(0, 'utf8'));
process.stdout.write(JSON.stringify(CASES.map(([n, k]) => String(nChooseK(n, k)))));
"""
    res = subprocess.run(["node", "-e", ts_module(file_name) + driver], input=json.dumps(all_cases), capture_output=True, text=True)
    if res.returncode:
        raise SystemExit(f"{file_name} failed in node:\n" + res.stderr)
    return json.loads(res.stdout)


def node_json(js, stdin=None):
    res = subprocess.run(["node", "-e", js], input=stdin, capture_output=True, text=True)
    if res.returncode:
        raise SystemExit("node failed:\n" + res.stderr)
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
  PERM_COMB_DATA: PERM_COMB_DATA,
  BASKET_TOTAL: BASKET_TOTAL,
  BASKET_DATA: BASKET_DATA,
  SPACE_PRESETS: SPACE_PRESETS,
  SUMMARIES: SPACE_PRESETS.map(spaceSummary)
}));
"""
    res = subprocess.run(["node", "-e", probe], capture_output=True, text=True)
    if res.returncode:
        raise SystemExit("lesson.js PURE block failed in node:\n" + res.stderr)
    return json.loads(res.stdout)


# ---- an independent implementation of the page's answer-space table (BigInt in the page, int here) ----
OPS_PER_SECOND = 10 ** 8


def py_big(b):
    s = str(b)
    if len(s) <= 12:
        return f"{b:,}"
    return sci(b, 3)


def py_duration(ops):
    if ops < 100000:
        return "under 1 ms"
    ms = ops // 100000
    if ms < 1000:
        return f"{ms} ms"
    hundredths = ops // 1000000
    if hundredths < 10000:
        return f"{hundredths / 100:.2f} s"
    secs = ops // OPS_PER_SECOND
    if secs < 7200:
        return f"{secs} s"
    hours = secs // 3600
    if hours < 48:
        return f"{hours} hours"
    days = secs // 86400
    if days < 730:
        return f"{days} days"
    return f"{py_big(secs // 31557600)} years"


def py_space(n):
    rows = [
        ("All subsets (2ⁿ)", 2 ** n, n),
        ("All permutations (n!)", math.factorial(n), n),
        ("All pairs (C(n, 2))", n * (n - 1) // 2, 1),
    ]
    return [{"label": l, "states": str(st), "statesText": py_big(st), "ops": str(st * c), "opsText": py_big(st * c),
             "time": py_duration(st * c), "fits": st * c <= OPS_PER_SECOND} for l, st, c in rows]


def largest(pred, hi=100000):
    return max(n for n in range(1, hi) if pred(n))


def prose_checks(facts, pure_data):
    # -- the gift basket: enumerated, not multiplied --
    bd = pure_data["BASKET_DATA"]
    lens = [len(bd["wraps"]), len(bd["ribbons"]), len(bd["tokens"])]
    enumerated = len(list(itertools.product(bd["wraps"], bd["ribbons"], bd["tokens"])))
    if enumerated != math.prod(lens) or pure_data["BASKET_TOTAL"] != enumerated:
        fail("basket total is not the enumerated number of baskets")
    claim("{} × {} × {} = {}", *lens, enumerated)
    claim("{} wrapping styles × {} ribbon colors × {} tokens = {} possible baskets.", *lens, enumerated)
    pins = len(list(itertools.product(range(10), repeat=4)))
    claim("(such as {} four-digit PINs)", pw10(pins))

    # -- permutations: the cost lines at 10^8 operations a second --
    def secs(n):
        return math.factorial(n) / OPS_PER_SECOND

    claim("- 10! = {:,}: about {:.3f} s at 10⁸ operations per second", math.factorial(10), secs(10))
    claim("- 13! = {}: about {:.0f} s", sci(math.factorial(13)), secs(13))
    claim("- 20! = {}: about {:.0f} years", sci(math.factorial(20)), secs(20) / 31557600)
    nn = lambda n: n * math.factorial(n)
    perm_max = largest(lambda n: nn(n) <= OPS_PER_SECOND, 40)
    claim("n · n! is {:,} operations for n = {}, within a 10⁸ budget, and {:,} for n = {}, over it. Brute force over all permutations is viable through n = {}.",
          nn(perm_max), perm_max, nn(perm_max + 1), perm_max + 1, perm_max)

    # -- floating-point facts about n!, executed in node --
    fx = node_json(r"""
function bf(n){let f=1n;for(let i=2n;i<=BigInt(n);i++)f*=i;return f}
let pass53=null, inexact=null, inf=null, f=1;
for (let n=1;n<=200;n++){ f*=n;
  if(pass53===null && bf(n)>BigInt(Number.MAX_SAFE_INTEGER)) pass53=n;
  if(inexact===null && (!Number.isFinite(f) || BigInt(f)!==bf(n))) inexact=n;
  if(inf===null && !Number.isFinite(f)) inf=n; }
process.stdout.write(JSON.stringify({pass53, inexact, inf}));
""")
    py_pass53 = next(n for n in range(1, 60) if math.factorial(n) > 2 ** 53 - 1)
    if fx["pass53"] != py_pass53:
        fail(f"n! passes 2^53 at {py_pass53} in Python but {fx['pass53']} in node")
    claim("In JavaScript, n! passes 2⁵³ at n = {}, stops being an exact double at n = {}, and becomes Infinity at n = {}.", fx["pass53"], fx["inexact"], fx["inf"])

    # -- the mistake: first wrong (n, k), scanning n then k, in each runtime --
    scan = [(n, k) for n in range(0, 201) for k in range(0, n + 1)]
    want = [str(math.comb(n, k)) for n, k in scan]
    first = {}
    for label, got in (("py", run_py("mistake.py", scan)), ("ts", run_ts("mistake.ts", scan))):
        first[label] = next(c for c, w, g in zip(scan, want, got) if w != g)
    ts171 = run_ts("mistake.ts", [(171, 2)])[0]
    py171 = run_py("mistake.py", [(171, 2)])[0]
    if ts171 != "Infinity" or py171 != str(math.comb(171, 2)):
        fail(f"C(171, 2): mistake.ts gave {ts171}, mistake.py gave {py171}")
    claim("so C({}, {}) is the first result (scanning n, then k) that comes out wrong, and C(171, 2) = {:,} comes back as Infinity because {}! does.",
          *first["ts"], math.comb(171, 2), fx["inf"] - 0)
    claim("In TypeScript, n! is exact only through n = {}", fx["inexact"] - 1)
    claim("so its first wrong answer is C({}, {}).", *first["py"])
    if first["py"] == first["ts"]:
        fail("python and typescript mistakes fail at the same place; the warn names two")
    # Python's trouble is exactly the 2^53 rounding of the float quotient
    py_first_big = next(c for c in scan if math.comb(*c) > 2 ** 53 and run_py("mistake.py", [c])[0] != str(math.comb(*c)))
    if py_first_big != first["py"]:
        fail("python mistake fails before C(n, k) passes 2^53")

    # -- the stepwise accumulator --
    for n in range(0, 40):
        for k in range(0, n + 1):
            kk = min(k, n - k)
            acc, vals = 1, [1]
            for i in range(1, kk + 1):
                acc = acc * (n - kk + i)
                if acc % i:
                    fail(f"stepwise division inexact at n={n}, k={k}, i={i}")
                acc //= i
                if acc != math.comb(n - kk + i, i):
                    fail(f"accumulator after step {i} is not C({n - kk + i}, {i})")
                vals.append(acc)
            if vals != sorted(vals) or vals[-1] != math.comb(n, k):
                fail(f"accumulator does not increase to C({n}, {k})")
    # P(n, k) overcounts each selection by exactly k!
    for n in range(0, 9):
        for k in range(0, n + 1):
            if math.perm(n, k) != math.comb(n, k) * math.factorial(k):
                fail("P(n, k) != C(n, k) * k!")

    # -- answer spaces and the 10^8 budget (O(n) per state for subsets and permutations, 1 per pair) --
    sub_max = largest(lambda n: n * 2 ** n <= OPS_PER_SECOND, 60)
    pair_max = largest(lambda n: n * (n - 1) // 2 <= OPS_PER_SECOND)
    claim("Subsets then fit through n = {} ({} · 2{} = {:,} operations) and not n = {} ({} · 2{} = {:,}).",
          sub_max, sub_max, sup(sub_max), sub_max * 2 ** sub_max, sub_max + 1, sub_max + 1, sup(sub_max + 1), (sub_max + 1) * 2 ** (sub_max + 1))
    claim("Permutations fit through n = {} ({} · {}! = {:,}) and not n = {} ({} · {}! = {:,}).",
          perm_max, perm_max, perm_max, nn(perm_max), perm_max + 1, perm_max + 1, perm_max + 1, nn(perm_max + 1))
    claim("so C(n, 2) fits through n = {:,}.", pair_max)
    claim("n ≤ {} (2{} = {:,} states)", sub_max, sup(sub_max), 2 ** sub_max)
    claim("n ≤ {} ({}! = {:,} states)", perm_max, perm_max, math.factorial(perm_max))
    claim("n ≤ {:,} (n = {} gives {:,} pairs)", pair_max, "10,000", 10000 * 9999 // 2)
    claim("C(30, 15) = {:,}, over a 10⁸ budget", math.comb(30, 15))
    if math.comb(30, 15) <= OPS_PER_SECOND:
        fail("C(30, 15) is not over the 10^8 budget")

    # -- the table the page prints, row for row --
    for pr in pure_data["SPACE_PRESETS"]:
        want_rows = py_space(pr["n"])
        if pr["rows"] != want_rows:
            fail(f"answer-space table for n={pr['n']} disagrees: page {pr['rows']} vs recomputed {want_rows}")
    for pr, summ in zip(pure_data["SPACE_PRESETS"], pure_data["SUMMARIES"]):
        names = ["subsets", "permutations", "pairs"]
        rows = py_space(pr["n"])
        fit = [nm for nm, r in zip(names, rows) if r["fits"]]
        over = [nm for nm, r in zip(names, rows) if not r["fits"]]
        want_s = f"At n = {pr['n']}: " + (" and ".join(fit) + " fit in 10⁸ operations" if fit else "nothing fits in 10⁸ operations")
        want_s += ("; " + " and ".join(over) + (" do not." if len(over) > 1 else " does not.")) if over else "."
        if summ != want_s:
            fail(f"summary for n={pr['n']}: {summ!r} != {want_s!r}")

    # -- facts --
    want_facts = {
        "basketTotal": enumerated,
        "perm4_2": len(list(itertools.permutations("ABCD", 2))), "comb4_2": len(list(itertools.combinations("ABCD", 2))),
        "perm4_3": len(list(itertools.permutations("ABCD", 3))), "comb4_3": len(list(itertools.combinations("ABCD", 3))),
        "subsets16": f"{2 ** 16:,}", "choose50_3": f"{math.comb(50, 3):,}", "digits50": len(str(math.factorial(50))),
    }
    if facts != want_facts:
        fail(f"FACTS {facts} != {want_facts}")

    # -- sweep: every digit left is a stated input --
    inputs = [
        "10⁸", "n ≤ 16", "C(50, 3)", "C(n, 2)", "P(n, k)", "C(n, k)", "k!", "2ⁿ", "(n − k)!", "n − k + i", "C(n − k + i, i)", "i from 1 to k", "A, B, C, D",
        "min(k, n − k)", "O(n log n)", "O(n²)", "O(1)", "O(k)", "O(min(k, n − k))", "i < j", "i = j", "(a, b)", "(b, a)", "Choosing 2 of n",
        "k ≤ n − k", "n = 10,000", "n(n − 1)/2", "n(n − 1)", "(n − 1)", "(n − 2)", "n − 1", "(n − k + 1)", "C(n - 1, k - 1) + C(n - 1, k)", "n = 16", "has {{digits50}} digits", "50!", "64-bit",
    ]
    stale = [i for i in inputs if i not in MD]
    for i in stale:
        fail(f"stated-input allowance {i!r} no longer appears in lesson.md")
    left = uncovered_numbers([i for i in inputs if i in MD])
    if left:
        fail(f"numbers in lesson.md covered by no claim or stated input: {left}")

    quiz = json.loads(re.search(r"```quiz\n(.*?)\n```", MD, re.S).group(1))
    for qi, q in enumerate(quiz["questions"], 1):
        lens = [len(re.sub(r"\{\{[a-zA-Z0-9_]+\}\}", "xxxxxx", o)) for o in q["options"]]
        if lens[q["answer"]] == max(lens) and lens.count(max(lens)) == 1:
            fail(f"quiz {qi}: the answer is the longest option {lens}")
        if max(lens) > 1.5 * min(lens):
            fail(f"quiz {qi}: option lengths {lens} differ by more than 1.5x")


def main():
    print("Testing counting-and-combinatorics...")
    all_cases = cases()
    want = [str(ref_comb(n, k)) for n, k in all_cases]

    # 1. Solution in Python and TypeScript matches math.comb
    for label, got in [("solution.py", run_py("solution.py", all_cases)),
                       ("solution.ts", run_ts("solution.ts", all_cases))]:
        bad = [(c, w, g) for c, w, g in zip(all_cases, want, got) if w != g]
        print(f"  {label:15} {len(all_cases) - len(bad)}/{len(all_cases)} match model")
        if bad:
            fail(f"{label} failed on {len(bad)} cases: first {bad[:3]}")

    # 2. Mistake fails on large factorial cases in both runtimes
    mistake_cases = [(60, 24), (57, 25), (171, 2), (200, 5)]
    want_m = [str(ref_comb(n, k)) for n, k in mistake_cases]
    for label, got in [("mistake.py", run_py("mistake.py", mistake_cases)),
                       ("mistake.ts", run_ts("mistake.ts", mistake_cases))]:
        wrong = sum(1 for w, g in zip(want_m, got) if w != g)
        print(f"  {label:15} failed on {wrong}/{len(mistake_cases)} large factorial cases (expected)")
        if wrong == 0:
            fail(f"{label} unexpectedly passed all large factorial cases!")

    # 3. Small-set itertools check
    items = ["A", "B", "C", "D"]
    for k in [2, 3]:
        py_perms = ["".join(p) for p in itertools.permutations(items, k)]
        py_combs = ["".join(c) for c in itertools.combinations(items, k)]
        if len(py_perms) != math.perm(4, k):
            fail(f"itertools perm count mismatch for k={k}")
        if len(py_combs) != math.comb(4, k):
            fail(f"itertools comb count mismatch for k={k}")
    print("  itertools small-set permutations and combinations verified")

    # 4. PURE block validation
    pure_data = run_pure()
    for k, kk in ((2, "k2"), (3, "k3")):
        d = pure_data["PERM_COMB_DATA"][kk]
        if d["perms"] != ["".join(p) for p in itertools.permutations(items, k)] or d["combs"] != ["".join(c) for c in itertools.combinations(items, k)]:
            fail(f"PERM_COMB_DATA {kk}: enumerations differ from itertools")
        if (d["permCount"], d["combCount"], d["overcount"]) != (math.perm(4, k), math.comb(4, k), math.factorial(k)):
            fail(f"PERM_COMB_DATA {kk}: counts differ")
    prose_checks(pure_data["FACTS"], pure_data)
    print("  PURE block, prose claims, answer-space table and quiz lengths verified")

    # 5. HTML embed check
    if os.path.exists(HTML):
        html_src = open(HTML, encoding="utf-8").read()
        pb = pure_block()
        if pb not in html_src:
            fail("HTML does not embed the exact PURE block from lesson.js")
        else:
            print("  HTML embeds the exact PURE block")
    else:
        print("  HTML not yet built; skipping HTML embed check (build.py will run next)")

    if problems:
        print(f"\n{len(problems)} PROBLEM(S) FOUND:")
        for p in problems:
            print("  * " + p)
        sys.exit(1)
    else:
        print("ALL CHECKS PASSED: counting-and-combinatorics")


if __name__ == "__main__":
    main()
