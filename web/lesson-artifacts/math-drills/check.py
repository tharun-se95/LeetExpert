"""Holds Math Drills to the course standard: every drill, modulo trap and safe product verified.

Validates:
  * code/solution.* matches independent models in Python and TypeScript:
      - prev_index wraps negative indices (prev_index(0, 5) == 4)
      - safe_product is exact modulo 10^9 + 7 (BigInt in TypeScript)
      - tree_height is the bit length of n (= floor(log2 n) + 1), on every power of two and its
        neighbours up to 2^52, and on random values
      - euclid_gcd matches math.gcd, with 0 on either side
  * code/mistake.* fails in both runtimes: prev_index returns -1 at i = 0, safe_product is wrong on
    999,999,900 x 999,999,999.
  * Drill 2 runs (0 - 1) % 5 in real python3 (4) and in node (-1); Drill 3 runs the plain-number
    product in node and replays it with Python floats (the same IEEE-754 operations) against exact ints.
  * every drill's data in lesson.js (levels, sqrt, factorial, seconds, Euclid rows, sieve marks, break-even,
    bytes) is recomputed independently, and the DRILLS choice/why strings are rebuilt from it.
  * every number the prose states is tied to its text: the sentence is rebuilt from recomputed values and
    must appear in lesson.md (so editing the prose or the maths fails); a sweep then fails on any digit in
    the prose that no claim and no stated input covers.
  * the Euclid step bound in Drill 5's key is scanned, not assumed.
  * quiz options are of similar length, the answer is not the longest, and the placed positions vary.
  * built HTML embeds the exact PURE block.

"""
import json, math, os, random, re, subprocess, sys
from decimal import Decimal, ROUND_HALF_UP

HERE = os.path.dirname(os.path.abspath(__file__))
CODE = os.path.join(HERE, "code")
WEB = os.path.normpath(os.path.join(HERE, "..", ".."))
ESBUILD = os.path.join(WEB, "node_modules", ".bin", "esbuild")
HTML = os.path.join(WEB, "lesson-artifacts", "dist", "math-for-dsa", "math-drills.html")
LESSON_MD = os.path.join(HERE, "lesson.md")

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


# ---- Reference models in Python ----
def ref_prev_index(i, n):
    return (i - 1) % n


def ref_safe_product(nums, mod):
    acc = 1
    for x in nums:
        acc = acc * (x % mod) % mod
    return acc


def ref_tree_height(n):
    return 1 if n <= 1 else n.bit_length()


# ---- Executing Python code ----
def load_py(name):
    ns = {}
    with open(os.path.join(CODE, name), encoding="utf-8") as f:
        exec(f.read(), ns)
    return ns


def run_py(name, fn_name, cases):
    fn = load_py(name)[fn_name]
    return [int(fn(*c)) for c in cases]


def ts_module(file_name):
    src = open(os.path.join(CODE, file_name), encoding="utf-8").read()
    return subprocess.run([ESBUILD, "--loader=ts", "--format=cjs"], input=src, capture_output=True, text=True, check=True).stdout


def run_ts(file_name, fn_name, cases):
    driver = "\nconst CASES = JSON.parse(require('fs').readFileSync(0, 'utf8'));\nprocess.stdout.write(JSON.stringify(CASES.map(c => Number(" + fn_name + "(...c)))));\n"
    res = subprocess.run(["node", "-e", ts_module(file_name) + driver], input=json.dumps(cases), capture_output=True, text=True)
    if res.returncode:
        raise SystemExit(f"{file_name} failed in node:\n" + res.stderr)
    return json.loads(res.stdout)


def node_json(js):
    res = subprocess.run(["node", "-e", js], capture_output=True, text=True)
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
process.stdout.write(JSON.stringify({ FACTS, DRILLS, D1, D2, D3, D4, D5, D6 }));
"""
    res = subprocess.run(["node", "-e", probe], capture_output=True, text=True)
    if res.returncode:
        raise SystemExit("lesson.js PURE block failed in node:\n" + res.stderr)
    return json.loads(res.stdout)


def euclid_rows(a, b):
    rows = []
    while b:
        rows.append({"a": a, "b": b, "q": a // b, "r": a % b})
        a, b = b, a % b
    return rows, a


def sieve_marks(limit):
    flags = bytearray([1]) * (limit + 1)
    marks = 0
    for p in range(2, math.isqrt(limit) + 1):
        if flags[p]:
            r = range(p * p, limit + 1, p)
            marks += len(r)
            flags[p * p::p] = bytes(len(r))
    return marks


def fmt_int(x):
    return f"{x:,}"


def prime_factors(n):
    out, d = set(), 2
    while d * d <= n:
        while n % d == 0:
            out.add(d)
            n //= d
        d += 1
    if n > 1:
        out.add(n)
    return out


def code_checks():
    rnd = random.Random(20261018)

    # 1. prev_index
    prev_cases = [(0, 5), (1, 5), (2, 5), (3, 5), (4, 5), (0, 10), (0, 100), (5, 6), (0, 1), (0, 2)]
    for _ in range(200):
        n = rnd.randint(2, 500)
        prev_cases.append((rnd.randint(0, n - 1), n))
    want = [ref_prev_index(*c) for c in prev_cases]
    for label, got in [("solution.py (prev_index)", run_py("solution.py", "prev_index", prev_cases)),
                       ("solution.ts (prevIndex)", run_ts("solution.ts", "prevIndex", prev_cases))]:
        bad = [(c, w, g) for c, w, g in zip(prev_cases, want, got) if w != g]
        print(f"  {label:28} {len(prev_cases) - len(bad)}/{len(prev_cases)} match model")
        if bad:
            fail(f"{label} failed on {len(bad)} cases: first {bad[:3]}")

    # 2. safe_product
    prod_cases = [([999999900, 999999999], 1000000007), ([1000000000, 1000000000], 1000000007),
                  ([123456789, 987654321, 555555555], 1000000007), ([2, 3, 5, 7, 11], 1000000007)]
    for _ in range(150):
        prod_cases.append(([rnd.randint(1000000, 1000000000) for _ in range(rnd.randint(2, 10))], 1000000007))
    want = [ref_safe_product(*c) for c in prod_cases]
    for label, got in [("solution.py (safe_product)", run_py("solution.py", "safe_product", prod_cases)),
                       ("solution.ts (safeProduct)", run_ts("solution.ts", "safeProduct", prod_cases))]:
        bad = [(c, w, g) for c, w, g in zip(prod_cases, want, got) if w != g]
        print(f"  {label:28} {len(prod_cases) - len(bad)}/{len(prod_cases)} match model")
        if bad:
            fail(f"{label} failed on {len(bad)} cases: first {bad[:2]}")

    # 3. tree_height: every power of two and its neighbours up to 2^52, plus 1..70, 10^9, random
    h_cases = [(n,) for n in range(1, 71)] + [(10 ** 9,)]
    for k in range(1, 53):
        h_cases += [((1 << k) - 1,), (1 << k,), ((1 << k) + 1,)]
    h_cases += [(rnd.randint(1, 2 ** 50),) for _ in range(300)]
    want = [ref_tree_height(*c) for c in h_cases]
    for label, got in [("solution.py (tree_height)", run_py("solution.py", "tree_height", h_cases)),
                       ("solution.ts (treeHeight)", run_ts("solution.ts", "treeHeight", h_cases))]:
        bad = [(c, w, g) for c, w, g in zip(h_cases, want, got) if w != g]
        print(f"  {label:28} {len(h_cases) - len(bad)}/{len(h_cases)} match model")
        if bad:
            fail(f"{label} failed on {len(bad)} cases: first {bad[:3]}")

    # 4. euclid_gcd
    g_cases = [(0, 0), (0, 5), (5, 0), (1, 1), (252, 105), (105, 252), (1000, 2), (89, 55)]
    g_cases += [(rnd.randint(0, 10 ** 6), rnd.randint(0, 10 ** 6)) for _ in range(300)]
    want = [math.gcd(*c) for c in g_cases]
    for label, got in [("solution.py (euclid_gcd)", run_py("solution.py", "euclid_gcd", g_cases)),
                       ("solution.ts (euclidGcd)", run_ts("solution.ts", "euclidGcd", g_cases))]:
        bad = [(c, w, g) for c, w, g in zip(g_cases, want, got) if w != g]
        print(f"  {label:28} {len(g_cases) - len(bad)}/{len(g_cases)} match model")
        if bad:
            fail(f"{label} failed on {len(bad)} cases: first {bad[:3]}")

    # 5. mistakes fail where the page says, in both runtimes
    for label, got in [("mistake.py (prev_index)", run_py("mistake.py", "prev_index", [(0, 5), (0, 10)])),
                       ("mistake.ts (prevIndex)", run_ts("mistake.ts", "prevIndex", [(0, 5), (0, 10)]))]:
        if got != [-1, -1]:
            fail(f"{label} should return -1 at i = 0, got {got}")
        else:
            print(f"  {label:28} returned negative index {got} as expected")
    crit = [([999999900, 999999999], 1000000007)]
    exact = ref_safe_product(*crit[0])
    for label, got in [("mistake.py (safe_product)", run_py("mistake.py", "safe_product", crit)),
                       ("mistake.ts (safeProduct)", run_ts("mistake.ts", "safeProduct", crit))]:
        if got[0] == exact:
            fail(f"{label} unexpectedly computed the exact product {exact}")
        else:
            print(f"  {label:28} produced {got[0]} instead of {exact} as expected")
    # the mistakes must also still be right where they claim to be (a mistake that is wrong everywhere teaches nothing)
    easy = [(i, 5) for i in range(1, 5)]
    if run_py("mistake.py", "prev_index", easy) != [ref_prev_index(*c) for c in easy] or run_ts("mistake.ts", "prevIndex", easy) != [ref_prev_index(*c) for c in easy]:
        fail("mistake prev_index should be right for i >= 1")


def prose_checks(facts, P):
    D1, D2, D3, D4, D5, D6 = (P[k] for k in ("D1", "D2", "D3", "D4", "D5", "D6"))
    drills_ref = P["DRILLS"]
    n, mod = 10 ** 9, 10 ** 9 + 7

    # -- Drill 1 --
    levels = n.bit_length()
    if not (2 ** (levels - 1) - 1 < n <= 2 ** levels - 1):
        fail("a perfectly balanced tree of 10^9 keys does not have bit_length levels")
    sqrt_n, cbrt_n = round(math.sqrt(n)), round(n ** (1 / 3))
    if cbrt_n ** 3 != n:
        fail("the cube root of 10^9 is not 1,000")
    want_d1 = {"n": n, "levels": levels, "log2": math.log2(n), "log2of10": math.log2(10), "log2of1000": math.log2(1000), "sqrt": sqrt_n, "cbrt": cbrt_n}
    if D1 != want_d1:
        fail(f"D1 {D1} != {want_d1}")
    claim("A perfectly balanced binary search tree of 10⁹ keys has {} levels, so one lookup makes at most {} comparisons.", levels, levels)

    # -- Drill 2: real runtimes --
    py = subprocess.run([sys.executable, "-c", "print((0 - 1) % 5)"], capture_output=True, text=True, check=True).stdout.strip()
    nd = node_json(r"""
const arr = [10, 20, 30, 40, 50];
process.stdout.write(JSON.stringify({ js: (0 - 1) % 5, fixed: ((0 - 1) % 5 + 5) % 5, at: String(arr[(0 - 1) % 5]),
  seven: 7 % -5, maxv: Number.MAX_VALUE, safe: Number.MAX_SAFE_INTEGER }));
""")
    if int(py) != D2["py"] or nd["js"] != D2["js"] or nd["fixed"] != D2["fixed"]:
        fail(f"D2 disagrees: python {py}, node {nd['js']}/{nd['fixed']}, page {D2}")
    if nd["at"] != "undefined":
        fail("arr[-1] is not undefined in node")
    claim("why does (0 - 1) % 5 evaluate to {} instead of {}?", nd["js"], int(py))
    claim("and the {} comes from the array read, not from the remainder", nd["js"])
    claim("`(i - 1) % n` is {}, and an array read at {} gives `undefined`", nd["js"], nd["js"])
    if facts["d2_py"] != int(py) or facts["d2_js"] != nd["js"] or facts["d2_fixed"] != nd["fixed"]:
        fail("FACTS d2_* disagree with the real runtimes")
    if D2["i"] != 0 or D2["n"] != 5:
        fail("D2 inputs changed")

    # -- Drill 3: node doubles replayed with Python floats, against exact ints --
    a, b = 999999900, 999999999
    plain_node = node_json(f"process.stdout.write(JSON.stringify({{plain: ({a} * {b}) % {mod}}}))")["plain"]
    plain_py = int((float(a) * float(b)) % float(mod))
    big = a * b % mod
    if not (D3["plain"] == plain_node == plain_py) or D3["big"] != big or D3["diff"] != abs(plain_node - big):
        fail(f"D3 disagrees: page {D3['plain']}/{D3['big']}, node {plain_node}, python floats {plain_py}, exact {big}")
    want_max = (mod - 1) ** 2
    if D3["maxProduct"] != float(want_max) or D3["maxProductSci"] != sci(want_max, 3) or D3["safeMax"] != 2 ** 53 - 1 or nd["safe"] != 2 ** 53 - 1:
        fail("D3 max product or safe max disagrees")
    if want_max <= 2 ** 53:
        fail("two residues below 10^9 + 7 no longer exceed 2^53")
    claim("can reach about {}, past 2⁵³ ≈ {}", sci(want_max, 3), sci(2 ** 53, 2))
    if not 0.99 < want_max / 10 ** 18 < 1.01:
        fail("(10^9 + 6)^2 is not about 10^18")
    claim("still multiply to about {}.", pw10(10 ** 18))
    claim("The product is near {}, past", pw10(10 ** 18))
    claim('<b id="heroNum">{}</b>', len(drills_ref))

    # -- Drill 4 --
    f12 = math.factorial(12)
    want_d4 = {"n": 12, "perms": f12, "subsets": 4096, "seconds": f12 / 1e8, "dpStates": 2 ** 12 * 12, "subsets20": 2 ** 20}
    if D4 != want_d4:
        fail(f"D4 {D4} != {want_d4}")
    if f12 <= 10 ** 8 or 2 ** 20 > 10 ** 8:
        fail("the 12!/2^20 comparison against 10^8 does not hold")
    claim("A constraint near n ≤ 12 announces n! (12! = {:,} is already past 10⁸), and one near n ≤ 20 announces 2ⁿ (2²⁰ = {:,}).", f12, 2 ** 20)

    # -- Drill 5 --
    rows, g = euclid_rows(252, 105)
    if D5["rows"] != rows or D5["gcd"] != g or g != math.gcd(252, 105):
        fail("D5 Euclid rows disagree")
    common = prime_factors(252) & prime_factors(105)
    if D5["commonPrime"] != max(common):
        fail("D5 largest common prime disagrees")
    if rows[0]["r"] == g or max(common) == g:
        fail("a wrong Drill 5 choice equals the gcd")
    # the key's bound, scanned: a >= b > 0 takes at most 2*floor(log2 b) + 1 remainder steps
    for x in range(1, 1200):
        for y in range(1, x + 1):
            if len(euclid_rows(x, y)[0]) > 2 * (y.bit_length() - 1) + 1:
                fail(f"Euclid step bound fails at ({x}, {y})")
    for x in range(1, 500):
        for y in range(1, x + 1):
            r = [x, y]
            while r[-1]:
                r.append(r[-2] % r[-1])
            if any(2 * r[k + 2] >= r[k] for k in range(len(r) - 2)):
                fail("remainder two steps ahead is not less than half")

    # -- Drill 6 --
    marks = sieve_marks(10 ** 7)
    trial = 10 ** 5 * math.sqrt(10 ** 7)
    q_even = next(q for q in range(1, 10 ** 5) if q * math.sqrt(10 ** 7) >= marks)
    want_d6 = {"q": 10 ** 5, "n": 10 ** 7, "trial": trial, "trialSci": sci(Decimal(trial).to_integral_value(), 3), "trialSeconds": trial / 1e8, "marks": marks,
               "nlnln": 10 ** 7 * math.log(math.log(10 ** 7)), "bytes": 10 ** 7 + 1, "bitsetBytes": -(-(10 ** 7 + 1) // 8), "breakeven": q_even}
    if D6 != want_d6:
        fail(f"D6 {D6} != {want_d6}")
    claim("once q passes about {:,} worst-case queries (n near 10⁷), the sieve's {:,} marks are cheaper.", q_even, marks)
    if 10 ** 5 <= q_even:
        fail("q = 10^5 is not past the break-even")

    # -- stated figures in the quiz --
    claim("about {} MB", round((10 ** 7 + 1) / 1e6))
    claim("Infinity only appears near {}", sci(sys.float_info.max, 2))
    if nd["maxv"] != sys.float_info.max:
        fail("Number.MAX_VALUE != float max")
    claim("{} % -5 is {} in JavaScript", 7, nd["seven"])
    if nd["seven"] != 2 or -(7 % 5) == nd["seven"]:
        fail("the negate-if-either-negative rule does not differ from JavaScript on 7 % -5")

    # -- facts: every {{fact}} the reveals use --
    want_facts = {
        "d1_ans": levels, "d1_log2of10": f"{math.log2(10):.3f}", "d1_log2": f"{math.log2(n):.3f}", "d1_log2of1000": f"{math.log2(1000):.2f}",
        "d1_sqrt": fmt_int(sqrt_n), "d1_cbrt": fmt_int(cbrt_n),
        "d2_py": int(py), "d2_js": nd["js"], "d2_fixed": nd["fixed"],
        "d3_plain": fmt_int(plain_node), "d3_big": fmt_int(big), "d3_diff": fmt_int(abs(plain_node - big)), "d3_safe": fmt_int(2 ** 53 - 1),
        "d4_perms": fmt_int(f12), "d4_subsets": fmt_int(4096), "d4_seconds": f"{f12 / 1e8:.2f}", "d4_dp": fmt_int(2 ** 12 * 12),
        "d5_r1": f"{rows[0]['a']} mod {rows[0]['b']} = {rows[0]['r']} (quotient {rows[0]['q']})",
        "d5_r2": f"{rows[1]['a']} mod {rows[1]['b']} = {rows[1]['r']} (quotient {rows[1]['q']})",
        "d5_r3": f"{rows[2]['a']} mod {rows[2]['b']} = {rows[2]['r']} (quotient {rows[2]['q']})",
        "d5_gcd": g, "d5_steps": len(rows),
        "d6_trial_ops": sci(Decimal(trial).to_integral_value(), 3), "d6_trial_secs": f"{trial / 1e8:.2f}", "d6_sieve_ops": fmt_int(marks),
        "d6_nlnln": sci(Decimal(10 ** 7 * math.log(math.log(10 ** 7))), 3), "d6_bytes": fmt_int(10 ** 7 + 1), "d6_bitset": fmt_int(-(-(10 ** 7 + 1) // 8)),
    }
    for k, v in want_facts.items():
        if facts.get(k) != v:
            fail(f"FACTS.{k} {facts.get(k)!r} != {v!r}")
    if set(facts) != set(want_facts):
        fail(f"FACTS keys {sorted(set(facts) ^ set(want_facts))} are unchecked")
    used = set(re.findall(r"\{\{([a-zA-Z0-9_]+)\}\}", MD))
    if used - set(facts):
        fail(f"lesson.md uses facts that do not exist: {sorted(used - set(facts))}")
    if set(facts) - used:
        fail(f"FACTS never used in lesson.md: {sorted(set(facts) - used)}")

    # -- DRILLS strings rebuilt from the recomputed values --
    drills = P["DRILLS"]
    cs = fmt_int
    want_choices = [
        [f"About {cs(sqrt_n)}: the square root of n, as in trial division",
         f"About {levels}: ⌊log₂ n⌋ + 1, one check per halving of the cabinet",
         f"About {cs(cbrt_n)}: the cube root of n, one check per row of drawers"],
        [f"TypeScript: it returns {nd['js']} because JS % keeps the dividend's sign; Python returns {int(py)}",
         f"Python: it returns {nd['js']} because % keeps the dividend's sign; TypeScript returns {int(py)}",
         f"Neither: both return {int(py)}, because % always wraps into the range 0 to n - 1"],
        None,
        [f"Orderings number 12! = {cs(f12)}: a pruned permutation search or a bitmask DP is intended",
         f"Orderings number 2¹² = {cs(4096)}: enumerate the subsets, since n is small", None],
        [f"{rows[0]['r']}, the first remainder, 252 mod 105", f"{max(common)}, the largest prime that divides both numbers",
         f"{g}, the last non-zero remainder before one reaches 0"],
        [f"Sieve wins: {cs(marks)} marks once, then O(1) a query, against up to {sci(Decimal(trial).to_integral_value(), 3)} divisions", None, None],
    ]
    want_answer = [1, 0, 2, 0, 2, 0]
    for d, want_c, ans in zip(drills, want_choices, want_answer):
        if d["answer"] != ans:
            fail(f"drill {d['id']}: marked answer {d['answer']} != {ans}")
        if want_c:
            for got_c, w in zip(d["choices"], want_c):
                if w is not None and got_c != w:
                    fail(f"drill {d['id']} choice {got_c!r} != {w!r}")
        lens = [len(c) for c in d["choices"]]
        if max(lens) > 1.5 * min(lens):
            fail(f"drill {d['id']}: choice lengths {lens} differ by more than 1.5x")
        if d["expect"] != d["choices"][d["answer"]]:
            fail(f"drill {d['id']}: expect is not the marked choice")
    if len({d["answer"] for d in drills}) < 3:
        fail("the right choice sits in too few positions across the drills")
    wrong_marked = []  # a distractor equal to the right value would make two right answers
    if drills[4]["choices"][0].split(",")[0] == str(g) or drills[4]["choices"][1].split(",")[0] == str(g):
        wrong_marked.append("drill 5")
    if wrong_marked:
        fail(f"a distractor states the right gcd in {wrong_marked}")

    # -- sweep: every digit left is a stated input --
    inputs = [
        "10⁹ index cards", "slot 0", "size n = 5", "10⁵ numbers, each up to 10⁹", "modulo 10⁹ + 7", "n ≤ 12", "252 and 105", "q = 10⁵", "n ≤ 10⁷",
        "(252, 105)", "999,999,900 × 999,999,999 modulo 1,000,000,007", "(0 - 1) % 5", "i = 0 and n = 5", "1,000,000,000 keys", "10⁹ + 7", "10⁹",
        "10⁷", "10⁵", "10⁸", "2⁵³", "2⁵³ − 1", "2¹²", "1,000", "2⌊log₂ b⌋ + 1", "a ≥ b > 0", "2…10⁷", "(0 - 1) % 5", "-5", "√10⁷", 
        "n ln ln n", "log₂ 10⁹", "9 · log₂ 10", "⌊log₂ n⌋ + 1", "⌊log₂ 10⁹⌋ + 1", "√10⁹", "factor of 1,000", "log₂ 1,000", "(i - 1)", "≈ 9 ·", "12!", "2¹² · 12", "reaches 0", "producing 0", "Uint8Array", "2ⁿ", "64-bit", "branching factor of 2", 
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
    print("Testing math-drills...")
    code_checks()
    pure = run_pure()
    prose_checks(pure["FACTS"], pure)
    print("  PURE block data, FACTS, prose claims and quiz lengths verified")

    if os.path.exists(HTML):
        html_src = open(HTML, encoding="utf-8").read()
        if pure_block() not in html_src:
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
        print("ALL CHECKS PASSED: math-drills")


if __name__ == "__main__":
    main()
