"""Executes the code this page shows, in Python and in TypeScript, and recomputes every number and product claim it prints.

A concept lesson has no sandbox cases, so its code is held to the course standard here:
  * code/solution.* (contains_duplicate) must match `len(set(nums)) != len(nums)` on several hundred random
    lists (empty ones included) and on the page's three predict cases;
  * code/mistake.* (the neighbour-only check) must match an independent neighbour model everywhere and be
    wrong, in both runtimes, on exactly the lists that hold a repeat with no equal neighbours, [3, 1, 3] among them;
  * the page's numbers (lesson.js between PURE:begin and PURE:end, run here in node) must equal an independent
    Python derivation: the predict answers and iteration counts, the cost chart's points, the progress model;
  * the course tables the page quotes (lesson counts by type, hints per problem lesson, problem lessons with a
    Solution tab, the two arcs' step counts) must equal the manifest, the lesson files and the course lesson;
  * each product claim the page makes is asserted against the app's source (files named below);
  * the built page must embed exactly that PURE block, so what was run here is what ships.

    python3 web/lesson-artifacts/how-lessons-work/check.py

Exit status 0 means every claim held. TypeScript is transpiled with the repo's own esbuild.
"""
import json, os, random, re, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
CODE = os.path.join(HERE, "code")
WEB = os.path.normpath(os.path.join(HERE, "..", ".."))
REPO = os.path.normpath(os.path.join(WEB, ".."))
SRC = os.path.join(WEB, "src")
ESBUILD = os.path.join(WEB, "node_modules", ".bin", "esbuild")
TSX = os.path.join(WEB, "node_modules", ".bin", "tsx")

EXAMPLES = [[3, 1, 3], [1, 2, 3], [5, 5, 1, 2]]


def cases(n=400, seed=20261014):
    rnd = random.Random(seed)
    out = [list(e) for e in EXAMPLES] + [[], [7], [7, 7], [1, 2, 1, 2], [-1, 0, -1]]
    for _ in range(n):
        size = rnd.randint(0, 12)
        out.append([rnd.randint(-5, 9 if rnd.random() < .5 else 30) for _ in range(size)])
    out += [list(range(k)) for k in range(0, 8)]  # no repeat at all, so the False path runs on every length
    return out


def truth(nums):
    return len(set(nums)) != len(nums)


def neighbours(nums):
    return any(nums[i] == nums[i - 1] for i in range(1, len(nums)))


def run_py(name, fn, all_cases):
    ns = {}
    exec(open(os.path.join(CODE, name)).read(), ns)
    return [ns[fn](list(c)) for c in all_cases]


DRIVER = r"""
const CASES = JSON.parse(require('fs').readFileSync(0, 'utf8'));
const f = process.env.FN === 'neighbours' ? containsDuplicateNeighbours : containsDuplicate;
process.stdout.write(JSON.stringify(CASES.map(c => f(c.slice()))));
"""


def run_ts(files, fn, all_cases):
    src = "\n".join(open(os.path.join(CODE, f)).read() for f in files)
    js = subprocess.run([ESBUILD, "--loader=ts", "--format=cjs"], input=src, capture_output=True, text=True, check=True).stdout
    res = subprocess.run(["node", "-e", js + DRIVER], input=json.dumps(all_cases), capture_output=True, text=True, env={**os.environ, "FN": fn})
    if res.returncode:
        raise SystemExit("TypeScript run failed:\n" + res.stderr)
    return json.loads(res.stdout)


def pure_block():
    js = open(os.path.join(HERE, "lesson.js")).read()
    a, b = js.index("/* PURE:begin"), js.index("/* PURE:end */") + len("/* PURE:end */")
    return js[a:b]


def run_pure(extra):
    res = subprocess.run(["node", "-e", pure_block() + "\n" + extra], capture_output=True, text=True)
    if res.returncode:
        raise SystemExit("lesson.js PURE block failed in node:\n" + res.stderr)
    return json.loads(res.stdout)


def iterations(nums):
    """independent instrumented copy of contains_duplicate: (answer, loop iterations, set size at the end)"""
    seen, n = set(), 0
    for x in nums:
        n += 1
        if x in seen:
            return True, n, len(seen)
        seen.add(x)
    return False, n, len(seen)


def label(r):
    return f"{'True' if r[0] else 'False'}, after {r[1]} iteration{'' if r[1] == 1 else 's'}"


def read(path):
    return open(os.path.join(SRC, path)).read()


def lessons():
    res = subprocess.run([TSX, "lesson-artifacts/manifest-dump.ts"], capture_output=True, text=True, cwd=WEB)
    if res.returncode:
        raise SystemExit("manifest dump failed:\n" + res.stderr)
    return json.loads(res.stdout)


def main():
    problems = []
    all_cases = cases()
    want = [truth(c) for c in all_cases]

    # 1. the shown solution against the model, both runtimes
    for label_, got in (("solution.py", run_py("solution.py", "contains_duplicate", all_cases)),
                        ("solution.ts", run_ts(["solution.ts"], "containsDuplicate", all_cases))):
        bad = [(c, w, g) for c, w, g in zip(all_cases, want, got) if w != g]
        print(f"{label_:12} {len(all_cases) - len(bad)}/{len(all_cases)} cases match len(set(nums)) != len(nums)")
        problems += [f"{label_}: {c} -> expected {w!r}, got {g!r}" for c, w, g in bad[:3]]

    # 2. the mistake: equals the neighbour model, and is wrong exactly where a repeat has no equal neighbour
    differs = [i for i, c in enumerate(all_cases) if neighbours(c) != truth(c)]
    for label_, got in (("mistake.py", run_py("mistake.py", "contains_duplicate_neighbours", all_cases)),
                        ("mistake.ts", run_ts(["mistake.ts"], "neighbours", all_cases))):
        model_ok = all(g == neighbours(c) for g, c in zip(got, all_cases))
        wrong = [i for i, (g, w) in enumerate(zip(got, want)) if g != w]
        print(f"{label_:12} matches the neighbour model: {model_ok}; wrong on {len(wrong)} of {len(all_cases)} cases; [3, 1, 3] -> {got[0]}")
        if not model_ok or wrong != differs or not wrong or got[0] is not False:
            problems.append(f"{label_}: expected to be wrong on exactly {len(differs)} lists and False on [3, 1, 3]")

    # 3. the page's numbers, from its own PURE block, against an independent derivation
    page = run_pure(r"""
process.stdout.write(JSON.stringify({
  FACTS: FACTS, COSTS: COSTS, CORPUS: CORPUS, KINDS: PG_KINDS, CHOICES: CD_CHOICES,
  predict: CD_PREDICT.map(function(c){return {nums:c.nums, expect:c.expect, seen:c.run.seen, trace:c.trace};}),
  arcs: {concept: HW.concept.steps.length, problem: HW.problem.steps.length},
  tabs: HW.problem.steps.map(function(s){return s.tab || null;}),
  neigh: [[3,1,3],[1,2,3],[5,5,1,2],[],[2,2]].map(function(a){return cdNeighbours(a);}),
  model: (function(){
    var seqs=[[{k:'open',id:'d'}],[{k:'open',id:'a'},{k:'open',id:'a'},{k:'open',id:'c'}],[{k:'solve',id:'e'},{k:'quiz'},{k:'quiz'}],
      [{k:'open',id:'a'},{k:'open',id:'b'},{k:'open',id:'c'},{k:'open',id:'d'},{k:'solve',id:'d'},{k:'quiz'}],[]];
    return seqs.map(function(q){var s={visited:[],solved:[],quiz:0};q.forEach(function(x){s=pgApply(s,x);});return {seq:q,visited:s.visited.length,solved:s.solved.length,quiz:s.quiz,chip:pgChip(s)};});
  })(),
  where: [false,true].map(function(sg){return PG_KINDS.map(function(k){return pgWhere(k,sg);});})
}));""")
    F = page["FACTS"]
    for k, p in enumerate(page["predict"]):
        r = iterations(EXAMPLES[k])
        ok = p["nums"] == EXAMPLES[k] and p["expect"] == label(r) and p["seen"] == r[2] and label(r) in page["CHOICES"]
        print(f"predict {k}: {p['nums']} -> {p['expect']!r}  {'ok' if ok else 'MISMATCH'}")
        if not ok:
            problems.append(f"predict {k}: page {p['expect']!r}/{p['seen']}, derived {label(r)!r}/{r[2]}")
    if [p["expect"] for p in page["predict"]] != ["True, after 3 iterations", "False, after 3 iterations", "True, after 2 iterations"]:
        problems.append("the three predict answers are not the ones the page's explanation relies on")
    # the trace text names the same iteration the answer does
    for p in page["predict"]:
        r = iterations(p["nums"])
        if len(p["trace"]) != r[1] + (0 if r[0] else 1):
            problems.append(f"trace length for {p['nums']}")
    for (n, worst, best) in page["COSTS"]:
        d = list(range(n)); e = list(range(n)); e[1] = e[0]
        if (worst, best) != (iterations(d)[1], iterations(e)[1]) or worst != n or best != 2:
            problems.append(f"cost point {n}: page {worst}/{best}")
    if (F["costN"], F["worstAt"], F["bestAt"]) != (100, 100, 2):
        problems.append(f"cost facts {F}")
    print(f"cost: at {F['costN']} items no repeat takes {F['worstAt']} iterations, a repeat in the first two takes {F['bestAt']}")
    if page["neigh"] != [neighbours(a) for a in ([3, 1, 3], [1, 2, 3], [5, 5, 1, 2], [], [2, 2])]:
        problems.append("page's cdNeighbours disagrees with the Python neighbour model")
    # the progress model, recomputed independently
    for m in page["model"]:
        vis, sol, quiz = [], [], 0
        types = {"a": "concept", "b": "concept", "c": "practice", "d": "problem", "e": "problem"}
        for a in m["seq"]:
            if a["k"] == "open" and a["id"] not in vis: vis.append(a["id"])
            if a["k"] == "solve":
                if a["id"] not in vis: vis.append(a["id"])
                if a["id"] not in sol: sol.append(a["id"])
            if a["k"] == "quiz": quiz += 1
        chip = sum(1 for i in vis if types[i] != "problem")
        if (m["visited"], m["solved"], m["quiz"], m["chip"]) != (len(vis), len(sol), quiz, chip):
            problems.append(f"progress model on {m['seq']}: page {m}, derived {(len(vis), len(sol), quiz, chip)}")
    print("progress model: 5 sequences match the independent model; problem lessons never move the chip")

    # 4. the course tables
    rows = lessons()
    types = {}
    for r in rows:
        types[r["type"]] = types.get(r["type"], 0) + 1
    C = page["CORPUS"]
    if C["types"] != {"concept": types["concept"], "practice": types["practice"], "problem": types["problem"]}:
        problems.append(f"lesson types: page {C['types']}, manifest {types}")
    if C["navTotal"] != types["concept"] + types["practice"] or F["navTotal"] != C["navTotal"]:
        problems.append(f"nav total {C['navTotal']} != concept + practice in the manifest")
    hints, with_solution, opening_ok, reveal_first = {}, 0, 0, 0
    for r in rows:
        if r["type"] != "problem":
            continue
        text = open(os.path.join(REPO, "courses", "dsa", r["module"], r["id"].split("/")[1] + ".md")).read()
        n = len(re.findall(r"^`{3,}reveal Hint", text, re.M))
        hints[n] = hints.get(n, 0) + 1
        # the app's own rule (splitProblemTabs.ts): a top-level "## Solution" heading starts the Solution tab
        with_solution += 1 if re.search(r"^## Solution\b[^\n]*", text, re.M) else 0
        reveal_first += 1 if re.search(r"^## Solution\b[^\n]*\n+`{3,}reveal ", text, re.M) else 0
        heads = re.findall(r"^## (.*)$", text, re.M)
        opening_ok += 1 if heads[:2] == ["Problem", "Attempt it first"] else 0
    if {str(k): v for k, v in C["hints"].items()} != {str(k): v for k, v in sorted(hints.items())}:
        problems.append(f"hints per problem lesson: page {C['hints']}, lesson files {hints}")
    if with_solution != types["problem"]:
        problems.append(f"the page says every problem lesson has a Solution tab; only {with_solution} of {types['problem']} do")
    if reveal_first < 0.95 * types["problem"]:
        problems.append(f"the page says almost every solution sits in a reveal; only {reveal_first} of {types['problem']} do")
    if opening_ok != types["problem"]:
        problems.append(f"only {opening_ok} of {types['problem']} problem lessons open Problem, Attempt it first")
    print(f"corpus: {types['concept']} concept + {types['practice']} practice = {C['navTotal']} counted by the header; "
          f"{types['problem']} problem lessons, hints {dict(sorted(hints.items()))}, {with_solution} with a Solution tab, {reveal_first} with the solution in a reveal")
    course = open(os.path.join(REPO, "courses", "dsa", "getting-started", "how-lessons-work.md")).read()
    concept_items = len(re.findall(r"^\d+\. \*", course, re.M))
    flat = re.sub(r"\s+", " ", course)
    arrow = re.search(r"solve-first: (statement and constraints .*? variants)\.", flat)
    problem_items = len(arrow.group(1).split("→")) if arrow else -1
    if (page["arcs"]["concept"], page["arcs"]["problem"]) != (concept_items, problem_items) or (F["conceptSteps"], F["problemSteps"]) != (concept_items, problem_items):
        problems.append(f"arcs: page {page['arcs']}, course lesson {concept_items}/{problem_items}")
    print(f"arcs: {concept_items} concept steps and {problem_items} problem steps match the course lesson")
    if page["tabs"] != ["Description", "Code (beside the description on a wide screen)", "Explanation", "Explanation", "Explanation", "Solution", "Solution"]:
        problems.append("problem arc tab placement changed; re-verify against ProblemWorkspace.tsx and splitProblemTabs.ts")

    # 5. product claims, each asserted against the source it came from
    claims = [
        ("quiz answers are stored in localStorage under dsa-course-quiz", "components/course/Quiz.tsx",
         [r'STORAGE_KEY = "dsa-course-quiz"', r"localStorage\.setItem\(STORAGE_KEY"]),
        ("a problem is solved when every case passes", "components/sandbox/Sandbox.tsx",
         [r"allPassed = results !== null && passed === total", r"if \(allPassed\) onSolved"]),
        ("opening a lesson marks it visited", "components/providers/VisitTracker.tsx", [r"markVisited\(id\)"]),
        ("the header chip counts concept and practice lessons only", "lib/course/manifest.ts",
         [r'lesson\.type === "concept" \|\| lesson\.type === "practice"', r"allLessonsNavIds\(\)[^{]*\{\s*return MODULES\.flatMap"]),
        ("the shell's progress denominator is allLessonsNavIds", "components/layout/AppShell.tsx", [r"allLessonsNavIds\(\)"]),
        ("the header shows visited/total", "components/layout/Header.tsx", [r"\{visitedCount\}/\{totalCount\}"]),
        ("problem tabs are Description, Explanation, Solution, Quiz", "components/problems/ProblemWorkspace.tsx",
         [r'label: "Description"', r'label: "Explanation"', r'label: "Solution"', r'label: "Quiz"']),
        ("a top-level ## Solution heading starts the Solution tab; the quiz fence gets its own tab", "lib/content/splitProblemTabs.ts",
         [r"\^## Solution", r"QUIZ_FENCE"]),
        ("a closed reveal renders nothing; each reveal has its own state", "components/course/Reveal.tsx",
         [r"useState\(false\)", r"\{open \? \("]),
        ("code blocks follow one global language preference with a menu", "components/course/CodeTabs.tsx",
         [r"useCodeLang\(\)", r"<CodeLangMenu"]),
        ("a solved problem shows a Solved chip", "components/problems/ProblemWorkspace.tsx", [r"isSolved \?", r"Solved"]),
        ("the only synced mark kinds are visited and solved", "lib/progress/types.ts", [r'MarkKind = "visited" \| "solved"']),
        ("problem sandbox drafts sync; quiz answers are not in the synced key set", "lib/progress/localStore.ts", [r"\^dsa:sandbox:"]),
    ]
    for what, path, pats in claims:
        text = read(path)
        miss = [p for p in pats if not re.search(p, text)]
        print(f"claim {'ok ' if not miss else 'FAIL'}  {path}: {what}")
        if miss:
            problems.append(f"{path}: claim '{what}' no longer matches {miss}")
    store = read("lib/progress/localStore.ts")
    synced = re.search(r"const SYNCED = \[(.*?)\];", store, re.S)
    regexes = re.findall(r"/(\^[^/]+)/", synced.group(1)) if synced else []
    if any(re.search(r, "dsa-course-quiz") for r in regexes) or not any(re.search(r, "dsa:sandbox:two-sum:python") for r in regexes) \
            or not any(re.search(r, "dsa-course-progress") for r in regexes):
        problems.append(f"synced key patterns {regexes} no longer say: visited and drafts sync, dsa-course-quiz does not")
    kinds = {k["id"]: k["syncs"] for k in page["KINDS"]}
    if kinds != {"visited": True, "solved": True, "drafts": True, "quiz": False}:
        problems.append(f"progress model kinds {kinds}")
    if page["where"][0] != ["this browser only"] * 4 or page["where"][1] != ["this browser, and your account"] * 3 + ["this browser only"]:
        problems.append(f"where text {page['where']}")

    # 6. the built page embeds exactly the block that was run
    built = os.path.join(WEB, "lesson-artifacts", "dist", "getting-started", "how-lessons-work.html")
    if os.path.exists(built):
        if pure_block() not in open(built).read():
            problems.append("the built page does not embed the PURE block verbatim (rebuild it)")
        else:
            print("built page embeds the PURE block verbatim")
    else:
        problems.append("no built page: run build.py how-lessons-work first")

    for p in problems:
        print("  " + p)
    if problems:
        raise SystemExit("FAILED")
    print("all claims hold")


if __name__ == "__main__":
    main()
