"""Executes the code this page shows, in Python and in TypeScript, against a plain Python list.

A concept lesson has no sandbox cases, so its code is held to the course standard here: random lists
with repeated values, and a random target, run through code/solution.* must give the list with every
copy of the target removed, ending at null. code/mistake.* (advancing after a splice) must be wrong in
both runtimes, and the page's two claims about it must hold in both: on [7, 7, 3] deleting 7 it leaves
[7, 3], and on [3, 7] deleting 7 it throws.

    python3 web/lesson-artifacts/pointer-surgery/check.py

Exit status 0 means every claim held. TypeScript is transpiled with the repo's own esbuild.
"""
import json, os, random, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
CODE = os.path.join(HERE, "code")
WEB = os.path.normpath(os.path.join(HERE, "..", ".."))
ESBUILD = os.path.join(WEB, "node_modules", ".bin", "esbuild")

CLAIMS = [{"start": [7, 7, 3], "target": 7}, {"start": [3, 7], "target": 7}]


def cases(n=400, seed=20261002):
    rnd = random.Random(seed)
    out = list(CLAIMS) + [{"start": [], "target": 1}, {"start": [7], "target": 7}]
    for _ in range(n):
        out.append({"start": [rnd.randint(0, 3) for _ in range(rnd.randint(0, 9))], "target": rnd.randint(0, 3)})
    return out


def observe_py(fn, Node, c):
    head = None
    for v in reversed(c["start"]):
        head = Node(v, head)
    try:
        out = fn(head, c["target"])
    except Exception as e:
        return {"throws": type(e).__name__}
    vals, guard = [], 0
    while out is not None and guard <= 64:
        vals.append(out.value)
        out, guard = out.next, guard + 1
    return {"vals": vals, "ends": out is None}


DRIVER = r"""
const CASES = JSON.parse(require('fs').readFileSync(0, 'utf8'));
const fn = process.env.FN === 'advancing' ? deleteAllAdvancing : deleteAll;
const out = CASES.map(c => {
  let head = null;
  for (let i = c.start.length - 1; i >= 0; i--) head = new ListNode(c.start[i], head);
  let res;
  try { res = fn(head, c.target); } catch (e) { return { throws: e.constructor.name }; }
  const vals = []; let guard = 0;
  while (res !== null && guard <= 64) { vals.push(res.value); res = res.next; guard++; }
  return { vals, ends: res === null };
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
    want = [{"vals": [v for v in c["start"] if v != c["target"]], "ends": True} for c in all_cases]
    ns = {}
    exec(open(os.path.join(CODE, "solution.py")).read(), ns)
    py = [observe_py(ns["delete_all"], ns["Node"], c) for c in all_cases]
    ts = run_ts(all_cases, ["solution.ts"], "deleteAll")
    bad_py = [c for c, w, g in zip(all_cases, want, py) if g != w]
    bad_ts = [c for c, w, g in zip(all_cases, want, ts) if g != w]

    ms = dict(ns)
    exec(open(os.path.join(CODE, "mistake.py")).read(), ms)
    mpy = [observe_py(ms["delete_all"], ms["Node"], c) for c in all_cases]
    mts = run_ts(all_cases, ["solution.ts", "mistake.ts"], "advancing")
    wrong_py = sum(1 for w, g in zip(want, mpy) if g != w)
    wrong_ts = sum(1 for w, g in zip(want, mts) if g != w)

    print(f"solution  python {len(all_cases) - len(bad_py)}/{len(all_cases)} cases, typescript {len(all_cases) - len(bad_ts)}/{len(all_cases)}")
    print(f"mistake   wrong on python {wrong_py}, typescript {wrong_ts}; [7,7,3] gives {mpy[0]} / {mts[0]}; [3,7] gives {mpy[1]} / {mts[1]}")
    ok = (not bad_py and not bad_ts and wrong_py == wrong_ts > 0
          and mpy[0] == mts[0] == {"vals": [7, 3], "ends": True}
          and "throws" in mpy[1] and "throws" in mts[1])
    for c in (bad_py + bad_ts)[:5]:
        print("  wrong on", c)
    if not ok:
        raise SystemExit("FAILED")
    print("all claims hold")


if __name__ == "__main__":
    main()
