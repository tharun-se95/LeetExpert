"""Records the calls naive fib makes, as a tree, by running it with a tracer.

Each node is (id, n, parent_id). The reel draws fib(5)'s tree from these, so the
picture is the calls that actually happened, not a hand-drawn tree.
"""
import importlib.util


def _load(name):
    s = importlib.util.spec_from_file_location(name, f"code/{name}.py")
    m = importlib.util.module_from_spec(s)
    s.loader.exec_module(m)
    return m


def call_tree(n, name="naive"):
    m = _load(name)
    inner = m.fib
    nodes, stack = [], []

    def traced(k, *rest):
        nid = len(nodes)
        nodes.append((nid, k, stack[-1] if stack else None))
        stack.append(nid)
        try:
            return inner(k, *rest)
        finally:
            stack.pop()

    m.fib = traced  # the recursive calls look fib up in the module, so they go through the tracer
    try:
        value = traced(n)
    finally:
        m.fib = inner
    return value, nodes
