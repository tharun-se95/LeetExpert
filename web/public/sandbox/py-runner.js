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
    if shape == "tree": return __build_tree(value)
    return value

def __encode(value, shape):
    if shape == "list": return __ser_list(value)
    if shape == "tree": return __ser_tree(value)
    return value

def __safe(v):
    try:
        json.dumps(v); return v
    except TypeError:
        return repr(v)

def __run_cases(user_source, export_name, cases_json, arg_index, check, shape_json, returns):
    cases = json.loads(cases_json)
    shape = json.loads(shape_json)
    is_seq = check == "sequence"

    ns = {"ListNode": ListNode, "TreeNode": TreeNode}
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
        buf = io.StringIO()
        ret, arg_after, op_results, error = None, None, None, None
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
                else:
                    raw = copy.deepcopy(case["args"])
                    built = [__decode(v, shape.get(str(idx), "value")) for idx, v in enumerate(raw)]
                    result = target(*built)
                    ret = __safe(__encode(result, returns))
                    if arg_index < len(built):
                        arg_after = __safe(__encode(built[arg_index], shape.get(str(arg_index), "value")))
        except Exception as exc:
            error = type(exc).__name__ + ": " + str(exc)
        logs = [ln for ln in buf.getvalue().split("\n") if ln != ""]
        outcomes.append({
            "index": i, "ret": ret, "argAfter": arg_after,
            "logs": logs, "error": error, "opResults": op_results,
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
  const { source, fnName, cases, arg, check, shape, returns, cls } = event.data;
  const exportName = check === "sequence" ? cls : fnName;

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
