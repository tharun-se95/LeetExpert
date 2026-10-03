"""Runs every spot-the-bug snippet (#135) and writes facts.json, the only source of the values
the slides show. verify.mjs reruns all of it in JavaScript and fails on any difference.

For each bugs/<id>/ (bug.json names the lesson and the input that breaks the bug):
  - the lesson's reference solution (web/tests/reference/<module>/<id>.py) must give every
    sandbox case its expected value, so the oracle is the one the course itself is checked by
  - fixed.py must pass every case of the lesson's sandbox
  - buggy.py must give a wrong answer on the named input, judged against the reference
  - which lesson cases buggy.py still passes is recorded, so "passes the sample test" is a fact

  python3 verify.py && node verify.mjs
"""
import copy
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
FACTS = HERE / "facts.json"


def sandbox(lesson):
    text = (ROOT / lesson).read_text()
    return json.loads(text.split("```sandbox\n", 1)[1].split("\n```", 1)[0])


def load(path, name):
    scope = {}
    exec(Path(path).read_text(), scope)
    return scope[name]


def run(fn, args, box):
    """What the sandbox would compare: the return value, or the mutated first argument."""
    args = copy.deepcopy(args)
    out = fn(*args)
    return args[0] if box.get("check") == "mutate" else out


def same(a, b, box):
    if box.get("compare") == "set-of-sets":
        norm = lambda xs: sorted(sorted(x) for x in xs)
        return norm(a) == norm(b)
    return a == b


def facts_for(d):
    bug = json.loads((d / "bug.json").read_text())
    box = sandbox(bug["lesson"])
    name = box["fn"]["python"]
    module = Path(bug["lesson"]).parent.name
    ref = load(ROOT / "web/tests/reference" / module / f"{box['id']}.py", name)
    buggy, fixed = load(d / "buggy.py", name), load(d / "fixed.py", name)
    passes = []
    for i, c in enumerate(box["cases"]):
        assert same(run(ref, c["args"], box), c["expect"], box), f"{d.name}: the reference fails lesson case {i}"
        assert same(run(fixed, c["args"], box), c["expect"], box), f"{d.name}: fixed.py fails lesson case {i}: {c['args']}"
        if same(run(buggy, c["args"], box), c["expect"], box):
            passes.append(i)
    want, got = run(ref, bug["input"], box), run(buggy, bug["input"], box)
    assert not same(got, want, box), f"{d.name}: buggy.py is right on {bug['input']}, so it shows no bug"
    assert same(run(fixed, bug["input"], box), want, box), f"{d.name}: fixed.py is wrong on {bug['input']}"
    first = box["cases"][0]
    return {"lesson": bug["lesson"], "fn": name, "cases": len(box["cases"]), "buggy_passes": passes,
            "sample": {"args": first["args"], "expect": first["expect"], "buggy": run(buggy, first["args"], box)},
            "input": bug["input"], "returns": got, "expect": want}


def compute():
    return {d.name: facts_for(d) for d in sorted((HERE / "bugs").iterdir()) if d.is_dir()}


if __name__ == "__main__":
    facts = compute()
    FACTS.write_text(json.dumps(facts, indent=1) + "\n")
    for k, f in facts.items():
        print(f"{k}: {f['input']} -> {f['returns']}, should be {f['expect']}; buggy passes {len(f['buggy_passes'])} of {f['cases']} lesson cases")
