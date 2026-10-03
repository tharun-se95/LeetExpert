"""Measures every Big-O quiz snippet and writes facts.json, the only source of the answer and the
numbers a post states.

For each quiz in quizzes/<id>/ (snippet.py is the code on the image, verbatim):

1. Provenance. A drill's snippet must be a Python block of its lesson, with only the function
   renamed and the comments removed (they give the answer away), and the lesson's own quiz for
   that drill must name the same class. A snippet that is not a block of its lesson (`contains`)
   must carry the lesson's lines, and the lesson must state the class in the quoted words.
2. Growth. Runs the snippet at three sizes under a tracer that counts every line it executes,
   plus every element comparison a built-in makes for it (`x in a_list` runs in C, so no line
   shows its cost; the elements are ints whose __eq__ counts). An option O(f) holds if steps/f(n)
   has stopped growing between the middle and the largest size. The answer is the slowest-growing
   option that holds; it must be the class the lesson states, and unless the quiz says
   `bound_only` (naive Fibonacci is Θ(φⁿ), which the course rounds up to O(2ⁿ)) it must be tight.
3. Counts. The number a post quotes ("499,500 checks for n = 1,000") is measured, and must
   equal the quiz's closed formula at that n and at all three sizes.

  python3 verify.py
"""
import json
import math
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
FACTS = HERE / "facts.json"
QUIZZES = sorted(p.name for p in (HERE / "quizzes").iterdir() if p.is_dir())

# log f(n), slowest-growing first: the order decides which holding option is the answer.
LOGF = {
    "O(1)": lambda n: 0.0,
    "O(log n)": lambda n: math.log(math.log2(n)),
    "O(n)": lambda n: math.log(n),
    "O(n log n)": lambda n: math.log(n) + math.log(math.log2(n)),
    "O(n²)": lambda n: 2 * math.log(n),
    "O(n³)": lambda n: 3 * math.log(n),
    "O(2ⁿ)": lambda n: n * math.log(2),
}
ORDER = list(LOGF)
# steps/f may move this much between the middle and the largest size and still count as level:
# lower-order terms shift it by a percent or two, the next class up or down by 20% or more.
LEVEL = math.log(1.05)
FILE = "<quiz snippet>"


class V(int):
    """An int that counts the comparisons a built-in makes on it."""
    eqs = 0

    def __eq__(self, other):
        V.eqs += 1
        return int(self) == int(other)

    __hash__ = int.__hash__


def F(k):
    """The k-th Fibonacci number, for a formula."""
    a, b = 0, 1
    for _ in range(k):
        a, b = b, a + b
    return a


def run(src, args, n):
    """Line -> times executed, and the comparisons built-ins made, calling the snippet at size n."""
    scope = {}
    exec(compile(src, FILE, "exec"), scope)
    fn = scope[re.search(r"def (\w+)", src).group(1)]
    values = eval(args, {"V": V, "n": n})
    values = values if isinstance(values, tuple) else (values,)
    lines = {}

    def local(frame, event, arg):
        if event == "line":
            lines[frame.f_lineno] = lines.get(frame.f_lineno, 0) + 1
        return local

    def tracer(frame, event, arg):
        return local if frame.f_code.co_filename == FILE else None

    V.eqs = 0
    sys.settrace(tracer)
    try:
        fn(*values)
    finally:
        sys.settrace(None)
    return lines, V.eqs


def blocks(md):
    return re.findall(r"```python\n(.*?)```", md, re.S)


def bare(code):
    """A lesson's block without its comments, as the image shows it."""
    return "\n".join(re.sub(r"\s*#.*$", "", l) for l in code.rstrip().splitlines()) + "\n"


def provenance(quiz, q, src):
    md = (ROOT / q["lesson"]).read_text()
    if "contains" in q:
        assert any(all(l in b.splitlines() for l in q["contains"]) for b in blocks(md)), \
            f"{quiz}: no Python block of {q['lesson']} has the lines {q['contains']}"
        assert all(l.strip() in src for l in q["contains"]), f"{quiz}: snippet.py lacks the lesson's lines"
    else:
        want = [bare(b) for b in blocks(md)]
        for old, new in q["rename"].items():
            want = [b.replace(old, new) for b in want]
        assert src in want, f"{quiz}: snippet.py is not a Python block of {q['lesson']} (renamed, comments removed)"
    if "drill" in q:
        section = md.split(f"## {q['drill']}\n", 1)[1].split("\n## ", 1)[0]
        lesson_quiz = json.loads(section.split("```quiz\n", 1)[1].split("\n```", 1)[0])
        right = lesson_quiz["options"][lesson_quiz["answer"]]
        named = re.search(r"O\([^)]*\)", right).group()
        assert named == q["answer"], f"{quiz}: the lesson's quiz answers {named}, quiz.json says {q['answer']}"
    else:
        assert q["states"] in md and q["answer"] in q["states"], \
            f"{quiz}: {q['lesson']} does not state {q['answer']} in the words quiz.json quotes"


def measure(quiz):
    q = json.loads((HERE / "quizzes" / quiz / "quiz.json").read_text())
    src = (HERE / "quizzes" / quiz / "snippet.py").read_text()
    provenance(quiz, q, src)
    assert len(q["options"]) == 4 and len(set(q["options"])) == 4 and q["answer"] in q["options"], f"{quiz}: needs four different options, one the answer"
    assert q["options"] == sorted(q["options"], key=ORDER.index), f"{quiz}: options are listed slowest-growing first"

    c = q["count"]

    def at(n):
        """(every step, the steps the post counts) at size n; the count must match its formula."""
        lines, eqs = run(src, q["args"], n)
        got, want = (eqs if c.get("eq") else sum(lines.get(l, 0) for l in c["lines"])), eval(c["formula"], {"n": n, "F": F})
        assert got == want, f"{quiz}: counted {got} at n = {n}, the formula {c['formula']} gives {want}"
        return sum(lines.values()) + eqs, got

    steps = [at(n)[0] for n in q["sizes"]]
    _, mid, last = q["sizes"]
    drift = {o: (math.log(steps[2]) - LOGF[o](last)) - (math.log(steps[1]) - LOGF[o](mid)) for o in q["options"]}
    holds = [o for o in q["options"] if drift[o] <= LEVEL]
    assert holds, f"{quiz}: no option bounds the measured growth {steps}"
    answer = holds[0]
    assert answer == q["answer"], f"{quiz}: measured {answer} (steps {steps} at {q['sizes']}), quiz.json says {q['answer']}"
    tight = drift[answer] >= -LEVEL
    assert tight != bool(q.get("bound_only")), f"{quiz}: {answer} is {'tight' if tight else 'only an upper bound'}, quiz.json says otherwise"

    n = c["n"]
    count = at(n)[1]
    return {"lesson": q["lesson"], "fn": re.search(r"def (\w+)", src).group(1), "options": q["options"],
            "answer": answer, "letter": "ABCD"[q["options"].index(answer)], "tight": tight,
            "sizes": [str(s) for s in q["sizes"]], "steps": steps, "count": {"n": n, "value": count, "formula": c["formula"]},
            **({"question": q["question"]} if "question" in q else {})}


def compute():
    return {quiz: measure(quiz) for quiz in QUIZZES}


if __name__ == "__main__":
    facts = compute()
    FACTS.write_text(json.dumps(facts, indent=1, ensure_ascii=False) + "\n")
    for quiz, f in facts.items():
        print(f"{quiz}: {f['letter']} {f['answer']}{'' if f['tight'] else ' (upper bound)'}; {f['count']['value']:,} at n = {f['count']['n']:,}")
