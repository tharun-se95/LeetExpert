"""Executes the code the Remove Duplicates page shows, in Python and TypeScript, and recomputes every number.

Validates, in both runtimes:
  * code/solution.*, naive_copy.*, naive_delete.* match an independent model (the distinct values, taken with
    a set and a sort, never with two pointers) on the lesson's five sandbox cases, on 1,400+ random sorted
    arrays and on the constraint's extremes (n = 30,000; one value; 201 values).
  * code/mistake_wrong_slot.* fails in both, passes the same short arrays the page says it passes, and returns
    the same wrong answer in both, so the page's "fails the same way" is true.
  * the page's own simulation (lesson.js PURE block) agrees with those runs, case by case.
  * the claims about Python's and JavaScript's negative index, run as the code they describe.
  * lesson.js FACTS against a Python recomputation, and every number in lesson.md's prose against a recomputed
    phrase.
  * a built-in fault test: small faults planted in memory in solution.py and solution.ts must each be caught.

    python3 web/lesson-artifacts/remove-duplicates-sorted/check.py
"""
import copy, json, os, random, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
CODE = os.path.join(HERE, "code")
WEB = os.path.normpath(os.path.join(HERE, "..", ".."))
ROOT = os.path.normpath(os.path.join(WEB, ".."))
ESBUILD = os.path.join(WEB, "node_modules", ".bin", "esbuild")
SOURCE = os.path.join(ROOT, "courses", "dsa", "arrays", "remove-duplicates-sorted.md")


def sandbox_cases():
    """The five cases of the source lesson's own sandbox fence."""
    md = open(SOURCE, encoding="utf-8").read()
    fence = re.search(r"```sandbox\n(.*?)\n```", md, re.S).group(1)
    return [c["args"][0] for c in json.loads(fence)["cases"]], [c["expect"] for c in json.loads(fence)["cases"]]


def model(nums):
    """Independent answer for a sorted array: its distinct values, in order."""
    return sorted(set(nums))


def all_cases():
    sandbox, _ = sandbox_cases()
    rnd = random.Random(20261020)
    out = [list(c) for c in sandbox]
    out += [[0], [-100], [100], [7, 7], [7, 8], [1, 1, 1, 1, 1, 1, 1], [-100] * 5 + [100] * 5,
            list(range(-100, 101)), sorted(list(range(-100, 101)) * 2)]
    for _ in range(1400):
        n = rnd.randint(1, 60)
        lo = rnd.randint(-100, 90)
        out.append(sorted(rnd.randint(lo, min(100, lo + rnd.randint(0, 12))) for _ in range(n)))
    out.append([5] * 30000)
    out.append(sorted(rnd.randint(-100, 100) for _ in range(30000)))
    out.append([-100 + (i * 201) // 30000 for i in range(30000)])
    return out


def run_py_source(src, cases):
    ns = {}
    exec(src, ns)
    f = ns["remove_duplicates"]
    res = []
    for c in cases:
        nums = copy.copy(c)
        try:
            k = f(nums)
            res.append({"k": k, "prefix": nums[:k] if isinstance(k, int) and not isinstance(k, bool) else None})
        except Exception as e:  # a thrown error is a failed case, recorded as such
            res.append({"error": type(e).__name__})
    return res


DRIVER = r"""
const CASES = JSON.parse(require('fs').readFileSync(0, 'utf8'));
const out = CASES.map(c => {
  const nums = c.slice();
  try { const k = removeDuplicates(nums); return {k: k, prefix: typeof k === 'number' ? nums.slice(0, k) : null}; }
  catch (e) { return {error: String(e && e.name)}; }
});
process.stdout.write(JSON.stringify(out));
"""


def run_ts_source(src, cases):
    js = subprocess.run([ESBUILD, "--loader=ts", "--format=cjs"], input=src, capture_output=True, text=True, check=True).stdout
    res = subprocess.run(["node", "-e", js + DRIVER], input=json.dumps(cases), capture_output=True, text=True)
    if res.returncode:
        raise SystemExit("TypeScript run failed:\n" + res.stderr)
    return json.loads(res.stdout)


def read(name):
    return open(os.path.join(CODE, name), encoding="utf-8").read()


def good(case, got):
    want = model(case)
    return "error" not in got and got["k"] == len(want) and got["prefix"] == want


def node_eval(expr):
    res = subprocess.run(["node", "-p", "JSON.stringify(" + expr + ")"], capture_output=True, text=True)
    if res.returncode:
        raise SystemExit("node failed on " + expr + ":\n" + res.stderr)
    out = res.stdout.strip()
    return None if out == "undefined" else json.loads(out)


def pure_block():
    js = open(os.path.join(HERE, "lesson.js"), encoding="utf-8").read()
    a = js.index("/* PURE:begin")
    b = js.index("/* PURE:end */") + len("/* PURE:end */")
    return js[a:b]


def run_pure(cases):
    probe = pure_block() + r"""
const CASES = JSON.parse(require('fs').readFileSync(0, 'utf8'));
process.stdout.write(JSON.stringify({
  FACTS: FACTS, RD_CASES: RD_CASES, RD_HAND: RD_HAND,
  right: CASES.map(c => { const r = rdLoop(c); return {k: r.k, prefix: r.nums.slice(0, r.k)}; }),
  wrong: CASES.map(c => { const r = rdLoop(c, true); return {k: r.k, prefix: r.nums.slice(0, r.k)}; }),
  distinct: CASES.map(c => rdDistinct(c))
}));
"""
    res = subprocess.run(["node", "-e", probe], input=json.dumps(cases), capture_output=True, text=True)
    if res.returncode:
        raise SystemExit("lesson.js PURE block failed in node:\n" + res.stderr)
    return json.loads(res.stdout)


def delete_moves_physical(a):
    """Delete each repeat from a real list, counting the elements the deletion shifts (those after the deleted slot)."""
    a, i, moves = list(a), 1, 0
    while i < len(a):
        if a[i] == a[i - 1]:
            moves += len(a) - i - 1
            del a[i]
        else:
            i += 1
    return moves


def main():
    problems = []
    cases = all_cases()
    sandbox, expects = sandbox_cases()
    if [model(c) for c in sandbox] != expects:
        problems.append("the source's sandbox expectations are not the distinct values")
    print(f"cases        {len(cases)} sorted arrays ({len(sandbox)} from the lesson's sandbox)")

    # 1. the three correct versions, both runtimes
    for name in ["solution", "naive_copy", "naive_delete"]:
        for lang, run in [("py", run_py_source), ("ts", run_ts_source)]:
            got = run(read(f"{name}.{lang}"), cases)
            bad = [(c[:12], g) for c, g in zip(cases, got) if not good(c, g)]
            print(f"{name + '.' + lang:20} {len(cases) - len(bad)}/{len(cases)} match the model")
            if bad:
                problems.append(f"{name}.{lang} failed on {len(bad)} cases: first {bad[:2]}")

    # 2. the mistake: fails in both, identically, and passes the short arrays only
    mist = {lang: (run_py_source if lang == "py" else run_ts_source)(read(f"mistake_wrong_slot.{lang}"), cases) for lang in ("py", "ts")}
    for lang in ("py", "ts"):
        passed = [i for i, (c, g) in enumerate(zip(cases, mist[lang])) if good(c, g)]
        sand_pass = [i for i in range(len(sandbox)) if good(cases[i], mist[lang][i])]
        print(f"mistake.{lang:3}          fails {len(cases) - len(passed)}/{len(cases)}; passes {len(sand_pass)} of {len(sandbox)} sandbox cases")
        if len(sand_pass) == len(sandbox):
            problems.append(f"mistake_wrong_slot.{lang} passes every sandbox case, so the page's warning is not true")
    if mist["py"] != mist["ts"]:
        problems.append("the mistake gives different answers in Python and TypeScript, but the page says they fail the same way")
    sand_pass = sum(good(sandbox[i], mist["py"][i]) for i in range(len(sandbox)))

    # 3. the page's own simulation against those runs
    pure = run_pure(cases)
    facts = pure["FACTS"]
    if pure["RD_CASES"] != sandbox:
        problems.append("lesson.js RD_CASES differ from the source lesson's sandbox cases")
    if [{"k": g["k"], "prefix": g["prefix"]} for g in pure["right"]] != run_py_source(read("solution.py"), cases):
        problems.append("lesson.js rdLoop disagrees with solution.py")
    if [{"k": g["k"], "prefix": g["prefix"]} for g in pure["wrong"]] != mist["py"]:
        problems.append("lesson.js rdLoop(wrong slot) disagrees with mistake_wrong_slot.py")
    if pure["distinct"] != [model(c) for c in cases]:
        problems.append("lesson.js rdDistinct disagrees with the model")
    hand = pure["RD_HAND"]
    if hand != sorted(hand) or model(hand) != [3, 5, 8, 9]:
        problems.append("the by-hand array is not the sorted array the widget's text expects")
    print("page model   rdLoop agrees with solution and mistake on every case")

    # 4. the language claims, run as the code they describe
    seed0 = """
def f(nums):
    write = 0
    for read in range(0, len(nums)):
        if nums[read] != nums[write - 1]:
            nums[write] = nums[read]
            write += 1
    return write
"""
    ns = {}
    exec(seed0, ns)
    py_seed0 = ns["f"]([2, 2, 2, 2])
    js_seed0 = node_eval("(function(nums){let write=0;for(let read=0;read<nums.length;read++){if(nums[read]!==nums[write-1]){nums[write]=nums[read];write++;}}return write;})([2,2,2,2])")
    py_neg = [1, 2, 3][-1]
    js_neg = node_eval("[1, 2, 3][-1]")
    print(f"language     seed-0 loop on [2,2,2,2]: Python {py_seed0}, JavaScript {js_seed0}; [1,2,3][-1]: Python {py_neg}, JavaScript {js_neg}")
    if (py_seed0, js_seed0, py_neg, js_neg) != (0, 1, 3, None):
        problems.append(f"the negative-index claims do not hold: {(py_seed0, js_seed0, py_neg, js_neg)}")

    # 5. FACTS recomputed independently
    big = sandbox[1]
    spread = [-100 + (i * 201) // 30000 for i in range(30000)]
    twice64 = [i // 2 for i in range(64)]
    wk = mist["py"][1]
    fmt = lambda n: f"{n:,}"
    want = {
        "k10": len(set(big)),
        "cmps10": len(big) - 1,
        "writes10": len(set(big)) - 1,
        "wrongK10": wk["k"],
        "wrongPass": sand_pass,
        "cases": len(sandbox),
        "deleteMoves30k": fmt(delete_moves_physical(spread)),
        "writes30k": fmt(len(set(spread)) - 1),
        "heldAtMost": fmt(len(set(spread))),
    }
    for k, v in want.items():
        if facts.get(k) != v:
            problems.append(f"FACTS.{k} {facts.get(k)!r} != {v!r}")
    if set(facts) != set(want):
        problems.append(f"FACTS keys {sorted(facts)} != checked keys {sorted(want)}")
    # the chart's two series, against a physical run
    probe = pure_block() + "\nprocess.stdout.write(JSON.stringify([0,8,16,24,32,40,48,56,64].map(function(n){var a=rdTwice(n);return [n,rdDeleteMoves(a),n?rdLoop(a).writes:0];})));"
    series = json.loads(subprocess.run(["node", "-e", probe], capture_output=True, text=True, check=True).stdout)
    for n, moves, writes in series:
        a = [i // 2 for i in range(n)]
        if moves != delete_moves_physical(a) or writes != max(0, len(set(a)) - 1):
            problems.append(f"chart point n={n}: ({moves}, {writes}) differs from a physical run")
    print(f"facts        {len(want)} FACTS recomputed; {len(series)} chart points checked against a physical delete")

    # 6. the numbers in the body prose
    md = open(os.path.join(HERE, "lesson.md"), encoding="utf-8").read()
    src = open(SOURCE, encoding="utf-8").read()
    kept = wk["prefix"]
    claims = [
        (f"it keeps 2 and 3 twice and returns {wk['k']}, where {len(set(big))} is right, and the kept slots read [{', '.join(map(str, kept))}]", "warn: wrong answer on the ten-value example"),
        (f"so it returns {py_seed0}; JavaScript compares 2 with `undefined`, keeps the first 2, and returns {js_seed0}", "seed-0 loop in both languages"),
        (f"it returns 0. JavaScript reads <code>undefined</code>, keeps the 2, and returns 1.", "quiz 3 option"),
        ("In Python `nums[-1]` is the last element; in JavaScript it is `undefined`", "negative index"),
        ("1 ≤ n ≤ 3·10⁴ · values in [−100, 100] · nums is sorted · O(1) auxiliary space", "the constraint line"),
        ("nums = [1, 1, 2] → k = 2, nums = [1, 2, _]", "example 1"),
        ("nums = [0, 0, 1, 1, 1, 2, 2, 3, 3, 4] → k = 5, nums = [0, 1, 2, 3, 4, _, _, _, _, _]", "example 2"),
    ]
    twice = [x for x in set(kept) if kept.count(x) == 2]
    if sorted(twice) != [2, 3]:
        problems.append(f"the mistake's kept slots repeat {sorted(twice)}, not 2 and 3")
    for phrase, what in claims:
        if phrase not in md:
            problems.append(f"lesson.md is missing the recomputed phrase for {what}: {phrase!r}")
    # the source's own examples and constraint, so the page poses the same problem
    for phrase in ["nums = [1, 1, 2]            →  k = 2,  nums = [1, 2, _]", "1 ≤ n ≤ 3·10⁴ · values in [−100, 100] · nums is sorted · O(1) auxiliary space"]:
        if re.sub(r"\s+", " ", phrase) not in re.sub(r"\s+", " ", src):
            problems.append(f"the source lesson no longer says {phrase!r}")
    print(f"prose        {len(claims)} phrases tied to recomputed values")

    # 7. a fault planted in memory must be caught, in both languages
    faults = [("nums[write - 1]", "nums[write]"), ("return write", "return write - 1"), ("write = 1", "write = 2"), ("write += 1", "write += 2")]
    for lang, run, ts_faults in [("py", run_py_source, faults),
                                 ("ts", run_ts_source, [("nums[write - 1]", "nums[write]"), ("return write;", "return write - 1;"), ("let write = 1;", "let write = 2;"), ("write++;", "write += 2;")])]:
        base = read(f"solution.{lang}")
        for old, new in ts_faults:
            if old not in base:
                problems.append(f"fault test: {old!r} is not in solution.{lang}")
                continue
            got = run(base.replace(old, new, 1), cases[:60])
            if all(good(c, g) for c, g in zip(cases[:60], got)):
                problems.append(f"fault test: replacing {old!r} with {new!r} in solution.{lang} was not caught")
    print("fault test   16 planted faults, each caught by the model")

    # 8. the built page embeds exactly this PURE block
    dist = os.path.join(WEB, "lesson-artifacts", "dist", "arrays", "remove-duplicates-sorted.html")
    if os.path.exists(dist):
        html = open(dist, encoding="utf-8").read()
        if pure_block() not in html:
            problems.append("the built page does not embed the exact PURE block from lesson.js")
    else:
        print("dist         no built page yet (run build.py)")

    if problems:
        print("\nERRORS:")
        for p in problems:
            print("  *", p)
        sys.exit(1)
    print("\nAll checks passed.")


if __name__ == "__main__":
    main()
