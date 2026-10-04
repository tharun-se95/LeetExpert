"""Executes the code this page shows, in Python and in TypeScript, against a plain Python list.

A concept lesson has no sandbox cases, so its code is held to the course standard here: random
lists and random sequences of get(i) and insert_after(get(i), v) run through code/solution.* must
match a Python list after every operation, and following next from the head must end at null.
code/mistake.* (the two writes in the wrong order) must break every case that inserts, in both runtimes, so the page's
"Watch out" is printed only if it is true.

    python3 web/lesson-artifacts/nodes-and-pointers/check.py

Exit status 0 means every claim held. TypeScript is transpiled with the repo's own esbuild.
"""
import json, os, random, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
CODE = os.path.join(HERE, "code")
WEB = os.path.normpath(os.path.join(HERE, "..", ".."))
ESBUILD = os.path.join(WEB, "node_modules", ".bin", "esbuild")

# the page's trap: insert 9 after 3 in 7 -> 3 -> 12
TRAP = {"start": [7, 3, 12], "ops": [["insert", 1, 9]]}


def cases(n=400, seed=20261002):
    rnd = random.Random(seed)
    out = [TRAP]
    for _ in range(n):
        start = [rnd.randint(0, 9) for _ in range(rnd.randint(1, 8))]
        ops, size = [], len(start)
        for _ in range(rnd.randint(1, 10)):
            if rnd.random() < .5:
                ops.append(["get", rnd.randrange(size)])
            else:
                ops.append(["insert", rnd.randrange(size), rnd.randint(0, 9)])
                size += 1
        out.append({"start": start, "ops": ops})
    return out


def model(case):
    xs, obs = list(case["start"]), []
    for op in case["ops"]:
        if op[0] == "get":
            obs.append([xs[op[1]], list(xs)])
        else:
            xs.insert(op[1] + 1, op[2])
            obs.append([op[2], list(xs)])
    return obs


def walk(head):
    """values from head, and whether the walk reached null within a bound a correct list never needs"""
    vals, node, guard = [], head, 0
    while node is not None and guard <= 64:
        vals.append(node.value)
        node, guard = node.next, guard + 1
    return vals, node is None


def observe_py(ns, case, insert):
    Node = ns["Node"]
    head = None
    for v in reversed(case["start"]):
        head = Node(v, head)
    obs = []
    for op in case["ops"]:
        if op[0] == "get":
            ret = ns["get"](head, op[1]).value
        else:
            ret = insert(ns["get"](head, op[1]), op[2]).value
        vals, ends = walk(head)
        obs.append([ret, vals, ends])
    return obs


DRIVER = r"""
const CASES = JSON.parse(require('fs').readFileSync(0, 'utf8'));
const insert = process.env.FN === 'swapped' ? insertAfterSwapped : insertAfter;
const out = CASES.map(c => {
  let head = null;
  for (let i = c.start.length - 1; i >= 0; i--) head = new ListNode(c.start[i], head);
  return c.ops.map(op => {
    const ret = op[0] === 'get' ? get(head, op[1]).value : insert(get(head, op[1]), op[2]).value;
    const vals = []; let node = head, guard = 0;
    while (node !== null && guard <= 64) { vals.push(node.value); node = node.next; guard++; }
    return [ret, vals, node === null];
  });
});
process.stdout.write(JSON.stringify(out));
"""


def run_ts(all_cases, files, fn):
    src = "\n".join(open(os.path.join(CODE, f)).read() for f in files)
    js = subprocess.run([ESBUILD, "--loader=ts", "--format=cjs"], input=src, capture_output=True, text=True, check=True).stdout
    res = subprocess.run(["node", "-e", js + DRIVER], input=json.dumps(all_cases), capture_output=True, text=True,
                         env={**os.environ, "FN": fn})
    if res.returncode:
        raise SystemExit("TypeScript run failed:\n" + res.stderr)
    return json.loads(res.stdout)


def main():
    all_cases = cases()
    expected = [model(c) for c in all_cases]
    failures = []

    def bad_count(label, got_all, must_hold):
        bad = 0
        for c, exp, got in zip(all_cases, expected, got_all):
            for (eret, exs), (gret, gxs, ends) in zip(exp, got):
                if not (eret == gret and exs == gxs and ends):
                    bad += 1
                    if must_hold and len(failures) < 5:
                        failures.append(f"{label}: {c} -> expected {exs}, got {gxs} (ends at null: {ends})")
                    break
        return bad

    ns = {}
    exec(open(os.path.join(CODE, "solution.py")).read(), ns)
    n_py = bad_count("solution.py", [observe_py(ns, c, ns["insert_after"]) for c in all_cases], True)
    n_ts = bad_count("solution.ts", run_ts(all_cases, ["solution.ts"], "insertAfter"), True)

    ms = dict(ns)
    exec(open(os.path.join(CODE, "mistake.py")).read(), ms)
    m_py_obs = [observe_py(ms, c, ms["insert_after"]) for c in all_cases]
    m_ts_obs = run_ts(all_cases, ["solution.ts", "mistake.ts"], "swapped")
    m_py = bad_count("mistake.py", m_py_obs, False)
    m_ts = bad_count("mistake.ts", m_ts_obs, False)
    # the page's exact claim: inserting 9 after 3 in 7 -> 3 -> 12 leaves 12 unreachable and 9 pointing at itself
    trap_py, trap_ts = m_py_obs[0][-1], m_ts_obs[0][-1]

    print(f"solution  python {len(all_cases) - n_py}/{len(all_cases)} cases, typescript {len(all_cases) - n_ts}/{len(all_cases)}")
    print(f"mistake   python fails {m_py} cases, typescript fails {m_ts}, of the {sum(1 for c in all_cases if any(op[0] == 'insert' for op in c['ops']))} that insert; trap walk starts {trap_py[1][:5]} / {trap_ts[1][:5]}, ends at null: {trap_py[2]} / {trap_ts[2]}")
    inserts = sum(1 for c in all_cases if any(op[0] == "insert" for op in c["ops"]))
    ok = (not n_py and not n_ts and m_py == inserts and m_ts == inserts
          and trap_py[1][:4] == trap_ts[1][:4] == [7, 3, 9, 9] and not trap_py[2] and not trap_ts[2])
    for f in failures:
        print("  " + f)
    if not ok:
        raise SystemExit("FAILED")
    print("all claims hold")


if __name__ == "__main__":
    main()
