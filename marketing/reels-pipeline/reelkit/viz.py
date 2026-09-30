"""Data-structure stages that act out the code while R.code() walks it (owner, 2026-09-30).

The code card explains a line; the stage under it shows what that line does to the data,
at the same moment. Each stage is driven by a list of states, [(time, state)], and the
states must come from running the reel's code (a trace the verifier holds to the shown
code), never typed by hand. Every element gets one seek-safe track.

  ArrayViz  cells in a row, named pointers under them, dimmed / marked cells, values that change
  MapViz    key -> value rows (a tally, a memo, counts)
  StackViz  a column that grows and shrinks (call frames, a monotonic stack)

Each takes the Reel, an id prefix, its states, a time window and a top edge; the stage must
end above the caption zone (reel.CAP_TOP), which each checks.
"""
import copy, html, importlib.util, sys

from reel import CAP_TOP

TEAL, AMB, INK, RULE, MUT = "#5eead4", "#fbbf24", "#f1f4f9", "#263248", "#94a3b8"
COLOURS = {"teal": TEAL, "amb": AMB, None: RULE}


def load(path, name):
    """The function `name` from the code file the card shows (several files may share a name)."""
    spec = importlib.util.spec_from_file_location(f"shown_{abs(hash(path))}", path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return getattr(mod, name)


def trace(fn, *args):
    """Runs the shown function and records [(line, locals after that line ran)] in the order the
    lines finish (under recursion a line that calls deeper finishes after its callees), lines counted
    from the `def` as 1 (the numbering on the code card). Stage states are built from this, so
    the stage can only show what the shown code did."""
    code, first = fn.__code__, fn.__code__.co_firstlineno
    events, pending, result = [], {}, None  # pending: frame id -> its line still running

    def local(frame, event, arg):
        if frame.f_code is code:
            fid = id(frame)
            if fid in pending:  # this frame's previous line has finished (a recursive call in between is its own frame)
                events.append((pending.pop(fid), copy.deepcopy(dict(frame.f_locals))))
            if event == "line":
                pending[fid] = frame.f_lineno - first + 1
        return local

    def glob(frame, event, arg):
        return local if frame.f_code is code else None

    sys.settrace(glob)
    try:
        result = fn(*args)
    finally:
        sys.settrace(None)
    return events, result


def calls(fn, *args, limit=None):
    """Runs the shown recursive function and records, in order,
    [("call", depth, {arg: value}) | ("return", depth, value)], plus the exception it raised or None.
    With `limit`, only the first `limit` calls are recorded and no returns (a runaway recursion,
    whose frames unwind through the error rather than returning)."""
    code = fn.__code__
    names = code.co_varnames[:code.co_argcount]
    events, depth = [], [0]

    def local(frame, event, arg):
        if event == "return":
            if limit is None:
                events.append(("return", depth[0], arg))
            depth[0] -= 1
        return local

    def tracer(frame, event, arg):
        if frame.f_code is not code:
            return None
        depth[0] += 1
        if limit is None or sum(e[0] == "call" for e in events) < limit:
            events.append(("call", depth[0], copy.deepcopy({k: frame.f_locals[k] for k in names})))
        return local

    err = None
    sys.settrace(tracer)
    try:
        fn(*args)
    except Exception as e:  # the runaway case: its real error is what the stage names
        err = e
    finally:
        sys.settrace(None)
    return events, err


def _fits(name, bottom):
    assert bottom <= CAP_TOP - 5, f"{name}: stage ends at y {bottom}, inside the caption zone (y {CAP_TOP})"


def _texts(R, sel_of, seq, t0, t1):
    """One element per distinct text; `seq` is [(time, text)]. Swaps which one shows."""
    distinct = list(dict.fromkeys(x for _, x in seq))
    for d_i, d in enumerate(distinct):
        sel = sel_of(d_i)
        on = seq[0][1] == d
        R.init(sel, autoAlpha=1 if on else 0)
        for t, x in seq[1:]:
            if x == d and not on:
                R.k(sel, t, {"autoAlpha": 1}, 0.15, "none"); on = True
            elif x != d and on:
                R.k(sel, t, {"autoAlpha": 0}, 0.1, "none"); on = False
    return distinct


def _window(R, sel, t0, t1):
    R.init(sel, autoAlpha=0, y=14)
    R.k(sel, t0, {"autoAlpha": 1, "y": 0}, 0.3, "power3.out")
    R.k(sel, t1 - 0.2, {"autoAlpha": 0, "y": -10}, 0.2, "power1.in")


def _changes(states, key_fn):
    """[(time, value)] keeping only the states where key_fn's value changes."""
    out = []
    for t, s in states:
        v = key_fn(s)
        if not out or out[-1][1] != v:
            out.append((t, v))
    return out


class ArrayViz:
    """A row of cells. State keys, all optional:
    vals  list of the cell values now (default: the initial values); a shorter list empties and
          greys the cells past its end (a list that shrank)
    ptr   {pointer name: index or None}; `pointers` is [(name, colour, "above" | "below")], each
          side stacking its pointers in order (two that can share a cell go on opposite sides)
    dim   indexes greyed out
    mark  {index: "teal" | "amb"}: the cell's border and text take that colour
    note  one line under the pointers (a comparison, a verdict)
    """

    def __init__(self, R, vid, values, states, t0, t1, top, pointers=(), label=None, cell=None, gap=14, left=60, right=60):
        n = len(values)
        width = 1080 - left - right
        cell = cell or min(118, (width - gap * (n - 1)) // n)
        x0 = left + (width - (n * cell + (n - 1) * gap)) // 2
        cx = lambda i: x0 + i * (cell + gap)
        font = max(28, int(cell * 0.44))
        lab_h = 46 if label else 0
        above = [p for p in pointers if p[2] == "above"]
        below = [p for p in pointers if p[2] == "below"]
        row_top = top + lab_h + 42 * len(above)
        ptr_y = {p[0]: (row_top - 42 * (above.index(p) + 1) if p in above else row_top + cell + 6 + 42 * below.index(p)) for p in pointers}
        note_top = row_top + cell + 6 + 42 * len(below) + 4
        has_note = any("note" in s for _, s in states)
        bottom = note_top + (44 if has_note else 0)
        _fits(vid, bottom)
        full = [(t, {"vals": list(values), "ptr": {}, "dim": set(), "mark": {}, "note": "", **s}) for t, s in states]
        parts = [f'<div class="vz" id="{vid}" data-layout-allow-overlap>']
        if label:
            parts.append(f'<div class="vzl" style="left:{left}px;top:{top}px">{label}</div>')
        for i in range(n):
            seq = _changes(full, lambda s: str(s["vals"][i]) if i < len(s["vals"]) else "")
            texts = _texts(R, lambda d, i=i: f"#{vid}-c{i}-v{d}", seq, t0, t1)
            spans = "".join(f'<span class="vzv" id="{vid}-c{i}-v{d}">{html.escape(x)}</span>' for d, x in enumerate(texts))
            parts.append(f'<div class="vzc" id="{vid}-c{i}" style="left:{cx(i)}px;top:{row_top}px;width:{cell}px;height:{cell}px;font-size:{font}px">{spans}</div>')
            look = _changes(full, lambda s: (i in s["dim"] or i >= len(s["vals"]), s["mark"].get(i)))
            R.init(f"#{vid}-c{i}", opacity=0.22 if look[0][1][0] else 1, borderColor=COLOURS[look[0][1][1]],
                   color=COLOURS[look[0][1][1]] if look[0][1][1] else INK)
            for t, (dim, mk) in look[1:]:
                R.k(f"#{vid}-c{i}", t, {"opacity": 0.22 if dim else 1, "borderColor": COLOURS[mk], "color": COLOURS[mk] if mk else INK}, 0.3)
        for p_i, (name, colour, side) in enumerate(pointers):
            seq = _changes(full, lambda s: s["ptr"].get(name))
            px = lambda i: cx(i) + cell // 2 - 60
            first = seq[0][1]
            R.init(f"#{vid}-p{p_i}", autoAlpha=0 if first is None else 1, x=px(first if first is not None else 0))
            for t, i in seq[1:]:
                R.k(f"#{vid}-p{p_i}", t, {"autoAlpha": 0} if i is None else {"autoAlpha": 1, "x": px(i)}, 0.35, "power3.inOut")
            arrow = "▼" if side == "above" else "▲"
            parts.append(f'<div class="vzp" id="{vid}-p{p_i}" style="top:{ptr_y[name]}px;color:{COLOURS[colour]}">{arrow} {html.escape(name)}</div>')
        if has_note:
            seq = _changes(full, lambda s: s["note"])
            texts = _texts(R, lambda d: f"#{vid}-n{d}", seq, t0, t1)
            parts += [f'<div class="vzn" id="{vid}-n{d}" style="left:{left}px;top:{note_top}px">{x}</div>' for d, x in enumerate(texts)]
        parts.append("</div>")
        R.add("".join(parts))
        _window(R, f"#{vid}", t0, t1)
        self.bottom = bottom


class MapViz:
    """key -> value rows in `cols` columns. State keys: vals {key: value or None (row hidden)},
    mark {key: "teal" | "amb"}, note."""

    def __init__(self, R, vid, keys, states, t0, t1, top, cols=2, label=None, left=60, right=60, row_h=64):
        width = 1080 - left - right
        cw = (width - 24 * (cols - 1)) // cols
        lab_h = 46 if label else 0
        rows = -(-len(keys) // cols)
        has_note = any("note" in s for _, s in states)
        note_top = top + lab_h + rows * (row_h + 10) + 4
        bottom = note_top + (48 if has_note else 0)
        _fits(vid, bottom)
        full = [(t, {"vals": {}, "mark": {}, "note": "", **s}) for t, s in states]
        parts = [f'<div class="vz" id="{vid}" data-layout-allow-overlap>']
        if label:
            parts.append(f'<div class="vzl" style="left:{left}px;top:{top}px">{label}</div>')
        for j, key in enumerate(keys):
            x, y = left + (j % cols) * (cw + 24), top + lab_h + (j // cols) * (row_h + 10)
            seq = _changes(full, lambda s: s["vals"].get(key))
            shown = [(t, "" if v is None else str(v)) for t, v in seq]
            texts = _texts(R, lambda d, j=j: f"#{vid}-r{j}-v{d}", shown, t0, t1)
            spans = "".join(f'<span class="vzmv" id="{vid}-r{j}-v{d}">{html.escape(v)}</span>' for d, v in enumerate(texts))
            parts.append(f'<div class="vzm" id="{vid}-r{j}" style="left:{x}px;top:{y}px;width:{cw}px;height:{row_h}px">'
                         f'<span class="vzmk">{html.escape(str(key))}</span><span class="vzmx">{spans}</span></div>')
            look = _changes(full, lambda s: (s["vals"].get(key) is None, s["mark"].get(key)))
            hid, mk = look[0][1]
            R.init(f"#{vid}-r{j}", opacity=0.25 if hid else 1, borderColor=COLOURS[mk], color=COLOURS[mk] if mk else INK)
            for t, (hid, mk) in look[1:]:
                R.k(f"#{vid}-r{j}", t, {"opacity": 0.25 if hid else 1, "borderColor": COLOURS[mk], "color": COLOURS[mk] if mk else INK}, 0.3)
        if has_note:
            seq = _changes(full, lambda s: s["note"])
            texts = _texts(R, lambda d: f"#{vid}-n{d}", seq, t0, t1)
            parts += [f'<div class="vzn" id="{vid}-n{d}" style="left:{left}px;top:{note_top}px">{x}</div>' for d, x in enumerate(texts)]
        parts.append("</div>")
        R.add("".join(parts))
        _window(R, f"#{vid}", t0, t1)
        self.bottom = bottom


class StackViz:
    """A column, bottom to top. State keys: items [labels, bottom first], note.
    Pushes rise into place, pops lift away."""

    def __init__(self, R, vid, states, t0, t1, top, depth, left=620, width=400, slot_h=58, label=None):
        lab_h = 46 if label else 0
        base = top + lab_h + depth * (slot_h + 8)
        has_note = any("note" in s for _, s in states)
        bottom = base + 8 + (48 if has_note else 0)
        _fits(vid, bottom)
        full = [(t, {"items": [], "note": "", **s}) for t, s in states]
        assert max(len(s["items"]) for _, s in full) <= depth, f"{vid}: stack deeper than depth={depth}"
        parts = [f'<div class="vz" id="{vid}" data-layout-allow-overlap>']
        if label:
            parts.append(f'<div class="vzl" style="left:{left}px;top:{top}px">{label}</div>')
        parts.append(f'<div class="vzfloor" style="left:{left}px;top:{base + 2}px;width:{width}px"></div>')
        for pos in range(depth):
            y = base - (pos + 1) * (slot_h + 8)
            seq = _changes(full, lambda s: s["items"][pos] if pos < len(s["items"]) else None)
            filled = [(t, v if v is not None else "") for t, v in seq]
            texts = _texts(R, lambda d, pos=pos: f"#{vid}-s{pos}-v{d}", filled, t0, t1)
            spans = "".join(f'<span class="vzv" id="{vid}-s{pos}-v{d}">{v}</span>' for d, v in enumerate(texts))
            parts.append(f'<div class="vzs" id="{vid}-s{pos}" style="left:{left}px;top:{y}px;width:{width}px;height:{slot_h}px">{spans}</div>')
            R.init(f"#{vid}-s{pos}", autoAlpha=1 if seq[0][1] is not None else 0, y=0)
            for t, v in seq[1:]:
                R.k(f"#{vid}-s{pos}", t, {"autoAlpha": 1, "y": 0} if v is not None else {"autoAlpha": 0, "y": -30}, 0.3, "power3.out")
        if has_note:
            seq = _changes(full, lambda s: s["note"])
            texts = _texts(R, lambda d: f"#{vid}-n{d}", seq, t0, t1)
            parts += [f'<div class="vzn" id="{vid}-n{d}" style="left:{left}px;top:{base + 14}px">{x}</div>' for d, x in enumerate(texts)]
        parts.append("</div>")
        R.add("".join(parts))
        _window(R, f"#{vid}", t0, t1)
        self.bottom = bottom

