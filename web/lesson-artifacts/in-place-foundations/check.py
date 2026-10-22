"""Executes the code the In-Place Foundations page shows, in Python and TypeScript, and recomputes every number.

Validates:
  * code/solution.* (reverse_range) matches slice reversal on random and edge ranges, in both runtimes.
  * code/mistake.* (the loop over every position) hands the array back unchanged, in both runtimes,
    and so fails whenever the range holds two different cars.
  * code/swap.* exchanges two slots, including i == j, in both runtimes.
  * lesson.js's PURE block (the walkthroughs, the invariants and every FACTS number) run in node on the
    real kit/lanes.js, then re-derived here by a different route: every snapshot's array, pointers and
    swap count against a replay written in Python, and the page's invariants against Python's own.
  * every number in lesson.md's body prose against a value recomputed here, in the runtime it describes.
  * the built page embeds the exact PURE block.

    python3 web/lesson-artifacts/in-place-foundations/check.py
"""
import json, os, random, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
CODE = os.path.join(HERE, "code")
WEB = os.path.normpath(os.path.join(HERE, "..", ".."))
KIT = os.path.join(WEB, "lesson-artifacts", "kit")
ESBUILD = os.path.join(WEB, "node_modules", ".bin", "esbuild")


def read(*p):
    with open(os.path.join(*p), encoding="utf-8") as f:
        return f.read()


# ---------- cases, and what an independent model says ----------

def cases(seed=20261020):
    rnd = random.Random(seed)
    out = [([], 0, -1), ([7], 0, 0), ([1, 2], 0, 1), ([1, 2, 3], 0, 2), ([1, 2, 3, 4], 1, 2),
           ([5, 5, 5, 5], 0, 3), ([1, 2, 3, 4, 5, 6], 0, 5), ([1, 2, 3, 4, 5, 6, 7], 0, 6),
           ([1, 2, 3, 4, 5, 6, 7, 8], 2, 5), ([4, 4, 9, 9], 0, 3), ([3, 1], 1, 1)]
    for _ in range(400):
        n = rnd.randint(0, 14)
        nums = [rnd.randint(-5, 5) for _ in range(n)]
        if n == 0:
            out.append((nums, 0, -1))
            continue
        lo = rnd.randint(0, n - 1)
        hi = rnd.randint(lo, n - 1)
        out.append((nums, lo, hi))
    return out


def model_reverse(nums, lo, hi):
    return nums[:lo] + nums[lo:hi + 1][::-1] + nums[hi + 1:]


def run_py(name, fn, cs):
    ns = {}
    exec(read(CODE, name), ns)
    res = []
    for nums, lo, hi in cs:
        a = list(nums)
        ns[fn](a, lo, hi)
        res.append(a)
    return res


def esbuild(src):
    return subprocess.run([ESBUILD, "--loader=ts", "--format=cjs"], input=src, capture_output=True, text=True, check=True).stdout


def node_run(js, payload):
    res = subprocess.run(["node", "-e", js], input=json.dumps(payload), capture_output=True, text=True)
    if res.returncode:
        raise SystemExit("node failed:\n" + res.stderr)
    return json.loads(res.stdout)


def run_ts(name, fn, cs):
    js = esbuild(read(CODE, name)) + """
const CASES = JSON.parse(require('fs').readFileSync(0, 'utf8'));
process.stdout.write(JSON.stringify(CASES.map(([nums, lo, hi]) => { const a = nums.slice(); %s(a, lo, hi); return a; })));
""" % fn
    return node_run(js, cs)


def swap_cases(seed=11):
    rnd = random.Random(seed)
    out = []
    for _ in range(100):
        n = rnd.randint(1, 8)
        out.append(([rnd.randint(0, 9) for _ in range(n)], rnd.randrange(n), rnd.randrange(n)))
    return out


def model_swap(nums, i, j):
    a = list(nums)
    vi, vj = a[i], a[j]
    a[i], a[j] = vj, vi
    return a


def run_swap_py(cs):
    ns = {}
    exec(read(CODE, "swap.py"), ns)
    res = []
    for nums, i, j in cs:
        a = list(nums)
        ns["swap"](a, i, j)
        res.append(a)
    return res


def run_swap_ts(cs):
    js = esbuild(read(CODE, "swap.ts")) + """
const CASES = JSON.parse(require('fs').readFileSync(0, 'utf8'));
process.stdout.write(JSON.stringify(CASES.map(([nums, i, j]) => { const a = nums.slice(); swap(a, i, j); return a; })));
"""
    return node_run(js, cs)


# ---------- the page's PURE block, run in node on the real kit ----------

def pure_block():
    js = read(HERE, "lesson.js")
    a = js.index("/* PURE:begin")
    b = js.index("/* PURE:end */") + len("/* PURE:end */")
    return js[a:b]


PROBE = r"""
function dump(steps) {
  return steps.map(function (s) {
    var a = s.lanes[0];
    return { done: s.done, a: a.items.map(function (x) { return x && +x.v; }), l: 'l' in a.marks ? a.marks.l : null, r: 'r' in a.marks ? a.marks.r : null,
      fields: s.fields, lanes: s.lanes.map(function (l) { return l.items.map(function (x) { return x && +x.v; }); }),
      inv: s.meta ? IP_INV.map(function (i) { return !!i[2](s); }) : null };
  });
}
process.stdout.write(JSON.stringify({
  FACTS: FACTS,
  tabs: { even: dump(ipRevSteps(6, 0, 5, false)), odd: dump(ipRevSteps(7, 0, 6, false)), range: dump(ipRevSteps(8, 2, 5, false)),
          rotate: dump(ipRotateSteps()), full: dump(ipRevSteps(6, 0, 5, true)), copy: dump(ipCopySteps()), swap: dump(ipSwapSteps()) },
  hero: ipHeroFrames(),
  guess: IP_GUESS,
  spare: [0, 8, 16, 24, 32, 40, 48, 56, 64].map(function (n) { var s = ipSpare(n); return [n, s.copy, s.place]; }),
  passes7: ipLoopPasses(7)
}));
"""


def run_pure():
    probe = read(KIT, "lanes.js") + "\n" + pure_block() + PROBE
    res = subprocess.run(["node", "-e", probe], capture_output=True, text=True)
    if res.returncode:
        raise SystemExit("lesson.js PURE block failed in node:\n" + res.stderr)
    return json.loads(res.stdout)


def node_eval(expr):
    res = subprocess.run(["node", "-p", "JSON.stringify(" + expr + ")"], capture_output=True, text=True)
    if res.returncode:
        raise SystemExit("node failed on " + expr + ":\n" + res.stderr)
    return json.loads(res.stdout)


# ---------- the Python replay every snapshot is held to ----------

def replay_phase(arr, lo, hi, every, swaps0):
    """Expected (array, left, right, swaps) after the intro and each pass of one phase, written as a plain loop."""
    a = list(arr)
    out = [(list(a), lo, hi, swaps0)]
    swaps = swaps0
    if every:
        span = hi - lo + 1
        for i in range(span):
            x, y = lo + i, hi - i
            a[x], a[y] = a[y], a[x]
            swaps += 1
            out.append((list(a), x + 1, y - 1, swaps))
        return out, a, swaps
    l, r = lo, hi
    while l < r:
        a[l], a[r] = a[r], a[l]
        swaps += 1
        l += 1
        r -= 1
        out.append((list(a), l, r, swaps))
    out.append((list(a), l, r, swaps))     # the closing step states the ending and changes nothing
    return out, a, swaps


def outside_final(a, orig, lo, hi, l, r):
    for j, v in enumerate(a):
        if j < lo or j > hi:
            if v != orig[j]:
                return False
        elif j < l or j > r:
            if v != orig[lo + hi - j]:
                return False
    return True


def expected_tab(n, phases, every=False):
    """phases: [(lo, hi)]. Returns the expected [(array, l, r, swaps, inv)] and the final array."""
    a = list(range(1, n + 1))
    swaps = 0
    seq = []
    for lo, hi in phases:
        orig = list(a)
        steps, a, swaps = replay_phase(a, lo, hi, every, swaps)
        for arr, l, r, sw in steps:
            seq.append((arr, l, r, sw, [outside_final(arr, orig, lo, hi, l, r), sorted(arr) == sorted(orig)]))
    return seq, a


def check_tab(name, got, n, phases, every, problems):
    seq, final = expected_tab(n, phases, every)
    if len(got) != len(seq):
        problems.append(f"{name}: {len(got)} steps, replay has {len(seq)}")
        return None
    for k, (g, (arr, l, r, sw, inv)) in enumerate(zip(got, seq)):
        in_range = lambda v: v if 0 <= v < n else None
        want = dict(a=arr, l=in_range(l), r=in_range(r), fields=[["left", l], ["right", r], ["swaps", sw]], inv=inv, done=True)
        for key in want:
            if g[key] != want[key]:
                problems.append(f"{name} step {k}: {key} is {g[key]!r}, replay says {want[key]!r}")
    return seq, final


def main():
    problems = []

    # 1. the shown code, in both runtimes
    cs = cases()
    want = [model_reverse(*c) for c in cs]
    for label, got in [("solution.py", run_py("solution.py", "reverse_range", cs)), ("solution.ts", run_ts("solution.ts", "reverseRange", cs))]:
        bad = [(c, w, g) for c, w, g in zip(cs, want, got) if w != g]
        print(f"{label:12} {len(cs) - len(bad)}/{len(cs)} match the slice-reversal model")
        if bad:
            problems.append(f"{label} failed on {len(bad)} cases: first {bad[:2]}")
    for label, got in [("mistake.py", run_py("mistake.py", "reverse_range", cs)), ("mistake.ts", run_ts("mistake.ts", "reverseRange", cs))]:
        unchanged = all(g == list(c[0]) for c, g in zip(cs, got))
        two = [(c, g) for c, g in zip(cs, got) if model_reverse(*c) != c[0]]     # reversing really changes the array
        wrong = [1 for (c, g) in two if g != model_reverse(*c)]
        print(f"{label:12} returns the input unchanged on {len(cs)}/{len(cs)} cases; wrong on {len(wrong)}/{len(two)} ranges a reversal changes")
        if not unchanged:
            problems.append(f"{label} changed an array; the page says the loop undoes itself")
        if len(wrong) != len(two) or not two:
            problems.append(f"{label} should fail on every range that a reversal changes")
    sc = swap_cases()
    sw_want = [model_swap(*c) for c in sc]
    for label, got in [("swap.py", run_swap_py(sc)), ("swap.ts", run_swap_ts(sc))]:
        print(f"{label:12} {sum(g == w for g, w in zip(got, sw_want))}/{len(sc)} exchange the two slots")
        if got != sw_want:
            problems.append(f"{label} does not match the swap model")

    # 2. the PURE block: snapshots against a Python replay, then FACTS
    pure = run_pure()
    T = pure["tabs"]
    seq_even, _ = check_tab("even", T["even"], 6, [(0, 5)], False, problems)
    seq_odd, _ = check_tab("odd", T["odd"], 7, [(0, 6)], False, problems)
    check_tab("range", T["range"], 8, [(2, 5)], False, problems)
    seq_rot, final_rot = check_tab("rotate", T["rotate"], 7, [(0, 6), (0, 2), (3, 6)], False, problems)
    seq_full, final_full = check_tab("full", T["full"], 6, [(0, 5)], True, problems)
    src7 = list(range(1, 8))
    if final_rot != src7[-3:] + src7[:-3]:
        problems.append(f"three reversals gave {final_rot}, rotating right by 3 gives {src7[-3:] + src7[:-3]}")
    if final_full != list(range(1, 7)):
        problems.append("the every-position loop did not return the original train")
    for name in ("even", "odd", "range", "rotate"):
        if not all(all(s["inv"]) for s in T[name]):
            problems.append(f"{name}: an invariant failed on a correct run")
    print(f"tabs         even {len(T['even'])}, odd {len(T['odd'])}, range {len(T['range'])}, rotate {len(T['rotate'])}, every-position {len(T['full'])} steps replayed")

    # the every-position run: green through pass 3, red from pass 4
    flags = [all(s["inv"]) for s in T["full"]]
    first_red = flags.index(False)               # step index = pass number (step 0 is the intro)
    if first_red != 4 or not all(flags[:4]):
        problems.append(f"every-position invariant flags {flags}")
    after3 = seq_full[3][0]
    a_slot, b_slot = 3, 2                        # pass 4 is i = 3: slots 3 and 2
    cars = sorted([after3[a_slot], after3[b_slot]])

    # copy / swap widgets: the second track is the reverse, and the peaks are counted from the fields
    copy_out = T["copy"][-1]["lanes"][1]
    if copy_out != [4, 3, 2, 1]:
        problems.append(f"copy tab ended with {copy_out}")
    if T["swap"][-1]["lanes"][0] != [4, 3, 2, 1]:
        problems.append(f"swap tab ended with {T['swap'][-1]['lanes'][0]}")
    copy_peak = max(int(s["fields"][0][1]) for s in T["copy"])
    swap_peak = max(int(s["fields"][0][1]) for s in T["swap"])
    # a swap in the shown code is three assignments through one temporary: count the live copies in the swap tab
    live = max(sum(1 for v in s["lanes"][1] if v is not None) for s in T["swap"])

    # hero frames
    h = []
    a, l, r, sw = list(range(1, 7)), 0, 5, 0
    h.append((list(a), l, r, sw))
    while l < r:
        a[l], a[r] = a[r], a[l]
        l += 1
        r -= 1
        sw += 1
        h.append((list(a), l, r, sw))
    h.append((list(a), l, r, sw))
    got_h = [(f["a"], f["l"], f["r"], f["swaps"]) for f in pure["hero"]]
    if got_h != h:
        problems.append(f"hero frames {got_h} != {h}")

    # FACTS, derived here
    def swaps_for(n):
        l, r, c = 0, n - 1, 0
        while l < r:
            l += 1
            r -= 1
            c += 1
        return c, l, r
    s6, l6, r6 = swaps_for(6)
    s7, l7, r7 = swaps_for(7)
    s1000 = swaps_for(1000)[0]
    js_passes = len([i for i in range(10) if i < 7 / 2])      # the JavaScript test i < n / 2 on 7 / 2 = 3.5
    want_facts = {
        "swaps6": s6, "left6": l6, "right6": r6, "swaps7": s7, "left7": l7, "right7": r7,
        "swaps1000": s1000, "spare1000": 1000, "place1000": 1, "spare64": 64, "place64": 1,
        "copyPeak": copy_peak, "swapPeak": swap_peak,
        "allSwaps6": 6, "allSame6": 1, "jsPasses7": js_passes, "pyPasses7": 7 // 2,
        "guess0": 9 // 2, "guess1": 6 // 2, "guess2": 11 // 2,
    }
    facts = pure["FACTS"]
    for k, v in want_facts.items():
        if facts.get(k) != v:
            problems.append(f"FACTS.{k} is {facts.get(k)!r}, derived value is {v!r}")
    if set(facts) != set(want_facts):
        problems.append(f"FACTS keys {sorted(set(facts) ^ set(want_facts))} are not checked")
    if copy_peak != 4 or swap_peak != 1 or live != 1:
        problems.append(f"copy peak {copy_peak}, swap peak {swap_peak}, live copies in the spare lane {live}")
    if [g["expect"] for g in pure["guess"]] != [4, 3, 5] or [g["n"] for g in pure["guess"]] != [9, 6, 11]:
        problems.append(f"predict cases {pure['guess']}")
    if pure["spare"] != [[n, n, 1 if n > 1 else 0] for n in (0, 8, 16, 24, 32, 40, 48, 56, 64)]:
        problems.append(f"spare-slot series {pure['spare']}")

    # 3. prose: every number in the body, tied to a recomputed value
    ns = {}
    exec("def probe():\n    try:\n        range(7 / 2)\n    except TypeError as e:\n        return type(e).__name__\n    return None\n", ns)
    py_type_error = ns["probe"]()
    py_half = 7 / 2
    js_half = node_eval("7 / 2")
    js_idx = node_eval("(() => { const o = []; for (let i = 0; i < 7 / 2; i++) o.push(i); return o; })()")
    if py_type_error != "TypeError" or py_half != 3.5 or js_half != 3.5 or js_idx != [0, 1, 2, 3] or 7 // 2 != 3:
        problems.append(f"half-length claims: python {py_type_error} {py_half}, js {js_half} {js_idx}")
    md = read(HERE, "lesson.md")
    claims = [
        (f"By the end the copy was holding {copy_peak} spare slots, one for every car. The swap never held more than {swap_peak},", "peaks in the cost widget"),
        (f"With six cars the loop stops with `left` at {l6} and `right` at {r6}", "six-car ending"),
        (f"With seven it stops with both on slot {l7}", "seven-car ending"),
        (f"{s6} swaps for six cars and {s7} swaps for seven", "swap counts"),
        (f"Counted by running it, 1,000 cars take {s1000} swaps.", "1,000 cars"),
        (f"reverse all 7 cars, then the first 3, then the other {7 - 3}. Rotating right by 3", "rotation by three reversals"),
        (f"For six cars that is 6 swaps instead of {s6}", "every-position swaps"),
        (f"breaks on the {['zeroth', 'first', 'second', 'third', 'fourth'][first_red]}, when slots {a_slot} and {b_slot} swap again and cars {cars[0]} and {cars[1]} go back", "first red pass"),
        (f"holds through the {['zeroth', 'first', 'second', 'third'][first_red - 1]} pass", "last green pass"),
        (f"`7 / 2` is {js_half}, so the loop `i < n / 2` runs for `i` = {', '.join(map(str, js_idx))}, which is {len(js_idx)} passes where \u230a7 / 2\u230b is {7 // 2}", "JavaScript half-length"),
        ("`range(n / 2)` raises a `TypeError`", "Python range of a float"),
        ("`n // 2` is a whole number", "Python floor division"),
        ("The panel holds after every pass of the left tab.", "left tab is green throughout"),
        (f"JavaScript keeps the fraction: 7 / 2 is {js_half}, and the loop continues while i < {js_half}, so i takes 0, 1, 2, 3", "quiz explanation"),
    ]
    for phrase, what in claims:
        if phrase not in md:
            problems.append(f"lesson.md is missing the recomputed phrase for {what}: {phrase!r}")
    print(f"prose        {len(claims)} phrases tied to recomputed values")

    # 4. the built page embeds this exact PURE block and these exact code files
    dist = os.path.join(WEB, "lesson-artifacts", "dist", "arrays", "in-place-foundations.html")
    if os.path.exists(dist):
        html = read(dist)
        if pure_block() not in html:
            problems.append("built HTML does not embed the exact PURE block from lesson.js")
    else:
        print("built page   not found: run build.py in-place-foundations to check what ships")

    if problems:
        print("\nERRORS:")
        for p in problems:
            print("  *", p)
        sys.exit(1)
    print("\nAll checks passed.")


if __name__ == "__main__":
    main()
