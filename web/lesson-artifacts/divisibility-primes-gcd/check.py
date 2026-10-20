"""Holds the Divisibility, Primes & GCD page to the course standard: every count and fact verified.

Validates:
  * code/solution.* matches an independent model:
      - is_prime on 0..10,000 matches independent sieve
      - gcd on edge cases (0,0; 0,b; a,0) and 400 random pairs matches math.gcd
      - lcm on 400 positive pairs matches math.lcm
  * code/mistake.* fails on prime squares (4, 9, 25, 49, 121, 169) in both runtimes.
  * JS 64-bit float overflow: in node, multiplying first corrupts LCM for large a, b,
    while dividing first stays exact.
  * lesson.js PURE block matches Python's independent derivation of all FACTS, and every preset
    (factor pairs, sieve steps, Euclid tables, overflow demo) is rebuilt independently.
  * every number the prose states is tied to its text: PROSE_CLAIMS holds (sentence template, recomputed
    values) pairs, the sentence is rebuilt from the recomputed values and must appear in lesson.md, so
    changing either the prose or the maths fails; a sweep then fails on any digit in the prose that no
    claim and no stated input covers.
  * the derivation's lemma (x mod y < x/2) and step bound are scanned, not assumed.
  * quiz options are of similar length and the answer is not the longest.
  * built HTML embeds the exact PURE block.
"""
import json, math, os, random, re, subprocess, sys
from decimal import Decimal

HERE = os.path.dirname(os.path.abspath(__file__))
CODE = os.path.join(HERE, "code")
WEB = os.path.normpath(os.path.join(HERE, "..", ".."))
ESBUILD = os.path.join(WEB, "node_modules", ".bin", "esbuild")
HTML = os.path.join(WEB, "lesson-artifacts", "dist", "math-for-dsa", "divisibility-primes-gcd.html")
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
    """6227020800 -> '6.2 × 10⁹' (exact Decimal arithmetic, so no float rounding in the mantissa)."""
    m, e = format(Decimal(x), f".{digits - 1}E").split("E")
    return f"{m} × 10{sup(int(e))}"


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


# ---- Independent Python reference models ----
def ref_sieve(limit):
    is_p = [True] * (limit + 1)
    is_p[0] = is_p[1] = False
    for p in range(2, int(math.isqrt(limit)) + 1):
        if is_p[p]:
            for m in range(p * p, limit + 1, p):
                is_p[m] = False
    return is_p


REF_SIEVE_10K = ref_sieve(10000)


def ref_is_prime(n):
    if n < 0 or n >= len(REF_SIEVE_10K):
        if n < 2:
            return False
        for d in range(2, math.isqrt(n) + 1):
            if n % d == 0:
                return False
        return True
    return REF_SIEVE_10K[n]


def ref_gcd(a, b):
    return math.gcd(a, b)


def ref_lcm(a, b):
    return math.lcm(a, b)


# ---- Executing Python code ----
def run_py_is_prime(name, cases):
    ns = {}
    with open(os.path.join(CODE, name), encoding="utf-8") as f:
        exec(f.read(), ns)
    fn = ns["is_prime"]
    return [bool(fn(c)) for c in cases]


def run_py_gcd(name, cases):
    ns = {}
    with open(os.path.join(CODE, name), encoding="utf-8") as f:
        exec(f.read(), ns)
    fn = ns["gcd"]
    return [int(fn(a, b)) for a, b in cases]


def run_py_lcm(name, cases):
    ns = {}
    with open(os.path.join(CODE, name), encoding="utf-8") as f:
        exec(f.read(), ns)
    fn = ns["lcm"]
    return [int(fn(a, b)) for a, b in cases]


# ---- Executing TypeScript code via esbuild & node ----
def run_ts(file_name, mode, cases):
    src = open(os.path.join(CODE, file_name), encoding="utf-8").read()
    js = subprocess.run([ESBUILD, "--loader=ts", "--format=cjs"], input=src, capture_output=True, text=True, check=True).stdout
    driver = r"""
const CASES = JSON.parse(require('fs').readFileSync(0, 'utf8'));
const mode = process.env.TEST_MODE;
let out;
if (mode === 'is_prime') {
  out = CASES.map(n => Boolean(isPrime(n)));
} else if (mode === 'gcd') {
  out = CASES.map(([a, b]) => Number(gcd(a, b)));
} else if (mode === 'lcm') {
  out = CASES.map(([a, b]) => Number(lcm(a, b)));
}
process.stdout.write(JSON.stringify(out));
"""
    res = subprocess.run(["node", "-e", js + driver], input=json.dumps(cases), capture_output=True, text=True,
                         env={**os.environ, "TEST_MODE": mode})
    if res.returncode:
        raise SystemExit(f"{file_name} failed in node:\n" + res.stderr)
    return json.loads(res.stdout)


# ---- Pure block extraction and execution ----
def pure_block():
    js = open(os.path.join(HERE, "lesson.js"), encoding="utf-8").read()
    a = js.index("/* PURE:begin")
    b = js.index("/* PURE:end */") + len("/* PURE:end */")
    return js[a:b]


def run_pure():
    probe = pure_block() + r"""
process.stdout.write(JSON.stringify({
  FACTS: FACTS,
  FACTOR_PRESETS: FACTOR_PRESETS,
  SIEVE_50: SIEVE_50,
  EUCLID_PRESETS: EUCLID_PRESETS,
  OVERFLOW_DEMO: OVERFLOW_DEMO
}));
"""
    res = subprocess.run(["node", "-e", probe], capture_output=True, text=True)
    if res.returncode:
        raise SystemExit("lesson.js PURE block failed in node:\n" + res.stderr)
    return json.loads(res.stdout)


def divisor_pairs(n):
    return [(d, n // d) for d in range(1, math.isqrt(n) + 1) if n % d == 0]


def cartons(k):
    return "carton" if k == 1 else "cartons"


def books(k):
    return "book" if k == 1 else "books"


def euclid_steps(a, b):
    s = 0
    while b:
        a, b = b, a % b
        s += 1
    return s


def sub_steps(a, b):
    s = 0
    while a != b:
        s += 1
        if a > b:
            a -= b
        else:
            b -= a
    return s


def trial_divisions_total(limit):
    """Divisions a trial-division loop makes over 2..limit: a composite stops at its smallest prime
    factor p (divisions d = 2..p), a prime runs d = 2..isqrt(n). Checked against the real loop below."""
    spf = list(range(limit + 1))
    for p in range(2, math.isqrt(limit) + 1):
        if spf[p] == p:
            for m in range(p * p, limit + 1, p):
                if spf[m] == m:
                    spf[m] = p
    total = 0
    for n in range(2, limit + 1):
        total += (spf[n] - 1) if spf[n] != n else (math.isqrt(n) - 1)
    return total


def real_loop_divisions(n):
    c, d = 0, 2
    while d * d <= n:
        c += 1
        if n % d == 0:
            break
        d += 1
    return c


def sieve_marks(limit):
    """Marks the page's sieve makes (each p with p*p <= limit marks p*p, p*p+p, ...), counted by range length."""
    flags = bytearray([1]) * (limit + 1)
    flags[0] = flags[1] = 0
    marks = 0
    for p in range(2, math.isqrt(limit) + 1):
        if flags[p]:
            r = range(p * p, limit + 1, p)
            marks += len(r)
            flags[p * p::p] = bytes(len(r))
    return marks, sum(flags)


def sieve_marks_loop(limit):
    flags = [True] * (limit + 1)
    marks = 0
    p = 2
    while p * p <= limit:
        if flags[p]:
            m = p * p
            while m <= limit:
                marks += 1
                flags[m] = False
                m += p
        p += 1
    return marks


def node_json(js):
    res = subprocess.run(["node", "-e", js], capture_output=True, text=True)
    if res.returncode:
        raise SystemExit("node failed:\n" + res.stderr)
    return json.loads(res.stdout)


def prose_checks(facts, presets):
    """Numbers the lesson prints, recomputed here and tied to the sentence that prints them."""
    # -- 36 books --
    pairs36 = divisor_pairs(36)
    root36 = math.isqrt(36)
    claim("√{} = {}", 36, root36)
    small = [d for d, k in pairs36]
    if not all(d <= root36 for d in small) or any(d > root36 and 36 % d == 0 and 36 // d not in small for d in range(1, 37)):
        fail("a divisor of 36 above √36 has no partner at or below it")
    claim("Every divisor above {0} pairs with a small divisor below {0}.", root36)
    for d, k in pairs36:
        claim("{} {} of {} {} ⟷ {} {} of {} {}: pair ({}, {})", d, cartons(d), k, books(k), k, cartons(k), d, books(d), d, k)
    if MD.count(": pair (") != len(pairs36):
        fail(f"lesson.md lists {MD.count(': pair (')} factor pairs, 36 has {len(pairs36)}")
    claim("it never exceeds {}, and √36 = {}", max(small), root36)

    # -- the mistake misses exactly the squares of primes --
    sq_primes = [p * p for p in range(2, 40) if all(p % q for q in range(2, p))]
    claim("such as {}, and {}", ", ".join(str(v) for v in sq_primes[:3]), sq_primes[3])

    # -- trial division versus sieve over 2..10^6 --
    for n in range(2, 3000):
        if real_loop_divisions(n) != trial_divisions_total(n) - trial_divisions_total(n - 1):
            fail(f"trial-division formula disagrees with the real loop at n={n}")
            break
    tot6 = trial_divisions_total(10 ** 6)
    marks6, primes6 = sieve_marks(10 ** 6)
    if sieve_marks_loop(10 ** 5) != sieve_marks(10 ** 5)[0]:
        fail("sieve mark count by range length disagrees with the instrumented loop")
    claim("at most {} × {} = {} divisions", pw10(10 ** 6), pw10(math.isqrt(10 ** 6)), pw10(10 ** 6 * math.isqrt(10 ** 6)))
    claim("the total is {:,}, while a sieve over the same range makes {:,} marks", tot6, marks6)
    if facts["trialDiv1e6"] != f"{tot6:,}" or facts["sieveMarks1e6"] != f"{marks6:,}":
        fail("FACTS trialDiv1e6 / sieveMarks1e6 disagree with the recount")

    # -- Euclid versus subtraction --
    claim("For (1000, 2), repeated subtraction takes {} steps and Euclid's remainder takes {}.", sub_steps(1000, 2), euclid_steps(1000, 2))

    # -- doubles and the lcm demo --
    claim("The maximum safe integer is {:,} (2⁵³ − 1).", 2 ** 53 - 1)
    mant = sys.float_info.mant_dig
    claim("IEEE-754 doubles with {} significant bits", mant)
    node = node_json(r"""
const a = 300000003, b = 500000005;
const gcd = (x, y) => y ? gcd(y, x % y) : x;
const g = gcd(a, b);
process.stdout.write(JSON.stringify({
  safe: Number.MAX_SAFE_INTEGER, p53: 2 ** 53, plus1: 2 ** 53 + 1 === 2 ** 53,
  g, mulFirst: (a * b) / g, divFirst: (a / g) * b, isInt: Number.isInteger((a * b) / g), prod: a * b,
  mulStr: String((a * b) / g), exact: (BigInt(a) * BigInt(b) / BigInt(g)).toString()
}));
""")
    if node["safe"] != 2 ** 53 - 1 or not node["plus1"]:
        fail("node: Number.MAX_SAFE_INTEGER or 2^53 + 1 === 2^53 disagrees")
    oa, ob = 300000003, 500000005  # the demo's two inputs; stated on the page, everything else is recomputed
    lcm_true = math.lcm(oa, ob)
    claim("For a = {:,} and b = {:,} the lcm is {:,}, but the product is about {}", oa, ob, lcm_true, sci(oa * ob, 2))
    if node["isInt"] or node["mulStr"] == str(lcm_true):
        fail("node: (a * b) / gcd unexpectedly came out as the exact integer lcm")
    if node["divFirst"] != lcm_true:
        fail("node: (a / gcd) * b is not the exact lcm")
    claim("and the division returns a non-integer{}", ".")
    # Python float arithmetic is the same IEEE-754: an independent runtime for the multiply-first string
    py_mul = repr(float(oa) * float(ob) / float(math.gcd(oa, ob)))
    if py_mul != node["mulStr"]:
        fail(f"python float {py_mul} != node {node['mulStr']}")
    if oa * ob // math.gcd(oa, ob) != lcm_true:
        fail("python int a * b // g not exact")
    claim("so `a * b // g` is exact there{}", "; the trap is JavaScript's.")

    # -- notes --
    n12 = 10 ** 12
    claim("For n = {} that is at most {} divisions.", pw10(n12), pw10(math.isqrt(n12)))
    marks7, primes7 = sieve_marks(10 ** 7)
    claim("For n = {} it makes {:,} marks, finds {:,} primes, and the table holds {:,} flags.", pw10(10 ** 7), marks7, primes7, 10 ** 7 + 1)
    bits = (2 ** 64 - 1).bit_length() - 1
    claim("the bound above is 2 · {} + 1 = {} remainder steps", bits, 2 * bits + 1)

    # -- widget data: rebuilt independently --
    for pr in presets["FACTOR_PRESETS"]:
        n = pr["n"]
        want_pairs = [list(p) for p in divisor_pairs(n)]
        if pr["pairs"] != want_pairs or pr["sqrtFloor"] != math.isqrt(n):
            fail(f"factor preset {n}: pairs or floor sqrt disagree")
        if pr["trialsCount"] != max(0, math.isqrt(n) - 1) or pr["naiveCount"] != max(0, n - 2):
            fail(f"factor preset {n}: divisor-to-try counts disagree")
        if [t["d"] for t in pr["trials"]] != list(range(2, math.isqrt(n) + 1)) or [t["d"] for t in pr["trials"] if t["hit"]] != [d for d in range(2, math.isqrt(n) + 1) if n % d == 0]:
            fail(f"factor preset {n}: trial list disagrees")
        if pr["isPrime"] != (n > 1 and all(n % d for d in range(2, math.isqrt(n) + 1))):
            fail(f"factor preset {n}: primality disagrees")
    sv = presets["SIEVE_50"]
    marks50, primes50 = sieve_marks(50)
    want_steps = []
    flags = [True] * 51
    for p in range(2, math.isqrt(50) + 1):
        if flags[p]:
            ms = list(range(p * p, 51, p))
            for m in ms:
                flags[m] = False
            want_steps.append({"p": p, "mults": ms})
    if sv["steps"] != want_steps or sv["totalOps"] != marks50 or len(sv["primes"]) != primes50 or sv["limit"] != 50:
        fail("SIEVE_50 steps/marks/primes disagree with the independent sieve")
    for pr in presets["EUCLID_PRESETS"]:
        a, b = pr["a"], pr["b"]
        want_rows, x, y = [], a, b
        while y:
            want_rows.append({"a": x, "b": y, "q": x // y, "r": x % y})
            x, y = y, x % y
        if pr["modSteps"] != want_rows or pr["gcd"] != math.gcd(a, b) or pr["lcm"] != math.lcm(a, b):
            fail(f"Euclid preset ({a}, {b}) disagrees")
        if pr["modCount"] != euclid_steps(a, b) or pr["subCount"] != sub_steps(a, b):
            fail(f"Euclid preset ({a}, {b}): step counts disagree")
    od = presets["OVERFLOW_DEMO"]
    if (od["a"], od["b"], od["g"], od["trueLcm"], od["mulFirst"], od["divFirst"]) != (oa, ob, math.gcd(oa, ob), str(lcm_true), node["mulStr"], str(lcm_true)):
        fail("OVERFLOW_DEMO disagrees with node/Python")
    if od["productSci"] != sci(oa * ob, 2) or od["aOverG"] != oa // math.gcd(oa, ob) or od["mulFirstExact"] or not od["divFirstExact"]:
        fail("OVERFLOW_DEMO derived fields disagree")

    # -- the derivation: lemma and bound, scanned --
    for x in range(1, 900):
        for y in range(1, x + 1):
            if not (x % y < x / 2):
                fail(f"lemma x mod y < x/2 fails at ({x}, {y})")
    for x in range(1, 1500):
        for y in range(1, x + 1):
            if euclid_steps(x, y) > 2 * (y.bit_length() - 1) + 1:
                fail(f"step bound 2*floor(log2 b)+1 fails at ({x}, {y})")
    seq_ok = True
    for x in range(1, 400):
        for y in range(1, x + 1):
            r = [x, y]
            while r[-1]:
                r.append(r[-2] % r[-1])
            if any(r[k + 2] * 2 >= r[k] for k in range(len(r) - 2) if r[k + 1]):
                seq_ok = False
    if not seq_ok:
        fail("r[k+2] < r[k]/2 fails on the remainder sequence")

    # -- the quiz's gcd(48, 18) trace --
    rows, x, y = [], 48, 18
    while y:
        rows.append((x, y, x % y))
        x, y = y, x % y
    trace = ", ".join(f"{p} mod {q} = {r}" for p, q, r in rows)
    claim("{}, so gcd(48, 18) = {}", trace, x)
    claim("{}, so gcd(48, 18) = {}", trace, rows[-1][2])
    claim("{} mod {} = {}, so gcd(48, 18) = {} and no more steps are needed", rows[0][0], rows[0][1], rows[0][2], rows[0][2])
    if math.gcd(48, 18) in (rows[-1][2], rows[0][2]):
        fail("a wrong quiz option (0 or the first remainder) equals the real gcd")
    claim("which was the divisor of the final step ({}), not the {} it produced", rows[-1][1], rows[-1][2])

    # -- sweep: every digit left is a stated input --
    inputs = [
        "Take a delivery of 36 books.", "36 / d", "cartons of size d",
        "(1000, 2)",
        "a ≥ b > 0", "Let a ≥ b",
        "10⁶", "10⁷", "10¹²", "2⁵³", "2⁶⁴", "2…10⁷", "(2⁵³ − 1)", "gcd(48, 18)", "48 mod 18 = 12", "18 mod 12 = 6", "12 mod 6 = 0", "so gcd(48, 18) = 6", "so gcd(48, 18) = 0", "so gcd(48, 18) = 12",
        "d² ≤ n", "up to n − 1", "from 2 up to", "with 2 ≤ d ≤ √n", "not unique to 36", "Over 2…10⁶", "until the remainder is 0", "O(n log log n)", "O(√n)", "O(1)", "O(log b)", "O(log min(a, b))", "n/2", "pair (", "d·k",
        
    ]
    stale = [i for i in inputs if i not in MD]
    for i in stale:
        fail(f"stated-input allowance {i!r} no longer appears in lesson.md")
    left = uncovered_numbers([i for i in inputs if i in MD])
    if left:
        fail(f"numbers in lesson.md covered by no claim or stated input: {sorted(set(left))}")

    # -- quiz option lengths --
    quiz = json.loads(re.search(r"```quiz\n(.*?)\n```", MD, re.S).group(1))
    for qi, q in enumerate(quiz["questions"], 1):
        lens = [len(o) for o in q["options"]]
        if lens[q["answer"]] == max(lens) and lens.count(max(lens)) == 1:
            fail(f"quiz {qi}: the answer is the longest option {lens}")
        if max(lens) > 1.5 * min(lens):
            fail(f"quiz {qi}: option lengths {lens} differ by more than 1.5x")


def main():
    print("Testing divisibility-primes-gcd...")

    # 1. Test is_prime on 0..10,000
    prime_cases = list(range(10001))
    want_primes = [ref_is_prime(n) for n in prime_cases]

    for label, got in [("solution.py (is_prime)", run_py_is_prime("solution.py", prime_cases)),
                       ("solution.ts (isPrime)", run_ts("solution.ts", "is_prime", prime_cases))]:
        bad = [(n, w, g) for n, w, g in zip(prime_cases, want_primes, got) if w != g]
        print(f"  {label:25} {len(prime_cases) - len(bad)}/{len(prime_cases)} match model")
        if bad:
            fail(f"{label} failed on {len(bad)} cases: first {bad[:3]}")

    # 2. Test gcd and lcm on random pairs and edge cases
    rnd = random.Random(20261018)
    gcd_cases = [
        (0, 0), (0, 5), (5, 0), (1, 1), (1, 100), (7, 7), (48, 18), (252, 105), (1000, 2), (89, 55),
        (1000000000, 500000000), (123456, 7890)
    ]
    for _ in range(400):
        gcd_cases.append((rnd.randint(0, 1000000), rnd.randint(0, 1000000)))

    want_gcd = [ref_gcd(a, b) for a, b in gcd_cases]
    for label, got in [("solution.py (gcd)", run_py_gcd("solution.py", gcd_cases)),
                       ("solution.ts (gcd)", run_ts("solution.ts", "gcd", gcd_cases))]:
        bad = [(c, w, g) for c, w, g in zip(gcd_cases, want_gcd, got) if w != g]
        print(f"  {label:25} {len(gcd_cases) - len(bad)}/{len(gcd_cases)} match model")
        if bad:
            fail(f"{label} failed on {len(bad)} cases: first {bad[:3]}")

    lcm_cases = [(a, b) for a, b in gcd_cases if a > 0 and b > 0][:200]
    # pairs whose product passes 2^53 while the lcm stays below it: only divide-first is exact in JavaScript
    big_gcd = 100000001
    lcm_cases += [(k * big_gcd, l * big_gcd) for k, l in [(3, 5), (3, 11), (3, 13), (3, 23), (5, 7), (7, 9), (9, 13), (11, 13), (13, 19), (15, 17), (35, 37)]]
    if not all(a * b > 2 ** 53 and math.lcm(a, b) < 2 ** 53 for a, b in lcm_cases[-11:]):
        fail("the big-product lcm cases no longer have product > 2^53 > lcm")
    want_lcm = [ref_lcm(a, b) for a, b in lcm_cases]
    for label, got in [("solution.py (lcm)", run_py_lcm("solution.py", lcm_cases)),
                       ("solution.ts (lcm)", run_ts("solution.ts", "lcm", lcm_cases))]:
        bad = [(c, w, g) for c, w, g in zip(lcm_cases, want_lcm, got) if w != g]
        print(f"  {label:25} {len(lcm_cases) - len(bad)}/{len(lcm_cases)} match model")
        if bad:
            fail(f"{label} failed on {len(bad)} cases: first {bad[:3]}")

    # 3. Test mistake files: must fail on squares of primes
    prime_squares = [4, 9, 25, 49, 121, 169, 289, 361, 529, 841, 961]
    for label, got in [("mistake.py", run_py_is_prime("mistake.py", prime_squares)),
                       ("mistake.ts", run_ts("mistake.ts", "is_prime", prime_squares))]:
        wrong = sum(1 for g in got if g is True)  # mistakes report True for composite squares!
        print(f"  {label:25} incorrectly marked {wrong}/{len(prime_squares)} prime squares as prime (expected)")
        if wrong == 0:
            fail(f"{label} unexpectedly passed all prime squares!")

    # ...and it is wrong on exactly the squares of primes: nothing else, nothing missing (0..10,000)
    want_sq = {p * p for p in range(2, 101) if REF_SIEVE_10K[p]}
    for label, got in [("mistake.py", run_py_is_prime("mistake.py", prime_cases)),
                       ("mistake.ts", run_ts("mistake.ts", "is_prime", prime_cases))]:
        wrong_set = {n for n, w, g in zip(prime_cases, want_primes, got) if w != g}
        print(f"  {label:25} wrong on {len(wrong_set)} of 0..10,000: exactly the squares of primes = {wrong_set == want_sq}")
        if wrong_set != want_sq:
            fail(f"{label} is wrong on {sorted(wrong_set ^ want_sq)[:6]} beyond/short of the prime squares")

    # 5. PURE block validation against independent Python computations
    pure_data = run_pure()
    facts = pure_data["FACTS"]

    # Recompute sieve ops on 50
    py_sieve = ref_sieve(50)
    py_primes_50 = [i for i, is_p in enumerate(py_sieve) if is_p]
    py_sieve_ops = 0
    is_p_sim = [True] * 51
    is_p_sim[0] = is_p_sim[1] = False
    for p in range(2, int(math.isqrt(50)) + 1):
        if is_p_sim[p]:
            for m in range(p * p, 51, p):
                py_sieve_ops += 1
                is_p_sim[m] = False

    if facts["sieveOps50"] != py_sieve_ops:
        fail(f"sieveOps50 mismatch: got {facts['sieveOps50']}, want {py_sieve_ops}")
    if facts["primesCount50"] != len(py_primes_50):
        fail(f"primesCount50 mismatch: got {facts['primesCount50']}, want {len(py_primes_50)}")

    # Recompute Euclid steps
    def py_euclid_steps(a, b):
        steps = 0
        while b != 0:
            steps += 1
            a, b = b, a % b
        return steps

    def py_sub_steps(a, b):
        steps = 0
        while a != b and a > 0 and b > 0:
            steps += 1
            if a > b:
                a -= b
            else:
                b -= a
        return steps

    if facts["euclidSteps48_18"] != py_euclid_steps(48, 18):
        fail("euclidSteps48_18 mismatch")
    if facts["euclidSteps252_105"] != py_euclid_steps(252, 105):
        fail("euclidSteps252_105 mismatch")
    if facts["euclidSteps1000_2"] != py_euclid_steps(1000, 2):
        fail("euclidSteps1000_2 mismatch")
    if facts["subSteps1000_2"] != py_sub_steps(1000, 2):
        fail("subSteps1000_2 mismatch")

    print("  PURE block facts verified against independent Python math")

    prose_checks(facts, pure_data)
    print("  prose claims, widget data, derivation lemma and quiz lengths verified")

    # 6. Verify built HTML embeds the exact PURE block
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
        print("ALL CHECKS PASSED: divisibility-primes-gcd")


if __name__ == "__main__":
    main()
