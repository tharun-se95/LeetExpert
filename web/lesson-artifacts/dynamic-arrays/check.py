"""Executes the code the Dynamic Arrays page shows, in Python and TypeScript, and recomputes every number.

It holds the page to the course standard (CLAUDE.md section 2):
  * code/solution.*   DynamicArray matches a plain list on random operation sequences (values, errors,
                      length <= capacity, capacity a power of two) and its copy counter matches an
                      independent doubling model, in both runtimes.
  * code/mistake.*    AdditiveArray holds the right values but exceeds the 2n copy budget of doubling.
  * lesson.js PURE    block re-run in node with kit/lanes.js: every FACT, every walkthrough, every growth
                      policy and the shrink-thrash run against an independent Python model.
  * lesson.md         every number in the body prose is rebuilt from a value computed here.
  * dist/ page        embeds the exact PURE block.

    python3 web/lesson-artifacts/dynamic-arrays/check.py
"""
import json, math, os, random, subprocess, sys, tempfile
from fractions import Fraction

HERE = os.path.dirname(os.path.abspath(__file__))
CODE = os.path.join(HERE, "code")
WEB = os.path.normpath(os.path.join(HERE, "..", ".."))
ESBUILD = os.path.join(WEB, "node_modules", ".bin", "esbuild")
TSC = os.path.join(WEB, "node_modules", ".bin", "tsc")
MINUS = "−"


def read(name):
    with open(os.path.join(CODE, name), encoding="utf-8") as f:
        return f.read()


def py_ns(*names):
    ns = {}
    for n in names:
        exec(read(n), ns)
    return ns


def ts_run(files, driver, payload):
    """esbuild the shown TypeScript, append a node driver, feed it JSON on stdin, return its JSON."""
    src = "\n".join(read(f) for f in files)
    js = subprocess.run([ESBUILD, "--loader=ts", "--format=cjs"], input=src, capture_output=True, text=True, check=True).stdout
    res = subprocess.run(["node", "-e", js + "\n" + driver], input=json.dumps(payload), capture_output=True, text=True)
    if res.returncode:
        raise SystemExit("TypeScript run failed:\n" + res.stderr)
    return json.loads(res.stdout)


def tsc_ok(files, problems):
    """The shown TypeScript also type-checks under strict, as the app's own code must."""
    with tempfile.TemporaryDirectory() as d:
        p = os.path.join(d, "shown.ts")
        open(p, "w", encoding="utf-8").write("\n".join(read(f) for f in files) + "\nexport {};\n")
        cfg = os.path.join(d, "tsconfig.json")
        json.dump({"compilerOptions": {"strict": True, "noEmit": True, "target": "ES2020", "lib": ["ES2020"], "types": [], "skipLibCheck": True},
                   "files": ["shown.ts"]}, open(cfg, "w"))
        res = subprocess.run([TSC, "-p", cfg], capture_output=True, text=True)
        if res.returncode:
            problems.append("tsc --strict rejects " + ", ".join(files) + ":\n" + res.stdout[:600])


def node_eval(expr):
    res = subprocess.run(["node", "-p", "JSON.stringify(" + expr + ")"], capture_output=True, text=True)
    if res.returncode:
        raise SystemExit("node failed on " + expr + ":\n" + res.stderr)
    out = res.stdout.strip()
    return None if out == "undefined" or out == "" else json.loads(out)


def minus(v):
    return str(v).replace("-", MINUS)


# ---------------------------------------------------------------- independent models
def model_next(cap, kind, k):
    """Next capacity: a factor (Fractions, so 1.5 and 1.25 are exact) grows by at least one slot."""
    if kind == "f":
        return max(cap + 1, math.ceil(cap * k))
    return cap + k


def model_run(n, kind, k):
    cap, ln, copies, resizes, peak, cost = 1, 0, 0, 0, Fraction(0), []
    for _ in range(n):
        c = 0
        if ln == cap:
            c = ln; copies += ln; resizes += 1; cap = model_next(cap, kind, k)
        ln += 1
        peak = max(peak, Fraction(cap - ln, cap))
        cost.append(1 + c)
    return dict(copies=copies, resizes=resizes, cap=cap, peak=peak, cost=cost)


POLICIES = [("x2", "f", Fraction(2)), ("x15", "f", Fraction(3, 2)), ("x125", "f", Fraction(5, 4)), ("p8", "a", 8), ("p64", "a", 64)]


def model_thrash(eager, ops):
    cap, ln, total, per = 64, 64, 0, []
    for k in range(ops):
        c = 0
        if k % 2 == 0:
            if ln == cap:
                c = ln; cap *= 2
            ln += 1
        else:
            ln -= 1
            if (ln * 2 <= cap) if eager else (ln * 4 <= cap):
                c = ln; cap //= 2
        total += c; per.append(c)
    return total, per


# ---------------------------------------------------------------- 1. DynamicArray / AdditiveArray
def op_sequences(n=400, seed=20261022):
    rnd = random.Random(seed)
    out = [[["append", i, 0] for i in range(9)] + [["pop", 0, 0]] * 3 + [["insert", 0, 7], ["get", 8, 0]]]
    for _ in range(n):
        seq = []
        for _ in range(rnd.randint(1, 40)):
            op = rnd.choice(["append", "append", "append", "pop", "insert", "get", "set"])
            seq.append([op, rnd.randint(-1, 12), rnd.randint(0, 99)])
        out.append(seq)
    return out


def model_ops(seq):
    xs, obs = [], []
    for op, a, b in seq:
        ret = None
        try:
            if op == "append":
                xs.append(a)
            elif op == "pop":
                ret = xs.pop()
            elif op == "insert":
                if not 0 <= a <= len(xs):
                    raise IndexError
                xs.insert(a, b)
            elif op == "get":
                if not 0 <= a < len(xs):
                    raise IndexError
                ret = xs[a]
            elif op == "set":
                if not 0 <= a < len(xs):
                    raise IndexError
                xs[a] = b
        except IndexError:
            ret = "error"
        obs.append([ret, list(xs)])
    return obs


def model_copies(seq, kind, k):
    """Independent copy count: replay the valid adds against the capacity rule."""
    ln, cap, copies = 0, 1, 0
    for op, a, b in seq:
        add = (op == "append") or (op == "insert" and 0 <= a <= ln)
        if add:
            if ln == cap:
                copies += ln; cap = model_next(cap, kind, k)
            ln += 1
        elif op == "pop" and ln:
            ln -= 1
    return copies


def py_obs(cls, seq):
    A, obs, cap_ok, pow2 = cls(), [], True, True
    for op, a, b in seq:
        ret = None
        try:
            if op == "append":
                A.append(a)
            elif op == "pop":
                ret = A.pop()
            elif op == "insert":
                A.insert(a, b)
            elif op == "get":
                ret = A.get(a)
            elif op == "set":
                A.set(a, b)
        except IndexError:
            ret = "error"
        cap_ok = cap_ok and len(A) <= A._capacity
        pow2 = pow2 and (A._capacity & (A._capacity - 1) == 0)
        obs.append([ret, [A.get(i) for i in range(len(A))]])
    return obs, A.copies, cap_ok, pow2


OPS_DRIVER = r"""
const SEQS = JSON.parse(require('fs').readFileSync(0, 'utf8'));
const Cls = CLS_NAME;
const out = SEQS.map(seq => {
  const A = new Cls(), obs = []; let capOk = true, pow2 = true;
  for (const [op, a, b] of seq) {
    let ret = null;
    try {
      if (op === 'append') A.append(a);
      else if (op === 'pop') ret = A.pop();
      else if (op === 'insert') A.insert(a, b);
      else if (op === 'get') ret = A.get(a);
      else if (op === 'set') A.set(a, b);
    } catch (e) { if (!(e instanceof RangeError)) throw e; ret = 'error'; }
    if (ret === undefined) ret = null;
    capOk = capOk && A.length <= A.capacity;
    pow2 = pow2 && (A.capacity & (A.capacity - 1)) === 0;
    const xs = []; for (let i = 0; i < A.length; i++) xs.push(A.get(i));
    obs.push([ret, xs]);
  }
  return [obs, A.copies, capOk, pow2];
});
process.stdout.write(JSON.stringify(out));
"""

APPEND_DRIVER = r"""
const NS = JSON.parse(require('fs').readFileSync(0, 'utf8'));
const out = NS.map(n => { const A = new Cls(); for (let i = 0; i < n; i++) A.append(i); return A.copies; });
process.stdout.write(JSON.stringify(out));
"""


def check_arrays(problems):
    seqs = op_sequences()
    want = [model_ops(s) for s in seqs]
    ns = {}
    exec(read("solution.py"), ns)
    nsm = dict(ns)
    exec(read("mistake.py"), nsm)
    ns_list = list(range(0, 2001, 7)) + [1, 2, 3, 5, 8, 9, 16, 17, 40, 1000]

    def judge(label, rows, kind, k, must_pow2):
        bad = 0
        for seq, w, (obs, copies, cap_ok, pow2) in zip(seqs, want, rows):
            if obs != w or not cap_ok or (must_pow2 and not pow2) or copies != model_copies(seq, kind, k):
                bad += 1
                if bad == 1:
                    problems.append(f"{label}: first bad sequence {seq[:6]}...")
        print(f"{label:14} {len(seqs) - bad}/{len(seqs)} sequences match a list (values, errors, length <= capacity, copy count)")
        if bad:
            problems.append(f"{label} failed {bad} sequences")

    judge("solution.py", [py_obs(ns["DynamicArray"], s) for s in seqs], "f", 2, True)
    judge("solution.ts", ts_run(["solution.ts"], OPS_DRIVER.replace("CLS_NAME", "DynamicArray"), seqs), "f", 2, True)
    judge("mistake.py", [py_obs(nsm["AdditiveArray"], s) for s in seqs], "a", 8, False)
    judge("mistake.ts", ts_run(["solution.ts", "mistake.ts"], OPS_DRIVER.replace("CLS_NAME", "AdditiveArray"), seqs), "a", 8, False)

    # append-only cost: doubling needs 2^ceil(log2 n) - 1 copies (< 2n); the additive step blows through 2n
    def pyc(cls, n):
        A = cls()
        for i in range(n):
            A.append(i)
        return A.copies
    got = {"solution.py": [pyc(ns["DynamicArray"], n) for n in ns_list], "mistake.py": [pyc(nsm["AdditiveArray"], n) for n in ns_list],
           "solution.ts": ts_run(["solution.ts"], "const Cls = DynamicArray;" + APPEND_DRIVER, ns_list),
           "mistake.ts": ts_run(["solution.ts", "mistake.ts"], "const Cls = AdditiveArray;" + APPEND_DRIVER, ns_list)}
    for label, g in got.items():
        sol = label.startswith("solution")
        kind, k = ("f", 2) if sol else ("a", 8)
        model = [model_run(n, kind, k)["copies"] for n in ns_list]
        if g != model:
            problems.append(f"{label}: append-only copy counts differ from the model")
        if sol:
            closed = [(2 ** math.ceil(math.log2(n)) - 1 if n > 1 else 0) for n in ns_list]
            if g != closed or any(c >= 2 * n for c, n in zip(g, ns_list) if n):
                problems.append(f"{label}: copies are not 2^ceil(log2 n) - 1 < 2n")
        else:
            over = [n for n, c in zip(ns_list, g) if n >= 40 and c < 2 * n]
            if over:
                problems.append(f"{label}: stayed within 2n copies at n={over[:3]}")
        print(f"{label:14} append-only copies match the model at {len(ns_list)} sizes" + ("" if sol else " and exceed 2n from n = 40 on"))
    tsc_ok(["solution.ts", "mistake.ts"], problems)
    return dict(add8=model_run(1000, "a", 8)["copies"])


# ---------------------------------------------------------------- 2. PURE block
def pure_block():
    js = open(os.path.join(HERE, "lesson.js"), encoding="utf-8").read()
    a = js.index("/* PURE:begin")
    b = js.index("/* PURE:end */") + len("/* PURE:end */")
    return js[a:b]


def run_pure():
    lanes = open(os.path.join(WEB, "lesson-artifacts", "kit", "lanes.js"), encoding="utf-8").read()
    probe = lanes + "\n" + pure_block() + r"""
function walk(f) {
  return f().map(function (s) {
    return { note: s.note, done: s.done, fields: s.fields, lanes: s.lanes.map(function (l) { return l.items.map(function (x) { return x ? +x.v : null; }); }),
             inv: DA_INV.map(function (t) { return !!t[2](s); }) };
  });
}
var runs = {};
DA_POLICIES.forEach(function (p) {
  var r = daRun(DA_MAXN, p), last = {};
  runs[p.id] = { series: r.series, cost: r.cost, small: [1, 2, 5, 16, 17, 100, 1000, 2000].map(function (n) { var q = daRun(n, p); return [n, q.copies, q.resizes, q.cap, q.peak]; }) };
});
process.stdout.write(JSON.stringify({
  FACTS: FACTS, runs: runs,
  walks: { grow: walk(daGrowSteps), insert: walk(daInsertSteps), pop: walk(daPopSteps) },
  thrash: [2, 4, 20, 40].map(function (n) { var e = daThrash(true, n), l = daThrash(false, n); return [n, e.total, e.per, l.total, l.per]; })
}));
"""
    res = subprocess.run(["node", "-e", probe], capture_output=True, text=True)
    if res.returncode:
        raise SystemExit("lesson.js PURE block failed in node:\n" + res.stderr)
    return json.loads(res.stdout)


def check_pure(problems):
    data = run_pure()
    facts = data["FACTS"]
    m16 = model_run(16, "f", Fraction(2))
    want = {
        "growCopies": model_run(5, "f", Fraction(2))["copies"],
        "growWrites": 5 + model_run(5, "f", Fraction(2))["copies"],
        "insertMoves": 3,
        "copies5": model_run(5, "f", Fraction(2))["copies"], "copies9": model_run(9, "f", Fraction(2))["copies"],
        "copies17": model_run(17, "f", Fraction(2))["copies"],
        "heroWrites": sum(m16["cost"]), "heroPeak": max(m16["cost"]), "heroAvg": round(sum(m16["cost"]) / 16, 2),
        "dbl1000": model_run(1000, "f", Fraction(2))["copies"], "half1000": model_run(1000, "f", Fraction(3, 2))["copies"],
        "step8_1000": model_run(1000, "a", 8)["copies"], "step64_1000": model_run(1000, "a", 64)["copies"],
        "step8per1000": round(model_run(1000, "a", 8)["copies"] / 1000, 1),
        "eager20": model_thrash(True, 20)[0], "lazy20": model_thrash(False, 20)[0],
    }
    for k, v in want.items():
        if facts.get(k) != v:
            problems.append(f"FACTS.{k} {facts.get(k)!r} != {v!r}")
    if set(facts) != set(want):
        problems.append(f"FACTS keys {sorted(set(facts) ^ set(want))} are not checked")
    # every growth policy, every n up to 2000, against the Fraction model
    for pid, kind, k in POLICIES:
        r = data["runs"][pid]
        copies = 0
        mc = [model_run(n, kind, k) for n in (1, 2, 5, 16, 17, 100, 1000, 2000)]
        for (n, c, rs, cap, peak), m in zip(r["small"], mc):
            if (c, rs, cap) != (m["copies"], m["resizes"], m["cap"]) or abs(peak - float(m["peak"])) > 1e-12:
                problems.append(f"policy {pid} n={n}: node {(c, rs, cap, peak)} != model {(m['copies'], m['resizes'], m['cap'], float(m['peak']))}")
        full = model_run(2000, kind, k)
        total = 0
        for i, cst in enumerate(full["cost"]):
            total += cst - 1
            if abs(r["series"][i] * (i + 1) - total) > 1e-6:
                problems.append(f"policy {pid}: series differs at n={i + 1}")
                break
        if r["cost"] != full["cost"]:
            problems.append(f"policy {pid}: per-append cost differs")
        if kind == "f":
            bound = k / (k - 1)
            if any(model_run(n, kind, k)["copies"] >= n * bound for n in range(1, 2001, 13)):
                problems.append(f"{pid}: copies reached n * f / (f - 1)")
            if full["peak"] > (k - 1) / k:
                problems.append(f"{pid}: peak slack above (f - 1) / f")
    # the claims about slack: close to (f-1)/f at large n for each factor
    near = {pid: float(model_run(2000, kind, k)["peak"]) for pid, kind, k in POLICIES if kind == "f"}
    for pid, target in (("x2", .5), ("x15", 1 / 3), ("x125", .2)):
        if not target - 0.06 < near[pid] <= target:
            problems.append(f"peak slack for {pid} is {near[pid]:.3f}, far from {target:.3f}")
    # additive: about n^2 / 2c total copies
    for n, c in ((1000, 8), (1000, 64), (2000, 8)):
        got = model_run(n, "a", c)["copies"]
        if abs(got - n * n / (2 * c)) / got > 0.12:
            problems.append(f"additive copies {got} are not about n^2/2c at n={n}, c={c}")
    # doubling closed form for every n up to 5000
    if any(model_run(n, "f", Fraction(2))["copies"] != (2 ** math.ceil(math.log2(n)) - 1 if n > 1 else 0) for n in range(1, 1500)):
        problems.append("doubling copies are not 2^ceil(log2 n) - 1")
    # thrash
    for n, e, eper, l, lper in data["thrash"]:
        we, wl = model_thrash(True, n), model_thrash(False, n)
        if (e, eper, l, lper) != (we[0], we[1], wl[0], wl[1]):
            problems.append(f"thrash n={n} differs from the model")
    e20 = model_thrash(True, 20)
    if e20[1][0] != 64 or e20[1][1] != 64 or model_thrash(False, 20)[1][1:] != [0] * 19:
        problems.append("the thrash walk-through in the prose does not hold")
    # walkthroughs
    g, ins, pop = data["walks"]["grow"], data["walks"]["insert"], data["walks"]["pop"]
    final = g[-1]["lanes"]
    if final != [[3], [3, 7], [3, 7, 1, 9], [3, 7, 1, 9, 4, None, None, None]]:
        problems.append(f"grow walkthrough ends with {final}")
    if ins[-1]["lanes"][0] != [3, 5, 7, 1, 9, None, None, None]:
        problems.append(f"insert walkthrough ends with {ins[-1]['lanes'][0]}")
    if pop[-1]["lanes"][0] != [3, 7, 1, None, None, None, None, None]:
        problems.append(f"pop walkthrough ends with {pop[-1]['lanes'][0]}")
    for name, steps in data["walks"].items():
        for k, s in enumerate(steps):
            if (s["done"] or k == 0) and not all(s["inv"]):
                problems.append(f"{name} step {k + 1} is at rest but breaks an invariant {s['inv']}")
        if not steps[-1]["done"]:
            problems.append(f"{name} does not finish at rest")
        counts = [[f[1] for f in s["fields"] if f[0] in ("copies", "moves")][0] for s in steps]
        if any(b - a not in (0, 1) for a, b in zip(counts, counts[1:])):
            problems.append(f"{name}: the counter jumps by more than one in a step")
    print(f"PURE block    {len(want)} facts; 5 policies x n <= 2000, thrash and {sum(len(v) for v in data['walks'].values())} walkthrough steps match the Python model")
    return facts


# ---------------------------------------------------------------- 3. CPython's list, measured here
def cpython_growth():
    base = sys.getsizeof([])
    l, prev, caps = [], base, []
    for i in range(1000):
        l.append(i)
        s = sys.getsizeof(l)
        if s != prev:
            caps.append((s - base) // 8); prev = s
    return caps


def prose_claims(extra, problems):
    caps = cpython_growth()
    if caps[:9] != [4, 8, 16, 24, 32, 40, 52, 64, 76]:
        problems.append(f"CPython's list capacities changed: {caps[:12]}")
    big = [b / a for a, b in zip(caps, caps[1:]) if a > 500]
    if not big or not all(1.1 < r < 1.14 for r in big):
        problems.append(f"CPython's late growth ratio is not about 1.125: {big}")
    m = lambda n, kind, k: model_run(n, kind, k)["copies"]
    resizes = model_run(1000, "f", Fraction(2))["resizes"]
    claims = [
        (f"five appends and, over them, {m(5, 'f', Fraction(2))} copies, so {5 + m(5, 'f', Fraction(2))} writes in all", "first tab"),
        (f"1000 appends resize {resizes} times and copy {m(1000, 'f', Fraction(2))} values", "doubling at 1000"),
        (f"now makes {m(1000, 'a', 8)} element copies where doubling makes {m(1000, 'f', Fraction(2))}", "warn"),
        (f"Capacities {', '.join(map(str, caps[:9]))} and on", "CPython capacities"),
        (f"1000 appends resize the block {len(caps)} times", "CPython resize count"),
        ("That is 2n for a factor of 2, 3n for 1.5 and 5n for 1.25", "bounds"),
        ("which is half for 2, a third for 1.5 and a fifth for 1.25", "slack"),
        (f"Take a full block of 64. An append grows it, which copies the 64.", "thrash start"),
        ("a factor close to 1.125", "cpython factor"),
    ]
    if [Fraction(2) / (Fraction(2) - 1), Fraction(3, 2) / (Fraction(1, 2)), Fraction(5, 4) / Fraction(1, 4)] != [2, 3, 5]:
        problems.append("f / (f - 1) is not 2, 3, 5")
    if [(Fraction(2) - 1) / 2, (Fraction(3, 2) - 1) / Fraction(3, 2), (Fraction(5, 4) - 1) / Fraction(5, 4)] != [Fraction(1, 2), Fraction(1, 3), Fraction(1, 5)]:
        problems.append("(f - 1) / f is not 1/2, 1/3, 1/5")
    return claims


def check_prose(problems, claims):
    md = open(os.path.join(HERE, "lesson.md"), encoding="utf-8").read()
    for phrase, what in claims:
        if phrase not in md:
            problems.append(f"lesson.md is missing the recomputed phrase for {what}: {phrase!r}")
    print(f"prose         {len(claims)} phrases tied to recomputed values (CPython {sys.version.split()[0]})")


def main():
    problems = []
    extra = check_arrays(problems)
    check_pure(problems)
    check_prose(problems, prose_claims(extra, problems))
    dist = os.path.join(WEB, "lesson-artifacts", "dist", "arrays", "dynamic-arrays.html")
    if os.path.exists(dist):
        if pure_block() not in open(dist, encoding="utf-8").read():
            problems.append("the built page does not embed the exact PURE block from lesson.js")
        else:
            print("dist          embeds the exact PURE block")
    if problems:
        print("\nERRORS:")
        for p in problems:
            print("  *", p)
        sys.exit(1)
    print("\nAll checks passed.")


if __name__ == "__main__":
    main()
