"""Executes the code the Stable Compaction & Cyclic Placement page shows, in Python and TypeScript, and recomputes every number.

Validates:
  * code/solution.* (keep_if) against filtering on random trains and predicates, in both runtimes.
  * code/mistake.* (delete while iterating) is wrong exactly when two cars to drop sit side by side, and
    gives the same wrong answer in Python and in TypeScript.
  * code/cyclic.* (rotate_cyclic) against slice rotation, for k below, at and above n and for n = 0.
  * code/cyclic_mistake.* (stop after one chain) is right exactly when gcd(n, k mod n) is 1 or k mod n is 0,
    and wrong otherwise, in both runtimes.
  * lesson.js's PURE block (walkthroughs, invariants, every FACTS number) run in node on the real
    kit/lanes.js and kit/rings.js, then re-derived here: every snapshot's lane against a Python replay,
    every invariant against Python's own judgement, every ring token against Python's divmod.
  * the n = 0 and negative-remainder claims, run in the runtime they describe.
  * every number in lesson.md's body prose against a recomputed value.
  * the built page embeds the exact PURE block.

    python3 web/lesson-artifacts/stable-compaction-cyclic-placement/check.py
"""
import json, math, os, random, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
CODE = os.path.join(HERE, "code")
WEB = os.path.normpath(os.path.join(HERE, "..", ".."))
KIT = os.path.join(WEB, "lesson-artifacts", "kit")
ESBUILD = os.path.join(WEB, "node_modules", ".bin", "esbuild")
SLUG_HTML = os.path.join(WEB, "lesson-artifacts", "dist", "arrays", "stable-compaction-cyclic-placement.html")


def read(*p):
    with open(os.path.join(*p), encoding="utf-8") as f:
        return f.read()


def esbuild(src):
    return subprocess.run([ESBUILD, "--loader=ts", "--format=cjs"], input=src, capture_output=True, text=True, check=True).stdout


def node_run(js, payload):
    res = subprocess.run(["node", "-e", js], input=json.dumps(payload), capture_output=True, text=True)
    if res.returncode:
        raise SystemExit("node failed:\n" + res.stderr)
    return json.loads(res.stdout)


def node_eval(expr):
    res = subprocess.run(["node", "-p", "JSON.stringify(" + expr + ")"], capture_output=True, text=True)
    if res.returncode:
        raise SystemExit("node failed on " + expr + ":\n" + res.stderr)
    return json.loads(res.stdout)


# ---------- predicates, in both languages ----------

PY_PRED = {
    "nonzero": lambda v: v != 0, "odd": lambda v: v % 2 != 0, "even": lambda v: v % 2 == 0,
    "positive": lambda v: v > 0, "always": lambda v: True, "never": lambda v: False,
}
TS_PRED = {
    "nonzero": "(v: number) => v !== 0", "odd": "(v: number) => v % 2 !== 0", "even": "(v: number) => v % 2 === 0",
    "positive": "(v: number) => v > 0", "always": "(v: number) => true", "never": "(v: number) => false",
}


def keep_cases(seed=20261020):
    rnd = random.Random(seed)
    out = [([], "nonzero"), ([0], "nonzero"), ([0, 0, 1], "nonzero"), ([0, 1, 0, 3, 12], "nonzero"),
           ([1, 3, 5, 2, 4, 6], "even"), ([2, 4, 6, 8], "odd"), ([3, 1, 4, 1, 5], "always"), ([1, 2, 3], "never"),
           ([0, 0, 0, 0], "nonzero"), ([5, 0, 0, 5], "nonzero")]
    for _ in range(500):
        n = rnd.randint(0, 12)
        out.append(([rnd.randint(-3, 9) for _ in range(n)], rnd.choice(list(PY_PRED))))
    return out


def keep_model(nums, name):
    kept = [v for v in nums if PY_PRED[name](v)]
    return kept


def run_keep_py(name, cs):
    ns = {}
    exec(read(CODE, name), ns)
    out = []
    for nums, p in cs:
        a = list(nums)
        ret = ns["keep_if"](a, PY_PRED[p])
        out.append([ret, a])
    return out


def run_keep_ts(name, cs):
    preds = ",".join(f"{k!r}: {v}".replace("'", '"') for k, v in TS_PRED.items())
    js = esbuild(read(CODE, name)) + """
const P = {%s};
const CASES = JSON.parse(require('fs').readFileSync(0, 'utf8'));
process.stdout.write(JSON.stringify(CASES.map(([nums, p]) => { const a = nums.slice(); const ret = keepIf(a, P[p]); return [ret, a]; })));
""" % preds
    return node_run(js, cs)


# ---------- rotation ----------

def rot_cases(seed=11):
    rnd = random.Random(seed)
    out = [(0, 0), (0, 5), (1, 0), (1, 7), (6, 2), (5, 2), (6, 0), (6, 6), (6, 8), (8, 12), (12, 8), (4, 2), (9, 3), (9, 6), (7, 3)]
    for n in range(0, 13):
        for k in range(0, 31):
            out.append((n, k))
    return out


def rot_model(nums, k):
    n = len(nums)
    if n == 0:
        return []
    kk = k % n
    return nums[n - kk:] + nums[:n - kk]


def run_rot_py(name, cs):
    ns = {}
    exec(read(CODE, name), ns)
    out = []
    for n, k in cs:
        a = list(range(1, n + 1))
        ns["rotate_cyclic"](a, k)
        out.append(a)
    return out


def run_rot_ts(name, cs):
    js = esbuild(read(CODE, name)) + """
const CASES = JSON.parse(require('fs').readFileSync(0, 'utf8'));
process.stdout.write(JSON.stringify(CASES.map(([n, k]) => { const a = Array.from({length: n}, (_, i) => i + 1); rotateCyclic(a, k); return a; })));
"""
    return node_run(js, cs)


# ---------- the PURE block, run in node on the real kit ----------

def pure_block():
    js = read(HERE, "lesson.js")
    a = js.index("/* PURE:begin")
    b = js.index("/* PURE:end */") + len("/* PURE:end */")
    return js[a:b]


PROBE = r"""
function dump(steps, INV) {
  return steps.map(function (s) {
    var a = s.lanes[0];
    return { done: s.done, items: a.items.map(function (x) { return x ? +x.v : null; }), marks: a.marks, fields: s.fields,
      inv: INV.map(function (i) { return !!i[2](s); }) };
  });
}
function ring(steps) {
  return steps.map(function (s) {
    return { at: s.ring.at, rows: s.ring.rows.map(function (r) { return { id: r.id, on: r.on, cell: r.cell, turns: r.turns, py: r.py, js: r.js, expr: r.expr }; }), m: s.ring.T.m, inv: s.ring.inv ? s.ring.inv.map(function (i) { return !!i[2](s); }) : null };
  });
}
var T = {
  rw0: dump(cpKeepSteps([0, 1, 0, 3, 12], cpNonZero, ''), CP_INV_RW), rw1: dump(cpKeepSteps([2, 7, 4, 9, 6, 1, 5], cpOdd, ''), CP_INV_RW),
  rw2: dump(cpKeepSteps([3, 1, 4, 1, 5], cpAlways, ''), CP_INV_RW), rw3: dump(cpKeepSteps([2, 4, 6, 8], cpOdd, ''), CP_INV_RW),
  trapRw: dump(cpKeepSteps([1, 3, 5, 2, 4, 6], cpEven, ''), CP_INV_TRAP), trapRm: dump(cpRemoveSteps([1, 3, 5, 2, 4, 6], cpEven), CP_INV_TRAP),
  cy62: dump(cpCycSteps(6, 2, false), CP_INV_CYC), cy52: dump(cpCycSteps(5, 2, false), CP_INV_CYC),
  cm62: dump(cpCycSteps(6, 2, true), CP_INV_CYC), cm52: dump(cpCycSteps(5, 2, true), CP_INV_CYC)
};
process.stdout.write(JSON.stringify({ FACTS: FACTS, tabs: T, hero: cpHeroFrames(), guess: CP_GUESS,
  rings: { two: ring(cpRingTwoSteps()), one: ring(cpRingOneSteps()), left: ring(cpRingLeftSteps()) },
  cyc: [[6, 2], [5, 2], [12, 8], [6, 4], [9, 6], [8, 12], [7, 3], [1000, 300], [6, 3], [10, 4], [1, 5]].map(function (p) {
    return [p[0], p[1], cpCycles(p[0], p[1]), cpRotate(Array.from({ length: p[0] }, function (_, i) { return i + 1; }), p[1], false)]; }) }));
"""


def run_pure():
    probe = read(KIT, "lanes.js") + "\n" + read(KIT, "rings.js") + "\n" + pure_block() + PROBE
    res = subprocess.run(["node", "-e", probe], capture_output=True, text=True)
    if res.returncode:
        raise SystemExit("lesson.js PURE block failed in node:\n" + res.stderr)
    return json.loads(res.stdout)


# ---------- Python replays ----------

def replay_rw(arr, keep):
    """After the intro and each car: (array, read, write). The closing step repeats the last state."""
    a, w = list(arr), 0
    seq = [(list(a), 0, 0)]
    for r in range(len(arr)):
        if keep(a[r]):
            a[w] = a[r]
            w += 1
        seq.append((list(a), r + 1, w))
    seq.append((list(a), len(arr), w))
    return seq


def judge_rw(arr, keep, a, r, w):
    prefix = [x for x in arr[:r] if keep(x)]
    return [a[:w] == prefix and w == len(prefix), w <= r, a[r:] == arr[r:]]


def replay_rm(arr, keep):
    """Python's own list iteration with remove(): per read, (list, next index, reads, shifted, read cars)."""
    a, it, reads, shifted, read = list(arr), 0, 0, 0, []
    seq = [(list(a), 0, 0, 0, [])]
    while it < len(a):
        x = a[it]
        reads += 1
        read.append((x, keep(x)))
        if not keep(x):
            at = a.index(x)
            shifted += len(a) - at - 1
            a.remove(x)
        it += 1
        seq.append((list(a), it, reads, shifted, list(read)))
    seq.append((list(a), it, reads, shifted, list(read)))
    return seq


def judge_rm(arr, keep, a, it, read):
    want = [x for x, k in read if k]
    prefix_ok = a[:it] == want
    keepers = [x for x in arr if keep(x)]
    have = {}
    for x in a:
        have[x] = have.get(x, 0) + 1
    kept_ok = all(have.get(x, 0) >= keepers.count(x) for x in set(keepers))
    return [prefix_ok, kept_ok]


def replay_cyc(n, k, one):
    """Per step: (the n + 1 slots, parcels placed so far, cycles closed). Slot n is the hand."""
    orig = list(range(1, n + 1))
    slots = orig + [None]
    placed = []
    seq = [(list(slots), [])]
    moved, start = 0, 0
    while moved < n:
        cur = start
        slots[n], slots[start] = slots[start], slots[n]
        seq.append((list(slots), list(placed)))
        while True:
            nxt = (cur + k) % n
            slots[n], slots[nxt] = slots[nxt], slots[n]
            placed.append(nxt)
            moved += 1
            seq.append((list(slots), list(placed)))
            cur = nxt
            if cur == start:
                break
        if one:
            break
        start += 1
    seq.append((list(slots), list(placed)))
    return seq, orig


def judge_cyc(n, k, orig, slots, placed):
    home = lambda j: orig[(j - k) % n]
    return [sorted(v for v in slots if v is not None) == sorted(orig), all(slots[j] == home(j) for j in placed)]


def main():
    problems = []

    # 1. keep_if, both runtimes
    cs = keep_cases()
    want = [keep_model(*c) for c in cs]
    for label, got in [("solution.py", run_keep_py("solution.py", cs)), ("solution.ts", run_keep_ts("solution.ts", cs))]:
        bad = [(c, w, g) for c, w, g in zip(cs, want, got) if g[0] != len(w) or g[1][:g[0]] != w]
        print(f"{label:16} {len(cs) - len(bad)}/{len(cs)} match filtering")
        if bad:
            problems.append(f"{label} failed on {len(bad)} cases: first {bad[:2]}")
    mp, mt = run_keep_py("mistake.py", cs), run_keep_ts("mistake.ts", cs)
    if mp != mt:
        problems.append("mistake.py and mistake.ts disagree: the page says both runtimes skip the same cars")
    adjacent = lambda nums, p: any(not PY_PRED[p](nums[i]) and not PY_PRED[p](nums[i + 1]) for i in range(len(nums) - 1))
    wrong = [(c, g) for c, g in zip(cs, mp) if g[0] != len(keep_model(*c)) or g[1][:g[0]] != keep_model(*c)]
    cond = [c for c in cs if adjacent(*c)]
    bad_pairs = [c for c, g in zip(cs, mp) if (g[0] != len(keep_model(*c)) or g[1][:g[0]] != keep_model(*c)) != adjacent(*c)]
    print(f"{'mistake.*':16} identical in both runtimes; wrong on {len(wrong)}/{len(cs)} cases, exactly the {len(cond)} with two droppable cars side by side")
    if bad_pairs:
        problems.append(f"mistake is not wrong exactly when two droppable cars are adjacent: first {bad_pairs[:2]}")

    # 2. rotation, both runtimes
    rc = rot_cases()
    rwant = [rot_model(list(range(1, n + 1)), k) for n, k in rc]
    for label, got in [("cyclic.py", run_rot_py("cyclic.py", rc)), ("cyclic.ts", run_rot_ts("cyclic.ts", rc))]:
        bad = [(c, w, g) for c, w, g in zip(rc, rwant, got) if w != g]
        print(f"{label:16} {len(rc) - len(bad)}/{len(rc)} match slice rotation")
        if bad:
            problems.append(f"{label} failed on {len(bad)} cases: first {bad[:2]}")
    for label, got in [("cyclic_mistake.py", run_rot_py("cyclic_mistake.py", rc)), ("cyclic_mistake.ts", run_rot_ts("cyclic_mistake.ts", rc))]:
        mism = 0
        for (n, k), w, g in zip(rc, rwant, got):
            right = n == 0 or math.gcd(n, k % n) == 1 or k % n == 0
            if (g == w) != right:
                problems.append(f"{label} on n={n}, k={k}: matched={g == w}, but gcd rule says {right}")
            mism += g != w
        print(f"{label:16} wrong on {mism}/{len(rc)} cases: exactly those with 1 < gcd(n, k mod n) < n")

    # 3. the PURE block
    pure = run_pure()
    T = pure["tabs"]
    pred = {"rw0": ([0, 1, 0, 3, 12], PY_PRED["nonzero"]), "rw1": ([2, 7, 4, 9, 6, 1, 5], PY_PRED["odd"]),
            "rw2": ([3, 1, 4, 1, 5], PY_PRED["always"]), "rw3": ([2, 4, 6, 8], PY_PRED["odd"]), "trapRw": ([1, 3, 5, 2, 4, 6], PY_PRED["even"])}
    for name, (arr, keep) in pred.items():
        got = T[name]
        seq = replay_rw(arr, keep)
        if len(got) != len(seq):
            problems.append(f"{name}: {len(got)} steps, replay has {len(seq)}")
            continue
        n = len(arr)
        for k, (g, (a, r, w)) in enumerate(zip(got, seq)):
            if g["items"] != a:
                problems.append(f"{name} step {k}: lane {g['items']} != replay {a}")
            if g["fields"] != [["read", r], ["write", w]]:
                problems.append(f"{name} step {k}: fields {g['fields']}")
            if g["marks"].get("r") != (r if r < n else None):
                problems.append(f"{name} step {k}: read mark {g['marks'].get('r')} for read {r}")
            if g["marks"].get("w") != (w if w < n else None):
                problems.append(f"{name} step {k}: write mark {g['marks'].get('w')} for write {w}")
            seen_cars = [(x, keep(x)) for x in arr[:r]]
            exp = judge_rw(arr, keep, a, r, w) if name != "trapRw" else judge_rm(arr, keep, a, w, seen_cars)
            if g["inv"] != exp:
                problems.append(f"{name} step {k}: invariants {g['inv']} != {exp}")
            if not all(exp):
                problems.append(f"{name} step {k}: a claim failed on a correct run")
            if not g["done"]:
                problems.append(f"{name} step {k}: not at rest")
    rm_arr = [1, 3, 5, 2, 4, 6]
    seq = replay_rm(rm_arr, PY_PRED["even"])
    got = T["trapRm"]
    if len(got) != len(seq):
        problems.append(f"trapRm: {len(got)} steps, replay has {len(seq)}")
    else:
        for k, (g, (a, it, reads, shifted, rd)) in enumerate(zip(got, seq)):
            if g["items"] != a:
                problems.append(f"trapRm step {k}: lane {g['items']} != replay {a}")
            if g["fields"] != [["reads", reads], ["cars shifted", shifted]]:
                problems.append(f"trapRm step {k}: fields {g['fields']}")
            if g["marks"].get("it") != (it if it < len(a) else None):
                problems.append(f"trapRm step {k}: it mark {g['marks'].get('it')} for it {it}")
            exp = judge_rm(rm_arr, PY_PRED["even"], a, it, rd)
            if g["inv"] != exp:
                problems.append(f"trapRm step {k}: invariants {g['inv']} != {exp}")
    rm_flags = [g["inv"][0] for g in got]
    if rm_flags.index(False) != 1 or any(rm_flags[1:]) or not all(g["inv"][1] for g in got):
        problems.append(f"delete-while-iterating invariant flags {rm_flags}")
    # cyclic tabs
    for name, (n, k, one) in {"cy62": (6, 2, False), "cy52": (5, 2, False), "cm62": (6, 2, True), "cm52": (5, 2, True)}.items():
        seq, orig = replay_cyc(n, k, one)
        got = T[name]
        if len(got) != len(seq):
            problems.append(f"{name}: {len(got)} steps, replay has {len(seq)}")
            continue
        for s_i, (g, (slots, placed)) in enumerate(zip(got, seq)):
            if g["items"] != slots:
                problems.append(f"{name} step {s_i}: lane {g['items']} != replay {slots}")
            hand = slots[n]
            if g["fields"] != [["parcels home", f"{len(placed)} of {n}"], ["in hand", hand if hand is not None else "nothing"]]:
                problems.append(f"{name} step {s_i}: fields {g['fields']}")
            exp = judge_cyc(n, k, orig, slots, placed)
            if g["inv"] != exp:
                problems.append(f"{name} step {s_i}: invariants {g['inv']} != {exp}")
            if not all(exp):
                problems.append(f"{name} step {s_i}: a cyclic invariant failed in the replay itself")
        final = seq[-1][0][:n]
        if not one and final != rot_model(orig, k):
            problems.append(f"{name}: final {final} is not the rotation")
        if one:
            moved = sum(1 for j in range(n) if final[j] != orig[j])
            print(f"{name:16} one-chain loop leaves {n - len(seq[-1][1])} of {n} seats unmoved; {len(seq[-1][1])} parcels set down")
    # rings, against Python's divmod and each language's own %
    def ring_check(name, positions):
        steps = pure["rings"][name]
        if len(steps) != len(positions):
            problems.append(f"ring {name}: {len(steps)} steps, expected {len(positions)}")
            return
        for k, (s, pos) in enumerate(zip(steps, positions)):
            if s["at"] != {t: v for t, v in pos.items() if v is not None}:
                problems.append(f"ring {name} step {k}: tokens at {s['at']}, expected {pos}")
            for row in s["rows"]:
                if not row["on"]:
                    continue
                a = s["at"][row["id"]]
                q, r = divmod(a, s["m"])
                if (row["cell"], row["turns"]) != (r, q):
                    problems.append(f"ring {name} step {k}: {row['id']} cell/turns {row['cell'], row['turns']} != divmod {(r, q)}")
                if row["py"] != str(a % s["m"]):
                    problems.append(f"ring {name} step {k}: python column {row['py']} != {a % s['m']}")
                js = node_eval(f"{a} % {s['m']}")
                if row["js"].replace("\u2212", "-") != str(js):
                    problems.append(f"ring {name} step {k}: javascript column {row['js']} != {js}")
            if s["inv"] is not None and not all(s["inv"]):
                problems.append(f"ring {name} step {k}: page invariant false")
    ring_check("two", [{}, {"a": 0, "b": 1}, {"a": 2, "b": 1}, {"a": 4, "b": 1}, {"a": 6, "b": 1}, {"a": 6, "b": 3}, {"a": 6, "b": 5}, {"a": 6, "b": 7}, {"a": 6, "b": 7}])
    ring_check("one", [{}, {"a": 0}, {"a": 2}, {"a": 4}, {"a": 6}, {"a": 8}, {"a": 10}, {"a": 10}])
    ring_check("left", [{}, {"a": 0, "b": 1}, {"a": -2, "b": 1}, {"a": -2, "b": -1}, {"a": -2, "b": -1}])
    if pure["rings"]["two"][0]["at"] != {}:
        problems.append("ring two should start with nothing standing on it")

    # hero frames
    h, w, hero = [0, 1, 0, 3, 12], 0, []
    hero.append((list(h), 0, 0))
    for r in range(5):
        if h[r] != 0:
            h[w] = h[r]
            w += 1
        hero.append((list(h), r + 1, w))
    hero.append((list(h), 5, w))
    got_h = [(f["a"], f["r"], f["w"]) for f in pure["hero"]]
    if got_h != hero:
        problems.append(f"hero frames {got_h} != {hero}")

    # cycle counts, rotations and the safety count, derived here
    for n, k, c, rot in pure["cyc"]:
        g = math.gcd(n, k % n) if n else 0
        want_cycles = g if k % n else n
        want_len = n // want_cycles
        if k % n == 0:
            want_cycles, want_len = n, 1
        elif (c["cycles"], c["len"]) != (g, n // g):
            problems.append(f"cycles({n},{k}) = {c}, gcd says {g} chains of {n // g}")
        if k % n == 0 and (c["cycles"], c["len"]) != (n, 1):
            problems.append(f"cycles({n},{k}) = {c}, expected {n} chains of 1")
        if rot["a"] != rot_model(list(range(1, n + 1)), k) or rot["placements"] != n or rot["cycles"] != c["cycles"]:
            problems.append(f"cpRotate({n},{k}) = {rot}")

    seed, copies, unread = 20261020, 0, 0
    def rnd():
        nonlocal seed
        seed = (seed * 1664525 + 1013904223) & 0xFFFFFFFF
        return seed / 4294967296
    for _ in range(500):
        n = int(rnd() * 13)
        a = [int(rnd() * 4) for _ in range(n)]
        w = 0
        for r in range(n):
            if a[r] != 0:
                if w > r:
                    unread += 1
                a[w] = a[r]
                w += 1
                copies += 1
    alt = lambda n: [0 if i % 2 == 0 else i for i in range(n)]
    def shifts(arr):
        a, moves = list(arr), 0
        while 0 in a:
            i = a.index(0)
            moves += len(a) - i - 1
            del a[i]
        return moves
    rm = replay_rm(rm_arr, PY_PRED["even"])[-1]
    facts = pure["FACTS"]
    want_facts = {
        "heroKept": 3, "keep0": 3, "keep0tail": "3, 12", "oddKept": 4,
        "trapWant": 3, "trapGot": len(rm[0]), "trapShifted": rm[3], "trapCopies": 3, "trapLeft": rm[0][0],
        "safeTrains": 500, "safeCopies": copies, "safeUnread": unread,
        "cyc62": math.gcd(6, 2), "len62": 6 // math.gcd(6, 2), "cyc52": math.gcd(5, 2), "len52": 5 // math.gcd(5, 2),
        "misHome": 3, "misOf": 6,
        "shift64": shifts(alt(64)), "rw64": 32, "shift1000": shifts(alt(1000)), "rw1000": 500,
        "bigPlace": 1000, "bigCycles": math.gcd(1000, 300), "bigLen": 1000 // math.gcd(1000, 300),
        "jsModZero": "NaN", "jsNegMod": int(math.fmod(-2, 6)), "pyNegMod": -2 % 6,
        "quizN": 12, "quizK": 8, "quizCycles": math.gcd(12, 8), "quizLen": 12 // math.gcd(12, 8),
        "guess0": math.gcd(6, 4), "guess1": math.gcd(7, 3), "guess2": math.gcd(12, 8),
    }
    for k, v in want_facts.items():
        if facts.get(k) != v:
            problems.append(f"FACTS.{k} is {facts.get(k)!r}, derived value is {v!r}")
    if set(facts) != set(want_facts):
        problems.append(f"FACTS keys {sorted(set(facts) ^ set(want_facts))} are not checked")
    if unread != 0:
        problems.append(f"{unread} copies landed on an unread slot")
    if [(g["n"], g["k"], g["expect"], g["len"]) for g in pure["guess"]] != [(6, 4, 2, 3), (7, 3, 1, 7), (12, 8, 4, 3)]:
        problems.append(f"predict cases {pure['guess']}")
    # the pass the trap's chart is drawn from: shifting is n^2 / 4 on the alternating train, copies are n / 2
    if any(shifts(alt(n)) != n * n // 4 for n in range(0, 65, 8)):
        problems.append("delete-and-slide is not n^2 / 4 on the alternating train")

    # 4. prose: every number in the body, tied to a recomputed value; the language claims, run where they live
    ns = {}
    exec("def probe():\n    try:\n        return [1, 2, 3][0] % 0\n    except ZeroDivisionError as e:\n        return type(e).__name__\n", ns)
    py_zero = ns["probe"]()
    js_zero = node_eval("String(5 % 0)")
    js_undef = node_eval("typeof [1, 2, 3][NaN]")
    js_neg = node_eval("(0 - 2) % 6")
    fixed = node_eval("(((0 - 2) % 6) + 6) % 6")
    if py_zero != "ZeroDivisionError" or js_zero != "NaN" or js_undef != "undefined" or js_neg != -2 or (0 - 2) % 6 != 4 or fixed != 4:
        problems.append(f"language claims: {py_zero} {js_zero} {js_undef} {js_neg} {(0 - 2) % 6} {fixed}")
    md = read(HERE, "lesson.md")
    claims = [
        (f"On the first tab the train ends as 1, 3, 12 in slots 0 to 2, with 3 and 12 still sitting in slots 3 and 4.", "first tab leftovers"),
        (f"of {copies:,} copies in all, {unread} landed on a slot that `read` had not reached", "safety count"),
        (f"The page ran `keep_if` on 500 random trains", "500 trains"),
        ("a train of 1,000 cars with every other one dropped takes 500 copies", "500 copies"),
        (f"keeping the even cars of 1, 3, 5, 2, 4, 6 returns {len(rm[0])} cars and leaves the {rm[0][0]} on the train", "trap warn"),
        (f"when the {rm[0][0]} slides into slot 0 before the iterator moves on", "the 3 slides"),
        (f"By the end it has shifted {rm[3]} cars and left the {rm[0][0]} behind; the pointer version made 3 copies and got it right.", "shifted vs copies"),
        (f"For six seats and `k = 2`, `g` is {math.gcd(6, 2)}, so there are {math.gcd(6, 2)} chains of {6 // math.gcd(6, 2)} seats: the parcel from seat 0 is home after {6 // math.gcd(6, 2)} hops", "six seats"),
        (f"For five seats and `k = 2`, `g` is {math.gcd(5, 2)}, so one chain of {5 // math.gcd(5, 2)} seats touches every seat", "five seats"),
        (f"so `(0 \u2212 2) % 6` is {(0 - 2) % 6}, while JavaScript's truncates toward zero, so `(0 \u2212 2) % 6` is \u2212{abs(js_neg)}", "negative remainder in both"),
        (f"For six seats and k = 2 it moves {3} of the {6} and leaves the other {3} where they started", "one-chain warn"),
        ("Python raises `ZeroDivisionError`, while JavaScript quietly gives `NaN`, and `nums[NaN]` is `undefined`", "k % 0"),
        (f"the delete they replace does about n\u00b2 / 4", "n^2/4 headline"),
        ("Rotating {{quizN}} seats by k = {{quizK}}", "quiz uses facts"),
    ]
    for phrase, what in claims:
        if phrase not in md:
            problems.append(f"lesson.md is missing the recomputed phrase for {what}: {phrase!r}")
    print(f"prose            {len(claims)} phrases tied to recomputed values")
    print(f"tabs             {', '.join(f'{k} {len(v)}' for k, v in T.items())} steps replayed")

    # 5. the built page
    if os.path.exists(SLUG_HTML):
        if pure_block() not in read(SLUG_HTML):
            problems.append("built HTML does not embed the exact PURE block from lesson.js")
    else:
        print("built page       not found: run build.py stable-compaction-cyclic-placement to check what ships")

    if problems:
        print("\nERRORS:")
        for p in problems:
            print("  *", p)
        sys.exit(1)
    print("\nAll checks passed.")


if __name__ == "__main__":
    main()
