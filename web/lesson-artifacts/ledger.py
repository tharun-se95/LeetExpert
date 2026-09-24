"""The rollout ledger: one row per lesson in the app, and the evidence that each is done.

Spec: docs/superpowers/specs/2026-09-24-lesson-artifacts-rollout-design.md (section 6).

    python3 web/lesson-artifacts/ledger.py sync              # add or retire rows to match the app's manifest
    python3 web/lesson-artifacts/ledger.py check             # the invariants; non-zero exit on any breach
    python3 web/lesson-artifacts/ledger.py render            # rewrite LEDGER.md from ledger.json
    python3 web/lesson-artifacts/ledger.py record ID GATE    # run one gate for one lesson and store its evidence

ledger.json is the record; LEDGER.md is a view of it and is never edited by hand. Status is
derived, never set: a row's status is the furthest stage whose gates all hold evidence recorded by
`record` against the current source of that lesson. Evidence goes stale when the lesson's files
change (their hash is stored with it), so a lesson cannot stay "verified" after an edit.
"""
import datetime, hashlib, json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
WEB = os.path.normpath(os.path.join(HERE, ".."))
LEDGER = os.path.join(HERE, "ledger.json")
VIEW = os.path.join(HERE, "LEDGER.md")

# Stages in order. A stage is reached when every gate listed for it (and before it) holds fresh evidence.
STAGES = ["todo", "built", "verified", "shipped"]
GATES = {
    "built": ["build"],                                   # the page builds (its load checks run in the browser gate)
    "verified": ["code", "light", "dark"],                # shown code executed; both themes pass the browser gate
    "shipped": ["app"],                                   # served from the app's Lesson tab
}
ALL_GATES = [g for s in STAGES[1:] for g in GATES[s]]


def manifest():
    out = subprocess.run([os.path.join(WEB, "node_modules", ".bin", "tsx"), os.path.join(HERE, "manifest-dump.ts")],
                         cwd=WEB, capture_output=True, text=True)
    if out.returncode:
        raise SystemExit("manifest dump failed:\n" + out.stderr)
    return json.loads(out.stdout)


def load():
    return json.load(open(LEDGER)) if os.path.exists(LEDGER) else {"lessons": {}}


def save(led):
    with open(LEDGER, "w") as f:
        json.dump(led, f, indent=1, ensure_ascii=False, sort_keys=False)
        f.write("\n")


def folder_of(lesson_id):
    """The artifact folder for a lesson: web/lesson-artifacts/<slug>/ (slugs are unique across modules)."""
    slug = lesson_id.split("/")[1]
    return os.path.join(HERE, slug if slug != "practice" else lesson_id.replace("/", "--"))


def source_hash(lesson_id):
    """A hash of the lesson's artifact files, so evidence is tied to the exact source it was recorded on."""
    d = folder_of(lesson_id)
    if not os.path.isdir(d):
        return None
    h = hashlib.sha256()
    for root, _, files in sorted(os.walk(d)):
        if "__pycache__" in root:
            continue
        for f in sorted(files):
            p = os.path.join(root, f)
            h.update(os.path.relpath(p, d).encode())
            h.update(open(p, "rb").read())
    return h.hexdigest()[:16]


def status(row, lesson_id):
    """The furthest stage whose gates all hold evidence recorded on the current source."""
    cur, reached = source_hash(lesson_id), "todo"
    for stage in STAGES[1:]:
        ev = row.get("evidence", {})
        if all(g in ev and ev[g].get("source") == cur for g in GATES[stage]):
            reached = stage
        else:
            break
    return reached


def cmd_sync():
    led, rows = load(), manifest()
    lessons, seen = led["lessons"], set()
    for r in rows:
        seen.add(r["id"])
        row = lessons.setdefault(r["id"], {"evidence": {}, "notes": ""})
        for k in ("module", "moduleNumber", "type", "title", "family"):
            row[k] = r[k]
    retired = [k for k in lessons if k not in seen]
    for k in retired:
        del lessons[k]
    # manifest order, so the ledger reads like the course
    led["lessons"] = {r["id"]: lessons[r["id"]] for r in rows}
    save(led)
    print(f"{len(rows)} lessons; retired {len(retired)}" + (f": {', '.join(retired)}" if retired else ""))


def problems(led, rows):
    out = []
    ids = [r["id"] for r in rows]
    if len(ids) != len(set(ids)):
        out.append("the manifest lists a lesson twice")
    missing = [i for i in ids if i not in led["lessons"]]
    extra = [i for i in led["lessons"] if i not in ids]
    if missing:
        out.append(f"{len(missing)} lesson(s) missing from the ledger (run sync): {', '.join(missing[:5])}")
    if extra:
        out.append(f"{len(extra)} row(s) for lessons the app does not have: {', '.join(extra[:5])}")
    built = {l[1] for l in build_lessons()}
    for lid, row in led["lessons"].items():
        for g in row.get("evidence", {}):
            if g not in ALL_GATES:
                out.append(f"{lid}: unknown gate '{g}'")
        slug = lid.split("/")[1]
        has_folder = os.path.isdir(folder_of(lid))
        if has_folder and slug not in built:
            out.append(f"{lid}: has a folder but is not in build.py LESSONS")
        if slug in built and not has_folder:
            out.append(f"{lid}: in build.py LESSONS but has no folder")
    return out


def build_lessons():
    sys.path.insert(0, HERE)
    import build  # noqa: E402  (build.py only runs its builds under __main__)
    return build.LESSONS


def cmd_check():
    led, rows = load(), manifest()
    bad = problems(led, rows)
    for b in bad:
        print("ledger: " + b)
    if bad:
        raise SystemExit(1)
    counts = {s: 0 for s in STAGES}
    for lid, row in led["lessons"].items():
        counts[status(row, lid)] += 1
    print("ledger ok: " + ", ".join(f"{counts[s]} {s}" for s in STAGES) + f" of {len(led['lessons'])}")


def cmd_render():
    led = load()
    rows = led["lessons"]
    counts = {s: 0 for s in STAGES}
    mods = {}
    for lid, row in rows.items():
        st = status(row, lid)
        counts[st] += 1
        mods.setdefault((row["moduleNumber"], row["module"]), []).append((lid, row, st))
    mark = {"todo": "·", "built": "◐", "verified": "●", "shipped": "✔"}
    lines = ["# Lesson artifacts ledger", "",
             "Generated by `python3 web/lesson-artifacts/ledger.py render` from `ledger.json`. Do not edit by hand:",
             "a lesson's status comes from the evidence its gates recorded, and goes stale when its files change.",
             "Spec: `docs/superpowers/specs/2026-09-24-lesson-artifacts-rollout-design.md`.", "",
             f"**{counts['shipped']} shipped · {counts['verified']} verified · {counts['built']} built · "
             f"{counts['todo']} to do** of {len(rows)} lessons.", "",
             "Key: · to do, ◐ built, ● verified (code, light, dark), ✔ shipped in the app.", ""]
    for (num, mod), items in sorted(mods.items()):
        done = sum(1 for _, _, st in items if st != "todo")
        lines += [f"## {num}. {mod} ({done}/{len(items)})", "", "| | Lesson | Type | Gates with evidence | Notes |", "|---|---|---|---|---|"]
        for lid, row, st in items:
            cur = source_hash(lid)
            ev = row.get("evidence", {})
            gates = " ".join(g + ("" if ev[g].get("source") == cur else " (stale)") for g in ALL_GATES if g in ev) or "-"
            lines.append(f"| {mark[st]} | {row['title']} (`{lid}`) | {row['type']} | {gates} | {row.get('notes', '')} |")
        lines.append("")
    open(VIEW, "w").write("\n".join(lines))
    print(f"wrote {os.path.relpath(VIEW, WEB)}")


def run_gate(lesson_id, gate):
    """Run one gate. Returns a one-line result; raises SystemExit if the gate fails."""
    slug = lesson_id.split("/")[1]
    if gate == "build":
        r = subprocess.run([sys.executable, os.path.join(HERE, "build.py"), slug], capture_output=True, text=True)
        if r.returncode:
            raise SystemExit(f"build failed:\n{r.stdout}{r.stderr}")
        return r.stdout.strip().splitlines()[-1]
    if gate == "code":
        check = os.path.join(folder_of(lesson_id), "check.py")
        if not os.path.exists(check):
            raise SystemExit(f"no code check for {lesson_id}: add {os.path.relpath(check, WEB)} (spec section 4.1)")
        r = subprocess.run([sys.executable, check], capture_output=True, text=True)
        if r.returncode:
            raise SystemExit(f"code check failed:\n{r.stdout}{r.stderr}")
        return r.stdout.strip().splitlines()[-1]
    if gate in ("light", "dark"):
        gate_script = os.path.join(HERE, "browser-gate.mjs")
        if not os.path.exists(gate_script):
            raise SystemExit("the browser gate is not built yet (spec phase 1, section 4.2); no theme evidence can be recorded")
        r = subprocess.run(["node", gate_script, lesson_id, gate], cwd=WEB, capture_output=True, text=True)
        if r.returncode:
            raise SystemExit(f"{gate} browser gate failed:\n{r.stdout}{r.stderr}")
        return r.stdout.strip().splitlines()[-1]
    if gate == "app":
        raise SystemExit("the app gate needs the Lesson tab re-enabled (spec phase 4)")
    raise SystemExit(f"unknown gate {gate}; gates: {', '.join(ALL_GATES)}")


def cmd_record(lesson_id, gate):
    led = load()
    if lesson_id not in led["lessons"]:
        raise SystemExit(f"{lesson_id} is not a lesson in the app (run sync?)")
    result = run_gate(lesson_id, gate)
    commit = subprocess.run(["git", "rev-parse", "--short", "HEAD"], capture_output=True, text=True, cwd=WEB).stdout.strip()
    led["lessons"][lesson_id].setdefault("evidence", {})[gate] = {
        "source": source_hash(lesson_id), "on": datetime.date.today().isoformat(), "commit": commit, "result": result}
    save(led)
    print(f"{lesson_id}: {gate} passed ({result}); status now {status(led['lessons'][lesson_id], lesson_id)}")


if __name__ == "__main__":
    a = sys.argv[1:]
    if a[:1] == ["sync"]:
        cmd_sync()
    elif a[:1] == ["check"]:
        cmd_check()
    elif a[:1] == ["render"]:
        cmd_render()
    elif a[:1] == ["record"] and len(a) == 3:
        cmd_record(a[1], a[2])
    else:
        raise SystemExit(__doc__)
