"""Rows for the matrix-systems primitive, traced by running the real algorithms.

Eight scenes, one per system in the "Grid Underneath" artifact. Every frame is
produced by executing the algorithm (LRU cache walk, mean filter, flood fill,
in-place rotation, spiral bounds, border-flag zeroing, flat binary search, DFS
backtracking) with assertions, never typed. `check-matrix-systems.mjs` then
re-derives the same frames from the artifact's independent JavaScript
implementation and requires them to match cell for cell.

A cell is [kind, text, shade]: `kind` picks a token colour, `shade` (0..1)
mixes the idle fill toward the accent for image-like grids.
"""
import json, math, os

HERE = os.path.dirname(os.path.abspath(__file__))
VIGNETTES = json.load(open(os.path.join(HERE, "matrix-systems-vignettes.json")))


def cells(n, f):
    return [f(i) for i in range(n)]


def cell(kind, text="", shade=None):
    return [kind, text, shade]


def jsround(x):
    """JS Math.round: halves round up. Python's round() is banker's rounding."""
    return math.floor(x + 0.5)


# 1 -- row-major vs column-major against a toy cache ---------------------------------
def framebuffer():
    R, C, LINE, CAP = 4, 8, 4, 2
    N = R * C

    def walk(order):
        cache, miss, out = [], 0, []
        for off in order:
            line = off // LINE
            hit = line in cache
            if hit:
                cache.remove(line)
            else:
                miss += 1
                if len(cache) >= CAP:
                    cache.pop(0)
            cache.append(line)
            out.append({"off": off, "hit": hit, "miss": miss})
        return out

    row_o = list(range(N))
    col_o = [r * C + c for c in range(C) for r in range(R)]
    A, B = walk(row_o), walk(col_o)
    # Row-major must touch each line once: N / LINE misses. Anything else means
    # the cache model, not the access pattern, is wrong.
    assert A[-1]["miss"] == N // LINE, A[-1]
    assert B[-1]["miss"] == N, B[-1]

    def side(W, k, strip):
        seen = {W[j]["off"]: W[j] for j in range(k + 1)}
        out = []
        for off in range(N):
            s = seen.get(off)
            t = "" if strip else str(off)
            if s is None:
                out.append(cell("idle", t))
                continue
            if W[k]["off"] == off:
                kind = "done" if s["hit"] else "cur"
            else:
                kind = "acc" if s["hit"] else "warn"
            out.append(cell(kind, t))
        return out

    frames = []
    for k in range(N):
        a, b = A[k], B[k]
        frames.append({
            "b": {"gA": side(A, k, False), "sA": side(A, k, True),
                  "gB": side(B, k, False), "sB": side(B, k, True)},
            "note": f"Step {k+1}. Row loop reads offset {a['off']}: "
                    + ("its cache line is already loaded, a hit." if a["hit"] else "a new cache line, a miss.")
                    + f" Column loop reads offset {b['off']}: "
                    + ("a hit." if b["hit"] else "a miss, the line it needs was evicted or never loaded."),
            "stats": [["row loop misses", a["miss"]], ["column loop misses", b["miss"]]],
            "ev": None if b["hit"] else "bad",
        })
    boards = [
        {"id": "gA", "rows": R, "cols": C, "g": 0, "label": "for r: for c:  (row-major)"},
        {"id": "sA", "rows": 1, "cols": N, "g": 0, "strip": True, "label": "memory, one gap per cache line"},
        {"id": "gB", "rows": R, "cols": C, "g": 1, "label": "for c: for r:  (column-major)"},
        {"id": "sB", "rows": 1, "cols": N, "g": 1, "strip": True, "label": "same memory, different order"},
    ]
    return frames, boards, {"rowMiss": A[-1]["miss"], "colMiss": B[-1]["miss"]}


# 2 -- 3x3 mean filter with bounds checks --------------------------------------------
def filt():
    R, C = 5, 6
    img = [[0, 0, 9, 9, 0, 0], [0, 0, 9, 9, 0, 0], [9, 9, 9, 9, 9, 9], [0, 0, 9, 9, 0, 0], [0, 0, 9, 9, 0, 0]]
    DIRS = [(-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)]
    inn = cells(R * C, lambda i: cell("idle", str(img[i // C][i % C]), img[i // C][i % C] / 9))
    out = cells(R * C, lambda i: cell("dim"))
    cp = lambda a: [list(x) for x in a]
    frames = [{"b": {"in": cp(inn), "out": cp(out)},
               "note": "A plus sign, brightness 0 to 9. Each output pixel will be the mean of its 3 × 3 window.",
               "stats": [["pixels done", 0]], "ev": None}]
    done = 0
    valid_counts = set()
    for r in range(R):
        for c in range(C):
            total, n, valid = img[r][c], 1, 0
            for dr, dc in DIRS:
                nr, nc = r + dr, c + dc
                if 0 <= nr < R and 0 <= nc < C:
                    total += img[nr][nc]
                    n += 1
                    valid += 1
            val = jsround(total / n)
            valid_counts.add(valid)
            i = r * C + c
            ib = cp(inn)
            ib[i] = cell("cur", str(img[r][c]))
            ob = cp(out)
            ob[i] = cell("cur", str(val))
            out[i] = cell("idle", str(val), val / 9)
            done += 1
            edge = f" The other {8 - valid} fall off the edge, so the bounds check skips them." if valid < 8 else ""
            frames.append({
                "b": {"in": ib, "out": ob},
                "ov": {"in": {"r0": r - 1, "c0": c - 1, "r1": r + 1, "c1": c + 1, "cls": "win"}},
                "note": f"Pixel ({r}, {c}): {valid} of 8 neighbours are inside the image.{edge} Mean of {n} values = {total} / {n} → {val}.",
                "stats": [["neighbours in bounds", f"{valid} / 8"], ["pixels done", done]],
                "ev": None if valid < 8 else "key",
            })
    assert valid_counts == {3, 5, 8}, valid_counts  # corner, edge, interior
    frames.append({"b": {"in": cp(inn), "out": cp(out)},
                   "note": "Every pixel visited once. The hard edges of the plus have softened, and the border pixels used fewer neighbours.",
                   "stats": [["pixels done", done]], "ev": None})
    boards = [{"id": "in", "rows": R, "cols": C, "g": 0, "label": "input image"},
              {"id": "out", "rows": R, "cols": C, "g": 1, "label": "blurred output"}]
    return frames, boards, {}


# 3 -- flood fill over hot cells ------------------------------------------------------
def alerts():
    G = [[int(ch) for ch in row] for row in
         ["1100001110", "1100100110", "0001100000", "0000001001", "1000011101", "1100001000", "0000000000"]]
    R, C = len(G), len(G[0])
    COL = ["acc", "done", "viol", "warn"]
    st = cells(R * C, lambda i: cell("land" if G[i // C][i % C] else "water"))
    land = sum(sum(row) for row in G)
    seen = [False] * (R * C)
    cp = lambda a: [list(x) for x in a]
    frames = [{"b": {"g": cp(st)},
               "note": "A thermal map of a server floor. Warm cells are racks over their temperature limit. The scan will walk the grid row by row.",
               "stats": [["hot racks", land], ["incidents", 0]], "ev": None}]
    count = painted = 0
    D = [(1, 0), (-1, 0), (0, 1), (0, -1)]
    for r in range(R):
        for c in range(C):
            if not G[r][c] or seen[r * C + c]:
                continue
            count += 1
            kind = COL[(count - 1) % len(COL)]
            q = [(r, c)]
            seen[r * C + c] = True
            prev, first = -1, True
            while q:
                pr, pc = q.pop(0)
                i = pr * C + pc
                if prev >= 0:
                    st[prev] = cell(kind)
                st[i] = cell("cur")
                prev = i
                painted += 1
                frames.append({
                    "b": {"g": cp(st)},
                    "note": (f"New hot cell at ({pr}, {pc}): incident #{count} starts. Flood outward to its neighbours."
                             if first else f"Flood: ({pr}, {pc}) is joined to incident #{count}."),
                    "stats": [["hot racks", land], ["incidents", count]],
                    "ev": "key" if first else None,
                })
                first = False
                for dr, dc in D:
                    nr, nc = pr + dr, pc + dc
                    if 0 <= nr < R and 0 <= nc < C and G[nr][nc] and not seen[nr * C + nc]:
                        seen[nr * C + nc] = True
                        q.append((nr, nc))
            st[prev] = cell(kind)
    assert painted == land, "flood fill must visit every hot cell exactly once"
    frames.append({"b": {"g": cp(st)},
                   "note": f"Scan finished: {land} hot racks collapse into {count} regions. Each cell was visited once, so the cost is proportional to the grid, O(m · n).",
                   "stats": [["hot racks", land], ["incidents", count]], "ev": "key"})
    boards = [{"id": "g", "rows": R, "cols": C, "g": 0, "label": "rack temperature map (7 × 10)"}]
    return frames, boards, {"land": land, "count": count}


# 4 -- in-place rotation: transpose then reverse rows --------------------------------
def rotate():
    n = 4
    m = [[r * n + c + 1 for c in range(n)] for r in range(n)]
    orig = [row[:] for row in m]

    def to_cells(cur=None):
        out = []
        for r in range(n):
            for c in range(n):
                v = m[r][c]
                hot = cur is not None and any(p[0] == r and p[1] == c for p in cur)
                out.append(cell("cur" if hot else "idle", str(v), (v - 1) / (n * n - 1)))
        return out

    frames = [{"b": {"g": to_cells()},
               "note": "A 4 × 4 image. Each tile keeps its number, and the shade runs from dark at 1 to light at 16, so you can follow where every tile lands.",
               "stats": [["swaps", 0], ["extra cells", "0"]], "ev": None}]
    swaps = 0

    def sw(a, b, c, d, txt):
        nonlocal swaps
        m[a][b], m[c][d] = m[c][d], m[a][b]
        swaps += 1
        frames.append({"b": {"g": to_cells([(a, b), (c, d)])}, "note": txt,
                       "stats": [["swaps", swaps], ["extra cells", "1 temp"]], "ev": "key"})

    for i in range(n):
        for j in range(i + 1, n):
            sw(i, j, j, i, f"Transpose: swap ({i}, {j}) with ({j}, {i}), a reflection across the main diagonal.")
    for r in range(n):
        for j in range(n // 2):
            sw(r, j, r, n - 1 - j,
               f"Reverse row {r}: swap column {j} with column {n-1-j}. Transposing and then flipping every row is a 90° clockwise turn.")
    for a in range(n):
        for b in range(n):
            assert m[a][b] == orig[n - 1 - b][a], "not a 90° clockwise rotation"
    frames.append({"b": {"g": to_cells()},
                   "note": f"Rotated 90° clockwise with {swaps} swaps and one temporary value. Tile 1 moved from the top-left corner to the top-right, tile 13 from bottom-left to top-left.",
                   "stats": [["swaps", swaps], ["extra cells", "1 temp"]], "ev": None})
    boards = [{"id": "g", "rows": n, "cols": n, "g": 0, "label": "one grid, no second buffer", "cap": 64}]
    return frames, boards, {"swaps": swaps}


# 5 -- spiral with shrinking bounds ----------------------------------------------------
def spiral():
    R, C = 5, 6
    top, bot, left, right = 0, R - 1, 0, C - 1
    order = []

    def add(r, c, d):
        order.append({"r": r, "c": c, "dir": d, "b": [top, bot, left, right]})

    while top <= bot and left <= right:
        for j in range(left, right + 1):
            add(top, j, "top row →")
        for i in range(top + 1, bot + 1):
            add(i, right, "right column ↓")
        if top < bot:
            for j in range(right - 1, left - 1, -1):
                add(bot, j, "bottom row ←")
        if left < right:
            for i in range(bot - 1, top, -1):
                add(i, left, "left column ↑")
        top += 1; bot -= 1; left += 1; right -= 1
    assert len({(o["r"], o["c"]) for o in order}) == R * C == len(order), "every cell exactly once"

    vis = [0] * (R * C)
    frames = [{"b": {"g": cells(R * C, lambda i: cell("idle"))},
               "ov": {"g": {"r0": 0, "c0": 0, "r1": R - 1, "c1": C - 1, "cls": "bounds"}},
               "note": "Four integers describe the untouched rectangle: top, bottom, left, right. Walk its edge, then shrink it.",
               "stats": [["visited", 0], ["bounds", "0 · 4 · 0 · 5"]], "ev": None}]
    for k, o in enumerate(order):
        vis[o["r"] * C + o["c"]] = k + 1
        cur = o["r"] * C + o["c"]
        cs = cells(R * C, lambda i: (cell("cur" if i == cur else "acc", str(vis[i])) if vis[i] else cell("idle")))
        b = o["b"]
        frames.append({
            "b": {"g": cs},
            "ov": {"g": {"r0": b[0], "c0": b[2], "r1": b[1], "c1": b[3], "cls": "bounds"}},
            "note": f"Cell {k+1} of {len(order)}: walking the {o['dir']} of the rectangle from row {b[0]} to {b[1]} and column {b[2]} to {b[3]}.",
            "stats": [["visited", k + 1], ["bounds", f"{b[0]} · {b[1]} · {b[2]} · {b[3]}"]], "ev": None,
        })
    boards = [{"id": "g", "rows": R, "cols": C, "g": 0, "label": "tool path, cell by cell"}]
    return frames, boards, {"cells": R * C}


# 6 -- set matrix zeroes with the border as scratch space -----------------------------
def mask():
    R, C = 5, 6
    m = [[4, 7, 0, 2, 9, 3], [5, 3, 8, 6, 0, 1], [2, 9, 4, 7, 5, 8], [6, 0, 3, 1, 4, 2], [8, 5, 7, 3, 6, 9]]
    truth = [row[:] for row in m]
    orig_zero = {i * C + j for i, row in enumerate(m) for j, v in enumerate(row) if v == 0}
    marker = set()
    zeros = lambda: sum(v == 0 for row in m for v in row)

    def cells_(cur, win, active):
        out = []
        for i in range(R * C):
            r, c = divmod(i, C)
            v = m[r][c]
            kind = "idle"
            if v == 0:
                kind = "warn" if (i in marker and active) else "bad"
            elif win and win(r, c):
                kind = "win"
            if cur and cur[0] == r and cur[1] == c:
                kind = "cur"
            out.append(cell(kind, str(v)))
        return out

    frames = []

    def push(cur, win, active, note, ev=None):
        frames.append({"b": {"g": cells_(cur, win, active)}, "note": note,
                       "stats": [["extra memory", "2 flags"], ["zeros", zeros()]], "ev": ev})

    push(None, None, True, "Three zeros: (0, 2), (1, 4), (3, 1). Each must wipe its whole row and column, but a zero written too early would look like a real one.")
    first_row = any(v == 0 for v in m[0])
    first_col = any(row[0] == 0 for row in m)
    push(None, lambda r, c: r == 0, True,
         f"Row 0 already holds a zero, so remember it in a flag: first_row_zero = {str(first_row).lower()}. Column 0 has none: first_col_zero = {str(first_col).lower()}.")
    for i in range(1, R):
        for j in range(1, C):
            hit = m[i][j] == 0
            if hit:
                m[i][0] = 0
                m[0][j] = 0
                if i * C not in orig_zero:
                    marker.add(i * C)
                if j not in orig_zero:
                    marker.add(j)
            push((i, j), None, True,
                 f"Zero at ({i}, {j}). Flag its row on the left border and its column on the top border. Gold cells are flags, not real zeros."
                 if hit else f"({i}, {j}) is {m[i][j]}. Nothing to flag.", "key" if hit else None)
    for i in range(1, R):
        changed = []
        for j in range(1, C):
            if m[i][0] == 0 or m[0][j] == 0:
                if m[i][j] != 0:
                    changed.append(j)
                m[i][j] = 0
        push(None, (lambda ii: lambda r, c: r == ii)(i), True,
             f"Row {i}: the border flags say "
             + (f"columns {', '.join(map(str, changed))} become zero" if changed else "nothing new changes")
             + ". Interior first, border last, or the flags would be destroyed before they are read.")
    if first_row:
        for j in range(C):
            m[0][j] = 0
    if first_col:
        for i in range(R):
            m[i][0] = 0
    # Reference: the O(m+n) two-array solution on the original grid. The O(1)
    # border-flag result must equal it, or the flags corrupted the data.
    zr = {i for i in range(R) if 0 in truth[i]}
    zc = {j for j in range(C) if any(truth[i][j] == 0 for i in range(R))}
    for i in range(R):
        for j in range(C):
            assert (m[i][j] == 0) == (i in zr or j in zc), (i, j)
    frames.append({"b": {"g": cells_(None, None, False)},
                   "note": f"Border pass: first_row_zero is {str(first_row).lower()}, so row 0 is zeroed last. The flags have done their job.",
                   "stats": [["extra memory", "2 flags"], ["zeros", zeros()]], "ev": "key"})
    boards = [{"id": "g", "rows": R, "cols": C, "g": 0, "label": "telemetry: 5 servers × 6 metrics"}]
    return frames, boards, {"R": R, "C": C}


# 7 -- binary search over a flattened sorted grid -------------------------------------
def pages():
    R, C = 5, 6
    N = R * C
    keys = [3 + i * 4 + (i % 3) for i in range(N)]
    assert all(keys[i] > keys[i - 1] for i in range(1, N)), "keys not sorted"
    target = keys[8]
    lo, hi, probes = 0, N - 1, 0

    def cells_(lo, hi, mid, found, strip):
        out = []
        for i in range(N):
            kind = "dim" if (i < lo or i > hi) else "win"
            if i == mid:
                kind = "done" if found else "cur"
            out.append(cell(kind, "" if strip else str(keys[i])))
        return out

    frames = [{"b": {"g": cells_(0, N - 1, -1, False, False), "st": cells_(0, N - 1, -1, False, True)},
               "note": f"Five pages of six sorted keys. Find {target}. Read left to right, top to bottom, it is one sorted array of {N} keys.",
               "stats": [["target", target], ["probes", 0]], "ev": None}]
    while lo <= hi:
        mid = (lo + hi) // 2
        v = keys[mid]
        probes += 1
        rr, cc = mid // C, mid % C
        ok = v == target
        # The 2D indexing the flat position translates to must land on the same key.
        assert keys[rr * C + cc] == v
        frames.append({
            "b": {"g": cells_(lo, hi, mid, ok, False), "st": cells_(lo, hi, mid, ok, True)},
            "note": f"mid = ({lo} + {hi}) // 2 = {mid} → page {rr}, slot {cc} (row {mid} // {C}, column {mid} % {C}). Key {v}"
                    + (f" equals {target}: found." if ok else (f" is below {target}, so drop the lower half." if v < target else f" is above {target}, so drop the upper half.")),
            "stats": [["target", target], ["probes", probes], ["keys left", hi - lo + 1]], "ev": "key" if ok else None,
        })
        if ok:
            break
        if v < target:
            lo = mid + 1
        else:
            hi = mid - 1
    assert probes <= math.ceil(math.log2(N + 1))
    boards = [{"id": "g", "rows": R, "cols": C, "g": 0, "label": "5 pages × 6 slots", "cap": 48},
              {"id": "st", "rows": 1, "cols": N, "g": 0, "strip": True, "label": "the same keys as one flat array"}]
    return frames, boards, {"probes": probes, "N": N}


# 8 -- word search DFS with backtracking ----------------------------------------------
def route():
    G = [list("ROUT"), list("XUSX"), list("XTEX")]
    R, C, W = len(G), len(G[0]), "ROUTE"
    DIRS = [(-1, 0), (0, 1), (1, 0), (0, -1)]
    path, frames, back = [], [], [0]

    def cells_(cur, badc, done):
        out = []
        for i in range(R * C):
            r, c = divmod(i, C)
            kind = "idle"
            if (r, c) in path:
                kind = "done" if done else "acc"
            if cur and cur == (r, c):
                kind = "bad" if badc else ("done" if done else "cur")
            out.append(cell(kind, G[r][c]))
        return out

    def emit(cur, badc, done, note, ev=None):
        frames.append({"b": {"g": cells_(cur, badc, done)}, "note": note,
                       "stats": [["path length", f"{len(path)} / {len(W)}"], ["backtracks", back[0]]], "ev": ev})

    emit(None, False, False, f"Find {W} by moving up, right, down, left, never reusing a cell. Only one R exists, so the search starts at (0, 0).")

    def dfs(r, c, k):
        if r < 0 or r >= R or c < 0 or c >= C or G[r][c] != W[k]:
            return False
        path.append((r, c))
        if k == len(W) - 1:
            emit((r, c), False, True, f"'{W[k]}' matches at ({r}, {c}). The whole word is spelled: found.", "key")
            return True
        emit((r, c), False, False, f"'{W[k]}' matches at ({r}, {c}). Mark it as used and look for '{W[k+1]}' next.")
        for dr, dc in DIRS:
            if dfs(r + dr, c + dc, k + 1):
                return True
        back[0] += 1
        emit((r, c), True, False, f"No unused neighbour of ({r}, {c}) spells '{W[k+1]}'. Dead end.", "bad")
        path.pop()
        emit(None, False, False, f"Backtrack: un-mark ({r}, {c}) so other routes can use it, then try the next direction from the cell before.")
        return False

    found = False
    for r in range(R):
        for c in range(C):
            if G[r][c] == W[0] and dfs(r, c, 0):
                found = True
                break
        if found:
            break
    assert found and back[0] >= 1, "the scene must show at least one dead end"
    boards = [{"id": "g", "rows": R, "cols": C, "g": 0, "label": "find ROUTE: up, right, down, left", "cap": 64}]
    return frames, boards, {"back": back[0]}


# copy ---------------------------------------------------------------------------------
def fmt(n):
    return f"{n:,}"


SCENES = [
    dict(out="matrix-framebuffer", icon="i-screen", vg="framebuffer", build=framebuffer, step=0.5,
         eyebrow="Matrix · Grid Representation & Coordinates", system="Framebuffers",
         title="Your screen is one long array",
         seen=["GPU textures", "OpenCV and NumPy strides", "Video frames", "Screenshots"],
         facts=lambda m: [(fmt(1920 * 1080 * 4), "bytes in one 1080p RGBA frame (1920 × 1080 × 4)"),
                          (fmt(50 * 1920 * 4 + 100 * 4), "byte offset of pixel (100, 50) at a 7,680-byte stride"),
                          (str(64 // 4), "pixels in one 64-byte cache line: a miss buys 16 row-mates")]),
    dict(out="matrix-photo-filters", icon="i-kernel", vg="filter", build=filt, step=0.55,
         eyebrow="Matrix · Direction Vectors & Bounds", system="Photo filters",
         title="Every blur reads eight neighbours",
         seen=["Photo filters", "Edge detection in driver assistance", "Convolutions in CNNs", "Game of Life"],
         facts=lambda m: [(fmt(4000 * 3000 * 8), "neighbour reads to blur one 12-megapixel photo (4000 × 3000 × 8)"),
                          ("8 · 5 · 3", "neighbours for an interior pixel, an edge pixel and a corner"),
                          ("8", "direction vectors in the whole technique")]),
    dict(out="matrix-alert-storms", icon="i-rack", vg="rack", build=alerts, step=0.55,
         eyebrow="Matrix · Number of Islands", system="Alert storms",
         title=None,
         seen=["Paint-bucket fill", "Satellite land and water masks", "Cell counting in microscopy", "Heatmap alert grouping"],
         facts=lambda m: [(str(m["land"]), "hot racks: one page each if every cell alerts alone"),
                          (str(m["count"]), "connected regions the flood fill finds"),
                          ("1", "visit per cell: cost grows with the grid, O(m · n)")]),
    dict(out="matrix-camera-rotation", icon="i-rotate", vg="rotate", build=rotate, step=0.8,
         eyebrow="Matrix · In-Place Transformations", system="Camera rotation",
         title="Turn a photo without a second buffer",
         seen=["Phone camera orientation", "Tile-based image rotation", "Matrix transpose in numeric libraries"],
         facts=lambda m: [(fmt(4000 * 3000 * 4), "bytes a copy costs for a 12 MP RGBA photo (4000 × 3000 × 4)"),
                          (str(m["swaps"]), "swaps to rotate the 4 × 4 grid: 6 transpose + 8 flips"),
                          ("1", "temporary value of extra memory")]),
    dict(out="matrix-cnc-toolpaths", icon="i-spiral", vg="spiral", build=spiral, step=0.4,
         eyebrow="Matrix · Traversal Orders", system="CNC toolpaths",
         title="Spiral in, with four numbers of state",
         seen=["CNC pocket clearing", "LED matrix animations", "Progressive reveal effects"],
         facts=lambda m: [(str(m["cells"]), "cells visited on a 5 × 6 grid, each exactly once"),
                          ("4", "integers of state, however large the grid is"),
                          ("1", "pass: cost is O(m · n) with O(1) extra space")]),
    dict(out="matrix-data-masking", icon="i-mask", vg="mask", build=mask, step=0.5,
         eyebrow="Matrix · Set Matrix Zeroes", system="Data masking",
         title="Use the border as your scratch paper",
         seen=["NaN masks in feature matrices", "Spreadsheet cleaning", "Row and column invalidation in sensor grids"],
         facts=lambda m: [("2", "flag variables replace two arrays of m + n booleans"),
                          (fmt(10000 + 10000), "flags avoided on a 10,000 × 10,000 grid"),
                          ("2", "passes over the grid: cost is still O(m · n)")]),
    dict(out="matrix-sorted-pages", icon="i-pages", vg="pages", build=pages, step=2.4,
         eyebrow="Matrix · Search a 2D Matrix", system="Sorted pages",
         title="A sorted grid is one sorted array",
         seen=["B-tree leaf pages", "SSTable block indexes", "Sorted lookup tables"],
         facts=lambda m: [("20", "probes to find one key among 1,000,000 (log₂ 1,000,000 ≈ 19.9)"),
                          (str(m["probes"]), "probes in this scene, for 30 keys"),
                          ("1", "line of arithmetic: row = mid ÷ C, column = mid mod C")]),
    dict(out="matrix-chip-routing", icon="i-chip", vg="route", build=route, step=1.1,
         eyebrow="Matrix · Word Search", system="Chip routing",
         title="Try a path, mark it, back out cleanly",
         seen=["Chip and PCB autorouters", "Boggle and crossword solvers", "Robot path search"],
         facts=lambda m: [(str(m["back"]), "backtracks before the route is found"),
                          ("5", "letters, so the search never goes deeper than 5 cells"),
                          ("1", "board reused as its own visited set, O(L) extra space")]),
]

assert math.ceil(math.log2(1_000_000)) == 20  # the "20 probes" fact

rows = []
for s in SCENES:
    frames, boards, meta = s["build"]()
    title = s["title"] or f"{meta['land']} alerts are really {meta['count']} incidents"
    rows.append({
        "_out": s["out"], "family": "ordering-search", "theme": "dark",
        "eyebrow": s["eyebrow"], "title": title, "system": s["system"], "icon": s["icon"],
        "vignette": VIGNETTES[s["vg"]],
        "seen": json.dumps(s["seen"], ensure_ascii=False),
        "facts": json.dumps([{"v": v, "l": l} for v, l in s["facts"](meta)], ensure_ascii=False),
        "boards": json.dumps(boards), "frames": json.dumps(frames, ensure_ascii=False),
        "stepSeconds": s["step"],
    })
    dur = len(frames) * s["step"]
    print(f"{s['out']:26s} {len(frames):3d} frames × {s['step']}s = {dur:5.1f}s of scene   {title}")

out = os.path.join(HERE, "rows-matrix-systems.json")
json.dump(rows, open(out, "w"), indent=2, ensure_ascii=False)
print(f"wrote {len(rows)} rows -> {out}")
