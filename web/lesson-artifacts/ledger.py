"""The rollout ledger: one row per lesson in the app, and the evidence that each is done.

Spec: docs/superpowers/specs/2026-09-24-lesson-artifacts-rollout-design.md (section 6).

    python3 web/lesson-artifacts/ledger.py sync              # add or retire rows to match the app's manifest
    python3 web/lesson-artifacts/ledger.py check             # the invariants; non-zero exit on any breach
    python3 web/lesson-artifacts/ledger.py render            # rewrite LEDGER.md from ledger.json
    python3 web/lesson-artifacts/ledger.py record ID GATE    # run one gate for one lesson and store its evidence
    python3 web/lesson-artifacts/ledger.py gated             # JSON list of the pages CI gates (see cmd_gated)
    python3 web/lesson-artifacts/ledger.py gate ID           # run every gate a page holds, recording nothing (CI)

Overviews (pages across several modules, e.g. overviews/linear-structures) are not lessons in the app's
manifest, so they sit in their own table, declared by build.py LESSONS under "overviews". They pass the
same build, code and theme gates and go stale the same way, but are not counted in the lessons' totals
and have no app gate until it is decided where an overview lives in the app (spec section 6).

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
    led = json.load(open(LEDGER)) if os.path.exists(LEDGER) else {"lessons": {}}
    led.setdefault("overviews", {})
    return led


def row_of(led, lesson_id):
    """A lesson's or an overview's row, or None."""
    return led["lessons"].get(lesson_id) or led["overviews"].get(lesson_id)


def build_overviews():
    """(id, family, title) for every overview build.py makes: the overviews table's source of truth."""
    return [(f"{m}/{slug}", fam, title) for m, slug, fam, title in build_lessons() if m == "overviews"]


def save(led):
    with open(LEDGER, "w") as f:
        json.dump(led, f, indent=1, ensure_ascii=False, sort_keys=False)
        f.write("\n")


def folder_of(lesson_id):
    """The artifact folder for a lesson: web/lesson-artifacts/<slug>/ (slugs are unique across modules)."""
    slug = lesson_id.split("/")[1]
    return os.path.join(HERE, slug if slug != "practice" else lesson_id.replace("/", "--"))


# Everything outside the lesson folder that shapes its page: a change to any of these re-stales every
# lesson's evidence, so a kit change can never leave a lesson "verified" on a page nobody re-checked.
# The brand, globals and family files are what shared.py reads the page's colours from (the light tokens,
# the dark theme and the Grid's cell hues); lessonMd.ts renders every lesson.md; highlight.ts colours the
# shown code through the app's own highlighter and palette, so those two app modules are here too (#23).
SHARED = ["kit", "fonts", "build.py", "shared.py", "highlight.ts", "code-gate.ts", "browser-gate.mjs",
          "lessonMd.ts", "render-lesson.ts",
          "../../hyperframes/assets/brand.css", "../src/app/globals.css", "../src/lib/visual/familyTheme.ts",
          "../src/lib/content/highlight.ts", "../src/lib/content/codePalette.ts"]


def _feed(h, path, rel_to):
    if os.path.isdir(path):
        for root, _, files in sorted(os.walk(path)):
            if "__pycache__" in root:
                continue
            for f in sorted(files):
                p = os.path.join(root, f)
                h.update(os.path.relpath(p, rel_to).encode())
                h.update(open(p, "rb").read())
    elif os.path.exists(path):
        h.update(os.path.relpath(path, rel_to).encode())
        h.update(open(path, "rb").read())


def source_hash(lesson_id):
    """A hash of the lesson's artifact files and the shared kit, so evidence is tied to the exact
    source it was recorded on."""
    d = folder_of(lesson_id)
    if not os.path.isdir(d):
        return None
    h = hashlib.sha256()
    for s in SHARED:
        _feed(h, os.path.join(HERE, s), HERE)
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
    ovs, old = {}, led["overviews"]
    for oid, fam, title in build_overviews():
        ovs[oid] = old.get(oid, {"evidence": {}, "notes": ""})
        ovs[oid].update({"type": "overview", "title": title, "family": fam})
    gone = [k for k in old if k not in ovs]
    led["overviews"] = ovs
    save(led)
    print(f"{len(rows)} lessons, {len(ovs)} overview(s); retired {len(retired) + len(gone)}"
          + (f": {', '.join(retired + gone)}" if retired or gone else ""))


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
    declared = {o[0] for o in build_overviews()}
    if set(led["overviews"]) != declared:
        out.append(f"overviews table differs from build.py (run sync): has {sorted(led['overviews'])}, build.py makes {sorted(declared)}")
    for oid, row in led["overviews"].items():
        for g in row.get("evidence", {}):
            if g not in ALL_GATES or g == "app":
                out.append(f"{oid}: gate '{g}' is not one an overview can hold")
        if not os.path.isdir(folder_of(oid)):
            out.append(f"{oid}: has no artifact folder")
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
    ov = {s: 0 for s in STAGES}
    for oid, row in led["overviews"].items():
        ov[status(row, oid)] += 1
    print("ledger ok: " + ", ".join(f"{counts[s]} {s}" for s in STAGES) + f" of {len(led['lessons'])}"
          + f"; overviews: " + ", ".join(f"{ov[s]} {s}" for s in STAGES if ov[s]))


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
    if led["overviews"]:
        lines += ["## Overviews", "", "Pages across several modules, built by `build.py` but not lessons in the app, so not in the",
                  "totals above. They stop at verified: no app gate until it is decided where an overview lives.", "",
                  "| | Overview | Gates with evidence | Notes |", "|---|---|---|---|"]
        for oid, row in led["overviews"].items():
            cur, ev = source_hash(oid), row.get("evidence", {})
            gates = " ".join(g + ("" if ev[g].get("source") == cur else " (stale)") for g in ALL_GATES if g in ev) or "-"
            lines.append(f"| {mark[status(row, oid)]} | {row['title']} (`{oid}`) | {gates} | {row.get('notes', '')} |")
        lines.append("")
    open(VIEW, "w").write("\n".join(lines))
    print(f"wrote {os.path.relpath(VIEW, WEB)}")


def specimens():
    """Kit fixtures build.py makes under "specimens": gated like a lesson's page, never ledger rows."""
    return [f"{m}/{slug}" for m, slug, *_ in build_lessons() if m == "specimens"]


def gates_for(page_id):
    """The gates CI runs on a page: its build, its code check where it has one, and both themes."""
    if page_id in specimens():
        return ["build", "light", "dark"]
    return ["build", "code", "light", "dark"]


def cmd_gated():
    """The pages CI re-runs the gates on: every row that holds evidence for every verified gate, fresh or
    stale, and every specimen. Stale is included on purpose: a kit change stales every page, and the point
    is to learn in CI whether the change broke one, not to skip it because the ledger stopped vouching."""
    led = load()
    rows = list(led["lessons"].items()) + list(led["overviews"].items())
    ids = [i for i, row in rows if all(g in row.get("evidence", {}) for g in GATES["verified"])]
    print(json.dumps(ids + specimens()))


def cmd_gate(page_id):
    if page_id not in specimens() and row_of(load(), page_id) is None:
        raise SystemExit(f"{page_id} is not a lesson, an overview or a specimen in build.py")
    for g in gates_for(page_id):
        print(f"{page_id}: {g}: {run_gate(page_id, g)}", flush=True)


def run_gate(lesson_id, gate):
    """Run one gate. Returns a one-line result; raises SystemExit if the gate fails."""
    slug = lesson_id.split("/")[1]
    if gate == "build":
        r = subprocess.run([sys.executable, os.path.join(HERE, "build.py"), slug], capture_output=True, text=True)
        if r.returncode:
            raise SystemExit(f"build failed:\n{r.stdout}{r.stderr}")
        return r.stdout.strip().splitlines()[-1]
    if gate == "code":
        # problem lessons: the shown code against the lesson's own sandbox cases (code-gate.ts);
        # concept lessons have no cases, so their own check.py model check (spec section 4.1)
        if row_of(load(), lesson_id)["type"] == "problem":
            cmd = [os.path.join(WEB, "node_modules", ".bin", "tsx"), os.path.join(HERE, "code-gate.ts"), lesson_id]
        else:
            check = os.path.join(folder_of(lesson_id), "check.py")
            if not os.path.exists(check):
                raise SystemExit(f"no code check for {lesson_id}: add {os.path.relpath(check, WEB)} (spec section 4.1)")
            cmd = [sys.executable, check]
        r = subprocess.run(cmd, capture_output=True, text=True, cwd=WEB)
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
    row = row_of(led, lesson_id)
    if row is None:
        raise SystemExit(f"{lesson_id} is not a lesson in the app or an overview in build.py (run sync?)")
    if gate == "app" and row["type"] == "overview":
        raise SystemExit("an overview has no app gate until it is decided where overviews live (spec section 6)")
    result = run_gate(lesson_id, gate)
    commit = subprocess.run(["git", "rev-parse", "--short", "HEAD"], capture_output=True, text=True, cwd=WEB).stdout.strip()
    row.setdefault("evidence", {})[gate] = {
        "source": source_hash(lesson_id), "on": datetime.date.today().isoformat(), "commit": commit, "result": result}
    save(led)
    print(f"{lesson_id}: {gate} passed ({result}); status now {status(row, lesson_id)}")


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
    elif a[:1] == ["gated"]:
        cmd_gated()
    elif a[:1] == ["gate"] and len(a) == 2:
        cmd_gate(a[1])
    else:
        raise SystemExit(__doc__)
