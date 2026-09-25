"""Executes every code snippet the linear-structures overview shows, in Python and TypeScript.

Each system's code must agree with an independent model on random inputs; each system's
"Watch out" mistake must disagree at least once, in both runtimes, so no warning on the page is
untrue. The models are written differently from the code they check (brackets by deleting matched
pairs, the LRU order with a plain list, the rate limiter by counting), so one idea cannot be
wrong in both places at once. TypeScript is transpiled with the repo's own esbuild.

    python3 web/lesson-artifacts/linear-structures/check.py
"""
import json, math, os, random, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
CODE = os.path.join(HERE, "code")
ESBUILD = os.path.normpath(os.path.join(HERE, "..", "..", "node_modules", ".bin", "esbuild"))

# The page's code leans on two small classes the prose describes; the check supplies them.
PY_SUPPORT = '''
class Node:
    def __init__(self, key):
        self.key, self.prev, self.next = key, None, None
class Commit:
    def __init__(self, id, parent):
        self.id, self.parent = id, parent
'''
TS_SUPPORT = '''
class LNode { prev: LNode | null = null; next: LNode | null = null; constructor(public key: string | null) {} }
interface Commit { id: string; parent: Commit | null }
'''

# ---------- inputs, and what an independent model says the answers are ----------

def cases():
    R = random.Random(20260925)   # same inputs on every call: the model and both runtimes see one set
    c = {}
    c["audio"] = [[R.choice([0, 4096, 65536]), R.randint(0, 5000)] for _ in range(60)]
    c["growth"] = list(range(0, 70)) + [1000]
    c["history"] = [[f"c{k}" for k in range(R.randint(1, 9))] for _ in range(40)]
    c["lru"] = [[R.choice("ABCDE") for _ in range(R.randint(1, 14))] for _ in range(80)]
    c["calls"] = list(range(0, 16))
    c["brackets"] = [''.join(R.choice("()[]{}x") for _ in range(R.randint(0, 10))) for _ in range(300)] + ["{[()]}", "(((", "(]", ""]
    c["ring"] = []
    for _ in range(80):
        ops, size = [], 0
        for _ in range(R.randint(1, 20)):
            if size and R.random() < 0.45:
                ops.append(["pop"]); size -= 1
            else:
                ops.append(["push", R.randint(1, 99)]); size = min(size + 1, 4)
        c["ring"].append(ops)
    c["limiter"] = []
    for _ in range(60):
        t, seq = 0, []
        for _ in range(R.randint(1, 12)):
            t += R.choice([1, 500, 1000, 2999, 3000, 3001])
            seq.append(t)
        c["limiter"].append(seq)
    c["limiter"].append([1, 3001, 3002])            # the boundary: 1 is exactly 3000 before 3001
    return c


def model(c):
    m = {}
    m["audio"] = [b + i * 4 for b, i in c["audio"]]
    m["growth"] = [0 if n <= 1 else 2 ** math.ceil(math.log2(n)) - 1 for n in c["growth"]]
    m["history"] = [list(reversed(ids)) for ids in c["history"]]
    out = []
    for seq in c["lru"]:
        order, hits = [], []
        for k in seq:
            hits.append(k in order)
            if k in order:
                order.remove(k)
            elif len(order) == 3:
                order.pop()
            order.insert(0, k)
        out.append([hits, order])
    m["lru"] = out
    m["calls"] = [math.factorial(n) for n in c["calls"]]

    def pairs_gone(s):
        s = ''.join(ch for ch in s if ch in "()[]{}")
        while any(p in s for p in ("()", "[]", "{}")):
            for p in ("()", "[]", "{}"):
                s = s.replace(p, "")
        return s == ""
    m["brackets"] = [pairs_gone(s) for s in c["brackets"]]
    out = []
    for ops in c["ring"]:
        q, res = [], []
        for op in ops:
            if op[0] == "push":
                ok = len(q) < 4
                if ok:
                    q.append(op[1])
                res.append(ok)
            else:
                res.append(q.pop(0))
        out.append(res)
    m["ring"] = out
    m["limiter"] = [[sum(1 for u in seq[:k + 1] if t - 3000 <= u <= t) for k, t in enumerate(seq)] for seq in c["limiter"]]
    return m

# ---------- Python ----------

def run_py(system, mistake):
    ns = {}
    exec(PY_SUPPORT, ns)
    exec(open(os.path.join(CODE, system + ".py")).read(), ns)
    if mistake:
        exec(open(os.path.join(CODE, system + "_mistake.py")).read(), ns)
    c = cases()[system]
    try:
        if system == "audio":
            return [ns["address"](b, i) for b, i in c]
        if system == "growth":
            return [ns["append_copies"](n) for n in c]
        if system == "history":
            def chain(ids):
                node = None
                for i in ids:
                    node = ns["Commit"](i, node)
                return node
            return [ns["history"](chain(ids)) for ids in c]
        if system == "lru":
            Cls = ns["LRUMistake" if mistake else "LRU"]
            out = []
            for seq in c:
                cache = Cls(3)
                hits = [cache.use(k) for k in seq]
                out.append([hits, cache.order()])
            return out
        if system == "calls":
            return [ns["fact"](n) for n in c]
        if system == "brackets":
            return [ns["balanced"](s) for s in c]
        if system == "ring":
            Cls = ns["RingMistake" if mistake else "Ring"]
            out = []
            for ops in c:
                r, res = Cls(4), []
                for op in ops:
                    res.append(r.push(op[1]) if op[0] == "push" else r.pop())
                out.append(res)
            return out
        if system == "limiter":
            out = []
            for seq in c:
                rc = ns["RecentCalls"]()
                out.append([rc.ping(t) for t in seq])
            return out
    except Exception as e:  # a mistake that crashes (a stack overflow, a corrupt list) has failed
        return f"raised {type(e).__name__}"

# ---------- TypeScript ----------

TS_DRIVER = r'''
const C = JSON.parse(require('fs').readFileSync(0, 'utf8'));
const sys = process.env.SYS, mistake = process.env.MISTAKE === '1';
let out;
try {
  if (sys === 'audio') out = C.map(([b, i]) => address(b, i));
  if (sys === 'growth') out = C.map((n) => appendCopies(n));
  if (sys === 'history') out = C.map((ids) => { let node = null; for (const id of ids) node = { id, parent: node }; return history(node); });
  if (sys === 'lru') out = C.map((seq) => { const cache = mistake ? new LRUMistake(3) : new LRU(3); const hits = seq.map((k) => cache.use(k)); return [hits, cache.order()]; });
  if (sys === 'calls') out = C.map((n) => fact(n));
  if (sys === 'brackets') out = C.map((s) => balanced(s));
  if (sys === 'ring') out = C.map((ops) => { const r = mistake ? new RingMistake(4) : new Ring(4); return ops.map((op) => op[0] === 'push' ? r.push(op[1]) : r.pop()); });
  if (sys === 'limiter') out = C.map((seq) => { const rc = new RecentCalls(); return seq.map((t) => rc.ping(t)); });
} catch (e) { out = 'raised ' + e.constructor.name; }
process.stdout.write(JSON.stringify(out));
'''
SUBCLASS_MISTAKES = {"lru", "ring"}   # these mistakes extend the real class, so both files load


def run_ts(system, mistake):
    parts = [TS_SUPPORT]
    if not mistake or system in SUBCLASS_MISTAKES:
        parts.append(open(os.path.join(CODE, system + ".ts")).read())
    if mistake:
        parts.append(open(os.path.join(CODE, system + "_mistake.ts")).read())
    js = subprocess.run([ESBUILD, "--loader=ts", "--format=cjs"], input="\n".join(parts), capture_output=True, text=True)
    if js.returncode:
        raise SystemExit(f"{system}: TypeScript does not compile:\n{js.stderr}")
    run = subprocess.run(["node", "-e", js.stdout + TS_DRIVER], input=json.dumps(cases()[system]), capture_output=True,
                         text=True, env={**os.environ, "SYS": system, "MISTAKE": "1" if mistake else "0"})
    if run.returncode:
        raise SystemExit(f"{system}: TypeScript run failed:\n{run.stderr[:400]}")
    return json.loads(run.stdout)


def main():
    expected = model(cases())
    problems, lines = [], []
    for system in ["audio", "growth", "history", "lru", "calls", "brackets", "ring", "limiter"]:
        for lang, runner in (("python", run_py), ("typescript", run_ts)):
            good = runner(system, False)
            bad = runner(system, True)
            ok_good = good == expected[system]
            ok_bad = bad != expected[system]
            if not ok_good:
                first = next((k for k, (g, e) in enumerate(zip(good, expected[system])) if g != e), None) if isinstance(good, list) else None
                problems.append(f"{system} ({lang}) disagrees with the model" + (f" at case {first}" if first is not None else f": {good}"))
            if not ok_bad:
                problems.append(f"{system}_mistake ({lang}) passes every case, so its warning is not true")
        lines.append(f"{system}: code agrees, mistake fails, in both runtimes")
    for p in problems:
        print("FAIL " + p)
    if problems:
        raise SystemExit(f"FAILED {len(problems)} check(s)")
    print("\n".join(lines))
    print("all claims hold")


if __name__ == "__main__":
    main()
