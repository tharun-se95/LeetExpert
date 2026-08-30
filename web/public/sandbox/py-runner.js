/**
 * Python sandbox runner, under Pyodide.
 *
 * This is an ES MODULE worker — instantiated with `{ type: "module" }`.
 * Current Pyodide refuses to boot in a classic worker ("Classic web workers
 * are not supported"), so `importScripts` is not an option and the runtime
 * is pulled in with a static import instead.
 *
 * Mirrors js-runner.js in contract: it reports raw per-case outcomes and
 * never decides pass/fail. Values cross the boundary as JSON text produced
 * by Python's own json.dumps, so a Python list and a JavaScript array end up
 * canonicalised identically on the main thread.
 *
 * Pyodide is self-hosted under /pyodide/ (copied from node_modules at build
 * time) rather than pulled from a CDN, so the page keeps working offline and
 * under a strict connect-src.
 */

import { loadPyodide } from "/pyodide/pyodide.mjs";

let pyodideReady = null;

function bootPyodide() {
  if (!pyodideReady) {
    pyodideReady = loadPyodide({ indexURL: "/pyodide/" });
  }
  return pyodideReady;
}

/**
 * Driver executed inside Python. Keeping the per-case loop in Python avoids
 * a JS<->WASM round trip per case and makes `print` capture straightforward.
 */
const DRIVER = String.raw`
import json, io, contextlib, copy

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Node:
    def __init__(self, val=0, neighbors=None):
        self.val = val
        self.neighbors = neighbors if neighbors is not None else []

def __build_graph(adjacency):
    # Conventional 1-indexed adjacency list: [[2,4],[1,3],...] is node 1
    # joined to 2 and 4. Returns node 1, or None for an empty graph.
    if not adjacency:
        return None
    nodes = [Node(i + 1) for i in range(len(adjacency))]
    for i, neighbors in enumerate(adjacency):
        nodes[i].neighbors = [nodes[label - 1] for label in (neighbors or [])]
    return nodes[0]

def __graph_nodes(node):
    out, stack = {}, [node] if node is not None else []
    while stack:
        cur = stack.pop()
        if id(cur) in out:
            continue
        out[id(cur)] = cur
        for n in cur.neighbors or []:
            stack.append(n)
    return out

def __ser_graph(node):
    if node is None:
        return []
    by_label = {}
    for cur in __graph_nodes(node).values():
        by_label[cur.val] = cur
    return [[n.val for n in (by_label[label].neighbors or [])]
            for label in sorted(by_label)]

def __shares_nodes(result, original):
    # Clone Graph is only satisfied by NEW objects: a returned original
    # serialises exactly like a correct clone, so equality cannot separate
    # them. Raw observation only - the main thread decides.
    originals = __graph_nodes(original)
    for key in __graph_nodes(result):
        if key in originals:
            return True
    return False

def __build_list(values):
    # Cycle problems need a tail that points back into the list, which a plain
    # array of values cannot express. {values, pos} is the form learners
    # already meet: pos is the index the tail links to, -1 for an open list.
    pos = -1
    if isinstance(values, dict):
        pos = values.get("pos", -1)
        values = values.get("values")
    if not values:
        return None
    head = ListNode(values[0])
    nodes = [head]
    tail = head
    for v in values[1:]:
        tail.next = ListNode(v)
        tail = tail.next
        nodes.append(tail)
    # A pos past the end is an authoring mistake; failing loudly beats silently
    # handing the learner an open list and marking their correct answer wrong.
    if pos is not None and pos >= 0:
        if pos >= len(nodes):
            raise ValueError("cycle pos " + str(pos) + " is past the end of the list")
        tail.next = nodes[pos]
    return head

def __ser_list(node):
    out, seen = [], set()
    cur = node
    # a learner bug can create a cycle; without this guard the serialiser
    # hangs and the failure looks like it is in their loop, not ours
    while cur is not None and id(cur) not in seen:
        seen.add(id(cur))
        out.append(cur.val)
        cur = cur.next
    if cur is not None:
        out.append("...cycle")
    return out

def __build_tree(values):
    if not values or values[0] is None:
        return None
    root = TreeNode(values[0])
    queue, i = [root], 1
    while queue and i < len(values):
        node = queue.pop(0)
        if i < len(values):
            v = values[i]; i += 1
            if v is not None:
                node.left = TreeNode(v); queue.append(node.left)
        if i < len(values):
            v = values[i]; i += 1
            if v is not None:
                node.right = TreeNode(v); queue.append(node.right)
    return root

def __ser_tree(root):
    if root is None:
        return []
    out, queue = [], [root]
    while queue:
        node = queue.pop(0)
        if node is None:
            out.append(None)
        else:
            out.append(node.val)
            queue.append(node.left); queue.append(node.right)
    while out and out[-1] is None:
        out.pop()
    return out

def __decode(value, shape):
    if shape == "list": return __build_list(value)
    # Merge K Sorted Lists takes k of them; one array per list, built in place.
    if shape == "list[]": return [__build_list(v) for v in (value or [])]
    if shape == "tree": return __build_tree(value)
    if shape == "graph": return __build_graph(value)
    return value

def __encode(value, shape):
    if shape == "list": return __ser_list(value)
    if shape == "tree": return __ser_tree(value)
    if shape == "graph": return __ser_graph(value)
    return value

def __find_node(root, val):
    if root is None:
        return None
    if root.val == val:
        return root
    return __find_node(root.left, val) or __find_node(root.right, val)

def __resolve_nodes(built, raw, shape):
    # A "node" arg is written as a plain value; the learner receives the node
    # carrying it, out of the SAME tree they are handed — resolving against a
    # second copy would break the identity comparisons (node is p) these
    # problems rely on.
    root = None
    for key in shape:
        if shape[key] == "tree":
            root = built[int(key)]
            break
    for key in shape:
        if shape[key] != "node":
            continue
        idx = int(key)
        found = __find_node(root, raw[idx])
        if found is None:
            raise ValueError("no node with value " + repr(raw[idx]) + " in the tree")
        built[idx] = found

def __safe(v):
    try:
        json.dumps(v); return v
    except TypeError:
        return repr(v)

# Must match LOG_CAP in run-cases.js — the two runtimes have to truncate at
# the same point, or the same program would report different output depending
# on which language tab the learner happened to pick.
__LOG_CAP = 500

class __CappedOut(io.TextIOBase):
    """
    Collects print() output line-by-line and stops accumulating past the cap,
    counting the rest. A plain StringIO would hold every line: a print inside
    the main loop at the stated input sizes (n up to 1e4) builds a multi-
    megabyte buffer here long before the UI gets a say. Only the trailing
    partial line is retained, so memory stays bounded by the cap.
    """
    def __init__(self, cap):
        self._cap = cap
        self._buf = ""
        self.lines = []
        self.dropped = 0

    def write(self, s):
        if not s:
            return 0
        self._buf += s
        if "\n" in self._buf:
            parts = self._buf.split("\n")
            self._buf = parts.pop()
            for line in parts:
                self._take(line)
        return len(s)

    def _take(self, line):
        # Blank lines were dropped by the previous split-and-filter too;
        # keeping that behaviour so a bare print() still reads as no output.
        if line == "":
            return
        if len(self.lines) < self._cap:
            self.lines.append(line)
        else:
            self.dropped += 1

    def flush(self):
        pass

    def finish(self):
        if self._buf:
            self._take(self._buf)
            self._buf = ""

def __run_cases(user_source, export_name, cases_json, arg_index, check, shape_json, returns, roundtrip_json="[]"):
    cases = json.loads(cases_json)
    shape = json.loads(shape_json)
    is_seq = check == "sequence"
    round_pair = json.loads(roundtrip_json)

    ns = {"ListNode": ListNode, "TreeNode": TreeNode, "Node": Node}
    exec(user_source, ns)
    target = ns.get(export_name)
    if target is None or not callable(target):
        kind = "class" if is_seq else "function"
        verb = "construct" if is_seq else "call"
        return json.dumps({
            "fatal": "No " + kind + " named " + export_name + " was defined. Keep the given name - the tests " + verb + " it directly."
        })

    outcomes = []
    for i, case in enumerate(cases):
        buf = __CappedOut(__LOG_CAP)
        ret, arg_after, op_results, error = None, None, None, None
        aliased = None
        try:
            with contextlib.redirect_stdout(buf):
                if is_seq:
                    inst = target(*copy.deepcopy(case.get("construct", [])))
                    op_results = []
                    for op in case.get("ops", []):
                        method, op_args = op[0], op[1] if len(op) > 1 else []
                        fn = getattr(inst, method, None)
                        if fn is None:
                            raise AttributeError("No method " + method + " on " + export_name)
                        op_results.append(__safe(fn(*copy.deepcopy(op_args))))
                elif check == "roundtrip":
                    # Serialize/Deserialize: the intermediate string is the
                    # learner's own design, so asserting on it would mandate one
                    # encoding. The only honest claim is that the pair inverts.
                    raw = copy.deepcopy(case["args"])
                    value = __decode(raw[0], shape.get("0", "value"))
                    inst = target()
                    encode_name, decode_name = round_pair[0], round_pair[1]
                    encode = getattr(inst, encode_name, None)
                    decode = getattr(inst, decode_name, None)
                    if encode is None:
                        raise AttributeError("No method " + encode_name + " on " + export_name)
                    if decode is None:
                        raise AttributeError("No method " + decode_name + " on " + export_name)
                    ret = __safe(__encode(decode(encode(value)), returns))
                else:
                    raw = copy.deepcopy(case["args"])
                    built = [__decode(v, shape.get(str(idx), "value")) for idx, v in enumerate(raw)]
                    __resolve_nodes(built, raw, shape)
                    result = target(*built)
                    ret = __safe(__encode(result, returns))
                    if returns == "graph":
                        aliased = __shares_nodes(result, built[0])
                    if arg_index < len(built):
                        arg_after = __safe(__encode(built[arg_index], shape.get(str(arg_index), "value")))
        except Exception as exc:
            error = type(exc).__name__ + ": " + str(exc)
        buf.finish()
        outcomes.append({
            "index": i, "ret": ret, "argAfter": arg_after,
            "logs": buf.lines, "logsDropped": buf.dropped,
            "error": error, "opResults": op_results,
            "aliased": aliased,
        })
    return json.dumps({"outcomes": outcomes})
`;

/** Pyodide prepends a long JS-side traceback; the trailing Python lines are the useful part. */
function cleanTraceback(message) {
  const marker = message.lastIndexOf('File "<exec>"');
  if (marker !== -1) return message.slice(marker).trim();
  const lines = message.trim().split("\n").filter(Boolean);
  return lines.slice(-3).join("\n") || message;
}

self.onmessage = async (event) => {
  const { source, fnName, cases, arg, check, shape, returns, cls, roundtrip } =
    event.data;
  const exportName = check === "sequence" || check === "roundtrip" ? cls : fnName;

  let pyodide;
  try {
    pyodide = await bootPyodide();
  } catch (err) {
    self.postMessage({
      kind: "fatal",
      message: `Could not start the Python runtime: ${err && err.message ? err.message : String(err)}`,
    });
    return;
  }

  try {
    pyodide.runPython(DRIVER);
    const run = pyodide.globals.get("__run_cases");
    const raw = run(
      source,
      exportName,
      JSON.stringify(cases),
      arg,
      check,
      JSON.stringify(shape || {}),
      returns || "value",
      JSON.stringify(roundtrip || []),
    );
    run.destroy();
    const parsed = JSON.parse(raw);
    if (parsed.fatal) {
      self.postMessage({ kind: "fatal", message: parsed.fatal });
      return;
    }
    self.postMessage({ kind: "outcomes", outcomes: parsed.outcomes });
  } catch (err) {
    // A SyntaxError in the user's source surfaces here, as does anything
    // thrown while setting up the driver.
    const message = err && err.message ? err.message : String(err);
    self.postMessage({ kind: "fatal", message: cleanTraceback(message) });
  }
};

// Boot eagerly so the download overlaps with the reader typing.
bootPyodide().then(
  () => self.postMessage({ kind: "ready" }),
  () => {
    /* the run path reports this */
  },
);
