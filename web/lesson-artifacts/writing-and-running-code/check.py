"""Executes the code this page shows, in Python and in TypeScript, and recomputes the numbers it prints.

The page models the problem workspace: a draft with a real bug runs against six cases and the report says
"X of Y tests passed". A concept lesson has no sandbox cases, so its code is held to the course standard here:

  * code/solution.*  must match a brute force over every run on the page's cases and on random lists
  * code/mistake.*   must fail exactly the lists whose numbers are all negative, and nothing else
  * code/debug.*     must return what the mistake returns and print exactly what the Console tab shows
  * code/run_cases.* must judge each case on its own, and keep going when one case throws
  * lesson.js's PURE block (the page's JavaScript port of the drafts, run here in node) must produce the
    same got/expected/passed/log values the Python and TypeScript files produce, so the "X of Y" on the
    page is the number the real files would give
  * the numbers lesson.md types in prose (0 against -1 and -5) must be what the files return

    python3 web/lesson-artifacts/writing-and-running-code/check.py

Exit status 0 means every claim held. TypeScript is transpiled with the repo's own esbuild.
"""
import io, json, os, random, re, subprocess, contextlib

HERE = os.path.dirname(os.path.abspath(__file__))
CODE = os.path.join(HERE, "code")
WEB = os.path.normpath(os.path.join(HERE, "..", ".."))
ESBUILD = os.path.join(WEB, "node_modules", ".bin", "esbuild")


def brute(nums):
    """a different algorithm from every draft: the sum of each non-empty slice, directly"""
    return max(sum(nums[i:j]) for i in range(len(nums)) for j in range(i + 1, len(nums) + 1))


def random_lists(n=500, seed=20261013):
    rnd = random.Random(seed)
    out = []
    for _ in range(n):
        size = rnd.randint(1, 9)
        mode = rnd.random()
        if mode < .3:      # only negatives: the bug's whole territory
            out.append([-rnd.randint(1, 9) for _ in range(size)])
        elif mode < .4:    # only zeros and negatives: 0 is a real answer here, so the draft is right
            out.append([-rnd.randint(0, 9) for _ in range(size)])
        else:
            out.append([rnd.randint(-9, 9) for _ in range(size)])
    return out


def page_pure():
    """run the PURE block of lesson.js in node and return what it computes"""
    src = open(os.path.join(HERE, "lesson.js")).read()
    m = re.search(r"/\*PURE-BEGIN\*/(.*?)/\*PURE-END\*/", src, re.S)
    if not m:
        raise SystemExit("lesson.js has no PURE block")
    driver = m.group(1) + r"""
var out = {cases: WR_CASES.map(function (c) { return c.nums; }), drafts: WR_DRAFTS.map(function (d) {
  var rs = wrRun(d.fn);
  return {name: d.name, passed: wrCount(rs), results: rs.map(function (r) { return {got: r.got, expected: r.expected, passed: r.passed, logs: r.logs}; })};
})};
process.stdout.write(JSON.stringify(out));
"""
    res = subprocess.run(["node", "-e", driver], capture_output=True, text=True)
    if res.returncode:
        raise SystemExit("lesson.js PURE block failed:\n" + res.stderr)
    return json.loads(res.stdout)


def load_py(*files):
    ns = {}
    for f in files:
        exec(open(os.path.join(CODE, f)).read(), ns)
    return ns


TS_DRIVER = r"""
const LISTS = JSON.parse(require('fs').readFileSync(0, 'utf8'));
const fns = {solution: maxSubarray, mistake: maxSubarrayDraft, debug: maxSubarrayDebug};
const out = {};
for (const [name, fn] of Object.entries(fns)) {
  out[name] = LISTS.map(a => {
    const logs = [];
    const real = console.log;
    console.log = (...xs) => logs.push(xs.join(' '));
    let ret;
    try { ret = fn(a.slice()); } finally { console.log = real; }
    return [ret, logs];
  });
}
// the harness: one case that throws must not stop the others
const harness = runCases((nums) => { if (nums.length === 2) throw new Error('boom'); return maxSubarray(nums); },
  [{args: [[1]], expected: 1}, {args: [[1, 2]], expected: 3}, {args: [[-4, 5, 1]], expected: 6}]);
out.harness = harness.map(r => [r.passed, String(r.got)]);
process.stdout.write(JSON.stringify(out));
"""


def run_ts(lists):
    src = "\n".join(open(os.path.join(CODE, f)).read() for f in ["solution.ts", "mistake.ts", "debug.ts", "run_cases.ts"])
    js = subprocess.run([ESBUILD, "--loader=ts", "--format=cjs"], input=src, capture_output=True, text=True, check=True).stdout
    res = subprocess.run(["node", "-e", js + TS_DRIVER], input=json.dumps(lists), capture_output=True, text=True)
    if res.returncode:
        raise SystemExit("TypeScript run failed:\n" + res.stderr)
    return json.loads(res.stdout)


def main():
    page = page_pure()
    page_lists = page["cases"]
    lists = page_lists + random_lists()
    problems = []

    def need(ok, msg):
        if not ok:
            problems.append(msg)

    expected = [brute(a) for a in lists]

    # ---- Python
    ns = load_py("solution.py")
    py_sol = [ns["max_subarray"](list(a)) for a in lists]
    ms = load_py("mistake.py")
    py_mis = [ms["max_subarray"](list(a)) for a in lists]
    ds = load_py("debug.py")
    py_dbg, py_logs = [], []
    for a in lists:
        buf = io.StringIO()
        with contextlib.redirect_stdout(buf):
            py_dbg.append(ds["max_subarray"](list(a)))
        py_logs.append(buf.getvalue().splitlines())

    # ---- TypeScript
    ts = run_ts(lists)
    ts_sol = [r[0] for r in ts["solution"]]
    ts_mis = [r[0] for r in ts["mistake"]]
    ts_dbg = [r[0] for r in ts["debug"]]
    ts_logs = [r[1] for r in ts["debug"]]

    for label, got in [("solution.py", py_sol), ("solution.ts", ts_sol)]:
        bad = [(a, g, e) for a, g, e in zip(lists, got, expected) if g != e]
        need(not bad, f"{label} is wrong on {len(bad)} lists, first {bad[:1]}")

    # the mistake is wrong exactly when no number is positive and 0 is not itself the answer
    for label, got in [("mistake.py", py_mis), ("mistake.ts", ts_mis)]:
        wrong = [(a, g, e) for a, g, e in zip(lists, got, expected) if g != e]
        should = [a for a, e in zip(lists, expected) if e < 0]
        need([w[0] for w in wrong] == should, f"{label} should fail exactly the lists whose best sum is below 0 ({len(should)}), failed {len(wrong)}")
        need(all(g == 0 for _, g, _ in wrong), f"{label} should return 0 when it is wrong")
    need(py_dbg == py_mis and ts_dbg == ts_mis, "debug.* must return what mistake.* returns")
    need(py_logs == ts_logs, "debug.py and debug.ts print different lines")
    need(all(lg == [f"best {r}"] for lg, r in zip(py_logs, py_dbg)), "debug.* should print one line, 'best <value>', per case")

    # ---- the page's port, case by case, against the real files
    k = len(page_lists)
    buggy, printed, fixed = page["drafts"]
    for label, rs, py_got, ts_got in [("Buggy draft", buggy, py_mis, ts_mis), ("Fixed draft", fixed, py_sol, ts_sol), ("Buggy + print", printed, py_dbg, ts_dbg)]:
        for i in range(k):
            r = rs["results"][i]
            need(r["expected"] == expected[i], f"{label} case {i + 1}: page expected {r['expected']}, brute force {expected[i]}")
            need(r["got"] == py_got[i] == ts_got[i], f"{label} case {i + 1}: page got {r['got']}, python {py_got[i]}, typescript {ts_got[i]}")
            need(r["passed"] == (py_got[i] == expected[i]), f"{label} case {i + 1}: passed flag disagrees")
    for i in range(k):
        need(printed["results"][i]["logs"] == py_logs[i], f"Console lines for case {i + 1}: page {printed['results'][i]['logs']}, python {py_logs[i]}")
        need(buggy["results"][i]["logs"] == [] and fixed["results"][i]["logs"] == [], "only the print draft should print")

    # ---- the "X of Y" the rail shows
    passed_buggy = sum(1 for i in range(k) if py_mis[i] == expected[i])
    passed_fixed = sum(1 for i in range(k) if py_sol[i] == expected[i])
    need(buggy["passed"] == passed_buggy == sum(1 for i in range(k) if ts_mis[i] == expected[i]), "page's count for the buggy draft differs from the real files")
    need(fixed["passed"] == passed_fixed == k, "the fixed draft should pass every page case")
    need(printed["passed"] == passed_buggy, "the print draft should pass what the buggy draft passes")
    failing = [page_lists[i] for i in range(k) if py_mis[i] != expected[i]]
    need(len(failing) == 2 and all(max(a) < 0 for a in failing), f"the page says two all-negative cases fail, got {failing}")

    # ---- prose: "returns 0 for [-3, -1, -2] and for [-5], where the answers are -1 and -5"
    md = open(os.path.join(HERE, "lesson.md")).read()
    need("returns 0 for [−3, −1, −2] and for [−5], where the answers are −1 and −5" in md, "lesson.md's warn no longer states the claim this check verifies")
    for nums, want in [([-3, -1, -2], -1), ([-5], -5)]:
        need(py_mis[lists.index(nums)] == ts_mis[lists.index(nums)] == 0 and expected[lists.index(nums)] == want, f"claim about {nums} is false")
    need("The all-negative case prints `best 0`" in md and py_logs[lists.index([-3, -1, -2])] == ["best 0"], "the Console claim is false")

    # ---- the harness: each case judged on its own, a throwing case does not stop the rest
    rc = load_py("solution.py", "run_cases.py")["run_cases"]

    def boom(nums):
        if len(nums) == 2:
            raise ValueError("boom")
        return ns["max_subarray"](nums)
    py_h = [(r["passed"], str(r["got"])) for r in rc(boom, [(([1],), 1), (([1, 2],), 3), (([-4, 5, 1],), 6)])]
    ts_h = [(p, g) for p, g in ts["harness"]]
    need([p for p, _ in py_h] == [True, False, True] and [p for p, _ in ts_h] == [True, False, True], f"run_cases should fail only the throwing case: {py_h} / {ts_h}")
    need("boom" in py_h[1][1] and "boom" in ts_h[1][1], "a thrown error should land in 'got'")
    page_run = rc(ns["max_subarray"], [([list(a)], e) for a, e in zip(page_lists, expected)])
    need(all(r["passed"] for r in page_run), "run_cases with the solution should pass every page case")
    mis_run = rc(ms["max_subarray"], [([list(a)], e) for a, e in zip(page_lists, expected)])
    need(sum(r["passed"] for r in mis_run) == passed_buggy, "run_cases with the mistake should give the page's count")

    print(f"solution  python and typescript match brute force on {len(lists)} lists ({k} page cases + {len(lists) - k} random)")
    print(f"mistake   fails exactly the {sum(1 for e in expected if e < 0)} lists whose best sum is below 0; page cases: {passed_buggy} of {k} pass, failing {failing}")
    print(f"fixed     {passed_fixed} of {k} pass; console lines for the print draft: {[l for l in py_logs[:k]]}")
    for p in problems[:8]:
        print("  " + p)
    if problems:
        raise SystemExit("FAILED")
    print("all claims hold")


if __name__ == "__main__":
    main()
