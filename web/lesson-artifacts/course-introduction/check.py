"""Executes the code this page shows, in Python and in TypeScript, and recomputes every number it prints.

A concept lesson has no sandbox cases, so its code is held to the course standard here:
  * code/solution.* (first_repeat) must match a brute-force O(n^2) model on several hundred random lists
    of integers, letters and words (empty ones included) and on the page's three examples;
  * code/mistake.* (the two lines swapped) must be wrong in both runtimes: it returns the first item of
    every non-empty list, which is what the page's "Watch out" says;
  * the page's own numbers (lesson.js between PURE:begin and PURE:end, run here in node) must equal an
    independent Python derivation: the problems' answers, the recipe-shelf and technique scores, and the
    nested-loop comparison counts and set-check counts behind the chart;
  * the module and stage counts, stage names and the lesson and module titles the page names must equal
    the app's manifest (src/lib/course/manifest.ts), so a course change fails this gate;
  * the built page must embed exactly that PURE block, so what was run here is what ships.

    python3 web/lesson-artifacts/course-introduction/check.py

Exit status 0 means every claim held. TypeScript is transpiled with the repo's own esbuild.
"""
import json, os, random, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
CODE = os.path.join(HERE, "code")
WEB = os.path.normpath(os.path.join(HERE, "..", ".."))
ESBUILD = os.path.join(WEB, "node_modules", ".bin", "esbuild")
TSX = os.path.join(WEB, "node_modules", ".bin", "tsx")

# the page's three problems (item lists) and what first_repeat must answer on each
EXAMPLES = [[4, 9, 2, 7, 9, 5], list("balloon"), "the cat saw the dog".split(" ")]
EXPECT = [9, "l", "the"]
WORDS = ["the", "cat", "saw", "dog", "a", "and", "sat", "on", "mat", ""]


def cases(n=400, seed=20261013):
    rnd = random.Random(seed)
    out = [list(e) for e in EXAMPLES] + [[]]
    for _ in range(n):
        size = rnd.randint(0, 12)
        pool = rnd.choice([range(0, 6), range(0, 30), "abcde", "abcdefghijklmnopqrstuvwxyz", WORDS])
        out.append([rnd.choice(list(pool)) for _ in range(size)])
    # lists with no repeat at all, so the None path is exercised on every kind
    out += [list(range(k)) for k in range(0, 8)] + [list("abcdef"), WORDS[:5]]
    return out


def model(items):
    """brute force: the first position whose item equals an earlier one"""
    for i in range(len(items)):
        for j in range(i):
            if items[j] == items[i]:
                return items[i]
    return None


def run_py(name, fn, all_cases):
    ns = {}
    exec(open(os.path.join(CODE, name)).read(), ns)
    return [ns[fn](list(c)) for c in all_cases]


DRIVER = r"""
const CASES = JSON.parse(require('fs').readFileSync(0, 'utf8'));
const f = process.env.FN === 'swapped' ? firstRepeatSwapped : firstRepeat;
process.stdout.write(JSON.stringify(CASES.map(c => f(c.slice()))));
"""


def run_ts(files, fn, all_cases):
    src = "\n".join(open(os.path.join(CODE, f)).read() for f in files)
    js = subprocess.run([ESBUILD, "--loader=ts", "--format=cjs"], input=src, capture_output=True, text=True, check=True).stdout
    res = subprocess.run(["node", "-e", js + DRIVER], input=json.dumps(all_cases), capture_output=True, text=True,
                         env={**os.environ, "FN": fn})
    if res.returncode:
        raise SystemExit("TypeScript run failed:\n" + res.stderr)
    return json.loads(res.stdout)


def pure_block():
    js = open(os.path.join(HERE, "lesson.js")).read()
    a, b = js.index("/* PURE:begin"), js.index("/* PURE:end */") + len("/* PURE:end */")
    return js[a:b]


def run_pure():
    probe = pure_block() + r"""
process.stdout.write(JSON.stringify({
  FACTS: FACTS, COSTS: COSTS, COURSE: COURSE,
  problems: PROBLEMS.map(p => ({title: p.title, items: p.items, tech: frRepeat(p.items), nested: frNested(p.items), card: frCard(p) === undefined ? null : frCard(p)})),
  shelf: Object.keys(SHELF)
}));"""
    res = subprocess.run(["node", "-e", probe], capture_output=True, text=True)
    if res.returncode:
        raise SystemExit("lesson.js PURE block failed in node:\n" + res.stderr)
    return json.loads(res.stdout)


def manifest():
    code = ('import {MODULES,STAGES} from "./src/lib/course/manifest";'
            'console.log(JSON.stringify({stages:STAGES.map(s=>({n:s.number,t:s.title,m:MODULES.filter(x=>x.stage===s.number).length})),'
            'modules:MODULES.map(m=>({slug:m.slug,title:m.title,lessons:m.lessons.map(l=>l.title)}))}))')
    res = subprocess.run([TSX, "-e", code], capture_output=True, text=True, cwd=WEB)
    if res.returncode:
        raise SystemExit("manifest dump failed:\n" + res.stderr)
    return json.loads(res.stdout)


def nested_count(items):
    """independent instrumented copy of the nested-loop version, counting the comparisons it makes"""
    n = 0
    for i in range(len(items)):
        for j in range(i):
            n += 1
            if items[j] == items[i]:
                return items[i], n
    return None, n


def set_count(items):
    """independent instrumented copy of first_repeat, counting the membership questions it asks"""
    seen, n = set(), 0
    for x in items:
        n += 1
        if x in seen:
            return x, n
        seen.add(x)
    return None, n


def main():
    problems = []
    all_cases = cases()
    want = [model(c) for c in all_cases]

    # 1. the shown solution against the model, both runtimes
    for label, got in (("solution.py", run_py("solution.py", "first_repeat", all_cases)),
                       ("solution.ts", run_ts(["solution.ts"], "firstRepeat", all_cases))):
        bad = [(c, w, g) for c, w, g in zip(all_cases, want, got) if w != g]
        print(f"{label:12} {len(all_cases) - len(bad)}/{len(all_cases)} cases match the brute-force model")
        problems += [f"{label}: {c} -> expected {w!r}, got {g!r}" for c, w, g in bad[:3]]
    for k, ex in enumerate(EXAMPLES):
        if model(ex) != EXPECT[k]:
            problems.append(f"model disagrees with the page's example {k}")

    # 2. the mistake is wrong in both runtimes, and wrong in the way the page says: it returns the first item
    nonempty = [i for i, c in enumerate(all_cases) if c]
    differs = [i for i in range(len(all_cases)) if want[i] != (all_cases[i][0] if all_cases[i] else None)]
    for label, got in (("mistake.py", run_py("mistake.py", "first_repeat_swapped", all_cases)),
                       ("mistake.ts", run_ts(["solution.ts", "mistake.ts"], "swapped", all_cases))):
        first = all(got[i] == all_cases[i][0] for i in nonempty)
        wrong = sum(1 for g, w in zip(got, want) if g != w)
        print(f"{label:12} returns the first item on {len(nonempty)}/{len(nonempty)} non-empty lists: {first}; wrong on {wrong} cases")
        if not first or wrong == 0 or wrong != len(differs):
            problems.append(f"{label}: expected the first item every time, wrong on exactly {len(differs)} cases")
        ex = [got[k] for k in range(3)]
        if ex[0] != 4:
            problems.append(f"{label}: the page says [4, 9, 2, 7, 9, 5] gives 4, got {ex[0]!r}")

    # 3. the page's numbers, from its own PURE block, against an independent derivation
    page = run_pure()
    F = page["FACTS"]
    for k, p in enumerate(page["problems"]):
        sol, comps = nested_count(p["items"])
        s2, checks = set_count(p["items"])
        ok = (p["tech"]["answer"] == EXPECT[k] == s2 == sol and p["tech"]["checks"] == checks and p["nested"]["compares"] == comps)
        print(f"problem {k}: {p['title']!r} -> {p['tech']['answer']!r} in {p['tech']['checks']} checks (nested loops: {p['nested']['compares']} comparisons)  {'ok' if ok else 'MISMATCH'}")
        if not ok:
            problems.append(f"problem {k}: page {p['tech']} / {p['nested']}, derived {s2!r}/{checks}/{comps}")
    card_hits = sum(1 for p in page["problems"] if p["card"] is not None)
    if (card_hits, F["recipeHits"], F["techHits"], F["problems"]) != (1, 1, 3, 3) or page["problems"][0]["card"] != 9:
        problems.append(f"shelf scores: {card_hits}/{F['recipeHits']}/{F['techHits']}/{F['problems']}")
    for (n, comparisons, checks), derived in zip(page["COSTS"], range(10, 101, 10)):
        d = list(range(derived))
        if (n, comparisons, checks) != (derived, nested_count(d)[1], set_count(d)[1]) or comparisons != derived * (derived - 1) // 2 or checks != derived:
            problems.append(f"cost point {n}: page {comparisons}/{checks}")
    last = page["COSTS"][-1]
    if (F["costN"], F["nestedAt"], F["setAt"], F["ratio"]) != (100, f"{last[1]:,}", f"{last[2]:,}", round(last[1] / last[2])):
        problems.append(f"cost readout facts: {F}")
    print(f"cost: at {F['costN']} items the nested loops make {F['nestedAt']} comparisons, the set asks {F['setAt']}: {F['ratio']}x")

    # 4. the course itself
    m = manifest()
    stages = [[s["t"], s["m"]] for s in m["stages"]]
    if page["COURSE"]["stages"] != stages:
        problems.append(f"stage table {page['COURSE']['stages']} != manifest {stages}")
    if F["modules"] != len(m["modules"]) or F["stages"] != len(m["stages"]):
        problems.append(f"counts {F['modules']} modules / {F['stages']} stages != manifest {len(m['modules'])} / {len(m['stages'])}")
    titles = {x["title"] for x in m["modules"]}
    md = open(os.path.join(HERE, "lesson.md")).read()
    for t in ("Big O & Complexity Analysis", "Hash Tables"):
        if t not in titles or t not in md:
            problems.append(f"module title {t!r} is not in both the manifest and the page")
    if "How Lessons & Problems Work" not in [l for x in m["modules"] if x["slug"] == "getting-started" for l in x["lessons"]]:
        problems.append("the next lesson's title is not in the manifest")
    print(f"course: {F['modules']} modules in {F['stages']} stages match manifest.ts; stage names and sizes {[s[1] for s in stages]}")

    # 5. the built page embeds exactly the block that was run
    built = os.path.join(WEB, "lesson-artifacts", "dist", "getting-started", "course-introduction.html")
    if os.path.exists(built):
        if pure_block() not in open(built).read():
            problems.append("the built page does not embed the PURE block verbatim (rebuild it)")
        else:
            print("built page embeds the PURE block verbatim")
    else:
        problems.append("no built page: run build.py course-introduction first")

    for p in problems:
        print("  " + p)
    if problems:
        raise SystemExit("FAILED")
    print("all claims hold")


if __name__ == "__main__":
    main()
