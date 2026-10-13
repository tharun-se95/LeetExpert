"""Executes the code this page shows, in Python and in TypeScript, and recomputes what the page states.

A concept lesson has no sandbox cases, so its code is held to the course standard here:
  * code/solution.* (is_valid_order) must agree with an independent model (positions found with list.index,
    no dict) on several hundred random orders of random dependency graphs, on the course's real table and on
    the page's five presets, in Python and in TypeScript;
  * code/mistake.* (adjacent pairs only) must accept at least one order the model rejects in both runtimes,
    and must reject exactly what the page says (Strings before Arrays) while accepting the other two broken presets;
  * the page's own logic (lesson.js between PURE-BEGIN and PURE-END, run here in node) must give the same
    verdict as the files on every case, and its presets must give the verdicts the prose describes;
  * the module list, the stage list, the counts and the module titles the page names must equal the app's manifest
    (src/lib/course/manifest.ts), the course folders and the page's own sentences, so a course change fails here;
  * every link points to an earlier module in the course's own order, has a reason, and is not listed twice;
  * the built page embeds exactly the PURE block that was run.

    python3 web/lesson-artifacts/course-roadmap/check.py

Exit status 0 means every claim held. TypeScript is transpiled with the repo's own esbuild.
"""
import json, os, random, re, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
CODE = os.path.join(HERE, "code")
WEB = os.path.normpath(os.path.join(HERE, "..", ".."))
REPO = os.path.normpath(os.path.join(WEB, ".."))
ESBUILD = os.path.join(WEB, "node_modules", ".bin", "esbuild")
TSX = os.path.join(WEB, "node_modules", ".bin", "tsx")
NUMBER_WORDS = {1: "one", 2: "two", 3: "three", 4: "four", 5: "five", 6: "six", 7: "seven", 8: "eight", 9: "nine"}


def block(js, tag):
    a, b = js.index(f"/*{tag}-BEGIN*/"), js.index(f"/*{tag}-END*/") + len(f"/*{tag}-END*/")
    return js[a:b]


LESSON_JS = open(os.path.join(HERE, "lesson.js")).read()
DATA, PURE = block(LESSON_JS, "DATA"), block(LESSON_JS, "PURE")


def node_json(expr, stdin=None):
    res = subprocess.run(["node", "-e", DATA + "\n" + PURE + "\nprocess.stdout.write(JSON.stringify(" + expr + "))"],
                         capture_output=True, text=True, input=stdin)
    if res.returncode:
        raise SystemExit("lesson.js DATA/PURE block failed in node:\n" + res.stderr)
    return json.loads(res.stdout)


def model(order, deps):
    """independent: positions via list.index, every link must put the needed module strictly earlier"""
    if len(set(order)) != len(order):
        return False
    for name, needs in deps.items():
        if name not in order:
            return False
        for d in needs:
            if d not in order or not order.index(d) < order.index(name):
                return False
    return True


def neighbours(order, deps):
    """independent copy of the shortcut the page warns about"""
    return not any(order[i + 1] in deps.get(order[i], []) for i in range(len(order) - 1))


def random_dag(rnd):
    n = rnd.randint(2, 9)
    names = [f"m{i}" for i in range(n)]
    hidden = names[:]
    rnd.shuffle(hidden)  # a hidden topological order; links only point backwards in it
    deps = {m: [] for m in names}
    for j in range(n):
        for i in range(j):
            if rnd.random() < 0.35:
                deps[hidden[j]].append(hidden[i])
    return names, hidden, deps


def orders_for(names, hidden, rnd):
    out = [hidden[:], names[:]]
    for _ in range(6):
        o = names[:]
        rnd.shuffle(o)
        out.append(o)
    o = hidden[:]
    if len(o) > 1:
        i = rnd.randrange(len(o) - 1)
        o[i], o[i + 1] = o[i + 1], o[i]
        out.append(o)                      # one adjacent swap
    out.append(hidden[:-1])                # a module missing
    out.append(hidden + [hidden[0]])       # a module twice
    out.append(hidden + ["stranger"])      # a module the table never names
    return out


def build_cases(real, seed=20261014):
    rnd = random.Random(seed)
    cases = []
    for _ in range(80):
        names, hidden, deps = random_dag(rnd)
        cases += [(o, deps) for o in orders_for(names, hidden, rnd)]
    slugs = list(real["order"])
    for _ in range(150):
        o = slugs[:]
        k = rnd.choice([0, 1, 2, 3, 40])
        if k == 40:
            rnd.shuffle(o)
        for _ in range(k):
            i, j = rnd.randrange(len(o)), rnd.randrange(len(o))
            o[i], o[j] = o[j], o[i]
        if rnd.random() < 0.1:
            o.pop(rnd.randrange(len(o)))
        if rnd.random() < 0.05:
            o.append(o[0])
        cases.append((o, real["deps"]))
    cases += [(p["order"], real["deps"]) for p in real["presets"]]
    cases += [([], {}), (["a"], {"a": []}), (["a", "b"], {"b": ["a"]}), (["b", "a"], {"b": ["a"]}), (["a"], {"a": ["a"]}), (["a", "b"], {"a": ["b"], "b": ["a"]})]
    return cases


def run_py(name, fn, cases):
    ns = {}
    exec(open(os.path.join(CODE, name)).read(), ns)
    return [ns[fn](list(o), {k: list(v) for k, v in d.items()}) for o, d in cases]


DRIVER = r"""
const CASES = JSON.parse(require('fs').readFileSync(0, 'utf8'));
const f = process.env.FN === 'neighbours' ? isValidOrderNeighbours : isValidOrder;
process.stdout.write(JSON.stringify(CASES.map(c => f(c[0].slice(), c[1]))));
"""


def run_ts(files, fn, cases):
    src = "\n".join(open(os.path.join(CODE, f)).read() for f in files)
    js = subprocess.run([ESBUILD, "--loader=ts", "--format=cjs"], input=src, capture_output=True, text=True, check=True).stdout
    res = subprocess.run(["node", "-e", js + DRIVER], input=json.dumps(cases), capture_output=True, text=True,
                         env={**os.environ, "FN": fn})
    if res.returncode:
        raise SystemExit("TypeScript run failed:\n" + res.stderr)
    return json.loads(res.stdout)


def manifest():
    code = ('import {MODULES,STAGES} from "./src/lib/course/manifest";'
            'console.log(JSON.stringify({stages:STAGES.map(s=>({n:s.number,t:s.title,d:s.description})),'
            'modules:MODULES.map(m=>({slug:m.slug,title:m.title,stage:m.stage,lessons:m.lessons.map(l=>l.title)}))}))')
    res = subprocess.run([TSX, "-e", code], capture_output=True, text=True, cwd=WEB)
    if res.returncode:
        raise SystemExit("manifest dump failed:\n" + res.stderr)
    return json.loads(res.stdout)


def main():
    problems = []
    real = node_json("{order:rmCourseOrder(),deps:rmDeps(),links:RM_DEPS,presets:RM_PRESETS,mods:RM_MODS,stages:RM_STAGES}")
    cases = build_cases(real)
    want = [model(o, d) for o, d in cases]
    print(f"{len(cases)} cases: {sum(want)} valid, {len(cases) - sum(want)} invalid (the model's verdicts)")
    if sum(want) < 40 or len(cases) - sum(want) < 200:
        problems.append("the case mix is too one-sided to test anything")

    # 1. the shown solution against the model, both runtimes, and the page's JavaScript port
    runs = [("solution.py", run_py("solution.py", "is_valid_order", cases)),
            ("solution.ts", run_ts(["solution.ts"], "isValidOrder", cases)),
            ("lesson.js", node_json("JSON.parse(require('fs').readFileSync(0,'utf8')).map(function(c){return rmValid(c[0],c[1]);})", json.dumps(cases)))]
    for label, got in runs:
        bad = [(c, w, g) for c, w, g in zip(cases, want, got) if w != g]
        print(f"{label:12} {len(cases) - len(bad)}/{len(cases)} cases match the model")
        problems += [f"{label}: {c[0]} -> expected {w}, got {g}" for c, w, g in bad[:3]]

    # 2. the mistake accepts orders the model rejects, in both runtimes, and the page's port of it agrees
    nb = [neighbours(o, d) for o, d in cases]
    accepted_wrongly = [i for i in range(len(cases)) if nb[i] and not want[i]]
    for label, got in (("mistake.py", run_py("mistake.py", "is_valid_order", cases)),
                       ("mistake.ts", run_ts(["mistake.ts"], "neighbours", cases)),
                       ("lesson.js", node_json("JSON.parse(require('fs').readFileSync(0,'utf8')).map(function(c){return rmNeighbours(c[0],c[1]);})", json.dumps(cases)))):
        wrong = [i for i in range(len(cases)) if got[i] != want[i]]
        print(f"{label:12} wrong on {len(wrong)} cases, accepts {sum(1 for i in wrong if got[i])} invalid orders")
        if got != nb:
            problems.append(f"{label}: differs from the independent neighbour model")
        if not any(got[i] and not want[i] for i in range(len(cases))):
            problems.append(f"{label}: accepts no invalid order, so it is not the mistake the page describes")
    if not accepted_wrongly:
        problems.append("no case separates the mistake from the model")

    # 3. the page's presets and the sentences about them
    names = [p["name"] for p in real["presets"]]
    pv = [model(p["order"], real["deps"]) for p in real["presets"]]
    pn = [neighbours(p["order"], real["deps"]) for p in real["presets"]]
    print("presets", list(zip(names, pv, pn)))
    if pv != [True, False, False, False, False]:
        problems.append(f"preset verdicts {pv}")
    if pn[3] is not True or pn[4] is not True or pn[2] is not False:
        problems.append(f"neighbour check on presets {pn}: it must miss 'Recursion after Heaps' and 'Hash Tables left out' and catch 'Strings before Arrays'")
    order = real["order"]
    moved = next(p for p in real["presets"] if p["name"] == "Recursion after Heaps")["order"]
    if not moved.index("binary-trees") < moved.index("recursion-backtracking") or moved.index("recursion-backtracking") != moved.index("heaps") + 1:
        problems.append("'Recursion after Heaps' is not what the prose says")

    # 4. the table: every link names real modules, has a reason, points back in the course order, no repeats
    slugs = {m["slug"] for m in real["mods"]}
    seen = set()
    for a, b, why in real["links"]:
        if a not in slugs or b not in slugs or (a, b) in seen or not why.strip():
            problems.append(f"bad link {a} > {b}")
        seen.add((a, b))
        if order.index(b) >= order.index(a):
            problems.append(f"link {a} > {b} points forward in the course order")
    print(f"table: {len(real['links'])} links, all with a reason, all pointing to an earlier module")

    # 5. the course itself: DATA equals the manifest, and the page's sentences state the manifest's counts
    m = manifest()
    want_mods = [{"slug": x["slug"], "title": x["title"], "stage": x["stage"]} for x in m["modules"]]
    got_mods = [{k: x[k] for k in ("slug", "title", "stage")} for x in real["mods"]]
    if want_mods != got_mods:
        problems.append("RM_MODS differs from manifest.ts MODULES (slug, title, stage or order)")
    if [[s["n"], s["t"], s["d"]] for s in m["stages"]] != [[s["n"], s["title"], s["description"]] for s in real["stages"]]:
        problems.append("RM_STAGES differs from manifest.ts STAGES")
    nm, ns_ = len(m["modules"]), len(m["stages"])
    md = open(os.path.join(HERE, "lesson.md")).read()
    folders = sorted(d for d in os.listdir(os.path.join(REPO, "courses", "dsa")) if os.path.isdir(os.path.join(REPO, "courses", "dsa", d)))
    if sorted(x["slug"] for x in m["modules"]) != folders:
        problems.append(f"manifest modules differ from the courses/dsa folders: {folders}")
    said = re.findall(r"(?<!Stage )\b(\d+) modules", md)
    if not said or any(int(x) != nm for x in said):
        problems.append(f"the page says {said} modules, the manifest has {nm}")
    if f"The {nm} modules" not in md or f"{NUMBER_WORDS[ns_]} stages" not in md or NUMBER_WORDS[ns_] != "five":
        problems.append(f"the page does not state {nm} modules and {ns_} (five) stages")
    sizes = [sum(1 for x in m["modules"] if x["stage"] == s["n"]) for s in m["stages"]]
    print(f"course: {nm} modules in {ns_} stages {sizes}, equal to manifest.ts and the courses/dsa folders")
    for t in ("Big O & Complexity Analysis", "Course Schedule", "Course Schedule II"):
        if t not in [x["title"] for x in m["modules"]] + [l for x in m["modules"] if x["slug"] == "graphs" for l in x["lessons"]]:
            problems.append(f"{t!r} is not a module or a graphs lesson in the manifest")
        if t not in md:
            problems.append(f"{t!r} is not named on the page")
    for t in ("Recursion & Backtracking", "Binary Trees", "Heaps", "Sliding Window"):
        if t not in [x["title"] for x in m["modules"]] or t not in md:
            problems.append(f"module title {t!r} is not in both the manifest and the page")

    # 6. the built page embeds exactly the blocks that were run
    built = os.path.join(WEB, "lesson-artifacts", "dist", "getting-started", "course-roadmap.html")
    if os.path.exists(built):
        html = open(built).read()
        if PURE not in html or DATA not in html:
            problems.append("the built page does not embed the DATA and PURE blocks verbatim (rebuild it)")
        else:
            print("built page embeds the DATA and PURE blocks verbatim")
    else:
        problems.append("no built page: run build.py getting-started/course-roadmap first")

    for p in problems:
        print("  " + p)
    if problems:
        raise SystemExit("FAILED")
    print("all claims hold")


if __name__ == "__main__":
    main()
