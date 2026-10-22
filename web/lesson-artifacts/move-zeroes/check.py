"""Executes the Move Zeroes code in Python and TypeScript and recomputes all facts.

Validates:
  * code/solution.* matches the independent model across 400+ edge and random cases in both runtimes.
  * code/mistake.* fails on arrays with zeroes in both runtimes.
  * lesson.js PURE block matches Python's independent derivation of all FACTS.
  * prose claims in lesson.md are tied to recomputed mathematical values.
  * quiz options obey formatting rules (answer not longest option, valid slots).
  * built HTML embeds the exact PURE block.
"""
import json, os, random, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
CODE = os.path.join(HERE, "code")
WEB = os.path.normpath(os.path.join(HERE, "..", ".."))
ESBUILD = os.path.join(WEB, "node_modules", ".bin", "esbuild")


def cases(n=400, seed=20261020):
    rnd = random.Random(seed)
    edges = [
        [0, 1, 0, 3, 12],
        [0],
        [1],
        [0, 0],
        [1, 0],
        [0, 1],
        [1, 2, 3],
        [0, 0, 0, 1],
        [4, 0, 5, 0, 0, 6],
        [0] * 10,
        [0] * 100,
        list(range(1, 25)),
        [0] * 20 + list(range(1, 10)),
        list(range(1, 10)) + [0] * 20,
        [-1, 0, -2, 0, 3, -4, 0],
        [1000] * 5 + [0] * 5,
        [0] * 5 + [1000] * 5,
        [1, 0] * 20,
        [0, 1] * 20,
    ]
    out = [list(c) for c in edges]
    for _ in range(n):
        sz = rnd.randint(1, 60)
        p_zero = rnd.choice([0.1, 0.3, 0.5, 0.8, 0.95])
        arr = [0 if rnd.random() < p_zero else rnd.randint(-1000, 1000) for _ in range(sz)]
        out.append(arr)
    return out


def model_move_zeroes(nums):
    """Independent mathematical reference model."""
    non_zeroes = [x for x in nums if x != 0]
    zeroes = [0] * (len(nums) - len(non_zeroes))
    return non_zeroes + zeroes


def run_py(name, fn_name, all_cases):
    ns = {}
    with open(os.path.join(CODE, name), encoding="utf-8") as f:
        exec(f.read(), ns)
    fn = ns[fn_name]
    res = []
    for c in all_cases:
        arr = list(c)
        fn(arr)
        res.append(arr)
    return res


DRIVER = r"""
const CASES = JSON.parse(require('fs').readFileSync(0, 'utf8'));
const out = CASES.map(c => {
  const arr = c.slice();
  moveZeroes(arr);
  return arr;
});
process.stdout.write(JSON.stringify(out));
"""


def run_ts(files, fn_name, all_cases):
    src = "\n".join(open(os.path.join(CODE, f), encoding="utf-8").read() for f in files)
    js = subprocess.run([ESBUILD, "--loader=ts", "--format=cjs"], input=src, capture_output=True, text=True, check=True).stdout
    res = subprocess.run(["node", "-e", js + DRIVER], input=json.dumps(all_cases), capture_output=True, text=True)
    if res.returncode:
        raise SystemExit("TypeScript run failed:\n" + res.stderr)
    return json.loads(res.stdout)


def pure_block():
    js = open(os.path.join(HERE, "lesson.js"), encoding="utf-8").read()
    a = js.index("/* PURE:begin")
    b = js.index("/* PURE:end */") + len("/* PURE:end */")
    return js[a:b]


def run_pure():
    probe = pure_block() + r"""
process.stdout.write(JSON.stringify({
  FACTS: FACTS,
  COST_PTS: COST_PTS,
  EX_INPUT: EX_INPUT
}));
"""
    res = subprocess.run(["node", "-e", probe], capture_output=True, text=True)
    if res.returncode:
        raise SystemExit("lesson.js PURE block failed in node:\n" + res.stderr)
    return json.loads(res.stdout)


def prose_claims():
    claims = []
    # 1. 3 non-zeroes + 2 zeroes = 5 writes on [0, 1, 0, 3, 12]
    nz3 = 3
    z2 = 2
    tot5 = nz3 + z2
    claims.append((f"Pass 1 copies each of the {nz3} non-zeroes forward, and pass 2 fills the remaining {z2} slots with zeroes: {nz3} + {z2} = {tot5} writes in total, exactly n.", "pass 1 and 2 write sum"))

    # 2. On [0, 1, 0, 3, 12], write left at 3, remaining 2 slots untouched
    w3 = 3
    rem2 = 5 - w3
    claims.append((f"On `[0, 1, 0, 3, 12]`, pass 1 writes to indices 0, 1, and 2, leaving write at {w3}. The remaining {rem2} slots (indices 3 and 4) are untouched", "stale slots explanation"))

    # 3. Memory writes at 0 zeroes in 64 elements: swap 128 vs compact 64
    sw_rare = 2 * 64
    tp_64 = 64
    claims.append((f"At 0 zeroes in 64 elements, swapping does {sw_rare} writes (2 · 64), whereas compact-and-fill does {tp_64} writes.", "swap vs two-pass at 0 zeroes in prose"))

    # 4. Memory writes at 60 zeroes in 64 elements: swap 8 writes
    sw_dom = 2 * (64 - 60)
    claims.append((f"When zeroes dominate (60 zeroes out of 64), swapping requires only {sw_dom} writes (2 · 4) compared to compact-and-fill's 64 writes.", "swap when zeroes dominate in prose"))

    # 5. Quiz 2 numbers: 1,000 array with 2 zeroes -> 998 non-zeroes, 1,996 writes
    n_quiz = 1000
    z_quiz = 2
    nz_quiz = n_quiz - z_quiz
    sw_quiz = 2 * nz_quiz
    claims.append((f"When an array of 1,000 integers contains only {z_quiz} zeroes, why does two-pass compact-and-fill perform substantially fewer memory writes", "quiz 2 question text"))
    claims.append((f"Two-pass writes each of the {nz_quiz} non-zeroes once and each zero once (1,000 writes total), whereas swapping writes both indices on every non-zero ({sw_quiz:,} writes total)", "quiz 2 option 0 writes"))
    claims.append((f"Two-pass writes exactly n times ({nz_quiz} non-zero writes + {z_quiz} zero fills). Swapping writes two memory locations per swap on every non-zero (2 * {nz_quiz} = {sw_quiz:,} writes)", "quiz 2 explanation writes"))

    return claims


def check_prose(problems):
    md = open(os.path.join(HERE, "lesson.md"), encoding="utf-8").read()
    claims = prose_claims()
    for phrase, what in claims:
        if phrase not in md:
            problems.append(f"lesson.md is missing the recomputed phrase for {what}: {phrase!r}")
    print(f"prose        {len(claims)} phrases tied to recomputed values")


def check_quiz(problems):
    md = open(os.path.join(HERE, "lesson.md"), encoding="utf-8").read()
    q_start = md.index("```quiz")
    q_end = md.index("```", q_start + 7)
    q_json = md[q_start + 7:q_end].strip()
    data = json.loads(q_json)
    questions = data["questions"]
    if len(questions) < 2:
        problems.append(f"quiz has only {len(questions)} questions; expected at least 2")
    for i, q in enumerate(questions):
        opts = q["options"]
        ans = q["answer"]
        if not (3 <= len(opts) <= 5):
            problems.append(f"quiz Q{i+1}: expected 3-5 options, got {len(opts)}")
        if not (0 <= ans < len(opts)):
            problems.append(f"quiz Q{i+1}: answer {ans} out of bounds")
        lens = [len(o) for o in opts]
        if lens[ans] > max(l for j, l in enumerate(lens) if j != ans):
            problems.append(f"quiz Q{i+1}: answer is longer than every other option ({lens})")
        if not q.get("explanation", "").strip():
            problems.append(f"quiz Q{i+1}: missing explanation")


def main():
    problems = []
    all_cases = cases()
    want = [model_move_zeroes(c) for c in all_cases]

    # 1. Solution in Python and TypeScript matches model
    for label, got in [
        ("solution.py", run_py("solution.py", "move_zeroes", all_cases)),
        ("solution.ts", run_ts(["solution.ts"], "moveZeroes", all_cases))
    ]:
        bad = [(c, w, g) for c, w, g in zip(all_cases, want, got) if w != g]
        print(f"{label:12} {len(all_cases) - len(bad)}/{len(all_cases)} match model")
        if bad:
            problems.append(f"{label} failed on {len(bad)} cases: first {bad[:3]}")

    # 2. Mistake fails on test cases with zeroes
    def has_zero_with_elements_after(arr):
        seen_zero = False
        for x in arr:
            if x == 0:
                seen_zero = True
            elif seen_zero:
                return True
        return False

    fail_cases = [c for c in all_cases if has_zero_with_elements_after(c) or (c and c[-1] == 0 and any(x != 0 for x in c))]
    want_fail = [model_move_zeroes(c) for c in fail_cases]
    for label, got in [
        ("mistake.py", run_py("mistake.py", "move_zeroes", fail_cases)),
        ("mistake.ts", run_ts(["mistake.ts"], "moveZeroes", fail_cases))
    ]:
        wrong = sum(1 for w, g in zip(want_fail, got) if w != g)
        print(f"{label:12} fails on {wrong}/{len(fail_cases)} zero cases (expected)")
        if wrong == 0:
            problems.append(f"{label} unexpectedly passed all zero cases!")

    # 3. PURE block validation
    pure_data = run_pure()
    facts = pure_data["FACTS"]

    # Independent derivation in Python
    def py_sim_two_pass(nums):
        a = list(nums)
        write = 0
        w1, w2 = 0, 0
        for read in range(len(a)):
            if a[read] != 0:
                a[write] = a[read]
                w1 += 1
                write += 1
        for i in range(write, len(a)):
            a[i] = 0
            w2 += 1
        return a, write, w1, w2

    def py_sim_mistake(nums):
        a = list(nums)
        write = 0
        for read in range(len(a)):
            if a[read] != 0:
                a[write] = a[read]
                write += 1
        return a, write

    ex = [0, 1, 0, 3, 12]
    ex_res, ex_w, ex_w1, ex_w2 = py_sim_two_pass(ex)
    ex_m, _ = py_sim_mistake(ex)

    want_facts = {
        "exWritesPass1": ex_w1,
        "exWritesPass2": ex_w2,
        "exTotalWrites": ex_w1 + ex_w2,
        "exMistakeStr": "[" + ", ".join(map(str, ex_m)) + "]",
        "exSolutionStr": "[" + ", ".join(map(str, ex_res)) + "]",
        "staleSlotsCount": len(ex) - ex_w,
        "swapWrites64Rare": 64 * 2,
        "twoPassWrites64": 64,
        "swapWrites64Dominant": (64 - 60) * 2,
    }

    for k, v in want_facts.items():
        if facts.get(k) != v:
            problems.append(f"FACTS.{k} {facts.get(k)!r} != {v!r}")
    if set(facts) != set(want_facts):
        problems.append(f"FACTS keys {sorted(facts)} != checked keys {sorted(want_facts)}")

    # Verify cost points
    cost_pts = pure_data["COST_PTS"]
    if len(cost_pts) != 9:
        problems.append(f"COST_PTS expected 9 points, got {len(cost_pts)}")
    for z, sw, tp in cost_pts:
        if tp != 64:
            problems.append(f"COST_PTS two-pass writes != 64: {tp}")
        if sw != (64 - z) * 2:
            problems.append(f"COST_PTS swap writes != {(64 - z) * 2}: {sw}")

    # 4. Check prose claims
    check_prose(problems)

    # 5. Check quiz
    check_quiz(problems)

    # 6. Built HTML check (if dist file exists)
    dist = os.path.join(WEB, "lesson-artifacts", "dist", "arrays", "move-zeroes.html")
    if os.path.exists(dist):
        html = open(dist, encoding="utf-8").read()
        pb = pure_block()
        if pb not in html:
            problems.append("Built HTML does not embed the exact PURE block from lesson.js")
        import re
        body_text = re.sub(r"<pre[\s\S]*?</pre>|<code[\s\S]*?</code>|<script[\s\S]*?</script>", "", html)
        tex = re.search(r"\$\$[^$]+\$\$|\$(?=\S)[^$\n]*?[A-Za-z\\^_{}][^$\n]*?(?<=\S)\$(?!\d)", body_text)
        if tex:
            problems.append(f"Built HTML contains raw TeX math: {tex.group(0)!r}")
        print("dist/        verified built HTML embeds exact PURE block")

    if problems:
        print("\nERRORS:")
        for p in problems:
            print("  *", p)
        sys.exit(1)
    else:
        print("\nAll checks passed.")
        sys.exit(0)


if __name__ == "__main__":
    main()
