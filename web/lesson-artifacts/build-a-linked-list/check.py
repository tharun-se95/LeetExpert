"""Executes the code this page shows, in Python and in TypeScript, against a plain list.

This is a concept lesson with no sandbox cases, so the page's code is held to the
course standard here instead: random operation sequences run through
code/solution.* must match a Python list after every operation, with the lesson's
three invariants intact. code/mistake.* (the delete that forgets the tail) must
lose data in both runtimes, so the page's "Watch out" is only printed if it is true.

    python3 web/lesson-artifacts/build-a-linked-list/check.py

Exit status 0 means every claim held. TypeScript is transpiled with the repo's own
esbuild (web/node_modules), the same toolchain the app builds with.
"""
import json, os, random, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
CODE = os.path.join(HERE, "code")
WEB = os.path.normpath(os.path.join(HERE, "..", ".."))
ESBUILD = os.path.join(WEB, "node_modules", ".bin", "esbuild")

# The sequence the page's trap widget plays: delete the tail, then append.
TRAP = [["push_back", 7], ["push_back", 3], ["push_back", 12], ["delete", 12], ["push_back", 5]]


def sequences(n=400, seed=20260924):
    rnd = random.Random(seed)
    out = [TRAP, [["delete", 1]], [["push_front", 1], ["delete", 1], ["push_back", 2]]]
    for _ in range(n):
        seq = []
        for _ in range(rnd.randint(1, 18)):
            op = rnd.choice(["push_front", "push_back", "delete", "delete", "find"])
            seq.append([op, rnd.randint(0, 5)])  # a small range, so repeats and misses happen
        out.append(seq)
    return out


def model(seq):
    """The expected observation after each op: (return value, contents)."""
    xs, obs = [], []
    for op, v in seq:
        ret = None
        if op == "push_front":
            xs.insert(0, v)
        elif op == "push_back":
            xs.append(v)
        elif op == "delete":
            ret = v in xs
            if ret:
                xs.remove(v)
        elif op == "find":
            ret = v in xs
        obs.append([ret, list(xs)])
    return obs


def observe_py(cls, seq):
    L, obs = cls(), []
    for op, v in seq:
        ret = getattr(L, op)(v)
        if op == "find":
            ret = ret is not None and ret.value == v
        # The invariants, read from the real pointers.
        walk, curr, guard = [], L.head, 0
        while curr is not None and guard <= 64:
            walk.append(curr)
            curr, guard = curr.next, guard + 1
        inv = [curr is None, L.tail is (walk[-1] if walk else None), L.size == len(walk)]
        obs.append([ret, [n.value for n in walk], inv])
    return obs


def run_py(extra=None):
    ns = {}
    exec(open(os.path.join(CODE, "solution.py")).read(), ns)
    if extra:
        exec(open(os.path.join(CODE, extra)).read(), ns)
    return ns


DRIVER = r"""
const SEQS = JSON.parse(require('fs').readFileSync(0, 'utf8'));
const NAMES = {push_front: 'pushFront', push_back: 'pushBack', delete: 'delete', find: 'find'};
const Cls = typeof LeakyList === 'function' && process.env.CLS === 'LeakyList' ? LeakyList : LinkedList;
const out = SEQS.map(seq => {
  const L = new Cls(), obs = [];
  for (const [op, v] of seq) {
    let ret = L[NAMES[op]](v);
    if (op === 'find') ret = ret !== null && ret.value === v;
    if (ret === undefined) ret = null;
    const walk = []; let curr = L.head, guard = 0;
    while (curr !== null && guard <= 64) { walk.push(curr); curr = curr.next; guard++; }
    obs.push([ret, walk.map(n => n.value), [curr === null, L.tail === (walk.length ? walk[walk.length - 1] : null), L.size === walk.length]]);
  }
  return obs;
});
process.stdout.write(JSON.stringify(out));
"""


def run_ts(seqs, files, cls):
    src = "\n".join(open(os.path.join(CODE, f)).read() for f in files)
    js = subprocess.run([ESBUILD, "--loader=ts", "--format=cjs"], input=src, capture_output=True, text=True, check=True).stdout
    res = subprocess.run(["node", "-e", js + DRIVER], input=json.dumps(seqs), capture_output=True, text=True,
                         env={**os.environ, "CLS": cls})
    if res.returncode:
        raise SystemExit("TypeScript run failed:\n" + res.stderr)
    return json.loads(res.stdout)


def main():
    seqs = sequences()
    expected = [model(s) for s in seqs]
    failures = []

    def compare(label, got_all, must_hold):
        bad = 0
        for seq, exp, got in zip(seqs, expected, got_all):
            for (eret, exs), (gret, gxs, inv) in zip(exp, got):
                ok = eret == gret and exs == gxs and all(inv)
                if not ok:
                    bad += 1
                    if must_hold and len(failures) < 5:
                        failures.append(f"{label}: {seq} -> expected {exs}/{eret}, got {gxs}/{gret} invariants {inv}")
                    break
        return bad

    py = run_py()
    ts = run_ts(seqs, ["solution.ts"], "LinkedList")
    n_py = compare("solution.py", [observe_py(py["LinkedList"], s) for s in seqs], True)
    n_ts = compare("solution.ts", ts, True)

    pyl = run_py("mistake.py")
    tsl = run_ts(seqs, ["solution.ts", "mistake.ts"], "LeakyList")
    m_py = compare("mistake.py", [observe_py(pyl["LeakyList"], s) for s in seqs], False)
    m_ts = compare("mistake.ts", tsl, False)
    # The page's exact claim: after deleting the tail, push_back(5) is lost.
    trap_py = observe_py(pyl["LeakyList"], TRAP)[-1][1]
    trap_ts = tsl[0][-1][1]

    print(f"solution  python {len(seqs) - n_py}/{len(seqs)} sequences, typescript {len(seqs) - n_ts}/{len(seqs)}")
    print(f"mistake   python fails {m_py} sequences, typescript fails {m_ts}; trap ends as {trap_py} / {trap_ts}")
    ok = not n_py and not n_ts and m_py > 0 and m_ts > 0 and trap_py == trap_ts == [7, 3]
    for f in failures:
        print("  " + f)
    if not ok:
        raise SystemExit("FAILED")
    print("all claims hold")


if __name__ == "__main__":
    main()
